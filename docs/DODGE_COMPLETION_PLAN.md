# Dodge: πλάνο ολοκλήρωσης για το επόμενο AI

Ημερομηνία: 10 Νοεμβρίου 2026. Σκοπός: να παραδοθεί ένα σταθερό, τοπικά ελεγμένο Dodge με ολοκληρωμένη Syndra. Αυτό είναι πλάνο εκτέλεσης, όχι δήλωση ότι το παιχνίδι ολοκληρώθηκε.

**Αφετηρία:** `League-Mechanics-God`, branch `codex/controls-and-dodge`, HEAD `c833be4`. Η βελτιωμένη Syndra του Code 2 βρίσκεται στο `CODE2_HANDOFF/code2-review.bundle`, HEAD `505fb4c`. Το `round3-wip.patch` είναι πρόσθετη δουλειά πάνω σε εκείνο το HEAD. Μην εφαρμόσεις το patch κατευθείαν στο c833be4.

Διάβασε επίσης το [audit με τα ευρήματα](DODGE_PROJECT_AUDIT.md) και το [αρχικό handoff](../CODE2_HANDOFF/HANDOFF.md). Για να ξεκινήσει νέο AI, υπάρχει [έτοιμο prompt](DODGE_NEXT_AI_PROMPT.md).

## 1. Κλειδωμένο scope

- Browser Canvas / JavaScript. Συνέχισε τον υπάρχοντα κώδικα, χωρίς Unity, νέο framework ή γενικό rewrite.
- Προτεραιότητα το endless Expert Dodge. Foundation, Standard, Kite και CS πρέπει να συνεχίσουν να λειτουργούν.
- Διατήρησε τον εγκεκριμένο ρυθμό και Mindgame Aim των άλλων champions. Διόρθωσε συγκεκριμένα bugs, όχι όλο το balance.
- Ολοκλήρωσε Syndra: σύντομες επισκέψεις, περίπου δύο solo Q και ένα Q→E, μεταβαλλόμενη σειρά, πιο μακρινό positioning, χρήσιμο prediction και ορατό stun/push στο sphere hit.
- Η νεότερη οδηγία για Syndra στο handoff υπερισχύει για τη Syndra του παλιού γενικού «Dodge χωρίς stun». Δεν αποτελεί άδεια να προστεθεί CC σε Lux, Cassiopeia ή όλους τους άλλους.
- Τα 1.5 s stun, 0.25 s push και οι αριθμοί hitbox είναι παράμετροι αυτού του trainer. Μην τα παρουσιάσεις ως αποδεδειγμένα τρέχοντα LoL stats. Το audit δεν έκανε νέο live-client ή web verification.
- Δεν απαιτούνται τώρα adaptive difficulty, benchmark menu, νέοι champions, lane AI, multiplayer, account ή backend. Ο μικρός offline benchmark παρακάτω είναι εργαλείο ελέγχου, όχι νέο mode.
- Το handoff ζητά τοπικό review πριν από push, επειδή το branch δημοσιεύει το παιχνίδι. Ολοκλήρωσε και δοκίμασε τοπικά· ζήτησε έγκριση μόνο στο τελικό βήμα δημοσίευσης.

## 2. Σειρά εργασίας — ένα μικρό παραδοτέο κάθε φορά

Μην αλλάξεις CC, scheduler και prediction μαζί. Κάθε βήμα τελειώνει με συγκεκριμένα tests, μικρό commit και σύντομη εγγραφή στο `docs/PROGRESS.md`. Αν μια δοκιμή αποτύχει, διόρθωσε την αιτία πριν συνεχίσεις. Μην μειώνεις thresholds απλώς για να περάσει.

### A. Ανάκτηση του ολοκληρωμένου bundle

**Αρχεία:** Git state, `CODE2_HANDOFF/*`, `tests/game.test.cjs`.

