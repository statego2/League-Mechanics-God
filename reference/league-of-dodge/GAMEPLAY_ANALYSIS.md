# GAMEPLAY_ANALYSIS — League of Dodging (reference, not a code clone)

**Evidence level:** static inspection of the full supplied archive and browser checks of individual local exports on 30 October 2026. Kiting and Farming reached gameplay; several other exports fail because dependencies are absent. There is no editable GML source or authoritative redistribution license. Distinguish observed behavior from metadata and inference; see [manifest](manifest.md) and [complete inventory](ZIP_INVENTORY.md).

## Farming observation (30 October 2026, follow-up)

Revisited the supplied public Farming page and ran the previously archived export locally. Its opening wave visibly included blue/red melee, casters and cannon units moving from opposite directions; it displayed separate minions missed, money missed and money earned counters. During this short unattended observation the counters reached two misses and 42 money missed. This does not establish individual rewards, actual LoL attack timings, complete wave schedules or in-client fidelity; the Farming implementation uses its own training rules. For our two-wave Ahri drill the first two ordinary League waves remain melee/caster only, so cannon is not inserted into them merely because the reference opens with one. The game now reports earned/missed gold independently using the PR #1 source-reported starting melee/caster values; these are not an implemented economy or XP system.

## Archive comparison and practical application

| Area | Reference evidence | Our current implementation and next work |
| --- | --- | --- |
| Farming | Browser shows two opposing waves with melee, ranged and cannon units and missed/earned money. Object metadata includes separate red/blue minions, melee/ranged/cannon and controller. | Last-Hit Lab now simulates both sides, health, target retention, melee hits and traveling caster shots. This is an independent approximation, not verified LoL parity; cannon, aggro rules, timing and lane travel remain. |
| Kiting | Browser shows an oblique arena, mobile character and opponent, a setup value displayed as 2.50 and Flash. Exports contain `oplayer`, `oenemy`, `oautoattack`, attack-speed and directional walk/shot sprites. The exact cadence and cancel window were not measured. | Persistent attack orders, cancellable windup and missile/cooldown are already implemented. Preserve these; later introduce an ADC with high attack speed for Kite, per user preference, without removing Ahri from other modes. |
| Dodge and skillshots | Assets and object metadata include many distinct projectile and indicator types, but missing extensions prevent live verification. Names alone do not prove exact sizes, cast delays or collision. | Swept collision, per-skill geometry, minion interception and seeded threats are present. Dodge Trial now applies damage without a root so one hit does not force subsequent hits. Improve hitboxes and calibrate them against reliable LoL data. |
| Input and responsiveness | GameMaker metadata references movement, attack range and attack move; exact click behavior could not be established from the available browser session. | Existing right-click orders, held movement, attack-move and fixed-step simulation should be preserved and evaluated by human playtests; no unsupported claim of identical controls. |
| Presentation and animation | Kiting/Farming render small animated units on an oblique terrain; exported atlases and direction-specific movement/attack sprite identifiers exist. | Our own world/art and Ahri remain independent. Improve animation and camera/world calibration against observed play, keeping sprite and hurtbox sizes distinct. |
| Difficulty and scoring | Reference setup and live Farming counters observed; symbol names indicate presets and ranking but do not establish exact thresholds. | Seeded presets and distinct CS/missed counts are implemented; tune with full manual sessions, especially combined lane pressure. |

The archive informed the two-sided minion simulation and its visible counters, not copied code or assets. Fidelity is bounded by the observations: paths, attack cadence, player feel and minion rules require separate measurement. The following earlier single-export investigation remains useful, but statements that describe only missing uploaded assets are historical; archive status is in the manifest.


## Engine and execution structure

