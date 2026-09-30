// The JPEG Module's reading and stripping, on the test pictures made by
// scripts/fixtures.py. A second, independent decoder (jpeg-js, from Mozilla's
// pdf.js) decodes every picture before and after stripping: the pixels must
// be the same, since stripping never touches the compressed picture.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import jpegjs from 'jpeg-js';
import { NotJpeg, orientationExif, pictureBytes, read, readExif, strip } from '../src/jpeg.ts';

const fixture = (name: string) => new Uint8Array(readFileSync(new URL(`fixtures/${name}`, import.meta.url)));
const decode = (b: Uint8Array) => jpegjs.decode(b, { useTArray: true, formatAsRGBA: true, tolerantDecoding: false });

const same = (a: Uint8Array, b: Uint8Array) => a.length === b.length && a.every((x, i) => x === b[i]);

const PICTURES: Record<string, { w: number; h: number; o: number; carries: string[]; frame: number }> = {
  'phone.jpg': { w: 64, h: 48, o: 6, carries: ['exif', 'location', 'exif-thumbnail'], frame: 0xc0 },
  'progressive.jpg': { w: 80, h: 60, o: 1, carries: ['xmp', 'comment'], frame: 0xc2 },
  'grey.jpg': { w: 64, h: 48, o: 1, carries: [], frame: 0xc0 },
  'cmyk.jpg': { w: 64, h: 48, o: 1, carries: [], frame: 0xc0 },
  'hidden.jpg': { w: 64, h: 48, o: 1, carries: ['multi-picture', 'bytes-after-end'], frame: 0xc0 },
  'jfif-thumbnail.jpg': { w: 64, h: 48, o: 1, carries: ['jfif-thumbnail', 'jfxx-thumbnail', 'iptc'], frame: 0xc0 },
  'aspect.jpg': { w: 64, h: 48, o: 8, carries: ['exif'], frame: 0xc0 },
};

for (const [name, want] of Object.entries(PICTURES)) {
  test(`${name}: read, stripped, and the same pixels after`, () => {
    const b = fixture(name);
    const p = read(b);
    assert.equal(p.width, want.w);
    assert.equal(p.height, want.h);
    assert.equal(p.frame, want.frame);
    assert.equal(p.orientation, want.o);
    assert.equal(p.shownWidth, want.o >= 5 ? want.h : want.w);
    assert.deepEqual([...p.carries].sort(), [...want.carries].sort());

    const s = strip(b);
    assert.deepEqual([...s.removed].sort(), [...want.carries].sort());
    assert.deepEqual(s.picture.carries, [], 'nothing left but the picture');
    assert.equal(s.picture.orientation, want.o, 'the orientation is kept');
    assert.equal(s.picture.width, want.w);
    assert.equal(s.picture.colourProfile, p.colourProfile, 'the colour profile is kept');
    assert.equal(s.picture.adobe, p.adobe, "Adobe's segment is kept");
    assert.equal(s.picture.end, s.bytes.length, 'nothing after the end');
    assert.ok(same(pictureBytes(s.bytes), pictureBytes(b)), 'the compressed picture is copied byte for byte');
    assert.ok(same(strip(s.bytes).bytes, s.bytes), 'stripping twice changes nothing');

    // The second decoder: the same pixels, before and after.
    const before = decode(b);
    const after = decode(s.bytes);
    assert.equal(after.width, want.w);
    assert.equal(after.height, want.h);
    assert.ok(same(after.data as Uint8Array, before.data as Uint8Array), 'the same pixels');
  });
}

test('a phone photo loses its location, its camera and its preview, and keeps which way is up', () => {
  const b = fixture('phone.jpg');
  const raw = Buffer.from(b);
  assert.ok(raw.includes('Model 9 Pro'));
  const s = strip(b);
  const out = Buffer.from(s.bytes);
  assert.ok(!out.includes('Model 9 Pro'));
  assert.ok(!out.includes('Examplco'));
  assert.ok(!out.includes('2026:09:30'));
  // The only Exif left is the orientation: 32 bytes, no location, no preview.
  const exif = s.picture.segments.filter((x) => x.marker === 0xe1);
  assert.equal(exif.length, 1);
  assert.ok(same(exif[0].body, orientationExif(6)));
  assert.deepEqual(readExif(exif[0].body), { orientation: 6, location: false, thumbnail: false });
  // The preview was a different picture (green) from the picture itself.
  assert.ok(s.bytes.length < b.length);
});

