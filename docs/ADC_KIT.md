# ADC Tristana training profile

The [ADC plan](ADC-PLAN.md) uses the reference-inspired fast attack rhythm, five-hit generic targets and four-corner arrivals. Values remain training approximations pending human feel and balance review.

This is a fixed training profile, not a live League simulator. The pinned PC
source is Riot Data Dragon [16.21.1 Tristana](https://ddragon.leagueoflegends.com/cdn/16.21.1/data/en_US/champion/Tristana.json),
archived at `data/tristana-16.21.1.json` (SHA-256 `a5d13395cab89d6207bb2e13e89c018e9078ac005999aa3883886be7e969ca5b`); the [PC champion page](https://www.leagueoflegends.com/en-us/champions/tristana/)
identifies the five abilities. Data Dragon does not expose all interpolated
spell values, cast times or collision details. Any value below that differs
from, or is absent in, that source is a deliberate trainer approximation.
Wild Rift is not the authority for this PC profile.

| Element | Training profile / rule | PC reference or deviation |
| --- | --- | --- |
| Level and resources | Fixed level 1 range profile; all Q/W/E/R granted at rank 1 for the drill, including R before its normal unlock. No XP, items, mana or resource costs. | Data Dragon base attack range 550 game units; the full-kit grant and omitted mana are trainer rules. |
| Draw a Bead | Base 550 game units × 0.5 = 275 canvas units, center-to-center for auto acquisition/chase/release, E/R targeting and A-range indicator. The level-1 passive adds zero range; no level progression is simulated. | Riot's passive increases range with level. Center-to-center conversion is a training simplification, not PC edge-to-edge targeting. |
| Autos | 28 physical damage, 0.40 s period and 0.06 s windup; target-bound missile at 920 canvas units/s. | Training numbers; Data Dragon lists 60 base AD and 0.656 base attack speed, which are not directly used for this mode. |
| Q Rapid Fire | +50% total attack cadence (0.2667 s period, 0.04 s windup) for 7 s, 20 s cooldown; each committed windup snapshots its own cadence. The Q slot shows the remaining active seconds separately from cooldown. | Cooldown is rank-one PC data; duration and +50% are trainer approximations. Activating Q never resets an existing recovery or an already fired auto. |
| W Rocket Jump | Cursor-directed up to 450 canvas units; speed 650 canvas units/s; landing radius 100, 45 magic damage and 40% slow for 2 s; 22 s cooldown. It crosses terrain only when the landing is valid and is not invulnerable. When wall snapping would extend the jump past its range, the landing moves back along the intended direction to the furthest valid point. | Data Dragon rank-one W is 900 game units and 22 s. Damage, speed, area and exact animation timing are training approximations. The PC tooltip resets on champion takedowns and fully stacked charge detonations on champions; generic ADC targets deliberately qualify as training champions, ambient emitters never do. |
| E Explosive Charge | Hover a valid target within 275 canvas units. Apply a 4 s bomb at zero stacks and order attacks against that target; autos, W landing and R impact each add one stack. At four, detonate once; otherwise detonate at expiry/death. Radius 105 canvas units, 32 + 12 per stack physical damage. An auto kill separately deals 12 magic splash in radius 85. | Rank-one 16 s cooldown is PC data; damage, radius, stack amplitude and instant application are trainer approximations. Riot's PC tooltip identifies the E passive as attack-kill splash, separate from Draw a Bead. |
| R Buster Shot | Hover a valid target within 275 canvas units. A target-bound cannonball travels at 1100 canvas units/s, then deals 60 magic damage and applies 210 canvas-unit terrain-clipped knockback; nearby enemies are displaced in parallel, without secondary damage. 60 s cooldown starts at launch. If the target dies before impact the committed projectile expires. R adds one E stack and doubles an attached charge's radius; a fourth R stack detonates at the end of knockback or on expiry/death. | PC description says magic damage, knockback and doubled charge radius; cooldown, damage, cast time, knockback speed and secondary radius are trainer approximations. Release/impact ordering is documented in code/tests; no exact PC-client parity is claimed. |
| F Flash | Existing ADC cursor escape, 18 s training cooldown. It cannot be used while rooted, hooked or jumping; invalid landing does not consume cooldown. | Trainer policy; no exact PC-client cooldown or invulnerability claim. |

Targets are generic pursuers only. Invalid or out-of-range E/R never spend a
cooldown. Ambient source effects are not targets, do not grant kills and do not
reset W. Health, damage and timers are fixed-step approximations. For E, a
lethal eligible hit first increments its charge; death detonates that charge
once, followed by E's passive only if the killing impact was an auto. Q/W/E/R
remain scoped to ADC and do not alter Ahri or Dodge.

Generic pursuers have 140 HP (five unbuffed autos) and 105 canvas units/s movement speed, with at most two active pursuers. They enter targetable from validated corner zones and deal 40 contact damage with a 0.75 s per-enemy cooldown.

The ADC playtest profile uses 260 canvas units/s walking speed and regenerates 1 HP per simulation second while alive and playing, up to 160 HP. Each run uses a fresh seed; after the opening, seeded busy and quiet phases alternate every 8–12 seconds. Busy phases target two pursuers with 2.3-second replacement and 2.1-second cast intervals; quiet phases target one pursuer with 2.8-second replacement and 2.6-second cast intervals. Existing threats finish naturally and cooldowns carry over. These values await player review.
