---
sidebar_position: 2
title: "Contributing"
---

Thank you for your interest in contributing to the XFCE Linux BuildStream project!

## Getting Started

### Prerequisites
- [just](https://just.systems/) (use a current release; Ubuntu 24.04's
  packaged version is too old for this repository's grouped recipes)
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
element from the appropriate composition element. Use a neighboring checked-in
element as the schema example; component definitions are BuildStream files, not
the `name`/`repo`/`checkout` mapping previously shown here. Local sources should
track upstream release tags unless the exception is documented in
[`docs/ci-and-iso-pipeline.md`](https://github.com/tuna-os/xfce-linux/blob/main/docs/ci-and-iso-pipeline.md#release-linked-sources).

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
[`docs/ci-and-iso-pipeline.md`](https://github.com/tuna-os/xfce-linux/blob/main/docs/ci-and-iso-pipeline.md#guard-rails-what-stops-a-bad-commit)
for the full pre-merge and post-merge gate sequence.

### 4. Documentation

Update relevant documentation:
- **Code changes:** docs/technical/
- **Build process:** docs/
- **Known issues:** docs/technical/SOLUTIONS_AND_ANALYSIS.md

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
- `refactor:` Code restructuring
- `build:` Build process changes
- `test:` Testing changes
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

Run the fast test suites before pushing:

```bash
bats tests/bats/*.bats
python3 -m pytest tests/pytest/ -v
```

### Boot Testing

```bash
# Start VM
just boot-vm

# Access via serial console (in another terminal)
telnet 127.0.0.1 4444

# Or via SSH (after boot)
ssh root@127.0.0.1 -p 2221

# Or via VNC
vncviewer 127.0.0.1:99
```

### Verify XFCE Installation

```bash
# List XFCE packages
dpkg -l | grep -i xfce

# Check XFCE binaries
ls /usr/bin | grep -E 'xfce|xf' | head -20

# Verify plugins
ls -la /usr/lib/x86_64-linux-gnu/xfce4/panel/plugins/

# Check GDM status
systemctl status gdm

# View XFCE log
journalctl -u xfce-session -n 50
```

## Known Issues & Solutions

See `docs/technical/SOLUTIONS_AND_ANALYSIS.md` for:
- Bootc multi-layer OCI issue (solutions provided)
- Artifact export dependency resolution
- SSH authentication workarounds

## Code Review Process

1. **Automated Checks:**
   - BATS and pytest test suites
   - Full BuildStream dependency-graph validation
   - Justfile parsing
   - ShellCheck, yamllint, actionlint, and Renovate configuration validation

2. **Manual Review:**
   - Check for completeness
   - Verify documentation
   - Test build locally

3. **Testing:**
   - Fast tests pass locally
   - Relevant image, ISO, or install tests pass for the scope of the change
   - No regressions

## Performance Considerations

- **Large builds take time:** 88-90 minutes typical
- **Cache is essential:** 127GB local cache with remotes
- **Network critical:** Build pulls from remote caches
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
- Check BuildStream artifacts exist
- Verify QEMU installation: `qemu-system-x86_64 --version`
- Check KVM availability: `kvm-ok` or `grep vmx /proc/cpuinfo`

## Documentation Standards

- Use Markdown for all documentation
- Include code examples where helpful
- Keep README.md up-to-date
- Document breaking changes clearly
- Update SOLUTIONS_AND_ANALYSIS.md with new findings

## Questions?

1. **Check documentation first:** See `docs/` directory
2. **Review build logs:** `~/.cache/buildstream/logs/`
3. **Check git history:** Previous commits for context
4. **See SOLUTIONS_AND_ANALYSIS.md:** Known issues documented

## License

This project integrates open-source components with various licenses (GPL, LGPL, MIT). Ensure contributions respect these licenses.

---

**Happy Contributing!** 🚀

For more information, see:
- docs/README.md — Main guide
- docs/PROJECT_STATUS.md — Current status
- docs/ci-and-iso-pipeline.md — CI, ISO, install-test, and release pipeline
- docs/technical/SOLUTIONS_AND_ANALYSIS.md — Known issues & solutions
