// The floor under every format's declaration (F167, F174 items 10 and 11,
// F175, F178 items 16 and 17; Text MIP draft 6, the Text format task).
// Whatever a format's markup declaration says, it never hides:
//   - a letter, a digit or a combining mark (L, N, M);
//   - a currency sign (Sc);
//   - a mathematical sign (Sm) next to a digit, so < and > stay usable as
//     quote and link markup;
//   - the percent, per-mille and per-ten-thousand signs, by code point;
//   - a character between two digits;
//   - a plus or minus sign (+ - U+2212 and the dash-like U+2013, U+FE63,
//     U+FF0D) directly before a digit or a currency sign, or directly after
//     a digit;
//   - any run of hidden characters between two digits, a line break that
//     ends a block excepted, since a new block is shown;
//   - emphasis or code markup between two digits;
//   - a full stop or comma directly before a digit;
//   - a bracket directly around an amount;
//   - a space or apostrophe between two letters;
//   - a question or exclamation mark.
// And the long-form format shows a link's closing > next to a digit.
//
// The floor is tested three ways: directly, character by character; on real
// long-form documents read by a hostile format, which hides one character
// and hands the check a declaration that claims it, so that only the floor
// stands between the reader and the changed text; and on the long-form
// format's own, honest markup, in its real positions.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkBound,
  DECLARED,
  ENDS_BLOCK,
  parse,
  shownText,
  underFloor,
  type Block,
  type Document,
  type Inline,
  type Mark,
  type MarkRule,
} from '../src/format.ts';
import { renderHtml } from '../src/html.ts';

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
  ['narrow no-break space groups', '1\u202F000', 'FFFFF'],
  ['thin space groups', '1\u2009000', 'FFFFF'],
  ['apostrophe groups', "1'000", 'FFFFF'],
  ['Arabic decimal separator', '1٫5', 'FFF'],
  ['Arabic thousands separator', '1٬000', 'FFFFF'],
  ['dollar', '$5', 'FF'],
  ['euro before', '€5', 'FF'],
  ['euro after, spaced', '5 €', 'F.F'],
  ['bitcoin', '₿0.001', 'FFFFFF'],
  ['yen, alone', '¥', 'F'],
  ['pound, alone', '£', 'F'],
  ['minus before a fraction', '-½', 'FF'],
  // Negative amounts (F174 item 11, F175).
  ['a hyphen-minus before a currency sign', '-$5', 'FFF'],
  ['a minus sign before a currency sign', '−€5', 'FFF'],
  ['a trailing minus', '5-', 'FF'],
  ['a trailing plus', '5+', 'FF'],
  ['an en dash as a minus', '–5', 'FF'],
  ['a small hyphen-minus', '﹣5', 'FF'],
  ['a fullwidth hyphen-minus', '－5', 'FF'],
  ['an en dash after a digit', '5–', 'FF'],
  ['brackets for a negative amount', '(5)', 'FFF'],
  ['brackets around a currency amount', '($1,250.00)', 'FFFFFFFFFFF'],
  ['brackets around a spaced amount', '(1 000 €)', 'FFFFFF.FF'],
  ['square brackets around an amount', '[−5]', 'FFFF'],
  // Decimals with no leading digit (F174 item 11).
  ['a comma before a digit', ',5', 'FF'],
  ['a full stop before a digit', '.5', 'FF'],
  ['an Arabic decimal separator before a digit', '٫٥', 'FF'],
  ['a fullwidth full stop before a digit', '．5', 'FF'],
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
  ['per ten thousand', '5‱', 'FF'],
  ['per ten thousand, alone', '‱', 'F'],
  ['Arabic-Indic digits and Arabic percent sign', '٥٠٪', 'FFF'],
  ['small percent', '5﹪', 'FF'],
  ['fullwidth percent', '5％', 'FF'],
  ['Arabic-Indic per mille', '5؉', 'FF'],
  // Mathematical signs: next to a digit only (F174 item 10).
  ['less than, next to digits', '5<6', 'FFF'],
  ['greater than, before a digit', '>5', 'FF'],
  ['greater than, after a digit', '5>', 'FF'],
  ['equals, next to a digit', '=5', 'FF'],
  ['less than between letters is hideable', 'x<y', 'F.F'],
  ['a quote sign before a space is hideable', '> a', '..F'],
  // Words with vowel marks.
  ['Hebrew with niqqud', '\u05E9\u05C1\u05B8\u05DC\u05D5\u05B9\u05DD', 'FFFFFFF'],
  ['Arabic with harakat', 'كَتَبَ', 'FFFFFF'],
  ['Devanagari, matras and anusvara', 'हिंदी', 'FFFFF'],
  ['Devanagari virama', 'न्न', 'FFF'],
  ['Thai', 'น้ำ', 'FFF'],
  ['combining acute', 'e\u0301', 'FF'],
  ['Arabic tatweel', 'كـتب', 'FFFF'],
  ['an astral letter, either half', 'x\u{1D400}y', 'FFFF'],
  // Spaces and apostrophes between two letters (F174 item 11).
  ['a space between words', 'do not', 'FFFFFF'],
  ['a no-break space between words', 'do\u00A0not', 'FFFFFF'],
  ['an apostrophe between letters', "can't", 'FFFFF'],
  ['a typographic apostrophe between letters', 'can’t', 'FFFFF'],
  ['an elided article', "l'eau", 'FFFFF'],
  ['a space after a vowel sign, between two words', 'हिंदी है', 'FFFFFFFF'],
  ['a space after a decomposed é', 'café au', 'FFFFFFFF'],
  ['a space after a full stop is hideable', 'a. b', 'F..F'],
  ['an apostrophe opening a quotation is hideable', "'a'", '.F.'],
  // Question and exclamation marks (F174 item 11).
  ['a question mark', 'agree?', 'FFFFFF'],
  ['an exclamation mark', 'no!', 'FFF'],
  ['inverted marks', '¡¿', 'FF'],
  ['an Arabic question mark', 'نعم؟', 'FFFF'],
  ['a fullwidth question mark', '？', 'F'],
  ['an interrobang', '‽', 'F'],
];

