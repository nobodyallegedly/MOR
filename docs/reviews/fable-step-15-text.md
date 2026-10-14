# Step 15, machine review: Text

*14 October 2026. Fable, for Nobody, allegedly. Segment 2 of 6: Text (`spec/MIR-text-draft-7.md`), read on main at `df895f2` with the MICS v27, the freeze test suite v27 (the components under "Envelopes and Text" and every step that writes or reads a text act: 2.1, 5.3, 5.3a, 5.5b, 5.9, 1's terms), the core library where it applies Text's rules (`core/src/text.rs`, `cbor.rs`, `act.rs`, `chain.rs`), the published vectors (`canonical-text.json`, `cbor.json`), the tests (`core/tests/unicode.rs` against NormalizationTest-17.0.0, `vectors.rs`, `act.rs`), the WebAssembly bindings, and the clients that write and read text acts (barebone `post.ts`, reader `message.ts`, longform `text.ts`, `format.ts` and `html.ts`, site `feed.ts` and `write.ts`, dub, the collective client's plain-text view). Findings followed where a rule led: F78, F102, F110, F140, F149, F167, F174, F178, F182, F272, F276; and F293, as asked, against F276. The Envelopes decisions F292 to F294 are carried and not reopened.*

**This is a reading and a test review, not a second verifier.** Verifier B is deferred to MOR 2. The Rust tests could not be run in the reviewing container (no route to crates.io from it); the pull request's checks are the test run.

## In plain words first

Text is the smallest MIR and the soundest. Its one hard rule, canonical text, is written so that two verifiers cannot disagree: the space list is fixed, the controls are ranges, the noncharacters are enumerated, and normalization is pinned to one Unicode version and checked against Unicode's own conformance file, with a vector that only a verifier holding the pinned tables rejects. I tried the ways a text could say two things to two readers (two byte forms for one string, a trailing space that one checker counts and another does not, a character assigned after the pinned version, a BOM hidden in a map key, a bidirectional override in terms) and found none that the rules leave open. The composing clients normalize as rule 2 asks; the collective client shows terms as plain text with every control escaped before signing; the long-form format carries a tool that checks its own rendering against the bound.

What I found is one gap and a handful of sentences. The gap is the same one Envelopes had with its commitment and withdrawal: **the text act has a format, and nothing says what a verifier does when an act is not in it.** The core library never decodes a text act's payload, so a text act with no text at all, or of a type number Text never defined, is *valid* to the core verifier, while the barebone client says "not a text act"; Identity shows the same faults *invalid*, and Money refuses them at its decoder, so they count for nothing as Money acts. That is two honest verifiers disagreeing, and it is one sentence away from closed, best said once in the MICS for every MIR rather than once per MIR.

The sentences: which inside fields a text act may carry (the draft lists five and is silent on `to`, which F276 now uses, and on `objects`); that *invalid* beats *unknown* when a verifier can apply one rule and not another; and the format task's "a verifier checks", which no verifier of acts does.

**F276 against F293.** Text relies nowhere on a sealed container's outside being bound. A private text act names its recipient in its own `to` (the reader does), and a public reply names the identities it answers in its own `to` (F276): both live on the inner act, under the sender's signature, and Envelopes' step 5 checks them there. Dropping the one-time signature takes nothing from Text. One consequence to note for the relay market, not the core: with no sender and no signature, anyone holding a public reply can seal it again, fresh bytes each time, into the inbox of any identity its `to` names.

## Findings

Severity: **breaks a guarantee** / **leaves a gap** / **wording**. Kind: **text** / **code** / **instrument**. Pattern: one of the four of round 2, or "fits none", named.

### T1. A text act outside its format, or of a type Text does not define, is valid to the core verifier. Text. Leaves a gap. Fits none: a type without a stated verdict for its format.

**Sentences.** Part three: `text-payload = { 0 => tstr, ? 1 => hash }`. Section 2: "A text act is an Envelopes MIR act ... `type` 0". Envelopes rule 1 names only the act's own shape; rule 30 names only an unknown *specification*.

**Evidence.** `chain.rs`, `status_cx`, decodes payloads for Identity acts only; `identity.rs` refuses an undefined type (`IdError::UnknownType`) and a payload outside its closed map, and the act is *invalid* (`status_cx`); `money.rs` does the same at its decoder (`FinError::UnknownType`, `FinError::Shape`), so such an act counts for nothing as a receipt, claim or obligation. For a text act nothing is decoded: an act under `TEXT` with an empty payload, with field 0 a byte string, with a field 2, or with type 7, is *valid* to `Verifier::status` and to the WebAssembly verifier the clients call. The barebone client then reads the payload itself and throws "the text act has no text" or "the act is not a text act" (`post.ts`, `readPost`), the site's feed shows it dashed, and a second verifier written from the CDDL alone, where every other payload map is closed, would say invalid. So one act is valid at one verifier and not a text act at the next.

**Smallest fix.** One sentence, once, in the MICS's "Common conventions" (so that Text, Envelopes, Development and every cMIP are covered alike): "An act whose type its specification does not define, or whose payload is not in the format that specification gives for the type, is invalid; a verifier that does not implement the specification shows it as unknown (Envelopes rule 30)." Then the core decodes the text act's payload strictly where it knows the Text hash (`Verifier::knowing_envelopes_and_text`, merged for E5, already carries it): a closed map, field 0 a text string, field 1 a 32-byte hash; some thirty lines and a test. Cost: a sentence; a small code change; no published bytes change. Put as Q1 (core business: what makes an act invalid).

### T2. Which inside fields a text act may carry. Text. Leaves a gap (minor). Fits none: a format stated by example.

**Sentences.** Section 2: "Outside: `signer` and `binding`. Inside: `spec` ..., `type` 0, `prev`, the payload, and optionally `refs`."

**Evidence.** The list is a summary, not a rule, and it is out of date on two counts. A public reply now names the identities it answers in `to`, on its outside (F276, decided after draft 7 was written), and a private text act must name its recipient there (Envelopes, sealed container, step 5; the reader does). The everyday fields (`position`, `summary`) are required by Envelopes rule 13 and not mentioned. And nothing says whether a text act may carry `objects`. If it may, a valid text act naming an agreement's head as its predecessor is, by Envelopes rule 15 read literally ("two valid acts naming the same predecessor in the same chain are a fork"), a fork of that agreement; the Agreements library reads only Agreements acts on a deal's chain, so no verdict changes, but the text lets a reader think one could.

**Smallest fix.** Rewrite section 2's list as a rule: "A text act carries, on its outside, `signer`, `binding`, its content key if public, and `to` where it is addressed or answers someone (F276); inside, `spec`, `type` 0, the everyday fields, the payload, and optionally `refs` and `hint`. It carries no `acks` (Envelopes rule 18). It belongs to no core chain: `objects` on a text act is read by no core rule." Cost: four sentences. The alternative, "a text act carrying `objects` is invalid", is a closed shape and the stricter reading; I recommend the softer one, since it costs nothing in code and leaves a later format cMIP free to give text acts chains (threads, corrections signed again) without touching the core. Put as Q2 (core business, small).

### T3. Invalid beats unknown. Text. Wording.

**Sentences.** Text rule 1: "An act with a text field that is not canonical is invalid." Envelopes rule 30: an act under a specification the client does not implement "shows ... as unknown"; rule 4: a scheme not implemented "makes the act unknown".

**Evidence.** The two meet in one act: a cMIP's act a verifier does not implement, carrying a text with a trailing space, or signed under a scheme it lacks. The library refuses it at decoding (`Inside::decode` runs `text::check_value` over the whole inside, the payload's map keys included, before any spec is looked at), so it is never held: invalid, in effect. A second verifier that looks at the specification first would show it unknown. Neither counts, so no guarantee moves; but "invalid" and "unknown" are different words in a report, and the plan asks that two verifiers say the same one.

**Smallest fix.** One sentence, in Envelopes rule 30 or the MICS: "A verifier that can show an act invalid by any rule it can apply (its shape, its text, its acknowledgements) does so, whatever else in it the verifier cannot read; unknown is the verdict only where no rule it can apply fails." Cost: one sentence; it matches the code.

### T4. The format task says "a verifier checks". Text. Wording. Pattern: a rule rests on a fact nobody can check.

**Sentence.** Tasks, text format: "the bound is the format's own declared markup, which a verifier checks against the format's specification (F149)".

**Evidence.** No verifier of acts checks a rendering: the bound is a property of a format cMIP's declaration and of the client that renders it, checked by inspection and by tools (`clients/longform`, `check`: "does the rendering keep the bound"). Rule 6 says plainly that its own rule is conformance "which no verifier can check"; the task should say the same of the bound, or a reader will look for an act verdict that does not exist.

**Smallest fix.** "which a client implementing the format checks its rendering against; conformance, as rule 6". Cost: a clause.

### T5. Composing with the system's tables, checking with the pinned ones. Instrument. Wording (minor).

**Evidence.** `clients/longform/src/text.ts`, `compose`, normalizes with the browser's or Node's `normalize('NFC')`, then the core library checks with Unicode 17.0 (`check_text`). The two agree except for a character assigned between the system's version and 17.0 with a decomposition or a nonzero combining class, where the client would compose one way and the core refuse it: a rejection for an invisible reason, which rule 2 exists to prevent. Rare, and only until systems carry 17.0.

**Smallest fix.** Export `nfc` from the WebAssembly (one line over `UnicodeNormalization::nfc`) and compose with it. Cost: trivial; no core rule involved.

### T6. Re-sealing a public act into an inbox. Instrument (relay market). Noted, no fix asked.

With F293 a sealed container has no sender and no signature. A public act names, in `to`, the identities it answers (F276); anyone holding it can seal it again, with a fresh container key, into their inboxes, as often as they like, each copy a new container id at the relay. The core says inbox acceptance, spam and metadata privacy are the relay market's (Envelopes rule 29, F70); a relay that keys its inbox by the inner act's id would drop the copies, but it cannot open the container to learn that id. Nothing in Text depends on it; recorded so the relay transport cMIP sees it.

## The verdict vocabulary (attack 7)

Text produces **valid** and **invalid** (rule 1, through Envelopes rule 5); it adds no verdict of its own. Everything else it says is a display: *shown as plain text* (rules 3 and 4), *warned about* (rule 5, lookalikes and invisible characters), *shown as an escape* (rule 6, conformance), and, for formats, *keeps the bound* or not (the task; a tool's answer about a rendering, never an act's status). Two verifiers must agree on the first two and the text makes them able to; the rest are marked as what they are. Nothing to move, nothing restated under a second name.

## What held under attack

- **One string, one byte form.** CR, CRLF, U+2028 and U+2029 refused; a final LF refused; a trailing space on any line refused, with the space list fixed (U+200B, not on the list, is not a trailing space; a bidirectional control after a space is not a space); a BOM anywhere, TAB and every other control, every one of the 66 noncharacters (counted by a test) refused; the check reports the first rule broken and the byte where.
- **NFC with the pinned tables.** `is_nfc` is a full comparison with the normalized form, no quick-check shortcut; every line of NormalizationTest-17.0.0 passes in all five columns, and every code point not in its part 1, unassigned ones included, is its own NFC. The build refuses to compile against any other Unicode version (`PINNED_UNICODE_VERSION` checked at compile time). The vector `canonical-text.json` holds a string with two marks new in 17.0 that only a verifier with the pinned tables rejects.
- **Every text field.** `check_value` walks arrays, maps (keys included) and tags, so a non-canonical text in a cMIP payload, a route hint, a web reference's address or a hint is refused like one in a text act; a map keyed by `"k "` is refused (tested).
- **A private text.** Checked only by whoever opens it, and then before anything else (`Act::open` → `Inside::decode`): rule 1's "they MUST before relying on it" is the only path the code offers.
- **Bidirectional controls.** Valid canonical text (tested); the collective client shows every text to be signed "as plain text, character for character, any invisible control as U+…" (`clients/collective/src/page/view.ts`); the genesis client escapes them in a terminal; the connector names rule 5's set. Rule 6's conformance is kept where terms are signed.
- **Formats.** The long-form format's parser never fails on a canonical text; its renderer is checked against the bound by its own tool (hides only its declared markup, adds nothing, keeps the order; F102, F149, F167); a client without the format shows the words (barebone, reader, site).
- **F272 in text acts.** A post naming a picture names its publication's signer, having held it (barebone `post`); a reply followed by its signer reaches the post it answers; a wrong signer is said, both acts standing.
- **F276 against F293.** No reliance on the container's outside: see above.
- **Composition (rule 2).** `compose` converts line breaks, strips BOMs, replaces TAB, removes controls and noncharacters, normalizes, then strips trailing spaces and final line breaks, in an order that cannot leave a trailing space behind a removed control, and says what it changed.

## Rules exercised only by reasoning

Rule 2 (a SHOULD on the composing client; read in three clients, not attacked beyond T5); rule 5 (warnings; the connector's and genesis client's sets read, no attack); rule 6 (conformance; the collective client's view read, the desk's not); the format task's floor (read against the long-form tool, not against a hostile format); the open parameters (length, language tags: none has a rule to attack).

## Code fixes made

None. No code diverges from a clear rule; T1's rule is the missing one, and the code for it waits on the sentence.

## For the freeze suite (attack 6)

Under "Envelopes and Text", three components to add once T1 and T2 are decided: a text act with no text, with a non-text field 0, with a field 2, and of a type Text does not define (invalid in every client); a text act carrying `objects` (whichever reading Q2 takes, the same at every verifier, and never a fork of another MIR's chain); a cMIP act a client does not implement carrying a non-canonical text (invalid, not unknown; T3). Scenario 5.9 already covers the format bound; scenario 1's "terms containing a bidirectional override" is marked conformance and should stay so.

## Questions for Nobody, allegedly, one at a time

**Q1 (core business: what makes an act invalid; T1).** An act whose type its specification does not define, or whose payload is not in the format that specification gives, is it invalid, as Identity already treats its own and Money's decoder refuses, or is it valid and simply not read, as the core verifier treats a text act today? I recommend *invalid*, said once in the MICS for every MIR and cMIP, and the core then decoding the text act's payload where it knows the Text hash. Otherwise a text act with no text is valid at one verifier and "not a text act" at the next.

**Q2 (core business, small; T2).** A text act carrying `objects`: read by no core rule (it belongs to no core chain; a later format cMIP may give text acts chains), or invalid (a closed shape, like `acks`)? I recommend the first: nothing in the code changes, and the core stays out of what a format might want.

T3, T4 and T5 are mechanics, one sentence or one export each, for whoever writes the freeze-ready draft and the next client pass.
