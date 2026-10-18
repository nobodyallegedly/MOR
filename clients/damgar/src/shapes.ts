// What Damgar's page is told: plain data, shared by the page and Damgar's
// code, the program on the Mac and Linux and the web client alike.

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
  kind: 'draft' | 'request' | 'invoice' | 'address' | 'receipt' | 'lane' | 'unknown';
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
}

export interface Account {
  /** Totals per unit, never across units: in, out, owed to you, owed by you, pending. */
  totals: { label: string; amounts: Shown[] }[];
  payments: PaymentShown[];
  /** Requests and debts: asked, accepted as a debt, paid. */
  asks: { id: string; side: 'in' | 'out'; other: Who; amount: Shown; whatFor: string | null; state: string; obligation: string | null; lines: Line[] }[];
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
  stage: 'identity' | 'accept' | 'ready';
  held: { id: string; grouped: string; short: string; active: boolean }[];
  identity: null | {
    id: string;
    grouped: string;
    short: string;
    homes: string[];
    relays: string[];
    encryption: boolean;
    line: { acts: number; latest: string | null; summary: string | null };
  };
  accept: Accept[];
  /** Where the accepted list stands: its version, whether it was forked and merged, published or private. */
  list: { version: number; merged: string[]; published: boolean; problems: string[] };
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
}
