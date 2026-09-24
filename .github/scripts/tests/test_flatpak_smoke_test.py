"""Unit tests for flatpak-smoke-test.py.

The script's real job -- installing and launching flatpaks from the live
tuna-os remote -- needs flatpak/xvfb-run and a real network remote, so it's
only ever exercised end-to-end by the daily flatpak-smoke-test.yml cron
against production. That leaves the pure decision logic (which app-ids skip
launch, retry/format the GitHub issue file-or-update-or-close flow, and
main()'s per-app dispatch) with neither unit nor reproducible e2e coverage:
the cron's outcome depends on the live remote's current state, so it can't
pin a specific code path the way a fixture-driven test can.

Loads the script by file path (hyphenated filename, not an importable
module) rather than depending on any shared conftest.py, since this repo
has no tests/ directory on main yet to share one with.
"""
import importlib.util
import sys
from pathlib import Path
from unittest.mock import patch

import pytest

SCRIPT_PATH = Path(__file__).resolve().parent.parent / "flatpak-smoke-test.py"


def load_module():
    spec = importlib.util.spec_from_file_location("flatpak_smoke_test", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    sys.modules["flatpak_smoke_test"] = module
    spec.loader.exec_module(module)
    return module


@pytest.fixture
def mod(tmp_path, monkeypatch):
    # The script reads static/flatpak/expected-apps.json relative to
    # REPO_ROOT at import time -- point it at a throwaway fixture so import
    # doesn't depend on (or mutate) the real one.
    apps_dir = tmp_path / "static" / "flatpak"
    apps_dir.mkdir(parents=True)
    (apps_dir / "expected-apps.json").write_text('{"apps": []}')
    m = load_module()
    monkeypatch.setattr(m, "REPO_ROOT", tmp_path)
    return m


# ── is_installer ────────────────────────────────────────────────────────

def test_is_installer_matches_bootc_installer(mod):
    assert mod.is_installer("org.bootcinstaller.Installer") is True


def test_is_installer_matches_dot_installer_suffix(mod):
    assert mod.is_installer("org.tunaos.InstallerXfce") is True


def test_is_installer_false_for_regular_app(mod):
    assert mod.is_installer("org.tunaos.finupdate") is False


# ── find_open_issue ──────────────────────────────────────────────────────

def test_find_open_issue_returns_first_match(mod):
    with patch.object(mod, "gh_api", return_value={"items": [{"number": 7}]}) as api:
        result = mod.find_open_issue("tuna-os/foo", "org.tunaos.foo", "tok")
    assert result == {"number": 7}
    assert api.call_count == 1


def test_find_open_issue_retries_once_then_gives_up(mod):
    with patch.object(mod, "gh_api", return_value={"items": []}) as api, \
         patch.object(mod.time, "sleep") as sleep:
        result = mod.find_open_issue("tuna-os/foo", "org.tunaos.foo", "tok")
    assert result is None
    assert api.call_count == 2
    sleep.assert_called_once_with(5)


def test_find_open_issue_handles_none_response(mod):
    with patch.object(mod, "gh_api", return_value=None), \
         patch.object(mod.time, "sleep"):
        result = mod.find_open_issue("tuna-os/foo", "org.tunaos.foo", "tok")
    assert result is None


# ── file_or_update_issue / close_if_recovered ────────────────────────────

def test_file_or_update_issue_comments_when_existing(mod):
    with patch.object(mod, "find_open_issue", return_value={"number": 3}), \
         patch.object(mod, "gh_api") as api:
        mod.file_or_update_issue(
            "tuna-os/foo", "org.tunaos.foo",
            [("install", False, "boom")], "http://run", "tok",
        )
    api.assert_called_once()
    args, _ = api.call_args
    assert args[0] == "POST"
    assert args[1] == "/repos/tuna-os/foo/issues/3/comments"
    assert "Still failing" in args[3]["body"]
    assert "boom" in args[3]["body"]


def test_file_or_update_issue_creates_when_absent(mod):
    with patch.object(mod, "find_open_issue", return_value=None), \
         patch.object(mod, "gh_api", return_value={"number": 9}) as api:
        mod.file_or_update_issue(
            "tuna-os/foo", "org.tunaos.foo",
            [("launch", False, "crash")], "http://run", "tok",
        )
    args, _ = api.call_args
    assert args[0] == "POST"
    assert args[1] == "/repos/tuna-os/foo/issues"
    assert args[3]["title"] == "Flatpak smoke test failing: org.tunaos.foo"
    assert args[3]["labels"] == [mod.ISSUE_LABEL]


def test_file_or_update_issue_only_reports_failed_steps(mod):
    with patch.object(mod, "find_open_issue", return_value={"number": 3}), \
         patch.object(mod, "gh_api") as api:
        mod.file_or_update_issue(
            "tuna-os/foo", "org.tunaos.foo",
            [("install", True, "fine"), ("launch", False, "crash")], "http://run", "tok",
        )
    body = api.call_args[0][3]["body"]
    assert "install" not in body.lower().split("\n")[0]
    assert "launch failed" in body
    assert "crash" in body


def test_close_if_recovered_closes_existing(mod):
    with patch.object(mod, "find_open_issue", return_value={"number": 5}), \
         patch.object(mod, "gh_api") as api:
        mod.close_if_recovered("tuna-os/foo", "org.tunaos.foo", "tok")
    assert api.call_count == 2
    methods = [c.args[0] for c in api.call_args_list]
    assert methods == ["POST", "PATCH"]
    patch_call = api.call_args_list[1]
    assert patch_call.args[3] == {"state": "closed"}


def test_close_if_recovered_noop_when_absent(mod):
    with patch.object(mod, "find_open_issue", return_value=None), \
         patch.object(mod, "gh_api") as api:
        mod.close_if_recovered("tuna-os/foo", "org.tunaos.foo", "tok")
    api.assert_not_called()


# ── main() dispatch ───────────────────────────────────────────────────────

def _run_main(mod, apps, monkeypatch, env=None):
    monkeypatch.setattr(mod, "EXPECTED_APPS", apps)
    monkeypatch.setattr(mod, "setup_remote", lambda: None)
    for key in ("ISSUE_TOKEN", "RUN_URL", "FILE_ISSUES"):
        monkeypatch.delenv(key, raising=False)
    for key, val in (env or {}).items():
        monkeypatch.setenv(key, val)
    try:
        mod.main()
    except SystemExit as e:
        return e.code
    return None


def test_main_exits_zero_when_everything_passes(mod, monkeypatch):
    apps = [{"id": "org.tunaos.foo", "name": "tuna-os/foo"}]
    with patch.object(mod, "install", return_value=(True, "")), \
         patch.object(mod, "launch", return_value=(True, "")):
        code = _run_main(mod, apps, monkeypatch)
    assert code == 0


def test_main_skips_launch_for_installer_apps(mod, monkeypatch):
    apps = [{"id": "org.bootcinstaller.Installer", "name": "tuna-os/bootc-installer"}]
    with patch.object(mod, "install", return_value=(True, "")) as install, \
         patch.object(mod, "launch") as launch:
        code = _run_main(mod, apps, monkeypatch)
    assert code == 0
    install.assert_called_once()
    launch.assert_not_called()


def test_main_exits_nonzero_and_files_issue_on_launch_failure(mod, monkeypatch):
    apps = [{"id": "org.tunaos.foo", "name": "tuna-os/foo"}]
    with patch.object(mod, "install", return_value=(True, "")), \
         patch.object(mod, "launch", return_value=(False, "crash")), \
         patch.object(mod, "file_or_update_issue") as file_issue:
        code = _run_main(mod, apps, monkeypatch,
                          env={"FILE_ISSUES": "true", "ISSUE_TOKEN": "tok"})
    assert code == 1
    file_issue.assert_called_once()
    assert file_issue.call_args.args[0] == "tuna-os/foo"


def test_main_does_not_file_issue_without_file_issues_flag(mod, monkeypatch):
    apps = [{"id": "org.tunaos.foo", "name": "tuna-os/foo"}]
    with patch.object(mod, "install", return_value=(False, "nope")), \
         patch.object(mod, "file_or_update_issue") as file_issue:
        code = _run_main(mod, apps, monkeypatch)
    assert code == 1
    file_issue.assert_not_called()


def test_main_closes_recovered_issue_when_passing(mod, monkeypatch):
    apps = [{"id": "org.tunaos.foo", "name": "tuna-os/foo"}]
    with patch.object(mod, "install", return_value=(True, "")), \
         patch.object(mod, "launch", return_value=(True, "")), \
         patch.object(mod, "close_if_recovered") as close_recovered:
        code = _run_main(mod, apps, monkeypatch,
                          env={"FILE_ISSUES": "true", "ISSUE_TOKEN": "tok"})
    assert code == 0
    close_recovered.assert_called_once_with("tuna-os/foo", "org.tunaos.foo", "tok")


def test_main_uses_issue_repo_override(mod, monkeypatch):
    apps = [{"id": "org.tunaos.letters", "name": "ghcr.io/letters", "issue_repo": "tuna-os/letters"}]
    with patch.object(mod, "install", return_value=(False, "nope")), \
         patch.object(mod, "file_or_update_issue") as file_issue:
        code = _run_main(mod, apps, monkeypatch,
                          env={"FILE_ISSUES": "true", "ISSUE_TOKEN": "tok"})
    assert code == 1
    assert file_issue.call_args.args[0] == "tuna-os/letters"
