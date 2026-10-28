// The kit's QR code (H117): each symbol below, at a fixed mask, is the one
// the Rust `qrcode` crate (0.14.1, the one `modules/airgap` uses) draws,
// module for module: the SHA-256 of its rows of 0 and 1 was taken from that
// crate's output (fix round 7: all eight masks of five texts, versions 2 to
// 13, every level, matched). With no mask fixed, the one of lowest penalty
// is chosen; every mask reads the same.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { qr, qrSvg } from '../src/qr.ts';

const rows = (t: string, level: 'L' | 'M' | 'Q' | 'H', mask?: number) => qr(t, { level, mask }).dark.map((r) => r.map((d) => (d ? '1' : '0')).join('')).join('\n');
const sha = (s: string) => createHash('sha256').update(s).digest('hex');

test('a QR code, module for module the one the Rust qrcode crate draws', () => {
  const cases: [string, 'L' | 'M' | 'Q' | 'H', number, number, string][] = [
    [`lightning:LNBCRT1500N1PJ${'Q'.repeat(250)}`, 'M', 0, 12, 'f84fb5cbc5d4d8833cde0d058c0008f3a31d1173ec6e09de4311e00c489e48b0'],
    ['https://dubsar.org/', 'Q', 1, 2, 'd075e6fe1d808b19d1877a3b612ef77244a4304f39d5c716c68a481ca3685385'],
    [`mid1${'k'.repeat(58)}`, 'L', 2, 4, '06e21ff8886f87473ceb2d90e654ab9f70821fc2ebbf73f2d89111c7d385ed05'],
    ['𒁾 Dub', 'H', 4, 2, 'e64168eb127dc030b2a64993dbd51ad741f87f09f3741b637fe37d3b91759e87'],
    ['x'.repeat(400), 'L', 6, 13, 'da469dc2f27edd2c85a655183adf970af668954466bd5e3520e4f705341513c9'],
  ];
  for (const [t, l, m, ver, hash] of cases) {
    assert.equal(qr(t, { level: l, mask: m }).size, ver * 4 + 17, `${t.slice(0, 20)}: version ${ver}`);
    assert.equal(sha(rows(t, l, m)), hash, `${t.slice(0, 20)}, ${l}, mask ${m}`);
  }
});

test('the mask chosen is one of the eight, and the SVG holds its quiet zone, dark on light', () => {
  const t = 'lightning:lnbcrt1u1pexample';
  const chosen = rows(t, 'M');
  assert.ok([0, 1, 2, 3, 4, 5, 6, 7].some((m) => rows(t, 'M', m) === chosen));
  const svg = qrSvg(t, { label: 'The invoice' });
  const n = qr(t, { level: 'M' }).size + 8;
  assert.match(svg, new RegExp(`viewBox="0 0 ${n} ${n}"`));
  assert.match(svg, /<rect width="\d+" height="\d+" fill="#fff"\/><path fill="#000"/);
  assert.match(svg, /aria-label="The invoice"/);
  assert.throws(() => qr('x'.repeat(3000), { level: 'H' }), /Too long/);
});
