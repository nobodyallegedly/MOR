// The test wallet against the real regtest network that
// modules/lightning/regtest/up.sh started: skipped unless MOR_LN_REGTEST
// names its RUN_DIR. Bob makes an invoice committing to a description hash;
// alice reads it and pays it; the preimage is the invoice's.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { join } from 'node:path';
import { lnd, miner } from '../src/lnd.ts';
import { answer, checkRegtest, nodesOf } from '../src/server.ts';

const run = process.env.MOR_LN_REGTEST;

test('on regtest: an invoice made by bob, read and paid by alice; an on-chain send mined', { skip: !run && 'set MOR_LN_REGTEST to the RUN_DIR of up.sh' }, async () => {
  const w = { nodes: nodesOf(run!).map(lnd), mine: miner({ rpc: 'https://127.0.0.1:18334', cert: join(run!, 'btcd/rpc.cert') }) };
  await checkRegtest(w);
  const dh = randomBytes(32).toString('hex');
  const inv = (await answer(w, { op: 'invoice', node: 'bob', sat: 777, descriptionHash: dh })) as { invoice: string; hash: string };
  const d = (await answer(w, { op: 'decode', node: 'alice', invoice: inv.invoice })) as { sat: number; descriptionHash: string; destination: string };
  assert.equal(d.sat, 777);
  assert.equal(d.descriptionHash, dh);
  assert.equal(d.destination, (await w.nodes.find((n) => n.name === 'bob')!.info()).key);
  const paid = (await answer(w, { op: 'pay', node: 'alice', invoice: inv.invoice })) as { preimage: string };
  assert.equal(createHash('sha256').update(Buffer.from(paid.preimage, 'hex')).digest('hex'), inv.hash);
  const { key } = (await answer(w, { op: 'key', node: 'bob' })) as { key: string };
  assert.match(key, /^[0-9a-f]{64}$/, 'a key of the wallet, x-only');
  const { address } = (await answer(w, { op: 'address', node: 'carol' })) as { address: string };
  assert.match(address, /^bcrt1p/);
  const { txid } = (await answer(w, { op: 'send', node: 'alice', address, sat: 30_000 })) as { txid: string };
  assert.match(txid, /^[0-9a-f]{64}$/);
  assert.deepEqual(await answer(w, { op: 'mine', blocks: 1 }), { blocks: 1 });
});
