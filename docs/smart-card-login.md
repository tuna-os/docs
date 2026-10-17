---
title: "Smart-card login with PIV or CAC"
description: "Configure PIV or CAC smart-card login on a TunaOS Enterprise Linux workstation."
---

TunaOS images do not enable smart-card login by default. The TunaOS image build
files do not add `sssd`, `pam_pkcs11`, `opensc`, or `pcsc-lite` as a smart-card
feature. A base image can still contain a package as a transitive dependency.
Check the exact image before you configure it.

For Enterprise Linux 10 GNOME images, the supported desktop pattern is **SSSD
certificate authentication with `authselect`**. OpenSC supplies the PKCS #11
driver, and `pcsc-lite` talks to the reader. This PAM integration does not need
the older `pam_pkcs11.so` module for GDM login.

This guide covers a local user on an EL10 GNOME image. Domain users should use
the certificate mapping and trust procedure for their IdM or Active Directory
domain. Other TunaOS bases and login managers need their own PAM integration.

## Check the image baseline

The build definitions are the source of the TunaOS package contract. The
installed image is the source of truth for one host:

```bash
for package in sssd pam_pkcs11 opensc pcsc-lite pcsc-lite-ccid; do
  printf '%-16s ' "$package"
  rpm -q "$package" 2>/dev/null || echo absent
done
```

The expected result for an uncustomized image is that these packages are not a
TunaOS feature. A base image may supply one of them. That does not configure
smart-card login or start the reader service.

| Component | Role | TunaOS default contract |
| --- | --- | --- |
| `pcsc-lite` | PC/SC middleware and `pcscd` reader service | Not declared by TunaOS |
| `pcsc-lite-ccid` | CCID reader driver | Not declared by TunaOS |
| `opensc` | OpenSC tools and PKCS #11 module for supported cards | Not declared by TunaOS |
| `sssd` | Certificate authentication and user mapping | Not declared by TunaOS |
| `pam_pkcs11` | Legacy direct PAM PKCS #11 module | Not declared by TunaOS |

A PIV or CAC card is not a password replacement until the reader, PKCS #11
module, trust, account mapping, and PAM policy work together.

## Before you start

You need:

- An EL10 GNOME image from TunaOS, or a derived image based on it.
- A USB smart-card reader that supports CCID, or the vendor driver for another
  reader type.
- The PIV authentication key often uses slot `9a`. CAC cards can use other slots.
- The CA certificate that issued the card certificate and any intermediate
  certificates in PEM or DER format.
- A local TunaOS account or a configured IdM/AD account to which the
  certificate maps.
- A second recovery path, such as a console or an administrative SSH session.
  Do not enable card-only login until card login works in the hybrid mode.

Use your organization's enrollment process for production cards. If the card
and enrollment system support it, generate the private key on the card. Do not
copy a private key from a card to the workstation. A local CA and test
certificate are suitable for a lab only, not for an enterprise login policy.

## Add the smart-card packages

Packages installed with `bootc usr-overlay` disappear at reboot. Build a
derived image for a persistent install. See the [customization guide](layering.md).

For an EL10 RPM-based image, add the reader, OpenSC, SSSD, and authentication
packages to the derived image:

```dockerfile
FROM ghcr.io/tuna-os/albacore:gnome

RUN dnf install -y \
    authselect \
    opensc \
    pcsc-lite \
    pcsc-lite-ccid \
    p11-kit \
    sssd \
    && dnf clean all
```

Use the matching `yellowfin` or `skipjack` GNOME image when that is the base
of the host. A non-CCID reader may need a vendor package and PKCS #11 module.
Do not add an untrusted repository to get that module.

Build and switch to the derived image. Keep its package installation for later
updates. A switch back to an official TunaOS image removes packages that the
official image lacks.

## Start the reader service and inspect the card

Insert the card, then start the socket-activated PC/SC service:

```bash
sudo systemctl enable --now pcscd.socket
systemctl is-active pcscd.socket
```

Check each layer from the reader to PKCS #11:

```bash
# OpenSC sees the reader.
opensc-tool --list-readers

# p11-kit sees the registered PKCS #11 modules.
p11-kit list-modules

# OpenSC sees a token slot and its objects.
pkcs11-tool --list-slots
pkcs11-tool --list-objects
```

If you also add the optional `pcsc-tools` package to the derived image,
`pcsc_scan` gives a lower-level PC/SC view of reader and card events. A reader
that does not appear in `opensc-tool` is not an SSSD or PAM problem yet. Check
USB pass-through, the CCID driver, `pcscd`, and the reader's support status
first.

