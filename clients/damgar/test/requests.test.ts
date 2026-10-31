// A request to be paid, prepared in Dub, sent from the payee's Damgar; the
// payer's Damgar offers it as a debt, to pay, or to decline (decided by
// Nobody, allegedly, 17 October 2026): accepted as a debt (an obligation
// the payer signs, shown unknown in its state, Fable's M5), then paid, the
// payment fulfilling the obligation. And what is not accepted is shown
// unknown and never signed (F338).

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { closeAll, person, refused, start, type Relay } from './world.ts';
import { TestNode } from './node.ts';
import type { Account, PaymentShown, ToSign } from '../src/shapes.ts';
import { SPEC } from '../src/specs.ts';
import { DEBT_SAY } from '../src/damgar.ts';
import { join } from 'node:path';
import { cborEncode } from '../../genesis/src/core.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { sendToSelf, TYPES } from '../src/messages.ts';

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

async function railsOf(p: Awaited<ReturnType<typeof person>>, node: TestNode) {
  const rv = await p.damgar.c.ask<{ digest: string }>('rails review', { lightning: node.key, network: 3 });
  await p.damgar.c.ask('rails publish', { lightning: node.key, network: 3, digest: rv.digest });
}

const items = async (p: Awaited<ReturnType<typeof person>>) => {
  await p.damgar.c.ask('look');
  return (await p.damgar.c.ask<{ items: ToSign[] }>('to sign')).items;
};

test('a request to be paid: asked in Dub, sent from Damgar, accepted as a debt, paid, the debt shown unknown as M5 says', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const carol = await person(H, R);
  const dave = await person(H, R);
  const node = new TestNode();
  await railsOf(carol, node);

  // Asking needs a pointer: Dave has none, and is told so when he signs.
  await dave.dub.c.ask('ask paid', { to: carol.id, value: '200', unit: SPEC.units.regtest, whatFor: 'no pointer yet' });
  const early = (await items(dave)).find((i) => i.kind === 'draft')!;
  await refused(dave.damgar.c.ask('sign draft', { id: early.id }), /no payee pointer yet/);
  await dave.damgar.c.ask('decline', { id: early.id });

  // Carol asks Dave, in Dub; her Damgar signs and sends the request.
  await carol.dub.c.ask('ask paid', { to: dave.id, value: '2000', unit: SPEC.units.regtest, whatFor: 'the bike' });
  const d = (await items(carol)).find((i) => i.kind === 'draft')!;
  assert.match(d.lines[0].text, /ask .* to pay you 2 000 regtest satoshis, for “the bike”/);
  await carol.damgar.c.ask('sign draft', { id: d.id });

  // Dave's Damgar offers: accept as a debt, pay, decline.
  const r = (await items(dave)).find((i) => i.kind === 'request')!;
  assert.deepEqual(r.offers, ['debt', 'pay', 'decline']);
  assert.ok(r.lines.some((l) => /not a debt/.test(l.text)));
  const debt = await dave.damgar.c.ask<{ lines: { text: string }[] }>('accept debt', { id: r.id });
  assert.ok(debt.lines.some((l) => l.text === DEBT_SAY));
  const r2 = (await items(dave)).find((i) => i.kind === 'request')!;
  assert.deepEqual(r2.offers, ['pay', 'decline'], 'once a debt, it is paid or declined');
  await dave.damgar.c.ask('pay request', { id: r.id });

  // Carol makes the invoice; Dave pays; his claim fulfils the obligation.
  const inv = (await items(carol)).find((i) => i.kind === 'invoice')!;
  const made = node.invoice(2000, inv.descriptionHash!);
  await carol.damgar.c.ask('answer invoice', { id: inv.id, invoice: made.invoice });
  await dave.damgar.c.ask('look');
  const p = (await dave.damgar.c.ask<{ payments: PaymentShown[] }>('pay')).payments[0];
  await dave.damgar.c.ask('paid', { key: p.key, proof: made.preimage });
  const rec = (await items(carol)).find((i) => i.kind === 'receipt')!;
  await carol.damgar.c.ask('sign receipt', { key: rec.id });

  const a = await dave.damgar.c.ask<Account>('account');
  const pay = a.payments[0];
  const claim = pay.proofs.find((x) => x.kind === 'claim')!;
  assert.equal(claim.rail.answer, 'valid', 'the rail says valid');
  assert.equal(claim.beside.answer, 'unknown', 'what an obligation is paid toward is Agreements’ to read: unknown to a Money-only app');
  const ask = a.asks.find((x) => x.side === 'in')!;
  assert.match(ask.state, /paid/);
  assert.ok(ask.lines.some((l) => l.text === DEBT_SAY));
  const c = await carol.damgar.c.ask<Account>('account');
  const out = c.asks.find((x) => x.side === 'out')!;
  assert.ok(out.obligation, 'Carol holds Dave’s signed obligation');
  assert.match(out.state, /paid/);
});

