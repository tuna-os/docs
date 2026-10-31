# Runbook: Documentation Site Diagnostics & Triage

## Severity & Triage Quick Reference

| Level | Condition | Response Time | Action |
|-------|-----------|---------------|--------|
| SEV-1 | Documentation site offline / 5xx on edge routes | < 30 min | Revert last deployment / verify edge worker status |
| SEV-2 | Build pipeline failing on main branch | < 2 hours | Fix broken markdown/links or roll back failing PR |
| SEV-3 | Broken internal link or asset rendering issue | Next business day | File issue and schedule PR fix |

## Triage Procedure

### 1. Build & Lint Verification
When a deployment fails or build workflow errors:
```bash
npm ci
just preflight
```
Inspect output for:
- TypeScript compilation errors (`tsc`)
- Missing or malformed MDX components
- Broken relative image or document paths

### 2. Edge & Deployment Verification
If static site assets fail to serve:
- Check Cloudflare Pages / deployment provider dashboard for build status.
- Verify DNS and custom domain SSL certificate provisioning.
- Confirm `docusaurus.config.ts` base URL and url settings match the target environment.

### 3. Escalation Procedure
- File an incident using `.github/ISSUE_TEMPLATE/incident_report.md`.
- Notify documentation maintainers via release channel.

## Daily organization sync

The sync runs at 06:00 UTC. It imports source documents, validates path
collisions and MDX, builds the site, then opens a review PR. Publication follows
merge and a successful Workers deployment; the cron is not a publish deadline.

Root documents retain their filenames. When a file from a source `docs/`
directory would collide with a root document or `index.md`, the importer adds
`docs-` to its filename. It repeats the prefix if necessary to keep both pages.
For example, root `ROADMAP.md` and `docs/roadmap.md` become `ROADMAP.md` and
`docs-roadmap.md`. Relative links still point to the original source on GitHub.
The final collision check remains active for conflicts with hand-written pages.

For MDX errors, inspect the named source file and the importer's CommonMark
fallback warning. Add a fixture to `scripts/__tests__/sync-org-docs.test.mjs`
when extending the sanitizer. Fix source content upstream when appropriate;
direct edits to generated pages disappear on the next sync.

To assess recovery, inspect three consecutive scheduled runs and their summaries:

```bash
gh run list --repo tuna-os/docs --workflow sync-org-docs.yml --limit 3
gh run view RUN_ID --repo tuna-os/docs --log-failed
```

Record listed, synced, failed, and refused counts from the logs. A successful
import does not establish publication: check the sync PR, its merge, and the
Workers deployment before comparing the published `/docs/tunaos/ROADMAP` with
the source revision.

The `/api/adoption` route is served by the Worker, independently of doc imports.
If it fails, inspect the response status and Worker logs as well as deployment
health. A collector failure requires separate investigation; a green sync alone
does not prove that metrics are available.
