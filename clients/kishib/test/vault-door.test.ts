// H40: Kišib's vault, findable. On the kit (22 October 2026), Paper's column
// holds "Change the vault", which opens the change of keys at The vault,
// saying first, in plain words, that changing the vault or its limit is a
// change of keys: the chain-key paper needed, a new signing key's paper
// written.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { VAULT_SAY, column, part } from '../src/page/view.ts';

test('H40: Change the vault, a part of Paper of its own, saying first that it is a change of keys', () => {
  assert.ok(column('paper', false, null).some((c) => typeof c === 'object' && c.key === 'vault' && c.label === 'Change the vault'));
  const f = part('paper', 'vault', false, null);
  const say = f.indexOf('id="vault-say"');
  const fields = f.indexOf('name="words"');
  assert.ok(say > 0 && say < fields, 'said before anything is typed');
  for (const t of VAULT_SAY) assert.ok(f.includes(t), t);
  assert.match(VAULT_SAY.join(' '), /change of keys/);
  assert.match(VAULT_SAY.join(' '), /chain key’s paper/);
  // H79: a change of keys writes two new papers, the chain key's and the signing key's.
  assert.match(VAULT_SAY.join(' '), /two new sets of 24 words.*the new chain key’s.*old paper is then spent.*the new signing key’s/);
  // The same change of keys, opened at The vault: its fold open, "declare it anew" chosen.
  assert.match(f, /id="form-rotate" data-kind="rotate"/);
  assert.match(f, /<details class="k-box" open><summary>\+ The vault/);
  assert.match(f, /<option value="set" selected>Declare it anew/);
  // The ordinary change of keys keeps the vault as it is by default.
  assert.match(part('paper', 'rotate', false, null), /<option value="keep" selected>Keep it as it is/);
});
