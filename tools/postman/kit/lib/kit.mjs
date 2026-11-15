// The players' kit: test identities and their keys (kept in the player's
// own folder), acts made, checked and signed by the core library, letters
// for the postman, and the answers it brings back. Offline: nothing here
// opens a network connection.
//
// TEST IDENTITIES ONLY. A test identity holds its chain key (its safety key)
// in software, in this folder: never for a real identity.

import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync, chmodSync, lstatSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { BANK, SPECS, b64, errorText, hex, isHash, mor, plain, sha256, textPayload, unb64, unhex } from './core.mjs';
import { ANSWER_BODY_SUFFIX, ANSWER_SUFFIX, BODY_SUFFIX, FormatError, LETTER_SUFFIX, LETTER_VERSION, NAME, readOrder } from './format.mjs';

export const TEST_LABEL = 'MOR TEST IDENTITY (round two). The chain key is held in software, in this folder: a test identity, never for a real one.';

/** The player's folder: the one holding this kit, unless MOR_FOLDER says otherwise. */
export function folderOf(env = process.env) {
  if (env.MOR_FOLDER) return resolve(env.MOR_FOLDER);
  return resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
}

export class Kit {
  constructor(folder, tray = basename(folder)) {
    this.folder = folder;
    this.tray = tray;
    if (!NAME.test(tray)) throw new Error(`the tray's name "${tray}" is not a tray name: set MOR_TRAY`);
  }

  path(...p) {
    return join(this.folder, ...p);
  }

  dir(name) {
    const d = this.path(name);
    if (!existsSync(d)) mkdirSync(d, { recursive: true });
    return d;
  }

  // ------------------------------------------------------------ identities

  keyFile(name) {
    if (!NAME.test(name)) throw new Error(`an identity's name here is 1 to 64 of a-z, A-Z, 0-9, "-" and "_": "${name}" is not`);
    return join(this.dir('keys'), `${name}.json`);
  }

  load(name) {
    const f = this.keyFile(name);
    if (!existsSync(f)) throw new Error(`no identity named "${name}" in keys/ (make one with: identity new ${name} --home OPERATOR@HINT)`);
    return JSON.parse(readFileSync(f, 'utf8'));
  }

  save(name, id) {
    const f = this.keyFile(name);
    const tmp = `${f}.tmp`;
    writeFileSync(tmp, JSON.stringify(id, null, 2) + '\n', { mode: 0o600 });
    renameSync(tmp, f);
    try {
      chmodSync(f, 0o600);
    } catch {
      // some shared folders keep their own permissions
    }
  }

