#!/usr/bin/env -S node --import tsx
// The test wallet: a plain page over the regtest Lightning network that
// modules/lightning/regtest/up.sh started in RUN_DIR.
//
//   npm start -- RUN_DIR [--port N]
//
// It prints the page's address; open it in the browser on this machine.

import { join } from 'node:path';
import { lnd, miner } from './lnd.ts';
import { checkRegtest, nodesOf, serve } from './server.ts';

const args = process.argv.slice(2);
const run = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--port');
const port = args.includes('--port') ? Number(args[args.indexOf('--port') + 1]) : 8478;
if (!run) {
  console.error('usage: npm start -- RUN_DIR [--port N]   (RUN_DIR: where up.sh started the regtest network)');
  process.exit(2);
}
try {
  const w = { nodes: nodesOf(run).map(lnd), mine: miner({ rpc: 'https://127.0.0.1:18334', cert: join(run, 'btcd/rpc.cert') }) };
  await checkRegtest(w);
  const { base } = await serve(w, port);
  console.log(`Test wallet (regtest only): ${base}/`);
} catch (e) {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
}
