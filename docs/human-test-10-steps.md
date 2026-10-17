# Human test 10: a real collective on three devices, on separate homes

*17 October 2026. For Nobody, allegedly. Adapted by the project lead from the last section of `docs/real-collectives-report.md`, for the author's devices (a Mac, an iPad, an iPhone) and for members on separate homes (decided 17 October: "is there value in segregating them instead?"; "Ok"). Test identities only; no money.*

**Why separate homes.** Besides the collective itself, this checks that members find each other across homes: a proposal reaching an inbox on another home, signatures gathered from relays the founder never posts to, and each share delivered to a one-time key whose inbox is elsewhere. If something is not found, write down which act and on which device: that is the finding.

| Device | App | Homes and relays |
| --- | --- | --- |
| **A**, the Mac (founder) | Dub to make the identity, Edubba to bring it in and found | home1 only |
| **B**, the iPad | Dub on the web, Safari | home2 only |
| **C**, the iPhone | Dub on the web, Safari | home1 and home2 |
| The collective | (made by Edubba) | home1 and home2 |

**On the iPad and the iPhone:** no private browsing; do each member's part in one sitting (make, turn Signing on, sign, receive the share, write it down), since between signing and receiving the one-time key lives only in that Safari; and write the identity's signing words on paper too (Safari may clear a site's storage after weeks without a visit).

## Steps

1. **The Mac.** In Terminal, from the MOR folder: `git pull`, then `cd clients/desk && npm install && sh scripts/make-app.sh`, then `cd ../dub && npm install && sh scripts/make-app.sh`.
2. **Edubba's places (A).** Settings: homes `https://home1.dubsar.org` only; relays the same, only. The collective's own settings (under Constitution, its settings): homes and relays `https://home1.dubsar.org` and `https://home2.dubsar.org`.
3. **Three identities, made separately.**
   - **A, made in Dub on the Mac** (this also tests bringing an identity into Edubba, H15): open Dub, make a new identity with home `https://home1.dubsar.org` only, relays the same, display name "Nobody, allegedly (test)". Write the chain key's 24 words on paper, type the three asked. In the identity window, **Copy ID**, then **Show the signing key's words** and write those 24 on a second paper, labelled *signing key*.
   - **A, brought into Edubba:** Edubba, Identities tab, **+ A new identity**, **bring one you have**: its ID and the signing key's 24 words. Check: nothing is signed by bringing it; its record shows its homes, its display name and Dub's line of acts. From here on, sign as this identity in Edubba only, not in Dub, so the test stays clear.
   - **B (iPad):** open `https://dub.dubsar.org` in Safari. In the make form, homes: delete the prefilled ones and write `https://home2.dubsar.org` only; relays the same. Display name "B". Write the chain key's 24 words on paper, press the button, type the three asked. In the identity window, **Copy ID**, and send it to yourself.
   - **C (iPhone):** the same at `https://dub.dubsar.org`, keeping both homes as prefilled. Display name "C". Copy its ID.
   - If a home refuses a new identity (its daily limit), allow it on that home's management page, as before.
4. **The proposal (A).** Collectives tab, **+ Found a real collective**. Under **Contacts**, add B's ID as "B" and C's as "C". Name the collective, choose your test identity as founder, tick B and C. Keep the rules (any 2 of 3 rebuild the key; 2 sign a release; absence judged by 2). **Review the founding**, read it all, **Sign**. The list shows "1 of 3 signed".
5. **Signing off waits (B).** Private tab: "A proposal to sign waits … Signing is off". *(Across homes: the proposal from home1 has reached an inbox on home2.)*
6. **Each member signs (B, then C).** Identity window: tick **Signing**, read the warning, accept. Back to Dub, **Signing** tab. Read the proposal in full (who is bound, who decides what, how it ends, the risks, the words). **Sign it**, accept. It says "Signed", and that the share comes later. Keep the tab open, or at least do not close Safari, until step 8.
7. **Founding (A).** On the founding, **Look for answers**: "3 of 3 signed", each with "one-time key received". *(Across homes: B's signature found on home2.)* Press **Found it: deal the shares**. Then **Show** your own share: write its number and 24 words on paper, press **It is written down**, type the three asked.
8. **Each member's share (B and C).** Signing tab, **Show my share of the chain key, once**. Write the number and 24 words on paper, labelled with the collective's name. Compare the dealing's fingerprint on the three devices: the same. Press **I have written … down**, type the three asked: "the one-time key is destroyed". *(Across homes: B's share, sealed on home1's side, opened on home2's.)*
9. **Nothing kept.** On B, reload the page: the share is not shown again ("Your share is written down"). Three papers are now the only place the chain key exists.
10. **A release (A, then B or C).** On A, the collective's page, **A release**: a small folder with one text file, a name, version 1. **Review the release**, **Sign**. On B or C, Signing tab: read it (its files and fingerprints), **Sign it**. On A: **Check it as anyone would**: it counts, signed by 2 members.
11. **A member change (optional; its rotation waits for Kišib).** On A, **Change its members**: keep all three and add a fourth test identity (made in Dub on any device). **Review the change**, **Sign**. B, C and the fourth sign in their Signing tabs. On A, **Look for answers**: every signature in, "it waits for Kišib". Keep those Safari tabs' storage as it is: Kišib will send the new shares there.
12. **Report.** One line per observation: what you did, what you expected, what happened, how it felt. Mark anything not found across homes with the act, the device and the home.
