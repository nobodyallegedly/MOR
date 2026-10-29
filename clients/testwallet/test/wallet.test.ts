// The test wallet without a network: nodes in memory (each a Node, as
// `lnd.ts` makes from a real one), the program's guards, and its page in
// headless Chromium, by clicks. `regtest.test.ts` runs it against real
// regtest nodes. `MOR_SCREENSHOTS=DIR` keeps a picture of the page.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { join } from 'node:path';
import { chromium, type Browser } from 'playwright-core';
import type { Decoded, Node } from '../src/lnd.ts';
import { answer, checkRegtest, serve, type Wallet } from '../src/server.ts';

const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

/** A node in memory: its invoices, its payments (paying one learns its preimage). */
class MemoryNode implements Node {
  readonly key = `02${randomBytes(32).toString('hex')}`;
  link: Node['link'] = null;
  channels = 5_000_000;
  onchain = 100_000_000;
  invoices = new Map<string, { sat: number; preimage: string; descriptionHash: string; memo: string; to: MemoryNode }>();
  sent: { address: string; sat: number }[] = [];
  constructor(readonly name: string, readonly net: MemoryNode[], readonly network = 'regtest') {
    net.push(this);
  }
  async info() {
    return { key: this.key, network: this.network, height: 512, synced: true };
  }
  async balances() {
    return { channels: this.channels, onchain: this.onchain, unconfirmed: 0 };
  }
  private find(invoice: string) {
    for (const n of this.net) {
      const i = n.invoices.get(invoice.trim());
      if (i) return i;
    }
    throw new Error('invoice not valid');
  }
  async decode(invoice: string): Promise<Decoded> {
    const i = this.find(invoice);
    return { destination: i.to.key, sat: i.sat, paymentHash: createHash('sha256').update(Buffer.from(i.preimage, 'hex')).digest('hex'), description: i.memo, descriptionHash: i.descriptionHash };
  }
  async pay(invoice: string) {
    const i = this.find(invoice);
    if (i.to === this) throw new Error('cannot pay itself');
    this.channels -= i.sat;
    i.to.channels += i.sat;
    return { preimage: i.preimage, fee: 0 };
  }
  async invoice(sat: number, o: { descriptionHash?: string; memo?: string }) {
    const preimage = randomBytes(32).toString('hex');
    const invoice = `lnbcrt${sat}n1${randomBytes(20).toString('hex')}`;
    this.invoices.set(invoice, { sat, preimage, descriptionHash: o.descriptionHash ?? '', memo: o.memo ?? '', to: this });
    return { invoice, hash: createHash('sha256').update(Buffer.from(preimage, 'hex')).digest('hex') };
  }
  async bitcoinKey() {
    return randomBytes(32).toString('hex');
  }
  async address() {
    return `bcrt1p${randomBytes(20).toString('hex')}`;
  }
  async send(address: string, sat: number) {
    this.sent.push({ address, sat });
    this.onchain -= sat;
    return randomBytes(32).toString('hex');
  }
}

let browser: Browser;
before(async () => {
  browser = await chromium.launch({ executablePath: CHROMIUM });
});
after(async () => {
  await browser?.close();
});

const world = () => {
  const net: MemoryNode[] = [];
  const [alice, bob, carol] = ['alice', 'bob', 'carol'].map((n) => new MemoryNode(n, net));
  // What up.sh writes for each node (H114): its REST address, its receive-only permission file, its certificate.
  for (const [i, n] of [alice, bob, carol].entries()) n.link = { address: `https://127.0.0.1:${18080 + i}`, macaroon: `/tmp/mor-regtest/${n.name}/receive.macaroon`, cert: `/tmp/mor-regtest/${n.name}/tls.cert` };
  let mined = 0;
  const w: Wallet = { nodes: [alice, bob, carol], mine: async (n) => Array.from({ length: n }, () => String(++mined)) };
  return { w, alice, bob, carol, mined: () => mined };
};

test('a node on any network but regtest: the wallet refuses to start', async () => {
  const net: MemoryNode[] = [];
  await checkRegtest({ nodes: [new MemoryNode('alice', net)] });
  await assert.rejects(checkRegtest({ nodes: [new MemoryNode('alice', net), new MemoryNode('bob', net, 'mainnet')] }), /bob is on mainnet, not regtest/);
  await assert.rejects(checkRegtest({ nodes: [new MemoryNode('carol', net, 'testnet')] }), /only on regtest/);
});

