---
sidebar_position: 8
---

# System Requirements

Before you install TunaOS, make sure that your system obeys these
requirements.

## Hardware Requirements

### Minimum Requirements

| Component | Specification |
|-----------|---------------|
| **Processor** | x86_64 (64-bit Intel/AMD) or ARM64 |
| **Memory** | 4 GB RAM |
| **Storage** | 20 GB free disk space |
| **Graphics** | Integrated graphics or discrete GPU |
| **Network** | Internet connection for initial setup |

### Recommended Requirements

| Component | Specification |
|-----------|---------------|
| **Processor** | x86_64 or ARM64 with 2+ cores |
| **Memory** | 8 GB RAM or more |
| **Storage** | 50 GB+ SSD storage |
| **Graphics** | Dedicated GPU (for NVIDIA variant) |
| **Network** | Broadband internet connection |

## Architecture Support

### x86_64 (Standard)
- Modern Intel and AMD 64-bit processors
- Most common desktop and laptop systems
- Full feature support

### x86_64_v2 (Legacy Compatibility)
- Older CPUs from before 2013
- Available for Albacore and Yellowfin variants
- Performance is a little lower

### ARM64
- Apple Silicon Macs (M1, M2, M3, etc.)
- Raspberry Pi 4 and newer
- Other ARM64 single-board computers
- Modern ARM-based laptops and desktops

## Storage Considerations

### Disk Space Usage
- **Base installation**: ~15-20 GB
- **With applications**: 25-30 GB in usual conditions
- **Developer tools**: +5-10 GB
- **Graphics tools** (NVIDIA variant): +10-15 GB

### Storage Types
- **SSD recommended**: Better performance and responsiveness
- **HDD supported**: Minimum 7200 RPM for acceptable performance
- **NVMe**: The best performance for development work

## Memory Requirements by Variant

### Regular Edition
- **Minimum**: 4 GB RAM
- **Recommended**: 8 GB RAM
- **Best**: 16 GB or more of RAM

### NVIDIA (NVIDIA drivers + CUDA)
- **Minimum**: 8 GB RAM
- **Recommended**: 16 GB RAM
- **Best**: 32 GB or more of RAM, for AI and ML work

## Graphics Requirements

### Integrated Graphics
- Intel HD Graphics 4000 or newer
- AMD Radeon R5/R7 series or newer
- Apple integrated graphics (M-series)

### Discrete Graphics

#### For Regular Variants
- Any modern GPU with open-source drivers
- NVIDIA cards (with nouveau drivers)
- AMD Radeon cards (with AMDGPU drivers)

#### For NVIDIA Variant
- **NVIDIA GPU recommended** (GTX 1060 or newer)
- CUDA support for AI/ML applications
- Minimum 4 GB VRAM for graphics work
- 8 GB+ VRAM recommended for AI/ML

## Network Requirements

### Installation
- Internet connection required for:
  - Initial system updates
  - Flatpak application installation
  - Homebrew package downloads

### Bandwidth Recommendations
- **Minimum**: 10 Mbps for comfortable updates
- **Recommended**: 25 Mbps+ for development workflows
- **Best**: 100 Mbps or more, for work with containers

## UEFI/BIOS Requirements

### Supported Boot Methods
- **UEFI** (recommended)
- **Legacy BIOS** (limited support)

### Security Features
- **Secure Boot**: Supported (may need configuration)
- **TPM**: Optional but recommended
- **Intel TXT/AMD SVM**: Supported for virtualization

## Compatibility Notes

### Supported Hardware
- Most standard PC hardware from 2013 onwards
- Apple Silicon Macs (ARM64 variant)
- Many ARM single-board computers

### Known Limitations
- Old hardware can need the x86_64_v2 variants
- Some proprietary hardware may need additional drivers
- WiFi adapters may need firmware packages

### Virtualization
- **Hypervisors**: VMware, VirtualBox, QEMU/KVM, Parallels
- **Minimum VM specs**: 4 GB RAM, 25 GB disk
- **Recommended VM specs**: 8 GB RAM, 50 GB disk

The recommended first step is to test TunaOS in a VM — see
[Test TunaOS in a VM](./tunaos/evaluating-in-a-vm.md) for a QEMU/KVM
walkthrough.

## Before Installation

### Checklist
- [ ] Verify hardware compatibility
- [ ] Backup important data
- [ ] Check internet connection
- [ ] Download the correct ISO variant
- [ ] Prepare installation media (USB drive)
- [ ] Review installation method

### Choosing Your Variant
- **Albacore**: Enterprise stability (AlmaLinux 10)
- **Yellowfin**: Upstream compatibility (AlmaLinux Kitten 10)
- **Bonito**: The newest software, from Fedora 44 - *Development*
- **Skipjack**: CentOS base - *Development*

Do you need help with the choice? Read the
[installation guide](installation), or ask in the
[Matrix chat](https://matrix.to/#/%23tunaos:reilly.asia).