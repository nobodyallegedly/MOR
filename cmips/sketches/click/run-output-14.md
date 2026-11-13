# The click, run on draft 14

## 1. The buyer's seat (11.7)
```
settlement: buyer1 → svcA, 1000
confirmation from svcA (the buyer's own leg): received 1000
access given by svcD
```

## 2. A film owner's seat (she is paid in the film's leg)
```
settlement: svcA → dana, 495
doer's report from svcA (the film's deal with svcA): in 1000, passed on dana 495, eli 198, the song 198, the sound library 99, fee 10 (×3, one per payment)
```

## 3. The song's service (paid in the film's leg, so a side of it: it is shown the film's whole split)
```
settlement: svcA → svcB, 198
settlement: svcB → svcC, 409
doer's report from svcA (the film's deal with svcA): in 1000, passed on dana 495, eli 198, the song 198, the sound library 99, fee 10 (×3, one per payment)
confirmation from svcC (the song's deal with svcB): received 409
confirmation from pat (the song's deal with svcB): received 174
```

## 4. A band member's seat
```
settlement: svcC → noor, 122
doer's report from svcC (the band's deal with svcC): in 409, passed on mia 165, noor 122, omar 122, fee 0
```

## 5. The same, each receiver shown only its own line (draft 14 item 9, the other reading)
```
settlement: svcC → noor, 122
doer's report from svcC (the band's deal with svcC), own line only: in 409, passed on noor 122, fee 0
```

## 6. The producer, under the reading that a call's signers are a side (item 9)
```
settlement: svcB → pat, 174
doer's report from svcB (the song's deal with svcB): in 594, passed on the band 409, pat 174, fee 11
confirmation from svcC (the song's deal with svcB): received 409
confirmation from pat (the song's deal with svcB): received 174
```

## 7. The same producer, under the reading that only those paid are a side
```
settlement: svcB → pat, 174
doer's report from svcB (the song's deal with svcB): in 594, passed on the band 409, pat 174, fee 11
```

## 8. The band signs its deal with svcC through its delegate
```
act: assent to "the band's deal with svcC" signed by mia, for: {"agreement":"15d984a7e6"}, under: the band's Terms
the band's Terms give the power: {"kind":"sign-deals","rule":"delegate:mia"}
draft 14's `for` field holds "the person in whose name the act is made" (3.2); here it must hold an agreement (P17: "how an act names an agreement in `for`")
noor and omar are paid by svcC under a deal they did not sign themselves; they are bound by it only through the band's Terms they signed (rule 5.1(b))
noor's seat: settlement: svcC → noor, 122 | doer's report from svcC (the band's deal with svcC): in 409, passed on mia 165, noor 122, omar 122, fee 0
noor "may inform the agreement she is under": to whom? the band has no inbox; its members are each a party; informing them is a path beyond her leg with svcC (11.6(a))
```

## 9. A partner of the film wants to see that noor was paid from the film's money: what the data cMIP's signatures must cover
```
the film's deal with svcA: Terms signed by svcA, dana, eli; whole report is data about svcA, dana, eli, svcB, lea; the path's line about svcA, svcB
the song's deal with svcB: Terms signed by svcB, pat; whole report is data about svcB, svcC, pat; the path's line about svcB, svcC
the band's deal with svcC: Terms signed by svcC, mia, noor, omar; whole report is data about svcC, mia, noor, omar; the path's line about svcC, noor
11.6(b): Terms naming the data cMIP must be signed by each leg's people: svcA, dana, eli, svcB, pat, svcC, mia, noor, omar (the band's by its own rule)
11.6(a): the people whose data it carries, if it carries whole reports: svcA, dana, eli, svcB, lea, svcC, pat, mia, noor, omar
if it carries only the lines on the path: svcA, svcB, svcC, noor
the two lists differ: lea is in a whole report but signed none of these Terms; dana, eli, pat sign Terms but are not on noor's path
the band's leg, where its Terms let a majority decide: omar outvoted is read as the rule he signed (11.6(b))
```

## 10. The buyer contests an undelivered purchase (11.8)
```
buyer1 holds: settlement: buyer1 → svcA, 1000 | confirmation from svcA (the buyer's own leg): received 1000 (no access given)
contest made within the film, naming the version read and the payment
it reaches the film's signers, one level: dana, eli
not the song's or the library's people, not svcA (the split), not svcD (the delivery)
dana passes it on: a contest of her own within the film's deal with svcD (delivery), signed by the film (dana, eli) and svcD: reaches svcD
the buyer's money meanwhile went down every leg: the film's leg paid dana 495, eli 198, svcB 198, lea 99
```

## 11. 3d: money owed under the minimum, later paid (reading: only those paid are a side)
```
svcC: in 41, passed on nothing, owed mia 17, noor 12, omar 12; addressed to: NOBODY
svcC: in 41, passed on nothing, owed mia 34, noor 24, omar 24; addressed to: NOBODY
svcC: in 41, passed on mia 51, owed noor 36, omar 36; addressed to: mia
svcC: in 41, passed on nothing, owed mia 17, noor 48, omar 48; addressed to: NOBODY
a report that only owes is addressed to nobody: under this reading the other side is whoever was paid, and nobody was
a later payout carries old owed money and new money in one amount; nothing in K8's row says which part settles which earlier "owed" line
```

## 12. The same, reading that the call's signers are a side
```
svcC: passed on nothing, owed mia 17, noor 12, omar 12; addressed to: mia, noor, omar
svcC: passed on nothing, owed mia 34, noor 24, omar 24; addressed to: mia, noor, omar
```
