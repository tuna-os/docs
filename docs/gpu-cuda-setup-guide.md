---
title: GPU and CUDA Setup
description: Choose an NVIDIA image, check the driver, and run CUDA workloads in containers on TunaOS.
---

# GPU and CUDA Setup

This guide shows how to set up an NVIDIA GPU on TunaOS. It covers image choice, driver checks, and CUDA workloads in containers.

## Choose an image

The `-nvidia` flavor has NVIDIA drivers and CUDA. Use it for AI, graphics, and VFX work.

| Flavor | Meaning |
| --- | --- |
| `-nvidia` | NVIDIA drivers and CUDA |
| `-nvidia-hwe` | NVIDIA and CUDA on the HWE kernel |

Example image names:

- `ghcr.io/tuna-os/albacore:gnome-nvidia`
- `ghcr.io/tuna-os/yellowfin:gnome-nvidia-hwe`

Not every variant publishes an `-nvidia` flavor. Check the page of your variant, such as [Albacore](/albacore), before you switch. See [Variant guide](/choosing-a-variant) for the full list.

Other variants use open-source drivers. This guide does not cover them.

## Switch to an NVIDIA image

Use `bootc switch`, then reboot:

```bash
sudo bootc switch ghcr.io/tuna-os/albacore:gnome-nvidia
systemctl reboot
```

If the new image causes a problem, run `sudo bootc rollback` and reboot. See [Rollback](/bootc-rollback).

The image sets kernel arguments to block `nouveau` and to enable `nvidia-drm.modeset=1`. See [Layers](/layering) for how these arguments work.

## Check the driver

After the reboot, run:

```bash
nvidia-smi
```

The output lists your GPU, the driver version, and the CUDA version that the driver supports.

To check that the kernel loads the module:

```bash
lsmod | grep nvidia
```

## Run CUDA workloads in containers

Do not install the CUDA toolkit on the host. The host is immutable. Run your tools in a container instead.

Use Podman with the Container Device Interface (CDI):

```bash
podman run --rm --device nvidia.com/gpu=all \
  docker.io/nvidia/cuda:12.4.1-base-ubuntu22.04 nvidia-smi
```

Pick a CUDA image tag that matches the CUDA version in the `nvidia-smi` output or older.

For a long-lived setup, use a toolbox or Distrobox container. See the [AI development quickstart](/guides/AI-DEVELOPMENT-QUICKSTART) for more.

:::note
The CDI spec file must exist for `--device nvidia.com/gpu=all` to work. This guide does not confirm where TunaOS creates it. If the command fails with an unknown device error, see the section on problems.
:::

## Hardware notes

- [System requirements](/system-requirements) lists a GTX 1060 or newer, with 8 GB or more of VRAM for AI work.
- This guide does not document which GPU generations the driver supports. Check the release notes of the NVIDIA driver.
- This guide does not document Secure Boot with the NVIDIA modules. See [Secure Boot](/secure-boot).

## Troubleshooting

**`nvidia-smi` says it cannot talk to the driver.** Confirm you booted the `-nvidia` image with `bootc status`. Then reboot. If Secure Boot is on, check whether it blocks the module.

**Black screen or no display after the switch.** Run `sudo bootc rollback` and reboot. Then open an issue with your GPU model and the output of `bootc status`.

**Podman cannot find `nvidia.com/gpu`.** The CDI spec is missing. Run `ls /etc/cdi /var/run/cdi`. If both are empty, open an issue.

**The container says the CUDA version is too new.** Use a CUDA image tag that is not newer than the CUDA version shown by `nvidia-smi`.

## Report a problem

Open an issue in the [TunaOS repository](https://github.com/tuna-os/tunaOS/issues). Include the image name, GPU model, and `nvidia-smi` output.
