/* tslint:disable */
/* eslint-disable */

/**
 * The core library's verifier: holds the acts a client fetched, and judges
 * identity chains and acts from them alone (Identity, "Verification
 * procedures"). Nothing a relay says unsigned enters it.
 */
export class Verifier {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Hold a private act, opened with its content key.
     */
    addWithKey(bytes: Uint8Array, key: Uint8Array): string;
    /**
     * Hold an act. Returns its id. A malformed act is refused; a validly
     * shaped act with a bad signature is held and judged invalid.
     */
    add(bytes: Uint8Array): string;
    /**
     * An agreement as held: its parties, who signed, whether it exists (a
     * deal, founding terms) or is ready to be recorded (a collective's
     * clone), and the powers its mark must name. `specs`: the six MIR
     * hashes, and the layers of extensions it adds or drops.
     */
    agreementsAgreement(specs: any, id: string): any;
    /**
     * Whether an act under a grant binds the collective that issued it.
     */
    agreementsBacking(specs: any, act: string): any;
    /**
     * Whether the collective's act `x` counts as made before the line
     * `line` (a record or a rotation of it), on its own sequences (F109).
     */
    agreementsBefore(specs: any, x: string, line: string): boolean;
    /**
     * Where Agreements read a collective as broken and a rollback can bring it
     * back (Agreements rule 37d, F185): `{ act, before, reason }`, the broken act
     * (a rotation of the collective), the agreement in force just before
     * it, a rollback's parent, and Agreements' reason; null otherwise.
     */
    agreementsBrokenAct(specs: any, collective: string): any;
    /**
     * Why Agreements read a collective as broken (the agreement its latest key
     * lives under cannot be found: a rotation's declared clone incomplete,
     * a false mark, rules 37 and 45a), or null where it reads it as working.
     */
    agreementsBroken(specs: any, collective: string): string | undefined;
    /**
     * As `moneyChoose`, the pointer in force read by Agreements (Money
     * draft 10, rule 7, F358): for a collective, a pointer signed with the
     * member keys of its area reaching Money counts where that area's
     * holders and threshold are met. `specs` as for every Agreements call.
     */
    agreementsChoose(specs: any, payee: string, amount: any, accepted: string[]): any;
    /**
     * Whether a claim on a work is shown as made after its release: the
     * release, if so (F121, D).
     */
    agreementsClaimAfterRelease(specs: any, claim: string, work: string): string | undefined;
    /**
     * A closing act, judged (rule 47a, F124 N9).
     */
    agreementsClosing(specs: any, id: string): any;
    /**
     * The collective whose genesis declares the root of `agreement`'s
     * lineage, where held: what null names in its terms (S1).
     */
    agreementsCollectiveOf(specs: any, agreement: string): string | undefined;
    /**
     * Agreements' answer for an act of a collective: which areas reach it, and
     * whether their holders' signature acts meet each (rule 36a, 44d).
     */
    agreementsConsent(specs: any, act: string): any;
    /**
     * The collective's state after everything held under its latest key:
     * the agreement in force, who left, who stepped down from which area,
     * which areas are frozen, its records. Null if it is not a collective.
     */
    agreementsCurrent(specs: any, collective: string): any;
    agreementsDealFork(specs: any, agreement: string): any;
    /**
     * A creditor's release, judged (Money type 4, F126; rule 47b):
     * whether it ends the obligation it names (signed by that obligation's
     * creditor, a collective by its Money lane).
     */
    agreementsDebtRelease(specs: any, id: string): any;
    /**
     * Who owes an obligation of a collective a fork closed (N13): the
     * successors it assigns it to, every successor where it assigns it to
     * none (F125, D1); null where its debtor is not closed by a fork.
     */
    agreementsDebtors(specs: any, id: string): string[] | undefined;
    agreementsDeclarationsNaming(specs: any, party: string): any;
    /**
     * The agreement an identity's chain declares at the chain act
     * `binding`, if any (for a rotation: the clone it declares).
     */
    agreementsDeclared(specs: any, identity: string, binding: string): string | undefined;
    /**
     * Whether an act in a collective's name is done (F126, F128): sealed to
     * every member, or public; where it is held decides nothing. `{ done,
     * why }`, or null where the act is not in a collective's name.
     */
    agreementsDone(specs: any, act: string): any;
    /**
     * Every fork and closing of `collective` held, complete or not: what a
     * new ending names in its `objects`, `[agreement, ending]` (F131 IT1,
     * client conformance).
     */
    agreementsEndingActs(specs: any, collective: string): string[];
    /**
     * Client conformance (rule 45b, F186): the alarm a seller's client and
     * a split service raise when a payment names a version of the deal that
     * does not descend from the version they hold. Null where it does;
     * else `{ named, held, shared, kind, heldLine, namedLine }`, `kind`
     * "fork" (the alarm), "unheld" (a version this verifier does not hold:
     * the alarm, F189 3) or "older" (a plain notice, F188 DQ7).
     */
    agreementsForkAlarm(specs: any, payment: string, held: string): any;
    /**
     * A fork of a collective, judged (rule 47a, F121 shape B, F124):
     * whether it closes the original, the members whose voice remains,
     * who signed and who leaves on no side, each side's default share, who
     * every successor keeps as a departed holder, each side's successor's
     * founding agreement where it fits, and the obligations in the history
     * it cites that it does not hand out, which keep it from taking effect
     * (F127, replacing F125 D1).
     */
    agreementsFork(specs: any, id: string): any;
    /**
     * What a fork of `collective` must hand out, its line the acts `line`
     * it would cite on the collective's chain, with `agreement` in force
     * there: every obligation in that history, its own and those an
     * earlier fork handed to it. Null where the line does not hold.
     */
    agreementsHandOut(specs: any, collective: string, agreement: string, line: string[]): string[] | undefined;
    /**
     * The agreement in force for an act of a collective (rule 37c, F109),
     * or null if its signer is not a collective.
     */
    agreementsInForce(specs: any, act: string): string | undefined;
    /**
     * The acts the history of a line citing `line` on the collective's
     * chain names that this verifier does not hold: a member's client signs
     * no fork or closing while any is missing (client conformance).
     */
    agreementsLineUnheld(specs: any, collective: string, line: string[]): string[];
    /**
     * Who counts for a power (`{ form, area }`, as `agreementsClonePlan` gives
     * it) of the collective's agreement in force, at its next line, after
     * every act held (rule 44d), `leaving` taken out: the agreement, the
     * parties counted among, the voices that remain, and how many meet it
     * (null where none remains); or `{ error }`, why there is no such count.
     */
    agreementsNextVoices(specs: any, collective: string, power: any, leaving: string[]): any;
    /**
     * Whether an obligation binds its debtor: for a collective, once done
     * (F128, N13's public outside withdrawn); null if not one.
     */
    agreementsObligationBinds(specs: any, id: string): boolean | undefined;
    /**
     * The payments a collective received during a broken stretch and owes
     * back, the sale not signed anew after the rollback (rule 37d, RB2):
     * open obligations, each `{ payment, to, unit, value, stillBroken,
     * unknown }`. An entry is marked `unknown` where it rests on a record
     * whose payment `specs.railPayments` does not state, or on one whose
     * rail answer `specs.railValid` does not give (Money rules 8 and 12).
     */
    agreementsOwedBack(specs: any, collective: string): any;
    /**
     * What a collective owes now (F125, D5): its obligations that bind,
     * and those it owes as a fork's successor, neither paid in full by the
     * receipts held nor ended by a creditor's release.
     */
    agreementsOwes(specs: any, collective: string): string[];
    /**
     * What is paid toward an obligation, as a binding answer: an error
     * coded `agreements/own-attempt` where it rests on this client's own failed
     * attempts to reach homes, shown as unknown (F153); an error coded
     * `law/payment-unstated` where it rests on whether two receipts
     * or claims are one payment and `specs.railPayments` does not say
     * (Money rule 12, F380), shown as unknown.
     */
    agreementsPaid(specs: any, id: string): bigint;
    /**
     * The pointer check (rule 18, F123): whether the payee pointer of
     * `owners` counts for Agreements under `agreement`: "no-split-service",
     * "ordinary", "bypasses" (with the addresses no service's own pointer
     * carries, as hex) or "undetermined".
     */
    agreementsPointerCheck(specs: any, owners: string, agreement: string): any;
    /**
     * The payee's pointer acts its own acts hold, for what a payment
     * follows (an obligation, an agreement or an offer; Money rule 14,
     * F145, F157, F163, F168): `{ pointers, complete }`, or null where
     * `fulfils` is none of these.
     */
    agreementsPointerHolding(specs: any, fulfils: string, payee: string): any;
    /**
     * The payee pointer in force as Agreements judge it (F358): `{ act,
     * version, why }`, `act` null and `why` said where none counts.
     */
    agreementsPointer(specs: any, payee: string): any;
    /**
     * The tips a payment names (F409), for a publication by its first
     * version: `latest`, its latest versions (two or more, the parties'
     * fork); `tags`, the latest version of each price tag line that counts
     * under it, one per price; `owners` and `ownersLatest`, the ownership
     * agreement it names and that agreement's latest version, which a
     * purchase names in field 9.
     */
    agreementsPublicationTip(specs: any, first: string): any;
    /**
     * A publication, judged (Agreements rule 11): its parties and who has
     * not signed, whether it counts and why not, the latest versions of its
     * line, whether this version ends it, and the ownership agreements
     * claiming what it sells that it stands outside of (rule 14).
     */
    agreementsPublication(specs: any, id: string): any;
    /**
     * The resignations the parties of a collective's agreement published,
     * registered or not (rule 37a; F187, 3): departures `{ act, party,
     * kind, agreement }`. What a client reads beside Agreements' count of the
     * voices that remain, to warn the last voice.
     */
    agreementsPublishedResignations(specs: any, collective: string): any;
    /**
     * The contests shown beside a purchase (Agreements rule 54, "Contest
     * (type 14)", F386), by the act that is the purchase (the buyer's
     * payer's claim of the payment, or the buyer's signature act on an
     * offer at no price): the buyer's own contests of it, ascending. A
     * contest by anyone else shows nothing; for an act that is no
     * purchase, none shows. `specs.railValid` names the claims whose rail
     * the client checked. Errs where it is unknown: `law/payment-unstated`
     * where it rests on two or more records whose payment
     * `specs.railPayments` does not state (Money rule 12);
     * `law/rail-unanswered` where it rests on a claim neither
     * `specs.railValid` nor `specs.railInvalid` names (Money rule 8: a
     * record counts toward a purchase only with a valid answer).
     */
    agreementsPurchaseContests(specs: any, purchase: string): string[];
    /**
     * A payment for a work, judged (F126, F127 W2, F128 W4): "purchase",
     * "no-purchase" (a refund owed to the payer, with why), or "unrecorded"
     * (on a request rail, a collective seller's actions chain has not
     * recorded it yet; on a push rail (`specs.pushRails`), a holder has not
     * signed its receipt yet, or receipts of one payment name different
     * claims and the rail has not shown which the payment committed to),
     * or "wrong-receipt" (F131 IT3: a receipt `specs.railInvalid` names,
     * whose claim the payment did not commit to; it counts for nothing);
     * or "unknown" (Money rule 8: the receipt or claim `id`, or a receipt
     * it is judged with, is named neither in `specs.railValid` nor in
     * `specs.railInvalid`, and the answer rests on it); null where the
     * payment is not for a work.
     */
    agreementsPurchase(specs: any, id: string): any;
    /**
     * A record act of a collective, judged: whether it is a line, the
     * clone it names and whether it puts it in force, and what it registers.
     */
    agreementsRecord(specs: any, collective: string, record: string): any;
    /**
     * A public domain release, judged (rule 17, F121 shape D).
     */
    agreementsRelease(specs: any, id: string): any;
    /**
     * A clone read as a rollback's (Agreements rule 37d, F185): as `agreementsAgreement`,
     * its mark checked against the powers a rollback names.
     */
    agreementsRollbackAgreement(specs: any, id: string): any;
    /**
     * What a rollback made next would register (rule 37d, RB3; F187 2),
     * checked from what this verifier holds: `{ error, departures }`, each
     * departure `{ act, party, kind }` ("resigned", "stepped-down",
     * "declared"). A client asks it from a fresh reading of the relays
     * before it sends the rollback's rotation.
     */
    agreementsRollbackRegisters(specs: any, collective: string, registers: string[]): any;
    /**
     * Who counts for a power (`{ form, area }`) of the agreement in force
     * just before a broken collective's broken act, at a rollback made
     * next (Agreements rules 37d, 44d), `leaving` taken out (the parties whose
     * resignations the rollback registers): as `agreementsNextVoices`; or
     * `{ error }`, why there is no such count.
     */
    agreementsRollbackVoices(specs: any, collective: string, power: any, leaving: string[]): any;
    /**
     * What a split service owes (Agreements rule 29): every incoming receipt and
     * payer's claim without its split, and every payout without the
     * receiver's receipt, each naming one receiver and one agreement.
     */
    agreementsServiceAccount(specs: any, service: string): any;
    /**
     * The declarations of absence naming `party` this verifier holds (RB3,
     * client conformance): `{ act, signer, agreement, clause, outcomes,
     * contests }`, `contests` the party's contests of it (BQ4).
     * The numbers on the splits a service made under a deal (DQ6, F188):
     * `{ numbers: [number, split][], gaps, repeated, unnumbered }`. Client
     * conformance: a holder's client MUST raise the alarm where the
     * numbers it receives skip (`gaps`).
     */
    agreementsSplitNumbers(specs: any, service: string, agreement: string): any;
    /**
     * Rule 15a's turns (F165, F171): for `stake` (its index) of
     * `agreement`'s version in force, the leftover units each holder has
     * received so far from `service`'s splits, as `previous` (the
     * service's latest split act for the stake, which its next split
     * cites) carries them in its running count; null `previous`: no split
     * yet, every count zero. In the order of `holders` (hex). Null where
     * `previous` is not held, not one of the service's splits for the
     * stake, or carries no count.
     */
    agreementsSplitTurns(specs: any, service: string, owners: string, holders: string[], previous?: string | null): Float64Array | undefined;
    /**
     * A split, judged (rules 20, 21, 26; F121 Q9, F124 N10): whether it
     * sums to what arrived, each fee and who received it, the holders it
     * pays and was not delivered to, and every payout that does not match
     * its stake.
     */
    agreementsSplit(specs: any, id: string): any;
    /**
     * Whether a price tag counts under its publication (Money rule 18;
     * Agreements rule 12): "counts" (with the publication, and whether this
     * version withdraws the tag), "nobody's offer" or "unknown", with why.
     */
    agreementsTagUnder(specs: any, tag: string): any;
    /**
     * Where a deal stands forked (rule 45b, F186): `{ reference, branches,
     * tangled }`, each branch its versions from the split to its latest,
     * `tangled` the reason where the fork is tangled (F188, DQ1 to DQ4: the
     * deal stays on its reference); null where it is not forked. Throws
     * where the shape is not decided (QH1, refused rather than guessed).
     * The version of an agreement in force, as rule 45b reads a deal's
     * forks (F186, F188, F192): while forked or tangled, the reference.
     * Throws where the shape is not decided (QH1: two settlements, a
     * judge's among them, neither holding the other). What a buyer's
     * client checks an offer against before paying (F188, a strong
     * SHOULD).
     */
    agreementsVersionInForce(specs: any, agreement: string): string;
    /**
     * A vow, read (Agreements rule 13; F237, F240, F253): its signer, whether
     * its genesis is void, its versions and latest words, the offers naming
     * it, and each sale with its state, "pending", "confirmed" (with the
     * acknowledging acts) or "contested" (with the contests), and the
     * evidence beside it; and the payments with no buyer signed on.
     * `specs.railValid` names the receipts and claims whose rail the
     * client checked: a payment is a sale only by a record with the rail's
     * answer, valid, and read only from a buyer's own claim with it. A
     * sale or payment resting on a record neither `specs.railValid` nor
     * `specs.railInvalid` names is marked "unknown" (a sale's state, or
     * the `unknown` list; Money rule 8).
     */
    agreementsVow(specs: any, name: string): any;
    /**
     * Who made a work and who owns it as recorded (Agreements rule 15;
     * F218; F412; F416), the core's `work_owners`: `{ work, claims,
     * contested, agreements, defaultHolder, holders }`. `claims`, the
     * claims that count and bind the work, ascending; `contested`, two or
     * more; `agreements`, the ownership agreements targeting a claim of the
     * work, each its version in force; `defaultHolder`, where no agreement
     * writes shares and one claim binds it, that claim's opener (a
     * collective, for a claim a member signed for it), else null;
     * `holders`, for each agreement in force `{ agreement, holders:
     * [[holder, share]] }`, its stake's holders as that version writes them
     * (field 7, shares in millionths), a collective one holder among them.
     * *Not applied here:* stake transfers since that version (rule 14):
     * the core's as-held reading is not public (round 10, for the MOR
     * lead). Added in the Dubsar Suite's round 10 (F415), by the MOR lead's
     * leave; no change to the core.
     */
    agreementsWorkOwners(specs: any, work: string): any;
    /**
     * Who uploaded a bake, as a verifier reading Money and Envelopes tells
     * it (Money, "Only identities have payee pointers"): the signer's
     * identity hash, or "unknown" where the bake names another chain, a
     * collective's perhaps, which a Money-only wallet refuses to tip.
     * `null` for no bake held.
     */
    bakeUploader(bake: string): string | undefined;
    /**
     * The standing of an act for everything binding (keeper records,
     * payments, discharge of debts, agreements, forks, closings): as
     * `status`, except "unknown" where the answer rests on this client's
     * own failed attempts to reach homes ("re-homed without audit") or on
     * what it found at homes (`foundAtHome`), until it no longer does
     * (Identity, the sentence after rule 17, F153, F159).
     * Reading and following an identity use `status`.
     */
    bindingStatus(act: string): string;
    /**
     * Record that this client itself tried and failed to reach an operator's home.
     */
    failedToReach(operator: string): void;
    /**
     * Record that this client found the act, in its sealed form, at the
     * home operated by `home` (the operator's identity hash; for a
     * self-hosted home, the identity itself). A private link act counts
     * only if found at a home its signer's chain names at its binding;
     * otherwise it is unknown, never invalid. What was found is this
     * client's own input: `bindingStatus` shows an answer resting on it
     * as unknown (Identity, "The envelope", F152, F159).
     */
    foundAtHome(act: string, home: string): void;
    /**
     * Every act held, by id.
     */
    held(): string[];
    /**
     * The routes act (Identity type 3) or encryption-key act (Envelopes type
     * 4) that counts for an identity: its valid acts of that spec and type,
     * followed from version 1 (Identity, "Routes"; Envelopes, "Encryption
     * key"). Returns the act, whether the chain is contested past it, and
     * its payload as CBOR.
     */
    latest(identity: string, spec: string, type_: number): any;
    /**
     * A link between two MOR identities as the act `seenBy` sees it
     * (Identity rules 23 and 24, F152): "not linked", "linked", "ended"
     * (`seenBy` holds a termination in its history) or "unknown".
     */
    link(claim: string, seen_by: string): string;
    /**
     * Where a payer pays this payee this amount (the payment cMIP,
     * "Choosing where to pay"; Money rules 1, 3 and 5): the pointer that
     * counts and the vault in force, as this verifier holds the payee's
     * acts, and the first rail, in the payee's order, on a rail Module the
     * person accepts that carries the unit. `{ to: "flow", pointer, rail,
     * module, address }`, `{ to: "vault", declaredBy, entry, module,
     * address }` or `{ to: "nowhere", why }`.
     */
    moneyChoose(money_spec: string, payee: string, amount: any, accepted: string[]): any;
    /**
     * The forward a receipt declares that no valid record of the next hop
     * carries on (Money rule 27): that hop's open obligation, under the
     * agreement the forward names, `{ debtor, creditor, amount, agreement }`;
     * null where it declares none, or it is carried on. Throws, coded as
     * a rail's answer not given, where that cannot be told yet.
     */
    moneyForwardOwed(specs: any, receipt: string): any;
    /**
     * Judge a receipt or claim this verifier holds, as a Money-only client
     * with the person's accepted cMIPs and Modules (F338): the act's
     * standing; the rail's answer, by the rail Module its field 0 names,
     * adopted only if accepted (a Module, unit or payment cMIP not accepted
     * is unknown: Development rule 9); and what is judged beside it.
     */
    moneyJudge(act: string, opts: any): any;
    /**
     * The payee pointer that counts for an identity (Money rule 1), from
     * the valid pointers this verifier holds: `{ act, version, forked }`,
     * `act` null where it holds none; `forked` where two name one
     * predecessor, the pointer that counts the last before the fork.
     */
    moneyPointer(money_spec: string, payee: string): any;
    /**
     * A refund owed on a purchase paid through a route, back hop by hop
     * (Money rule 28), last hop first: `[{ record, debtor, creditor,
     * amount, agreement, repaid }]`, `repaid` null where it cannot be
     * told; empty where the route is not valid or no refund is owed.
     */
    moneyRefundAlong(specs: any, last: string): any;
    /**
     * Who buys the purchase a route's last record is (Money rule 24;
     * Agreements, "A contest of a purchase"): `{ buyer, payer, claim,
     * service, astray, route }`, `buyer` one of "no route" (the record
     * names no previous hop: the ordinary rule), "the first payer" (with
     * `payer` and `claim`, their claim of the first hop naming the tag:
     * the claim a contest names), "the service, for its own account"
     * (with `service`, and `astray`: the first payer's claims naming
     * another tag), "none" (the route stopped or broken: no purchase at
     * the seller, with `route`), or "unknown" (not yet: a contest shows
     * nothing yet).
     */
    moneyRouteBuyer(specs: any, last: string): any;
    /**
     * A route across rails (Money rules 24 to 28), the rail answers in
     * `specs` (`railValid`, `railInvalid`, `railPayments`,
     * `rails`): `direction` "to" reads the route ending at the receipt or
     * claim `act`, as its final creditor does, back through the previous
     * hop each record names (receipt field 6, claim key 10); "from"
     * follows it forward from the receipt `act`. `{ route, hops, at, why,
     * agreement, owed, near }`: `route` "valid" (`hops` first to last),
     * "stopped" (rule 27: at the receipt `at`, whose forward no valid
     * record of the next hop carries on, `owed` its open obligation:
     * `{ debtor, creditor, amount: { unit, value }, agreement }`; `near`
     * the records naming it that do not carry it on, each `[act, why]`),
     * "broken" (rule 28: at the record `at`, under `agreement`, `why`) or
     * "unknown" (a rail's answer on it pending or not held).
     */
    moneyRoute(specs: any, act: string, direction: string): any;
    /**
     * The vault an identity's chain declares in force (Money rule 3), as
     * this verifier holds the chain: `{ declaredBy, entries }`, or null
     * where it declares none.
     */
    moneyVault(money_spec: string, identity: string): any;
    /**
     * A verifier for the given Identity spec hash (`IDENTITY`; a test value
     * until the freeze). Given the Money and Agreements spec hashes too, it can
     * tell which acts may carry acknowledgements (F110); without them, an
     * act of another specification carrying `acks` is unknown to it. Given
     * the Envelopes and Text spec hashes, which every client holds (MICS,
     * "Client conformance"), it decodes their acts strictly (Envelopes
     * draft 10, rule 30; Text draft 8, rule 14; F295, F296) and shows a text
     * or Envelopes act carrying `acks` as invalid without the Money and
     * Agreements hashes (Fable's E5, the clients' half).
     */
    constructor(identity_spec: string, money_spec?: string | null, agreements_spec?: string | null, envelopes_spec?: string | null, text_spec?: string | null);
    /**
     * Where to look for an act a reference names beside this signer
     * (Envelopes draft 9, rule 20, F272): its outbox routes that count,
     * then the homes in force at its latest position. Hints, each once.
     */
    places(signer: string): string[];
    /**
     * Whose offer a price tag is (Money rule 18), as a verifier reading
     * Money and Envelopes tells it: "counts" (on a bare bake, its
     * uploader's), "nobody's offer", or "unknown" (not held, or under a
     * publication, which Agreements judges). `null` for no price tag held.
     */
    priceTag(act: string): string | undefined;
    /**
     * The home quorum of a counting rotation (Money rule 15, F180): the
     * receipts the home rule in effect before it requires, each passing
     * the receipt checks, per home operator, and how many operators are
     * needed. `kind` is "own" (it counts on its own signatures: anchor the
     * rotation itself), "homes", or "homeless" (the new homes' receipts,
     * under the new home rule, F182); null where it is not a counting
     * rotation. *The owner's client anchors these after a lock
     * change (Money rule 15, F181).*
     */
    quorum(identity: string, rotation: string): any;
    /**
     * Which act counts at each position of an identity chain.
     */
    resolve(identity: string): any;
    /**
     * The standing of an act held: "valid", "disputed", "void", "pending",
     * "invalid", "unknown", or "scoped" (signed with a key a higher MIR's
     * act installs, a grant key: Agreements judge it, F128).
     */
    status(act: string): string;
    /**
     * An identity's succession (Identity draft 13, section 8, F300):
     * `{ state, rotation, successor, confirmation }`, `state` one of
     * "none", "declared" (shown as declared, never followed), "confirmed"
     * (followed), "unknown" (a confirmation held whose status cannot be
     * told), "elsewhere" (another protocol's, confirmed as its link cMIP
     * says).
     */
    succession(identity: string): any;
}

