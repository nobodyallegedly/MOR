// Drafts: an act prepared by Claude, through the connector, for the owner to
// approve at the desk (roadmap step 11c). The connector never holds a key,
// so it never makes an act: it writes down what the act will say, and the
// desk, which holds the owner's test identities and keeps their sequences,
// makes the act from it, signs it on the owner's word and sends it.
//
// A draft is not an act and not part of the protocol: it is a handoff
// between two programs on the owner's Mac, through a folder (decided by
// Nobody, allegedly, 1 October 2026: "no inbox, no cMIP"; the folder is
// documented in DRAFTS.md). It is deterministic CBOR, so its digest names
// it exactly, and both programs show that digest to compare by eye:
//
//   draft = {
//     0: "MOR draft, version 2",
//     1: signer,          ; the identity that is to sign it (32 bytes)
//     2: spec,            ; the act's spec hash
//     3: type,
//     4: payload,         ; the payload, as CBOR bytes, exactly as it will be inside
//     5: public,          ; true: the act carries its key
//     ? 6: [* ref],       ; refs: an act id, or [act id, signer] (Envelopes draft 9, F272)
//     ? 7: [* [chain, predecessor]],   ; objects
//     8: [* relay],       ; where a public act is sent once signed
//     ? 9: [* recipient], ; a message: the one identity it is sealed to and delivered to;
//                         ; a public reply: the identities whose acts it answers, each given
//                         ; a sealed copy in its inbox (reading B1, docs/f272-build.md)
//     ? 10: [* bstr],     ; media: locked bytes put on the relays after the act (a bake)
//     ? 11: tstr,         ; Claude's note to the owner: not signed, never part of the act
//     ? 12: digest,       ; the draft this one reworks (32 bytes)
//   }
//
// What can be drafted is decided (Nobody, allegedly, 1 October 2026): acts
// of the Text and Envelopes layers only, namely posts, bakes of pictures
// (the upload, Envelopes type 0, called a publication before F407) and
// messages. The withdrawal (Envelopes type 3) is retired: a bake is never
// withdrawn by the protocol, so none is drafted (F407). Anything else, an
// Agreements act above all, is refused by the connector before any draft is
// written, and by the desk again.
//
// The reading of a draft (`readDraft`) is made from these bytes alone, by
// whichever program reads them: the connector before handing it over, the
// desk again before showing it to the owner. Neither trusts the other's words.

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { SPECS, checkText, cborDecode, cborEncode, describeAct, hex, lockMedia, openMedia, unhex, workHash } from '../../genesis/src/core.ts';
import { lookUp, referTo, refAct, refSigner, type Reference } from '../../genesis/src/lookup.ts';
import type { Via } from '../../genesis/src/transport.ts';
import { textPayload } from '../../barebone/src/post.ts';
import { POST_SPECS } from '../../barebone/src/specs.ts';

/** Envelopes type 0: a bake (the upload). Type 3, the withdrawal, is retired (Envelopes rule 24, F407). */
const BAKE = 0;
const RETIRED_WITHDRAWAL = 3;
import { parse, checkBound } from '../../longform/src/format.ts';
import { compose } from '../../longform/src/text.ts';
import { read as readJpeg, strip, CARRIED_WORDS } from '../../../modules/jpeg/src/jpeg.ts';
import { REPO_SPECS } from '../../repo/src/specs.ts';
import { short, type Line, type Section } from '../../collective/src/explain.ts';
import { readAct, type Told } from './read.ts';
import { countControls, escapeControls, groups } from './words.ts';

export const DRAFT_LABEL = 'MOR draft, version 2';

export interface Draft {
  signer: string;
  spec: string;
  type: number;
  payload: Uint8Array;
  public: boolean;
  /** Each an act id, or `[act id, signer]` naming a public act's signer (F272). */
  refs: Reference[];
  objects: [string, string][];
  relays: string[];
  /** A message: the one identity it is sealed to. A public reply: the identities whose acts it answers (reading B1). */
  to: string[];
  /** Locked media bytes to put on the relays after the act. */
  media: Uint8Array[];
  /** Claude's note to the owner, about the draft: never signed. */
  note: string | null;
  /** The digest of the draft this one reworks. */
  reworks: string | null;
}

