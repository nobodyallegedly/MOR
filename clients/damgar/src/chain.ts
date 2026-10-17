// The chain Damgar follows, for the on-chain rail (its "The chain the
// verifier follows", F204): the headers handed to the rail's rule as data,
// and, for a payment the person paid, its transaction and block, from which
// the proof is built. Program only: the web client follows no chain, and
// every mined payment there answers unknown ("paid, not yet checked
// against the chain"), as the Module says of an offline client.
//
// Round 1 reads a btcd node on regtest over its JSON-RPC. That is a header
// service trusted, which a client MUST say (the on-chain rail Module, client
// conformance 6): Damgar says so wherever the chain is used.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { request } from 'node:https';
import { unhex } from '../../genesis/src/core.ts';

export interface ChainSource {
  /** What the page says about it. */
  said: string;
  network: number;
  /** Every header from `start` (regtest: from the genesis block), in order. */
  headers(): Promise<{ network: number; start: number; headers: Uint8Array[] }>;
  /** A transaction by txid: its bytes without witness, and where it is mined, if it is. */
  tx(txid: string): Promise<{ raw: Uint8Array; block: { height: number; index: number; txids: Uint8Array[] } | null }>;
}

/** A transaction's bytes without its witness (BIP 144): the bytes its txid is the hash of. */
export function stripWitness(tx: Uint8Array): Uint8Array {
  if (tx.length < 10 || tx[4] !== 0 || tx[5] !== 1) return tx;
  let p = 6;
  const varint = (): number => {
    const b = tx[p++];
    if (b < 0xfd) return b;
    const n = b === 0xfd ? 2 : b === 0xfe ? 4 : 8;
    let v = 0;
    for (let i = 0; i < n; i++) v += tx[p + i] * 2 ** (8 * i);
    p += n;
    return v;
  };
  const start = p;
  const ins = varint();
  for (let i = 0; i < ins; i++) {
    p += 36;
    {
      const n = varint();
      p += n;
    }
    p += 4;
  }
  const outs = varint();
  for (let i = 0; i < outs; i++) {
    p += 8;
    {
      const n = varint();
      p += n;
    }
  }
  const body = tx.slice(start, p);
  for (let i = 0; i < ins; i++) {
    const items = varint();
    for (let j = 0; j < items; j++) {
      const n = varint();
      p += n;
    }
  }
  const out = new Uint8Array(4 + body.length + 4);
  out.set(tx.slice(0, 4), 0);
  out.set(body, 4);
  out.set(tx.slice(p, p + 4), 4 + body.length);
  return out;
}

/** Bitcoin writes hashes reversed in its JSON: back to its own byte order. */
const internal = (displayed: string) => unhex(displayed).reverse();

/** A btcd node on regtest, read over its JSON-RPC (TLS, its own certificate pinned). */
export function btcd(o: { url: string; user: string; pass: string; cert: string }): ChainSource {
  const ca = readFileSync(o.cert);
  const u = new URL(o.url);
  let n = 0;
  const call = (method: string, params: unknown[]): Promise<any> =>
    new Promise((resolve, reject) => {
      const body = JSON.stringify({ jsonrpc: '1.0', id: ++n, method, params });
      const r = request(
        { host: u.hostname, port: u.port, method: 'POST', path: '/', ca, auth: `${o.user}:${o.pass}`, headers: { 'content-type': 'application/json', 'content-length': Buffer.byteLength(body) }, checkServerIdentity: () => undefined },
        (res) => {
          let t = '';
          res.on('data', (c) => (t += c));
          res.on('end', () => {
            try {
              const j = JSON.parse(t);
              if (j.error) reject(new Error(`btcd ${method}: ${j.error.message ?? JSON.stringify(j.error)}`));
              else resolve(j.result);
            } catch {
              reject(new Error(`btcd ${method}: ${res.statusCode} ${t.slice(0, 120)}`));
            }
          });
        },
      );
      r.on('error', reject);
      r.end(body);
    });
  return {
    said: `the regtest node at ${o.url}, trusted to hand over the chain it follows (a header service: the on-chain rail Module says a client relying on one must say so)`,
    network: 3,
    async headers() {
      const tip: number = await call('getblockcount', []);
      const headers: Uint8Array[] = [];
      for (let h = 0; h <= tip; h++) {
        const hash: string = await call('getblockhash', [h]);
        headers.push(unhex(await call('getblockheader', [hash, false])));
      }
      return { network: 3, start: 0, headers };
    },
    async tx(txid: string) {
      const v = await call('getrawtransaction', [txid, 1]);
      const raw = stripWitness(unhex(v.hex));
      if (!v.blockhash) return { raw, block: null };
      const b = await call('getblock', [v.blockhash, true]);
      const ids: string[] = b.tx.map((t: string | { txid: string }) => (typeof t === 'string' ? t : t.txid));
      return { raw, block: { height: b.height, index: ids.indexOf(txid), txids: ids.map(internal) } };
    },
  };
}

/**
 * The chain followed by a program in folder `dir`: the btcd of a regtest
 * network's run folder (`modules/lightning/regtest/up.sh RUN_DIR`), given
 * now or remembered in the folder (`regtest.json`); none otherwise.
 */
export function chainFrom(dir: string, regtest?: string): ChainSource | null {
  const run = regtest ?? (existsSync(join(dir, 'regtest.json')) ? (JSON.parse(readFileSync(join(dir, 'regtest.json'), 'utf8')) as { run: string }).run : undefined);
  if (!run) return null;
  const cert = join(resolve(run), 'btcd', 'rpc.cert');
  if (!existsSync(cert)) throw new Error(`${run} holds no regtest network (no btcd/rpc.cert): start it with modules/lightning/regtest/up.sh`);
  return btcd({ url: 'https://127.0.0.1:18334', user: 'u', pass: 'p', cert });
}

/** Remember, in the program's folder, which regtest network it follows (`open --regtest RUN_DIR`). */
export function rememberRegtest(dir: string, run: string): void {
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  writeFileSync(join(dir, 'regtest.json'), JSON.stringify({ run: resolve(run) }) + '\n', { mode: 0o600 });
}
