// Agreements draft 25 (encoding 2) in the collective client's library
// (`src/agreements-25.ts`, `src/explain-25.ts`), which Edubba reads through.
//
// - The binding in built-25/ is the kit's, byte for byte (its fingerprints).
// - Every worked example of the kit's AGREEMENTS-FIELDS.md (test/kit/, the
//   kit of round two unchanged), signed by the kit, is read by this client to
//   the same fields the kit was given.
// - Every act this client writes (Terms, the author's assent and another
//   party's, a counter signature, an offer naming a party by role and a
//   contest against it, a resolve, a report) passes the kit's own
//   `agreements check`, run as its command, with the acts held.
// - `previous`: an author's assent names the Terms; a second act names the
//   first (draft 25, G6.1 and section 3.2); and the Terms come into force,
//   as the core's grammar verifier answers, only once every party named as a
//   signer has assented, the author included (G4.1); a counter signature
//   before that cancels an assent (G4.10).
// - An act of the earlier Agreements (the test spec hash "LAW") is not one
//   of draft 25: the kit's checker answers "not this encoding" (E2), and a
//   collective's keyless identity, whose acts carry `objects`, is refused (E3).
// - The round's real acts, a sample of fifty (test/real-acts/): each read as
//   the kit reads it: kind, id, signer, the core's verdict, its fields, and
//   for Terms whether they are in force with the fifty held.
//
// TEST IDENTITIES ONLY.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { AGREEMENTS_TYPES, REPO_SPECS } from '../../repo/src/specs.ts';
import {
  SPECS_25,
  assentFields,
  check,
  contestFields,
  counterSignatureFields,
  describe25,
  fieldsOf,
  inForce,
  previousFor,
  read,
  resolveFields,
  sign,
  Refused,
  type Fields,
  type Held,
} from '../src/agreements-25.ts';
import { explain25 } from '../src/explain-25.ts';
import { KIT, kitCheck, signWorkedExamples } from './kit-examples.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const HOME = { operator: 'a'.repeat(64), hint: 'home.test' };
const h = (c: string) => c.repeat(64);
const names = (id: string) => id.slice(0, 8);

test('the draft-25 binding is the kit’s, byte for byte; its spec hashes are encoding 2’s (E2)', () => {
  const built = join(here, '..', 'built-25');
  const listed = readFileSync(join(built, 'BUILT-WITH.txt'), 'utf8');
  for (const f of ['mor_wasm.js', 'mor_wasm_bg.wasm', 'mor_wasm.d.ts']) {
    const sum = createHash('sha256').update(readFileSync(join(built, f))).digest('hex');
    assert.ok(listed.includes(`${sum}  ${f}`), `${f}: ${sum}`);
  }
  assert.deepEqual(SPECS_25, {
    terms: { spec: 'dd90f8af2aa7694b6f5b9924505ad71077e0be7bf578caa007446442ce263b2c', type: 0 },
    statement: { spec: 'dd90f8af2aa7694b6f5b9924505ad71077e0be7bf578caa007446442ce263b2c', type: 1 },
    report: { spec: '7b65c60f7a41d380b017913f1ed5474bf516fdee0cde5035c383c71d8e3d7854', type: 0 },
  });
  assert.notEqual(SPECS_25.terms.spec, REPO_SPECS.agreements, 'the earlier Agreements’ test spec hash is another specification');
});

test('every worked example of the kit’s AGREEMENTS-FIELDS.md, signed by the kit, is read here to the same fields', async () => {
  const { signed, extra } = await signWorkedExamples();
  assert.deepEqual(signed.map((s) => s.heading), ['Terms', 'Statement: assent', 'Statement: counter signature (cancels your assent, until the Terms are in force)', 'Statement: contest (against an offer or vow: Terms naming a party by role)', 'Statement: resolve (a fork in your own line)', 'Report (the report block, proposal 4: a proposal)']);
  for (const s of [...signed, ...extra]) {
    const r = read(s.bytes, null, s.before);
    assert.ok(r, s.heading);
    assert.equal(r.check.verdict, 'pass', `${s.heading}: ${JSON.stringify(r.check)}`);
    assert.equal(r.act, s.act);
    assert.equal(r.id, s.id);
    assert.deepEqual(r.fields, s.fields, s.heading);
    // And said in plain words.
    assert.ok(explain25(r, [...s.before, { act: s.bytes }], names).sections.some((x) => x.heading === 'As written'), s.heading);
  }
});

// ---------------------------------------------------------------- what this client writes


