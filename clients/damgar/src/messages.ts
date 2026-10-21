// The money messages cMIP, draft 1 (`cmips/cmip-money-messages-draft-1.md`):
// the four messages between apps and people, made and read. Shared by
// Damgar, Dub and Edubba, which import this file: Dub and Edubba make
// drafts (type 1), and nothing else.
//
// Every message is a private act of this cMIP, signed with the signing key,
// addressed to its one recipient, sealed to its current encryption key. A
// draft goes to one's own homes; the others to the recipient's inbox.

import { cborDecode, cborEncode, hex, readCommitment, unhex, xwingPublic } from '../../genesis/src/core.ts';
import { sealFor, type TestIdentity } from '../../genesis/src/identity.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { leaveAtHomes } from '../../genesis/src/private.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { MESSAGES_SPEC } from './specs.ts';
import type { Amount } from './units.ts';

export const TYPES = { draft: 1, request: 2, invoiceRequest: 3, answer: 4, laneRequest: 5, sale: 6 } as const;

/** A draft's "what" (2.1). */
export const WHAT = { pay: 0, ask: 1, anchor: 2, confirm: 3 } as const;

const amountValue = (a: Amount) => [unhex(a.unit), a.value];
const amountOf = (v: unknown): Amount => {
  if (!Array.isArray(v) || v.length !== 2 || !(v[0] instanceof Uint8Array) || v[0].length !== 32 || typeof v[1] !== 'number' || v[1] < 0) throw new Error('not an amount');
  return { unit: hex(v[0]), value: v[1] };
};
const h32 = (v: unknown, what: string): string => {
  if (!(v instanceof Uint8Array) || v.length !== 32) throw new Error(`${what}: not a hash`);
  return hex(v);
};
const text = (v: unknown, what: string): string => {
  if (typeof v !== 'string' || v.length > 280 || /[\u0000-\u0009\u000b-\u001f]/.test(v)) throw new Error(`${what}: not a short text`);
  return v;
};
const closed = (m: Map<number, unknown>, keys: number[], what: string) => {
  for (const k of m.keys()) if (!keys.includes(k)) throw new Error(`${what}: an unknown key ${k}`);
};
const asMap = (payload: Uint8Array, what: string): Map<number, unknown> => {
  const m = cborDecode(payload);
  if (!(m instanceof Map)) throw new Error(`${what}: not a map`);
  return m as Map<number, unknown>;
};

// ------------------------------------------------------------ type 1: a draft

export interface Draft {
  what: 'pay' | 'ask' | 'anchor' | 'confirm';
  /** The payee (pay, anchor), or the payer asked (ask). */
  other: string;
  amount: Amount;
  whatFor: string | null;
  /** The app that prepared it, as it names itself. */
  app: string;
  anchor: { offer: string; tier: number; leaf: string } | null;
  /** Confirm a purchase (draft 4, F357): the identity's own public claim of the payment, and the acts to acknowledge (a vow). */
  confirm?: { claim: string; acks: string[] } | null;
}

export function draftPayload(d: Draft): Uint8Array {
  const m = new Map<number, unknown>([
    [0, WHAT[d.what]],
    [1, unhex(d.other)],
    [2, amountValue(d.amount)],
  ]);
  if (d.whatFor) m.set(3, text(d.whatFor, 'what for'));
  m.set(4, text(d.app, 'the app'));
  if (d.what === 'anchor') {
    if (!d.anchor) throw new Error('A draft paying for an anchor names the offer, the tier and the leaf.');
    m.set(5, [unhex(d.anchor.offer), d.anchor.tier, unhex(d.anchor.leaf)]);
  }
  if (d.what === 'confirm') {
    if (!d.confirm?.acks.length) throw new Error('A draft confirming a purchase names the claim and what it acknowledges.');
    m.set(6, [unhex(d.confirm.claim), d.confirm.acks.map(unhex)]);
  }
  return cborEncode(m);
}

