// Round 3, part C: the split service, defined in Edubba's Collectives tab
// and running as a test service of its own (`clients/split-service`).
//
// The cast (A, iPa, iPh), each made in Dub and brought into their own
// Damgar, A also into Edubba, found a collective from the grid. A proposes
// the collective's money: its stake in itself (A 50%, iPa 30%, iPh 20%), a
// split plan with a referral share of 10% off the top, a split service
// (whose grant key the service made), and every member signs it in Dub;
// Edubba records it and points the collective's payee pointer at the
// service: signed with A's own key in its Money area (A and iPa, two keys;
// Money draft 10, rule 7, F358), iPa asked for theirs in Dub; until iPa
// signs, a buyer's payment cannot reach the service. A publishes a sealed text as the collective. A reposter reposts
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
import { kindsFor } from '../src/grid.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { MIRS } from '../../genesis/src/core.ts';
import { allBy } from '../../grants/src/grant.ts';
import { collectivePointer } from '../../grants/src/member.ts';
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

test('the collective’s money on the new Money tab: its split agreement made by A for the collective, signed by the service, recorded; its payee pointer asks two keys; the collective’s own publication of a work, its price tag the service’s; a buyer pays through a repost; the service receipts in its own name, splits by the shares in force and pays each one; the key delivered by A’s Edubba as the collective', async () => {
  // Round 8 (F407), premises replaced, said here as the brief asks: the collective's money is no longer a clone of its agreement
  // carrying shares, a split plan and the service's grant key (terms fields 8, 14, 28, 29 withdrawn; no grant key, rule 16). Its
  // shares are set at its founding; its money is a split agreement (a publication selling nothing, owners its founding agreement)
  // the service signs; its payee pointer then names the service. A work of the collective is sold by the collective's own
  // publication (owners its founding agreement, the same service), its price tag the service's: a buyer pays the service, never the
  // collective's pointer, so the old "cannot be paid until the pointer has its two keys" now asserts the pointer alone.
  // Finer areas in the cast (kinds named) keep each act's consent readable (the WebAssembly lane-id note).
  const H = homes.map((h) => h.base);
  const RL = [relay.base];
  const [A, iPa, iPh] = [await paidPerson(H, RL), await paidPerson(H, RL), await paidPerson(H, RL)];
  const e = await edubba(H, RL);
  await e.c.ask('bring', { name: 'A', id: A.id, words: A.dub.words, address: H[0] });
  // Every kind of the layer a finer area can reach (a record, the collective's everyday line, is never in an area's reach).
  const all = (l: number) => kindsFor(l).filter((k) => !(l === 4 && k.type === 17)).map((k) => `${k.spec}:${k.type}`);
  const { collective } = await foundCollective(
    e,
    A.id,
    [iPa.dub, iPh.dub],
    [
      { name: 'Publishing', layer: [1, 2], holders: [A.id, iPa.id, iPh.id], number: 1 },
      { name: 'Publications', layer: 4, holders: [A.id, iPa.id], number: 2 },
      { name: 'Money', layer: 3, holders: [A.id, iPa.id], number: 2, kinds: all(3) },
    ],
    { shares: { [A.id]: 50, [iPa.id]: 30, [iPh.id]: 20 } },
  );

  // The split service, its own identity and node.
  const node = serviceNode();
  const svc = new SplitService(join(mkdtempSync(join(tmpdir(), 'split-')), 'svc'), node, { homes: H, relays: RL });
  await svc.start();

  // The collective's money, read back: its shares from its constitution, a referral off the top, the service.
  const review = await e.c.ask<any>('real money prepare', { collective, way: 'service', referral: 10, service: svc.id });
  assert.deepEqual(review.reading.blocking, []);
  const said = review.reading.sections.map((s: any) => `${s.heading}: ${s.lines.map((l: any) => l.text).join(' ')}`).join('\n');
  assert.match(said, /Who owns it.*50%.*30%.*20%/s);
  assert.match(said, /Off the top: a referral share of 10%/);
  const bad = await e.c.ask<any>('real money prepare', { collective, way: 'service', referral: 10, service: iPh.id });
  assert.ok(bad.reading.blocking.some((b: string) => /separate identity, not a member/.test(b)), JSON.stringify(bad.reading.blocking));
  const made = await e.c.ask<Done>('real confirm', { plan: review.plan, digest: review.digest });
  const split = made.acts[0];
  await assert.rejects(e.c.ask('real money record', { act: split }), /Its rule asks more members first/);
  // A split agreement of the collective is judged in its judicial tier (S7h-4): every member signs it, iPa and iPh
  // each in Dub's Signing tab, with their own key.
  for (const m of [iPa, iPh]) {
    const sp = (await m.dub.c.ask<any>('proposals')).proposals.find((x: any) => x.act === split);
    assert.ok(sp, 'the split agreement reached the member’s Signing tab');
    assert.match((await m.dub.c.ask<any>('accept', { thread: sp.thread })).lines[0].text, /Signed for the collective with your own key/);
  }
  assert.equal((await e.c.ask<any>('real gather', { act: split })).standing.enough, true);
  await assert.rejects(e.c.ask('real money record', { act: split }), /does not count yet/);
  assert.match(await svc.accept(split), /signed/);
  const rec = await e.c.ask<Done>('real money record', { act: split });
  assert.ok(rec.lines.some((l) => /payee pointer now names the split service .*made by A .*own key under “Money”/.test(l.text)), JSON.stringify(rec.lines));
  assert.ok(rec.lines.some((l) => /asks 2: .* is asked/.test(l.text)), JSON.stringify(rec.lines));
  const pointer = rec.acts[1];
  // F358: the pointer is made with a member's key for the collective: a Money-only reader shows no pointer; Agreements count it only with the area's two.
  const H_ = [...H, ...RL];
  const reader = await lookUp(collective, H_);
  for (const a of await allBy(collective, H_, {})) {
    try {
      reader.verifier.add(a);
    } catch {
      // held
    }
  }
  assert.equal((reader.verifier.moneyPointer(MIRS.money, collective) as { act?: string | null }).act ?? null, null, 'a Money-only reader reads no pointer of the collective');
  assert.equal((await collectivePointer(collective, H_))!.pointer, null, 'one key of two: no pointer in force');
  // iPa signs the pointer in Dub's Signing tab, with iPa's own key: it is the collective's pointer.
  const ask = (await iPa.dub.c.ask<any>('proposals')).proposals.find((x: any) => x.act === pointer);
  assert.ok(ask, 'the pointer reached iPa’s Signing tab');
  const read = JSON.stringify(ask.reading);
  assert.match(read, /Sign a money act of the collective: pointer/);
  assert.match(read, /Where payments to the collective go from now on/);
  assert.match((await iPa.dub.c.ask<any>('accept', { thread: ask.thread })).lines[0].text, /Signed for the collective with your own key/);
  assert.equal((await collectivePointer(collective, H_))!.pointer, pointer, 'with iPa’s key, the area’s two');

  // A uploads a text for the collective (way 1), then the collective's own publication of it (way 4), A's act alone under “Publications”.
  await e.c.ask('publishing act as', { id: collective });
  const up = await e.c.ask<any>('publishing upload read', { media: 'text', data: b64(new TextEncoder().encode('Three verses, by three hands.')), title: 'Verses, by the collective', then: 'none' });
  assert.deepEqual(up.reading.blocking, []);
  const [bake] = (await e.c.ask<Done>('publishing confirm', { plan: up.plan, digest: up.digest })).acts;
  const pr = await e.c.ask<any>('publishing publication read', { sold: [bake], service: svc.id, referral: '10', price: '3000', tagBy: 'service' });
  assert.deepEqual(pr.reading.blocking, []);
  assert.match(pr.reading.summary.join(' '), /Sold by the collective .*, made by you \(A .*\) with your own key for it, under the Agreements layer/);
  const [publication] = (await e.c.ask<Done>('publishing confirm', { plan: pr.plan, digest: pr.digest })).acts;
  assert.match(await svc.accept(publication), /signed, as its split service/);
  // The Agreements layer asks two (A and iPa): iPa signs the collective's publication in Dub's Signing tab, with iPa's own key.
  let pp: any;
  for (let i = 0; i < 20 && !pp; i++) {
    pp = (await iPa.dub.c.ask<any>('proposals')).proposals.find((x: any) => x.act === publication);
    if (!pp) await new Promise((r) => setTimeout(r, 250));
  }
  assert.ok(pp, 'the publication in iPa’s Signing tab');
  assert.match((await iPa.dub.c.ask<any>('accept', { thread: pp.thread })).lines[0].text, /Signed for the collective with your own key/);
  const g = await e.c.ask<{ lines: { text: string }[] }>('publishing gather');
  assert.ok(g.lines.some((l) => /is published by the collective .*: every party signed it/.test(l.text)), JSON.stringify(g.lines));
  assert.match(await svc.tag(publication, { unit: R, value: 3000 }), /./);
  const post = (await e.c.ask<any>('publishing')).publications.find((x: any) => x.id === publication).post;

  // A reposter reposts it; a buyer, following only the reposter, buys it through the repost, under Dub's lane.
  const reposter = await paidPerson(H, RL);
  await reposter.dub.c.ask('follow', { id: A.id, name: 'A' });
  assert.ok((await reposter.dub.c.ask<{ items: any[] }>('feed', { fresh: true })).items.find((i) => i.id === post), 'the collective’s post in the reposter’s feed');
  const rp = await reposter.dub.c.ask<{ id: string }>('repost', { post, signer: A.id });
  const buyer = await person(H, RL);
  await buyer.dub.c.ask('lane ask', { label: 'Dub', cap: '5000', unit: R });
  await buyer.damgar.c.ask('look');
  const lane = (await buyer.damgar.c.ask<{ items: ToSign[] }>('to sign')).items.find((i) => i.kind === 'lane')!;
  await buyer.damgar.c.ask('grant lane', { id: lane.id });
  await buyer.dub.c.ask('follow', { id: reposter.id, name: 'Critic' });
  const seen = (await buyer.dub.c.ask<{ items: any[] }>('feed', { fresh: true })).items.find((i) => i.id === rp.id)!;
  assert.equal(seen.sealed.state, 'for sale');
  assert.equal(seen.sealed.through?.publication, publication, JSON.stringify(seen.sealed));
  const bought = await buyer.dub.c.ask<{ lines: { text: string }[] }>('buy', { publication: bake, seller: A.id, repost: rp.id, reposter: reposter.id });
  assert.ok(bought.lines.some((l) => /Through the publication where you found it/.test(l.text)), JSON.stringify(bought.lines));

  // The service answers with its node's invoice; the buyer pays it in the wallet.
  assert.ok((await svc.tick()).some((t) => /An invoice of its node sent/.test(t)));
  await buyer.damgar.c.ask('look');
  const pays = (await buyer.dub.c.ask<{ payments: PaymentShown[] }>('payments')).payments;
  assert.equal(pays.length, 1);
  const invoice = pays[0].pay!.invoice!;
  (node as unknown as { markPaid(i: string): void }).markPaid(invoice);
  await buyer.dub.c.ask('paid', { key: pays[0].key, proof: pay(invoice) });

  // The service: the receipt in its own name, the buyer's claim and its referral, the split by the shares in force, the sale told, the payouts asked.
  const t1 = (await svc.tick()).join(' | ');
  assert.match(t1, /its receipt signed in the service’s own name/);
  assert.match(t1, /naming the repost by/);
  assert.match(t1, /Split .*: 300 to .* \(referral\)/, t1);
  for (const v of [1350, 810, 540]) assert.match(t1, new RegExp(`Split .*${v} to`), t1);
  assert.match(t1, /The sale told to/);
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

  // A's Edubba, told of the sale by the service, delivers the key as the collective; the text opens in the buyer's Dub.
  const d = await e.c.ask<{ lines: { text: string }[] }>('publishing deliver');
  assert.ok(d.lines.some((l) => /delivered to .*, as the collective/.test(l.text)), JSON.stringify(d.lines));
  const arrived = await buyer.dub.c.ask<{ lines: { text: string }[] }>('money look');
  assert.ok(arrived.lines.some((l) => /arrived from its seller/.test(l.text)), JSON.stringify(arrived.lines));
  const opened = (await buyer.dub.c.ask<{ items: any[] }>('feed', { fresh: true })).items.find((i) => i.id === rp.id)!;
  assert.equal(opened.sealed.state, 'opened');
  assert.equal(opened.sealed.text, 'Three verses, by three hands.');
});

