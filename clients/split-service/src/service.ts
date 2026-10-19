// A split service, FOR TESTS ONLY, on regtest (round 3, part C; F338: "a
// real one, even for testing, is an operator with its own Lightning node and
// identity, like the anchoring service"; Agreements rules 16 to 23; the split
// cMIP, draft 2; the money messages cMIP, draft 4, 4.4, F357). It talks only
// through MOR acts:
//
// - its identity, with an inbox and an encryption key, and its payee pointer
//   naming its own Lightning node: the address a collective's (or a deal's)
//   pointer names for it (the pointer check, rule 16);
// - **its grant keys**: for each grantor (a collective, or a deal's payee) it
//   makes a key and gives its public half; the grantor's grant names it
//   (field 9), and the service accepts it by a signature act (F128);
// - an **invoice request** for a payee whose agreement names it in field 14
//   (draft 4, 4.4: sealed to the service, the payee still the collective in
//   the commitment) is checked, then answered with an invoice of its own
//   node;
// - once its node shows the invoice settled, it signs **the receipt** with
//   the grantor's grant key (rule 16; Money draft 9, rule 7), sealed to the
//   payer and to every party (rule 57), waits for the payer's claim (its
//   referral, rule 22), then publishes **the split** (Agreements type 8,
//   with its own key, delivered to every holder it pays, rule 20): a role
//   share off the top where the claim names the repost the buyer followed,
//   the rest to the stake by its holders' shares, leftover units by rule 9;
// - **pays each payout** as a simple Money payment: an invoice request to
//   the holder, the holder's answer checked by the rail's rule, the invoice
//   paid from its node, its claim sent; the holder's Damgar receipts it;
// - tells each party of a sale of the collective's offer (draft 4, 7.2.3), so
//   a member's app delivers the work's key.
//
// Regtest coins only; nothing here is for real money.

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  MIRS,
  agreementsDivideStake,
  base64,
  cborDecode,
  commitmentCbor,
  describeAct,
  hex,
  lightningAddress,
  lightningProof,
  moneyPayload,
  moneyRead,
  openSealed,
  paymentCommitment,
  paymentProof,
  railCheck,
  randomBytes,
  unhex,
} from '../../genesis/src/core.ts';
import { TestIdentity, sealFor, type Home } from '../../genesis/src/identity.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { encryptionSecret } from '../../../modules/carry/src/carry.ts';
import { TYPES, answerPayload, invoiceRequestPayload, readAnswer, readCommitmentFields, readInvoiceRequest, salePayload } from '../../damgar/src/messages.ts';
import { ACCEPTABLE, MESSAGES_SPEC, MESSAGES_SPECS, SPEC } from '../../damgar/src/specs.ts';
import { allBy, makeGrantKey, signUnderGrant } from '../../grants/src/grant.ts';
import { collectiveNow, collectivePlaces, splitServiceOf, termsAt } from '../../grants/src/member.ts';
import { sign, splitPayload, type PayoutIn } from '../../repo/src/agreements.ts';
import { AGREEMENTS_TYPES, REPO_SPECS } from '../../repo/src/specs.ts';

export const LABEL = 'A TEST split service of MOR’s builders, on regtest only: its coins are worth nothing. Never for real money.';

/** Its node: its own invoices, their settlement, and paying a holder's invoice (a payout). */
export interface Node {
  nodeKey(): Promise<string>;
  addInvoice(sat: number, descriptionHash: string): Promise<{ invoice: string; hash: string }>;
  /** The preimage, hex, once settled; else null. */
  settled(hash: string): Promise<string | null>;
  /** Pay an invoice from the node; the preimage, hex. */
  pay(invoice: string): Promise<string>;
}

/** A grant key this service made for a grantor, and the grant naming it once found. */
interface GrantKeyHere {
  grantor: string;
  secret: string;
  public: string;
  grant: string | null;
  accepted: string | null;
  strand: string[];
}

/** A payout of a split: a simple Money payment from the service to a holder. */
interface Payout {
  receiver: string;
  amount: number;
  stake?: number;
  role?: string;
  evidence?: string;
  key: string | null;
  commitment: string | null;
  address: string | null;
  module: string | null;
  invoiceRequest: string | null;
  invoice: string | null;
  preimage: string | null;
  claim: string | null;
  why: string | null;
}

