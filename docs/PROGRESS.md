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
