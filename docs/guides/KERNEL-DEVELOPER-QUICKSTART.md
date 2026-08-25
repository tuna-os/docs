# Linux Kernel & Module Developer Quick-Start Guide

TunaOS provides Linux kernel developers, module authors, and eBPF engineers with a rock-solid, immutable host environment for kernel compilation, debugging, and QEMU virtual machine testing.

## Key Advantages for Kernel Engineers

1. **Unbreakable Host OS**: System binaries `/usr` are immutable. Testing experimental kernel modules or eBPF tracing hooks will never corrupt your daily driver host OS.
2. **Instant Host Rollback**: If a custom kernel deployment fails to boot, selecting the previous container image deployment from GRUB instantly restores your working desktop.
3. **Isolated QEMU/KVM Sandboxes**: Run virtualized target kernels in QEMU/KVM with full KVM acceleration and virtio-fs folder sharing.

## Workstation Toolchain Setup

### 1. Install Kernel Build & Debugging Tools (Homebrew)
```bash
brew install gcc ccache pahole Sparse kselftest
```

### 2. Fast Kernel Testing in QEMU/KVM
Launch compiled target kernels inside unprivileged QEMU virtual machines:
```bash
qemu-system-x86_64 -enable-kvm -m 4G -smp 4 -kernel arch/x86/boot/bzImage -append "console=ttyS0 root=/dev/sda rw" -nographic
```

---
*Filed by outreach agent (ACMM L6 — full mode)*
