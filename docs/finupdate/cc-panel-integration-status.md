---
sidebar_position: 9
title: "cc panel integration status"
---

Status of `build-aux/test-cc-panel-in-toolbox.sh` as of 2026-07-27, run in the
Fedora 43 `finupdate` toolbox against gnome-control-center `gnome-49`.

## What works

The script does everything it claims:

* installs `libfinupdate` into the toolbox's writable `/usr/local`;
* clones gnome-control-center, vendors `cc-panel/panels/updates/`, applies the
  loader + meson patches;
* **builds successfully** — `[791/793] Merging translations for
  panels/updates/gnome-updates-panel.desktop` confirms the panel compiles into
  the binary alongside the upstream panels (17 `cc_updates_panel` symbol
  references in the resulting executable);
* stages a prefix and writes a `run-cc.sh` launcher;
* regenerates `build-aux/cc-panel-patches/{cc-panel-loader,panels-meson}.patch`
  for the Dakota override element.

Launched under Broadway, GNOME Settings comes up and **"Software Updates"
appears at the top of the sidebar** with its icon and label
(`tests/gui/screenshots/light/cc-settings-sidebar.png`).

## What doesn't

Clicking the row selects it, but the content pane stays on whatever was
previously shown. The log says:

```
WARNING: The direct access to `updates` is now deprecated. Please, use `system updates` instead.
WARNING: Invalid subpage: 'updates'
```

## Root cause

`shell/cc-window.c:369` — when a panel resolves to `CC_CATEGORY_SYSTEM`, the
shell **rewrites the panel id to `"system"`** and passes the original id as a
*subpage* parameter:

```c
if (category == CC_CATEGORY_SYSTEM)
  {
    param_str = g_strdup_printf ("[<'%s'>]", start_id);
    system_param_overwrite = g_variant_new_parsed (param_str);
    g_warning ("The direct access to `%s` is now deprecated. ...", start_id, start_id);
    start_id = "system";
  }
```

`shell/cc-panel.c:123` then fails, because the System panel has no `updates`
subpage — GNOME 49 consolidated About / Date & Time / Region / Users into
System, and that is the machinery doing it.

The category is derived by `parse_categories()` from the `.desktop` file's
`Categories=` line. Ours declares:

```
Categories=GNOME;GTK;Settings;X-GNOME-Settings-Panel;X-GNOME-SystemSettings;
```

`X-GNOME-SystemSettings` is exactly what `panels/system/datetime` uses — i.e.
we are declaring ourselves a System *subpage*. A genuine top-level panel such
as `panels/display` uses `X-GNOME-DevicesSettings` instead.

So the panel is being correctly classified according to what it asks for; it
just asks for the wrong thing.

## The fix

Change `cc-panel/panels/updates/gnome-updates-panel.desktop.in` to a
non-System category — most likely `X-GNOME-DevicesSettings`, or whichever
`parse_categories()` branch places it where you want it in the sidebar
ordering.

Worth checking at the same time: `default_subpages[]` in
`shell/cc-panel-loader.c` lists the ids that *are* System subpages (`about`,
`datetime`, `region`, `users`). `updates` is deliberately not one of them, which
is consistent with wanting a top-level panel.

This was not a problem when the panel was first written — GNOME 49 reorganised
the shell. It is a one-line change, but it needs a rebuild to confirm, so it is
recorded here rather than guessed at.


---

# GNOME 50 / Fedora 44 — current state

## Platform

`gnome-control-center`'s `gnome-50` branch requires
`gsettings-desktop-schemas >= 50.alpha`. **Fedora 43 cannot build it** — it has
49.1 and meson fails at configure. Fedora 44 has 50.1 and configures cleanly.

Note that GTK and libadwaita versions are *not* a usable signal here: F43 and
F44 both report GTK 4.22.4 / libadwaita 1.9.2. Only the schemas package
distinguishes the platform. Build both with:

```sh
# GNOME 49 (Fedora 43)
build-aux/test-cc-panel-in-toolbox.sh

# GNOME 50 (Fedora 44) — the Dakota target
TOOLBOX=finupdate-f44 GBM_BRANCH=gnome-50 \
  WORKDIR=$PWD/target/cc-panel-f44 build-aux/test-cc-panel-in-toolbox.sh
```

Fedora 44 additionally needs `dnf builddep --allowerasing`: toolbox images ship
`systemd-standalone-tmpfiles`, which conflicts with the full `systemd` that
`colord-devel` pulls in. Now handled by the script.

## Fixed: the panel now loads

