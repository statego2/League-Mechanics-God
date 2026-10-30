# Laning opponent decision policy

Standalone, dependency-free ES module. It does not implement a mode, minion combat, pathfinding, damage, projectile collision, champion stats or cooldowns. Numbers in the demo are synthetic, not League data. Research PR #1 is a research handoff; its historical champion extracts are not a current configuration.

## Integration contract

`createLaningOpponent({ reactionDelay: 0.2, spacing: 0.85, tradeMargin: 1.2, baitInterval: 5 })` returns `{ decide(state), reset() }`. Call once per fixed simulation tick with monotonic `time` in seconds; `reset()` at a new match. Input is copied into a delayed observation buffer. Reaction delay must be positive. The first observation is actionable only after that delay. Use a fixed tick and a stable snapshot ordering for deterministic behavior.

```js
const state = {
  time: 1, // seconds; all positions, speeds and ranges use the same engine scale
  self: { alive: true, position: {x: 0, y: 0}, radius: 10, committed: false,
    attack: {ready: true, range: 150, windup: .25, projectileSpeed: 600, damage: 50},
    abilities: [{id:'Q', ready:true, range:250, damage:70, lineClear:true}] },
  player: {id:'player', alive:true, visible:true, position:{x:120,y:0},
    windingUp:true, exposed:false, threatReady:true},
  minions: [{id:'m1', team:'player', visible:true, alive:true, position:{x:80,y:0},
    health:40, value:1, incoming:[{visible:true, eta:.1, damage:10}]}],
  skillshots: [{visible:true, position:{x:100,y:0}, velocity:{x:-100,y:0}, radius:10}],
  tradeValue: 30, tradeRisk: 10
};
const action = brain.decide(state);
```

`team:'player'` means minions allied to the human and attackable by the bot. `incoming` contains only visible already-launched attacks, with estimated time-to-impact relative to that snapshot and estimated post-mitigation damage. `attack.damage` is estimated post-mitigation damage for the target class; use conservative estimates or adapt the interface for differing target armor. `value`, `tradeValue`, and `tradeRisk` share a utility scale; risk should include estimated retaliation. `windingUp`, `exposed`, `threatReady`, and `lineClear` must derive from visible/inferred information only. Use `lineClear:false` for unknown or blocked shots. Never pass hidden future orders, RNG, or future attack schedules. IDs must be stable; invisible entities should be omitted or marked invisible.

Output is one of `hold`, `move` (`destination`), `attack` (`targetId`), or `cast` (`abilityId`, `targetId`, locked `aim`), with a diagnostic `reason`. Movement targets are requests, not teleports; the engine must clamp/pathfind and validate terrain. The engine is authoritative: revalidate range, visibility, target life/team, line of fire, mana, cooldowns, cast/attack phases and all other rules when consuming **every** request. Reject stale or impossible requests; a cast locks aim at the delayed observed position and cannot track the player. Do not restart a committed animation on every tick. The module checks immediate readiness, range and visibility as a safety layer, but cannot know engine-specific rules. Supply an immutable public snapshot, not private engine state.

The policy predicts last-hit health only from already-visible incoming shots, weighs trade utility against CS value, backs away when close, approaches when favorable, and occasionally makes a small bait approach. It dodges straight visible projectiles with a limited horizon; no perfect path safety or collision prediction is claimed. Dodge endpoints require engine validation. Bait is a heuristic, not a learned opponent model. No actual combat, fairness calibration, full lane integration or human playtest is claimed.

Run `node --test modules/laning-opponent-ai/*.test.mjs` and `node modules/laning-opponent-ai/demo.mjs`. The demo prints deterministic mock decisions and does not simulate combat.
