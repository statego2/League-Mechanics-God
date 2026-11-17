# Development handoff

For code-specific gap analysis, implementation contracts, tests and ranked tasks, use [ENGINEERING_SPEC.md](ENGINEERING_SPEC.md). This guide is a short data-access overview.

Do not load `historical/` as a live config. Fetch JSON files relative to the application's deployment base, select `champions.Ahri` or `champions.Tristana` from `riot-roster.json`, then read `.stats.movespeed.value`, `.stats.attackrange.value`, `.stats.attackspeed.value`, `.stats.attackdamage.value`. Overlay only reviewed entries from `featured.json`; explicit source records include metadata and are not bare numbers. `null` means unavailable; fail closed or use an explicitly marked training approximation. Avoid overwriting current gameplay defaults until testing and product-policy review are complete.

Recommended order:
1. Use one world-unit scale consistently: movement is units/second, range and widths are units. Convert to canvas pixels only at rendering/input boundaries. Respect edge-range versus center distance and separate gameplay and pathing radii.
2. Implement attack orders as approach → windup → launch → recovery; calculate interval from attack speed, cancel only before launch, retain an already fired projectile. For baseline Ahri 0.2 / 0.668 ≈ 0.2994 seconds is a useful initial windup check; generalized windup modifiers are not established. Attack-move selection and buffering must remain configurable pending evidence.
3. Add both teams' minion entities and timed impacts, target priorities and first-wave rules, then deterministic waves and upgrades. The recorded 2026 schedule is not the old 1:05 start. Simulate wave advantage through actual unit combat rather than prescribing push or bounce results. Test timings around 14 and 30 minutes and cannon exceptions.
4. Resolve each projectile impact against current health and resistance; credit the killer, nearby XP recipients, CS, missed CS and gold as separate events. Track damage attribution and the documented death grace. Predict HP by ordering pending impacts, while acknowledging that target changes make forecasts uncertain. Do not derive last-hit damage from visuals.
5. Model turret shot acquisition, launch, flight and impact independently. Use the cited siege/super pre-mitigation max-health rules only with appropriate turret type; melee/caster/turret timings and other special interactions are open. Avoid fixed universal shot-count advice.
6. Tristana Q is a 7-second attack-speed buff, not a fixed number of attacks; use base AS + ratio × bonus fraction with caps and modifiers once validated. Q's patch 26.21 values changed. Ahri Q needs separate outbound/return hit sets and a moving return target. Model E and R, Tristana E stack and W reset only after missing timing and attribution rules are resolved.
7. Generic skillshots need cast, travel, collision, impact, recast and expiry phases, continuous swept collision, blocker categories, and explicit width-to-radius conversion. Blitz Q terminal geometry and Vel'Koz split are special cases; don't force both into a single straight bullet. Separate spell interception from player dodge scoring.
8. For every patch, archive source files and hashes, regenerate the roster, compare changes, inspect Riot notes and current wiki, invalidate old manual values, then rerun tests and targeted in-client observation. Never infer that Data Dragon's release number authenticates an unrelated live wiki page.

Example baseline calculations (no items/runes, simplified and not a full attack implementation):

```js
const roster = await (await fetch('./research/lol-data/champions/riot-roster.json')).json();
const ahri = roster.champions.Ahri.stats;
const secondsPerAttack = 1 / ahri.attackspeed.value;
const baselineWindupSeconds = secondsPerAttack * 0.20;
const unitsPerSecond = ahri.movespeed.value;
// Canvas radius is derived from a full gameplay width, not the width itself.
const missileRadiusPixels = 200 / 2 * pixelsPerWorldUnit;
```

All integration behavior, mock assumptions, legal/product review and real-client comparisons remain the responsibility of the game development session.
