// A post with a picture, as MOR acts (F27): the picture is a public
// publication (Envelopes type 0) of a JPEG (the JPEG Module); the post is a
// text act (Text MIR, type 0) whose refs name that publication. Publishing
// and reading go through the genesis client's identity and transport, and
// every judgement through the core library.

import {
  MIRS,
  SPECS,
  Verifier,
  cborDecode,
  cborEncode,
  describeAct,
  hex,
  lockMedia,
  openMedia,
  openWithKey,
  unhex,
  workHash,
} from '../../genesis/src/core.ts';
import type { TestIdentity } from '../../genesis/src/identity.ts';
import { cannotReach, firstOf, followRef, lookUp, referenceTo, type NotTried, type Reference } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { NotJpeg, read, strip, type Carried, type Picture } from '../../../modules/jpeg/src/jpeg.ts';
import { POST_SPECS, PUBLICATION, TEXT_ACT, WITHDRAWAL } from './specs.ts';

// ---------------------------------------------------------------- posting

/** Send the signer's identity-chain acts along, so a reader who knows only a relay finds its genesis, and from it its homes. */
async function carryChain(by: TestIdentity, relays: string[]): Promise<void> {
  for (const hint of relays) {
    for (const a of by.chainActs()) {
      try {
        await relayAt(hint, by.via).putAct(a);
      } catch {
        // that relay's policy, or it is away
      }
    }
  }
}

export interface PublishedPicture {
  /** The publication's act id. */
  id: string;
  /** The publication itself, as signed: held, so a post can refer to it (F272). */
  act: Uint8Array;
  /** What was stripped out before publishing (JPEG Module, rule 6). */
  removed: Carried[];
  picture: Picture;
  work: string;
  size: number;
}

/**
 * Publish a JPEG, public: stripped to the picture alone (JPEG Module, rule
 * 6), locked with its own key (Envelopes, "Media"), described by a public
 * publication, and its locked bytes sent to the relays after it, so that a
 * relay that keeps only media some publication names takes them.
 */
export async function publishPicture(by: TestIdentity, jpeg: Uint8Array, relays: string[]): Promise<PublishedPicture> {
  const s = strip(jpeg);
  const l = lockMedia(s.bytes) as { locked: Uint8Array; key: Uint8Array; nonce: Uint8Array; lockedHash: string; workHash: string };
  const payload = cborEncode(
    new Map<number, unknown>([
      [0, unhex(POST_SPECS.jpeg)],
      [1, unhex(l.workHash)],
      [2, unhex(l.lockedHash)],
      [3, s.bytes.length],
      [4, l.nonce],
      [5, l.key],
      [6, relays],
    ]),
  );
  await carryChain(by, relays);
  const made = await by.publish(POST_SPECS.envelopes, PUBLICATION, payload, { public: true, relays });
  for (const hint of relays) await relayAt(hint, by.via).putMedia(l.locked);
  return { id: made.id, act: made.act, removed: s.removed, picture: s.picture, work: l.workHash, size: s.bytes.length };
}

/** A text act's payload: the text and, optionally, its format (Text MIR, "Act format"). */
export function textPayload(text: string, format: string | null = null): Uint8Array {
  const m = new Map<number, unknown>([[0, text]]);
  if (format) m.set(1, unhex(format));
  return cborEncode(m);
}

export interface Posted {
  /** The post: the text act's id. */
  id: string;
  picture: PublishedPicture | null;
}

/**
 * Post a text, with a picture if one is given: the picture's publication
 * first, then the text act naming it in `refs`, with its signer (a public
 * act, held: Envelopes draft 9, rule 20, F272). The text must already be
 * canonical (compose it first); the core library refuses it otherwise.
 * Save the identity file after: its sequence has grown.
 */
export async function post(
  by: TestIdentity,
  opts: { text: string; jpeg?: Uint8Array; format?: string | null; relays: string[] },
): Promise<Posted> {
  const picture = opts.jpeg ? await publishPicture(by, opts.jpeg, opts.relays) : null;
  await carryChain(by, opts.relays);
  const made = await by.publish(POST_SPECS.text, TEXT_ACT, textPayload(opts.text, opts.format ?? null), {
    public: true,
    relays: opts.relays,
    refs: picture ? [referenceTo(picture.act)] : undefined,
  });
  return { id: made.id, picture };
}

