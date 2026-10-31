---
sidebar_position: 6.5
title: "Remote Access: SSH and Remote Desktop"
description: "Enable the SSH server, manage SSH keys on an immutable system, connect from containers, and choose a remote desktop option for TunaOS."
---

# Remote Access: SSH and Remote Desktop

TunaOS is an immutable system. The `/usr` tree is read-only at runtime, but
`/etc` and `/var` stay writable and persist across reboots and updates. Your
SSH server lives in `/etc/ssh`, and your SSH keys live in your home directory.

This guide shows how to enable the SSH server. It also shows how to pick a
remote desktop option for GUI access.

This guide covers:

1. How to enable the SSH server on TunaOS.
2. How to manage SSH keys and what stays persistent.
3. How to use SSH from `toolbox` and other container environments.
4. How to pick a remote desktop option for GUI access.
5. Security settings for the firewall, key rotation, and SELinux.
6. Fixes for common SSH problems.

---

## Enabling the SSH Server

TunaOS base images ship the OpenSSH server package. Enable the service with
`systemctl`:

```bash
# Check whether the server package is present
rpm -q openssh-server || echo "openssh-server not installed"

# Enable and start the SSH server now, and on every boot
sudo systemctl enable --now sshd

# Confirm the service state
systemctl is-enabled sshd
systemctl status sshd
```

Run `systemctl is-enabled sshd` to see if the image starts this service on boot.
Run `systemctl status sshd` to see if the service listens for connections.

Some minimal or server images omit the server package. An immutable system
refuses `dnf install` on the host because `/usr` is read-only. To add the
package to such an image, build a derived bootc image that includes it, then
`bootc switch` to that image. See [this guide](layering.md) for the full
workflow.

---

## Managing SSH Keys

SSH uses two kinds of keys. Both kinds live in directories that persist on
TunaOS.

| Key Type | Default Location | Persists? |
| --- | --- | --- |
| Host keys | `/etc/ssh/ssh_host_*` | Yes — `/etc` is persistent |
| User keys | `~/.ssh/` (that is, `/home/<user>/.ssh/`) | Yes — `/home` is persistent |

Generate a key pair with `ssh-keygen`. Use an `ed25519` key for new keys:

```bash
ssh-keygen -t ed25519 -C "you@tunaos"
```

The command writes a private key and a public key next to it. The public key
ends in `.pub`. Send the public key to a remote host and add it to that host's
`~/.ssh/authorized_keys` file. `ssh-copy-id` does this for you:

```bash
ssh-copy-id user@remote-host
```

Your private key stays on the machine that made it. Never send a private key
to another host.

### What Survives an Update

`/etc` and `/home` keep their contents across reboots and image updates. Only
`/usr` is transient. Your host keys in `/etc/ssh` and your user keys in
`~/.ssh` stay in place after `bootc upgrade`. Do not put SSH keys or config in
`/usr` or in a `bootc usr-overlay`, or they will vanish on the next reboot.

---

## SSH From Containers

`toolbox` runs a container that shares your home directory with the host. Your
SSH keys and client config in `~/.ssh` are visible inside the container, so you
can run the SSH client from `toolbox` with your host keys:

```bash
toolbox create        # Make the toolbox container once
toolbox enter         # Open the toolbox container
ssh user@remote-host  # Works here; ~/.ssh is shared with the host
```

Other container runtimes, such as plain Podman, do not mount your home
directory by default. Give such a container access to your keys with an explicit
volume mount:

```bash
podman run -v "$HOME/.ssh:/root/.ssh:Z" -it fedora:latest ssh user@remote-host
```

A container usually has no SSH server. To reach a container over SSH, expose
its port to the host or run the SSH client inside the container, as shown
above.

---

## Remote Desktop Options

Use a remote desktop option when you need the graphical desktop, not a command
line.

| Scenario | Recommended Option | Notes |
| --- | --- | --- |
| GNOME desktop, most users | GNOME Remote Desktop | Built into GNOME. No extra package. |
| KDE Plasma desktop | KDE Krfb | Install the `krfb` package. |
| Headless host, no desktop environment | `x11vnc` over a VNC viewer | Needs a separate window server. |

### GNOME Remote Desktop

