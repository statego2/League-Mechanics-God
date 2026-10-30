#!/usr/bin/env python3
"""Audit private extracted HTML/CSS/GameMaker JS trees without network or redistribution.

Produces reference/league-of-dodge/local-audit.md (Git-ignored).
"""
from __future__ import annotations
import argparse
import html
import re
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
HTML_ATTR = re.compile(r"""(?is)\b(?:src|href)\s*=\s*["']([^"']+)["']""")
CSS_URL = re.compile(r"""(?is)url\(\s*["']?([^)'"]+)["']?\s*\)""")
GM_TEXTURE = re.compile(r"""dodge_texture_\d+\.png""")
GM_EXT = ("tph_adManager.js", "uph_localstorage.js")

def local_reference(source: Path, literal: str, allowed_root: Path):
    value = html.unescape(literal).strip()
    if not value or value.startswith(("#", "data:", "blob:", "javascript:", "//")):
        return "EXTERNAL/INLINE", value
    parsed = urlsplit(value)
    if parsed.scheme or parsed.netloc:
        return "EXTERNAL/INLINE", value
    # Absolute URL paths use a server document root, not the source file's directory.
    if parsed.path.startswith("/"):
        return "SERVER-ROOT", value
    rel = unquote(parsed.path)
    target = (source.parent / rel).resolve()
    if not target.is_relative_to(allowed_root.resolve()):
        return "ESCAPES-ROOT", value
    return ("OK" if target.is_file() else "MISSING"), str(target.relative_to(allowed_root.resolve()))

def references(path: Path):
    try:
        content = path.read_text(encoding="utf-8-sig", errors="replace")
    except OSError:
        return []
    if path.suffix.lower() in (".html", ".htm"):
        return HTML_ATTR.findall(content)
    if path.suffix.lower() == ".css":
        return CSS_URL.findall(content)
    if path.suffix.lower() == ".js" and "dodge_texture_" in content and "GameMaker_Init" in content:
        found = list(dict.fromkeys(GM_TEXTURE.findall(content)))
        found += [name for name in GM_EXT if name in content]
        return found
    return []

def audit(originals: Path):
    lines = ["# Local-only dependency audit — do not commit", "",
             "Root: " + str(originals), "",
             "Source paths are evaluated relative to each HTML/CSS/JS file.",
             "A GameMaker texture reference is a filename-level heuristic; verify runtime HTTP requests.",
             "External URLs and server-root paths are not verified against the network.",
             ""]
    files = sorted(p for p in originals.rglob("*")
                   if p.is_file() and p.suffix.lower() in (".html", ".htm", ".css", ".js"))
    htmlfiles = [p for p in files if p.suffix.lower() in (".html", ".htm")]
    lines += ["## Game entrypoints", ""]
    if htmlfiles:
        for file in htmlfiles:
            source = file.read_text(encoding="utf-8-sig", errors="replace")
            title = re.search(r"<title[^>]*>(.*?)</title>", source, re.I | re.S)
            label = html.unescape(re.sub(r"\s+", " ", title.group(1)).strip()) if title else "(no title)"
            lines.append("- " + str(file.relative_to(originals)) + " — " + label)
    else:
        lines.append("- No HTML game entrypoints were found.")
    lines += ["", "## Dependency path checks", "",
              "| Referencing file | Literal dependency | Status | Normalized target |",
              "| --- | --- | --- | --- |"]
    counts = {"OK": 0, "MISSING": 0, "SERVER-ROOT": 0, "ESCAPES-ROOT": 0, "EXTERNAL/INLINE": 0}
    for file in files:
        for ref in references(file):
            status, rel = local_reference(file, ref, originals)
            counts[status] += 1
            clean = lambda s: s.replace("|", r"\|").replace("\n", " ")[:180]
            lines.append("| " + clean(str(file.relative_to(originals))) + " | "
                         + clean(ref) + " | " + status + " | " + clean(rel) + " |")
    lines += ["", "## Counts", ""]
    lines += ["- " + key + ": " + str(counts[key]) for key in counts]
    lines += ["", "Important: this is a static file-path audit, not proof of playable behavior.",
              "Some JS dynamic imports and runtime asset lookups cannot be discovered statically.",
              "For completeness test through a local HTTP server and inspect browser Network 404 responses.", ""]
    return "\n".join(lines), counts

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--originals", type=Path, default=ROOT/"originals")
    args = parser.parse_args()
    originals = args.originals.expanduser().resolve()
    if not originals.is_dir():
        parser.error("Originals directory does not exist: " + str(originals))
    document, counts = audit(originals)
    out = ROOT / "local-audit.md"
    out.write_text(document, encoding="utf-8")
    print(out)
    for status, count in counts.items():
        print(status, count)
    return 1 if counts["ESCAPES-ROOT"] else 0

if __name__ == "__main__":
    raise SystemExit(main())
