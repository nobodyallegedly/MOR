// The hosts' bank of round two: one account per identity, kept by the
// postman over the hosts' regtest nodes (`BANK-ORDERS.md`).
//
// In plain words: the hosts hold the coins, openly, this round. Each
// player's identity has an account here, opened from that player's own
// tray. Money moves only on an order the identity signed with its own MOR
// signing key, checked with the core library against the identity's chain;
// that check is the one thing the postman checks about anyone's bytes.
// Payments to other players are real Lightning payments, made by the nodes:
// the payee asks the bank for an invoice, the payer orders the bank to pay
// it, and the preimage is real. Sends to an address are real on-chain
// transactions. What the nodes answer comes back to the tray byte for byte.
// Whole sats only. Every movement is in the bank's journal.

import fs from 'node:fs';
import { join } from 'node:path';
import { BANK, SPECS, b64, errorText, hex, mor, unb64 } from '../kit/lib/core.mjs';
import { FormatError, readOrder } from '../kit/lib/format.mjs';
import { appendLine, now, readJson, writeJson } from './store.mjs';
import { lastJson, toInt } from './wallet.mjs';

/** A refusal by the bank: nothing moved. */
export class BankRefusal extends Error {}

const refuse = (m) => {
  throw new BankRefusal(m);
};

export class Bank {
  constructor({ dir, wallet, config }) {
    this.dir = dir;
    this.wallet = wallet;
    this.cfg = config.bank;
    this.funding = config.funding;
    this.config = config;
    this.statePath = join(dir, 'bank', 'state.json');
    this.journalPath = join(dir, 'bank', 'journal.jsonl');
    this.state = readJson(this.statePath, { accounts: {}, invoices: {}, addresses: {}, deposits: {}, funded: {}, seq: 0 });
    this.notices = [];
  }

  save() {
    writeJson(this.statePath, this.state);
  }

  /** A movement, or any change to an account: written to the journal before the state. */
  journal(entry) {
    appendLine(this.journalPath, { time: now(), ...entry });
  }

  // ------------------------------------------------------------ the one check

  /**
   * Check a signed order against its signer's identity, with the core
   * library: the order is an everyday act of the bank's spec, public, signed
   * by the identity's signing key as its chain stands (the chain acts the
   * bank holds for it, extended by those the letter carries), bound to the
   * newest chain act the bank knows. Returns the identity, the order, the
   * chain to keep and its payload.
   */
  verify(orderBytes, chainBytes) {
    let d;
    try {
      d = mor.describeAct(orderBytes);
    } catch (e) {
      refuse(`the order is not an act the core library can read (${errorText(e)})`);
    }
    if (d.spec !== BANK.spec || d.type !== BANK.type) refuse(`the order is not a bank order: its spec and type must be ${BANK.spec}, ${BANK.type}`);
    if (!d.public) refuse('a bank order is a public act: the bank must read it');
    const identity = d.signer;
    if (typeof identity !== 'string') refuse('the order names no signer');
    const acct = this.state.accounts[identity];
    const known = (acct?.chain ?? []).map(unb64);
    const v = new mor.Verifier(SPECS.identity);
    const byId = new Map();
    for (const a of [...known, ...chainBytes]) {
      try {
        byId.set(v.add(a), a);
      } catch {
        // not an act: it adds nothing
      }
    }
    const r = v.resolve(identity);
    if (r.stop !== 'end' && r.stop !== 'pending') refuse(`the identity's chain, as the bank holds it with what this letter carries, cannot be followed: ${r.stop}${r.contested?.length ? ' (contested)' : ''}. Send its chain acts, and its homes' receipts for its rotations, in "chain"`);
    const links = r.links.map((l) => l.act);
    if (acct && acct.links.some((id, i) => links[i] !== id)) refuse('the chain this letter carries does not extend the one the bank already holds for this identity');
    const latest = links[links.length - 1];
    if (d.binding !== latest)
      refuse(
        `an order is signed with the newest key the bank can show for the identity: bound to ${latest}; this one is bound to ${d.binding}` +
          (r.stop === 'pending' ? `. A rotation waits for proof (${r.waiting.join(', ')}): a rotation counts only once its homes' receipts show it. Ask its homes for /identity/IDENTITY and /identity/OPERATOR, keep them (identity evidence), and send the order again` : ''),
      );
    const oid = v.add(orderBytes);
    const status = v.status(oid);
    if (status !== 'valid') refuse(`the order's signature does not check against the identity's chain: the core library says "${status}"`);
    let m;
    try {
      m = mor.cborDecode(d.payload);
    } catch (e) {
      refuse(`the order's payload is not CBOR the bank reads: amounts are whole sats only, unsigned integers (${errorText(e)})`);
    }
    let o;
    try {
      o = readOrder(m);
    } catch (e) {
      if (e instanceof FormatError) refuse(e.message);
      throw e;
    }
    // Everything given that the verifier could read is kept (at most 256 acts), so the next order can be checked from it alone.
    const keep = [...byId.values()].slice(0, 256).map((a) => b64(a));
    return { identity, order: o, orderId: oid, chain: keep, links };
  }

