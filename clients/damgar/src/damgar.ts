// What Damgar does (F338, 17 October 2026): a money app that holds no
// wallet. It gathers the money acts proposed to a person, offers them for
// signing, verifies payments from the rails' own evidence, and keeps the
// account. Money moves in whatever wallet the person uses; Damgar signs
// and checks what MOR says about it.
//
// - An identity is brought by its signing key's words, as Dub does (the
//   identity carry Module, draft 2). Damgar never makes one, and never holds
//   a chain key.
// - What the person accepts (the payment cMIP, the rail Modules, the units
//   Modules) is the accepted list (the accepted cMIP, F340), sealed to the
//   identity at its homes; Damgar changes its own part. A money act under
//   anything not accepted is shown unknown, and is not signed.
// - To sign: drafts prepared in Dub or Edubba, sealed to the identity
//   itself; requests to be paid others sent; invoice requests payers sent
//   (on Lightning the person pastes an invoice from their wallet; on-chain
//   Damgar answers by itself with the request key it holds); payments to
//   the person, whose receipt is theirs to sign. The messages are the money
//   messages cMIP's.
// - Pay: for a payment owed, the invoice or the address bound to it; the
//   person pays in their own wallet and pastes the proof back; Damgar checks
//   it by the rail Module's rule and signs the payment claim.
// - The account: what came in, went out, is owed or pending, each with its
//   claims and receipts and whether they verify.
//
// The same code runs in Damgar's program (a folder, `store.ts`) and its web
// client (the browser, `web/keep.ts`). A `Keep` says where.
//
// TEST IDENTITIES ONLY, and test networks only, until MOR is frozen.

import {
  MIRS,
  SPECS,
  Verifier,
  anchoringCheckTicket,
  anchoringReadTicket,
  base64,
  cborDecode,
  commitmentCbor,
  describeAct,
  hex,
  lightningInvoice,
  lightningProof,
  merkleBranch,
  moneyPayload,
  moneyRead,
  onchainAddress,
  onchainKey,
  onchainPayTo,
  onchainProof,
  onchainRequest,
  openSealed,
  openWithKey,
  paymentCommitment,
  paymentProof,
  railCheck,
  randomBytes,
  readLightningAddress,
  readOnchainAddress,
  readPaymentProof,
  signingPublic,
  txid as txidOf,
  xwingPublic,
  unhex,
  lightningAddress,
  readOnchainProof,
} from '../../genesis/src/core.ts';
import { ownLine } from '../../genesis/src/lines.ts';
import { REVOCATION, acceptance, authorityOf, grantInWords, makeGrantKey, personGrantPayload, revocationPayload, signUnderGrant, type Authority, type GrantRead, type Kind } from '../../grants/src/grant.ts';
import { GRANT_LIMITS_SPEC, encodeLimits, readLimits, refuseBeforeSigning, type Limits } from '../../grants/src/limits.ts';
import { actsUnder, reaches, revocationsOf, type HeldLane } from '../../grants/src/lanes.ts';
import { AGREEMENTS_TYPES } from '../../repo/src/specs.ts';
import type { InvoiceLink, LinkConfig } from './link.ts';
import { LINK_SAY } from './link-say.ts';
import { TestIdentity, TEST_LABEL, sealFor, type IdentityFile } from '../../genesis/src/identity.ts';
import { lookUp, type Lookup } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { Refused, fromWords, groupId, toWords } from '../../../modules/carry/src/carry.ts';
import { idForm, readId } from '../../genesis/src/forms.ts';
import { carriedKey, lookCurrent, servedChain } from '../../dub/src/carryin.ts';
import { changeAccepted, publishAccepted, readAccepted, type Accepted } from './accepted.ts';
import type { ChainSource } from './chain.ts';
import { TYPES, answerPayload, draftPayload, invoiceRequestPayload, readAnswer, readCommitmentFields, readDraft, readInvoiceRequest, readLaneRequest, readRequest, readSale, requestPayload, salePayload, sendToSelf, type Bound, type CommitmentFields, type Draft, type LaneKind, type LaneRequest } from './messages.ts';
import { ACCEPTABLE, MESSAGES_SPEC, MESSAGES_SPEC_1, MESSAGES_SPECS, MONEY, OURS, SPEC, isAccepted, labelOf } from './specs.ts';
import { say, totals, unitOf, type Amount } from './units.ts';
import type { Account, Accept, LaneShown, Line, PaymentShown, Rails, Shown, State, ToSign, Verdict, Who } from './shapes.ts';

export type { State } from './shapes.ts';

export const TEST_ONLY = 'Test identities and test networks only, until MOR is frozen. No real money.';

/** Said where the identity is brought in (the carry Module; Identity rule 35). */
export const LINE_SAY =
  'Damgar keeps its own line of acts for this identity (its money acts and messages). If the signing key is ever changed with the chain key, in Kišib, that change must keep this line, or every claim and receipt signed here becomes void. Kišib reads it from the homes and keeps it.';

/** Said when a rotation made elsewhere counts. Its first words are how the page knows it. */
export const SPENT_SAY =
  'This identity’s signing key was changed elsewhere, with its chain key, so the signing key’s words Damgar holds no longer count. Nothing was signed. To go on here, give Damgar the new signing key’s words.';

/** Said where an encryption key is not held (the carry Module, 2a.3). */
export const NO_KEY_SAY =
  'Damgar holds no encryption key for this identity, so nothing sealed to it opens here: no draft, no request, no payment. Its encryption key was not made from its signing key’s words.';

/** Said where the on-chain request key is made (decided by Nobody, allegedly, 17 October 2026). */
export const REQUEST_KEY_SAY = [
  'Damgar makes an on-chain request key and keeps it here, beside the signing key. It signs, for each payment, the request that binds a fresh address to that payment alone. It answers address requests by itself when they arrive through MOR.',
  'It moves no money: the money goes to your Bitcoin key, which stays in your wallet. But a thief holding it could commit your side to payments you did not intend, for example under terms you have left. The money would still reach your Bitcoin key (the on-chain rail Module, “The request key is online”).',
  'To replace it: “Make a new request key” here publishes a new payee pointer naming the new key. From then on the old key no longer counts for new payments, which follow the pointer in force; payments already bound to the old key stay as they are.',
];

/** Said before declaring a Lightning rail (the Lightning rail Module, "Costs, stated": a client MUST show them). */
export const LIGHTNING_COSTS = [
  'A public node exposes its owner: naming it in your payee pointer links this identity to it publicly, with its channels and the coins behind them; its network address may be seen; identities sharing a node are linked by it.',
  'A Lightning vault stops a thief holding your MOR signing key, not one who takes the node, which must stay online to issue invoices. Your vault’s node should be another node than your flow’s.',
  'A claim without its preimage stays pending forever (MOR has no clock); an invoice for a fraction of a satoshi cannot be a MOR payment; keysend and AMP payments prove nothing.',
];

/** Said before declaring an on-chain rail (the on-chain rail Module, "Costs, stated": a client MUST show them). */
export const ONCHAIN_COSTS = [
  'Slow, and not final until confirmed: a payment counts after six blocks (about an hour on Bitcoin). A rewrite of the chain deeper than that would leave a counted payment unpaid, which has happened twice on Bitcoin, from software faults.',
  'The amount is in the clear on the chain: a payment of exactly a published price names the work; with a relay’s timing, it names the payer. A payer is as anonymous as their coins.',
  'Checking proofs needs the chain’s headers, kept or trusted from a header service: Damgar on this computer trusts the regtest node it is given, and says so.',
  'An ordinary wallet cannot spend a pay-to-contract output unless it is given that payment’s commitment: Damgar keeps every commitment in your account. Spending is not shown in round 1.',
  'The request key is online in Damgar (above). Amounts below 330 satoshis cannot be paid on this rail.',
];

/** Said wherever an obligation is shown (Money draft 8, rule 15, Fable's M5; rule 17). */
export const DEBT_SAY =
  'Damgar keeps to the Money layer, and a Money-only app shows every state of an obligation as unknown (Money rule 15, M5): whether it is open, discharged or released needs an app that reads Agreements. A payment to the flow counts toward it only once the creditor acknowledges it with an act of their own holding a pointer (Money rule 17).';

/** Said under the account: what this Money-only app does not judge. */
export const ACCOUNT_NOTES = [
  'Each claim and receipt is checked by the rail Module it names, from the rail’s own evidence: on Lightning the invoice its node signed and the preimage; on-chain the transaction in its block, on the chain Damgar follows.',
  'Beside the rail’s answer, whether the payment went to a pointer in force for what it pays, and as the vault allows. For a debt, an agreement or an offer, that is Agreements’ to read: unknown here.',
  'Money rule 29 (a theft of the signing key: anchor or bear the loss) is not judged here: it needs Agreements’ reading of the payee’s acts.',
  'Amounts in different units are never added: one total per unit, side by side.',
];

// ------------------------------------------------------------ what is kept

export interface Settings {
  relays: string[];
  via: Via;
  /** Follow every step by hand (round 2, 2b): off by default; on, every signature waits for the person, as in round 1, and no lane held here signs. */
  manual?: boolean;
  /** The timestamp clock a lane's expiry is judged on (the grant limits cMIP, 3.1), by its identity. */
  clock?: string;
}

/** How an act was signed, as the account shows it (round 2, 2b). */
export type How = { by: 'hand' } | { by: 'itself' } | { by: 'lane'; grant: string };

/** A payment, from either side, keyed by its commitment's hash. */
export interface Payment {
  key: string;
  side: 'out' | 'in';
  other: string;
  amount: Amount;
  fulfils: string;
  whatFor: string | null;
  rail: string;
  /** The payee's rail address or vault source, as the payee signed it. */
  address: string;
  /** The commitment's CBOR, base64: its fields, salt and where it was paid. */
  commitment: string;
  /** The invoice request (type 3) and its answer (type 4). */
  invoiceRequest: string;
  answer: string | null;
  bound: { kind: 'invoice'; invoice: string } | { kind: 'request'; request: string; confirmations: number | null } | { kind: 'refused'; why: string } | null;
  /** Paid: the preimage (Lightning), or the transaction (on-chain). */
  preimage: string | null;
  onchain: { txid: string } | null;
  claims: string[];
  receipts: string[];
  /** The draft or request it came from. */
  draft: string | null;
  request: string | null;
  ticket: { act: string; batch: number; deadline: number; tier: number; checked?: boolean } | null;
  stage: 'asked' | 'to pay' | 'refused' | 'paid' | 'settled' | 'declined';
  at: number;
  /** How the payer's acts of this payment are signed (round 2): by hand, or under a lane. Absent: by hand. */
  how?: How;
  /** The referral the payer's claim names (Money claim field 6, rule 20): who led to this payment, and the act followed. */
  referral?: { identity: string; evidence: string } | null;
}

export interface Book {
  /** Each inbox or home read up to, by address. */
  after: Record<string, number>;
  /** Every message and Money act kept, by id: its bytes, and its content key where private. */
  acts: Record<string, { act: string; key?: string; from: string }>;
  drafts: Record<string, { found: number; stage: 'new' | 'signed' | 'declined'; payment: string | null }>;
  requestsIn: Record<string, { from: string; found: number; stage: 'new' | 'declined' | 'debt' | 'asked' | 'paid'; obligation: string | null; payment: string | null }>;
  requestsOut: Record<string, { to: string; at: number; obligation: string | null; payment: string | null }>;
  invoices: Record<string, { from: string; found: number; stage: 'new' | 'answered' | 'refused'; payment: string | null; why: string | null }>;
  /** Money messages this Damgar cannot read (a type it does not know, a payload not as the cMIP writes it): shown unknown, never guessed (money messages cMIP, 6.1). Absent in books written before. */
  unread?: Record<string, { from: string; found: number; type: number; why: string; stage: 'new' | 'set aside' }>;
  payments: Record<string, Payment>;
  /** The payee pointers this identity published from here, by act, newest last. */
  pointers: string[];
  /** The published accepted list's chain, where published (the accepted cMIP, 3). */
  published: { act: string; version: number; withdrawn: boolean } | null;
  /** Lanes asked by apps (the money messages cMIP draft 2, type 5), by request act. Absent in books written before. */
  laneRequests?: Record<string, { found: number; stage: 'new' | 'granted' | 'declined'; grant: string | null }>;
  /** Every lane this identity granted from here, by grant act: its words and what it reaches, as asked; whether its key is held here. */
  lanes?: Record<string, { label: string; app: string; key: string; kinds: LaneKind[]; limits: Limits | null; at: number; revoked: string | null; here: boolean; role: LaneRole | null }>;
  /** How each act this Damgar signed was signed: by hand, by Damgar itself as round 1 did (an on-chain address), or under a lane. */
  how?: Record<string, How>;
  /** On whose authority each act that arrived under someone's grant stands, in words, by act. */
  authorities?: Record<string, string>;
  /** Sales told to this identity's own apps (type 6), by receipt. */
  sales?: Record<string, string>;
  /** Referral shares owed by this identity as a seller, prepared for payment (F351, round 2), by the buyer's claim. */
  referrals?: Record<string, { reposter: string; evidence: string; amount: Amount; draft: string | null }>;
}

/** What a lane held by Damgar itself is for (round 2, 2b). */
export type LaneRole = 'receipts' | 'payouts';

export const NO_BOOK = (): Book => ({ after: {}, acts: {}, drafts: {}, requestsIn: {}, requestsOut: {}, invoices: {}, payments: {}, pointers: [], published: null });

/** The keys Damgar makes for an identity, beside its signing key: the on-chain request key (decided by Nobody, allegedly). */
export interface Keys {
  /** The on-chain request key's secret, hex. */
  request: string | null;
  /** Earlier request keys, kept so payments bound to them can still be shown. */
  earlier: string[];
  /** The lanes whose keys this app holds (F351): Damgar's own (receipts, referral payouts), or, in another app running Damgar's code (Dub), that app's. */
  lanes?: (HeldLane & { kinds: LaneKind[]; limits: Limits | null; role: LaneRole | 'app' })[];
  /** The receive-only link to the person's node (F351): makes invoices only. Program only. */
  link?: LinkConfig | null;
}

/**
 * Where Damgar keeps things: a folder (`store.ts`) or the browser
 * (`web/keep.ts`). `exclusive` runs one signer at a time across every page
 * or program holding the same keep.
 */
export interface Keep {
  held(): Promise<string[]>;
  active(): Promise<string | null>;
  setActive(id: string | null): Promise<void>;
  identity(id: string): Promise<TestIdentity | null>;
  saveIdentity(id: TestIdentity): Promise<void>;
  read<T>(id: string, name: 'settings' | 'book' | 'keys'): Promise<T | null>;
  write(id: string, name: 'settings' | 'book' | 'keys', v: unknown): Promise<void>;
  forget(id: string): Promise<void>;
  exclusive<T>(f: () => Promise<T>): Promise<T>;
}

