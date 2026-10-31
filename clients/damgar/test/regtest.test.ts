// End to end on regtest, with real nodes: skipped unless MOR_LN_REGTEST
// names the RUN_DIR of modules/lightning/regtest/up.sh. Every payment goes
// through the test wallet's program (clients/testwallet), as a person's own
// wallet would: Damgar holds no wallet.
//
// - Lightning: a tip prepared in Dub, signed in the payer's Damgar, an
//   invoice made by the payee's lnd node (bob) committing to the payment,
//   paid by alice from the test wallet, the preimage pasted back and the
//   claim signed, the claim verified by the payee's Damgar and its receipt
//   signed, the receipt verified by the payer's.
// - On-chain: the same, to an address bound to the payment, sent by
//   alice's wallet and mined; both Damgars follow btcd's chain.
// - Anchoring: a collective's act, asked in Edubba, paid from Damgar to the
//   test anchoring service (its node: carol), the batch anchored on the
//   regtest chain and checked in Edubba at six confirmations.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { lnd, miner } from '../../testwallet/src/lnd.ts';
import { checkRegtest, nodesOf, serve as serveWallet } from '../../testwallet/src/server.ts';
import { btcd } from '../src/chain.ts';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { lnd as serviceLnd } from '../../anchoring-service/src/lnd.ts';
import { Service } from '../../anchoring-service/src/service.ts';
import { ACCEPTABLE } from '../src/specs.ts';
import { closeAll, damgar, edubba, founded, person, start, type Relay } from './world.ts';
import type { Account, PaymentShown, Rails, ToSign } from '../src/shapes.ts';
import { SPEC } from '../src/specs.ts';


const run = process.env.MOR_LN_REGTEST;
const skip = !run && 'set MOR_LN_REGTEST to the RUN_DIR of modules/lightning/regtest/up.sh';

let homes: Relay[];
let relay: Relay;
let wallet: { base: string; close(): void };

