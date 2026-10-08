// Law draft 10, revised in place for F185 (rules 37a, 37d), freeze suite
// v21, step 3.7w: a broken collective, and its way back. The collective
// is broken as on the Mac on 8 October 2026: a removal whose record is lost
// on its way to the relay, so the rotation's mark names too few signers
// (rule 45a). Then a member leaves during the broken stretch, the members
// roll the collective back, and the last voice is warned before leaving.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { gitFiles, prepareRelease, publishPrepared, verifyRelease } from '../../repo/src/release.ts';
import type { Governance } from '../../repo/src/collective.ts';
import type { State } from '../src/page/api.ts';
import { commit, lossy, prepare, sign, state, words, world, type World } from './setup.ts';

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

/**
 * Found a collective through a relay that loses records, then remove
 * `remove` as the client did before step 11b's fix: the repo client's own
 * member change, its mark from this device's copy, the removal's record
 * lost. Law reads it as broken from that rotation, the broken act.
 */
async function broken(name: string, members: string[], remove: string, rules: { safety: number; release: number; clone: number }, change: Partial<Governance> = {}) {
  const c = w.client;
  const relay = await lossy(w.relay.base);
  const s0 = await state(c);
  await c.ask('settings', { homes: w.homes.map((h) => h.base), relays: [relay.base], via: [], checkout: s0.settings.checkout });
  await sign(c, { kind: 'found', name, members, rules });
  const id = (await state(c)).collectives.find((x) => x.name === name)!.id;
  const store = w.app.store;
  const col = store.collective(id);
  const stay = members.filter((m) => m !== remove).map((m) => store.identity(m));
  const leaving = store.identity(remove);
  const named = col.f.agreement;
  relay.drop = true;
  const got = await col.changeMembers({
    members: stay.map((m) => m.id),
    proposer: stay[0],
    signers: stay,
    rebuilders: stay.slice(0, rules.safety).map((m) => m.id),
    leaving: [leaving],
    governance: { ...col.f.governance, ...change },
  });
  relay.drop = false;
  // As the client keeps it: the resignation, and the record it believes drawn.
  col.f.departed = [...(col.f.departed ?? []), ...got.resigned.map((r) => ({ member: r.member, resignation: r.act, named, record: got.record }))];
  await col.settle();
  store.saveCollective(col);
  for (const i of [...stay, leaving]) store.saveIdentity(i);
  return { id, relay };
}

