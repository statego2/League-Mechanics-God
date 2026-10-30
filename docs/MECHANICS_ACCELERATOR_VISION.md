# League Mechanics God — The Mechanics Accelerator
## Training experience vision and game-design specification
**Date:** 2026-10-30  
**Status:** Proposed product direction, NOT an implementation-status report  
**Canonical repository:** https://github.com/statego2/League-Mechanics-God  
**Working development branch at creation:** `codex/controls-and-dodge`  
**Owner's new directive:** "A few hours of concentrated play should expose the player to very high volumes of meaningful LoL mechanics practice. Everything should be on steroids in training density, while transferring back to real League."

> **One product, four principal modes, a shared mechanics/training engine.**
> Priorities as chosen by the owner: **(1) Pure Dodge, (2) Combined Mechanics, (3) Pure CS, (4) Mid-lane Bait + CS**. All four matter; the fourth is the long-term integration challenge. A polished small set beats a proliferation of unrelated mini-games.

## 1. North star and honesty about learning

We want a free, browser-based, mouse-and-keyboard MOBA mechanics accelerator. In one session, players encounter many more meaningful skillshot reads, attack-move cycles, target-selection decisions, last-hit attempts, reaction checks and punished positioning errors than a typical match offers them.

**The design target is skill-density, not unrealistic claims.** An hour in this trainer cannot be assumed equal to N hours of ranked, nor does mastering these drills automatically create a top-ranked player. That hypothesis must be tested with held-out scenarios, delayed retests and real-LoL measures. Keep decision-making and timing faithfully LoL-like even when encounter **frequency** is amplified.

Core product loop:

```text
CHOOSE DRILL → PLAY SHORT INTENSE ROUND → EXPLAIN IMPORTANT ERRORS
→ REPEAT/ADAPT → MIX SKILLS → UNSEEN BENCHMARK → TRACK PROGRESS
```

Promised feeling: **fast, demanding, fair, replayable, satisfying, immediately available, and visibly educational.**

### The three independent training knobs

Do not collapse everything into a single arbitrary "speed" multiplier.

1. **Fidelity** = champion movement, cast/windup, projectile speeds/widths, collision, target selection, attack rules and interface conventions. Aim for credible verified values; label approximation. Do not randomly accelerate actual LoL missiles in advanced practice and then claim transfer.
2. **Intensity** = meaningful events per minute: shorter gaps between enemy casts/waves, more frequent spawns, fewer dead periods, a reasonable density of threats and opportunities. The "steroids" should primarily come from **more practice**, not distorted physics.
3. **Complexity** = number and variety of simultaneous objectives: only dodge; dodge + aim; dodge + attack; dodge + CS + trade + map-cue. Escalate complexity without making scenes unreadable or unwinnable.

Allow a reduced-speed learning/tutorial mode, but label that clearly as a learning aid and return to calibrated gameplay parameters for benchmark mode.

## 2. Mode 1 — DODGE GAUNTLET (first priority)

**Fantasy:** Enemy champions continually enter, cast a recognizable ability, and leave; different champions replace them, and unexpected but readable threats occasionally originate from the map. No long dead time. Focus is pure movement, spacing, trajectory prediction and dodge decisions.

### Encounter loop

```text
Enemy announced/enters → short movement/aim or visible cast tell
→ committed cast → projectile/AoE resolves → enemy exits
→ next champion approaches; at higher intensity, encounters overlap
```

