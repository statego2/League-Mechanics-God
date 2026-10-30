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

## Product vision: four main modes (planned)

The finished **League Mechanics God** is intentionally focused on **exactly four challenging, continuous experiences**, rather than separate minigames for every skill:

1. **Dodge Gauntlet** — intense continuous skillshot avoidance, especially frequent Ezreal Q and rare Malphite R; champion casts, returning Ahri Q, split Vel'Koz Q, ambient Xerath Q/W.
2. **Mechanics Arena — Combat Survival** — solo player versus **many hostile champions simultaneously**, with full champion kit, combos, dodge, kite, targeting and Flash. No allied champion bots or scripted training steps.
3. **CS Mastery** — one continuous pure minion-farming lane. As minions move naturally into a correctly implemented turret, under-turret CS belongs **inside the same mode**.
4. **Mid Lane Mastery** — one extremely hard 1v1 lane with a bot that genuinely farms, tries to poke on your CS commitments and can itself be punished when farming. Bait, dodge, CS and poke happen organically in one lane.

**Design documentation:** [Project Blueprint](PROJECT_BLUEPRINT.md), [Four-mode Vision](docs/MECHANICS_ACCELERATOR_VISION.md), [Dodge Rhythm](docs/DODGE_GAUNTLET_RHYTHM.md), [Combat Survival](docs/MECHANICS_ARENA_DESIGN.md) and [Mid Lane Mastery](docs/MID_LANE_MASTERY_DESIGN.md).

### What is actually playable today (alpha)

- **Dodge Trial:** current 60-second approximation with Lux Q / Ezreal Q projectiles; this is the unfinished foundation for Dodge Gauntlet.
- **Kite Arena:** movement, autos and abilities against enemies; this is **not yet** the approved solo-versus-many Combat Survival experience.
- **CS Practice:** farm with Ahri across 20 waves over up to ten minutes (126 possible CS), with cannon on every third wave. Two-sided combat, wave placement, attack behavior and late minion stats remain approximations; turrets and upgrades are not yet implemented. This is the unfinished foundation for CS Mastery.

**Mid Lane Mastery is not yet implemented.** Other earlier prototypes (Skillshot Lab, Bait → Dodge → CS, basic Lane Scenario) may remain in source for regression testing but are **not additional planned public menu modes**.

The default player uses an approximate level-1 Ahri profile. Q, W, E and R are early Ahri-inspired implementations; current auto-only CS disables Q/W/E/R as documented in-game. Original art and simplified lane geometry are not claims of full LoL accuracy. Optional synthesized combat cues start disabled.

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

The painted mid-lane arena is a visual approximation based on a user-provided gameplay screenshot; it is not the actual Rift geometry. Two approximate collision regions block movement; their outlines are hidden and may not match the art exactly; the rest of the river, rocks and foliage are decorative. Clicks route around the walls, Dash stops at them, and Flash can cross them if it lands in a walkable location. Projectiles currently pass through walls.

## Repeatable encounters

Choose Foundation, Standard or Expert before entering a drill. Restart reuses the seed; the seed button changes the next run. Dodge Trial alternates Lux and Ezreal shots without drawing their aim lines; watch the enemy cast and launched missiles. Its separate synthetic sweep retains a visible safe-gap warning. Expert is selected by default. Results store local records in this browser; unavailable storage does not prevent play.

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
