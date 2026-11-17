# ADC Mechanics God — generic pursuers, surrounding spells, full Tristana

**Authoritative revision: 17 November 2026.** This replaces the previous champion-as-target / autos-only plan in full. The user asks to change the design; this revision makes no gameplay changes. Preserve Dodge exactly.

## Experience

Control recognizable Tristana in the existing second mode. Generic durable enemies approach and must be killed through repeated attacks, positioning and Tristana's whole kit. At the same time, independent Dodge-family skills arrive from different directions around the arena. Killing a generic enemy does not switch off this external spell pressure.

There are two independent systems: **targets to kite** and **surrounding hazards to dodge**. Do not turn the targets back into Ezreal/Lux/Syndra champions, stand-off casters or a champion combat arena. Temporary source effects or actors may appear only where necessary to read a spell; they have no targetable health bar, kill reward or persistent enemy slot.

Keep the existing arena and recognizable Tristana art, autos, A + click, right-click movement/attack, S stop, Q/W/E/R, F Flash, pause and instant retry. The full ability bar must be usable like Ahri's in Dodge, with Tristana's own names, effects and cooldowns. Reuse the interaction conventions, not Ahri's ability behavior. Proposed default remains continuous survival until death; ten kills is a verification milestone, not a forced win. Do not add inventory, another mode or a general engine rewrite.

## Current source and evidence

Continue from `codex/adc-mode`; committed HEAD at this audit is `e237a97`, with substantial **uncommitted** implementation, tests and evidence already present. Preserve all of it. Inspect actual HEAD/status before proceeding; neither old `main` nor a clean checkout of HEAD represents the full current working state.

The local working copy already contains `updateAdcAmbient`, generic enemy handling, `ADC_KIT`, `castAdc`, `adcDamageAndStack`, `adcExplode`, `adcJumpLand`, `adcKnockEnemy` and revised rendering. The previous documents only prepended a correction and retained contradictory instructions below it; this document replaces those instructions. Audit the local implementation against the contract here rather than rebuilding completed work.

The existing progress log reports focused checks and bot runs for the corrected mode. Those reports are retained as historical evidence, not independently rerun in this planning pass. Final full regression, full-kit fidelity, visual review and user acceptance remain open. A function name or four enabled buttons is not proof of a complete kit.

## Generic enemy loop

- Use readable neutral enemy silhouettes with HP bars, not named champions. Start with one durable pursuer type; cosmetic variants must not conceal different rules.
- Proposed initial baseline: 112 HP, 28 base auto damage, speed 185, and 40 contact damage with .75s per-enemy cooldown. Existing numbers are training values, not live League stats. Four base autos kill an ordinary target; abilities can shorten this.
- Enemies pursue, route around walls and separate. They do not fire the surrounding spells. Keep safe spawning with a short local spawn effect; no spawn on top of the player or immediate contact hit.
- Start with two enemies, ramp toward three/four using elapsed time and replace deaths continuously. Avoid kill-gated mechanics and ID-modulo composition. Numbers are tunable after real play.
- Contact is dangerous but cannot damage every frame. Define shared brief grace after forced displacement so stacked pursuers do not produce an unavoidable instant death. Preserve meaningful danger after the recovery window.
- Generic enemies are the targets for autos, E and R, and receive W landing damage. E splash, R displacement and W resets must matter in packs.

## Surrounding skill pressure

Use a separate ADC-owned scheduler, cast IDs and lifecycle state. Sample varied peripheral origins outside immediate contact distance, preferably on/near the visible arena boundary; do not spawn a projectile directly beside Tristana merely to satisfy a timer. Lock aim at the documented cast moment. Preserve projectile travel, speed differences, returns, splits and impact shapes.

Introduce an ordinary incoming skill within roughly 3–5 seconds at zero kills while generic enemies already approach. Continue casting regardless of enemy kills. First use line skills, then add complex patterns over time. Keep a weighted bag and avoid repeated same-side ambushes; not every family needs to appear in every short life.

