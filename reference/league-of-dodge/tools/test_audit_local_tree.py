"""Regression checks for the local-only HTML/CSS/JS dependency analyzer."""
import importlib.util
import tempfile
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).with_name("audit_local_tree.py")
SPEC = importlib.util.spec_from_file_location("audit_local_tree", MODULE_PATH)
mod = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(mod)

class LocalAuditTests(unittest.TestCase):
    def test_relative_query_string_resolution(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            f = root / "dodge/game.html"
            f.parent.mkdir(parents=True)
            (f.parent / "loldoge").mkdir()
            (f.parent / "loldoge/dodge.js").write_text("console.log(1)")
            f.write_text('<script src="loldoge/dodge.js?cachebust=123"></script>')
            result, counts = mod.audit(root)
            self.assertEqual(counts["OK"], 1)
            self.assertIn("dodge/loldoge/dodge.js", result)

    def test_missing_and_escape(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            f = root / "index.html"
            f.write_text('<script src="missing.js"></script><img src="../bad.js">')
            _, counts = mod.audit(root)
            self.assertEqual(counts["MISSING"], 1)
            self.assertEqual(counts["ESCAPES-ROOT"], 1)

    def test_gamemaker_texture_metadata_heuristic(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            f = root / "dodge.js"
            f.write_text('function GameMaker_Init(){}; _B8:["dodge_texture_0.png"]; "tph_adManager.js"')
            refs = mod.references(f)
            self.assertEqual(refs, ["dodge_texture_0.png", "tph_adManager.js"])

if __name__ == "__main__":
    unittest.main()
