// The audio Module (modules/module-audio-draft-1.md): an M4A file read as a
// recording, checked before anything plays it, and stripped to the sound
// alone before it is published. It never decodes a sound: that is the
// player's job. An M4A file is an MP4 file holding sound only, so the boxes,
// the track, the AAC configuration and the stripping are the video Module's
// own code (modules/video/src/video.ts), used as they are; this file adds
// what differs: the brands, exactly one sound track and no picture, the
// limits, and the words. Written for both Node and a browser: no Buffer here.

import {
  ASIDE,
  NotFilm,
  Reader,
  children,
  dates,
  inspectAside,
  one,
  readTrack,
  rotationOf,
  samplesOf,
  stripped,
  version,
  type Box,
  type Carried,
  type Container,
  type Track,
} from '../../video/src/video.ts';

export type { Carried };

/** Why a file is not a recording this Module plays. `kind` says which rule. */
export class NotSound extends Error {
  constructor(
    public kind: 'structure' | 'refused' | 'limits',
    message: string,
  ) {
    super(message);
    this.name = 'NotSound';
  }
}

/** Rule 9: limits. The largest file: one media object of 64 MiB, the homes' default, once its 16-byte tag is added by locking (as for a film). */
export const MAX_BYTES = 64 * 1024 * 1024 - 16;
export const MAX_SECONDS = 7200;
export { MAX_SAMPLE_RATE } from '../../video/src/video.ts';

/** What a file carries besides the sound (rule 10): never shown, removed before publishing. */
export const CARRIED_WORDS: Record<Carried, string> = {
  metadata: 'metadata (titles, the artist, the album, dates, the device, comments, cover pictures)',
  location: 'where it was recorded',
  dates: 'when it was made (the dates in its headers)',
  names: 'names written by the software that made it',
  free: 'free space that can hold anything',
  unknown: 'boxes of a kind no player reads (such as XMP)',
  'unused-media': 'media data no sample uses',
  descriptor: 'an MPEG-4 object descriptor (iods), not needed to play',
};

export interface Sound {
  /** The file's major brand (ftyp). */
  brand: string;
  /** Seconds, the longest of the movie's and its track's durations. */
  duration: number;
  audio: { codec: 'mp4a.40.2'; channels: number; sampleRate: number; samples: number };
  /** The MIME type with codecs, for `canPlayType`. */
  type: string;
  /** Whether the index (moov) comes before the media data. */
  indexFirst: boolean;
  carried: Carried[];
}

/** The video Module's code says "film" in one refusal it shares with this one: said here of a recording. */
const said = (message: string) => message.replace('which a film may not', 'which a recording may not');

/** The kind of a track (its handler), read without checking anything else; null where it cannot be found (readTrack then says why). */
function handlerOf(r: Reader, trak: Box): string | null {
  try {
    const mdia = r.boxes(trak.body, trak.end).find((b) => b.type === 'mdia');
    const hdlr = mdia && r.boxes(mdia.body, mdia.end).find((b) => b.type === 'hdlr');
    if (!hdlr || hdlr.end - hdlr.body < 12) return null;
    return String.fromCharCode(...r.b.subarray(hdlr.body + 8, hdlr.body + 12));
  } catch {
    return null;
  }
}

/** Rule 2: the brands an M4A file may name. Not `avc1` (a film's) nor `qt  ` (QuickTime's). */
const BRANDS = ['M4A ', 'isom', 'iso2', 'iso3', 'iso4', 'iso5', 'iso6', 'mp41', 'mp42'];
const FRAGMENTS = ['moof', 'mfra', 'sidx', 'styp', 'ssix', 'emsg', 'prft'];
const PICTURES = ['vide', 'pict', 'auxv'];

interface Parsed extends Container {
  sound: Sound;
}

