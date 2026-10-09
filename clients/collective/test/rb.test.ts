// RB1 to RB6 (decided by Nobody, allegedly, 8 and 9 October 2026), where
// the collective client shows or does them: payments received during a
// broken stretch shown as owed back (RB2); a declaration of absence made
// during the stretch, registered by the rollback and shown to the member it
// names with the way to contest it (RB3); the warning where the last holder
// of constitutional power leaves (RB5). Real homes and relays.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { MIPS } from '../../genesis/src/core.ts';
import { receiptPayload } from '../../repo/src/law.ts';
import { FINANCE_TYPES, TEST_RAIL } from '../../repo/src/specs.ts';
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

/** The removal of `remove`, its record lost, as before step 11b's fix: Law reads the collective as broken. */
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

test('RB2: a payment the collective received during the broken stretch is shown as owed back', async () => {
  const c = w.client;
  let s = await state(c);
  const [ada, one, two, patron] = ['Ada', 'Sim One', 'Sim Two', 'A Patron'].map((n) => idOf(s, n));
  const { id, relay } = await found('Till', [ada, one, two], { safety: 2, release: 2, clone: 2, others: 1 });
  try {
    await breakBy(id, relay, [ada, one], two, { safetyThreshold: 1, releaseThreshold: 1, cloneThreshold: 1, abandonmentOthers: 1 });
    const store = w.app.store;
    const col = store.collective(id);
    const named = col.f.agreements[0];
    // The collective's own receipt for a payment naming its claim, signed in the stretch.
    await col.id.publish(MIPS.finance, FINANCE_TYPES.receipt, receiptPayload({ rail: TEST_RAIL, payee: id, unit: TEST_RAIL, value: 12, fulfils: named, payer: patron, purchase: [named, named] }), { public: true, relays: col.f.relays });
    store.saveCollective(col);
    s = await state(c);
    const b = box(s, id);
    assert.equal(b.owedBack.length, 1, JSON.stringify(b.owedBack));
    assert.match(b.owedBack[0].text, /12 .*received while the collective is broken: no purchase, owed back to A Patron .*unless the sale is signed anew after the rollback/);
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
    assert.match(shownTo.text, /To contest it: Sim Two .*signs a contest act \(Law rule 52\)/);
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

test('RB5: the last holder of constitutional power is warned before leaving, "You are about to break the collective"', async () => {
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
    assert.equal(last.reading.summary[0], 'You are about to break the collective.');
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
    assert.match(close.reading.blocking.join(' '), /A broken collective cannot fork or close before it is fixed: the members roll it back first \(Law rule 37d, RB6\)/);
  } finally {
    await relay.close();
  }
});