- A **Champion Director** owns a library of enemy spell encounter cards (spell identity, cast tell, speed, range, shape, collision, entry/exit path, allowed overlapping combinations, cooldown windows). Every arrival has a readable in-world cue; cast must never spawn secretly on top of the player without an information path.
- Start with one clear linear threat. Progress to fan, split/return, ground AoE, fast projectile, large engage and combinations. Examples in the design library: Lux Q, Ezreal Q, Blitzcrank Q, Vel'Koz Q, and later Malphite R. These are examples, not a requirement to prioritize niche spells over core minions or input fidelity.
- Enemies spawn at varying distances/angles; move, commit a cast, and depart. Later, overlap 2–3 **compatible** casts rather than arbitrary simultaneous unavoidable hits.
- Include **map-edge and unseen-angle attacks** as deliberately telegraphed encounter variants. Off-screen threat = meaningful minimap/edge cue and available reaction/anticipation window, not a surprise unavoidable projectile. Owner will define the broader map-awareness system later; leave it extensible.
- Dodge Trial should be fast and punishing but not rely on freezing the player for every hit. An authentic-CC ruleset can be a separate advanced scenario. Never render an exact future trajectory line in expert dodge; keep fair champion cast animations, windup cues and the launched missile visible. Optional training overlays belong in learning mode only.
- Prevent exploits and unfairness: no spawning inside the hurtbox, no inaccessible/blocked safe gaps, no instant repeated cast with zero tells, no single unavoidable corner lock, no opponent casts beyond the committed aiming rules, no resource-free infinite Flash solutions.

### Scoring and adaptation

Measure: **eligible genuine threat events, avoided events, hits, damage received, survival time, emergency Flash use, consistency across spell families, reaction opportunities**, and performance on unseen encounter seeds.

**Never count merely offscreen/expired projectiles as dodges**. A cast aimed nowhere near the player is not a skillful avoidance; correctly preempting a cast must be represented explicitly rather than assumed.

- Warm-up difficulty: one spell at a time, clear body cue, lenient frequency.
- Standard: varied direction, movement, limited overlap, calibrated projectile timings.
- Expert: shorter gaps, credible simultaneous combinations, some map-edge threats, no exact aim guide.
- Infinite/endurance optional; benchmark version uses controlled duration and seeds.

**MVP acceptance**: At least 3 genuinely distinct cast/pattern cards, spawn→cast→exit lifecycle, replayable seeded encounters, varied angles, a real dodge metric, an unavoidable-pattern safety check, pause/restart and 30/60/120 FPS stable simulation, plus browser-observed gameplay.

## 3. Mode 2 — MECHANICS ARENA / COMBAT CRUCIBLE

**Fantasy:** Fight under relentless pressure, like concentrated teamfight micro. Dodge threats while doing something useful: landing abilities, kiting, selecting targets, repositioning, saving Flash and exploiting enemy mistakes. It is not enough merely to survive.

### Trainable mechanic modules to mix

| Module | Concrete recurring decision | Example feedback |
|---|---|---|
| Dodge + skillshot | Move safely, then predict a **moving target** with Ahri Q/E | Hit/miss, range, cast while threatened, missed opportunities |
| Max-range precision | Land Q or E near its **actual effective range** without wasting the cast or overstepping | Hit rate by distance bucket, time exposed at enemy threat range |
| Two-pass Ahri Q | Cast so outbound and returning orb both connect; reposition during return | 1st/2nd pass hits, expected vs actual return path |
| Kiting / orbwalking | Use attack release then move, repeat as threat and target position change | Attack uptime, windup cancels, spacing violations, avoidable damage |
| Target switching | Prioritize a threatening/high-value target; reacquire during movement | Wrong targets, lost DPS, successful switches |
| Flash reaction | A Malphite R-style engage appears; decide **when a Flash could actually evade it** | Legitimate saved hits, failed/late Flashes, wasted Flashes |
| Defensive mobility | Evade incoming threat without wasting W/R/Flash or abandoning attack opportunity | Resources spent per avoided hit, positioning afterward |
| Combo under pressure | Charm → Q with moving enemy and other incoming threats | Combo accuracy, correct attack/cast spacing, damage taken |
| Positioning | Maintain proper distance against moving melee/ranged opponents | Time in valid spacing band, danger windows survived |
| Multi-threat prioritization | One spell to dodge, one low-HP enemy, one favorable range window | Decisions resolved, missed guaranteed hits, avoidable damage |

**Accuracy design:** A "max-range Q+E" score means two separate ranges and distinct cast/hit windows. Do not conflate the spells, invent impossible simultaneous inputs, or reward impossible prediction. Use source-checked current spell parameters.

**Champion specialization:** Ahri is a main mid-oriented training baseline. The owner also wants a **fast-attacking ADC, especially Tristana, for the dedicated kite track**. Add that as a selectable training profile rather than forcing Ahri into every kiting task. Preserve the user's chosen champion priority.

