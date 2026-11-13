#!/usr/bin/env python3
"""Publish a validated generated tree as a deterministic pull request."""

import argparse
import json
import re
from pathlib import Path
import shutil
import subprocess
import tempfile
from dataclasses import dataclass
from typing import Protocol


class Validator(Protocol):
    def __call__(self, root: Path) -> None: ...


def run(*args, cwd=None):
    return subprocess.run(args, cwd=cwd, check=True, text=True,
                          stdout=subprocess.PIPE).stdout.strip()


def validate_iso(root):
    data = json.loads((root / "static/iso-index.json").read_text())
    images = [image for category in data["categories"] for image in category["isos"]]
    if not images or data["count"] != len(images):
        raise ValueError("ISO index must contain a complete, nonempty catalog")
    for image in images:
        if not image["url"].startswith("https://") or image["size"] <= 0:
            raise ValueError("Invalid ISO entry")


def validate_walkthrough(root):
    directory = root / "docs/tunaos/installer-walkthrough"
    page = (directory / "index.md").read_text()
    images = list((directory / "img").glob("*.png"))
    if not images or not all(image.read_bytes().startswith(b"\x89PNG\r\n\x1a\n")
                             for image in images):
        raise ValueError("Walkthrough requires PNG screenshots")
    links = re.findall(r'!\[[^\]]*\]\(\./img/([^/)]+)\)', page)
    if not links or any(not (directory / "img" / name).is_file() for name in links):
        raise ValueError("Walkthrough has missing screenshots")


def validate_flatpak(root):
    data = json.loads((root / "static/flatpak/index/static").read_text())
    if data["Registry"] != "https://ghcr.io" or not data["Results"]:
        raise ValueError("Expected a nonempty GHCR catalog")
    for result in data["Results"]:
        if not re.fullmatch(r'tuna-os/[a-z0-9._-]+', result["Name"]):
            raise ValueError("Invalid OCI repository")
        if not result["Images"]:
            raise ValueError("Empty OCI repository")
        for image in result["Images"]:
            digest = image["Digest"]
            if not re.fullmatch(r'sha256:[0-9a-f]{64}', digest):
                raise ValueError("Invalid OCI digest")
            for label in ("org.flatpak.ref", "org.flatpak.metadata"):
                if not image["Labels"].get(label):
                    raise ValueError(f"Missing {label}")
            # Resolve immutable objects, not mutable tags. Auth comes from the
            # caller's skopeo auth file; any failed lookup aborts publication.
            run("skopeo", "inspect", "--raw",
                f'docker://ghcr.io/{result["Name"]}@{digest}')


@dataclass(frozen=True)
class Producer:
    path: str
    validator: Validator


PRODUCERS = {
    "iso-index": Producer("static/iso-index.json", validate_iso),
    "installer-walkthrough": Producer("docs/tunaos/installer-walkthrough", validate_walkthrough),
    "flatpak": Producer("static/flatpak/index/static", validate_flatpak),
}


def validate_tree(source, producer):
    """Artifacts are repo-relative trees restricted to one producer's output."""
    expected = Path(producer.path)
    files = []
    for path in source.rglob("*"):
        relative = path.relative_to(source)
        if path.is_symlink():
            raise ValueError(f"Symlinks are not allowed: {relative}")
        if path.is_file():
            if relative != expected and expected not in relative.parents:
                raise ValueError(f"Unexpected artifact: {relative}")
            files.append(relative)
    if not files:
        raise ValueError("Empty artifact tree")
    producer.validator(source)


def publish(source, name, repository, base, remote):
    producer = PRODUCERS[name]
    validate_tree(source, producer)
    # The caller's checkout and index are never modified. Every run starts
    # from the current base, so removed generated files are removed in the PR.
    run("git", "fetch", remote, base)
    branch = f"generated/{name}"
    with tempfile.TemporaryDirectory(prefix="generated-publisher-") as temporary:
        checkout = Path(temporary) / "checkout"
        run("git", "worktree", "add", "--detach", str(checkout), f"{remote}/{base}")
        try:
            target = checkout / producer.path
            if target.is_dir():
                shutil.rmtree(target)
            elif target.exists():
                target.unlink()
            target.parent.mkdir(parents=True, exist_ok=True)
            artifact = source / producer.path
            if artifact.is_dir():
                shutil.copytree(artifact, target)
            else:
                shutil.copy2(artifact, target)
            run("git", "add", "--", producer.path, cwd=checkout)
            if not run("git", "diff", "--cached", "--name-only", cwd=checkout):
                return
            # Refuse to overwrite another writer's changes since this read.
            refs = run("git", "ls-remote", remote, f"refs/heads/{branch}")
            previous = refs.split()[0] if refs else ""
            run("git", "commit", "-s", "-m", f"chore: refresh generated {name}", cwd=checkout)
            run("git", "push", f"--force-with-lease=refs/heads/{branch}:{previous}",
                remote, f"HEAD:refs/heads/{branch}", cwd=checkout)
            prs = json.loads(run("gh", "pr", "list", "--repo", repository,
                                 "--head", branch, "--base", base, "--json", "number"))
            if not prs:
                run("gh", "pr", "create", "--repo", repository, "--base", base,
                    "--head", branch, "--title", f"chore: refresh generated {name}",
                    "--body", "Generated content validated before publication. Required PR checks must pass before merge.")
        finally:
            run("git", "worktree", "remove", "--force", str(checkout))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("producer", choices=PRODUCERS)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--repository", default="tuna-os/docs")
    parser.add_argument("--base", default="main")
    parser.add_argument("--remote", default="origin")
    parser.add_argument("--validate-only", action="store_true")
    args = parser.parse_args()
    source = args.source.resolve()
    if args.validate_only:
        validate_tree(source, PRODUCERS[args.producer])
    else:
        publish(source, args.producer, args.repository, args.base, args.remote)


if __name__ == "__main__":
    main()
