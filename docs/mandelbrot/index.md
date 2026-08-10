# Mandelbrot

Mandelbrot is a GNOME-native Matrix client. We forked it from
[Fractal](https://gitlab.gnome.org/World/fractal/) to move faster on the modern Matrix
feature set. It is built in Rust on GTK 4, Libadwaita, and the
[matrix-rust-sdk](https://github.com/matrix-org/matrix-rust-sdk).

## Why a fork?

Fractal is an active client. Some features fall outside its scope.
Mandelbrot keeps full feature parity with Fractal — E2EE
with verification, rich messages, moderation, and multi-account.
It adds modern Matrix features to that base.

## Features beyond Fractal

- **Native voice & video calls** *(experimental)* — MatrixRTC built in natively (no
  embedded browser). Join calls from the room header. Access a call view
  with participant grid and auto-hiding controls. Return to calls via the top bar.
  Receive call notifications with portal v2 `call.incoming` categories (great on Phosh,
  landed in GNOME Shell). Calls use end-to-end encryption with automatic key rotation,
  and crash-safe membership cleanup via MSC4140 delayed events. Needs a homeserver
  with a LiveKit focus (e.g. matrix.org). The implementation's conformance suite —
  ported from matrix-js-sdk — runs in CI, plus a live interop test harness.
- **Simplified slide sync** (MSC4186) — instant room list on supported homeservers
  (Synapse ≥ 1.114). It falls back to classic sync elsewhere.
- **QR code login** (MSC4108) — "Sign in with QR code" on the login screen.
  Use "Link New Device…" in Account Settings → Sessions (OAuth 2.0 homeservers).
- **Threads** (MSC3440) — a "N replies in thread" button opens an adaptive thread panel.
  It includes its own composer, thread-scoped replies/edits/reactions, and per-thread drafts.
- **Polls** (MSC3381) — create disclosed or undisclosed polls from the composer menu.
  Vote, watch live results, and end polls from the context menu.
- **Voice messages** (MSC3245) — record with the composer's microphone button (live
  level meter). Send as Ogg Opus with waveform metadata.

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
