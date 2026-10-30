# Mechanics Arena — Continuous Teamfight Chaos

**Project:** League Mechanics God / Mechanics Accelerator  
**Date:** 2026-10-30  
**Status:** Revised owner-led **vision and implementation specification**, not an implemented feature.  
**Development branch:** `codex/controls-and-dodge`

> **THE CORE EXPERIENCE:** A continuous, fast-changing, chaotic MOBA fight where the player must use **all useful combat mechanics together**: movement, dodges, autos, Q/W/E/R, Flash, target switching, spacing, combos, mobility and positioning. **Not** a sequence of disconnected scripted "now hit E / now dodge Q" lessons. The arena creates situations; the player chooses how to solve them.

The owner corrected the previous direction: they want **opponents, chaos and teamfights, many combos and full-kit practice together**. The former one-moving-target / one-spell-at-a-time exercise design was too laboratory-like. Isolated drills are optional side tools, **not** the default game loop.

---

## 1. Player fantasy: a real battle that never settles

Imagine:
- You are **Ahri** in a large, readable MOBA arena.
- Multiple enemies are already alive and moving. A frontliner advances, a ranged carry kites, a mage looks for angles, and a diver waits for a committed attack/cast. Friendly AI units can participate to create credible allied/enemy geometry and target choices.
- You land E on a moving carry, Q through two enemies, step to line up the returning orb, dodge Ezreal Q during reposition, auto once, change target to the approaching diver and use R to reposition before being caught.
- A Blitzcrank comes into hook range, an enemy mage attempts to zone the escape angle, your allies reposition, and the enemy frontline becomes low health. You decide whether to finish the kill, disengage, or turn.
- Rarely, **Malphite R** creates a high-stakes engage/Flash moment. It must arrive from a believable champion with readable setup, not a scripted explosion on top of the player.
- The fight keeps moving. Targets die and are replaced, enemy formations rotate and pressure rises. **No forced pause after every successful E, kill, combo or dodge**. A short reset only when the player dies, voluntarily restarts, or enters the next session segment.

**It should feel like multiple challenging teamfight moments compressed into 5–15 minutes**, with a much higher rate of meaningful actions than waiting through real match downtime.

## 2. Core product rule — EMERGENT COMBAT, NOT CHECKLIST COMBAT

Wrong approach:
- "Now press E at max range."
- "Now dodge this shot."
- "Now switch targets."
- The enemies stand still while the activity changes.
- The game gives you one correct combo and forces you to execute it.

Right approach:
- The enemies fight continuously with believable positions, ranges, cooldowns and decisions.
- Situations **naturally create** long-range E opportunities, returning Q angles, Flash checks, attack-move windows and target-switch incentives.
- A player who finds a different valid way to win should succeed.
- A coaching system can *observe* what happened and identify missed opportunities **after the moment**, without overriding the player's decisions.

We still need explicit mechanics tests for each skill (engineering validation), but the core PLAY experience should feel emergent.

## 3. Top-level structure: one Mechanics Arena, evolving battle

The main game is a continuously running arena, not separate minigames for Q, E, Dodge, Kite or Flash.

### Encounter population — proposed staged implementation targets
These are suggested engineering scale points, **not** mandatory permanent limits:
- **Foundation:** an active combat situation with roughly 2 hostile champions and possibly 1 friendly AI. Already enough to combine offense and defense.
- **Standard:** roughly 3–4 opponents plus 1–3 active friendly AI; teamfight-style interaction and staggered replacement.
- **Expert:** target genuine **4v4 or 5v5-like situations** (player counts as one allied champion); enemy frontline, backline, diver, and AoE caster can pressure simultaneously. Performance budget and quality of AI matter more than arbitrary exact headcount.

**Do not interpret 1–3 opponents as the final cap.** The eventual 5v5-like teamfight is a product target. Build toward it incrementally while keeping the current game playable.

### No downtime model
- Enemy actors have individual HP, cooldown, targeting, cast, movement and death.
- A dead actor can be replaced after a short, variable delay; a replacement **enters from an arena edge**, not from nowhere in melee range.
- Allied AI (when enabled) provides real targets, CC opportunities, pressure and cover; avoid immortal, decorative bots.
- No health-reset teleport after every combo. Replacements and occasional healing/recovery are training systems whose effects must be visible and bounded.
- If player dies, show a fast summary + same-seed retry. Survival and damage both matter.
- The arena should be traversable, with meaningful terrain, open space and some occlusion/obstacles—not a tiny court filled with overlapping particles.

## 4. The mechanics player practices ALL AT ONCE