OpenSC supports many PIV and CAC cards, but no driver supports every card or
reader. If the card vendor supplies a PKCS #11 module, register it with
`p11-kit` and use the vendor's documented module path. Do not replace the
system OpenSC module until the vendor module works in `pkcs11-tool`.

## Enroll the certificate and establish trust

The certificate on the card must be valid for the identity service. The
organization may need `clientAuth`, an EKU for Microsoft smart-card logon,
a UPN in `subjectAltName`, or a subject name that matches an SSSD rule. Ask
the CA or identity administrator which fields must be present. Do not select a
certificate by its display name alone.

Inspect a certificate exported from the card or supplied by the enrollment
system:

```bash
openssl x509 -in user-authentication.pem -noout \
  -subject -issuer -dates -ext extendedKeyUsage -ext subjectAltName
```

For a DER certificate, convert a copy for inspection:

```bash
openssl x509 -in user-authentication.der -inform DER \
  -out user-authentication.pem -outform PEM
```

SSSD uses a dedicated CA bundle for certificate authentication. Put the root CA
and any intermediate CA certificates in this file. It can contain multiple PEM
certificates:

```bash
sudo install -d -m 0755 /etc/sssd/pki
sudo install -m 0644 organization-auth-ca-bundle.pem \
  /etc/sssd/pki/sssd_auth_ca_db.pem
```

If other applications on the workstation must trust the same CA, add the CA
to the system trust store as well:

```bash
sudo install -D -m 0644 organization-root-ca.pem \
  /etc/pki/ca-trust/source/anchors/organization-root-ca.pem
sudo update-ca-trust
```

Do not put the user's private key in either trust location. Trust files contain
CA certificates only.

## Configure SSSD for a local user

The following example maps a certificate subject to the local account `alice`.
Replace `CN=Alice` with a mapping that matches the certificate and your account.
Domain users need their domain's SSSD provider and certificate mapping instead
of the `shadowutils` example.

Create or update `/etc/sssd/sssd.conf`:

```ini
[sssd]
config_file_version = 2
services = nss, pam
domains = shadowutils

[nss]

[pam]
pam_cert_auth = True

[domain/shadowutils]
id_provider = files

[certmap/shadowutils/alice]
matchrule = <SUBJECT>.*CN=Alice.*

```

Set the file owner and mode before you start SSSD:

```bash
sudo chown root:root /etc/sssd/sssd.conf
sudo chmod 600 /etc/sssd/sssd.conf
sudo sssctl config-check
sudo systemctl enable --now sssd
sudo systemctl restart sssd
```

A subject match is only an example. Use a stable certificate field that your
CA controls. For IdM or AD, follow the identity provider's certificate mapping
rules instead of mapping every certificate with a broad `CN` expression.

## Enable PAM and GDM authentication

`authselect` manages the PAM files used by GDM and other login services. Record
the current profile before you change it. The `--force` option replaces the
managed PAM configuration, so keep the recovery path available.

Start with hybrid authentication. It allows a password or a card. This is the
safest way to test the map:

```bash
sudo authselect current
sudo authselect select sssd with-smartcard --force
sudo systemctl restart sssd
```

Log out, insert the card, select the mapped user in GDM, and enter the card PIN.
Test a password login before you use card-only mode. If the certificate fails,
check the logs:

```bash
journalctl -b -u pcscd -u sssd
```

After hybrid login works, select the policy that matches the workstation:

| Policy | Login | Card removal |
| --- | --- | --- |
| `with-smartcard` | Password or card | No automatic action |
| `with-smartcard` + `with-smartcard-required` | Card only for login services | The existing session stays unlocked |
| The two options above plus `with-smartcard-lock-on-removal` | Card only for login services | GNOME locks the session and card re-insertion is required to unlock it |

To enforce card-only login without a removal lock:

```bash
sudo authselect select sssd \
  with-smartcard \
  with-smartcard-required \
  --force
```

To lock a GNOME session when the card leaves the reader:

```bash
sudo authselect select sssd \
  with-smartcard \
  with-smartcard-required \
  with-smartcard-lock-on-removal \
  --force
```

`with-smartcard-lock-on-removal` locks the GNOME session. It does not log the
user out, delete files, or wipe the session. It applies to GNOME desktop
sessions, not a TTY, a remote SSH session, or every other desktop environment.
The `with-smartcard-required` feature also does not make `sudo` or `su`
card-only; those services have their own PAM policy.

## Direct `pam_pkcs11` configuration (legacy path)

Some organizations need the direct `pam_pkcs11.so` module. This is not the
current GDM path on RHEL-family systems, and it is not in the TunaOS image
contract. Add it to a derived image only from a maintained, trusted source.
Review its build and update process before use on a workstation.

The upstream module needs all of the following:

