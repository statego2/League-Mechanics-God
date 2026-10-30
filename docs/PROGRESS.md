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
- `node --test tests/*.test.cjs`: **60/60 PASS**, including timing and windup at 30/60/120 FPS. Browser smoke: selected Ahri timing, started Kite Arena and confirmed HUD shows AS 0.668. No full manual Ahri preset playthrough yet.

## Experimental Ahri last-hit profile (2026-10-30)

- Selecting 0.668 Ahri timing / CS activates an experimental profile in Last-Hit Lab: 53 auto damage, 465-health targets with implicit zero armor, player speed 165 canvas units/s and auto missile 875 canvas units/s, using an initial scale of 0.5 canvas units per League unit. The gold threshold and results text show 53. The original profile remains the default and old timing-only Ahri CS records are kept separate from the new profile. Other modes retain their existing values except attack timing.
- Allied hits are accelerated training approximations (40/50/60 damage per hit by difficulty), not authentic wave simulation; attack range, collision radii, abilities, items, runes and other resistances remain uncalibrated. Not a complete Ahri implementation.
- `node --test tests/*.test.cjs`: **62/62 PASS**: verifies lethal boundary 53/54, records, and unattended wave resolution for each difficulty. Browser started Last-Hit with Ahri selected and confirmed HUD; a complete human CS run is still needed.

## Physical mitigation foundation

- Auto attacks now apply target armor at impact, and the gold last-hit threshold uses the same calculation. Present minions still have zero armor; this prepares other minion types and later upgrades without pretending their waves are already modeled. Basic negative armor is supported; penetration and damage modifiers are not.
- `node --test tests/*.test.cjs`: **63/63 PASS**, including an armored target immediately above and at the lethal boundary. A further 64th test confirms an Ahri auto can secure a minion after allied damage at every difficulty, from a controlled in-range position.

## Reference spell dodge drills (2026-10-30)

- Added standalone Lux Q and Ezreal Q dodge drills. A stationary caster aims every 3.5 seconds after a 0.25-second cast; a training-only line shows the locked aim. The player has 590 HP, 165 canvas units/s movement and Ahri level-1 resistances. With a provisional 0.5 canvas-unit scale: Lux Q speed 600, range 650, radius 35, 80 base magic damage reduced by 30 MR and 2-second root; Ezreal Q speed 1000, range 600, radius 30, 98 base physical damage (20 + 130% of 60 AD) reduced by 21 armor. Flash does not grant invulnerability here and is usable during root. Spell damage and root freeze on pause; missiles stop at maximum range.
- These are approximations, not full LoL implementations: visible telegraph, fixed 3.5-second interval, locked caster, simplified player radius, no minion interception, Lux two-target interaction, tenacity, items, runes, on-hit effects or precise Flash cooldown. Difficulty does not change these drills. A screenshot/feel comparison and a full human survival run remain open.
- Browser: started both drills, each registered a hit; Lux root was visible. `node --test tests/*.test.cjs`: **69/69 PASS**, including cast delay, range, damage, root/pause, Flash and 30/60/120 FPS. A further full-duration automated survival test covers both result screens from outside missile range; this is not a human playthrough.

## Ahri CS wave recalibration (2026-10-30)

