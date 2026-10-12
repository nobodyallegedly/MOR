# Envelopes draft 8 and Text draft 7: the report

*12 October 2026. Roadmap: Envelopes draft 8 and Text draft 7, plain reading in Agreements draft 11's and Money draft 7's style (F251), one step, texts only. Branch `claude/envelopes-text-drafts`: one commit per text, one for this report. For Nobody, allegedly, to review and approve.*

## In plain words

Envelopes and Text say the same rules as before. They are now in the order a reader meets them.

**Envelopes draft 8.**
- **Part one** is an act as it runs most of the time: its shape, public and private acts, private delivery, sequences, chains, acknowledgements and references, how acts reach people, media, vows, withdrawal, relays, and what a client does with an act it does not understand.
- **Part two** is the rare case: theft of the signing key (the hijack window, and forks of the encryption key).
- **Part three** is the formats: the act, keys, the sealed container, the running summary, the publication, the vow and the table of types.
- **Part four** is the tasks, reasoning, open parameters and freeze scenarios.

Draft 7 numbered three lists separately: chains, relays and validity. So draft 7 had three rule 1s, three rule 4s, and so on. Draft 8 gives the 32 rules one numbering, in reading order. Each rule shows its old list and number beside it, for example "Rule 18 (was chains 4a)". The descriptions that belonged to a validity rule now sit next to it. "Vow" replaces "announcement". The act is still type 5 and its bytes are unchanged. One quote of Nobody, allegedly, keeps the word "announcement", because a quote is never changed.

**Text draft 7.**
- **Part one** is text as people use it: every text field is canonical, the client normalizes what people type, every client can show a text as plain text, and what a client warns about and shows before signing.
- **Part two** is the six exact rules of canonical text, and how a verifier checks them.
- **Part three** is the format. **Part four** is the bound on formats, reasoning, open parameters and freeze scenarios.

Its two lists, canonical text and validity, become one numbering of 13 rules.

**How we know no rule moved:**
- No code changed. The code's tests pass unchanged, on main and on the branch, with the same counts.
- A script compared every sentence of each old draft with the new one. Every difference is the removed history, the rename, a renumbered citation, or a pointer to where a format now sits.
- A second reader, who had not written the texts, compared each new draft with its old one, rule by rule. That reader found no rule changed in either. They did find 12 wording points: 7 in Envelopes and 5 in Text. Examples: a summary of the common case written as protocol text instead of commentary, a wrong count of the repeated numbers, an incomplete list of old citations, and one bare "rule 29" that could be read as Envelopes'. All are fixed, and the lists below name each.

**One question** for Nobody, allegedly (core business): Envelopes still says a vow names "something to come". F252 decided that a vow covers anything MOR cannot hash, "existing or to come". This step changes no rule, so the sentence is carried as it is, and the question is whether to write F252 in now (Q1).

**Do not edit, for the project lead:** three sentences of core v21 and the freeze suite v21 quote the renamed vow sentence (below). Nothing quotes a changed Text sentence.

## What changed, file by file

- `spec/MIP-envelopes-draft-8.md`: new (first commit).
- `spec/MIP-text-draft-7.md`: new (second commit).
- `spec/README.md`: one line for each, awaiting approval.
- **Unchanged:** `spec/MIP-envelopes-draft-7.md` and `spec/MIP-text-draft-6.md` stay as the approved texts. They also stay as the reference that code comments, tests, records, the other drafts, core v21 and the freeze suite cite by their numbers. Core v21 and freeze suite v21 were not edited. No code, test or record was edited.

## Envelopes draft 8

### Old numbers to new

Every old rule has exactly one new number. None was split, merged or dropped. The steps of "How it fits together" (1 to 3) and of the sealed container (1 to 5) are steps of a format, not rules, and keep their numbers.

