# Finding and cataloguing: prior art for DubWeb

*Research session B for DubWeb (the Dubsar Suite), 20 November 2026. A record of research, not a decision. Every "For DubWeb" paragraph is this session's suggestion, for Nobody, allegedly, to accept or refuse. It states no MOR rule: where it touches one, it asks.*

## Summary

1. A reader can only know that nothing was skipped if each author's posts are numbered or chained. Time cursors skip silently. Nostr documents this fault in its own text; Bluesky's Jetstream moved from time cursors to sequence numbers in 2026.
2. Feeds that are honest about gaps show them: Mastodon's web app puts a "load more" marker where posts are missing. No decentralized client checked here shows a proven "you are caught up".
3. Directories are either curated with entry rules, or open with signals. Both name impostors the same way: the key or domain is the identity, the display name is not.
4. Mature catalogues never delete. They keep rejected and replaced texts, link old to new in both directions, and say why.
5. Catalogue editors who stay credible do not judge merit (Bitcoin). Readers choose whose judgement to apply (Bluesky labelers, NostrHub).
6. "Running code" is the common test: two independent implementations, shared test suites, public result tables.
7. A hash proves the bytes, never the worth or the author. A signed name beside the hash carries trust.
8. Honest usage counts come from code and logs, and publish their own bias next to the number.
9. Fair comparison fixes the questions before reading the answers, and records the options that lost.
10. A silent fault like Dub's cursor is caught by an alarm that fires when an expected signal is absent.

## How this was checked

This session's network reached GitHub only. Each link below was opened and read. Where the official page was out of reach, the link goes to the same text in the publisher's own source repository. RFC texts were read from a third-party mirror and not compared with rfc-editor.org. Claims that could not be opened are listed at the end as "not checked", and nothing in the sections rests on them.

## 1. Feeds: order, gaps, and knowing nothing was skipped

**Order.** Mastodon lists "chronological timeline updates" as a feature ([Mastodon README][masto-readme]). Bluesky's home timeline is "expected to be some form of reverse-chronological feed", and ranking has moved to separate feed generators ([getTimeline][bsky-timeline]). A feed generator returns only a list of post addresses and the app fills in the posts ([custom feeds][bsky-feeds]). On Nostr the choice sits in the client. Damus shows a personal feed and a global feed ([Damus][damus]). Primal serves feeds from its own caching server and scores trending posts ([Primal server][primal]). Coracle lets the reader build feeds by person, relay and topic ([Coracle][coracle]). Amethyst supports relay lists and negentropy syncing ([Amethyst][amethyst]). Nostr also lets third parties sell ranked feeds: each provider "uses its own algorithm" and returns a list of posts ([DVM kind 5300][dvm5300]).

**Where the posts are.** A Nostr reader must ask the right relays. NIP-65 says clients should fetch a person's posts from that person's write relays ([NIP-65][nip65]). The Gossip client is built on this idea ([Gossip][gossip]). Ask the wrong relays and posts are missing with no sign.

**Paging by time skips.** Nostr filters use `since` and `until` on the post's own timestamp ([NIP-01][nip01]). The relay's "end of stored events" message does not say whether the relay held more ([NIP-67][nip67]). NIP-67 states that clients guess completeness from the count, then page with `until`, and "risk missing events that share that timestamp" ([NIP-67][nip67]). Its fix, merged in June 2026, is an optional hint from the relay: `finish` or `more` ([NIP-67 pull request][nip67-pr]). That is the relay's word, not a proof. Bluesky advises feed builders to make the cursor "unique per feed item", for example a timestamp plus the post's hash ([feed generator][bsky-feedgen]).

**Numbers instead of time.** Secure Scuttlebutt numbers every message of a feed (1, 2, 3…) and each names the one before it ([SSB guide][ssb-guide]). A validator checks the number, the previous hash and the signature ([ssb-validate][ssb-validate]). A reader then knows exactly what it lacks. The AT Protocol does this per account: each change carries a `rev` and the `since` of the one before, and a consumer that sees a mismatch marks the account out of sync and fetches it whole ([AT sync][at-sync], [subscribeRepos][at-subscribe]). Its stream numbers "may contain arbitrary gaps", so a missing stream number proves nothing; the per-account check does the work ([AT event stream][at-stream]). Jetstream's first version used time cursors and told clients to "rewind a few seconds" ([Jetstream legacy][jetstream-legacy]). Its 2026 rewrite uses sequence numbers ([Jetstream][jetstream]).

**Comparing sets.** Nostr's NIP-77 lets a client and a relay find out which posts each lacks, without sending them all ([NIP-77][nip77], [negentropy][negentropy]). The strfry relay uses it to sync ([strfry][strfry]). It only compares with one relay, and says nothing of posts that relay never had.

