---
sidebar_position: 9
title: "FACTORY STATUS"
---




Measured 2026-11-19T14:35:11+00:00 from the live published indexes;
provenance (repomd revision, primary.xml sha256) is in
`docs/factory-status.json`, which also carries the full built and
needed lists this page truncates.

A catalog entry is **built** when the target's published index
carries a binary or source package of that name, **needed** when it
does not. This is presence, not freshness — version-level staleness
needs catalog version pins, which most entries do not carry yet.

## Progress since the last measurement

Compared against 2026-11-18T14:24:09+00:00, the last measurement
that actually MERGED — so a large gap here means the daily
refresh is not landing, which is its own defect:

| target/arch | built Δ | needed Δ | no movement for | newly built |
|---|---|---|---|---|
| debian/amd64 | +0 | +0 | 34 days | — |
| debian/arm64 | +0 | +0 | 34 days | — |
| el10/aarch64 | +0 | +0 | 34 days | — |
| el10/x86_64 | +0 | +0 | 1 days | — |
| eln/aarch64 | +0 | +0 | 1 days | — |
| eln/x86_64 | +0 | +0 | 1 days | — |
| fedora/x86_64 | +0 | +0 | 34 days | — |
| gentoo/amd64 | +0 | +0 | 1 days | — |
| hummingbird/aarch64 | +0 | +0 | 1 days | — |
| hummingbird/x86_64 | +0 | +0 | 1 days | — |
| noble/amd64 | +0 | +0 | 1 days | — |
| noble/arm64 | +0 | +0 | 1 days | — |
| opensuse-tumbleweed/aarch64 | +0 | +0 | 34 days | — |
| opensuse-tumbleweed/x86_64 | +0 | +0 | 34 days | — |
| rawhide/aarch64 | +0 | +0 | 1 days | — |
| rawhide/x86_64 | +0 | +0 | 1 days | — |
| trixie/amd64 | +0 | +0 | 1 days | — |
| trixie/arm64 | +0 | +0 | 1 days | — |
| ubuntu/amd64 | +0 | +0 | 34 days | — |
| ubuntu/arm64 | +0 | +0 | 34 days | — |

## Reproducibility verification

