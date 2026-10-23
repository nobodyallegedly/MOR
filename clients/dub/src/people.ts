// Follow and mute, as the people cMIP says (cmips/cmip-people-draft-2.md):
// the follow list, with the names given, a private act sealed to the
// identity itself and kept at its homes, read by any app holding the
// identity (private, the default: F59, an option with a forced default);
// published, by choice, as a versioned act carrying IDs only; muting kept in
// the app, never published.
//
// TEST IDENTITIES ONLY, until MOR is frozen.

import { MIRS, SPECS, Verifier, cborDecode, cborEncode, describeAct, hex, openSealed, sha256, unhex } from '../../genesis/src/core.ts';
import { holdSequence, lookUp } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';

/** The people cMIP's hash, draft 2: a test value until its creator is named at step 17. */
export const PEOPLE_SPEC = sha256('People cMIP, draft 2, test value until publication');
/** Draft 1's hash: its published follow lists are continued as one chain with draft 2's (section 4.2). */
export const PEOPLE_SPEC_1 = sha256('People cMIP, draft 1, test value until publication');
/** The published follow list act (section 4.1). */
export const FOLLOW_LIST = 0;
/** The follow list sealed to oneself (section 3.1). */
export const SEALED_LIST = 1;

/** Said before a follow list is first published (section 3.5), word for word: in `shapes.ts`, which the page shares. */
export { PUBLISH_WARNING } from './shapes.ts';

/** One identity followed: its ID, and the name the person gave it here, if any (never published). */
export interface Followed {
  id: string;
  name: string | null;
}

/** An item of the inbox, as Dub keeps it once read (section "What Dub keeps"). */
export interface Kept {
  /** The act id; for a sealed container that did not open, `sealed:` and its id. */
  key: string;
  /** A public act addressed to this identity or answering it ("to you"), or a private message, or something else. */
  kind: 'public' | 'private' | 'other';
  from: string | null;
  text: string | null;
  /** The signer's own hint (field 9), as written: display only. Absent in what was kept before. */
  hint?: string | null;
  standing: string;
  /** Acts it names (a reply's), each with the signer the reference names. */
  refs: { id: string; signer: string | null }[];
  to: string[];
  /** When this app first found it, in seconds since 1970: this app's time, not a signed one. */
  found: number;
  problem?: string;
  /** A sealed container kept unopened only because nothing here could open it then: read again once something can (the Dubsar runner cMIP, draft 2). */
  retry?: boolean;
  /** A text act's format, where it names one (the appended collective cMIP's, a correction's…). */
  format?: string | null;
  /** An Agreements negotiation message (H18: a proposal to sign, or an answer in its thread): its thread, the message it follows, what it acknowledges. */
  talk?: { thread: string; previous: string | null; acks: string[] };
}

/** A private message this app sent, kept here: its sealed copy went to the recipient only. */
export interface Sent {
  id: string;
  to: string;
  text: string;
  /** When this app sent it: this app's time, not a signed one. */
  at: number;
  /** Everyone else it was sealed to (Cc). */
  cc?: string[];
  /** A collective appended to it (the appended collective cMIP). */
  of?: string | null;
}

/** What Dub keeps about people, for one identity it holds. Never published, except the follow list by choice. */
export interface People {
  follows: Followed[];
  muted: string[];
  /** The follow list's option (section 1.3): private unless published is chosen. */
  list: 'private' | 'published';
  /** The latest follow list act this app published or found, to continue its chain (section 4.3). */
  published: { version: number; act: string } | null;
  /** The latest sealed follow list act this app wrote or read (section 3), and whether the list read was forked (3.5). */
  sealed?: { version: number; act: string; forked?: boolean } | null;
  /** This app's own list was carried over to the sealed list (section 3.7). */
  carried?: boolean;
  /** What was seen of the inbox and "to you", by key. */
  seen: string[];
  /** The inbox as read: where each relay was read up to, and the items found. */
  inbox: { after: Record<string, number>; items: Kept[] };
  sent: Sent[];
  /** Where an identity followed or written to lives, as it was given (H38: its where-it-lives form, or a home beside its ID): hints, kept in this app only, never in the sealed list (the people cMIP carries none). Hints guide, never decide. */
  where?: Record<string, string[]>;
}

export const NO_PEOPLE = (): People => ({ follows: [], muted: [], list: 'private', published: null, sealed: null, carried: false, seen: [], inbox: { after: {}, items: [] }, sent: [] });

