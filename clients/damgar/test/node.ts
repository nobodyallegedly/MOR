// A test Lightning node, for the tests that run without regtest: a secp256k1
// key that signs real BOLT 11 invoices (as an lnd node's does), committing
// by their description hash to a payment, with a preimage it chose. The
// Lightning rail Module's own decoder and rule check them, exactly as they
// check an lnd node's. It moves no money: paying is knowing the preimage.

import { secp256k1 } from '@noble/curves/secp256k1.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { randomBytes } from 'node:crypto';

const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

function polymod(values: number[]): number {
  const G = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (const v of values) {
    const b = chk >>> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) if ((b >>> i) & 1) chk ^= G[i];
  }
  return chk >>> 0;
}

const hrpExpand = (h: string) => [...[...h].map((c) => c.charCodeAt(0) >> 5), 0, ...[...h].map((c) => c.charCodeAt(0) & 31)];

function toWords(bytes: Uint8Array): number[] {
  const out: number[] = [];
  let acc = 0;
  let bits = 0;
  for (const b of bytes) {
    acc = (acc << 8) | b;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      out.push((acc >> bits) & 31);
    }
  }
  if (bits > 0) out.push((acc << (5 - bits)) & 31);
  return out;
}

function fromWords(words: number[]): Uint8Array {
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
  if (bits > 0) out.push((acc << (8 - bits)) & 255);
  return Uint8Array.from(out);
}

const field = (type: number, data: number[]) => [type, data.length >> 5, data.length & 31, ...data];

export class TestNode {
  readonly secret: Uint8Array;
  readonly key: string;
  /** Invoices issued, by payment hash: their preimages (the node's own knowledge). */
  readonly preimages = new Map<string, Uint8Array>();

  constructor(secret?: Uint8Array) {
    this.secret = secret ?? new Uint8Array(randomBytes(32));
    this.key = Buffer.from(secp256k1.getPublicKey(this.secret, true)).toString('hex');
  }

  /** A regtest invoice for `sat`, committing to `descriptionHash` (hex), no plain description; returns it and its preimage. */
  invoice(sat: number, descriptionHash: string, o: { description?: string; msat?: number } = {}): { invoice: string; preimage: string } {
    const preimage = new Uint8Array(randomBytes(32));
    const paymentHash = sha256(preimage);
    const msat = o.msat ?? sat * 1000;
    const hrp = `lnbcrt${msat * 10}p`;
    const ts = Math.floor(Date.now() / 1000);
    const words: number[] = [];
    for (let i = 6; i >= 0; i--) words.push(Math.floor(ts / 2 ** (5 * i)) & 31);
    words.push(...field(1, toWords(paymentHash)));
    words.push(...field(16, toWords(new Uint8Array(randomBytes(32)))));
    if (o.description) words.push(...field(13, toWords(new TextEncoder().encode(o.description))));
    else words.push(...field(23, toWords(Buffer.from(descriptionHash, 'hex'))));
    words.push(...field(6, toWords(Uint8Array.of(0x0e, 0x10))));
    const msg = sha256(Uint8Array.from([...new TextEncoder().encode(hrp), ...fromWords(words)]));
    const sig = secp256k1.sign(msg, this.secret, { prehash: false, format: 'recovered' });
    // noble's recovered format: the recovery byte first; BOLT 11 wants r, s, then the recovery id.
    const sig65 = Uint8Array.from([...sig.slice(1), sig[0]]);
    const data = [...words, ...toWords(sig65)];
    const chk = polymod([...hrpExpand(hrp), ...data, 0, 0, 0, 0, 0, 0]) ^ 1;
    const checksum = [0, 1, 2, 3, 4, 5].map((i) => (chk >>> (5 * (5 - i))) & 31);
    const invoice = `${hrp}1${[...data, ...checksum].map((d) => CHARSET[d]).join('')}`;
    this.preimages.set(Buffer.from(paymentHash).toString('hex'), preimage);
    return { invoice, preimage: Buffer.from(preimage).toString('hex') };
  }
}

/**
 * The test node as an lnd node is driven by the anchoring service (its own
 * invoices; settled once a wallet paid them), and as a wallet pays: paying
 * an invoice is learning its preimage. Its on-chain sends go to a test chain.
 */
export class StubLnd {
  readonly node = new TestNode();
  private paid = new Set<string>();
  private byInvoice = new Map<string, string>();
  constructor(readonly chain: { pay(script: string, value: number): string }, readonly script: (address: string) => string) {}
  async nodeKey() {
    return this.node.key;
  }
  async addInvoice(sat: number, descriptionHash: string) {
    const i = this.node.invoice(sat, descriptionHash);
    const hash = [...this.node.preimages.keys()].pop()!;
    this.byInvoice.set(i.invoice, hash);
    return { invoice: i.invoice, hash };
  }
  async settled(hash: string) {
    return this.paid.has(hash) ? Buffer.from(this.node.preimages.get(hash)!).toString('hex') : null;
  }
  async sendCoins(address: string, sat: number) {
    return this.chain.pay(this.script(address), sat);
  }
  /** A wallet pays the invoice: the preimage, as a wallet shows it. */
  pay(invoice: string): string {
    const hash = this.byInvoice.get(invoice);
    if (!hash) throw new Error('not an invoice of this node');
    this.paid.add(hash);
    return Buffer.from(this.node.preimages.get(hash)!).toString('hex');
  }
}
