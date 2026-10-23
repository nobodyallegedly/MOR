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
import { cannotReach, firstOf, followRef, holdSequence, lookUp, referenceTo, type NotTried, type Reference } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { NotJpeg, read, strip, type Carried, type Picture } from '../../../modules/jpeg/src/jpeg.ts';
import { NotFilm, read as readFilm, strip as stripFilm, MAX_BYTES as FILM_MAX_BYTES, type Carried as FilmCarried, type Film } from '../../../modules/video/src/video.ts';
import { NotSound, read as readSound, strip as stripSound, MAX_BYTES as SOUND_MAX_BYTES, type Carried as SoundCarried, type Sound } from '../../../modules/audio/src/audio.ts';
import { POST_SPECS, PUBLICATION, TEXT_ACT, WITHDRAWAL } from './specs.ts';
import { correctionFormatFor, formatOfPayload } from './corrections.ts';

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

export interface PublishedFilm {
  id: string;
  act: Uint8Array;
  /** What was stripped out before publishing (the video Module, rule 6a). */
  removed: FilmCarried[];
  film: Film;
  work: string;
  size: number;
}

/**
 * Publish a film (the video Module, draft 1), public, as a picture is: read
 * first (rules 2 to 9, its limits), stripped to the film alone, locked with
 * its own key, described by a public publication naming the Module, its
 * locked bytes sent to the relays after it. Refused, saying why, before
 * anything is signed, if it is not a film the Module plays.
 */
