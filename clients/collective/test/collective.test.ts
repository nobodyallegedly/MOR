// The step's "done when", through the program's requests exactly as the page
// sends them, against three real homes and a relay: a release under one's
// own name; a test collective founded with two simulated members; one member
// added and one removed; a release under the new rules; leaving (Law draft
// 7: a resignation alone, registered by the collective's record), then the
// refit; an ordinary change by words; stepping down until the release area
// freezes. Each step is read back in plain words before anything is signed,
// and a fresh verifier (the repo client's, knowing only an id and a relay)
// judges the result. Then: a warning before a record that would leave out
// acts another device made.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { signaturePayload } from '../../genesis/src/core.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { verifyRelease } from '../../repo/src/release.ts';
import { REPO_SPECS, LAW_TYPES } from '../../repo/src/specs.ts';
import type { Done, State } from '../src/page/api.ts';
import { commit, prepare, sign, state, words, world, type World } from './setup.ts';

let w: World;
before(async () => {
  w = await world();
});
after(async () => {
  await w?.stop();
});

const idOf = (s: State, name: string) => s.identities.find((i) => i.name === name)!.id;

test('the author, without a terminal: identities, a release, a collective founded, changed, released, left, refitted, re-worded and frozen', async () => {
  const c = w.client;

  // Identities: the author, and three simulated members.
  const born = await sign(c, { kind: 'identity', name: 'Ada', mine: true });
  assert.match(words(born.review.reading), /It is you/);
  assert.match(words(born.review.reading), /kept in software/);
  assert.ok(born.done.lines.every((l) => l.tone === 'ok'), JSON.stringify(born.done));
  for (const n of ['Sim One', 'Sim Two', 'Sim Three']) await sign(c, { kind: 'identity', name: n, mine: false });
  let s = await state(c);
  const [ada, one, two, three] = ['Ada', 'Sim One', 'Sim Two', 'Sim Three'].map((n) => idOf(s, n));

  // 1. A release under one's own name, as the first real one will be (step 17).
  const own = await sign(c, { kind: 'release', publisher: ada, version: '11b.0' });
  assert.match(words(own.review.reading), /under Ada \(you\) \[[0-9a-f]{8}…[0-9a-f]{4}\]'s own name/);
  assert.match(words(own.review.reading), /2 files, 0 libraries/);
  assert.match(words(own.review.reading), /2 files are new since the last release/);
  assert.match(words(own.review.reading), /first release/);
  const ownId = own.done.acts[0];
  const v0 = await verifyRelease(ownId, [w.relay.base]);
  assert.equal(v0.ok, true, v0.problems.join('; '));
  assert.match(v0.rule!, /its signer's own signature/);

  // 2. Found a collective with two simulated members. The reading comes from the exact terms bytes.
  const f = await prepare(c, { kind: 'found', name: 'Makers', members: [one, ada, two], rules: {} });
  const fw = words(f.reading);
  assert.deepEqual(f.reading.blocking, []);
  assert.match(f.reading.title, /Found the collective “Makers”/);
  assert.match(fw, /3 parties: Ada \(you\).*, Sim One.* and Sim Two/);
  assert.match(fw, /exists only once every one of them has signed it: nobody is founded into a collective without signing/);
  assert.match(fw, /Ada \(you\) \[[^\]]+\] holds the collective's everyday key/);
  assert.match(fw, /cut into 3 shares.*Any 2 of them together rebuild it/);
  assert.match(fw, /If one member is lost, the other 2 can still rotate/);
  assert.match(fw, /“Releases” \(area 1\): held by Ada \(you\).*, Sim One.* and Sim Two.*; any 2 of them decide together/);
  assert.match(fw, /It reaches every publication of the collective \(a release is one\)/);
  assert.match(fw, /Constitutional: the members, the change rules.*every member whose voice remains/);
  assert.match(fw, /Any member can leave alone, at any time/);
  assert.match(fw, /any 2 of the other parties together may declare them absent/);
  assert.match(fw, /their voice is removed \(they no longer count in any rule or area\)/);
  assert.match(fw, /Every member with a say in the constitution is covered/);
  assert.match(fw, /Their consent is simulated/);
  assert.match(fw, /release manifest cMIP/);
  assert.equal(f.reading.plain[0].heading, 'The words everyone signs');
  assert.match(f.reading.plain[0].text, /^“Makers”, a MOR test collective/);
  const founded = await c.ask<Done>('confirm', { plan: f.plan, digest: f.digest });
  assert.match(founded.title, /“Makers” is founded/);
  s = await state(c);
  const col = s.collectives[0];
  assert.deepEqual(col.members.map((m) => m.id), [ada, one, two]);
  assert.equal(col.agreements, 1);
  assert.equal(col.areas[0].frozen, false);

  // 3. Add a member: a constitutional change, every member whose voice remains signs.
  const add = await sign(c, { kind: 'change', collective: col.id, join: [three] });
  assert.match(add.review.reading.title, /Add Sim Three .* to “Makers”/);
  const aw = words(add.review.reading);
  assert.match(aw, /Sim Three \[[^\]]+\] joins, bound once they sign the clone/);
  assert.match(aw, /4 shares, any 2 rebuild it \(was 3 shares, any 2\)/);
  assert.match(aw, /The constitution's words stay the same/);
  assert.match(aw, /A change to who the members are: constitutional/);
  assert.match(aw, /So its mark must name the constitutional change rule/);
  assert.match(aw, /Its mark names exactly that/);
  assert.match(aw, /It says it comes in by the constitutional change rule of that agreement, signed by Ada \(you\).*, Sim One.* and Sim Two/);
  assert.match(add.done.title, /done$/, JSON.stringify(add.done));

  // 4. Remove one: they resign first, the record registers it, then the clone and the rotation.
  const rm = await sign(c, { kind: 'change', collective: col.id, leave: [one] });
  const rmw = words(rm.review.reading);
  assert.match(rm.review.reading.title, /Remove Sim One .* from “Makers”/);
  assert.match(rmw, /First Sim One \[[^\]]+\] signs a resignation, alone, and the collective registers it at once by a record/);
  assert.match(rmw, /It is a simulated member held here/);
  assert.match(rmw, /Sim One \[[^\]]+\] leaves\. They hand over nothing/);
  assert.doesNotMatch(rmw, /not in this device's sequence/);
  assert.match(rm.done.title, /done$/, JSON.stringify(rm.done));
  assert.match(rm.done.lines.map((l) => l.text).join(' '), /Resignation [0-9a-f]{64} by Sim One.*Record [0-9a-f]{64}/);
  s = await state(c);
  assert.deepEqual(s.collectives[0].members.map((m) => m.id), [ada, two, three]);
  assert.equal(s.collectives[0].agreements, 3);
  assert.equal(s.collectives[0].records, 1);
  assert.deepEqual(s.collectives[0].departed.map((d) => [d.id, d.stillParty]), [[one, false]]);

  // 5. A release under the new rules: the member who left cannot sign it; two members can.
  commit(w.checkout, 'src/lib.rs', 'pub fn two() -> u8 { 2 }\n');
  const rel = await sign(c, { kind: 'release', publisher: col.id, version: '11b.1' });
  const rw = words(rel.review.reading);
  assert.match(rw, /It is not a release yet: it counts once any 2 of Ada \(you\).*, Sim Two.* and Sim Three.*, the holders of its Releases area whose voice remains, have signed it/);
  const relId = rel.done.acts[0];
  const former = await prepare(c, { kind: 'sign', member: one, release: relId });
  assert.match(former.reading.blocking.join(' '), /Sim One .* is not a member under the agreement in force/);
  const refused = await c.ask('confirm', { plan: former.plan, digest: former.digest }).catch((e) => e as Error);
  assert.match(String(refused), /cannot be signed/);
  const s1 = await sign(c, { kind: 'sign', member: ada, release: relId });
  assert.match(words(s1.review.reading), /No member has signed it yet/);
  assert.match(words(s1.review.reading), /all 3 files are the same/);
  assert.match(s1.done.lines.map((l) => l.text).join(' '), /Not a release yet/);
  const s2 = await sign(c, { kind: 'sign', member: three, release: relId });
  assert.match(words(s2.review.reading), /Signed so far by Ada \(you\)/);
  assert.match(s2.done.lines.map((l) => l.text).join(' '), /VERIFIED/);
  const v1 = await verifyRelease(relId, [w.relay.base]);
  assert.equal(v1.ok, true, v1.problems.join('; '));
  assert.deepEqual(new Set(v1.signers), new Set([ada, three]));

  // 6. Leave: a resignation alone, registered by the collective's record. No rule is rewritten, so F96 blocks nothing here.
  const leave = await sign(c, { kind: 'leave', collective: col.id, member: ada });
  const lw = words(leave.review.reading);
  assert.match(leave.review.reading.title, /Ada \(you\) .* leaves “Makers”/);
  assert.match(lw, /signs a resignation from the agreement in force .*alone: nobody else's signature is asked for, and nobody can stop it \(Law rule 37a\)/);
  assert.match(lw, /registers it at once by a record, its line/);
  assert.match(lw, /Nothing else changes now: no rule is rewritten, no key rotates/);
  assert.match(lw, /keeps what they own/);
  assert.match(lw, /A release needs all of Sim Two .* and Sim Three/);
  assert.match(lw, /The members who stay then refit the collective: Change members, removing Ada/);
  assert.match(lw, /With 2 members left, a safety key needing 2 of them would be lost with any one of them: the refit must ask fewer to rebuild it \(F96\)/);
  assert.match(leave.done.title, /Ada \(you\) .* left “Makers”/);
  s = await state(c);
  assert.deepEqual(s.collectives[0].members.map((m) => [m.id, m.left]), [[ada, true], [two, false], [three, false]]);
  assert.equal(s.collectives[0].records, 2);
  const again = await prepare(c, { kind: 'leave', collective: col.id, member: ada });
  assert.match(again.reading.blocking.join(' '), /already left/);

  // From the line on, the author's signature counts for nothing; the two who stay make a release.
  commit(w.checkout, 'src/lib.rs', 'pub fn three() -> u8 { 3 }\n');
  const mid = await sign(c, { kind: 'release', publisher: col.id, version: '11b.2' });
  assert.match(words(mid.review.reading), /counts once all of Sim Two .* and Sim Three/);
  const midId = mid.done.acts[0];
  const left = await prepare(c, { kind: 'sign', member: ada, release: midId });
  assert.match(left.reading.blocking.join(' '), /Ada \(you\) .* left the collective: from the collective's line \(record [0-9a-f]{8}…[0-9a-f]{4}\) their signature counts for nothing/);
  await sign(c, { kind: 'sign', member: two, release: midId });
  await sign(c, { kind: 'sign', member: three, release: midId });
  const vm = await verifyRelease(midId, [w.relay.base]);
  assert.equal(vm.ok, true, vm.problems.join('; '));

  // 7. The refit: Change members, removing the member who left. Not asked to resign again.
  const stuck = await prepare(c, { kind: 'change', collective: col.id, leave: [ada] });
  assert.match(stuck.reading.blocking[0], /^With 2 members, a safety key that needs all 2 of them would be lost with any one of them \(F96\)/);
  assert.match(stuck.reading.blocking[1], /^Absence is judged by some of the other members: between 1 and 1 of them\.$/);
  assert.match(stuck.reading.blocking[2], /^Law refuses these terms\. Law's own words: “/);
  assert.equal(stuck.reading.blocking.length, 3);
  const refit = await sign(c, { kind: 'change', collective: col.id, leave: [ada], rules: { safety: 1, release: 2, clone: 2, others: 1 } });
  const fw2 = words(refit.review.reading);
  assert.match(fw2, /Ada \(you\) .* already left: their resignation is on the collective's record, so nothing more is asked of them/);
  assert.doesNotMatch(fw2, /signs a resignation, alone/);
  assert.match(fw2, /Ada \(you\) \[[^\]]+\] leaves\. They hand over nothing/);
  assert.match(fw2, /The everyday key passes to Sim Two/);
  assert.match(fw2, /2 shares, any 1 rebuild it \(was 3 shares, any 2\)/);
  assert.match(fw2, /Any one member alone can rebuild the safety key/);
  assert.match(fw2, /Absence is now judged by any 1 of the other parties \(was any 2 of the other parties\)\. A protected clause/);
  assert.match(fw2, /The constitution's words change/);
  assert.equal(refit.review.reading.plain.length, 2, 'the new words and the old, both shown');
  assert.match(refit.done.title, /done$/, JSON.stringify(refit.done));
  s = await state(c);
  assert.deepEqual(s.collectives[0].members.map((m) => m.id), [two, three]);
  assert.deepEqual(s.collectives[0].departed.map((d) => [d.id, d.stillParty]), [[one, false], [ada, false]]);

  // After the refit: the author is not a member; the members who stay make the next release.
  commit(w.checkout, 'src/lib.rs', 'pub fn four() -> u8 { 4 }\n');
  const next = await sign(c, { kind: 'release', publisher: col.id, version: '11b.3' });
  const nextId = next.done.acts[0];
  const gone = await prepare(c, { kind: 'sign', member: ada, release: nextId });
  assert.match(gone.reading.blocking.join(' '), /Ada \(you\) .* is not a member/);
  await sign(c, { kind: 'sign', member: two, release: nextId });
  await sign(c, { kind: 'sign', member: three, release: nextId });
  const v2 = await verifyRelease(nextId, [w.homes[0].base]);
  assert.equal(v2.ok, true, v2.problems.join('; '));
  // The releases before still verify, under the rules in force when they were signed.
  const vrel = await verifyRelease(relId, [w.relay.base]);
  assert.equal(vrel.ok, true, vrel.problems.join("; "));
  assert.equal((await verifyRelease(midId, [w.relay.base])).ok, true);
  const checked = await c.ask<{ ok: boolean; reading: { title: string } }>('verify', { release: nextId });
  assert.equal(checked.ok, true);
  assert.match(checked.reading.title, /^VERIFIED: MOR 11b\.3/);

  // 8. An ordinary change: the release area's own words, recorded at once, no rotation.
  const ww = await sign(c, { kind: 'words', collective: col.id, text: 'We release only what we both checked.' });
  const www = words(ww.review.reading);
  assert.match(ww.review.reading.title, /New words for the Releases area of “Makers”/);
  assert.match(www, /An ordinary change: it changes only the Releases area's own words, an operational matter in that area/);
  assert.match(www, /marked with the Releases area's power and signed by Sim Two .* and Sim Three/);
  assert.match(www, /The collective writes it on its record at once, signed with its everyday key: no rotation, no new keys \(Law rule 37c, Q8\)/);
  assert.match(www, /A change to the “Releases” area's own words: operational, in the “Releases” area/);
  assert.match(www, /Its mark names exactly that/);
  assert.equal(ww.review.reading.plain[0].text, 'We release only what we both checked.');
  s = await state(c);
  assert.equal(s.collectives[0].areas[0].words, 'We release only what we both checked.');
  assert.equal(s.collectives[0].agreements, 5);
  assert.equal(s.collectives[0].records, 3);
  assert.equal(s.collectives[0].pending, false, 'no rotation');
  // A release under the recorded clone counts as before.
  commit(w.checkout, 'src/lib.rs', 'pub fn five() -> u8 { 5 }\n');
  const after8 = await sign(c, { kind: 'release', publisher: col.id, version: '11b.4' });
  await sign(c, { kind: 'sign', member: two, release: after8.done.acts[0] });
  await sign(c, { kind: 'sign', member: three, release: after8.done.acts[0] });
  const v4 = await verifyRelease(after8.done.acts[0], [w.relay.base]);
  assert.equal(v4.ok, true, v4.problems.join('; '));
  assert.equal(v4.agreement, s.collectives[0].agreement, 'judged under the clone the record put in force');

  // 9. Stepping down: the co-holder carries on; with nobody left, the area is frozen.
  const d1 = await sign(c, { kind: 'stepdown', collective: col.id, member: two });
  const d1w = words(d1.review.reading);
  assert.match(d1.review.reading.title, /Sim Two .* steps down from the Releases area of “Makers”/);
  assert.match(d1w, /signs a resignation naming the Releases area \(area 1\), alone/);
  assert.match(d1w, /The other holders carry on: a release needs Sim Three .* alone; the area asks for 2, and when fewer remain all of them together meet it/);
  assert.match(d1w, /keeps the rest of their voice, as a member/);
  const d2 = await prepare(c, { kind: 'stepdown', collective: col.id, member: three });
  assert.match(words(d2.reading), /Nobody would hold the Releases area: it is frozen from the line\. A release counts for nothing until the members refit the area/);
  assert.deepEqual(d2.reading.blocking, [], 'stepping down needs nobody’s permission');
  await c.ask<Done>('confirm', { plan: d2.plan, digest: d2.digest });
  s = await state(c);
  assert.equal(s.collectives[0].areas[0].frozen, true);
  assert.deepEqual(s.collectives[0].steppedDown.map((d) => d.id), [two, three]);
  assert.equal(s.collectives[0].records, 5);
  commit(w.checkout, 'src/lib.rs', 'pub fn six() -> u8 { 6 }\n');
  const frozen = await prepare(c, { kind: 'release', publisher: col.id, version: '11b.5' });
  assert.match(frozen.reading.blocking.join(' '), /The Releases area has no holder left whose voice remains: it is frozen, and a release would count for nothing until the members refit it/);
  const noWords = await prepare(c, { kind: 'words', collective: col.id, text: 'Other words.' });
  assert.match(noWords.reading.blocking.join(' '), /The Releases area is frozen/);

  // Everything signed is on record, newest first, with the digest that was shown.
  s = await state(c);
  assert.equal(s.history[0].kind, 'stepdown');
  assert.ok(s.history.some((h) => h.digest === f.digest && h.kind === 'found'));
});

test('what you sign is what you saw: a wrong digest, a used review, a changed state and a blocked review sign nothing', async () => {
  const c = w.client;
  let s = await state(c);
  const two = idOf(s, 'Sim Two');
  const before = s.history.length;

  const r = await prepare(c, { kind: 'release', publisher: two, version: 'x.1' });
  const wrong = await c.ask('confirm', { plan: r.plan, digest: '00'.repeat(32) }).catch((e) => e as Error);
  assert.match(String(wrong), /digest does not match/);
  await c.ask('confirm', { plan: r.plan, digest: r.digest });
  const again = await c.ask('confirm', { plan: r.plan, digest: r.digest }).catch((e) => e as Error);
  assert.match(String(again), /expired or was already used/);

  // Reviewed, then something it depends on changes before Sign is pressed.
  const stale = await prepare(c, { kind: 'release', publisher: two, version: 'x.2' });
  await sign(c, { kind: 'release', publisher: two, version: 'x.3' });
  const changed = await c.ask('confirm', { plan: stale.plan, digest: stale.digest }).catch((e) => e as Error);
  assert.match(String(changed), /changed since it was shown/);

  const blocked = await prepare(c, { kind: 'release', publisher: two, version: 'x.1' });
  assert.match(blocked.reading.blocking.join(' '), /already published/);
  const no = await c.ask('confirm', { plan: blocked.plan, digest: blocked.digest }).catch((e) => e as Error);
  assert.match(String(no), /cannot be signed/);

  s = await state(c);
  assert.equal(s.history.length, before + 2, 'only the two confirmed releases were signed');
});

test('before drawing a record, a warning when the relays hold acts of the collective this device never made', async () => {
  const c = w.client;
  let s = await state(c);
  const [ada, two, three] = ['Ada', 'Sim Two', 'Sim Three'].map((n) => idOf(s, n));
  await sign(c, { kind: 'found', name: 'Devices', members: [ada, two, three], rules: {} });
  s = await state(c);
  const col = s.collectives.find((x) => x.name === 'Devices')!;
  const quiet = await prepare(c, { kind: 'leave', collective: col.id, member: three });
  assert.doesNotMatch(words(quiet.reading), /not in this device's sequence/);
  await c.ask('cancel', { plan: quiet.plan });

  // Another device of the collective: the same keys, its own sequence, started afresh.
  const file = w.app.store.collective(col.id).f;
  const other = new TestIdentity({ ...structuredClone(file.identity), sequence: [] });
  const stray = await other.publish(REPO_SPECS.law, LAW_TYPES.signature, signaturePayload(file.agreement), {
    public: true,
    relays: file.relays,
    objects: [[file.agreement, file.agreement]],
  });

  const warned = await prepare(c, { kind: 'leave', collective: col.id, member: three });
  const line = warned.reading.sections.flatMap((x) => x.lines).find((l) => /not in this device's sequence/.test(l.text));
  assert.ok(line, words(warned.reading));
  assert.equal(line!.tone, 'warn');
  assert.match(line!.text, new RegExp(`^1 act signed by the collective is at its relays but not in this device's sequence \\(latest ${stray.id.slice(0, 8)}…${stray.id.slice(-4)}\\)`));
  assert.match(line!.text, /will count as made after its line \(Law, “Made before, made after”\)\. Client conformance: the collective's devices share their tips before a line is drawn\./);
  assert.deepEqual(warned.reading.blocking, [], 'a warning, not a refusal');
  // The same warning before a member change that draws a record.
  const rm = await prepare(c, { kind: 'change', collective: col.id, leave: [three] });
  assert.match(words(rm.reading), /not in this device's sequence/);
  const plainChange = await prepare(c, { kind: 'change', collective: col.id, rules: { safety: 2, release: 1, clone: 2, others: 2 } });
  assert.doesNotMatch(words(plainChange.reading), /not in this device's sequence/, 'no record, no warning');
});

test('a judicial change: who judges absence, under the clone rule, recorded at once, no rotation (Law draft 8, B13)', async () => {
  const c = w.client;
  let s = await state(c);
  const [ada, two, three] = ['Ada', 'Sim Two', 'Sim Three'].map((n) => idOf(s, n));
  await sign(c, { kind: 'found', name: 'Judges', members: [ada, two, three], rules: {} });
  s = await state(c);
  const col = s.collectives.find((x) => x.name === 'Judges')!;
  const j = await sign(c, { kind: 'change', collective: col.id, rules: { safety: 2, release: 2, clone: 2, others: 1 } });
  const jw = words(j.review.reading);
  assert.match(j.review.reading.title, /Who judges absence in “Judges”/);
  assert.match(jw, /A judicial change: only who judges absence changes\. The abandonment clause is a protected clause, in the judicial tier/);
  assert.match(jw, /Today any 2 of the other members together decide whether a member is absent; after the change, any 1\./);
  assert.match(jw, /The clone is marked with the clone rule and signed by .*: enough members \(any 2 of /);
  assert.match(jw, /who does not sign it, absence stays judged by the clause they signed: any 2 of the other members \(Law rule 46a\)/);
  assert.match(jw, /Absence is now judged by any 1 of the other parties \(was any 2 of the other parties\)/);
  assert.match(jw, /A change to .*: judicial, a protected clause/);
  assert.match(jw, /Its mark names exactly that/);
  assert.match(jw, /no rotation, no new keys \(Law rule 37c, Q8\)/);
  assert.match(jw, /The words are constitutional, so this judicial change cannot rewrite them/);
  assert.ok(j.done.lines.some((l) => /written on the collective's record at once; no rotation/.test(l.text)), JSON.stringify(j.done));
  s = await state(c);
  const after = s.collectives.find((x) => x.name === 'Judges')!;
  assert.equal(after.agreements, col.agreements + 1);
  assert.equal(after.records, col.records + 1);
  assert.equal(after.pending, false, 'no rotation');
  assert.notEqual(after.agreement, col.agreement);
  // A release under the recorded clone is judged under it, by a fresh verifier.
  commit(w.checkout, 'src/lib.rs', 'pub fn judged() -> u8 { 7 }\n');
  const rel = await sign(c, { kind: 'release', publisher: col.id, version: 'j.1' });
  await sign(c, { kind: 'sign', member: two, release: rel.done.acts[0] });
  await sign(c, { kind: 'sign', member: three, release: rel.done.acts[0] });
  const v = await verifyRelease(rel.done.acts[0], [w.relay.base]);
  assert.equal(v.ok, true, v.problems.join('; '));
  assert.equal(v.agreement, after.agreement, 'judged under the clone the record put in force');
  // Unchanged: nothing to sign.
  const same = await prepare(c, { kind: 'change', collective: col.id, rules: { safety: 2, release: 2, clone: 2, others: 1 } });
  assert.match(same.reading.blocking.join(' '), /Nothing changes/);
});
