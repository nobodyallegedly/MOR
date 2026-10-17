// Releasing cMIPs and Modules (F339): a specification published as its act,
// its hash shown before anything is signed, and found again by tracking.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { MIRS } from '../../genesis/src/core.ts';
import { closeAll, developer, refused, start, type Relay } from './world.ts';
import type { Done, Review } from '../src/shapes.ts';
import type { Tracked } from '../src/track.ts';

let homes: Relay[];
let relays: Relay[];

before(async () => {
  homes = [await start('home'), await start('home')];
  relays = [await start('relay'), await start('relay')];
});

after(async () => {
  await closeAll();
  for (const h of [...homes, ...relays]) await h.stop();
});

test('a cMIP published with its hash shown first, a Module under it, and both found again by tracking', async () => {
  const H = homes.map((h) => h.base);
  const R = [relays[0].base];
  const d = await developer(H, R, { track: relays.map((r) => r.base) });
  const c = d.ummia.c;
  const text = '# cMIP: Test notes, draft 1\n\nNotes and answers, for tests.';
  const rv = await c.ask<Review>('spec prepare', { kind: 0, text, types: '0 note note = tstr\n1 answer answer = tstr' });
  assert.deepEqual(rv.blocking, []);
  assert.match(rv.hash!, /^[0-9a-f]{64}$/);
  assert.match(rv.summary[0], new RegExp(rv.hash!));
  await refused(c.ask('confirm', { plan: rv.plan, digest: 'f'.repeat(64) }), /does not match/);
  const done = await c.ask<Done>('confirm', { plan: rv.plan, digest: rv.digest });
  assert.equal(done.hash, rv.hash);
  await refused(c.ask('confirm', { plan: rv.plan, digest: rv.digest }), /expired or was already used/);

  // A Module working under it, filling nothing else.
  const mod = await c.ask<Review>('spec prepare', { kind: 1, text: '# Module: Test notes in a file\n\nKeeps notes.', implements: rv.hash });
  assert.deepEqual(mod.blocking, []);
  await c.ask('confirm', { plan: mod.plan, digest: mod.digest });

  // What is not in the format is refused before anything is signed.
  const bad = await c.ask<Review>('spec prepare', { kind: 1, text: '# Module: no cMIP\n\nNothing.' });
  assert.ok(bad.blocking.some((b) => /field 5/.test(b)), JSON.stringify(bad.blocking));
  const trailing = await c.ask<Review>('spec prepare', { kind: 0, text: 'A line with a space at its end \nand more' });
  assert.ok(trailing.blocking.some((b) => /canonical text/.test(b)), JSON.stringify(trailing.blocking));

  const t = await c.ask<Tracked>('track', {});
  const all = t.lines.flat();
  const notes = all.find((x) => x.hash === rv.hash)!;
  assert.ok(notes, JSON.stringify(t));
  assert.equal(notes.kind, 'cMIP');
  assert.equal(notes.creator, d.id);
  assert.ok(notes.claimed);
  assert.ok(t.xtypes.some((x) => x.hash === rv.hash), 'an xtype: act types, no task');
  assert.ok(all.some((x) => x.hash === mod.hash && x.kind === 'Module'));
  assert.match(t.limit[0], /public agreements only/);
  // Filtered by signer: another's specifications are not asked for.
  const other = await developer(H, R, { track: relays.map((r) => r.base) });
  const t2 = await other.ummia.c.ask<Tracked>('track', { signer: other.id });
  assert.equal(t2.lines.flat().length, 0);
  void MIRS;
});
