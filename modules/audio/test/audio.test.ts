// The audio Module's founding implementation against its test recordings:
// what it reads, what it refuses and why, and what stripping leaves (the same
// samples, byte for byte, and nothing else). 20,000 damaged files are each
// read or refused, never anything else.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { CARRIED_WORDS, MAX_BYTES, NotSound, read, strip, trackData } from '../src/audio.ts';
import { read as readFilm } from '../../video/src/video.ts';

const dir = new URL('./fixtures/', import.meta.url);
const load = (name: string) => new Uint8Array(readFileSync(new URL(name, dir)));
const vectors = JSON.parse(readFileSync(new URL('../vectors/audio.json', import.meta.url), 'utf8')).vectors as {
  file: string;
  sha256: string;
  sound?: unknown;
  refused?: { kind: string; reason: string };
  stripped?: { file: string; sha256: string; removed: string[] };
}[];
const sha256 = (b: Uint8Array) => createHash('sha256').update(b).digest('hex');
const has = (b: Uint8Array, text: string) => Buffer.from(b).includes(Buffer.from(text, 'latin1'));

test('every test recording is read, or refused, as its vector says', () => {
  const names = readdirSync(dir).filter((f) => f.endsWith('.m4a')).sort();
  assert.deepEqual(names, vectors.map((v) => v.file));
  for (const v of vectors) {
    const b = load(v.file);
    assert.equal(sha256(b), v.sha256, v.file);
    if (v.refused) {
      assert.throws(() => read(b), (e: unknown) => e instanceof NotSound && e.kind === v.refused!.kind && e.message === v.refused!.reason, v.file);
    } else {
      assert.deepEqual(read(b), v.sound, v.file);
      const s = strip(b);
      assert.equal(sha256(s.bytes), v.stripped!.sha256, v.file);
      assert.deepEqual(s.removed, v.stripped!.removed, v.file);
    }
  }
});

test('the recordings it plays: AAC-LC, mono or stereo, the M4A brand or an MP4 one, the index first or last', () => {
  const mono = read(load('mono.m4a'));
  assert.equal(mono.type, 'audio/mp4; codecs="mp4a.40.2"');
  assert.deepEqual([mono.brand, mono.audio.channels, mono.audio.sampleRate, mono.indexFirst], ['M4A ', 1, 44100, true]);
  const stereo = read(load('stereo.m4a'));
  assert.deepEqual([stereo.brand, stereo.audio.channels, stereo.audio.sampleRate], ['isom', 2, 48000]);
  const last = read(load('index-last.m4a'));
  assert.deepEqual([last.indexFirst, last.audio.sampleRate], [false, 32000]);
  assert.ok(read(load('tagged.m4a')).carried.includes('location'));
});

test('what it refuses, with the rule each refusal comes from', () => {
  const why = (name: string) => {
    try {
      read(load(name));
    } catch (e) {
      assert.ok(e instanceof NotSound, name);
      return `${e.kind}: ${e.message}`;
    }
    assert.fail(`${name} was read`);
  };
  assert.match(why('with-picture.m4a'), /^refused: a picture track: an M4A file holds sound only/);
  assert.match(why('alac.m4a'), /^refused: sound coded as "alac"/);
  assert.match(why('mp3.m4a'), /^refused: sound that is not MPEG-4 audio/);
  assert.match(why('aac-main.m4a'), /^refused: AAC of another kind than AAC-LC \(audio object type 1\)/);
  assert.match(why('surround.m4a'), /^refused: sound with more than two channels/);
  assert.match(why('two-sounds.m4a'), /^refused: 2 sound tracks/);
  assert.match(why('chapters.m4a'), /^refused: a track of kind "text"/);
  assert.match(why('quicktime.m4a'), /^refused: a QuickTime file/);
  assert.match(why('fragmented.m4a'), /^refused: a fragmented file/);
  assert.match(why('external.m4a'), /^refused: .*stored outside this file/);
  assert.match(why('too-fine.m4a'), /^limits: sound sampled at 96000 Hz/);
  assert.match(why('too-long.m4a'), /^limits: 7201 seconds/);
  assert.match(why('truncated.m4a'), /^structure: /);
  assert.match(why('not-an-m4a.m4a'), /^structure: /);
  // Larger than one media object can hold, refused before anything is read.
  assert.throws(() => read(new Uint8Array(MAX_BYTES + 1)), (e: unknown) => e instanceof NotSound && e.kind === 'limits');
});

