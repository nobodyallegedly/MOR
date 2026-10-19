// Round 3, part B: Edubba's Publishing tab, a protected file as oneself.
// The seller's identity, made in Dub, is brought into Edubba (and into its
// own Damgar); Edubba seals a text and a JPEG picture, each with a price,
// read back before anything is signed; a buyer, in Dub, pays the picture
// under Dub's lane; the seller's Damgar signs the receipt by itself and
// tells the seller's apps of the sale; Edubba delivers the key, sealed to the
// buyer; the picture opens in the buyer's Dub, checked against its
// fingerprint. A file that is no JPEG is refused in plain words; nothing of
// the work's key is in the buyer's folder until it is delivered.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { closeAll, dub as dubOf, edubba, person, start, testLink, type Relay } from '../../damgar/test/world.ts';
import { openSealed, unhex } from '../../genesis/src/core.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { collectiveNow, judgeCollective } from '../../grants/src/member.ts';
import { readKeyDelivery, readOffer } from '../../barebone/src/sealed.ts';
import { foundCollective } from './cast.ts';
import { TestNode } from '../../damgar/test/node.ts';
import { SPEC } from '../../damgar/src/specs.ts';
import type { PaymentShown, ToSign } from '../../damgar/src/shapes.ts';
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
const JPEG = readFileSync(new URL('../../../modules/jpeg/test/fixtures/phone.jpg', import.meta.url));

