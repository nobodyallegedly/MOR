#!/usr/bin/env -S node --import tsx
// mor-assess: the deal-assessment tool from the command line (roadmap step
// 14). It fetches an agreement from the relays, has the core library read
// and judge it, and prints the explanation and the risks in plain words.

import { short } from '../../collective/src/explain.ts';
import type { Via } from '../../genesis/src/transport.ts';
import { answerText, ask, findKey, material, readingText, redact, settings } from './ask.ts';
import { assess, assessPublication, type Assessment } from './assess.ts';
import { gather, gatherPublication, isPublication } from './gather.ts';

const USAGE = `mor-assess: explain an agreement or a publication in plain words, and flag its obvious risks.

  mor-assess ID --at URL [--at URL ...] [--via URL=LOCAL] [--json]
  mor-assess ID --at URL [--at URL ...] --ask "QUESTION" [--json]

ID is an ownership agreement's id (its terms act: a work's, or a
collective's constitution) or a publication's. Every relay given with --at
is asked for it, its earlier versions, its parties' signatures and later
versions, and, for a publication, the ownership agreement it names and its
price tags; what they hold is judged by the core library. --via reaches an address another way (URL=LOCAL). --json prints
the assessment as data. A flag is a risk worth reading before signing, each
with the rule or stated cost it rests on; it is not a verdict on the deal.

--ask asks Claude a question about the deal, answered from this reading and
the exact text of the rules its flags cite, nothing beyond them; each answer
names the rules it rests on, and says "not claimed" where they do not settle
it. It explains; it never advises signing or not. It needs an Anthropic API
key, in ANTHROPIC_API_KEY or in ~/.config/mor/anthropic-key; the model is
MOR_ASK_MODEL (README, "Ask about this deal").`;

function parse(argv: string[]) {
  const pos: string[] = [];
  const opts: Record<string, string[]> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const v = k === 'help' || k === 'json' ? 'true' : argv[++i];
      if (v === undefined) throw new Error(`--${k} needs a value`);
      (opts[k] ??= []).push(v);
    } else pos.push(a);
  }
  return { pos, opts };
}

async function main() {
  const { pos, opts } = parse(process.argv.slice(2));
  const id = pos[0];
  const at = opts.at ?? [];
  if (opts.help || !id || !at.length) {
    console.log(USAGE);
    if (!opts.help) process.exitCode = 2;
    return;
  }
  if (!/^[0-9a-f]{64}$/.test(id)) throw new Error(`${id} is not an act id (64 hexadecimal characters)`);
  // The key and the settings first: with no key, say so before fetching anything.
  const question = opts.ask?.join('\n');
  const asking = question === undefined ? null : { key: findKey(), settings: settings() };
  if (asking) key = asking.key.key;
  if (asking?.key.warning) console.error(asking.key.warning);
  const via: Via = {};
  for (const v of opts.via ?? []) {
    const [from, to] = v.split('=');
    via[from] = to;
  }
  const names = (h: string) => short(h);
  let a: Assessment;
  if (await isPublication(id, at, via)) {
    const g = await gatherPublication(id, at, via);
    a = assessPublication(g.payload, names, g.context);
  } else {
    const g = await gather(id, at, via, names);
    a = assess(g.payload, names, g.found);
  }
  if (!asking) {
    console.log(opts.json ? JSON.stringify({ id, ...a }, null, 2) : readingText(id, a));
    return;
  }
  const m = material(id, question!, a);
  const answer = await ask(m, asking.key.key, asking.settings);
  console.log(opts.json ? JSON.stringify({ id, question: m.question, ...answer }, null, 2) : answerText(m, answer));
}

/** The key, once read: scrubbed from anything printed on failure. */
let key = '';

main().catch((e) => {
  console.error(redact(e instanceof Error ? e.message : String(e), key));
  process.exitCode = 1;
});