  // ---------------------------------------------------------------- orders

  /** One bank letter from `tray`: `{ outcome, json, body }` for its answer. */
  async handle(tray, env) {
    let v;
    try {
      v = this.verify(unb64(env.order), env.chain.map(unb64));
    } catch (e) {
      if (e instanceof BankRefusal) return this.refused(e.message);
      throw e;
    }
    const { identity, order: o } = v;
    const head = { identity, order: { id: v.orderId, n: o.n, do: o.do } };
    if (o.tray !== tray) return this.refused(`this order names the tray "${o.tray}"; it came from the tray "${tray}"`, head);
    let acct = this.state.accounts[identity];
    if (o.do === 'open') {
      if (acct) return this.refused(`an account for this identity is already open, in the tray "${acct.tray}"`, head);
      acct = { identity, tray, opened: now(), seq: ++this.state.seq, chain: v.chain, links: v.links, lastN: o.n, balance: 0, held: 0 };
      this.journal({ kind: 'open', identity, tray, order: v.orderId, n: o.n });
      this.state.accounts[identity] = acct;
      this.save();
      return this.done(head, acct, {});
    }
    if (!acct) return this.refused('no account is open for this identity: send an order to open one first', head);
    if (acct.tray !== tray) return this.refused(`this identity's account is kept for the tray "${acct.tray}", not "${tray}"`, head);
    if (o.n <= acct.lastN) return this.refused(`order number ${o.n} is spent: the last one accepted was ${acct.lastN}. Each order's "n" is larger than the last`, head);
    acct.lastN = o.n;
    acct.chain = v.chain;
    acct.links = v.links;
    this.journal({ kind: 'order', identity, order: v.orderId, n: o.n, do: o.do });
    this.save();
    try {
      if (o.do === 'balance') return this.done(head, acct, { recent: this.recent(identity) });
      if (o.do === 'invoice') return await this.invoice(head, acct, o);
      if (o.do === 'pay') return await this.pay(head, acct, o);
      if (o.do === 'send') return await this.send(head, acct, o);
      if (o.do === 'address') return await this.address(head, acct);
    } catch (e) {
      if (e instanceof BankRefusal) return this.refused(e.message, head);
      throw e;
    }
    return this.refused(`no such order: ${o.do}`, head);
  }

  refused(reason, head = {}) {
    return { outcome: 'refused', json: { ...head, reason, moved: 'nothing' }, body: null };
  }

  done(head, acct, extra, w = null) {
    return { outcome: 'done', json: { ...head, ...extra, account: this.view(acct), ...(w ? { wallet: wallet(w) } : {}) }, body: w?.stdout ?? null };
  }

  failed(head, acct, reason, w) {
    return { outcome: 'failed', json: { ...head, reason, moved: 'nothing', account: this.view(acct), wallet: wallet(w) }, body: w?.stdout ?? null };
  }

  view(acct) {
    return { tray: acct.tray, balance: acct.balance, held: acct.held, available: acct.balance - acct.held, lastN: acct.lastN };
  }

  available(acct) {
    return acct.balance - acct.held;
  }

  recent(identity, n = 20) {
    try {
      const lines = readJsonl(this.journalPath).filter((e) => e.identity === identity || e.payee === identity);
      return lines.slice(-n);
    } catch {
      return [];
    }
  }

