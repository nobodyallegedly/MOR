// F186 (decided by Nobody, allegedly, 9 October 2026), client conformance:
// a seller's client MUST raise the alarm when a payment names a version of
// the deal that does not descend from the version it holds, showing both
// branches and pointing to settling the fork. Real homes and a relay.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { MIPS, cborEncode, unhex } from '../../genesis/src/core.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { start, type Running } from '../../genesis/test/world.ts';
import { dealPayload, offerCheck, sellerAlarm } from '../src/deal.ts';
import { proposePayload, sign } from '../src/law.ts';

let homes: Running[] = [];
let relay: Running;
before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
});
after(async () => {
  for (const r of [...homes, relay]) await r.stop();
});

async function person(): Promise<TestIdentity> {
  const t = TestIdentity.create({ homes: homes.map((h) => h.home), scheme: 3 });
  await t.publishGenesis();
  for (const a of t.chainActs()) await relayAt(relay.base).putAct(a);
  return t;
}

/** A buyer's claim for a payment to `payee`, naming the claim it pays under (Finance field 9). */
async function pay(buyer: TestIdentity, payee: string, agreement: string, line: string, proof: string) {
  const claim = new Map<number, unknown>([
    [0, unhex(MIPS.finance)],
    [1, new TextEncoder().encode(proof)],
    [2, unhex(payee)],
    [3, [unhex(MIPS.finance), 120]],
    [4, unhex(agreement)],
    [9, [unhex(agreement), unhex(line)]],
  ]);
  const p = await buyer.publish(MIPS.finance, 3, cborEncode(claim), { public: true, relays: [relay.base], to: [payee] });
  return (await relayAt(relay.base).getAct(p.id))!;
}

test('a payment naming a version on another branch, or an older one, raises the seller\'s alarm', async () => {
  const [ana, ben, fan] = [await person(), await person(), await person()];
  const parties = [ana.id, ben.id];
  const relays = [relay.base];
  const version = async (by: TestIdentity, text: string, parent?: string, settles?: string) => {
    const p = await proposePayload(by, dealPayload({ parties, text, parent, settles }), parent, relays);
    await sign(ana, p.id, relays);
    await sign(ben, p.id, relays);
    return p.id;
  };
  const d = await version(ana, 'Ana and Ben sell a song.');
  const a = await version(ana, '3A: the price is 100.', d);
  // No fork yet: a payment under the latest version raises nothing; one under the version before it is older.
  assert.equal(await sellerAlarm(ana.id, await pay(fan, ana.id, d, a, 'one'), relays), null);
  const older = await sellerAlarm(ana.id, await pay(fan, ana.id, d, d, 'two'), relays);
  assert.equal(older?.kind, 'older');
  assert.match(older!.words.join(' '), /an older version than .*, the version this identity holds/);
  // F188, DQ7: an older version raises a plain notice; the alarm is kept for forks.
  assert.match(older!.words[0], /^NOTICE/);
  assert.doesNotMatch(older!.words.join(' '), /ALARM/);
  // Ben's device, out of step, makes 3B; both sign it: a fork.
  const b = await version(ben, '3B: the price is 120.', d);
  const forked = await sellerAlarm(ana.id, await pay(fan, ana.id, d, b, 'three'), relays);
  assert.equal(forked?.kind, 'fork');
  const fw = forked!.words.join(' ');
  assert.match(fw, /stands forked/);
  assert.match(fw, new RegExp(`${a.slice(0, 8)}.*${b.slice(0, 8)}|${b.slice(0, 8)}.*${a.slice(0, 8)}`), 'both branches shown');
  assert.match(fw, /The buyer is protected/);
  assert.match(fw, /names both branches/);
  // Settled: a version on 3A naming 3B. A payment under it raises nothing.
  const s = await version(ana, 'Settled: 3A, having seen 3B.', a, b);
  assert.equal(await sellerAlarm(ana.id, await pay(fan, ana.id, d, s, 'four'), relays), null);
  // A payment still naming 3B now names a version that does not descend from the one held.
  const late = await sellerAlarm(ana.id, await pay(fan, ana.id, d, b, 'five'), relays);
  assert.equal(late?.kind, 'fork');
});

// F189 (3), decided 9 October 2026: a payment naming a version the seller
// does not hold raises the alarm: an unknown version is the hidden fork the
// alarm exists for.
test('a payment naming a version the seller has never seen raises the alarm', async () => {
  const [ana, ben, fan] = [await person(), await person(), await person()];
  const parties = [ana.id, ben.id];
  const relays = [relay.base];
  const version = async (text: string, parent?: string) => {
    const p = await proposePayload(ana, dealPayload({ parties, text, parent }), parent, relays);
    await sign(ana, p.id, relays);
    await sign(ben, p.id, relays);
    return p.id;
  };
  const d = await version('Ana and Ben sell a song.');
  const a = await version('3A: the price is 100.', d);
  // 3B, signed on Ben's device, published nowhere Ana looks.
  const hidden = 'b3'.repeat(32);
  const got = await sellerAlarm(ana.id, await pay(fan, ana.id, d, hidden, 'unseen'), relays);
  assert.equal(got?.kind, 'unheld');
  const w = got!.words.join(' ');
  assert.match(w, /^ALARM/);
  assert.match(w, /never seen/);
  assert.match(w, new RegExp(a.slice(0, 8)));
});

// F188 (decided 9 October 2026), client conformance, a strong SHOULD: before
// paying, a buyer's client finds the offer and verifies that it is truly the
// latest in its chain, and warns where what it shows is outdated.
test('a buyer\'s client checks that the offer is the latest in its chain before paying', async () => {
  const [ana, ben] = [await person(), await person()];
  const parties = [ana.id, ben.id];
  const relays = [relay.base];
  const version = async (text: string, parent?: string) => {
    const p = await proposePayload(ana, dealPayload({ parties, text, parent }), parent, relays);
    await sign(ana, p.id, relays);
    await sign(ben, p.id, relays);
    return p.id;
  };
  const d = await version('Ana and Ben sell a song at 100.');
  assert.equal((await offerCheck(d, relays)).current, true);
  const a = await version('Now at 120.', d);
  const old = await offerCheck(d, relays);
  assert.equal(old.current, false);
  assert.equal(old.inForce, a);
  assert.match(old.words.join(' '), /^WARNING: the offer shown is outdated/);
  assert.equal((await offerCheck(a, relays)).current, true);
});
