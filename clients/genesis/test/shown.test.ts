// The display-only encoder against the published vectors and the core library.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { shownForm } from '../src/shown.ts';
import { form } from '../src/forms.ts';

test('the forms shown on pages are the core library’s and the published vectors’', () => {
  const v = JSON.parse(readFileSync(new URL('../../../core/vectors/textual-forms.json', import.meta.url), 'utf8'));
  for (const f of v.forms) assert.equal(shownForm(f.kind, f.data), f.form);
  for (let i = 0; i < 40; i++) {
    const hex = [...crypto.getRandomValues(new Uint8Array(32))].map((b) => b.toString(16).padStart(2, '0')).join('');
    for (const l of ['mid', 'mact', 'mspec', 'mwork'] as const) assert.equal(shownForm(l, hex), form(l, hex));
  }
});