export function actId(bytes: Uint8Array): string;

/**
 * What a clone changes from its parent, each change's tier, and the powers
 * its mark must name (rules 44a to 44c), from the two terms payloads. For
 * a client preparing a clone's mark, and showing what it changes.
 */
export function agreementsClonePlan(parent: Uint8Array, clone: Uint8Array, specs: any): any;

/**
 * A control model's answer, given as CBOR in Agreements rule 99's format,
 * as the rule reads it: "overreaching", "refused", "unknown", "an act, no
 * area", "an act, area N" or "a clone". Throws only on bytes that are no
 * CBOR item.
 */
export function agreementsControlAnswer(answer: Uint8Array): string;

/**
 * The default control cMIP's hash (its stand-in, test data): the `spec` of
 * its own acts, the issuance offer (type 26), the proxy (type 27) and the
 * revocation of a proxy (type 28), which are no Agreements types since
 * Agreements draft 19 (rule 99), and the cMIP field 35 names.
 */
export function agreementsControlCmip(): string;

/**
 * Move a terms payload's legacy fields 20, 30, 32 and 34 (the areas, their
 * words, the holders' rules, an issuance's offer) into field 35, naming the
 * default control cMIP with them as its parameters (Agreements rule 99), and
 * return the payload as CBOR. A collective's terms carrying none of them get
 * field 35 with empty parameters; terms that are no collective's are
 * returned as they came. A migration aid for clients that built field 34.
 */
