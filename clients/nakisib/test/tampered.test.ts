// A tampered request (the named test): what the online side says about a
// change of keys is never what Nakišib shows. A request whose bytes were
// changed on the way (new homes slipped in, Kišib's words left as they were)
// is summarised from its bytes: the homes first, in capitals as the Module
// writes them; a request slipping in a next chain-key commitment has it
// ignored and said. And Kišib, given Nakišib's answer to a request it did not
// write, refuses it (the Module's rule 3.9): nothing is sent.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { cborDecode, cborEncode } from '../../genesis/src/core.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import type { Review, State } from '../../kishib/src/shapes.ts';
import { closeAll, dub, kishib, nakisib, refused, start, stopAll, walkPaper, type Relay } from './world.ts';

let homes: Relay[];
let relay: Relay;
const files = mkdtempSync(join(tmpdir(), 'nakisib-stick-'));
const stick = (name: string) => join(files, name);

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
});

after(async () => {
  await stopAll();
  await closeAll();
  for (const h of [...homes, relay]) await h.stop();
});

/** The request with its rotation's payload changed by `f`, every other byte as Kišib wrote it. */
function tamper(bytes: Buffer, f: (payload: Map<number, unknown>) => void): Buffer {
  const m = cborDecode(new Uint8Array(bytes)) as Map<number, unknown>;
  const inside = cborDecode(m.get(1) as Uint8Array) as Map<number, unknown>;
  const payload = inside.get(4) as Map<number, unknown>;
  f(payload);
  inside.set(4, new Map([...payload.entries()].sort((a, b) => a[0] - b[0])));
  m.set(1, cborEncode(inside));
  return Buffer.from(cborEncode(m));
}

test('a tampered request: Nakišib shows what its bytes say, the homes slipped in first; a next commitment slipped in is ignored and said; Kišib refuses the answer to a request it did not write', async () => {
  const H = homes.map((h) => h.base);
  const d = await dub(H, [relay.base]);
  const k = await kishib();
  const n = await nakisib();
  const review = await k.c.ask<Review>('nakisib plan', { id: d.id, address: H[0] });
  await k.c.ask<State>('confirm', { plan: review.plan, digest: review.digest });
  const asked = Buffer.from((await k.c.ask<{ bytes: string }>('nakisib request')).bytes, 'base64');
  writeFileSync(stick('kishib.mor'), asked);

  // As Kišib wrote it: no homes change.
  const plain = await n.ask<{ preview: { summary: { prominent: string[] } } }>('read', { path: stick('kishib.mor') });
  assert.ok(!plain.preview.summary.prominent.some((l) => /Homes change/.test(l)));
  await n.ask('forget');

  // A next commitment slipped in: ignored and said, by Nakišib's reading and again by the Module's own review.
  writeFileSync(stick('slipped.mor'), tamper(asked, (p) => p.set(3, [2, new Uint8Array(32).fill(9)])));
  const slipped = await n.ask<{ preview: { supplied: boolean; summary: { prominent: string[] } } }>('read', { path: stick('slipped.mor') });
  assert.equal(slipped.preview.supplied, true);
  assert.match(slipped.preview.summary.prominent[0], /supplied a next chain-key commitment\. It is IGNORED and replaced by this device’s own/);
  const reviewed = await n.ask<{ summary: { prominent: string[] } }>('paper', { words: d.chainWords.join(' ') });
  assert.ok(reviewed.summary.prominent.some((l) => /It was IGNORED and replaced by this device's own/.test(l)), JSON.stringify(reviewed.summary));
  await n.ask('forget');

  // New homes slipped in on the way, Kišib's words left as they were: the bytes speak, the homes first among the changes.
  writeFileSync(stick('homes.mor'), tamper(asked, (p) => p.set(6, [[new Uint8Array(32).fill(7), 'https://attacker.example']])));
  const t = await n.ask<{ preview: { summary: { prominent: string[]; context: string[] } } }>('read', { path: stick('homes.mor') });
  const loud = t.preview.summary.prominent;
  assert.ok(loud.some((l) => /^Homes change to 1 home\(s\):$/.test(l)), JSON.stringify(loud));
  assert.ok(loud.some((l) => /home 0: operator 0707.* at https:\/\/attacker\.example/.test(l)));
  assert.ok(t.preview.summary.context.every((c) => !/attacker/.test(c)), 'Kišib’s own words, unchecked, say nothing of it');
  // Signed anyway (the person did not read): Kišib refuses Nakišib's answer, since it is not the change Kišib asked.
  await n.ask('paper', { words: d.chainWords.join(' ') });
  await walkPaper(n, false);
  await n.ask('sign', { word: 'SIGN' });
  await n.ask('write', { path: stick('homes-answer.mor') });
  await refused(k.c.ask('nakisib answer', { answer: readFileSync(stick('homes-answer.mor')).toString('base64') }), /not Nakišib’s answer to the request Kišib wrote: not the rotation that was asked for: a field differs from the pending rotation\. Nothing was sent/);
  assert.equal((await lookUp(d.id, H)).resolution.links.length, 1, 'nothing sent');
  await k.c.ask('forget');
});

test('a file that is not a request is refused unread; nothing in it is run', async () => {
  const n = await nakisib();
  writeFileSync(stick('script.mor'), '#!/bin/sh\necho owned > /tmp/owned\n');
  await refused(n.ask('read', { path: stick('script.mor') }), /not a request from Kišib .*runs nothing it reads/);
  writeFileSync(stick('big.mor'), Buffer.alloc(300 * 1024));
  await refused(n.ask('read', { path: stick('big.mor') }), /not a request from Kišib/);
});
