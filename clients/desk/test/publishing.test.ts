// Edubba's Publishing tab, the four ways in (round 8, F407; decided by
// Nobody, allegedly, 24 October 2026): this file holds way 1, Upload, with
// its optional price tag on the bare bake; the upload of a collective; and a
// vow, sold by a lone seller's publication. Ways 2 to 4 (a claim, an
// ownership agreement, a publication) are `shared-deal.test.ts`; the forms
// by clicks are `publishing-browser.test.ts`.
//
// Way 1: the seller's identity, made in Dub, is brought into Edubba (and
// into its own Damgar); Edubba uploads a text and a JPEG picture, each with
// a price tag on the bare bake, read back before anything is signed; a
// buyer, in Dub, pays the picture under Dub's lane; the seller's Damgar
// signs the receipt by itself and tells the seller's apps of the sale;
// Edubba delivers the key, sealed to the buyer; the picture opens in the
// buyer's Dub, checked against its fingerprint. A file that is no JPEG is
// refused in plain words.
//
// Premises replaced in round 8 (said here, as the brief asks): the protected
// file "published with an offer" is now a bake (an upload) and a price tag
// (Money type 5) on it, paying the uploader unsplit: the assertions on the
// offer's words and "a lone seller's offer" now assert the bake and the tag.
// The collective's "publication in the area reaching publications, the
// offer in the area reaching offers, each with the member's key" is now an
// upload by a member with their own key naming the collective (no member
// keys, Agreements rule 58), counted under the Envelopes layer's rule.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { closeAll, dub as dubOf, edubba, person, start, testLink, type Relay } from '../../damgar/test/world.ts';
import { openSealed, unhex } from '../../genesis/src/core.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { judgeCollective } from '../../grants/src/member.ts';
import { readKeyDelivery } from '../../barebone/src/sealed.ts';
import { readTag } from '../../barebone/src/tag.ts';
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