export function agreementsControlPack(payload: Uint8Array): Uint8Array;

/**
 * Agreements rule 15a (F150, F165): `{ total, holders: [[hex, share]], turns }`
 * divided among the holders by their shares, each holder its exact share
 * rounded down, leftover units one each to the largest fractional
 * remainders; holders with equal remainders take turns: the fewest
 * leftover units so far (`turns`) first, then the smallest identity hash.
 * The parts, in the holders' order; an error where a tie decides a unit
 * and no turns are given.
 */
export function agreementsDivideStake(input: any): Float64Array;

/**
 * The checker, for one act's bytes (and its content key if private):
 * `{ verdict, act, id, signer, rule, says, invalid, notes }`, the verdict
 * one of "pass", "rejected", "invalid", "unknown", "cannot open", "not this
 * encoding" (encoding-1, "What the checker answers").
 */
export function agreementsNewCheck(act: Uint8Array, key?: Uint8Array | null): any;

/**
 * The checker, for the acts a verifier holds together (`[{ act, key? }]`):
 * each answer, with G6.1 read among them.
 */
export function agreementsNewCheckHeld(acts: any): any;

/**
 * A report's payload, as CBOR (encoding-1, "The report": a proposal).
 */
export function agreementsNewReportPayload(input: any): Uint8Array;

