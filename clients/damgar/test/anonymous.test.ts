// Paying without one's name (decided by Nobody, allegedly, F416: "anonymity
// on MOR is a fresh identity, not a missing one"; Money, receipt field 2 and
// the claim; the payment cMIP draft 6). Alice buys Bob's vow from Damgar
// with "Pay without your name": her Damgar makes a fresh identity, its own
// home (Identity rule 4), commits it as the payer, signs the invoice request
// and the claim with it, names the refund rail she gives (claim key 7), and
// delivers its genesis with them. Bob's Damgar resolves the fresh identity
// from what was delivered, answers it, checks its claim and receipts it;
// the claim counts as the fresh identity's, and a refund owed on the
// purchase is owed to it, not to Alice. Real homes and a relay on local
// ports, test Lightning nodes, regtest satoshis. Test identities only.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { closeAll, person, start, type Relay } from './world.ts';
import { TestNode } from './node.ts';
import { SPEC } from '../src/specs.ts';
import type { Account, PaymentShown, ToSign } from '../src/shapes.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { MIRS, describeAct, hex, moneyRead, openWithKey, sha256 } from '../../genesis/src/core.ts';
import { publishVow } from '../../dub/src/vows.ts';
import { AGREEMENTS_SPECS } from '../../repo/src/agreements.ts';

let homes: Relay[];
let relay: Relay;

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
});

after(async () => {
  try {
    await closeAll();
  } finally {
    for (const h of [...homes, relay]) await h?.stop().catch(() => undefined);
  }
});

const R = SPEC.units.regtest;
const b64 = (s: string) => Uint8Array.from(Buffer.from(s, 'base64'));
const json = (dir: string, id: string, name: string) => JSON.parse(readFileSync(join(dir, 'identities', id, `${name}.json`), 'utf8'));