1. Έλεγξε `git status --short`, HEAD και branch. Φύλαξε τα νέα έγγραφα/audit πριν από αλλαγή branch.
2. Το υπάρχον uncommitted test των 9 γραμμών είναι ακριβώς το test του `187f734`. Επανέλεγξε το diff και αποθήκευσέ το πριν ενσωματώσεις το bundle. Μην κάνεις γενικό discard ή reset. Αν χρησιμοποίησες stash μόνο γι' αυτό το αρχείο, μην κάνεις μετά τυφλό `stash pop`: θα επαναφέρεις ήδη ενσωματωμένη αλλαγή.
3. `git bundle verify CODE2_HANDOFF/code2-review.bundle`.
4. `git fetch CODE2_HANDOFF/code2-review.bundle code2/dodge-completion:refs/heads/code2/dodge-completion`.
5. Εφόσον το checkout παραμένει στο c833be4 και δεν έχει αποκλίνει: `git merge --ff-only code2/dodge-completion`. Αν έχουν προστεθεί commits, εξέτασε τη διαφορά και κάνε κανονική ενσωμάτωση, χωρίς reset στο παλιό HEAD.
6. Επιβεβαίωσε sprite `assets/umbral-caster.png`, `syndraArt` στο HTML και build `23500ca28b3e` πριν από νέες αλλαγές.
7. Τρέξε πλήρες suite. Μην εισαγάγεις ακόμη όλο το round3 patch στην ενεργή βάση.

**Έξοδος:** η έκδοση 505fb4c είναι ανακτήσιμη, παίζει τοπικά και έχει τεκμηριωμένα tests. Το bundle και το patch διατηρούνται ακέραια.

### B. Διόρθωση γεωμετρίας και μέτρησης πριν το tuning

**Σύμβολα στο `game.js`:** `spawnSyndra`, `updateSyndraCaster`, `syndraConeContains`, `update` / `h.syndra`, `SYNDRA`. **Tests:** Syndra και cadence στο `tests/game.test.cjs`.

1. Χώρισε τα metrics: `qTotal=d.syndra`, `comboPlanned=d.syndraCombo`, `eReleased=d.syndraE`, `soloQ=qTotal-comboPlanned`, `otherCasts=d.attempted-qTotal-eReleased`. Χρησιμοποίησε μηδενικές προεπιλογές. Το E που ακυρώθηκε από charm/death δεν είναι released E.
2. Πρόσθεσε regression για το λάθος `others = attempted - syndra`. Σήμερα αυτό μετρά το E της Syndra ως άλλο champion.
3. Το Q→E πρέπει να ξεκινά από την ορατή Syndra. Η φθηνότερη ασφαλής λύση είναι να μην περπατά από τη δέσμευση του combo μέχρι το E release. Διατήρησε το υπάρχον behavior για charm/death: δεσμευμένο Q επιβιώνει, εκκρεμές E ακυρώνεται, ήδη εκτοξευμένη σφαίρα συνεχίζει. Μην επαναστοχεύεις σιωπηλά το combo στη μέση.
4. Πρόσθεσε έλεγχο ότι η σφαίρα βρίσκεται εντός της δηλωμένης εμβέλειας αλληλεπίδρασης E, πέρα από το ήδη υπάρχον Q range. Αν χρησιμοποιηθεί άλλη εμβέλεια από `eDirectRange`, όρισέ τη χωριστά και τεκμηρίωσέ τη. Μην αυξήσεις αυθαίρετα το E range για να κρυφτεί το πρόβλημα.
5. Επανέλεγξε το escape witness μετά τις παραπάνω αλλαγές. Κάθε accepted cast πρέπει να έχει διαδρομή που εκτελείται στο πραγματικό `update(1/120)` και αποφεύγει Q, cone και sphere.

**Έξοδος:** source/visual συμφωνούν στο release, Q και E ranges έχουν χωριστούς ελέγχους, οι πραγματικοί casts άλλων champions μετρώνται σωστά.

### C. Stun και push ως μικρή ανεξάρτητη αλλαγή

**Αναφορά patch:** `SYNDRA_STUN`, `applySyndraStun`, `cast`, `startAttack`, movement/update, sphere collision και `drawStunIndicator`.