const HEX64 = /^[0-9a-f]{64}$/;
const same = (a: Uint8Array, b: Uint8Array) => Buffer.from(a).equals(Buffer.from(b));
const err = (e: unknown) => (e instanceof Error ? e.message : String(e));
const sha256 = (b: Uint8Array) => createHash('sha256').update(b).digest('hex');

/** The longest note Claude may attach, and the largest picture, so a draft stays a small file. */
export const MAX_NOTE = 2000;
export const MAX_MEDIA = 8 << 20;

export function encodeDraft(d: Draft): Uint8Array {
  const m = new Map<number, unknown>([
    [0, DRAFT_LABEL],
    [1, unhex(d.signer)],
    [2, unhex(d.spec)],
    [3, d.type],
    [4, d.payload],
    [5, d.public],
  ]);
  if (d.refs.length) m.set(6, d.refs.map((r) => (typeof r === 'string' ? unhex(r) : [unhex(r[0]), unhex(r[1])])));
  if (d.objects.length) m.set(7, d.objects.map(([c, p]) => [unhex(c), unhex(p)]));
  m.set(8, d.relays);
  if (d.to.length) m.set(9, d.to.map(unhex));
  if (d.media.length) m.set(10, d.media);
  if (d.note !== null) m.set(11, d.note);
  if (d.reworks !== null) m.set(12, unhex(d.reworks));
  return cborEncode(m);
}

/** Decode a draft strictly: the exact shape above, nothing else, in its one deterministic encoding. */
export function decodeDraft(bytes: Uint8Array): Draft {
  let m: Map<number, unknown>;
  try {
    m = cborDecode(bytes) as Map<number, unknown>;
  } catch (e) {
    throw new Error(`not a draft: ${err(e)}`);
  }
  if (!(m instanceof Map) || m.get(0) !== DRAFT_LABEL) throw new Error(`not a ${DRAFT_LABEL}`);
  for (const k of m.keys()) if (typeof k !== 'number' || k < 0 || k > 12) throw new Error(`a draft with an unknown field ${String(k)}`);
  const h = (v: unknown, what: string) => {
    if (!(v instanceof Uint8Array) || v.length !== 32) throw new Error(`a draft whose ${what} is not a hash`);
    return hex(v);
  };
  const list = (k: number, what: string): unknown[] => {
    if (!m.has(k)) return [];
    const v = m.get(k);
    if (!Array.isArray(v)) throw new Error(`a draft whose ${what} is not a list`);
    return v;
  };
  const type = m.get(3);
  const payload = m.get(4);
  const pub = m.get(5);
  const relays = m.get(8);
  const note = m.has(11) ? m.get(11) : null;
  if (typeof type !== 'number') throw new Error('a draft whose type is not a number');
  if (!(payload instanceof Uint8Array)) throw new Error('a draft without a payload');
  if (typeof pub !== 'boolean') throw new Error('a draft that does not say whether the act is public');
  if (!Array.isArray(relays) || !relays.every((r) => typeof r === 'string')) throw new Error('a draft whose relays are not addresses');
  if (note !== null && typeof note !== 'string') throw new Error('a draft whose note is not text');
  const media = list(10, 'media');
  if (!media.every((x) => x instanceof Uint8Array)) throw new Error('a draft whose media are not bytes');
  const d: Draft = {
    signer: h(m.get(1), 'signer'),
    spec: h(m.get(2), 'spec'),
    type,
    payload,
    public: pub,
    refs: list(6, 'refs').map((r): Reference => {
      if (Array.isArray(r)) {
        if (r.length !== 2) throw new Error('a draft whose reference is neither an act id nor [act id, signer]');
        return [h(r[0], 'reference'), h(r[1], 'reference signer')];
      }
      return h(r, 'reference');
    }),
    objects: list(7, 'objects').map((o) => {
      if (!Array.isArray(o) || o.length !== 2) throw new Error('a draft whose objects are not pairs');
      return [h(o[0], 'object'), h(o[1], 'object')] as [string, string];
    }),
    relays: relays as string[],
    to: list(9, 'recipients').map((r) => h(r, 'recipient')),
    media: media as Uint8Array[],
    note: note as string | null,
    reworks: m.has(12) ? h(m.get(12), 'reworked draft') : null,
  };
  if (!same(encodeDraft(d), bytes)) throw new Error('a draft not in its one deterministic encoding');
  return d;
}

/** The draft's digest: SHA-256 of its exact bytes. */
export const draftDigest = (bytes: Uint8Array): string => sha256(bytes);

