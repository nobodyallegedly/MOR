# Module: Timestamp clock

*Draft 1, 13 October 2026 (the feed's next pass; `docs/public-feed.md`, "Ordered by a clock"). Decided by Nobody, allegedly, 13 October 2026: "A feed like the public feed could easily rely on a dumb anchoring." And: "Anchoring precision and probability only matter when there is something to protect." **Experimental, not approved:** the simplest clock there is, for ordering what protects nothing, such as a feed. A clock Module under the anchoring cMIP draft 4 (`cmips/cmip-anchoring-draft-4.md`, item 4). Its hash stays a draft hash until its creator is named at step 17; until then it is named by a test value. Not core: frozen at publication, competing with any other clock Module.*

*Reading this document: normal text is the specification. Italic text is commentary. Choices the build made where the decision is silent are marked **(mechanic, the build's)** and listed for Nobody, allegedly, in `docs/public-feed.md`.*

## In plain words

*A timestamp clock is an ordinary MOR identity that signs one kind of act, a **stamp**: "I held these acts at this time." Nothing more. Its time is its operator's computer clock, and its word is all a stamp is: a stamp proves that the clock's identity signed it, never that the time it gives is true.*

*That is enough where nothing is at stake. Signed order can tell that a reply came after the post it answers, but not whether one person's post came before another's when neither names the other. A clock everyone reading a feed agrees to listen to can: the feed sorts by its stamps. Who the clock is, the page that shows the feed says. If the clock lies, the feed is in the wrong order, and nothing else is lost.*

*Where something is to protect (a payment, a lock change), use a clock whose word does not rest on one operator: the Bitcoin clock Module.*

## The reference

`[ this Module's spec hash, clock: identity hash ]`: the identity whose stamps count. *One reference per clock identity: two timestamp clocks' stamps never compare (anchoring cMIP, item 2).*

## The point

**A time, in whole seconds since 1 January 1970 at midnight UTC** (Unix time; leap seconds are not counted), as an unsigned integer. *Compared as the core compares points: as unsigned integers.* **(mechanic, the build's: seconds, Unix time.)**

## The stamp

A stamp is an everyday act of the clock identity (Envelopes, "The act"), **public**, whose `spec` is this Module's spec hash and whose type is **1**, its payload:

```cddl
stamp = {
  0 => uint,                 ; time: the point, in seconds since 1970 (UTC)
  1 => [+ bstr .size 32]     ; acts: the act ids held at that time, at least one, at most 256, none twice
}
```

1. **Closed format.** A payload with any other key, a field of the wrong kind, no act, more than 256, or an act named twice is no stamp. *The act itself may still be valid under the MIRs: it simply places nothing.* **(mechanic, the build's: the type number, the fields, the limit of 256 per stamp.)**
2. **No other type.** This Module defines no other act type; type 0 is not used.

## The proofs it accepts

**A stamp.** The proof is the stamp act itself. Checking it, for an act `A` on the reference `[ this Module, C ]`:

1. The stamp is a valid act, public, of this Module's spec and type 1, and its payload is a stamp (rules 1 and 2).
2. Its signer is `C`, and its standing for `C`'s identity chain is **valid**, judged by the core library (Identity: bound by a counting chain act, not voided by a later rotation). *What any act of `C` needs; nothing more.*
3. Its field 1 names `A`.

Where all three hold, the stamp places `A` at the point its field 0 gives. On this reference, `A` is judged by its **earliest** stamp (anchoring cMIP, item 2; F178).

*No data from the client is read (anchoring cMIP, "Data a clock's rule reads"): the clock's chain is looked up as any identity's is.*

## The depth

**None.** A stamp counts once checked, and stays counted while its standing is valid. *There is no chain to rewrite. What can change is the clock's identity: a rotation that voids an act voids a stamp, as any act of that identity.*

## What it proves, and what it does not

- **It proves** that the clock's identity signed the stamp, naming those acts and that time: its operator's word, and only that.
- **It does not prove** that the time is true. The operator writes whatever time its computer says, or any time it likes: earlier or later than when it held the act. *Two honest stamps of two acts compare as the operator's computer clock ran.*
- **It does not prove** that an act did not exist before its stamp: an act is stamped when the clock is given it or finds it, which may be long after it was signed.
- **It does not prove** anything to someone who does not listen to that clock. *A page names the clock it listens to (website cMIP draft 8, rule 13a); a stamp from any other identity places nothing there.*
- **What a reader can still check**, beyond the stamp: an act that names another by its hash was signed after it (signed order). Where a stamp places an act later than an act naming it, the act named existed by the earlier time; a reader reads it so (rule below) rather than show a reply before what it answers.

## Reading the stamps of linked acts

*Client conformance, for a reader that orders acts by this clock (a feed).* An act existed by the earliest stamp of any act found that names it, directly or through others, since an act can name only what already exists. So a reader takes, for each act, **the earliest of its own stamps and of the stamps of every act found that names it**, and never shows an act after an act it names. *A clock that stamped a reply before the post it answers does not make the reply look older than the post.* **(mechanic, the build's.)**

## The clock service

*Any program signing stamps with the clock's identity is a timestamp clock; this is the reference one.*

- **Acts it is given:** a request naming act ids (an HTTP form, open: `POST /stamp`); it answers with the stamp's id and its time. *An act id is a hash: whoever gives it learns nothing of the clock, and the clock learns only the id, not the act.* **(mechanic, the build's: ids, not acts' bytes.)**
- **Acts it finds:** at the relays its operator names, it follows each relay's feed (relay transport cMIP, "Following: the feed", every act, or only those of the signers its operator names) and stamps every act it has not stamped, **never its own stamps**.
- **Each act once.** It stamps an act once, at the first time it holds it; acts held at the same time go into one stamp, 256 at most.
- **Never back in time:** a stamp's time is never earlier than the stamp it signed before. *Its computer clock set back does not make its own line run backwards.*
- **Where it publishes:** its stamps on its outbox relays, the ones its routes name, so a reader finds them by its identity (relay transport cMIP, "Following: the feed", by signer).

## Costs, stated

- **One operator's word.** A clock that lies, or whose computer's clock is wrong, orders a feed wrongly; whoever holds its signing key can stamp anything at any time until it rotates. *Acceptable where nothing is at stake (Nobody, allegedly: "Anchoring precision and probability only matter when there is something to protect"); never for a payment or a lock change.*
- **A late stamp places an act late:** an act the clock was not given and did not find until later is stamped later, and a reader ordering by stamps shows it as newer than it is. *An act stamped at once is placed close to when it was signed; the clock service follows its relays as they receive.*
- **The clock learns what it stamps:** act ids, from whoever gives them, and every act at the relays it follows. Its stamps are public: anyone can read which acts it held and when.
- **A stamp costs an act** on the clock's outbox relays; one stamp names up to 256 acts.
- **A clock gone quiet** leaves new acts unstamped; a reader shows them as not stamped (website cMIP draft 8, rule 13a).

## Reference implementation

`modules/timestamp/` (TypeScript, `mor-timestamp`): the stamp's format (`src/stamp.ts`: `encodeStamp`, `decodeStamp`, `TIMESTAMP_SPEC`, `STAMP_TYPE`), the reading of a clock's stamps from the acts a reader holds (`src/read.ts`: `readStamps`, `earliestByNames`), and the clock service (`src/service.ts`, `src/cli.ts`: `mor-clock`). The site's display client reads stamps with the same code (`clients/site/src/feed.ts`). Tested in `modules/timestamp/test/` and, in a browser, `clients/site/test/feed-clock.test.ts`. Test identities only before step 17.
