// The video Module (modules/module-video-draft-1.md): an MP4 file read as a
// film, checked before anything plays it, and stripped to the film alone
// before it is published. It never decodes a picture or a sound: that is the
// player's job. It reads the file's boxes, the H.264 parameter set that says
// the pictures' size, and the AAC configuration, and refuses what the Module
// refuses. Written for both Node and a browser: no Buffer here.

/** Why a file is not a film this Module plays. `kind` says which rule. */
export class NotFilm extends Error {
  constructor(
    public kind: 'structure' | 'refused' | 'limits',
    message: string,
  ) {
    super(message);
    this.name = 'NotFilm';
  }
}

/** Rule 9: limits. The largest file: one media object of 64 MiB, the homes' default, once its 16-byte tag is added by locking. */
export const MAX_BYTES = 64 * 1024 * 1024 - 16;
export const MAX_SECONDS = 600;
export const MAX_LONG_SIDE = 1920;
export const MAX_SHORT_SIDE = 1080;
export const MAX_RATE = 60;
export const MAX_LEVEL = 42;
export const MAX_SAMPLE_RATE = 48_000;

/** What a file carries besides the film (rule 10): never shown, removed before publishing. */
export type Carried = 'metadata' | 'location' | 'dates' | 'names' | 'free' | 'unknown' | 'unused-media' | 'descriptor';

export const CARRIED_WORDS: Record<Carried, string> = {
  metadata: 'metadata (titles, dates, the device, comments, cover pictures)',
  location: 'where it was filmed',
  dates: 'when it was made (the dates in its headers)',
  names: 'names written by the software that made it',
  free: 'free space that can hold anything',
  unknown: 'boxes of a kind no player reads (such as XMP)',
  'unused-media': 'media data no sample uses',
  descriptor: 'an MPEG-4 object descriptor (iods), not needed to play',
};

export interface Film {
  /** The file's major brand (ftyp). */
  brand: string;
  /** Seconds, the longest of the movie's and its tracks' durations. */
  duration: number;
  video: {
    /** The codec string a browser is asked about, e.g. `avc1.64001f`. */
    codec: string;
    profile: 'Baseline' | 'Main' | 'High';
    /** As in the parameter set: 31 is level 3.1. */
    level: number;
    /** The pictures' size as coded, after cropping. */
    width: number;
    height: number;
    /** A quarter turn clockwise per 90, from the track's matrix (rule 6). */
    rotation: 0 | 90 | 180 | 270;
    /** The size as shown, after turning. */
    shown: { width: number; height: number };
    samples: number;
    /** Pictures a second, on average. */
    rate: number;
  };
  audio: null | { codec: 'mp4a.40.2'; channels: number; sampleRate: number; samples: number };
  /** The MIME type with codecs, for `canPlayType`. */
  type: string;
  /** Whether the index (moov) comes before the media data. */
  indexFirst: boolean;
  carried: Carried[];
}

// --- Boxes ------------------------------------------------------------------

interface Box {
  type: string;
  /** Offset of the box in the file, of its body, and of its end. */
  start: number;
  body: number;
  end: number;
}

const ascii = (b: Uint8Array, o: number, n: number) => String.fromCharCode(...b.subarray(o, o + n));

class Reader {
  view: DataView;
  constructor(public b: Uint8Array) {
    this.view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  }
  need(o: number, n: number, end: number, what: string): void {
    if (o < 0 || n < 0 || o + n > end) throw new NotFilm('structure', `${what} runs past its box`);
  }
  u8 = (o: number) => this.b[o];
  u16 = (o: number) => this.view.getUint16(o);
  u32 = (o: number) => this.view.getUint32(o);
  i32 = (o: number) => this.view.getInt32(o);
  u64(o: number): number {
    const hi = this.u32(o);
    if (hi > 0x1fffff) throw new NotFilm('limits', 'a 64-bit value beyond what a file of this size can hold');
    return hi * 2 ** 32 + this.u32(o + 4);
  }

  /** The boxes between `o` and `end`, which they must fill exactly. A size of 0 (to the end) only where `toEnd` allows. */
  boxes(o: number, end: number, toEnd = false): Box[] {
    const out: Box[] = [];
    while (o < end) {
      if (end - o < 8) throw new NotFilm('structure', 'bytes left over that are not a box');
      let size = this.u32(o);
      const type = ascii(this.b, o + 4, 4);
      let body = o + 8;
      if (size === 1) {
        if (end - o < 16) throw new NotFilm('structure', `the box ${JSON.stringify(type)} runs past its parent`);
        size = this.u64(o + 8);
        body = o + 16;
      } else if (size === 0) {
        if (!toEnd) throw new NotFilm('structure', `the box ${JSON.stringify(type)} has no size`);
        size = end - o;
      }
      if (type === 'uuid') body += 16;
      if (size < body - o || o + size > end) throw new NotFilm('structure', `the box ${JSON.stringify(type)} runs past its parent`);
      out.push({ type, start: o, body, end: o + size });
      o += size;
    }
    return out;
  }
}

/** Boxes that only take room or carry what is not the film: never read, always stripped. */
const ASIDE: Record<string, Carried> = { udta: 'metadata', meta: 'metadata', free: 'free', skip: 'free', uuid: 'unknown' };

