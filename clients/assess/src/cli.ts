#!/usr/bin/env -S node --import tsx
// mor-assess: the deal-assessment tool from the command line (roadmap step
// 14). It fetches an agreement from the relays, has the core library read
// and judge it, and prints the explanation and the risks in plain words.

import { short } from '../../collective/src/explain.ts';
import { quote, sectionsText } from '../../connector/src/words.ts';
import type { Via } from '../../genesis/src/transport.ts';
import { assess, type Assessment } from './assess.ts';
import { gather } from './gather.ts';

const USAGE = `mor-assess: explain an agreement in plain words, and flag its obvious risks.

  mor-assess ID --at URL [--at URL ...] [--via URL=LOCAL] [--json]

ID is the agreement's id, its terms act. Every relay given with --at is asked
for it, its earlier versions, its parties' signatures and later versions,
and its split service's account; what they hold is judged by the core
library. --via reaches an address another way (URL=LOCAL). --json prints
the assessment as data. A flag is a risk worth reading before signing, each
with the rule or stated cost it rests on; it is not a verdict on the deal.`;

/** The assessment as text: the words signed by others fenced as data. */
function assessmentText(id: string, a: Assessment): string {
  return [
    `# ${a.title}: ${id}`,
    a.summary.join(' '),
    sectionsText(a.sections),
    ...a.plain.map((p) => quote(p.heading, p.text)),
  ].join('\n\n');
}

function parse(argv: string[]) {
  const pos: string[] = [];
  const opts: Record<string, string[]> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      (opts[k] ??= []).push(k === 'help' || k === 'json' ? 'true' : argv[++i]);
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
  const via: Via = {};
  for (const v of opts.via ?? []) {
    const [from, to] = v.split('=');
    via[from] = to;
  }
  const names = (h: string) => short(h);
  const g = await gather(id, at, via, names);
  const a = assess(g.payload, names, g.found);
  console.log(opts.json ? JSON.stringify({ id, ...a }, null, 2) : assessmentText(id, a));
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exitCode = 1;
});