// ---------------------------------------------------------------- reading a draft

/** The kinds Claude may prepare (decided by Nobody, allegedly, 1 October 2026). */
export type DraftKind = 'post' | 'message' | 'picture' | 'refused';

/** What signing a draft means, in plain words, from its bytes alone. */
export interface DraftReading {
  kind: DraftKind;
  title: string;
  summary: string[];
  sections: Section[];
  /** Words to be signed, quoted as plain text, invisible controls as escapes. */
  quoted: { heading: string; text: string }[];
  /** Reasons not to sign it. While any remains, the desk refuses. */
  blocking: string[];
  /** A picture to be uploaded (a bake): the exact JPEG, once unlocked, to show before signing. */
  picture?: { jpeg: Uint8Array; width: number; height: number };
  /** The text to be signed, for comparing a rework with the draft it replaces. */
  text?: string;
}

/** Words for an act outside what Claude may prepare. */
export function notPreparable(spec: string, type: number): string {
  if (spec === REPO_SPECS.agreements) {
    return 'It is an Agreements act (a signature, an agreement, a clone or the like). Claude prepares acts of the Text and Envelopes layers only: posts, bakes of pictures and messages (decided by Nobody, allegedly, 1 October 2026). An Agreements act is signed in the collective client, never from a draft.';
  }
  if (spec === SPECS.identity) return 'It is an Identity act. Claude prepares acts of the Text and Envelopes layers only: posts, bakes of pictures and messages.';
  if (spec === SPECS.envelopes && type === RETIRED_WITHDRAWAL) return 'It is a withdrawal (Envelopes type 3), which is retired: a bake is never withdrawn by the protocol (F407). What can end is a price tag (Money) or a publication (Agreements), and Claude prepares neither.';
  if (spec === SPECS.envelopes) return `It is an Envelopes act of type ${type}. Of the Envelopes layer, Claude prepares bakes of pictures only.`;
  return `It is an act of a specification Claude does not prepare (${short(spec)}). Claude prepares acts of the Text and Envelopes layers only: posts, bakes of pictures and messages.`;
}

/**
 * Read a draft. Fail closed: what is not a public text, a private message
 * to one identity or a bake of a picture is refused.
 */
export async function readDraft(d: Draft, hints: string[], via: Via = {}): Promise<DraftReading> {
  const who: Line[] = [{ text: `The identity ${d.signer} signs it, at the desk, as the next act in its own sequence.` }];
  const extra: string[] = [];
  if (d.note !== null && d.note.length > MAX_NOTE) extra.push(`Claude's note is longer than ${MAX_NOTE} characters.`);
  let r: DraftReading;
  if (d.spec === POST_SPECS.text && d.type === 0) r = d.public ? await readPost(d, who, hints, via) : await readMessage(d, who, hints, via);
  else if (d.spec === POST_SPECS.envelopes && d.type === BAKE) r = await readPicture(d, who);
  else r = { kind: 'refused', title: 'An act Claude does not prepare', summary: [], sections: [{ heading: 'Who signs', lines: who }], quoted: [], blocking: [notPreparable(d.spec, d.type)] };
  r.blocking.push(...extra);
  if (r.kind !== 'message' && r.kind !== 'post' && d.to.length) r.blocking.push('Only a message, or a public reply, names a recipient.');
  if (r.kind !== 'picture' && d.media.length) r.blocking.push('Only a bake carries media.');
  if (r.kind !== 'message' && r.kind !== 'refused' && !d.relays.length) r.blocking.push('It names no relay to send it to.');
  return r;
}

