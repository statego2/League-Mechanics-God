# League of Dodging — Reference Library

**Purpose:** preserve the known research, precise provenance and safe local import tooling needed by Codex to build our original League Mechanics God browser game. This is a **reference**, not the deployed application and not a license to reuse someone else's code/art.

## Read first

1. [Project blueprint](../../PROJECT_BLUEPRINT.md) — canonical product vision; no Unity.
2. [Manifest](manifest.md) — what we actually possess, source URLs, verified hashes, expected paths and missing items.
3. [Gameplay analysis](GAMEPLAY_ANALYSIS.md) — engine and mechanics investigation, limitations and implementation ideas.
4. [Importer](tools/import_local_refs.py) — discovers archives and local downloads on the developer's own Mac, preserves ZIP paths and produces a private SHA-256 inventory.
5. [Progress report](../../docs/PROGRESS.md) — verified/current prototype state and the next three tasks.

## Rights / distribution boundary

The League of Dodging game, GameMaker-generated JavaScript and texture atlases originate from a third party. We have **not verified a license permitting redistribution**. Therefore **no third-party game binaries, textures, generated JS, or source ZIPs are committed to this public GitHub repository**. Keeping a file locally for inspection does not confer a license to redistribute it or incorporate its assets in our public game. The public repository stores only our own source, technical notes, links, checksums and importer.

The local-only folders under this directory are Git-ignored:

- originals/dodge/game.html
- originals/dodge/loldoge/dodge.js
- originals/dodge/loldoge/dodge_texture_0.png through dodge_texture_8.png (if obtained)
- originals/dodge/loldoge/tph_adManager.js and uph_localstorage.js (if obtained)
- originals/extracted/ARCHIVE_NAME/... with paths unchanged relative to each ZIP root
- archives/loldodge-all-updated.zip (if found)

Keep the unmodified originals private. Use independently designed game characters, art, projectiles, sound and logic in our playable app, or explicitly licensed alternatives.

## How to import on a developer Mac

From the repository root:

    python3 reference/league-of-dodge/tools/import_local_refs.py

The importer scans the conventional ~/Downloads/lol-dodge-source location and ZIPs matching loldodge / league-of-dodge within ~/Downloads (up to three folder levels). It can also accept repeated explicit paths:

    python3 reference/league-of-dodge/tools/import_local_refs.py --source ~/Downloads/lol-dodge-source --zip ~/Downloads/loldodge-all-updated.zip

Optional: fetch **only** the nine named texture atlases and two named extension scripts **into the private local folder**:

    python3 reference/league-of-dodge/tools/import_local_refs.py --download-missing

The last command uses the original website and validates PNG signatures / rejects HTML error responses; it may fail if resources have moved or the site blocks requests. No automatic push follows.

Next, audit every extracted HTML/CSS/JS game tree for missing local paths:

    python3 reference/league-of-dodge/tools/audit_local_tree.py

This creates local-only **local-audit.md**, grouped by referencing file and status (OK, MISSING, SERVER-ROOT, EXTERNAL/INLINE or ESCAPES-ROOT). It handles HTML src/href, CSS url() and the known compiled GameMaker atlas/extension metadata; it is not a dynamic browser/network test.

Review the generated local-only file **local-inventory.md** for per-file size, SHA-256, expected normalized paths, missing dependencies and errors. Original ZIP content stays within originals/extracted/ZIP_STEM/ and is not flattened, so nested dependencies keep their ZIP-relative layout. If a ZIP contains separate games, inspect them as separate subtrees.

## How Codex should use this

Do not copy the minified GameMaker runtime into our application. Read the analysis, observe original gameplay when possible, and implement **original** responsive movement, skillshot threats, precise collision, believable auto-attack timing and trustworthy drill scoring in the production root game.js. Tests must demonstrate behavior; the reference alone does not prove working features.

## Scope / access limitation (30 Oct 2026)

The current session received game.html and dodge.js as uploads and inspected both. The previously mentioned loldodge-all-updated.zip **was not present in the accessible session file system or indexed file inventory**. We have no access to the user's local ~/Downloads filesystem, cannot claim to have extracted that ZIP, and have not run an end-to-end offline replica. The importer addresses the Mac-side inventory gap without misrepresenting its completion.
