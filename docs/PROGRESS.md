# Development progress — 2026-10-30

Read PROJECT_BLUEPRINT.md first. Browser Canvas product; no Unity or paid dependencies.

## Mindgame entry spacing (2 November 2026)

- Entry-spacing prediction now uses each new visitor's sampled approach speed, rather than assuming 120 canvas units/s while the visitor actually uses 108–132. This keeps the intended visual separation consistent with the new timing variety; cast speed, probabilities and threat caps are unchanged. Build `timing-spacing`.
- Added a crossing-path case where 108 and 132 give opposite spacing results, and updated the multi-caster spawn check to use the actual sampled speed. The full suite launched before this correction was still in progress; it cannot prove the final code until rerun against a fixed checkout.

## Mindgame Timing v1 (2 November 2026)

- At the player's request Expert visitors vary their visible approach speed by ±10% and may wait independently for 0–0.16 seconds at their casting position before choosing aim and committing. This changes decision timing rather than the sourced spell windup or missile speed. The visitor remains in the entry phase while waiting, so existing threat-budget and path-separation checks still apply. Standard and Foundation are unchanged. Aim and escape forecasts are evaluated after the pause using the real spell cast time. This is a trainer approximation, not live champion AI. Build `mindgame-timing`.
- Five targeted tests pass for bounded timing variability, actual pause and unchanged windup, existing Mindgame Aim distributions, real lead/reversal behavior and Expert opening. A 60-second seeded simulation observed 35 casts and a peak of three simultaneous threats; this is not a human difficulty assessment. Full suite in progress.

## Major impact visibility across delayed frames (2 November 2026)

- Extended the bounded unseen-impact retention to Lux R / Xerath Q beams, Malphite R and Cassiopeia R, in addition to Orianna R. A delayed frame can no longer discard those short visual effects before their first render; damage, collision and pre-cast cues are unchanged. Headless effects still expire after a bounded interval. Build `impact-frame`.
- Five focused tests passed, including actual Lux, Malphite and Cassiopeia impacts after a 0.25 s delayed frame, visibility and cleanup, plus existing Orianna and beam geometry checks. Human visual playtesting remains open.

## Orianna impact across delayed frames (2 November 2026)

- A slow frame can advance multiple fixed simulation steps before rendering; the 0.24 s R impact effect could expire before the browser showed it. A briefly unseen Shockwave is now retained for the next render and shown for at least 0.12 s; unseen effects still expire after a bounded interval when rendering is absent. Damage timing and the radius are unchanged. Build `orianna-frame`.
- Added a delayed-render regression using a 0.25 s simulation catch-up, confirming the actual R hit and full-radius impact render, followed by effect cleanup. All 26 Orianna-focused tests pass. A real browser playtest remains necessary.

## Orianna visible impact timing (2 November 2026)

- Player reported damage before Orianna R appeared to explode. R's collision already resolved at the end of its 0.5 s cast, but its impact arcs started at only 35% of the damage radius and expanded afterward. The impact now displays arcs at the full damage radius immediately when R resolves, with the existing short fade; timing and collision are unchanged.
- Orianna Q independently deals damage on the ball's path or arrival before R, as documented by the existing Q simulation; added a small impact burst at the player's position so that Q contact is distinguishable. This does not remove Q damage or claim that all observed early damage was R. The player should review in a live encounter.
- Added a simulation verifying no R damage or shockwave before impact, then actual damage and full-radius impact arcs together. All 25 Orianna-focused tests pass; syntax and diff checks pass. Local build `orianna-impact`.

## Mindgame reversal verification (2 November 2026)

- Added an executed seeded visitor scenario proving a reversal-read projectile can hit when the moving player reverses, and that a separately forecast response avoids the same cast. This complements the forward-lead hit/evade and weighted-selection tests. All four targeted prediction and fallback tests pass. This is sampled evidence, not a measurement that every reversal or every delivered shot is equally threatening; no tuning changed.

## Full regression and current Dodge documentation (2 November 2026)

- Full `node --test --test-reporter=dot tests/*.test.cjs` run started after Expert Orianna's committed-combo change completed with exit 0. The later two Lux-center tests also passed in their targeted run. The suite does not establish human reaction fairness or visual quality.
- Corrected README's stale two-threat and repeated-seed descriptions: Expert's configured cap is four, and Dodge restart randomizes the scenario. Two focused opening/rhythm tests pass; one sampled 60-second simulation observed three concurrent threats and both Cassiopeia and Malphite. No gameplay settings changed.

## Lux R aim verification (2 November 2026)

- Added deterministic multi-angle coverage proving the centerline passes through Ahri's position at Lux R spawn, plus a full impact check that a stationary player there takes damage. Existing tests cover fixed aim during the visible charge, a real sidestep and impact width. All six targeted Lux R tests pass; no gameplay values changed. Aim is locked at spawn, so moving during the source tell can put the player away from the center by the time the beam charges.
- The full suite launched after the Orianna commitment change is still running; check its result before reporting it as passing.

## Committed Expert Orianna combo (2 November 2026)

- Expert Orianna still requires an available Flash and a sampled escape before launching Q. Once the ball is visibly travelling, R now commits instead of silently disappearing when a later movement, cast lock or terrain position makes the sampled Flash response invalid. This makes the telegraphed sequence reliable, but the initial snapshot is not a guarantee of safety after the player changes their position or actions. Standard retains its existing cast-time walking check. Build `orianna-commit`.
- Eight targeted tests pass, including Flash used during Q, a player lock after Q begins, fixed ball positioning and executable Flash responses. Complete suite is being rerun; human multi-minute play remains necessary.

## Beam impact width (2 November 2026)

- Lux R and Xerath Q impact VFX previously used Xerath's fixed beam width regardless of their own collision radius, making Lux's visible hit disagree with its actual beam. Each impact now renders at its hazard diameter; collision, timings, aim and difficulty are unchanged. The thin charge cue remains a visual cue, not a hitbox overlay. Build `beam-width`.
- Added a regression which executes Lux R, captures its actual impact and verifies the rendered stroke width matches its collision beam. All 36 selected Lux, Xerath and Orianna tests pass; human visual review is still needed.

## Dodge records for Mindgame Aim (2 November 2026)

- Dodge records now use `director_v87` rather than v86. Predictive aim, faster Malphite and the fixed Orianna/Lux sequence materially changed the encounters, so mixing the two versions would make personal bests misleading. Old v86 records remain in local storage, but are no longer displayed as comparable results. No gameplay or difficulty settings changed. Local build `dodge-v87`.
- The targeted record separation and skill-score tests pass; JavaScript syntax and diff checks pass. The complete suite passed on the previous gameplay commit. Human assessment of the new ultimate visuals and prolonged balance remains open.

## Cache-free local testing (2 November 2026)

- Added `python3 scripts/dev-server.py`, a loopback-only static development server on port 8082 with `Cache-Control: no-store` for HTML and assets; use `--port` to select another port. It serves the checkout regardless of the launch directory. README documents the new local URL. The older server on 8081 was left running to avoid interrupting play.
- Verified the response header and loaded `Build: orianna-lux-v3` in a fresh browser at http://127.0.0.1:8082/. This addresses local browser caching; GitHub Pages is separate and unchanged.
- Complete `node --test --test-reporter=dot tests/*.test.cjs` run after the early-Flash correction finished with exit 0. The previous 21 targeted ultimate/prediction tests and seven early-Flash-focused tests also passed. Human long-form dodge balance and visual verification remain open.

## Orianna early-Flash combo (2 November 2026)

- Fixed Expert Orianna cancelling a visible Q → R combo if Ahri used Flash during ball travel. The initial spawn still requires Flash to be ready; once committed, spending Flash early is a valid player decision and the R continues at the ball's fixed destination. If Flash remains available, the existing cast-time escape check still applies. Added a simulation that Flashes during Q and verifies the full R resolves. Seven targeted Orianna, Lux and aim tests pass. Local build: `orianna-lux-v3`.
- The previous game test run finished with exit 0 after the first Orianna/Lux change. Human multi-minute tests of visibility and overlapping pressure remain open. A fresh browser tab at the plain localhost URL showed a cached `mindgame-v1` HTML page; `http://127.0.0.1:8081/?build=orianna-lux-v3` loaded the correct v3 label and started Expert Dodge. Use a versioned page URL for playtests and verify the label; script query versioning alone does not prevent stale HTML.

## Mindgame Aim v1 and faster Malphite (2026-11-02)

- Named the targeting experiment **Mindgame Aim v1**. For a moving player's straight-shot cast, the initial selection is 75% forward prediction, 10% reversal and 15% direct. The existing shared escape check can replace an unsafe prediction with direct aim or cancel the cast, so these are selection weights, not measured delivered-shot proportions. Stationary players are targeted directly.
- Expert Malphite's visible pre-dash approach now lasts 0.8 seconds instead of 1.25; his dash speed, Flash safety forecast and 15-second first eligibility remain unchanged. Standard retains the 1.25-second approach.
- Six focused tests pass, covering selection distribution, real predictive hit versus an alternate escape, safe fallback, Malphite setup and early scheduling. Local build: `mindgame-v1`.

## Predicting movement through projectile travel (2026-11-02)

- Prior lead aim only projected Ahri's current route during the spell windup; a player walking continuously could often evade without making a new decision. Straight-shot visitors now estimate the player's position through both windup and projectile flight, iterating the travel estimate twice with a 1.2-second horizon. Direct, reversal and lateral-cut patterns remain mixed in; casts that do not pass the existing shared escape forecast fall back to a separately checked direct aim.
- Added an actual simulation demonstrating that the same predictive cast hits when the player continues straight and misses when the player changes to a verified route. Five focused lead/distribution/shared-escape/fallback tests pass. This is a sampled training policy, not a claim of live champion AI or a proof of universal fairness.
- Follow-up verification: the complete `node --test --test-reporter=dot tests/*.test.cjs` suite finished successfully (exit 0) after the projectile-flight lead change, including long Expert simulations. Player playtesting is still needed to assess the frequency and feel of the prediction.

## Local browser build verification (2026-11-02)

- The user's existing Chrome tab at `http://127.0.0.1:8081/` was still displaying the older `flash-practice` build despite the local server having newer files. It was already at the drill menu, so it was reloaded; the browser DOM now shows `Build: malphite-trail` and Expert selected. This confirms the menu loaded the current local build, not an interactive gameplay or visual-balance test.
- Independent hidden-browser smoke test on `orianna-timing`: Expert Dodge starts with 590 HP and T1 boots; pressing physical F via browser keyboard input shows the 30-second Flash cooldown. This confirms the input reaches the real page, but does not verify Flash displacement visually or establish human balance.

## Full regression audit (2026-11-02)

- The initial complete `node --test --test-reporter=dot tests/*.test.cjs` run completed with six failures. Five were reconciled with current behavior: Flash-only Expert Malphite, W speed forecast capped at the move destination, W-assisted evade at current boots/hitbox, and Xerath W's four-threat cap. The remaining long-route test now samples different second-projectile speeds and finds a genuine long-route response, then executes it against actual collisions. The complete suite subsequently finished successfully (exit 0). Human visual and reaction-time testing remains necessary.

## Dodge record separation (2026-11-02)

- The current higher-pressure Dodge, 30-second sustain and Flash-only ultimate rules now use `director_v86` records. Prior `director_v85` records remain stored but are not shown as comparable scores or survival times. Regression covers new records and preservation of old data.

## Expert Orianna and Malphite Flash reactions (2026-11-02)

- Expert Orianna commits Shockwave centred on the current player position, with a visible 0.5-second ball charge. Her setup targets the player's position; re-centering at R commitment is a deliberate reaction-training approximation, not faithful Orianna ball control. A sampled terrain-aware Flash-plus-move witness must exist and Flash must be ready; Q travel can still hit independently.
- Expert Malphite first becomes eligible at 15 seconds (previously 90), and always aims his R directly at the player. Direct casts require a sampled Flash-plus-move escape and available Flash. Both Flash-only encounters defer when Flash is on cooldown without halting ordinary casts. Standard retains prior walkable patterns.
- The Malphite dash now leaves a short fading dust trail along its travelled path, improving motion readability without displaying a prospective landing marker or modifying collision.
- After its initial Q travel, the Expert training ball visibly follows Ahri until Shockwave starts, then locks in place for the cast. This explicitly artificial attachment prevents the previous visual jump onto the player at cast time. Three seeded runs introduced direct Malphite before 45 seconds; a separate regression verifies cooldown deferral does not stop regular threats. Five focused tests pass.
- Added executable centred-Shockwave Flash witnesses for moving Ahri in four directions, with and without W speed decay; accepted witnesses survived actual impact. The corresponding moving Malphite Flash test and stationary Orianna test also pass. These sampled cases do not replace human playtesting or exhaust all terrain positions.
- Added actual Flash-plus-move execution against centred Shockwave across a 20-point arena grid (excluding non-walkable positions). All accepted sampled witnesses survived; the existing moving Orianna and sampled Malphite witness tests also pass.
- Added coverage that manual pause and window blur freeze both direct ultimate windups and Flash cooldowns; resuming advances them normally. This guards reaction timing when the player switches windows.
- Updated opening-clock regressions for the requested early Malphite. A 60-second sample observed three distinct simultaneous threats and both direct Malphite and Cassiopeia; focused opening, Flash-cooldown and early-clock tests pass. A separate three-seed twelve-minute run measured 33–46 casts per minute with every Malphite cast direct.
- Expert Orianna's first eligible time is now 50 seconds instead of 75, so the Flash reaction appears sooner while leaving 35 seconds after Malphite's first eligibility. The existing Flash-availability and ultimate-spacing checks can still delay the actual cast. Five opening, cooldown and ultimate tests pass.
- Five focused tests pass for Orianna's centred cast and actual Flash escape, Malphite direct target/early clock/cooldown gating and actual Flash escape, plus physical F key. Visual and human reaction-time playtesting remain necessary. Sources: https://wiki.leagueoflegends.com/en-us/Orianna and https://wiki.leagueoflegends.com/en-us/Malphite (community data); trainer centering/placement are explicit approximations.

## Dodge collision regression geometry (2026-11-02)

- Updated three subframe regression scenarios to use the current compact Dodge hit radius and Tier-1 movement speed. They continue checking actual collision and lock behavior, rather than asserting the old 65-unit hitbox and 330-unit speed. Five selected tests pass, including movement locks, missile expiry and Vel'Koz split activation. The full suite still has other unresolved failures.
- Recalibrated the escape-forecast obstruction tests to the smaller current hitbox: two blockers at 65 canvas units still obstruct both responses, while one leaves a valid sidestep. The cast-lock and projectile-range boundaries now reflect current movement and scaled collision. Four focused checks pass.

## Ability cooldown display (2026-11-02)

- Cooldown numbers now round upward, including the final tenth of a second. Previously the HUD could show 0 or 0.0 while Flash remained unavailable, making a valid cooldown look like an input failure. Added a regression for the final seconds and ready state.

## Keyboard-layout Flash fix (2026-11-02)

- The key handler previously relied on the typed character (`event.key`), so F could produce `φ` on a Greek keyboard and never trigger Flash. Game letter controls now use physical `event.code` when available, with the old key fallback. Added a regression that sends `key: φ`, `code: KeyF` through the actual keydown handler and verifies Flash moves toward the cursor.
- Flash aimed directly at the champion now gives a cursor instruction without spending cooldown. A landing that resolves to the current position also refunds cooldown and reports the failed landing; these checks avoid a silent consumed Flash.
- Gameplay keyboard shortcuts no longer intercept keys on the drill menu or browser shortcuts using Ctrl, Command or Alt. Greek physical-key support remains active in gameplay.

## Dodge Flash practice availability (2026-11-02)

- Investigation found Flash was bound to F and had a 300-second cooldown, making repeated practice impractical. Dodge now uses an explicit 30-second training cooldown; other Ahri/reference drills retain 300 seconds. Trying F on cooldown shows the remaining time, and a displacement lock now gives feedback instead of silently ignoring the key.
- Eight targeted tests pass for cursor direction/range, cooldown feedback, retained movement, terrain routing, spell casts, Cassiopeia facing and Blitz/Lux locks. This does not establish the cause of every reported Flash failure; browser verification remains necessary.

## Dodge sustain and Ahri R adjustment (2026-11-02)

- Ahri's Spirit Rush maximum dash in Dodge is 450 game units (225 canvas), down 10% from 500; other modes retain 500. This is a trainer tuning choice.
- Dodge restores health in one-second ticks, combining the existing base regeneration and trainer sustain to restore one maximum health bar over 30 seconds without hits. Hits restart the one-second tick; healing is capped, pauses with the game, and does not revive. This is not live League regeneration.
- Five targeted tests pass for the dash limit, 30-second recovery, hit reset, pause/base regen and recovery timing; `node --check game.js` and `git diff --check` pass. Local build label `sustain`.
- Follow-up: the wall-crossing regression now expects the shorter 225-canvas Dodge dash rather than the old 250-canvas endpoint. Added coverage that healing freezes while paused and does not bank ticks while health is full.

## Intense Expert playtest (2026-11-02)

- At the player's request, Expert now attempts a regular encounter every 0.38 seconds and permits up to four concurrent threats. Ezreal's independent Lux follow-up opportunity increases to 35%; shared-route checks remain active. This is a playtest adjustment pending human feedback.
- Three twelve-minute deterministic simulations measured 33–45 casts per minute; a separate seeded sample observed three distinct simultaneous threats. Regression confirms the removed Xerath Q laser is never scheduled in those long runs. Five focused checks pass; the full historical suite still needs reconciliation.

## Randomized Dodge runs (2026-11-02)

- Each Dodge restart advances the encounter seed using fresh randomness; the scheduler still uses its seeded generator within a run. This prevents identical opening encounters without exposing seed controls.
- Randomization is scoped to the Ahri Dodge director; legacy presets preserve their deterministic replay behavior. Fixed regression accounting to include Lux R and confirm the removed Xerath Q is absent. Four focused deterministic and twelve-minute checks pass. The broader suite still has remaining failures around legacy thresholds, collision scenarios and overlapping threats and is not green.

## Denser Expert playtest (2026-11-02)

- Player requested substantially more skills: Expert director beat is now 0.7 seconds, with up to three concurrent threats and a 0.35-second post-release floor. Forecasts still check committed projectiles and player routes. This needs a human balance playtest; historical cadence tests contain old thresholds.

## Remove confusing second laser (2026-11-02)

- Removed Xerath Q from natural Dodge scheduling after the player reported confusing it with a second Lux laser. Lux R remains available; the Xerath Q implementation is retained for future redesign and isolated tests. Local build key: `no-extra-laser`.
- Updated natural-scheduling regression coverage to enforce this removal across five two-minute Expert simulations, including the former random selection band with a live shot. The Expert cap regression now verifies the current four-threat limit. All three selected tests pass.

## Published build identification (2026-11-02)

- Verified the public GitHub Pages HTML serves `game.js?v=20261102-expert-pressure`. Added a visible build label to the menu so the player can identify this playtest version without inspecting browser internals. Update the label and runtime cache key together when publishing another gameplay build.
- Kite is deferred at the owner's request; Dodge Gauntlet remains the first priority. Full regression suite has unresolved failures and must not be reported as green.

## Expert Dodge fairness calibration: Lux, Cassiopeia, Blitz and Xerath (2026-11-02)

- Recalibrated the playable Expert pressure after a user report that the two-threat cadence was still too crowded. The normal beat is now 2.3 seconds (a 15% reduction in regular launch pressure from the preceding 2.0-second tuning), while the two-independent-threat cap, separate origins, deterministic rhythm and escape validation remain intact. This is an explicit training cadence, not a claim about live-game spawn rates.
- Dodge-only collision is now tighter again: Ahri is a 50-game-unit circle, missile collision is 87% of the reference projectile radius and area collision 86%. Both collision and visible projectile art are still approximate, but this reduces the mismatch where a near-miss looked clear and counted as a hit. The score namespace is `director_v85` so this balance pass is not compared with prior survival records.
- Lux R retains its sourced one-second Final Spark cast, but now first shows Lux for a 0.4-second trainer readability tell before that cast and starts the visible lane beyond Ahri’s impact envelope on its first charge frame. It remains isolated from other directed threats. This directly addresses a too-fast perceived reaction window without mislabelling the extra tell as live Lux timing.
- Cassiopeia R is now a 1.25-second turn-away prompt (0.70 setup + 0.55 cast) with a 700-game-unit trainer range. Facing away remains a zero-damage full evade in Pure Dodge by owner request; this differs deliberately from live League, where the away-facing target is damaged and slowed. No stun, root or residual hit is applied in this trainer path.
- Implemented the current sourced Rocket Grab geometry in the existing pull implementation: 1115 range, 140 width and 1800 game-unit/s missile/pull speed. On collision Ahri is pulled to a terrain-safe point 75 game units in front of Blitz along the locked cast direction; player input and Flash are locked only during that displacement. The full live follow-up combo remains intentionally out of scope for a fair dodge drill.
- Xerath W’s training area is reduced from 220/100 to 200/90 game units and its readable delay is lengthened to 0.958 seconds. Its real W cast/impact relationship remains documented; radius and extra tell are presentation/training approximations, with no debug countdown circle.
- Verification: `node --check game.js`, `git diff --check`, and 22 focused mechanics tests pass: Expert rhythm/cadence, a three-seed twelve-minute cadence run, Lux source tell and executable sidestep, compact Xerath edge damage, live-scale Blitz geometry/pull, Flash-facing behavior, compact collision and all Cassiopeia face-away outcomes. A manual browser test is still required before claiming subjective visual fairness because the browser automation surface is unavailable in this session.

## Expert Dodge recovery loop (2026-11-02)

- A hostile hit now creates a short 0.8-second director hold before any *new* scheduled encounter. Existing missiles, beams and pulls are deliberately not cancelled, so this is not invulnerability or a free reset; it prevents the scheduler from immediately adding a fresh unavoidable-looking layer while the player re-establishes movement.
- The clean-dodge reward now starts after seven untouched seconds and restores 24 HP every seven seconds, in addition to Ahri’s sourced base regeneration. This is a transparent training sustain policy for endless Expert, not live-game health regeneration. Another hit resets the clean timer.
- Three seeded twelve-minute simulations remain active with two maximum independent threats; the intentionally non-dodging harness measured 18–26 completed casts/minute because the new recovery hold is engaged after real hits. The pre-hit, clean-player scheduling cadence remains independently covered by the rhythm tests.
- Verification: `node --check game.js`, `git diff --check`, focused recovery/sustain checks, a 12-minute three-seed cadence run, and paired-threat diversity all pass (5 selected tests).

## Dodge movement-scope and collision initialization correction (2026-11-02)

- Tier-1 boots are now scoped to the Dodge baseline only. Ahri’s shared data model, Kite and CS practice retain her 330 base movement speed, while Dodge starts at 355. This removes an accidental movement-speed leak into farming and attack-timing drills.
- The compact Dodge hitbox is now assigned at reset as well as during the first update. Previously an immediate impact or a safety calculation made in the first simulation frame could use Ahri’s larger general gameplay-radius proxy before switching to the Dodge-only radius. This fixes first-frame collision consistency for beams, projectiles and area grazes.
- Cassiopeia’s exact range boundary now tolerates floating-point rounding, so a cast positioned exactly at the documented trainer range does not silently defer.
- Focused verification: `node --check game.js`, `git diff --check`, and 10 targeted movement, collision, Cassiopeia-boundary, sustain and impact-lifetime tests pass. A broad historical suite still contains stale assertions for retired high-overlap behavior and will be reconciled separately rather than being presented as green.

## Expert predictive reads and Lux identity pass (2026-11-02)

- A moving Ahri is now directly tested more often than a stationary reaction: 40% forward lead, 20% reversal read and 20% lateral-cut read, versus 20% direct aim. Every candidate still passes the same movement/terrain/shared-threat escape forecast before aim lock; this increases route-reading value without silently creating impossible casts.
- Lux Q visitors and the isolated Lux R source now use an original light-mage silhouette with ivory/gold palette, light focus and staff rather than the generic enemy caster. Lux R remains one isolated laser encounter: source tell, a visible charge lane, then its brief impact beam; it is not paired with a second directed threat.
- `index.html` now cache-versions the new runtime as `expert-predictive` for GitHub Pages.
- Verification: `node --check game.js`, `git diff --check`, and 11 selected tests pass, including Lux R tell/locked lane/walk escape, predictive-pattern distribution, base-vs-T1 movement scope, Spirit Rush/Fox-Fire movement and recovery/Cassiopeia behavior.

## Expert pressure follow-up (2026-11-02)

- Restored a demanding Expert tempo after publishing the prior fairness build: the normal director beat is 1.75 seconds, down from 2.3 seconds. The hard limit remains two independently aimed threats, major ultimates remain isolated and each cast still needs a forecasted walking response, so this raises decision frequency rather than restoring the old unbounded projectile pile.
- Combined with the predictive distribution, the intended player read is no longer simply “sidestep the current cursor”: 80% of moving-target casts are forward lead, reversal or lateral cut. The public runtime cache key is now `expert-pressure`.
- Verification: `node --check game.js`, `git diff --check` and 29 targeted Expert rhythm, prediction, Lux, Cassiopeia, recovery, hitbox and 12-minute cadence tests pass. The three deterministic long runs retain a two-threat peak and record 21–29 resolved casts/minute in their intentionally non-dodging harness.

## CS wave body spacing (2026-11-02)

- The two-sided CS simulation now applies a deterministic, same-team minion separation pass after each wave update. Minions that converge on the same chase/target point are pushed apart to roughly their combined gameplay radii while remaining clipped to walkable terrain. Opposing minions are intentionally not separated by this pass so melee contact remains possible. This is a compact training approximation of minion body blocking, not a claim of exact live NavMesh collision.
- Added a crowded-convergence regression alongside the existing two-sided combat, retargeting, cannon, successive-wave, terrain-route and frame-rate tests. The focused CS/minion set passes 16/16, with `node --check game.js` and `git diff --check` clean.

