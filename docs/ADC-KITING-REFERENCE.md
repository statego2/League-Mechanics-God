# Kiting reference audit — 17 November 2026

## Scope and provenance

Requested reference: [League of Kiting](https://loldodgegame.com/kiting/). Inspected its live menu/gameplay in Chrome and read the publicly served compiled JavaScript referenced by [the embedded game](https://loldodgegame.com/kiting/game). Script: [league of kiting 31.js](https://loldodgegame.com/kiting/loldoge/league%20of%20kiting%2031.js?cachebust=578265283), SHA-256 `6ea374395fe275f9cee76624467d578190a75788cb67de6ae35e12f13c3ea51e`, 2,383,424 decoded characters at inspection. Source downloaded to temporary storage for read-only analysis; no external runtime or art copied into our product.

Chrome visibly showed Start → INF. KITING / KITING → Kiting setup with 2.50 and Ranked → playable arena, generic enemies entering at the perimeter, and a result screen after death. Browser inspection was brief, not a successful measured kiting run. Values below are source-derived, not hand-timed browser measurements or claims about exact real-world frame pacing.

## Reconstructed ordinary Kiting loop

| Mechanic | Public source finding | Meaning for our design |
| --- | --- | --- |
| Base cadence | `oallroom_Create_0` initializes attack speed to 2.5. `oplayer_Step_0` allocates an attack animation counter of 60 / AS and releases after more than 12% of that period has elapsed. | Nominal 0.4 s cycle; about 48 ms theoretical release threshold, quantized by frame order. Preserve the small committed windup, not its frame-counter implementation. |
| Motion versus recovery | Right-click ground cancels the attack animation/attack intent. Released projectile is independent; remaining cooldown is assigned at release. | Move immediately after release while recovery continues. Do not lock movement for the entire cycle or remove committed missiles. |
| Targeting | A press sets attack intent and selects the enemy nearest the cursor; right-clicking a target also attacks. Out-of-range A moves toward the cursor. | Reference is A-at-cursor rather than our A-then-click/nearest-player convention. Retain our familiar controls unless explicitly changed; do not silently remap them. |
| Target durability | `oenemy_Create_0` sets 100 HP; player base auto damage is 20. | Five unbuffed hits in ordinary Kiting. The user explicitly accepts five if the rhythm matches. |
| Pursuit | Player moves 5.5 source units/step; enemy create assigns speed 3 after an earlier global assignment, so **3 is the effective base value**, not AS/1.6. | Enemy/player ratio about .545. Our 145/270=.537 is a close starting ratio without mixing coordinate systems. |
| Pursuit pattern | Enemy seeks the player with a roughly ±30° oscillating heading outside 150 units, then approaches directly nearby. | Generic pursuers feel active. Start with our existing pathing/separation; optional subtle weave later, not a requirement to copy oscillation or obstacles. |
| Projectiles | `o_auto_Create_0` stores the target and damage; step follows that target at 15 units/step; target loss removes projectile. | Keep fast target-bound autos and clear release feedback. Our swept collision remains preferable to copying overlap-only collision. |
| Spawn origin | Eight random cases select off-screen top/bottom/left/right bands, some duplicated/unequal. Bottom covers the whole width. | **Not four-corner-only.** User's corner-only instruction takes precedence. Keep perimeter arrival, implement our own four-corner selection. |
| Spawn cadence | Initial timer 375 / AS steps; at AS=2.5 this is 150 nominal steps. Timer maximum decreases .001 per step while above 16. | At the source's 60-step timing convention, initial interval is 2.5 s, accelerating slowly. The variable named `max_enemy` is a timer floor here, not evidence of a 16-unit population cap. Do not copy that interpretation. |
| Contact | `oenemy_Step_2` transitions to results on collision with player. | Reference is lethal contact. Our concept retains heavy HP damage and grace rather than instant death. |
| Infinite variant | When `gmlkiting` is 1, enemies restore HP to 100 each step and normal spawning is stopped; it tracks kiting metrics. | Do not confuse the immortal training variant with ordinary killable Kiting. We keep continuous survival with killable replacements. |
| Optional modifications | Non-ranked AS arrows step .1 between approximately .5 and 10; pickups can change movement, damage or double AS temporarily. | Not needed for our concept. Tristana Q supplies the attack-speed boost; no new pickup/menu system required. |

Source anchors for reproduction: `gml_Object_oallroom_Create_0`, `gml_Object_oplayer_Create_0`, `gml_Object_oplayer_Step_0`, `gml_Object_oenemy_Create_0`, `gml_Object_oenemy_Step_0`, `gml_Object_oenemy_Step_2`, `gml_Object_o_auto_Create_0`, `gml_Object_o_auto_Step_0`, and AS-arrow handlers. The code uses 60 in its timing calculations; second conversions are nominal, not a browser-performance benchmark.

## Transfer decisions

Adopt a short release commitment, fast cadence, slower relative pursuers, target-bound missiles and perimeter arrival. Preserve our full Tristana kit, independent surrounding skills, heavy contact HP loss, fixed-step simulation, controls and Dodge isolation. Do not import source, art, ranking, pickups, instant-contact death or immortal enemies.

Latest owner clarification: **five hits is acceptable if the rhythm feels similar**. Initial design uses 140 HP / 28 auto damage = 5 unbuffed hits, 2.5 attacks/s, .06 s windup and 145 enemy speed. These are our proposed values, not copied live LoL stats or implemented changes. Five releases take .06 + 4×.4 = 1.66 s from ready first attack, versus the current four-release .18 + 3×.72 = 2.34 s, excluding travel and movement. This is why more hits need not feel slower. Validate actual release intervals and human feel before closing.