- The page creates a single 1920×1080 HTML5 canvas and loads the compiled GameMaker HTML5 export with GameMaker_Init.
- The JS bundles a GameMaker runtime, an obfuscated variable-name map, sprite metadata/atlas names, event handlers, rooms/objects and broad engine utility functions. Therefore not every function present is necessarily used by the game.
- Metadata references 9 sprite texture atlases (dodge_texture_0.png through dodge_texture_8.png) and the GameMaker extensions tph_adManager.js and uph_localstorage.js. The atlases are in the archive; both extensions are absent locally and their absence causes runtime errors.
- Source naming includes firstscreen, oplayer, oautoattack, o_bullet, o_bullet_2, o_dodge_mode, o_dodge_skillshot_mode, o_skillshot_mode, o_xerath_shot, o_velkoz_q, o_velkoz_split_left/right, o_ahri_q, o_luxult, o_jinx_w_indicator, o_windwall, o_le_blanc_w, o_ezreal_ult and many controls/menus.
- Some sprite names include s_enemy_up, s_enemy_down, s_enemy_side, s_windwall, s_xerath_animation, s_ahri_q and s_menu_background. Names prove embedded metadata, not necessarily all modes are currently playable.
- Includes rank and scoring references; a leaderboard service appears at pauledevelopment.de (dodgev1/dodgev2, daily, weekly, all-time). These are outside services, not mechanics to copy.

## Movement and input

**Observed:** The obfuscated player-related update function associated with oplayer samples directional key inputs and at least mouse inputs. The symbol mapping contains player_walk_dir, move_speed, walksp, normal_walksp, locked_cam, walking, direction, point_direction, move_towards_point and mouse_x/y. The function linked to player step updates position through keyboard checks. **Not established:** identical League right-click navigation semantics; exact player acceleration, frame units and retarget rates need runtime testing.

**Original design recommendation:** create an InputIntent layer separating right-click movement destination, right-click attack targeting, A+click attack-move and targeted QWER. Convert cursor from canvas pixel to world position once, clamp safely, move by delta-time and cancel/retarget immediately on new commands. Test rapidly alternating commands at multiple FPS.

## Projectiles and collision

**Observed:** The bullet object o_bullet has a creation/step event. Its creation function sets direction toward a player-related object, applies a small random angular offset, reads projectile speed from a global variable, and increments a spawned-bullet counter. Its update function performs collision tests against player and another object. A collision with the player sets a global death flag in this code path. Projectile functions and symbols include bullet_speed, bullet_set_speed, bullet_set_amount, enemy_set_amount, collision_line, collision_circle, collision_point and place_meeting.

**Caution:** A collision API being present in the bundled engine does not prove the game uses that API for every projectile. Hitboxes may differ across projectile types. The exact damage model and all collisions remain unverified.

**Original design recommendation:** distinguish line missiles, radial AoE, fan projectiles, returning projectiles and delayed telegraphs. For fast missiles use swept segment-circle collision rather than endpoint-only overlap to avoid tunneling at low FPS. Separate hurtbox from sprite artwork; preserve a configurable hitbox margin. Create deterministic fixtures for player/path/projectile collisions.

## Kiting / auto attacks

**Observed:** There is an oautoattack object; the mapped symbols include aarange, attack_cd, attackspeed, walking, outofrange, mr_on_enemy, key_a_allowed, pauseframes, fpauseframes, direction_cd, move_speed. One object step handler calculates the angle/direction to a referenced target, moves toward it, and destroys itself on contact. The compiled game is more nuanced than simple static bullet art.

**Not established:** LoL-exact auto attack windup percentages, missile launch timing, cancel windows, attack speed caps, target selection and orbwalking semantics. Do not assert one-to-one League parity from identifiers.

**Original model:** Idle → Acquire target → Chase until in range → Windup (attack can be cancelled by move) → Commit projectile or hit → Recovery/cooldown → Ready. Allow move immediately after the committed attack, but moving before release should cancel damage. Make attack cadence timer-based rather than per-frame. Distinguish A+click attack move target selection from right-click attack unit. Draw range and windup/ready indications during practice.

## Skillshots, abilities, patterns

**Observed in names/metadata:** Ahri Q, Xerath shot/indicator/explosion, Vel'Koz Q and split projectiles, Lux ultimate, Jinx W indicator, Ezreal ultimate, Wind Wall, Zed/LeBlanc mobility elements; variables expose key_q/w/r cooldowns and cast ticks, Flash-related settings and player health.

**Not established:** every named ability has a playable mode, exact hitbox trajectory, collision priority or cooldown. Any screenshots/videos should be treated as additional evidence rather than assumptions.