## Expert Dodge playtest recalibration: density, counterplay and sustain (2026-11-02)

- A long seeded simulation exposed a real mismatch with the intended rhythm: prior Expert runs recorded roughly 71–88 launched casts/minute despite the design target of 25–32 meaningful opportunities/minute. The current playtest pass reduces the regular director to a two-threat commitment budget, sets its nominal beat to two seconds, and makes a failed/budget-full attempt wait for most of that beat instead of retrying immediately. This keeps separate caster origins and predictive aim, but creates an actual reset window after a committed dodge; it does not speed up or slow down individual ordinary champion projectiles.
- Major patterns now have their own opening and repeat clocks instead of joining the first scramble: Cassiopeia first becomes eligible at 35 seconds and repeats after 55–80 seconds; Orianna first becomes eligible at 75 seconds and repeats after 90–150; Malphite first becomes eligible at 90 seconds and repeats after 90–150. Lux retains its explicit, sourced charge telegraph. These are trainer pacing values, not assertions about live match cooldowns.
- Long-run cadence instrumentation also showed that the old Ezreal-triggered Xerath-W branch was over-represented and could force a ground strike above an already full two-shot moment. Its Expert opportunity is now intentionally rare (7% rather than 25%), and the automatic two-missile follow-up is removed. Xerath W remains an independently safety-validated line-plus-area pattern, but it no longer turns a successful movement read into a third compulsory visual demand.
- The three-seed, twelve-minute deterministic cadence benchmark after this change measured 26–35 completed casts/minute across minute buckets. It retains every regular spell family and keeps Ezreal dominant; 12-minute Xerath W totals are now 32–37 rather than the earlier 48–63 observed in this harness. A dedicated test asserts the major-pattern arm clocks (Cassiopeia 35 s, Orianna 75 s, Malphite 90 s) after the director initializes.
- Vel’Koz split is now a deliberately isolated Expert read: the director will not arm a new regular visitor while the caster is lining up, the main bolt is live, or either split child is live; it also defers a new Vel’Koz if any regular threat is already active. The two perpendicular children remain a demanding multi-phase single encounter, but no longer form an accidental three-object screen with Lux/Ezreal/Blitz. The same 12-minute benchmark now ranges from 23–32 casts/minute across its measured buckets, with the first-minute diagnostic peaking at two independent threats (Ezreal + Lux) rather than Lux plus both Vel’Koz branches.
- Lux R receives a 0.25-second source-only tell before its sourced one-second Final Spark charge. The locked beam cue then covers Ahri's collision envelope from its first visible charge frame. The additional source tell is explicitly a trainer readability allowance, not a claim that live Final Spark has a 1.25-second cast.
- Cassiopeia R keeps its sourced live-game distinction in the documentation (facing away normally still takes damage plus a slow), but Pure Dodge now treats a successful turn-away as a zero-damage full evade. This honors the owner’s no-chain-CC/learn-the-turn request; the result text labels it as a trainer rule rather than Live parity.
- Added transparent `CLEAN DODGE +18 HP` sustain after every eight uninterrupted seconds without a hit, in addition to Ahri’s 0.5 HP/s level-one base regeneration. A hit resets the timer. This lets disciplined endless practice recover without granting hidden immunity or changing spell damage.
- Blitz Q now pulls a hit Ahri toward the source-side 75-game-unit landing at the sourced 1800 game-unit/s scale. The landing snaps to walkable arena terrain and a 0.5-second safety timeout ends a blocked pull, so it cannot pin the trainer against a proxy wall. Inputs and Flash are locked during the pull; the director defers escape-dependent threats then. Damage still happens before the pull and a lethal hook does not move a dead player. The full follow-up auto/stun system is deliberately not added to Pure Dodge.
- Xerath W has a compact 220-unit outer / 100-unit epicentre training footprint and a 0.12-second readability allowance; Xerath Q’s trainer cue is 0.65 seconds. Its former debug-ring telegraph is replaced with an original compact inward-rune ground effect, with no textual countdown, while collision remains the same circular area. Their source damage ratios are retained, but these are labelled presentation/readability approximations. Player-facing seed controls and seed text are hidden; deterministic seeds remain available internally and in tests.
- Focused tests passing: pacing/cap and major-pattern opening clocks, Lux R tell and walking evade, Cassiopeia turn/escape/result paths, compact Xerath W edges, health sustain, Blitz range/collision/pull and Flash-facing cases (27 selected checks). `node --check game.js` and `git diff --check` pass. The entire test suite is expensive: its selected five 12-minute seeded tests alone completed in 170.4 seconds; the broad runner was previously interrupted at 290s before `game.test.cjs` completed, so do not claim a full-suite green result until that run is allowed to finish.
- Updated residual regression assertions that still encoded the superseded 0.16-second / three-threat director. The current focused Dodge suite now covers the two-second cadence under every flow/spike/recovery phase, compact collision values, the isolated Vel’Koz contract, rare clocks, long-run cadence and all referenced spell mechanics (71 selected checks passing). This is still not a substitute for one completed broad suite or human browser play.

## Expert Dodge readability, response patterns and Pages hosting (2026-11-02)

- Dodge results now name the last resolved hostile spell that hit Ahri (for example, `Last hit: EZREAL Q`). This is direct post-run feedback, not a speculative reaction-time claim, and does not alter damage, collision, score or the endless cadence.
- The default Ahri trainer baseline now uses Tier-1 boots: 355 game-unit movement speed (177.5 canvas units/s). Expert projectile collision is 10% narrower and Ahri's Dodge-only collision radius is 54 game units instead of the prior broad 65-unit gameplay proxy. Visual missile size follows the reduced collision radius, so the visible effect and what can hit are closer together. Standalone reference drills retain their prior collision values.
- Expert’s initial cadence is 0.19 seconds rather than 0.16 seconds, and its hard ceiling is now four meaningful active threats instead of five: a 20% reduction in maximum simultaneous pressure while retaining independent spell origins. Moving targets receive a deterministic mix of direct, forward-lead, reversal and lateral-cut casts; every selected cast is still rejected unless the existing shared walking forecast finds an escape.
- Cassiopeia R’s training cone is reduced to 750 game units (375 canvas), and now uses a 0.55-second presence/setup plus 0.5-second cast: 1.05 seconds total. After the release she visibly retreats for 0.32 seconds and carries no lingering collision. Dodge continues to omit stun/slow intentionally.
- GitHub Pages is configured to publish the root of `codex/controls-and-dodge`, so each push makes the static game available at `https://statego2.github.io/League-Mechanics-God/`. The published page was opened and verified with the current Expert menu and T1 Boots HUD. Local static hosting remains available for immediate play.
- Added focused tests for Tier-1 boots, compact Expert collision and the Cassiopeia window/departure. `node --check game.js` and those focused tests pass. The complete suite remains to be rerun after the current Expert scheduler tuning; long seeded simulation coverage is the next verification task.

## Expert Gauntlet rhythm waves (2026-11-02)

- Expert now repeats a deterministic 41-second rhythm: 27 seconds of stable flow, a 6-second spike at 0.171-second nominal opportunity spacing, a 5-second recovery-in-motion at 0.262 seconds, then three seconds back at flow before the next cycle. The steady baseline remains 0.19 seconds, so even the spike is below the old 0.16-second uncontrolled cadence; the recovery lowers simultaneous-pressure opportunities without pausing the drill.
- This changes encounter timing only: individual spell speed, windup, collision, source placement and the existing shared-escape forecasts are unchanged. It is intentionally not adaptive hidden difficulty and is seed-reproducible. Dodge record namespace is `director_v82` because the runtime cadence changed.
- Tests: `node --check game.js`, `git diff --check`, focused flow/spike/recovery test, 60-second mixed-pressure simulation, compact-hitbox test and Cassiopeia timing/departure test all pass (4/4 selected). Browser smoke: current localhost Expert Dodge starts, reaches 00:01 with 590/590 HP and displays T1 Boots. The broad full suite was previously interrupted while its long seeded simulation file remained pending; do not claim a full green regression run until that runner is profiled or completed.

## Lux Final Spark charge timing (2026-11-02)

- User reported an apparently too-fast Lux R. Investigation found that the existing Gauntlet had only `LUX Q` (0.25-second Q cast) and no Lux R, so changing that number would have made the Q inaccurate rather than correcting an ultimate. Added a separate Expert Final Spark event: a visible Lux-like source charges a clearly growing lane for a full 1.0 second, then resolves its beam. It is isolated from other directed threats, first becomes eligible at 26 seconds and later returns on a seeded 50–72 second interval. It is a training implementation, not a claim of full live-client spell fidelity.
- Follow-up calibration: the Lux source is deliberately behind Ahri, but the old progressive line began before it reached Ahri's body. The player could therefore only *see* the relevant lane for part of the one-second cast even though the simulation waited a full second. The charge now starts beyond Ahri's complete collision envelope at the locked aim point and grows from there. The beam still resolves at exactly 1.0 seconds; range, width and hitbox are unchanged. This is a presentation/readability correction rather than an artificial timing buff.
- Timing basis: Riot's [Lux champion page](https://www.leagueoflegends.com/en-gb/champions/lux/) describes Final Spark as a beam fired after gathering energy; the League Wiki cast-time material identifies Lux Final Spark as a cast-time example, and community discussion/source data consistently reports the one-second cast. Range/width/damage remain documented training approximations and need client comparison before being called exact.
- Lux R's full lane is intentionally visible while charging, unlike the shorter Xerath ambient cue; this makes the reaction practice legible. The summary separates Lux Q from Lux R. Selected tests passed: cadence, full Lux R charge, sixteen seeded spawned beams with an actual normal walking witness executed without a hit, sustained mixed Expert pressure, compact hitbox and Cassiopeia window. Browser smoke verified the current build starts; an unattended player dies before the first scheduled Lux R, so the visual needs a deliberate manual run as follow-up.
- Follow-up correctness: Lux R starts with an empty field and now blocks the generic Expert follow-up scheduler for its entire charge. Xerath's ambient beams remain explicitly composable; Final Spark is not silently treated as one. Regression asserts a visitor cannot join the live Lux R, executes a walking witness, and verifies the charged beam direction stays locked after the player begins moving. Records move to `director_v84`, so older pre-Final-Spark / five-threat survival scores are not compared with the changed gauntlet.

## Expert Xerath Q with straight projectiles (2026-11-01)

- Expert Xerath Q can now overlap committed or in-flight Ezreal, Lux and Blitz shots when one sampled walking route avoids the missiles and the beam at its impact time. Entering visitors may coexist, but their later aim lock must independently avoid the active beam; other directed areas and unsupported multi-phase projectiles still defer. Foundation and Standard retain isolated Q scheduling. Record namespace is director_v81.
- Tests execute a shared escape from the beam plus two missiles, verify a new visitor's response to an existing beam, and observe a natural beam/projectile overlap in seeded play. Browser smoke verified Expert launch and right-click movement. This increases mixed pressure but does not establish five simultaneous eligible missiles or replace skilled human balancing.

## Expert Xerath W with multiple missiles (2026-11-01)

- Expert Xerath W can overlap multiple committed Ezreal, Lux or Blitz shots when a shared walking route clears the shots and the area at impact. Entering visitors are allowed because they have not locked an aim; any subsequent cast must also forecast the active W or be cancelled. Existing area, split/return projectiles, unknown or charmed committed casters and cap violations still defer the W. Standard retains its one-Ezreal limit.
- A seeded follow-up opportunity can schedule W after two straight missiles are released, subject to the same checks. Tests execute shared escapes, check new visitors against active W at impact, observe a natural W plus two live missiles and verify queued follow-ups clear on restart. Full suite passed 381/381; the additional charmed-caster and queue lifecycle checks passed separately. Browser smoke verified Expert launch and movement. Full human playtesting and five simultaneously eligible missiles remain open. Record namespace advances to director_v80.

## Follow-up during a committed Vel’Koz cast (2026-11-01)

- Expert can introduce an independently positioned Ezreal, Lux or Blitz while Vel’Koz is already casting. The shared forecast models its remaining windup, angled main missile, split delay and both branches. Entering Vel’Koz still reserves its encounter until it commits; offscreen, invalid or otherwise unpredictable split geometry is rejected. Standard retains its earlier isolation policy. Record namespace is director_v79.
- Tests execute sampled shared walking responses against the actual committed cast and new projectile, reject unpredictable split geometry, and verify that a separate visitor can enter. Full suite passed 378/378. In four 90-second seeded simulations the measured peak was three eligible missiles simultaneously; five actual missiles remain unproven. Browser smoke verified Expert start and right-click movement. Human balance and visual testing remain needed.

## Vel’Koz joining an existing straight shot (2026-11-01)

- Expert can now select and commit Vel’Koz Q while an earlier straight projectile is active. A single sampled walking response must avoid every existing directed shot and the angled main bolt plus both future split bolts. Unknown multi-phase trajectories, directed areas, out-of-bounds split points and paths with no sampled escape defer. Standard keeps the earlier isolated-split scheduling. The generic direct-shot candidate is replaced by the actual angled split in this combined forecast; record namespace advances to director_v78.
- Added tests executing accepted shared escapes, rejecting an unavoidable existing missile or area, committing a visitor during a prior missile and observing a naturally scheduled release during a live missile. Full suite passed 374/374. Browser smoke verified Expert startup and movement; sustained human playtesting remains needed. This is still not evidence of five simultaneous missiles.

## Expert Vel’Koz split with different straight shots (2026-11-01)

- Expert now permits Lux Q and Blitz Q alongside an active Vel’Koz Q, using the same shared walking forecast for its main bolt, split delay and child missiles. Unsafe, offscreen or unpredictable split phases still defer; Standard and unsupported returning/splitting combinations remain unchanged. The short entry and aim-lock recheck apply. To make these combinations occur more often, a split release gets a seeded 65% opportunity to queue one of Ezreal, Lux or Blitz on the next update; the ordinary cap and forecasts still apply. Record namespace advances to director_v77.
- Executed sampled escape witnesses against each of the three actual Vel’Koz phases for both new spells. A separate integration test observed both Vel’Koz + Lux and Vel’Koz + Blitz actual missiles overlap in seeded sessions, excluding split missiles that can no longer hit the player; this is not proof of five simultaneous missiles. Full suite passed 370/370 and the strengthened missile-eligibility test passed separately. Browser smoke verified Expert start and movement. Manual high-skill balance and visual assessment remain open.

## Expert Ahri orb with different straight shots (2026-11-01)

- Expert can now combine an existing enemy Ahri Q orb with Lux Q or Blitz Q, in addition to Ezreal Q. The shared forecast continues to check the orb's outgoing and returning legs, caster/anchor stability and the new projectile. Standard retains the previous Ezreal-only policy. Entering follow-ups use the existing short multi-phase entry and must pass both spawn and aim-lock checks.
- Added executable witness cases for both spells against outbound and returning orb phases, plus a seeded integration test that separately observes Lux and Blitz missiles naturally overlapping the orb. Full suite 368/368 passed, and the stronger test for each distinct overlap passed separately. This increases variety rather than guaranteeing five simultaneous missiles. Browser smoke: Expert launch and right-click movement; sustained human balance testing remains needed. Record namespace is director_v76.

## Expert escape forecast reuse (2026-11-01)

- Each straight-shot safety decision now builds its incoming missile phases once and reuses the existing reaction path across candidate destinations; Vel’Koz's isolated split forecast likewise reuses the reaction path. The data is scoped to the synchronous decision, so later changes still receive a fresh forecast. Candidate ordering and hit geometry remain unchanged; record namespace remains director_v75.
- A seeded comparison before and after retained 62 casts in the first minute, peak five combined threats and peak three actual missiles. One local test run took approximately 2.65 seconds before and 2.56 seconds after; this small sample does not establish a robust browser performance improvement. A regression test independently rechecks accepted witnesses against the live threats; existing tests execute witnesses against actual collisions. Full suite passed 366/366; browser smoke verified Expert launch and right-click movement.

## Multi-shot walking responses (2026-11-01)

- Measured the earlier five-threat scenario more precisely: the sample reached five visitors/projectiles but only three actual missiles in flight at once. Raising the cap to seven or doubling spawn attempts did not improve that number in the sample, so neither experimental change was retained.
- The straight-shot director now samples longer walking responses as well as the original short sidesteps. A regression test constructs a multi-shot situation requiring a longer response and executes the resulting witness in the real simulation without a hit. In the default 60-second simulation the director now commits 62 casts, compared with 54 under the prior policy, while preserving existing projectile speeds and the shared path check. This remains an approximate forecast and does not prove every possible overlap fair.
- Localhost browser smoke: Expert starts and right-click movement works with multiple visitors. Full suite passed 365/365, including 12-minute seeded runs. Continue researching richer, independently timed patterns if the objective is five simultaneous missiles; the current test does not demonstrate that. Record namespace is director_v75.

## Expert five-threat cadence and visible diversity (2026-11-01)

- The prior five-threat limit did not actually produce five in twelve seeded runs. Expert now attempts a spawn every 0.16 seconds, retries a rejected attempt after 0.08 seconds, and continues to enforce the shared escape forecast and cap. One first-minute simulation reached five active threats and 54 casts; a separate seeded integration test observed five threats with four distinct spells. Counts include entering/casting visitors and missiles, not five missiles simultaneously.
- Spell selection includes visitors still visible while leaving, so an isolated earlier champion is not immediately duplicated. If three different spell types are already present and no compatible unused straight spell exists, duplicates may still occur to sustain five-threat pressure. This is a deliberate compromise until more concurrent-safe champion patterns exist.
- Tested movement in the localhost browser. Full suite passed 364/364, including 12 simulated minutes over three seeds; a skilled human must still judge readability, fairness, visual quality and sustained performance. Record namespace is director_v74.

## Expert Dodge overhaul after player feedback (2026-11-01)

- User reported the mode was far too easy, wanted multiple different spells from independent directions immediately, earlier Cassiopeia/Malphite and a better Orianna R. Revisited Dodge V2 Hard and Skill + Dodge Hard in the browser. Expert now attempts an encounter every 0.28 seconds with a five-threat cap, the entire spell roster available from the start, no delayed difficulty ramp or periodic recovery window, and no scripted identical Ezreal pair. Independent concurrent visitors prefer different straight spells. Forecast checks, spell timings and collision remain in place, so actual concurrency can be below the cap.
- Expert Cassiopeia, Malphite and Orianna first become due at 12, 22 and 32 seconds; after a successful encounter they recur after 32–45 seconds with an eight-second inter-ultimate guard. When a due ultimate is blocked, normal spawns pause briefly to let it enter. These are training scheduling policies, not League cooldowns.
- Orianna R now produces animated rotating arcs and a central flash at impact; there is still no pre-cast targeting circle. Also retained the previous uncommitted fix that forecasts the player's existing movement waypoints rather than inventing a new path.
- A 60-second seeded stationary-player simulation recorded 48 casts, peak four concurrent threats, two Cassiopeia casts and one Malphite cast. In a browser smoke run a stationary player died at 10.9 seconds; a separate short run verified mouse movement with several enemy visitors visible. This does not establish skilled-player fairness or equivalence to the reference. Full suite 361/361 passed, plus the added Orianna-effect and first-minute tests passed separately; long human playtesting remains needed. Existing records use director_v73 due to the substantial difficulty change.

## Expert split follow-up lifecycle (2026-10-31)

- A queued Ezreal follow-up is now discarded if the Vel’Koz threat was removed or became unable to hit the player before the next update. This prevents a resolved combination from unexpectedly spawning an unrelated isolated attack. Pause preserves the queue and restart clears it.
- Added an actual 180-second seeded simulation at 30, 60 and 120 rendered FPS; combat counters and fixed-step timing match, and the run exercises Vel’Koz. Full suite 359/359; syntax and diff checks pass. Browser smoke verified Expert start and pause; long human balance testing remains open.

## Expert Dodge: make split overlap occur in live scheduling (2026-10-31)

- A seeded integration test exposed that allowing Vel’Koz/Ezreal overlap at aim-lock did not produce simultaneous missiles in twelve 180-second stationary-player runs. Expert now gets a 40% seeded follow-up opportunity after Vel’Koz Q release, processed on the next update after its spawn offset has been consumed. The visitor enters briefly and must pass existing shared-escape checks at spawn and aim-lock. Caps, recovery, and failed safety checks still defer the combination. Record namespace is director_v71.
- The new integration test observes both actual missiles alive together in natural Expert scheduling; earlier tests execute the sampled escape against each split phase. Full suite: 356/356 pass; syntax and diff checks pass. Chrome smoke: restarted Expert Dodge and reached results; the unattended run ended in 14.5 seconds and does not validate the later overlap visually. Manual skilled-play balance remains open.

## Expert Dodge: Vel’Koz and Ezreal overlap (2026-10-31)

