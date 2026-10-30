// Bitcoin anchoring of a collective's act, between the apps (F338): asked in
// Edubba (the leaf, its blind kept there), its payment signed in Damgar
// (the ticket checked first), paid, the payer's receipt signed by the test
// anchoring service, the batch anchored by pay-to-contract and published,
// and the anchor checked in Edubba against the chain it follows, by the
// Bitcoin clock Module's rule. No regtest here: the service's node is a test
// node, its chain a test chain the test mines; the regtest run is in
// `regtest.test.ts`.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { closeAll, damgar, edubba, founded, refused, start, type Relay } from './world.ts';
import { FakeChain, addressScript } from './chain.ts';
import { StubLnd } from './node.ts';
import { Service } from '../../anchoring-service/src/service.ts';
import type { PaymentShown, ToSign, Account } from '../src/shapes.ts';
import { ACCEPTABLE } from '../src/specs.ts';
import { payment } from '../src/page/view.ts';

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

test('an anchor of a collective’s act: asked in Edubba, paid from Damgar, anchored by the service, checked in Edubba', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const chain = new FakeChain();
  chain.mine(10);
  const lnd = new StubLnd(chain, addressScript);
  const svc = new Service(join(mkdtempSync(join(tmpdir(), 'damgar-svc-')), 'svc'), lnd, chain, { homes: H, relays: R });
  await svc.start();

  const e = await edubba(H, R, chain);
  const { f, col } = await founded(H, R, e);
  await e.c.ask('acting as', { id: f.id });
  // The founder's Damgar, holding the same identity.
  const g = await damgar(chain);
  await g.c.ask('bring', { id: f.id, words: f.words, address: H[0] });
  await g.c.ask('accept', { keys: ACCEPTABLE.map((a) => a.key) });

  // Edubba: the acts that may be anchored (never a release), the service's offer, a tier.
  const acts = await e.c.ask<{ act: string; label: string }[]>('money anchorable', { collective: col });
  assert.ok(acts.some((a) => /agreement in force/.test(a.label)));
  assert.ok(!acts.some((a) => /release/i.test(a.label)), 'releases are Ummia’s, not anchored here');
  const offers = await e.c.ask<{ act: string; tiers: { price: number; blocks: number }[] }[]>('money offers', { service: svc.id });
  assert.equal(offers.length, 1);
  assert.deepEqual(offers[0].tiers.map((t) => t.blocks), [2, 6, 144]);
  const act = acts.find((a) => /agreement in force/.test(a.label))!.act;
  await e.c.ask('money anchor', { identity: f.id, collective: col, act, service: svc.id, offer: offers[0].act, tier: 1 });
  let shown = await e.c.ask<{ state: string }[]>('money anchors', { collective: col });
  assert.equal(shown[0].state, 'asked');

  // Damgar: the draft, read; signed; the service answers with an invoice and a ticket, checked before paying.
  await g.c.ask('look');
  const d = (await g.c.ask<{ items: ToSign[] }>('to sign')).items.find((i) => i.kind === 'draft')!;
  assert.equal(d.app, 'Edubba');
  assert.equal(d.amount?.said, '20 regtest satoshis');
  assert.ok(d.lines.some((l) => /never the act/.test(l.text)));
  await g.c.ask('sign draft', { id: d.id });
  assert.ok((await svc.tick()).some((l) => /Ticket for/.test(l)));
  await g.c.ask('look');
  const p = (await g.c.ask<{ payments: PaymentShown[] }>('pay')).payments[0];
  assert.equal(p.stage, 'to pay', JSON.stringify(p));
  assert.deepEqual(p.ticket && { batch: p.ticket.batch, tier: p.ticket.tier }, { batch: 1, tier: 1 });
  assert.equal(p.ticket!.checked, true, 'its deadline read against the chain this Damgar follows');
  assert.doesNotMatch(payment(p, true), /Not checked here/);
  // Where no chain is followed (the web client), the deadline cannot be read: said on the screen.
  assert.match(payment({ ...p, ticket: { ...p.ticket!, checked: false } }, true), /Not checked here: this Damgar follows no chain/);

  // Paid in the "wallet"; the claim; the service sees it settled, signs the receipt, anchors and publishes.
  const preimage = lnd.pay(p.pay!.invoice!);
  await g.c.ask('paid', { key: p.key, proof: preimage });
  const said = await svc.tick();
  assert.ok(said.some((l) => /receipt signed and sent/.test(l)), said.join('\n'));
  assert.ok(said.some((l) => /Batch 1 anchored/.test(l)), said.join('\n'));
  await g.c.ask('look');
  const a = await g.c.ask<Account>('account');
  assert.deepEqual(a.payments[0].proofs.map((x) => `${x.kind} ${x.rail.answer}`).sort(), ['claim valid', 'receipt valid']);
  assert.equal(a.payments[0].proofs[0].beside.answer, 'unknown', 'a payment following an offer is Agreements’ to judge: unknown here');

  // Edubba: published, not yet deep enough; then anchored, at the block that holds it.
  shown = await e.c.ask<{ state: string }[]>('money anchors', { collective: col });
  assert.equal(shown[0].state, 'pending', JSON.stringify(shown));
  chain.mine(6);
  const done = await e.c.ask<{ state: string; lines: { text: string }[] }[]>('money anchors', { collective: col });
  assert.equal(done[0].state, 'anchored', JSON.stringify(done));
  assert.ok(done[0].lines.some((l) => /Anchored at block \d+/.test(l.text)), JSON.stringify(done[0].lines));
  assert.match(done[0].lines.at(-1)!.text, /By its deadline \(block \d+\): delivered/);
});

