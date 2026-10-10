// Fable's review of the step 11b fix and F185 as built (F187, accepted by
// Nobody, allegedly, 9 October 2026), items 1 to 4 and 8, in the collective
// client: each test fails before its fix. Real homes and relays, as in
// rollback.test.ts; a relay that loses acts stands in for the Mac's.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { resign } from '../../repo/src/agreements.ts';
import { AGREEMENTS_TYPES } from '../../repo/src/specs.ts';
import type { Governance } from '../../repo/src/collective.ts';
import type { State } from '../src/page/api.ts';
import { lossy, prepare, sign, state, words, world, type World } from './setup.ts';

let w: World;
before(async () => {
  w = await world();
  for (const n of ['Sim One', 'Sim Two', 'Sim Three', 'Sim Four']) await sign(w.client, { kind: 'identity', name: n, mine: false });
  await sign(w.client, { kind: 'identity', name: 'Ada', mine: true });
});
after(async () => {
  await w?.stop();
});

const idOf = (s: State, name: string) => s.identities.find((i) => i.name === name)!.id;
const box = (s: State, id: string) => s.collectives.find((x) => x.id === id)!;

/** Found a collective through a relay that can lose acts. */
async function found(name: string, members: string[], rules: { safety: number; release: number; clone: number; others?: number }) {
  const c = w.client;
  const relay = await lossy(w.relay.base);
  const s0 = await state(c);
  await c.ask('settings', { homes: w.homes.map((h) => h.base), relays: [relay.base], via: [], checkout: s0.settings.checkout });
  await sign(c, { kind: 'found', name, members, rules });
  const id = (await state(c)).collectives.find((x) => x.name === name)!.id;
  return { id, relay };
}

/**
 * Remove `remove` as the client did before step 11b's fix, the removal's
 * record lost: Agreements read the collective as broken from that rotation.
 */
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
    rebuilders: s.slice(0, col.f.safety.threshold).map((m) => m.id).filter((m) => col.f.safety.shares.some((x) => x.holder === m)),
    leaving: [leaving],
    governance: { ...col.f.governance, ...change },
  });
  relay.drop = false;
  col.f.departed = [...(col.f.departed ?? []), ...got.resigned.map((r) => ({ member: r.member, resignation: r.act, named, record: got.record }))];
  await col.settle();
  store.saveCollective(col);
  for (const i of [...s, leaving]) store.saveIdentity(i);
}

test('F187 (1): the rollback deals no share of the new safety key to a member who already left', async () => {
  const c = w.client;
  let s = await state(c);
  const [ada, one, two, four] = ['Ada', 'Sim One', 'Sim Two', 'Sim Four'].map((n) => idOf(s, n));
  const { id, relay } = await found('Quartet', [ada, one, two, four], { safety: 2, release: 2, clone: 2, others: 2 });
  try {
    // Sim Four leaves, the record reaching the relays: Agreements count three voices from that line.
    await sign(c, { kind: 'leave', collective: id, member: four });
    s = await state(c);
    assert.equal(box(s, id).members.find((m) => m.id === four)!.left, true);
    // Then Sim Two's removal, its record lost: broken, the founding agreement before it.
    await breakBy(id, relay, [ada, one], two, { safetyThreshold: 1, releaseThreshold: 1, cloneThreshold: 1, abandonmentOthers: 1 });
    s = await state(c);
    assert.equal(box(s, id).law.rollback, true, box(s, id).law.broken ?? '');
    const rb = await prepare(c, { kind: 'rollback', collective: id, rules: { safety: 1, release: 1, clone: 1, others: 1 } });
    const rw = words(rb.reading);
    assert.match(rw, /Members after the rollback: Ada \(you\) \[[^\]]+\] and Sim One \[[^\]]+\]\./, rw);
    assert.deepEqual(rb.reading.blocking, [], rw);
    const done = await c.ask<{ title: string; lines: { text: string }[] }>('confirm', { plan: rb.plan, digest: rb.digest });
    assert.match(done.title, /done$/, JSON.stringify(done));
    s = await state(c);
    const b = box(s, id);
    assert.equal(b.law.broken, null);
    assert.deepEqual(b.members.filter((m) => !m.left).map((m) => m.id).sort(), [ada, one].sort());
    assert.equal(b.shares.of, 2, 'the new safety key is dealt to the two who stay, never to Sim Four');
  } finally {
    await relay.close();
  }
});

