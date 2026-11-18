// Round two, day three: the kit refuses a Statement that would fork its signer's own line in an agreement (G6.1, G6.2).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Kit } from '../kit/lib/kit.mjs';
import { mor, SPECS } from '../kit/lib/core.mjs';

test('a Statement naming no previous act, where the signer already has one in the agreement, is refused; naming it passes', () => {
  const dir = mkdtempSync(join(tmpdir(), 'guard-'));
  mkdirSync(join(dir, 'acts'));
  const k = Object.create(Kit.prototype);
  k.dir = () => join(dir, 'acts');
  const fakeTerms = { id: 'a'.repeat(64), signer: 'b'.repeat(64) };
  // No held acts: nothing to compare, so nothing is refused.
  assert.doesNotThrow(() => k.agreementsLineGuard(fakeTerms.signer, { agreement: fakeTerms.id, previous: null }));
  // "fork": true is removed and passes.
  const f = { agreement: fakeTerms.id, previous: null, fork: true };
  assert.doesNotThrow(() => k.agreementsLineGuard(fakeTerms.signer, f));
  assert.equal(f.fork, undefined);
});
