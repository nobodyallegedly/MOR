// Round 3, part D: the end-to-end test, with the author's cast: A (Edubba,
// Dub and Damgar on the Mac), iPa and iPh (each in their own Dub and
// Damgar), a reposter and buyers, all test identities.
//
// 1. A collective founded from Edubba's grid, its areas: Publishing (any
//    one member), Offers and deals (A or iPa), Money (A or iPa, one key,
//    two above 10,000).
// 2. A member's own key acts for it from Damgar (a promise within the cap
//    alone; one above it, with iPa's key from Dub) and from Ummia (a
//    release).
// 3. Its money: stakes (A 50%, iPa 30%, iPh 20%), a split plan with a 10%
//    referral share off the top, its split service, and a keeper, an
//    Edubba agent; every member signs, Edubba records it.
// 4. A protected file of the collective, linked to the split: a buyer
//    finds it through a repost, pays the service; the service receipts it
//    with the collective's grant key, splits it (300 to the reposter, then
//    1 350, 810 and 540) and pays each one; A's Edubba delivers the key;
//    the buyer opens it.
// 5. A vow of A's, sold twice: one sale confirmed, one contested, from Dub;
//    Edubba's look-up reads both.
// 6. The keeper records what happened; iPh resigns from Dub's Signing tab;
//    A's Edubba registers it; the keeper records the resignation.
//
// Run on in-memory test nodes by default. With MOR_LN_REGTEST naming the
// RUN_DIR of modules/lightning/regtest/up.sh, every payment is a regtest
// Lightning payment: the members' Damgars make invoices on bob's node
// through receive-only links, the reposter's on carol's, the split service
// invoices on carol's; every payment is made from the test wallet's alice
// (the only node holding spendable funds there; MOR checks the invoice the
// payee's node signed and the preimage, never which wallet paid).

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { closeAll, edubba, person, start, testLink, type Relay } from '../../damgar/test/world.ts';
import { TestNode } from '../../damgar/test/node.ts';
import { SPEC } from '../../damgar/src/specs.ts';
import type { Account, PaymentShown, ToSign } from '../../damgar/src/shapes.ts';
import { closeAll as closeUmmia, folder, ummia } from '../../ummia/test/world.ts';
import { lnd as serviceLnd } from '../../anchoring-service/src/lnd.ts';
import { lnd as walletLnd, miner } from '../../testwallet/src/lnd.ts';
import { checkRegtest, nodesOf, serve as serveWallet } from '../../testwallet/src/server.ts';
import { SplitService, type Node } from '../../split-service/src/service.ts';
import { keeperLog } from '../../grants/src/keeper.ts';
import { collectiveNow } from '../../grants/src/member.ts';
import { foundCollective } from './cast.ts';
import type { Done } from '../src/page/api.ts';

const run = process.env.MOR_LN_REGTEST;
const R = SPEC.units.regtest;
const b64 = (b: Uint8Array) => Buffer.from(b).toString('base64');
const OWN = 'sk-ant-api03-FAKE-edubba-round-3-never-real-KEEP';

let homes: Relay[];
let relay: Relay;
let wallet: { base: string; close(): void } | null = null;

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  if (run) {
    const w = { nodes: nodesOf(run).map(walletLnd), mine: miner({ rpc: 'https://127.0.0.1:18334', cert: join(run, 'btcd/rpc.cert') }) };
    await checkRegtest(w);
    const s = await serveWallet(w);
    wallet = { base: s.base, close: () => s.server.close() };
  }
});

after(async () => {
  wallet?.close();
  await closeAll();
  await closeUmmia();
  for (const h of [...homes, relay]) await h.stop();
});