test('F187 (2): a rollback registering a resignation the relays never got is refused before the rotation, never reported done', async () => {
  const c = w.client;
  let s = await state(c);
  const [ada, one, two, three] = ['Ada', 'Sim One', 'Sim Two', 'Sim Three'].map((n) => idOf(s, n));
  const { id, relay } = await found('Lost', [ada, one, two, three], { safety: 2, release: 2, clone: 2, others: 2 });
  try {
    await breakBy(id, relay, [ada, one, two], three);
    // Sim Two leaves during the broken stretch; the relay loses the resignation.
    relay.types = [AGREEMENTS_TYPES.resignation];
    relay.drop = true;
    await sign(c, { kind: 'leave', collective: id, member: two });
    relay.drop = false;
    relay.types = [AGREEMENTS_TYPES.record];
    const rb = await prepare(c, { kind: 'rollback', collective: id, rules: { safety: 1, release: 1, clone: 1, others: 1 } });
    const blocking = rb.reading.blocking.join(' ');
    assert.match(blocking, /Agreements refuse what the rollback would register: the rollback registers an act this verifier does not hold/, words(rb.reading));
    s = await state(c);
    assert.notEqual(box(s, id).law.broken, null);
  } finally {
    await relay.close();
  }
});

test('F187 (3): the last voice is warned when the other voices resigned from other devices', async () => {
  const c = w.client;
  let s = await state(c);
  const [ada, one, two] = ['Ada', 'Sim One', 'Sim Two'].map((n) => idOf(s, n));
  const { id, relay } = await found('Devices', [ada, one, two], { safety: 2, release: 2, clone: 2, others: 1 });
  try {
    await breakBy(id, relay, [ada, one], two, { safetyThreshold: 1, releaseThreshold: 1, cloneThreshold: 1, abandonmentOthers: 1 });
    // Sim One resigns on another device: this device's file never hears of it.
    const store = w.app.store;
    const col = store.collective(id);
    const b = box(await state(c), id);
    assert.equal(b.law.rollback, true);
    const m = store.identity(one);
    const before = col.f.departed!.find((d) => d.member === two)!.named!;
    await resign(m, before, col.f.relays);
    store.saveIdentity(m);
    const last = await prepare(c, { kind: 'leave', collective: id, member: ada });
    const lw = words(last.reading);
    assert.match(lw, /Ada .*is the last voice that remains in “Devices”/, lw);
    assert.match(lw, /Sim One .*signed a resignation/, lw);
  } finally {
    await relay.close();
  }
});

