# Mandelbrot

Mandelbrot is a GNOME-native [Matrix](https://matrix.org) messaging client, forked from
[Fractal](https://gitlab.gnome.org/World/fractal/) to move faster on the modern Matrix
feature set. It is built in Rust on GTK 4, Libadwaita, and the
[matrix-rust-sdk](https://github.com/matrix-org/matrix-rust-sdk).

## Why a fork?

Fractal is an excellent, actively maintained client, but some features are outside its
current scope. Mandelbrot keeps full compatibility with everything Fractal does — E2EE
with cross-signing and verification, rich messaging, moderation, multi-account — and adds
a roadmap focused on:

- **Native voice & video calling** via MatrixRTC (LiveKit), with fully native GNOME call
  UI — call notifications follow the freedesktop notification portal v2 call category, so
  they integrate with GNOME Shell and Phosh.
- **Simplified sliding sync** (MSC4186) for instant startup and snappy room lists.
- **QR code login** (MSC4108).
- **Threads and polls** in the timeline.
- **Space hierarchy browsing.**

## Installation

```sh
flatpak remote-add --if-not-exists tuna-os https://tunaos.org/flatpak/tuna-os.flatpakrepo
flatpak install tuna-os org.tunaos.mandelbrot
```

## Reporting issues

Please report issues with core messaging that also reproduce in Fractal to the
[Fractal issue tracker](https://gitlab.gnome.org/World/fractal/-/issues), and
Mandelbrot-specific issues (calls, sliding sync, QR login…) to the
[Mandelbrot repo](https://github.com/tuna-os/mandelbrot/issues).

## Source

- Repository: [github.com/tuna-os/mandelbrot](https://github.com/tuna-os/mandelbrot)
- Roadmap & architecture notes: [`MANDELBROT.md`](https://github.com/tuna-os/mandelbrot/blob/main/MANDELBROT.md)
- License: GPL-3.0-or-later (same as Fractal)
