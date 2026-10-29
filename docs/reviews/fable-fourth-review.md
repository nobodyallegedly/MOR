# Fable's fourth review: the redesign from bake to publication, judged against the way out

*Fable, 28 October 2026. Input: the bundle `MOR-fable-fourth-review-bundle` (MOR main at `c6865a7b`; the eight texts and the Rust core as they stand before the redesign; `context/design-note-bake-to-publication.md`, the decisions F397 to F401, the suite's items 10 to 12). What I checked: the design note and the decisions, whole; the current texts where the redesign lands (Identity rules 1, 7 and the genesis format; Envelopes type 0 and rule 24; Money rules 4, 7, 12 and 19; Agreements rules 10 to 17, 46, 48, 54 to 60, 73 to 76, 81 to 83, 91 to 95 and the formats they cite), read against the note. What I did not do: run anything, since nothing of the redesign exists in code, and read code beyond what the third review already read. Everything below is reasoning from the texts and the note, and every judgment is a recommendation for the MOR lead and Nobody, allegedly.*

## In plain words

**The verdict.** The redesign is sound and it is simpler than what it replaces: ownership says who owns, a publication says how a thing is sold and who takes what, and the two no longer share a document. Every exit I walked still holds, and two of them get easier (an owner leaving a work; a work carried to MOR 2), because the shares now live in one place and everything else reads them. The collective without a key of its own holds too, and removes more machinery than it adds: the member key, the founder's key, the key naming in signatures, the strands, all go, and what remains is one mechanism the texts already have, an act that names the collective in `objects` and is judged by Agreements.

**What must change before it is written in.** Five things, none of them a reversal.

1. **The default "every member acts alone" must not reach Money or decisions.** With no area named, the design lets any one member sign the collective's payee pointer, a payout or a record alone. Today those need the collective's key, which the key grammar holds as k of n; the redesign would quietly turn k of n into one of n for the money. *Sentence, Agreements rule 60: Where no area reaches an act, any one member acts alone for the collective, save a Money act (a payee pointer, a vault, an obligation, a payout) and a decision (a record, a grant, a revocation, a fork or a closing), which count under the constitutional change rule unless an area says otherwise.*
2. **A collective's genesis needs a signer.** Identity rule 1 says a genesis is signed by the signing key it declares; a collective declares none. *Sentence, Identity rules 1 and 7: A collective's genesis declares its founding agreement in place of a first signing key and is signed by the chain key it commits to; a chain key signs rotations, chain signatures and such a genesis, and nothing else.* A format change in Identity, before the freeze or never.
3. **The decisions chain needs an explicit link.** Records, grants and revocations were linked by the collective key's own sequence (`prev`); as members' acts they sit in the members' sequences. *Sentence, rule 58: Each decision names the previous decision in `objects`, as an action names the decision it acts under; a decision naming none, or one that is no decision of the collective, is no decision.*
4. **Shares by reference need one named version, and it is the receipt's.** "The version in force at each payment" is not a thing a verifier can read until a text says which act names it. *Sentence, in the publication's rules: a payment's shares are read from the version of the ownership agreement the split service's receipt names in its field 9 line, or, where its history holds a later complete version on that line, that one (as "the version in force for the act" is read today); a receipt naming a version on no line of the agreement the publication names is a wrong receipt.*
5. **A price tag under a publication is the publication's, not the uploader's.** If the publication names a tag the uploader signed, the uploader ends the collective's sales alone by withdrawing it. *Sentence: a tag a publication names is signed by the publication's split service, or by a party the publication designates, and names the publication; a tag signed by anyone else is nobody's offer under that publication. A payment naming such a tag is a purchase under the publication (rule 12), so a wallet that reads only Money can pay it and still make a valid purchase.*

The rest is wording, two format doors to leave open, and one admission question I answer in favour of the core with a note.

## 1. The way out

I walked each exit as acts, under the four-act shape and F401. "Holds" means every act the exit needs can be signed by someone who has the right to, and a verifier can tell it counts.

**An owner leaving a work.** Today: a stake transfer (rule 10), then the split plan inside the ownership agreement has to be cloned to pay the buyer. After: the transfer alone; every publication reads the shares by reference and pays the buyer from the next payment. *Holds, and is shorter.* One sentence to carry over from Q-A1 (F397): payouts become the buyer's once the transfer is complete, both signatures placed.

**A member leaving a collective.** Today: resignation, record, rotation (so the old collective key's later acts are void and the old member keys are replaced), clone. After: resignation, record, clone; the rotation of the chain key is needed only where the leaver holds a share of it, which is the key grammar's business, as now. A former member's acts "for the collective" after the line count for nothing by "Made before, made after", judged on the collective's line as today. *Holds, and loses one step for members who hold no share.* What it needs: the record's explicit link (above, 3), since the record is now a member's act and the line is read from the records.

**Succession.** The collective's ownership agreement carries the members' shares as a stake on the identity it founds (the design's "a collective always has shares"), so a vanished holder's stake passes by their plan (rules 81 to 83, F397's Q-A10 and Q-A22 as decided). The seat and the key share pass as rule 83 says; with no member keys there is nothing else to re-name. *Holds.* One thing the texts must keep saying: a single chain-key holder still needs a named successor and an escrowed share (rule 59); the redesign does not touch it and should say so, since "no key of its own" will be read by someone as "no key".

**Closing and fork.** Rule 91 signs them with the members' own identities under the constitutional rule, by chain signatures; the collective's key never produced them. After F401 a member draws the fork or closing act naming the collective and the members chain-sign it. "The collective holds nothing" now reads the ownership agreements of works that list the collective as an owner, which is cleaner than reading split plans. *Holds.* One gap: a publication whose owners' line names a closing collective's ownership keeps paying a dead pointer. *Sentence: a publication whose ownership agreement names a closed collective as owner, or names an ownership agreement that is itself closed, sells nothing from the closing's line; a payment after it is owed back.*

**An identity's rotation and escape.** Members: unchanged. The collective: its chain key as shares, rotations and the escape as today. *Holds.* With no signing key, the escape endorsement (section 11) "endorsed with the owner's current signing key" has no key to sign with for a collective: *sentence, Identity section 11: for a collective, the endorsement is signed by members meeting its constitutional rule, each with their own key, judged by Agreements.* Without it a collective at a hostile home has no way out but the homeless procedure.

**A refund owed back.** A payment racing a publication's ending: the design says owed back; it must say by whom. The split service received it and may have paid out. *Sentence: owed back by the split service from what it holds, and, past that, by each party of the publication in the share it received, each an open obligation (rule 30).* A contested purchase (F386): the contest names the buyer's claim, which names the publication's line; unchanged. A bypassed split service (Q-A3): the price tag is where the bypass now shows (a tag whose pointer is not the service's), and the decided sentence applies to the identity that received. *Holds, with the two sentences.*

**A work cloned across to MOR 2.** What must cross: the bake (bytes and hash), the claim, the ownership agreement. Publications are distribution and can be remade. Before the redesign the ownership agreement carried the split, the fees and the services, none of which MOR 2 would want to inherit. *Holds, and is the exit the redesign improves most.*

**Exits weakened:** none broken. The default rule (above, 1) weakens the money exit for a collective founded carelessly, and the genesis signer (above, 2) is a hole until written.

## 2. Collectives without a key (F401)

**How a verifier tells an act for the collective from one signed alone.** By the mechanism rule 58 already has: an action names the collective's identity as chain in `objects`, with the decision it acts under as predecessor. An act with that entry is for the collective; one without is the member's own. Nothing new is needed; what goes is the key that used to say the same thing twice.

*Forged:* anyone can write a collective's name in `objects`. It counts only where Agreements finds the signer a holder of the area the act falls in under the agreement in force at the cited decision, or a grantee whose grant backs it; otherwise rule 58's own words apply, "counts for nothing". A non-member's act naming a collective is shown as nobody's, which is also what happens today to a stranger's act naming a grant. *Denied:* a member cannot later say "that was mine" of an act whose bytes name the collective, nor can the collective claim a member's act that does not. The member's signature is their own key's; the attribution is in the signed bytes. Where it is weaker than today: an act for the collective sits in the member's own sequence, so it stays in the member's kept ancestry, and the member's rotation can disown it. That is Identity rule 34 and F302 exactly as for member keys today: what the collective's line placed stays, the disowned signature shown as a dispute. No change.

**After the signer leaves or is removed.** Their acts before the line stand where the line placed them; their acts after count for nothing; their own identity's acts are untouched. This is "Made before, made after" unchanged, and simpler to state, since there is no key to replace. One sentence should say it in F401's words: *a member's power ends at the collective's line that registers their departure; their own key continues to sign their own acts.*

**"No area named, every member acts alone."** It exposes the money and the decisions, and the founding client's warning is not enough, because the exposure is to the members from each other. Above, 1. I would also give the default a reason in italic: a collective of two artists who never thought about areas should not find that either can point its income at themselves because they never thought about areas.

**The genesis anchored with no key of its own.** Above, 2. The identity hash is still the genesis id; homes receipt it as any chain act; rule 7 gains one clause. The chain key is rebuilt from shares to sign the genesis, which is the same moment the key grammar already accepts for a rotation.

**Identity's everyday acts of a collective.** A collective has no key to sign a name, a route, a link, an encryption key or a witness act. Names, links and routes it can do without (a cMIP may name it; its homes are declared in chain acts). The encryption key matters: rule 57 seals some acts "to the collective" where a holder is a collective. *Sentence, rule 57: a collective is sealed to by sealing to each of its members, or by publicity; no act is sealed to a collective's own key.*

**F353's retired mechanics.** Member keys named in signatures, the binding to the signature act, "the holder's latest key", the key sealed to oneself, the strand per key: nothing needs them once an act names the collective and Agreements judges the signer. Two things to watch. Text rule 14's first case ("a collective's own key") goes and its second case ("a grant key") covers members, since a member's text for the collective names its decision as a grant key's text names its grant. Money rule 7's list of who signs a collective's receipt becomes one line: *a receipt of a collective is signed by a member or grantee for it, judged by Agreements.* And grant keys stay for what they were before F353, a person's scoped key for an app and a grant to a non-member; for a collective's grantee the same naming does the work, so rule 16 "Named by grant key" is reworded to "named by the publication".

## 3. Shares by reference

**Which version.** Above, 4: the split service's receipt names the ownership version its line read current, as a purchase names the claim's line today (rule 12), and the version in force for that receipt is the latest complete version on that line its history holds (line 105's rule). That is one act, named in signed bytes, read by the rule the texts already have. It is checkable.

**A race.** A share change and a payment at once: the receipt names one version; a clone completing concurrently is on the line but not in the receipt's history, so it does not apply to that payment and applies to the next. Nobody loses more than one payment's difference, and the trail shows which version paid.

**A fork of the ownership agreement.** Rule 47: the reference stays in force until settled, so a receipt naming a branch names a version not in force; it is a wrong receipt. *Sentence: a receipt naming a version of a fork other than its reference is a wrong receipt until the fork is settled.*

**An ownership agreement that does not exist, is void or is contested.** One that does not exist (rule 1): a publication naming it is signed by someone selling a work they do not own under an agreement nobody signed, and F397's Q-A12 decides it: the signer's own sale, shown outside, nothing owed back. A contest changes nothing (rule 54). "Void" is not a status an agreement has; its versions have it, and a version void for one signer's rotation is kept by reliance (rule 1175 as F397 fixed it).

**A publication naming an agreement later replaced.** If replaced by a clone, the line continues and the publication follows it, since it names the line (its founding version), never a version, as a party that is an agreement is named today (line 690). If the owners found a new agreement for the same work, the publication keeps reading the old one; the owners end it and republish. *Sentence: a publication names an ownership agreement by its founding version, and reads the line.*

**Can the texts state it so a verifier checks it?** Yes, with the sentences above; every input is an act the verifier holds or can answer unknown for.

## 4. The price tag and the bare bake

**Can a tag pay someone other than its signer's payee?** The tag names a pointer, and under F392's principle the signer's own signed act is what sends money there, so the payee is whoever's pointer it is and the seller is the signer. For a bare bake, that is how the uploader sells. For a publication, that is how the split service is paid. The one abuse is a tag on someone else's bake: *sentence, Money: a tag counts only when signed by the bake's uploader, or named by a publication as above; a tag by anyone else on a bake is nobody's offer.* Two tags by the uploader: *a tag is a versioned act, as a payee pointer is; the latest version counts, and a version with no price withdraws it.* A tag withdrawn under a live publication: with sentence 5 above the tag is the publication's side's, so withdrawing it is the publication's side ending sales at that price; payments after it are owed back as a payment racing the ending.

**A Money-only wallet.** It can bake and tag and sell an unclaimed work, as before. It can pay a tag. Whether that payment is a valid purchase of a claimed work is the point: rule 12 says a Money-only wallet cannot make one (line 476), and the design's "the price staying one Money act any wallet can pay" is true only if a payment naming the tag counts as naming the claim. Sentence 5 says so: the tag names the publication, so a payment naming the tag names the publication's line through it, and a verifier with Agreements reads it. Without that sentence every Money-only purchase of a published work is owed back, and the tag has bought nothing.

**The bare bake's stated cost** (a re-uploader receives tips and tag payments on their own bake) is right and should stay in Money's text in Nobody, allegedly's words; it is the same cost MOR has always stated for the carrier staying neutral (rule 7 of Agreements).

## 5. One act, two targets

One type, with the target deciding which rules apply, and the texts saying it once. A verifier tells them apart by the target's kind (a claim, or an identity), and the format rules are keyed on it as they are keyed on deal against collective today (collective-only fields refused in a deal): a work's ownership refuses areas, powers, key grammar and the fields that found an identity; a collective's requires them. The stake's object unifies too: the stake is on the target, a claim or the identity itself, which removes today's "object null" special case. What an exit reads: a closing or fork applies only to an identity target; a work's ownership "closes" when its stakes are all transferred or released, which rule 10 and rule 55 already give. One door to leave open: *the target is written `[kind, hash]`, kind 0 a claim, 1 an identity*, so a later MOR can add a kind without touching the act type. Distinct types would double every rule that both share (change rules, keepers, judges, succession, absence), which is most of them.

## 6. The MOR lead's answers, items 10 to 12

**Item 10, partner labels in the publication's format.** Keep, with the note under 8. Optional canonical text, nothing reads it.

**Item 11 (a).** Keep: a member change that changes shares is complete under the constitutional rule and every holder it pays less (rule 48), as today.

**Item 11 (b).** Keep: one act, two targets, as under 5.

**Item 11 (c).** Keep, with the version named as under 3; "the version in force at each payment" alone is not checkable.

**Item 12, withdrawals one per layer.** Keep all four. One addition: the publication's ending is "a later version that sells nothing", and a version is a clone every party signs (a publication is a deal); so one party cannot end a publication alone, which is right, and the tag's withdrawal (sentence 5) is the one-sided stop, which the publication's side holds. Say both in one place so a reader sees that the two stops are different people's.

## 7. Frozen formats

Doors that would close:

- **The ownership agreement's target** as a bare hash. Write it `[kind, hash]` (under 5).
- **A partner entry** as a tuple. Write it a map with numbered keys (identity, share, optional label), so a later MOR can add a key without a new act type.
- **The price tag** with the publication it names as a required field, or absent. Make it optional (`? n => hash`), so a tag on a bare bake and a tag under a publication are one format.
- **The split in the publication** as a fixed list. Keep the split plan's shape (parts in millionths, an order, a fee entry) as a map, and keep the retired field numbers of the ownership agreement (8, 14, 28, 29) retired, never reused, as the texts already do for 10 and 25.
- **The genesis's signing key** becoming optional is a one-way door the other way: once a genesis may omit it, every verifier must accept both forever. That is the price of F401 and it is worth it, but it should be written knowing it.

What the format should leave open: a kind on the target, a map per partner, an optional publication on the tag. Nothing else in the redesign closes a door that the current texts did not already close.

## 8. Admission test

- **The price tag:** core. It is the one Money act a wallet needs to pay for a work, so it is part of the shared language; without it in the core, two wallets would price differently and a verifier could not read a sale.
- **The publication carrying the split:** core. "Can anyone hide what they take" is the test, and the split is where the taking shows; a split in a cMIP is a split one client shows and another does not.
- **The split service by reference:** core, because it is a rule about where shares are read from, and a module that copied shares could pay the wrong owners.
- **Partner labels:** by the letter of the test, not core: nothing reads them and no guarantee rests on them. By the lead's reason, a reader of every client should see who takes what the same way, which is legible greed's own case. I would admit it as an optional text field and say in italic why it is there and that nothing reads it; the cost is one field, and the alternative is a cMIP every client must also implement to show a word.

## Sound enough to write in?

Yes, with the five changes above, none of which reverses a decision: each is a sentence the design implies and does not yet say. The redesign is simpler than what it replaces, and the simplicity is real rather than moved: the ownership agreement loses four fields and five rules' worth of distribution; the publication gains them, but it is where a reader looks for them; the collective loses three kinds of key and keeps one mechanism that already existed. Where complexity has moved is into Agreements' judging of every collective act, which was already true for member-key acts and is now true for all of them, and into Money, which gains an act (the tag) and a reading (a payment naming a tag). The one place it has grown is the stated cost that a client knowing only Identity, or only Money, can judge nothing a collective does; F401 accepts it in Nobody, allegedly's words, and I would write that cost into the MICS where the layers are described, not only into a rule.

What I would not write in without: the default kept away from Money and decisions (1), and the genesis signer (2). The first is the way out of a collective's money, and the second is whether a collective can exist at all under the Identity rules as written. The three others (the decisions link, the receipt's version, the tag's signer) are what makes the design checkable rather than only right, and should go in with it, since the session that writes it will otherwise choose them for the texts in code.

What I checked and what I reason: the texts and the note, read; nothing run, nothing of the redesign existing to run. Where I say an exit holds, it is a walk through the acts against the current rules as the note changes them, not a test; the session that writes it in should write each walk above as a freeze scenario, so that the way out is shown and not only argued.
