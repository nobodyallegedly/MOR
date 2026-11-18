// The postman and the players' kit, end to end, on the reference relay (a
// real home on a local port) and a stand-in wallet. Test identities only.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { BANK, SPECS, b64, hex, mor, sha256, unb64, unhex } from '../kit/lib/core.mjs';
import { Kit } from '../kit/lib/kit.mjs';
import { checkConfig } from '../lib/config.mjs';
import { LncliWallet, lastJson } from '../lib/wallet.mjs';
import { parseBudgets } from '../lib/bank.mjs';
import { readLog, round, startEcho, startHome } from './world.mjs';

let home;
let echo;
before(async () => {
  home = await startHome();
  echo = await startEcho();
});
after(async () => {
  await home?.stop();
  await echo?.stop();
});

const relays = () => ({ 'home-1': home.base, echo: echo.base });
const answerOf = (w, tray, letter) => w.kits[tray].answer(letter);
const kitCli = fileURLToPath(new URL('../kit/mor.mjs', import.meta.url));

test('a player makes an identity offline, signs a post and a Terms act, drops letters; the postman delivers them and brings back the relay’s answers verbatim', async () => {
  const w = round(['ampersand', 'hop'], relays());
  const k = w.kits.ampersand;
  const id = k.newIdentity('amp', [home.home]);
  assert.equal(k.resolve('amp').stop, 'end');
  const keys = JSON.parse(fs.readFileSync(join(w.root, 'ampersand', 'keys', 'amp.json'), 'utf8'));
  assert.equal(keys.identity, id.identity, 'the keys stay in the player’s own folder');
  const post = k.post('amp', 'a test loaf, nothing real');
  const terms = k.agreementsSign('amp', 'terms', { parties: [{ signer: id.identity }, { signer: '02'.repeat(32) }], authors: [0], body: { words: mor.workHash(new TextEncoder().encode('Each of us gives the other a test loaf; nothing real is owed.')), cmip: '04'.repeat(32), params: 'f6' }, previous: null });
  assert.equal(terms.check.verdict, 'pass', JSON.stringify(terms.check));
  assert.equal(mor.describeAct(terms.signed.act).spec, Kit.agreementsSpecs().terms.spec);
  const assent = k.agreementsSign('amp', 'statement', { agreement: terms.signed.id, terms: terms.signed.id, kind: 'assent', previous: terms.signed.id }, { held: [{ act: terms.signed.act }] });
  assert.equal(assent.check.verdict, 'pass', JSON.stringify(assent.check));
  // A draft that fails the check is never signed.
  const before = k.load('amp').lines.public.length;
  const bad = k.agreementsSign('amp', 'terms', { parties: [{ signer: id.identity }], authors: [3], body: { words: '05'.repeat(32), cmip: '04'.repeat(32), params: 'f6' }, previous: null });
  assert.equal(bad.signed, null);
  assert.notEqual(bad.check.verdict, 'pass');
  assert.equal(k.load('amp').lines.public.length, before, 'nothing signed, nothing added to the line');

  const letters = k.publish('home-1', [...k.chainActs('amp'), post.act, terms.signed.act, assent.signed.act]);
  const fetchBack = k.relayLetter('home-1', 'GET', `/acts/${terms.signed.id}`);
  assert.equal(await w.pm.pass(), letters.length + 1);
  for (const l of letters) {
    const a = answerOf(w, 'ampersand', l.name);
    assert.equal(a.outcome, 'answered');
    assert.equal(a.status, 200, JSON.stringify(a));
  }
  const got = answerOf(w, 'ampersand', fetchBack.name);
  assert.equal(got.status, 200);
  assert.deepEqual(got.bytes, terms.signed.act, 'the act comes back as signed');
  const direct = new Uint8Array(await (await fetch(`${home.base}/acts/${terms.signed.id}`)).arrayBuffer());
  assert.deepEqual(got.bytes, direct, 'byte for byte what the relay answers');
  assert.equal(got.bodySha256, sha256(direct));
  assert.equal(got.headers['content-type'], 'application/cbor');
  // The postman's log says what it carried, and holds no key.
  const log = readLog(w.cfg).filter((e) => e.event === 'carried');
  assert.equal(log.length, letters.length + 1);
  const logText = fs.readFileSync(join(w.cfg.postmanDir, 'log', 'carried.jsonl'), 'utf8');
  assert.ok(!logText.includes(keys.signingSecret) && !logText.includes(keys.chainKey.seeds), 'no key in the log');
  // The relay's signed answer (a home's receipt for the genesis) is in the answer, untouched.
  const g = answerOf(w, 'ampersand', letters[0].name);
  assert.ok(g.bytes.length > 0);
  // The same letter name is never carried twice.
  assert.equal(await w.pm.pass(), 0);
});

test('the kit on the command line: an identity, a post, a letter, its answer read', async () => {
  const w = round(['plain-words'], relays());
  const env = { ...process.env, MOR_FOLDER: join(w.root, 'plain-words') };
  const run = (...a) => execFileSync(process.execPath, [kitCli, ...a], { env, encoding: 'utf8' });
  const made = JSON.parse(run('identity', 'new', 'pw', '--home', `${home.operator}@${home.base}`));
  assert.match(made.identity, /^[0-9a-f]{64}$/);
  JSON.parse(run('publish', 'pw', '--to', 'home-1', '--chain'));
  const p = JSON.parse(run('post', 'pw', 'hello', 'from', 'the', 'kit'));
  run('publish', 'pw', '--to', 'home-1', join(w.root, 'plain-words', p.file));
  assert.throws(() => run('bank', 'invoice', 'pw', '--amount', '1.5'), /whole sats only/);
  await w.pm.pass();
  const listed = run('read');
  assert.equal(listed.trim().split('\n').length, 2);
  assert.match(listed, /answered 200/);
  const one = JSON.parse(run('read', listed.trim().split('\n')[1].split(' ')[0]));
  assert.equal(one.status, 200);
});

test('malformed and hostile bytes are delivered exactly as written', async () => {
  const w = round(['keep'], relays());
  const k = w.kits.keep;
  const junk = new Uint8Array([0xde, 0xad, 0xbe, 0xef, 0x00, 0xff, 0x0a, 0x0d]);
  const l1 = k.relayLetter('echo', 'POST', '/acts', junk);
  const l2 = k.relayLetter('home-1', 'POST', '/acts', junk);
  const big = new Uint8Array(300_000).fill(7);
  const l3 = k.relayLetter('echo', 'POST', '/media', big, { contentType: 'application/octet-stream' });
  const l4 = k.writeLetter('inline', { to: 'echo', method: 'POST', path: '/sealed', base64: b64(new Uint8Array([1, 2, 3])) });
  await w.pm.pass();
  const sent = echo.got.slice(-3);
  assert.deepEqual(sent[0].body, junk, 'not cleaned, not changed');
  assert.equal(sent[0].url, '/acts');
  assert.equal(sent[0].headers['content-type'], 'application/cbor');
  assert.deepEqual(sent[1].body, big);
  assert.equal(sent[1].headers['content-type'], 'application/octet-stream');
  assert.deepEqual(sent[2].body, new Uint8Array([1, 2, 3]));
  const a1 = answerOf(w, 'keep', l1.name);
  assert.equal(a1.status, 202);
  assert.equal(a1.headers['x-echo'], 'kept', 'headers come back');
  assert.deepEqual(a1.bytes, new Uint8Array([0xa0, 0x00, 0xff, 0x0a]), 'answer bytes verbatim');
  assert.equal(a1.sentBodySha256, sha256(junk));
  const a2 = answerOf(w, 'keep', l2.name);
  assert.equal(a2.outcome, 'answered');
  assert.ok(a2.status >= 400, 'the reference relay refuses junk itself, and its refusal comes back');
  assert.ok(mor.cborDecode(a2.bytes) instanceof Map, 'its CBOR error, as it wrote it');
  assert.equal(answerOf(w, 'keep', l3.name).sentBodyBytes, big.length);
  assert.equal(answerOf(w, 'keep', l4.name).status, 202);
});

test('the letter format is strict: an unknown relay, a path outside the API, a named file, a wait: refused, logged, nothing sent', async () => {
  const w = round(['until'], relays(), {});
  const k = w.kits.until;
  const n0 = echo.got.length;
  const bad = [
    ['norelay', { to: 'elsewhere', method: 'GET', path: '/info' }, /no relay is named "elsewhere"/],
    ['rawurl', { to: 'http://127.0.0.1:1/', method: 'GET', path: '/info' }, /no relay is named/],
    ['manage', { to: 'echo', method: 'GET', path: '/manage' }, /these parts of the relay API only/],
    ['dotdot', { to: 'echo', method: 'GET', path: '/acts/../manage' }, /"path"/],
    ['probe', { to: 'echo', method: 'POST', path: '/probe', base64: '' }, /these parts of the relay API only/],
    ['named', { to: 'echo', method: 'POST', path: '/acts', bodyFile: '../hop/keys/hopper.json' }, /carries no field "bodyFile"/],
    ['wait', { to: 'echo', method: 'GET', path: '/feed?after=0&wait=30' }, /does not hold a line open/],
    ['put', { to: 'echo', method: 'PUT', path: '/acts' }, /GET or POST/],
  ];
  for (const [name, env] of bad) k.writeLetter(name, env);
  fs.writeFileSync(join(w.root, 'until', 'out', 'notjson.letter.json'), '{"letter": 1, ');
  await w.pm.pass();
  for (const [name, , re] of bad) {
    const a = answerOf(w, 'until', name);
    assert.equal(a.outcome, 'refused', name);
    assert.match(a.reason, re, name);
  }
  assert.match(answerOf(w, 'until', 'notjson').reason, /not JSON/);
  assert.equal(echo.got.length, n0, 'nothing reached a relay');
  assert.equal(readLog(w.cfg).filter((e) => e.event === 'refused').length, bad.length + 1);
});