const list = (xs: string[]) => [...new Set(xs.map((s) => s.trim()).filter(Boolean))];
const message = (e: unknown) => (e instanceof Error ? e.message : String(e));
const now = () => Math.floor(Date.now() / 1000);
export const short = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`;
const b64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

interface Described {
  id: string;
  signer?: string;
  binding?: string;
  public: boolean;
  to?: string[];
  spec?: string;
  type?: number;
  payload?: Uint8Array;
  refs?: string[];
  refSigners?: (string | undefined)[];
}

interface Opened {
  act: Uint8Array;
  key?: Uint8Array;
  described: Described;
}

const railName = (m: string) => (m === SPEC.lightning.hash ? 'Lightning' : m === SPEC.onchain.hash ? 'on-chain' : `rail Module ${m.slice(0, 8)}…`);

export class Damgar {
  private queue: Promise<unknown> = Promise.resolve();
  /** The accepted list as last read, by identity (memory only). */
  private lists = new Map<string, { list: Accepted; at: number }>();

  /**
   * `web`: Damgar's web client. `chain`: the chain followed (program only).
   * `link`: how a receive-only link is opened (program only, F351).
   * `app`: Damgar's code run inside another app (Dub), which signs a
   * payer's acts only under a lane whose key it holds, named so (F338).
   */
  constructor(
    readonly store: Keep,
    readonly opts: { web?: boolean; chain?: ChainSource | null; link?: (c: LinkConfig) => Promise<InvoiceLink>; app?: string } = {},
  ) {}

  private async keys(id: string): Promise<Keys> {
    return (await this.store.read<Keys>(id, 'keys')) ?? { request: null, earlier: [] };
  }

  private serial<T>(f: () => Promise<T>): Promise<T> {
    const next = this.queue.then(() => this.store.exclusive(f));
    this.queue = next.catch(() => undefined);
    return next;
  }

  private who(id: string, me: string | null): Who {
    return { id, short: short(id), me: id === me };
  }

  private async ctx(): Promise<{ me: TestIdentity; s: Settings; book: Book; hints: string[] }> {
    const active = await this.store.active();
    const me = active ? await this.store.identity(active) : null;
    if (!me) throw new Error('No identity in use: bring one by its signing key’s words.');
    const s = (await this.store.read<Settings>(me.id, 'settings')) ?? { relays: [], via: {} };
    const book = { ...NO_BOOK(), ...((await this.store.read<Book>(me.id, 'book')) ?? {}) };
    return { me, s, book, hints: [...new Set([...me.f.homes.map((h) => h.hint), ...s.relays])] };
  }

  private async saveBook(id: string, book: Book) {
    await this.store.write(id, 'book', book);
  }

  // ------------------------------------------------------------ the identity

  /**
   * Bring an identity by its ID and its signing key's words (the carry
   * Module, section 4), as Dub does: kept only if the words give its current
   * signing key; its encryption key where the words carry it. Damgar starts
   * its own line. An identity already held takes the new words instead.
   */
  bring(a: { id: string; words: string; address: string; relays?: string[]; via?: Via }): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const via = a.via ?? {};
      let id: string;
      let seed: Uint8Array;
      try {
        id = readId(a.id);
        seed = fromWords(a.words);
      } catch (e) {
        if (e instanceof Refused) throw new Error(`${e.message}. Nothing was kept.`);
        throw e;
      }
      if ((await this.store.held()).includes(id)) return this.renewHeld(id, seed);
      const address = a.address.trim();
      if (!/^https?:\/\//.test(address)) throw new Error('Give an address where this identity is found (one of its homes), starting with https://.');
      const look = await lookCurrent(id, seed, [address], via);
      const r = look.resolution;
      const binding = r.links[r.links.length - 1];
      const chain = await servedChain(id, r.homes, via);
      const named = list(look.routes.routes.filter((x) => (x.kind ?? 0) === 0).flatMap((x) => x.hints));
      const relays = named.length ? named : list(a.relays ?? []);
      if (!relays.length) throw new Error('This identity names no relays. Give one or more relay addresses, and bring it again.');
      const enc = carriedKey(look, seed);
      const f: IdentityFile = {
        label: TEST_LABEL,
        identity: id,
        position: binding.position,
        binding: binding.act,
        signingSecret: hex(seed),
        safety: { scheme: 0, seeds: '' },
        chain: chain.map(base64),
        homes: r.homes,
        rule: r.rule ?? null,
        sequence: [],
        routes: null,
        encryption: enc ? [enc] : [],
        pending: null,
      };
      await this.store.write(id, 'settings', { relays, via } satisfies Settings);
      await this.store.saveIdentity(new TestIdentity(f, via));
      await this.store.setActive(id);
      return {
        lines: [
          { text: 'Its current signing key matches the words.', tone: 'ok' },
          enc ? { text: 'Its encryption key is the one the words carry: drafts, requests and payments sealed to it open here.', tone: 'ok' } : { text: NO_KEY_SAY, tone: 'warn' },
          { text: LINE_SAY, tone: 'warn' },
        ],
      };
    });
  }

  /** The new signing key's words, after a rotation made elsewhere counts (the carry Module, 4.6). */
  renew(words: string): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const active = await this.store.active();
      if (!active) throw new Error('No identity in use.');
      let seed: Uint8Array;
      try {
        seed = fromWords(words);
      } catch (e) {
        if (e instanceof Refused) throw new Error(`${e.message}. Nothing was kept.`);
        throw e;
      }
      return this.renewHeld(active, seed);
    });
  }

  private async renewHeld(id: string, seed: Uint8Array): Promise<{ lines: Line[] }> {
    const me = (await this.store.identity(id))!;
    const s = (await this.store.read<Settings>(id, 'settings')) ?? { relays: [], via: {} };
    if (hex(seed) === me.f.signingSecret) throw new Error('These are the signing key’s words Damgar already holds, and they still count: nothing to change.');
    const look = await lookCurrent(id, seed, [...new Set([...me.f.homes.map((h) => h.hint), ...s.relays])], s.via);
    const r = look.resolution;
    const binding = r.links[r.links.length - 1];
    me.f.chain = (await servedChain(id, r.homes, s.via)).map(base64);
    me.f.position = binding.position;
    me.f.binding = binding.act;
    me.f.signingSecret = hex(seed);
    me.f.homes = r.homes;
    me.f.rule = r.rule ?? null;
    me.f.pending = null;
    me.f.sequence = [];
    me.f.routes = null;
    const carried = carriedKey(look, seed);
    if (carried && !me.f.encryption.some((e) => e.act === carried.act)) me.f.encryption.push(carried);
    await this.store.saveIdentity(me);
    return {
      lines: [
        { text: 'The new signing key’s words give its current signing key. Damgar signs with them from now on, in a new line.', tone: 'ok' },
        carried ? { text: 'Its encryption key is the one the new words carry.', tone: 'ok' } : { text: NO_KEY_SAY, tone: 'warn' },
        { text: LINE_SAY, tone: 'warn' },
      ],
    };
  }

  async use(id: string): Promise<void> {
    if (!(await this.store.held()).includes(id)) throw new Error('Damgar does not hold that identity.');
    await this.store.setActive(id);
  }

  async leave(): Promise<void> {
    await this.store.setActive(null);
  }

  /** Forget an identity here: its keys, its request key and its book go. What it signed stays where it was sent. */
  forget(id: string): Promise<void> {
    return this.serial(async () => {
      if (!(await this.store.held()).includes(id)) throw new Error('Damgar does not hold that identity.');
      const was = await this.store.active();
      await this.store.forget(id);
      this.lists.delete(id);
      if (was === id) await this.store.setActive((await this.store.held())[0] ?? null);
    });
  }

  /** The signing key's words, on request: the way back if this app's storage is lost. */
  async carry(): Promise<{ id: string; grouped: string; words: string[] }> {
    const { me } = await this.ctx();
    return { id: me.id, grouped: groupId(me.id), words: toWords(unhex(me.f.signingSecret)) };
  }

  /** Whether the signing key Damgar holds still counts. */
  async check(): Promise<{ current: boolean; say: string | null }> {
    const { me } = await this.ctx();
    try {
      await this.current(me);
      return { current: true, say: null };
    } catch (e) {
      if (message(e) === SPENT_SAY) return { current: false, say: SPENT_SAY };
      throw e;
    }
  }

  private async current(me: TestIdentity): Promise<void> {
    const look = await lookUp(me.id, me.f.homes.map((h) => h.hint), me.via);
    const r = look.resolution;
    if (r.stop === 'contested') throw new Error('Its homes disagree about its keys (contested): nothing was signed.');
    if (!r.signingKey || hex(r.signingKey) !== hex(signingPublic(unhex(me.f.signingSecret)))) throw new Error(SPENT_SAY);
  }

  /** Sign, then save the sequence before anything leaves. */
  private signAct(me: TestIdentity, spec: string, type: number, payload: Uint8Array, o: { public: boolean; to?: string[]; refs?: [string, string][] }) {
    return me.sign(spec, type, payload, o);
  }

  // ------------------------------------------------------------ what is accepted (the accepted cMIP, F340)

  private async accepted(me: TestIdentity, fresh = false): Promise<Accepted> {
    const c = this.lists.get(me.id);
    if (c && !fresh && c.at + 60 > now()) return c.list;
    const secrets = [...me.f.encryption].reverse().map((e) => unhex(e.secret));
    const l = await readAccepted(me.id, secrets, me.f.homes.map((h) => h.hint), me.via);
    this.lists.set(me.id, { list: l, at: now() });
    return l;
  }

  private acceptedSet(l: Accepted): Set<string> {
    return new Set(l.entries.keys());
  }

  /**
   * Accept these, and only these, of what Damgar lists (F338: "changeable
   * in Settings"); every entry of another app's part is kept as found (the
   * accepted cMIP, 1.3). Written on the latest version read, checked again
   * before sending (F340).
   */
  setAccepted(keys: string[]): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      await this.current(me);
      const want = new Set(keys);
      const unknownKey = keys.find((k) => !ACCEPTABLE.some((a) => a.key === k));
      if (unknownKey) throw new Error(`Damgar lists no “${unknownKey}”.`);
      const r = await changeAccepted(
        me,
        (entries) => {
          for (const a of ACCEPTABLE) for (const h of a.hashes) {
            if (want.has(a.key)) entries.set(h, labelOf(h) ?? null);
            else entries.delete(h);
          }
        },
        { via: s.via, save: () => this.store.saveIdentity(me), check: () => this.current(me) },
      );
      this.lists.set(me.id, { list: r.list, at: now() });
      const lines: Line[] = [];
      if (r.list.merged.length) lines.push({ text: `Two apps had changed the accepted list at once. Both changes were merged: ${r.list.merged.join(' ')}`, tone: 'warn' });
      lines.push(r.written ? { text: `What you accept is sealed to this identity and kept at its homes (version ${r.list.version}): every app holding the identity reads it; nobody else can.`, tone: 'ok' } : { text: 'Nothing changed.' });
      for (const a of ACCEPTABLE) {
        if (!want.has(a.key)) continue;
        const missing = a.needs.filter((n) => !want.has(n));
        if (missing.length) lines.push({ text: `${a.name} needs ${missing.map((n) => ACCEPTABLE.find((x) => x.key === n)!.name).join(' and ')} accepted too, to be of use.`, tone: 'warn' });
      }
      if (want.has('onchain') && this.opts.web) lines.push({ text: 'The web client follows no chain: an on-chain payment is shown paid, not yet checked against the chain.', tone: 'warn' });
      return { lines };
    });
  }

  /** The other option (F59): publish the accepted list, or withdraw it. */
  publishList(on: boolean): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      await this.current(me);
      const l = await this.accepted(me, true);
      const id = await publishAccepted(me, l, s.relays, book.published ? { act: book.published.act, version: book.published.version } : null, !on, () => this.store.saveIdentity(me));
      book.published = { act: id, version: (book.published?.version ?? 0) + 1, withdrawn: !on };
      await this.saveBook(me.id, book);
      return {
        lines: [
          on
            ? { text: `What you accept is published at ${s.relays.join(', ')}: anyone can read which specifications you accept, and so which rails you can pay on.`, tone: 'warn' }
            : { text: 'The published list is withdrawn: it is private again. Earlier versions stay readable as acts.', tone: 'ok' },
        ],
      };
    });
  }

  // ------------------------------------------------------------ state

  async state(): Promise<State> {
    const active = await this.store.active();
    const held = [];
    for (const id of await this.store.held()) held.push({ id, grouped: groupId(id), short: short(id), active: id === active });
    const me = active ? await this.store.identity(active) : null;
    const out: State = { web: !!this.opts.web, stage: 'identity', held, identity: null, accept: [], list: { version: 0, merged: [], published: false, problems: [] }, counts: { toSign: 0, toPay: 0 } };
    if (!me) return out;
    const s = (await this.store.read<Settings>(me.id, 'settings')) ?? { relays: [], via: {} };
    const book = { ...NO_BOOK(), ...((await this.store.read<Book>(me.id, 'book')) ?? {}) };
    const own = ownLine(me.f.sequence);
    out.identity = {
      id: me.id,
      grouped: groupId(me.id),
      form: idForm(me.id),
      short: short(me.id),
      homes: me.f.homes.map((h) => h.hint),
      relays: s.relays,
      encryption: me.f.encryption.length > 0,
      line: { acts: own.acts, latest: own.card?.act ?? null, summary: own.card?.summary ?? null },
    };
    let l: Accepted;
    try {
      l = await this.accepted(me);
    } catch (e) {
      l = { entries: new Map(), tips: [], merged: [], version: 0, problems: [message(e)] };
    }
    const set = this.acceptedSet(l);
    out.accept = ACCEPTABLE.map((a) => ({ key: a.key, name: a.name, kind: a.kind, draft: a.draft, text: a.text, does: a.does, here: a.here, built: a.built, needs: a.needs, accepted: isAccepted(a, set), hashes: a.hashes }) satisfies Accept);
    out.list = { version: l.version, merged: l.merged, published: !!book.published && !book.published.withdrawn, problems: l.problems };
    out.stage = l.version === 0 ? 'accept' : 'ready';
    out.counts = {
      toSign:
        Object.values(book.drafts).filter((d) => d.stage === 'new').length +
        Object.values(book.requestsIn).filter((r) => r.stage === 'new' || r.stage === 'debt').length +
        Object.values(book.invoices).filter((i) => i.stage === 'new').length +
        Object.values(book.laneRequests ?? {}).filter((r) => r.stage === 'new').length +
        Object.values(book.payments).filter((p) => p.side === 'in' && p.claims.length > 0 && !p.receipts.length).length,
      toPay: Object.values(book.payments).filter((p) => p.side === 'out' && p.stage === 'to pay').length,
    };
    return out;
  }

  // ------------------------------------------------------------ reading what arrived

  /** Where this identity's inbox is, as its routes say. */
  private async inboxOf(me: TestIdentity, s: Settings): Promise<string[]> {
    const l = await lookUp(me.id, me.f.homes.map((h) => h.hint), s.via);
    return list([...(l.inbox(MESSAGES_SPEC) ?? []), ...(l.inbox(MONEY) ?? [])]);
  }

  /**
   * Read what arrived since last time: at the identity's homes (drafts
   * sealed to itself) and its inbox (requests, invoice requests, answers,
   * obligations, claims, receipts), each container opened with its
   * encryption keys, each act kept with its key. Invoice requests on the
   * on-chain rail are answered at once, with the request key, where they
   * are in order (the money messages cMIP, 5.3). Silence proves nothing.
   */
  look(): Promise<{ lines: Line[]; problems: string[] }> {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const problems: string[] = [];
      const lines: Line[] = [];
      // The encryption key the identity publishes now: taken where the words held here carry it (another app may have renewed it from them, the carry Module 2a.4).
      try {
        const l = await lookUp(me.id, me.f.homes.map((h) => h.hint), s.via);
        if (l.encryptionKey && !me.f.encryption.some((e) => hex(xwingPublic(unhex(e.secret))) === hex(l.encryptionKey!))) {
          const c = carriedKey(l, unhex(me.f.signingSecret));
          if (c) {
            me.f.encryption.push(c);
            await this.store.saveIdentity(me);
            lines.push({ text: 'This identity’s encryption key was renewed elsewhere from the signing key’s words Damgar holds: Damgar takes it, and what is sealed to it opens here.', tone: 'ok' });
          } else problems.push('This identity publishes an encryption key Damgar does not hold (it was not made from the signing key’s words held here): what is sealed to it does not open here.');
        }
      } catch {
        // its homes did not answer: the keys held are used
      }
      const secrets = [...me.f.encryption].reverse().map((e) => unhex(e.secret));
      if (!secrets.length) return { lines: [{ text: NO_KEY_SAY, tone: 'warn' }], problems };
      let unopened = 0;
      let inbox: string[] = [];
      try {
        inbox = await this.inboxOf(me, s);
      } catch (e) {
        problems.push(`Its inbox could not be looked up: ${message(e)}`);
      }
      const places = list([...me.f.homes.map((h) => h.hint), ...inbox]);
      const fresh: Opened[] = [];
      for (const hint of places) {
        let after = book.after[hint];
        try {
          for (;;) {
            const page = await relayAt(hint, s.via).feed({ to: me.id, after });
            for (const it of page.items) {
              if (it.kind !== 'sealed') continue;
              let opened = false;
              for (const sec of secrets) {
                try {
                  const o = openSealed(it.item, me.id, sec) as Opened;
                  const d = o.described;
                  if (((d.spec && MESSAGES_SPECS.includes(d.spec)) || d.spec === MONEY) && !book.acts[d.id] && !fresh.some((f) => f.described.id === d.id)) fresh.push(o);
                  opened = true;
                  break;
                } catch {
                  // the next key
                }
              }
              if (!opened) unopened++;
            }
            if (!page.items.length || page.next === after) break;
            after = page.next;
          }
          book.after[hint] = after ?? 0;
        } catch (e) {
          problems.push(`${hint}: ${message(e)}`);
        }
      }
      // Each signer's chain, read once, judges its acts.
      const looked = new Map<string, Promise<Lookup>>();
      const standing = async (o: Opened): Promise<string> => {
        const signer = o.described.signer!;
        let l = looked.get(signer);
        if (!l) looked.set(signer, (l = lookUp(signer, [...places, ...s.relays], s.via)));
        try {
          const x = await l;
          if (o.key) x.verifier.addWithKey(o.act, o.key);
          else x.verifier.add(o.act);
          return x.verifier.status(o.described.id);
        } catch (e) {
          return `its signer was not found (${message(e)})`;
        }
      };
      for (const o of fresh) {
        const d = o.described;
        if (!d.signer || !d.payload) continue;
        let st = await standing(o);
        // An act signed under a lane (a grant key, Identity's scoped key): it counts where Agreements say its grant backs it (rule 80; Money draft 9, rule 7, F350). The signer's look-up holds no grant, so its standing there is scoped or, without the grant, unknown.
        const underGrant = (st === 'scoped' || st === 'unknown') && !!o.described.binding;
        const a = underGrant ? await this.authority(o, [...places, ...s.relays], s.via) : null;
        if (a) {
          st = a.backing === 'backed' || a.backing === 'binds' ? 'valid' : `signed under a grant that does not back it: ${a.words}`;
          (book.authorities ??= {})[d.id] = a.words;
        }
        if (st !== 'valid') {
          problems.push(`An act from ${short(d.signer)} that does not count (${st}): set aside.`);
          continue;
        }
        book.acts[d.id] = { act: base64(o.act), key: o.key ? base64(o.key) : undefined, from: d.signer };
        try {
          await this.file(me, s, book, d, lines);
        } catch (e) {
          problems.push(`${short(d.signer)}: ${message(e)}`);
        }
      }
      if (unopened) problems.push(`${unopened} sealed act${unopened === 1 ? '' : 's'} addressed to this identity did not open with the encryption keys Damgar holds: sealed to a key it does not hold.`);
      await this.byItself(me, s, book, lines, problems);
      await this.saveBook(me.id, book);
      return { lines, problems };
    });
  }

  /** On whose authority an act under a grant stands: its grant, its acceptance and the grantor's revocations read at these places and the signer's homes (`clients/grants`). */
  private async authority(o: Opened, places: string[], via: Via): Promise<Authority | null> {
    const signer = o.described.signer!;
    let hints = list(places);
    try {
      const l = await lookUp(signer, places, via);
      hints = list([...places, ...l.resolution.homes.map((h) => h.hint), ...l.routes.routes.filter((r) => (r.kind ?? 0) === 0).flatMap((r) => r.hints)]);
    } catch {
      // the places given
    }
    try {
      return await authorityOf(o.act, hints, via, { key: o.key, names: short });
    } catch {
      return null;
    }
  }

  /** Put one act that arrived where it belongs in the book. Inside `serial`. */
  private async file(me: TestIdentity, s: Settings, book: Book, d: Described, lines: Line[]): Promise<void> {
    const t = now();
    const signer = d.signer!;
    if (d.spec && MESSAGES_SPECS.includes(d.spec)) {
      // A message it cannot read is kept as such and shown unknown: nothing is guessed from it, nothing signed for it.
      const unread = (why: string) => {
        (book.unread ??= {})[d.id] = { from: signer, found: t, type: d.type ?? -1, why, stage: 'new' };
        lines.push({ text: `A money message from ${short(signer)} that Damgar cannot read: shown unknown, in To sign.`, tone: 'warn' });
      };
      // A draft is only ever one's own (1.1): one signed by anyone else is not for this identity.
      if ((d.type === TYPES.draft || d.type === TYPES.laneRequest || d.type === TYPES.sale) && signer !== me.id) return;
      // A sale is told to the seller's own Dub, which delivers the key: nothing for Damgar to do with it.
      if (d.type === TYPES.sale) return;
      const readers: Record<number, (b: Uint8Array) => unknown> = { [TYPES.draft]: readDraft, [TYPES.request]: readRequest, [TYPES.invoiceRequest]: readInvoiceRequest, [TYPES.answer]: readAnswer };
      // Draft 2's lane request, under draft 2 only (draft 1 defines four types).
      if (d.spec === MESSAGES_SPEC) readers[TYPES.laneRequest] = readLaneRequest;
      if (!readers[d.type!]) return unread(`a message of type ${d.type}, which the money messages cMIP draft 1 does not define`);
      try {
        readers[d.type!](d.payload!);
      } catch (e) {
        return unread(message(e));
      }
      if (d.type === TYPES.laneRequest) {
        (book.laneRequests ??= {})[d.id] = { found: t, stage: 'new', grant: null };
        lines.push({ text: `${readLaneRequest(d.payload!).app} asks for a lane: in To sign, to be read and granted or declined.`, tone: 'ok' });
        return;
      }
      if (d.type === TYPES.draft) {
        if (signer !== me.id) return;
        readDraft(d.payload!);
        book.drafts[d.id] = { found: t, stage: 'new', payment: null };
        lines.push({ text: 'A draft arrived, prepared in another app: in To sign.', tone: 'ok' });
      } else if (d.type === TYPES.request) {
        readRequest(d.payload!);
        book.requestsIn[d.id] = { from: signer, found: t, stage: 'new', obligation: null, payment: null };
        lines.push({ text: `A request to be paid, from ${short(signer)}: in To sign.`, tone: 'ok' });
      } else if (d.type === TYPES.invoiceRequest) {
        book.invoices[d.id] = { from: signer, found: t, stage: 'new', payment: null, why: null };
        await this.onInvoiceRequest(me, s, book, d.id, lines);
      } else if (d.type === TYPES.answer) {
        const a = readAnswer(d.payload!);
        const p = Object.values(book.payments).find((x) => x.side === 'out' && x.invoiceRequest === a.to);
        if (!p || p.other !== signer || p.key !== a.commitment) throw new Error('an answer to no invoice request of this identity');
        // Draft 3 (F352): the answer names the amount it binds, the commitment's; a draft 3 answer without it, or naming another, is refused.
        if (a.amount ? a.amount.unit !== p.amount.unit || a.amount.value !== p.amount.value : d.spec === MESSAGES_SPEC) throw new Error('an answer naming no amount, or another than the payment’s (the money messages cMIP draft 3, 5.1)');
        await this.onAnswer(me, s, book, p, d.id, a.bound, a.ticket);
        lines.push({ text: p.stage === 'to pay' ? `${short(signer)} answered: a payment is ready, in Pay.` : `${short(signer)} refused to bind the payment: ${p.bound?.kind === 'refused' ? p.bound.why : ''}`, tone: p.stage === 'to pay' ? 'ok' : 'warn' });
      }
      return;
    }
    // A Money act addressed to this identity.
    const r = moneyRead(d.type!, d.payload!) as { act: { type: string; [k: string]: unknown } };
    const a = r.act as any;
    if (a.type === 'claim' && a.payee === me.id) {
      const pr = readPaymentProof(new Uint8Array(a.proof)) as { paidTo: CommitmentFields['paidTo']; salt: Uint8Array };
      const key = paymentCommitment({ rail: a.rail, payee: me.id, amount: a.amount, fulfils: a.fulfils, payer: signer, paidTo: pr.paidTo, salt: pr.salt });
      let p = book.payments[key];
      if (!p) {
        // A payment that came without an invoice request this app answered: kept all the same.
        p = book.payments[key] = { key, side: 'in', other: signer, amount: a.amount, fulfils: a.fulfils, whatFor: null, rail: a.rail, address: '', commitment: '', invoiceRequest: '', answer: null, bound: null, preimage: null, onchain: null, claims: [], receipts: [], draft: null, request: null, ticket: null, stage: 'paid', at: t };
      }
      if (!p.claims.includes(d.id)) p.claims.push(d.id);
      if (p.stage === 'to pay' || p.stage === 'asked') p.stage = 'paid';
      lines.push({ text: `${short(signer)} says they paid you ${say(a.amount, new Set(unitOf(a.amount.unit) ? [a.amount.unit] : []))}: check it, and sign the receipt, in To sign.`, tone: 'ok' });
    } else if (a.type === 'receipt' && a.payer === me.id) {
      const pr = readPaymentProof(new Uint8Array(a.proof)) as { paidTo: CommitmentFields['paidTo']; salt: Uint8Array };
      const key = paymentCommitment({ rail: a.rail, payee: a.payee, amount: a.amount, fulfils: a.fulfils, payer: me.id, paidTo: pr.paidTo, salt: pr.salt });
      const p = book.payments[key];
      if (!p) throw new Error('a receipt for no payment of this identity');
      if (!p.receipts.includes(d.id)) p.receipts.push(d.id);
      p.stage = 'settled';
      lines.push({ text: `${short(signer)} signed the receipt for your payment: in the account.`, tone: 'ok' });
    } else if (a.type === 'obligation' && a.creditor === me.id && a.debtor === signer) {
      const ask = Object.entries(book.requestsOut).find(([id, x]) => x.to === signer && !x.obligation && this.requestOf(book, id)?.pointer === a.pointer);
      if (ask) ask[1].obligation = d.id;
      lines.push({ text: `${short(signer)} accepted a debt to you, signed: in the account. ${DEBT_SAY}`, tone: 'ok' });
    }
  }

  private requestOf(book: Book, id: string) {
    try {
      return readRequest(this.opened(book, id).payload);
    } catch {
      return null;
    }
  }

  /** A kept act's description and payload, opened with its content key where private. */
  private opened(book: Book, id: string): { d: Described; payload: Uint8Array } {
    const k = book.acts[id];
    if (!k) throw new Error('that act is not kept here');
    const d = (k.key ? openWithKey(b64(k.act), b64(k.key)) : describeAct(b64(k.act))) as Described;
    if (!d.payload) throw new Error('an act kept without its content');
    return { d, payload: d.payload };
  }

  /** An identity's public acts at these places, held by its lookup's verifier; their payloads, by act. */
  private async actsOf(id: string, places: string[], via: Via, l: Lookup): Promise<Map<string, Described & { bytes: Uint8Array }>> {
    const out = new Map<string, Described & { bytes: Uint8Array }>();
    for (const h of list(places)) {
      let after: number | undefined;
      try {
        for (;;) {
          const page = await relayAt(h, via).feed({ signer: id, after });
          for (const it of page.items) {
            if (it.kind !== 'act') continue;
            try {
              const d = describeAct(it.item) as Described;
              l.verifier.add(it.item);
              out.set(d.id, { ...d, bytes: it.item });
            } catch {
              // not an act the core can hold
            }
          }
          if (!page.items.length || page.next === after) break;
          after = page.next;
        }
      } catch {
        // that place is away
      }
    }
    return out;
  }

  /** A payee as a payer reads it: its chain, its public acts (its payee pointers) at its outbox and homes. */
  private async payee(id: string, me: TestIdentity, s: Settings): Promise<{ look: Lookup; acts: Map<string, Described & { bytes: Uint8Array }> }> {
    let look: Lookup;
    try {
      look = await lookUp(id, [...me.f.homes.map((h) => h.hint), ...s.relays], s.via);
    } catch (e) {
      throw new Error(`${short(id)} was not found: ${message(e)}`);
    }
    const outbox = look.routes.routes.filter((r) => (r.kind ?? 0) === 0).flatMap((r) => r.hints);
    const acts = await this.actsOf(id, [...outbox, ...look.resolution.homes.map((h) => h.hint), ...s.relays], s.via, look);
    return { look, acts };
  }

  // ------------------------------------------------------------ the payee's side: invoice requests

  /**
   * An invoice request arrived (the money messages cMIP, 4.3): checked as
   * the payment cMIP's step 1 allows; on-chain, answered at once with the
   * request key; on Lightning, kept for the person to make an invoice in
   * their wallet. One out of order is refused, saying why.
   */
  private async onInvoiceRequest(me: TestIdentity, s: Settings, book: Book, id: string, lines: Line[]): Promise<void> {
    const inv = book.invoices[id];
    const checked = await this.checkInvoiceRequest(me, s, book, id);
    const ir = checked.ir;
    const f = ir.fields;
    if (checked.why) {
      await this.sendAnswer(me, s, book, id, f.hash, { kind: 'refused', why: checked.why.slice(0, 280) }, inv.from, null, undefined, f.amount);
      inv.stage = 'refused';
      inv.why = checked.why;
      lines.push({ text: `An invoice request from ${short(inv.from)} was refused: ${checked.why}.`, tone: 'warn' });
      return;
    }
    const p: Payment = {
      key: f.hash,
      side: 'in',
      other: inv.from,
      amount: f.amount,
      fulfils: f.fulfils,
      whatFor: ir.whatFor,
      rail: f.rail,
      address: base64(checked.address!),
      commitment: base64(ir.commitment),
      invoiceRequest: id,
      answer: null,
      bound: null,
      preimage: null,
      onchain: null,
      claims: [],
      receipts: [],
      draft: null,
      request: ir.answers,
      ticket: null,
      stage: 'asked',
      at: now(),
    };
    book.payments[f.hash] = p;
    inv.payment = f.hash;
    if (ir.answers && book.requestsOut[ir.answers]) book.requestsOut[ir.answers].payment = f.hash;
    const acc = this.acceptedSet(await this.accepted(me));
    if (f.rail === SPEC.onchain.hash) {
      const keys = (await this.store.read<Keys>(me.id, 'keys')) ?? { request: null, earlier: [] };
      const addr = readOnchainAddress(checked.address!) as { request: string } | null;
      const secret = [keys.request, ...keys.earlier].find((k) => k && addr && onchainKey(unhex(k)) === addr.request);
      if (!secret) {
        const why = 'the request key this address names is not held by this Damgar';
        await this.sendAnswer(me, s, book, id, f.hash, { kind: 'refused', why }, inv.from, null, undefined, f.amount);
        inv.stage = 'refused';
        inv.why = why;
        delete book.payments[f.hash];
        lines.push({ text: `An on-chain invoice request from ${short(inv.from)} could not be answered: ${why}.`, tone: 'warn' });
        return;
      }
      if (s.manual) {
        lines.push({ text: `${short(inv.from)} asks where to pay you ${say(f.amount, acc)} on-chain: an address to give, in To sign (every step by hand).`, tone: 'ok' });
        return;
      }
      const sig = onchainRequest(unhex(secret), f.hash, undefined) as Uint8Array;
      const bound: Bound = { kind: 'request', request: sig, confirmations: null };
      const how = (await this.payeeAuto(me, s, MESSAGES_SPEC, TYPES.answer, answerPayload({ to: id, commitment: f.hash, bound, ticket: null, amount: f.amount }))) ?? { by: 'itself' as const };
      const answer = await this.sendAnswer(me, s, book, id, f.hash, bound, inv.from, null, how, f.amount);
      inv.stage = 'answered';
      p.answer = answer;
      p.bound = { kind: 'request', request: base64(sig), confirmations: null };
      p.stage = 'to pay';
      lines.push({ text: `${short(inv.from)} asked where to pay you ${say(f.amount, acc)} on-chain: Damgar answered by itself with an address bound to that payment alone, signed with your request key${how.by === 'lane' ? ', under your receipts lane' : ''}.`, tone: 'ok' });
    } else {
      // Lightning: an invoice from the person's node, through the receive-only link (F351), under the receipts lane and within its cap; otherwise it waits.
      const keys = await this.keys(me.id);
      const lane = keys.link && this.opts.link ? await this.payeeLane(me, s, MESSAGES_SPEC, TYPES.answer, answerPayload({ to: id, commitment: f.hash, bound: { kind: 'invoice', invoice: '' }, ticket: null, amount: f.amount })) : null;
      const auto = lane && !('why' in lane) ? lane : null;
      if (auto && keys.link) {
        try {
          const link = await this.opts.link!(keys.link);
          const invoice = await link.invoice(f.amount.value, f.hash);
          const problems = this.invoiceProblems(p, invoice);
          if (problems.length) throw new Error(problems.join('; '));
          p.answer = await this.sendAnswer(me, s, book, id, p.key, { kind: 'invoice', invoice }, inv.from, null, auto, f.amount);
          p.bound = { kind: 'invoice', invoice };
          p.stage = 'to pay';
          inv.stage = 'answered';
          lines.push({ text: `${short(inv.from)} wants to pay you ${say(f.amount, acc)} on Lightning: Damgar answered by itself, with an invoice your node made through its receive-only link, under your receipts lane.`, tone: 'ok' });
          return;
        } catch (e) {
          lines.push({ text: `Damgar could not make the invoice by itself (${message(e)}): make it in your wallet, in To sign.`, tone: 'warn' });
          return;
        }
      }
      lines.push({ text: `${short(inv.from)} wants to pay you ${say(f.amount, acc)} on Lightning: make an invoice in your wallet, in To sign.${lane && 'why' in lane && !s.manual ? ` Not answered by itself: ${lane.why.replace(/\.? ?Nothing was signed\.?$/, '')}.` : ''}`, tone: 'ok' });
    }
  }

  /** What keeps a Lightning invoice from binding this payment (the Lightning rail Module's rule, and the checks of the money messages cMIP, 5.3). */
  private invoiceProblems(p: Payment, invoice: string): string[] {
    const t = invoice.trim().toLowerCase().replace(/^lightning:/, '');
    let decoded: { network: number; node: string; amountMsat: number | null; descriptionHash: string | null; hasDescription: boolean };
    try {
      decoded = lightningInvoice(t) as typeof decoded;
    } catch (e) {
      return [`${message(e)}. Copy the whole invoice from your wallet`];
    }
    const addr = readLightningAddress(b64(p.address)) as { node: string } | null;
    const problems: string[] = [];
    if (decoded.node !== addr?.node) problems.push(`it was signed by node ${decoded.node.slice(0, 12)}…, not the node your payee pointer names (${addr?.node.slice(0, 12)}…): make it in that wallet`);
    if (decoded.hasDescription) problems.push('it carries a plain description: make it with the description hash only');
    if (decoded.descriptionHash !== p.key) problems.push(`its description hash is not the one asked (${p.key})`);
    if (decoded.amountMsat !== p.amount.value * 1000) problems.push(`its amount is not exactly ${p.amount.value} (in the unit’s smallest part)`);
    const rule = railCheck(p.rail, p.key, p.amount, b64(p.address), lightningProof(t, undefined), null) as Verdict;
    if (!problems.length && rule.answer !== 'pending') problems.push(`the Lightning rail Module’s rule says ${rule.answer}: ${rule.why}`);
    return problems;
  }

  /** Every step by hand: give an on-chain address bound to a payment to you, signed with the request key (as round 1 did by itself). */
  answerAddress(id: string): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const inv = book.invoices[id];
      if (!inv || inv.stage !== 'new' || !inv.payment) throw new Error('No address request is waiting there.');
      const p = book.payments[inv.payment];
      if (p.rail !== SPEC.onchain.hash) throw new Error('That is a Lightning payment: make an invoice for it.');
      const keys = await this.keys(me.id);
      const addr = readOnchainAddress(b64(p.address)) as { request: string } | null;
      const secret = [keys.request, ...keys.earlier].find((k) => k && addr && onchainKey(unhex(k)) === addr.request);
      if (!secret) throw new Error('The request key this address names is not held by this Damgar. Nothing was sent.');
      const sig = onchainRequest(unhex(secret), p.key, undefined) as Uint8Array;
      p.answer = await this.sendAnswer(me, s, book, id, p.key, { kind: 'request', request: sig, confirmations: null }, inv.from, null);
      p.bound = { kind: 'request', request: base64(sig), confirmations: null };
      p.stage = 'to pay';
      inv.stage = 'answered';
      await this.saveBook(me.id, book);
      return { lines: [{ text: `An address bound to this payment alone was sent to ${short(inv.from)}, sealed, signed with your request key.`, tone: 'ok' }] };
    });
  }

  /** The payment cMIP's step 1, on the payee's side. */
  private async checkInvoiceRequest(me: TestIdentity, s: Settings, book: Book, id: string): Promise<{ ir: ReturnType<typeof readInvoiceRequest>; why: string | null; address: Uint8Array | null }> {
    const opened = this.opened(book, id);
    const ir = readInvoiceRequest(opened.payload);
    const f = ir.fields;
    const fail = (why: string) => ({ ir, why, address: null });
    if (f.payer !== opened.d.signer) return fail('its signer is not the payer the commitment names');
    if (f.payee !== me.id) return fail('the commitment names another payee');
    const acc = this.acceptedSet(await this.accepted(me));
    if (!acc.has(SPEC.payment) || !acc.has(MESSAGES_SPEC)) return fail('the payee does not accept the payment cMIP and the money messages cMIP');
    if (!acc.has(f.rail)) return fail(`the payee does not accept this rail Module (${railName(f.rail)})`);
    if (!acc.has(f.amount.unit)) return fail('the payee does not accept this unit');
    const { look, acts } = await this.payee(me.id, me, s);
    let address: Uint8Array | null = null;
    if (f.paidTo.kind === 'flow') {
      const d = acts.get(f.paidTo.pointer);
      if (!d || d.spec !== MONEY || d.type !== 0 || look.verifier.bindingStatus(f.paidTo.pointer) !== 'valid') return fail('it names a payee pointer that is not this identity’s, or does not count');
      const ptr = (moneyRead(0, d.payload!) as { act: { payee: string; rails: { module: string; address: Uint8Array }[] } }).act;
      if (ptr.payee !== me.id) return fail('it names another identity’s pointer');
      const rail = ptr.rails[f.paidTo.rail];
      if (!rail || rail.module !== f.rail) return fail('the pointer has no such rail, or it names another rail Module');
      address = new Uint8Array(rail.address);
    } else if (f.paidTo.kind === 'vault') {
      const v = look.verifier.moneyVault(MONEY, me.id) as { declaredBy: string; entries: { unit: string; railModule: string; source: Uint8Array }[] } | null;
      const e = v && v.declaredBy === f.paidTo.declaredBy ? v.entries[f.paidTo.entry] : undefined;
      if (!e || e.railModule !== f.rail || e.unit !== f.amount.unit) return fail('it names no entry of the vault in force for this rail and unit');
      address = new Uint8Array(e.source);
    } else return fail('a refund rail: not answered by Damgar in round 1');
    const network = f.rail === SPEC.lightning.hash ? (readLightningAddress(address) as { network: number } | null)?.network : (readOnchainAddress(address) as { network: number } | null)?.network;
    if (network === undefined || unitOf(f.amount.unit)?.unit.network !== network) return fail('the rail does not carry the amount’s unit');
    void book;
    return { ir, why: null, address };
  }

  /** An answer carries the amount it binds, the commitment's (draft 3, F352), so a lane's cap is judged on it by the grant limits cMIP. */
  private async sendAnswer(me: TestIdentity, s: Settings, book: Book, to: string, commitment: string, bound: Bound, payer: string, ticket: string | null, how: How = { by: 'hand' }, amount: Amount | null = book.payments[commitment]?.amount ?? null): Promise<string> {
    return this.deliver(me, s, book, MESSAGES_SPEC, TYPES.answer, answerPayload({ to, commitment, bound, ticket, amount }), payer, undefined, how);
  }

  /**
   * The payee answers a Lightning invoice request with an invoice its own
   * wallet made, pasted here (the money messages cMIP, 5.3): checked first
   * under the rail Module's rule, which must answer pending (the node its
   * pointer names, the description hash the commitment, the exact amount,
   * no plain description).
   */
  answerInvoice(id: string, invoice: string): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const inv = book.invoices[id];
      if (!inv || inv.stage !== 'new' || !inv.payment) throw new Error('No invoice request is waiting for an invoice there.');
      const p = book.payments[inv.payment];
      const t = invoice.trim().toLowerCase().replace(/^lightning:/, '');
      const problems = this.invoiceProblems(p, t);
      if (problems.length) throw new Error(`This invoice cannot bind the payment: ${problems.join('; ')}. Nothing was sent.`);
      p.answer = await this.sendAnswer(me, s, book, id, p.key, { kind: 'invoice', invoice: t }, inv.from, null);
      p.bound = { kind: 'invoice', invoice: t };
      p.stage = 'to pay';
      inv.stage = 'answered';
      await this.saveBook(me.id, book);
      return { lines: [{ text: `The invoice was checked and sent, sealed, to ${short(inv.from)}. When they pay it in their wallet, their Damgar sends you the claim; check it, and sign the receipt.`, tone: 'ok' }] };
    });
  }

  /** Refuse an invoice request, saying why: nothing is bound. */
  refuseInvoice(id: string, why: string): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const inv = book.invoices[id];
      if (!inv || inv.stage !== 'new') throw new Error('No invoice request is waiting there.');
      const w = why.trim().slice(0, 280) || 'refused by the payee';
      await this.sendAnswer(me, s, book, id, inv.payment ?? '0'.repeat(64), { kind: 'refused', why: w }, inv.from, null);
      inv.stage = 'refused';
      inv.why = w;
      if (inv.payment) book.payments[inv.payment].stage = 'refused';
      await this.saveBook(me.id, book);
      return { lines: [{ text: 'Refused, and said: nothing was bound to the payment.' }] };
    });
  }

  // ------------------------------------------------------------ the payer's side

  /**
   * Where a payment to this payee of this amount goes, and on which rail,
   * from what the payee published and what this person accepts (the payment
   * cMIP, "Choosing where to pay"; Money rules 1, 3 and 5).
   */
  private async route(me: TestIdentity, s: Settings, payee: string, amount: Amount, acc: Set<string>): Promise<{ to: 'flow' | 'vault'; pointer: string | null; rail: number; declaredBy: string | null; entry: number; module: string; address: Uint8Array; why: string; tipPointer: string | null }> {
    const { look } = await this.payee(payee, me, s);
    const c = look.verifier.moneyChoose(MONEY, payee, amount, [...acc]) as { to: string; pointer?: string; rail?: number; declaredBy?: string; entry?: number; module?: string; address?: Uint8Array; why: string };
    const ptr = look.verifier.moneyPointer(MONEY, payee) as { act: string | null; forked: boolean };
    if (c.to === 'nowhere') throw new Error(`It cannot be paid: ${c.why}. The payee could be told why, in a message.`);
    return {
      to: c.to as 'flow' | 'vault',
      pointer: c.pointer ?? null,
      rail: c.rail ?? 0,
      declaredBy: c.declaredBy ?? null,
      entry: c.entry ?? 0,
      module: c.module!,
      address: new Uint8Array(c.address!),
      why: c.why,
      tipPointer: ptr.act,
    };
  }

  /**
   * Bind a payment (the payment cMIP, step 1): the commitment computed with
   * a fresh salt of 128 random bits, sent to the payee in an invoice request
   * (the money messages cMIP, 4).
   */
  private async bind(me: TestIdentity, s: Settings, book: Book, a: { payee: string; amount: Amount; fulfils: string | null; whatFor: string | null; answers: string | null; draft: string | null; ticket: { leaf: string; tier: number } | null; auto?: boolean; referral?: { identity: string; evidence: string } | null; refs?: [string, string][] }): Promise<Payment> {
    const acc = this.acceptedSet(await this.accepted(me));
    const r = await this.route(me, s, a.payee, a.amount, acc);
    const fulfils = a.fulfils ?? r.tipPointer;
    if (!fulfils) throw new Error('The payee has no payee pointer: a tip follows one (Money rule 17). Nothing was signed.');
    const paidTo = r.to === 'flow' ? { kind: 'flow', pointer: r.pointer!, rail: r.rail } : { kind: 'vault', declaredBy: r.declaredBy!, entry: r.entry };
    const salt = new Uint8Array(randomBytes(16));
    const c = { rail: r.module, payee: a.payee, amount: a.amount, fulfils, payer: me.id, paidTo, salt };
    const commitment = commitmentCbor(c) as Uint8Array;
    const key = paymentCommitment(c) as string;
    const irPayload = invoiceRequestPayload({ commitment, whatFor: a.whatFor, answers: a.answers, ticket: a.ticket });
    const how = await this.payerHow(me, s, MESSAGES_SPEC, TYPES.invoiceRequest, irPayload, !!a.auto);
    // The claim will be signed the same way: checked now, before anything leaves (a lane reaching invoice requests but not claims would leave a payment no claim can record).
    if (how.by === 'lane') {
      const claimAs = moneyPayload({ type: 'claim', rail: r.module, proof: new Uint8Array(0), payee: a.payee, amount: a.amount, fulfils }) as { type: number; payload: Uint8Array };
      const f = await this.laneFor(me, s, MONEY, claimAs.type, claimAs.payload, this.opts.app ? 'app' : 'payouts');
      if ('why' in f || f.lane.grant !== how.grant) throw new Error(`The lane does not reach the payment’s claim${'why' in f ? ` (${f.why})` : ''}. Nothing was signed.`);
    }
    const ir = await this.deliver(me, s, book, MESSAGES_SPEC, TYPES.invoiceRequest, irPayload, a.payee, a.refs, how);
    const p: Payment = {
      key,
      side: 'out',
      other: a.payee,
      amount: a.amount,
      fulfils,
      whatFor: a.whatFor,
      rail: r.module,
      address: base64(r.address),
      commitment: base64(commitment),
      invoiceRequest: ir,
      answer: null,
      bound: null,
      preimage: null,
      onchain: null,
      claims: [],
      receipts: [],
      draft: a.draft,
      request: a.answers,
      ticket: null,
      stage: 'asked',
      at: now(),
      how,
      referral: a.referral ?? null,
    };
    book.payments[key] = p;
    return p;
  }

  /** An answer arrived: checked under the rail Module's rule before anything is shown to pay (the money messages cMIP, 5.2). */
  private async onAnswer(me: TestIdentity, s: Settings, book: Book, p: Payment, id: string, bound: Bound, ticket: string | null): Promise<void> {
    p.answer = id;
    if (bound.kind === 'refused') {
      p.bound = { kind: 'refused', why: bound.why };
      p.stage = 'refused';
      return;
    }
    const proof = bound.kind === 'invoice' ? (lightningProof(bound.invoice, undefined) as Uint8Array) : (onchainProof({ request: bound.request, confirmations: bound.confirmations ?? undefined }) as Uint8Array);
    const v = railCheck(p.rail, p.key, p.amount, b64(p.address), proof, null) as Verdict;
    if (v.answer !== 'pending') {
      p.bound = { kind: 'refused', why: `what the payee sent does not bind this payment (${v.answer}: ${v.why}); do not pay` };
      p.stage = 'refused';
      return;
    }
    p.bound = bound.kind === 'invoice' ? { kind: 'invoice', invoice: bound.invoice } : { kind: 'request', request: base64(bound.request), confirmations: bound.confirmations };
    p.stage = 'to pay';
    if (ticket) {
      // A payment for an anchor: the ticket the service signed, checked before paying (the anchoring cMIP, client conformance).
      const why = await this.checkTicket(me, s, book, p, ticket);
      if (why) {
        p.bound = { kind: 'refused', why: `the anchoring service’s ticket does not hold (${why}); do not pay` };
        p.stage = 'refused';
      }
    }
  }

  /** Check an anchoring ticket before paying: it names the offer followed, the leaf sent and this payment's commitment, for the tier's price; its deadline within the tier's blocks of this Damgar's own point on the chain (unknown where it follows none, said). */
  private async checkTicket(me: TestIdentity, s: Settings, book: Book, p: Payment, ticket: string): Promise<string | null> {
    const { acts } = await this.payee(p.other, me, s);
    const t = acts.get(ticket);
    const o = acts.get(p.fulfils);
    if (!t || !o || t.signer !== p.other) return 'the ticket or the offer was not found at the service’s places';
    const tk = anchoringReadTicket(t.payload!) as { batch: number; deadline: number; tier: number; leaf: string } | null;
    if (!tk) return 'not a ticket';
    const ir = readInvoiceRequest(this.opened(book, p.invoiceRequest).payload);
    if (!ir.ticket) return 'no anchor was asked';
    const chain = this.opts.chain ? await this.opts.chain.headers().catch(() => null) : null;
    const nowPoint = chain ? chain.start + chain.headers.length - 1 : null;
    const why = anchoringCheckTicket(o.bytes, t.payload!, b64(p.commitment), ir.ticket.leaf, BigInt(nowPoint ?? Math.max(0, tk.deadline - 1))) as string | undefined;
    if (why) return why;
    book.acts[ticket] = { act: base64(t.bytes), from: p.other };
    p.ticket = { act: ticket, batch: tk.batch, deadline: tk.deadline, tier: tk.tier, checked: nowPoint !== null };
    return null;
  }

  // ------------------------------------------------------------ To sign

  /** What waits for the person, read in plain words (F338). */
  toSign(): Promise<{ items: ToSign[]; problems: string[] }> {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const acc = this.acceptedSet(await this.accepted(me));
      const items: ToSign[] = [];
      const problems: string[] = [];
      const shown = (a: Amount): Shown => ({ ...a, said: say(a, acc) });
      for (const [id, x] of Object.entries(book.drafts)) {
        if (x.stage !== 'new') continue;
        try {
          items.push(await this.readDraftItem(me, s, book, id, acc));
        } catch (e) {
          problems.push(`A draft ${short(id)}: ${message(e)}`);
        }
      }
      for (const [id, x] of Object.entries(book.unread ?? {})) {
        if (x.stage !== 'new') continue;
        items.push({
          id,
          kind: 'unknown',
          from: this.who(x.from, me.id),
          app: null,
          title: 'A money message Damgar cannot read',
          lines: [
            { text: `It cannot be read here (${x.why}): unknown. Nothing is guessed from it, and nothing can be signed for it.`, tone: 'warn' },
            { text: 'It may come from a newer app or another draft of the money messages cMIP. Setting it aside signs nothing and sends nothing.' },
          ],
          amount: null,
          unknown: true,
          offers: ['decline'],
          found: x.found,
        });
      }
      for (const [id, x] of Object.entries(book.requestsIn)) {
        if (x.stage !== 'new' && x.stage !== 'debt') continue;
        const r = this.requestOf(book, id);
        if (!r) continue;
        const known = acc.has(r.amount.unit) && acc.has(SPEC.payment) && acc.has(MESSAGES_SPEC);
        const lines: Line[] = [
          { text: `${short(x.from)} asks you to pay ${say(r.amount, acc)}${r.whatFor ? `, for “${r.whatFor}”` : ''}.` },
          { text: 'A request is not a debt: nothing binds you until you sign something (F66).' },
        ];
        if (x.stage === 'debt') lines.push({ text: `You accepted it as a debt (an obligation, signed). ${DEBT_SAY}`, tone: 'warn' });
        else lines.push({ text: 'Accept as a debt: you sign an obligation, “I owe this”, only if you mean to owe it (to pay later). Or pay it now, as a payment to their pointer. Most simple payments skip the debt.' });
        if (!known) lines.push({ text: 'Its unit, or the payment cMIP, is not one you accept: unknown, and nothing is signed for it.', tone: 'warn' });
        items.push({ id, kind: 'request', from: this.who(x.from, me.id), app: null, title: 'A request to be paid', lines, amount: shown(r.amount), unknown: !known, offers: known ? (x.stage === 'debt' ? ['pay', 'decline'] : ['debt', 'pay', 'decline']) : ['decline'], found: x.found });
      }
      for (const [id, x] of Object.entries(book.laneRequests ?? {})) {
        if (x.stage !== 'new') continue;
        try {
          items.push(this.laneItem(me, book, id, acc));
        } catch (e) {
          problems.push(`A lane asked ${short(id)}: ${message(e)}`);
        }
      }
      for (const [id, x] of Object.entries(book.invoices)) {
        if (x.stage !== 'new' || !x.payment) continue;
        const p = book.payments[x.payment];
        if (p.rail === SPEC.onchain.hash) {
          items.push({
            id,
            kind: 'address',
            from: this.who(x.from, me.id),
            app: null,
            title: 'Give an address for a payment to you',
            lines: [
              { text: `${short(x.from)} wants to pay you ${say(p.amount, acc)} on-chain${p.whatFor ? `, for “${p.whatFor}”` : ''}.` },
              { text: 'Every step is followed by hand: Damgar waits for you to give an address bound to this payment alone, signed with your request key.' },
            ],
            amount: shown(p.amount),
            unknown: false,
            offers: ['address', 'refuse'],
            found: x.found,
          });
          continue;
        }
        items.push({
          id,
          kind: 'invoice',
          from: this.who(x.from, me.id),
          app: null,
          title: 'Make an invoice for a payment to you',
          lines: [
            { text: `${short(x.from)} wants to pay you ${say(p.amount, acc)} on Lightning${p.whatFor ? `, for “${p.whatFor}”` : ''}, to your ${p.address ? 'payee pointer’s node' : 'node'}.` },
            { text: 'In your own wallet, make an invoice for exactly this amount, with this description hash and no description. Paste it here: Damgar checks it and sends it to them, sealed.' },
            { text: 'Damgar holds no wallet: the invoice comes from the node your payee pointer names, and only that node can sign it.' },
          ],
          amount: shown(p.amount),
          unknown: false,
          offers: ['invoice', 'refuse'],
          descriptionHash: p.key,
          found: x.found,
        });
      }
      for (const p of Object.values(book.payments)) {
        if (p.side !== 'in' || !p.claims.length || p.receipts.length) continue;
        items.push({
          id: p.key,
          kind: 'receipt',
          from: this.who(p.other, me.id),
          app: null,
          title: 'A payment to you: check it, then sign the receipt',
          lines: [
            { text: `${short(p.other)} says they paid you ${say(p.amount, acc)} on ${railName(p.rail)}, and sent their claim with the rail’s proof.` },
            { text: 'Signing the receipt says “I received this, for that”, signed by you (Money rule 7). Damgar first checks the claim by the rail Module’s rule, from the rail’s own evidence; you can sign only once it verifies.' },
          ],
          amount: shown(p.amount),
          unknown: !acc.has(p.rail),
          offers: acc.has(p.rail) ? ['receipt'] : [],
          found: p.at,
        });
      }
      items.sort((a, b) => b.found - a.found);
      return { items, problems };
    });
  }

  private async readDraftItem(me: TestIdentity, s: Settings, book: Book, id: string, acc: Set<string>): Promise<ToSign> {
    const { d, payload } = this.opened(book, id);
    const dr = readDraft(payload);
    const x = book.drafts[id];
    const lines: Line[] = [];
    let unknown = false;
    const need = [SPEC.payment, MESSAGES_SPEC, dr.amount.unit, ...(dr.what === 'anchor' ? [SPEC.anchoring] : [])];
    const missing = need.filter((h) => !acc.has(h));
    if (missing.length) {
      unknown = true;
      lines.push({ text: `Under ${missing.map((h) => labelOf(h) ?? `${h.slice(0, 8)}…`).join(', ')}, not accepted here: unknown, and it cannot be signed (F338). Accept it in Settings to read it.`, tone: 'warn' });
    }
    const about = (d.refs ?? []).map((r, i) => `${r.slice(0, 8)}…${d.refSigners?.[i] ? ` by ${short(d.refSigners[i]!)}` : ''}`);
    if (dr.what === 'ask') {
      lines.unshift({ text: `Prepared in ${dr.app}, not signed there: ask ${short(dr.other)} to pay you ${say(dr.amount, acc)}${dr.whatFor ? `, for “${dr.whatFor}”` : ''}.` });
      lines.push({ text: 'Signing sends them a request to be paid, sealed to them, naming your payee pointer in force. It binds nobody: they may pay it, accept it as a debt, or decline.' });
    } else {
      lines.unshift({ text: `Prepared in ${dr.app}, not signed there: ${dr.what === 'anchor' ? 'pay an anchoring service' : 'pay'} ${short(dr.other)} ${say(dr.amount, acc)}${dr.whatFor ? `, for “${dr.whatFor}”` : ''}${about.length ? ` (about ${about.join(', ')})` : ''}.` });
      if (!unknown) {
        try {
          const r = await this.route(me, s, dr.other, dr.amount, acc);
          lines.push({ text: `On ${railName(r.module)}, to ${r.to === 'flow' ? 'their flow (their payee pointer in force)' : 'their vault'}. ${r.why}`.trim(), tone: 'ok' });
          lines.push({ text: 'Signing sends them an invoice request, sealed: the payment’s fingerprint (the commitment: who pays whom, how much, for what, where), for their side to bind. Nothing is paid yet; you pay in your own wallet, from Pay.' });
        } catch (e) {
          unknown = true;
          lines.push({ text: message(e), tone: 'warn' });
        }
      }
      if (dr.what === 'anchor' && dr.anchor) lines.push({ text: `For an anchor of one act on the Bitcoin clock, through the service’s standing offer ${short(dr.anchor.offer)}, tier ${dr.anchor.tier}. The service is sent the leaf (a fingerprint mixed with a random secret ${dr.app} keeps), never the act. Whether the payment follows its offer is Agreements’ to judge: unknown here.` });
    }
    return { id, kind: 'draft', from: this.who(me.id, me.id), app: dr.app, title: dr.what === 'ask' ? 'A request to send' : dr.what === 'anchor' ? 'A payment for an anchor' : 'A payment to make', lines, amount: { ...dr.amount, said: say(dr.amount, acc) }, unknown, offers: unknown ? ['decline'] : ['sign', 'decline'], found: x.found };
  }

  /** Sign a draft (the money messages cMIP, 2.2): an invoice request, or a request to be paid. */
  signDraft(id: string): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const x = book.drafts[id];
      if (!x || x.stage !== 'new') throw new Error('That draft is not waiting.');
      const item = await this.readDraftItem(me, s, book, id, this.acceptedSet(await this.accepted(me)));
      if (item.unknown) throw new Error('It is unknown here: nothing was signed.');
      const dr = readDraft(this.opened(book, id).payload);
      if (dr.what === 'ask') {
        const { look, acts } = await this.payee(me.id, me, s);
        void acts;
        const ptr = look.verifier.moneyPointer(MONEY, me.id) as { act: string | null };
        if (!ptr.act) throw new Error('You have no payee pointer yet: say where you are paid, in Settings, before asking to be paid. Nothing was signed.');
        const req = await this.deliver(me, s, book, MESSAGES_SPEC, TYPES.request, requestPayload({ amount: dr.amount, whatFor: dr.whatFor, pointer: ptr.act }), dr.other);
        book.requestsOut[req] = { to: dr.other, at: now(), obligation: null, payment: null };
        x.stage = 'signed';
        await this.saveBook(me.id, book);
        return { lines: [{ text: `The request was sent to ${short(dr.other)}, sealed. Their Damgar offers them to pay it, or accept it as a debt.`, tone: 'ok' }] };
      }
      const p = await this.bind(me, s, book, {
        payee: dr.other,
        amount: dr.amount,
        fulfils: dr.what === 'anchor' ? dr.anchor!.offer : null,
        whatFor: dr.whatFor,
        answers: null,
        draft: id,
        ticket: dr.what === 'anchor' ? { leaf: dr.anchor!.leaf, tier: dr.anchor!.tier } : null,
      });
      x.stage = 'signed';
      x.payment = p.key;
      await this.saveBook(me.id, book);
      return { lines: [{ text: `The invoice request was sent to ${short(dr.other)}, sealed. When they answer, the payment shows in Pay.`, tone: 'ok' }] };
    });
  }

  /** Decline a draft or a request: nothing is signed, nothing is sent. */
  decline(id: string): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, book } = await this.ctx();
      if (book.drafts[id]?.stage === 'new') book.drafts[id].stage = 'declined';
      else if (book.laneRequests?.[id]?.stage === 'new') book.laneRequests[id].stage = 'declined';
      else if (book.requestsIn[id] && (book.requestsIn[id].stage === 'new' || book.requestsIn[id].stage === 'debt')) book.requestsIn[id].stage = 'declined';
      else if (book.unread?.[id]?.stage === 'new') {
        book.unread[id].stage = 'set aside';
        await this.saveBook(me.id, book);
        return { lines: [{ text: 'Set aside, unread: nothing was signed, nothing was sent.' }] };
      } else throw new Error('Nothing is waiting there.');
      await this.saveBook(me.id, book);
      return { lines: [{ text: 'Declined: nothing was signed, nothing was sent.' }] };
    });
  }

  /** Accept a request as a debt: an obligation (Money type 1) signed by this identity, the debtor, delivered to the creditor (Q1, decided by Nobody, allegedly). */
  acceptDebt(id: string): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const x = book.requestsIn[id];
      if (!x || x.stage !== 'new') throw new Error('No request is waiting there.');
      const r = this.requestOf(book, id)!;
      const made = moneyPayload({ type: 'obligation', debtor: me.id, creditor: x.from, amount: r.amount, pointer: r.pointer }) as { type: number; payload: Uint8Array };
      x.obligation = await this.deliver(me, s, book, MONEY, made.type, made.payload, x.from);
      x.stage = 'debt';
      await this.saveBook(me.id, book);
      return { lines: [{ text: `You signed the debt: you owe ${short(x.from)} ${say(r.amount, this.acceptedSet(await this.accepted(me)))}. It was sent to them, sealed.`, tone: 'ok' }, { text: DEBT_SAY, tone: 'warn' }] };
    });
  }

  /** Pay a request: an invoice request whose `fulfils` is the debt where one was signed, otherwise the pointer the request names. */
  payRequest(id: string): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const x = book.requestsIn[id];
      if (!x || (x.stage !== 'new' && x.stage !== 'debt')) throw new Error('No request is waiting there.');
      const r = this.requestOf(book, id)!;
      const p = await this.bind(me, s, book, { payee: x.from, amount: r.amount, fulfils: x.obligation ?? r.pointer, whatFor: r.whatFor, answers: id, draft: null, ticket: null });
      x.stage = 'asked';
      x.payment = p.key;
      await this.saveBook(me.id, book);
      return { lines: [{ text: `The invoice request was sent to ${short(x.from)}, sealed. When they answer, the payment shows in Pay.`, tone: 'ok' }] };
    });
  }

  /**
   * Inside another app holding a lane (Dub): pay someone, now, within the
   * lane: the invoice request signed under it and sent; the answer, then
   * the claim, as Damgar does. `fulfils`: an offer followed (a purchase from
   * a lone seller names no claim, Money rule 18), or none (a tip, to the
   * payee's pointer). `referral`: the repost followed (Money claim field 6).
   */
  payUnderLane(a: { payee: string; amount: Amount; whatFor: string | null; fulfils?: string | null; refs?: [string, string][]; referral?: { identity: string; evidence: string } | null }): Promise<{ key: string; lines: Line[] }> {
    return this.serial(async () => {
      if (!this.opts.app) throw new Error('Damgar signs a payment from To sign.');
      const { me, s, book } = await this.ctx();
      const acc = this.acceptedSet(await this.accepted(me));
      for (const h of [SPEC.payment, MESSAGES_SPEC, a.amount.unit]) if (!acc.has(h)) throw new Error(`${labelOf(h) ?? 'Its unit'} is not accepted for this identity (set in Damgar’s Settings). Nothing was signed.`);
      const p = await this.bind(me, s, book, { payee: a.payee, amount: a.amount, fulfils: a.fulfils ?? null, whatFor: a.whatFor, answers: null, draft: null, ticket: null, referral: a.referral ?? null, refs: a.refs });
      await this.saveBook(me.id, book);
      return { key: p.key, lines: [{ text: `Asked of ${short(a.payee)}, under the lane: an invoice request for ${say(a.amount, acc)}, sealed. When they answer, pay it in your wallet.`, tone: 'ok' }] };
    });
  }

  // ------------------------------------------------------------ Pay

  /**
   * The proof pasted back, from the person's own wallet: on Lightning the
   * preimage; on-chain the transaction's id. Checked by the rail Module's
   * rule; then the payment claim (Money type 3) is signed at once (Money
   * rule 29, client conformance: the claim written at payment) and sent to
   * the payee, sealed. On-chain, a claim at payment (pending), and a second
   * once the payment counts (F203): `recheck`.
   */
  paid(key: string, proof: string): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const p = book.payments[key];
      if (!p || p.side !== 'out' || (p.stage !== 'to pay' && p.stage !== 'paid') || !p.bound || p.bound.kind === 'refused') throw new Error('No payment is waiting there.');
      const f = readCommitmentFields(b64(p.commitment));
      let rail: Uint8Array;
      let verdict: Verdict;
      if (p.bound.kind === 'invoice') {
        const pre = proof.trim().toLowerCase();
        if (!/^[0-9a-f]{64}$/.test(pre)) throw new Error('The proof of a Lightning payment is its preimage: 64 hexadecimal characters, as your wallet shows it once paid. Nothing was signed.');
        rail = lightningProof(p.bound.invoice, unhex(pre)) as Uint8Array;
        verdict = railCheck(p.rail, p.key, p.amount, b64(p.address), rail, null) as Verdict;
        if (verdict.answer !== 'valid') throw new Error(`The Lightning rail Module’s rule says ${verdict.answer}: ${verdict.why}. Nothing was signed.`);
        p.preimage = pre;
      } else {
        const txid = proof.trim().toLowerCase();
        if (!/^[0-9a-f]{64}$/.test(txid)) throw new Error('The proof of an on-chain payment starts with its transaction’s id: 64 hexadecimal characters, as your wallet shows it. Nothing was signed.');
        const built = await this.onchainRail(p, txid);
        rail = built.rail;
        verdict = built.verdict;
        if (verdict.answer === 'invalid') throw new Error(`The on-chain rail Module’s rule says invalid: ${verdict.why}. Nothing was signed.`);
        p.onchain = { txid };
      }
      const proofBytes = paymentProof({ paidTo: f.paidTo, salt: f.salt, rail }) as Uint8Array;
      const made = moneyPayload({ type: 'claim', rail: p.rail, proof: proofBytes, payee: p.other, amount: p.amount, fulfils: p.fulfils, referral: p.referral ?? undefined }) as { type: number; payload: Uint8Array };
      const claim = await this.deliver(me, s, book, MONEY, made.type, made.payload, p.other, undefined, await this.claimHow(me, s, p, made));
      p.claims.push(claim);
      p.stage = 'paid';
      if (p.request && book.requestsIn[p.request]) book.requestsIn[p.request].stage = 'paid';
      await this.saveBook(me.id, book);
      const acc = this.acceptedSet(await this.accepted(me));
      return {
        lines: [
          { text: `The rail Module’s rule says ${verdict.answer}${verdict.why ? ` (${verdict.why})` : ''}.`, tone: verdict.answer === 'valid' ? 'ok' : 'warn' },
          { text: `Your payment claim (“I paid ${short(p.other)} ${say(p.amount, acc)}”, with the rail’s proof) is signed and sent to them, sealed. Their Damgar checks it and offers them the receipt.`, tone: 'ok' },
        ],
      };
    });
  }

  /** A claim is signed as its payment's invoice request was: under the same lane, still in force and within it, or by hand. */
  private async claimHow(me: TestIdentity, s: Settings, p: Payment, made: { type: number; payload: Uint8Array }): Promise<How> {
    if (p.how?.by !== 'lane') {
      if (this.opts.app) throw new Error(`${this.opts.app} signs only under a lane. Nothing was signed.`);
      return { by: 'hand' };
    }
    const f = await this.laneFor(me, s, MONEY, made.type, made.payload, this.opts.app ? 'app' : 'payouts');
    if ('why' in f) throw new Error(`${f.why}. Nothing was signed: sign the claim in Damgar instead.`);
    return { by: 'lane', grant: f.lane.grant };
  }

  /** The on-chain rail proof for a transaction the person sent: its output paying the payment's address, and its block, from the chain followed. */
  private async onchainRail(p: Payment, txid: string): Promise<{ rail: Uint8Array; verdict: Verdict; confirmations: number }> {
    if (p.bound?.kind !== 'request') throw new Error('not an on-chain payment');
    const request = b64(p.bound.request);
    const to = onchainPayTo(b64(p.address), p.key) as { script: string; address: string };
    const chain = this.opts.chain;
    if (!chain) {
      throw new Error('This Damgar follows no chain (the web client): the transaction cannot be read or checked here. Paste its id into Damgar on your computer.');
    }
    const tx = await chain.tx(txid);
    const output = findOutput(tx.raw, to.script);
    if (output === null) throw new Error(`Transaction ${txid.slice(0, 12)}… pays nothing to ${to.address}, the address bound to this payment. Nothing was signed.`);
    const k = 6;
    let block: { index: number; branch: Uint8Array[]; headers: Uint8Array[] } | undefined;
    let have = 0;
    const headers = await chain.headers();
    if (tx.block) {
      const hs = headers.headers.slice(tx.block.height - headers.start, tx.block.height - headers.start + k);
      have = hs.length;
      block = { index: tx.block.index, branch: merkleBranch(tx.block.txids, tx.block.index) as Uint8Array[], headers: hs };
    }
    const rail = onchainProof({ request, paid: { tx: tx.raw, output, block } }) as Uint8Array;
    const verdict = railCheck(p.rail, p.key, p.amount, b64(p.address), rail, headers) as Verdict;
    return { rail, verdict, confirmations: have };
  }

  /** On-chain: read the chain again; once the payment counts, a second claim with the whole proof (F203; the Module's client conformance 7). */
  recheck(key: string): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const p = book.payments[key];
      if (!p || p.side !== 'out' || !p.onchain) throw new Error('No on-chain payment of yours is there.');
      const built = await this.onchainRail(p, p.onchain.txid);
      if (built.verdict.answer !== 'valid') return { lines: [{ text: `Not yet: ${built.verdict.answer}, ${built.verdict.why} (${built.confirmations} of 6 confirmations on the chain followed).`, tone: 'warn' }] };
      const f = readCommitmentFields(b64(p.commitment));
      const proofBytes = paymentProof({ paidTo: f.paidTo, salt: f.salt, rail: built.rail }) as Uint8Array;
      const made = moneyPayload({ type: 'claim', rail: p.rail, proof: proofBytes, payee: p.other, amount: p.amount, fulfils: p.fulfils, referral: p.referral ?? undefined }) as { type: number; payload: Uint8Array };
      p.claims.push(await this.deliver(me, s, book, MONEY, made.type, made.payload, p.other, undefined, await this.claimHow(me, s, p, made)));
      await this.saveBook(me.id, book);
      return { lines: [{ text: 'Six confirmations on the chain followed: valid. A second claim, with the block, is signed and sent (the first, written at payment, stays pending).', tone: 'ok' }] };
    });
  }

  // ------------------------------------------------------------ the receipt

  /** A verifier holding this identity's chain, each counterpart's chain and public acts, and every act kept. */
  private async judge(me: TestIdentity, s: Settings, book: Book, others: string[]): Promise<Lookup> {
    const l = await lookUp(me.id, me.f.homes.map((h) => h.hint), s.via);
    const hints = [...me.f.homes.map((h) => h.hint), ...s.relays];
    await this.actsOf(me.id, [...s.relays, ...hints], s.via, l);
    for (const o of list(others)) {
      try {
        const x = await lookUp(o, hints, s.via, l.verifier);
        const outbox = x.routes.routes.filter((r) => (r.kind ?? 0) === 0).flatMap((r) => r.hints);
        await this.actsOf(o, [...outbox, ...x.resolution.homes.map((h) => h.hint)], s.via, l);
      } catch {
        // that identity was not found: what rests on it is unknown
      }
    }
    for (const [id, k] of Object.entries(book.acts)) {
      try {
        if (k.key) l.verifier.addWithKey(b64(k.act), b64(k.key));
        else l.verifier.add(b64(k.act));
      } catch {
        void id;
      }
    }
    return l;
  }

  private async judgeOpts(me: TestIdentity) {
    const acc = this.acceptedSet(await this.accepted(me));
    const chain = this.opts.chain ? await this.opts.chain.headers().catch(() => null) : null;
    return { money: MONEY, accepted: [...acc], chain: chain ? { network: chain.network, start: chain.start, headers: chain.headers } : undefined };
  }

  /** The payee signs the settlement receipt (Money type 2) for a payment whose claim verifies (payment cMIP, "Delivery"), by hand. */
  signReceipt(key: string): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const p = book.payments[key];
      if (!p || p.side !== 'in' || !p.claims.length) throw new Error('No payment to you is waiting there.');
      const lines = await this.receiptOf(me, s, book, p, { by: 'hand' });
      await this.saveBook(me.id, book);
      return { lines };
    });
  }

  /**
   * The receipt for a payment to this identity: its claim checked from the
   * rail's own evidence first, then the receipt signed (by hand, or under
   * the receipts lane), sent sealed to the payer; then, where the payment
   * follows one of this identity's offers, the sale told to its own Dub
   * (type 6), and a referral share its claim names prepared for payment
   * (F351). Inside `serial`; `how` null: Damgar itself, under its lane, or
   * nothing done.
   */
  private async receiptOf(me: TestIdentity, s: Settings, book: Book, p: Payment, how: How | null): Promise<Line[]> {
    const l = await this.judge(me, s, book, [p.other]);
    const opts = await this.judgeOpts(me);
    const claim = p.claims.find((c) => (l.verifier.moneyJudge(c, opts) as { rail: Verdict }).rail.answer === 'valid');
    if (!claim) {
      if (!how) return [];
      const j = l.verifier.moneyJudge(p.claims[p.claims.length - 1], opts) as { rail: Verdict; standing: string };
      throw new Error(`Their claim does not verify yet: ${j.rail.answer}${j.rail.why ? `, ${j.rail.why}` : ''} (its standing: ${j.standing}). No receipt was signed.`);
    }
    const c = (moneyRead(3, this.opened(book, claim).payload) as { act: { rail: string; proof: Uint8Array; amount: Amount; fulfils: string; referral?: { identity: string; evidence: string } | null } }).act;
    const made = moneyPayload({ type: 'receipt', rail: c.rail, proof: new Uint8Array(c.proof), payer: p.other, payee: me.id, amount: c.amount, fulfils: c.fulfils }) as { type: number; payload: Uint8Array };
    const as = how ?? (await this.payeeAuto(me, s, MONEY, made.type, made.payload));
    if (!as) return [];
    const receipt = await this.deliver(me, s, book, MONEY, made.type, made.payload, p.other, undefined, as);
    p.receipts.push(receipt);
    p.stage = 'settled';
    const acc = opts.accepted.length ? new Set(opts.accepted) : new Set<string>();
    const lines: Line[] = [{ text: `${as.by === 'lane' ? 'Damgar checked their claim from the rail’s own evidence and signed your receipt by itself, under your receipts lane' : 'Their claim verifies from the rail’s own evidence. Your receipt is signed'} (“I received ${say(p.amount, acc)} from ${short(p.other)}”), and sent to them, sealed.`, tone: 'ok' }];
    lines.push(...(await this.afterSale(me, s, book, p, receipt, c)));
    return lines;
  }

  /** A seller's offer this identity signed, read from its places: what it sells, its price, its words. */
  private async offerOf(me: TestIdentity, s: Settings, id: string): Promise<{ publication: string; price: Amount; words: string | null } | null> {
    const { acts } = await this.payee(me.id, me, s);
    const d = acts.get(id);
    if (!d || d.signer !== me.id || d.spec !== MIRS.agreements || d.type !== AGREEMENTS_TYPES.offer || !d.payload) return null;
    try {
      const m = cborDecode(d.payload) as Map<number, unknown>;
      const sold = (m.get(1) as unknown[][]).find((x) => x[0] === 0);
      const price = m.get(2) as [Uint8Array, number];
      if (!sold || !(sold[1] instanceof Uint8Array)) return null;
      return { publication: hex(sold[1] as Uint8Array), price: { unit: hex(price[0]), value: Number(price[1]) }, words: typeof m.get(4) === 'string' ? (m.get(4) as string) : null };
    } catch {
      return null;
    }
  }

  /**
   * After a receipt following one of this identity's offers: the sale told
   * to its own Dub, sealed to itself (the money messages cMIP draft 2, type
   * 6), so Dub delivers the key; and, where the buyer's claim names a repost
   * the buyer followed (Money claim field 6, rule 20) and the offer's words
   * promise a referral share, that share prepared for payment to the
   * reposter, a draft of Damgar's own (F351: a promise in words, not judged;
   * the judged form is a one-party agreement with a split plan, round 3).
   */
  private async afterSale(me: TestIdentity, s: Settings, book: Book, p: Payment, receipt: string, c: { amount: Amount; fulfils: string; referral?: { identity: string; evidence: string } | null }): Promise<Line[]> {
    const lines: Line[] = [];
    const offer = await this.offerOf(me, s, c.fulfils).catch(() => null);
    if (!offer) return lines;
    const save = () => this.store.saveIdentity(me);
    const sale = await sendToSelf(me, TYPES.sale, salePayload({ offer: c.fulfils, buyer: p.other, receipt, publication: offer.publication }), { via: s.via, save });
    (book.sales ??= {})[receipt] = sale.id;
    lines.push({ text: `A sale of your offer ${short(c.fulfils)}: told to your own Dub, sealed to yourself, which delivers the key to ${short(p.other)}.`, tone: 'ok' });
    const share = referralShare(offer.words);
    if (!c.referral || share === null) return lines;
    const why = await this.repostProblem(me, s, c.referral, offer.publication);
    if (why) {
      lines.push({ text: `The buyer names a repost they followed, but ${why}: no referral share is prepared.`, tone: 'warn' });
      return lines;
    }
    const amount = { unit: c.amount.unit, value: Math.floor((c.amount.value * share) / 100) };
    if (amount.value <= 0) return lines;
    const draft = await sendToSelf(
      me,
      TYPES.draft,
      draftPayload({ what: 'pay', other: c.referral.identity, amount, whatFor: `referral share, ${share}% of a sale of your offer`, app: 'Damgar (a referral share)', anchor: null }),
      { refs: [[c.referral.evidence, c.referral.identity]], via: s.via, save },
    );
    (book.referrals ??= {})[p.claims[p.claims.length - 1]] = { reposter: c.referral.identity, evidence: c.referral.evidence, amount, draft: draft.id };
    lines.push({ text: `The buyer followed a repost by ${short(c.referral.identity)}: your offer promises ${share}% to the reposter. Its payment is prepared (${say(amount, new Set([amount.unit]))}): Damgar signs it by itself under your referral lane, or it waits in To sign. A promise in words, not judged by the core (F351).`, tone: 'ok' });
    return lines;
  }

  /** Why a referral's evidence is no repost of this publication by its referrer, or null. */
  private async repostProblem(me: TestIdentity, s: Settings, r: { identity: string; evidence: string }, publication: string): Promise<string | null> {
    try {
      const l = await lookUp(r.identity, [...me.f.homes.map((h) => h.hint), ...s.relays], s.via);
      const outbox = l.routes.routes.filter((x) => (x.kind ?? 0) === 0).flatMap((x) => x.hints);
      const acts = await this.actsOf(r.identity, [...outbox, ...l.resolution.homes.map((h) => h.hint), ...s.relays], s.via, l);
      const d = acts.get(r.evidence);
      if (!d) return 'the repost it names was not found at the reposter’s places';
      if (d.signer !== r.identity || !(d.refs ?? []).includes(publication)) return 'the act it names is no repost of this publication by its referrer';
      if (l.verifier.status(r.evidence) !== 'valid') return 'the repost does not count';
      return null;
    } catch (e) {
      return `the reposter was not found (${message(e)})`;
    }
  }

  /**
   * What Damgar does by itself after a look (round 2, 2b), unless every step
   * is followed by hand: a receipt for each payment to this identity whose
   * claim verifies, under its receipts lane and within its cap; and each
   * referral share it prepared, bound under its payouts lane. Anything it
   * may not do waits in To sign.
   */
  private async byItself(me: TestIdentity, s: Settings, book: Book, lines: Line[], problems: string[]): Promise<void> {
    if (s.manual || this.opts.app) return;
    for (const p of Object.values(book.payments)) {
      if (p.side !== 'in' || !p.claims.length || p.receipts.length) continue;
      try {
        lines.push(...(await this.receiptOf(me, s, book, p, null)));
      } catch (e) {
        problems.push(`A receipt Damgar could not sign by itself: ${message(e)}`);
      }
    }
    for (const [id, x] of Object.entries(book.drafts)) {
      if (x.stage !== 'new') continue;
      let dr: Draft;
      try {
        dr = readDraft(this.opened(book, id).payload);
      } catch {
        continue;
      }
      if (dr.app !== 'Damgar (a referral share)' || dr.what !== 'pay') continue;
      try {
        const p = await this.bind(me, s, book, { payee: dr.other, amount: dr.amount, fulfils: null, whatFor: dr.whatFor, answers: null, draft: id, ticket: null, auto: true });
        x.stage = 'signed';
        x.payment = p.key;
        lines.push({ text: `The referral share to ${short(dr.other)} is asked for by itself, under your referral lane: when they answer, it is in Pay, to pay in your wallet.`, tone: 'ok' });
      } catch (e) {
        lines.push({ text: `The referral share to ${short(dr.other)} waits in To sign (${message(e)}).` });
      }
    }
  }

  // ------------------------------------------------------------ the account

  /** Every payment, with its claims and receipts judged; requests and debts; totals per unit, never across units. */
  account(): Promise<Account> {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const acc = this.acceptedSet(await this.accepted(me));
      const shown = (a: Amount): Shown => ({ ...a, said: say(a, acc) });
      const others = [...Object.values(book.payments).map((p) => p.other), ...Object.values(book.requestsIn).map((r) => r.from), ...Object.values(book.requestsOut).map((r) => r.to)];
      const problems: string[] = [];
      let l: Lookup | null = null;
      try {
        l = await this.judge(me, s, book, others);
      } catch (e) {
        problems.push(`This identity could not be looked up: ${message(e)}`);
      }
      const opts = await this.judgeOpts(me);
      const payments: PaymentShown[] = Object.values(book.payments)
        .sort((a, b) => b.at - a.at)
        .map((p) => {
          const proofs = [...p.claims.map((a) => ['claim', a] as const), ...p.receipts.map((a) => ['receipt', a] as const)].map(([kind, act]) => {
            let j: { rail: Verdict; beside: Verdict; standing: string; signer?: string; confirmations?: [number, number] | null } = { rail: { answer: 'unknown', why: 'not judged' }, beside: { answer: 'unknown', why: '' }, standing: 'unknown' };
            try {
              if (l) j = l.verifier.moneyJudge(act, opts) as typeof j;
            } catch (e) {
              j.rail.why = message(e);
            }
            return { act, kind, by: this.who(kind === 'claim' ? (p.side === 'out' ? me.id : p.other) : p.side === 'out' ? p.other : me.id, me.id), rail: j.rail, beside: j.beside, standing: j.standing, confirmations: j.confirmations ?? null, how: this.howSaid(book, act, j.standing) };
          });
          return this.showPayment(p, me.id, acc, proofs);
        });
      const asks = [
        ...Object.entries(book.requestsIn).map(([id, x]) => {
          const r = this.requestOf(book, id);
          return { id, side: 'in' as const, other: this.who(x.from, me.id), amount: shown(r?.amount ?? { unit: '', value: 0 }), whatFor: r?.whatFor ?? null, state: { new: 'asked of you, not answered', declined: 'declined', debt: 'accepted as a debt by you, not paid', asked: 'being paid', paid: 'paid' }[x.stage], obligation: x.obligation, lines: x.obligation ? [{ text: DEBT_SAY, tone: 'warn' as const }] : [] };
        }),
        ...Object.entries(book.requestsOut).map(([id, x]) => {
          const r = this.requestOf(book, id);
          const paid = x.payment ? book.payments[x.payment] : null;
          return { id, side: 'out' as const, other: this.who(x.to, me.id), amount: shown(r?.amount ?? { unit: '', value: 0 }), whatFor: r?.whatFor ?? null, state: paid ? (paid.receipts.length ? 'paid, receipt signed' : paid.claims.length ? 'paid, by their claim' : 'being paid') : x.obligation ? 'accepted by them as a debt (signed), not paid' : 'asked, not paid yet', obligation: x.obligation, lines: x.obligation ? [{ text: DEBT_SAY, tone: 'warn' as const }] : [] };
        }),
      ];
      const valid = (ps: PaymentShown['proofs']) => ps.some((x) => x.rail.answer === 'valid');
      const inn = payments.filter((p) => p.side === 'in' && valid(p.proofs)).map((p) => p.amount);
      const out = payments.filter((p) => p.side === 'out' && valid(p.proofs)).map((p) => p.amount);
      const pending = payments.filter((p) => !valid(p.proofs) && p.stage !== 'refused' && p.stage !== 'declined').map((p) => p.amount);
      const owedYou = asks.filter((a) => a.side === 'out' && !/^paid/.test(a.state)).map((a) => a.amount);
      const owedBy = asks.filter((a) => a.side === 'in' && /not paid|not answered/.test(a.state)).map((a) => a.amount);
      const t = (label: string, xs: Shown[]) => ({ label, amounts: totals(xs.filter((x) => x.unit)).map(shown) });
      return {
        totals: [t('Came in (verified)', inn), t('Went out (verified)', out), t('Pending', pending), t('Asked of others, not paid', owedYou), t('Asked of you, not paid', owedBy)],
        payments,
        asks,
        problems,
        notes: ACCOUNT_NOTES,
      };
    });
  }

  /** How an act was signed, in words (round 2, 2b): by hand, by Damgar itself, under a lane (named), or, for another's act, on whose authority. */
  private howSaid(book: Book, act: string, standing: string): string {
    const h = book.how?.[act];
    if (h?.by === 'hand') return 'signed by hand';
    if (h?.by === 'itself') return 'signed by Damgar itself (an address bound to the payment, as in round 1)';
    if (h?.by === 'lane') return `signed under the lane “${book.lanes?.[h.grant]?.label ?? `${h.grant.slice(0, 8)}…`}”`;
    const theirs = book.authorities?.[act];
    if (theirs) return theirs;
    return standing === 'scoped' ? 'signed under a grant: unknown to a Money-only reading' : 'signed with its signer’s own key';
  }

  private showPayment(p: Payment, me: string, acc: Set<string>, proofs: PaymentShown['proofs']): PaymentShown {
    const amount: Shown = { ...p.amount, said: say(p.amount, acc) };
    let pay: PaymentShown['pay'] = null;
    if (p.side === 'out' && (p.stage === 'to pay' || p.stage === 'paid') && p.bound && p.bound.kind !== 'refused') {
      if (p.bound.kind === 'invoice') pay = { invoice: p.bound.invoice, amount };
      else pay = { address: (onchainPayTo(b64(p.address), p.key) as { address: string }).address, amount };
    }
    const f = p.commitment ? readCommitmentFields(b64(p.commitment)) : null;
    const said: Record<Payment['stage'], string> = {
      asked: p.side === 'out' ? 'invoice requested, waiting for their answer' : 'asked to be bound',
      'to pay': p.side === 'out' ? 'ready to pay, in your wallet' : 'bound, waiting for their payment',
      refused: 'refused',
      paid: p.side === 'out' ? 'paid: your claim sent, waiting for their receipt' : 'paid by their claim: check it and sign the receipt',
      settled: 'settled: claim and receipt',
      declined: 'declined',
    };
    const lines: Line[] = [];
    if (p.bound?.kind === 'refused') lines.push({ text: `Refused: ${p.bound.why}`, tone: 'warn' });
    if (p.rail === SPEC.onchain.hash && !this.opts.chain) lines.push({ text: 'Paid, not yet checked against the chain: the web client follows none.', tone: 'warn' });
    if (p.rail === SPEC.onchain.hash && this.opts.chain) lines.push({ text: `Checked against ${this.opts.chain.said}.` });
    return {
      key: p.key,
      side: p.side,
      other: this.who(p.other, me),
      amount,
      rail: p.rail,
      railName: railName(p.rail),
      whatFor: p.whatFor,
      to: f?.paidTo.kind ?? 'flow',
      stage: p.stage,
      stageSaid: said[p.stage],
      pay,
      proofs,
      lines,
      at: p.at,
      ticket: p.ticket ? { batch: p.ticket.batch, deadline: p.ticket.deadline, tier: p.ticket.tier, checked: p.ticket.checked !== false } : null,
    };
  }

  /** Pay: the payments of this identity waiting to be paid or checked again. */
  pay(): Promise<{ payments: PaymentShown[] }> {
    return this.serial(async () => {
      const { me, book } = await this.ctx();
      const acc = this.acceptedSet(await this.accepted(me));
      return {
        payments: Object.values(book.payments)
          .filter((p) => p.side === 'out' && (p.stage === 'to pay' || p.stage === 'asked' || (p.stage === 'paid' && !!p.onchain)))
          .sort((a, b) => b.at - a.at)
          .map((p) => this.showPayment(p, me.id, acc, [])),
      };
    });
  }

  // ------------------------------------------------------------ lanes (F338 round 2, F351)

  /** A lane's grant in plain words, read back before it is signed: what it reaches, how much one act may move, until when, who holds its key. */
  private laneWords(me: TestIdentity, g: { label: string; app: string; kinds: LaneKind[]; limits: Limits | null }, acc: Set<string>): string[] {
    const read: GrantRead = { grantee: me.id, scope: 2, kinds: g.kinds, limits: g.limits, limitsProblem: null, key: '' };
    const kindSaid = (k: LaneKind) =>
      k.spec === MONEY && k.type === 2 ? 'receipts (“I received this”)' : k.spec === MONEY && k.type === 3 ? 'payment claims (“I paid this”)' : MESSAGES_SPECS.includes(k.spec) && k.type === 3 ? 'invoice requests (asking a payee where to pay)' : MESSAGES_SPECS.includes(k.spec) && k.type === 4 ? 'answers to invoice requests (an invoice, or an address)' : `acts of type ${k.type} of ${k.spec.slice(0, 8)}…`;
    const out = [
      `A lane named “${g.label}”, asked by ${g.app}: a grant of this identity to itself (Agreements draft 15, rule 73, F351), naming a key that ${g.app} made and holds. With it, ${g.app} signs in your name, by itself, without opening Damgar, within these limits only.`,
      `What it may sign: ${g.kinds.map(kindSaid).join('; ')}. Nothing else: never a grant, a revocation, a pointer, a debt or a post.`,
      g.limits?.cap ? `How much one act may move: at most ${say({ unit: g.limits.cap.unit, value: g.limits.cap.value }, acc)} (the grant limits cMIP, 2). An act above it is refused before it is signed, and one signed anyway counts for nothing.` : 'How much one act may move: no cap. A lane without a cap is refused here.',
      g.limits?.expiry?.clock === 'timestamp' ? grantInWords(read, me.id, short).find((l) => l.startsWith('Until')) ?? '' : 'Until: no expiry; it ends only when you revoke it.',
      'Every act signed under it is shown, here and to every reader, as signed under this lane, not with your own key. One revocation ends it, here in Lanes.',
      'Public: the grant is published at your relays and homes (rule 73: a private grant backs nothing), so anyone can see that you hold such a lane, and its limits. Its name stays here.',
    ];
    return out.filter(Boolean);
  }

  /** Sign a lane's grant (to oneself) and its acceptance, with the signing key, public, at the relays and homes. */
  private async grantLaneActs(me: TestIdentity, s: Settings, g: { key: string; kinds: LaneKind[]; limits: Limits | null }): Promise<string> {
    await this.current(me);
    const payload = personGrantPayload({ grantee: me.id, kinds: g.kinds as Kind[], limits: g.limits ?? undefined, key: [1, unhex(g.key)] });
    let grant: { act: Uint8Array; id: string };
    let acc: { act: Uint8Array; id: string };
    try {
      grant = me.sign(MIRS.agreements, AGREEMENTS_TYPES.grant, payload, { public: true });
      const a = acceptance(grant.id);
      acc = me.sign(a.spec, a.type, a.payload, { public: true, objects: a.objects });
    } finally {
      await this.store.saveIdentity(me);
    }
    let left = 0;
    for (const h of list([...s.relays, ...me.f.homes.map((x) => x.hint)])) {
      try {
        await relayAt(h, s.via).putAct(grant.act);
        await relayAt(h, s.via).putAct(acc.act);
        left++;
      } catch {
        // that place is away
      }
    }
    if (!left) throw new Error('No relay or home took the lane’s grant. It was signed here; grant it again later.');
    return grant.id;
  }

  private laneLimits(cap: Amount, until: number | null, clock: string | null): Limits {
    if (!Number.isSafeInteger(cap.value) || cap.value <= 0) throw new Error('A lane needs a cap per act, a whole amount above zero.');
    const l: Limits = { cap: { unit: cap.unit, value: cap.value } };
    if (until !== null) {
      if (!clock) throw new Error('An expiry is judged on a timestamp clock: name one in Settings (its ID), or leave Until empty.');
      l.expiry = { clock: 'timestamp', identity: clock, time: until };
    }
    encodeLimits(l);
    return l;
  }

  /** A lane asked by an app, read in plain words (To sign). */
  private laneItem(me: TestIdentity, book: Book, id: string, acc: Set<string>): ToSign {
    const r = readLaneRequest(this.opened(book, id).payload);
    const x = book.laneRequests![id];
    let limits: Limits | null = null;
    const lines: Line[] = [];
    try {
      limits = r.limits === null ? null : readLimits(r.limits);
    } catch (e) {
      lines.push({ text: `Its limits cannot be read (${message(e)}): it cannot be granted.`, tone: 'warn' });
    }
    const unknown = !acc.has(GRANT_LIMITS_SPEC) || !limits?.cap;
    if (!acc.has(GRANT_LIMITS_SPEC)) lines.push({ text: 'Lanes carry their limits under the grant limits cMIP, which you do not accept: accept it in Settings to grant a lane.', tone: 'warn' });
    lines.unshift(...this.laneWords(me, { label: r.label, app: r.app, kinds: r.kinds, limits }, acc).map((text) => ({ text })));
    return { id, kind: 'lane', from: this.who(me.id, me.id), app: r.app, title: `A lane asked by ${r.app}: “${r.label}”`, lines, amount: limits?.cap ? { unit: limits.cap.unit, value: limits.cap.value, said: say({ unit: limits.cap.unit, value: limits.cap.value }, acc) } : null, unknown, offers: unknown ? ['decline'] : ['grant', 'decline'], found: x.found };
  }

  /** Grant a lane an app asked for: its grant to oneself, naming the key the app holds, and the acceptance, signed here (F351). */
  grantLane(id: string): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const x = book.laneRequests?.[id];
      if (!x || x.stage !== 'new') throw new Error('No lane is waiting there.');
      const acc = this.acceptedSet(await this.accepted(me));
      const item = this.laneItem(me, book, id, acc);
      if (item.unknown) throw new Error('It cannot be granted here: nothing was signed.');
      const r = readLaneRequest(this.opened(book, id).payload);
      const limits = readLimits(r.limits);
      const grant = await this.grantLaneActs(me, s, { key: r.key, kinds: r.kinds, limits });
      (book.lanes ??= {})[grant] = { label: r.label, app: r.app, key: r.key, kinds: r.kinds, limits, at: now(), revoked: null, here: false, role: null };
      x.stage = 'granted';
      x.grant = grant;
      await this.saveBook(me.id, book);
      return { lines: [{ text: `The lane “${r.label}” is granted: public at your relays and homes. ${r.app} finds it there and signs within it from now on. Revoke it in Lanes at any time.`, tone: 'ok' }] };
    });
  }

  /**
   * A lane Damgar holds itself (round 2, 2b): `receipts`, signing receipts
   * for payments it verified and answering invoice requests by itself;
   * `payouts`, signing the invoice requests and claims of referral shares it
   * owes. Read back first; nothing is signed until `ownLane` with the digest.
   */
  async ownLaneReview(a: { role: LaneRole; cap: string; unit: string; until?: number | null }): Promise<{ digest: string; lines: Line[] }> {
    const { me, s } = await this.ctx();
    const acc = this.acceptedSet(await this.accepted(me));
    const limits = this.laneLimits({ unit: a.unit, value: Number(String(a.cap).replace(/[\s_]/g, '')) }, a.until ?? null, s.clock ?? null);
    const g = this.ownLaneShape(a.role, limits);
    return { digest: await digestOf(JSON.stringify({ me: me.id, a })), lines: this.laneWords(me, g, acc).map((text) => ({ text })) };
  }

  private ownLaneShape(role: LaneRole, limits: Limits) {
    return role === 'receipts'
      ? { label: 'Damgar: receipts and invoices by itself', app: 'Damgar', kinds: [{ spec: MONEY, type: 2 }, { spec: MESSAGES_SPEC, type: TYPES.answer }], limits }
      : { label: 'Damgar: referral shares by itself', app: 'Damgar', kinds: [{ spec: MESSAGES_SPEC, type: TYPES.invoiceRequest }, { spec: MONEY, type: 3 }], limits };
  }

  ownLane(a: { role: LaneRole; cap: string; unit: string; until?: number | null; digest: string }): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const { digest: _, ...rest } = a;
      if ((await digestOf(JSON.stringify({ me: me.id, a: rest }))) !== a.digest) throw new Error('This is not what was read back: read it again.');
      const limits = this.laneLimits({ unit: a.unit, value: Number(String(a.cap).replace(/[\s_]/g, '')) }, a.until ?? null, s.clock ?? null);
      const g = this.ownLaneShape(a.role, limits);
      const k = makeGrantKey();
      const keys = await this.keys(me.id);
      const grant = await this.grantLaneActs(me, s, { key: hex(k.public[1]), kinds: g.kinds, limits });
      keys.lanes = [...(keys.lanes ?? []), { grant, label: g.label, secret: hex(k.secret), strand: [], kinds: g.kinds, limits, role: a.role }];
      await this.store.write(me.id, 'keys', keys);
      (book.lanes ??= {})[grant] = { label: g.label, app: 'Damgar', key: hex(k.public[1]), kinds: g.kinds, limits, at: now(), revoked: null, here: true, role: a.role };
      await this.saveBook(me.id, book);
      return { lines: [{ text: `“${g.label}” is granted: Damgar signs within it by itself while “Follow every step by hand” is off.`, tone: 'ok' }] };
    });
  }

  /**
   * What revoking a lane does, read back before it is signed (F352): the
   * revocation cites every act signed under the lane that the identity's
   * places hold, so each payee, holding only its own act, finds it counted;
   * its cost said: the public revocation lists every act's id, a long lane
   * makes a long revocation, and an act held nowhere Damgar reads is voided.
   */
  revokeLaneReview(grant: string): Promise<{ lines: Line[]; acts: number }> {
    return this.serial(async () => {
      const { me, s, book, hints } = await this.ctx();
      const l = book.lanes?.[grant];
      if (!l) throw new Error('No lane of this identity, granted here, is that one.');
      if (l.revoked) throw new Error('That lane is revoked already.');
      const under = await actsUnder(me.id, grant, hints, s.via).catch(() => []);
      return { acts: under.length, lines: [...REVOKE_SAY(l.label, under.length).map((text) => ({ text })), { text: REVOKE_COST, tone: 'warn' as const }] };
    });
  }

  /** Revoke a lane (Agreements type 10, an everyday act, public): one act ends it (rule 76). */
  revokeLane(grant: string): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const l = book.lanes?.[grant];
      if (!l) throw new Error('No lane of this identity, granted here, is that one.');
      if (l.revoked) throw new Error('That lane is revoked already.');
      await this.current(me);
      // Its history holds every act signed under the lane that its places hold, each cited (Agreements rule 76: an act the revocation's history holds binds; one racing it is void). The lane's sealed acts are named by their ids, their insides unread.
      const { hints } = await this.ctx();
      const under = await actsUnder(me.id, grant, hints, s.via).catch(() => []);
      let r: { act: Uint8Array; id: string };
      try {
        r = me.sign(MIRS.agreements, REVOCATION, revocationPayload(grant), { public: true, objects: under.length ? under.map((a): [string, string] => [me.id, a.id]) : undefined });
      } finally {
        await this.store.saveIdentity(me);
      }
      let left = 0;
      for (const h of list([...s.relays, ...me.f.homes.map((x) => x.hint)])) {
        try {
          await relayAt(h, s.via).putAct(r.act);
          left++;
        } catch {
          // away
        }
      }
      if (!left) throw new Error('No relay or home took the revocation. Revoke it again later.');
      l.revoked = r.id;
      if (l.here) {
        const keys = await this.keys(me.id);
        keys.lanes = (keys.lanes ?? []).filter((x) => x.grant !== grant);
        await this.store.write(me.id, 'keys', keys);
      }
      await this.saveBook(me.id, book);
      return { lines: [{ text: `“${l.label}” is revoked, published at ${left} place${left === 1 ? '' : 's'}: an act signed under it after this counts for nothing. It cites the ${under.length} act${under.length === 1 ? '' : 's'} signed under it that its places hold, which keep counting; one held nowhere it reads would not (Agreements rule 76).`, tone: 'ok' }] };
    });
  }

  /** Every lane granted here, in plain words, with every act signed under it that its homes and relays hold. */
  lanes(): Promise<{ lanes: LaneShown[]; manual: boolean; link: boolean; linkSay: string[]; clock: string | null }> {
    return this.serial(async () => {
      const { me, s, book, hints } = await this.ctx();
      const acc = this.acceptedSet(await this.accepted(me));
      const keys = await this.keys(me.id);
      const out: LaneShown[] = [];
      for (const [grant, l] of Object.entries(book.lanes ?? {}).sort((a, b) => b[1].at - a[1].at)) {
        let acts: LaneShown['acts'] = [];
        let revoked = l.revoked;
        try {
          if (!revoked) revoked = (await revocationsOf(me.id, grant, hints, s.via))[0] ?? null;
          acts = (await actsUnder(me.id, grant, hints, s.via)).map((a) => ({ id: a.id, said: this.actSaid(book, a) }));
        } catch {
          // the places did not answer
        }
        const expired = l.limits?.expiry?.clock === 'timestamp' && now() > l.limits.expiry.time;
        out.push({ grant, label: l.label, app: l.app, here: l.here, state: revoked ? 'revoked' : expired ? 'past its expiry (this device’s clock)' : 'in force', words: this.laneWords(me, l, acc), acts });
      }
      void keys;
      return { lanes: out, manual: !!s.manual, link: !!keys.link, linkSay: LINK_SAY, clock: s.clock ?? null };
    });
  }

  private actSaid(book: Book, a: { id: string; public: boolean; spec?: string; type?: number }): string {
    const k = book.acts[a.id];
    let spec = a.spec;
    let type = a.type;
    if (k?.key) {
      try {
        const d = openWithKey(b64(k.act), b64(k.key)) as Described;
        spec = d.spec;
        type = d.type;
      } catch {
        // kept, but not opened here
      }
    }
    if (spec === MONEY && type === 2) return 'a receipt';
    if (spec === MONEY && type === 3) return 'a payment claim';
    if (spec && MESSAGES_SPECS.includes(spec) && type === TYPES.invoiceRequest) return 'an invoice request';
    if (spec && MESSAGES_SPECS.includes(spec) && type === TYPES.answer) return 'an answer to an invoice request';
    return a.public ? 'a public act' : 'a private act, sealed (its kind is read by its recipient only)';
  }

  /** Follow every step by hand (round 2, 2b): off by default. */
  setManual(on: boolean): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      await this.store.write(me.id, 'settings', { ...s, manual: on });
      return {
        lines: [
          on
            ? { text: 'Every step by hand: every signature waits for you, as in round 1. No lane held here signs; invoices and addresses wait for you to answer them. Lanes held by other apps (Dub) still sign there: revoke them in Lanes to stop them.', tone: 'ok' }
            : { text: 'Damgar signs by itself again, within the lanes it holds.', tone: 'ok' },
        ],
      };
    });
  }

  /** The timestamp clock a lane's expiry is judged on (its identity), or none. */
  setClock(clock: string): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      const c = clock.trim().toLowerCase();
      if (c && !/^[0-9a-f]{64}$/.test(c)) throw new Error('A clock is named by its identity: 64 characters, 0 to 9 and a to f.');
      await this.store.write(me.id, 'settings', { ...s, clock: c || undefined });
      return { lines: [{ text: c ? `Lanes with an expiry are judged on the timestamp clock ${short(c)}.` : 'No clock: a lane can have no expiry.', tone: 'ok' }] };
    });
  }

  /** The receive-only link (F351): checked first (too wide a permission refused), kept owner-only beside the keys. */
  setLink(c: LinkConfig | null): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me } = await this.ctx();
      const keys = await this.keys(me.id);
      if (!c) {
        keys.link = null;
        await this.store.write(me.id, 'keys', keys);
        return { lines: [{ text: 'The link is removed: Damgar makes no invoice. You make each one in your wallet, as before.', tone: 'ok' }] };
      }
      if (!this.opts.link) throw new Error('This Damgar makes no link to a node (the web client never does). Use Damgar on your computer.');
      const link = await this.opts.link(c);
      if (await link.tooWide()) throw new Error('This permission can read your node’s balance: it is wider than making invoices. Bake one with “lncli bakemacaroon invoices:write invoices:read” and give that. Nothing was kept.');
      keys.link = c;
      await this.store.write(me.id, 'keys', keys);
      return { lines: [{ text: 'The link is kept: Damgar answers a Lightning payment to you by itself, with an invoice from your node, below your receipts lane’s cap. It can make invoices only.', tone: 'ok' }] };
    });
  }

  /**
   * The lane, held here, that reaches this act and lets it be signed now:
   * its kinds, its limits before signing (client conformance, 5.1), and no
   * revocation at the places. `role` narrows to Damgar's own lanes' purpose.
   */
  private async laneFor(me: TestIdentity, s: Settings, spec: string, type: number, payload: Uint8Array, role: LaneRole | 'app'): Promise<{ lane: Keys['lanes'] extends (infer T)[] | undefined ? T : never } | { why: string }> {
    const keys = await this.keys(me.id);
    const hints = [...new Set([...me.f.homes.map((h) => h.hint), ...s.relays])];
    let why = role === 'app' ? `${this.opts.app ?? 'This app'} holds no lane: ask Damgar for one` : 'Damgar holds no lane for this';
    for (const l of keys.lanes ?? []) {
      if (l.role !== role) continue;
      if (!reaches(l.kinds as Kind[], spec, type, (x) => (x === MONEY ? 2 : null))) {
        why = `its lane “${l.label}” does not reach this act`;
        continue;
      }
      const refused = refuseBeforeSigning(l.limits, { spec, type, payload }, MONEY, now());
      if (refused) {
        why = `“${l.label}”: ${refused}`;
        continue;
      }
      try {
        if ((await revocationsOf(me.id, l.grant, hints, s.via)).length) {
          why = `“${l.label}” was revoked. Nothing was signed`;
          continue;
        }
      } catch {
        // the places did not answer: the lane is used, and judged by every reader after
      }
      return { lane: l };
    }
    return { why };
  }

  // ------------------------------------------------------------ Settings: where you are paid

  /** The payee pointer in force, the vault (read here, changed in Kišib), the request key, the chain followed. */
  rails(): Promise<Rails> {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      const acc = this.acceptedSet(await this.accepted(me));
      const { look, acts } = await this.payee(me.id, me, s);
      const ptr = look.verifier.moneyPointer(MONEY, me.id) as { act: string | null; version: number; forked: boolean };
      let pointer: Rails['pointer'] = null;
      if (ptr.act && acts.get(ptr.act)?.payload) {
        const pp = (moneyRead(0, acts.get(ptr.act)!.payload!) as { act: { rails: { module: string; address: Uint8Array }[] } }).act;
        pointer = { act: ptr.act, version: ptr.version, forked: ptr.forked, rails: pp.rails.map((r) => ({ module: r.module, name: railName(r.module), said: railSaid(r.module, new Uint8Array(r.address)), accepted: acc.has(r.module) })) };
      }
      const v = look.verifier.moneyVault(MONEY, me.id) as { declaredBy: string; entries: { unit: string; railModule: string; source: Uint8Array; limit: number }[] } | null;
      const keys = (await this.store.read<Keys>(me.id, 'keys')) ?? { request: null, earlier: [] };
      return {
        pointer,
        vault: v
          ? {
              declaredBy: v.declaredBy,
              entries: v.entries.map((e) => ({
                unit: { unit: e.unit, value: 0, said: unitOf(e.unit)?.unit.name ?? `unit ${e.unit.slice(0, 8)}…` },
                railName: railName(e.railModule),
                limit: { unit: e.unit, value: e.limit, said: say({ unit: e.unit, value: e.limit }, acc) },
                said: e.limit === 0 ? 'every payment in this unit goes to the vault (flow off)' : `a single payment above ${say({ unit: e.unit, value: e.limit }, acc)} goes to your vault, not your flow`,
              })),
            }
          : null,
        requestKey: keys.request ? (onchainKey(unhex(keys.request)) as string) : null,
        chain: this.opts.chain ? this.opts.chain.said : 'none: the web client follows no chain, so an on-chain payment is shown paid, not yet checked against the chain',
      };
    });
  }

  /**
   * Review a new payee pointer (Money type 0): the rails in order of
   * preference, with each rail Module's stated costs (a client MUST show
   * them before a rail is declared). Nothing is signed until `publishRails`
   * with the same digest. On-chain, the request key is made here, or a new
   * one where `newRequestKey`.
   */
  async railsReview(a: { lightning?: string; onchain?: string; network: number; newRequestKey?: boolean }): Promise<{ digest: string; lines: Line[]; costs: Line[] }> {
    const { me } = await this.ctx();
    const keys = (await this.store.read<Keys>(me.id, 'keys')) ?? { request: null, earlier: [] };
    const rails = this.railsFrom(a, keys.request && !a.newRequestKey ? keys.request : null);
    const lines: Line[] = rails.map((r) => ({ text: `${railName(r.module)}: ${railSaid(r.module, r.address)}` }));
    if (!rails.length) throw new Error('Give a Lightning node key, or a Bitcoin key for the on-chain rail, or both.');
    const costs: Line[] = [];
    if (a.lightning?.trim()) costs.push(...LIGHTNING_COSTS.map((t) => ({ text: `Lightning: ${t}`, tone: 'warn' as const })));
    if (a.onchain?.trim()) costs.push(...[...REQUEST_KEY_SAY, ...ONCHAIN_COSTS].map((t) => ({ text: `On-chain: ${t}`, tone: 'warn' as const })));
    const digest = await digestOf(JSON.stringify({ me: me.id, a }));
    return { digest, lines: [...lines, { text: 'Signed with your signing key, public: anyone paying you reads it. It replaces the pointer in force; payments already bound stay as they are.' }], costs };
  }

  private railsFrom(a: { lightning?: string; onchain?: string; network: number }, requestSecret: string | null): { module: string; address: Uint8Array; requestSecret: string | null }[] {
    const out: { module: string; address: Uint8Array; requestSecret: string | null }[] = [];
    if (a.lightning?.trim()) out.push({ module: SPEC.lightning.hash, address: lightningAddress({ network: a.network, node: a.lightning.trim().toLowerCase() }) as Uint8Array, requestSecret: null });
    if (a.onchain?.trim()) {
      let key = a.onchain.trim().toLowerCase();
      if (/^0[23][0-9a-f]{64}$/.test(key)) key = key.slice(2);
      if (!/^[0-9a-f]{64}$/.test(key)) throw new Error('The Bitcoin key is an x-only key: 64 hexadecimal characters (or 66, starting 02 or 03).');
      const secret = requestSecret ?? hex(newSecret());
      out.push({ module: SPEC.onchain.hash, address: onchainAddress({ network: a.network, key, request: onchainKey(unhex(secret)) }) as Uint8Array, requestSecret: secret });
    }
    return out;
  }

  /** Publish the reviewed payee pointer: version one more than the pointer in force, naming it. */
  publishRails(a: { lightning?: string; onchain?: string; network: number; newRequestKey?: boolean; digest: string }): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s, book } = await this.ctx();
      const { digest: _, ...rest } = a;
      if ((await digestOf(JSON.stringify({ me: me.id, a: rest }))) !== a.digest) throw new Error('This is not what was reviewed: review it again.');
      await this.current(me);
      const keys = (await this.store.read<Keys>(me.id, 'keys')) ?? { request: null, earlier: [] };
      const rails = this.railsFrom(a, keys.request && !a.newRequestKey ? keys.request : null);
      const { look } = await this.payee(me.id, me, s);
      const ptr = look.verifier.moneyPointer(MONEY, me.id) as { act: string | null; version: number };
      const made = moneyPayload({ type: 'pointer', payee: me.id, version: ptr.version + 1, previous: ptr.act ?? undefined, rails: rails.map((r) => ({ module: r.module, address: r.address })) }) as { type: number; payload: Uint8Array };
      const newSecretUsed = rails.find((r) => r.requestSecret)?.requestSecret ?? null;
      if (newSecretUsed && newSecretUsed !== keys.request) {
        // Kept before the pointer leaves, so an address request naming it can always be answered.
        await this.store.write(me.id, 'keys', { request: newSecretUsed, earlier: keys.request ? [...keys.earlier, keys.request] : keys.earlier } satisfies Keys);
      }
      let act: { act: Uint8Array; id: string };
      try {
        act = me.sign(MONEY, made.type, made.payload, { public: true });
      } finally {
        await this.store.saveIdentity(me);
      }
      let left = 0;
      for (const h of list([...s.relays, ...me.f.homes.map((x) => x.hint)])) {
        try {
          await relayAt(h, s.via).putAct(act.act);
          left++;
        } catch {
          // that place is away
        }
      }
      if (!left) throw new Error('No relay or home took the payee pointer.');
      book.pointers.push(act.id);
      await this.saveBook(me.id, book);
      return { lines: [{ text: `Your payee pointer, version ${ptr.version + 1}, is published: ${rails.map((r) => railName(r.module)).join(', then ')}.${newSecretUsed && newSecretUsed !== keys.request && keys.request ? ' It names a new request key: the old one no longer counts for new payments.' : ''}`, tone: 'ok' }] };
    });
  }

  /** The relays this identity's money acts and pointer go to. */
  setRelays(relays: string[]): Promise<{ lines: Line[] }> {
    return this.serial(async () => {
      const { me, s } = await this.ctx();
      const r = list(relays);
      for (const x of r) if (!/^https?:\/\//.test(x)) throw new Error(`“${x}”: an address starts with https:// (or http://)`);
      if (!r.length) throw new Error('Give at least one relay.');
      await this.store.write(me.id, 'settings', { ...s, relays: r });
      return { lines: [{ text: `Relays: ${r.join(', ')}.`, tone: 'ok' }] };
    });
  }

  /**
   * Sign a private act addressed to one identity, seal it to its current
   * encryption key, and leave it at its inbox; the locked act goes to this
   * identity's homes too (Identity rule 35). Kept in the book, with its key,
   * and how it was signed: by hand, by Damgar itself, or under a lane whose
   * key is held here (`lane`: signed with the grant key, citing its grant,
   * on the lane's own strand; F343, F350, F351).
   */
  private async deliver(me: TestIdentity, s: Settings, book: Book, spec: string, type: number, payload: Uint8Array, to: string, refs?: [string, string][], how: How = { by: 'hand' }): Promise<string> {
    const l = await lookUp(to, [...me.f.homes.map((h) => h.hint), ...s.relays], s.via);
    if (!l.encryptionKey) throw new Error(`${short(to)} publishes no encryption key: nothing can be sealed to it. Nothing was sent.`);
    const inbox = l.inbox(spec) ?? (MESSAGES_SPECS.includes(spec) ? MESSAGES_SPECS.map((x) => l.inbox(x)).find((x) => x) : undefined) ?? [];
    if (!inbox.length) throw new Error(`${short(to)} declares no inbox: nothing can be left for it. Nothing was sent.`);
    await this.current(me);
    let made: { act: Uint8Array; id: string; key: Uint8Array };
    if (how.by === 'lane') {
      const keys = await this.keys(me.id);
      const lane = keys.lanes?.find((x) => x.grant === how.grant);
      if (!lane) throw new Error('That lane’s key is not held here. Nothing was signed.');
      try {
        made = signUnderGrant({ grant: lane.grant, grantor: me.id, secret: lane.secret, strand: lane.strand }, { spec, type, payload, public: false, to: [to], refs });
      } finally {
        // The lane's strand, kept before anything leaves.
        await this.store.write(me.id, 'keys', keys);
      }
    } else {
      try {
        made = this.signAct(me, spec, type, payload, { public: false, to: [to], refs });
      } finally {
        await this.store.saveIdentity(me);
      }
    }
    book.acts[made.id] = { act: base64(made.act), key: base64(made.key), from: me.id };
    (book.how ??= {})[made.id] = how;
    const sealed = sealFor(made.act, made.key, [{ id: to, key: l.encryptionKey }]);
    let left = 0;
    for (const h of inbox) {
      try {
        await relayAt(h, s.via).putSealed(sealed);
        left++;
      } catch {
        // that relay is away
      }
    }
    for (const h of me.f.homes.map((x) => x.hint)) {
      try {
        await relayAt(h, s.via).putAct(made.act);
      } catch {
        // that home is away
      }
    }
    if (!left) throw new Error(`${short(to)}’s inbox (${inbox.join(', ')}) took nothing. It was signed and kept here; try again later.`);
    return made.id;
  }

  /**
   * How a payer's act is signed here: inside another app (Dub), only under
   * a lane it holds, or refused saying why; in Damgar, by hand, or, for what
   * Damgar does by itself (a referral share), under its payouts lane.
   */
  private async payerHow(me: TestIdentity, s: Settings, spec: string, type: number, payload: Uint8Array, auto: boolean): Promise<How> {
    if (this.opts.app) {
      const f = await this.laneFor(me, s, spec, type, payload, 'app');
      if ('why' in f) throw new Error(`${f.why}. Nothing was signed.`);
      return { by: 'lane', grant: f.lane.grant };
    }
    if (!auto) return { by: 'hand' };
    if (s.manual) throw new Error('Every step is followed by hand here: it waits for you.');
    const f = await this.laneFor(me, s, spec, type, payload, 'payouts');
    if ('why' in f) throw new Error(f.why);
    return { by: 'lane', grant: f.lane.grant };
  }

  /** How the payee's act is signed by Damgar itself: under its receipts lane, unless every step is followed by hand. Its cap is judged on the act itself by the grant limits cMIP (`laneFor`): a receipt's amount, an answer's (draft 3, F352). Null: it waits for the person. */
  private async payeeAuto(me: TestIdentity, s: Settings, spec: string, type: number, payload: Uint8Array): Promise<How | null> {
    const f = await this.payeeLane(me, s, spec, type, payload);
    return 'why' in f ? null : f;
  }

  /** As `payeeAuto`, with why it waits. */
  private async payeeLane(me: TestIdentity, s: Settings, spec: string, type: number, payload: Uint8Array): Promise<How | { why: string }> {
    if (s.manual || this.opts.app) return { why: 'every step is followed by hand' };
    const f = await this.laneFor(me, s, spec, type, payload, 'receipts');
    if ('why' in f) return f;
    return { by: 'lane', grant: f.lane.grant };
  }
}