export function readDraft(payload: Uint8Array): Draft {
  const m = asMap(payload, 'a draft');
  closed(m, [0, 1, 2, 3, 4, 5, 6], 'a draft');
  const w = m.get(0);
  const what = w === 0 ? 'pay' : w === 1 ? 'ask' : w === 2 ? 'anchor' : w === 3 ? 'confirm' : null;
  if (!what) throw new Error('a draft: an unknown what');
  let anchor: Draft['anchor'] = null;
  if (what === 'anchor') {
    const a = m.get(5);
    if (!Array.isArray(a) || a.length !== 3 || typeof a[1] !== 'number') throw new Error('a draft for an anchor: its anchor');
    anchor = { offer: h32(a[0], 'the offer'), tier: a[1], leaf: h32(a[2], 'the leaf') };
  } else if (m.has(5)) throw new Error('a draft: an anchor on a draft that pays for none');
  let confirm: Draft['confirm'] = null;
  if (m.get(0) === 3) {
    const c = m.get(6);
    if (!Array.isArray(c) || c.length !== 2 || !Array.isArray(c[1]) || !c[1].length) throw new Error('a draft confirming a purchase: its claim and what it acknowledges');
    confirm = { claim: h32(c[0], 'the claim'), acks: (c[1] as unknown[]).map((x) => h32(x, 'an act acknowledged')) };
  } else if (m.has(6)) throw new Error('a draft: a confirmation on a draft that confirms nothing');
  return {
    what,
    other: h32(m.get(1), 'the other party'),
    amount: amountOf(m.get(2)),
    whatFor: m.has(3) ? text(m.get(3), 'what for') : null,
    app: text(m.get(4), 'the app'),
    anchor,
    confirm,
  };
}

/**
 * Sign a draft and leave it, sealed to the identity itself, at its homes
 * (2.1; 1.1, as the people cMIP's sealed follow list): what Dub and Edubba
 * do instead of paying. `refs` name what it is about. Signs only the
 * message: no Money act.
 */
export async function sendDraft(me: TestIdentity, d: Draft, opts: { refs?: [string, string][]; via?: Via; save: () => Promise<void> }): Promise<{ id: string; left: string[] }> {
  return sendToSelf(me, TYPES.draft, draftPayload(d), opts);
}

/** A message of this cMIP, of any type and payload, signed and left sealed to the identity itself at its homes (`sendDraft`'s way). */
export async function sendToSelf(me: TestIdentity, type: number, payload: Uint8Array, opts: { refs?: [string, string][]; via?: Via; save: () => Promise<void> }): Promise<{ id: string; left: string[] }> {
  const homes = me.f.homes.map((h) => h.hint);
  const look = await lookUp(me.id, homes, opts.via ?? {});
  if (!look.encryptionKey) throw new Error('This identity publishes no encryption key, so nothing can be sealed to it: the draft cannot travel to Damgar. Nothing was signed.');
  // A draft sealed to a key the money app cannot open would never arrive: refused before anything is signed.
  if (!me.f.encryption.some((e) => hex(xwingPublic(unhex(e.secret))) === hex(look.encryptionKey!))) {
    throw new Error('The encryption key this identity publishes is not one this app holds: Damgar, holding the same words, could not open the draft either. Nothing was signed.');
  }
  let made: { act: Uint8Array; id: string; key: Uint8Array };
  try {
    made = me.sign(MESSAGES_SPEC, type, payload, { public: false, to: [me.id], refs: opts.refs });
  } finally {
    await opts.save();
  }
  const sealed = sealFor(made.act, made.key, [{ id: me.id, key: look.encryptionKey }]);
  const left: string[] = [];
  for (const h of homes) {
    try {
      await relayAt(h, opts.via ?? {}).putSealed(sealed);
      left.push(h);
    } catch {
      // that home is away: the others hold it
    }
  }
  // Its locked act beside it (H80's question 2): the latest act of this app's line, which Kišib must find at the homes.
  await leaveAtHomes(me, made, { via: opts.via ?? {}, sealed: left.length > 0 });
  await opts.save();
  if (!left.length) throw new Error(`No home took the draft (${homes.join(', ')}). It was signed but went nowhere: prepare it again later.`);
  return { id: made.id, left };
}

// ------------------------------------------------------------ type 2: a request to be paid

export interface Request {
  amount: Amount;
  whatFor: string | null;
  /** The payee pointer in force for the payee when it asked. */
  pointer: string;
}

export function requestPayload(r: Request): Uint8Array {
  const m = new Map<number, unknown>([[0, amountValue(r.amount)]]);
  if (r.whatFor) m.set(1, text(r.whatFor, 'what for'));
  m.set(2, unhex(r.pointer));
  return cborEncode(m);
}

export function readRequest(payload: Uint8Array): Request {
  const m = asMap(payload, 'a request');
  closed(m, [0, 1, 2], 'a request');
  return { amount: amountOf(m.get(0)), whatFor: m.has(1) ? text(m.get(1), 'what for') : null, pointer: h32(m.get(2), 'the pointer') };
}