test('a symbolic link or a path trick in a tray is refused and logged, and never followed', async () => {
  const w = round(['ampersand', 'hop'], relays());
  const A = join(w.root, 'ampersand');
  const H = join(w.root, 'hop');
  w.kits.hop.newIdentity('hopper', [home.home]);
  w.pm.trays.forEach((t) => t.open());
  const secret = join(H, 'keys', 'hopper.json');
  const n0 = echo.got.length;
  // A letter whose body file is a link to another tray's keys.
  fs.writeFileSync(join(A, 'out', 'steal.letter.json'), JSON.stringify({ letter: 1, to: 'echo', method: 'POST', path: '/acts', body: 'file' }));
  fs.symlinkSync(secret, join(A, 'out', 'steal.body'));
  // A letter that is itself a link to another tray's letter.
  w.kits.hop.relayLetter('echo', 'GET', '/info', null, { name: 'hops-own' });
  fs.symlinkSync(join(H, 'out', 'hops-own.letter.json'), join(A, 'out', 'borrowed.letter.json'));
  // A body that is a hard link (a second name for a file).
  fs.writeFileSync(join(A, 'out', 'hard.letter.json'), JSON.stringify({ letter: 1, to: 'echo', method: 'POST', path: '/acts', body: 'file' }));
  fs.writeFileSync(join(A, 'mine.bin'), 'x');
  fs.linkSync(join(A, 'mine.bin'), join(A, 'out', 'hard.body'));
  // A pipe where a body should be.
  fs.writeFileSync(join(A, 'out', 'pipe.letter.json'), JSON.stringify({ letter: 1, to: 'echo', method: 'POST', path: '/acts', body: 'file' }));
  execFileSync('mkfifo', [join(A, 'out', 'pipe.body')]);
  // An answer name already taken by a link pointing into the other tray.
  w.kits.ampersand.relayLetter('echo', 'GET', '/info', null, { name: 'taken' });
  fs.symlinkSync(join(H, 'planted.json'), join(A, 'in', 'taken.answer.json'));
  await w.pm.pass();
  assert.match(answerOf(w, 'ampersand', 'steal').reason, /symbolic link: refused, never followed/);
  assert.match(answerOf(w, 'ampersand', 'borrowed').reason, /symbolic link: refused, never followed/);
  assert.match(answerOf(w, 'ampersand', 'hard').reason, /hard link/);
  assert.match(answerOf(w, 'ampersand', 'pipe').reason, /not a plain file/);
  assert.ok(!fs.existsSync(join(H, 'planted.json')), 'nothing written through the planted link');
  assert.ok(readLog(w.cfg).some((e) => e.letter === 'taken' && e.event === 'answer not written'));
  // Only hop's own letter went out, once, from hop's tray.
  const out = echo.got.slice(n0);
  assert.equal(out.length, 2, 'hop’s letter and ampersand’s "taken" only');
  assert.ok(!out.some((r) => Buffer.from(r.body).toString().includes('signingSecret')), 'no key carried');
  assert.equal(answerOf(w, 'hop', 'hops-own').outcome, 'answered');
  const refused = readLog(w.cfg).filter((e) => e.event === 'refused').map((e) => e.letter);
  for (const n of ['steal', 'borrowed.letter.json', 'hard', 'pipe']) assert.ok(refused.includes(n), `${n} logged`);

  // A tray whose in/ is a link to another tray's in/ is refused whole; nothing is written there.
  fs.rmSync(join(A, 'in'), { recursive: true });
  fs.symlinkSync(join(H, 'in'), join(A, 'in'));
  w.kits.ampersand.relayLetter('echo', 'GET', '/info', null, { name: 'via-link' });
  const hopIn = fs.readdirSync(join(H, 'in')).length;
  await w.pm.pass();
  assert.equal(fs.readdirSync(join(H, 'in')).length, hopIn, 'nothing written into hop’s in/');
  assert.ok(readLog(w.cfg).some((e) => e.tray === 'ampersand' && e.event === 'tray refused' && /symbolic link/.test(e.reason)));
});

test('letters never cross trays: each answer goes to its own tray, the same name in two trays is two letters', async () => {
  const w = round(['ampersand', 'hop', 'keep'], relays());
  w.kits.ampersand.relayLetter('echo', 'GET', '/acts/' + 'aa'.repeat(32), null, { name: 'same' });
  w.kits.hop.relayLetter('echo', 'GET', '/acts/' + 'bb'.repeat(32), null, { name: 'same' });
  await w.pm.pass();
  assert.equal(answerOf(w, 'ampersand', 'same').path, '/acts/' + 'aa'.repeat(32));
  assert.equal(answerOf(w, 'hop', 'same').path, '/acts/' + 'bb'.repeat(32));
  assert.deepEqual(fs.readdirSync(join(w.root, 'keep', 'in')), [], 'nothing in a third tray');
});

test('the order when letters wait: file name order within a tray, trays taking turns, starting one further along each pass', async () => {
  const w = round(['a', 'b', 'c'], relays());
  for (const n of ['a2', 'a1', 'a3']) w.kits.a.relayLetter('echo', 'GET', '/info', null, { name: n });
  w.kits.b.relayLetter('echo', 'GET', '/info', null, { name: 'b1' });
  w.kits.c.relayLetter('echo', 'GET', '/info', null, { name: 'c1' });
  await w.pm.pass();
  const order = (p) => readLog(w.cfg).filter((e) => e.event === 'carried' && e.pass === p).map((e) => e.letter);
  assert.deepEqual(order(0), ['a1', 'b1', 'c1', 'a2', 'a3']);
  for (const t of ['a', 'b', 'c']) w.kits[t].relayLetter('echo', 'GET', '/info', null, { name: `${t}9` });
  await w.pm.pass();
  assert.deepEqual(order(1), ['b9', 'c9', 'a9'], 'pass 1 starts with the second tray');
});

// ---------------------------------------------------------------- the bank

function bankWorld() {
  const w = round(['ampersand', 'hop', 'public-creators'], relays(), { public: ['public-creators'], companies: ['ampersand', 'hop'] });
  const a = w.kits.ampersand.newIdentity('amp', [home.home]);
  const h = w.kits.hop.newIdentity('hopper', [home.home]);
  return { w, a, h };
}

async function order(w, tray, name, kind, fields) {
  const l = w.kits[tray].bankOrder(name, kind, fields);
  await w.pm.pass();
  return w.kits[tray].answer(l.name);
}

