// What an identity held here received, read for the seller's alarm
// (Agreements rule 45b, client conformance) and the assessment of terms
// received: kept when Claude's drafts and the received-items piles were
// removed (round 4 of the redesign, decided: "Drafts can be removed"; "It's
// a mailbox behavior type of things"). The desk's program, through the
// page's requests.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { IDENTITY_TYPES, MIRS, SPECS, WITNESS_EXPLANATION, cborEncode, signaturePayload, unhex } from '../../genesis/src/core.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { textPayload } from '../../barebone/src/post.ts';
import { POST_SPECS } from '../../barebone/src/specs.ts';
import { readPost } from '../../barebone/src/post.ts';
import { AGREEMENTS_TYPES, REPO_SPECS } from '../../repo/src/specs.ts';
import { decodeDraft, encodeDraft, loadAnswer, loadLinked, saveDraft, type Draft } from '../../connector/src/draft.ts';
import { DESK_SPECS } from '../src/specs.ts';
import type { Done } from '../src/page/api.ts';
import { handed, state, waiting, words, world, type World } from './setup.ts';

let w: World;
/** The author's identity, and "Machine, allegedly", both held at the desk. */
let me: string;
let machine: string;

before(async () => {
  w = await world();
  const a = await w.client.ask<Done>('identity', { name: 'Me', linked: false });
  const b = await w.client.ask<Done>('identity', { name: 'Machine, allegedly', linked: true });
  me = a.acts[0];
  machine = b.acts[0];
});

after(async () => {
  await w?.stop();
});

test('a payment naming the other branch of a forked deal raises the alarm at the desk', async () => {
  const { dealPayload } = await import('../../repo/src/deal.ts');
  const { proposePayload, sign } = await import('../../repo/src/agreements.ts');
  const relays = [w.relay.base];
  const other = TestIdentity.create({ homes: w.homes.map((h) => h.home), scheme: 3 });
  await other.publishGenesis();
  for (const a of other.chainActs()) await relayAt(w.relay.base).putAct(a);
  const seller = w.app.store.identity(machine);
  const parties = [machine, other.id];
  const version = async (text: string, parent?: string) => {
    const p = await proposePayload(other, dealPayload({ parties, text, parent }), parent, relays);
    await sign(other, p.id, relays);
    await sign(seller, p.id, relays);
    return p.id;
  };
  const d = await version('Machine and another sell a song.');
  await version('3A: the price is 100.', d);
  const b = await version('3B: the price is 120.', d);
  w.app.store.saveIdentity(seller);
  const claim = new Map<number, unknown>([
    [0, unhex(MIRS.money)],
    [1, new TextEncoder().encode('a fan pays under 3B')],
    [2, unhex(machine)],
    [3, [unhex(MIRS.money), 120]],
    [4, unhex(d)],
    [9, [unhex(d), unhex(b)]],
  ]);
  const fan = TestIdentity.create({ homes: w.homes.map((h) => h.home), scheme: 3 });
  await fan.publishGenesis();
  for (const a of fan.chainActs()) await relayAt(w.relay.base).putAct(a);
  await fan.publish(MIRS.money, 3, cborEncode(claim), { public: true, relays, to: [machine] });
  await w.client.ask('refresh', { identity: machine });
  const got = (await state(w.client)).identities.find((i) => i.id === machine)!.received;
  const paid = got.find((x) => x.kind === 'payment' && x.from === fan.id)!;
  assert.match(paid.alarm ?? '', /ALARM \(Agreements rule 45b, F186\): this payment names version .* of a deal that stands forked/);
  assert.match(paid.alarm ?? '', /The buyer is protected/);
  assert.match(paid.alarm ?? '', /names both branches/);
});

