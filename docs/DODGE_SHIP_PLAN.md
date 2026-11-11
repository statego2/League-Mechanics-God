# Τελικό πλάνο: Dodge v1.0 → shipped

**11 Νοεμβρίου 2026 · Ενεργό πλάνο παράδοσης.** Αντικαθιστά το `DODGE_COMPLETION_PLAN.md` της 10/11 και τις παλιές οδηγίες ανάκτησης bundle, distant standoff και νέου prediction. Διάβασε πρώτα αυτό, το [σημερινό audit](DODGE_RELEASE_AUDIT.md) και το [σχέδιο home](DRILLS_HOME_DESIGN.md).

## Στόχος και όριο εργασίας

Παράδωσε το σημερινό Dodge ως ολοκληρωμένο **v1.0 mechanics trainer**: μόνο η Syndra εμφανίζεται περίπου 25% πιο αραιά, το Drills home παρουσιάζει καθαρά το Dodge ως κύριο έτοιμο προϊόν και τα άλλα υπάρχοντα modes ως playable / in development, διατηρούνται όλες οι λειτουργίες και δημοσιεύεται επαληθευμένο build στο υπάρχον GitHub Pages.

«Shipped» σημαίνει λειτουργικό, δοκιμασμένο και δημόσια επαληθευμένο trainer με δηλωμένες approximations. Δεν σημαίνει πλήρες αντίγραφο League, τέλειο AI ή ολοκλήρωση Kite/CS/Mid Lane. Δεν ανοίγουμε νέο κύκλο prediction experiments, full refactor, framework migration, νέο art pack ή νέο mode.

**Ρητή διευκρίνιση χρήστη:** το −25% αφορά **μόνο τις εμφανίσεις της Syndra**, όχι τους υπόλοιπους champions και όχι όλο το Dodge.

**Εξουσιοδότηση παράδοσης:** η εντολή της 11/11 ζητά από το επόμενο AI να κάνει υλοποίηση, commit, push και GitHub Pages release. Υπερισχύει της παλιότερης οδηγίας «περίμενε νέο ΟΚ πριν το push». Όταν περάσουν τα παρακάτω gates, προχώρα στη δημοσίευση χωρίς άλλη γενική επιβεβαίωση. Αν λείπουν credentials/δικαιώματα ή αποτύχει deployment, δήλωσε το συγκεκριμένο εμπόδιο· μη δηλώσεις shipped.

## 0. Αφετηρία που δεν ξαναχτίζουμε

- Repo: `League-Mechanics-God`, branch `codex/controls-and-dodge`.
- Baseline gameplay commit: `b37dd9d`, build `2c9a3f00f828`, **547/547** tests επανελέγχθηκαν στις 11/11.
- Το bundle `505fb4c` είναι ήδη ancestor. **Μην κάνεις import/merge το παλιό bundle ή apply το round3 patch ξανά.** Διατήρησε τον untracked φάκελο `CODE2_HANDOFF/` χωρίς να τον συμπεριλάβεις τυφλά στο release commit.
- Έχουν ήδη διορθωθεί caster/source drift, E interaction range, other-cast counters, sphere-only stun/push, control locks, records, ασφαλές walk-out, entry cue, observed-motion aim, κοντινό/μακρινό Q και ασφαλές κοντινότερο QE.
- Η σημερινή Syndra έχει first=5 s, duration=7 s, entry=0.65 s, gap=2.5–4.5 s, solo-Q band=330, combo band=460 canvas units. Τα Q/E και τα reaction checks **μένουν ως έχουν**.
- Το per-cast forecast cache του b37dd9d έχει regression κάλυψη. Μην το αφαιρέσεις ούτε συνεχίσεις optimization χωρίς αναπαραγώγιμο browser πρόβλημα.
- Διάβασε `git status` πριν γράψεις. Αν άλλος agent έχει προχωρήσει το HEAD, διατήρησε τις αλλαγές και αξιολόγησε τη διαφορά από b37dd9d. Μην χρησιμοποιήσεις reset/force-push για να επαναφέρεις το baseline.

