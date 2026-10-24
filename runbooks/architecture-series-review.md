# Architecture and adoption series: editorial review

Source issue: [tuna-os/tunaos#3301](https://github.com/tuna-os/tunaos/issues/3301).

## Scope and publication

Three linked drafts cover the proposed first three posts. The architecture
post also covers the bootc trade-offs proposed for the optional fourth post.
There is no invented first-year history, founder quotation, adopter result,
or upstream contribution claim. A separate historical case study needs named
human sources and verified outcomes before it can be written.

| Draft | Audience | Outline |
| --- | --- | --- |
| [Choosing a variant](../blog/2026-10-24-choosing-your-tunaos-variant.md) | First-time users | Base comparison, desktop choice, image naming, download and verification, install, compatible-host switch, pilot evidence |
| [Architecture](../blog/2026-10-24-cloud-native-desktop-architecture.md) | Infrastructure teams | Build graph, storage boundary, atomic deployment, rollback limits, overlays, provenance versus reproducibility |
| [Multi-variant strategy](../blog/2026-10-24-multi-variant-strategy.md) | Distribution teams | Configuration ownership, package-family differences, CI dependencies, cell-level tests, lifecycle, contribution workflow |

These are review drafts, with shorter copy than the proposed final word targets
(1,500 / 2,000 / 1,800). Review the technical scope before expanding them with
measured pilot examples. Do not pad them with unsupported capabilities.

The issue explicitly requests blog drafts in a **hold-labeled PR for human
review**. That request takes precedence over the contributor guide's usual
publish-before-merge rule. Keep `draft: true` in all three posts and keep the
PR on `hold`. The PR itself is ready for review. Do not enable auto-merge.
A human editor must approve publication, refresh the date and claim evidence,
and remove the draft flags and hold together. Do not merge hidden drafts as a
substitute for that publication review.

## Claim evidence

The source audit used tuna-os/tunaos commit
`a6fcff42` and docs base `2d45b89`. Links below pin that audit so a reviewer can
compare later changes; post links use main for readers who need current instructions.

| Claim or correction | Evidence and boundary |
| --- | --- |
| Matrix source and family mapping | [tunaos.toml](https://github.com/tuna-os/tunaos/blob/a6fcff42/tunaos.toml): `variants` declares bases, platforms and flavors. The article compares selection criteria; it does not copy a live support table or variant count. |
| Desktop policy source | [compiler](https://github.com/tuna-os/tunaos/blob/a6fcff42/scripts/config.py), [configuration migration](https://github.com/tuna-os/tunaos/blob/a6fcff42/docs/PRIMARY-CONFIG-MIGRATION.md), and [installer](https://github.com/tuna-os/tunaos/blob/a6fcff42/build_scripts/desktop/install-desktop.sh). There is no tracked `manifests/desktops/` at this revision; installers still consume generated manifest paths. |
| Containerfile pipeline, not BuildStream for the matrix | [orchestrator](https://github.com/tuna-os/tunaos/blob/a6fcff42/.github/workflows/build-variant.yml), [pipeline](https://github.com/tuna-os/tunaos/blob/a6fcff42/docs/PIPELINE.md), and the `sibling_images` section of the primary config. BuildStream sibling products have separate builds; the series does not attribute their engine or gates to the variant matrix. |
| Reference and switch example | [INSTALL.md](https://github.com/tuna-os/tunaos/blob/a6fcff42/docs/INSTALL.md) names `ghcr.io/tuna-os/yellowfin:gnome` and the bootc switch route. [IMAGE-TAGS.md](https://github.com/tuna-os/tunaos/blob/a6fcff42/docs/IMAGE-TAGS.md) records stream suffix exceptions. No live pull or install success is claimed. |
| Read-only OS and writable state | Upstream [filesystem model](https://bootc.dev/bootc/filesystem.html), reviewed 2026-10-24. Persistence options vary; the series does not promise a stateless host. |
| Update and recovery boundary | Upstream [upgrades](https://bootc.dev/bootc/bootc-upgrades.7.html) and [rollback manual](https://bootc.dev/bootc/man/bootc-rollback.8.html), reviewed 2026-10-24. OS rollback is not application-data restore; `/etc` has deployment-specific behavior. |
| Pins are not reproducibility proof | [version inputs](https://github.com/tuna-os/tunaos/blob/a6fcff42/image-versions.yaml), primary config base refs, and [artifact verification](https://github.com/tuna-os/tunaos/blob/a6fcff42/docs/VERIFY-ARTIFACTS.md). A commit or input digest does not establish byte-identical rebuilds. No rebuild comparison was performed. |
| Support, readiness and hardware | [green criteria](https://github.com/tuna-os/tunaos/blob/a6fcff42/docs/GREEN-CRITERIA.md), [contract](https://github.com/tuna-os/tunaos/blob/a6fcff42/.github/green-criteria.yml), [hardware](https://github.com/tuna-os/tunaos/blob/a6fcff42/docs/HARDWARE.md), and [lifecycle](https://github.com/tuna-os/tunaos/blob/a6fcff42/VARIANT-LIFECYCLE.md). Readers are sent to generated results; no cell is declared currently green by these drafts. |

The issue's `build-config.yml` pointer predates primary TOML ownership. Its
suggestion to confirm this matrix against buildstream.build and org-level
workflows is insufficient: those sources cannot establish which engine this
repository runs. The audited repository configuration and workflow are the
load-bearing evidence instead.

## Review before publication

- Recheck all source links and image examples against the publication revision.
- Choose a pilot cell from generated evidence and add a measured walkthrough
  if the editor wants longer copy. Record the digest, hardware, and outcome;
  this draft does not claim that such a pilot was executed.
- Confirm command context and migration prerequisites, especially the distinction
  between an existing compatible bootc host and an arbitrary Linux installation.
- Keep the family comparison interpretive. Use generated data for any future
  current-state support table.
- Read the three posts together for repetition and audience fit. Keep the
  cross-links and unique slugs when dates or titles change.
- Run `just preflight`, `just build`, and `npm run a11y` after publication edits.
  Confirm the released pages appear in the blog and sitemap only after approval.

## Validation of the draft PR

- `just preflight` passed with a writable temporary STE cache and the local
  Markdown tool on `PATH`. The recipe reports existing Markdown findings as
  notes; the separate check of all changed Markdown files passed.
- STE reports 9 findings against budget 9, all in existing pages. The new
  posts and README add no findings; no budget changed.
- `just build` passed with the posts hidden. A second local build temporarily
  set `draft: false` to compile all three blog pages and their cross-links.
  The source flags were restored to `draft: true` afterward. Existing site
  link and duplicate-route warnings remain outside these files.
- The required `npm run a11y` was attempted against all three local preview
  routes. Chromium could not launch because this host lacks
  `libglib-2.0.so.0`; no accessibility pass is claimed. Run it in the normal
  browser-equipped environment before publication.
- No image build, installation, hardware pilot, or reproducibility comparison
  was run for this prose-only change.