test('paid without your name: a fresh identity, its genesis delivered with its claim, is the payer; the refund is owed to it, not to you', async () => {
  const H = homes.map((h) => h.base);
  const RL = [relay.base];
  const alice = await person(H, RL);
  const bob = await person(H, RL);
  const node = new TestNode();
  const rv = await bob.damgar.c.ask<{ digest: string }>('rails review', { lightning: node.key, network: 3 });
  await bob.damgar.c.ask('rails publish', { lightning: node.key, network: 3, digest: rv.digest });

  // Bob sells a vow: its publication (a lone seller, his own split service) and price tag, signed with his key, as Dub signs them.
  const path = join(bob.damgar.dir, 'identities', bob.id, 'identity.json');
  const bobKey = TestIdentity.load(path);
  const sold = await publishVow(bobKey, { words: 'A seat at the reading, 3 December', title: 'A reading', price: { unit: R, value: 1500 }, offerWords: 'A vow: a seat at the reading. For 1 500 regtest satoshis.', relays: [...RL, ...H] });
  bobKey.save(path);

  // Alice pays it without her name, naming where a refund goes: a node of her wallet she does not publish.
  const refundNode = new TestNode();
  const asked = await alice.damgar.c.ask<{ key: string; lines: { text: string }[] }>('pay tag', { tag: sold.tag, payee: bob.id, anonymous: true, refund: { lightning: refundNode.key }, whatFor: 'a seat' });
  assert.ok(asked.lines.some((l) => /Without your name: a fresh identity, .* is its payer/.test(l.text)), JSON.stringify(asked.lines));
  assert.ok(asked.lines.some((l) => /carries no reputation/.test(l.text)), 'its stated cost, said');
  const kept = json(alice.damgar.dir, alice.id, 'keys').fresh as Record<string, { file: { identity: string; safety: { seeds: string }; signingSecret: string } }>;
  const [fresh] = Object.keys(kept);
  assert.ok(fresh && fresh !== alice.id, 'a fresh identity, kept in Alice’s Damgar');
  assert.equal(kept[fresh].file.safety.seeds, '', 'never its chain key: Damgar keeps none');
  assert.ok(kept[fresh].file.signingSecret, 'its signing key kept, for a refund');

  // Bob's Damgar: an invoice request from the fresh identity, resolved from the genesis delivered with it; Alice's ID nowhere in it.
  await bob.damgar.c.ask('look');
  let items = (await bob.damgar.c.ask<{ items: ToSign[] }>('to sign')).items;
  const inv = items.find((i) => i.kind === 'invoice')!;
  assert.ok(inv, `an invoice to make: ${JSON.stringify(items)}`);
  assert.equal(inv.from.id, fresh, 'the request is the fresh identity’s');
  const g = (await lookUp(fresh, [...H, ...RL])).resolution;
  assert.equal(g.links.length, 1, 'only its genesis: it is its own home');
  assert.ok(g.homes.every((h) => !h.operator), `self-hosted (Identity rule 4): ${JSON.stringify(g.homes)}`);
  const made = node.invoice(1500, inv.descriptionHash!);
  await bob.damgar.c.ask('answer invoice', { id: inv.id, invoice: made.invoice });

  // Alice: the answer reached the fresh identity, sealed to its own key; she pays; the claim is the fresh identity's.
  await alice.damgar.c.ask('look');
  const pay = (await alice.damgar.c.ask<{ payments: PaymentShown[] }>('pay')).payments;
  assert.equal(pay.length, 1, JSON.stringify(pay));
  assert.equal(pay[0].pay?.invoice, made.invoice);
  const paid = await alice.damgar.c.ask<{ lines: { text: string }[] }>('paid', { key: pay[0].key, proof: made.preimage });
  assert.ok(paid.lines.some((l) => /Signed as the fresh identity .*its genesis went with the claim.*a refund goes to the rail you gave/.test(l.text)), JSON.stringify(paid.lines));

  // Bob checks the fresh identity's claim from the rail's own evidence and signs the receipt; it reaches the fresh identity.
  await bob.damgar.c.ask('look');
  items = (await bob.damgar.c.ask<{ items: ToSign[] }>('to sign')).items;
  const rec = items.find((i) => i.kind === 'receipt');
  if (rec) await bob.damgar.c.ask('sign receipt', { key: rec.id });
  const bobs = await bob.damgar.c.ask<Account>('account');
  const inBob = bobs.payments.find((p) => p.key === pay[0].key)!;
  assert.equal(inBob.other.id, fresh, 'Bob was paid by the fresh identity');
  assert.deepEqual(inBob.proofs.map((x) => [x.kind, x.by.id, x.rail.answer, x.standing]).sort(), [['claim', fresh, 'valid', 'valid'], ['receipt', bob.id, 'valid', 'valid']]);

  await alice.damgar.c.ask('look');
  const mine = (await alice.damgar.c.ask<Account>('account')).payments.find((p) => p.key === pay[0].key)!;
  assert.equal(mine.stage, 'settled', JSON.stringify(mine));
  assert.ok(mine.lines.some((l) => /Paid without your name, as the fresh identity .*a refund owed on it is owed to that identity, not to you/.test(l.text)), JSON.stringify(mine.lines));
  assert.deepEqual(mine.proofs.map((x) => [x.kind, x.by.id, x.rail.answer]).sort(), [['claim', fresh, 'valid'], ['receipt', bob.id, 'valid']]);

  // The seller's side, read by the core from what Bob's Damgar holds: the claim signed by the fresh identity, naming the
  // refund rail Alice gave; the purchase's refund owed to the fresh identity, never to Alice.
  const book = json(bob.damgar.dir, bob.id, 'book') as { payments: Record<string, { claims: string[]; receipts: string[] }>; acts: Record<string, { act: string; key?: string }> };
  const p = book.payments[pay[0].key];
  const l = await lookUp(bob.id, H);
  for (const h of [...RL, ...H]) {
    const page = await relayAt(h).feed({ signer: bob.id });
    for (const it of page.items) {
      if (it.kind !== 'act') continue;
      try {
        l.verifier.add(it.item);
      } catch {
        // private: not read here
      }
    }
  }
  // The fresh identity resolved from its genesis as delivered (at Bob's inbox), and nothing else.
  const genesis = await relayAt(RL[0]).getAct(fresh);
  assert.ok(genesis, 'its genesis was delivered where Bob reads');
  l.verifier.add(genesis!);
  const held = [...p.claims, ...p.receipts].map((id) => ({ id, ...book.acts[id] }));
  for (const x of held) l.verifier.addWithKey(b64(x.act), b64(x.key!));
  const claim = held.find((x) => p.claims.includes(x.id))!;
  const cd = openWithKey(b64(claim.act), b64(claim.key!)) as { signer: string; payload: Uint8Array };
  assert.equal(cd.signer, fresh, 'the claim is the fresh identity’s');
  const c = (moneyRead(3, cd.payload) as { act: { refund?: { module: string } | null; proof: Uint8Array } }).act;
  assert.equal(c.refund?.module, SPEC.lightning.hash, 'it names the refund rail Alice gave (key 7)');
  const ptr = (l.verifier.moneyPointer(MIRS.money, bob.id) as { act: string }).act;
  const payment = sha256('the one Lightning payment');
  const specs = { ...AGREEMENTS_SPECS, rails: [hex(SPEC.lightning.content)], railValid: held.map((x) => [x.id, ptr, null]), railPayments: [[hex(new Uint8Array(c.proof)), payment]] };
  const receipt = held.find((x) => p.receipts.includes(x.id))!;
  const rd = (moneyRead(2, (openWithKey(b64(receipt.act), b64(receipt.key!)) as { payload: Uint8Array }).payload) as { act: { payer: string | null } }).act;
  assert.equal(rd.payer, fresh, 'Bob’s receipt names the fresh identity as payer (field 2)');
  const purchase = l.verifier.agreementsPurchase(specs, claim.id) as { verdict: string; refundTo: string | null };
  assert.equal(purchase.verdict, 'purchase', JSON.stringify(purchase));
  assert.equal(purchase.refundTo, fresh, 'a refund owed on it is owed to the fresh identity');
  assert.notEqual(purchase.refundTo, alice.id);
  // Alice's own identity signed nothing of this payment.
  for (const x of held) assert.notEqual((describeAct(b64(x.act)) as { signer: string }).signer, alice.id);
});
