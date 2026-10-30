// A price tag (Money type 5, Money rule 18): a price is its own act, signed
// by the seller, naming what it prices (a bake, or a publication), the
// price, and the payee. On a bare bake only its uploader's tag counts, and
// paying it pays the uploader, unsplit. Under a publication only the split
// service's tag, or the designated party's, counts (Agreements judges it).
//
// A tag is versioned, as a payee pointer is: each later version names the
// first and the one it replaces in `objects` ([first, previous]), carries
// its version plus one, and is signed by the same signer. The latest
// version counts. A version with no price withdraws the tag: that is how a
// seller stops selling a bare bake (the bake itself is never withdrawn).

import { MIRS, cborDecode, describeAct, hex, moneyPayload, type Verifier } from '../../genesis/src/core.ts';
import type { TestIdentity } from '../../genesis/src/identity.ts';
import { cannotReach } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { PRICE_TAG } from './specs.ts';

export interface Amount {
  unit: string;
  value: number;
}

/** What a tag prices: a bare bake, or a publication by its founding version. */
export type Priced = { bake: string } | { publication: string };

/** A price tag's version, read from its act. */
export interface TagRead {
  /** This version's act id. */
  id: string;
  /** Its signer: on a bare bake, it counts only where this is the uploader. */
  signer: string;
  bake: string | null;
  publication: string | null;
  version: number;
  /** The version it replaces (absent for version 1). */
  previous: string | null;
  /** The first version: what a later version names first in its objects. */
  first: string;
  /** The price; null where this version withdraws the tag. */
  price: Amount | null;
  payee: string;
}

/** The act's id where it is a price tag, read; null otherwise. */
export function readTag(act: Uint8Array): TagRead | null {
  let d: { id: string; signer?: string; spec?: string; type?: number; payload?: Uint8Array; objects?: [string, string][] };
  try {
    d = describeAct(act) as typeof d;
  } catch {
    return null;
  }
  if (d.spec !== MIRS.money || d.type !== PRICE_TAG || !d.payload || !d.signer) return null;
  try {
    const m = cborDecode(d.payload) as Map<number, unknown>;
    const bake = m.get(0);
    const publication = m.get(1);
    const version = m.get(2);
    const previous = m.get(3);
    const price = m.get(4) as [Uint8Array, number] | undefined;
    const payee = m.get(5);
    if (!(payee instanceof Uint8Array) || typeof version !== 'number' && typeof version !== 'bigint') return null;
    if ((bake instanceof Uint8Array) === (publication instanceof Uint8Array)) return null;
    const v = Number(version);
    return {
      id: d.id,
      signer: d.signer,
      bake: bake instanceof Uint8Array ? hex(bake) : null,
      publication: publication instanceof Uint8Array ? hex(publication) : null,
      version: v,
      previous: previous instanceof Uint8Array ? hex(previous) : null,
      first: v === 1 ? d.id : (d.objects?.[0]?.[0] ?? d.id),
      price: Array.isArray(price) && price[0] instanceof Uint8Array ? { unit: hex(price[0]), value: Number(price[1]) } : null,
      payee: hex(payee),
    };
  } catch {
    return null;
  }
}

/** The payload of a tag's version (Money, "Price tag (type 5)"), through the core library. */
export function tagPayload(a: Priced & { version: number; previous?: string | null; price: Amount | null; payee: string }): { type: number; payload: Uint8Array } {
  return moneyPayload({
    type: 'priceTag',
    ...('bake' in a ? { bake: a.bake } : { publication: a.publication }),
    version: a.version,
    ...(a.previous ? { previous: a.previous } : {}),
    ...(a.price ? { price: a.price } : {}),
    payee: a.payee,
  }) as { type: number; payload: Uint8Array };
}

/**
 * Put a price on a bake or a publication: the tag's first version, or,
 * given the version that counts now (`after`), the next one, naming
 * `[first, previous]`. A price of null withdraws the tag. Public, at these
 * relays. The payee defaults to the signer.
 */
export async function putTag(by: TestIdentity, on: Priced, a: { price: Amount | null; payee?: string; relays: string[]; after?: TagRead | null }): Promise<TagRead & { act: Uint8Array }> {
  if (a.price && (!Number.isSafeInteger(a.price.value) || a.price.value <= 0)) throw new Error('A price is a whole amount above zero. Nothing was signed.');
  const after = a.after ?? null;
  if (!after && !a.price) throw new Error('There is no price tag to withdraw. Nothing was signed.');
  if (after && after.signer !== by.id) throw new Error('That price tag was signed by another identity: only its signer can change or withdraw it. Nothing was signed.');
  const version = after ? after.version + 1 : 1;
  const payee = a.payee ?? after?.payee ?? by.id;
  const p = tagPayload({ ...on, version, previous: after?.id ?? null, price: a.price, payee });
  const made = await by.publish(MIRS.money, p.type, p.payload, { public: true, relays: a.relays, ...(after ? { objects: [[after.first, after.id]] } : {}) });
  return { ...readTag(made.act)!, act: made.act };
}

/** Withdraw a price tag (Money rule 18): its next version, with no price, signed by its signer alone. */
export async function withdrawTag(by: TestIdentity, latest: TagRead, relays: string[]): Promise<TagRead & { act: Uint8Array }> {
  if (!latest.price) throw new Error('That price tag is withdrawn already. Nothing was signed.');
  return putTag(by, latest.bake ? { bake: latest.bake } : { publication: latest.publication! }, { price: null, relays, after: latest });
}

/**
 * The versions of `signer`'s price tags naming `on`, found in its feed at
 * these relays, side by side, with their acts; and the latest that counts
 * on its line: each version naming the one before, the longest line, and
 * where two name the same previous one (a fork), the last before it.
 * Silence proves nothing: a version not reached is not counted.
 */
export async function tagsOf(on: Priced, signer: string, hints: string[], via: Via = {}): Promise<{ latest: TagRead | null; acts: Uint8Array[] }> {
  const found = new Map<string, { t: TagRead; act: Uint8Array }>();
  const target = 'bake' in on ? on.bake : on.publication;
  await Promise.all(
    hints
      .filter((h) => !cannotReach(h, via))
      .map(async (h) => {
        let after: number | undefined;
        for (let i = 0; i < 200; i++) {
          let page;
          try {
            page = await relayAt(h, via).feed({ signer, after });
          } catch {
            return;
          }
          for (const it of page.items) {
            if (it.kind !== 'act') continue;
            const t = readTag(it.item);
            if (!t || t.signer !== signer || (t.bake ?? t.publication) !== target) continue;
            found.set(t.id, { t, act: it.item });
          }
          if (!page.items.length || page.next === after) return;
          after = page.next;
        }
      }),
  );
  const all = [...found.values()];
  const firsts = all.filter((x) => x.t.version === 1).sort((a, b) => (a.t.id < b.t.id ? -1 : 1));
  let latest: TagRead | null = null;
  // One line per first version; the last of them, by id, where a signer started two (each stands; the reader shows the latest line it reads).
  for (const f of firsts) {
    let at = f.t;
    for (;;) {
      const next = all.filter((x) => x.t.previous === at.id && x.t.version === at.version + 1 && x.t.first === f.t.id);
      if (next.length !== 1) break; // none, or a fork: the last before it
      at = next[0].t;
    }
    latest = at;
  }
  return { latest, acts: all.map((x) => x.act) };
}

/** Whose offer a tag is, as the core library judges it (Money rule 18): "counts", "nobody's offer", "unknown". */
export function tagStanding(v: Verifier, tag: string): string {
  return v.priceTag(tag) ?? 'unknown';
}