/** The test wallet, asked as its page asks it. */
const pay = async <T>(op: string, a: Record<string, unknown>): Promise<T> => {
  const r = await fetch(`${wallet.base}/api`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-test-wallet': '1' }, body: JSON.stringify({ op, ...a }) });
  const j = (await r.json()) as { ok?: T; error?: string };
  if (j.error) throw new Error(j.error);
  return j.ok as T;
};

before(async () => {
  if (!run) return;
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  const w = { nodes: nodesOf(run).map(lnd), mine: miner({ rpc: 'https://127.0.0.1:18334', cert: join(run, 'btcd/rpc.cert') }) };
  await checkRegtest(w);
  const s = await serveWallet(w);
  wallet = { base: s.base, close: () => s.server.close() };
});

// Every browser, app and server this file starts is stopped whatever the outcome, even where one before it fails (Part 4).
after(async () => {
  if (!run) return;
  try {
    wallet?.close();
    await closeAll();
  } finally {
    for (const h of [...(homes ?? []), relay]) await h?.stop().catch(() => undefined);
  }
});

const chain = () => btcd({ url: 'https://127.0.0.1:18334', user: 'u', pass: 'p', cert: join(run!, 'btcd/rpc.cert') });
const items = async (p: Awaited<ReturnType<typeof person>>) => {
  await p.damgar.c.ask('look');
  return (await p.damgar.c.ask<{ items: ToSign[] }>('to sign')).items;
};

test('regtest, Lightning: a tip from Dub, signed in Damgar, paid from the test wallet, the receipt verified by both Damgars', { skip, timeout: 300_000 }, async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const alice = await person(H, R, { chain: chain() });
  const bob = await person(H, R, { chain: chain() });
  const nodes = await pay<{ name: string; key: string }[]>('nodes', {});
  const bobNode = nodes.find((n) => n.name === 'bob')!.key;

  const rv = await bob.damgar.c.ask<{ digest: string }>('rails review', { lightning: bobNode, network: 3 });
  await bob.damgar.c.ask('rails publish', { lightning: bobNode, network: 3, digest: rv.digest });

  const post = await bob.dub.c.ask<{ post: { id: string } }>('post', { text: 'Tip me on regtest.' });
  await alice.dub.c.ask('tip', { post: post.post.id, signer: bob.id, value: '2100', unit: SPEC.units.regtest, whatFor: 'for the post' });
  const draft = (await items(alice)).find((i) => i.kind === 'draft')!;
  assert.equal(draft.amount?.said, '2 100 regtest satoshis');
  await alice.damgar.c.ask('sign draft', { id: draft.id });

  // Bob's wallet makes the invoice, committing to the description hash Damgar shows.
  const inv = (await items(bob)).find((i) => i.kind === 'invoice')!;
  const made = await pay<{ invoice: string }>('invoice', { node: 'bob', sat: 2100, descriptionHash: inv.descriptionHash });
  await bob.damgar.c.ask('answer invoice', { id: inv.id, invoice: made.invoice });

  // Alice pays it in her wallet, and pastes the preimage back.
  await alice.damgar.c.ask('look');
  const p = (await alice.damgar.c.ask<{ payments: PaymentShown[] }>('pay')).payments[0];
  assert.equal(p.pay?.invoice, made.invoice);
  const read = await pay<{ sat: number; descriptionHash: string; destination: string }>('decode', { node: 'alice', invoice: p.pay!.invoice });
  assert.deepEqual([read.sat, read.descriptionHash, read.destination], [2100, inv.descriptionHash, bobNode], 'what the wallet shows is what Damgar asked');
  const { preimage } = await pay<{ preimage: string }>('pay', { node: 'alice', invoice: p.pay!.invoice });
  const claimed = await alice.damgar.c.ask<{ lines: { text: string }[] }>('paid', { key: p.key, proof: preimage });
  assert.match(claimed.lines[0].text, /says valid/);

  // Bob's Damgar checks the claim from the rail's evidence; his receipt; Alice's Damgar verifies it.
  const rec = (await items(bob)).find((i) => i.kind === 'receipt')!;
  assert.ok(rec, 'a receipt to sign');
  await bob.damgar.c.ask('sign receipt', { key: rec.id });
  await alice.damgar.c.ask('look');
  const a = await alice.damgar.c.ask<Account>('account');
  assert.deepEqual(a.payments[0].proofs.map((x) => `${x.kind} ${x.rail.answer} ${x.standing}`).sort(), ['claim valid valid', 'receipt valid valid']);
  assert.deepEqual(a.totals.find((t) => t.label.startsWith('Went out'))!.amounts.map((x) => x.said), ['2 100 regtest satoshis']);
  const b = await bob.damgar.c.ask<Account>('account');
  assert.deepEqual(b.totals.find((t) => t.label.startsWith('Came in'))!.amounts.map((x) => x.said), ['2 100 regtest satoshis']);
});

