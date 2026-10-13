// Looking an identity up as a reader (Identity, "Reaching an identity";
// relay transport cMIP, "Querying an identity"). Apart from the identity
// files, so that a reader that holds no keys, such as the web reader in a
// browser, uses the same code as the genesis client.

import { MIRS, SPECS, ENVELOPES_TYPES, IDENTITY_TYPES, Verifier, actId, cborDecode, describeAct, hex } from './core.ts';
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
  /** The homes in force at each counting position, genesis first (same length as `links`). */
  homesAt?: Home[][];
  rule?: number[];
  effective?: string;
}

export interface Lookup {
  resolution: Resolution;
  verifier: Verifier;
  /** Homes that did not answer (a hint, never evidence). */
  unreachable: string[];
  /** Addresses not tried, because this client cannot reach them, each with why (reading B3 of `docs/f272-build.md`). */
  notTried: NotTried[];
  routes: { act: string | null; contested: boolean; routes: RouteIn[] };
  encryptionKeyAct: string | null;
  encryptionKey: Uint8Array | null;
  /** Every receipt held for this identity's chain acts, from any home. */
  receipts: Uint8Array[];
  /** The identity-chain acts of its homes' operators, as found. */
  operatorChains: Uint8Array[];
  inbox(spec: string): string[] | null;
}

export interface NotTried {
  hint: string;
  why: string;
}

/** Whether this code runs in a web browser (the web reader), not in Node. */
const inBrowser = (): boolean => typeof (globalThis as { window?: unknown }).window !== 'undefined' && typeof (globalThis as { process?: unknown }).process === 'undefined';

/**
 * Why this client cannot reach an address, or null if it can try it
 * (reading B3). An onion address is reached only through Tor: a browser
 * page cannot, and neither can this client's plain `fetch`, unless the
 * user mapped the address to a way in (`via`, such as the onion home's
 * local port on the machine that runs it). Not trying it is said, never a
 * failure in the console.
 */
export function cannotReach(hint: string, via: Via = {}): string | null {
  if (via[hint]) return null;
  let host: string;
  try {
    host = new URL(hint).hostname;
  } catch {
    return 'not an address';
  }
  if (host.endsWith('.onion')) {
    return inBrowser()
      ? 'an onion address, which a web browser cannot reach: it is reached only through Tor'
      : 'an onion address, reached only through Tor, and this client has no way in to it';
  }
  return null;
}

/**
 * The first answer that is not null, asking every one side by side
 * (reading B4): as fast as the quickest that holds it. Failures count as
 * null; `failed` collects the ones that threw.
 */
export async function firstOf<T, R>(items: T[], ask: (x: T) => Promise<R | null>, failed?: (x: T) => void): Promise<R | null> {
  if (!items.length) return null;
  return new Promise((resolve) => {
    let left = items.length;
    let done = false;
    for (const x of items) {
      ask(x).then(
        (r) => {
          left--;
          if (r !== null && r !== undefined && !done) {
            done = true;
            resolve(r);
          } else if (!left && !done) resolve(null);
        },
        () => {
          failed?.(x);
          left--;
          if (!left && !done) resolve(null);
        },
      );
    }
  });
}

/**
 * Look an identity up as a reader: fetch its genesis from any hint, then,
 * position by position, the identity record from the homes in force at the
 * latest position that counts so far (reading B2: never every home ever
 * named, and never a home only a rotation that does not count names), with
 * those homes' operators' own chains to check their receipts, until no new
 * home is in force; and let the core library decide which rotation counts
 * and which routes and encryption key count. The requests of each step go
 * out side by side (reading B4). Nothing unsigned is trusted. With `into`,
 * the acts are added to that verifier, so several identities can be judged
 * together.
 */
