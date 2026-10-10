// F207 (Agreements draft 10, step 12b): a resignation names the drafts its signer
// leaves behind, and her client names them when she resigns (client
// conformance). A draft here is a change of the release words that Ada and
// Sim One signed and that was stopped before its record: never in force.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { cborDecode, describeAct, hex } from '../../genesis/src/core.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import type { State } from '../src/page/api.ts';
import { sign, state, words, world, type World } from './setup.ts';

let w: World;
before(async () => {
  w = await world();
  for (const n of ['Sim One', 'Sim Two']) await sign(w.client, { kind: 'identity', name: n, mine: false });
  await sign(w.client, { kind: 'identity', name: 'Ada', mine: true });
});
after(async () => {
  await w?.stop();
});

const idOf = (s: State, name: string) => s.identities.find((i) => i.name === name)!.id;

test('F207: leaving names the drafts the member signed and leaves behind, in the review and in the resignation', async () => {
  const c = w.client;
  let s = await state(c);
  const [ada, one, two] = ['Ada', 'Sim One', 'Sim Two'].map((n) => idOf(s, n));
  await sign(c, { kind: 'found', name: 'Drafts', members: [ada, one, two], rules: { safety: 2, release: 2, clone: 2, others: 1 } });
  s = await state(c);
  const id = s.collectives.find((x) => x.name === 'Drafts')!.id;

  // Before any draft: the review says none was found, and the resignation would name none.
  const store = w.app.store;
  const col = store.collective(id);
  const got = await col.changeReleaseWords({
    words: 'A draft Ada signed.',
    proposer: store.identity(ada),
    signers: [store.identity(ada), store.identity(one)],
    beforeSend: async () => 'stopped by the test: a draft, never recorded',
  });
  assert.ok(got.clone && got.stopped, JSON.stringify(got));
  store.saveCollective(col);
  for (const m of [ada, one]) store.saveIdentity(store.identity(m));
  const draft = got.clone;

  // Ada leaves: the review names the draft as left behind.
  const leave = await sign(c, { kind: 'leave', collective: id, member: ada });
  const lw = words(leave.review.reading);
  assert.match(lw, /Drafts left behind/);
  assert.match(lw, new RegExp(`signed a version of the agreement that is not in force: ${draft.slice(0, 8)}…${draft.slice(-4)}\\. The resignation names it as left behind, so that none ever brings Ada .* back.*\\(F207\\)`), lw);

  // The resignation itself names it (Agreements type 16, field 2).
  const resignation = leave.done.acts[0];
  const a = await relayAt(w.relay.base, {}).getAct(resignation);
  assert.ok(a, 'the resignation is at the relay');
  const d = describeAct(a!) as { payload?: Uint8Array };
  const field2 = (cborDecode(d.payload!) as Map<number, unknown>).get(2) as Uint8Array[];
  assert.deepEqual(field2.map(hex), [draft]);

  // Sim Two signed no draft: the review says none was found.
  const r2 = await c.ask<{ reading: { title: string; summary: string[]; blocking: string[]; sections: { heading: string; lines: { text: string }[] }[]; plain: { text: string }[] } }>('prepare', { kind: 'leave', collective: id, member: two });
  assert.match(words(r2.reading as never), /No version of the agreement that Sim Two .* signed and that is not in force was found at the collective's relays: the resignation names no draft/);
});

test('F207, its stepping-down half: stepping down from the Releases area names the drafts the member signed and leaves behind', async () => {
  const c = w.client;
  let s = await state(c);
  const [ada, one, two] = ['Ada', 'Sim One', 'Sim Two'].map((n) => idOf(s, n));
  await sign(c, { kind: 'found', name: 'Drafts, stepping down', members: [ada, one, two], rules: { safety: 2, release: 2, clone: 2, others: 1 } });
  s = await state(c);
  const id = s.collectives.find((x) => x.name === 'Drafts, stepping down')!.id;

  // A change of the release words Sim One and Ada sign, stopped before its record: a draft.
  const store = w.app.store;
  const col = store.collective(id);
  const got = await col.changeReleaseWords({
    words: 'A draft Sim One signed.',
    proposer: store.identity(one),
    signers: [store.identity(one), store.identity(ada)],
    beforeSend: async () => 'stopped by the test: a draft, never recorded',
  });
  assert.ok(got.clone && got.stopped, JSON.stringify(got));
  store.saveCollective(col);
  for (const m of [ada, one]) store.saveIdentity(store.identity(m));
  const draft = got.clone;

  // Sim One steps down from Releases: the review names the draft as left behind.
  const down = await sign(c, { kind: 'stepdown', collective: id, member: one });
  const dw = words(down.review.reading);
  assert.match(dw, /Drafts left behind/);
  assert.match(dw, new RegExp(`signed a version of the agreement that is not in force: ${draft.slice(0, 8)}…${draft.slice(-4)}\\. The stepping down names it as left behind, so that none ever gives Sim One .* the Releases area back.*\\(F207\\)`), dw);

  // The stepping down itself names the area (field 1) and the draft (field 2).
  const act = await relayAt(w.relay.base, {}).getAct(down.done.acts[0]);
  assert.ok(act, 'the stepping down is at the relay');
  const d = describeAct(act!) as { payload?: Uint8Array };
  const payload = cborDecode(d.payload!) as Map<number, unknown>;
  assert.ok(payload.has(1), 'it names the area');
  assert.deepEqual((payload.get(2) as Uint8Array[]).map(hex), [draft]);

  // Sim Two signed no draft: the review says none was found.
  const r2 = await c.ask<{ reading: { title: string; summary: string[]; blocking: string[]; sections: { heading: string; lines: { text: string }[] }[]; plain: { text: string }[] } }>('prepare', { kind: 'stepdown', collective: id, member: two });
  assert.match(words(r2.reading as never), /No version of the agreement that Sim Two .* signed and that is not in force was found at the collective's relays: the stepping down names no draft/);
});
