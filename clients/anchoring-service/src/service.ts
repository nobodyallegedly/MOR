// A pooled anchoring service, FOR TESTS ONLY, on regtest (F338: "the
// anchoring service is a third party (for the demo, a test service of ours,
// labelled)"; "talking only through MOR acts"). It follows the anchoring
// cMIP (draft 5, with this build's draft 6 reading: the publication names
// the key its output is tweaked from), and the money messages cMIP:
//
// - its identity, with an inbox and an encryption key; its payee pointer
//   naming its own Lightning node; its **standing offer** (an Agreements
//   standing offer, a lone seller's, F225): tiers of 2, 6 and 144 blocks;
// - an **invoice request** asking for an anchor (the money messages cMIP,
//   type 3, with the leaf and the tier) is checked, then answered with an
//   invoice its own node issued for the commitment, and a **ticket** (the
//   anchoring cMIP, type 2): the batch the leaf goes into, and the deadline;
// - once its node shows the invoice settled, it signs the payer's
//   **receipt** (Money type 2) and delivers it, sealed;
// - when every ticket of the open batch is paid (or its deadline nears), it
//   anchors the batch: a payment from its node's own wallet to its key
//   tweaked by the batch's root (pay-to-contract, no OP_RETURN), then its
//   **publication** (type 3): the leaves, the transaction, the output, and
//   the key.
//
// It never learns an act: only leaves. Regtest coins only; nothing here is
// for real money.

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  MIRS,
  anchoringBatch,
  anchoringOffer,
  anchoringPublication,
  anchoringTicket,
  base64,
  hex,
  lightningAddress,
  lightningProof,
  moneyPayload,
  onchainAddress,
  onchainKey,
  onchainPayTo,
  openSealed,
  paymentProof,
  randomBytes,
  unhex,
} from '../../genesis/src/core.ts';
import { TestIdentity, sealFor, type Home } from '../../genesis/src/identity.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { encryptionSecret } from '../../../modules/carry/src/carry.ts';
import { TYPES, answerPayload, readCommitmentFields, readInvoiceRequest } from '../../damgar/src/messages.ts';
import { MESSAGES_SPEC, SPEC } from '../../damgar/src/specs.ts';
import { findOutput } from '../../damgar/src/damgar.ts';
import type { ChainSource } from '../../damgar/src/chain.ts';
import type { Lnd } from './lnd.ts';

export const LABEL = 'A TEST anchoring service of MOR’s builders, on regtest only: its coins are worth nothing. Never for real money.';

/** Its tiers: within 2, 6 and 144 blocks, at 50, 20 and 5 regtest satoshis a hash (the cMIP's tests' numbers). */
export const TIERS = [
  { price: 50, blocks: 2 },
  { price: 20, blocks: 6 },
  { price: 5, blocks: 144 },
];

/** What each batch's output carries: a dust amount, the service's to bear (the anchoring cMIP, item 13a). */
const OUTPUT_SAT = 1000;

interface Ticketed {
  ticket: string;
  leaf: string;
  tier: number;
  batch: number;
  deadline: number;
  payer: string;
  commitment: string;
  invoice: string;
  hash: string;
  paid: boolean;
  receipt: string | null;
}

interface State {
  identity: string;
  pointer: string;
  offer: string;
  /** The x-only secret its batches' outputs are tweaked from, hex. */
  key: string;
  after: Record<string, number>;
  seen: string[];
  tickets: Ticketed[];
  batch: number;
  published: { batch: number; act: string; tx: string; output: number; leaves: string[] }[];
}

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

export class Service {
  private me!: TestIdentity;
  private s!: State;

  constructor(
    readonly dir: string,
    readonly lnd: Lnd,
    readonly chain: ChainSource,
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
  get offer() {
    return this.s.offer;
  }
  get state(): Readonly<State> {
    return this.s;
  }

  /** Start: its identity, pointer and offer made and published on first start; read back after. */
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
    const node = await this.lnd.nodeKey();
    const pointer = moneyPayload({ type: 'pointer', payee: this.me.id, version: 1, rails: [{ module: SPEC.lightning.hash, address: lightningAddress({ network: 3, node }) }] }) as { type: number; payload: Uint8Array };
    const p = this.me.sign(MIRS.money, pointer.type, pointer.payload, { public: true });
    const offer = anchoringOffer(3, TIERS, `${LABEL} Anchoring on Bitcoin regtest: tiers of 2, 6 and 144 blocks at 50, 20 and 5 regtest satoshis a hash. A hash left out of its batch, or not anchored by its deadline, is refunded.`) as { type: number; payload: Uint8Array };
    const o = this.me.sign(MIRS.agreements, offer.type, offer.payload, { public: true });
    let key: Uint8Array;
    for (;;) {
      key = new Uint8Array(randomBytes(32));
      try {
        onchainKey(key);
        break;
      } catch {
        // out of range
      }
    }
    this.s = { identity: this.me.id, pointer: p.id, offer: o.id, key: hex(key), after: {}, seen: [], tickets: [], batch: 1, published: [] };
    this.save();
    await this.publish(p.act);
    await this.publish(o.act);
  }