function textOf(d: Draft, blocking: string[]): { text: string | null; format: unknown; what: Line[] } {
  let p: Map<number, unknown> | null = null;
  try {
    p = cborDecode(d.payload) as Map<number, unknown>;
  } catch (e) {
    blocking.push(`Its payload is not deterministic CBOR: ${err(e)}.`);
  }
  const text = p?.get(0);
  const format = p?.get(1);
  const what: Line[] = [];
  if (typeof text !== 'string') {
    blocking.push('It has no text.');
    return { text: null, format, what };
  }
  if (p && [...p.keys()].some((k) => k !== 0 && k !== 1)) blocking.push('Its payload has fields the Text MIR does not define.');
  if (d.objects.length) blocking.push('A text act names no objects.');
  try {
    checkText(text);
  } catch (e) {
    blocking.push(`Its text is not canonical text (Text MIR, rule 1): ${err(e)}.`);
  }
  if (format === undefined) what.push({ text: 'Plain text: what you read below is exactly what is signed.' });
  else if (format instanceof Uint8Array && hex(format) === POST_SPECS.longform) {
    what.push({ text: 'Written in the long-form text format: readers render headings, emphasis and links from it; the plain text below is exactly what is signed.' });
    const breach = checkBound(parse(text));
    if (breach) blocking.push(`The long-form format would show it differently from its bytes (${breach}).`);
  } else blocking.push('It names a format the desk does not implement.');
  const n = countControls(text);
  if (n) what.push({ text: `It contains ${n} invisible character${n > 1 ? 's' : ''} that can make it display in another order than it is written, shown below as <U+…>.`, tone: 'warn' });
  return { text, format, what };
}

/**
 * The acts a draft refers to, read, and F272's client conformance checked:
 * the desk signs a reference only to an act it holds, and a reference to a
 * public act names its signer, rightly. Returns the lines to show, and the
 * identities whose public acts it answers (other than the signer).
 */
async function refLines(d: Draft, hints: string[], via: Via, blocking: string[]): Promise<{ lines: Line[]; answers: string[] }> {
  const lines: Line[] = [];
  const answers: string[] = [];
  for (const r of d.refs) {
    const id = refAct(r);
    const t = await readAct(id, hints, via, 0);
    lines.push({ text: `It refers to ${t.title.replace(/^A /, 'a ').replace(/^An /, 'an ')} (${short(id)}): ${t.verdict}`, tone: t.counts === false ? 'warn' : undefined });
    let held: Awaited<ReturnType<typeof referTo>>;
    try {
      held = await referTo(id, hints, via);
    } catch {
      blocking.push(`The act it refers to (${short(id)}) was not found at the relays asked: a reference is signed only to an act the desk holds (F272).`);
      continue;
    }
    const named = refSigner(r);
    if (held.public) {
      if (!named) blocking.push(`It refers to a public act (${short(id)}) without naming its signer: a reference to a public act names it (Envelopes draft 9, rule 20, F272).`);
      else if (named !== held.signer) blocking.push(`It names ${short(named)} as the signer of ${short(id)}, but that act was signed by ${short(held.signer)}.`);
      else lines.push({ text: `The reference names its signer, ${short(held.signer)}, so a reader holding only this act can find it through that identity's homes and routes.` });
      if (held.signer !== d.signer && !answers.includes(held.signer)) answers.push(held.signer);
    } else if (named) {
      lines.push({ text: `It names the signer of a private act (${short(id)}): readers of this act learn who sent it, which its sealed container hid.`, tone: 'warn' });
    }
  }
  return { lines, answers };
}

async function readPost(d: Draft, who: Line[], hints: string[], via: Via): Promise<DraftReading> {
  const blocking: string[] = [];
  const { text, what } = textOf(d, blocking);
  const refs = await refLines(d, [...new Set([...hints, ...d.relays])], via, blocking);
  what.push(...refs.lines);
  // Reading B1: a reply names in `to` each identity whose public act it
  // answers, and the desk leaves a copy, sealed to it, in its inbox; the
  // relays there see the recipient, never the sender or what it answers.
  if (JSON.stringify([...d.to].sort()) !== JSON.stringify([...refs.answers].sort())) {
    blocking.push(
      refs.answers.length
        ? `A reply names in its recipients exactly the identities whose acts it answers: ${refs.answers.map(short).join(', ')} (Envelopes, "How acts reach people"; reading B1).`
        : 'A post that answers no other identity\'s act names no recipient.',
    );
  }
  for (const to of d.to) {
    try {
      const r = await recipientOf(to, hints, via);
      what.push({ text: `It answers an act of the identity ${short(to)}: a copy, sealed to that identity, is left in its inbox at ${r.inbox.join(', ')}. The relays there see whom it is for, never who sent it or what it answers. The act itself names that identity among its recipients, which anyone reading it publicly can see, as they can see what it answers.` });
    } catch (e) {
      what.push({ text: `It answers an act of the identity ${short(to)}, which cannot be given a copy in its inbox: ${err(e)}. It is published all the same.`, tone: 'warn' });
    }
  }
  what.push({ text: 'It is public: anyone who fetches it can read it, and it cannot be unpublished.' });
  return {
    kind: 'post',
    title: 'A post, to be published',
    summary: [`Signing publishes this text, publicly, as the identity ${short(d.signer)}.`],
    sections: [
      { heading: 'Who signs', lines: [...who, { text: `Once signed, it is sent to ${d.relays.join(', ')}.` }] },
      { heading: 'What it is', lines: what },
    ],
    quoted: text !== null ? [{ heading: 'The text, character for character', text: escapeControls(text) }] : [],
    blocking,
    text: text ?? undefined,
  };
}