**Original design sequence:**
1. Line projectile with windup/telegraph, speed, width and expiration.
2. Three-way spread/fan with consistent angle spacing.
3. Targeted delayed circular AoE, with pre-impact hazard display.
4. Split/returning projectile and wall/collision-blocker variant.
5. Create a configurable pattern library so a drill can sequence threats at controlled difficulty.

## Enemies, time and difficulty

**Observed:** symbol mapping includes enemy_spawn, enemy_spawn_where, enemy_set_amount, enemy_set_speed, enemy_timer_max, random_ability, enemy_stop, bullet_set_amount, bullet_set_speed, mode_dodge, score_factor and rankings. UI objects exist for easy, normal, hard, extreme, custom and ranked selections. These imply adjustable variables, difficulty and scoring; numeric balance and exact behavior require live inspection.

**Original design:** use seeded encounters/deterministic spawn scheduling for replayable drills, with explicit difficulty presets controlling enemy count, projectile velocity, telegraph time and pattern frequency. Cap simultaneous threats, spawn off-screen with clear line-of-fire cues and avoid unwinnable random overlaps.

## Dodge statistics — critical measurement issue in our own alpha

Our current production game.js is known (per the project blueprint) to count enemy projectile expiration/out-of-bounds as dodged. That can reward projectiles that would never have hit the player. **This is our game's issue, not proof of a League of Dodging defect.**

Define a credible dodge as a genuinely threatening projectile whose predicted swept trajectory intersected the player hurtbox (within a defined future time window), then resolved without hitting. Track fired / threatening / hit / avoided / blocked separately. A miss from the start is not player skill. Only record a dodge after projectile resolution; test stationary vs active avoidance, edge cases and E shield/block behavior.

## Visual readability / fair training

GameMaker sprite metadata suggests coordinated animation/indicator assets, while our current prototype still draws primitive geometry. Prioritize original or properly licensed silhouettes, shadows, readable windup poses, projected trajectories, hit flashes and consistent ground perspective. Art must never obscure real collision bounds or attack range.

## Original implementation checklist for Codex

**Phase 1 / highest priority**
- Test the two deployed/prototype modes locally with a real browser. Fix any errors before expanding scope.
- Make input deterministic: quick right-click retarget, A+click attack-move, reliable target acquisition, zero inadvertent left-click movement.
- Replace simplistic attack timing with explicit windup/release/cancel/recovery; expose attack range and feedback.
- Fix our dodged counter with threat eligibility and a test harness; verify at 30/60/120 FPS.

**Phase 2**
- Introduce swept collision, reusable projectile definitions, safe telegraphs and replayable dodge patterns.
- Add skillshot accuracy/last-hit labs incrementally after quality is solid.
- Keep Code & references isolated: production remains root index.html, game.js and style.css.

## Test cases (must run, not merely document)

- New move during windup cancels only an uncommitted attack; move after release preserves the projectile.
- Attack input outside range chases into range, strikes once, then permits immediate movement.
- Two target clicks in a single frame obey the newest command.
- Fast projectile crossing the player in one 30-FPS frame still collides.
- Stationary player facing a projectile aimed elsewhere scores **zero** dodges.
- Telegraph triggered near arena border remains visible/clipped correctly.
- Pause freezes simulation timers and projectiles; restart resets state, high score handling and cooldowns.
- 60-second dodge completion and 10-kill kite completion work exactly once and show consistent counters.

## Legal / operational warnings

- Compiled third-party GameMaker JS and sprite atlases are **not** licensed by virtue of being publicly downloadable. Do not commit or reuse them without permission.
- The reference JS contains external score endpoints and ad/analytics-related extension names. Do not call score-submission endpoints from our training game.
- Do not directly translate or copy third-party obfuscated algorithms; independently implement the mechanics described at a behavioral level and verify against gameplay.

## Confidence ledger

| Statement | Confidence | Why |
| --- | --- | --- |
| GameMaker HTML5 / canvas 1920×1080 | High | HTML source and initialization |
| 9 named texture atlases, 2 extension scripts | High | JS metadata |
| Projectile/player collision logic exists | High | o_bullet event handler |
| Autoattack, enemy and skillshot game objects exist | High | Object/event metadata |
| Precise kiting and skillshot balance / all modes | Unverified | No full offline play test or GML sources |
| Complete ZIP/multigame import | Not done | Original ZIP not accessible |
