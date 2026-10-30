// The plain-words reading, from the exact bytes the core library decodes:
// who is bound, how a clone comes into force (its mark), who decides what
// (tiers and areas, Agreements draft 7); hidden direction controls shown; what this
// client does not implement refused; Agreements' objections by their codes; what a
// clone changes, by tier.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cborDecode, cborEncode, checkTerms, publicationPayload, sha256 } from '../../genesis/src/core.ts';
import { plainHtml } from '../../longform/src/html.ts';
import { collectiveTerms, type Governance } from '../../repo/src/collective.ts';
import { AGREEMENTS_SPECS, encodeTerms, type MarkEntry } from '../../repo/src/agreements.ts';
import { absenceWarning, agreementsThrown, powerWords, problemWords, readAgreement, readChanges, rulesHints, termsOf, uncovered, withAgreements, type Reading } from '../src/explain.ts';

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
const section = (r: { sections: Reading['sections'] }, heading: string) =>
  r.sections.find((s) => s.heading === heading)?.lines.map((l) => l.text).join('\n') ?? '';

test('a founding agreement, read from its bytes: who is bound, the keys, the areas, the tiers, leaving, absence', () => {
  const t = termsOf(encodeTerms(collectiveTerms(g(), [a, b, c])));
  assert.ok(!t.problem, 'Agreements accepts it');
  const r = readAgreement(t, names);
  assert.deepEqual(r.blocking, []);
  const w = all(r);
  assert.match(w, /3 parties: Ann, Ben and Cy\./);
  assert.match(w, /bound only by their own signature act/);
  assert.match(w, /exists only once every one of them has signed it: nobody is founded into a collective without signing/);
  // A keyless collective (Agreements rules 56 to 60): no signing key, no member keys; the five layers' rules, Money first.
  // (Was: "Ann holds the collective's signing key": a collective has no signing key now, Agreements rule 59.)
  assert.match(w, /It has no signing key of its own: a member acts for the collective with their own identity's key, naming the collective/);
  assert.match(w, /There are no member keys/);
  assert.doesNotMatch(w, /holds the collective's signing key|Envelopes and Text/);
  const layers = section(r, 'The five layers: who acts for it');
  assert.deepEqual(
    [...layers.matchAll(/^(\w+) \(layer (\d)\):/gm)].map((m) => `${m[1]} ${m[2]}`),
    ['Money 3', 'Text 1', 'Envelopes 2', 'Agreements 4', 'Development 5'],
    'each of the five layers, layer by layer, Money first',
  );
  assert.match(layers, /Money \(layer 3\): any 2 of the 3 members together can set its payee pointer \(where its income goes\).*No member can do it alone/);
  // A layer one member acts in alone is said plainly, with a warning (Agreements rule 60, client conformance).
  const alone = readAgreement(termsOf(encodeTerms(collectiveTerms(g({ layers: { 3: { threshold: 1 } } }), [a, b, c]))), names);
  const money = alone.sections.find((x) => x.heading === 'The five layers: who acts for it')!.lines.find((l) => /^Money/.test(l.text))!;
  assert.match(money.text, /any one member alone can set its payee pointer.*One member alone can do that, without asking the others: for example point its income at an address of their choosing/);
  assert.equal(money.tone, 'warn');
  assert.match(w, /cut into 3 shares, one each for Ann, Ben and Cy\. Any 2 of them together rebuild it/);
  assert.doesNotMatch(w, /listed|key grammar lists/i, 'no act types listed in the key grammar any more');

  const areas = section(r, 'Finer areas: who decides which act types');
  assert.match(areas, /“Releases” \(area 1\): held by Ann, Ben and Cy; any 2 of them decide together/);
  assert.match(areas, /It reaches every bake the collective uploads \(a release is one\)/);
  assert.match(areas, /A release counts only once that many of its holders have signed it/);
  assert.match(areas, /its holders alone decide, and may grant within it \(Q5\)/);
  assert.match(areas, /change only by the constitutional change rule/);
  assert.match(areas, /A holder may step down at once, alone\. The other holders carry on/);
  assert.match(areas, /With no holder left, the area is frozen: its acts count for nothing until the members refit it \(Agreements rule 37b\)/);

  const tiers = section(r, 'Who decides what');
  assert.match(tiers, /Constitutional: the members, the change rules, the key grammar, the five layers' rules, the finer areas and the constitution's words\. They change only by the constitutional change rule: every member whose voice remains: nobody loses their say without signing \(F103\)/);
  assert.match(tiers, /Judicial: the protected clauses \(the abandonment clause, the keepers, the arbitrators, the time reference, the succession plans, the fork rule, and the condition, time reference and anchoring cMIPs\)\. They change only with the signature of every member whose voice remains: one version for everyone \(Agreements rule 46a, F121\)/);
  assert.match(tiers, /Operational: matters outside every area change by the clone rule, any 2 of the 3 parties/);

  const leaving = section(r, 'Leaving');
  assert.match(leaving, /Any member can leave alone, at any time, by a resignation no one else signs, keeping what they own/);
  assert.match(leaving, /at the collective's next record, its line.*Until then their signature still counts \(F109, a stated cost\)/);

  assert.match(w, /any 2 of the other parties together may declare them absent/);
  assert.match(w, /their voice is removed \(they no longer count in any rule or area\)/);
  assert.match(w, /Every member with a say in the constitution is covered.*\(F105\)/);
  assert.match(w, /agrees to this in advance \(Agreements rule 13\)/);
  assert.match(w, /the release manifest cMIP/);

  // A constitutional change rule of any k members.
  const k = readAgreement(termsOf(encodeTerms(collectiveTerms(g({ constitutionalThreshold: 2 }), [a, b, c]))), names);
  assert.match(section(k, 'Who decides what'), /constitutional change rule: any 2 of the 3 members/);
});

test("the release area's own words are shown as plain text, and an area left without holders is said to be frozen", () => {
  const t = termsOf(encodeTerms(collectiveTerms(g({ releaseWords: 'We sign only what we built.' }), [a, b, c])));
  const r = readAgreement(t, names);
  assert.match(all(r), /It has words of its own, shown below; its holders change them alone/);
  assert.deepEqual(r.plain, [{ heading: 'The “Releases” area\'s own words', text: 'We sign only what we built.' }]);
  // F105 coverage: a named authority does not cover itself.
  const named = { ...t, abandonment: { authority: 'named' as const, identity: a, outcomes: [0] } };
  assert.deepEqual(uncovered(named), [a]);
  assert.deepEqual(uncovered({ ...t, abandonment: { ...t.abandonment!, outcomes: [1] } }), [a, b, c]);
});

test("a clone's mark, read in words: the powers it claims and who signs; Agreements check it (F104)", () => {
  const parent = sha256('the founding agreement');
  const mark: MarkEntry[] = [{ power: { constitutional: true }, signers: [a, b] }];
  const t = termsOf(encodeTerms(collectiveTerms(g(), [a, b, d], parent, mark)));
  assert.equal(t.signing, undefined);
  const r = readAgreement(t, names);
  const w = section(r, 'How it comes into force: its mark');
  assert.match(w, /It says it comes in by the constitutional change rule of that agreement, signed by Ann and Ben\./);
  assert.match(w, /Agreements check that these are exactly the powers its changes need.*A false mark sinks the clone, whatever signatures it gathers \(F104\)/);
  assert.match(w, /put in force by a rotation of the collective; any other change by the collective's record, at once/);
  assert.match(all(r), /It is a clone of agreement [0-9a-f]{8}…[0-9a-f]{4}: once in force, it replaces it/);

  const words = termsOf(encodeTerms(collectiveTerms(g({ releaseWords: 'x' }), [a, b, c], parent, [{ power: { area: 1 }, signers: [a, b] }])));
  const before = termsOf(encodeTerms(collectiveTerms(g(), [a, b, c])));
  assert.match(section(readAgreement(words, names, before), 'How it comes into force: its mark'), /comes in by the power of the “Releases” area \(area 1\) of that agreement, signed by Ann and Ben/);
});

test('hidden direction controls in the words are named, and shown as escapes in the plain view (Text rule 5a)', () => {
  const words = 'Ann pays Ben ‮nothing‬, never less.';
  const t = termsOf(encodeTerms(collectiveTerms(g({ text: words }), [a, b, c])));
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

test('what this client does not implement cannot be signed; terms out of their format, or with a withdrawn field, are refused outright', () => {
  const unknown = sha256('an extension nobody here knows');
  const t = collectiveTerms(g(), [a, b, c]);
  t.extensions = [...t.extensions, unknown];
  const r = readAgreement(termsOf(encodeTerms(t)), names);
  assert.match(r.blocking.join(' '), /extension this client does not implement.*Agreements rule 2/);

  // Terms field 8, the split plan, is withdrawn with fields 14, 28 and 29: a publication carries the
  // split plan, the split service, the fees and the backups (S7h-2). (Was: an empty plan refused as
  // not in the plan's format; the premise is gone, so the new rule is asserted.) Field 10, the
  // concurrency rule, is withdrawn too: the core will not read terms carrying either.
  const m = cborDecode(encodeTerms(collectiveTerms(g(), [a, b, c]))) as Map<number, unknown>;
  m.set(8, []);
  assert.throws(() => termsOf(cborEncode(m)), /terms fields 8, 14, 28 and 29 are withdrawn/);
  const w = cborDecode(encodeTerms(collectiveTerms(g(), [a, b, c]))) as Map<number, unknown>;
  w.set(10, 0);
  assert.throws(() => termsOf(cborEncode(w)), /terms field 10 \(the concurrency rule\) is withdrawn/);
});

test("Agreements' objections by their codes, in Agreements' own words, after the client's own hints, never folded by wording", () => {
  // Two members who must both rebuild the chain key: refused by F96.
  const t = termsOf(encodeTerms(collectiveTerms(g({ abandonmentOthers: 1 }), [a, b])));
  assert.equal(t.problem!.code, 'check');
  const r = readAgreement(t, names);
  assert.equal(r.blocking.length, 1);
  assert.equal(r.blocking[0], problemWords(t.problem!));
  assert.match(r.blocking[0], /^Agreements refuse these terms\. Agreements' own words: “.+”\.$/);

  const hints = rulesHints({ safety: 2, release: 3, clone: 2, others: 2 }, 2);
  assert.equal(hints.length, 3);
  assert.match(hints[0], /^With 2 members, a chain key that needs all 2 of them would be lost with any one of them \(F96\)/);
  const out = withAgreements(hints, [...r.blocking, ...r.blocking]);
  assert.deepEqual(out, [...hints, r.blocking[0]], "the client's hints first, then Agreements' objection, once");
  assert.match(rulesHints({ safety: 1, release: 1, clone: 1, others: 1, constitution: 3 }, 2)[0], /change of the constitution is not between 1 and the 2 members/);

  // An error the core throws is recognised by its code alone.
  let thrown: unknown;
  try {
    checkTerms(encodeTerms(collectiveTerms(g({ abandonmentOthers: 1 }), [a, b])), AGREEMENTS_SPECS);
  } catch (e) {
    thrown = e;
  }
  assert.equal(agreementsThrown(thrown)?.code, 'check');
  assert.equal(agreementsThrown(new Error('something else')), null);
  assert.match(problemWords({ code: 'unsupported', text: 'x' }), /^Agreements do not support these terms yet\. Agreements' own words: “x”\.$/);

  // Any one member alone: allowed, and said plainly.
  const one = readAgreement(termsOf(encodeTerms(collectiveTerms(g({ safetyThreshold: 1, abandonmentOthers: 1 }), [a, b]))), names);
  assert.deepEqual(one.blocking, []);
  assert.match(all(one), /Any one member alone can rebuild the chain key/);
});

test('what a clone changes, by tier, and the powers its mark must name', () => {
  const parent = sha256('the founding agreement');
  const before = encodeTerms(collectiveTerms(g(), [a, b, c]));
  // F122: the version also changes a judge (who judges absence): its mark
  // names the constitutional change rule and the judicial tier's rule.
  const mark: MarkEntry[] = [
    { power: { constitutional: true }, signers: [b, c] },
    { power: { judicial: true }, signers: [a, b, c] },
  ];
  const after = encodeTerms(collectiveTerms(g({ safetyThreshold: 1, abandonmentOthers: 1, text: 'New words.' }), [b, d], parent, mark));
  const w = readChanges(before, after, names).map((l) => l.text).join('\n');
  assert.match(w, /Di joins, bound once they sign the clone/);
  assert.match(w, /Ann leaves\. They hand over nothing/);
  assert.match(w, /Cy leaves/);
  // A collective has no signing key (Agreements rule 56): nothing passes to anyone (was: "The signing key passes to Ben").
  assert.doesNotMatch(w, /signing key/);
  assert.match(w, /2 shares, any 1 rebuild it \(was 3 shares, any 2\)/);
  assert.match(w, /The “Releases” area \(area 1\) is now decided by any 2 of Ben and Di \(was any 2 of Ann, Ben and Cy\)/);
  assert.match(w, /Absence is now judged by any 1 of the other parties \(was any 2 of the other parties\)\. A protected clause/);
  assert.match(w, /The constitution's words change/);
  assert.match(w, /A change to who the members are: constitutional\./);
  assert.match(w, /A change to the abandonment clause: judicial, a protected clause/);
  assert.match(w, /So its mark must name the constitutional change rule and the judicial tier's rule, every member whose voice remains \(Agreements rule 44c\)\.\nIts mark names exactly that\./);

  // An ordinary change: the release area's words, operational in that area.
  const words = encodeTerms(collectiveTerms(g({ releaseWords: 'Ours.' }), [a, b, c], parent, [{ power: { area: 1 }, signers: [a, b] }]));
  const ww = readChanges(before, words, names);
  const wt = ww.map((l) => l.text).join('\n');
  assert.match(wt, /A change to the “Releases” area's own words: operational, in the “Releases” area\./);
  assert.match(wt, /So its mark must name the power of the “Releases” area \(area 1\)/);
  assert.ok(!ww.some((l) => l.tone === 'bad'));

  // A false mark: the clone rule claimed for a member change.
  const wrong = encodeTerms(collectiveTerms(g(), [a, b], parent, [{ power: { clone: true }, signers: [a, b] }]));
  const bad = readChanges(before, wrong, names).filter((l) => l.tone === 'bad');
  assert.equal(bad.length, 1);
  assert.match(bad[0].text, /Its mark names the clone rule: a false mark sinks the clone \(F104\)/);
});

// Was: "a deal's backup split services are the split cMIP's fields, field 29, one grant per payee each".
// Terms fields 14 and 29 are withdrawn (S7h-2): a publication names its split service (field 3) and
// its backups in order (field 11), read by its split cMIP (Agreements rules 16, 17); a collective names
// its own by its split agreement, a publication selling nothing (rule 15). The new rule is asserted:
// terms naming a split service or backups are refused, a split agreement carries them in order, and
// the chain of judgment still never follows the split service (F250).
test('a split service and its backups are a publication\'s fields (3 and 11), in order; terms fields 14 and 29 are withdrawn; the chain of judgment no longer follows the split service (F249, F250)', () => {
  const h = (n: number) => new Uint8Array(32).fill(n);
  const hx = (n: number) => Buffer.from(h(n)).toString('hex');
  const deal = (extra: [number, unknown][]) =>
    cborEncode(
      new Map<number, unknown>([
        [0, [h(1), h(2)]],
        [1, 'a song'],
        [2, new Map([[8, h(4)]])],
        [4, [0]],
        [5, [0]],
        ...extra,
      ]),
    );
  assert.ok(!termsOf(deal([])).problem, 'the deal alone is accepted');
  assert.throws(() => termsOf(deal([[14, [h(7), h(8)]]])), /terms fields 8, 14, 28 and 29 are withdrawn/);
  assert.throws(() => termsOf(deal([[29, new Map<number, unknown>([[0, [[h(9), h(10)]]]])]])), /terms fields 8, 14, 28 and 29 are withdrawn/);
  // A split agreement (a publication selling nothing): its service and its backups, in the order given.
  const made = publicationPayload({ owners: hx(3), partners: [], service: hx(7), backups: [hx(9), hx(10)], plan: { shares: [], cmip: hx(4) } }) as { type: number; payload: Uint8Array };
  assert.equal(made.type, 6);
  const pub = cborDecode(made.payload) as Map<number, unknown>;
  assert.equal(pub.has(0), false, 'it sells nothing: a split agreement');
  assert.equal(Buffer.from(pub.get(3) as Uint8Array).toString('hex'), hx(7), 'its split service');
  assert.deepEqual((pub.get(11) as Uint8Array[]).map((x) => Buffer.from(x).toString('hex')), [hx(9), hx(10)], 'its backups, in order');
  // The chain of judgment following the split service is withdrawn.
  assert.throws(() => termsOf(deal([[6, [h(3), 0]], [21, [[[2], [[h(9), 30]]]]]])), /F250/);
});

test('Agreements rule 49 (F172, F178 item 11): before signing terms with an abandonment clause, who may declare a party absent, with which outcomes, and whether an absence-proof cMIP stands between', () => {
  // A collective's terms, read from their bytes: no absence-proof cMIP.
  const t = termsOf(encodeTerms(collectiveTerms(g(), [a, b, c])));
  assert.equal(t.abandonment?.proof ?? null, null);
  const r = readAgreement(t, names);
  const absence = section(r, 'If someone disappears');
  assert.match(
    absence,
    /If a party stops acting on the agreement, any 2 of the other parties together may declare them absent\. What may then follow: their voice is removed .*\. No absence-proof cMIP stands between: their word alone is enough, nobody checks it against time or your activity\. Signing accepts that \(Agreements rules 49 and 51, a stated cost\); if they declare you absent wrongly, you can only contest it, in public \(Agreements rule 52\)\./,
  );
  assert.equal(r.sections.find((s) => s.heading === 'If someone disappears')?.lines[0].tone, 'warn');
  assert.doesNotMatch(all(r), /period|acknowledgement|F158/, 'no period, no acknowledgement window (F172)');

  // A clause naming a person and an absence-proof cMIP, as the core reads them.
  const p = sha256('an absence-proof cMIP');
  const named = { ...t, abandonment: { authority: 'named' as const, identity: d, outcomes: [0, 1], proof: p } };
  const w = absenceWarning(named, names);
  assert.match(w!.text, /Di may declare them absent\. What may then follow: their voice is removed .* and their stake is shared among the remaining holders\./);
  assert.match(w!.text, /An absence-proof cMIP stands between their word and your stake: an unknown specification \(.*\)\. A declaration counts only if it accepts it \(Agreements rule 51\)\./);
  assert.equal(absenceWarning({ abandonment: null }, names), null, 'no clause, nothing to warn of');

  // Key 3 read from the bytes; key 2 (a period) refused by Agreements (F172).
  const bytes = encodeTerms(collectiveTerms(g(), [a, b, c]));
  const withKey = (k: number, v: unknown) => {
    const m = cborDecode(bytes) as Map<number, unknown>;
    (m.get(9) as Map<number, unknown>).set(k, v);
    return cborEncode(m);
  };
  const h = new Uint8Array(32).fill(5);
  const k3 = termsOf(withKey(3, [h, ['any', 'parameters']]));
  assert.ok(!k3.problem, JSON.stringify(k3.problem));
  assert.equal(k3.abandonment?.proof, Buffer.from(h).toString('hex'));
  assert.match(section(readAgreement(k3, names), 'If someone disappears'), /An absence-proof cMIP stands between/);
  assert.throws(() => termsOf(withKey(2, 30)), /law\/shape: .*abandonment key 2 .*F172/);

  // F182 item 16: this client implements no absence-proof cMIP, so it refuses to sign terms naming one, as it
  // refuses an unknown extension; terms naming none it signs. (Removal check: without the refusal, nothing blocks.)
  const blocked = readAgreement(k3, names).blocking;
  assert.equal(blocked.filter((b) => /absence-proof cMIP this client does not implement .*task 14.*MUST NOT sign/.test(b)).length, 1, blocked.join('\n'));
  assert.match(section(readAgreement(k3, names), 'If someone disappears'), /This client does not implement the absence-proof cMIP the clause names/);
  assert.ok(!readAgreement(t, names).blocking.some((b) => /absence-proof/.test(b)), 'no absence-proof cMIP named: nothing to refuse');
});

test('owners who choose the members, holding no key: the reading warns (Agreements draft 14, F311, F317; freeze suite 3.7ae, client conformance)', () => {
  const t = termsOf(encodeTerms(collectiveTerms(g(), [a, b, c])));
  // The constitution counted among the holders of the collective's stake in
  // itself, Di, no member, holding half of it.
  t.constitutional = { form: 'holders', stake: 0, share: 600_000 };
  t.stakes = [[null, [[a, 200_000], [b, 150_000], [c, 150_000], [d, 500_000]]]];
  const w = section(readAgreement(t, names), 'Who decides what');
  assert.match(w, /holders of stake 0 holding together at least 60% of it, members or not/);
  assert.match(w, /none of them who is no member \(Di\) holds a share of the chain key or is its custodian: if the owners vote the members out and the members refuse to rotate, the vote stands complete and unexecuted/);
  // Di holds a share of the chain key: no warning.
  t.grammar!.chainKey = { ...t.grammar!.chainKey, members: [...(t.grammar!.chainKey.members ?? []), d] };
  assert.doesNotMatch(section(readAgreement(t, names), 'Who decides what'), /complete and unexecuted/);
});

test('S7h-4 (rules 64 and 83): a succession plan named in a mark is read with what its clone must do: pass the stakes to the heirs, change a layer only by the successor', () => {
  const said = powerWords({ form: 'plan', party: 'Ben' }, [], (x) => x);
  assert.match(said, /^the succession plan of Ben \(its clone must pass Ben’s stakes to the heirs the plan names, in its parts, and may change a layer’s rule only by putting the successor in Ben’s place: Agreements rules 64 and 83\)$/);
});
