---
sidebar_position: 4
title: "DESIGN AUDIT"
---

Scope: the five installer frontends as captured by the screenshot
walkthroughs in `docs/walkthrough/` (the pixels a user sees, not the
`DESIGN.md` intent), judged against the apps a user of that desktop already
knows: GNOME Initial Setup and the GNOME HIG; Plasma's Kirigami apps, KDE
Initial System Setup and the KDE HIG; COSMIC Initial Setup and COSMIC
Settings; DankMaterialShell (DMS) on niri; Xfce's own GTK 3 dialogs and the
Xubuntu Calamares installer.

Two caveats on the captures. They run under Xvfb/offscreen on a CI runner
with no desktop fonts, so every frontend renders in DejaVu Sans instead of
Adwaita Sans, Noto Sans, Fira Sans or Inter; typography remarks below are
about sizes and hierarchy, not the face. And the fixtures are canned
(demo disks, a fake log), so empty or odd data is called out only where the
layout itself is at fault.

Severity: **P1** users will notice or be misled; **P2** visibly not native;
**P3** polish.

## Summary

| Frontend | Native fit | Biggest gap |
|---|---|---|
| COSMIC | closest to native | placeholder icon on Welcome, window controls on a kiosk |
| XFCE | close | Back button live during and after the install |
| GNOME | mostly native widgets, un-native copy | Confirm page hides what will be erased behind a joke |
| KDE | native widgets, empty pages | no progress bar, no reboot, no imagery |
| Niri | unthemed Qt Quick | DESIGN.md and code describe two different apps; controls are stock Basic style |

Cross-frontend issues (step order, encryption choices, done-page actions,
destructive styling, copy) are in the last section and are the cheapest
wins because `shared/walkthrough/contract` already names the screens.

## GNOME (root, GTK4 + libadwaita) vs GNOME Initial Setup

What it gets right: `AdwCarousel` pages with a back chevron, `Next` and the
window controls in a flat header, `AdwStatusPage`-shaped pages (icon, title,
one-line description, a boxed list), `AdwSwitchRow`/`AdwPasswordEntryRow`
for encryption, pill buttons, a recovery-key page with a copy button and a
"I have saved" gate. That is the Initial Setup vocabulary.

Findings:

- **P1 Confirm page (06).** Title "Confirm Installation", subtitle
  `"Indeed." — Commander Zavala`, body "Whether we wanted it or not, we've
  stepped into a war with your old OS.", button **Become Legend**. The HIG
  asks for plain, literal copy on destructive steps and a button that names
  the action. The summary also omits the two facts the user must check:
  the disk that will be erased and the image that will be installed (only
  hostname and encryption are listed). Replace with an `AdwPreferencesGroup`
  listing Disk, Image, Filesystem, Encryption, Hostname, an `AdwBanner`
  "Everything on /dev/nvme0n1 will be erased", and an **Install** button
  with the `destructive-action` style class. Keep the Destiny lines for an
  about-dialog Easter egg if wanted.
- **P1 Install Location (03).** Two competing primary actions: **Use Entire
  Disk** (suggested, centred) and **Next** (header, disabled). Initial Setup
  has one forward action per page. Make the row selection enable `Next`, or
  keep the button and drop `Next` from the header on this page.
- **P2 Install Location (03).** The page icon is a raster-scaled
  `dialog-warning` and renders blurred at 128 px. Use a symbolic icon
  (`drive-harddisk-symbolic`) through `AdwStatusPage.icon-name`, which is
  crisp at any size. The "Virtual disk" row puts its radio on the right while
  the real disks have it on the left; align them. The "System" group header
  is cut off at the bottom, so the page scrolls for a hidden section: either
  fold the advanced options into an `AdwExpanderRow` or move them to the
  encryption page.
- **P2 Phone Companion (02).** The full URL with a URL-encoded token is
  printed as a link under the QR placeholder and overflows the clamp. Show
  only the QR code and a short host:port line; the token belongs in the QR.
- **P2 Progress (07).** The page is empty apart from a strip at the very
  bottom: title, two grey lines, a progress bar and two small icon buttons.
  Initial Setup and GNOME Software centre the status: use an
  `AdwStatusPage` with a spinner or the step name as title, the progress bar
  inside a clamp, and the log behind a toggle. "0:00 elapsed" in the fixture
  suggests the timer starts before the install starts; verify.
