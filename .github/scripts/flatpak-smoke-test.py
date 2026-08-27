#!/usr/bin/env python3
"""Install + launch every tuna-os flatpak app from the live remote, and file
a GitHub issue on the owning app repo for anything that fails.

Complements check-flatpak-remote.py: that script verifies the *served
index* is well-formed (every expected ref present, right archs). This
script verifies the apps it points at actually *work* -- install pulls a
real image and its runtime, and the binary launches without crashing.
Neither one subsumes the other: an app can have a perfectly valid index
entry and still be broken at runtime (missing dependency, bad permission,
crash on start), and this script wouldn't catch a structurally malformed
index entry that check-flatpak-remote.py flags directly.

App-id.startswith("org.tunaos.Installer") or app-id == "org.bootcinstaller.Installer"
are install-tested but not launched -- they perform real disk/OS
operations, so launching one unattended in CI is not a safe smoke test.

Requires flatpak + xvfb-run on PATH, and (for issue filing) a token with
issues:write on every repo listed in expected-apps.json, via ISSUE_TOKEN.
"""
import json
import os
import subprocess
import sys
import time
import urllib.request
import urllib.error
import urllib.parse
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
EXPECTED_APPS = json.loads((REPO_ROOT / "static/flatpak/expected-apps.json").read_text())["apps"]

REMOTE_URL = "https://tunaos.org/flatpak"
LAUNCH_TIMEOUT = 20
ISSUE_LABEL = "automated:flatpak-smoke-test"

GH_API = "https://api.github.com"


def run(cmd, timeout=None):
    return subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)


def is_installer(app_id):
    return app_id == "org.bootcinstaller.Installer" or ".Installer" in app_id


def setup_remote():
    run(["flatpak", "remote-add", "--if-not-exists", "--user", "tuna-os", f"oci+{REMOTE_URL}"])
    run(["flatpak", "remote-add", "--if-not-exists", "--user", "flathub",
         "https://dl.flathub.org/repo/flathub.flatpakrepo"])


def install(app_id):
    r = run(["flatpak", "install", "--user", "-y", "--noninteractive", "tuna-os", app_id],
            timeout=600)
    return r.returncode == 0, (r.stdout + r.stderr)[-4000:]


def launch(app_id):
    # exit 124 (timeout hit == still running at the deadline) and 0 (a
    # CLI-flavored app that exits cleanly on its own, e.g. finupdate
    # --dry-run) both count as "launched fine". Anything else is a crash.
    extra = ["--dev-mode", "--dry-run"] if app_id == "org.tunaos.finupdate" else []
    r = run(["xvfb-run", "-a", "timeout", str(LAUNCH_TIMEOUT), "flatpak", "run", app_id, *extra],
            timeout=LAUNCH_TIMEOUT + 15)
    ok = r.returncode in (0, 124)
    return ok, (r.stdout + r.stderr)[-4000:]


def gh_api(method, path, token, body=None):
    req = urllib.request.Request(
        f"{GH_API}{path}",
        method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "User-Agent": "tuna-os-flatpak-smoke-test",
        },
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"::warning::GitHub API {method} {path} -> {e.code}: {e.read().decode()[:500]}")
        return None


def find_open_issue(repo, app_id, token):
    # The Search API has a brief indexing lag after an issue is created --
    # irrelevant for the once-a-day cron, but confirmed to bite two
    # create-then-immediately-search calls in the same run (e.g. manual
    # testing). One short retry makes this robust either way.
    q = f"repo:{repo} is:issue is:open label:{ISSUE_LABEL} in:title {app_id}"
    for attempt in range(2):
        result = gh_api("GET", f"/search/issues?q={urllib.parse.quote(q)}", token)
        items = (result or {}).get("items", [])
        if items:
            return items[0]
        if attempt == 0:
            time.sleep(5)
    return None


def file_or_update_issue(repo, app_id, failures, run_url, token):
    title = f"Flatpak smoke test failing: {app_id}"
    existing = find_open_issue(repo, app_id, token)
    body_lines = [
        f"Automated smoke test against the live tuna-os remote failed for `{app_id}`.",
        "",
        f"Run: {run_url}",
        "",
    ]
    for step, ok, log in failures:
        if not ok:
            body_lines += [f"### {step} failed", "```", log or "(no output captured)", "```", ""]
    body = "\n".join(body_lines)

    if existing:
        gh_api("POST", f"/repos/{repo}/issues/{existing['number']}/comments", token,
               {"body": f"Still failing as of this run.\n\n{body}"})
        print(f"  -> commented on existing issue {repo}#{existing['number']}")
    else:
        created = gh_api("POST", f"/repos/{repo}/issues", token, {
            "title": title, "body": body, "labels": [ISSUE_LABEL],
        })
        if created:
            print(f"  -> opened {repo}#{created['number']}")


def close_if_recovered(repo, app_id, token):
    existing = find_open_issue(repo, app_id, token)
    if existing:
        gh_api("POST", f"/repos/{repo}/issues/{existing['number']}/comments", token,
               {"body": "Smoke test is passing again as of this run. Closing."})
        gh_api("PATCH", f"/repos/{repo}/issues/{existing['number']}", token, {"state": "closed"})
        print(f"  -> closed recovered issue {repo}#{existing['number']}")


def main():
    token = os.environ.get("ISSUE_TOKEN")
    run_url = os.environ.get("RUN_URL", "(no run URL provided)")
    file_issues = os.environ.get("FILE_ISSUES") == "true"

    setup_remote()

    any_failed = False
    for app in EXPECTED_APPS:
        # "name" is the GHCR registry path, not necessarily the GitHub repo
        # (letters/tables/decks kept their original per-app registry paths
        # after consolidating into tuna-os/gtk-office-suite) -- issue_repo
        # is the override for where issues should actually go.
        app_id, repo = app["id"], app.get("issue_repo", app["name"])
        print(f"== {app_id} ({repo}) ==")
        failures = []

        ok, log = install(app_id)
        failures.append(("install", ok, log))
        print(f"  install: {'ok' if ok else 'FAIL'}")

        if ok and not is_installer(app_id):
            ok2, log2 = launch(app_id)
            failures.append(("launch", ok2, log2))
            print(f"  launch: {'ok' if ok2 else 'FAIL'}")

        failed = any(not ok for _, ok, _ in failures)
        if failed:
            any_failed = True
            if file_issues and token:
                file_or_update_issue(repo, app_id, failures, run_url, token)
        elif file_issues and token:
            close_if_recovered(repo, app_id, token)

    sys.exit(1 if any_failed else 0)


if __name__ == "__main__":
    main()
