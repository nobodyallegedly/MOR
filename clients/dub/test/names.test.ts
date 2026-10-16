// The naming cMIP (cmips/cmip-naming-draft-1.md): the form of a name, and
// which names are shown, read from real homes and a relay on local ports.
// Test identities only, generated here.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { SPECS, cborEncode } from '../../genesis/src/core.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { MAX_NAME, NAME, NAME_WITHDRAWAL, NAMING_SPEC, nameProblem, namePayload, namesOf, readName } from '../src/names.ts';

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

test('the form of a name (section 2): one line, canonical, at most 48 characters, no control or direction character', () => {
  assert.equal(MAX_NAME, 48);
  assert.equal(nameProblem('Ada'), null);
  assert.equal(nameProblem('Мария · 李'), null);
  assert.equal(nameProblem('😀'.repeat(48)), null, 'characters, not bytes');
  assert.match(nameProblem('😀'.repeat(49))!, /longer than 48/);
  assert.match(nameProblem('')!, /empty/);
  assert.match(nameProblem(' Ada')!, /starts or ends with a space/);
  assert.match(nameProblem('a\tb')!, /control/);
  assert.match(nameProblem('a b')!, /line break/);
  assert.match(nameProblem('a⁧b')!, /direction/);
  assert.match(nameProblem('é')!, /NFC/);
  assert.equal(readName('  é  '), 'é', 'typed names are made canonical');
  assert.throws(() => readName('a\nb'), /Nothing was signed/);
});

test('which name is shown (section 3): every one that counts, in act id order; a withdrawn one not; a malformed one not; another cMIP’s not', async () => {
  const id = TestIdentity.create({ homes: [home.home] });
  await id.publishGenesis();
  const send = async (spec: string, type: number, payload: Uint8Array, objects?: [string, string][]) => {
    const m = id.sign(spec, type, payload, { public: true, objects });
    await relayAt(relay.base).putAct(m.act);
    return m.id;
  };
  for (const a of id.chainActs()) await relayAt(relay.base).putAct(a);
  assert.deepEqual(await namesOf(id.id, [relay.base]), []);
  const one = await send(SPECS.identity, NAME, namePayload('Ada'));
  const two = await send(SPECS.identity, NAME, namePayload('Ada L.'));
  await send(SPECS.identity, NAME, cborEncode(new Map<number, unknown>([[0, 'Not ours'], [1, new Uint8Array(32)]])));
  await send(SPECS.identity, NAME, cborEncode(new Map<number, unknown>([[0, 'x'.repeat(60)], [1, Buffer.from(NAMING_SPEC, 'hex')]])));
  const found = await namesOf(id.id, [relay.base]);
  assert.deepEqual(
    found.map((n) => n.act),
    [one, two].sort(),
    'two names count: both shown, none hidden',
  );
  await send(SPECS.identity, NAME_WITHDRAWAL, cborEncode(new Map()), [[one, one]]);
  assert.deepEqual((await namesOf(id.id, [relay.base])).map((n) => n.name), ['Ada L.']);
});
