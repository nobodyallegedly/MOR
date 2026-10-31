// A deal between separate people on the redesigned core (F407): an ownership
// agreement on the work's claim, carrying shares only, and a publication that
// carries the split service and the referral off the top. Replaces the old
// deal's own payee, its grant (terms field 14) and its split plan (field 8),
// which the core now refuses in terms.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cborDecode, readTerms, sha256 } from '../../genesis/src/core.ts';
import { AGREEMENTS_SPECS, SPLIT_CMIP } from '../../repo/src/agreements.ts';
import { AGREEMENTS_TYPES } from '../../repo/src/specs.ts';
import { claimPayload, dealClonePayload, dealProblem, dealPublicationObjects, dealPublicationPayload, dealPublicationRead, dealTermsPayload, dealWords, type DealDraft } from '../src/deal.ts';

const [a, b, svc, work] = ['a', 'b', 'service', 'work'].map((s) => sha256(s));
const claim = sha256('a claim act');
const d: DealDraft = { title: 'Two voices', what: 'a post', shares: [[a, 600_000], [b, 400_000]], claim, referral: 50_000, service: svc };

test('a deal’s ownership agreement targets the claim and carries shares only: no split plan, no service, no payee', () => {
  assert.equal(dealProblem(d), null);
  const t = readTerms(dealTermsPayload(d, dealWords(d, (x) => x.slice(0, 4))), AGREEMENTS_SPECS) as { parties: string[]; target: [string, string]; stakes: [string, [string, number][]][] };
  assert.deepEqual(t.parties, [a, b]);
  assert.deepEqual(t.target, ['claim', claim]);
  assert.deepEqual(t.stakes[0][1], [[a, 600_000], [b, 400_000]]);
  const m = cborDecode(dealTermsPayload(d, 'w')) as Map<number, unknown>;
  for (const f of [8, 14, 28, 29]) assert.ok(!m.has(f), `terms field ${f} is a publication's now`);
  // A vow's founding gives its signer the whole stake (rule 14); the clone shares it.
  const vow = readTerms(dealTermsPayload(d, 'w', a), AGREEMENTS_SPECS) as { stakes: [string, [string, number][]][] };
  assert.deepEqual(vow.stakes[0][1], [[a, 1_000_000]]);
  const clone = readTerms(dealClonePayload(d, 'w', sha256('founding')), AGREEMENTS_SPECS) as { parent: string; stakes: [string, [string, number][]][] };
  assert.equal(clone.parent, sha256('founding'));
  assert.deepEqual(clone.stakes[0][1], [[a, 600_000], [b, 400_000]]);
});

test('a deal’s publication names its ownership agreement, its split service and the referral off the top', () => {
  const agreement = sha256('the ownership agreement');
  const p = dealPublicationPayload(d, agreement, [{ bake: work }], 'Sold as is.');
  assert.equal(p.type, AGREEMENTS_TYPES.publication);
  assert.deepEqual(dealPublicationRead(p.payload), { owners: agreement, service: svc, referral: 50_000 });
  assert.deepEqual(dealPublicationObjects(agreement), [[agreement, agreement]]);
  const plan = (cborDecode(p.payload) as Map<number, unknown>).get(4) as Map<number, unknown>;
  assert.equal(Buffer.from(plan.get(1) as Uint8Array).toString('hex'), SPLIT_CMIP);
  assert.deepEqual(dealPublicationRead(dealPublicationPayload({ ...d, referral: 0 }, agreement, [{ bake: work }]).payload).referral, 0);
});

test('a claim binds the work to its creators, ascending', () => {
  const m = cborDecode(claimPayload(work, [b, a, b])) as Map<number, unknown>;
  assert.equal(Buffer.from(m.get(0) as Uint8Array).toString('hex'), work);
  assert.deepEqual((m.get(1) as Uint8Array[]).map((x) => Buffer.from(x).toString('hex')), [a, b].sort());
});
