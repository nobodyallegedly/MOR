// A tip, end to end through MOR, without regtest: prepared in Dub (a draft
// sealed to the payer's own identity), signed in the payer's Damgar (an
// invoice request), answered by the payee with an invoice its node signed
// (a test node, signing real BOLT 11 invoices), paid (knowing the
// preimage, as a wallet that paid does), the payer's claim signed and
// checked by the payee's Damgar from the rail's own evidence, the payee's
// receipt signed and checked by the payer's. Real homes and a relay on
// local ports; every act made and judged by the core library.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { closeAll, everything, person, refused, start, type Relay } from './world.ts';
import { TestNode } from './node.ts';
import type { Account, PaymentShown, Rails, State, ToSign } from '../src/shapes.ts';
import { SPEC } from '../src/specs.ts';

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

test('a tip prepared in Dub, signed in Damgar, paid, claimed, verified and receipted, through MOR', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const alice = await person(H, R);
  const bob = await person(H, R);
  const node = new TestNode();

  // Bob says where he is paid: his node, on regtest.
  const rv = await bob.damgar.c.ask<{ digest: string; costs: { text: string }[] }>('rails review', { lightning: node.key, network: 3 });
  assert.ok(rv.costs.some((c) => /A public node exposes its owner/.test(c.text)), 'the Lightning Module’s costs are shown before the rail is declared');
  await bob.damgar.c.ask('rails publish', { lightning: node.key, network: 3, digest: rv.digest });
  const rails = await bob.damgar.c.ask<Rails>('rails');
  assert.equal(rails.pointer?.version, 1);

  // Bob posts; Alice tips the post in Dub: a draft sealed to herself, nothing signed as money.
  const post = await bob.dub.c.ask<{ post: { id: string } }>('post', { text: 'A post worth a tip.' });
  const tipped = await alice.dub.c.ask<{ lines: { text: string }[] }>('tip', { post: post.post.id, signer: bob.id, value: '1500', unit: SPEC.units.regtest, whatFor: 'for the post' });
  assert.match(tipped.lines[0].text, /Prepared, not signed/);

  // Alice's Damgar finds it, reads it in plain words, and signs the invoice request.
  await alice.damgar.c.ask('look');
  let items = (await alice.damgar.c.ask<{ items: ToSign[] }>('to sign')).items;
  const draft = items.find((i) => i.kind === 'draft')!;
  assert.ok(draft, 'the draft is in To sign');
  assert.equal(draft.app, 'Dub');
  assert.equal(draft.amount?.said, '1 500 regtest satoshis');
  assert.ok(draft.lines.some((l) => /On Lightning, to their flow/.test(l.text)), JSON.stringify(draft.lines));
  await alice.damgar.c.ask('sign draft', { id: draft.id });

  // Bob's Damgar: an invoice to make, with the commitment as the description hash.
  await bob.damgar.c.ask('look');
  items = (await bob.damgar.c.ask<{ items: ToSign[] }>('to sign')).items;
  const inv = items.find((i) => i.kind === 'invoice')!;
  assert.ok(inv?.descriptionHash, 'the payee is asked for an invoice');
  // An invoice from another node, or for another amount, is refused before anything is sent.
  await refused(bob.damgar.c.ask('answer invoice', { id: inv.id, invoice: new TestNode().invoice(1500, inv.descriptionHash!).invoice }), /not the node your payee pointer names/);
  await refused(bob.damgar.c.ask('answer invoice', { id: inv.id, invoice: node.invoice(1499, inv.descriptionHash!).invoice }), /amount/);
  await refused(bob.damgar.c.ask('answer invoice', { id: inv.id, invoice: node.invoice(1500, inv.descriptionHash!, { description: 'a tip' }).invoice }), /plain description/);
  const made = node.invoice(1500, inv.descriptionHash!);
  await bob.damgar.c.ask('answer invoice', { id: inv.id, invoice: made.invoice });

  // Alice: in Pay, the invoice to pay in her wallet; a wrong preimage refused; the right one claimed.
  await alice.damgar.c.ask('look');
  const pay = (await alice.damgar.c.ask<{ payments: PaymentShown[] }>('pay')).payments;
  assert.equal(pay.length, 1);
  assert.equal(pay[0].pay?.invoice, made.invoice);
  await refused(alice.damgar.c.ask('paid', { key: pay[0].key, proof: 'ab'.repeat(32) }), /preimage does not match/);
  const paid = await alice.damgar.c.ask<{ lines: { text: string }[] }>('paid', { key: pay[0].key, proof: made.preimage });
  assert.match(paid.lines[0].text, /says valid/);

  // Bob's Damgar verifies her claim from the rail's evidence, and he signs the receipt.
  await bob.damgar.c.ask('look');
  items = (await bob.damgar.c.ask<{ items: ToSign[] }>('to sign')).items;
  const rec = items.find((i) => i.kind === 'receipt')!;
  assert.ok(rec, 'a receipt to sign');
  await bob.damgar.c.ask('sign receipt', { key: rec.id });

  // Both accounts: the claim and the receipt, each valid by the Lightning rail Module's rule.
  await alice.damgar.c.ask('look');
  const a = await alice.damgar.c.ask<Account>('account');
  const p = a.payments[0];
  assert.equal(p.stage, 'settled');
  assert.deepEqual(p.proofs.map((x) => [x.kind, x.rail.answer, x.standing]).sort(), [['claim', 'valid', 'valid'], ['receipt', 'valid', 'valid']]);
  assert.equal(p.proofs[0].beside.answer, 'valid', 'a tip to the pointer in force, as the vault allows');
  assert.deepEqual(a.totals.find((t) => t.label.startsWith('Went out'))!.amounts.map((x) => x.said), ['1 500 regtest satoshis']);
  const b = await bob.damgar.c.ask<Account>('account');
  assert.deepEqual(b.totals.find((t) => t.label.startsWith('Came in'))!.amounts.map((x) => x.said), ['1 500 regtest satoshis']);

  // No wallet, no node, no Bitcoin key in either folder; never a chain key.
  for (const d of [alice.damgar.dir, bob.damgar.dir]) {
    const all = everything(d);
    assert.ok(!all.includes(node.key.slice(2)) || d === bob.damgar.dir, 'the node key is only in the pointer the payee published');
    assert.ok(!/"seeds": "[0-9a-f]+"/.test(all), 'no chain key');
  }
});
