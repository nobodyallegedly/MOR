// The accepted list (the accepted cMIP, draft 1; F340): one private act
// sealed to the identity at its homes, read by any app holding the
// identity, each changing its own part; written on the latest version read
// and checked again before sending; a fork shown and merged, never a
// change dropped; private by default, published by choice.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { sha256, unhex } from '../../genesis/src/core.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { changeAccepted, listPayload, readAccepted, SEALED_LIST } from '../src/accepted.ts';
import { ACCEPTED_SPEC, SPEC } from '../src/specs.ts';
import { closeAll, damgar, person, start, type Relay } from './world.ts';
import type { State } from '../src/shapes.ts';
import { sealFor } from '../../genesis/src/identity.ts';
import { lookUp } from '../../genesis/src/lookup.ts';

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

/** Another app holding the identity: Dub's own file, signing in Dub's line. */
const otherApp = (dubDir: string, id: string) => TestIdentity.load(join(dubDir, 'identities', id, 'identity.json'));

test('first use asks; the list, sealed at the homes, is read by a second Damgar; another app’s part is kept; nothing is in the clear', async () => {
  const H = homes.map((h) => h.base);
  const p = await person(H, [relay.base], { accept: ['payment', 'messages', 'lightning', 'bitcoin-units'] });
  // A Damgar that has just brought it asks nothing more: the list is found.
  const second = await damgar();
  await second.c.ask('bring', { id: p.id, words: p.dub.words, address: H[0] });
  const s = await second.c.ask<State>('state');
  assert.equal(s.stage, 'ready');
  assert.deepEqual(s.accept.filter((a) => a.accepted).map((a) => a.key).sort(), ['bitcoin-units', 'lightning', 'messages', 'payment']);

  // A fresh identity, nothing chosen yet: the first screen asks, and nothing is accepted.
  const q = await person(H, [relay.base], { accept: null });
  const fresh = await q.damgar.c.ask<State>('state');
  assert.equal(fresh.stage, 'accept');
  assert.ok(fresh.accept.every((a) => !a.accepted));

  // Another app (Edubba's part, say) adds an entry Damgar does not know; Damgar's change keeps it.
  const edubbaPart = sha256('an agreement cMIP Damgar does not know, test value');
  const other = otherApp(p.dub.dir, p.id);
  await changeAccepted(other, (e) => e.set(edubbaPart, 'An agreements cMIP, draft 1'), { save: async () => undefined, check: async () => undefined });
  await p.damgar.c.ask('accept', { keys: ['payment', 'messages', 'lightning', 'onchain', 'bitcoin-units'] });
  const secrets = other.f.encryption.map((e) => unhex(e.secret));
  const read = await readAccepted(p.id, secrets, H);
  assert.ok(read.entries.has(edubbaPart), 'the other app’s entry is kept');
  assert.ok(read.entries.has(SPEC.onchain.hash));
  assert.equal(read.tips.length, 1);

  // Nothing of it in the clear at the homes: only sealed containers and locked acts.
  for (const h of H) {
    const page = await relayAt(h).feed({ to: p.id });
    for (const it of page.items) {
      const t = Buffer.from(it.item).toString('latin1');
      assert.ok(!t.includes('An agreements cMIP'), 'no label in the clear');
      assert.ok(!t.includes(Buffer.from(unhex(SPEC.onchain.hash)).toString('latin1')), 'no spec hash in the clear');
    }
  }
});

test('two apps writing at once: the fork is shown and merged against the last common version, an addition and a removal both kept', async () => {
  const H = homes.map((h) => h.base);
  const p = await person(H, [relay.base], { accept: ['payment', 'messages', 'lightning', 'bitcoin-units'] });
  const other = otherApp(p.dub.dir, p.id);
  const secrets = other.f.encryption.map((e) => unhex(e.secret));
  const base = await readAccepted(p.id, secrets, H);
  // Two versions naming the same predecessor: one adds a units Module of another app, the other removes Lightning.
  const extra = sha256('a units Module of another app, test value');
  const look = await lookUp(p.id, H);
  const write = async (entries: Map<string, string | null>) => {
    const made = other.sign(ACCEPTED_SPEC, SEALED_LIST, listPayload({ version: base.version + 1, previous: base.tips[0].id, merged: [], entries }), { public: false, to: [p.id] });
    const sealed = sealFor(made.act, made.key, [{ id: p.id, key: look.encryptionKey! }]);
    for (const h of H) {
      await relayAt(h).putSealed(sealed);
      await relayAt(h).putAct(made.act);
    }
  };
  const a = new Map(base.entries);
  a.set(extra, 'Another units Module, draft 1');
  const b = new Map(base.entries);
  b.delete(SPEC.lightning.hash);
  await write(a);
  await write(b);
  const forked = await readAccepted(p.id, secrets, H);
  assert.equal(forked.tips.length, 2, 'two tips: forked');
  assert.ok(forked.entries.has(extra), 'the addition merged');
  assert.ok(!forked.entries.has(SPEC.lightning.hash), 'the removal merged');
  assert.equal(forked.merged.length, 2);
  // Damgar shows it, and its next change writes the merge, naming both branches.
  const s = await p.damgar.c.ask<State>('state');
  void s;
  const r = await p.damgar.c.ask<{ lines: { text: string }[] }>('accept', { keys: ['payment', 'messages', 'bitcoin-units', 'onchain'] });
  assert.match(r.lines[0].text, /Two apps had changed the accepted list at once/);
  const after = await readAccepted(p.id, secrets, H);
  assert.equal(after.tips.length, 1);
  assert.equal(after.tips[0].merged.length, 1, 'the merge names the other branch');
  assert.ok(after.entries.has(extra), 'the other app’s addition survives Damgar’s change');
  assert.ok(after.entries.has(SPEC.onchain.hash));
});

test('the list is private by default; published only by choice, and withdrawn', async () => {
  const H = homes.map((h) => h.base);
  const p = await person(H, [relay.base]);
  const pub = async () => (await relayAt(relay.base).feed({ signer: p.id })).items.filter((it) => it.kind === 'act').length;
  const before_ = await pub();
  assert.equal((await p.damgar.c.ask<State>('state')).list.published, false);
  await p.damgar.c.ask('publish list', { on: true });
  assert.equal((await p.damgar.c.ask<State>('state')).list.published, true);
  assert.equal(await pub(), before_ + 1);
  await p.damgar.c.ask('publish list', { on: false });
  assert.equal((await p.damgar.c.ask<State>('state')).list.published, false);
});
