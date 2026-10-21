# H80, its siblings, and H79 reopened: the report

*21 October 2026, a Dubsar Suite session. Branch `claude/h80-signing-after-key-change`. Findings F362 (this session) and F361 (the decision on H79). Author: Nobody, allegedly.*

## 1. In plain words

**What was wrong.** An identity has a signing key, held by the apps, and a chain key, kept on paper and used only in Kišib to replace the signing key. After you changed an identity's keys in Kišib, every app should notice that the key it holds is retired, and refuse to sign with it. Dub did. Edubba noticed in some places and not in others: relying on an act was one of the places it did not check, so it signed your reliance with the retired key and told you it was signed. A correction did check, so it was refused, but the refusal did not show you where to give the new words.

Looking through every app for the same mistake found more of them. In Edubba, almost everything outside drafts, agents and corrections skipped the check: founding a collective, changing its members, its money, a keeper's record, publishing a work or a vow, contesting or confirming a sale, delivering a key, preparing a payment for Damgar. In Dub, two places: contesting a vow's sale, and delivering the key of a sealed post you sold (which Dub does by itself every time its page refreshes). In Damgar, one: a promise to pay from a collective. Ummia checked everywhere.

**What is fixed.** Every one of those places now checks first. Each refuses with the same plain words its app already used, and nothing is signed or sent. In Edubba, the box to give the new signing key's words now appears right under the warning, wherever the warning appears: one step, not a hunt through the Identities tab. The same holds for a collective whose own key Edubba holds, after Kišib changed it.

**What became of the reliance signed with the old key.** I reproduced it on test homes; the live homes' addresses are not in the repository, so I could not read your own. The homes and the relay accepted and stored it, because a home only checks that a signature matches *some* key the identity once had. But every verifier, the core library included, calls it **void**: it was signed with the old key after the change, on a line the change did not keep. It relies on nothing, and nothing relies on it. The rules that say so already exist, so nothing here touches the core.

**H79: new chain words at every change of keys.** As you decided ("A rotation generates two new sets of keys, chain and signing"), Kišib now makes a new paper at every change of keys. As you then decided ("confirming the new chain key comes before signing the rotation, confirming the new signing key can come after"), it shows the new chain key's words first, before anything is signed; you write them down and type three back, and only then does it sign the change and send it. Once the homes accept it, it shows the new signing key's words (for the apps). After each set, three words are asked back and then Kišib forgets them. Until the homes accept the change, the old paper still works, but only to send that same change again; after, it is spent and can be destroyed. The old paper typed again is refused, in plain words. The new paper makes the next change. Your identity T, whose last change reused its paper, changes once more from that old paper, and Kišib's screen says so; that change gives it a new paper.

Question 1 is answered (the quotation above): the risk it raised, losing the new paper if Kišib closed between sending and writing, is gone. Kišib closed after the new words but before the change is sent has signed nothing: the next sitting starts over with another new paper, and the unused one is worthless. Closed after sending, the new paper is already written: if the signing key's words were lost, the new paper makes the next change.

## 2. Every signing path, per app

"Checked" means it already checked before signing; "fixed" means it did not, and now does. Every fixed path refuses with its app's words (Edubba `KEY_CHANGED_SAY` or `COLLECTIVE_KEY_CHANGED_SAY`; Dub, Damgar, Ummia their `SPENT_SAY`) and "Nothing was signed".

### Edubba (`clients/desk`; the web Edubba runs the same code)

