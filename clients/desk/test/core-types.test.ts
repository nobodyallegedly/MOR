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
  assert.deepEqual(GRID_LAYERS.map((l) => l.name), ['Text', 'Envelopes', 'Money', 'Agreements', 'Development']);
});