### Pressure scenes (examples)
- "Find your angle": 3 roaming targets, one incoming line projectile, E at max feasible range.
- "Orb return": escape a shot while repositioning so returning Q also hits.
- "Flash check": a readable Malphite R-type engage arrives between ordinary skillshots; only successful legitimate react/anticipate + Flash counts. Include non-Flash solutions when viable.
- "ADC survival": Tristana kiting a pursuer with higher AS; attack-windup cancels have a real opportunity cost.
- "Teamfight collapse": two enemies apply overlapping spells while one exposed target presents a brief kill window; survival-only scores poorly.

**MVP acceptance**: One polished Ahri dodge + Q/E scene, one kiting scene with reliable attack timing, one Flash-reaction scene; repeatable scenario seeds, accurate damage and per-skill metrics. More champion packs are extensions.

## 4. Mode 3 — CS MASTERY (clean precision)

**Fantasy:** A credible living lane of allied and enemy minions. Train raw last-hit precision with autos, then minion wave interactions, then **under-turret farming**. Multiple short attempts give more repetitions than waiting for entire match waves.

### Sub-scenarios under ONE menu mode

1. **Free lane CS:** normal waves, realistic opposing minion interactions, no hostile champion pressure. Understand health trajectories, attack windup/flight, unit selection, nearby allies, missed kills. No fake scripted HP countdown once credible wave combat exists.
2. **Contested CS timing:** HP windows become harder due to allied hits or multiple simultaneous low-health minions. Practice target choice/attack preparation rather than spam clicking.
3. **Under turret:** minions receive turret impacts with type/HP/armor interactions; player prepares targets if necessary, picks attack windows, sequences autos and spells only in an opt-in variant. Treat "X tower shots then 1 auto" as an **emergent result**, not hard-coded folklore: AD, minion class, wave upgrades, turret and timing change the answer.
4. **Pressure CS benchmark:** brief opponent zoning/skillshot threats can be added after pure CS works, but do not blur pure CS with mode 4.

**Measure:** eligible CS, actual credited CS, missed to allied/turret, unresolved, gold, aim/selection failures, preventable windup cancellations, damage prediction error, under-turret success by minion class, and fixed-conditions repeatability.

**Prerequisites in existing development**: Two-sided minions already exist in an approximate form; unified impact/death/last-hit attribution and accurate wave combat are being built. **Refine instead of rewriting**. Turret is a later dependency; don't fabricate exact current timings.

**MVP acceptance**: both teams simulate independently, melee/caster impacts, credible waves, clear kill credit, last-hit feedback and actual full playable runs. Under-turret benchmark follows when turret acquisition/flight/impact mechanics are validated.

## 5. Mode 4 — MID LANE MASTERY (signature)

**Fantasy:** Compressed, competitive laning. Get CS while an intelligent opposing mid punishes your movement, baits and casts skillshots, watches cooldown windows, stands behind minions, and changes positioning. The player must sometimes **bait → dodge → CS**, sometimes dodge → punish, sometimes surrender a minion rather than take damage.

A valuable drill must force **trade-offs** rather than ask the player to tick three boxes in a known order.

### Combined skill loops

