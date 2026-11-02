# Mid Lane Mastery — One Relentless Laning Drill

**Project:** League Mechanics God — Mode 4 of exactly 4 main modes  
**Owner decision:** 30 October 2026; development path confirmed 2 November 2026  
**Status:** Product concept/specification, NOT implemented gameplay  
**Source of truth:** [PROJECT_BLUEPRINT.md](../PROJECT_BLUEPRINT.md), [four-mode vision](MECHANICS_ACCELERATOR_VISION.md)

## Confirmed development path — owner decision (2 November 2026)

**Priority and dependency order (do not skip):**

1. **Finish/polish Dodge Gauntlet first.** The owner reports that real human playtesting has already found its current balance excellent. Preserve that balance rather than automatically retuning it. Planned finishing additions include Syndra Q, Syndra Q→E, and an **optional Map Awareness toggle** on the home screen: a lower-right minimap, intermittent enemy-jungler icon with no alert, and a timely user ping granting a small HP reward. The goal is the *habit of voluntarily checking the map while dodging*, not a separate mode or a complete jungle-tracking simulator.
2. **Next: make the standalone CS Engine genuinely good before building the laning opponent.** Current CS practice is an unfinished foundation with known issues; do not treat passing unit tests as proof of convincing in-browser farming. Fix real two-sided wave simulation, minion targeting/attacks/projectile impacts, pathing and body spacing, last-hit timing and attribution, and wave flow/pushing. Add physically credible turret/under-turret CS when the base wave simulation is reliable. **Milestone A gate:** the owner can enjoy and trust repeated pure-CS sessions without any enemy champion; validate with human playtests plus deterministic regression checks.
3. **Only after Milestone A: build the Syndra Mid Lane opponent on the same shared engine.** This is the chosen initial enemy champion, replacing earlier speculative Orianna/Ahri candidates. She constantly pressures/pushes waves with legitimate repeated autos, aims to secure **every realistically obtainable CS**, continuously strafes/repositions, and actively dodges player spells. Whenever her Q is ready and the player exposes a legitimate CS commitment, she **attempts to punish with Q** (subject to actual range, cast time, line of fire, reaction/observation and other engine constraints). The player must both farm under poke and punish Syndra's own CS windup. Her Q→E combo can be integrated after reliable Q and auto/CS behavior. **Milestone B gate:** a genuinely challenging uninterrupted 1v1 lane with authentic reciprocal punish windows, not a scripted sequence.
4. **Combat Survival / teamfight-inspired mode later.** Its desired feel is not settled; do not divert the CS→Syndra roadmap to implement arbitrary 5v5 AI or another mode now.

**Ruthless but fair:** "Never miss an obtainable CS" is a bot *performance target*, not a permission to cheat, retroactively kill minions, bypass autos/cooldowns, read future user input, or guarantee that every Q hits. Syndra can try to poke on every viable Q-ready CS window, but a skilled player must be able to bait, dodge, punish, and sometimes force her to miss CS. Keep champion logic on top of the same rules as the player. Do not rewrite working minion infrastructure solely because a new AI is being added.

**Implementation discipline:** Finish and test Milestone A in the existing CS mode; do not start a parallel fake CS engine inside the opponent branch. Reuse the existing experimental opponent branch as reference only after comparing it with the active development branch; do not overwrite newer gameplay changes. Preserve exactly four intended player-facing modes.

---

## Nightmare Lane — exact owner gameplay specification (2 November 2026)

This section is the **specific intended player experience**, not generic advice for implementing a competitive lane bot. It is a target to build **after the shared CS engine becomes trustworthy**, not a claim of existing functionality.

> "I want an almost infallible Syndra bot that pushes with non-stop autos, misses no CS, moves left and right like a real player, farms and dodges. Whenever Q is up and I go for CS, she always pokes me. She must be so good that she destroys me unless I learn to CS under pressure, dodge her poke, bait her Q, and punish her when she farms."

**Required behavior in the single continuous Mid Lane Mastery experience:**

