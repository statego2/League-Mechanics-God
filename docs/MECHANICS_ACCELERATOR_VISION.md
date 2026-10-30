# League Mechanics God — The Mechanics Accelerator
## Training experience vision and game-design specification
**Date:** 2026-10-30  
**Status:** Proposed product direction, NOT an implementation-status report  
**Canonical repository:** https://github.com/statego2/League-Mechanics-God  
**Working development branch at creation:** `codex/controls-and-dodge`  
**Owner's new directive:** "A few hours of concentrated play should expose the player to very high volumes of meaningful LoL mechanics practice. Everything should be on steroids in training density, while transferring back to real League."

> **One product, four principal modes, a shared mechanics/training engine.**
> Priorities as chosen by the owner: **(1) Pure Dodge, (2) Combined Mechanics, (3) Pure CS, (4) Mid-lane Bait + CS**. All four matter; the fourth is the long-term integration challenge. A polished small set beats a proliferation of unrelated mini-games.

## Owner decision — Mode 2 is Combat Survival Arena (2026-10-30)

**This overrides any earlier 5v5-teamfight / friendly-AI / single-target-drill interpretation of Mode #2.** The owner chose **B: solo Combat Survival Arena vs MANY enemy champions**. The default player-facing Standard combat aims for **5–6 concurrent enemies**, Foundation **3–4**, Expert **7–8+** when feasible and fair. **Two enemies are only an internal integration-test fixture**, not the actual target experience. The player uses Q/W/E/R, Flash, attacks, kiting, dodging, target switches and combos together in a continuously evolving fight, without forced mini-drill prompts and without friendly champion allies. See the authoritative [Mechanics Arena Design](MECHANICS_ARENA_DESIGN.md). Figures are design targets, not tested implementation status.

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

## 2. Four modes — only four, no fragmented minigame catalog

These are the **only four intended player-facing gameplay modes**. Every subskill is practiced inside one of these continuous experiences. The current browser alpha still exposes only 3 simpler functioning predecessors, and the complete modes below are **design targets**. Canonical choices override older scattered brainstorming suggestions.

### Mode 1 — Dodge Gauntlet