test('the floor, character by character (F167, F174, F175, F178)', () => {
  for (const [why, s, want] of PROTECTED) assert.equal(floorOf(s), want, `${why}: ${JSON.stringify(s)}`);
});

// What the floor, as the Text MIP writes it, does not cover: each of these
// can still be hidden by a hostile declaration. Recorded as they are, for
// Nobody, allegedly, to decide; a change to the floor changes this list on
// purpose.
const NOT_COVERED: [string, string, string][] = [
  ['a minus sign, a space, a digit', '- 5', '..F'],
  ['a times sign between spaced digits', '5 × 3', 'F...F'],
  ['a less-than sign between spaced digits', '5 < 6', 'F...F'],
  ['the Arabic-Indic per-ten-thousand sign (not in the list)', '5؊', 'F.'],
  ['a figure dash used as a minus', '‒5', '.F'],
  ['a hyphen used as a minus', '‐5', '.F'],
  ['a non-breaking hyphen used as a minus', '‑5', '.F'],
  ['a heavy minus sign (So)', '➖5', '.F'],
  ['brackets around an amount with a currency code', '(5 EUR)', '.F.FFF.'],
  ['a zero width non-joiner in Persian', 'می‌خ', 'FF.F'],
  ['a zero width joiner in Devanagari', 'क्‍ष', 'FF.F'],
  ['a right-to-left mark', '‏5', '.F'],
];

test('what the floor, as the Text MIP writes it, does not cover (reported)', () => {
  for (const [why, s, want] of NOT_COVERED) assert.equal(floorOf(s), want, `${why}: ${JSON.stringify(s)}`);
});

// ------------------------------------------------- a hostile format reading

/** A declaration that lets every entry hide every character: only the floor is left. */
const anything = new Proxy({}, { get: () => ({ includes: () => true }) }) as unknown as Record<MarkRule, string>;

/** Remove the offsets `hide` from every text span of a tree. */
function without(nodes: Inline[], hide: Set<number>): Inline[] {
  const out: Inline[] = [];
  for (const n of nodes) {
    if (n.t === 'text') {
      let from = n.span.from;
      for (let i = n.span.from; i <= n.span.to; i++) {
        if (i === n.span.to || hide.has(i)) {
          if (i > from) out.push({ t: 'text', span: { from, to: i } });
          from = i + 1;
        }
      }
    } else if (n.t === 'em' || n.t === 'strong') out.push({ t: n.t, children: without(n.children, hide) });
    else out.push(n);
  }
  return out;
}

function withoutBlocks(bs: Block[], hide: Set<number>): Block[] {
  return bs.map((b): Block => {
    switch (b.t) {
      case 'heading':
      case 'paragraph':
        return { ...b, children: without(b.children, hide) };
      case 'quote':
        return { t: 'quote', children: withoutBlocks(b.children, hide) };
      case 'list':
        return { ...b, items: b.items.map((it) => ({ marker: it.marker, children: withoutBlocks(it.children, hide) })) };
      default:
        return b;
    }
  });
}

