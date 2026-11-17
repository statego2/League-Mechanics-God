# ADC mechanics God — user vision

Recorded 2026-11-16 from the text supplied in chat. This is a new GitHub transcription, not a recovered copy of the user's local file. Planning only; implementation belongs to a later Terra session. The latest user instruction takes precedence over the older general roadmap: preserve Dodge.

## Supplied text (wording preserved)

Θέλω να κάνουμε το ADC MECHANICS
Θα είναι Main Παίχτης ή Tristana
Και θα είναι φάση kite mode
Ενώ πάλι έρχονται όλοι αυτοί οι ίδιοι και dodgareis
Θα έρχονται αντίπαλοι που να πρέπει να βαρέσεις πολλαπλές φορές για να πεθάνουν υποθέτω
οπότε να πρέπει να kitάρεις
και
αν σε ακουμπήσουν χάνεις πολύ HP
στο μεταξύ έρχονται διάφοροι αντίπαλοι και πετάνε σκιλς πάνω σου
παρόμοια με το dodge
ίσως κάποιοι να μην πλησιάζουν τόσο κοντά
ή πχ η syndra να μην λειτουργεί το ίδιο που έρχεται και πετάει 2 q
αλλά τα υπόλοιπα μια χαρά νομίζω
Πριν το κάνεις συζητά την ιδέα
Μπρο ήδη έχει διαφορά από αυτά ήδη περασμένα σαν mechanics attack A κτλπ
οπότε μην ρωτάς
ναι είναι καλή ιδέα να φτιαχτεί πάνω στο league dodge
ναι πάνω
σε δεύτερο mode
το λένε όπως το είπα ADC mechanics God
Θέλω Astra για plan του mode
και terra για coding ματα που είναι πιο φτηνό
μην πειράξετε τίποτα στο dodge ε
Σε εμπιστεύομαι να δουλέψεις
μην χαλάσεις τίποτα
και μην σπαταλήσεις τα τοκενς άσκοπα
Το πλάνο/ η πρόοδος κτλπ να περνάει στο github ώστε αν το πιάσει ένα καινούργιο ΑΙ να ξέρει τι να κάνει

## Provenance

The user also supplied this prior statement:
> Τα έσωσα αυτούσια και στο αρχείο VISION-ADC.md, μέσα στο branch του ADC, για να μη χαθούν. Είναι ακόμα μόνο στον υπολογιστή μου, όχι στο GitHub.

No remote ADC branch was present when inspected. The user's local branch and file were not accessible in this session. Do not overwrite or assume recovery of that local work.

## Current correction — 2026-11-16

The user rejected the implemented prototype: “ούτε τριστάνα βλέπω ούτε εχθρούς που να πετάνε σκιλς”. Redesign is required before the next Terra coding session. Recognizable Tristana and simultaneous kiting plus champion skillshots are core acceptance criteria, not optional polish after a generic demo. The original request above remains binding. Preserve Dodge. The current local source is now available on `codex/adc-mode`; the earlier provenance note describes the historical planning session, not a current missing-source blocker. See `docs/ADC-PLAN.md` and `ADC_NEXT_AI_PROMPT.md`.

## Latest binding correction — 17 November 2026

> χμμμ δεν θελω να δουλευει ετσι ακριβως..
> γιατί εμφανίζονται οι γραμμές των σκιλ;
> μπρο θελω να ερχονται generic εχθροι και γυρω γυρω να πεταγονται σκιλς
> επισης θελω το full stack των σκιλ της τριστανα οπως στο dodge για την ahri

This supersedes champion-as-target encounters, trajectory preview lines and autos-only scope. Generic targets and surrounding spells are independent; Tristana needs the complete passive/QWER interactions and Flash. The canonical plan and Terra handoff were rewritten in full so old conflicting requirements do not remain executable instructions. Preserve Dodge.

## Latest pacing clarification — 17 November 2026

Remove “upcoming” (current UI: INCOMING), use random positions only at the corners, slow enemies, improve attack speed, and inspect https://loldodgegame.com/kiting/ before revising the design. The subsequent owner clarification is: “αν ειναι 5 και μοιαζει ο ρυθμος φεν με πειραζει” — five hits are acceptable if the rhythm is similar. This overrides the earlier fewer-hits preference; do not make three hits a requirement. Full Tristana, independent surrounding skills and untouched Dodge remain binding.
