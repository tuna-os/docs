import hashlib
import json

import pytest
from conftest import load_module

update_index = load_module("update-index.py", "update_index")


def _write_blob(blobs_dir, payload):
    data = json.dumps(payload).encode()
    digest = "sha256:" + hashlib.sha256(data).hexdigest()
    (blobs_dir / digest.split(":")[1]).write_bytes(data)
    return digest


def _make_oci_layout(tmp_path, labels):
    oci_dir = tmp_path / "oci"
    blobs_dir = oci_dir / "blobs" / "sha256"
    blobs_dir.mkdir(parents=True)

    config_digest = _write_blob(blobs_dir, {
        "os": "linux",
        "architecture": "amd64",
        "config": {"Labels": labels},
    })
    manifest_digest = _write_blob(blobs_dir, {"config": {"digest": config_digest}})
    (oci_dir / "index.json").write_text(json.dumps({
        "manifests": [{"digest": manifest_digest}],
    }))
    return oci_dir


VALID_LABELS = {
    "org.flatpak.ref": "app/org.tunaos.Example/x86_64/stable",
    "org.flatpak.metadata": "...",
    "org.freedesktop.appstream.appdata": "...",
    "org.freedesktop.appstream.icon-64": "...",
    "org.freedesktop.appstream.icon-128": "...",
    "unrelated.label": "dropped",
}


def test_filter_labels_keeps_only_flatpak_and_appstream_prefixes():
    assert update_index.filter_labels(VALID_LABELS) == {
        "org.flatpak.ref": "app/org.tunaos.Example/x86_64/stable",
        "org.flatpak.metadata": "...",
        "org.freedesktop.appstream.appdata": "...",
        "org.freedesktop.appstream.icon-64": "...",
        "org.freedesktop.appstream.icon-128": "...",
    }


def test_filter_labels_handles_none():
    assert update_index.filter_labels(None) == {}


def test_read_oci_layout_missing_index_json(tmp_path):
    with pytest.raises(FileNotFoundError):
        update_index.read_oci_layout(tmp_path)


def test_read_oci_layout_no_manifests(tmp_path):
    (tmp_path / "index.json").write_text(json.dumps({"manifests": []}))
    with pytest.raises(ValueError):
        update_index.read_oci_layout(tmp_path)


def test_read_oci_layout_round_trip(tmp_path):
    oci_dir = _make_oci_layout(tmp_path, VALID_LABELS)
    digest, config = update_index.read_oci_layout(oci_dir)
    assert digest.startswith("sha256:")
    assert config["architecture"] == "amd64"
    assert config["config"]["Labels"] == VALID_LABELS


def test_build_image_entry_missing_required_label_raises():
    with pytest.raises(ValueError, match="Missing required label"):
        update_index.build_image_entry(
            "sha256:abc", {"config": {"Labels": {}}}, ["latest"], require_appstream=False,
        )


def test_build_image_entry_missing_appstream_warns_when_not_required(capsys):
    config = {"config": {"Labels": {
        "org.flatpak.ref": "app/x/x86_64/stable",
        "org.flatpak.metadata": "...",
    }}}
    entry = update_index.build_image_entry("sha256:abc", config, ["latest"], require_appstream=False)
    assert entry["Labels"]["org.flatpak.ref"] == "app/x/x86_64/stable"
    assert "WARNING" in capsys.readouterr().err


def test_build_image_entry_missing_appstream_raises_when_required():
    config = {"config": {"Labels": {
        "org.flatpak.ref": "app/x/x86_64/stable",
        "org.flatpak.metadata": "...",
    }}}
    with pytest.raises(ValueError, match="No AppStream metadata"):
        update_index.build_image_entry("sha256:abc", config, ["latest"], require_appstream=True)


def test_build_image_entry_fields(tmp_path):
    oci_dir = _make_oci_layout(tmp_path, VALID_LABELS)
    digest, config = update_index.read_oci_layout(oci_dir)
    entry = update_index.build_image_entry(digest, config, ["latest", "1.0"], require_appstream=True)
    assert entry["Digest"] == digest
    assert entry["OS"] == "linux"
    assert entry["Architecture"] == "amd64"
    assert entry["Tags"] == ["latest", "1.0"]
    assert "unrelated.label" not in entry["Labels"]


def test_merge_entry_appends_new_repo():
    index_data = {"Results": []}
    entry = {"Architecture": "amd64", "Digest": "sha256:a"}
    update_index.merge_entry(index_data, "tuna-os/example", entry)
    assert index_data["Results"] == [{"Name": "tuna-os/example", "Images": [entry]}]


