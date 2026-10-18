// A pay-per-view post and its referral (round 2; film 3: "a critic is paid
// when a buyer names the repost they followed"; F351). Set up as Nobody,
// allegedly asked: the seller's acts at one relay; the reposter at both;
// the buyer only at the other, so the buyer finds the work only through the
// repost. The post is sealed with a price, its offer's words promising the
// reposter 10%; the buyer pays it from Dub through Dub's lane, naming the
// repost; the seller's Damgar signs the receipt by itself and tells the
// seller's Dub, which delivers the key; the post opens in the buyer's Dub;
// the seller's Damgar prepares the referral share and asks for it under its
// referral lane, the reposter's Damgar answers and receipts by itself.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { closeAll, person, start, testLink, type Relay } from './world.ts';
import { TestNode } from './node.ts';
import type { Account, PaymentShown, ToSign } from '../src/shapes.ts';
import { SPEC } from '../src/specs.ts';
import { relayAt } from '../../genesis/src/transport.ts';

let homes: Relay[];
let one: Relay;
let other: Relay;

before(async () => {
  homes = [await start('home'), await start('home')];
  one = await start('relay');
  other = await start('relay');
});

after(async () => {
  await closeAll();
  for (const h of [...homes, one, other]) await h.stop();
});

const R = SPEC.units.regtest;

/** Where a person is paid, a receive-only link, and Damgar's own lanes. */
async function paidBy(p: Awaited<ReturnType<typeof person>>, node: TestNode, link: ReturnType<typeof testLink>, payouts = false) {
  const rv = await p.damgar.c.ask<{ digest: string }>('rails review', { lightning: node.key, network: 3 });
  await p.damgar.c.ask('rails publish', { lightning: node.key, network: 3, digest: rv.digest });
  await p.damgar.c.ask('link', link.config);
  const own = await p.damgar.c.ask<{ digest: string }>('own lane review', { role: 'receipts', cap: '50000', unit: R });
  await p.damgar.c.ask('own lane', { role: 'receipts', cap: '50000', unit: R, digest: own.digest });
  if (payouts) {
    const po = await p.damgar.c.ask<{ digest: string }>('own lane review', { role: 'payouts', cap: '500', unit: R });
    await p.damgar.c.ask('own lane', { role: 'payouts', cap: '500', unit: R, digest: po.digest });
  }
}