/** Said before a lane is revoked (F352): what the revocation does. */
export const REVOKE_SAY = (label: string, acts: number): string[] => [
  `Revoking “${label}” signs one public act: from it on, nothing signed under the lane counts.`,
  `It cites the ${acts} act${acts === 1 ? '' : 's'} signed under the lane that your homes and relays hold, each by its id, so every payment already made under it keeps counting for the one paid, who holds only their own (Agreements rule 76).`,
];

/** Its cost, stated (F352). */
export const REVOKE_COST = 'The cost: the revocation is public and lists the id of every act it cites (what each says stays sealed); a lane used long makes a long revocation; an act signed under the lane that Damgar does not find at your homes and relays is not cited, and is void from then on.';

/**
 * The referral share an offer's words promise (F351, round 2): the one
 * sentence Dub writes, "Referral: N% of the price to the repost the buyer
 * names." Null where its words promise none. A promise in words: the core
 * judges none of it.
 */
export function referralShare(words: string | null): number | null {
  const m = words?.match(/Referral: (\d{1,2})% of the price to the repost the buyer names\./);
  return m ? Number(m[1]) : null;
}

/** A rail address in words. */
function railSaid(module: string, address: Uint8Array): string {
  if (module === SPEC.lightning.hash) {
    const a = readLightningAddress(address) as { network: number; node: string } | null;
    return a ? `the node ${a.node.slice(0, 16)}… on ${NETWORKS[a.network]}` : 'an address this Module does not read';
  }
  if (module === SPEC.onchain.hash) {
    const a = readOnchainAddress(address) as { network: number; key: string; request: string } | null;
    return a ? `the Bitcoin key ${a.key.slice(0, 16)}… on ${NETWORKS[a.network]}, its requests signed by the key ${a.request.slice(0, 16)}… Damgar holds` : 'an address this Module does not read';
  }
  return 'a rail Module Damgar does not implement';
}

