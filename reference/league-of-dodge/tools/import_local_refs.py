#!/usr/bin/env python3
"""Local-only, safe preservation of League of Dodging downloads (no Git upload).

Run from repo root:
    python3 reference/league-of-dodge/tools/import_local_refs.py
    python3 reference/league-of-dodge/tools/import_local_refs.py --download-missing
    python3 reference/league-of-dodge/tools/import_local_refs.py --zip ~/Downloads/loldodge-all-updated.zip
"""
from __future__ import annotations
import argparse, hashlib, os, re, shutil, stat, sys, urllib.request, zipfile
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parents[1]
ORIG, ARCH = ROOT / "originals", ROOT / "archives"
DOWNLOADS = Path.home() / "Downloads"
ASSETS = [f"dodge_texture_{i}.png" for i in range(9)]
EXTENSIONS = ["tph_adManager.js", "uph_localstorage.js"]
REQUIRED = ["dodge/game.html", "dodge/loldoge/dodge.js"] + ["dodge/loldoge/" + a for a in ASSETS + EXTENSIONS]

def digest(path):
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1048576), b""):
            h.update(block)
    return h.hexdigest()

def copy(src, dst):
    if not src.is_file() or src.is_symlink():
        return
    dst.parent.mkdir(parents=True, exist_ok=True)
    if dst.exists():
        if digest(src) == digest(dst):
            return
        dst = dst.with_name(dst.stem + "_" + digest(src)[:10] + dst.suffix)
    shutil.copy2(src, dst)

def unzip_safely(path, destination, issues):
    with zipfile.ZipFile(path) as z:
        members = z.infolist()
        if len(members) > 15000 or sum(e.file_size for e in members) > 2000000000:
            issues.append("REJECTED oversized archive: " + str(path))
            return
        root = destination.resolve()
        for entry in members:
            raw = entry.filename.replace("\\", "/")
            pure = PurePosixPath(raw)
            if (not raw or raw.startswith("/") or ".." in pure.parts
                    or re.match(r"^[A-Za-z]:", raw)
                    or ((entry.external_attr >> 16) & 0o170000) == stat.S_IFLNK):
                issues.append("REJECTED unsafe ZIP entry: " + raw)
                continue
            target = (destination / Path(*pure.parts)).resolve()
            if not target.is_relative_to(root):
                issues.append("REJECTED escaping ZIP entry: " + raw)
                continue
            if entry.is_dir():
                target.mkdir(parents=True, exist_ok=True)
                continue
            target.parent.mkdir(parents=True, exist_ok=True)
            if target.exists():
                if digest(target) != hashlib.sha256(z.read(entry)).hexdigest():
                    issues.append("CONFLICT existing extraction not overwritten: " + str(target))
                continue
            with z.open(entry) as stream, target.open("wb") as out:
                shutil.copyfileobj(stream, out, 1048576)

def discover_zips():
    found = []
    if DOWNLOADS.is_dir():
        for base, folders, names in os.walk(DOWNLOADS):
            depth = len(Path(base).relative_to(DOWNLOADS).parts)
            if depth >= 3:
                folders.clear()
            folders[:] = [s for s in folders if not s.startswith(".") and s != "node_modules"]
            for name in names:
                lower = name.lower()
                if lower.endswith(".zip") and ("loldodge" in lower or "league-of-dodge" in lower):
                    found.append(Path(base) / name)
    return found

def fetch_missing(issues):
    dest = ORIG / "dodge/loldoge"
    dest.mkdir(parents=True, exist_ok=True)
    for name in ASSETS + EXTENSIONS:
        path = dest / name
        if path.exists():
            continue
        url = "https://loldodgegame.com/dodge/loldoge/" + name
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=20) as response:
                data = response.read(35 * 1048576 + 1)
                mime = response.headers.get("Content-Type", "").lower()
            if not data or len(data) > 35 * 1048576:
                raise ValueError("empty/oversized download")
            if name.endswith(".png") and not data.startswith(b"\x89PNG\r\n\x1a\n"):
                raise ValueError("invalid PNG signature")
            if name.endswith(".js") and ("text/html" in mime or data[:100].lstrip().lower().startswith(b"<!doctype html")):
                raise ValueError("HTML response instead of JS")
            path.write_bytes(data)
            print("LOCAL DOWNLOAD OK:", name)
        except (OSError, ValueError, TimeoutError) as error:
            issues.append("FAILED download " + url + ": " + str(error))

