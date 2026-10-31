# Generated content publication

`scripts/publish-generated.py` provides a shared publication interface for
ISO indexes, installer walkthroughs, and Flatpak catalogs. It creates or updates
a ready pull request on `generated/<producer>`, targeting `main`. It never
pushes to the production branch or merges the pull request.

## Producer contract

A producer must finish all generation and uploads before it calls the publisher.
Stop on every failed upload or index update. Stage a complete replacement tree
in a separate directory, with paths relative to the repository root:

| Producer | Allowed output |
| --- | --- |
| `iso-index` | `static/iso-index.json` |
| `installer-walkthrough` | `docs/tunaos/installer-walkthrough/` |
| `flatpak` | `static/flatpak/index/static` |

The publisher rejects empty trees, unexpected files, and symlinks. It replaces
the producer's output in a temporary worktree based on the current base branch.
This includes deletions. Other paths and the caller's index remain unchanged.
No diff means no commit or new pull request. Repeated updates reuse the same
branch and open pull request. A lease rejects concurrent branch changes.
Serialize runs per producer to avoid competing updates.

```bash
python3 scripts/publish-generated.py iso-index --source /tmp/generated --validate-only
python3 scripts/publish-generated.py iso-index --source /tmp/generated
```

Use Python 3, Git, and the GitHub CLI. Configure the Git author and email for
signed-off commits. The remote must point to the repository named by
`--repository`; `--remote` and `--base` default to `origin` and `main`.
Run from a checkout of that repository. Pass `GH_TOKEN` through the environment.
The publisher needs permission to write its generated branch and open PRs.

## Validator contract

Each `Producer` supplies a callable `Validator`. Validation runs before any Git
mutation. Exceptions abort publication. ISO validation rejects empty catalogs,
incorrect counts, and invalid download entries. Walkthrough validation requires
PNG files and checks local screenshot references. Flatpak validation checks
required labels and resolves every immutable catalog digest with
`skopeo inspect --raw`. Install skopeo and configure its registry authentication
before Flatpak validation. A failed lookup rejects the whole publication.
These checks supplement the site's build and PR checks.

## Workflow adoption still required

This code is the extraction portion of issue #537. The existing workflows do
not call it yet. Replace their direct commits and pushes with staging and one
publisher call. Keep Flatpak artifacts in separate per-app directories, require
all copies to succeed, then validate and publish the complete catalog once.
Remove the cross-repository direct-push token from that flow.

Use a GitHub App token or other approved PR credential that triggers downstream
`pull_request` workflows. PRs created with the default `GITHUB_TOKEN` normally
do not trigger those workflows. Configure required checks, including the
Workers build, on the target branch. The publisher does not change branch rules
or bypass them. Workflow wiring and credentials require a separate authorized
change before these guarantees apply to scheduled production runs.

Run the contract tests with:

```bash
python3 -m unittest discover -s scripts -p 'test_publish_generated.py'
```
