# League Mechanics God — PROJECT VISION & AGENT INSTRUCTIONS

**Canonical project repository:** https://github.com/statego2/League-Mechanics-God  
**Project type:** Free, desktop-first, browser-based League of Legends–style mechanics training game  
**Current stage:** Playable prototype / early alpha, not a finished LoL-like game  
**Primary directive:** MAKE THE GAME BETTER AND PLAYABLE. Don't stop at writing plans.

> This is the single source of truth for every coding AI working on the project. Read this entire file, then inspect the actual repo and latest commits before changing anything. Update the progress log after meaningful work. Date of this brief: 2026-10-30.

## 1. The vision: what are we building?

Build **the best free browser-based training ground for League of Legends mechanical skills**: a game that someone can open instantly, practice for 5–20 minutes, and clearly feel they are improving.

Not a static website. Not a Unity project. Not an abstract survival game with circles. **A real, responsive, satisfying top-down/isometric-feeling training game inspired by LoL interactions**: familiar camera perspective, movement, positioning, player/enemy silhouettes, skillshots, attack rhythm, readable combat feedback, and a practice loop that develops transferable skills.

The ideal experience:
- Open a URL. Click **Play**. No installation, account, payment, or waiting.
- Feel **mouse-first movement** with right-clicking and immediate path retargeting.
- Recognize **attack range, attack windup, attack cooldown, attack-move and kiting**.
- Read and dodge enemy **projectiles, telegraphed abilities, AoE patterns and sequences**.
- Practice under pressure rather than relying on random arcade luck.
- See useful performance feedback: what hit, what was avoided, effective movement, attacks and CS.
- Repeat controlled challenges at increasing difficulty; notice improvement.
- Eventually practice **Bait → Dodge → CS**: bait an enemy ability, evade while staying positioned, and last-hit a minion.

**Success isn't "we have a lot of code." Success is "it plays well, feels familiar, and measurably trains mechanics."**

## 2. Experience pillars (use these to judge all decisions)

1. **League-like feel:** top-down combat readability, tight right-click, smooth movement, attack range, windups, projectile speed, collision, proper A-click, skillshots, clear health bars and feedback. Prioritize FEEL over cosmetic detail.
2. **Useful mechanical practice:** each challenge targets a trainable skill. Measure the skill accurately. Eliminate misleading scoring.
3. **Visual credibility:** stop looking like a generic geometric tech demo. Create a coherent arena, original unit silhouettes, basic animations, shadows, direction indicators, particles and feedback. It need not recreate League exactly to feel convincing.
4. **Instant accessibility:** free browser play, fast load, no mandatory backend, works on a typical desktop with mouse/keyboard.
5. **Iterative shipping:** test the actual game and release improvements often; prefer one tested feature over five proposed features.

## 3. Hard constraints and tech direction

