---
sidebar_position: 2
title: "Architecture"
---

How the parts fit together. For features and known bugs see
[`TODO.md`](https://github.com/tuna-os/tacklebox/blob/main/TODO.md); for the SuperISO/tacklebox unification roadmap
see [`../PLAN-merge.md`](https://github.com/tuna-os/tacklebox/blob/main/../PLAN-merge.md).

## What tacklebox does

Tacklebox produces **multi-boot media** from one or more bootc images.
A "media" is one of three things, picked at build time:

1. A loop **disk image** (`.img`) — for QEMU testing or `dd`-to-USB.
2. A real **block device** (`/dev/sdX`) — provisioned in place. Destructive.
3. A UEFI-bootable **ISO** (`.iso`) — for distribution / installer media.

Every media has the same logical layout regardless of target type:

- An **ESP** (FAT) holding `systemd-boot` + per-env kernel/initrd + BLS entries.
- A **shared store** holding each env's content (ostree deployments for
  block targets; `<env>.rootfs.sfs` squashfs files for ISOs).
- (block only) A **persist partition** for cross-env user state.

Each *bootable environment* is independently bootable from the systemd-boot
menu. Today envs install via either `bootc install to-filesystem` (block
targets, ostree or composefs) or `podman image mount` + `mksquashfs` (ISO
targets, dmsquash-live).

## Code layout

```
tacklebox/
├── cmd/tacklebox/             # CLI entry points (cobra subcommands)
│   ├── main.go                # root command + persistent --output-base flag
│   ├── build.go               # the `build` orchestrator
│   ├── update.go              # the `update` command (host-side USB refresh)
│   ├── update_all.go          # `update-all` boot-time cross-env updater
│   ├── status.go              # the `status` command (inspect installed envs)
│   └── verify.go              # the `verify` regression-checker
├── internal/
│   ├── recipe/                # JSON recipe schema
│   ├── target/                # Target interface + implementations
│   │   ├── target.go          # interface + Mountpoints + InstallMode enum
│   │   ├── block.go           # BlockTarget (loop image / /dev/*)
│   │   └── iso.go             # IsoTarget (.iso)
│   ├── install/               # per-env install backends
│   │   ├── bootc.go           # `bootc install to-filesystem` (block)
│   │   ├── live.go            # podman image mount + mksquashfs (ISO)
│   │   ├── initramfs.go       # initramfs preparation + dracut rebuild + cache
│   │   └── bootloader.go      # systemd-boot install + BLS entry writer
│   ├── blockdev/              # sgdisk + mkfs wrappers
│   └── runner/                # subprocess wrapper (verbose toggle, sudo)
├── src/
│   ├── dracut/95tbox-root/    # initramfs module (per-env root pivot)
│   └── systemd/               # boot-time updater units
├── examples/                  # human-curated example recipes
├── fixtures/                  # CI fixture recipes
└── .github/workflows/ci.yml   # lint-test + verify-smoke pipeline
```

## The build flow

`tacklebox build <recipe.json> [TARGET | --iso PATH]` runs in `cmd/tacklebox/build.go`:

1. **Parse** the recipe into `recipe.MediaRecipe`.
2. **Validate** — bootable_envs is non-empty, size parses, target arg shape sane.
3. **Pre-flight warnings** — free-space + per-env store-sizing estimates.
4. **Pick a Target**:
   - `--iso` → `IsoTarget`
   - `/dev/*` arg → `BlockTarget` provisioning a real device
   - no arg → `BlockTarget` with a loop image
5. **`Target.Prepare(track)`** returns `Mountpoints{EspMount, StoreMount}`.
   - BlockTarget: `truncate` + `losetup` + `sgdisk` + `mkfs` + `mount` ESP+STORE + `bootctl install`.
   - IsoTarget: scratch `iso-root/` + `esp-staging/` dirs.
6. **Pre-pull** all unique image refs in parallel.
7. **Initramfs preparation** (`install.PrepareInitramfs`), per env:
   - Compute cache key from OCI image digest + required module set.
   - **Cache hit** (`<output-base>/initramfs-cache/<key>.img`): use as-is, no rebuild.
   - **Cache miss**: run `dracut` inside a privileged container derived from the
     image, bind-mounting `src/dracut/95tbox-root/` in. Module set is determined
     by target type — ISO: `[dmsquash-live, tbox-root]`; Block: `[tbox-root]`.
     Write result to cache keyed by digest so subsequent builds are instant.
   - Skipped entirely when `"skip_initramfs_rebuild": true` is set on the env
     (use this for images that already ship the required modules).
8. **Per-env install loop** (`installEnv`), dispatched on `Target.InstallMode()`:
   - `Bootc`: `podman run … <image> bootc install to-filesystem … --stateroot <env> /target`,
     followed by `ExtractBootFiles` (vmlinuz + initrd into the ESP).
   - `Live`: `podman image mount` + `mksquashfs` into `LiveOS/<env>.rootfs.sfs`,
     followed by `ExtractBootFiles` into `images/pxeboot/<env>/`.
   - Both: write a BLS entry under `loader/entries/<env>.conf`.
9. **`Target.Finalize(track)`** returns the artifact path.
   - BlockTarget: unmount + detach loop. Returns the .img / device path.
   - IsoTarget: extract sd-boot from EFISource, mirror pxeboot to iso-root,
     `mkfs.fat` + mtools the ESP image, run `xorriso` to wrap iso-root.

## The Target interface

```go
type Target interface {
    Prepare(track Track) (*Mountpoints, error)
    Finalize(track Track) (string, error) // returns artifact path
    Cleanup()                              // idempotent

    InstallMode() InstallMode    // Bootc | Live — picks the per-env backend
    KernelPath(envID) string     // BLS-relative path for `linux=`
    InitrdPath(envID) string     // BLS-relative path for `initrd=`
}
```

Mountpoints are the rendezvous between the orchestrator and the per-env
install code:

- `EspMount` — where BLS entries + per-env kernels are written.
- `StoreMount` — where each env's content (ostree deploy or .sfs file) goes.

The orchestrator never touches partitioning or disk-vs-ISO specifics
beyond constructing the right Target; conversely, Targets never touch
recipes or per-env install logic. That separation is what makes adding
a new output type (e.g. PXE netboot, OCI archive) a self-contained job.

## The dracut module: `95tbox-root`

`src/dracut/95tbox-root/` ships in **each env's initramfs** (the
SuperISO live containers `--add tbox-root` to `dracut`). Its job at
boot time, for **block targets only**:

1. Read `tacklebox.root=tbox-install/<env>` from the kernel cmdline.
2. Bind-mount `/sysroot/<env>` over `/sysroot` so `ostree-prepare-root`
   sees the per-env subtree as the root.
3. Optionally overlay `/home` from the persist partition.

For ISO targets, this module is a no-op (no `tacklebox.root=` arg);
`dmsquash-live` does the equivalent work via `rd.live.squashimg=`.

The unit ordering took two iterations (see git log around 2026-05-11):
the service is symlinked into both `initrd-root-fs.target.wants/` AND
`ostree-prepare-root.service.requires/` so the `Before=` edge holds even
when `ostree-prepare-root.service` is started outside the target's
transaction.

## The verify command

`tacklebox verify <path>` (`cmd/tacklebox/verify.go`) sanity-checks a
built artifact. Auto-detects type by `.iso` suffix:

- **ISO**: extract `/EFI/efi.img` via `xorriso`, list BLS entries via
  `mtools`, hash each `LiveOS/<env>.rootfs.sfs` for distinctness.
- **Block**: `losetup --partscan --read-only` + mount ESP/STORE,
  enumerate BLS entries, walk per-env `ostree/deploy/<env>/deploy/`
  for distinctness.

The distinctness check is the regression baseline for the cross-env
collision bug (see TODO.md §Bugs). Two envs sharing one ostree commit
hash → exit 1.

## The `update` command

`tacklebox update <recipe.json> <target>` (`cmd/tacklebox/update.go`) re-installs
every bootable environment on an existing media **without** reformatting or wiping
`TBOX_PERSIST`. The difference from `build`:

- No partitioning (`sgdisk`, `mkfs`) — the ESP and STORE are mounted and reused.
- Each env's `tbox-install/<id>` subtree is cleared and repopulated via the same
  `bootc install to-filesystem` pipeline as `build`.
