# League Mechanics God — Dodge Gauntlet Encounter Rhythm
## Design specification: high practice density with believable LoL timings

**Date:** 2026-10-30  
**Status:** Product design proposal; figures below are **training-director defaults to playtest**, not LoL spell stats, not implemented code.  
**Owner requirement:** Ezreal Q should arrive **much more often**; Malphite R should be a **rare, memorable interrupt**, not routine spam. Maintain the accepted roster: Ezreal Q, Malphite R, Blitzcrank Q, Lux Q, Vel'Koz Q, Orianna R, Xerath Q/W from the map with no visible Xerath, and Ahri Q outbound + return.

**Related vision:** [MECHANICS_ACCELERATOR_VISION.md](MECHANICS_ACCELERATOR_VISION.md).  
**Development branch:** `codex/controls-and-dodge`. Preserve existing gameplay, tests and all in-flight Codex changes.

---

## 1. The feel we are trying to create

Imagine a 10–12 minute continuous drill:

- There is **almost always a next useful decision**, but not an unreadable permanent wall of missiles.
- **Ezreal Q is the baseline rhythm**: many attempts from changing angles, with moving casters and periodic two-shot pressure. The player becomes excellent at reading and sidestepping ordinary, fast, single-projectile threats.
- Lux and Blitz make a straight shot more consequential: roots/hooks reward intelligent body position and movement.
- Ahri Q makes the player think beyond the first successful sidestep because **the orb returns**.
- Vel'Koz Q changes trajectory logic via the split.
- Xerath Q and W surprise the player **from the map**; there is no requirement for a visible Xerath champion, but there must still be reliable, fair sensory information before impact.
- Orianna R is occasional and requires tracking the **ball**.
- **Malphite R is infrequent**: a meaningful reaction/prediction or Flash decision, especially during otherwise ordinary dodge sequences. It is not on a visible repeating timer.
- The cadence rises and falls in **controlled intensity waves**, never pure RNG chaos.
- A well-timed response receives useful feedback. A player hit because of an impossible unavoidable overlap must not be described as a skill failure.

**North star:** more qualified dodge opportunities per minute, **not** a random high number of shots per minute. Skill transfer matters more than "bullet-hell" spectacle.

## 2. Separate three independent knobs

### A. Spell fidelity (fixed within a calibrated scenario)
Keep the best supported current LoL values for cast timing, missile travel, range, radius/width and hit effects. Distinguish:
- true champion in-world cast,
- off-screen cast with a credible cue,
- purely synthetic training pattern if explicitly labeled.

**Do not speed up an individual Ezreal Q beyond calibrated speed because Expert difficulty is selected.** To deliver more Ezreal Qs, send multiple independent Ezreal encounters/casters or realistically use the same champion's available cooldown. If an arcade-only shortened cooldown is ever added, label it as non-LoL timing and keep it out of transfer benchmarks. Ezreal Q is a first-collision projectile, not a piercing shot.

### B. Intensity (main difficulty knob)
Increase cast **opportunities per minute** and carefully permitted overlap, shorten *empty gaps*, vary arrival angles and maintain attacker cooldown correctness.

### C. Complexity (second difficulty knob)
Combine distinct problems: straight projectile + split, returning orb + long-range shot, delayed ground AoE + movement. Later add player attack/Q/E objectives, but pure Dodge remains focused on avoidance.

**Never let difficulty depend on secret opponent aim hacks, frame-dependent hits, impossible reaction windows, unfair spawn locations or unreadable visual overload.**

## 3. Common spell schedule (weighted, NOT a deterministic script)

The standard director chooses from a **regular-encounter weighted bag**. These are initial design weights per *cast opportunity* among regular events; tune from playtests. Rare ultimates are scheduled separately and do not compete with Ezreal Q in this bag.

| Spell | Regular bag share | Design role |
| --- | ---: | --- |
| **Ezreal Q** | **45%** | Core repeated straight-skillshot movement drill; vary range, lead, angle and caster motion |
| **Lux Q** | 15% | Root/binding threat; sometimes use minions to teach blocking |
| **Blitzcrank Q** | 12% | High-cost hook; baiting and lane-side shielding |
| **Ahri Q** | 11% | Two-phase outbound-and-return spatial prediction |
| **Vel'Koz Q** | 8% | Initial missile and perpendicular split, with varied recast timing |
| **Xerath Q (ambient)** | 6% | Long line from the map, **no visible Xerath** |
| **Xerath W (ambient)** | 3% | Delayed circular ground strike, **no visible Xerath** |
| **Total** | **100%** | |

**Important:** Percentages are design goals *over many runs*, not quotas within every tiny session. Maintain a seeded shuffle bag / weighted choice with a mild no-three-identical-*complex*-spell rule while **allowing frequent Ezreal Q**. One champion may cast several shots in a visit if their actual cast/cooldown state allows it. A round should feel organic, not "every fourth attack is Lux".

