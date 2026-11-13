"""Publisher contract tests; no network or credentials needed."""
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("publisher", Path(__file__).with_name("publish-generated.py"))
publisher = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = publisher
spec.loader.exec_module(publisher)


class PublisherTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)

    def iso(self, count=1):
        path = self.root / "static/iso-index.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps({"count": count, "categories": [{"isos": [
            {"url": "https://download.tunaos.org/test.iso", "size": 12}]}]}))

    def test_valid_iso(self):
        self.iso()
        publisher.validate_tree(self.root, publisher.PRODUCERS["iso-index"])

    def test_failed_validation_never_fetches_or_pushes(self):
        self.iso(count=2)
        with patch.object(publisher, "run") as run:
            with self.assertRaises(ValueError):
                publisher.publish(self.root, "iso-index", "tuna-os/docs", "main", "origin")
            run.assert_not_called()

    def test_unexpected_files_and_symlinks_rejected(self):
        self.iso()
        extra = self.root / "unexpected"
        extra.write_text("unrelated")
        with self.assertRaises(ValueError):
            publisher.validate_tree(self.root, publisher.PRODUCERS["iso-index"])
        extra.unlink()
        extra.symlink_to(self.root / "static/iso-index.json")
        with self.assertRaises(ValueError):
            publisher.validate_tree(self.root, publisher.PRODUCERS["iso-index"])

    def test_missing_oci_object_aborts(self):
        path = self.root / "static/flatpak/index/static"
        path.parent.mkdir(parents=True)
        path.write_text(json.dumps({"Registry": "https://ghcr.io", "Results": [
            {"Name": "tuna-os/test", "Images": [{"Digest": "sha256:" + "a" * 64,
             "Labels": {"org.flatpak.ref": "app/test/x86_64/stable", "org.flatpak.metadata": "metadata"}}]}]}))
        with patch.object(publisher, "run", side_effect=RuntimeError("missing object")) as run:
            with self.assertRaises(RuntimeError):
                publisher.validate_tree(self.root, publisher.PRODUCERS["flatpak"])
            self.assertEqual(run.call_args.args[:3], ("skopeo", "inspect", "--raw"))

    def test_publication_reuses_branch_and_leaves_main_untouched(self):
        remote = self.root / "remote.git"
        checkout = self.root / "repo"
        artifact = self.root / "artifact"
        artifact.mkdir()
        real_run = publisher.run
        real_run("git", "init", "--bare", str(remote))
        real_run("git", "clone", str(remote), str(checkout))
        real_run("git", "config", "user.name", "Test", cwd=checkout)
        real_run("git", "config", "user.email", "test@example.com", cwd=checkout)
        real_run("git", "checkout", "-b", "main", cwd=checkout)
        (checkout / "README").write_text("base")
        real_run("git", "add", "README", cwd=checkout)
        real_run("git", "commit", "-m", "base", cwd=checkout)
        real_run("git", "push", "origin", "main", cwd=checkout)
        self.iso()
        target = artifact / "static"
        target.mkdir()
        (target / "iso-index.json").write_text((self.root / "static/iso-index.json").read_text())
        original = real_run("git", "rev-parse", "HEAD", cwd=checkout)
        calls = []

        def execute(*args, cwd=None):
            if args[0] == "gh":
                calls.append(args)
                return "[]" if args[2] == "list" else ""
            return real_run(*args, cwd=cwd or checkout)

        with patch.object(publisher, "run", side_effect=execute):
            publisher.publish(artifact, "iso-index", "test/docs", "main", "origin")
            publisher.publish(artifact, "iso-index", "test/docs", "main", "origin")
        self.assertEqual(real_run("git", "rev-parse", "HEAD", cwd=checkout), original)
        self.assertEqual(real_run("git", "status", "--porcelain", cwd=checkout), "")
        self.assertEqual(real_run("git", "rev-parse", "origin/main", cwd=checkout), original)
        self.assertEqual({call[call.index("--head") + 1] for call in calls}, {"generated/iso-index"})
        message = real_run("git", "show", "-s", "--format=%B", "refs/remotes/origin/generated/iso-index", cwd=checkout)
        self.assertIn("Signed-off-by: Test <test@example.com>", message)

    def test_missing_walkthrough_image_rejected(self):
        directory = self.root / "docs/tunaos/installer-walkthrough"
        (directory / "img").mkdir(parents=True)
        (directory / "img/exists.png").write_bytes(b"\x89PNG\r\n\x1a\n")
        (directory / "index.md").write_text("![step](./img/missing.png)")
        with self.assertRaises(ValueError):
            publisher.validate_tree(self.root, publisher.PRODUCERS["installer-walkthrough"])


if __name__ == "__main__":
    unittest.main()