test('every act this client writes passes the kit’s agreements check, its previous names its signer’s last act there, and the Terms come into force only with the author’s assent too', async () => {
  const a = TestIdentity.create({ homes: [HOME] });
  const b = TestIdentity.create({ homes: [HOME] });
  const held: Held[] = [];
  const written: { what: string; act: Uint8Array; key?: Uint8Array | null }[] = [];
  const keep = (what: string, s: { act: Uint8Array; key: Uint8Array }, isPublic = true) => {
    held.push({ act: s.act, key: isPublic ? null : s.key });
    written.push({ what, act: s.act, key: isPublic ? null : s.key });
  };
  // Terms between a and b, written by a.
  const terms = await sign(a, 'terms', { parties: [{ signer: a.id }, { signer: b.id }], authors: [0], body: { words: h('1'), cmip: h('2'), params: 'f6' }, previous: null }, { held });
  keep('Terms', terms);
  const root = terms.id;
  // b assents: b's first act in the agreement, so previous is none.
  const bf = assentFields(b.id, terms.id, root, held);
  assert.equal(bf.previous, null);
  const bAssent = await sign(b, 'statement', bf, { held });
  keep('assent (another party)', bAssent);
  assert.equal(inForce(held, terms.id)[0].word, 'not shown', 'not in force without the author’s own assent (G4.1)');
  // b cancels it before the Terms are in force (G4.10): it names b's assent in previous.
  const cf = counterSignatureFields(b.id, terms.id, root, held);
  assert.equal(cf.previous, bAssent.id);
  const counter = await sign(b, 'statement', cf, { held });
  keep('counter signature', counter);
  // b assents again, after its counter signature; then a, the author, whose previous is its Terms act (section 3.2).
  const again = await sign(b, 'statement', assentFields(b.id, terms.id, root, held), { held });
  keep('assent again', again);
  assert.equal(read(again.act)!.fields!.previous, counter.id);
  const af = assentFields(a.id, terms.id, root, held);
  assert.equal(af.previous, terms.id, 'an author’s assent names the Terms in previous');
  const aAssent = await sign(a, 'statement', af, { held });
  keep('assent (the author)', aAssent);
  const now = inForce(held, terms.id);
  assert.equal(now[0].word, 'shown', JSON.stringify(now));
  assert.equal(now[0].rule, 'G4.6');
  // An offer naming a party by role (it must carry in_force, G4.2), and b's contest against that version, tied to a settlement (G11.8).
  const offer = await sign(a, 'terms', { parties: [{ signer: a.id }, { role: { kind: 'future', spot: { cmip: h('8'), params: 'f6' } } }], authors: [0], body: { words: h('1'), cmip: h('2'), params: 'f6' }, inForce: { cmip: h('9'), params: 'f6' }, previous: null }, { held });
  keep('Terms naming a party by role (an offer)', offer);
  const contest = await sign(b, 'statement', contestFields(b.id, offer.id, offer.id, held, { settlement: h('7') }), { held });
  keep('contest', contest);
  // A resolve in a's own line: two tips, one continuing, previous the act both follow (G12.3).
  const resolve = await sign(a, 'statement', resolveFields(terms.id, root, aAssent.id, [h('4'), h('3')], h('3')), { held });
  keep('resolve', resolve);
  assert.deepEqual(read(resolve.act)!.fields!.resolves, [h('3'), h('4')], 'a set, sorted (E18)');
  // A report (the block's fourth proposal): received, then passed on, private to its signer.
  const report = await sign(a, 'report', { call: { act: h('5') }, lines: [{ line: 'received', amount: { unit: h('6'), value: 5 }, by: h('7') }, { line: 'passed on', amount: { unit: h('6'), value: 5 }, to: { signer: b.id }, by: h('a') }] }, { held, public: false });
  keep('report (private)', report, false);
  // The kit's own command, on every act written, with the acts held before it.
  const answers = kitCheck(written);
  assert.equal(answers.length, written.length);
  answers.forEach((x, i) => assert.equal(x.verdict, 'pass', `${written[i].what}: ${JSON.stringify(x)}`));
  assert.equal(written.length, 9);
  // And each one read back here to the fields it was written from.
  for (const w of written) assert.ok(read(w.act, w.key)?.fields, w.what);
  // Nothing of a's chain moved for an act refused: previousFor still names a's latest act in the first agreement.
  assert.equal(previousFor(a.id, root, held), resolve.id);
});

test('nothing is signed that the checker would not pass, nor by a collective’s keyless line', async () => {
  const a = TestIdentity.create({ homes: [HOME] });
  const before = a.f.sequence.length;
  // Terms naming a party by role, with no in_force: invalid (G4.2), refused before signing.
  await assert.rejects(
    sign(a, 'terms', { parties: [{ role: { kind: 'done', what: h('1'), spot: { cmip: h('8'), params: 'f6' } } }], authors: [0], body: { words: h('1'), cmip: h('2'), params: 'f6' }, previous: null }),
    (e: unknown) => e instanceof Refused && e.rule === 'G4.2',
  );
  // A field the builder does not know.
  await assert.rejects(sign(a, 'terms', { parties: [{ signer: a.id }], authors: [0], body: { words: h('1'), cmip: h('2'), params: 'f6' }, in_force: { cmip: h('9'), params: 'f6' } }), /not one the builder knows/);
  assert.equal(a.f.sequence.length, before, 'nothing signed');
  const c = TestIdentity.create({ homes: [HOME] });
  c.f.cites = [h('d')];
  await assert.rejects(sign(c, 'terms', { parties: [{ signer: c.id }], authors: [0], body: { words: h('1'), cmip: h('2'), params: 'f6' } }), (e: unknown) => e instanceof Refused && e.rule === 'E3');
});

