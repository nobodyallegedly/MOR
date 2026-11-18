// The bank on the real regtest network (modules/lightning/regtest/up.sh):
// lncli and btcctl called for real. Runs only where the network is up:
//   MOR_LN_REGTEST=RUN_DIR LNCLI=…/lncli BTCCTL=…/btcctl node --test test/regtest.test.mjs
// The node addresses are up.sh's own (127.0.0.1 only, regtest coins only).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sha256, unhex } from '../kit/lib/core.mjs';
import { Postman } from '../lib/courier.mjs';
import { LncliWallet, lastJson } from '../lib/wallet.mjs';
import { round } from './world.mjs';

const R = process.env.MOR_LN_REGTEST;
const skip = !R || !process.env.LNCLI || !process.env.BTCCTL ? 'set MOR_LN_REGTEST, LNCLI and BTCCTL to run on the regtest network' : false;

test('the bank on regtest: an invoice made by bob or carol, paid by alice, credited; an on-chain send, confirmed and credited', { skip, timeout: 300_000 }, async () => {
  const wallet = new LncliWallet({
    lncli: process.env.LNCLI,
    btcctl: process.env.BTCCTL,
    regtest: R,
    nodes: { alice: '127.0.0.1:10009', bob: '127.0.0.1:10010', carol: '127.0.0.1:10011' },
    btcd: '127.0.0.1:18334',
    rpcuser: 'u',
    rpcpass: 'p',
    payFrom: 'alice',
    invoiceOn: ['bob', 'carol'],
  });
  const w = round(['ampersand', 'hop'], {});
  const pm = new Postman(w.cfg, { wallet });
  const op = '11'.repeat(32);
  w.kits.ampersand.newIdentity('amp', [{ operator: op, hint: 'http://127.0.0.1:1' }]);
  w.kits.hop.newIdentity('hopper', [{ operator: op, hint: 'http://127.0.0.1:1' }]);
  const order = async (tray, name, kind, fields) => {
    const l = w.kits[tray].bankOrder(name, kind, fields);
    await pm.pass();
    return w.kits[tray].answer(l.name);
  };
  assert.equal((await order('ampersand', 'amp', 'open')).outcome, 'done');
  assert.equal((await order('hop', 'hopper', 'open')).outcome, 'done');
  pm.bank.fund({ send: true, readTop: () => '' });

  const inv = await order('hop', 'hopper', 'invoice', { amount: 1500, memo: 'a test loaf' });
  assert.equal(inv.outcome, 'done', JSON.stringify(inv));
  assert.ok(['bob', 'carol'].includes(inv.invoice.node));
  assert.equal(lastJson(inv.bytes).payment_request, inv.invoice.payment_request);
  const paid = await order('ampersand', 'amp', 'pay', { invoice: inv.invoice.payment_request, fee: 10 });
  assert.equal(paid.outcome, 'done', JSON.stringify({ ...paid, bytes: Buffer.from(paid.bytes ?? []).toString() }));
  assert.equal(sha256(unhex(paid.paid.preimage)), inv.invoice.payment_hash, 'the preimage the node returned opens the invoice’s hash');
  assert.equal(paid.account.balance, 2_000_000 - 1500 - paid.paid.fee);
  assert.equal((await order('hop', 'hopper', 'balance')).account.balance, 2_001_500, 'credited once bob or carol shows it settled');

  const addr = await order('hop', 'hopper', 'address');
  assert.equal(addr.outcome, 'done', JSON.stringify(addr));
  const sent = await order('ampersand', 'amp', 'send', { address: addr.address, amount: 30_000 });
  assert.equal(sent.outcome, 'done', JSON.stringify({ ...sent, bytes: Buffer.from(sent.bytes ?? []).toString() }));
  assert.ok(sent.sent.fee > 0 && sent.sent.fee <= 5000);
  await wallet.btc('generate', '1');
  for (let i = 0; i < 30; i++) {
    await pm.pass();
    if (pm.bank.state.accounts[w.kits.hop.load('hopper').identity].balance > 2_001_500) break;
    await new Promise((r) => setTimeout(r, 1000));
  }
  assert.equal((await order('hop', 'hopper', 'balance')).account.balance, 2_001_500 + 30_000);

  const cl = w.kits.hop.chainLetter('getblockcount');
  await pm.pass();
  assert.match(Buffer.from(w.kits.hop.answer(cl.name).bytes).toString(), /^\d+\s*$/);
});
