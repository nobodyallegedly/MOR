// F167: a floor under every format's declaration. Whatever a format's
// markup declaration says, it never hides a letter, a digit or a combining
// mark (L, N, M), a currency or mathematical sign (Sc, Sm), the percent and
// per-mille signs, a character between two digits, or a plus or minus sign
// (U+002B, U+002D, U+2212) directly before a digit (Text MIP, Text format).
//
// The floor is tested three ways: directly, on amounts, dates, percentages
// and words with vowel marks; through `checkBound()` handed a hostile
// declaration that claims a floor character as markup, which the check
// passes without the floor and refuses with it; and on the long-form
// format's own, honest markup, in its real positions.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkBound, DECLARED, parse, shownText, underFloor, type Block, type Document, type Mark, type MarkRule } from '../src/format.ts';

/** For each UTF-16 unit of `s`: F if no format may hide it, . if one may. */
const floorOf = (s: string): string =>
  Array.from({ length: s.length }, (_, i) => (underFloor(s, i) ? 'F' : '.')).join('');

/** Cases, each a text and what the floor says of each of its units. */
const PROTECTED: [string, string, string][] = [
  // Amounts.
  ['minus sign', '−2.50', 'FFFFF'],
  ['hyphen-minus', '-2.50', 'FFFFF'],
  ['plus', '+3', 'FF'],
  ['comma groups, point decimals', '1,000.00', 'FFFFFFFF'],
  ['point groups, comma decimals', '1.000,00', 'FFFFFFFF'],
  ['space groups', '1 000', 'FFFFF'],
  ['narrow no-break space groups', '1 000', 'FFFFF'],
  ['thin space groups', '1 000', 'FFFFF'],
  ['apostrophe groups', "1'000", 'FFFFF'],
  ['Arabic decimal separator', '1٫5', 'FFF'],
  ['Arabic thousands separator', '1٬000', 'FFFFF'],
  ['dollar', '$5', 'FF'],
  ['euro before', '€5', 'FF'],
  ['euro after, spaced', '5 €', 'F.F'],
  ['bitcoin', '₿0.001', 'FFFFFF'],
  ['yen', '¥', 'F'],
  ['pound', '£', 'F'],
  ['minus before a fraction', '-½', 'FF'],
  // Dates and times.
  ['ISO date', '2026-10-07', 'FFFFFFFFFF'],
  ['slashed date', '07/10/2026', 'FFFFFFFFFF'],
  ['dotted date', '07.10.2026', 'FFFFFFFFFF'],
  ['time', '10:30', 'FFFFF'],
  ['ratio', '3:2', 'FFF'],
  ['fraction slash', '1⁄2', 'FFF'],
  // Percentages.
  ['percent', '50%', 'FFF'],
  ['percent, spaced', '50 %', 'FF.F'],
  ['per mille', '5‰', 'FF'],
  ['Arabic-Indic digits and Arabic percent sign', '٥٠٪', 'FFF'],
  ['small percent', '5﹪', 'FF'],
  ['fullwidth percent', '5％', 'FF'],
  ['Arabic-Indic per mille', '5؉', 'FF'],
  // Words with vowel marks.
  ['Hebrew with niqqud', 'שָׁלוֹם', 'FFFFFFF'],
  ['Arabic with harakat', 'كَتَبَ', 'FFFFFF'],
  ['Devanagari, matras and anusvara', 'हिंदी', 'FFFFF'],
  ['Devanagari virama', 'न्न', 'FFF'],
  ['Thai', 'น้ำ', 'FFF'],
  ['combining acute', 'é', 'FF'],
  ['Arabic tatweel', 'كـتب', 'FFFF'],
  ['an astral letter, either half', 'x\u{1D400}y', 'FFFF'],
];

test('the floor protects amounts, dates, percentages and vowel marks (F167)', () => {
  for (const [why, s, want] of PROTECTED) assert.equal(floorOf(s), want, `${why}: ${JSON.stringify(s)}`);
});

// What the floor, as written, does not cover: each of these can still be
// hidden by a hostile declaration. Recorded as they are, for Nobody,
// allegedly, to decide; a change to the floor changes this list on purpose.
const NOT_COVERED: [string, string, string][] = [
  ['a decimal point before a digit only', ',5', '.F'],
  ['a hyphen-minus, a space, a digit', '- 5', '..F'],
  ['a hyphen-minus before a currency sign', '-$5', '.FF'],
  ['a trailing minus', '5-', 'F.'],
  ['parentheses for a negative amount', '(5)', '.F.'],
  ['an en dash used as a minus', '–5', '.F'],
  ['a fullwidth hyphen-minus', '－5', '.F'],
  ['a small hyphen-minus', '﹣5', '.F'],
  ['per ten thousand', '5‱', 'F.'],
  ['two characters between two digits', '1, 2', 'F..F'],
  ['a zero width non-joiner in Persian', 'می‌خ', 'FF.F'],
  ['a zero width joiner in Devanagari', 'क्‍ष', 'FF.F'],
  ['a right-to-left mark', '‏5', '.F'],
];