test('under a Module not accepted: shown unknown, never signed; an invoice request on a rail the payee does not accept is refused, saying why', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const erin = await person(H, R, { accept: ['payment', 'messages', 'onchain', 'bitcoin-units'] });
  const fay = await person(H, R);
  await railsOf(fay, new TestNode());
  await erin.dub.c.ask('tip', { post: (await fay.dub.c.ask<{ post: { id: string } }>('post', { text: 'tip me' })).post.id, signer: fay.id, value: '10', unit: SPEC.units.regtest });
  const d = (await items(erin)).find((i) => i.kind === 'draft')!;
  assert.equal(d.unknown, true);
  assert.deepEqual(d.offers, ['decline']);
  assert.ok(d.lines.some((l) => /It cannot be paid/.test(l.text)), JSON.stringify(d.lines));
  await refused(erin.damgar.c.ask('sign draft', { id: d.id }), /unknown here: nothing was signed/);

  // Units are accepted like rails: without Bitcoin's, every amount in them is unknown, never called satoshis.
  const gus = await person(H, R, { accept: ['payment', 'messages', 'lightning'] });
  await gus.dub.c.ask('tip', { post: (await fay.dub.c.ask<{ post: { id: string } }>('post', { text: 'again' })).post.id, signer: fay.id, value: '10', unit: SPEC.units.regtest });
  const g = (await items(gus)).find((i) => i.kind === 'draft')!;
  assert.equal(g.unknown, true);
  assert.match(g.amount!.said, /^10 of unit [0-9a-f]{8}… \(Bitcoin units, not accepted here\)$/);
});

test('a money message it cannot read: shown unknown, never guessed; nothing to sign; set aside, nothing sent', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const ann = await person(H, R);
  // Another app holding the same identity sends what this Damgar cannot read: a type the cMIP does not define,
  // and a draft whose payload carries a key the cMIP does not define.
  const other = TestIdentity.load(join(ann.dub.dir, 'identities', ann.id, 'identity.json'));
  const save = async () => undefined;
  const strange = await sendToSelf(other, 9, cborEncode(new Map([[0, 1]])) as Uint8Array, { save });
  const odd = await sendToSelf(other, TYPES.draft, cborEncode(new Map<number, unknown>([[0, 0], [1, new Uint8Array(32)], [2, [new Uint8Array(32), 5]], [4, 'Elsewhere'], [9, 'more']])) as Uint8Array, { save });
  const looked = await ann.damgar.c.ask<{ lines: { text: string }[] }>('look');
  assert.equal(looked.lines.filter((l) => /cannot read: shown unknown/.test(l.text)).length, 2, JSON.stringify(looked));
  const shown = (await items(ann)).filter((i) => i.kind === 'unknown');
  assert.deepEqual(shown.map((i) => i.id).sort(), [strange.id, odd.id].sort());
  for (const i of shown) {
    assert.equal(i.unknown, true);
    assert.equal(i.amount, null, 'no amount guessed from it');
    assert.deepEqual(i.offers, ['decline'], 'nothing to sign');
  }
  assert.match(shown.find((i) => i.id === strange.id)!.lines[0].text, /type 9, which the money messages cMIP draft 1 does not define/);
  assert.match(shown.find((i) => i.id === odd.id)!.lines[0].text, /an unknown key 9/);
  await refused(ann.damgar.c.ask('sign draft', { id: odd.id }), /./);
  const aside = await ann.damgar.c.ask<{ lines: { text: string }[] }>('decline', { id: strange.id });
  assert.match(aside.lines[0].text, /Set aside, unread: nothing was signed, nothing was sent/);
  assert.deepEqual((await items(ann)).filter((i) => i.kind === 'unknown').map((i) => i.id), [odd.id]);
});