/** A payment the service answered for, from the invoice to the split and its payouts. */
interface Incoming {
  request: string;
  payer: string;
  payee: string;
  agreement: string;
  grant: string;
  commitment: string;
  key: string;
  invoice: string;
  hash: string;
  paid: boolean;
  /** Ticks since it was paid, waiting for the payer's claim (its referral). */
  waited: number;
  receipt: string | null;
  claim: string | null;
  referral: { identity: string; evidence: string } | null;
  split: string | null;
  payouts: Payout[];
  told: boolean;
}

interface State {
  identity: string;
  pointer: string;
  after: Record<string, number>;
  seen: string[];
  keys: GrantKeyHere[];
  incoming: Incoming[];
  /** Per agreement and stake: the running count of leftover units (rule 9, F165) and the latest split (F171). */
  tally: Record<string, [string, number][]>;
  latest: Record<string, string>;
  number: Record<string, number>;
}

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));
const short = (id: string) => `${id.slice(0, 8)}…`;
const list = (xs: string[]) => [...new Set(xs.filter(Boolean))];
/** How many ticks a paid payment waits for its payer's claim before it is split without one (its referral, if any, then unfilled). */
const CLAIM_WAIT = 3;

export class SplitService {
  private me!: TestIdentity;
  private s!: State;

  constructor(
    readonly dir: string,
    readonly node: Node,
    readonly opts: { homes: string[]; relays: string[] },
  ) {}

  private path(p: string) {
    return join(this.dir, p);
  }

  private save() {
    const w = (p: string, v: unknown) => {
      writeFileSync(`${p}.tmp`, JSON.stringify(v, null, 2) + '\n', { mode: 0o600 });
      renameSync(`${p}.tmp`, p);
    };
    this.me.save(this.path('identity.json'));
    w(this.path('state.json'), this.s);
  }

  get id() {
    return this.s.identity;
  }
  get state(): Readonly<State> {
    return this.s;
  }

  private get places() {
    return list([...this.opts.relays, ...this.opts.homes]);
  }

  /** Start: its identity and pointer made and published on first start; read back after. */
  async start(): Promise<void> {
    mkdirSync(this.dir, { recursive: true, mode: 0o700 });
    if (existsSync(this.path('state.json'))) {
      this.me = TestIdentity.load(this.path('identity.json'));
      this.s = JSON.parse(readFileSync(this.path('state.json'), 'utf8'));
      return;
    }
    const homes: Home[] = [];
    for (const hint of this.opts.homes) homes.push({ operator: hex((await relayAt(hint).info()).get(0) as Uint8Array), hint });
    this.me = TestIdentity.create({ homes });
    await this.me.publishGenesis();
    await this.me.publishRoutes([
      { scope: null, hints: this.opts.relays, kind: 0 },
      { scope: null, hints: this.opts.relays, kind: 1 },
    ]);
    await this.me.publishEncryptionKey(encryptionSecret(unhex(this.me.f.signingSecret)));
    for (const r of this.opts.relays) for (const act of this.me.chainActs()) await relayAt(r).putAct(act).catch(() => undefined);
    const node = await this.node.nodeKey();
    const pointer = moneyPayload({ type: 'pointer', payee: this.me.id, version: 1, rails: [{ module: SPEC.lightning.hash, address: lightningAddress({ network: 3, node }) }] }) as { type: number; payload: Uint8Array };
    const p = this.me.sign(MIRS.money, pointer.type, pointer.payload, { public: true });
    this.s = { identity: this.me.id, pointer: p.id, after: {}, seen: [], keys: [], incoming: [], tally: {}, latest: {}, number: {} };
    this.save();
    await this.publish(p.act);
  }

  /**
   * A grant key for `grantor` (F128: the grantee makes it and keeps its
   * secret; the grant names its public part): its public half, hex, for the
   * grantor's grant (field 9). The service accepts the grant once it finds it.
   */
  grantKey(grantor: string): string {
    const k = makeGrantKey();
    const pub = hex(k.public[1]);
    this.s.keys.push({ grantor, secret: hex(k.secret), public: pub, grant: null, accepted: null, strand: [] });
    this.save();
    return pub;
  }