  /** Which node makes an invoice: of the nodes invoices are made on, the one the paying node can send most to. */
  async pickNode() {
    const nodes = this.wallet.invoiceOn;
    try {
      const ch = lastJson((await this.wallet.listChannels()).stdout)?.channels ?? [];
      let best = null;
      for (const n of nodes) {
        const key = lastJson((await this.wallet.getInfo(n)).stdout)?.identity_pubkey;
        const room = ch.filter((c) => c.remote_pubkey === key && c.active !== false).reduce((s, c) => s + (toInt(c.local_balance) ?? 0), 0);
        if (!best || room > best.room) best = { node: n, room };
      }
      return best?.node ?? nodes[0];
    } catch {
      return nodes[0];
    }
  }

  async invoice(head, acct, o) {
    if (o.memo !== undefined && Buffer.byteLength(o.memo) > 256) refuse('a memo is at most 256 bytes');
    const expiry = o.expiry ?? this.cfg.invoiceExpiry;
    if (expiry < 60 || expiry > this.cfg.maxInvoiceExpiry) refuse(`an invoice's expiry is from 60 to ${this.cfg.maxInvoiceExpiry} seconds`);
    const node = await this.pickNode();
    const w = await this.wallet.addInvoice(node, { amount: o.amount, memo: o.memo, hash: o.hash ? hex(o.hash) : undefined, expiry });
    const j = lastJson(w.stdout);
    if (w.code !== 0 || !j?.r_hash || !j?.payment_request) return this.failed(head, acct, 'the node did not make the invoice', w);
    const rHash = normHash(j.r_hash);
    this.state.invoices[rHash] = { identity: acct.identity, tray: acct.tray, node, amount: o.amount, request: j.payment_request, state: 'open', made: now() };
    this.journal({ kind: 'invoice', identity: acct.identity, node, amount: o.amount, payment_hash: rHash });
    this.save();
    return this.done(head, acct, { invoice: { payment_hash: rHash, payment_request: j.payment_request, amount: o.amount, node } }, w);
  }

  async pay(head, acct, o) {
    const dw = await this.wallet.decodePayReq(o.invoice);
    const dec = lastJson(dw.stdout);
    if (dw.code !== 0 || !dec) return this.failed(head, acct, 'the node could not read this invoice', dw);
    const msat = toInt(dec.num_msat) ?? (toInt(dec.num_satoshis) ?? 0) * 1000;
    if (msat % 1000 !== 0) refuse(`whole sats only: this invoice asks ${msat} millisats, which is not a whole number of sats`);
    const asked = msat / 1000;
    if (asked === 0 && o.amount === undefined) refuse('this invoice names no amount: the order must name one, in whole sats');
    if (asked > 0 && o.amount !== undefined && o.amount !== asked) refuse(`this invoice asks ${asked} sats; the order says ${o.amount}`);
    const amount = asked || o.amount;
    const feeLimit = o.fee ?? this.cfg.defaultFeeLimit;
    const need = amount + feeLimit;
    if (need > this.available(acct)) refuse(`not enough: ${amount} sats and up to ${feeLimit} in fees need ${need}; ${this.available(acct)} are available`);
    const hash = normHash(dec.payment_hash ?? '');
    acct.held += need;
    this.journal({ kind: 'hold', identity: acct.identity, amount: need, for: 'pay', payment_hash: hash });
    this.save();
    const w = await this.wallet.payInvoice(o.invoice, { amount: asked ? undefined : amount, feeLimit });
    const p = lastJson(w.stdout);
    if (p?.status === 'SUCCEEDED') {
      const feeMsat = toInt(p.fee_msat) ?? (toInt(p.fee_sat) ?? 0) * 1000;
      const fee = Math.ceil(feeMsat / 1000);
      acct.held -= need;
      acct.balance -= amount + fee;
      this.journal({ kind: 'pay', identity: acct.identity, amount, fee, fee_msat: feeMsat, payment_hash: hash, preimage: p.payment_preimage, balance: acct.balance });
      this.save();
      if (this.state.invoices[hash]) await this.settle(hash);
      return this.done(head, acct, { paid: { amount, fee, ...(feeMsat % 1000 ? { feeMsat, note: 'the fee, in millisats, was rounded up to whole sats' } : {}), payment_hash: hash, preimage: p.payment_preimage } }, w);
    }
    if (p?.status === 'FAILED' || (w.code !== 0 && p?.status !== 'IN_FLIGHT')) {
      acct.held -= need;
      this.journal({ kind: 'release', identity: acct.identity, amount: need, for: 'pay', payment_hash: hash, why: p?.failure_reason ?? 'failed' });
      this.save();
      return this.failed(head, acct, `the payment failed${p?.failure_reason ? `: ${p.failure_reason}` : ''}`, w);
    }
    this.journal({ kind: 'unsettled', identity: acct.identity, amount: need, payment_hash: hash });
    this.save();
    return { outcome: 'unsettled', json: { ...head, reason: `the node has not said whether the payment went through: ${need} sats stay held until the hosts settle it`, account: this.view(acct), wallet: wallet(w) }, body: w.stdout };
  }

