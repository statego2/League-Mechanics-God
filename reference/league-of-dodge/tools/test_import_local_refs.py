"""Offline regression checks for the private third-party reference importer."""
import importlib.util
import tempfile
import unittest
import zipfile
from pathlib import Path

MODULE_PATH = Path(__file__).with_name("import_local_refs.py")
SPEC = importlib.util.spec_from_file_location("import_local_refs", MODULE_PATH)
mod = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(mod)


class ReferenceImporterTests(unittest.TestCase):
    def test_sha256_matches_known_value(self):
        with tempfile.TemporaryDirectory() as temp:
            f = Path(temp) / "sample.txt"
            f.write_bytes(b"abc")
            self.assertEqual(
                mod.digest(f),
                "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
            )

    def test_zip_preserves_paths_and_blocks_traversal(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            zippath = root / "source.zip"
            with zipfile.ZipFile(zippath, "w") as archive:
                archive.writestr("dodge/loldoge/dodge_texture_0.png", b"dummy")
                archive.writestr("../escape.txt", b"do not write")
                archive.writestr("/absolute.txt", b"do not write")
            warnings = []
            dest = root / "private"
            mod.unzip_safely(zippath, dest, warnings)
            self.assertEqual((dest / "dodge/loldoge/dodge_texture_0.png").read_bytes(), b"dummy")
            self.assertFalse((root / "escape.txt").exists())
            self.assertFalse((root / "absolute.txt").exists())
            self.assertEqual(len(warnings), 2)

    def test_copy_preserves_original_when_name_conflicts(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            a, b, dest = root/"a.txt", root/"b.txt", root/"store"/"file.txt"
            a.write_text("first")
            b.write_text("second")
            mod.copy(a, dest)
            mod.copy(b, dest)
            self.assertEqual(dest.read_text(), "first")
            self.assertEqual(len(list(dest.parent.iterdir())), 2)

    def test_required_dependency_set(self):
        self.assertIn("dodge/game.html", mod.REQUIRED)
        self.assertIn("dodge/loldoge/dodge.js", mod.REQUIRED)
        self.assertEqual(len(mod.ASSETS), 9)
        self.assertEqual(len(mod.EXTENSIONS), 2)


if __name__ == "__main__":
    unittest.main()
