// The three ways to pay from another app (decided by Nobody, allegedly, 21
// October 2026): (1) by hand, the payment copied from Dub and pasted into
// Damgar, read in plain words and signed there; (2) Ask Damgar, a money
// message Damgar queues in Waiting, and (2A) on this computer Damgar woken,
// its panel drawn for Dub's window, readable and answerable only inside its
// frame; (3) a lane with a cap per act and a cap in all (the grant limits
// cMIP, draft 3), kept by Dub and counted in Damgar, which keeps the record
// of Dub's payments under the lane and shows any overspend. Each from a post
// (a tip) and from a profile (Pay). Real homes and a relay on local ports.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { closeAll, person, refused, start, type Relay } from './world.ts';
import { TestNode } from './node.ts';
import type { LaneShown, PaymentShown, ToSign } from '../src/shapes.ts';
import { SPEC } from '../src/specs.ts';

let homes: Relay[];
let relay: Relay;

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
});

// Every app and server this file starts is stopped whatever the outcome, even where one before it fails (Part 4).
after(async () => {
  try {
    await closeAll();
  } finally {
    for (const h of [...homes, relay]) await h?.stop().catch(() => undefined);
  }
});

const R = SPEC.units.regtest;

async function people() {
  const H = homes.map((h) => h.base);
  const node = new TestNode();
  const alice = await person(H, [relay.base], { wake: true });
  const bob = await person(H, [relay.base]);
  const rv = await bob.damgar.c.ask<{ digest: string }>('rails review', { lightning: node.key, network: 3 });
  await bob.damgar.c.ask('rails publish', { lightning: node.key, network: 3, digest: rv.digest });
  const post = await bob.dub.c.ask<{ post: { id: string } }>('post', { text: 'Worth a tip.' });
  return { alice, bob, node, post: post.post.id };
}

const toSign = async (p: Awaited<ReturnType<typeof person>>) => {
  await p.damgar.c.ask('look');
  return (await p.damgar.c.ask<{ items: ToSign[] }>('to sign')).items;
};

test('by hand: shown in Dub to copy, pasted in Damgar, read in plain words, signed there; from a post and from a profile', async () => {
  const { alice, bob, node, post } = await people();
  for (const kind of ['tip', 'pay'] as const) {
    const r = await alice.dub.c.ask<{ lines: { text: string }[]; hand: { text: string; said: string[] } }>('pay', { how: 'hand', kind, signer: bob.id, ...(kind === 'tip' ? { post } : {}), value: '700', unit: R, whatFor: `by hand, ${kind}` });
    assert.match(r.lines[0].text, /not signed and not sent/);
    assert.ok(r.hand.said.some((l) => /700 regtest satoshis/.test(l)), JSON.stringify(r.hand.said));
    // Nothing reached Damgar through MOR: it waits only once pasted.
    assert.equal((await toSign(alice)).filter((i) => i.kind === 'draft').length, 0, 'nothing on MOR');
    await refused(alice.damgar.c.ask('paste', { text: 'not a payment' }), /not a payment Damgar can read/);
    const pasted = await alice.damgar.c.ask<{ id: string; lines: { text: string }[] }>('paste', { text: `  ${r.hand.text}\n` });
    assert.match(pasted.lines.map((l) => l.text).join(' '), /pay .* 700 regtest satoshis, for “by hand/);
    await refused(alice.damgar.c.ask('paste', { text: r.hand.text }), /already waiting/);
    const item = (await toSign(alice)).find((i) => i.id === pasted.id)!;
    assert.equal(item.byHand, true);
    assert.deepEqual(item.offers, ['sign', 'decline']);
    await alice.damgar.c.ask('sign draft', { id: pasted.id });
    // Bob's side as always: his invoice, Alice pays it in her wallet, pastes the proof.
    const inv = (await toSign(bob)).find((i) => i.kind === 'invoice')!;
    const made = node.invoice(700, inv.descriptionHash!);
    await bob.damgar.c.ask('answer invoice', { id: inv.id, invoice: made.invoice });
    await alice.damgar.c.ask('look');
    const p = (await alice.damgar.c.ask<{ payments: PaymentShown[] }>('pay')).payments.find((x) => x.whatFor === `by hand, ${kind}`)!;
    const paid = await alice.damgar.c.ask<{ lines: { text: string }[] }>('paid', { key: p.key, proof: made.preimage });
    assert.match(paid.lines[0].text, /says valid/);
  }
});