/** The recipient's current encryption key and inbox, as the core library counts them. */
export async function recipientOf(to: string, hints: string[], via: Via): Promise<{ key: Uint8Array; inbox: string[]; homes: string[] }> {
  const l = await lookUp(to, hints, via);
  if (!l.encryptionKey) throw new Error(`the identity ${to} has published no encryption key that counts, so it cannot receive a message`);
  const inbox = l.inbox(SPECS.text);
  if (!inbox?.length) throw new Error(`the identity ${to} declares no inbox, so it cannot receive a message`);
  return { key: l.encryptionKey, inbox, homes: l.resolution.homes.map((h) => h.hint) };
}

async function readMessage(d: Draft, who: Line[], hints: string[], via: Via): Promise<DraftReading> {
  const blocking: string[] = [];
  const { text, what } = textOf(d, blocking);
  const lines: Line[] = [...who];
  if (d.to.length !== 1) blocking.push('A message is sealed to exactly one recipient.');
  else {
    try {
      const r = await recipientOf(d.to[0], hints, via);
      lines.push({ text: `It is sealed to the current encryption key of the identity ${d.to[0]}, and left in its inbox at ${r.inbox.join(', ')}.` });
    } catch (e) {
      blocking.push(`It cannot be delivered: ${err(e)}.`);
    }
  }
  what.push(...(await refLines(d, hints, via, blocking)).lines);
  what.push({ text: 'It is private: relays see a sealed container for the recipient and its size, never the text, nor who sent it. The recipient can read it, and can show it, signed, to anyone.' });
  return {
    kind: 'message',
    title: 'A message, to be sent',
    summary: [`Signing sends this text, privately, from the identity ${short(d.signer)} to the identity ${d.to[0] ? short(d.to[0]) : 'no one'}.`],
    sections: [
      { heading: 'Who signs, and who receives it', lines },
      { heading: 'What it is', lines: what },
    ],
    quoted: text !== null ? [{ heading: 'The message, character for character', text: escapeControls(text) }] : [],
    blocking,
    text: text ?? undefined,
  };
}

