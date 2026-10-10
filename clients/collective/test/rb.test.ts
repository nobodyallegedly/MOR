// RB1 to RB6 (decided by Nobody, allegedly, 8 and 9 October 2026), where
// the collective client shows or does them: payments received during a
// broken stretch shown as owed back (RB2); a declaration of absence made
// during the stretch, registered by the rollback and shown to the member it
// names with the way to contest it (RB3); the warning where the last holder
// of constitutional power leaves (RB5). Real homes and relays.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { MIPS } from '../../genesis/src/core.ts';
import { receiptPayload } from '../../repo/src/agreements.ts';
import { MONEY_TYPES, TEST_RAIL } from '../../repo/src/specs.ts';
import type { Governance } from '../../repo/src/collective.ts';
import type { State } from '../src/page/api.ts';
import { lossy, prepare, sign, state, words, world, type World } from './setup.ts';

let w: World;
before(async () => {
  w = await world();
  for (const n of ['Sim One', 'Sim Two', 'Sim Three', 'A Patron']) await sign(w.client, { kind: 'identity', name: n, mine: false });
  await sign(w.client, { kind: 'identity', name: 'Ada', mine: true });
});
after(async () => {
  await w?.stop();
});

const idOf = (s: State, name: string) => s.identities.find((i) => i.name === name)!.id;
const box = (s: State, id: string) => s.collectives.find((x) => x.id === id)!;

async function found(name: string, members: string[], rules: object) {
  const c = w.client;
  const relay = await lossy(w.relay.base);
  const s0 = await state(c);
  await c.ask('settings', { homes: w.homes.map((h) => h.base), relays: [relay.base], via: [], checkout: s0.settings.checkout });
  await sign(c, { kind: 'found', name, members, rules });
  return { id: (await state(c)).collectives.find((x) => x.name === name)!.id, relay };
}

/** The removal of `remove`, its record lost, as before step 11b's fix: Agreements read the collective as broken. */
async function breakBy(id: string, relay: { drop: boolean }, stay: string[], remove: string, change: Partial<Governance> = {}) {
  const store = w.app.store;
  const col = store.collective(id);
  const s = stay.map((m) => store.identity(m));
  const leaving = store.identity(remove);
  const named = col.f.agreement;
  relay.drop = true;
  const got = await col.changeMembers({
    members: s.map((m) => m.id),
    proposer: s[0],
    signers: s,
    rebuilders: col.f.safety.shares.map((x) => x.holder).filter((m) => stay.includes(m)).slice(0, col.f.safety.threshold),
    leaving: [leaving],
    governance: { ...col.f.governance, ...change },
  });
  relay.drop = false;
  col.f.departed = [...(col.f.departed ?? []), ...got.resigned.map((r) => ({ member: r.member, resignation: r.act, named, record: got.record }))];
  await col.settle();
  store.saveCollective(col);
  for (const i of [...s, leaving]) store.saveIdentity(i);
}

test('RB2 with BQ2: a payment under an offer of the broken stretch is shown as owed back; one under an offer before the break is kept', async () => {
  const c = w.client;
  let s = await state(c);
  const [ada, one, two, patron] = ['Ada', 'Sim One', 'Sim Two', 'A Patron'].map((n) => idOf(s, n));
  const { id, relay } = await found('Till', [ada, one, two], { safety: 2, release: 2, clone: 2, others: 1 });
  try {
    await breakBy(id, relay, [ada, one], two, { safetyThreshold: 1, releaseThreshold: 1, cloneThreshold: 1, abandonmentOthers: 1 });
    const store = w.app.store;
    const col = store.collective(id);
    const founding = col.f.agreements[0];
    // The clone the broken act declared: an offer of the broken stretch.
    const ofStretch = col.f.agreement;
    assert.notEqual(ofStretch, founding);
    // The collective's own receipts, signed in the stretch, for payments naming each.
    const pay = (line: string, value: number) =>
      col.id.publish(MIPS.money, MONEY_TYPES.receipt, receiptPayload({ rail: TEST_RAIL, payee: id, unit: TEST_RAIL, value, fulfils: founding, payer: patron, purchase: [founding, line] }), { public: true, relays: col.f.relays });
    await pay(founding, 5);
    await pay(ofStretch, 12);
    store.saveCollective(col);
    s = await state(c);
    const b = box(s, id);
    assert.equal(b.owedBack.length, 1, JSON.stringify(b.owedBack));
    assert.match(b.owedBack[0].text, /12 .*paid under an offer made while the collective is broken: no purchase, owed back to A Patron .*unless the sale is signed anew after the rollback/);
  } finally {
    await relay.close();
  }
});