### Rare events: independent tension clocks

| Rare event | Suggested frequency in sustained mode | Safeguard |
| --- | --- | --- |
| **Orianna R** | Typically **every 90–150 seconds**, with randomized delay | Ball position established and readable; avoid blind instant shockwaves |
| **Malphite R** | Typically **every 150–240 seconds**; **never** in first ~90 s of a fresh standard run | No forced unreactable near-range Flash; avoid consecutive rare events; make champion approach/engage intention legible |

These intervals are **training cadence design targets**, NOT their League cooldown values. The actual champion ability must still obey its own timing and geometry. Do not force a rare event if safety/visibility checks fail; defer it.

**Use scheduling randomness with bounds** to avoid the "Malphite every exactly two minutes" memorization exploit. At most one new major rare event is armed at a time, and maintain a protective gap (initially **25–40 s**) between completed major events, unless an explicitly labeled expert combo was validated.

### How often does Ezreal Q appear?
Approximate *routine* Q count if the director meets its regular cast budget:

| Difficulty | Regular cast opportunities/min (initial tuning target) | Expected Ezreal Q/min at 45% |
| --- | ---: | ---: |
| Foundation | 10–13 | ~4–6 |
| Standard | 17–22 | ~8–10 |
| Expert | 25–32 | ~11–14 |

Actual safe counts depend on whether other events are active, line-of-fire geometry and fair recovery time. **Do not hit numerical targets by scheduling attacks that cannot be read or evaded.** Report both attempted and qualified threatening casts. The rare events are *on top* of these numbers only when the safety budget allows.

## 4. Wave rhythm inside one 12-minute drill

Keep *fidelity* fixed while varying intensity/complexity. Use seeded timing jitter so the player learns mechanics rather than memorizes a soundtrack.

| Time | Phase | What the player feels |
| --- | --- | --- |
| **0:00–0:45** | Calibration | Mostly Ezreal Q, a little Lux Q; angles change; no major ultimates; establish controls |
| **0:45–2:00** | Build-up | More Ez Q, Blitz/Lux, first Ahri returning orb; no exact aim-path guide in standard/expert |
| **2:00–3:30** | Mixed pressure | Vel'Koz split and ambient Xerath Q/W enter; moderate overlaps; **first Malphite becomes eligible only after 1:30**, and may be postponed |
| **3:30–5:00** | First peak | Increased Ez Q cadence + meaningful combos; occasional Orianna ball/R with fair setup; Malphite if rare clock and safety conditions allow |
| **5:00–5:20** | Micro-recovery | Fewer simultaneous threats, **not** a complete pause; easiest shots still present; player can recover control and concentrate |
| **5:20–8:00** | Adaptive pressure | Vary angles, caster movement, predictive vs reactive shots, two-stage hazards; occasional rare event |
| **8:00–10:30** | Expert peak | Challenging but solvable combinations, continued high Ez Q representation, short burst windows |
| **10:30–12:00** | Unseen benchmark | Frozen rules, new unrehearsed seed, no dynamic difficulty, consistent spell mix and scoring; test generalization |

For a **3–5 minute quick drill**, compact into calibration → mixed pressure → brief unseen benchmark; rare Malphite may not appear at all. If the user deliberately picks a **Flash reaction drill**, Malphite can repeat often *there*, separately from the default Dodge Gauntlet. This preserves both objectives.

### Micro-rhythm (every ~30–60 s)
- **Stable flow (20–35 s):** common shots, frequent Ezreal Q and some variation.
- **Short spike (5–12 s):** 2 carefully compatible threats with meaningful prioritization.
- **Recovery-in-motion (3–6 s):** maintain activity, lower overlap rather than stop all shots.
- **Optional major event:** replace a spike or defer until the space/resource checks pass, rather than stacking indiscriminately.

These are initial production design ranges, to be adjusted from actual player outcomes.

## 5. How the champion arrival system should work

### Ordinary visible champion encounter
`SPAWN/ENTER → MOVE/LINE-UP → CAST_TELL → COMMIT → PROJECTILE/AOE → EXIT → DESPAWN`.

- Ezreal should be a **frequent, reliable returning opponent**; he can step in, fire one legitimate Q, change position, then leave, and later a new Ezreal encounter arrives. Do not arbitrarily override a single caster's cooldown.
- Lux, Blitz, Ahri, Vel'Koz appear with distinct readable silhouettes, posture and tell. Avoid sudden enemy pop-in at melee range.
- Orianna R requires an independent tracked **ball**. Spawn, move or attach the ball before allowing R.
- Malphite should approach as a recognizable champion and create a **rare tension spike**. Some approaches end without R (realistic feint), and some R casts are aimed at projected movement instead of perfectly snapping to the latest coordinates.