- **P3 Welcome (01).** "Press Super+Alt+S to enable the screen reader" as a
  bare caption is fine, but Initial Setup exposes accessibility through the
  header menu; consider the same. "Credits" as a link label should be an
  `AdwAboutDialog` entry in the header menu (the code already has one).
- **P3 Header.** Three header icons (users, info, close) plus `Next` on every
  page is denser than Initial Setup, which shows only back, title and
  `Next`. Fold users/info into a single menu button.

## KDE (Qt6 + Kirigami + FormCard) vs Plasma apps and the KDE HIG

What it gets right: `Kirigami.Page` with the page title in the header,
`FormCard` groups for the disk list, encryption choice, passphrase fields
and the summary, `Kirigami.InlineMessage` for the erase warnings, mnemonics
on Back/Next, a scrollable monospace log. This is the current Plasma
System Settings and KISS vocabulary and it reads native.

Findings:

- **P1 Progress (05).** No progress bar and no step counter, only the log.
  Plasma Discover and KISS always show a `QQC2.ProgressBar`; fisherman
  emits `[n/9]` so the value is known. Add the bar above the log and a
  "Step 6 of 9: Installing image" heading, and disable window close during
  the install.
- **P1 Done (06).** Only **Close**. The other frontends reboot from here;
  KDE users expect a `Kirigami.Action` **Restart now** as the main action
  and **Close** as secondary. Also the header says "Finished" and the body
  says "Installation complete": keep one heading (Kirigami pages already
  have the title in the header) and add a `Kirigami.Icon`
  (`dialog-ok`/`checkmark`) at `Kirigami.Units.iconSizes.enormous`.
- **P2 Welcome (01).** The header title "Welcome" and the body heading
  "Install TunaOS" both exist, and the page is otherwise empty. KISS and
  Plasma Welcome use a hero image or the distro logo, a single heading and
  the description. Drop one heading and add the logo.
- **P2 Encryption (03).** Only "No encryption" and "Passphrase". GNOME and
  Niri offer TPM and TPM+passphrase from the same fisherman recipe; the
  KDE page should offer the same set (FormRadioDelegate makes this two
  more rows) and show the passphrase card only when a passphrase type is
  selected (it already does).
- **P2 Navigation buttons.** Back/Next are bare `QQC2.Button`s in the page
  corners. Kirigami's convention is the page `footer` with a
  `QQC2.DialogButtonBox` or `Kirigami.Action`s, which also gives the right
  spacing and keyboard focus order. The current buttons also lack the
  `highlighted` (default) property on the forward action.
- **P3 Confirm (04).** Values in the summary are `FormTextDelegate`
  descriptions in grey; the disk and image are the two facts to read, so
  put them in the delegate `text` and the label in `description`, or use
  `Kirigami.Heading level: 4` for the disk. Consider a `Kirigami.Theme`
  negative-coloured **Install** (KDE marks destructive buttons with
  `icon.name: "edit-delete"` and `Kirigami.Theme.negativeTextColor`).
- **P3 Disk (02).** The three disks list `/dev/…` first and the model second;
  Plasma's partition manager and Discover show the model first with the
  device as description. Swap the two lines.

## COSMIC (Rust + libcosmic) vs COSMIC Initial Setup and COSMIC Settings

What it gets right: nearly everything. A header that carries "Step n of 6 ·
name" and a progress bar in the title area, `widget::settings::section`
groups with COSMIC Settings' rounded rows, dropdowns for filesystem and
encryption, a warning row with an icon, pill buttons with the accent
colour, a red **Install**, monospace log in a container, "Do not power off"
in the warning colour, a large check on the done page. This is the frontend
the others should copy for structure.

Findings:

- **P2 Welcome (01).** The page icon is a placeholder glyph (a rounded
  square with a circle, the look of a missing image). Use the distro logo
  or `widget::icon::from_name("drive-harddisk-symbolic")` at 96 px.
- **P2 Window controls.** Minimise, maximise and close are shown. COSMIC
  Initial Setup runs as a fixed, non-minimisable window; hide the buttons
  through the window settings and make the header non-draggable while the
  install runs (page 05 still shows all three).
- **P2 Disk (02).** The disk list container is a fixed dark panel that fills
  the page even with two rows. Size the `list_column` to its content and let
  the page breathe, as Settings does.
- **P3 Confirm (04).** Rows are label-left/value-right like Settings, good;
  the "Image" value "ghcr.io/tuna-os/albacore:gnome (this system — no
  download)" is one long string. Put "This system, no download" in the
  row description.
