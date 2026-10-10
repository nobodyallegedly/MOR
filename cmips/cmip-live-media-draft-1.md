# cMIP: Live Media

*Draft 1, 10 October 2026 (night), the vow grammar build (`docs/vow-grammar-build.md`). **Experimental, not approved.** Its hash stays a draft hash until its creator is named at step 17; until then it is named by a test value. Written against core v21, the Envelopes MIP draft 7 (revised in place for F237: the announcement, type 5) and the Agreements MIP draft 10 (rule 32b), from findings F229 to F234 and F237 (`docs/findings/MOR-findings-log-round-2.md`), the live work review (`docs/reviews/live-work-review.md`) and the announcements review (`docs/reviews/announcements-review.md`).*

*Why it exists (F237, decided by Nobody, allegedly, 10 October 2026: "Yes, I think this is cleaner and what I did before was an overreach. The core should not care."): F230 to F232 placed the rules of streams in the core. F237 keeps in the core only the grammar of announcements (to be renamed vows, F239, in the redraft before review, F241) and moves everything about substance to cMIPs; for streams, "their segments, who signs them, their closing, branches and the recording's computation … keep their content and move to the live media cMIP". This is that cMIP. F229 to F234 stay as records. Like every founding cMIP it is an instrument for testing the core, not a deliverable (build brief, 2 October 2026): "A working but inelegant cMIP or Module is an invitation for a developer."*

*Reading this document: normal text is the specification. Italic text is commentary, reasoning and examples. Each choice no decision made is marked "(mechanic, the build's)". The texts say "announcement" until the redraft; the code says "vow".*

## In plain words

*A stream is a live event that carries media as it happens: a match, a concert, a talk. It needs a name before it starts, so that tickets, permissions, clips and later acts can point at it. The core gives that name: an announcement, whose first act's id is the name for good. This cMIP says what a stream is beyond the name: the pieces of media it carries (segments), who may add them (only the one who opened it, or someone holding a key it handed out), how it ends (a closing act by the opener naming the last piece), what happens when two pieces follow the same one (a fork, shown), and how the finished recording's fingerprint is worked out from the pieces in order. A recording, once finished, is an ordinary work, claimed and sold like any other.*

## Purpose

This cMIP serves the Envelopes' media interpretation task for live media (Envelopes, "Tasks": "It defines segmentation, chunk fingerprints, streaming and live media for its type") and names a kind of announcement (Envelopes, "Announcements", field 1). It defines: a stream's opening, its segments and their chain, its closing, its forks, its recording, and the buyer's check.

## Dependencies

Envelopes (the announcement, type 5; publications; chains and forks, rules 1 and 2; the work hash); Agreements (offers, rule 32 and the offer format; rule 32b, the state of each sale; rule 15, the work claim); Identity (grant keys, F128; rotation). A media Module per media type for the segments' bytes.

## Definitions

- **Stream.** A chain of segments signed by its opener, **named by the id of the act that opens it** (F230; the terminology note of 10 October 2026). *A work* keeps its one meaning: complete content with a work hash, what ownership points to.
- **Opening act.** The act that names the stream. **An announcement** (Envelopes type 5) whose field 1 names this cMIP, `[ this cMIP, opening ]`; *or, where no announcement is wanted, the stream's first segment (mechanic, the build's: F232's line 1 allows either).*
- **Segment.** An act of this cMIP (type 0) carrying a piece of the stream's media.
- **Closing act.** An act of this cMIP (type 1) by the opener, ending the stream and naming its last segment.
- **Recording.** What a closed stream became: a work, its work hash computed from its segments in order.

## Act formats

*Type numbers and field numbers: mechanic, the build's.*

```cddl
; the announcement's field 1 for a stream: [ this cMIP, opening ]
opening = {
  ? 0 => hash           ; the media Module its segments' bytes are read by
}

; type 0, a segment
segment = {
  0 => hash,            ; the stream's name (the opening act's id)
  1 => hash,            ; the segment's locked bytes hash (Envelopes, publication field 2's sense)
  2 => uint,            ; its size once unlocked
  3 => bstr .size 24,   ; nonce of its lock
  ? 4 => bstr .size 32  ; its content key, for a public segment
}

; type 1, a closing
closing = {
  0 => hash,            ; the stream's name
  1 => hash,            ; the last segment: the branch that becomes the recording
  2 => hash             ; the recording's work hash, computed as below
}
```

A segment's `objects` name the stream's chain, `[ name, previous ]`: the previous segment, or the opening act for the first. A closing names `[ name, last segment ]`. An opening by a first segment names no chain; its own id is the name.

## Rules

*F232's rules, decided by Nobody, allegedly, 10 October 2026, line by line, keeping their content; each line's change under F237 is said where there is one.*