test('what the floor, as written, does not cover (F167, reported)', () => {
  for (const [why, s, want] of NOT_COVERED) assert.equal(floorOf(s), want, `${why}: ${JSON.stringify(s)}`);
});

// ------------------------------------------------------- a hostile declaration

/** A declaration that claims, besides its own markup, the characters given for one entry. */
const hostile = (rule: MarkRule, extra: string): Record<MarkRule, string> => ({ ...DECLARED, [rule]: DECLARED[rule] + extra });

/**
 * A reading of `source` as one list item: its first character claimed as
 * the marker, the second hidden as "the space after the marker", the rest
 * shown as a paragraph. With a declaration that lets an item hide the
 * second character, every position check passes; only the floor is left.
 */
function asItem(source: string): Document {
  const blocks: Block[] = [
    { t: 'list', ordered: false, items: [{ marker: { from: 0, to: 1 }, children: [{ t: 'paragraph', children: [{ t: 'text', span: { from: 2, to: source.length } }] }] }] },
  ];
  const marks: Mark[] = [{ rule: 'item', span: { from: 1, to: 2 } }];
  return { source, blocks, marks };
}

/** A reading of `x\n<last>` as a code block whose last line is claimed as its closing fence. */
function asFence(last: string): Document {
  const source = '```\nx\n' + last;
  return {
    source,
    blocks: [{ t: 'code', label: null, lines: [{ from: 4, to: 5 }] }],
    marks: [
      { rule: 'fence-open', span: { from: 0, to: 3 } },
      { rule: 'fence-close', span: { from: 6, to: source.length } },
    ],
  };
}

const HOSTILE: [string, Document, Record<MarkRule, string>, string][] = [
  // The review's story: "Balance: −2.50" read as "2.50".
  ['a minus sign', asItem('-−2.50'), hostile('item', '−'), '-2.50'],
  ['a hyphen-minus before a digit', asItem('--2.50'), hostile('item', '-'), '-2.50'],
  ['a decimal point between two digits', asItem('1.50'), hostile('item', '.'), '150'],
  ['a thousands comma between two digits', asItem('1,000'), hostile('item', ','), '1000'],
  ['a vowel sign: work becomes less', asItem('काम'), hostile('item', 'ा'), 'कम'],
  ['a currency sign', asItem('-$5'), hostile('item', '$'), '-5'],
  ['a percent sign', asFence('%'), hostile('fence-close', '%'), 'x'],
  ['a digit', asFence('5'), hostile('fence-close', '5'), 'x'],
];

test('a hostile declaration cannot make the floor hideable (F167)', () => {
  for (const [why, doc, table, reads] of HOSTILE) {
    assert.equal(shownText(doc), reads, why);
    // The honest declaration refuses it already.
    assert.notEqual(checkBound(doc), null, `${why}: the honest declaration`);
    // The hostile one passes every check but the floor.
    const breach = checkBound(doc, table);
    assert.ok(breach?.includes('F167'), `${why}: ${breach}`);
  }
});

// --------------------------------------------------- the format's own markup

/** The long-form format's markup, in its real positions, which the floor leaves hideable. */
const HONEST: string[] = [
  '- 5 apples',
  '- -5',
  '-5',
  '+ 5',
  '1. 5',
  '1984\\. A year',
  '*5*',
  '**-2**',
  '***−2.50***',
  '\\5',
  '\\-5',
  '\\*5',
  '# 2026',
  '## 50%',
  '---\n5',
  '`-5`',
  '```\n-5\n```\n6',
  '- a\n\n  5\n- b',
  '1. a\n   -2.50',
];

test('the floor leaves the long-form markup hideable where the format puts it (F167)', () => {
  for (const text of HONEST) {
    const doc = parse(text);
    assert.equal(checkBound(doc), null, text);
  }
});

/**
 * The long-form markup the floor, as written, forbids: < and > are maths
 * signs (Sm), so a quote's sign and a link's brackets fall under it; and a
 * block's last digit and the next block's first digit put the LF between
 * them between two digits, as do emphasis and code spans between digits.
 * Each is a question for Nobody, allegedly; until it is decided, these
 * fail, and each such text is shown plain.
 */
const FORBIDDEN: string[] = ['> quoted', '> 5', '<https://a.b/c>', 'see <mailto:x@y>', '1. Pay 5\n2. Ship', 'Total 1\n2. item', '1*2*3', '1`2`3'];

test('the long-form markup the floor, as written, forbids (F167, question)', () => {
  const refused = FORBIDDEN.map((text) => [text, checkBound(parse(text))]).filter(([, b]) => b !== null);
  assert.deepEqual(refused, []);
});
