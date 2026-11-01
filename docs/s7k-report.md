**Done. The WebAssembly changes, and binding answers move (`agreementsPurchaseContests`, `agreementsVow`, `moneyRouteBuyer` for a one-time key's payer; `agreementsClonePlan` and `agreementsRecord` for `[5, stake]` under every holder): rebuild after this commit. Ummia's final hashes in "Checks". Question 1 is a flaw in the one-time key's standing, for Nobody, allegedly, before the freeze.**

# S7k: the last text points before the redesign's second merge

*Session S7k, 1 November 2026, on `claude/s7i-routes` (pull request 116), beside the Dubsar Suite's round 10. Only `spec/`, `core/` and `docs/` are touched (and the c-box's vectors README); no web release is rebuilt. The decisions are F414 and F416 (`claude/lead-records`). This session records no finding of its own.*

## In plain words

- **An owner held at a contested position can leave.** A contested position can no longer hold an identity still for good. The owner signs one escape that abandons both rotations. This works wherever the position is contested: at a self-hosted home, by one home's conflict, or by two rotations each missing the home rule. The core already counted it; only the texts changed. Fable's four cases, and the third kind, are now vectors.
- **A holder is a holder, and a collective counts once.** A collective among a stake's holders gives one consent, by its own constitution. Under every holder, default or declared, each holder with no voice signs, and the members consent through the collective's rules. `[5, stake]` is only for a rule by share. This reverts this session's earlier sentences and core change. It also reverts S7j's Q-A11, `[5, stake]` naming every holder in a clone's mark, which rested on the reverted reading.
- **A payer with only a one-time key can contest and confirm.** The payer acts by a claim carrying that key's signature (key 8), as for a refund, directly or as a route's first payer. A core change.

## 1. The escape on a standing contest (F414, F416)

- **Texts (Identity):**
  - rule 29's second exception: a position contested by two rotations revealing the same chain key, wherever served. That is at a self-hosted home (rule 4), where one home's conflict leaves the others short (rule 44), or where competing rotations each miss the rule (rule 40);
  - its conformance paragraph ("for a contested position"), with the stated cost beside it (F416): the competing rotation's bytes prove a rival exists, not that the position is contested, and abandoning a rotation that counts harms only the owner;
  - section 11 and its "In short";
  - line 70 (at any contested position, the owner may leave by the escape);
  - rule 42 (an act bound to a contested rotation is pending until the escape too);
  - rule 44's stated cost.
  - Elsewhere: the suite's 7d, and the MICS row.
- **Core:** no change.
- **Vectors:**
  - Fable's four (two homes, a rule of two, one home receipting both): contested; the endorsed escape abandoning both, counts; no endorsement and objected to, void; a verifier without the endorsement, contested.
  - A rule 40 contest (each home receipting one rotation): the escape counts.
- *Found while writing them:* the escape's own home rule must fit its new homes (rotation check 5).

## 2. The holders' rule (F416, decided by Nobody, allegedly)

- **Texts (Agreements):**
  - field 30 says the one reading once, with the italic "Richer models of control are a cMIP's, built from this grammar". A holder is whoever field 7 and the placed transfers name. A collective is one holder, its consent decided by its constitution, its members not holders of what it holds. "Every holder" means each holder, a collective counting once, the same declared as by default.
  - Rules 48, 94, 95 (its lead-in and item 3) and 65 are back to S7i's wording.
  - Rule 64 item 4 now says: under every holder, declared or by default, the holders with no voice sign outside the mark, members consenting through the powers above.
  - Field 30's share condition stays fixed ("a rule by share has its share above zero"), as `[0]` carries none.
- **Core:** this session's change in `owners_consent` and the split agreement's owners' matter is reverted.
  - S7j's Q-A11 core (`owners_powers` listing `[5, stake]` for a declared every-holder rule, the mark checked against every holder) is reverted with it. `[5, stake]` under every holder is again refused in a mark.
  - Its test, and this session's test, are removed.
  - *Said plainly:* F414 had kept Q-A11 "as built". F416's single reading (every holder the same declared as by default, members through the collective's rules, rule 65 reverted) leaves it nothing to stand on, so I reverted it rather than keep two readings. If the MOR lead meant to keep it, it is one commit back.
- No vector moved: no vector held a declared every-holder rule.

## 3. A one-time key's standing (F416, decided by Nobody, allegedly)

