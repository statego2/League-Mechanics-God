# LEAGUE MECHANICS GOD
## Project Blueprint — Vision, Product Specification & Development Roadmap

**Repository:** https://github.com/statego2/League-Mechanics-God  
**Document role:** The project's main vision and execution document. Read this before deciding what to build next.  
**Updated:** 30 October 2026  
**Current reality:** A browser alpha now includes Dodge Trial, Kite Arena, Skillshot Lab, Bait → Dodge → CS and a foundational Last-Hit Lab. Controls, telegraphs and scoring have regression coverage; the full intended game remains in development. See docs/PROGRESS.md for verified scope.

---

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

## 2. What the game should actually look and feel like

**Camera and world:** A readable top-down / three-quarter MOBA-like perspective, coherent arena or lane, ground textures or tiles, obstacles where appropriate, readable combat distance and safe/unsafe zones. Not a generic blank grid.

**Player:** Original champion-like visual design with clear facing, idle/walk/attack/cast/hit states, shadow, health bar, target feedback, visible attack and ability ranges when needed. Exact League champion assets are not required to achieve the right feel.

**Input:** Right-click to move or target, A + click attack-move, mouse targeting for skillshots, QWER for abilities, optional F for blink/flash, pause and instant retry. Responsive retargeting is crucial.

**Combat:** Windup, release, recovery, movement interruption/attack-cancel tradeoffs, cooldowns, projectile travel, hitboxes, range, enemy telegraphs, effects and sound when useful.

**Training UX:** Pick a specific mechanic, select difficulty, get an immediate challenge, receive a short accurate breakdown, repeat. Failure should teach something; success should reflect skill, not luck.

**Visual bar:** Clearly closer to League's gameplay readability and animation language than the current alpha—even if every asset is original and simplified.

## 3. Product scope: the drills

| Drill | What the player does | What to measure |
| --- | --- | --- |
| Dodge Trial | Move through incoming hostile skillshots and survive | Genuine threats avoided, hits, damage, reaction/spacing, survival |
| Kite Arena | Attack opponents while staying at a safe distance | DPS / hits, movement between attacks, attack uptime, damage received |
| Skillshot Lab | Hit moving targets with different trajectories | Accuracy, timing, prediction, difficulty |
| Last-Hit Lab | Kill minions with controlled attacks | CS, missed last-hits, timing, positioning |
| Bait → Dodge → CS | Invite enemy spell, evade, then last-hit safely | Correct bait, safe dodge, secured CS, time/HP cost |
| Lane Scenario | Perform several mechanics while trading around a minion wave | Consistency across movement, trading, dodges, CS |

**Current alpha:** Dodge Trial, Kite Arena, Skillshot Lab, Bait → Dodge → CS and a foundational Last-Hit Lab (5 waves, 15 CS, allied projectile attrition). Lane Scenario remains a future feature.

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

**Current prototype:** `Dodge Trial` (survive for 60 seconds), `Kite Arena` (kill opponents while moving and casting), `Last-Hit Lab` (15 minions, allied projectile attrition, CS/missed scoring), `Skillshot Lab`, and `Bait → Dodge → CS`.

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