| Old | New | Rule |
| --- | --- | --- |
| chains 1 | 14 | Chains |
| chains 2 | 15 | Forks |
| chains 3 | 16 | Order without a clock |
| chains 4 | 17 | Acknowledgements |
| chains 4a | 18 | Who may acknowledge |
| chains 5 | 20 | References |
| relays 1 | 25 | Untrusted by default |
| relays 2 | 26 | Operated by identities |
| relays 3 | 27 | What relays check |
| relays 4 | 28 | Commitments |
| relays 5 | 29 | Storage and delivery policy |
| validity 1 | 1 | One shape, in deterministic CBOR |
| validity 1a | 2 | No deeper than 128 levels |
| validity 2 | 3 | The lock and the commitments match |
| validity 3 | 7 | A public act carries the key that opens it |
| validity 4 | 13 | Position and summary |
| validity 5 | 5 | Canonical text |
| validity 6 | 6 | Hints never decide |
| validity 7 | 10 | A private act counts only once opened |
| validity 7a | 4 | The signature scheme |
| validity 7b | 19 | An act that may not acknowledge, and does, is invalid |
| validity 8 | 8 | Identity acts are public |
| validity 9 | 9 | A new key for every object |
| validity 10 | 11 | A private act reaches its recipients with its key |
| validity 10a | 12 | A container that fails delivers nothing |
| validity 11 | 30 | Nothing under an unknown specification |
| validity 12 | 31 | Adopted by opt-in |
| validity 13 | 32 | The one exception: a text's format |
| validity 14 | 21 | Check the media against the work hash |
| validity 14a | 22 | A size that does not match is shown |
| validity 15 | 24 | Who may withdraw, and what it does |
| validity 16 | 23 | For whom |

**Citations of other drafts, now by their new numbers:**
- Agreements, draft 10 to draft 11, from draft 11's own table: 15 to 7, 32a to 12, 32b to 13, 35a to 57, 35b to 58, 56 to 52.
- Money, draft 6 to draft 7, from draft 7's own table: 10c to 18, 15 to 29.
- "OF4 a" is a finding tag, not a rule number, and stays. Identity, Development rule 12 and the type numbers are unchanged.

### No rule moved: the rule-by-rule list

*How it was checked.* I rewrote draft 7 with a checklist of every condition, exception, MUST, SHOULD and MAY, every "invalid", finding tag and mechanic mark, and every CDDL block. A script then split both drafts into sentences and listed each one found in only one of them. Every such sentence is history removed, the rename, a renumbered citation, a merged heading, or a pointer to Part three. A second reader, who had not written the text, then compared draft 8 with draft 7 rule by rule. They diffed the CDDL blocks, checked every outside citation against Agreements draft 11's and Money draft 7's tables, and checked every "rule N" in draft 8 against its table.

**What the rewrite removed on purpose** (history only; each fact is kept in draft 7):
- the revision notes of drafts 4 to 7, every "revised in place" note, and the line "Reading this document" (replaced by "How to read this draft");
- "Decided for this pass" (F23 to F237), as Agreements draft 11 removed "Decided in this draft";
- "Flaw V1" in the open parameters, an answered question. Its protocol content, in normal text, now sits under rule 18: negotiation messages acknowledge the latest message received (Agreements rule 52, was 56); a negotiation message is an Agreements act type carrying text (type 18, F118), so it may carry `acks`; a text act in a negotiation thread may not, and is no part of the record;
- "(F237, correcting F230's stated cost)" now reads "(F237)" in the vow's rotation bullet;
- "Decided by Nobody, allegedly, 10 October 2026" before the vow's quote. The quote stays, in italics.

#### The 32 rules

