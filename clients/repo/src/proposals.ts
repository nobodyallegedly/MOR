// Real collectives (H18): what travels between the founder's Edubba and
// each member's Dub, on any device, phone included (this file runs in the
// browser too: nothing from Node).
//
// - **The talk is Agreements' negotiation messages** (type 18, rule 52,
//   F118): one thread per member, the founder's side opening it. Each is a
//   private act sealed to the other side's encryption key and left in its
//   inbox. The founder's first message names the act to sign (terms, a
//   clone, a release) in `refs`; the member's answer acknowledges it, and
//   says signed or declined. They are talk: they bind nothing, and are on
//   neither of a collective's chains (rules 57, 58; W6).
// - **The signature is the Agreements signature act** (type 1), public, as
//   ever: what binds the member.
// - **A share of the collective's chain key travels sealed to a one-time
//   key** (H18, decided by Nobody, allegedly: "never to the member's usual
//   encryption key"). The member's Dub makes an X-Wing key for this share
//   alone and sends its public half with its acceptance; the founder's
//   Edubba seals the share (the air-gapped signer Module's share message,
//   2.4, as a private publication's media) to it and leaves it at the
//   relays, found by its pickup tag; the member's Dub opens it, shows it once
//   as words, and destroys the one-time secret, so that copy can never be
//   opened again.
//
// TEST IDENTITIES ONLY, until MOR is frozen.

import { SPECS, base64, cborDecode, cborEncode, hex, lockMedia, openMedia, openSealed, pickupTag, unhex, workHash, xwingPublic } from '../../genesis/src/core.ts';
import { TestIdentity, receive, sealFor } from '../../genesis/src/identity.ts';
import { leaveAtHomes } from '../../genesis/src/private.ts';
import { relayAt, sealedId, type Via } from '../../genesis/src/transport.ts';
import { REPO_SPECS } from './specs.ts';

/** Agreements' negotiation message (type 18). */
export const NEGOTIATION = 18;

/** The share message's media spec, named in its publication (the air-gapped signer Module, 2.4): a test value until publication. */
export const SHARE_MEDIA = 'f2f9c2b8a6e0c5c1b4a7d1e3f0a9c8b7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1';

/** The line of a member's acceptance that carries the public half of its one-time key, word for word. */
export const ONE_TIME_LINE = 'One-time key for my share of the chain key: ';

/** What the member's answer says, first line, word for word. */
export const SIGNED = 'Signed.';
export const DECLINED = 'Declined.';
/** A member's word, in a founding's thread, that they resigned alone (rule 70), the resignation's act on the next line. */
export const RESIGNED = 'Resigned.';

/** A negotiation message's payload (Agreements, type 18): the message as canonical text. */
export const negotiationPayload = (text: string): Uint8Array => cborEncode(new Map<number, unknown>([[0, text.normalize('NFC')]]));

/** The other side of a thread, as the sender reaches it: its identity, its current encryption key, its inbox relays. */
export interface Reach {
  id: string;
  key: Uint8Array;
  inbox: string[];
}

/** A negotiation message made, sealed and left in the other side's inbox. */
export interface Sent {
  id: string;
  act: Uint8Array;
  key: Uint8Array;
  sealed: string;
  /** The inboxes that took it, and those that did not, with why. */
  left: string[];
  failed: { relay: string; reason: string }[];
}

/**
 * Sign a negotiation message to `to`, private, sealed to its encryption key
 * and left in its inbox (rule 52). `thread`: the thread's first message, and
 * `previous`, the message it follows (both absent for a first message);
 * `acks`: the latest message of the other side received. `refs`: the act it
 * is about (terms, a clone, a release), with its signer. The caller saves
 * `by`'s file after. The act is also left at `by`'s own homes, locked and
 * sealed to itself (H80's question 2: it is the latest act of its app's
 * line, which Kišib must find there), unless `home` is false (Kišib's own
 * acts, a line of their own that nothing else continues).
 */
