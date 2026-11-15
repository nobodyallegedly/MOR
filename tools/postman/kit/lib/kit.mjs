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
    this.warnings = [];
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
    if (!existsSync(f)) throw new Error(`no identity named "${name}" in keys/ (make one with: identity new ${name} --home HOME)`);
    const j = JSON.parse(readFileSync(f, 'utf8'));
    if (!isIdentityFile(j)) throw new Error(`keys/${name}.json is not an identity file this kit wrote (keys/ holds identity files only)`);
    return j;
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

  /**
   * The identities in keys/: every file there that is an identity file this
   * kit wrote. Anything else is skipped, with a warning (`this.warnings`);
   * a stray encryption-key file from window one is taken in where its
   * secret's public half matches an encryption-key act in acts/ signed by
   * one of these identities (the file itself is left where it is).
   */
  names() {
    if (!existsSync(this.path('keys'))) return [];
    const ids = [];
    const strays = [];
    for (const f of readdirSync(this.path('keys')).sort()) {
      if (!f.endsWith('.json')) continue;
      const n = f.slice(0, -5);
      let j = null;
      try {
        j = JSON.parse(readFileSync(this.path('keys', f), 'utf8'));
      } catch {
        // not JSON
      }
      if (NAME.test(n) && isIdentityFile(j)) ids.push(n);
      else strays.push({ file: f, json: j });
    }
    for (const st of strays) this.adoptStray(st, ids);
    return ids;
  }

  adoptStray({ file, json }, ids) {
    const secrets = [];
    const walk = (x) => {
      if (typeof x === 'string' && /^[0-9a-f]{64}$/.test(x)) secrets.push(x);
      else if (Array.isArray(x)) x.forEach(walk);
      else if (x && typeof x === 'object') Object.values(x).forEach(walk);
    };
    walk(json);
    const encActs = [];
    if (existsSync(this.path('acts'))) {
      for (const a of readdirSync(this.path('acts'))) {
        if (!a.endsWith('.mor')) continue;
        try {
          const bytes = new Uint8Array(readFileSync(this.path('acts', a)));
          const d = mor.describeAct(bytes);
          if (d.spec === SPECS.envelopes && d.type === 4) encActs.push({ d, m: mor.cborDecode(d.payload) });
        } catch {
          // not an act
        }
      }
    }
    for (const sec of secrets) {
      let pub;
      try {
        pub = hex(mor.xwingPublic(unhex(sec)));
      } catch {
        continue;
      }
      const hit = encActs.find((e) => e.m.get(2)?.[1] && hex(e.m.get(2)[1]) === pub);
      if (!hit) continue;
      const owner = ids.find((n) => this.load(n).identity === hit.d.signer);
      if (!owner) continue;
      const f = this.load(owner);
      f.encryption ??= [];
      if (!f.encryption.some((e) => e.act === hit.d.id)) {
        f.encryption.push({ version: hit.m.get(0), act: hit.d.id, secret: sec });
        f.encryption.sort((a, b) => a.version - b.version);
        this.save(owner, f);
        this.warnings.push(`keys/${file} is not an identity file: its encryption key (version ${hit.m.get(0)}, act ${hit.d.id}) was taken into keys/${owner}.json; the file was left as it is`);
      }
      return;
    }
    this.warnings.push(`keys/${file} is not an identity file and was skipped (keys/ holds identity files only, NAME.json, as the kit writes them)`);
  }

  /**
   * A home named as the hosts name it (from-the-hosts/relays.md): its
   * operator and first address read from a held answer to GET /info at that
   * name. Where none is held, the letter asking for it is written, and the
   * caller says to run again after the next pass.
   */
  homeByName(relay) {
    for (const n of this.answers().reverse()) {
      let a;
      try {
        a = this.answer(n);
      } catch {
        continue;
      }
      if (a.to !== relay || a.path !== '/info' || a.status !== 200 || !a.bytes) continue;
      try {
        const m = mor.cborDecode(a.bytes);
        const op = m.get(0);
        const bases = m.get(1);
        const operator = typeof op === 'string' ? op : op instanceof Uint8Array ? hex(op) : null;
        if (isHash(operator) && Array.isArray(bases) && typeof bases[0] === 'string') return { home: { operator, hint: bases[0] }, name: relay };
      } catch {
        // not a relay's /info
      }
      throw new Error(`the answer to ${n} (GET /info at ${relay}) names no operator: ${relay} is a relay, not a home, or not one the kit can read`);
    }
    return { ask: this.relayLetter(relay, 'GET', '/info', null, { name: Kit.letterName('info') }).name };
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
    const genesis = mor.makeGenesis({ identitySpec: SPECS.identity, signingSecret: signing, chainKeyScheme: chainKey.scheme, chainKeyCommit: chainKey.commit, homes: homes.map(({ operator, hint }) => ({ operator, hint })), rule });
    const id = mor.actId(genesis);
    const f = {
      label: TEST_LABEL,
      identity: id,
      binding: id,
      signingSecret: hex(signing),
      chainKey: { scheme: chainKey.scheme, seeds: hex(chainKey.seeds) },
      chain: [b64(genesis)],
      homes: homes.map(({ operator, hint, name: n }) => ({ operator, hint, ...(n ? { name: n } : {}) })),
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
      homes: homes?.map(({ operator, hint }) => ({ operator, hint })),
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
    const add = (a) => {
      try {
        v.add(a);
      } catch {
        // not an act
      }
    };
    for (const a of [...f.chain, ...(f.evidence ?? [])]) add(unb64(a));
    for (const a of this.heldRecords()) add(a);
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
    checkPayloadText(payload);
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

  post(name, text, { isPublic = true, to, refs } = {}) {
    return this.sign(name, { spec: SPECS.text, type: 0, payload: textPayload(text), isPublic, to, refs });
  }

  // ------------------------------------------------------------- sealing

  /**
   * A new encryption key (Envelopes type 4): an X-Wing key pair, its public
   * half in a public act, version 1 for the first and one more for each
   * after, naming the one before; its secret half kept in keys/. Publish
   * the act to the identity's homes so others can seal to it.
   */
  /**
   * The letters that put an encryption key at the identity's homes in the
   * order a home needs: its chain acts first (a home refuses an act signed
   * under a rotation it does not hold yet), then the key.
   */
  publishKey(name, keyAct, homes) {
    const out = [];
    for (const h of homes) out.push(...this.publish(h, [...this.chainActs(name), keyAct]).map((l) => l.name));
    return out;
  }

  encryptionKey(name) {
    const f = this.load(name);
    const last = (f.encryption ?? []).at(-1);
    const version = (last?.version ?? 0) + 1;
    const secret = mor.newEncryptionSecret();
    const payload = mor.encryptionKeyPayload(version, last?.act ?? undefined, mor.xwingPublic(secret));
    const made = this.sign(name, { spec: SPECS.envelopes, type: 4, payload, isPublic: true });
    const f2 = this.load(name);
    (f2.encryption ??= []).push({ version, act: made.id, secret: hex(secret) });
    this.save(name, f2);
    return { ...made, version };
  }

  /** Every act in the identity records (GET /identity/ID) answered in in/: chains, receipts, encryption keys. */
  heldRecords() {
    const acts = [];
    for (const n of this.answers()) {
      let a;
      try {
        a = this.answer(n);
      } catch {
        continue;
      }
      if (a.outcome !== 'answered' || a.status !== 200 || !/^\/identity\/[0-9a-f]{64}(\?.*)?$/.test(a.path ?? '') || !a.bytes) continue;
      let rec;
      try {
        rec = mor.cborDecode(a.bytes);
      } catch {
        continue;
      }
      if (!(rec instanceof Map)) continue;
      for (const part of [1, 2, 4, 8, 10]) for (const x of rec.get(part) ?? []) if (x instanceof Uint8Array) acts.push(x);
    }
    return acts;
  }

  /**
   * The encryption key that counts for each recipient, read by the core
   * library's verifier from the identity records held in in/ (and this
   * folder's own identities). Refused, plainly, for a recipient with none.
   */
  /** The recipients whose encryption key is not held: [] when every one is. */
  missingKeys(ids) {
    return ids.filter((id) => {
      try {
        this.recipientKeys([id]);
        return false;
      } catch (e) {
        if (/no published encryption key/.test(errorText(e))) return true;
        throw e;
      }
    });
  }

  /**
   * Letters asking for the records of identities whose keys are missing:
   * to the relay named, and to this identity's own homes where it knows
   * them by name. The seal then runs on the next try, after a pass.
   */
  askRecords(name, ids, via) {
    const f = this.load(name);
    const at = [...new Set([via, ...(f.homes ?? []).map((h) => h.name).filter(Boolean)].filter(Boolean))];
    const letters = [];
    const why = [];
    const held = new Set(this.recordsHeld());
    for (const id of ids) {
      // A record of the recipient already held, and still no key that counts: an encryption key signed under a
      // rotation counts only once the rotation does, and a rotation counts only from its homes' receipts, which a
      // reader checks against each home operator's own chain: ask for those operators' records too.
      const want = held.has(id) ? this.operatorsOf(id).filter((op) => !held.has(op)) : [id];
      if (held.has(id) && !want.length) {
        why.push(`${id}: its record is held and shows no encryption key that counts (none published at that home, or one refused there because it arrived before the rotation it is signed under)`);
        continue;
      }
      if (held.has(id)) why.push(`${id}: its record is held, but its chain counts only with its homes' operators' records (${want.join(', ')}), asked for now`);
      for (const x of want) for (const r of at) letters.push(this.relayLetter(r, 'GET', `/identity/${x}`, null, { name: Kit.letterName('record') }).name);
    }
    return { at, letters, why };
  }

  /** The identities whose /identity records are held in in/. */
  recordsHeld() {
    const out = [];
    for (const n of this.answers()) {
      try {
        const a = this.answer(n);
        const m = /^\/identity\/([0-9a-f]{64})(\?.*)?$/.exec(a.path ?? '');
        if (m && a.status === 200) out.push(m[1]);
      } catch {
        // unreadable answer
      }
    }
    return out;
  }

  /** The operators of the homes an identity's chain names, at every position, as the records held show it. */
  operatorsOf(id) {
    const v = new mor.Verifier(SPECS.identity);
    for (const a of this.heldRecords()) {
      try {
        v.add(a);
      } catch {
        // not an act
      }
    }
    const r = v.resolve(id);
    const ops = new Set();
    for (const h of [...(r.homes ?? []), ...(r.homesAt ?? []).flat()]) if (h?.operator) ops.add(h.operator);
    // A rotation's receipts come from the homes in force before it (Money rule 15's home rule): those are read here.
    ops.delete(id);
    return [...ops];
  }

  /** A relay that answered a sealed container with a refusal before (404, 405 or 501): it does not take them. */
  refusesSealed(relay) {
    for (const n of this.answers().reverse()) {
      let a;
      try {
        a = this.answer(n);
      } catch {
        continue;
      }
      if (a.to === relay && a.method === 'POST' && a.path === '/sealed' && a.outcome === 'answered') return [404, 405, 501].includes(a.status) ? a.status : null;
    }
    return null;
  }

  recipientKeys(ids) {
    const v = new mor.Verifier(SPECS.identity, SPECS.money, SPECS.agreements, SPECS.envelopes, SPECS.text);
    const add = (a) => {
      try {
        v.add(a);
      } catch {
        // not an act
      }
    };
    for (const a of this.heldRecords()) add(a);
    for (const n of this.names()) {
      const f = this.load(n);
      for (const c of [...f.chain, ...(f.evidence ?? [])]) add(unb64(c));
      for (const e of f.encryption ?? []) if (existsSync(join(this.folder, 'acts', `${e.act}.mor`))) add(new Uint8Array(readFileSync(join(this.folder, 'acts', `${e.act}.mor`))));
    }
    return ids.map((id) => {
      if (!isHash(id)) throw new Error(`a recipient is an identity hash, 64 hexadecimal characters: "${id}" is not`);
      const l = v.latest(id, SPECS.envelopes, 4);
      if (!l?.act || !l.payload) {
        throw new Error(
          `${id} has no published encryption key in what you hold, so nothing can be sealed to it. Ask one of its homes for its record (node kit/mor.mjs letter --to HOME --get /identity/${id}), read the answer after the next pass, and seal again. If the record shows no encryption key, that identity has to publish one first (identity enckey).`,
        );
      }
      if (l.contested) throw new Error(`${id}'s encryption-key chain is contested in what you hold: nothing was sealed`);
      const key = mor.cborDecode(l.payload).get(2);
      if (!Array.isArray(key) || !(key[1] instanceof Uint8Array)) throw new Error(`${id}'s encryption key is not one this kit can seal to (X-Wing)`);
      return { id, key: key[1], act: l.act };
    });
  }

  /**
   * Seal an act (with its content key, if private) to each recipient's
   * published encryption key, and write the letter that sends the sealed
   * container to a relay: POST /sealed, the relay's CBOR map {0: bytes}.
   */
  seal(act, recipients, relay, key = null) {
    const no = relay ? this.refusesSealed(relay) : null;
    if (no) throw new Error(`${relay} answered ${no} to a sealed container before: it does not take sealed containers (POST /sealed). Seal --via a relay or home that does; the hosts' reference relays and homes do`);
    let d;
    try {
      d = mor.describeAct(act);
    } catch (e) {
      throw new Error(`that file is not an act (${errorText(e)}): nothing was sealed`);
    }
    const addressed = d.to ?? [];
    const outside = recipients.filter((r) => !addressed.includes(r));
    if (outside.length)
      throw new Error(`the act is not addressed to ${outside.join(', ')}: a recipient opens a sealed act only if the act itself names them in "to" (sign it with --private --to ${recipients.join(',')}). Nothing was sealed`);
    const keys = this.recipientKeys(recipients);
    const sealed = mor.seal({ act, ...(key ? { key } : {}), recipients: keys.map((k) => ({ id: k.id, key: k.key })) });
    const file = join(this.dir('sealed'), `${sha256(sealed)}.sealed`);
    writeFileSync(file, sealed);
    const letter = relay ? this.relayLetter(relay, 'POST', '/sealed', mor.cborEncode(new Map([[0, sealed]])), { name: Kit.letterName('sealed') }) : null;
    return { sealed, file, letter, to: keys.map((k) => ({ id: k.id, encryptionKey: k.act })) };
  }

  /**
   * Open what is sealed to one of this folder's identities: a sealed
   * container, or a feed page (GET /feed?to=ID), each container in it tried
   * with every encryption secret the identity holds, newest first. What
   * opens is kept in acts/ (a private act's content key beside it).
   */
  open(name, bytes) {
    const f = this.load(name);
    const secrets = [...(f.encryption ?? [])].reverse().map((e) => unhex(e.secret));
    if (!secrets.length) throw new Error(`${name} has no encryption key: nothing can be sealed to it (identity enckey ${name}, then publish it)`);
    let items = [bytes];
    try {
      const m = mor.cborDecode(bytes);
      if (m instanceof Map && Array.isArray(m.get(0)) && m.has(1)) items = m.get(0).filter((i) => i[1] === 1).map((i) => i[2]);
      else if (m instanceof Map && m.get(0) instanceof Uint8Array && m.size === 1) items = [m.get(0)];
    } catch {
      // not CBOR around it: the container itself
    }
    const out = [];
    for (const it of items) {
      let opened = null;
      let why = '';
      for (const s of secrets) {
        try {
          opened = mor.openSealed(it, f.identity, s);
          break;
        } catch (e) {
          why = errorText(e);
        }
      }
      if (!opened) {
        out.push({ opened: false, why });
        continue;
      }
      const id = this.saveAct(opened.act, opened.key ?? null);
      out.push({ opened: true, act: id, file: `acts/${id}.mor`, ...(opened.key ? { key: hex(opened.key) } : {}), described: plain(opened.described) });
    }
    return out;
  }

  /** The relay names the hosts announce (from-the-hosts/relays.md), as written. */
  relaysNote() {
    const p = join(this.folder, 'from-the-hosts', 'relays.md');
    try {
      return lstatSync(p).isFile() ? readFileSync(p, 'utf8') : null;
    } catch {
      return null;
    }
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
    const out = { signed: made, check: post, stage: 'signed' };
    // Draft 25, G4.1: stating Terms is not agreeing to them. Where the signer is a party, its own assent is still owed.
    if (act === 'terms' && !fields.replaces && (fields.parties ?? []).some((p) => p?.signer === f.identity)) {
      // The author's assent names the Terms in `previous` (draft 25, section 3.2): the Terms act is the signer's previous act in this agreement. With `previous: null` it would fork the signer's own line (G6.2) and not be counted.
      const assent = { agreement: made.id, terms: made.id, kind: 'assent', previous: made.id };
      const file = join(this.dir('acts'), `${made.id}.assent.json`);
      writeFileSync(file, JSON.stringify(assent, null, 2) + '\n');
      out.assent = {
        says: 'These Terms are not in force yet, and they do not bind you: under Agreements draft 25 (G4.1), signing Terms states them; it is not an assent. By default they come into force once every party named as a signer has signed an assent naming them, you included. Your assent is ready to sign (its `previous` names these Terms, as draft 25 asks of an author, section 3.2):',
        command: `node kit/mor.mjs agreements sign ${name} statement acts/${made.id}.assent.json --held acts/${made.id}.mor`,
        fields: `acts/${made.id}.assent.json`,
      };
    }
    return out;
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

/** An identity file as this kit writes it. */
export function isIdentityFile(j) {
  return !!j && typeof j === 'object' && isHash(j.identity) && Array.isArray(j.chain) && j.lines && typeof j.lines === 'object' && typeof j.signingSecret === 'string';
}

/**
 * Every text in a payload must be canonical (the Text MIR), as the
 * Agreements builders already require: refused before anything is signed.
 */
export function checkPayloadText(payload) {
  let v;
  try {
    v = mor.cborDecode(payload);
  } catch (e) {
    throw new Error(`the payload is not deterministic CBOR (${errorText(e)}): nothing was signed`);
  }
  const walk = (x) => {
    if (typeof x === 'string') {
      try {
        mor.checkText(x);
      } catch (e) {
        throw new Error(`the payload holds text that is not canonical (${errorText(e)}): nothing was signed. Write it in NFC, without control characters`);
      }
    } else if (Array.isArray(x)) x.forEach(walk);
    else if (x instanceof Map) for (const [k, y] of x) (walk(k), walk(y));
  };
  walk(v);
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
