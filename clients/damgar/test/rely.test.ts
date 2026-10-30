// "Rely keeps a copy of what it names" (F400, decided by Nobody, allegedly,
// 24 October 2026; Identity rules 10 and 11, client conformance): a client
// that signs a witness act keeps a copy of every act it names, and makes it
// available where its own signer's acts are found, so that an act relied on
// survives in the hands of whoever relied on it.
//
// Alice and Bob each have homes of their own; Bob's payee pointer is at his
// homes and the relay only. Alice relies on it from Damgar's act menu: her
// Damgar keeps a copy and leaves it at her own homes, which did not hold it
// before. An act Damgar cannot find is refused before anything is signed.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { closeAll, person, refused, start, type Relay } from './world.ts';
import { TestNode } from './node.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { describeAct, MIRS } from '../../genesis/src/core.ts';

let aliceHome: Relay;
let bobHome: Relay;
let relay: Relay;

before(async () => {
  aliceHome = await start('home');
  bobHome = await start('home');
  relay = await start('relay');
});

// Every server and app this file starts is stopped whatever the outcome.
after(async () => {
  await closeAll();
  for (const h of [aliceHome, bobHome, relay]) await h?.stop().catch(() => undefined);
});

test('F400: Rely keeps a copy of the act it names, kept in Damgar and left at the relier’s own homes; an act it cannot find is refused, nothing signed', async () => {
  const alice = await person([aliceHome.base], [relay.base]);
  const bob = await person([bobHome.base], [relay.base]);
  const node = new TestNode();
  const rv = await bob.damgar.c.ask<{ digest: string }>('rails review', { lightning: node.key, network: 3 });
  await bob.damgar.c.ask('rails publish', { lightning: node.key, network: 3, digest: rv.digest });
  // Bob's payee pointer: a public Money act, at Bob's places, not at Alice's home.
  const pointer = (await relayAt(relay.base).feed({ signer: bob.id })).items
    .filter((i) => i.kind === 'act')
    .map((i) => describeAct(i.item) as { id: string; spec?: string; type?: number })
    .find((d) => d.spec === MIRS.money && d.type === 0)!.id;
  assert.equal(await relayAt(aliceHome.base).getAct(pointer), null, 'Alice’s home does not hold Bob’s act before');

  // An act nobody holds: refused before signing.
  const before = (await relayAt(aliceHome.base).feed({ signer: alice.id })).items.length;
  await refused(alice.damgar.c.ask('rely', { id: 'ab'.repeat(32), typed: 'RELY' }), /keeps a copy of every act it relies on.*Nothing was signed/);
  assert.equal((await relayAt(aliceHome.base).feed({ signer: alice.id })).items.length, before, 'nothing signed');

  const relied = await alice.damgar.c.ask<{ lines: { text: string }[] }>('rely', { id: pointer, typed: 'RELY' });
  assert.match(relied.lines[0].text, /You rely on/);
  assert.match(relied.lines[1].text, /A copy of the act is kept here and left at \d+ of your homes and relays.*F400/);
  const copy = await relayAt(aliceHome.base).getAct(pointer);
  assert.ok(copy, 'the copy is at Alice’s own home');
  assert.equal((describeAct(copy!) as { id: string }).id, pointer, 'the same signed act, verifying from any copy');
});
