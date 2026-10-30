# League Mechanics God — Progress & Codex Handoff

**Updated:** 2026-10-30. **Canonical spec:** [PROJECT_BLUEPRINT.md](../PROJECT_BLUEPRINT.md).

## Current state

- The public repo's original HTML5 Canvas browser alpha remains in root index.html, game.js and style.css, supporting intended Dodge Trial and Kite Arena modes (source reviewed in the blueprint).
- The blueprint correctly calls the alpha an unfinished playable prototype. A real, end-to-end browser gameplay test has **not** been reported as completed in this session.
- An external League of Dodging GameMaker HTML5 export was inspected via two available source uploads (game.html and dodge.js). Third-party originals are intentionally **not** uploaded to public git.
- reference/league-of-dodge/ now holds manifest.md, GAMEPLAY_ANALYSIS.md, README.md and a local-only preservation script. These are handoff artifacts, **not** a new production game.
- The previously mentioned loldodge-all-updated.zip could not be retrieved by this session, nor could an exhaustive inventory of the user's Mac downloads be made. The local importer can produce the authoritative private ZIP manifest on that machine.

## Completed in this reference import

- Read and followed PROJECT_BLUEPRINT.md and AGENTS.md.
- Verified the production root contains the initial application and retained those files untouched.
- Inspected the uploaded original GameMaker HTML5 entry and compiled JavaScript.
- Catalogued 9 named texture atlases, 2 named extension scripts, gameplay/object references, URLs, source hashes and the unavailable archive.
- Authored independent, evidence-graded mechanics analysis, including kiting and dodge-scoring requirements.
- Added a safe ZIP extraction/copy script with archive-slip guards, SHA-256 local manifest, private storage paths and optional atlas/script retrieval.
- Added Git ignore protection for original reference binaries and ZIPs.
- Published reference docs and code on main with real GitHub commits.

## Tests actually performed

| Check | Result | Notes |
| --- | --- | --- |
| GitHub repo and PROJECT_BLUEPRINT.md read | PASS | Direct GitHub connector |
| Uploaded original HTML/JS static inspection | PASS | Source strings, object map, hashes |
| GameMaker entry references loldoge/dodge.js | PASS | HTML source |
| 9 atlas + 2 extension references identified | PASS | Compiled JS asset metadata |
| ZIP presence in accessible session and Library search | FAIL / UNAVAILABLE | Not mounted or indexed; cannot claim contents |
| External asset HTTP retrieval | NOT VERIFIED | Network unavailable in this working container; Mac option remains |
| Importer execution on user's Mac and archive extraction | NOT RUN | User's Mac filesystem is inaccessible to GitHub connector |
| Full game/browser play, 404 network check and timing test | NOT RUN | Cannot assert production readiness |
| Original game file copy to GitHub | INTENTIONALLY SKIPPED | Third-party redistribution rights not established |
| Existing game index.html/game.js/style.css changed | NO | Preserved by design |

## Known problems / risks

1. The own game's dodged counter may count unrelated expiring shots as player dodges (see blueprint); test and fix.
2. Attack-move semantics, attack cancel and kiting cadence are not yet measured or validated at different frame rates.
3. The alpha's visuals do not meet the project's MOBA readability goals.
4. The missing archive might contain further minigames, graphics and dependencies; this reference library explicitly does not claim coverage.
5. Third-party original graphics and compiled code cannot be republished or integrated without a suitable license.

## The next three highest-value actions (in order)

1. **Run and verify the existing alpha in a browser.** Serve project root locally using python3 -m http.server 8080, test mode selection, right-click input, A+click, QWERF, pause/resume and restart. Record console/network errors with reproducible steps. **Acceptance:** both modes start and finish/restart without blocking errors; any actual failures get fixed.
2. **Repair the mechanic accuracy bottleneck.** Implement meaningful threat-based dodge counts and explicit attack windup/release/cancel/recovery, including targeting and range cues; add reproducible scenarios at 30/60/120 FPS. **Acceptance:** non-threatening shots do not count as dodges; pre-release move cancels damage; post-release move does not cancel committed projectile.
3. **Import full Mac-side reference inventory when accessible.** Run the committed import_local_refs.py on the Mac with loldodge-all-updated.zip, check private local-inventory.md, compare ZIP game roots and missing files, and update the public manifest with verified *metadata*. **Acceptance:** every discovered ZIP entry inventoried, each missing dependency honestly marked and no unlicensed originals committed.

## Hard constraints for Codex

- NO UNITY. Browser game first, free static hosting.
- Do not overwrite root application from the GameMaker reference.
- Do not push unlicensed third-party game code, art, ZIPs or collected analytics.
- Keep end-user progress visible: build → play → test → improve → commit → update this document.
- The reference analysis reflects static evidence, not observed exact League mechanics.
- Report precise GitHub commit links and test results, not aspirational completion.