test('regtest, on-chain: an address bound to the payment, sent from the test wallet, mined; valid at six confirmations; the receipt verified', { skip, timeout: 600_000 }, async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const alice = await person(H, R, { chain: chain() });
  const bob = await person(H, R, { chain: chain() });
  // Bob's Bitcoin key is his wallet's (bob's node), given by the test wallet; Damgar never holds it.
  const { key: bitcoinKey } = await pay<{ key: string }>('key', { node: 'bob' });
  const rv = await bob.damgar.c.ask<{ digest: string }>('rails review', { onchain: bitcoinKey, network: 3 });
  await bob.damgar.c.ask('rails publish', { onchain: bitcoinKey, network: 3, digest: rv.digest });
  assert.ok((await bob.damgar.c.ask<Rails>('rails')).requestKey);

  const post = await bob.dub.c.ask<{ post: { id: string } }>('post', { text: 'On-chain on regtest.' });
  await alice.dub.c.ask('tip', { post: post.post.id, signer: bob.id, value: '40000', unit: SPEC.units.regtest });
  await alice.damgar.c.ask('sign draft', { id: (await items(alice)).find((i) => i.kind === 'draft')!.id });
  await bob.damgar.c.ask('look'); // answered by itself, with the request key
  await alice.damgar.c.ask('look');
  const p = (await alice.damgar.c.ask<{ payments: PaymentShown[] }>('pay')).payments[0];
  assert.match(p.pay!.address!, /^bcrt1p/);

  const { txid } = await pay<{ txid: string }>('send', { node: 'alice', address: p.pay!.address, sat: 40000 });
  await pay('mine', { blocks: 1 });
  const first = await alice.damgar.c.ask<{ lines: { text: string }[] }>('paid', { key: p.key, proof: txid });
  assert.match(first.lines[0].text, /says pending/);
  await pay('mine', { blocks: 5 });
  const later = await alice.damgar.c.ask<{ lines: { text: string }[] }>('recheck', { key: p.key });
  assert.match(later.lines[0].text, /valid/);

  const rec = (await items(bob)).find((i) => i.kind === 'receipt')!;
  await bob.damgar.c.ask('sign receipt', { key: rec.id });
  await alice.damgar.c.ask('look');
  const a = await alice.damgar.c.ask<Account>('account');
  assert.deepEqual(a.payments[0].proofs.map((x) => `${x.kind} ${x.rail.answer}`).sort(), ['claim pending', 'claim valid', 'receipt valid']);
});

test('regtest, anchoring: a collective’s act, paid from Damgar via the test wallet, anchored by the test service (carol), checked in Edubba', { skip, timeout: 600_000 }, async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const carol = nodesOf(run!).find((n) => n.name === 'carol')!;
  // The service's batch transaction spends from carol's own wallet: funded here, so this test does not rest on the test wallet's having run first.
  const { address } = await pay<{ address: string }>('address', { node: 'carol' });
  await pay('send', { node: 'alice', address, sat: 30_000 });
  await pay('mine', { blocks: 1 });
  const svc = new Service(join(mkdtempSync(join(tmpdir(), 'damgar-svc-')), 'svc'), serviceLnd({ url: `https://127.0.0.1:${carol.rest}`, lnddir: carol.lnddir }), chain(), { homes: H, relays: R });
  await svc.start();
  const e = await edubba(H, R, chain());
  const { f, col } = await founded(H, R, e);
  await e.c.ask('acting as', { id: f.id });
  const g = await damgar(chain());
  await g.c.ask('bring', { id: f.id, words: f.words, address: H[0] });
  await g.c.ask('accept', { keys: ACCEPTABLE.map((a) => a.key) });

  const act = (await e.c.ask<{ act: string; label: string }[]>('money anchorable', { collective: col })).find((a) => /agreement in force/.test(a.label))!.act;
  const offer = (await e.c.ask<{ act: string }[]>('money offers', { service: svc.id }))[0].act;
  await e.c.ask('money anchor', { identity: f.id, collective: col, act, service: svc.id, offer, tier: 1 });
  await g.c.ask('look');
  await g.c.ask('sign draft', { id: (await g.c.ask<{ items: ToSign[] }>('to sign')).items.find((i) => i.kind === 'draft')!.id });
  await svc.tick();
  await g.c.ask('look');
  const p = (await g.c.ask<{ payments: PaymentShown[] }>('pay')).payments[0];
  assert.equal(p.stage, 'to pay', JSON.stringify(p));
  const { preimage } = await pay<{ preimage: string }>('pay', { node: 'alice', invoice: p.pay!.invoice });
  await g.c.ask('paid', { key: p.key, proof: preimage });
  const said = await svc.tick();
  assert.ok(said.some((l) => /Batch 1 anchored/.test(l)), said.join('\n'));
  await g.c.ask('look');
  const a = await g.c.ask<Account>('account');
  assert.deepEqual(a.payments[0].proofs.map((x) => `${x.kind} ${x.rail.answer}`).sort(), ['claim valid', 'receipt valid']);
  assert.equal((await e.c.ask<{ state: string }[]>('money anchors', { collective: col }))[0].state, 'pending');
  await pay('mine', { blocks: 6 });
  const done = await e.c.ask<{ state: string; lines: { text: string }[] }[]>('money anchors', { collective: col });
  assert.equal(done[0].state, 'anchored', JSON.stringify(done));
});

