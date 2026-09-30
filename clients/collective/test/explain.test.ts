// The plain-words reading, from the exact bytes the core library decodes:
// who is bound and what each rule does; hidden direction controls shown;
// what this client does not implement refused; what a clone changes.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cborDecode, cborEncode, sha256 } from '../../genesis/src/core.ts';
import { plainHtml } from '../../longform/src/html.ts';
import { collectiveTerms, type Governance } from '../../repo/src/collective.ts';
import { encodeTerms } from '../../repo/src/law.ts';
import { readAgreement, readChanges, rulesHints, termsOf, withLaw, type Reading } from '../src/explain.ts';

const [a, b, c, d] = ['a', 'b', 'c', 'd'].map((x) => sha256(`member ${x}`));
const NAMES: Record<string, string> = { [a]: 'Ann', [b]: 'Ben', [c]: 'Cy', [d]: 'Di' };
const names = (id: string) => NAMES[id] ?? `unknown ${id.slice(0, 8)}`;

const g = (o: Partial<Governance> = {}): Governance => ({
  safetyThreshold: 2,
  releaseThreshold: 2,
  cloneThreshold: 2,
  abandonmentOthers: 2,
  text: 'We publish releases together.',
  ...o,
});

const all = (r: { sections: Reading['sections'] }) => r.sections.flatMap((s) => s.lines.map((l) => l.text)).join('\n');

test('a founding agreement, read from its bytes: who is bound, the keys, releases, changes, absence', () => {
  const t = termsOf(encodeTerms(collectiveTerms(g(), [a, b, c], a)));
  assert.ok(!t.problem, 'Law accepts it');
  const r = readAgreement(t, names);
  assert.deepEqual(r.blocking, []);
  const w = all(r);
  assert.match(w, /3 parties: Ann, Ben and Cy\./);
  assert.match(w, /bound only by their own signature act/);
  assert.match(w, /comes into force once all 3 parties have signed it/);
  assert.match(w, /Ann holds the collective's everyday key/);
  assert.match(w, /cut into 3 shares, one each for Ann, Ben and Cy\. Any 2 of them together rebuild it/);
  assert.match(w, /Every publication of the collective \(a release is one\) counts only once any 2 of the 3 parties have signed it/);
  assert.match(w, /complete once any 2 of the 3 parties sign the clone/);
  assert.match(w, /any 2 of the other parties together may declare them absent/);
  assert.match(w, /agrees to this in advance \(Law rule 13\)/);
  assert.match(w, /protected clause/);
  assert.match(w, /the release manifest cMIP/);
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

  // Terms with stakes (field 7), whose format is still open: the core will not read them at all.
  const m = cborDecode(encodeTerms(collectiveTerms(g(), [a, b, c], a))) as Map<number, unknown>;
  m.set(7, []);
  assert.throws(() => termsOf(cborEncode(m)), /not supported yet.*stakes/);
});

test("Law's objections, in plain words, every one at once", () => {
  // Two members who must both rebuild the safety key: refused by F96.
  const t = termsOf(encodeTerms(collectiveTerms(g({ abandonmentOthers: 1 }), [a, b], a)));
  assert.match(t.problem!, /needs every member to rotate/);
  const r = readAgreement(t, names);
  assert.match(r.blocking[0], /^With 2 members, a safety key that needs all 2 of them would be lost with any one of them \(F96\)\..*\(Law: “/);

  const hints = rulesHints({ safety: 2, release: 3, clone: 2, others: 2 }, 2);
  assert.equal(hints.length, 3);
  const folded = withLaw(hints, r.blocking);
  assert.equal(folded.length, 3, "Law's objection folded into the hint that says the same");
  assert.match(folded[0], /\(Law: /);

  // Any one member alone: allowed, and said plainly.
  const one = readAgreement(termsOf(encodeTerms(collectiveTerms(g({ safetyThreshold: 1, abandonmentOthers: 1 }), [a, b], a))), names);
  assert.deepEqual(one.blocking, []);
  assert.match(all(one), /Any one member alone can rebuild the safety key/);
});

test('what a clone changes: who joins and leaves, the keys, the rules, the protected clauses, the words', () => {
  const parent = sha256('the founding agreement');
  const before = termsOf(encodeTerms(collectiveTerms(g(), [a, b, c], a)));
  const after = termsOf(
    encodeTerms(collectiveTerms(g({ safetyThreshold: 1, abandonmentOthers: 1, text: 'New words.' }), [b, d], b, parent)),
  );
  const w = readChanges(before, after, names).map((l) => l.text).join('\n');
  assert.match(w, /Di joins, bound once they sign the clone/);
  assert.match(w, /Ann leaves\. They hand over nothing/);
  assert.match(w, /Cy leaves/);
  assert.match(w, /The everyday key passes to Ben \(was Ann\)/);
  assert.match(w, /2 shares, any 1 rebuild it \(was 3 shares, any 2\)/);
  assert.match(w, /A release now needs any 2 of the 2 parties to sign it \(was any 2 of the 3 parties\)/);
  assert.match(w, /Absence is now judged by any 1 of the other parties \(was any 2 of the other parties\)\. A protected clause/);
  assert.match(w, /The words change/);
  const r = readAgreement(after, names, before);
  assert.match(all(r), /It is a clone of agreement [0-9a-f]{8}…[0-9a-f]{4}: it replaces it, and that one closes, once any 2 of the 3 parties of that agreement have signed it/);
});
