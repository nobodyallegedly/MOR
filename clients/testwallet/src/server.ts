// The test wallet's program: its page, served to the browser on this
// machine only (127.0.0.1), and the few things the page asks of the regtest
// nodes. It refuses to start unless every node says it is on regtest.
//
// Nothing here pairs or signs, as Damgar's page does: there is no identity
// and nothing of value. Two guards keep other web pages from using it: the
// Host must be this address (a renamed address, DNS rebinding, is refused),
// and every request carries a header a plain form or link cannot send (so
// another site's page cannot make the browser pay an invoice here).

import { readFileSync } from 'node:fs';
import { createServer, type IncomingMessage, type Server } from 'node:http';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Node } from './lnd.ts';

const here = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const FILES: Record<string, { file: string; type: string }> = {
  '/': { file: 'static/index.html', type: 'text/html; charset=utf-8' },
  '/page.js': { file: 'static/page.js', type: 'text/javascript; charset=utf-8' },
  '/page.css': { file: 'static/page.css', type: 'text/css; charset=utf-8' },
};
const POLICY = "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";

export interface Wallet {
  nodes: Node[];
  mine?: (blocks: number) => Promise<string[]>;
}

/** Every node must say it is on regtest; else nothing is served. */
export async function checkRegtest(w: Wallet): Promise<void> {
  for (const n of w.nodes) {
    const i = await n.info();
    if (i.network !== 'regtest') throw new Error(`${n.name} is on ${i.network || 'an unknown network'}, not regtest: the test wallet works only on regtest.`);
  }
}

const sat = (v: unknown, what: string): number => {
  const n = Number(v);
  if (!Number.isSafeInteger(n) || n <= 0) throw new Error(`${what}: a whole number of regtest satoshis, above zero.`);
  return n;
};

export async function answer(w: Wallet, a: Record<string, unknown>): Promise<unknown> {
  const node = () => {
    const n = w.nodes.find((x) => x.name === a.node);
    if (!n) throw new Error('Choose one of the nodes.');
    return n;
  };
  const text = (k: string) => String(a[k] ?? '').trim();
  switch (a.op) {
    case 'nodes':
      return Promise.all(w.nodes.map(async (n) => ({ name: n.name, ...(await n.info()), ...(await n.balances()) })));
    case 'decode':
      return node().decode(text('invoice'));
    case 'pay':
      return node().pay(text('invoice'));
    case 'invoice': {
      const dh = text('descriptionHash').toLowerCase();
      if (dh && !/^[0-9a-f]{64}$/.test(dh)) throw new Error('A description hash is 64 hexadecimal characters (Damgar shows it beside the payment).');
      return node().invoice(sat(a.sat, 'The amount'), { descriptionHash: dh || undefined, memo: text('memo') || undefined });
    }
    case 'address':
      return { address: await node().address() };
    case 'send':
      return { txid: await node().send(text('address'), sat(a.sat, 'The amount')) };
    case 'mine': {
      if (!w.mine) throw new Error('No miner here.');
      const n = sat(a.blocks, 'Blocks');
      if (n > 200) throw new Error('At most 200 blocks at a time.');
      return { blocks: (await w.mine(n)).length };
    }
    default:
      throw new Error('Unknown request.');
  }
}

const read = (req: IncomingMessage): Promise<string> =>
  new Promise((resolve, reject) => {
    let t = '';
    req.on('data', (c) => {
      t += c;
      if (t.length > 64_000) req.destroy();
    });
    req.on('end', () => resolve(t));
    req.on('error', reject);
  });

export async function serve(w: Wallet, port = 0): Promise<{ server: Server; base: string }> {
  let base = '';
  const server = createServer(async (req, res) => {
    const headers = { 'content-security-policy': POLICY, 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer', 'cache-control': 'no-store' };
    if (req.headers.host !== new URL(base).host) {
      res.writeHead(421, headers).end('Open the test wallet at its own address.');
      return;
    }
    const path = new URL(req.url ?? '/', base).pathname;
    if (req.method === 'GET' && FILES[path]) {
      res.writeHead(200, { ...headers, 'content-type': FILES[path].type }).end(readFileSync(here(FILES[path].file)));
      return;
    }
    if (path === '/favicon.ico') {
      res.writeHead(204, headers).end();
      return;
    }
    if (req.method === 'POST' && path === '/api') {
      if (req.headers['x-test-wallet'] !== '1' || !String(req.headers['content-type']).startsWith('application/json')) {
        res.writeHead(403, headers).end();
        return;
      }
      try {
        const ok = await answer(w, JSON.parse(await read(req)));
        res.writeHead(200, { ...headers, 'content-type': 'application/json' }).end(JSON.stringify({ ok }));
      } catch (e) {
        res.writeHead(400, { ...headers, 'content-type': 'application/json' }).end(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }));
      }
      return;
    }
    res.writeHead(404, headers).end();
  });
  await new Promise<void>((r) => server.listen(port, '127.0.0.1', r));
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  return { server, base };
}

/** The nodes of the network `up.sh` started in `run`, as it wrote them in `nodes.json`. */
export function nodesOf(run: string): { name: string; rest: number; lnddir: string }[] {
  try {
    return JSON.parse(readFileSync(join(run, 'nodes.json'), 'utf8')).nodes;
  } catch {
    throw new Error(`No regtest network in ${run}: start one with modules/lightning/regtest/up.sh ${run}.`);
  }
}