Sampled rebuilds against recorded ActionResults to monitor determinism
and cache-reuse guarantees (#486):

Overall: **100.0%** reproducible (1/1 sampled rebuilds verified; 0 quarantined).

| Engine | Format | Sampled | Reproducible | Divergent | Rate |
|---|---|---|---|---|---|
| tideforge (arm64) | deb | 1 | 1 | 0 | 100.0% |

## debian

| arch | catalog entries | built | needed | index packages |
|---|---|---|---|---|
| amd64 | 57 | 6 | 51 | 30 |
| arm64 | 57 | 6 | 51 | 30 |

Needed on amd64 (51; first 40, full list in the JSON):

```
bazaar
cli11-devel
cosmic-app-library
cosmic-applets
cosmic-bg
cosmic-comp
cosmic-files
cosmic-greeter
cosmic-idle
cosmic-initial-setup
cosmic-launcher
cosmic-notifications
cosmic-osd
cosmic-osk
cosmic-screenshot
cosmic-session
cosmic-settings
cosmic-settings-daemon
cosmic-term
cosmic-wallpapers
cosmic-workspaces
danksearch
dgop
dms
dms-cli
dms-greeter
gdm
glib2
gnome-session
gnome-shell
gobject-introspection
greetd
gtk4
iio-niri
kairpods
krunner-bazaar
libadwaita
libseat
libunwind-devel
libxfce4ui
```

Needed on arm64 (51; first 40, full list in the JSON):

```
bazaar
cli11-devel
cosmic-app-library
cosmic-applets
cosmic-bg
cosmic-comp
cosmic-files
cosmic-greeter
cosmic-idle
cosmic-initial-setup
cosmic-launcher
cosmic-notifications
cosmic-osd
cosmic-osk
cosmic-screenshot
cosmic-session
cosmic-settings
cosmic-settings-daemon
cosmic-term
cosmic-wallpapers
cosmic-workspaces
danksearch
dgop
dms
dms-cli
dms-greeter
gdm
glib2
gnome-session
gnome-shell
gobject-introspection
greetd
gtk4
iio-niri
kairpods
krunner-bazaar
libadwaita
libseat
libunwind-devel
libxfce4ui
```

## el10

| arch | catalog entries | built | needed | index packages |
|---|---|---|---|---|
| aarch64 | 144 | 44 | 100 | 64 |
| x86_64 | 144 | 117 | 27 | 439 |

Needed on aarch64 (100; first 40, full list in the JSON):

```
autoconf
avahi
cairo
cli11-devel
colord-gtk
dms
dms-cli
dms-greeter
exo
fontconfig
fprintd
garcon
gdk-pixbuf2
gdm
gi-docgen
gjs
glib2
glycin
gnome-control-center
gnome-desktop3
gnome-initial-setup
gnome-session
gnome-settings-daemon
gnome-shell
gnome50-el10-compat
gobject-introspection
gsettings-desktop-schemas
gsound
gtk4
gtkgreet
harfbuzz
iio-niri
input-remapper
krunner-bazaar
labwc
libadwaita
libei
libfprint
libgda
libgexiv2
```

Needed on x86_64 (27):

```
cli11-devel
dms
dms-cli
dms-greeter
fprintd
gdk-pixbuf2
gnome-desktop3
gnome-initial-setup
harfbuzz
iio-niri
input-remapper
krunner-bazaar
labwc
libfprint
libgda
libglib-testing
libsoup
libzip
malcontent
ptyxis
quickshell
simdutf
sqlcipher
vte291
xdg-desktop-portal
xdg-desktop-portal-gnome
yq
```

## eln

| arch | catalog entries | built | needed | index packages |
|---|---|---|---|---|
| aarch64 | 38 | 2 | 36 | 4 |
| x86_64 | 38 | 2 | 36 | 4 |

Needed on aarch64 (36):

```
exo
garcon
gtk-layer-shell
libxfce4ui
libxfce4util
libxfce4windowing
mousepad
ristretto
thunar
tumbler
uupd
wayland-protocols
wlr-protocols
xfce4-appfinder
xfce4-clipman-plugin
xfce4-cpugraph-plugin
xfce4-datetime-plugin
xfce4-dev-tools
xfce4-genmon-plugin
xfce4-netload-plugin
xfce4-notifyd
xfce4-panel
xfce4-power-manager
xfce4-pulseaudio-plugin
xfce4-screenshooter
xfce4-sensors-plugin
xfce4-session
xfce4-settings
xfce4-taskmanager
xfce4-terminal
xfce4-wayland
xfce4-weather-plugin
xfce4-whiskermenu-plugin
xfconf
xfdesktop
xfwl4
```

Needed on x86_64 (36):

```
exo
garcon
gtk-layer-shell
libxfce4ui
libxfce4util
libxfce4windowing
mousepad
ristretto
thunar
tumbler
uupd
wayland-protocols
wlr-protocols
xfce4-appfinder
xfce4-clipman-plugin
xfce4-cpugraph-plugin
xfce4-datetime-plugin
xfce4-dev-tools
xfce4-genmon-plugin
xfce4-netload-plugin
xfce4-notifyd
xfce4-panel
xfce4-power-manager
xfce4-pulseaudio-plugin
xfce4-screenshooter
xfce4-sensors-plugin
xfce4-session
xfce4-settings
xfce4-taskmanager
xfce4-terminal
xfce4-wayland
xfce4-weather-plugin
xfce4-whiskermenu-plugin
xfconf
xfdesktop
xfwl4
```

## fedora

| arch | catalog entries | built | needed | index packages |
|---|---|---|---|---|
| x86_64 | 4 | 4 | 0 | 11 |

## gentoo

| arch | catalog entries | built | needed | index packages |
|---|---|---|---|---|
| amd64 | 1 | 1 | 0 | 1 |

## hummingbird

| arch | catalog entries | built | needed | index packages |
|---|---|---|---|---|
| aarch64 | 677 | 617 | 60 | 3916 |
| x86_64 | 677 | 639 | 38 | 8791 |

Needed on aarch64 (60; first 40, full list in the JSON):

```
brltty
cockpit
cosmic-osk
cxx-rust-cssparser
dotconf
espeak-ng
evolution-data-server
evolution-ews
firefox
fprintd
fwupd
ghc-pandoc
glycin
gnome-initial-setup
gnome-user-share
gpsd
grub2
gstreamer1-plugins-bad-free
intel-media-driver-free
iw
kf6-kcoreaddons
kf6-kguiaddons
kf6-kjobwidgets
kf6-knotifications
kf6-kstatusnotifieritem
kf6-kunitconversion
kf6-kwidgetsaddons
kf6-kxmlgui
libao
libayatana-ido
libcanberra
liblouis
libphonenumber
librist
libsoup3
libvorbis
libvpl
libxfce4util
libxml2_2.13
nautilus
```

Needed on x86_64 (38):

```
brltty
cockpit
cosmic-osk
cxx-rust-cssparser
dotconf
espeak-ng
evolution-data-server
evolution-ews
firefox
fprintd
gnome-user-share
gpsd
grub2
gstreamer1-plugins-bad-free
iw
libcanberra
liblouis
libphonenumber
librist
libvorbis
libxfce4util
libxml2_2.13
oo7
orca
pcaudiolib
plasma-union
plymouth
pyatspi
qt6-qtwebengine
rpm-ostree
rust-pathrs
samba
speech-dispatcher
stoken
vdirsyncer
webkitgtk
xfce4-settings
xfdesktop
```

## noble

| arch | catalog entries | built | needed | index packages |
|---|---|---|---|---|
| amd64 | 2 | 2 | 0 | 6 |
| arm64 | 2 | 2 | 0 | 6 |

## opensuse-tumbleweed

| arch | catalog entries | built | needed | index packages |
|---|---|---|---|---|
| aarch64 | 20 | 11 | 9 | 22 |
| x86_64 | 20 | 11 | 9 | 22 |

Needed on aarch64 (9):

```
cli11-devel
iio-niri
kairpods
krunner-bazaar
libunwind-devel
ninja-build
oversteer-udev
uupd
wayland-protocols
```

Needed on x86_64 (9):

```
cli11-devel
iio-niri
kairpods
krunner-bazaar
libunwind-devel
ninja-build
oversteer-udev
uupd
wayland-protocols
```

## rawhide

| arch | catalog entries | built | needed | index packages |
|---|---|---|---|---|
| aarch64 | 1 | 1 | 0 | 1 |
| x86_64 | 1 | 1 | 0 | 1 |

## trixie

| arch | catalog entries | built | needed | index packages |
|---|---|---|---|---|
| amd64 | 1 | 1 | 0 | 14 |
| arm64 | 1 | 1 | 0 | 14 |

## ubuntu

| arch | catalog entries | built | needed | index packages |
|---|---|---|---|---|
| amd64 | 57 | 6 | 51 | 17 |
| arm64 | 57 | 6 | 51 | 17 |

Needed on amd64 (51; first 40, full list in the JSON):

```
bazaar
cli11-devel
cosmic-app-library
cosmic-applets
cosmic-bg
cosmic-comp
cosmic-files
cosmic-greeter
cosmic-idle
cosmic-initial-setup
cosmic-launcher
cosmic-notifications
cosmic-osd
cosmic-osk
cosmic-screenshot
cosmic-session
cosmic-settings
cosmic-settings-daemon
cosmic-term
cosmic-wallpapers
cosmic-workspaces
danksearch
dgop
dms
dms-cli
dms-greeter
gdm
glib2
gnome-session
gnome-shell
gobject-introspection
greetd
gtk4
iio-niri
kairpods
krunner-bazaar
libadwaita
libseat
libunwind-devel
mutter
```

Needed on arm64 (51; first 40, full list in the JSON):

```
bazaar
cli11-devel
cosmic-app-library
cosmic-applets
cosmic-bg
cosmic-comp
cosmic-files
cosmic-greeter
cosmic-idle
cosmic-initial-setup
cosmic-launcher
cosmic-notifications
cosmic-osd
cosmic-osk
cosmic-screenshot
cosmic-session
cosmic-settings
cosmic-settings-daemon
cosmic-term
cosmic-wallpapers
cosmic-workspaces
danksearch
dgop
dms
dms-cli
dms-greeter
gdm
glib2
gnome-session
gnome-shell
gobject-introspection
greetd
gtk4
iio-niri
kairpods
krunner-bazaar
libadwaita
libseat
libunwind-devel
mutter
```

## fedora desktop coverage (x86_64)

`required_packages` roots from manifests/xfce-fedora.yaml
against the published index — the table that decides which
desktops tunaOS can wire (tunaOS#1755).

| desktop | roots present | missing |
|---|---|---|
| xfce | 1/1 | — |

## hummingbird desktop coverage (aarch64)

`required_packages` roots from manifests/hummingbird-desktops.yaml
against the published index — the table that decides which
desktops tunaOS can wire (tunaOS#1755).

| desktop | roots present | missing |
|---|---|---|
| bluefin | 49/77 | anaconda-live, bootc, bootupd, dracut-live, evolution-ews-core, firefox, … (28 total) |
| cosmic | 5/5 | — |
| gnome | 1/10 | gdm, gnome-control-center, gnome-initial-setup, gnome-session, gnome-settings-daemon, gnome-shell, … (9 total) |
| kde | 3/5 | plasma-desktop, plasma-workspace |
| niri | 3/6 | dms, dms-cli, dms-greeter |
| tuna | 1/3 | libcanberra, rpm-ostree |
| xfce | 5/6 | xfwl4 |

## hummingbird desktop coverage (x86_64)

`required_packages` roots from manifests/hummingbird-desktops.yaml
against the published index — the table that decides which
desktops tunaOS can wire (tunaOS#1755).

| desktop | roots present | missing |
|---|---|---|
| bluefin | 58/77 | anaconda-live, bootc, bootupd, dracut-live, evolution-ews-core, firefox, … (19 total) |
| cosmic | 5/5 | — |
| gnome | 10/10 | — |
| kde | 5/5 | — |
| niri | 3/6 | dms, dms-cli, dms-greeter |
| tuna | 1/3 | libcanberra, rpm-ostree |
| xfce | 5/6 | xfwl4 |

## Not yet measured

These targets are NOT covered above — absence of a row is not
absence of a gap:

| target | format | catalog entries | why |
|---|---|---|---|
| alma10 | rpm | 142 | no published_index declared in package-factory.yaml |
| alma10-kitten | rpm | 142 | no published_index declared in package-factory.yaml |
| arch | pkg.tar.zst | 30 | no published_index declared in package-factory.yaml |
| ubuntu-rolling | deb | 1 | no published_index declared in package-factory.yaml |
