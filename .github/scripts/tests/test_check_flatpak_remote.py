import json

import pytest
from conftest import load_module

check_flatpak_remote = load_module("check-flatpak-remote.py", "check_flatpak_remote")


def test_check_flatpakrepo_flags_missing_default_branch():
    errors = []
    check_flatpak_remote.check_flatpakrepo(lambda _rel: "Title=tuna-os\n", errors)
    assert len(errors) == 1
    assert "DefaultBranch" in errors[0]


def test_check_flatpakrepo_passes_when_present():
    errors = []
    check_flatpak_remote.check_flatpakrepo(lambda _rel: "Title=tuna-os\nDefaultBranch=stable\n", errors)
    assert errors == []


INDEX = {
    "Results": [
        {
            "Name": "tuna-os/example",
            "Images": [
                {
                    "Architecture": "amd64",
                    "Labels": {"org.flatpak.ref": "app/org.tunaos.Example/x86_64/stable"},
                },
            ],
        },
    ],
}

EXPECTED_APPS = {
    "apps": [
        {"name": "tuna-os/example", "id": "org.tunaos.Example", "archs": ["amd64"]},
    ],
}


def _loader(index=INDEX, expected=EXPECTED_APPS):
    def load_json(rel_path):
        return {"index/static": index, "expected-apps.json": expected}[rel_path]
    return load_json


def test_check_index_passes_for_matching_app():
    errors, warnings = [], []
    check_flatpak_remote.check_index(_loader(), errors, warnings)
    assert errors == []
    assert warnings == []


def test_check_index_flags_missing_app():
    expected = {"apps": [{"name": "tuna-os/missing", "id": "org.tunaos.Missing", "archs": ["amd64"]}]}
    errors, warnings = [], []
    check_flatpak_remote.check_index(_loader(expected=expected), errors, warnings)
    assert any("missing from index/static entirely" in e for e in errors)


def test_check_index_flags_mismatched_ref():
    expected = {"apps": [{"name": "tuna-os/example", "id": "org.tunaos.Wrong", "archs": ["amd64"]}]}
    errors, warnings = [], []
    check_flatpak_remote.check_index(_loader(expected=expected), errors, warnings)
    assert any("don't match expected id" in e for e in errors)


def test_check_index_flags_missing_required_arch():
    expected = {"apps": [{"name": "tuna-os/example", "id": "org.tunaos.Example", "archs": ["arm64"]}]}
    errors, warnings = [], []
    check_flatpak_remote.check_index(_loader(expected=expected), errors, warnings)
    assert any("missing required arch 'arm64'" in e for e in errors)


def test_check_index_warns_on_planned_arch_not_yet_published():
    expected = {"apps": [{
        "name": "tuna-os/example", "id": "org.tunaos.Example",
        "archs": ["amd64"], "archs_planned": ["arm64"],
    }]}
    errors, warnings = [], []
    check_flatpak_remote.check_index(_loader(expected=expected), errors, warnings)
    assert errors == []
    assert any("planned arch 'arm64' not yet published" in w for w in warnings)


def test_check_index_warns_on_unexpected_app_in_index():
    expected = {"apps": []}
    errors, warnings = [], []
    check_flatpak_remote.check_index(_loader(expected=expected), errors, warnings)
    assert errors == []
    assert any("not in expected-apps.json" in w for w in warnings)


def test_check_flatpakrefs_flags_orphan_ref_file(tmp_path, monkeypatch):
    monkeypatch.setattr(check_flatpak_remote, "STATIC_DIR", tmp_path)
    (tmp_path / "index").mkdir()
    (tmp_path / "index" / "static").write_text(json.dumps(INDEX))
    appstream_dir = tmp_path / "appstream"
    appstream_dir.mkdir()
    (appstream_dir / "org.tunaos.Orphan.flatpakref").write_text("Name=org.tunaos.Orphan\n")

    errors = []
    check_flatpak_remote.check_flatpakrefs(errors)
    assert any("org.tunaos.Orphan" in e for e in errors)


def test_check_flatpakrefs_passes_for_known_id(tmp_path, monkeypatch):
    monkeypatch.setattr(check_flatpak_remote, "STATIC_DIR", tmp_path)
    (tmp_path / "index").mkdir()
    (tmp_path / "index" / "static").write_text(json.dumps(INDEX))
    appstream_dir = tmp_path / "appstream"
    appstream_dir.mkdir()
    (appstream_dir / "org.tunaos.Example.flatpakref").write_text("Name=org.tunaos.Example\n")

    errors = []
    check_flatpak_remote.check_flatpakrefs(errors)
    assert errors == []