  /** A public act, at its relays and homes. */
  private async publish(act: Uint8Array, extra: string[] = []) {
    for (const h of list([...this.places, ...extra])) await relayAt(h).putAct(act).catch(() => undefined);
  }

  /** Seal an act to several readers, each at its inbox; the act itself kept at `keep`. */
  private async sealTo(made: { act: Uint8Array; key: Uint8Array }, to: string[], keep: string[]): Promise<number> {
    const readers: { id: string; key: Uint8Array; inbox: string[] }[] = [];
    for (const id of list(to)) {
      try {
        const l = await lookUp(id, this.places);
        if (l.encryptionKey) readers.push({ id, key: l.encryptionKey, inbox: l.inbox(MESSAGES_SPEC) ?? l.routes.routes.flatMap((r) => r.hints) });
      } catch {
        // not found: not reached
      }
    }
    if (!readers.length) return 0;
    const sealed = sealFor(made.act, made.key, readers.map((r) => ({ id: r.id, key: r.key })));
    let left = 0;
    for (const h of list(readers.flatMap((r) => r.inbox))) {
      try {
        await relayAt(h).putSealed(sealed);
        left++;
      } catch {
        // away
      }
    }
    for (const h of list(keep)) await relayAt(h).putAct(made.act).catch(() => undefined);
    return left;
  }

  /** A private message of the money messages cMIP, from the service's own key, to one identity. */
  private async send(type: number, payload: Uint8Array, to: string, refs?: [string, string][]): Promise<string> {
    const made = this.me.sign(MESSAGES_SPEC, type, payload, { public: false, to: [to], refs });
    this.save();
    if (!(await this.sealTo(made, [to], this.me.f.homes.map((h) => h.hint)))) throw new Error(`${short(to)} could not be reached`);
    return made.id;
  }

  /** One round: grants accepted, the inbox read and answered, payments receipted and split, payouts paid. What it did, in plain words. */
  async tick(): Promise<string[]> {
    const said: string[] = [];
    await this.acceptGrants(said);
    await this.read(said);
    await this.payments(said);
    this.save();
    return said;
  }

  /** Grants naming one of its keys, found at the grantor's places and accepted by a signature act (F128). */
  private async acceptGrants(said: string[]) {
    for (const k of this.s.keys.filter((x) => !x.accepted)) {
      const places = await collectivePlaces(k.grantor, this.places).catch(() => this.places);
      for (const a of await allBy(k.grantor, places, {})) {
        const d = describeAct(a) as { id: string; spec?: string; type?: number; payload?: Uint8Array };
        if (d.spec !== REPO_SPECS.agreements || d.type !== AGREEMENTS_TYPES.grant || !d.payload) continue;
        const m = cborDecode(d.payload) as Map<number, unknown>;
        const grantee = m.get(0);
        const key = m.get(9) as unknown[] | undefined;
        if (!(grantee instanceof Uint8Array) || hex(grantee) !== this.me.id || !Array.isArray(key) || !(key[1] instanceof Uint8Array) || hex(key[1]) !== k.public) continue;
        k.grant = d.id;
        k.accepted = (await sign(this.me, d.id, list([...this.opts.relays, ...places]))).id;
        this.save();
        said.push(`The grant of ${short(k.grantor)} (${short(d.id)}) accepted.`);
        break;
      }
    }
  }

