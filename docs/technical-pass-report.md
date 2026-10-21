# The technical pass on the freeze-ready texts: report

*For Nobody, allegedly, to approve with the freeze-ready texts. Written by the technical pass (S1b), on the branch `claude/freeze-ready-texts` (pull request 83). The prompt is `docs/lead/prompts/s1b-technical-pass.md`; the progress file `docs/technical-pass-progress.md`. Texts only: no code, test or vector changed.*

## In plain words

**What a verifier in C can now do that it could not before.** S1's readers found the texts saying *what* to check without always saying *exactly how the bytes look*. This pass wrote the bytes down, reading the core library for each format and keeping every published vector right:

- **Decode any act strictly.** The one way to write data (deterministic CBOR) is written out once, in Identity, with every rule a decoder needs: shortest forms, ordered and unique map keys, floats in their shortest form, how deep data may nest, what a tag or a simple value may be. The conventions every format follows are written beside it: closed maps, optional fields, what `uint`, `hash` and `tstr` mean, what happens to an unknown key. These match the core and `core/vectors/cbor.json` exactly (floats, tags and simple values are allowed by the encoding, as the vectors require, and refused by every format that does not allow them).
- **Compute every hash.** Every tag the core uses is listed. A MIR's spec hash is one rule: the hash of the map `{0 => 4, 9 => text}`, the text being the frozen file with at most one final line break removed and its header reduced to the text's name at the freeze. The running summary is written once, exactly as the published vectors compute it: an act carries the summary of the acts before it; a rotation records, for each kept tip, the summary including it.
- **Read what Identity's acts point at.** What each Identity act names in `objects`, which inside fields an identity-chain act carries, the escape endorsement's format, log positions counted from 0, the Merkle tree byte by byte, and inclusion and consistency proofs in a fixed encoding. How a home is asked for them is left to the relay transport cMIP, as decided.
- **Decode a specification.** Development now says how a specification's content is decoded, field by field and kind by kind, as the core decodes it. It also says when content is "no specification", and what a unit and a signature scheme must say (both proposed, below).
- **Give the decided verdicts.** The decisions F363 to F368 are written in:
  - a keeper's record counts for every act that belongs to its agreement, with "belongs to" defined once;
  - an anchor shows a deadline met, and only a keeper's anchored silence shows it missed;
  - a keeper's later rotation never undoes what its records placed;
  - an act a revocation missed, shown disputed, confers nothing unless the grantor adopts it;
  - Money rule 7 lists every Money act a member key may sign;
  - the smaller points: an act under a pending rotation is pending; dishonesty as rule 45 says; Text rule 14 at a Text-only verifier.

  The "to confirm" marks are gone.

**What is still missing.** Eight questions, below. None is a flaw at the foundations. Three need a decision before a verifier can be sure of a verdict: question 1 (a missed deadline with several keepers), question 4 (how a decoder knows a Module is under "the payment cMIP") and question 7 (a text signed with a member key can never count as written). The strangers also listed smaller gaps that predate this pass (duplicates inside arrays, an operator running several relays, a few Money edges). They are kept in `docs/freeze-ready-strangers/technical-pass.md` for whoever decides how far the texts go before the C session.

**What changes for the code (the next session).** The texts now say several things the core does not yet do:
- the keeper record and "belongs to";
- deadlines met and missed;
- the contest's format for every act;
- Text rule 14's check of one object whose chain is the signer;
- the final line break in a MIR's hash.

The core already agrees with everything written here about encoding, hashes, proofs, routes, Identity's formats and Development's decoder. It was read for each.

## Precisely, text by text

