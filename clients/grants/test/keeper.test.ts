// Keepers serve any agreement (Agreements rule 36), a deal between solo
// identities included (decided by Nobody, allegedly, 19 October 2026, the
// round 3 report's question 5). Ana and Ben, two solo identities, make a
// deal naming Kim's keeper; Kim records the deal's own version, each
// party's act naming it, and each party's rotation before that party's
// other acts; a post naming no version is not recorded. A collective's
// keeper, by an Edubba agent, is tested in `clients/desk/test/keepers.test.ts`.
//
// TEST IDENTITIES ONLY.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { SPECS, cborEncode, signaturePayload } from '../../genesis/src/core.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { start, type Running } from '../../genesis/test/world.ts';
import { REPO_SPECS, AGREEMENTS_TYPES } from '../../repo/src/specs.ts';
import { keep, keeperLog, recordedBefore } from '../src/keeper.ts';

let homes: Running[];
let relay: Running;

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
});

after(async () => {
  for (const r of [...homes, relay]) await r.stop();
});

const born = async () => {
  const t = TestIdentity.create({ homes: homes.map((h) => h.home), scheme: 3 });
  await t.publishGenesis();
  return t;
};

test('a deal between two solo identities: its own version, each party’s act naming it, each party’s rotation first; nothing naming no version', async () => {
  const places = [relay.base, ...homes.map((h) => h.base)];
  const relays = [relay.base];
  const [ana, ben, kim] = [await born(), await born(), await born()];
  // The deal, proposed by Ana (its terms are its own version), signed by Ben; Ana posts something naming nothing.
  const deal = await ana.publish(REPO_SPECS.agreements, AGREEMENTS_TYPES.terms, cborEncode(new Map<number, unknown>([[0, 'a deal of two, naming a keeper']])), { public: true, relays });
  const signed = await ben.publish(REPO_SPECS.agreements, AGREEMENTS_TYPES.signature, signaturePayload(deal.id), { public: true, relays, objects: [[deal.id, deal.id]] });
  const post = await ana.publish(SPECS.text, 0, cborEncode(new Map<number, unknown>([[0, 'Nothing to do with the deal.']])), { public: true, relays });

  const first = await keep(kim, { agreements: [deal.id], parties: [ana.id, ben.id], places });
  const recorded = first.map((x) => x.act);
  assert.ok(recorded.includes(deal.id), 'the deal’s own version');
  assert.ok(recorded.includes(signed.id), 'Ben’s signature naming it');
  assert.ok(!recorded.includes(post.id), 'Ana’s post names no version: not recorded');
  assert.deepEqual(first.filter((x) => x.rotation), [], 'no rotation yet');
  assert.deepEqual(await keep(kim, { agreements: [deal.id], parties: [ana.id, ben.id], places }), [], 'nothing recorded twice');

  // Ben changes his keys, then signs a clone of the deal: in the next round his rotation is recorded before it.
  await ben.prepareRotation();
  await ben.submitRotation();
  const clone = await ana.publish(REPO_SPECS.agreements, AGREEMENTS_TYPES.terms, cborEncode(new Map<number, unknown>([[0, 'the deal, cloned'], [11, deal.id]])), { public: true, relays, objects: [[deal.id, deal.id]] });
  const again = await ben.publish(REPO_SPECS.agreements, AGREEMENTS_TYPES.signature, signaturePayload(clone.id), { public: true, relays, objects: [[clone.id, clone.id]] });
  const second = await keep(kim, { agreements: [deal.id, clone.id], parties: [ana.id, ben.id], places });
  const rotation = second.find((x) => x.rotation && x.signer === ben.id);
  assert.ok(rotation, 'Ben’s rotation recorded');
  const log = (await keeperLog(kim.id, places)).map((x) => x.act);
  assert.ok(log.includes(clone.id) && log.includes(again.id), 'the clone and Ben’s signature on it');
  assert.ok(log.indexOf(rotation!.act) < log.indexOf(again.id), 'his rotation before his act after it (rule 40)');
  assert.ok(recordedBefore(log, signed.id, rotation!.act), 'his first signature sits before the rotation: a dispute, not a void, should it disown it (rule 41)');
  assert.deepEqual(log.slice(0, recorded.length), recorded, 'the keeper’s sequence only grows');
});
