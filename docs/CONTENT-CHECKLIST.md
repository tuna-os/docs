# Outreach Content Checklist

Before opening a pull request with guide content (blog posts, adoption guides, user documentation), verify each claim against the repository's actual capabilities. This checklist prevents rejected PRs and wasted maintainer review time.

## Image References

- [ ] Every container image reference uses the correct form: `ghcr.io/tuna-os/<variant>:<desktop>` or `ghcr.io/tuna-os/<variant>:<desktop>-<hardware>`
  - **Correct:** `ghcr.io/tuna-os/albacore:gnome`, `ghcr.io/tuna-os/albacore:gnome-nvidia`
  - **Incorrect:** `ghcr.io/tuna-os/albacore-gnome:latest`, `ghcr.io/tuna-os/tunaos-albacore:latest`
  - Reference: [`docs/IMAGE-TAGS.md`](./IMAGE-TAGS.md)
- [ ] Every variant mentioned exists in the published matrix
  - Reference: [`docs/README.md`](./README.md) variant table, or run `grep "variant:" docs/*/README.md`

## Preinstalled Software & Toolchains

- [ ] Every package, toolchain, or runtime claimed as preinstalled is verified against the source manifests
  - **How to verify:** Check `manifests/<variant>/`, `build_scripts/`, or `system_files/` in the tunaos repository for the package name
  - **If not found:** Rewrite the claim to say how a user *installs* it, not that it ships preinstalled
  - Example: ❌ "Rust development is preinstalled" → ✅ "Install Rust with `rustup`; Cargo is available in the base repos"
  - Reference: [`tuna-os/tunaos` repository structure](https://github.com/tuna-os/tunaos)

## Hardware & Architecture Support

- [ ] Hardware support statements cite official documentation
  - Reference: [`docs/HARDWARE.md`](./HARDWARE.md)
- [ ] Experimental or beta hardware (e.g., Apple Silicon / `gnome-asahi`) is labeled as such
  - **Example:** "Apple Silicon support is experimental; only GNOME flavors are tested"
  - Reference: [`docs/HARDWARE.md` Apple Silicon section](./HARDWARE.md)
- [ ] ARM/AArch64 claims are qualified by specific SoC or board (e.g., Snapdragon X Elite, Raspberry Pi, not generic "ARM")

## Variant & Feature Readiness

- [ ] No claims about variant stability without citing the green matrix
  - Reference: [`docs/MATRIX-STATUS.md`](./MATRIX-STATUS.md) and [`docs/GREEN-CRITERIA.md`](./GREEN-CRITERIA.md)
- [ ] Experimental or rolling variants are clearly marked
  - Example: "bonito-rawhide is a rolling variant and may be unstable"

## Regulatory & Compliance Language

- [ ] **No regulatory or compliance claims** — do not use the words "compliant," "certified," "conformant," "ready for," or "satisfies" in relation to HIPAA, PCI DSS, GDPR, SOC 2, FedRAMP, FIPS, or any other regulatory regime
  - Software features are not proof of organizational compliance; this requires human legal review
  - Flag any regulatory language for a human reviewer before opening the PR
  - Reference: [`CONTRIBUTING.md` — Outreach guidelines](../CONTRIBUTING.md)

## Documentation & Discoverability

- [ ] The new content file is added to the appropriate section in [`docs/README.md`](./README.md)
  - If it's a new guide category, add it to the table of contents
  - Verify the path and link are correct by checking the live preview

## Roadmap & Future Commitments

- [ ] No future versions, dates, or integrations are promised unless already committed in a human-authored issue, release plan, or official announcement
  - Example: ❌ "TunaOS will add X in Q4" → ✅ "TunaOS Q4 roadmap includes X (ref: #1234)"
  - If you're unsure whether something is committed, ask a human before writing it

## Pre-Submission Review

1. **Self-check:** Go through each item above for your content
2. **Grep verification:** For any package or feature, confirm with:
   ```bash
   grep -r "package-name" /path/to/tunaos/manifests/ /path/to/tunaos/build_scripts/ /path/to/tunaos/system_files/
   ```
3. **Link check:** Verify all internal cross-references (e.g., `docs/IMAGE-TAGS.md`) are correct paths
4. **Claim evidence:** In your PR body, cite the exact file, test, or release that backs each claim (e.g., `manifests/albacore/gnome.containerfile` line 42)

---

*See also:* [`CONTRIBUTING.md`](../CONTRIBUTING.md) for general contribution guidelines.
