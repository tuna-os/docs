---
sidebar_position: 6
title: "FACTORY STATUS"
---



Measured 2026-09-05T09:11:39+00:00 from the live published indexes;
provenance (repomd revision, primary.xml sha256) is in
`docs/factory-status.json`, which also carries the full built and
needed lists this page truncates.

A catalog entry is **built** when the target's published index
carries a binary or source package of that name, **needed** when it
does not. This is presence, not freshness — version-level staleness
needs catalog version pins, which most entries do not carry yet.

## Progress since the last measurement

Compared against 2026-09-02T09:47:13+00:00, the last measurement
that actually MERGED — so a large gap here means the daily
refresh is not landing, which is its own defect:

| target/arch | built Δ | needed Δ | no movement for | newly built |
|---|---|---|---|---|
| debian/amd64 | +0 | +0 | 11 days | — |
| debian/arm64 | +0 | +0 | 11 days | — |
| el10/aarch64 | +0 | +0 | 11 days | — |
| el10/x86_64 | +0 | +0 | 2 days | — |
| fedora/x86_64 | +0 | +0 | ≥ 15 days | — |
| hummingbird/aarch64 | -9 | -104 | — | SwayNotificationCenter, Thunar, appstream, at-spi2-core, atkmm, blueman, … (77 total) |
| hummingbird/x86_64 | -93 | -20 | — | SwayNotificationCenter, gnome-disk-utility, gtksourceview4, libdbusmenu, libhandy, python-aiohappyeyeballs, … (15 total) |
| opensuse-tumbleweed/aarch64 | +0 | +0 | 2 days | — |
| opensuse-tumbleweed/x86_64 | +0 | +0 | 2 days | — |
| ubuntu/amd64 | +0 | +0 | 11 days | — |
| ubuntu/arm64 | +0 | +0 | 11 days | — |

**Retired — built by the previous measurement, no longer in the catalog.** The target adopted them, so the factory stopped owing them; this is work REMOVED (RFC 011 criterion 2), and it is why `built` can fall without anything being lost:

- hummingbird/aarch64: accountsservice, adw-gtk3-theme, adwaita-fonts, alsa-firmware, alsa-tools, augeas, chrony, containerd, ddcutil, distrobox, evtest, fastfetch, … (86 total)
- hummingbird/x86_64: accountsservice, adw-gtk3-theme, adwaita-fonts, alsa-firmware, alsa-tools, augeas, chrony, containerd, ddcutil, distrobox, evtest, fastfetch, … (108 total)

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
| aarch64 | 665 | 624 | 41 | 3905 |
| x86_64 | 665 | 643 | 22 | 8811 |

Needed on aarch64 (41; first 40, full list in the JSON):

```
cockpit
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
kf6-kcoreaddons
kf6-kguiaddons
kf6-kjobwidgets
kf6-knotifications
kf6-kstatusnotifieritem
kf6-kunitconversion
kf6-kwidgetsaddons
kf6-kxmlgui
libayatana-ido
libcanberra
libosinfo
libphonenumber
librist
libsoup3
libvorbis
libvpl
libxfce4util
nautilus
pavucontrol
plasma-desktop
plasma-workspace
qt6-qtmultimedia
qt6-qtwebengine
samba
stoken
vdirsyncer
xfce4-settings
```

Needed on x86_64 (22):

```
cockpit
evolution-data-server
evolution-ews
firefox
fprintd
gnome-user-share
gpsd
grub2
gstreamer1-plugins-bad-free
libcanberra
libosinfo
libphonenumber
librist
libvorbis
libxfce4util
qt6-qtwebengine
samba
stoken
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
| bluefin | 49/77 | anaconda-live, bootc, bootupd, dracut-live, evolution-ews-core, firefox, … (28 total) |
| cosmic | 5/5 | — |
| gnome | 1/10 | gdm, gnome-control-center, gnome-initial-setup, gnome-session, gnome-settings-daemon, gnome-shell, … (9 total) |
| kde | 3/5 | plasma-desktop, plasma-workspace |
| niri | 3/6 | dms, dms-cli, dms-greeter |
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
| xfce | 5/6 | xfwl4 |

## Not yet measured

These targets are NOT covered above — absence of a row is not
absence of a gap:

| target | format | catalog entries | why |
|---|---|---|---|
| arch | pkg.tar.zst | 26 | no published_index declared in package-factory.yaml |
