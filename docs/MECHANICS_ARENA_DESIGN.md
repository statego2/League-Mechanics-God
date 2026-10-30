# Mechanics Arena — Combat Survival Arena

**Project:** League Mechanics God — Mechanics Accelerator  
**Status:** OWNER-APPROVED PRODUCT DIRECTION. Design only; not a claim that the mode is implemented.  
**Date:** 2026-10-30  
**Branch:** `codex/controls-and-dodge`  

## 0. Critical owner correction: MANY opponents from the start

**The player-facing Mechanics Arena is a high-density 1-vs-MANY combat-survival game, NOT a 1v2 duel and NOT a 5v5 with allies.** Do not confuse an early two-actor *internal integration test* with the shipped mode.

**Initial tuning targets for the ACTUAL playable experience:**

| Difficulty | Concurrent enemies in the arena | Combat objective |
| --- | --- | --- |
| Foundation | **3–4** | Easy-to-follow but real multi-enemy pressure |
| Standard (primary product) | **5–6** | Chaotic, intense solo-vs-many fight with concurrent roles |
| Expert | **7–8+**, performance and fairness permitting | Deep mechanical overload and overlapping combos |

These numbers are **provisional design targets**, not promises of implementation or optimal balance. They describe simultaneously active, independent enemy champions (not projectiles), not total kills/waves during a session. Enemies do **not** all need to fire their highest-threat ability at once; meaningful coordinated pressure matters more than cheap impossible CC chains.

**Minimum viable PLAYER-FACING bar:** Standard must feel like battling many enemies; target 5–6 simultaneously. An interim build with only two actors may be used to validate the AI internally, but is not an adequate Mechanics Arena launch milestone. The user explicitly rejected the earlier suggestion that two enemies should define the initial experience.

## 1. The fantasy

**Solo Ahri versus a continuously changing crowd of enemy champions.** The opponents chase, kite, strafe, cast, retreat, rotate angles and die. The arena keeps replenishing them. You must use your WHOLE combat kit—Q/W/E/R, auto-attacks, Flash, movement, dodge, kiting, spacing, target-switching and all useful combos—**at the same time and by your own decisions**.

- **Not** a simulation of 5v5 with friendly allied champion bots.
- **Not** a rigid list of minigames that says "now hit E; now dodge".
- **Not** just surviving; meaningful offense, kills, combo execution and effective pressure are integral.
- **Not** a bullet hell with spells divorced from LoL-like movement, cast timings, range, hitboxes and visible counterplay.

In a typical moment, Ezreal is strafing and firing Q, a diver is closing, Blitzcrank threatens a hook from an angle, an enemy mage creates a zone, and a low-health opponent could be killed. You decide to Charm, hit both passes of Ahri Q, dodge incoming spells, use R for repositioning, attack-move, finish a target or disengage. A rare Malphite R occasionally creates a major Flash/positioning decision.

The fight should flow continuously, not reset when a combo succeeds.

## 2. Enemy combat ecosystem

Every opponent has independent:
- Spawn/entry path, HP and state, collision geometry and recognizable appearance.
- Movement/positioning, role-specific micro, attack range/windup and attack cooldown.
- Genuine ability cooldowns, cast/windup/commit, missiles/AoE and CC as relevant.
- Target acquisition (primarily the player in this solo arena), hit/death attribution and removal.
- Retreat/disengage logic, variable replacements and performance-aware scheduling.

**Enemy roles:** ranged carry (strife and aim), diver/bruiser (forces movement), tank/frontliner (space control), hook engager (positioning), caster/control (area/CC), high-impact engage champion (rare Malphite). Fill 5–6 slots with complementary role combinations; do not make six identical Ezreals unless user selects a deliberate special practice variant.

**Spawn lifecycle:** enter visibly at a sensible arena boundary → reposition/attack/cast → react to fight and HP → die or retreat/exit → refill after a short variable delay. Avoid spawning directly inside the player or guaranteeing lethal attacks at first frame. Keep 5–6 active enemies when the intended Standard combat state allows; replace rather than pausing for waves. Difficulty does not entitle the director to impossible simultaneous threats.

**No friendly team bots in this mode.** This is specifically owner choice B. Minions or stationary scenario geometry, if later introduced, are environmental modifiers rather than teammate AI.

## 3. Skill mastery is EMERGENT

All abilities remain available. Opponents act continuously and opportunities emerge:

- **Ahri E:** prediction at various distances, including honest long-range attempts, with real interception.
- **Ahri Q:** outbound plus returning orb and directional repositioning.
- **Combos:** E→Q, Q+R position changes, W chase, autos after spells, all under hostile pressure.
- **Kiting/orbwalk:** attack release, movement, cancel-versus-survive decisions against many pursuers.
- **Dodging:** incoming hooks, linear spells, split projectiles, AoE and returning paths.
- **Target switching:** stop focusing one target when a low-health enemy or dangerous diver changes the fight.
- **Mobility/Flash:** scarce defensive/engage resources with credible tradeoffs.
- **Spacing:** fight on appropriate edges of range rather than chase mindlessly.
- **Sustained effectiveness:** damage while staying alive; both matter.

Never pop up mandatory prompts like "NOW PRESS E." Tutorials may show optional hints, but the default is freeform combat.

## 4. Spell roster shared with Pure Dodge

