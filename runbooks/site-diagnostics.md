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
