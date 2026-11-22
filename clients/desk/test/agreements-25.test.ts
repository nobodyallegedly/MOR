// Edubba reading Agreements draft 25 (encoding 2): an act of draft 25 that
// reaches an identity was filed as "other", nothing of it read (DubLaw's
// fault list, F20). Now:
//
// - every worked example of the kit's AGREEMENTS-FIELDS.md, signed by the
//   kit, is read by Edubba (`src/agreements-25.ts`) to the same fields, with
//   the checker's verdict and the plain words;
// - through the program itself: Terms naming an identity held here, and the
//   other party's assent, sent to it at a relay; "refresh" files the Terms as
//   terms, read as written, with the grammar's answer: not in force, since
//   this identity's own assent is not there (G4.1); and the assent read too;
// - the web build's stand-in names encoding 2's spec hashes (E2), as the
//   binding gives them.
//
// TEST IDENTITIES ONLY.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { SPECS_25, assentFields, sign, type Held } from '../../collective/src/agreements-25.ts';
import { signWorkedExamples } from '../../collective/test/kit-examples.ts';
import { draft25Item } from '../src/agreements-25.ts';
import { SPEC_DRAFT_25, SPEC_REPORT_BLOCK_4, draft25Item as onTheWeb } from '../src/web/agreements-25.ts';
import type { Done } from '../src/page/api.ts';
import { state, world, type World } from './setup.ts';

const h = (c: string) => c.repeat(64);
const names = (id: string) => id.slice(0, 8);

test('every worked example of the kit’s AGREEMENTS-FIELDS.md, signed by the kit, is read by Edubba to the same fields', async () => {
  const { signed, extra } = await signWorkedExamples();
  assert.equal(signed.length, 6);
  for (const s of [...signed, ...extra]) {
    const spec = s.act === 'report' ? SPECS_25.report.spec : SPECS_25.terms.spec;
    const item = draft25Item(spec, s.bytes, undefined, s.before, names);
    assert.ok(item, s.heading);
    assert.equal(item.verdict, 'pass', s.heading);
    assert.deepEqual(item.fields, s.fields, s.heading);
    assert.equal(item.kind, s.act === 'terms' ? 'terms' : 'other');
    const text = item.assessment.flatMap((x) => [x.heading, ...x.lines.map((l) => l.text)]).join('\n');
    assert.match(text, /PASS/);
    assert.match(text, /As written/);
  }
});

test('the web build’s stand-in names encoding 2’s spec hashes, and says such acts are read on a computer', () => {
  assert.equal(SPEC_DRAFT_25, SPECS_25.terms.spec);
  assert.equal(SPEC_DRAFT_25, SPECS_25.statement.spec);
  assert.equal(SPEC_REPORT_BLOCK_4, SPECS_25.report.spec);
  assert.match(onTheWeb(SPEC_DRAFT_25)!.problem, /in the program on a computer/);
  assert.equal(onTheWeb(h('0')), null);
});

let w: World;
let me: string;

before(async () => {
  w = await world();
  me = (await w.client.ask<Done>('identity', { name: 'Me', linked: false })).acts[0];
});

after(async () => {
  await w?.stop();
});

test('through the program: Terms and an assent of draft 25 sent to an identity held here are read, and the Terms are not in force without its own assent', async () => {
  const relays = [w.relay.base];
  const other = TestIdentity.create({ homes: w.homes.map((x) => x.home), scheme: 3 });
  await other.publishGenesis();
  for (const a of other.chainActs()) await relayAt(w.relay.base).putAct(a);
  const held: Held[] = [];
  // The other party writes Terms naming both, and assents to them itself (its previous: the Terms, section 3.2).
  const terms = await sign(other, 'terms', { parties: [{ signer: other.id }, { signer: me }], authors: [0], body: { words: h('1'), cmip: h('2'), params: 'f6' }, previous: null }, { held, relays, to: [me] });
  held.push({ act: terms.act });
  const assent = await sign(other, 'statement', assentFields(other.id, terms.id, terms.id, held), { held, relays, to: [me] });
  assert.equal(assent.fields.previous, terms.id);
  await w.client.ask('refresh', { identity: me });
  const got = (await state(w.client)).identities.find((i) => i.id === me)!.received;
  const t = got.find((x) => x.act === terms.id);
  const s = got.find((x) => x.act === assent.id);
  assert.ok(t && s, JSON.stringify(got.map((x) => [x.act, x.kind])));
  assert.equal(t.kind, 'terms');
  const said = (x: typeof t) => [x.problem ?? '', ...(x.assessment ?? []).flatMap((a) => [a.heading, ...a.lines.map((l) => l.text)])].join('\n');
  assert.match(said(t), /Terms \(Agreements draft 25\)/);
  assert.match(said(t), /PASS/);
  assert.match(said(t), /Parties: 0\. .*a signer; 1\. .*a signer/);
  assert.match(said(t), /Draft 25’s default: in force once there is an assent in the name of every party named as a signer/);
  assert.match(said(s), /An assent: its signer agrees to the Terms it names/);
  // The grammar's answer, from the acts this identity received: this identity has not assented, so the Terms are not shown in force.
  assert.match(said(s), /Whether the Terms [0-9a-f]{64} are in force: NOT SHOWN, G4\.1/);
});
