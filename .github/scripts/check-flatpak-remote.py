#!/usr/bin/env python3
"""Sanity-check the tuna-os Flatpak remote.

Verifies:
  1. tuna-os.flatpakrepo declares DefaultBranch (without it, `flatpak
     install tuna-os <app>` fails outright -- see 2026-07-27 incident).
  2. Every app in expected-apps.json is present in index/static with a
     matching org.flatpak.ref, and every required 'archs' entry has an
     image (missing 'archs_planned' entries warn instead of failing).
  3. Every appstream/*.flatpakref file's app-id resolves to a live index
     entry (local-file mode only -- there's no HTTP directory listing).

Run in local-file mode (checks the working tree, e.g. pre-deploy on a PR)
or --base-url mode (checks what's actually being served, e.g. the nightly
production check) via urllib -- no extra dependencies.

Exits non-zero if anything required is missing.
"""
import argparse
import json
import sys
import urllib.request
from pathlib import Path

STATIC_DIR = Path(__file__).resolve().parents[2] / "static" / "flatpak"


def make_loaders(base_url):
    """Return (load_text, load_json) reading from base_url over HTTP if
    given, else from the local static/flatpak/ tree."""
    if base_url:
        def load_text(rel_path):
            req = urllib.request.Request(
                f"{base_url.rstrip('/')}/{rel_path}",
                headers={"User-Agent": "tuna-os-flatpak-sanity-check"},
            )
            with urllib.request.urlopen(req) as resp:
                return resp.read().decode()
    else:
        def load_text(rel_path):
            return (STATIC_DIR / rel_path).read_text()

    def load_json(rel_path):
        return json.loads(load_text(rel_path))

    return load_text, load_json


def check_flatpakrepo(load_text, errors):
    text = load_text("tuna-os.flatpakrepo")
    if "DefaultBranch=" not in text:
        errors.append(
            "tuna-os.flatpakrepo: missing DefaultBranch= -- `flatpak install "
            "tuna-os <app>` will fail with 'Nothing matches' for every app "
            "on a non-stable branch."
        )


def check_index(load_json, errors, warnings):
    index = load_json("index/static")
    expected = load_json("expected-apps.json")["apps"]

    by_name = {}
    for result in index["Results"]:
        archs = set()
        refs = set()
        for image in result.get("Images", []):
            archs.add(image.get("Architecture"))
            refs.add(image.get("Labels", {}).get("org.flatpak.ref", ""))
        by_name[result["Name"]] = {"archs": archs, "refs": refs}

    for app in expected:
        name, app_id = app["name"], app["id"]
        entry = by_name.get(name)
        if entry is None:
            errors.append(f"{name}: missing from index/static entirely (expected id {app_id})")
            continue

        bad_refs = [r for r in entry["refs"] if app_id not in r]
        if bad_refs:
            errors.append(f"{name}: ref(s) don't match expected id {app_id}: {bad_refs}")

        for arch in app.get("archs", []):
            if arch not in entry["archs"]:
                errors.append(f"{name}: missing required arch '{arch}' (has {sorted(entry['archs'])})")

        for arch in app.get("archs_planned", []):
            if arch not in entry["archs"]:
                warnings.append(f"{name}: planned arch '{arch}' not yet published")

    expected_names = {app["name"] for app in expected}
    unexpected = set(by_name) - expected_names
    if unexpected:
        warnings.append(
            f"index/static has {len(unexpected)} app(s) not in expected-apps.json "
            f"(new app? add it): {sorted(unexpected)}"
        )


def check_flatpakrefs(errors):
    """Local-file only: there's no HTTP directory listing for appstream/."""
    index = json.loads((STATIC_DIR / "index" / "static").read_text())
    known_ids = set()
    for result in index["Results"]:
        for image in result.get("Images", []):
            ref = image.get("Labels", {}).get("org.flatpak.ref", "")
            if ref.startswith("app/"):
                known_ids.add(ref.split("/")[1])

    for ref_file in sorted((STATIC_DIR / "appstream").glob("*.flatpakref")):
        lines = dict(
            line.split("=", 1) for line in ref_file.read_text().splitlines() if "=" in line
        )
        app_id = lines.get("Name")
        if app_id not in known_ids:
            errors.append(f"{ref_file.name}: app id '{app_id}' has no matching index/static entry")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--base-url",
        help="Check the live served remote instead of the local working tree, "
        "e.g. https://tunaos.org/flatpak",
    )
    args = parser.parse_args()

    load_text, load_json = make_loaders(args.base_url)
    errors, warnings = [], []
    check_flatpakrepo(load_text, errors)
    check_index(load_json, errors, warnings)
    if not args.base_url:
        check_flatpakrefs(errors)

    for w in warnings:
        print(f"WARN: {w}")
    for e in errors:
        print(f"FAIL: {e}")

    if errors:
        print(f"\n{len(errors)} error(s), {len(warnings)} warning(s).")
        sys.exit(1)
    print(f"OK -- {len(warnings)} warning(s), no errors.")


if __name__ == "__main__":
    main()
