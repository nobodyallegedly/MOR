// The wallet layer behind the bank: one interface, two implementations.
//
// `LncliWallet` runs the regtest network's own command-line tools (lncli for
// the three Lightning nodes, btcctl for btcd), each call a fixed program with
// an argument list, never a shell, so nothing a player writes can become a
// command. `MockWallet` stands in for it in tests, with the same answers'
// shape. Every call returns `{ argv, code, stdout, stderr }`: `argv` is the
// subcommand and its arguments only (never the hosts' folders or ports),
// `stdout` the tool's answer, byte for byte, which the bank hands back.

import { execFile } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';

/** Run a program with an argument list (no shell); never throws. */
export function runFile(program, args, { timeoutMs = 120_000 } = {}) {
  return new Promise((resolve) => {
    execFile(program, args, { timeout: timeoutMs, maxBuffer: 32 << 20, encoding: 'buffer' }, (err, stdout, stderr) => {
      resolve({ code: err ? (typeof err.code === 'number' ? err.code : 1) : 0, stdout: new Uint8Array(stdout ?? []), stderr: Buffer.from(stderr ?? []).toString('utf8'), error: err && typeof err.code !== 'number' ? String(err.message) : undefined });
    });
  });
}

/** The last JSON object a tool printed (lncli payinvoice --json may print several updates). */
export function lastJson(bytes) {
  const s = Buffer.from(bytes).toString('utf8').trim();
  if (!s) return null;
  try {
    return JSON.parse(s);
  } catch {
    // several objects one after the other: take the last complete one
  }
  let depth = 0;
  let inStr = false;
  let esc = false;
  let start = -1;
  let last = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (c === '}') {
      depth--;
      if (depth === 0 && start >= 0) {
        try {
          last = JSON.parse(s.slice(start, i + 1));
        } catch {
          // not JSON
        }
      }
    }
  }
  return last;
}

/** A whole number lnd wrote (its 64-bit numbers come as strings), or null. */
export function toInt(x) {
  if (typeof x === 'number' && Number.isSafeInteger(x)) return x;
  if (typeof x === 'string' && /^-?\d+$/.test(x) && Number.isSafeInteger(Number(x))) return Number(x);
  return null;
}

export class LncliWallet {
  /**
   * `cfg`: `{ lncli, btcctl, regtest, nodes: { alice, bob, carol }, btcd,
   * rpcuser, rpcpass, payFrom, invoiceOn }`, as in the hosts' configuration;
   * `run` runs a program (tests pass one that records the arguments).
   */
  constructor(cfg, run = runFile) {
    this.cfg = cfg;
    this.run = run;
    this.payFrom = cfg.payFrom;
    this.invoiceOn = cfg.invoiceOn;
  }

  /** lncli's arguments for one node: the node's folder, the network and its address, then the call. */
  lnArgs(node, args) {
    const n = this.cfg.nodes[node];
    if (!n) throw new Error(`no node ${node}`);
    return [`--lnddir=${this.cfg.regtest}/${node}`, '--network=regtest', `--rpcserver=${n}`, ...args];
  }

  btcArgs(args) {
    return ['--regtest', `--rpcuser=${this.cfg.rpcuser}`, `--rpcpass=${this.cfg.rpcpass}`, `--rpcserver=${this.cfg.btcd}`, `--rpccert=${this.cfg.regtest}/btcd/rpc.cert`, ...args];
  }

  async ln(node, ...args) {
    const r = await this.run(this.cfg.lncli, this.lnArgs(node, args));
    return { argv: [`lncli (${node})`, ...args], ...r };
  }

  async btc(...args) {
    const r = await this.run(this.cfg.btcctl, this.btcArgs(args));
    return { argv: ['btcctl', ...args], ...r };
  }

  addInvoice(node, { amount, memo, hash, expiry }) {
    const a = ['addinvoice', `--amt=${amount}`];
    if (memo !== undefined) a.push(`--memo=${memo}`);
    if (hash !== undefined) a.push(`--description_hash=${hash}`);
    if (expiry !== undefined) a.push(`--expiry=${expiry}`);
    return this.ln(node, ...a);
  }

  lookupInvoice(node, rhash) {
    return this.ln(node, 'lookupinvoice', `--rhash=${rhash}`);
  }

  decodePayReq(req) {
    return this.ln(this.payFrom, 'decodepayreq', `--pay_req=${req}`);
  }

  payInvoice(req, { amount, feeLimit }) {
    const a = ['payinvoice', '--force', '--json', `--fee_limit=${feeLimit}`];
    if (amount !== undefined) a.push(`--amt=${amount}`);
    a.push(`--pay_req=${req}`);
    return this.ln(this.payFrom, ...a);
  }

  sendCoins(address, { amount, feerate }) {
    return this.ln(this.payFrom, 'sendcoins', `--addr=${address}`, `--amt=${amount}`, `--sat_per_vbyte=${feerate}`);
  }

  listChainTxns() {
    return this.ln(this.payFrom, 'listchaintxns');
  }

  newAddress() {
    return this.ln(this.payFrom, 'newaddress', 'p2wkh');
  }