const NETWORKS = ['Bitcoin', 'testnet', 'signet', 'regtest'];

/** A fresh secp256k1 secret below the curve order. */
function newSecret(): Uint8Array {
  for (;;) {
    const s = new Uint8Array(randomBytes(32));
    try {
      onchainKey(s);
      return s;
    } catch {
      // out of range: draw again
    }
  }
}

async function digestOf(s: string): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** The index of the output of a transaction (without witness) whose script is `script` (hex), or null. */
export function findOutput(tx: Uint8Array, script: string): number | null {
  let p = 4;
  const varint = (): number => {
    const b = tx[p++];
    if (b < 0xfd) return b;
    const n = b === 0xfd ? 2 : b === 0xfe ? 4 : 8;
    let v = 0;
    for (let i = 0; i < n; i++) v += tx[p + i] * 2 ** (8 * i);
    p += n;
    return v;
  };
  const ins = varint();
  for (let i = 0; i < ins; i++) {
    p += 36;
    {
      const n = varint();
      p += n;
    }
    p += 4;
  }
  const outs = varint();
  for (let i = 0; i < outs; i++) {
    p += 8;
    const n = varint();
    if (hex(tx.slice(p, p + n)) === script) return i;
    p += n;
  }
  return null;
}

void txidOf;
void readOnchainProof;
