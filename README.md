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
- **Kite Arena:** defeat 10 enemies using movement, autos and abilities.
- **Skillshot Lab:** aim Q at moving targets for 45 seconds; results show hits, shots and accuracy. W/F reposition.
- **Last-Hit Lab:** time 28-damage auto attacks across 5 minion waves (15 possible CS). Allied caster projectiles damage minions; only your killing blow earns CS. Gold health bars mark last-hit range. Q/E/R are disabled in this drill; W/F remain available.

## Controls

| Input | Action |
|---|---|
| Right mouse button | Move; click enemy to attack; hold and drag to retarget |
| A, then left-click | Attack move toward cursor / nearest target |
| Left-click enemy | Auto attack (when in range) |
| Q | Bolt |
| W | Dash |
| E | Pulse |
| R | Volley |
| F | Flash |
| S | Stop / cancel current attack |
| P or Escape | Pause |
| Restart button | Restart current mode |

## Implementation

Vanilla HTML5 Canvas + JavaScript + CSS, no third-party libraries and no copied game assets. This is a first **alpha** playable prototype. It is not yet equivalent to the attack timing, animation states, exact damage or collision rules of League of Legends.

## Repeatable encounters

Choose Foundation, Standard or Expert before entering a drill. Restart reuses the same seed, so the same inputs produce the same encounter; the seed button changes the next run. Enemies lock their aim during a visible warning before firing line/fan missiles. Dodge Trial also includes delayed circular ground impacts. Move out before the ring fills.

Results store a local best for each drill and difficulty in this browser; unavailable storage does not prevent play.

## Mechanics and checks

Right-click orders chase a moving target until it enters the 275-unit attack range. A + click keeps an attack-move order active while travelling, selecting an in-range enemy nearest the clicked point. Moving before the gold windup ring completes cancels the attack; after release you can move during recovery. Auto projectiles track their selected target. The ring shows when the next attack is ready.

Dodges count only resolved enemy missiles whose trajectory threatened your hurtbox within 0.8 seconds. Pulse blocks and invulnerability contacts are counted separately in results. Simulation uses a fixed 120 Hz step and swept collision. Losing window focus automatically pauses.

Run the dependency-free gameplay regression checks with Node 22+:

```bash
node --test tests/game.test.cjs
```

## Next improvements

Skillshot prediction and bait/dodge/CS drills; audio; local records; further enemy patterns; accessibility; cross-browser tuning.

Independent fan-made practice project, **not affiliated with or endorsed by Riot Games**.