### Ambient map attack
`SCHEDULE → CUE/PREPARE → COMMIT → PROJECTILE/AOE → RESOLVE`.

- Xerath Q/W can be cast from a simulated hidden/source point **without spawning an on-screen Xerath**.
- Cue must be specific enough to enable counterplay (e.g., ground warning for W, border directional/charge cue for Q); no exact future aim line in expert mode.
- Ambient threats should not dominate the ordinary flow; they mainly disrupt autopilot and orientation.

## 6. Mixing: a validated threat-combination grammar

**Allowed early combinations** (with an actual reachable safe response):
- Ezreal Q + Ezreal Q from distinct angles, separated enough to preserve reaction opportunity.
- Ezreal Q + Lux Q: ordinary threat plus punishable root.
- Ezreal Q + Ahri Q return: avoid near and far future trajectories.
- Ezreal Q + Xerath W: line dodge while exiting delayed AoE.
- Ezreal Q + Vel'Koz split: choose a safe corridor amid a branching path.

**Major events** are usually **replacements** for a spike:
- Malphite R may be paired with **one** straightforward Ezreal Q at expert level *if* at least one viable defense remains and the player has adequate cues. Do not automatically combine Malphite R with Orianna R.
- Orianna R + ordinary shots requires ball tracking, enough map space and no unsolvable CC chain.

**Excluded from initial automatic random combinations:**
- Forced Malphite R + Orianna R simultaneous hits.
- Multiple unavoidable CC chains while Flash is on cooldown.
- Split/projectile/AoE overlapping into zero reachable safe positions.
- Hidden map-source attacks with no signal.
- Active Malphite R or Orianna R while the player is still being locked in a preceding forced stun unless there is an explicit teachable strategy.

One patterned challenge can be very hard while still solvable; "technically there was a safe pixel for one simulation frame" does not count as fair.

## 7. Fairness scheduler, not blind RNG

### Proposed architecture

```text
EncounterDirector
  regularBag: weighted spell cards (45% Ezreal Q baseline)
  rareClock: Orianna / Malphite independent windows
  difficulty: FOUNDATION | STANDARD | EXPERT
  wavePhase: CALIBRATE | FLOW | SPIKE | RECOVERY | BENCHMARK
  activeThreatBudget: geometry-aware, not merely max projectile count
  playerState: position, velocity, radius, HP, CC, Flash, cooldowns
  worldState: obstacles, offscreen cues, enemy cast phases
  seededRng: replay identical scenario when requested
```

### Event decision (high-level)

1. Does director have capacity for a meaningful *additional* threat at this time?
2. Is a rare event due? If yes, validate its cue, approach, geometry and response; substitute for an ordinary spike rather than forcing it into a full arena.
3. Otherwise draw from the regular weighted bag (Ezreal Q very common).
4. Choose a source and aim policy. Test expected impact time and **reachable safe positions**, with and without Flash, against obstacles and other active hazards.
5. If the scenario lacks a plausible response, reschedule/re-aim or defer; do not simply mark it as "Expert".
6. Commit the scenario seed and source; show truthful gameplay cues.
7. When resolved, record what the player was threatened by, did, and could reasonably have done.
8. Adjust *future event spacing or overlap* only between short encounters, never in the middle of an already committed spell. In benchmark mode, never adapt intensity.

Practical first implementation can use **a few authored safe encounter templates** and simple reachability sampling, not an expensive perfect adversarial solver. A simulator may use ground truth for safety checks while intentionally hiding the exact aim line from the player.

### Suggested initial active-threat caps (tuning knobs)

- Foundation: **1** significant active threat, with low overlap.
- Standard: **2** significant simultaneous threats.
- Expert: **3** simultaneous significant threats, more only when combinations are manually approved and measurable.

An Ahri return Q is **one encounter with multiple phases**; Vel'Koz Q split can yield several projectiles but is not three new independent champion encounter decisions. Count actual dangerous geometry, not raw sprite count.

## 8. Adaptation and scoring

### Adaptive difficulty
Sample over a rolling **30–45 second window**. Approximate training-only rules:
- If qualified dodge rate exceeds ~80%, player is taking little damage and opportunities are plentiful, consider increasing **frequency/overlap** one step at the next phase boundary.
- If qualified dodge rate drops below ~45%, or the player suffers repeated unavoidable-seeming failures, **reduce overlap or spacing intensity** by one step.
- Otherwise hold difficulty. Apply hysteresis and cap changes, so the game does not oscillate after one lucky dodge.
- Never secretly change individual champion skill speeds, widths or cast windows under the same fidelity label.
- Freeze adaptation for benchmarks and report benchmark seed/scenario version.