/** The children of a box, each allowed by `allowed` or set aside (ASIDE); anything else refused, naming where. */
function children(r: Reader, box: Box, allowed: string[], carried: Set<Carried>, where: string, skip = 0): Box[] {
  const out: Box[] = [];
  for (const c of r.boxes(box.body + skip, box.end)) {
    if (allowed.includes(c.type)) out.push(c);
    else if (c.type in ASIDE) {
      carried.add(ASIDE[c.type]);
      if (c.type === 'udta' || c.type === 'meta') inspectAside(r, c, carried);
    } else throw new NotFilm('refused', `a box of kind ${JSON.stringify(c.type)} in ${where}, which this Module does not read`);
  }
  return out;
}

/**
 * Metadata is never read, but two things in it matter: a place (rule 10
 * names it so a publisher is told), and a data reference to elsewhere (rule
 * 8: nothing in the file may point outside it). `meta` is a full box whose
 * children are boxes; `udta`'s children are boxes too, with contents of
 * every kind, so only their names are read.
 */
function inspectAside(r: Reader, box: Box, carried: Set<Carried>): void {
  let kids: Box[];
  try {
    kids = r.boxes(box.body + (box.type === 'meta' ? 4 : 0), box.end);
  } catch {
    // QuickTime writes `meta` without the full box's four bytes: try that once.
    try {
      kids = box.type === 'meta' ? r.boxes(box.body, box.end) : [];
    } catch {
      kids = [];
    }
  }
  for (const k of kids) {
    if (k.type === 'loci' || k.type === '©xyz') carried.add('location');
    if (k.type === 'dinf') throw new NotFilm('refused', 'a data reference inside the metadata, which could point outside the file');
    if (k.type === 'meta' || k.type === 'udta' || k.type === 'ilst' || k.type === 'keys') inspectAside(r, k, carried);
    if (k.type === 'ilst' || k.type === 'keys') {
      // iTunes-style keys: the place is a key named for it.
      if (/location|©xyz/i.test(ascii(r.b, k.body, k.end - k.body))) carried.add('location');
    }
  }
}

const one = (list: Box[], type: string, where: string): Box => {
  const f = list.filter((b) => b.type === type);
  if (f.length !== 1) throw new NotFilm('structure', `${where} has ${f.length ? 'more than one' : 'no'} ${JSON.stringify(type)}`);
  return f[0];
};
const maybe = (list: Box[], type: string, where: string): Box | null => {
  const f = list.filter((b) => b.type === type);
  if (f.length > 1) throw new NotFilm('structure', `${where} has more than one ${JSON.stringify(type)}`);
  return f[0] ?? null;
};

// --- H.264 and AAC --------------------------------------------------------------

class Bits {
  private bit = 0;
  constructor(private b: Uint8Array) {}
  u(n: number): number {
    let v = 0;
    for (let i = 0; i < n; i++) {
      const byte = this.bit >> 3;
      if (byte >= this.b.length) throw new NotFilm('structure', 'the parameter set ends early');
      v = v * 2 + ((this.b[byte] >> (7 - (this.bit & 7))) & 1);
      this.bit++;
    }
    return v;
  }
  ue(): number {
    let zeros = 0;
    while (this.u(1) === 0) if (++zeros > 31) throw new NotFilm('structure', 'the parameter set holds a number too large');
    return 2 ** zeros - 1 + this.u(zeros);
  }
  se(): number {
    const k = this.ue();
    return k & 1 ? (k + 1) / 2 : -k / 2;
  }
}

/** A NAL unit without its emulation-prevention bytes (00 00 03). */
function unescape(nal: Uint8Array): Uint8Array {
  const out: number[] = [];
  for (let i = 0; i < nal.length; i++) {
    if (i >= 2 && nal[i] === 3 && nal[i - 1] === 0 && nal[i - 2] === 0) continue;
    out.push(nal[i]);
  }
  return new Uint8Array(out);
}

const PROFILES: Record<number, Film['video']['profile']> = { 66: 'Baseline', 77: 'Main', 100: 'High' };