test('3.7w: a broken collective, a resignation during the broken stretch, and the rollback', async () => {
  const c = w.client;
  let s = await state(c);
  const [ada, one, two, three, four] = ['Ada', 'Sim One', 'Sim Two', 'Sim Three', 'Sim Four'].map((n) => idOf(s, n));
  const { id, relay } = await broken('Five', [ada, one, two, three, four], four, { safety: 2, release: 2, clone: 2 }, { abandonmentOthers: 3 });
  try {
    s = await state(c);
    let box = s.collectives.find((x) => x.id === id)!;
    assert.match(box.law.broken ?? '', /too few signers to meet the power \(rule 45a\)/);
    assert.equal(box.law.rollback, true, 'a rollback can bring it back');

    // A release published in its name during the broken stretch, as the client did before step 11b.
    commit(w.checkout, 'src/lib.rs', 'pub fn stretch() -> u8 { 7 }\n');
    const held = w.app.store.collective(id);
    const pub = { id: held.id, relays: held.f.relays, releases: held.f.releases };
    const inStretch = (await publishPrepared(pub, prepareRelease(pub, { name: 'MOR', version: 'stretch', files: gitFiles(w.checkout) }))).id;
    w.app.store.saveCollective(held);

    // Sim Three leaves during the broken stretch: the resignation names the
    // agreement in force just before the broken act; no record is drawn.
    const leave = await prepare(c, { kind: 'leave', collective: id, member: three });
    assert.deepEqual(leave.reading.blocking, []);
    const lw = words(leave.reading);
    assert.match(lw, /Law reads “Five” as broken since the rotation/);
    assert.match(lw, /resignation from the agreement in force just before that broken act/);
    assert.match(lw, /No record is drawn: a record made while the collective is broken counts for nothing \(Law rule 37d\)\. The resignation takes effect at the collective's next valid line, normally the rollback, which registers it/);
    assert.doesNotMatch(lw, /last voice/);
    const left = await c.ask<{ title: string; acts: string[] }>('confirm', { plan: leave.plan, digest: leave.digest });
    assert.equal(left.acts.length, 1, 'a resignation, and no record');

    // The rollback, reviewed in plain words. The founding rules ask four
    // others to judge absence: they do not fit the three left, and the
    // review says so; the members give new numbers.
    const plain = await prepare(c, { kind: 'rollback', collective: id });
    assert.match(plain.reading.blocking.join(' '), /The rules of the agreement before the broken act do not fit the 3 members left after the rollback\. Give the rollback new numbers: Absence is judged by some of the other members: between 1 and 2 of them/);
    const rb = await prepare(c, { kind: 'rollback', collective: id, rules: { safety: 2, release: 2, clone: 2, others: 2 } });
    assert.deepEqual(rb.reading.blocking, [], words(rb.reading));
    const rw = words(rb.reading);
    assert.match(rw, /The way back is a rollback \(Law rule 37d\): a new rotation of the collective declares a new version of the agreement that was in force just before the broken act/);
    assert.match(rw, /Sim Three/);
    assert.match(rw, /Sim Four/);
    assert.match(rw, /stay shown, and count for nothing, for good/);
    assert.match(rw, /Law counts, for the constitutional change rule of that agreement: .*Ada.*Sim One.*Sim Two/);
    // Who judges absence changes too: a judicial change, every voice that remains (rules 37d, 46a).
    assert.match(rw, /Law counts, for the judicial tier's rule of that agreement: .*Ada.*Sim One.*Sim Two/);
    const done = await c.ask<{ title: string; lines: { text: string }[] }>('confirm', { plan: rb.plan, digest: rb.digest });
    assert.match(done.title, /done$/, JSON.stringify(done));

    // Law reads it as working again: three members, the founding rules.
    s = await state(c);
    box = s.collectives.find((x) => x.id === id)!;
    assert.equal(box.law.broken, null, box.law.broken ?? '');
    assert.deepEqual(new Set(box.members.map((m) => m.id)), new Set([ada, one, two]));
    assert.equal(box.areas[0].needed, 2);

    // The release of the broken stretch still counts for nothing, said as such.
    const v1 = await verifyRelease(inStretch, [relay.base]);
    assert.equal(v1.ok, false);
    assert.match(v1.problems.join('; '), /It was published while Law read the collective that published it as broken, before the rollback/);
    // A release after the rollback, signed by two members, counts.
    commit(w.checkout, 'src/lib.rs', 'pub fn back() -> u8 { 8 }\n');
    const rel = await sign(c, { kind: 'release', publisher: id, version: 'back' });
    const relId = rel.done.acts[0];
    await sign(c, { kind: 'sign', member: ada, release: relId });
    await sign(c, { kind: 'sign', member: one, release: relId });
    const v2 = await verifyRelease(relId, [relay.base]);
    assert.equal(v2.ok, true, v2.problems.join('; '));

    // Nothing to roll back any more.
    const again = await prepare(c, { kind: 'rollback', collective: id });
    assert.match(again.reading.blocking.join(' '), /Law does not read “Five” as broken: there is nothing to roll back/);
  } finally {
    await relay.close();
  }
});

test('the last voice is told, before signing, that the works will be frozen', async () => {
  const c = w.client;
  let s = await state(c);
  const [ada, one] = ['Ada', 'Sim One'].map((n) => idOf(s, n));
  await c.ask('settings', { homes: w.homes.map((h) => h.base), relays: [w.relay.base], via: [], checkout: s.settings.checkout });
  await sign(c, { kind: 'found', name: 'Pair', members: [ada, one], rules: { safety: 1, release: 1, clone: 1 } });
  s = await state(c);
  const id = s.collectives.find((x) => x.name === 'Pair')!.id;

  // Sim One leaves: Ada's voice remains, no warning.
  const first = await prepare(c, { kind: 'leave', collective: id, member: one });
  assert.doesNotMatch(words(first.reading), /last voice/);
  await c.ask('confirm', { plan: first.plan, digest: first.digest });

  // Ada is the last voice: the review says so first, in plain words, and does not block.
  const last = await prepare(c, { kind: 'leave', collective: id, member: ada });
  assert.deepEqual(last.reading.blocking, []);
  assert.match(last.reading.summary[0], /^Ada .*is the last voice that remains in “Pair”/);
  assert.match(last.reading.summary[1], /the collective's works will be frozen as they stand: nobody will be able to change, release or move them, ever/);
  assert.equal(last.reading.sections[0].heading, 'The last voice');
  const done = await c.ask<{ lines: { text: string }[] }>('confirm', { plan: last.plan, digest: last.digest });
  assert.match(done.lines.map((l) => l.text).join(' '), /Ada .*was the last voice: the collective's works are frozen as they stand/);
});

test('the last voice during a broken stretch is told the collective can no longer be rolled back', async () => {
  const c = w.client;
  let s = await state(c);
  const [ada, one, two] = ['Ada', 'Sim One', 'Sim Two'].map((n) => idOf(s, n));
  const { id, relay } = await broken('Trio', [ada, one, two], two, { safety: 2, release: 2, clone: 2 }, { safetyThreshold: 1, releaseThreshold: 1, abandonmentOthers: 1 });
  try {
    s = await state(c);
    assert.equal(s.collectives.find((x) => x.id === id)!.law.rollback, true);
    const first = await prepare(c, { kind: 'leave', collective: id, member: one });
    assert.doesNotMatch(words(first.reading), /last voice/);
    await c.ask('confirm', { plan: first.plan, digest: first.digest });
    // Sim Two's resignation (its record lost) and Sim One's wait for the
    // rollback: Ada's is the last voice that remains for it.
    const last = await prepare(c, { kind: 'leave', collective: id, member: ada });
    assert.deepEqual(last.reading.blocking, []);
    const lw = words(last.reading);
    assert.match(lw, /Ada .*is the last voice that remains in “Trio”/);
    assert.match(lw, /nobody will be able to change, release or move them, ever\. Nothing can be decided in its name again, and the collective can no longer be rolled back: it stays broken/);
    assert.match(lw, /Nobody would be left to roll the collective back/);
  } finally {
    await relay.close();
  }
});