GNOME Remote Desktop is built into the GNOME desktop. Enable it in the GUI:

1. Open **Settings**.
2. Go to **General** → **Remote Desktop**.
3. Turn on **Remote Desktop**.
4. Turn on **VNC** or **Windows Remote Desktop** as needed.

GNOME stores the setting in `gsettings`. To enable it from a shell:

```bash
gsettings set org.gnome.desktop.remote-desktop-vnc enabled true
```

### KDE Krfb

Install `krfb` from the base image, then start the share service:

```bash
sudo dnf install -y krfb
plasmashell & krfb
```

### VNC for a Headless Host

`x11vnc` shares a display that already exists. Install it from Homebrew or the
base image, then point it at the active display:

```bash
brew install x11vnc
x11vnc -display :0 -forever -shared
```

A headless host has no display to share. Install a virtual desktop server
first, or use a derived image that adds one.

---

## Security Considerations

### Firewall

TunaOS uses `firewalld`. Allow SSH through the firewall before you connect from
another machine:

```bash
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload
firewall-cmd --list-services
```

The `ssh` service opens port `22`. Restrict the source to a known network with
a rich rule. This keeps the port closed for all other hosts:

```bash
sudo firewall-cmd --permanent --add-rich-rule \
  'rule service name=ssh source address=10.0.0.0/24 accept'
sudo firewall-cmd --reload
```

### Disable Password Authentication

Key-based login is stronger than a password. Turn off password login after you
confirm that your key works:

```bash
sudo sed -i 's/^#?PasswordAuthentication.*/PasswordAuthentication no/' \
  /etc/ssh/sshd_config
sudo systemctl reload sshd
```

Keep one session open while you test the new key. A closed session and a broken
key can lock you out of a remote host.

### Key Rotation

Rotate keys on a schedule. Rotate user keys when an employee leaves or when a
key leaks. Rotate host keys to limit the damage of a leaked host key.

- Remove a revoked user key from the host `authorized_keys` file and from any
  server `authorized_keys` list.
- Regenerate a host key with `ssh-keygen -A`, then re-distribute the new public
  key. Host key changes make clients show a warning on the next login.

### SELinux

TunaOS runs SELinux, and the system enforces it by default. Do not disable it
to fix an SSH problem. The `sshd` service already has the correct SELinux
context. If you change the SSH port, teach SELinux the new port so `sshd` can
bind to it:

```bash
sudo semanage port -a -t sshd_port_t -p tcp 5678
sudo firewall-cmd --permanent --remove-service=ssh
sudo firewall-cmd --permanent --add-port=5678/tcp
sudo firewall-cmd --reload
sudo systemctl reload sshd
```

Keep the system current. Run updates often to fix SSH bugs:

```bash
sudo bootc upgrade
```

---

## Troubleshooting Common SSH Problems

### Connection Refused

The SSH server is inactive, or a firewall blocks the port.

```bash
systemctl status sshd          # Is the service active?
firewall-cmd --list-services   # Is ssh in the allowed services?
```

### Connection Timed Out

Firewall rules or a cloud security group may drop these packets. Check the route
to the host and the security group rules for a remote host. Test reachability
with `ping` or `nc -zv remote-host 22`.

### Permission Denied (Publickey)

Your public key is not on the target host, or you connected to the wrong user.

```bash
ssh -v user@remote-host        # Show the keys the client offers
ls -l ~/.ssh/authorized_keys   # Check the target host has your key
```

Check permissions on the SSH directories. Wrong permissions make the server
ignore your key:

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### Host Key Verification Failed

The host key changed. This happens after a reinstall, a migration, or a key
rotation. It can also mean a man-in-the-middle attack. Confirm the new key
through a separate channel before you accept it:

```bash
ssh-keygen -R remote-host      # Remove the stale key from ~/.ssh/known_hosts
```

---

## Related Documentation

- [Customize your image](layering.md)
- [Smart-card login with PIV or CAC](smart-card-login.md)
- [Secure Boot & UEFI Guide](secure-boot.md)
- [Installation guide](installation.md)
- [Manage images with bootc](tunaos/bootc-usage.md)
- [Runtime issues](tunaos/troubleshooting.md)
