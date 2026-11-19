---
title: SSH and Remote Access
description: Connect to a TunaOS machine over SSH, with the limits of what this repository can confirm.
---

# SSH and Remote Access

This guide shows how to connect to a TunaOS machine from another computer. It uses standard OpenSSH and systemd commands.

:::note
This repository does not document the TunaOS defaults for remote access. No page here confirms whether `sshd` is enabled on each variant, which firewall is active, or which remote desktop tools are installed. Each step below that depends on a default says so. Check the result on your own machine.
:::

## Before you start

- Make sure you have local access to the machine, such as the console. Keep it until you confirm that SSH works.
- Know the user name and the host name or IP address of the machine.
- Use key authentication. A password-only setup is easier to attack.

## Check the SSH service

Run these commands on the TunaOS machine:

```bash
systemctl status sshd
```

If the service is not active, start it and enable it at boot:

```bash
sudo systemctl enable --now sshd
```

The unit name can differ by image. The repository does not confirm it. If `sshd` is not found, list the units with `systemctl list-unit-files | grep -i ssh`.

## Connect from another computer

```bash
ssh <user>@<host>
```

To use a key, create one on your client and copy it to the TunaOS machine:

```bash
ssh-keygen -t ed25519
ssh-copy-id <user>@<host>
```

## Home directory and immutable root

TunaOS is an image-based (bootc) system. The home directory of a user is normal writable data, so `~/.ssh/authorized_keys` stays in place after an update. Do not edit files in `/usr`. This repository does not confirm which files in `/etc` persist across image updates for SSH settings. Check the bootc documentation before you rely on a change to `/etc/ssh/sshd_config`.

## Firewall

The repository does not confirm which firewall is active on TunaOS. If a firewall blocks port 22, open it with the tool that your image uses. Check the active firewall first.

## Remote desktop

The repository does not confirm which remote desktop tools ship in each image. For a graphical session, use SSH as a transport only after you confirm the tool of your desktop is present. Do not install packages with `dnf` on the host. The host is immutable.

## Safety checks

- Keep a second way in, such as the console, when you change SSH settings. The [smart card login guide](smart-card-login.md) gives the same advice.
- Test a new key from a second terminal before you close the first session.
- Disable password login only after key login works.

## Related guides

- [Smart card login](smart-card-login.md)
- [GPU and CUDA setup](gpu-cuda-setup-guide.md)
