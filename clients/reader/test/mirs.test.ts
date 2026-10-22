// F324, the freeze suite v28, step 8.1: a read-only client recomputes the
// six MIRs' spec hashes from the texts it ships, and shows them; two clients
// built by two people recompute the same six. Here the reader's recomputation
// (the core library's `mirHash`) is checked against a second one written
// apart, in this file, from Development draft 10's words alone: the content
// `{0: 4, 9: text}` in deterministic CBOR, hashed `tagged_hash("MOR/spec", ·)`.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { MIR_TEXTS, recompute } from '../src/mirs.ts';
import { mirsHtml } from '../src/view.ts';

const spec = fileURLToPath(new URL('../../../spec/', import.meta.url));
const read = async (file: string) => readFileSync(spec + file, 'utf8');

/** Development rule 26, by hand: at most one final line break removed, and nothing else. */
function frozen(file: string): string {
  return file.endsWith('\n') ? file.slice(0, -1) : file;
}

/** The second recomputation: CBOR by hand, the tagged hash by hand. */
function apart(file: string): string {
  const text = frozen(file);
  const utf8 = Buffer.from(text, 'utf8');
  const n = utf8.length;
  const head = n < 24 ? [0x60 + n] : n < 0x100 ? [0x78, n] : n < 0x10000 ? [0x79, n >> 8, n & 0xff] : [0x7a, (n >>> 24) & 0xff, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
  const content = Buffer.concat([Buffer.from([0xa2, 0x00, 0x04, 0x09, ...head]), utf8]);
  const tag = createHash('sha256').update('MOR/spec').digest();
  return createHash('sha256').update(Buffer.concat([tag, tag, content])).digest('hex');
}

test('8.1: the six hashes recomputed from the texts shipped, the same by two computations (F324)', async () => {
  const rows = await recompute(read);
  assert.equal(rows.length, 6);
  for (const r of rows) {
    assert.equal(r.problem, null, `${r.file}: ${r.problem}`);
    assert.equal(r.hash, apart(await read(r.file)), r.layer);
  }
  assert.equal(new Set(rows.map((r) => r.hash)).size, 6, 'six texts, six hashes');
  const html = mirsHtml(rows);
  for (const r of rows) assert.ok(html.includes(r.hash!), `${r.layer} shown`);
});

test('the texts shipped are the newest draft of each MIR under spec/', () => {
  const files = readdirSync(spec);
  for (const { file } of MIR_TEXTS) {
    const family = file.replace(/\d+\.md$/, '');
    const newest = Math.max(...files.filter((f) => f.startsWith(family) && /\d+\.md$/.test(f)).map((f) => Number(f.slice(family.length, -3))));
    assert.equal(file, `${family}${newest}.md`);
  }
});

test('one final line break is not part of the text; every other line is, a draft\'s status line included (Development rule 26)', async () => {
  const plain = await recompute(read);
  const withBreak = await recompute(async (file) => (await read(file)) + '\n');
  assert.deepEqual(withBreak.map((r) => r.hash), plain.map((r) => r.hash));
  const money = await read('MIR-money-draft-11.md');
  assert.match(money, /^# MIR: Money\n\n\*Draft 11, /, 'the draft carries a status line');
  const reduced = money.replace(/^(# MIR: Money)\n\n\*[^\n]*\*\n/, '$1\n');
  assert.notEqual(apart(money), apart(reduced), 'the status line is hashed with the rest');
});

test('a text that is not canonical is not recomputed, and the reader says so', async () => {
  const rows = await recompute(async (file) => (file.includes('money') ? (await read(file)) + '\n\n' : read(file)));
  const money = rows.find((r) => r.layer === 'Money')!;
  assert.equal(money.hash, null);
  assert.match(money.problem!, /not canonical text/);
  assert.match(mirsHtml(rows), /not recomputed/);
  assert.equal(rows.filter((r) => r.hash).length, 5);
});