1. **Opened by an act of its opener, its name that act's id** (F230); **the opening act may be an announcement signed before any media exists** (F232, 1: "Yes. Streams are an event, that event requires existing before it actually starts."). *The name is the opening act's id, the opener's own act, unique from its first second (F230). Where the opening act is an announcement, the core keeps its name and its chain (Envelopes, "Announcements").*
2. **Only the opener's segments**, signed by it or a grant key it issued (F128), each naming the stream and the segment it follows (F231: "Agreed"); **a segment by anyone else is shown as a fork, never as the stream.** A second camera is its own stream; a broadcaster's commentators, signing with its grant keys, add to the broadcaster's own. *A claim on a stream before it runs reserves a name, not content: for a stream, order is not evidence even of content (F231, rule 15's "order is not evidence of authorship", read for streams).*
3. **A stream ends only by a closing act its opener signs, naming the last segment** (F232, 3: "Yes"); no clock says a stream has ended; **a stream never closed has a name and segments and no recording** (stated cost). Refunds are not the closing act's business: **"Refunds are a case by case business between participants and the terms are what was agreed"** (F215, F219).
4. **No work hash while open; once closed, its recording's work hash is computed from its segments in order** (F230, F232, 4): `tagged_hash("MOR/work", plaintext)` over the concatenation of the segments' unlocked bytes, from the first to the last segment the closing names, along the chain (mechanic, the build's: the concatenation; a media Module may define a container instead, named in the opening's field 0). **A fork is "a state not wished by MOR" that exists** ("Same as a work branch, a state not wished by MOR exists"): while forked, both branches are shown as a fork; **the closing act chooses the branch that becomes the recording**, the other a visible leftover becoming no recording. *F237 replaces F232's "a claim on the stream covers its recording": the recording is claimed by an ordinary work claim, dated by itself under Agreements rule 15, so nothing is backdated (the announcements review, finding 1); a claim on the stream's name covers nothing it became.*
5. **An offer selling access to a stream must name it**, by its opening act, **and carry a description** (F232, 5: "It must name it, and carry a description. As sloppy as they wish, or as detailed as needed."). Where the opening act is an announcement, the offer names it as `[ 3, announcement ]` and the core requires its words (Agreements, the offer format; F237); where it is a first segment, as `[ 2, [ this cMIP, name ] ]` with its words (mechanic, the build's). Each sale's state, pending, confirmed or contested, is the core's (Agreements rule 32b); a lone streamer's offer unchanged (F215).
6. **A stream and its recording are two things** (F232, 6: "Yes, they are two separate things. One is a live event, one is a series of bytes that can be sold for access. Whether the offer bundles them, it's up to the seller."): while it runs, a stream is sold by access offers; once closed, its recording is published like any work. An offer may bundle both, naming the recording in a later version once published.
7. **The buyer's check, client conformance, where it can** (F232, 7: "If it can, users also talk when streams go down"): for access to a stream, a buyer's client SHOULD check each segment is signed by the opener (or its grant key) and chained to the stream it paid for, in place of the work hash; where it cannot, the community's word does the rest. *A buyer confirming delivery does it in the core's grammar: its own claim for the payment acknowledging an act about the stream (Agreements rule 32b), a segment among them.*
8. *Standing:* a fork's meaning is this cMIP's (Envelopes rule 2); everything about how it streams (segment format, timing, keys, how segments join into the recording, how forks are shown) is this cMIP's and its Modules'.

## Costs, stated

- **A rotation voids the opener's own acts after the kept tip, never a name others wrote down** (F237, correcting F230's "a rotation that voids the opening act voids the name"; the announcements review, finding 8). What others signed naming the id (an offer, a stake, a claim) stands, pointing at a void act, shown so; a stream whose opening is void has no opener, and the opener's segments after the kept tip are void with it. *Anchor or bear the loss (F169), applied to a name.*
- **A stream never closed has no recording** (rule 3).
- **A buyer who cannot check segments takes the community's word** (rule 7).

## Open in this draft

*F237: "Fable's questions 1 to 7 dissolve into the cMIPs." Those that bear on streams, for whoever takes this cMIP up:*

- **Who computes the recording** (announcements review, finding 5): a verifier without the segments' keys and this cMIP takes the closing's field 2 on its word; one holding them checks it and shows a mismatch as inconsistent, as Envelopes rule 14a checks a size. Rule 4's "computed" is read so here.
- **Two closings; a closing naming a segment off the chain; offers after a closing** (finding 6). *As drafted (mechanic, the build's, untested):* two closings are the opener's fork, the stream becoming no recording until a closing naming both; a closing naming a segment not reached from the opening along the chain is invalid; a closing ends no offer, the seller's own `until` and withdrawal do.
- **Access to things that are not streams** (F232's "not yet decided"): other kinds of announcement (tickets, preorders, commissions) are other cMIPs' (F237).

## Freeze scenarios

- Scenario 17 (live sports) and scenario 6 (a streaming service), where they sell live access: the stream's announcement, offers naming it, sales confirmed by the buyer's claim acknowledging a segment, a stranger's segment shown as a fork, a recording claimed by its own work claim. *No code yet: this draft is written for the core's tests (`core/tests/review_live_work.rs`) and for a builder.*