async function readPicture(d: Draft, who: Line[]): Promise<DraftReading> {
  const blocking: string[] = [];
  const lines: Line[] = [];
  let picture: DraftReading['picture'];
  let m: Map<number, unknown> | null = null;
  try {
    m = cborDecode(d.payload) as Map<number, unknown>;
  } catch (e) {
    blocking.push(`Its payload is not deterministic CBOR: ${err(e)}.`);
  }
  if (!d.public) blocking.push('A bake prepared here is public: the picture is seen by all.');
  if (d.refs.length || d.objects.length) blocking.push('A bake of a picture refers to nothing and names no chain.');
  const b = (k: number) => m?.get(k);
  const spec = b(0);
  const lockedHash = b(2);
  const size = b(3);
  const nonce = b(4);
  const key = b(5);
  if (m) {
    for (const k of m.keys()) if (![0, 1, 2, 3, 4, 5, 6].includes(k as number)) blocking.push(`Its bake has field ${String(k)}, which a picture prepared here never has (a bake carries no price nor "for": Envelopes refuse fields 7 and 8; a price is a price tag, a Money act Claude does not prepare).`);
    if (!(spec instanceof Uint8Array) || hex(spec) !== POST_SPECS.jpeg) blocking.push('It uploads media of a kind other than a JPEG picture.');
    if (!(key instanceof Uint8Array)) blocking.push('Its media key is absent: the desk uploads public pictures only.');
  }
  if (d.media.length !== 1) blocking.push('It carries no picture, or more than one.');
  else if (m && key instanceof Uint8Array && nonce instanceof Uint8Array && lockedHash instanceof Uint8Array) {
    const locked = d.media[0];
    if (locked.length > MAX_MEDIA) blocking.push('The picture is larger than the desk accepts.');
    if (sha256(locked) !== hex(lockedHash)) blocking.push('The picture carried is not the one the bake names: its fingerprint differs.');
    try {
      const jpeg = new Uint8Array(openMedia(locked, key, nonce));
      // The size of the stripped picture, as the JPEG Module and the barebone client have it (Envelopes say "of those bytes": see the README, flaw 1).
      if (size !== jpeg.length) blocking.push('The bake states another size than the picture carried.');
      const work = b(1);
      const p = readJpeg(jpeg);
      if (p.carries.length) blocking.push(`The picture still carries ${p.carries.map((c) => CARRIED_WORDS[c]).join(', ')}: it was not stripped to the picture alone (JPEG Module, rule 6).`);
      picture = { jpeg, width: p.width, height: p.height };
      lines.push({ text: `A JPEG picture, ${p.width}×${p.height}, stripped to the picture alone: no location, camera data, preview or hidden picture.`, tone: p.carries.length ? 'bad' : 'ok' });
      if (!(work instanceof Uint8Array) || hex(work) !== workHash(jpeg)) blocking.push("The bake's work hash is not the picture's.");
    } catch (e) {
      blocking.push(`The picture does not open with the key in the bake, or is not a JPEG: ${err(e)}.`);
    }
  }
  lines.push({ text: 'It is public: anyone who fetches it can see the picture. A bake is never withdrawn: once uploaded, the bytes stay where they were put unless homes and relays drop them (F407).' });
  const hints = b(6);
  return {
    kind: 'picture',
    title: 'A picture, to be uploaded',
    summary: [`Signing uploads this picture (a bake), publicly, as the identity ${short(d.signer)}: its uploader. A post can then show it by referring to the bake.`],
    sections: [
      { heading: 'Who signs', lines: [...who, { text: `Once signed, it is sent to ${d.relays.join(', ')}, then the picture's locked bytes${Array.isArray(hints) ? `; the bake says they are found at ${hints.join(', ')}` : ''}.` }] },
      { heading: 'What it is', lines },
    ],
    quoted: [],
    blocking,
    picture,
  };
}

// ---------------------------------------------------------------- making drafts

/** The signer's identity must be found, so the relays and readers can check what it signs. */
async function checkSigner(signer: string, hints: string[], via: Via): Promise<void> {
  if (!HEX64.test(signer)) throw new Error('the signer is an identity hash: 64 hex digits');
  try {
    await lookUp(signer, hints, via);
  } catch (e) {
    throw new Error(`the identity ${signer} was not found at ${hints.join(', ')}: ${err(e)}`);
  }
}

interface Common {
  signer: string;
  relays: string[];
  note?: string;
  reworks?: string | null;
}

const base = (o: Common) => ({ signer: o.signer, refs: [] as Reference[], objects: [] as [string, string][], relays: o.relays, to: [] as string[], media: [] as Uint8Array[], note: o.note?.trim() ? o.note.trim() : null, reworks: o.reworks ?? null });

function composed(t: string): { text: string; changes: string[] } {
  const { text, changes } = compose(t);
  if (!text) throw new Error('the text is empty');
  return { text, changes };
}

/**
 * The references to write for act ids Claude names (F272, client
 * conformance): each act fetched and held first, or no draft is written;
 * a public act named with its signer, a private one by its id alone (its
 * signer is the writer's choice, and naming it would expose the sender its
 * sealed container hides). Also returns the identities whose public acts
 * it answers, other than the signer.
 */
async function references(ids: string[] | undefined, signer: string, hints: string[], via: Via): Promise<{ refs: Reference[]; answers: string[] }> {
  const refs: Reference[] = [];
  const answers: string[] = [];
  for (const id of ids ?? []) {
    if (!HEX64.test(id)) throw new Error(`a reference is an act id, 64 hex digits: ${id}`);
    const held = await referTo(id, hints, via);
    refs.push(held.ref);
    if (held.public && held.signer !== signer && !answers.includes(held.signer)) answers.push(held.signer);
  }
  return { refs, answers };
}

/**
 * A public text, as the barebone client posts it (Text MIR type 0), in plain
 * text or the long-form format. The text is composed first (Text rule 6),
 * and what composing changed is said.
 */