- Enemy threatens you during a last-hit windup: **commit to CS and risk a hit, cancel the auto and dodge, or position earlier so you can do both**.
- Bait an E/Q out of the opponent, dodge while staying close enough to secure a minion, then use the enemy cooldown window to trade.
- Enemy hides behind minions; your Ahri E has interception risk. Need an angle, minion kill window or correct decision *not* to cast.
- Wave is about to thin: choose between ward/map attention (placeholder until owner's further specification), trade pressure and CS.
- Force enemy abilities through threat-range positioning. Reward an induced opponent commitment only if it changes the subsequent decision.
- Under turret with opponent harass: last-hit, don't eat unnecessary damage, preserve your Flash.
- Later: wave states (slow push/freeze/bounce/crash) should arise from actual minion combat and arrival timing, not a fake state label.

### Design principle
Difficulty must come from opponents and trade-offs with **reasonable intelligence**, not impossibly fast hostile spell spam over a fake lane. Keep real-feeling rules. Run scenario variants with pre-positioned waves to compress downtime without inventing instant health changes.

**Measure**: CS earned vs available, damage taken per CS, skillshots genuinely dodged, avoidable exposure, baited cooldowns converted into trade/CS advantage, valid Q/E opportunities taken vs wasted, position quality, trade damage, and consistency across unseen seeds.

**MVP acceptance**: a credible two-sided wave + moving enemy champion with reproducible spell/cooldown behavior + last-hit scoring + true damage attribution + one consequential bait/dodge/trade decision. A full lane bot and wave-state/turret system are future phases.

## 6. The shared training engine (avoid four isolated games)

Architect as reusable, incrementally extracted modules from the current working Canvas prototype:

- **Simulation core:** 120 Hz fixed-step update (existing), world units/scale, movement, collisions, target selection, order queue, attacks, casts, impact/death events.
- **Ability catalog:** cast tells, windups, speeds/widths/range, hit policies, interception, CC and special phases. Data-driven where measured; explicit approximation labels otherwise.
- **Encounter Director:** spawn/cast/exit patterns, threat budgets, cadence, combinations, valid geometry, seeded replay and unseen-seed benchmark.
- **Minion/turret lane system:** wave scheduling and two-sided AI, target priority, animation/windup/travel, mitigation, source attribution, CS and eventual turrets.
- **Scoring/feedback:** track per-event causal truth: targeted threat vs incidental miss, damage vs block, auto release vs cancel, last-hit vs allied kill, valid/invalid Flash timing.
- **Adaptive challenge:** change encounter frequency/variation/complexity based on measured performance, not hidden changes to LoL-like physics.
- **Practice orchestration:** four modes using reusable scenario recipes; optional generated sessions and benchmark scheduling.
- **Visual/HUD layer:** telegraphs, readable hitboxes and attack-range indicators; training overlays fade with difficulty; desktop cursor-focused UI.

**Engineering guardrail:** Preserve working gameplay. Build modules behind current gameplay APIs when possible; no full rewrite or migration without an objectively justified gain.

## 7. Training progression: make the player better, not only better at this simulator

Three complementary experiences:
1. **Isolated focused repetitions:** improve one skill with clear feedback.
2. **Combined pressure:** use it while handling competing tasks and moving enemies.
3. **Unseen evaluation:** new patterns/seeds, no exact aim hints, delayed reassessment, then compare with real LoL performance if the user can supply client data.

Example **80-minute training session**, user adjustable: 15m Dodge, 20m Mechanics, 20m CS, 20m Mid Lane, 5m unseen benchmark. This is a product design example, not a scientifically validated optimal dose. Offer breaks, save/restart, and session time controls rather than pressuring multi-hour uninterrupted play.

Do not assume random interleaving is universally better than blocked repetition: evidence from motor-learning and sports is mixed. The product should support both focused and mixed practice and evaluate results.

### Feedback should answer
- What did I do wrong?
- Why was this avoidable?
- What precise mechanic would have changed the outcome?
- Can I immediately retry the same situation?
- Can I also pass a *different* situation?

Use **specific actionable diagnoses**, not empty "great dodge" praise, global scores without definitions, or fake reaction-time readings from mechanics that don't expose intent.

## 8. Skill benchmarks and measurement contract

| Skill | Legitimate metric | Warning |
|---|---|---|
| Dodge | Threat-qualified avoidance %, damage per 100 valid threats | Expired nonthreatening shots are not dodges |
| Reaction/Flash | Successful Flash opportunities within viable timing window | Need defined cast tell, reaction opportunity and Flash availability |
| Ahri skillshot | Q/E accuracy with range and enemy-motion stratification | Easy close-range shots cannot dominate a "max-range" score |
| Kiting | Auto release uptime during valid target range, spacing/damage cost | High attacks alone aren't good if player eats avoidable hits |
| CS | Credited CS / eligible minions, missed vs unresolved, gold | No "missed" event on a minion that did not die |
| Combined lane | CS and trade/damage/dodge trade-off profile, not just survival | No fixed universal weighted score without validation |
| Adaptation | Repeat-seed vs novel-seed benchmark performance | Improvement on memorized patterns is not proof of transfer |

Optional skill profile/dashboard should show **multiple dimensions**, not declare the user "Challenger" without external calibration.

## 9. Current implementation implications / sequencing

The active development branch already has versions of Dodge Trial, Kite Arena, Last-Hit Lab, Ahri spells, a fixed-step loop, threat-scoring tests, approximate two-sided minions and a research-guided Ahri adapter. It also has preserved legacy modes. **Inspect the most recent actual state and progress before touching anything**; test counts mentioned in past docs are not a promise of a passing future head.

Suggested implementation cadence, honoring the user's mode order while respecting prerequisites:

**Stage A — Punchy pure Dodge vertical slice FIRST:** adapt existing Dodge Trial with a reusable spawn→telegraph/cast→exit champion encounter director, 3 varied enemy spell cards, increased but fair cadence, randomized angles and map-edge cues, accurate dodge/Flash/block scoring. Retain existing accurate projectile/fixed-step systems; no visual exact-aim line in expert play. Test and browser-play it.

**Stage B — Combined mechanics:** create one great continuous Ahri Q/E-under-pressure encounter by combining the same director with moving valid targets; add a specific Flash-reaction trial. Make Tristana fast-AS kiting a specialty track without abandoning existing Ahri.

**Stage C — CS excellence:** finalize the unified impact/death/CS pipeline and realistic two-sided minion interactions; produce a free-farm CS benchmark, then model and test under-turret farming as a dedicated sub-scenario.

**Stage D — Mid lane combined:** moving enemy AI, threat-angle logic, CS windows, punish windows and bait→dodge→CS or trade at practical fidelity; eventually minion aggro, tower, map-awareness and wave states.

Parallel or shared foundation work (data adapters, minions, damage) is welcome, but don't hold **all** gameplay improvement hostage to fully simulating a 30-minute LoL match.

## 10. What to implement next and what NOT to do

### First executable assignment for Codex (after current in-flight work is reconciled)

1. Read `PROJECT_BLUEPRINT.md`, this document and `docs/PROGRESS.md`; inspect current branch and recent commits.
2. Design a small, declarative **Champion Encounter Director** for Dodge: `enter → move/aim → committedCast → exit`, with enemy spell cards, seeded spawn angles and fairness constraints.
3. Implement **3 distinct encounters**, at least one originating near a map boundary with a clear direction/arrival cue.
4. Add intensity ramp by *frequency/overlap*, not unannounced projectile physics changes.
5. Validate hit/threat/dodge/block/Flash event accounting; record clear UI feedback and ensure full game remains playable.
6. Add focused regression tests and actual browser playthrough/smoke test. Preserve and rerun existing tests.
7. Update `docs/PROGRESS.md`, commit and continue to highest-value next task.

### Later design questions to revisit with the owner
- Map-awareness mechanic definition: intentionally left open for a future detailed owner brief.
- How many heroes/abilities are core launch content versus later packs?
- Should benchmark scores reward pure mastery or mixed trade-off skill, and how to validate?
- What visual style brings more LoL-like readability without hurting collision clarity?
- How to evaluate real-game improvement over repeated training sessions?

**Do not:** turn this into 20 menu modes, add unrelated features, hide projectiles behind informationless surprises, reward impossible Flash reactions, randomly manipulate movement speed/projectile physics under an "expert" badge, or claim top-player rank from an internal score.

## 11. Success definition / product bar

Within a single play session, the player should experience **many meaningful, fairly readable, repeatable dodge/aim/attack/CS decisions** and understand what they could improve. The game should challenge advanced LoL players while also offering accessible calibrated practice for learners.

A good early benchmark is *not* a certain number of flashy effects: it is a convincing and fun 10-minute Dodge Gauntlet loop, plus trustworthy per-skill metrics and no regression in the existing game.

**OUR PRODUCT PROMISE:** Condensed deliberate practice, with League-like feel and measurable mechanical progression—not a guarantee of instant rank gains.