/**
 * Withdraw a publication (Envelopes, "Withdrawal"): an act of type 3 naming
 * it in `objects`, the publication being the root of its own chain. Only its
 * signer, or the identity in its `for`, can.
 */
export async function withdraw(by: TestIdentity, publication: string, relays: string[]): Promise<{ id: string }> {
  const made = await by.publish(POST_SPECS.envelopes, WITHDRAWAL, cborEncode(new Map()), {
    public: true,
    relays,
    objects: [[publication, publication]],
  });
  return { id: made.id };
}

// ---------------------------------------------------------------- reading

interface Described {
  id: string;
  signer?: string;
  public: boolean;
  spec?: string;
  type?: number;
  objects?: [string, string][];
  refs?: string[];
  /** The signer each of `refs` names beside it (F272), or nothing. */
  refSigners?: (string | undefined)[];
  payload?: Uint8Array;
}

/** A picture a post refers to, as this client shows it. */
export interface ShownPicture {
  kind: 'picture';
  publication: string;
  signer: string;
  /** The publication's standing for its signer's chain, as the core library judges it. */
  standing: string;
  /** Set when the picture is not shown, saying why. */
  problem: string | null;
  /** A withdrawal by its signer (or its `for`) found at the relays asked; the picture is then not shown. */
  withdrawn: string | null;
  /** The JPEG, checked against the publication's hashes and size. */
  bytes: Uint8Array | null;
  picture: Picture | null;
}

/** Anything else a post refers to: named, not shown. */
export interface OtherRef {
  kind: 'act';
  id: string;
  /** The signer the reference names beside the act (F272), if any. */
  signer?: string;
  /** What it is, in a few words, when it was found and opened. */
  what: string;
}

export interface ShownPost {
  id: string;
  signer: string;
  standing: string;
  text: string;
  format: string | null;
  refs: (ShownPicture | OtherRef)[];
  /** Addresses not tried, because this client cannot reach them (an onion address from a browser), each with why. */
  notTried: NotTried[];
}

/** An act by id from the places asked, side by side; the first that holds it (reading B4). */
async function fetchAct(id: string, hints: string[], via: Via): Promise<Uint8Array | null> {
  return firstOf(hints.filter((h) => !cannotReach(h, via)), (h) => relayAt(h, via).getAct(id));
}

function describeChecked(act: Uint8Array, id: string): Described {
  const d = describeAct(act) as Described;
  if (d.id !== id) throw new Error(`the relay answered with ${d.id}, not ${id}`);
  if (d.public && !d.payload) {
    // It carries its key but does not open: ask the core why.
    openWithKey(act, new Uint8Array(32));
    throw new Error('the act does not open');
  }
  return d;
}

/** What judges an act's standing through its signer's identity chain. */
export interface Judging {
  standing(act: Uint8Array, id: string, signer: string): Promise<string>;
  /** Addresses not tried by any lookup, each with why, where the judge keeps them. */
  notTried?: NotTried[];
}

/** Identities already looked up into this verifier. */
class Judge implements Judging {
  v: Verifier;
  /** Addresses not tried by any lookup, each with why. */
  notTried: NotTried[] = [];
  private looked = new Map<string, Promise<void>>();
  constructor(
    private hints: string[],
    private via: Via,
  ) {
    this.v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements);
  }
  async standing(act: Uint8Array, id: string, signer: string): Promise<string> {
    // One lookup per signer, shared by everything read side by side.
    let l = this.looked.get(signer);
    if (!l) {
      l = lookUp(signer, this.hints, this.via, this.v).then((x) => {
        for (const n of x.notTried) if (!this.notTried.some((y) => y.hint === n.hint)) this.notTried.push(n);
      });
      this.looked.set(signer, l);
    }
    await l;
    this.v.add(act);
    return this.v.status(id);
  }
}

