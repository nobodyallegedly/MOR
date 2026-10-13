#!/usr/bin/env -S node --import tsx
// mor-clock: the timestamp clock service from the command line
// (modules/module-clock-timestamp-draft-1.md). Its identity is an ordinary
// test identity, made with the genesis client; its time is this computer's.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { TEST_LABEL, TestIdentity } from '../../../clients/genesis/src/identity.ts';
import { ClockService, emptyState, type ClockState } from './service.ts';

const HELP = `mor-clock: a timestamp clock. An ordinary identity that signs "I held these
acts at this time": its operator's word, and only that. For ordering what
protects nothing, such as a feed; never for a payment or a lock change.

Make its identity first with the genesis client, its outbox route naming the
relays its stamps go to:
  mor-genesis new --file clock.json --home URL
  mor-genesis routes --file clock.json --outbox URL

  run --file F --state S --outbox URL [--outbox URL ...]
      [--watch URL ...] [--signer ID ...] [--port N] [--every SECONDS]
        Stamp what it finds at the relays watched (only the signers named, if
        any; never its own acts), every SECONDS (default 30), and the acts
        given at http://127.0.0.1:N/stamp (POST {"acts": ["<act id>", ...]}).
  stamp --file F --state S --outbox URL [--outbox URL ...] ACT [ACT ...]
        Stamp these acts now, and say the time.

S, its memory (each act stamped, where each relay was read up to), is a plain
JSON file, created if missing. Each act is stamped once; no stamp is earlier
than the one before.`;

function args(argv: string[]): { cmd: string; flags: Map<string, string[]>; rest: string[] } {
  const [cmd = 'help', ...more] = argv;
  const flags = new Map<string, string[]>();
  const rest: string[] = [];
  for (let i = 0; i < more.length; i++) {
    const a = more[i];
    if (a.startsWith('--')) {
      const v = more[++i];
      if (v === undefined) throw new Error(`${a} needs a value`);
      flags.set(a.slice(2), [...(flags.get(a.slice(2)) ?? []), v]);
    } else rest.push(a);
  }
  return { cmd, flags, rest };
}

async function main(): Promise<void> {
  const { cmd, flags, rest } = args(process.argv.slice(2));
  if (cmd !== 'run' && cmd !== 'stamp') {
    console.log(HELP);
    return;
  }
  const one = (k: string) => {
    const v = flags.get(k)?.[0];
    if (!v) throw new Error(`--${k} is needed`);
    return v;
  };
  const file = one('file');
  const statePath = one('state');
  const outbox = flags.get('outbox') ?? [];
  if (!outbox.length) throw new Error('--outbox is needed: where its stamps go');
  const identity = TestIdentity.load(file);
  const state: ClockState = existsSync(statePath) ? { ...emptyState(), ...JSON.parse(readFileSync(statePath, 'utf8')) } : emptyState();
  const save = () => {
    identity.save(file);
    writeFileSync(statePath, JSON.stringify(state, null, 1));
  };
  console.error(TEST_LABEL);
  const clock = new ClockService({ identity, outbox, watch: flags.get('watch'), signers: flags.get('signer'), state, save });
  const say = (m: { stamp: string; time: number; acts: string[] }) =>
    console.log(`stamp ${m.stamp}: ${m.acts.length} ${m.acts.length === 1 ? 'act' : 'acts'} at ${new Date(m.time * 1000).toISOString()}`);

  if (cmd === 'stamp') {
    if (!rest.length) throw new Error('name the acts to stamp');
    const made = await clock.stamp(rest);
    if (!made.length) console.log('every act named was stamped before');
    made.forEach(say);
    return;
  }
  const port = flags.get('port')?.[0];
  if (port) {
    await clock.serve(Number(port));
    console.error(`taking acts at http://127.0.0.1:${port}/stamp`);
  }
  const every = Number(flags.get('every')?.[0] ?? 30) * 1000;
  for (;;) {
    try {
      (await clock.sweep()).forEach(say);
    } catch (e) {
      console.error(`not stamped this time: ${e instanceof Error ? e.message : e}`);
    }
    await new Promise((r) => setTimeout(r, every));
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
