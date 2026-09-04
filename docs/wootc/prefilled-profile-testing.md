---
sidebar_position: 29
title: "prefilled profile testing"
---

To ensure that users don't lose capabilities when moving from Windows to Linux, wootc migration testing exercises a comprehensive "typical" Windows user profile across unit, integration, and E2E tiers (#277).

## Profile Data Architecture

A realistic Windows user environment contains much more than a flat `Documents` directory. The test fixture model includes:

| Category | Windows Source Path | Migration Target / Behavior |
|---|---|---|
| **Documents & Files** | `%USERPROFILE%\Documents`, `Pictures`, `Downloads`, `Music`, `Videos`, `Desktop` | User Data Bridge bind-mounts into `$HOME` (`/run/wootc/host/Users/<user>`) |
| **Google Chrome** | `%LOCALAPPDATA%\Google\Chrome\User Data\Default\` (`Bookmarks`, `History`) | Bookmarks & history copied into Linux Chrome / Chromium config |
| **Microsoft Edge** | `%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\` (`Bookmarks`, `History`) | Bookmarks & history imported into Linux browser configuration |
| **Mozilla Firefox** | `%APPDATA%\Mozilla\Firefox\` (`profiles.ini`, `places.sqlite`, `logins.json`, `extensions.json`) | Full profile copy into `$HOME/.mozilla/firefox/windows-import.wootc` |
| **MS Office / Productivity** | `%APPDATA%\Microsoft\UProof\CUSTOM.DIC`, `Templates\*.dotx`, `Fonts\*.ttf` | Custom dictionary merged into LibreOffice `standard.dic`, templates copied to `template/`, fonts to `~/.local/share/fonts/`, LibreOffice default saving set to OOXML (`.docx`, `.xlsx`, `.pptx`) |
| **Visual Studio Code** | `%APPDATA%\Code\User\` (`settings.json`, `keybindings.json`, `snippets/`), `%USERPROFILE%\.vscode\extensions\` | Settings, keybindings, snippets copied to `~/.config/Code/User/`, extension list saved to `vscode-extensions.txt` for reinstall |
| **Communications** | Discord, Slack, Spotify, Telegram Desktop | App detection identifies installed clients; session classification indicates `portable` (Telegram `tdata`) or `signin` (cloud-backed Discord/Spotify/Slack) |
| **Creative / Media** | VLC, GIMP, OBS Studio | Config/scene structures identified and mapped to Flathub package IDs in `bridge-apps.json` |
| **Gaming** | Steam (`C:\Program Files (x86)\Steam\steamapps\libraryfolders.vdf`) | Steam library directories registered with Linux Steam |
| **Registry Manifest** | `HKCU`/`HKLM` Uninstall keys, `UrlAssociations` (default browser/mail), `Run` keys | Scanned by `programs_windows.go` into `C:\wootc\install\programs.json` and merged by `wootc-detect-apps` |
| **Personalization** | Wallpapers, Dark Mode theme keys, DWM accent color | Harvested by `slurp_windows.go` into `slurp.json` and applied by `wootc-apply-look` |

## Test Implementation & Execution

### 1. Fast Unit Tier (Sub-Second)
- `tests/unit/test_prefilled_profile.py`: Python standalone unit test verifying the prefilled profile data structure, app detection mapping, browser format parsing, office dictionary extraction, and manifest discovery.
- `tests/unit/prefilled-profile.bats`: Bats unit test verifying migration scripts against a pre-filled profile fixture.

Run via:
```bash
tests/run.sh fast
```

### 2. Slow Integration Tier (Containerized)
- `tests/migration/test-bridge.sh`: Containerized integration test running in a Fedora container. Tests `wootc-detect-apps`, `wootc-import-browser`, `wootc-office-bridge`, `wootc-steam-bridge`, `wootc-wsl-bridge`, `wootc-manifest`, and `wootc-mount-user-dirs` against realistic multi-app profile fixtures.

Run via:
```bash
tests/run.sh slow
```

### 3. End-to-End VM Tier
- `tests/e2e/seed-profile.ps1`: Automated PowerShell profile generator run inside Windows VMs before deployer reboot.
- `tests/e2e/run-e2e.sh`: Stages `seed-profile.ps1` into `C:\OEM` and executes it in `seed_user_data()` during the Windows phase, then verifies file visibility and app detection in Phase 2.
- `tests/e2e/phase1/assert-phase1.ps1`: Asserts Phase-1 state including `programs.json` registry extraction and profile preconditions.