// ------------------------------------------------------------ type 3: an invoice request

export interface InvoiceRequest {
  /** The commitment, as deterministic CBOR (the payment cMIP). */
  commitment: Uint8Array;
  whatFor: string | null;
  /** The request to be paid it answers. */
  answers: string | null;
  ticket: { leaf: string; tier: number } | null;
}

export function invoiceRequestPayload(r: InvoiceRequest): Uint8Array {
  const m = new Map<number, unknown>([[0, cborDecode(r.commitment)]]);
  if (r.whatFor) m.set(1, text(r.whatFor, 'what for'));
  if (r.answers) m.set(2, unhex(r.answers));
  if (r.ticket) m.set(3, [unhex(r.ticket.leaf), r.ticket.tier]);
  const out = cborEncode(m);
  // The commitment travels as the very bytes it was computed from.
  if (hex(cborEncode(cborDecode(r.commitment))) !== hex(r.commitment)) throw new Error('the commitment does not survive encoding');
  return out;
}

export function readInvoiceRequest(payload: Uint8Array): InvoiceRequest & { fields: ReturnType<typeof readCommitmentFields> } {
  const m = asMap(payload, 'an invoice request');
  closed(m, [0, 1, 2, 3], 'an invoice request');
  const commitment = cborEncode(m.get(0));
  const t = m.get(3);
  if (t !== undefined && (!Array.isArray(t) || t.length !== 2 || typeof t[1] !== 'number')) throw new Error('an invoice request: its ticket');
  return {
    commitment,
    fields: readCommitmentFields(commitment),
    whatFor: m.has(1) ? text(m.get(1), 'what for') : null,
    answers: m.has(2) ? h32(m.get(2), 'the request answered') : null,
    ticket: t ? { leaf: h32((t as unknown[])[0], 'the leaf'), tier: (t as number[])[1] } : null,
  };
}

export interface CommitmentFields {
  rail: string;
  payee: string;
  amount: Amount;
  fulfils: string;
  payer: string | null;
  paidTo: { kind: 'flow'; pointer: string; rail: number } | { kind: 'vault'; declaredBy: string; entry: number } | { kind: 'refund'; claim: string };
  salt: Uint8Array;
  hash: string;
  /** A purchase (F126): the claim it pays under, `[agreement, line]`; null where it is none. */
  purchase?: [string, string] | null;
}

export const readCommitmentFields = (bytes: Uint8Array): CommitmentFields => readCommitment(bytes) as CommitmentFields;

// ------------------------------------------------------------ type 4: an answer

export type Bound = { kind: 'invoice'; invoice: string } | { kind: 'request'; request: Uint8Array; confirmations: number | null } | { kind: 'refused'; why: string };

export interface Answer {
  /** The invoice request it answers. */
  to: string;
  commitment: string;
  bound: Bound;
  /** The ticket an anchoring service signed for it. */
  ticket: string | null;
  /** The amount it binds, the commitment's (draft 3, F352): so a lane's cap is judged on the answer itself (the grant limits cMIP, 2.1). Absent in drafts 1 and 2. */
  amount?: Amount | null;
}

export function answerPayload(a: Answer): Uint8Array {
  const b = a.bound;
  const bound = b.kind === 'invoice' ? [0, b.invoice] : b.kind === 'request' ? (b.confirmations ? [1, b.request, b.confirmations] : [1, b.request]) : [2, text(b.why, 'why')];
  const m = new Map<number, unknown>([
    [0, unhex(a.to)],
    [1, unhex(a.commitment)],
    [2, bound],
  ]);
  if (a.ticket) m.set(3, unhex(a.ticket));
  if (a.amount) m.set(4, amountValue(a.amount));
  return cborEncode(m);
}