  private async read(said: string[]) {
    const secrets = this.me.f.encryption.map((e) => unhex(e.secret));
    for (const hint of this.opts.relays) {
      let after = this.s.after[hint];
      for (;;) {
        const page = await relayAt(hint).feed({ to: this.me.id, after });
        for (const it of page.items) {
          if (it.kind !== 'sealed') continue;
          for (const sec of secrets) {
            let o: { act: Uint8Array; key?: Uint8Array; described: { id: string; signer?: string; spec?: string; type?: number; payload?: Uint8Array } };
            try {
              o = openSealed(it.item, this.me.id, sec) as typeof o;
            } catch {
              continue;
            }
            const d = o.described;
            if (this.s.seen.includes(d.id)) break;
            this.s.seen.push(d.id);
            try {
              if (d.spec && MESSAGES_SPECS.includes(d.spec) && d.type === TYPES.invoiceRequest && d.signer && d.payload) said.push(await this.answer(d.id, d.signer, d.payload));
              else if (d.spec && MESSAGES_SPECS.includes(d.spec) && d.type === TYPES.answer && d.signer && d.payload) said.push(await this.onAnswer(d.signer, d.payload));
              else if (d.spec === MIRS.money && d.type === 3 && d.signer && d.payload) said.push(this.onClaim(d.id, d.signer, d.payload));
            } catch (e) {
              said.push(`A message from ${short(d.signer ?? '?')} not acted on: ${message(e)}`);
            }
            break;
          }
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
      this.s.after[hint] = after ?? 0;
    }
  }

  /** The agreement a payment to `payee` following `fulfils` is under: an offer's field 0, or a collective payee's agreement in force. */
  private async agreementOf(payee: string, fulfils: string, places: string[]): Promise<string | null> {
    for (const h of places) {
      const a = await relayAt(h).getAct(fulfils).catch(() => null);
      if (!a) continue;
      const d = describeAct(a) as { spec?: string; type?: number; payload?: Uint8Array };
      if (d.spec === MIRS.agreements && d.type === AGREEMENTS_TYPES.offer && d.payload) {
        const under = (cborDecode(d.payload) as Map<number, unknown>).get(0);
        if (under instanceof Uint8Array) return hex(under);
      }
      break;
    }
    return (await collectiveNow(payee, places).catch(() => null))?.agreement ?? null;
  }

  /** The money messages cMIP, draft 4, 4.4: an invoice request for a payee whose agreement names this service; checked, answered with an invoice of its own node. */
  private async answer(id: string, signer: string, payload: Uint8Array): Promise<string> {
    const ir = readInvoiceRequest(payload);
    const f = ir.fields;
    const refuse = async (why: string) => {
      await this.send(TYPES.answer, answerPayload({ to: id, commitment: f.hash, bound: { kind: 'refused', why }, ticket: null, amount: f.amount }), signer);
      return `Refused ${short(signer)}: ${why}.`;
    };
    if (f.payer !== signer) return refuse('the commitment names another payer');
    const k = this.s.keys.find((x) => x.grantor === f.payee && x.accepted);
    if (!k) return refuse('this service holds no accepted grant of that payee');
    const places = await collectivePlaces(f.payee, this.places).catch(() => this.places);
    const agreement = await this.agreementOf(f.payee, f.fulfils, places);
    if (!agreement) return refuse('the payee’s agreement could not be read');
    const named = await splitServiceOf(agreement, f.payee, places).catch(() => null);
    if (!named || named.service !== this.me.id || named.grant !== k.grant) return refuse('the payee’s agreement does not name this service in field 14');
    if (f.rail !== SPEC.lightning.hash || f.paidTo.kind !== 'flow') return refuse('this service is paid on Lightning, to the payee’s pointer');
    const inv = await this.node.addInvoice(f.amount.value, f.hash);
    this.s.incoming.push({ request: id, payer: signer, payee: f.payee, agreement, grant: k.grant!, commitment: base64(ir.commitment), key: f.hash, invoice: inv.invoice, hash: inv.hash, paid: false, waited: 0, receipt: null, claim: null, referral: null, split: null, payouts: [], told: false });
    this.save();
    await this.send(TYPES.answer, answerPayload({ to: id, commitment: f.hash, bound: { kind: 'invoice', invoice: inv.invoice }, ticket: null, amount: f.amount }), signer);
    return `An invoice of its node sent to ${short(signer)}, for ${short(f.payee)}.`;
  }

  /** A payer's claim of a payment it answered for: kept, with its referral (rule 22: the evidence a payer signs). */
  private onClaim(id: string, signer: string, payload: Uint8Array): string {
    const c = (moneyRead(3, payload) as { act: { payee: string; amount: { value: number }; fulfils: string; referral?: { identity: string; evidence: string } | null } }).act;
    const x = this.s.incoming.find((p) => p.payer === signer && p.payee === c.payee && p.claim === null && readCommitmentFields(Uint8Array.from(Buffer.from(p.commitment, 'base64'))).fulfils === c.fulfils);
    if (!x) return `A claim from ${short(signer)} for no payment answered here: kept aside.`;
    x.claim = id;
    x.referral = c.referral ?? null;
    return `The claim of ${short(signer)} arrived${x.referral ? `, naming the repost by ${short(x.referral.identity)}` : ''}.`;
  }

  /** Paid invoices: receipted with the grant key, then split once the claim is in (or has waited), then paid out. */
  private async payments(said: string[]) {
    for (const x of this.s.incoming) {
      if (!x.paid) {
        const pre = await this.node.settled(x.hash);
        if (!pre) continue;
        x.paid = true;
        await this.receipt(x, pre);
        said.push(`Paid by ${short(x.payer)}: its receipt signed with ${short(x.payee)}’s grant key, sealed to the payer and every party.`);
      }
      if (!x.split && !x.claim && x.waited++ < CLAIM_WAIT) continue;
      if (!x.split) {
        await this.split(x);
        said.push(`Split ${short(x.split!)}: ${x.payouts.map((p) => `${p.amount} to ${short(p.receiver)}${p.role ? ` (${p.role})` : ''}`).join(', ')}.`);
      }
      if (!x.told) await this.tell(x, said);
      for (const p of x.payouts.filter((y) => !y.invoiceRequest && !y.why && y.amount > 0)) await this.askPayout(x, p, said);
    }
  }

  /** The parties a receipt and a sale reach: a collective's parties in force, or a deal's. */
  private async parties(x: Incoming): Promise<string[]> {
    const t = (await termsAt(x.agreement, this.places)) as { parties?: string[] } | null;
    return t?.parties ?? [x.payee];
  }

  private async receipt(x: Incoming, pre: string) {
    const f = readCommitmentFields(Uint8Array.from(Buffer.from(x.commitment, 'base64')));
    const proof = paymentProof({ paidTo: f.paidTo, salt: f.salt, rail: lightningProof(x.invoice, unhex(pre)) }) as Uint8Array;
    const r = moneyPayload({ type: 'receipt', rail: f.rail, proof, payer: x.payer, payee: x.payee, amount: f.amount, fulfils: f.fulfils, ...(f.purchase ? { purchase: f.purchase } : {}) }) as { type: number; payload: Uint8Array };
    const k = this.s.keys.find((y) => y.grant === x.grant)!;
    const parties = await this.parties(x);
    const made = signUnderGrant({ grant: k.grant!, grantor: k.grantor, secret: k.secret, strand: k.strand }, { spec: MIRS.money, type: r.type, payload: r.payload, public: false, to: list([x.payer, ...parties]) });
    this.save();
    const places = await collectivePlaces(x.payee, this.places).catch(() => this.places);
    await this.sealTo(made, [x.payer, ...parties], places);
    x.receipt = made.id;
  }

  /** The split (rule 20): its payouts by the plan, published with its own key, delivered to every holder it pays. */
  private async split(x: Incoming) {
    const t = (await termsAt(x.agreement, this.places)) as { stakes?: [string | null, [string | null, number][]][]; plan?: { shares: { kind: string; stake?: number | null; role?: string | null; part: number }[]; cmip: string; top: number[] } | null } | null;
    const amount = readCommitmentFields(Uint8Array.from(Buffer.from(x.commitment, 'base64'))).amount.value;
    const plan = t?.plan ?? null;
    const payouts: Payout[] = [];
    let rest = amount;
    // Role shares off the top (rule 22): a referral the payer's own claim names.
    for (const sh of plan?.shares ?? []) {
      if (sh.kind !== 'role') continue;
      const part = Math.floor((amount * sh.part) / 1_000_000);
      if (sh.role === 'referral' && x.referral && x.claim && part > 0) {
        payouts.push(blank({ receiver: x.referral.identity, amount: part, role: 'referral', evidence: x.claim }));
        rest -= part;
      }
    }
    // The rest to the stake, by its holders' shares (rule 9: leftovers to the largest remainders, ties taking turns).
    const stake = t?.stakes?.[0];
    const holders = (stake?.[1] ?? []).filter((h): h is [string, number] => typeof h[0] === 'string');
    const tk = `${x.agreement}:0`;
    const before = this.s.tally[tk] ?? [];
    if (holders.length) {
      const turns = holders.map(([h]) => before.find(([y]) => y === h)?.[1] ?? 0);
      const parts = Array.from(agreementsDivideStake({ total: rest, holders, turns }) as Float64Array, Number);
      holders.forEach(([h], i) => payouts.push(blank({ receiver: h, amount: parts[i], stake: 0 })));
      // The running count: each holder's leftover units so far.
      this.s.tally[tk] = holders.map(([h, n], i) => [h, (before.find(([y]) => y === h)?.[1] ?? 0) + (parts[i] - Math.floor((rest * n) / 1_000_000))]);
    }
    const number = (this.s.number[x.agreement] ?? 0) + 1;
    this.s.number[x.agreement] = number;
    const previous = this.s.latest[tk];
    const ps: PayoutIn[] = payouts.map((p) => ({ receiver: p.receiver, amount: p.amount, ...(p.stake !== undefined ? { stake: p.stake } : {}), ...(p.role ? { role: p.role, evidence: p.evidence } : {}) }));
    const payload = splitPayload({ receipt: x.receipt!, payouts: ps, cmip: plan?.cmip ?? x.agreement, agreement: x.agreement, tally: holders.length ? [[0, this.s.tally[tk]]] : undefined, number });
    const receivers = list(payouts.map((p) => p.receiver));
    const made = this.me.sign(REPO_SPECS.agreements, AGREEMENTS_TYPES.split, payload, { public: false, to: receivers, refs: previous ? [previous] : undefined });
    this.save();
    await this.sealTo(made, receivers, this.me.f.homes.map((h) => h.hint));
    this.s.latest[tk] = made.id;
    x.split = made.id;
    x.payouts = payouts;
  }

  /** A sale of an offer selling a publication: told to every party (the money messages cMIP, draft 4, 7.2.3), so a member's app delivers the key. */
  private async tell(x: Incoming, said: string[]) {
    x.told = true;
    const f = readCommitmentFields(Uint8Array.from(Buffer.from(x.commitment, 'base64')));
    let publication: string | null = null;
    for (const h of await collectivePlaces(x.payee, this.places).catch(() => this.places)) {
      const a = await relayAt(h).getAct(f.fulfils).catch(() => null);
      if (!a) continue;
      const d = describeAct(a) as { spec?: string; type?: number; payload?: Uint8Array };
      if (d.spec === MIRS.agreements && d.type === AGREEMENTS_TYPES.offer && d.payload) {
        const sold = (cborDecode(d.payload) as Map<number, unknown>).get(1) as unknown[][] | undefined;
        const pub = sold?.find((s) => s[0] === 0)?.[1];
        if (pub instanceof Uint8Array) publication = hex(pub);
      }
      break;
    }
    if (!publication || !x.receipt) return;
    const parties = await this.parties(x);
    for (const m of parties) {
      try {
        await this.send(TYPES.sale, salePayload({ offer: f.fulfils, buyer: x.payer, receipt: x.receipt, publication }), m, [[publication, x.payee]]);
      } catch (e) {
        said.push(`The sale could not be told to ${short(m)}: ${message(e)}`);
      }
    }
    said.push(`The sale told to ${parties.length} part${parties.length === 1 ? 'y' : 'ies'}.`);
  }

  /** A payout's invoice request (rule 23: a simple Money payment, its own receipt naming the split): to the holder's pointer, as Money routes it. */
  private async askPayout(x: Incoming, p: Payout, said: string[]) {
    try {
      const l = await lookUp(p.receiver, this.places);
      // Its pointer and vault, as Money reads them: its public acts at its places.
      for (const a of await allBy(p.receiver, list([...this.places, ...l.resolution.homes.map((h) => h.hint), ...l.routes.routes.flatMap((r) => r.hints)]), {})) {
        try {
          l.verifier.add(a);
        } catch {
          // held already
        }
      }
      const unit = readCommitmentFields(Uint8Array.from(Buffer.from(x.commitment, 'base64'))).amount.unit;
      const accepted = ACCEPTABLE.flatMap((a) => a.hashes);
      const c = l.verifier.moneyChoose(MIRS.money, p.receiver, { unit, value: p.amount }, accepted) as { to: string; pointer?: string; rail?: number; declaredBy?: string; entry?: number; module?: string; address?: Uint8Array; why: string };
      const ptr = l.verifier.moneyPointer(MIRS.money, p.receiver) as { act: string | null };
      if (c.to === 'nowhere' || !c.module || !ptr.act) throw new Error(c.why || 'no payee pointer');
      if (c.module !== SPEC.lightning.hash) throw new Error('this service pays on Lightning only');
      const paidTo = c.to === 'flow' ? { kind: 'flow', pointer: c.pointer!, rail: c.rail ?? 0 } : { kind: 'vault', declaredBy: c.declaredBy!, entry: c.entry ?? 0 };
      const cm = { rail: c.module, payee: p.receiver, amount: { unit, value: p.amount }, fulfils: ptr.act, payer: this.me.id, paidTo, salt: new Uint8Array(randomBytes(16)) };
      const bytes = commitmentCbor(cm) as Uint8Array;
      p.key = paymentCommitment(cm) as string;
      p.commitment = base64(bytes);
      p.address = base64(new Uint8Array(c.address!));
      p.module = c.module;
      p.invoiceRequest = await this.send(TYPES.invoiceRequest, invoiceRequestPayload({ commitment: bytes, whatFor: `a payout of the split ${short(x.split!)}`, answers: null, ticket: null }), p.receiver, [[x.split!, this.me.id]]);
      said.push(`A payout of ${p.amount} asked of ${short(p.receiver)}.`);
    } catch (e) {
      p.why = message(e);
      said.push(`A payout to ${short(p.receiver)} is held: ${p.why}. It stays the service’s open obligation (rule 30).`);
    }
  }

  /** A holder's answer to a payout's invoice request: checked by the rail's rule, the invoice paid from the node, the claim sent (rule 23). */
  private async onAnswer(signer: string, payload: Uint8Array): Promise<string> {
    const a = readAnswer(payload);
    let p: Payout | undefined;
    let x: Incoming | undefined;
    for (const y of this.s.incoming) {
      const q = y.payouts.find((z) => z.invoiceRequest === a.to);
      if (q) {
        p = q;
        x = y;
        break;
      }
    }
    if (!p || !x || p.receiver !== signer || p.key !== a.commitment) throw new Error('an answer to no payout of this service');
    if (a.bound.kind !== 'invoice') {
      p.why = a.bound.kind === 'refused' ? a.bound.why : 'an on-chain answer, which this service does not pay';
      return `The payout to ${short(signer)} is held: ${p.why}.`;
    }
    const pending = railCheck(p.module!, p.key, { unit: readCommitmentFields(Uint8Array.from(Buffer.from(p.commitment!, 'base64'))).amount.unit, value: p.amount }, Uint8Array.from(Buffer.from(p.address!, 'base64')), lightningProof(a.bound.invoice, undefined) as Uint8Array, null) as { answer: string; why: string };
    if (pending.answer !== 'pending') {
      p.why = `the invoice does not bind the payout (${pending.answer}: ${pending.why})`;
      return `The payout to ${short(signer)} is held: ${p.why}.`;
    }
    const pre = await this.node.pay(a.bound.invoice);
    p.invoice = a.bound.invoice;
    p.preimage = pre;
    const f = readCommitmentFields(Uint8Array.from(Buffer.from(p.commitment!, 'base64')));
    const proof = paymentProof({ paidTo: f.paidTo, salt: f.salt, rail: lightningProof(a.bound.invoice, unhex(pre)) }) as Uint8Array;
    const claim = moneyPayload({ type: 'claim', rail: f.rail, proof, payee: p.receiver, amount: f.amount, fulfils: f.fulfils }) as { type: number; payload: Uint8Array };
    const made = this.me.sign(MIRS.money, claim.type, claim.payload, { public: false, to: [p.receiver], refs: [[x.split!, this.me.id]] });
    this.save();
    await this.sealTo(made, [p.receiver], this.me.f.homes.map((h) => h.hint));
    p.claim = made.id;
    return `Paid ${p.amount} to ${short(signer)}: its claim sent.`;
  }
}

function blank(p: { receiver: string; amount: number; stake?: number; role?: string; evidence?: string }): Payout {
  return { ...p, key: null, commitment: null, address: null, module: null, invoiceRequest: null, invoice: null, preimage: null, claim: null, why: null };
}
