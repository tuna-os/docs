# AI & ML Local Development Quick-Start

TunaOS gives AI and ML developers a repeatable desktop base for local language models, vision models, and container training pipelines.

## Why Container-Native for AI?

- **Zero Host Pollution**: The drivers and the base libraries stay as they are. Your CUDA, ROCm, and PyTorch stacks stay inside OCI containers or Flatpaks.
- **Repeatable Toolchains**: Share the same container dev environment (a `Containerfile` or a devcontainer) with the other people on your team.
- **Podman and OCI Native**: Podman comes with the image. Use it to run an inference server such as Ollama, LocalAI, or vLLM.

## Quick Setup

### 1. Local LLM Runner (Ollama via Podman)

Run a local model with GPU passthrough. The host packages do not change:

```bash
podman run -d --device nvidia.com/gpu=all -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```

### 2. Podman Desktop

Install Podman Desktop as a Flatpak to see and control your local containers and models:

```bash
flatpak install flathub io.podman_desktop.PodmanDesktop
```
