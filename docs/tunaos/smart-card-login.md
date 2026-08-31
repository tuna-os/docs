---
sidebar_position: 8
---

# Smart-card and PIV login

This page describes the pieces needed to use a PIV, CAC, or other
PKCS#11-compatible smart card to authenticate to a TunaOS workstation.
It is written for the EL10-based variants (Albacore, Yellowfin, Skipjack,
and Redfin).

:::warning
A smart card is not a password-equivalent by itself. Protect the card and
its PIN, and test a recovery login before changing the login stack. Keep an
administrator account or a console/SSH recovery path available.
:::

## What ships in TunaOS

The current TunaOS image build does **not** preconfigure smart-card login.
The build scripts select the normal local/SSSD authentication profile and
the image package lists do not add `pam_pkcs11`, OpenSC, or `pcsc-lite` for
this feature. The `sssd` command in the EL10 service setup is the standard
login integration; it is not certificate enrollment or smart-card support.

Confirm the baseline on a running system rather than assuming that a
variant has the same package set:

```bash
rpm -q sssd pam_pkcs11 opensc pcsc-lite pcsc-lite-ccid
systemctl status pcscd.socket
```

`pcsc-lite` may appear indirectly in a base or desktop dependency, but that
does not enable PIV authentication. A working setup needs a PC/SC daemon,
a card driver, a PKCS#11 provider, certificate trust and mapping, and a PAM
stack entry.

## Install the required components

For a temporary test on an installed EL10 system, layer the packages and
reboot into the new deployment:

```bash
sudo rpm-ostree install sssd pam_pkcs11 opensc pcsc-lite pcsc-lite-ccid
systemctl reboot
```

Package names can vary by enabled repositories. If a package is unavailable,
check the corresponding EL10 repository before substituting another provider.
`opensc-tool --list-readers` and `pkcs11-tool --list-slots` are useful checks
that the reader, card and provider are visible.

For a durable TunaOS image, put the packages and configuration in the image
source (or a maintained derived image) instead of relying on a live
`rpm-ostree` layer. Files under `/etc` and state under `/var` survive a bootc
image update, but an update can replace files owned by the image. Keep local
policy in an explicit custom layer and rebase it when the base image changes.
Do not place private keys in the image.

Enable the reader service after installing it:

```bash
sudo systemctl enable --now pcscd.socket
opensc-tool --list-readers
```

## Trust and certificate mapping

Use the issuing organization’s published CA chain. Do not use a copied CA
from an untrusted website, and do not disable certificate verification to
make a card work.

1. Export the CA certificates (root and any intermediates) in PEM format.
2. Put them in the `pam_pkcs11` CA directory, normally
   `/etc/pam_pkcs11/cacerts`.
3. Create the hash links expected by the module.
4. Configure a mapping from the certificate identity to the local account.

For example, after reviewing the certificate and choosing a local username:

```bash
sudo install -d -m 0755 /etc/pam_pkcs11/cacerts
sudo install -m 0644 issuer-root.pem /etc/pam_pkcs11/cacerts/
sudo install -m 0644 issuer-intermediate.pem /etc/pam_pkcs11/cacerts/
sudo openssl rehash /etc/pam_pkcs11/cacerts
```

The exact mapping method depends on the organization’s identity policy.
`pam_pkcs11` supports mapper modules (including subject, issuer/subject,
username and LDAP-backed mappings); configure one deliberately in
`/etc/pam_pkcs11/pam_pkcs11.conf`. A subject-name mapping is only safe when
the issuing CA guarantees that the subject is unique. Prefer an authoritative
mapping to the organization’s directory when one exists.

Inspect the certificate before trusting it:

```bash
pkcs11-tool --list-objects --type cert
# Export a public certificate, then inspect it without its private key:
openssl x509 -in certificate.pem -noout -subject -issuer -dates -fingerprint
```

## Configure PAM and the display manager

Do not edit `/etc/pam.d/gdm-password` or another generated PAM file directly
on an authselect-managed system. Create an authselect custom profile based on
the current profile, add `pam_pkcs11.so` to the authentication stack, and
select that profile. The smart-card line must be ordered before a password
fallback if cards are intended to be preferred; retain the fallback while
rolling out the change.

A representative authentication line is:

```text
auth        sufficient    pam_pkcs11.so config_file=/etc/pam_pkcs11/pam_pkcs11.conf
```

Use the module and mapper settings documented by the installed EL10
`pam_pkcs11` package. The PAM account/session portions still need to resolve
the user and create the desktop session; certificate authentication does not
replace `pam_systemd`, account policy, or the existing session stack.

Before testing the graphical greeter, test the resulting profile from a
second local console or SSH session. Review `journalctl -b` and the display
manager journal for failures. A PIN prompt proves only that the token was
opened; it does not prove that the certificate is trusted or mapped to the
intended user.

## Enrollment and first login

Enrollment is organization-specific: obtain the card from the issuer,
install the issuer CA chain, and ensure that the card certificate contains
the identity used by the mapper. There is no TunaOS enrollment service.

Test in this order:

1. Confirm the reader and card with `opensc-tool`.
2. Confirm the PKCS#11 provider sees the certificate with `pkcs11-tool`.
3. Validate the certificate chain and expiry.
4. Validate the certificate-to-user mapping with the module’s mapper tool,
   where provided.
5. Test a text-console or SSH PAM service.
6. Test the display manager, then lock and unlock the session.

## Card removal: lock versus logout

Installing `pam_pkcs11` does not, by itself, define what happens when a card
is removed after login. PAM authenticates an operation; it is not a universal
card-removal monitor. Unless a separate desktop or security policy is
installed and tested, removing the card should be documented as **not
reliably locking or logging out** the existing session.

If policy requires removal to lock or terminate a session, deploy and audit a
separate PC/SC-aware watcher that targets the correct user session. Prefer
locking first; automatic logout can lose unsaved work. Test insertion,
removal, suspend/resume, multiple readers and an unplugged reader. Do not
claim either behavior from a successful login test alone.

## Bootc updates and configuration ownership

A bootc update replaces the immutable `/usr` deployment and preserves `/var`
and normally `/etc`, but it does not magically merge arbitrary changes to
PAM or authselect policy. For reliable upgrades:

- package the required RPMs in the derived image;
- keep `/etc/pam_pkcs11/`, CA material and authselect profile in the image
  source or a separately managed configuration layer;
- keep mutable enrollment/state data in `/var` when the package requires it;
- re-run the authselect/profile validation after every base-image update;
- never bake a card PIN or private key into the image or its build logs; and
- retain a tested fallback login until the new deployment is verified.

A deployment that boots but cannot authenticate is still a failed update.
Test the new deployment with a non-privileged account before making it the
only active deployment.
