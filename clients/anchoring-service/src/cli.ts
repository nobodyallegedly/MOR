#!/usr/bin/env -S node --import tsx
// mor-anchoring-service: a TEST anchoring service, on regtest only (F338).
// It makes its identity, payee pointer and standing offer on first start,
// then, every few seconds, reads its inbox, answers invoice requests for
// anchors, signs receipts for payments its node sees settled, and anchors
// and publishes each batch. Its folder holds its test identity's keys.

import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, existsSync } from 'node:fs';
import { chainFrom } from '../../damgar/src/chain.ts';
import { lnd } from './lnd.ts';
import { LABEL, Service } from './service.ts';

const HELP = `mor-anchoring-service: ${LABEL}

  run --regtest RUN_DIR --homes URL[,URL] --relays URL[,URL] [--node carol] [--dir DIR] [--every SECONDS]

Its Lightning node is one of the regtest network's (default carol, at its REST port from
RUN_DIR/nodes.json, or 18082); its chain, the network's btcd. The folder defaults to
~/mor-anchoring-service. It prints its identity and its standing offer: give the identity
to Edubba ("Anchor one of its acts on Bitcoin").`;

function parse(argv: string[]) {
  const o: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) o[argv[i].slice(2)] = argv[++i];
  return o;
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const o = parse(rest);
  if (cmd !== 'run' || !o.regtest || !o.homes || !o.relays) {
    console.log(HELP);
    return;
  }
  const run = resolve(o.regtest);
  const name = o.node ?? 'carol';
  let port = 18082;
  const nodes = join(run, 'nodes.json');
  if (existsSync(nodes)) {
    const n = (JSON.parse(readFileSync(nodes, 'utf8')) as { nodes: { name: string; rest: number }[] }).nodes.find((x) => x.name === name);
    if (n) port = n.rest;
  }
  const svc = new Service(resolve(o.dir ?? join(homedir(), 'mor-anchoring-service')), lnd({ url: `https://127.0.0.1:${port}`, lnddir: join(run, name) }), chainFrom('', run)!, { homes: o.homes.split(','), relays: o.relays.split(',') });
  await svc.start();
  console.log(`${LABEL}\nIts identity: ${svc.id}\nIts standing offer: ${svc.offer}`);
  const every = Number(o.every ?? 5) * 1000;
  for (;;) {
    try {
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
