# ADC Mechanics God — Astra implementation plan for Terra

Planning baseline: `main` at `7de3430fbf908f0bdf026abaac55a2d50337f545`, inspected through GitHub on 2026-11-16. This is a plan, not an implemented or play-tested feature. Read with the canonical `PROJECT_BLUEPRINT.md` and latest `docs/PROGRESS.md`.

## Product decision

Make **ADC Mechanics God** the second mode: control **Tristana**, repeatedly attack durable enemies with the existing A-attack interaction, move between attacks, and dodge skillshots while maintaining distance. Most enemies pursue and punish contact heavily; selected ranged casters stop at distance and create skillshot pressure. Preserve Dodge's behavior, controls, balance, presentation, and scoring. This session plans; Terra implements later.

Use the existing second-mode slot (currently Kite Arena) rather than adding a redundant third drill. Keep the internal `kite` identifier if helpful for compatibility; display the requested new name. The first playable milestone is a ten-kill challenge with immediate retry, retaining the alpha's finish condition while making kiting the central skill. All numerical values below are starting balance proposals, not measured League values.

## Verified repository reality and prerequisite

`AGENTS.md` points to the blueprint and requires reading the README, progress, and current source. All were inspected. Production is plain Canvas/JavaScript in `index.html`, `game.js`, and `style.css`; no Unity or framework migration is needed.

The inspected main does **not** contain Tristana, champion-specific Dodge enemies, or Syndra's two-Q pattern. It has one generic enemy type and straight/fan missiles. The champion roster described by the user may exist in a newer working copy, branch, or deployment. Before implementation, inspect the latest repository and any identified working source. If a newer Dodge implementation is available, use that as the baseline and map its actual enemy definitions. Do not replace it with this older alpha, invent filenames for missing code, or claim that champion behavior was already reused. The attack and melee prototype can proceed from verified source, but exact champion integration requires the relevant source to be located.

Concrete hooks in the inspected alpha:

- `index.html`: second mode button is `data-mode="kite"`; shared HUD and generic QWERF ability bar.
- `game.js` `reset`, `enemy`, `addEnemy`, `shootEnemy`, `damageEnemy`, `takeHit`, `startAttack`, `moveTo`, `update`, `render`, and pointer/keyboard listeners contain all gameplay.
- A then left-click selects the nearest enemy to the player within 285 units. Right-click targets enemies or moves. Existing input gesture should remain familiar.
- Kite enemies already have 88 HP; autos deal 28, meaning four hits. Player has 160 HP, speed 270; auto period .72s and windup .18s.
- Every enemy currently approaches beyond 230 units and retreats inside 155; none is a dedicated chaser. Contact applies 11 damage via a shared .14s invulnerability timer.
- Moving does not cancel an ordinary attack windup. Chase destinations become stale. Attack checks disagree (265/275/285/320 units). Autos are straight, untargeted projectiles that can hit another foe. These are critical ADC-specific repairs.

## Implementation sequence

### 1. Protect Dodge and establish a runnable baseline

Run the actual browser app, record Dodge controls, enemy patterns, timings, damage, pause/restart, and completion. Save a reproducible baseline before changing shared code. Keep legacy Dodge handlers intact and dispatch ADC-specific input/combat/enemy behavior by mode. Prefer a small separate ADC module with explicit setup/update/render/input hooks over a broad engine rewrite; adapt this boundary to the source actually found. Share only genuinely neutral utilities. Do not repair Dodge's known dodge-counter issue within this feature.

Acceptance: switching to ADC and back does not leak enemies, attacks, timers, HUD labels, or input state into Dodge. Existing Dodge results and behavior remain unchanged.

### 2. Deliver the kiting slice with Tristana and one pursuer

Make Tristana identifiable through a readable small gunner silhouette, cannon, facing, attack/recoil animation, and name. Use original presentation or assets with established reuse permission; do not require missing external sprite packs to run. Exact League stats and a full champion kit are outside this first milestone.

Implement ADC attack state explicitly: ready → windup → projectile release → remaining cooldown. Right-click movement before release cancels the shot; after release it never removes that shot. Start the full attack period on release, subtracting the windup duration, so repeated cancellation cannot produce extra attacks. A cancelled windup must complete a fresh windup before another release. Death, mode switch, pause, and restart have explicit cleanup behavior.

Preserve A then left-click and right-click attack. A+click chooses the nearest valid enemy to the player within attack range; otherwise moves toward the clicked point with attack-move intent and acquires a target when it enters range. Right-click ground replaces attack intent immediately. Right-click enemy continuously chases its current position until in range. Stable IDs and deterministic tie-breaking prevent target flicker. Use one documented ADC range convention throughout acquisition, chase, release, and range rendering; start at 275 center-to-center units. Once released, the target-bound auto travels to its living target; if that target dies, remove the missile without accidental retarget damage.

Start with 28 damage, .72s attack period, .18s windup, 270 movement speed, 160 player HP, and four-hit pursuers at 112 HP. Pursuers close directly with modest separation to avoid stacking, speed around 170–195. Start contact damage at 40 with a .75s per-enemy contact cooldown; never apply damage every render frame. Contact and skillshot damage accounting must be explicit, without borrowing Dodge's global invulnerability semantics accidentally.

Show attack range when arming A, selected target, enemy health, visible attack readiness/windup, muzzle/projectile/impact feedback, and clear contact damage. The ADC first milestone trains autos and movement; hide/disable the alpha's unrelated Bolt/Pulse/Volley abilities for ADC rather than calling them Tristana abilities. Keep Flash only if present and appropriate in the actual baseline; document it in ADC controls. Leave Dodge's ability bar and bindings untouched.