- **P3 Progress (05).** The progress bar renders as a sliding segment (an
  indeterminate look) although fisherman's step count gives a determinate
  value. Feed `[n/9]` to the bar and show "Step n of 9" beside it.
- **P3 Done (06).** The green title is fine; add a **Restart** primary
  button next to **Close** (Initial Setup ends with a single strong action).

## Niri (Quickshell QML + Go) vs DankMaterialShell

`frontends/niri/DESIGN.md` describes a teal "instrument panel" (`#0A0E12`
backdrop, `#2EC4B6` sonar accent, Inter + JetBrains Mono, a scrolling
column strip that peeks the previous and next step, a keybinding hint bar).
`ui/Theme.qml` mirrors DankMaterialShell's stock Material 3 dark tokens
instead (`surface #1a1c1e`, `primary #42a5f5`, 12 px corner radius, DMS
spacing scale) and says so in its header. The captures show the second
palette with none of the first's structure. Decide which app this is; the
Theme.qml direction is right (the README says the installer is modelled
on DMS and runs inside a DMS session), so rewrite DESIGN.md to match it and
finish the DMS look. Findings assume that choice.

- **P1 Unthemed controls (all pages).** Buttons are stock Qt Quick Controls
  "Basic" grey rectangles with a 1 px border, radios and text fields are
  Basic too. DMS surfaces are rounded (`Theme.cornerRadius`), buttons are
  filled `primary` pills with `primaryText`, or `surfaceContainerHigh` for
  secondary, and inputs sit on `surfaceContainer`. Either ship four small
  components (DankButton, DankRadio, DankTextField, DankCard) built from
  `Rectangle` + `Theme`, or set `QT_QUICK_CONTROLS_STYLE=Material` and map
  `Material.accent`/`Material.background` from `Theme` at startup.
- **P1 Disk page (02).** The page shows only the title and warning although
  the capture's stub backend returns two disks. The rows are stock
  `ItemDelegate`s, whose Basic-style text colour is near-black, drawn on the
  dark `Theme.surface`: the disks are there and invisible. The confirm page
  then shows "Target Disk: —" because nothing could be clicked. Give the
  delegate `contentItem: Text { color: Theme.surfaceText }` and a
  `surfaceContainerHigh` highlight, or replace it with a DankCard row. A
  first-boot user cannot pick a disk today; `tests/e2e/run.py` passes only
  because it sets `selectedDisk` directly.
- **P2 No page padding (02–05).** Titles start at x=0, y=0 and Back/Continue
  sit flush in the corners. Each page's `ColumnLayout` sets
  `anchors.margins: 40` without `anchors.fill: parent`, and inside a
  `StackLayout` that margin is a no-op. DMS panels use `spacingL`/`spacingXL`
  margins and content on a `surfaceContainer` card: set `anchors.fill:
  parent` with `anchors.margins: Theme.spacingXL`, or wrap each page in a
  card.
