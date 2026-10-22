// A pay-per-view post (round 2, asked by Nobody, allegedly): an envelope
// sealed until its terms are met, with an offer. The text is the media of a
// public publication (Envelopes type 0) whose media key is absent, so the
// publication is public (anyone sees the offer) and its bytes stay locked
// (Envelopes, "Media": "for media on sale, the publication is public but the
// media key is absent, and is delivered to each buyer"); its price in
// field 7. A lone seller's standing offer (Agreements type 6) sells it, its
// words stating the price and the referral share (F351: a promise in
// words, not judged; the judged form, a one-party agreement with a split
// plan, is round 3's). A post (a text act) names both, so it shows in a feed.
//
// After a buyer pays, the seller's Damgar tells the seller's Dub (a sale,
// sealed to oneself), which delivers the key: a key delivery (Envelopes
// type 1), a private act sealed to the buyer. The buyer opens the bytes and
// checks them against the work hash (Envelopes rule 21).
//
// A repost is a text act naming the publication and the offer (Envelopes
// rule 20: "a repost is a reference to a publication"); the reposter's
// client holds what it names (F272) and its locked bytes at its own relays,
// so a reader who reads only those relays finds the work through it.

import { MIRS, cborDecode, cborEncode, describeAct, hex, lockMedia, openMedia, unhex, workHash } from '../../genesis/src/core.ts';
import type { TestIdentity } from '../../genesis/src/identity.ts';
import { referenceTo } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { POST_SPECS, PUBLICATION, TEXT_ACT } from './specs.ts';
import { textPayload } from './post.ts';
import { strip } from '../../../modules/jpeg/src/jpeg.ts';
import { read as readFilm, strip as stripFilm, MAX_BYTES as FILM_MAX_BYTES, CARRIED_WORDS as FILM_CARRIED } from '../../../modules/video/src/video.ts';
import { read as readSound, strip as stripSound, MAX_BYTES as SOUND_MAX_BYTES, CARRIED_WORDS as SOUND_CARRIED } from '../../../modules/audio/src/audio.ts';

/** The media spec of a sealed text: the Text MIR itself (its bytes canonical text, UTF-8). Confirmed by Nobody, allegedly (F352). */
export const SEALED_TEXT = POST_SPECS.text;

/** The media spec of a sealed picture: the JPEG Module (round 3, Edubba's Publishing tab: the media modules the apps carry, decided by Nobody, allegedly, 19 October 2026: "Keep it to the modules supported by the app"). */
export const SEALED_PICTURE = POST_SPECS.jpeg;

/** The media spec of a sealed film and of a sealed recording: the video Module and the audio Module (Edubba's Publishing, decided by Nobody, allegedly, 21 October 2026: video and audio added). */
export const SEALED_VIDEO = POST_SPECS.video;
export const SEALED_AUDIO = POST_SPECS.audio;

/** What a sealed work may be: the media modules Edubba and Dub carry (text, JPEG pictures, MP4 films, M4A recordings). */
export type SealedMedia = 'text' | 'picture' | 'video' | 'audio';
export const MEDIA_SPEC: Record<SealedMedia, string> = { text: SEALED_TEXT, picture: SEALED_PICTURE, video: SEALED_VIDEO, audio: SEALED_AUDIO };
export const mediaOf = (spec: string): SealedMedia | null => (Object.entries(MEDIA_SPEC).find(([, x]) => x === spec)?.[0] as SealedMedia | undefined) ?? null;

/** Each kind in words: "a sealed film". */
export const MEDIA_WORDS: Record<SealedMedia, string> = { text: 'text', picture: 'picture', video: 'film', audio: 'recording' };

/** Rules 2 to 9 of the video or audio Module, on bytes opened by a buyer, before anything plays: throws, saying why, for what the Module refuses. */
export function checkPlayable(media: SealedMedia, bytes: Uint8Array): void {
  if (media === 'video') readFilm(bytes);
  else if (media === 'audio') readSound(bytes);
}

