# Security Workstation & Lab Setup Guide

TunaOS gives security researchers, penetration testers, and lab operators a base system that is read-only and easy to put back to a known state.

## Core Security Advantages

1. **Immutable Base Image**: The system files in `/usr` are read-only. A test binary cannot change them.
2. **Rollback to the Previous Image**: If a test breaks the system, run `bootc rollback` and then reboot. You can also select the earlier deployment in the GRUB menu.
3. **Containerized Toolchains**: Run a tool suite such as Kali, BlackArch, or Wireshark in an isolated Podman container. The host keeps its own packages and libraries.

## Quick-Start Setup

### 1. Ephemeral Security Containers (Kali Toolset)

Run the tools in a throwaway Podman container that has network admin rights:

```bash
podman run --rm -it --cap-add=NET_ADMIN kalilinux/kali-rolling /bin/bash
```

### 2. Network Analysis

Run Wireshark as a Flatpak to keep packet inspection away from the host:

```bash
flatpak install flathub org.wireshark.Wireshark
```