test('way 1, Upload: a text and a picture uploaded with a price tag on the bare bake; a buyer pays from Dub; the key delivered by Edubba on the receipt; the picture opens in Dub; an upload with no price, its tag added later, then withdrawn', async () => {
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
  const st = await e.c.ask<{ actors: { id: string; kind: string; available: boolean }[]; as: string; say: string[]; bakeStays: string }>('publishing');
  assert.deepEqual(st.actors.map((a) => [a.id, a.kind, a.available]), [[seller.id, 'self', true]]);
  assert.equal(st.as, seller.id);
  assert.match(st.say.join(' '), /Four ways in, each stopping where you choose/);
  assert.match(st.say.join(' '), /A text, a JPEG picture, an MP4 film or an M4A recording/);
  assert.match(st.bakeStays, /A bake is never withdrawn by the protocol: its bytes stay where they were uploaded unless the homes and relays holding them drop them/);

  // A file that is no JPEG: refused in plain words, nothing signed.
  const bad = await e.c.ask<{ reading: { blocking: string[] } }>('publishing upload read', { media: 'picture', data: b64(new TextEncoder().encode('not a picture')), title: 'Wrong', then: 'price', price: '100' });
  assert.ok(bad.reading.blocking.some((b) => /not a JPEG picture/.test(b)), JSON.stringify(bad.reading.blocking));
  const none = await e.c.ask<{ reading: { blocking: string[] } }>('publishing upload read', { media: 'text', data: '', title: '', then: 'price', price: '0' });
  assert.deepEqual(none.reading.blocking, ['Write the text to upload.', 'Give it a title: the public words of the post that shows it in a feed.', 'A price is a whole number of regtest satoshis, above zero.']);

  // A text with a price tag, read back, then signed.
  const recipe = { media: 'text', data: b64(new TextEncoder().encode('The recipe: two parts clay, one part reed.')), title: 'A recipe, sealed', then: 'price', price: '1000' };
  const t = await e.c.ask<{ plan: string; digest: string; reading: { title: string; summary: string[]; sections: { heading: string; lines: { text: string }[] }[]; blocking: string[] } }>('publishing upload read', recipe);
  assert.deepEqual(t.reading.blocking, []);
  assert.deepEqual(t.reading.sections.map((x) => x.heading), ['Uploaded: the bake', 'Then: a price tag on the bare bake', 'Stated costs']);
  assert.match(t.reading.sections[1].lines[0].text, /1 000 regtest satoshis, paid to you, the uploader, unsplit\. On a bare bake only its uploader’s tag counts/);
  assert.match(JSON.stringify(t.reading.sections[2]), /A bake is never withdrawn by the protocol/);
  await assert.rejects(e.c.ask('publishing confirm', { plan: t.plan, digest: '00'.repeat(32) }), /not what was read back/);
  const tDone = await e.c.ask<Done>('publishing upload read', recipe).then((r: any) => e.c.ask<Done>('publishing confirm', { plan: r.plan, digest: r.digest }));
  assert.equal(tDone.acts.length, 3, 'the bake, its price tag, the post');

  // A picture: stripped to the picture alone, locked, signed; its tag a Money act naming the bake, paying the uploader.
  const p = await e.c.ask<{ plan: string; digest: string; reading: { blocking: string[]; sections: { lines: { text: string }[] }[] } }>('publishing upload read', { media: 'picture', data: b64(JPEG), title: 'A tablet, photographed', then: 'price', price: '2000' });
  assert.deepEqual(p.reading.blocking, []);
  assert.match(p.reading.sections[0].lines[0].text, /The picture \(a JPEG, stripped to the picture alone first/);
  const pDone = await e.c.ask<Done>('publishing confirm', { plan: p.plan, digest: p.digest });
  const [bake, tag, post] = pDone.acts;
  const tagRead = readTag((await relayAt(relay.base).getAct(tag))!)!;
  assert.deepEqual([tagRead.bake, tagRead.payee, tagRead.signer, tagRead.price?.value], [bake, seller.id, seller.id, 2000]);
  const listed = await e.c.ask<{ bakes: { bake: string; media: string; title: string; collective: boolean; tag: { price: number } | null }[] }>('publishing');
  assert.deepEqual(listed.bakes.map((w) => [w.title, w.media, w.collective, w.tag?.price]), [['A tablet, photographed', 'picture', false, 2000], ['A recipe, sealed', 'text', false, 1000]]);

  // The buyer follows the seller: the picture shows sealed, for sale.
  await buyer.dub.c.ask('follow', { id: seller.id, name: 'Seller' });
  const feed = (await buyer.dub.c.ask<{ items: any[] }>('feed', { fresh: true })).items;
  const seen = feed.find((i) => i.id === post)!;
  assert.ok(seen, 'the picture’s post is in the buyer’s feed');
  assert.equal(seen.sealed.state, 'for sale', JSON.stringify(seen.sealed));
  assert.equal(seen.sealed.media, 'picture');
  assert.equal(seen.sealed.picture, null, 'sealed: nothing of the picture is shown');

  // Bought from Dub under its lane; paid; the seller's Damgar receipts by itself and tells of the sale.
  await buyer.dub.c.ask('buy', { publication: bake, seller: seller.id, post });
  await seller.damgar.c.ask('look');
  const pays = (await buyer.dub.c.ask<{ payments: PaymentShown[] }>('payments')).payments;
  assert.equal(pays.length, 1);
  await buyer.dub.c.ask('paid', { key: pays[0].key, proof: link.preimages.get(pays[0].pay!.invoice!)! });
  await seller.damgar.c.ask('look');

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

  // Round 4 (decided: "video and audio added"): a recording the audio Module refuses, refused in plain words;
  // one it plays stripped to the sound alone before it is locked, uploaded with no price (way 1, stopping at the upload).
  const pictured = await e.c.ask<{ reading: { blocking: string[] } }>('publishing upload read', { media: 'audio', data: b64(readFileSync(new URL('../../../modules/audio/test/fixtures/with-picture.m4a', import.meta.url))), title: 'Wrong' });
  assert.ok(pictured.reading.blocking.some((b) => /not a recording the audio Module plays \(an M4A\): a picture track/.test(b)), JSON.stringify(pictured.reading.blocking));
  const m4a = readFileSync(new URL('../../../modules/audio/test/fixtures/tagged.m4a', import.meta.url));
  const a = await e.c.ask<{ plan: string; digest: string; reading: { blocking: string[]; summary: string[]; sections: { lines: { text: string }[] }[] } }>('publishing upload read', { media: 'audio', data: b64(m4a), title: 'The reading, recorded', then: 'none' });
  assert.deepEqual(a.reading.blocking, []);
  assert.match(a.reading.summary.join(' '), /Nothing more: no price, no claim/);
  const said = a.reading.sections[0].lines.map((l) => l.text).join(' | ');
  assert.match(said, /The recording \(an M4A, stripped to the sound alone first/);
  assert.match(said, /Stripped from the recording before it is locked: metadata/);
  const aDone = await e.c.ask<Done>('publishing confirm', { plan: a.plan, digest: a.digest });
  assert.equal(aDone.acts.length, 2, 'the bake and its post: no price tag');
  const [recording, recPost] = aDone.acts;
  assert.ok(aDone.lines.some((l) => /Nothing is for sale/.test(l.text)), JSON.stringify(aDone.lines));
  const notForSale = (await buyer.dub.c.ask<{ items: any[] }>('feed', { fresh: true })).items.find((i) => i.id === recPost)!;
  assert.ok(notForSale?.sealed, 'the upload shows, locked');
  assert.equal(notForSale.sealed.tag, null, 'no price tag: it cannot be bought');
  assert.match(notForSale.sealed.problem, /no price tag of its uploader was found/);

  // Its price tag, added later (read back, then signed), then withdrawn by its signer alone (Money rule 18).
  const tg = await e.c.ask<any>('publishing tag read', { bake: recording, price: '1500' });
  assert.deepEqual(tg.reading.blocking, []);
  assert.match(JSON.stringify(tg.reading), /money to a bare bake is the uploader’s/);
  const tgDone = await e.c.ask<Done>('publishing confirm', { plan: tg.plan, digest: tg.digest });
  const forSale = (await buyer.dub.c.ask<{ items: any[] }>('feed', { fresh: true })).items.find((i) => i.id === recPost)!;
  assert.equal(forSale.sealed.media, 'audio');
  assert.equal(forSale.sealed.tag, tgDone.acts[0], 'its uploader’s price tag counts');
  const wd = await e.c.ask<any>('publishing tag withdraw read', { on: recording });
  assert.deepEqual(wd.reading.blocking, []);
  assert.match(wd.reading.summary.join(' '), /A new version of the price tag, with no price, signed by you alone/);
  const wdDone = await e.c.ask<Done>('publishing confirm', { plan: wd.plan, digest: wd.digest });
  const w2 = readTag((await relayAt(relay.base).getAct(wdDone.acts[0]))!)!;
  assert.deepEqual([w2.version, w2.price, w2.first], [2, null, tgDone.acts[0]]);
  assert.equal((await e.c.ask<any>('publishing')).bakes.find((x: any) => x.bake === recording).tag.price, null);
  assert.ok((await e.c.ask<any>('publishing tag withdraw read', { on: recording })).reading.blocking.some((b: string) => /withdrawn already/.test(b)));
});

test('way 1 as a collective: an upload and its price tag, made by a member with their own key naming the collective, under the Envelopes layer’s rule; its key sealed to every member', async () => {
  const H = homes.map((h) => h.base);
  const e = await edubba(H, [relay.base]);
  const A = (await e.c.ask<Done>('identity', { name: 'A', linked: false })).acts[0];
  const iPa = await dubOf(H, [relay.base]);
  const iPh = await dubOf(H, [relay.base]);
  // Text and Envelopes: any one member; Money (its price tags): any one too.
  const { collective } = await foundCollective(e, A, [iPa, iPh], [
    { name: 'Publishing', layer: [1, 2], holders: [A, iPa.id, iPh.id], number: 1 },
    { name: 'Money', layer: 3, holders: [A, iPa.id, iPh.id], number: 1 },
  ]);
  const hints = [relay.base, ...H];

  // Who acts: A, and the collective founded here, available.
  const st = await e.c.ask<{ actors: { id: string; kind: string; available: boolean; why: string | null }[] }>('publishing');
  assert.deepEqual(st.actors.map((a) => [a.id, a.kind, a.available]), [[A, 'self', true], [collective, 'collective', true]], JSON.stringify(st.actors));
  await e.c.ask('publishing act as', { id: collective });

  // A collective's claim is not offered here yet: said in plain words, nothing signed.
  const c = await e.c.ask<any>('publishing upload read', { media: 'text', data: b64(new TextEncoder().encode('Three verses.')), title: 'Verses', then: 'claim' });
  assert.ok(c.reading.blocking.some((x: string) => /A collective’s claim is not offered here yet/.test(x)), JSON.stringify(c.reading.blocking));
  const w = await e.c.ask<any>('publishing upload read', { media: 'text', data: b64(new TextEncoder().encode('Three verses, by three hands.')), title: 'Verses, by the collective', then: 'price', price: '3000' });
  assert.deepEqual(w.reading.blocking, []);
  assert.match(w.reading.summary.join(' '), /Uploaded by the collective .*, by you \(A .*\) with your own key, naming it/);
  const done = await e.c.ask<Done>('publishing confirm', { plan: w.plan, digest: w.digest });
  assert.ok(done.lines.some((l) => /sealed to every member/.test(l.text)), JSON.stringify(done.lines));
  const [bake, tag] = done.acts;
  const t = readTag((await relayAt(relay.base).getAct(tag))!)!;
  assert.deepEqual([t.bake, t.payee, t.price?.value], [bake, collective, 3000], 'paid to the collective, its uploader');

  // Both count for the collective on A's act alone, under the rules of their layers (rule 60).
  const j = await judgeCollective(collective, [bake, tag], hints);
  for (const x of [bake, tag]) assert.equal(j.get(x)!.met, true, JSON.stringify(j.get(x)));

  // Each member opens the key, sealed to them (a collective keeps no secret from its members, rule 57).
  for (const m of [iPa, iPh]) {
    const secrets = (JSON.parse(readFileSync(join(m.dir, 'identities', m.id, 'identity.json'), 'utf8')).encryption as { secret: string }[]).map((x) => unhex(x.secret));
    const items = (await relayAt(relay.base).feed({ to: m.id })).items.filter((i) => i.kind === 'sealed');
    const keys = items.flatMap((i) => secrets.flatMap((s) => {
      try {
        const d = (openSealed(i.item, m.id, s) as { described: { signer?: string; type?: number; payload?: Uint8Array } }).described;
        return d.type === 1 ? [readKeyDelivery(d.payload!)] : [];
      } catch {
        return [];
      }
    }));
    assert.equal(keys.find((k) => k?.publication === bake)?.publication, bake, `${m.id.slice(0, 8)} opens the work’s key`);
  }
});

test('a vow published from Edubba, sold by a lone seller’s publication (you its split service, its price tag yours); four buyers pay in Dub; one confirms and one contests in Dub’s Signing tab; the look-up reads each sale; a buyer held in Edubba confirms there (Damgar signing), another contests', async () => {
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
  // Round 8: the standing offer is gone; a vow is sold by a publication naming it, its price a price tag (Agreements rule 11, Money rule 18).
  assert.match(r.reading.summary.join(' '), /by a publication of your own \(you its lone seller and its split service: paid to you\)/);
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
    assert.equal(seen.vow.offer, offer, JSON.stringify(seen.vow));
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
  // After S7d (F386): a vow's sale keeps its own form. Its contest marks the sale, and is not also shown beside the purchase: nothing is counted twice.
  for (const x of look.vows[0].sales) assert.deepEqual(x.beside, { state: 'shown', contests: [] }, `nothing beside ${x.buyer}’s purchase`);
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