test('what it asks of a node: amounts whole and above zero, a description hash 64 hex, a known node, a bounded mine', async () => {
  const { w, alice, bob, mined } = world();
  await assert.rejects(answer(w, { op: 'invoice', node: 'bob', sat: '0' }), /above zero/);
  await assert.rejects(answer(w, { op: 'invoice', node: 'bob', sat: '1.5' }), /whole number/);
  await assert.rejects(answer(w, { op: 'invoice', node: 'bob', sat: 10, descriptionHash: 'abc' }), /64 hexadecimal/);
  await assert.rejects(answer(w, { op: 'pay', node: 'mallory', invoice: 'x' }), /Choose one of the nodes/);
  await assert.rejects(answer(w, { op: 'mine', blocks: 201 }), /At most 200/);
  await assert.rejects(answer(w, { op: 'sign' }), /Unknown request/);
  const dh = 'ab'.repeat(32);
  const inv = (await answer(w, { op: 'invoice', node: 'bob', sat: '1500', descriptionHash: dh.toUpperCase() })) as { invoice: string; hash: string };
  const d = (await answer(w, { op: 'decode', node: 'alice', invoice: inv.invoice })) as Decoded;
  assert.equal(d.descriptionHash, dh, 'the hash kept as given, in lower case');
  assert.equal(d.sat, 1500);
  const paid = (await answer(w, { op: 'pay', node: 'alice', invoice: inv.invoice })) as { preimage: string };
  assert.equal(createHash('sha256').update(Buffer.from(paid.preimage, 'hex')).digest('hex'), inv.hash, 'the preimage is the proof of this invoice');
  assert.equal(bob.channels, 5_001_500);
  assert.equal(alice.channels, 4_998_500);
  const s = (await answer(w, { op: 'send', node: 'alice', address: ' bcrt1pxyz ', sat: 2000 })) as { txid: string };
  assert.match(s.txid, /^[0-9a-f]{64}$/);
  assert.deepEqual(alice.sent, [{ address: 'bcrt1pxyz', sat: 2000 }]);
  assert.deepEqual(await answer(w, { op: 'mine', blocks: 6 }), { blocks: 6 });
  assert.equal(mined(), 6);
});

test('the program: only at its own address, only with its header, its page under a strict policy', async () => {
  const { w } = world();
  const { server, base } = await serve(w);
  try {
    const page = await fetch(`${base}/`);
    assert.equal(page.status, 200);
    assert.match(page.headers.get('content-security-policy') ?? '', /default-src 'none'; script-src 'self'/);
    assert.match(await page.text(), /TEST WALLET · regtest only/);
    const ask = (h: Record<string, string>) => fetch(`${base}/api`, { method: 'POST', headers: h, body: JSON.stringify({ op: 'nodes' }) });
    assert.equal((await ask({ 'content-type': 'application/json', 'x-test-wallet': '1' })).status, 200);
    assert.equal((await ask({ 'content-type': 'application/json' })).status, 403, 'without the header a form cannot send');
    assert.equal((await ask({ 'content-type': 'text/plain', 'x-test-wallet': '1' })).status, 403);
    // Another name for this address (DNS rebinding): refused.
    const { request } = await import('node:http');
    const status = await new Promise<number>((res) => {
      const u = new URL(base);
      request({ host: u.hostname, port: u.port, path: '/', headers: { host: `wallet.example:${u.port}` } }, (r) => res(r.statusCode ?? 0)).end();
    });
    assert.equal(status, 421);
    assert.equal((await fetch(`${base}/../src/lnd.ts`)).status, 404);
  } finally {
    server.close();
  }
});

