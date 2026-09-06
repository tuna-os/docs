# justfile — Build, test, and lint the TunaOS docs site (Docusaurus)
# Wraps the npm scripts in package.json; test/lint mirror the checks CI
# runs in .github/workflows/lint.yml.

# ── Configuration ───────────────────────────────────────────────────────

default:
    @just --list

# ── Setup & build ──────────────────────────────────────────────────────

# Install dependencies (same as bootstrap.yml)
install:
    npm ci

# Build the static site into build/
build:
    npm run build

# Start the local development server with hot reload
start:
    npm run start

# Serve the built site (after just build)
serve:
    npm run serve

# Typecheck the TypeScript sources (tsconfig.json)
typecheck:
    npm run typecheck

# Alias for typecheck
check: typecheck

# ── Checks (mirror .github/workflows/lint.yml) ─────────────────────────

# Run the Node.js unit tests for scripts/
test:
    #!/usr/bin/env bash
    set -euo pipefail
    FAILED=0
    for f in scripts/__tests__/*.test.mjs scripts/*.test.mjs; do
        [[ -f "$f" ]] || continue
        echo "  Running: $f"
        node "$f" || FAILED=1
    done
    exit $FAILED

# Lint markdown and Node.js scripts, and enforce the STE budget.
# Needs markdownlint-cli (npm install -g markdownlint-cli), like lint.yml.
lint:
    #!/usr/bin/env bash
    set -euo pipefail
    markdownlint 'docs/**/*.md' '*.md' \
        --ignore docs/docs/tacklebox \
        --disable MD013 MD033 MD041 || \
        echo "NOTE: markdownlint found issues — review and fix"
    FAILED=0
    for f in scripts/*.mjs scripts/*.js; do
        [[ -f "$f" ]] || continue
        [[ "$f" == *.test.mjs ]] && continue
        echo "  Checking: $f"
        node --check "$f" 2>/dev/null || FAILED=1
    done
    just ste
    exit $FAILED

# Simplified Technical English check. The linter lives in tuna-os/.github and
# is shared by every repo in the org, so it is fetched rather than vendored --
# a second copy here is a copy that drifts. Cached between runs; delete the
# cache directory to force a refresh.
ste:
    #!/usr/bin/env bash
    set -euo pipefail
    src=https://raw.githubusercontent.com/tuna-os/.github/main/.github/actions/ste-lint
    dir="${XDG_CACHE_HOME:-$HOME/.cache}/tuna-os/ste-lint"
    mkdir -p "$dir"
    for f in ste-lint.mjs ste-rules.mjs; do
        [ -f "$dir/$f" ] || curl -fsSL "$src/$f" -o "$dir/$f"
    done
    node "$dir/ste-lint.mjs" --summary
    node "$dir/ste-lint.mjs" --max "$(cat .ste-budget)" >/dev/null

# Verify package names used in documented Homebrew install commands.
check-install-commands:
    node scripts/check-install-commands.mjs

# Run the checks CI runs on PRs
preflight: check lint test check-install-commands
