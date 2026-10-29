// What Damgar's page is told: plain data, shared by the page and Damgar's
// code, the program on the Mac and Linux and the web client alike.

import type { LineShown } from '../../genesis/src/card-words.ts';
import type { Named } from '../../kit/src/html.ts';
/** One line said to the person, with its tone: red only for an alarm (a void act, a key changed elsewhere, a proof that does not hold). */
export interface Line {
  text: string;
  tone?: 'ok' | 'warn' | 'bad';
}

export interface Who {
  id: string;
  /** First eight and last four characters of the ID. */
  short: string;
  me: boolean;
}

/** An amount, said with its unit (never a bare number), and its parts. */
export interface Shown {
  unit: string;
  value: number;
  said: string;
}

/** A verdict on a receipt or claim, from the rail's own evidence. */
export interface Verdict {
  answer: 'valid' | 'invalid' | 'pending' | 'unknown';
  why: string;
}

export interface Accept {
  key: string;
  name: string;
  kind: 'cMIP' | 'Module';
  draft: number;
  text: string;
  does: string;
  here: string;
  built: boolean;
  needs: string[];
  accepted: boolean;
  hashes: string[];
}

/** One thing waiting for the person, in To sign. */
export interface ToSign {
  /** The act it comes from (a draft, a request, an invoice request, a claim). */
  id: string;
  kind: 'draft' | 'request' | 'invoice' | 'address' | 'receipt' | 'lane' | 'unknown' | 'uncounted';
  from: Who;
  /** Prepared in another app: its name. */
  app: string | null;
  title: string;
  /** The reading, in plain words: what it is, with which rail, to the flow or the vault, what signing does. */
  lines: Line[];
  amount: Shown | null;
  /** Nothing can be signed for it: under something not accepted, or refused by a rule. */
  unknown: boolean;
  /** The buttons offered. */
  offers: ('sign' | 'decline' | 'debt' | 'pay' | 'invoice' | 'address' | 'refuse' | 'receipt' | 'grant')[];
  /** Pasted by hand (the first way to pay), not found on MOR. */
  byHand?: boolean;
  /** For an invoice request on Lightning: the description hash to give the wallet. */
  descriptionHash?: string;
  found: number;
}

/** A payment as the account and Pay show it. */
export interface PaymentShown {
  key: string;
  side: 'out' | 'in';
  other: Who;
  amount: Shown;
  rail: string;
  railName: string;
  whatFor: string | null;
  /** Where it goes: to the flow pointer, or the vault. */
  to: 'flow' | 'vault' | 'refund';
  stage: 'asked' | 'to pay' | 'refused' | 'paid' | 'settled' | 'declined';
  stageSaid: string;
  /** What to pay, in Pay: a Lightning invoice, or an address and the exact amount. */
  pay: { invoice?: string; address?: string; amount: Shown } | null;
  /** The claims and receipts held for it, each with its verdict. */
  proofs: { act: string; kind: 'claim' | 'receipt'; by: Who; rail: Verdict; beside: Verdict; standing: string; confirmations: [number, number] | null; how: string }[];
  lines: Line[];
  at: number;
  /** Paying for an anchor: the ticket. */
  /** `checked`: its deadline read against the chain followed (never in the web client, which follows none). */
  ticket: { batch: number; deadline: number; tier: number; checked: boolean } | null;
  /** The invoice request that began it, where this side sent one: the act its card shows until a claim or receipt exists. */
  request?: string | null;
  /** A transfer to one's vault on Lightning (H46, F355): the invoice to make on the vault's node, with this description hash. */
  vaultInvoice?: { node: string; descriptionHash: string } | null;
  /** A payment under a deal between separate people (this round): the deal's name, shown with it. */
  deal?: string | null;
}

/** A deal between separate people this identity is a party of (this round): the payments made to it, and the payouts its split service made to you. */
export interface SharedShown {
  version: string;
  name: string;
  /** A collective's money agreement, not a deal: its sales are shown with your share only (its receipts sealed to the collective). */
  collective?: boolean;
  /** Every payment the service receipted in the deal's payee's name, sealed to every party: a sale or a tip. */
  payments: { receipt: string; payer: Who; amount: Shown; kind: 'a sale' | 'a tip'; standing: string; /** Its rail answer here (S7e): anything but valid is shown unknown, with its reason. */ rail: Verdict }[];
  /** Your payouts, as each split the service sealed to you names them; `paid` where your Damgar holds a payment of that amount from the service. */
  payouts: { split: string; amount: Shown; role: string | null; paid: boolean }[];
}

