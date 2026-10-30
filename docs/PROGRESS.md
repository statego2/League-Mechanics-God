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

Commit: first implementation commit immediately preceding the next feature commit (find with `git log --oneline`).

## Tests actually run

- `node --test tests/game.test.cjs`: **10/10 PASS**, executes real game source with a minimal DOM and seeded randomness. Covers cancellation/release, chase, rapid retarget, attack-move travel/selection, dodge vs block accounting, fast swept collision, homing/target exclusivity, 30/60/120 FPS cadence, pause/restart/blur and both end conditions.
- `node --check game.js`: PASS.
- Actual IAB browser at 1280×900: initial alpha started; revised Kite starts, accepts right-click/A+click/QWERF, shows all cooldowns, pauses and renders. Console warning/error capture empty. Additional dodge/browser verification follows next batch.
- These automated tests are simulation regressions, not proof of cross-browser feel or a human 60-second playthrough.

## Known limits

- Original reference archives/art are absent from git by design. Read all reference docs/tools; use independent art and logic.
- No public deployment verified. Local server only; no claims about GitHub Pages.
- Current art remains primitive, hostile shots have no advance telegraph, no difficulty selection yet.
- No obstacles/pathfinding, audio, last-hit drill or skillshot lab yet.
- Attack range is center-to-center and calibrated for this arena, not a claim of exact LoL data.

## Next three actions

1. Telegraph and difficulty presets with reproducible seeds; line/fan and delayed ground AoE. Acceptance: readable fixed-direction warning before fire, deterministic retry and blocks distinct from movement dodges.
2. Original character silhouettes, walking/attack motion, terrain and impact cues. Acceptance: direction and hostile intent legible without imported assets.
3. Last-hit practice after existing drill regressions pass. Acceptance: real minion attrition, CS vs misses and repeatable timing pressure.