  listChannels() {
    return this.ln(this.payFrom, 'listchannels');
  }

  getInfo(node) {
    return this.ln(node, 'getinfo');
  }

  walletBalance(node) {
    return this.ln(node, 'walletbalance');
  }

  channelBalance(node) {
    return this.ln(node, 'channelbalance');
  }

  /** A read-only question to the chain (the postman's chain letters). */
  chain(ask, arg, verbose) {
    if (ask === 'getblockcount') return this.btc('getblockcount');
    if (ask === 'getblockhash') return this.btc('getblockhash', String(arg));
    if (ask === 'getblockheader') return this.btc('getblockheader', arg, verbose ? 'true' : 'false');
    if (ask === 'getblock') return this.btc('getblock', arg, verbose ? 'true' : 'false');
    if (ask === 'getrawtransaction') return this.btc('getrawtransaction', arg, verbose ? '1' : '0');
    throw new Error(`no chain question ${ask}`);
  }

  nodes() {
    return [this.payFrom, ...this.invoiceOn];
  }
}

const enc = (o) => new Uint8Array(Buffer.from(JSON.stringify(o, null, 4) + '\n'));
const answer = (argv, out, code = 0, stderr = '') => ({ argv, code, stdout: typeof out === 'string' ? new Uint8Array(Buffer.from(out)) : enc(out), stderr });

/**
 * A stand-in for the regtest network, for tests: invoices, payments between
 * its nodes, on-chain sends and deposits, with lnd's answers' shape (its
 * 64-bit numbers as strings). Nothing here moves real coins.
 */
export class MockWallet {
  constructor({ payFrom = 'alice', invoiceOn = ['bob', 'carol'], onchain = 100_000_000 } = {}) {
    this.payFrom = payFrom;
    this.invoiceOn = invoiceOn;
    this.invoices = new Map(); // payment_request -> invoice
    this.txs = [];
    this.height = 600;
    this.onchain = onchain;
    this.channel = Object.fromEntries(invoiceOn.map((n) => [n, { local: 5_000_000, remote: 0 }]));
    this.calls = [];
    this.failNext = null;
  }

  log(argv) {
    this.calls.push(argv);
    return argv;
  }

  async addInvoice(node, { amount, memo, hash, expiry }) {
    const argv = this.log([`lncli (${node})`, 'addinvoice', `--amt=${amount}`, ...(memo !== undefined ? [`--memo=${memo}`] : []), ...(hash !== undefined ? [`--description_hash=${hash}`] : []), ...(expiry !== undefined ? [`--expiry=${expiry}`] : [])]);
    const preimage = randomBytes(32);
    const rHash = createHash('sha256').update(preimage).digest('hex');
    const req = `lnbcrt${amount}n1mock${rHash.slice(0, 40)}`;
    this.invoices.set(req, { node, amount, memo, hash, preimage: preimage.toString('hex'), rHash, state: 'OPEN', paidMsat: 0, req });
    return answer(argv, { r_hash: rHash, payment_request: req, add_index: String(this.invoices.size), payment_addr: randomBytes(32).toString('hex') });
  }

  /** An invoice made elsewhere (by someone outside the bank), for tests: whole sats or, given `msat`, any millisats. */
  external({ amount = 0, msat } = {}) {
    const preimage = randomBytes(32);
    const rHash = createHash('sha256').update(preimage).digest('hex');
    const req = `lnbcrt1mockext${rHash.slice(0, 40)}`;
    this.invoices.set(req, { node: 'carol', amount: msat !== undefined ? Math.floor(msat / 1000) : amount, msat: msat ?? amount * 1000, preimage: preimage.toString('hex'), rHash, state: 'OPEN', paidMsat: 0, req, external: true });
    return req;
  }

  async lookupInvoice(node, rhash) {
    const argv = this.log([`lncli (${node})`, 'lookupinvoice', `--rhash=${rhash}`]);
    const inv = [...this.invoices.values()].find((i) => i.rHash === rhash);
    if (!inv) return answer(argv, '[lncli] rpc error: code = Unknown desc = unable to locate invoice\n', 1);
    return answer(argv, { r_hash: inv.rHash, value: String(inv.amount), state: inv.state, settled: inv.state === 'SETTLED', amt_paid_sat: String(Math.floor(inv.paidMsat / 1000)), amt_paid_msat: String(inv.paidMsat) });
  }

  async decodePayReq(req) {
    const argv = this.log([`lncli (${this.payFrom})`, 'decodepayreq', `--pay_req=${req}`]);
    const inv = this.invoices.get(req);
    if (!inv) return answer(argv, '[lncli] rpc error: code = Unknown desc = invalid index of 1\n', 1);
    const msat = inv.msat ?? inv.amount * 1000;
    return answer(argv, { destination: '02' + 'ab'.repeat(32), payment_hash: inv.rHash, num_satoshis: String(Math.floor(msat / 1000)), num_msat: String(msat), description: inv.memo ?? '', description_hash: inv.hash ?? '', expiry: '86400' });
  }

