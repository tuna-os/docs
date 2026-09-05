---
sidebar_position: 6
title: "FACTORY STATUS"
---



Measured 2026-09-02T09:47:13+00:00 from the live published indexes;
provenance (repomd revision, primary.xml sha256) is in
`docs/factory-status.json`, which also carries the full built and
needed lists this page truncates.

A catalog entry is **built** when the target's published index
carries a binary or source package of that name, **needed** when it
does not. This is presence, not freshness — version-level staleness
needs catalog version pins, which most entries do not carry yet.

## Progress since the last measurement

Compared against 2026-08-26T05:58:10+00:00, the last measurement
that actually MERGED — so a large gap here means the daily
refresh is not landing, which is its own defect:

> **⚠ the previous measurement is 7 days old.** The refresh PR is not merging; every delta
> below spans that whole window, and nothing in between
> was recorded.

| target/arch | built Δ | needed Δ | no movement for | newly built |
|---|---|---|---|---|
| debian/amd64 | +0 | +1 | 8 days | — |
| debian/arm64 | +0 | +1 | 8 days | — |
| el10/aarch64 | +0 | +2 | 8 days | — |
| el10/x86_64 | +2 | +0 | — | libnotify, tecla |
| fedora/x86_64 | +0 | +0 | ≥ 12 days | — |
| hummingbird/aarch64 | +371 | -266 | — | ModemManager, NetworkManager-openconnect, NetworkManager-openvpn, NetworkManager-ssh, NetworkManager-vpnc, SDL3, … (373 total) |
| hummingbird/x86_64 | +166 | -61 | — | Thunar, adwaita-fonts, alsa-firmware, alsa-tools, anaconda-webui, atkmm, … (169 total) |
| opensuse-tumbleweed/aarch64 | +10 | +9 | newly measured | cpptrace-devel, danksearch, dgop, dms, dms-cli, dms-greeter, … (10 total) |
| opensuse-tumbleweed/x86_64 | +10 | +9 | newly measured | cpptrace-devel, danksearch, dgop, dms, dms-cli, dms-greeter, … (10 total) |
| ubuntu/amd64 | +0 | +2 | 8 days | — |
| ubuntu/arm64 | +0 | +2 | 8 days | — |

