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
- Local personal bests are recorded per drill and difficulty: Dodge points, Kite wins and fastest winning time (or most kills before the first win), Last-Hit CS, Skillshot hits. Storage failures are caught and do not interrupt play; seed is not part of the record key.
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
- Browser smoke: Last-Hit starts on the new lane with red/blue minion art; right-click movement displayed the new directional art. Earlier browser test verified bait cast, damage and round transition. `node --test tests/game.test.cjs`: 29/29 pass including facing/fallback and three-round bait failure/success. A full 45-second Skillshot browser run reached results with 0/1 shots and 0% accuracy; the local-best display appeared. A successful human full run, all difficulty balancing, mobile and cross-browser testing are not complete.

## Kite personal best correction

Kite records now prefer a completed run, then the fastest victory; before the first win, the best kill count (then survival time) is retained. Old v1 Kite kill-only records are not migrated. Storage failures still leave the drill playable. Regression suite: 30/30 PASS.

## First physical walls and pathfinding (2026-10-30)

- Added `world.js` with two hand-authored, visibly outlined rectangular wall proxies, a visibility-graph pathfinder and swept movement clipping. Right-click and attack-move route around them; enemies replan while chasing. Clicking inside a wall selects a nearby walkable point. Dash stops at walls; Flash crosses walls but lands outside them. The exact League collision map is not available, and the remaining illustrated rocks, foliage and river are decorative. Projectiles currently pass through walls.
- `node --test tests/*.test.cjs`: **40/40 PASS**, including 500 seeded start/goal paths, click inside wall, dash/flash, retarget during detour, attack-move and enemy chase around a wall; existing gameplay suite remains green. Updated CI to run both files.
- Browser: Last-Hit opened with wall outlines; a right-click sent the character across to the opposite side of the upper wall. An unattended five-wave run finished with 0/15 CS and 15 missed, with results displayed. No console warning/error was observed at start. Exact wall-to-art alignment, full user playthroughs and cross-browser behavior still need work.

## Moving opponent and CS calibration (2026-10-30)

- Bait caster now patrols a small seeded path, locks position and aim for the cast, and shifts its starting position each round. Minion HP is 34/36/40 for easy/normal/hard respectively; allied damage and timing create a last-hit window on every preset. The earlier constant-34 description records the prior implementation.
- `node --test tests/*.test.cjs`: **42/42 PASS**. Tests cover caster moving/locking, a valid last-hit window for every difficulty, wall navigation and all existing drills.
- Browser: in Bait, used mouse movement to enter threat radius and dodge, then selected the minion during the allied-damage window; HUD showed **1 dodge, 1 CS and 160/160 HP** at round 2. Browser console warnings/errors: none.

## Threat scoring and optional sound (2026-10-30)

- Fixed Bait avoidance resolution: the shot must actually pass the player (or leave the arena); running away on its line no longer causes an early false dodge while it is still approaching. Added a regression where it eventually catches the player.
- Added optional synthesized Web Audio cues for attack release, impact, damage and avoidance; disabled by default and enabled by the SOUND button. Missing/failed audio never interrupts simulation. Browser checked ON/OFF button and no console warnings/errors; automated checks exercise missing audio and enabled/muted cues. Actual subjective audio quality and other browsers remain unverified.
- `node --test tests/*.test.cjs`: **45/45 PASS**. CI runs both game and world suites.

## Initial Lane Scenario (2026-10-30)

- Added a 60-second combined drill: five allied/minion waves and one enemy champion that attacks the player. The enemy respawns after a 12-second timer if dead. All Q/W/E/R/F abilities are available. Results distinguish player CS, allied misses, enemy defeats, avoided threats, hits and damage; a minion last-hit does not heal the player. Local best is CS by difficulty.
- `node --test tests/*.test.cjs`: **48/48 PASS**, including 60 seconds/15 minions, CS vs champion attribution, health behavior and all previous wall/control/scoring tests. Browser: Lane Scenario started with enemy/minions and abilities, enemy dealt 18 damage, an unattended run ended after death and showed 0 CS, 6 missed and 9 hits. This is a basic single-opponent scenario; no complete human victory/balance evaluation has been performed.

## Restart and finish consistency (2026-10-30)

- Reset clears old toast feedback. A finishing Pulse stops processing further enemies and missiles immediately, and fatal contact stops the rest of the enemy update. This keeps the displayed result, kills and block totals consistent with the actual final state.
- `node --test tests/*.test.cjs`: **51/51 PASS**, including finish-on-first-target, fatal-contact ordering and toast reset. Earlier human-controlled browser test confirmed 1 dodge + 1 CS at full health in Bait; Lane Scenario browser test verified enemy damage and a loss/results screen. Terrain remains approximate rather than the actual LoL collision mesh.

## Attack speed presets (2026-10-30)