export async function postDraft(o: Common & { text: string; format: 'plain' | 'long-form'; refs?: string[] }, hints: string[], via: Via = {}): Promise<{ draft: Draft; changes: string[] }> {
  await checkSigner(o.signer, hints, via);
  const { text, changes } = composed(o.text);
  const payload = textPayload(text, o.format === 'long-form' ? POST_SPECS.longform : null);
  const { refs, answers } = await references(o.refs, o.signer, [...new Set([...hints, ...o.relays])], via);
  return { draft: { ...base(o), spec: POST_SPECS.text, type: 0, payload, public: true, refs, to: answers }, changes };
}

/** A private message (a text act) to one identity, sealed to its encryption key at the desk. */
export async function messageDraft(o: Common & { to: string; text: string; refs?: string[] }, hints: string[], via: Via = {}): Promise<{ draft: Draft; changes: string[] }> {
  await checkSigner(o.signer, hints, via);
  if (!HEX64.test(o.to)) throw new Error('the recipient is an identity hash: 64 hex digits');
  await recipientOf(o.to, hints, via);
  const { text, changes } = composed(o.text);
  const { refs } = await references(o.refs, o.signer, hints, via);
  return { draft: { ...base(o), relays: [], spec: POST_SPECS.text, type: 0, payload: textPayload(text), public: false, refs, to: [o.to] }, changes };
}

/**
 * A picture (the JPEG Module), stripped to the picture alone and locked with
 * its own key, as the barebone client uploads it (a bake, Envelopes type 0);
 * the key is public, in the bake. Its locked bytes travel in the draft.
 */
export async function pictureDraft(o: Common & { jpeg: Uint8Array }, hints: string[], via: Via = {}): Promise<{ draft: Draft; removed: string[] }> {
  await checkSigner(o.signer, hints, via);
  const s = strip(o.jpeg);
  if (s.bytes.length > MAX_MEDIA) throw new Error('the picture is larger than the desk accepts (8 MB)');
  const l = lockMedia(s.bytes) as { locked: Uint8Array; key: Uint8Array; nonce: Uint8Array; lockedHash: string; workHash: string };
  const payload = cborEncode(
    new Map<number, unknown>([
      [0, unhex(POST_SPECS.jpeg)],
      [1, unhex(l.workHash)],
      [2, unhex(l.lockedHash)],
      // The stripped picture's size, as the JPEG Module and the barebone client have it (README, flaw 1).
      [3, s.bytes.length],
      [4, l.nonce],
      [5, l.key],
      [6, o.relays],
    ]),
  );
  return { draft: { ...base(o), spec: POST_SPECS.envelopes, type: BAKE, payload, public: true, media: [l.locked] }, removed: s.removed.map((c) => CARRIED_WORDS[c]) };
}

// ---------------------------------------------------------------- the drafts folder (DRAFTS.md)

export const draftFile = (dir: string, digest: string) => join(dir, `${digest}.mor-draft`);
export const answerFile = (dir: string, digest: string) => join(dir, `${digest}.mor-answer`);
export const LINKED_FILE = 'linked.json';
export const ANSWER_LABEL = 'MOR desk answer, version 1';
export const LINKED_LABEL = 'MOR desk, identities linked to Claude, version 1';

/** The desk's answer to a draft. */
export interface Answer {
  format: typeof ANSWER_LABEL;
  draft: string;
  verdict: 'approved' | 'declined' | 'sent back';
  /** The owner's note: why, or what to change. */
  note: string;
  /** Approved: the act made, and what each relay or inbox answered. */
  act?: string;
  sent?: { to: string; accepted: boolean; answer: string }[];
  time: number;
}

/** Write a file whole, then rename it into place, so a reader never sees half of it. */
function writeWhole(path: string, bytes: Uint8Array | string) {
  writeFileSync(`${path}.tmp`, bytes, { mode: 0o600 });
  renameSync(`${path}.tmp`, path);
}

export function saveDraft(dir: string, d: Draft): { digest: string; path: string; bytes: Uint8Array } {
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  const bytes = encodeDraft(d);
  const digest = draftDigest(bytes);
  const path = draftFile(dir, digest);
  writeWhole(path, bytes);
  return { digest, path, bytes };
}

