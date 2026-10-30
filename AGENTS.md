# AGENTS.md — League Mechanics God

> Canonical instructions for all coding agents working on this repository.
> Read this file and `README.md` before modifying code. Treat checked-in source and actual tests as the source of truth; this document is the product direction and operating contract.
> Last project-context update: 2026-10-30.

## 1. Mission

Build a genuinely enjoyable, **free, desktop-browser-based, League-of-Legends-style mechanics training game**. The outcome must be playable and help players improve **movement, dodging, spacing, kiting/orbwalking, attack-move, skillshot accuracy, and eventually CS/lane fundamentals**.

This is an **original independent training game**, not an official Riot product, an asset rip, or a recreation of League of Legends itself. The important target is responsive controls, useful skill practice, clear visual feedback, and a recognizable *gameplay feel*. It must not simply look like an abstract tech demo.

**User priority:** something that **works** and feels closer to League, rather than more design documents.

## 2. Hard product and engineering constraints

- **No Unity.** Earlier Unity exploration was explicitly abandoned.
- **Free to build and play.** No paid APIs, required subscriptions, paid hosting, or paid assets.
- **Runs in a desktop browser**, using mouse and keyboard. Prefer fast startup and static hosting.
- The current vanilla **HTML/CSS/Canvas/JavaScript** stack is the starting point. Improve it incrementally; do not introduce React, TypeScript, a bundler, or a game engine merely out of preference. A migration requires a concrete, documented benefit and a working tested replacement.
- **GitHub is the source of truth**. Keep code, docs, tasks, test instructions, and provenance together. Prefer small reviewable changes, never force-push or destroy existing work.
- **Ship vertical slices**: playable improvement -> test -> commit -> next improvement.
- No backend, authentication, analytics tracking, or leaderboard in the MVP unless specifically approved.
- Desktop-first controls; accessible UI and mobile support are later considerations.
- The repository is PUBLIC: do not commit credentials, private data, unlicensed assets, or copied third-party source.

## 3. Verified baseline on 2026-10-30

Canonical repository: `https://github.com/statego2/League-Mechanics-God`, default branch `main`.

Files that were directly inspected:
- `README.md`: alpha instructions, controls, goals, and limitations.
- `index.html`: current page and HUD.
- `style.css`: styling.
- `game.js`: actual HTML5 Canvas gameplay implementation.

Current modes in the inspected code:
1. **Dodge Trial**: 60-second survival against enemy skillshots.
2. **Kite Arena**: fight enemies with movement, auto attacks, Q/W/E/R/F, and attack-move.

Current controls: right-click movement / target acquisition; A then left-click attack-move; left-click to attack enemies; Q/W/E/R/F abilities; P or Esc pause.

**Do not assume** this alpha is polished, visually LoL-like, fully tested, publicly deployed, or functionally equivalent to League. Verify all such claims. GitHub Pages was mentioned in `README.md` as an option, but no live deployment has been verified here.

Potential correctness issue directly observed in `game.js`: the `dodged` counter increments for hostile projectiles that simply expire or leave the world, regardless of whether they truly threatened the player. Revisit the dodge metric rather than treating it as validated skill feedback.

## 4. External research: League of Dodge / LoLDodgeGame

Previous exploration investigated `https://loldodgegame.com/dodge/game.html` and its referenced JavaScript/assets. The user has worked with files such as `game.html`, `dodge.js`, and an archive called `loldodge-all-updated.zip`. Previous work attempted to collect resources across multiple mini-games; the completeness and locations of these files are **not verified in this repo**. An earlier download script failed with `rel: unbound variable`; do not assume its downloads succeeded.

These materials are **references for studying mechanics and architecture**, not automatically licensed implementation assets.

### Import / research handoff protocol

When an agent has access to the original LoLDodgeGame files or the user's archive:

1. Inventory the actual files and directories. Report number, sizes, formats, missing dependencies, duplicate assets, entry points, and any broken URLs. Do not invent paths or claim all files are present without checking.
2. Check each source's license/permissions. Publicly readable code or an accessible browser resource is **not** automatically open-source or authorized for copying to a public GitHub repository.
3. Create `research/loldodge/README.md` with original URLs, inspection date, source notes, rights/provenance status, architecture observations, and an inventory summary.
4. Create `research/loldodge/manifest.json` recording, where available: relative path, origin URL, size, SHA-256, file type, license/permission evidence, and whether the item is checked in or withheld.
5. Create `research/loldodge/analysis.md`: document input feel, movement, attack timing, projectile types, spawn patterns, hitboxes, dodge tracking, difficulty, camera/visual effects, and what we can reproduce with **our own implementation**.
6. For items with **verified permission to redistribute**, place permitted files in `third_party/loldodge/` (not in the live app), retain their license/attribution notices, and clearly distinguish third-party reference files from our source. If permission is unclear or absent, **do not commit the third-party source or assets**; retain only links, file inventory/metadata, and original high-level analysis in the public repo.
7. Ensure that no reference code or third-party artwork is silently used in `index.html`, `style.css`, or `game.js`. Our shipping product must use original code/visuals or explicitly compatible licensed materials.
8. Summarize precisely what was imported, withheld, missing, or blocked; give the next agent a concise dependency and next-action list.

