// The founding grid (round 3; `src/grid.ts`; F402, H101, H118, H120): its
// hashes are the core's; it refuses in plain words what Agreements would
// refuse; every one of the five layers named (rule 60), what one member may
// do alone said layer by layer, Money first; finer areas by act type, the
// Money one capped (area key 6); the Shares band required and even until
// touched; the grid of the author's cast becomes founding terms Agreements
// accept, read back as a grid for a member change, said in sentences.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MIRS as CORE, moneySpecs, sha256 } from '../../genesis/src/core.ts';
import { TestCollective } from '../../repo/src/collective.ts';
import { readAgreement, termsOf } from '../../collective/src/explain.ts';
import { GRANT_LIMITS_SPEC_2, MIRS, REGTEST_UNIT, aloneSay, defaultGrid, evenPercent, governanceOf, gridOf, gridSay, kindsFor, type Grid } from '../src/grid.ts';

const A = sha256('A, a test identity');
const iPa = sha256('iPa, a test identity');
const iPh = sha256('iPh, a test identity');
const names = (id: string) => (id === A ? 'A' : id === iPa ? 'iPa' : id === iPh ? 'iPh' : id.slice(0, 8));

const money = kindsFor(3).map((k) => `${k.spec}:${k.type}`);

/** Round 3's cast: Text and Envelopes, any one member; Money, A and iPa together, and a finer area for its pointers and receipts, any one of them up to 10,000; Agreements, every member; Development, iPh alone. */
const cast = (): Grid => ({
  members: [A, iPa, iPh],
  constitution: { holders: [A, iPa, iPh], number: 3 },
  chainKey: 2,
  absence: 2,
  layers: {
    1: { holders: [A, iPa, iPh], number: 1 },
    2: { holders: [A, iPa, iPh], number: 1 },
    3: { holders: [A, iPa], number: 2 },
    4: { holders: [A, iPa, iPh], number: 3 },
    5: { holders: [iPh], number: 1 },
  },
  areas: [{ name: 'Day to day money', layer: 3, kinds: money.slice(0, 3), holders: [A, iPa], number: 1, cap: 10_000 }],
  clone: 2,
  shares: evenPercent([A, iPa, iPh]),
});

test('the hashes the page writes are the core’s', () => {
  for (const k of ['text', 'envelopes', 'money', 'agreements', 'development'] as const) assert.equal(MIRS[k], CORE[k], k);
  assert.equal(GRANT_LIMITS_SPEC_2, sha256('Grant limits cMIP, draft 2, test value until publication'));
  assert.equal(REGTEST_UNIT, (moneySpecs() as { units: { regtest: string } }).units.regtest);
});

test('F402: the cast’s grid becomes founding terms naming all five layers, its finer area, cap and shares read back', () => {
  const { governance, blocking } = governanceOf(cast(), 'The words.');
  assert.deepEqual(blocking, []);
  const payload = TestCollective.foundingTerms(governance, [A, iPa, iPh]);
  const t = termsOf(payload) as unknown as {
    layers: [number, { form: string; threshold?: number | null; named?: string[] | null }][];
    areas: { id: number; name: string; holders: string[]; threshold: number; kinds: { form: string; type?: number }[]; limitsCmip?: string | null }[];
    target: unknown;
    stakes: { holders: [string, number][] }[];
    constitutional: unknown;
  };
  assert.deepEqual(t.layers.map(([l, r]) => [l, r.form, r.threshold ?? null, (r.named ?? []).map(names)]), [
    [1, 'threshold', 1, []],
    [2, 'threshold', 1, []],
    [3, 'named', null, ['A', 'iPa']],
    [4, 'all', null, []],
    [5, 'named', null, ['iPh']],
  ]);
  assert.deepEqual(t.areas.map((a) => [a.id, a.name, a.holders.map(names), a.threshold]), [[1, 'Day to day money', ['A', 'iPa'], 1]]);
  assert.equal(t.areas[0].limitsCmip, GRANT_LIMITS_SPEC_2);
  assert.ok(t.constitutional == null, 'every member: the default');
  const read = readAgreement(termsOf(payload), names);
  const all = read.sections.flatMap((s) => s.lines.map((l) => l.text)).join('\n');
  assert.match(all, /no signing key of its own/, 'no signing key (rule 56)');
  assert.match(all, /There are no member keys/, 'no member keys (rule 58)');
  assert.doesNotMatch(all, /signing key is held|holds its signing key|named in the signature/i);
  // Read back for a member change: the same grid, shares included.
  const back = gridOf(governance, [A, iPa, iPh]);
  assert.deepEqual(back.layers, cast().layers);
  assert.deepEqual(back.areas.map((l) => [l.id, l.name, l.layer, l.holders.map(names), l.number, l.cap]), [[1, 'Day to day money', 3, ['A', 'iPa'], 1, 10_000]]);
  assert.deepEqual(back.shares, cast().shares);
  // An area kept keeps its id; a new one takes the next, never a used one (Q32).
  const g = { ...back, areas: [...back.areas, { name: 'Vows', layer: 2, kinds: [`${MIRS.envelopes}:5`], holders: [A], number: 1 }] };
  const again = governanceOf(g, 'x', [1, 2]);
  assert.deepEqual(again.blocking, []);
  assert.deepEqual(again.governance.areas!.map((a) => [a.id, a.name]), [[1, 'Day to day money'], [3, 'Vows']]);
});