1. **Syndra is the fixed first bot opponent.** The player starts as Ahri. One difficult opponent in an actual mid lane, not a sequence of minigames or passive target dummies.
2. **Non-stop push with auto attacks.** She continuously attacks the enemy minion wave whenever real auto timers, spacing, minion health and threat allow; no artificial idle waiting that makes farming easy. Her autos must actually change wave HP and push the lane.
3. **Virtually flawless CS.** She calculates incoming minion/projectile damage, travel and attack windups, times her own last hits extremely well, and aims for **100% of CS physically obtainable under the actual game rules**. Track secured/missed/denied minions, and treat an avoidable missed CS as a bot-quality defect. Do **not** award phantom CS or bypass combat rules to hit a headline percentage.
4. **Realistic active movement.** She constantly adjusts spacing and strafes left/right like a skilled mid-laner, remains positioned for farming/poke, and actively attempts to dodge the player's Q/E and other real incoming threats. She cannot know future clicks or instantly evade an already committed unavoidable skillshot.
5. **Relentless Q-on-CS punishment.** **Whenever Q is ready and the player visibly goes for a last hit, her default behavior is to attempt Q poke, every time the cast is legitimately possible.** Aim at the player's current/predictable commitment and exploit real auto-attack windup / movement limits. This is not occasional random poke, nor a fixed scripted shot every few seconds. Real range, timing, cooldown, LoS/geometry and overlapping attack commitments still apply; she must not fire on cooldown or magically land every Q. A missed/baited Q produces a real punishable cooldown window.
6. **Reciprocal punishment.** Syndra also visibly commits to her own real CS auto attacks. The player can exploit those moments by poking with Ahri Q/E or autos; Syndra can sidestep if her observation/reaction and current commitments permit. The training must reward skillful poking and dodging **while farming**, not only passive survival.
7. **High but credible challenge.** It should be extremely hard, with losses and missed player CS if the player tunnel-visions farming. Difficulty comes from her legitimate timing, pressure, positioning and mechanical quality—not invisible input-reading, invulnerability, resource cheats or impossible AI reactions.

**Core loop:** minions continuously fight → Syndra pushes and last-hits nearly perfectly → player moves in for CS → if Q is available, Syndra tries to punish that commitment → player chooses to bait, dodge, take the CS or concede it → Syndra's own CS commitments expose openings for the player to punish → repeat without interruptions.

**No premature implementation:** First fix and human-playtest the pure CS Engine. Do not build Syndra against fake wave data, and do not change the already enjoyable Dodge balance as a side effect.

### Nightmare Lane acceptance criteria

- In extended seeded lane sessions without player interference, Syndra last-hits virtually every physically obtainable minion and consistently pushes via **actual autos**, rather than a hidden CS award or scripted wave health.
- She changes positions repeatedly, keeps usable spacing, and makes real dodge attempts against player attacks while never cheating observation/reaction rules.
- Across repeated **legal, Q-ready** player last-hit commitments, the AI consistently attempts Syndra Q poke; if Q is cooling down or cannot legally reach, it does not fabricate a cast.
- At least one human-tested interaction demonstrates: player baits out her Q → avoids it → takes CS or punishes Syndra during the real cooldown.
- At least one human-tested interaction demonstrates: Syndra commits to last-hitting → player attempts Q/E poke → the outcome respects both champions' actual commitments and trajectories.
- Minions, player CS, Syndra CS, health/damage and missed/denied CS remain coherent under 30/60/120 FPS and during a continuous session.

---

## 1. The experience: ONE very hard mid lane

> **A credible mid lane with real fighting minion waves and ONE exceptionally demanding opponent. Both players farm. Both try to punish the other's last-hit commitments. The player must naturally bait, dodge, farm, zone and trade. No separate lessons or sub-modes.**

