// A minimal client for an lnd node's REST interface, the node's own
// certificate pinned (as `modules/lightning/src/lnd.rs`): what the test
// anchoring service needs, on regtest only. Its own node: the service's
// side issues its own invoices, as any payee's side does.

import { readFileSync } from 'node:fs';
import { request } from 'node:https';
import { join } from 'node:path';

export interface Lnd {
  nodeKey(): Promise<string>;
  /** An invoice for `sat`, committing by its description hash to `descriptionHash` (hex); its payment hash, hex. */
  addInvoice(sat: number, descriptionHash: string): Promise<{ invoice: string; hash: string }>;
  /** The preimage, hex, once settled; else null. */
  settled(hash: string): Promise<string | null>;
  /** Send `sat` on-chain from the node's own wallet; the txid. */
  sendCoins(address: string, sat: number): Promise<string>;
  /** Pay an invoice from the node's channels; the preimage, hex (the test split service's payouts). */
  payInvoice?(invoice: string): Promise<string>;
}

export function lnd(o: { url: string; lnddir: string }): Lnd {
  const ca = readFileSync(join(o.lnddir, 'tls.cert'));
  const mac = readFileSync(join(o.lnddir, 'data/chain/bitcoin/regtest/admin.macaroon')).toString('hex');
  const u = new URL(o.url);
  const call = (method: string, path: string, body?: unknown): Promise<any> =>
    new Promise((resolve, reject) => {
      const data = body === undefined ? undefined : JSON.stringify(body);
      const r = request(
        { host: u.hostname, port: u.port, method, path, ca, headers: { 'Grpc-Metadata-macaroon': mac, ...(data ? { 'content-type': 'application/json', 'content-length': Buffer.byteLength(data) } : {}) }, checkServerIdentity: () => undefined },
        (res) => {
          let t = '';
          res.on('data', (c) => (t += c));
          res.on('end', () => {
            try {
              const j = JSON.parse(t);
              if ((res.statusCode ?? 500) >= 300) reject(new Error(`lnd ${path}: ${res.statusCode} ${j.message ?? t.slice(0, 200)}`));
              else resolve(j);
            } catch {
              reject(new Error(`lnd ${path}: ${res.statusCode} ${t.slice(0, 200)}`));
            }
          });
        },
      );
      r.on('error', reject);
      r.end(data);
    });
  const b64hex = (s: string) => Buffer.from(s, 'base64').toString('hex');
  return {
    async nodeKey() {
      return (await call('GET', '/v1/getinfo')).identity_pubkey;
    },
    async addInvoice(sat, descriptionHash) {
      const v = await call('POST', '/v1/invoices', { value: String(sat), description_hash: Buffer.from(descriptionHash, 'hex').toString('base64') });
      return { invoice: v.payment_request, hash: b64hex(v.r_hash) };
    },
    async settled(hash) {
      const v = await call('GET', `/v1/invoice/${hash}`);
      return v.state === 'SETTLED' ? b64hex(v.r_preimage) : null;
    },
    async sendCoins(address, sat) {
      return (await call('POST', '/v1/transactions', { addr: address, amount: String(sat), target_conf: 1 })).txid;
    },
    async payInvoice(invoice) {
      const v = await call('POST', '/v1/channels/transactions', { payment_request: invoice });
      if (v.payment_error) throw new Error(`lnd: ${v.payment_error}`);
      return b64hex(v.payment_preimage);
    },
  };
}
