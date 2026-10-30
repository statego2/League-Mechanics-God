# Development progress — 2026-10-30

Read PROJECT_BLUEPRINT.md first. Browser Canvas product; no Unity or paid dependencies.

## Visual direction clarified by user

The user expects the game to look and feel like League of Dodge / League: a convincing three-quarter, pseudo-3D MOBA camera, substantial champion-like characters and a cohesive lane environment. The current flat vector arena does not meet this bar. Treat this as a high-priority product requirement, not optional polish. Observe the reference in a browser and compare actual gameplay before implementing; retain functional controls and hitbox readability. The repository contains analysis and import tools, not a complete copied game or its original assets.

## Current playable state

Dodge Trial, Kite Arena and Last-Hit Lab run locally at http://localhost:8080. The repository was cloned into the `League-Mechanics-God` subdirectory of the original workspace, whose parent contains separate historical Unity research. Work is on `codex/controls-and-dodge`, based on `7de3430`.

## Completed: controls and collision foundation

- Persistent right-click attack orders chase the live target; newest movement/target command wins.
- A + click travels and acquires targets in range, preferring units near the clicked destination.
- Explicit windup → release → recovery: movement cancels uncommitted attacks; launched autos home to their target and survive movement. Stop with S.
- Fixed 120 Hz simulation; swept relative-motion collision for missiles; nearest collision selection for piercing-free skillshots.
- Dodges require an actual trajectory threat within 0.8 s before avoidance. Pulse/invulnerability blocks are separate; unrelated expired shots score zero.
- Range, target, windup, cooldown/ready cues; results report released/cancelled autos, hits and blocks.
- Blur/tab hiding pauses; restart clears state and restores the pause button label.

Commit: `ce38142` — persistent attack orders, cancellable windups and truthful dodge scoring.

## Completed: readable, reproducible encounters

Commit: `34830db`.

- Foundation/Standard/Expert presets and selectable encounter seed. Restart rewinds gameplay RNG; cosmetic particles use a separate RNG.
- Locked-aim line/fan telegraphs, stationary casting enemies, delayed ground-circle impacts every third Dodge cast. Ground avoidance and invulnerability blocks respect threat accounting.
- Original vector ranger/mage silhouettes, directional weapons, articulated steps, player health/hurtbox, floating damage and stone court. No third-party art.
- Browser: Foundation selected, seed changed to 177858, Dodge Trial started; movement, seed HUD, new art and health displayed correctly.

## Completed: Last-Hit Lab and drill navigation

Commit: `89e7529`.

- Five waves / 15 possible CS. Allied caster missiles travel and damage enemy minions; only the player's killing blow earns CS. Misses are counted once per allied kill or unresolved minion at timeout.
- Gold health bars and a damage threshold mark the 28-damage last-hit window. Q/E/R disabled for this drill; W/F remain available. Adjacent waves settle in different columns to keep targets selectable.
- Results report CS, misses and cancelled autos; Kite results include auto DPS and movement time.
- Hold right mouse while moving the cursor to update orders. DRILLS button returns to selection without reload; held pause keys no longer toggle repeatedly.
- Real browser verified: right-click selected the middle minion, displayed windup, released autos and earned **1 CS**; allied kills then increased MISSED to **2**. No console errors/warnings captured. Pause displayed the correct frozen counters.

## Tests actually run

- `node --test tests/game.test.cjs`: **19/19 PASS**, executes real game source with a minimal DOM and seeded randomness. Covers cancellation/release, chase, rapid retarget, attack-move travel/selection, dodge vs block accounting, fast swept collision, homing/target exclusivity, 30/60/120 FPS cadence, pause/restart/blur and both end conditions; locked aim, line/fan/AoE sequence, ground threat scoring, seed reproducibility; full 15-minion unattended resolution, CS vs allied projectile kills, spell restrictions, held mouse retargeting and drill navigation; death immediately freezes unresolved hazards.
- `node --check game.js` and `git diff --check`: PASS.
- Python reference tools: `python3 -m unittest discover -s reference/league-of-dodge/tools -p 'test_*.py'`: **7/7 PASS**.
- HTTP server logs: app, JS and CSS return 200/304; initial missing favicon fixed with an original SVG icon.
- Actual IAB browser at 1280×900: initial alpha started; revised Kite starts, accepts right-click/A+click/QWERF, shows all cooldowns, pauses and renders. Console warning/error capture empty. Dodge Trial also reached its loss/results screen in the browser, showing 9 hits and 0 false dodges; full manual survival/win playthroughs remain unverified.
- These automated tests are simulation regressions, not proof of cross-browser feel or a human 60-second playthrough.

## Known limits

- Original reference archives/art are absent from git by design. Read all reference docs/tools; use independent art and logic.
- Gameplay CI workflow added for pushes/PRs; remote run status has not been verified.
- No public deployment verified. Local server only; no claims about GitHub Pages.
- Visuals are original procedural vectors; further animation and sound polish remain.
- No obstacles/pathfinding, audio, skillshot lab or combined lane pressure yet. Last-Hit Lab is timing practice without hostile enemy pressure.
- Attack range is center-to-center and calibrated for this arena, not a claim of exact LoL data.

## Next three actions

1. Upgrade the camera, characters and environment to a convincing League-like three-quarter presentation, informed by direct gameplay observation; keep the three drills playable. Acceptance: visual depth, readable animated champion silhouettes, lane terrain and matching hitboxes.
2. Build Bait → Dodge → CS on top of Last-Hit Lab. Acceptance: telegraphed enemy casts create a safe CS window; scoring distinguishes bait/dodge/CS and HP cost.
3. Improve kite results and add local best records. Acceptance: auto damage / attack cadence feedback, storage failure never breaks play.