**Showing gaps.** Mastodon's home feed is a stored list of at most 800 posts ([feed manager][masto-feed]). Its web app inserts a gap marker when a page is partial or the connection dropped, shown as a "Load more" button ([timelines reducer][masto-gap], [LoadGap][masto-loadgap]). Mastodon also saves the reader's place on the server ([markers][masto-markers]). Replies still go missing between servers ([issue 26863][masto-replies]). Feed readers of the RSS kind track read and unread per item and show counts per feed ([Miniflux API][miniflux]). ActivityPub's outbox has a `totalItems` count, which can show that a number is wrong but not which post is missing ([ActivityStreams][as2]).

**For DubWeb (suggestion):** Dub's cursor should be a position in each author's own numbering, never a time, if MOR gives one (see open question 1). Dub should show a visible gap marker wherever it cannot prove continuity. It should say "caught up" only when it can show the last number it holds for each followed author and where it checked. The two-day fault needs a check that fails loudly: a known test post, sent on a schedule, that Dub must display, with an alarm when it is absent (section 5).

## 2. Directories of people and of things

**Nostr.** A person's relay list is a signed, replaceable record ([NIP-65][nip65]). A relay describes itself in a document that is entirely self-reported ([NIP-11][nip11]). Independent monitors publish what they measure, and the text warns that a monitor "may publish erroneous" data and that clients should not trust a single source ([NIP-66][nip66]). nostr.watch is built on this ([nostr-watch][nostr-watch]). A name such as `bob@example.com` maps to a key through the domain; the text says it is "not intended to verify a user" and that clients "must always follow public keys" ([NIP-05][nip05]). Lists of people to follow together exist as "starter packs" ([NIP-51][nip51]). Against spam: search should leave spam out by default ([NIP-50][nip50]); reports can name `spam` or `impersonation`, but relays are told not to moderate on reports automatically "as they can be easily gamed" ([NIP-56][nip56]); proof of work is offered as a deterrent ([NIP-13][nip13]); and a reader can name providers who score accounts on the reader's behalf ([NIP-85][nip85]). Coracle uses web-of-trust scores "for less spam" ([Coracle][coracle]).

**Bluesky.** A feed is a record in its maker's account, addressed by that record ([custom feeds][bsky-feeds]). A starter pack is a name, a list of people and at most three feeds ([starter pack record][bsky-starterpack]). A handle is a domain name that must point to the account and be pointed back; otherwise "anybody could create handle aliases for third-party accounts" ([handle spec][at-handle]). A verification is a record one account writes about another, valid only if the app trusts the issuer, and only while the subject's handle and display name are unchanged ([verification record][bsky-verification]). Moderation is done by labelers; the reader chooses which to apply ([moderation architecture][bsky-moderation]).

**Mastodon.** The profile directory lists only accounts that opted in ([discoverability][masto-discover]). A profile link is verified when the linked page links back; the docs say blue ticks "are not possible without a central authority" ([profile][masto-profile]). The server list on joinmastodon.org is curated: entry rules, manual review, and no "brand new and unproven servers" ([covenant][masto-covenant]). Search shows verified links to tell results "from impersonators" ([Mastodon 4.2][masto-42]). Mastodon's 2026 lists of people need consent, are capped at 25, and have no "follow all", because long lists are "easier to use for spam" ([Mastodon 4.6][masto-46]). A server with no active moderator for a week switches to approval-only sign-up ([config][masto-config]).

**For DubWeb (suggestion):** Ummia is an open directory, so it needs signals, not a gate. Show the signing identity itself beside every title; a title is the author's claim and anyone can copy it. Show another person's word about a specification as that person's word, which the specification card draft already requires. Let the reader choose whose cards and marks count, as labelers and NIP-85 do. Never trust one counter or one monitor alone.

## 3. Catalogues of specifications

**IETF.** The datatracker page for a draft shows its state, its versions, and links both ways: replaces and replaced by, obsoletes and obsoleted by, updates and updated by, plus patent claims and what refers to it ([datatracker template][dt-template]). Drafts expire: after six months by the process text, 185 days by the tool's setting ([RFC 2026][rfc2026], [datatracker settings][dt-settings]). Anyone may post an individual draft; a working group may adopt it, which is "adoption, not approval" ([RFC 7221][rfc7221]). A group "is free to pursue more than one" competing draft, and a forced merge "can produce a weaker result" ([RFC 7221][rfc7221]). Decisions are by rough consensus, not votes: "lack of disagreement is more important than agreement", and every issue must be addressed "but not necessarily accommodated" ([RFC 7282][rfc7282]). The top level needs "at least two independent interoperating implementations" ([RFC 6410][rfc6410]). Drafts may list known implementations, removed before publication ([RFC 7942][rfc7942]).