- Ahri Last-Hit profile now contains two 30-second-spaced waves, each with three 465-HP melee and three 284-HP caster minions (12 possible CS). Each row first focuses melee, then caster. Allied damage uses base melee 11 + 2% of current HP at 1.25 attacks/s, and caster 21 + 3.5% current HP at 0.667 attacks/s, using [melee](https://wiki.leagueoflegends.com/en-us/Melee_minion) and [caster](https://wiki.leagueoflegends.com/en-us/Caster_minion) reference statistics. Ahri attack reach uses 550 range plus source and target gameplay radii at the provisional 0.5 scale, per [edge range](https://wiki.leagueoflegends.com/en-us/Attack_range). Local records are partitioned from the earlier approximation.
- This is still not a full League wave: allied minions are scripted attackers rather than independently targetable units and cannot die; enemy attacks, pathing/aggro, real windups, wave upgrades, siege minions and exact projectile behavior are missing. W/F remain the prototype abilities. The waves start at drill time zero rather than the actual match clock. Difficulty does not change the Ahri wave. Browser smoke showed six minions and WAVE 1/2; no complete human run yet.
- `node --test tests/*.test.cjs`: **72/72 PASS**, including composition, damage ratios, attack reach and two-wave resolution.

## Focused menu and Ahri baseline (2026-10-30)

- User explicitly asked for a few polished modes, with Ahri as the base player. Menu now exposes only Dodge Trial, Kite Arena and Last-Hit Lab; legacy modes remain in code and tests. Attack speed selection is hidden and Ahri is the default: 0.668 AS, 20% windup, 53 auto AD, 590 HP and scaled 330 movement / 1750 auto projectile speed. CS uses the six-minion Ahri waves by default. Range is edge-based and uses approximate scaled radii.
- Dodge Trial now alternates the previously standalone Lux Q and Ezreal Q implementations per enemy; difficulty affects encounter spawning but does not scale those projectile values. Dodge records are separate from earlier modes. The old synthetic sweep is not used in the default Ahri dodge.
- The player is still shown as the original ranger, and Q/W/E/R are prototype abilities, not Ahri. Dodge enemy AI, telegraphs, collision, resistance, allied minion simulation and the arena remain approximations; do not claim full fidelity. Legacy mode code is retained, but no longer exposed as separate menu cards.
- Browser: confirmed three menu cards, default Ahri CS with wave 1/2 and AS 0.668, and launched Dodge Trial with a projectile telegraph. No complete human session after this change. `node --test tests/*.test.cjs`: **74/74 PASS**, including default settings and both spells in the shared drill.

## Ahri Q and E foundation (2026-10-30)

- Implemented rank-1 Charm (E) for the default Ahri player: 0.25 s cast, 12 s cooldown, scaled 1550 speed / 1000 range / 120 width, 80 magic damage before target MR, first target only, and 1.2 s charm that interrupts enemy casts and makes enemies move toward the player at 35% speed. Movement commands queue during the cast. Training enemies currently have no explicit MR unless set, and the CC AI is an approximation; no mana, AP scaling, tenacity, spell shields or all League cast interactions.
- Implemented rank-1 Orb of Deception (Q): 0.25 s cast, 7 s cooldown, scaled 1550 outbound speed / 900 range / 200 width; 35 magic damage outbound and 35 true damage returning, once per target per pass. Orb returns toward the moving player and pierces enemies. Its fixed 700 canvas units/s return speed approximates League's variable acceleration; turning-point splash, mana, AP, full collision/range effects and ability ranking remain unimplemented. Q/E are intentionally disabled in current CS drill.
- Parameters sourced from [Ahri reference](https://wiki.leagueoflegends.com/en-us/Ahri), community snapshot last changed V26.06; compare against current game client. W, R and the ranger sprite are placeholders.
- Browser smoke: Q in Kite showed the orb and cooldown; E showed the Charm label and cooldown in a separate smoke. Tests exercise delayed casts, pause, interruption, first-target collision, multi-target orb and return tracking: `node --test tests/*.test.cjs` **79/79 PASS**. No human full run or in-client feel comparison yet.

## Ahri Fox-Fire (2026-10-30)

- Default Ahri W is now Fox-Fire instead of the prototype dash: 9 s cooldown, 40% move-speed boost decaying linearly over 2 s and three homing flames, with 40 magic damage for the first hit and 16 for additional hits on the same target before MR. Flames prioritize charmed targets then closest enemies, launch after a short delay and do not interrupt attack windup. Q/W/E are disabled in the auto-only CS drill; Flash remains available.
- Reference: [Ahri](https://wiki.leagueoflegends.com/en-us/Ahri), community V26.06 snapshot. Target priorities, exact flame timing/targeting, minion interactions, AP, mana and LoL speed caps are simplified. R and the ranger sprite remain placeholders.
- Browser: Fox-Fire rendered three orbiting flames and a 9-second cooldown in Kite. `node --test tests/*.test.cjs`: **81/81 PASS**, including boost, damage/mitigation, windup preservation and CS restriction. No full human playthrough.

## Ahri Spirit Rush (2026-10-30)

- Default Ahri R now starts a 140 s cooldown and a 15 s, three-charge window, with 1 s between casts; each cast dashes up to 250 canvas units and fires up to three homing 75-magic-damage bolts after movement. Dash is continuous, checked against enemy missiles using swept player movement, and is not invulnerable. Root blocks starting it; Q/W/E/R remain disabled in the auto-only CS drill.
- Source: [Ahri Spirit Rush](https://wiki.leagueoflegends.com/en-us/Ahri), community V26.06 snapshot. Not full fidelity: simplified targeting and fixed dash speed, no kill-based charge extension, spell levels, AP, mana, full wall traversal, exact cast interactions or allied/minion targeting. The character sprite is still the old ranger.
- `node --test tests/*.test.cjs`: **83/83 PASS**, including charges, cooldown, homing damage, root and dash collision. Browser started Kite, used R, observed movement and ×2 charges. No full human run or real-client comparison.

## Ahri visual sprite (2026-10-30)

- Added generated transparent `assets/ahri-side.png`; default Ahri now renders this sprite anchored near the gameplay position, mirrored for horizontal facing. Original ranger images remain as fallback if loading fails. Prompt and provenance are in assets/README.md. One static pose with existing bob/tilt, not a 3D model or true directional animation.
- Browser: opened Last-Hit Lab at desktop size and confirmed the Ahri sprite appears on the lane with visible health/range indicators and six minions. `node --test tests/*.test.cjs`: **85/85 PASS**, including sprite load and fallback. No full human run or cross-browser visual check.

## Ahri back pose (2026-10-30)

- Added `assets/ahri-back.png`, generated from the side sprite using the built-in imagegen tool. It appears when facing toward the upper part of the map; missing back art falls back to the side pose and missing side art falls back to the ranger. Both are static poses, not animated 3D models. Prompt and provenance are in assets/README.md.
- Browser: moved toward the upper lane in Last-Hit and observed the rear pose. `node --test tests/*.test.cjs`: **86/86 PASS**, including directional selection and fallback plus Spirit Rush recast-window pause/expiry.

## Hitbox, scale and product direction (2026-10-30)

- User clarified that focused drills do not replace the long-term laning vision: make the minion simulation and hitboxes credible, then build a difficult combined CS/bait/dodge lane experience. Dodge should retain the variety and chaos of overlapping patterns. The user believes the current mid-lane visual is too narrow and offered a reference screenshot; the current map is generated artwork with only two approximate physical walls, so no exact mid collision geometry or lane width has been established.
- Sources: [Riot 2024 gameplay preview](https://www.leagueoflegends.com/en-au/news/game-updates/2024-gameplay-preview/) describes added space in mid; [Riot map changes](https://www.leagueoflegends.com/en-sg/news/dev/dev-season-2024-map-changes/) discusses safer paths. [Minions](https://wiki.leagueoflegends.com/en-us/Minions) describes first-wave targeting and upgrades. Exact current map geometry and in-client verification remain open.
- Reduced Ahri sprite draw size to 70% of prior size while maintaining foot anchoring. Separated movement/path radius (17 canvas units, still approximate) from projectile gameplay radius (32.5, corresponding to Ahri 65 at provisional 0.5 scale); Ahri-targeted spell collision and threat detection use the latter, and enemy champion/minion collision uses scaled 65/48 gameplay radii. A visible ground circle marks player radius. Movement-radius, perspective, enemy models, terrain height and collision are still approximate.
- Fixed non-piercing player projectile ordering to use earliest swept-circle contact instead of nearest target center. Boundary and ordering tests cover hits just inside/outside both champion/minion radii. Expert is the default, and the synthetic sweeping gap pattern again overlaps the Lux/Ezreal Dodge spells; its extra 45-damage bullets are training-only, not a real LoL spell. Difficulty choice remains available. Dodge local records are versioned separately.
- `node --test tests/*.test.cjs`: **90/90 PASS**, including hitbox boundaries, collision order and the restored sweep. Browser smoke: expert is selected; Ahri and her ground circle render in Last-Hit. A manual 60-second difficult Dodge run and complete human CS run are still unverified.

## Ahri passive and minion mitigation (2026-10-30)

- Ahri gains a fragment for each player minion kill, healing 35 at nine fragments; a champion takedown heals 75, capped by max HP. A champion takedown while Spirit Rush is active grants a charge up to three and keeps the recast window at least 10 seconds. Values are the level-1, no-AP reference approximation; real takedown attribution, level/AP scaling and full passive/ultimate interactions still require work.
- Allied melee and caster damage now go through the target armor calculation, including current-health bonus damage. Current training minions have zero armor by default; minion simulation still uses scripted attackers and needs real bidirectional units and target selection.
- `node --test tests/*.test.cjs`: **93/93 PASS**. Added tests for ninth CS heal, champion heal/cap, armored allied damage, and R charge gain.

## User mid-lane screenshot and reframing (2026-10-30)

- User supplied an in-game screenshot of the mid-lane wave and requested a view slightly farther up the lane. Replaced the arena background with `assets/mid-reference-v2.png`, a generated ground-only scene using that screenshot for layout; original art remains in the repo. The view has broad engraved paving, grass shoulders, upper-left river ramp/brush and a lower-right embankment. Prompt and reference provenance are in assets/README.md.
- Moved the two hand-authored collision rectangles toward the illustrated edge structures, opening more central ground. Their dashed overlays show the approximate collision boundaries. These are still rectangular proxies, not a trace of the actual Rift, and the rest of the illustrated terrain is decorative. The user's image is a camera reference, not a measured collision map; exact lane topology still needs work.
- Browser smoke: Last-Hit Lab loads the new background, Ahri and the two marked wall regions. `node --test tests/*.test.cjs`: **93/93 PASS**, including pathfinding, dash/flash, obstacle avoidance and 500 randomized routes using the adjusted walls. No full human playthrough on this map yet.

## Mid framing adjustment (2026-10-30)

- User clarified that the view should be slightly farther up and to the right. The existing background is now framed using its upper-right 96% crop; no new background was generated. The two approximate wall proxies were transformed to remain aligned with the shifted image. These are still illustrative rectangles, not the actual Rift map.
- Browser opened Last-Hit with the adjusted framing. `node --test tests/*.test.cjs`: **93/93 PASS**, including movement, wall routing, dash/flash and 500 randomized routes. No full human playthrough after this framing change.

## Recentered mid lane (2026-10-30)

- User rejected the prior small crop and supplied a League of Dodge screenshot to show a centered camera composition. Generated `assets/mid-centered-v3.png` from the existing mid art, using the new screenshot for framing only: the broad stone lane and open combat area now sit near the image center. Removed the prior crop and adjusted the lower collision proxy toward the painted wall. Full prompt and provenance are in assets/README.md; earlier art remains available.
- Browser smoke: Last-Hit loads the centered map with Ahri and the minion wave. `node --test tests/*.test.cjs`: **93/93 PASS**, including navigation and 500 random routes. The two physical walls remain approximate; no exact Rift mesh or full manual playthrough is claimed.

## ZIP-driven development and Dodge feedback (2026-10-30)

- User requested no immobilizing stun/root in Dodge Trial: hostile hits still deal damage, but do not root in that drill. Other legacy reference modes keep their previous behavior. User also requested a future high-attack-speed ADC for Kite instead of Ahri; recorded in Blueprint, not implemented yet.
- Imported the supplied ZIP locally under the ignored reference originals/archives with paths preserved. Actual Kiting and Farming were started in a local browser; reference Farming shows allied and opposing waves and Kiting offers 2.50 setting. Their behavior informed an independent implementation; no original code or art was copied.
- Ahri Last-Hit now spawns six actual allied and six enemy minions per wave, each with HP, attack cadence, target retention/retargeting, movement toward range and independent death. Melee strikes and caster missiles damage opposing units using existing damage/armor rules. Only the player killing an enemy earns CS; ally kills count missed. The previous Ahri CS record key was versioned. This is still an early approximation: no cannon, exact LoL minion AI/aggro, windup, minion-vs-champion aggression, proper lane pathing or wave interaction, and no claim of exact Riot behavior.
- Browser: reference Kiting and Farming entered gameplay; our Last-Hit showed both teams losing HP and firing, without console warnings/errors. A short manual click did not produce a confirmed last hit; human full-run timing and balancing remain open. `node --test tests/*.test.cjs`: **97/97 PASS**, including both teams taking damage/death, retargeting, CS attribution, pause and 30/60/120 FPS. Python reference tools: **8/8 PASS**.

## Current playable state

Dodge Trial, Kite Arena and Last-Hit Lab are available in the visible menu locally at http://localhost:8080. The repository was cloned into the `League-Mechanics-God` subdirectory of the original workspace, whose parent contains separate historical Unity research. Work is on `codex/controls-and-dodge`, based on `7de3430`.

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

- `node --test tests/*.test.cjs`: **97/97 PASS**, executes real game source with a minimal DOM and seeded randomness. Covers cancellation/release, chase, rapid retarget, attack-move travel/selection, dodge vs block accounting, fast swept collision, homing/target exclusivity, 30/60/120 FPS cadence, pause/restart/blur and both end conditions; locked aim, line/fan/AoE sequence, ground threat scoring, seed reproducibility; full 15-minion unattended resolution, CS vs allied projectile kills, spell restrictions, held mouse retargeting and drill navigation; death immediately freezes unresolved hazards; Skillshot accuracy, safe target spawn, local records, full Bait success and failure, and artwork fallbacks.
- `node --check game.js` and `git diff --check`: PASS.
- Python reference tools: `python3 -m unittest discover -s reference/league-of-dodge/tools -p 'test_*.py'`: **8/8 PASS**.
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

1. Calibrate the new two-sided wave simulation against League: windup, first-wave target rules, cannon and minion aggro, then manually play full waves.
2. Expand Lux Q and Ezreal Q training with accurate collision sizes and minion interception, complete relevant effects and validate against real gameplay; distinguish training warnings from authentic cast time.
3. Replace two rectangular wall proxies with a carefully traced, original mid-lane terrain mesh and navigation, including rivers and jungle entrances. Acceptance: visible walls match collision, no entity spawns inside obstacles, clicks and chase route around them.


## Archive audit and reference follow-up (30 October 2026)

- Imported the supplied `loldodge-all-updated.zip` privately, preserving its tree; SHA-256 and every file are recorded in `reference/league-of-dodge/ZIP_INVENTORY.md`. Originals and archive remain Git-ignored.
- Kiting and Farming reached gameplay locally; Dodge, Skillshot, 1v1 and Duo hit missing-extension errors, MOBA Battle lacks its game script, and LoL Rogue reaches champion selection with missing images. See the reference manifest for exact scope and static audit limitations.
- Auditor now detects GameMaker exports with query-suffixed filenames and their extension/atlas dependencies: 372 resolved, 18 missing static references, 97 external/inline and zero escapes. Python reference tests: 8/8 passed.
- `5c9a0cc`: independent two-sided minion waves and caster travel; removed roots only in Dodge Trial. Gameplay tests: 97/97 passed. Browser observed both waves fighting with no console errors; a complete human CS calibration is still needed.
- User preference: keep Ahri for the wider game, but plan a fast-attacking ADC for Kite; no change has yet been made to its champion.

## Research PR #1 integration (30 October 2026)

- Read `ENGINEERING_SPEC.md`, `INTEGRATION_GUIDE.md`, `DATA_GAPS.md` and `SOURCES.md` from PR #1 (`origin/research-pr-1`); the research branch was not merged. Review Riot's developer policy before any public product distribution, as flagged in its source notes.
- Added a shared `applyImpact`/`resolveDeath` path for player, allied and enemy damage, physical/magic/true mitigation and one death/credit record. Minion percentage bonus is calculated from current HP at impact; minion kills by allies do not credit CS or Ahri passive. Stable fixed-step processing order is an approximation, not a proven server race rule; environmental/XP/gold/death grace remain unimplemented.
- End-of-drill live minions are now counted as unresolved instead of fabricated deaths/misses. Ahri CS record key changed to `cs_ahri_v4`.
- Existing two-sided simulation now has approximate 0.25s windup, target retention, cancellation/reacquisition on target death or leaving range, and can target nearby opposing minions across waves. Caster projectiles retain source identity. Acquisition 250 canvas units, cadence, windup, pathing and priority remain training approximations; no champion call-for-help, first-wave special rules, siege or complete lane progression.
- Centralized pinned Ahri base values and one provisional 0.5 canvas/game-unit conversion in `game.js`; HP/damage/timing are unscaled. Attack range, movement, missile and Q geometry now derive from this compact in-code data. This is not yet a generated/validated schema adapter; community values and radii require further verification.
- Browser localhost: unattended Last-Hit finished and showed CS/missed/unresolved; Kite start and pause, Dodge start verified. No captured console warnings/errors. No full interactive playthrough or client comparison. `node --test tests/*.test.cjs`: 101 tests passed; `node --check game.js` and `git diff --check` passed.

Next: validate event ordering and add complete source/event identity plus gold/XP only when sourced; implement minion priority/call-for-help and movement when no target; generate and validate a provenance-bearing adapter from the research dataset, then calibrate minion attacks and run full human CS sessions.

## Data adapter and minion follow-up (30 October 2026)

- Extracted a small, provenance-bearing reviewed Ahri subset from research PR #1 into `data/ahri-snapshot.json`; `node scripts/build-ahri-data.cjs` generates `ahri-data.js` for direct browser/file use. The generator rejects wrong patch, unit, status, null and nonpositive data; `--check` detects stale generated output. Historical Meraki data is not used. The in-game loader validates required data and visibly flags its independent built-in fallback. Champion gameplay radius 65 and canvas scale 0.5 remain approximations, not Riot-verified geometry.
- Idle minions advance toward the opposing side along a simplified horizontal path and can meet later waves. A minion targeting one of our minions has approximate priority over an idle enemy; same-priority orders are retained and higher-priority targets can interrupt windup. The model does not implement champion call-for-help, turrets, or confirmed first-wave exception. This is training behavior, not a claim of exact live AI.
- The impact pipeline now assigns monotonic event IDs per run and records them on deaths; ordering follows existing fixed-step processing, not a verified server tie-break. Last-Hit player kills consistently increment both the displayed score and `stats.cs`. A test verifies caster missile survival after the attacker dies and the current-HP bonus at impact. Ahri CS records use `cs_ahri_v5` after wave behavior changed.
- Browser smoke at localhost: Last-Hit starts with Ahri 590 HP, AS 0.668, both waves, generated data loaded without fallback indicator and no console warnings/errors. No full human CS run. Automated suite: **108/108**; generated data `--check`, `node --check game.js`, and `git diff --check` pass.

Next: human-play complete CS waves; add a separate opt-in combined lane with champion call-for-help after verifying target/skill policy; improve path topology, stable contact ordering, and real melee/caster attack timings. Keep the schedule and turret work separate from the short pre-positioned drill.

## Centred mid-lane minion meeting (30 October 2026)

- User reported the prior minion movement and meeting position felt wrong. Replaced the asymmetric fixed columns in Ahri Last-Hit with mirrored melee-front/caster-back formations approaching the centre of the painted diagonal lane. Both teams now use the same movement and target logic; removed the red-only forced destination. Ahri starts behind the friendly line.
- Used 350 game units/s from the research snapshot with the existing provisional 0.5 canvas scale; 65 canvas melee centre range, spacing, initial positions, first-target row distribution, attack times and lane geometry are training approximations pending client calibration. Three melee targets are distributed by row on first acquisition, then normal target retention/priority resumes. Movement gets a small visual bob; this is not a full walk animation.
- Scenario remains two pre-positioned waves with 30-second spacing, not a simulation of nexus travel; siege, minion collision/ghosting, precise pathing/aggro and attack timings remain open. Local Ahri CS record version is `cs_ahri_v6`.
- Browser: both waves approached diagonally and fought near the middle; Ahri started behind allies, health bars/last-hit indicators appeared, and console warning/error log was empty. No complete human CS run or direct client comparison. `node --test tests/*.test.cjs`: 109/109 pass, including mirrored arrival and first target pairing, damage/retarget, and frame-rate regressions.

## Dodge: remove exact aim lines (30 October 2026)

- User observed that showing exactly where skillshots will travel undermines dodge practice. Dodge Trial no longer renders the pre-cast line or width of linear projectiles. The enemy still displays a cast cue and faces the locked cast direction; launched missiles remain visible. No projectile timing, hitbox, damage or dodge accounting changed. Other modes retain their previous guides; the separate synthetic sweep still shows its safe-gap warning.
- Dodge local bests use new suffixes (`ahri_spells_v3` / `no_line_<preset>`) because difficulty changed. Browser smoke: Dodge launched at localhost without captured console errors; no full human survival run. `node --test tests/*.test.cjs`: 111/111 PASS, including render checks for the hidden Dodge guide, retained cast cue, launched missile and unchanged guide in Kite.

## Minion combat symmetry and readability (30 October 2026)

- Corrected red caster projectiles to use the same target gameplay radius as blue missiles. Same-step melee releases are now collected before resolving impacts, so a lethal first update does not erase the other side's completed windup. Same-target impact order still follows a deterministic processing policy; this is not verified server ordering.
- Added approximate first-attack staggering by formation row (0/0.14/0.28 seconds after reaching range), preventing perfectly synchronized first-wave health losses. These timings are a training choice and must be calibrated against live behavior. Added small team-coloured staffs to distinguish casters without changing hitboxes. Ahri CS records now use `cs_ahri_v7`.
- Browser smoke: Last-Hit loaded, both waves moved and fought, caster staffs and missiles rendered, and no console errors/warnings were captured. No full manual last-hit run. Automated suite: 115/115; new tests cover two-sided simultaneous melee, equal projectile radii, staggered early attacks and caster rendering.
- Remaining: full actual-client measurements, champion aggro/combined lane, minion collision and movement avoidance, cannon, timing, more accurate ranged and melee animations.

## Farming reference and explicit S stop (30 October 2026)

- Revisited `https://loldodgegame.com/farming/` and the privately archived playable export: observed opposing moving waves containing melee, caster and cannon plus separate missed minions / missed money / earned money. This is reference gameplay, not proof of live LoL simulation accuracy. Retained League-aligned two early normal waves; cannon for a later wave remains open.
- S now clears movement destination, route, chase, focus and pending attack-move; it cancels an uncommitted auto windup but leaves an already released missile intact. A held right button no longer silently overwrites S until a new press. Tests cover movement, windup, fired missile and held-right reissue. Existing dash/cast behavior is not asserted to reproduce every LoL interruption case.
- Ahri Last-Hit tracks earned and missed minion gold separately on actual death; unresolved survivors award neither. Starting melee 20 gold is from Riot 26.1; caster 14 is community-reported, subject to the research caveats. This is feedback, not XP/items or full economy. Gold gain is displayed on kill and in the arena/results.
- Browser: launched Last-Hit, issued right click and S, saw the wave and missed gold update with no console warnings/errors. Reference: short unattended play only; no precise timing or full human CS run. `node --test tests/*.test.cjs`: 118/118, including stop and gold attribution.

Next: measured minion attack/cadence and complete practice run; cannon wave and later scheduling, careful champion aggro and collision based on verified sources.

## Minion static-wall routing and human CS check (30 October 2026)

- Both idle lane advance and target chase now use the existing walkable-world visibility graph when a wall blocks their route. Paths are reused and recalculated as goals change; movement stays clipped against the two existing wall proxies. The diagonal lane endpoints remain approximate, and this is not the actual Rift navmesh or dynamic unit collision. The changed scenario uses Ahri CS record suffix `cs_ahri_v8`.
- Added regression tests for chasing a target behind a wall and an unopposed wave bypassing a wall while remaining walkable.
- Browser: manually right-clicked an enemy caster and observed a real hit/kill with **1 CS and 14 gold** displayed, plus allied misses; this was not a complete skill benchmark. Last-Hit with the new route code started and displayed both waves with no console warnings/errors. A complete uninterrupted manual session and exact LoL timing/aggro remain open.
- `node --test tests/*.test.cjs`: 120/120 passed; generated Ahri data check, JS syntax and diff checks pass.

## CS formation, melee attacks and cannon (30 October 2026)

- User rejected the crowded formation and inaccurate attacks, asked to observe League of Dodge Farming, remove `LAST HIT` labels and use cannon without putting it in the wrong wave. Inspected the local playable reference: widely separated melee/caster units, ranged projectiles, melee in close contact, cannon visible. Reference starts with a cannon; our first two waves do not, following the user's League CS goal.
- Wider diagonal formation, reduced and separated health bars, no `LAST HIT` in the arena or CS mode title, Ahri starts behind allies. Melee approach to 40 canvas units before hitting and show an independent short swing; casters remain behind and fire projectiles. Fixed a floating-point range boundary that could leave units stuck permanently at their attack range. These ranges, visual animation and target behavior remain approximations, not client measurements.
- CS Practice now runs up to 10 minutes / 20 waves with 30-second intervals, first wave pre-positioned immediately (so training time zero corresponds to the prepared first-wave encounter, not full nexus travel). Both teams receive cannon on waves 3, 6, 9, 12, 15 and 18; 126 possible CS. Cannon HP 835, attack range 300 game units, AS 1 and on-hit 5% follow community research; base damage 39 from Riot 26.1 conflicts with community 37.5 and must not be represented as verified live. Its windup, projectile velocity, visual and targeting are training approximations. Cannon gold uses initial 50; upgrades, minion stat growth, real wave travel, unit collision and later match thresholds remain unimplemented, so the longer session is not a complete Summoner's Rift simulation.
- Browser: CS Practice started with visibly separated waves and no last-hit field labels; at 01:01 both teams had spawned a cannon in wave three. No console warnings/errors. Cannon shots, gold, five-minute-plus behavior and a full 20-wave completion are also exercised in automated simulation; no full human ten-minute client comparison. `node --test tests/*.test.cjs`: 127/127 passed, plus generated data, syntax and diff checks.

## Remove non-League debug overlays (30 October 2026)

- User requested removing the recovery circle and avoiding graphics that do not exist in League. Removed the always-visible player attack timing arc and READY/WINDUP/RECOVERY text, the permanent player hitbox circle, the projectile collision-size circle, the enemy cast countdown ring, the target selection circle, persistent attack-order range ring, last-hit gold health-bar highlight/threshold, minion floating HP numbers, and dashed collision/boundary debug outlines. Attack range remains visible while A attack-move is being aimed; movement indicators and combat/projectile effects remain. Combat timing and hitboxes themselves are unchanged.
- The two approximate wall proxies remain functional but are now unmarked; they may not exactly match painted terrain. Browser: CS Practice loaded without the player circles or debug wall outlines and without console errors. `node --test tests/*.test.cjs`: 128/128, including a rendering regression for timing and hitbox overlays.

## Retargeting and successive waves (31 October 2026)

- User reported that minions behave incorrectly after units die and subsequent waves arrive. Researched [Riot 26.1](https://www.leagueoflegends.com/en-us/news/game-updates/patch-26-1-notes/), [Riot 26.9](https://www.leagueoflegends.com/en-gb/news/game-updates/league-of-legends-patch-26-9-notes/), [Riot 26.10](https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-10-notes/) and the [community minion behavior reference](https://wiki.leagueoflegends.com/en-us/Minions). The community page was readable through indexed excerpts; detailed priority and reevaluation are source-reported, not a client-verified implementation.
- Fixed a concrete bounded-arena bug: survivors could walk past the next wave's fixed spawn and finish at the edge, so opponents appeared behind them and diverged. Unopposed survivors now wait ahead of the opposing ingress and acquire newly arriving enemy minions; both teams tested after a 20-second push. This hold line is an explicit workaround for the missing full lane/turrets, not a claim about League pathing.
- A valid target is retained against same-priority candidates; target changes for higher priority are checked on a named two-second training interval between attack windups, preventing mid-windup cancellation. A dead target is immediately replaced if another is available. Exact reevaluation interval and full visibility/champion/turret aggro remain unverified.
- Melee maximum health now follows the Riot 26.9 +35-per-90-second change: 465 in waves 1–3, 500 in 4–6, 535 in 7–9, using the community-reported 0:30 initial upgrade and the session's assumed wave clock. Melee AD/armor and caster/cannon growth remain unimplemented. Ahri CS record suffix `cs_ahri_v10`.
- Browser: observed wave 3 and both cannons after prior waves resolved; console errors/warnings empty. Automated suite: 131/131, including both-side survivor-to-next-wave, windup-preserving target change and sourced melee growth. This is not a full client-verified simulation.

## Dodge director first playable slice (31 October 2026)

- Goal explicitly prioritizes finishing Dodge Gauntlet. Re-read Blueprint and the encounter-rhythm design; preserve the three current public alpha modes rather than renaming the incomplete trial to claim the final Gauntlet.
- Default Ahri Dodge now creates seeded single-cast visitors which enter, cast either Ezreal Q or Lux Q and exit, leaving their missile in flight. Of these two implemented cards only, Ezreal has 75% selection weight (the 45:15 ratio normalized over the available roster); this is **not** the planned full-roster 45% result. Foundation/Standard/Expert use 5/3.2/2.5 second nominal spawn intervals and 1/2/3 directed-threat caps; spells keep the same existing scaled velocity and collision values across difficulties. One cast per visitor avoids claiming an invented champion cooldown. Results report casts by spell, independently of threat-based avoided counts. Existing original ranger/mage artwork and distinct blue/gold missiles improve recognition but are not real champion models.
- One-, three- and twelve-minute session lengths are settings inside the same mode; local bests are partitioned by duration and new director version. Removed the alpha's 0.14-second automatic post-hit invulnerability in this Dodge profile. User's no-stun requirement remains. Other attack presets retain the legacy alpha logic.
- Important limits: the existing synthetic sweep remains and is **outside the directed-threat cap**. The 1/2/3 cap counts projectiles and active visitors, not geometric reachability; no fairness solver, adaptive controller, safety proof or benchmark mode exists. Missing planned Blitz Q, Ahri return, Vel'Koz split, ambient Xerath, Orianna R and Malphite R. Enemy recognition and spell fidelity remain approximate, and Lux's multi-hit/minion interaction is unimplemented. This is not a finished Gauntlet or a claim of LoL parity.
- Browser: started default Expert Dodge and observed 8 casts (7 Ezreal / 1 Lux) before the unattended character fell at 19.2 s. Reloaded, selected 3 minutes and confirmed the 180-second countdown and enemy entry; console warnings/errors empty. No completed human 3/12-minute run or real-client comparison. `node --test tests/*.test.cjs`: **137/137**; includes 12-minute fixed-step run with artificially enlarged HP, deterministic seeded mix, one cast/visitor, directed-threat cap, session records, no artificial hit immunity and profile rendering. `node --check game.js`, generated data check, `git diff --check` pass.

Next actions: (1) replace synthetic sweep with source-informed fair varied spells, starting with a fully modeled two-phase Ahri Q or Blitz Q and honest collision/expiry tests; (2) add geometry-aware scheduling and per-spell qualified outcomes, including synthetic/ambient hazards; (3) play and calibrate full human sessions at all difficulties, then implement rare events and accessibility without adding mode cards.


## Successive waves and Ahri Q follow-up (31 October 2026)

- Rechecked [Riot 26.1](https://www.leagueoflegends.com/en-us/news/game-updates/patch-26-1-notes/) and the [community minion reference](https://wiki.leagueoflegends.com/en-us/Minions): minions retain targets of equal priority, reconsider higher priorities between windups, and look for a new target when the prior one dies. The regular early Rift wave is three melee and three caster, with a siege minion from wave three and then every third wave before 14 minutes. Minions spawn sequentially at the nexus; this practice arena instead creates pre-positioned groups simultaneously.
- The finite arena previously held unopposed survivors just 60 canvas units from the opposing next-wave spawn, making new units appear almost on top of them. Moved the artificial hold line closer to the centre so the front rows arrive at least 155 units ahead on the lane axis. Regression tests cover both teams, a wave-two encounter, death of the current target and acquisition of another. This hold is still a training workaround, not authentic Rift movement. No claim of exact client parity: minion collision, complete champion/turret aggro, real navigation and nexus-to-lane travel remain outstanding.
- Continued the Dodge director work already in progress: added an Ahri Q visitor with outward and returning phases, one collision per phase, magic outgoing and true returning damage, and return tracking to the living caster. The 700 canvas-unit return speed, visitor artwork and 45:15:11 normalized selection weights are training approximations; real client return behavior and encounter balance still require validation. No stun or trajectory overlay was added. The synthetic sweep remains outside the cap and the Gauntlet remains incomplete.
- Automated suite: 140/140 passes, including next-wave retargeting and separate orb-leg collisions and homing. Browser: CS Practice ran through wave three, with cannon minions visible on both sides after earlier waves resolved; this unattended equal-wave run does not visually validate a survivor-push scenario.

## Dodge director: remove synthetic sweep and keep casters visible (31 October 2026)

- The default Ahri-directed Dodge no longer runs the unrelated synthetic wall/sweep: it bypassed the encounter budget and created non-League visual warnings. Legacy attack presets still keep their original behavior. Directed Dodge now uses its Ezreal, Lux and Ahri encounters only. Old director records are separated using `director_v3` because the scoring environment changed.
- The director only accepts caster entry and cast locations that keep the sprite within the arena's visible rectangle. It retries candidates and defers if none is valid, rather than intentionally creating an unseen caster; this is a practical screen-space policy, not a proof of fair reaction time or unobstructed visibility.
- `node --test tests/*.test.cjs`: 141/141 pass, including one minute without undirected sweep shots and visibility sampling from the centre and corners; the existing 12-minute directed-cap simulation also passes. `git diff --check` passed. Browser: started an Expert run, saw an entering enemy and the result at 18.4 seconds after leaving Ahri idle (8 casts, including one Ahri); this is a smoke test, not a human survival/fairness benchmark.
- Remaining: only three of seven planned regular spells are implemented; no rare ultimates, authored safe-combination checks, adaptation, or per-spell outcomes. Concurrency caps and visible spawn positions do not establish that combinations are avoidable. Validate actual player runs and implement the remaining mechanics before calling the Gauntlet finished.

## Directed Dodge phase outcomes (31 October 2026)

- Added result accounting per spell for avoided, hit, blocked and harmless projectile phases. A returning Ahri Q may count twice because its outbound and return legs can have different outcomes; casts remain a separate count. Active unresolved phases are displayed separately. Lethal hits are recorded before the results screen is generated, and each phase resolves at most once.
- Threat qualification still uses a short predicted intersection with the current player position, so it is a training heuristic: it does not prove reaction time, intentional movement or geometric fairness. No claims about Flash-specific outcomes or true counterplay analysis are made.
- `node --test tests/*.test.cjs`: 144/144 pass, including harmless miss versus threatened avoidance, lethal-hit reporting, unresolved phases and independent Ahri Q legs. Browser smoke test: an unattended Expert run ended at 18.4 seconds and displayed 7 Ezreal Q hits and 1 Ahri Q hit across 8 casts. No complete human run or balance validation was performed. `node --check game.js` and `git diff --check` pass.
- Next: implement additional source-supported spell mechanics and safety scheduling; fixed threat caps alone do not prove dodgeable combinations. Preserve no stun in Dodge and existing playable modes.

## Ambient Xerath W training encounter (31 October 2026)

- Added map-origin Xerath W to the regular director after 45 seconds, with no visible caster and a circular ground warning. The 26.21 community reference ([LoL Wiki](https://wiki.leagueoflegends.com/en-us/Xerath), [Riot Codex](https://riotcodex.net/champions/Xerath)) reports 275/125 game-unit outer/epicenter radii, rank-one base 50 magic damage, 66.7% center amplification, a 0.25-second cast and 0.528-second strike delay. These map through the existing approximate 0.5 scale. Assumed 30 MR, center-based collision, warning presentation and onset are training approximations; slow is deliberately omitted for this initial pure-Dodge implementation. This is not a client-verified replica.
- For an early safety policy, W is scheduled only with no other directed threats in flight or casting. Its randomly oriented center is offset by 90 canvas units, and a straight walkable escape is checked using 0.2 seconds reserved for recognition and an extra 10-unit margin. This is not a complete human-reaction or multi-threat fairness proof. Attempts that fail the safety check are deferred/reselected; consequently the nominal 3/74 weight is not the realized frequency. W participates in the threat cap, cast counts and per-spell outcome report; an active area is unresolved at session end. Records use `director_v4`.
- `node --test tests/*.test.cjs`: 147/147 pass, including center/outer boundaries, damage, delayed impact, no on-screen caster, movement escape and isolation from other directed attacks, plus the long-session cap test. `node --check game.js` and `git diff --check` pass. Browser smoke test confirmed updated menu and Dodge startup; the rare W itself was not visually observed in a human run. Further browser playtesting, spell recognizability and timing comparison with League are required.
- Next priorities remain missing Blitz Q, Vel'Koz Q split, Xerath Q, Orianna R and Malphite R, shared threat fairness, meaningful longer human runs, and four-mode integration. Existing slow/CC omission should be revisited only in line with the user's no-stun preference.

## Blitz Q Dodge training (31 October 2026)

- Added Blitz Q after the first 45 seconds of default Dodge, with an original simple robot silhouette and an attached chain while the hook is in flight. The visitor holds position until the projectile resolves and then exits. A hit deals damage and immediately ends the hook; no stun or pull is applied, honoring the user's preference against immobilization in Dodge. This is therefore not a full Rocket Grab simulation.
- Rank-one 110 magic damage and 1020 listed range are from the 26.21 [Riot Codex](https://riotcodex.net/champions/Blitzcrank); the community [LoL Wiki](https://wiki.leagueoflegends.com/en-us/Blitzcrank) describes different projectile range details, and 1800 speed is community-reported. The 0.25 s cast, 70-game-unit projectile radius, 30 MR, art, endpoint details and simplified targeting require client verification. Scale is the existing approximate 0.5. The player is the only hook collision candidate in this Dodge arena; blocking with minions and the lollipop end check are not implemented.
- After 45 s, nominal weights among implemented cards are 45 Ezreal / 15 Lux / 11 Ahri / 12 Blitz / 3 Xerath W; retries and W isolation can change realized shares. The new hook occupies one threat budget slot across caster and projectile, and reports its outcome. Local bests are separated under `director_v5`.
- `node --test tests/*.test.cjs`: 149/149 pass, including one hook per visitor, waiting through flight, hit without immobilization, damage, range expiry, swept collision and the long director cap test. `node --check game.js` and `git diff --check` pass. Browser smoke test: the updated Dodge started; Blitz is gated until 45 s and was not visually observed during this smoke test. Full human playtesting and source/client comparison remain necessary.
- Next: Xerath Q and Vel'Koz split, then rare ultimates and safety validation across combinations. No successful multi-minute human run or fairness proof exists yet.

## Single projectile escape check (31 October 2026)

- Addressed a fairness problem in directed Dodge: a straight cast could be locked at a distance that leaves insufficient time for Ahri to clear its combined hitbox. Before selecting a visitor origin and again at aim lock, the director now checks the spell cast delay, projectile speed, player speed, combined collision radii, an 8-unit margin and a 0.2-second training recognition allowance. It samples both perpendicular straight escapes against the approximate terrain. If the player has moved too close while the caster enters, that caster leaves without firing; no cast is counted. Retries increased from 20 to 80 to keep the first encounter available with the new constraint. Local records are partitioned under `director_v6`.
- This check only establishes a sampled straight-line escape for an isolated outbound projectile at aim-lock time. It does not validate overlapping shots, returning Ahri Q, human reaction ability, animations or all possible routes; it can also reject viable encounters. It is a training policy, not a claimed League mechanic. Combinations, full skill roster and playtesting remain outstanding.
- `node --test tests/*.test.cjs`: 152/152 pass. New tests reject close casts, accept a long-range walkable cast, cancel after the player closes distance and simulate a 200ms-delayed ordinary sidestep. Browser smoke test: Expert Dodge started and an enemy entered; no multi-minute human fairness validation. `node --check game.js` and `git diff --check` pass.

## Dodge overlap forecast (31 October 2026)

- Extended the cast-time sidestep check to forecast the candidate projectile alongside already-flying directed straight projectiles and already-locked visitor casts. The forecast samples two straight perpendicular paths, reserves the existing 0.2-second recognition window and uses swept-circle collision. If neither path is clear, the new cast is rejected. A directed Ahri orb in flight or an already-locked Ahri cast defers new casts until it resolves because its return path is not yet forecast. Xerath W remains isolated by the existing policy. This maintains some straight-shot overlap without pretending that a numerical concurrency cap alone proves safety.
- This is still a conservative training heuristic, not an exhaustive reachability or human-reaction proof: it samples only two constant-direction responses, uses stationary aim at lock, ignores trajectories after 3 seconds, may reject viable combinations, and cannot forecast future player decisions or moving/reversing orbs. Real-client collision fidelity and full Gauntlet playtests remain open. New local record key `director_v7`.
- `node --test tests/*.test.cjs`: 155/155 pass; added tests for one versus two blocked sidesteps, an already-locked cast and deferral during a return orb, alongside the existing 12-minute simulation. `node --check game.js` and `git diff --check` pass. Browser smoke test started Expert Dodge, but did not establish that overlapping encounters feel fair to a human.

## Ambient Xerath Q (31 October 2026)

- Added Xerath Q as a directed map-origin beam after 45 seconds, without a visible champion. A brief source glow provides a directional cue; the exact beam appears at impact, not during its warning, respecting the user's preference against showing skill trajectories in advance. It has separate hit/avoid/unresolved accounting and occupies one directed threat slot. As with W, it is scheduled only when other directed encounters are clear.
- [Riot Codex 26.21](https://riotcodex.net/champions/Xerath) reports a 145-game-unit width, fully charged range 1450, rank-one 70 magic damage and approximately 0.5-second recast. The implementation uses the existing approximate 0.5 scale, 30 MR, a 0.528-second training warning, a fixed off-center line and a sampled 200ms-reaction walkable escape. Source glow, line placement, character-radius collision and lack of Xerath's charging phase are training approximations, not verified live-client behavior. The no-overlap policy and visible source may reduce intensity and are not a full fairness proof.
- Nominal weighted selection after 45 seconds is 45 Ezreal / 15 Lux / 11 Ahri / 12 Blitz / 3 Xerath W / 6 Xerath Q, but retries and isolation affect realized frequencies. Records now use `director_v8`. The rare ultimate roster and Vel'Koz Q remain unimplemented.
- `node --test tests/*.test.cjs`: 158/158 pass, including no on-screen caster, no pre-impact aim line, impact render, damage, both hitbox boundaries, 200ms-delayed movement escape, overlap isolation and a 12-minute simulation that actually schedules Xerath Q. Browser smoke test started Dodge; the Xerath Q was not personally observed in browser, so visual readability and feel still require a human playtest. `node --check game.js` and `git diff --check` pass.

## Xerath Q rectangular geometry (31 October 2026)

- The community [League Wiki reference](https://leagueoflegends.fandom.com/wiki/Xerath/LoL) describes Arcanopulse as a rectangular hitbox starting at the caster. The ambient training beam previously used a capsule, overreaching sideways at the ends. It now intersects the player's circular gameplay radius against a rotated rectangle with flat ends; corner contacts are computed from the nearest rectangle point. At impact the rendered beam uses the configured rectangle width and flat ends. Character-radius treatment, source cue and 0.5 map scale remain unverified training approximations. Records use `director_v9`.
- `node --test tests/*.test.cjs`: 159/159 pass, including side, end, corner and rotated-rectangle boundaries, previous beam damage/dodge tests and the 12-minute director simulation. `node --check game.js` and `git diff --check` pass. Browser smoke test confirmed Dodge starts; the brief Xerath beam was not observed in the browser and still needs visual calibration in human play.
- Remaining: Vel'Koz Q, rare ultimates and full human testing; no claim of exact live collision or overall Gauntlet completion.

## Vel'Koz Q first implementation (31 October 2026)

- Added a weighted Vel'Koz Q encounter after 45 seconds: the initial bolt can hit the player or recast after a sampled diagonal travel distance, then after 0.25 seconds produces two faster perpendicular bolts. A shared hit guard prevents multiple hits to the same player from a single split cast. No slow is applied in this Dodge iteration. The visitor uses the existing generic mage art; purple projectile styling is an original placeholder, not an authentic Vel'Koz model.
- [Riot Codex 26.21](https://riotcodex.net/champions/Velkoz) reports rank-one 80 magic damage, 1100 range, 0.25-second split and perpendicular bolts; [PHAROS](https://pharos.wiki/lol/en/champions/Velkoz) lists 120 initial width and 1300 initial speed, and community reports describe 2100 split speed. Values use the existing approximate 0.5 scale and assumed 30 MR. Split projectile radius/range, fixed diagonal aim and recast targeting, same-target guard, animation and no slow are training approximations needing client verification. Blocking by minions and actual caster ability/CC are absent.
- The director only starts this encounter in a clear field and waits while any of its projectiles remain. The existing forecast does NOT model the splitting branches and is not proof the pattern is dodgeable; review timing and geometry before declaring the encounter fair. Its two branch sprites are counted separately by the existing raw active-projectile cap, although they belong to one cast. The outcome summary reports projectile-phase outcomes; it is not a per-cast success rate. The weighting bag now nominally matches 45/15/12/11/8/6/3 for Ezreal/Lux/Blitz/Ahri/Vel'Koz/Xerath Q/W after 45 seconds, but safety retries change realized proportions. Records use `director_v10`.
- `node --test tests/*.test.cjs`: 163/163 pass, including perpendicular branching, higher split speed, delayed split, one-hit guard, a diagonal split hitting outside the initial path and a 12-minute simulation scheduling Vel'Koz. `node --check game.js` and `git diff --check` pass. Browser smoke test confirmed Dodge startup; no human browser run reached and visually validated the Vel'Koz encounter. Rare ultimates, split fairness and full visual/audio fidelity still need work.

## Vel'Koz split escape forecast (31 October 2026)

- At Vel'Koz aim lock, the director now samples 24 straight walkable player routes against the initial bolt and both predicted perpendicular split bolts, including their speed, travel time, split delay, champion radius, a 5-unit margin and the existing 200ms training reaction allowance. It cancels the encounter if none passes. An entering/casting Vel'Koz reserves the directed encounter, preventing another visitor from being scheduled before its projectile exists; aim lock also checks for other active encounters.
- This models the current training implementation, not verified live League physics. It is a deliberately limited approximation: only straight responses and stationary initial positions are sampled; player decisions can still lead to a hit, and 200ms is not an established fairness guarantee. It does not validate overlap with other threats, because the implementation deliberately isolates this encounter. Cast-angle selection may reject viable patterns, affecting frequency. Local records use `director_v11`.
- `node --test tests/*.test.cjs`: 167/167 pass, including a forecasted route executed against the actual split after 200ms, a rejected point-blank case, reservation during entry, and the existing 12-minute simulation. `node --check game.js` and `git diff --check` pass. Browser smoke test confirms Dodge starts; a human has not yet played or visually reviewed this encounter. Rare ultimates and complete Gauntlet fairness/feel validation remain outstanding.

## Rare Orianna R prototype (31 October 2026)

- Added an independently scheduled rare Shockwave to default Dodge. Its first eligible time is seeded between 90 and 150 seconds; subsequent attempts are 90–150 seconds apart, defer while directed threats are present, and reserve the field during a 1.5-second visible-ball preparation and 0.5-second cast. At cast time, an ordinary walkable escape with a 200ms allowance is checked; an unsafe cast is cancelled. The ball location remains the center of the strike and its result is accounted by spell.
- [Riot's Orianna page](https://www.leagueoflegends.com/en-us/champions/orianna/) identifies Shockwave as ball-centered; [community spell reference](https://wiki.leagueoflegends.com/en-us/Template%3AData_Orianna/Command%3A_Shockwave) reports damage, stun and pull, while [Dodge.gg's 2026 guide](https://www.dodge.gg/en-US/lol/news/orianna-build-2026) reports 415 radius, 0.5s cast and 250 rank-one damage. Existing approximate 0.5 scale and 30 MR apply. To respect the user's no-stun Dodge instruction, neither stun nor pull is implemented. This is a prototype: the ball appears at its destination without an Orianna champion or Q travel, setup duration and cue are training choices, collision-radius interpretation is unverified, and the escape check is not a human fairness proof. Rare clock reset occurs when setup starts, including a later cancelled cast. Records use `director_v12`.
- `node --test tests/*.test.cjs`: 171/171 pass, including visible setup before cast, cancellation if too close, no immobilization, pause/overlap behavior, no first-90-second event and scheduling during the 12-minute simulation. `node --check game.js` and `git diff --check` pass. Browser smoke test started Dodge; the rare event has not been visually observed in a human session. Malphite R, full Orianna/ball behavior, longer playtesting and comprehensive fairness are still outstanding.

## Rare Malphite R prototype (31 October 2026)

- Added a separately seeded Malphite R clock, first eligible between 150–240 seconds and repeating at a seeded 150–240-second training interval. Orianna and Malphite share a 35-second guard measured from encounter start, and either rare encounter requires the directed field to be clear. Malphite appears as an original rough rock silhouette, walks a short distance during a 1.25-second setup and dashes to a fixed location; no target marker or stun/knockup is added. A candidate is rejected unless a sampled ordinary walkable escape remains after a 200ms allowance. Outcomes and cast counts are reported separately.
- [Riot Codex 26.21](https://riotcodex.net/champions/Malphite) reports 1000 range, 325 impact radius, 200 rank-one magic damage and a knockup; the [community reference](https://wiki.leagueoflegends.com/en-us/Template%3AData_Malphite/Unstoppable_Force) reports dash speed 1500 plus movement speed. The implementation uses the existing approximate 0.5 scale, 335 base movement speed and 30 MR. Knockup is deliberately omitted to honor the user's no-immobilization preference. Movement setup, fixed off-center aim, silhouette, hitbox expansion, safety policy and dash movement are training approximations, not a live-client replica. Cancelling at dash decision still consumes the next rare scheduling window. Records use `director_v13`.
- `node --test tests/*.test.cjs`: 174/174 pass, including visible approach, dash, damage without immobilization, a 200ms-delayed escape, no event in the first 150 seconds and a 12-minute run scheduling both rare events. `node --check game.js` and `git diff --check` pass. Browser smoke test confirmed Dodge starts, but no human browser run reached this rare event. Longer playtesting, accurate visuals, cue readability and timing, rarity calibration and a stronger fairness analysis remain necessary; the full Gauntlet is not finished.

## Orianna ball travel and caster cue (31 October 2026)

- The rare Shockwave setup now renders an on-screen caster using the existing generic mage artwork and moves the ball from that caster to its fixed destination before casting. The visible setup remains 1.5 seconds, and R still checks a walkable escape at the destination before its 0.5-second cast. The new source-position checks may defer some encounters. Records use `director_v14`.
- [Community Orianna reference](https://leagueoflegends.fandom.com/wiki/Orianna/LoL) records a 1400-unit Command: Attack missile speed and that Shockwave may be buffered while the ball travels. The animation uses 1400 game units/s with the existing approximate 0.5 scale. This is still a training presentation: the caster is generic artwork, position and setup are authored, the Q ball is not a damaging projectile, and ally attachment, ball leash, real cast animations and live-client timing are unimplemented. No stun or pull is applied in Dodge.
- `node --test tests/*.test.cjs`: 176/176 pass, including visible caster rendering, ball movement and arrival before R, safety cancellation, pause, rare scheduling and the long-session simulation. `node --check game.js` and `git diff --check` pass. Browser smoke test starts Dodge; this rare encounter has not yet been visually observed in a human browser session. Continue with actual multi-minute playtesting, visual fidelity, and fairness validation of rare and mixed encounters.

## Orianna Q collision and current R base damage (31 October 2026)

- Orianna's setup ball is now a damaging Q: its 1400-unit/s movement performs swept collision against the moving player, and its destination has a separate arrival area. A single cast can hit the player at most once. Q casts and hit/avoid/blocked/harmless outcomes are tracked separately from the later R; unfinished Q and R phases are reported separately on the result screen. Threat qualification is still a gameplay heuristic, not a measured reaction.
- [Riot patch 26.12](https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-12-notes/) reduced rank-one Shockwave base damage from 250 to 225; updated the prior outdated value. [Community Q data](https://wiki.leagueoflegends.com/en-us/Template%3AData_Orianna/Command%3A_Attack) reports 60 rank-one damage and 1400 speed; a [community guide](https://magicstark.cz/en/wiki/orianna-the-lady-of-clockwork/) lists width 160 and arrival radius 175. These values use the existing approximate 0.5 scale and 30 MR. Center-based arrival collision, generic caster art, target placement, no multiple-target damage reduction, and no R pull/stun are training approximations. No AP is modeled. Records use `director_v15`.
- `node --test tests/*.test.cjs`: 180/180 pass, including swept ball hit, one-hit behavior, arrival boundaries, avoiding the arrival area, lethal Q attribution, R damage and long-run counters. `node --check game.js` and `git diff --check` pass. Browser smoke test starts Dodge; Orianna's rare encounter has not yet been visually played in the browser. Continue with multi-minute human playtesting, spell visuals and the remaining Gauntlet fidelity/fairness work.

## Ahri charm and directed visitors (31 October 2026)

- Fixed directed Dodge visitors bypassing Ahri's charm: they now move toward Ahri for the existing charm duration, interrupt an entering or uncommitted cast and leave afterward. An already-fired projectile remains active. Visitor hit flashes now decay. A visitor whose exit path is blocked by an approximate wall uses the existing world pathfinder rather than remaining stuck. Dodge's no-stun preference for the player is unchanged.
- This reuses the game's existing 1.2-second charm and movement approximation; it is not a claim of patch-exact control or full champion AI. Orianna/Malphite rare actors are still training hazards, not targetable champion entities. Local records use `director_v16` because suppressing incoming casts changes scoring.
- `node --test tests/*.test.cjs`: 183/183 pass, including pre-release interruption, movement toward Ahri, survival of an already-fired projectile and routing around a wall. `node --check game.js` and `git diff --check` pass. Browser smoke test started Dodge and observed an unattended Expert round; the specific charm interaction was validated in automated simulation, not a human browser playthrough. Continued work remains on full Gauntlet playtesting, animation and rare-caster interactions.

## Combat feedback cleanup after browser interaction (31 October 2026)

- During an actual browser interaction in Expert Dodge, right-click movement and Ahri W were accepted, but a hit displayed a long floating-point value (`−80.99173553719008`) above the champion. Combat text now rounds positive damage to a whole number (at least 1); simulation HP and damage statistics retain the unrounded values. Removed the floating `MISSED` text on enemy minion death in keeping with the user's request to avoid invented combat graphics; the missed-CS and gold counters are unchanged.
- `node --test tests/*.test.cjs`: 185/185 pass, including fractional damage preservation versus rounded rendering and missed-CS accounting without the floating label. `node --check game.js` and `git diff --check` pass. Browser: started Expert Dodge, moved with right-click and activated W; reloaded the changed game and observed a second round. This short interaction did not reach the rare events or establish overall balance/fairness. Actual long human playtesting remains necessary.

## Pending split outcomes and pause/restart (31 October 2026)

- Corrected Dodge's end-of-round unresolved phase count for Vel'Koz Q: the 0.25-second pending split is unresolved if its branches can still hit the player, despite the main bolt already being resolved. If the main bolt or one split branch has already hit the player, suppressed sibling branches are excluded because they cannot produce another player hit. This changes result reporting only, not collision, damage or scoring.
- `node --test tests/*.test.cjs`: 188/188 pass, including pending split versus already-ineligible split, pause freezing the split, and restart clearing projectiles/outcomes. `node --check game.js` and `git diff --check` pass. Browser: started an Expert run, paused, and restarted; UI returned to 00:00 and 590/590 HP. The specific split-phase cases were tested in simulation, not observed in a human browser run. Long human Gauntlet sessions and complete presentation/fairness validation are still outstanding.

## Ahri Flash fidelity (31 October 2026)

- Updated Flash for the Ahri profile and reference dodges using the [community Flash reference](https://wiki.leagueoflegends.com/en-us/Flash): max 400 game units (200 canvas at the current approximate scale), cursor-limited short casts, 300-second base cooldown and no artificial invulnerability. It cannot be used while rooted. It can be used during Ahri's Q/E cast without cancelling that cast. Other legacy attack presets retain their prior arcade distance/cooldown. Default Dodge records are partitioned under `director_v17` due to the changed Flash resource.
- Wall landing still uses the project's approximate `nearestWalkable` and may differ from League's wall snapping. Spell haste, runes, Flash variants, precise movement-order persistence and all cast interactions are not modeled. One-minute sessions now allow at most one base-cooldown Flash; this is intentionally closer to Summoner's Rift rather than an unlabeled rapid-reset training mechanic.
- `node --test tests/*.test.cjs`: 191/191 pass, including short/far cursor range, 300-second cooldown, root restriction, no immunity, and Q+Flash cast preservation. `node --check game.js` and `git diff --check` pass. Browser: in Expert Dodge issued a movement target and Flash, observed Ahri blink and the 300-second cooldown in the HUD. No full rare-event or multi-minute human playtest was performed.

## Minion death grace and subsequent targeting (31 October 2026)

- Researched [Riot 26.1](https://www.leagueoflegends.com/en-us/news/game-updates/patch-26-1-notes/) and the [community minion reference](https://wiki.leagueoflegends.com/en-us/Minions): early waves are 30 seconds apart, first cannon is wave three, acquisition is 500 game units, and targets are reconsidered between windups with higher-priority targets preferred. The wiki also documents a 0.066-second minion death grace below 0.35% maximum HP (excluding damage above 190). Current CS uses a deliberately shortened pre-positioned scenario: waves spawn near mid all at once, surviving units wait at an artificial ingress limit, and there are no nexus, turrets, full-lane travel, unit collision or measured Rift navigation. It is not a faithful complete wave simulation.
- Implemented that death grace in Ahri CS for actual minion melee/projectile impacts, without extending its timer on repeated minion hits. Champion damage can secure the kill during the grace; after expiration the original minion gets attribution and surviving attackers can retarget. The simulation's 120 Hz step quantizes expiry by at most one tick. This interpretation follows community documentation; unverified edge cases and rounding in Riot's implementation may differ. Records now use `cs_ahri_v11`.
- Added focused tests for player credit, expiry, threshold and damage exclusions, retargeting and simultaneous committed attacks. Browser smoke test started CS practice and observed unattended waves 1, 2 and 4 progress, with minions still fighting; this is not a full human CS or wave-behavior validation. Next priority: replace the artificial ingress and instantaneous on-screen formation with a well-tested continuous lane/wave arrival model, while accounting for finite map size, spacing, turrets and visual readability. Verify target priorities and attack animation/timing empirically against LoL; do not claim exact simulation.

## Movement after Flash (31 October 2026)

- Ahri/reference Flash now preserves an ordinary move order when the blink is forward along the current route, clears the obsolete path and recalculates from the landing. Flash in the opposite direction or beyond the destination clears the order; attack/chase orders and casts are not converted to movement. This follows the [community Flash patch history](https://wiki.leagueoflegends.com/en-us/Flash), which documents movement persistence when flashing in the movement direction. The positive-dot direction test, handling of an overshot destination and behavior for attack orders are explicit training approximations, not measured Riot implementation details. Legacy arcade presets are unchanged. Local records use `director_v18` and `cs_ahri_v12`.
- `node --test tests/*.test.cjs`: 197/197 pass, covering continued movement, backward and overshooting Flash, attack chase cancellation and route rebuilding around a wall. `node --check game.js` and `git diff --check` pass. Browser smoke: restarted Expert Dodge, right-clicked ahead and pressed Flash; Ahri blinked and subsequently reached the clicked position. This is not a full human dodge or long-session fairness test. Next: test uninterrupted 3/12-minute runs, independently verify rare combinations and improve placeholder champion presentation; CS wave travel remains a separate significant unfinished task.