export async function publishVideo(by: TestIdentity, mp4: Uint8Array, relays: string[]): Promise<PublishedFilm> {
  if (mp4.length > FILM_MAX_BYTES) throw new Error(`the film is ${mp4.length} bytes; the video Module takes at most ${FILM_MAX_BYTES}. Nothing was published.`);
  let s: { bytes: Uint8Array; removed: FilmCarried[] };
  let film: Film;
  try {
    s = stripFilm(mp4);
    film = readFilm(s.bytes);
  } catch (e) {
    if (e instanceof NotFilm) throw new Error(`not a film the video Module plays: ${e.message}. Nothing was published.`);
    throw e;
  }
  const l = lockMedia(s.bytes) as { locked: Uint8Array; key: Uint8Array; nonce: Uint8Array; lockedHash: string; workHash: string };
  const payload = cborEncode(
    new Map<number, unknown>([
      [0, unhex(POST_SPECS.video)],
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
  return { id: made.id, act: made.act, removed: s.removed, film, work: l.workHash, size: s.bytes.length };
}

export interface PublishedRecording {
  id: string;
  act: Uint8Array;
  /** What was stripped out before publishing (the audio Module, rule 10). */
  removed: SoundCarried[];
  sound: Sound;
  work: string;
  size: number;
}

/**
 * Publish a recording (the audio Module, draft 1), public, as a film is:
 * read first (rules 2 to 9, its limits), stripped to the sound alone (rule
 * 10: the work hash, the locked hash and the size published are the
 * stripped file's), locked with its own key, described by a public
 * publication naming the Module, its locked bytes sent to the relays after
 * it. Refused, saying why, before anything is signed, if it is not a
 * recording the Module plays.
 */
export async function publishAudio(by: TestIdentity, m4a: Uint8Array, relays: string[]): Promise<PublishedRecording> {
  if (m4a.length > SOUND_MAX_BYTES) throw new Error(`the recording is ${m4a.length} bytes; the audio Module takes at most ${SOUND_MAX_BYTES}. Nothing was published.`);
  let s: { bytes: Uint8Array; removed: SoundCarried[] };
  let sound: Sound;
  try {
    s = stripSound(m4a);
    sound = readSound(s.bytes);
  } catch (e) {
    if (e instanceof NotSound) throw new Error(`not a recording the audio Module plays: ${e.message}. Nothing was published.`);
    throw e;
  }
  const l = lockMedia(s.bytes) as { locked: Uint8Array; key: Uint8Array; nonce: Uint8Array; lockedHash: string; workHash: string };
  const payload = cborEncode(
    new Map<number, unknown>([
      [0, unhex(POST_SPECS.audio)],
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
  return { id: made.id, act: made.act, removed: s.removed, sound, work: l.workHash, size: s.bytes.length };
}

export interface Posted {
  /** The post: the text act's id. */
  id: string;
  /** The post itself, as signed: to leave in a recipient's inbox too. */
  act: Uint8Array;
  picture: PublishedPicture | null;
  film?: PublishedFilm | null;
  recording?: PublishedRecording | null;
}

/**
 * Post a text, with a picture if one is given: the picture's publication
 * first, then the text act naming it in `refs`, with its signer (a public
 * act, held: Envelopes draft 9, rule 20, F272). The text must already be
 * canonical (compose it first); the core library refuses it otherwise.
 * `refs`: the acts it answers, as references (a reply).
 * `to`: the identities it is addressed to, named on the act (a public
 * message; the caller leaves it in their inboxes). Save the identity file
 * after: its sequence has grown.
 */
export async function post(
  by: TestIdentity,
  opts: { text: string; jpeg?: Uint8Array; mp4?: Uint8Array; m4a?: Uint8Array; format?: string | null; relays: string[]; to?: string[]; refs?: Reference[]; corrects?: Reference },
): Promise<Posted> {
  const picture = opts.jpeg ? await publishPicture(by, opts.jpeg, opts.relays) : null;
  // A film, by reference as a picture is (the video Module, rule 13).
  const film = opts.mp4 ? await publishVideo(by, opts.mp4, opts.relays) : null;
  // A recording, by reference as a film is (the audio Module, rule 13).
  const recording = opts.m4a ? await publishAudio(by, opts.m4a, opts.relays) : null;
  await carryChain(by, opts.relays);
  // `refs`: acts the post answers (a reply, Text MIR), after its picture.
  // A correction names the act it corrects first (the corrections cMIP, 1.2).
  const refs: Reference[] = [...(opts.corrects ? [opts.corrects] : []), ...(picture ? [referenceTo(picture.act)] : []), ...(film ? [referenceTo(film.act)] : []), ...(recording ? [referenceTo(recording.act)] : []), ...(opts.refs ?? [])];
  // A correction's format follows the act it corrects: long-form where it is long-form (the corrections cMIP, 1.1, F347).
  const corrected = opts.corrects && opts.format === undefined ? await fetchAct(typeof opts.corrects === 'string' ? opts.corrects : opts.corrects[0], opts.relays, {}) : null;
  const format = opts.format !== undefined ? opts.format : opts.corrects ? correctionFormatFor(corrected ? formatOfPayload((describeAct(corrected) as Described).payload) : null) : null;
  const made = await by.publish(POST_SPECS.text, TEXT_ACT, textPayload(opts.text, format), {
    public: true,
    relays: opts.relays,
    refs: refs.length ? refs : undefined,
    to: opts.to?.length ? opts.to : undefined,
  });
  return { id: made.id, act: made.act, picture, film, recording };
}

/**
 * Leave a public act in a recipient's inbox as well, unsealed, with the
 * signer's identity chain so it can be checked there: a public message, as
 * a bug report to the reporting identity is (F287). Each inbox relay's
 * answer is said; none throws.
 */
export async function leaveInInbox(by: TestIdentity, act: Uint8Array, inbox: string[]): Promise<{ left: string[]; failed: { relay: string; reason: string }[] }> {
  const out = { left: [] as string[], failed: [] as { relay: string; reason: string }[] };
  for (const hint of inbox) {
    try {
      const r = relayAt(hint, by.via);
      for (const c of by.chainActs()) await r.putAct(c).catch(() => undefined);
      await r.putAct(act);
      out.left.push(hint);
    } catch (e) {
      out.failed.push({ relay: hint, reason: e instanceof Error ? e.message : String(e) });
    }
  }
  return out;
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
  /** The signer's own hint (the inside's field 9), as written: display only, never load-bearing (Envelopes rule 6). */
  hint?: string | null;
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
/** A film a post shows (the video Module, rule 13): judged and described here; its bytes fetched only when asked to play (`filmBytes`). */
export interface ShownFilm {
  kind: 'film';
  publication: string;
  signer: string;
  standing: string;
  problem: string | null;
  withdrawn: string | null;
  /** Its size in bytes, as published. */
  size: number;
}

/** A recording a post plays (the audio Module, rule 13): judged and described here; its bytes fetched only when asked to play (`soundBytes`). */
export interface ShownRecording {
  kind: 'recording';
  publication: string;
  signer: string;
  standing: string;
  problem: string | null;
  withdrawn: string | null;
  /** Its size in bytes, as published. */
  size: number;
}

export interface OtherRef {
  kind: 'act';
  id: string;
  /** The signer the reference names beside the act (F272), if any. */
  signer?: string;
  /** What it is, in a few words, when it was found and opened. */
  what: string;
  /** The signer of the act found, as the act itself names it (a correction names one of its own signer's acts, the corrections cMIP). */
  actSigner?: string;
}

export interface ShownPost {
  id: string;
  signer: string;
  standing: string;
  text: string;
  format: string | null;
  /** The signer's own hint (field 9), as written, where it wrote one: shown labelled as its own, never as a time anyone checked, never used to order anything. */
  hint: string | null;
  refs: (ShownPicture | ShownFilm | ShownRecording | OtherRef)[];
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
export class Judge implements Judging {
  v: Verifier;
  /** Addresses not tried by any lookup, each with why. */
  notTried: NotTried[] = [];
  private looked = new Map<string, Promise<void>>();
  constructor(
    private hints: string[],
    private via: Via,
  ) {
    this.v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  }
  async standing(act: Uint8Array, id: string, signer: string): Promise<string> {
    // One lookup per signer, shared by everything read side by side.
    let l = this.looked.get(signer);
    if (!l) {
      // F298: the signer's sequence too, so the answer does not rest on
      // which of its acts this reader happened to fetch.
      l = lookUp(signer, this.hints, this.via, this.v).then(async (x) => {
        for (const n of x.notTried) if (!this.notTried.some((y) => y.hint === n.hint)) this.notTried.push(n);
        await holdSequence(this.v, signer, x, this.hints, this.via);
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
  return { id, signer: d.signer, standing, text, format: f instanceof Uint8Array ? hex(f) : null, hint: d.hint ?? null, refs, notTried: judge.notTried ?? [] };
}

/**
 * Read an act a post refers to: from the places asked; not there, and the
 * reference names a signer, by that signer's homes and routes (F272). A
 * reference whose signer is wrong is said, the act fetched showing its own.
 */
async function readRef(r: Reference, hints: string[], via: Via, judge: Judging): Promise<ShownPicture | ShownFilm | ShownRecording | OtherRef> {
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
  if (!d.public) return { kind: 'act', id, signer, what: 'a private act', actSigner: d.signer };
  if (d.spec === POST_SPECS.text && d.type === TEXT_ACT) return { kind: 'act', id, signer, what: 'a text act', actSigner: d.signer };
  if (d.spec !== POST_SPECS.envelopes || d.type !== PUBLICATION) return { kind: 'act', id, signer, what: 'an act of a specification this client does not implement', actSigner: d.signer };
  const media = (cborDecode(d.payload!) as Map<number, unknown>).get(0);
  if (media instanceof Uint8Array && hex(media) === POST_SPECS.video) return readFilmRef(act, d, hints, via, judge);
  if (media instanceof Uint8Array && hex(media) === POST_SPECS.audio) return readRecordingRef(act, d, hints, via, judge);
  return readPicture(act, d, hints, via, judge);
}

/** A film's publication, judged and checked for withdrawal; its bytes are not fetched here. */
async function readFilmRef(act: Uint8Array, d: Described, hints: string[], via: Via, judge: Judging): Promise<ShownFilm> {
  const m = cborDecode(d.payload!) as Map<number, unknown>;
  const size = m.get(3);
  const out: ShownFilm = { kind: 'film', publication: d.id, signer: d.signer ?? '', standing: 'unknown', problem: null, withdrawn: null, size: typeof size === 'number' ? size : 0 };
  const no = (why: string) => ((out.problem = why), out);
  if (!d.signer) return no('the publication has no signer');
  out.standing = await judge.standing(act, d.id, d.signer);
  if (out.standing !== 'valid') return no(`the publication is ${out.standing}, not valid, for its signer's identity chain`);
  if (!(m.get(5) instanceof Uint8Array)) return no('the film is locked: its key is not public');
  out.withdrawn = await findWithdrawal(d.id, d.signer, m.get(8), hints, via, judge);
  if (out.withdrawn) return no('withdrawn by its signer');
  return out;
}

/** A recording's publication, judged and checked for withdrawal, as a film's is; its bytes are not fetched here. */
async function readRecordingRef(act: Uint8Array, d: Described, hints: string[], via: Via, judge: Judging): Promise<ShownRecording> {
  const m = cborDecode(d.payload!) as Map<number, unknown>;
  const size = m.get(3);
  const out: ShownRecording = { kind: 'recording', publication: d.id, signer: d.signer ?? '', standing: 'unknown', problem: null, withdrawn: null, size: typeof size === 'number' ? size : 0 };
  const no = (why: string) => ((out.problem = why), out);
  if (!d.signer) return no('the publication has no signer');
  out.standing = await judge.standing(act, d.id, d.signer);
  if (out.standing !== 'valid') return no(`the publication is ${out.standing}, not valid, for its signer's identity chain`);
  if (!(m.get(5) instanceof Uint8Array)) return no('the recording is locked: its key is not public');
  out.withdrawn = await findWithdrawal(d.id, d.signer, m.get(8), hints, via, judge);
  if (out.withdrawn) return no('withdrawn by its signer');
  return out;
}

/**
 * A film's bytes, when the reader asks to play it (the video Module, rule
 * 13): its publication fetched again, its locked bytes from the reader's
 * relays first, opened, checked against the work hash and size, and read by
 * the Module (rules 2 to 9) before anything plays. Throws, saying why.
 */
export async function filmBytes(publication: string, signer: string | null, hints: string[], via: Via = {}): Promise<{ bytes: Uint8Array; film: Film }> {
  const plain = await mediaBytes(publication, signer, hints, via, POST_SPECS.video, 'film');
  try {
    return { bytes: plain, film: readFilm(plain) };
  } catch (e) {
    if (e instanceof NotFilm) throw new Error(`not a film the video Module plays: ${e.message}`);
    throw e;
  }
}

/**
 * A recording's bytes, when the reader asks to play it (the audio Module,
 * rule 13), as a film's are: its publication fetched again, its locked
 * bytes from the reader's relays first, opened, checked against the work
 * hash and size, and read by the Module (rules 2 to 9) before anything
 * plays. Throws, saying why: nothing of a recording the Module refuses is
 * given to a player (rule 12).
 */
export async function soundBytes(publication: string, signer: string | null, hints: string[], via: Via = {}): Promise<{ bytes: Uint8Array; sound: Sound }> {
  const plain = await mediaBytes(publication, signer, hints, via, POST_SPECS.audio, 'recording');
  try {
    return { bytes: plain, sound: readSound(plain) };
  } catch (e) {
    if (e instanceof NotSound) throw new Error(`not a recording the audio Module plays: ${e.message}`);
    throw e;
  }
}

/** A public publication's media, of the Module `spec`, fetched, opened and checked against its work hash and size; not yet read by the Module. */
async function mediaBytes(publication: string, signer: string | null, hints: string[], via: Via, spec: string, what: 'film' | 'recording'): Promise<Uint8Array> {
  const act = signer ? (await followRef([publication, signer], hints, via)).act : await fetchAct(publication, hints, via);
  if (!act) throw new Error(`the ${what}’s publication was not found`);
  const d = describeChecked(act, publication);
  const m = cborDecode(d.payload!) as Map<number, unknown>;
  const type = m.get(0);
  if (!(type instanceof Uint8Array) || hex(type) !== spec) throw new Error(`not a ${what}`);
  const work = m.get(1);
  const lockedHash = m.get(2);
  const size = m.get(3);
  const nonce = m.get(4);
  const key = m.get(5);
  if (!(key instanceof Uint8Array)) throw new Error(`the ${what} is locked: its key is not public`);
  if (!(work instanceof Uint8Array) || !(lockedHash instanceof Uint8Array) || typeof size !== 'number' || !(nonce instanceof Uint8Array)) throw new Error('the publication does not describe its media');
  const named = Array.isArray(m.get(6)) ? (m.get(6) as unknown[]).filter((x): x is string => typeof x === 'string') : [];
  const media = (places: string[]) => firstOf(places.filter((h) => !cannotReach(h, via)), (h) => relayAt(h, via).getMedia(hex(lockedHash)));
  const locked = (await media(hints)) ?? (await media(named.filter((n) => !hints.includes(n))));
  if (!locked) throw new Error('its bytes were not found');
  let plain: Uint8Array;
  try {
    plain = openMedia(locked, key, nonce);
  } catch {
    throw new Error('its key does not open its bytes');
  }
  if (workHash(plain) !== hex(work) || plain.length !== size) throw new Error('its bytes do not match the work hash and size it was published with');
  return plain;
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
