// The named tests of the Nakišib round (docs/nakisib-report.md), against
// real homes and a relay on local ports, Kišib's own program and Nakišib's:
//
// - a whole change of keys for a test identity made in Dub: Kišib writes the
//   request; Nakišib reads it and shows its own summary (a dangerous part
//   first), takes the paper, draws the fresh one, refuses a wrong word typed
//   back, signs on SIGN, writes the answer; Kišib checks it and sends it;
//   the homes accept; the new signing key's words; the next change of keys
//   from the new paper works; the old paper refused, said plainly;
// - asked again for the same request: the same bytes; asked for a different
//   change of the same key: refused, as the Module says;
// - Kišib closed between the request and the answer: the answer sent from
//   both files, the lost signing key said;
// - a genesis: Nakišib's commitment, Kišib's genesis from it, read back at the homes;
// - after each, Nakišib's folder read whole: no seed, no words, no key, only
//   its memory of what it signed.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { lookUp } from '../../genesis/src/lookup.ts';
import { fromWords } from '../../../modules/carry/src/carry.ts';
import { chainKeyAt } from '../../kishib/src/words.ts';
import type { Review, State } from '../../kishib/src/shapes.ts';
import { closeAll, dub, folder, kishib, nakisib, refused, start, stopAll, walkPaper, type Nakisib, type Relay } from './world.ts';

let homes: Relay[];
let relay: Relay;
const files = mkdtempSync(join(tmpdir(), 'nakisib-stick-'));
const stick = (name: string) => join(files, name);
const b64 = (p: string) => readFileSync(p).toString('base64');

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
});

after(async () => {
  await stopAll();
  await closeAll();
  for (const h of [...homes, relay]) await h.stop();
});

/** Nakišib's folder, read whole: only its memory, and nothing of any paper in it. */
function holdsNothing(n: Nakisib, papers: string[][]) {
  const all = folder(n.dir);
  assert.deepEqual([...all.keys()].filter((f) => f !== 'memory.cbor'), [], 'only the memory of what it signed');
  for (const [, bytes] of all) {
    const text = bytes.toString('latin1');
    for (const p of papers) {
      const seed = p.length === 24 ? fromWords(p.join(' ')) : Buffer.from(p.join('').slice(0, 64), 'hex');
      assert.ok(!bytes.includes(Buffer.from(seed)), 'no seed');
      assert.ok(!text.includes(Buffer.from(seed).toString('hex')), 'no seed in hexadecimal');
      assert.ok(!text.includes(p.slice(0, 4).join(' ')) && !text.includes(p[0] + p[1] + p[2]), 'no words');
      for (const scheme of [2, 3]) {
        for (let i = 0; i < 4; i++) {
          const k = chainKeyAt(new Uint8Array(seed), scheme, i);
          assert.ok(!bytes.includes(Buffer.from(k.seeds.slice(0, 16))), 'no chain key');
        }
      }
    }
  }
}

/** Kišib's change of keys with Nakišib, up to the request written to the stick. */
async function request(k: Awaited<ReturnType<typeof kishib>>, id: string, file: string, extra: Record<string, unknown> = {}): Promise<{ review: Review; fingerprint: string }> {
  const review = await k.c.ask<Review>('nakisib plan', { id, address: homes[0].base, ...extra });
  const s = await k.c.ask<State>('confirm', { plan: review.plan, digest: review.digest });
  assert.equal(s.sitting!.stage, 'request');
  const r = await k.c.ask<{ name: string; bytes: string; fingerprint: string }>('nakisib request');
  writeFileSync(file, Buffer.from(r.bytes, 'base64'));
  return { review, fingerprint: r.fingerprint };
}

