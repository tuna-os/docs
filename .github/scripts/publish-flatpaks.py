#!/usr/bin/env python3
"""Publish a complete OCI artifact batch before committing its Flatpak catalog.

Registry uploads cannot be rolled back. A failed batch may leave unreferenced
images, but never publishes a partial catalog. Digest-derived tags keep uploads
reachable without moving tags used by an earlier catalog.
"""
import argparse
import hashlib
import importlib.util
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent


def run(*args, **kwargs):
    return subprocess.run(args, check=True, **kwargs)


def validate_catalog(data):
    """Check every entry, including the entries retained from the old catalog."""
    if data["Registry"] != "https://ghcr.io":
        raise ValueError("Unexpected catalog registry")
    names = set()
    for result in data["Results"]:
        name = result["Name"]
        if name in names or not result["Images"]:
            raise ValueError(f"Duplicate or empty repository: {name}")
        names.add(name)
        refs = set()
        for image in result["Images"]:
            if not re.fullmatch(r"sha256:[0-9a-f]{64}", image["Digest"]):
                raise ValueError(f"Invalid digest in {name}")
            labels = image["Labels"]
            ref = labels["org.flatpak.ref"]
            key = (image["Architecture"], ref)
            if key in refs or not re.fullmatch(r"app/[^/]+/[^/]+/[^/]+", ref):
                raise ValueError(f"Duplicate or invalid Flatpak ref in {name}")
            refs.add(key)
            if not labels["org.flatpak.metadata"] or not image["Tags"]:
                raise ValueError(f"Missing metadata or tags in {name}")


def publish(artifacts, checkout):
    spec = importlib.util.spec_from_file_location("update_index", SCRIPTS / "update-index.py")
    updater = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(updater)

    layouts = sorted(artifacts.glob("oci-*"))
    if not layouts:
        raise ValueError("No OCI artifacts downloaded")
    index = checkout / "static/flatpak/index/static"
    with tempfile.TemporaryDirectory(prefix="flatpak-batch-") as temp:
        staged = Path(temp) / "static"
        staged.write_bytes(index.read_bytes())
        for layout in layouts:
            app = layout.name.removeprefix("oci-")
            if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", app):
                raise ValueError(f"Invalid artifact name: {layout.name}")
            digest, _ = updater.read_oci_layout(layout)
            if not re.fullmatch(r"sha256:[0-9a-f]{64}", digest):
                raise ValueError(f"Invalid OCI digest: {digest}")
            tag = digest.replace(":", "-")
            remote = f"ghcr.io/tuna-os/{app}"
            run("skopeo", "copy", "--preserve-digests", f"oci:{layout}",
                f"docker://{remote}:{tag}")
            manifest = run("skopeo", "inspect", "--raw", f"docker://{remote}@{digest}",
                           stdout=subprocess.PIPE).stdout
            if "sha256:" + hashlib.sha256(manifest).hexdigest() != digest:
                raise ValueError(f"Remote digest mismatch for {app}")
            run(sys.executable, str(SCRIPTS / "update-index.py"),
                "--oci-dir", str(layout), "--index-file", str(staged),
                "--repo-name", f"tuna-os/{app}", "--tags", tag)

        validate_catalog(json.loads(staged.read_text()))
        # This is the catalog transaction boundary: nothing in the checkout is
        # changed until every upload, remote verification and update succeeds.
        index.write_bytes(staged.read_bytes())

    run("git", "-C", str(checkout), "add", "static/flatpak/index/static")
    diff = subprocess.run(["git", "-C", str(checkout), "diff", "--cached", "--quiet"])
    if diff.returncode == 0:
        print("No index changes")
        return
    if diff.returncode != 1:
        diff.check_returncode()
    run("git", "-C", str(checkout), "commit", "-m",
        "chore(flatpak): update OCI index from centralized builder")
    run("git", "-C", str(checkout), "push", "origin", "main")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--artifacts", type=Path, default=Path("artifacts"))
    parser.add_argument("--checkout", type=Path, default=Path("index-repo"))
    args = parser.parse_args()
    publish(args.artifacts, args.checkout)


if __name__ == "__main__":
    main()
