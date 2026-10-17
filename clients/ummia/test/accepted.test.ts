// The accepted list (F340): one list per identity, sealed at its homes,
// shown whole in Ummia and changed there; every app reads the same, so a
// change made in Ummia is what Damgar reads, and Damgar's own change keeps
// Ummia's entries. Two apps writing at once: the fork shown and merged,
// no change lost.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { sha256, unhex } from '../../genesis/src/core.ts';
import { TestIdentity, sealFor } from '../../genesis/src/identity.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { listPayload, readAccepted, SEALED_LIST } from '../../damgar/src/accepted.ts';
import { ACCEPTED_SPEC, SPEC } from '../../damgar/src/specs.ts';
import type { State as DamgarState } from '../../damgar/src/shapes.ts';
import { closeAll, damgar, developer, start, type Relay } from './world.ts';
import type { AcceptedEntry, Done, Review } from '../src/shapes.ts';

let homes: Relay[];
let relay: Relay;

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
});

after(async () => {
  await closeAll();
  for (const h of [...homes, relay]) await h.stop();
});

type Shown = { entries: AcceptedEntry[]; version: number; forked: boolean; merged: string[]; published: boolean };

test('the list changed in Ummia is the list Damgar reads; Damgar’s change keeps Ummia’s entries', async () => {
  const H = homes.map((h) => h.base);
  const d = await developer(H, [relay.base]);
  const c = d.ummia.c;
  assert.equal((await c.ask<Shown>('accepted')).entries.length, 0, 'nothing accepted is the default');

  // A cMIP published, then accepted from Ummia beside the payment specifications Damgar knows.
  const sp = await c.ask<Review>('spec prepare', { kind: 0, text: '# cMIP: Accepted from Ummia, draft 1\n\nFor the accepted list.' });
  await c.ask<Done>('confirm', { plan: sp.plan, digest: sp.digest });
  await c.ask('accepted change', { add: [{ hash: sp.hash, label: 'Accepted from Ummia cMIP, draft 1' }, { hash: SPEC.payment }, { hash: SPEC.lightning.hash }] });
  const shown = await c.ask<Shown>('accepted');
  assert.equal(shown.version, 1);
  assert.deepEqual(shown.entries.map((e) => e.hash).sort(), [sp.hash!, SPEC.payment, SPEC.lightning.hash].sort());
  assert.equal(shown.entries.find((e) => e.hash === SPEC.payment)!.part, 'Money: Damgar’s part');
  assert.equal(shown.entries.find((e) => e.hash === SPEC.lightning.hash)!.label, 'Lightning rail Module, draft 3', 'a label Ummia knows from Damgar’s list');

  // Damgar, holding the same identity, reads what Ummia wrote: nothing more to choose.
  const g = await damgar();
  await g.c.ask('bring', { id: d.id, words: d.dub.words, address: H[0] });
  const s = await g.c.ask<DamgarState>('state');
  assert.equal(s.stage, 'ready');
  assert.deepEqual(s.accept.filter((a) => a.accepted).map((a) => a.key).sort(), ['lightning', 'payment']);

  // Damgar changes its part; Ummia's entry stays; Ummia shows Damgar's change.
  await g.c.ask('accept', { keys: ['payment', 'lightning', 'messages', 'bitcoin-units'] });
  const after2 = await c.ask<Shown>('accepted');
  assert.ok(after2.entries.some((e) => e.hash === sp.hash), 'Ummia’s entry kept by Damgar’s change');
  assert.ok(after2.entries.some((e) => e.label?.startsWith('Money messages')));
  assert.equal(after2.version, 2);

  // Removed in Ummia: Damgar reads it gone (a Damgar opened afresh: a running one reads the list again within a minute).
  await c.ask('accepted change', { remove: [SPEC.lightning.hash] });
  const g2 = await damgar();
  await g2.c.ask('bring', { id: d.id, words: d.dub.words, address: H[0] });
  assert.deepEqual((await g2.c.ask<DamgarState>('state')).accept.filter((a) => a.accepted).map((a) => a.key).sort(), ['bitcoin-units', 'messages', 'payment']);
});

test('two apps writing at once: the fork shown in Ummia and merged by its next change, an addition and a removal both kept', async () => {
  const H = homes.map((h) => h.base);
  const d = await developer(H, [relay.base]);
  const c = d.ummia.c;
  await c.ask('accepted change', { add: [{ hash: SPEC.payment }, { hash: SPEC.lightning.hash }] });
  // Another app holding the identity (Dub's file) writes two versions on the same one.
  const other = TestIdentity.load(join(d.dub.dir, 'identities', d.id, 'identity.json'));
  const secrets = other.f.encryption.map((e) => unhex(e.secret));
  const base = await readAccepted(d.id, secrets, H);
  const look = await lookUp(d.id, H);
  const write = async (entries: Map<string, string | null>) => {
    const made = other.sign(ACCEPTED_SPEC, SEALED_LIST, listPayload({ version: base.version + 1, previous: base.tips[0].id, merged: [], entries }), { public: false, to: [d.id] });
    const sealed = sealFor(made.act, made.key, [{ id: d.id, key: look.encryptionKey! }]);
    for (const h of H) {
      await relayAt(h).putSealed(sealed);
      await relayAt(h).putAct(made.act);
    }
  };
  const extra = sha256('an Agreements cMIP of another app, test value');
  const a = new Map(base.entries);
  a.set(extra, 'Another app’s cMIP, draft 1');
  const b = new Map(base.entries);
  b.delete(SPEC.lightning.hash);
  await write(a);
  await write(b);
  const forked = await c.ask<Shown>('accepted');
  assert.equal(forked.forked, true);
  assert.equal(forked.merged.length, 2, 'what the merge took from each branch, said');
  assert.ok(forked.entries.some((e) => e.hash === extra));
  assert.ok(!forked.entries.some((e) => e.hash === SPEC.lightning.hash));
  const r = await c.ask<{ lines: { text: string }[] }>('accepted change', { add: [{ hash: SPEC.onchain.hash }] });
  assert.match(r.lines[0].text, /Two apps had changed the accepted list at once/);
  const merged = await c.ask<Shown>('accepted');
  assert.equal(merged.forked, false);
  assert.deepEqual(merged.entries.map((e) => e.hash).sort(), [SPEC.payment, SPEC.onchain.hash, extra].sort());
});

test('private by default; published by choice, and withdrawn', async () => {
  const H = homes.map((h) => h.base);
  const d = await developer(H, [relay.base]);
  const c = d.ummia.c;
  await c.ask('accepted change', { add: [{ hash: SPEC.payment }] });
  const pub = async () => (await relayAt(relay.base).feed({ signer: d.id, spec: ACCEPTED_SPEC })).items.length;
  assert.equal(await pub(), 0);
  assert.equal((await c.ask<Shown>('accepted')).published, false);
  await c.ask('accepted publish', { on: true });
  assert.equal(await pub(), 1);
  assert.equal((await c.ask<Shown>('accepted')).published, true);
  await c.ask('accepted publish', { on: false });
  assert.equal((await c.ask<Shown>('accepted')).published, false);
});
