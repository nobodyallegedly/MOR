// Follow and mute, as the people cMIP says (cmips/cmip-people-draft-1.md):
// both kept in the app; the follow list private by default (F59: an option
// with a forced default) and published, by choice, as a versioned act; the
// names given to followed identities never leave the app; muting never
// published.
//
// TEST IDENTITIES ONLY, until MOR is frozen.

import { MIRS, SPECS, Verifier, cborDecode, cborEncode, describeAct, hex, sha256, unhex } from '../../genesis/src/core.ts';
import { holdSequence, lookUp } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';

/** The people cMIP's hash: a test value until its creator is named at step 17. */
export const PEOPLE_SPEC = sha256('People cMIP, draft 1, test value until publication');
/** The follow list act (section 3.1). */
export const FOLLOW_LIST = 0;

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
  standing: string;
  /** Acts it names (a reply's), each with the signer the reference names. */
  refs: { id: string; signer: string | null }[];
  to: string[];
  /** When this app first found it, in seconds since 1970: this app's time, not a signed one. */
  found: number;
  problem?: string;
}

/** A private message this app sent, kept here: its sealed copy went to the recipient only. */
export interface Sent {
  id: string;
  to: string;
  text: string;
  /** When this app sent it: this app's time, not a signed one. */
  at: number;
}

/** What Dub keeps about people, for one identity it holds. Never published, except the follow list by choice. */
export interface People {
  follows: Followed[];
  muted: string[];
  /** The follow list's option (section 1.3): private unless published is chosen. */
  list: 'private' | 'published';
  /** The latest follow list act this app published or found, to continue its chain (section 3.3). */
  published: { version: number; act: string } | null;
  /** What was seen of the inbox and "to you", by key. */
  seen: string[];
  /** The inbox as read: where each relay was read up to, and the items found. */
  inbox: { after: Record<string, number>; items: Kept[] };
  sent: Sent[];
}

export const NO_PEOPLE = (): People => ({ follows: [], muted: [], list: 'private', published: null, seen: [], inbox: { after: {}, items: [] }, sent: [] });

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
          if (acts.has(d.id) || !d.public || d.spec !== PEOPLE_SPEC || d.type !== FOLLOW_LIST || d.signer !== identity || !d.payload) continue;
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
