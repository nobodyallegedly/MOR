// Talking to the relay that served this page: every request signed with the
// browser's management key (Ed25519, WebCrypto), as `relay/src/manage.rs`
// checks it. Nothing here is part of the protocol: how an operator runs a
// relay is the relay program's own business.

/** What a management key signs, before the request body (as the relay's DOMAIN). */
export const DOMAIN = 'MOR relay management, version 1\n';

export interface Hello {
  /** This relay's management id: every request names it. */
  relay: string;
  /** The relay's clock, in Unix seconds. */
  time: number;
  role: 'home' | 'relay';
}

/** A refusal from the relay, with its words. */
export class Refused extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export const toHex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');

export function fromHex(s: string): Uint8Array {
  if (!/^([0-9a-f]{2})*$/.test(s)) throw new Error('not hexadecimal');
  return Uint8Array.from(s.match(/../g) ?? [], (x) => parseInt(x, 16));
}

/** A new management key: its private half cannot be read out, even by this page. */
export async function newKey(): Promise<CryptoKeyPair> {
  return (await crypto.subtle.generateKey({ name: 'Ed25519' }, false, ['sign', 'verify'])) as CryptoKeyPair;
}

/** The exact bytes of one request. */
export function requestBody(hello: Hello, time: number, nonce: Uint8Array, op: string, args: object): Uint8Array<ArrayBuffer> {
  return new TextEncoder().encode(JSON.stringify({ relay: hello.relay, time, nonce: toHex(nonce), op, args }));
}

/** What the key signs for a body. */
export function signedBytes(body: Uint8Array): Uint8Array<ArrayBuffer> {
  const d = new TextEncoder().encode(DOMAIN);
  const m = new Uint8Array(d.length + body.length);
  m.set(d);
  m.set(body, d.length);
  return m;
}

/** A browser's side of the management page, for the relay at `base`. */
export class Manager {
  /** Seconds to add to this device's clock to read the relay's. */
  private offset = 0;
  hello!: Hello;

  private constructor(
    private readonly keys: CryptoKeyPair,
    readonly publicKey: string,
    private readonly base: string,
  ) {}

  static async open(keys: CryptoKeyPair, base = '.'): Promise<Manager> {
    const raw = new Uint8Array(await crypto.subtle.exportKey('raw', keys.publicKey));
    const m = new Manager(keys, toHex(raw), base.replace(/\/$/, ''));
    await m.greet();
    return m;
  }

  /** Learn the relay's id and clock again. */
  async greet(): Promise<Hello> {
    const r = await fetch(`${this.base}/hello`, { cache: 'no-store' });
    if (!r.ok) throw new Refused(r.status, `the relay did not answer (${r.status})`);
    this.hello = (await r.json()) as Hello;
    this.offset = this.hello.time - Math.floor(Date.now() / 1000);
    return this.hello;
  }

  /** Ask the relay to do something; returns its answer, or throws its refusal. */
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
      throw new Refused(r.status, `the relay answered ${r.status}, not in JSON`);
    }
    if (!r.ok) throw new Refused(r.status, reply.error ?? `refused (${r.status})`);
    return reply.ok as T;
  }
}

// ---------------------------------------------------------------- what the relay answers

export interface Status {
  role: 'home' | 'relay';
  bases: string[];
  policy: 'open' | 'allowlist';
  policyText: string | null;
  limits: { act: number; media: number; feed: number; wait: number };
  operator: string | null;
  holdsSafetyKey: boolean;
  closed: boolean;
  counts: { acts: number; sealed: number; media: number; bytes: number };
  arrivals: number;
  served: number;
  log: number;
  pending: number;
  allowlist: number;
  newIdentityLimit: number | null;
  newIdentitiesToday: number;
  version: string;
}

export interface Item {
  arrival: number;
  kind: 'act' | 'sealed' | 'media';
  id: string;
  size: number;
  signer: string | null;
  spec: string | null;
  type: number | null;
}

export interface Served {
  identity: string;
  operator: boolean;
  chain: { position: number; act: string; receipted: boolean }[];
  strict: boolean;
  allowed: boolean;
}

export interface Waiting {
  rotation: string;
  identity: string;
  position: number;
  at: number;
  approved: boolean;
  homeless: boolean;
  closure: boolean;
  homes: { operator: string | null; hint: string }[] | null;
}

export interface Paired {
  key: string;
  label: string;
  added: number;
  you: boolean;
}