1. Πάρε επιλεκτικά την υλοποίηση από το WIP. Η σφαίρα που πετυχαίνει Ahri εφαρμόζει ένα damage outcome, περίπου 1.5 s stun και σύντομο push κατά τη φορά της.
2. Χώρισε displacement και stun: ο απευθείας κώνος δεν παίρνει αυτόματα sphere stun. Το WIP τα εξισώνει και το test του το επιβραβεύει. Διατήρησε ένα damage outcome για cone/sphere του ίδιου E. Όρισε ρητά τι γίνεται αν το ίδιο E βρει και cone και sphere: η ελάχιστη συνεπής επιλογή είναι το ήδη υπάρχον first-contact resolution, χωρίς δεύτερο damage/CC.
3. Push με wall clipping **και bounds clamping**. Το `world.clip` ελέγχει τοίχους, όχι μόνο του τα εξωτερικά όρια. Ο στόχος πρέπει να είναι έγκυρος και σε corners.
4. Διακοπή ενεργού R dash, windup και pending cast, χωρίς να αναβιώνουν μετά. Οι διαθέσιμες R charges/cooldowns ακολουθούν την υπάρχουσα πολιτική· μη μηδενίζεις άσχετα resources.
5. Κατά το stun καμία νέα κίνηση/επίθεση/Q/W/E/R/F δεν εκτελείται. Κράτησε την υπάρχουσα δυνατότητα queued movement αν είναι συνεπής, αλλά τεκμηρίωσέ τη και δοκίμασέ τη. Ήδη εκτοξευμένα projectiles δεν εξαφανίζονται.
6. Invulnerability/blocked contact και lethal hit δεν δημιουργούν επιπλέον stun, damage ή χαλασμένο result. Pause παγώνει timers, restart καθαρίζει CC/history/push.
7. Η αποκατάσταση μετά το stun δεν πρέπει να δημιουργεί νέο unavoidable cast. Μην αφαιρείς ήδη committed threats για να ωραιοποιήσεις τα tests. Έλεγξε σενάρια με ενεργά missiles.
8. Ορατός δείκτης stun και συνεπές HUD διαθεσιμότητας abilities. Το WIP προσθέτει δείκτη, όχι ολοκληρωμένο HUD lock.

**Ελάχιστα tests:** sphere/cone ξεχωριστά, stun expiry, blocked/lethal hit, wall/corner push, R interruption, όλες οι εντολές κατά το stun, pause/restart και ίδιο αποτέλεσμα στα 30/60/120 rendered FPS.

### D. Σύντομες επισκέψεις και μεγαλύτερη απόσταση

**Σύμβολα:** `SYNDRA_STAY`, `chooseSyndraPlan`, `syndraCastDone`, `updateSyndraStay`, `updateSyndraCaster`, `updateDodgeDirector`.

- Χρησιμοποίησε μικρά plans: Q,Q,QE / Q,QE,Q / QE,Q,Q / περιστασιακά Q,QE. QE σημαίνει **Q και μετά E**, όχι E→Q παρά το περιστασιακό λεκτικό λάθος του handoff.
- Το WIP δίνει αρχικές τιμές: πρώτη άφιξη 5 s, όριο visit 7 s, gap 2.5–4.5 s, Q band 330 canvas units, QE band 520. Είναι αφετηρία προς έλεγχο, όχι αμετάβλητες υποχρεώσεις.
- Μετράμε παραμονή από πραγματική εμφάνιση έως αποχώρηση. Αναμονή release/flight μπορεί να παρατείνει το hard timeout· καταγράφεται χωριστά. Δεν απαιτούμε μηχανικά ακριβώς 7 s σε κάθε περίπτωση.
- Ολοκλήρωση sequence, timeout, death και charm δεν αφήνουν ghost actor ή ανεξάντλητες retries. Φραγμένη γεωμετρία οδηγεί σε ασφαλές fallback/defer/exit, ποτέ cast χωρίς escape.
- Walk-out χρειάζεται έλεγχο τοίχων: το bundle και το patch μετακινούν τον caster απευθείας με x/y στην αποχώρηση. Χρησιμοποίησε walkable exit ή σαφή ασφαλή fade αφού τελειώσει το encounter.
- Οι άλλοι champions συνεχίζουν να εμφανίζονται. Μην αυξήσεις global difficulty ή αφαιρέσεις το clear-board rule για να πετύχεις αριθμητικό quota.