/** The sequence parameter set (ITU-T H.264, 7.3.2.1.1): the profile, and the size of the pictures as coded. */
function readSps(nal: Uint8Array): { profile: number; level: number; width: number; height: number } {
  if (!nal.length || (nal[0] & 0x1f) !== 7) throw new NotFilm('structure', 'the H.264 configuration does not hold a sequence parameter set');
  const s = new Bits(unescape(nal.subarray(1)));
  const profile = s.u(8);
  s.u(8);
  const level = s.u(8);
  s.ue();
  if ([100, 110, 122, 244, 44, 83, 86, 118, 128, 138, 139, 134, 135].includes(profile)) {
    const chroma = s.ue();
    if (chroma !== 1) throw new NotFilm('refused', 'H.264 with colour sampled otherwise than 4:2:0, which phones do not all play');
    if (s.ue() !== 0 || s.ue() !== 0) throw new NotFilm('refused', 'H.264 with more than 8 bits a sample, which phones do not all play');
    s.u(1);
    if (s.u(1)) {
      for (let i = 0; i < 8; i++) {
        if (!s.u(1)) continue;
        const n = i < 6 ? 16 : 64;
        let last = 8;
        let next = 8;
        for (let j = 0; j < n && next !== 0; j++) {
          next = (last + s.se() + 256) % 256;
          last = next === 0 ? last : next;
        }
      }
    }
  }
  s.ue();
  const poc = s.ue();
  if (poc === 0) s.ue();
  else if (poc === 1) {
    s.u(1);
    s.se();
    s.se();
    const n = s.ue();
    if (n > 255) throw new NotFilm('structure', 'the parameter set is not valid');
    for (let i = 0; i < n; i++) s.se();
  }
  s.ue();
  s.u(1);
  const wMbs = s.ue() + 1;
  const hMaps = s.ue() + 1;
  const frameOnly = s.u(1);
  if (!frameOnly) throw new NotFilm('refused', 'interlaced H.264, which this Module does not play');
  s.u(1);
  let crop = [0, 0, 0, 0];
  if (s.u(1)) crop = [s.ue(), s.ue(), s.ue(), s.ue()];
  // 4:2:0, frames only: cropping counts in pairs of pixels both ways.
  const width = wMbs * 16 - 2 * (crop[0] + crop[1]);
  const height = hMaps * 16 - 2 * (crop[2] + crop[3]);
  if (width <= 0 || height <= 0) throw new NotFilm('structure', 'the parameter set crops away the whole picture');
  return { profile, level, width, height };
}

/** `avcC` (ISO/IEC 14496-15, 5.3.3.1): the profile, the level, and the first sequence parameter set, read. */
function readAvcC(r: Reader, box: Box) {
  const b = r.b;
  r.need(box.body, 6, box.end, 'the H.264 configuration');
  if (b[box.body] !== 1) throw new NotFilm('structure', 'the H.264 configuration is not version 1');
  const profile = b[box.body + 1];
  const compat = b[box.body + 2];
  const level = b[box.body + 3];
  if (![0, 1, 3].includes(b[box.body + 4] & 3)) throw new NotFilm('structure', 'the H.264 configuration names an invalid length size');
  let o = box.body + 5;
  const nSps = b[o++] & 0x1f;
  if (!nSps) throw new NotFilm('structure', 'the H.264 configuration holds no sequence parameter set');
  let first: Uint8Array | null = null;
  for (let i = 0; i < nSps; i++) {
    r.need(o, 2, box.end, 'the H.264 configuration');
    const n = r.u16(o);
    r.need(o + 2, n, box.end, 'a sequence parameter set');
    first ??= b.subarray(o + 2, o + 2 + n);
    o += 2 + n;
  }
  r.need(o, 1, box.end, 'the H.264 configuration');
  const nPps = b[o++];
  if (!nPps) throw new NotFilm('structure', 'the H.264 configuration holds no picture parameter set');
  for (let i = 0; i < nPps; i++) {
    r.need(o, 2, box.end, 'the H.264 configuration');
    const n = r.u16(o);
    r.need(o + 2, n, box.end, 'a picture parameter set');
    o += 2 + n;
  }
  const sps = readSps(first!);
  if (sps.profile !== profile || sps.level !== level) throw new NotFilm('structure', 'the H.264 configuration and its parameter set disagree');
  return { profile, compat, level, width: sps.width, height: sps.height };
}

/** An MPEG-4 descriptor's tag and length (ISO/IEC 14496-1, 8.3.3). */
function descriptor(r: Reader, o: number, end: number): { tag: number; body: number; end: number } {
  r.need(o, 2, end, 'a descriptor');
  const tag = r.b[o++];
  let len = 0;
  for (let i = 0; i < 4; i++) {
    r.need(o, 1, end, 'a descriptor');
    const x = r.b[o++];
    len = len * 128 + (x & 0x7f);
    if (!(x & 0x80)) break;
    if (i === 3) throw new NotFilm('structure', 'a descriptor length is too long');
  }
  r.need(o, len, end, 'a descriptor');
  return { tag, body: o, end: o + len };
}

