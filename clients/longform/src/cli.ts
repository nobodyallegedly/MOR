#!/usr/bin/env -S node --import tsx
// mor-longform: render a long-form text to a page, with its plain text one
// tap away, and check the Text MIP's bound on it.

import { readFileSync, writeFileSync } from 'node:fs';
import { checkBound, parse, title } from './format.ts';
import { renderPage } from './html.ts';
import { compose } from './text.ts';
import { checkText } from '../../genesis/src/core.ts';

const USAGE = `mor-longform: the MOR long-form text format (cmips/cmip-long-form-draft-1.md)

  render <file> [--out <page.html>]   the text as a page, formatted, with its plain text below
  check <file>                         is it canonical text, and does the rendering keep the bound

A file that is not canonical text is normalized first, as a composing client
does (Text MIP, rule 6), and what changed is said.`;

function load(path: string): string {
  const raw = readFileSync(path, 'utf8');
  const { text, changes } = compose(raw);
  for (const c of changes) console.error(`normalized: ${c}`);
  checkText(text); // the core library's check, with the pinned Unicode tables
  return text;
}

const [cmd, file, ...rest] = process.argv.slice(2);
if (!cmd || !file || !['render', 'check'].includes(cmd)) {
  console.error(USAGE);
  process.exit(2);
}
const text = load(file);
const doc = parse(text);
const breach = checkBound(doc);
if (breach) {
  console.error(`BOUND BROKEN: ${breach}`);
  process.exit(1);
}
if (cmd === 'check') {
  console.log(`canonical text, ${text.length} characters; the rendering hides only markup, adds nothing, keeps the order`);
} else {
  const page = renderPage(doc, title(doc) ?? file);
  const i = rest.indexOf('--out');
  if (i >= 0 && rest[i + 1]) writeFileSync(rest[i + 1], page);
  else process.stdout.write(page);
}