export async function lookUp(identity: string, hints: string[], via: Via = {}, into?: Verifier): Promise<Lookup> {
  const v = into ?? new Verifier(SPECS.identity, MIRS.money, MIRS.agreements);
  const asked = new Set<string>();
  const unreachable: string[] = [];
  const notTried: NotTried[] = [];
  const operatorActs = new Map<string, Uint8Array[]>();
  const heldBytes = new Map<string, Uint8Array>();
  const keep = (acts: Uint8Array[]) => {
    for (const a of acts) {
      try {
        heldBytes.set(actId(a), a);
        v.add(a);
      } catch {
        // a malformed act from a relay: ignored, it proves nothing
      }
    }
  };
  const tryable = (hint: string): boolean => {
    const why = cannotReach(hint, via);
    if (!why) return true;
    if (!notTried.some((n) => n.hint === hint)) notTried.push({ hint, why });
    return false;
  };
  const failed = (hint: string) => {
    if (!unreachable.includes(hint)) unreachable.push(hint);
  };

  const genesis = await firstOf(hints.filter(tryable), (h) => relayAt(h, via).getAct(identity), failed);
  if (!genesis) throw new Error(`the genesis of ${identity} was not found at ${hints.join(', ')}`);
  keep([genesis]);

  // The homes the genesis names: where to start when the chain cannot be resolved at all.
  const genesisHomes = (): Home[] => {
    try {
      const d = describeAct(genesis) as Described;
      if (d.spec !== SPECS.identity || d.type !== IDENTITY_TYPES.genesis || !d.payload) return [];
      const p = cborDecode(d.payload) as Map<number, unknown>;
      return ((p.get(2) as [Uint8Array | null, string][] | undefined) ?? []).map(([op, hint]) => ({ operator: op ? hex(op) : null, hint }));
    } catch {
      return [];
    }
  };
  // The homes in force at the latest position that counts (B2).
  const inForce = (): Home[] => {
    const r = v.resolve(identity) as Resolution & { homesAt?: Home[][] };
    return r.homesAt?.length ? r.homesAt[r.homesAt.length - 1] : genesisHomes();
  };

  const record = async (h: Home) => {
    const rec = await relayAt(h.hint, via).identity(identity);
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
  };

  // Each home's operator's own chain, so its receipts can be checked
  // ("Resolving an operator"): from its own homes first, then, as signed
  // acts that any relay may carry, from every other home that answered.
  const answered = () => [...asked].filter((h) => !unreachable.includes(h) && !notTried.some((n) => n.hint === h));
  const operatorChain = async (op: string, own: string[]) => {
    const from = async (hint: string): Promise<Uint8Array[] | null> => {
      const r = relayAt(hint, via);
      const [g, page] = await Promise.all([r.getAct(op), r.feed({ signer: op })]);
      if (!g) return null;
      const chain = page.items
        .filter((i) => i.kind === 'act')
        .map((i) => i.item)
        .filter((a) => {
          try {
            const d = describeAct(a) as Described;
            return d.spec === SPECS.identity && d.type === IDENTITY_TYPES.rotation;
          } catch {
            return false;
          }
        });
      return [g, ...chain];
    };
    const ownAnswered = own.filter((h) => answered().includes(h));
    const got = (await firstOf(ownAnswered, from)) ?? (await firstOf(answered().filter((h) => !own.includes(h)), from));
    if (!got) return;
    keep(got);
    operatorActs.set(op, got);
  };

  for (let round = 0; round < 8; round++) {
    const homes = inForce();
    const fresh = homes.filter((h) => !asked.has(h.hint));
    if (!fresh.length) break;
    for (const h of fresh) asked.add(h.hint);
    await Promise.all(fresh.filter((h) => tryable(h.hint)).map((h) => record(h).catch(() => failed(h.hint))));
    const ops = [...new Set(homes.map((h) => h.operator).filter((o): o is string => !!o && o !== identity && !operatorActs.has(o)))];
    await Promise.all(ops.map((op) => operatorChain(op, homes.filter((h) => h.operator === op).map((h) => h.hint))));
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
    notTried,
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

// ---------------------------------------------------------------- references (Envelopes draft 9, rule 20, F272)

/**
 * A reference as a client writes it into `refs`: an act id, or the act id
 * beside its signer's identity hash (`[act, signer]`, F272). The signer is
 * only where to look; it never decides validity.
 */
export type Reference = string | [string, string];

/** The act a reference names, whichever form it takes. */
export const refAct = (r: Reference): string => (typeof r === 'string' ? r : r[0]);
/** The signer a reference names, if it names one. */
export const refSigner = (r: Reference): string | null => (typeof r === 'string' ? null : r[1]);

interface Opened {
  id: string;
  signer?: string;
  public: boolean;
}

/**
 * The reference to write for an act this client holds (F272, client
 * conformance): a public act is named with its signer (a genesis is signed
 * by the identity it makes, whose hash is its own id); a private act by its
 * id alone, since naming its signer in a reference others can read would
 * expose the sender its sealed container hides. *Naming a private act's
 * signer is the writer's choice; this client chooses not to, and says so.*
 */
export function referenceTo(act: Uint8Array): Reference {
  const d = describeAct(act) as Opened;
  return d.public ? [d.id, d.signer ?? d.id] : d.id;
}

/**
 * Hold the act an id names, then write the reference to it (F272, client
 * conformance: when the act is public, the client MUST hold it and MUST
 * name its signer). The act is fetched from the hints side by side, its id
 * checked; not found, no reference is written: the writer must hold what
 * it points at.
 *
 * For a public act, the referenced signer's identity chain (its genesis
 * and rotations, all public) is fetched too, for the writer to carry to the
 * relays where it publishes (`carryChains`; relay transport cMIP draft 4,
 * "Clients", 7, a SHOULD), so the signer named can always be looked up. A
 * chain that cannot be fetched leaves the reference as good as before:
 * `chain` is empty, and `chainProblem` says why.
 */
export async function referTo(
  id: string,
  hints: string[],
  via: Via = {},
): Promise<{ ref: Reference; act: Uint8Array; public: boolean; signer: string; chain: Uint8Array[]; chainProblem?: string }> {
  const act = await firstOf(hints.filter((h) => !cannotReach(h, via)), (h) => relayAt(h, via).getAct(id));
  if (!act) throw new Error(`the act ${id} was not found at ${hints.join(', ')}: a reference is written only to an act this client holds`);
  const d = describeAct(act) as Opened;
  const signer = d.signer ?? d.id;
  const out = { ref: referenceTo(act), act, public: d.public, signer, chain: [] as Uint8Array[] };
  if (!d.public) return out;
  try {
    return { ...out, chain: await chainOf(signer, hints, via) };
  } catch (e) {
    return { ...out, chainProblem: `the identity chain of ${signer} was not found: ${e instanceof Error ? e.message : e}` };
  }
}

/**
 * An identity's chain acts, public, as its homes serve them: its genesis,
 * then its rotations, in order (relay transport cMIP, "Querying an
 * identity", part 1). The identity is looked up first, so the homes asked
 * are those in force at its latest position that counts, side by side; the
 * first that serves a chain beginning with the genesis is taken. For a
 * client to carry (relay transport cMIP draft 4, "Clients", 7).
 */
export async function chainOf(identity: string, hints: string[], via: Via = {}): Promise<Uint8Array[]> {
  const l = await lookUp(identity, hints, via);
  const r = l.resolution;
  const homes = [...new Set([...(r.homesAt?.length ? r.homesAt[r.homesAt.length - 1] : r.homes), ...r.homes].map((h) => h.hint))].filter((h) => !cannotReach(h, via));
  const chain = await firstOf(homes, async (h) => {
    const rec = await relayAt(h, via).identity(identity);
    return rec.chain.length && actId(rec.chain[0]) === identity ? rec.chain : null;
  });
  if (!chain) throw new Error(`no home of ${identity} served its identity chain (${homes.join(', ') || 'none reachable'})`);
  return chain;
}

/** What carrying identity chains to relays did, relay by relay. */
export interface Carried {
  /** The identities whose chains were carried. */
  signers: string[];
  /** Per relay: how many chain acts it took, and why any were refused. */
  relays: { hint: string; kept: number; refused: string[] }[];
  /** Signers whose chain could not be found, each with why. */
  notFound: { signer: string; why: string }[];
}

/**
 * Carry to each relay the identity chains of the signers an act's public
 * references name, other than its own signer's (relay transport cMIP draft
 * 4, "Clients", 7: a client writing a reference to a public act SHOULD
 * carry the referenced signer's identity chain, public, to the relays where
 * it publishes, so the signer named can always be looked up; taken by the
 * project lead under the delegation, `docs/f272-build.md`, Question 2).
 * Each chain is looked up from `hints` (`chainOf`: genesis and rotations as
 * its homes serve them) unless given in `known`, and sent to every relay; a relay's
 * refusal (its policy) is said, never a failure of the act. A private act's
 * references are not read: its relays see only its outside.
 */
export async function carryChains(act: Uint8Array, relays: string[], hints: string[], via: Via = {}, known: Map<string, Uint8Array[]> = new Map()): Promise<Carried> {
  const d = describeAct(act) as Opened & { refSigners?: (string | null | undefined)[] };
  const own = d.signer ?? d.id;
  const signers = d.public ? [...new Set((d.refSigners ?? []).filter((x): x is string => !!x && x !== own))] : [];
  const out: Carried = { signers: [], relays: relays.map((hint) => ({ hint, kept: 0, refused: [] })), notFound: [] };
  for (const signer of signers) {
    let chain = known.get(signer);
    if (!chain?.length) {
      try {
        chain = await chainOf(signer, [...new Set([...hints, ...relays])], via);
      } catch (e) {
        out.notFound.push({ signer, why: e instanceof Error ? e.message : String(e) });
        continue;
      }
    }
    out.signers.push(signer);
    await Promise.all(
      out.relays.map(async (r) => {
        if (cannotReach(r.hint, via)) return;
        for (const c of chain!) {
          try {
            await relayAt(r.hint, via).putAct(c);
            r.kept++;
          } catch (e) {
            r.refused.push(e instanceof Error ? e.message : String(e));
          }
        }
      }),
    );
  }
  return out;
}

export interface Followed {
  act: Uint8Array;
  /** Where it was found. */
  at: string;
  /** How: at the places asked first, or by the signer the reference names (its routes, then its homes). */
  how: 'asked' | 'signer';
  /** Places not tried, each with why. */
  notTried: NotTried[];
}

/**
 * Follow a reference to the act it names (F272): first where the reader
 * already looks (`hints`), side by side; not found there, and the
 * reference names a signer, by that signer: its identity, the homes in
 * force, its routes, then the act, from its outbox routes side by side,
 * and only if they hold nothing, from its homes side by side. The act found must be the one named; where a signer is
 * named, the act found must show it (the reference is wrong otherwise: an
 * error says so, and neither act becomes invalid by it). Nothing found is
 * no proof the act does not exist.
 */
export async function followRef(r: Reference, hints: string[], via: Via = {}): Promise<Followed> {
  const id = refAct(r);
  const named = refSigner(r);
  const notTried: NotTried[] = [];
  const check = (act: Uint8Array): Uint8Array => {
    const d = describeAct(act) as Opened;
    if (d.id !== id) throw new Error(`the act fetched is ${d.id}, not ${id}`);
    const actual = d.signer ?? d.id;
    if (named && actual !== named) throw new Error(`the reference names ${named} as the signer of ${id}, but the act shows ${actual}: the reference is wrong`);
    return act;
  };
  const tryable = (hint: string) => {
    const why = cannotReach(hint, via);
    if (why && !notTried.some((n) => n.hint === hint)) notTried.push({ hint, why });
    return !why;
  };
  const fetchFrom = async (places: string[]) => {
    let at = '';
    const act = await firstOf(places.filter(tryable), async (h) => {
      const a = await relayAt(h, via).getAct(id);
      if (a && !at) at = h;
      return a;
    });
    return act ? { act: check(act), at } : null;
  };
  const here = await fetchFrom(hints);
  if (here) return { ...here, how: 'asked', notTried };
  if (!named) throw new Error(`the act ${id} was not found at ${hints.join(', ')}, and the reference names no signer to look by`);
  let l: Lookup;
  try {
    l = await lookUp(named, hints, via);
  } catch (e) {
    throw new Error(`the act ${id} was not found at ${hints.join(', ')}, and its signer ${named} could not be looked up there: ${e instanceof Error ? e.message : e}`);
  }
  for (const n of l.notTried) if (!notTried.some((x) => x.hint === n.hint)) notTried.push(n);
  const places = (l.verifier as Verifier & { places(signer: string): string[] }).places(named).filter((p) => !hints.includes(p));
  // The signer's outbox routes first, where its content is kept; then its homes. Each group side by side.
  const outbox = new Set(l.routes.routes.filter((x) => (x.kind ?? 0) === 0).flatMap((x) => x.hints.map((h) => h.replace(/\/$/, ''))));
  const there = (await fetchFrom(places.filter((p) => outbox.has(p)))) ?? (await fetchFrom(places.filter((p) => !outbox.has(p))));
  if (there) return { ...there, how: 'signer', notTried };
  throw new Error(`the act ${id} was not found at ${hints.join(', ')}, nor at its signer's routes and homes (${places.join(', ') || 'none found'})`);
}
