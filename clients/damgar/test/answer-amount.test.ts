// The amount in an answer (the money messages cMIP draft 3, F352): an
// answer to an invoice request names the amount it binds, the commitment's,
// so the grant limits cMIP judges a receipts lane's cap on the answer itself
// rather than on Damgar's word. Above the cap, the payee's Damgar does not
// answer by itself and says why; within it, it does; the payer takes an
// answer whose amount is the payment's.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { closeAll, person, start, testLink, type Relay } from './world.ts';
import { TestNode } from './node.ts';
import type { PaymentShown, ToSign } from '../src/shapes.ts';
import { MESSAGES_SPEC, MESSAGES_SPEC_2, MONEY, SPEC } from '../src/specs.ts';
import { TYPES, answerPayload, readAnswer } from '../src/messages.ts';
import { amountOf, judge, refuseBeforeSigning } from '../../grants/src/limits.ts';

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

const R = SPEC.units.regtest;
const H32 = 'ab'.repeat(32);

test('an answer names its amount, and the grant limits cMIP judges a lane’s cap on it', () => {
  const p = answerPayload({ to: H32, commitment: H32, bound: { kind: 'invoice', invoice: 'lnbcrt1…' }, ticket: null, amount: { unit: R, value: 6000 } });
  assert.deepEqual(readAnswer(p).amount, { unit: R, value: 6000 });
  const act = { id: H32, spec: MESSAGES_SPEC, type: TYPES.answer, payload: p };
  assert.deepEqual(amountOf(act, MONEY), { unit: R, value: 6000 });
  const limits = { cap: { unit: R, value: 5000 } };
  assert.match(refuseBeforeSigning(limits, act, MONEY, 0)!, /6000 is above the grant’s cap of 5000 per act/);
  assert.deepEqual(judge(limits, act, MONEY), { within: false, why: 'it moves 6000, above the cap of 5000 per act (2.2)' });
  assert.deepEqual(judge({ cap: { unit: R, value: 6000 } }, act, MONEY), { within: true });
  // Drafts 1 and 2: no amount in an answer; nothing for the cap to judge on it.
  const old = answerPayload({ to: H32, commitment: H32, bound: { kind: 'refused', why: 'no' }, ticket: null });
  assert.equal(readAnswer(old).amount, null);
  assert.equal(amountOf({ spec: MESSAGES_SPEC_2, type: TYPES.answer, payload: old }, MONEY), null);
});

test('above the receipts lane’s cap the payee’s Damgar waits and says why; within it, it answers by itself, the answer naming the amount', async () => {
  const H = homes.map((h) => h.base);
  const node = new TestNode();
  const link = testLink(node);
  const alice = await person(H, [relay.base]);
  const bob = await person(H, [relay.base], { link: link.factory });
  const rv = await bob.damgar.c.ask<{ digest: string }>('rails review', { lightning: node.key, network: 3 });
  await bob.damgar.c.ask('rails publish', { lightning: node.key, network: 3, digest: rv.digest });
  await bob.damgar.c.ask('link', link.config);
  const own = await bob.damgar.c.ask<{ digest: string }>('own lane review', { role: 'receipts', cap: '5000', unit: R });
  await bob.damgar.c.ask('own lane', { role: 'receipts', cap: '5000', unit: R, digest: own.digest });
  const post = await bob.dub.c.ask<{ post: { id: string } }>('post', { text: 'A post worth a tip.' });

  const tip = async (value: string) => {
    await alice.dub.c.ask('tip', { post: post.post.id, signer: bob.id, value, unit: R });
    await alice.damgar.c.ask('look');
    const draft = (await alice.damgar.c.ask<{ items: ToSign[] }>('to sign')).items.find((i) => i.kind === 'draft')!;
    await alice.damgar.c.ask('sign draft', { id: draft.id });
    return bob.damgar.c.ask<{ lines: { text: string }[] }>('look');
  };

  // Above the cap: judged on the answer by the grant limits cMIP; it waits for Bob, saying why.
  const above = await tip('6000');
  assert.ok(above.lines.some((l) => /make an invoice in your wallet, in Waiting\. Not answered by itself: .*6000 is above the grant’s cap of 5000 per act\.$/.test(l.text)), JSON.stringify(above.lines));
  assert.equal(link.made.length, 0, 'no invoice made by itself');
  const inv = (await bob.damgar.c.ask<{ items: ToSign[] }>('to sign')).items.find((i) => i.kind === 'invoice')!;
  assert.ok(inv, 'the invoice to make waits in To sign');
  await bob.damgar.c.ask('answer invoice', { id: inv.id, invoice: node.invoice(6000, inv.descriptionHash!).invoice });
  await alice.damgar.c.ask('look');
  let pay = (await alice.damgar.c.ask<{ payments: PaymentShown[] }>('pay')).payments;
  assert.equal(pay.length, 1, 'the payer takes an answer naming the payment’s amount');

  // Within the cap: answered by itself, through the link.
  const within = await tip('1500');
  assert.ok(within.lines.some((l) => /answered by itself, with an invoice your node made/.test(l.text)), JSON.stringify(within.lines));
  await alice.damgar.c.ask('look');
  pay = (await alice.damgar.c.ask<{ payments: PaymentShown[] }>('pay')).payments;
  assert.equal(pay.length, 2);
  assert.equal(pay.find((p) => p.amount.value === 1500)?.pay?.invoice, link.made[0]);
});
