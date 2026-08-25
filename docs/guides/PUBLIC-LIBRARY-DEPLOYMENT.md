# Public Library & Civic Terminal Deployment Guide

TunaOS provides public libraries, community media labs, and civic technology centers with a self-healing, zero-maintenance desktop operating system that guarantees patron privacy and eliminates IT maintenance overhead.

## Key Benefits for Public Workstations

1. **Guaranteed Patron Privacy**: Ephemeral session handling ensures browser history, downloads, and personal credentials are wiped completely upon logout or reboot.
2. **Immutable System Baseline**: Operating system files `/usr` remain read-only, preventing software tampering, unauthorized driver modifications, or malware persistence.
3. **Automated OCI Image Updates**: Administer public terminal fleets centrally by scheduling image updates via standard container registries (`bootc update`).

## System Configuration Highlights

- **Desktop Baseline**: TunaOS Yellowfin (GNOME) or Skipjack (KDE Plasma) configured with auto-login guest accounts.
- **Web Browsing**: Isolated Flatpak Firefox / Chromium with privacy extension defaults pre-configured.
- **Session Reset**: Automatic session reboot trigger on 15 minutes of inactivity or manual logout.

---
*Filed by outreach agent (ACMM L6 — full mode)*
