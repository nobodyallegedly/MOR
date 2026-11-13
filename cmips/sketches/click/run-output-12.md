# The click, run on draft 12

## 1. Every leg calls for both halves; a reader who holds every report
Seat: **everyone**. 3 click(s) of 1000 sat.
Down from click 1:
```
click: 1000 sat from payer1
the film's deal with svcA: svcA reports 1000 in, kept 10
  → dana: 495 [matched]
  → eli: 198 [matched]
  → the song: 198 [matched]
    the song's deal with svcB: svcB reports 594 in, kept 11; this click is 33% of the batch (pro rata, not stated)
      → the band: 409 [matched]
        the band's deal with svcC: svcC reports 409 in, kept 0
          → mia: 165 [matched]
          → noor: 122 [matched]
          → omar: 122 [matched]
      → pat: 174 [matched]
  → the sound library: 99 [matched]
    the sound library: lea reports 99 in, kept 60
      → lou: 39 [matched]
```
Shown reached, to this seat: dana, eli, pat, mia, noor, omar, lea, lou. Not shown: nobody.

## 2. The payer, after paying
Seat: **payer1** (reads the places of the legs it signed, and those its own agreements signed). 3 click(s) of 1000 sat.
Down from click 1:
```
click: 1000 sat from payer1
the film's deal with svcA: NOT SHOWN to this reader (one leg)
```
Shown reached, to this seat: nobody. Not shown: dana, eli, pat, mia, noor, omar, lea, lou.

## 3. The payer, before paying: which legs called for reports
Seat: **payer1** (reads the places of the legs it signed, and those its own agreements signed). 3 click(s) of 1000 sat.
The calls this seat can see:
```
the sound library: calls for reports from doer and receiver; whether answered: NOT SHOWN to payer1
the film's deal with svcA: calls for reports from doer and receiver; whether answered: NOT SHOWN to payer1
the song's deal with svcB: calls for reports from doer and receiver; whether answered: NOT SHOWN to payer1
the band's deal with svcC: calls for reports from doer and receiver; whether answered: NOT SHOWN to payer1
```

## 4. A film owner
Seat: **dana** (reads the places of the legs it signed, and those its own agreements signed). 3 click(s) of 1000 sat.
Down from click 1:
```
click: 1000 sat from payer1
the film's deal with svcA: svcA reports 1000 in, kept 10
  → dana: 495 [matched]
  → eli: 198 [matched]
  → the song: 198 [matched]
    the song's deal with svcB: NOT SHOWN to this reader (one leg)
  → the sound library: 99 [matched]
    the sound library: NOT SHOWN to this reader (one leg)
```
Shown reached, to this seat: dana, eli, lea. Not shown: pat, mia, noor, omar, lou.

## 5. A band member, reading up
Seat: **mia** (reads the places of the legs it signed, and those its own agreements signed). 3 click(s) of 1000 sat.
Up from what reached this seat:
```
mia received 165 sat (settlement a38818692c)
  paid by svcC under the band's deal with svcC, from 409 received in 1 payment(s)
    svcB paid it on; under which leg, and from what: NOT SHOWN to this reader
```

## 6. The same band member, her signature counted through every agreement above her (P17)
Seat: **mia** (reads the places of the legs it signed, its signature counted through every agreement above it). 3 click(s) of 1000 sat.
Up from what reached this seat:
```
mia received 165 sat (settlement a38818692c)
  paid by svcC under the band's deal with svcC, from 409 received in 1 payment(s)
    paid by svcB under the song's deal with svcB, from 594 received in 3 payment(s)
      paid by svcA under the film's deal with svcA, from 1000 received in 1 payment(s)
        paid in by payer1, a payer (Money's record, not a report)
      (and 2 more payment(s) in the same report)
```

## 7. The song's service gives no report; a reader who holds every report
Seat: **everyone**. 3 click(s) of 1000 sat.
Down from click 1:
```
click: 1000 sat from payer1
the film's deal with svcA: svcA reports 1000 in, kept 10
  → dana: 495 [matched]
  → eli: 198 [matched]
  → the song: 198 [matched]
    the song's deal with svcB: UNANSWERED (the call was read; no doer report)
  → the sound library: 99 [matched]
    the sound library: lea reports 99 in, kept 60
      → lou: 39 [matched]
```
Shown reached, to this seat: dana, eli, lea, lou. Not shown: pat, mia, noor, omar.

