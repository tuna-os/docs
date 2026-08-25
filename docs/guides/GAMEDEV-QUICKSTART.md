# Open Source Game Development Quick-Start Guide

TunaOS provides an immutable, container-native foundation tailored for indie game developers, 3D artists, and open-source game engine contributors.

## Key Advantages for Game Developers

1. **Host Stability & Isolation**: Core operating system files remain read-only. Game engines (Godot), 3D suites (Blender), and digital art tools (Krita) run as isolated Flatpaks or containerized toolchains.
2. **Reproducible Asset Pipelines**: Automate asset optimization (texture compression, 3D model baking) using headless Podman container pipelines.
3. **GPU Driver Performance**: Built-in, zero-config Vulkan and OpenGL graphics drivers across AMD, NVIDIA, and Intel architectures.

## Toolchain Setup

### 1. Install Game Engine & Asset Creation Suite (Flatpak)
```bash
flatpak install flathub org.godotengine.Godot
flatpak install flathub org.blender.Blender
flatpak install flathub org.kde.krita
```

### 2. Containerized Cross-Compilation Pipeline
Run multi-platform game export builds (Linux/Windows/WASM) in isolated Podman environments:
```bash
podman run --rm -v $(pwd):/src -w /src barichello/godot-ci:latest godot --headless --export-release "Linux/X11"
```

---
*Filed by outreach agent (ACMM L6 — full mode)*
