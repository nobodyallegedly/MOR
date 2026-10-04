// The plain-words reading, from the exact bytes the core library decodes:
// who is bound, how a clone comes into force (its mark), who decides what
// (tiers and areas, Law draft 7); hidden direction controls shown; what this
// client does not implement refused; Law's objections by their codes; what a
// clone changes, by tier.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cborDecode, cborEncode, checkTerms, sha256 } from '../../genesis/src/core.ts';
import { plainHtml } from '../../longform/src/html.ts';
import { collectiveTerms, type Governance } from '../../repo/src/collective.ts';
import { LAW_SPECS, encodeTerms, type MarkEntry } from '../../repo/src/law.ts';
import { lawThrown, problemWords, readAgreement, readChanges, rulesHints, termsOf, uncovered, withLaw, type Reading } from '../src/explain.ts';

const [a, b, c, d] = ['a', 'b', 'c', 'd'].map((x) => sha256(`member ${x}`));
const NAMES: Record<string, string> = { [a]: 'Ann', [b]: 'Ben', [c]: 'Cy', [d]: 'Di' };
const names = (id: string) => NAMES[id] ?? `unknown ${id.slice(0, 8)}`;

const g = (o: Partial<Governance> = {}): Governance => ({
  safetyThreshold: 2,
  releaseThreshold: 2,
  cloneThreshold: 2,
  abandonmentOthers: 2,
  text: 'We publish releases together.',
  relays: ['https://relay.test'],
  ...o,
});

const all = (r: { sections: Reading['sections'] }) => r.sections.flatMap((s) => s.lines.map((l) => l.text)).join('\n');
const section = (r: { sections: Reading['sections'] }, heading: string) =>
  r.sections.find((s) => s.heading === heading)?.lines.map((l) => l.text).join('\n') ?? '';

