# Test split service (mor-split-service)

**A TEST split service**, on regtest only, so that a work's sales, or a collective's income, can be paid and divided among everyone who shares in it, as Agreements draft 17 (rules 11 to 23, "Publication (type 6)", "Split plan and split (type 8)"), the split cMIP (draft 4, `cmips/cmip-split-draft-4.md`) and the money messages cMIP (draft 4, 4.4) describe. Its coins are regtest coins, worth nothing. Never for real money.

**Round 8 (F407):** the service reads a publication (Agreements type 6) naming it, and the shares by reference to the ownership agreement in force: `accept` signs a publication or a collective's split agreement, `tag` signs or withdraws its price tag, `watch` follows a collective, `tick` pays what came in (split cMIP draft 4). Grant keys are gone. Report: `docs/suite-r8-report.md`.

## In plain words

On first start it makes its own test identity and says where it is paid (its Lightning node, carol by default).

Someone selling a work writes a **publication**: what is sold, who shares in it (partners, a referral for whoever brought the buyer), and which split service receives the money: this one. The service **signs the publication**, as every party does, and puts **its own price tag** on it: the price, payable to the service itself. A buyer's wallet pays the tag, so the money reaches the service **in its own name**. The service signs the receipt, waits a moment for the buyer's claim (which names the repost the buyer followed, for the referral), then publishes **the split** and **pays everyone**: the partners and the referral off the top, what is left to the owners. It tells the seller of the sale, so the seller's app delivers the work's key.

A collective that wants its income divided among its members makes a **split agreement**: a publication that sells nothing, naming the collective's ownership agreement and this service. The service finds it where the collective's acts are, signs it, and divides every tip to the collective among the members by their shares, read from the collective's agreement at each payment.

There are no grant keys any more: the service never signs in anyone else's name.

## Precisely

| File | What |
| --- | --- |
| `src/service.ts` | `SplitService`, below. |
| `src/cli.ts` | `npm start -- --regtest RUN_DIR --homes URL --relays URL [--node carol] [--payer alice] [--dir DIR] [--every SECONDS]`; while it runs, `node --import tsx src/cli.ts accept PUBLICATION [--dir DIR]` has it sign a publication naming it, and `… tag PUBLICATION [VALUE UNIT]` sign its price tag on one (no value: the tag withdrawn). Its folder `~/mor-split-service`. Its invoices are its node's; its payouts are paid from the same node or from `--payer`'s (on the regtest network only alice holds spendable funds, as human test 14 found). |

**The API** (`src/service.ts`; Edubba's and the desk's tests call it):

- `new SplitService(dir, node, { homes, relays })`; `await svc.start()`: its identity, inbox, encryption key and payee pointer (its node's Lightning address), made once, read back after. `svc.id`, `svc.state` (its pointer, the publications it signed, its tags, each payment and its payouts, its running counts).
- `await svc.accept(publication, extraPlaces?)`: signs a publication naming it as split service (field 3) or as a backup (field 11), by an Agreements signature act (rule 11). Refused, with why, where the plan names another split cMIP than draft 4's (`SPLIT_CMIP`), has a metric share (QS4), or holds an unfilled role open or sends it to a named party (QS3). Returns what it did, in words.
- `svc.watch(collective)`: each `tick` then reads the collective's places (`collectiveVerifier`) for publications naming the service and the collective, and signs them: how a member's split agreement for the collective is accepted without anyone running `accept`.
- `await svc.tag(publication, price | null)`: its price tag under a publication it signed (Money type 5, rule 18), naming the publication's first version, its payee the service; each call the next version (`objects` `[first, previous]`); `null` withdraws it. A split agreement takes none (rule 15). Returns the tag's id.
- `await svc.tick()`: one round, returning what it did in words: the watched collectives' publications signed; the inbox read (invoice requests, buyers' claims, payout answers, a publication sealed to it, which it signs); each paid invoice receipted, split and paid out.
- `readPublication(act)`: a publication's payload read as the service reads it.

**What it accepts** (an invoice request, the money messages cMIP draft 4): the payee is the service itself; what it follows is one of its price tags (or the designated party's, field 10) under a publication it signed, at exactly the tag's price (Money rule 18), its latest version, not withdrawn; or a publication it signed itself (a tip through the publication, a collective's split agreement among them). A publication whose latest version sells nothing is ended (rule 11). A purchase the commitment names must be the publication's ownership agreement. Lightning only, to its own pointer.

**The receipt** is the service's own, signed with its own key, payee itself, sealed to the payer; field 9 is the commitment's (rule 18: the payment decides).

**The split** (type 8), as the split cMIP draft 4's `divide` computes it (`cmips/split/src/lib.rs`): each partner its share in millionths of the payment, rounded down, off the top (payout key 8, its index in field 2); the referral role off the top where the payer's own claim names a repost (payout keys 3 and 4, the claim the evidence), else left to the owners' line (plan key 3 absent); then **the owners' line, what is left**, every unit the rounding leaves included: a lone seller's drafter, whole; or the holders of the ownership agreement's one stake (read by reference, at the version in force: for a collective, its agreement in force), by their shares, rule 9, ties by turns from the service's running count on that line (payout key 2 naming the agreement; split key 4 the running count; key 5 one numbering per publication). Field 3 names the publication by its first version. Delivered to every receiver, sealed. Each payout is then asked of its receiver as a simple Money payment, the receiver's answer checked by the rail's rule, paid from the node, its claim sent.

**Every hop has its receipt** (round 9, F411; Nobody, allegedly: "the service signs its receipt, then the members sign theirs after the split. Each hop has its receipt"). In plain words: the buyer's payment is receipted by the service, in its own name; then each person paid from the split receipts their own payout, with their own key, and the receipt names the split it came from. Precisely: a payout's commitment fulfils the split act (Agreements rule 23, "with its own receipt naming the split"), so the receiver's receipt, which names what the payment fulfils (Money receipt field 5), names the split; the receiver's app signs it (Damgar by itself under its receipts lane, or by hand) and seals it to the service, which keeps it (`onReceipt`). `svc.hops()` lists each payment received and its hops: the service's own receipt first, then each payout's, by its receiver.

**A sale** of a bake or a vow the publication sells is told to the drafter and the owners' line's receivers (draft 4, 7.2.3), so the seller's app delivers the key. A tip sells nothing.

A payment that waits for its buyer's claim is split without one after three rounds: the referral, if nobody is named, goes to the owners' line. This wait is the build's own, a reading to confirm.

*Readings, for the lead:* a collective's income through its split agreement is paid **to the service, naming the split agreement** (a tip through a publication, Money rule 18), because a split service receives in its own name and signs no receipt in anyone else's (rule 16); a payer's commitment naming the collective as payee is refused. The ownership agreement's version in force is read, for a collective, as its agreement in force (`collectiveNow`); for a work's ownership agreement, its founding version (this test service follows no other line). Backups (field 11) are signed but not tried in order: the service only answers what is asked of it.

## Tests

`npm test`: the type check, then `test/split.test.ts` against real homes and a relay on local ports, the buyer's side written out as a wallet makes it: a lone seller's publication signed by the service, counted by the core (`agreementsPublication`), its tag counting under it (`agreementsTagUnder`); a wrong amount refused; a payment split 50 to the partner, 100 to the referral named in the claim, 850 to the seller; the sale told; the tag withdrawn and refused after. And a collective's split agreement, found by watching the collective and signed; two tips of 1 001 divided among the three members by their shares, each payout naming the ownership agreement, the leftover units taking turns. Also used in `clients/desk` (Edubba's Money tab).
