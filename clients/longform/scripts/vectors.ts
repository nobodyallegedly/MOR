// Write vectors/longform.json: named texts, each with the HTML this
// implementation renders and the text the rendering shows (the source
// minus what it hides). Another implementation of the cMIP should give the
// same shown text on every case; the HTML is this renderer's, given as an
// example of one rendering that keeps the bound.

import { readFileSync, writeFileSync } from 'node:fs';
import { checkBound, parse, shownText } from '../src/format.ts';
import { renderHtml } from '../src/html.ts';
import { checkText } from '../../genesis/src/core.ts';

const sample = readFileSync(new URL('../examples/sample.md', import.meta.url), 'utf8').replace(/\n$/, '');

const cases: [string, string][] = [
  ['empty text', ''],
  ['plain paragraph', 'Thank you for the shower'],
  ['line break and paragraphs', 'one\ntwo\n\nthree'],
  ['headings, levels 1 to 6; seven is text', '# one\n## two\n###### six\n####### seven'],
  ['heading needs a space', '#hashtag'],
  ['emphasis', '*a* **b** ***c***'],
  ['runs pair only with their own length', '**bold *and italic***'],
  ['closer takes the nearest opener of its length', '*a **b* c**'],
  ['emphasis stays within a line', '*one\ntwo*'],
  ['no emphasis around spaces', '2 * 3 * 4'],
  ['four or more stars are text', '****four****'],
  ['code span', 'a `*not*` b'],
  ['code span of two backticks', '``a ` b``'],
  ['unclosed backtick', '`open'],
  ['escapes', '\\*literal\\* and a\\b'],
  ['autolinks', '<https://dubsar.org> <mailto:x@example.org>'],
  ['a link\'s closing > next to a digit is shown (F178)', '<https://dubsar.org/item/5> and <https://dubsar.org/a>5'],
  ['other schemes are text', '<javascript:alert(1)>'],
  ['bracket links are text', '[text](https://x.org)'],
  ['HTML and entities are text', '<b>html</b> &amp;'],
  ['quote with a paragraph break', '> a\n> b\n>\n> c'],
  ['nested quote', '> > deep'],
  ['rules', '---\n***'],
  ['two dashes are text', '--'],
  ['code block', '```\n# not\n*x*\n```\nafter'],
  ['code block with a label, unclosed', '```rust\nfn main() {}'],
  ['fence line with a backtick in its label is a code span', '```a```'],
  ['bullet list', '- one\n- two'],
  ['numbers shown as written', '1. a\n1. b'],
  ['item continuation and nested list', '- a\n  more\n\n  second\n  - inner\n- b'],
  ['a new marker starts a new list', '- a\n+ b'],
  ['no lazy continuation', '- a\nb'],
  ['a year at the start of a line is a list item', '1984. A year'],
  ['unless escaped', '1984\\. A year'],
  ['nesting stops at 16 levels', '> '.repeat(20) + 'x'],
  ['bidirectional override kept, block isolated', 'I agree to pay ‮001‬ euros\n\nnext'],
  ['the sample document', sample],
];

const out = {
  cmip: 'cmips/cmip-long-form-draft-1.md',
  note: 'html is this implementation\'s rendering (inside <div class="mor-lf">); shown is the text the rendering shows, which every implementation must match',
  cases: cases.map(([name, text]) => {
    checkText(text);
    const doc = parse(text);
    const breach = checkBound(doc);
    if (breach) throw new Error(`${name}: ${breach}`);
    return { name, text, html: renderHtml(doc), shown: shownText(doc) };
  }),
};
writeFileSync(new URL('../vectors/longform.json', import.meta.url), JSON.stringify(out, null, 2) + '\n');
console.log(`${out.cases.length} vectors written`);
