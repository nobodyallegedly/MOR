# The Agreements encoding, first edition: a fresh-eyes review

*Fable, 15 November 2026. A record of work, Fable's; it judges and does not fix, and decides nothing.*

**The wish** (Nobody, allegedly, `docs/decisions.md`, branch `claude/lead-records-2`): "I've decided for a total rewrite of agreements from scratch." "No translation, fresh from the research we had all agreed was excellent direction." On what must hold: "can I with a single click reward all the people that contributed to the service or good via MOR". And: "Building blocks over solutions." On this text, his words: "Maybe that should be properly defined first? We have the wording but not the actual code?"

*Read for sections 1 to 4, and nothing else: `encoding-1.md`; `draft-24.md`, its sections 3 and 10 whole and the grammar rules the encoding cites (G1.4, G2, G3.1, G4.2, G5.2, G6.1, G10.1, G10.4, G12.3); the vectors and their README. To open the vector acts I used the act-format helpers of `core/vectors/check.py` (decoding, the lock), which are not under review; every payload was then judged by hand against the text. Sections 5 and 6 were written after, from `encoding-1-report.md` and a reading of `core/src/agreements_new/`. The old Agreements, its code, its findings and its inventory were not opened. Nothing was compiled or run but my own decoder.*

## In plain words

**Can a careful stranger write correct bytes, and check them, from the two texts alone? Nearly, for the payload. Not for the act.**

The payload is well specified. I judged 25 cases by hand and reached the vector's verdict on 24, and the vector's rule is the one the text points to in all but two of those. The CDDL is closed, the lists have one order, and nearly every "anything else is rejected" names its rule. That is rare and it is good work.

Three things stand in the way tomorrow.

1. **The two texts are not enough by themselves.** An act needs an outside, a lock, a position, a running summary and a `prev`, and those are in Envelopes and Identity. The encoding says so honestly; the question as put ("from `encoding-1.md` and `draft-24.md` alone") has the answer no.
2. **The vectors teach two habits that will break a player's own lines.** Every act in them is written as its signer's very first act in the act format, and an author's assent is written as that signer's first act in the agreement, after the same signer's Terms.
3. **A few places where two honest writers produce different bytes**, or one writes bytes that pass and mean something else. The receiver is the sharpest.

## 1. Can the bytes be written from the text?

### What a stranger cannot write from these two texts

- **The act around the payload.** "its inside MUST carry `prev` with at most one entry (Envelopes rule 13), a position and a running summary as for any everyday act". None of that is here. Needed beside these texts: Envelopes, Part three; Identity's conventions; MICS for `tagged_hash`.
- **A cMIP's fingerprint.** its spec hash is over "its specification's encoded content, as Development gives it for its kind". A player who writes a stub cMIP tomorrow needs Development to name it.
- **A place or a clock.** "What it is the hash of is the layer's that gives places and clocks … no layer gives one yet." A player can write 32 bytes there and nothing can be answered from them.
- **An amount's value.** "as Money writes an amount": the unit's own decimals are Money's.

### Where two different byte strings can be written for the same act

1. **The receiver, when it is a signer.** `receiver = uint / hash`: a position names a party; a hash names "another agreement, by its root". A stranger who writes the receiving signer's identity hash writes valid bytes that pass, and are read as an agreement nobody knows. No note is given. And for a party that is an agreement, the position is the wrong form: "To name an agreement as receiver, whether or not it is a party, its root is written", while a position naming it means "no one receives by these Terms". So one intent has a right writing and a wrong one that also passes.

2. **A resolving update in one signer's line: which kind?** A Statement must carry a `kind`, and E20 says nothing of the kind of a Statement that only resolves. The vector writes an assent (`kind` 0, with `resolves` and `continues`). A second writer could as well write a contest, or a cMIP's kind. The bytes differ, and so may the meaning: is that assent also an assent?

