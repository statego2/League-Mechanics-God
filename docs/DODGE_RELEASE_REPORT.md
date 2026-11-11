# Dodge v1.0 release candidate verification

Status: **shipped**. Build `0030a3a91f5a`. Browser access succeeded through the Chrome extension after restarting the development server with approval. Earlier reports of a continuing browser permission blocker were inaccurate; the server had stopped.

## Cadence

The existing fixed 20-seed, 120 Hz fixture measured successful Syndra visits per minute after warmup:

| Profile | Before | Candidate | Ratio |
| --- | ---: | ---: | ---: |
| Stationary | 5.075 | 3.675 | 0.724 |
| Scripted moving | 4.950 | 3.775 | 0.763 |

Both are in the 0.70–0.80 acceptance range. Only the Syndra post-visit gap changed; per-seed measurements, Q/E, presence and other casts are in `dodge-release-audit-2026-11-11/candidate-visits.json`. The new v93 Expert record key preserves prior records.

## Automated evidence

- Syntax and whitespace checks passed. The targeted Syndra, awareness, build and record suite passed 86 tests. Home/menu state checks passed 2 tests.
- The 0.15-second reaction fixture accepted 79 regular and 80 edge casts. Its verified escape witness received zero Q or E hits in each corpus; full output is stored in `dodge-release-audit-2026-11-11/`.
- The normal-HP scripted survival fixture is stored there as well. It is a simulation with no abilities or Flash, not a human difficulty assessment.
- Full final suite: **551/551 passed** (`node --test --test-concurrency=1 tests/*.test.cjs`), including the benchmark output invariant added after the original candidate run.

## Browser verification — 11 November 2026

Chrome: inspected home at 1440×900, 1024×768 and 800×650; visible focus, Enter activation, Space checkbox, settings, scroll, prototypes and result breakdown. Normal-HP Expert retries totalled over three minutes, with movement, QWER/F, Syndra Q/E and stun/recovery, other champions, pause/resume and restart. Foundation/Standard, Kite and CS started with their correct HUD and inputs. Sound toggled back off. Awareness OFF removed the minimap; ON displayed it and missed sightings appeared in results.

A separate temporary QA page added only a visible force-sighting button to exercise rare awareness interactions promptly. G click, Alt click and G drag-up were exercised, with the visible +25 / +20 HP reward. This is controlled-fixture evidence, not a claim about natural appearance timing. The fixture was deleted and is not deployed. Automatic tests cover wrong, missed and unresolved sightings and scoring. Production images were complete with nonzero dimensions; console warning/error checks were empty. No repeated visible freeze was observed. This is functional QA, not a human balance assessment or a guarantee for every reaction scenario. Safari was not exercised in this Chrome session.

Browser testing exposed stale awareness results in pause after retry. Reset now clears them; a regression test and the complete 551-test suite pass. Home, pause, results and awareness screenshots are in the evidence directory. Screenshots before the fix bear the earlier build ID and remain historical evidence.

## Publication

Published at https://statego2.github.io/League-Mechanics-God/ from `codex/controls-and-dodge`, path `/`.

Gameplay release commit: `7c601c7edc8a8d0cb69516524a190e46da72115f`; executing build `0030a3a91f5a`. GitHub runs `43053526492` (Gameplay regression checks) and `43053521842` (Pages build and deployment) completed successfully on that exact SHA. The Pages API reported it built. A fresh Chrome tab loaded the new home and real executing build label; Play, awareness ON, movement, W, Flash and pause worked. Images were loaded and console warning/error checks returned empty. `live-home.jpg` and `live-playing.jpg` record the deployed build. This report and live screenshots are a subsequent documentation-only commit; they do not change runtime bytes.