test('a whole change of keys through Nakišib; the same bytes again; a different change refused; the next from the new paper; the old paper refused', async () => {
  const H = homes.map((h) => h.base);
  const d = await dub(H, [relay.base]);
  const k = await kishib();
  const n = await nakisib();
  const first = d.chainWords;

  // Kišib: everything read back, nothing about a paper asked; said what the offline way protects and that it is optional.
  const { review, fingerprint } = await request(k, d.id, stick('request-1.mor'));
  assert.ok(review.sections.some((s) => s.heading === 'With Nakišib, Kišib’s offline companion' && s.lines.some((l) => /never touches a connected device/.test(l.text)) && s.lines.some((l) => /^Optional/.test(l.text))));
  assert.match(review.signs[0], /Kišib signs nothing with a chain key/);
  assert.equal((await lookUp(d.id, H)).resolution.links.length, 1, 'nothing signed by Kišib');

  // Nakišib believes none of it: its own reading of the exact bytes, the dangerous parts first.
  const st = await n.ask<{ stage: string; preview: { summary: { prominent: string[]; context: string[] }; position: number; already: string } }>('read', { path: stick('request-1.mor') });
  assert.equal(st.stage, 'read');
  assert.equal(st.preview.position, 1);
  assert.equal(st.preview.already, 'new');
  assert.match(st.preview.summary.prominent[0], new RegExp(`^New signing key: fingerprint ${fingerprint}`), 'the new signing key first, the same fingerprint as Kišib’s');
  assert.ok(st.preview.summary.context.some((c) => c.startsWith('Kišib: ')), 'Kišib’s words, apart, unchecked');

  // The paper: a wrong one refused, plainly; the right one; nothing signed before the new paper.
  await refused(n.ask('paper', { words: 'abandon '.repeat(23) + 'art' }), /no chain key matching .* it may be an earlier, spent one/);
  await n.ask('paper', { words: first.join(' ') });
  await refused(n.ask('sign', { word: 'SIGN' }), /Not yet/);
  const second = await walkPaper(n, true);
  assert.notDeepEqual(second, first, 'a fresh paper');
  await refused(n.ask('sign', { word: 'sign' }), /Type SIGN/);
  const signed = await n.ask<{ stage: string; summary: { prominent: string[] }; act: string }>('sign', { word: 'SIGN' });
  assert.equal(signed.stage, 'signed');
  assert.ok(signed.summary.prominent.some((l) => l.startsWith('FRESH SEED')), 'the Module’s own summary');
  await n.ask('write', { path: stick('answer-1.mor') });
  holdsNothing(n, [first, second]);

  // Kišib: a file that is not the answer refused; the answer checked (rule 3.9), sent, counting; the signing words once it counts.
  await refused(k.c.ask('nakisib answer', { answer: b64(stick('request-1.mor')) }), /not Nakišib’s answer/);
  let s = await k.c.ask<State>('nakisib answer', { answer: b64(stick('answer-1.mor')) });
  assert.equal(s.sitting!.act, signed.act);
  if ((s.sitting!.stage as string) === 'sent') s = await k.c.ask<State>('refresh');
  assert.equal(s.sitting!.stage, 'counts', JSON.stringify(s.sitting!.lines));
  const look = await lookUp(d.id, H);
  assert.equal(look.resolution.links.length, 2, 'the homes accept');
  assert.equal(look.resolution.links[1].act, signed.act);
  const w = await k.c.ask<{ words: string[]; which: string }>('words show');
  assert.equal(w.which, 'signing');
  s = await k.c.ask<State>('words written');
  s = await k.c.ask<State>('words typed', { typed: s.sitting!.positions!.map((p) => w.words[p - 1]) });
  assert.equal(s.sitting!.stage, 'done');
  // "Send it again" sends the same bytes: the homes hold one rotation.
  await k.c.ask('forget');

  // Asked again for the same request: the same bytes, with or without the paper.
  await n.ask('forget');
  const again = await n.ask<{ preview: { already: string } }>('read', { path: stick('request-1.mor') });
  assert.equal(again.preview.already, 'same');
  await n.ask('same');
  await n.ask('write', { path: stick('answer-1-again.mor') });
  assert.deepEqual(readFileSync(stick('answer-1-again.mor')), readFileSync(stick('answer-1.mor')));
  await n.ask('forget');
  await n.ask('read', { path: stick('request-1.mor') });
  const rep = await n.ask<{ stage: string; repeat: boolean }>('paper', { words: first.join(' ') });
  assert.equal(rep.stage, 'sign');
  assert.equal(rep.repeat, true);
  await n.ask('sign', { word: 'SIGN' });
  await n.ask('write', { path: stick('answer-1-third.mor') });
  assert.deepEqual(readFileSync(stick('answer-1-third.mor')), readFileSync(stick('answer-1.mor')));
  // From the memory too.
  const mem = await n.ask<{ signed: { act: string; position: number }[] }>('memory');
  assert.deepEqual(mem.signed.map((x) => x.act), [signed.act]);
  await n.ask('again', { act: signed.act, path: stick('answer-1-memory.mor') });
  assert.deepEqual(readFileSync(stick('answer-1-memory.mor')), readFileSync(stick('answer-1.mor')));

  // The next change of keys, from the new paper; the old paper refused, said plainly.
  await request(k, d.id, stick('request-2.mor'));
  await n.ask('forget');
  const r2 = await n.ask<{ preview: { position: number } }>('read', { path: stick('request-2.mor') });
  assert.equal(r2.preview.position, 2);
  await refused(n.ask('paper', { words: first.join(' ') }), /earlier, spent one/);
  await n.ask('paper', { words: second.join(' ') });
  const third = await walkPaper(n, false);
  await n.ask('sign', { word: 'SIGN' });
  await n.ask('write', { path: stick('answer-2.mor') });
  s = await k.c.ask<State>('nakisib answer', { answer: b64(stick('answer-2.mor')) });
  if ((s.sitting!.stage as string) === 'sent') s = await k.c.ask<State>('refresh');
  assert.equal(s.sitting!.stage, 'counts');
  assert.equal((await lookUp(d.id, H)).resolution.links.length, 3);
  // Kišib's own way, the paper typed there: the old paper spent, said plainly; the newest one right.
  const old = await k.c.ask<{ title: string }>('check words', { id: d.id, address: H[0], words: second.join(' ') });
  assert.equal(old.title, 'These words are spent');
  const right = await k.c.ask<{ title: string }>('check words', { id: d.id, address: H[0], words: third.join(' ') });
  assert.equal(right.title, 'These are the right words');
  await k.c.ask('forget');
  holdsNothing(n, [first, second, third]);
});

