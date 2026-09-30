// The JPEG Module (modules/module-jpeg-draft-1.md): how a JPEG is read as a
// picture, and how a posting client strips it to the picture alone.
//
// Nothing here decodes pixels. A JPEG is a list of marked segments, then the
// compressed picture; reading the segments is enough to know what a file
// carries besides the picture, which way it is turned, and to take the rest
// out without touching the picture's own bytes. Decoding is left to the
// reader's decoder (a browser's, or any other).

/** Why a file is not a JPEG this Module reads. */
export class NotJpeg extends Error {}

/** One segment, as found in the file. */
export interface Segment {
  /** The marker's second byte (0xE1 for APP1, 0xC0 for SOF0...). */
  marker: number;
  /** Where the segment starts (its 0xFF) and ends (after its body). */
  start: number;
  end: number;
  /** Its body, without the marker and the length. */
  body: Uint8Array;
}

/** What a file carries besides the picture: what a posting client strips (rule 6). */
export type Carried =
  | 'exif'
  | 'location'
  | 'exif-thumbnail'
  | 'xmp'
  | 'iptc'
  | 'comment'
  | 'jfif-thumbnail'
  | 'jfxx-thumbnail'
  | 'multi-picture'
  | 'bytes-after-end'
  | 'other-application-data';

export const CARRIED_WORDS: Record<Carried, string> = {
  exif: 'camera data (Exif)',
  location: 'the place the picture was taken (GPS)',
  'exif-thumbnail': 'a small preview picture (Exif)',
  xmp: 'descriptive data (XMP)',
  iptc: 'captions and credits (IPTC)',
  comment: 'a comment',
  'jfif-thumbnail': 'a small preview picture (JFIF)',
  'jfxx-thumbnail': 'a small preview picture (JFXX)',
  'multi-picture': 'further pictures (multi-picture format)',
  'bytes-after-end': 'bytes after the end of the picture',
  'other-application-data': 'other application data',
};

/** The picture a JPEG holds, as the Module reads it. */
export interface Picture {
  /** Frame type: 0xC0 baseline, 0xC1 extended, 0xC2 progressive, and so on. */
  frame: number;
  /** Baseline, extended, progressive, lossless; Huffman or arithmetic coding. */
  process: string;
  precision: number;
  /** Width and height as stored. */
  width: number;
  height: number;
  components: number;
  /** Exif orientation, 1 to 8; 1 when absent or out of range (rule 3). */
  orientation: number;
  /** Width and height as shown, after orientation. */
  shownWidth: number;
  shownHeight: number;
  /** An ICC colour profile is embedded (rule 4). */
  colourProfile: boolean;
  /** Adobe's segment is present (it says how the colour channels are coded). */
  adobe: boolean;
  /** Where the picture ends: just after its EOI. */
  end: number;
  /** Everything besides the picture, as found. */
  carries: Carried[];
  segments: Segment[];
}

const SOI = 0xd8;
const EOI = 0xd9;
const SOS = 0xda;
const DNL = 0xdc;
const APP0 = 0xe0;
const APP1 = 0xe1;
const APP2 = 0xe2;
const APP13 = 0xed;
const APP14 = 0xee;
const COM = 0xfe;

/** Frame markers: SOF0 to SOF15, except DHT (C4), JPG (C8) and DAC (CC). */
export function isFrame(m: number): boolean {
  return m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc;
}

const PROCESS: Record<number, string> = {
  0xc0: 'baseline',
  0xc1: 'extended sequential',
  0xc2: 'progressive',
  0xc3: 'lossless',
  0xc5: 'differential sequential',
  0xc6: 'differential progressive',
  0xc7: 'differential lossless',
  0xc9: 'extended sequential, arithmetic coding',
  0xca: 'progressive, arithmetic coding',
  0xcb: 'lossless, arithmetic coding',
  0xcd: 'differential sequential, arithmetic coding',
  0xce: 'differential progressive, arithmetic coding',
  0xcf: 'differential lossless, arithmetic coding',
};

const ascii = (b: Uint8Array, from: number, s: string) => {
  if (b.length < from + s.length) return false;
  for (let i = 0; i < s.length; i++) if (b[from + i] !== s.charCodeAt(i)) return false;
  return true;
};

const u16 = (b: Uint8Array, i: number) => (b[i] << 8) | b[i + 1];

