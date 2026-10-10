// The video Module's founding implementation against its test films: what
// it reads, what it refuses and why, and what stripping leaves (the same
// samples, byte for byte, and nothing else). 20,000 damaged files are each
// read or refused, never anything else.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { CARRIED_WORDS, MAX_BYTES, NotFilm, read, strip, trackData } from '../src/video.ts';

const dir = new URL('./fixtures/', import.meta.url);
const load = (name: string) => new Uint8Array(readFileSync(new URL(name, dir)));
const vectors = JSON.parse(readFileSync(new URL('../vectors/video.json', import.meta.url), 'utf8')).vectors as {
  file: string;
  sha256: string;
  film?: unknown;
  refused?: { kind: string; reason: string };
  stripped?: { file: string; sha256: string; removed: string[] };
}[];
const sha256 = (b: Uint8Array) => createHash('sha256').update(b).digest('hex');
const has = (b: Uint8Array, text: string) => Buffer.from(b).includes(Buffer.from(text, 'latin1'));

test('every test film is read, or refused, as its vector says', () => {
  const names = readdirSync(dir).filter((f) => f.endsWith('.mp4')).sort();
  assert.deepEqual(names, vectors.map((v) => v.file));
  for (const v of vectors) {
    const b = load(v.file);
    assert.equal(sha256(b), v.sha256, v.file);
    if (v.refused) {
      assert.throws(() => read(b), (e: unknown) => e instanceof NotFilm && e.kind === v.refused!.kind && e.message === v.refused!.reason, v.file);
    } else {
      assert.deepEqual(read(b), v.film, v.file);
      const s = strip(b);
      assert.equal(sha256(s.bytes), v.stripped!.sha256, v.file);
      assert.deepEqual(s.removed, v.stripped!.removed, v.file);
    }
  }
});

test('the films it plays: H.264, AAC-LC, turned, the index first or last', () => {
  const plain = read(load('plain.mp4'));
  assert.equal(plain.type, 'video/mp4; codecs="avc1.42c00c"');
  assert.deepEqual([plain.video.width, plain.video.height, plain.duration, plain.audio], [320, 180, 2, null]);
  const sound = read(load('sound.mp4'));
  assert.equal(sound.video.profile, 'High');
  assert.deepEqual(sound.audio && [sound.audio.codec, sound.audio.channels, sound.audio.sampleRate], ['mp4a.40.2', 2, 48000]);
  const last = read(load('index-last.mp4'));
  assert.equal(last.indexFirst, false);
  assert.deepEqual(last.audio && [last.audio.channels, last.audio.sampleRate], [1, 44100]);
  const turned = read(load('turned.mp4'));
  assert.equal(turned.video.rotation, 90);
  assert.deepEqual(turned.video.shown, { width: 180, height: 320 });
});

test('what it refuses, with the rule each refusal comes from', () => {
  const why = (name: string) => {
    try {
      read(load(name));
    } catch (e) {
      assert.ok(e instanceof NotFilm, name);
      return `${e.kind}: ${e.message}`;
    }
    assert.fail(`${name} was read`);
  };
  assert.match(why('external.mp4'), /^refused: .*stored outside this file/);
  assert.match(why('fragmented.mp4'), /^refused: a fragmented MP4/);
  assert.match(why('hevc.mp4'), /^refused: pictures coded as "hvc1"/);
  assert.match(why('mpeg4-part2.mp4'), /^refused: pictures coded as "mp4v"/);
  assert.match(why('high-444.mp4'), /^refused: .*4:2:0/);
  assert.match(why('mp3-sound.mp4'), /^refused: sound that is not MPEG-4 audio/);
  assert.match(why('subtitles.mp4'), /^refused: a track of kind "sbtl"/);
  assert.match(why('two-pictures.mp4'), /^refused: 2 picture tracks/);
  assert.match(why('too-large.mp4'), /^limits: pictures of 2560 x 1440/);
  assert.match(why('too-long.mp4'), /^limits: 601 seconds/);
  assert.match(why('too-fast.mp4'), /^limits: 120 pictures a second/);
  assert.match(why('truncated.mp4'), /^structure: /);
  assert.match(why('not-an-mp4.mp4'), /^structure: /);
  // Larger than one media object can hold, refused before anything is read.
  assert.throws(() => read(new Uint8Array(MAX_BYTES + 1)), (e: unknown) => e instanceof NotFilm && e.kind === 'limits');
});

