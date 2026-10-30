# Mechanics Arena — Combat Under Pressure
## Gameplay, encounter rhythm, coaching metrics, architecture and implementation plan

**Project:** League Mechanics God — Mechanics Accelerator  
**Prepared:** 2026-10-30  
**Status:** Proposed gameplay specification, **not implemented** by this document. Numerical cadence/balance targets below are initial tuning hypotheses, **not official LoL values**.  
**Code branch at inspection:** `codex/controls-and-dodge`  
**Related:** `PROJECT_BLUEPRINT.md`, `docs/MECHANICS_ACCELERATOR_VISION.md`, `docs/DODGE_GAUNTLET_RHYTHM.md`, `docs/PROGRESS.md`, `research/lol-data/ENGINEERING_SPEC.md` (research branch / PR #1).

> **Product promise:** A concentrated, continuous teamfight-like training environment where surviving is necessary but **not sufficient**. The player must dodge *and* aim *and* move/attack *and* choose targets *and* make real resource decisions. The world keeps changing and the player has to maintain mechanical performance under divided attention.

## 1. Relationship to the other modes

- **Pure Dodge Gauntlet:** dense defensive movement, many Ezreal Q events, rare big ultimates.
- **Mechanics Arena:** medium-high defensive pressure **plus** offensive objectives. Lower projectile density than Pure Dodge because there must be time to aim, auto, chase, land spells and make decisions.
- **CS Mastery:** last-hit timing, wave and tower fundamentals.
- **Mid Lane Mastery:** integrates CS + enemy lane trading/positioning + bait/dodge/punish. Do **not** import minion simulation into Mechanics Arena by default; train fighting here.

**Do not create 15 new top-level menu modes.** Mechanics Arena is ONE mode with selectable champion profile, difficulty and practice emphasis. A scenario director mixes individual tasks in continuous play.

## 2. Player fantasy: a 60-second excerpt

- 0:00–0:08 — A mobile target strafes in and out of Ahri E range. Player must land E, then Q, while an Ezreal Q crosses the arena. Enemy may juke, but cannot read the player's hidden mouse cursor or react instantly.
- 0:08–0:15 — A dangerous pursuer enters. Player should kite out with well-timed autos and reposition, not spend the whole encounter running.
- 0:15–0:23 — Two targets become available: a fragile, low-health ranged target and a high-threat diver. Target switching matters; a narrow incoming line spell forces a micro-dodge during attack recovery.
- 0:23–0:28 — Short recovery-in-motion: simple shots continue, no hard reset; a completed target exits, a new opponent enters.
- 0:28–0:39 — Cast E near true effective maximum range, but moving enemy changes direction during the projectile's travel. The player must lead aim and commit without requiring impossible prediction.
- 0:39–0:49 — Ahri Q outbound misses narrowly; movement can line up its **return** pass for a second chance. Don't auto-count both passes as one hit.
- 0:49–1:00 — One readable threat introduces an engagement/Flash decision; if it is a Malphite-type engage, the opponent must appear, act and obey distance-specific reactability; a no-Flash solution or avoidance-by-positioning must be possible when Flash unavailable.

This is **illustrative**, not a deterministic schedule. Seeds, opponents and target paths vary. The director changes *when* and *from where* decisions happen, never secret-aims at impossible positions.

## 3. Primary combat tracks

### A. Ahri — skillshot precision while dodging (launch priority)
The initial Mechanics Arena profile uses the **existing Ahri kit** from the game:
- **E / Charm:** hit moving targets, aim just ahead of lateral motion, control the distance. An E is blocked on first eligible target. Evaluate successful CC + subsequent opportunity independently; a near-max-range E is a more advanced skill, not automatically better than a correct closer hit.
- **Q / Orb of Deception:** one outward and one returning passage. Count hits and their pass identity. A good player can reposition to make return hit even if the outbound path was imperfect. Q can pierce eligible enemies. The moving return anchor is player position.
- **E → Q follow-up:** use the CC window to connect one or both Q passes, then reposition before nearby attacks hit. Reward both execution and avoiding unnecessary damage.
- **Q + E while under threat:** player has to maintain spatial awareness and input precision. Training-only overlays (range rings, pause-to-review shot line) may be offered in Foundation, not as constant aim assists in Expert.
- **W / R / Flash:** tactical use under pressure and escape; cast interactions and cooldown must be consistent with the current code and documented assumptions. Flash is not a free generic invulnerability. Preserve realistic cooldown/resource trade-offs.

Use the pinned LoL data and `ENGINEERING_SPEC.md` where verified. For illustration only, community data describes Ahri Q as outbound magic and returning true damage, each target once per pass; E is a first-target charm. Exact current patch conditions must be checked before claiming complete in-client fidelity.

### B. Tristana — fast-attack-speed kiting (second champion track)
User wants a **fast-attacking ADC track**, especially Tristana. Make this an optional profile inside Mechanics Arena, not a replacement for Ahri in skillshot practice.

- Train attack-release → move → release cadence, attack range edge, windup cancel, attack-moving under chase, target changing and Flash/jump decisions.
- **Tristana Q is an attack-speed steroid, not an aimed skillshot**; do not reuse Ahri Q/E scoring or treat every champion Q as a missile.
- Later: E/Explosive Charge stacks and W/R positioning can make kiting meaningful, but only after the basic high-AS timing/drill feels right; source data distinguishes these from Ahri mechanics.
- Keep per-profile stats and records separate. Do not silently port Ahri windup/range/hitbox assumptions to Tristana.

### C. Future champions
Only add if they teach a meaningfully distinct action, not to inflate a champion roster. The same enemy/spell director should support other LoL-like moves without copying the whole game.

## 4. Enemy roles — fewer, smarter opponents

**Do not simulate 5v5 randomly from day one.** Start with one to three meaningful enemy actors, each with a clear training job. First release can use original silhouettes with data-driven spell modules; later recognizable champion appearances can be polished.

| Role | Movement / combat intent | What it teaches |
| --- | --- | --- |
| **Strafing target** | Move laterally at changing intervals; sometimes commit or hesitate | Long-range Q/E prediction, lead and timing |
| **Kite pursuer / diver** | Advance, step in/out of attack range, threaten melee engage | Orbwalk cadence, backward kiting, resource discipline |
| **Fragile priority target** | Opens short damage windows; retreats if pressured | Accurate target switching, burst conversion |
| **Caster / disruptor** | Fires credible spells from varied angles | Dodging while aiming or attacking |
| **Major engager** | Appears rarely, telegraphs meaningful commit | Malphite-type Flash/mobility judgment |
| **Ball / special object** | Independent ball anchor for Orianna-style threat | Tracking a second object instead of only champions |

#### Enemy AI behavior requirements
- Use a simple, **visible, bounded** state machine: `enter → reposition/strafe → prepare/cast/attack → react/retreat → exit`.
- Use a variety of authored moving-target patterns: strafe left/right, change direction, short stop, accelerate within the chosen champion rules, approach/retreat. Do not just oscillate perfectly on a sine wave forever.
- Aim policies: current-position, plausible lead/prediction from recent movement, static choke point, occasional bait/feint. Randomize within plausible competence, never track the player's future input.
- AI reaction latency should be bounded and explicit; it cannot read a player's unreleased mouse-click or change direction on the same frame a missile would hit without rationale.
- If a target breaks line/range or dies, clear orders/projectiles according to the actual interaction rules.
- Prevent permanent kiting loops where enemy moves too fast, invulnerable, or outside meaningful range.

## 5. Training modules inside continuous combat

| ID | Practice module | Player action | Evidence / coaching metric |
| --- | --- | --- | --- |
| M1 | **Dodge + E** | Sidestep an incoming projectile, land E on a moving target | E attempts/hits, distance bucket, exposure and health cost |
| M2 | **Max-range Q/E** | Land **separately** measured Ahri Q or E near the true range | Hit rate at 60–80%, 80–95%, 95–100% normalized range; lead error and range violations |
| M3 | **Q return engineering** | Reposition after Ahri Q so return connects | Outbound hits vs returning hits, double hits and exposure |
| M4 | **Kite under fire** | Auto while retreating and dodging real spells | Useful auto releases in safe range, avoidable attack cancels, damage taken |
| M5 | **Target switches** | Shift priority when a diver arrives / low-HP threat appears | Decision delay, target priority success for authored scenarios, lost uptime |
| M6 | **E → Q punish** | Convert charm into meaningful follow-up without eating counterfire | Valid charm hits, Q passes after CC, safe exits |
| M7 | **Flash check** | Recognize Malphite R-type engage and decide walk/Flash/mobility | Legitimate hit avoidance, resource waste, timing, false-reactability flags |
| M8 | **Threat triage** | Choose dodge path among two attacks without surrendering all offense | Qualified avoided hits, damage/goal trade-off |
| M9 | **Position / spacing** | Hold advantageous attack/cast distance and avoid dangerous path | Time in meaningful range, time exposed to credible hostile threat |
| M10 | **Burst into exit** | Secure a priority target and move out before counter-attack | Takedown/CC conversion and HP cost, valid escape window |

**Max-range rule:** aim for meaningful accuracy *near* a spell's actual effective range, not just reward maximum distance. Normalize by the specific spell's range and collision geometry. E and Q have different maximums. A good decision to take a reliable 70%-range E should not be scored as failure. Never grant a hit by extending its range to make a task feasible.

## 6. Encounter rhythm and difficulty

**Core principle:** Pressure is persistent, but offensive windows must remain. Mechanics Arena has lower *hostile cast density* than Pure Dodge, plus more simultaneous **player decisions**.

### Starting tuning targets (not measurements)

| Tier | Hostile meaningful casts/min | Simultaneous major hazards | Active targets | Design focus |
| --- | ---: | ---: | ---: | --- |
| Foundation | 5–8 | 1 | 1–2 | Learn combos while dodging visible threats |
| Standard | 9–14 | 1–2 | 2 | Maintain aim and attacks under pressure |
| Expert | 14–19 | 2–3, only if fair | 2–3 | Target prioritization, rapid reposition and earned Flash decisions |

Count *qualified threatening casts* separately from raw casts. If spell geometry leaves no attack window or reachable safe path, defer a threat. **These are candidate intensity values to tune by human playtests**, not strict quotas.

### Threat composition
- **Ordinary backbone:** frequent Ezreal Q, plus Lux Q, Blitz Q, Ahri-return threat and Vel'Koz split. Weight toward Ezreal Q as in Dodge, but less dominant to keep varied tasks; an initial candidate is ~35–40% of regular enemy casts being Ezreal Q.
- **Ambient layer:** occasional Xerath Q/W without visible Xerath; make angle/impact signaled enough to play fairly.
- **Rare commits:** Malphite R-type engage and Orianna ball/R should be deliberately rare, preferably 1 per several minutes when safe; they should **replace**, not stack blindly on top of, the worst ordinary threat peak.
- Make the player aim and auto between hostile casts. Do not throw a spell every 0.2 seconds just because the game is called "Mechanics Accelerator."

### 10-minute full session design (prototype)
| Window | Feel | Intensity emphasis |
| --- | --- | --- |
| 0:00–1:00 | Calibration | One moving target, ordinary Ez Q pressure, Q/E accuracy |
| 1:00–3:00 | Offensive flow | More moving targets, dodge + E/Q and first kiting |
| 3:00–4:30 | Target-choice phase | Pursuer enters, real target-switch tradeoffs |
| 4:30–5:30 | Spike | Short combinations and possibly one rare engage with fair setup |
| 5:30–6:00 | Recovery in motion | Simple enemy threats continue, shorter overlap |
| 6:00–8:30 | Mixed advanced | High-precision Q/E, Q return, kite and punish opportunities |
| 8:30–10:00 | **Unseen benchmark** | Fixed difficulty/seed, no adaptive tuning or perfect aim hints |

**Do not** guarantee a Malphite R in every run. In a separate opt-in Flash reaction emphasis, events may be concentrated while preserving true distance/timing. In a long Mechanics Arena, randomize rare event windows so players cannot memorize them.

### Micro-cycle / encounter grammar

```text
Engage setup (2–4 s)
→ Offensive opportunity with ordinary fire (8–15 s)
→ Pressure spike with a second objective (4–8 s)
→ Recover / reposition (2–5 s, not idle)
→ Enemy exits or rotates; fresh target context
```

**All seconds are training pacing hypotheses.** Real spell cast and missile physics remain governed by the calibrated ability definition, not by the stage clock.

The director can let simple/complex beats overlap; the cycle is a design rhythm, not a fixed memorized script.

## 7. Mechanics Arena Director

Use one shared engine with Pure Dodge, but with a distinct **Combat Director** controlling both `enemyThreatBudget` and `offensiveOpportunityBudget`.

### Main structures
```text
MechanicsArenaDirector {
  seed,
  playerProfile: "ahri" | "tristana",
  tier: "foundation" | "standard" | "expert",
  emphasis: "balanced" | "aim" | "kite" | "flash",
  phase: "setup" | "flow" | "spike" | "recovery" | "benchmark",
  activeActors: [],
  activeThreats: [],
  objectiveWindows: [],
  scenarioCards: [],
  scoreEvents: [],
  difficultyController: ...
}
```

### Example reusable scenario cards
- `ahri_dodge_e_maxrange`: mobile target with long-range E window plus one simple incoming shot.
- `ahri_outbound_return`: one moving target placed to make return tracking meaningful.
- `ahri_e_q_trade`: E-then-Q conversion under incoming angle pressure.
- `kite_pursuer_under_fire`: in-range pursuer, attack-move and a readable secondary missile.
- `switch_diver_to_priority`: several targets with an authored, objectively meaningful target-choice change.
- `malphite_flash_check`: rare engage with real telegraph, range geometry and a viable defensive answer.
- `orianna_ball_spot`: ball-bearing threat while a target requires offensive precision.
- `ambient_xerath_w_plus_attack`: leave delayed ground zone without canceling all offense.

Each scenario card declares:
1. **Player objective** (what the player should learn).
2. Enemy actors and spawn / departure lifecycle.
3. Offensive opportunities (realistic target HP/range/path).
4. Threat ability definitions and movement constraints.
5. Valid objectives and counterplay families (walk, move early, Flash, hold position, E cancel).
6. Eligibility/measurement rules, cooldown/resource assumptions.
7. Incompatibilities (patterns that would be unfair together).
8. Seeded variants, difficulty flags, acceptance tests.

### Fairness contract
Before adding a new event, test whether the player has *plausible* response paths and whether the stated offensive objective remains achievable; do not make automatic impossibility appear as "Expert".

- No unavoidable spawn-on-player hits.
- No 0-information Malphite R when it is billed as a **reaction** challenge; near-range engages may be **prediction/spacing** challenges and should be labeled as such.
- No forced E hit when a blocker is guaranteed to intercept it unless that is the intended lesson.
- No Q/E requirement while both spells are on cooldown or while player is legitimately hard-CCed, unless the card explicitly tests a recoverable failure.
- No animation prediction cheating by enemy AI or fake response advantage.
- Don't cause offscreen danger without a cue or planned map-awareness mode.
- A "correct" Flash does not require invulnerability assumptions the game does not implement.
- Enemy deaths, new spawns, cooldowns and HP resets must avoid trivial scoring farming.

**Implementation shortcut:** start with hand-authored, valid scenario cards and a deterministic selector. Reachability and fairness checks can be incremental; do not block shipping on a perfect optimal-play solver.

## 8. Scoring / coaching: evaluate combat quality, not just kills

Track distinct dimensions instead of a single high number that hides weaknesses:

**Defensive**
- Qualified incoming threats → avoided, hit, blocked, Flash-evaded, unresolved.
- Damage received; damage per threat; awareness of dangerous area.
- Explicit label for timing/prediction when a near-range engage was not visually reactable.

**Offensive**
- E casts/hits and range-bucket accuracy, E hits converted into Q/auto.
- Q fired, outbound hit, return hit, double-pass hit, target movement context.
- Autos released/cancelled; effective time-on-target while safely within range; missed attack windows.
- Damage to valid enemy targets and takedowns, without overstating raw DPS from damage on irrelevant targets.

**Decision**
- Target switches in context (do not assign false "mistake" labels in ambiguous fights).
- Resources used/unused: Flash and Ahri R, successful hit prevention and opportunity cost.
- Position and exposure during casts/windup.
- Whether the player maintained offensive contribution without taking avoidable damage.

**Suggested end-of-run dashboard**
- `DEFENSE`: Qualified threats avoided and damage taken
- `PRECISION`: E hit %, Q outbound/return %, long-range attempts
- `UPTIME`: Attack-release cadence and safe damaging windows
- `DECISIONS`: Flash checks, target changes and successful CC-to-damage conversion
- `CONSISTENCY`: repeat seed vs held-out seed performance

For first release, show only metrics we actually measure. Never claim a precise reaction-time result from a weak proxy. A successful dodge is not the same as an intercepted or harmless projectile. An E hit at long range must use the real target-collision event, not proximity to cursor.

### Composite score — optional, not sole success criterion
A training score may summarize aspects, but keep raw dimensions visible. Normalize by **eligible opportunities**, protect against trivial idle/revive farming, and only define weights after playtesting. A player who runs in circles and never attempts Q/E must **not** receive a high Mechanics score solely for survival.

## 9. Adaptive training and progression

Adapt between engagements, not while a spell is in flight:
- Increase **frequency**, target movement variety, number of simultaneous decisions, and reduction of *training overlay* if performance remains high.
- Lower overlap or simplify one task when performance collapses.
- Retain genuine timings/speeds/hitboxes for a given calibrated profile and patch.
- No opponents that perfectly dodge input-dependent future shots.

### Modes of evaluation
- **Practice:** visible useful range and telegraph hints; small coaching messages on missed opportunities.
- **Challenge:** almost no future aim guides; calibrated game cues only.
- **Benchmark:** unseen seed and locked intensity, per-spell/target scenario versioning. Track delayed retest and optionally user-reported real-match improvement; never assert unmeasured rank gain.

### Avoid anti-training
Don't incentivize spam-casting E at full cooldown if there is no good shot. Don't call "miss" a deliberately withheld poor opportunity. Don't reward cancels as inherently bad when dodging a lethal threat matters more. Health and reset policy must be explicit: health lost matters, but reset/recovery should keep the drill playable. Avoid making invulnerability, free cooldown resets or enemy deletion routine without a clear training-only label.

## 10. Player experience & UI

- One menu entry **MECHANICS ARENA** with **Ahri / Tristana** (Tristana enabled only once implemented), tier and practice emphasis. Existing **Kite Arena** can evolve into this; don't create a competing disconnected combat implementation.
- In-game: preserve large canvas and clear HUD, QWERF, attack range and cooldowns. Highlight only a current high-level training cue (e.g. `LAND E ON MOVING TARGET`) and a subtle next-situation indicator.
- During attacks: readable enemy silhouettes, facing, spells, ground effect hitboxes. Never overwhelm canvas with instructional text.
- Optional Foundation-only overlay: cast/attack range, success feedback and unobtrusive post-fail explanation.
- Results: five stat categories; click a weakness to replay a short controlled scenario using the same seed.
- Restart and pause preserve deterministic seed behavior; any local records are versioned when scoring rules materially change.

## 11. Technical integration with the checked game.js

At inspection on 2026-10-30:
- Existing root `game.js` already contains `attackOrder`, `updateOrder`, `startAttack`, player cast Q/W/E/R, impact/death handling, `foes` and `shots`, seeded random, 120 Hz fixed-step update and per-mode results.
- `Kite Arena` is already playable, and `skillshot`/other legacy modes exist in code; they are not a finished combined Mechanics Arena.
- `REFERENCE_SPELLS` includes simplified Lux/Ezreal examples for reference Dodge.
- The research PR and Ahri data adapter exist; avoid blindly adding a new incompatible configuration or overwriting minion work.
- The reported gameplay test suite was **118/118** in the last inspected `docs/PROGRESS.md`, but newer commits or working-tree code may differ. Re-run current tests rather than trusting historic numbers.

**Preferred path:** Add a new mode flag or evolve Kite Arena behind a clearly named feature switch while retaining the old Kite behavior for regression. Extract a scenario director only when needed, consume existing simulation/events, and keep visual changes separate from physics. No engine migration or Unity.

### Implementation milestones

**A — Combative aim vertical slice (highest immediate value)**
1. Make a **continuous 3–5 min Ahri** variant with one moving, intentionally juke-capable target.
2. Spawn repeated Ezreal Q pressure from readable angles while player has full Ahri Q/E access.
3. Give the target different seeded movement patterns with committed decisions and reaction delays.
4. Track separate Q outbound/return, E accuracy by range bucket, qualified defensive dodges, HP, auto releases.
5. Add repeat-seed control, failure/score screen, actual browser-play smoke and tests. **Exit:** Player can meaningfully move, aim E/Q and avoid harm simultaneously without being forced into spam.

**B — Kite & switches**
1. A threatening pursuer that enters/exits, proper attack target order/windup/cadence.
2. Two concurrent enemies; identify a target-switch objective in some scenario cards.
3. Track attack uptime, actual damage and safe movement. **Exit:** Switching and attacking during dodge is trainable and scores appropriately.

**C — Defensive reaction and Flash**
1. Rare Malphite-style engager with explicit cue and range-dependent opportunity.
2. Optional Orianna ball/R tracking or Xerath ambient W for spatial multitasking.
3. Flash resource tracking; don't require impossible reactions or trivially reward never pressing Flash.
4. **Exit:** Meaningful and fair Flash decisions under offensive load.

**D — Tristana ADC high-AS specialization**
1. Data-verified champion profile separate from Ahri, not a fake fast Ahri skin.
2. Attack-speed steroid Q, accurate autos/windup/range; simple kite pursuer card.
3. Then add E-charge and W escape/reset mechanics after verifying interaction.
4. **Exit:** High-AS kite rhythm materially differs from Ahri, with no auto-cancelling bugs.

**E — Full 10-minute adaptive loop**
1. Directed flow/spike/recovery and random but bounded scenario sequencing.
2. Preset tiers, seed replay, unseen benchmark, local records.
3. 3–5 and 10-minute actual playthroughs to tune real intensity and performance.
4. **Exit:** Fun, sustainable, intense, fair and readable across several player skill levels.

### Required acceptance/regression tests
- Q cast on a strafing target: outbound and returning hits are counted per pass, no double-hit on one pass, target changes after orb launch affect return.
- E stops on first valid collision and not on an invalid/untargetable enemy; hit and miss range thresholds use independent Q/E ranges.
- Scenario rotation doesn't delete in-flight missiles or trigger phantom damage, kill/score or invulnerability.
- 30/60/120 render FPS gives comparable aim/collision and attack counts on fixed seeds; deterministic combat with fixed simulation step.
- A mid-windup dodge command can cancel an auto; post-release movement cannot retroactively cancel its projectile. Legitimate cancels are not universally labeled poor decisions.
- An enemy AI cannot dodge at impossible latency and can't read future player inputs.
- Long-range E attempts with no line-of-fire don't become guaranteed "miss" opportunities or unrealistic scored hits.
- Under high pressure the player has reachable safe spots and at least some meaningful offense windows.
- Flash is consumed on cast, does not grant arbitrary invulnerability and cooldown/reset policies are explicit.
- A player who avoids everything but never casts/attacks fails the offensive objectives, while a player who hits everything but takes excessive avoidable damage fails defensive benchmarks.
- Restart/pause/storage failures/controls/CS and Dodge modes remain functional; `node --test tests/*.test.cjs`, data generation checks and a browser-play pass verify the implementation.

## 12. What not to do

- Do not create an exact-timing cosplay of LoL by making up unsupported spell numbers.
- Do not collapse all enemy AIs into instant pixel-perfect aimbots.
- Do not equate high cast density with better training if aiming becomes impossible.
- Do not force Q/E to always be max-range: train sensible shot selection, and **separately** benchmark long-range precision.
- Do not hardcode one optimal target for every ambiguous teamfight and punish reasonable alternatives.
- Do not transform this into another passive Dodge Trial without combat objectives.
- Do not reimplement existing Ahri attack/cast/collision logic from scratch for a new mode.
- Do not let new Mechanics Arena work silently damage CS, minions or the current Dodge Gauntlet.
- Do not claim "hours of training equals rank gains" without actual real-game transfer measurement.

**Success definition:** At the end of a ten-minute Mechanics Arena run, the player has faced many **fair, distinct combinations of dodge + offensive aiming/kiting/targeting/resource decisions** and receives reliable feedback to improve next time.
