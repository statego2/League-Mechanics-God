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

- **Dodge Trial:** survive 60 seconds of Lux Q and Ezreal Q projectiles. Their values are scaled approximations and include Lux root; the aim line is a training aid.
- **Kite Arena:** defeat 10 enemies using movement, autos and abilities.
- **Last-Hit Lab:** practice Ahri autos against two six-minion waves (12 possible CS). Allied minion attacks are still scripted approximations.

The default player uses level-1 Ahri's attack timing, base AD, health and scaled movement/projectile speed. Q, W, E and R are initial Ahri-inspired implementations; the visual sprite remains a prototype design. Q/W/E are disabled in the auto-attack-only CS drill. Legacy drills remain in the code for regression coverage but are not offered in the menu.

Optional synthesized combat cues are disabled by default. Use **SOUND OFF / ON** to toggle them; no audio files or external service are required.

## Controls

| Input | Action |
|---|---|
| Right mouse button | Move; click enemy to attack; hold and drag to retarget |
| A, then left-click | Attack move toward cursor / nearest target |
| Left-click enemy | Chase and auto attack |
| Q | Orb: magic damage outbound, true damage on return |
| W | Fox-Fire: temporary movement speed and homing flames |
| E | Charm the first enemy hit |
| R | Spirit Rush: dash and recast up to twice |
| F | Flash |
| S | Stop / cancel current attack |
| P or Escape | Pause |
| T or Restart button | Instantly restart the current drill with the same seed |

## Implementation

Vanilla HTML5 Canvas + JavaScript + CSS, no third-party libraries and no copied game assets. This is a first **alpha** playable prototype. It is not yet equivalent to the attack timing, animation states, exact damage or collision rules of League of Legends.

The painted mid-lane-inspired arena is a visual approximation. Two marked stone walls block movement; the rest of the river, rocks and foliage are decorative. Clicks route around the walls, Dash stops at them, and Flash can cross them if it lands in a walkable location. Projectiles currently pass through walls.

## Repeatable encounters

Choose Foundation, Standard or Expert before entering a drill. Restart reuses the seed; the seed button changes the next run. Dodge Trial alternates Lux and Ezreal shots, with visible training telegraphs. Results store local records in this browser; unavailable storage does not prevent play.

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