// Round 3, part C, item 8: a missed deadline, shown only with an anchor (or
// the chain past it), as the anchoring cMIP's item 12 judges: one anchor the
// service makes late (anchored after its ticket's block), one it never
// makes (the chain past its deadline at the clock's depth, no anchor shown).
test('a missed deadline, shown only from the anchor or the chain: one anchored late, one defaulted; before that, only pending', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const chain = new FakeChain();
  chain.mine(10);
  const lnd = new StubLnd(chain, addressScript);
  const svc = new Service(join(mkdtempSync(join(tmpdir(), 'damgar-svc-')), 'svc'), lnd, chain, { homes: H, relays: R });
  await svc.start();
  const e = await edubba(H, R, chain);
  const { f, col } = await founded(H, R, e);
  await e.c.ask('acting as', { id: f.id });
  const g = await damgar(chain);
  await g.c.ask('bring', { id: f.id, words: f.words, address: H[0] });
  await g.c.ask('accept', { keys: ACCEPTABLE.map((a) => a.key) });
  const acts = await e.c.ask<{ act: string; label: string }[]>('money anchorable', { collective: col });
  const offers = await e.c.ask<{ act: string }[]>('money offers', { service: svc.id });

  // Asked and paid, tier 0 (within 2 blocks); the service does not anchor in time.
  const pay = async (act: string) => {
    await e.c.ask('money anchor', { identity: f.id, collective: col, act, service: svc.id, offer: offers[0].act, tier: 0 });
    await g.c.ask('look');
    const d = (await g.c.ask<{ items: ToSign[] }>('to sign')).items.find((i) => i.kind === 'draft')!;
    await g.c.ask('sign draft', { id: d.id });
    await svc.tick();
    await g.c.ask('look');
    const p = (await g.c.ask<{ payments: PaymentShown[] }>('pay')).payments.find((x) => x.stage === 'to pay')!;
    await g.c.ask('paid', { key: p.key, proof: lnd.pay(p.pay!.invoice!) });
    return p.ticket!.deadline;
  };
  const late = acts[0].act;
  const deadline = await pay(late);
  let shown = await e.c.ask<{ act: string; state: string; deadline: number; lines: { text: string }[] }[]>('money anchors', { collective: col });
  assert.equal(shown[0].deadline, deadline, 'its ticket read from the service’s own acts');
  assert.ok(!shown.some((x) => /Missed/.test(JSON.stringify(x.lines))), 'nothing said missed before the chain shows it');
  chain.mine(4);
  // The service anchors now, past the ticket's block; once deep enough, Edubba shows it late, from the anchor itself.
  assert.ok((await svc.tick()).some((l) => /anchored/.test(l)));
  chain.mine(6);
  shown = await e.c.ask('money anchors', { collective: col });
  const l = shown.find((x) => x.act === late)!;
  assert.equal(l.state, 'late', JSON.stringify(l));
  assert.ok(l.lines.some((x) => /Missed its deadline: anchored at block \d+, after block \d+, as the anchor itself shows/.test(x.text)), JSON.stringify(l.lines));

  // A second, paid, never anchored: pending while the deadline is not buried; a default once the chain stands past it at depth.
  const never = acts.find((a) => a.act !== late)!.act;
  const d2 = await pay(never);
  shown = await e.c.ask('money anchors', { collective: col });
  let n = shown.find((x) => x.act === never)!;
  assert.notEqual(n.state, 'default');
  assert.ok(n.lines.some((x) => /not passed at the clock’s depth yet/.test(x.text)), JSON.stringify(n.lines));
  const tip = (await chain.headers()).headers.length - 1;
  chain.mine(d2 + 6 - 1 - tip);
  shown = await e.c.ask('money anchors', { collective: col });
  n = shown.find((x) => x.act === never)!;
  assert.equal(n.state, 'default', JSON.stringify(n));
  assert.ok(n.lines.some((x) => /Missed its deadline: the chain followed stands at block/.test(x.text)));
});
