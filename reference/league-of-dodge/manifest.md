# League of Dodge — archive manifest

Examined 30 October 2026. `loldodge-all-updated.zip`: 72,772,085 bytes, SHA-256 `cfc972b984ea6da0ffe08893d9121efb2fc3d63e2fdada8d319ca8f0db1f9cbd`. Extraction preserved original paths under the ignored `originals/extracted/loldodge-all-updated/`; an untouched copy is in ignored `archives/`. The [complete inventory](ZIP_INVENTORY.md) lists all 174 files, byte sizes and SHA-256 hashes. Expanded size: 124,514,154 bytes. It includes 85 PNG, 28 JS, 24 HTML, 16 WOFF2, 7 JPG, 7 ICO, 4 CSS, 2 SVG and 1 TXT. There are no editable GameMaker project sources in the archive.

## Games and runtime status

| Subtree | Contents and dependencies | Local browser observation |
| --- | --- | --- |
| `dodge` | Compiled GameMaker export, nine texture atlases; ad and local-storage extensions missing | White screen; missing `readFromLocalStorage` and `adRoom`. Not playable as supplied. |
| `skillshot` | GameMaker export, ten atlases; same two extensions missing | Black screen and missing-extension errors. Not playable as supplied. |
| `kiting` | GameMaker export and nine atlases | Menu and gameplay opened. A single enemy, champion, attack-speed selection and Flash are visible. Full run not verified. |
| `farming` | GameMaker export and seven atlases | Menu and gameplay opened. Red and blue waves, melee, ranged and cannon minions, and money/missed counters visible. Full run not verified. |
| `1vs1` | GameMaker export and eleven atlases; seven ad/storage/menu/peer/replay scripts missing | Black screen, `initPeer` undefined. Multiplayer is not operational from these files. |
| `duo` | GameMaker export and seven atlases; five ad/peer/storage scripts missing | Black screen, `getIdFromUrl` undefined. Multiplayer is not operational from these files. |
| `mobabattle` | HTML and icon; referenced JS and splash image absent | Static dependency audit establishes entry cannot load its game script; gameplay not run. |
| `lol-rogue` | Vite bundle, CSS and partial image tree | Start menu and champion selection opened, but image requests failed; complete offline game not established. |
| `lol-guessr` | Partial Next.js pages/assets | Server/root-relative and dynamic dependencies require further validation; no claim of offline playability. |
| Site root | HTML pages, styles, fonts, images and web-service references | Web shell, not a self-contained game engine. External ads/analytics and server functionality are not reproduced locally. |

The compiled GameMaker files contain runtime, object/sprite/room metadata and scripts, rather than editable source projects. Atlases and sprites are original third-party artwork. Kiting and Farming run with an audio-worklet 404 and browser fallback; a successful start does not prove every later screen works.

## Dependency audit and reproduction

`python3 reference/league-of-dodge/tools/audit_local_tree.py` produces ignored `local-audit.md`. This run found **372 resolved references, 18 missing static references, 97 external/inline references and zero root escapes**. The 18 are seven 1v1 extensions, two Dodge extensions, five Duo extensions, two Skillshot extensions and MOBA Battle's script and splash image. This is a static lower bound, not a complete runtime network audit: dynamically constructed paths, services and later screens can reveal additional missing files. Some site pages use server-root URLs and require appropriate local routing.

For a new machine use `python3 reference/league-of-dodge/tools/import_local_refs.py --zip /path/to/loldodge-all-updated.zip`, then run the auditor above and serve the extracted tree over HTTP. The complete private inventory and raw audit remain local. Browser observations above are from the extracted copy; no network services or multiplayer were tested as working.

## Distribution

No redistribution license has been established for the third-party game, exports, textures, fonts or archive. They stay outside Git and production. We publish only our own tools, analysis, file names, sizes and hashes. Gameplay is independently implemented; inventory and observation are not permission to copy art or code.