export async function negotiate(
  by: TestIdentity,
  to: Reach,
  o: { text: string; thread?: string; previous?: string; acks?: string[]; refs?: [string, string][]; home?: boolean },
): Promise<Sent> {
  const made = by.sign(REPO_SPECS.agreements, NEGOTIATION, negotiationPayload(o.text), {
    public: false,
    to: [to.id],
    objects: o.thread ? [[o.thread, o.previous ?? o.thread]] : undefined,
    acks: o.acks?.length ? o.acks : undefined,
    refs: o.refs,
  });
  const sealed = sealFor(made.act, made.key, [{ id: to.id, key: to.key }]);
  const left: string[] = [];
  const failed: { relay: string; reason: string }[] = [];
  for (const hint of to.inbox) {
    try {
      const r = relayAt(hint, by.via);
      for (const c of by.chainActs()) await r.putAct(c).catch(() => undefined);
      await r.putSealed(sealed);
      left.push(hint);
    } catch (e) {
      failed.push({ relay: hint, reason: e instanceof Error ? e.message : String(e) });
    }
  }
  if (o.home !== false) await leaveAtHomes(by, made);
  return { id: made.id, act: made.act, key: made.key, sealed: sealedId(sealed), left, failed };
}

/** A negotiation message, as opened. */
export interface Message {
  id: string;
  from: string;
  to: string[];
  text: string;
  /** Its thread's first message (itself, for a first message), and the message it follows. */
  thread: string;
  previous: string | null;
  acks: string[];
  refs: [string, string][];
}

interface Described {
  id: string;
  signer?: string;
  public: boolean;
  to?: string[];
  spec?: string;
  type?: number;
  payload?: Uint8Array;
  objects?: [string, string][];
  acks?: string[];
  refs?: string[];
  refSigners?: (string | undefined)[];
}

/** Read an opened act as a negotiation message, or null where it is none. */
export function readMessage(d: Described): Message | null {
  if (d.spec !== REPO_SPECS.agreements || d.type !== NEGOTIATION || !d.payload || !d.signer) return null;
  const m = cborDecode(d.payload) as Map<number, unknown>;
  const text = m.get(0);
  if (typeof text !== 'string') return null;
  const link = d.objects?.[0];
  return {
    id: d.id,
    from: d.signer,
    to: d.to ?? [],
    text,
    thread: link ? link[0] : d.id,
    previous: link ? link[1] : null,
    acks: d.acks ?? [],
    refs: (d.refs ?? []).flatMap((r, i): [string, string][] => (d.refSigners?.[i] ? [[r, d.refSigners[i]!]] : [])),
  };
}

/** The public half of the one-time key a member's acceptance carries, or null. */
export function oneTimeKeyOf(text: string): Uint8Array | null {
  const line = text.split('\n').find((l) => l.startsWith(ONE_TIME_LINE));
  if (!line) return null;
  try {
    const k = Uint8Array.from(atob(line.slice(ONE_TIME_LINE.length).trim()), (c) => c.charCodeAt(0));
    return k.length === 1216 ? k : null;
  } catch {
    return null;
  }
}

/** A member's acceptance, in words, with the public half of its one-time key on a line of its own. */
export function acceptanceText(signature: string, oneTime?: Uint8Array): string {
  return [SIGNED, `My signature is act ${signature}.`, ...(oneTime ? [`${ONE_TIME_LINE}${base64(oneTime)}`] : [])].join('\n');
}

// ---------------------------------------------------------------- a share, sealed to a one-time key

/**
 * Seal one member's share (the air-gapped signer Module's share message)
 * to the one-time key it sent: a private publication by `by`, its media the
 * share message, locked; the publication sealed to the one-time key alone,
 * left at `relays` under its pickup tag; the locked media beside it. The
 * publication is not kept anywhere else: its content key lives only in that
 * sealed copy. It is signed on a line of its own (`signApart`), outside
 * `by`'s sequence and never at its homes (H80's question 2): no app of `by`
 * may open it, so it must not sit on a line they follow. *Cost:* it is void
 * after `by`'s next change of keys; the member opens it once, before.
 */