test('asked for a different change of keys with a key it already used: refused, as the Module says; Kišib closed meanwhile: the answer sent from both files', async () => {
  const H = homes.map((h) => h.base);
  const d = await dub(H, [relay.base]);
  const n = await nakisib();
  // Two requests for the first change, from two sittings of Kišib: each with its own new signing key.
  const k1 = await kishib();
  await request(k1, d.id, stick('a.mor'));
  const k2 = await kishib();
  await request(k2, d.id, stick('b.mor'));
  await n.ask('read', { path: stick('a.mor') });
  await n.ask('paper', { words: d.chainWords.join(' ') });
  const paper = await walkPaper(n, false);
  const signed = await n.ask<{ act: string }>('sign', { word: 'SIGN' });
  await n.ask('write', { path: stick('a-answer.mor') });
  await n.ask('forget');
  const b = await n.ask<{ preview: { already: string; otherAct: string } }>('read', { path: stick('b.mor') });
  assert.equal(b.preview.already, 'other');
  assert.equal(b.preview.otherAct, signed.act);
  await refused(n.ask('paper', { words: d.chainWords.join(' ') }), /This chain key already signed a different rotation .*; it signs no other/);

  // Kišib's second sitting holds the request b: Nakišib's answer to a is not its answer, refused.
  await refused(k2.c.ask('nakisib answer', { answer: b64(stick('a-answer.mor')) }), /not Nakišib’s answer to the request Kišib wrote: not the rotation that was asked for/);
  // Kišib's first sitting closed meanwhile: the answer sent from both files; the lost signing key said.
  await k1.c.ask('forget');
  await refused(k1.c.ask('nakisib answer', { answer: b64(stick('a-answer.mor')) }), /Give the request’s file too/);
  let s = await k1.c.ask<State>('nakisib answer', { answer: b64(stick('a-answer.mor')), request: b64(stick('a.mor')), id: d.id, address: H[0] });
  assert.ok(s.sitting!.lines.some((l) => /the new signing key it made then is gone/.test(l.text)));
  if ((s.sitting!.stage as string) === 'sent') s = await k1.c.ask<State>('refresh');
  assert.equal(s.sitting!.stage, 'done', 'counts, with no signing words to show');
  assert.equal((await lookUp(d.id, H)).resolution.links[1].act, signed.act);
  await k1.c.ask('forget');
  await k2.c.ask('forget');
  holdsNothing(n, [d.chainWords, paper]);
});