/**
 * The spec hash and type number of each new act (encoding-1, E2): Terms
 * and Statement under draft 24's spec hash; the report, a proposal, under
 * the report block's third proposal's.
 */
export function agreementsNewSpecs(): any;

/**
 * A Statement's payload, as CBOR (encoding-1, "Statement").
 */
export function agreementsNewStatementPayload(input: any): Uint8Array;

/**
 * A Terms act's payload, as CBOR, for `makeEveryday` (encoding-1, "Terms").
 */
export function agreementsNewTermsPayload(input: any): Uint8Array;

/**
 * A collective's control model's query answer (Agreements rule 99,
 * `query-answer`), as CBOR, for terms given as CBOR, read through the
 * models the binding holds (the default control cMIP): its areas (key 0),
 * each stake's holders' rule (key 1), and each act type it gives a power by
 * share with that power (key 2; empty under the default cMIP), so that a
 * client can show founders who acts on what, Money first. Throws where the
 * terms name no control model, or one the binding does not hold.
 */
export function agreementsQueryAnswer(payload: Uint8Array): Uint8Array;

/**
 * The powers a rollback's mark names (Agreements rule 37d, F185), from the terms
 * of the agreement in force just before the broken act and the rollback's
 * clone: the constitutional change rule, and the judicial tier's rule
 * where the clone changes a judge, whatever its other changes.
 */
export function agreementsRollbackPlan(parent: Uint8Array, clone: Uint8Array): any;

/**
 * Agreements rule 15a (F165, F171): the running count a split act carries for a
 * stake (field 4, PROPOSED format, to confirm with Nobody, allegedly):
 * `{ pot, holders, paid, before }` gives `before` plus each holder's
 * leftover units in `paid` (what it was paid above its exact share of
 * `pot` rounded down), every holder named, as `[hex, count]` sorted by
 * identity hash.
 */
export function agreementsSplitTally(input: any): any;

/**
 * A batch of leaves: its root, and each leaf's branch.
 */
export function anchoringBatch(leaves: string[]): any;

/**
 * The payer's check of a ticket before paying (the anchoring cMIP draft 6,
 * client conformance: "Check the ticket before paying"), against the
 * publication act and the price tag act paid (the latest versions the
 * client found): it names the publication, the leaf sent and the payer's
 * commitment; the commitment pays the ticket's tier's own tag, exactly the
 * tier's price, to its payee; the deadline is after
 * `now` (the payer's own point on the clock) and within the tier's blocks
 * and one block of slack. Null where acceptable, else why not.
 */
export function anchoringCheckTicket(publication: Uint8Array, tag: Uint8Array, ticket: Uint8Array, commitment: Uint8Array, leaf: string, now: bigint): string | undefined;

/**
 * A leaf of the anchoring cMIP's batch: `H_leaf(act || blind)`.
 */
export function anchoringLeaf(act: string, blind: Uint8Array): string;

/**
 * A pooled anchoring service's publication (Agreements type 6; the
 * anchoring cMIP draft 6, item 9): a lone seller's, the service its own
 * split service under a split plan naming `splitCmip`, selling exactly
 * this cMIP's terms, its tiers at fixed prices in the unit of `network`, on
 * that network's Bitcoin clock, its refund point `refundUntil` where one is
 * set. `{ type, payload }`, to sign under the Agreements MIR's spec, by the
 * service, public, with no `objects`: its first version.
 */
export function anchoringOffer(network: number, tiers: any, words: string | null | undefined, service: string, split_cmip: string, refund_until?: bigint | null): any;

/**
 * The price tags of an anchoring publication: **one per tier, each paying
 * exactly that tier's price** (Money rule 18), first versions naming the
 * publication's first version `publication`, paid to the service. `[{
 * tier, type, payload }]`, each to sign under the Money MIR's spec by the
 * service, public.
 */
export function anchoringPriceTags(network: number, tiers: any, publication: string, service: string): any;

/**
 * A publication's payload (the anchoring cMIP, item 9, type 3), with the
 * key its output is tweaked from (draft 6, fields 5 and 6).
 */
export function anchoringPublication(input: any): Uint8Array;

/**
 * An anchoring publication act read as this cMIP's offer (draft 6, item
 * 9; `service::Offer::from_publication`), with the price tag acts given
 * beside it (`tags`, an array of acts; may be empty): its first version,
 * payee (the service), unit, the Bitcoin clock's network, tiers, words,
 * refund point, and the tag that pays each tier exactly (`tags: [{ tier,
 * tag }]`, a tier with none absent). The caller finds the latest version
 * of each (Agreements rule 11, Money rule 18). Throws where it is no
 * anchoring publication, saying why.
 */
export function anchoringReadOffer(publication: Uint8Array, tags?: any | null): any;

/**
 * A publication's payload read, or `null`.
 */
export function anchoringReadPublication(payload: Uint8Array): any;

/**
 * A ticket's payload read, or `null`.
 */
export function anchoringReadTicket(payload: Uint8Array): any;

/**
 * A ticket's payload (the anchoring cMIP, item 9, type 2).
 */
export function anchoringTicket(input: any): Uint8Array;

/**
 * A batch anchor (the Bitcoin clock Module, "A batch anchor"), encoded.
 */
export function batchAnchor(input: any): Uint8Array;

/**
 * Check a batch anchor of an act on the Bitcoin clock, against the chain
 * the client follows (the Bitcoin clock Module's rule): `{ answer, why,
 * point }`, the point the block's height where valid.
 */
export function batchAnchorCheck(act: string, proof: Uint8Array, chain: any): any;

/**
 * Decode deterministic CBOR into JavaScript values: maps become `Map`s
 * (keys kept as numbers), byte strings `Uint8Array`s, integers numbers (or
 * `BigInt` beyond 2^53), text strings, arrays, booleans and null. Used for
 * the relay transport's messages.
 */
export function cborDecode(bytes: Uint8Array): any;

/**
 * Encode JavaScript values as deterministic CBOR: the inverse of
 * [`cbor_decode`], for non-negative integers, `Uint8Array`, strings,
 * arrays, `Map`s, booleans and null.
 */
export function cborEncode(v: any): Uint8Array;

export function chainKeyFromSeeds(scheme: number, seeds: Uint8Array): any;

/**
 * Check a terms payload (Agreements type 0), given as CBOR: its format and every
 * check that needs no other act (key grammar, areas, judges, F105 for
 * founding terms). Throws `agreements/<code>: <why>`.
 */