**Έξοδος:** ποικιλία σειράς σε seeded επισκέψεις, solo Q συχνότερο από combos, σύντομες επισκέψεις χωρίς να γίνεται το Dodge μόνο Syndra. Στόχος του handoff περίπου ≥3.5 **released E/minute κατά μέσο όρο**, με αναφορά σε ολόκληρο χρόνο session, όχι μόνο όσο είναι παρούσα. Αν οι περιορισμοί ασφάλειας τον εμποδίζουν, ανέφερε συγκεκριμένα στοιχεία· μην κρύψεις το πρόβλημα με `comboPlanned`.

### E. Prediction που βελτιώνει την εξάσκηση

**Σύμβολα WIP:** `SYNDRA_READ`, `syndraTrack`, `syndraRead`, `chooseSyndraStyle`, `syndraStyleAim`, `spawnSyndra`.

1. Πρώτα υλοποίησε/έλεγξε μικρό history buffer ~2 s και smoothed velocity ~0.3 s. Καθάριζέ το στο reset· μην μαθαίνει «συνήθειες» από knockback, stun ή teleport/dash displacement.
2. Βάλε direct / lead / reversal, κατόπιν cross/flank και μόνο μετά juke/habit adaptation αν προσφέρει μετρήσιμη βελτίωση. Μην κρατήσεις όλο το περίπλοκο WIP μόνο επειδή υπάρχει.
3. Στόχευση από ήδη παρατηρημένη κίνηση, κλειδωμένη στο cast. Μην προσθέσεις πρόσβαση σε μελλοντικά inputs/cursor. Η προϋπάρχουσα route forecast είναι approximation του engine· κατέγραψε τη χρήση της, μην την παρουσιάζεις ως πραγματική παρατήρηση bot.
4. Πρόβλεψη impact time με πραγματικό source/sphere/target travel. Οι παλιές 1.05 s προκύπτουν από το συγκεκριμένο sphereLead=200 και speed=1000 canvas/s· δεν είναι γενική σταθερά όταν αλλάζει η γεωμετρία.
5. Κάθε candidate περνά ranges, walkability και executable escape. Αν αποτύχει: safe lead → direct → defer, χωρίς αλλαγή hitbox ή αόρατη διόρθωση στόχου μετά το tell.

**Μετρήσεις:** ίδιο deterministic fixture πριν/μετά, 40 seeds × πέντε συμπεριφορές: straight, reverse στα 0.2 s, reverse στα 0.4 s, perpendicular sidestep, seeded random juke. Κέντρα, άκρες και τοίχοι. Μέτρα accepted casts, rejected/fallback casts, released E, hits ανά behavior, witness failures και χρόνο εκτέλεσης. Μετράς το συγκεκριμένο spell, όχι άσχετα hits της ίδιας περιόδου.

**Έξοδος:** βελτίωση QE απέναντι στα προβλέψιμα behaviors έναντι 505fb4c, με εμφανή αποτελέσματα και μηδενικά witness failures στο συγκεκριμένο corpus. Αυτό δεν αποδεικνύει καθολική μαθηματική εγγύηση ή human balance. Μην κυνηγάς 100% hit rate· η σωστή αντίδραση πρέπει να παραμένει χρήσιμη.

### F. Αποτελέσματα, records και έγγραφα

**Αρχεία:** `game.js` (`end`, `updateUI`, `recordSuffix`), `index.html`, `README.md`, `PROJECT_BLUEPRINT.md`, `docs/DODGE_GAUNTLET_RHYTHM.md`, `docs/PROGRESS.md`.