  async send(head, acct, o) {
    if (!/^[A-Za-z0-9]{14,90}$/.test(o.address)) refuse('an address is 14 to 90 letters and digits');
    const feerate = o.feerate ?? this.cfg.defaultFeerate;
    if (feerate < 1 || feerate > this.cfg.maxFeerate) refuse(`the fee rate is from 1 to ${this.cfg.maxFeerate} sats per virtual byte`);
    const reserve = this.cfg.onchainFeeReserve * feerate;
    const need = o.amount + reserve;
    if (need > this.available(acct)) refuse(`not enough: ${o.amount} sats and up to ${reserve} in fees need ${need}; ${this.available(acct)} are available`);
    acct.held += need;
    this.journal({ kind: 'hold', identity: acct.identity, amount: need, for: 'send', address: o.address });
    this.save();
    const w = await this.wallet.sendCoins(o.address, { amount: o.amount, feerate });
    const j = lastJson(w.stdout);
    acct.held -= need;
    if (w.code !== 0 || !j?.txid) {
      this.journal({ kind: 'release', identity: acct.identity, amount: need, for: 'send' });
      this.save();
      return this.failed(head, acct, 'the node did not send', w);
    }
    let fee = null;
    const t = lastJson((await this.wallet.listChainTxns()).stdout);
    const tx = t?.transactions?.find((x) => x.tx_hash === j.txid);
    if (tx) fee = toInt(tx.total_fees);
    if (fee === null || fee < 0 || fee > reserve) fee = reserve;
    acct.balance -= o.amount + fee;
    this.journal({ kind: 'send', identity: acct.identity, amount: o.amount, fee, txid: j.txid, address: o.address, balance: acct.balance });
    this.save();
    return this.done(head, acct, { sent: { amount: o.amount, fee, txid: j.txid, address: o.address } }, w);
  }

  async address(head, acct) {
    const w = await this.wallet.newAddress();
    const j = lastJson(w.stdout);
    if (w.code !== 0 || !j?.address) return this.failed(head, acct, 'the node did not give an address', w);
    this.state.addresses[j.address] = acct.identity;
    this.journal({ kind: 'address', identity: acct.identity, address: j.address });
    this.save();
    return this.done(head, acct, { address: j.address, note: `coins sent to this address are credited to this account once ${this.cfg.confirmations} block(s) confirm them` }, w);
  }

  // --------------------------------------------------------------- polling

  /** Credit an invoice the node shows paid. */
  async settle(hash) {
    const inv = this.state.invoices[hash];
    if (!inv || inv.state !== 'open') return;
    const w = await this.wallet.lookupInvoice(inv.node, hash);
    const j = lastJson(w.stdout);
    if (!j) return;
    if (j.state === 'SETTLED' || j.settled === true) {
      const msat = toInt(j.amt_paid_msat) ?? (toInt(j.amt_paid_sat) ?? 0) * 1000;
      const sats = Math.floor(msat / 1000);
      const acct = this.state.accounts[inv.identity];
      inv.state = 'settled';
      inv.paid = sats;
      acct.balance += sats;
      this.journal({ kind: 'receive', identity: inv.identity, amount: sats, ...(msat % 1000 ? { millisatsLeft: msat % 1000 } : {}), payment_hash: hash, node: inv.node, balance: acct.balance });
      this.save();
      this.notices.push({ tray: inv.tray, kind: 'paid', json: { identity: inv.identity, invoice: { payment_hash: hash, amount: inv.amount, paid: sats }, account: this.view(acct) }, body: w.stdout });
    } else if (j.state === 'CANCELED') {
      inv.state = 'canceled';
      this.journal({ kind: 'invoice-canceled', identity: inv.identity, payment_hash: hash });
      this.save();
    }
  }

