# LEAGUE MECHANICS GOD
## Project Blueprint — Vision, Product Specification & Development Roadmap

**Repository:** https://github.com/statego2/League-Mechanics-God  
**Document role:** The project's main vision and execution document. Read this before deciding what to build next.  
**Updated:** 30 October 2026  
**Current reality:** A browser alpha now includes Dodge Trial, Kite Arena, Skillshot Lab, Bait → Dodge → CS, a foundational Lane Scenario and a foundational Last-Hit Lab. Controls, telegraphs and scoring have regression coverage; the full intended game remains in development. See docs/PROGRESS.md for verified scope.

---

## Owner decision — Mechanics Arena is solo-vs-many (2026-10-30)

**Binding product clarification:** Mechanics Arena (Mode #2) is **COMBAT SURVIVAL ARENA: one player vs MANY independently acting, damageable enemy champions**. Do not implement friendly AI champions or a symmetric 5v5 teamfight as the default. **Player-facing Standard targets 5–6 simultaneous opponents, Foundation 3–4, Expert 7–8+ if fair and performant.** A 2-opponent scenario is acceptable only as an **internal integration test**, not as the launched experience. The player has full Ahri Q/W/E/R, Flash and autos, practicing dodge, movement, combo execution, kiting and target switching simultaneously in freeform continuous combat. Dead opponents are replaced; battles do not pause for forced button prompts. See the authoritative [Mechanics Arena Design](docs/MECHANICS_ARENA_DESIGN.md). This is an approved design target, **not a claim that it has already been implemented**.

## 1. Our vision

**Create the best accessible, free, browser-based League of Legends-style mechanics training game.**

A player opens the website and practices meaningful LoL mechanics in short, repeatable sessions—without launching League, waiting for a match, installing anything, or needing other players.

This must feel like a **real miniature MOBA training environment**, not just random circles and bullets on a screen.

The game should develop skills that transfer to LoL:
- Fast, accurate right-click movement and directional control.
- Dodging skillshots, both by reaction and by anticipation.
- Spacing and threat-range recognition.
- Attack-move, attack timing, auto-attack animation/cooldown control, orbwalking/kiting.
- Landing skillshots on moving targets.
- Last-hitting minions while positioning under pressure.
- Baiting opponents' abilities and exploiting the resulting window.
- Eventually combining these skills in realistic lane scenarios.

### North-star experience

> Open URL → choose a drill → instantly control your character → practice a recognizable League-like interaction → see credible performance feedback → retry at a harder level → improve.

**The goal is a useful, polished game.** Documentation, references, assets, architecture and AI collaboration are tools to achieve that—not the product.

## Product direction update: focus on quality (2026-10-30)

The user explicitly wants a few excellent drills, not many separate modes. Dodge Trial should not immobilize the player when a skillshot hits; it should remain demanding via threats and damage. Kite should ultimately use an ADC with high attack speed rather than Ahri; preserve Ahri in other modes. The laning vision and a challenging combined CS, positioning, bait and dodge experience remain central; restore it after the minion/wave simulation is credible. Dodge should retain varied overlapping threats and difficulty should favor challenge without sacrificing readable, fair patterns. The visible menu now offers Dodge Trial, Kite Arena and Last-Hit Lab; preserve legacy implementations for regression coverage but do not add more menu modes without clear value. Make Ahri the default player baseline across these drills and integrate recognizable opponent spells into Dodge Trial. Continue toward accurate Ahri abilities, visuals and realistic CS waves; the current sprite and abilities are still placeholders.

## 2. What the game should actually look and feel like

**Camera and world:** A readable top-down / three-quarter MOBA-like perspective, coherent arena or lane, ground textures or tiles, obstacles where appropriate, readable combat distance and safe/unsafe zones. Not a generic blank grid.

**Player:** Original champion-like visual design with clear facing, idle/walk/attack/cast/hit states, shadow, health bar, target feedback, visible attack and ability ranges when needed. Exact League champion assets are not required to achieve the right feel.

**Input:** Right-click to move or target, A + click attack-move, mouse targeting for skillshots, QWER for abilities, optional F for blink/flash, pause and instant retry. Responsive retargeting is crucial.

**Combat:** Windup, release, recovery, movement interruption/attack-cancel tradeoffs, cooldowns, projectile travel, hitboxes, range, enemy telegraphs, effects and sound when useful.

**Training UX:** Pick a specific mechanic, select difficulty, get an immediate challenge, receive a short accurate breakdown, repeat. Failure should teach something; success should reflect skill, not luck.

**Visual bar:** Clearly closer to League's gameplay readability and animation language than the current alpha—even if every asset is original and simplified.

## 3. Product scope: exactly FOUR player-facing modes

**AUTHORITATIVE PRODUCT DECISION (30 October 2026):** Build **four excellent, intense, uninterrupted gameplay experiences**. Do **not** turn every mechanic, combo, bot tactic, difficulty setting or lane situation into another menu mode. The detailed design docs below control implementation.

| # | Main mode | ONE continuous gameplay experience | Primary design spec |
| --- | --- | --- | --- |
| **1** | **Dodge Gauntlet** | Pure dodge survival under rapid, fair incoming spells. Frequent Ezreal Q, Lux Q, Blitz Q, Ahri returning Q, Vel'Koz split Q and occasional invisible-source Xerath Q/W. Rare Malphite R/Orianna R. | [Dodge Gauntlet Rhythm](docs/DODGE_GAUNTLET_RHYTHM.md) |
| **2** | **Mechanics Arena — Combat Survival** | **Player alone versus MANY active hostile champions**. Full Ahri kit, combos, kiting, target switching, dodges and Flash all at once. Standard target **5–6 concurrent enemies** (design target, not a claim of current functionality); no allied champion AI, no scripted "do E now" lessons. | [Mechanics Arena Design](docs/MECHANICS_ARENA_DESIGN.md) |
| **3** | **CS Mastery** | ONE clean, continuous farming lane with real two-sided minions; natural farming as the wave moves, including genuine under-turret CS when turret simulation is ready. **No enemy champion harassment here**—that belongs to #4. | [Four-mode Vision](docs/MECHANICS_ACCELERATOR_VISION.md) |
| **4** | **Mid Lane Mastery — The Ultimate Drill** | ONE **very hard** 1v1 lane challenge. The enemy tries to poke you on real last-hit commitments; the enemy farms too, and you try to punish their CS. Bait, dodge, poke, zone, trade and sometimes concede CS—no separate sub-modes or four difficulty variants. | [Mid Lane Mastery Design](docs/MID_LANE_MASTERY_DESIGN.md) |

**Design / implementation distinction:** The actual browser alpha currently offers **three working menu buttons**: Dodge Trial, Kite Arena, and Last-Hit Lab. These are early functional foundations for #1, #2 and #3, **not finished implementations of their full product concepts**. Older Skillshot Lab, Bait → Dodge → CS and Lane Scenario live in legacy/internal source and tests, but **do not become additional player-facing product modes**. Mode #4 is **planned, not implemented**. Do not rename unfinished alpha gameplay to suggest that it is already the complete mode.

**Implementation rule:** Continue reusing and improving working modules, tests, current research/data adapters and the HTML5 Canvas game. Difficulty presets, scenario seeds, mixed practice, under-turret behavior, separate champion profiles, benchmarks and technical smoke tests may be internal parameters **inside an existing main mode**, never automatic reasons to add more mode cards.

## 4. Constraints and product decisions

- **No Unity.** The browser implementation is the product.
- **Free to play and develop.** No paid engine, asset pack, account, API or subscription required to run the game.
- **Desktop mouse + keyboard first.** Mobile support is not the initial priority.
- **GitHub is the source of truth** for current code, project vision, research, progress and future handoffs.
- Keep a working game at all times; prefer incremental playable improvements over a giant rewrite.
- Start with the existing HTML5 Canvas, plain JavaScript and CSS implementation. Change stack only when demonstrably necessary.
- Static hosting is enough for the MVP; GitHub Pages is a good first deployment.
- Reusable, comprehensible code and a repeatable test process matter more than complicated infrastructure.

## 5. What already exists in the repository

**Repository:** https://github.com/statego2/League-Mechanics-God  
**Main application files reviewed on 30 October 2026:**
- `index.html`: menu, HUD, buttons and game canvas.
- `style.css`: responsive page and HUD styling.
- `game.js`: update/render loop, player, enemies, projectiles, abilities and input.
- `README.md`: how to run the alpha and descriptions of its modes.

**Current prototype:** `Dodge Trial` (survive for 60 seconds), `Kite Arena` (kill opponents while moving and casting), `Last-Hit Lab` (15 minions, allied projectile attrition, CS/missed scoring), `Skillshot Lab`, `Bait → Dodge → CS` and a basic `Lane Scenario`.

**Important qualification:** Source files were inspected, but a complete gameplay/browser test and a public deployment were not confirmed during this document's creation.

**Resolved during development (30 October 2026):** Expiration-only dodge scoring was replaced with trajectory threat eligibility. Persistent attack orders, cancellable windups, swept collision, seeded difficulty and telegraphs were added. Read docs/PROGRESS.md for tests and remaining limitations.

**Reality check:** This is a beginning, not the end product. The current primitive geometric visuals are insufficient for the intended LoL-like experience.

## 6. League of Dodge reference material: how it fits

We have investigated the external browser game at:
- https://loldodgegame.com/dodge/game.html
- Files previously encountered: `game.html`, `dodge.js`, downloaded dependencies and `loldodge-all-updated.zip`.
- There may be resources associated with several distinct minigames.
- The download process previously failed on `rel: unbound variable`. **Do not assume that everything is complete.**

**Purpose:** Build a navigable library of reference implementations, assets, controls and observed behaviors, so later AIs don't have to rediscover these examples every time.

**The reference folder and the playable app are separate.** Never overwrite our `index.html`, `style.css` or `game.js` with downloaded files. The next AI should compare, understand, adapt and build, not blindly replace our project.

### Proposed repository organization

```text
League-Mechanics-God/
├── PROJECT_BLUEPRINT.md       # This document: product vision and roadmap
├── README.md                  # For players: how to launch and play
├── AGENTS.md                  # Short pointer to this blueprint, if present
├── index.html                 # Playable app
├── style.css
├── game.js
├── reference/
│   └── league-of-dodge/
│       ├── README.md          # What was obtained and where to find it
│       ├── manifest.md        # Full extracted inventory and missing dependencies
│       ├── GAMEPLAY_ANALYSIS.md # Detailed mechanics observations
│       ├── originals/         # Reference files, preserving their original paths
│       └── archives/          # Source ZIP(s) if included
└── docs/
    └── PROGRESS.md            # Tested features, issues, next tasks
```

The import agent should **extract, inventory, organize, verify and commit** reference material. The development agent should then use the material to improve **our own game**.

## 7. Development roadmap and milestone acceptance criteria

### Phase 0 — Working foundation and research import
**Goal:** One cloneable repo that any coding AI can understand and run.

Work:
1. Assemble the reference files and documentation under `reference/league-of-dodge/`.
2. Keep the original reference directories and file relationships.
3. Clone, launch and check the actual browser game.
4. Find broken inputs, collision bugs, pause/restart bugs and inaccurate counters.
5. Create `docs/PROGRESS.md` with verified facts and the next tasks.
6. Enable a public static build only when it is actually working and tested.

**Exit:** New agent can clone → run → inspect references → know exact next task without chat context.

### Phase 1 — Controls and kiting feel right
**Goal:** Tight, reliable LoL-like mouse controls and combat rhythm.

Work:
- Right-click path targeting and rapid retargeting.
- Attack range and chase/attack order.
- Attack-move semantics and nearest-target selection.
- Attack windup, fire, cooldown and cancellation behavior.
- Movement/attack timing unaffected by frame-rate variations.
- Visual indicators that help players learn timing and distance.
- A small reproducible kiting drill with believable moving enemies.

**Exit:** Repeated kiting feels responsive, consistent and trainable.

### Phase 2 — High-quality dodging
**Goal:** The game teaches actual avoidance and positioning.

Work:
- Accurate skillshot collision and sensible hitboxes.
- Telegraphs and readable projectiles.
- Multiple pattern types: line, fan, delayed circular AoE, sweeping wall, combinations.
- Predictable escalating difficulty and selectable presets.
- Meaningful threat-based dodge statistics.
- Restart and difficulty iteration in seconds.

**Exit:** A player can improve at dodging and trust the results.

### Phase 3 — A convincing MOBA presentation
**Goal:** No longer looks like a generic geometry demo.

Work:
- Original player/enemy/minion silhouettes or sprites.
- Clear facing, walking, attack and cast motion.
- Coherent arena/lane environment.
- Health bars, attack/projectile/impact feedback.
- Strong game UI: mode menu, difficulty, results, restart.
- Performance improvements without sacrificing input latency.

**Exit:** A first-time player immediately recognizes a LoL-inspired training environment.

### Phase 4 — Signature training loops
**Goal:** Go beyond pure dodging toward real lane fundamentals.

Work:
- Last-hitting with minion health and attack timing.
- Bait → Dodge → CS signature sequence.
- Skillshot prediction drills.
- Repeatable scenarios with clear scoring.
- Basic progression, local records and calibrated challenges.

**Exit:** At least one distinctive drill cannot be mistaken for an ordinary bullet-hell game.

### Phase 5 — Ship and iterate
**Goal:** A reliable publicly playable free game.

Work:
- Smoke and regression tests, reduced input bugs.
- Browser checks and FPS/performance targets grounded in testing.
- Clear instructions, release notes and real playable URL.
- Further modes only after quality on existing drills is solid.

**Exit:** Stable play, good UX and clear improvement data.

## 8. How multiple AIs collaborate without losing context

**AI A — Reference import / preservation**
- Inspects the local League of Dodge archive and downloads.
- Uploads and organizes the material under `reference/league-of-dodge/`.
- Documents the exact inventory, missing assets and important mechanics.
- Commits changes and gives the resulting commit/PR link.
- Does **not** rewrite the production game.

**AI B — Codex development**
- Reads this blueprint, actual current source and reference documentation.
- Launches the current game and tests it.
- Prioritizes the next *visible, playable improvement*.
- Implements code, runs tests, fixes bugs, commits and updates progress.
- Continues working on the next improvement without needing a new elaborate prompt for every small step.

**Any subsequent AI**
- Reads `PROJECT_BLUEPRINT.md`, `README.md`, `docs/PROGRESS.md`, current source and latest commits.
- Treats Git history and tests as factual ground truth.
- Continues from the next priority rather than re-planning everything from scratch.

### Required progress handoff (`docs/PROGRESS.md`)

Record after each meaningful coding session:
1. Current playable state.
2. Changes completed and their commit hashes.
3. Tests actually performed and their results.
4. Known bugs / missing assets / blockers.
5. The **three highest-value next actions**, with brief acceptance criteria.
6. Public playable URL **only after verifying it**.

## 9. The first concrete Codex assignment

**After the reference import:**

1. Inspect the real tree, `PROJECT_BLUEPRINT.md` and `reference/league-of-dodge/`.
2. Launch `python3 -m http.server 8080` and test the two existing modes.
3. Identify and fix the most impactful real gameplay defects, particularly the dodging counter and unreliable click / attack-move semantics.
4. Improve right-click movement and kiting timing in the current browser implementation.
5. Make one visible improvement to gameplay readability (for example range circle, windup indicator, clear hit feedback).
6. Run a repeatable smoke test for movement, basic combat, pause, resume, restart and scoring.
7. Commit, update `docs/PROGRESS.md`, and then continue to the next priority.

**Avoid spending the first development session solely documenting or rewriting the project.**

## 10. Final principle

Every implementation decision should answer:

**Will this make the browser game more playable, more LoL-like, more useful for training, or more reliable?**

If not, it is probably not the next priority.

**BUILD → PLAY → TEST → IMPROVE → COMMIT → REPEAT.**


## 11. Champion-faithful training: Ahri baseline and real skillshots

**User priority (30 October 2026):** make the base player mimic level-1 Ahri, especially movement and last-hitting, and add recognizable enemy abilities with real timing, projectile speed, hitboxes and damage. Preserve the existing playable drills while calibration is introduced. Use a pinned patch and cite each value; do not silently describe approximate mechanics as exact.

### Reference snapshot and sources

- Riot's [Data Dragon documentation](https://developer.riotgames.com/docs/lol) explains versioned champion data; its [version list](https://ddragon.leagueoflegends.com/api/versions.json) returned 16.21.1 on 30 October 2026. Riot's [13.22 patch notes](https://www.leagueoflegends.com/en-gb/news/game-updates/patch-13-22-notes/) explicitly state Ahri base attack speed 0.668, attack speed ratio 0.625, windup 20%, and AS growth 2.2%.
- The community [Ahri statistics](https://wiki.leagueoflegends.com/en-us/Ahri) list level-1 AD 53, health 590, armor 21, magic resist 30, movement 330, attack range 550 and attack missile speed 1750. Confirm these against the chosen Riot Data Dragon snapshot and gameplay tests before calling the implementation patch-accurate. Range is an edge-range rule, not simply center-to-center.
- First candidate hostile spells: [Lux Q](https://wiki.leagueoflegends.com/en-us/Lux), 0.25 s cast, 1200 units/s, 140 width, 80 base magic damage at rank 1, 2 s root, hits up to two targets; [Ezreal Q](https://wiki.leagueoflegends.com/en-us/Ezreal), 0.25 s cast, 2000 units/s, 120 width, 1200 range and 20 + 130% total AD physical damage at rank 1, first target only. Values are community-documented snapshot, not verified in-client; skill effects, ranks, AP/AD, resistances, minion interception and range all matter. Do not use raw base damage as post-mitigation damage.
- Early [melee minions](https://wiki.leagueoflegends.com/en-us/Melee_minion) are listed at 465 health and 0 starting armor; actual last-hit outcomes also depend on minion type, wave upgrades, runes, items, allied attacks and projectile travel.

### Implementation and acceptance

1. **Timing first:** an opt-in Ahri level-1 timing preset is implemented at 0.668 attacks/s and 20% windup (about 0.299 s). It changes timing in all drills; in Last-Hit Lab it additionally activates the experimental CS profile described below. Old defaults and records remain separate.
2. **Consistent scale:** define and document a world-units-to-arena conversion shared by movement speed, edge-based attack range, missile speeds, collision radii and spell range. Calibrate camera and walking distance together, rather than copying raw numbers into a differently scaled 1200×675 canvas.
3. **Level-1 CS profile:** the Last-Hit Lab profile uses 53 auto damage, 465-health melee and 284-health caster targets, edge-based range, scaled movement/projectile speed and base allied attack damage/cadence. The allied wave is still a simplified scripted approximation; implement both sides as real units with target acquisition, movement and deaths, then validate in game. Show the actual post-mitigation last-hit threshold. Include boundary tests for HP immediately above/below lethal and an actual timed human run; protect the current accessible drills with a selectable profile until balanced.
4. **Real skillshot library:** Lux Q and Ezreal Q now have initial standalone dodge drills, using the snapshot values below and an approximate scale; expand their collision and effects. Continue data-driven spell definitions with champion, spell, patch, rank, cast time, speed, range, width, damage type/scaling, collision and crowd control. Start with Lux Q and Ezreal Q, then add more after verification. Differentiate training-only extra warnings/difficulty modifiers from authentic timing; never claim exact behavior while units or effects are approximated.
5. **Validation and maintenance:** test missile travel time, maximum range, swept collisions, interception, resistance, CC and dodge vs block scoring at several frame rates. Record sources, assumptions, manual playthroughs and patch updates; use original assets and follow Riot's current community-use policies.
