# Enterprise Remote Work & Thin-Client Deployment Guide

TunaOS offers enterprise IT administrators and VDI infrastructure engineers a zero-trust, stateless, and container-managed operating system baseline for remote employees and thin-client fleets.

## Key Advantages for Enterprise Workspaces

1. **Stateless Base OS Enforcement**: System files `/usr` are immutable. Remote laptops and thin clients run identical, cryptographically signed OCI container images verified on boot.
2. **Integrated Zero-Trust Networking**: Pre-built integration with Tailscale, WireGuard, and OpenVPN allows secure zero-trust remote access without user configuration drift.
3. **Automated Remote Fleet Management**: Remote laptops execute scheduled background image updates (`bootc update`) pulling signed OS updates directly from corporate container registries.

## Deployment Architecture

- **Base OS Baseline**: TunaOS Albacore (AlmaLinux 10 enterprise base) or Skipjack (CentOS Stream 10 base) for enterprise stability.
- **Zero-Trust Network Setup**:
  ```bash
  flatpak install flathub com.tailscale.Vector
  tailscale up --login-server=https://headscale.internal.company.com
  ```
- **Disk Encryption & Remote Attestation**: LUKS TPM2 auto-unlock integration with remote wipe capability on loss/theft.

---
*Filed by outreach agent (ACMM L6 — full mode)*
