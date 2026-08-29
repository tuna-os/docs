# Open Source Game Development Quick-Start Guide

TunaOS gives indie game developers, 3D artists, and game engine contributors a container-native base that stays the same under them.

## Key Advantages for Game Developers

1. **Host Stability & Isolation**: The core system files stay read-only. Godot, Blender, and Krita each run as a Flatpak or in a container toolchain.
2. **Repeatable Asset Pipelines**: Put your asset steps in a headless Podman container. They then give the same result on every machine.
3. **GPU Driver Performance**: Vulkan and OpenGL drivers for AMD, NVIDIA, and Intel come with the image and need no setup.

## Toolchain Setup

### 1. Install the Engine and the Art Tools (Flatpak)

```bash
flatpak install flathub org.godotengine.Godot
flatpak install flathub org.blender.Blender
flatpak install flathub org.kde.krita
```

### 2. Cross-Compilation in a Container

Export a build for another platform (Linux, Windows, WASM) inside Podman:

```bash
podman run --rm -v $(pwd):/src -w /src barichello/godot-ci:latest godot --headless --export-release "Linux/X11"
```