function parse(bytes: Uint8Array): Parsed {
  if (bytes.length > MAX_BYTES) throw new NotSound('limits', `${bytes.length} bytes, above ${MAX_BYTES} (one media object of 64 MiB, locked)`);
  const ascii = (o: number, n: number) => String.fromCharCode(...bytes.subarray(o, o + n));
  const r = new Reader(bytes);
  if (bytes.length < 8 || ascii(4, 4) !== 'ftyp') throw new NotSound('structure', 'it does not begin with a file type box (ftyp)');
  const top = r.boxes(0, bytes.length, true);
  const carried = new Set<Carried>();
  const ftyp = top[0];
  r.need(ftyp.body, 8, ftyp.end, 'the file type');
  if ((ftyp.end - ftyp.body) % 4) throw new NotSound('structure', 'the file type box is not whole brands');
  const major = ascii(ftyp.body, 4);
  const brands = [major];
  for (let o = ftyp.body + 8; o < ftyp.end; o += 4) brands.push(ascii(o, 4));
  if (major === 'qt  ') throw new NotSound('refused', 'a QuickTime file (.mov), not M4A: remux it as M4A first');
  if (!brands.some((b) => BRANDS.includes(b))) throw new NotSound('refused', `brands ${brands.join(', ')}: none is an M4A or MP4 brand`);

  // Rule 2: one index, media data, and nothing else but metadata.
  const mdats: Box[] = [];
  let moov: Box | null = null;
  let indexFirst = false;
  for (const b of top.slice(1)) {
    if (b.type === 'moov') {
      if (moov) throw new NotSound('structure', 'more than one movie box (moov)');
      moov = b;
      indexFirst = !mdats.length;
    } else if (b.type === 'mdat') mdats.push(b);
    else if (b.type === 'ftyp') throw new NotSound('structure', 'more than one file type box');
    else if (FRAGMENTS.includes(b.type)) {
      throw new NotSound('refused', 'a fragmented file (as a live stream writes): only a whole recording with one index is played');
    } else if (b.type in ASIDE) {
      carried.add(ASIDE[b.type]);
      if (b.type === 'udta' || b.type === 'meta') inspectAside(r, b, carried);
    } else throw new NotSound('refused', `a box of kind ${JSON.stringify(b.type)} at the top of the file, which this Module does not read`);
  }
  if (!moov) throw new NotSound('structure', 'no movie box (moov): the recording has no index');
  if (!mdats.length) throw new NotSound('structure', 'no media data box (mdat): the recording has no sound');

  const mk = children(r, moov, ['mvhd', 'trak', 'iods', 'mvex'], carried, 'the movie');
  if (mk.some((b) => b.type === 'mvex')) throw new NotSound('refused', 'a fragmented file (mvex): only a whole recording with one index is played');
  if (mk.some((b) => b.type === 'iods')) carried.add('descriptor');
  const mvhd = one(mk, 'mvhd', 'the movie');
  const mv = version(r, mvhd, [0, 1]);
  r.need(mvhd.body, mv ? 112 : 100, mvhd.end, 'the movie header');
  const mScale = r.u32(mvhd.body + (mv ? 20 : 12));
  const mDur = mv ? r.u64(mvhd.body + 24) : r.u32(mvhd.body + 16);
  if (!mScale) throw new NotSound('structure', 'the movie has no timescale');
  if (dates(r, mvhd, mv).set) carried.add('dates');
  if (rotationOf(r, mvhd.body + (mv ? 48 : 36)) !== 0) throw new NotSound('refused', 'a movie matrix that is not the identity');

  // Rule 3: exactly one track, of sound. Its kind is read first, so a picture track is refused as one, whatever it holds.
  const traks = mk.filter((b) => b.type === 'trak');
  const kinds = traks.map((t) => handlerOf(r, t));
  const pictures = kinds.filter((k) => k !== null && PICTURES.includes(k)).length;
  if (pictures) throw new NotSound('refused', `${pictures === 1 ? 'a picture track' : `${pictures} picture tracks`}: an M4A file holds sound only (a film is the video Module's)`);
  const other = kinds.find((k) => k !== null && k !== 'soun');
  if (other) throw new NotSound('refused', `a track of kind ${JSON.stringify(other)} (text, chapters, timecode, metadata or hints): an M4A file holds one sound track only`);
  if (traks.length !== 1) throw new NotSound('refused', `${traks.length || 'no'} sound tracks: an M4A file holds exactly one`);
  const tracks: Track[] = [readTrack(r, traks[0], carried)];
  const t = tracks[0];
  if (t.rotation !== 0) throw new NotSound('refused', 'a sound track whose header turns pictures (its matrix is not the identity)');
  if (t.names) carried.add('names');

  // Rule 7: every chunk inside a media data box, none overlapping another; media data no sample uses is carried.
  let used = 0;
  let prevEnd = 0;
  for (const c of [...t.chunks].sort((a, b) => a.offset - b.offset)) {
    if (c.offset < prevEnd) throw new NotSound('structure', 'two chunks of samples overlap');
    if (!mdats.some((m) => c.offset >= m.body && c.offset + c.size <= m.end)) throw new NotSound('structure', 'a chunk of samples lies outside the media data');
    prevEnd = c.offset + c.size;
    used += c.size;
  }
  if (used < mdats.reduce((n, m) => n + (m.end - m.body), 0)) carried.add('unused-media');

  // Limits (rule 9). The sampling rate's, 48,000 Hz, is the video Module's, checked with the AAC configuration (readTrack).
  const seconds = Math.max(mDur / mScale, t.mediaDuration / t.timescale);
  if (seconds > MAX_SECONDS) throw new NotSound('limits', `${Math.round(seconds)} seconds long, beyond ${MAX_SECONDS}`);

  const sound: Sound = {
    brand: major,
    duration: Math.round(seconds * 1000) / 1000,
    audio: { codec: 'mp4a.40.2', channels: t.audio!.channels, sampleRate: t.audio!.sampleRate, samples: t.samples },
    type: 'audio/mp4; codecs="mp4a.40.2"',
    indexFirst,
    carried: (Object.keys(CARRIED_WORDS) as Carried[]).filter((c) => carried.has(c)),
  };
  return { sound, ftyp, moov, tracks, traks };
}

/** Errors from the shared code, said as this Module says them. */
function checked<T>(f: () => T): T {
  try {
    return f();
  } catch (e) {
    if (e instanceof NotSound) throw e;
    if (e instanceof NotFilm) throw new NotSound(e.kind, said(e.message));
    if (e instanceof RangeError) throw new NotSound('structure', 'a box runs past the end of the file');
    throw e;
  }
}

/** Rules 1 to 9: what a client checks before playing. Throws NotSound, with the reason, for anything the Module refuses. */
export function read(bytes: Uint8Array): Sound {
  return checked(() => parse(bytes).sound);
}

/** The sound track's samples, in decoding order, as one run of bytes: what stripping must leave untouched. */
export function trackData(bytes: Uint8Array): Uint8Array {
  return checked(() => samplesOf(bytes, parse(bytes).tracks)[0]);
}

/**
 * Rule 10: the sound alone, written as the video Module writes a film
 * stripped: the file type, the movie header and the track's header (dates set
 * to zero), its edit list, the media header (dates zero), the handler (its
 * name blanked), the sound description and the sample tables; the index
 * first; every chunk of samples, in the order they were in, in one media
 * data box, the chunk offsets rewritten. Everything else removed. The
 * compressed sound is never touched.
 */
export function strip(bytes: Uint8Array): { bytes: Uint8Array; removed: Carried[] } {
  return checked(() => {
    const p = parse(bytes);
    return { bytes: stripped(bytes, p), removed: p.sound.carried };
  });
}