def report(issues, sources):
    lines = ["# Private local inventory — do not commit", "",
             "Generated: " + datetime.now(timezone.utc).isoformat(), "",
             "Sources:"] + ["- " + s for s in sources]
    lines += ["", "| Path relative to reference folder | Bytes | SHA-256 |", "| --- | ---: | --- |"]
    for parent in (ORIG, ARCH):
        if parent.exists():
            for f in sorted(parent.rglob("*")):
                if f.is_file() and not f.is_symlink() and f.name != ".gitignore":
                    lines.append("| " + str(f.relative_to(ROOT)) + " | " + str(f.stat().st_size) + " | " + digest(f) + " |")
    lines += ["", "## Normalized dependency paths"]
    for rel in REQUIRED:
        path = ORIG / rel
        lines.append("- " + ("OK" if path.is_file() else "MISSING") + ": originals/" + rel)
    lines += ["", "## Import/download issues"]
    lines += ["- " + i for i in issues] or ["- No known issues recorded."]
    lines += ["", "ZIP contents are also retained at originals/extracted/ZIP_STEM/ with original relative paths.",
              "A normalized-path MISSING does not prove the file is absent inside a ZIP.",
              "Completeness and actual playability require browser/network testing.", ""]
    output = ROOT / "local-inventory.md"
    output.write_text("\n".join(lines), encoding="utf-8")
    print("PRIVATE MANIFEST:", output)

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--source", type=Path, action="append", help="Loose download source; repeatable")
    p.add_argument("--zip", type=Path, action="append", help="Additional ZIP; repeatable")
    p.add_argument("--download-missing", action="store_true", help="Download 9 PNG atlases + 2 scripts to local-only originals")
    args = p.parse_args()
    sources, issues = [], []
    ORIG.mkdir(parents=True, exist_ok=True)
    ARCH.mkdir(parents=True, exist_ok=True)
    for folder in args.source or [DOWNLOADS / "lol-dodge-source"]:
        folder = folder.expanduser().resolve()
        sources.append(str(folder))
        if not folder.is_dir():
            issues.append("MISSING source folder: " + str(folder))
            continue
        for name, rel in (("game.html", "dodge/game.html"),
                          ("dodge.js", "dodge/loldoge/dodge.js")):
            for path in (folder / name, folder / "dodge" / name,
                         folder / "dodge/loldoge" / name, folder / "loldoge" / name):
                if path.is_file():
                    copy(path, ORIG / rel)
                    break
        for name in ASSETS + EXTENSIONS:
            for path in (folder / name, folder / "loldoge" / name, folder / "dodge/loldoge" / name):
                if path.is_file():
                    copy(path, ORIG / "dodge/loldoge" / name)
                    break
        for path in folder.rglob("*"):
            if path.is_file() and not path.is_symlink() and path.suffix.lower() != ".zip":
                rel = path.relative_to(folder)
                if len(rel.parts) < 11:
                    copy(path, ORIG / "loose-snapshot" / folder.name / rel)

    zipfiles = set(discover_zips()) | {p.expanduser().resolve() for p in (args.zip or [])}
    if not zipfiles:
        issues.append("MISSING ZIP: no loldodge-all-updated.zip or related ZIP was found under ~/Downloads.")
    for path in sorted(zipfiles):
        sources.append(str(path))
        if not path.is_file() or not zipfile.is_zipfile(path):
            issues.append("FAILED invalid/missing ZIP: " + str(path))
            continue
        copy(path, ARCH / path.name)
        try:
            unzip_safely(path, ORIG / "extracted" / path.stem, issues)
            print("EXTRACTED:", path.name)
        except (ValueError, OSError, zipfile.BadZipFile, RuntimeError) as error:
            issues.append("FAILED ZIP extraction: " + str(path) + " — " + str(error))
    if args.download_missing:
        fetch_missing(issues)
    report(issues, sources)
    for issue in issues:
        print("ISSUE:", issue, file=sys.stderr)
    print("All third-party originals/archives are Git-ignored. Nothing is automatically pushed.")
    return 1 if any("FAILED" in issue for issue in issues) else 0

if __name__ == "__main__":
    raise SystemExit(main())