| Spell family | Required ambient behavior |
| --- | --- |
| Ezreal Q / Lux Q | Distinct visible projectiles emitted from peripheral positions; no targetable Ezreal/Lux bodies. |
| Ahri Q | Outbound and return pass; fixed source anchor survives independently of generic targets. |
| Blitz Q | Visible hook and tether to its temporary source; bounded pull and contact recovery. |
| Vel'Koz Q | Main missile and perpendicular split; children retain one cast ID/budget. |
| Xerath Q/W / Lux R | Beam or ground-impact families, with native cast effects and honest damage timing; no extra trajectory overlay. |
| Syndra Q / Q→E | One sphere placement, optionally followed by its push; never a required two-Q cycle. Source is a temporary effect/actor, not an enemy to kill. Preserve readable sphere formation and E wave. |
| Orianna Q→R | Visible ball travel followed by shockwave around the ball; independent of generic target deaths. |
| Malphite R | Readable incoming dash/impact actor, disappearing after recovery; not a persistent champion target. |
| Cassiopeia R | Brief readable source/orientation for the turn-away response. Never an invisible orientation test; no targetable champion body. |

Keep all existing Dodge families in scope, but adapt their source/lifetime to this independent system. Start at no more than two ordinary live casts; a complex/displacing event occupies the budget alone until its recovery ends. Count return passes and split children through their full lifetime. Evaluate danger including approaching enemies and terrain. Suppress unsafe casts instead of drawing a guaranteed-safe route. Autonomous sampling is not proof of universal fairness.

Enemy deaths, E explosions and R kills do **not** cancel unrelated ambient casts. Ambient actors never receive autos/E/R or grant kills, splash chains or W resets. Pause freezes both systems; retry, player death and mode switch clean both up.

## No predictive skill lines

The user rejects the helpful lines that reveal where a skill will travel. They were training telegraphs, not the projectile itself. Remove ADC-only future-trajectory lines, dashed aim rays, long translucent path strips, safe-route overlays and debug hitbox guides from normal play. Do not replace them with another equally predictive corridor.

Keep the actual visible missile, hook tether after launch, sphere, ball, beam during its real cast/fire effect, impact/explosion, and short source windup animation. Native ground formation or cast effects can remain where they are part of the skill; do not add an oversized generic warning shape. Attack-range display while A is armed is a player-control aid, not an enemy trajectory preview.

For each beam/AoE distinguish native cast effect from an extra teaching overlay in code and evidence. Removing all information before an instantaneous invisible hit is not acceptable. If a pattern becomes unreadable, give it a source animation, travel time or ADC-only cast delay instead of restoring trajectory lines. Capture pre-release and released frames for verification. Preserve all Dodge visuals exactly.

## Complete Tristana kit contract

The owner explicitly supersedes the old autos-only restriction. Implement and verify the entire kit and its interactions, not four unrelated approximate attacks.

