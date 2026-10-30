// H120: the kinds of act under "Only some kinds of act" are the core's own
// types, read from its type tables (core/src), not a hand list: the file
// generated from them is up to date, every type is there and named in
// words, and no retired number is offered.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { coreTypes, generated } from '../scripts/core-types.ts';
import { GRID_LAYERS, KIND_WORDS } from '../src/kinds.ts';

test('H120: the kinds offered are the core’s own types, every one named in words', () => {
  const file = readFileSync(fileURLToPath(new URL('../src/core-types.ts', import.meta.url)), 'utf8');
  assert.equal(file, generated(), 'src/core-types.ts is stale: run node --import tsx scripts/core-types.ts');
  const t = coreTypes();
  for (const [layer, types] of Object.entries(t) as [keyof typeof t, { constant: string; type: number }[]][]) {
    for (const x of types) assert.ok(KIND_WORDS[layer][x.constant], `${layer} type ${x.type} (${x.constant}) has words`);
  }
  // Agreements: work claims and keepers' records among them (his words: "all actions a collective could take"), no retired number.
  const agreements = GRID_LAYERS.find((l) => l.key === 'agreements')!.kinds.map((k) => k.type);
  for (const n of [2, 3, 17, 18, 26]) assert.ok(agreements.includes(n), `Agreements type ${n}`);
  for (const n of [7, 11, 15, 21]) assert.ok(!agreements.includes(n), `retired Agreements type ${n}`);
  assert.ok(!GRID_LAYERS.find((l) => l.key === 'envelopes')!.kinds.some((k) => k.type === 2), 'Envelopes type 2 is retired');
  assert.ok(!GRID_LAYERS.find((l) => l.key === 'envelopes')!.kinds.some((k) => k.type === 3), 'Envelopes type 3, the withdrawal, is retired: a bake is never withdrawn');
  assert.deepEqual(GRID_LAYERS.map((l) => [l.name, l.layer]), [['Text', 1], ['Envelopes', 2], ['Money', 3], ['Agreements', 4], ['Development', 5]]);
});

test('H120, F402: the grid names five layers, each its own row; a finer area reaches kinds of one layer only', async () => {
  const { LAYERS, governanceOf, defaultGrid, kindsFor } = await import('../src/grid.ts');
  assert.deepEqual([...LAYERS].sort((a, b) => a.layer - b.layer).map((l) => [l.layer, l.name]), [[1, 'Text'], [2, 'Envelopes'], [3, 'Money'], [4, 'Agreements'], [5, 'Development']]);
  assert.ok(!LAYERS.some((l) => /together/.test(l.name)), 'no "Text and Envelopes, together": one layer per MIR');
  const members = ['aa'.repeat(32), 'bb'.repeat(32)];
  const g = defaultGrid(members);
  g.areas = [
    { name: 'Posts', layer: 1, kinds: kindsFor(1).map((k) => `${k.spec}:${k.type}`), holders: members, number: 1 },
    { name: 'Media', layer: 2, kinds: kindsFor(2).filter((k) => k.type === 0).map((k) => `${k.spec}:${k.type}`), holders: members, number: 2 },
    { name: 'Claims', layer: 4, kinds: kindsFor(4).filter((k) => k.type === 3).map((k) => `${k.spec}:${k.type}`), holders: members, number: 2 },
  ];
  const { governance, blocking } = governanceOf(g, '');
  assert.deepEqual(blocking, [], 'areas in different layers, or different kinds of one, never overlap');
  assert.deepEqual(governance.areas![1].kinds, [{ spec: kindsFor(2)[0].spec, type: 0 }]);
  // Claims under Agreements, where the core puts them; the bake under Envelopes.
  assert.ok(kindsFor(4).some((k) => k.type === 3 && /claims/.test(k.name)));
  assert.ok(kindsFor(2).some((k) => k.type === 0 && /bakes/.test(k.name)));
  assert.ok(kindsFor(3).some((k) => /price tags/.test(k.name)));
  // Two areas over one kind: refused, said.
  g.areas.push({ name: 'Uploads', layer: 2, kinds: [`${kindsFor(2)[0].spec}:0`], holders: members, number: 1 });
  assert.ok(governanceOf(g, '').blocking.some((b) => /reach the same acts/.test(b)));
});
