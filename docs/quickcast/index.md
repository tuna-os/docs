---
sidebar_position: 1
sidebar_label: "quickcast"

status: unknown
---

A small GNOME screen recorder for quick explanations: record your screen with
microphone audio and an optional webcam in the corner, then paste the finished
video as an attachment.

Quickcast is a GPL-3.0-or-later fork of [Kooha](https://github.com/SeaDve/Kooha).
Kooha's authors and contributors built the capture, audio, region selection and
GNOME application foundation. This fork adds webcam composition, automatic file
copying, a compact MP4 preset and TunaOS packaging.

## Install

```sh
flatpak remote-add --user --if-not-exists tuna-os https://tunaos.org/flatpak/tuna-os.flatpakrepo
flatpak install --user tuna-os org.tunaos.Quickcast
flatpak run --user org.tunaos.Quickcast
```

The initial release targets x86_64 and the GNOME 50 Flatpak runtime.
Alternatively, install the `.flatpak` bundle from this repository's releases.

## Record and paste

1. Choose a monitor/window or a screen region.
2. Toggle microphone and desktop audio. Microphone is enabled by default;
   desktop audio is optional.
3. Select a camera and toggle the webcam button next to the microphone to show
   the floating bubble. Drag it to position it; toggle the webcam off to hide it.
   The bubble remains live during recording; its size menu offers three sizes.
4. Press **Record**. Press **Stop** when finished.
5. The completion window appears and copies the video file. Paste in an app
   that accepts file attachments. **Copy video** copies the latest recording again;
   **Open video** plays it.

Files remain in `~/Videos/Quickcast` unless you change the destination in
Preferences. No upload, account or cloud storage is involved. Closing the window
keeps the app running to serve the clipboard; choose **Quit** or Ctrl+Q to exit.

### Global shortcut

In GNOME Settings → Keyboard → Custom Shortcuts, use:

```sh
gapplication action org.tunaos.Quickcast toggle-record
```

The same command starts and stops recording. `scripts/install-shortcut.py` installs
Super+Shift+R if it is free, preserving your existing custom shortcuts.

## Floating bubble integration

Install the included GNOME 50 companion:

```sh
./scripts/install-extension.sh
```

On first installation, GNOME may need logout/login to discover the new extension.
The script preserves existing extensions and enables Quickcast for the next
session. Until it loads, the camera window can still be dragged, but always-on-top,
workspace pinning and window-only recording position tracking need the companion.
The Shell menu also offers a start/stop recording action.

The extension is included as a separate `.shell-extension.zip` release asset.
Flatpak does not install host Shell extensions automatically.

## Encoding and clipboard behavior

- Default: H.264 + AAC in MP4, 30 fps, software x264 quality 24 / veryfast.
- The output fits within 1920×1080 without upscaling. Monitor/region recordings
  capture the floating webcam window naturally, so move it inside the area you
  are recording. Window-only recordings composite the same camera stream and
  follow the bubble's relative position and size on its monitor.
- The bubble center-crops the camera to a circle with transparent corners. Install the companion Shell extension to keep
  it above other apps, across workspaces, and relay live position changes to
  window-only recordings. Automatic hardware encoder selection is not implemented.
- Video is encoded during recording. Copying occurs only after successful
  end-of-stream finalization, never after cancellation or an encoding error.
- GTK file-list, URI-list and GNOME copied-file clipboard formats are offered.
  Native apps and browser attachment fields differ in which formats they accept.
  GNOME Wayland may require focusing the completion window before copying can
  finish; the pending copy is retried when that window becomes active.
- The camera uses V4L2 (raw or MJPEG), so the Flatpak needs device access and
  read-only `/run/udev` access for discovery. Devices are enumerated when the app
  window is created; restart after attaching a camera.
- Screen permissions use the desktop portal. Previously granted capture sources
  are remembered where the portal permits it. No capture permission is bypassed.

## Build and test

Install the GNOME 50 SDK and Rust extension for your user:

```sh
flatpak install --user flathub org.gnome.Sdk//50 org.freedesktop.Sdk.Extension.rust-stable//25.08
./scripts/build-local.sh
flatpak install --user --reinstall ./Quickcast.flatpak
./scripts/test-local.sh
```

The build script produces `Quickcast.flatpak`. The Flatpak Builder manifest is
`org.tunaos.Quickcast.json`. CI builds that manifest and runs the Meson tests,
including a synthetic screen/webcam/audio MP4 recording and a GTK clipboard/UI
check. Local tests use Xvfb and a private D-Bus session, avoiding the desktop's
clipboard. `scripts/verify-video.py` decodes the synthetic result and checks its
codecs, duration and circular overlay pixels, including transparent corners. The
GTK test checks bubble transparency and file transfer to a separate process in
all three offered clipboard formats.

Real GNOME portal selection, physical audio/video synchronization, and pasting
into individual chat/browser apps still require interactive hardware testing.

## Publishing

Tag releases as `v0.1.0`, etc., or dispatch **Publish Quickcast Flatpak**. The
workflow calls the shared `tuna-os/.github` publisher, pushes
`ghcr.io/tuna-os/quickcast`, and updates the served TunaOS Flatpak index. It inherits
`FLATPAK_INDEX_TOKEN` from the organization/repository; that credential needs access
to the central index repository. When it is unavailable, the same shared workflow
builds the artifacts and the fallback publishes GHCR and the release bundle;
an authorized maintainer must then update the central index from the OCI artifact.
CI on `main` builds and tests without publishing.
