// A client for the relay transport cMIP (cmips/cmip-relay-transport-draft-1.md).
// Everything a relay says unsigned is a hint: the client recomputes the id of
// everything it fetches, and judges acts only with the core library.

import { actId, cborDecode, cborEncode, hex, unhex } from './core.ts';
import { createHash } from 'node:crypto';

export class RelayError extends Error {
  constructor(
    readonly code: number,
    readonly reason: string,
    readonly acts: Uint8Array[] = [],
    readonly status = 0,
  ) {
    super(`relay error ${code}: ${reason}`);
  }
}

/** Error codes (cMIP, "Errors"). */
export const CODE = {
  malformed: 0,
  invalid: 1,
  notServed: 2,
  missingPredecessor: 3,
  conflict: 4,
  refused: 5,
  tooLarge: 6,
  notAccepted: 7,
  notHeld: 8,
  notSupported: 9,
  slowDown: 10,
} as const;

export interface PutResult {
  id: string;
  arrival: number;
  receipt?: Uint8Array;
  objection?: Uint8Array;
}

export interface FeedItem {
  arrival: number;
  kind: 'act' | 'sealed';
  item: Uint8Array;
}

/** The identity record a home serves (cMIP, "Querying an identity"). */
export interface IdentityRecord {
  identity: string;
  chain: Uint8Array[];
  receipts: Uint8Array[];
  routes: Uint8Array[];
  encryptionKeys: Uint8Array[];
  names: Uint8Array[];
  links: Uint8Array[];
  evidence: Uint8Array[];
  otherReceipts: Uint8Array[];
}

type M = Map<number, unknown>;

const bytesList = (v: unknown): Uint8Array[] => (Array.isArray(v) ? (v as Uint8Array[]) : []);

export const sealedId = (bytes: Uint8Array): string => {
  const t = createHash('sha256').update('MOR/transport/sealed').digest();
  return createHash('sha256').update(t).update(t).update(bytes).digest('hex');
};

/**
 * One relay, at one base address. `via` lets a client reach an address
 * another way (for example the onion home through its local port on the
 * machine that runs it); the address written in acts stays the hint.
 */
export class Relay {
  constructor(
    readonly base: string,
    readonly via: string = base,
  ) {}

  private async call(path: string, init?: RequestInit): Promise<Uint8Array> {
    const r = await fetch(this.via.replace(/\/$/, '') + path, init);
    const body = new Uint8Array(await r.arrayBuffer());
    if (!r.ok) {
      let code = -1;
      let reason = `HTTP ${r.status}`;
      let acts: Uint8Array[] = [];
      try {
        const e = cborDecode(body) as M;
        code = e.get(0) as number;
        reason = (e.get(1) as string) ?? reason;
        acts = bytesList(e.get(2));
      } catch {
        // not an error body of this cMIP
      }
      throw new RelayError(code, reason, acts, r.status);
    }
    return body;
  }

  private post(path: string, body: Uint8Array, type = 'application/cbor') {
    return this.call(path, { method: 'POST', body: body as unknown as BodyInit, headers: { 'content-type': type } });
  }

  async info(): Promise<M> {
    return cborDecode(await this.call('/info')) as M;
  }

  /** `POST /acts`. The act id in the answer is checked against the act sent. */
  async putAct(act: Uint8Array): Promise<PutResult> {
    const m = cborDecode(await this.post('/acts', act)) as M;
    const id = hex(m.get(0) as Uint8Array);
    if (id !== actId(act)) throw new RelayError(-1, 'the relay answered for another act');
    return {
      id,
      arrival: m.get(1) as number,
      receipt: m.get(2) as Uint8Array | undefined,
      objection: m.get(3) as Uint8Array | undefined,
    };
  }

  /** `POST /sealed`, with pickup tags for a container sent to a bare key. */
  async putSealed(sealed: Uint8Array, pickup: string[] = []): Promise<PutResult> {
    const req = new Map<number, unknown>([[0, sealed]]);
    if (pickup.length) req.set(1, pickup.map(unhex));
    const m = cborDecode(await this.post('/sealed', cborEncode(req))) as M;
    const id = hex(m.get(0) as Uint8Array);
    if (id !== sealedId(sealed)) throw new RelayError(-1, 'the relay answered for another container');
    return { id, arrival: m.get(1) as number };
  }

  /** `GET /acts/{id}`, checked: `null` when the relay does not hold it (which proves nothing). */
  async getAct(id: string): Promise<Uint8Array | null> {
    try {
      const a = await this.call(`/acts/${id}`);
      return actId(a) === id ? a : null;
    } catch (e) {
      if (e instanceof RelayError && e.code === CODE.notHeld) return null;
      throw e;
    }
  }

  /** `POST /media`: the relay's answer is checked against the bytes sent. */
  async putMedia(locked: Uint8Array): Promise<{ lockedHash: string; size: number }> {
    const m = cborDecode(await this.post('/media', locked, 'application/octet-stream')) as unknown[];
    const lockedHash = hex(m[0] as Uint8Array);
    if (lockedHash !== createHash('sha256').update(locked).digest('hex') || m[1] !== locked.length) {
      throw new RelayError(-1, 'the relay answered for other media');
    }
    return { lockedHash, size: m[1] as number };
  }

  /** `GET /media/{locked hash}`, checked: `null` when not held or not matching. */
  async getMedia(lockedHash: string): Promise<Uint8Array | null> {
    try {
      const b = await this.call(`/media/${lockedHash}`);
      return createHash('sha256').update(b).digest('hex') === lockedHash ? b : null;
    } catch (e) {
      if (e instanceof RelayError && e.code === CODE.notHeld) return null;
      throw e;
    }
  }

  async feed(q: {
    signer?: string;
    to?: string;
    pickup?: string;
    unaddressed?: boolean;
    after?: number;
    limit?: number;
    wait?: number;
  }): Promise<{ items: FeedItem[]; next: number }> {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(q)) {
      if (v === undefined) continue;
      p.set(k, k === 'unaddressed' ? (v ? '1' : '0') : String(v));
    }
    const m = cborDecode(await this.call(`/feed?${p}`)) as M;
    const items = (m.get(0) as unknown[][]).map(([arrival, kind, item]) => ({
      arrival: arrival as number,
      kind: kind === 0 ? ('act' as const) : ('sealed' as const),
      item: item as Uint8Array,
    }));
    return { items, next: m.get(1) as number };
  }

  /** `GET /identity/{id}`: everything the home holds about an identity. */
  async identity(id: string): Promise<IdentityRecord> {
    const m = cborDecode(await this.call(`/identity/${id}`)) as M;
    const got = hex(m.get(0) as Uint8Array);
    if (got !== id) throw new RelayError(-1, 'an identity record for another identity');
    return {
      identity: got,
      chain: bytesList(m.get(1)),
      receipts: bytesList(m.get(2)),
      routes: bytesList(m.get(3)),
      encryptionKeys: bytesList(m.get(4)),
      names: bytesList(m.get(5)),
      links: bytesList(m.get(6)),
      evidence: bytesList(m.get(7)),
      otherReceipts: bytesList(m.get(8)),
    };
  }
}

/** Where to reach each base address: itself, unless the user mapped it. */
export type Via = Record<string, string>;

export const relayAt = (hint: string, via: Via = {}): Relay => new Relay(hint, via[hint] ?? hint);
