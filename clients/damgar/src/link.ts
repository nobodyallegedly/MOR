// The receive-only link (F351, decided by Nobody, allegedly, 18 October
// 2026: "my decision was an unnecessary hurdle"): the payee may let
// Damgar make invoices on their own Lightning node, so that it answers a
// Lightning invoice request by itself. The permission makes invoices only:
// no paying, no balance, no moving money. Off by default, said in plain
// words in Settings with its cost, revocable; the manual path is kept.
//
// On lnd, the permission is a macaroon baked for `invoices:write` and
// `invoices:read` alone (`lncli bakemacaroon invoices:write invoices:read`;
// `modules/lightning/regtest/up.sh` bakes one per node as
// `receive.macaroon`). Before it is kept, Damgar asks the node for its
// balance with it: a permission that can read the balance is refused, as
// too wide. The program only: the web client gets no link.

import { request } from 'node:https';

/** What a link is given: the node's REST address, the permission, and the node's own certificate, pinned. */
export interface LinkConfig {
  rest: string;
  /** The macaroon, hex. */
  macaroon: string;
  /** The node's TLS certificate, PEM. */
  cert: string;
}

/** What Damgar asks of the node through the link: an invoice, and nothing else. */
export interface InvoiceLink {
  /** An invoice for `sat`, committing to `descriptionHash` (hex), no plain description. */
  invoice(sat: number, descriptionHash: string): Promise<string>;
  /** Whether the permission is too wide: it can read the node's balance. */
  tooWide(): Promise<boolean>;
}

export { LINK_SAY } from './link-say.ts';

/** A link to an lnd node over its REST interface (program only: Node's https, the certificate pinned). */
export async function lndLink(c: LinkConfig): Promise<InvoiceLink> {
  const u = new URL(c.rest);
  if (u.protocol !== 'https:') throw new Error('The node’s REST address starts with https://.');
  const call = (method: string, path: string, body?: unknown): Promise<{ status: number; json: any }> =>
    new Promise((resolve, reject) => {
      const data = body === undefined ? undefined : JSON.stringify(body);
      const r = request(
        {
          host: u.hostname,
          port: Number(u.port || 443),
          method,
          path,
          ca: c.cert,
          headers: { 'Grpc-Metadata-macaroon': c.macaroon, ...(data ? { 'content-type': 'application/json', 'content-length': Buffer.byteLength(data) } : {}) },
          // The certificate is pinned (`ca`); its names are lnd's own.
          checkServerIdentity: () => undefined,
        },
        (res) => {
          let t = '';
          res.on('data', (x) => (t += x));
          res.on('end', () => {
            let json: unknown = null;
            try {
              json = JSON.parse(t);
            } catch {
              // not JSON
            }
            resolve({ status: res.statusCode ?? 500, json });
          });
        },
      );
      r.on('error', (e) => reject(new Error(`The node does not answer (${e.message}).`)));
      r.end(data);
    });
  return {
    async invoice(sat, descriptionHash) {
      const r = await call('POST', '/v1/invoices', { value: String(sat), description_hash: Buffer.from(descriptionHash, 'hex').toString('base64') });
      if (r.status >= 300 || !r.json?.payment_request) throw new Error(`The node made no invoice: ${r.json?.message ?? r.status}`);
      return String(r.json.payment_request);
    },
    async tooWide() {
      const r = await call('GET', '/v1/balance/channels');
      return r.status < 300;
    },
  };
}
