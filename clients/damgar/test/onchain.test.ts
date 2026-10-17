// An on-chain payment, without btcd: the payee's pointer names a Bitcoin key
// and the request key Damgar made (its cost said where it is made); the
// payer's invoice request is answered by the payee's Damgar by itself with
// the request signed; the address bound to the payment alone; paid on a
// regtest chain the test mines; the claim written at payment (pending),
// then, at six confirmations on the chain followed, a second claim
// (valid), which the payee's Damgar checks before its receipt. And the
// request key replaced by a new payee pointer.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { onchainKey, onchainPayTo } from '../../genesis/src/core.ts';
import { closeAll, everything, person, refused, start, type Relay } from './world.ts';
import { FakeChain } from './chain.ts';
import type { Account, PaymentShown, Rails, ToSign } from '../src/shapes.ts';
import { SPEC } from '../src/specs.ts';
import { REQUEST_KEY_SAY } from '../src/damgar.ts';
import { randomBytes } from 'node:crypto';

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

const items = async (p: Awaited<ReturnType<typeof person>>) => {
  await p.damgar.c.ask('look');
  return (await p.damgar.c.ask<{ items: ToSign[] }>('to sign')).items;
};

test('on-chain: an address bound to the payment, answered by the payee’s Damgar with its request key; pending at payment, valid at six confirmations; the receipt after', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const chain = new FakeChain();
  const alice = await person(H, R, { chain });
  const bob = await person(H, R, { chain });
  const bitcoinKey = onchainKey(new Uint8Array(randomBytes(32))) as string;

  const rv = await bob.damgar.c.ask<{ digest: string; costs: { text: string }[] }>('rails review', { onchain: bitcoinKey, network: 3 });
  for (const t of REQUEST_KEY_SAY) assert.ok(rv.costs.some((c) => c.text.endsWith(t)), 'the request key’s cost is said where it is made');
  assert.ok(rv.costs.some((c) => /amount is in the clear/.test(c.text)), 'the on-chain Module’s costs are shown');
  await bob.damgar.c.ask('rails publish', { onchain: bitcoinKey, network: 3, digest: rv.digest });
  const rails = await bob.damgar.c.ask<Rails>('rails');
  assert.ok(rails.requestKey);
  assert.match(rails.pointer!.rails[0].said, /its requests signed by the key/);

  await alice.dub.c.ask('tip', { post: (await bob.dub.c.ask<{ post: { id: string } }>('post', { text: 'on-chain please' })).post.id, signer: bob.id, value: '5000', unit: SPEC.units.regtest });
  const d = (await items(alice)).find((i) => i.kind === 'draft')!;
  assert.ok(d.lines.some((l) => /On on-chain/.test(l.text)), JSON.stringify(d.lines));
  await alice.damgar.c.ask('sign draft', { id: d.id });
  // Bob's Damgar answers by itself: nothing for Bob to do.
  const answered = await bob.damgar.c.ask<{ lines: { text: string }[] }>('look');
  assert.ok(answered.lines.some((l) => /answered by itself/.test(l.text)), JSON.stringify(answered));
  assert.equal((await items(bob)).filter((i) => i.kind === 'invoice').length, 0);

  await alice.damgar.c.ask('look');
  const p = (await alice.damgar.c.ask<{ payments: PaymentShown[] }>('pay')).payments[0];
  assert.match(p.pay!.address!, /^bcrt1p/);
  // Paid from the "wallet": a transaction to that address, broadcast, not mined.
  const pay = (await alice.damgar.app.store.read<any>(alice.id, 'book')).payments[p.key];
  const to = onchainPayTo(Buffer.from(pay.address, 'base64'), p.key) as { script: string; address: string };
  assert.equal(to.address, p.pay!.address);
  // A transaction paying another address is refused.
  const wrong = chain.pay('5120' + '11'.repeat(32), 5000);
  await refused(alice.damgar.c.ask('paid', { key: p.key, proof: wrong }), /pays nothing to/);
  const txid = chain.pay(to.script, 5000);
  const first = await alice.damgar.c.ask<{ lines: { text: string }[] }>('paid', { key: p.key, proof: txid });
  assert.match(first.lines[0].text, /says pending/);
  // Not yet: one confirmation.
  chain.mine(1);
  const early = await alice.damgar.c.ask<{ lines: { text: string }[] }>('recheck', { key: p.key });
  assert.match(early.lines[0].text, /Not yet: pending/);
  chain.mine(5);
  const later = await alice.damgar.c.ask<{ lines: { text: string }[] }>('recheck', { key: p.key });
  assert.match(later.lines[0].text, /valid/);

  const rec = (await items(bob)).find((i) => i.kind === 'receipt')!;
  await bob.damgar.c.ask('sign receipt', { key: rec.id });
  await alice.damgar.c.ask('look');
  const a = await alice.damgar.c.ask<Account>('account');
  const answers = a.payments[0].proofs.map((x) => `${x.kind} ${x.rail.answer}`).sort();
  assert.deepEqual(answers, ['claim pending', 'claim valid', 'receipt valid']);

  // The request key replaced: a new pointer names a new key; the old one no longer counts.
  const old = rails.requestKey;
  const rv2 = await bob.damgar.c.ask<{ digest: string }>('rails review', { onchain: bitcoinKey, network: 3, newRequestKey: true });
  const done = await bob.damgar.c.ask<{ lines: { text: string }[] }>('rails publish', { onchain: bitcoinKey, network: 3, newRequestKey: true, digest: rv2.digest });
  assert.match(done.lines[0].text, /names a new request key: the old one no longer counts/);
  const r2 = await bob.damgar.c.ask<Rails>('rails');
  assert.notEqual(r2.requestKey, old);
  assert.equal(r2.pointer!.version, 2);
  // Damgar keeps the request keys (the new and the earlier), and no secret of the Bitcoin key: it never had one.
  const keys = await bob.damgar.app.store.read<{ request: string; earlier: string[] }>(bob.id, 'keys');
  assert.equal(keys!.earlier.length, 1);
  assert.ok(everything(bob.damgar.dir).length > 0);
});

test('the web client follows no chain: an on-chain proof cannot be read there, said', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const chain = new FakeChain();
  const alice = await person(H, R, { chain: null });
  const bob = await person(H, R, { chain });
  const k = onchainKey(new Uint8Array(randomBytes(32))) as string;
  const rv = await bob.damgar.c.ask<{ digest: string }>('rails review', { onchain: k, network: 3 });
  await bob.damgar.c.ask('rails publish', { onchain: k, network: 3, digest: rv.digest });
  await alice.dub.c.ask('tip', { post: (await bob.dub.c.ask<{ post: { id: string } }>('post', { text: 'x' })).post.id, signer: bob.id, value: '700', unit: SPEC.units.regtest });
  await alice.damgar.c.ask('sign draft', { id: (await items(alice)).find((i) => i.kind === 'draft')!.id });
  await bob.damgar.c.ask('look');
  await alice.damgar.c.ask('look');
  const p = (await alice.damgar.c.ask<{ payments: PaymentShown[] }>('pay')).payments[0];
  await refused(alice.damgar.c.ask('paid', { key: p.key, proof: 'ab'.repeat(32) }), /follows no chain/);
});
