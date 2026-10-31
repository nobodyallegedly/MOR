#!/usr/bin/env -S node --import tsx
// mor-split-service: a TEST split service, on regtest only (round 3, part C).
// It makes its identity and payee pointer on first start, then, every few
// seconds, signs the publications sealed to it that name it, answers invoice
// requests made to it under them, signs their receipts in its own name,
// publishes each split and pays each receiver. Its folder holds its test
// identity's keys.
//
// `accept PUBLICATION` asks the running service to sign a publication naming
// it (rule 11), and `tag PUBLICATION VALUE UNIT` to put its price tag on one
// (Money rule 18; no VALUE withdraws it): each leaves the ask in the
// service's folder and prints the answer.

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
  accept PUBLICATION [--dir DIR]
  tag PUBLICATION [VALUE UNIT] [--dir DIR]

Its Lightning node is one of the regtest network's (default carol, at its REST port from
RUN_DIR/nodes.json, or 18082); its payouts are paid from the same node, or from --payer's (on the
regtest network only alice holds spendable funds: carol's few thousand received sit below its channel's
reserve, as human test 14 found). The folder defaults to ~/mor-split-service. "run" prints its
identity: name it as a publication's split service (field 3) or a backup (field 11). "accept", while
the service runs, has it sign such a publication; "tag" has it sign its price tag on one, its payee
the service itself (a buyer pays the service, which pays everyone).`;

function parse(argv: string[]) {
  const o: Record<string, string> = {};
  const rest: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) o[argv[i].slice(2)] = argv[++i];
    else rest.push(argv[i]);
  }
  return { o, rest };
}

/** Asks left in the folder by `accept` and `tag`, answered by the running service. */
async function asked(dir: string, svc: SplitService): Promise<string[]> {
  const ask = join(dir, 'ask');
  if (!existsSync(ask)) return [];
  const said: string[] = [];
  for (const f of readdirSync(ask).filter((x) => /^[0-9a-z-]+\.ask$/.test(x))) {
    const a = JSON.parse(readFileSync(join(ask, f), 'utf8')) as { cmd: 'accept' | 'tag'; publication: string; value?: number; unit?: string };
    let answer: string;
    try {
      answer = a.cmd === 'accept' ? await svc.accept(a.publication) : `Its price tag: ${await svc.tag(a.publication, a.value !== undefined && a.unit ? { unit: a.unit, value: a.value } : null)}`;
    } catch (e) {
      answer = `Refused: ${e instanceof Error ? e.message : e}`;
    }
    const out = join(ask, f.replace(/\.ask$/, '.answer'));
    writeFileSync(`${out}.tmp`, answer + '\n');
    renameSync(`${out}.tmp`, out);
    rmSync(join(ask, f));
    said.push(answer);
  }
  return said;
}

async function main() {
  const [cmd, ...argv] = process.argv.slice(2);
  const { o, rest } = parse(argv);
  const dir = resolve(o.dir ?? join(homedir(), 'mor-split-service'));
  if ((cmd === 'accept' || cmd === 'tag') && rest[0]) {
    const publication = readId(rest[0]);
    const ask = join(dir, 'ask');
    mkdirSync(ask, { recursive: true });
    const name = `${cmd}-${publication}-${Date.now()}`;
    const value = cmd === 'tag' && rest[1] ? Number(rest[1]) : undefined;
    writeFileSync(join(ask, `${name}.ask`), JSON.stringify({ cmd, publication, ...(value !== undefined ? { value, unit: rest[2] } : {}) }));
    for (let i = 0; i < 60; i++) {
      const got = join(ask, `${name}.answer`);
      if (existsSync(got)) {
        console.log(readFileSync(got, 'utf8').trim());
        rmSync(got);
        return;
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
    rmSync(join(ask, `${name}.ask`), { force: true });
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
      for (const line of await asked(dir, svc)) console.log(line);
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
