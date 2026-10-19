// The founding grid (round 3; `src/grid.ts`): its hashes are the core's; it
// refuses in plain words what Agreements would refuse; the grid of the
// author's cast becomes founding terms Agreements accept, with its areas, its
// numbers and the Money area's cap (area key 6, F353); read back as a grid for
// a member change; said in sentences, band by band.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MIRS as CORE, moneySpecs, sha256 } from '../../genesis/src/core.ts';
import { TestCollective } from '../../repo/src/collective.ts';
import { readAgreement, termsOf } from '../../collective/src/explain.ts';
import { GRANT_LIMITS_SPEC_2, MIRS, REGTEST_UNIT, defaultGrid, governanceOf, gridOf, gridSay, type Grid } from '../src/grid.ts';

const A = sha256('A, a test identity');
const iPa = sha256('iPa, a test identity');
const iPh = sha256('iPh, a test identity');
const names = (id: string) => (id === A ? 'A' : id === iPa ? 'iPa' : id === iPh ? 'iPh' : id.slice(0, 8));

/** Round 3's cast: Publishing, everyone, one key; Money, A and iPa, one key, two above 10,000; Development, iPh alone. */
const cast = (): Grid => ({
  members: [A, iPa, iPh],
  constitution: { holders: [A, iPa, iPh], number: 3 },
  chainKey: 2,
  absence: 2,
  areas: [
    { name: 'Publishing', layer: 1, holders: [A, iPa, iPh], number: 1 },
    { name: 'Money', layer: 2, holders: [A, iPa], number: 1, cap: 10_000 },
    { name: 'Development', layer: 4, holders: [iPh], number: 1 },
  ],
  clone: 2,
});

test('the hashes the page writes are the core’s', () => {
  for (const k of ['text', 'envelopes', 'money', 'agreements', 'development'] as const) assert.equal(MIRS[k], CORE[k], k);
  assert.equal(GRANT_LIMITS_SPEC_2, sha256('Grant limits cMIP, draft 2, test value until publication'));
  assert.equal(REGTEST_UNIT, (moneySpecs() as { units: { regtest: string } }).units.regtest);
});

test('the cast’s grid becomes founding terms Agreements accept, its areas and cap read back', () => {
  const { governance, blocking } = governanceOf(cast(), 'The words.');
  assert.deepEqual(blocking, []);
  const payload = TestCollective.foundingTerms(governance, [A, iPa, iPh]);
  const t = termsOf(payload) as unknown as { areas: { id: number; name: string; holders: string[]; threshold: number; kinds: { form: string; layer?: number }[]; limitsCmip?: string | null }[]; constitutional: unknown; clone: { threshold?: number } };
  assert.deepEqual(t.areas.map((a) => [a.id, a.name, a.holders.map(names), a.threshold, a.kinds.map((k) => k.layer)]), [
    [1, 'Publishing', ['A', 'iPa', 'iPh'], 1, [1]],
    [2, 'Money', ['A', 'iPa'], 1, [2]],
    [3, 'Development', ['iPh'], 1, [4]],
  ]);
  assert.equal(t.areas[1].limitsCmip, GRANT_LIMITS_SPEC_2);
  assert.ok(t.constitutional == null, 'every member: the default');
  const read = readAgreement(termsOf(payload), names);
  const all = read.sections.flatMap((s) => s.lines.map((l) => l.text)).join('\n');
  assert.match(all, /Above 10,000 an act, one more holder's key/);
  assert.match(all, /a key of their own/);
  // Read back for a member change: the same grid.
  const back = gridOf(governance, [A, iPa, iPh]);
  assert.deepEqual(back.areas.map((l) => [l.id, l.name, l.layer, l.holders.map(names), l.number, l.cap]), [
    [1, 'Publishing', 1, ['A', 'iPa', 'iPh'], 1, undefined],
    [2, 'Money', 2, ['A', 'iPa'], 1, 10_000],
    [3, 'Development', 4, ['iPh'], 1, undefined],
  ]);
  // An area kept keeps its id; a new one takes the next, never a used one (Q32).
  const g = { ...back, areas: [...back.areas.filter((l) => l.name !== 'Development'), { name: 'Vows', layer: 1, kinds: [`${MIRS.envelopes}:5`], holders: [A], number: 1 }] };
  g.areas[0].kinds = [`${MIRS.envelopes}:0`, `${MIRS.text}:0`];
  const again = governanceOf(g, 'x', [1, 2, 3]);
  assert.deepEqual(again.blocking, []);
  assert.deepEqual(again.governance.areas!.map((a) => [a.id, a.name]), [[1, 'Publishing'], [2, 'Money'], [4, 'Vows']]);
});

test('the grid refuses in plain words what Agreements would refuse', () => {
  const said = (f: (g: Grid) => void) => {
    const g = cast();
    f(g);
    return governanceOf(g, 'x').blocking.join(' | ');
  };
  assert.match(said((g) => (g.areas[2].holders = [])), /fill at least one member’s box/);
  assert.match(said((g) => (g.areas[1].number = 3)), /a number of keys from 1 to 2/);
  assert.match(said((g) => (g.chainKey = 3)), /losing one member’s share/);
  assert.match(said((g) => (g.absence = 3)), /Judge absence: a number from 1 to 2/);
  assert.match(said((g) => g.areas.push({ name: 'More money', layer: 2, holders: [iPh], number: 1 })), /reach the same acts/);
  assert.match(said((g) => (g.areas[0].cap = 5)), /for a Money area/);
  assert.match(said((g) => (g.areas[1].holders = [A])), /above the amount it asks 2 keys, and has 1 holder/);
  assert.match(said((g) => (g.areas[0].kinds = [])), /none is chosen/);
  assert.match(said((g) => (g.constitution.holders = [])), /tick at least one member/);
  assert.match(said((g) => (g.areas = [])), /Add at least one area/);
  // Kinds that do not overlap stand side by side in one layer.
  assert.equal(said((g) => {
    g.areas[0].kinds = [`${MIRS.envelopes}:0`];
    g.areas.push({ name: 'Vows', layer: 1, kinds: [`${MIRS.envelopes}:5`], holders: [iPa], number: 1 });
  }), '');
});

test('some members ticked for the constitution: a rule naming them', () => {
  const g = cast();
  g.constitution.holders = [A, iPa];
  const { governance, blocking } = governanceOf(g, 'x');
  assert.deepEqual(blocking, []);
  assert.deepEqual(governance.constitutionalNamed, [A, iPa]);
  const t = termsOf(TestCollective.foundingTerms(governance, [A, iPa, iPh])) as unknown as { constitutional: { form: string } };
  assert.equal(t.constitutional.form, 'named');
});

test('the grid in sentences: the constitution, the judges, the areas, each member', () => {
  const s = gridSay(cast(), names);
  assert.deepEqual(s.map((x) => x.heading), ['The constitution', 'The judges', 'The areas', 'Each member']);
  const areas = s[2].lines.join('\n');
  assert.match(areas, /“Money”: all money \(the Money layer\)\. Any one of A and iPa, each signing with a key of their own; above 10,000 regtest satoshis an act, 2 keys/);
  assert.match(areas, /“Development”: .*IPh alone|“Development”: .*iPh alone/);
  assert.match(s[3].lines[2], /^iPh: holds “Publishing” and “Development”/);
  assert.equal(defaultGrid([A, iPa]).areas.length, 1);
});
