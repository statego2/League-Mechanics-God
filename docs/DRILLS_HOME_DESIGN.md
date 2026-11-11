# Drills home — τελικό σχέδιο για Dodge v1.0

11 Νοεμβρίου 2026. Προδιαγραφή υλοποίησης, όχι ήδη δημοσιευμένο UI. Συνοδεύει το `DODGE_SHIP_PLAN.md`.

## Οπτική κατεύθυνση

Κράτησε το υπάρχον σκούρο navy, το painted arena πίσω από το overlay και το League Mechanics God branding. Πρόκειται για μικρή αναδιάταξη της υπάρχουσας οθόνης, χωρίς νέο site, routing, gradients παντού ή επιπλέον hero artwork.

Το Dodge ξεχωρίζει με μέγεθος, χρώμα, θέση και σαφές status. Οι άλλες δύο επιλογές δείχνουν λιγότερο έτοιμες, χωρίς να μοιάζουν απενεργοποιημένες.

```text
LEAGUE MECHANICS GOD       DODGE v1.0   [SOUND OFF] [DRILLS] ...

                    CHOOSE YOUR DRILL
              Jump into Dodge. Keep improving.

┌────────────────────────────────────────────────────────────┐
│  ◎  DODGE TRIAL                                v1.0 · READY │
│     Endless survival against champion skillshots.           │
│     Read the cast. Dodge. Survive.                          │
│                                            PLAY DODGE  →   │
└────────────────────────────────────────────────────────────┘
  DIFFICULTY [Expert ▾]       [✓] MAP AWARENESS
                              G / Alt + click · drag up for danger

  IN DEVELOPMENT · PLAYABLE PROTOTYPES
┌─────────────────────────────┐ ┌─────────────────────────────┐
│ ⌁ KITE ARENA                │ │ ♜ CS PRACTICE               │
│   IN DEVELOPMENT            │ │   IN DEVELOPMENT            │
│   Orbwalking and combat     │ │   Last-hit practice         │
│   Try prototype →           │ │   Try prototype →           │
└─────────────────────────────┘ └─────────────────────────────┘

        No installation · No login · Desktop mouse and keyboard
                       Build: <executing ID>
```

Το `READY`/v1.0 είναι η κατάσταση της ολοκληρωμένης έκδοσης που θα περάσει τα release gates, όχι ισχυρισμός ότι έχει ήδη παραδοθεί κατά τη συγγραφή του πλάνου.

## Στυλ και μεγέθη

| Περιοχή | Προδιαγραφή |
|---|---|
| Menu | max-width περίπου 680–720 px, υπάρχον max-height/vertical scroll, padding 20–24 px |
| Τίτλος | 32–40 px desktop, 26–30 px μικρό viewport· μικρότερος από το σημερινό μεγάλο slogan για να χωρούν τα settings |
| Dodge card | full width, background `#12363B`, border `#70E8D5`, λεπτό glow, κύριος τίτλος 22–26 px, λευκό/teal κείμενο |
| Play CTA | έντονο mint `#70E8D5`, σκούρο κείμενο, σαφές hover/focus· ολόκληρη η κάρτα παραμένει ένα προσβάσιμο button |
| WIP cards | 2 στήλες desktop, `#17212C`, border `#465260`, κείμενο `#C3CCD4`, μικρό badge `IN DEVELOPMENT` |
| WIP affordance | διακριτικό hover/focus και `Try prototype`; όχι `disabled`, όχι `pointer-events:none`, όχι opacity σε όλο το parent |
| Responsive | κάτω από ~640 px οι δύο WIP cards μπαίνουν σε μία στήλη· settings κάνουν wrap χωρίς να κόβεται το checkbox/help |
| Focus | ορατό outline με offset σε όλα τα interactive στοιχεία, όχι μόνο hover |

Τα χρώματα είναι αρχικές συγκεκριμένες επιλογές· έλεγξε τελικό contrast στο render. Κανένα status μόνο μέσω χρώματος. Δεν χρειάζονται κινούμενα highlights ή νέα dependencies.

## DOM / συμπεριφορά — μη χαθεί τίποτα