- **Player:** Ahri initially, full meaningful Q/W/E/R, auto attacks, movement and Flash. Champion-specific rules must remain sourced or explicitly labelled approximations.
- **Enemy:** One highly competent mid laner (chosen first opponent Syndra) with real HP, cooldowns, attack animations, positioning, farming and spell choices. Aggressively seeks a Q poke on every viable Q-ready player CS commitment; never guarantees a hit or breaks real mechanics.
- **World:** A working mid lane with physically simulated two-sided melee/caster/siege minions, real incoming minion attacks and health, attack impact timing, true death/credit, collisions/pathing and turrets when implemented. No fake countdown-to-last-hit bars.
- **Experience:** A **continuous**, intense duel around the wave—not a preprogrammed "bait → dodge → CS" sequence or a collection of Free Farm, Poke, Under Tower, Trading, and other menu modes.
- **Difficulty:** Designed as **one very difficult challenge**. No Foundation/Standard/Expert/God variants of this mode at this stage. Internally parameterize bot behavior for testing/balancing, but no additional player-facing mode selectors.
- **Core learning:** Real LoL-like laning decisions at high density: choose whether to last-hit, bait, delay, dodge, trade, deny or accept that losing one CS is strategically correct.

## 2. The bidirectional CS-poke rivalry

Each side cares about TWO sets of minions, not only their own attack target:

**A. Enemy punishes YOUR CS**
1. Your enemy minion approaches a real last-hit window as allied minion shots land.
2. Enemy AI sees public game state: HP, incoming shots, your distance, movement, attack/cast cooldowns, its own resources and range.
3. The enemy anticipates that you may move or enter auto windup to secure the minion.
4. If it has a **legitimate** poke window, it positions and attempts an auto/spell during your probable commitment.
5. You may: commit and take damage, bait and step out, pre-position and farm more safely, use abilities to farm/punish, or deliberately concede a dangerous minion.
6. If you bait out a skillshot, it must actually enter cooldown; you may try to dodge, finish CS and retaliate if real timing makes that feasible.

**B. YOU punish the ENEMY's CS**
1. Your allied minion approaches a real last-hit threshold.
2. The enemy must genuinely try to farm when viable, not act as a training dummy.
3. You position to threaten a Q/E or auto **as their CS windup commits**.
4. The opponent may dodge/bait, lose CS, trade back, or accept damage. It should not frame-perfect evade inputs it could not observe.
5. The game rewards credible poke/denial, not simply throwing abilities at every minion. A held E can zone the enemy away from CS.

The two sequences occur **simultaneously** during ongoing minion combat. There is no pause or explicit prompt to switch between "defensive" and "offensive" practice.

## 3. The opponent's intelligence: ruthless but fair

**High-level AI task:** operate as a relentless, CS-perfect-as-feasible Syndra who continually pushes with real autos and threatens every valid Q-ready player CS commitment, without violating legitimate observation, timing or combat constraints. It should care about CS, HP, position, cooldowns, safe trade opportunities and minion retaliation.

### Observation model
Only use observable or legitimately derivable state:
- Visible/known minion health, current minion projectile travel and attack cadence.
- Player distance, movement vector, visible attack-windup start, spell casts and cooldowns inferable from previous use.
- Enemy's own cooldowns, HP, threat range, minion aggro and safe retreat paths.
- No reading future cursor events, precommitted future player orders, hidden RNG, or precise player click intention.