test('a sealed post sold through a repost on another relay: paid from Dub, the key delivered on the receipt, opened in Dub; the reposter paid the referral share', async () => {
  const H = homes.map((h) => h.base);
  const sNode = new TestNode();
  const qNode = new TestNode();
  const sLink = testLink(sNode);
  const qLink = testLink(qNode);
  const seller = await person(H, [one.base], { link: sLink.factory });
  const reposter = await person(H, [one.base, other.base], { link: qLink.factory });
  const buyer = await person(H, [other.base]);
  await paidBy(seller, sNode, sLink, true);
  await paidBy(reposter, qNode, qLink);

  // The buyer's lane, asked in Dub, granted in Damgar.
  await buyer.dub.c.ask('lane ask', { label: 'Dub on the Mac', cap: '2000', unit: R });
  await buyer.damgar.c.ask('look');
  const lane = (await buyer.damgar.c.ask<{ items: ToSign[] }>('to sign')).items.find((i) => i.kind === 'lane')!;
  await buyer.damgar.c.ask('grant lane', { id: lane.id });

  // The seller seals a post with a price; its offer promises 10% to the repost a buyer names.
  const sold = await seller.dub.c.ask<{ post: string; lines: { text: string }[] }>('sell', { text: 'The recipe: two parts clay, one part reed.', teaser: 'A recipe, sealed.', value: '1000', unit: R, referral: '10' });
  assert.match(sold.lines[0].text, /Posted, sealed: 1 000 regtest satoshis/);

  // The reposter, at both relays, follows the seller and reposts it.
  await reposter.dub.c.ask('follow', { id: seller.id, name: 'Seller' });
  const qFeed = (await reposter.dub.c.ask<{ items: any[] }>('feed', { fresh: true })).items;
  const original = qFeed.find((i) => i.id === sold.post)!;
  assert.equal(original.sealed?.state, 'for sale');
  assert.equal(original.sealed?.price, '1 000 regtest satoshis');
  assert.match(original.sealed?.words, /Referral: 10% of the price to the repost the buyer names\./);
  assert.equal(original.sealed?.text, null, 'sealed: its text is not shown');
  const rp = await reposter.dub.c.ask<{ id: string }>('repost', { post: sold.post, signer: seller.id });

  // The buyer reads only the other relay: the original is not there, the repost is.
  assert.equal(await relayAt(other.base).getAct(sold.post), null, 'the original post is not at the buyer’s relay');
  await buyer.dub.c.ask('follow', { id: reposter.id, name: 'Critic' });
  const bFeed = (await buyer.dub.c.ask<{ items: any[] }>('feed', { fresh: true })).items;
  const seen = bFeed.find((i) => i.id === rp.id)!;
  assert.ok(seen, 'the repost is in the buyer’s feed');
  assert.equal(seen.repost?.of.id, seller.id);
  assert.equal(seen.sealed?.state, 'for sale');

  // Bought from Dub, through its lane, naming the repost followed.
  const bought = await buyer.dub.c.ask<{ lines: { text: string }[] }>('buy', { publication: seen.sealed.publication, seller: seller.id, repost: rp.id, reposter: reposter.id });
  assert.ok(bought.lines.some((l) => /name the repost you followed/.test(l.text)));
  await seller.damgar.c.ask('look');
  const pays = (await buyer.dub.c.ask<{ payments: PaymentShown[] }>('payments')).payments;
  assert.equal(pays.length, 1);
  await buyer.dub.c.ask('paid', { key: pays[0].key, proof: sLink.preimages.get(pays[0].pay!.invoice!)! });

  // The seller's Damgar signs the receipt by itself, tells the seller's Dub of the sale, and prepares the referral share.
  const sl = await seller.damgar.c.ask<{ lines: { text: string }[] }>('look');
  const said = sl.lines.map((l) => l.text).join(' | ');
  assert.match(said, /signed your receipt by itself/);
  assert.match(said, /A sale of your offer/);
  assert.match(said, /your offer promises 10% to the reposter/);
  assert.equal((await buyer.dub.c.ask<{ items: any[] }>('feed', { fresh: true })).items.find((i) => i.id === rp.id).sealed.state, 'paying');

  // The seller's Dub delivers the key; the buyer's Dub receives it; the post opens.
  const delivered = await seller.dub.c.ask<{ lines: { text: string }[] }>('money look');
  assert.ok(delivered.lines.some((l) => /key of your sealed post was delivered/.test(l.text)), JSON.stringify(delivered.lines));
  const arrived = await buyer.dub.c.ask<{ lines: { text: string }[] }>('money look');
  assert.ok(arrived.lines.some((l) => /arrived from its seller/.test(l.text)), JSON.stringify(arrived.lines));
  const opened = (await buyer.dub.c.ask<{ items: any[] }>('feed', { fresh: true })).items.find((i) => i.id === rp.id);
  assert.equal(opened.sealed.state, 'opened');
  assert.equal(opened.sealed.text, 'The recipe: two parts clay, one part reed.');

  // The referral share: asked for by itself under the seller's referral lane; the reposter's Damgar answers.
  const again = await seller.damgar.c.ask<{ lines: { text: string }[] }>('look');
  assert.ok(again.lines.some((l) => /referral share to .* is asked for by itself/.test(l.text)), JSON.stringify(again.lines));
  await reposter.damgar.c.ask('look');
  await seller.damgar.c.ask('look');
  const share = (await seller.damgar.c.ask<{ payments: PaymentShown[] }>('pay')).payments.find((p) => p.other.id === reposter.id)!;
  assert.equal(share.amount.said, '100 regtest satoshis');
  await seller.damgar.c.ask('paid', { key: share.key, proof: qLink.preimages.get(share.pay!.invoice!)! });
  await reposter.damgar.c.ask('look');
  const q = await reposter.damgar.c.ask<Account>('account');
  assert.deepEqual(q.totals.find((t) => t.label.startsWith('Came in'))!.amounts.map((x) => x.said), ['100 regtest satoshis']);
  assert.match(q.payments[0].proofs.find((x) => x.kind === 'claim')!.how, /Signed under a lane of .*backed/, 'the seller’s claim, under its referral lane');
  const s = await seller.damgar.c.ask<Account>('account');
  assert.deepEqual(s.totals.find((t) => t.label.startsWith('Came in'))!.amounts.map((x) => x.said), ['1 000 regtest satoshis']);
  assert.deepEqual(s.totals.find((t) => t.label.startsWith('Went out'))!.amounts.map((x) => x.said), ['100 regtest satoshis']);
});