### Feedback
Report per spell and combination:
- eligible threatening casts vs harmless misses;
- avoided, hit, blocked by terrain/minions, Flash-evaded, or not yet resolved;
- damage/hit cost, survival;
- positioning/collision choices when measurable;
- effective response to return/split/late AoE;
- repeated-seed training improvement vs unseen-seed benchmark.

Do **not** announce scientifically meaningful "reaction time" unless the engine truly measured the visible tell, input time, reaction opportunity and possible prediction. Flash success is not always proof of a reactive dodge: at close range it is often anticipation.

## 9. How rhythm extends across the whole product

The main product remains four principal modes:
1. **Pure Dodge Gauntlet** — common shots + occasional high-stakes threats, concentrated pure evasion.
2. **Mechanics Arena** — full-kit **solo versus many champions** in one chaotic, persistent combat environment. Reuse spell definitions but never make its encounter director a sequence of forced Q/E/kite lessons. No allied champion bots. Keep threat density low enough for meaningful offense.
3. **CS Mastery** — **one uninterrupted** minion-vs-minion farming lane, progressing naturally into under-turret farming when turrets exist; no separate under-tower mode and no enemy champion poke.
4. **Mid Lane Mastery** — **one extremely difficult, uninterrupted 1v1 lane**: the bot pokes when you commit to CS and genuinely attempts its own CS, while you try to punish its commitments. Bait/dodge/trade emerge from a real lane, not as new drills.

**Do not reuse Pure Dodge's maximal cast frequency unchanged in CS or Mid Lane**; those have complex simultaneous tasks and need time for genuine decisions. Share the spell catalog/simulation but adapt the scenario rhythm by purpose.

### Session length and difficulty are SETTINGS, not modes

The product has one **Dodge Gauntlet**. Different session lengths, seeds, intensity adjustments and performance benchmarks are options **inside the same continuous mode**, not additional selectable drills or menu entries. Strong defaults should let the player enter and immediately face meaningful spells. Player-facing design scope is exactly four game modes across the entire project.

## 10. Implementation order for Codex (source-preserving)

**Build a real, playable vertical slice first, not a full rearchitecture.**

1. Add **Ezreal Q** to the explicit first spell roster and implement a weighted **regular spell director** where Ez Q is dominant; reuse the existing Ez Q projectile implementation.
2. Preserve spell fidelity: caster arrival and cooldown logic, first-contact collision, real hit/dodge accounting, no exact aim line on Expert.
3. Add seeded spawn angles + enter→cast→exit; validate regular cadence and variation at Foundation/Standard/Expert.
4. Add **rare event clocks** for Malphite R and Orianna R, independent from the regular bag. Do not require Malphite to be present in every run.
5. Add Ahri Q outbound/return and ambient Xerath Q/W with differentiated patterns and fair cues.
6. Add safety/combination budgets and a **30–45 s adaptive controller**, leaving benchmark fixed.
7. Test actually played 3–5 and 10–12 minute runs; measure events/minute, **qualified** dodges, dropped frames, unfair patterns and survival. Adjust weights based on data rather than intuition.
8. Preserve existing modes/minion/CS work, run `node --test tests/*.test.cjs` and relevant reference tests, commit changes to the active development branch and update `docs/PROGRESS.md`.

### Acceptance tests
- Ezreal Q share is approximately 45% over many seeded regular encounters, with deterministic replay and per-caster cooldowns.
- At Standard, the director targets ~17–22 *regular cast opportunities/minute* unless fairness prevents it; report actual completed opportunities and hit/dodge data.
- Malphite R **does not occur during the initial 90 s** of Standard, schedules within its bounded longer interval when safe, and can be completely absent from a 3–5 minute quick drill.
- No exact periodic Malphite R pattern detectable across varied seeds.
- Orianna ball tracks position and R center is the ball; Ahri Q returns.
- Xerath Q/W can occur with no on-screen Xerath entity.
- A no-Flash scenario cannot force an impossible Malphite hit and then punish the player as if it were reactable.
- High-speed projectiles, split missiles and moving target hitboxes do not tunnel at 30 FPS.
- Threat-qualified scoring excludes harmless off-axis expirations.
- Existing Dodge/Kite/CS gameplay and pause/restart still work; no regression after introducing scheduling.

## 11. Design sign-off boundary

Numbers here are initial proposed **director cadence values**, not evidence-backed optimal frequencies. Validate in browser with player performance and adjust. If a value creates fatigue, unreadable overlaps, or out-of-LoL feel, preserve gameplay fidelity and reduce intensity/overlap rather than inventing faster-than-LoL spell physics.

**Core operating principle: Many Ezreal Q repetitions. Varied ordinary threats. Rare Malphite R moments. Steady pressure with short recoveries. Fair situations. Honest metrics.**