1. A PKCS #11 library, such as OpenSC's `opensc-pkcs11.so`.
2. A CA and certificate policy. Do not use `cert_policy = none` for production
   login.
3. A certificate-to-user mapper, such as a reviewed subject mapping file.
4. A PAM profile for the service under test.

After you install the module, find the OpenSC library path. Do not assume it:

```bash
rpm -ql opensc | grep 'opensc-pkcs11[.]so$'
```

A minimal `/etc/pam_pkcs11/pam_pkcs11.conf` shape is:

```text
pam_pkcs11 {
  use_pkcs11_module = opensc;
  use_mappers = subject;

  pkcs11_module opensc {
    module = /usr/lib64/pkcs11/opensc-pkcs11.so;
    ca_dir = /etc/pam_pkcs11/cacerts;
    crl_dir = /etc/pam_pkcs11/crls;
    cert_policy = ca,signature;
  }

  mapper subject {
    module = internal;
    mapfile = file:///etc/pam_pkcs11/subject_mapping;
  }
}
```

Replace the library path with the path returned by `rpm -ql`. Put the exact
certificate subject and local account in
`/etc/pam_pkcs11/subject_mapping`, one mapping per line:

```text
/C=US/O=Example/OU=Example/CN=Alice -> alice
```

Install CA certificates in `/etc/pam_pkcs11/cacerts` and create the hash links
expected by the module:

```bash
sudo install -d -m 0755 /etc/pam_pkcs11/{cacerts,crls}
sudo install -m 0644 organization-root-ca.pem /etc/pam_pkcs11/cacerts/
cd /etc/pam_pkcs11/cacerts
sudo pkcs11_make_hash_link
```

Do not edit the generated `/etc/pam.d/gdm` stack by hand on an `authselect`
managed system. Create and select a reviewed custom `authselect` profile, or
use the SSSD procedure above. Test the direct module with a safe PAM service
before you change GDM or console login. A bad PAM line can lock out all users.

The direct module authenticates a PAM transaction. It does not define
card-removal behavior by itself. Use a separate event monitor or desktop
integration for a removal lock. For GNOME on EL10, use the SSSD and
`authselect` `with-smartcard-lock-on-removal` feature.

## Keep the configuration across bootc updates

`/usr` belongs to the bootc image. Package installation, PAM modules, OpenSC,
`pcscd`, and SSSD binaries must therefore be rebuilt into the derived image.
A normal TunaOS update does not preserve packages added only through a
transient overlay.

`/etc` and `/var` are persistent writable paths on TunaOS. Keep these files in
configuration management or provision them as part of the derived-image
workflow:

- `/etc/sssd/sssd.conf`
- `/etc/sssd/pki/sssd_auth_ca_db.pem`
- `/etc/pki/ca-trust/source/anchors/` CA certificates
- The `authselect` profile and generated PAM configuration
- `/etc/pam_pkcs11/` files when using the direct module
- SSSD state and logs under `/var/lib/sss` and `/var/log/sssd`

Treat CA bundles and mapping files as security policy. Review them when the CA
or card program changes. Keep private keys on the card and keep PINs out of
image layers, shell history, and configuration files.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| No reader appears | `pcscd.socket`, USB or VM pass-through, CCID support, and `pcsc-lite-ccid` |
| Reader appears but no token | Card insertion, reader firmware, OpenSC support, and vendor PKCS #11 module |
| Token appears but no certificate maps | CA bundle, certificate expiry, EKU, SSSD `matchrule`, and the selected user |
| GDM still shows only password login | `authselect current`, the SSSD profile, and the `sssd` journal |
| Removal does not lock the desktop | Use GNOME and include `with-smartcard-lock-on-removal`; the feature does not cover TTY or SSH |
| Users are locked out | Use the recovery console or previous bootc deployment, then restore the previous `authselect` profile |

Useful checks:

```bash
systemctl --no-pager --full status pcscd.socket sssd
p11-kit list-modules
pkcs11-tool --list-slots
sudo sssctl config-check
journalctl -b -u pcscd -u sssd
```

## Further reading

- [Customization guide](layering.md)
- [Red Hat: smart-card authentication with `authselect`](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/10/html/managing_smart_card_authentication/configuring-smart-card-authentication-using-authselect)
- [Red Hat: Smart-card support in RHEL 8 and later](https://access.redhat.com/articles/4253861)
- [Red Hat: Cryptographic hardware through PKCS #11](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/10/html/security_hardening/configuring-applications-to-use-cryptographic-hardware-through-pkcs-11)
- [OpenSC: PKCS #11 PAM login module](https://opensc.github.io/pam_pkcs11/doc/pam_pkcs11.html)
