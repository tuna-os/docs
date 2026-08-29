# Security Workstation & Lab Setup Guide

TunaOS gives security researchers, penetration testers, and lab operators a base system that is read-only and easy to put back to a known state.

## Core Security Advantages

1. **Immutable Base Image**: The system files in `/usr` and `/boot` are read-only. A test binary cannot change them.
2. **Instant Rollbacks**: If a test breaks the system, one reboot puts the machine back on the last known good image.
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