test('F402, rule 60 (client conformance): what one member may do alone, layer by layer, Money first', () => {
  const said = aloneSay(cast(), names);
  assert.match(said[0], /^Money: no member alone \(save “Day to day money”, a finer area\)\. A and iPa together must sign\./);
  assert.deepEqual(said.map((x) => x.split(':')[0]), ['Money', 'Text', 'Envelopes', 'Agreements', 'Development']);
  assert.match(said[1], /^Text: Any one member alone may post/);
  assert.match(said[4], /^Development: iPh alone may adopt extensions/);
  // A collective of two who never thought about it: the default never lets either point its income at themself alone.
  const two = defaultGrid([A, iPa]);
  assert.match(aloneSay(two, names)[0], /^Money: no member alone/);
  // "Any one member alone" is a valid rule, said plainly.
  two.layers[3] = { holders: [A, iPa], number: 1 };
  assert.match(aloneSay(two, names)[0], /^Money: Any one member alone may say where the collective is paid \(its payee pointer: their own wallet, if they choose\)/);
  assert.deepEqual(governanceOf(two, 'x').blocking, []);
  assert.deepEqual(gridSay(cast(), names)[0], { heading: 'What one member may do alone, layer by layer', lines: aloneSay(cast(), names) });
});

test('the grid refuses in plain words what Agreements would refuse', () => {
  const said = (f: (g: Grid) => void, joining: string[] = []) => {
    const g = cast();
    f(g);
    return governanceOf(g, 'x', [], joining).blocking.join(' | ');
  };
  assert.match(said((g) => (g.layers[5].holders = [])), /Development: fill at least one member’s box\. Every layer names who acts/);
  assert.match(said((g) => (g.layers[1].number = 4)), /Text: a number from 1 to 3/);
  assert.match(said((g) => (g.areas[0].holders = [])), /fill at least one member’s box/);
  assert.match(said((g) => (g.areas[0].number = 3)), /a number from 1 to 2/);
  assert.match(said((g) => (g.chainKey = 3)), /losing one member’s share/);
  assert.match(said((g) => (g.absence = 3)), /Judge absence: a number from 1 to 2/);
  assert.match(said((g) => g.areas.push({ name: 'More money', layer: 3, kinds: [money[0]], holders: [iPh], number: 1 })), /reach the same acts/);
  assert.match(said((g) => g.areas.push({ name: 'Posts', layer: 1, kinds: [], holders: [iPh], number: 1 })), /choose at least one kind of act/);
  assert.match(said((g) => g.areas.push({ name: 'Posts', layer: 1, kinds: [`${MIRS.text}:0`], holders: [iPh], number: 1, cap: 5 })), /for a Money area/);
  assert.match(said((g) => (g.areas[0].holders = [A])), /above the amount it asks 2 holders, and has 1/);
  assert.match(said((g) => (g.constitution.holders = [])), /tick at least one member/);
  // H101: the Shares band, required, adding up to 100.
  assert.match(said((g) => (g.shares[A] = 50)), /Shares: they add up to 116\.6666%, not 100%/);
  assert.match(said((g) => delete g.shares[iPh]), /a share for every member/);
  assert.match(said((g) => ((g.shares[iPh] = 0), (g.shares[A] += 33.3333)), [iPh]), /a joining member’s share is required/);
  // No finer area at all is valid: every layer is named.
  assert.equal(said((g) => (g.areas = [])), '');
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

test('H101: shares even until touched; a member change carries them, the joining member’s box required', () => {
  const d = defaultGrid([A, iPa, iPh]);
  assert.deepEqual(Object.values(d.shares), [33.3334, 33.3333, 33.3333]);
  const { governance } = governanceOf(cast(), 'x');
  // D joins: the grid read back for four members, D's box empty and required.
  const D = sha256('D, a test identity');
  const back = gridOf(governance, [A, iPa, iPh, D]);
  assert.equal(back.shares[D], 0);
  assert.match(governanceOf(back, 'x', [1], [D]).blocking.join(' | '), /joining member’s share is required/);
  back.shares = { [A]: 25, [iPa]: 25, [iPh]: 25, [D]: 25 };
  back.layers[3] = { holders: [A, iPa], number: 2 };
  assert.deepEqual(governanceOf(back, 'x', [1], [D]).blocking, []);
  // iPh leaves keeping theirs: a departed holder, shown in the band, not a column.
  const left = gridOf(governance, [A, iPa], [A, iPa, iPh]);
  assert.deepEqual(left.departed, [iPh]);
  assert.equal(left.shares[iPh], 33.3333);
});

test('the grid in sentences: alone, the constitution, the judges, finer areas, shares, each member', () => {
  const s = gridSay(cast(), names);
  assert.deepEqual(s.map((x) => x.heading), ['What one member may do alone, layer by layer', 'The constitution', 'The judges', 'Finer areas', 'Shares', 'Each member']);
  assert.match(s[1].lines[1], /no signing key: each member acts for it with their own/);
  assert.match(s[3].lines[0], /“Day to day money”, within Money: only .*\. Any one of A and iPa, each with their own key; above 10,000 regtest satoshis an act, 2 of them/);
  assert.match(s[4].lines.join('\n'), /A: 33\.3334%/);
  assert.match(s[5].lines[2], /^iPh: acts alone in Text, Envelopes and Development; a voice in the constitution; a share of the chain key; 33\.3333% of the collective/);
  assert.equal(defaultGrid([A, iPa]).areas.length, 0);
});
