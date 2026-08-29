# Enterprise Remote Work & Thin-Client Deployment Guide

TunaOS gives enterprise administrators and VDI engineers a stateless, container-managed base image for remote laptops and thin-client fleets.

## Key Advantages for Enterprise Workspaces

1. **Stateless Base OS**: The system files in `/usr` do not change. Every remote laptop and thin client runs the same signed OCI image, and the machine verifies it at boot.
2. **Zero-Trust Networking**: Layer your VPN client into the image. Every machine then gets the same network setup. Tailscale, WireGuard, and OpenVPN all work this way.
3. **Remote Fleet Management**: Each laptop runs `bootc update` in the background on a timer and pulls signed images from your own registry.

## Deployment Architecture

- **Base OS**: TunaOS Albacore (AlmaLinux 10 base) or Skipjack (CentOS Stream 10 base).
- **Network Client**: Add the client to your image with a `Containerfile` layer. Tailscale and WireGuard are not on Flathub. Install them from the vendor repository instead:
  ```dockerfile
  RUN dnf install -y tailscale
  ```
  Then bring the machine onto your network:
  ```bash
  sudo tailscale up --login-server=https://headscale.internal.company.com
  ```
- **Disk Encryption**: LUKS with a TPM2 auto-unlock, so the disk stays sealed to the machine.

Check the vendor instructions for your base distribution before you build the image. Package names and repository setup differ between AlmaLinux, CentOS Stream, and Fedora.
