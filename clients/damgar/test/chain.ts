// A regtest chain made in the test, for the tests that run without btcd:
// real 80-byte headers mined to regtest's target, real transactions
// (without witness) paying a payment's pay-to-contract output, blocks of
// two transactions so a Merkle branch is real. Handed to Damgar as the
// chain it follows (`ChainSource`), and to the on-chain rail Module's rule.

import { createHash, randomBytes } from 'node:crypto';
import type { ChainSource } from '../src/chain.ts';

const dsha = (b: Uint8Array) => new Uint8Array(createHash('sha256').update(createHash('sha256').update(b).digest()).digest());
const le32 = (n: number) => {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(n >>> 0);
  return b;
};
const le64 = (n: number) => {
  const b = Buffer.alloc(8);
  b.writeBigUInt64LE(BigInt(n));
  return b;
};
const hexOf = (b: Uint8Array) => Buffer.from(b).toString('hex');
/** Bitcoin writes txids reversed. */
const shown = (internal: Uint8Array) => hexOf(Uint8Array.from(internal).reverse());

/** A transaction without witness: one input from nowhere, one output paying `script`. */
export function tx(script: Uint8Array, value: number): Uint8Array {
  return Uint8Array.from(Buffer.concat([le32(2), Buffer.from([1]), randomBytes(32), le32(0), Buffer.from([0]), le32(0xffffffff), Buffer.from([1]), le64(value), Buffer.from([script.length]), Buffer.from(script), le32(0)]));
}

function merkle(ids: Uint8Array[]): Uint8Array {
  let row = ids;
  while (row.length > 1) {
    const next: Uint8Array[] = [];
    for (let i = 0; i < row.length; i += 2) next.push(dsha(Uint8Array.from([...row[i], ...(row[i + 1] ?? row[i])])));
    row = next;
  }
  return row[0];
}

/** A header meeting regtest's target (bits 0x207fffff). */
function header(prev: Uint8Array, root: Uint8Array, time: number): Uint8Array {
  for (let nonce = 0; ; nonce++) {
    const h = Uint8Array.from(Buffer.concat([le32(0x20000000), Buffer.from(prev), Buffer.from(root), le32(time), le32(0x207fffff), le32(nonce)]));
    const hash = dsha(h);
    // The target: 0x7fffff followed by zeros, as a 256-bit number; the hash read little-endian.
    if (hash[31] < 0x7f) return h;
  }
}

export class FakeChain implements ChainSource {
  said = 'a regtest chain made by the test (a header service the test trusts)';
  network = 3;
  private headersList: Uint8Array[] = [];
  private blocks: Uint8Array[][] = [];
  private txs = new Map<string, Uint8Array>();
  private pool: Uint8Array[] = [];
  private time = 1_700_000_000;

  constructor() {
    this.mine(1);
  }

  /** Pay `value` to `script` (hex): broadcast, not mined. The transaction's id, as wallets show it. */
  pay(script: string, value: number): string {
    const t = tx(Buffer.from(script, 'hex'), value);
    const id = shown(dsha(t));
    this.txs.set(id, t);
    this.pool.push(t);
    return id;
  }

  mine(n: number) {
    for (let i = 0; i < n; i++) {
      const filler = tx(Uint8Array.of(0x51), 0);
      const body = [filler, ...this.pool.splice(0)];
      for (const t of body) this.txs.set(shown(dsha(t)), t);
      const prev = this.headersList.length ? dsha(this.headersList[this.headersList.length - 1]) : new Uint8Array(32);
      this.headersList.push(header(prev, merkle(body.map(dsha)), this.time++));
      this.blocks.push(body);
    }
  }

  async headers() {
    return { network: 3, start: 0, headers: [...this.headersList] };
  }

  async tx(txid: string) {
    const raw = this.txs.get(txid);
    if (!raw) throw new Error(`no transaction ${txid}`);
    const h = this.blocks.findIndex((b) => b.some((t) => shown(dsha(t)) === txid));
    if (h < 0) return { raw, block: null };
    const ids = this.blocks[h].map(dsha);
    return { raw, block: { height: h, index: ids.findIndex((x) => shown(x) === txid), txids: ids } };
  }
}

/** A Taproot address's output script (`5120` and its 32-byte program), from its bech32m text. */
export function addressScript(address: string): string {
  const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
  const data = [...address.slice(address.lastIndexOf('1') + 1, -6)].map((c) => CHARSET.indexOf(c));
  const words = data.slice(1);
  const out: number[] = [];
  let acc = 0;
  let bits = 0;
  for (const w of words) {
    acc = (acc << 5) | w;
    bits += 5;
    while (bits >= 8) {
      bits -= 8;
      out.push((acc >> bits) & 255);
    }
  }
  return `5120${Buffer.from(out.slice(0, 32)).toString('hex')}`;
}
