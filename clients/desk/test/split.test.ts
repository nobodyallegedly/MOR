// Round 3, part C: the split service, defined in Edubba's Collectives tab
// and running as a test service of its own (`clients/split-service`).
//
// The cast (A, iPa, iPh), each made in Dub and brought into their own
// Damgar, A also into Edubba, found a collective from the grid. A proposes
// the collective's money: its stake in itself (A 50%, iPa 30%, iPh 20%), a
// split plan with a referral share of 10% off the top, a split service
// (whose grant key the service made), and every member signs it in Dub;
// Edubba records it and points the collective's payee pointer at the
// service. A publishes a sealed text as the collective. A reposter reposts
// it; a buyer, reading only the reposter, buys it from Dub through the
// repost: the invoice request goes to the split service (the money messages
// cMIP, draft 4), which answers with its node's invoice; the buyer pays;
// the service signs the receipt with the collective's grant key, reads the
// buyer's claim (its referral), publishes the split (300 to the reposter,
// then 1 350, 810 and 540), and pays each one; each member's Damgar
// answers and receipts by itself; A's Edubba, told of the sale, delivers
// the key as the collective; the text opens in the buyer's Dub.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { closeAll, edubba, person, start, testLink, type Relay } from '../../damgar/test/world.ts';
import { TestNode } from '../../damgar/test/node.ts';
import { SPEC } from '../../damgar/src/specs.ts';
import type { Account, PaymentShown, ToSign } from '../../damgar/src/shapes.ts';
import { SplitService, type Node } from '../../split-service/src/service.ts';
import { foundCollective } from './cast.ts';
import type { Done } from '../src/page/api.ts';

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
const b64 = (b: Uint8Array) => Buffer.from(b).toString('base64');

/** The test's wallets: every invoice any test node issued, paid by learning its preimage. */
const wallets: Map<string, string>[] = [];
const pay = (invoice: string) => {
  for (const w of wallets) if (w.has(invoice)) return w.get(invoice)!;
  throw new Error('an invoice no test node issued');
};

/** Someone paid on Lightning (an identity made in Dub, brought into its Damgar), its Damgar answering and receipting by itself. */
async function paidPerson(H: string[], RL: string[]) {
  const node = new TestNode();
  const link = testLink(node);
  wallets.push(link.preimages);
  const p = await person(H, RL, { link: link.factory });
  const rv = await p.damgar.c.ask<{ digest: string }>('rails review', { lightning: node.key, network: 3 });
  await p.damgar.c.ask('rails publish', { lightning: node.key, network: 3, digest: rv.digest });
  await p.damgar.c.ask('link', link.config);
  const own = await p.damgar.c.ask<{ digest: string }>('own lane review', { role: 'receipts', cap: '50000', unit: R });
  await p.damgar.c.ask('own lane', { role: 'receipts', cap: '50000', unit: R, digest: own.digest });
  return p;
}

/** The service's node: its own invoices, settled once the buyer's wallet pays; paying a holder's invoice from the wallets. */
function serviceNode(): Node & { paid: Map<string, string> } {
  const n = new TestNode();
  const hashOf = new Map<string, string>();
  const paid = new Map<string, string>();
  wallets.push(new Map());
  const mine = wallets[wallets.length - 1];
  return {
    paid,
    async nodeKey() {
      return n.key;
    },
    async addInvoice(sat, descriptionHash) {
      const i = n.invoice(sat, descriptionHash);
      const hash = [...n.preimages.keys()].pop()!;
      hashOf.set(i.invoice, hash);
      mine.set(i.invoice, i.preimage);
      return { invoice: i.invoice, hash };
    },
    async settled(hash) {
      return paid.get(hash) ?? null;
    },
    async pay(invoice) {
      return pay(invoice);
    },
    // The buyer's wallet paid this invoice: the node sees it settled.
    markPaid(invoice: string) {
      paid.set(hashOf.get(invoice)!, mine.get(invoice)!);
    },
  } as Node & { paid: Map<string, string>; markPaid(invoice: string): void };
}