test('QG1 and F197: a closing names money owed back to nobody; a payer with no address is sent a notice with a deadline', async () => {
  const c = w.client;
  let s = await state(c);
  const [ada, one, two, patron] = ['Ada', 'Sim One', 'Sim Two', 'A Patron'].map((n) => idOf(s, n));
  const { id, relay } = await found('Ledger', [ada, one, two], { safety: 2, release: 2, clone: 2, others: 1 });
  try {
    await breakBy(id, relay, [ada, one], two, { safetyThreshold: 1, releaseThreshold: 1, cloneThreshold: 1, abandonmentOthers: 1 });
    const store = w.app.store;
    const col = store.collective(id);
    const founding = col.f.agreements[0];
    const ofStretch = col.f.agreement;
    const pay = (value: number, payer?: string) =>
      col.id.publish(MIPS.money, MONEY_TYPES.receipt, receiptPayload({ rail: TEST_RAIL, payee: id, unit: TEST_RAIL, value, fulfils: founding, payer, purchase: [founding, ofStretch] }), { public: true, relays: col.f.relays });
    await pay(3);
    await pay(9, patron);
    store.saveCollective(col);
    const rb = await prepare(c, { kind: 'rollback', collective: id, rules: { safety: 1, release: 1, clone: 1, others: 1 } });
    assert.deepEqual(rb.reading.blocking, [], words(rb.reading));
    await c.ask('confirm', { plan: rb.plan, digest: rb.digest });
    s = await state(c);
    const owed = box(s, id).owedBack;
    assert.equal(owed.length, 2, JSON.stringify(owed));
    const toNobody = owed.find((o) => o.toKind === 'nobody')!;
    const toPatron = owed.find((o) => o.toKind === 'identity')!;
    assert.match(toNobody.text, /committed no key: nobody can claim it .*does not block a closing that names it/);
    assert.equal(toPatron.notice, null);
    // Before any notice, money owed back to a payer with an identity blocks the closing.
    const early = await prepare(c, { kind: 'closing', collective: id });
    assert.ok(early.reading.blocking.some((b) => /owed back to A Patron .*send them a notice with a deadline \(F197\)/.test(b)), words(early.reading));
    // F197: a notice sealed to the patron, with a deadline on a time reference.
    const n = await prepare(c, { kind: 'notice', collective: id, payment: toPatron.payment, deadline: 900 });
    assert.deepEqual(n.reading.blocking, [], words(n.reading));
    assert.match(words(n.reading), /sealed to A Patron/);
    assert.match(words(n.reading), /deadline/);
    await c.ask('confirm', { plan: n.plan, digest: n.digest });
    s = await state(c);
    assert.ok(box(s, id).owedBack.find((o) => o.payment === toPatron.payment)!.notice, 'the notice is shown beside the payment');
    // The closing names both as left open; neither blocks it here (the
    // patron's deadline is the time reference's answer, which the core
    // judges). This fixture lost a record of the collective (breakBy), so
    // the history an ending would cite is not all held: that alone blocks.
    const cl = await prepare(c, { kind: 'closing', collective: id });
    assert.match(words(cl.reading), /leaves open, visibly, 1 payment owed back to nobody/);
    assert.match(words(cl.reading), /A Patron .*who gave no address: a notice was sent/);
    assert.ok(cl.reading.blocking.every((b) => !/owed back/.test(b)), words(cl.reading));
  } finally {
    await relay.close();
  }
});

