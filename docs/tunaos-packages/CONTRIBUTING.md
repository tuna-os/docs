---
sidebar_position: 3
title: "Contributing"
---

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USER/github-copr.git`
3. Create a feature branch: `git checkout -b my-feature`

## Adding a New Package

### 1. Create the Source Directory

```bash
mkdir -p src/my-package-1.0.0
```

### 2. Create the Spec File

Create `src/my-package.spec`:

```spec
Name:           my-package
Version:        1.0.0
Release:        1%{?dist}
Summary:        My package description
License:        MIT
URL:            https://example.com
Source0:        %{name}-%{version}.tar.gz

%description
My package description.

%prep
%autosetup

%build
# Build commands

%install
# Install commands

%files
# Files to package

%changelog
* Thu Mar 12 2026 Your Name <you@example.com> - 1.0.0-1
- Initial package
```

### 3. Create Source Files

Add your source code to `src/my-package-1.0.0/`

### 4. Create Tarball

```bash
cd src
tar -czf my-package-1.0.0.tar.gz my-package-1.0.0
```

### 5. Test Build

```bash
./scripts/build-local.sh my-package fedora-43-x86_64
```

### 6. Commit and Push

```bash
git add src/
git commit -m "Add my-package"
git push origin main
```

## Adding New Build Targets

To add support for a new distribution:

1. Check if mock-core-configs supports it:
   ```bash
   docker run --rm fedora:43 bash -c "dnf install -y mock-core-configs && ls /etc/mock/" | grep <distro>
   ```

2. Update `justfile` with new target recipes

3. Update `.github/workflows/build.yml` with new targets

4. Test: `just build <new-target>`

## Code Style

- Shell scripts: Use `set -euo pipefail`
- Python: Follow PEP 8
- YAML: 2 spaces indentation
- Commit messages: Imperative mood ("Add feature" not "Added feature")

## Testing

Before submitting a PR:

```bash
# Test all x86_64 targets
just build-x86_64

# Test specific target
./scripts/build-local.sh <package> <target>

# Verify GPG setup
just verify-gpg
```

## Pull Request Process

1. Update documentation if needed
2. Test locally if possible
3. Push to your fork
4. Open PR with clear description
5. Ensure CI passes

## Package Naming Conventions

- Use lowercase, hyphens: `my-package` not `MyPackage`
- Match upstream name when possible
- Version in spec should match upstream release
- Use semantic versioning

## Security

- Never commit secrets or keys
- Use GitHub Secrets for sensitive data
- GPG keys should be in `.gitignore`
