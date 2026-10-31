// Rely on it and Anchor it in Damgar's act menu (decided by Nobody,
// allegedly, 22 October 2026: "Agreed"; Damgar's round 3, question 3):
// below the line, on every act, receipts and claims first of all. An anchor
// prepared and its request signed in Damgar in one step, the service's
// invoice paid, shown in Account › Anchors; the witness act on its receipt
// signed once RELY is typed, its key checked first (H80): refused after a
// change of keys made in Kišib until Damgar has the new words; then the
// receipt itself anchored. Real homes and a relay on local ports, a test
// anchoring service on a fake chain.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { closeAll, dub, person, refused, start, type Relay } from './world.ts';
import { FakeChain, addressScript } from './chain.ts';
import { StubLnd } from './node.ts';
import { Service } from '../../anchoring-service/src/service.ts';
import { closeAll as closeKishib, changeKeys, kishib } from '../../kishib/test/world.ts';
import { SPENT_SAY } from '../src/damgar.ts';
import type { Account, PaymentShown } from '../src/shapes.ts';
import { describeAct } from '../../genesis/src/core.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { IDENTITY_TYPES } from '../../genesis/src/core.ts';

let homes: Relay[];
let relay: Relay;

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
});

// Every browser, app and server this file starts is stopped whatever the outcome, even where one before it fails (Part 4).
after(async () => {
  try {
    await closeAll();
    await closeKishib();
  } finally {
    for (const h of [...(homes ?? []), relay]) await h?.stop().catch(() => undefined);
  }
});

/** Anchor an act from Damgar's menu, in one step; the service's ticket; paid; the service's receipt. */
async function anchored(g: { c: { ask<T>(op: string, a?: unknown): Promise<T> } }, svc: Service, lnd: StubLnd, act: string): Promise<PaymentShown> {
  const offers = (await g.c.ask<{ offers: { act: string; tiers: { tier: number; words: string }[] }[] }>('anchor offers', { service: svc.id })).offers;
  assert.equal(offers.length, 1);
  assert.match(offers[0].tiers[1].words, /within 6 blocks/);
  const r = await g.c.ask<{ lines: { text: string }[] }>('anchor', { id: act, service: svc.id, offer: offers[0].act, tier: 1 });
  assert.match(r.lines[0].text, /the invoice request signed and sent/);
  assert.ok((await svc.tick()).some((l) => /Ticket for/.test(l)));
  await g.c.ask('look');
  const p = (await g.c.ask<{ payments: PaymentShown[] }>('pay')).payments.find((x) => x.ticket && x.stage === 'to pay')!;
  assert.ok(p, 'the anchor’s payment waits in To pay, with its ticket');
  await g.c.ask('paid', { key: p.key, proof: lnd.pay(p.pay!.invoice!) });
  const said = await svc.tick();
  assert.ok(said.some((l) => /receipt signed and sent/.test(l)), said.join('\n'));
  await g.c.ask('look');
  return (await g.c.ask<Account>('account')).payments.find((x) => x.key === p.key)!;
}

test('Damgar’s act menu: Anchor an act, paid and shown in Anchors; Rely on its receipt (RELY typed; refused after a change of keys until the new words); Anchor the receipt', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const chain = new FakeChain();
  chain.mine(10);
  const lnd = new StubLnd(chain, addressScript);
  const svc = new Service(join(mkdtempSync(join(tmpdir(), 'damgar-menu-svc-')), 'svc'), lnd, chain, { homes: H, relays: R });
  await svc.start();
  const alice = await person(H, R, { chain });
  const bob = await dub(H, R);
  const post = (await bob.c.ask<{ post: { id: string } }>('post', { text: 'An act worth anchoring.' })).post.id;

  // Anchor it, from Damgar alone: prepared and its request signed in one step, the invoice paid; in Account › Anchors.
  const first = await anchored(alice.damgar, svc, lnd, post);
  assert.equal(first.stage, 'settled', JSON.stringify(first));
  assert.ok(first.ticket, 'an anchor’s payment carries its ticket: Account › Anchors shows it');
  const receipt = first.proofs.find((x) => x.kind === 'receipt')!;
  assert.ok(receipt && !receipt.by.me, 'the service’s receipt');
  const anchors = (await alice.damgar.c.ask<Account>('account')).payments.filter((x) => x.ticket);
  assert.equal(anchors.length, 1);

  // One's own act (here, Alice's claim) is not relied on: said.
  await refused(alice.damgar.c.ask('rely', { id: first.proofs.find((x) => x.kind === 'claim')!.act, typed: 'RELY' }), /this identity’s own act/);
  // Rely on the receipt: refused without RELY; signed with it, a witness act naming the receipt.
  await refused(alice.damgar.c.ask('rely', { id: receipt.act, typed: 'rely' }), /Type RELY/);
  const relied = await alice.damgar.c.ask<{ lines: { text: string }[] }>('rely', { id: receipt.act, typed: 'RELY' });
  assert.match(relied.lines[0].text, /You rely on/);
  const witness = /witness act ([0-9a-f]{8})…/.exec(relied.lines[0].text)![1];
  let found = false;
  for (const it of (await relayAt(H[0]).feed({ signer: alice.id })).items) {
    if (it.kind !== 'act') continue;
    const d = describeAct(it.item) as { id: string; type?: number; objects?: [string, string][]; refs?: string[] };
    if (d.id.startsWith(witness) && d.type === IDENTITY_TYPES.witness) found = true;
  }
  assert.ok(found, 'the witness act is at Alice’s homes');

  // A change of keys made in Kišib, from paper: Damgar refuses to rely until it has the new signing words.
  const k = await kishib();
  const card = (await alice.dub.c.ask<{ identity: { line: { card: string | null } } }>('state')).identity.line.card ?? '';
  const review = await k.c.ask<{ plan: string; digest: string; warning?: string | null }>('rotate plan', { id: alice.id, address: H[0], words: alice.dub.chainWords.join(' '), cards: card });
  const fresh = await changeKeys(k.c, review);
  await refused(alice.damgar.c.ask('rely', { id: post, typed: 'RELY' }), new RegExp(SPENT_SAY.slice(0, 40).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  await alice.damgar.c.ask('renew', { words: fresh.signing.join(' ') });
  assert.match((await alice.damgar.c.ask<{ lines: { text: string }[] }>('rely', { id: post, typed: 'RELY' })).lines[0].text, /You rely on/);

  // Anchor the receipt itself: a second anchor, in Anchors.
  const second = await anchored(alice.damgar, svc, lnd, receipt.act);
  assert.ok(second.ticket);
  assert.equal((await alice.damgar.c.ask<Account>('account')).payments.filter((x) => x.ticket).length, 2);
});
