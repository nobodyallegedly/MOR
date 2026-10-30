// The author's cast for round 3's tests: A in Edubba (the founder), iPa and
// iPh each in their own Dub, a real collective founded from the grid, each
// member signing in their own app with their own key (a collective has no
// signing key and no member keys: Agreements rules 56 to 60). Shared by the
// Publishing tests and the round 3 end-to-end test.
//
// TEST IDENTITIES ONLY.

import assert from 'node:assert/strict';
import { evenPercent, kindsFor, type Grid, type LayerRow } from '../src/grid.ts';
import type { Client, Done } from '../src/page/api.ts';

/**
 * A row of the cast's grid: a layer's rule (or several layers given the same
 * rule, `[1, 2]` for Text and Envelopes), or, with `kinds` or a Money `cap`,
 * a finer area within one layer (all its kinds unless `kinds` names some).
 * Layers numbered as the core numbers them: 1 Text, 2 Envelopes, 3 Money,
 * 4 Agreements, 5 Development. A layer no row names takes the clone rule.
 */
export interface CastRow {
  name: string;
  layer: number | number[];
  holders: string[];
  number: number;
  cap?: number;
  kinds?: string[];
}

/** Found a real collective from Edubba `e` (its founder `founder`), the other members signing in their Dubs. Returns the collective and its founding terms. */
export async function foundCollective(e: { c: Client }, founder: string, others: { c: Client; id: string }[], rows: CastRow[], o: { name?: string; clone?: number } = {}): Promise<{ collective: string; terms: string }> {
  const members = [founder, ...others.map((x) => x.id)];
  const clone = o.clone ?? Math.min(2, members.length);
  const layers = Object.fromEntries([1, 2, 3, 4, 5].map((l) => [l, { holders: [...members], number: clone }])) as Grid['layers'];
  const areas: Grid['areas'] = [];
  for (const r of rows) {
    for (const l of [r.layer].flat()) {
      const row: LayerRow = { holders: r.holders, number: r.holders.length === members.length ? r.number : r.holders.length };
      if (r.kinds || r.cap !== undefined) {
        areas.push({ name: r.name, layer: l, kinds: r.kinds ?? kindsFor(l).map((k) => `${k.spec}:${k.type}`), holders: r.holders, number: r.number, ...(r.cap !== undefined ? { cap: r.cap } : {}) });
        layers[l as keyof Grid['layers']] = row;
      } else layers[l as keyof Grid['layers']] = row;
    }
  }
  const grid: Grid = {
    members,
    constitution: { holders: [...members], number: members.length },
    chainKey: Math.max(1, Math.min(2, members.length - 1)),
    absence: Math.max(1, Math.min(2, members.length - 1)),
    layers,
    areas,
    clone,
    shares: evenPercent(members),
  };
  const review = await e.c.ask<any>('real found prepare', { name: o.name ?? 'Three tablets', founder, members: others.map((x) => x.id), grid });
  assert.deepEqual(review.reading.blocking, []);
  const proposed = await e.c.ask<Done>('real confirm', { plan: review.plan, digest: review.digest });
  const terms = proposed.acts[0];
  for (const m of others) {
    await m.c.ask('signing', { on: true });
    const p = (await m.c.ask<any>('proposals')).proposals.find((x: any) => x.act === terms);
    assert.ok(p, 'the founding reached the member’s Signing tab');
    await m.c.ask('accept', { thread: p.thread });
  }
  const g = await e.c.ask<any>('real gather', { act: terms });
  assert.equal(g.standing.enough, true, JSON.stringify(g.standing));
  const collective = (await e.c.ask<Done & { show: string[] }>('real found', { act: terms, read: true })).acts[0];
  return { collective, terms };
}
