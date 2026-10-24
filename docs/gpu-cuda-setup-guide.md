---
sidebar_position: 3
description: "A guide to choosing a GPU variant, verifying your NVIDIA driver, setting up CUDA, and running GPU workloads in containers on TunaOS."
---

# GPU and CUDA Setup Guide

TunaOS uses GPU hardware to speed up graphics, video, and AI workloads. This guide shows how to pick a variant with GPU support, check that your driver works, set up CUDA, and run GPU workloads in containers.

For the deep developer toolchain (Jupyter, VS Code, multi-GPU NCCL), read the [AI/ML Development](../tunaos/ai-ml-development.md) page.

## Choosing the Right Variant

TunaOS builds most variants with an optional `-nvidia` edition. That edition ships the NVIDIA driver and the CUDA toolkit. Choose it when you need GPU acceleration for graphics or AI work.

Some variants also offer an `-hwe` edition. That edition adds a newer kernel and newer drivers. Use it for newer hardware that the stable kernel does not fully support.

The `-nvidia-hwe` edition combines both. It ships the NVIDIA driver, the CUDA toolkit, the newer kernel, and the newer drivers.

### Edition Selection

Use this table to pick an edition:

| Edition | Driver | Kernel | Best for |
| --- | --- | --- | --- |
| Stable (`-nvidia`) | NVIDIA | Stable kernel | Most NVIDIA GPUs and AI work |
| Hardware Enablement (`-hwe`) | NVIDIA | Newer kernel | Newer GPUs or hardware that needs a newer driver |
| Both (`-nvidia-hwe`) | NVIDIA | Newer kernel | Newer GPUs and AI work that need the latest driver |

The stable edition works for most NVIDIA GPUs. Pick the `-hwe` edition only when your GPU needs a newer driver than the stable kernel gives.

### ARM64 and Asahi

ARM64 machines use a different GPU stack. They run the open-source `nouveau` driver and use Mesa graphics. They do not use the NVIDIA proprietary driver.

Check the compatibility list for Asahi Linux before you install on Apple hardware.

## Verify Your GPU

Check that your machine sees the GPU and that the driver loads. Run these checks after you boot an `-nvidia` variant.

### Check the Driver

Look at the PCI devices and see which driver the kernel uses:

```bash
lspci -k | grep -A 2 -E "VGA|3D"
```

The output shows the GPU name and the driver in use. An NVIDIA GPU shows the `nvidia` driver here.

Check the driver version and GPU health with `nvidia-smi`:

```bash
nvidia-smi
```

`nvidia-smi` shows the driver version, the CUDA version it supports, and the memory use for each GPU. If this command fails, you run a variant without the NVIDIA driver, or the driver did not load.

Check that the graphics stack works with `glxinfo`:

```bash
glxinfo | grep "OpenGL"
```

This shows the OpenGL renderer. An NVIDIA renderer confirms the driver serves the desktop.

### Check Firmware and Microcode

NVIDIA GPUs and Intel CPUs need firmware and microcode for full support:

```bash
# CPU microcode
dmesg | grep -i microcode

# GPU firmware
dmesg | grep -i nvidia
```

Empty output is normal on a fresh install. Look for error lines that name a missing firmware file. Pull a base image update to clear those lines:

```bash
sudo bootc upgrade
```

This update pulls the latest driver, firmware, and microcode. Then reboot.

## Set Up CUDA

The `-nvidia` variants ship the CUDA toolkit. Verify it:

```bash
nvcc --version
```

`nvcc` prints the CUDA toolkit version.

### Choose Where You Run CUDA

You have three options to run CUDA code:

- **The host:** The toolkit is already on an `-nvidia` variant. Use it for quick tests and for tools like Ollama and PyTorch.
- **A container:** Run CUDA inside a container. This keeps your host clean and makes the setup repeatable. Use this for development and for inference servers.
- **A Flatpak:** Some apps bundle their own compute stack. Use this for desktop apps that need the GPU.

Most developers run CUDA in a container. The next section covers that path.

## Run GPU Workloads in Containers

Containers use the NVIDIA Container Toolkit to reach the GPU. The toolkit gives containers access to the `nvidia.com/gpu` device through CDI.

### Run a Container With the GPU

Add the GPU device to your container. Podman then passes the GPU through to it:

```bash
podman run --rm --device nvidia.com/gpu=all \
  nvcr.io/nvidia/cuda:12.8.0-base-ubuntu22.04 \
  nvcc --version
```

### Run a Local Model

Run a local language model with GPU support:

```bash
podman run -d --name ollama --device nvidia.com/gpu=all \
  -v ollama-data:/root/.ollama -p 11434:11434 \
  nvcr.io/nvidia/ollama:latest
```

Pull a model after the server starts:

```bash
podman exec ollama ollama pull llama3.2
```

### Manage GPU Memory

A model needs more GPU memory than is free, then it fails. Watch memory use before you pull a large model:

```bash
nvidia-smi --query-gpu=memory.used,memory.free,memory.total --format=csv
```

Stop other containers or models that use the GPU. Then run your model again.

## Troubleshooting

### The Driver Disappears After an Update

A base image update can replace the driver. If `nvidia-smi` fails after a reboot, check the current image:

```bash
bootc status
```

Roll back to the previous image if the new one dropped the driver:

```bash
sudo bootc rollback
sudo systemctl reboot
```

Read the [Bootc Rollback Guide](../bootc-rollback.md) for more on this path.

### CUDA Runs Out of Memory

A CUDA program that needs more memory than a GPU has prints an out-of-memory error. Reduce the batch size or the model size. Check other processes that use the GPU:

```bash
nvidia-smi
```

### The Container Cannot See the GPU

Add the GPU device to the container command:

```bash
--device nvidia.com/gpu=all
```

Confirm the container reaches the GPU. See [Run a Container With the GPU](#run-a-container-with-the-gpu).

### Low Performance

Set the GPU to a fixed performance mode so it keeps its highest clocks:

```bash
sudo nvidia-smi -pm 1
```

Watch the GPU during work to see if it stays busy:

```bash
watch -n 1 nvidia-smi
```

## See Also

- [Pick Your Variant](../choosing-a-variant.md) — the full variant list
- [AI/ML Development](../tunaos/ai-ml-development.md) — the deep developer toolchain
- [COSMIC Quick-Start](../cosmic-quickstart.md) — GPU notes for the COSMIC desktop
- [System Requirements](../system-requirements.md) — hardware compatibility
- [Bootc Rollback Guide](../bootc-rollback.md) — restore a previous image
