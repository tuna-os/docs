---
sidebar_position: 4
title: "README"
---

FlatPark is a signed Flatpak remote for Linux desktop apps. Every app is the
vendor's own release, fetched at install time and run in a sandbox.

These docs are written for two readers. People get a short explanation at the top
of each page. Agents packaging or reviewing apps read the whole page, including
the details below it. The same files are rendered at
[flatpark.org/docs](https://flatpark.org/docs/).

- [Users](https://github.com/tuna-os/flatpark/blob/main/docs/users/README.md): installing apps, permissions, getting help.
- [Developers](https://github.com/tuna-os/flatpark/blob/main/docs/developers/README.md): your app on FlatPark, and instant updates from your releases.
- [Packagers](https://github.com/tuna-os/flatpark/blob/main/docs/packagers/README.md): adding and maintaining apps.
- [Reviewers](https://github.com/tuna-os/flatpark/blob/main/docs/reviewers/README.md): how PRs are checked and tested.
- [Reference](https://github.com/tuna-os/flatpark/blob/main/docs/reference/README.md): records and lookup tables.
- [Project](https://github.com/tuna-os/flatpark/blob/main/docs/project/README.md): what FlatPark is, its policies and rules.

## For agents

- Packaging an app: follow the [packaging playbook](https://github.com/tuna-os/flatpark/blob/main/docs/packagers/playbook.md); each
  step links to the page that holds its rules.
- Finding apps to package: [finding apps](https://github.com/tuna-os/flatpark/blob/main/docs/packagers/finding-apps.md).
- Something doesn't work in the sandbox: [common problems](https://github.com/tuna-os/flatpark/blob/main/docs/packagers/solutions/README.md),
  and the checklist for the app's stack in [by stack](https://github.com/tuna-os/flatpark/blob/main/docs/packagers/solutions/by-stack.md).
- Testing a package or a change to one: the [testing playbook](https://github.com/tuna-os/flatpark/blob/main/docs/reviewers/testing-playbook.md);
  for a runtime upgrade or a prebuilt re-cut, [batch changes](https://github.com/tuna-os/flatpark/blob/main/docs/reviewers/batch-changes.md).
- Reviewing a PR: follow the [review runbook](https://github.com/tuna-os/flatpark/blob/main/docs/reviewers/review-runbook.md).
- A fix for a listed app: add a row to the [incident list](https://github.com/tuna-os/flatpark/blob/main/docs/reference/incidents.md).
- After a run: [cleaning up](https://github.com/tuna-os/flatpark/blob/main/docs/packagers/cleanup.md).
- How decisions are made: [principles](https://github.com/tuna-os/flatpark/blob/main/docs/project/principles.md) and
  [governance](https://github.com/tuna-os/flatpark/blob/main/docs/project/governance.md).
- Link between pages with relative `.md` paths. The site rewrites them, and the
  build fails on a link to a page that doesn't exist.
- An example package cited in a page is one with `catalog.upstream_approved: true`,
  preferably one whose upstream uses publish-action, so the example isn't
  de-listed from under the page. A pattern no approved app has may cite the
  app that has it.
- `specs/` holds the plans being worked through, one step at a time; it isn't
  published on the site.