| Skill | What emerges during the fight | Feedback after combat |
| --- | --- | --- |
| **Dodge while attacking** | Enemy casts while player is winding up an auto or aiming E | Threat-qualified avoidance; avoidable damage vs useful outgoing attacks |
| **Ahri E precision** | Moving carries/divers cross multiple distances and angles | E hit %, distance bucket, target motion at cast, interception and value |
| **Ahri Q two-pass** | Player can reposition as orb returns while enemies move | Outbound, return and double-pass hits, damage conversion |
| **Combo decisions** | E→Q, Q+R reposition, W chase, autos between spells, R retreat/engage | Safe damage windows converted, unnecessary resources, CC follow-up |
| **Kiting / attack-move** | Enemy pursuer challenges spacing while other opponents threaten | Attack release uptime, correct windup cancels, spacing and damage |
| **Target switching** | Priority target becomes vulnerable; a diver suddenly reaches you | Switching efficiency and credible outcome, not one scripted "correct" choice |
| **Flash reaction** | Malphite-style engage or other lethal CC appears in a realistic fight | Successful protection/escape, wasted Flash, predicted vs visually reactable |
| **Positioning and flanks** | Enemy backline and frontline reposition, bad angles open | Enemy danger-zone exposure; ability to hit without overcommitting |
| **Multi-threat awareness** | One enemy ults, one hooks, one kites, one AoEs | Hit avoidance and offensive contribution under divided attention |
| **Mobility resource management** | Ahri R charges / Flash must be preserved or spent at judgment time | Valid utility, wasted charges, survival and damage trade-offs |

### Champion tracks
- **Ahri** is the primary complete-kit profile, especially Q/E aiming + returning Q + Charm + R multi-dash.
- **Tristana** is a later dedicated high-attack-speed ADC profile for actual orbwalking and kiting. Her Q is an AS buff, **not** a skillshot. Preserve her genuine attack cadence, range and E/W/R mechanics as they become verified.
- Don't force every champion to use Ahri's "Q+E combo" rubric. Each profile uses its own skill kit and goals.

## 5. How enemies fight (real team roles, not random bullets)

Create lightweight readable enemies with **role-based utility AI**, not instant perfect aim. Examples:

| Role | Core behavior | Combat pressure |
| --- | --- | --- |
| Frontline/tank | Move forward, pressure space, protect backline, commit/retreat | Forces spacing and target positioning |
| Diver/assassin | Wait for vulnerability, commit on backline, use mobility/cooldown | Forces instant defensive reaction and target switch |
| Ranged carry | Kite, attack nearest viable target, reposition to safety | Forces long-range E prediction and kill-window recognition |
| Mage/control | Zone paths, use line/AoE casts from credible distance | Forces micro-dodge while aiming |
| Hook engager | Threaten from edge/range, cast if line-of-fire is plausible | Forces movement discipline and minion/ally cover decisions |
| Support/disruptor | Peel and briefly CC or protect targets | Forces combo change and opportunity management |

**Enemy behavior should have multiple plausible tactics**, with constrained reaction times:
- Distinct micro-movement patterns (short strafe, juke, retreat, chase) and cooldown-aware choices.
- Abilities have windup/committed release; opponent cannot read future mouse input and dodge instantly.
- Low HP, local team advantage and target risk cause retreats or re-engages, not a permanent suicide march.
- Enemy priority and attack target vary by circumstance; not all five target the player all the time.
- Cast decisions respect line-of-fire/collision, range and cooldowns. Never generate impossible animation cancels.
- Friendly AI is basic but participates, creating credible teamfight lines and target choice—not simply visual decoration.

### Teamfight logic: actions produce consequences
- A landed Charm holds a meaningful target briefly and may open Q/auto or ally damage.
- Using R to reposition changes actual range, incoming trajectories and Q return anchor.
- Flash can change whether a major engage hits, but it isn't invulnerability and should not always be necessary.
- A low-HP target may be finished or saved; surviving longer is not the only goal.
- Terrain changes movement and skillshot paths when that interaction is part of the spell rule; visual walls and actual collision must align.

## 6. Rhythm: continuous chaotic flow, with natural peaks

No rigid "10 seconds of Q practice, then target switching" timetable. **The world keeps fighting throughout.** A director controls **combat population, resource budget and threat density**, not the sequence of user button presses.

### Initial intensity tuning proposals

| Difficulty | Opponents active | Important incoming casts per minute | Fight feel |
| --- | --- | --- | --- |
| Foundation | ~2 | 6–9 | Full-kit practice while learning simultaneous defense/offense |
| Standard | ~3–4 | 10–16 | Busy skirmishes, changing target priority |
| Expert | target ~4–5 | 16–23, only when safe and playable | Teamfight chaos with real multi-spell decisions |

**These are provisional training design targets, not LoL game statistics.** When an opponent's ability is on cooldown it cannot be cast; a high cast rate results from multiple independent champions, rotation and replacement—not arbitrarily cheating the same champion's cooldown.