**REGRESSED — served by the previous measurement, absent now.** This is the repo-wipe shape (#124) caught at measurement time; treat it as an incident, not a statistic:

- hummingbird/aarch64: google-noto-emoji-fonts, jsoncpp
- hummingbird/x86_64: google-noto-emoji-fonts, jsoncpp, mako

## debian

| arch | catalog entries | built | needed | index packages |
|---|---|---|---|---|
| amd64 | 45 | 5 | 40 | 16 |
| arm64 | 45 | 5 | 40 | 16 |

Needed on amd64 (40):

```
bazaar
cli11-devel
cosmic-bg
cosmic-comp
cosmic-greeter
cosmic-idle
cosmic-notifications
cosmic-osd
cosmic-session
cosmic-settings
cosmic-settings-daemon
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
mutter
ninja-build
niri
oversteer-udev
quickshell
uupd
wayland-protocols
xdg-desktop-portal-cosmic
xfconf
xfwl4
```

Needed on arm64 (40):

```
bazaar
cli11-devel
cosmic-bg
cosmic-comp
cosmic-greeter
cosmic-idle
cosmic-notifications
cosmic-osd
cosmic-session
cosmic-settings
cosmic-settings-daemon
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
mutter
ninja-build
niri
oversteer-udev
quickshell
uupd
wayland-protocols
xdg-desktop-portal-cosmic
xfconf
xfwl4
```

## el10

| arch | catalog entries | built | needed | index packages |
|---|---|---|---|---|
| aarch64 | 132 | 20 | 112 | 39 |
| x86_64 | 132 | 98 | 34 | 421 |

Needed on aarch64 (112; first 40, full list in the JSON):

```
autoconf
avahi
cairo
cli11-devel
cosmic-bg
cosmic-comp
cosmic-greeter
cosmic-icon-theme
cosmic-idle
cosmic-notifications
cosmic-osd
cosmic-session
cosmic-settings
cosmic-settings-daemon
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
graphviz
gsettings-desktop-schemas
gtk4
gtkgreet
harfbuzz
```

Needed on x86_64 (34):

```
cli11-devel
cosmic-greeter
cosmic-session
cosmic-settings
cosmic-settings-daemon
dms
dms-cli
dms-greeter
fprintd
gdk-pixbuf2
gnome-desktop3
gnome-initial-setup
graphviz
harfbuzz
highway
iio-niri
input-remapper
krunner-bazaar
labwc
libfprint
libgda
libgee
libglib-testing
libsoup
libzip
malcontent
ptyxis
quickshell
simdutf
sqlcipher
vala
vte291
xdg-desktop-portal
xdg-desktop-portal-gnome
```

## fedora

| arch | catalog entries | built | needed | index packages |
|---|---|---|---|---|
| x86_64 | 3 | 3 | 0 | 10 |

## hummingbird

| arch | catalog entries | built | needed | index packages |
|---|---|---|---|---|
| aarch64 | 778 | 633 | 145 | 3424 |
| x86_64 | 778 | 736 | 42 | 8738 |

Needed on aarch64 (145; first 40, full list in the JSON):

```
SwayNotificationCenter
Thunar
anaconda
appstream
at-spi2-core
atkmm
blueman
cockpit
evolution-data-server
evolution-ews
firefox
fprintd
fwupd
gcr
gcr3
gdm
glycin
gnome-bluetooth
gnome-color-manager
gnome-control-center
gnome-desktop3
gnome-disk-utility
gnome-initial-setup
gnome-keyring
gnome-online-accounts
gnome-session
gnome-settings-daemon
gnome-shell
gnome-user-share
gpsd
grub2
gsound
gspell
gssdp
gstreamer1-plugins-bad-free
gstreamer1-plugins-base
gstreamer1-plugins-good
gtk-layer-shell
gtk2
gtk3
```

Needed on x86_64 (42; first 40, full list in the JSON):

```
SwayNotificationCenter
anaconda
cockpit
evolution-data-server
evolution-ews
firefox
fprintd
gnome-disk-utility
gnome-user-share
gpsd
grub2
gstreamer1-plugins-bad-free
gtksourceview4
libcanberra
libdbusmenu
libffado
libhandy
libosinfo
libphonenumber
libratbag
libreport
librist
libvorbis
libxfce4util
mozc
python-aiohappyeyeballs
python-aiosignal
python-bugzilla
python-dbus-next
python-meh
python-pydantic
python-pydantic-core
qt6-qtwebengine
samba
stoken
udisks2
vdirsyncer
webkitgtk
xfce4-settings
xfdesktop
```

## opensuse-tumbleweed

| arch | catalog entries | built | needed | index packages |
|---|---|---|---|---|
| aarch64 | 19 | 10 | 9 | 21 |
| x86_64 | 19 | 10 | 9 | 21 |

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

## ubuntu

| arch | catalog entries | built | needed | index packages |
|---|---|---|---|---|
| amd64 | 44 | 5 | 39 | 10 |
| arm64 | 44 | 5 | 39 | 10 |

Needed on amd64 (39):

```
bazaar
cli11-devel
cosmic-bg
cosmic-comp
cosmic-greeter
cosmic-idle
cosmic-notifications
cosmic-osd
cosmic-session
cosmic-settings
cosmic-settings-daemon
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
ninja-build
niri
oversteer-udev
quickshell
uupd
wayland-protocols
xdg-desktop-portal-cosmic
xfconf
xfwl4
```

Needed on arm64 (39):

```
bazaar
cli11-devel
cosmic-bg
cosmic-comp
cosmic-greeter
cosmic-idle
cosmic-notifications
cosmic-osd
cosmic-session
cosmic-settings
cosmic-settings-daemon
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
ninja-build
niri
oversteer-udev
quickshell
uupd
wayland-protocols
xdg-desktop-portal-cosmic
xfconf
xfwl4
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
| bluefin | 48/77 | anaconda-live, bootc, bootupd, dracut-live, evolution-ews-core, firefox, … (29 total) |
| cosmic | 5/5 | — |
| gnome | 1/10 | gdm, gnome-control-center, gnome-initial-setup, gnome-session, gnome-settings-daemon, gnome-shell, … (9 total) |
| kde | 3/5 | plasma-desktop, plasma-workspace |
| niri | 2/6 | dms, dms-cli, dms-greeter, niri |
| xfce | 2/6 | gtkgreet, libxfce4ui, xfconf, xfwl4 |

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
| xfce | 5/6 | xfwl4 |

## Not yet measured

These targets are NOT covered above — absence of a row is not
absence of a gap:

| target | format | catalog entries | why |
|---|---|---|---|
| arch | pkg.tar.zst | 26 | no published_index declared in package-factory.yaml |