### Identity draft 15
- **Part three, "Encoding and conventions"** (F369.3, .14):
  - deterministic CBOR as eight numbered rules;
  - tags and simple values (a tag's content decoded and checked as any item, its meaning never checked);
  - the CDDL conventions (closed maps; optional is absent, never `null` unless written; `uint`, `bstr .size n`, `hash`, `tstr`, `true`, `any`; arrays; a payload's `{ * any => any }` closed by its type);
  - "where a format says a value is written as absent, writing it is invalid";
  - every tag listed;
  - plain SHA-256 only for the locked hash, the log's tree and `XWING`.
- **Spec hash** (F369.5): `{0 => 4, 9 => text}`, pointing to Development rule 26; the Parameters line reworded.
- **Words:** "Everyday act" defined (F368, question 18); the kept tip's summary.
- **Everyday check 2:** a binding to a rotation not yet counting makes the act pending until it counts; once the rotation can no longer count, the binding names no act that counts (F367.1).
- **Rule 44, "Conflicting receipts" step 3:** aligned to rule 45 (F367.2).
- **The evidence rule:** Agreements' exception for a keeper's record (F364.2), in Agreements rule 42's words; the dependence on it named in "Dependencies".
- **The scoped key:** a holder's member key and its holder's rotation (F366.2).
- **"Re-homed without audit":** one list (F368, question 6).
- **Part three, more formats:**
  - what each Identity act names in `objects` (a table; the homeless path's acts check the chain, as the core does);
  - the inside and outside fields an identity-chain act carries or leaves unread;
  - rotation field 1 from 1, and field 11 needing field 6 (rotation check 4);
  - the escape endorsement's CDDL, and its binding where the act before is a chain signature (as the core reads it);
  - log positions from 0 and the RFC 9162 tree;
  - **"Proofs, as a verifier is handed them"**: `inclusion-proof = [summary, receipt, index, path]` (the relay transport cMIP's own encoding) and `consistency-proof = [old, new, path]` (proposed), what is checked, and that a failed proof proves nothing;
  - scheme values and key lengths (wrong lengths invalid, as `sig.rs` does); SLH-DSA pure, its context the bytes `MOR`;
  - routes: version 0 invalid, two versions 1 contested from the start, the kind written as absent;
  - the default majority as ⌊n/2⌋+1 operators, and a single operator;
  - a `mor` successor's 32-byte identifier.
- **"Parameters":** how a home is queried, left to the relay transport cMIP (F369.1).

### Text draft 11
- "Text field" defined: every CBOR text string anywhere in an act, as Text rule 1 and the core (`text::check_value`) have it. This is not the reading S1 leaned to; see question 5.
- Unicode 17.0, as a number (F369.7).
- Rule 14: the grant-key case decides for a grant key, a member key included (F366.3); a Text-only verifier answers unknown for one object of either allowed shape, invalid otherwise (F367.3).
- The freeze line on `objects`.

### Envelopes draft 11
- Rule 1 points to Identity's encoding.
- "Everyday act".
- **"The running summary"** written once, as `S(n)` (F369.16): the act at position p carries S(p−1); a rotation's kept-tip entry carries S(p); `core/vectors/running-summary.json` and `sequence-three-acts.json` agree.
- An act missing position or summary is judged as a misfit, as the core does.
- The act's key 6 comment.
- X-Wing: revision 11, fixed by its SHA-256 `XWING` at the freeze (F369.8).
- The encryption key's versions as routes', and a wrong-length X-Wing key invalid (as `envelopes.rs` decodes).
- The anchoring task says "clock" (F368, question 15).
- Finding deliveries left to the relay transport cMIP.

### Money draft 11
- **Rule 7** (F366.1, .2):
  - every Money act of a collective (pointer, obligation, receipt, claim, release) may be signed with a member key whose area reaches its type;
  - each is judged by Agreements under that area, or on the collective's own signature where none reaches it;
  - the member key counts as Agreements rule 73 says;
  - a split service's grant is judged under the area that issued it;
  - a receipt or claim a revocation missed, shown disputed, is treated as a disputed act after a change of keys (F365).
- **Rule 4:** a pointer outside a fork counts for payments before the ending's line (F367.4); a refund rail meets its first two conditions (F368, question 21).
- **Rule 12:** records of one payment for one purpose are no shares of it (F368, question 23). The first wording of this pass made a payer's second claim cancel both; a stranger found it, and it is corrected.
- **Rule 29:** by role, the clocks named only as examples (F368, question 53).
- **"Dependencies":** Money decodes Development's specification format for a rail Module, and nothing more (F367.9).
- The unit points to Development's kind 2.

### Agreements draft 17
- **"Belongs to"** defined (F363); the keeper's words entry; rule 7 (a keeper of an agreement both claims belong to); rule 42's third condition; the keeper record's checks.
- **Rule 33** (F364.1): met by an anchor of the act; missed only by a named keeper's sequence anchored past the point holding no record up to that record; otherwise undetermined.
- **Rule 37:** a keeper MUST keep one sequence (F364.4).
- **Rule 38:** each record judged against its own keeper's record of the rotation, the rule `[0]`, `[1, k]`, `[2, operators]` counting them (F364.3), the CDDL comment matching `Rule::fits`.
- **Rule 41:** the rotation's record as a point only.
- **Rule 42:** a keeper's later rotation never undoes what its records placed (F364.2).
- **"Made before, made after":** a declaration's line decides only what no relied-on version holds (F364.5).
- **A revoked grant's acts** (F365): rule 76 (what a disputed act confers, adoption of a void or disputed act), rule 79, rule 6, the tie rule (words and point 7), point 2, the grants' freeze scenarios.
- **Member keys** (F366): rule 73 (in force, until replaced or the holder leaves; the holder's change of keys; the holder's rotation; reach by the agreement in force; a grant to oneself accepted by type 1); rule 74 (the split service's grant); rule 80 (a person's grant, a member key); rule 60's pointer to Money rule 7.
- **F367.6, .7, .8:**
  - format rules and status rules ("Dependencies"; an over-sale is valid and confers nothing);
  - genesis and rotations outside any area (rule 60);
  - task 14 judicial (words, rule 60, "A judge never handles what it judges");
  - fork completeness checks non-member holders' chain signatures;
  - record field 3 lists take-ups;
  - the tiers table carries fields 26 and 27;
  - rule 85: no outcome against a holder with a stake successor;
  - rule 83: a clone marked with the plan alone that changes more is invalid (suite step 3.8b with it).
- **F368:** every "to confirm" reading written as a rule; rule 70's split service; the contest's format for every act, "Still open" removed (questions 26, 28, 29).
- **Rule 91 and "Fork (type 19)":** the pointer outside an ending; the fork's tie key written as the core computes it (`tagged_hash("MOR/law/leftover", [fork act's id, successor])`, smallest first).
- **Freeze scenarios:** three keeper lines.

### Development draft 11
- **"How the content is decoded"** (F369.3, question 38): the decoder of `development.rs`, written out:
  - keys 0 to 13;
  - per-kind fields: 1 absent on kinds 4, 6, 7 and required elsewhere; 5 only on a Module; 8 on a MIP; 11 and 13 together, only on a Module; 12 only on a cMIP; 10 ascending from 0 to 3;
  - a missing field 2 never "no specification".
- **Rule 26:**
  - a MIR's hash computed from `{0 => 4, 9 => text}` (F369.5);
  - the header becomes the name at the freeze (F368, question 52);
  - a file may end with one line break, not part of its text, the repository check refusing two (F369.6).
- **Rule 21 out of italics; rules 2 and 10's statements out of italics** (F368, question 37); "for reference" removed from every MIR's outline.
- **"No specification":** an act naming it is unknown unless a rule the verifier can apply shows it invalid (F367.5), in the MICS and suite too.
- **Fields 11 and 13:** the "to confirm" mark removed (F368, question 35).
- **Proposed** (F369.2): "A unit (kind 2)", "A signature scheme (kind 5)", a rule's `bytes-hash` as its binary's work hash, type definitions in CDDL under Identity's conventions; reasons below.
- **"Parameters":** nothing still open. Task 11 says "clock".

### MICS v30 and freeze test suite v30
- **MICS:** aligned with all of the above; glossary rows for belongs to, everyday act and member key; a row sending home queries to the relay transport cMIP.
- **Suite:**
  - new components: encoding, proofs, belongs to, one keeper sequence;
  - changed components: pending bindings, dishonesty, a collective's Money acts, member keys, deadlines, a revoked grant's disputed acts, the final line break;
  - scenario 1 step 8 (deadline met and missed);
  - step 3.8b;
  - **the freeze procedure's first step:** headers to names, `XWING`, then the six hashes, with the MICS's and the suite's.

## What is proposed, and why

Each of these is written in the texts and marked here as proposed, since neither code nor text had it:

1. **The unit specification (kind 2).** No field beyond those every specification carries. Its text must say what one smallest part is, how many make the unit people write, its symbol, and what makes it distinct.
   *Why:* Money and every verifier read only a unit's hash (equal hashes, one unit; no conversion in the core). A field nobody computes from would only make two tools write one text two ways.
2. **The signature-scheme specification (kind 5).** No new field. Its text must state the key and signature encodings and lengths, verification over the 32-byte act id, its roles (signing, chain, or both, with the commitment input), and test vectors. It may carry field 6 once a machine profile exists.
   *Why:* a client adopts a scheme by implementing its text; one that has not adopted it answers unknown whatever a field says. Lengths in a field could make a client that does not implement the scheme call an act invalid, which the texts forbid.
3. **The consistency-proof encoding** `[old, new, path]`, by the two summaries' act ids, beside the inclusion proof the relay transport cMIP already encodes.
   *Why:* one fixed form for what an auditor checks. No verdict of a verifier reads it today.
4. **A rule's `bytes-hash`** as the work hash of the binary, a media object like any other.
   *Why:* the format calls the binary a locked object, and the work hash is how MOR names an object's plaintext. No rule is published before a machine profile.
5. **Type definitions** (`payload-schema`) in CDDL under Identity's conventions, for discovery only.

## Questions

Each is put in plain words first, then precisely, with options, the lean and each option's cost. The texts are left as they stand on each.

**1. A missed deadline when the agreement names several keepers.**
*Plain words:* rule 33 says a deadline is shown missed by "a keeper's sequence" anchored past it with no record of the act. With three keepers, one may have no record while two do. Is the deadline missed?
*Precisely:* F364.3 decided how several keepers combine against a rotation. Nothing decides how they combine for rule 33. The same gap holds when an anchor of the act shows it met and a keeper's anchored silence shows it missed.
*Options:*
- (a) Read rule 38's rule the other way round: the act counts as recorded by the deadline when the keepers' rule is met by records before their anchored points. It is missed when enough anchored sequences lack it that the rule can no longer be met. An anchor of the act at or before the point shows it met, and that wins over any keeper's silence.
- (b) Any one named keeper's anchored silence shows it missed.
- (c) Only every named keeper's.

*Lean:* (a). It is rule 38 read in the other direction, and an anchor is the stronger proof (an anchor shows existence; silence rests on a keeper's trust).
*Cost:*
- (a): a verifier may need several keepers' anchored sequences.
- (b): one lax keeper can call late what the others recorded.
- (c): one keeper that recorded the act late hides a real miss.

**2. Which agreement's keepers count, when an act names one version of an agreement, or names only a collective's identity.**
*Plain words:* "belongs to" says an act belongs to an agreement it names, or "an act of its chain". Clones are acts of the chain, and each may name different keepers. And a collective's everyday actions name the collective's identity as their chain, not its agreement.
*Precisely:*
- For a deal: are the keepers those of the version the act names, of the version in force for it, or of every version on the line?
- For a collective's actions (and its grant keys' acts) that name no agreement: rule 42's second case covers only acts placed against the collective's line, not, for instance, rule 76's keeper exception for a grant key's act.

*Options:*
- (a) The keepers of the version in force for the act: for a deal, the latest complete version its history holds; for a collective, the agreement in force at the act (rule 60 and rule 72), every act in the collective's name belonging to it.
- (b) The keepers of the exact version named.
- (c) As written.

*Lean:* (a). It reads F363's "every participant's acts on the agreement fall under its keepers" for collectives too, with one test.
*Cost:*
- (a): one more lookup per record (the version in force).
- (b): a keeper a clone removed keeps speaking.
- (c): a collective's grant-key acts can never be saved by a keeper, against F359's "a keeper's record too".

**3. A member key's act and "the agreement in force".**
*Plain words:* rule 60 finds the agreement in force for a collective's act from the act's binding to the collective's identity chain. A member-key act is bound to a signature act instead.
*Precisely:* F366.2 says a member key counts "within the areas in force for the act it signs". Rule 60's procedure gives no result for such a binding.
*Options:*
- (a) For a member-key act, the agreement in force is the one rule 72 picks for the act from the records its history holds, starting from the version that named the key.
- (b) Bind member-key acts to the collective's chain as well (a format change).

*Lean:* (a). It needs no new field.
*Cost:* (a) reads the act's history; (b) changes the act format.

**4. "A Module whose field 5 names the payment cMIP" cannot be decoded.**
*Plain words:* Development says a Module under the payment cMIP must carry fields 11 and 13, or it is no specification. But many payment cMIPs may exist, and nothing in a specification's bytes says that a cMIP is "the payment cMIP".
*Precisely:* the core takes the payment cMIP's hash as a parameter (`Known`). Two C clients knowing different payment cMIPs would give different "no specification" verdicts for the same bytes.
*Options:*
- (a) The requirement applies to a Module whose field 5 names a cMIP whose own field 2 lists Money's task 6 (decodable: the verifier holds that cMIP, or answers unknown).
- (b) Fields 11 and 13 become optional, and a receipt naming a Module without them is unknown for rules 11 and 18 where they are needed.
- (c) As written, the payment cMIP being whichever the verifier implements.

*Lean:* (a). It keeps the verdict, decoded from bytes.
*Cost:*
- (a): fetching the cMIP named in field 5.
- (b): weaker checks.
- (c): verdicts differ between clients.

**5. "Text fields": the text and the code against S1's lean.**
*Plain words:* F368 told this pass to take S1's lean on question 11: only the fields the core's own types define are text fields. But Text rule 1, Envelopes rule 30's example and the core all check every text string in an act, a cMIP's included. Taking the lean would change a verdict: a cMIP act carrying a non-canonical string would become unknown instead of invalid.
*Done:* written as rule 1 and the core have it ("every CBOR text string anywhere in an act").
*Options:*
- (a) Keep that.
- (b) S1's lean, with Text rule 1's second paragraph and Envelopes rule 30's example changed.

*Lean:* (a).
*Cost:* (a) none; (b) a verdict change no finding decided.

**6. A closing's completeness and non-member holders.**
*Plain words:* F367 added to a fork's completeness that holders who are no members, where the constitutional change rule counts them, sign by chain signatures. A closing is "signed as for a fork", but its completeness list does not say so.
*Options:*
- (a) The same bullet in "Closing (type 20)".
- (b) As written.

*Lean:* (a).
*Cost:* none beyond one line; it may be a decision F367 did not name, hence asked.

**7. A text act signed with a member key.**
*Plain words:* Text rule 14 lets an act signed with a grant key, a member key included (F366.3), carry one object, the grant its binding names. A member key's binding names the holder's signature act. That act is not on the collective's chain, so under Agreements rules 58 and 80 the text can never count.
*Options:*
- (a) For a member key, the object is `[collective, the founding or clone the signature names]`, the version that is its grant (rule 73), and Text rule 14 says so.
- (b) A member key's text names the decision it acts under, as the collective's own text does (the first case).

*Lean:* (a). It keeps "the grant-key case decides".
*Cost:* (a) a verifier follows the binding one step; (b) undoes F366.3's choice.

**8. A grantee acknowledging its own grant key's acts.**
*Plain words:* rule 76 makes an act a revocation missed disputed where "another identity" acknowledged it. The grant key's acts are the grantor's, so the grantee's own identity is "another identity". A grantee can then make its own racing acts disputed with no accomplice. The stated cost assumed an accomplice.
*Options:*
- (a) The grantee's acknowledgement does not count for rule 76.
- (b) As written, the stated cost widened to say so.

*Lean:* (a). It is pattern 1 (what decides is signed by the wrong party), and F359's cost speaks of an accomplice.
*Cost:* (a) one exclusion to check; (b) a revoked agent alone keeps its last acts visible as disputed, conferring nothing (F365).

## The strangers' readings

- **Over every part changed** (six readers, each limited to the eight texts and its own diff), condensed with what was done: `docs/freeze-ready-strangers/technical-pass.md`. They found one regression of this pass (Money rule 12's batch), fixed. About thirty wording points were fixed: encoding details, headings cited by name, the kept tip's summary, member keys paraphrased, void or disputed, contest cases, and the MICS and suite summaries. The rest became questions 1 to 4 or are listed as gaps that predate this pass.
- **Over all eight together:** `docs/freeze-ready-strangers/technical-pass-all-eight.md`. Every tag and all 306 rule citations check out. Its contradictions are fixed where wording (the MICS's key lines, the frozen header's form, signatures inside payloads, Money rule 7's sentence on acts no area reaches), or became questions 7 and 8; the rest are listed as gaps that predate this pass.