- BLS entries for envs present in the recipe are overwritten; entries for envs NOT
  in the recipe are left untouched (additive).

Use this when you change an image ref in the recipe, add a new env, or want to
refresh stale deployments without erasing user persistence data.

## Cross-env updates: the boot-time timer

When a tacklebox media has multiple envs, only the booted one normally
gets `bootc upgrade`'d. To keep all envs current the user would have to
boot into each one. The `tacklebox-update-all` machinery automates this.

Three pieces:

1. **`tacklebox update-all`** Go command (`cmd/tacklebox/update_all.go`).
   Reads `/etc/tacklebox/recipe.json` (written by `tacklebox build`),
   discovers TBOX_STORE via `findmnt LABEL=…`, and for each env in the
   recipe:
   - **Booted env** (matched via `tacklebox.root=` kernel arg):
     `bootc upgrade --apply`.
   - **Other envs**: `ostree container image pull` into that env's
     repo + `ostree admin deploy --sysroot=<env>` to stage. The next
     reboot into that env finalizes via bootc as usual.
2. **`src/systemd/tacklebox-update-all.service`** — Type=oneshot,
   `StandardOutput=journal+console` so the image refs print at boot.
3. **`src/systemd/tacklebox-update-all.timer`** — `OnBootSec=2min`,
   one-shot per boot, `Persistent=false` (don't catch up on missed runs).

`tacklebox build` installs the binary + units + recipe + enable symlink
into each env's deployment at install time (`provisionUpdateSystem`).
Updates are best-effort and never block boot; failures log but exit 0.

## The CI pipeline

`.github/workflows/ci.yml` runs on every push/PR:

- **`lint-test`** (~2 min) — `go vet`, `go test`, `go build`,
  JSON-schema parse of every recipe, shellcheck the dracut module.
- **`verify-smoke`** (~10-15 min) — builds a 10 GB two-env block image
  from `centos-bootc:stream10` + `fedora-bootc:42`, runs `tacklebox
  verify` and `tacklebox status` against it.
- **Stage 4 Boot Smoke** — boots the `verify-smoke` image in QEMU (via
  TCG) and asserts that the boot menu, kernel, and initramfs (with
  `tbox-root` pivot) all work by grepping the serial console for success
  patterns.

## Key invariants

- **Each env is a separate stateroot.** `bootc install --stateroot <env>`
  writes to `<store>/tbox-install/<env>/ostree/`. Envs never share an
  ostree repo, only the partition they live on.
- **The shared store is content-distinct.** If two envs end up with
  identical ostree commit hashes, that's the cross-env collision bug
  (currently open) — verify will catch it.
- **The bootloader is single.** One ESP, one `loader.conf`, one
  systemd-boot binary. Each env gets one BLS entry per `mode` listed
  in the recipe.
- **The recipe is the source of truth.** `tacklebox build` consumes it,
  `tacklebox verify` doesn't (verify reads what's actually on disk),
  `tacklebox update-all` reads a copy persisted to `/etc/tacklebox/`.
- **Targets don't know about recipes.** `BlockTarget` and `IsoTarget`
  take pre-computed inputs (partition layout, output paths, EFI source
  image); the orchestrator is the only thing that bridges recipe and
  Target.

## Where to look when something breaks

| Symptom                                          | First file to read                      |
| ------------------------------------------------ | --------------------------------------- |
| Build dies during partitioning                   | `internal/blockdev/format.go`           |
| Build dies inside `bootc install`                | `internal/install/bootc.go`             |
| Build dies during ISO assembly                   | `internal/target/iso.go`                |
| BLS entry exists but kernel/initrd missing       | `cmd/tacklebox/build.go` (`installEnv`) |
| Boot stalls at `ostree-prepare-root`             | `src/dracut/95tbox-root/*`              |
| Boot stalls at `dracut-initqueue` on a live ISO  | `cmd/tacklebox/build.go` (`buildLiveKernelCmdline`) — overlay flag syntax |
| Two envs end up with the same content            | bootc upstream bug; see TODO.md §Bugs   |
| `tacklebox verify` flags something               | The check name maps 1:1 to a section of `cmd/tacklebox/verify.go` |