test('a protected text and picture published from Edubba as oneself; a buyer pays from Dub; the key delivered by Edubba on the receipt; the picture opens in Dub', async () => {
  const H = homes.map((h) => h.base);
  const node = new TestNode();
  const link = testLink(node);
  const seller = await person(H, [relay.base], { link: link.factory });
  const buyer = await person(H, [relay.base]);
  // The seller is paid on Lightning, Damgar answering and receipting by itself under its own lane.
  const rv = await seller.damgar.c.ask<{ digest: string }>('rails review', { lightning: node.key, network: 3 });
  await seller.damgar.c.ask('rails publish', { lightning: node.key, network: 3, digest: rv.digest });
  await seller.damgar.c.ask('link', link.config);
  const own = await seller.damgar.c.ask<{ digest: string }>('own lane review', { role: 'receipts', cap: '50000', unit: R });
  await seller.damgar.c.ask('own lane', { role: 'receipts', cap: '50000', unit: R, digest: own.digest });
  // The buyer's lane, asked in Dub, granted in Damgar.
  await buyer.dub.c.ask('lane ask', { label: 'Dub on the Mac', cap: '5000', unit: R });
  await buyer.damgar.c.ask('look');
  const lane = (await buyer.damgar.c.ask<{ items: ToSign[] }>('to sign')).items.find((i) => i.kind === 'lane')!;
  await buyer.damgar.c.ask('grant lane', { id: lane.id });

  // The seller's identity, brought into Edubba by its words.
  const e = await edubba(H, [relay.base]);
  await e.c.ask('bring', { name: 'Seller', id: seller.id, words: seller.dub.words, address: H[0] });
  const st = await e.c.ask<{ actors: { id: string; kind: string; available: boolean }[]; as: string; say: string[] }>('publishing');
  assert.deepEqual(st.actors.map((a) => [a.id, a.kind, a.available]), [[seller.id, 'self', true]]);
  assert.equal(st.as, seller.id);
  assert.match(st.say.join(' '), /A text, or a JPEG picture/);

  // A file that is no JPEG: refused in plain words, nothing signed.
  const bad = await e.c.ask<{ reading: { blocking: string[] } }>('publishing work read', { media: 'picture', data: b64(new TextEncoder().encode('not a picture')), title: 'Wrong', price: '100' });
  assert.ok(bad.reading.blocking.some((b) => /not a JPEG picture/.test(b)), JSON.stringify(bad.reading.blocking));
  const none = await e.c.ask<{ reading: { blocking: string[] } }>('publishing work read', { media: 'text', data: '', title: '', price: '0' });
  assert.deepEqual(none.reading.blocking, ['Write the text to seal.', 'Give it a title: the public words beside its offer.', 'A price is a whole number of regtest satoshis, above zero.']);

  // A text, read back, then signed.
  const t = await e.c.ask<{ plan: string; digest: string; reading: { title: string; summary: string[]; sections: { heading: string; lines: { text: string }[] }[]; blocking: string[] } }>('publishing work read', {
    media: 'text',
    data: b64(new TextEncoder().encode('The recipe: two parts clay, one part reed.')),
    title: 'A recipe, sealed',
    price: '1000',
  });
  assert.deepEqual(t.reading.blocking, []);
  assert.match(t.reading.summary.join(' '), /lone seller’s: itself the agreement between you and each buyer/);
  assert.match(t.reading.sections[0].lines.map((l) => l.text).join(' '), /Its offer, public: 1 000 regtest satoshis/);
  await assert.rejects(e.c.ask('publishing confirm', { plan: t.plan, digest: '00'.repeat(32) }), /not what was read back/);
  const tDone = await e.c.ask<Done>('publishing work read', { media: 'text', data: b64(new TextEncoder().encode('The recipe: two parts clay, one part reed.')), title: 'A recipe, sealed', price: '1000' }).then((r: any) => e.c.ask<Done>('publishing confirm', { plan: r.plan, digest: r.digest }));
  assert.equal(tDone.acts.length, 3);

  // A picture: stripped to the picture alone, locked, signed.
  const p = await e.c.ask<{ plan: string; digest: string; reading: { blocking: string[]; sections: { lines: { text: string }[] }[] } }>('publishing work read', { media: 'picture', data: b64(JPEG), title: 'A tablet, photographed', price: '2000' });
  assert.deepEqual(p.reading.blocking, []);
  assert.match(p.reading.sections[0].lines[0].text, /The picture \(a JPEG, stripped to the picture alone first/);
  const pDone = await e.c.ask<Done>('publishing confirm', { plan: p.plan, digest: p.digest });
  const [publication, offer, post] = pDone.acts;
  const listed = await e.c.ask<{ works: { publication: string; media: string; title: string; collective: boolean }[] }>('publishing');
  assert.deepEqual(listed.works.map((w) => [w.title, w.media, w.collective]), [['A tablet, photographed', 'picture', false], ['A recipe, sealed', 'text', false]]);

  // The buyer follows the seller: the picture shows sealed, for sale.
  await buyer.dub.c.ask('follow', { id: seller.id, name: 'Seller' });
  const feed = (await buyer.dub.c.ask<{ items: any[] }>('feed', { fresh: true })).items;
  const seen = feed.find((i) => i.id === post)!;
  assert.ok(seen, 'the picture’s post is in the buyer’s feed');
  assert.equal(seen.sealed.state, 'for sale');
  assert.equal(seen.sealed.media, 'picture');
  assert.equal(seen.sealed.offer, offer);
  assert.equal(seen.sealed.picture, null, 'sealed: nothing of the picture is shown');

  // Bought from Dub under its lane; paid; the seller's Damgar receipts by itself and tells of the sale.
  await buyer.dub.c.ask('buy', { publication, seller: seller.id, post });
  await seller.damgar.c.ask('look');
  const pays = (await buyer.dub.c.ask<{ payments: PaymentShown[] }>('payments')).payments;
  assert.equal(pays.length, 1);
  await buyer.dub.c.ask('paid', { key: pays[0].key, proof: link.preimages.get(pays[0].pay!.invoice!)! });
  const sl = await seller.damgar.c.ask<{ lines: { text: string }[] }>('look');
  assert.match(sl.lines.map((l) => l.text).join(' | '), /A sale of your offer/);

  // Edubba delivers the key; the buyer's Dub receives it; the picture opens, checked against its fingerprint.
  const d = await e.c.ask<{ lines: { text: string }[] }>('publishing deliver');
  assert.ok(d.lines.some((l) => /key of your sealed picture was delivered/.test(l.text)), JSON.stringify(d.lines));
  const again = await e.c.ask<{ lines: { text: string }[] }>('publishing deliver');
  assert.deepEqual(again.lines.map((l) => l.text), ['No sale waits for its key.'], 'delivered once');
  const arrived = await buyer.dub.c.ask<{ lines: { text: string }[] }>('money look');
  assert.ok(arrived.lines.some((l) => /arrived from its seller/.test(l.text)), JSON.stringify(arrived.lines));
  const opened = (await buyer.dub.c.ask<{ items: any[] }>('feed', { fresh: true })).items.find((i) => i.id === post)!;
  assert.equal(opened.sealed.state, 'opened');
  assert.match(opened.sealed.picture, /^data:image\/jpeg;base64,/);
  const shown = Buffer.from(opened.sealed.picture.split(',')[1], 'base64');
  assert.equal(shown[0], 0xff);
  assert.equal(shown[1], 0xd8, 'a JPEG');
});

test('a protected text published by a collective from Edubba, each act signed with the member’s own key in the area reaching it; its key sealed to every member', async () => {
  const H = homes.map((h) => h.base);
  const e = await edubba(H, [relay.base]);
  const A = (await e.c.ask<Done>('identity', { name: 'A', linked: false })).acts[0];
  const iPa = await dubOf(H, [relay.base]);
  const iPh = await dubOf(H, [relay.base]);
  const { collective } = await foundCollective(e, A, [iPa, iPh], [
    { name: 'Publishing', layer: 1, holders: [A, iPa.id, iPh.id], number: 1 },
    { name: 'Offers and deals', layer: 3, holders: [A, iPa.id], number: 1 },
  ]);
  const hints = [relay.base, ...H];

  // Who acts: A, and the collective founded here, available.
  const st = await e.c.ask<{ actors: { id: string; kind: string; available: boolean; why: string | null }[] }>('publishing');
  assert.deepEqual(st.actors.map((a) => [a.id, a.kind, a.available]), [[A, 'self', true], [collective, 'collective', true]], JSON.stringify(st.actors));
  await e.c.ask('publishing act as', { id: collective });

  // A referral share in a collective's offer's words is refused: its split plan says it (part C).
  const r = await e.c.ask<any>('publishing work read', { media: 'text', data: b64(new TextEncoder().encode('Three verses.')), title: 'Verses', price: '3000', referral: '10' });
  assert.ok(r.reading.blocking.some((x: string) => /split plan/.test(x)));
  const w = await e.c.ask<any>('publishing work read', { media: 'text', data: b64(new TextEncoder().encode('Three verses, by three hands.')), title: 'Verses, by the collective', price: '3000' });
  assert.deepEqual(w.reading.blocking, []);
  assert.match(w.reading.summary.join(' '), /under its agreement in force .* paying the collective/);
  const who = w.reading.sections.find((s: any) => s.heading === 'Who signs').lines.map((l: any) => l.text).join(' ');
  assert.match(who, /The publication, in its area “Publishing”: 1 key of 3/);
  assert.match(who, /The offer, in its area “Offers and deals”: 1 key of 2/);
  const done = await e.c.ask<Done>('publishing confirm', { plan: w.plan, digest: w.digest });
  assert.ok(done.lines.some((l) => /sealed to every member \(3\)/.test(l.text)), JSON.stringify(done.lines));
  const [publication, offer] = done.acts;

  // Both count for the collective on A's key alone, each in its area; the offer is under its agreement in force.
  const j = await judgeCollective(collective, [publication, offer], hints);
  for (const x of [publication, offer]) {
    assert.equal(j.get(x)!.met, true, JSON.stringify(j.get(x)));
    assert.deepEqual(j.get(x)!.areas[0].byKey, [A]);
  }
  const o = readOffer((await relayAt(relay.base).getAct(offer))!, collective, publication, true)!;
  assert.equal(o.payee, collective);
  assert.equal(o.under, (await collectiveNow(collective, hints)).agreement);

  // Each member opens the key, sealed to them: iPh, who holds no box in offers, too (a collective keeps no secret from its members).
  for (const m of [iPa, iPh]) {
    const secrets = (JSON.parse(readFileSync(join(m.dir, 'identities', m.id, 'identity.json'), 'utf8')).encryption as { secret: string }[]).map((x) => unhex(x.secret));
    const items = (await relayAt(relay.base).feed({ to: m.id })).items.filter((i) => i.kind === 'sealed');
    const keys = items.flatMap((i) => secrets.flatMap((s) => {
      try {
        const d = (openSealed(i.item, m.id, s) as { described: { signer?: string; type?: number; payload?: Uint8Array } }).described;
        return d.signer === collective && d.type === 1 ? [readKeyDelivery(d.payload!)] : [];
      } catch {
        return [];
      }
    }));
    assert.equal(keys.find((k) => k?.publication === publication)?.publication, publication, `${m.id.slice(0, 8)} opens the work’s key`);
  }
});

test('a vow published from Edubba; four buyers pay in Dub; one confirms and one contests in Dub’s Signing tab; the look-up reads each sale; a buyer held in Edubba confirms there (Damgar signing), another contests', async () => {
  const H = homes.map((h) => h.base);
  const node = new TestNode();
  const link = testLink(node);
  const seller = await person(H, [relay.base], { link: link.factory });
  const rv = await seller.damgar.c.ask<{ digest: string }>('rails review', { lightning: node.key, network: 3 });
  await seller.damgar.c.ask('rails publish', { lightning: node.key, network: 3, digest: rv.digest });
  await seller.damgar.c.ask('link', link.config);
  const own = await seller.damgar.c.ask<{ digest: string }>('own lane review', { role: 'receipts', cap: '50000', unit: R });
  await seller.damgar.c.ask('own lane', { role: 'receipts', cap: '50000', unit: R, digest: own.digest });
  const e = await edubba(H, [relay.base]);
  await e.c.ask('bring', { name: 'Seller', id: seller.id, words: seller.dub.words, address: H[0] });

  // The vow, read back, then published.
  const r = await e.c.ask<any>('publishing vow read', { words: 'A seat at the reading of the tablets, on the first evening.', title: 'A seat, vowed', price: '500' });
  assert.deepEqual(r.reading.blocking, []);
  assert.match(r.reading.summary.join(' '), /pending until its buyer confirms it \(kept\) or contests it \(not kept\)/);
  const [vow, offer, post] = (await e.c.ask<Done>('publishing confirm', { plan: r.plan, digest: r.digest })).acts;
  assert.deepEqual((await e.c.ask<any>('publishing')).vows.map((v: any) => v.title), ['A seat, vowed']);

  // Three buyers, each in Dub with a lane, find it in their feed and buy it.
  const buyers = [await person(H, [relay.base]), await person(H, [relay.base]), await person(H, [relay.base]), await person(H, [relay.base])];
  for (const b of buyers) {
    await b.dub.c.ask('lane ask', { label: 'Dub', cap: '5000', unit: R });
    await b.damgar.c.ask('look');
    const lane = (await b.damgar.c.ask<{ items: ToSign[] }>('to sign')).items.find((i) => i.kind === 'lane')!;
    await b.damgar.c.ask('grant lane', { id: lane.id });
    await b.dub.c.ask('signing', { on: true });
    await b.dub.c.ask('follow', { id: seller.id, name: 'Seller' });
    const seen = (await b.dub.c.ask<{ items: any[] }>('feed', { fresh: true })).items.find((i) => i.id === post)!;
    assert.equal(seen.vow.state, 'for sale');
    assert.equal(seen.vow.vow, vow);
    assert.equal(seen.vow.offer, offer);
    assert.match(seen.vow.words, /A seat at the reading/);
    await b.dub.c.ask('vow buy', { vow, seller: seller.id, post });
    await seller.damgar.c.ask('look');
    const pays = (await b.dub.c.ask<{ payments: PaymentShown[] }>('payments')).payments;
    await b.dub.c.ask('paid', { key: pays[0].key, proof: link.preimages.get(pays[0].pay!.invoice!)! });
    assert.equal((await b.dub.c.ask<{ items: any[] }>('feed', { fresh: true })).items.find((i) => i.id === post)!.vow.state, 'bought');
  }
  await seller.damgar.c.ask('look');

  // Each sale is pending until its buyer says; one confirms, one contests, in Dub's Signing tab.
  const [b1, b2, b3, b4] = buyers;
  assert.deepEqual((await b1.dub.c.ask<any>('vows bought')).vows.map((x: any) => [x.vow, x.paid, x.sale]), [[vow, true, 'pending']]);
  assert.match((await b1.dub.c.ask<any>('vow confirm', { vow })).lines[0].text, /reads confirmed/);
  assert.match((await b2.dub.c.ask<any>('vow contest', { vow, promise: 'The seat was given to someone else.' })).lines[0].text, /reads contested/);
  assert.equal((await b1.dub.c.ask<any>('vows bought')).vows[0].sale, 'confirmed');
  const b2s = (await b2.dub.c.ask<any>('vows bought')).vows[0];
  assert.deepEqual([b2s.sale, b2s.promise], ['contested', 'The seat was given to someone else.']);
  await assert.rejects(b2.dub.c.ask('vow contest', { vow: '11'.repeat(32), promise: '' }), /No sale of that vow/);

  // The look-up, from Edubba, asked of the relay: every sale with its state, as the core reads it.
  const look = await e.c.ask<any>('publishing vow sales', { identity: seller.id, relays: [relay.base] });
  assert.equal(look.vows.length, 1);
  const states = Object.fromEntries(look.vows[0].sales.map((x: any) => [x.buyer, [x.state, x.promise]]));
  assert.deepEqual(states, { [b1.id]: ['confirmed', null], [b2.id]: ['contested', 'The seat was given to someone else.'], [b3.id]: ['pending', null], [b4.id]: ['pending', null] });
  assert.deepEqual(look.vows[0].mine, [], 'no buyer is held in this Edubba');
  await assert.rejects(e.c.ask('publishing vow sales', { identity: seller.id, relays: [] }), /Name at least one relay/);

  // The third buyer, brought into Edubba, confirms there: Edubba prepares it, sealed to oneself, and Damgar signs it (F357).
  await e.c.ask('bring', { name: 'Third buyer', id: b3.id, words: b3.dub.words, address: H[0] });
  const mine = await e.c.ask<any>('publishing vow sales', { identity: seller.id, relays: [relay.base] });
  const sale3 = mine.vows[0].sales.find((x: any) => x.buyer === b3.id);
  assert.deepEqual(mine.vows[0].mine, [sale3.act]);
  const prepared = await e.c.ask<Done>('publishing confirm sale', { vow, sale: sale3.act, buyer: b3.id, seller: seller.id, unit: sale3.amount.unit, value: sale3.amount.value });
  assert.match(prepared.lines[0].text, /Damgar, holding the same identity, shows it in To sign/);
  assert.equal((await e.c.ask<any>('publishing vow sales', { identity: seller.id, relays: [relay.base] })).vows[0].sales.find((x: any) => x.buyer === b3.id).state, 'pending', 'nothing counts until Damgar signs');
  await b3.damgar.c.ask('look');
  const draft = (await b3.damgar.c.ask<{ items: ToSign[] }>('to sign')).items.find((i) => i.kind === 'draft' && i.title === 'A purchase to confirm')!;
  assert.ok(draft, 'the confirmation waits in Damgar’s To sign');
  assert.ok(draft.lines.some((l) => /acknowledging/.test(l.text)), JSON.stringify(draft.lines));
  await b3.damgar.c.ask('sign draft', { id: draft.id });
  assert.equal((await e.c.ask<any>('publishing vow sales', { identity: seller.id, relays: [relay.base] })).vows[0].sales.find((x: any) => x.buyer === b3.id).state, 'confirmed');

  // The fourth buyer, brought into Edubba, contests there.
  await e.c.ask('bring', { name: 'Fourth buyer', id: b4.id, words: b4.dub.words, address: H[0] });
  const sale4 = (await e.c.ask<any>('publishing vow sales', { identity: seller.id, relays: [relay.base] })).vows[0].sales.find((x: any) => x.buyer === b4.id);
  await e.c.ask<Done>('publishing contest', { vow, sale: sale4.act, buyer: b4.id, promise: '' });
  assert.equal((await e.c.ask<any>('publishing vow sales', { identity: seller.id, relays: [relay.base] })).vows[0].sales.find((x: any) => x.buyer === b4.id).state, 'contested');
});