export function checkTerms(payload: Uint8Array, specs: any): void;

/**
 * Check that a string is canonical text (Text MIR), with the pinned Unicode
 * tables; throws naming the rule broken.
 */
export function checkText(s: string): void;

/**
 * The commitment itself, encoded in deterministic CBOR (the array the
 * money messages cMIP's invoice request carries).
 */
export function commitmentCbor(input: any): Uint8Array;

/**
 * A contest payload (Agreements type 14; BQ4, F188): the declaration of absence
 * it answers. Signed by the party the declaration names; the act carries,
 * in `objects`, `[declaration, declaration]`. It voids nothing (rule 52).
 */
export function contestPayload(declaration: string): Uint8Array;

/**
 * Deal a fresh chain key of a collective as shares, any `threshold` of
 * which rebuild it, with Pedersen commitments (air-gapped Module, section
 * 5; Agreements rule 36; F97). The key itself is never returned: only the
 * shares, its commitment and the dealing's fingerprint. **Test
 * collectives only**: here the dealing device is this program, in
 * software; a real collective deals on an offline device.
 */
export function dealChainKey(input: any): any;

/**
 * An abandonment declaration payload (Agreements type 13, B12): the agreement,
 * the version whose clause it applies (the last the party signed), the
 * party, and the outcomes, ascending. The act carries, in `objects`,
 * `[agreement, agreement]`.
 */
export function declarationPayload(agreement: string, clause: string, party: string, outcomes: Uint32Array): Uint8Array;

/**
 * A specification's content decoded whole (Development draft 10, Part
 * three; F322, F323, F325, F301): its fields as an object, or an error
 * beginning "no specification:" where the content is not in the format.
 * `paymentCmip`, where given, is the payment cMIP's spec hash, whose rail
 * Modules must carry fields 11 and 13.
 */
export function decodeSpec(content: Uint8Array, payment_cmip?: string | null): any;

/**
 * Decode an act (strictly) and describe it. A public act is opened and
 * checked against its outside; its payload is returned as CBOR.
 */
export function describeAct(bytes: Uint8Array): any;

/**
 * An encryption-key payload (Envelopes type 4), for an X-Wing public key, as CBOR.
 */
export function encryptionKeyPayload(version: number, previous: string | null | undefined, _public: Uint8Array): Uint8Array;

/**
 * A fork settlement payload (Agreements type 23; DQ8, F188): the settlement of
 * the judge of forks the reference names (terms field 27, QF2), or of the
 * link of its chain of judgment that took over (QG4), naming the request
 * that activated it, the version of the fork it keeps and every tip it
 * drops (QF3, F190), sorted here. A tip given twice is refused, as the
 * core refuses it. The act carries, in `objects`, `[request, request]`.
 */
export function forkSettlementPayload(request: string, kept: string, discarded: string[]): Uint8Array;

/**
 * An object's short form: bech32m, lowercase, under its label (`mid`,
 * `mact`, `mkey`, `mspec`, `mwork`). A key's data is Identity's
 * `[scheme, key]` in deterministic CBOR; every other is a 32-byte hash.
 */
export function formEncode(label: string, data: Uint8Array): string;

/**
 * Read a string where `want` is asked: its short form, its where-it-lives
 * form, or bare hex for a 32-byte hash. Refused, in words, otherwise: a
 * broken checksum, mixed case, a label the core does not define, or
 * another kind than the one asked ("this is an act (mact), not an identity
 * (mid)").
 */
export function formRead(s: string, want: string): any;

/**
 * The where-it-lives form: the short form, then each hint after `?r=`.
 */
export function formWithHints(label: string, data: Uint8Array, hints: string[]): string;

/**
 * A key-delivery payload (Envelopes type 1), as CBOR.
 */
export function keyDeliveryPayload(target: string, key: Uint8Array, media: boolean): Uint8Array;

/**
 * A Lightning rail address (or vault source), encoded: `[ network, node, ? endpoint ]`.
 */
export function lightningAddress(input: any): Uint8Array;

/**
 * A BOLT 11 invoice read by the Module's own decoder (its signature
 * checked, its node key recovered): `{ network, node, amountMsat,
 * paymentHash, descriptionHash, hasDescription }`. Throws where it is no
 * valid invoice.
 */
export function lightningInvoice(invoice: string): any;

/**
 * A Lightning rail proof: `[ invoice, ? preimage ]`.
 */
export function lightningProof(invoice: string, preimage?: Uint8Array | null): Uint8Array;

/**
 * Lock a media object with a fresh content key and nonce (Envelopes,
 * "Media": XChaCha20-Poly1305, no associated data).
 */
export function lockMedia(plaintext: Uint8Array): any;

/**
 * A chain signature (Identity type 16, F132): an act on the identity
 * chain, signed by the revealed chain key, naming the act it signs and
 * committing the next chain key; nothing else changes. Agreements' members sign
 * forks and closings with it.
 *
 * The chain key here is held in software: **test identities only**. As
 * for a rotation, the caller keeps the returned bytes and sends exactly
 * them to every home (Identity rule 8a).
 */
export function makeChainSignature(input: any): Uint8Array;

/**
 * An everyday act, next in the signer's sequence: position and running
 * summary computed from the sequence given (Envelopes rule 4).
 */
export function makeEveryday(input: any): any;

/**
 * A genesis (Identity type 0), signed by its first signing key, or, for a
 * collective, which declares none, by its first chain key (Identity rule
 * 1), and checked with the core's genesis checks before it is returned.
 */
export function makeGenesis(input: any): Uint8Array;

/**
 * A rotation (Identity type 1), signed by the revealed chain key.
 *
 * The chain key here is held in software: **test identities only**. The
 * signature is hedged (fresh randomness), as the air-gapped Module signs;
 * the caller keeps the returned bytes and sends exactly them to every home
 * (Identity rule 8a).
 */
export function makeRotation(input: any): Uint8Array;

/**
 * A transaction's Merkle branch in its block, from the block's txids in
 * Bitcoin's own byte order: the siblings from the leaf up.
 */
export function merkleBranch(txids: Uint8Array[], index: number): Uint8Array[];

/**
 * The spec hash of a MIR from its file, as Development rule 26 reads a
 * file: at most one final line break removed and nothing else (every line,
 * a draft's status line included, is part of the text), the text
 * canonical. Throws otherwise.
 */
export function mirFileHash(file: string): string;

/**
 * The spec hash of a MIR's text, as the root recomputes it (Development
 * draft 10, rule 26, F324): `tagged_hash("MOR/spec", {0: 4, 9: text})`, the
 * text canonical. Throws where the text is not canonical.
 */
export function mirHash(text: string): string;

/**
 * Money rule 3 (was 14a) on a vault in force: where a single payment of
 * this amount may go. `{ to: "flow" | "vault" | "nowhere", why }`.
 */
export function moneyDestination(vault: any, amount: any): any;

/**
 * A Money act's payload, encoded by the core and decoded back strictly
 * (Money, "Act formats"): `{ type, payload }`, to sign under the Money
 * MIR's spec hash. Throws where the core refuses it.
 */
export function moneyPayload(input: any): any;

/**
 * A Money act's payload read strictly by its type: `{ act, more }`, `more`
 * naming fields present that `act` does not show. Throws where it is no
 * Money act of that type.
 */
export function moneyRead(type_: number, payload: Uint8Array): any;

/**
 * The spec hashes of the Money layer's cMIPs and Modules as the reference
 * implementations name them (test values until step 17), with the two rail
 * Modules' published content (Development draft 10, Part three), from
 * which their kind and binding are read (F301).
 */
export function moneySpecs(): any;

/**
 * A fresh X-Wing private key (32 bytes).
 */
export function newEncryptionSecret(): Uint8Array;

/**
 * A fresh everyday signing secret (Schnorr, scheme 1).
 */
export function newSigningSecret(): Uint8Array;

/**
 * A fresh chain key held in software: its FIPS 205 seeds (48 bytes), its
 * public key and its commitment. **For test identities only** (build
 * brief: the real identity's chain key is made by the air-gapped Module).
 */
export function newTestChainKey(scheme: number): any;

/**
 * A string in NFC under the pinned Unicode tables (Text, rule 6), as the
 * core checks it: a client composes with the same tables it is checked
 * with, never its system's (Fable's T5).
 */
export function nfc(s: string): string;

/**
 * A notice payload (Agreements type 24; F197): before closing, the collective's
 * notice to a payer owed money back who gave no address, naming the
 * payment (one receipt or claim of it) and a deadline on a time reference
 * (its hash, and the point on it, as an unsigned integer). The act is
 * sealed to the payer's identity, and carries, in `objects`, `[payment,
 * payment]`.
 */