/** `esds`: AAC-LC (object type 0x40, audio object type 2), mono or stereo; no stream elsewhere (the URL flag). */
function readEsds(r: Reader, box: Box): { channels: number; sampleRate: number } {
  const b = r.b;
  const es = descriptor(r, box.body + 4, box.end);
  if (es.tag !== 3) throw new NotFilm('structure', 'the sound configuration has no elementary stream descriptor');
  r.need(es.body, 3, es.end, 'the sound configuration');
  const flags = b[es.body + 2];
  let o = es.body + 3;
  if (flags & 0x80) o += 2;
  if (flags & 0x40) throw new NotFilm('refused', 'the sound names a stream elsewhere (a URL), which a film may not');
  if (flags & 0x20) o += 2;
  const dc = descriptor(r, o, es.end);
  if (dc.tag !== 4) throw new NotFilm('structure', 'the sound configuration has no decoder configuration');
  r.need(dc.body, 13, dc.end, 'the decoder configuration');
  if (b[dc.body] !== 0x40 || b[dc.body + 1] >> 2 !== 5) throw new NotFilm('refused', 'sound that is not MPEG-4 audio (AAC): only AAC-LC is played');
  const asc = descriptor(r, dc.body + 13, dc.end);
  if (asc.tag !== 5) throw new NotFilm('structure', 'the sound configuration has no AAC configuration');
  const bits = new Bits(b.subarray(asc.body, asc.end));
  const aot = bits.u(5);
  if (aot !== 2) throw new NotFilm('refused', `AAC of another kind than AAC-LC (audio object type ${aot}), which this Module does not play`);
  const fi = bits.u(4);
  const RATES = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350];
  const sampleRate = fi === 15 ? bits.u(24) : RATES[fi];
  if (!sampleRate) throw new NotFilm('structure', 'the AAC configuration names no sampling rate');
  const channels = bits.u(4);
  if (channels !== 1 && channels !== 2) throw new NotFilm('refused', 'sound with more than two channels, or channels set elsewhere: only mono and stereo are played');
  if (sampleRate > MAX_SAMPLE_RATE) throw new NotFilm('limits', `sound sampled at ${sampleRate} Hz, above ${MAX_SAMPLE_RATE}`);
  return { channels, sampleRate };
}

// --- Tracks -----------------------------------------------------------------

interface Chunk {
  offset: number;
  size: number;
}

interface Track {
  handler: 'vide' | 'soun';
  timescale: number;
  /** In the track's own timescale, from the decoding times. */
  mediaDuration: number;
  samples: number;
  chunks: Chunk[];
  rotation: 0 | 90 | 180 | 270;
  video?: ReturnType<typeof readAvcC>;
  audio?: { channels: number; sampleRate: number };
  /** Whether the handler or the sample description carries a name (stripping blanks both). */
  names: boolean;
}

const MATRIX: Record<string, 0 | 90 | 180 | 270> = {
  '65536,0,0,65536': 0,
  '0,65536,-65536,0': 90,
  '-65536,0,0,-65536': 180,
  '0,-65536,65536,0': 270,
};

/** Rule 6: only the four quarter turns; u, v and w as the identity's; any translation (players ignore it for a single track). */
function rotationOf(r: Reader, o: number): 0 | 90 | 180 | 270 {
  const m = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => r.i32(o + 4 * i));
  if (m[2] !== 0 || m[5] !== 0 || m[8] !== 0x40000000) throw new NotFilm('refused', 'a track matrix that is not a quarter turn');
  const rot = MATRIX[[m[0], m[1], m[3], m[4]].join(',')];
  if (rot === undefined) throw new NotFilm('refused', 'a track matrix that is not a quarter turn (scaled, skewed or mirrored)');
  return rot;
}

/** The creation and modification dates of a header (mvhd, tkhd, mdhd): where they are, and whether any is set. */
function dates(r: Reader, box: Box, v: number): { at: number; n: number; set: boolean } {
  const at = box.body + 4;
  const n = v ? 16 : 8;
  return { at, n, set: r.b.subarray(at, at + n).some((x) => x !== 0) };
}

/** A full box's version, checked against those allowed. */
function version(r: Reader, box: Box, allowed: number[]): number {
  r.need(box.body, 4, box.end, `the box ${box.type}`);
  const v = r.b[box.body];
  if (!allowed.includes(v)) throw new NotFilm('structure', `the box ${box.type} has version ${v}`);
  return v;
}

/** An entry-counted table: its count, checked to fit in its box, and where its entries start. */
function table(r: Reader, box: Box, entrySize: number, skip = 4): { n: number; o: number } {
  r.need(box.body, skip + 4, box.end, `the table ${box.type}`);
  const n = r.u32(box.body + skip);
  const o = box.body + skip + 4;
  if (n * entrySize > box.end - o) throw new NotFilm('structure', `the table ${box.type} runs past its box`);
  return { n, o };
}

const STBL = ['stsd', 'stts', 'ctts', 'stss', 'stsc', 'stsz', 'stco', 'co64', 'sdtp', 'sgpd', 'sbgp', 'cslg', 'stps'];
const VISUAL_EXTRAS = ['avcC', 'btrt', 'pasp', 'colr', 'clap', 'fiel'];
const AUDIO_EXTRAS = ['esds', 'btrt'];