  names() {
    if (!existsSync(this.path('keys'))) return [];
    return readdirSync(this.path('keys'))
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.slice(0, -5))
      .sort();
  }

  /**
   * A new test identity: a genesis signed by a fresh signing key, committing
   * a fresh chain key, naming the homes given (each `{ operator, hint }`: a
   * home's operator identity, from its /info, and how to reach it).
   */
  newIdentity(name, homes, { scheme = 2, rule = null } = {}) {
    if (existsSync(this.keyFile(name))) throw new Error(`an identity named "${name}" already exists in keys/: nothing was made`);
    if (!homes.length) throw new Error('a genesis names at least one home (--home OPERATOR@HINT): ask a home for its /info through the postman');
    const signing = mor.newSigningSecret();
    const chainKey = mor.newTestChainKey(scheme);
    const genesis = mor.makeGenesis({ identitySpec: SPECS.identity, signingSecret: signing, chainKeyScheme: chainKey.scheme, chainKeyCommit: chainKey.commit, homes, rule });
    const id = mor.actId(genesis);
    const f = {
      label: TEST_LABEL,
      identity: id,
      binding: id,
      signingSecret: hex(signing),
      chainKey: { scheme: chainKey.scheme, seeds: hex(chainKey.seeds) },
      chain: [b64(genesis)],
      homes,
      rule,
      lines: { public: [], private: [], bank: [] },
      bankN: 0,
    };
    this.save(name, f);
    this.saveAct(genesis);
    return f;
  }

  /**
   * A rotation: a new signing key and a new committed chain key, signed by
   * the chain key the last chain act committed (revealed now). Every
   * non-empty line is kept (Identity rule 35). Test identities only.
   */
  rotate(name, { homes, scheme } = {}) {
    const f = this.load(name);
    const newSigning = mor.newSigningSecret();
    const next = mor.newTestChainKey(scheme ?? f.chainKey.scheme);
    const chain = f.chain.map(unb64);
    const kept = Object.values(f.lines)
      .filter((l) => l.length)
      .map((l) => ({ act: l[l.length - 1], position: l.length, summary: mor.runningSummary(l) }));
    const rotation = mor.makeRotation({
      identitySpec: SPECS.identity,
      identity: f.identity,
      previous: mor.actId(chain[chain.length - 1]),
      position: chain.length,
      chainKeyScheme: f.chainKey.scheme,
      chainKeySeeds: unhex(f.chainKey.seeds),
      newSigningPublic: mor.signingPublic(newSigning),
      nextChainKeyScheme: next.scheme,
      nextChainKeyCommit: next.commit,
      kept,
      homes,
      rule: undefined,
    });
    const rid = mor.actId(rotation);
    f.chain.push(b64(rotation));
    f.binding = rid;
    f.signingSecret = hex(newSigning);
    f.chainKey = { scheme: next.scheme, seeds: hex(next.seeds) };
    if (homes) f.homes = homes;
    this.save(name, f);
    this.saveAct(rotation);
    return { id: rid, rotation };
  }

  chainActs(name) {
    return this.load(name).chain.map(unb64);
  }

  /**
   * Keep the evidence that shows an identity's chain to a reader who holds
   * nothing else (a rotation counts only once its homes' receipts show it,
   * Identity rule 10a): the acts of identity records a home answered
   * (GET /identity/ID for this identity, and GET /identity/OPERATOR for each
   * home's operator), read from the answers in in/. Bank orders carry them.
   */
  evidence(name, answers) {
    const f = this.load(name);
    const have = new Set([...(f.chain ?? []), ...(f.evidence ?? [])]);
    let added = 0;
    for (const a of answers) {
      let rec;
      try {
        rec = mor.cborDecode(a);
      } catch {
        throw new Error('an answer given is not an identity record (CBOR)');
      }
      if (!(rec instanceof Map) || !(rec.get(1) instanceof Array)) throw new Error('an answer given is not an identity record (GET /identity/ID)');
      for (const part of [1, 2, 8, 10]) {
        for (const act of rec.get(part) ?? []) {
          const s = b64(act);
          if (have.has(s)) continue;
          have.add(s);
          (f.evidence ??= []).push(s);
          added++;
        }
      }
    }
    this.save(name, f);
    return added;
  }

  /** Check an identity's own chain with the core library's verifier. */
  resolve(name) {
    const f = this.load(name);
    const v = new mor.Verifier(SPECS.identity);
    for (const a of f.chain) v.add(unb64(a));
    return v.resolve(f.identity);
  }

  // ------------------------------------------------------------------ acts

  saveAct(bytes, key = null) {
    const id = mor.actId(bytes);
    writeFileSync(join(this.dir('acts'), `${id}.mor`), bytes);
    if (key) writeFileSync(join(this.dir('acts'), `${id}.key`), hex(key) + '\n', { mode: 0o600 });
    return id;
  }

  /**
   * Sign an everyday act with the identity's current signing key, next on
   * one of its lines: `public` (its public acts), `private` (its private
   * acts) or `bank` (its orders to the hosts' bank, never published).
   */
  sign(name, { spec, type, payload, isPublic = true, to, refs, acks, objects, line }) {
    const f = this.load(name);
    const l = line ?? (isPublic ? 'public' : 'private');
    if (!f.lines[l]) f.lines[l] = [];
    const made = mor.makeEveryday({
      signingSecret: unhex(f.signingSecret),
      signer: f.identity,
      binding: f.binding,
      spec,
      type,
      payload,
      sequence: f.lines[l],
      public: isPublic,
      to,
      refs,
      acks,
      objects,
    });
    f.lines[l].push(made.id);
    this.save(name, f);
    if (l !== 'bank') this.saveAct(made.act, isPublic ? null : made.key);
    return made;
  }

  post(name, text, { isPublic = true, to } = {}) {
    return this.sign(name, { spec: SPECS.text, type: 0, payload: textPayload(text), isPublic, to });
  }

  // ---------------------------------------------------------- the new Agreements acts

  static agreementsSpecs() {
    return mor.agreementsNewSpecs();
  }

  /** A payload from its fields (encoding 2), by the binding's builders; `params` and `content` in hex. */
  static agreementsBuild(act, fields) {
    const conv = (v, key = '') => {
      if ((key === 'params' || key === 'content') && typeof v === 'string') return unhex(v);
      if (Array.isArray(v)) return v.map((x) => conv(x));
      if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, conv(x, k)]));
      return v;
    };
    const i = conv(fields);
    if (act === 'terms') return mor.agreementsNewTermsPayload(i);
    if (act === 'statement') return mor.agreementsNewStatementPayload(i);
    if (act === 'report') return mor.agreementsNewReportPayload(i);
    throw new Error('the new Agreements acts are terms, statement and report');
  }

  /** The checker's answer on `act`, with the acts held before it (each `{ act, key? }`). */
  static agreementsCheck(act, key = null, held = []) {
    const one = (h) => (h.key ? { act: h.act, key: h.key } : { act: h.act });
    if (held.length) return mor.agreementsNewCheckHeld([...held.map(one), one({ act, key })]).at(-1);
    return mor.agreementsNewCheck(act, key ?? undefined);
  }

  /**
   * Build, check and sign one of the new Agreements acts: the draft is first
   * signed with a throwaway key, never the identity's, and checked with the
   * acts held; only if it passes is the identity's own act signed, and that
   * is checked again before it is kept. Nothing that fails is signed.
   */
  agreementsSign(name, act, fields, { held = [], isPublic = true, to } = {}) {
    const specs = Kit.agreementsSpecs();
    const { spec, type } = specs[act] ?? {};
    if (!spec) throw new Error('the new Agreements acts are terms, statement and report');
    const payload = Kit.agreementsBuild(act, fields);
    const f = this.load(name);
    const l = isPublic ? 'public' : 'private';
    const throwaway = randomBytes(32);
    const draft = mor.makeEveryday({ signingSecret: throwaway, signer: f.identity, binding: f.binding, spec, type, payload, sequence: f.lines[l], public: isPublic, to });
    throwaway.fill(0);
    const pre = Kit.agreementsCheck(draft.act, isPublic ? null : draft.key, held);
    if (pre.verdict !== 'pass') return { signed: null, check: pre, stage: 'before signing' };
    const made = this.sign(name, { spec, type, payload, isPublic, to });
    const post = Kit.agreementsCheck(made.act, isPublic ? null : made.key, held);
    return { signed: made, check: post, stage: 'signed' };
  }

  // --------------------------------------------------------------- letters

  /** A fresh letter name: the time to the millisecond, then a count within this run, so that file name order is the order written. */
  static letterName(kind = 'letter') {
    const t = new Date().toISOString().replace(/[-:TZ.]/g, '');
    Kit.seq = (Kit.seq ?? 0) + 1;
    return `${t}-${String(Kit.seq).padStart(3, '0')}-${kind.replace(/[^A-Za-z0-9]/g, '').slice(0, 20)}-${randomBytes(2).toString('hex')}`;
  }

  /**
   * Write a letter to out/: the body first (if it is a file), then the
   * envelope under a temporary name, renamed last, so the postman never
   * finds half a letter.
   */
  writeLetter(name, envelope, body = null) {
    if (!NAME.test(name)) throw new Error('a letter name is 1 to 64 of a-z, A-Z, 0-9, "-" and "_"');
    const out = this.dir('out');
    const final = join(out, `${name}${LETTER_SUFFIX}`);
    if (existsSync(final)) throw new Error(`out/ already holds a letter named ${name}`);
    const e = { letter: LETTER_VERSION, ...envelope };
    if (body) {
      writeFileSync(join(out, `${name}${BODY_SUFFIX}`), body);
      e.body = 'file';
    }
    const tmp = join(out, `${name}.writing`);
    writeFileSync(tmp, JSON.stringify(e) + '\n');
    renameSync(tmp, final);
    return { name, file: final };
  }

  /** A letter carrying bytes to a relay's API, exactly as given (malformed bytes included). */
  relayLetter(to, method, path, body = null, opts = {}) {
    const name = opts.name ?? Kit.letterName(method === 'GET' ? 'get' : 'post');
    const env = { to, method, path };
    if (opts.contentType) env.contentType = opts.contentType;
    if (opts.range) env.range = opts.range;
    return this.writeLetter(name, env, method === 'POST' ? body ?? new Uint8Array() : null);
  }

  /** One letter per act, to POST /acts: the identity's chain acts first if asked. */
  publish(to, acts, opts = {}) {
    return acts.map((a) => this.relayLetter(to, 'POST', '/acts', a, { name: Kit.letterName('publish') }));
  }

  chainLetter(ask, arg, verbose) {
    const env = { to: 'chain', ask };
    if (arg !== undefined) env.arg = arg;
    if (verbose !== undefined) env.verbose = verbose;
    return this.writeLetter(Kit.letterName(`chain-${ask}`), env);
  }

  /**
   * A signed bank order (`BANK-ORDERS.md`): an everyday act of the hosts'
   * bank spec on the identity's own bank line, carried with the identity's
   * chain acts, so the bank can check the signature against the identity.
   * Amounts are whole sats; the kit refuses anything else before signing.
   */
  bankOrder(name, kind, fields = {}) {
    const f = this.load(name);
    const m = new Map([
      ['do', kind],
      ['tray', this.tray],
      ['n', (f.bankN ?? 0) + 1],
    ]);
    for (const [k, v] of Object.entries(fields)) if (v !== undefined) m.set(k, v);
    try {
      readOrder(m);
    } catch (e) {
      if (e instanceof FormatError) throw new Error(`the bank would refuse this order, so it was not signed: ${e.message}`);
      throw e;
    }
    const made = this.sign(name, { spec: BANK.spec, type: BANK.type, payload: mor.cborEncode(m), isPublic: true, line: 'bank' });
    const f2 = this.load(name);
    f2.bankN = m.get('n');
    this.save(name, f2);
    return this.writeLetter(Kit.letterName(`bank-${kind}`), { to: 'bank', order: b64(made.act), chain: [...f2.chain, ...(f2.evidence ?? [])].slice(0, 256) });
  }

  // --------------------------------------------------------------- answers

  answers() {
    if (!existsSync(this.path('in'))) return [];
    return readdirSync(this.path('in'))
      .filter((f) => f.endsWith(ANSWER_SUFFIX))
      .map((f) => f.slice(0, -ANSWER_SUFFIX.length))
      .sort();
  }

  answer(name) {
    const a = JSON.parse(readFileSync(this.path('in', `${name}${ANSWER_SUFFIX}`), 'utf8'));
    const bf = this.path('in', `${name}${ANSWER_BODY_SUFFIX}`);
    const body = existsSync(bf) && lstatSync(bf).isFile() ? new Uint8Array(readFileSync(bf)) : null;
    if (body && a.bodySha256 && sha256(body) !== a.bodySha256) a.warning = 'the answer body does not match the fingerprint the postman wrote';
    return { ...a, bytes: body };
  }
}

/** Describe bytes as the core library reads them: an act, or CBOR, or neither. */
export function describe(bytes) {
  try {
    return { act: plain(mor.describeAct(bytes)) };
  } catch (e1) {
    try {
      return { cbor: plain(mor.cborDecode(bytes)) };
    } catch {
      const text = Buffer.from(bytes).toString('utf8');
      if (/^[\x09\x0a\x0d\x20-\x7e]*$/.test(text)) return { text };
      return { hex: hex(bytes), note: `not an act (${errorText(e1)}), not CBOR` };
    }
  }
}

export { BANK, SPECS, b64, hex, isHash, mor, plain, sha256, unb64, unhex };
