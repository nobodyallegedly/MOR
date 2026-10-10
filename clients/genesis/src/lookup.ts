// Looking an identity up as a reader (Identity, "Reaching an identity";
// relay transport cMIP, "Querying an identity"). Apart from the identity
// files, so that a reader that holds no keys, such as the web reader in a
// browser, uses the same code as the genesis client.

import { MIPS, SPECS, ENVELOPES_TYPES, IDENTITY_TYPES, Verifier, actId, cborDecode, describeAct, hex } from './core.ts';
import { relayAt, type Via } from './transport.ts';

interface Described {
  id: string;
  signer?: string;
  public: boolean;
  spec?: string;
  type?: number;
  payload?: Uint8Array;
}

export interface Home {
  /** The operator's identity hash, or null for a self-hosted home. */
  operator: string | null;
  /** The base address (relay transport cMIP, "Addresses"). */
  hint: string;
}

export interface RouteIn {
  /** A spec hash, or null for everything else. */
  scope: string | null;
  hints: string[];
  /** 0 outbox (default), 1 inbox. */
  kind?: 0 | 1;
}

// ---------------------------------------------------------------- looking up

export interface Resolution {
  identity: string;
  links: { act: string; position: number; how: string }[];
  stop: string;
  waiting: string[];
  contested: number[];
  signingKey?: Uint8Array;
  chainKeyScheme?: number;
  chainKeyCommit?: string;
  homes: Home[];
  rule?: number[];
  effective?: string;
}

export interface Lookup {
  resolution: Resolution;
  verifier: Verifier;
  /** Homes that did not answer (a hint, never evidence). */
  unreachable: string[];
  routes: { act: string | null; contested: boolean; routes: RouteIn[] };
  encryptionKeyAct: string | null;
  encryptionKey: Uint8Array | null;
  /** Every receipt held for this identity's chain acts, from any home. */
  receipts: Uint8Array[];
  /** The identity-chain acts of its homes' operators, as found. */
  operatorChains: Uint8Array[];
  inbox(spec: string): string[] | null;
}

/**
 * Look an identity up as a reader: fetch its genesis from any hint, then
 * the identity record from every home its chain names (and each home's
 * operator's own chain, to check the receipts), and let the core library
 * decide which rotation counts and which routes and encryption key count.
 * Nothing unsigned is trusted. With `into`, the acts are added to that
 * verifier, so several identities can be judged together.
 */
