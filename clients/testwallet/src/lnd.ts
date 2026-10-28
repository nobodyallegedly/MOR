// An lnd node's REST interface, its own certificate pinned and its admin
// macaroon read from its folder: what a test wallet does with a node (see
// what it owns, pay an invoice, make one, send on-chain). Regtest only: a
// node on any other network is refused before anything is asked of it.

import { readFileSync } from 'node:fs';
import { request } from 'node:https';
import { join } from 'node:path';

export interface Decoded {
  destination: string;
  sat: number;
  paymentHash: string;
  description: string;
  descriptionHash: string;
}

/** What the wallet asks of a node. Tests give one in memory. */
export interface Node {
  name: string;
  /** What Damgar's receive-only link asks for (H114): the node's REST address, its receive-only permission file (invoices only) and its certificate, as `up.sh` made them; none where unknown. */
  link?: { address: string; macaroon: string; cert: string } | null;
  info(): Promise<{ key: string; network: string; height: number; synced: boolean }>;
  balances(): Promise<{ channels: number; onchain: number; unconfirmed: number }>;
  decode(invoice: string): Promise<Decoded>;
  /** Pay it: the preimage, hex, which is the proof of payment. */
  pay(invoice: string): Promise<{ preimage: string; fee: number }>;
  /** An invoice for `sat`, committing to `descriptionHash` (hex) when given, else carrying `memo`. */
  invoice(sat: number, o: { descriptionHash?: string; memo?: string }): Promise<{ invoice: string; hash: string }>;
  /** A fresh Taproot address of the node's own wallet. */
  address(): Promise<string>;
  /** A public key of the node's own wallet, x-only (64 hex): what Damgar's on-chain rail names as the payee's Bitcoin key. */
  bitcoinKey(): Promise<string>;
  /** Send `sat` on-chain from the node's wallet: the txid. */
  send(address: string, sat: number): Promise<string>;
}

const hexOf = (b64: string) => Buffer.from(b64 ?? '', 'base64').toString('hex');

export function lnd(o: { name: string; rest: number; lnddir: string; receive?: string }): Node {
  const ca = readFileSync(join(o.lnddir, 'tls.cert'));
  const mac = readFileSync(join(o.lnddir, 'data/chain/bitcoin/regtest/admin.macaroon')).toString('hex');
  const call = (method: string, path: string, body?: unknown): Promise<any> =>
    new Promise((resolve, reject) => {
      const data = body === undefined ? undefined : JSON.stringify(body);
      const r = request(
        {
          host: '127.0.0.1',
          port: o.rest,
          method,
          path,
          ca,
          headers: { 'Grpc-Metadata-macaroon': mac, ...(data ? { 'content-type': 'application/json', 'content-length': Buffer.byteLength(data) } : {}) },
          // The certificate is pinned (`ca`); its names are lnd's own.
          checkServerIdentity: () => undefined,
        },
        (res) => {
          let t = '';
          res.on('data', (c) => (t += c));
          res.on('end', () => {
            try {
              const j = JSON.parse(t);
              if ((res.statusCode ?? 500) >= 300) reject(new Error(`${o.name}: ${j.message ?? t.slice(0, 200)}`));
              else resolve(j);
            } catch {
              reject(new Error(`${o.name}: answered ${res.statusCode}, ${t.slice(0, 200)}`));
            }
          });
        },
      );
      r.on('error', (e) => reject(new Error(`${o.name} does not answer (${e.message}). Is the regtest network up?`)));
      r.end(data);
    });
  return {
    name: o.name,
    link: o.receive ? { address: `https://127.0.0.1:${o.rest}`, macaroon: o.receive, cert: join(o.lnddir, 'tls.cert') } : null,
    async info() {
      const v = await call('GET', '/v1/getinfo');
      return { key: v.identity_pubkey, network: v.chains?.[0]?.network ?? '', height: Number(v.block_height), synced: !!v.synced_to_chain };
    },
    async balances() {
      const [c, b] = await Promise.all([call('GET', '/v1/balance/channels'), call('GET', '/v1/balance/blockchain')]);
      return { channels: Number(c.local_balance?.sat ?? c.balance ?? 0), onchain: Number(b.confirmed_balance ?? 0), unconfirmed: Number(b.unconfirmed_balance ?? 0) };
    },
    async decode(invoice) {
      const v = await call('GET', `/v1/payreq/${encodeURIComponent(invoice.trim())}`);
      return { destination: v.destination, sat: Number(v.num_satoshis), paymentHash: v.payment_hash, description: v.description ?? '', descriptionHash: v.description_hash ?? '' };
    },
    async pay(invoice) {
      const v = await call('POST', '/v1/channels/transactions', { payment_request: invoice.trim() });
      if (v.payment_error) throw new Error(`${o.name} could not pay: ${v.payment_error}`);
      return { preimage: hexOf(v.payment_preimage), fee: Number(v.payment_route?.total_fees ?? 0) };
    },
    async invoice(sat, x) {
      const body: Record<string, string> = { value: String(sat) };
      if (x.descriptionHash) body.description_hash = Buffer.from(x.descriptionHash, 'hex').toString('base64');
      else if (x.memo) body.memo = x.memo;
      const v = await call('POST', '/v1/invoices', body);
      return { invoice: v.payment_request, hash: hexOf(v.r_hash) };
    },
    async address() {
      return (await call('GET', '/v1/newaddress?type=TAPROOT_PUBKEY')).address;
    },
    async bitcoinKey() {
      // A key of the wallet's own, in a key family of its own (lnd's wallet kit), x-only: its first byte (the parity) dropped.
      const v = await call('POST', '/v2/wallet/key/next', { key_family: 4242 });
      return hexOf(v.raw_key_bytes).slice(2);
    },
    async send(address, sat) {
      return (await call('POST', '/v1/transactions', { addr: address.trim(), amount: String(sat), target_conf: 1 })).txid;
    },
  };
}

/** btcd on regtest, asked only to mine blocks (to the address it was started with). */
export function miner(o: { rpc: string; cert: string }): (blocks: number) => Promise<string[]> {
  const ca = readFileSync(o.cert);
  const u = new URL(o.rpc);
  return (blocks) =>
    new Promise((resolve, reject) => {
      const body = JSON.stringify({ jsonrpc: '1.0', id: 1, method: 'generate', params: [blocks] });
      const r = request(
        { host: u.hostname, port: u.port, method: 'POST', path: '/', ca, auth: 'u:p', headers: { 'content-type': 'application/json', 'content-length': Buffer.byteLength(body) }, checkServerIdentity: () => undefined },
        (res) => {
          let t = '';
          res.on('data', (c) => (t += c));
          res.on('end', () => {
            try {
              const j = JSON.parse(t);
              if (j.error) reject(new Error(`btcd: ${j.error.message}`));
              else resolve(j.result);
            } catch {
              reject(new Error(`btcd answered ${res.statusCode}`));
            }
          });
        },
      );
      r.on('error', (e) => reject(new Error(`btcd does not answer (${e.message})`)));
      r.end(body);
    });
}