- **Texts:**
  - Agreements rule 13 (a payer who committed only a one-time key signs on, confirms and contests by a claim carrying that key's signature; the identity signing that claim stands for the key, and every claim of the payment carrying the same key's signature is the buyer's);
  - rule 22's stated cost;
  - "A contest of a purchase" (twice: direct, and a route's first payer);
  - Money rule 24's route buyer;
  - the two stated costs that compared a payer with no claim to a bare-key payer, now compared to "a payer who signs no claim";
  - the suite's 4l.
- **Core:**
  - `purchase_buyer` and `committed_buyer` (`vows.rs`) take the signer of a key-8 claim as the buyer;
  - `sale_acts` counts every claim of the payment carrying the same key;
  - `route_buyer` (`routes.rs`) finds the first payer's key-8 claims (`HopRecord` gains `payer_as_written`).
- **Vectors** (on a request rail whose specification is held):
  - a direct contest by the key claim's signer, shown, and by someone else, nothing;
  - a vow's seat confirmed by a later claim carrying the same key, signed by another one-time identity;
  - a route's first payer with a one-time key, the buyer.

## Vectors

- 510 verdict cases, 9 new this session.
- Every earlier case keeps its verdict, acts and ids.
- Both READMEs and the c-box's are updated.

## For the Dubsar Suite

- **The WebAssembly changes. Against the releases you rebuilt last (`6c9dde0`), these binding answers move:**
  - `agreementsPurchaseContests`, `agreementsVow`, `moneyRouteBuyer`: a payer who committed only a one-time key now has standing. A contest signed by the identity that signed the key's claim (key 8), naming it, is shown. A vow's sale whose payer is a one-time key is listed with that signer as its buyer, not as unsigned. A route's first payer with a one-time key is "the first payer".
  - `agreementsClonePlan` (the powers needed) no longer lists `[5, stake]` under a declared every-holder rule. A clone whose mark names `[5, stake]` under every holder is invalid again (`agreementsRecord`'s clone state).
  - `agreementsRelease` and `agreementsPublication`: unchanged against your last release (this session's change there is reverted).
  - `wasm/README.md` was off limits: please add these under "Changed in S7k", and remove the S7j line saying that `agreementsClonePlan` lists `[5, stake]` under a declared every-holder rule.
- **The air-gapped Module** (`modules/airgap`, yours). Its code already opens the escape on a competing rotation at any homes. To change:
  - the summary's words for `Exception::EscapeContested` ("contested at a self-hosted home" → "contested by two rotations revealing this key");
  - the doc comments on `EscapeContested` and `check_competing`, and the README;
  - a test in `tests/rule_29.rs` for a contest at two homes (one home receipting both) and for a rule 40 contest: the competing rotation opens the escape; without it, refused.
- **A client contesting or confirming for a one-time key** signs its contest with the identity that signed the claim carrying the key's signature, naming that claim (field 0).
- **Ummia's pinned hashes**, final for these texts: in "Checks".

## Questions

1. **Anyone holding a one-time key's claim can take over its standing.**
   - *Plain words:* the key's signature binds a claim's contents, but not who signs the claim. So anyone who has seen the claim (the seller's members, the conversion service, everyone if it is public) can re-sign an identical copy under their own identity. They then "stand for the key" and can contest the buyer's purchase. Through a vow, a contest prevails over a confirmation. For refunds this costs nothing, since the refund goes where the key's own signature says; for standing it is a hijack.
   - *Precisely:* the anonymous message (Money, "Payment claim", key 8) covers fields 0 to 10 and the inside keys 3, 7 and 8, never the act's signer. "A claim carrying that key's signature is the claim of the payer that committed to that key. Its signer … may be any identity." So the new rule 13, rule 22, contest and rule 24 sentences give standing to whoever signs a copy.
   - *Options:*
     - **(a)** the key's signature also covers the claim's signer: one more element in key 8's signed array. This is a one-way door, a frozen signed message changing once. A claim then stands only for the identity the key chose. Refund claims are unaffected in effect.
     - **(b)** a contest (type 14) gains an optional key carrying the one-time key's own signature over the contest. Standing then rests on the key, never on a claim's signer. Also a one-way door, a format key.
     - **(c)** as built, said as a stated cost (a one-time key's standing is anyone's who sees its claim).
   - *Lean:* (a). It is the smallest change, fits "as for a refund", and closes the hijack for confirmations too. *Cost:* the anonymous message's array changes before the freeze, and the suite's anonymous claims must sign it.
   - *Built meanwhile:* as decided, with the contest signed by the identity that signed the claim it names. The vectors list a key's sale under its claim with the smallest act id, and that claim's signer as the buyer. In the core, a second signer for the same key confirms but does not contest. Whichever option is chosen settles this.
2. **Older wording the reading met:** rule 95 item 3 says "each holder who is no member", rule 94 "each holder with no voice in the power". These differ for a member with no voice in an area's power. *Lean:* rule 94's words in item 3. One sentence, older than this session, so not changed.

## The stranger's reading

A subagent read only the eight texts, the diff of every sentence changed since the last reading, and the five new cases.
- **4 agree, 1 silent:** the vow confirmed for a one-time key (who the buyer is with two signers): question 1.
- **Its points, fixed in the texts:**
  - field 30's definition limited to the holders' rule's form, with an italic that "every holder of the stake signs" elsewhere (field 30, the release rule, a waiver) means each holder by its own signature, members included;
  - line 70 restores the proven conflict that nothing settles, and names the three kinds of contest;
  - section 11's "In short" is narrowed to those three;
  - the stated cost beside rule 29 now names those who relied on an abandoned rotation's acts, and says the abandonment wins;
  - rule 13: the buyer is the key, "the bare key of receipt field 2";
  - the suite's 7aj: a collective holding part of the stake is one holder.
- **Questions:** 1 and 2 above.

## Checks

- `cargo test --workspace`: green (core, relay, harness, the WebAssembly crate).
- `python3 core/vectors/check.py`: all 276 agree, 98 verdict cases judged.
- The generator gives the same bytes again.
- `scripts/c-box/make-c-box.sh`: 8 texts, 12 vector files.
- No finding number or review label is in the texts.
- **Ummia's pinned hashes, final for these texts** (`clients/ummia/src/cards.ts`):
  - `MICS_HASH = 'c9d7f5cba40f00f3cb184e7c1b50bbbea11c4cbf677d5fc59b76ce764d9bd788'`
  - `SUITE_HASH = '3c8b9d3f5ee0d44a063962bff1e4436d77142933531d950f07950e46bf86cf03'`
- GitHub: not read by me; the suite's final rebuild runs it.