test('a genesis: Nakišib’s commitment, Kišib’s identity made from it, read back at the homes; then its first change of keys through Nakišib', async () => {
  const H = homes.map((h) => h.base);
  const n = await nakisib();
  const k = await kishib();
  // Nakišib: the first paper, drawn, shown, a wrong part refused, three typed back; its commitment written.
  await n.ask('first', { module: 'words' });
  const paper = await walkPaper(n, true);
  const ready = await n.ask<{ stage: string; commit: string }>('state');
  assert.equal(ready.stage, 'ready');
  await n.ask('write', { path: stick('commitment.mor') });
  assert.ok(!folder(n.dir).size, 'a commitment signs nothing: nothing in its folder');

  // Kišib: a file that is not a commitment is refused.
  writeFileSync(stick('not-a-commitment.mor'), 'not a commitment');
  await refused(k.c.ask('make plan', { homes: H.join('\n'), relays: relay.base, commitment: b64(stick('not-a-commitment.mor')) }), /not Nakišib’s commitment/);
  const review = await k.c.ask<Review>('make plan', { homes: H.join('\n'), relays: relay.base, commitment: b64(stick('commitment.mor')) });
  assert.ok(review.sections[0].lines.some((l) => l.text.includes(ready.commit)), 'the same commitment as Nakišib’s screen');
  let s = await k.c.ask<State>('confirm', { plan: review.plan, digest: review.digest });
  assert.notEqual(s.sitting!.stage, 'paper', 'no paper shown by Kišib');
  if ((s.sitting!.stage as string) === 'sent') s = await k.c.ask<State>('refresh');
  assert.equal(s.sitting!.stage, 'counts');
  const id = s.sitting!.id;
  const look = await lookUp(id, H);
  assert.equal(look.resolution.links.length, 1, 'its genesis, at the homes');
  assert.equal(look.resolution.chainKeyCommit, ready.commit.replace(/ /g, ''), 'committing Nakišib’s paper’s key');
  const w = await k.c.ask<{ words: string[]; which: string }>('words show');
  assert.equal(w.which, 'signing');
  s = await k.c.ask<State>('words written');
  await k.c.ask('words typed', { typed: s.sitting!.positions!.map((p) => w.words[p - 1]) });
  await k.c.ask('forget');

  // Its first change of keys, from Nakišib's paper.
  await request(k, id, stick('g-request.mor'));
  await n.ask('read', { path: stick('g-request.mor') });
  await n.ask('paper', { words: paper.join(' ') });
  const next = await walkPaper(n, false);
  await n.ask('sign', { word: 'SIGN' });
  await n.ask('write', { path: stick('g-answer.mor') });
  s = await k.c.ask<State>('nakisib answer', { answer: b64(stick('g-answer.mor')) });
  if ((s.sitting!.stage as string) === 'sent') s = await k.c.ask<State>('refresh');
  assert.equal(s.sitting!.stage, 'counts');
  await k.c.ask('forget');
  holdsNothing(n, [paper, next]);
});