## 1. Μόνο Syndra: περίπου 25% λιγότερες πραγματικές επισκέψεις

### Μετρήσιμο contract

Μετράμε **successful visit entries / simulated minute**, όχι Q casts, planned combos, χρόνο παρουσίας ή attempts. Μετρητής: `dodgeDirector.syndraStays`. Το 25% λιγότερες επισκέψεις σημαίνει `newRate ≈ oldRate × 0.75`, δηλαδή μέσος πλήρης κύκλος περίπου `oldCycle / 0.75`. Δεν ισοδυναμεί με `gap × 1.25`.

Baseline fixture: `docs/dodge-release-audit-2026-11-11/measure-visits.cjs`, 20 seeds ανά profile, 30 s warmup + 120 s measurement, high HP και fixed 120 Hz. Τα δεδομένα βρίσκονται στο `baseline-visits.json`.

| Profile | Baseline visits/min | Στόχος ×0.75 | Baseline released E/min | Άλλοι casts/min |
|---|---:|---:|---:|---:|
| Stationary | 5.075 | 3.806 | 3.825 | 17.075 |
| Scripted moving | 4.950 | 3.713 | 4.400 | 20.225 |

**Acceptance:** new/baseline visit-rate ratio **0.70–0.80 σε καθένα από τα δύο profiles**. Εμφάνιση παραμένει συχνή, περίπου ανά 16 s συνολικά κατά μέσο όρο, όχι σπάνιο ultimate. Δεν απαιτείται 25% μείωση σε κάθε seed ή ένα σύντομο human run.

### Ελάχιστη υλοποίηση

1. Άλλαξε μόνο το post-visit gap της Syndra. Αρχική υποψήφια τιμή **6.5–8.5 s**, δηλαδή +4 s στο σημερινό gap. Ο πλήρης παρατηρημένος κύκλος είναι ~12 s, άρα +4 s είναι τεκμηριωμένη αρχική εκτίμηση, **όχι προεγκεκριμένο τελικό tuning χωρίς μέτρηση**.
2. Εφάρμοσε την ίδια πολιτική και στα δύο σημεία scheduling: `updateSyndraStay` και `updateDodgeDirector`, συμπεριλαμβανομένου death/departure κατά hit recovery. Προτίμησε μία μικρή κοινή helper αν αποφεύγει διπλή λογική.
3. Κράτησε first appearance=5 s, entry=0.65 s, διάρκεια/σειρά casts, aim, damage, range, hitbox, stun και safety checks αμετάβλητα. Μην παραλείπεις τυχαία το 25% των visits και μην αδειάζεις casts μέσα σε κάθε visit.
4. Καμία αλλαγή σε `DODGE_DIRECTOR`, global intervals, regular weights, ultimate clocks, other-champion aim ή hit recovery. Το επιπλέον κενό Syndra επιτρέπει φυσικά στον υπάρχοντα director να επιλέξει άλλους· οι παρατηρημένοι counts μπορεί να διαφέρουν χωρίς να αλλάξουν οι ρυθμίσεις τους. Μην τους ξαναρυθμίσεις για να επιβάλεις ίδιους counts.
5. Τρέξε το ίδιο fixture στο candidate, αποθήκευσε per-seed και aggregate αποτελέσματα, σύγκρινε visits και επιπλέον Q/E, occupancy, other casts. Αν βγει εκτός 0.70–0.80, ρύθμισε μόνο το gap και επανάλαβε. Μην αλλάξεις fixture ή baseline για να περάσει.
6. Αν παρατηρείται νέα απουσία άλλου champion ή μεγάλο κενό δράσης, έλεγξε starvation/hold logic ως bug. Μην μετατρέψεις το εύρημα σε γενικό rebalance.
7. Πρόσθεσε/ενημέρωσε tests για καινούργιο gap, death/recovery, pause/reset και λιγότερες visits. Τα παλιά tests παρουσίας ≥25 s ή fixed counts μπορεί δικαιολογημένα να αλλάξουν μόνο για τη νέα cadence απαίτηση. Οι escape/geometry assertions δεν χαλαρώνουν.
8. Expert records → επόμενη μη χρησιμοποιημένη έκδοση, **v93 αν παραμένει διαθέσιμη**, επειδή αλλάζει η πίεση. Διατήρησε όλα τα v87–v92 keys, difficulty/mode partitioning και awareness suffix. Μην καθαρίσεις localStorage.