test('F187 (4): leaving names the agreement Agreements find in force; where Agreements cannot be read, the review says so', async () => {
  const c = w.client;
  let s = await state(c);
  const [ada, one, two] = ['Ada', 'Sim One', 'Sim Two'].map((n) => idOf(s, n));
  const { id, relay } = await found('Stale', [ada, one, two], { safety: 2, release: 1, clone: 2, others: 1 });
  try {
    // Another device changed the area's words; this device's copy is one version behind.
    await sign(c, { kind: 'words', collective: id, text: 'Releases go out on Mondays.' });
    const store = w.app.store;
    const col = store.collective(id);
    const now = col.f.agreement;
    col.f.agreement = col.f.agreements[col.f.agreements.indexOf(now) - 1];
    store.saveCollective(col);
    const leave = await prepare(c, { kind: 'leave', collective: id, member: two });
    assert.match(words(leave.reading), new RegExp(now.slice(0, 8)), 'the resignation names the agreement Agreements find in force');
    await c.ask('confirm', { plan: leave.plan, digest: leave.digest });
    s = await state(c);
    assert.equal(box(s, id).members.find((m) => m.id === two)!.left, true, 'the record is a line: Agreements registers the departure');

    // Agreements cannot be read: every relay and home away.
    const col2 = store.collective(id);
    const keep = { relays: col2.f.relays, homes: col2.f.identity.homes.map((h) => h.hint) };
    col2.f.relays = ['http://127.0.0.1:9'];
    for (const h of col2.f.identity.homes) h.hint = 'http://127.0.0.1:9';
    store.saveCollective(col2);
    try {
      const away = await prepare(c, { kind: 'leave', collective: id, member: one });
      const aw = words(away.reading);
      assert.match(aw, /Agreements' own reading of “Stale” could not be had/, aw);
      assert.match(aw, /the resignation names this device's copy of the agreement in force .*which may not be the one Agreements find/, aw);
      assert.match(aw, /No last-voice warning can be given/, aw);
    } finally {
      const back = store.collective(id);
      back.f.relays = keep.relays;
      back.f.identity.homes.forEach((h, i) => (h.hint = keep.homes[i]));
      store.saveCollective(back);
    }
  } finally {
    await relay.close();
  }
});

test('F187 (8): stepping down during a broken stretch is allowed, and the rollback registers it', async () => {
  const c = w.client;
  let s = await state(c);
  const [ada, one, two, three] = ['Ada', 'Sim One', 'Sim Two', 'Sim Three'].map((n) => idOf(s, n));
  const { id, relay } = await found('Steps', [ada, one, two, three], { safety: 2, release: 2, clone: 2, others: 2 });
  try {
    await breakBy(id, relay, [ada, one, two], three);
    const down = await prepare(c, { kind: 'stepdown', collective: id, member: one });
    assert.deepEqual(down.reading.blocking, [], words(down.reading));
    assert.match(words(down.reading), /No record is drawn/);
    const done = await c.ask<{ acts: string[] }>('confirm', { plan: down.plan, digest: down.digest });
    assert.equal(done.acts.length, 1, 'a stepping down, and no record');
    // The founding numbers fit the three left: the area's entry is not
    // redrawn, so Sim One stays stepped down (a rollback redrawing the area
    // would give it back to whoever it names and who signs it, rule 37b).
    const rb = await prepare(c, { kind: 'rollback', collective: id });
    assert.deepEqual(rb.reading.blocking, [], words(rb.reading));
    assert.match(words(rb.reading), /Sim One.*stepped down from the Releases area/);
    assert.doesNotMatch(words(rb.reading), /redraws the Releases area/);
    const rolled = await c.ask<{ title: string; lines: { text: string }[] }>('confirm', { plan: rb.plan, digest: rb.digest });
    assert.match(rolled.title, /done$/, JSON.stringify(rolled));
    s = await state(c);
    const b = box(s, id);
    assert.equal(b.law.broken, null, b.law.broken ?? '');
    const holders = b.areas[0].holders.filter((h) => h.voice).map((h) => h.id);
    assert.ok(!holders.includes(one), `Sim One no longer holds the Releases area: ${JSON.stringify(b.areas[0])}`);
  } finally {
    await relay.close();
  }
});

// F189 (1), decided 9 October 2026 (Fable's review of the F186, RB and F187
// build, finding 1): a resignation is spent once its signer comes back by
// signing a version that names them (B10). The client's rollback never
// registers a returned member's old resignation, and their departed entry
// is closed when they come back.
test('F189 (1): a rollback made in good faith never removes a member who came back', async () => {
  const c = w.client;
  let s = await state(c);
  const [ada, one, two, four] = ['Ada', 'Sim One', 'Sim Two', 'Sim Four'].map((n) => idOf(s, n));
  const { id, relay } = await found('Returning', [ada, one, two, four], { safety: 2, release: 2, clone: 2, others: 2 });
  try {
    // Sim Four leaves, the record reaching the relays; then comes back.
    await sign(c, { kind: 'leave', collective: id, member: four });
    const out = await sign(c, { kind: 'change', collective: id, leave: [four] });
    assert.match(out.done.title, /done$/, out.done.title);
    const back = await sign(c, { kind: 'change', collective: id, join: [four] });
    assert.match(back.done.title, /done$/, back.done.title);
    s = await state(c);
    assert.equal(box(s, id).members.find((m) => m.id === four)?.left ?? false, false, 'Sim Four is a member again');
    // Then Sim Two's removal, its record lost: broken.
    await breakBy(id, relay, [ada, one, four], two, { safetyThreshold: 2, releaseThreshold: 1, cloneThreshold: 2, abandonmentOthers: 1 });
    s = await state(c);
    assert.equal(box(s, id).law.rollback, true, box(s, id).law.broken ?? '');
    const rb = await prepare(c, { kind: 'rollback', collective: id, rules: { safety: 2, release: 1, clone: 2, others: 1 } });
    const rw = words(rb.reading);
    assert.doesNotMatch(rw, /Sim Four resigned/, rw);
    assert.match(rw, /Members after the rollback: .*Sim Four/, rw);
  } finally {
    await relay.close();
  }
});