/** A draft by its digest, or the first characters of it (at least 8). Its bytes are checked against the digest. */
export function loadDraft(dir: string, which: string): { digest: string; path: string; draft: Draft; bytes: Uint8Array } {
  const w = which.replace(/\s+/g, '').toLowerCase();
  if (!/^[0-9a-f]{8,64}$/.test(w)) throw new Error(`no draft ${which}: give its digest`);
  const hits = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.mor-draft') && f.startsWith(w)) : [];
  if (hits.length !== 1) throw new Error(hits.length ? `more than one draft starts with ${w}` : `no draft ${w} in ${dir}`);
  const path = join(dir, hits[0]);
  const bytes = new Uint8Array(readFileSync(path));
  const digest = draftDigest(bytes);
  if (`${digest}.mor-draft` !== hits[0]) throw new Error(`the file ${hits[0]} is not the draft its name says: its bytes have another digest`);
  return { digest, path, draft: decodeDraft(bytes), bytes };
}

/** Every draft in the folder, newest first, by digest. */
export function listDrafts(dir: string): { digest: string; time: number }[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => /^[0-9a-f]{64}\.mor-draft$/.test(f))
    .map((f) => ({ digest: f.slice(0, 64), time: statSync(join(dir, f)).mtimeMs }))
    .sort((a, b) => b.time - a.time);
}

export function saveAnswer(dir: string, a: Answer): void {
  writeWhole(answerFile(dir, a.draft), JSON.stringify(a, null, 2) + '\n');
}

export function loadAnswer(dir: string, digest: string): Answer | null {
  const p = answerFile(dir, digest);
  if (!existsSync(p)) return null;
  const a = JSON.parse(readFileSync(p, 'utf8')) as Answer;
  if (a.format !== ANSWER_LABEL || a.draft !== digest) throw new Error(`${p} is not the desk's answer to draft ${digest}`);
  return a;
}

/** The identities the owner linked to Claude at the desk, with the names given there. */
export interface Linked {
  format: typeof LINKED_LABEL;
  identities: { id: string; name: string }[];
}

export function saveLinked(dir: string, identities: { id: string; name: string }[]): void {
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  writeWhole(join(dir, LINKED_FILE), JSON.stringify({ format: LINKED_LABEL, identities } satisfies Linked, null, 2) + '\n');
}

export function loadLinked(dir: string): Linked['identities'] | null {
  const p = join(dir, LINKED_FILE);
  if (!existsSync(p)) return null;
  const l = JSON.parse(readFileSync(p, 'utf8')) as Linked;
  if (l.format !== LINKED_LABEL) throw new Error(`${p} is not the desk's list of linked identities`);
  return l.identities;
}

// ---------------------------------------------------------------- checking an act against its draft

interface Described {
  id: string;
  signer?: string;
  public: boolean;
  to?: string[];
  spec?: string;
  type?: number;
  objects?: [string, string][];
  refs?: string[];
  refSigners?: (string | undefined)[];
  acks?: string[];
  payload?: Uint8Array;
}

/**
 * Check that a public act says exactly what its draft said: the same
 * signer, spec, type, payload, references and objects, public, addressed to
 * the identities it answers and no one else, acknowledging nothing. Returns the act's id. What the desk adds
 * (its sequence, the key that binds it, the salt, the lock) is the signer's.
 */
export function matchDraft(d: Draft, act: Uint8Array): string {
  let x: Described;
  try {
    x = describeAct(act) as Described;
  } catch (e) {
    throw new Error(`not a valid act: ${err(e)}`);
  }
  const differ: string[] = [];
  if (x.signer !== d.signer) differ.push(`it is signed by ${x.signer ?? 'no one'}, not ${d.signer}`);
  if (!x.public || !x.payload) differ.push('it is not public as drafted');
  if (JSON.stringify(x.to ?? []) !== JSON.stringify(d.to)) differ.push(d.to.length ? 'it is not addressed to the identities the draft answers' : 'it is addressed to someone');
  if (x.spec !== d.spec || x.type !== d.type) differ.push('it is of another kind');
  if (!x.payload || !same(x.payload, d.payload)) differ.push('its payload differs');
  const refs: Reference[] = (x.refs ?? []).map((r, i) => (x.refSigners?.[i] ? [r, x.refSigners[i]!] : r));
  if (JSON.stringify(refs) !== JSON.stringify(d.refs)) differ.push('its references differ');
  if (JSON.stringify(x.objects ?? []) !== JSON.stringify(d.objects)) differ.push('its objects differ');
  if (x.acks?.length) differ.push('it acknowledges acts the draft did not');
  if (differ.length) throw new Error(`the act is not the act drafted: ${differ.join('; ')}`);
  return x.id;
}

export type { Told };
export { groups };
