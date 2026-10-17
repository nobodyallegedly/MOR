// The people cMIP (cmips/cmip-people-draft-2.md): a published follow list
// read from its chain, a fork read as forked, draft 1's versions continued;
// the follow list sealed to oneself, opened only with the identity's own
// encryption key, its names inside, a fork taking the longer branch. Real homes and a relay on
// local ports. Test identities only, generated here.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { TestIdentity, sealFor } from '../../genesis/src/identity.ts';
import { hex, xwingPublic } from '../../genesis/src/core.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { FOLLOW_LIST, PEOPLE_SPEC, PEOPLE_SPEC_1, SEALED_LIST, followListPayload, readFollowList, readSealedList, sealedListPayload, type Followed } from '../src/people.ts';

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

test('draft 1’s published versions and draft 2’s are one chain (section 4.2)', async () => {
  const me = TestIdentity.create({ homes: [home.home] });
  await me.publishGenesis();
  await me.publishRoutes([{ scope: null, hints: [relay.base], kind: 0 }]);
  for (const a of me.chainActs()) await relayAt(relay.base).putAct(a);
  const x = 'cc'.repeat(32);
  const v1 = await me.publish(PEOPLE_SPEC_1, FOLLOW_LIST, followListPayload({ version: 1, previous: null, ids: [x] }), { public: true, relays: [relay.base] });
  const v2 = await me.publish(PEOPLE_SPEC, FOLLOW_LIST, followListPayload({ version: 2, previous: v1.id, ids: [] }), { public: true, relays: [relay.base] });
  const l = await readFollowList(me.id, [relay.base]);
  assert.deepEqual([l.act, l.version, l.ids], [v2.id, 2, []]);
});

test('the follow list sealed to oneself (section 3): opened only with its own key, names inside, never in the clear; a fork takes the longer branch', async () => {
  const me = TestIdentity.create({ homes: [home.home] });
  await me.publishGenesis();
  const secret = TestIdentity.newBareKey().secret;
  await me.publishEncryptionKey(secret);
  const pub = xwingPublic(secret);
  const seal = async (version: number, previous: string | null, follows: Followed[], signer = me, to = me.id, key = pub) => {
    const made = signer.sign(PEOPLE_SPEC, SEALED_LIST, sealedListPayload({ version, previous, follows }), { public: false, to: [to] });
    const sealed = sealFor(made.act, made.key, [{ id: to, key }]);
    await relayAt(home.base).putSealed(sealed);
    return { id: made.id, sealed };
  };
  const x = 'dd'.repeat(32);
  const y = 'ee'.repeat(32);
  assert.deepEqual(await readSealedList(me.id, [secret], [home.base]), { act: null, version: 0, follows: [], forked: false, problems: [] });
  const v1 = await seal(1, null, [{ id: x, name: 'Mum, the bike shop' }]);
  // Never in the clear at the home: neither the name nor the ID followed.
  assert.ok(!Buffer.from(v1.sealed).includes(Buffer.from('Mum, the bike shop')));
  assert.ok(!Buffer.from(v1.sealed).includes(Buffer.from(x, 'hex')));
  let l = await readSealedList(me.id, [secret], [home.base]);
  assert.deepEqual([l.act, l.version, l.follows, l.forked], [v1.id, 1, [{ id: x, name: 'Mum, the bike shop' }], false]);
  // Another key opens nothing; no key, nothing read.
  assert.equal((await readSealedList(me.id, [TestIdentity.newBareKey().secret], [home.base])).act, null);
  assert.equal((await readSealedList(me.id, [], [home.base])).act, null);
  // A list signed by someone else, sealed to this identity, is not its list.
  const other = TestIdentity.create({ homes: [home.home] });
  await other.publishGenesis();
  await seal(2, v1.id, [], other);
  assert.equal((await readSealedList(me.id, [secret], [home.base])).act, v1.id);
  // A fork after version 1: the branch reaching version 3 counts, and the fork is said.
  const a2 = await seal(2, v1.id, [{ id: x, name: null }, { id: y, name: null }]);
  await seal(2, v1.id, []);
  const a3 = await seal(3, a2.id, [{ id: y, name: 'Y' }]);
  l = await readSealedList(me.id, [secret], [home.base]);
  assert.deepEqual([l.act, l.version, l.follows, l.forked], [a3.id, 3, [{ id: y, name: 'Y' }], true]);
  assert.equal(hex(pub).length, 2 * pub.length);
});