Keep source-checked cast properties where available, explicit training approximations where not:
- **Ezreal Q:** frequent background pressure, less dense than the separate Pure Dodge mode.
- **Lux Q and Blitzcrank Q:** line CC and hook angles.
- **Ahri Q:** outward and returning trajectories.
- **Vel'Koz Q:** perpendicular split.
- **Xerath Q and W:** occasional *map-origin* ambient attacks **with no visible Xerath required**; readable fair cues.
- **Orianna R:** uncommon, centered on actual **ball position**, if represented.
- **Malphite R:** **rare significant event**, never a rapid spam cycle; distinguish prediction from realistic Flash reaction at different ranges.

Every enemy respecting its individual spell cooldown is preferable to arbitrary speed/cooldown cheating. High-pressure training arises through several simultaneous actors and varied coordinated encounters.

## 5. Rhythm: continuous combat and adaptive pressure

No scripted sections that pause the fight and isolate one skill. The director orchestrates:
- **Population:** fill slots by role; damaged/defeated enemies replaced at bounded intervals.
- **Pressure:** changing angles and threat combinations, with periods of slightly fewer burst casts while movement/auto combat continues.
- **Readability:** meaningful counterplay and room to aim/cast, not all enemies using hard CC at the exact same frame.
- **Player initiative:** kills, movement and ability usage change the next situation. Opponents aren't just stationary spawn points.
- **Rare moments:** Malphite-style high-stakes engages are not required in every short game.

The real spell geometry and speed remain stable within an agreed LoL-like ruleset. Raising difficulty means more overlapping valid problems and smarter role combinations—not secretly accelerating a projectile.

### Solo vs many balancing

An actual 1v5+ with perfectly coordinated, fully authentic LoL champions could become unwinnable, so make the product explicitly **a training-survival scenario**, not a statement that a level-1 Ahri should literally defeat an authentic coordinated 1v6. Use *declared* HP/ability/arrival profiles and bounded resource recovery for endurance; preserve recognizable spell behavior. Don't make player automatically invulnerable or silently ignore attacks.

If 5–6 simultaneous combatants cause unavoidable chains, adjust **team coordination, cast staggering, geometry, opponent damage/HP or spawn layout** rather than reducing the central product fantasy to 1v2. Test and tune these factors transparently.

## 6. Evaluation

Multi-dimensional, not single survival number:
- Defense: threat-qualified dodges, actual hits/CC, damage taken.
- Offense: real damage, takedowns, Q outbound/return, E accuracy and CC-to-damage conversion.
- Micro: auto-attack release/cancel, effective kiting, movement while safely dealing damage.
- Decisions: target swaps, resource/Flash use, punish windows and positioning.
- Progress: unseen seeds versus rehearsed seeds, per-difficulty scores.

Zero damage dealt while running forever is not a great Mechanics Arena result. High damage with extreme avoidable injury isn't mastery either. Report actual events, not unsupported mind-reading judgments.

## 7. Incremental implementation WITHOUT shrinking the requested final mode

**Internal implementation tests (may use 2 enemies only for testing):**
1. Preserve the working HTML5 Canvas, Ahri, controls, data adapter and damage system.
2. Prove two enemy actors operate independently with different movement/cooldowns and can die/respawn.
3. Prove controls and Q/W/E/R/Flash, attacks and dodge scoring work under two-threat overlap.

**Player-facing vertical slice target (not a 1v2 release):**
4. Spawn **5–6 active opponents in Standard**, with at least 3 meaningfully distinct roles and continuous replacements; Foundation 3–4, Expert aim 7–8+.
5. Make enemies targetable, damageable, mortal and independently casting. The player uses the full Ahri kit.
6. Tune pressure with varied cooldowns, concurrent but readable threats and natural brief recovery; avoid giant permanent CC chains.
7. Prove one complete 3–5 minute manually played run and evaluate *fun, readability, agency, offensive opportunity*, not just unit-test pass rates.

**Later upgrades:**
8. Add more champion-specific ability behaviors, arena visuals, genuine target AI/retreat and realistic combo interactions.
9. Add optional Tristana high-AS ADC profile **within this same mode**, preserving Ahri's full kit in its own profile.
10. Expand reproducible 10–15 minute runs, progression, seeded unseen benchmarks and performance checks.

**Engineering acceptance tests:**
- Standard spawn target 5–6 active enemies without self-collisions, spawn-on-player or frame-dependent behavior.
- Multiple enemies with independent cooldowns, health and cast state; no guaranteed simultaneous lethal chain.
- Kill/exit replacements are correct; no stale projectiles, ghost hits, double kill credit or impossible target orders.
- Q outward/return separate impact tracking; E first eligible collision; Flash resource and real mobility constraints.
- All 4–6 actor simultaneous interactions survive 30/60/120 render FPS tests and real browser run.
- Existing Dodge and CS drills continue functioning with pause, restart, controls and saved local records.
- Don't claim `5–6` tested/implemented until a browser session proves it.

## 8. Coordination

Read `PROJECT_BLUEPRINT.md`, this document, the latest `docs/PROGRESS.md` and actual branch source before coding. No Unity; use the current browser game. Keep source/test files intact and do not overwrite concurrent Codex work. Implement, test, commit and update progress.

**Non-negotiable user intent:** THIS IS A SOLO **1-versus-MANY** COMBAT SURVIVAL ARENA, whose main difficulty starts at **5–6 ACTIVE enemy champions**, with full-kit fighting under continuous chaos; **1v2 is internal scaffolding only**, not the product.
