// H40: Kišib's vault, findable. A top-level "Change the vault" door opens
// the change of keys at The vault, saying first, in plain words, that
// changing the vault or its limit is a change of keys: the chain-key paper
// needed, a new signing key's paper written.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { VAULT_SAY, form, start } from '../src/page/view.ts';

test('H40: Change the vault, a door of its own, saying first that it is a change of keys', () => {
  const s = start(false);
  assert.match(s, /data-form="vault"><strong>Change the vault<\/strong>/);
  const f = form('vault', false);
  const say = f.indexOf('id="vault-say"');
  const fields = f.indexOf('name="words"');
  assert.ok(say > 0 && say < fields, 'said before anything is typed');
  for (const t of VAULT_SAY) assert.ok(f.includes(t.replace(/’/g, '’')), t);
  assert.match(VAULT_SAY.join(' '), /change of keys/);
  assert.match(VAULT_SAY.join(' '), /chain key’s paper/);
  assert.match(VAULT_SAY.join(' '), /new signing key’s 24 words/);
  // The same change of keys, opened at The vault: its fold open, "declare it anew" chosen.
  assert.match(f, /id="form-rotate" data-kind="rotate"/);
  assert.match(f, /<details open><summary>The vault/);
  assert.match(f, /<option value="set" selected>Declare it anew/);
  // The ordinary change of keys keeps the vault as it is by default.
  assert.match(form('rotate', false), /<option value="keep" selected>Keep it as it is/);
});