/** A follow list act's payload (section 3.1). */
export function followListPayload(a: { version: number; previous: string | null; ids: string[]; withdrawn?: boolean }): Uint8Array {
  const m = new Map<number, unknown>([[0, a.version]]);
  if (a.previous) m.set(1, unhex(a.previous));
  m.set(2, a.withdrawn ? [] : a.ids.map(unhex));
  if (a.withdrawn) m.set(3, true);
  return cborEncode(m);
}

interface Described {
  id: string;
  signer?: string;
  public: boolean;
  spec?: string;
  type?: number;
  payload?: Uint8Array;
}

/** A follow list read from its chain (section 3.2). */
export interface FollowList {
  /** The act that counts: the latest of an unforked chain, or the last before a fork. */
  act: string | null;
  version: number;
  ids: string[];
  withdrawn: boolean;
  /** Where two acts name the same predecessor: the version the fork starts after. */
  forked: number | null;
}

/**
 * An identity's published follow list, as anyone reads it: its follow list
 * acts valid for its chain, at its homes, the relays its routes name and
 * `places`, followed from version 1 (section 3.2). None found: version 0.
 */
export async function readFollowList(identity: string, places: string[], via: Via = {}): Promise<FollowList> {
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  const l = await lookUp(identity, places, via, v);
  const routed = l.routes.routes.filter((r) => (r.kind ?? 0) === 0).flatMap((r) => r.hints);
  const at = [...new Set([...routed, ...places, ...l.resolution.homes.map((h) => h.hint)])];
  await holdSequence(v, identity, l, at, via);
  const acts = new Map<string, { version: number; previous: string | null; ids: string[]; withdrawn: boolean }>();
  for (const h of at) {
    let after: number | undefined;
    try {
      for (;;) {
        const page = await relayAt(h, via).feed({ signer: identity, after });
        for (const it of page.items) {
          if (it.kind !== 'act') continue;
          let d: Described;
          try {
            d = describeAct(it.item) as Described;
          } catch {
            continue;
          }
          if (acts.has(d.id) || !d.public || (d.spec !== PEOPLE_SPEC && d.spec !== PEOPLE_SPEC_1) || d.type !== FOLLOW_LIST || d.signer !== identity || !d.payload) continue;
          v.add(it.item);
          if (v.status(d.id) !== 'valid') continue;
          try {
            const m = cborDecode(d.payload) as Map<number, unknown>;
            const version = Number(m.get(0));
            const prev = m.get(1);
            const ids = (m.get(2) as unknown[]).filter((x): x is Uint8Array => x instanceof Uint8Array).map(hex);
            acts.set(d.id, { version, previous: prev instanceof Uint8Array ? hex(prev) : null, ids, withdrawn: m.get(3) === true });
          } catch {
            // not in the format: not a follow list
          }
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch {
      // that place did not answer
    }
  }
  const out: FollowList = { act: null, version: 0, ids: [], withdrawn: false, forked: null };
  let at_: string | null = null;
  for (;;) {
    const next = [...acts.entries()].filter(([, a]) => a.previous === at_ && a.version === out.version + 1);
    if (next.length !== 1) {
      if (next.length > 1) out.forked = out.version;
      return out;
    }
    const [id, a] = next[0];
    Object.assign(out, { act: id, version: a.version, ids: a.ids, withdrawn: a.withdrawn });
    at_ = id;
  }
}

// ------------------------------------------------------------ the follow list sealed to oneself (section 3)

/** A sealed follow list act's payload (section 3.1): each followed identity as its ID, and the name given it, if any. */
export function sealedListPayload(a: { version: number; previous: string | null; follows: Followed[] }): Uint8Array {
  const m = new Map<number, unknown>([[0, a.version]]);
  if (a.previous) m.set(1, unhex(a.previous));
  m.set(
    2,
    a.follows.map((f) => (f.name ? [unhex(f.id), f.name] : [unhex(f.id)])),
  );
  return cborEncode(m);
}

/** The sealed follow list, as the identity's homes hold it (section 3.4). */
export interface SealedList {
  /** The act that counts; null where none was found. */
  act: string | null;
  version: number;
  follows: Followed[];
  /** Two acts named the same predecessor (3.5). */
  forked: boolean;
  /** Homes that did not answer. */
  problems: string[];
}

export interface Opened {
  act: Uint8Array;
  key?: Uint8Array;
  described: Described;
}

/**
 * How an app opens what is sealed to an identity, a page of containers at a
 * time: each one's act, or null where it does not open. With the encryption
 * keys the app holds (`openerOf`), or through Kišib's runner (the Dubsar
 * runner cMIP, draft 2, section 8).
 */
export type Opener = (sealed: Uint8Array[]) => Promise<(Opened | null)[]>;

/** The opener of the encryption keys an app holds, newest first. */
export function openerOf(identity: string, secrets: Uint8Array[]): Opener {
  return async (sealed) =>
    sealed.map((bytes) => {
      for (const s of secrets) {
        try {
          return openSealed(bytes, identity, s) as Opened;
        } catch {
          // the next key
        }
      }
      return null;
    });
}

/**
 * The identity's own follow list, sealed to itself (section 3.4): at each of
 * its homes, what is addressed to it; each sealed container opened with its
 * encryption keys (newest first); the acts of type 1 it signed itself, valid
 * for its chain; followed from version 1. On a fork, the branch reaching the
 * highest version, then the smaller act id (3.5). Its names are read too: no
 * one but the identity can open them.
 */
export async function readSealedList(identity: string, keys: Uint8Array[] | Opener, homes: string[], via: Via = {}): Promise<SealedList> {
  const out: SealedList = { act: null, version: 0, follows: [], forked: false, problems: [] };
  if (Array.isArray(keys) && !keys.length) return out;
  const open = Array.isArray(keys) ? openerOf(identity, keys) : keys;
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  let l: Awaited<ReturnType<typeof lookUp>>;
  try {
    l = await lookUp(identity, homes, via, v);
  } catch (e) {
    out.problems.push(`its homes did not answer (${e instanceof Error ? e.message : String(e)})`);
    return out;
  }
  const at = [...new Set([...homes, ...l.resolution.homes.map((h) => h.hint)])];
  const acts = new Map<string, { version: number; previous: string | null; follows: Followed[] }>();
  for (const h of at) {
    let after: number | undefined;
    try {
      for (;;) {
        const page = await relayAt(h, via).feed({ to: identity, after });
        const sealed = page.items.filter((it) => it.kind === 'sealed');
        const opened = sealed.length ? await open(sealed.map((it) => it.item)) : [];
        for (const o of opened) {
          const d = o?.described;
          if (!o || !d || acts.has(d.id) || d.public || d.signer !== identity || d.spec !== PEOPLE_SPEC || d.type !== SEALED_LIST || !d.payload) continue;
          if (o.key) l.verifier.addWithKey(o.act, o.key);
          else l.verifier.add(o.act);
          if (l.verifier.status(d.id) !== 'valid') continue;
          try {
            const m = cborDecode(d.payload) as Map<number, unknown>;
            const prev = m.get(1);
            const follows: Followed[] = [];
            for (const x of m.get(2) as unknown[]) {
              if (!Array.isArray(x) || !(x[0] instanceof Uint8Array) || x[0].length !== 32) continue;
              const id = hex(x[0]);
              if (follows.some((f) => f.id === id)) continue;
              follows.push({ id, name: typeof x[1] === 'string' && x[1].trim() ? x[1].slice(0, 64) : null });
            }
            acts.set(d.id, { version: Number(m.get(0)), previous: prev instanceof Uint8Array ? hex(prev) : null, follows });
          } catch {
            // not in the format: not a sealed follow list
          }
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch (e) {
      out.problems.push(`${h}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  // Every chain from version 1; the branch reaching the highest version, then the smaller act id (3.5).
  const best = (from: string | null, version: number): { id: string; depth: number } | null => {
    const next = [...acts.entries()].filter(([, a]) => a.previous === from && a.version === version + 1);
    if (next.length > 1) out.forked = true;
    let pick: { id: string; depth: number; tip: string } | null = null;
    for (const [id] of next) {
      const below = best(id, version + 1);
      const depth = below ? below.depth : version + 1;
      const tip = below ? below.id : id;
      if (!pick || depth > pick.depth || (depth === pick.depth && tip < pick.tip)) pick = { id: tip, depth, tip };
    }
    return pick ? { id: pick.tip, depth: pick.depth } : null;
  };
  const tip = best(null, 0);
  if (tip) {
    const a = acts.get(tip.id)!;
    Object.assign(out, { act: tip.id, version: a.version, follows: a.follows });
  }
  return out;
}
