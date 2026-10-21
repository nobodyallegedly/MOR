// Kišib keeps Ummia's line through a change of keys (Identity rule 35):
// Ummia's acts are partly sealed (the accepted list, an anchor's draft), so
// its identity window shows its line's card for Kišib, as Damgar's does.
// After the rotation, everything Ummia signed before still counts, Ummia
// takes the new words, and what it signs next counts too.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { SPEC } from '../../damgar/src/specs.ts';
import { closeAll, developer, kishib, start, type Relay } from './world.ts';
import { newWords } from '../../kishib/test/world.ts';
import type { Done, Review, State } from '../src/shapes.ts';
import type { Tracked } from '../src/track.ts';

let homes: Relay[];
let relay: Relay;

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
});

after(async () => {
  await closeAll();
  for (const h of [...homes, relay]) await h.stop();
});

test('a change of keys in Kišib keeps Ummia’s line, given its card; Ummia takes the new words', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const d = await developer(H, R);
  const c = d.ummia.c;
  const rv = await c.ask<Review>('spec prepare', { kind: 0, text: '# cMIP: Before the rotation, draft 1\n\nSigned with the first key.' });
  await c.ask<Done>('confirm', { plan: rv.plan, digest: rv.digest });
  await c.ask('accepted change', { add: [{ hash: SPEC.payment }] });
  const line = (await c.ask<State>('state')).identity!.line;
  assert.ok(line.acts >= 2 && line.latest && line.summary, JSON.stringify(line));

  const k = await kishib();
  // Without the card: Kišib cannot read this line's sealed acts, and says so.
  const blind = await k.c.ask<{ plan: string; sections: unknown[] }>('rotate plan', { id: d.id, address: H[0], words: d.dub.chainWords.join(' ') });
  assert.match(JSON.stringify(blind.sections), new RegExp(`A line Kišib cannot read, ending at ${line.latest}[^"]*No card was given, so it is left out: its acts become void`));
  await k.c.ask('cancel', { plan: blind.plan }).catch(() => undefined);
  const cards = `${line.latest} ${line.acts} ${line.summary}`;
  const review = await k.c.ask<{ plan: string; digest: string; sections: { heading: string; lines: { text: string }[] }[] }>('rotate plan', { id: d.id, address: H[0], words: d.dub.chainWords.join(' '), cards });
  const said = JSON.stringify(review.sections);
  assert.ok(said.includes(line.latest!), 'the card’s line is among those kept');
  let s = await k.c.ask<any>('confirm', { plan: review.plan, digest: review.digest });
  if (s.sitting.stage === 'sent') s = await k.c.ask<any>('resend');
  assert.equal(s.sitting.stage, 'counts', JSON.stringify(s.sitting.lines));
  // H79: the new chain key's words first (a new paper), then the signing key's.
  const words = (await newWords(k.c)).signing;

  // Ummia: its key was changed elsewhere, said; nothing signed; then the new words taken.
  assert.equal((await c.ask<{ current: boolean }>('check')).current, false);
  const blocked = await c.ask<Review>('spec prepare', { kind: 0, text: '# cMIP: Refused, draft 1\n\nNot signed.' });
  await assert.rejects(c.ask('confirm', { plan: blocked.plan, digest: blocked.digest }), /changed elsewhere/);
  await c.ask('renew', { words: words.join(' ') });
  assert.equal((await c.ask<{ current: boolean }>('check')).current, true);
  const after2 = await c.ask<Review>('spec prepare', { kind: 0, text: '# cMIP: After the rotation, draft 1\n\nSigned with the new key.' });
  await c.ask<Done>('confirm', { plan: after2.plan, digest: after2.digest });

  // Both specifications verify, claimed by their creator: the line before the rotation was kept.
  const t = await c.ask<Tracked>('track', {});
  const found = t.lines.flat();
  for (const h of [rv.hash, after2.hash]) assert.ok(found.find((x) => x.hash === h)?.claimed, `${h}: ${JSON.stringify(t.unverified)}`);
  assert.equal(t.unverified.length, 0, JSON.stringify(t.unverified));
  // The accepted list, sealed before the rotation, still reads.
  const l = await c.ask<{ entries: { hash: string }[] }>('accepted');
  assert.deepEqual(l.entries.map((e) => e.hash), [SPEC.payment]);
});