- Menu offers 0.80, 1.39 (original default), and 2.00 attacks/second; windup scales proportionally. Apply on start/retry, HUD shows the chosen value. Records are separated by difficulty and speed; standard keeps existing record keys.
- A target escaping beyond release tolerance during windup now counts as a cancelled attack and consumes no cooldown.
- `node --test tests/*.test.cjs`: **54/54 PASS**; all three speeds have expected attack counts at 30/60/120 FPS, and records are separated. Browser selected 2.00 and started Kite Arena with the correct HUD. Full manual kiting feel and difficulty balancing remain unverified.

## Dodge sweeping wall (2026-10-30)

- Dodge Trial now telegraphs a sweeping row of missiles starting at 14 seconds and every 18 seconds thereafter, with a 1.4-second warning and a marked gap. Gap centre is constrained to the unobstructed middle lane; missile speed scales with difficulty. The normal per-projectile threat logic applies. Other enemy skillshots can overlap this pattern, so combinations still need human balance testing.
- `node --test tests/*.test.cjs`: **56/56 PASS**. Tests cover safe-gap collision/dodge accounting, walkability across the corridor, pause, and restart. Browser: played Foundation to 14 seconds, observed warning, gap, three dodges and 124/160 HP; subsequently died at 18.3 seconds and saw results. Console warnings/errors: none. A human full completion is still unverified.

## Kiting timing feedback (2026-10-30)

- Kite results show the time the auto was ready with at least one enemy in range and no active windup, alongside auto DPS, release/cancel count, movement percentage and damage received. This is descriptive: waiting can be intentional while dodging or spacing.
- `node --test tests/*.test.cjs`: **57/57 PASS**; the timing metric increases while idle and remains near zero during continuous attacks in a controlled fixture. No human calibration of this feedback yet.

## Ahri and real skillshot direction (2026-10-30)

- Added an opt-in Ahri timing preset: 0.668 attacks/s and 20% windup, based on Riot patch 13.22. The normal prototype default and its records remain unchanged. This preset changes timing only: it does not yet implement Ahri damage, range, movement, projectile speed, resistances or abilities.
- The Blueprint now contains a sourced, patch-aware plan for a full level-1 Ahri baseline, CS with mitigation, a consistent unit scale and real Lux Q / Ezreal Q training. Those spells are not yet implemented. Community wiki values still need in-client verification.
- `node --test tests/*.test.cjs`: **60/60 PASS**, including timing and windup at 30/60/120 FPS. No manual Ahri preset playthrough yet.

## Current playable state

Dodge Trial, Kite Arena, Last-Hit Lab, Skillshot Lab, Bait → Dodge → CS and Lane Scenario run locally at http://localhost:8080. The repository was cloned into the `League-Mechanics-God` subdirectory of the original workspace, whose parent contains separate historical Unity research. Work is on `codex/controls-and-dodge`, based on `7de3430`.

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

## Latest continuation: complete Bait run and narrow-screen results

- A manual browser run completed all three Bait → Dodge → CS rounds on normal difficulty: 3 spells baited, 3 dodged, 3/3 CS, 0 missed and 0 damage. The elapsed time included pauses between manual inputs and is not a performance benchmark.
- The drill menu can be scrolled on narrow screens. Results and pause now reset its scroll position so the title and score are visible; a regression test covers both transitions.

## Skillshot targets and physical walls

- Skillshot targets now spawn outside the two collision proxies and their movement is clipped at walls, so they cannot drift into or through blocked terrain. Their sinusoidal motion resumes when its desired position moves back into open space.
- `node --test tests/*.test.cjs`: **59/59 PASS**, including 100 target spawn attempts and 10 seconds of movement near a wall. Manual visual calibration near the wall remains open.

## Tests actually run

- `node --test tests/*.test.cjs`: **60/60 PASS**, executes real game source with a minimal DOM and seeded randomness. Covers cancellation/release, chase, rapid retarget, attack-move travel/selection, dodge vs block accounting, fast swept collision, homing/target exclusivity, 30/60/120 FPS cadence, pause/restart/blur and both end conditions; locked aim, line/fan/AoE sequence, ground threat scoring, seed reproducibility; full 15-minion unattended resolution, CS vs allied projectile kills, spell restrictions, held mouse retargeting and drill navigation; death immediately freezes unresolved hazards; Skillshot accuracy, safe target spawn, local records, full Bait success and failure, and artwork fallbacks.
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
- Only two approximate wall proxies have collision/pathfinding; the rest of the terrain is decorative. Lane Scenario is an early single-opponent drill, not a full lane simulation. Optional synthesized audio is available. Last-Hit Lab is timing practice without hostile enemy pressure.
- Attack range is center-to-center and calibrated for this arena, not a claim of exact LoL data.

## Next three actions

1. Implement a consistent League unit scale and selectable level-1 Ahri CS profile (53 AD, timing, missile travel, minion armor and truthful lethal threshold); validate with controlled tests and a human run. See Blueprint §11.
2. Implement patch-pinned Lux Q and Ezreal Q as selectable data-driven training shots, including collision, mitigation and root; distinguish training warnings from authentic cast time.
3. Replace two rectangular wall proxies with a carefully traced, original mid-lane terrain mesh and navigation, including rivers and jungle entrances. Acceptance: visible walls match collision, no entity spawns inside obstacles, clicks and chase route around them.

