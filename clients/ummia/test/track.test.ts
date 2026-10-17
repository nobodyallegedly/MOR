// Tracking extensions and xtypes (F339): which public agreements name which
// cMIPs, and which act types are defined from core pieces and used, asked
// of the relays named with the filters relays already have; a sealed
// agreement's use stays invisible, as the app says. And the plain look-up
// of one specification's acts by the feed's `spec`, `type` and `signer`.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { MIRS, cborEncode, signaturePayload, unhex } from '../../genesis/src/core.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { closeAll, developer, start, type Relay } from './world.ts';
import type { Done, Review } from '../src/shapes.ts';
import type { FoundAct, Tracked } from '../src/track.ts';

let homes: Relay[];
let relays: Relay[];

before(async () => {
  homes = [await start('home'), await start('home')];
  relays = [await start('relay'), await start('relay')];
});

after(async () => {
  await closeAll();
  for (const h of [...homes, ...relays]) await h.stop();
});

/** A deal's terms (Agreements type 0): its parties, its words, the extensions it names. */
function dealTerms(parties: TestIdentity[], text: string, extensions: string[]): Uint8Array {
  return cborEncode(
    new Map<number, unknown>([
      [0, parties.map((p) => unhex(p.id))],
      [1, text],
      [2, new Map()],
      [4, [0]],
      [5, [0]],
      [15, extensions.map(unhex)],
    ]),
  );
}

async function agree(by: TestIdentity, payload: Uint8Array, signers: TestIdentity[], relay: string, privately = false): Promise<string> {
  const to = privately ? signers.map((x) => x.id) : undefined;
  const made = await by.publish(MIRS.agreements, 0, payload, { public: !privately, to, relays: [relay] });
  for (const who of signers) await who.publish(MIRS.agreements, 1, signaturePayload(made.id), { public: !privately, to, relays: [relay], objects: [[made.id, made.id]] });
  return made.id;
}

test('extensions public agreements name, an xtype’s use, a sealed agreement not counted, and the acts of one specification', async () => {
  const H = homes.map((h) => h.base);
  const [a, b] = relays.map((r) => r.base);
  const d = await developer(H, [a], { track: [a, b] });
  const c = d.ummia.c;
  const rv = await c.ask<Review>('spec prepare', { kind: 0, text: '# cMIP: Test bounties, draft 1\n\nBounties as acts.', types: '0 bounty bounty = tstr', layers: '3' });
  await c.ask<Done>('confirm', { plan: rv.plan, digest: rv.digest });
  const x = rv.hash!;

  // Two public deals name it (one on each relay), a sealed one too, which no relay can read.
  const ann = TestIdentity.create({ homes: [homes[0].home] });
  const bo = TestIdentity.create({ homes: [homes[1].home] });
  // Each carries its identity chain to the relays it publishes on, as clients do (relay transport cMIP, "Clients", 7).
  for (const p of [ann, bo]) {
    await p.publishGenesis();
    for (const r of [a, b]) for (const act of p.chainActs()) await relayAt(r).putAct(act);
  }
  await agree(ann, dealTerms([ann, bo], 'A bounty for a rail Module.', [x]), [ann, bo], a);
  await agree(bo, dealTerms([ann, bo], 'A bounty for a reader.', [x]), [ann, bo], b);
  await agree(ann, dealTerms([ann, bo], 'A private bounty.', [x]), [ann, bo], a, true);
  // The xtype used: two public acts of its type 0, one private one, one of a type it does not define.
  await ann.publish(x, 0, cborEncode(new Map([[0, 'first']])), { public: true, relays: [a] });
  await bo.publish(x, 0, cborEncode(new Map([[0, 'second']])), { public: true, relays: [b] });
  await ann.publish(x, 0, cborEncode(new Map([[0, 'private']])), { public: false, to: [bo.id], relays: [a] });

  const t = await c.ask<Tracked>('track', {});
  const ext = t.extensions.find((e) => e.hash === x)!;
  assert.ok(ext, JSON.stringify(t.agreements));
  assert.equal(ext.agreements, 2, 'the two public agreements; the sealed one is invisible');
  assert.equal(ext.name, 'cMIP: Test bounties, draft 1');
  assert.deepEqual(ext.layers, ['Development', 'Agreements']);
  assert.match(t.limit[0], /A sealed agreement’s use of a cMIP stays invisible unless someone publishes it/);
  const xt = t.xtypes.find((y) => y.hash === x)!;
  assert.equal(xt.use!.acts, 2, JSON.stringify(xt.use));
  assert.deepEqual(xt.use!.byType.map((y) => [y.name, y.acts]), [['bounty', 2]]);

  // Only the relays named: one relay, one deal.
  const one = await c.ask<Tracked>('track', { relays: [a] });
  assert.equal(one.extensions.find((e) => e.hash === x)!.agreements, 1);

  // The plain look-up of its acts: by spec, by spec and signer.
  const all = await c.ask<{ acts: FoundAct[] }>('acts of', { spec: x });
  assert.deepEqual(all.acts.map((y) => [y.signer, y.type, y.standing]).sort(), [[ann.id, 0, 'valid'], [bo.id, 0, 'valid']].sort());
  const by = await c.ask<{ acts: FoundAct[] }>('acts of', { spec: x, signer: bo.id, type: '0' });
  assert.deepEqual(by.acts.map((y) => y.signer), [bo.id]);
});
