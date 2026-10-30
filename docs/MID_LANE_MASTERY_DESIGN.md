# Mid Lane Mastery — One Relentless Laning Drill

**Project:** League Mechanics God — Mode 4 of exactly 4 main modes  
**Owner decision:** 30 October 2026  
**Status:** Product concept/specification, NOT implemented gameplay  
**Source of truth:** [PROJECT_BLUEPRINT.md](../PROJECT_BLUEPRINT.md), [four-mode vision](MECHANICS_ACCELERATOR_VISION.md)

## 1. The experience: ONE very hard mid lane

> **A credible mid lane with real fighting minion waves and ONE exceptionally demanding opponent. Both players farm. Both try to punish the other's last-hit commitments. The player must naturally bait, dodge, farm, zone and trade. No separate lessons or sub-modes.**

- **Player:** Ahri initially, full meaningful Q/W/E/R, auto attacks, movement and Flash. Champion-specific rules must remain sourced or explicitly labelled approximations.
- **Enemy:** One highly competent mid laner (first candidate Orianna or Ahri mirror) with real HP, cooldowns, attack animations, positioning, farming and spell choices. Does not cheat or script a hit on every player CS.
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

**High-level AI task:** maximize effective laning value, not blindly cast on every last-hit attempt. It should care about CS, HP, position, cooldowns, safe trade opportunities and minion retaliation.

### Observation model
Only use observable or legitimately derivable state:
- Visible/known minion health, current minion projectile travel and attack cadence.
- Player distance, movement vector, visible attack-windup start, spell casts and cooldowns inferable from previous use.
- Enemy's own cooldowns, HP, threat range, minion aggro and safe retreat paths.
- No reading future cursor events, precommitted future player orders, hidden RNG, or precise player click intention.

### Decision loop
\`farm window estimate → candidate attack/CS/poke/zone/bait/retreat → commitment → resolution → evaluate/reposition\`

Every decision has a **reaction and commitment delay** derived from its actor behavior, not instant omniscience.

**Poke policy:** attack a player CS window whenever the expected trade is favorable *and* range, cooldown, visibility and geometry allow it. If Q is on cooldown, it cannot fire. If enemy minions will punish the AI more, it may prioritize its own CS or retreat. **No guarantee** of a poke for every single CS; mechanical pressure emerges from credible threat.

**Bot farming policy:** attempt authentic last-hits, with movement, attack windup/projectile travel, damage and actual kill credit. The bot should earn and miss CS too. Without this, the player cannot practice enemy-CS punishment.

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

Reuse existing two-sided minion combat, impact/death attribution and Ahri data adapter from the development branch—**do not rewrite them**.

**Minimum meaningful implementation:**
1. Existing real two-sided minion simulation and per-unit health/attack/windup/projectile behavior; enough reliability that HP changes predictably.
2. One enemy champion actor with real position, HP, movement, attack range/windup, Q or E, cooldown and targetable combat.
3. Bot attempts its own last-hits using the same damage/credit rules as the player.
4. Bot recognizes player last-hit opportunities via visible wave HP + player movement/windup and sometimes attempts legitimate poke.
5. Player can aim Q/E at bot **during its own last-hit window**, dodge bot's committed spell and keep farming.
6. No rigid practice-phase timer, no second mode UI for bait or poke.
7. Source-of-truth results distinguish player CS, enemy CS, enemy poke, player poke and meaningful threat dodges.

**Then improve:** advanced bot baiting, more champion ability sophistication, cannon/turret, minion aggro, wave control, thoughtful retaliation and a stronger adaptive bot. Technical milestone flags do **not** create additional player-facing modes.

### Acceptance tests
- Minion reaches lethal HP through real enemy/ally attacks; player kill gets one CS, bot kill gets bot CS, allied kill gets neither; unresolved never counts as dead.
- Bot is capable of last-hitting and being hit by Ahri Q/E while attacking; its own windup can be interrupted under correctly modeled rules.
- Bot attacks/pokes when a player CS commitment is a valid opportunity and obeys cast cooldown, range, collision and line-of-fire.
- Bot sometimes *doesn't* cast on a CS if on cooldown or if trade is unfavorable.
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