| New | Was | Rule | Second reading |
| --- | --- | --- | --- |
| 1 | validity 1 | One shape, in deterministic CBOR | no difference ("the shape above" now reads "the shape Part three gives", since the formats moved after the rules) |
| 2 | validity 1a | No deeper than 128 levels | no difference |
| 3 | validity 2 | The lock and the commitments match | no difference |
| 4 | validity 7a | The signature scheme | no difference |
| 5 | validity 5 | Canonical text | no difference |
| 6 | validity 6 | Hints never decide | no difference |
| 7 | validity 3 | A public act carries the key that opens it | no difference (draft 7's "Public:" bullet now sits here, still normal text) |
| 8 | validity 8 | Identity acts are public | no difference (the paragraph "Identity acts are public" now sits here; both MUSTs kept) |
| 9 | validity 9 | A new key for every object | no difference |
| 10 | validity 7 | A private act counts only once opened | no difference |
| 11 | validity 10 | A private act reaches its recipients with its key | no difference (now in two paragraphs) |
| 12 | validity 10a | A container that fails delivers nothing | no difference ("the format above" now "the format in Part three"; "(step 4)" added after "Opening") |
| 13 | validity 4 | Position and summary | no difference |
| 14 | chains 1 | Chains | no difference (Agreements 35b to 58) |
| 15 | chains 2 | Forks | no difference |
| 16 | chains 3 | Order without a clock | no difference |
| 17 | chains 4 | Acknowledgements | no difference |
| 18 | chains 4a | Who may acknowledge | no difference (the tag F110 moved from the heading into the first sentence; Flaw V1's protocol content added, as above) |
| 19 | validity 7b | An act that may not acknowledge, and does, is invalid | no difference |
| 20 | chains 5 | References | no difference |
| 21 | validity 14 | Check the media against the work hash | no difference |
| 22 | validity 14a | A size that does not match is shown | no difference |
| 23 | validity 16 | For whom | no difference (the "For whom" paragraph now sits under this rule, its italic part identical; Agreements 32a to 12, Money 10c to 18) |
| 24 | validity 15 | Who may withdraw, and what it does | no difference (the Withdrawal section now sits under this rule, all four bullets kept) |
| 25 | relays 1 | Untrusted by default | no difference |
| 26 | relays 2 | Operated by identities | no difference |
| 27 | relays 3 | What relays check | no difference |
| 28 | relays 4 | Commitments | no difference |
| 29 | relays 5 | Storage and delivery policy | no difference |
| 30 | validity 11 | Nothing under an unknown specification | no difference |
| 31 | validity 12 | Adopted by opt-in | no difference |
| 32 | validity 13 | The one exception: a text's format | no difference |

#### The other sections

| Section | Second reading |
| --- | --- |
| Header, "How to read this draft" | fixed: the count of repeated numbers ("each of the three lists has a rule 1 to 5", not "a rule 4 in two lists"); fixed: the precedence clause now covers the one summary the draft has (*How it runs most of the time*), since it has no *In short*; fixed: the header names F252 as put in this report, since the draft does not write it in |
| Part one's summary | fixed: now wholly italic (it was protocol text); fixed: it now keeps the key-delivery path of rule 11 |
| Purpose, dependencies | identical |
| Definitions (all 19 kept, word for word, grouped under four headings) | no difference |
| Types and specifications, "What a relay sees" | identical, now at the start of section 1 |
| Encryption key bullet | no difference. Its fork sentence moved to Part two, normal text, "in the chain" now "in the encryption key's chain" (same meaning, since it no longer stands next to the bullet). An italic pointer added |
| Key delivery, sealed container introduction and closing paragraph, going public later | identical (a colon before the moved CDDL now a full stop) |
| X-Wing, sealed container steps 1 to 5, running summary (Part three) | identical; step 5 cites rule 11 (was validity 10) |
| Hijack window (Part two) | identical |
| How acts reach people | identical |
| Media | identical ("the fields above" now "the fields of the publication"; bold lead-ins instead of subheadings) |
| Vows | renamed; the quote keeps "announcement"; the italic note adds F238, the renaming's first step; rule 2 to 15, 32b to 13, 15 to 7, 35b to 58 |
| CDDL | byte-identical apart from `announcement =` to `vow =` (a name in the specification, not on the wire) and Agreements 35a to 57 in one comment |
| Pointers to Part three | fixed: each now italic (they had been written as protocol text) |
| Types table | "Announcement (to be renamed vow, F239)" now "Vow" |
| Tasks | Money 15 to 29, twice. Fixed: the bare "(rule 15)" now reads "(Money rule 29)", since a bare rule 29 here is Envelopes' own |
| Reasoning (15 bullets), open parameters (3) | identical, Flaw V1 aside |
| Freeze scenarios (15 bullets, grouped; each kept with its scenario numbers) | no difference |
| Old numbers to new | every old rule once; every title matches its heading. Fixed: the note on older citations now lists every form in use ("rule 2", "rules 4a and 7b", "relays rule 5"), found by the second reader in the live texts |

### Core v21 and freeze suite v21: sentences that quote a changed sentence

Not edited, for the project lead to apply once draft 8 is approved. Each quotes Envelopes' vow sentence, "An announcement is an act of type 5 of this MIP, naming in words something to come …", which now begins "A vow is …".

1. **Core v21, "Communication", the bullet "Announcements":** "**Announcements** (to be renamed vows in the redraft before review, F239, F241; F237, F240). An announcement names in words something to come, something MOR cannot hash or cannot hash yet: its first act is its genesis, whose id is its name for good, and later versions are signed again on its own chain (Envelopes)." *Suggested:* "**Vows** (F237, F239, F240, F241). A vow names in words …" and "(Envelopes draft 8)". In the rest of the bullet, "Offers naming it", "it" and "this grammar" read as they are.
2. **Core v21, glossary:** "| Announcement | An act naming something to come, its genesis id its name for good, on its own chain; sold by offers naming it, each sale pending, confirmed or contested (F237). To be renamed vow (F239). |". *Suggested:* the row named "Vow", the last sentence dropped, and the row moved to its alphabetical place.
3. **Freeze suite v21, component list:** "Announcements (to be renamed vows, F239; F237, F240): an announcement's own chain, … an offer naming an announcement an agreement claims, …". *Suggested:* "Vows (F237, F239, F240): a vow's own chain, … an offer naming a vow an agreement claims, …". The test file name `review_announcements.rs` is a file's name and stays.

**Checked, not quoting a changed sentence:**
- Core's other Envelopes bullets (outside and inside, encrypted by default, sender, types, chains, acknowledgements, delivery, media, relays, withdrawal, fail closed). They paraphrase sentences draft 8 keeps word for word.
- The suite's scenario 2, step 4, "(F126; Agreements rule 32a, Money rule 10c)". It cites those layers by their old numbers, which their own tables map.
- The suite's header notes. They are records.
- Core v21's first line names "Envelopes draft 7" and "Text draft 6" among the drafts it names. That is for its next revision, as for Agreements draft 11.

## Text draft 7

### Old numbers to new

Every old rule has exactly one new number. None was split, merged or dropped.

| Old | New | Rule |
| --- | --- | --- |
| canonical 1 | 7 | UTF-8 |
| canonical 2 | 8 | One line break |
| canonical 3 | 9 | No control characters |
| canonical 4 | 10 | No trailing spaces or line break |
| canonical 5 | 11 | No noncharacters |
| canonical 6 | 12 | NFC |
| validity 1 | 1 | Every text field is canonical |
| validity 2 | 13 | Exactly, with the pinned tables |
| validity 3 | 3 | Plain text, always |
| validity 4 | 4 | An unknown format still shows its text |
| validity 5 | 5 | Warnings, not rules |
| validity 5a | 6 | What you sign is what you saw |
| validity 6 | 2 | The client normalizes for the user |

Text cites no Agreements or Money rule by number, so no outside citation changed.

### No rule moved: the rule-by-rule list

*How it was checked.* The same as for Envelopes: a checklist, a sentence-by-sentence script, then a second reader. The reader checked every code point and range character by character, and compared the format task word for word.

**What the rewrite removed on purpose:** the header's history (drafts 5 and 6) and the line "Reading this document".

#### The 13 rules

| New | Was | Rule | Second reading |
| --- | --- | --- | --- |
| 1 | validity 1 | Every text field is canonical | no difference |
| 2 | validity 6 | The client normalizes for the user | no difference |
| 3 | validity 3 | Plain text, always | no difference |
| 4 | validity 4 | An unknown format still shows its text | no difference |
| 5 | validity 5 | Warnings, not rules | no difference (two paragraphs, words identical) |
| 6 | validity 5a | What you sign is what you saw | no difference (the client conformance mark and the closing sentence still italic) |
| 7 | canonical 1 | UTF-8 | no difference |
| 8 | canonical 2 | One line break | no difference |
| 9 | canonical 3 | No control characters | no difference |
| 10 | canonical 4 | No trailing spaces or line break | no difference |
| 11 | canonical 5 | No noncharacters | no difference |
| 12 | canonical 6 | NFC | no difference |
| 13 | validity 2 | Exactly, with the pinned tables | no difference ("rules 1 to 5 of canonical text" now "rules 7 to 11", "rule 6" now "rule 12") |

#### The other sections

| Section | Second reading |
| --- | --- |
| Header, "How to read this draft" | fixed: the client conformance line now italic, in draft 6's own words ("a rule for the signer's own client, which no verifier can check"); fixed: the precedence clause covers the one summary the draft has |
| Part one's summary | fixed: now wholly italic, and it keeps rule 2's SHOULD ("should normalize") and rule 6's MUST, and the acts it names (terms, a grant or a clone) |
| Purpose, dependencies, definitions | identical |
| Text act paragraph | identical; fixed: its pointer to Part three now italic |
| Empty string and bidirectional controls | identical, a bold lead-in added; "(rule 5a)" now "(rule 6)" |
| CDDL | identical |
| Format task | identical word for word; "(rule 5a)" now "(rule 6)" |
| Reasoning (8), open parameters (3), freeze scenarios (5) | identical |
| Part four's heading | fixed: now names the open parameters too (both drafts) |
| Old numbers to new | every old rule once; titles match. Fixed: the note on older citations now names the roadmap's "rule 6 of canonical text" too |

### Core v21 and freeze suite v21

Nothing quotes a changed Text sentence. The only changes are rule numbers inside Text's own sentences, and neither document cites them.

## Questions for Nobody, allegedly

**Q1. Area: core business. A vow "names something to come", but F252 says it covers what already exists.**

Envelopes draft 7, carried word for word into draft 8, says: "A vow is an act of type 5 of this MIP, naming in words something to come: something MOR cannot hash, or cannot hash yet." F252 (11 October 2026) decided: "a vow covers anything MOR cannot hash, existing or to come", such as a bowl in stock or an hourly rate. Agreements draft 11 already writes this in ("new in draft 11"). So the two drafts now disagree on the same act.

*Checked against the working rule:* this is core business, the definition of a core act, not something participants choose. The answer is already decided (F252). The only open part is when Envelopes says it. This step was told to change no rule, so the sentence stays until you say.

- (a) Write F252 into Envelopes draft 8 now, as a second commit marked "new in draft 8 (F252)": "naming in words something MOR cannot hash, existing or to come". The core v21 and freeze suite sentences above would follow. *My lean:* nothing in the code tells an existing thing from one to come, so no code changes, and the two drafts agree before review.
- (b) Leave it for the freeze-ready draft.

## Noticed and carried unchanged

These were in the old drafts, are kept exactly as they were, and are listed for the freeze-ready drafts.

**Envelopes:**
1. **Agreements draft 11 lags.** Its "Vow" definition says "Envelopes draft 7 still says 'announcement' … until its own redraft". Once draft 8 is approved, that is stale. Its citations of "Envelopes rule 4", "rule 4a", "rules 4a and 7b", "rule 11" and "'Chains', rule 3" stay valid as draft 7 numbers.
2. **Three lists, one set of numbers.** Draft 7's citations elsewhere ("Envelopes rule 2", "rule 4", "rule 5") never say which list they mean. Draft 8's table, by list, is the key. The freeze-ready draft's one pass over citations should resolve each one by its context.
3. **A withdrawal's `objects` entry.** "naming a publication in `objects`" does not say which pair `[chain, predecessor]` a withdrawal writes. The core library names the type (3) but checks no withdrawal yet, so nothing fixes the pair, and two independent implementations could differ. This is a mechanic for the freeze-ready draft (second reader).
4. **The same statement twice.** Several rules say a thing twice, as draft 7 did in two places: rule 8 ("They MUST be public acts" and "Identity acts MUST be public"), rule 23 (who is owed and where payment goes), rule 24 (the validity sentence and the "Authority" bullet), and rules 18 and 19 (one forbids, the other makes invalid). The freeze-ready draft could say each once.
5. **Type 4 in spirit.** The encryption key is "an Identity act in spirit, defined here", and rule 8 lists encryption keys among identity acts. The relay transport cMIP draft 3 notes that Identity's own list does not name it.
6. **The running-summary vector** is "published with this MIP before freeze" in the format and "published in draft with the core library" in the open parameters. These agree, but the format sentence could point to the vector's file.

**Text:**
1. **A stale header.** Draft 6's header said "findings F1 to F102", but its body cites F140 to F182. Draft 7's header says F1 to F266.
2. **U+2031 twice.** The format task lists U+2031 among the percent signs and again as "the per-ten-thousand sign (U+2031)". U+060A (Arabic-Indic per ten thousand) is not listed. That is a reading already confirmed in the F182 build (`docs/decisions-f182-build-2026-10-07.md`, readings 12 to 18), so it is not put as a question.
3. **Two lists in rule 6.** Its SHOULD names "agreements, terms and grants"; its MUST names "terms, a grant or a clone".
4. **No order in rule 2.** A client that follows its steps in the order written could still end non-canonical: a TAB turned into spaces at the end of a line, or a character removed after NFC. It is a SHOULD, and the client still checks rules 7 to 12. The freeze-ready draft could say "until the text is canonical".
5. **Overlaps.** CR is excluded by both rule 8 and rule 9, and U+200B to U+200D are Cf, so rule 5's exception for joiners carries the weight. Consistent, but worth a sentence.
6. **"The envelope defined in the Identity MIP"** (dependencies): the act is defined by Envelopes. Identity defines signers and keys.

## Tests

**Main, before writing anything** (commit `ea7cd5d`, `scripts/test-all.sh`, without `--reproducible` and without regtest): **all tests passed.**
- Rust workspace: 634 passed, 0 failed, 1 ignored (the Lightning regtest, skipped unless `MOR_LN_REGTEST` is set).
- TypeScript: 248 passed, 0 failed, in 14 packages: barebone 9, collective 41, connector 12, desk 12, genesis 17, longform 26, manage 7, poster 7, reader 16, repo 18, site 57, jpeg 14, video 6, carry 6.

*How it ran:* this container had no `wasm-bindgen`, so I installed the version the script names (`cargo install wasm-bindgen-cli --version 0.2.129 --locked`), outside the repository, first. The run went through in one go, in a separate checkout of main. The drafts were written in a scratch folder meanwhile, and the tree was untouched during the run.

**The branch, after both texts' commits** (`a958590`, same options, a separate checkout): **all tests passed**, with the same counts as on main: Rust 634 passed, 0 failed, 1 ignored; TypeScript 248 passed, 0 failed. No code or test changed, so the code's tests pass unchanged: the check that no rule moved. The tree was untouched during the run.
