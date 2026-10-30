# Dodge Gauntlet — experimental vertical slice

This is a standalone **prototype**, not a finished, fairness-validated Gauntlet. From the repository root run `python3 -m http.server 8000`, then visit `/modules/dodge-gauntlet/`. Right-click to move, F flashes toward the cursor, R restarts, and the seed field determines the next restart. Run `node --test modules/dodge-gauntlet/engine.test.mjs`.

## Integration contract

Import `DodgeEngine` from `engine.mjs`. World coordinates and sizes are LoL-like units, not canvas pixels. Construct with `{seed, width, height, director}`; call `moveTo(x,y)`, `flash(x,y)`, and `step(1/120)` from the host's **existing** fixed simulation loop. Read `player`, `active`, `finished`, and `stats` for rendering and results. `cast(type, source, aim, {ball})` permits host-authored encounters; `blockers` is an array of `{id,x,y,radius}`. The demo alone owns requestAnimationFrame and applies the existing game's 0.5 canvas units per world unit. Do not run its loop inside the host. This is an experimental interface, not yet a drop-in integration: its player, hit handling and collision state must be adapted to the host and the engine currently owns its own movement.

## Fidelity and sources

Reference context: research PR #1, patch label 16.21.1; [Riot Data Dragon versioning](https://developer.riotgames.com/docs/lol). Numeric projectile data are community-reported rather than Riot-verified simulation values: [Ezreal](https://wiki.leagueoflegends.com/en-us/Ezreal) Q 0.25 s, 1200 range, 120 width, 2000 speed, first target; [Lux](https://wiki.leagueoflegends.com/en-us/Lux) Q 0.25 s, 1300 range, 140 width, 1200 speed, two targets, 2 s root; [Ahri](https://wiki.leagueoflegends.com/en-us/Ahri) Q 0.25 s, 900 range, 200 width, 1550 outbound, separate hits on each pass. [Blitzcrank](https://wiki.leagueoflegends.com/en-us/Blitzcrank) Q 0.25 s, 1080 range, 140 width, 1800 speed, first target (the PR's `research/lol-data/skillshots/abilities.json`). The live wiki is mutable and cannot establish an immutable patch-specific value; treat the patch label as research context, not proof that current live pages match that patch.

## Known deviations and limitations

- This is **not ready for integration or merge**. Fairness is not verified: there is no reachability solver, obstacle-aware scheduling, safe-route guarantee, adaptation, per-caster cooldowns, feints, moving enemies, or full phase/rhythm implementation. Angles and weighted choices are seeded, but choices depend on player state and duration. Rare timers are preliminary.
- Vel'Koz Q is currently a straight placeholder **without split**. Xerath Q is an instant line after a synthetic warning; W is a simple circle. Orianna's ball is stationary, and Malphite is an indicated circle, not a dash. Blitz pull teleports to the source and lacks flight/stun/terminal geometry. These are not faithful implementations. Ahri return uses a constant 2000 speed instead of acceleration and does not track a moving caster. Lux two-target collision is supported for static blockers but the demo has none.
- A 0.55 s synthetic pre-cast warning precedes each cast; it is not LoL cast time. Damage is a fixed training estimate, not a complete rank/stats/resistance model. Player radius, Flash range/cooldown, map boundaries and visuals are approximations. Flash during root is permitted; movement remains rooted.
- Dodge qualification checks a stationary-player future path over up to 0.8 seconds, not a full counterfactual analysis. Flash attribution only records use after qualification; it does not prove Flash caused the dodge. Combination counting is cast-level overlap, not validated survival of a complete encounter. AoE qualification during telegraph can overcount harmless visits. Per-spell data are exposed in `stats.byAbility`, but the demo results do not yet show them. A hit occurring on an Ahri pass counts as a hit even if the other pass was dodged.
- No comprehensive multi-minute playtesting, benchmark, regression guarantee, accessibility audit, or mobile support has been established. The demo drops accumulated wall time above 250 ms per frame to avoid runaway catch-up, so elapsed time is simulation time after long stalls. Scores are raw counters, not a calibrated rating.

## Next steps

1. Replace placeholders with tested Vel'Koz splitting and genuine Xerath, Orianna and Malphite behavior; implement visible moving casters and verified LoL timing.
2. Implement conservative time-dependent reachable-space fairness checks and validated combinations; measure actual cast rates and run 3–5 and 10–12 minute playtests.
3. Separate host-owned player/collision/scoring from the engine; improve threat, Flash and combination attribution, expose per-ability results, and test on different frame rates and browsers.