**Python.** A PEP has one status from a fixed list, including Rejected, Withdrawn and Superseded ([PEP 1][pep1]). A superseded PEP names its successor and the successor names it back ([PEP 1][pep1]). Rejected PEPs stay: "it is still important to have a record of this fact" ([PEP 1][pep1]). Each PEP records its rejected ideas and why ([PEP 1][pep1]). The index groups PEPs by status ([PEP 0 generator][pep0]). Competing PEPs are normal: PEP 517 won over PEP 516 and keeps an appendix comparing the two ([PEP 517][pep517]). Once, core developers chose among competing governance PEPs by ranked vote ([PEP 8001][pep8001]).

**Rust.** Every RFC must answer "what other designs have been considered and what is the rationale for not choosing them?", and list prior art and unresolved questions ([RFC template][rust-template]). A final comment period is opened with a stated outcome: merge, close or postpone ([Rust RFCs README][rust-readme]). A merged RFC "is not a rubber stamp"; a separate tracking issue follows the building ([Rust RFCs README][rust-readme]).

**Bitcoin.** The current process has four statuses: Draft, Complete, Deployed, Closed ([BIP 3][bip3]). Editors "do NOT evaluate whether the proposal is likely to be adopted", and the repository "does not track the sentiment on proposals" ([BIP 3][bip3]). A competing variant must be a separate BIP, and BIPs are never deleted ([BIP 3][bip3]). The earlier comment system was dropped because one or two comments "ended up dominating the comment summary" ([BIP 3][bip3]). The competing block-size BIPs all remain listed, closed ([BIPs README][bips-readme]).

**Nostr.** A NIP should be "fully implemented in at least two clients and one relay", and "there should be no more than one way of doing the same thing" ([NIPs README][nips-readme]). Replaced NIPs stay in the list, struck through, marked "unrecommended" with a short reason, such as "deprecated in favor of NIP-17" ([NIPs README][nips-readme], [NIP-04][nip04]). The README admits its index "can be challenged" and can fork ([NIPs README][nips-readme]). NostrHub is such a challenge: specifications are signed posts, anyone may approve one, but "only approvals from your experts count", and apps are rated per specification ([NostrHub][nostrhub]).

**W3C and the web.** A text moves from Working Draft through Candidate Recommendation to Recommendation, and must show "adequate implementation experience"; old texts are marked Superseded, Obsolete or Rescinded ([W3C Process][w3c-process]). WHATWG requires "the support of at least two implementers" for any addition ([WHATWG Working Mode][whatwg]). Shared tests give a public table of results per browser ([wpt.fyi][wptfyi]). "Baseline" turns that data into a plain label of what is safe to use ([Baseline][baseline]).

**Package registries.** npm's search matches keywords and claims "no subjective ranking criteria"; it can sort by downloads or by number of dependents, and hides deprecated packages ([npm search][npm-search]). A deprecation is a warning with a message, not a deletion ([npm deprecate][npm-deprecate]). crates.io sorts by recent downloads among other orders, and a withdrawn version "does not delete any code" ([crates.io listing][crates-sort], [cargo publishing][cargo-yank]). Impostors are a known problem: crates.io checks new names against popular ones, after a 2022 case of malware under a look-alike name ([typosquat job][crates-typosquat], [rustdecimal][rustdecimal]). npm's provenance mark proves where a package was built but "does not guarantee the package has no malicious code" ([npm provenance][npm-provenance]).

**For DubWeb (suggestion):** Keep every text, including losers, with a reason. Link drafts of one text in both directions. Group competitors by the task they fill, and when one wins, keep a short comparison beside it, as PEP 517 does. Use few statuses. Separate three things that catalogues often blur: what the author says (the text), what was measured (use and tests), and what DubWeb proposes (keep, merge, replace), each labelled with whose it is. A proposal is not a decision.

## 4. Discovery by hash

A hash names content and proves the bytes; it does not say where the content is ([IPFS content addressing][ipfs-ca]). Any change gives a new hash ([IPFS content addressing][ipfs-ca]). Even the same bytes can get different names under different settings ([IPFS content addressing][ipfs-ca]). Content survives only while someone keeps it ([IPFS persistence][ipfs-persist]), and listings of who holds it expire ([Kubo config][kubo]).

