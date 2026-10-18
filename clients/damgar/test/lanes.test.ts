// Lanes (round 2, F338, F350, F351): a lane asked in Dub, granted in
// Damgar after it is read in plain words, travelling through MOR as acts
// sealed to oneself; a tip paid from Dub without opening Damgar, within the
// lane; the payee's Damgar answering with an invoice its node made through
// a receive-only link and signing the receipt by itself, under its receipts
// lane; the account showing on whose authority each act was signed; Dub
// refusing past the cap and after the expiry, saying why; a lane revoked;
// and every step by hand, as in round 1, when asked. Real homes and a relay
// on local ports; a test node signing real BOLT 11 invoices.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { closeAll, person, refused, start, testLink, type Relay } from './world.ts';
import { TestNode } from './node.ts';
import type { Account, LaneShown, PaymentShown, ToSign } from '../src/shapes.ts';
import { SPEC } from '../src/specs.ts';
import { readAct, toldText } from '../../connector/src/read.ts';

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

const R = SPEC.units.regtest;

test('a lane: asked in Dub, granted in Damgar, a tip within it paid from Dub; the payee’s Damgar answers and receipts by itself; refused past its cap and expiry; revoked', async () => {
  const H = homes.map((h) => h.base);
  const node = new TestNode();
  const link = testLink(node);
  const alice = await person(H, [relay.base]);
  const bob = await person(H, [relay.base], { link: link.factory });

  // Bob: his node, his receive-only link (refused if too wide), his receipts lane.
  const rv = await bob.damgar.c.ask<{ digest: string }>('rails review', { lightning: node.key, network: 3 });
  await bob.damgar.c.ask('rails publish', { lightning: node.key, network: 3, digest: rv.digest });
  await bob.damgar.c.ask('link', link.config);
  const own = await bob.damgar.c.ask<{ digest: string; lines: { text: string }[] }>('own lane review', { role: 'receipts', cap: '5000', unit: R });
  assert.ok(own.lines.some((l) => /receipts/.test(l.text) && /answers to invoice requests/.test(l.text)), JSON.stringify(own.lines));
  await bob.damgar.c.ask('own lane', { role: 'receipts', cap: '5000', unit: R, digest: own.digest });

  // Alice asks for a lane in Dub: nothing granted yet, nothing paid by itself.
  const asked = await alice.dub.c.ask<{ lines: { text: string }[] }>('lane ask', { label: 'Dub on the Mac', cap: '2000', unit: R });
  assert.match(asked.lines[0].text, /Asked, not granted/);
  let lanes = (await alice.dub.c.ask<{ lanes: { state: string }[] }>('lanes')).lanes;
  assert.deepEqual(lanes.map((l) => l.state), ['asked']);
  const post = await bob.dub.c.ask<{ post: { id: string } }>('post', { text: 'A post worth a tip.' });
  await refused(alice.dub.c.ask('tip now', { post: post.post.id, signer: bob.id, value: '1500', unit: R }), /holds no lane/);

  // In Damgar, the lane is read in plain words, then granted.
  await alice.damgar.c.ask('look');
  const items = (await alice.damgar.c.ask<{ items: ToSign[] }>('to sign')).items;
  const lane = items.find((i) => i.kind === 'lane')!;
  assert.ok(lane, 'the lane waits in To sign');
  assert.equal(lane.app, 'Dub on this computer');
  const words = lane.lines.map((l) => l.text).join(' ');
  assert.match(words, /Dub on the Mac/);
  assert.match(words, /payment claims/);
  assert.match(words, /invoice requests/);
  assert.match(words, /at most 2 000 regtest satoshis/);
  assert.match(words, /a grant of this identity to itself/);
  await alice.damgar.c.ask('grant lane', { id: lane.id });
  lanes = (await alice.dub.c.ask<{ lanes: { state: string }[] }>('lanes')).lanes;
  assert.deepEqual(lanes.map((l) => l.state), ['in force']);

  // A tip from Dub, within the lane: signed with the lane's key, never Damgar opened.
  const t = await alice.dub.c.ask<{ lines: { text: string }[] }>('tip now', { post: post.post.id, signer: bob.id, value: '1500', unit: R, whatFor: 'for the post' });
  assert.match(t.lines[0].text, /under the lane/);
  // Bob's Damgar answers by itself: an invoice from his node through the link, under his receipts lane.
  const looked = await bob.damgar.c.ask<{ lines: { text: string }[] }>('look');
  assert.ok(looked.lines.some((l) => /answered by itself, with an invoice your node made/.test(l.text)), JSON.stringify(looked.lines));
  assert.equal(link.made.length, 1);
  // Dub shows the invoice; paid in the wallet (the test node's preimage); the claim signed under the lane.
  const pays = (await alice.dub.c.ask<{ payments: PaymentShown[] }>('payments')).payments;
  assert.equal(pays.length, 1);
  assert.equal(pays[0].pay?.invoice, link.made[0]);
  const paid = await alice.dub.c.ask<{ lines: { text: string }[] }>('paid', { key: pays[0].key, proof: link.preimages.get(link.made[0])! });
  assert.match(paid.lines[0].text, /says valid/);
  // Bob's Damgar checks the claim from the rail's evidence and signs the receipt by itself.
  const looked2 = await bob.damgar.c.ask<{ lines: { text: string }[] }>('look');
  assert.ok(looked2.lines.some((l) => /signed your receipt by itself, under your receipts lane/.test(l.text)), JSON.stringify(looked2.lines));
  assert.equal((await bob.damgar.c.ask<{ items: ToSign[] }>('to sign')).items.length, 0, 'nothing for the payee to do');

  // Bob's account: the claim signed under Alice's lane, backed; his receipt under his own lane.
  const b = await bob.damgar.c.ask<Account>('account');
  const pb = b.payments[0];
  assert.equal(pb.stage, 'settled');
  const claim = pb.proofs.find((x) => x.kind === 'claim')!;
  const receipt = pb.proofs.find((x) => x.kind === 'receipt')!;
  assert.equal(claim.rail.answer, 'valid');
  assert.equal(claim.standing, 'scoped', 'Identity alone: scoped (a Money-only reading shows it unknown)');
  assert.match(claim.how, /Signed under a lane of .* \(a grant to itself.*backed/);
  assert.match(receipt.how, /signed under the lane “Damgar: receipts and invoices by itself”/);
  // Alice, through Dub: the payment done, the receipt under Bob's lane.
  const done = (await alice.dub.c.ask<{ done: PaymentShown[] }>('payments')).done;
  assert.equal(done[0].stage, 'settled');
  assert.match(done[0].proofs.find((x) => x.kind === 'claim')!.how, /signed under the lane/);
  assert.match(done[0].proofs.find((x) => x.kind === 'receipt')!.how, /Signed under a lane of .*backed/);
  // Alice's Damgar lists the lane and what was signed under it.
  const al = (await alice.damgar.c.ask<{ lanes: LaneShown[] }>('lanes')).lanes;
  assert.equal(al[0].label, 'Dub on the Mac');
  assert.equal(al[0].state, 'in force');
  assert.deepEqual(al[0].acts.map((a) => a.said).sort(), ['a private act, sealed (its kind is read by its recipient only)', 'a private act, sealed (its kind is read by its recipient only)']);

  // Claude's connector, an outsider: the lane's grant read as a lane in force; the claim, sealed, read as signed under that lane, in force, its content sealed.
  const places = [...H, relay.base];
  const g = await readAct(al[0].grant, places);
  assert.equal(g.title, 'A lane: a grant of an identity to itself');
  assert.equal(g.counts, true);
  assert.match(g.verdict, /Not revoked/);
  const sealed = await readAct(claim.act, places);
  assert.equal(sealed.title, 'A private act signed under a lane');
  assert.match(sealed.verdict, /in force at the places asked/);
  assert.match(sealed.verdict, /only those it was delivered to can judge/);
  assert.match(toldText(sealed), /Act: mact1/);

  // Past the cap: Dub refuses before signing, saying why.
  await refused(alice.dub.c.ask('tip now', { post: post.post.id, signer: bob.id, value: '2500', unit: R }), /2500 is above the grant’s cap of 2000 per act/);

  // A second lane, with an expiry a moment away: once past it, refused.
  const clock = 'c1'.repeat(32);
  await alice.dub.c.ask('lane ask', { label: 'Dub, for a minute', cap: '9000', unit: R, until: Math.floor(Date.now() / 1000) + 2, clock });
  // The first lane revoked in Damgar: from then on Dub refuses under it.
  await alice.damgar.c.ask('look');
  const second = (await alice.damgar.c.ask<{ items: ToSign[] }>('to sign')).items.find((i) => i.kind === 'lane')!;
  assert.ok(second.lines.some((l) => /^Until: /.test(l.text)), 'its expiry said, on the clock named');
  await alice.damgar.c.ask('grant lane', { id: second.id });
  await alice.damgar.c.ask('revoke lane', { grant: al[0].grant });
  await new Promise((r) => setTimeout(r, 2500));
  const e = alice.dub.c.ask('tip now', { post: post.post.id, signer: bob.id, value: '1000', unit: R });
  await refused(e, /expired|revoked/);
  await refused(alice.dub.c.ask('tip now', { post: post.post.id, signer: bob.id, value: '1000', unit: R }), /The grant expired on .*Nothing was signed/);
  const after = (await alice.dub.c.ask<{ lanes: { label: string; state: string }[] }>('lanes')).lanes;
  assert.deepEqual(after.map((l) => [l.label, l.state]).sort(), [['Dub on the Mac', 'revoked'], ['Dub, for a minute', 'past its expiry']]);
  assert.equal((await alice.damgar.c.ask<{ lanes: LaneShown[] }>('lanes')).lanes.find((l) => l.label === 'Dub on the Mac')!.state, 'revoked');
});

test('every step by hand: off by default; turned on, every signature waits for the person, as in round 1', async () => {
  const H = homes.map((h) => h.base);
  const node = new TestNode();
  const link = testLink(node);
  const alice = await person(H, [relay.base]);
  const bob = await person(H, [relay.base], { link: link.factory });
  const rv = await bob.damgar.c.ask<{ digest: string }>('rails review', { lightning: node.key, network: 3 });
  await bob.damgar.c.ask('rails publish', { lightning: node.key, network: 3, digest: rv.digest });
  // A receive-only permission that can read the balance is refused.
  const wideBob = await person(H, [relay.base], { link: testLink(node, { wide: true }).factory });
  await refused(wideBob.damgar.c.ask('link', link.config), /can read your node’s balance/);
  await bob.damgar.c.ask('link', link.config);
  const own = await bob.damgar.c.ask<{ digest: string }>('own lane review', { role: 'receipts', cap: '5000', unit: R });
  await bob.damgar.c.ask('own lane', { role: 'receipts', cap: '5000', unit: R, digest: own.digest });
  assert.equal((await bob.damgar.c.ask<{ manual: boolean }>('lanes')).manual, false, 'off by default');
  await bob.damgar.c.ask('manual', { on: true });

  // A tip prepared in Dub and signed by hand in Alice's Damgar (round 1's way).
  const post = await bob.dub.c.ask<{ post: { id: string } }>('post', { text: 'By hand.' });
  await alice.dub.c.ask('tip', { post: post.post.id, signer: bob.id, value: '700', unit: R });
  await alice.damgar.c.ask('look');
  const d = (await alice.damgar.c.ask<{ items: ToSign[] }>('to sign')).items.find((i) => i.kind === 'draft')!;
  await alice.damgar.c.ask('sign draft', { id: d.id });
  // Bob's Damgar answers nothing by itself: the invoice waits for him.
  await bob.damgar.c.ask('look');
  assert.equal(link.made.length, 0, 'no invoice made by itself');
  const inv = (await bob.damgar.c.ask<{ items: ToSign[] }>('to sign')).items.find((i) => i.kind === 'invoice')!;
  assert.ok(inv, 'the invoice waits in To sign');
  const made = node.invoice(700, inv.descriptionHash!);
  await bob.damgar.c.ask('answer invoice', { id: inv.id, invoice: made.invoice });
  await alice.damgar.c.ask('look');
  const pay = (await alice.damgar.c.ask<{ payments: PaymentShown[] }>('pay')).payments[0];
  await alice.damgar.c.ask('paid', { key: pay.key, proof: made.preimage });
  // The receipt waits for him too.
  await bob.damgar.c.ask('look');
  const rec = (await bob.damgar.c.ask<{ items: ToSign[] }>('to sign')).items.find((i) => i.kind === 'receipt')!;
  assert.ok(rec, 'the receipt waits in To sign');
  await bob.damgar.c.ask('sign receipt', { key: rec.id });
  const a = await bob.damgar.c.ask<Account>('account');
  assert.deepEqual(a.payments[0].proofs.map((x) => [x.kind, x.how]).sort(), [
    ['claim', 'signed with its signer’s own key'],
    ['receipt', 'signed by hand'],
  ]);
  const al = await alice.damgar.c.ask<Account>('account');
  assert.equal(al.payments[0].proofs.find((x) => x.kind === 'claim')!.how, 'signed by hand');
});