test('RB3: a declaration of absence made during the broken stretch is registered by the rollback, and shown to the member it names', async () => {
  const c = w.client;
  let s = await state(c);
  const [ada, one, two, three] = ['Ada', 'Sim One', 'Sim Two', 'Sim Three'].map((n) => idOf(s, n));
  const { id, relay } = await found('Vanish', [ada, one, two, three], { safety: 2, release: 2, clone: 2, others: 1 });
  try {
    await breakBy(id, relay, [ada, one, two], three);
    // Sim Two vanishes during the stretch; Ada declares them absent under the clause before the broken act.
    const decl = await prepare(c, { kind: 'declare', collective: id, member: two, signers: [ada] });
    assert.deepEqual(decl.reading.blocking, [], words(decl.reading));
    assert.match(words(decl.reading), /No record is drawn: a record made while the collective is broken counts for nothing/);
    const done = await c.ask<{ acts: string[] }>('confirm', { plan: decl.plan, digest: decl.digest });
    assert.equal(done.acts.length, 1, 'a declaration, and no record');
    // Shown to Sim Two, with the way to contest it.
    s = await state(c);
    const shownTo = box(s, id).declared.find((d) => d.member === two)!;
    assert.match(shownTo.text, /Sim Two .*is named as absent by a declaration .*signed by Ada/);
    assert.match(shownTo.text, /To contest it: Sim Two .*signs a contest act \(Agreements rule 52\)/);
    // BQ4 (decided 9 October 2026): Sim Two, held here, signs a contest naming the declaration.
    assert.equal(shownTo.contested, false);
    const ct = await prepare(c, { kind: 'contest', collective: id, declaration: shownTo.act });
    assert.deepEqual(ct.reading.blocking, [], words(ct.reading));
    assert.match(words(ct.reading), /Sim Two .*signs a contest of the declaration/);
    assert.match(words(ct.reading), /voids nothing/);
    await c.ask('confirm', { plan: ct.plan, digest: ct.digest });
    s = await state(c);
    assert.equal(box(s, id).declared.find((d) => d.member === two)!.contested, true, 'the contest is shown beside the declaration');
    // The rollback registers it: Sim Two no longer blocks the way back.
    const rb = await prepare(c, { kind: 'rollback', collective: id, rules: { safety: 1, release: 1, clone: 1, others: 1 } });
    assert.deepEqual(rb.reading.blocking, [], words(rb.reading));
    assert.match(words(rb.reading), /Sim Two .*declared absent during the broken stretch/);
    const back = await c.ask<{ title: string }>('confirm', { plan: rb.plan, digest: rb.digest });
    assert.match(back.title, /done$/, JSON.stringify(back));
    s = await state(c);
    const b = box(s, id);
    assert.equal(b.law.broken, null);
    assert.deepEqual(b.members.filter((m) => !m.left).map((m) => m.id).sort(), [ada, one].sort());
    assert.ok(b.declared.some((d) => d.member === two), 'still shown to Sim Two after the rollback');
  } finally {
    await relay.close();
  }
});

test('RB5 with BQ5: the last holder of constitutional power is warned before leaving, in the words decided', async () => {
  const c = w.client;
  let s = await state(c);
  const [ada, one, two] = ['Ada', 'Sim One', 'Sim Two'].map((n) => idOf(s, n));
  const { id, relay } = await found('Crown', [ada, one, two], { safety: 2, release: 1, clone: 2, others: 1, constitutionNamed: [ada, one] });
  try {
    const first = await prepare(c, { kind: 'leave', collective: id, member: one });
    assert.doesNotMatch(words(first.reading), /about to break/);
    await c.ask('confirm', { plan: first.plan, digest: first.digest });
    const last = await prepare(c, { kind: 'leave', collective: id, member: ada });
    assert.deepEqual(last.reading.blocking, [], 'leaving is never blocked');
    const lw = words(last.reading);
    // BQ5 (decided by Nobody, allegedly, 9 October 2026): "It breaks, but it only breaks one layer."
    assert.deepEqual(last.reading.summary.slice(0, 3), [
      "You are about to break the collective's constitutional layer.",
      'Once you leave, nobody will be able to change its rules again.',
      'The other members keep acting in their areas.',
    ]);
    assert.match(lw, /Ada .*holds the last constitutional voice that remains in “Crown”/);
    assert.match(lw, /its constitution freezes as it stands/);
    assert.doesNotMatch(lw, /is the last voice that remains/, 'Sim Two keeps a voice');
  } finally {
    await relay.close();
  }
});

test('RB6: a broken collective cannot fork or close before it is fixed', async () => {
  const c = w.client;
  const s = await state(c);
  const [ada, one, two] = ['Ada', 'Sim One', 'Sim Two'].map((n) => idOf(s, n));
  const { id, relay } = await found('Shut', [ada, one, two], { safety: 2, release: 2, clone: 2, others: 1 });
  try {
    await breakBy(id, relay, [ada, one], two, { safetyThreshold: 1, releaseThreshold: 1, cloneThreshold: 1, abandonmentOthers: 1 });
    const close = await prepare(c, { kind: 'closing', collective: id });
    assert.match(close.reading.blocking.join(' '), /A broken collective cannot fork or close before it is fixed: the members roll it back first \(Agreements rule 37d, RB6\)/);
  } finally {
    await relay.close();
  }
});
