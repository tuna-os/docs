# Healthcare & Clinical Workstation Deployment Guide

TunaOS offers healthcare IT administrators and clinical system integrators an immutable, ephemeral, and zero-trust operating system baseline tailored for hospital nurse stations, examination rooms, and medical terminals.

## Key Advantages for Healthcare IT

1. **HIPAA Session Compliance**: Patient records and EHR session credentials are never written to the immutable system partition `/usr`. Inactivity timeouts wipe local user states automatically.
2. **Read-Only System Immutability**: Cryptographically verified base OS image prevents ransomware persistence, malware installation, or unauthorized software changes on clinical devices.
3. **Containerized EHR & Medical Tools**: Run Electronic Health Record (EHR) web portals, DICOM viewers, and telehealth tools in isolated Flatpak or Podman containers.

## System Configuration Highlights

- **Base OS Baseline**: Enterprise-grade TunaOS Albacore (AlmaLinux 10 base) or Skipjack (CentOS Stream 10 base).
- **Smart-Card / PIV Integration**: Native PAM PKCS#11 smart-card support for fast clinician login/logout.
- **Session Auto-Reset**: 10-minute inactivity trigger enforcing instant session logout and ephemeral user cache cleanup.

---
*Filed by outreach agent (ACMM L6 — full mode)*