/**
 * A real document as a hostile format reads it: the honest long-form reading,
 * but for the characters at `hide`, which it hides and claims as its markup
 * (as "escapes", say). Its declaration claims every character: every check
 * of the declaration passes or fails on position alone, and the floor runs
 * first.
 */
function hostile(source: string, hide: number[]): Document {
  const honest = parse(source);
  const set = new Set(hide);
  const marks: Mark[] = [...honest.marks, ...hide.map((i): Mark => ({ rule: 'escape', span: { from: i, to: i + 1 } }))];
  return { source, blocks: withoutBlocks(honest.blocks, set), marks: marks.sort((a, b) => a.span.from - b.span.from) };
}

/** Offsets of `what` in `s`, its `k`th occurrence, each unit. */
const find = (s: string, what: string, k = 0): number[] => {
  let at = -1;
  for (let j = 0; j <= k; j++) at = s.indexOf(what, at + 1);
  assert.ok(at >= 0, `${what} in ${s}`);
  return Array.from({ length: what.length }, (_, i) => at + i);
};

/**
 * Real long-form documents, each with what a hostile format hides, what
 * the reader would then see, and the clause of the floor that refuses it.
 */
const ATTACKS: [string, string, string, string, string][] = [
  // [why, document, hidden, the clause that refuses it, a text the reader would see]
  ['an invoice total, its currency', '# Invoice\n\nTotal due: $1,250.00', '$', 'a currency sign', 'Total due: 1,250.00'],
  ['an invoice total, its group comma', '# Invoice\n\nTotal due: $1,250.00', ',', 'a character between two digits', 'Total due: $1250.00'],
  ['an invoice total, its decimal point', '# Invoice\n\nTotal due: $1,250.00', '.', 'a character between two digits', 'Total due: $1,25000'],
  ['a negative balance, hyphen-minus', '- Balance: -5\n- Fee: 2', '-5', 'a plus or minus sign directly before a digit or a currency sign, or directly after a digit', 'Balance: 5'],
  ['a negative balance, minus sign', '> Balance: −5', '−', 'a mathematical sign next to a digit', 'Balance: 5'],
  ['a negative amount before its currency', 'Refund: -$5', '-', 'a plus or minus sign directly before a digit or a currency sign, or directly after a digit', 'Refund: $5'],
  ['a trailing minus, as in accounts', '| Fee | 5- |', '-', 'a plus or minus sign directly before a digit or a currency sign, or directly after a digit', '| Fee | 5 |'],
  ['a negative amount in brackets, opening', 'Net result: (5)', '(', 'a bracket directly around an amount', 'Net result: 5)'],
  ['a negative amount in brackets, closing', 'Net result: (5)', ')', 'a bracket directly around an amount', 'Net result: (5'],
  ['an en dash as a minus', '## Change: –5', '–', 'a plus or minus sign directly before a digit or a currency sign, or directly after a digit', 'Change: 5'],
  ['a small hyphen-minus', 'Change: ﹣5', '﹣', 'a plus or minus sign directly before a digit or a currency sign, or directly after a digit', 'Change: 5'],
  ['a fullwidth hyphen-minus', 'Change: －5', '－', 'a plus or minus sign directly before a digit or a currency sign, or directly after a digit', 'Change: 5'],
  ['a decimal with no leading digit, comma', 'Satz: ,5 pro Stunde', ',', 'a full stop or comma directly before a digit', 'Satz: 5 pro Stunde'],
  ['a decimal with no leading digit, point', 'Rate: .5 per hour', '.', 'a full stop or comma directly before a digit', 'Rate: 5 per hour'],
  ['a date', 'Signed on 2026-10-07.', '-', 'a character between two digits', 'Signed on 202610-07.'],
  ['a percentage', '**Interest:** 50%', '%', 'a percent, per-mille or per-ten-thousand sign', 'Interest: 50'],
  ['a per-mille rate', 'Fee: 5‰', '‰', 'a percent, per-mille or per-ten-thousand sign', 'Fee: 5'],
  ['a per-ten-thousand rate', 'Fee: 5‱', '‱', 'a percent, per-mille or per-ten-thousand sign', 'Fee: 5'],
  ['a vowel sign: work becomes less', '# काम', 'ा', 'a letter, a digit or a combining mark', 'कम'],
  ['a harakah', 'كَتَبَ', 'َ', 'a letter, a digit or a combining mark', 'كتَبَ'],
  ['two items read as one number', 'Pay items 1, 2 and 3.', ', ', 'a run of hidden characters between two digits', 'Pay items 12 and 3.'],
  ['a decimal comma and a space', 'Total 1, 5', ', ', 'a run of hidden characters between two digits', 'Total 15'],
  ['a question becomes a statement', 'You agree to pay?', '?', 'a question or exclamation mark', 'You agree to pay'],
  ['an exclamation', '> Do not sign!', '!', 'a question or exclamation mark', 'Do not sign'],
  ['an apostrophe between two letters', "I can't agree.", "'", 'a space or apostrophe between two letters', 'I cant agree.'],
  ['a space between two words', '1. We do not agree', ' ', 'a space or apostrophe between two letters', 'We donot agree'],
  ['a comparison next to a digit', 'Only if x<5', '<', 'a mathematical sign next to a digit', 'Only if x5'],
];

