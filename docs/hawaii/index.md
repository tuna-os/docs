---
sidebar_position: 1
sidebar_label: "Zirconium Hawaii"
---

:::tip[Visual overview]
Prefer a visual tour? See the **[Zirconium Hawaii overview →](/hawaii)** landing page.
:::

> 🌺 **External project** — not maintained under the tuna-os org. See [zirconium-linux/hawaii](https://github.com/zirconium-linux/hawaii).

Zirconium Hawaii is an experiment — initially Niri OS — that turned into a real project. It builds its own components from source on [freedesktop-sdk](https://gitlab.com/freedesktop-sdk/freedesktop-sdk) with [BuildStream](https://buildstream.build), 100% reproducible. The closest comparison is [GNOME OS](https://os.gnome.org/), which is the project's biggest inspiration — same build system, shared components, different desktop.

## What is it?

Zirconium Hawaii is Zirconium rebuilt on freedesktop-sdk instead of Fedora. It uses the [Niri](https://github.com/YaLTeR/niri) scrollable-tiling Wayland compositor and builds every component from source with BuildStream pipelines.

## How to use it

Currently there is no official installation method. Rebasing from Zirconium (Fedora) to Zirconium Hawaii has been done successfully but is not officially supported and may cause issues.

```bash
git clone https://github.com/zirconium-linux/hawaii.git
cd hawaii
just build
```

## See also

- [Tromsø](/tromso) — KDE Plasma on the same freedesktop-sdk base
- [XFCE Linux](/xfce-linux) — XFCE on the same freedesktop-sdk base
