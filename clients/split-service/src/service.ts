// A split service, FOR TESTS ONLY, on regtest (round 3, part C; F338: "a
// real one, even for testing, is an operator with its own Lightning node and
// identity, like the anchoring service"). Moved to the publication (round 8,
// F407): Agreements draft 17, "Publication (type 6)" and rules 11 to 29; the
// split cMIP, draft 4 (`cmips/cmip-split-draft-4.md`, `mor_split::divide`);
// the money messages cMIP, draft 4, 4.4. It talks only through MOR acts.
//
// In plain words: a seller (or a collective) writes a publication that names
// this service as the one that receives every payment and pays everyone. The
// service signs the publication, as each party does, and puts a price tag on
// it, its own payee: so a buyer pays the service, in the service's own name.
// It then divides each payment as the publication says: the partners and the
// referral off the top, what is left to the owners, and pays each person.
//
// Precisely:
//
// - its identity, with an inbox and an encryption key, and its payee pointer
//   naming its own Lightning node;
// - **it signs a publication naming it** (field 3, or a backup of field 11):
//   `accept(publication)`, or a publication sealed to its inbox (rule 11:
//   every party signs; the split service is a party). It accepts only a
//   publication whose plan names the split cMIP it runs (draft 4);
// - **its price tag** (Money type 5, rule 18): `tag(publication, price)`,
//   signed by the service, naming the publication by its first version, its
//   payee the service itself; a later version changes the price, one with
//   no price withdraws it;
// - an **invoice request** to the service (it receives in its own name) for
//   one of its tags, or naming a publication it serves (a tip through the
//   publication, Money rule 18), is checked and answered with an invoice of
//   its own node;
// - once paid, it signs **the receipt** with its own key, payee itself,
//   sealed to the payer; it waits for the payer's claim (the referral it
//   names, rule 22), then publishes **the split** (type 8, naming the
//   publication in field 3), delivered to every receiver: each partner its
//   share off the top (payout key 8), the referral role off the top where
//   the claim names a repost, then the owners' line, what is left: a lone
//   seller's drafter, whole; or the holders of the ownership agreement's one
//   stake by their shares, rule 9, ties by turns from its own running count
//   (payout key 2, split key 4);
// - **pays each payout** as a simple Money payment: an invoice request to
//   the receiver, its commitment fulfilling the split (Agreements rule 23:
//   "with its own receipt naming the split"), its answer checked by the
//   rail's rule, the invoice paid from its node, its claim sent; and keeps
//   **each receiver's receipt** of its payout, sealed to the service, signed
//   by the receiver with their own key (round 9, F411: "the service signs
//   its receipt, then the members sign theirs after the split. Each hop has
//   its receipt"; `hops()`);
// - tells the publication's side of a sale of a bake or a vow it sells (the
//   money messages cMIP, draft 4, 7.2.3), so the seller's app delivers the
//   key.
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
import { allBy } from '../../grants/src/grant.ts';
import { collectivePlaces, collectiveVerifier, collectiveNow, termsAt } from '../../grants/src/member.ts';
import { SPLIT_CMIP, sign, splitPayload, type PayoutIn } from '../../repo/src/agreements.ts';
import { AGREEMENTS_TYPES, REPO_SPECS } from '../../repo/src/specs.ts';

export const LABEL = 'A TEST split service of MOR’s builders, on regtest only: its coins are worth nothing. Never for real money.';

/** Money's price tag (type 5, rule 18). */
const PRICE_TAG = 5;

/** Its node: its own invoices, their settlement, and paying a receiver's invoice (a payout). */
export interface Node {
  nodeKey(): Promise<string>;
  addInvoice(sat: number, descriptionHash: string): Promise<{ invoice: string; hash: string }>;
  /** The preimage, hex, once settled; else null. */
  settled(hash: string): Promise<string | null>;
  /** Pay an invoice from the node; the preimage, hex. */
  pay(invoice: string): Promise<string>;
}

