# League Mechanics God

An original, lightweight **browser-based LoL-style mechanics trainer**. No Unity, build step, backend, or install required.

## Play

Open `index.html` from a local web server:

```bash
git clone https://github.com/statego2/League-Mechanics-God.git
cd League-Mechanics-God
python3 -m http.server 8080
```

Visit **http://localhost:8080**.

For a public URL, enable **GitHub Pages** in the repository Settings → Pages → Deploy from a branch → main / (root). Your URL should then be **https://statego2.github.io/League-Mechanics-God/** after GitHub publishes it. Do not assume Pages is enabled until verified.

## Modes

- **Dodge Trial:** survive 60 seconds of enemy skillshots. Track damage and dodges.
- **Lux Q / Ezreal Q Dodge:** survive 60 seconds against a stationary caster. Q projectiles use approximate scaled rank-1 cast, range, speed, width and damage against level-1 Ahri defenses; Lux roots for 2 seconds. Right-click to move, F to flash. A visible aim line and a fixed 3.5-second firing interval are training aids. No minion interception, accurate champion collision size, real cooldown or full ability effects yet; difficulty does not alter these two reference drills.
- **Kite Arena:** defeat 10 enemies using movement, autos and abilities.
- **Lane Scenario:** farm five waves while one enemy attacks; avoid skillshots and trade using all abilities. Results distinguish CS, misses, enemy defeats and damage.
- **Bait → Dodge → CS:** enter the moving enemy’s threat ring to draw a locked skillshot, evade it and last-hit a minion during the 3-second window while an ally damages it. Three rounds track baits, dodges, CS and damage. Q/E/R are disabled; W/F remain available.
- **Skillshot Lab:** aim Q at moving targets for 45 seconds; results show hits, shots and accuracy. W/F reposition.
- **Last-Hit Lab:** time auto attacks (28 damage by default; 53 in the experimental Ahri CS profile) across 5 minion waves (15 possible CS). Allied caster projectiles damage minions; only your killing blow earns CS. Gold health bars mark last-hit range. Q/E/R are disabled in this drill; W/F remain available.

Optional synthesized combat cues are disabled by default. Use **SOUND OFF / ON** to toggle them; no audio files or external service are required.

## Controls

| Input | Action |
|---|---|
| Right mouse button | Move; click enemy to attack; hold and drag to retarget |
| A, then left-click | Attack move toward cursor / nearest target |
| Left-click enemy | Chase and auto attack |
| Q | Bolt |
| W | Dash |
| E | Pulse |
| R | Volley |
| F | Flash |
| S | Stop / cancel current attack |
| P or Escape | Pause |
| T or Restart button | Instantly restart the current drill with the same seed |

## Implementation

Vanilla HTML5 Canvas + JavaScript + CSS, no third-party libraries and no copied game assets. This is a first **alpha** playable prototype. It is not yet equivalent to the attack timing, animation states, exact damage or collision rules of League of Legends.

The painted mid-lane-inspired arena is a visual approximation. Two marked stone walls block movement; the rest of the river, rocks and foliage are decorative. Clicks route around the walls, Dash stops at them, and Flash can cross them if it lands in a walkable location. Projectiles currently pass through walls.

## Repeatable encounters

Choose Foundation, Standard or Expert and an attack speed (Ahri level-1 timing at 0.668, or 0.80, 1.39 or 2.00 attacks per second). The Ahri option changes attack cadence and windup in every drill. In Last-Hit Lab it also enables an experimental level-1 Ahri CS profile: 53 auto damage, 465-health / zero-armor melee targets, 330 movement speed and 1750 auto missile speed scaled to the canvas. Allied damage and wave timing are training approximations; range, abilities, runes and items are not fully modeled before entering a drill. Restart reuses the same seed, so the same inputs produce the same encounter; the seed button changes the next run. Enemies lock their aim during a visible warning before firing line/fan missiles. Dodge Trial also includes delayed circular ground impacts and telegraphed sweeping walls with a marked safe gap. Move out before the ring fills or into the gap before the sweep arrives.

Results store a local best for each drill, difficulty and attack-speed preset in this browser; Kite Arena prioritizes a completed run and the fastest winning time. Unavailable storage does not prevent play.

## Mechanics and checks

Right-click orders chase a moving target until it enters the 275-unit attack range. A + click keeps an attack-move order active while travelling, selecting an in-range enemy nearest the clicked point. Moving before the gold windup ring completes cancels the attack; after release you can move during recovery. Auto projectiles track their selected target. The ring shows when the next attack is ready.

Dodges count only resolved enemy missiles whose trajectory threatened your hurtbox within 0.8 seconds. Pulse blocks and invulnerability contacts are counted separately in results. Simulation uses a fixed 120 Hz step and swept collision. Losing window focus automatically pauses.

Run the dependency-free gameplay regression checks with Node 22+:

```bash
node --test tests/*.test.cjs
```

## Next improvements

Additional lane scenarios; further enemy patterns; accessibility; cross-browser tuning.

Independent fan-made practice project, **not affiliated with or endorsed by Riot Games**.
