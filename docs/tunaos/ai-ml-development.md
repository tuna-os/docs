---
sidebar_position: 7
title: "AI/ML Development"
---

# 🤖 AI/ML Development on TunaOS

TunaOS GDX variants ship NVIDIA drivers and CUDA pre-installed, making them ready for GPU-accelerated AI/ML workloads out of the box. This guide covers setting up and running common AI/ML tools.

## Choosing the Right Variant

For AI/ML work, use the `-gdx` or `-gdx-hwe` variants:

```bash
# GNOME with NVIDIA + CUDA (stable kernel)
ghcr.io/tuna-os/yellowfin:gnome-gdx

# GNOME with NVIDIA + CUDA (hardware enablement kernel)
ghcr.io/tuna-os/yellowfin:gnome-gdx-hwe

# KDE Plasma with NVIDIA + CUDA
ghcr.io/tuna-os/albacore:kde-gdx
```

Switch to a GDX variant:

```bash
sudo bootc switch ghcr.io/tuna-os/yellowfin:gnome-gdx
sudo systemctl reboot
```

## Verify GPU Access

After booting a GDX variant, verify your GPU is accessible:

```bash
# NVIDIA driver
nvidia-smi

# CUDA toolkit
nvcc --version

# GPU compute capability
nvidia-smi --query-gpu=compute_cap --format=csv
```

Expected output from `nvidia-smi`:

```
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 560.x.xx    Driver Version: 560.x.xx    CUDA Version: 12.8      |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
|===============================+======================+======================|
|   0  NVIDIA RTX 4090      Off | 00000000:01:00.0  On |                  Off |
+-------------------------------+----------------------+----------------------+
```

## Install AI/ML Tools

### Ollama (Local LLMs)

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull and run a model
ollama pull llama3.2
ollama run llama3.2 "Write a haiku about TunaOS"

# Run with GPU acceleration (automatic on GDX)
ollama run mistral
```

### PyTorch with CUDA

```bash
# Install PyTorch with CUDA support
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124

# Verify GPU acceleration
python3 -c "import torch; print(f'CUDA available: {torch.cuda.is_available()}'); print(f'Device count: {torch.cuda.device_count()}'); print(f'Device: {torch.cuda.get_device_name(0)}')"
```

### TensorFlow with GPU

```bash
pip install tensorflow[and-cuda]

# Verify GPU
python3 -c "import tensorflow as tf; print(f'GPU: {tf.config.list_physical_devices(\"GPU\")}')"
```

### Containerized Workloads

Run AI/ML containers with GPU passthrough:

```bash
# PyTorch container
podman run --rm --device nvidia.com/gpu=all \
  ghcr.io/pytorch/pytorch:latest \
  python3 -c "import torch; print(torch.cuda.is_available())"

# Ollama in a container
podman run -d --device nvidia.com/gpu=all -p 11434:11434 \
  ollama/ollama
```

## NCCL and Multi-GPU

For multi-GPU training, NCCL is pre-configured:

```bash
# Check NCCL version
ldconfig -p | grep nccl

# Run multi-GPU benchmark
python3 -c "
import torch
import torch.distributed as dist
dist.init_process_group(backend='nccl')
print(f'NCCL available: {dist.is_nccl_available()}')
"
```

## Development Environment

### Jupyter Lab

```bash
# Install Jupyter
pip install jupyterlab

# Launch (binds to all interfaces for tailnet access)
jupyter lab --ip=0.0.0.0 --no-browser
```

### VS Code with CUDA

```bash
# Install VS Code via Homebrew (pre-installed on TunaOS)
brew install --cask visual-studio-code

# Install CUDA extension
code --install-extension ms-python.python
code --install-extension ms-toolsai.jupyter
```

## Performance Tuning

```bash
# Check GPU power mode
sudo nvidia-smi -pm 1

# Set GPU to maximum performance
sudo nvidia-smi -pl <max-power-watts>

# Monitor GPU usage
watch -n 1 nvidia-smi

# Check memory bandwidth
nvidia-smi --query-gpu=memory.used,memory.free,memory.total --format=csv
```

## Troubleshooting

| Problem | Fix |
|---|---|
| `nvidia-smi` not found | Ensure you're running a GDX variant: `bootc status` |
| CUDA out of memory | Reduce batch size or check other processes: `nvidia-smi` |
| Container can't see GPU | Add `--device nvidia.com/gpu=all` to `podman run` |
| No GPU in PyTorch | Reinstall PyTorch with CUDA: `pip install torch --index-url https://download.pytorch.org/whl/cu124` |

## See Also

- [System Requirements](../system-requirements.md) — hardware compatibility
- [Installation Guide](../installation.md) — getting started
- [Managing with Bootc](bootc-usage.md) — variant switching and updates
- [NVIDIA CUDA Documentation](https://docs.nvidia.com/cuda/) — official CUDA docs