- Διατήρησε ακριβώς ένα `data-mode="dodge"`, ένα `data-mode="kite"` και ένα `data-mode="lastHit"`. Δεν προσθέτουμε τέταρτη κάρτα Mid Lane και δεν αλλάζουμε τα mode IDs.
- Το primary card είναι `<button>` με εσωτερικό οπτικό `<span>` για το Play CTA, **όχι button μέσα σε button**. Το `data-mode` handler παραμένει η μοναδική αρχή session.
- Διατήρησε τα IDs `difficulty`, `mapAwareness`, `settings`, `attackSpeed`, `newSeed`, `seedLabel`, `soundBtn`, `buildLabel`. Τα τελευταία hidden controls μένουν hidden όπως σήμερα· δεν αφαιρούνται ούτε δημοσιοποιούνται κατά λάθος.
- Difficulty επιλογές Foundation/Standard/Expert με default Expert. Το design δεν καταργεί επιλογές ή αλλάζει τι αποθηκεύεται/διατηρείται στο υπάρχον session.
- Το checkbox Map Awareness παραμένει το πραγματικό input με label/help. Μην το αντικαταστήσεις με διακοσμητικό pill. Παραμένει προαιρετικό Dodge feature, όχι νέο mode ή καθολική προσθήκη στο Kite/CS.
- Sound παραμένει topbar button με πραγματικό state και `aria-pressed`. Διατηρούνται Drills, Pause, Restart, Resume και όλα τα shortcuts.
- Διατήρησε `awarenessResult`, `dodgeBreakdown`, `dodgeBreakdownText`, `menuDescription`, `menuTitle`, `menuFooter`, `resumeBtn`. Μη μεταφέρεις results μέσα σε hidden hero container.
- Το `menuBtn` σήμερα βάζει άλλο generic title/description. Ενημέρωσέ το μαζί με το initial HTML ώστε πρώτο load και επιστροφή στα Drills να έχουν το ίδιο home copy.
- Η `showMenu` χρησιμοποιείται και για αποτελέσματα. Χρειάζεται σαφές state/class (`home`, `paused`, `results`) με βάση το πραγματικό state/finished flag. Μην προσδιορίζεις τη διάταξη από string matching στο title.
- Κράτησε τους ίδιους DOM nodes για τα settings· η μετακίνηση/κλωνοποίησή τους μπορεί να χάσει listeners/checked state. Μικρή προσαρμογή δομής με ένα container ανά λειτουργία είναι αρκετή.
- Το υπάρχον CSS `.mode-card:nth-child(odd):last-child` και το grid για `modeButtons` χρειάζονται έλεγχο. Χρησιμοποίησε ρητή featured class/grid-column στο Dodge αντί να στηριχθείς στη σειρά nth-child.
- Αν χρησιμοποιηθεί νέος home-only wrapper, το pause πρέπει να τον κρύβει χωρίς να κρύβεται το Resume. Έλεγξε `[hidden]{display:none!important}` και τα existing rules.

## Οι τέσσερις καταστάσεις

| State | Περιεχόμενο / πρωτεύουσα ενέργεια |
|---|---|
| Πρώτο load / Drills | Featured Dodge, settings και WIP cards· Play Dodge κύριο CTA |
| Playing | Overlay κρυφό· υπάρχον arena/HUD/minimap/abilities απαράλλακτα |
| Paused | PAUSED και Resume· home hero/settings/mode cards κρυφά όπως επιβάλλει η σημερινή συμπεριφορά |
| Results | Survival/score, awareness result και expandable spell breakdown πρώτα· Retry/επιλογή drill παραμένουν προσβάσιμα, οι κάρτες μπορούν να είναι compact χωρίς επανάληψη μεγάλου hero |

## Acceptance

Σε πρώτο load φαίνεται αμέσως ποιο προϊόν είναι έτοιμο. Σε λιγότερο από δύο επιλογές ξεκινάς Dodge με την επιθυμητή difficulty και awareness. Kite/CS ανοίγουν από τις γκρι κάρτες. Checkbox, sounds, home→play→pause→resume→results→Drills δεν χάνουν behavior. Τα results χωρούν/scrollάρουν και δεν καλύπτονται από τις νέες κάρτες. Αποθήκευσε screenshots home, pause και results από τον πραγματικό browser, όχι μόνο Node draw-call assertions.
