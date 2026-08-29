# Linux Kernel & Module Developer Quick-Start Guide

TunaOS gives kernel developers, module authors, and eBPF engineers a host that stays stable while you build, boot, and debug a kernel.

## Key Advantages for Kernel Engineers

1. **Stable Host OS**: The system files in `/usr` are read-only. A test module does not damage the host that you work on each day.
2. **Instant Host Rollback**: If a custom kernel does not boot, select the earlier deployment in GRUB. That brings your desktop back.
3. **Isolated QEMU/KVM Sandboxes**: Boot a target kernel in QEMU with KVM acceleration. Share a directory into it with virtio-fs.

## Workstation Toolchain Setup

### 1. Install the Build and Debug Tools

Homebrew supplies the compiler and the cache:

```bash
brew install gcc ccache sparse
```

`pahole` ships in the `dwarves` package, and the kselftest targets live in the
kernel source tree under `tools/testing/selftests`. Get both from your base
image or layer them with `bootc`, and check that they are present before you
start a build.

### 2. Kernel Testing in QEMU/KVM

Boot the kernel you built inside a virtual machine:

```bash
qemu-system-x86_64 -enable-kvm -m 4G -smp 4 -kernel arch/x86/boot/bzImage -append "console=ttyS0 root=/dev/sda rw" -nographic
```
