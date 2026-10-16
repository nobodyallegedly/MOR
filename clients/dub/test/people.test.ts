// The people cMIP (cmips/cmip-people-draft-1.md): a published follow list
// read from its chain, a fork read as forked. Real homes and a relay on
// local ports. Test identities only, generated here.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { FOLLOW_LIST, PEOPLE_SPEC, followListPayload, readFollowList } from '../src/people.ts';

let home: Relay;
let relay: Relay;
before(async () => {
  home = await start('home');
  relay = await start('relay');
});
after(async () => {
  await home?.stop();
  await relay?.stop();
});

test('a follow list’s chain: versions in order; a fork read as forked, the last version before it counting', async () => {
  const me = TestIdentity.create({ homes: [home.home] });
  await me.publishGenesis();
  await me.publishRoutes([{ scope: null, hints: [relay.base], kind: 0 }]);
  for (const a of me.chainActs()) await relayAt(relay.base).putAct(a);
  const x = 'aa'.repeat(32);
  const y = 'bb'.repeat(32);
  const put = (p: Uint8Array) => me.publish(PEOPLE_SPEC, FOLLOW_LIST, p, { public: true, relays: [relay.base] });
  const v1 = await put(followListPayload({ version: 1, previous: null, ids: [x] }));
  let l = await readFollowList(me.id, [relay.base]);
  assert.deepEqual([l.act, l.version, l.ids, l.forked], [v1.id, 1, [x], null]);
  // A version that skips a number does not count.
  await put(followListPayload({ version: 3, previous: v1.id, ids: [y] }));
  assert.equal((await readFollowList(me.id, [relay.base])).version, 1);
  // Two acts naming the same predecessor: forked after version 1.
  await put(followListPayload({ version: 2, previous: v1.id, ids: [x, y] }));
  await put(followListPayload({ version: 2, previous: v1.id, ids: [] }));
  l = await readFollowList(me.id, [relay.base]);
  assert.deepEqual([l.act, l.version, l.ids, l.forked], [v1.id, 1, [x], 1]);
});