/**
 * A work locked for sale (Envelopes, "Media": the publication public, its
 * media key absent, delivered to each buyer): the publication's payload,
 * its price in field 7, and the locked bytes. A picture is first stripped to
 * the picture alone (the JPEG Module, rule 6); what was stripped is said.
 * `forId`: field 8, the identity the publication is made for (its payment
 * goes to that one's payee pointer), where it is not the signer.
 */
export function lockWork(a: { media: SealedMedia; bytes: Uint8Array; price: Amount; relays: string[]; forId?: string }): { payload: Uint8Array; locked: Uint8Array; key: string; work: string; size: number; removed: string[] } {
  let bytes = a.bytes;
  let removed: string[] = [];
  if (a.media === 'picture') {
    const s = strip(a.bytes);
    bytes = s.bytes;
    removed = s.removed;
  } else if (a.media === 'video' || a.media === 'audio') {
    // Rule 10 of each Module: stripped to the film or the sound alone before locking; the work hash, locked hash and size are the stripped file's.
    const max = a.media === 'video' ? FILM_MAX_BYTES : SOUND_MAX_BYTES;
    if (a.bytes.length > max) throw new Error(`the file is ${a.bytes.length.toLocaleString('en')} bytes; the ${a.media === 'video' ? 'video' : 'audio'} Module takes at most ${max.toLocaleString('en')}`);
    if (a.media === 'video') {
      const s = stripFilm(a.bytes);
      bytes = s.bytes;
      removed = s.removed.map((c) => FILM_CARRIED[c]);
    } else {
      const s = stripSound(a.bytes);
      bytes = s.bytes;
      removed = s.removed.map((c) => SOUND_CARRIED[c]);
    }
  } else {
    bytes = new TextEncoder().encode(new TextDecoder('utf-8', { fatal: true }).decode(a.bytes));
  }
  const l = lockMedia(bytes) as { locked: Uint8Array; key: Uint8Array; nonce: Uint8Array; lockedHash: string; workHash: string };
  const m = new Map<number, unknown>([
    [0, unhex(MEDIA_SPEC[a.media])],
    [1, unhex(l.workHash)],
    [2, unhex(l.lockedHash)],
    [3, bytes.length],
    [4, l.nonce],
    [6, a.relays],
    [7, [unhex(a.price.unit), a.price.value]],
  ]);
  if (a.forId) m.set(8, unhex(a.forId));
  return { payload: cborEncode(m), locked: l.locked, key: hex(l.key), work: l.workHash, size: bytes.length, removed };
}

/**
 * A standing offer's payload (Agreements type 6, "Standing offer"): what it
 * sells (a publication, or a vow by its name), its price, its words; for
 * co-owners, the agreement it is made under (field 0) and who is paid
 * (field 3: in a collective, the collective). A lone seller's offer names
 * neither, and is itself the agreement with the buyer (F215).
 */
export function offerPayload(a: { sells: { publication: string } | { vow: string }; price: Amount; words: string; under?: string; payee?: string }): Uint8Array {
  const m = new Map<number, unknown>();
  if (a.under) m.set(0, unhex(a.under));
  m.set(1, ['publication' in a.sells ? [0, unhex(a.sells.publication)] : [3, unhex(a.sells.vow)]]);
  m.set(2, [unhex(a.price.unit), a.price.value]);
  if (a.payee) m.set(3, unhex(a.payee));
  m.set(4, a.words);
  return cborEncode(m);
}

/** Agreements' standing offer (type 6) and Envelopes' key delivery (type 1). */
export const OFFER = 6;
export const KEY_DELIVERY = 1;

export interface Amount {
  unit: string;
  value: number;
}

/** The offer's words: its price, said by the seller's app, and the referral share in the one sentence Damgar reads (F351). */
export function offerWords(price: string, referral: number | null): string {
  return `A sealed post, opened once paid: ${price}.${referral ? ` Referral: ${referral}% of the price to the repost the buyer names.` : ''}`;
}