/** A publication as this service reads it (Agreements, "Publication (type 6)"), from the version given. */
export interface PublicationRead {
  /** Its first version: what its tags, its splits and its later versions name. */
  first: string;
  /** The version read. */
  version: string;
  /** Its drafter: the signer of the version read; without owners, the lone owner. */
  drafter: string;
  /** What it sells: `[0, bake]`, `[2, [cmip, terms]]` or `[3, vow]`, as hex where a hash; empty where a later version ends it. */
  sold: [number, string | null][];
  /** A split agreement (no field 0, rule 15): it sells nothing, and divides what reaches its service for the ownership agreement it names, a collective's. */
  splitAgreement: boolean;
  /** The ownership agreement whose holders take the owners' line (field 1), by its founding version; null for a lone seller's. */
  owners: string | null;
  /** The partners (field 2), in its order (ascending by identity): each its share in millionths. */
  partners: { identity: string; share: number; label: string | null }[];
  service: string;
  backups: string[];
  designated: string | null;
  /** The split plan (field 4): its role shares, the split cMIP, what an unfilled role does (0 to the owners' line). */
  plan: { roles: { role: string; part: number }[]; metrics: number; cmip: string; unfilled: number };
  /** The collective whose chain it cites, where it is a collective's (objects `[collective, decision]`). */
  collective: string | null;
}

/** A payout of a split: a simple Money payment from the service to a receiver. */
interface Payout {
  receiver: string;
  amount: number;
  /** On the owners' line: the ownership agreement it pays (payout key 2). */
  owners?: string;
  /** A partner it pays, by its index in the publication (payout key 8). */
  partner?: number;
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
  /** The receiver's own receipt of this payout, sealed to the service, naming the split (rule 23): the last hop's. */
  receipt?: string | null;
  why: string | null;
}

/** A payment the service answered for, from the invoice to the split and its payouts. */
interface Incoming {
  request: string;
  payer: string;
  /** The publication it is paid under, by its first version. */
  publication: string;
  /** The price tag it pays, or null for a tip through the publication. */
  tag: string | null;
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

/** A price tag this service signed under a publication: its line. */
interface TagHere {
  publication: string;
  first: string;
  latest: string;
  version: number;
  price: { unit: string; value: number } | null;
}

interface State {
  identity: string;
  pointer: string;
  after: Record<string, number>;
  seen: string[];
  /** The publications it signed as a party, by first version: the signature act, and the version signed. */
  signed: Record<string, { version: string; signature: string }>;
  tags: TagHere[];
  /** Collectives whose places it reads each round for a split agreement naming it, to sign (rule 15). */
  watched?: string[];
  incoming: Incoming[];
  /** Per ownership agreement: the running count of leftover units on its owners' line (rule 9, F165; split key 4). */
  tally: Record<string, [string, number][]>;
  /** Per publication: the latest split (F171), and the splits' numbering (split key 5). */
  latest: Record<string, string>;
  number: Record<string, number>;
}

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));
const short = (id: string) => `${id.slice(0, 8)}…`;
const list = (xs: string[]) => [...new Set(xs.filter(Boolean))];
const h = (x: unknown): string | null => (x instanceof Uint8Array ? hex(x) : null);
/** How many ticks a paid payment waits for its payer's claim before it is split without one (its referral, if any, then unfilled). */
const CLAIM_WAIT = 3;
/** A share in millionths of a payment, rounded down (the split cMIP, draft 4: everything off the top). */
const off = (amount: number, part: number) => Number((BigInt(amount) * BigInt(part)) / 1_000_000n);

/**
 * A publication's payload read (Agreements type 6), from its act: what the
 * service needs to serve it. Null where the act is no publication. Its
 * `first` is the act itself and `collective` null until `objects` are
 * resolved (`SplitService.publication`): a later version's `[first,
 * previous]` and a collective's `[collective, decision]` look alike until
 * the act they name is read.
 */
