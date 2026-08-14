---
sidebar_position: 1
sidebar_label: "tuna-installer-niri"

status: unknown
---

<p align="center">
  <img src="https://raw.githubusercontent.com/tuna-os/tuna-installer-niri/main/docs/screenshots/walkthrough.gif" alt="The TunaOS niri installer, screen by screen" width="640" />
</p>

<p align="center">
  <em>Rendered in CI from the real QML — see the <a href="docs/gui-walkthrough.md">walkthrough</a>.</em>
</p>


**Quickshell/QML + Go** installer for TunaOS, modeled on [DankMaterialShell](https://github.com/AvengeMedia/DankMaterialShell)'s architecture. Runs on the Niri scrollable-tiling Wayland compositor.

## Architecture

```
tuna-installer-niri/
├── ui/installer.qml     # Quickshell QML wizard (welcome → disk → confirm → install → done)
├── installer/main.go     # Go backend (disk discovery + fisherman orchestration)
└── README.md
```

## Build

### Go backend

```bash
cd installer
go build -o tuna-installer-niri .
./tuna-installer-niri discover-disks     # list block devices
./tuna-installer-niri install '{...}'     # run fisherman with a JSON recipe
```

### QML frontend

Requires [Quickshell](https://quickshell.org/):

```bash
quickshell ui/installer.qml
```

## Workflow

1. **Welcome** — intro screen
2. **Disk Selection** — calls `tuna-installer-niri discover-disks`, renders `lsblk -J` output
3. **Confirm** — summary with hostname input
4. **Install Progress** — polls Go backend output via Timer
5. **Done** — success/failure

## DBus Integration

For tighter QML ↔ Go integration (future), expose the backend as a DBus service:

- Service: `org.tunaos.Installer`
- Object: `/org/tunaos/Installer`
- Methods: `DiscoverDisks()`, `StartInstall(disk, hostname)`, `PollOutput()`, `PollStatus()`

## License

GPL-3.0-only

## Offline installs

`tuna-installer-niri detect` reports the live-ISO image and embedded OCI
stores as JSON; the QML layer uses it to offer "install this system, no
download" and passes stores as `additionalImageStores`.

## Development

```bash
cd installer && go build -o tuna-installer-backend .
TUNA_BACKEND=$PWD/tuna-installer-backend quickshell -p ../ui/installer.qml
```

## Flatpak

```bash
flatpak-builder --user --install --force-clean build flatpak/org.tunaos.InstallerNiri.json
flatpak run org.tunaos.InstallerNiri
```