// Roadmap step 14: terms an identity receives are assessed at the desk (the
// shares and fees, the risks), and still signed only in the collective client.
test('terms received at the desk are assessed: their risks shown, nothing signed here', async () => {
  const { dealPayload } = await import('../../repo/src/deal.ts');
  const relays = [w.relay.base];
  const other = TestIdentity.create({ homes: w.homes.map((h) => h.home), scheme: 3 });
  await other.publishGenesis();
  for (const a of other.chainActs()) await relayAt(w.relay.base).putAct(a);
  const p = await other.publish(REPO_SPECS.agreements, AGREEMENTS_TYPES.terms, dealPayload({ parties: [machine, other.id], text: 'Machine and another write a song together.' }), { public: true, relays, to: [machine] });
  await w.client.ask('refresh', { identity: machine });
  const got = (await state(w.client)).identities.find((i) => i.id === machine)!.received.find((x) => x.act === p.id)!;
  assert.match(got.problem ?? '', /signed in the collective client, never here/);
  const said = (got.assessment ?? []).map((s) => `${s.heading}: ${s.lines.map((l) => l.text).join(' ')}`).join('\n');
  assert.match(said, /^Shares and fees: It divides no money/m);
  assert.match(said, /^Risks, before you sign \(the deal-assessment tool\): .*cannot be declared absent.*Rests on: Agreements rule 47/m);
  assert.match(said, /No judge of forks/);
});

// F188, DQ6 (decided by Nobody, allegedly, 9 October 2026), client
// conformance: one numbering runs across every split a service makes under
// a deal, on any branch; a holder's client raises the alarm where the
// numbers on the splits it receives skip.
test('splits whose numbers skip raise the holder\'s alarm at the desk', async () => {
  const { dealPayload } = await import('../../repo/src/deal.ts');
  const { proposePayload, sign, splitPayload } = await import('../../repo/src/agreements.ts');
  const relays = [w.relay.base];
  const other = TestIdentity.create({ homes: w.homes.map((h) => h.home), scheme: 3 });
  await other.publishGenesis();
  for (const a of other.chainActs()) await relayAt(w.relay.base).putAct(a);
  const seller = w.app.store.identity(machine);
  const p = await proposePayload(other, dealPayload({ parties: [machine, other.id], text: 'Machine and another split a song.' }), undefined, relays);
  await sign(other, p.id, relays);
  await sign(seller, p.id, relays);
  w.app.store.saveIdentity(seller);
  const service = TestIdentity.create({ homes: w.homes.map((h) => h.home), scheme: 3 });
  await service.publishGenesis();
  for (const a of service.chainActs()) await relayAt(w.relay.base).putAct(a);
  for (const n of [1, 3]) {
    const s = splitPayload({ receipt: `${n}`.padStart(64, '0'), payouts: [{ receiver: machine, amount: 1, stake: 0 }], cmip: 'c'.repeat(64), agreement: p.id, number: n });
    await service.publish(REPO_SPECS.agreements, AGREEMENTS_TYPES.split, s, { public: true, relays, to: [machine] });
  }
  await w.client.ask('refresh', { identity: machine });
  const got = (await state(w.client)).identities.find((i) => i.id === machine)!.received;
  const splits = got.filter((x) => x.from === service.id);
  assert.equal(splits.length, 2);
  const alarm = splits.map((x) => x.alarm ?? '').join(' ');
  assert.match(alarm, /ALARM .*split numbered 2 .*not shown/);
  // QF4 (decided by Nobody, allegedly, 9 October 2026, F190): a repeated
  // number is a deviation that breaks the plan.
  const s = splitPayload({ receipt: '9'.padStart(64, '0'), payouts: [{ receiver: machine, amount: 1, stake: 0 }], cmip: 'c'.repeat(64), agreement: p.id, number: 3 });
  await service.publish(REPO_SPECS.agreements, AGREEMENTS_TYPES.split, s, { public: true, relays, to: [machine] });
  await w.client.ask('refresh', { identity: machine });
  const again = (await state(w.client)).identities.find((i) => i.id === machine)!.received.filter((x) => x.from === service.id);
  assert.match(again.map((x) => x.alarm ?? '').join(' '), /number 3 is carried by 2 splits: a deviation that breaks the plan/);
});