def test_merge_entry_replaces_same_arch_and_keeps_other_arches():
    index_data = {"Results": [{
        "Name": "tuna-os/example",
        "Images": [
            {"Architecture": "amd64", "Digest": "sha256:old"},
            {"Architecture": "arm64", "Digest": "sha256:arm"},
        ],
    }]}
    new_entry = {"Architecture": "amd64", "Digest": "sha256:new"}
    update_index.merge_entry(index_data, "tuna-os/example", new_entry)

    images = index_data["Results"][0]["Images"]
    assert len(images) == 2
    by_arch = {image["Architecture"]: image["Digest"] for image in images}
    assert by_arch == {"amd64": "sha256:new", "arm64": "sha256:arm"}


def test_merge_entry_keeps_different_refs_on_same_arch():
    index_data = {"Results": [{
        "Name": "tuna-os/bootc-installer",
        "Images": [
            {
                "Architecture": "amd64",
                "Digest": "sha256:gnome",
                "Labels": {"org.flatpak.ref": "app/org.bootcinstaller.Installer/x86_64/master"},
            },
        ],
    }]}
    kde_entry = {
        "Architecture": "amd64",
        "Digest": "sha256:kde",
        "Labels": {"org.flatpak.ref": "app/org.tunaos.InstallerKde/x86_64/master"},
    }
    update_index.merge_entry(index_data, "tuna-os/bootc-installer", kde_entry)

    images = index_data["Results"][0]["Images"]
    assert len(images) == 2
    refs = [img["Labels"]["org.flatpak.ref"] for img in images]
    assert refs == [
        "app/org.bootcinstaller.Installer/x86_64/master",
        "app/org.tunaos.InstallerKde/x86_64/master",
    ]


def test_merge_entry_replaces_same_ref_on_same_arch():
    index_data = {"Results": [{
        "Name": "tuna-os/bootc-installer",
        "Images": [
            {
                "Architecture": "amd64",
                "Digest": "sha256:gnome_old",
                "Labels": {"org.flatpak.ref": "app/org.bootcinstaller.Installer/x86_64/master"},
            },
            {
                "Architecture": "amd64",
                "Digest": "sha256:kde",
                "Labels": {"org.flatpak.ref": "app/org.tunaos.InstallerKde/x86_64/master"},
            },
        ],
    }]}
    gnome_new = {
        "Architecture": "amd64",
        "Digest": "sha256:gnome_new",
        "Labels": {"org.flatpak.ref": "app/org.bootcinstaller.Installer/x86_64/master"},
    }
    update_index.merge_entry(index_data, "tuna-os/bootc-installer", gnome_new)

    images = index_data["Results"][0]["Images"]
    assert len(images) == 2
    by_ref = {img["Labels"]["org.flatpak.ref"]: img["Digest"] for img in images}
    assert by_ref["app/org.bootcinstaller.Installer/x86_64/master"] == "sha256:gnome_new"
    assert by_ref["app/org.tunaos.InstallerKde/x86_64/master"] == "sha256:kde"


def test_merge_entry_sorts_images_by_arch_and_ref():
    index_data = {"Results": [{
        "Name": "tuna-os/bootc-installer",
        "Images": [
            {
                "Architecture": "arm64",
                "Digest": "sha256:kde_arm",
                "Labels": {"org.flatpak.ref": "app/org.tunaos.InstallerKde/aarch64/master"},
            },
            {
                "Architecture": "amd64",
                "Digest": "sha256:kde_amd",
                "Labels": {"org.flatpak.ref": "app/org.tunaos.InstallerKde/x86_64/master"},
            },
        ],
    }]}
    gnome_amd = {
        "Architecture": "amd64",
        "Digest": "sha256:gnome_amd",
        "Labels": {"org.flatpak.ref": "app/org.bootcinstaller.Installer/x86_64/master"},
    }
    update_index.merge_entry(index_data, "tuna-os/bootc-installer", gnome_amd)

    images = index_data["Results"][0]["Images"]
    order = [(img["Architecture"], img["Labels"]["org.flatpak.ref"]) for img in images]
    assert order == [
        ("amd64", "app/org.bootcinstaller.Installer/x86_64/master"),
        ("amd64", "app/org.tunaos.InstallerKde/x86_64/master"),
        ("arm64", "app/org.tunaos.InstallerKde/aarch64/master"),
    ]


def test_merge_entry_sorts_results_by_name():
    index_data = {"Results": [{"Name": "tuna-os/zzz", "Images": []}]}
    update_index.merge_entry(index_data, "tuna-os/aaa", {"Architecture": "amd64"})
    assert [r["Name"] for r in index_data["Results"]] == ["tuna-os/aaa", "tuna-os/zzz"]