export function noticePayload(payment: string, time_reference: string, deadline: bigint): Uint8Array;

/**
 * An on-chain rail address (or vault source), encoded: `[ network, key, request, ? endpoint ]`.
 */
export function onchainAddress(input: any): Uint8Array;

/**
 * The x-only public key of a secp256k1 secret (BIP 340): what an
 * on-chain rail address names as its request key.
 */
export function onchainKey(secret: Uint8Array): string;

/**
 * Where a payment committing to `commitment` goes on this address (the
 * Module's pay-to-contract): `{ outputKey, script, address }`, `address`
 * the Taproot address as wallets write it (BIP 350's bech32m).
 */
export function onchainPayTo(address: Uint8Array, commitment: string): any;

/**
 * An on-chain rail proof: `[ request, ? [ tx, output, ? [ index, branch, headers ] ] ]`.
 */
export function onchainProof(input: any): Uint8Array;

/**
 * The payee's side's request for a commitment (the on-chain rail Module,
 * "The request"): a BIP 340 signature by the request key over the request
 * message, at the Module's six confirmations or the more `confirmations`
 * names. Returns the 64-byte signature.
 */
export function onchainRequest(secret: Uint8Array, commitment: string, confirmations?: number | null): Uint8Array;

/**
 * Open a locked media object. Throws if the key and nonce do not open it.
 * The caller checks the plaintext against the work hash (Envelopes rule 14).
 */
export function openMedia(locked: Uint8Array, key: Uint8Array, nonce: Uint8Array): Uint8Array;

/**
 * Open a sealed container with an X-Wing private key, as the identity `me`
 * (hex), or as a bare key when `me` is absent.
 */
export function openSealed(bytes: Uint8Array, me: string | null | undefined, secret: Uint8Array): any;

/**
 * Open a private act with a delivered key, and describe it.
 */
export function openWithKey(act: Uint8Array, key: Uint8Array): any;

/**
 * The payment commitment's hash (payment cMIP, "The payment commitment"):
 * what the payee's side commits to on the rail, and what a verifier
 * recomputes from a receipt or claim. The salt is 16 bytes the payer's
 * client draws at random for this payment (client conformance).
 */
export function paymentCommitment(input: any): string;

/**
 * The proof a receipt or claim carries in its field 1: `[ paid-to, salt, rail-proof ]`.
 */
export function paymentProof(input: any): Uint8Array;

/**
 * The pickup tag of an X-Wing public key used as a bare key.
 */
export function pickupTag(_public: Uint8Array): string;

/**
 * A publication's payload (Agreements type 6), encoded by the core and
 * decoded back strictly, its format's own checks applied: `{ type,
 * payload }`, to sign under the Agreements MIR's spec. Its `objects` are
 * the caller's to write: a later version names `[first, previous]` first;
 * one naming an ownership agreement names it as `[agreement, agreement]`.
 */
export function publicationPayload(input: any): any;

/**
 * A purchase's contest payload (Agreements type 14; rule 54, "Contest
 * (type 14)", F386): the purchase it contests (the buyer's own payer's
 * claim of the payment, or its signature act on an offer at no price),
 * and, optionally, the promise not kept, in words. Signed by the buyer;
 * the act carries, in `objects`, `[purchase, purchase]`. Shown beside the
 * purchase; it voids nothing and moves nothing.
 */
export function purchaseContestPayload(purchase: string, promise?: string | null): Uint8Array;

/**
 * Run a rail Module's rule on a commitment before paying (payment cMIP,
 * step 2): what a payer's money app does with an answer's invoice or
 * request, without the completing part of the proof. `module` the rail
 * Module's spec hash; `address` the payee's rail address or vault source;
 * `railProof` the rail proof so far; `chain` the headers the client
 * follows, or null. The answer, as `moneyJudge` gives it.
 */
export function railCheck(module: string, commitment: string, amount: any, address: Uint8Array, rail_proof: Uint8Array, chain: any): any;

export function randomBytes(n: number): Uint8Array;

/**
 * A commitment read back from its CBOR: its fields and its hash. A
 * commitment naming a bare key as payer, or a purchase, is refused here:
 * Damgar's round 1 makes neither.
 */
export function readCommitment(bytes: Uint8Array): any;

/**
 * Read a grant's payload as the core library decodes it, so a client can
 * name the split service a deal's payees granted (terms field 14) without
 * reading the format itself. Throws if the payload is not a grant.
 */
export function readGrant(payload: Uint8Array): any;

export function readKeyDelivery(payload: Uint8Array): any;

/**
 * A Lightning rail address read, or `null` where it is none.
 */
export function readLightningAddress(bytes: Uint8Array): any;

/**
 * A Lightning rail proof read: `{ invoice, preimage }`, or `null`.
 */
export function readLightningProof(bytes: Uint8Array): any;

/**
 * An on-chain rail address read, or `null`.
 */
export function readOnchainAddress(bytes: Uint8Array): any;

/**
 * An on-chain rail proof read, or `null`.
 */
export function readOnchainProof(bytes: Uint8Array): any;

/**
 * A receipt's or claim's field 1 read: `{ paidTo, salt, rail }`.
 */
export function readPaymentProof(bytes: Uint8Array): any;

/**
 * Read a publication's payload (Agreements type 6) as the core decodes
 * it, strictly, before it is signed: every check of its format that reads
 * the payload alone applied ("Publication (type 6)"), so a client says in
 * plain words what signing it means from the exact bytes signed, without
 * reading the format itself. Throws where the payload is not a
 * publication in Agreements' format. What its `objects` must name (the
 * version it follows, `[first, previous]`; its ownership agreement,
 * `[agreement, agreement]`) is read with the act, by
 * `agreementsPublication`, once signed; so is whether a version selling
 * nothing is a later one.
 */
export function readPublication(payload: Uint8Array): any;

/**
 * Read a terms payload (Agreements type 0) as the core library decodes it, field
 * by field, so a client can say in plain words what signing it means from
 * the exact bytes that are signed (Agreements rule 4a). Throws if the payload is
 * not terms in Agreements' format, or uses a field whose format is still open;
 * `problem` says why terms in the format still fail Agreements' checks.
 */
export function readTerms(payload: Uint8Array, specs: any): any;

/**
 * Rebuild a collective's chain key from `threshold` shares, each checked,
 * and check it against the dealing's commitment (Module 5.1: the rebuild
 * check; at a rotation, the rotating device). Returns the FIPS 205 seeds to
 * sign one rotation with. **Test collectives only.**
 */
export function rebuildChainKey(shares: Uint8Array[]): any;

/**
 * Rebuild a collective's chain key from paper shares alone (H18), checked
 * against the commitment its own chain holds; no dealing needed. Returns the
 * FIPS 205 seeds to sign one rotation with. **Test collectives only**, and
 * the stand-in for Kišib in tests.
 */
export function rebuildChainKeyFromPaper(input: any): any;

/**
 * A record payload (Agreements type 17): the collective's everyday line. Its act
 * carries, in `objects`, `[clone, clone]`, or, naming no clone, the
 * agreement in force. Checked by the core's decoder before it is returned.
 */
export function recordPayload(input: any): Uint8Array;

/**
 * A resignation payload (Agreements type 16): the whole voice, or, with `area`,
 * stepping down from that area (by id). The act carries, in `objects`,
 * `[agreement, agreement]`. With `drafts`, the versions its signer had
 * signed and leaves behind (F207): none of them ever brings them back.
 */
export function resignationPayload(agreement: string, area?: number | null, drafts?: string[] | null): Uint8Array;

/**
 * A routes payload (Identity type 3), as CBOR.
 */
export function routesPayload(input: any): Uint8Array;

/**
 * The running summary of a sequence of act ids (Envelopes, "Sequences").
 */
export function runningSummary(ids: string[]): string;

/**
 * Seal an act, with its content key if private, for its recipients
 * (Envelopes, "Sealed containers"). Randomness is drawn fresh unless given.
 */
export function seal(input: any): Uint8Array;

/**
 * What anyone can read of a sealed container: its recipients, and the
 * X-Wing ciphertext of each capsule.
 */
export function sealedParts(bytes: Uint8Array): any;

/**
 * A settlement request payload (Agreements type 22; DQ8, F188): the deal's
 * reference version, the version with two complete clones, whose
 * arbitrator a party who signed it asks to settle the fork. The act
 * carries, in `objects`, `[reference, reference]`.
 */
export function settlementRequestPayload(reference: string): Uint8Array;

/**
 * A share as its holder writes it on paper (H18: its number and its value,
 * the blinding dropped), after the holder's own check against the dealing
 * (Module 5.1). Throws if the share does not lie on the commitments.
 */