test('the bank: accounts opened by signed orders, funded once, a real invoice paid between two players, whole sats only', async () => {
  const { w, a, h } = bankWorld();
  assert.equal((await order(w, 'ampersand', 'amp', 'open')).outcome, 'done');
  assert.equal((await order(w, 'hop', 'hopper', 'open')).outcome, 'done');
  // Funding: the company sum, once, to each company tray's first account.
  const plan = w.pm.bank.fund({ send: true, readTop: () => '' });
  assert.deepEqual(plan.filter((p) => p.done).map((p) => [p.tray, p.amount]), [['ampersand', 2_000_000], ['hop', 2_000_000]]);
  assert.equal(w.pm.bank.fund({ send: true, readTop: () => '' }).filter((p) => p.done).length, 0, 'never twice');
  w.pm.deliverNotices();
  assert.ok(w.kits.ampersand.answers().some((n) => n.includes('funded')));
  // Hop asks for 1,500 sats; ampersand pays.
  const inv = await order(w, 'hop', 'hopper', 'invoice', { amount: 1500, memo: 'a test loaf' });
  assert.equal(inv.outcome, 'done', JSON.stringify(inv));
  assert.deepEqual(lastJson(inv.bytes).payment_request, inv.invoice.payment_request, 'the node’s answer, verbatim');
  assert.deepEqual(inv.wallet.command, ['lncli (bob)', 'addinvoice', '--amt=1500', '--memo=a test loaf', '--expiry=604800']);
  const paid = await order(w, 'ampersand', 'amp', 'pay', { invoice: inv.invoice.payment_request, fee: 5 });
  assert.equal(paid.outcome, 'done', JSON.stringify(paid));
  const p = lastJson(paid.bytes);
  assert.equal(p.status, 'SUCCEEDED');
  assert.equal(sha256(unhex(p.payment_preimage)), inv.invoice.payment_hash, 'a real preimage of the invoice’s hash');
  assert.equal(paid.account.balance, 2_000_000 - 1500);
  const bal = await order(w, 'hop', 'hopper', 'balance');
  assert.equal(bal.account.balance, 2_000_000 + 1500, 'credited once the node shows the invoice paid');
  assert.ok(w.kits.hop.answers().some((n) => n.includes('-paid-')), 'a notice in the payee’s own tray');
  assert.ok(!w.kits.ampersand.answers().some((n) => n.includes('-paid-')));
  // Whole sats only: text, a fraction in CBOR, an invoice in millisats.
  const k = w.kits.ampersand;
  assert.throws(() => k.bankOrder('amp', 'invoice', { amount: 1.5 }), /whole sats only/);
  assert.throws(() => k.bankOrder('amp', 'invoice', { amount: '15' }), /whole sats only/);
  const forged = forgeOrder(k, 'amp', (m) => m.set('amount', 'x').set('do', 'invoice'), { textAmount: true });
  assert.match((await sendRaw(w, 'ampersand', forged)).reason, /whole sats only/);
  const float = forgeOrder(k, 'amp', null, { floatAmount: true });
  assert.match((await sendRaw(w, 'ampersand', float)).reason, /whole sats only/);
  const msat = w.wallet.external({ msat: 1_500_500 });
  const r = await order(w, 'ampersand', 'amp', 'pay', { invoice: msat });
  assert.equal(r.outcome, 'refused');
  assert.match(r.reason, /whole sats only: this invoice asks 1500500 millisats/);
  const zero = w.wallet.external({ amount: 0 });
  assert.match((await order(w, 'ampersand', 'amp', 'pay', { invoice: zero })).reason, /names no amount/);
  assert.equal((await order(w, 'ampersand', 'amp', 'pay', { invoice: zero, amount: 700 })).paid.amount, 700);
  // Not enough money: refused, nothing held.
  const big = await order(w, 'hop', 'hopper', 'invoice', { amount: 5_000_000 });
  const r2 = await order(w, 'ampersand', 'amp', 'pay', { invoice: big.invoice.payment_request });
  assert.match(r2.reason, /not enough/);
  assert.equal(r2.moved, 'nothing');
  // A failed payment releases what was held.
  const inv2 = await order(w, 'hop', 'hopper', 'invoice', { amount: 100 });
  w.wallet.failNext = 'FAILURE_REASON_NO_ROUTE';
  const f = await order(w, 'ampersand', 'amp', 'pay', { invoice: inv2.invoice.payment_request });
  assert.equal(f.outcome, 'failed');
  assert.equal(f.account.held, 0);
  assert.equal(lastJson(f.bytes).failure_reason, 'FAILURE_REASON_NO_ROUTE');
  // Every movement is in the journal.
  const j = fs.readFileSync(join(w.cfg.postmanDir, 'bank', 'journal.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  for (const kind of ['open', 'fund', 'invoice', 'hold', 'pay', 'receive', 'release']) assert.ok(j.some((e) => e.kind === kind), kind);
  assert.equal(j.find((e) => e.kind === 'pay').preimage, p.payment_preimage);
  void a;
  void h;
});

/** An order the kit would never sign, signed by hand with the identity's key: to test the bank's own refusals. */
function forgeOrder(k, name, edit, { textAmount, floatAmount, key, binding, tray } = {}) {
  const f = k.load(name);
  let payload;
  if (floatAmount) {
    // {"do": "invoice", "n": N, "tray": T, "amount": 1.5} with 1.5 as a CBOR float (0xf9 3e00)
    const head = mor.cborEncode(new Map([['n', f.bankN + 1], ['do', 'invoice'], ['tray', tray ?? k.tray]]));
    payload = new Uint8Array([0xa4, ...head.slice(1), 0x66, ...Buffer.from('amount'), 0xf9, 0x3e, 0x00]);
  } else {
    const m = new Map([['do', 'balance'], ['tray', tray ?? k.tray], ['n', f.bankN + 1]]);
    if (edit) edit(m);
    payload = mor.cborEncode(m);
  }
  void textAmount;
  const made = mor.makeEveryday({ signingSecret: key ?? unhex(f.signingSecret), signer: f.identity, binding: binding ?? f.binding, spec: BANK.spec, type: BANK.type, payload, sequence: f.lines.bank, public: true });
  return { order: b64(made.act), chain: f.chain };
}

async function sendRaw(w, tray, env, name = Kit.letterName('raw')) {
  w.kits[tray].writeLetter(name, { to: 'bank', ...env });
  await w.pm.pass();
  return w.kits[tray].answer(name);
}

test('the bank refuses an order with a bad signature, a replay, an order from another tray, and an order under a key replaced by a rotation', async () => {
  const { w } = bankWorld();
  const k = w.kits.ampersand;
  await order(w, 'ampersand', 'amp', 'open');
  w.pm.bank.fund({ send: true, readTop: () => '' });
  // Signed by another key in the identity's name.
  const forged = forgeOrder(k, 'amp', (m) => m.set('do', 'send').set('address', 'bcrt1qexampleexampleexample0').set('amount', 1000), { key: mor.newSigningSecret() });
  const r1 = await sendRaw(w, 'ampersand', forged);
  assert.equal(r1.outcome, 'refused');
  assert.match(r1.reason, /signature does not check against the identity's chain: the core library says "invalid"/);
  assert.equal(r1.moved, 'nothing');
  // The same signed order twice: the second is a replay.
  const env = forgeOrder(k, 'amp', null);
  assert.equal((await sendRaw(w, 'ampersand', env)).outcome, 'done');
  assert.match((await sendRaw(w, 'ampersand', env)).reason, /order number \d+ is spent/);
  // Ampersand's signed order carried from hop's tray (published, say, and copied).
  const k2 = forgeOrder(k, 'amp', (m) => m.set('n', 99));
  const r3 = await sendRaw(w, 'hop', k2);
  assert.match(r3.reason, /names the tray "ampersand"; it came from the tray "hop"/);
  const k3 = forgeOrder(k, 'amp', (m) => m.set('n', 100), { tray: 'hop' });
  assert.match((await sendRaw(w, 'hop', k3)).reason, /kept for the tray "ampersand", not "hop"/);
  // No chain given and none held: the identity cannot be checked.
  const lone = forgeOrder(w.kits.hop, 'hopper', null);
  assert.match((await sendRaw(w, 'hop', { order: lone.order })).reason, /cannot be followed: no-genesis/);
  // A rotation: it counts once its home's receipt shows it; from then on the old key moves no money.
  const amp = k.load('amp').identity;
  k.publish('home-1', k.chainActs('amp'));
  await w.pm.pass();
  const oldKey = unhex(k.load('amp').signingSecret);
  const oldBinding = k.load('amp').binding;
  const rot = k.rotate('amp');
  k.publish('home-1', [rot.rotation]);
  await w.pm.pass();
  const early = await order(w, 'ampersand', 'amp', 'balance');
  assert.equal(early.outcome, 'refused', 'no receipt shown yet: the rotation waits');
  assert.match(early.reason, /A rotation waits for proof .*identity evidence/);
  const r1l = k.relayLetter('home-1', 'GET', `/identity/${amp}`);
  const r2l = k.relayLetter('home-1', 'GET', `/identity/${home.operator}`);
  await w.pm.pass();
  assert.ok(k.evidence('amp', [k.answer(r1l.name).bytes, k.answer(r2l.name).bytes]) > 0);
  const now = await order(w, 'ampersand', 'amp', 'balance');
  assert.equal(now.outcome, 'done', JSON.stringify(now));
  const stale = forgeOrder(k, 'amp', (m) => m.set('n', 500), { key: oldKey, binding: oldBinding });
  assert.match((await sendRaw(w, 'ampersand', stale)).reason, /signed with the newest key the bank can show/);
  // A thief with the old key cannot even get the bank to drop the rotation: the bank keeps what it was shown.
  const staleNoEvidence = { ...stale, chain: [b64(k.chainActs('amp')[0])] };
  assert.match((await sendRaw(w, 'ampersand', staleNoEvidence)).reason, /newest key the bank can show/);
  // Not a bank order at all: a post.
  const post = k.post('amp', 'not an order');
  assert.match((await sendRaw(w, 'ampersand', { order: b64(post.act), chain: k.load('amp').chain })).reason, /not a bank order/);
});

test('the bank on-chain: a send debits amount and fee; an address credits a deposit once confirmed', async () => {
  const { w } = bankWorld();
  await order(w, 'ampersand', 'amp', 'open');
  await order(w, 'hop', 'hopper', 'open');
  w.pm.bank.fund({ send: true, readTop: () => '' });
  const addr = await order(w, 'hop', 'hopper', 'address');
  assert.equal(addr.outcome, 'done');
  const sent = await order(w, 'ampersand', 'amp', 'send', { address: addr.address, amount: 25_000, feerate: 2 });
  assert.equal(sent.outcome, 'done', JSON.stringify(sent));
  assert.equal(sent.sent.fee, 282);
  assert.equal(sent.account.balance, 2_000_000 - 25_000 - 282);
  assert.equal(lastJson(sent.bytes).txid, sent.sent.txid, 'the node’s txid, verbatim');
  await w.pm.pass();
  assert.equal((await order(w, 'hop', 'hopper', 'balance')).account.balance, 2_000_000, 'not before a block confirms it');
  w.wallet.mine(1);
  await w.pm.pass();
  assert.equal((await order(w, 'hop', 'hopper', 'balance')).account.balance, 2_025_000);
  await w.pm.pass();
  assert.equal((await order(w, 'hop', 'hopper', 'balance')).account.balance, 2_025_000, 'credited once');
});

test('the public windows’ budgets: identity and budget per line, the old address column ignored, whole sats only', async () => {
  const { w, h } = bankWorld();
  const pc = w.kits['public-creators'];
  const p1 = pc.newIdentity('ann', [home.home]);
  const p2 = pc.newIdentity('bo', [home.home]);
  await order(w, 'public-creators', 'ann', 'open');
  fs.writeFileSync(join(w.root, 'public-creators', 'addresses.md'), `# identity, address, budget\n${p1.identity}, bcrt1qold, 12,000 sats\n${p2.identity}, 2500\nnot-an-identity, 10\n${h.identity}, 5.5\n`);
  const readTop = (tray, file) => fs.readFileSync(join(w.root, tray, file));
  const plan = w.pm.bank.fund({ send: true, readTop });
  assert.ok(plan.some((p) => p.done && p.identity === p1.identity && p.amount === 12_000));
  assert.ok(plan.some((p) => p.wait && p.identity === p2.identity), 'waits until its account is open');
  assert.ok(plan.some((p) => /not an identity hash/.test(p.skip ?? '')));
  assert.ok(plan.some((p) => /not a whole number of sats/.test(p.skip ?? '')));
  await order(w, 'public-creators', 'bo', 'open');
  assert.ok(w.pm.bank.fund({ send: true, readTop }).some((p) => p.done && p.identity === p2.identity && p.amount === 2500));
  assert.equal(w.pm.bank.fund({ send: true, readTop }).filter((p) => p.done).length, 0);
  assert.deepEqual(parseBudgets('aa, 1'), [{ raw: 'aa, 1', error: 'the first field is not an identity hash (64 hexadecimal characters)' }]);
});

test('chain letters ask the regtest chain read-only questions, nothing else', async () => {
  const w = round(['hop'], relays());
  const k = w.kits.hop;
  const l1 = k.chainLetter('getblockcount');
  const l2 = k.chainLetter('getblockhash', 5);
  k.writeLetter('send', { to: 'chain', ask: 'sendrawtransaction', arg: '00' });
  k.writeLetter('badhash', { to: 'chain', ask: 'getblock', arg: '../../x' });
  await w.pm.pass();
  assert.equal(Buffer.from(k.answer(l1.name).bytes).toString().trim(), '600');
  assert.deepEqual(k.answer(l2.name).command, ['btcctl', 'getblockhash', '5']);
  assert.match(k.answer('send').reason, /asks one of/);
  assert.match(k.answer('badhash').reason, /takes a hash/);
});

test('the real tools are called with these arguments, never through a shell', async () => {
  const calls = [];
  const out = (o) => ({ code: 0, stdout: new Uint8Array(Buffer.from(JSON.stringify(o))), stderr: '' });
  const run = async (program, args) => {
    calls.push([program, ...args]);
    return out({ ok: true });
  };
  const wl = new LncliWallet({ lncli: '/T/lncli', btcctl: '/T/btcctl', regtest: '/R', nodes: { alice: '127.0.0.1:1', bob: '127.0.0.1:2', carol: '127.0.0.1:3' }, btcd: '127.0.0.1:4', rpcuser: 'u', rpcpass: 'p', payFrom: 'alice', invoiceOn: ['bob', 'carol'] }, run);
  const memo = 'a "loaf"; $(rm -rf ~) `x` && --amt=999';
  await wl.addInvoice('bob', { amount: 1500, memo, hash: undefined, expiry: 3600 });
  await wl.addInvoice('carol', { amount: 7, hash: 'ab'.repeat(32) });
  await wl.lookupInvoice('bob', 'cd'.repeat(32));
  await wl.decodePayReq('lnbcrt1');
  await wl.payInvoice('lnbcrt1', { feeLimit: 10 });
  await wl.payInvoice('lnbcrt0', { feeLimit: 0, amount: 70 });
  await wl.sendCoins('bcrt1qx', { amount: 25000, feerate: 2 });
  await wl.listChainTxns();
  await wl.newAddress();
  await wl.chain('getblockcount');
  await wl.chain('getblock', 'ef'.repeat(32), true);
  await wl.chain('getrawtransaction', '01'.repeat(32), false);
  const ln = (node, port) => ['/T/lncli', `--lnddir=/R/${node}`, '--network=regtest', `--rpcserver=127.0.0.1:${port}`];
  const btc = ['/T/btcctl', '--regtest', '--rpcuser=u', '--rpcpass=p', '--rpcserver=127.0.0.1:4', '--rpccert=/R/btcd/rpc.cert'];
  assert.deepEqual(calls, [
    [...ln('bob', 2), 'addinvoice', '--amt=1500', `--memo=${memo}`, '--expiry=3600'],
    [...ln('carol', 3), 'addinvoice', '--amt=7', `--description_hash=${'ab'.repeat(32)}`],
    [...ln('bob', 2), 'lookupinvoice', `--rhash=${'cd'.repeat(32)}`],
    [...ln('alice', 1), 'decodepayreq', '--pay_req=lnbcrt1'],
    [...ln('alice', 1), 'payinvoice', '--force', '--json', '--fee_limit=10', '--pay_req=lnbcrt1'],
    [...ln('alice', 1), 'payinvoice', '--force', '--json', '--fee_limit=0', '--amt=70', '--pay_req=lnbcrt0'],
    [...ln('alice', 1), 'sendcoins', '--addr=bcrt1qx', '--amt=25000', '--sat_per_vbyte=2'],
    [...ln('alice', 1), 'listchaintxns'],
    [...ln('alice', 1), 'newaddress', 'p2wkh'],
    [...btc, 'getblockcount'],
    [...btc, 'getblock', 'ef'.repeat(32), 'true'],
    [...btc, 'getrawtransaction', '01'.repeat(32), '0'],
  ]);
  // The answer a player sees names the call, never the hosts' folders or ports.
  const r = await wl.addInvoice('bob', { amount: 1 });
  assert.deepEqual(r.argv, ['lncli (bob)', 'addinvoice', '--amt=1']);
  // lncli payinvoice --json may print updates before the final one.
  assert.equal(lastJson(new TextEncoder().encode('{"status":"IN_FLIGHT"}\n{"status":"SUCCEEDED","x":"}"}\n')).status, 'SUCCEEDED');
});

test('the hosts’ configuration: no postman folder inside a tray, no management page, names not URLs', () => {
  const root = fs.realpathSync(fs.mkdtempSync(join(process.env.TMPDIR ?? '/tmp', 'mor-cfg-')));
  fs.mkdirSync(join(root, 'hop'));
  assert.throws(() => checkConfig({ root, trays: ['hop'], postmanDir: join(root, 'hop', 'pm') }), /lies inside the tray "hop"/);
  assert.throws(() => checkConfig({ root, trays: ['hop'], paths: ['acts', 'manage'] }), /never includes "manage"/);
  assert.throws(() => checkConfig({ root, trays: ['_hosts'] }), /not a tray name/);
  assert.throws(() => checkConfig({ root, trays: ['hop'], relays: { bank: 'http://127.0.0.1:1' } }), /"bank" and "chain" are the postman's own/);
  const example = JSON.parse(fs.readFileSync(new URL('../hosts.example.json', import.meta.url), 'utf8'));
  assert.ok(!/127\.0\.0\.1:\d/.test(JSON.stringify(example.relays)), 'the example names no real port');
});

test('the kit’s binding is the one built from this branch (CI builds it again and compares)', () => {
  const built = fileURLToPath(new URL('../../../clients/genesis/wasm/mor_wasm_bg.wasm', import.meta.url));
  if (!fs.existsSync(built)) return;
  const mine = fs.readFileSync(new URL('../kit/core/mor_wasm_bg.wasm', import.meta.url));
  if (process.env.MOR_KIT_BINDING_MUST_MATCH) assert.equal(sha256(fs.readFileSync(built)), sha256(mine));
  assert.equal(SPECS.identity, sha256('IDENTITY, test value until the freeze'));
  void hex;
  void unb64;
});

// ------------------------------------------------- after window one (the players' reports)

test('sealing: an encryption key published, a private post sealed to it through POST /sealed, opened by its recipient from the feed', async () => {
  const w = round(['ampersand', 'hop'], relays());
  const A = w.kits.ampersand;
  const H = w.kits.hop;
  const a = A.newIdentity('amp', [home.home]);
  const h = H.newIdentity('hopper', [home.home]);
  // Hop publishes its genesis and an encryption key (version 1) to its home.
  const ek = H.encryptionKey('hopper');
  assert.equal(ek.version, 1);
  assert.equal(mor.cborDecode(mor.describeAct(ek.act).payload).get(0), 1, 'the first encryption key is version 1');
  H.publish('home-1', [...H.chainActs('hopper'), ek.act]);
  A.publish('home-1', A.chainActs('amp'));
  await w.pm.pass();
  // Ampersand cannot seal to hop before it holds hop's record: refused, plainly, nothing signed.
  const lines = A.load('amp').lines.private.length;
  const cli = (...x) => execFileSync(process.execPath, [kitCli, ...x], { env: { ...process.env, MOR_FOLDER: join(w.root, 'ampersand') }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  assert.match(JSON.parse(cli('post', 'amp', 'for hop only', '--private', '--to', h.identity, '--via', 'home-1')).notYet, /nothing was signed: the kit does not hold an encryption key that counts/);
  assert.equal(A.load('amp').lines.private.length, lines, 'nothing signed when it cannot be sealed');
  // The kit wrote the letter asking the home for hop's record; after the pass, it seals.
  await w.pm.pass();
  assert.ok(A.answers().some((n) => n.includes('-record-') && A.answer(n).status === 200));
  const out = JSON.parse(cli('post', 'amp', 'for hop only', '--private', '--to', h.identity, '--via', 'home-1'));
  assert.ok(out.letter && out.sealed.startsWith('sealed/'));
  await w.pm.pass();
  const sent = A.answer(out.letter);
  assert.equal(sent.status, 200, JSON.stringify({ ...sent, bytes: undefined, body: sent.bytes && mor.cborDecode(sent.bytes) }));
  // Hop fetches what is addressed to it and opens it.
  const feed = H.relayLetter('home-1', 'GET', `/feed?to=${h.identity}`);
  await w.pm.pass();
  const opened = H.open('hopper', H.answer(feed.name).bytes);
  assert.equal(opened.length, 1);
  assert.equal(opened[0].opened, true);
  assert.equal(opened[0].act, out.signed);
  assert.equal(opened[0].described.signer, a.identity);
  assert.ok(fs.existsSync(join(w.root, 'hop', 'acts', `${out.signed}.key`)), 'the content key kept beside the act');
  // The sealed file itself opens too; and someone else's container does not open for ampersand.
  const file = join(w.root, 'ampersand', out.sealed);
  assert.equal(H.open('hopper', new Uint8Array(fs.readFileSync(file)))[0].opened, true);
  A.encryptionKey('amp');
  assert.equal(A.open('amp', new Uint8Array(fs.readFileSync(file)))[0].opened, false);
});

test('post --refs names the act it answers; sign refuses non-canonical text; agreements ask with no ask lists them', () => {
  const w = round(['ampersand'], relays());
  const k = w.kits.ampersand;
  k.newIdentity('amp', [home.home]);
  const first = k.post('amp', 'a question');
  const reply = k.post('amp', 'an answer', { refs: [first.id] });
  assert.deepEqual(mor.describeAct(reply.act).refs, [first.id]);
  const env = { ...process.env, MOR_FOLDER: join(w.root, 'ampersand') };
  const cli = (...x) => execFileSync(process.execPath, [kitCli, ...x], { env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const r2 = JSON.parse(cli('post', 'amp', 'another', '--refs', `${first.id},${reply.id}`));
  assert.deepEqual(mor.describeAct(fs.readFileSync(join(w.root, 'ampersand', r2.file))).refs, [first.id, reply.id]);
  const decomposed = 'café'; // not NFC
  const payload = hex(mor.cborEncode(new Map([[0, decomposed]])));
  const before = k.load('amp').lines.public.length;
  assert.throws(() => cli('sign', 'amp', '--spec', SPECS.text, '--type', '0', '--payload-hex', payload), /not canonical.*nothing was signed/s);
  assert.throws(() => k.post('amp', 'bell\u0007'), /not canonical/);
  assert.equal(k.load('amp').lines.public.length, before);
  const asks = JSON.parse(cli('agreements', 'ask'));
  assert.ok(asks.asks.some((a) => a.ask === 'in_force'));
});

test('a chain answer never carries the tool’s error output; a bank answer names no path or port of the hosts’ machine', async () => {
  const w = round(['hop'], relays());
  const k = w.kits.hop;
  w.wallet.chain = async (ask) => ({ argv: ['btcctl', ask], code: 1, stdout: new Uint8Array(), stderr: 'open /Users/host/.btcctl/btcctl.conf: no such file or directory\n' });
  const l = k.chainLetter('getblockcount');
  await w.pm.pass();
  const text = fs.readFileSync(join(w.root, 'hop', 'in', `${l.name}.answer.json`), 'utf8');
  assert.ok(!text.includes('/Users') && !text.includes('btcctl.conf'), text);
  assert.equal(k.answer(l.name).outcome, 'failed');
  assert.ok(readLog(w.cfg).some((e) => e.event === 'chain stderr (hosts only)' && /btcctl\.conf/.test(e.stderr)), 'kept in the hosts’ log');
  const { scrub } = await import('../lib/bank.mjs');
  assert.equal(scrub('dial tcp 127.0.0.1:10009: refused; open /Users/h/mor-regtest/alice/tls.cert'), 'dial tcp [an address on the hosts’ machine]: refused; open [a path on the hosts’ machine]');
});

test('the hosts’ relay names, from from-the-hosts/relays.md, in the kit’s help; the kit and the postman never use /tmp', () => {
  const w = round(['keep'], relays());
  fs.mkdirSync(join(w.root, 'keep', 'from-the-hosts'));
  fs.writeFileSync(join(w.root, 'keep', 'from-the-hosts', 'relays.md'), '- dubsar-home-1: a home\n- dubsar-relay-1: a relay\n');
  const env = { ...process.env, MOR_FOLDER: join(w.root, 'keep') };
  assert.match(execFileSync(process.execPath, [kitCli, 'help'], { env, encoding: 'utf8' }), /dubsar-home-1: a home/);
  assert.match(execFileSync(process.execPath, [kitCli, 'relays'], { env, encoding: 'utf8' }), /dubsar-relay-1/);
  const src = (d) => fs.readdirSync(d, { recursive: true }).filter((f) => f.endsWith('.mjs') && !f.startsWith('test')).map((f) => fs.readFileSync(join(d, f), 'utf8'));
  const here = fileURLToPath(new URL('..', import.meta.url));
  for (const s of src(here)) assert.ok(!/tmpdir|['"`]\/tmp/.test(s), 'no temporary folder outside the player’s own');
});

test('postman kit --send --update replaces the kit’s own files and nothing else of the player’s', () => {
  const w = round(['ampersand'], relays());
  const T = join(w.root, 'ampersand');
  fs.mkdirSync(join(T, 'from-the-hosts'));
  const cfgFile = join(w.cfg.postmanDir, 'hosts.json');
  fs.mkdirSync(w.cfg.postmanDir, { recursive: true });
  fs.writeFileSync(cfgFile, JSON.stringify({ root: w.root, trays: ['ampersand'], relays: relays(), postmanDir: w.cfg.postmanDir }));
  const pm = fileURLToPath(new URL('../postman.mjs', import.meta.url));
  const run = (...x) => execFileSync(process.execPath, [pm, 'kit', '--config', cfgFile, ...x], { encoding: 'utf8' });
  assert.match(run('--send'), /kit copied/);
  w.kits.ampersand.newIdentity('amp', [home.home]);
  const keys = fs.readFileSync(join(T, 'keys', 'amp.json'));
  fs.writeFileSync(join(T, 'kit', 'my-notes.txt'), 'mine');
  fs.writeFileSync(join(T, 'kit', 'mor.mjs'), '// an old kit');
  fs.writeFileSync(join(T, 'from-the-hosts', 'tray-guide.md'), 'old guide');
  assert.match(run('--send'), /left as it is/);
  assert.equal(fs.readFileSync(join(T, 'kit', 'mor.mjs'), 'utf8'), '// an old kit');
  assert.match(run('--send', '--update'), /kit updated/);
  assert.equal(fs.readFileSync(join(T, 'kit', 'mor.mjs'), 'utf8'), fs.readFileSync(kitCli, 'utf8'));
  assert.equal(fs.readFileSync(join(T, 'kit', 'my-notes.txt'), 'utf8'), 'mine', 'a file of the player’s in kit/ stays');
  assert.deepEqual(fs.readFileSync(join(T, 'keys', 'amp.json')), keys, 'keys untouched');
  assert.ok(fs.readdirSync(join(T, 'acts')).length > 0, 'acts untouched');
  assert.match(fs.readFileSync(join(T, 'from-the-hosts', 'tray-guide.md'), 'utf8'), /The tray guide/);
  // A kit/ that is a link is refused, never followed.
  fs.renameSync(join(T, 'kit'), join(T, 'kit-real'));
  fs.symlinkSync(join(T, 'keys'), join(T, 'kit'));
  assert.match(run('--send', '--update'), /refused: .*symbolic link/);
  assert.deepEqual(fs.readdirSync(join(T, 'keys')), ['amp.json']);
});

// ------------------------------------------------- after window two

test('agreements ask takes several files after one --acts; FIELDS examples sign; the author is offered the assent that counts', () => {
  const w = round(['counterparty'], relays());
  const k = w.kits.counterparty;
  const me = k.newIdentity('cp', [home.home]).identity;
  const T = k.agreementsSign('cp', 'terms', { parties: [{ signer: me }], authors: [0], body: { words: mor.workHash(new TextEncoder().encode('A test loaf.')), cmip: '04'.repeat(32), params: 'f6' }, previous: null });
  assert.ok(T.assent, 'the author who is a party is told the Terms are not in force');
  assert.match(T.assent.says, /not in force yet.*G4\.1/s);
  const offered = JSON.parse(fs.readFileSync(join(w.root, 'counterparty', 'acts', `${T.signed.id}.assent.json`), 'utf8'));
  assert.equal(offered.previous, T.signed.id, 'an author’s assent names the Terms in previous (section 3.2)');
  const env = { ...process.env, MOR_FOLDER: join(w.root, 'counterparty') };
  const cli = (...x) => execFileSync(process.execPath, [kitCli, ...x], { env, cwd: join(w.root, 'counterparty'), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const cmd = T.assent.command.replace(/^node kit\/mor\.mjs /, '').split(' ');
  const A = JSON.parse(cli(...cmd));
  assert.equal(A.check.verdict, 'pass');
  const tf = `acts/${T.signed.id}.mor`;
  const af = `acts/${A.signed}.mor`;
  const both = JSON.parse(cli('agreements', 'ask', 'in_force', T.signed.id, '--acts', tf, af));
  assert.equal(both[0].word, 'shown', 'both files read: in force');
  const one = JSON.parse(cli('agreements', 'ask', 'in_force', T.signed.id, '--acts', tf));
  assert.equal(one[0].word, 'not shown');
  // The FIELDS shapes: a counter signature after the assent; a report; previous: [] refused.
  const C = k.agreementsSign('cp', 'statement', { agreement: T.signed.id, terms: T.signed.id, kind: 'counter_signature', previous: A.signed }, { held: [{ act: T.signed.act }, { act: new Uint8Array(fs.readFileSync(join(w.root, 'counterparty', af))) }] });
  assert.equal(C.check.verdict, 'pass');
  const R = k.agreementsSign('cp', 'report', { call: { act: '0b'.repeat(32) }, lines: [{ line: 'received', amount: { unit: '0c'.repeat(32), value: 5 }, by: '0d'.repeat(32) }] });
  assert.equal(R.check.verdict, 'pass');
  assert.throws(() => k.agreementsSign('cp', 'statement', { agreement: T.signed.id, terms: T.signed.id, kind: 'assent', previous: [] }), /expected a string/);
  assert.ok(fs.readFileSync(new URL('../kit/AGREEMENTS-FIELDS.md', import.meta.url), 'utf8').includes('"previous": "TERMS-ID"'));
});

test('after an author signs an update of Terms, the line guard counts it as the author’s latest act in that agreement', () => {
  const w = round(['dublaw'], relays());
  const k = w.kits.dublaw;
  const me = k.newIdentity('dl', [home.home]).identity;
  const body = (t) => ({ words: mor.workHash(new TextEncoder().encode(t)), cmip: '04'.repeat(32), params: 'f6' });
  const T = k.agreementsSign('dl', 'terms', { parties: [{ signer: me }], authors: [0], body: body('A test loaf.'), previous: null });
  const held = [{ act: T.signed.act }];
  const A = k.agreementsSign('dl', 'statement', { agreement: T.signed.id, terms: T.signed.id, kind: 'assent', previous: T.signed.id }, { held });
  assert.equal(A.check.verdict, 'pass');
  held.push({ act: A.signed.act });
  const U = k.agreementsSign('dl', 'terms', { replaces: T.signed.id, agreement: T.signed.id, parties: [{ signer: me }], authors: [0], body: body('A test loaf, version 2.'), previous: A.signed.id }, { held });
  assert.equal(U.check.verdict, 'pass');
  held.push({ act: U.signed.act });
  // Naming the assent, not the update, would fork the author's own line: refused, nothing signed.
  assert.throws(() => k.agreementsSign('dl', 'statement', { agreement: T.signed.id, terms: U.signed.id, kind: 'assent', previous: A.signed.id }, { held }), /would fork your own line/);
  // Naming the update passes, with no "fork": true.
  const A2 = k.agreementsSign('dl', 'statement', { agreement: T.signed.id, terms: U.signed.id, kind: 'assent', previous: U.signed.id }, { held });
  assert.equal(A2.check.verdict, 'pass');
});

test('a stray file in keys/ is skipped with a warning, and a window-one encryption-key file is taken in', () => {
  const w = round(['pointer'], relays());
  const k = w.kits.pointer;
  k.newIdentity('pt', [home.home]);
  // A hand-made encryption key of window one: its act signed by the identity, its secret in a file of its own.
  const secret = mor.newEncryptionSecret();
  const made = k.sign('pt', { spec: SPECS.envelopes, type: 4, payload: mor.encryptionKeyPayload(1, undefined, mor.xwingPublic(secret)) });
  fs.writeFileSync(join(w.root, 'pointer', 'keys', 'pt-encryption.json'), JSON.stringify({ secret: hex(secret), note: 'window one' }));
  fs.writeFileSync(join(w.root, 'pointer', 'keys', 'notes.json'), '{"x": 1}');
  const env = { ...process.env, MOR_FOLDER: join(w.root, 'pointer') };
  const r = spawnKit(env, 'identity', 'list');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^pt [0-9a-f]{64}\n?$/);
  assert.match(r.stderr, /pt-encryption\.json is not an identity file: its encryption key \(version 1, act [0-9a-f]{64}\) was taken into keys\/pt\.json/);
  assert.match(r.stderr, /notes\.json is not an identity file and was skipped \(keys\/ holds identity files only/);
  assert.equal(k.load('pt').encryption[0].act, made.id);
  // seal and open work beside the stray files (no "f.chain is not iterable").
  const self = k.load('pt').identity;
  assert.throws(() => k.seal(k.post('pt', 'public').act, [self], null), /not addressed to .*Nothing was sealed/s);
  const mine = k.post('pt', 'to myself', { isPublic: false, to: [self] });
  const s = k.seal(mine.act, [self], null, mine.key);
  assert.equal(k.open('pt', s.sealed)[0].opened, true);
});

function spawnKit(env, ...a) {
  return spawnSync(process.execPath, [kitCli, ...a], { env, encoding: 'utf8' });
}

test('identity show reads the held evidence: a rotation with its home’s receipt is not pending', async () => {
  const w = round(['public-under-30'], relays());
  const k = w.kits['public-under-30'];
  const f = k.newIdentity('u', [home.home]);
  k.publish('home-1', k.chainActs('u'));
  await w.pm.pass();
  const rot = k.rotate('u');
  k.publish('home-1', [rot.rotation]);
  await w.pm.pass();
  assert.equal(k.resolve('u').stop, 'pending');
  k.relayLetter('home-1', 'GET', `/identity/${f.identity}`);
  k.relayLetter('home-1', 'GET', `/identity/${home.operator}`);
  await w.pm.pass();
  const r = k.resolve('u');
  assert.equal(r.stop, 'end', 'the records answered in in/ are read');
  assert.equal(r.links.length, 2);
});

test('sealing to someone whose key is not held writes the letters for their record and seals on the next try; a relay that refused /sealed is refused', async () => {
  const w = round(['prosumers', 'plain-words'], relays());
  const P = w.kits.prosumers;
  const Q = w.kits['plain-words'];
  P.newIdentity('p', [home.home]);
  const q = Q.newIdentity('q', [home.home]);
  const ek = Q.encryptionKey('q');
  Q.publish('home-1', [...Q.chainActs('q'), ek.act]);
  await w.pm.pass();
  const env = { ...process.env, MOR_FOLDER: join(w.root, 'prosumers') };
  const first = JSON.parse(spawnKit(env, 'post', 'p', 'hello', '--private', '--to', q.identity, '--via', 'home-1').stdout);
  assert.match(first.notYet, /nothing was signed.*run the same command again/s);
  assert.equal(first.letters.length, 1);
  assert.equal(P.load('p').lines.private.length, 0);
  await w.pm.pass();
  const second = JSON.parse(spawnKit(env, 'post', 'p', 'hello', '--private', '--to', q.identity, '--via', 'home-1').stdout);
  assert.ok(second.letter, JSON.stringify(second));
  // A relay that answered 404 to a sealed container is refused from then on.
  const n = P.relayLetter('echo', 'POST', '/sealed', new Uint8Array([1]));
  await w.pm.pass();
  const f = join(w.root, 'prosumers', 'in', `${n.name}.answer.json`);
  const a = JSON.parse(fs.readFileSync(f, 'utf8'));
  fs.unlinkSync(f);
  fs.writeFileSync(f, JSON.stringify({ ...a, status: 404 }));
  const r = spawnKit(env, 'post', 'p', 'again', '--private', '--to', q.identity, '--via', 'echo');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /echo answered 404 to a sealed container before: it does not take sealed containers/);
});

test('identity new --home NAME reads the home from its /info answer, writing the letter first when it is not held', async () => {
  const w = round(['stall'], relays());
  const env = { ...process.env, MOR_FOLDER: join(w.root, 'stall') };
  const r1 = spawnKit(env, 'identity', 'new', 's', '--home', 'home-1');
  assert.equal(r1.status, 1);
  assert.match(r1.stderr, /wrote the letters asking for them.*run the same command again/s);
  await w.pm.pass();
  const r2 = spawnKit(env, 'identity', 'new', 's', '--home', 'home-1');
  assert.equal(r2.status, 0, r2.stderr);
  const f = w.kits.stall.load('s');
  assert.deepEqual(f.homes, [{ operator: home.operator, hint: home.base, name: 'home-1' }]);
  assert.equal(mor.actId(unb64(f.chain[0])), f.identity);
  assert.equal(w.kits.stall.resolve('s').stop, 'end');
});

test('spec hash: the core library’s own, for a cMIP with its creator', () => {
  const w = round(['dublaw'], relays());
  const file = join(w.root, 'dublaw', 'cmip.md');
  fs.writeFileSync(file, 'A test cMIP.\n');
  const creator = '01'.repeat(32);
  const out = JSON.parse(spawnKit({ ...process.env, MOR_FOLDER: join(w.root, 'dublaw') }, 'spec', 'hash', file, '--creator', creator).stdout);
  const t = createHash('sha256').update('MOR/spec').digest();
  const want = createHash('sha256').update(t).update(t).update(mor.cborEncode(new Map([[0, 0], [1, unhex(creator)], [9, 'A test cMIP.']]))).digest('hex');
  assert.equal(out.hash, want);
  assert.equal(out.creator, creator);
});

// ------------------------------------------------- after window three

test('an encryption key signed under a rotation: published chain first, read from the record with the home operator’s record, sealed to on the third try', async () => {
  const w = round(['ampersand', 'counterparty'], relays());
  const A = w.kits.ampersand;
  const C = w.kits.counterparty;
  const a = A.newIdentity('amp', [{ ...home.home, name: 'home-1' }]);
  C.newIdentity('cp', [home.home]);
  A.publish('home-1', A.chainActs('amp'));
  await w.pm.pass();
  A.rotate('amp');
  // The rotation is not sent first: identity enckey sends the chain acts, then the key, to each home by name.
  const envA = { ...process.env, MOR_FOLDER: join(w.root, 'ampersand') };
  const ek = JSON.parse(spawnKit(envA, 'identity', 'enckey', 'amp').stdout);
  assert.deepEqual(ek.sentTo, ['home-1']);
  await w.pm.pass();
  for (const l of ek.letters) assert.equal(A.answer(l).status, 200, `${l}: no refusal for a key ahead of its rotation`);
  // Counterparty seals to ampersand: the record first, then (the key being signed under the rotation) the home operator's record.
  const envC = { ...process.env, MOR_FOLDER: join(w.root, 'counterparty') };
  const send = () => JSON.parse(spawnKit(envC, 'post', 'cp', 'for ampersand', '--private', '--to', a.identity, '--via', 'home-1').stdout);
  const t1 = send();
  assert.match(t1.notYet, /nothing was signed/);
  await w.pm.pass();
  const t2 = send();
  assert.match(t2.notYet, /nothing was signed/);
  assert.match(t2.why[0], /counts only with the receipts of the homes it had before, and with those homes' operators' records/);
  assert.ok(t2.why[0].includes(home.operator));
  await w.pm.pass();
  const t3 = send();
  assert.ok(t3.letter, JSON.stringify(t3));
  assert.deepEqual(t3.to.map((x) => x.encryptionKey), [ek.encryptionKey]);
  // A record fetched with a query (?parts=…) is read too.
  const w2 = round(['hop'], relays());
  const H = w2.kits.hop;
  H.newIdentity('h', [home.home]);
  H.relayLetter('home-1', 'GET', `/identity/${a.identity}?parts=1,2,4`);
  H.relayLetter('home-1', 'GET', `/identity/${home.operator}`);
  await w2.pm.pass();
  assert.equal(H.recipientKeys([a.identity])[0].act, ek.encryptionKey);
});

test('post --refs with a short id says why; post --file posts the file’s exact bytes; agreements words names its hash, and --sha256', () => {
  const w = round(['hop'], relays());
  const k = w.kits.hop;
  k.newIdentity('h', [home.home]);
  const env = { ...process.env, MOR_FOLDER: join(w.root, 'hop') };
  const r = spawnKit(env, 'post', 'h', 'a reply', '--refs', 'bd8efc72');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /--refs takes act or identity ids written whole.*not: bd8efc72.*short id is not enough.*Nothing was signed/s);
  const file = join(w.root, 'hop', 'words.txt');
  fs.writeFileSync(file, 'Each of us gives the other a test loaf.\n');
  // A final line break is not canonical text (Text rule 10): the file cannot be posted as it is, and words says so.
  const refused = spawnKit(env, 'post', 'h', '--file', file);
  assert.equal(refused.status, 1);
  assert.match(refused.stderr, /cannot be posted byte for byte.*Text rule 10.*remove it/s);
  const w0 = JSON.parse(spawnKit(env, 'agreements', 'words', file).stdout);
  assert.equal(w0.postable.asText, false);
  fs.writeFileSync(file, 'Each of us gives the other a test loaf.\nSecond line, no final break.');
  const p = JSON.parse(spawnKit(env, 'post', 'h', '--file', file).stdout);
  const posted = mor.cborDecode(mor.describeAct(fs.readFileSync(join(w.root, 'hop', p.file))).payload).get(0);
  assert.equal(posted, fs.readFileSync(file, 'utf8'), 'the file’s bytes exactly');
  const wh = JSON.parse(spawnKit(env, 'agreements', 'words', file).stdout);
  assert.equal(wh.postable.asText, true);
  assert.equal(wh.workHash, p.words.workHash);
  assert.match(wh.hash, /tagged_hash\("MOR\/work"/);
  assert.match(wh.note, /section 9, item 5/);
  const sh = JSON.parse(spawnKit(env, 'agreements', 'words', file, '--sha256').stdout);
  assert.equal(sh.sha256, sha256(fs.readFileSync(file)));
  assert.notEqual(sh.sha256, wh.workHash);
});

/** The record of an identity at a home, straight from the home: its encryption-key acts' ids. */
async function recordKeys(base, id) {
  const r = await fetch(`${base}/identity/${id}`);
  assert.equal(r.status, 200, `${base}/identity/${id}`);
  return (mor.cborDecode(new Uint8Array(await r.arrayBuffer())).get(4) ?? []).map((a) => mor.actId(a));
}

test('encryption keys and rotations at three homes, in each order: every accepted key is in each record; identity rotate and enckey send the chain first; a newer key not counting yet is asked for, then sealed to', async () => {
  const h2 = await startHome();
  const h3 = await startHome();
  try {
    const rel = { ...relays(), 'home-2': h2.base, 'home-3': h3.base };
    const bases = { 'home-1': home.base, 'home-2': h2.base, 'home-3': h3.base };
    const w = round(['ampersand', 'counterparty'], rel);
    const A = w.kits.ampersand;
    const C = w.kits.counterparty;
    const envA = { ...process.env, MOR_FOLDER: join(w.root, 'ampersand') };
    const envC = { ...process.env, MOR_FOLDER: join(w.root, 'counterparty') };
    const cli = (env, ...a) => {
      const r = spawnKit(env, ...a);
      assert.equal(r.status, 0, r.stderr);
      return JSON.parse(r.stdout);
    };
    const statuses = (k, letters) => letters.map((l) => k.answer(l).status);
    for (const n of Object.keys(bases)) A.relayLetter(n, 'GET', '/info');
    const a = A.newIdentity('amp', [{ ...home.home, name: 'home-1' }]);
    C.newIdentity('cp', [{ ...home.home, name: 'home-1' }]);
    A.publish('home-1', A.chainActs('amp'));
    await w.pm.pass();

    // Order 1: a key under the genesis, then a rotation adding two homes. identity rotate sends the chain and the key to all three.
    const k1 = cli(envA, 'identity', 'enckey', 'amp');
    assert.deepEqual(k1.sentTo, ['home-1']);
    await w.pm.pass();
    assert.ok(statuses(A, k1.letters).every((s) => s === 200));
    const rot = cli(envA, 'identity', 'rotate', 'amp', '--home', 'home-1', '--home', 'home-2', '--home', 'home-3');
    assert.deepEqual(rot.sentTo, ['home-1', 'home-2', 'home-3']);
    await w.pm.pass();
    assert.ok(statuses(A, rot.letters).every((s) => s === 200), JSON.stringify(statuses(A, rot.letters)));
    for (const b of Object.values(bases)) assert.deepEqual(await recordKeys(b, a.identity), [k1.encryptionKey], `${b}: the key under the genesis, carried to the new homes`);
    // The evidence the rotation's next step names is read from those answers.
    const ev = rot.next.match(/identity evidence amp (.*?) \(/)[1].split(' ');
    assert.equal(ev.length, 6);
    assert.ok(cli(envA, 'identity', 'evidence', 'amp', ...ev).kept > 0);

    // Counterparty seals: the key under the genesis counts after the rotation.
    const send = () => cli(envC, 'post', 'cp', 'for ampersand', '--private', '--to', a.identity, '--via', 'home-1');
    assert.match(send().notYet, /nothing was signed/);
    await w.pm.pass();
    const s1 = send();
    assert.deepEqual(s1.to.map((x) => x.encryptionKey), [k1.encryptionKey], JSON.stringify(s1));

    // Order 2: a key signed under the rotation, sent to a home before the rotation reached it: that home refuses it (409) and its record lacks it.
    const w2 = round(['pointer'], rel);
    const P = w2.kits.pointer;
    const envP = { ...process.env, MOR_FOLDER: join(w2.root, 'pointer') };
    const p = P.newIdentity('pt', [{ ...home.home, name: 'home-1' }]);
    P.publish('home-1', P.chainActs('pt'));
    await w2.pm.pass();
    P.rotate('pt');
    const early = P.encryptionKey('pt');
    const [bare] = P.publish('home-1', [early.act]);
    await w2.pm.pass();
    assert.equal(P.answer(bare.name).status, 409, 'a key ahead of its rotation is refused, not kept');
    assert.deepEqual(await recordKeys(home.base, p.identity), []);
    // identity enckey sends the chain first: the rotation, then the key; kept.
    const k2 = cli(envP, 'identity', 'enckey', 'pt', '--to', 'home-1');
    await w2.pm.pass();
    assert.ok(statuses(P, k2.letters).every((s) => s === 200));
    assert.deepEqual(await recordKeys(home.base, p.identity), [k2.encryptionKey]);

    // Order 3: ampersand publishes a newer key under its rotation, at home-2 only. Counterparty holding home-2's record and the
    // operators' records still lacks home-1's receipt for the rotation: the newer key does not count for it, and is said, not passed over.
    const v2 = A.encryptionKey('amp');
    A.publish('home-2', [v2.act]);
    await w.pm.pass();
    const w3 = round(['hop'], rel);
    const Hk = w3.kits.hop;
    const envH = { ...process.env, MOR_FOLDER: join(w3.root, 'hop') };
    Hk.newIdentity('h', [{ ...h2.home, name: 'home-2' }]);
    for (const n of Object.keys(bases)) Hk.relayLetter(n, 'GET', '/info');
    Hk.relayLetter('home-2', 'GET', `/identity/${a.identity}`);
    for (const [n, op] of [['home-1', home.operator], ['home-2', h2.operator], ['home-3', h3.operator]]) Hk.relayLetter(n, 'GET', `/identity/${op}`);
    await w3.pm.pass();
    const r0 = Hk.recipientKeys([a.identity])[0];
    assert.equal(r0.act, k1.encryptionKey, 'the newest key that counts for this reader');
    assert.deepEqual(r0.newer.map((x) => [x.act, x.version]), [[v2.id, 2]]);
    const t1 = cli(envH, 'post', 'h', 'for ampersand', '--private', '--to', a.identity, '--via', 'home-2');
    assert.match(t1.notYet, /nothing was signed/);
    assert.match(t1.why[0], /its record at home-1/, JSON.stringify(t1));
    await w3.pm.pass();
    // home-1's record carries its receipt for the rotation: the rotation counts, so v2 (held from home-2's record) counts.
    const t2 = cli(envH, 'post', 'h', 'for ampersand', '--private', '--to', a.identity, '--via', 'home-2');
    assert.deepEqual(t2.to.map((x) => x.encryptionKey), [v2.id], JSON.stringify(t2));
    assert.equal(t2.newerKeyNotCounting, undefined);

    // Where every record has been asked for and a newer key still does not count, the kit seals to the one that does and says so.
    const w4 = round(['keep'], rel);
    const K = w4.kits.keep;
    const envK = { ...process.env, MOR_FOLDER: join(w4.root, 'keep') };
    const q = K.newIdentity('q', [{ ...home.home, name: 'home-1' }]);
    K.publish('home-1', K.chainActs('q'));
    const q1 = K.encryptionKey('q');
    K.publish('home-1', [q1.act]);
    await w4.pm.pass();
    // A rotation adding home-3, sent there only (home-1, its home before, never sees it: no receipt that counts), and a key under it.
    K.rotate('q', { homes: [{ ...home.home, name: 'home-1' }, { ...h3.home, name: 'home-3' }] });
    const q2 = K.encryptionKey('q');
    K.publish('home-3', [...K.chainActs('q'), q1.act, q2.act]);
    await w4.pm.pass();
    const w5 = round(['stall'], rel);
    const S = w5.kits.stall;
    const envS = { ...process.env, MOR_FOLDER: join(w5.root, 'stall') };
    S.newIdentity('s', [{ ...home.home, name: 'home-1' }]);
    for (const n of Object.keys(bases)) S.relayLetter(n, 'GET', '/info');
    S.relayLetter('home-3', 'GET', `/identity/${q.identity}`);
    await w5.pm.pass();
    let last;
    for (let i = 0; i < 4; i++) {
      last = cli(envS, 'post', 's', 'for keep', '--private', '--to', q.identity, '--via', 'home-1');
      if (!last.notYet) break;
      await w5.pm.pass();
    }
    assert.ok(last.letter, JSON.stringify(last));
    assert.deepEqual(last.to.map((x) => x.encryptionKey), [q1.id]);
    assert.ok(last.newerKeyNotCounting, JSON.stringify(last));
    assert.match(last.newerKeyNotCounting[0], new RegExp(`version 2 \\(${q2.id}`));
  } finally {
    await h2.stop();
    await h3.stop();
  }
});

test('funding: a tray that is both a company and a public window gets the company sum once and each addresses.md line once', async () => {
  const w = round(['ampersand', 'backlot', 'hop'], relays(), { companies: ['ampersand', 'backlot', 'hop'], public: ['ampersand', 'backlot', 'ampersand'] });
  const A = w.kits.ampersand;
  const B = w.kits.backlot;
  const dao = A.newIdentity('dao', [home.home]);
  const m1 = A.newIdentity('m1', [home.home]);
  const m2 = A.newIdentity('m2', [home.home]);
  const b = B.newIdentity('b', [home.home]);
  const bm = B.newIdentity('bm', [home.home]);
  w.kits.hop.newIdentity('hp', [home.home]);
  for (const [k, n] of [[A, 'dao'], [A, 'm1'], [A, 'm2'], [B, 'b'], [B, 'bm'], [w.kits.hop, 'hp']]) k.bankOrder(n, 'open');
  await w.pm.pass();
  fs.writeFileSync(join(w.root, 'ampersand', 'addresses.md'), `# identity, budget\n${m1.identity}, 1000\n${m2.identity}, 2000\n${m1.identity}, 9999\n${dao.identity}, 300\n`);
  fs.writeFileSync(join(w.root, 'backlot', 'addresses.md'), `${bm.identity}, 400\n`);
  const readTop = (tray, file) => fs.readFileSync(join(w.root, tray, file));
  const dry = w.pm.bank.fund({ send: false, readTop });
  assert.equal(dry.filter((p) => p.done).length, 0, 'a dry run moves nothing');
  const plan = w.pm.bank.fund({ send: true, readTop });
  const done = plan.filter((p) => p.done).map((p) => [p.tray, p.identity, p.amount]);
  assert.deepEqual(done, [
    ['ampersand', dao.identity, 2_000_000],
    ['backlot', b.identity, 2_000_000],
    ['hop', w.kits.hop.load('hp').identity, 2_000_000],
    ['ampersand', m1.identity, 1000],
    ['ampersand', m2.identity, 2000],
    ['ampersand', dao.identity, 300],
    ['backlot', bm.identity, 400],
  ]);
  assert.ok(plan.some((p) => p.identity === m1.identity && /listed again/.test(p.skip ?? '')), 'a second line for the same identity is not credited');
  const bal = (id) => w.pm.bank.state.accounts[id].balance;
  assert.equal(bal(dao.identity), 2_000_300);
  assert.equal(bal(m1.identity), 1000);
  assert.equal(bal(m2.identity), 2000);
  assert.equal(bal(b.identity), 2_000_000);
  assert.equal(bal(bm.identity), 400);
  assert.equal(w.pm.bank.fund({ send: true, readTop }).filter((p) => p.done).length, 0, 'never twice');
  const j = fs.readFileSync(join(w.cfg.postmanDir, 'bank', 'journal.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  assert.equal(j.filter((e) => e.kind === 'fund').length, 7);
});

test('identity enckey keeps one key: --to publishes the newest existing key, a key is made only when none exists or with --new, and a new key goes to every home; identity keys says where each is', async () => {
  const h2 = await startHome();
  try {
    const rel = { ...relays(), 'home-2': h2.base };
    const w = round(['dubpay'], rel);
    const D = w.kits.dubpay;
    const env = { ...process.env, MOR_FOLDER: join(w.root, 'dubpay') };
    const cli = (...a) => {
      const r = spawnKit(env, ...a);
      assert.equal(r.status, 0, r.stderr);
      return JSON.parse(r.stdout);
    };
    const d = D.newIdentity('dp', [{ ...home.home, name: 'home-1' }, { ...h2.home, name: 'home-2' }]);
    // The first key: made, and sent to both homes in one command, even when --to names one.
    const k1 = cli('identity', 'enckey', 'dp', '--to', 'home-1');
    assert.match(k1.made, /first key/);
    assert.deepEqual(k1.sentTo, ['home-1', 'home-2']);
    await w.pm.pass();
    // Again, with --to: the same key, to that home only; no new key.
    const again = cli('identity', 'enckey', 'dp', '--to', 'home-2');
    assert.equal(again.encryptionKey, k1.encryptionKey);
    assert.equal(again.version, 1);
    assert.deepEqual(again.sentTo, ['home-2']);
    assert.match(again.made, /^nothing/);
    assert.equal(D.load('dp').encryption.length, 1);
    await w.pm.pass();
    // A key refused at a home (sent ahead of a rotation that home lacks) is shown as refused there.
    D.rotate('dp');
    const k2 = cli('identity', 'enckey', 'dp', '--new');
    assert.equal(k2.version, 2);
    assert.deepEqual(k2.sentTo, ['home-1', 'home-2'], 'a new key goes to every home');
    D.publish('home-1', [new Uint8Array(fs.readFileSync(join(w.root, 'dubpay', k1.file)))]);
    await w.pm.pass();
    for (const n of ['home-1', 'home-2']) D.relayLetter(n, 'GET', `/identity/${d.identity}`);
    await w.pm.pass();
    const keys = cli('identity', 'keys', 'dp').keys;
    assert.deepEqual(keys.map((k) => [k.version, k.newest]), [[1, false], [2, true]]);
    assert.deepEqual(keys[0].acceptedAt, ['home-1', 'home-2']);
    assert.deepEqual(keys[1].acceptedAt, ['home-1', 'home-2']);
    assert.deepEqual(keys[1].inRecordAt, ['home-1', 'home-2']);
    assert.deepEqual(keys[0].inRecordAt, ['home-1', 'home-2']);
    // A key sent alone to a home that lacks the rotation it is signed under: refused, and said.
    const w2 = round(['dubweb'], rel);
    const E = w2.kits.dubweb;
    const env2 = { ...process.env, MOR_FOLDER: join(w2.root, 'dubweb') };
    E.newIdentity('e', [{ ...home.home, name: 'home-1' }]);
    E.publish('home-1', E.chainActs('e'));
    await w2.pm.pass();
    E.rotate('e');
    const ek = E.encryptionKey('e');
    E.publish('home-1', [ek.act]);
    await w2.pm.pass();
    const r = JSON.parse(spawnKit(env2, 'identity', 'keys', 'e').stdout).keys;
    assert.deepEqual(r[0].refusedAt, { 'home-1': 409 });
    assert.deepEqual(r[0].acceptedAt, []);
    // Published again, chain first: accepted, and no longer listed as refused.
    JSON.parse(spawnKit(env2, 'identity', 'enckey', 'e').stdout);
    await w2.pm.pass();
    const r2 = JSON.parse(spawnKit(env2, 'identity', 'keys', 'e').stdout).keys;
    assert.equal(r2.length, 1);
    assert.deepEqual(r2[0].acceptedAt, ['home-1']);
    assert.equal(r2[0].refusedAt, undefined);
  } finally {
    await h2.stop();
  }
});