3. **A resolving update of Terms: with or without parties, authors and body.** They "are required, except in an act written as a resolving update". So there they may be written or left out. The text does not say what they mean if written.

4. **A report's call made by default.** "the act that holds it (a payment), or the act standing for it (its settlement)". Two acts, two ids, one call. If the doer names the payment and the receiving side names the settlement, their call-refs differ.

5. **A report's `relies_on`.** "each is meant to be named in the field that says why it is named, and `relies_on` for the rest. The bytes do not refuse an act named in two of these fields". So the same report has several writings. The vectors' own leg report names its call's act again in `relies_on`.

6. **Two identical seats.** "The same party twice in `parties` (the same bytes) is rejected; two roles that are meant as two seats differ in their bytes (in their spot's parameters, for instance)". A writer who wants three identical seats must invent a difference, and each writer invents their own.

7. **A contest's content.** "a fingerprint is written as `hash`, inline as any value; the bytes do not tell them apart". By design, and still two writings.

8. **The body's words.** "the words' bytes as they are; for text, its canonical text as UTF-8". Whether a given body is "text" or "bytes as they are" decides the fingerprint, and the text does not say who decides.

### Where the text reads two ways

- **The order of the cases of invalid.** Section 9, step 7: "`rule` is the first of them, in the order of section 4's list (G2.1, then the roles' G10.1 and G2.1 by party, then G4.2, then G3.1)". Section 4's list is G2.1, G3.1, G4.2, G10.1. The sentence names one order and writes another. Two builders will name different rules for Terms with two faults.
- **A fault that fits two rules.** `[0, "A"]` as a party is rejected by E9 ("Anything else is rejected") and by E5 ("A fingerprint field that holds anything else is rejected"). Section 9 says of several reasons that "which one is not fixed by this text, so each rejected vector fails one rule only". But this is one fault under two rules, and the vector names one of them.
- **A held act that cannot be opened.** E23: "that act MUST be a Terms act or a Statement of this encoding, by the same signer … within the same agreement … Otherwise the act is **invalid**". And: "Where `previous` names no act held, the act counts". A private act held without its key is held, and cannot be shown to be either. The sentence as written gives invalid. The vector gives pass, with the line unchecked. The vector's answer is the sensible one; it is not the text's.

## 2. Does the text say the same as draft 24?

**In the fields, their presence and their kinds: yes, with one exception that is a choice and four smaller differences.** I compared every row of sections 3.1 and 3.2 with keys 0 to 19 and 0 to 11.