[Riot's PC Tristana page](https://www.leagueoflegends.com/en-us/champions/tristana/) establishes Draw a Bead, Rapid Fire, Rocket Jump, Explosive Charge and Buster Shot. Before claiming PC accuracy, pin a PC patch/data reference and verify detailed timing, ranks, ranges, costs, stack triggers and reset rules. Do not use Wild Rift mechanics as authority for PC. The following is the training implementation contract; numerical values remain tunable and any deliberate deviations must be documented.

| Part | Required behavior / visible feedback | Verification |
| --- | --- | --- |
| Passive — Draw a Bead | Represent range scaling through a documented fixed training level and corresponding range profile. No XP system required. Do not mislabel E's on-kill splash as the entire passive. | One consistent converted range convention for acquisition, chase, release, E/R targeting and range UI; document any ability-specific difference. |
| Q — Rapid Fire | Temporary attack-speed increase with visible duration and cooldown. Integrate windup/recovery timing without duplicating shots, resetting the ready timer to exploit casts, or cancelling already released autos. | Compare normal/Q cadence at 30/60/120 rendered FPS; activate/expire during windup, movement and attack recovery. |
| W — Rocket Jump | Cursor-targeted jump with visible airborne arc, bounded range and valid landing; landing area damage/slow and E interaction. Verify the PC takedown/full-charge reset rules and deliberately map qualifying generic kills for this trainer. | Walls/edges, invalid point, landing hit once, slow expiry, W→E stacks, kill/full-charge resets; no reset from ambient actors and no undocumented invulnerability. |
| E — Explosive Charge | Targeted bomb with visible timer and 0–4 stacks; eligible autos/abilities build the charge, full stacks trigger the explosion, timeout detonates remaining charge, area damage and on-kill splash work. | Separate E passive splash from Draw a Bead. Define application versus first stack, exact eligible W/R/auto hits, early death, four-stack detonation and recursive pack kills. No duplicate explosion/reset or passive-splash stack loop. |
| R — Buster Shot | Targeted cannon shot with clear release/impact, damage and knockback; interact correctly with E stacks and explosion ordering. Verify adjacent-unit displacement rules against the pinned PC reference. | Target dies mid-action, E fourth stack, wall-clipped displacement, pack interaction, no through-wall trapping, exactly one damage/stack application. |
| F — Flash | Preserve the familiar cursor-based escape with coherent interaction with W, displacement and casts. | Range, cooldown, valid terrain, restrictions and mode reset. |

Before coding fixes, write the small `ADC_KIT` reference table with chosen training level/ranks, all values/units, source or explicit approximation, resource policy, target rules and cast/impact ordering. Default to a fixed profile; if mana is omitted for this trainer, state that clearly rather than claim exact League equivalence. Use the existing input/cooldown HUD patterns. E/R target the hovered valid generic enemy; invalid/out-of-range use must not silently spend cooldown. Q/W/E/R must not mutate Ahri's kit or Dodge's controls.

Key acceptance sequence: **E → Q → autos while kiting → four-stack explosion → W reset/reposition**, plus **W landing adds eligible E progress**, and **R knockback/E interaction creates space**. Test these using real inputs and moving enemies, not just direct function calls.

## Isolation and implementation order for Terra

1. **Audit current working state.** Preserve uncommitted gameplay, tests, captures and unrelated files. Read latest progress and identify already implemented parts versus the contracts above. Record current build and a same-seed Dodge baseline. Do not restart at the old rejected prototype.
2. **Lock the two-system encounter.** Verify only generic enemies are targetable, spells arrive independently before any kill, no predictive lines remain, native effects stay readable, and kills cannot cancel ambient casts. Fix concrete mismatches in ADC-only paths.
3. **Complete the kit.** Audit existing `ADC_KIT`/cast/stack/reset helpers against a pinned PC reference, add missing passive/profile and interactions, and implement the full HUD/resource policy. Prioritize E/Q/W/R interaction bugs over cosmetic roster expansion.
4. **Balance combined play.** Normal-HP real-time runs must require moving/attacking and use meaningful QWER choices. Tune generic durability, contact, spell intervals and recovery together. Test corners and large E kill chains. No general Dodge retuning.
5. **Verify and hand off.** Focused meaningful tests per change, final full regression, actual browser captures and input runs, updated build/progress and reviewable commits. Do not merge/deploy using historical Dodge authorization.

No changes to Dodge's constants, director, visit cadence, aim, hitboxes, HP, controls, records, art or shared spell objects. Clone configs. Do not set fake `dodgeVisitor`/`dodgeDirector` state. Preserve neutral shared helpers' existing behavior; route ADC ownership/lifecycle separately. Do not globally disable telegraphs or remap Ahri abilities.

## Completion evidence

- Current browser build and local asset loading verified; actual-scale recognizable Tristana, generic targets, visible incoming skills and full usable ability bar.
- Pre-launch screenshots show no predictive path lines; released frames show each spell family. Capture the same distinction for beams/AoEs and the directional Cassiopeia source.
- Real mouse/keyboard, normal HP: opening with zero-kill spell pressure, sustained kite+QWER run through at least ten kills without forced finish, death/retry, pause/focus loss, resize and Flash. Read-only instrumentation is allowed; invulnerability/injected orders do not replace this evidence.
- Focused tests cover independent emitter lifetime, untargetable actors, contact/recovery, cast budgets and all kit interactions above. Reuse current scripts and tests rather than assuming older snapshots still apply.
- After runtime changes: `node --check game.js`, `node scripts/update-build.cjs`, final `node --test tests/*.test.cjs` using Node 22+, and same-seed Dodge trace comparison plus Dodge→ADC→Dodge browser regression. Compare render output if shared rendering changed.
- Record exact commits/builds, actual checks, remaining limitations and three next actions in `docs/PROGRESS.md`. Previous champion-target evidence remains historical; do not relabel it as evidence for this design.

Done requires the requested two-system encounter and full interacting Tristana kit. Tests and screenshots support review; the user's judgement of feel and presentation remains pending until actually received.