So every system adds names on top. IPFS adds signed pointers that can be updated, and domain names that point to a hash ([IPNS][ipns], [DNSLink][dnslink]). Git adds branches and tags, because remembering hashes "isn't practical", and signed tags to say who vouches ([Git objects][git-objects], [Git refs][git-refs], [Git signing][git-signing]). Nix puts a readable name next to the hash in one string ([Nix store path][nix-path]), and accepts a download only if a trusted key signed it or the content matches a declared hash ([Nix settings][nix-trust]).

Short hashes are a trap. The Linux kernel asks for at least 12 characters, since shorter ones collide as a project grows ([kernel patches guide][linux-abbrev]). Git lengthens its short form automatically ([git core.abbrev][git-abbrev]).

Trust beyond the bytes comes from many eyes. Go's checksum log defines correct as "the same code everyone else downloads" ([Go sumdb design][go-sumdb]). Trustix compares what independent builders got for the same input ([Trustix][trustix]). Each new version has a new hash, so lineage must be recorded apart: Git commits name their parents ([Git objects][git-objects]). Signing and hashing also need one exact byte form of a text ([JSON canonicalization][jcs]). The classic framing is that a name cannot be at once secure, decentralized and meaningful to people, so each person keeps their own names for keys ([petnames][petnames]).

**For DubWeb (suggestion):** In Ummia, always show the hash with the title and the signing identity, as Nix shows name and hash together. Show the full hash on copy, and enough characters on screen to stay unique. Let a search by title return every text with that title, grouped by author, never "the" result. Show where the text can be fetched and whether anyone still holds it. Show the draft lineage, since the hash alone hides that two texts are drafts of one work.

## 5. Comparing competing solutions fairly

**Decision records.** An ADR has a title, status, context, decision and consequences ([Nygard template, transcribed][adr-nygard]). A replaced record is kept and marked "superseded by" its successor ([MADR template][madr]). MADR adds the drivers of the decision, the options considered, and the good and bad of each ([MADR template][madr]). One well-known guide admits its teams edit records in place all the same ([ADR guide][adr-guide]).

**Alternatives sections.** Rust, Python, Go and Kubernetes all require the author to write down the options not taken and why ([Rust template][rust-template], [PEP 1][pep1], [Go template][go-template], [KEP template][kep]). Kubernetes also asks "why should this KEP not be implemented?" and sets criteria for each stage in advance ([KEP template][kep]).

**Questions fixed first.** The IETF's choice of a password protocol in 2019 was run in the open: eight candidates, a table of every review with its reviewer, a shortlist, then the same written questions put to each remaining candidate ([CFRG PAKE selection][pake]). The W3C's design principles give an order for settling conflicts: users before authors, before implementers, before specification writers, before "theoretical purity" ([W3C design principles][w3c-tag]).

**Result tables from code.** The QUIC interop runner runs every implementation against every other and builds the table itself, checking the files that arrived instead of taking an implementation's word ([QUIC interop runner][quic-interop]). Bowtie does the same for JSON Schema, and CommonMark's text carries over 500 examples that serve as tests ([Bowtie][bowtie], [CommonMark][commonmark]). JavaScript's process requires two implementations that pass the shared tests, and has a stage for writing those tests first ([TC39 process][tc39]).

**Honest counts.** Chrome counts feature use per page load from the browser's own code, uses it for removal decisions, and names its bias: firms that turn metrics off are under-counted ([Chrome UseCounter][usecounter]). Rust tests a compiler change against every published crate, and states that "not all code is on crates.io" ([Crater][crater]). Python's packaging guide calls its own download counts "highly inaccurate", lists the causes, and adds that many downloads do not mean good ([PyPI downloads][pypi-downloads]). The Web Almanac measures about 17 million real sites and lists its limits ([Web Almanac methodology][almanac]). By contrast, IETF implementation lists are self-reported ([RFC 7942][rfc7942]), and Nostr's "two clients and one relay" rule is not measured anywhere in its repository ([NIPs README][nips-readme]).

**Catching silence.** A standard alert in Prometheus setups always fires; the alarm is raised when it stops arriving ([Watchdog][watchdog]). Prometheus's guidance says to test the whole path from outside, and to alert when a job "has not succeeded recently enough" ([Prometheus alerting][prom-alerting]).

**For DubWeb (suggestion):** Compare in this order. First, fix the questions per task before reading the competing texts, and publish them. Second, fill a table from two sources kept apart: what each text says, and what was counted. Third, count use from the round's signed acts and from code, by a method written down so anyone can repeat it; publish the number with its date and its known bias. A count of zero from a faulty counter looks the same as no use, so each count needs a check that the counter itself worked. Fourth, record the options that lose, with the reason, in the entry of the one that wins.