test('a hostile format cannot hide the floor in a real document (F167, F174, F175)', () => {
  for (const [why, source, what, clause, reads] of ATTACKS) {
    const at = what === ' ' ? find(source, ' ', 2) : find(source, what);
    // The honest reading shows it.
    const honest = parse(source);
    assert.equal(checkBound(honest), null, `${why}: the honest reading`);
    const doc = hostile(source, what === '-5' ? [at[0]] : at);
    assert.ok(shownText(doc).includes(reads), `${why}: reads ${JSON.stringify(shownText(doc))}`);
    // Under any declaration, the floor refuses it, for this clause.
    const breach = checkBound(doc, anything);
    assert.ok(breach?.includes('F167') && breach.endsWith(clause), `${why}: ${breach}`);
    // And the reader is shown the plain text, flagged.
    assert.match(renderHtml(doc), /mor-lf-refused/);
  }
});

test('a line break that ends a block may stand between two digits; one inside a block may not (F175)', () => {
  // Honest: a new block is shown.
  for (const text of ['1. Pay 5\n2. Ship', 'Total 1\n2. item', 'Pay 5\n\n2 days later', '- 5\n\n  6', '```\n-5\n```\n6', '# Chapter 1\n2026 began']) {
    assert.equal(checkBound(parse(text)), null, text);
  }
  // A reading that joins the two digits into one block, hiding the LF.
  const source = 'Total 1\n2';
  const joined: Document = { source, blocks: [{ t: 'paragraph', children: [{ t: 'text', span: { from: 0, to: 7 } }, { t: 'text', span: { from: 8, to: 9 } }] }], marks: [] };
  assert.equal(shownText(joined), 'Total 12');
  const breach = checkBound(joined, anything);
  assert.ok(breach?.endsWith('a character between two digits'), String(breach));
  // The block exception is the declaration's own: a declaration that says
  // nothing ends a block gets none.
  assert.ok(checkBound(parse('1. Pay 5\n2. Ship'), DECLARED, '')?.includes('F167'));
  assert.equal(checkBound(parse('1. Pay 5\n2. Ship'), DECLARED, ENDS_BLOCK), null);
  // And no other character is let through for "ending a block".
  const comma: Document = {
    source: '1,2',
    blocks: [{ t: 'paragraph', children: [{ t: 'text', span: { from: 0, to: 1 } }] }, { t: 'paragraph', children: [{ t: 'text', span: { from: 2, to: 3 } }] }],
    marks: [],
  };
  assert.ok(checkBound(comma, DECLARED, '\n,')?.endsWith('a character between two digits'));
});

test('emphasis or code markup between two digits is refused, and shown plain (F175)', () => {
  for (const text of ['1*2*3', 'Pay 1**000**0', '1`2`3', 'Code 5``6``']) {
    const doc = parse(text);
    const breach = checkBound(doc);
    assert.ok(breach?.endsWith('emphasis or code markup between two digits'), `${text}: ${breach}`);
    const h = renderHtml(doc);
    assert.match(h, /mor-lf-refused/);
    assert.ok(h.includes(text), text);
  }
  // Emphasis next to a digit, not between two, is markup as before.
  for (const text of ['*5*', 'Pay **1,000** now', '`-5`', 'Total: *5* and *6*']) assert.equal(checkBound(parse(text)), null, text);
});