/**
 * Read a post: fetch the text act by its id from the first place that has
 * it, check it is the act asked for and a text act, judge it through its
 * signer's identity chain, and read every act it refers to. A picture is
 * shown only if its publication is valid, public, of the JPEG Module, not
 * withdrawn, and its bytes match the publication's hashes and size and read
 * as a JPEG. With `judging`, several posts are judged together, each
 * signer looked up once (the site's feed, website cMIP draft 6).
 */
export async function readPost(id: string, hints: string[], via: Via = {}, judging?: Judging): Promise<ShownPost> {
  const act = await fetchAct(id, hints, via);
  if (!act) throw new Error(`the act ${id} was not found at ${hints.join(', ')}`);
  const d = describeChecked(act, id);
  if (!d.public) throw new Error('the post is not public');
  if (d.spec !== POST_SPECS.text || d.type !== TEXT_ACT) throw new Error('the act is not a text act');
  if (!d.signer) throw new Error('the act has no signer');
  const p = cborDecode(d.payload!) as Map<number, unknown>;
  const text = p.get(0);
  if (typeof text !== 'string') throw new Error('the text act has no text');
  const f = p.get(1);
  const judge = judging ?? new Judge(hints, via);
  const standing = await judge.standing(act, id, d.signer);
  const named: Reference[] = (d.refs ?? []).map((r, i) => (d.refSigners?.[i] ? [r, d.refSigners[i]!] : r));
  const refs = await Promise.all(named.map((r) => readRef(r, hints, via, judge)));
  return { id, signer: d.signer, standing, text, format: f instanceof Uint8Array ? hex(f) : null, refs, notTried: judge.notTried ?? [] };
}

/**
 * Read an act a post refers to: from the places asked; not there, and the
 * reference names a signer, by that signer's homes and routes (F272). A
 * reference whose signer is wrong is said, the act fetched showing its own.
 */
async function readRef(r: Reference, hints: string[], via: Via, judge: Judging): Promise<ShownPicture | OtherRef> {
  const id = typeof r === 'string' ? r : r[0];
  const signer = typeof r === 'string' ? undefined : r[1];
  let act: Uint8Array | null = null;
  try {
    const f = await followRef(r, hints, via);
    act = f.act;
    if (judge.notTried) for (const n of f.notTried) if (!judge.notTried.some((x) => x.hint === n.hint)) judge.notTried.push(n);
  } catch (e) {
    const why = e instanceof Error ? e.message : String(e);
    if (/the reference is wrong/.test(why)) return { kind: 'act', id, signer, what: why };
  }
  if (!act) return { kind: 'act', id, signer, what: signer ? "not found at the relays asked, nor at its signer's routes and homes" : 'not found at the relays asked' };
  let d: Described;
  try {
    d = describeChecked(act, id);
  } catch (e) {
    return { kind: 'act', id, signer, what: `not a valid act: ${e instanceof Error ? e.message : e}` };
  }
  if (!d.public) return { kind: 'act', id, signer, what: 'a private act' };
  if (d.spec === POST_SPECS.text && d.type === TEXT_ACT) return { kind: 'act', id, signer, what: 'a text act' };
  if (d.spec !== POST_SPECS.envelopes || d.type !== PUBLICATION) return { kind: 'act', id, signer, what: 'an act of a specification this client does not implement' };
  return readPicture(act, d, hints, via, judge);
}