Acceptance: a stationary player loses to a pursuer; a player alternating released autos and movement can kill it without contact. Four committed hits kill the proposed pursuer. Animation and projectile release agree.

### 3. Add mixed enemy pressure with isolated pattern variants

Give ADC enemies independent behavior and attack-pattern settings: chaser, or ranged stand-off caster. A chaser continues closing between casts, with a short visible cast lock if needed. A ranged caster approaches a configurable engagement band (initially about 230–260 units), holds position to cast, and retreats only to a capped minimum distance; it must remain catchable within Tristana's attack range. Do not let a faster ranged unit retreat indefinitely. Recalculate contact after movement and apply separation at arena edges.

Reuse actual Dodge skillshot generators when found, through ADC-specific definitions/configuration. Preserve telegraphs and recognizable trajectories, but tune ADC cast frequency and concurrency separately to leave attack windows. On the inspected alpha alone, reuse its generic line/fan mechanics as the first integration slice and clearly label the champion roster unfinished.

For Syndra, treat the user's two-Q description as a requirement to inspect, not a verified source fact. Proposed ADC variant: one clearly telegraphed Q at the player's sampled position, followed by a recoverable attack window. No second Q in the initial ADC variant. A later Q→E orb interaction is a separate tested enhancement. Do not change Dodge's Syndra definition or add a complex variant before proving that the basic mixed encounter is fair.

Acceptance: melee pressure forces spacing while ranged casts force dodging; enemies expose regular auto windows. Killing a caster cancels uncommitted casts, while already released hazards follow one documented rule. No unavoidable spawn/contact hit occurs.

### 4. Shape a complete short run and usable feedback

Introduce enemies progressively: one pursuer to teach the rhythm, then two; add a ranged caster after early kills. Start with a maximum of four active enemies and at most two concurrent skillshot casts. Telegraph spawn locations and reject spawns within a configurable safety radius of the player. Tune spawn rate from observed clear times rather than simply accelerating the alpha's endless timer. Win at ten kills; die at zero HP; stop processing immediately after the terminal result.

ADC HUD/results: HP, kills/10, elapsed time, autos released/hit, cancelled windups, and damage taken split into contact/skillshot. Do not reuse the alpha's inaccurate 'dodged' total as an ADC skill score. Keep the first result screen factual; add attack uptime or a composite score only once its definition is tested. Restart resets all mode-specific state and counters.

## Verification and delivery

Add small deterministic gameplay tests for attack cancellation before/after release, cooldown/cancel spam, moving chase targets, target death in flight, attack-range boundaries, four-hit enemy death, contact cooldown, pause/restart, and simultaneous win/death resolution. Test fast skillshot collision with swept segment checks in ADC to prevent low-FPS tunneling. Run attack timing and damage scenarios at 30/60/120 FPS; use a fixed/substepped ADC simulation if needed without changing Dodge's simulation.

Browser-test movement→A+click→release→move repeatedly, ranged approach/retreat at walls, mixed casts, death, ten-kill completion, retry, and Dodge→ADC→Dodge. Check console errors, asset requests, resize/coordinate mapping, and hidden-tab return. Record observed results and remaining balance problems; do not equate static inspection or reference-import CI with gameplay validation.

Deliver incremental commits: (1) isolated mode + Tristana/one pursuer, (2) reliable attacks and feedback, (3) mixed roster and ADC-only caster variants, (4) encounter tuning/results/regression evidence. Update `docs/PROGRESS.md` after each playable milestone with commit links, actual tests, blockers, and three next actions. Preserve this plan's baseline/source mismatch until resolved. Do not mark ADC complete until a browser-tested full run and Dodge regression pass exist.

## Progress checklist

- [x] Astra inspected repository instructions, required docs, and main source; authored this implementation plan.
- [ ] Locate the user's newer local/deployed Dodge source and reconcile it with GitHub before integration. Do not blindly implement against the stale alpha or replace actual Dodge; an isolated prototype is acceptable while source reconciliation remains open.
- [ ] Record runnable Dodge baseline and select the correct implementation branch.
- [ ] Implement isolated ADC mode, Tristana presentation, reliable A-attacks, and one pursuer.
- [ ] Integrate verified Dodge skillshots through ADC-only variants and ranged behavior.
- [ ] Tune a complete ten-kill challenge and factual results.
- [ ] Pass deterministic checks, full browser run, and Dodge regression; publish evidence and handoff.

## Terra starter prompt

> Implement ADC Mechanics God following `AGENTS.md`, `PROJECT_BLUEPRINT.md`, `docs/ADC-PLAN.md`, and `docs/PROGRESS.md`. First reconcile the user's actual newer Dodge source with GitHub: the inspected main baseline has no champion roster or Syndra implementation. Preserve the actual Dodge mode and do not replace it with the stale alpha. Then deliver the smallest playable isolated ADC slice: Tristana, existing A-attack gesture with correct windup/cancellation/release, durable pursuing enemies, and heavy timed contact damage. Continue through mixed skillshot/ranged enemies and a ten-kill run using this plan. Make ADC-specific variants without changing Dodge, test in a browser and at multiple simulation rates, and keep GitHub progress and commit links accurate. Treat proposed numbers as tunable; do not claim completion or reuse of missing champion code.