test('Tip from a card’s signer menu in Damgar: a draft prepared there, waiting in To pay, read and signed as any', async () => {
  const { alice, bob } = await people();
  const t = await alice.damgar.c.ask<{ id: string; lines: { text: string }[] }>('tip', { to: bob.id, value: '250', unit: R, whatFor: 'from Damgar' });
  assert.match(t.lines.map((l) => l.text).join(' '), /pay .* 250 regtest satoshis, for “from Damgar”/);
  const item = (await alice.damgar.c.ask<{ items: ToSign[] }>('to sign')).items.find((i) => i.id === t.id)!;
  assert.equal(item.app, 'Damgar');
  await alice.damgar.c.ask('sign draft', { id: t.id });
  assert.ok((await toSign(bob)).some((i) => i.kind === 'invoice'), 'Bob’s side has the invoice request');
});

test('Ask Damgar: queued in Waiting; on this computer Damgar woken, its panel framed only for Dub, unreadable from Dub, authorised there; from a post and from a profile', async () => {
  const { alice, bob, post } = await people();
  const dubOrigin = alice.dub.app.base;
  for (const kind of ['tip', 'pay'] as const) {
    const r = await alice.dub.c.ask<{ lines: { text: string }[]; woken?: { request: string; panel: string; title: string; origin: string } }>('pay', { how: 'damgar', kind, signer: bob.id, ...(kind === 'tip' ? { post } : {}), value: '900', unit: R, whatFor: `asked, ${kind}` });
    assert.ok(r.woken, JSON.stringify(r.lines));
    assert.equal(r.woken.origin, alice.damgar.app.base);
    // It is in Damgar's Waiting too: the same draft, found on MOR.
    const waiting = (await alice.damgar.c.ask<{ items: ToSign[] }>('to sign')).items.filter((i) => i.kind === 'draft');
    assert.equal(waiting.length, 1);
    // The panel: only into a frame, framed only by Dub's origin, no script; a single-use value in its form.
    const url = r.woken.panel;
    assert.equal((await fetch(url, { headers: { 'sec-fetch-dest': 'document' } })).status, 403, 'never opened as a page of its own');
    const got = await fetch(url, { headers: { 'sec-fetch-dest': 'iframe' } });
    const csp = got.headers.get('content-security-policy')!;
    assert.match(csp, new RegExp(`frame-ancestors ${dubOrigin.replace(/[.]/g, '\\.')} `));
    assert.match(csp, /default-src 'none'/);
    const html = await got.text();
    assert.match(html, /Damgar · woken by Dub/);
    assert.match(html, /900 regtest satoshis/);
    assert.match(html, /Authorise and sign/);
    assert.ok(!/<script/i.test(html), 'no script in the panel');
    const nonce = /name="n" value="([0-9a-f]{64})"/.exec(html)![1];
    // Dub learns only that it waits.
    assert.equal((await alice.dub.c.ask<{ answer: string }>('damgar answer', { request: r.woken.request })).answer, 'waiting');
    // A wrong value signs nothing; the person's click, inside the frame, does.
    const wrong = await (await fetch(url, { method: 'POST', headers: { 'sec-fetch-dest': 'iframe', 'content-type': 'application/x-www-form-urlencoded' }, body: `n=${'0'.repeat(64)}&answer=sign` })).text();
    assert.match(wrong, /Not signed/);
    const signed = await (await fetch(url, { method: 'POST', headers: { 'sec-fetch-dest': 'iframe', 'content-type': 'application/x-www-form-urlencoded' }, body: `n=${nonce}&answer=sign` })).text();
    assert.match(signed, /Signed/);
    const again = await (await fetch(url, { method: 'POST', headers: { 'sec-fetch-dest': 'iframe', 'content-type': 'application/x-www-form-urlencoded' }, body: `n=${nonce}&answer=sign` })).text();
    assert.match(again, /Not signed/, 'its value is spent');
    const answer = await alice.dub.c.ask<{ answer: string; lines: { text: string }[] }>('damgar answer', { request: r.woken.request });
    assert.equal(answer.answer, 'signed');
    assert.equal((await alice.damgar.c.ask<{ items: ToSign[] }>('to sign')).items.filter((i) => i.kind === 'draft').length, 0, 'no longer waiting');
    assert.ok((await toSign(bob)).some((i) => i.kind === 'invoice'), 'Bob’s side has the invoice request');
  }
  // Only an app on this computer wakes Damgar: a web page's request (no header) is refused.
  assert.equal((await fetch(`${alice.damgar.app.base}/damgar/wake`, { method: 'POST', body: '{}' })).status, 403);
  // Declined in the panel: nothing signed.
  const r = await alice.dub.c.ask<{ woken: { request: string; panel: string } }>('pay', { how: 'damgar', kind: 'tip', signer: bob.id, post, value: '300', unit: R });
  const html = await (await fetch(r.woken.panel, { headers: { 'sec-fetch-dest': 'iframe' } })).text();
  const nonce = /name="n" value="([0-9a-f]{64})"/.exec(html)![1];
  assert.match(await (await fetch(r.woken.panel, { method: 'POST', headers: { 'sec-fetch-dest': 'iframe', 'content-type': 'application/x-www-form-urlencoded' }, body: `n=${nonce}&answer=decline` })).text(), /Declined/);
  assert.equal((await alice.dub.c.ask<{ answer: string }>('damgar answer', { request: r.woken.request })).answer, 'declined');
});