test("the long-form format shows a link's closing > next to a digit (F178 item 17)", () => {
  const cases: [string, string][] = [
    ['<https://dubsar.org/item/5>', 'https://dubsar.org/item/5>'],
    ['see <https://dubsar.org/a>5 times', 'see https://dubsar.org/a>5 times'],
    ['<https://dubsar.org/٣>', 'https://dubsar.org/٣>'],
    ['<https://dubsar.org/a>', 'https://dubsar.org/a'],
    ['<mailto:x@y> 5', 'mailto:x@y 5'],
  ];
  for (const [text, shows] of cases) {
    const doc = parse(text);
    assert.equal(checkBound(doc), null, text);
    assert.equal(shownText(doc), shows, text);
    assert.doesNotMatch(renderHtml(doc), /mor-lf-refused/);
  }
  // The address stays the link's target, without the >.
  const link = parse('<https://dubsar.org/item/5>').blocks[0];
  assert.ok(link.t === 'paragraph' && link.children[0].t === 'link' && link.children[0].href === 'https://dubsar.org/item/5');
  assert.match(renderHtml(parse('<https://dubsar.org/item/5>')), /<a href="https:\/\/dubsar.org\/item\/5"[^>]*>https:\/\/dubsar.org\/item\/5<\/a>&gt;/);
  // A reading that hid it would be refused.
  const source = '<https://dubsar.org/item/5>';
  const hid: Document = {
    source,
    blocks: [{ t: 'paragraph', children: [{ t: 'link', href: 'https://dubsar.org/item/5', span: { from: 1, to: source.length - 1 } }] }],
    marks: [
      { rule: 'link-open', span: { from: 0, to: 1 } },
      { rule: 'link-close', span: { from: source.length - 1, to: source.length } },
    ],
  };
  assert.ok(checkBound(hid)?.endsWith('a mathematical sign next to a digit'));
});

// ------------------------------------------------------- the old hostile tests

/** A declaration that claims, besides its own markup, the characters given for one entry. */
const claims = (rule: MarkRule, extra: string): Record<MarkRule, string> => ({ ...DECLARED, [rule]: DECLARED[rule] + extra });

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
  ['a minus sign', asItem('-−2.50'), claims('item', '−'), '-2.50'],
  ['a hyphen-minus before a digit', asItem('--2.50'), claims('item', '-'), '-2.50'],
  ['a decimal point between two digits', asItem('1.50'), claims('item', '.'), '150'],
  ['a thousands comma between two digits', asItem('1,000'), claims('item', ','), '1000'],
  ['a vowel sign: work becomes less', asItem('काम'), claims('item', 'ा'), 'कम'],
  ['a currency sign', asItem('-$5'), claims('item', '$'), '-5'],
  ['a percent sign', asFence('%'), claims('fence-close', '%'), 'x'],
  ['a digit', asFence('5'), claims('fence-close', '5'), 'x'],
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
  // Wrongly forbidden by the first floor, now decided (F174 item 10, F175).
  '> quoted',
  '> 5',
  '> > 5 < 6',
  '<https://a.b/c>',
  'see <mailto:x@y>',
  '1. Pay 5\n2. Ship',
  'Total 1\n2. item',
  // Markup beside the new clauses: a question, an apostrophe, brackets.
  '*Do you agree?*',
  "**can't**",
  '# Net (5)',
  '- (5)',
  '`(5)`',
  '> Rate: .5%',
];

test('the floor leaves the long-form markup hideable where the format puts it (F167, F174, F175)', () => {
  for (const text of HONEST) {
    const doc = parse(text);
    assert.equal(checkBound(doc), null, text);
  }
});

/**
 * The long-form markup the floor still forbids, as the Text MIP decides it
 * or where the format's text has not followed it (questions for Nobody,
 * allegedly): emphasis or code markup between two digits (decided, F175); a
 * quote's > directly before a digit, and a link's < directly after one
 * (Sm next to a digit; the format has decided only the link's closing >,
 * F178 item 17). Each such text is shown plain, flagged.
 */
const FORBIDDEN: [string, string][] = [
  ['1*2*3', 'emphasis or code markup between two digits'],
  ['1`2`3', 'emphasis or code markup between two digits'],
  ['>5 apples', 'a mathematical sign next to a digit'],
  ['>50% agreed', 'a mathematical sign next to a digit'],
  ['item 5<https://a.b/c>', 'a mathematical sign next to a digit'],
];

test('the long-form markup the floor forbids is refused and shown plain (F175; questions)', () => {
  for (const [text, clause] of FORBIDDEN) {
    const doc = parse(text);
    const breach = checkBound(doc);
    assert.ok(breach?.endsWith(clause), `${text}: ${breach}`);
    assert.match(renderHtml(doc), /mor-lf-refused/);
  }
});