export function readPublication(act: Uint8Array): (PublicationRead & { objects: [string, string][] }) | null {
  const d = describeAct(act) as { id: string; signer?: string; spec?: string; type?: number; payload?: Uint8Array; objects?: [string, string][] };
  if (d.spec !== MIRS.agreements || d.type !== AGREEMENTS_TYPES.publication || !d.payload || !d.signer) return null;
  const m = cborDecode(d.payload) as Map<number, unknown>;
  const plan = (m.get(4) as Map<number, unknown> | undefined) ?? new Map();
  const shares = (plan.get(0) as unknown[][] | undefined) ?? [];
  const cmips = m.get(9) as Map<number, Uint8Array> | undefined;
  return {
    first: d.id,
    version: d.id,
    drafter: d.signer,
    sold: ((m.get(0) as unknown[][] | undefined) ?? []).map((x) => [Number(x[0]), Number(x[0]) === 2 ? h((x[1] as unknown[])[0]) : h(x[1])]),
    splitAgreement: !m.has(0),
    owners: h(m.get(1)),
    partners: ((m.get(2) as Map<number, unknown>[] | undefined) ?? []).map((q) => ({ identity: h(q.get(0))!, share: Number(q.get(1)), label: typeof q.get(2) === 'string' ? (q.get(2) as string) : null })),
    service: h(m.get(3))!,
    backups: ((m.get(11) as Uint8Array[] | undefined) ?? []).map((x) => hex(x)),
    designated: h(m.get(10)),
    plan: {
      roles: shares.filter((x) => Number(x[0]) === 1).map((x) => ({ role: String(x[1]), part: Number(x[2]) })),
      metrics: shares.filter((x) => Number(x[0]) === 3).length,
      cmip: h(plan.get(1)) ?? (cmips?.get(8) ? hex(cmips.get(8)!) : ''),
      unfilled: Array.isArray(plan.get(3)) ? Number((plan.get(3) as unknown[])[0]) : 0,
    },
    collective: null,
    objects: d.objects ?? [],
  };
}

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
    this.s = { identity: this.me.id, pointer: p.id, after: {}, seen: [], signed: {}, tags: [], incoming: [], tally: {}, latest: {}, number: {} };
    this.save();
    await this.publish(p.act);
  }

  /** A public act, at its relays and homes. */
  private async publish(act: Uint8Array, extra: string[] = []) {
    for (const x of list([...this.places, ...extra])) await relayAt(x).putAct(act).catch(() => undefined);
  }

  private async getAct(id: string, extra: string[] = []): Promise<Uint8Array | null> {
    for (const x of list([...this.places, ...extra])) {
      const a = await relayAt(x).getAct(id).catch(() => null);
      if (a) return a;
    }
    return null;
  }

  /**
   * A publication by any of its versions, read at the latest version its
   * drafter's places hold (a later version names `[first, previous]`, rule
   * 11): what the service serves. Null where it is not found or is no
   * publication.
   */
  async publication(id: string, extra: string[] = []): Promise<PublicationRead | null> {
    const at = list([...this.places, ...extra]);
    const a = await this.getAct(id, extra);
    const p0 = a ? readPublication(a) : null;
    if (!p0) return null;
    // Its objects: a later version's [first, previous] names a publication; a collective's [collective, decision] names a collective (rule 58).
    let first = p0.version;
    let collective: string | null = null;
    for (const [c, prev] of p0.objects) {
      if (c === p0.owners && prev === p0.owners) continue;
      const x = await this.getAct(prev, extra);
      if (x && c !== prev && readPublication(x)) first = c;
      else collective ??= c;
    }
    // Its later versions, by the same drafter, naming the first, followed from the version given.
    let latest: PublicationRead = { ...p0, first, collective };
    for (let moved = true; moved; ) {
      moved = false;
      for (const x of await allBy(latest.drafter, at, {}).catch(() => [] as Uint8Array[])) {
        const d = describeAct(x) as { id: string; spec?: string; type?: number; objects?: [string, string][] };
        if (d.spec !== MIRS.agreements || d.type !== AGREEMENTS_TYPES.publication) continue;
        if (!(d.objects ?? []).some(([c, prev]) => c === first && prev === latest.version)) continue;
        const q = readPublication(x);
        if (q) {
          latest = { ...q, first, collective };
          moved = true;
        }
      }
    }
    const { objects: _o, ...rest } = latest as PublicationRead & { objects?: unknown };
    void _o;
    return rest;
  }

  /**
   * Sign a publication naming this service (rule 11: every party signs; the
   * split service is one): its split service (field 3) or a backup (field
   * 11), its plan under the split cMIP this service runs (draft 4). What it
   * did, in plain words; refused with why.
   */
  async accept(publication: string, extra: string[] = []): Promise<string> {
    const p = await this.publication(publication, extra);
    if (!p) throw new Error(`The publication ${short(publication)} was not found at the places asked.`);
    if (p.service !== this.me.id && !p.backups.includes(this.me.id)) throw new Error('The publication names another split service, and this one as no backup.');
    if (p.plan.cmip !== SPLIT_CMIP) throw new Error('Its split plan names a split cMIP this service does not run (it runs the split cMIP, draft 4).');
    if (p.plan.metrics) throw new Error('Its plan has a metric share: this service reads no metric records (the split cMIP, draft 4, QS4).');
    if (p.plan.unfilled !== 0) throw new Error('Its plan holds an unfilled role open or sends it to a named party: the split cMIP, draft 4, does not split such a payment (QS3).');
    const had = this.s.signed[p.first];
    if (had?.version === p.version) return `The publication ${short(p.first)} was signed already.`;
    const places = list([...this.opts.relays, ...this.opts.homes, ...extra]);
    const sig = await sign(this.me, p.version, places);
    this.s.signed[p.first] = { version: p.version, signature: sig.id };
    this.save();
    return `The publication ${short(p.first)} signed, as its ${p.service === this.me.id ? 'split service' : 'backup split service'}.`;
  }

  /**
   * The service's price tag under a publication it signed (Money type 5,
   * rule 18): its payee the service itself, so a buyer pays the service in
   * its own name. A later call makes the next version; no price withdraws
   * the tag. The tag's id.
   */
  async tag(publication: string, price: { unit: string; value: number } | null): Promise<string> {
    const p = await this.publication(publication);
    if (!p) throw new Error(`The publication ${short(publication)} was not found.`);
    if (p.splitAgreement) throw new Error('A split agreement sells nothing and takes no price tag (rule 15): a payment to the collective’s pointer is divided under it.');
    if (!this.s.signed[p.first]) throw new Error('The service has not signed that publication: accept it first.');
    const was = this.s.tags.find((t) => t.publication === p.first);
    const version = (was?.version ?? 0) + 1;
    const made = moneyPayload({ type: 'priceTag', publication: p.first, version, ...(was ? { previous: was.latest } : {}), ...(price ? { price } : {}), payee: this.me.id }) as { type: number; payload: Uint8Array };
    const t = this.me.sign(MIRS.money, made.type, made.payload, { public: true, ...(was ? { objects: [[was.first, was.latest]] as [string, string][] } : {}) });
    if (was) Object.assign(was, { latest: t.id, version, price });
    else this.s.tags.push({ publication: p.first, first: t.id, latest: t.id, version, price });
    this.save();
    await this.publish(t.act);
    return t.id;
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
    for (const x of list(readers.flatMap((r) => r.inbox))) {
      try {
        await relayAt(x).putSealed(sealed);
        left++;
      } catch {
        // away
      }
    }
    for (const x of list(keep)) await relayAt(x).putAct(made.act).catch(() => undefined);
    return left;
  }

  /** A private message of the money messages cMIP, from the service's own key, to one identity. */
  private async send(type: number, payload: Uint8Array, to: string, refs?: [string, string][]): Promise<string> {
    const made = this.me.sign(MESSAGES_SPEC, type, payload, { public: false, to: [to], refs });
    this.save();
    if (!(await this.sealTo(made, [to], this.me.f.homes.map((x) => x.hint)))) throw new Error(`${short(to)} could not be reached`);
    return made.id;
  }

  /**
   * Watch a collective (rule 15): each round, the split agreements naming
   * this service found where the collective's acts are (a member makes one
   * for the collective, naming it) are signed, as `accept` signs one.
   */
  watch(collective: string): void {
    this.s.watched = list([...(this.s.watched ?? []), collective]);
    this.save();
  }

  /** The publications naming this service, found where each watched collective's acts are, signed (rule 11). */
  private async watching(said: string[]) {
    for (const c of this.s.watched ?? []) {
      const places = await collectivePlaces(c, this.places).catch(() => this.places);
      const acts = (await collectiveVerifier(c, places).catch(() => null))?.acts ?? [];
      for (const a of acts) {
        const p = readPublication(a);
        if (!p || (p.service !== this.me.id && !p.backups.includes(this.me.id))) continue;
        if (!p.objects.some(([x]) => x === c)) continue;
        if (Object.values(this.s.signed).some((x) => x.version === p.version)) continue;
        try {
          said.push(await this.accept(p.version, places));
        } catch (e) {
          said.push(`A publication naming this service, ${short(p.version)}, not signed: ${message(e)}`);
        }
      }
    }
  }

  /** One round: the publications of watched collectives signed, the inbox read and answered, payments receipted and split, payouts paid. What it did, in plain words. */
  async tick(): Promise<string[]> {
    const said: string[] = [];
    await this.watching(said);
    await this.read(said);
    await this.payments(said);
    this.save();
    return said;
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
              else if (d.spec === MIRS.money && d.type === 2 && d.signer && d.payload) said.push(this.onReceipt(d.id, d.signer, d.payload));
              // A publication sealed to the service: its drafter asks it to sign (rule 11). The act itself is kept at the service's places so its id resolves.
              else if (d.spec === MIRS.agreements && d.type === AGREEMENTS_TYPES.publication) {
                await this.publish(o.act);
                said.push(await this.accept(d.id));
              }
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

  /**
   * What a payment to this service follows: one of its price tags under a
   * publication it signed (a purchase, Money rule 18), or such a
   * publication itself (a tip through it). Null with why, otherwise.
   */
  private async underWhat(fulfils: string): Promise<{ publication: PublicationRead; tag: TagHere | null } | { why: string }> {
    const tag = this.s.tags.find((t) => t.first === fulfils || t.latest === fulfils) ?? null;
    if (tag && tag.latest !== fulfils) return { why: 'it names a version of the price tag that a later one replaced' };
    if (tag && !tag.price) return { why: 'the price tag it names is withdrawn' };
    if (!tag) {
      // A tag of the publication's designated party (field 10) counts too (rule 18).
      const a = await this.getAct(fulfils);
      const d = a ? (describeAct(a) as { signer?: string; spec?: string; type?: number; payload?: Uint8Array }) : null;
      if (d?.spec === MIRS.money && d.type === PRICE_TAG && d.payload) {
        const m = cborDecode(d.payload) as Map<number, unknown>;
        const pub = h(m.get(1));
        const p = pub ? await this.publication(pub) : null;
        if (!p || !this.s.signed[p.first]) return { why: 'the price tag names no publication this service signed' };
        if (h(m.get(5)) !== this.me.id) return { why: 'the price tag’s payee is not this service' };
        if (d.signer !== p.designated) return { why: 'the price tag is signed by neither this service nor the party the publication designates: nobody’s offer under it (Money rule 18)' };
        const price = m.get(4) as [Uint8Array, number | bigint] | undefined;
        if (!price) return { why: 'the price tag it names is withdrawn' };
        return { publication: p, tag: { publication: p.first, first: fulfils, latest: fulfils, version: Number(m.get(2)), price: { unit: hex(price[0]), value: Number(price[1]) } } };
      }
    }
    const p = await this.publication(tag ? tag.publication : fulfils);
    if (!p || !this.s.signed[p.first]) return { why: 'it follows no publication this service signed, nor one of its price tags' };
    return { publication: p, tag };
  }

  /** The money messages cMIP, draft 4, 4.4: an invoice request to the service, in its own name; checked, answered with an invoice of its own node. */
  private async answer(id: string, signer: string, payload: Uint8Array): Promise<string> {
    const ir = readInvoiceRequest(payload);
    const f = ir.fields;
    const refuse = async (why: string) => {
      await this.send(TYPES.answer, answerPayload({ to: id, commitment: f.hash, bound: { kind: 'refused', why }, ticket: null, amount: f.amount }), signer);
      return `Refused ${short(signer)}: ${why}.`;
    };
    if (f.payer !== signer) return refuse('the commitment names another payer');
    if (f.payee !== this.me.id) return refuse('a split service receives in its own name: the payee is the service (Agreements, “Split service”)');
    const under = await this.underWhat(f.fulfils);
    if ('why' in under) return refuse(under.why);
    const p = under.publication;
    if (!p.splitAgreement && !p.sold.length) return refuse('the publication is ended: its latest version sells nothing (rule 11)');
    if (under.tag && (under.tag.price!.unit !== f.amount.unit || under.tag.price!.value !== f.amount.value)) return refuse('a payment of a price tag pays the price it states (Money rule 18)');
    if (f.purchase && (!p.owners || f.purchase[0] !== p.owners)) return refuse('the purchase it names is not the ownership agreement the publication names');
    if (f.rail !== SPEC.lightning.hash || f.paidTo.kind !== 'flow') return refuse('this service is paid on Lightning, to its own pointer');
    const inv = await this.node.addInvoice(f.amount.value, f.hash);
    this.s.incoming.push({ request: id, payer: signer, publication: p.first, tag: under.tag?.first ?? null, commitment: base64(ir.commitment), key: f.hash, invoice: inv.invoice, hash: inv.hash, paid: false, waited: 0, receipt: null, claim: null, referral: null, split: null, payouts: [], told: false });
    this.save();
    await this.send(TYPES.answer, answerPayload({ to: id, commitment: f.hash, bound: { kind: 'invoice', invoice: inv.invoice }, ticket: null, amount: f.amount }), signer);
    return `An invoice of its node sent to ${short(signer)}, under the publication ${short(p.first)}.`;
  }

  /** A payer's claim of a payment it answered for: kept, with its referral (rule 22: the evidence a payer signs). */
  private onClaim(id: string, signer: string, payload: Uint8Array): string {
    const c = (moneyRead(3, payload) as { act: { payee: string; amount: { value: number }; fulfils: string; referral?: { identity: string; evidence: string } | null } }).act;
    const x = this.s.incoming.find((p) => p.payer === signer && c.payee === this.me.id && p.claim === null && readCommitmentFields(Uint8Array.from(Buffer.from(p.commitment, 'base64'))).fulfils === c.fulfils);
    if (!x) return `A claim from ${short(signer)} for no payment answered here: kept aside.`;
    x.claim = id;
    x.referral = c.referral ?? null;
    return `The claim of ${short(signer)} arrived${x.referral ? `, naming the repost by ${short(x.referral.identity)}` : ''}.`;
  }

  /** Paid invoices: receipted with the service's own key, then split once the claim is in (or has waited), then paid out. */
  private async payments(said: string[]) {
    for (const x of this.s.incoming) {
      if (!x.paid) {
        const pre = await this.node.settled(x.hash);
        if (!pre) continue;
        x.paid = true;
        await this.receipt(x, pre);
        said.push(`Paid by ${short(x.payer)}: its receipt signed in the service’s own name, sealed to the payer.`);
      }
      if (!x.split && !x.claim && x.waited++ < CLAIM_WAIT) continue;
      if (!x.split) {
        try {
          await this.split(x);
        } catch (e) {
          said.push(`The payment of ${short(x.payer)} is not split: ${message(e)}. It stays the service’s open obligation (rule 30).`);
          continue;
        }
        said.push(`Split ${short(x.split!)}: ${x.payouts.map((p) => `${p.amount} to ${short(p.receiver)}${p.role ? ` (${p.role})` : p.partner !== undefined ? ' (partner)' : ''}`).join(', ')}.`);
      }
      if (!x.told) await this.tell(x, said);
      for (const p of x.payouts.filter((y) => !y.invoiceRequest && !y.why && y.amount > 0)) await this.askPayout(x, p, said);
    }
  }

  /**
   * The ownership agreement's version in force for a payment (rule 12, read
   * by reference): a collective's agreement in force where the publication
   * is a collective's and its line holds it; else the founding version.
   * *A reading: this test service follows no other line.*
   */
  private async ownersNow(p: PublicationRead): Promise<string> {
    if (p.collective) {
      const now = await collectiveNow(p.collective, this.places).catch(() => null);
      if (now?.agreement) return now.agreement;
    }
    return p.owners!;
  }

  private async receipt(x: Incoming, pre: string) {
    const f = readCommitmentFields(Uint8Array.from(Buffer.from(x.commitment, 'base64')));
    const proof = paymentProof({ paidTo: f.paidTo, salt: f.salt, rail: lightningProof(x.invoice, unhex(pre)) }) as Uint8Array;
    // Field 9 is the commitment's, where it names a purchase (rule 18: the payment decides).
    const r = moneyPayload({ type: 'receipt', rail: f.rail, proof, payer: x.payer, payee: this.me.id, amount: f.amount, fulfils: f.fulfils, ...(f.purchase ? { purchase: f.purchase } : {}) }) as { type: number; payload: Uint8Array };
    const made = this.me.sign(MIRS.money, r.type, r.payload, { public: false, to: [x.payer] });
    this.save();
    await this.sealTo(made, [x.payer], this.me.f.homes.map((y) => y.hint));
    x.receipt = made.id;
  }

  /**
   * The split (rule 20; the split cMIP, draft 4, `divide`): every partner
   * its share off the top, the referral role off the top where the payer's
   * claim names a repost (else to the owners' line, plan key 3 absent), then
   * the owners' line, what is left: a lone seller's drafter, whole; or the
   * ownership agreement's holders by their shares, rule 9, ties by turns.
   * Published with the service's own key, delivered to every receiver.
   */
  private async split(x: Incoming) {
    const p = await this.publication(x.publication);
    if (!p) throw new Error('its publication was not found');
    const amount = readCommitmentFields(Uint8Array.from(Buffer.from(x.commitment, 'base64'))).amount.value;
    const payouts: Payout[] = [];
    let parts = 0;
    p.partners.forEach((q, i) => {
      parts += q.share;
      const n = off(amount, q.share);
      if (n > 0) payouts.push(blank({ receiver: q.identity, amount: n, partner: i }));
    });
    for (const r of p.plan.roles) {
      // One filler: the repost the payer's own claim names (rule 22); none, the part stays with the owners' line.
      if (r.role !== 'referral' || !x.referral || !x.claim) continue;
      parts += r.part;
      const n = off(amount, r.part);
      if (n > 0) payouts.push(blank({ receiver: x.referral.identity, amount: n, role: r.role, evidence: x.claim }));
    }
    if (parts > 1_000_000) throw new Error('what comes off the top takes more than the whole payment');
    const line = amount - payouts.reduce((a, y) => a + y.amount, 0);
    let tally: [number, [string, number][]][] | undefined;
    if (!p.owners) {
      if (line > 0) payouts.push(blank({ receiver: p.drafter, amount: line }));
    } else {
      const version = await this.ownersNow(p);
      const t = (await termsAt(version, this.places)) as { stakes?: { holders?: [string | null, number][] }[] | [string | null, [string | null, number][]][] } | null;
      const holders = stakeHolders(t?.stakes, p.collective);
      if (!holders.length) throw new Error('the ownership agreement’s stake has no holder with a share');
      const before = this.s.tally[p.owners] ?? [];
      const turns = holders.map(([who]) => before.find(([y]) => y === who)?.[1] ?? 0);
      const xs = Array.from(agreementsDivideStake({ total: line, holders, turns }) as Float64Array, Number);
      holders.forEach(([who], i) => xs[i] > 0 && payouts.push(blank({ receiver: who, amount: xs[i], owners: p.owners! })));
      this.s.tally[p.owners] = holders.map(([who, n], i) => [who, (before.find(([y]) => y === who)?.[1] ?? 0) + (xs[i] - off(line, n))]);
      tally = [[0, this.s.tally[p.owners]]];
    }
    const number = (this.s.number[p.first] ?? 0) + 1;
    this.s.number[p.first] = number;
    const previous = this.s.latest[p.first];
    const ps: PayoutIn[] = payouts.map((y) => ({ receiver: y.receiver, amount: y.amount, ...(y.owners ? { owners: y.owners } : {}), ...(y.partner !== undefined ? { partner: y.partner } : {}), ...(y.role ? { role: y.role, evidence: y.evidence } : {}) }));
    const payload = splitPayload({ receipt: x.receipt!, payouts: ps, cmip: p.plan.cmip, publication: p.first, tally, number });
    const receivers = list(payouts.map((y) => y.receiver));
    const made = this.me.sign(REPO_SPECS.agreements, AGREEMENTS_TYPES.split, payload, { public: false, to: receivers, refs: previous ? [previous] : undefined });
    this.save();
    await this.sealTo(made, receivers, this.me.f.homes.map((y) => y.hint));
    this.s.latest[p.first] = made.id;
    x.split = made.id;
    x.payouts = payouts;
  }

  /** A sale of a bake or a vow the publication sells: told to its side (the money messages cMIP, draft 4, 7.2.3), so the seller's app delivers the key. A tip sells nothing. */
  private async tell(x: Incoming, said: string[]) {
    x.told = true;
    if (!x.tag || !x.receipt) return;
    const p = await this.publication(x.publication);
    const sold = p?.sold.find(([k]) => k === 0 || k === 3)?.[1];
    if (!p || !sold) return;
    const side = list([p.drafter, ...x.payouts.filter((y) => y.owners).map((y) => y.receiver)]).filter((y) => y !== p.collective);
    for (const m of side) {
      try {
        await this.send(TYPES.sale, salePayload({ offer: x.tag, buyer: x.payer, receipt: x.receipt, publication: sold }), m, [[p.first, p.drafter]]);
      } catch (e) {
        said.push(`The sale could not be told to ${short(m)}: ${message(e)}`);
      }
    }
    said.push(`The sale told to ${side.length} of the publication’s side.`);
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
      // It fulfils the split, so the receiver's receipt, which names what the payment fulfils, names the split (rule 23).
      const cm = { rail: c.module, payee: p.receiver, amount: { unit, value: p.amount }, fulfils: x.split!, payer: this.me.id, paidTo, salt: new Uint8Array(randomBytes(16)) };
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

  /**
   * A receiver's receipt of a payout, sealed to the service (rule 23; round
   * 9, F411, "each hop has its receipt"): kept where it is signed by the
   * payout's receiver, its payer this service, naming the split it pays.
   */
  private onReceipt(id: string, signer: string, payload: Uint8Array): string {
    const r = (moneyRead(2, payload) as { act: { payer?: string | null; payee: string; amount: { value: number }; fulfils: string } }).act;
    for (const x of this.s.incoming) {
      if (!x.split || r.fulfils !== x.split) continue;
      const p = x.payouts.find((y) => y.receiver === signer && y.amount === Number(r.amount.value) && y.claim && !y.receipt);
      if (!p) continue;
      if (r.payee !== signer || (r.payer && r.payer !== this.me.id)) return `A receipt from ${short(signer)} for the split ${short(x.split)} is not kept: it names another payee or payer.`;
      p.receipt = id;
      return `Receipted by ${short(signer)}: the payout of ${p.amount} of the split ${short(x.split)}, its receipt signed with their own key, naming the split.`;
    }
    return `A receipt from ${short(signer)} names no payout of this service.`;
  }

  /** Every payment received and each of its hops: the service's own receipt of the buyer's payment, then each payout's receipt by its receiver. */
  hops(): Hops[] {
    return this.s.incoming
      .filter((x) => x.paid)
      .map((x) => ({
        payer: x.payer,
        publication: x.publication,
        split: x.split,
        hops: [{ by: this.me.id, receipt: x.receipt, amount: Number(readCommitmentFields(Uint8Array.from(Buffer.from(x.commitment, 'base64'))).amount.value) }, ...x.payouts.filter((p) => p.amount > 0).map((p) => ({ by: p.receiver, receipt: p.receipt ?? null, amount: p.amount }))],
      }));
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

export interface Hop {
  /** Who signed the receipt of this hop, and its act; null where none is held yet. */
  by: string;
  receipt: string | null;
  amount: number;
}

/** Every hop of a payment the service received: its own receipt of the buyer's payment, then each payout's, signed by its receiver. */
export interface Hops {
  payer: string;
  publication: string;
  split: string | null;
  hops: Hop[];
}

function blank(p: { receiver: string; amount: number; owners?: string; partner?: number; role?: string; evidence?: string }): Payout {
  return { ...p, key: null, commitment: null, address: null, module: null, invoiceRequest: null, invoice: null, preimage: null, claim: null, why: null };
}

/**
 * The holders of an ownership agreement's one stake (terms field 7), each
 * by identity: a holder written null is the collective it founds (rule 23,
 * paid at the collective's identity).
 */
function stakeHolders(stakes: unknown, collective: string | null): [string, number][] {
  const first = Array.isArray(stakes) ? (stakes[0] as unknown) : null;
  const raw = (first && typeof first === 'object' && !Array.isArray(first) ? (first as { holders?: unknown }).holders : Array.isArray(first) ? (first as unknown[])[1] : null) as [string | null, number][] | null;
  return (raw ?? []).flatMap(([who, n]) => (who ? [[who, Number(n)]] : collective ? [[collective, Number(n)]] : [])) as [string, number][];
}