Do not upload a ZIP full of unreviewed third-party material just to make it available to the next AI. A structured, lawful, useful research handoff is better.

## 5. Product vision and staged roadmap

### P0 — Establish a trustworthy, reproducible playable baseline
- Clone and run the current app locally with a simple server, e.g. `python3 -m http.server 8080`; verify `http://localhost:8080`.
- Confirm menu, both modes, pointer inputs, keyboard inputs, win/loss, pause, restart, canvas sizing, and absence of browser console errors.
- Add small, useful automated tests where practical. Consider extraction of pure gameplay geometry/logic into testable functions without breaking the app.
- Document actual bugs (not speculations); fix severe control, scoring, and gameplay failures first.
- Make the repository easy for another agent to clone, run, and validate.
- Check whether GitHub Pages is configured, and only claim a playable public URL if actually verified.

### P1 — Core mechanics feel (highest gameplay priority)
- **Click-to-move feel:** responsive right-click, accurate arrival, movement cancellation/retargeting, no accidental browser context menu, consistent world/screen mapping.
- **Attack and kite feel:** believable attack range, attack cooldown, wind-up, release timing, stop/cancel behavior, and A-click/attack-move semantics. Avoid promising frame-perfect League replication.
- **Skillshots and dodging:** readable telegraphs, varied shapes and speeds, fair collision boxes, per-projectile outcomes, proper dodges/hits, difficulty progression, trustworthy metrics.
- **Input and frame stability:** separate game state update and rendering; avoid frame-rate-dependent mechanics; ensure pause doesn't generate simulation time jumps.
- Add practice toggles and feedback only if they improve the training loop.

### P2 — Make it feel like a lane/combat trainer, not an abstract geometric demo
- Original top-down/isometric-looking arena, units, shadows, range indicators, animations, impact feedback, readable attack/projectile effects, and usable HUD.
- Aim for League-inspired readability and control, **without copying proprietary maps, champions, skins, sounds, icons, or textures**.
- Validate appearance by viewing and playing the actual browser build, not by approving code alone.

### P3 — Purpose-built training modes
- Refine **Dodge Trial** and **Kite Arena** before adding more modes.
- Build a **Bait -> Dodge -> CS** training loop: provoke a skillshot, dodge it while maintaining positioning, then secure a minion last-hit. This is a desired future mechanic, **not a currently implemented feature**.
- Expand with last-hitting drills, spacing/trading exercises, controlled skillshot patterns, and difficulty settings when the foundations are strong.

### P4 — Learning and progression
- Useful metrics: survival, damage taken, *valid* dodges/attempted dodges, hits, precision, attack downtime, CS achieved, and improvement across sessions.
- Add local saved settings/progression and repeatable benchmark scenarios where useful.
- Avoid gamified numbers that fail to measure the underlying skill.

## 6. Agent execution procedure (every working session)

1. Read `AGENTS.md`, `README.md`, then inspect the current tree, latest commits, and any `research/loldodge/` artifacts.
2. **Verify** current code and available reference files before planning. Do not assume the last chat or another AI successfully imported, fixed, or deployed anything.
3. Choose the highest-value next playable improvement. Prioritize correctness, controls, visual readability, and fun over extra architecture or documents.
4. Implement and actually run checks. Minimum relevant checks: syntax validation, localhost browser/manual interaction or browser automation if available, and regression of pause/restart/scoring.
5. Keep each feature small enough to test; commit coherent changes to the working branch and open a PR if the workflow supports it. Do not rewrite unrelated code.
6. Update `README.md` for user-facing changes; update `docs/PROGRESS.md` (create it if missing) with: completed, tested, known issues, next three priorities, and URLs to commits/PRs.
7. In the final handoff, distinguish **Implemented / Tested / Not tested / Blocked / Next** and link real commits/PRs. Never claim deployment or tests succeeded unless verified.
8. Continue autonomously on additional valuable tasks within the session, unless truly blocked; don't stop after producing a plan.

## 7. Definition of Done

A gameplay feature is done only when:
- It runs in the actual browser and matches the intended controls/feedback.
- Existing modes still start, pause, resume, end, and restart correctly.
- Errors and regressions are checked; relevant automated tests pass when available.
- No unlicensed or copied third-party assets/code, secrets, or broken external dependencies have been introduced.
- A human player can clearly see what changed and how to use it.
- Code and progress information are committed or presented as a clearly identified uncommitted patch.

## 8. Decision principles

- **Working game > impressive-looking plan.**
- **Feel and fairness > asset quantity.**
- **Original implementation + lawful references > copying an entire browser game.**
- **Measured, playable improvement > unverified claims.**
- Preserve the owner's autonomy: when a major product/architecture direction is uncertain, state the trade-off, choose a reversible default, and keep moving.