The `.desktop` category was changed from `X-GNOME-SystemSettings` to
`X-GNOME-DevicesSettings`. With that, the `Invalid subpage: 'updates'` error is
gone on GNOME 50 and the panel's backend genuinely runs inside
gnome-control-center — the log shows finupdate's own work happening:

```
changelog: phase=list_available_tags count=642
changelog: phase=list_versions count=8
changelog: phase=github_commits count=30
```

That is `finupdate_panel_widget_new` being called from `cc-updates-panel.c`.

## Fixed: the template resource was never registered

```
Gtk CRITICAL: Unable to load resource for composite template for type
  'CcUpdatesPanel': The resource at
  "/org/gnome/control-center/updates/cc-updates-panel.ui" does not exist
Gtk CRITICAL: gtk_widget_class_bind_template_child_full: assertion
  'widget_class->priv->template != NULL' failed
Adwaita CRITICAL: adw_bin_set_child: assertion 'ADW_IS_BIN (self)' failed
```

Those three are one bug, not three. `panels/updates/meson.build` compiles the
gresource into this panel's **static_library**, and the generated
auto-registration constructor sits in an object file nothing else references —
so the linker discards it. The template resource is then absent at runtime,
`bind_template_child` has no template to bind against, `content_bin` stays
NULL, and every `adw_bin_set_child()` asserts.

Fixed by registering explicitly in `class_init`, before
`set_template_from_resource`:

```c
g_resources_register (cc_updates_get_resource ());
```

(Note the generated API is `cc_updates_get_resource`, not
`cc_updates_register_resource` — meson's `export: true` exposes the getter.)

After this, both CRITICALs are gone: `grep -c "does not exist"` and
`grep -c ADW_IS_BIN` on the cc log are both 0.

## Broadway cannot render gnome-control-center 50 at all

The panel loads without error, but Broadway screenshots of the running
control-center come back blank. **This is the harness, not the panel.**

Discriminator: launch the patched gnome-50 control-center and capture it
*without touching the Updates panel*. The result is still completely blank —
no sidebar, no System page, nothing. That is all upstream code; our panel plays
no part in rendering it. The same harness renders gnome-control-center **49**
correctly (see `cc-settings-sidebar.png`), and renders finupdate itself and the
FFI panel widget correctly on both.

So Broadway + gnome-control-center 50 is the broken combination. A plausible
cause is the portal dependency — the log shows

```
Gdk: Cannot get portal org.freedesktop.host.portal.Registry version: Timeout was reached
```

— and cc 50 may harden its reliance on a session/compositor surface that the
Broadway backend does not provide.

### It is the portal, not the display backend

Xvfb (GTK's X11 backend) was tried as an alternative. Same result: cc 50 runs
but maps **zero windows** (`xwininfo -root -children` reports none), with the
same warning on both backends:

```
Gdk: Cannot get portal org.freedesktop.host.portal.Registry version: Timeout was reached
```

So this is not Broadway-specific and not a display-server problem.
**gnome-control-center 50 requires a working xdg-desktop-portal** and blocks
before presenting a window when it cannot reach one. No headless harness —
Broadway, Xvfb, or otherwise — will satisfy that, because the portal needs a
real session bus and a desktop environment behind it.

**Consequence for validating this panel:** it must be done in a full GNOME
session. A Fedora 44 VM running Workstation, with the patched binary copied in
(`run-cc.sh` already sets the staging XDG_DATA_DIRS and schema paths it needs),
or the system Settings hot-patched in place.

Neither build host has VM tooling: both are Bluefin (immutable), `libvirtd` is
inactive and qemu/virt-install are absent, though `/dev/kvm` exists on the
build host. So this needs either layering virt tooling onto a host, a toolbox
with qemu, or simply running the binary on a desktop machine.

The two fixes above remain confirmed only by the disappearance of their
CRITICALs from the log — necessary, not sufficient.

## Previously: the widget never gets parented

```
Adwaita CRITICAL: adw_bin_set_child: assertion 'ADW_IS_BIN (self)' failed
```

`self->content_bin` is NULL, so the template child binding is not taking
effect. `cc-updates-panel.ui` declares:

```xml
<template class="CcUpdatesPanel" parent="CcPanel">
  <child>
    <object class="AdwBin" id="content_bin"/>
  </child>
</template>
```

`CcPanel`'s child handling changed in GNOME 49/50 — a plain `<child>` no longer
lands where this code expects. Compare against a current in-tree panel's
`.ui` (e.g. `panels/display/`) to see the shape GNOME 50 expects, and check
whether `CcPanel` now wants the content set through a property rather than as a
template child.

Everything else is in place: the panel compiles into the binary, appears in the
sidebar, is selected without error, and its backend runs. This is the last
thing between that and a usable shipped panel.