test('comments, XMP and hidden pictures are taken out; the colour profile stays', () => {
  const prog = strip(fixture('progressive.jpg'));
  assert.ok(!Buffer.from(prog.bytes).includes('Example Street'));
  assert.ok(!Buffer.from(prog.bytes).includes('A Name'));
  assert.equal(prog.picture.colourProfile, true);
  const hidden = strip(fixture('hidden.jpg'));
  assert.equal(hidden.picture.end, hidden.bytes.length);
  assert.ok(!Buffer.from(hidden.bytes).includes('MPF\0'));
});

test('not pictures: said so, never guessed', () => {
  assert.throws(() => read(fixture('not-a-jpeg.jpg')), NotJpeg);
  assert.throws(() => read(fixture('truncated.jpg')), NotJpeg);
  assert.throws(() => read(new Uint8Array([0xff, 0xd8, 0xff, 0xd9])), /no frame header/);
  assert.throws(() => read(new Uint8Array(0)), NotJpeg);
});

test('an orientation outside 1 to 8 reads as 1', () => {
  const b = fixture('grey.jpg');
  const bad = orientationExif(8);
  bad[25] = 9;
  const withBad = new Uint8Array([...b.subarray(0, 2), 0xff, 0xe1, 0, bad.length + 2, ...bad, ...b.subarray(2)]);
  assert.equal(read(withBad).orientation, 1);
  assert.equal(strip(withBad).picture.orientation, 1);
});

test('only the first Exif segment gives the orientation', () => {
  const b = fixture('grey.jpg');
  const seg = (o: number) => {
    const e = orientationExif(o);
    return [0xff, 0xe1, 0, e.length + 2, ...e];
  };
  const two = new Uint8Array([...b.subarray(0, 2), ...seg(3), ...seg(6), ...b.subarray(2)]);
  assert.equal(read(two).orientation, 3);
  assert.equal(strip(two).picture.orientation, 3);
});

test('20,000 damaged pictures: every one is read or refused, never crashes, and strips clean', () => {
  const names = Object.keys(PICTURES);
  let seed = 42;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) >>> 0;
    return seed / 2 ** 32;
  };
  let read_ = 0;
  let refused = 0;
  for (let n = 0; n < 20000; n++) {
    const b = fixture(names[n % names.length]).slice();
    const k = 1 + Math.floor(rnd() * 4);
    for (let j = 0; j < k; j++) {
      const at = Math.floor(rnd() * b.length);
      b[at] = rnd() < 0.3 ? 0xff : Math.floor(rnd() * 256);
    }
    const cut = rnd() < 0.1 ? b.subarray(0, Math.floor(rnd() * b.length)) : b;
    try {
      const p = read(cut);
      read_++;
      const s = strip(cut);
      assert.deepEqual(s.picture.carries, []);
      assert.equal(s.picture.orientation, p.orientation);
      assert.ok(same(pictureBytes(s.bytes), pictureBytes(cut)));
    } catch (e) {
      if (!(e instanceof NotJpeg)) throw e;
      refused++;
    }
  }
  assert.ok(read_ > 1000 && refused > 1000, `read ${read_}, refused ${refused}`);
});

test('with no JFIF segment, the kept orientation comes first', () => {
  const b = fixture('cmyk.jpg');
  const e = orientationExif(3);
  const withO = new Uint8Array([...b.subarray(0, 2), 0xff, 0xfe, 0, 4, 0x68, 0x69, 0xff, 0xe1, 0, e.length + 2, ...e, ...b.subarray(2)]);
  const s = strip(withO);
  assert.ok(!s.picture.segments.some((x) => x.marker === 0xe0 && Buffer.from(x.body.subarray(0, 5)).toString() === 'JFIF\0'));
  assert.equal(s.picture.segments[0].marker, 0xe1);
  assert.ok(same(s.picture.segments[0].body, e));
  assert.equal(s.picture.adobe, true);
  assert.deepEqual(s.removed, ['comment']);
});