test('a lane with a cap per act and a cap in all: refused past each in Dub; Damgar keeps the record, counts what is left, and shows an overspend', async () => {
  const { alice, bob, post } = await people();
  await refused(alice.dub.c.ask('lane ask', { label: 'Dub on the Mac', cap: '2000', total: '1500', unit: R }), /at least the cap per payment/);
  await alice.dub.c.ask('lane ask', { label: 'Dub on the Mac', cap: '2000', total: '3000', unit: R });
  const lane = (await toSign(alice)).find((i) => i.kind === 'lane')!;
  const words = lane.lines.map((l) => l.text).join(' ');
  assert.match(words, /In all: at most 3 000 regtest satoshis for the whole lane/);
  assert.match(words, /not judged by verifiers/);
  await alice.damgar.c.ask('grant lane', { id: lane.id });
  let ways = await alice.dub.c.ask<{ lane: { open: boolean; total: string; left: string } }>('pay ways', { kind: 'tip' });
  assert.equal(ways.lane.total, '3 000 regtest satoshis');
  assert.equal(ways.lane.left, '3 000 regtest satoshis');
  // The cap per act: refused before signing.
  await refused(alice.dub.c.ask('pay', { how: 'lane', kind: 'tip', signer: bob.id, post, value: '2500', unit: R }), /above the grant’s cap of 2000 per act/);
  // Under the lane, from a post and from a profile: 1 800, then 1 000.
  await alice.dub.c.ask('pay', { how: 'lane', kind: 'tip', signer: bob.id, post, value: '1800', unit: R, whatFor: 'first' });
  await alice.dub.c.ask('pay', { how: 'lane', kind: 'pay', signer: bob.id, value: '1000', unit: R, whatFor: 'second' });
  ways = await alice.dub.c.ask('pay ways', { kind: 'pay' });
  assert.equal(ways.lane.left, '200 regtest satoshis');
  // The cap in all: 500 would go past it, refused before signing, saying what is left.
  await refused(alice.dub.c.ask('pay', { how: 'lane', kind: 'pay', signer: bob.id, value: '500', unit: R }), /would go past the lane’s cap in all of 3000: 200 left/);
  // Damgar: the record of Dub's payments under the lane, and its count.
  await alice.damgar.c.ask('look');
  let l = (await alice.damgar.c.ask<{ lanes: LaneShown[] }>('lanes')).lanes.find((x) => x.label === 'Dub on the Mac')!;
  assert.deepEqual([l.total?.value, l.spent?.value, l.left?.value, l.over], [3000, 2800, 200, null]);
  assert.deepEqual(l.payments!.map((p) => [p.amount.value, p.whatFor, p.to.id]).sort(), [[1000, 'second', bob.id], [1800, 'first', bob.id]]);
  assert.equal(l.sealed, 0);
  // A Dub that ignores the total (here: its record of it removed) signs within the cap per act: verifiers back it; Damgar shows the overspend.
  const keysFile = join(alice.dub.dir, 'identities', alice.id, 'money-keys.json');
  const keys = JSON.parse(readFileSync(keysFile, 'utf8'));
  for (const x of keys.lanes) delete x.total;
  writeFileSync(keysFile, JSON.stringify(keys));
  await alice.dub.c.ask('pay', { how: 'lane', kind: 'pay', signer: bob.id, value: '1000', unit: R, whatFor: 'past it' });
  await alice.damgar.c.ask('look');
  l = (await alice.damgar.c.ask<{ lanes: LaneShown[] }>('lanes')).lanes.find((x) => x.label === 'Dub on the Mac')!;
  assert.deepEqual([l.spent?.value, l.left?.value, l.over?.value], [3800, 0, 800]);
});
