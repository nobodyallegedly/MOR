#!/usr/bin/env -S node --import tsx
// mor-sign: sign a draft the connector prepared, with a test identity file.
//
//   npm run -s sign -- --identity ~/mor-test/me.json ~/mor-connector/DIGEST.mor-draft
//
// It shows what signing means, in plain words, from the draft's own bytes,
// and the draft's digest to compare with what Claude showed; it signs only
// when you type SIGN.

import { createInterface } from 'node:readline/promises';
import { parseArgs } from 'node:util';
import { fromEnv } from '../src/config.ts';
import { groups, quote, sectionsText } from '../src/words.ts';
import { signDraft } from './sign.ts';

const HELP = `mor-sign: sign a draft the MOR connector prepared, with a TEST identity.

  mor-sign --identity FILE DRAFT [--relay URL ...] [--via URL=LOCAL ...] [--against DIR]

  FILE    a test identity file of the genesis client (it holds the keys)
  DRAFT   the draft file the connector wrote (DIGEST.mor-draft)
  --against DIR   compare a release with this checkout before signing it

Relays and --via default to the connector's settings (MOR_RELAYS, MOR_VIA).
The signed act is written beside the draft, as DIGEST.mor-act; then ask
Claude to submit it.`;

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      identity: { type: 'string' },
      relay: { type: 'string', multiple: true },
      via: { type: 'string', multiple: true },
      against: { type: 'string' },
      help: { type: 'boolean' },
    },
  });
  if (values.help || !values.identity || positionals.length !== 1) {
    console.log(HELP);
    process.exit(values.help ? 0 : 2);
  }
  const c = fromEnv();
  const via = { ...c.via, ...Object.fromEntries((values.via ?? []).map((v) => v.split('=') as [string, string])) };
  const signed = await signDraft({
    identity: values.identity,
    draft: positionals[0],
    hints: values.relay ?? c.relays,
    via,
    checkout: values.against ?? c.checkout,
    confirm: async (r, digest) => {
      console.log(`\n# ${r.title}\n`);
      for (const s of r.summary) console.log(s);
      console.log(`\n${sectionsText(r.sections)}\n`);
      for (const q of r.quoted) console.log(`${quote(q.heading, q.text)}\n`);
      console.log(`Draft digest: ${groups(digest)}`);
      console.log('Check that it is the digest Claude showed you.\n');
      const rl = createInterface({ input: process.stdin, output: process.stdout });
      const answer = await rl.question('Type SIGN to sign it, anything else to stop: ');
      rl.close();
      return answer.trim() === 'SIGN';
    },
  });
  console.log(`\nSigned: act ${signed.id}\nWritten to ${signed.path}\nNow ask Claude to submit it.`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
