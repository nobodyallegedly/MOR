// The step's "done when", through the program's requests exactly as the page
// sends them, against three real homes and a relay: a release under one's
// own name; a test collective founded with two simulated members; one member
// added and one removed; a release under the new rules; leaving. Each step
// is read back in plain words before anything is signed, and a fresh
// verifier (the repo client's, knowing only an id and a relay) judges the
// result.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyRelease } from '../../repo/src/release.ts';
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

test('the author, without a terminal: identities, a release, a collective founded, changed, released, and left', async () => {
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
  assert.match(fw, /comes into force once all 3 parties have signed it/);
  assert.match(fw, /Ada \(you\) \[[^\]]+\] holds the collective's everyday key/);
  assert.match(fw, /cut into 3 shares.*Any 2 of them together rebuild it/);
  assert.match(fw, /If one member is lost, the other 2 can still rotate/);
  assert.match(fw, /Every publication of the collective \(a release is one\) counts only once any 2 of the 3 parties have signed it/);
  assert.match(fw, /any 2 of the other parties together may declare them absent/);
  assert.match(fw, /their voice is removed from the clone rule/);
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

  // 3. Add a member.
  const add = await sign(c, { kind: 'change', collective: col.id, join: [three] });
  assert.match(add.review.reading.title, /Add Sim Three .* to “Makers”/);
  const aw = words(add.review.reading);
  assert.match(aw, /Sim Three \[[^\]]+\] joins, bound once they sign the clone/);
  assert.match(aw, /4 shares, any 2 rebuild it \(was 3 shares, any 2\)/);
  assert.match(aw, /The words stay the same/);
  assert.match(add.done.title, /done$/, JSON.stringify(add.done));

  // 4. Remove one.
  const rm = await sign(c, { kind: 'change', collective: col.id, leave: [one] });
  assert.match(rm.review.reading.title, /Remove Sim One .* from “Makers”/);
  assert.match(words(rm.review.reading), /Sim One \[[^\]]+\] leaves\. They hand over nothing/);
  assert.match(rm.done.title, /done$/, JSON.stringify(rm.done));
  s = await state(c);
  assert.deepEqual(s.collectives[0].members.map((m) => m.id), [ada, two, three]);
  assert.equal(s.collectives[0].agreements, 3);

  // 5. A release under the new rules: the member who left cannot sign it; two members can.
  commit(w.checkout, 'src/lib.rs', 'pub fn two() -> u8 { 2 }\n');
  const rel = await sign(c, { kind: 'release', publisher: col.id, version: '11b.1' });
  const rw = words(rel.review.reading);
  assert.match(rw, /It is not a release yet: it counts once any 2 of its 3 members have signed it/);
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

  // 6. Leave. With the rules unchanged, two members would need both to rotate: Law refuses, in plain words.
  const stuck = await prepare(c, { kind: 'change', collective: col.id, leave: [ada] });
  assert.match(stuck.reading.title, /Ada \(you\) .* leaves “Makers”/);
  assert.match(stuck.reading.blocking[0], /^With 2 members, a safety key that needs all 2 of them would be lost with any one of them \(F96\)/);
  assert.match(stuck.reading.blocking[1], /^Absence is judged by some of the other members: between 1 and 1 of them\. \(Law: /);
  assert.equal(stuck.reading.blocking.length, 2);
  const leave = await sign(c, { kind: 'change', collective: col.id, leave: [ada], rules: { safety: 1, release: 2, clone: 2, others: 1 } });
  const lw = words(leave.review.reading);
  assert.match(lw, /Ada \(you\) \[[^\]]+\] leaves\. They hand over nothing/);
  assert.match(lw, /yours end with your membership/);
  assert.match(lw, /The everyday key passes to Sim Two/);
  assert.match(lw, /2 shares, any 1 rebuild it \(was 3 shares, any 2\)/);
  assert.match(lw, /Any one member alone can rebuild the safety key/);
  assert.match(lw, /Absence is now judged by any 1 of the other parties \(was any 2 of the other parties\)\. A protected clause/);
  assert.match(lw, /The words change/);
  assert.equal(leave.review.reading.plain.length, 2, 'the new words and the old, both shown');
  assert.match(leave.done.title, /done$/, JSON.stringify(leave.done));
  s = await state(c);
  assert.deepEqual(s.collectives[0].members.map((m) => m.id), [two, three]);

  // After leaving: the author can no longer help make a release; the members who stay can.
  commit(w.checkout, 'src/lib.rs', 'pub fn three() -> u8 { 3 }\n');
  const next = await sign(c, { kind: 'release', publisher: col.id, version: '11b.2' });
  const nextId = next.done.acts[0];
  const gone = await prepare(c, { kind: 'sign', member: ada, release: nextId });
  assert.match(gone.reading.blocking.join(' '), /Ada \(you\) .* is not a member/);
  await sign(c, { kind: 'sign', member: two, release: nextId });
  await sign(c, { kind: 'sign', member: three, release: nextId });
  const v2 = await verifyRelease(nextId, [w.homes[0].base]);
  assert.equal(v2.ok, true, v2.problems.join('; '));
  // The release before still verifies, under the rules in force when it was signed.
  assert.equal((await verifyRelease(relId, [w.relay.base])).ok, true);
  const checked = await c.ask<{ ok: boolean; reading: { title: string } }>('verify', { release: nextId });
  assert.equal(checked.ok, true);
  assert.match(checked.reading.title, /^VERIFIED: MOR 11b\.2/);

  // Everything signed is on record, newest first, with the digest that was shown.
  s = await state(c);
  assert.equal(s.history[0].kind, 'sign');
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
