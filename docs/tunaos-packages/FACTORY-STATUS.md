---
sidebar_position: 9
title: "FACTORY STATUS"
---



# Factory status — built vs needed, per target

Measured 2026-10-16T10:19:18+00:00 from the live published indexes;
provenance (repomd revision, primary.xml sha256) is in
`docs/factory-status.json`, which also carries the full built and
needed lists this page truncates.

A catalog entry is **built** when the target's published index
carries a binary or source package of that name, **needed** when it
does not. This is presence, not freshness — version-level staleness
needs catalog version pins, which most entries do not carry yet.

## Progress since the last measurement

Compared against 2026-10-15T10:09:50+00:00, the last measurement
that actually MERGED — so a large gap here means the daily
refresh is not landing, which is its own defect:

| target/arch | built Δ | needed Δ | no movement for | newly built |
|---|---|---|---|---|
| debian/amd64 | +1 | +0 | — | tuna-desktop |
| debian/arm64 | +1 | +0 | — | tuna-desktop |
| el10/aarch64 | +2 | -1 | — | gtk4-layer-shell, tuna-desktop |
| el10/x86_64 | +2 | -1 | — | gtk4-layer-shell, tuna-desktop |
| fedora/x86_64 | +1 | +0 | — | tuna-desktop |
| hummingbird/aarch64 | -5 | +19 | — | — |
| hummingbird/x86_64 | -4 | +18 | — | libao |
| opensuse-tumbleweed/aarch64 | +1 | +0 | — | tuna-desktop |
| opensuse-tumbleweed/x86_64 | +1 | +0 | — | tuna-desktop |
| ubuntu/amd64 | +1 | +0 | — | tuna-desktop |
| ubuntu/arm64 | +1 | +0 | — | tuna-desktop |

**Retired — built by the previous measurement, no longer in the catalog.** The target adopted them, so the factory stopped owing them; this is work REMOVED (RFC 011 criterion 2), and it is why `built` can fall without anything being lost:

- hummingbird/aarch64: NetworkManager-vpnc, libuser, python-six, usermode, vpnc
- hummingbird/x86_64: NetworkManager-vpnc, libuser, python-six, usermode, vpnc

## debian

| arch | catalog entries | built | needed | index packages |
|---|---|---|---|---|
| amd64 | 57 | 6 | 51 | 20 |
| arm64 | 57 | 6 | 51 | 20 |

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
| aarch64 | 145 | 44 | 101 | 64 |
| x86_64 | 145 | 115 | 30 | 439 |

Needed on aarch64 (101; first 40, full list in the JSON):

```
autoconf
avahi
cairo
cli11-devel
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
highway
iio-niri
input-remapper
krunner-bazaar
labwc
libadwaita
libei
libfprint
libgda
libgee
```

Needed on x86_64 (30):

```
cli11-devel
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
| x86_64 | 4 | 4 | 0 | 11 |

## hummingbird

| arch | catalog entries | built | needed | index packages |
|---|---|---|---|---|
| aarch64 | 679 | 620 | 59 | 3915 |
| x86_64 | 679 | 640 | 39 | 8821 |

Needed on aarch64 (59; first 40, full list in the JSON):

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
liberation-fonts
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

Needed on x86_64 (39):

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
liberation-fonts
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
rust-pathrs
samba
speech-dispatcher
stoken
tuna-desktop
vdirsyncer
webkitgtk
xfce4-settings
xfdesktop
```

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

## ubuntu

| arch | catalog entries | built | needed | index packages |
|---|---|---|---|---|
| amd64 | 56 | 6 | 50 | 12 |
| arm64 | 56 | 6 | 50 | 12 |

Needed on amd64 (50; first 40, full list in the JSON):

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

Needed on arm64 (50; first 40, full list in the JSON):

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
| tuna | 0/1 | tuna-desktop |
| xfce | 5/6 | xfwl4 |

## hummingbird desktop coverage (x86_64)

`required_packages` roots from manifests/hummingbird-desktops.yaml
against the published index — the table that decides which
desktops tunaOS can wire (tunaOS#1755).

| desktop | roots present | missing |
|---|---|---|
| bluefin | 59/77 | anaconda-live, bootc, bootupd, dracut-live, evolution-ews-core, firefox, … (18 total) |
| cosmic | 5/5 | — |
| gnome | 10/10 | — |
| kde | 5/5 | — |
| niri | 3/6 | dms, dms-cli, dms-greeter |
| tuna | 0/1 | tuna-desktop |
| xfce | 5/6 | xfwl4 |

## Not yet measured

These targets are NOT covered above — absence of a row is not
absence of a gap:

| target | format | catalog entries | why |
|---|---|---|---|
| arch | pkg.tar.zst | 28 | no published_index declared in package-factory.yaml |
| eln | rpm | 4 | no published_index declared in package-factory.yaml |
| rawhide | rpm | 1 | no published_index declared in package-factory.yaml |
| trixie | deb | 1 | no published_index declared in package-factory.yaml |
