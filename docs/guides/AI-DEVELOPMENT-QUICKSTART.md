# AI & ML Local Development Quick-Start

TunaOS provides a reproducible, immutable desktop baseline ideal for AI/ML researchers and developers running local LLMs, vision models, and containerized training pipelines.

## Why Container-Native for AI?

- **Zero Host Pollution**: Drivers and base libraries remain untouched while complex CUDA, ROCm, or PyTorch environments run inside OCI containers or Flatpaks.
- **Reproducible Toolchains**: Share exact containerized dev environments (`Containerfile` / Devcontainers) across team members.
- **Podman & OCI Native**: Pre-configured Podman integration allows seamless execution of containerized inference servers (Ollama, LocalAI, vLLM).

## Quick Setup

### 1. Local LLM Runner (Ollama via Podman)
Run local LLMs with GPU passthrough without modifying host OS packages:
```bash
podman run -d --device nvidia.com/gpu=all -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```

### 2. Podman Desktop
Install Podman Desktop via Flatpak to visually manage local containers and AI models:
```bash
flatpak install flathub io.podman_desktop.PodmanDesktop
```

---
*Filed by outreach agent (ACMM L6 — full mode)*