export function readAnswer(payload: Uint8Array): Answer {
  const m = asMap(payload, 'an answer');
  closed(m, [0, 1, 2, 3, 4], 'an answer');
  const b = m.get(2);
  if (!Array.isArray(b)) throw new Error('an answer: its bound');
  let bound: Bound;
  if (b[0] === 0 && b.length === 2 && typeof b[1] === 'string') bound = { kind: 'invoice', invoice: b[1] };
  else if (b[0] === 1 && (b.length === 2 || b.length === 3) && b[1] instanceof Uint8Array && b[1].length === 64) bound = { kind: 'request', request: b[1], confirmations: b.length === 3 ? Number(b[2]) : null };
  else if (b[0] === 2 && b.length === 2) bound = { kind: 'refused', why: text(b[1], 'why') };
  else throw new Error('an answer: its bound');
  const amount = m.has(4) ? amountOf(m.get(4)) : null;
  return { to: h32(m.get(0), 'the request answered'), commitment: h32(m.get(1), 'the commitment'), bound, ticket: m.has(3) ? h32(m.get(3), 'the ticket') : null, amount };
}

// ------------------------------------------------------------ type 5: a lane asked (draft 2)

/** What a lane may sign (a grant's field 6): one type of one specification. */
export interface LaneKind {
  spec: string;
  type: number;
}

/**
 * A lane asked by an app (draft 2, 7.1): sealed to the identity itself at
 * its homes, as a draft is, signed with the identity's own key by the app
 * asking. It carries the grant key the app made (its public part), the
 * lane's words ("Dub on the Mac"), what it may sign, and the limits the app
 * asks for, in the grant limits cMIP's own format. Damgar reads it in plain
 * words and grants it, or declines; granting signs a public grant of the
 * identity to itself, naming that key (Agreements draft 15, rule 73, F351).
 */
export interface LaneRequest {
  /** The grant key's public part, hex (scheme 1). */
  key: string;
  label: string;
  kinds: LaneKind[];
  /** The limits asked, as the grant limits cMIP encodes them (any CBOR value), or none. */
  limits: unknown | null;
  /** The app that asked, as it names itself. */
  app: string;
}

export function laneRequestPayload(r: LaneRequest): Uint8Array {
  if (!r.kinds.length) throw new Error('A lane names what it may sign.');
  const m = new Map<number, unknown>([
    [0, [1, unhex(r.key)]],
    [1, text(r.label, 'the lane’s words')],
    [2, r.kinds.map((k) => [unhex(k.spec), k.type])],
  ]);
  if (r.limits !== null && r.limits !== undefined) m.set(3, r.limits);
  m.set(4, text(r.app, 'the app'));
  return cborEncode(m);
}

export function readLaneRequest(payload: Uint8Array): LaneRequest {
  const m = asMap(payload, 'a lane request');
  closed(m, [0, 1, 2, 3, 4], 'a lane request');
  const k = m.get(0);
  if (!Array.isArray(k) || k.length !== 2 || k[0] !== 1 || !(k[1] instanceof Uint8Array) || k[1].length !== 32) throw new Error('a lane request: its key is not a signing key of scheme 1');
  const kinds = m.get(2);
  if (!Array.isArray(kinds) || !kinds.length) throw new Error('a lane request: what it may sign');
  return {
    key: hex(k[1]),
    label: text(m.get(1), 'the lane’s words'),
    kinds: kinds.map((x) => {
      if (!Array.isArray(x) || x.length !== 2 || typeof x[1] !== 'number') throw new Error('a lane request: a kind');
      return { spec: h32(x[0], 'a kind’s specification'), type: x[1] };
    }),
    limits: m.has(3) ? m.get(3) : null,
    app: text(m.get(4), 'the app'),
  };
}

// ------------------------------------------------------------ type 6: a sale, told to oneself (draft 2)

/**
 * A sale (draft 2, 7.2): the seller's Damgar, having signed the receipt of a
 * payment following one of the seller's offers, tells the seller's own apps,
 * sealed to the identity itself at its homes: which offer, who bought, the
 * receipt, and the publication sold, so the seller's Dub delivers the key
 * (Envelopes type 1). Damgar signs no Envelopes act.
 */
export interface Sale {
  offer: string;
  buyer: string;
  receipt: string;
  publication: string;
}

export function salePayload(x: Sale): Uint8Array {
  return cborEncode(
    new Map<number, unknown>([
      [0, unhex(x.offer)],
      [1, unhex(x.buyer)],
      [2, unhex(x.receipt)],
      [3, unhex(x.publication)],
    ]),
  );
}

export function readSale(payload: Uint8Array): Sale {
  const m = asMap(payload, 'a sale');
  closed(m, [0, 1, 2, 3], 'a sale');
  return { offer: h32(m.get(0), 'the offer'), buyer: h32(m.get(1), 'the buyer'), receipt: h32(m.get(2), 'the receipt'), publication: h32(m.get(3), 'the publication') };
}