- Διατήρησε χωριστά Syndra Q/E outcomes. Μη μετράς missed harmless shots, blocked hits ή cancelled E ως dodge.
- Expert `director_v92` όταν ενσωματωθούν οι αλλαγές συμπεριφοράς. Διατήρησε v87–v91 και τα άλλα modes χωρίς διαγραφή localStorage.
- Ενημέρωσε τα παλιά «χωρίς CC», «210 radius», «vector-only» και το ότι η Syndra εμφανίζεται μόνο στιγμιαία. Γράψε καθαρά training approximations και όσα παραμένουν μη επαληθευμένα.
- `node scripts/update-build.cjs` μετά από κάθε αλλαγή `game.js` και πριν από build-ID tests.
- Μην αλλάξεις το αμετάβλητο αρχικό `CODE2_HANDOFF/HANDOFF.md` για να φαίνεται ότι έλεγε κάτι διαφορετικό.

### G. Τελική επαλήθευση και παράδοση

Από το σωστό repo:

```sh
node scripts/update-build.cjs
node --check game.js
node --check world.js
node --test --test-name-pattern='Syndra|build identifies' tests/game.test.cjs
node --test --test-concurrency=1 tests/*.test.cjs
git diff --check
python3 scripts/dev-server.py --port 8765
```

Τρέξε τα tests σειριακά ανά έκδοση, χωρίς παράλληλες αλλαγές στα αρχεία. Το CI χρησιμοποιεί Node 22· το audit έγινε με Node 24.21.0. Αν υπάρξει process-level failure, κράτησε log/exit status και επανάλαβε σε καθαρό serial run πριν το χαρακτηρίσεις gameplay bug.

Browser checklist στο `http://127.0.0.1:8765/`:

1. Σωστό build label, φορτωμένα assets, μηδενικά console errors/404. Chrome και Safari, κανονικό viewport και μικρότερο παράθυρο desktop.
2. Expert με κανονικό HP: Q-only, QE, σφαίρα που πετυχαίνει, stun/push/ανάκτηση ελέγχου, F/R πριν και κατά το stun, τοίχοι/corners, charm/kill Syndra.
3. Pause/resume, restart/T, menu→new run. Κανένα υπόλοιπο CC, history ή actor.
4. Results Q/E και records, Map Awareness off/on με pinged/missed/pending. Attack-move μετά G και abilities μετά A.
5. Σύντομο smoke Foundation, Standard, Kite, CS για κοινά movement/input regressions.
6. Τουλάχιστον ένα κανονικό playtest 3–5 λεπτών συνολικού ενεργού παιχνιδιού, με επανεκκίνηση αν πεθάνει ο παίκτης. Μεγάλο-HP/forced-spawn session μόνο ως συμπληρωματικό stress test, δηλωμένο χωριστά.

**Definition of done:** πράσινα tests, επαληθευμένες διαδρομές διαφυγής στο corpus, συμφωνία visual/collision, σωστά stun/inputs, χρήσιμη συχνότητα QE, άλλοι champions παρόντες, καθαρό browser smoke, ενημερωμένα docs και τοπικό build έτοιμο για τον Δημήτρη. Μετά την προσωπική δοκιμή του γίνονται μόνο συγκεκριμένες διορθώσεις. Δεν ξανανοίγουμε ολόκληρο το roadmap.

## 3. Κόστος και πρακτική χρήση από φθηνότερο AI

Κάθε session παίρνει **ένα** από τα A–G, το αντίστοιχο σύνολο συμβόλων και το τελευταίο αποτέλεσμα tests. Το μεγάλο `PROGRESS.md` είναι ιστορικό: διάβασε πρώτα την τελευταία σχετική εγγραφή και μετά αναζήτησε στοχευμένα. Μην ξαναφορτώνεις όλο το repo σε κάθε βήμα.

Μετά από κάθε session γράψε: commit/build, ακριβή αλλαγή, commands που έτρεξαν, pass/fail, εναπομένον bug και επόμενο γράμμα. Αν κάτι δεν ελέγχθηκε σε browser, γράψε «δεν ελέγχθηκε», όχι «έτοιμο».

Η οικονομικότερη διαδρομή είναι: **ανάκτηση bundle → σωστή γεωμετρία/metrics → CC → visits → prediction → τελικό playtest**. Το WIP είναι υλικό επαναχρησιμοποίησης, όχι έτοιμη λύση προς τυφλό merge.