### Rhythm inside a 10-minute run
- **0:00–1:30 — Fight establishes itself:** 2–3 opponents (tier-scaled) with meaningful offensive targets; no huge surprise ultimate in the first seconds.
- **1:30–3:00 — More active team pressure:** replacing defeated opponents, overlapping credible attacks; you must Q/E and kite while dodging.
- **3:00–5:00 — First major battle:** more team actors, cooldown interactions and a possible rare major engage; not every run includes Malphite R here.
- **5:00–5:30 — Relative breathing room:** existing fight continues; one or two opponents may be retreating/recovering, not a forced "pause and choose the next drill".
- **5:30–8:30 — High-intensity freeform TF:** 3–5 active foes depending on tier, varied roles, player initiative matters. Some rare event may appear if fair.
- **8:30–10:00 — Unseen benchmark:** difficulty parameters lock, unseen seed for encounter choices and enemy behavior; compare performance fairly.

The absolute time boundaries are **director pacing guidelines**, not forced transitions. Enemy deaths, position and cooldown states dictate the actual action.

### Spell mix inside TF (different from Pure Dodge)
- **Ezreal Q** remains a fairly common background threat but should not dominate the battle as much as Pure Dodge; the player's main task is to fight, not just sidestep shots.
- Lux Q, Blitz Q, Ahri Q return, Vel'Koz split and ambient Xerath Q/W can occur depending on actor presence/source and spell implementation.
- **Orianna R** is rare and anchored to the actual ball.
- **Malphite R** is a **rare, high-stakes engage**, with readable opponent setup and credible Flash/movement answer; not a guaranteed event every minute.
- A great TF scene may involve Orianna ball + diver + Ezreal Q + enemy carry, but not all five spells necessarily casting at once.
- The director should vary **team composition and positions**, not turn every hero into a spell turret.

## 7. What "chaos" should mean here

**GOOD CHAOS**
- 3–5 moving enemies with independent intentions and cooldowns.
- Two threats arriving from different angles as the player tries to land E.
- Three targets at different HP with genuine kill and survival trade-offs.
- One teammate landing CC that creates a brief burst window.
- A hostile frontline suddenly committing; the player must change target or use R.
- A rare big engage that forces decision under incomplete certainty.

**BAD CHAOS**
- Every enemy perfectly focuses the player from frame zero.
- Offscreen, untelegraphed guaranteed hits.
- A Malphite R every 10 seconds merely because the mode is difficult.
- All opponents casting synchronized abilities for spectacular but non-interactive effects.
- Player can't press Q/E/auto because every frame requires emergency dodging.
- RNG determines survival regardless of micro decisions.

High difficulty should increase **decision density and teamfight complexity**, not make the simulation incoherent.

## 8. Scoring: "fight effectiveness under pressure"

Do not score by spell count or survival time alone. Show **multiple independent skill dimensions**:

1. **SURVIVAL & DEFENSE:** qualified threats, avoided/hit, damage taken per threatening cast, unnecessary CC/engage hits.
2. **OFFENSE:** real damage, kills/assists, damage in valid offensive windows, Q and E accuracy, outbound/return Q, conversion of CC into damage.
3. **MICRO & UPTIME:** attacks released versus cancelled, useful attack-move cadence, time safely in range, movement during recovery.
4. **DECISIONS:** valid target changes, E/Q opportunities taken, resource conservation/spending with consequences, positioning after attacks.
5. **CONSISTENCY:** repeat-seed vs unrehearsed encounters, benchmarks and session improvement.

Example: **90% dodges + zero outgoing damage is a poor Mechanics Arena result.** Similarly huge damage with constant avoidable hits isn't mastery.

Be cautious with "mistakes" that are not objectively identifiable from the fight. A missed E on an intentionally juking opponent is not always a bad decision. No unsupported "you should have flashed" coaching when no clearly viable alternative was known.

## 9. Practice preferences inside ONE mode

The default should be **FREEFORM TEAMFIGHT** with full kit and continuous combat.

Optional, not new top-level modes:
- **Combo Focus:** same fight, more enemy conditions that make Ahri E/Q returns and spell chaining relevant.
- **Kite Focus / Tristana:** same fight, higher-AS enemy chase/spacing situations and meaningful autos.
- **Flash Focus:** more frequent legitimate engage threats while still fighting (separate from the default rare-Malphite policy).
- **Balanced:** ordinary combined mechanical skills, the recommended default.

There is **no forced order** of "now Q, now dodge, now kite". Focus changes encounter composition only, not whether player is allowed to use the full kit.

## 10. Implementation architecture on current code

Reuse the existing production code rather than making a second disconnected engine.

Current branch has vanilla JS / Canvas, 120 Hz fixed step, Ahri Q/W/E/R, Flash, auto attacks, target orders, enemy entities, projectiles, impact/CS work and tests. They are a **starting point**, not already a true multi-agent teamfight.

