// The human test of 8 October 2026 (roadmap step 11b): four found a
// collective (safety 2, releases 2, other changes 2); one member is removed
// with the release rule changed to one in the same change; then the release
// rule is changed back to two; then a release is published and a second
// member tries to sign it. The client must never publish a clone whose mark
// Agreements call false (Agreements rule 45a), and its reading of the rules must be the
// verifier's.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { gitFiles, prepareRelease, publishPrepared, verifyRelease } from '../../repo/src/release.ts';
import type { State } from '../src/page/api.ts';
import { commit, lossy, prepare, sign, state, words, world, type World } from './setup.ts';

let w: World;
before(async () => {
  w = await world();
});
after(async () => {
  await w?.stop();
});

const idOf = (s: State, name: string) => s.identities.find((i) => i.name === name)!.id;

test('found by four, one removed with the release rule set to one, then set back to two: every clone published is one Agreements count', async () => {
  const c = w.client;
  await sign(c, { kind: 'identity', name: 'Ada', mine: true });
  for (const n of ['Sim One', 'Sim Two', 'Sim Three']) await sign(c, { kind: 'identity', name: n, mine: false });
  let s = await state(c);
  const [ada, one, two, three] = ['Ada', 'Sim One', 'Sim Two', 'Sim Three'].map((n) => idOf(s, n));

  // As on the page: safety 2, releases 2, other changes 2, the rest left empty.
  await sign(c, { kind: 'found', name: 'Four', members: [ada, one, two, three], rules: { safety: 2, release: 2, clone: 2 } });
  s = await state(c);
  const col = s.collectives[0];

  // One member removed, the release rule set to one in the same change; the page sends the rules it shows.
  const rm = await sign(c, { kind: 'change', collective: col.id, leave: [three], rules: { ...col.rules, release: 1, others: 2 }, words: col.words });
  assert.match(rm.done.title, /done$/, JSON.stringify(rm.done));
  s = await state(c);
  const after1 = s.collectives[0];
  assert.deepEqual(after1.members.map((m) => m.id), [ada, one, two]);

  // A release under the rule of one, signed by one member; a second is not asked for; the removed member is refused.
  commit(w.checkout, 'src/lib.rs', 'pub fn test3() -> u8 { 3 }\n');
  const r3 = await sign(c, { kind: 'release', publisher: col.id, version: 'test3' });
  await sign(c, { kind: 'sign', member: ada, release: r3.done.acts[0] });
  const r3b = await prepare(c, { kind: 'sign', member: one, release: r3.done.acts[0] });
  console.log('R3B', JSON.stringify(r3b.reading.blocking));
  const r3c = await prepare(c, { kind: 'sign', member: three, release: r3.done.acts[0] });
  console.log('R3C', JSON.stringify(r3c.reading.blocking));
  const v3 = await verifyRelease(r3.done.acts[0], [w.relay.base]);
  console.log('V3', JSON.stringify(v3.problems));

  // The release rule set back to two.
  const back = await prepare(c, { kind: 'change', collective: col.id, rules: { ...after1.rules, release: 2 }, words: after1.words });
  if (!back.reading.blocking.length) {
    const done = await c.ask<{ title: string }>('confirm', { plan: back.plan, digest: back.digest });
    assert.match(done.title, /done$/, JSON.stringify(done));
  }
  s = await state(c);
  const after2 = s.collectives[0];
  assert.equal(after2.areas[0].frozen, false);

  // A release, signed by two members: Agreements must count it.
  commit(w.checkout, 'src/lib.rs', 'pub fn test4() -> u8 { 4 }\n');
  const rel = await sign(c, { kind: 'release', publisher: col.id, version: 'test4' });
  const relId = rel.done.acts[0];
  const s1 = await sign(c, { kind: 'sign', member: ada, release: relId });
  assert.doesNotMatch(words(s1.review.reading), /not a collective's release/);
  const s2 = await prepare(c, { kind: 'sign', member: one, release: relId });
  assert.deepEqual(s2.reading.blocking, [], words(s2.reading));
  await c.ask('confirm', { plan: s2.plan, digest: s2.digest });
  const v = await verifyRelease(relId, [w.relay.base]);
  assert.equal(v.ok, true, v.problems.join('; '));
});

// The same removal, but the record registering the resignation never
// reaches the collective's relay, though the relay said it did. Agreements, which
// reads what the relays hold, then still counts the removed member's voice
// at the rotation: four voices under "every member whose voice remains".
// Before this step the client marked the clone from its own copy (three
// voices, the record taken as drawn), had it signed, sent the rotation and
// showed the new rules as in force, while Agreements read the collective as
// broken, in the words of the human test: "the rotation's declared clone
// is not complete with the signature acts it names: the mark names too few
// signers to meet the power (rule 45a)". Now Agreements count again from what the
// relays hold before the clone is proposed, and nothing more is signed.
test("the removal's record lost on the way to the relay: no clone Agreements would call false is signed or sent", async () => {
  const c = w.client;
  let s = await state(c);
  const [ada, one, two, three] = ['Ada', 'Sim One', 'Sim Two', 'Sim Three'].map((n) => idOf(s, n));
  const relay = await lossy(w.relay.base);
  try {
    const before = (await state(c)).settings;
    await c.ask('settings', { homes: w.homes.map((h) => h.base), relays: [relay.base], via: [], checkout: before.checkout });
    await sign(c, { kind: 'found', name: 'Lossy', members: [ada, one, two, three], rules: { safety: 2, release: 2, clone: 2 } });
    s = await state(c);
    const col = s.collectives.find((x) => x.name === 'Lossy')!;
    const founding = col.agreement;

    const rm = await prepare(c, { kind: 'change', collective: col.id, leave: [three], rules: { ...col.rules, release: 1, others: 2 }, words: col.words });
    assert.deepEqual(rm.reading.blocking, []);
    relay.drop = true;
    const done = await c.ask<{ title: string; lines: { text: string }[] }>('confirm', { plan: rm.plan, digest: rm.digest });
    relay.drop = false;
    const said = done.lines.map((l) => l.text).join(' ');

    // Agreements, from what the relays hold: the collective is not broken.
    commit(w.checkout, 'src/lib.rs', 'pub fn lossy() -> u8 { 5 }\n');
    const rel = await sign(c, { kind: 'release', publisher: col.id, version: 'lossy' });
    const v = await verifyRelease(rel.done.acts[0], [relay.base]);
    assert.doesNotMatch(v.problems.join('; '), /broken|not complete|rule 45a/, v.problems.join('; '));
    s = await state(c);
    const after = s.collectives.find((x) => x.id === col.id)!;
    assert.equal(after.law.broken, null, after.law.broken ?? '');

    // The change stopped before the clone, and says so in plain words.
    assert.match(done.title, /stopped, nothing in force/, JSON.stringify(done));
    assert.match(said, /No clone was proposed or signed/);
    assert.match(said, /Agreements would not count it: .*Agreements count all of .*Sim Three/);
    // The collective's box shows Agreements' reading, not this device's copy: the founding agreement, four members, two to release.
    assert.equal(after.agreement, founding);
    assert.deepEqual(new Set(after.members.map((m) => m.id)), new Set([ada, one, two, three]));
    assert.equal(after.areas[0].needed, 2);
  } finally {
    await relay.close();
  }
});

// A collective Agreements read as broken, made as the client made it before this
// step: the repo client's own member change, its mark from this device's
// copy, with no count by Agreements, while the removal's record is lost. The page
// then says so in plain sentences: the collective's box, with Agreements' reason;
// signing a release, never "not a collective's release"; the check, never
// "It needs nothing" nor "not a release: nothing: … must sign it; 0 did";
// and no change of it can be signed.
test('a collective Agreements read as broken: the box, signing and the check say so in plain sentences', async () => {
  const c = w.client;
  let s = await state(c);
  const [ada, one, two, three] = ['Ada', 'Sim One', 'Sim Two', 'Sim Three'].map((n) => idOf(s, n));
  const relay = await lossy(w.relay.base);
  try {
    await c.ask('settings', { homes: w.homes.map((h) => h.base), relays: [relay.base], via: [], checkout: s.settings.checkout });
    await sign(c, { kind: 'found', name: 'Broken', members: [ada, one, two, three], rules: { safety: 2, release: 2, clone: 2 } });
    s = await state(c);
    const id = s.collectives.find((x) => x.name === 'Broken')!.id;
    const store = w.app.store;
    const col = store.collective(id);
    const stay = [ada, one, two].map((m) => store.identity(m));
    const leaving = store.identity(three);
    relay.drop = true;
    await col.changeMembers({
      members: [ada, one, two],
      proposer: stay[0],
      signers: stay,
      rebuilders: [ada, one],
      leaving: [leaving],
      governance: { ...col.f.governance, releaseThreshold: 1, abandonmentOthers: 2 },
    });
    relay.drop = false;
    await col.settle();
    store.saveCollective(col);
    for (const i of [...stay, leaving]) store.saveIdentity(i);

    // The box: broken, with Agreements' reason.
    s = await state(c);
    const box = s.collectives.find((x) => x.id === id)!;
    assert.match(box.law.broken ?? '', /the rotation's declared clone is not complete with the signature acts it names: the mark names too few signers to meet the power \(rule 45a\)/);

    // A release, and a member who tries to sign it.
    commit(w.checkout, 'src/lib.rs', 'pub fn broken() -> u8 { 6 }\n');
    // The page refuses to publish in its name, in the same words.
    const refused = await prepare(c, { kind: 'release', publisher: id, version: 'broken' });
    assert.match(refused.reading.blocking.join(' '), /^Agreements read “Broken” as broken: no agreement can be found in force for it, so nothing signed in its name counts/);
    // As the client did before this step: published anyway.
    const held = store.collective(id);
    const pub = { id: held.id, relays: held.f.relays, releases: held.f.releases };
    const out = await publishPrepared(pub, prepareRelease(pub, { name: 'MOR', version: 'broken', files: gitFiles(w.checkout) }));
    store.saveCollective(held);
    const relId = out.id;
    {
      const p = await prepare(c, { kind: 'sign', member: one, release: relId });
      const b = p.reading.blocking.join(' ');
      assert.doesNotMatch(b, /not a collective/);
      assert.match(b, /^No signature can make it a release\. Agreements read the collective that published it as broken: no agreement can be found in force for it, so no member's signature can make this a release\. Agreements' reason: the rotation's declared clone .*\(rule 45a\)\.$/);
      const checked = await c.ask<{ ok: boolean; reading: Parameters<typeof words>[0] }>('verify', { release: relId });
      const cw = words(checked.reading);
      assert.equal(checked.ok, false);
      assert.doesNotMatch(cw, /It needs nothing|not a release: nothing|must sign it; 0 did/);
      assert.match(cw, /Agreements read the collective that published it as broken/);
    }

    // No change of it can be signed: the review says why.
    const ch = await prepare(c, { kind: 'change', collective: id, rules: { ...box.rules, release: 2 }, words: box.words });
    assert.match(ch.reading.blocking.join(' '), /Agreements read “Broken” as broken: no agreement can be found in force for it, so nothing signed in its name counts, and no change of it can come into force\. Agreements' reason: .*rule 45a/);
  } finally {
    await relay.close();
  }
});
