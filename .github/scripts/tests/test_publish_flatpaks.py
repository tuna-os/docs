"""Exercise the catalog transaction with real OCI layouts and index updates."""
import json
import subprocess

import pytest
from conftest import load_module
from test_update_index import _make_oci_layout, VALID_LABELS

publisher = load_module("publish-flatpaks.py", "publish_flatpaks")


@pytest.fixture
def batch(tmp_path, monkeypatch):
    artifacts = tmp_path / "artifacts"
    artifacts.mkdir()
    manifests = {}
    for app in ("alpha", "beta"):
        root = tmp_path / app
        root.mkdir()
        layout = _make_oci_layout(root, {
            **VALID_LABELS, "org.flatpak.ref": f"app/org.tunaos.{app}/x86_64/stable",
        })
        digest = json.loads((layout / "index.json").read_text())["manifests"][0]["digest"]
        manifests[app] = (layout / "blobs/sha256" / digest.split(":")[1]).read_bytes()
        layout.rename(artifacts / f"oci-{app}")
    checkout = tmp_path / "checkout"
    index = checkout / "static/flatpak/index/static"
    index.parent.mkdir(parents=True)
    original = json.dumps({"Registry": "https://ghcr.io", "Results": []})
    index.write_text(original)
    for args in (("init",), ("config", "user.name", "Test"),
                 ("config", "user.email", "test@example.com"), ("add", "."),
                 ("commit", "-m", "baseline")):
        subprocess.run(["git", "-C", str(checkout), *args], check=True, capture_output=True)
    events = []
    real_run = publisher.run

    def fake_run(*args, **kwargs):
        events.append(args)
        if args[0] == "skopeo":
            if args[1] == "inspect":
                app = args[-1].split("/")[-1].split("@")[0]
                return subprocess.CompletedProcess(args, 0, stdout=manifests[app])
            return subprocess.CompletedProcess(args, 0)
        if args[0] == "git" and "push" in args:
            return subprocess.CompletedProcess(args, 0)
        return real_run(*args, **kwargs)

    monkeypatch.setattr(publisher, "run", fake_run)
    return artifacts, checkout, index, original, events, fake_run


def test_complete_batch_commits_once_after_all_verifications(batch):
    artifacts, checkout, index, _, events, _ = batch
    publisher.publish(artifacts, checkout)
    data = json.loads(index.read_text())
    assert [r["Name"] for r in data["Results"]] == ["tuna-os/alpha", "tuna-os/beta"]
    for result in data["Results"]:
        image = result["Images"][0]
        assert image["Tags"] == [image["Digest"].replace(":", "-")]
    copies = [e for e in events if e[:2] == ("skopeo", "copy")]
    assert len(copies) == 2
    assert all("--preserve-digests" in e for e in copies)
    first_git = next(i for i, e in enumerate(events) if e[0] == "git")
    assert sum(e[:2] == ("skopeo", "inspect") for e in events[:first_git]) == 2
    assert sum("commit" in e for e in events) == 1
    assert sum("push" in e for e in events) == 1


@pytest.mark.parametrize("failure", ["copy", "inspect", "digest", "update", "validation"])
def test_second_app_failure_never_changes_or_commits_catalog(batch, monkeypatch, failure):
    artifacts, checkout, index, original, events, fake_run = batch

    def fail(*args, **kwargs):
        beta = any("beta" in arg for arg in args)
        if beta and ((failure in ("copy", "inspect") and args[:2] == ("skopeo", failure))
                     or (failure == "update" and "--index-file" in args)):
            raise subprocess.CalledProcessError(1, args)
        result = fake_run(*args, **kwargs)
        if beta and failure == "digest" and args[:2] == ("skopeo", "inspect"):
            result.stdout = b"wrong manifest"
        return result

    monkeypatch.setattr(publisher, "run", fail)
    if failure == "validation":
        def reject(data):
            assert len(data["Results"]) == 2
            raise ValueError("Invalid complete catalog")
        monkeypatch.setattr(publisher, "validate_catalog", reject)
    with pytest.raises((ValueError, subprocess.CalledProcessError)):
        publisher.publish(artifacts, checkout)
    assert index.read_text() == original
    assert not any(e[0] == "git" for e in events)


def test_empty_batch_fails_closed(batch):
    artifacts, checkout, index, original, events, _ = batch
    with pytest.raises(ValueError, match="No OCI artifacts"):
        publisher.publish(artifacts / "missing", checkout)
    assert index.read_text() == original
    assert not events


def test_unchanged_batch_does_not_commit_or_push(batch):
    artifacts, checkout, _, _, events, _ = batch
    publisher.publish(artifacts, checkout)
    events.clear()
    publisher.publish(artifacts, checkout)
    assert not any("commit" in e or "push" in e for e in events)


@pytest.mark.parametrize("mutation", ["digest", "metadata", "duplicate"])
def test_validation_checks_retained_entries(mutation):
    image = {"Digest": "sha256:" + "a" * 64, "Architecture": "amd64", "Tags": ["latest"],
             "Labels": VALID_LABELS.copy()}
    data = {"Registry": "https://ghcr.io", "Results": [{"Name": "tuna-os/old", "Images": [image]}]}
    if mutation == "digest":
        image["Digest"] = "broken"
    elif mutation == "metadata":
        image["Labels"]["org.flatpak.metadata"] = ""
    else:
        data["Results"][0]["Images"].append(image)
    with pytest.raises(ValueError):
        publisher.validate_catalog(data)
