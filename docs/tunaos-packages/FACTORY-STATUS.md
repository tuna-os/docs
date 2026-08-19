---
sidebar_position: 6
title: "FACTORY STATUS"
---



Measured 2026-08-18T14:01:27+00:00 from the live published indexes;
provenance (repomd revision, primary.xml sha256) is in
`docs/factory-status.json`, which also carries the full built and
needed lists this page truncates.

A catalog entry is **built** when the target's published index
carries a binary or source package of that name, **needed** when it
does not. This is presence, not freshness — version-level staleness
needs catalog version pins, which most entries do not carry yet.

## el10

| arch | catalog entries | built | needed | index packages |
|---|---|---|---|---|
| x86_64 | 129 | 56 | 73 | 473 |

Needed on x86_64 (73; first 40, full list in the JSON):

```
cli11-devel
cosmic-bg
cosmic-comp
cosmic-greeter
cosmic-icon-theme
cosmic-idle
cosmic-notifications
cosmic-osd
cosmic-panel
cosmic-randr
cosmic-session
cosmic-settings
cosmic-settings-daemon
danksearch
dgop
dms
dms-cli
dms-greeter
evtest
exo
fprintd
garcon
greetd
gtk-layer-shell
gtkgreet
iio-niri
input-remapper
kairpods
krunner-bazaar
labwc
libfprint
libseat
libunwind-devel
libxfce4ui
libxfce4util
libxfce4windowing
mousepad
ninja-build
niri
oversteer-udev
```

## hummingbird

| arch | catalog entries | built | needed | index packages |
|---|---|---|---|---|
| aarch64 | 673 | 262 | 411 | 1358 |
| x86_64 | 673 | 570 | 103 | 7986 |

Needed on aarch64 (411; first 40, full list in the JSON):

```
ModemManager
NetworkManager-openconnect
NetworkManager-openvpn
NetworkManager-ssh
NetworkManager-vpnc
SDL3
SwayNotificationCenter
Thunar
accounts-qml-module
accountsservice
adwaita-icon-theme
adwaita-icon-theme-legacy
appstream
ark
assimp
at-spi2-core
atkmm
aurorae
baloo-widgets
blueman
bluez
cage
cairo
cairomm
cairomm1.16
cava
chromaprint
codec2
colord
colord-gtk
cosmic-app-library
cosmic-applets
cosmic-bg
cosmic-comp
cosmic-greeter
cosmic-idle
cosmic-initial-setup
cosmic-launcher
cosmic-notifications
cosmic-osd
```

Needed on x86_64 (103; first 40, full list in the JSON):

```
SwayNotificationCenter
Thunar
atkmm
blueman
cage
cosmic-settings-daemon
evolution-data-server
flatpak
fprintd
freerdp
gcr3
gdm
gnome-bluetooth
gnome-color-manager
gnome-control-center
gnome-desktop3
gnome-disk-utility
gnome-initial-setup
gnome-keyring
gnome-remote-desktop
gnome-session
gnome-shell
gnome-user-share
gpsd
gsound
gspell
gstreamer1-plugins-bad-free
gstreamer1-plugins-good
gtk-layer-shell
gtkgreet
gtkmm3.0
gtkmm4.0
gtksourceview4
hplip
kf6-knotifications
kpipewire
kwin
libcanberra
libdbusmenu
libffado
```

## hummingbird desktop coverage (x86_64)

`required_packages` roots from manifests/hummingbird-desktops.yaml
against the published index — the table that decides which
desktops tunaOS can wire (tunaOS#1755).

| desktop | roots present | missing |
|---|---|---|
| cosmic | 5/5 | — |
| gnome | 3/10 | gdm, gnome-control-center, gnome-initial-setup, gnome-session, gnome-shell, nautilus, … (7 total) |
| kde | 3/5 | plasma-desktop, plasma-workspace |
| niri | 3/6 | dms, dms-cli, dms-greeter |
| xfce | 1/6 | cage, gtkgreet, libxfce4ui, xfconf, xfwl4 |

## Not yet measured

These targets are NOT covered above — absence of a row is not
absence of a gap:

| target | format | catalog entries | why |
|---|---|---|---|
| arch | pkg.tar.zst | 21 | no published_index declared in package-factory.yaml |
| debian | deb | 43 | no published_index declared in package-factory.yaml |
| opensuse-tumbleweed | rpm | 8 | no published_index declared in package-factory.yaml |
| ubuntu | deb | 41 | no published_index declared in package-factory.yaml |