**One relentlessly challenging pure evasion flow.** Opposing champions appear, cast and leave; weighted common threats arrive frequently (especially **Ezreal Q**) and some ambient **Xerath Q/W** threats arrive from the map without a visible Xerath. Return orb (Ahri Q), split (Vel'Koz Q), hooks and binding create varied movement problems; **Malphite R and Orianna R remain rare**. Continuous pressure is fair and readable, not arbitrary impossible projectile spam. Full event cadence, mixture and safety contracts: [Dodge Gauntlet Rhythm](DODGE_GAUNTLET_RHYTHM.md).

### Mode 2 — Mechanics Arena / Combat Survival

**One full-kit solo-versus-many chaotic battle.** The player fights **multiple independently active enemy champions**, with full Ahri Q/W/E/R, auto attacks, kite, target switching, positioning, combos, Flash and evasion *simultaneously*. No allied champion bots and **no imposed Q/E/dodge tutorial stages**. The owner explicitly targets **5–6 simultaneous enemies in the Standard player-facing experience** (Foundation 3–4, Expert 7–8+ are engineering/tuning targets), with continuous replacement after enemy deaths. The old "one strafing target with one Ezreal Q" is only an internal integration fixture, not the delivered gameplay. An eventual Tristana high-AS profile stays **inside this mode**, not a new main mode. Full design: [Combat Survival Arena](MECHANICS_ARENA_DESIGN.md).

### Mode 3 — CS Mastery

**One continuous clean last-hitting lane**, with real allied and opposing minions, actual health/damage/targeting/windups, sustained waves and naturally evolving conditions. As minions push toward a correctly simulated turret, **under-turret CS occurs in the same mode and the same lane**—not in a separate under-turret drill. The challenge is precise CS timing, target choice, pre-positioning and movement, with dependable death/CS/gold feedback. Do not add opposing champion poke here: that belongs to Mid Lane Mastery. Existing Last-Hit Lab is an incomplete but useful foundation; don't rewrite it.

### Mode 4 — Mid Lane Mastery / The Ultimate Drill

**One very hard, continuous 1v1 mid lane challenge** around authentic minion waves. Enemy bot attempts its own CS and threatens yours: as you approach or commit to a last hit it tries to land real poke if spell readiness, geometry and trade conditions allow; you bait, evade, farm or concede when needed. In the **same lane, at the same time**, you identify the enemy's own last-hit commitment and punish it with Ahri Q/E/autos, zoning, trading and cooldown advantage. No mandatory lesson stages, **no separate Free Farm / Bait / Poke / Under Tower variants**, and no need for a Foundation/Standard/Expert/God selection for this mode. The enemy is extremely demanding but obeys physics, observed information, cooldowns and cast commitment. Full source of truth: [Mid Lane Mastery Design](MID_LANE_MASTERY_DESIGN.md).

**Hard scope rule:** No fifth game mode called "Bait → Dodge → CS", "Skillshot Lab", "Flash Challenge", "Under Tower", "Teamfight Simulator", "Poke Practice", or "Kite Training." These are game mechanics, old prototypes, test scenarios or settings—not separate menu entries.

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

## 9. Integration without multiplying player modes

The current branch already has Dodge Trial, Kite Arena, Last-Hit Lab, hidden legacy exercises, fixed-step movement/combat and progressively improved two-sided minion AI. Read `docs/PROGRESS.md` to see actual implementation; passing tests on prototypes do **not** prove the four product modes are finished.

Convert the existing three public gameplay foundations **in place** toward Dodge Gauntlet, Combat Survival Arena and CS Mastery. Add Mid Lane Mastery **as the fourth** only when credible waves plus a genuine opposing CS-and-poke bot make it playable. Keep retired prototypes available internally for tests, **not** as a permanently expanding public menu. Avoid presenting unfinished features as already available.

For work prioritization: build the next most valuable playable improvement within these four experiences, reusing actual combat and data infrastructure. Do not hold progress hostage to a full-scale 30-minute League match simulation.

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

---

## 12. Owner-approved first spell roster — Dodge Gauntlet (2026-10-30)

This section supersedes earlier illustrative spell lists for the **first implementation scope**. Keep the initial catalog focused on the choices the owner explicitly selected. Each spell must have a distinct counterplay model; do not flatten them into one generic projectile.

| Spell | Encounter behavior | Skill trained | Implementation notes |
| --- | --- | --- | --- |
| **Malphite R** | Malphite approaches/appears, then can commit a fast engage | Recognize engage, choose walk vs Flash, timing under distance pressure | Show believable opponent/cast cues; near-range attacks may be anticipation-only rather than realistically reactable. No impossible mandatory Flash check. |
| **Blitzcrank Q** | Blitz arrives, aims/casts hook, then exits | Lateral juke, bait a hook, minion-block positioning | Single-target hook collision and blocker category differ from ordinary piercing projectiles. |
| **Lux Q** | Lux arrives, commits binding from a changing angle | Read cast, step out of line, position relative to minions | Model up-to-two-target interception rather than one-hit generic bullet. |
| **Vel'Koz Q** | Vel'Koz enters, casts Q; the projectile can split | Predict split timing and perpendicular follow-up, safe route choice | Initial missile and two split missiles are separate phases with explicit rules. |
| **Orianna R** | Orianna/ball setup creates a Shockwave threat | Track the **ball** as danger center, not just champion location | Ball location and R-centered AoE must be represented; don't trigger AoE at Orianna's body by mistake. |
| **Xerath Q** | **Ambient map threat**: a readable long-range Q arrives at irregular times even when Xerath is not visible/present in the arena | Off-screen line-threat awareness, movement under other pressure | Do **not** require Xerath to spawn. Telegraph/cast cue must preserve a fair response opportunity. |
| **Xerath W** | **Ambient map threat**: delayed ground-area strike at irregular times even without a visible Xerath | Spot ground indicator, escape delayed AoE, manage overlapping threats | Do **not** require Xerath to spawn; distinct circle/area timing from Q. |
| **Ahri Q** | Enemy Ahri casts a travelling orb that **returns** | Dodge outbound path, predict moving return trajectory, reposition for the second pass | Track outbound/return separately; avoid double-counting and handle changing return destination. |

### Encounter architecture: two different threat sources

1. **Champion arrivals (main loop):** Malphite, Blitzcrank, Lux, Vel'Koz, Orianna and Ahri appear or take position, visibly prepare/cast, then leave or transition out. Spawn cadence can overlap in advanced difficulty.
2. **Map-origin ambient casts (additional layer):** Xerath Q and W occur at irregular, seeded times **without spawning/depicting Xerath**. This is a deliberate exception to the "champion enters → casts → leaves" pattern, not an implementation bug. Vary approach angle and location, but use readable, truthful warning cues and avoid unavoidable overlaps.

**Important boundary:** The phrase "Delayed dash" appeared in the owner's copied list but did not name a champion. It may refer to the earlier Rakan W example; treat **Rakan W as unconfirmed optional later content**, not as an approved first-wave requirement. Do not accidentally use Orianna R as a delayed dash.

### Priority / delivery

- First vertical slice: working champion lifecycle + **Malphite R**, **Blitzcrank Q**, **Ahri Q outbound/return**, with true spell-specific hitboxes/state transitions and reproducible practice tests.
- Next: **Lux Q**, **Vel'Koz Q**, **Orianna R** to widen interception, split, and location-dependent AoE.
- Ambient layer: **Xerath Q and W**, mixed in during longer dodge runs with independent seeded timing and safety checks.
- These are suggested engineering batches, not a new ranking that overrides the owner's desire to include **all** selected spells.
- When multiple casts overlap, guarantee readable cues and at least one viable line of defense, factoring in Flash availability, movement speed, positions and obstacles.

### Acceptance criteria

- Incoming Xerath Q/W functions **without an on-screen Xerath instance**; tests assert the lack of required Xerath entity.
- Ahri Q's return can be hazardous even when outbound missed; test moving return target/path, one hit per pass and exact hit/miss accounting.
- Malphite R tests distinguish prediction from visually reactable Flash opportunities at different distances.
- Vel'Koz Q actually splits; Orianna R originates from the ball; Blitz hook and Lux binding have distinct collision/interception policies.
- Every spell is individually switchable for isolated practice, then mixes through the encounter director. Existing game modes and tests remain intact.
