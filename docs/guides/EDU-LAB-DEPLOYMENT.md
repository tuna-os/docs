# Educational Computer Lab Deployment Guide

TunaOS offers IT administrators in K-12 schools, universities, and STEM computer labs an immutable, container-managed OS baseline that drastically reduces maintenance overhead and guarantees clean student environments on every boot.

## Key Benefits for Educational Institutions

1. **Zero-Drift Student Workstations**: Immutability ensures system files `/usr` cannot be altered by students. Rebooting restores the exact lab image.
2. **Centralized OCI Image Updates**: Administer 100+ lab computers by pushing updated container images to a local or public container registry (e.g. `ghcr.io` / local registry).
3. **Curriculum Software via Flatpaks**: Pre-install educational tools (LibreOffice, GIMP, VS Code, GeoGebra) as Flatpaks without dependency hell.

## Deployment Architecture

- **Base OS**: TunaOS Bonito (Fedora base) or Skipjack (CentOS Stream 10 base) depending on stability vs. freshness requirements.
- **Update Mechanism**: Scheduled nightly `bootc update` systemd timer pulling updated OCI images.
- **User Sessions**: Ephemeral guest sessions configured via GDM / LightDM configuration.

---
*Filed by outreach agent (ACMM L6 — full mode)*