  /** Look at open invoices and deposits to the bank's addresses; credit what has arrived. */
  async poll() {
    if (!this.wallet) return;
    for (const [hash, inv] of Object.entries(this.state.invoices)) if (inv.state === 'open') await this.settle(hash);
    if (!Object.keys(this.state.addresses).length) return;
    const t = lastJson((await this.wallet.listChainTxns()).stdout);
    for (const tx of t?.transactions ?? []) {
      if ((tx.num_confirmations ?? 0) < this.cfg.confirmations) continue;
      for (const out of tx.output_details ?? []) {
        const who = this.state.addresses[out.address];
        if (!who || out.is_our_address === false) continue;
        const key = `${tx.tx_hash}:${out.output_index}`;
        if (this.state.deposits[key]) continue;
        const sats = toInt(out.amount);
        if (sats === null || sats <= 0) continue;
        const acct = this.state.accounts[who];
        acct.balance += sats;
        this.state.deposits[key] = { identity: who, amount: sats };
        this.journal({ kind: 'deposit', identity: who, amount: sats, txid: tx.tx_hash, vout: out.output_index, address: out.address, balance: acct.balance });
        this.save();
        this.notices.push({ tray: acct.tray, kind: 'deposit', json: { identity: who, deposit: { txid: tx.tx_hash, vout: out.output_index, amount: sats, address: out.address }, account: this.view(acct) }, body: null });
      }
    }
  }

  // ---------------------------------------------------------------- funding