Η παλιά απαίτηση ≥3.5 E/min του round3 δεν είναι release blocker για τη νέα πιο αραιή Syndra. Το visit ratio είναι η νέα δεσμευτική απαίτηση. Δεν αντισταθμίζουμε τη μείωση με περισσότερα E ανά επίσκεψη.

## 2. Drills home: φωτεινό Dodge, γκρι playable prototypes

Εφάρμοσε το [DRILLS_HOME_DESIGN.md](DRILLS_HOME_DESIGN.md) στα `index.html`, `style.css` και μόνο όπου χρειάζεται στο menu state του `game.js`.

- Μία μεγάλη φωτεινή κάρτα **DODGE TRIAL · v1.0**, κύριο CTA **PLAY DODGE**, σύντομη περιγραφή endless survival.
- Από κάτω δύο μικρότερες ουδέτερες κάρτες **KITE ARENA** και **CS PRACTICE**, με **IN DEVELOPMENT · PLAYABLE**. Παραμένουν clickable. Όχι disabled/locked, κρυμμένο gameplay ή μόνο χρώμα χωρίς label.
- Difficulty, Map Awareness checkbox/help και Sound συνεχίζουν να λειτουργούν. Τα settings δεν χάνονται στο scroll, δεν αντιγράφονται σε δεύτερα IDs και δεν γίνονται children του Play button.
- Δεν αλλάζει το background arena, τα assets, το minimap, HUD, abilities, results, keyboard/mouse mapping ή η λειτουργία των άλλων modes.
- Το main brand μένει League Mechanics God. Αντικατάστησε το παραπλανητικό γενικό `ALPHA · v0.5` με σαφή ένδειξη `DODGE v1.0` όταν παραδίδεται η έκδοση· τα υπόλοιπα δηλώνονται χωριστά ως in development.
- Ο hero φαίνεται μόνο στο home. Στο pause προέχει Resume και στα results προέχουν πραγματικά αποτελέσματα/Spell breakdown. Κανένα promotion δεν τα σκεπάζει.
- Bump το CSS cache key όταν αλλάξει το stylesheet. Μετά από `game.js` αλλαγές τρέξε `node scripts/update-build.cjs`. Διατήρησε το πραγματικό build label.

## 3. Έλεγχοι για κλείσιμο — χωρίς νέο ατέρμονο roadmap

Τρέξε στο candidate, αφού σταθεροποιηθούν cadence και home:

```sh
node scripts/update-build.cjs
node --check game.js
node --check world.js
node --test --test-name-pattern='Syndra|awareness|build identifies|record' tests/game.test.cjs
node --test --test-concurrency=1 tests/*.test.cjs
node docs/dodge-release-audit-2026-11-11/measure-visits.cjs .
node scripts/benchmark-syndra-e-reaction.cjs . --reaction=0.15
node scripts/benchmark-syndra-e-reaction.cjs . --reaction=0.15 --edges
node scripts/benchmark-survival.cjs .
git diff --check
python3 scripts/dev-server.py --port 8765
```

Κράτησε τα outputs στα release evidence. Το unchanged isolated QE corpus πρέπει να κρατά μηδενικά witness hits. Δεν κυνηγάμε νέα μεγαλύτερα hit rates. Τα survival results καταγράφονται, δεν είναι στόχος human δυσκολίας.

**Browser πραγματικού build, Chrome + Safari εφόσον διαθέσιμα:**