test('an act of the earlier Agreements is no act of draft 25: the checker answers "not this encoding", and this client does not read it as one', async () => {
  const { signaturePayload } = await import('../../genesis/src/core.ts');
  const a = TestIdentity.create({ homes: [HOME] });
  const old = a.sign(REPO_SPECS.agreements, AGREEMENTS_TYPES.signature, signaturePayload(h('1')), { public: true, objects: [[h('1'), h('1')]] });
  assert.equal(check(old.act).verdict, 'not this encoding');
  assert.equal(read(old.act), null);
  assert.equal(kitCheck([{ act: old.act }])[0].verdict, 'not this encoding');
  // A payload that is not the builder's bytes is not given fields.
  assert.equal(fieldsOf('terms', new Uint8Array([0xa0])), null);
});

// ---------------------------------------------------------------- the round's real acts

/**
 * A sample of the round's real Terms and Statements (test/real-acts/: fifty
 * public acts, 20 Terms and 30 Statements, copied unchanged from the round's
 * `_research`, with the manifest that drew them and its rule), read by this
 * client's library and by the kit (test/kit/, round two's, unchanged), each
 * act on its own.
 *
 * For each act: its kind, id and signer as the kit's `agreements check`
 * gives them, and as the manifest lists them; the core's verdict, this
 * library's and the kit's; where it passes, its fields are given, and the
 * kit's own builder writes the act's payload from them, byte for byte. For
 * Terms: the body's cMIP, the manifest's; and whether they are in force,
 * with the fifty acts held, as this library and the kit's `agreements ask
 * in_force` answer (word, rule and qualifier). In force means as far as these
 * fifty show: the sample holds few of the assents the round made.
 */
test('the round’s real acts, a sample of fifty: read by this library as the kit reads them', async () => {
  const { realActs, kit, tally } = await import('./real-acts.ts');
  const { Kit } = (await import(join(KIT, 'lib', 'kit.mjs'))) as { Kit: { agreementsBuild(act: string, f: Fields): Uint8Array } };
  const sample = realActs();
  assert.equal(sample.acts.length, 50);
  const KIND = { terms: 'Terms', statement: 'Statement', report: 'Report' } as const;
  const hexOf = (b: Uint8Array) => Buffer.from(b).toString('hex');
  const all = sample.acts.map((a) => a.file);
  const rows: { id: string; what: string; ours: unknown; theirs: unknown }[] = [];
  const inForceWords: Record<string, number> = {};
  for (const a of sample.acts) {
    const r = read(a.bytes);
    const k = (kit(['agreements', 'check', a.file]) as { verdict: string; act: string; id: string; signer: string }[])[0];
    const row = (what: string, ours: unknown, theirs: unknown) => rows.push({ id: a.id, what, ours, theirs });
    row('kind, the kit’s check', r ? KIND[r.act!] : null, k.act);
    row('kind, the manifest', a.type, k.act);
    row('id, the kit’s check', r?.id, k.id);
    row('id, the manifest', a.id, k.id);
    row('signer, the kit’s check', r?.signer, k.signer);
    row('signer, the manifest', a.signer, k.signer);
    row('the core’s verdict', r?.check.verdict, k.verdict);
    row('fields given where it passes', k.verdict === 'pass' ? r?.fields != null : null, k.verdict === 'pass' ? true : null);
    if (r?.fields) {
      const d = describe25(a.bytes) as { payload: Uint8Array };
      let built: string;
      try {
        built = hexOf(Kit.agreementsBuild(r.act!, r.fields));
      } catch (e) {
        built = `refused: ${e instanceof Error ? e.message : String(e)}`;
      }
      row('the payload, written by the kit’s builder from these fields', built, hexOf(d.payload));
    }
    if (a.type === 'Terms') {
      row('the body’s cMIP, the manifest', (r?.fields?.body as { cmip?: string } | undefined)?.cmip, a.bodyCmip);
      const ours = inForce(sample.held, a.id).map((x) => [x.word, x.rule, x.qualifier]);
      const theirs = (kit(['agreements', 'ask', 'in_force', a.id, '--acts', ...all]) as { word: string; rule: string | null; qualifier: string }[]).map((x) => [x.word, x.rule, x.qualifier]);
      row('in force, with the fifty held', ours, theirs);
      for (const [w] of theirs) inForceWords[w as string] = (inForceWords[w as string] ?? 0) + 1;
    }
  }
  const t = tally(rows);
  console.log(`# the round's real acts (${sample.acts.length}: ${sample.acts.filter((a) => a.type === 'Terms').length} Terms, ${sample.acts.filter((a) => a.type === 'Statement').length} Statements): ${t.match} of ${rows.length} comparisons match the kit and the manifest, ${t.mismatch.length} do not`);
  console.log(`# in force, with the fifty held, as the kit answers: ${Object.entries(inForceWords).map(([w, n]) => `${w} ${n}`).join(', ')}`);
  for (const l of t.lines) console.log(`# mismatch: ${l}`);
  assert.deepEqual(t.lines, []);
});