  /**
   * The starting money, credited by the hosts (`postman fund`): each company
   * tray's first account opened gets the company sum, once; each identity a
   * public tray lists in its addresses.md (identity, budget; or identity,
   * address, budget) gets its budget, once, when its account is open in
   * that tray. Without `send`, only says what it would credit.
   */
  fund({ send = false, readTop }) {
    const plan = [];
    const opened = (tray) => Object.values(this.state.accounts).filter((a) => a.tray === tray).sort((a, b) => a.seq - b.seq);
    // A tray may be both a company and a public window (a DAO's members): it gets the company sum once, and each
    // line of its addresses.md once. A tray named twice in a list, or an identity listed twice, is credited once.
    const planned = new Set();
    for (const tray of new Set(this.config.companies)) {
      const key = `company:${tray}`;
      if (this.state.funded[key]) continue;
      const first = opened(tray)[0];
      if (!first) plan.push({ tray, wait: 'no account is open in this tray yet' });
      else {
        plan.push({ tray, key, identity: first.identity, amount: this.funding.companySats });
        planned.add(key);
      }
    }
    for (const tray of new Set(this.config.public)) {
      let text;
      try {
        text = Buffer.from(readTop(tray, this.funding.publicFile)).toString('utf8');
      } catch (e) {
        plan.push({ tray, wait: `no ${this.funding.publicFile} to read (${errorText(e)})` });
        continue;
      }
      for (const line of parseBudgets(text)) {
        if (line.error) {
          plan.push({ tray, skip: line.error, line: line.raw });
          continue;
        }
        const key = `public:${tray}:${line.identity}`;
        if (this.state.funded[key]) continue;
        if (planned.has(key)) {
          plan.push({ tray, identity: line.identity, skip: `listed again in ${this.funding.publicFile}: an identity is credited once, from its first line` });
          continue;
        }
        const a = this.state.accounts[line.identity];
        if (!a) plan.push({ tray, identity: line.identity, wait: 'its account is not open yet' });
        else if (a.tray !== tray) plan.push({ tray, identity: line.identity, skip: `its account is kept for the tray "${a.tray}"` });
        else {
          plan.push({ tray, key, identity: line.identity, amount: line.sats });
          planned.add(key);
        }
      }
    }
    // Rewards from the hosts (round two, day three): lines "identity, label, sats" in the hosts tray's rewards
    // file; each identity is credited once per label, into its own account, wherever it was opened.
    if (this.funding.rewardsFile && this.funding.rewardsTray) {
      let text = null;
      try {
        text = Buffer.from(readTop(this.funding.rewardsTray, this.funding.rewardsFile)).toString('utf8');
      } catch {
        // no rewards file: nothing to credit
      }
      for (const raw of (text ?? '').split('\n')) {
        const line = raw.replace(/#.*/, '').trim();
        if (!line) continue;
        const f = line.split(',').map((x) => x.trim());
        const [identity, label, sats] = f;
        if (f.length !== 3 || !/^[0-9a-f]{64}$/.test(identity) || !/^[a-z0-9-]{1,40}$/.test(label) || !/^\d+$/.test(sats) || Number(sats) < 1) {
          plan.push({ tray: this.funding.rewardsTray, skip: 'a reward line is "identity, label, sats"', line: raw });
          continue;
        }
        const key = `reward:${label}:${identity}`;
        if (this.state.funded[key] || planned.has(key)) continue;
        const a = this.state.accounts[identity];
        if (!a) plan.push({ tray: this.funding.rewardsTray, identity, wait: 'its account is not open yet' });
        else {
          plan.push({ tray: a.tray, key, identity, amount: Number(sats), reward: label });
          planned.add(key);
        }
      }
    }
    if (send) {
      for (const p of plan) {
        if (!p.key || this.state.funded[p.key]) continue;
        const a = this.state.accounts[p.identity];
        a.balance += p.amount;
        this.state.funded[p.key] = { amount: p.amount, at: now() };
        this.journal({ kind: 'fund', identity: p.identity, tray: p.tray, amount: p.amount, balance: a.balance, as: p.key.split(':')[0] });
        this.notices.push({ tray: p.tray, kind: 'funded', json: { identity: p.identity, funded: p.amount, as: p.key.startsWith('company:') ? 'the company sum' : p.reward ? `a reward from the hosts (${p.reward})` : `its line in ${this.funding.publicFile}`, account: this.view(a) }, body: null });
        p.done = true;
      }
      this.save();
    }
    return plan;
  }

  /** What the bank holds, account by account, beside what the nodes hold. */
  async summary() {
    const accounts = Object.values(this.state.accounts).map((a) => ({ identity: a.identity, tray: a.tray, ...this.view(a) }));
    const total = accounts.reduce((s, a) => s + a.balance, 0);
    const nodes = {};
    if (this.wallet) {
      for (const n of this.wallet.nodes()) {
        nodes[n] = {
          onchain: lastJson((await this.wallet.walletBalance(n)).stdout)?.confirmed_balance ?? null,
          channels: lastJson((await this.wallet.channelBalance(n)).stdout)?.local_balance?.sat ?? null,
        };
      }
    }
    return { accounts, total, openInvoices: Object.values(this.state.invoices).filter((i) => i.state === 'open').length, nodes };
  }
}

/** The wallet's answer as the answer's JSON names it; its bytes go verbatim in the answer's body. */
function wallet(w) {
  return { command: w.argv, exit: w.code, ...(w.stderr ? { stderr: scrub(w.stderr) } : {}), stdoutBytes: w.stdout?.length ?? 0 };
}

/** A node's error message, with anything naming the hosts' machine (a path, an address and port) taken out. */
export function scrub(text) {
  return text
    .replace(/(?:~|\/(?:Users|home|private|var|tmp|opt|root|Volumes)\b)[^\s'"]*/g, '[a path on the hosts’ machine]')
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?\b|\blocalhost(?::\d+)?\b/g, '[an address on the hosts’ machine]')
    .slice(0, 2000);
}

/** lnd writes a payment hash in hex in some answers and base64 in others: always hex here. */
function normHash(h) {
  if (/^[0-9a-f]{64}$/.test(h)) return h;
  const b = Buffer.from(h, 'base64');
  return b.length === 32 ? b.toString('hex') : h;
}

function readJsonl(path) {
  return fs
    .readFileSync(path, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

/** The public windows' budgets: "identity, budget" or "identity, address, budget" per line; # starts a comment. */
export function parseBudgets(text) {
  const out = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/`/g, '').trim();
    if (!line || line.startsWith('#') || /^[-|: ]+$/.test(line)) continue;
    const f = line.split(',').map((x) => x.trim());
    const identity = f[0].toLowerCase();
    if (!/^[0-9a-f]{64}$/.test(identity)) {
      out.push({ raw, error: 'the first field is not an identity hash (64 hexadecimal characters)' });
      continue;
    }
    if (f.length < 2) {
      out.push({ raw, error: 'no budget' });
      continue;
    }
    const budget = (f.length === 2 ? f[1] : f.slice(2).join('')).replace(/[\s_']/g, '').replace(/sats?$/i, '');
    if (!/^\d+$/.test(budget) || !Number.isSafeInteger(Number(budget)) || Number(budget) < 1) {
      out.push({ raw, error: 'the budget is not a whole number of sats' });
      continue;
    }
    out.push({ identity, sats: Number(budget) });
  }
  return out;
}
