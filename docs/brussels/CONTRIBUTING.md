---
sidebar_position: 2
title: "Contributing"
---

Thank you for your interest in the BuildStream project for XFCE Linux!

## Contribute compute — no code needed

**[Donate time with your AI CLI](https://hub.tunaos.org/#contribute).**

Your machine runs one task at a time using your signed-in AI coding CLI.
The relay alternates between eligible **School** (OS) and **Reef** (apps)
hives after each task. If one hive has no work, the other can continue.

The guide covers prerequisites, verified `just` setup, credentials, provider
costs, and how to stop with Ctrl+C. Your subscription quota or API charges apply.
Never post account credentials or API keys in issues or pull requests.

## Getting Started

### Prerequisites

- The [`just`](https://just.systems/) command runner. Use a current release.
  Ubuntu 24.04 has a version that is too old for the grouped recipes.
- BuildStream 2.7.0+ or Podman for the repository's `bst2` container
- Podman
- QEMU + KVM
- 200GB+ free disk space
- Git, Python 3, pytest, and BATS

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/tuna-os/xfce-linux.git
cd xfce-linux

# Verify the recipe files parse
just --summary >/dev/null
just --evaluate >/dev/null

# Run the fast local tests
bats tests/bats/*.bats
python3 -m pytest tests/pytest/ -v

# Verify Podman
podman --version
```

## Development Workflow

### 1. Creating a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Making Changes

#### Adding XFCE Components

Add the component's BuildStream element under `elements/`, then reference that
element from the appropriate composition element. Use a checked-in element in
the same directory as the schema example. Component definitions are BuildStream
files, not the `name`/`repo`/`checkout` map that this guide showed before. Local
sources should use release tags from upstream. Document exceptions in
[`docs/ci-and-iso-pipeline.md`](https://github.com/tuna-os/brussels/blob/main/docs/ci-and-iso-pipeline.md#release-linked-sources).

#### Modifying Element Definitions

1. Edit relevant `.bst` file in `elements/`
2. Validate syntax: `bst show elements/your-element.bst`
3. Test build: `bst build elements/your-element.bst`

#### Adding Patches

1. Create patch file in `patches/freedesktop-sdk/` or `patches/gnome-build-meta/`
2. Reference in patch_queue sources
3. Test: `just build`

### 3. Testing Changes

```bash
# Unit and functional tests (the same commands used by CI)
bats tests/bats/*.bats
python3 -m pytest tests/pytest/ -v

# Verify the justfiles parse
just --summary >/dev/null
just --evaluate >/dev/null

# Validate the complete BuildStream graph
bst --no-interactive show --deps all oci/xfce-linux.bst >/dev/null

# Full rebuild (if major changes)
just build

# Validate the exported image
just lint
```

Shell, YAML, workflow, and Renovate changes are also checked by ShellCheck,
yamllint, actionlint, and `renovate-config-validator` in CI. See
[`docs/ci-and-iso-pipeline.md`](https://github.com/tuna-os/brussels/blob/main/docs/ci-and-iso-pipeline.md#guard-rails-what-stops-a-bad-commit)
for the full pre-merge and post-merge gate sequence.

Two other CI checks can fail a pull request:

- The `actions-security` workflow verifies `.github/workflows/actions.lock`
  and scans the workflows with zizmor. If you change a `uses:` line in a
  workflow, update `actions.lock` in the same pull request.
- The `Prose` workflow (`ste.yml`) checks `README.md`, `CONTRIBUTING.md`,
  `SECURITY.md` and the files in `docs/` against Simplified Technical English.
  The budget in `.ste-budget` is `0`, so one new STE problem in these files
  makes the check fail. To run the same linter, you need Node.js and a clone
  of [tuna-os/.github](https://github.com/tuna-os/.github). From the root of
  this repository, run:

  ```bash
  node ../.github/.github/actions/ste-lint/ste-lint.mjs --max 0
  ```

  Change `../.github` if you cloned tuna-os/.github to a different directory.

### 4. Documentation

Update relevant documentation:

- **CI/ISO bugs:** docs/ci-and-iso-pipeline.md (add an invariant test too)
- **Build process:** docs/, AGENTS.md
- **Architecture decisions:** docs/adr/

### 5. Commit and Push

```bash
git add -A
git commit -s -m "Description of changes

- Detailed list of changes
- Second point
- Third point"

git push origin feature/your-feature-name
```

## Commit Message Guidelines

Use clear, descriptive commit messages:

```
type(scope): Short description

Detailed explanation of what and why.

- Bullet point 1
- Bullet point 2
- Bullet point 3

Fixes: #issue-number (if applicable)
```

### Commit Types

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code structure changes
- `build:` Build process changes
- `test:` Test changes
- `chore:` Maintenance

## Build System

### Using `just` Commands

```bash
# Show available commands
just --list

# Build phases
just build              # Full OCI build
just export             # Export to image
just generate-bootable-image  # Create bootable disk
just boot-vm            # Launch QEMU VM

# Development
just clean              # Clean cache
just logs               # View logs
just --list             # List all available recipes
```

### BuildStream Commands

```bash
# Show element details
bst show elements/path/to/element.bst

# Build specific element
bst build elements/path/to/element.bst

# Build with progress
bst build --progress tty elements/path/to/element.bst

# Cache information
bst artifact show <artifact-id>

# View logs
bst log <artifact-id>
```

## Project Structure

```
xfce-linux/
├── docs/                    # Documentation
├── elements/                # BuildStream elements
│   ├── core/               # XFCE core
│   ├── xfce-linux/         # Integration layer
│   └── oci/                # OCI composition
├── patches/                # BuildStream patches
├── files/                  # Build-time files
├── scripts/                # Build scripts
├── tools/                  # Development tools
└── Justfile                # Build automation
```

## Testing

Run the fast test suites before you push:

```bash
bats tests/bats/*.bats
python3 -m pytest tests/pytest/ -v
```

### Boot Testing

`just boot-vm` boots `bootable.raw` (run `just generate-bootable-image` first).
It takes one of two paths, which the host selects, and each path has a
**different** set of endpoints. Read the recipe's output before you connect.

**Native QEMU** (used when `qemu-system-x86_64` is on `PATH`):

```bash
# Start VM (daemonized)
just boot-vm

# Serial console on ttyS0 (in another terminal)
telnet 127.0.0.1 4445

# Serial debug shell on ttyS1
telnet 127.0.0.1 4447

# SSH (after boot)
ssh root@127.0.0.1 -p 2223

# VNC — QEMU display :1, i.e. TCP 5901
vncviewer 127.0.0.1:1
```

QEMU exposes its monitor as a Unix socket at `./qemu-monitor.sock`, not as a
TCP port.

`sshd` is enabled, but the image ships no authorized keys and keeps OpenSSH's
default `PermitRootLogin prohibit-password`, so `ssh root@` fails with
`Permission denied (publickey)` until you add your own key. Log in on the serial
console first and append your public key to `/root/.ssh/authorized_keys`.

**Podman fallback** (used when `qemu-system-x86_64` is missing): the recipe runs
`ghcr.io/qemus/qemu:latest` instead, and prints a web/VNC URL on the first free
port from `8006` upward. The container forwards SSH on `127.0.0.1:2222`, not
2223.

### Verify XFCE Installation

The image is built from source by BuildStream on a freedesktop-sdk base
(`gnome-build-meta.bst:oci/gnomeos/stack.bst`). There is **no package manager
and no dpkg database inside the guest**. Examine the filesystem and systemd
instead.

```bash
# Check XFCE binaries
ls /usr/bin | grep -E 'xfce|xf' | head -20

# Inspect the XFCE library tree (panel plugins live under here)
ls -la /usr/lib/xfce4/

# Check the display manager
systemctl status gdm

# View greeter/session logs — the session is 'xfwl4' (wayland-sessions/xfwl4.desktop), started by GDM;
# there is no xfce-session unit
journalctl -u gdm -n 50
```

## Known Issues & Solutions

See [`docs/ci-and-iso-pipeline.md`](https://github.com/tuna-os/brussels/blob/main/docs/ci-and-iso-pipeline.md) for the
current CI/ISO problem log. `docs/technical/SOLUTIONS_AND_ANALYSIS.md` is a
dated (2026-05) session report kept for history, not a live issue tracker.

## Code Review Process

1. **Automated Checks:**
   - BATS and pytest test suites
   - Validation of the full dependency graph in BuildStream
   - Justfile syntax checks
   - ShellCheck, yamllint, actionlint, and Renovate configuration validation

2. **Manual Review:**
   - Check for completeness
   - Verify documentation
   - Test build locally

3. **Tests:**
   - Make sure that you pass the fast tests on your machine
   - Relevant image, ISO, or install tests pass for the scope of the change
   - No regressions

## Performance Considerations

- **Large builds take time:** 88-90 minutes typical
- **Cache is essential:** 127GB local cache with remotes
- **Important network access:** The build pulls from remote caches
- **Disk space:** ~200GB for cache + artifacts

## Troubleshooting

### Build Fails

```bash
# Check logs
bst log <artifact-id>

# View build directory
bst shell elements/path/to/element.bst

# Clean and retry
just clean
just build
```

### Elements Don't Load

```bash
# Validate all elements
bst show elements/

# Check specific element
bst show elements/path/to/element.bst

# View dependencies
bst show --deps elements/path/to/element.bst
```

### VM Boot Issues

- Make sure that artifacts from BuildStream exist
- Verify QEMU installation: `qemu-system-x86_64 --version`
- Check KVM availability: `kvm-ok` or `grep vmx /proc/cpuinfo`

## Documentation Standards

- Use Markdown for all documentation
- Include code examples where helpful
- Keep README.md up-to-date
- Clearly document incompatible changes
- Update docs/ci-and-iso-pipeline.md when you fix a CI or ISO bug. Add an
  invariant test and a row there, per AGENTS.md's CI gate rules.

## Questions?

1. **Check documentation first:** See `docs/` directory
2. **Review build logs:** `~/.cache/buildstream/logs/`
3. **Check git history:** Previous commits for context
4. **See docs/ci-and-iso-pipeline.md:** the CI/ISO problem log

## License

This project includes open-source components with various licenses (GPL, LGPL,
MIT). Make sure that contributions comply with these licenses.

---

**Thank you for your contribution!** 🚀

For more information, see:

- docs/README.md — Documentation index
- AGENTS.md — Architecture, commands, and gotchas
- docs/ci-and-iso-pipeline.md — CI, ISO, install-test, and release pipeline