export async function sealShare(by: TestIdentity, share: Uint8Array, oneTime: Uint8Array, relays: string[]): Promise<{ sealed: string; publication: string; left: string[] }> {
  const l = lockMedia(share) as { locked: Uint8Array; key: Uint8Array; nonce: Uint8Array; lockedHash: string; workHash: string };
  const payload = cborEncode(
    new Map<number, unknown>([
      [0, unhex(SHARE_MEDIA)],
      [1, unhex(l.workHash)],
      [2, unhex(l.lockedHash)],
      [3, share.length],
      [4, l.nonce],
      [5, l.key],
      [6, relays],
    ]),
  );
  const made = by.signApart(SPECS.envelopes, 0, payload);
  const sealed = sealFor(made.act, made.key, [{ key: oneTime }]);
  const tag = pickupTag(oneTime);
  const left: string[] = [];
  for (const hint of relays) {
    try {
      const r = relayAt(hint, by.via);
      await r.putMedia(l.locked);
      await r.putSealed(sealed, [tag]);
      left.push(hint);
    } catch {
      // that relay is away: the others hold it
    }
  }
  if (!left.length) throw new Error(`No relay took the share (${relays.join(', ')}).`);
  return { sealed: sealedId(sealed), publication: made.id, left };
}

/**
 * Find and open a share sealed to a one-time key (its secret), at `relays`:
 * the share message's bytes, or null where none is there yet. Throws where a
 * container is there but does not open or does not hold a share.
 */
export async function openShare(secret: Uint8Array, relays: string[], senderHints: string[], via: Via = {}): Promise<{ share: Uint8Array; from: string; status: string } | null> {
  const tag = pickupTag(xwingPublic(secret));
  for (const hint of relays) {
    let items: { kind: string; item: Uint8Array }[] = [];
    try {
      items = (await relayAt(hint, via).feed({ pickup: tag })).items;
    } catch {
      continue;
    }
    for (const it of items) {
      if (it.kind !== 'sealed') continue;
      const r = await receive(it.item, null, [secret], senderHints, via);
      if (!r.opened || !r.act) continue;
      const opened = await openedAct(it.item, secret);
      if (!opened) continue;
      const m = cborDecode(opened.payload) as Map<number, unknown>;
      if (hex(m.get(0) as Uint8Array) !== SHARE_MEDIA) throw new Error('What was sealed to this one-time key is not a share.');
      const lockedHash = hex(m.get(2) as Uint8Array);
      for (const h of [...new Set([...((m.get(6) as string[]) ?? []), ...relays])]) {
        let locked: Uint8Array | null = null;
        try {
          locked = await relayAt(h, via).getMedia(lockedHash);
        } catch {
          locked = null;
        }
        if (!locked) continue;
        const share = openMedia(locked, m.get(5) as Uint8Array, m.get(4) as Uint8Array) as Uint8Array;
        if (workHash(share) !== hex(m.get(1) as Uint8Array)) throw new Error('The share does not match its fingerprint.');
        return { share, from: r.from ?? '', status: r.status ?? 'unknown' };
      }
      throw new Error('The share was sealed to this key, but its contents were not found at the relays.');
    }
  }
  return null;
}

async function openedAct(sealed: Uint8Array, secret: Uint8Array): Promise<{ payload: Uint8Array } | null> {
  try {
    const o = openSealed(sealed, undefined, secret) as { described: { payload?: Uint8Array; spec?: string; type?: number } };
    if (o.described.spec !== SPECS.envelopes || o.described.type !== 0 || !o.described.payload) return null;
    return { payload: o.described.payload };
  } catch {
    return null;
  }
}