- Home σε 1440×900 και 1024×768: κύριο Dodge CTA, settings, ξεκάθαρα WIP modes, scroll και focus. Έλεγξε και μικρό desktop viewport χωρίς να υποσχεθείς mobile controls.
- Tab/Enter/Space για κουμπιά και checkbox, ορατό focus, όχι ανάγνωση status αποκλειστικά από το χρώμα.
- Expert, normal HP, συνολικά 3–5 λεπτά ενεργού παιχνιδιού με retries αν χρειαστούν. Κίνηση, QWER/F, Syndra introduction/Q/QE/stun/recovery, wall/edge και presence άλλων champions. Μην χρησιμοποιήσεις μόνο idle death ως playtest.
- Ελεγχόμενο forced encounter επιτρέπεται επιπλέον για σπάνιο edge case, με σαφή σήμανση και χωρίς αλλαγή production scheduler για το test.
- Map Awareness OFF→ON: εμφάνιση minimap μόνο όπου προβλέπεται, G/Alt-click και drag-up danger, reward, wrong ping, missed και unresolved sightings. Mixed results και full breakdown προσβάσιμα.
- P/Escape και blur pause, Resume, T/Restart, Drills→άλλο mode→Dodge: χωρίς resets επιλογών ή stale state που δεν υπήρχαν πριν. Κανένας διπλός listener/διπλό start.
- Foundation/Standard, Kite και CS: σύντομο smoke για inputs/HUD και έναρξη mode.
- Καμία uncaught console exception, missing asset ή σπασμένο relative URL. Ομαλή απόκριση χειρισμού χωρίς νέο επαναλαμβανόμενο ορατό freeze. Αν εμφανιστεί freeze, capture profile και διόρθωσε συγκεκριμένο bottleneck, όχι υποθετικό optimization.

Η δοκιμή browser είναι απαραίτητη· mocked Canvas tests δεν επαρκούν για το νέο home. Αν ένα browser/tool δεν είναι διαθέσιμο, δήλωσέ το ρητά και μην κατασκευάσεις αποτέλεσμα. Αυτό είναι συγκεκριμένο verification gap, όχι λόγος νέου feature cycle.

## 4. Definition of Done — όλα τα κουτάκια για «shipped»

- [ ] Το candidate βασίζεται στο σημερινό runtime, χωρίς επανεισαγωγή παλιού bundle/WIP.
- [ ] Μόνο η Syndra έχει cadence αλλαγή· visits ratio 0.70–0.80 και στα δύο fixed profiles, baseline/candidate evidence αποθηκευμένα.
- [ ] Άλλοι champions κρατούν ίδιες παραμέτρους. Δεν υπάρχει νέο reproducible starvation/empty-loop bug.
- [ ] Q/E, entry cue, sphere-only stun/push, input recovery, terrain και escape witnesses παραμένουν σωστά.
- [ ] Dodge εμφανίζεται ως το κύριο v1.0 προϊόν. Kite/CS είναι γκρι, με σαφή in-development labels, ακόμη playable.
- [ ] Όλα τα settings/controls/HUD/assets/results διατηρούνται· Map Awareness λειτουργεί end-to-end.
- [ ] Pause/results/home states έχουν ελεγχθεί σε browser χωρίς layout/focus/input regressions.
- [ ] Πλήρες suite πράσινο, syntax/diff checks πράσινα, regression coverage για νέα cadence/state changes και records.
- [ ] Τοπικό normal-HP browser playtest και asset/console checks ολοκληρωμένα με καταγεγραμμένα πραγματικά αποτελέσματα.
- [ ] Παλιότερα records διατηρούνται, νέα cadence έχει νέο Expert version key.
- [ ] README/Blueprint/PROGRESS/rhythm συμφωνούν: Dodge v1.0 shipped scope, άλλα modes in development, γνωστές approximations ξεκάθαρες.
- [ ] Οι αλλαγές έχουν γίνει commit, pushed στο πραγματικό Pages source branch, CI και Pages deployment επιτυχή για το παραδοτέο SHA.
- [ ] Στο δημόσιο URL φορτώνεται το νέο HTML/CSS/JS, σωστό build ID, λειτουργεί Play και Map Awareness· δεν επαληθεύτηκε μόνο HTTP 200.
- [ ] Τελική αναφορά περιλαμβάνει live URL, commit SHA, build ID, before/after cadence, test/browser αποτελέσματα και τυχόν μη αποκλειστικές γνωστές limitations.