- **P2 No step indicator, no hint bar.** DESIGN.md promised a step strip and
  a live keybinding bar; neither exists. A DMS-style top bar ("Step 2 of 6 ·
  Disk") and a bottom hint row ("Enter continue · Shift+Enter back") cost
  little and are what niri users expect from their shell.
- **P2 Typography.** `installer.qml` sets no `font.family`, so the app takes
  whatever Qt finds; DMS defaults to Inter for UI with a monospace face for
  data. Add `Theme.fontFamily` and bundle Inter in the Flatpak, as DESIGN.md
  already planned. Titles at 28 px in `primary` blue read as links; DMS
  titles are `surfaceText` at `fontSizeXLarge` with weight 600.
- **P2 Hostname (04).** Editable only inline on the confirm page. Move it to
  the encryption/options step so the confirm page is read-only like the
  other four frontends.
- **P3 Progress (05).** Log only; add a determinate bar in `primary` from
  the `[n/9]` lines, and the "Do not power off" line in `Theme.warning`.
- **P3 Done (06).** "✓ Installation Complete" as a text glyph; use a proper
  icon and add **Restart** (the Go backend can run `systemctl reboot`).

## XFCE (GTK 3 + PyGObject) vs Xfce dialogs and Xubuntu Calamares

What it gets right: the plainest toolkit use of the five and the closest to
its `DESIGN.md`: a step strip ("trawl line") with a knot per page,
`GtkRadioButton` rows with a grey description line, an erase warning with
`dialog-warning`, hostname and account in a labelled `GtkFrame`, a
monospace aligned summary, `GtkProgressBar` with the percentage, a visible
log, a full-width **Reboot** button. Calamares in Xubuntu is the obvious
peer and this is simpler and clearer than it.

Findings:

- **P1 Back during install (07) and after (08).** The footer keeps an active
  **Back** on the progress page while fisherman writes the disk, and again
  on the done page. Calamares and GtkAssistant hide Back once the commit
  starts. Make it insensitive on 07 and remove it on 08.
- **P2 Step strip.** Eight unlabelled dots. GtkAssistant shows page titles in
  a sidebar and Calamares a labelled step list; a tooltip or a label under
  the current knot ("3 of 8 · Destination") keeps the strip cheap and adds
  orientation. Check the teal `#2EC4B6` line against Greybird-dark and
  Adwaita-dark; `DESIGN.md` names a dark variant but the capture is light
  only.
- **P2 Encryption (04).** Same two-option gap as KDE (no TPM choices) even
  though fisherman and the recipe schema support them; the page title
  "Filesystem and encryption" promises a filesystem choice that is hidden
  under **Advanced**. Either surface it or retitle the page "Disk encryption".
- **P3 Identity (05).** Empty username/full name/password fields are
  accepted by **Next** in the capture; Calamares validates inline. Show a
  `GtkLabel` hint under the frame and disable Next until the password is
  confirmed (there is no confirm field; add one).
- **P3 Source (02).** Image refs as descriptions (`ghcr.io/…`) are right for
  this audience, but the page title "What do you want to install?" is the
  only question-form title in the wizard; "Choose what to install" matches
  the other pages.

## Cross-frontend

These are contract-level, so fix them in `shared/` once and let the parity
report enforce them.

1. **Step order and count.** GNOME 9 pages (welcome, phone, disk, slurp,
   encryption, confirm, progress, recovery key, done), XFCE 8 (adds source,
   identity), KDE/COSMIC/Niri 6. Users moving between TunaOS spins meet
   three different wizards. Agree one canonical order (Welcome → Disk →
   Options/Encryption → Identity → Confirm → Progress → Done, optional
   screens inserted only where the frontend supports the feature) and put
   it in `shared/walkthrough/contract`.
2. **Encryption choices.** GNOME: switch + hardware toggle; Niri: four
   radios (none, passphrase, TPM, TPM+passphrase); COSMIC: dropdown; KDE
   and XFCE: two radios. The recipe supports all four; every frontend
   should offer all four with the same four descriptions.
3. **Confirm summary.** GNOME shows hostname and encryption only; KDE,
   COSMIC, Niri and XFCE show disk, filesystem, encryption, hostname,
   image. Make the five rows mandatory in the contract and check them in
   `parity_report.py`.
4. **Destructive action.** COSMIC styles **Install** as destructive; the
   others use a plain or suggested button (GNOME's is blue and labelled
   "Become Legend"). Every toolkit has a destructive style
   (`destructive-action`, `Kirigami.Theme.negativeTextColor`,
   `cosmic::theme::Button::Destructive`, `Theme.error`, GTK 3
   `destructive-action`); use it, label it **Install**, and precede it with
   the disk name in the warning.
5. **Done page actions.** GNOME: Show Log + Reboot Now; XFCE: Reboot; KDE,
   COSMIC, Niri: Close only. Offer **Restart now** everywhere (fisherman
   has finished; `systemctl reboot` through the frontend's privileged
   path) with Close secondary.
6. **Copy.** Eleven variants of "everything on the disk will be erased" and
   four of "remove the installation media". `frontends/cosmic/src/ui.rs`
   already keeps its strings in a `copy` module; lift that into
   `shared/copy/strings.json` and have each frontend load or generate from
   it, so the parity report's keyword check becomes an exact-string check.
7. **Progress.** Only XFCE and COSMIC show a determinate bar; fisherman
   emits `[n/9]` and a `cumulative_pct` field, so all five can.
8. **Fonts in captures.** Install Adwaita Sans/Noto/Inter on the capture
   runners (`fonts-noto-core`, `fonts-inter`) so the walkthrough shows the
   faces users will see; today every screenshot is DejaVu.

## Suggested order of work

1. Niri disk list (functional), XFCE Back during install, GNOME confirm
   page: one small PR each, all P1.
2. Contract items 2, 3, 5 (encryption set, summary rows, restart action):
   one PR touching all five with the parity report updated.
3. Niri theming pass (components + padding + step bar): one PR, with a new
   capture to compare.
4. KDE progress bar and done page; COSMIC icon and window controls; GNOME
   progress page: polish PRs.
