// The courier: one pass over every tray, carrying each waiting letter to
// where it names and bringing the answer back (Fable's rules 1, 2, 5, 6).
//
// In plain words: the postman carries bytes and nothing else. A letter to a
// relay goes out exactly as written, malformed or hostile, and what the
// relay answers comes back exactly as received, its status and headers
// beside it, so a relay's signed answer can be checked without trusting the
// postman. It never signs anything, never opens an act, and holds no
// player's MOR key. The one thing it checks about anyone's bytes is the
// signature on an order to the bank.
//
// The order, when several letters wait: in each pass, the letters waiting
// in each tray are taken in file name order (byte order), at most
// `perTrayPerPass` per tray; the trays take turns, one letter each, in the
// hosts' fixed order of trays, starting one tray further along at each
// pass (pass 0 starts with the first tray, pass 1 with the second, and so
// on round). A letter is carried at most once: a name already carried is
// never carried again. After the letters, the bank looks at open invoices
// and deposits.

import { join } from 'node:path';
import { sha256, unb64 } from '../kit/lib/core.mjs';
import { FormatError, readEnvelope } from '../kit/lib/format.mjs';
import { Bank } from './bank.mjs';
import { appendLine, now, readJson, writeJson } from './store.mjs';
import { Tray, TrayRefusal } from './trays.mjs';

export class Postman {
  constructor(config, { wallet = null, fetchImpl = fetch, say = () => {} } = {}) {
    this.cfg = config;
    this.wallet = wallet;
    this.fetch = fetchImpl;
    this.say = say;
    this.dir = config.postmanDir;
    this.logPath = join(this.dir, 'log', 'carried.jsonl');
    this.statePath = join(this.dir, 'state', 'carried.json');
    this.state = readJson(this.statePath, { pass: 0, carried: {} });
    this.trays = config.trays.map((t) => new Tray(config.root, t));
    this.bank = wallet ? new Bank({ dir: this.dir, wallet, config }) : null;
  }

  log(entry) {
    const e = { time: now(), pass: this.state.pass, ...entry };
    appendLine(this.logPath, e);
    this.say(e);
  }

  saveState() {
    writeJson(this.statePath, this.state);
  }

  carried(tray, stem) {
    return this.state.carried[tray]?.[stem];
  }

  mark(tray, stem, v) {
    (this.state.carried[tray] ??= {})[stem] = v;
    this.saveState();
  }

  /** One pass: every tray's waiting letters, in the order stated above; then the bank's look at what arrived. */
  async pass() {
    const n = this.state.pass;
    const queues = [];
    for (const t of this.trays) {
      try {
        t.open();
      } catch (e) {
        if (!(e instanceof TrayRefusal)) throw e;
        this.log({ tray: t.name, event: 'tray refused', reason: e.message });
        queues.push({ tray: t, letters: [] });
        continue;
      }
      const { letters, odd } = t.waiting(this.cfg.limits.settleSeconds * 1000);
      for (const o of odd) {
        const key = o.stem ?? `odd:${o.file}`;
        if (this.carried(t.name, key)) continue;
        this.mark(t.name, key, { at: now(), outcome: 'refused' });
        this.log({ tray: t.name, letter: o.file, event: 'refused', reason: o.reason });
        if (o.stem) this.answer(t, o.stem, { outcome: 'refused', reason: o.reason });
      }
      queues.push({ tray: t, letters: letters.filter((s) => !this.carried(t.name, s)).slice(0, this.cfg.limits.perTrayPerPass) });
    }
    const start = queues.length ? n % queues.length : 0;
    const order = [...queues.slice(start), ...queues.slice(0, start)];
    let carried = 0;
    for (let round = 0; order.some((q) => q.letters.length > round); round++) {
      for (const q of order) {
        const stem = q.letters[round];
        if (stem === undefined) continue;
        await this.carry(q.tray, stem);
        carried++;
      }
    }
    if (this.bank) {
      try {
        await this.bank.poll();
      } catch (e) {
        this.log({ event: 'bank poll failed', reason: String(e?.message ?? e) });
      }
      this.deliverNotices();
    }
    this.state.pass = n + 1;
    this.saveState();
    return carried;
  }

  deliverNotices() {
    for (const note of this.bank.notices.splice(0)) {
      const t = this.trays.find((x) => x.name === note.tray);
      if (!t) continue;
      const stem = `notice-${now().replace(/[-:.TZ]/g, '').slice(0, 17)}-${note.kind}-${Math.random().toString(16).slice(2, 8)}`;
      this.answer(t, stem, { outcome: 'notice', kind: note.kind, ...note.json }, note.body);
      this.log({ tray: t.name, letter: stem, event: 'notice', kind: note.kind, identity: note.json.identity });
    }
  }

  /** Write an answer; a failure to write it is logged, never thrown at the other trays. */
  answer(tray, stem, json, body = null) {
    const full = { answer: 1, letter: stem, carriedAt: now(), pass: this.state.pass, ...json };
    if (body) {
      full.bodyFile = `${stem}.answer.body`;
      full.bodySha256 = sha256(body);
      full.bodyBytes = body.length;
    }
    try {
      tray.answer(stem, full, body);
    } catch (e) {
      this.log({ tray: tray.name, letter: stem, event: 'answer not written', reason: e.message });
    }
  }