/**
 * Split a file into its segments, from SOI to EOI (rule 1). The compressed
 * data after each SOS runs to the next marker that is neither a stuffed
 * zero (FF 00) nor a restart (FF D0 to D7); it is kept inside the SOS
 * segment's span, so that copying spans copies the picture exactly.
 */
export function segments(b: Uint8Array): { segments: Segment[]; end: number } {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== SOI) throw new NotJpeg('it does not begin with a JPEG start marker');
  const out: Segment[] = [];
  let i = 2;
  let frameSeen = false;
  let hierarchical = false;
  for (;;) {
    if (i >= b.length) throw new NotJpeg('it ends before its end marker');
    if (b[i] !== 0xff) throw new NotJpeg(`a byte that is not a marker at ${i}`);
    // Fill bytes (FF FF ...) may precede a marker.
    while (i < b.length && b[i] === 0xff) i++;
    if (i >= b.length) throw new NotJpeg('it ends before its end marker');
    const m = b[i];
    const start = i - 1;
    i++;
    if (m === EOI) {
      if (!frameSeen) throw new NotJpeg('it has no frame header');
      out.push({ marker: m, start, end: i, body: new Uint8Array(0) });
      return { segments: out, end: i };
    }
    if (m === SOI) throw new NotJpeg('a second start marker before the end');
    if (m === 0x00 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) throw new NotJpeg(`a stray marker FF${hex2(m)} at ${start}`);
    if (i + 2 > b.length) throw new NotJpeg('it ends inside a segment');
    const len = u16(b, i);
    if (len < 2 || i + len > b.length) throw new NotJpeg(`a segment runs past the end of the file at ${start}`);
    const body = b.subarray(i + 2, i + len);
    i += len;
    if (m === 0xde) hierarchical = true;
    if (isFrame(m)) {
      // Only the hierarchical process (announced by DHP) has several frames.
      if (frameSeen && !hierarchical) throw new NotJpeg('a second frame header');
      frameSeen = true;
    }
    if (m === SOS) {
      if (!frameSeen) throw new NotJpeg('a scan before the frame header');
      // The compressed data.
      for (;;) {
        if (i + 1 >= b.length) throw new NotJpeg('it ends inside the compressed picture');
        if (b[i] === 0xff) {
          const n = b[i + 1];
          if (n === 0x00 || (n >= 0xd0 && n <= 0xd7)) {
            i += 2;
            continue;
          }
          if (n === 0xff) {
            // fill before a marker
            i++;
            continue;
          }
          break;
        }
        i++;
      }
    }
    out.push({ marker: m, start, end: i, body });
  }
}

const hex2 = (n: number) => n.toString(16).toUpperCase().padStart(2, '0');

/** What an Exif segment holds: its orientation, and whether it carries a location or a thumbnail. */
export function readExif(body: Uint8Array): { orientation: number | null; location: boolean; thumbnail: boolean } {
  const none = { orientation: null, location: false, thumbnail: false };
  if (!ascii(body, 0, 'Exif\0\0')) return none;
  const t = body.subarray(6);
  if (t.length < 8) return none;
  const le = t[0] === 0x49 && t[1] === 0x49;
  const be = t[0] === 0x4d && t[1] === 0x4d;
  if (!le && !be) return none;
  const r16 = (o: number) => (o + 2 > t.length ? -1 : le ? t[o] | (t[o + 1] << 8) : (t[o] << 8) | t[o + 1]);
  const r32 = (o: number) =>
    o + 4 > t.length
      ? -1
      : le
        ? (t[o] | (t[o + 1] << 8) | (t[o + 2] << 16) | (t[o + 3] << 24)) >>> 0
        : ((t[o] << 24) | (t[o + 1] << 16) | (t[o + 2] << 8) | t[o + 3]) >>> 0;
  if (r16(2) !== 42) return none;
  const ifd0 = r32(4);
  const entries = (o: number) => {
    const n = r16(o);
    if (n < 0 || o + 2 + 12 * n + 4 > t.length) return null;
    const list: { tag: number; type: number; count: number; at: number }[] = [];
    for (let k = 0; k < n; k++) {
      const at = o + 2 + 12 * k;
      list.push({ tag: r16(at), type: r16(at + 2), count: r32(at + 4), at: at + 8 });
    }
    return { list, next: r32(o + 2 + 12 * n) };
  };
  const first = entries(ifd0);
  if (!first) return none;
  let orientation: number | null = null;
  let location = false;
  for (const e of first.list) {
    if (e.tag === 0x0112 && e.type === 3 && e.count === 1) orientation = r16(e.at);
    if (e.tag === 0x8825) location = true;
  }
  let thumbnail = false;
  if (first.next > 0 && first.next < t.length) {
    const second = entries(first.next);
    if (second) thumbnail = second.list.some((e) => e.tag === 0x0201 || e.tag === 0x0111);
  }
  return { orientation, location, thumbnail };
}