async function readPicture(act: Uint8Array, d: Described, hints: string[], via: Via, judge: Judging): Promise<ShownPicture> {
  const out: ShownPicture = {
    kind: 'picture',
    publication: d.id,
    signer: d.signer ?? '',
    standing: 'unknown',
    problem: null,
    withdrawn: null,
    bytes: null,
    picture: null,
  };
  const no = (why: string) => ((out.problem = why), out);
  if (!d.signer) return no('the publication has no signer');
  out.standing = await judge.standing(act, d.id, d.signer);
  if (out.standing !== 'valid') return no(`the publication is ${out.standing}, not valid, for its signer's identity chain`);
  const m = cborDecode(d.payload!) as Map<number, unknown>;
  const spec = m.get(0);
  if (!(spec instanceof Uint8Array) || hex(spec) !== POST_SPECS.jpeg) return no('media of a type this client does not implement');
  const work = m.get(1);
  const lockedHash = m.get(2);
  const size = m.get(3);
  const nonce = m.get(4);
  const key = m.get(5);
  if (!(key instanceof Uint8Array)) return no('the picture is locked: its key is not public');
  if (!(work instanceof Uint8Array) || !(lockedHash instanceof Uint8Array) || typeof size !== 'number' || !(nonce instanceof Uint8Array)) {
    return no('the publication does not describe its media');
  }
  out.withdrawn = await findWithdrawal(d.id, d.signer, m.get(8), hints, via, judge);
  if (out.withdrawn) return no('withdrawn by its signer');

  // The reader's own relays first; only then the places the publication names.
  const named = Array.isArray(m.get(6)) ? (m.get(6) as unknown[]).filter((x): x is string => typeof x === 'string') : [];
  // Each group side by side (reading B4); the publication's places only if the reader's own relays hold nothing.
  const media = (places: string[]) => firstOf(places.filter((h) => !cannotReach(h, via)), (h) => relayAt(h, via).getMedia(hex(lockedHash)));
  const locked = (await media(hints)) ?? (await media(named.filter((n) => !hints.includes(n))));
  if (!locked) return no('its bytes were not found');
  let plain: Uint8Array;
  try {
    plain = openMedia(locked, key, nonce);
  } catch {
    return no('its key does not open its bytes');
  }
  if (workHash(plain) !== hex(work) || plain.length !== size) return no('its bytes do not match the work hash and size it was published with');
  try {
    out.picture = read(plain);
  } catch (e) {
    if (e instanceof NotJpeg) return no(`not a JPEG this client reads: ${e.message}`);
    throw e;
  }
  out.bytes = plain;
  return out;
}

/**
 * Look for a withdrawal of a publication at the relays asked: an Envelopes
 * act of type 3, naming it in `objects`, valid, and signed by its signer or
 * by the identity in its `for`. Silence proves nothing (relay transport
 * cMIP): a picture is shown when none is found where the reader looked.
 */
async function findWithdrawal(
  publication: string,
  signer: string,
  forId: unknown,
  hints: string[],
  via: Via,
  judge: Judging,
): Promise<string | null> {
  const who = [signer];
  if (forId instanceof Uint8Array) who.push(hex(forId));
  // Every relay and signer side by side (reading B4); the first valid withdrawal found counts.
  const search = async (h: string, s: string): Promise<string | null> => {
    let after: number | undefined;
    for (;;) {
      let page;
      try {
        page = await relayAt(h, via).feed({ signer: s, after });
      } catch {
        return null;
      }
      for (const it of page.items) {
        if (it.kind !== 'act') continue;
        let d: Described;
        try {
          d = describeAct(it.item) as Described;
        } catch {
          continue;
        }
        if (d.spec !== POST_SPECS.envelopes || d.type !== WITHDRAWAL || !d.signer) continue;
        if (!(d.objects ?? []).some(([chain]) => chain === publication)) continue;
        if ((await judge.standing(it.item, d.id, d.signer)) === 'valid') return d.id;
      }
      if (!page.items.length || page.next === after) return null;
      after = page.next;
    }
  };
  const pairs = hints.filter((h) => !cannotReach(h, via)).flatMap((h) => who.map((s) => [h, s] as const));
  return firstOf(pairs, ([h, s]) => search(h, s));
}

/** The posts an identity has published at a relay, newest last: text acts only. */
export async function listPosts(signer: string, hint: string, via: Via = {}): Promise<string[]> {
  const out: string[] = [];
  let after: number | undefined;
  for (;;) {
    const page = await relayAt(hint, via).feed({ signer, after });
    for (const it of page.items) {
      if (it.kind !== 'act') continue;
      try {
        const d = describeAct(it.item) as Described;
        if (d.spec === POST_SPECS.text && d.type === TEXT_ACT) out.push(d.id);
      } catch {
        // not an act this client reads
      }
    }
    if (!page.items.length || page.next === after) break;
    after = page.next;
  }
  return out;
}
