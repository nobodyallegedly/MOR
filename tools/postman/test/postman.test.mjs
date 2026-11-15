// The postman and the players' kit, end to end, on the reference relay (a
// real home on a local port) and a stand-in wallet. Test identities only.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
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
  const assent = k.agreementsSign('amp', 'statement', { agreement: terms.signed.id, terms: terms.signed.id, kind: 'assent', previous: null }, { held: [{ act: terms.signed.act }] });
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
  assert.throws(() => cli('post', 'amp', 'for hop only', '--private', '--to', h.identity, '--via', 'home-1'), /has no published encryption key in what you hold.*--get \/identity\//s);
  assert.equal(A.load('amp').lines.private.length, lines, 'nothing signed when it cannot be sealed');
  // It asks the home for hop's record, then seals.
  const rec = A.relayLetter('home-1', 'GET', `/identity/${h.identity}`);
  await w.pm.pass();
  assert.equal(A.answer(rec.name).status, 200);
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