function readTrack(r: Reader, trak: Box, carried: Set<Carried>): Track {
  const kids = children(r, trak, ['tkhd', 'edts', 'mdia'], carried, 'a track');
  const tkhd = one(kids, 'tkhd', 'a track');
  const tv = version(r, tkhd, [0, 1]);
  const matrixAt = tkhd.body + 4 + (tv ? 32 : 20) + 16;
  r.need(matrixAt, 36 + 8, tkhd.end, 'the track header');
  const rotation = rotationOf(r, matrixAt);
  if (dates(r, tkhd, tv).set) carried.add('dates');
  const edts = maybe(kids, 'edts', 'a track');
  if (edts) for (const e of children(r, edts, ['elst'], carried, 'an edit list')) version(r, e, [0, 1]);

  const mdia = one(kids, 'mdia', 'a track');
  const mk = children(r, mdia, ['mdhd', 'hdlr', 'minf'], carried, 'a track');
  const mdhd = one(mk, 'mdhd', 'a track');
  const mv = version(r, mdhd, [0, 1]);
  r.need(mdhd.body, mv ? 32 : 20, mdhd.end, 'the media header');
  const timescale = r.u32(mdhd.body + (mv ? 20 : 12));
  if (!timescale) throw new NotFilm('structure', 'a track with no timescale');
  if (dates(r, mdhd, mv).set) carried.add('dates');
  const hdlr = one(mk, 'hdlr', 'a track');
  r.need(hdlr.body, 24, hdlr.end, 'the handler');
  const handler = ascii(r.b, hdlr.body + 8, 4);
  if (handler !== 'vide' && handler !== 'soun') {
    throw new NotFilm('refused', `a track of kind ${JSON.stringify(handler)} (text, subtitles, timecode, metadata or hints): a film holds pictures and sound only`);
  }
  const named = hdlr.end - (hdlr.body + 24) > 1 || (hdlr.end > hdlr.body + 24 && r.b[hdlr.body + 24] !== 0);

  const minf = one(mk, 'minf', 'a track');
  const nk = children(r, minf, ['vmhd', 'smhd', 'dinf', 'stbl', 'hdlr'], carried, 'a track');
  one(nk, handler === 'vide' ? 'vmhd' : 'smhd', 'a track');
  const dinf = one(nk, 'dinf', 'a track');
  const dref = one(children(r, dinf, ['dref'], carried, 'a data reference'), 'dref', 'a data reference');
  const refs = table(r, dref, 12);
  const entries = r.boxes(refs.o, dref.end);
  if (entries.length !== refs.n || refs.n !== 1) throw new NotFilm('refused', 'a track whose data references are not exactly one');
  const ref = entries[0];
  if ((ref.type !== 'url ' && ref.type !== 'urn ') || ref.end - ref.body < 4 || !(r.b[ref.body + 3] & 1)) {
    throw new NotFilm('refused', 'a track whose samples are stored outside this file (a data reference to elsewhere)');
  }

  const stbl = one(nk, 'stbl', 'a track');
  const sk = children(r, stbl, STBL, carried, 'a sample table');
  const stsd = one(sk, 'stsd', 'a sample table');
  const sd = table(r, stsd, 8);
  const descs = r.boxes(sd.o, stsd.end);
  if (sd.n !== 1 || descs.length !== 1) throw new NotFilm('refused', 'a track with more than one sample description');
  const entry = descs[0];
  const t: Track = { handler, timescale, mediaDuration: 0, samples: 0, chunks: [], rotation, names: named };
  if (handler === 'vide') {
    if (entry.type !== 'avc1') {
      const what = entry.type === 'encv' ? 'encrypted pictures' : entry.type === 'avc3' ? 'H.264 with its parameter sets in the stream (avc3)' : `pictures coded as ${JSON.stringify(entry.type)}, not H.264`;
      throw new NotFilm('refused', `${what}: only H.264 (avc1) is played`);
    }
    r.need(entry.body, 78, entry.end, 'the picture description');
    if (r.b.subarray(entry.body + 42, entry.body + 74).some((x) => x !== 0)) t.names = true;
    const ex = children(r, { ...entry, body: entry.body + 78 }, VISUAL_EXTRAS, carried, 'the picture description');
    const v = readAvcC(r, one(ex, 'avcC', 'the picture description'));
    if (!PROFILES[v.profile]) throw new NotFilm('refused', `H.264 profile ${v.profile}: only Baseline, Main and High are played`);
    t.video = v;
  } else {
    if (entry.type !== 'mp4a') {
      throw new NotFilm('refused', `${entry.type === 'enca' ? 'encrypted sound' : `sound coded as ${JSON.stringify(entry.type)}`}: only AAC-LC (mp4a) is played`);
    }
    r.need(entry.body, 28, entry.end, 'the sound description');
    if (r.u16(entry.body + 8) !== 0) throw new NotFilm('refused', 'a QuickTime sound description (version 1 or 2), not MP4');
    const ex = children(r, { ...entry, body: entry.body + 28 }, AUDIO_EXTRAS, carried, 'the sound description');
    t.audio = readEsds(r, one(ex, 'esds', 'the sound description'));
  }

  // Samples: how many, how long, and where each chunk's bytes are.
  const stts = table(r, one(sk, 'stts', 'a sample table'), 8);
  let timed = 0;
  for (let i = 0; i < stts.n; i++) {
    const count = r.u32(stts.o + 8 * i);
    timed += count;
    t.mediaDuration += count * r.u32(stts.o + 8 * i + 4);
  }
  const stsz = one(sk, 'stsz', 'a sample table');
  r.need(stsz.body, 12, stsz.end, 'the sample sizes');
  const fixed = r.u32(stsz.body + 4);
  const count = r.u32(stsz.body + 8);
  if (!fixed && count * 4 > stsz.end - (stsz.body + 12)) throw new NotFilm('structure', 'the sample sizes run past their box');
  const sizeOf = (i: number) => (fixed ? fixed : r.u32(stsz.body + 12 + 4 * i));
  if (count !== timed) throw new NotFilm('structure', 'a track whose sample count and timing disagree');
  if (!count) throw new NotFilm('structure', 'a track with no samples');
  t.samples = count;
  const ctts = maybe(sk, 'ctts', 'a sample table');
  if (ctts) {
    const c = table(r, ctts, 8);
    let n = 0;
    for (let i = 0; i < c.n; i++) n += r.u32(c.o + 8 * i);
    if (n !== count) throw new NotFilm('structure', 'a track whose composition offsets and samples disagree');
  }
  const stss = maybe(sk, 'stss', 'a sample table');
  if (stss) {
    const s = table(r, stss, 4);
    for (let i = 0; i < s.n; i++) {
      const k = r.u32(s.o + 4 * i);
      if (k < 1 || k > count) throw new NotFilm('structure', 'a key picture that is not a sample');
    }
  }
  const stco = maybe(sk, 'stco', 'a sample table');
  const co64 = maybe(sk, 'co64', 'a sample table');
  if (!stco === !co64) throw new NotFilm('structure', 'a track without exactly one chunk offset table');
  const co = table(r, (stco ?? co64)!, stco ? 4 : 8);
  const offsets = Array.from({ length: co.n }, (_, i) => (stco ? r.u32(co.o + 4 * i) : r.u64(co.o + 8 * i)));
  const stsc = table(r, one(sk, 'stsc', 'a sample table'), 12);
  let sample = 0;
  for (let i = 0; i < stsc.n; i++) {
    const first = r.u32(stsc.o + 12 * i);
    const per = r.u32(stsc.o + 12 * i + 4);
    if (r.u32(stsc.o + 12 * i + 8) !== 1) throw new NotFilm('structure', 'a chunk naming a sample description that is not there');
    const next = i + 1 < stsc.n ? r.u32(stsc.o + 12 * (i + 1)) : co.n + 1;
    if (first < 1 || next <= first || next > co.n + 1 || (i === 0 && first !== 1)) throw new NotFilm('structure', 'the sample-to-chunk table is not in order');
    for (let c = first; c < next; c++) {
      let size = 0;
      for (let k = 0; k < per; k++) {
        if (sample >= count) throw new NotFilm('structure', 'chunks hold more samples than the track has');
        size += sizeOf(sample++);
      }
      t.chunks.push({ offset: offsets[c - 1], size });
    }
  }
  if (sample !== count || t.chunks.length !== co.n) throw new NotFilm('structure', 'chunks and samples disagree');
  return t;
}