test('the page, by clicks: pay an invoice bob made, as alice; make an invoice with a description hash; send on-chain; mine', async () => {
  const { w, alice, bob, mined } = world();
  const { server, base } = await serve(w);
  const problems: string[] = [];
  try {
    const context = await browser.newContext({ viewport: { width: 700, height: 900 } });
    const page = await context.newPage();
    page.on('pageerror', (e) => problems.push(e.message));
    // The one refusal asked for below (a wrong hash) answers 400, which the browser logs.
    page.on('console', (m) => m.type() === 'error' && !/status of 400/.test(m.text()) && problems.push(m.text()));
    await page.goto(`${base}/`);
    await page.locator('.node').first().waitFor();
    assert.match(await page.locator('#test-label').innerText(), /^TEST WALLET · regtest only\. These are not bitcoins/);
    assert.equal(await page.locator('.node').count(), 3);
    assert.ok(await page.locator('input[name=node][value=alice]').isChecked(), 'alice, the payer, first');
    // Bob made an invoice (as Damgar asks the payee's wallet to); alice reads it, then pays it.
    const inv = await bob.invoice(1500, { descriptionHash: 'cd'.repeat(32) });
    // H114: carol's card says what Damgar's receive-only link asks for, each with Copy, and never the admin permission.
    const carolLink = page.locator('details.link', { hasText: 'carol' });
    await carolLink.locator('summary').click();
    const said = await carolLink.innerText();
    for (const x of ['https://127.0.0.1:18082', '/tmp/mor-regtest/carol/receive.macaroon', '/tmp/mor-regtest/carol/tls.cert', 'Never the admin permission']) assert.ok(said.includes(x), x);
    assert.equal(await carolLink.locator('[data-copy]').count(), 3);
    if (process.env.MOR_SCREENSHOTS) await page.screenshot({ path: join(process.env.MOR_SCREENSHOTS, 'testwallet-link.png'), fullPage: true });
    // H117: a whole `lightning:` link pasted is read as its invoice.
    await page.locator('#pay-invoice').fill(`lightning:${inv.invoice}`);
    await page.getByRole('button', { name: 'Read it' }).click();
    await page.locator('#pay-it').waitFor();
    const read = await page.locator('#pay-out').innerText();
    assert.match(read, /1 500 regtest sat/);
    assert.match(read, new RegExp(`Description hash ${'cd'.repeat(32)}`));
    assert.equal(alice.channels, 5_000_000, 'reading pays nothing');
    if (process.env.MOR_SCREENSHOTS) await page.screenshot({ path: join(process.env.MOR_SCREENSHOTS, 'testwallet-read.png'), fullPage: true });
    await page.locator('#pay-it').click();
    await page.locator('#preimage').waitFor();
    const preimage = await page.locator('#preimage').innerText();
    assert.equal(createHash('sha256').update(Buffer.from(preimage, 'hex')).digest('hex'), inv.hash);
    assert.equal(alice.channels, 4_998_500);
    assert.match(await page.locator('.node').first().innerText(), /in channels 4 998 500/);
    if (process.env.MOR_SCREENSHOTS) await page.screenshot({ path: join(process.env.MOR_SCREENSHOTS, 'testwallet-paid.png'), fullPage: true });
    // As bob: an invoice committing to a description hash.
    await page.locator('input[name=node][value=bob]').check();
    await page.locator('#inv-sat').fill('2100');
    await page.locator('#inv-dh').fill('ef'.repeat(32));
    await page.getByRole('button', { name: 'Make it' }).click();
    await page.locator('#made-invoice').waitFor();
    const made = bob.invoices.get(await page.locator('#made-invoice').innerText());
    assert.equal(made?.sat, 2100);
    assert.equal(made?.descriptionHash, 'ef'.repeat(32));
    // A wrong hash: said, nothing made.
    await page.locator('#inv-dh').fill('nope');
    await page.getByRole('button', { name: 'Make it' }).click();
    await page.locator('#invoice-out .error').waitFor();
    assert.match(await page.locator('#invoice-out').innerText(), /64 hexadecimal/);
    assert.equal(bob.invoices.size, 2);
    // On-chain, as alice: a send, then six blocks.
    await page.locator('input[name=node][value=alice]').check();
    await page.locator('#send-address').fill('bcrt1pdamgarpaytocontract');
    await page.locator('#send-sat').fill('25000');
    await page.getByRole('button', { name: 'Send it' }).click();
    await page.locator('#sent-txid').waitFor();
    assert.deepEqual(alice.sent, [{ address: 'bcrt1pdamgarpaytocontract', sat: 25000 }]);
    await page.getByRole('button', { name: "A Bitcoin key of this node's wallet" }).click();
    await page.locator('#bitcoin-key').waitFor();
    assert.match(await page.locator('#bitcoin-key').innerText(), /^[0-9a-f]{64}$/);
    await page.getByRole('button', { name: 'Mine' }).click();
    await page.getByText('Mined 6 blocks.').waitFor();
    assert.equal(mined(), 6);
    if (process.env.MOR_SCREENSHOTS) await page.screenshot({ path: join(process.env.MOR_SCREENSHOTS, 'testwallet-onchain.png'), fullPage: true });
    // The node chosen is kept while the page is open.
    await page.locator('input[name=node][value=carol]').check();
    await page.reload();
    await page.locator('.node').first().waitFor();
    assert.ok(await page.locator('input[name=node][value=carol]').isChecked());
    await context.close();
    assert.deepEqual(problems, []);
  } finally {
    server.close();
  }
});