test('a founding agreement, read from its bytes: who is bound, the keys, the areas, the tiers, leaving, absence', () => {
  const t = termsOf(encodeTerms(collectiveTerms(g(), [a, b, c], a)));
  assert.ok(!t.problem, 'Law accepts it');
  const r = readAgreement(t, names);
  assert.deepEqual(r.blocking, []);
  const w = all(r);
  assert.match(w, /3 parties: Ann, Ben and Cy\./);
  assert.match(w, /bound only by their own signature act/);
  assert.match(w, /exists only once every one of them has signed it: nobody is founded into a collective without signing/);
  assert.match(w, /Ann holds the collective's everyday key.*An act no area reaches needs nobody else's signature/);
  assert.match(w, /cut into 3 shares, one each for Ann, Ben and Cy\. Any 2 of them together rebuild it/);
  assert.doesNotMatch(w, /listed|key grammar lists/i, 'no act types listed in the key grammar any more');

  const areas = section(r, 'Areas: who decides which acts');
  assert.match(areas, /“Releases” \(area 1\): held by Ann, Ben and Cy; any 2 of them decide together/);
  assert.match(areas, /It reaches every publication of the collective \(a release is one\)/);
  assert.match(areas, /A release counts only once that many of its holders have signed it/);
  assert.match(areas, /its holders alone decide, and may grant within it \(Q5\)/);
  assert.match(areas, /change only by the constitutional change rule/);
  assert.match(areas, /A holder may step down at once, alone\. The other holders carry on/);
  assert.match(areas, /With no holder left, the area is frozen: its acts count for nothing until the members refit it \(Law rule 37b\)/);

  const tiers = section(r, 'Who decides what');
  assert.match(tiers, /Constitutional: the members, the change rules, the key grammar, the areas and the constitution's words\. They change only by the constitutional change rule: every member whose voice remains: nobody loses their say without signing \(F103\)/);
  assert.match(tiers, /Judicial: the protected clauses \(the abandonment clause, the keepers, the arbitrators, the time reference, the succession plans, the fork rule, and the condition, time reference and anchoring cMIPs\)\. They change only with the signature of every member whose voice remains: one version for everyone \(Law rule 46a, F121\)/);
  assert.match(tiers, /Operational: matters outside every area change by the clone rule, any 2 of the 3 parties/);

  const leaving = section(r, 'Leaving');
  assert.match(leaving, /Any member can leave alone, at any time, by a resignation no one else signs, keeping what they own/);
  assert.match(leaving, /at the collective's next record, its line.*Until then their signature still counts \(F109, a stated cost\)/);

  assert.match(w, /any 2 of the other parties together may declare them absent/);
  assert.match(w, /their voice is removed \(they no longer count in any rule or area\)/);
  assert.match(w, /Every member with a say in the constitution is covered.*\(F105\)/);
  assert.match(w, /agrees to this in advance \(Law rule 13\)/);
  assert.match(w, /the release manifest cMIP/);

  // A constitutional change rule of any k members.
  const k = readAgreement(termsOf(encodeTerms(collectiveTerms(g({ constitutionalThreshold: 2 }), [a, b, c], a))), names);
  assert.match(section(k, 'Who decides what'), /constitutional change rule: any 2 of the 3 members/);
});

test("the release area's own words are shown as plain text, and an area left without holders is said to be frozen", () => {
  const t = termsOf(encodeTerms(collectiveTerms(g({ releaseWords: 'We sign only what we built.' }), [a, b, c], a)));
  const r = readAgreement(t, names);
  assert.match(all(r), /It has words of its own, shown below; its holders change them alone/);
  assert.deepEqual(r.plain, [{ heading: 'The “Releases” area\'s own words', text: 'We sign only what we built.' }]);
  // F105 coverage: a named authority does not cover itself.
  const named = { ...t, abandonment: { authority: 'named' as const, identity: a, outcomes: [0] } };
  assert.deepEqual(uncovered(named), [a]);
  assert.deepEqual(uncovered({ ...t, abandonment: { ...t.abandonment!, outcomes: [1] } }), [a, b, c]);
});

test("a clone's mark, read in words: the powers it claims and who signs; Law checks it (F104)", () => {
  const parent = sha256('the founding agreement');
  const mark: MarkEntry[] = [{ power: { constitutional: true }, signers: [a, b] }];
  const t = termsOf(encodeTerms(collectiveTerms(g(), [a, b, d], a, parent, mark)));
  assert.equal(t.signing, undefined);
  const r = readAgreement(t, names);
  const w = section(r, 'How it comes into force: its mark');
  assert.match(w, /It says it comes in by the constitutional change rule of that agreement, signed by Ann and Ben\./);
  assert.match(w, /Law checks that these are exactly the powers its changes need.*A false mark sinks the clone, whatever signatures it gathers \(F104\)/);
  assert.match(w, /put in force by a rotation of the collective; any other change by the collective's record, at once/);
  assert.match(all(r), /It is a clone of agreement [0-9a-f]{8}…[0-9a-f]{4}: once in force, it replaces it/);

  const words = termsOf(encodeTerms(collectiveTerms(g({ releaseWords: 'x' }), [a, b, c], a, parent, [{ power: { area: 1 }, signers: [a, b] }])));
  const before = termsOf(encodeTerms(collectiveTerms(g(), [a, b, c], a)));
  assert.match(section(readAgreement(words, names, before), 'How it comes into force: its mark'), /comes in by the power of the “Releases” area \(area 1\) of that agreement, signed by Ann and Ben/);
});

test('hidden direction controls in the words are named, and shown as escapes in the plain view (Text rule 5a)', () => {
  const words = 'Ann pays Ben ‮nothing‬, never less.';
  const t = termsOf(encodeTerms(collectiveTerms(g({ text: words }), [a, b, c], a)));
  assert.equal(t.text, words, 'the words, character for character');
  const r = readAgreement(t, names);
  const hidden = r.sections.find((s) => s.heading === 'Hidden characters');
  assert.ok(hidden, 'a section about them');
  assert.match(hidden!.lines[0].text, /2 invisible characters/);
  const html = plainHtml(t.text, { showControls: true });
  assert.match(html, /U\+202E/);
  assert.match(html, /U\+202C/);
  assert.ok(!html.includes('‮'), 'the control itself is never passed to the screen');
});

test('what this client does not implement cannot be signed; open formats are refused outright', () => {
  const unknown = sha256('an extension nobody here knows');
  const t = collectiveTerms(g(), [a, b, c], a);
  t.extensions = [...t.extensions, unknown];
  const r = readAgreement(termsOf(encodeTerms(t)), names);
  assert.match(r.blocking.join(' '), /extension this client does not implement.*Law rule 2/);

  // Terms with a split plan (field 8), whose format is still open: the core will not read them at all.
  const m = cborDecode(encodeTerms(collectiveTerms(g(), [a, b, c], a))) as Map<number, unknown>;
  m.set(8, []);
  assert.throws(() => termsOf(cborEncode(m)), /not supported yet.*split plan/);
});

test("Law's objections by their codes, in Law's own words, after the client's own hints, never folded by wording", () => {
  // Two members who must both rebuild the safety key: refused by F96.
  const t = termsOf(encodeTerms(collectiveTerms(g({ abandonmentOthers: 1 }), [a, b], a)));
  assert.equal(t.problem!.code, 'check');
  const r = readAgreement(t, names);
  assert.equal(r.blocking.length, 1);
  assert.equal(r.blocking[0], problemWords(t.problem!));
  assert.match(r.blocking[0], /^Law refuses these terms\. Law's own words: “.+”\.$/);

  const hints = rulesHints({ safety: 2, release: 3, clone: 2, others: 2 }, 2);
  assert.equal(hints.length, 3);
  assert.match(hints[0], /^With 2 members, a safety key that needs all 2 of them would be lost with any one of them \(F96\)/);
  const out = withLaw(hints, [...r.blocking, ...r.blocking]);
  assert.deepEqual(out, [...hints, r.blocking[0]], "the client's hints first, then Law's objection, once");
  assert.match(rulesHints({ safety: 1, release: 1, clone: 1, others: 1, constitution: 3 }, 2)[0], /change of the constitution is not between 1 and the 2 members/);

  // An error the core throws is recognised by its code alone.
  let thrown: unknown;
  try {
    checkTerms(encodeTerms(collectiveTerms(g({ abandonmentOthers: 1 }), [a, b], a)), LAW_SPECS);
  } catch (e) {
    thrown = e;
  }
  assert.equal(lawThrown(thrown)?.code, 'check');
  assert.equal(lawThrown(new Error('something else')), null);
  assert.match(problemWords({ code: 'unsupported', text: 'x' }), /^Law does not support these terms yet\. Law's own words: “x”\.$/);

  // Any one member alone: allowed, and said plainly.
  const one = readAgreement(termsOf(encodeTerms(collectiveTerms(g({ safetyThreshold: 1, abandonmentOthers: 1 }), [a, b], a))), names);
  assert.deepEqual(one.blocking, []);
  assert.match(all(one), /Any one member alone can rebuild the safety key/);
});

test('what a clone changes, by tier, and the powers its mark must name', () => {
  const parent = sha256('the founding agreement');
  const before = encodeTerms(collectiveTerms(g(), [a, b, c], a));
  // F122: the version also changes a judge (who judges absence): its mark
  // names the constitutional change rule and the judicial tier's rule.
  const mark: MarkEntry[] = [
    { power: { constitutional: true }, signers: [b, c] },
    { power: { judicial: true }, signers: [a, b, c] },
  ];
  const after = encodeTerms(collectiveTerms(g({ safetyThreshold: 1, abandonmentOthers: 1, text: 'New words.' }), [b, d], b, parent, mark));
  const w = readChanges(before, after, names).map((l) => l.text).join('\n');
  assert.match(w, /Di joins, bound once they sign the clone/);
  assert.match(w, /Ann leaves\. They hand over nothing/);
  assert.match(w, /Cy leaves/);
  assert.match(w, /The everyday key passes to Ben \(was Ann\)/);
  assert.match(w, /2 shares, any 1 rebuild it \(was 3 shares, any 2\)/);
  assert.match(w, /The “Releases” area \(area 1\) is now decided by any 2 of Ben and Di \(was any 2 of Ann, Ben and Cy\)/);
  assert.match(w, /Absence is now judged by any 1 of the other parties \(was any 2 of the other parties\)\. A protected clause/);
  assert.match(w, /The constitution's words change/);
  assert.match(w, /A change to who the members are: constitutional\./);
  assert.match(w, /A change to the abandonment clause: judicial, a protected clause/);
  assert.match(w, /So its mark must name the constitutional change rule and the judicial tier's rule, every member whose voice remains \(Law rule 44c\)\.\nIts mark names exactly that\./);

  // An ordinary change: the release area's words, operational in that area.
  const words = encodeTerms(collectiveTerms(g({ releaseWords: 'Ours.' }), [a, b, c], a, parent, [{ power: { area: 1 }, signers: [a, b] }]));
  const ww = readChanges(before, words, names);
  const wt = ww.map((l) => l.text).join('\n');
  assert.match(wt, /A change to the “Releases” area's own words: operational, in the “Releases” area\./);
  assert.match(wt, /So its mark must name the power of the “Releases” area \(area 1\)/);
  assert.ok(!ww.some((l) => l.tone === 'bad'));

  // A false mark: the clone rule claimed for a member change.
  const wrong = encodeTerms(collectiveTerms(g(), [a, b], a, parent, [{ power: { clone: true }, signers: [a, b] }]));
  const bad = readChanges(before, wrong, names).filter((l) => l.tone === 'bad');
  assert.equal(bad.length, 1);
  assert.match(bad[0].text, /Its mark names the clone rule: a false mark sinks the clone \(F104\)/);
});