- **NO UNITY.** The owner explicitly moved away from Unity. Do not revive Unity suggestions.
- **FREE** technologies, tooling, hosting and resources.
- **Browser-first desktop gameplay**; mouse + keyboard. Mobile is not an MVP priority.
- Existing vanilla **HTML + CSS + HTML5 Canvas + JavaScript** is the starting implementation. Keep it working, avoid unnecessary replatforming.
- The code lives and evolves in this GitHub repository. Use readable modular code when the growing project justifies it.
- A simple local server must run the application: \`python3 -m http.server 8080\`, then localhost:8080.
- GitHub Pages is the preferred first static deployment if configured and verified.
- Avoid required external APIs and expensive infrastructure. Keep development portable to the owner's Mac mini M4.
- All agents should leave the repo in a runnable state; do not replace the functional alpha with speculative scaffolding.

## 4. Where we are TODAY — checked against the actual GitHub code

Files confirmed on \`main\`:
- \`index.html\`: menu, arena canvas, HUD, buttons and hotkey hints.
- \`style.css\`: UI and arena layout.
- \`game.js\`: working implementation structure with game update/render loop.
- \`README.md\`: basic setup, two modes and controls.
- \`AGENTS.md\`: this document.

Existing modes (initial/alpha):
- **Dodge Trial:** survive for 60 seconds while enemies shoot skillshots.
- **Kite Arena:** fight up to ten enemies via movement, auto attacks and abilities.

Existing controls:
- Right click to move / target an enemy.
- A + left click to attack-move.
- Left click enemy to attack.
- Q/W/E/R and F for placeholder abilities / repositioning.
- P or Escape for pause; restart button.

**Known shortcomings:** crude placeholder visuals; rough fidelity to League mechanics; scoring and input consistency need validation; no verified complete asset/reference import; no verified public deployment. Example of a specific bug worth verifying: the dodge counter appears to count enemy shots that simply expire or exit bounds, instead of only genuine threats successfully avoided.

**Do not mistake existing code for final product.** Inspect and test the current implementation before claiming it works in every environment.

## 5. League of Dodge — reference material being transferred

Previous exploration downloaded or investigated files from https://loldodgegame.com/dodge/game.html and related mini-games, including:
- \`game.html\`
- \`dodge.js\`
- archive \`loldodge-all-updated.zip\`
- multiple HTML, JS, CSS, images, audio or other resources (exact inventory not yet confirmed on GitHub).
- A download script previously crashed with \`rel: unbound variable\`; the full asset set may be incomplete.

**Purpose:** make all available reference material easy for every future AI to inspect, compare and use as an implementation guide. The external game is a **reference collection**; this repository's existing playable app remains the product.

### Exact reference import layout

When an AI has access to the downloaded files, it should arrange:

\`\`\`text
League-Mechanics-God/
├── AGENTS.md                     <- this brief: always read first
├── README.md
├── index.html                    <- our actual playable game
├── game.js                       <- our actual playable game
├── style.css                     <- our actual playable game
├── reference/
│   └── league-of-dodge/
│       ├── README.md             <- what is here and how to inspect it
│       ├── manifest.md           <- source files, folders, sizes, missing files
│       ├── GAMEPLAY_ANALYSIS.md  <- observed mechanics and opportunities
│       ├── originals/            <- complete extracted reference tree, if available
│       └── archives/             <- original ZIPs, if feasible
└── docs/
    └── PROGRESS.md               <- verified work, issues, next tasks
\`\`\`

**For the import agent:**
1. Find and open the user's actual archive(s) and loose files. Verify which exist and where. Do not assume missing files exist.
2. Clone or open the repository and create the directories above.
3. **Preserve the original folder hierarchy and filenames** while extracting files into \`reference/league-of-dodge/originals/\`. Avoid flattening paths, renaming referenced assets or overwriting our production \`index.html\`/\`game.js\`/\`style.css\`.
4. Preserve any existing original ZIPs in \`reference/league-of-dodge/archives/\` where practical. If the hosting/file-size limit prevents that, store the extracted material and record where the archive is retained; don't let one large ZIP block useful progress.
5. Inventory modes, entry points, nested dependencies, duplicates, missing resources, and functionality. Record broken paths/404s and the earlier downloader bug.
6. Commit the reference collection separately from actual game changes. Push to GitHub and verify resulting files on the remote.
7. Report exactly what got uploaded, what failed, repository commit URL, and precise next actions for Codex.
8. Never mix raw reference files into the live gameplay directory or silently replace our current game with the reference game.

If an agent cannot access local files or push to GitHub, provide a **ready-to-run Mac Terminal script** targeting the user's specific local ZIP paths and the above repository layout, then clearly state what the user must run.

## 6. Product roadmap — priority order

### Milestone 0 — Assemble the project and validate the starting point
- Import and document all available League of Dodge reference material in its own folder.
- Run the current app locally, visually inspect the page, and PLAY both modes.
- Identify actual blockers, console errors, input bugs, win/loss, scoring, pause/resume/restart and resizing problems.
- Start \`docs/PROGRESS.md\`: current state, tests performed, known issues and next priorities.
- If available, set up working GitHub Pages. Only communicate the URL after verifying it works.

**Done when:** any new coding agent can clone the repo, launch the game and find all confirmed reference material without previous chat context.

### Milestone 1 — Make movement & kiting feel right (highest priority)
- Right-click move and rapid retargeting.
- Stable world coordinates across resizing.
- Consistent player speed and motion at different FPS.
- Attack radius + visible range feedback.
- Windup, release, recovery, attack cooldown, auto-targeting, windup cancellation.
- A-click/attack move with understandable, testable rules.
- Stop/continue movement and attack commands without jank.

**Done when:** players can repeatedly kite a moving target in a controlled training mode, with responsive and predictable results.

### Milestone 2 — Make dodging a real skill trainer
- Reliable hitbox/collision and readable telegraphs.
- Distinct shots: linear, spread/cone, moving walls, delayed AoE and targeted-but-dodgeable patterns.
- Difficulty curve and repeatable challenge presets.
- Track *real* dodge opportunities vs hits, not projectiles that harmlessly expired.
- Provide concise actionable end-of-run feedback.

**Done when:** survival depends on recognizing threats, spacing, timing and movement rather than guesswork.

### Milestone 3 — Look and feel more like LoL
- Replace crude placeholder circles/polygons with an original but recognizable **champion-like top-down character** and enemy shapes with directional animation.
- A readable lane/arena, ground and wall elements, attack/projectile effects, HP bars, cast feedback and good HUD.
- Improve camera framing, sizing and combat clarity without sacrificing FPS or control accuracy.

**Done when:** a player immediately recognizes a LoL-inspired mechanics trainer rather than a generic geometric shooter.

### Milestone 4 — Bait → Dodge → CS (signature mode)
- Add minions and deterministic HP reduction/last-hit timing.
- Enemy skillshot pattern that can be intentionally baited.
- Evaluate whether player avoided the shot **and** secured the CS safely.
- Difficulty levels and quick reset / retry loop.

**Done when:** this is a compelling short drill with genuinely useful feedback.

### Milestone 5 — Quality, progression, and expansion
- Save records/settings locally.
- More training patterns and benchmarks.
- Better sounds (optional), accessibility options, training feedback, desktop polish.
- Browser release, CI checks and simple documented deployments.
- Expand only after core mechanics are satisfying.

## 7. Priority queue for the next development agent

**Immediately after reference import:**
1. Clone current repo, read this file + reference README/manifest + \`README.md\`.
2. Start the game and perform an actual smoke test; document verified outcomes.
3. Fix the most impactful actual gameplay bug (including dodge counter if confirmed).
4. Improve right-click movement, attack timing and A-click toward a coherent LoL-like training feel.
5. Run another smoke test and commit the changes.
6. Continue to the next highest-value improvement, rather than stopping at a report.

## 8. Mandatory agent workflow and handoff

At the start:
- Read \`AGENTS.md\`, \`README.md\`, \`docs/PROGRESS.md\` (if exists), and \`reference/league-of-dodge/\` (if present).
- Inspect the repository tree and recent commits. Distinguish verified facts from past-chat assumptions.
- Pick one player-visible improvement and define a short acceptance test.

During work:
- Implement, run, fix, retest. Maintain the runnable game.
- Do **not** spend all available effort on plans, README rewrites, tooling migration or meaningless cleanup.
- Prioritize **correct controls → satisfying combat → readable graphics → training depth**.
- Avoid drastic rewrites unless they clearly unblock a working result.
- Use multiple small commits with meaningful messages; work in a branch/PR when the environment supports it.

At the end:
- Update \`docs/PROGRESS.md\` with:
  - Working features
  - What changed
  - Actual tests performed and results
  - Remaining bugs/limitations
  - Exact next three tasks
  - Commit / PR / deployment links when real
- Give the next AI everything necessary to continue independently.
- Never say "deployed", "tested" or "uploaded" without verification.

## 9. Definition of done

A change counts as complete if it is genuinely integrated, runnable in a browser, behaviorally testable, doesn't break the two existing modes, has clear player value and leaves the repository in a usable state.

**Ultimate product test:** "I can open this game in the browser, practice LoL-like mechanics, and see myself improving." If a proposed feature does not help that test, deprioritize it.