| # | Draft 24 | Encoding 1 | Judgment |
|---|---|---|---|
| 1 | "A field these tables do not give … are not read (G2.2)", and G2.2: "do not make the Terms invalid; a verifier says that it left them unread." | E4: "A key it does not list … makes the act rejected." | **A real difference in outcome.** Section 10, item 2 allows the bytes to choose, and E4 quotes it. But a reader of section 3 or of G2.2 alone expects "left unread", and gets rejected. One of the two texts should stop saying the other thing. |
| 2 | Section 3: a body or a cMIP not named by fingerprint "makes the Terms **invalid** (G2.2)". The sentence that says invalid is in G2.2. | E7, E8, section 4: "**invalid** (G2.1)". | The rule cited differs. The MUST is G2.1's and the verdict is G2.2's. Vectors compare rules byte for byte, so one must be picked. |
| 3 | `parties`, `authors`, `body`: "yes, except in a resolving update"; and "`resolves` is what makes an act a resolving update"; and an act with `resolves` and no `continues` "resolves nothing, and is read as an act like any other". | E19: excused only with both `resolves` and `continues`. | Draft 24 can be read either way. The encoding picks one and marks it [lead]. Right to mark. |
| 4 | A Statement's `kind`: "a socket (task K7): the fingerprint of the cMIP that says what a Statement of this kind states". Section 10, item 1: "or a fingerprint". | E15: `[cmip, params]`; a power's K7 kind matches "where its hash is the socket's `cmip`". | The encoding adds parameters to a kind, and a power then covers every parameter of that cMIP. Marked [lead]. |
| 5 | "an identifier (of a signer, a place or a clock)". | A signer is a fingerprint (E5's table); only a place and a clock are identifiers (E6). | Words only; the bytes are the same 32. |

Three things agree and are worth saying, because a stranger would doubt them:

- **A power of kind `replaces`.** Draft 24: "There is no kind `replaces`: an entry of that kind gives no power and is left unread". The encoding gives that kind a number, 4, so that the case can exist. Consistent. It does mean kind 4 passes with a note and kind 5 is rejected.
- **A K7 kind not named by fingerprint is rejected, not invalid.** Draft 24's exception is for "the Terms". A Statement has none. Consistent.
- **The report** has no fields in draft 24. Section 6 is a proposal under another spec hash, and says so in every paragraph.

## 3. Do the vectors say what the text says?

Twenty-five cases (one row holds two), each decoded and judged from the text before I looked at its answer.

| Case | What the bytes hold | The text gives | The vector gives | |
|---|---|---|---|---|
| terms: every optional field at once | 4 parties (2 signers, a role, an agreement), authors 0 1 2, in_force, 5 powers in order, place, clock, receiver 0, envelope and envelope_at equal, condition, control, a call, data | pass | pass | same |
| terms: no party named as a signer | one role of kind fits, author 0, in_force | pass | pass | same |
| terms: the receiver's index names no party | receiver 5, one party | pass, note G1.4 | pass, G1.4 | same |
| terms: a resolving update | replaces, agreement, resolves (2, sorted), continues one of them, previous; no parties, authors, body | pass (E19) | pass | same |
| terms: resolves and no continues | all three present, resolves only | pass, note G12.3 | pass, G12.3 | same |
| statement: an agreement's signature | kind 0, for `[2, root]`, under, no content | pass | pass | same |
| statement: a resolving update in one signer's line | kind 0 with resolves and continues | pass; the kind is not said (section 1, item 2) | pass | same verdict; the text does not fix the bytes |
| report: every kind of line | `[act, 6]`, six lines in all six forms, amounts summing | pass | pass | same |
| held: previous names a private act held without its key | third act's previous names an act that does not open | **invalid, G6.1**, read literally (section 1) | pass, note G6.1 | **differs** |
| held: a signer's next act names the one before | Terms, an assent with previous `[]`, a contest naming the assent | pass by E23 | pass | same; but see below |
| act: a text string not canonical (a socket's parameters) | inside does not open | rejected, Envelopes rule 5 | the same | same |
| terms: continues names no entry of resolves | | rejected, E19 | E19 | same |
| terms: a party named as a signer, not by a fingerprint | `[0, "A"]` | rejected, E9 or E5 | E9 | same verdict; rule fits two |
| terms: a role's spot that is not a socket | spot `5` | rejected, E7 (E10 points there) | E7 | same |
| terms: the same party twice | | rejected, E18 | E18 | same |
| terms: two calls for the same task | `[6,0]`, `[6,1]` | rejected, E16 | E16 | same |
| terms: replaces not a fingerprint | 31 bytes | rejected, E5 | E5 | same |
| terms: the body's cMIP not named by fingerprint | text in the socket | invalid, G2.1 by the encoding; G2.2 by draft 24's section 3 | G2.1 | same as the encoding; not as draft 24 cites it |
| terms: an author that is a party named as an agreement | authors 0 1, party 1 an agreement | invalid, G3.1 | G3.1 | same |
| terms: a party by role and no in_force | | invalid, G4.2 | G4.2 | same |
| terms: a role whose kind is text | `"done"` | invalid, G10.1 | G10.1 | same |
| statement: a K7 kind not named by fingerprint | `["a vote", null]` | rejected, E15 | E15 | same |
| report: a call for task 9; a line closing a line named badly | | rejected, E21; E22 | E21; E22 | same |
| held: previous names a held act that is rejected | a Terms act with no `previous` | invalid, G6.1 | G6.1 | same |

**One case differs** (a private act held without its key). **Two name a rule the text does not single out.** The rest agree in verdict and in rule.

**Two things the vectors show that the text does not ask for, and a player will copy:**

- **Every act is its signer's first act in the act format.** All 37 acts that open in `valid.json` carry `prev` `[]` and position 1, three acts by one signer in one case included. The checker does not look, rightly: that line is Envelopes'. But a player who builds acts the way the vectors look forks their own sequence at its first position.
- **An author's assent is written as a first act in the agreement.** In "a signer's next act in the agreement names the one before", the same signer signs the Terms, then an assent whose `previous` is `[]`. G6.1: "Every act within an agreement MUST name in `previous` its signer's previous act within the same agreement, or none if it is the signer's first"; and E23 counts the first Terms act as within its own agreement. So that assent's previous act is the Terms act. As written, the signer has two first acts in one agreement. The checker passes it, since a fork is the grammar's to see. I believe the grammar would see one.

## 4. What a player will trip on first

For the Dubsar Suite lead's briefing, in the order I expect them.

1. **Do not copy the vectors' `prev` and position.** They all show a first act. Chain every act to your identity's real sequence, as Envelopes says.
2. **Two lines, both written.** The act format's `prev` is your whole sequence. The payload's `previous` is your line in this one agreement. If you wrote the Terms, your assent's `previous` is the Terms act.
3. **Use the two spec hashes as given; never recompute them from your own copy.** `SPEC_DRAFT_24` is of the file "as it stands on this branch". One changed byte in your copy, and every act you write is "not this encoding".
4. **Name the receiver by position.** A signer's identity hash in `receiver` passes and is read as an unknown agreement. An agreement, party or not, is named by its root.
5. **A role needs three things and the Terms a fourth**: kind, `what` (not for future), a spot socket, and `in_force` on the Terms. Lack one and the Terms are invalid, not rejected: the act exists and counts for nothing.
6. **Every socket has two items. Write `null` for no parameters. Leave the field out for an empty socket.**
7. **No empty list, and sets in byte order.** `authors`, `relies_on`, `powers`, `calls`, `answers`, `resolves`. Use the library's `to_payload`; do not sort by hand.
8. **The maps are closed.** A field of your own makes the act rejected. Anything new goes in a Statement of a kind your cMIP defines, in its `content`.
9. **The first Terms act has no `agreement`.** Its own act id is the root. A Statement on the first version has `agreement` and `terms` equal.
10. **An assent and a counter signature carry no `content`.**
11. **A report is another act**: another spec hash, no `previous`, one call.
12. **"Pass" is the checker's word, not the grammar's.** It does not say in force, bound, received or valid.

## 5. The 18 questions

*Written after sections 1 to 4. The report's questions are cited by its numbers.*

**As the report leans (13):**

- **1, an unknown field is rejected.** Yes. And draft 24's section 3 and G2.2 should then stop saying "left unread" of a field, as the report itself suggests (my section 2, row 1).
- **3, `continues` naming no entry of `resolves` is rejected.** Yes.
- **4, two powers of one kind: any one rule saying yes is enough.** Yes, but it should be written. Two entries read as "either" widen a power, and a literal reader should find that sentence.
- **6, a K7 kind is its cMIP, whatever its parameters.** Yes.
- **7, `relies_on` naming what another field names is read once.** Yes.
- **8, `previous` naming a held act that cannot be opened: unchecked.** Yes. It is the one vector whose answer I could not reach from the text (section 3); E23 needs the sentence.
- **9, `previous` naming a held act that is rejected: invalid.** Yes.
- **10, a place and a clock as 32 bytes.** Yes, until the layer exists.
- **11, the bake's id in both fields.** Yes.
- **13, the report under the block's own hash.** Yes.
- **14, a Terms act written as a resolving update names `replaces` and `agreement`.** Yes; the vector already does.
- **17, a socket written as bare text is rejected.** Yes.
- **18, two identical roles cannot be written twice.** Yes: one role filled more than once.

**Otherwise (2):**

- **2, a resolving update that carries parties, authors or a body.** The lean is "left unread". I would reject. Bytes that state parties and words, pass, and mean nothing are what a literal reader trips on; and the text already has a strict form for the same act.
- **5, a receiver whose position names an agreement's entry.** The lean is to read it as "no one receives". I would not let that pass silently: it is on the path of the click, and an act that passes while the money has nowhere to go is the worst of the three readings. Reject it, or take that agreement as the receiver. With it belongs a case the report does not list: a signer's identity hash written as the receiver, which passes and is read as an unknown agreement (section 1, item 1).

**To settle before players write many acts (4 of the 18, and 2 that are not among them):**

- **12, the spec hash of a draft that will change.** Not which way, but that it is said aloud: the hash is of the file on this branch, the constant is what players use, and the file must not change by one byte while the round runs.
- **15, a resolving Statement's kind.** Players act in separate windows. A signer who starts a window without their last act will fork their own line on the first day, and the way out is this Statement. The lean ("the kind is that of the act it stands for in the line") does not tell me what to write; the vector writes an assent.
- **16, the payment or its settlement.** Two confirmations of one payment must name the same act to be tied. Until one is chosen, two honest halves can fail to match.
- **5,** above.
- **Not among the 18: the vectors' `prev` and position** (section 3). Every act is a first act. Either the vectors chain, or their README says in its first lines that they do not.
- **Not among the 18: an author's assent with `previous` `[]`** (section 3). If I read G6.1 rightly, the valid vectors show a fork in the signer's own line.

## 6. Where the report and the code change my view

**Most of what I found alone, the report already holds as open questions.** Its questions 1, 2, 5, 7, 8, 14, 15, 16 and 18 are my section 1, items 2 to 6, the unopened act, and section 2, rows 1 and 3. I count that in the text's favour: the author saw the same edges and declined to invent a rule. It also means section 1 is less a list of oversights than a list of what is knowingly open, and the players should be told which those are.

**What neither the report nor its stranger's reading lists:**

- a signer's identity hash written as the receiver (section 1, item 1). The code confirms it: the decoder takes any 32 bytes there as an agreement's root, with no note;
- the vectors' `prev` and position, and the author's assent with no `previous` (section 3);
- the order of the cases of invalid (section 1). The code settles which half of the sentence is wrong: `terms.rs` collects G2.1, then each role's G10.1 and its spot's G2.1 by party, then G4.2, then G3.1. So the parenthesis is right and "in the order of section 4's list" is not;
- G2.1 against G2.2 as the rule cited (section 2, row 2). The code's own words say "(G2.1, G2.2)" and its rule field says G2.1;
- one fault under two rules, E9 and E5 (section 1).

**One thing the report says that I would not say to the players as it stands:** "the vectors … show every form." They show every form of payload. They do not show an act chained into a signer's sequence, and they show one line that I think forks.

**What I did not do.** I did not compile or run the library, the tool or `agreements_new_check.py`; the README's claims about them (every answer the library's, the files regenerated in CI) are taken as stated. I read `terms.rs` for the two points above and no further; `statement.rs`, `report.rs`, `check.rs` and `mod.rs` I did not read line by line. I did not recompute the two spec hashes.

**My answer to the question, after everything:** a careful stranger with these two texts, Envelopes and the library's builders can write correct bytes tomorrow. With the two texts alone, they cannot write an act. And they can check their bytes only as far as "well formed and signed"; what the bytes mean is the next step, and the briefing should say so first.