**Stop rule:** όταν είναι όλα πράσινα, κλείσε το Dodge ως shipped. Επόμενες μη κρίσιμες ιδέες μπαίνουν σε backlog και δεν καθυστερούν αυτή την έκδοση. Reproducible broken controls, scoring, unfair collision, missing options ή failed deployment παραμένουν blockers· νέα features και θεωρητική τέλεια πιστότητα όχι.

## 5. Commit, GitHub Pages και επαλήθευση δημοσίευσης

Επαληθεύτηκε μέσω GitHub API στις 11/11: Pages source **branch `codex/controls-and-dodge`, path `/`, build_type `legacy`**. URL: https://statego2.github.io/League-Mechanics-God/ . Remote branch και τελευταίο επιτυχές Pages build έδειξαν `6d1777198cc015f5aeb347e8d5f0c90818b2c109`, ενώ το local runtime είναι b37dd9d. Άρα το σημερινό local και το published build είναι διαφορετικά.

1. Κάνε fetch και έλεγξε remote tip/Pages source ξανά πριν το publish. Αν υπάρχει divergence, διατήρησε και ενσωμάτωσε remote changes· όχι force-push ή overwrite.
2. Προτεινόμενα μικρά commits: `Reduce Syndra visit frequency by approximately 25%`, `Feature shipped Dodge on the drills home`, `Verify and document Dodge v1.0 release`. Stage συγκεκριμένα αρχεία· όχι `git add .` που θα πάρει το παλιό untracked handoff.
3. Πριν από push: πλήρες final suite, browser gates, `git diff --check`, σωστό build/cache keys και docs. Δημοσίευσε όλα τα απαραίτητα προηγούμενα local gameplay commits μαζί με το final candidate, όχι μόνο HTML.
4. Push στο επαληθευμένο Pages branch. Δεν χρειάζεται νέο hosting ή μεταφορά σε main/gh-pages. Μην αλλάξεις Pages settings αν δεν υπάρχει συγκεκριμένος λόγος.
5. Περίμενε gameplay CI και Pages build/deployment, έλεγξε το ακριβές commit. Ενδεικτικά read-only commands:

```sh
gh api repos/statego2/League-Mechanics-God/pages
gh api repos/statego2/League-Mechanics-God/pages/builds/latest
gh run list --branch codex/controls-and-dodge --limit 10
```

6. Άνοιξε fresh browser tab στο live URL. Επιβεβαίωσε actual executing build label, CSS αλλαγές, όλους τους local assets, Play Dodge και awareness toggle + gameplay. Αν χρειάζεται, δες Network για stale CSS/JS· δεν διορθώνεται με ψευδές hardcoded version label.
7. Κατέγραψε `DODGE_RELEASE_REPORT.md`: SHA/build, test totals, screenshots home/pause/results, cadence ratios, deployed URL και status. Αν αποτύχει release, διόρθωσε/redeploy και επαλήθευσε· μην τελειώσεις με «έκανα push, λογικά παίζει».

## 6. Μικρός στόχος για ανάθεση

> Ολοκλήρωσε και δημοσίευσε το Dodge v1.0 σύμφωνα με `docs/DODGE_SHIP_PLAN.md`: μόνο η Syndra περίπου 25% πιο αραιά, φωτεινό κύριο Dodge στο Drills home και γκρι αλλά playable Kite/CS ως in development, χωρίς απώλεια Map Awareness ή άλλων λειτουργιών. Πέρασε το Definition of Done, κάνε commit/push στο υπάρχον GitHub Pages και επαλήθευσε το live build. Μην προσθέσεις άλλο scope· παράδωσε URL, SHA και αποτελέσματα ελέγχων.
