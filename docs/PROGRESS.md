# Development progress — 2026-10-30

Read PROJECT_BLUEPRINT.md first. Browser Canvas product; no Unity or paid dependencies.

## Visual direction clarified by user

The user expects the game to look and feel like League of Dodge / League: a convincing three-quarter, pseudo-3D MOBA camera, substantial champion-like characters and a cohesive lane environment. The current flat vector arena does not meet this bar. Treat this as a high-priority product requirement, not optional polish. Observe the reference in a browser and compare actual gameplay before implementing; retain functional controls and hitbox readability. The repository contains analysis and import tools, not a complete copied game or its original assets.

## Visual pass (2026-10-30)

- Observed the actual League of Dodging V2 in the browser: upright character, oblique view, organic green ground, winding dirt paths and rocks. Its visual assets were not copied.
- Replaced the geometric court with an original procedural lane, grass and rocks; drew upright animated player and enemies with feet anchored at their existing collision centres and raised health bars. This is an incremental 2D approximation, still substantially simpler than the reference; high-quality character sprites, environment assets, occlusion and full directional animation remain needed.
- `node --test tests/game.test.cjs`: 19/19 pass; browser smoke-tested Kite Arena rendering. No full manual run completed.

## Painted art pass (2026-10-30)

- Generated and integrated original `assets/arena-lane.png` and transparent `assets/ranger.png`; prompts and limitations are in `assets/README.md`. Original procedural scene and character remain as image-load fallbacks. Rocks and foliage are decorative and do not block movement.
- Ranger now has a detailed sprite, mirrored facing, movement bob and windup tilt; this is one pose, not full directional or attack animation. Enemies and minions still need matching artwork. Enemy body clicks now select the ground-anchored target.
- Browser smoke test: Kite Arena and Last-Hit Lab render the painted lane; Last-Hit Lab shows sprite, minions, health and HUD. No console warnings/errors in the final browser test. `node --test tests/game.test.cjs`: 20/20 pass, including elevated body selection. Full manual completion and cross-browser/performance checks remain outstanding.

## Skillshot and records (2026-10-30)

- Added Skillshot Lab: 45 seconds, three seeded moving targets, Q at 0.8s cooldown, W/F mobility, and a results breakdown of hits/shots/accuracy. Auto-attacks and E/R disabled in this drill. Q projectiles still in flight when the timer ends count as fired but not hit.
- Local personal bests are recorded per drill and difficulty: Dodge points, Kite kills, Last-Hit CS, Skillshot hits. Storage failures are caught and do not interrupt play; seed is not part of the record key.
- Tests: `node --test tests/game.test.cjs` 22/22 pass including accuracy, timer and storage failures. Browser smoke: Skillshot selected, Q raised SHOTS to 1, pause froze counters; full manual run not yet done.

## Mid lane and combined drill (2026-10-30)

- Commit `5c07181` adds Skillshot Lab and local records. This session also adds Bait → Dodge → CS: three rounds; enter the ring to trigger a locked shot, evade or take damage, then last-hit within three seconds. Must leave the ring before triggering the next round; offensive abilities disabled. Bait, dodge, CS, misses and damage are reported separately. Dash/flash immunity does not count as a dodge.
- Added `assets/mid-lane.png`, `mage.png` and `minion.png` via built-in image generation (full prompts in assets/README.md), retaining procedural fallbacks. The image evokes mid lane but is not an exact map: walls, river and trees are decorative, with no collision or pathfinding. Sprites are single poses, not directional animation sets.
- Tests `node --test tests/game.test.cjs`: 27/27 pass, including successful bait/dodge/CS, failed rounds, spawn separation, early attack restriction and rendered asset/fallback paths. Browser verified new scene, Bait ring and enemy cast causing 18 damage and transition to round two. Complete human run not tested. Skillshot Q and pause verified in browser; no manual full accuracy run.
- Next: implement actual lane topology and pathfinding with visible collision boundaries; create directional animated sprites and test a full run at varying performance; expand Bait scenarios with allied minion attrition and calibrate enemy timing.

## Directional sprites and lane feel (2026-10-30)

- Added original `assets/ranger-back.png` and `assets/ranger-front.png`, generated from the ranger reference; prompt provenance is in assets/README.md. The renderer chooses front/back/side according to facing, mirrors left/right, retains the fallback for unavailable artwork and depth-sorts player/enemies by ground Y. These are static poses with bob/tilt, not full animations.
- Telegraphs show the projectile width and windup progress. Enemies enter from lane ends and target spawns stay separated; Last-Hit minions are positioned within the painted lane.
- Bait minion starts at 34 health and an allied projectile starts damaging it only during the CS window. This adds a real contested last-hit; the gold threshold remains 28. Added T for instant retry in play, pause and results. Menu uses two columns on desktop for all five drills.
- Browser smoke: Last-Hit starts on the new lane with red/blue minion art; right-click movement displayed the new directional art. Earlier browser test verified bait cast, damage and round transition. `node --test tests/game.test.cjs`: 29/29 pass including facing/fallback and three-round bait failure/success. Human completion, all difficulty balancing, mobile and cross-browser testing are not complete.

## Current playable state

Dodge Trial, Kite Arena, Last-Hit Lab, Skillshot Lab and Bait → Dodge → CS run locally at http://localhost:8080. The repository was cloned into the `League-Mechanics-God` subdirectory of the original workspace, whose parent contains separate historical Unity research. Work is on `codex/controls-and-dodge`, based on `7de3430`.

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

- `node --test tests/game.test.cjs`: **29/29 PASS**, executes real game source with a minimal DOM and seeded randomness. Covers cancellation/release, chase, rapid retarget, attack-move travel/selection, dodge vs block accounting, fast swept collision, homing/target exclusivity, 30/60/120 FPS cadence, pause/restart/blur and both end conditions; locked aim, line/fan/AoE sequence, ground threat scoring, seed reproducibility; full 15-minion unattended resolution, CS vs allied projectile kills, spell restrictions, held mouse retargeting and drill navigation; death immediately freezes unresolved hazards; Skillshot accuracy, safe target spawn, local records, full Bait success and failure, and artwork fallbacks.
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
- No obstacles/pathfinding, audio or full lane scenario yet. Last-Hit Lab is timing practice without hostile enemy pressure.
- Attack range is center-to-center and calibrated for this arena, not a claim of exact LoL data.

## Next three actions

1. Upgrade the camera, characters and environment to a convincing League-like three-quarter presentation, informed by direct gameplay observation; keep the three drills playable. Acceptance: visual depth, readable animated champion silhouettes, lane terrain and matching hitboxes.
2. Extend Bait → Dodge → CS with moving opponents and more varied allied minion attrition. Acceptance: distinct bait, dodge, CS and HP metrics remain trustworthy.
3. Improve animation and combat feedback with directional sprite animations; check performance and visibility during a complete run.