// --- The file -----------------------------------------------------------------

const BRANDS = ['isom', 'iso2', 'iso3', 'iso4', 'iso5', 'iso6', 'mp41', 'mp42', 'avc1'];

interface Parsed {
  film: Film;
  ftyp: Box;
  moov: Box;
  tracks: Track[];
  traks: Box[];
}

function parse(bytes: Uint8Array): Parsed {
  if (bytes.length > MAX_BYTES) throw new NotFilm('limits', `${bytes.length} bytes, above ${MAX_BYTES} (one media object of 64 MiB, locked)`);
  const r = new Reader(bytes);
  if (bytes.length < 8 || ascii(bytes, 4, 4) !== 'ftyp') throw new NotFilm('structure', 'it does not begin with a file type box (ftyp)');
  const top = r.boxes(0, bytes.length, true);
  const carried = new Set<Carried>();
  const ftyp = top[0];
  r.need(ftyp.body, 8, ftyp.end, 'the file type');
  if ((ftyp.end - ftyp.body) % 4) throw new NotFilm('structure', 'the file type box is not whole brands');
  const major = ascii(bytes, ftyp.body, 4);
  const brands = [major];
  for (let o = ftyp.body + 8; o < ftyp.end; o += 4) brands.push(ascii(bytes, o, 4));
  if (major === 'qt  ') throw new NotFilm('refused', 'a QuickTime file (.mov), not MP4: remux it as MP4 first');
  if (!brands.some((b) => BRANDS.includes(b))) throw new NotFilm('refused', `brands ${brands.join(', ')}: none is an MP4 brand`);

  const mdats: Box[] = [];
  let moov: Box | null = null;
  let indexFirst = false;
  for (const b of top.slice(1)) {
    if (b.type === 'moov') {
      if (moov) throw new NotFilm('structure', 'more than one movie box (moov)');
      moov = b;
      indexFirst = !mdats.length;
    } else if (b.type === 'mdat') mdats.push(b);
    else if (b.type === 'ftyp') throw new NotFilm('structure', 'more than one file type box');
    else if (['moof', 'mfra', 'sidx', 'styp', 'ssix', 'emsg', 'prft'].includes(b.type)) {
      throw new NotFilm('refused', 'a fragmented MP4 (as a live stream writes): only a whole film with one index is played');
    } else if (b.type in ASIDE) {
      carried.add(ASIDE[b.type]);
      if (b.type === 'udta' || b.type === 'meta') inspectAside(r, b, carried);
    } else throw new NotFilm('refused', `a box of kind ${JSON.stringify(b.type)} at the top of the file, which this Module does not read`);
  }
  if (!moov) throw new NotFilm('structure', 'no movie box (moov): the film has no index');

  const mk = children(r, moov, ['mvhd', 'trak', 'iods', 'mvex'], carried, 'the movie');
  if (mk.some((b) => b.type === 'mvex')) throw new NotFilm('refused', 'a fragmented MP4 (mvex): only a whole film with one index is played');
  if (mk.some((b) => b.type === 'iods')) carried.add('descriptor');
  const mvhd = one(mk, 'mvhd', 'the movie');
  const mv = version(r, mvhd, [0, 1]);
  r.need(mvhd.body, mv ? 112 : 100, mvhd.end, 'the movie header');
  const mScale = r.u32(mvhd.body + (mv ? 20 : 12));
  const mDur = mv ? r.u64(mvhd.body + 24) : r.u32(mvhd.body + 16);
  if (!mScale) throw new NotFilm('structure', 'the movie has no timescale');
  if (dates(r, mvhd, mv).set) carried.add('dates');
  if (rotationOf(r, mvhd.body + (mv ? 48 : 36)) !== 0) throw new NotFilm('refused', 'a movie matrix that is not the identity');
  const traks = mk.filter((b) => b.type === 'trak');
  const tracks = traks.map((t) => readTrack(r, t, carried));
  const video = tracks.filter((t) => t.handler === 'vide');
  const audio = tracks.filter((t) => t.handler === 'soun');
  if (video.length !== 1) throw new NotFilm('refused', `${video.length || 'no'} picture tracks: a film has exactly one`);
  if (audio.length > 1) throw new NotFilm('refused', `${audio.length} sound tracks: a film has one at most`);
  if (tracks.some((t) => t.names)) carried.add('names');

  // Every chunk inside a media data box, none overlapping another; media data no sample uses is carried.
  const chunks = tracks.flatMap((t) => t.chunks).sort((a, b) => a.offset - b.offset);
  let used = 0;
  let prevEnd = 0;
  for (const c of chunks) {
    if (c.offset < prevEnd) throw new NotFilm('structure', 'two chunks of samples overlap');
    if (!mdats.some((m) => c.offset >= m.body && c.offset + c.size <= m.end)) throw new NotFilm('structure', 'a chunk of samples lies outside the media data');
    prevEnd = c.offset + c.size;
    used += c.size;
  }
  if (used < mdats.reduce((n, m) => n + (m.end - m.body), 0)) carried.add('unused-media');

  // Limits (rule 9).
  const v = video[0];
  const turned = v.rotation === 90 || v.rotation === 270;
  const vv = v.video!;
  const long = Math.max(vv.width, vv.height);
  const short = Math.min(vv.width, vv.height);
  if (long > MAX_LONG_SIDE || short > MAX_SHORT_SIDE) throw new NotFilm('limits', `pictures of ${vv.width} x ${vv.height}, beyond ${MAX_LONG_SIDE} x ${MAX_SHORT_SIDE}`);
  if (vv.level > MAX_LEVEL) throw new NotFilm('limits', `H.264 level ${vv.level / 10}, above ${MAX_LEVEL / 10}`);
  const seconds = Math.max(mDur / mScale, ...tracks.map((t) => t.mediaDuration / t.timescale));
  if (seconds > MAX_SECONDS) throw new NotFilm('limits', `${Math.round(seconds)} seconds long, beyond ${MAX_SECONDS}`);
  const vSeconds = v.mediaDuration / v.timescale;
  const rate = vSeconds > 0 ? v.samples / vSeconds : Infinity;
  if (rate > MAX_RATE * 1.01) throw new NotFilm('limits', `${Math.round(rate)} pictures a second, beyond ${MAX_RATE}`);

  const hex2 = (n: number) => n.toString(16).padStart(2, '0');
  const vcodec = `avc1.${hex2(vv.profile)}${hex2(vv.compat)}${hex2(vv.level)}`;
  const a = audio[0];
  const film: Film = {
    brand: major,
    duration: Math.round(seconds * 1000) / 1000,
    video: {
      codec: vcodec,
      profile: PROFILES[vv.profile],
      level: vv.level,
      width: vv.width,
      height: vv.height,
      rotation: v.rotation,
      shown: turned ? { width: vv.height, height: vv.width } : { width: vv.width, height: vv.height },
      samples: v.samples,
      rate: Math.round(rate * 1000) / 1000,
    },
    audio: a ? { codec: 'mp4a.40.2', channels: a.audio!.channels, sampleRate: a.audio!.sampleRate, samples: a.samples } : null,
    type: `video/mp4; codecs="${vcodec}${a ? ', mp4a.40.2' : ''}"`,
    indexFirst,
    carried: (Object.keys(CARRIED_WORDS) as Carried[]).filter((c) => carried.has(c)),
  };
  return { film, ftyp, moov, tracks, traks };
}

