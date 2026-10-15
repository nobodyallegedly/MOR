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

/** The second recomputation: CBOR by hand, the tagged hash by hand. */
function apart(text: string): string {
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

test('a text that is not canonical is not recomputed, and the reader says so', async () => {
  const rows = await recompute(async (file) => (file.includes('money') ? (await read(file)) + '\n' : read(file)));
  const money = rows.find((r) => r.layer === 'Money')!;
  assert.equal(money.hash, null);
  assert.match(money.problem!, /not canonical text/);
  assert.match(mirsHtml(rows), /not recomputed/);
  assert.equal(rows.filter((r) => r.hash).length, 5);
});
