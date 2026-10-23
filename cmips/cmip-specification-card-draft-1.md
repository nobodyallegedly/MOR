# cMIP: Dubsar Specification Card

*Draft 1, 23 October 2026, written by Ummia's round on the kit (`docs/ummia-kit-report.md`, F395), for Nobody, allegedly, to approve. **Decided by Nobody, allegedly, 23 October 2026**, on his question "what can a person find about a cMIP, module, xtypes or extensions, except its hash or the hash it belongs to … what can be tied to it, so that discoverability leads somewhere": "I think it's cMIP territory." Agreed with the MOR lead the same day: nothing core; a Dubsar cMIP.*

*Founding cMIP, EXPERIMENTAL. Not approved, not a product; test identities only until MOR is frozen.* Written against the Text MIR draft 11 (the text act, type 0; canonical text), the Envelopes MIR draft 11 (rule 20, references; rule 6, hints never decide), the Development MIR draft 11 (rules 3, 4, 17, 18, 25, 26; Part three, the specification format) and the findings to F395. **It fills no task and defines no act type**: its cards are ordinary text acts, read under the Text MIR, which every client implements. It is therefore neither an xtype nor an extension, and no act names its hash. Its hash stays a draft hash until its creator is named at step 17; until then it is written here as a test value, `sha256("Dubsar Specification Card cMIP, draft 1, test value until publication")`, which nothing signs. Its code is in Ummia (`clients/ummia/src/cards.ts`); dubsar.org's listing reads a card's title (`clients/site/src/listing.ts`).