export async function lookUp(identity: string, hints: string[], via: Via = {}, into?: Verifier): Promise<Lookup> {
  const v = into ?? new Verifier(SPECS.identity, MIPS.money, MIPS.agreements);
  const tried = new Set<string>();
  const unreachable: string[] = [];
  const operatorActs = new Map<string, Uint8Array[]>();
  const add = (acts: Uint8Array[]) => {
    for (const a of acts) {
      try {
        v.add(a);
      } catch {
        // a malformed act from a relay: ignored, it proves nothing
      }
    }
  };
  let genesis: Uint8Array | null = null;
  for (const h of hints) {
    try {
      genesis = await relayAt(h, via).getAct(identity);
    } catch {
      unreachable.push(h);
    }
    if (genesis) break;
  }
  if (!genesis) throw new Error(`the genesis of ${identity} was not found at ${hints.join(', ')}`);
  add([genesis]);

  // Every home named anywhere in the chain held so far; more may appear as rotations arrive.
  const homesNamed = (): Home[] => {
    const out: Home[] = [];
    for (const id of v.held()) {
      let d: Described;
      try {
        d = describeAct(heldBytes.get(id)!);
      } catch {
        continue;
      }
      if (d.spec !== SPECS.identity || !d.payload) continue;
      if (d.type !== IDENTITY_TYPES.genesis && d.type !== IDENTITY_TYPES.rotation) continue;
      if ((d.signer ?? d.id) !== identity) continue;
      const p = cborDecode(d.payload) as Map<number, unknown>;
      const homes = p.get(d.type === 0 ? 2 : 6) as [Uint8Array | null, string][] | undefined;
      for (const [op, hint] of homes ?? []) out.push({ operator: op ? hex(op) : null, hint });
    }
    return out;
  };
  const heldBytes = new Map<string, Uint8Array>([[actId(genesis), genesis]]);
  const keep = (acts: Uint8Array[]) => {
    for (const a of acts) {
      try {
        heldBytes.set(actId(a), a);
      } catch {
        // malformed
      }
    }
    add(acts);
  };

  for (let round = 0; round < 4; round++) {
    const fresh = homesNamed().filter((h) => !tried.has(h.hint));
    if (!fresh.length) break;
    for (const h of fresh) {
      tried.add(h.hint);
      const r = relayAt(h.hint, via);
      try {
        const rec = await r.identity(identity);
        keep([...rec.chain, ...rec.receipts, ...rec.routes, ...rec.encryptionKeys, ...rec.evidence, ...rec.otherReceipts]);
        // F152, F159: a private link act counts only if its sealed form is
        // published at the homes its signer's chain names at its binding.
        // A home serves the identity's private acts with its links,
        // opaque: note each found here, with the home's operator (the
        // identity itself for a self-hosted home), so that one this reader
        // holds the key of can count where this home is one of those.
        for (const a of rec.links) {
          try {
            const d = describeAct(a) as Described;
            if (!d.public && d.signer === identity) v.foundAtHome(d.id, h.operator ?? identity);
          } catch {
            // malformed: proves nothing
          }
        }
      } catch {
        unreachable.push(h.hint);
        continue;
      }
    }
  }

  // Each home's operator's own chain, so its receipts can be checked
  // ("Resolving an operator"): from its own home first, then, as signed
  // acts that any relay may carry, from every other home that answered.
  const operators = new Set(homesNamed().map((h) => h.operator ?? identity));
  operators.delete(identity);
  const answered = [...tried].filter((h) => !unreachable.includes(h));
  for (const op of operators) {
    const own = homesNamed().filter((h) => h.operator === op).map((h) => h.hint);
    for (const hint of [...own.filter((h) => answered.includes(h)), ...answered.filter((h) => !own.includes(h))]) {
      const r = relayAt(hint, via);
      try {
        const g = await r.getAct(op);
        if (!g) continue;
        keep([g]);
        operatorActs.set(op, [g]);
        const page = await r.feed({ signer: op });
        const chain = page.items
          .filter((i) => i.kind === 'act')
          .map((i) => i.item)
          .filter((a) => {
            const d = describeAct(a) as Described;
            return d.spec === SPECS.identity && d.type === IDENTITY_TYPES.rotation;
          });
        keep(chain);
        operatorActs.get(op)!.push(...chain);
        break;
      } catch {
        // not here; try the next
      }
    }
  }

  const resolution = v.resolve(identity) as Resolution;
  const r = v.latest(identity, SPECS.identity, IDENTITY_TYPES.routes) as { act?: string; contested: boolean; payload?: Uint8Array };
  const routes: RouteIn[] = [];
  if (r.payload) {
    const p = cborDecode(r.payload) as Map<number, unknown>;
    for (const x of p.get(2) as unknown[][]) {
      routes.push({
        scope: x[0] ? hex(x[0] as Uint8Array) : null,
        hints: x[1] as string[],
        kind: ((x[2] as number) ?? 0) as 0 | 1,
      });
    }
  }
  const e = v.latest(identity, SPECS.envelopes, ENVELOPES_TYPES.encryptionKey) as { act?: string; payload?: Uint8Array };
  let encryptionKey: Uint8Array | null = null;
  if (e.payload) {
    const p = cborDecode(e.payload) as Map<number, unknown>;
    const [scheme, key] = p.get(2) as [number, Uint8Array];
    if (scheme === 4) encryptionKey = key;
  }
  const receipts: Uint8Array[] = [];
  for (const [id, a] of heldBytes) {
    const d = describeAct(a) as Described;
    if (d.spec !== SPECS.identity || d.type !== IDENTITY_TYPES.receipt || !d.payload) continue;
    const p = cborDecode(d.payload) as Map<number, unknown>;
    if (hex(p.get(0) as Uint8Array) === identity && v.status(id) === 'valid') receipts.push(a);
  }
  return {
    resolution,
    verifier: v,
    receipts,
    operatorChains: [...operatorActs.values()].flat(),
    unreachable,
    routes: { act: r.act ?? null, contested: r.contested, routes },
    encryptionKeyAct: e.act ?? null,
    encryptionKey,
    inbox(spec: string) {
      const inboxes = routes.filter((x) => x.kind === 1);
      const hit = inboxes.find((x) => x.scope === spec) ?? inboxes.find((x) => x.scope === null);
      return hit ? hit.hints : null;
    },
  };
}
