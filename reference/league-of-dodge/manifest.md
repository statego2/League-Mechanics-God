# League of Dodging — Reference Manifest

**As of:** 2026-10-30. **Status:** partially verified, missing archive/assets. **Scope:** files directly accessible to this import session, not every file on the user's Mac.

## 1. Confirmed source uploads (private, not republished)

| Material | Original/source path | Available in this session | Bytes | SHA-256 | Public repository |
| --- | --- | --- | ---: | --- | --- |
| GameMaker HTML5 entry | https://loldodgegame.com/dodge/game.html | Yes, uploaded as game.html | 3,483 | 90d0397f5fd4eb6f5a63787e3148a245cbcaa5b560ce5772dcf5a54436503164 | Source link, documentation only |
| Compiled GameMaker runtime + gameplay | https://loldodgegame.com/dodge/loldoge/dodge.js?cachebust=1527014147 | Yes, uploaded as dodge.js | 1,876,359 | c662f81fb9838534bb892ea3f1f9adaac172be53e5cf3c0709126230ab2d3d17 | Source link, documentation only |
| loldodge-all-updated.zip | Previously mentioned/downloaded in an earlier project conversation | **No**; not mounted or found in available Library search | Unknown | Unknown | Not uploaded |
| Other game subarchives / ZIPs | Unconfirmed; potentially inside the missing ZIP | No | Unknown | Unknown | Not uploaded |
| Earlier separate local download script | ~/Downloads/download_loldodge_missing.sh (reported prior error) | No | Unknown | Unknown | Superseded by new importer |

The JS hash is computed from the exact uploaded bytes, **not** a fresh server fetch. If a newer website build exists, the checksums may differ. The lack of a public copy under this repository is intentional.

## 2. Game identified

- **Game:** League of Dodging (browser game at /dodge/).
- **Engine:** GameMaker HTML5 export, not Unity.
- **Loader:** /dodge/game.html creates a 1920×1080 canvas with id canvas, then loads loldoge/dodge.js?cachebust=1527014147 and invokes GameMaker_Init on load.
- **Compiled script:** single sizable generated JavaScript file with obfuscated symbols, game object metadata, engine helpers and sprite atlas names. Not an editable GameMaker source project.
- **Other games:** multiple minigames were discussed, but the identities, archive contents and number of games **cannot be confirmed until loldodge-all-updated.zip is available**.

## 3. Expected normalized local tree (not the GitHub source tree)

    reference/league-of-dodge/
      originals/
        dodge/
          game.html                         CONFIRMED uploaded; installer can normalize here
          loldoge/
            dodge.js                        CONFIRMED uploaded; installer can normalize here
            dodge_texture_0.png             REFERENCED, not available
            dodge_texture_1.png             REFERENCED, not available
            dodge_texture_2.png             REFERENCED, not available
            dodge_texture_3.png             REFERENCED, not available
            dodge_texture_4.png             REFERENCED, not available
            dodge_texture_5.png             REFERENCED, not available
            dodge_texture_6.png             REFERENCED, not available
            dodge_texture_7.png             REFERENCED, not available
            dodge_texture_8.png             REFERENCED, not available
            tph_adManager.js                REFERENCED, not available
            uph_localstorage.js             REFERENCED, not available
        extracted/
          loldodge-all-updated/             NOT EXTRACTED here; ZIP unavailable
      archives/
        loldodge-all-updated.zip            NOT ACCESSIBLE here
      tools/import_local_refs.py            COMMITTED: our own importer
      manifest.md                           COMMITTED: this file
      GAMEPLAY_ANALYSIS.md                  COMMITTED: our analysis

**Path rationale:** The relative HTML script src is loldoge/dodge.js; the atlas filenames and two extension script filenames are present in the GameMaker JS asset metadata. The texture and extension lookup prefix is inferred from the JS's location; actual browser network requests must be checked before claiming every URL is correct.

## 4. Runtime dependency inventory

| File or service | Evidence | State | Expected local location / investigation |
| --- | --- | --- | --- |
| game.html | Uploaded HTML lines 93–111 | Available | originals/dodge/game.html |
| loldoge/dodge.js | HTML script src; uploaded JS | Available | originals/dodge/loldoge/dodge.js |
| dodge_texture_0.png ... dodge_texture_8.png | JS GameMaker texture filename array _B8 | Not available | originals/dodge/loldoge/ |
| tph_adManager.js | JS GameMaker extension metadata | Not available | originals/dodge/loldoge/ |
| uph_localstorage.js | JS GameMaker extension metadata | Not available | originals/dodge/loldoge/ |
| Generic GameMaker internal fallbacks, libraries and worklet strings | Contained in compiled runtime | **Not automatically independently required** | Inspect actual network trace before downloading |
| pauledevelopment.de online-score endpoints | Strings in compiled JS | External/untested | Optional network/leaderboard integrations; do not send fake requests |
| loldodgegame.com highscore/download/choose_game | URLs in JS | External/untested | Navigation or ancillary services, not local files |

## 5. Missing, failed, unverified

- The named ZIP **was not accessible** to the assistant; no claim of unzip, complete inventory, or path verification for its contents can be made.
- The nine texture atlases and two extension scripts are **not in the uploads**. Their server availability/HTTP status is unverified here.
- The previously reported shell download failed with: line 11: rel: unbound variable. We did not possess the script to patch it; the new standalone Python importer avoids that variable.
- No browser/local offline execution test or network HAR was possible with the incomplete asset set. Game launch, visual correctness, offline behavior and ad/score-related behavior are **not verified**.
- The JS mentions a fallback texture; that string alone does **not** establish it is an additional deployable file.
- Copyright/license to redistribute the external game's original files was **not established**; the files are deliberately excluded from git.

## 6. Reproduction / audit procedure

1. Run tools/import_local_refs.py locally on the Mac holding the ZIP and downloads. It copies files without flattening ZIP paths, verifies path safety, preserves archives privately and writes local-inventory.md.
2. Use --download-missing only if local-only texture and extension retrieval is needed. The script validates PNG signatures and records HTTP/download failures.
3. Read local-inventory.md for exact file list, bytes, SHA-256, path status and extraction warnings; **do not commit it if it includes private paths**.
4. Inspect each extracted ZIP root independently to identify other minigames, then update this public manifest with names/counts/neutral metadata, not unlicensed assets.
5. Check the actual /dodge/ Network tab for 404s, missing fonts/sounds/images/scripts and confirm a local server play test. Update status only after observation.
6. Continue implementation in the repository's own index.html/game.js/style.css, not this vendor mirror.

## 7. Preservation policy

The repository's .gitignore protects private originals/, archives/ and local-inventory.md. We commit only our analysis, source links, own import tooling and manifest. We do not make a false assertion that every file has been downloaded, that the game has been successfully cloned, or that externally hosted artwork/code is freely reusable.