test('a track matrix that is not a quarter turn is refused', () => {
  const b = load('turned.mp4');
  const at = Buffer.from(b).indexOf(Buffer.from('tkhd')) - 4;
  const m = new DataView(b.buffer, b.byteOffset + at + 8 + 40);
  m.setInt32(0, 0x8000); // scaled by a half
  assert.throws(() => read(b), /not a quarter turn/);
});

test('stripping keeps every sample byte for byte, takes out everything else, and puts the index first', () => {
  for (const v of vectors.filter((x) => x.film)) {
    const b = load(v.file);
    const s = strip(b);
    assert.deepEqual(trackData(s.bytes), trackData(b), `${v.file}: the samples are the same`);
    const again = read(s.bytes);
    assert.deepEqual(again.carried, [], `${v.file}: the stripped film carries nothing else`);
    assert.equal(again.indexFirst, true);
    assert.deepEqual({ ...again, carried: [], indexFirst: true }, { ...read(b), carried: [], indexFirst: true }, `${v.file}: the same film`);
    assert.deepEqual(strip(s.bytes), { bytes: s.bytes, removed: [] }, `${v.file}: stripping twice changes nothing`);
    for (const word of ['udta', 'loci', 'Lavf', 'free', 'uuid', 'Hidden note', 'hidden where', 'A holiday', 'VideoHandler', 'SoundHandler']) {
      assert.ok(!has(s.bytes, word), `${v.file}: "${word}" left in the stripped file`);
    }
  }
  const tagged = strip(load('tagged.mp4'));
  assert.deepEqual(tagged.removed, ['metadata', 'location', 'names', 'free']);
  assert.ok(tagged.removed.every((c) => CARRIED_WORDS[c]));
  assert.deepEqual(strip(load('hidden.mp4')).removed, ['metadata', 'names', 'free', 'unknown', 'unused-media']);
});

test('20,000 damaged films are each read or refused as not a film, never anything else; every one read strips clean', () => {
  let seed = 7;
  const rand = (n: number) => {
    seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff;
    return seed % n;
  };
  const sources = ['plain.mp4', 'sound.mp4', 'tagged.mp4', 'index-last.mp4', 'hidden.mp4'].map(load);
  let read_ = 0;
  for (let i = 0; i < 20_000; i++) {
    const src = sources[i % sources.length];
    let b = src.slice();
    const kind = rand(4);
    if (kind === 0) b = b.subarray(0, rand(b.length));
    else {
      // Damage the index more than the media: that is where the rules are.
      const moov = Buffer.from(src).indexOf(Buffer.from('moov'));
      for (let k = 0, n = 1 + rand(4); k < n; k++) {
        const at = kind === 1 ? rand(b.length) : moov - 4 + rand(Math.min(3000, b.length - moov));
        b[at] = kind === 3 ? b[at] ^ (1 << rand(8)) : rand(256);
      }
    }
    try {
      read(b);
    } catch (e) {
      if (!(e instanceof NotFilm)) throw new Error(`damaged file ${i}: ${e}`);
      continue;
    }
    read_++;
    const s = strip(b);
    assert.deepEqual(read(s.bytes).carried, [], `damaged file ${i}`);
    assert.deepEqual(trackData(s.bytes), trackData(b), `damaged file ${i}`);
  }
  assert.ok(read_ > 1000, `only ${read_} damaged files were still films`);
});