Suggested modules, incrementally:
- `TeamfightDirector`: ongoing enemy role mixture, lifecycle, respawns, pacing, pressure/complexity budgets and seeded plans.
- `ChampionBehavior`: shared state transitions and role-specific target selection, movement and ability decision. Bounded AI reaction latency.
- `CombatEvents`: source/target IDs, casts, hits, CC, damage, healing, death, assisted takedowns and valid opportunity events; reuse impact pipeline.
- `AbilityCatalog`: per-spell definitions, hit policies and phases; use research data where verified, mark other settings approximations.
- `CombatTelemetry`: post-session score dimensions with robust denominators, reproducible benchmark seeds.
- `Renderer`: visual readability, team identification, projectile/CC effects and range cues, with low-latency inputs.

Keep the core fixed-step architecture and preserve mouse input, Ahri data adapter and minion simulation for other modes. A development-mode toggle can hide unfinished teamfight logic until it is playable.

### Roadmap — ship the combat feeling in small increments

**Milestone 1: Real fight, not a target dummy**
- Evolve Kite Arena into a continuous Ahri full-kit battle, no forced phase resets.
- Two independent hostile actors active simultaneously (one mobile ranged carry and one closer pursuer/diver).
- Each has health, movement, real targeting, attacks and at least one readable spell.
- Enemies die, replace from arena edges and continue fighting.
- Browser-play to confirm Ahri can E, Q outbound/return, R reposition, dodge, attack and switch targets **during one continuous engagement**.
- Tests for actor life cycle, target changes, deterministic outcomes and no regressions.

**Milestone 2: True skirmish chaos**
- 3–4 active enemy actors, 1–2 allied AI entities with credible HP, movement, attacks.
- Role-based AI with readable intentions (carry, tank/diver, caster).
- Multiple overlapping but fair cooldown-dependent spells.
- Simple team damage/kill attribution and score dimensions.
- One 5-minute completed human browser run, plus seed reruns and FPS stability checks.

**Milestone 3: Teamfight scaling**
- Move to ~4–5 hostile and ~3–4 friendly combatants at Expert.
- Add engage/peel decisions, health-dependent retreat, flanks and real high-impact ability events; avoid "all bots focus the player".
- Rare Malphite R, ball-centered Orianna R; preserve realistic timing/response rules.
- Keep complexity manageable at 30/60/120 render FPS.
- Validate at least one 10-minute run, different seeds and champions.

**Milestone 4: Champion specialization and progression**
- Add verified Tristana fast-AS kite profile inside same arena, not a fake speed modifier to Ahri.
- Calibrate champion movement/cooldown/attack rules against latest available source data.
- Add optional focus toggles without replacing default freeform TF.
- Tune adaptive encounter intensity and unseen benchmark, preserving spell fidelity.

**Key engineering constraint:** Do not block the first compelling fight on implementing exact full 5v5 League AI or fully authentic Summoner's Rift navmesh. Start with a fun, testable two-opponent fight and add complexity while preserving working gameplay.

## 11. Acceptance tests — what must become true

- Default gameplay is a **persistent combat scene** with enemies acting independently: no mandatory Q/E-specific phase and no HUD instruction required to drive action.
- Player may use Ahri **Q/W/E/R, autos, movement, Flash** in a normal encounter without artificial skill locks.
- Two and then multiple enemy actors can exist simultaneously, each with independent state, cooldowns, target and position.
- On kills, outgoing projectiles, damage and score attribution remain valid; replacements enter visibly and don't spawn on player.
- Enemy casts respect committed positions/animations, target-range and cooldowns.
- Enemy target priorities don't always perfectly focus player; allied AI can be attacked and can influence the battle.
- A skilled player can finish a ten-minute scenario through different valid playstyles; offensive contribution is necessary.
- Rare Malphite R is **not** spammed; no impossible Flash-reaction demands.
- Ezreal Q and map-origin threats add pressure but do not crowd out actual attacking and positioning.
- Q outbound and returning passes are distinguished; valid E interception is preserved.
- 30/60/120 FPS simulation, pause/restart, seed reuse, fallback images/audio, CS and Dodge modes pass tests.
- Actual human playthrough confirms the result **feels like a chaotic teamfight**, not multiple scripted skillshot practice stations.

## 12. Status and handoff rules

This document changes **the gameplay direction**, not verified development state. Do not claim that continuous 5v5 exists or that the above pacing values are validated. Start by reading `PROJECT_BLUEPRINT.md`, `docs/PROGRESS.md` and current branch source; coordinate with existing Codex changes. Implement, run browser tests, commit, and update progress.

**ONE SENTENCE NORTH STAR:** "Let me fight in chaotic, constantly evolving teamfights so I naturally practice ALL LoL combat mechanics together, at exceptionally high repetition density."
