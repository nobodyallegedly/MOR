// The format, construct by construct, and the Text MIP's bound (task 4,
// with F102) on every rendering: on the cases below, on the vectors, and on
// thousands of generated canonical texts.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checkBound, parse, shownText, title, type Document, type Inline, type Mark } from '../src/format.ts';
import { renderHtml } from '../src/html.ts';
import { compose } from '../src/text.ts';
import { checkText } from '../../genesis/src/core.ts';

const html = (s: string) => {
  const doc = parse(s);
  assert.equal(checkBound(doc), null, `bound broken for ${JSON.stringify(s)}`);
  return renderHtml(doc).replace(/^<div class="mor-lf">|<\/div>$/g, '');
};

/** The text an HTML rendering shows: tags removed, entities decoded, breaks as LF. */
function htmlText(h: string): string {
  return h
    .replace(/<br>/g, '\n')
    .replace(/<\/code><\/pre>/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

test('headings, paragraphs, line breaks', () => {
  assert.equal(html('# Thank you'), '<h1 dir="auto">Thank you</h1>');
  assert.equal(html('###### six'), '<h6 dir="auto">six</h6>');
  assert.equal(html('####### seven'), '<p dir="auto">####### seven</p>');
  assert.equal(html('#hashtag'), '<p dir="auto">#hashtag</p>');
  assert.equal(html('one\ntwo\n\nthree'), '<p dir="auto">one<br>two</p><p dir="auto">three</p>');
  assert.equal(html('text\n# heading'), '<p dir="auto">text</p><h1 dir="auto">heading</h1>');
  assert.equal(html('  indented'), '<p dir="auto">  indented</p>');
});

test('emphasis', () => {
  assert.equal(html('*a* **b** ***c***'), '<p dir="auto"><em>a</em> <strong>b</strong> <strong><em>c</em></strong></p>');
  // Runs pair only with runs of their own length: this stays text.
  assert.equal(html('**bold *and italic***'), '<p dir="auto">**bold *and italic***</p>');
  assert.equal(html('**bold *and italic***'.replace('***', '* **')), '<p dir="auto">**bold <em>and italic</em> **</p>');
  assert.equal(html('2 * 3 * 4'), '<p dir="auto">2 * 3 * 4</p>');
  assert.equal(html('*open'), '<p dir="auto">*open</p>');
  assert.equal(html('****four****'), '<p dir="auto">****four****</p>');
  assert.equal(html('*a **b* c**'), '<p dir="auto"><em>a **b</em> c**</p>');
  assert.equal(html('*one\ntwo*'), '<p dir="auto">*one<br>two*</p>');
  assert.equal(html('snake_case_name'), '<p dir="auto">snake_case_name</p>');
});

test('code, escapes, links', () => {
  assert.equal(html('a `*not*` b'), '<p dir="auto">a <code>*not*</code> b</p>');
  assert.equal(html('``a ` b``'), '<p dir="auto"><code>a ` b</code></p>');
  assert.equal(html('`open'), '<p dir="auto">`open</p>');
  assert.equal(html('\\*literal\\*'), '<p dir="auto">*literal*</p>');
  assert.equal(html('a\\b'), '<p dir="auto">a\\b</p>');
  assert.equal(
    html('see <https://dubsar.org/a?b=1&c>'),
    '<p dir="auto">see <a href="https://dubsar.org/a?b=1&amp;c" rel="nofollow noopener noreferrer">https://dubsar.org/a?b=1&amp;c</a></p>',
  );
  assert.equal(html('<mailto:x@example.org>'), '<p dir="auto"><a href="mailto:x@example.org" rel="nofollow noopener noreferrer">mailto:x@example.org</a></p>');
  assert.equal(html('<javascript:alert(1)>'), '<p dir="auto">&lt;javascript:alert(1)&gt;</p>');
  assert.equal(html('[text](https://x.org)'), '<p dir="auto">[text](https://x.org)</p>');
  assert.equal(html('<b>html</b> &amp;'), '<p dir="auto">&lt;b&gt;html&lt;/b&gt; &amp;amp;</p>');
});

test('quotes, rules, code blocks', () => {
  assert.equal(html('> a\n> b\n>\n> c'), '<blockquote><p dir="auto">a<br>b</p><p dir="auto">c</p></blockquote>');
  assert.equal(html('> > deep'), '<blockquote><blockquote><p dir="auto">deep</p></blockquote></blockquote>');
  assert.equal(html('---\n***'), '<hr><hr>');
  assert.equal(html('--'), '<p dir="auto">--</p>');
  assert.equal(html('```\n# not\n*x*\n```\nafter'), '<pre dir="auto"><code># not\n*x*</code></pre><p dir="auto">after</p>');
  assert.equal(html('```rust\nfn main() {}'), '<pre dir="auto"><span class="mor-lf-label">rust</span><code>fn main() {}</code></pre>');
  assert.equal(html('```a```'), '<p dir="auto"><code>a</code></p>');
});

test('lists: markers shown as written, never renumbered', () => {
  assert.equal(
    html('- one\n- two'),
    '<ul><li><span class="mor-lf-marker">-</span><div><p dir="auto">one</p></div></li><li><span class="mor-lf-marker">-</span><div><p dir="auto">two</p></div></li></ul>',
  );
  assert.equal(
    html('1. a\n1. b'),
    '<ol><li><span class="mor-lf-marker">1.</span><div><p dir="auto">a</p></div></li><li><span class="mor-lf-marker">1.</span><div><p dir="auto">b</p></div></li></ol>',
  );
  // Continuation, a blank line inside an item, a nested list.
  assert.equal(
    html('- a\n  more\n\n  second\n  - inner\n- b'),
    '<ul><li><span class="mor-lf-marker">-</span><div><p dir="auto">a<br>more</p><p dir="auto">second</p><ul><li><span class="mor-lf-marker">-</span><div><p dir="auto">inner</p></div></li></ul></div></li><li><span class="mor-lf-marker">-</span><div><p dir="auto">b</p></div></li></ul>',
  );
  // A different marker starts a new list; a list goes on past a blank line.
  assert.match(html('- a\n+ b'), /^<ul>.*<\/ul><ul>.*<\/ul>$/);
  assert.match(html('- a\n\n- b'), /^<ul><li>.*<\/li><li>.*<\/li><\/ul>$/);
  // An unindented line after an item ends the list: no lazy continuation.
  assert.match(html('- a\nb'), /^<ul>.*<\/ul><p dir="auto">b<\/p>$/);
  assert.equal(html('1984. A year'), '<ol><li><span class="mor-lf-marker">1984.</span><div><p dir="auto">A year</p></div></li></ol>');
  assert.equal(html('1984\\. A year'), '<p dir="auto">1984. A year</p>');
});

test('nesting is bounded; deeper markers are text', () => {
  const deep = '> '.repeat(20) + 'x';
  const doc = parse(deep);
  assert.equal(checkBound(doc), null);
  let d = 0;
  let b = doc.blocks[0];
  while (b.t === 'quote') {
    d++;
    b = b.children[0];
  }
  assert.equal(d, 16);
  assert.equal(shownText(doc), '> > > > x');
});

test('the title is the first heading', () => {
  assert.equal(title(parse('intro\n\n## Thank you for the *shower*\n\n# later')), 'Thank you for the shower');
  assert.equal(title(parse('no heading')), null);
});

// F149 (review finding 5): a format may hide only its own declared markup,
// in the positions it declares it; everything else is shown. Replaces
// F140's bound by Unicode category (L and N), which let a format hide a
// minus sign, a decimal point or a vowel sign.

/** The review's stories, each inside every construct that hides markup around it. */
const STORIES = ['Balance: \u2212250', 'price 10.00', '\u0915\u093E\u092E', 'Balance: -250'];

test('a minus sign, a decimal point, a vowel sign are shown, never hidden (F149)', () => {
  for (const story of STORIES) {
    for (const wrap of [(x: string) => x, (x: string) => `# ${x}`, (x: string) => `- ${x}`, (x: string) => `> ${x}`, (x: string) => `*${x}*`, (x: string) => `1. ${x}\n   ${x}`, (x: string) => `\`${x}\``, (x: string) => `\`\`\`\n${x}\n\`\`\``]) {
      const text = wrap(story);
      const doc = parse(text);
      assert.equal(checkBound(doc), null, text);
      assert.ok(shownText(doc).includes(story), `${JSON.stringify(text)} shows ${JSON.stringify(shownText(doc))}`);
    }
  }
  assert.equal(shownText(parse('\u0915\u093E\u092E')), '\u0915\u093E\u092E', 'work stays work, never less');
});

/** A reading of `source` that shows every character but those at `hide`, claiming them as `marks`. */
function tampered(source: string, hide: number[], marks: Mark[] = []): Document {
  const spans: Inline[] = [];
  let from = 0;
  for (const h of [...hide, source.length]) {
    if (h > from) spans.push({ t: 'text', span: { from, to: h } });
    from = h + 1;
  }
  return { source, blocks: [{ t: 'paragraph', children: spans }], marks };
}

test('a rendering hiding anything but declared markup, in its declared place, is refused (F149)', () => {
  const at = (s: string, c: string) => s.indexOf(c);
  const cases: [string, Document][] = [
    // The review's stories, hidden outright.
    ['a minus sign', tampered('Balance: \u2212250', [at('Balance: \u2212250', '\u2212')])],
    ['a decimal point', tampered('price 10.00', [at('price 10.00', '.')])],
    ['a vowel sign', tampered('\u0915\u093E\u092E', [1])],
    // Claimed as markup the declaration does not give that character.
    ['a decimal point claimed as an escape', tampered('price 10.00', [8], [{ rule: 'escape', span: { from: 8, to: 9 } }])],
    // Markup characters, but not where the declaration puts them: the bound
    // by character alone (before F149) let every one of these through.
    ['a hyphen-minus before a number', tampered('Balance: -250', [9])],
    ['a hyphen-minus claimed as a rule line', tampered('Balance: -250', [9], [{ rule: 'rule', span: { from: 9, to: 10 } }])],
    ['a hyphen-minus claimed as a list marker space', tampered('Balance: -250', [9], [{ rule: 'item', span: { from: 9, to: 10 } }])],
    ['a star between spaces', tampered('2 * 3', [2], [{ rule: 'em-open', span: { from: 2, to: 3 } }])],
    ['a space between words', tampered('I do not agree', [4])],
    ['a hash inside a line', tampered('item #1', [5], [{ rule: 'heading', span: { from: 5, to: 6 } }])],
    ['an LF inside a paragraph, joining 1 and 000', tampered('price 1\n000', [7])],
  ];
  for (const [why, doc] of cases) {
    assert.notEqual(checkBound(doc), null, why);
  }
  // The same hyphen, where the declaration puts it (a rule line), is markup.
  assert.equal(checkBound(parse('---')), null);
  assert.equal(shownText(parse('---')), '');
});

test('the renderer refuses a reading that breaks the bound: shown plain, flagged (F149)', () => {
  const doc = tampered('Balance: -250', [9]);
  const h = renderHtml(doc);
  assert.match(h, /Balance: -250/);
  assert.match(h, /mor-lf-refused/);
  assert.doesNotMatch(renderHtml(parse('Balance: -250')), /mor-lf-refused/);
});

// ------------------------------------------------------------ generated texts

/** A small deterministic generator (xorshift), so a failure can be replayed. */
function rng(seed: number) {
  let x = seed || 1;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 2 ** 32;
  };
}

const PIECES = [
  '*', '**', '***', '`', '```', '\\', '#', '# ', '## ', '>', '> ', '-', '- ', '---', '+ ', '1. ', '12. ',
  '<', '>', '<https://a.b/c>', '<mailto:x@y>', '<javascript:x>', ' ', '  ', '\n', '\n\n', 'a', 'word', 'Z\u00FCrich',
  '1', '\u0663', '\u00DF', '\u05E2\u05D1\u05E8\u05D9\u05EA', '\u202E', '\u2067', '\u200B', '\u{1F600}', '\u{1F469}\u200D\u{1F469}\u200D\u{1F467}', 'e\u0301', '_', '[', ']', '(', ')', '&amp;', '.',
];

/**
 * Where the floor forbids hiding a markup character, the format shows it as
 * text rather than refusing the document (F182 items 9 and 11), so no
 * generated text is refused. *Removal check: with the format hiding such
 * markup as before, 804 of them were refused (650 for a link's < after a
 * digit, 127 for a quote's > before one, 27 for emphasis or code between
 * two digits), and this test fails.*
 */
test('the bound holds on 20,000 generated canonical texts; none is refused (F182)', () => {
  const r = rng(0x5eed);
  for (let n = 0; n < 20000; n++) {
    let s = '';
    const len = Math.floor(r() * 40);
    for (let i = 0; i < len; i++) s += PIECES[Math.floor(r() * PIECES.length)];
    const text = compose(s).text;
    checkText(text); // canonical, by the core library's own check
    const doc = parse(text);
    assert.equal(checkBound(doc), null, JSON.stringify(text));
    // The HTML shows exactly what the tree says it shows.
    assert.equal(htmlText(renderHtml(doc)), shownText(doc), `HTML differs for ${JSON.stringify(text)}`);
  }
});

test('the vectors', () => {
  const vectors = JSON.parse(readFileSync(new URL('../vectors/longform.json', import.meta.url), 'utf8')) as {
    cases: { name: string; text: string; html: string; shown: string }[];
  };
  for (const v of vectors.cases) {
    const doc = parse(v.text);
    assert.equal(checkBound(doc), null, v.name);
    assert.equal(renderHtml(doc), v.html, v.name);
    assert.equal(shownText(doc), v.shown, v.name);
  }
});
