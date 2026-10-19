#!/usr/bin/env -S node --import tsx
// mor-split-service: a TEST split service, on regtest only (round 3, part C).
// It makes its identity and payee pointer on first start, then, every few
// seconds, accepts the grants naming its keys, answers invoice requests for
// the collectives and deals it divides for, signs their receipts with their
// grant keys, publishes each split and pays each holder. Its folder holds its
// test identity's keys and the grant keys it made.
//
// `key GRANTOR` asks the running service for a new grant key for a collective
// (or a deal's payee): it leaves the ask in the service's folder and prints
// the key the service makes, to give in Edubba ("Its money").

import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readId } from '../../genesis/src/forms.ts';
import { shownId } from '../../genesis/src/shown.ts';
import { lnd } from '../../anchoring-service/src/lnd.ts';
import { LABEL, SplitService } from './service.ts';

const HELP = `mor-split-service: ${LABEL}

  run --regtest RUN_DIR --homes URL[,URL] --relays URL[,URL] [--node carol] [--payer alice] [--dir DIR] [--every SECONDS]
  key GRANTOR [--dir DIR]

Its Lightning node is one of the regtest network's (default carol, at its REST port from
RUN_DIR/nodes.json, or 18082); its payouts are paid from the same node, or from --payer's (on the
regtest network only alice holds spendable funds: carol's few thousand received sit below its channel's
reserve, as human test 14 found). The folder defaults to ~/mor-split-service. "run" prints its
identity: give it to Edubba ("Its money", in the collective's page). "key", while the service
runs, prints a new key of the service for that collective (or a deal's payee): give it there too.`;

function parse(argv: string[]) {
  const o: Record<string, string> = {};
  const rest: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) o[argv[i].slice(2)] = argv[++i];
    else rest.push(argv[i]);
  }
  return { o, rest };
}

/** Asks for grant keys, left in the folder by `key` and answered by the running service. */
function asked(dir: string, svc: SplitService): string[] {
  const ask = join(dir, 'ask');
  if (!existsSync(ask)) return [];
  const said: string[] = [];
  for (const f of readdirSync(ask).filter((x) => /^[0-9a-f]{64}$/.test(x))) {
    const key = svc.grantKey(f);
    writeFileSync(join(ask, `${f}.tmp`), key + '\n');
    renameSync(join(ask, `${f}.tmp`), join(ask, `${f}.key`));
    rmSync(join(ask, f));
    said.push(`A grant key made for ${f.slice(0, 8)}…: ${key}`);
  }
  return said;
}

async function main() {
  const [cmd, ...argv] = process.argv.slice(2);
  const { o, rest } = parse(argv);
  const dir = resolve(o.dir ?? join(homedir(), 'mor-split-service'));
  if (cmd === 'key' && rest[0]) {
    const grantor = readId(rest[0]);
    const ask = join(dir, 'ask');
    mkdirSync(ask, { recursive: true });
    writeFileSync(join(ask, grantor), '');
    for (let i = 0; i < 60; i++) {
      const got = join(ask, `${grantor}.key`);
      if (existsSync(got)) {
        const key = readFileSync(got, 'utf8').trim();
        rmSync(got);
        console.log(`The service’s key for ${shownId(grantor)}:\n${key}`);
        return;
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
    rmSync(join(ask, grantor), { force: true });
    throw new Error('The service did not answer within a minute: start it first (mor-split-service run …), with the same --dir.');
  }
  if (cmd !== 'run' || !o.regtest || !o.homes || !o.relays) {
    console.log(HELP);
    return;
  }
  const run = resolve(o.regtest);
  const restOf = (name: string, fallback: number) => {
    const nodes = join(run, 'nodes.json');
    if (!existsSync(nodes)) return fallback;
    return (JSON.parse(readFileSync(nodes, 'utf8')) as { nodes: { name: string; rest: number }[] }).nodes.find((x) => x.name === name)?.rest ?? fallback;
  };
  const name = o.node ?? 'carol';
  const port = restOf(name, 18082);
  mkdirSync(dir, { recursive: true });
  const node = lnd({ url: `https://127.0.0.1:${port}`, lnddir: join(run, name) });
  const payer = o.payer ? lnd({ url: `https://127.0.0.1:${restOf(o.payer, 18080)}`, lnddir: join(run, o.payer) }) : node;
  const svc = new SplitService(dir, { nodeKey: () => node.nodeKey(), addInvoice: (sat, h) => node.addInvoice(sat, h), settled: (h) => node.settled(h), pay: (i) => payer.payInvoice!(i) }, { homes: o.homes.split(','), relays: o.relays.split(',') });
  await svc.start();
  console.log(`${LABEL}\nIts identity: ${shownId(svc.id)}\n(hexadecimal: ${svc.id})`);
  const every = Number(o.every ?? 5) * 1000;
  for (;;) {
    try {
      for (const line of asked(dir, svc)) console.log(line);
      for (const line of await svc.tick()) console.log(line);
    } catch (e) {
      console.log(`(a round failed: ${e instanceof Error ? e.message : e})`);
    }
    await new Promise((r) => setTimeout(r, every));
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
}
