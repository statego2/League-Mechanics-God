# Dodge v1.0 release candidate verification

Status: **not shipped**. Build `4a7db6fefed9` is local; the hosted page has not been updated with this candidate. The browser and deployment gates in `DODGE_SHIP_PLAN.md` remain outstanding. Do not infer playable visual verification from automated simulation.

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
- Full final suite: **549/549 passed** (`node --test --test-concurrency=1 tests/*.test.cjs`).

## Required before publishing

The prior browser policy denied access during local visual verification and explicitly forbade bypass through alternative browser surfaces. Home, pause, results, focus, real-time gameplay, assets and awareness require a permitted real-browser run and screenshots. Then follow the ship plan's complete pre-push gates, push the verified branch, and verify the exact executing build and gameplay on GitHub Pages. Fetch and the Pages API confirmed `codex/controls-and-dodge` as the `/` source, but this alone does not verify a deployment.
