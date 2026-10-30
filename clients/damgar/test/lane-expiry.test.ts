// H107 (hand test v3): a tip under Dub's lane whose grant has an expiry
// ("Until", judged on a timestamp clock, as the walkthrough prefilled it
// with the Dubsar clock). Under the grant limits cMIP (3.1) such an act
// counts for its payee only once that clock has placed it; before this
// fix Bob's Damgar set it aside at its first look and never looked again,
// so the tip never reached him. Now it waits in Waiting, To receive, said
// as waiting to count, is judged again at each look, and becomes an
// invoice to make once the clock (sweeping the homes, where the lane's
// act is left locked) has stamped it. Real homes, a relay and a real
// clock on local ports; test identities only.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { closeAll, person, start, type Relay } from './world.ts';
import type { ToSign } from '../src/shapes.ts';
import { SPEC } from '../src/specs.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { ClockService } from '../../../modules/timestamp/src/service.ts';

let homes: Relay[];
let relay: Relay;
before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
});
// Every app and server this file starts is stopped whatever the outcome, even where one before it fails (Part 4).
after(async () => {
  try {
    await closeAll();
  } finally {
    for (const h of [...homes, relay]) await h?.stop().catch(() => undefined);
  }
});
const R = SPEC.units.regtest;

test('H107: a tip under a lane with an expiry waits in the payee’s To receive until its clock places it, then counts', async () => {
  const H = homes.map((h) => h.base);
  const clockId = TestIdentity.create({ homes: homes.map((h) => h.home) });
  await clockId.publishGenesis();
  await clockId.publishRoutes([{ scope: null, hints: [relay.base], kind: 0 }]);
  const clock = new ClockService({ identity: clockId, outbox: [relay.base], watch: H });

  const alice = await person(H, [relay.base]);
  const bob = await person(H, [relay.base]);
  const node = '02' + 'ab'.repeat(32);
  const rv = await bob.damgar.c.ask<{ digest: string }>('rails review', { lightning: node, network: 3 });
  await bob.damgar.c.ask('rails publish', { lightning: node, network: 3, digest: rv.digest });
  await alice.dub.c.ask('lane ask', { label: 'Dub', cap: '2000', unit: R, until: Math.floor(Date.now() / 1000) + 86400, clock: clockId.id });
  await alice.damgar.c.ask('look');
  const lane = (await alice.damgar.c.ask<{ items: ToSign[] }>('to sign')).items.find((i) => i.kind === 'lane')!;
  await alice.damgar.c.ask('grant lane', { id: lane.id });
  const post = await bob.dub.c.ask<{ post: { id: string } }>('post', { text: 'A post worth a tip.' });
  await alice.dub.c.ask('tip now', { post: post.post.id, signer: bob.id, value: '280', unit: R });

  // Before the clock: it reached Bob, waiting to count, said why; nothing answered.
  const first = await bob.damgar.c.ask<{ lines: { text: string }[]; problems: string[] }>('look');
  assert.ok(first.lines.some((l) => /cannot count yet: in Waiting, To receive/.test(l.text)), JSON.stringify(first));
  let items = (await bob.damgar.c.ask<{ items: ToSign[] }>('to sign')).items;
  assert.deepEqual(items.map((i) => i.kind), ['uncounted']);
  assert.match(items[0].lines[0].text, /expiry judged by a timestamp clock, which has not placed this act yet/);
  assert.deepEqual(items[0].offers, ['decline']);
  // Looked at again, still waiting: kept, not set aside.
  await bob.damgar.c.ask('look');
  assert.deepEqual((await bob.damgar.c.ask<{ items: ToSign[] }>('to sign')).items.map((i) => i.kind), ['uncounted']);

  // The clock sweeps the homes, where the lane's act was left locked, and stamps it; Bob's next look files it: an invoice to make.
  await clock.sweep();
  await bob.damgar.c.ask('look');
  items = (await bob.damgar.c.ask<{ items: ToSign[] }>('to sign')).items;
  assert.deepEqual(items.map((i) => i.kind), ['invoice']);
});