/** What a seller keeps of a sealed post: the key that opens it. */
export interface Sealed {
  publication: string;
  offer: string;
  post: string;
  key: string;
  /** The publication and the offer, as signed: held, so a repost can carry them (F272). */
  acts: { publication: Uint8Array; offer: Uint8Array; post: Uint8Array };
}

/**
 * Seal a text with a price: the publication (key absent, price in field 7),
 * the lone seller's offer naming it, and a post naming both. The locked
 * bytes go to the relays. Save the identity after: its sequence has grown.
 */
export async function postSealed(by: TestIdentity, a: { text?: string; picture?: Uint8Array; teaser: string; price: Amount; words: string; relays: string[] }): Promise<Sealed & { removed: string[] }> {
  const w = lockWork(a.picture ? { media: 'picture', bytes: a.picture, price: a.price, relays: a.relays } : { media: 'text', bytes: new TextEncoder().encode(a.text ?? ''), price: a.price, relays: a.relays });
  for (const hint of a.relays) {
    for (const x of by.chainActs()) {
      try {
        await relayAt(hint, by.via).putAct(x);
      } catch {
        // that relay's policy
      }
    }
  }
  const publication = await by.publish(POST_SPECS.envelopes, PUBLICATION, w.payload, { public: true, relays: a.relays });
  for (const hint of a.relays) await relayAt(hint, by.via).putMedia(w.locked);
  const offer = await by.publish(MIRS.agreements, OFFER, offerPayload({ sells: { publication: publication.id }, price: a.price, words: a.words }), { public: true, relays: a.relays });
  const post = await by.publish(POST_SPECS.text, TEXT_ACT, textPayload(a.teaser), { public: true, relays: a.relays, refs: [referenceTo(publication.act), referenceTo(offer.act)] });
  return { publication: publication.id, offer: offer.id, post: post.id, key: w.key, acts: { publication: publication.act, offer: offer.act, post: post.act }, removed: w.removed };
}

export interface SealedRead {
  publication: string;
  /** Text, or a JPEG picture: the media modules the apps carry. */
  media: SealedMedia;
  seller: string;
  price: Amount | null;
  work: string;
  lockedHash: string;
  nonce: Uint8Array;
  size: number;
  /** Where its locked bytes may be fetched (field 6). */
  places: string[];
}

/** A publication read as a sealed text: null where it is not one (another media, or its key present). */
export function readSealed(act: Uint8Array): SealedRead | null {
  const d = describeAct(act) as { id: string; signer?: string; spec?: string; type?: number; payload?: Uint8Array };
  if (d.spec !== POST_SPECS.envelopes || d.type !== PUBLICATION || !d.payload || !d.signer) return null;
  const m = cborDecode(d.payload) as Map<number, unknown>;
  const media = m.get(0);
  const kind = media instanceof Uint8Array ? mediaOf(hex(media)) : null;
  if (!kind || m.has(5)) return null;
  const price = m.get(7) as [Uint8Array, number] | undefined;
  return {
    publication: d.id,
    media: kind,
    seller: d.signer,
    price: Array.isArray(price) && price[0] instanceof Uint8Array ? { unit: hex(price[0]), value: Number(price[1]) } : null,
    work: hex(m.get(1) as Uint8Array),
    lockedHash: hex(m.get(2) as Uint8Array),
    nonce: m.get(4) as Uint8Array,
    size: Number(m.get(3)),
    places: Array.isArray(m.get(6)) ? (m.get(6) as string[]).filter((x) => typeof x === 'string') : [],
  };
}