export function shareOnPaper(bytes: Uint8Array): any;

/**
 * A signature payload (Agreements type 1), as CBOR. The act carries, in
 * `objects`, `[signed, signed]`: a signature follows the act it signs.
 */
export function signaturePayload(signed: string): Uint8Array;

export function signingPublic(secret: Uint8Array): Uint8Array;

/**
 * A transaction's txid (Bitcoin's byte order), from its bytes without witness.
 */
export function txid(tx: Uint8Array): string;

/**
 * A vault declaration for a genesis or rotation's declarations slot, as
 * the genesis client passes declarations: `{ spec, kind, cbor }`; with no
 * entries (null), `{ spec, kind }`, which removes the vault (Money, "The
 * vault": a null value for kind 0 removes it).
 */
export function vaultDeclaration(money_spec: string, entries: any): any;

/**
 * The vault a genesis or rotation's declarations slot sets: `undefined`
 * where it says nothing of the vault, `null` where it removes it, else
 * its entries (Money, "The vault").
 */
export function vaultOf(money_spec: string, act: Uint8Array): any;

/**
 * A holder's own check of their share against the dealing's commitments
 * (Module 5.1). Throws if it does not lie on them. Returns what the holder
 * compares with every other holder: the dealing's fingerprint.
 */
export function verifyShare(bytes: Uint8Array): any;

/**
 * A vow's contest payload (Agreements type 14; Agreements draft 11, rule
 * 13, F253): the sale it contests (the buyer's own payer's claim of the
 * payment, or its signature act on an offer at no price), and, optionally,
 * the promise not kept, in words (reading (Q3)). Signed by the buyer; the
 * act carries, in `objects`, `[vow, vow]`, the vow by its name. It marks
 * that sale contested, and voids nothing.
 */
export function vowContestPayload(vow: string, sale: string, promise?: string | null): Uint8Array;

/**
 * The work hash of a plaintext, `tagged_hash("MOR/work", plaintext)` (Envelopes, "Media").
 */
export function workHash(plaintext: Uint8Array): string;

export function xwingDecapsulate(secret: Uint8Array, ct: Uint8Array): Uint8Array;

export function xwingEncapsulate(_public: Uint8Array, eseed: Uint8Array): any;