/**
 * Read a JPEG as the Module does (rules 1 to 5). Throws NotJpeg for bytes
 * that are not one.
 */
export function read(b: Uint8Array): Picture {
  const { segments: segs, end } = segments(b);
  const frame = segs.find((s) => isFrame(s.marker))!;
  if (frame.body.length < 6) throw new NotJpeg('a frame header too short');
  const precision = frame.body[0];
  let height = u16(frame.body, 1);
  const width = u16(frame.body, 3);
  const components = frame.body[5];
  if (frame.body.length !== 6 + 3 * components) throw new NotJpeg('a frame header of the wrong length');
  if (width === 0) throw new NotJpeg('a picture zero pixels wide');
  if (components === 0) throw new NotJpeg('a picture with no colour component');
  if (height === 0) {
    // The height is given after the first scan, by DNL.
    const dnl = segs.find((s) => s.marker === DNL);
    if (!dnl || dnl.body.length !== 2 || u16(dnl.body, 0) === 0) throw new NotJpeg('a picture of no height');
    height = u16(dnl.body, 0);
  }

  const carries = new Set<Carried>();
  let orientation: number | null = null;
  let exifSeen = false;
  let colourProfile = false;
  let adobe = false;
  let jfifSeen = false;
  for (const s of segs) {
    const m = s.marker;
    if (m === APP0) {
      if (isJfif(s.body) && !jfifSeen) {
        jfifSeen = true;
        if (s.body[12] * s.body[13] > 0) carries.add('jfif-thumbnail');
      } else if (ascii(s.body, 0, 'JFIF\0')) carries.add('other-application-data');
      else if (ascii(s.body, 0, 'JFXX\0')) carries.add('jfxx-thumbnail');
      else carries.add('other-application-data');
    } else if (m === APP1) {
      if (ascii(s.body, 0, 'Exif\0\0')) {
        const e = readExif(s.body);
        // Only the first Exif segment counts (rule 3).
        if (!exifSeen) orientation = e.orientation;
        exifSeen = true;
        if (e.location) carries.add('location');
        if (e.thumbnail) carries.add('exif-thumbnail');
        if (!isOnlyOrientation(s.body)) carries.add('exif');
      } else if (ascii(s.body, 0, 'http://ns.adobe.com/xap/1.0/') || ascii(s.body, 0, 'http://ns.adobe.com/xmp/')) {
        carries.add('xmp');
      } else carries.add('other-application-data');
    } else if (m === APP2) {
      if (ascii(s.body, 0, 'ICC_PROFILE\0')) colourProfile = true;
      else if (ascii(s.body, 0, 'MPF\0')) carries.add('multi-picture');
      else carries.add('other-application-data');
    } else if (m === APP13) {
      carries.add('iptc');
    } else if (m === APP14) {
      if (ascii(s.body, 0, 'Adobe')) adobe = true;
      else carries.add('other-application-data');
    } else if (m > APP0 && m <= 0xef) {
      carries.add('other-application-data');
    } else if (m === COM) {
      carries.add('comment');
    }
  }
  if (end < b.length) carries.add('bytes-after-end');

  const o = orientation !== null && orientation >= 1 && orientation <= 8 ? orientation : 1;
  const turned = o >= 5;
  return {
    frame: frame.marker,
    process: PROCESS[frame.marker] ?? 'unknown',
    precision,
    width,
    height,
    components,
    orientation: o,
    shownWidth: turned ? height : width,
    shownHeight: turned ? width : height,
    colourProfile,
    adobe,
    end,
    carries: [...carries],
    segments: segs,
  };
}