  /** Carry one letter. It is marked as taken before anything is sent, so it is never carried twice. */
  async carry(tray, stem) {
    const lim = this.cfg.limits;
    let raw;
    try {
      raw = tray.envelope(stem, lim.envelopeBytes);
    } catch (e) {
      if (!(e instanceof TrayRefusal)) throw e;
      return this.refuse(tray, stem, null, e.message);
    }
    const envSha = sha256(raw);
    let env;
    try {
      env = readEnvelope(JSON.parse(Buffer.from(raw).toString('utf8')), Object.keys(this.cfg.relays), this.cfg.paths);
    } catch (e) {
      if (!(e instanceof FormatError) && !(e instanceof SyntaxError)) throw e;
      return this.refuse(tray, stem, envSha, e instanceof SyntaxError ? `the letter is not JSON (${e.message})` : e.message);
    }
    let body = null;
    if (env.kind === 'relay' && env.body === 'file') {
      try {
        body = tray.body(stem, lim.bodyBytes);
      } catch (e) {
        if (!(e instanceof TrayRefusal)) throw e;
        return this.refuse(tray, stem, envSha, e.message);
      }
    } else if (env.kind === 'relay' && env.body === 'inline') {
      body = unb64(env.base64);
      if (body.length > lim.bodyBytes) return this.refuse(tray, stem, envSha, `the body is ${body.length} bytes, over the limit of ${lim.bodyBytes}`);
    }
    this.mark(tray.name, stem, { at: now(), envelope: envSha, outcome: 'taken' });
    const t0 = Date.now();
    let result;
    if (env.kind === 'relay') result = await this.toRelay(env, body);
    else if (env.kind === 'chain') result = await this.toChain(env);
    else result = await this.toBank(tray, env);
    const ms = Date.now() - t0;
    this.mark(tray.name, stem, { at: now(), envelope: envSha, outcome: result.json.outcome });
    this.answer(tray, stem, { ...result.json, ...(env.kind === 'relay' ? { sentBodySha256: body ? sha256(body) : null, sentBodyBytes: body?.length ?? 0 } : {}) }, result.body);
    this.log({
      tray: tray.name,
      letter: stem,
      event: 'carried',
      envelope: envSha,
      to: env.kind === 'relay' ? env.to : env.kind,
      ...(env.kind === 'relay' ? { method: env.method, path: env.path, sent: body ? { bytes: body.length, sha256: sha256(body) } : null } : {}),
      ...(env.kind === 'chain' ? { ask: env.ask } : {}),
      outcome: result.json.outcome,
      ...(result.json.status !== undefined ? { status: result.json.status } : {}),
      ...(result.json.identity ? { identity: result.json.identity, order: result.json.order } : {}),
      ...(result.json.reason ? { reason: result.json.reason } : {}),
      answer: result.body ? { bytes: result.body.length, sha256: sha256(result.body) } : null,
      ms,
    });
  }

  refuse(tray, stem, envSha, reason) {
    this.mark(tray.name, stem, { at: now(), envelope: envSha, outcome: 'refused' });
    this.answer(tray, stem, { outcome: 'refused', reason });
    this.log({ tray: tray.name, letter: stem, event: 'refused', envelope: envSha, reason });
  }

  /** To a relay: the bytes as written, the answer as received. Redirects are not followed. */
  async toRelay(env, body) {
    const base = this.cfg.relays[env.to].replace(/\/+$/, '');
    const url = `${base}${env.path}`;
    const head = { to: env.to, method: env.method, path: env.path };
    const headers = {};
    if (env.method === 'POST') headers['content-type'] = env.contentType ?? 'application/cbor';
    if (env.range) headers.range = env.range;
    let res;
    try {
      res = await this.fetch(url, { method: env.method, headers, body: env.method === 'POST' ? body : undefined, redirect: 'manual', signal: AbortSignal.timeout(this.cfg.limits.timeoutSeconds * 1000) });
    } catch (e) {
      return { json: { outcome: 'unreachable', ...head, reason: `the relay did not answer (${e?.cause?.code ?? e?.name ?? 'error'})` }, body: null };
    }
    const { bytes, truncated } = await readCapped(res, this.cfg.limits.answerBytes);
    const hs = {};
    res.headers.forEach((v, k) => {
      hs[k] = v;
    });
    return { json: { outcome: 'answered', ...head, status: res.status, headers: hs, ...(truncated ? { truncated: `the answer was longer than ${this.cfg.limits.answerBytes} bytes: only that much is here` } : {}) }, body: bytes };
  }

  async toChain(env) {
    const head = { to: 'chain', ask: env.ask, ...(env.arg !== undefined ? { arg: env.arg } : {}) };
    if (!this.wallet) return { json: { outcome: 'refused', ...head, reason: 'the hosts have not connected the chain to this postman' }, body: null };
    const w = await this.wallet.chain(env.ask, env.arg, env.verbose);
    return { json: { outcome: w.code === 0 ? 'answered' : 'failed', ...head, command: w.argv, exit: w.code, ...(w.stderr ? { stderr: w.stderr } : {}) }, body: w.stdout };
  }

  async toBank(tray, env) {
    if (!this.bank) return { json: { outcome: 'refused', to: 'bank', reason: 'the hosts have not connected a wallet to this postman' }, body: null };
    const r = await this.bank.handle(tray.name, env);
    return { json: { outcome: r.outcome, to: 'bank', ...r.json }, body: r.body };
  }
}

async function readCapped(res, cap) {
  if (!res.body) return { bytes: new Uint8Array(), truncated: false };
  const reader = res.body.getReader();
  const parts = [];
  let size = 0;
  let truncated = false;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (size + value.length > cap) {
      parts.push(value.subarray(0, cap - size));
      size = cap;
      truncated = true;
      await reader.cancel();
      break;
    }
    parts.push(value);
    size += value.length;
  }
  return { bytes: new Uint8Array(Buffer.concat(parts)), truncated };
}
