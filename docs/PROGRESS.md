# Development progress — 2026-10-30

Read PROJECT_BLUEPRINT.md first. Browser Canvas product; no Unity or paid dependencies.

## Current playable state

Dodge Trial and Kite Arena run locally at http://localhost:8080. The repository was cloned into the `League-Mechanics-God` subdirectory of the original workspace, whose parent contains separate historical Unity research. Work is on `codex/controls-and-dodge`, based on `7de3430`.

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

- Foundation/Standard/Expert presets and selectable encounter seed. Restart rewinds gameplay RNG; cosmetic particles use a separate RNG.
- Locked-aim line/fan telegraphs, stationary casting enemies, delayed ground-circle impacts every third Dodge cast. Ground avoidance and invulnerability blocks respect threat accounting.
- Original vector ranger/mage silhouettes, directional weapons, articulated steps, player health/hurtbox, floating damage and stone court. No third-party art.
- Browser: Foundation selected, seed changed to 177858, Dodge Trial started; movement, seed HUD, new art and health displayed correctly.

## Tests actually run

- `node --test tests/game.test.cjs`: **13/13 PASS**, executes real game source with a minimal DOM and seeded randomness. Covers cancellation/release, chase, rapid retarget, attack-move travel/selection, dodge vs block accounting, fast swept collision, homing/target exclusivity, 30/60/120 FPS cadence, pause/restart/blur and both end conditions; locked aim, line/fan/AoE sequence, ground threat scoring, seed reproducibility.
- `node --check game.js`: PASS.
- Actual IAB browser at 1280×900: initial alpha started; revised Kite starts, accepts right-click/A+click/QWERF, shows all cooldowns, pauses and renders. Console warning/error capture empty. Additional dodge/browser verification follows next batch.
- These automated tests are simulation regressions, not proof of cross-browser feel or a human 60-second playthrough.

## Known limits

- Original reference archives/art are absent from git by design. Read all reference docs/tools; use independent art and logic.
- No public deployment verified. Local server only; no claims about GitHub Pages.
- Visuals are original procedural vectors; further animation and sound polish remain.
- No obstacles/pathfinding, audio, last-hit drill or skillshot lab yet.
- Attack range is center-to-center and calibrated for this arena, not a claim of exact LoL data.

## Next three actions

1. Add Last-Hit Lab using existing attack mechanics. Acceptance: real minion attrition, CS vs misses, repeatable timing pressure.
2. Improve kite results and add local best records. Acceptance: auto damage / attack cadence feedback, storage failure never breaks play.
3. Add skillshot prediction drill and more patterns after regressions pass. Acceptance: accuracy reflects actual fired/hit counts; no unavoidable spawn overlaps.