/** The Exif segment a stripped picture keeps: the orientation and nothing else (rule 6). */
export function orientationExif(orientation: number): Uint8Array {
  if (!Number.isInteger(orientation) || orientation < 2 || orientation > 8) throw new Error('an orientation from 2 to 8');
  // "Exif\0\0", a big-endian TIFF header, one IFD with one entry (0x0112,
  // SHORT, 1, the value), no next IFD.
  return Uint8Array.from([
    0x45, 0x78, 0x69, 0x66, 0, 0,
    0x4d, 0x4d, 0, 0x2a, 0, 0, 0, 8,
    0, 1,
    0x01, 0x12, 0, 3, 0, 0, 0, 1, 0, orientation, 0, 0,
    0, 0, 0, 0,
  ]);
}

/** A JFIF segment's body: the identifier, version, units, densities and thumbnail size, then the thumbnail. */
function isJfif(body: Uint8Array): boolean {
  return ascii(body, 0, 'JFIF\0') && body.length >= 14;
}

function isOnlyOrientation(body: Uint8Array): boolean {
  const e = readExif(body);
  if (e.orientation === null || e.orientation < 2 || e.orientation > 8) return false;
  const want = orientationExif(e.orientation);
  return body.length === want.length && body.every((x, i) => x === want[i]);
}

export interface Stripped {
  bytes: Uint8Array;
  /** What was taken out, in plain words (rule 6: the user is told). */
  removed: Carried[];
  picture: Picture;
}

/**
 * Strip a JPEG to the picture alone (rule 6). Kept: every segment the
 * picture's decoding needs (tables, frame, scans and their compressed data,
 * restart interval, DNL), the JFIF segment without its thumbnail, the ICC
 * colour profile and Adobe's segment (both change how the picture's colours
 * are read), and the orientation, rewritten as the only Exif entry. Taken
 * out: everything else, and every byte after the end marker. The compressed
 * picture is copied byte for byte, so the stripped file decodes to exactly
 * the same pixels, shown the same way.
 */
export function strip(b: Uint8Array): Stripped {
  const p = read(b);
  const parts: Uint8Array[] = [Uint8Array.from([0xff, SOI])];
  const hasJfif = p.segments.some((s) => s.marker === APP0 && isJfif(s.body));
  // With no JFIF segment, the orientation goes first.
  if (!hasJfif && p.orientation !== 1) parts.push(segment(APP1, orientationExif(p.orientation)));
  let jfifDone = false;
  for (const s of p.segments) {
    const m = s.marker;
    if (m === EOI) break;
    if (m === APP0 && isJfif(s.body) && !jfifDone) {
      const body = s.body.slice(0, 14);
      body[12] = 0;
      body[13] = 0;
      parts.push(segment(APP0, body));
      jfifDone = true;
      // The orientation goes right after JFIF, where readers look for Exif.
      if (p.orientation !== 1) parts.push(segment(APP1, orientationExif(p.orientation)));
      continue;
    }
    if (m >= APP0 && m <= 0xef) {
      if (m === APP2 && ascii(s.body, 0, 'ICC_PROFILE\0')) parts.push(b.subarray(s.start, s.end));
      else if (m === APP14 && ascii(s.body, 0, 'Adobe')) parts.push(b.subarray(s.start, s.end));
      continue;
    }
    if (m === COM) continue;
    parts.push(b.subarray(s.start, s.end));
  }
  parts.push(Uint8Array.from([0xff, EOI]));
  const bytes = concat(parts);
  const after = read(bytes);
  if (after.carries.length) throw new Error(`stripping left ${after.carries.join(', ')}`);
  return { bytes, removed: p.carries, picture: after };
}

function segment(marker: number, body: Uint8Array): Uint8Array {
  const out = new Uint8Array(4 + body.length);
  out[0] = 0xff;
  out[1] = marker;
  out[2] = (body.length + 2) >> 8;
  out[3] = (body.length + 2) & 0xff;
  out.set(body, 4);
  return out;
}

function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

/** The compressed picture's bytes: every segment a decoder needs, in order. Stripping keeps them unchanged. */
export function pictureBytes(b: Uint8Array): Uint8Array {
  const p = read(b);
  return concat(
    p.segments
      .filter((s) => !(s.marker >= APP0 && s.marker <= 0xef) && s.marker !== COM)
      .map((s) => b.subarray(s.start, s.end)),
  );
}