// Way 4 as a lone seller (round 8, F407; replacing the judged referral's
// one-party deal, whose terms carried the split plan and the payee grant,
// fields 8 and 14, now withdrawn): A uploads a text (way 1, stopping at the
// upload) and builds a publication of it with no ownership agreement (a lone
// seller's publication, A its only owner), a referral role of 20% and a
// split service, which signs it in its own app and puts its price tag on it.
// A reposter reposts the post announcing it; a buyer, following only the
// reposter, buys through the repost: the service receipts in its own name,
// pays 200 to the reposter and 800 to A; A's Edubba, told of the sale by the
// service, delivers the key.
test('way 4 as a lone seller: a publication with a referral share, paid by its split service; bought through a repost; the key delivered by the uploader’s Edubba', async () => {
  const H = homes.map((h) => h.base);
  const RL = [relay.base];
  const A = await paidPerson(H, RL);
  const e = await edubba(H, RL);
  await e.c.ask('bring', { name: 'A', id: A.id, words: A.dub.words, address: H[0] });
  const node = serviceNode();
  const svc = new SplitService(join(mkdtempSync(join(tmpdir(), 'split-')), 'svc'), node, { homes: H, relays: RL });
  await svc.start();

  const up = await e.c.ask<any>('publishing upload read', { media: 'text', data: b64(new TextEncoder().encode('A short story, sold through a publication.')), title: 'A story', then: 'none' });
  const [bake] = (await e.c.ask<Done>('publishing confirm', { plan: up.plan, digest: up.digest })).acts;
  const w = await e.c.ask<any>('publishing publication read', { owners: '', sold: [bake], service: svc.id, referral: '20', price: '1000', tagBy: 'service' });
  assert.deepEqual(w.reading.blocking, []);
  const said = JSON.stringify(w.reading);
  assert.match(said, /Sold by you alone: a lone seller’s publication, you its only owner/);
  assert.match(said, /Off the top: 20% of each payment to whoever reposted it/);
  const [publication] = (await e.c.ask<Done>('publishing confirm', { plan: w.plan, digest: w.digest })).acts;
  assert.match(await svc.accept(publication), /signed, as its split service/);
  const g = await e.c.ask<{ lines: { text: string }[] }>('publishing gather');
  assert.ok(g.lines.some((l) => /is published: every party signed it/.test(l.text)), JSON.stringify(g.lines));
  assert.match(await svc.tag(publication, { unit: R, value: 1000 }), /./);
  const post = (await e.c.ask<any>('publishing')).publications.find((x: any) => x.id === publication).post;

  // A reposter reposts it; a buyer, following only the reposter, buys through the repost.
  const reposter = await paidPerson(H, RL);
  await reposter.dub.c.ask('follow', { id: A.id, name: 'A' });
  assert.ok((await reposter.dub.c.ask<{ items: any[] }>('feed', { fresh: true })).items.find((i) => i.id === post));
  const rp = await reposter.dub.c.ask<{ id: string }>('repost', { post, signer: A.id });
  const buyer = await person(H, RL);
  await buyer.dub.c.ask('lane ask', { label: 'Dub', cap: '5000', unit: R });
  await buyer.damgar.c.ask('look');
  const lane = (await buyer.damgar.c.ask<{ items: ToSign[] }>('to sign')).items.find((i) => i.kind === 'lane')!;
  await buyer.damgar.c.ask('grant lane', { id: lane.id });
  await buyer.dub.c.ask('follow', { id: reposter.id, name: 'Critic' });
  await buyer.dub.c.ask('feed', { fresh: true });
  const bought = await buyer.dub.c.ask<{ lines: { text: string }[] }>('buy', { publication: bake, seller: A.id, repost: rp.id, reposter: reposter.id });
  assert.ok(bought.lines.some((l) => /Through the publication where you found it/.test(l.text)), JSON.stringify(bought.lines));

  assert.ok((await svc.tick()).some((t) => /An invoice of its node sent/.test(t)));
  await buyer.damgar.c.ask('look');
  const pays = (await buyer.dub.c.ask<{ payments: PaymentShown[] }>('payments')).payments;
  const invoice = pays[0].pay!.invoice!;
  (node as unknown as { markPaid(i: string): void }).markPaid(invoice);
  await buyer.dub.c.ask('paid', { key: pays[0].key, proof: pay(invoice) });

  const said2: string[] = [];
  for (let i = 0; i < 6; i++) {
    said2.push(...(await svc.tick()));
    for (const m of [A, reposter]) await m.damgar.c.ask('look');
  }
  const t = said2.join(' | ');
  assert.match(t, /Split .*: 200 to .* \(referral\), 800 to/, t);
  for (const [m, value] of [[A, 800], [reposter, 200]] as const) {
    const got = (await m.damgar.c.ask<Account>('account')).payments.find((x) => x.side === 'in' && x.other.id === svc.id);
    assert.equal(got?.amount.value, value);
  }

  // A's Edubba, told of the sale by the service, delivers the key; the text opens in the buyer's Dub.
  const d = await e.c.ask<{ lines: { text: string }[] }>('publishing deliver');
  assert.ok(d.lines.some((l) => /a sale its publication’s split service receipted/.test(l.text)), JSON.stringify(d.lines));
  await buyer.dub.c.ask('money look');
  const opened = (await buyer.dub.c.ask<{ items: any[] }>('feed', { fresh: true })).items.find((i) => i.id === rp.id)!;
  assert.equal(opened.sealed.state, 'opened');
  assert.equal(opened.sealed.text, 'A short story, sold through a publication.');
});
