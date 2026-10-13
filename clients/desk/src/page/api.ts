// Talking to the program that served this page: every request signed with
// the browser's key (Ed25519, WebCrypto), as the collective client's `src/access.ts` checks it. The
// same scheme as the management page of step 11, with its own domain line.

/** What the browser's key signs, before the request body (as access.ts's DOMAIN). */
export const DOMAIN = 'MOR desk, version 1\n';

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

/** What the key signs for a body: the program's domain line, then the body. */
export function signedBytes(body: Uint8Array, domain = DOMAIN): Uint8Array<ArrayBuffer> {
  const d = new TextEncoder().encode(domain);
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
    private readonly domain: string,
  ) {}

  /** `domain`: the domain line of the program this page talks to (Dub gives its own). */
  static async open(keys: CryptoKeyPair, base = '', domain = DOMAIN): Promise<Client> {
    const raw = new Uint8Array(await crypto.subtle.exportKey('raw', keys.publicKey));
    const c = new Client(keys, toHex(raw), base.replace(/\/$/, ''), domain);
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
    const sig = new Uint8Array(await crypto.subtle.sign({ name: 'Ed25519' }, this.keys.privateKey, signedBytes(body, this.domain)));
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

export interface Done {
  title: string;
  lines: Line[];
  acts: string[];
}

export interface DraftView {
  digest: string;
  time: number;
  signer: string;
  signerName: string;
  kind: 'post' | 'message' | 'picture' | 'withdrawal' | 'refused';
  title: string;
  summary: string[];
  sections: { heading: string; lines: Line[] }[];
  plain: { heading: string; text: string }[];
  blocking: string[];
  note: string | null;
  reworks: { digest: string; note: string; text: string | null } | null;
  picture: { src: string; width: number; height: number } | null;
}

export type Sorted = 'new' | 'to answer' | 'answered' | 'ignored';

export interface Item {
  key: string;
  kind: 'message' | 'reply' | 'acknowledgement' | 'payment' | 'split' | 'key delivery' | 'nudge' | 'pick' | 'terms' | 'other';
  from: string | null;
  fromName: string | null;
  act: string | null;
  private: boolean;
  standing: string;
  text?: string;
  answers: string[];
  acknowledges: string[];
  witness?: boolean;
  refs: string[];
  problem?: string;
  /** The seller's alarm (Agreements rule 45b, F186): a payment naming a version of a deal that does not descend from the version this identity holds. */
  alarm?: string;
  /** A payment naming an older version of a deal, with no fork: a plain notice, not the alarm (Agreements rule 45b, F188, DQ7). */
  notice?: string;
  /** Terms received: the deal-assessment tool's shares and fees, and risks (roadmap step 14). */
  assessment?: { heading: string; lines: Line[] }[];
  found: number;
  sorted: Sorted;
}

export interface State {
  settings: {
    homes: { operator: string | null; hint: string }[];
    relays: string[];
    via: Record<string, string>;
    drafts: string;
  };
  identities: {
    id: string;
    name: string;
    linked: boolean;
    /** This desk's own line of acts for it (F152): how many, the latest, its running summary. */
    line: { acts: number; latest: string | null; summary: string | null };
    received: Item[];
  }[];
  history: { time: number; draft: string; verdict: string; signer: string; signerName: string; title: string; note: string; act?: string; cause?: string; causeAct?: string; text?: string; resend: boolean }[];
  machine: MachineState;
  paired: { key: string; label: string; added: number; you: boolean }[];
}

/** Machine, allegedly's answering, as the program reports it (src/machine.ts). */
export interface MachineState {
  agent: string | null;
  agentName: string | null;
  owner: string | null;
  ownerName: string | null;
  /** Its terms, read from the act signed, in plain words. */
  terms: { act: string; words: string[] } | null;
  on: boolean;
  callsPerDay: number;
  maxChars: number;
  callsToday: number;
  stopped: string | null;
  /** Where the API key was found (never the key), or why there is none. */
  key: { found: boolean; from: string; warning?: string };
  notified: { key: string; act: string | null; from: string | null; fromName: string | null; private: boolean; kind: string; standing: string; text?: string }[];
  notAnswered: { act: string; kind: string; note: string }[];
}