## Proposed shape of one catalogue entry

A proposal by this session. "Source" says how the field is filled: **text** (read from the specification), **signed** (taken from a signed act), **counted** (computed from acts or code by a stated method), or **DubWeb** (DubWeb's own word, labelled so).

| Field | What it holds | Source | Prior art |
| --- | --- | --- | --- |
| Task | The job the text fills; the key for grouping competitors | text | PEP index groups ([PEP 0][pep0]); competing drafts in one group ([RFC 7221][rfc7221]) |
| Spec hash | The full hash; the entry's identity | signed | Content addressing ([IPFS][ipfs-ca]); full-length hashes ([kernel][linux-abbrev]) |
| Title and summary | The author's own words, shown as a claim | text or card | Name beside hash ([Nix][nix-path]); the Dubsar Specification Card draft (`cmips/cmip-specification-card-draft-2.md`) |
| Author | The signing identity, never a display name alone | signed | "Follow public keys" ([NIP-05][nip05]); handle must point both ways ([AT handle][at-handle]) |
| Draft lineage | Earlier and later drafts of the same work, linked both ways | text, checked | Replaces / replaced by ([datatracker][dt-template]); Superseded-By and Replaces ([PEP 1][pep1]) |
| Status | One of a few words, for example: draft, in use, replaced, closed | DubWeb | Four statuses ([BIP 3][bip3]); "postponed" as its own state ([Rust][rust-readme]) |
| Mark and reason | For example "unrecommended: prefer X", one line of why | DubWeb | Unrecommended marks ([NIPs README][nips-readme]); deprecation message ([npm][npm-deprecate]) |
| Competitors | Other entries with the same task, with a link to the comparison | DubWeb | PEP 517's appendix on PEP 516 ([PEP 517][pep517]); "separate BIP" for a variant ([BIP 3][bip3]) |
| Options not taken | What the author considered and refused, and why | text | Rationale and alternatives ([Rust][rust-template]); Rejected Ideas ([PEP 1][pep1]); considered options ([MADR][madr]) |
| Implementations | Independent code that implements it, with release references | signed (card) | Two implementations ([RFC 6410][rfc6410], [TC39][tc39], [WHATWG][whatwg]); self-report labelled as such ([RFC 7942][rfc7942]) |
| Test results | Which implementations pass which vectors | counted | Result tables ([QUIC interop][quic-interop], [wpt.fyi][wptfyi], [Bowtie][bowtie]) |
| Used by | Acts and apps that used it in the round | counted | Counts from code ([UseCounter][usecounter], [Crater][crater]) |
| Count method | How "used by" was counted, when, and its known bias | DubWeb | Bias published with the number ([UseCounter][usecounter], [PyPI][pypi-downloads], [Almanac][almanac]) |
| Open findings | Known faults and unanswered questions | text and DubWeb | Unresolved questions ([Rust][rust-template]); tracking issue ([Rust][rust-readme]) |
| Others' word | Cards and marks by other people, each shown with its signer | signed | Reader-chosen experts ([NostrHub][nostrhub]); labelers ([Bluesky][bsky-moderation]); no single source ([NIP-66][nip66]) |
| Proposal | Keep, merge or replace, with the reason; DubWeb's, not a decision | DubWeb | Stated outcome: merge, close, postpone ([Rust][rust-readme]); editors do not judge adoption ([BIP 3][bip3]) |
| Where held | Where the text can be fetched now | counted | Content lasts only while held ([IPFS persistence][ipfs-persist]) |

## Open questions

1. Does MOR give each identity's acts a number or a chain a reader can check for gaps? The specification card draft speaks of "the creator's own sequence". This session did not read the MIRs for it and will not guess. Dub's cursor design depends on the answer.
2. What was Dub's cursor made of when it skipped posts: a time, a count, a relay's position? The fix differs for each.
3. Who may say that two specifications fill "the same task": the authors, DubWeb, or anyone by a signed card?
4. Should a mark such as "unrecommended" be DubWeb's signed word, shown beside other people's marks, or should Ummia show one voice?
5. What counts as "used" in the round: an act that names the hash, an app that ships it, or a person who relied on it? Each gives a different number.
6. How is use counted for texts that no act names? The card draft says no act names the card cMIP's own hash, so a count from acts would read zero for it.
7. How many characters of a hash should Ummia show, and does MOR's form for people already settle that?
8. When a text loses, does its entry stay in Ummia's main list, struck through, or move to a separate list?
9. Should the catalogue's comparison questions be fixed before this round's texts are read, or is that already too late for this round?

## Not checked

These points are widely reported but their pages could not be opened from this session. Nothing above depends on them.

- Instagram's "You're All Caught Up" marker of 2018 (about.instagram.com).
- Bluesky's blog posts on starter packs and on verification: <https://bsky.social/about/blog/06-26-2024-starter-packs>, <https://bsky.social/about/blog/04-21-2025-verification>.
- Nygard's original 2011 post: <https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions>.
- The choice of SPDY as the base for HTTP/2 among three proposals in 2012.
- NIST's published criteria for its cryptography competitions: <https://nvlpubs.nist.gov/nistpubs/ir/2022/NIST.IR.8413-upd1.pdf>.
- npm's post on how robots inflate download counts: <https://blog.npmjs.org/post/92574016600/numeric-precision-matters-how-npm-download-counts-work.html>.
- The February 2024 spam wave on Mastodon; Goodhart's law; the Pugh matrix; the Google SRE book's monitoring chapter.
- The canonical RFC pages at <https://www.rfc-editor.org/>, read here from a mirror.

[masto-readme]: https://raw.githubusercontent.com/mastodon/mastodon/main/README.md
[bsky-timeline]: https://raw.githubusercontent.com/bluesky-social/bsky/main/lexicons/app/bsky/feed/getTimeline.json
[bsky-feeds]: https://raw.githubusercontent.com/bluesky-social/bsky-docs/main/docs/starter-templates/custom-feeds.mdx
[bsky-feedgen]: https://raw.githubusercontent.com/bluesky-social/feed-generator/main/README.md
[damus]: https://raw.githubusercontent.com/damus-io/damus/master/README.md
[primal]: https://raw.githubusercontent.com/PrimalHQ/primal-server/main/README.md
[coracle]: https://raw.githubusercontent.com/coracle-social/coracle/master/README.md
[amethyst]: https://raw.githubusercontent.com/vitorpamplona/amethyst/main/README.md
[gossip]: https://raw.githubusercontent.com/mikedilger/gossip/master/README.md
[dvm5300]: https://raw.githubusercontent.com/nostr-protocol/data-vending-machines/master/kinds/5300.md
[nip01]: https://raw.githubusercontent.com/nostr-protocol/nips/master/01.md
[nip04]: https://raw.githubusercontent.com/nostr-protocol/nips/master/04.md
[nip05]: https://raw.githubusercontent.com/nostr-protocol/nips/master/05.md
[nip11]: https://raw.githubusercontent.com/nostr-protocol/nips/master/11.md
[nip13]: https://raw.githubusercontent.com/nostr-protocol/nips/master/13.md
[nip50]: https://raw.githubusercontent.com/nostr-protocol/nips/master/50.md
[nip51]: https://raw.githubusercontent.com/nostr-protocol/nips/master/51.md
[nip56]: https://raw.githubusercontent.com/nostr-protocol/nips/master/56.md
[nip65]: https://raw.githubusercontent.com/nostr-protocol/nips/master/65.md
[nip66]: https://raw.githubusercontent.com/nostr-protocol/nips/master/66.md
[nip67]: https://raw.githubusercontent.com/nostr-protocol/nips/master/67.md
[nip67-pr]: https://github.com/nostr-protocol/nips/pull/2317
[nip77]: https://raw.githubusercontent.com/nostr-protocol/nips/master/77.md
[nip85]: https://raw.githubusercontent.com/nostr-protocol/nips/master/85.md
[nips-readme]: https://raw.githubusercontent.com/nostr-protocol/nips/master/README.md
[nostrhub]: https://raw.githubusercontent.com/soapbox-pub/nostrhub/main/README.md
[nostr-watch]: https://github.com/sandwichfarm/nostr-watch/blob/next/README.md
[negentropy]: https://raw.githubusercontent.com/hoytech/negentropy/master/README.md
[strfry]: https://raw.githubusercontent.com/hoytech/strfry/master/README.md
[ssb-guide]: https://raw.githubusercontent.com/ssbc/scuttlebutt-protocol-guide/master/index.html
[ssb-validate]: https://raw.githubusercontent.com/ssbc/ssb-validate/main/README.md
[at-sync]: https://raw.githubusercontent.com/bluesky-social/atproto-website/main/src/app/[locale]/specs/sync/en.mdx
[at-stream]: https://raw.githubusercontent.com/bluesky-social/atproto-website/main/src/app/[locale]/specs/event-stream/en.mdx
[at-subscribe]: https://raw.githubusercontent.com/bluesky-social/atproto/main/lexicons/com/atproto/sync/subscribeRepos.json
[at-handle]: https://github.com/bluesky-social/atproto-website/blob/main/src/app/%5Blocale%5D/specs/handle/en.mdx
[jetstream]: https://raw.githubusercontent.com/bluesky-social/jetstream/main/docs/README.md
[jetstream-legacy]: https://raw.githubusercontent.com/bluesky-social/jetstream-legacy/main/README.md
[bsky-starterpack]: https://github.com/bluesky-social/atproto/blob/main/packages/api/lexicons/app/bsky/graph/starterpack.json
[bsky-verification]: https://github.com/bluesky-social/atproto/blob/main/packages/api/lexicons/app/bsky/graph/verification.json
[bsky-moderation]: https://github.com/bluesky-social/bsky-docs/blob/main/blog/2024-03-15-blueskys-moderation-architecture/index.md
[masto-feed]: https://raw.githubusercontent.com/mastodon/mastodon/main/app/lib/feed_manager.rb
[masto-gap]: https://raw.githubusercontent.com/mastodon/mastodon/main/app/javascript/mastodon/reducers/timelines.js
[masto-loadgap]: https://raw.githubusercontent.com/mastodon/mastodon/main/app/javascript/mastodon/components/load_gap.tsx
[masto-markers]: https://raw.githubusercontent.com/mastodon/documentation/main/content/en/methods/markers.md
[masto-replies]: https://github.com/mastodon/mastodon/issues/26863
[masto-discover]: https://github.com/mastodon/documentation/blob/main/content/en/user/discoverability.md
[masto-profile]: https://github.com/mastodon/documentation/blob/main/content/en/user/profile.md
[masto-covenant]: https://github.com/mastodon/joinmastodon/blob/main/pages/covenant.tsx
[masto-42]: https://github.com/mastodon/blog/blob/master/content/posts/2023-09-16_Mastodon-4.2/index.md
[masto-46]: https://github.com/mastodon/blog/blob/master/content/posts/2026-06-17_Mastodon-4.6/index.md
[masto-config]: https://github.com/mastodon/documentation/blob/main/content/en/admin/config.md
[miniflux]: https://raw.githubusercontent.com/miniflux/website/main/content/docs/api.md
[as2]: https://raw.githubusercontent.com/w3c/activitystreams/main/index.html
[dt-template]: https://raw.githubusercontent.com/ietf-tools/datatracker/main/ietf/templates/doc/document_draft.html
[dt-settings]: https://raw.githubusercontent.com/ietf-tools/datatracker/main/ietf/settings.py
[rfc2026]: https://raw.githubusercontent.com/acidvegas/rfcs/main/rfcs/rfc2026.txt
[rfc6410]: https://raw.githubusercontent.com/acidvegas/rfcs/main/rfcs/rfc6410.txt
[rfc7221]: https://raw.githubusercontent.com/acidvegas/rfcs/main/rfcs/rfc7221.txt
[rfc7282]: https://raw.githubusercontent.com/acidvegas/rfcs/main/rfcs/rfc7282.txt
[rfc7942]: https://raw.githubusercontent.com/acidvegas/rfcs/main/rfcs/rfc7942.txt
[pep1]: https://raw.githubusercontent.com/python/peps/main/peps/pep-0001.rst
[pep0]: https://raw.githubusercontent.com/python/peps/main/pep_sphinx_extensions/pep_zero_generator/writer.py
[pep517]: https://raw.githubusercontent.com/python/peps/main/peps/pep-0517.rst
[pep8001]: https://raw.githubusercontent.com/python/peps/main/peps/pep-8001.rst
[rust-template]: https://raw.githubusercontent.com/rust-lang/rfcs/master/0000-template.md
[rust-readme]: https://raw.githubusercontent.com/rust-lang/rfcs/master/README.md
[bip3]: https://raw.githubusercontent.com/bitcoin/bips/master/bip-0003.md
[bips-readme]: https://raw.githubusercontent.com/bitcoin/bips/master/README.mediawiki
[w3c-process]: https://raw.githubusercontent.com/w3c/process/main/index.bs
[w3c-tag]: https://raw.githubusercontent.com/w3ctag/design-principles/main/index.bs
[whatwg]: https://raw.githubusercontent.com/whatwg/sg/main/Working%20Mode.md
[wptfyi]: https://raw.githubusercontent.com/web-platform-tests/wpt.fyi/main/README.md
[baseline]: https://raw.githubusercontent.com/web-platform-dx/web-features/main/docs/baseline.md
[npm-search]: https://raw.githubusercontent.com/npm/documentation/main/content/packages-and-modules/getting-packages-from-the-registry/searching-for-and-choosing-packages-to-download.mdx
[npm-deprecate]: https://raw.githubusercontent.com/npm/cli/latest/docs/lib/content/commands/npm-deprecate.md
[npm-provenance]: https://raw.githubusercontent.com/npm/documentation/main/content/packages-and-modules/securing-your-code/generating-provenance-statements.mdx
[crates-sort]: https://raw.githubusercontent.com/rust-lang/crates.io/main/svelte/src/routes/crates/+page.svelte
[cargo-yank]: https://raw.githubusercontent.com/rust-lang/cargo/master/doc/book/src/reference/publishing.md
[crates-typosquat]: https://raw.githubusercontent.com/rust-lang/crates.io/main/src/worker/jobs/typosquat.rs
[rustdecimal]: https://raw.githubusercontent.com/rust-lang/blog.rust-lang.org/main/content/malicious-crate-rustdecimal.md
[ipfs-ca]: https://raw.githubusercontent.com/ipfs/ipfs-docs/main/docs/concepts/content-addressing.md
[ipfs-persist]: https://raw.githubusercontent.com/ipfs/ipfs-docs/main/docs/concepts/persistence.md
[kubo]: https://raw.githubusercontent.com/ipfs/kubo/master/docs/config.md
[ipns]: https://raw.githubusercontent.com/ipfs/ipfs-docs/main/docs/concepts/ipns.md
[dnslink]: https://raw.githubusercontent.com/ipfs/ipfs-docs/main/docs/concepts/dnslink.md
[git-objects]: https://raw.githubusercontent.com/progit/progit2/main/book/10-git-internals/sections/objects.asc
[git-refs]: https://raw.githubusercontent.com/progit/progit2/main/book/10-git-internals/sections/refs.asc
[git-signing]: https://raw.githubusercontent.com/progit/progit2/main/book/07-git-tools/sections/signing.asc
[git-abbrev]: https://raw.githubusercontent.com/git/git/master/Documentation/config/core.adoc
[linux-abbrev]: https://raw.githubusercontent.com/torvalds/linux/master/Documentation/process/submitting-patches.rst
[nix-path]: https://raw.githubusercontent.com/NixOS/nix/master/doc/manual/source/store/store-path.md
[nix-trust]: https://raw.githubusercontent.com/NixOS/nix/master/src/libstore/include/nix/store/globals.hh
[go-sumdb]: https://raw.githubusercontent.com/golang/proposal/master/design/25530-sumdb.md
[trustix]: https://raw.githubusercontent.com/nix-community/trustix/master/README.md
[jcs]: https://raw.githubusercontent.com/cyberphone/json-canonicalization/master/README.md
[petnames]: https://raw.githubusercontent.com/cwebber/rebooting-the-web-of-trust-spring2018/petnames/draft-documents/petnames.md
[adr-nygard]: https://raw.githubusercontent.com/joelparkerhenderson/architecture-decision-record/main/locales/en-001/templates/decision-record-template-by-michael-nygard/index.md
[adr-guide]: https://raw.githubusercontent.com/joelparkerhenderson/architecture-decision-record/main/README.md
[madr]: https://raw.githubusercontent.com/adr/madr/main/template/adr-template.md
[go-template]: https://raw.githubusercontent.com/golang/proposal/master/design/TEMPLATE.md
[kep]: https://raw.githubusercontent.com/kubernetes/enhancements/master/keps/NNNN-kep-template/README.md
[tc39]: https://raw.githubusercontent.com/tc39/process-document/gh-pages/index.html
[pake]: https://raw.githubusercontent.com/cfrg/pake-selection/master/README.md
[quic-interop]: https://raw.githubusercontent.com/quic-interop/quic-interop-runner/master/README.md
[bowtie]: https://raw.githubusercontent.com/bowtie-json-schema/bowtie/main/docs/index.rst
[commonmark]: https://raw.githubusercontent.com/commonmark/commonmark-spec/master/README.md
[usecounter]: https://raw.githubusercontent.com/chromium/chromium/main/docs/use_counter_wiki.md
[crater]: https://raw.githubusercontent.com/rust-lang/rustc-dev-guide/master/src/tests/crater.md
[pypi-downloads]: https://raw.githubusercontent.com/pypa/packaging.python.org/main/source/guides/analyzing-pypi-package-downloads.rst
[almanac]: https://raw.githubusercontent.com/HTTPArchive/almanac.httparchive.org/main/src/templates/en/2024/methodology.html
[watchdog]: https://raw.githubusercontent.com/prometheus-operator/runbooks/main/content/runbooks/general/Watchdog.md
[prom-alerting]: https://raw.githubusercontent.com/prometheus/docs/main/docs/practices/alerting.md