/** A lone seller's offer read: what it sells, its price, its words. Null where it is no offer of `seller` selling `publication`. With `coOwners`, an offer under an agreement (field 0) is read too, its agreement and payee given. */
export function readOffer(act: Uint8Array, seller: string, publication: string, coOwners = false): { offer: string; price: Amount; words: string | null; under?: string; payee?: string } | null {
  const d = describeAct(act) as { id: string; signer?: string; spec?: string; type?: number; payload?: Uint8Array };
  if (d.spec !== MIRS.agreements || d.type !== OFFER || d.signer !== seller || !d.payload) return null;
  try {
    const m = cborDecode(d.payload) as Map<number, unknown>;
    if (m.has(0) && !coOwners) return null;
    const sells = (m.get(1) as unknown[][]).some((x) => x[0] === 0 && x[1] instanceof Uint8Array && hex(x[1] as Uint8Array) === publication);
    const price = m.get(2) as [Uint8Array, number];
    if (!sells) return null;
    const under = m.get(0);
    const payee = m.get(3);
    return {
      offer: d.id,
      price: { unit: hex(price[0]), value: Number(price[1]) },
      words: typeof m.get(4) === 'string' ? (m.get(4) as string) : null,
      ...(under instanceof Uint8Array ? { under: hex(under) } : {}),
      ...(payee instanceof Uint8Array ? { payee: hex(payee) } : {}),
    };
  } catch {
    return null;
  }
}

/** The key delivery's payload (Envelopes type 1): the publication whose media key this is. */
export function keyDeliveryPayload(publication: string, key: string): Uint8Array {
  return cborEncode(
    new Map<number, unknown>([
      [0, unhex(publication)],
      [1, unhex(key)],
      [2, true],
    ]),
  );
}

export function readKeyDelivery(payload: Uint8Array): { publication: string; key: string } | null {
  try {
    const m = cborDecode(payload) as Map<number, unknown>;
    const p = m.get(0);
    const k = m.get(1);
    if (!(p instanceof Uint8Array) || !(k instanceof Uint8Array) || k.length !== 32 || m.get(2) !== true) return null;
    return { publication: hex(p), key: hex(k) };
  } catch {
    return null;
  }
}

/** A sealed text's bytes, opened and checked, as text. */
export async function openSealedText(s: SealedRead, key: string, hints: string[], via: Via = {}): Promise<string> {
  return new TextDecoder().decode(await openSealedBytes(s, key, hints, via));
}

/** The locked bytes, fetched at these places, opened with the key, checked against the work hash and size (Envelopes rules 21 and 22). */
export async function openSealedBytes(s: SealedRead, key: string, hints: string[], via: Via = {}): Promise<Uint8Array> {
  let locked: Uint8Array | null = null;
  for (const h of [...new Set([...hints, ...s.places])]) {
    try {
      locked = await relayAt(h, via).getMedia(s.lockedHash);
      if (locked) break;
    } catch {
      // not there
    }
  }
  if (!locked) throw new Error('its locked bytes were not found at the relays asked');
  let plain: Uint8Array;
  try {
    plain = openMedia(locked, unhex(key), s.nonce);
  } catch {
    throw new Error('the key delivered does not open its bytes');
  }
  if (workHash(plain) !== s.work || plain.length !== s.size) throw new Error('its bytes do not match the work hash and size it was published with');
  return plain;
}

/**
 * A repost of a sealed post (Envelopes rule 20): a text act naming the
 * publication and the offer; what it names, the seller's identity chain
 * and the locked bytes held at the reposter's own relays, so a reader of
 * those relays alone finds the work through it (F272).
 */
export async function repost(by: TestIdentity, a: { publication: Uint8Array; offer: Uint8Array; seller: Uint8Array[]; text: string; relays: string[]; locked: Uint8Array | null; via?: Via }): Promise<{ id: string; act: Uint8Array }> {
  for (const hint of a.relays) {
    for (const x of [...a.seller, ...by.chainActs(), a.publication, a.offer]) {
      try {
        await relayAt(hint, a.via ?? by.via).putAct(x);
      } catch {
        // that relay's policy, or it holds it already
      }
    }
    if (a.locked) {
      try {
        await relayAt(hint, a.via ?? by.via).putMedia(a.locked);
      } catch {
        // its policy
      }
    }
  }
  return by.publish(POST_SPECS.text, TEXT_ACT, textPayload(a.text), { public: true, relays: a.relays, refs: [referenceTo(a.publication), referenceTo(a.offer)] });
}