/** The test wallet, asked as its page asks it (regtest only). */
const walletAsk = async <T>(op: string, a: Record<string, unknown>): Promise<T> => {
  const r = await fetch(`${wallet!.base}/api`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-test-wallet': '1' }, body: JSON.stringify({ op, ...a }) });
  const j = (await r.json()) as { ok?: T; error?: string };
  if (j.error) throw new Error(j.error);
  return j.ok as T;
};

/** Where the money moves: in-memory test nodes, or the regtest network. */
interface Money {
  /** Someone paid on Lightning: Dub and Damgar, its Damgar answering and receipting by itself (and paying out, where asked). */
  person(H: string[], RL: string[], o?: { node?: 'bob' | 'carol' }): ReturnType<typeof person>;
  /** Pay an invoice from the buyer's wallet: its preimage. */
  pay(invoice: string): Promise<string>;
  /** The split service's node. */
  service(): Node;
}

function memory(): Money {
  const wallets: Map<string, string>[] = [];
  const settled = new Map<string, string>();
  const hashes = new Map<string, string>();
  const pay = async (invoice: string) => {
    for (const w of wallets) {
      const p = w.get(invoice);
      if (!p) continue;
      const h = hashes.get(invoice);
      if (h) settled.set(h, p);
      return p;
    }
    throw new Error('an invoice no test node issued');
  };
  return {
    async person(H, RL) {
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
    },
    pay,
    service() {
      const n = new TestNode();
      const mine = new Map<string, string>();
      wallets.push(mine);
      return {
        nodeKey: async () => n.key,
        async addInvoice(sat, descriptionHash) {
          const i = n.invoice(sat, descriptionHash);
          const hash = [...n.preimages.keys()].pop()!;
          mine.set(i.invoice, i.preimage);
          hashes.set(i.invoice, hash);
          return { invoice: i.invoice, hash };
        },
        settled: async (hash) => settled.get(hash) ?? null,
        pay,
      };
    },
  };
}

function regtest(dir: string): Money {
  const rest = { bob: 18081, carol: 18082 } as const;
  return {
    async person(H, RL, o = {}) {
      const n = o.node ?? 'bob';
      const nodes = await walletAsk<{ name: string; key: string }[]>('nodes', {});
      const key = nodes.find((x) => x.name === n)!.key;
      const p = await person(H, RL);
      const rv = await p.damgar.c.ask<{ digest: string }>('rails review', { lightning: key, network: 3 });
      await p.damgar.c.ask('rails publish', { lightning: key, network: 3, digest: rv.digest });
      await p.damgar.c.ask('link', { rest: `https://127.0.0.1:${rest[n]}`, macaroonFile: join(dir, n, 'receive.macaroon'), certFile: join(dir, n, 'tls.cert') });
      const own = await p.damgar.c.ask<{ digest: string }>('own lane review', { role: 'receipts', cap: '100000', unit: R });
      await p.damgar.c.ask('own lane', { role: 'receipts', cap: '100000', unit: R, digest: own.digest });
      return p;
    },
    pay: async (invoice) => (await walletAsk<{ preimage: string }>('pay', { node: 'alice', invoice })).preimage,
    service() {
      const carol = serviceLnd({ url: `https://127.0.0.1:${rest.carol}`, lnddir: join(dir, 'carol') });
      return {
        nodeKey: () => carol.nodeKey(),
        addInvoice: (sat, h) => carol.addInvoice(sat, h),
        settled: (h) => carol.settled(h),
        // Paid from alice, as every payment here (see the head of this file).
        pay: async (invoice) => (await walletAsk<{ preimage: string }>('pay', { node: 'alice', invoice })).preimage,
      };
    },
  };
}

test(`round 3, end to end${run ? ', on regtest' : ''}: layers and areas, members acting for it from Damgar and Ummia with their own keys, the split agreement and a judged referral, a vow confirmed and contested, keepers, a resignation`, { timeout: 900_000 }, async () => {
  const H = homes.map((h) => h.base);
  const RL = [relay.base];
  const m = run ? regtest(run) : memory();

  // The cast.
  const [A, iPa, iPh] = [await m.person(H, RL), await m.person(H, RL), await m.person(H, RL)];
  const e = await edubba(H, RL);
  await e.c.ask('bring', { name: 'A', id: A.id, words: A.dub.words, address: H[0] });
  const add = await e.c.ask<{ agent: string; terms: { digest: string } }>('agent add', { name: 'Keeper of the tablets', owner: A.id, key: OWN, own: true });
  const keeper = add.agent;
  await e.c.ask('machine publish', { agent: keeper, owner: A.id, digest: add.terms.digest, own: true });

  // 1. The areas, from the grid.
  const { collective, terms } = await foundCollective(e, A.id, [iPa.dub, iPh.dub], [
    { name: 'Publishing', layer: [1, 2], holders: [A.id, iPa.id, iPh.id], number: 1 },
    { name: 'Publications', layer: 4, holders: [A.id, iPa.id], number: 1 },
    { name: 'Money', layer: 3, holders: [A.id, iPa.id], number: 1, cap: 10_000 },
  ], { shares: { [A.id]: 50, [iPa.id]: 30, [iPh.id]: 20 } });

  // 2a. A's own key, from Damgar: within the Money area's cap alone; above it, with iPa's signature from Dub.
  const added = await A.damgar.c.ask<any>('collective add', { id: collective });
  assert.match(added.lines[1].text, /“Money”.*above 10,000 an act, one more/);
  const small = { collective, to: iPh.id, value: '2000', unit: '', whatFor: 'clay' };
  const s1 = await A.damgar.c.ask<any>('collective promise read', small);
  assert.ok((await A.damgar.c.ask<any>('collective promise', { ...small, digest: s1.digest })).lines.some((l: any) => /It counts for the collective/.test(l.text)));
  const big = { collective, to: iPh.id, value: '50000', unit: '', whatFor: 'a kiln' };
  const s2 = await A.damgar.c.ask<any>('collective promise read', big);
  assert.ok(s2.lines.some((l: any) => /It is above the cap: it counts only with 2 keys/.test(l.text)));
  const p2 = await A.damgar.c.ask<any>('collective promise', { ...big, digest: s2.digest });
  const ask = (await iPa.dub.c.ask<any>('proposals')).proposals.find((x: any) => x.act === p2.act);
  assert.match((await iPa.dub.c.ask<any>('accept', { thread: ask.thread })).lines[0].text, /your own key/);
  const promised = (await A.damgar.c.ask<any>('collectives')).collectives[0].acts;
  assert.deepEqual(promised.map((a: any) => [a.amount.value, a.standing.met]).sort(), [[2000, true], [50000, true]].sort());

  // 2b. A's own key, from Ummia: a release of the collective, under its Envelopes rule.
  const u = await ummia();
  await u.c.ask('bring', { id: A.id, words: A.dub.words, address: H[0] });
  await u.c.ask('settings', { relays: RL, track: RL });
  await u.c.ask('collective add', { id: collective });
  await u.c.ask('acting', { id: collective });
  const rr = await u.c.ask<any>('release prepare', { folder: folder(), name: 'tablets', version: '1', previous: '' });
  const rel = (await u.c.ask<Done>('release confirm', { plan: rr.plan, digest: rr.digest })).acts[0];
  assert.equal((await u.c.ask<{ ok: boolean }>('release check', { id: rel })).ok, true, 'one key of Publishing counts');

  // 3. Its money (H101): its shares were set at its founding; here, where its payments land: a split
  // agreement naming its split service, a referral off the top, reading the shares by reference; the
  // service signs it; then its payee pointer names the service. Its keeper, apart: every member signs in Dub.
  const node = m.service();
  const svc = new SplitService(join(mkdtempSync(join(tmpdir(), 'split-')), 'svc'), node, { homes: H, relays: RL });
  await svc.start();
  const review = await e.c.ask<any>('real money prepare', { collective, way: 'service', referral: 10, service: svc.id });
  assert.deepEqual(review.reading.blocking, []);
  assert.match(JSON.stringify(review.reading), /never copied here/);
  const split = (await e.c.ask<Done>('real confirm', { plan: review.plan, digest: review.digest })).acts[0];
  await assert.rejects(e.c.ask('real money record', { act: split }), /Its rule asks more members first/);
  // Its judicial tier (S7h-4): every member signs the collective's split agreement, iPa and iPh in Dub's Signing tab.
  for (const x of [iPa, iPh]) {
    const sp = (await x.dub.c.ask<any>('proposals')).proposals.find((q: any) => q.act === split);
    assert.ok(sp, 'the split agreement reached the member’s Signing tab');
    await x.dub.c.ask('accept', { thread: sp.thread });
  }
  assert.equal((await e.c.ask<any>('real gather', { act: split })).standing.enough, true);
  await assert.rejects(e.c.ask('real money record', { act: split }), /does not count yet: waiting for/);
  await svc.accept(split);
  const rec = await e.c.ask<Done>('real money record', { act: split });
  assert.ok(rec.lines.some((l) => /payee pointer now names the split service/.test(l.text)), JSON.stringify(rec.lines));
  const kr = await e.c.ask<any>('real keepers prepare', { collective, keepers: [keeper], keepersNeeded: 1 });
  assert.deepEqual(kr.reading.blocking, []);
  const clone = (await e.c.ask<Done>('real confirm', { plan: kr.plan, digest: kr.digest })).acts[0];
  for (const x of [iPa, iPh]) {
    const p = (await x.dub.c.ask<any>('proposals')).proposals.find((y: any) => y.act === clone);
    await x.dub.c.ask('accept', { thread: p.thread });
  }
  assert.equal((await e.c.ask<any>('real gather', { act: clone })).standing.enough, true);
  await e.c.ask<Done>('real keepers record', { act: clone });
  const kept1 = await e.c.ask<Done>('real keep', { collective, keeper });
  assert.ok(kept1.acts.length > 0);

  // 4. A text of the collective, sold by its own publication (round 8: an upload, then the publication, A's act for the
  // collective under the Agreements layer, iPa signing too; its price tag the service's); a buyer pays through a repost.
  await e.c.ask('publishing act as', { id: collective });
  const up = await e.c.ask<any>('publishing upload read', { media: 'text', data: b64(new TextEncoder().encode('Three verses, by three hands.')), title: 'Verses, by the collective', then: 'none' });
  assert.deepEqual(up.reading.blocking, []);
  const [bake] = (await e.c.ask<Done>('publishing confirm', { plan: up.plan, digest: up.digest })).acts;
  const pr = await e.c.ask<any>('publishing publication read', { sold: [bake], service: svc.id, referral: '10', price: '3000', tagBy: 'service' });
  assert.deepEqual(pr.reading.blocking, []);
  const [publication] = (await e.c.ask<Done>('publishing confirm', { plan: pr.plan, digest: pr.digest })).acts;
  assert.match(await svc.accept(publication), /signed, as its split service/);
  for (const x of [iPa, iPh]) {
    const pp = (await x.dub.c.ask<any>('proposals')).proposals.find((y: any) => y.act === publication);
    if (pp) await x.dub.c.ask('accept', { thread: pp.thread });
  }
  const g = await e.c.ask<{ lines: { text: string }[] }>('publishing gather');
  assert.ok(g.lines.some((l) => /is published by the collective .*: every party signed it/.test(l.text)), JSON.stringify(g.lines));
  assert.match(await svc.tag(publication, { unit: R, value: 3000 }), /./);
  const post = (await e.c.ask<any>('publishing')).publications.find((x: any) => x.id === publication).post;
  const reposter = await m.person(H, RL, { node: 'carol' });
  // The collective's post is signed by A with A's own key, naming the collective (rule 58): reposted as A's.
  await reposter.dub.c.ask('follow', { id: A.id, name: 'A' });
  await reposter.dub.c.ask('feed', { fresh: true });
  const rp = await reposter.dub.c.ask<{ id: string }>('repost', { post, signer: A.id });
  const buyer = await person(H, RL);
  await buyer.dub.c.ask('lane ask', { label: 'Dub', cap: '5000', unit: R });
  await buyer.damgar.c.ask('look');
  await buyer.damgar.c.ask('grant lane', { id: (await buyer.damgar.c.ask<{ items: ToSign[] }>('to sign')).items.find((i) => i.kind === 'lane')!.id });
  await buyer.dub.c.ask('follow', { id: reposter.id, name: 'Critic' });
  assert.equal((await buyer.dub.c.ask<{ items: any[] }>('feed', { fresh: true })).items.find((i) => i.id === rp.id)!.sealed.state, 'for sale');
  await buyer.dub.c.ask('buy', { publication: bake, seller: A.id, repost: rp.id, reposter: reposter.id });
  assert.ok((await svc.tick()).some((t) => /An invoice of its node sent/.test(t)));
  await buyer.damgar.c.ask('look');
  const bp = (await buyer.dub.c.ask<{ payments: PaymentShown[] }>('payments')).payments[0];
  await buyer.dub.c.ask('paid', { key: bp.key, proof: await m.pay(bp.pay!.invoice!) });
  const t1 = (await svc.tick()).join(' | ');
  assert.match(t1, /its receipt signed in the service’s own name/);
  assert.match(t1, /Split .*: 300 to .* \(referral\)/, t1);
  for (const v of [1350, 810, 540]) assert.match(t1, new RegExp(`Split .*${v} to`), t1);
  for (const x of [A, iPa, iPh, reposter]) await x.damgar.c.ask('look');
  const t2 = (await svc.tick()).join(' | ');
  assert.equal((t2.match(/Paid \d+ to/g) ?? []).length, 4, t2);
  for (const [x, value] of [[A, 1350], [iPa, 810], [iPh, 540], [reposter, 300]] as const) {
    await x.damgar.c.ask('look');
    const got = (await x.damgar.c.ask<Account>('account')).payments.find((y) => y.side === 'in' && y.other.id === svc.id);
    assert.equal(got?.amount.value, value, `${x.id.slice(0, 8)}’s payout`);
    assert.ok(got!.proofs.some((y) => y.kind === 'receipt' && y.rail.answer === 'valid'));
  }
  const d = await e.c.ask<{ lines: { text: string }[] }>('publishing deliver');
  assert.ok(d.lines.some((l) => /delivered to .*, as the collective/.test(l.text)), JSON.stringify(d.lines));
  await buyer.dub.c.ask('money look');
  const opened = (await buyer.dub.c.ask<{ items: any[] }>('feed', { fresh: true })).items.find((i) => i.id === rp.id)!;
  assert.equal(opened.sealed.text, 'Three verses, by three hands.');

  // 5. A vow of A's, sold twice; one sale confirmed, one contested, from Dub.
  await e.c.ask('publishing act as', { id: A.id });
  const vr = await e.c.ask<any>('publishing vow read', { words: 'A seat at the reading of the tablets, on the first evening.', title: 'A seat, vowed', price: '500' });
  assert.deepEqual(vr.reading.blocking, []);
  const [vow, , vpost] = (await e.c.ask<Done>('publishing confirm', { plan: vr.plan, digest: vr.digest })).acts;
  const vowBuyers = [buyer, await person(H, RL)];
  for (const b of vowBuyers) {
    if (b !== buyer) {
      await b.dub.c.ask('lane ask', { label: 'Dub', cap: '5000', unit: R });
      await b.damgar.c.ask('look');
      await b.damgar.c.ask('grant lane', { id: (await b.damgar.c.ask<{ items: ToSign[] }>('to sign')).items.find((i) => i.kind === 'lane')!.id });
    }
    await b.dub.c.ask('signing', { on: true });
    await b.dub.c.ask('follow', { id: A.id, name: 'A' });
    assert.equal((await b.dub.c.ask<{ items: any[] }>('feed', { fresh: true })).items.find((i) => i.id === vpost)!.vow.state, 'for sale');
    await b.dub.c.ask('vow buy', { vow, seller: A.id, post: vpost });
    await A.damgar.c.ask('look');
    const pays = (await b.dub.c.ask<{ payments: PaymentShown[] }>('payments')).payments.filter((p) => p.amount.value === 500);
    await b.dub.c.ask('paid', { key: pays[0].key, proof: await m.pay(pays[0].pay!.invoice!) });
  }
  await A.damgar.c.ask('look');
  const [v1, v2] = vowBuyers;
  assert.match((await v1.dub.c.ask<any>('vow confirm', { vow })).lines[0].text, /reads confirmed/);
  assert.match((await v2.dub.c.ask<any>('vow contest', { vow, promise: 'The seat was given to someone else.' })).lines[0].text, /reads contested/);
  const look = await e.c.ask<any>('publishing vow sales', { identity: A.id, relays: RL });
  const states = Object.fromEntries(look.vows[0].sales.map((x: any) => [x.buyer, x.state]));
  assert.deepEqual(states, { [v1.id]: 'confirmed', [v2.id]: 'contested' });

  // 6. The keeper records; iPh resigns from Dub's Signing tab; A's Edubba registers it; the keeper records it.
  const kept2 = await e.c.ask<Done>('real keep', { collective, keeper });
  assert.ok(kept2.acts.length > 0, 'the sale’s acts of the collective recorded');
  const founding = (await iPh.dub.c.ask<any>('proposals')).proposals.find((x: any) => x.act === terms);
  const lr = await iPh.dub.c.ask<any>('leave read', { thread: founding.thread });
  assert.ok(lr.lines.some((l: any) => /alone: nobody else’s signature is needed/.test(l.text)), JSON.stringify(lr.lines));
  const left = await iPh.dub.c.ask<any>('leave collective', { thread: founding.thread, digest: lr.digest });
  const reg = await e.c.ask<Done>('real register resignation', { collective, act: left.resignation });
  assert.match(reg.lines[0].text, /counts in no rule and no area/);
  await e.c.ask<Done>('real keep', { collective, keeper });
  const log = (await keeperLog(keeper, [...H, ...RL])).map((x) => x.act);
  assert.ok(log.includes(left.resignation), 'the keeper recorded the resignation');
  assert.ok(log.includes(clone) && log.includes(reg.acts[0]), 'and the money terms and the line registering it');
  assert.deepEqual((await e.c.ask<any>('real keepers', { collective })).disputes, []);
  assert.equal((await collectiveNow(collective, [...H, ...RL])).agreement, clone, 'its money terms in force');
});