test('the split service: defined in Edubba, signed by every member in Dub; a buyer pays through a repost; the service receipts with the grant key, splits by the plan and pays each one; the key delivered by A’s Edubba as the collective', async () => {
  const H = homes.map((h) => h.base);
  const RL = [relay.base];
  const [A, iPa, iPh] = [await paidPerson(H, RL), await paidPerson(H, RL), await paidPerson(H, RL)];
  const e = await edubba(H, RL);
  await e.c.ask('bring', { name: 'A', id: A.id, words: A.dub.words, address: H[0] });
  const { collective } = await foundCollective(e, A.id, [iPa.dub, iPh.dub], [
    { name: 'Publishing', layer: 1, holders: [A.id, iPa.id, iPh.id], number: 1 },
    { name: 'Offers and deals', layer: 3, holders: [A.id, iPa.id], number: 1 },
  ]);

  // The split service, its own identity and node; its grant key for this collective.
  const node = serviceNode();
  const svc = new SplitService(join(mkdtempSync(join(tmpdir(), 'split-')), 'svc'), node, { homes: H, relays: RL });
  await svc.start();
  const key = svc.grantKey(collective);

  // The collective's money, read back, proposed, signed by every member in Dub, recorded.
  const review = await e.c.ask<any>('real money prepare', { collective, shares: { [A.id]: 50, [iPa.id]: 30, [iPh.id]: 20 }, referral: 10, service: svc.id, serviceKey: key, keepers: [], keepersNeeded: 1 });
  assert.deepEqual(review.reading.blocking, []);
  const said = review.reading.sections.map((s: any) => `${s.heading}: ${s.lines.map((l: any) => l.text).join(' ')}`).join('\n');
  assert.match(said, /Who owns its income.*50%.*30%.*20%/s);
  assert.match(said, /Off the top: a referral share of 10%/);
  assert.match(said, /Who divides it/);
  const bad = await e.c.ask<any>('real money prepare', { collective, shares: { [A.id]: 50, [iPa.id]: 30, [iPh.id]: 10 }, referral: 10, service: svc.id, serviceKey: key, keepers: [], keepersNeeded: 1 });
  assert.ok(bad.reading.blocking.some((b: string) => /add up to 90%/.test(b)), JSON.stringify(bad.reading.blocking));
  const proposed = await e.c.ask<Done>('real confirm', { plan: review.plan, digest: review.digest });
  const clone = proposed.acts[0];
  await assert.rejects(e.c.ask('real money record', { act: clone }), /Every member signs it first/);
  for (const m of [iPa, iPh]) {
    const p = (await m.dub.c.ask<any>('proposals')).proposals.find((x: any) => x.act === clone);
    assert.ok(p, 'the money clone reached the member’s Signing tab');
    await m.dub.c.ask('accept', { thread: p.thread });
  }
  assert.equal((await e.c.ask<any>('real gather', { act: clone })).standing.enough, true);
  const rec = await e.c.ask<Done>('real money record', { act: clone });
  assert.ok(rec.lines.some((l) => /payee pointer now leads to the split service/.test(l.text)), JSON.stringify(rec.lines));
  assert.ok((await svc.tick()).some((t) => /grant .* accepted/.test(t)), 'the service accepts the collective’s grant');

  // A publishes a sealed text as the collective.
  await e.c.ask('publishing act as', { id: collective });
  const w = await e.c.ask<any>('publishing work read', { media: 'text', data: b64(new TextEncoder().encode('Three verses, by three hands.')), title: 'Verses, by the collective', price: '3000' });
  assert.deepEqual(w.reading.blocking, []);
  const [publication, , post] = (await e.c.ask<Done>('publishing confirm', { plan: w.plan, digest: w.digest })).acts;

  // A reposter reposts it; a buyer, following only the reposter, buys it through the repost, under Dub's lane.
  const reposter = await paidPerson(H, RL);
  await reposter.dub.c.ask('follow', { id: collective, name: 'Three tablets' });
  assert.ok((await reposter.dub.c.ask<{ items: any[] }>('feed', { fresh: true })).items.find((i) => i.id === post), 'the collective’s post in the reposter’s feed');
  const rp = await reposter.dub.c.ask<{ id: string }>('repost', { post, signer: collective });
  const buyer = await person(H, RL);
  await buyer.dub.c.ask('lane ask', { label: 'Dub', cap: '5000', unit: R });
  await buyer.damgar.c.ask('look');
  const lane = (await buyer.damgar.c.ask<{ items: ToSign[] }>('to sign')).items.find((i) => i.kind === 'lane')!;
  await buyer.damgar.c.ask('grant lane', { id: lane.id });
  await buyer.dub.c.ask('follow', { id: reposter.id, name: 'Critic' });
  const seen = (await buyer.dub.c.ask<{ items: any[] }>('feed', { fresh: true })).items.find((i) => i.id === rp.id)!;
  assert.equal(seen.sealed.state, 'for sale');
  const bought = await buyer.dub.c.ask<{ lines: { text: string }[] }>('buy', { publication, seller: collective, repost: rp.id, reposter: reposter.id });
  assert.ok(bought.lines.some((l) => /split service, .* which answers for it/.test(l.text)), JSON.stringify(bought.lines));

  // The service answers with its node's invoice; the buyer pays it in the wallet.
  assert.ok((await svc.tick()).some((t) => /An invoice of its node sent/.test(t)));
  await buyer.damgar.c.ask('look');
  const pays = (await buyer.dub.c.ask<{ payments: PaymentShown[] }>('payments')).payments;
  assert.equal(pays.length, 1);
  const invoice = pays[0].pay!.invoice!;
  (node as unknown as { markPaid(i: string): void }).markPaid(invoice);
  await buyer.dub.c.ask('paid', { key: pays[0].key, proof: pay(invoice) });

  // The service: the receipt with the grant key, the buyer's claim and its referral, the split, the sale told, the payouts asked.
  const t1 = (await svc.tick()).join(' | ');
  assert.match(t1, /its receipt signed with .* grant key/);
  assert.match(t1, /naming the repost by/);
  assert.match(t1, /Split .*: 300 to .* \(referral\), 1350 to .*, 810 to .*, 540 to/);
  assert.match(t1, /The sale told to 3 parties/);
  // Each payee's Damgar answers its payout's invoice request by itself; the service pays each; each Damgar receipts by itself.
  for (const m of [A, iPa, iPh, reposter]) assert.ok((await m.damgar.c.ask<{ lines: { text: string }[] }>('look')).lines.some((l) => /Damgar answered by itself, with an invoice your node made/.test(l.text)));
  const t2 = (await svc.tick()).join(' | ');
  assert.equal((t2.match(/Paid \d+ to/g) ?? []).length, 4, t2);
  for (const [m, value] of [[A, 1350], [iPa, 810], [iPh, 540], [reposter, 300]] as const) {
    await m.damgar.c.ask('look');
    const acc = await m.damgar.c.ask<Account>('account');
    const got = acc.payments.find((x) => x.side === 'in' && x.other.id === svc.id);
    assert.ok(got, `a payout reached ${m.id.slice(0, 8)}`);
    assert.equal(got!.amount.value, value);
    assert.ok(got!.proofs.some((x) => x.kind === 'receipt' && x.rail.answer === 'valid'), `${m.id.slice(0, 8)} receipted it: ${JSON.stringify(got!.proofs)}`);
  }

  // A's Edubba, told of the sale, delivers the key as the collective; the text opens in the buyer's Dub.
  const d = await e.c.ask<{ lines: { text: string }[] }>('publishing deliver');
  assert.ok(d.lines.some((l) => /delivered to .*, as the collective/.test(l.text)), JSON.stringify(d.lines));
  const arrived = await buyer.dub.c.ask<{ lines: { text: string }[] }>('money look');
  assert.ok(arrived.lines.some((l) => /arrived from its seller/.test(l.text)), JSON.stringify(arrived.lines));
  const opened = (await buyer.dub.c.ask<{ items: any[] }>('feed', { fresh: true })).items.find((i) => i.id === rp.id)!;
  assert.equal(opened.sealed.state, 'opened');
  assert.equal(opened.sealed.text, 'Three verses, by three hands.');
});
