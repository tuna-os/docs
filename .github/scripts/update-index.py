#!/usr/bin/env python3
"""Add or replace one application's entry in a Flatpak OCI index.

This is the canonical copy. Application repositories vendor it at
``.github/scripts/update-index.py`` and run it from their publish workflow
after ``flatpak build-bundle --oci``. It is deliberately self-contained: one
file, standard library only.

Unlike earlier revisions, this keeps the ``org.freedesktop.appstream.*``
labels that ``flatpak build-bundle --oci`` writes into the image config.
Flatpak builds the remote's AppStream catalogue from those labels, so
dropping them leaves software centres with nothing to show but the
application ID.
"""

import argparse
import json
import sys
from pathlib import Path

REQUIRED_LABELS = ("org.flatpak.ref", "org.flatpak.metadata")

# Labels that must survive into the index. Flatpak resolves and installs a ref
# from the org.flatpak.* labels, and builds the remote's AppStream catalogue --
# app name, icon, licence, screenshots, release notes -- from the
# org.freedesktop.appstream.* ones.
KEEP_LABEL_PREFIXES = ("org.flatpak.", "org.freedesktop.appstream.")

APPSTREAM_LABELS = (
    "org.freedesktop.appstream.appdata",
    "org.freedesktop.appstream.icon-64",
    "org.freedesktop.appstream.icon-128",
)


def filter_labels(labels):
    """Keep only the labels the index is required to carry."""
    return {
        key: value
        for key, value in (labels or {}).items()
        if key.startswith(KEEP_LABEL_PREFIXES)
    }


def read_oci_layout(oci_dir):
    """Return (manifest_digest, config) for the single image in an OCI layout."""
    index_path = oci_dir / "index.json"
    if not index_path.exists():
        raise FileNotFoundError(f"index.json not found in {oci_dir}")

    manifests = json.loads(index_path.read_text()).get("manifests", [])
    if not manifests:
        raise ValueError(f"No manifests listed in {index_path}")

    manifest_digest = manifests[0]["digest"]
    blobs = oci_dir / "blobs" / "sha256"
    manifest = json.loads((blobs / manifest_digest.split(":")[-1]).read_text())
    config = json.loads((blobs / manifest["config"]["digest"].split(":")[-1]).read_text())
    return manifest_digest, config


def build_image_entry(manifest_digest, config, tags, require_appstream):
    labels = config.get("config", {}).get("Labels") or {}

    missing = [name for name in REQUIRED_LABELS if name not in labels]
    if missing:
        raise ValueError(f"Missing required label(s): {', '.join(missing)}")

    missing_appstream = [name for name in APPSTREAM_LABELS if name not in labels]
    if missing_appstream:
        message = (
            "No AppStream metadata on this image ("
            + ", ".join(missing_appstream)
            + "). Software centres will show the bare application ID. Add a "
            "<id>.metainfo.xml under /app/share/metainfo/ -- see "
            "docs/METAINFO.md in tuna-os/flatpak-index."
        )
        if require_appstream:
            raise ValueError(message)
        print(f"WARNING: {message}", file=sys.stderr)

    return {
        "Digest": manifest_digest,
        "MediaType": "application/vnd.oci.image.manifest.v1+json",
        "OS": config.get("os", "linux"),
        "Architecture": config.get("architecture", "amd64"),
        "Tags": list(tags),
        "Labels": filter_labels(labels),
    }


def merge_entry(index_data, repo_name, image_entry):
    """Insert image_entry, replacing any existing image for the same arch."""
    for result in index_data.setdefault("Results", []):
        if result["Name"] == repo_name:
            result["Images"] = [
                image
                for image in result["Images"]
                if image["Architecture"] != image_entry["Architecture"]
            ]
            result["Images"].append(image_entry)
            result["Images"].sort(key=lambda image: image["Architecture"])
            return
    index_data["Results"].append({"Name": repo_name, "Images": [image_entry]})
    index_data["Results"].sort(key=lambda result: result["Name"])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--oci-dir", required=True, help="Local OCI layout directory")
    parser.add_argument("--index-file", default="index/static", help="Index file to update")
    parser.add_argument("--repo-name", required=True, help="GHCR repository, e.g. tuna-os/tavern")
    parser.add_argument("--registry", default="ghcr.io")
    parser.add_argument("--tags", nargs="+", default=["latest"])
    parser.add_argument(
        "--require-appstream",
        action="store_true",
        help="Fail instead of warning when the image carries no AppStream metadata",
    )
    args = parser.parse_args()

    index_file = Path(args.index_file)
    manifest_digest, config = read_oci_layout(Path(args.oci_dir))
    image_entry = build_image_entry(
        manifest_digest, config, args.tags, args.require_appstream
    )

    if index_file.exists():
        index_data = json.loads(index_file.read_text())
    else:
        index_data = {"Registry": f"https://{args.registry}", "Results": []}

    merge_entry(index_data, args.repo_name, image_entry)

    index_file.parent.mkdir(parents=True, exist_ok=True)
    index_file.write_text(json.dumps(index_data, indent=2) + "\n")

    has_appstream = "org.freedesktop.appstream.appdata" in image_entry["Labels"]
    print(
        f"Updated {index_file}: {args.repo_name} ({image_entry['Architecture']}), "
        f"appstream={'yes' if has_appstream else 'no'}"
    )


if __name__ == "__main__":
    main()
