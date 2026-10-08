// Talking to the program that served this page: every request signed with
// the browser's key (Ed25519, WebCrypto), as `src/access.ts` checks it. The
// same scheme as the management page of step 11, with its own domain line.

/** What the browser's key signs, before the request body (as access.ts's DOMAIN). */
export const DOMAIN = 'MOR collective client, version 1\n';

export interface Hello {
  app: string;
  time: number;
}

/** A refusal, with its words. */
export class Refused extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export const toHex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');

/** A new key: its private half cannot be read out, even by this page. */
export async function newKey(): Promise<CryptoKeyPair> {
  return (await crypto.subtle.generateKey({ name: 'Ed25519' }, false, ['sign', 'verify'])) as CryptoKeyPair;
}

/** The exact bytes of one request. */
export function requestBody(hello: Hello, time: number, nonce: Uint8Array, op: string, args: object): Uint8Array<ArrayBuffer> {
  return new TextEncoder().encode(JSON.stringify({ app: hello.app, time, nonce: toHex(nonce), op, args }));
}

/** What the key signs for a body. */
export function signedBytes(body: Uint8Array): Uint8Array<ArrayBuffer> {
  const d = new TextEncoder().encode(DOMAIN);
  const m = new Uint8Array(d.length + body.length);
  m.set(d);
  m.set(body, d.length);
  return m;
}

export class Client {
  private offset = 0;
  hello!: Hello;

  private constructor(
    private readonly keys: CryptoKeyPair,
    readonly publicKey: string,
    private readonly base: string,
  ) {}

  static async open(keys: CryptoKeyPair, base = ''): Promise<Client> {
    const raw = new Uint8Array(await crypto.subtle.exportKey('raw', keys.publicKey));
    const c = new Client(keys, toHex(raw), base.replace(/\/$/, ''));
    await c.greet();
    return c;
  }

  async greet(): Promise<Hello> {
    const r = await fetch(`${this.base}/hello`, { cache: 'no-store' });
    if (!r.ok) throw new Refused(r.status, `the program did not answer (${r.status})`);
    this.hello = (await r.json()) as Hello;
    this.offset = this.hello.time - Math.floor(Date.now() / 1000);
    return this.hello;
  }

  async ask<T = unknown>(op: string, args: object = {}): Promise<T> {
    const time = Math.floor(Date.now() / 1000) + this.offset;
    const body = requestBody(this.hello, time, crypto.getRandomValues(new Uint8Array(16)), op, args);
    const sig = new Uint8Array(await crypto.subtle.sign({ name: 'Ed25519' }, this.keys.privateKey, signedBytes(body)));
    const r = await fetch(`${this.base}/api`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'mor-key': this.publicKey, 'mor-signature': toHex(sig) },
      body,
      cache: 'no-store',
    });
    let reply: { ok?: T; error?: string };
    try {
      reply = await r.json();
    } catch {
      throw new Refused(r.status, `the program answered ${r.status}, not in JSON`);
    }
    if (!r.ok) throw new Refused(r.status, reply.error ?? `refused (${r.status})`);
    return reply.ok as T;
  }
}

// ---------------------------------------------------------------- what the program answers

export interface Line {
  text: string;
  tone?: 'warn' | 'bad' | 'ok';
}

export interface Reading {
  title: string;
  summary: string[];
  sections: { heading: string; lines: Line[] }[];
  plain: { heading: string; text: string }[];
  blocking: string[];
}

export interface Review {
  plan: string;
  digest: string;
  reading: Reading;
}

export interface Done {
  title: string;
  lines: Line[];
  acts: string[];
}

export interface Rules {
  safety: number;
  release: number;
  clone: number;
  others: number;
  /** The constitutional change rule: any k members; absent, every member whose voice remains. */
  constitution?: number;
}

export interface State {
  settings: {
    homes: { operator: string | null; hint: string }[];
    relays: string[];
    via: Record<string, string>;
    checkout: string | null;
    checkoutDefault: string;
  };
  identities: { id: string; name: string; mine: boolean; releases: { id: string; version: string }[] }[];
  collectives: {
    id: string;
    name: string;
    members: { id: string; name: string; held: boolean; left: boolean }[];
    areas: {
      id: number;
      name: string;
      holders: { id: string; name: string; held: boolean; voice: boolean; steppedDown: boolean }[];
      threshold: number;
      needed: number;
      frozen: boolean;
      words: string;
    }[];
    /**
     * Law's own reading of the collective, from what its relays and homes
     * hold: `broken`, why Law reads it as broken; `unread`, why no reading
     * could be had. While either is set, the rules shown are this device's
     * copy, not the rules in force.
     */
    law: { broken: string | null; unread: string | null; rollback: boolean };
    departed: { id: string; name: string; record: string; stillParty: boolean }[];
    steppedDown: { id: string; name: string; area: number; record: string }[];
    records: number;
    holder: string;
    agreement: string;
    agreements: number;
    rules: Rules;
    words: string;
    shares: { threshold: number; of: number };
    relays: string[];
    releases: { id: string; version: string }[];
    pending: boolean;
    /** The fork or closing that ended it (Law rule 47a, F121, F124 N9), if any. */
    closed: string | null;
    /** For a successor of a fork: the original collective, a back-link (F124 N4). */
    forkedFrom: string | null;
    /** Its stakes in itself: each holder's share of all its income (F121, Q8). */
    stakes: { id: string; name: string; percent: number; member: boolean }[];
    /** Who may hold a stake in it: members whose voice remains and departed holders. */
    holdersToBe: { id: string; name: string }[];
    splitService: boolean;
    splits: string[];
    /** Debts it signed, and those of the collective it was forked from (owed by the successors its fork handed them to, F127): each with its creditor, and whether this program holds the creditor. */
    debts: { id: string; creditor: string; creditorName: string; creditorHeld: boolean; inherited: boolean }[];
  }[];
  history: { time: number; kind: string; title: string; digest: string; acts: string[] }[];
  paired: { key: string; label: string; added: number; you: boolean }[];
}