test('a sound that names a stream elsewhere is refused in this Module’s words, not the video Module’s', () => {
  const b = load('mono.m4a');
  // The elementary stream descriptor's flags: set the URL flag (0x40).
  const at = Buffer.from(b).indexOf(Buffer.from('esds')) + 4 + 4;
  assert.equal(b[at], 3);
  const lenBytes = b[at + 1] & 0x80 ? 4 : 1;
  b[at + 1 + lenBytes + 2] |= 0x40;
  assert.throws(() => read(b), (e: unknown) => e instanceof NotSound && e.message === 'the sound names a stream elsewhere (a URL), which a recording may not');
});

test('a sound track whose matrix is not the identity is refused', () => {
  const b = load('mono.m4a');
  const at = Buffer.from(b).indexOf(Buffer.from('tkhd')) - 4;
  const m = new DataView(b.buffer, b.byteOffset + at + 8 + 40);
  m.setInt32(0, 0);
  m.setInt32(4, 0x10000);
  m.setInt32(12, -0x10000);
  m.setInt32(16, 0);
  assert.throws(() => read(b), /matrix is not the identity/);
});

test('the video Module refuses every recording this one plays, and this one refuses the video Module’s films', () => {
  for (const v of vectors.filter((x) => x.sound)) assert.throws(() => readFilm(load(v.file)), /picture track/, v.file);
  for (const film of ['plain.mp4', 'sound.mp4']) {
    const b = new Uint8Array(readFileSync(new URL(`../../video/test/fixtures/${film}`, import.meta.url)));
    assert.throws(() => read(b), (e: unknown) => e instanceof NotSound && /picture track/.test(e.message), film);
  }
});

test('stripping keeps every sample byte for byte, takes out everything else, and puts the index first', () => {
  for (const v of vectors.filter((x) => x.sound)) {
    const b = load(v.file);
    const s = strip(b);
    assert.deepEqual(trackData(s.bytes), trackData(b), `${v.file}: the samples are the same`);
    const again = read(s.bytes);
    assert.deepEqual(again.carried, [], `${v.file}: the stripped recording carries nothing else`);
    assert.equal(again.indexFirst, true);
    assert.deepEqual({ ...again, carried: [], indexFirst: true }, { ...read(b), carried: [], indexFirst: true }, `${v.file}: the same sound`);
    assert.deepEqual(strip(s.bytes), { bytes: s.bytes, removed: [] }, `${v.file}: stripping twice changes nothing`);
    for (const word of ['udta', 'ilst', 'covr', 'loci', '©xyz', 'Lavf', 'free', 'uuid', 'Hidden note', 'hidden where', 'A song', 'Someone singing', 'SoundHandler', 'PNG']) {
      assert.ok(!has(s.bytes, word), `${v.file}: "${word}" left in the stripped file`);
    }
  }
  const tagged = strip(load('tagged.m4a'));
  assert.deepEqual(tagged.removed, ['metadata', 'location', 'names', 'free']);
  assert.ok(tagged.removed.every((c) => CARRIED_WORDS[c]));
  assert.deepEqual(strip(load('hidden.m4a')).removed, ['metadata', 'names', 'free', 'unknown', 'unused-media']);
});

test('20,000 damaged recordings are each read or refused as not a recording, never anything else; every one read strips clean', () => {
  let seed = 11;
  const rand = (n: number) => {
    seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff;
    return seed % n;
  };
  const sources = ['mono.m4a', 'stereo.m4a', 'tagged.m4a', 'index-last.m4a', 'hidden.m4a'].map(load);
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
      if (!(e instanceof NotSound)) throw new Error(`damaged file ${i}: ${e}`);
      continue;
    }
    read_++;
    const s = strip(b);
    assert.deepEqual(read(s.bytes).carried, [], `damaged file ${i}`);
    assert.deepEqual(trackData(s.bytes), trackData(b), `damaged file ${i}`);
  }
  assert.ok(read_ > 1000, `only ${read_} damaged recordings were still recordings`);
});