export interface Account {
  /** Totals per unit, never across units: in, out, owed to you, owed by you, pending. */
  totals: { label: string; amounts: Shown[] }[];
  payments: PaymentShown[];
  /** Requests and debts: asked, accepted as a debt, paid. */
  asks: { id: string; side: 'in' | 'out'; other: Who; amount: Shown; whatFor: string | null; state: string; obligation: string | null; lines: Line[] }[];
  /** The deals between separate people this identity is a party of (this round). */
  shared?: SharedShown[];
  problems: string[];
  /** Said once, above: what this Money-only app cannot judge. */
  notes: string[];
}

export interface Rails {
  /** The payee pointer in force: version and act, and its rails as the page shows them. */
  pointer: { act: string; version: number; forked: boolean; rails: { module: string; name: string; said: string; accepted: boolean }[] } | null;
  /** The vault the identity's chain declares, read here, changed in Kišib only. */
  vault: { declaredBy: string; entries: { unit: Shown; railName: string; limit: Shown; said: string }[] } | null;
  /** The on-chain request key Damgar holds, its public half. */
  requestKey: string | null;
  /** The chain Damgar follows, said (the on-chain rail Module, F204). */
  chain: string;
}

export interface State {
  web: boolean;
  /** Something was saved from Settings (H45): its sections start folded; before that, on first use, all open. */
  settingsSaved: boolean;
  stage: 'identity' | 'accept' | 'ready';
  held: { id: string; grouped: string; short: string; active: boolean; /** Used through Kišib's runner: Damgar holds none of its keys. */ runner?: boolean; /** Its display name (the naming cMIP), where it has one. */ name?: string | null; /** Its published name as read (H96): the name, none published, or not reached. */ named?: Named | null }[];
  identity: null | {
    id: string;
    grouped: string;
    /** Its ID written for people (Identity draft 14, F349): `mid1…`. */
    form: string;
    short: string;
    homes: string[];
    relays: string[];
    encryption: boolean;
    /** This app's line; its card for Kišib names only an act the homes hold (H80's question 2). */
    line: LineShown;
    /** The collectives Damgar acts for in money, under this identity (the identity panel). */
    collectives: { id: string; form: string; short: string; name: string | null; /** Its published name as read (H96). */ named?: Named | null }[];
    /** Its display name (the naming cMIP), where it has one. */
    name: string | null;
    /** Its published name as read (H96): what the top right and the identity panel show, or why not. */
    named?: Named | null;
    /** Its ID link (`mid1…?r=…`, one home and one relay): Share your ID link (H88). */
    link?: string;
    /** Used through Kišib's runner. */
    runner: boolean;
  };
  accept: Accept[];
  /** Where the accepted list stands: its version, whether it was forked and merged, published or private. */
  /** `here`: how many rules are followed in Damgar only, not sealed (H112). */
  list: { version: number; merged: string[]; published: boolean; problems: string[]; here?: number };
  counts: { toSign: number; toPay: number };
}

/** A lane granted from here (round 2, F351), as Lanes shows it. */
export interface LaneShown {
  grant: string;
  label: string;
  app: string;
  /** Its key is held by this Damgar (its own receipts or payouts lane). */
  here: boolean;
  state: string;
  words: string[];
  /** Every act its places hold signed under it. */
  acts: { id: string; said: string }[];
  /** Its cap per act and its expiry (a timestamp clock's time), as the grant says them. */
  cap?: Shown | null;
  until?: number | null;
  /** The cap in all (the grant limits cMIP, draft 3), kept by the apps and counted here; what its payments spent, what is left, and any overspend. Null where none was asked, or (spent) where nothing could be read. */
  total?: Shown | null;
  spent?: Shown | null;
  left?: Shown | null;
  over?: Shown | null;
  /** An app's payments under it, read from the acts whose keys it delivered to this identity: the record kept here (Account › Under the lanes). */
  /** Of what is spent in all: what is paid (its claim signed), and what is only asked (its invoice request signed, nothing moved yet) (H107). */
  paid?: Shown | null;
  asked?: Shown | null;
  payments?: { key: string; to: Who & { name?: string | null }; amount: Shown; whatFor: string | null; stage: 'asked' | 'refused' | 'paid'; request: string | null; claims: string[] }[];
  /** Acts under it whose keys were not delivered here: sealed, not counted. */
  sealed?: number;
}