*Reading this document: normal text is the specification. Italic text is commentary. Choices the decision did not fix are marked **(mechanic, this draft's)**, taken by the session under the working practice on development-layer mechanics, to confirm when built.*

## In plain words

*A specification is named by its hash and frozen when it is published: it can never point at what comes after it (a release of code implementing it, its test vectors, the place where people discuss it). So a person who finds a hash often finds nothing else.*

*A specification card is a short signed post that does point there: a title, a line or two saying what the specification is for, and the acts where its releases, its test vectors and its discussion are found. Its creator signs it, and signs a new one whenever something new arrives; the newest one in the creator's own sequence is the one that counts. Anyone else may write a card about any specification too: it is shown as that person's word, never as the creator's.*

*A card is a plain text post, so every app shows it, even one that has never heard of this cMIP: in Dub it reads as a post that starts "Dubsar Specification Card". An app that knows this cMIP reads its lines and gathers, on one page, everything the card leads to.*

## 1. What a card is

1.1. A **specification card** is a public text act (Text MIR, type 0) whose payload carries only its text (field 0), with **no format** (field 1 absent), so that every client reads it as a plain text act. *Not an xtype: a new act type would be shown as unknown by every client that has not adopted it, exactly where discovery matters (Development rule 18).*

1.2. **Its text** is canonical text (Text MIR) of one line per entry:
- its **first line** is exactly `Dubsar Specification Card`;
- every following line is an entry, `Key: value`, the key one of those in 1.3, then a colon and one space, then the value; no blank line.

1.3. **The entries**, in this order where present:

| Key | How many | Its value |
| --- | --- | --- |
| `Specification` | exactly one | the spec hash of the specification the card is about, in its form for people (`mspec1…`) or as 64 lowercase hexadecimal characters |
| `Title` | exactly one | its title, at most 120 characters |
| `Summary` | at most one | what it is for, in plain words, at most 600 characters |
| `Release` | any number, at most 16 | a release of code implementing it: the release's act id (`mact1…` or hexadecimal) |
| `Vectors` | any number, at most 8 | its test vectors: an act id, or a web address (`https://…`) |
| `Discussion` | at most one | its discussion thread: a public text act's id |

**(mechanic, this draft's: the keys, their order and the limits.)** A reader skips a line whose key it does not know, so a later draft may add keys; it reads nothing as a card whose first line, `Specification` or `Title` is missing or not as written here.

1.4. **Its references** (`refs`, Envelopes rule 20). Where the specification's creator published it, the card's first reference names that publication, with its signer. Then each `Release` and the `Discussion` act it names, each with its signer. *These guide a reader to the acts, as any reference does; they decide nothing. Which specification the card is about is its `Specification` line, so that a card can also name a specification no act publishes (a MIR, section 3).* *Client conformance (Envelopes rule 20):* the client writing a card holds every public act its references name and names its signer rightly.

1.5. **A card is never a verdict.** No verifier reads it, and nothing it says changes the specification it names, which stays exactly as published (Development rule 4). A card's title is not the specification's name, which is its own text's first line; a card that disagrees with the specification it names misleads only its own readers, under its signer's name.

## 2. Whose card counts

2.1. **The creator's card.** A card counts as *the specification's own card* only when its signer is the creator the specification names (Development Part three, field 1). Among the creator's cards for one specification, **the one latest in the creator's own sequence counts**: of two cards, the later is the one whose chain of previous acts (Envelopes, `prev`) reaches the other. The earlier ones are superseded, never withdrawn, and still readable as the acts they are.

2.1a. **Cards on two lines.** An identity signs from several lines (Identity rule 35; each app its own), and two acts on two lines have no order of their own. Where the creator's latest cards sit on different lines, the one a clock the reader names stamped later counts, said as such; where no clock stamped both, the reader shows the latest of each line, each as the creator's, and says that it cannot tell which is newer. **(mechanic, this draft's)** *Hints never decide (Envelopes rule 6): the signer's own hint orders nothing here. A creator who signs cards from one app keeps them on one line, and the question does not arise.*

2.2. **Signed again when something new arrives.** A creator who has a new release, new vectors or a new discussion to point at signs a new card carrying every entry that still holds. *A card is never edited: the latest replaces the earlier ones, as a newer version replaces an older one.*

2.3. **Anyone's card is their own word.** A card signed by anyone but the creator is shown as that person's word ("Pa’s card"), never as the specification's own, and never above the creator's; of each such signer's cards for one specification, its latest in its own sequence is the one shown. *Anyone may point at a release or a discussion; only the creator's card speaks for the specification.*

2.4. **A specification not found.** A card whose `Specification` names a hash that no relay asked holds a specification for is shown as naming a specification not found there, with its signer, and nothing it says is shown as the specification's. *Other relays may hold it: a look-up proves nothing by not finding.*

2.5. **An unclaimed specification** (Development rule 3: its named creator never published it): its creator's card still counts as the creator's own card, and the specification is still shown unclaimed. *A card is not a publication: it does not claim authorship.*

## 3. The core's texts

3.1. **No card is signed on the core's behalf.** The six MIRs, the MICS document and the freeze test suite name no creator (Development rule 3, Part three), so no card counts as theirs: a card signed for them would read as authorship.

3.2. **A client shows the text's own heading as its title**, and MAY carry **built-in cards** for the eight texts, keyed by their spec hashes (the test hashes until the freeze), shown as the client's own words, never as signed acts. **(mechanic, this draft's: the MICS document's and the freeze test suite's hashes, for which the core has no test value, are those Development rule 26 computes from the current drafts' text.)** *The front door to the frozen texts is dubsar.org's.*

3.3. **Anyone may sign a card for them**; it is shown as its signer's word (2.3).

## 4. Where a card leads

4.1. **A page per specification.** A client that implements this cMIP MAY gather, on one page for a specification: its title (the creator's latest card's, else its own text's first heading); the creator's latest card; others' cards, each as its signer's word; the releases implementing it (the releases' own manifests, and the card's `Release` entries); its vectors; its discussion thread and the replies to it; the public agreements naming it; its drafts, the specifications it names as predecessor and those naming it so (Development rule 25: a successor by another creator said as such); and its creator, and whether it is claimed.

4.2. **The discussion thread** is an ordinary public text act naming the specification's publication in its references; its replies are text acts answering it (Text MIR), from any client. **(mechanic, this draft's:)** a client offering one writes its first line as `Discussion of <title>`, then the spec hash on the next line.

4.3. **Offered at publication.** A publishing client SHOULD offer, right after a specification is published, its card (title, summary, links; read back before it is signed) and a discussion thread naming it, so there is somewhere to go from day one. *Client conformance.*

## 5. Finding cards

5.1. **No index.** Cards are found as any act is, by asking relays with the filters they already have (the relay transport cMIP): the creator's text acts (`signer`, the Text MIR, type 0), and, for others' cards, the text acts the relays asked hold. Nothing is indexed, kept or published by the reader. *Development rule 17: discovery happens through use; indexes are clients and services, competing like everything else.*

5.2. **A listing** (the website cMIP) MAY show a specification's title from its creator's latest card, and nothing more of it.

## 6. Why it is not core

- *Development rule 17: "Discovery happens through use." Cards are use: posts, signed, found by asking.*
- *Development rule 4: a specification is frozen at publication and could never point at what comes later; a card can be signed again.*
- *Part three, fields 3 and 4, are for "discovery only", and inside the frozen content: they say what a specification defines and relies on, never where its code or its discussion is.*

## 7. Costs, stated

- *Relays do not sort by references, so a reader finds the cards of others only among the text acts of the relays it reads, up to what it reads of each: a card on a relay it does not ask stays unseen.*
- *A card is a public post: anyone can read who wrote it and what it points at.*
- *A creator who loses their signing key can no longer sign new cards; a thief holding it can sign cards in the creator's name until the creator's rotation, which voids them as it voids every act of the old key.*
- *A card's title and summary are its signer's words: a client shows them as such and checks nothing in them.*

## 8. In the apps (Dubsar Suite, 23 October 2026)

- **Ummia**: Publish offers the card and the discussion thread right after a specification is published, and a later card from Published here; Look gathers a page per specification (section 4.1); built-in cards for the eight texts (section 3.2).
- **Dub**: shows a card as the plain post it is.
- **dubsar.org's listing**: a specification's title from its creator's latest card, and nothing more.
