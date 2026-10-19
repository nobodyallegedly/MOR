// The author's cast for round 3's tests: A in Edubba (the founder), iPa and
// iPh each in their own Dub, a real collective founded from the grid, each
// member signing in their own app with a key of their own (F353). Shared by
// the Publishing tests and the round 3 end-to-end test.
//
// TEST IDENTITIES ONLY.

import assert from 'node:assert/strict';
import type { Grid } from '../src/grid.ts';
import type { Client, Done } from '../src/page/api.ts';

/** Found a real collective from Edubba `e` (its founder `founder`), the other members signing in their Dubs. Returns the collective and its founding terms. */
export async function foundCollective(e: { c: Client }, founder: string, others: { c: Client; id: string }[], areas: Grid['areas'], o: { name?: string; clone?: number } = {}): Promise<{ collective: string; terms: string }> {
  const members = [founder, ...others.map((x) => x.id)];
  const grid: Grid = {
    members,
    constitution: { holders: [...members], number: members.length },
    chainKey: Math.max(1, Math.min(2, members.length - 1)),
    absence: Math.max(1, Math.min(2, members.length - 1)),
    areas,
    clone: o.clone ?? Math.min(2, members.length),
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