// ------------------------------------------------------------ round 2, on regtest (F338, F350, F351)

test('regtest, round 2: a tip from Dub under its lane, the invoice made by the payee’s own lnd through a receive-only link, receipted by itself; a sealed post bought through a repost on another relay, opened; the referral share paid', { skip, timeout: 600_000 }, async () => {
  const H = homes.map((h) => h.base);
  const other = await start('relay');
  try {
    const R = [relay.base];
    const regtest = SPEC.units.regtest;
    const nodes = await pay<{ name: string; key: string }[]>('nodes', {});
    const key = (n: string) => nodes.find((x) => x.name === n)!.key;
    const alice = await person(H, [other.base], { chain: chain() });
    const bob = await person(H, R, { chain: chain() });
    const critic = await person(H, [relay.base, other.base], { chain: chain() });
    const lnddir = (n: string) => join(run!, n);
    const linked = async (p: Awaited<ReturnType<typeof person>>, n: string, rest: number, payouts = false) => {
      const rv = await p.damgar.c.ask<{ digest: string }>('rails review', { lightning: key(n), network: 3 });
      await p.damgar.c.ask('rails publish', { lightning: key(n), network: 3, digest: rv.digest });
      // The admin permission is refused as too wide; the receive-only one kept.
      await assert.rejects(p.damgar.c.ask('link', { rest: `https://127.0.0.1:${rest}`, macaroonFile: join(lnddir(n), 'data/chain/bitcoin/regtest/admin.macaroon'), certFile: join(lnddir(n), 'tls.cert') }), /can read your node’s balance/);
      await p.damgar.c.ask('link', { rest: `https://127.0.0.1:${rest}`, macaroonFile: join(lnddir(n), 'receive.macaroon'), certFile: join(lnddir(n), 'tls.cert') });
      const own = await p.damgar.c.ask<{ digest: string }>('own lane review', { role: 'receipts', cap: '100000', unit: regtest });
      await p.damgar.c.ask('own lane', { role: 'receipts', cap: '100000', unit: regtest, digest: own.digest });
      if (payouts) {
        const po = await p.damgar.c.ask<{ digest: string }>('own lane review', { role: 'payouts', cap: '1000', unit: regtest });
        await p.damgar.c.ask('own lane', { role: 'payouts', cap: '1000', unit: regtest, digest: po.digest });
      }
    };
    await linked(bob, 'bob', 18081, true);
    await linked(critic, 'carol', 18082);

    // Alice's lane: asked in Dub, granted in Damgar.
    await alice.dub.c.ask('lane ask', { label: 'Dub on the Mac', cap: '5000', unit: regtest });
    const lane = (await items(alice)).find((i) => i.kind === 'lane')!;
    await alice.damgar.c.ask('grant lane', { id: lane.id });

    // A tip from Dub, under the lane: bob's lnd makes the invoice, through the link; alice pays it from her wallet.
    await alice.dub.c.ask('follow', { id: `${bob.id} ${relay.base}` });
    const post = await bob.dub.c.ask<{ post: { id: string } }>('post', { text: 'Tip me under a lane.' });
    await alice.dub.c.ask('tip now', { post: post.post.id, signer: bob.id, value: '2100', unit: regtest });
    const bl = await bob.damgar.c.ask<{ lines: { text: string }[] }>('look');
    assert.ok(bl.lines.some((l) => /invoice your node made through its receive-only link/.test(l.text)), JSON.stringify(bl.lines));
    const tp = (await alice.dub.c.ask<{ payments: PaymentShown[] }>('payments')).payments[0];
    const read = await pay<{ sat: number; destination: string }>('decode', { node: 'alice', invoice: tp.pay!.invoice });
    assert.deepEqual([read.sat, read.destination], [2100, key('bob')]);
    const { preimage } = await pay<{ preimage: string }>('pay', { node: 'alice', invoice: tp.pay!.invoice });
    await alice.dub.c.ask('paid', { key: tp.key, proof: preimage });
    const bl2 = await bob.damgar.c.ask<{ lines: { text: string }[] }>('look');
    assert.ok(bl2.lines.some((l) => /signed your receipt by itself/.test(l.text)), JSON.stringify(bl2.lines));
    const done = (await alice.dub.c.ask<{ done: PaymentShown[] }>('payments')).done[0];
    assert.equal(done.stage, 'settled');
    assert.deepEqual(done.proofs.map((x) => `${x.kind} ${x.rail.answer}`).sort(), ['claim valid', 'receipt valid']);

    // A sealed post, reposted by the critic at both relays; alice reads only the other.
    const sold = await bob.dub.c.ask<{ post: string }>('sell', { text: 'Sealed on regtest.', value: '1000', unit: regtest, referral: '10' });
    await critic.dub.c.ask('follow', { id: `${bob.id} ${relay.base}` });
    await critic.dub.c.ask('feed', { fresh: true });
    const rp = await critic.dub.c.ask<{ id: string }>('repost', { post: sold.post, signer: bob.id });
    await alice.dub.c.ask('follow', { id: critic.id });
    const seen = (await alice.dub.c.ask<{ items: any[] }>('feed', { fresh: true })).items.find((i) => i.id === rp.id);
    assert.equal(seen.sealed.state, 'for sale');
    await alice.dub.c.ask('buy', { publication: seen.sealed.publication, seller: bob.id, repost: rp.id, reposter: critic.id });
    await bob.damgar.c.ask('look');
    const bp = (await alice.dub.c.ask<{ payments: PaymentShown[] }>('payments')).payments[0];
    const paid = await pay<{ preimage: string }>('pay', { node: 'alice', invoice: bp.pay!.invoice });
    await alice.dub.c.ask('paid', { key: bp.key, proof: paid.preimage });
    const sl = await bob.damgar.c.ask<{ lines: { text: string }[] }>('look');
    assert.ok(sl.lines.some((l) => /A sale of your offer/.test(l.text)), JSON.stringify(sl.lines));
    await bob.dub.c.ask('money look');
    await alice.dub.c.ask('money look');
    const opened = (await alice.dub.c.ask<{ items: any[] }>('feed', { fresh: true })).items.find((i) => i.id === rp.id);
    assert.equal(opened.sealed.text, 'Sealed on regtest.');

    // The referral share: asked by bob's Damgar under its referral lane, invoiced by carol's lnd through the critic's link. Paid from alice's
    // node: on this network only alice's has spendable funds (bob's few thousand received sit below its channel's reserve); MOR checks the
    // invoice carol's node signed and the preimage, never which wallet paid.
    await bob.damgar.c.ask('look');
    await critic.damgar.c.ask('look');
    await bob.damgar.c.ask('look');
    const share = (await bob.damgar.c.ask<{ payments: PaymentShown[] }>('pay')).payments.find((p) => p.other.id === critic.id)!;
    assert.equal(share.amount.said, '100 regtest satoshis');
    const sp = await pay<{ preimage: string }>('pay', { node: 'alice', invoice: share.pay!.invoice! });
    await bob.damgar.c.ask('paid', { key: share.key, proof: sp.preimage });
    await critic.damgar.c.ask('look');
    const c = await critic.damgar.c.ask<Account>('account');
    assert.deepEqual(c.totals.find((t) => t.label.startsWith('Came in'))!.amounts.map((x) => x.said), ['100 regtest satoshis']);
  } finally {
    await other.stop();
  }
});
