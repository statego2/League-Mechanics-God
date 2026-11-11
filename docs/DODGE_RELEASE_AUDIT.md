# Πρόοδος και ετοιμότητα για το τελευταίο Dodge release

**11 Νοεμβρίου 2026.** Τρέχουσα βάση `b37dd9d` / build `2c9a3f00f828`. Αυτό είναι νεότερο audit από το `DODGE_PROJECT_AUDIT.md` της 10/11. Το δεσμευτικό υπόλοιπο εργασίας βρίσκεται στο [DODGE_SHIP_PLAN.md](DODGE_SHIP_PLAN.md).

## Συμπέρασμα

Το προηγούμενο πλάνο έχει υλοποιηθεί σε μεγάλο βαθμό. Υπάρχουν **39 commits μετά το c833be4**, από τα οποία **27 μετά την ολοκληρωμένη βάση Code 2 / 505fb4c**. Δεν πρέπει το επόμενο AI να ξανακάνει ανάκτηση, να εφαρμόσει παλιό patch ή να επανεκκινήσει τη Syndra. Απομένουν δύο σαφείς αλλαγές προϊόντος —μόνο Syndra πιο αραιά και νέο home— και οι τελικοί browser/release έλεγχοι.

Το σχέδιο δεν εξισώνει το passing suite με shipped. Το δημόσιο Pages είναι ακόμη πίσω από τη σημερινή local έκδοση.

## Τι έχει ήδη κλείσει

| Περιοχή προηγούμενου audit | Σημερινή κατάσταση / στοιχεία |
|---|---|
| Ανάκτηση Code 2 | Το 505fb4c είναι στην ιστορία της ενεργής branch. Sprite/VFX και cast breakdown ενσωματωμένα |
| Caster/source drift και sphere range | `abc11de`, fixed source κατά combo και έλεγχος Q/E range μέσα στο `spawnSyndra` |
| Αποχώρηση μέσα από walls | `e1d0364`, walk-out με clip/bounds και σχετικό regression |
| Sphere stun/push και locks | `d52a643`, sphere-only CC· μεταγενέστερο HUD/input coverage και πραγματικό R interruption στα 30/60/120 FPS |
| Σύντομες ποικίλες επισκέψεις | `6ce41cb`, `2c9a863`: plans, διάρκεια, sequence consistency, death/recovery scheduling |
| Aim από παρατηρημένη κίνηση | `80b850e` και `85e81bd`: περιορισμένο observed history, clear σε displacement, locked aim και μικρά reads γύρω από E cue |
| Αναγνωρίσιμη πρώτη εμφάνιση | `85e81bd`: 0.65 s visible entry πριν από Q, regression και για edges |
| Solo Q / close-range QE | `d0b09ee`, `ffec148`, `3ce4719`, `90a78e6`: range clamping, αφαίρεση τεχνητού minimum, safe fallback, shortening sphere lead όταν επιτρέπεται |
| Scoring | `9d1b2dc` blocked Q, `125bd10` cancelled E unresolved bookkeeping· other casts αφαιρούν Q και released E |
| Records | v92 και διατήρηση παλιών keys· νέο cadence θα χρειαστεί νέο version |
| Forecast κόστος | `b37dd9d`: reuse μόνο μέσα στο ίδιο cast evaluation, cached/uncached regression, benchmark με ίδια director summaries |

Τα παραπάνω επαληθεύτηκαν από source/history/tests. Δεν αποτελούν νέο claim ότι έγινε σήμερα human/browser acceptance. Δεν κυνηγάμε τα απορριφθέντα flank experiments ή το παλιό long-lead aim· το μεταγενέστερο feedback έχει ήδη αλλάξει αυτές τις επιλογές.

## Έλεγχοι αυτής της ανάλυσης

- `node --check game.js` και `node --check world.js`: πέρασαν.
- `node --test --test-concurrency=1 tests/*.test.cjs`: **547/547**, ~79.7 s. [Πλήρες log](dodge-release-audit-2026-11-11/baseline-tests.log).
- Νέο read-only fixture μέτρησης πραγματικών visits, δύο profiles με ίδιο seeded setup: [script](dodge-release-audit-2026-11-11/measure-visits.cjs), [baseline JSON](dodge-release-audit-2026-11-11/baseline-visits.json).
- GitHub API: Pages source branch/path, remote tip και τελευταίο επιτυχές Pages build διαβάστηκαν. Δεν έγινε push, αλλαγή settings ή deployment.
- Εξετάστηκαν πραγματικό HTML, CSS/menu state hooks, controls και benchmark scripts. Δεν έγινε νέο browser render/playtest κατά τη συγγραφή αυτού του πλάνου.
- Καμία αλλαγή στο `game.js`, `index.html`, `style.css` ή gameplay tests από αυτό το planning pass.