### Decision loop
\`farm window estimate → candidate attack/CS/poke/zone/bait/retreat → commitment → resolution → evaluate/reposition\`

Every decision has a **reaction and commitment delay** derived from its actor behavior, not instant omniscience.

**Poke policy:** whenever Syndra Q is ready, consistently attempt a Q on **every visible, mechanically valid player CS commitment**; do not reinterpret this as occasional poke based on a high-level utility score. Actual range, cast time, attack commitments, reaction, geometry and cooldowns must be respected, and hitting is not guaranteed. Player bait/dodge creates genuine cooldown windows.

**Bot farming policy:** continually push with repeated legitimate autos, aggressively and precisely last-hit every *obtainable* minion using actual movement, windup, missile travel, damage and death/credit rules. Track both secured and missed CS. Despite near-perfect execution, bot CS is not guaranteed when the player denies, zones, kills or interrupts her under shared engine rules; these punish windows are part of the drill.

**Bot baiting policy:** occasionally fake an approach or delay a last hit to trigger the player's defensive E/Q; it can then trade or take the minion if time remains. This behavior must have plausible pacing and not react to unseen inputs.

### Anti-cheat constraints
- Cannot perfectly predict unpredictable cursor changes or instant-cancel its own committed casts.
- Cannot bypass cast times, missile collision, minion blocking, resistance or cooldowns.
- Cannot take guaranteed impossible angles or teleport out of a legitimate player's skillshot.
- Must accept that skilled baiting can repeatedly outplay its policy, then adjust its future policy in a legible, bounded way (e.g., wait for actual windup).

## 4. Every minion should create a real choice

Examples that emerge without scripted scenes:
- One caster minion at kill HP while enemy E is ready: take CS, fake the auto, approach from another angle or concede.
- Two minions approaching lethal together: which one do you farm, and do you risk receiving poke?
- Cannon minion: a higher-value commitment, and an opportunity for opponent zoning.
- Enemy goes for cannon: use E/Q or position so the opponent must choose between CS and losing HP.
- Enemy skillshot misses: open cooldown window for CS and poke; next minions keep arriving.
- Enemy stands behind minions: Ahri E has first-contact interception constraints; Q can pass through if rules permit.
- A wave is larger: minion retaliatory attacks make trades dangerous, without needing a pre-set "wave pressure" tag.
- Turret naturally enters range: under-turret CS and harass emerge from a physical turret; no "Under Tower mode".
- Wave advantage / freeze / bounce eventually arise from combat and travel, not scripted label changes.

The **signature sequence** \`bait → actual enemy cast → dodge → CS → possible punish\` is an **emergent opportunity**, not a required order. Sometimes the correct play is poke before farming; sometimes the correct play is to give up the CS.

## 5. Fidelity, density and pacing

Aim for **real-feeling** movement/ranges/attack windup, minion targeting/damage/impact, champion spell geometry and mana/cooldown costs where supported.

**Intensity must come from repeated authentic contestable last-hit windows**, not fake damage, overclocked projectiles or forcing the opponent to shoot every 0.5 seconds. Maintain continuous waves and short scenario setup times; you can start with waves already meeting, as a clearly stated training shortcut, while their behavior stays physically simulated.

One typical 5–10 minute uninterrupted challenge:
- Both heroes begin with a reasonable visible lane state and a live wave.
- Multiple CS and poke contests arise as minion HP evolves.
- The AI sometimes walks into an attack/cast window, sometimes baits, sometimes plays around its own cooldown and yours.
- Player may trade, disengage, preserve HP, and manipulate the wave through attacks; minions and turrets respond under real rules.
- Session ends by chosen time, player death or deliberate restart, then gives evidence-based feedback. **No mandatory between-wave reset**.

**Not a promise of a perfectly accurate LoL full match.** Version-pin current mechanic evidence and mark unknown values. Do not present exact world/server interaction where the project uses a training approximation.

## 6. Success metrics that don't punish good decisions

- **Player CS:** credited / eligible dead minions; distinguish ally/turret kills (missed) from alive/unresolved minions. Gold is separate from CS.
- **Bot CS:** credited last hits and missed CS, to prove it actually contests the wave.
- **Incoming poke:** eligible enemy casts directed into meaningful player farming windows, hits/dodges/damage; not every harmless expired projectile is a dodge.
- **Offensive poke:** real player damage applied when the opponent is committing to CS, plus actual earned denial (opponent loses CS because it withdrew under credible threat).
- **Baits:** count only if your positioning plausibly induced a genuine enemy commitment and you evaded/repositioned; be conservative about causal claims.
- **Trade quality:** HP spent per useful CS/trade, damage dealt, minion retaliation, cooldown conversion, unforced positional exposure.
- **Consistency:** new seeds/wave states and delayed replays; distinguish memorized patterns from transferable competence.

Never automatically mark a skipped CS a mistake. Never say "you should have E'd" without a realistic available cast and line of fire.

## 7. Engineering prerequisites and smallest viable *real* lane

**Strict order: Milestone A (CS Engine) must become genuinely playable and reliable before Milestone B (Syndra AI).** Reuse existing two-sided minion combat, impact/death attribution and Ahri data adapter from the development branch—**do not rewrite them**. The steps below describe Milestone B prerequisites after completing the pure-CS quality gate.

**Minimum meaningful implementation:**
1. Existing real two-sided minion simulation and per-unit health/attack/windup/projectile behavior; enough reliability that HP changes predictably.
2. One enemy champion actor with real position, HP, movement, attack range/windup, Q or E, cooldown and targetable combat.
3. Bot attempts its own last-hits using the same damage/credit rules as the player.
4. Bot recognizes visible player last-hit commitments and attempts Q poke on every mechanically valid Q-ready opportunity; never uses random passive-poke scheduling as a substitute.
5. Player can aim Q/E at bot **during its own last-hit window**, dodge bot's committed spell and keep farming.
6. No rigid practice-phase timer, no second mode UI for bait or poke.
7. Source-of-truth results distinguish player CS, enemy CS, enemy poke, player poke and meaningful threat dodges.

**Then improve:** advanced bot baiting, Syndra Q→E fidelity, more champion ability sophistication, thoughtful retaliation and a stronger adaptive bot. Cannon/turret, minion aggro and wave control belong in the shared CS-engine quality milestone first wherever they materially affect real farming. Technical milestone flags do **not** create additional player-facing modes.

### Acceptance tests
- Minion reaches lethal HP through real enemy/ally attacks; player kill gets one CS, bot kill gets bot CS, allied kill gets neither; unresolved never counts as dead.
- Bot is capable of last-hitting and being hit by Ahri Q/E while attacking; its own windup can be interrupted under correctly modeled rules.
- Bot attacks/pokes when a player CS commitment is a valid opportunity and obeys cast cooldown, range, collision and line-of-fire.
- Bot withholds Q when it is on cooldown or the cast is mechanically invalid (range, commitment, genuine impossibility); otherwise Q-ready player CS commitments trigger a consistent poke attempt, even if the player can bait or dodge it.
- Player bait can induce real committed cast; enemy cannot instantly re-aim after commitment.
- Player can punish a bot CS commitment with E/Q without scripted bot immobility.
- The same-seed scenarios give consistent outcomes under 30/60/120 FPS rendering with the fixed simulation step.
- Preserve Dodge Gauntlet, Combat Survival Arena and CS Mastery gameplay; regression tests and real browser lane session required.
- Verify a continuous human 5–10 minute lane session with realistic full-wave interactions and readable feedback before claiming the mode finished.

## 8. Guardrail: exactly four main product modes

1. **Dodge Gauntlet** — intense pure evasion, frequent Ezreal Q, rare major ults.
2. **Mechanics Arena / Combat Survival** — full-kit solo-versus-many opponent chaos, Standard target 5–6 simultaneously, no allied champion bots.
3. **CS Mastery** — ONE uninterrupted pure minion-farming experience, lane progressing naturally to turret where feasible. No poke opponent in this mode.
4. **Mid Lane Mastery** — THIS one, very difficult uninterrupted 1v1 laning battle with **reciprocal CS punishment**.

No fifth "Bait → Dodge → CS" product mode, no standalone "Skillshot Lab", "Free Farm", "Under Tower", "Poke Practice", "Flash Challenge", or "God difficulty" menu item. Old code for regression tests can remain internal. Difficulty, encounter variants, replay benchmarks and engineering test fixtures are parameters, **not extra player-facing game modes**.

**ONE-SENTENCE NORTH STAR:** "Every minion creates a meaningful contest: the opponent tries to punish me when I last-hit, and I try to punish them when they last-hit, in one relentlessly hard, real-feeling mid lane."