- Expert can schedule Ezreal Q during an active Vel’Koz Q, including the main missile, split delay and split bolts. A sampled walking response must clear all existing phases and the new cast. Uncertain split predictions defer; other difficulties and unsupported overlaps retain isolation. This conservative training forecast cannot guarantee safety after arbitrary player movement.
- The shorter entry for multi-phase follow-ups enables overlap while preserving cast-time safety checks, active-threat caps and recovery. Dodge record key advances to director_v70 because difficulty changes.
- Validation: node --test tests/*.test.cjs passed 355/355; node --check game.js and git diff --check passed. Chrome loaded Expert Dodge and reached the result screen; the unattended smoke run ended at 14.5s, so human balance testing remains necessary. Tests execute sampled escape routes against actual main, delay and child phases.
- Next: observe natural occurrence across long Expert sessions and tune readable pressure through manual playtesting; avoid targeting guides or stun.

## Visual direction clarified by user

The user expects the game to look and feel like League of Dodge / League: a convincing three-quarter, pseudo-3D MOBA camera, substantial champion-like characters and a cohesive lane environment. The current flat vector arena does not meet this bar. Treat this as a high-priority product requirement, not optional polish. Observe the reference in a browser and compare actual gameplay before implementing; retain functional controls and hitbox readability. The repository contains analysis and import tools, not a complete copied game or its original assets.

## Visual pass (2026-10-30)

- Observed the actual League of Dodging V2 in the browser: upright character, oblique view, organic green ground, winding dirt paths and rocks. Its visual assets were not copied.
- Replaced the geometric court with an original procedural lane, grass and rocks; drew upright animated player and enemies with feet anchored at their existing collision centres and raised health bars. This is an incremental 2D approximation, still substantially simpler than the reference; high-quality character sprites, environment assets, occlusion and full directional animation remain needed.
- `node --test tests/game.test.cjs`: 19/19 pass; browser smoke-tested Kite Arena rendering. No full manual run completed.

## Painted art pass (2026-10-30)

- Generated and integrated original `assets/arena-lane.png` and transparent `assets/ranger.png`; prompts and limitations are in `assets/README.md`. Original procedural scene and character remain as image-load fallbacks. Rocks and foliage are decorative and do not block movement.
- Ranger now has a detailed sprite, mirrored facing, movement bob and windup tilt; this is one pose, not full directional or attack animation. Enemies and minions still need matching artwork. Enemy body clicks now select the ground-anchored target.
- Browser smoke test: Kite Arena and Last-Hit Lab render the painted lane; Last-Hit Lab shows sprite, minions, health and HUD. No console warnings/errors in the final browser test. `node --test tests/game.test.cjs`: 20/20 pass, including elevated body selection. Full manual completion and cross-browser/performance checks remain outstanding.

## Skillshot and records (2026-10-30)

- Added Skillshot Lab: 45 seconds, three seeded moving targets, Q at 0.8s cooldown, W/F mobility, and a results breakdown of hits/shots/accuracy. Auto-attacks and E/R disabled in this drill. Q projectiles still in flight when the timer ends count as fired but not hit.
- Local personal bests are recorded per drill and difficulty: Dodge points, Kite wins and fastest winning time (or most kills before the first win), Last-Hit CS, Skillshot hits. Storage failures are caught and do not interrupt play; seed is not part of the record key.
- Tests: `node --test tests/game.test.cjs` 22/22 pass including accuracy, timer and storage failures. Browser smoke: Skillshot selected, Q raised SHOTS to 1, pause froze counters; full manual run not yet done.

## Mid lane and combined drill (2026-10-30)

- Commit `5c07181` adds Skillshot Lab and local records. This session also adds Bait → Dodge → CS: three rounds; enter the ring to trigger a locked shot, evade or take damage, then last-hit within three seconds. Must leave the ring before triggering the next round; offensive abilities disabled. Bait, dodge, CS, misses and damage are reported separately. Dash/flash immunity does not count as a dodge.
- Added `assets/mid-lane.png`, `mage.png` and `minion.png` via built-in image generation (full prompts in assets/README.md), retaining procedural fallbacks. The image evokes mid lane but is not an exact map: walls, river and trees are decorative, with no collision or pathfinding. Sprites are single poses, not directional animation sets.
- Tests `node --test tests/game.test.cjs`: 27/27 pass, including successful bait/dodge/CS, failed rounds, spawn separation, early attack restriction and rendered asset/fallback paths. Browser verified new scene, Bait ring and enemy cast causing 18 damage and transition to round two. Complete human run not tested. Skillshot Q and pause verified in browser; no manual full accuracy run.
- Next: implement actual lane topology and pathfinding with visible collision boundaries; create directional animated sprites and test a full run at varying performance; expand Bait scenarios with allied minion attrition and calibrate enemy timing.

## Directional sprites and lane feel (2026-10-30)

- Added original `assets/ranger-back.png` and `assets/ranger-front.png`, generated from the ranger reference; prompt provenance is in assets/README.md. The renderer chooses front/back/side according to facing, mirrors left/right, retains the fallback for unavailable artwork and depth-sorts player/enemies by ground Y. These are static poses with bob/tilt, not full animations.
- Telegraphs show the projectile width and windup progress. Enemies enter from lane ends and target spawns stay separated; Last-Hit minions are positioned within the painted lane.
- Bait minion starts at 34 health and an allied projectile starts damaging it only during the CS window. This adds a real contested last-hit; the gold threshold remains 28. Added T for instant retry in play, pause and results. Menu uses two columns on desktop for all five drills.
- Browser smoke: Last-Hit starts on the new lane with red/blue minion art; right-click movement displayed the new directional art. Earlier browser test verified bait cast, damage and round transition. `node --test tests/game.test.cjs`: 29/29 pass including facing/fallback and three-round bait failure/success. A full 45-second Skillshot browser run reached results with 0/1 shots and 0% accuracy; the local-best display appeared. A successful human full run, all difficulty balancing, mobile and cross-browser testing are not complete.

## Kite personal best correction

Kite records now prefer a completed run, then the fastest victory; before the first win, the best kill count (then survival time) is retained. Old v1 Kite kill-only records are not migrated. Storage failures still leave the drill playable. Regression suite: 30/30 PASS.

## First physical walls and pathfinding (2026-10-30)

- Added `world.js` with two hand-authored, visibly outlined rectangular wall proxies, a visibility-graph pathfinder and swept movement clipping. Right-click and attack-move route around them; enemies replan while chasing. Clicking inside a wall selects a nearby walkable point. Dash stops at walls; Flash crosses walls but lands outside them. The exact League collision map is not available, and the remaining illustrated rocks, foliage and river are decorative. Projectiles currently pass through walls.
- `node --test tests/*.test.cjs`: **40/40 PASS**, including 500 seeded start/goal paths, click inside wall, dash/flash, retarget during detour, attack-move and enemy chase around a wall; existing gameplay suite remains green. Updated CI to run both files.
- Browser: Last-Hit opened with wall outlines; a right-click sent the character across to the opposite side of the upper wall. An unattended five-wave run finished with 0/15 CS and 15 missed, with results displayed. No console warning/error was observed at start. Exact wall-to-art alignment, full user playthroughs and cross-browser behavior still need work.

## Moving opponent and CS calibration (2026-10-30)

- Bait caster now patrols a small seeded path, locks position and aim for the cast, and shifts its starting position each round. Minion HP is 34/36/40 for easy/normal/hard respectively; allied damage and timing create a last-hit window on every preset. The earlier constant-34 description records the prior implementation.
- `node --test tests/*.test.cjs`: **42/42 PASS**. Tests cover caster moving/locking, a valid last-hit window for every difficulty, wall navigation and all existing drills.
- Browser: in Bait, used mouse movement to enter threat radius and dodge, then selected the minion during the allied-damage window; HUD showed **1 dodge, 1 CS and 160/160 HP** at round 2. Browser console warnings/errors: none.

## Threat scoring and optional sound (2026-10-30)

- Fixed Bait avoidance resolution: the shot must actually pass the player (or leave the arena); running away on its line no longer causes an early false dodge while it is still approaching. Added a regression where it eventually catches the player.
- Added optional synthesized Web Audio cues for attack release, impact, damage and avoidance; disabled by default and enabled by the SOUND button. Missing/failed audio never interrupts simulation. Browser checked ON/OFF button and no console warnings/errors; automated checks exercise missing audio and enabled/muted cues. Actual subjective audio quality and other browsers remain unverified.
- `node --test tests/*.test.cjs`: **45/45 PASS**. CI runs both game and world suites.

## Initial Lane Scenario (2026-10-30)

- Added a 60-second combined drill: five allied/minion waves and one enemy champion that attacks the player. The enemy respawns after a 12-second timer if dead. All Q/W/E/R/F abilities are available. Results distinguish player CS, allied misses, enemy defeats, avoided threats, hits and damage; a minion last-hit does not heal the player. Local best is CS by difficulty.
- `node --test tests/*.test.cjs`: **48/48 PASS**, including 60 seconds/15 minions, CS vs champion attribution, health behavior and all previous wall/control/scoring tests. Browser: Lane Scenario started with enemy/minions and abilities, enemy dealt 18 damage, an unattended run ended after death and showed 0 CS, 6 missed and 9 hits. This is a basic single-opponent scenario; no complete human victory/balance evaluation has been performed.

## Restart and finish consistency (2026-10-30)

- Reset clears old toast feedback. A finishing Pulse stops processing further enemies and missiles immediately, and fatal contact stops the rest of the enemy update. This keeps the displayed result, kills and block totals consistent with the actual final state.
- `node --test tests/*.test.cjs`: **51/51 PASS**, including finish-on-first-target, fatal-contact ordering and toast reset. Earlier human-controlled browser test confirmed 1 dodge + 1 CS at full health in Bait; Lane Scenario browser test verified enemy damage and a loss/results screen. Terrain remains approximate rather than the actual LoL collision mesh.

## Attack speed presets (2026-10-30)

- Menu offers 0.80, 1.39 (original default), and 2.00 attacks/second; windup scales proportionally. Apply on start/retry, HUD shows the chosen value. Records are separated by difficulty and speed; standard keeps existing record keys.
- A target escaping beyond release tolerance during windup now counts as a cancelled attack and consumes no cooldown.
- `node --test tests/*.test.cjs`: **54/54 PASS**; all three speeds have expected attack counts at 30/60/120 FPS, and records are separated. Browser selected 2.00 and started Kite Arena with the correct HUD. Full manual kiting feel and difficulty balancing remain unverified.

## Dodge sweeping wall (2026-10-30)

- Dodge Trial now telegraphs a sweeping row of missiles starting at 14 seconds and every 18 seconds thereafter, with a 1.4-second warning and a marked gap. Gap centre is constrained to the unobstructed middle lane; missile speed scales with difficulty. The normal per-projectile threat logic applies. Other enemy skillshots can overlap this pattern, so combinations still need human balance testing.
- `node --test tests/*.test.cjs`: **56/56 PASS**. Tests cover safe-gap collision/dodge accounting, walkability across the corridor, pause, and restart. Browser: played Foundation to 14 seconds, observed warning, gap, three dodges and 124/160 HP; subsequently died at 18.3 seconds and saw results. Console warnings/errors: none. A human full completion is still unverified.

## Kiting timing feedback (2026-10-30)

- Kite results show the time the auto was ready with at least one enemy in range and no active windup, alongside auto DPS, release/cancel count, movement percentage and damage received. This is descriptive: waiting can be intentional while dodging or spacing.
- `node --test tests/*.test.cjs`: **57/57 PASS**; the timing metric increases while idle and remains near zero during continuous attacks in a controlled fixture. No human calibration of this feedback yet.

## Ahri and real skillshot direction (2026-10-30)

- Added an opt-in Ahri timing preset: 0.668 attacks/s and 20% windup, based on Riot patch 13.22. The normal prototype default and its records remain unchanged. This preset changes timing only: it does not yet implement Ahri damage, range, movement, projectile speed, resistances or abilities.
- The Blueprint now contains a sourced, patch-aware plan for a full level-1 Ahri baseline, CS with mitigation, a consistent unit scale and real Lux Q / Ezreal Q training. Those spells are not yet implemented. Community wiki values still need in-client verification.
- `node --test tests/*.test.cjs`: **60/60 PASS**, including timing and windup at 30/60/120 FPS. Browser smoke: selected Ahri timing, started Kite Arena and confirmed HUD shows AS 0.668. No full manual Ahri preset playthrough yet.

## Experimental Ahri last-hit profile (2026-10-30)

- Selecting 0.668 Ahri timing / CS activates an experimental profile in Last-Hit Lab: 53 auto damage, 465-health targets with implicit zero armor, player speed 165 canvas units/s and auto missile 875 canvas units/s, using an initial scale of 0.5 canvas units per League unit. The gold threshold and results text show 53. The original profile remains the default and old timing-only Ahri CS records are kept separate from the new profile. Other modes retain their existing values except attack timing.
- Allied hits are accelerated training approximations (40/50/60 damage per hit by difficulty), not authentic wave simulation; attack range, collision radii, abilities, items, runes and other resistances remain uncalibrated. Not a complete Ahri implementation.
- `node --test tests/*.test.cjs`: **62/62 PASS**: verifies lethal boundary 53/54, records, and unattended wave resolution for each difficulty. Browser started Last-Hit with Ahri selected and confirmed HUD; a complete human CS run is still needed.

## Physical mitigation foundation

- Auto attacks now apply target armor at impact, and the gold last-hit threshold uses the same calculation. Present minions still have zero armor; this prepares other minion types and later upgrades without pretending their waves are already modeled. Basic negative armor is supported; penetration and damage modifiers are not.
- `node --test tests/*.test.cjs`: **63/63 PASS**, including an armored target immediately above and at the lethal boundary. A further 64th test confirms an Ahri auto can secure a minion after allied damage at every difficulty, from a controlled in-range position.

## Reference spell dodge drills (2026-10-30)

- Added standalone Lux Q and Ezreal Q dodge drills. A stationary caster aims every 3.5 seconds after a 0.25-second cast; a training-only line shows the locked aim. The player has 590 HP, 165 canvas units/s movement and Ahri level-1 resistances. With a provisional 0.5 canvas-unit scale: Lux Q speed 600, range 650, radius 35, 80 base magic damage reduced by 30 MR and 2-second root; Ezreal Q speed 1000, range 600, radius 30, 98 base physical damage (20 + 130% of 60 AD) reduced by 21 armor. Flash does not grant invulnerability here and is usable during root. Spell damage and root freeze on pause; missiles stop at maximum range.
- These are approximations, not full LoL implementations: visible telegraph, fixed 3.5-second interval, locked caster, simplified player radius, no minion interception, Lux two-target interaction, tenacity, items, runes, on-hit effects or precise Flash cooldown. Difficulty does not change these drills. A screenshot/feel comparison and a full human survival run remain open.
- Browser: started both drills, each registered a hit; Lux root was visible. `node --test tests/*.test.cjs`: **69/69 PASS**, including cast delay, range, damage, root/pause, Flash and 30/60/120 FPS. A further full-duration automated survival test covers both result screens from outside missile range; this is not a human playthrough.

## Ahri CS wave recalibration (2026-10-30)

- Ahri Last-Hit profile now contains two 30-second-spaced waves, each with three 465-HP melee and three 284-HP caster minions (12 possible CS). Each row first focuses melee, then caster. Allied damage uses base melee 11 + 2% of current HP at 1.25 attacks/s, and caster 21 + 3.5% current HP at 0.667 attacks/s, using [melee](https://wiki.leagueoflegends.com/en-us/Melee_minion) and [caster](https://wiki.leagueoflegends.com/en-us/Caster_minion) reference statistics. Ahri attack reach uses 550 range plus source and target gameplay radii at the provisional 0.5 scale, per [edge range](https://wiki.leagueoflegends.com/en-us/Attack_range). Local records are partitioned from the earlier approximation.
- This is still not a full League wave: allied minions are scripted attackers rather than independently targetable units and cannot die; enemy attacks, pathing/aggro, real windups, wave upgrades, siege minions and exact projectile behavior are missing. W/F remain the prototype abilities. The waves start at drill time zero rather than the actual match clock. Difficulty does not change the Ahri wave. Browser smoke showed six minions and WAVE 1/2; no complete human run yet.
- `node --test tests/*.test.cjs`: **72/72 PASS**, including composition, damage ratios, attack reach and two-wave resolution.

## Focused menu and Ahri baseline (2026-10-30)

- User explicitly asked for a few polished modes, with Ahri as the base player. Menu now exposes only Dodge Trial, Kite Arena and Last-Hit Lab; legacy modes remain in code and tests. Attack speed selection is hidden and Ahri is the default: 0.668 AS, 20% windup, 53 auto AD, 590 HP and scaled 330 movement / 1750 auto projectile speed. CS uses the six-minion Ahri waves by default. Range is edge-based and uses approximate scaled radii.
- Dodge Trial now alternates the previously standalone Lux Q and Ezreal Q implementations per enemy; difficulty affects encounter spawning but does not scale those projectile values. Dodge records are separate from earlier modes. The old synthetic sweep is not used in the default Ahri dodge.
- The player is still shown as the original ranger, and Q/W/E/R are prototype abilities, not Ahri. Dodge enemy AI, telegraphs, collision, resistance, allied minion simulation and the arena remain approximations; do not claim full fidelity. Legacy mode code is retained, but no longer exposed as separate menu cards.
- Browser: confirmed three menu cards, default Ahri CS with wave 1/2 and AS 0.668, and launched Dodge Trial with a projectile telegraph. No complete human session after this change. `node --test tests/*.test.cjs`: **74/74 PASS**, including default settings and both spells in the shared drill.

## Ahri Q and E foundation (2026-10-30)

- Implemented rank-1 Charm (E) for the default Ahri player: 0.25 s cast, 12 s cooldown, scaled 1550 speed / 1000 range / 120 width, 80 magic damage before target MR, first target only, and 1.2 s charm that interrupts enemy casts and makes enemies move toward the player at 35% speed. Movement commands queue during the cast. Training enemies currently have no explicit MR unless set, and the CC AI is an approximation; no mana, AP scaling, tenacity, spell shields or all League cast interactions.
- Implemented rank-1 Orb of Deception (Q): 0.25 s cast, 7 s cooldown, scaled 1550 outbound speed / 900 range / 200 width; 35 magic damage outbound and 35 true damage returning, once per target per pass. Orb returns toward the moving player and pierces enemies. Its fixed 700 canvas units/s return speed approximates League's variable acceleration; turning-point splash, mana, AP, full collision/range effects and ability ranking remain unimplemented. Q/E are intentionally disabled in current CS drill.
- Parameters sourced from [Ahri reference](https://wiki.leagueoflegends.com/en-us/Ahri), community snapshot last changed V26.06; compare against current game client. W, R and the ranger sprite are placeholders.
- Browser smoke: Q in Kite showed the orb and cooldown; E showed the Charm label and cooldown in a separate smoke. Tests exercise delayed casts, pause, interruption, first-target collision, multi-target orb and return tracking: `node --test tests/*.test.cjs` **79/79 PASS**. No human full run or in-client feel comparison yet.

## Ahri Fox-Fire (2026-10-30)

- Default Ahri W is now Fox-Fire instead of the prototype dash: 9 s cooldown, 40% move-speed boost decaying linearly over 2 s and three homing flames, with 40 magic damage for the first hit and 16 for additional hits on the same target before MR. Flames prioritize charmed targets then closest enemies, launch after a short delay and do not interrupt attack windup. Q/W/E are disabled in the auto-only CS drill; Flash remains available.
- Reference: [Ahri](https://wiki.leagueoflegends.com/en-us/Ahri), community V26.06 snapshot. Target priorities, exact flame timing/targeting, minion interactions, AP, mana and LoL speed caps are simplified. R and the ranger sprite remain placeholders.
- Browser: Fox-Fire rendered three orbiting flames and a 9-second cooldown in Kite. `node --test tests/*.test.cjs`: **81/81 PASS**, including boost, damage/mitigation, windup preservation and CS restriction. No full human playthrough.

## Ahri Spirit Rush (2026-10-30)

- Default Ahri R now starts a 140 s cooldown and a 15 s, three-charge window, with 1 s between casts; each cast dashes up to 250 canvas units and fires up to three homing 75-magic-damage bolts after movement. Dash is continuous, checked against enemy missiles using swept player movement, and is not invulnerable. Root blocks starting it; Q/W/E/R remain disabled in the auto-only CS drill.
- Source: [Ahri Spirit Rush](https://wiki.leagueoflegends.com/en-us/Ahri), community V26.06 snapshot. Not full fidelity: simplified targeting and fixed dash speed, no kill-based charge extension, spell levels, AP, mana, full wall traversal, exact cast interactions or allied/minion targeting. The character sprite is still the old ranger.
- `node --test tests/*.test.cjs`: **83/83 PASS**, including charges, cooldown, homing damage, root and dash collision. Browser started Kite, used R, observed movement and ×2 charges. No full human run or real-client comparison.

## Ahri visual sprite (2026-10-30)

- Added generated transparent `assets/ahri-side.png`; default Ahri now renders this sprite anchored near the gameplay position, mirrored for horizontal facing. Original ranger images remain as fallback if loading fails. Prompt and provenance are in assets/README.md. One static pose with existing bob/tilt, not a 3D model or true directional animation.
- Browser: opened Last-Hit Lab at desktop size and confirmed the Ahri sprite appears on the lane with visible health/range indicators and six minions. `node --test tests/*.test.cjs`: **85/85 PASS**, including sprite load and fallback. No full human run or cross-browser visual check.

## Ahri back pose (2026-10-30)

- Added `assets/ahri-back.png`, generated from the side sprite using the built-in imagegen tool. It appears when facing toward the upper part of the map; missing back art falls back to the side pose and missing side art falls back to the ranger. Both are static poses, not animated 3D models. Prompt and provenance are in assets/README.md.
- Browser: moved toward the upper lane in Last-Hit and observed the rear pose. `node --test tests/*.test.cjs`: **86/86 PASS**, including directional selection and fallback plus Spirit Rush recast-window pause/expiry.

## Hitbox, scale and product direction (2026-10-30)

- User clarified that focused drills do not replace the long-term laning vision: make the minion simulation and hitboxes credible, then build a difficult combined CS/bait/dodge lane experience. Dodge should retain the variety and chaos of overlapping patterns. The user believes the current mid-lane visual is too narrow and offered a reference screenshot; the current map is generated artwork with only two approximate physical walls, so no exact mid collision geometry or lane width has been established.
- Sources: [Riot 2024 gameplay preview](https://www.leagueoflegends.com/en-au/news/game-updates/2024-gameplay-preview/) describes added space in mid; [Riot map changes](https://www.leagueoflegends.com/en-sg/news/dev/dev-season-2024-map-changes/) discusses safer paths. [Minions](https://wiki.leagueoflegends.com/en-us/Minions) describes first-wave targeting and upgrades. Exact current map geometry and in-client verification remain open.
- Reduced Ahri sprite draw size to 70% of prior size while maintaining foot anchoring. Separated movement/path radius (17 canvas units, still approximate) from projectile gameplay radius (32.5, corresponding to Ahri 65 at provisional 0.5 scale); Ahri-targeted spell collision and threat detection use the latter, and enemy champion/minion collision uses scaled 65/48 gameplay radii. A visible ground circle marks player radius. Movement-radius, perspective, enemy models, terrain height and collision are still approximate.
- Fixed non-piercing player projectile ordering to use earliest swept-circle contact instead of nearest target center. Boundary and ordering tests cover hits just inside/outside both champion/minion radii. Expert is the default, and the synthetic sweeping gap pattern again overlaps the Lux/Ezreal Dodge spells; its extra 45-damage bullets are training-only, not a real LoL spell. Difficulty choice remains available. Dodge local records are versioned separately.
- `node --test tests/*.test.cjs`: **90/90 PASS**, including hitbox boundaries, collision order and the restored sweep. Browser smoke: expert is selected; Ahri and her ground circle render in Last-Hit. A manual 60-second difficult Dodge run and complete human CS run are still unverified.

## Ahri passive and minion mitigation (2026-10-30)

- Ahri gains a fragment for each player minion kill, healing 35 at nine fragments; a champion takedown heals 75, capped by max HP. A champion takedown while Spirit Rush is active grants a charge up to three and keeps the recast window at least 10 seconds. Values are the level-1, no-AP reference approximation; real takedown attribution, level/AP scaling and full passive/ultimate interactions still require work.
- Allied melee and caster damage now go through the target armor calculation, including current-health bonus damage. Current training minions have zero armor by default; minion simulation still uses scripted attackers and needs real bidirectional units and target selection.
- `node --test tests/*.test.cjs`: **93/93 PASS**. Added tests for ninth CS heal, champion heal/cap, armored allied damage, and R charge gain.

## User mid-lane screenshot and reframing (2026-10-30)

- User supplied an in-game screenshot of the mid-lane wave and requested a view slightly farther up the lane. Replaced the arena background with `assets/mid-reference-v2.png`, a generated ground-only scene using that screenshot for layout; original art remains in the repo. The view has broad engraved paving, grass shoulders, upper-left river ramp/brush and a lower-right embankment. Prompt and reference provenance are in assets/README.md.
- Moved the two hand-authored collision rectangles toward the illustrated edge structures, opening more central ground. Their dashed overlays show the approximate collision boundaries. These are still rectangular proxies, not a trace of the actual Rift, and the rest of the illustrated terrain is decorative. The user's image is a camera reference, not a measured collision map; exact lane topology still needs work.
- Browser smoke: Last-Hit Lab loads the new background, Ahri and the two marked wall regions. `node --test tests/*.test.cjs`: **93/93 PASS**, including pathfinding, dash/flash, obstacle avoidance and 500 randomized routes using the adjusted walls. No full human playthrough on this map yet.

## Mid framing adjustment (2026-10-30)

- User clarified that the view should be slightly farther up and to the right. The existing background is now framed using its upper-right 96% crop; no new background was generated. The two approximate wall proxies were transformed to remain aligned with the shifted image. These are still illustrative rectangles, not the actual Rift map.
- Browser opened Last-Hit with the adjusted framing. `node --test tests/*.test.cjs`: **93/93 PASS**, including movement, wall routing, dash/flash and 500 randomized routes. No full human playthrough after this framing change.

## Recentered mid lane (2026-10-30)

- User rejected the prior small crop and supplied a League of Dodge screenshot to show a centered camera composition. Generated `assets/mid-centered-v3.png` from the existing mid art, using the new screenshot for framing only: the broad stone lane and open combat area now sit near the image center. Removed the prior crop and adjusted the lower collision proxy toward the painted wall. Full prompt and provenance are in assets/README.md; earlier art remains available.
- Browser smoke: Last-Hit loads the centered map with Ahri and the minion wave. `node --test tests/*.test.cjs`: **93/93 PASS**, including navigation and 500 random routes. The two physical walls remain approximate; no exact Rift mesh or full manual playthrough is claimed.

## ZIP-driven development and Dodge feedback (2026-10-30)

- User requested no immobilizing stun/root in Dodge Trial: hostile hits still deal damage, but do not root in that drill. Other legacy reference modes keep their previous behavior. User also requested a future high-attack-speed ADC for Kite instead of Ahri; recorded in Blueprint, not implemented yet.
- Imported the supplied ZIP locally under the ignored reference originals/archives with paths preserved. Actual Kiting and Farming were started in a local browser; reference Farming shows allied and opposing waves and Kiting offers 2.50 setting. Their behavior informed an independent implementation; no original code or art was copied.
- Ahri Last-Hit now spawns six actual allied and six enemy minions per wave, each with HP, attack cadence, target retention/retargeting, movement toward range and independent death. Melee strikes and caster missiles damage opposing units using existing damage/armor rules. Only the player killing an enemy earns CS; ally kills count missed. The previous Ahri CS record key was versioned. This is still an early approximation: no cannon, exact LoL minion AI/aggro, windup, minion-vs-champion aggression, proper lane pathing or wave interaction, and no claim of exact Riot behavior.
- Browser: reference Kiting and Farming entered gameplay; our Last-Hit showed both teams losing HP and firing, without console warnings/errors. A short manual click did not produce a confirmed last hit; human full-run timing and balancing remain open. `node --test tests/*.test.cjs`: **97/97 PASS**, including both teams taking damage/death, retargeting, CS attribution, pause and 30/60/120 FPS. Python reference tools: **8/8 PASS**.

## Current playable state

Dodge Trial, Kite Arena and Last-Hit Lab are available in the visible menu locally at http://localhost:8080. The repository was cloned into the `League-Mechanics-God` subdirectory of the original workspace, whose parent contains separate historical Unity research. Work is on `codex/controls-and-dodge`, based on `7de3430`.

## Completed: controls and collision foundation

- Persistent right-click attack orders chase the live target; newest movement/target command wins.
- A + click travels and acquires targets in range, preferring units near the clicked destination.
- Explicit windup → release → recovery: movement cancels uncommitted attacks; launched autos home to their target and survive movement. Stop with S.
- Fixed 120 Hz simulation; swept relative-motion collision for missiles; nearest collision selection for piercing-free skillshots.
- Dodges require an actual trajectory threat within 0.8 s before avoidance. Pulse/invulnerability blocks are separate; unrelated expired shots score zero.
- Range, target, windup, cooldown/ready cues; results report released/cancelled autos, hits and blocks.
- Blur/tab hiding pauses; restart clears state and restores the pause button label.

Commit: `ce38142` — persistent attack orders, cancellable windups and truthful dodge scoring.

## Completed: readable, reproducible encounters

Commit: `34830db`.

- Foundation/Standard/Expert presets and selectable encounter seed. Restart rewinds gameplay RNG; cosmetic particles use a separate RNG.
- Locked-aim line/fan telegraphs, stationary casting enemies, delayed ground-circle impacts every third Dodge cast. Ground avoidance and invulnerability blocks respect threat accounting.
- Original vector ranger/mage silhouettes, directional weapons, articulated steps, player health/hurtbox, floating damage and stone court. No third-party art.
- Browser: Foundation selected, seed changed to 177858, Dodge Trial started; movement, seed HUD, new art and health displayed correctly.

## Completed: Last-Hit Lab and drill navigation

Commit: `89e7529`.

- Five waves / 15 possible CS. Allied caster missiles travel and damage enemy minions; only the player's killing blow earns CS. Misses are counted once per allied kill or unresolved minion at timeout.
- Gold health bars and a damage threshold mark the 28-damage last-hit window. Q/E/R disabled for this drill; W/F remain available. Adjacent waves settle in different columns to keep targets selectable.
- Results report CS, misses and cancelled autos; Kite results include auto DPS and movement time.
- Hold right mouse while moving the cursor to update orders. DRILLS button returns to selection without reload; held pause keys no longer toggle repeatedly.
- Real browser verified: right-click selected the middle minion, displayed windup, released autos and earned **1 CS**; allied kills then increased MISSED to **2**. No console errors/warnings captured. Pause displayed the correct frozen counters.

## Latest continuation: complete Bait run and narrow-screen results

- A manual browser run completed all three Bait → Dodge → CS rounds on normal difficulty: 3 spells baited, 3 dodged, 3/3 CS, 0 missed and 0 damage. The elapsed time included pauses between manual inputs and is not a performance benchmark.
- The drill menu can be scrolled on narrow screens. Results and pause now reset its scroll position so the title and score are visible; a regression test covers both transitions.

## Skillshot targets and physical walls

- Skillshot targets now spawn outside the two collision proxies and their movement is clipped at walls, so they cannot drift into or through blocked terrain. Their sinusoidal motion resumes when its desired position moves back into open space.
- `node --test tests/*.test.cjs`: **59/59 PASS**, including 100 target spawn attempts and 10 seconds of movement near a wall. Manual visual calibration near the wall remains open.

## Tests actually run

- `node --test tests/*.test.cjs`: **97/97 PASS**, executes real game source with a minimal DOM and seeded randomness. Covers cancellation/release, chase, rapid retarget, attack-move travel/selection, dodge vs block accounting, fast swept collision, homing/target exclusivity, 30/60/120 FPS cadence, pause/restart/blur and both end conditions; locked aim, line/fan/AoE sequence, ground threat scoring, seed reproducibility; full 15-minion unattended resolution, CS vs allied projectile kills, spell restrictions, held mouse retargeting and drill navigation; death immediately freezes unresolved hazards; Skillshot accuracy, safe target spawn, local records, full Bait success and failure, and artwork fallbacks.
- `node --check game.js` and `git diff --check`: PASS.
- Python reference tools: `python3 -m unittest discover -s reference/league-of-dodge/tools -p 'test_*.py'`: **8/8 PASS**.
- HTTP server logs: app, JS and CSS return 200/304; initial missing favicon fixed with an original SVG icon.
- Actual IAB browser at 1280×900: initial alpha started; revised Kite starts, accepts right-click/A+click/QWERF, shows all cooldowns, pauses and renders. Console warning/error capture empty. Dodge Trial also reached its loss/results screen in the browser, showing 9 hits and 0 false dodges; full manual survival/win playthroughs remain unverified.
- These automated tests are simulation regressions, not proof of cross-browser feel or a human 60-second playthrough.

## Known limits

- Original reference archives/art are absent from git by design. Read all reference docs/tools; use independent art and logic.
- Gameplay CI workflow added for pushes/PRs; remote run status has not been verified.
- No public deployment verified. Local server only; no claims about GitHub Pages.
- Visuals are original procedural vectors; further animation and sound polish remain.
- Only two approximate wall proxies have collision/pathfinding; the rest of the terrain is decorative. Lane Scenario is an early single-opponent drill, not a full lane simulation. Optional synthesized audio is available. Last-Hit Lab is timing practice without hostile enemy pressure.
- Attack range is center-to-center and calibrated for this arena, not a claim of exact LoL data.

## Next three actions

1. Calibrate the new two-sided wave simulation against League: windup, first-wave target rules, cannon and minion aggro, then manually play full waves.
2. Expand Lux Q and Ezreal Q training with accurate collision sizes and minion interception, complete relevant effects and validate against real gameplay; distinguish training warnings from authentic cast time.
3. Replace two rectangular wall proxies with a carefully traced, original mid-lane terrain mesh and navigation, including rivers and jungle entrances. Acceptance: visible walls match collision, no entity spawns inside obstacles, clicks and chase route around them.


## Archive audit and reference follow-up (30 October 2026)

- Imported the supplied `loldodge-all-updated.zip` privately, preserving its tree; SHA-256 and every file are recorded in `reference/league-of-dodge/ZIP_INVENTORY.md`. Originals and archive remain Git-ignored.
- Kiting and Farming reached gameplay locally; Dodge, Skillshot, 1v1 and Duo hit missing-extension errors, MOBA Battle lacks its game script, and LoL Rogue reaches champion selection with missing images. See the reference manifest for exact scope and static audit limitations.
- Auditor now detects GameMaker exports with query-suffixed filenames and their extension/atlas dependencies: 372 resolved, 18 missing static references, 97 external/inline and zero escapes. Python reference tests: 8/8 passed.
- `5c9a0cc`: independent two-sided minion waves and caster travel; removed roots only in Dodge Trial. Gameplay tests: 97/97 passed. Browser observed both waves fighting with no console errors; a complete human CS calibration is still needed.
- User preference: keep Ahri for the wider game, but plan a fast-attacking ADC for Kite; no change has yet been made to its champion.

## Research PR #1 integration (30 October 2026)

- Read `ENGINEERING_SPEC.md`, `INTEGRATION_GUIDE.md`, `DATA_GAPS.md` and `SOURCES.md` from PR #1 (`origin/research-pr-1`); the research branch was not merged. Review Riot's developer policy before any public product distribution, as flagged in its source notes.
- Added a shared `applyImpact`/`resolveDeath` path for player, allied and enemy damage, physical/magic/true mitigation and one death/credit record. Minion percentage bonus is calculated from current HP at impact; minion kills by allies do not credit CS or Ahri passive. Stable fixed-step processing order is an approximation, not a proven server race rule; environmental/XP/gold/death grace remain unimplemented.
- End-of-drill live minions are now counted as unresolved instead of fabricated deaths/misses. Ahri CS record key changed to `cs_ahri_v4`.
- Existing two-sided simulation now has approximate 0.25s windup, target retention, cancellation/reacquisition on target death or leaving range, and can target nearby opposing minions across waves. Caster projectiles retain source identity. Acquisition 250 canvas units, cadence, windup, pathing and priority remain training approximations; no champion call-for-help, first-wave special rules, siege or complete lane progression.
- Centralized pinned Ahri base values and one provisional 0.5 canvas/game-unit conversion in `game.js`; HP/damage/timing are unscaled. Attack range, movement, missile and Q geometry now derive from this compact in-code data. This is not yet a generated/validated schema adapter; community values and radii require further verification.
- Browser localhost: unattended Last-Hit finished and showed CS/missed/unresolved; Kite start and pause, Dodge start verified. No captured console warnings/errors. No full interactive playthrough or client comparison. `node --test tests/*.test.cjs`: 101 tests passed; `node --check game.js` and `git diff --check` passed.

Next: validate event ordering and add complete source/event identity plus gold/XP only when sourced; implement minion priority/call-for-help and movement when no target; generate and validate a provenance-bearing adapter from the research dataset, then calibrate minion attacks and run full human CS sessions.

## Data adapter and minion follow-up (30 October 2026)

- Extracted a small, provenance-bearing reviewed Ahri subset from research PR #1 into `data/ahri-snapshot.json`; `node scripts/build-ahri-data.cjs` generates `ahri-data.js` for direct browser/file use. The generator rejects wrong patch, unit, status, null and nonpositive data; `--check` detects stale generated output. Historical Meraki data is not used. The in-game loader validates required data and visibly flags its independent built-in fallback. Champion gameplay radius 65 and canvas scale 0.5 remain approximations, not Riot-verified geometry.
- Idle minions advance toward the opposing side along a simplified horizontal path and can meet later waves. A minion targeting one of our minions has approximate priority over an idle enemy; same-priority orders are retained and higher-priority targets can interrupt windup. The model does not implement champion call-for-help, turrets, or confirmed first-wave exception. This is training behavior, not a claim of exact live AI.
- The impact pipeline now assigns monotonic event IDs per run and records them on deaths; ordering follows existing fixed-step processing, not a verified server tie-break. Last-Hit player kills consistently increment both the displayed score and `stats.cs`. A test verifies caster missile survival after the attacker dies and the current-HP bonus at impact. Ahri CS records use `cs_ahri_v5` after wave behavior changed.
- Browser smoke at localhost: Last-Hit starts with Ahri 590 HP, AS 0.668, both waves, generated data loaded without fallback indicator and no console warnings/errors. No full human CS run. Automated suite: **108/108**; generated data `--check`, `node --check game.js`, and `git diff --check` pass.

Next: human-play complete CS waves; add a separate opt-in combined lane with champion call-for-help after verifying target/skill policy; improve path topology, stable contact ordering, and real melee/caster attack timings. Keep the schedule and turret work separate from the short pre-positioned drill.

## Centred mid-lane minion meeting (30 October 2026)

- User reported the prior minion movement and meeting position felt wrong. Replaced the asymmetric fixed columns in Ahri Last-Hit with mirrored melee-front/caster-back formations approaching the centre of the painted diagonal lane. Both teams now use the same movement and target logic; removed the red-only forced destination. Ahri starts behind the friendly line.
- Used 350 game units/s from the research snapshot with the existing provisional 0.5 canvas scale; 65 canvas melee centre range, spacing, initial positions, first-target row distribution, attack times and lane geometry are training approximations pending client calibration. Three melee targets are distributed by row on first acquisition, then normal target retention/priority resumes. Movement gets a small visual bob; this is not a full walk animation.
- Scenario remains two pre-positioned waves with 30-second spacing, not a simulation of nexus travel; siege, minion collision/ghosting, precise pathing/aggro and attack timings remain open. Local Ahri CS record version is `cs_ahri_v6`.
- Browser: both waves approached diagonally and fought near the middle; Ahri started behind allies, health bars/last-hit indicators appeared, and console warning/error log was empty. No complete human CS run or direct client comparison. `node --test tests/*.test.cjs`: 109/109 pass, including mirrored arrival and first target pairing, damage/retarget, and frame-rate regressions.

## Dodge: remove exact aim lines (30 October 2026)

- User observed that showing exactly where skillshots will travel undermines dodge practice. Dodge Trial no longer renders the pre-cast line or width of linear projectiles. The enemy still displays a cast cue and faces the locked cast direction; launched missiles remain visible. No projectile timing, hitbox, damage or dodge accounting changed. Other modes retain their previous guides; the separate synthetic sweep still shows its safe-gap warning.
- Dodge local bests use new suffixes (`ahri_spells_v3` / `no_line_<preset>`) because difficulty changed. Browser smoke: Dodge launched at localhost without captured console errors; no full human survival run. `node --test tests/*.test.cjs`: 111/111 PASS, including render checks for the hidden Dodge guide, retained cast cue, launched missile and unchanged guide in Kite.

## Minion combat symmetry and readability (30 October 2026)

- Corrected red caster projectiles to use the same target gameplay radius as blue missiles. Same-step melee releases are now collected before resolving impacts, so a lethal first update does not erase the other side's completed windup. Same-target impact order still follows a deterministic processing policy; this is not verified server ordering.
- Added approximate first-attack staggering by formation row (0/0.14/0.28 seconds after reaching range), preventing perfectly synchronized first-wave health losses. These timings are a training choice and must be calibrated against live behavior. Added small team-coloured staffs to distinguish casters without changing hitboxes. Ahri CS records now use `cs_ahri_v7`.
- Browser smoke: Last-Hit loaded, both waves moved and fought, caster staffs and missiles rendered, and no console errors/warnings were captured. No full manual last-hit run. Automated suite: 115/115; new tests cover two-sided simultaneous melee, equal projectile radii, staggered early attacks and caster rendering.
- Remaining: full actual-client measurements, champion aggro/combined lane, minion collision and movement avoidance, cannon, timing, more accurate ranged and melee animations.

## Farming reference and explicit S stop (30 October 2026)

- Revisited `https://loldodgegame.com/farming/` and the privately archived playable export: observed opposing moving waves containing melee, caster and cannon plus separate missed minions / missed money / earned money. This is reference gameplay, not proof of live LoL simulation accuracy. Retained League-aligned two early normal waves; cannon for a later wave remains open.
- S now clears movement destination, route, chase, focus and pending attack-move; it cancels an uncommitted auto windup but leaves an already released missile intact. A held right button no longer silently overwrites S until a new press. Tests cover movement, windup, fired missile and held-right reissue. Existing dash/cast behavior is not asserted to reproduce every LoL interruption case.
- Ahri Last-Hit tracks earned and missed minion gold separately on actual death; unresolved survivors award neither. Starting melee 20 gold is from Riot 26.1; caster 14 is community-reported, subject to the research caveats. This is feedback, not XP/items or full economy. Gold gain is displayed on kill and in the arena/results.
- Browser: launched Last-Hit, issued right click and S, saw the wave and missed gold update with no console warnings/errors. Reference: short unattended play only; no precise timing or full human CS run. `node --test tests/*.test.cjs`: 118/118, including stop and gold attribution.

Next: measured minion attack/cadence and complete practice run; cannon wave and later scheduling, careful champion aggro and collision based on verified sources.

## Minion static-wall routing and human CS check (30 October 2026)

- Both idle lane advance and target chase now use the existing walkable-world visibility graph when a wall blocks their route. Paths are reused and recalculated as goals change; movement stays clipped against the two existing wall proxies. The diagonal lane endpoints remain approximate, and this is not the actual Rift navmesh or dynamic unit collision. The changed scenario uses Ahri CS record suffix `cs_ahri_v8`.
- Added regression tests for chasing a target behind a wall and an unopposed wave bypassing a wall while remaining walkable.
- Browser: manually right-clicked an enemy caster and observed a real hit/kill with **1 CS and 14 gold** displayed, plus allied misses; this was not a complete skill benchmark. Last-Hit with the new route code started and displayed both waves with no console warnings/errors. A complete uninterrupted manual session and exact LoL timing/aggro remain open.
- `node --test tests/*.test.cjs`: 120/120 passed; generated Ahri data check, JS syntax and diff checks pass.

## CS formation, melee attacks and cannon (30 October 2026)

- User rejected the crowded formation and inaccurate attacks, asked to observe League of Dodge Farming, remove `LAST HIT` labels and use cannon without putting it in the wrong wave. Inspected the local playable reference: widely separated melee/caster units, ranged projectiles, melee in close contact, cannon visible. Reference starts with a cannon; our first two waves do not, following the user's League CS goal.
- Wider diagonal formation, reduced and separated health bars, no `LAST HIT` in the arena or CS mode title, Ahri starts behind allies. Melee approach to 40 canvas units before hitting and show an independent short swing; casters remain behind and fire projectiles. Fixed a floating-point range boundary that could leave units stuck permanently at their attack range. These ranges, visual animation and target behavior remain approximations, not client measurements.
- CS Practice now runs up to 10 minutes / 20 waves with 30-second intervals, first wave pre-positioned immediately (so training time zero corresponds to the prepared first-wave encounter, not full nexus travel). Both teams receive cannon on waves 3, 6, 9, 12, 15 and 18; 126 possible CS. Cannon HP 835, attack range 300 game units, AS 1 and on-hit 5% follow community research; base damage 39 from Riot 26.1 conflicts with community 37.5 and must not be represented as verified live. Its windup, projectile velocity, visual and targeting are training approximations. Cannon gold uses initial 50; upgrades, minion stat growth, real wave travel, unit collision and later match thresholds remain unimplemented, so the longer session is not a complete Summoner's Rift simulation.
- Browser: CS Practice started with visibly separated waves and no last-hit field labels; at 01:01 both teams had spawned a cannon in wave three. No console warnings/errors. Cannon shots, gold, five-minute-plus behavior and a full 20-wave completion are also exercised in automated simulation; no full human ten-minute client comparison. `node --test tests/*.test.cjs`: 127/127 passed, plus generated data, syntax and diff checks.

## Remove non-League debug overlays (30 October 2026)

- User requested removing the recovery circle and avoiding graphics that do not exist in League. Removed the always-visible player attack timing arc and READY/WINDUP/RECOVERY text, the permanent player hitbox circle, the projectile collision-size circle, the enemy cast countdown ring, the target selection circle, persistent attack-order range ring, last-hit gold health-bar highlight/threshold, minion floating HP numbers, and dashed collision/boundary debug outlines. Attack range remains visible while A attack-move is being aimed; movement indicators and combat/projectile effects remain. Combat timing and hitboxes themselves are unchanged.
- The two approximate wall proxies remain functional but are now unmarked; they may not exactly match painted terrain. Browser: CS Practice loaded without the player circles or debug wall outlines and without console errors. `node --test tests/*.test.cjs`: 128/128, including a rendering regression for timing and hitbox overlays.

## Retargeting and successive waves (31 October 2026)

- User reported that minions behave incorrectly after units die and subsequent waves arrive. Researched [Riot 26.1](https://www.leagueoflegends.com/en-us/news/game-updates/patch-26-1-notes/), [Riot 26.9](https://www.leagueoflegends.com/en-gb/news/game-updates/league-of-legends-patch-26-9-notes/), [Riot 26.10](https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-10-notes/) and the [community minion behavior reference](https://wiki.leagueoflegends.com/en-us/Minions). The community page was readable through indexed excerpts; detailed priority and reevaluation are source-reported, not a client-verified implementation.
- Fixed a concrete bounded-arena bug: survivors could walk past the next wave's fixed spawn and finish at the edge, so opponents appeared behind them and diverged. Unopposed survivors now wait ahead of the opposing ingress and acquire newly arriving enemy minions; both teams tested after a 20-second push. This hold line is an explicit workaround for the missing full lane/turrets, not a claim about League pathing.
- A valid target is retained against same-priority candidates; target changes for higher priority are checked on a named two-second training interval between attack windups, preventing mid-windup cancellation. A dead target is immediately replaced if another is available. Exact reevaluation interval and full visibility/champion/turret aggro remain unverified.
- Melee maximum health now follows the Riot 26.9 +35-per-90-second change: 465 in waves 1–3, 500 in 4–6, 535 in 7–9, using the community-reported 0:30 initial upgrade and the session's assumed wave clock. Melee AD/armor and caster/cannon growth remain unimplemented. Ahri CS record suffix `cs_ahri_v10`.
- Browser: observed wave 3 and both cannons after prior waves resolved; console errors/warnings empty. Automated suite: 131/131, including both-side survivor-to-next-wave, windup-preserving target change and sourced melee growth. This is not a full client-verified simulation.

## Dodge director first playable slice (31 October 2026)

- Goal explicitly prioritizes finishing Dodge Gauntlet. Re-read Blueprint and the encounter-rhythm design; preserve the three current public alpha modes rather than renaming the incomplete trial to claim the final Gauntlet.
- Default Ahri Dodge now creates seeded single-cast visitors which enter, cast either Ezreal Q or Lux Q and exit, leaving their missile in flight. Of these two implemented cards only, Ezreal has 75% selection weight (the 45:15 ratio normalized over the available roster); this is **not** the planned full-roster 45% result. Foundation/Standard/Expert use 5/3.2/2.5 second nominal spawn intervals and 1/2/3 directed-threat caps; spells keep the same existing scaled velocity and collision values across difficulties. One cast per visitor avoids claiming an invented champion cooldown. Results report casts by spell, independently of threat-based avoided counts. Existing original ranger/mage artwork and distinct blue/gold missiles improve recognition but are not real champion models.
- One-, three- and twelve-minute session lengths are settings inside the same mode; local bests are partitioned by duration and new director version. Removed the alpha's 0.14-second automatic post-hit invulnerability in this Dodge profile. User's no-stun requirement remains. Other attack presets retain the legacy alpha logic.
- Important limits: the existing synthetic sweep remains and is **outside the directed-threat cap**. The 1/2/3 cap counts projectiles and active visitors, not geometric reachability; no fairness solver, adaptive controller, safety proof or benchmark mode exists. Missing planned Blitz Q, Ahri return, Vel'Koz split, ambient Xerath, Orianna R and Malphite R. Enemy recognition and spell fidelity remain approximate, and Lux's multi-hit/minion interaction is unimplemented. This is not a finished Gauntlet or a claim of LoL parity.
- Browser: started default Expert Dodge and observed 8 casts (7 Ezreal / 1 Lux) before the unattended character fell at 19.2 s. Reloaded, selected 3 minutes and confirmed the 180-second countdown and enemy entry; console warnings/errors empty. No completed human 3/12-minute run or real-client comparison. `node --test tests/*.test.cjs`: **137/137**; includes 12-minute fixed-step run with artificially enlarged HP, deterministic seeded mix, one cast/visitor, directed-threat cap, session records, no artificial hit immunity and profile rendering. `node --check game.js`, generated data check, `git diff --check` pass.

Next actions: (1) replace synthetic sweep with source-informed fair varied spells, starting with a fully modeled two-phase Ahri Q or Blitz Q and honest collision/expiry tests; (2) add geometry-aware scheduling and per-spell qualified outcomes, including synthetic/ambient hazards; (3) play and calibrate full human sessions at all difficulties, then implement rare events and accessibility without adding mode cards.


## Successive waves and Ahri Q follow-up (31 October 2026)

- Rechecked [Riot 26.1](https://www.leagueoflegends.com/en-us/news/game-updates/patch-26-1-notes/) and the [community minion reference](https://wiki.leagueoflegends.com/en-us/Minions): minions retain targets of equal priority, reconsider higher priorities between windups, and look for a new target when the prior one dies. The regular early Rift wave is three melee and three caster, with a siege minion from wave three and then every third wave before 14 minutes. Minions spawn sequentially at the nexus; this practice arena instead creates pre-positioned groups simultaneously.
- The finite arena previously held unopposed survivors just 60 canvas units from the opposing next-wave spawn, making new units appear almost on top of them. Moved the artificial hold line closer to the centre so the front rows arrive at least 155 units ahead on the lane axis. Regression tests cover both teams, a wave-two encounter, death of the current target and acquisition of another. This hold is still a training workaround, not authentic Rift movement. No claim of exact client parity: minion collision, complete champion/turret aggro, real navigation and nexus-to-lane travel remain outstanding.
- Continued the Dodge director work already in progress: added an Ahri Q visitor with outward and returning phases, one collision per phase, magic outgoing and true returning damage, and return tracking to the living caster. The 700 canvas-unit return speed, visitor artwork and 45:15:11 normalized selection weights are training approximations; real client return behavior and encounter balance still require validation. No stun or trajectory overlay was added. The synthetic sweep remains outside the cap and the Gauntlet remains incomplete.
- Automated suite: 140/140 passes, including next-wave retargeting and separate orb-leg collisions and homing. Browser: CS Practice ran through wave three, with cannon minions visible on both sides after earlier waves resolved; this unattended equal-wave run does not visually validate a survivor-push scenario.

## Dodge director: remove synthetic sweep and keep casters visible (31 October 2026)

- The default Ahri-directed Dodge no longer runs the unrelated synthetic wall/sweep: it bypassed the encounter budget and created non-League visual warnings. Legacy attack presets still keep their original behavior. Directed Dodge now uses its Ezreal, Lux and Ahri encounters only. Old director records are separated using `director_v3` because the scoring environment changed.
- The director only accepts caster entry and cast locations that keep the sprite within the arena's visible rectangle. It retries candidates and defers if none is valid, rather than intentionally creating an unseen caster; this is a practical screen-space policy, not a proof of fair reaction time or unobstructed visibility.
- `node --test tests/*.test.cjs`: 141/141 pass, including one minute without undirected sweep shots and visibility sampling from the centre and corners; the existing 12-minute directed-cap simulation also passes. `git diff --check` passed. Browser: started an Expert run, saw an entering enemy and the result at 18.4 seconds after leaving Ahri idle (8 casts, including one Ahri); this is a smoke test, not a human survival/fairness benchmark.
- Remaining: only three of seven planned regular spells are implemented; no rare ultimates, authored safe-combination checks, adaptation, or per-spell outcomes. Concurrency caps and visible spawn positions do not establish that combinations are avoidable. Validate actual player runs and implement the remaining mechanics before calling the Gauntlet finished.

## Directed Dodge phase outcomes (31 October 2026)

- Added result accounting per spell for avoided, hit, blocked and harmless projectile phases. A returning Ahri Q may count twice because its outbound and return legs can have different outcomes; casts remain a separate count. Active unresolved phases are displayed separately. Lethal hits are recorded before the results screen is generated, and each phase resolves at most once.
- Threat qualification still uses a short predicted intersection with the current player position, so it is a training heuristic: it does not prove reaction time, intentional movement or geometric fairness. No claims about Flash-specific outcomes or true counterplay analysis are made.
- `node --test tests/*.test.cjs`: 144/144 pass, including harmless miss versus threatened avoidance, lethal-hit reporting, unresolved phases and independent Ahri Q legs. Browser smoke test: an unattended Expert run ended at 18.4 seconds and displayed 7 Ezreal Q hits and 1 Ahri Q hit across 8 casts. No complete human run or balance validation was performed. `node --check game.js` and `git diff --check` pass.
- Next: implement additional source-supported spell mechanics and safety scheduling; fixed threat caps alone do not prove dodgeable combinations. Preserve no stun in Dodge and existing playable modes.

## Ambient Xerath W training encounter (31 October 2026)

- Added map-origin Xerath W to the regular director after 45 seconds, with no visible caster and a circular ground warning. The 26.21 community reference ([LoL Wiki](https://wiki.leagueoflegends.com/en-us/Xerath), [Riot Codex](https://riotcodex.net/champions/Xerath)) reports 275/125 game-unit outer/epicenter radii, rank-one base 50 magic damage, 66.7% center amplification, a 0.25-second cast and 0.528-second strike delay. These map through the existing approximate 0.5 scale. Assumed 30 MR, center-based collision, warning presentation and onset are training approximations; slow is deliberately omitted for this initial pure-Dodge implementation. This is not a client-verified replica.
- For an early safety policy, W is scheduled only with no other directed threats in flight or casting. Its randomly oriented center is offset by 90 canvas units, and a straight walkable escape is checked using 0.2 seconds reserved for recognition and an extra 10-unit margin. This is not a complete human-reaction or multi-threat fairness proof. Attempts that fail the safety check are deferred/reselected; consequently the nominal 3/74 weight is not the realized frequency. W participates in the threat cap, cast counts and per-spell outcome report; an active area is unresolved at session end. Records use `director_v4`.
- `node --test tests/*.test.cjs`: 147/147 pass, including center/outer boundaries, damage, delayed impact, no on-screen caster, movement escape and isolation from other directed attacks, plus the long-session cap test. `node --check game.js` and `git diff --check` pass. Browser smoke test confirmed updated menu and Dodge startup; the rare W itself was not visually observed in a human run. Further browser playtesting, spell recognizability and timing comparison with League are required.
- Next priorities remain missing Blitz Q, Vel'Koz Q split, Xerath Q, Orianna R and Malphite R, shared threat fairness, meaningful longer human runs, and four-mode integration. Existing slow/CC omission should be revisited only in line with the user's no-stun preference.

## Blitz Q Dodge training (31 October 2026)

- Added Blitz Q after the first 45 seconds of default Dodge, with an original simple robot silhouette and an attached chain while the hook is in flight. The visitor holds position until the projectile resolves and then exits. A hit deals damage and immediately ends the hook; no stun or pull is applied, honoring the user's preference against immobilization in Dodge. This is therefore not a full Rocket Grab simulation.
- Rank-one 110 magic damage and 1020 listed range are from the 26.21 [Riot Codex](https://riotcodex.net/champions/Blitzcrank); the community [LoL Wiki](https://wiki.leagueoflegends.com/en-us/Blitzcrank) describes different projectile range details, and 1800 speed is community-reported. The 0.25 s cast, 70-game-unit projectile radius, 30 MR, art, endpoint details and simplified targeting require client verification. Scale is the existing approximate 0.5. The player is the only hook collision candidate in this Dodge arena; blocking with minions and the lollipop end check are not implemented.
- After 45 s, nominal weights among implemented cards are 45 Ezreal / 15 Lux / 11 Ahri / 12 Blitz / 3 Xerath W; retries and W isolation can change realized shares. The new hook occupies one threat budget slot across caster and projectile, and reports its outcome. Local bests are separated under `director_v5`.
- `node --test tests/*.test.cjs`: 149/149 pass, including one hook per visitor, waiting through flight, hit without immobilization, damage, range expiry, swept collision and the long director cap test. `node --check game.js` and `git diff --check` pass. Browser smoke test: the updated Dodge started; Blitz is gated until 45 s and was not visually observed during this smoke test. Full human playtesting and source/client comparison remain necessary.
- Next: Xerath Q and Vel'Koz split, then rare ultimates and safety validation across combinations. No successful multi-minute human run or fairness proof exists yet.

## Single projectile escape check (31 October 2026)

- Addressed a fairness problem in directed Dodge: a straight cast could be locked at a distance that leaves insufficient time for Ahri to clear its combined hitbox. Before selecting a visitor origin and again at aim lock, the director now checks the spell cast delay, projectile speed, player speed, combined collision radii, an 8-unit margin and a 0.2-second training recognition allowance. It samples both perpendicular straight escapes against the approximate terrain. If the player has moved too close while the caster enters, that caster leaves without firing; no cast is counted. Retries increased from 20 to 80 to keep the first encounter available with the new constraint. Local records are partitioned under `director_v6`.
- This check only establishes a sampled straight-line escape for an isolated outbound projectile at aim-lock time. It does not validate overlapping shots, returning Ahri Q, human reaction ability, animations or all possible routes; it can also reject viable encounters. It is a training policy, not a claimed League mechanic. Combinations, full skill roster and playtesting remain outstanding.
- `node --test tests/*.test.cjs`: 152/152 pass. New tests reject close casts, accept a long-range walkable cast, cancel after the player closes distance and simulate a 200ms-delayed ordinary sidestep. Browser smoke test: Expert Dodge started and an enemy entered; no multi-minute human fairness validation. `node --check game.js` and `git diff --check` pass.

## Dodge overlap forecast (31 October 2026)

- Extended the cast-time sidestep check to forecast the candidate projectile alongside already-flying directed straight projectiles and already-locked visitor casts. The forecast samples two straight perpendicular paths, reserves the existing 0.2-second recognition window and uses swept-circle collision. If neither path is clear, the new cast is rejected. A directed Ahri orb in flight or an already-locked Ahri cast defers new casts until it resolves because its return path is not yet forecast. Xerath W remains isolated by the existing policy. This maintains some straight-shot overlap without pretending that a numerical concurrency cap alone proves safety.
- This is still a conservative training heuristic, not an exhaustive reachability or human-reaction proof: it samples only two constant-direction responses, uses stationary aim at lock, ignores trajectories after 3 seconds, may reject viable combinations, and cannot forecast future player decisions or moving/reversing orbs. Real-client collision fidelity and full Gauntlet playtests remain open. New local record key `director_v7`.
- `node --test tests/*.test.cjs`: 155/155 pass; added tests for one versus two blocked sidesteps, an already-locked cast and deferral during a return orb, alongside the existing 12-minute simulation. `node --check game.js` and `git diff --check` pass. Browser smoke test started Expert Dodge, but did not establish that overlapping encounters feel fair to a human.

## Ambient Xerath Q (31 October 2026)

- Added Xerath Q as a directed map-origin beam after 45 seconds, without a visible champion. A brief source glow provides a directional cue; the exact beam appears at impact, not during its warning, respecting the user's preference against showing skill trajectories in advance. It has separate hit/avoid/unresolved accounting and occupies one directed threat slot. As with W, it is scheduled only when other directed encounters are clear.
- [Riot Codex 26.21](https://riotcodex.net/champions/Xerath) reports a 145-game-unit width, fully charged range 1450, rank-one 70 magic damage and approximately 0.5-second recast. The implementation uses the existing approximate 0.5 scale, 30 MR, a 0.528-second training warning, a fixed off-center line and a sampled 200ms-reaction walkable escape. Source glow, line placement, character-radius collision and lack of Xerath's charging phase are training approximations, not verified live-client behavior. The no-overlap policy and visible source may reduce intensity and are not a full fairness proof.
- Nominal weighted selection after 45 seconds is 45 Ezreal / 15 Lux / 11 Ahri / 12 Blitz / 3 Xerath W / 6 Xerath Q, but retries and isolation affect realized frequencies. Records now use `director_v8`. The rare ultimate roster and Vel'Koz Q remain unimplemented.
- `node --test tests/*.test.cjs`: 158/158 pass, including no on-screen caster, no pre-impact aim line, impact render, damage, both hitbox boundaries, 200ms-delayed movement escape, overlap isolation and a 12-minute simulation that actually schedules Xerath Q. Browser smoke test started Dodge; the Xerath Q was not personally observed in browser, so visual readability and feel still require a human playtest. `node --check game.js` and `git diff --check` pass.

## Xerath Q rectangular geometry (31 October 2026)

- The community [League Wiki reference](https://leagueoflegends.fandom.com/wiki/Xerath/LoL) describes Arcanopulse as a rectangular hitbox starting at the caster. The ambient training beam previously used a capsule, overreaching sideways at the ends. It now intersects the player's circular gameplay radius against a rotated rectangle with flat ends; corner contacts are computed from the nearest rectangle point. At impact the rendered beam uses the configured rectangle width and flat ends. Character-radius treatment, source cue and 0.5 map scale remain unverified training approximations. Records use `director_v9`.
- `node --test tests/*.test.cjs`: 159/159 pass, including side, end, corner and rotated-rectangle boundaries, previous beam damage/dodge tests and the 12-minute director simulation. `node --check game.js` and `git diff --check` pass. Browser smoke test confirmed Dodge starts; the brief Xerath beam was not observed in the browser and still needs visual calibration in human play.
- Remaining: Vel'Koz Q, rare ultimates and full human testing; no claim of exact live collision or overall Gauntlet completion.

## Vel'Koz Q first implementation (31 October 2026)

- Added a weighted Vel'Koz Q encounter after 45 seconds: the initial bolt can hit the player or recast after a sampled diagonal travel distance, then after 0.25 seconds produces two faster perpendicular bolts. A shared hit guard prevents multiple hits to the same player from a single split cast. No slow is applied in this Dodge iteration. The visitor uses the existing generic mage art; purple projectile styling is an original placeholder, not an authentic Vel'Koz model.
- [Riot Codex 26.21](https://riotcodex.net/champions/Velkoz) reports rank-one 80 magic damage, 1100 range, 0.25-second split and perpendicular bolts; [PHAROS](https://pharos.wiki/lol/en/champions/Velkoz) lists 120 initial width and 1300 initial speed, and community reports describe 2100 split speed. Values use the existing approximate 0.5 scale and assumed 30 MR. Split projectile radius/range, fixed diagonal aim and recast targeting, same-target guard, animation and no slow are training approximations needing client verification. Blocking by minions and actual caster ability/CC are absent.
- The director only starts this encounter in a clear field and waits while any of its projectiles remain. The existing forecast does NOT model the splitting branches and is not proof the pattern is dodgeable; review timing and geometry before declaring the encounter fair. Its two branch sprites are counted separately by the existing raw active-projectile cap, although they belong to one cast. The outcome summary reports projectile-phase outcomes; it is not a per-cast success rate. The weighting bag now nominally matches 45/15/12/11/8/6/3 for Ezreal/Lux/Blitz/Ahri/Vel'Koz/Xerath Q/W after 45 seconds, but safety retries change realized proportions. Records use `director_v10`.
- `node --test tests/*.test.cjs`: 163/163 pass, including perpendicular branching, higher split speed, delayed split, one-hit guard, a diagonal split hitting outside the initial path and a 12-minute simulation scheduling Vel'Koz. `node --check game.js` and `git diff --check` pass. Browser smoke test confirmed Dodge startup; no human browser run reached and visually validated the Vel'Koz encounter. Rare ultimates, split fairness and full visual/audio fidelity still need work.

## Vel'Koz split escape forecast (31 October 2026)

- At Vel'Koz aim lock, the director now samples 24 straight walkable player routes against the initial bolt and both predicted perpendicular split bolts, including their speed, travel time, split delay, champion radius, a 5-unit margin and the existing 200ms training reaction allowance. It cancels the encounter if none passes. An entering/casting Vel'Koz reserves the directed encounter, preventing another visitor from being scheduled before its projectile exists; aim lock also checks for other active encounters.
- This models the current training implementation, not verified live League physics. It is a deliberately limited approximation: only straight responses and stationary initial positions are sampled; player decisions can still lead to a hit, and 200ms is not an established fairness guarantee. It does not validate overlap with other threats, because the implementation deliberately isolates this encounter. Cast-angle selection may reject viable patterns, affecting frequency. Local records use `director_v11`.
- `node --test tests/*.test.cjs`: 167/167 pass, including a forecasted route executed against the actual split after 200ms, a rejected point-blank case, reservation during entry, and the existing 12-minute simulation. `node --check game.js` and `git diff --check` pass. Browser smoke test confirms Dodge starts; a human has not yet played or visually reviewed this encounter. Rare ultimates and complete Gauntlet fairness/feel validation remain outstanding.

## Rare Orianna R prototype (31 October 2026)

- Added an independently scheduled rare Shockwave to default Dodge. Its first eligible time is seeded between 90 and 150 seconds; subsequent attempts are 90–150 seconds apart, defer while directed threats are present, and reserve the field during a 1.5-second visible-ball preparation and 0.5-second cast. At cast time, an ordinary walkable escape with a 200ms allowance is checked; an unsafe cast is cancelled. The ball location remains the center of the strike and its result is accounted by spell.
- [Riot's Orianna page](https://www.leagueoflegends.com/en-us/champions/orianna/) identifies Shockwave as ball-centered; [community spell reference](https://wiki.leagueoflegends.com/en-us/Template%3AData_Orianna/Command%3A_Shockwave) reports damage, stun and pull, while [Dodge.gg's 2026 guide](https://www.dodge.gg/en-US/lol/news/orianna-build-2026) reports 415 radius, 0.5s cast and 250 rank-one damage. Existing approximate 0.5 scale and 30 MR apply. To respect the user's no-stun Dodge instruction, neither stun nor pull is implemented. This is a prototype: the ball appears at its destination without an Orianna champion or Q travel, setup duration and cue are training choices, collision-radius interpretation is unverified, and the escape check is not a human fairness proof. Rare clock reset occurs when setup starts, including a later cancelled cast. Records use `director_v12`.
- `node --test tests/*.test.cjs`: 171/171 pass, including visible setup before cast, cancellation if too close, no immobilization, pause/overlap behavior, no first-90-second event and scheduling during the 12-minute simulation. `node --check game.js` and `git diff --check` pass. Browser smoke test started Dodge; the rare event has not been visually observed in a human session. Malphite R, full Orianna/ball behavior, longer playtesting and comprehensive fairness are still outstanding.

## Rare Malphite R prototype (31 October 2026)

- Added a separately seeded Malphite R clock, first eligible between 150–240 seconds and repeating at a seeded 150–240-second training interval. Orianna and Malphite share a 35-second guard measured from encounter start, and either rare encounter requires the directed field to be clear. Malphite appears as an original rough rock silhouette, walks a short distance during a 1.25-second setup and dashes to a fixed location; no target marker or stun/knockup is added. A candidate is rejected unless a sampled ordinary walkable escape remains after a 200ms allowance. Outcomes and cast counts are reported separately.
- [Riot Codex 26.21](https://riotcodex.net/champions/Malphite) reports 1000 range, 325 impact radius, 200 rank-one magic damage and a knockup; the [community reference](https://wiki.leagueoflegends.com/en-us/Template%3AData_Malphite/Unstoppable_Force) reports dash speed 1500 plus movement speed. The implementation uses the existing approximate 0.5 scale, 335 base movement speed and 30 MR. Knockup is deliberately omitted to honor the user's no-immobilization preference. Movement setup, fixed off-center aim, silhouette, hitbox expansion, safety policy and dash movement are training approximations, not a live-client replica. Cancelling at dash decision still consumes the next rare scheduling window. Records use `director_v13`.
- `node --test tests/*.test.cjs`: 174/174 pass, including visible approach, dash, damage without immobilization, a 200ms-delayed escape, no event in the first 150 seconds and a 12-minute run scheduling both rare events. `node --check game.js` and `git diff --check` pass. Browser smoke test confirmed Dodge starts, but no human browser run reached this rare event. Longer playtesting, accurate visuals, cue readability and timing, rarity calibration and a stronger fairness analysis remain necessary; the full Gauntlet is not finished.

## Orianna ball travel and caster cue (31 October 2026)

- The rare Shockwave setup now renders an on-screen caster using the existing generic mage artwork and moves the ball from that caster to its fixed destination before casting. The visible setup remains 1.5 seconds, and R still checks a walkable escape at the destination before its 0.5-second cast. The new source-position checks may defer some encounters. Records use `director_v14`.
- [Community Orianna reference](https://leagueoflegends.fandom.com/wiki/Orianna/LoL) records a 1400-unit Command: Attack missile speed and that Shockwave may be buffered while the ball travels. The animation uses 1400 game units/s with the existing approximate 0.5 scale. This is still a training presentation: the caster is generic artwork, position and setup are authored, the Q ball is not a damaging projectile, and ally attachment, ball leash, real cast animations and live-client timing are unimplemented. No stun or pull is applied in Dodge.
- `node --test tests/*.test.cjs`: 176/176 pass, including visible caster rendering, ball movement and arrival before R, safety cancellation, pause, rare scheduling and the long-session simulation. `node --check game.js` and `git diff --check` pass. Browser smoke test starts Dodge; this rare encounter has not yet been visually observed in a human browser session. Continue with actual multi-minute playtesting, visual fidelity, and fairness validation of rare and mixed encounters.

## Orianna Q collision and current R base damage (31 October 2026)

- Orianna's setup ball is now a damaging Q: its 1400-unit/s movement performs swept collision against the moving player, and its destination has a separate arrival area. A single cast can hit the player at most once. Q casts and hit/avoid/blocked/harmless outcomes are tracked separately from the later R; unfinished Q and R phases are reported separately on the result screen. Threat qualification is still a gameplay heuristic, not a measured reaction.
- [Riot patch 26.12](https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-12-notes/) reduced rank-one Shockwave base damage from 250 to 225; updated the prior outdated value. [Community Q data](https://wiki.leagueoflegends.com/en-us/Template%3AData_Orianna/Command%3A_Attack) reports 60 rank-one damage and 1400 speed; a [community guide](https://magicstark.cz/en/wiki/orianna-the-lady-of-clockwork/) lists width 160 and arrival radius 175. These values use the existing approximate 0.5 scale and 30 MR. Center-based arrival collision, generic caster art, target placement, no multiple-target damage reduction, and no R pull/stun are training approximations. No AP is modeled. Records use `director_v15`.
- `node --test tests/*.test.cjs`: 180/180 pass, including swept ball hit, one-hit behavior, arrival boundaries, avoiding the arrival area, lethal Q attribution, R damage and long-run counters. `node --check game.js` and `git diff --check` pass. Browser smoke test starts Dodge; Orianna's rare encounter has not yet been visually played in the browser. Continue with multi-minute human playtesting, spell visuals and the remaining Gauntlet fidelity/fairness work.

## Ahri charm and directed visitors (31 October 2026)

- Fixed directed Dodge visitors bypassing Ahri's charm: they now move toward Ahri for the existing charm duration, interrupt an entering or uncommitted cast and leave afterward. An already-fired projectile remains active. Visitor hit flashes now decay. A visitor whose exit path is blocked by an approximate wall uses the existing world pathfinder rather than remaining stuck. Dodge's no-stun preference for the player is unchanged.
- This reuses the game's existing 1.2-second charm and movement approximation; it is not a claim of patch-exact control or full champion AI. Orianna/Malphite rare actors are still training hazards, not targetable champion entities. Local records use `director_v16` because suppressing incoming casts changes scoring.
- `node --test tests/*.test.cjs`: 183/183 pass, including pre-release interruption, movement toward Ahri, survival of an already-fired projectile and routing around a wall. `node --check game.js` and `git diff --check` pass. Browser smoke test started Dodge and observed an unattended Expert round; the specific charm interaction was validated in automated simulation, not a human browser playthrough. Continued work remains on full Gauntlet playtesting, animation and rare-caster interactions.

## Combat feedback cleanup after browser interaction (31 October 2026)

- During an actual browser interaction in Expert Dodge, right-click movement and Ahri W were accepted, but a hit displayed a long floating-point value (`−80.99173553719008`) above the champion. Combat text now rounds positive damage to a whole number (at least 1); simulation HP and damage statistics retain the unrounded values. Removed the floating `MISSED` text on enemy minion death in keeping with the user's request to avoid invented combat graphics; the missed-CS and gold counters are unchanged.
- `node --test tests/*.test.cjs`: 185/185 pass, including fractional damage preservation versus rounded rendering and missed-CS accounting without the floating label. `node --check game.js` and `git diff --check` pass. Browser: started Expert Dodge, moved with right-click and activated W; reloaded the changed game and observed a second round. This short interaction did not reach the rare events or establish overall balance/fairness. Actual long human playtesting remains necessary.

## Pending split outcomes and pause/restart (31 October 2026)

- Corrected Dodge's end-of-round unresolved phase count for Vel'Koz Q: the 0.25-second pending split is unresolved if its branches can still hit the player, despite the main bolt already being resolved. If the main bolt or one split branch has already hit the player, suppressed sibling branches are excluded because they cannot produce another player hit. This changes result reporting only, not collision, damage or scoring.
- `node --test tests/*.test.cjs`: 188/188 pass, including pending split versus already-ineligible split, pause freezing the split, and restart clearing projectiles/outcomes. `node --check game.js` and `git diff --check` pass. Browser: started an Expert run, paused, and restarted; UI returned to 00:00 and 590/590 HP. The specific split-phase cases were tested in simulation, not observed in a human browser run. Long human Gauntlet sessions and complete presentation/fairness validation are still outstanding.

## Ahri Flash fidelity (31 October 2026)

- Updated Flash for the Ahri profile and reference dodges using the [community Flash reference](https://wiki.leagueoflegends.com/en-us/Flash): max 400 game units (200 canvas at the current approximate scale), cursor-limited short casts, 300-second base cooldown and no artificial invulnerability. It cannot be used while rooted. It can be used during Ahri's Q/E cast without cancelling that cast. Other legacy attack presets retain their prior arcade distance/cooldown. Default Dodge records are partitioned under `director_v17` due to the changed Flash resource.
- Wall landing still uses the project's approximate `nearestWalkable` and may differ from League's wall snapping. Spell haste, runes, Flash variants, precise movement-order persistence and all cast interactions are not modeled. One-minute sessions now allow at most one base-cooldown Flash; this is intentionally closer to Summoner's Rift rather than an unlabeled rapid-reset training mechanic.
- `node --test tests/*.test.cjs`: 191/191 pass, including short/far cursor range, 300-second cooldown, root restriction, no immunity, and Q+Flash cast preservation. `node --check game.js` and `git diff --check` pass. Browser: in Expert Dodge issued a movement target and Flash, observed Ahri blink and the 300-second cooldown in the HUD. No full rare-event or multi-minute human playtest was performed.

## Minion death grace and subsequent targeting (31 October 2026)

- Researched [Riot 26.1](https://www.leagueoflegends.com/en-us/news/game-updates/patch-26-1-notes/) and the [community minion reference](https://wiki.leagueoflegends.com/en-us/Minions): early waves are 30 seconds apart, first cannon is wave three, acquisition is 500 game units, and targets are reconsidered between windups with higher-priority targets preferred. The wiki also documents a 0.066-second minion death grace below 0.35% maximum HP (excluding damage above 190). Current CS uses a deliberately shortened pre-positioned scenario: waves spawn near mid all at once, surviving units wait at an artificial ingress limit, and there are no nexus, turrets, full-lane travel, unit collision or measured Rift navigation. It is not a faithful complete wave simulation.
- Implemented that death grace in Ahri CS for actual minion melee/projectile impacts, without extending its timer on repeated minion hits. Champion damage can secure the kill during the grace; after expiration the original minion gets attribution and surviving attackers can retarget. The simulation's 120 Hz step quantizes expiry by at most one tick. This interpretation follows community documentation; unverified edge cases and rounding in Riot's implementation may differ. Records now use `cs_ahri_v11`.
- Added focused tests for player credit, expiry, threshold and damage exclusions, retargeting and simultaneous committed attacks. Browser smoke test started CS practice and observed unattended waves 1, 2 and 4 progress, with minions still fighting; this is not a full human CS or wave-behavior validation. Next priority: replace the artificial ingress and instantaneous on-screen formation with a well-tested continuous lane/wave arrival model, while accounting for finite map size, spacing, turrets and visual readability. Verify target priorities and attack animation/timing empirically against LoL; do not claim exact simulation.

## Movement after Flash (31 October 2026)

- Ahri/reference Flash now preserves an ordinary move order when the blink is forward along the current route, clears the obsolete path and recalculates from the landing. Flash in the opposite direction or beyond the destination clears the order; attack/chase orders and casts are not converted to movement. This follows the [community Flash patch history](https://wiki.leagueoflegends.com/en-us/Flash), which documents movement persistence when flashing in the movement direction. The positive-dot direction test, handling of an overshot destination and behavior for attack orders are explicit training approximations, not measured Riot implementation details. Legacy arcade presets are unchanged. Local records use `director_v18` and `cs_ahri_v12`.
- `node --test tests/*.test.cjs`: 197/197 pass, covering continued movement, backward and overshooting Flash, attack chase cancellation and route rebuilding around a wall. `node --check game.js` and `git diff --check` pass. Browser smoke: restarted Expert Dodge, right-clicked ahead and pressed Flash; Ahri blinked and subsequently reached the clicked position. This is not a full human dodge or long-session fairness test. Next: test uninterrupted 3/12-minute runs, independently verify rare combinations and improve placeholder champion presentation; CS wave travel remains a separate significant unfinished task.

## Rare-cast outcome tracking and Dodge HUD (31 October 2026)

- Orianna R and Malphite R now track whether the player enters their impact area throughout the committed cast, not only at cast start. Entering and exiting before impact is recorded as an avoided threat; remaining in the area at impact is a hit; a player who never enters is still harmless. This fixes scoring consistency with existing ground-hazard tracking; it is not a claim that the player's movement caused the near miss. Only feedback/scoring changed, not actual impact geometry. Dodge records use `director_v19` because qualifying avoids can change score.
- In Dodge the HUD now shows `HITS` taken instead of unrelated `KILLS`; the Kite HUD still shows kills. No extra in-world indicators were added.
- `node --test tests/*.test.cjs`: 201/201 pass, including new enter/exit, harmless and impact cases for both rare casts and the HUD counter. `node --check game.js` and `git diff --check` pass. Browser: started Expert Dodge, saw HITS 0, then observed HITS 8 and matching result text in an unattended loss. The rare-event cases were simulated by tests and not observed in an extended human browser session. Full 3/12-minute human playtesting, genuinely validated overlap fairness, champion art, and faithful CS wave travel remain open.

## Distinguishable Void caster and Ahri sprite scale (31 October 2026)

- Added an original transparent generated void-creature sprite for the Vel'Koz Q visitor. Previously it shared Lux's mage sprite, making the spell source ambiguous. The image is drawn in the existing enemy sprite envelope; collision, targeting, spell values and director scheduling are unchanged. The existing procedural fallback remains available when the image fails to load. The art is a static original approximation and is not an official champion model or animation.
- Enemy Ahri now uses the same sprite dimensions, anchor and directional back view as player Ahri; no hitbox or player size was changed. Source and prompt summary are recorded in `assets/README.md`.
- `node --test tests/*.test.cjs`: 203/203 pass, including sprite selection, missing-image fallback and equal Ahri draw bounds. `node --check game.js` and `git diff --check` pass. Browser: started Dodge and moved, and loaded the PNG through the local server. The rare Vel'Koz visitor and enemy Ahri were not seen in a live human browser encounter; their draw selection and sizing were checked in the simulated render harness. Human in-game review, full Gauntlet testing and faithful CS waves remain outstanding.

## Dodge cast reach and pre-release evasion (31 October 2026)

- The director no longer commits an ordinary straight skillshot if the player's current hitbox is beyond the projectile's finite reach when the caster lines up; the projectile radius and champion radius are included. A player who outranges a visitor during its approach causes that uncommitted visitor to leave. Split Vel'Koz Q is exempt because its secondary missiles can threaten beyond the first leg; it retains its separate split safety check. This is a training-director policy, not a claim about LoL enemy AI. Previously a caster could fire a shot that had no chance of reaching the player's locked position.
- A direct, in-range visitor cast now retains the initial threat when the player moves out of its path during the cast windup. If it then misses, the dodge can be counted instead of incorrectly labeling the shot harmless. This tracks a threatened position, not measured reaction or causal proof. A cast interrupted before release still produces no projectile or dodge. Local Dodge records use `director_v20` because scheduling and score can change.
- `node --test tests/*.test.cjs`: 206/206 pass, including reach boundary, cancellation after moving out of reach, and dodging during cast. `node --check game.js` and `git diff --check` pass. Browser: started Expert Dodge, issued a movement command and observed a completed result with 1 Ezreal Q avoided and 8 hits. The exact pre-release timing was verified in deterministic simulation, not isolated in browser. Long human sessions, validated overlap fairness, actual champion animation and faithful minion waves remain open.

## Ahri Q director reachability (31 October 2026)

- Three stationary, high-HP, default-seed 180-second simulation audits initially produced **zero Ahri Q casts** on every difficulty. The direct cause was incompatible geometry: the director sampled caster distances up to 470 canvas units, but the broad orb plus the existing 200 ms reaction allowance needs roughly 477 units for its sampled perpendicular escape. The safety check therefore rejected every encounter before it could cast.
- Increased only the returning-orb caster's sampled maximum to 520 canvas units. The existing projectile range plus both gameplay radii still bounds whether its first leg can actually touch the player, and the existing visible-entry and escape checks still run both at spawn and cast time. No projectile speed, damage or hitbox was changed. This spawn-distance policy and simplified safety check remain training approximations, not Riot AI. Dodge records are partitioned as `director_v21`.
- Repeating the same three simulated audits produced Foundation 38 total / 5 Ahri, Standard 58 / 6 Ahri, and Expert 73 / 9 Ahri in 180 seconds (includes rare casts; stationary player with artificial HP is not a human fairness or win-rate benchmark). Added a regression test that verifies Ahri Q and frequent Ezreal Q across all three difficulties in a 90-second default-seed simulation. `node --test tests/*.test.cjs`: 207/207 pass; `node --check game.js` and `git diff --check` pass.
- Browser: started a real Expert round on seed 73129 without movement; results reported 2 Ahri casts and four Ahri Q phase hits alongside Ezreal and Lux. This confirms the real browser now schedules both orb passes, but it is not an interactive dodge/fairness test. Still needed: human 3/12-minute playtests, multi-seed rate and varied movement analysis, and further champion-accurate visuals; CS lane-wave travel remains unfinished.

## Rare-event cancellation and multi-seed audit (31 October 2026)

- A director-scheduled Orianna or Malphite encounter previously consumed its 90–150 s or 150–240 s rare clock as soon as the setup spawned, even if the ultimate was subsequently cancelled because the player had no safe ordinary escape. Scheduled unsafe cancellations now defer that event by five seconds and retain a five-second rare-event guard, including against repeat Orianna Q pressure. Successful ultimate commits retain their original long interval and 35-second guard. Direct test-only/manual hazard creation does not alter director clocks. This is director behavior, not a claim about LoL cooldowns. Dodge records use `director_v22`.
- With 10 seeds each, a stationary high-HP player, Standard difficulty and 180 seconds, ordinary spell totals across the three valid sampled positions were: centre: Ezreal 303, Lux 80, Ahri 58, Blitz 43, Vel'Koz 37, Xerath Q 28, Xerath W 9; upper-left: 235/144/46/39/36/34/17; lower-right: 270/92/70/53/33/27/12. Every centre and corner run had Ahri Q. Corner geometry blocked rare events in the upper-left; this is evidence of a current fairness/coverage limitation, not a human playtest or a claim about moving players. An earlier candidate coordinate inside a wall was discarded as invalid.
- `node --test tests/*.test.cjs`: 209/209 pass, including both unsafe rare cancellations retrying and successful casts retaining long intervals. `node --check game.js` and `git diff --check` pass. Browser: started Expert Dodge and issued a movement command; rare-event retry was validated in simulation, not in a multi-minute human session. Next: movement-based multi-seed fairness, rare encounter availability near boundaries and complete 3/12-minute human runs; faithful CS waves and champion visuals remain open.

## Ahri orb readability (31 October 2026)

- Previously the visible Ahri Q orb was a radius-13 solid dot while its simulation radius was 50 canvas units. Both player and enemy orbs now use a soft light-blue radial effect that extends to the projectile's existing simulation radius, with a rounded trail. There is no separate debug hitbox ring; the edge fades gradually and is not a precise visible boundary. This is original procedural art inspired by [Riot's description of Ahri's VFX](https://www.leagueoflegends.com/en-us/news/dev/dev-ahri-s-asu/) and its [Q readability update](https://www.leagueoflegends.com/en-us/news/game-updates/patch-10-15-notes/), not a copy of the game assets. Projectile radius, player hitbox, speed, damage and collision remain unchanged. Other skillshots still need similar visual-versus-collision review.
- `node --test tests/*.test.cjs`: 210/210 pass, including both sides' orb color/visual extent and unchanged simulation radius. `node --check game.js` and `git diff --check` pass. Browser: cast the player's Q and observed the effect in flight; restarted the default Expert round and observed the enemy Ahri casting the matching effect. This is a visual smoke test, not verification of pixel-perfect LoL VFX or full hitbox fairness. Human long-session testing and the remaining Gauntlet/CS work are still open.

## Directed projectile readability (31 October 2026)

- Ezreal Q, Lux Q and both Vel'Koz Q phases previously drew a radius-11 solid core and a small halo regardless of their larger 27.5–35 canvas-unit collision radii. Their colored effects now fade out to their own existing projectile radii, retaining distinct cyan, gold and violet palettes. Blitz Q likewise uses its existing radius for the effect and now has a small oriented mechanical hand over its existing chain. These are original simplified VFX, not Riot assets or an exact edge indicator; the fading edge is not a precise boundary and the champion gameplay radius still contributes to hits. No skillshot radius, damage, timing, collision or director behavior was changed.
- `node --test tests/*.test.cjs`: 211/211 pass, including visual extent and color checks for Ezreal, Lux, Blitz and both Vel'Koz missile radii. `node --check game.js` and `git diff --check` pass. Browser: started Expert Dodge and visually observed the Ezreal projectile in flight. Lux, Blitz and Vel'Koz artwork was exercised by the simulated render harness but not directly reviewed during a live browser encounter. Extended real playtests and the rest of Gauntlet and CS work remain open.

## Fox-Fire movement caps and dodge escape witnesses (31 October 2026)

- Ahri's W already applied a linearly decaying 40% movement bonus over two seconds, but ignored the upper movement-speed soft caps. Boosted Ahri movement now applies the community-documented 415/490 game-unit caps after the bonus and before conversion back to canvas speed: e.g. 330 × 1.4 = 462 raw becomes 452.6 game units/s. Base movement, arcade presets, minions, terrain, Flash and dash speed remain unchanged. Items, runes, slow resistance, low-speed soft caps and authoritative verification of the exact W decay curve are not implemented. Source: [League of Legends Wiki movement-speed calculations](https://wiki.leagueoflegends.com/en-us/Movement_speed). Dodge records now use `director_v23`; affected Ahri-mode records use a new movement suffix while historical records remain stored.
- Exposed an optional escape witness from the director's existing straight-cast safety check and added a simulation regression exercising actual Ezreal, Lux, Blitz and Ahri attacks from varied angles, with and without another directed projectile. The test waits 200 ms, follows the selected route, and verifies no collision in every accepted case. This checks sampled scenarios, not all reachable trajectories, rare ultimates, all combinations or human reaction fairness.
- `node --test tests/*.test.cjs`: 213/213 pass, including W cap/decay and the sampled escape witnesses; `node --check game.js` and `git diff --check` pass. Browser: started Expert Dodge, right-clicked and activated W while moving; the observed smoke test did not measure the numerical speed. Extended human playtests, broader overlap validation, visuals and accurate CS wave behavior remain outstanding.

## Lock-aware Dodge safety (31 October 2026)

- Dodge's candidate/commit safety checks previously assumed the player could always start walking after a fixed 200 ms, even while Ahri had an uninterruptible Q/E cast, a root, or an active R dash. Straight shots, Vel'Koz split forecasts, Xerath Q/W, Orianna R and Malphite R now use the greater of the 200 ms training reaction allowance, remaining spell cast and remaining root time. Active dash displacement is not yet forecast: candidate casts requiring a sampled walking escape are conservatively deferred until the dash ends. An ordinary attack windup is intentionally excluded because a movement order can cancel it. This changes training-director selection only; it does not alter spell speed, damage or player ability timings. Local Dodge records use `director_v24`.
- `node --test tests/*.test.cjs`: 215/215 pass, including cast-lock rejection, dash deferral for sampled threats, root checks and an actual simulated Lux avoidance with a 250 ms Ahri cast; existing 12-minute simulation and escape-witness tests also pass. `node --check game.js` and `git diff --check` pass. Browser: started Expert Dodge and executed Q followed by R successfully; the exact safety scheduling was validated in simulation, not an extended human playtest. More sophisticated dash-path prediction, full movement-based fairness testing, visual fidelity and CS wave behavior remain open.

## First validated mixed Dodge encounter (31 October 2026)

- Added a naturally scheduled Ezreal Q + Xerath W combination to Standard and Expert Dodge after the 45-second opening. At Ezreal's aim lock, a seeded director opportunity may schedule Xerath W only if a single walkable escape, after the current reaction/cast-lock delay, clears both the delayed W circle and the complete predicted straight Q path. The forecast also rejects incoming hits before the player can react. Pending other casters, multiple projectiles, Ahri return, Vel'Koz split and other AoEs remain excluded; Foundation retains its one-threat cap. This is a deliberately limited training combination and sampled safety forecast, not a complete solver or a claim that every overlap is fair. Individual spell speeds, radii and damage were not changed. Local Dodge records use `director_v25`.
- Independent stationary, high-HP 180-second simulation audits across 10 seeds observed 0 simultaneous Ezreal Q + Xerath W overlaps on Foundation, 27 on Standard and 52 on Expert. These counts are occurrences across all runs, not per minute or evidence of human fairness. The original post-release scheduling produced zero natural overlaps; the final version chooses at cast lock to preserve a useful reaction window.
- `node --test tests/*.test.cjs`: 219/219 pass, including actual simulated shared-path escapes on Standard/Expert, seeded director scheduling, natural session occurrence, reaction-window rejection, unsupported-combination exclusion, Foundation cap and the existing long-session cap checks. `node --check game.js` and `git diff --check` pass. Browser: started Expert Dodge and exercised repeated movement, but the automated input run ended before the 45-second eligibility time; the new overlap was not visually reviewed in a human browser session. More diverse combinations, moving-player fairness sampling, human 3/12-minute playtests and faithful CS wave behavior remain open.

## Ezreal-to-Lux follow-up pressure (31 October 2026)

- Added a seeded chance on Standard/Expert after 45 seconds for a Lux visitor to enter while an Ezreal Q cast is committed. It uses the normal visible entry, threat-cap and shared-path checks; at Lux's own aim lock the ordinary safety check runs again against any remaining projectiles. The visitor starts farther away, giving the first Q time to resolve before Lux commits. This is a short sequence of two distinct decisions, not a claim that two projectiles always overlap. It does not reuse the same champion's cooldown or alter either spell's speed, range or damage. Foundation remains single-threat. The Ezreal + Xerath W combination remains available; the seeded opportunities are mutually exclusive for each initial Ezreal cast. Local Dodge records use `director_v26`.
- In 10 stationary, high-HP seeded 180-second simulations, Foundation had 0 follow-up entries, Standard had 19, and Expert had 64; all those observed visitors reached a cast after the entry-distance correction. These are counts across all runs, not human difficulty or win-rate measurements. A prior shorter entry produced visitors that all cancelled for lack of safe reaction time; that version was not retained. A fresh 10-seed audit still saw 28 Standard and 44 Expert Ezreal+Xerath overlaps.
- `node --test tests/*.test.cjs`: 221/221 pass, including a seeded two-cast scenario in which the player waits 200 ms for each spell and follows the sampled escapes without damage, natural Expert appearance, Foundation exclusion and existing threat-cap/long-session checks. `node --check game.js` and `git diff --check` pass. Browser: an automated right-click/W movement sequence in Expert survived 50.6 seconds and produced a normal result screen; it was not a human playtest and did not isolate a specific follow-up visually. Broader moving-player fairness, other combinations, longer human sessions and faithful CS waves remain open.

## Spirit Rush movement-speed interaction (31 October 2026)

- Ahri R previously always dashed at 765 canvas units/s, equivalent to the unboosted 1200 + 330 game-unit formula. It now uses 1200 game units/s plus Ahri's current capped movement speed when the dash starts, so using W beforehand makes the dash appropriately faster. This follows the reported [Spirit Rush speed](https://wiki.leagueoflegends.com/en-us/Ahri). Snapshotting speed at cast start is a documented training approximation: whether a change during the dash updates live has not been independently verified. The existing 0.5 scale, route/wall approximation, 500-unit range, no-AP damage and skill timing are unchanged. Local Dodge records use `director_v27` and other affected Ahri-mode records use `move_v2`.
- `node --test tests/*.test.cjs`: 222/222 pass, including exact unboosted and W-boosted dash displacement, decaying W before R, cast-time snapshot, existing dash collision and charge tests. `node --check game.js` and `git diff --check` pass. Browser: started Expert Dodge and executed W then R; the on-screen movement and abilities worked, while numerical speed was verified in simulation. Full live-client calibration, human Gauntlet playtests, hitbox/animation fidelity and natural CS waves remain open.

## Later minion waves and Spirit Rush terrain (31 October 2026)

- Fresh CS waves now apply the same initial row-matching approximation as the first wave. Previously wave two onward ignored it, causing several melee minions to pick the same opponent immediately. Existing targets remain sticky; death and higher-priority retargeting still use the existing combat pipeline. This row rule is a training approximation, not a claim about Riot's internal AI.
- Riot's [26.1 patch notes](https://www.leagueoflegends.com/en-us/news/game-updates/patch-26-1-notes/) specify 350 minion movement speed, first cannon on wave three, and 30-second early wave intervals; the drill is a pre-positioned scene, not full Nexus travel. Riot's [26.10 notes](https://www.leagueoflegends.com/en-us/news/game-updates/league-of-legends-patch-26-10-notes/) removed minion aggro from a champion attacking an allied minion. Minion-vs-minion target selection and the finite-map ingress hold remain approximate and need further comparison with recorded live matches; turrets and complete map are absent.
- Ahri's Spirit Rush now crosses an approximate wall if its endpoint is walkable; an endpoint inside a wall stops at the near edge. Motion remains continuous and vulnerable to projectiles. A root interrupt inside terrain resolves to a nearby walkable point. This is approximate: it does not implement all wall-edge snapping or the real Rift navmesh. [Riot 12.9](https://www.leagueoflegends.com/en-us/news/game-updates/patch-12-9-notes/) made Ahri wall jumps more forgiving. Dodge records use director_v28, other affected Ahri records move_v3.
- Added regression coverage for later-wave row selection and dash wall crossing, including interrupted dashes; existing tests cover survivors acquiring incoming waves after target deaths.

## Ahri base health regeneration (31 October 2026)

- Level-one Ahri now regenerates 2.5 health per five seconds during active play, capped at maximum HP and suspended during pause or after death. This applies to Ahri-based drills and the Ahri reference-spell tests, with no new visual indicator. Continuous fixed-step regeneration approximates the timing of the live game's internal ticks; level growth, items and runes are not simulated. [Riot 12.3](https://www.leagueoflegends.com/en-gb/news/game-updates/patch-12-3-notes/) set the base to 2.5, also listed in the current [community base-stat table](https://wiki.leagueoflegends.com/en-us/List_of_champions/Base_statistics).
- Damage and hit counters remain gross damage and hits, not net health loss. Changed pre-existing spell damage assertions to check that counter independently of natural recovery. Local Dodge records now use `director_v29`; other affected Ahri-mode records use `move_v4`.
- Tests cover the rate, maximum, pause, death, non-Ahri presets and preservation of damage accounting. Browser smoke: launched Expert Dodge and observed a normal unattended loss with spell and phase statistics; precise regeneration timing was verified by simulation rather than visually.
- Next: human 3/12-minute Dodge Gauntlet sessions, more varied jointly verified overlaps, and reliable multi-wave CS behavior including future turret simulation. This feature does not establish Gauntlet completion.

## Xerath Q directional cue (31 October 2026)

- Ambient Xerath Q previously gave only an undirected point of light before its beam fired, leaving players without a useful indication of its orientation. The existing source now displays a short 45-canvas-unit charge pointing in the beam's direction, without drawing the full projected trajectory. This is an original training cue, not an exact reproduction of Riot VFX; the beam geometry, timing and damage have not changed. Since information available to players changed, Dodge records use `director_v30`.
- Added a render regression for direction and the absence of a full aim line. `node --test tests/*.test.cjs`: 229/229 pass; `node --check game.js`, generated-data check and `git diff --check` pass. Browser smoke: launched Expert Dodge and issued a movement command. The Xerath cue itself was checked in the render harness and still needs live visual review during a sufficiently long real run.
- Remaining: validate readability and fairness in human 3/12-minute sessions, extend compatible overlap coverage, and continue accurate CS wave/turret simulation. The Gauntlet is not yet complete.

## Projectile expiry and moving hitboxes (31 October 2026)

- A projectile that exhausted its lifetime or reached its return anchor during a simulation step previously compared its shortened projectile path against the target's **entire** step of movement. This could award a hit after the projectile had ceased to exist. Swept collisions now compare projectile travel with the corresponding fraction of champion or minion movement for enemy shots, both Ahri orbs, minion missiles and other player projectiles. Movement inside a fixed step is still linearly interpolated, not a complete substep physics simulation; Riot's real hitboxes/map and complex simultaneous collisions remain approximations.
- Added tests for hostile and returning-orb expiry at 30 FPS and larger steps, an actual collision before expiry, and a moving allied minion. Existing swept-hit, damage, wave and director tests remain intact. `node --test tests/*.test.cjs`: 232/232 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass.
- Browser smoke: started Expert Dodge, moved and used W; then launched CS Practice and observed the initial wave. The subframe expiry edge case was verified in simulation, not isolated visually in a live browser session. Local records use `director_v31`, `cs_ahri_v13` and `move_v5` for the affected Ahri modes.
- Next: human multi-minute Gauntlet sessions and moving-player fairness validation; improve overlap coverage and true lane-wave/turret behavior. Full Gauntlet and product remain unfinished.

## Moving-player dodge forecasts (31 October 2026)

- The shared straight-projectile and Vel'Koz safety forecasts previously held Ahri still for the 200 ms reaction allowance, even when an existing move order would carry her into an already-active projectile. The forecast now follows the current approximate world route during that allowance, respects existing cast/root/attack-windup movement locks, and starts its sampled escape at the predicted reaction position. Xerath W's shared-path check uses the same start. This is a training-director policy, not enemy AI or a guarantee of fairness: it snapshots current movement speed (rather than forecasting W decay), does not predict future orders or active dashes, and the separate Xerath Q/Orianna/Malphite area checks still do not forecast the existing route.
- New regression cases reject an overlap when existing movement enters a projectile before reaction, and exercise accepted witness paths after continued motion in both directions. Existing sampled straight, Vel'Koz and Ezreal+Xerath tests also pass. `node --test tests/*.test.cjs`: 234/234 pass; `node --check game.js`, generated-data check and `git diff --check` pass. Browser: launched Expert Dodge, issued a move order and activated W; the specific fairness case was verified in simulation, not during a human long session. Dodge records use `director_v32`.
- Next: include moving-player forecasts in the separate area/rare-event checks and model decaying W conservatively; run real 3/12-minute Gauntlet playtests; continue CS waves and turrets. Gauntlet and broader product remain unfinished.

## Moving-player area safety forecasts (31 October 2026)

- Xerath Q, Orianna R and Malphite R now check the position reached by the existing move order during the reaction allowance, then sample up to 32 straight walkable responses before impact. The checks use each effect's existing collision geometry plus an 8-canvas-unit safety margin. This is an encounter scheduling approximation, not a perfect fairness proof: W speed decay is not forecast, Flash and future orders are not modeled, and the sampled directions do not exhaust all navigable routes. Orianna Q during the earlier ball approach is separate from the ultimate check. Difficulty and actual ability damage, speed and hitboxes were not changed. Dodge records use `director_v33`.
- Added actual simulated moving-player witness tests for Xerath Q, Orianna R and Malphite R, plus a case where moving toward Orianna's ball makes the ultimate unsafe. `node --test tests/*.test.cjs`: 238/238 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke: started Expert Dodge and issued a movement order; the rare/ambient safety cases were verified in the simulation harness rather than a long human session.
- Next: model W's changing speed in these forecasts, validate combinations and area spells in long moving-player and human sessions, and continue reliable CS waves/turrets. The Gauntlet remains unfinished.

## W decay in dodge forecasts (31 October 2026)

- Dodge safety forecasts now integrate Ahri's current Fox-Fire movement-speed decay and the existing soft caps, both while continuing an old move order and when following the proposed escape. A cast/root/windup lock prevents travel but W continues decaying during the lock. Actual player movement and ability stats are unchanged. The integration is continuous while gameplay updates in 1/120-second steps, so small rounding differences remain; the predictor still cannot foresee future inputs, newly cast W, Flash, a dash or all possible routes. Dodge records use `director_v34`.
- Added tests comparing predicted and actual movement across W expiration and caps, including movement resuming after root, and executing boosted straight-shot and Xerath area escape witnesses. `node --test tests/*.test.cjs`: 242/242 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke: started Expert Dodge, moved and activated W; quantitative forecast validation was performed in simulation, not in a long human playtest.
- Next: broader multi-seed moving-player fairness and real 3/12-minute Gauntlet sessions; test and refine visuals and overlap cadence; continue authentic CS waves and future turret behavior. Gauntlet and the wider game are not finished.

## Distinct Orianna-pattern caster (31 October 2026)

- The Orianna encounter previously reused the Lux mage sprite, making their sources difficult to distinguish. It now uses the original generated `assets/clockwork-caster.png` with its own 54×80 draw envelope and retains the independently simulated moving ball; the fallback vector silhouette still works if the image fails. Collision, spell timing, damage and positions are unchanged. This is static artwork, not Riot's actual character model or animation. Art provenance and prompt are in `assets/README.md`.
- `node --test tests/*.test.cjs`: 243/243 pass, including sprite selection, dimensions and missing-image fallback; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke: loaded the image from the local server, started Dodge and moved. Orianna appears only in longer runs and the sprite has not yet been reviewed in an actual live encounter; selection was verified in the render harness.
- Next: real multi-minute moving-player Gauntlet playtests, validate readability of the Orianna sprite/ball and fair overlap rhythm, then continue accurate CS waves and turrets. The Gauntlet and complete product remain unfinished.

## Area escape near arena boundaries (31 October 2026)

- Area safety sampling previously tried only full-distance endpoints. Near a boundary or wall it could reject a genuinely reachable, closer stopping point and defer an otherwise fair encounter. Candidate endpoints are now bounded to the arena and clipped against wall proxies; the resulting shorter path must still be walkable and outside the attack plus safety margin. This can make previously deferred area attacks eligible, but is not a claim that all corner scenarios are fair or that the simplified arena matches Rift. Dodge records use `director_v35`.
- Added an Orianna corner case that was rejected before this change and now executes its witnessed escape successfully, plus a test ensuring a destination beyond a wall is not accepted. Added multi-position, moving-player Ezreal witness coverage with/without W; it samples scenarios, not every route or combination. `node --test tests/*.test.cjs`: 246/246 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke: started Expert Dodge and issued a movement order toward an arena edge; the specific rare-event edge case was exercised in simulation, not isolated visually.
- Next: audit rare-event scheduling and moving-player behavior across seeds and perform real 3/12-minute playtests; inspect generated Orianna artwork in an actual encounter; improve minion waves and future turret behavior. The Gauntlet and broader product remain unfinished.

## Dodge encounter variety and moving-session audit (31 October 2026)

- The regular encounter director now avoids locking a third consecutive identical complex threat (Lux, Ahri, Blitz, Vel'Koz, Xerath Q/W), while repeated Ezreal Q remains permitted. Visitor threats are tracked at aim lock and ambient spells when spawned; a visitor interrupted after lock still influences this training-only rotation. A blocked random visitor choice falls back to Ezreal, and a forced follow-up can be deferred. This changes scheduling only, not individual spell stats, speed or hitboxes. Rare Orianna/Malphite events remain on separate clocks. Dodge records use `director_v36`.
- Added a three-seed 179-second simulation with repeated movement and W, artificial high HP and no player attempt to dodge: it observed 48/54/55 total casts, including 20/17/24 Ezreal casts, and Orianna once in each run; one run also committed Malphite. These are automated cadence samples, not human performance or fairness measurements. Tests cover the complex-repeat limit and repeated Ezreal, plus existing long-session, damage and encounter checks. `node --test tests/*.test.cjs`: 248/248 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass.
- Browser smoke: started Expert Dodge and issued a movement order. Long human sessions, complete fairness validation, actual Orianna encounter art review and faithful CS waves/turrets remain open. The Gauntlet is not complete.

## Readable Dodge results (31 October 2026)

- Dodge results now keep survival, threats avoided, hits, damage, blocked, cast total, score and local best in a compact summary. Existing per-spell cast counts and phase outcomes move into a keyboard-accessible native `details` section; it starts closed and is cleared when starting another drill. No scoring or gameplay logic changed. The game remains playable if an older cached HTML document lacks the new details elements. The stylesheet URL is versioned so browsers fetch the wrapping styles.
- `node --test tests/*.test.cjs`: 249/249 pass, including summary/breakdown content, unresolved phases, lethal hits and reset/pause isolation; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser: ran an unattended Expert Dodge loss and expanded the detailed spell report; the first screenshot exposed cached old CSS and clipped text. After versioning CSS the compact collapsed screen displayed correctly; repeated attempts to reopen the report for a final visual check timed out in the browser automation. Text wrapping and final expanded appearance still need a live visual recheck.
- Next: visually recheck the expanded report, human long Gauntlet sessions and moving-player fairness, then accurate CS waves and turret simulation. The Gauntlet and broader product remain unfinished.

## Xerath rotation fallback and results review (31 October 2026)

- Fixed a mismatch in the regular-encounter variety rule: if Xerath Q or W was selected after two identical Xerath encounters, control previously fell through to Vel'Koz rather than the intended Ezreal fallback. Both blocked ambient bands now choose an Ezreal visitor subject to the normal spawn, visibility and safety checks. Individual ability stats and cooldowns are unchanged. Dodge records use `director_v37`.
- Added seeded regression coverage for both blocked Xerath bands; `node --test tests/*.test.cjs`: 250/250 pass, including moving-session and encounter-variety tests. `node --check game.js`, generated Ahri data check and `git diff --check` pass.
- Browser: ran an unattended Expert Dodge round, expanded Spell breakdown and confirmed the cast totals and phase rows wrap within the panel after the stylesheet cache update. Reloaded, restarted Dodge and issued a movement order after the code fix. The exact third-Xerath fallback was tested in simulation, not observed live.
- Next: human 3/12-minute Gauntlet sessions and broader moving-player/overlap fairness; review Orianna artwork in an actual encounter; continue authentic CS wave and future turret work. The Gauntlet and wider product remain unfinished.

## Area impact timing (31 October 2026)

- Xerath Q/W, Orianna R, Malphite R and legacy instantaneous areas now resolve collision using the interpolated player position when the impact timer expires within the current simulation step. Previously they used the end-of-step position, allowing a hit after entering too late or a miss after leaving too late. Xerath W center amplification uses the same impact position. This is linear within-step interpolation, not full continuous physics or a claim of exact Riot server timing. Dodge records use `director_v38`.
- New tests demonstrate late entry, late exit and Xerath W center damage at the actual impact time; existing rare-spell and escape tests remain intact. `node --test tests/*.test.cjs`: 253/253 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke: started Expert Dodge and issued a move order. Subframe cases were checked in simulation, not isolated in a human browser session.
- Next: human 3/12-minute Gauntlet sessions and expanded overlap/fairness validation, review Orianna artwork in an actual encounter, and continue authentic CS wave and turret work. The Gauntlet and wider product remain unfinished.

## Orianna ball arrival timing (31 October 2026)

- Orianna Q's travel and arrival checks now use player movement only up to the instant the ball reaches its destination. Previously, if arrival occurred partway through a step, movement after arrival could cause a false hit or erase a valid hit; threat qualification likewise uses the pre-arrival trajectory. The existing arrival radius, damage and ball flight speed are unchanged. This is linear interpolation within a fixed step, not a claim of exact live-server timing. Dodge records use `director_v39`.
- Added regression cases for late entry and late exit around ball arrival; existing path, arrival-radius, lethal-hit and avoidance tests pass. `node --test tests/*.test.cjs`: 255/255 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke: started Expert Dodge and moved; the subframe Orianna cases were tested in simulation, not isolated in a live encounter.
- Next: human 3/12-minute Gauntlet sessions and broader overlap/fairness validation, review Orianna artwork in a real encounter, and continue authentic CS waves and turret work. Gauntlet and product remain unfinished.

## Paired Ezreal pressure (31 October 2026)

- Standard and Expert can now seed two independent Ezreal visitors after 45 seconds. Both enter visibly from separate positions, each casts once, and the second caster rechecks a shared walking escape against the first committed Q before locking aim. Foundation remains single-threat. This uses the existing spell values and threat budgets; probability, source placement and sampled safety are training policies, not Riot AI. Paired visitor spawn/aim positions are separated by at least 100 canvas units, but sprite motion and all possible player routes are not exhaustively checked. Dodge records use `director_v40`.
- The initial short follow-up design never produced a safe natural overlap under the 200 ms reaction allowance, so it was replaced with simultaneous visible entry. Regression tests now observe two simultaneous Q projectiles in seeded Standard/Expert simulations, none in Foundation, and execute shared-escape witnesses across multiple seeded pairs. Existing Lux follow-up, Ezreal/Xerath, cap and long-session tests still pass. `node --test tests/*.test.cjs`: 257/257 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass.
- Browser smoke: reloaded Expert Dodge and moved. The new paired encounter begins after 45 seconds and was validated in simulation rather than visually isolated in a human browser session. Next: human multi-minute runs and broader moving-player fairness; review Orianna art in a live encounter; continue CS waves/turrets. The Gauntlet and broader product remain unfinished.

## Ezreal-pattern readability and paired-escape regression (31 October 2026)

- Replaced the archer illustration for the Ezreal Q-pattern visitor with a distinct generated explorer and magical gauntlet. It uses the existing 74×80 sprite bounds and fallback; game hitboxes, ability stats and encounter scheduling are unchanged. Source and limitations are documented in `assets/README.md`.
- Added a paired-Ezreal regression sampling moving-player situations with W speed decay: accepted encounters must retain a shared escape path that avoids both shots. This covers sampled seeds, not every possible route or overlap. The sprite-selection test and missing-image fallback also pass.
- `node --test tests/*.test.cjs`: 259/259 pass. `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke showed the new caster during an Expert Dodge round. An automated Standard round reached 52.7 seconds but viewport interruption affected movement, and the paired encounter was not visually isolated. These runs are not human playtests.
- Next: human 3/12-minute Gauntlet sessions, visually confirm paired encounters and Orianna, review moving-player fairness and then continue faithful CS waves and turret behavior. The Gauntlet and full game remain unfinished.

## Missing sprite-node fallback (31 October 2026)

- `drawChampion` now tolerates missing sprite DOM elements as well as failed images. A cached older HTML page paired with newer JavaScript can lack recently added caster image elements; previously attempting to draw one could stop the render loop. Missing Ahri and directional ranger nodes also use the existing procedural fallback. No gameplay or hitboxes changed.
- Regression covers missing explorer, void, clockwork, Ahri and directional image nodes. `node --test tests/*.test.cjs`: 260/260 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke started Expert Dodge normally; the mixed cached-HTML case was tested in the DOM harness, not reproduced in the browser.
- Next: human 3/12-minute Gauntlet sessions, visually confirm paired encounters and Orianna, review moving-player fairness, then continue faithful CS waves and turret behavior. The Gauntlet and full game remain unfinished.

## Dodge visitor projectile release timing (31 October 2026)

- A visitor's cast can finish partway through a fixed simulation step. Its projectile now travels only during the remaining part of that step, and collision uses the interpolated player trajectory from release onward. Previously it travelled for the entire step and could hit a player who had already moved away before release. The simulation normally uses 1/120 s steps; these tests also use a deliberately longer step to expose the defect. Other caster paths are not yet converted to sub-step release. Dodge records use `director_v41` because hit timing can change.
- Added regressions for distance travelled after release and player movement before release. `node --test tests/*.test.cjs`: 262/262 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke started Expert Dodge and issued a right-click movement order; sub-step collision cases were validated in the harness rather than visually isolated.
- Next: audit release/impact timing for other caster paths, human 3/12-minute Gauntlet playtests, visually confirm paired encounters and Orianna, and continue faithful CS waves and turret behavior. The Gauntlet and full game remain unfinished.

## Vel'Koz split origin after impact (31 October 2026)

- A main Vel'Koz Q bolt that hits the player now stops at its first swept-circle contact before spawning the perpendicular split. Previously the split started at the end-of-step projectile position, beyond the contact. The champion's movement during the projectile's active interval is included. This fixes our simulation geometry; the 0.25 s split delay remains a training approximation and needs client verification. Dodge records use `director_v42`.
- Regression checks exact split origin against both stationary and moving champions, using an exaggerated step to make the error visible. `node --test tests/*.test.cjs`: 263/263 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke started Expert Dodge and issued a move order; this specific collision was tested in the harness, not isolated in a live encounter.
- Next: audit the remaining split/return timing and other caster release paths, conduct human 3/12-minute Gauntlet playtests, visually confirm paired encounters and Orianna, then continue faithful CS waves and turret behavior. The Gauntlet and full game remain unfinished.

## Dodge survival deadline (31 October 2026)

- Dodge now simulates the final partial update up to the selected time limit before declaring victory. Previously it ended at the beginning of that step, dropping incoming hits in the remaining interval. Projectiles and area impacts before or at the deadline are resolved, while events after it are excluded. A lethal hit ends the round immediately; the displayed survival time remains quantized to the simulation step. Other drills' timeout behavior is unchanged. Dodge records use `director_v43`.
- Added boundary regressions for lethal projectiles and area effects on either side of the deadline. `node --test tests/*.test.cjs`: 266/266 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke started Expert Dodge and issued a movement order; the deadline edge cases were simulated, not visually isolated.
- Next: continue split/return and other caster timing audits, human 3/12-minute Gauntlet playtests, visual confirmation of paired encounters and Orianna, then faithful CS waves and turret behavior. The Gauntlet and full game remain unfinished.

## Vel'Koz split phase timing (31 October 2026)

- The existing 0.25 s training delay now starts at the main projectile's swept impact or expiry rather than the end of that update. Split bolts activate within the update where the delay expires and only collide against player movement after activation. This removes up to two fixed-step timing errors; it retains the existing 0.25 s approximation and does not assert that value matches live League. The simulation normally steps at 1/120 s. An unusually large single step spanning both main impact and the entire split delay is still deferred to the next update. Dodge records use `director_v44`.
- Added regressions for partial-step expiry, split travel, pre-activation movement and a hit after activation. `node --test tests/*.test.cjs`: 269/269 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke started Expert Dodge and issued a movement order; the split timing cases were tested in the simulation harness, not isolated in a live encounter.
- Next: verify split delay against reliable game data, audit returning-orb/other caster timing, run human 3/12-minute Gauntlet playtests, visually confirm paired encounters and Orianna, then continue faithful CS waves and turret behavior. The Gauntlet and full game remain unfinished.

## Seeded movement leads for straight Dodge casts (31 October 2026)

- Moving players now sometimes face an Ezreal, Lux or Blitz visitor aiming at the position reached by continuing the current movement order through that spell's cast time. The 25% seeded choice is a training policy, not Riot AI or knowledge of future player inputs. Stationary players and Ahri/Vel'Koz encounters retain their previous aiming. Aim locks once; existing cast times, projectile speed and hitboxes are unchanged. The same sampled escape forecast now uses the chosen aim direction and checks already committed threats before allowing the cast. Dodge records use `director_v45`.
- A multi-seed regression observes both direct and led shots and executes sampled walking escapes for led Ezreal casts. It is not an exhaustive fairness proof, particularly around overlapping spells and changing inputs. `node --test tests/*.test.cjs`: 270/270 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke started Expert Dodge and issued a movement order; led shots were verified in simulation, not identified individually in a live browser run.
- Next: human 3/12-minute Gauntlet playtests with lead shots and overlap fairness; visually confirm paired encounters and Orianna; verify Vel'Koz split timing against reliable data; continue faithful CS waves and turret behavior. The Gauntlet and full game remain unfinished.

## Lead fallback and paired-aim coverage (31 October 2026)

- If a predicted movement lead fails the existing safety forecast, a straight-shot visitor now separately tests a direct shot before exiting. Both options still require a sampled walkable escape, and the fallback does not alter spell stats. This reduces silent canceled encounters without asserting a complete fairness guarantee. Dodge records use `director_v46`.
- Strengthened the paired-Ezreal moving/W regression to use the follow-up's actual locked aim, including led follow-ups, and require that each sampled accepted cast still has a simulated common escape. Added a scenario where an unsafe lead falls back to a separately safe direct shot. The sampled scenarios do not cover every pair or player input. `node --test tests/*.test.cjs`: 271/271 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke started Expert Dodge and issued a movement order; the specific fallback and paired paths were exercised in simulation.
- Next: human 3/12-minute Gauntlet sessions with lead shots and overlap fairness; visually confirm paired encounters and Orianna; verify Vel'Koz split timing against reliable data; continue faithful CS waves and turret behavior. The Gauntlet and full game remain unfinished.

## W-aware straight-shot precheck (31 October 2026)

- The straight-shot director's initial distance check now integrates the player's current W movement boost and its decay over the available response time. Previously it used base speed and could reject an encounter even though the later shared-path forecast and the actual boosted movement admit an escape. The final projectile/terrain forecast is unchanged; the accepted difficulty may increase when W is already active. Dodge records use `director_v47`.
- Regression demonstrates a shot rejected at base speed but accepted and avoided with W after the 200 ms reaction allowance. Existing moving, paired and led-shot tests remain in the suite. `node --test tests/*.test.cjs`: 272/272 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke started Expert Dodge, moved and activated W; the specific director decision was verified in simulation.
- Next: human 3/12-minute Gauntlet playtests including boosted overlap fairness; visually confirm paired encounters and Orianna; verify Vel'Koz split timing against reliable data; continue faithful CS waves and turret behavior. The Gauntlet and full game remain unfinished.


## Planned Cassiopeia R reaction (31 October 2026)

- User requested training to turn away from Cassiopeia R. Added it to the existing Dodge Gauntlet roadmap, after current encounter stability/playtesting and before declaring the Gauntlet complete. It is not implemented and does not add a separate mode. The design preserves the user's no-stun-in-Dodge constraint: distinguish would-be stun, turned-away hit and full escape, without immobilizing the player. See `docs/DODGE_GAUNTLET_RHYTHM.md` for sources, uncertainties and acceptance checks.
- Documentation-only change; no gameplay or assets changed. Next: continue Gauntlet fairness and playtesting, then implement the planned facing-based encounter.

## Flash facing for direction-sensitive mechanics (31 October 2026)

- Flash now turns the champion toward its actual displacement, while a zero-distance Flash preserves the existing facing. An Ahri spell already in its cast windup retains its locked spell angle when Flash changes champion facing. This addresses a prerequisite for the planned Cassiopeia R reaction; Cassiopeia R itself remains unimplemented. The direction behavior is supported by the [community Flash reference](https://wiki.leagueoflegends.com/en-us/Flash); exact live-client wall snap and zero-distance behavior remain approximations. Dodge records use `director_v48`.
- Added tests for turn direction, zero displacement and Flash during Q. `node --test tests/*.test.cjs`: 274/274 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke started Expert Dodge, moved and used Flash (cooldown displayed); the facing and cast-angle cases were verified in simulation.
- Next: finish current encounter fairness and human playtests, then implement the planned Cassiopeia R turn-away encounter; continue faithful CS waves and turret behavior. The Gauntlet and full game remain unfinished.

## Xerath W overlap escape forecasting (31 October 2026)

- Xerath W's candidate response now integrates current W speed and its decay, and clips candidate endpoints at arena bounds or blocking walls before testing the actual escape and any simultaneous Ezreal Q. The existing area and missile collision tests still gate the encounter. This can admit previously deferred combinations and is a sampled training forecast, not an exhaustive fairness proof. Dodge records use `director_v49`.
- Added simulations of moving W-boosted players against overlapping Xerath W/Ezreal Q, plus shortened safe routes near boundaries. `node --test tests/*.test.cjs`: 276/276 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke started Expert Dodge, moved and activated W; the overlap and boundary cases were tested in simulation.
- Next: longer human Gauntlet sessions and moving/overlap fairness, visually confirm rare and paired encounters, then implement the planned Cassiopeia R turn-away encounter. The Gauntlet and full game remain unfinished.

## Xerath W lateral overlap escapes (31 October 2026)

- Xerath W now samples up to 16 walkable response directions for each candidate impact position, trying the direct route away first. Each accepted endpoint must be outside the area and its entire response trajectory must still clear a committed or in-flight Ezreal Q. This can admit combinations previously rejected because only the straight-away route was checked; it remains a sampled forecast, not a guarantee for all inputs. Dodge records use `director_v50`.
- Added a moving-boost scenario that exercises a lateral shared escape and survives actual simulation. Updated the direct-spawn test to follow the selected witness; the seeded natural-scheduling test now verifies scheduling separately instead of assuming that moving directly away is always the selected escape. `node --test tests/*.test.cjs`: 277/277 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke started Expert Dodge and issued a movement order; the overlap cases were verified in simulation, not isolated live.
- Next: longer human Gauntlet sessions and moving/overlap fairness, visually confirm rare and paired encounters, then implement the planned Cassiopeia R turn-away encounter. The Gauntlet and full game remain unfinished.

## Oblique straight-shot escape forecasts (31 October 2026)

- The straight-shot director now samples oblique responses as well as the two perpendicular ones, while still checking the complete path against terrain and all committed/in-flight directed missiles. This can admit a previously deferred overlap with a feasible diagonal response; the sampled model is not an exhaustive fairness proof. Dodge records use `director_v51`.
- Added a simulated oblique escape against two Ezreal shots and a separate moving-player regression for a led committed Ezreal cast overlapping Xerath W, with and without W boost. `node --test tests/*.test.cjs`: 279/279 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke started Expert Dodge and issued a move order; these specific combinations were exercised in simulation, not isolated visually.
- Next: human 3/12-minute Gauntlet playtests, visual review of paired and rare encounters, then the planned Cassiopeia R turn-away encounter. The Gauntlet and full game remain unfinished.

## Shortened straight-shot escape routes (31 October 2026)

- Straight-shot candidate responses are now bounded and clipped to terrain before being checked against all incoming projectiles. A shorter move can therefore qualify when the player's existing movement already provides enough clearance; the collision forecast still rejects unsafe stops. This can change encounter scheduling near edges and walls; `director_v52` isolates Dodge records. The sampler remains approximate and is not an exhaustive proof of fairness.
- Added moving/W-boosted regression scenarios near arena boundaries that execute accepted shortened responses against a real simulated shot. A broader search did not isolate a specific wall-clipped passing scenario, so that case still needs targeted validation. `node --test tests/*.test.cjs`: 280/280 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke started Expert Dodge and issued a movement order; the boundary case was simulated.
- Next: target wall-clipped cases and longer human Gauntlet sessions; visually confirm paired/rare encounters, then implement the planned Cassiopeia R turn-away encounter. The Gauntlet and full game remain unfinished.

## Enemy Ahri Q return transition (31 October 2026)

- Enemy Ahri Q now begins its return during the remainder of the simulation step in which its outbound range expires. The return collision is checked against only the player's movement after the turn, and outbound and return outcomes remain separate. Previously the return waited until the next step. The existing return speed and caster-anchor behavior are unchanged; this is a fixed-step approximation, not a claim of exact Riot server timing. Dodge records use `director_v53`.
- Added tests for a return hit in the same step and movement outside the return's active interval. `node --test tests/*.test.cjs`: 282/282 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke started Expert Dodge and issued a move order; the transition edge cases were simulated, not isolated in a live encounter.
- Next: targeted wall-clipped fairness cases, human 3/12-minute Gauntlet sessions and visual review of paired/rare encounters, then implement the planned Cassiopeia R turn-away encounter. The Gauntlet and full game remain unfinished.

## Bounded Dodge encounter rhythm (31 October 2026)

- Standard and Expert now vary regular encounter opportunity spacing after the first 45 seconds: 30 s baseline, 8 s at 0.8× interval, and 5 s at 1.3× interval, repeating. Existing seeded interval jitter, threat caps, fairness checks and spell timing remain in place; Foundation remains unchanged. This is an initial training policy, not League champion cooldown data, and has not been tuned through human play. Rare event clocks remain separate. Dodge records use `director_v54`.
- Added a director-level regression that checks scheduled intervals in all three rhythm phases and unchanged Foundation spacing. `node --test tests/*.test.cjs`: 283/283 pass, including existing 12-minute automated scheduling tests; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke selected the three-minute Expert setting, started Dodge and moved; it did not complete a human three-minute run or assess the rhythm subjectively.
- Next: human 3/12-minute sessions to tune rhythm and overlap fairness, visual review of paired/rare encounters, then the planned Cassiopeia R turn-away encounter. The Gauntlet and full game remain unfinished.

## Vel'Koz split dodge scoring (31 October 2026)

- The two perpendicular split bolts now count as at most one avoided opportunity, awarded only after both finish without a player hit. Previously each threatened branch could award a dodge independently, including credit before the other branch hit. The detailed report still records individual projectile-phase outcomes, so its phase totals are not the same as the compact avoided-opportunity counter. Existing main-bolt outcomes remain separate. Dodge records use `director_v55`.
- Added regressions for two threatened misses and for a later sibling hit after the first branch misses. `node --test tests/*.test.cjs`: 285/285 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke started Expert Dodge and issued a movement order; these split scoring cases were tested in simulation.
- Next: human 3/12-minute Gauntlet playtests and visual review of paired/rare encounters, then the planned Cassiopeia R turn-away encounter. The Gauntlet and full game remain unfinished.

## Endless Dodge and Expert pressure (31 October 2026)

- Per user request, Dodge no longer has a duration selector or automatic win: it continues until defeat or player restart/exit. The HUD clock is elapsed survival time, not a countdown. The result retains score and adds a separate local best survival time; endless records use `.director_v56.endless` and do not overwrite old timed records. Expert remains the default and primary tuning target; other difficulty options remain available for the existing modes.
- Expert regular encounter spacing gradually tightens after three minutes, capped at 78% of its prior interval by twelve minutes. The existing short pressure/recovery cycle, spell speeds, threat caps and sampled safety checks remain. This is an initial training policy requiring real player tuning, not an assertion of LoL cooldown or exhaustive fairness.
- Replaced obsolete timed-Dodge tests with endless/death and record tests; added a 13-minute simulated Expert run with artificially high HP to verify it continues and ends on death, plus ramp/cap tests. `node --test tests/*.test.cjs`: 286/286 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser: confirmed Expert default, no duration setting, started/moved in endless Dodge and observed an unattended defeat at 24.2 seconds with survival record. This was not a long human playtest.
- Next: playtest and tune Expert intensity, readability and overlap fairness over sustained runs, then implement the planned Cassiopeia R turn-away encounter. The Gauntlet and full game remain unfinished.

## Expert endless cadence tuning (31 October 2026)

- Reduced the Expert regular encounter base interval from 2.5 to 2.2 seconds. This changes attempt spacing, not champion spell speed, hitboxes, concurrency caps or sampled escape requirements. The existing bounded pressure/recovery cycle and gradual late-run ramp remain; Standard and Foundation are unchanged. Dodge records use `director_v57.endless`.
- Three automated 12-minute samples with a repeated square movement pattern, periodic W and artificially high HP produced 22–24 casts in minute one and 22–36 casts/minute across the runs. These counts include rare-event phases and are not qualified-dodge counts, human performance, or proof of fairness. One sample before tuning produced 19 in minute one. Late peaks exceed the earlier 25–32/minute design target and require human evaluation; reduce the rate if readability or fairness suffers.
- `node --test tests/*.test.cjs`: 287/287 pass, including the three long seeded cadence samples; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke started Expert endless Dodge and issued a movement order; a sustained human playtest was not performed.
- Next: real sustained Expert playtests, measure qualified opportunities and readability under late pressure, review paired/rare encounters, then implement the planned Cassiopeia R turn-away encounter. The Gauntlet and full game remain unfinished.

## Expert recovery windows (31 October 2026)

- During the existing five-second recovery portion of each Expert intensity cycle, the director now defers new directed overlaps while continuing to schedule isolated encounters. Already entering, committed and in-flight threats are not canceled. Standard and Foundation are unchanged; this is a training pacing policy, not a LoL cooldown rule. Dodge records use `director_v58.endless`.
- Added tests that recovery rejects new Ezreal/Xerath overlaps while an existing missile still hits, and that an isolated encounter can still spawn. The prior interval test now checks the intended jitter bounds because avoiding an overlap changes the seeded RNG consumption. Three automated 12-minute samples with artificial HP and repeated movement/W produced 21–32 casts/minute, including rare-event phases; this does not measure qualified dodges or replace human playtests. `node --test tests/*.test.cjs`: 289/289 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke started Expert endless Dodge and issued a movement order; recovery timing was tested in simulation.
- Next: sustained human Expert sessions to evaluate pressure/recovery and rare/paired readability, then the planned Cassiopeia R turn-away encounter. The Gauntlet and full game remain unfinished.

## Safe fallback for blocked regular encounters (31 October 2026)

- When a randomly selected Xerath Q/W cannot be scheduled, or Vel'Koz Q is selected while another directed threat prevents its isolated pattern, the regular director now tries an Ezreal Q instead of immediately waiting for another roll. The fallback still goes through visibility, terrain, active-threat cap and sampled escape checks; forced follow-ups do not silently change spell, and Expert recovery still blocks new overlaps. This may shift actual spell mix toward Ezreal and alter cadence; Dodge records use `director_v59.endless`.
- Added regressions for blocked Vel'Koz/Xerath Q selection and for recovery/cap restrictions. `node --test tests/*.test.cjs`: 291/291 pass. Three automated 12-minute Expert samples with artificial HP and repeated movement/W produced 21–36 casts/minute including rare-event phases; this is not a human fairness or qualified-dodge measurement. `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke started Expert endless Dodge and issued a movement order; the precise fallback was tested in simulation.
- Next: sustained human Expert playtests of cadence, spell mix and readability, then the planned Cassiopeia R turn-away encounter. The Gauntlet and full game remain unfinished.

## Readable spacing for mixed Dodge visitors (31 October 2026)

- Visitor placement now rejects entry paths that come within 100 canvas units of another entering or casting visitor, including different champion patterns. The forecast compares their simultaneous straight entry motion and retains the old paired-Ezreal spacing goal. It is a presentation policy, not a change to champion hitboxes or projectile physics. It does not guarantee separation after charm, exit movement or other later state changes. Dodge records use `director_v60.endless`.
- Added geometry tests for intersecting entry paths and stationary casters, plus sampled mixed Lux/Ezreal placements. `node --test tests/*.test.cjs`: 293/293 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke started Expert endless Dodge and issued a move order; mixed-caster spacing was tested in simulation, not visually isolated during a live encounter.
- Next: sustained human Expert playtests and visual review of mixed/rare encounters, then the planned Cassiopeia R turn-away encounter. The Gauntlet and full game remain unfinished.


## Initial Cassiopeia R encounter (31 October 2026)

- Added an isolated Expert endless Cassiopeia R-pattern encounter. Its first attempt is scheduled at approximately 60–90 s, subsequent attempts 150–240 s apart, subject to visibility, existing-threat isolation, reaction checks and the rare-event guard. The source is visible before its 0.5 s cast; a generated original serpent sprite and procedural fallback are used. The 850-unit range, 80° cone and rank-one 125 magic damage follow the community reference linked in `docs/DODGE_GAUNTLET_RHYTHM.md`, but centre-based collision, facing, arena scale and scheduling are training approximations.
- In the cone, facing toward the caster is recorded separately from turning away; both take damage. Leaving the cone counts as an avoidance. As requested, this Dodge implementation applies neither stun nor slow. The result breakdown reports turn-away/facing/outside outcomes separately from phase hits. Casts defer when the player cannot make a sampled away-facing turn. The facing used at impact is the current fixed-step facing, not a verified Riot server rule. Dodge records use `director_v61.endless`.
- `node --test tests/*.test.cjs`: 303/303 pass, including turn, face, outside cone, motion, Flash, pause, deferral, result accounting, long-session scheduling and asset fallback; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser: a temporary local fixture advanced the first schedule to 0.1 s, verified one Cassiopeia cast and facing outcome in the result. A separate fixture prolonged the setup to 4 s and suppressed regular casts to visually inspect the new sprite; normal cadence and a human reaction playtest remain unverified. Fixture changes were not shipped.
- Next: human Expert playtest of cast readability and reaction fairness; verify exact cone/facing boundaries and live spell timing, and tune frequency/visual animation. Complete the rest of the Gauntlet, then continue faithful CS waves and turrets. The Gauntlet and full game remain unfinished.

## Cassiopeia R release feedback (31 October 2026)

- Added a brief green cone-shaped spell effect at Cassiopeia R impact. It uses the existing cast direction and approximate range/angle, appears only on release, and does not reveal the targeting cone during the windup. Gameplay collision and scoring are unchanged.
- Added a render regression confirming no cone effect during the cast and an effect on release. `node --test tests/*.test.cjs`: 304/304 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. A browser visual check of this specific new effect could not be performed because the Mac was locked; the earlier Cassiopeia sprite and result screen were checked in a separate accelerated local fixture.
- Next: visually review the release effect and human-test the cast cue, facing reaction and readability at normal cadence. Verify cone/facing geometry against the live game and continue the rest of the Gauntlet. The Gauntlet and full game remain unfinished.

## Cassiopeia cast animation (31 October 2026)

- The caster now leans and its eye glow grows over the 0.5 s cast, giving a progressively visible source cue without exposing a targeting cone. The same lean applies to the procedural fallback. This is an original readability approximation; impact geometry, damage and scoring are unchanged.
- Added a render regression for the progressive cue and absence of a pre-impact cone. `node --test tests/*.test.cjs`: 305/305 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke: reloaded the current build and started Expert endless Dodge; the rare Cassiopeia animation and release were not isolated visually in this run.
- Next: sustained human Expert playtests at normal cadence, including the Cassiopeia cue and release, facing reaction, spell mix and fairness. Verify Cassiopeia geometry against live play and continue Gauntlet and CS work. The game remains unfinished.

## Cassiopeia range check at commitment (31 October 2026)

- Cassiopeia now defers her R if Ahri has already left its approximate 850-unit range during the visible setup. Previously an out-of-range cast could be recorded as a successful escape even though it was never a threat. A cast begun at the range boundary can still be escaped and credited normally. This changes the training director and record version to `director_v62.endless`; it is not a claim about live enemy AI.
- Added regression tests for out-of-range deferral and an actual subsequent escape from the range boundary. `node --test tests/*.test.cjs`: 307/307 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke started Expert endless Dodge; the rare range edge was exercised in simulation rather than visually.
- Next: sustained human Expert playtests of cast visibility, facing, rhythm and solvability; verify Cassiopeia geometry against live play, then continue the unfinished Gauntlet and CS work.

## Cassiopeia result explanation (31 October 2026)

- After a Cassiopeia cast, the existing Dodge breakdown now explains that turning away avoids the stun in League but still takes damage inside the cone, and explicitly says this drill applies neither stun nor slow. No in-game visual overlay or gameplay change was added. The explanation is omitted when no Cassiopeia cast occurred.
- Added a result-screen regression for both cases. `node --test tests/*.test.cjs`: 308/308 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. The text was verified in the test DOM; a separate browser review of the result screen remains useful.
- Next: human Expert playtests of cast visibility, facing, rhythm and solvability; verify Cassiopeia geometry against live play, then continue the unfinished Gauntlet and CS work.

## Vel'Koz split result accounting (31 October 2026)

- The two Q split bolts now produce a single shared split-phase outcome in the detailed results. A first missed branch no longer records an avoidance before the other can hit; two misses record one avoidance or harmless outcome, and two live branches count as one unresolved opportunity. Main-bolt and split phases remain distinct. Damage, collision and the existing main dodge counter are unchanged.
- Extended regressions for two misses, a later sibling hit, and two live unresolved branches. `node --test tests/*.test.cjs`: 309/309 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke started Expert endless Dodge; split results were exercised in simulation, not in a sustained browser playtest.
- Next: sustained human Expert playtests, including split readability, overlap fairness and rare encounters. The Gauntlet and broader game remain unfinished.

## Pause/resume frame timing (31 October 2026)

- Reset the fixed-step frame clock and accumulator when pausing, resuming or starting a drill. If the browser suspends animation frames during a pause, the first frame after resuming no longer advances up to 0.25 seconds of gameplay without a reaction opportunity. This applies to all modes; it does not change spell timing during uninterrupted play.
- Added regressions for a long gap with no animation frames during pause and for starting a new drill after stale frame time. `node --test tests/*.test.cjs`: 311/311 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke started Expert Dodge, paused and resumed; the long suspended-frame case was tested in simulation. A screenshot also confirmed the arena renders; this was not a sustained human playtest.
- Next: sustained human Expert sessions for threat readability and fairness, including Vel'Koz and rare encounters, followed by the remaining Gauntlet and CS work.

## Dodge caster windups (31 October 2026)

- Visible Dodge visitors now progressively enter their cast pose over the spell's existing cast time; the original Blitz silhouette also leans. This is an original animation approximation meant to make the source easier to read, without an aim-line guide or a change to cast timing, hitboxes or damage. Non-visitor poses are unchanged.
- Added a render regression for Ezreal and Blitz pose progression and absence of a projected aim line. `node --test tests/*.test.cjs`: 312/312 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke started Expert Dodge and rendered the arena; the short windup's visibility still needs human evaluation in motion.
- Next: sustained human Expert sessions for windup readability, overlap fairness and rare encounters; continue the unfinished Gauntlet and CS work.

## Ahri Q return in the Dodge safety forecast (31 October 2026)

- The director now checks a candidate walking response against both the outgoing and returning enemy Ahri Q, together with other eligible directed missiles, before committing the cast. The return forecast uses the visitor's current position as the anchor, consistent with its stationary orb-flight state; a later Charm or other player action can change that anchor, so this remains a sampled training forecast, not a complete fairness guarantee. This can defer more casts and changes Dodge records to `director_v63.endless`.
- Added a case where the outbound path is safe but the return crosses the player, plus actual fixed-step playback of accepted walking responses from several angles through both phases. `node --test tests/*.test.cjs`: 314/314 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser verification of this change was unavailable because the Mac was locked; previous Expert smoke tests do not verify this new forecast.
- Next: browser and sustained human Expert playtests to evaluate Ahri Q frequency, return readability and overlap fairness; validate other rare encounters and finish the Gauntlet before broader CS work.

## Expert cast mix and Ahri overlap verification (31 October 2026)

- Extended the existing three-seed, twelve-minute Expert simulation to record cast mix and resolved phase outcomes and to verify every sampled run includes all five regular visible champions. With repeated square movement, periodic W and artificial high HP, the runs produced 20–34 casts/minute; Ahri Q appeared 33–36 times per run and Ezreal Q 132–143 times. Resolved phase results were 57–66 avoided, 281–297 hit and 33–52 harmless per run. These are automated sample results, not human accuracy, proof of fairness, or counts of unique casts (Ahri and Vel'Koz have multiple phases).
- Added a fixed-step witness test that executes an accepted walking response against both phases of Ahri Q and an overlapping Ezreal projectile, and verifies a reaction-limited overlap is rejected. `node --test tests/*.test.cjs`: 315/315 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser playtesting remained unavailable because the Mac was locked.
- Next: sustained human Expert playtests for readability and real performance, especially Ahri return overlaps and rare encounters. The Gauntlet and full game remain unfinished.

## Rare direct Malphite R with Flash counterplay (31 October 2026)

- Expert Malphite R can occasionally aim at the player's current position instead of always landing to one side. This training-director choice is attempted on 30% of eligible aim decisions only when Flash is ready; it requires a sampled walkable Flash landing and subsequent walking endpoint with a 25-canvas-unit safety margin after a 200 ms-or-longer reaction allowance. The rare event is isolated from other directed threats. If the direct check fails or Flash is on cooldown, the existing walkable side-aim policy remains. This is an authored challenge and sampled approximation, not a claim about live Malphite AI or a guarantee against later player choices. Dodge records use `director_v64.endless`.
- Tests execute the Flash/walk witness in the fixed-step simulation, including a 100 ms gap before the second movement input, existing movement and W decay; a separate test verifies walking counterplay when Flash is unavailable. `node --test tests/*.test.cjs`: 318/318 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser and human playtesting were unavailable because the Mac was locked; visual readability, reaction fairness and actual encounter frequency still require review before considering this tuned.
- Next: browser and sustained human Expert playtests, particularly direct Malphite R/Flash, other rare events and overlap readability; continue the unfinished Gauntlet before broader CS work.

## Direct Malphite results and broader witness tests (31 October 2026)

- Dodge results now show the number of direct Malphite casts and how many had Flash used during the cast. This records Flash use, not whether Flash caused a dodge; ordinary hit/avoidance outcomes remain separate. No new in-game indicators or timing changes were added.
- Extended Flash witness playback across sampled arena positions, four existing movement directions, W on/off and a 100 ms gap after Flash before the next move. Three 12-minute automated high-HP runs scheduled 2–3 Malphite casts each, including one direct cast across the three runs; this small sample is not a probability estimate or human fairness evidence. `node --test tests/*.test.cjs`: 320/320 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser testing remained unavailable because the Mac was locked.
- Next: sustained browser/human Expert playtests of the direct cast, reaction readability and overlap fairness, then finish the rest of the Gauntlet and continue CS work.

## Harder Expert rhythm, informed by live reference (31 October 2026)

- The user reported Expert was too easy and requested a combination of [Skill + Dodge](https://loldodgegame.com/skillshot/) and [Dodge V2 Hard](https://loldodgegame.com/dodge/). Both modes were opened and started in the browser. The short observations confirm an offensive-and-dodge variant and a harsh survival variant; the runs ended quickly, so they do not establish exact projectile timing, difficulty curves or a complete comparison. No reference assets were imported.
- Expert regular opportunity interval is now 1.65 s instead of 2.2 s. Paired Ezreal and compatible follow-up opportunities may start after 8 s instead of 45 s, with higher Expert-only probabilities; Standard and Foundation retain their existing policy. Existing active-threat caps, escape sampling and recovery windows remain. Q/E and the other Ahri abilities remain available in the same endless Dodge mode. Records use `director_v65.endless`.
- Three 12-minute automated runs with repeated movement, W and artificial HP produced 28–44 casts/minute (previously roughly 20–34 in the last sample). These are total casts, including rare phases, not human performance or proof of fairness. Added early-pair and attack-then-dodge regressions. Browser smoke started Expert, issued a move and cast Q; the new intensity was not sustained-playtested by a person. `node --test tests/*.test.cjs`: 325/325 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass.
- Also fixed result accounting for enemy Ahri Q: a live outbound orb now reports its pending return as unresolved, including after a lethal outbound hit; a return already underway is not counted twice. Three targeted regressions cover those cases.
- Next: play both reference modes for longer and conduct sustained human Expert sessions to tune difficulty, readability and overlap fairness; then continue remaining Gauntlet and CS work.

## Skillshot feedback within Dodge (31 October 2026)

- The existing Dodge results now report Ahri Q and E released casts that hit at least one ordinary Dodge visitor, along with casts still in flight. One Q counts once even if it pierces multiple enemies or hits on both legs. Rare encounters represented as hazards rather than visitors are not targets of this metric. No points, damage, collision or other modes were changed; the user can still attack and dodge in the same endless drill.
- Added regressions for a Q hitting both ways, a separate miss, a Charm hit and an unresolved in-flight E. `node --test tests/*.test.cjs`: 328/328 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke started Expert, cast Q, allowed the player to die and verified the expanded results displayed Q 0/1. This was an unattended smoke test, not a human performance assessment.
- Reopened Skill + Dodge Hard for additional observation, but the brief run ended before a sustained comparison was possible; the earlier Dodge V2 observation also remains brief. Next: longer human comparison and Expert playtests of combat incentives, skillshot readability and overlap fairness, then continue the remaining Gauntlet and CS work.

## Offensive skillshot points in Dodge (31 October 2026)

- A Q cast that hits one or more Dodge visitors now earns 20 points and an E cast earns 30, once per cast. These are training score weights, not LoL mechanics. The existing breakdown states the bonus and weights; attacks, damage, hitboxes and the separate best-survival measurement are unchanged. Rare hazard-only champions cannot be hit for this bonus. Skill-scored local bests use a `.skill_v1` suffix so previous scores remain stored; the existing survival key is retained.
- Extended actual Q/E hit tests to check points and added a record test proving old score isolation and survival preservation. `node --test tests/*.test.cjs`: 329/329 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser testing of this score update was unavailable because the Mac was locked; the prior browser test verified the hit breakdown before points were added.
- Next: browser/human Expert playtests to determine whether the offensive incentive feels right without distracting from dodge quality; review rare encounters and finish the Gauntlet before broader CS work.

## Skill bonus visibility and browser verification (31 October 2026)

- The main Dodge result now states how many points came from skillshots when the bonus is nonzero. The detailed breakdown still explains the Q/E weights. Added an end-to-end simulation regression showing a piercing Q that hits two visitors earns only one bonus.
- `node --test tests/*.test.cjs`: 330/330 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser: started Expert, aimed and cast Q, and verified the resulting run displayed `139 points (20 from skillshots)` and a separate best survival. This was a short smoke run, not a sustained evaluation of balance or fairness.
- Next: sustained human Expert sessions to tune density, offensive incentives, rare events and overlap readability; compare longer Skill + Dodge and Dodge V2 Hard reference play, then continue the remaining Gauntlet and CS work.

## Ahri skill release timing (31 October 2026)

- Ahri's Q and E projectiles now begin moving only for the portion of a simulation step after their cast actually finishes. Target collision is evaluated against the target's movement over that same active interval, preventing a hit on a target that left before release. This uses the existing 120 Hz simulation and is a timing fix, not a claim of exact live-server behavior. Skill-scored Dodge bests now use `.skill_v2`; prior scores remain stored and the separate survival record is retained.
- Added tests for Q/E travel after a late release, a target leaving before release, and a target entering after release. An eight-seed idle test also verifies sampled Expert survival remains shorter than Standard: 11.65–16.09 s versus 23.12–28.44 s. Idle survival is not human performance or proof of fairness. `node --test tests/*.test.cjs`: 334/334 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser smoke started Expert and fired Q; the result showed the skill bonus. Precise sub-step timing was tested in simulation.
- Next: sustained human Expert sessions for difficulty, skill/dodge tradeoffs, rare encounters and overlap readability; continue the unfinished Gauntlet and CS work.

## Movement locks and within-step impacts (31 October 2026)

- A queued move now begins only after an existing cast, root or attack windup finishes within the fixed simulation step. Instant area impacts and hostile projectile sweeps sample the resulting piecewise movement, including a short move that ends before the step does. Cassiopeia checks the facing at impact before a queued turn. A queued ordinary move after a dash completes starts on the next 120 Hz step rather than receiving the whole dash-ending step a second time. This is an engine approximation, not verified Riot tick behavior.
- Added regressions for cast/root expiry, timed area and projectile contacts, short moves and Cassiopeia facing. `node --test tests/*.test.cjs`: 339/339 pass; after updating the CS record suffix, 15 targeted CS/last-hit tests also passed. `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser playtesting was unavailable because the Mac was locked. Dodge records use `director_v66.endless` and Ahri CS records use `cs_ahri_v14`; older keys remain stored.
- Next: browser and sustained human Expert playtests, especially movement feel, attacks while dodging and rare encounters. Continue the unfinished Gauntlet and CS work.

## Orianna R impact feedback (31 October 2026)

- Added a short, fading shockwave effect at Orianna R impact, centered on the ball. It appears only when the spell resolves, so it does not reveal a pre-cast target circle; collision, damage and no-CC Dodge policy are unchanged. This is original placeholder VFX rather than the live game's art, and its fading edge is not an exact hitbox overlay.
- Added a render regression checking the effect is absent before impact and appears on release. `node --test tests/*.test.cjs`: 341/341 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser visual review was unavailable because the Mac was locked.
- Next: visually review the impact effect and conduct sustained human Expert playtests of readability, timing, overlaps and rare encounters; continue the unfinished Gauntlet and CS work.

## Rare area threat crossings (31 October 2026)

- Orianna R and Malphite R now evaluate whether the player's actual piecewise path touches their area during each simulation step, instead of checking only one position per step. This preserves threat qualification for narrow grazing crossings. The final hit still checks the position at impact; movement after impact cannot turn a harmless cast into a dodge. This remains a geometric threat proxy rather than a measured human reaction. Dodge records use `director_v67.endless`.
- Added fixed-step grazing tests at normal Ahri speed for both ultimates and separate tests for crossings after impact. `node --test tests/*.test.cjs`: 343/343 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser verification was unavailable because the Mac was locked; these exact edge cases were tested in simulation.
- Next: browser and sustained human Expert sessions on rare-event readability, density and fair counterplay; continue the remaining Gauntlet and CS work.

## Original stone caster artwork (31 October 2026)

- Replaced the placeholder polygon for the Malphite-pattern encounter with original generated stone-golem art at `assets/stone-caster.png`, using a bounded 84×90 canvas draw anchored at the source. The polygon remains a fallback if the image is missing or fails to load. The art is presentation only: spell area, champion movement, damage and safety checks are unchanged. The PNG has transparency and is approximately 2 MB; visual size and load cost still need browser evaluation.
- Generated with the built-in image tool using the prompt: “Use case: stylized-concept. Asset type: single game character sprite for a top-down fantasy MOBA browser game. Create an original imposing stone golem enemy, broad angular gray-brown rock armor, massive shoulders, small glowing icy-blue eyes, stocky legs and heavy fists, seen from an elevated three-quarter perspective. Full body centered, feet visible, reads clearly when displayed 80 pixels tall, polished painterly game-art style, transparent background. No text, no UI, no shadows outside the character, no ground, no props, no image border.”
- Added tests for bounded rendering and both unloaded/missing-image fallback. `node --test tests/*.test.cjs`: 344/344 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser visual inspection was unavailable because the Mac was locked.
- Next: visually review source scale, anchoring and readability during Malphite R in browser, then sustained Expert playtests and remaining Gauntlet and CS work.

## Malphite R landing feedback (31 October 2026)

- Added a brief fading dust effect at the Malphite-pattern R landing, using the existing impact center. It appears only on impact and does not disclose a prospective landing indicator. Collision, damage and the no-knockup Dodge policy are unchanged. The effect is original placeholder art, not an exact hitbox boundary.
- Added a render regression confirming the effect is absent during the dash and appears at impact. `node --test tests/*.test.cjs`: 345/345 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. The Mac was locked, so this effect and the stone sprite still require visual review in a browser.
- Next: visually review both Malphite assets and timing, then sustained human Expert sessions for intensity, reactions and overlap fairness; continue the unfinished Gauntlet and CS work.

## Ezreal pressure during an existing Ahri orb (31 October 2026)

- The director may now schedule an Ezreal Q while an enemy Ahri Q is already outbound or returning. It forecasts the existing orb's remaining phase(s) and the new shot along the same sampled walking response. If the orb's caster is charmed/moving, its state is unknown, or a shared response cannot be found, the overlap is deferred. Other companion spells remain unsupported during the orb; an ordinary random selection may fall back to Ezreal. Recovery windows and active-threat caps remain in force. Future player actions can still alter the orb's anchor, so this is a sampled policy rather than a full fairness guarantee. Dodge records use `director_v68.endless`.
- Tests exercise actual accepted walking witnesses against outbound and returning orbs, reject an imminent unavoidable hit and a moving caster, and verify a seeded Expert session actually commits an Ezreal cast while an orb remains active. `node --test tests/*.test.cjs`: 349/349 pass; the strengthened natural-commit test also passes separately; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Three automated 12-minute high-HP runs produced 30–42 casts/minute; these are not human fairness results. Browser playtesting was unavailable because the Mac was locked.
- Next: sustained browser/human Expert playtesting of this overlap and general intensity, plus visual review of rare events; continue the unfinished Gauntlet and CS work.

## Ahri-orb overlap pacing and moving witnesses (31 October 2026)

- A non-forced Ezreal visitor joining an active Ahri orb now enters over 35 canvas units instead of 65, so the orb is more likely still active when the visitor casts. The caster still enters visibly, performs its full cast and rechecks the shared escape at commitment. Other entries and all spell physics remain unchanged. This changes encounter scheduling; records use `director_v69.endless`.
- Added fixed-step shared-escape tests with existing movement and W decay, plus a visible-entry regression. In three 12-minute automated runs with artificial high HP and repeated movement, Ezreal released 2, 5 and 4 casts while an Ahri orb remained active, versus 2, 0 and 1 in the previous sample. RNG sequences also changed; these small samples do not establish human fairness or an exact frequency. `node --test tests/*.test.cjs`: 351/351 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser playtesting was unavailable because the Mac was locked.
- Next: sustained human Expert playtests to check whether the shorter entry is readable and the overlapping orb/shot is fair; continue rare-event and broader Gauntlet work, then CS.

## Player Ahri Q turn timing (31 October 2026)

- The player's Q now begins its return during the remaining portion of the simulation step in which the outgoing leg expires, instead of waiting for the next step. Return hits use target motion only during that active interval; true damage and the once-per-leg rules remain. The return direction still uses the existing fixed-step approximation to the player's position. Dodge skill-scored bests use `.skill_v3`, preserving prior stored records separately.
- Added regressions for a return hit in the turn step and for a target entering only after the return ends. `node --test tests/*.test.cjs`: 353/353 pass; `node --check game.js`, generated Ahri data check and `git diff --check` pass. Browser playtesting was unavailable because the Mac was locked.
- Next: browser/human Expert playtests of offensive skillshots, overlap pacing and rare encounters; continue the unfinished Gauntlet and CS work.


## Expert Orianna and Lux readability (2 November 2026)

- Keep Mindgame Aim v1 and the existing difficulty as the player-approved baseline. Expert Orianna Q now travels to the position captured at spawn, remains there instead of attaching to Ahri, and starts R 0.10 s after arrival. The R retains its 0.5 s visible charge and Flash escape check. Players can evade by moving during Q, so this is a reaction drill, not a guaranteed Flash requirement. Timing and spawn positioning are trainer approximations.
- Lux R remains centered on Ahri's position when spawned and its aim stays fixed; its charge is shortened from 1.0 s to 0.9 s on request, plus the existing 0.4 s source tell. This is intentionally faster than the documented game cast.
- Reference: https://wiki.leagueoflegends.com/en-us/Orianna describes Q remaining at its destination, buffered R, and a 0.5 s R cast; https://www.leagueoflegends.com/en-au/news/game-updates/patch-12-7-notes/ discusses Riot's Orianna VFX clarity improvements.
- Targeted simulation: 21 Orianna, Lux, Malphite and prediction tests pass; local browser started Expert Dodge. The actual rare Orianna encounter still needs visual human playtesting and multi-minute fairness review.
