// The exact text of the rules a flag cites, quoted from the current MIR
// drafts in spec/: for "ask about this deal" (`ask.ts`), so that Claude reads
// the rules themselves, not the tool's summary of them. Node only: it reads
// files, and never reaches a page served to a browser.

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Cite, Flag } from './assess.ts';

/** The repository's spec/ directory. */
export const SPEC = fileURLToPath(new URL('../../../spec/', import.meta.url));

/** One rule, as its current draft states it. */
export interface QuotedRule {
  /** How the rule is named in an answer: "Agreements rule 47". */
  label: string;
  mir: Cite['mir'];
  rule: number;
  /** The draft it is quoted from, e.g. `MIR-agreements-draft-11.md`. */
  source: string;
  /** The rule's text, from its heading to the next heading, exactly as written. */
  text: string;
}

export const label = (c: Cite): string => `${c.mir} rule ${c.rule}`;

/** The newest draft of a MIR in `spec`: `MIR-<name>-draft-<n>.md` with the largest n. */
export function currentDraft(mir: Cite['mir'], spec = SPEC): string {
  const re = new RegExp(`^MIR-${mir.toLowerCase()}-draft-(\\d+)\\.md$`);
  const drafts = readdirSync(spec)
    .map((f) => ({ f, n: Number(re.exec(f)?.[1] ?? NaN) }))
    .filter((d) => !Number.isNaN(d.n))
    .sort((a, b) => b.n - a.n);
  if (!drafts.length) throw new Error(`No draft of the ${mir} MIR in ${spec}`);
  return drafts[0].f;
}

/**
 * The text of a rule: its heading line (`#### Rule 47 (was 45b). …`) and
 * every line after it up to the next heading, trailing blank lines dropped.
 */
export function ruleText(markdown: string, rule: number): string | null {
  const lines = markdown.split('\n');
  const start = lines.findIndex((l) => new RegExp(`^#{2,4} Rule ${rule}[ .(]`).test(l));
  if (start < 0) return null;
  let end = start + 1;
  while (end < lines.length && !/^#{1,4} /.test(lines[end])) end++;
  return lines.slice(start, end).join('\n').trimEnd();
}

/** Every rule the flags cite, once each, Agreements first, each quoted in full from its current draft. Throws if a cited rule is not found: a reading never rests on a rule it cannot quote. */
export function quoteRules(flags: Flag[], spec = SPEC): QuotedRule[] {
  const seen = new Map<string, Cite>();
  for (const f of flags) for (const c of f.cites) seen.set(label(c), c);
  const cites = [...seen.values()].sort((a, b) => (a.mir === b.mir ? a.rule - b.rule : a.mir === 'Agreements' ? -1 : 1));
  const texts = new Map<string, { source: string; markdown: string }>();
  return cites.map((c) => {
    let doc = texts.get(c.mir);
    if (!doc) {
      const source = currentDraft(c.mir, spec);
      doc = { source, markdown: readFileSync(join(spec, source), 'utf8') };
      texts.set(c.mir, doc);
    }
    const text = ruleText(doc.markdown, c.rule);
    if (text === null) throw new Error(`${label(c)} is not in ${doc.source}: the flag citing it needs updating`);
    return { label: label(c), mir: c.mir, rule: c.rule, source: doc.source, text };
  });
}