| Path | What it signs, with which key | Before | Now |
| --- | --- | --- | --- |
| `Desk.witness` (op `witness`, the reliance) | Identity witness act, own key | **no check, no pending check** | **fixed** (`keyCurrent`, and the pending check the other `Desk` signers make) |
| `Desk.publishName` (agents' names) | Identity name act, own key | checked | checked |
| `Desk.approve` (drafts from Claude) | the draft's act, own key | checked | checked |
| `Desk.signAndSend`: corrections, an agent's prompt, terms, answers, picks, nudges, grants published, accepted and revoked | own key | checked | checked |
| `Desk.sealToSelf`: an agent's notes, diary, retirements | own key, sealed to itself | checked | checked |
| `Desk.createIdentity` | a new identity's own new key | not affected (new key) | — |
| `real.ts` founding (`real confirm` of a founding) | the terms, the founder's signature, member key sealing, invitations: founder's own key | no check | **fixed** |
| `real.ts` `found` | shares sealed and members told: founder's own key | no check | **fixed** (before anything is dealt) |
| `real.ts` member change | the clone, the signature, invitations: proposer's own key | no check | **fixed** |
| `real.ts` money proposal | the grant: **the collective's own key held here**; the clone: founder's own key | no check | **fixed** (both keys) |
| `real.ts` `recordMoney` | the record: the collective's own key | no check | **fixed** |
| `real.ts` payee pointer (after the record) | a member key (not affected), then the other holders asked with the signer's own key | no check | **fixed** (said as a line under the record, which stands) |
| `real.ts` `keep` | a keeper's record: the keeper's own key | no check | **fixed** |
| `real.ts` `registerResignation` | the record: the collective's own key | no check | **fixed** |
| `real.ts` collective release | unreachable (releases are Ummia's, op refuses) | — | fixed anyway |
| `publishing.ts` a work, or a vow, as oneself | publication, grant, terms, offer, post: own key | no check | **fixed** |
| `publishing.ts` as a collective | member key | not affected | — |
| `publishing.ts` `contestSale`, `confirmSale` | own key | no check | **fixed** |
| `publishing.ts` `deliver` (own works) and under a deal | key delivery, own key, through Dub's `delivery.ts` | no check | **fixed** (the shared helper now *requires* the app's check) |
| `publishing.ts` a collective's key delivery | member key | not affected | — |
| `money.ts` `pay`, `ask` (anchoring) | a draft sealed to oneself for Damgar: own key | no check | **fixed** |
| `kishib.ts` `renewIdentity` | the new encryption key, with the new key just checked | not affected | — |
| `member.ts` (Dub's code over Edubba's identities) | own key | checked (Dub's `current`) | checked |
| `machine.ts` answer under a grant | the grant key, in the owner's name | not affected: bound to its grant, which stays valid while the owner's line holding it is kept | — |
| `collectives.ts` (test mode's collective client) | its own test identities, chain keys in software, never changed in Kišib | not affected | — |

The check itself also changed: it reads the identity's own homes as well as those in Settings (an identity brought from elsewhere), and refuses where the homes disagree about the keys (contested), as Dub does. It still lets an act through when no home answers. In that case, an act that goes through Edubba's sending is checked again after signing, and a reliance that no home took is said to have gone nowhere.

### Dub (`clients/dub`, desktop and web: one code)

| Path | Key | Before | Now |
| --- | --- | --- | --- |
| `setName`, `post`, `message`, `signProposal`, `declineProposal`, `leaveCollective`, `moneyDraft`, `relaysPublish`, `laneAsk`, `sell`, `repost`, `syncFollows`, `publishList`, `withdraw` | own key | checked | checked |
| `contestVow` (op `vow contest`) | own key | **no check** | **fixed** |
| `moneyLook` → key delivery (`delivery.ts`; runs by itself on every refresh) | own key | **no check** | **fixed** (refused, the page shows its "new words" box) |
| `confirm` (a new identity), `renewHeld` | the key just made, or just checked | not affected | — |
| `signProposal`, `cosignAsMember` | a member key | not affected (behind the check anyway) | — |
| tips, buys, paid, vow confirmation, payments | a lane key, through Damgar's engine | Damgar's check runs before the lane is chosen | checked |

### Damgar (`clients/damgar`, desktop and web: one code)

| Path | Key | Before | Now |
| --- | --- | --- | --- |
| `setAccepted`, `publishList`, `publishPublic`, `deliver` (every sealed send: answers, invoice requests, receipts, obligations, claims), `grantLaneActs`, `revokeLane`, `publishRails` | own key, or a lane key chosen after the check | checked | checked |
| `afterSale` | own key | covered by `deliver`'s check just before | checked |
| `collectivePromise` | a member key, then the other holders asked with **the own key** | **no check** | **fixed** (checked first, before the collective is read) |
| lane (grant) keys | bound to the grant; it survives a change of keys only if the line holding the grant is kept (`LINE_SAY`) | — | not affected by the check itself |

### Ummia (`clients/ummia`, desktop and web: one code)

Every path checks first: specifications and MIPs (`confirm`), MIP drafts, bug reports, the accepted list, releases as oneself and as a collective (the member key and the own-key negotiation, both behind the check), anchoring. Nothing fixed.

### Kišib

It signs with a signing key only from words typed at that moment: the escape endorsement (by design the key held *before* the contested position, Identity section 11), the successor's confirmation and a member's share (both checked current by `lookCurrent`). Not affected.

### H79: every path that changes keys from paper

| Path | Fresh paper now? |
| --- | --- |
| A change of keys (`rotatePlan`) | **yes**: key *n* of a fresh seed at the rotation at position *n*; its words confirmed before signing, the signing key's after the receipts |
| The vault (the same rotation, its door) | **yes**, the same path |
| A succession named in a rotation | **yes**, the same path |
| An escape's homeless rotation (`escapePlan`) | **yes**: the stolen paper above all must not make the next key |
| A collective's rotation | **already yes**: `dealChainKey` makes a fresh seed (`fresh_dealable_seed`) and deals new shares at every rotation; unchanged |
| The genesis client's own rotation (command line) | a fresh software chain key, not paper; unchanged |
| The successor's confirmation | uses no chain key |

*Reading taken:* "its first key" is key *n* of the fresh seed, where *n* is the rotation's position. That is the air-gapped Module's key index, which holds "even across a fresh seed"; the words seed Module derives keys by that index. Kišib finds the index by looking, so the choice is invisible to the person. The air-gapped signer Module's next draft (a fresh seed as the rule) was handed to the Suite lead's S3 work (F361), and is not written here.

## 3. For the MOR lead

**Nothing that changes a verdict.** The reliance signed with the retired key is void for the core library's verifier (Identity draft 14, rules 34 and 35). Reproduced: one reliance before the change valid, the one after it void; the chain resolves genesis then rotation, each counting.

One line, for information only. A home stores an act signed under a binding that a counting rotation replaced, because its check (`check_binding`, `relay/src/node.rs`) compares the signature with the key *its own binding* set, retired or not. A home cannot easily tell a late act inside the kept ancestry (which it must take) from one outside it. Under the leads' correction of 21 October, the relay transport cMIP is the Suite lead's, so this is not the MOR lead's to decide. No home was changed.

## 4. Questions for Nobody, allegedly

**Question 1. When should Kišib show the new chain key's words?** *Answered by Nobody, allegedly, 21 October 2026:* "From a safety point of view, confirming the new chain key comes before signing the rotation, confirming the new signing key can come after." Built on this branch: at a change of keys, the vault, a succession named in a rotation and an escape, the fresh seed is drawn and its words shown, written and three typed back; only then is the change signed and sent. Said on the screen before the words: the new paper counts once the homes accept the change; until then the old paper still works, but only to send this same change again. Given the old paper while a change it signed waits for its homes, Kišib offers only "Send the same change again", signing nothing. Closed before the change was sent, nothing was signed: the next sitting starts over with a new paper, and the unused one is worthless (also said by "Check paper words").

**Question 2 (open; the Suite lead takes it up separately). Private lines Kišib cannot place.** While testing Damgar, Kišib could not tie two private acts at a member's homes (one Edubba's, one Damgar's) to the cards those apps show. The latest act each card names never reached the homes. Left out, those lines took the member's own key for a collective with them, and Damgar then said "No key of yours for this collective". It is not caused by this session's changes, and is not fixed here. **My lean: a Suite session makes every app leave each private act's locked act at the identity's homes (Identity rule 35), as Edubba's draft path already does, so a card always names an act the homes hold. Until then, Kišib's review warns, in red, that a member key may live on a line it cannot place.**

*Answered by a Suite session, 21 October 2026 (F371): every app now leaves each private act at the identity's homes, its key delivered to the identity, each card names an act the homes hold, and Kišib places every line, or says in red why it cannot. The H80 case passes: the member key is kept. See `docs/private-lines-report.md`, which also raises what is left: a public act behind a private act on one line (its question 1).*

## 5. Human test steps (on the Mac)

*Checked against the READMEs of Kišib, Edubba, Dub and Damgar as updated here. Test identities only. The web clients at `*.dubsar.org` stay as they are until released and served by a later machine session, so test the Mac apps.*

1. **Bring the Mac up to this branch.** In Terminal, from the MOR folder: `git pull`, then `cd clients/genesis && npm install && npm run wasm`, then `npm install` in `clients/desk`, `clients/dub`, `clients/kishib`, `clients/damgar` and `clients/ummia`, and rebuild each app as its README says (`sh scripts/make-app.sh`).
2. **A test identity.** In Dub, make a new identity and write its chain key's 24 words on a paper: *paper 1*. Bring it into Edubba (Identities, by its ID and signing key's words), Damgar and Ummia.
3. **Before.** In Edubba, rely on someone's act (Rely on an act, type RELY): it is signed.
4. **The change of keys, in Kišib.** Change an identity's keys, with paper 1. The review says a new chain key comes "from a new paper", shown first, and that only then is the change signed. Press **Sign it**: the screen says "Nothing is signed yet", and that the new paper counts once the homes accept the change, the old one until then only sending this same change again. Press **Show the new chain key's words (a new paper)**, write them on *paper 2*, press "I have written them down", type the three words asked: only now is the change signed and sent. When the homes' receipts are in, **Show the new signing key's words**: write them on another paper, three words back. Kišib then says it holds nothing.
   - *Optional, closing early:* start a change, show the new chain words, then close Kišib before typing them back. Reopen: the identity's keys have not changed (its record says so), "Check paper words" with that unused paper says it is not the words needed (a new paper whose change was never sent is worthless), and paper 1 starts over with another new paper.
5. **Edubba refuses, and offers the words right there.** Open Edubba before giving it anything. A warning on opening names the identity, with the box for the new words under it. Rely on an act again: refused, "This identity's signing key was changed elsewhere … Nothing was signed.", and the box appears right under the refusal. Type paper 1's words in it: refused, the box stays. Type the new signing words: "The new signing key is taken". Rely again: signed. Try a correction, or "Pay someone", before giving the words if you like: the same refusal.
6. **Each other app.** Dub, Damgar and Ummia each say the key was changed elsewhere and refuse to sign; each takes the new signing words in its box ("Use the new words" in Dub; "take the new words" in Damgar's and Ummia's identity window).
7. **The old paper no longer works.** In Kišib, Check paper words with paper 1: "These words are spent". Change an identity's keys with paper 1: refused, "These are an earlier chain-key paper of this identity …". With paper 2, Check paper words says "These are the right words".
8. **The new paper makes the next change.** Change the keys again with paper 2: it works, and shows a *paper 3* and new signing words. Paper 2 is then spent.
9. **T, from sitting 5.** Change T's keys with its old paper (the one it was made with). The review says, among what changes: "This paper already made an earlier change of these keys … This change is its last." After it, T has a new paper, and the old one is refused.

## What changed, file by file

- `clients/desk`: `src/desk.ts` (the reliance checked; `keyCurrent` public, reading the identity's homes and refusing a contested chain; `collectiveKeyCurrent`; `COLLECTIVE_KEY_CHANGED_SAY`, `CONTESTED_SAY`), `src/real.ts`, `src/publishing.ts`, `src/money.ts` (every path checked), `src/ops.ts` (`keys check` lists real collectives too), `src/page/ui.ts`, `src/page/view.ts` (the box for the new words under the warning); tests `test/h80.test.ts` (new), `test/edubba-setup-browser.test.ts`, `test/real.test.ts`; README.
- `clients/dub`: `src/delivery.ts` (the app's check required), `src/money.ts`, `src/dub.ts`, `src/page/ui.ts`; `test/dub.test.ts`; README.
- `clients/damgar`: `src/damgar.ts`; `test/collective.test.ts`, `test/vault.test.ts`; README.
- `clients/kishib`: `src/kishib.ts`, `src/words.ts`, `src/common.ts`, `src/shapes.ts`, `src/page/ui.ts`, `src/page/view.ts`; tests `identity`, `rare`, `browser`, `vault-door`, `world` (`newWords`); README (reading 1 replaced, readings 2 and 3, costs, tests).
- `clients/ummia`: `test/kishib.test.ts` (both sets of words).
- Records: H79 and H80 in `docs/human-tests-v1-findings.md`; F362 in `docs/findings/MOR-findings-log-round-2.md`.
