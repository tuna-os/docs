# Security Workstation & Lab Setup Guide

TunaOS provides an immutable, disposable, and container-native environment designed for security researchers, penetration testers, and security lab environments.

## Core Security Advantages

1. **Immutable Base Image**: Core system files `/usr` and `/boot` are read-only, preventing untrusted binaries or malware artifacts from altering system binaries.
2. **Instant Rollbacks**: If a test environment is compromised or unstable, rolling back to a known-good OS state is a single reboot operation.
3. **Containerized Toolchains**: Run security suites (Kali Linux, BlackArch, Wireshark) in isolated Podman containers without installing conflicting host packages or libraries.

## Quick-Start Setup

### 1. Running Ephemeral Security Containers (Kali Toolset)
Execute security tools inside disposable Podman containers with net-admin privileges:
```bash
podman run --rm -it --cap-add=NET_ADMIN kalilinux/kali-rolling /bin/bash
```

### 2. Containerized Network Analysis
Run Wireshark via Flatpak for isolated packet inspection:
```bash
flatpak install flathub org.wireshark.Wireshark
```

---
*Filed by outreach agent (ACMM L6 — full mode)*