/** Rules 1 to 9: what a client checks before playing. Throws NotFilm, with the reason, for anything the Module refuses. */
export function read(bytes: Uint8Array): Film {
  try {
    return parse(bytes).film;
  } catch (e) {
    if (e instanceof NotFilm) throw e;
    if (e instanceof RangeError) throw new NotFilm('structure', 'a box runs past the end of the file');
    throw e;
  }
}

/** Each track's samples, in decoding order, as one run of bytes per track: what stripping must leave untouched. */
export function trackData(bytes: Uint8Array): Uint8Array[] {
  return parse(bytes).tracks.map((t) => concat(t.chunks.map((c) => bytes.subarray(c.offset, c.offset + c.size))));
}

// --- Stripping ----------------------------------------------------------------

function box(type: string, ...parts: Uint8Array[]): Uint8Array {
  const n = 8 + parts.reduce((s, p) => s + p.length, 0);
  const out = new Uint8Array(n);
  new DataView(out.buffer).setUint32(0, n);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  let o = 8;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((s, p) => s + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

/**
 * Rule 10: the film alone. Keeps, byte for byte, the file type, the movie
 * header, and in each track what playing needs: the track header, its edit
 * list, the media header, the handler (its name blanked), the sample
 * description (its compressor name blanked) and the sample tables; moves the
 * index first; and copies every chunk of samples, in the order they were
 * in, into one media data box, with the chunk offsets rewritten. Removes
 * everything else. The compressed pictures and sound are never touched.
 */
export function strip(bytes: Uint8Array): { bytes: Uint8Array; removed: Carried[] } {
  const p = parse(bytes);
  const r = new Reader(bytes);
  const keep = (b: Box) => bytes.subarray(b.start, b.end);
  /** A header (mvhd, tkhd, mdhd) with its dates set to zero. */
  const undated = (b: Box) => {
    const out = bytes.slice(b.start, b.end);
    const d = dates(r, b, bytes[b.body]);
    out.fill(0, d.at - b.start, d.at - b.start + d.n);
    return out;
  };
  const drop = (list: Box[]) => list.filter((b) => !(b.type in ASIDE) && b.type !== 'iods');
  const kids = (b: Box, skip = 0) => drop(r.boxes(b.body + skip, b.end));

  // Every chunk, across tracks, in file order: where it was, and where it goes.
  const all = p.tracks.flatMap((t) => t.chunks).sort((a, b) => a.offset - b.offset);
  const placed = new Map<Chunk, number>();
  let at = 0;
  for (const c of all) {
    placed.set(c, at);
    at += c.size;
  }

  const rebuild = (mdatBody: number): Uint8Array => {
    const traks = p.traks.map((trak, ti) => {
      const track = p.tracks[ti];
      const parts = kids(trak).map((b) => {
        if (b.type === 'tkhd') return undated(b);
        if (b.type !== 'mdia') return b.type === 'edts' ? box('edts', ...kids(b).map(keep)) : keep(b);
        return box(
          'mdia',
          ...kids(b).map((m) => {
            if (m.type === 'hdlr') {
              const fixed = bytes.slice(m.body, m.body + 24);
              return box('hdlr', fixed, new Uint8Array(1));
            }
            if (m.type === 'mdhd') return undated(m);
            if (m.type !== 'minf') return keep(m);
            return box(
              'minf',
              ...kids(m)
                .filter((n) => n.type !== 'hdlr')
                .map((n) => {
                  if (n.type === 'dinf') return box('dinf', ...kids(n).map(keep));
                  if (n.type !== 'stbl') return keep(n);
                  return box(
                    'stbl',
                    ...kids(n).map((s) => {
                      if (s.type === 'stsd') {
                        const entry = r.boxes(s.body + 8, s.end)[0];
                        const head = bytes.slice(entry.body, entry.body + (track.handler === 'vide' ? 78 : 28));
                        if (track.handler === 'vide') head.fill(0, 42, 74);
                        const extras = kids(entry, head.length).map(keep);
                        return box('stsd', bytes.subarray(s.body, s.body + 8), box(entry.type, head, ...extras));
                      }
                      if (s.type === 'stco' || s.type === 'co64') {
                        const w = s.type === 'stco' ? 4 : 8;
                        const out = new Uint8Array(8 + w * track.chunks.length);
                        const dv = new DataView(out.buffer);
                        dv.setUint32(4, track.chunks.length);
                        track.chunks.forEach((c, i) => {
                          const o = mdatBody + placed.get(c)!;
                          if (w === 4) dv.setUint32(8 + 4 * i, o);
                          else {
                            dv.setUint32(8 + 8 * i, Math.floor(o / 2 ** 32));
                            dv.setUint32(12 + 8 * i, o % 2 ** 32);
                          }
                        });
                        return box(s.type, out);
                      }
                      return keep(s);
                    }),
                  );
                }),
            );
          }),
        );
      });
      return box('trak', ...parts);
    });
    const mvhd = r.boxes(p.moov.body, p.moov.end).find((b) => b.type === 'mvhd')!;
    return box('moov', undated(mvhd), ...traks);
  };

  const ftyp = keep(p.ftyp);
  // The index's size does not depend on where the media data starts: build it once to measure, then for real.
  const size = rebuild(0).length;
  const mdatBody = ftyp.length + size + 8;
  const moov = rebuild(mdatBody);
  const media = new Uint8Array(at);
  for (const c of all) media.set(bytes.subarray(c.offset, c.offset + c.size), placed.get(c)!);
  const out = concat([ftyp, moov, box('mdat', media)]);
  return { bytes: out, removed: p.film.carried };
}