## Η βάση για το −25%, μόνο στη Syndra

20 fixed seeds × 30 s warmup + 120 s measured time ανά profile, 120 Hz, μεγάλο HP μόνο για σταθερό measurement window. Το moving profile στέλνει προκαθορισμένες εντολές ανά 1.2 s. Αποθηκεύονται arrivals/per-seed δεδομένα ώστε να μην κρύβεται η μεταβλητότητα.

| Metric | Stationary | Moving |
|---|---:|---:|
| Πραγματικές visits/min | 5.075 | 4.950 |
| Q/min, συμπεριλαμβανομένου του Q των combos | 10.550 | 11.675 |
| Released E/min | 3.825 | 4.400 |
| Casts άλλων champions/min | 17.075 | 20.225 |
| Χρόνος με ορατή Syndra | 61.11% | 60.95% |
| Στόχος visits/min για −25% | 3.806 | 3.713 |

Το `d.syndraStays` αυξάνει σε πραγματική δημιουργία visitor. Είναι σωστότερο metric από `syndraCombo`, που μπορεί να περιλαμβάνει combo που ακυρώνεται πριν εκτοξευτεί το E. Δεν είναι μελέτη human balance. Το target αφορά το σταθερό benchmark και τη συνήθη αίσθηση συχνότητας, όχι εγγύηση ακριβούς ρυθμού σε κάθε human run.

Το gap 2.5–4.5 s είναι μόνο μέρος του πλήρους κύκλου. Προτεινόμενη πρώτη δοκιμή για το επόμενο AI: 6.5–8.5 s, κρατώντας duration/entry/aim/spells αμετάβλητα. **Δεν έχει εφαρμοστεί ή μετρηθεί candidate gap σε αυτό το pass.** Η τελική τιμή επιλέγεται με ratio 0.70–0.80 έναντι της παραπάνω βάσης.

## Κενά που πράγματι απομένουν

1. **Νέο request συχνότητας:** μόνο η Syndra −25% visits. Οι άλλοι champion constants/weights/intervals δεν αλλάζουν. Η φυσική μεταβολή scheduling opportunities καταγράφεται χωριστά.
2. **Home ιεραρχία:** σήμερα τρεις σχεδόν ισότιμες κάρτες και γενικό `ALPHA · v0.5`. Δεν επικοινωνεί ότι το Dodge είναι η έκδοση προς παράδοση. Η σχεδίαση υπάρχει στο `DRILLS_HOME_DESIGN.md`.
3. **Shared overlay:** `showMenu`, `pause`, initial HTML και `menuBtn` μοιράζονται DOM. Η αλλαγή home μπορεί να χαλάσει pause/results αν γίνει μόνο CSS χωρίς state review. Τα mocked DOM tests δεν ελέγχουν πραγματικό layout ούτε όλα τα `data-mode` click bindings.
4. **Browser acceptance:** visual hitboxes/cues, πραγματική απόκριση input, μικρό desktop viewport, awareness και πλήρης home→play→results ροή χρειάζονται το τελικό browser gate. Το Node performance benchmark εξαιρεί render και δεν αποδεικνύει FPS.
5. **Release documentation:** README/Blueprint ακόμα περιγράφουν συνολικά alpha. Πρέπει να διαχωρίσουν Dodge v1.0 από τους υπόλοιπους prototypes κατά την παράδοση, χωρίς να διαγράψουν το μελλοντικό roadmap.
6. **Public parity:** το σημερινό local gameplay δεν έχει ακόμη δημοσιευθεί στο επιβεβαιωμένο remote SHA. Χρειάζεται commit/push, CI/Pages completion και live verification.

## Επιβεβαιωμένο deployment target

GitHub API στις 11/11:

- Repository: `statego2/League-Mechanics-God`.
- Pages `build_type: legacy`, source `codex/controls-and-dodge`, path `/`.
- Public URL: https://statego2.github.io/League-Mechanics-God/ .
- Remote branch SHA και latest Pages build: `6d1777198cc015f5aeb347e8d5f0c90818b2c109`, status `built`, error message null.
- Local gameplay HEAD: b37dd9d, cached tracking status 63 commits ahead. Το επόμενο AI θα κάνει fetch και θα επανελέγξει πριν το push· δεν υποθέτει ότι το remote έμεινε ίδιο.
- Οι tracked workflows αφορούν gameplay/reference tests. Δεν υπάρχει λόγος να στηθεί νέος deployment workflow ή νέο hosting: το Pages ήδη συνδέεται με το source branch.

Το status `built` αφορά το παραπάνω **παλιό remote SHA**, όχι αποδοχή του νέου Dodge. Το σημερινό αίτημα επιτρέπει στο επόμενο AI να δημοσιεύσει αφού περάσει το Definition of Done, χωρίς να περιμένει ξανά γενικό ΟΚ.