  /** A public act, at its relays and homes. */
  private async publish(act: Uint8Array) {
    for (const h of [...this.opts.relays, ...this.me.f.homes.map((x) => x.hint)]) await relayAt(h).putAct(act).catch(() => undefined);
  }

  /** A private act to one identity: sealed to its encryption key, left at its inbox; the locked act at the service's homes (Identity rule 35). */
  private async deliver(spec: string, type: number, payload: Uint8Array, to: string): Promise<string> {
    const l = await lookUp(to, [...this.opts.relays, ...this.opts.homes]);
    if (!l.encryptionKey) throw new Error(`${to.slice(0, 8)}… publishes no encryption key`);
    const made = this.me.sign(spec, type, payload, { public: false, to: [to] });
    this.save();
    const sealed = sealFor(made.act, made.key, [{ id: to, key: l.encryptionKey }]);
    for (const h of l.inbox(spec) ?? []) await relayAt(h).putSealed(sealed).catch(() => undefined);
    for (const h of this.me.f.homes.map((x) => x.hint)) await relayAt(h).putAct(made.act).catch(() => undefined);
    return made.id;
  }

  /** One round: read the inbox, answer invoice requests, look for payments, anchor a batch that is ready. What it did, in plain words. */
  async tick(): Promise<string[]> {
    const said: string[] = [];
    await this.read(said);
    await this.payments(said);
    await this.anchor(said);
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
            try {
              const o = openSealed(it.item, this.me.id, sec) as { act: Uint8Array; key?: Uint8Array; described: { id: string; signer?: string; spec?: string; type?: number; payload?: Uint8Array } };
              const d = o.described;
              if (this.s.seen.includes(d.id)) break;
              this.s.seen.push(d.id);
              if (d.spec === MESSAGES_SPEC && d.type === TYPES.invoiceRequest && d.signer && d.payload) {
                try {
                  said.push(await this.answer(d.id, d.signer, d.payload, o.act, o.key));
                } catch (e) {
                  said.push(`An invoice request from ${d.signer.slice(0, 8)}… not answered: ${message(e)}`);
                }
              }
              break;
            } catch {
              // the next key
            }
          }
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
      this.s.after[hint] = after ?? 0;
    }
  }

  /** The anchoring cMIP, item 10, through the money messages cMIP: checked, an invoice from its own node, a ticket, the answer. */
  private async answer(id: string, signer: string, payload: Uint8Array, act: Uint8Array, key?: Uint8Array): Promise<string> {
    // The act itself is judged through its signer's chain before anything is answered.
    const l = await lookUp(signer, [...this.opts.relays, ...this.opts.homes]);
    if (key) l.verifier.addWithKey(act, key);
    else l.verifier.add(act);
    if (l.verifier.status(id) !== 'valid') throw new Error('the act does not count');
    const ir = readInvoiceRequest(payload);
    const f = ir.fields;
    const refuse = async (why: string) => {
      await this.deliver(MESSAGES_SPEC, TYPES.answer, answerPayload({ to: id, commitment: f.hash, bound: { kind: 'refused', why }, ticket: null }), signer);
      return `Refused ${signer.slice(0, 8)}…: ${why}.`;
    };
    if (!ir.ticket) return refuse('this service sells anchors only: no leaf was asked');
    if (f.payer !== signer || f.payee !== this.me.id) return refuse('the commitment names another payer or payee');
    if (f.fulfils !== this.s.offer) return refuse('the payment does not follow this service’s standing offer');
    const tier = TIERS[ir.ticket.tier];
    if (!tier || f.amount.unit !== SPEC.units.regtest || f.amount.value !== tier.price) return refuse('not the tier’s price, in regtest satoshis');
    if (f.rail !== SPEC.lightning.hash || f.paidTo.kind !== 'flow' || f.paidTo.pointer !== this.s.pointer || f.paidTo.rail !== 0) return refuse('not paid to this service’s pointer on Lightning');
    const inv = await this.lnd.addInvoice(f.amount.value, f.hash);
    const tip = (await this.chain.headers()).headers.length - 1;
    const tk = anchoringTicket({ offer: this.s.offer, leaf: ir.ticket.leaf, commitment: f.hash, tier: ir.ticket.tier, batch: this.s.batch, deadline: tip + tier.blocks }) as Uint8Array;
    const t = this.me.sign(SPEC.anchoring, 2, tk, { public: true, objects: [[this.s.offer, this.s.offer]] });
    this.save();
    await this.publish(t.act);
    this.s.tickets.push({ ticket: t.id, leaf: ir.ticket.leaf, tier: ir.ticket.tier, batch: this.s.batch, deadline: tip + tier.blocks, payer: signer, commitment: base64(ir.commitment), invoice: inv.invoice, hash: inv.hash, paid: false, receipt: null });
    await this.deliver(MESSAGES_SPEC, TYPES.answer, answerPayload({ to: id, commitment: f.hash, bound: { kind: 'invoice', invoice: inv.invoice }, ticket: t.id }), signer);
    return `Ticket for ${signer.slice(0, 8)}…: batch ${this.s.batch}, by block ${tip + tier.blocks}; an invoice of its node sent.`;
  }

  /** Invoices settled: each payer's receipt signed and delivered (Money rule 7: the payee signs it). */
  private async payments(said: string[]) {
    for (const t of this.s.tickets.filter((x) => !x.paid)) {
      const pre = await this.lnd.settled(t.hash);
      if (!pre) continue;
      t.paid = true;
      const f = readCommitmentFields(Uint8Array.from(Buffer.from(t.commitment, 'base64')));
      const proof = paymentProof({ paidTo: f.paidTo, salt: f.salt, rail: lightningProof(t.invoice, unhex(pre)) }) as Uint8Array;
      const r = moneyPayload({ type: 'receipt', rail: f.rail, proof, payer: t.payer, payee: this.me.id, amount: f.amount, fulfils: f.fulfils }) as { type: number; payload: Uint8Array };
      t.receipt = await this.deliver(MIRS.money, r.type, r.payload, t.payer);
      said.push(`Paid by ${t.payer.slice(0, 8)}…: its receipt signed and sent.`);
    }
  }

  /** The open batch, anchored once every ticket naming it is paid (or its earliest deadline is a block away), then published. */
  private async anchor(said: string[]) {
    const open = this.s.tickets.filter((t) => t.batch === this.s.batch);
    if (!open.length) return;
    const tip = (await this.chain.headers()).headers.length - 1;
    const due = Math.min(...open.map((t) => t.deadline)) - 1 <= tip;
    if (!open.every((t) => t.paid) && !due) return;
    const leaves = open.filter((t) => t.paid).map((t) => t.leaf);
    if (!leaves.length) {
      this.s.batch++;
      return;
    }
    const b = anchoringBatch(leaves) as { root: string };
    const keyX = onchainKey(unhex(this.s.key)) as string;
    const addr = onchainAddress({ network: 3, key: keyX, request: keyX }) as Uint8Array;
    const to = onchainPayTo(addr, b.root) as { address: string; script: string };
    const txid = await this.lnd.sendCoins(to.address, OUTPUT_SAT);
    const t = await this.chain.tx(txid);
    const output = findOutput(t.raw, to.script);
    if (output === null) throw new Error('the batch’s transaction pays nothing to its address');
    // The core's byte order: the txid as the transaction's hash, unreversed.
    const internal = hex(Uint8Array.from(Buffer.from(txid, 'hex')).reverse());
    const pub = anchoringPublication({ offer: this.s.offer, batch: this.s.batch, leaves, tx: internal, output, key: keyX }) as Uint8Array;
    const p = this.me.sign(SPEC.anchoring, 3, pub, { public: true, objects: [[this.s.offer, this.s.offer]] });
    this.save();
    await this.publish(p.act);
    this.s.published.push({ batch: this.s.batch, act: p.id, tx: txid, output, leaves });
    said.push(`Batch ${this.s.batch} anchored: ${leaves.length} leaf${leaves.length === 1 ? '' : 'ves'}, transaction ${txid.slice(0, 12)}…, published.`);
    this.s.batch++;
  }
}