  async payInvoice(req, { amount, feeLimit }) {
    const argv = this.log([`lncli (${this.payFrom})`, 'payinvoice', '--force', '--json', `--fee_limit=${feeLimit}`, ...(amount !== undefined ? [`--amt=${amount}`] : []), `--pay_req=${req}`]);
    const inv = this.invoices.get(req);
    if (this.failNext) {
      const why = this.failNext;
      this.failNext = null;
      return answer(argv, { payment_hash: inv?.rHash ?? '', status: 'FAILED', failure_reason: why, fee_sat: '0', fee_msat: '0' }, 1, '[lncli] payment failed\n');
    }
    if (!inv || inv.state !== 'OPEN') return answer(argv, { payment_hash: inv?.rHash ?? '', status: 'FAILED', failure_reason: 'FAILURE_REASON_INCORRECT_PAYMENT_DETAILS', fee_sat: '0', fee_msat: '0' }, 1);
    const sat = inv.amount || amount;
    const ch = this.channel[inv.node];
    if (ch && ch.local < sat) return answer(argv, { payment_hash: inv.rHash, status: 'FAILED', failure_reason: 'FAILURE_REASON_INSUFFICIENT_BALANCE', fee_sat: '0', fee_msat: '0' }, 1);
    if (ch) {
      ch.local -= sat;
      ch.remote += sat;
    }
    inv.state = 'SETTLED';
    inv.paidMsat = inv.msat ?? sat * 1000;
    return answer(argv, { payment_hash: inv.rHash, value: String(sat), creation_date: '0', fee: '0', payment_preimage: inv.preimage, value_sat: String(sat), value_msat: String(sat * 1000), payment_request: req, status: 'SUCCEEDED', fee_sat: '0', fee_msat: '0', htlcs: [] });
  }

  async sendCoins(address, { amount, feerate }) {
    const argv = this.log([`lncli (${this.payFrom})`, 'sendcoins', `--addr=${address}`, `--amt=${amount}`, `--sat_per_vbyte=${feerate}`]);
    if (!/^bcrt1[0-9a-z]{8,87}$/.test(address)) return answer(argv, '[lncli] rpc error: code = Unknown desc = decoded address is of unknown format\n', 1);
    if (amount + 141 * feerate > this.onchain) return answer(argv, '[lncli] rpc error: code = Unknown desc = insufficient funds available to construct transaction\n', 1);
    const txid = randomBytes(32).toString('hex');
    const fee = 141 * feerate;
    this.onchain -= amount + fee;
    this.txs.push({ tx_hash: txid, amount: String(-(amount + fee)), num_confirmations: 0, total_fees: String(fee), output_details: [{ output_type: 'SCRIPT_TYPE_WITNESS_V0_PUBKEY_HASH', address, output_index: '0', amount: String(amount), is_our_address: this.ours?.has(address) ?? false }] });
    return answer(argv, { txid });
  }

  async listChainTxns() {
    const argv = this.log([`lncli (${this.payFrom})`, 'listchaintxns']);
    return answer(argv, { transactions: this.txs });
  }

  async newAddress() {
    const argv = this.log([`lncli (${this.payFrom})`, 'newaddress', 'p2wkh']);
    const a = `bcrt1q${randomBytes(20).toString('hex').slice(0, 38)}`;
    (this.ours ??= new Set()).add(a);
    return answer(argv, { address: a });
  }

  /** Mine `n` blocks: every transaction gains n confirmations. */
  mine(n = 1) {
    this.height += n;
    for (const t of this.txs) t.num_confirmations += n;
  }

  async listChannels() {
    const argv = this.log([`lncli (${this.payFrom})`, 'listchannels']);
    return answer(argv, { channels: this.invoiceOn.map((n) => ({ active: true, remote_pubkey: `pub-${n}`, local_balance: String(this.channel[n].local), remote_balance: String(this.channel[n].remote) })) });
  }

  async getInfo(node) {
    const argv = this.log([`lncli (${node})`, 'getinfo']);
    return answer(argv, { identity_pubkey: `pub-${node}`, synced_to_chain: true, block_height: this.height });
  }

  async walletBalance(node) {
    return answer([`lncli (${node})`, 'walletbalance'], { confirmed_balance: String(node === this.payFrom ? this.onchain : 0), total_balance: String(node === this.payFrom ? this.onchain : 0) });
  }

  async channelBalance(node) {
    const local = node === this.payFrom ? Object.values(this.channel).reduce((s, c) => s + c.local, 0) : this.channel[node]?.remote ?? 0;
    return answer([`lncli (${node})`, 'channelbalance'], { balance: String(local), local_balance: { sat: String(local), msat: String(local * 1000) } });
  }

  async chain(ask, arg, verbose) {
    const argv = this.log(['btcctl', ask, ...(arg !== undefined ? [String(arg)] : []), ...(verbose !== undefined && ask !== 'getblockcount' && ask !== 'getblockhash' ? [String(verbose)] : [])]);
    if (ask === 'getblockcount') return answer(argv, `${this.height}\n`);
    return answer(argv, `${createHash('sha256').update(`${ask} ${arg}`).digest('hex')}\n`);
  }

  nodes() {
    return [this.payFrom, ...this.invoiceOn];
  }
}