export function xwingPublic(secret: Uint8Array): Uint8Array;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_verifier_free: (a: number, b: number) => void;
    readonly actId: (a: number, b: number) => [number, number, number, number];
    readonly agreementsClonePlan: (a: number, b: number, c: number, d: number, e: any) => [number, number, number];
    readonly agreementsControlAnswer: (a: number, b: number) => [number, number, number, number];
    readonly agreementsControlCmip: () => [number, number];
    readonly agreementsControlPack: (a: number, b: number) => [number, number, number, number];
    readonly agreementsDivideStake: (a: any) => [number, number, number, number];
    readonly agreementsNewCheck: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly agreementsNewCheckHeld: (a: any) => [number, number, number];
    readonly agreementsNewReportPayload: (a: any) => [number, number, number, number];
    readonly agreementsNewSpecs: () => [number, number, number];
    readonly agreementsNewStatementPayload: (a: any) => [number, number, number, number];
    readonly agreementsNewTermsPayload: (a: any) => [number, number, number, number];
    readonly agreementsQueryAnswer: (a: number, b: number) => [number, number, number, number];
    readonly agreementsRollbackPlan: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly agreementsSplitTally: (a: any) => [number, number, number];
    readonly anchoringBatch: (a: number, b: number) => [number, number, number];
    readonly anchoringCheckTicket: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: bigint) => [number, number, number, number];
    readonly anchoringLeaf: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly anchoringOffer: (a: number, b: any, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: bigint) => [number, number, number];
    readonly anchoringPriceTags: (a: number, b: any, c: number, d: number, e: number, f: number) => [number, number, number];
    readonly anchoringPublication: (a: any) => [number, number, number, number];
    readonly anchoringReadOffer: (a: number, b: number, c: number) => [number, number, number];
    readonly anchoringReadPublication: (a: number, b: number) => [number, number, number];
    readonly anchoringReadTicket: (a: number, b: number) => [number, number, number];
    readonly anchoringTicket: (a: any) => [number, number, number, number];
    readonly batchAnchor: (a: any) => [number, number, number, number];
    readonly batchAnchorCheck: (a: number, b: number, c: number, d: number, e: any) => [number, number, number];
    readonly cborDecode: (a: number, b: number) => [number, number, number];
    readonly cborEncode: (a: any) => [number, number, number, number];
    readonly chainKeyFromSeeds: (a: number, b: number, c: number) => [number, number, number];
    readonly checkTerms: (a: number, b: number, c: any) => [number, number];
    readonly checkText: (a: number, b: number) => [number, number];
    readonly commitmentCbor: (a: any) => [number, number, number, number];
    readonly contestPayload: (a: number, b: number) => [number, number, number, number];
    readonly dealChainKey: (a: any) => [number, number, number];
    readonly declarationPayload: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number, number];
    readonly decodeSpec: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly describeAct: (a: number, b: number) => [number, number, number];
    readonly encryptionKeyPayload: (a: number, b: number, c: number, d: number, e: number) => [number, number, number, number];
    readonly forkSettlementPayload: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly formEncode: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly formRead: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly formWithHints: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly keyDeliveryPayload: (a: number, b: number, c: number, d: number, e: number) => [number, number, number, number];
    readonly lightningAddress: (a: any) => [number, number, number, number];
    readonly lightningInvoice: (a: number, b: number) => [number, number, number];
    readonly lightningProof: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly lockMedia: (a: number, b: number) => [number, number, number];
    readonly makeChainSignature: (a: any) => [number, number, number, number];
    readonly makeEveryday: (a: any) => [number, number, number];
    readonly makeGenesis: (a: any) => [number, number, number, number];
    readonly makeRotation: (a: any) => [number, number, number, number];
    readonly merkleBranch: (a: number, b: number, c: number) => [number, number, number, number];
    readonly mirFileHash: (a: number, b: number) => [number, number, number, number];
    readonly mirHash: (a: number, b: number) => [number, number, number, number];
    readonly moneyDestination: (a: any, b: any) => [number, number, number];
    readonly moneyPayload: (a: any) => [number, number, number];
    readonly moneyRead: (a: number, b: number, c: number) => [number, number, number];
    readonly moneySpecs: () => [number, number, number];
    readonly newEncryptionSecret: () => [number, number];
    readonly newSigningSecret: () => [number, number];
    readonly newTestChainKey: (a: number) => [number, number, number];
    readonly nfc: (a: number, b: number) => [number, number];
    readonly noticePayload: (a: number, b: number, c: number, d: number, e: bigint) => [number, number, number, number];
    readonly onchainAddress: (a: any) => [number, number, number, number];
    readonly onchainKey: (a: number, b: number) => [number, number, number, number];
    readonly onchainPayTo: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly onchainProof: (a: any) => [number, number, number, number];
    readonly onchainRequest: (a: number, b: number, c: number, d: number, e: number) => [number, number, number, number];
    readonly openMedia: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly openSealed: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number];
    readonly openWithKey: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly paymentCommitment: (a: any) => [number, number, number, number];
    readonly paymentProof: (a: any) => [number, number, number, number];
    readonly pickupTag: (a: number, b: number) => [number, number];
    readonly publicationPayload: (a: any) => [number, number, number];
    readonly purchaseContestPayload: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly railCheck: (a: number, b: number, c: number, d: number, e: any, f: number, g: number, h: number, i: number, j: any) => [number, number, number];
    readonly randomBytes: (a: number) => [number, number];
    readonly readCommitment: (a: number, b: number) => [number, number, number];
    readonly readGrant: (a: number, b: number) => [number, number, number];
    readonly readKeyDelivery: (a: number, b: number) => [number, number, number];
    readonly readLightningAddress: (a: number, b: number) => [number, number, number];
    readonly readLightningProof: (a: number, b: number) => [number, number, number];
    readonly readOnchainAddress: (a: number, b: number) => [number, number, number];
    readonly readOnchainProof: (a: number, b: number) => [number, number, number];
    readonly readPaymentProof: (a: number, b: number) => [number, number, number];
    readonly readPublication: (a: number, b: number) => [number, number, number];
    readonly readTerms: (a: number, b: number, c: any) => [number, number, number];
    readonly rebuildChainKey: (a: number, b: number) => [number, number, number];
    readonly rebuildChainKeyFromPaper: (a: any) => [number, number, number];
    readonly recordPayload: (a: any) => [number, number, number, number];
    readonly resignationPayload: (a: number, b: number, c: number, d: number, e: number) => [number, number, number, number];
    readonly routesPayload: (a: any) => [number, number, number, number];
    readonly runningSummary: (a: number, b: number) => [number, number, number, number];
    readonly seal: (a: any) => [number, number, number, number];
    readonly sealedParts: (a: number, b: number) => [number, number, number];
    readonly settlementRequestPayload: (a: number, b: number) => [number, number, number, number];
    readonly shareOnPaper: (a: number, b: number) => [number, number, number];
    readonly signaturePayload: (a: number, b: number) => [number, number, number, number];
    readonly signingPublic: (a: number, b: number) => [number, number, number, number];
    readonly txid: (a: number, b: number) => [number, number];
    readonly vaultDeclaration: (a: number, b: number, c: any) => [number, number, number];
    readonly vaultOf: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly verifier_add: (a: number, b: number, c: number) => [number, number, number, number];
    readonly verifier_addWithKey: (a: number, b: number, c: number, d: number, e: number) => [number, number, number, number];
    readonly verifier_agreementsAgreement: (a: number, b: any, c: number, d: number) => [number, number, number];
    readonly verifier_agreementsBacking: (a: number, b: any, c: number, d: number) => [number, number, number];
    readonly verifier_agreementsBefore: (a: number, b: any, c: number, d: number, e: number, f: number) => [number, number, number];
    readonly verifier_agreementsBroken: (a: number, b: any, c: number, d: number) => [number, number, number, number];
    readonly verifier_agreementsBrokenAct: (a: number, b: any, c: number, d: number) => [number, number, number];
    readonly verifier_agreementsChoose: (a: number, b: any, c: number, d: number, e: any, f: number, g: number) => [number, number, number];
    readonly verifier_agreementsClaimAfterRelease: (a: number, b: any, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly verifier_agreementsClosing: (a: number, b: any, c: number, d: number) => [number, number, number];
    readonly verifier_agreementsCollectiveOf: (a: number, b: any, c: number, d: number) => [number, number, number, number];
    readonly verifier_agreementsConsent: (a: number, b: any, c: number, d: number) => [number, number, number];
    readonly verifier_agreementsCurrent: (a: number, b: any, c: number, d: number) => [number, number, number];
    readonly verifier_agreementsDealFork: (a: number, b: any, c: number, d: number) => [number, number, number];
    readonly verifier_agreementsDebtRelease: (a: number, b: any, c: number, d: number) => [number, number, number];
    readonly verifier_agreementsDebtors: (a: number, b: any, c: number, d: number) => [number, number, number, number];
    readonly verifier_agreementsDeclarationsNaming: (a: number, b: any, c: number, d: number) => [number, number, number];
    readonly verifier_agreementsDeclared: (a: number, b: any, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly verifier_agreementsDone: (a: number, b: any, c: number, d: number) => [number, number, number];
    readonly verifier_agreementsEndingActs: (a: number, b: any, c: number, d: number) => [number, number, number, number];
    readonly verifier_agreementsFork: (a: number, b: any, c: number, d: number) => [number, number, number];
    readonly verifier_agreementsForkAlarm: (a: number, b: any, c: number, d: number, e: number, f: number) => [number, number, number];
    readonly verifier_agreementsHandOut: (a: number, b: any, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number, number];
    readonly verifier_agreementsInForce: (a: number, b: any, c: number, d: number) => [number, number, number, number];
    readonly verifier_agreementsLineUnheld: (a: number, b: any, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly verifier_agreementsNextVoices: (a: number, b: any, c: number, d: number, e: any, f: number, g: number) => [number, number, number];
    readonly verifier_agreementsObligationBinds: (a: number, b: any, c: number, d: number) => [number, number, number];
    readonly verifier_agreementsOwedBack: (a: number, b: any, c: number, d: number) => [number, number, number];
    readonly verifier_agreementsOwes: (a: number, b: any, c: number, d: number) => [number, number, number, number];
    readonly verifier_agreementsPaid: (a: number, b: any, c: number, d: number) => [bigint, number, number];
    readonly verifier_agreementsPointer: (a: number, b: any, c: number, d: number) => [number, number, number];
    readonly verifier_agreementsPointerCheck: (a: number, b: any, c: number, d: number, e: number, f: number) => [number, number, number];
    readonly verifier_agreementsPointerHolding: (a: number, b: any, c: number, d: number, e: number, f: number) => [number, number, number];
    readonly verifier_agreementsPublication: (a: number, b: any, c: number, d: number) => [number, number, number];
    readonly verifier_agreementsPublicationTip: (a: number, b: any, c: number, d: number) => [number, number, number];
    readonly verifier_agreementsPublishedResignations: (a: number, b: any, c: number, d: number) => [number, number, number];
    readonly verifier_agreementsPurchase: (a: number, b: any, c: number, d: number) => [number, number, number];
    readonly verifier_agreementsPurchaseContests: (a: number, b: any, c: number, d: number) => [number, number, number, number];
    readonly verifier_agreementsRecord: (a: number, b: any, c: number, d: number, e: number, f: number) => [number, number, number];
    readonly verifier_agreementsRelease: (a: number, b: any, c: number, d: number) => [number, number, number];
    readonly verifier_agreementsRollbackAgreement: (a: number, b: any, c: number, d: number) => [number, number, number];
    readonly verifier_agreementsRollbackRegisters: (a: number, b: any, c: number, d: number, e: number, f: number) => [number, number, number];
    readonly verifier_agreementsRollbackVoices: (a: number, b: any, c: number, d: number, e: any, f: number, g: number) => [number, number, number];
    readonly verifier_agreementsServiceAccount: (a: number, b: any, c: number, d: number) => [number, number, number];
    readonly verifier_agreementsSplit: (a: number, b: any, c: number, d: number) => [number, number, number];
    readonly verifier_agreementsSplitNumbers: (a: number, b: any, c: number, d: number, e: number, f: number) => [number, number, number];
    readonly verifier_agreementsSplitTurns: (a: number, b: any, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => [number, number, number, number];
    readonly verifier_agreementsTagUnder: (a: number, b: any, c: number, d: number) => [number, number, number];
    readonly verifier_agreementsVersionInForce: (a: number, b: any, c: number, d: number) => [number, number, number, number];
    readonly verifier_agreementsVow: (a: number, b: any, c: number, d: number) => [number, number, number];
    readonly verifier_agreementsWorkOwners: (a: number, b: any, c: number, d: number) => [number, number, number];
    readonly verifier_bakeUploader: (a: number, b: number, c: number) => [number, number, number, number];
    readonly verifier_bindingStatus: (a: number, b: number, c: number) => [number, number, number, number];
    readonly verifier_failedToReach: (a: number, b: number, c: number) => [number, number];
    readonly verifier_foundAtHome: (a: number, b: number, c: number, d: number, e: number) => [number, number];
    readonly verifier_held: (a: number) => [number, number];
    readonly verifier_latest: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number];
    readonly verifier_link: (a: number, b: number, c: number, d: number, e: number) => [number, number, number, number];
    readonly verifier_moneyChoose: (a: number, b: number, c: number, d: number, e: number, f: any, g: number, h: number) => [number, number, number];
    readonly verifier_moneyForwardOwed: (a: number, b: any, c: number, d: number) => [number, number, number];
    readonly verifier_moneyJudge: (a: number, b: number, c: number, d: any) => [number, number, number];
    readonly verifier_moneyPointer: (a: number, b: number, c: number, d: number, e: number) => [number, number, number];
    readonly verifier_moneyRefundAlong: (a: number, b: any, c: number, d: number) => [number, number, number];
    readonly verifier_moneyRoute: (a: number, b: any, c: number, d: number, e: number, f: number) => [number, number, number];
    readonly verifier_moneyRouteBuyer: (a: number, b: any, c: number, d: number) => [number, number, number];
    readonly verifier_moneyVault: (a: number, b: number, c: number, d: number, e: number) => [number, number, number];
    readonly verifier_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => [number, number, number];
    readonly verifier_places: (a: number, b: number, c: number) => [number, number, number, number];
    readonly verifier_priceTag: (a: number, b: number, c: number) => [number, number, number, number];
    readonly verifier_quorum: (a: number, b: number, c: number, d: number, e: number) => [number, number, number];
    readonly verifier_resolve: (a: number, b: number, c: number) => [number, number, number];
    readonly verifier_status: (a: number, b: number, c: number) => [number, number, number, number];
    readonly verifier_succession: (a: number, b: number, c: number) => [number, number, number];
    readonly verifyShare: (a: number, b: number) => [number, number, number];
    readonly vowContestPayload: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly workHash: (a: number, b: number) => [number, number];
    readonly xwingDecapsulate: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly xwingEncapsulate: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly xwingPublic: (a: number, b: number) => [number, number, number, number];
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __externref_drop_slice: (a: number, b: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
