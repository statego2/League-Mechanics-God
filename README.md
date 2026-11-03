# League Mechanics God

An original, lightweight **browser-based LoL-style mechanics trainer**. No Unity, build step, backend, or install required.

## Play

Open `index.html` from a local web server:

```bash
git clone https://github.com/statego2/League-Mechanics-God.git
cd League-Mechanics-God
python3 scripts/dev-server.py
```

Visit **http://127.0.0.1:8082/**. This local development server disables browser caching, so a refresh loads the current checkout. Pass `--port 8083` to select another port.

The published project URL is [statego2.github.io/League-Mechanics-God](https://statego2.github.io/League-Mechanics-God/). It updates only after an approved push and GitHub Pages publish; use the local server for unpushed work.

## Product vision: four main modes (planned)

The finished **League Mechanics God** is intentionally focused on **exactly four challenging, continuous experiences**, rather than separate minigames for every skill:

1. **Dodge Gauntlet** — intense continuous skillshot avoidance, especially frequent Ezreal Q and rare Malphite R; champion casts, returning Ahri Q, split Vel'Koz Q, ambient Xerath Q/W.
2. **Mechanics Arena — Combat Survival** — solo player versus **many hostile champions simultaneously**, with full champion kit, combos, dodge, kite, targeting and Flash. No allied champion bots or scripted training steps.
3. **CS Mastery** — one continuous pure minion-farming lane. As minions move naturally into a correctly implemented turret, under-turret CS belongs **inside the same mode**.
4. **Mid Lane Mastery** — one extremely hard 1v1 lane with a bot that genuinely farms, tries to poke on your CS commitments and can itself be punished when farming. Bait, dodge, CS and poke happen organically in one lane.

**Design documentation:** [Project Blueprint](PROJECT_BLUEPRINT.md), [Four-mode Vision](docs/MECHANICS_ACCELERATOR_VISION.md), [Dodge Rhythm](docs/DODGE_GAUNTLET_RHYTHM.md), [Combat Survival](docs/MECHANICS_ARENA_DESIGN.md) and [Mid Lane Mastery](docs/MID_LANE_MASTERY_DESIGN.md).

### What is actually playable today (alpha)

- **Dodge Trial:** an endless Expert-first Dodge Gauntlet foundation. It has visible champion entries for Ezreal Q, Lux Q, Blitz Q, Ahri Q and Vel’Koz Q, hidden-source Xerath Q/W, and rare Lux R, Cassiopeia R, Orianna R and Malphite R encounters. Expert also includes Syndra Q and occasional Q→E pushed spheres; their presentation and hitboxes are training approximations, and Dodge omits their immobilization. The director uses sampled walkable escapes and an Expert budget of up to four concurrent directed threats; it is still an evolving training approximation, not a claim of exact live-client parity.
- **Kite Arena:** movement, autos and abilities against enemies; this is **not yet** the approved solo-versus-many Combat Survival experience.
- **CS Practice:** farm with Ahri across 20 waves over up to ten minutes (126 possible CS), with cannon on every third wave. Two-sided combat, wave placement and attack behavior remain approximations. Melee health grows every three early waves; other minion upgrades and turrets are not yet implemented. This is the unfinished foundation for CS Mastery.

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
| T or Restart button | Instantly restart the current drill |

## Implementation

Vanilla HTML5 Canvas + JavaScript + CSS, no third-party libraries and no copied game assets. This is a first **alpha** playable prototype. It is not yet equivalent to the attack timing, animation states, exact damage or collision rules of League of Legends.

The painted mid-lane arena is a visual approximation based on a user-provided gameplay screenshot; it is not the actual Rift geometry. Two approximate collision regions block movement; their outlines are hidden and may not match the art exactly; the rest of the river, rocks and foliage are decorative. Clicks route around the walls, Dash stops at them, and Flash can cross them if it lands in a walkable location. Projectiles currently pass through walls.

## Repeatable encounters

Choose Foundation, Standard or Expert before entering a drill. Expert is the active tuning target and is selected by default. In the Ahri profile, Dodge Trial is endless: watch each enemy’s entry/cast tell and launched missile, use movement and Flash, and recover a little health after sustained clean play. The public menu deliberately hides deterministic seeds; Expert Dodge restarts randomize the internal scenario. Individual values, arena scale and uncommon encounter timings are transparent training approximations documented in [Dodge Rhythm](docs/DODGE_GAUNTLET_RHYTHM.md). Results store local records in this browser; unavailable storage does not prevent play.

## Mechanics and checks

Right-click orders chase a moving target until it enters attack range. A + click keeps an attack-move order active while travelling, selecting an in-range enemy nearest the clicked point. Moving during the attack windup cancels the attack; after release you can move during recovery. Auto projectiles track their selected target.

Dodges are based on resolved threats: the trainer checks projectile paths and the existing movement route, with separate handling for area effects and multi-phase spells. This is an approximation, not a measurement of player intent. Blocks are counted separately in results. Simulation uses a fixed 120 Hz step and swept collision. Losing window focus automatically pauses.

After editing `game.js`, run `node scripts/update-build.cjs` before committing. It updates the content-derived build ID and the HTML cache key together. The menu displays the ID of the JavaScript actually loaded; `Build: unavailable` means it did not report a version. This identifies the loaded script but does not itself publish a build or guarantee that other assets are current.

Run the dependency-free gameplay regression checks with Node 22+:

```bash
node --test tests/*.test.cjs
```

## Next improvements

Human browser validation of long Expert sessions, visual/cue tuning from playtests, authentic CS wave/turret behavior, Mid Lane Mastery, accessibility and cross-browser tuning.

Independent fan-made practice project, **not affiliated with or endorsed by Riot Games**.