## 8. The same, seen by the producer, who signed the song and so its deal
Seat: **pat** (reads the places of the legs it signed, and those its own agreements signed). 3 click(s) of 1000 sat.
The calls this seat can see:
```
the sound library: calls for reports from doer and receiver; whether answered: NOT SHOWN to pat
the film's deal with svcA: calls for reports from doer and receiver; whether answered: NOT SHOWN to pat
the song's deal with svcB: calls for reports from doer and receiver; doer's reports: UNANSWERED; receivers' confirmations: 2
the band's deal with svcC: calls for reports from doer and receiver; whether answered: NOT SHOWN to pat
```

## 9. Small clicks: the band's service holds what is under its minimum
Seat: **everyone**. 3 click(s) of 100 sat.
Down from click 1:
```
click: 100 sat from payer1
the film's deal with svcA: svcA reports 100 in, kept 10
  → dana: 45 [matched]
  → eli: 18 [matched]
  → the song: 18 [matched]
    the song's deal with svcB: svcB reports 54 in, kept 1; this click is 33% of the batch (pro rata, not stated)
      → the band: 38 [matched]
        the band's deal with svcC: svcC reports 38 in, kept 0, still owed: mia 16, noor 11, omar 11
      → pat: 15 [matched]
  → the sound library: 9 [matched]
    the sound library: lea reports 9 in, kept 6
      → lou: 3 [matched]
```
Shown reached, to this seat: dana, eli, pat, lea, lou. Not shown: mia, noor, omar.

## 10. A band member receives for the band (the answer to 3g); one bandmate confirms a different amount
Seat: **everyone**. 3 click(s) of 1000 sat.
Down from click 1:
```
click: 1000 sat from payer1
the film's deal with svcA: svcA reports 1000 in, kept 10
  → dana: 495 [matched]
  → eli: 198 [matched]
  → the song: 198 [matched]
    the song's deal with svcB: svcB reports 594 in, kept 11; this click is 33% of the batch (pro rata, not stated)
      → the band: 409 [matched]
        the band: mia reports 409 in, kept 165
          → noor: 122 [MISMATCHED (noor confirms 100)]
          → omar: 122 [matched]
      → pat: 174 [matched]
  → the sound library: 99 [matched]
    the sound library: lea reports 99 in, kept 60
      → lou: 39 [matched]
```
Shown reached, to this seat: dana, eli, pat, mia, noor, omar, lea, lou. Not shown: nobody.

## 11. A partner of the film, with a waterfall view every leg agreed to except the band's
Seat: **partner** (reads only what the legs agreed to send it). 3 click(s) of 1000 sat.
Down from click 1:
```
click: 1000 sat from payer1
the film's deal with svcA: svcA reports 1000 in, kept 10
  → dana: 495 [matched]
  → eli: 198 [matched]
  → the song: 198 [matched]
    the song's deal with svcB: svcB reports 594 in, kept 11; this click is 33% of the batch (pro rata, not stated)
      → the band: 409 [matched]
        the band's deal with svcC: NOT SHOWN to this reader (one leg)
      → pat: 174 [matched]
  → the sound library: 99 [matched]
    the sound library: lea reports 99 in, kept 60
      → lou: 39 [matched]
```
Shown reached, to this seat: dana, eli, pat, lea, lou. Not shown: mia, noor, omar.

## 12. The same partner, every leg agreed
Seat: **partner** (reads only what the legs agreed to send it). 3 click(s) of 1000 sat.
Down from click 1:
```
click: 1000 sat from payer1
the film's deal with svcA: svcA reports 1000 in, kept 10
  → dana: 495 [matched]
  → eli: 198 [matched]
  → the song: 198 [matched]
    the song's deal with svcB: svcB reports 594 in, kept 11; this click is 33% of the batch (pro rata, not stated)
      → the band: 409 [matched]
        the band's deal with svcC: svcC reports 409 in, kept 0
          → mia: 165 [matched]
          → noor: 122 [matched]
          → omar: 122 [matched]
      → pat: 174 [matched]
  → the sound library: 99 [matched]
    the sound library: lea reports 99 in, kept 60
      → lou: 39 [matched]
```
Shown reached, to this seat: dana, eli, pat, mia, noor, omar, lea, lou. Not shown: nobody.
