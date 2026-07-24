# Mandelbrot

Mandelbrot is a GNOME-native [Matrix](https://matrix.org) messaging client, forked from
[Fractal](https://gitlab.gnome.org/World/fractal/) to move faster on the modern Matrix
feature set. It is built in Rust on GTK 4, Libadwaita, and the
[matrix-rust-sdk](https://github.com/matrix-org/matrix-rust-sdk).

## Why a fork?

Fractal is an excellent, actively maintained client, but some features are outside its
current scope. Mandelbrot keeps full compatibility with everything Fractal does — E2EE
with cross-signing and verification, rich messaging, moderation, multi-account — and adds
the modern Matrix feature set on top.

## Features beyond Fractal

- **Native voice & video calls** *(experimental)* — MatrixRTC built in natively (no
  embedded browser): join calls from the room header, GNOME-native call view with
  participant grid and auto-hiding controls, a return-to-call bar, and incoming-call
  notifications using the freedesktop portal v2 `call.incoming` category (great on Phosh,
  landing in GNOME Shell). Calls are end-to-end encrypted with automatic key rotation,
  and crash-safe membership cleanup via MSC4140 delayed events. Requires a homeserver
  with a LiveKit focus (e.g. matrix.org). The implementation's conformance suite —
  ported from matrix-js-sdk — runs in CI, plus a live interop test harness.
- **Simplified sliding sync** (MSC4186) — instant room list on supported homeservers
  (Synapse ≥ 1.114), with automatic fallback to classic sync elsewhere.
- **QR code login** (MSC4108) — "Sign in with QR code" on the login screen, and
  "Link New Device…" in Account Settings → Sessions (OAuth 2.0 homeservers).
- **Threads** (MSC3440) — a "N replies in thread" button opens an adaptive thread panel
  with its own composer, thread-scoped replies/edits/reactions, and per-thread drafts.
- **Polls** (MSC3381) — create disclosed or undisclosed polls from the composer menu,
  vote, watch live results, and end polls from the context menu.
- **Voice messages** (MSC3245) — record with the composer's microphone button (live
  level meter), send as Ogg Opus with waveform metadata.

Full feature documentation:
[docs/FEATURES.md](https://github.com/tuna-os/mandelbrot/blob/main/docs/FEATURES.md).

## Installation

```sh
flatpak remote-add --user --if-not-exists tuna-os https://tunaos.org/flatpak/tuna-os.flatpakrepo
flatpak install --user tuna-os org.tunaos.mandelbrot
```

Mandelbrot runs on the GNOME 50 runtime, so you also need the
[Flathub remote](https://flathub.org/setup) (or another source for
`org.gnome.Platform//50`).

Added the `tuna-os` remote before it moved to tunaos.org? `--if-not-exists` keeps
your old one and the install will say nothing matches. Fix it with
`flatpak remote-modify --user tuna-os --url=oci+https://tunaos.org/flatpak`.

## Reporting issues

Please report issues with core messaging that also reproduce in Fractal to the
[Fractal issue tracker](https://gitlab.gnome.org/World/fractal/-/issues), and
Mandelbrot-specific issues (calls, sliding sync, QR login…) to the
[Mandelbrot repo](https://github.com/tuna-os/mandelbrot/issues).

## Source

- Repository: [github.com/tuna-os/mandelbrot](https://github.com/tuna-os/mandelbrot)
- Roadmap & architecture notes: [`MANDELBROT.md`](https://github.com/tuna-os/mandelbrot/blob/main/MANDELBROT.md)
- License: GPL-3.0-or-later (same as Fractal)
