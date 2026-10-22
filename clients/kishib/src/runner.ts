// The Dubsar runner (the Dubsar runner cMIP, draft 1, `cmips/cmip-runner-draft-1.md`):
// Kišib signs for the apps paired with it, on this computer only, from the
// signing keys of the identities given to it. Decided by Nobody, allegedly
// (`docs/design/suite-redesign.md`, "The Dubsar runner cMIP"): Mac only;
// off by default, no key stored while off; turned on with the risk stated
// first; the chain key never kept; pairing started in the app and approved
// here; the approval panel drawn inside the asking app's window, in a frame
// it cannot read or change; standing yeses per app and kind, money,
// agreements and keys always asking.
//
// What it keeps, while on only, in Kišib's folder (`runner.json`, owner
// only): the identities given (their signing keys), the pairings (a hash of
// each app's token, never the token), and what it signed. Requests waiting
// for an answer live in memory. Turned off, the file is overwritten and
// removed: nothing of the runner remains.
//
// TEST IDENTITIES ONLY, until MOR is frozen.

import { closeSync, existsSync, openSync, readFileSync, renameSync, rmSync, statSync, writeSync, writeFileSync } from 'node:fs';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { join } from 'node:path';
import { base64, cborEncode, hex, keyDeliveryPayload, makeEveryday, sha256, signingPublic, unhex } from '../../genesis/src/core.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { cardText, ownLine } from '../../genesis/src/lines.ts';
import type { Home, SignRequest } from '../../genesis/src/identity.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { idForm, readId } from '../../genesis/src/forms.ts';
import { Refused as WordsRefused, fromWords } from '../../../modules/carry/src/carry.ts';
import { lookCurrent, NOT_CURRENT } from '../../dub/src/carryin.ts';
import { namesOf } from '../../dub/src/names.ts';
import { ALWAYS_ASKS, KIND_NAME, KIND_ONE, KINDS, deliveredToItself, kindOf, refusedOutright, wordsOf, type Kind } from './runner-read.ts';

export type { Kind };
export { KIND_NAME, KINDS, ALWAYS_ASKS };

/** Said before the runner is turned on, and read (6.2). */
export const RISK_SAY = [
  'Kišib keeps the signing keys of the identities you give it, on this Mac, in its folder, while the runner is on. The chain key: never.',
  'Whoever gets into this Mac can sign as those identities: through Kišib, within what you allowed; and anything at all, by reading Kišib’s folder.',
  'Its panel is drawn by Kišib inside the asking app’s window. A malicious app could cover it or trick a click: a gap you accept.',
  'Money, agreements and keys always ask, even with a standing yes.',
  'Turning the runner off forgets every key it holds, every app paired with it and what it signed.',
];

/** Said where the runner refuses because it is off (6.1). */
export const OFF_SAY = 'Kišib’s runner is off: it signs for no app. Turn it on in Kišib (Runner), knowing the risk, or sign with the identity’s own words. Nothing was signed.';

/** Said where the key the runner holds no longer counts (3.5; H80). Its first words are how an app knows it. */
export const RUNNER_SPENT_SAY =
  'This identity’s signing key was changed with its chain key, so the signing key Kišib’s runner holds no longer counts. Nothing was signed. Give the runner the new signing key’s words, in Kišib: Runner, Identities held here.';

/** How long a request waits for its answer, in milliseconds (4.5). */
export const WAIT_LIFE = 10 * 60 * 1000;

const FILE = 'runner.json';
const LABEL = 'MOR Kišib runner: signing keys, kept while the runner is on. TEST IDENTITIES ONLY.';
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** An identity given to the runner (6.3). */
interface HeldId {
  id: string;
  /** Its signing key's seed, hex: the secret the runner signs with. */
  secret: string;
  binding: string;
  homes: Home[];
  name: string | null;
  given: number;
  /** Its homes now serve another key: nothing is signed until the new words are given (3.5). */
  spent?: boolean;
}

/** A pairing (2.3). */
interface Pairing {
  id: string;
  name: string;
  origin: string;
  /** SHA-256 of the app's token: the token itself is never kept. */
  token: string;
  code: string;
  state: 'waiting' | 'approved' | 'refused';
  identities: string[];
  yes: Kind[];
  asked: number;
  approved?: number;
}

/** One act the runner signed (6.3). */
interface Signed {
  at: number;
  app: string;
  appName: string;
  identity: string;
  kind: Kind;
  words: string[];
  act: string;
  line: SignRequest['line'];
  position: number;
  /** For a private act: SHA-256 of the key delivery that leaves its content key to the identity itself (7.3). */
  companion?: string;
  /** For the key delivered to itself: the act whose key it delivers. */
  of?: string;
  /** Signed without a panel: under a standing yes, or as an act's companion. */
  standing?: boolean;
}

/** The latest act of an app's line, as signed here (7.2): the line's IDs, for its card. */
interface LineKept {
  identity: string;
  app: string;
  appName: string;
  binding: string;
  line: 'public' | 'private';
  ids: string[];
}

interface RunnerFile {
  label: string;
  since: number;
  held: HeldId[];
  apps: Pairing[];
  log: Signed[];
  lines: LineKept[];
}

/** A request waiting for the person (4.5), in memory only. */
interface Waiting {
  fp: string;
  app: string;
  identity: string;
  kind: Kind;
  words: string[];
  req: SignRequest;
  at: number;
  /** The single-use value written into the panel last drawn (4.4). */
  nonce: string | null;
  made?: { act: Uint8Array; id: string; key: Uint8Array };
  declined?: boolean;
  wake: (() => void)[];
}

/** What an app is answered. */
export type Answer =
  | { signed: { act: string; id: string; key: string } }
  | { asks: { request: string; panel: string; kind: Kind; title: string } }
  | { declined: true }
  | { waiting: true }
  | { expired: true };

/** What Kišib's page shows of the runner. */
export interface RunnerView {
  on: boolean;
  since: number | null;
  risk: string[];
  held: { id: string; form: string; name: string | null; spent: boolean; apps: string[]; homes: string[] }[];
  apps: { id: string; name: string; origin: string; code: string; state: Pairing['state']; identities: string[]; yes: Kind[]; asked: number; approved: number | null }[];
  waiting: { request: string; app: string; identity: string; name: string | null; kind: Kind; title: string; words: string[]; at: number; always: boolean }[];
  signed: { at: number; app: string; identity: string; name: string | null; kind: Kind; words: string[]; act: string; standing: boolean; line: string; position: number }[];
  kinds: { kind: Kind; name: string; always: boolean }[];
}

/** An app's error, said in plain words, with the status its door answers. */
export class RunnerRefusal extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

const tokenHash = (t: string) => sha256(`MOR Kišib runner token\n${t}`);

/** The fingerprint of a request (3.3): SHA-256 of its fields in deterministic CBOR. */
export function requestPrint(r: SignRequest): string {
  return sha256(
    cborEncode([
      r.identity,
      r.line,
      r.spec,
      r.type,
      r.payload,
      r.public,
      r.to ?? null,
      r.objects ?? null,
      r.refs ?? null,
      r.acks ?? null,
      r.binding,
      r.sequence,
    ]),
  );
}

/** An origin a pairing may name: this computer's own, by its name, with a port (1.2). */
export function readOrigin(o: string): string {
  const m = /^http:\/\/(127\.0\.0\.1|localhost):(\d{1,5})$/.exec(o.trim());
  if (!m || Number(m[2]) < 1 || Number(m[2]) > 65535) throw new RunnerRefusal(400, `“${o}” is not an app on this computer: an origin is http://127.0.0.1:PORT. Nothing was paired.`);
  return `http://127.0.0.1:${m[2]}`;
}

/** The two names of one origin on this computer, for `frame-ancestors`. */
export const originsOf = (o: string) => [o, o.replace('127.0.0.1', 'localhost')];

export class Runner {
  private f: RunnerFile | null = null;
  private waiting = new Map<string, Waiting>();

  constructor(
    readonly dir: string,
    private readonly opts: { now?: () => number; via?: Via } = {},
  ) {
    const p = join(dir, FILE);
    if (existsSync(p)) {
      try {
        const f = JSON.parse(readFileSync(p, 'utf8')) as RunnerFile;
        if (f.label === LABEL) this.f = f;
      } catch {
        // a damaged file: the runner is off until turned on again
      }
    }
  }

  private now = () => this.opts.now?.() ?? Date.now();
  private get via(): Via {
    return this.opts.via ?? {};
  }

  get on(): boolean {
    return !!this.f;
  }

  private save() {
    if (!this.f) return;
    const p = join(this.dir, FILE);
    writeFileSync(`${p}.tmp`, JSON.stringify(this.f, null, 2) + '\n', { mode: 0o600 });
    renameSync(`${p}.tmp`, p);
  }

  private file(): RunnerFile {
    if (!this.f) throw new RunnerRefusal(403, OFF_SAY);
    return this.f;
  }

  // ------------------------------------------------------------ on and off (section 6)

  /** Turn the runner on, once its risk was read (6.2). Nothing is kept yet. */
  turnOn(a: { read: boolean }): RunnerView {
    if (!a.read) throw new Error('Read the risk, and say so, before the runner is turned on. It stays off.');
    if (!this.f) {
      this.f = { label: LABEL, since: Math.floor(this.now() / 1000), held: [], apps: [], log: [], lines: [] };
      this.save();
    }
    return this.view();
  }

  /** Turn it off (6.5): every key, pairing and record forgotten; the file overwritten, then removed. */
  turnOff(): RunnerView {
    const p = join(this.dir, FILE);
    for (const w of this.waiting.values()) this.settle(w, { declined: true });
    this.waiting.clear();
    for (const h of this.f?.held ?? []) h.secret = '0'.repeat(h.secret.length);
    this.f = null;
    for (const x of [p, `${p}.tmp`]) {
      if (!existsSync(x)) continue;
      try {
        // Overwritten first, as far as software can: a copy the system made elsewhere is out of reach.
        const n = statSync(x).size;
        const fd = openSync(x, 'r+');
        writeSync(fd, Buffer.alloc(n));
        closeSync(fd);
      } catch {
        // removed below all the same
      }
      rmSync(x, { force: true });
    }
    return this.view();
  }

  // ------------------------------------------------------------ identities given to it (6.3, 6.4)

  /** Give the runner an identity by its signing key's words, checked against the key its homes serve. */
  async give(a: { id: string; address: string; words: string }): Promise<RunnerView> {
    const f = this.file();
    const id = readId(a.id);
    let seed: Uint8Array;
    try {
      seed = fromWords(a.words);
    } catch (e) {
      if (e instanceof WordsRefused) throw new Error(`${e.message}. Nothing was kept.`);
      throw e;
    }
    const hints = [...new Set([a.address.trim(), ...(f.held.find((h) => h.id === id)?.homes.map((h) => h.hint) ?? [])].filter(Boolean))];
    if (!hints.length) throw new Error('Give an address where this identity is found (one of its homes), starting with https://.');
    let look;
    try {
      look = await lookCurrent(id, seed, hints, this.via);
    } catch (e) {
      // The chain key's words give no signing key the homes serve: said, and never kept.
      throw new Error(message(e) === NOT_CURRENT ? `${NOT_CURRENT} The runner takes a signing key’s words only, never the chain key’s.` : message(e));
    } finally {
      seed.fill(0);
    }
    const r = look.resolution;
    const binding = r.links[r.links.length - 1].act;
    let name: string | null = null;
    try {
      name = (await namesOf(id, r.homes.map((h) => h.hint), this.via))[0]?.name ?? null;
    } catch {
      // no name read: its short ID is shown
    }
    const was = f.held.find((h) => h.id === id);
    const held: HeldId = { id, secret: hex(fromWords(a.words)), binding, homes: r.homes, name, given: Math.floor(this.now() / 1000) };
    if (was) {
      // New words after a change of keys: the lines signed under the old binding are not continued (the carry Module, 4.3).
      if (was.binding !== binding) f.lines = f.lines.filter((l) => l.identity !== id);
      Object.assign(was, held, { spent: false });
    } else f.held.push(held);
    this.save();
    return this.view();
  }

  /** Remove an identity from the runner (6.6): its key and record forgotten. */
  remove(a: { id: string }): RunnerView {
    const f = this.file();
    const h = f.held.find((x) => x.id === a.id);
    if (h) h.secret = '0'.repeat(h.secret.length);
    f.held = f.held.filter((x) => x.id !== a.id);
    f.log = f.log.filter((x) => x.identity !== a.id);
    f.lines = f.lines.filter((x) => x.identity !== a.id);
    for (const p of f.apps) p.identities = p.identities.filter((x) => x !== a.id);
    for (const w of [...this.waiting.values()]) if (w.identity === a.id) this.settle(w, { declined: true });
    this.save();
    return this.view();
  }

  // ------------------------------------------------------------ pairing (section 2)

  /** An app asks to pair (2.1): a code to compare, and a token good once approved. */
  pair(a: { name: string; origin: string }): { pairing: string; code: string; token: string } {
    const f = this.file();
    const name = a.name.trim();
    if (!name || name.length > 40 || /[\u0000-\u001f]/.test(name)) throw new RunnerRefusal(400, 'An app names itself in a few words. Nothing was paired.');
    const origin = readOrigin(a.origin);
    // At most a few waiting at once: a program asking again and again is not shown more.
    f.apps = f.apps.filter((p) => !(p.state === 'waiting' && p.origin === origin && p.name === name));
    if (f.apps.filter((p) => p.state === 'waiting').length >= 5) throw new RunnerRefusal(429, 'Too many pairings wait in Kišib: answer them first.');
    const token = randomBytes(32).toString('hex');
    const bytes = randomBytes(8);
    const code = [...bytes].map((b) => ALPHABET[b % 32]).join('').replace(/^(.{4})/, '$1-');
    const p: Pairing = { id: randomBytes(8).toString('hex'), name, origin, token: tokenHash(token), code, state: 'waiting', identities: [], yes: [], asked: Math.floor(this.now() / 1000) };
    f.apps.push(p);
    this.save();
    return { pairing: p.id, code, token };
  }

  private pairingOf(token: string | undefined, approved = true): Pairing {
    const f = this.file();
    if (!token || !/^[0-9a-f]{64}$/.test(token)) throw new RunnerRefusal(401, 'This app is not paired with Kišib’s runner. Nothing was signed.');
    const h = Buffer.from(tokenHash(token), 'hex');
    const p = f.apps.find((x) => timingSafeEqual(Buffer.from(x.token, 'hex'), h));
    if (!p) throw new RunnerRefusal(401, 'Kišib’s runner no longer knows this app: its pairing was revoked, or the runner was turned off since. Pair it again. Nothing was signed.');
    if (approved && p.state !== 'approved') throw new RunnerRefusal(403, p.state === 'refused' ? 'Kišib refused this app’s pairing. Nothing was signed.' : 'This app’s pairing waits for its approval in Kišib (Runner, Apps). Nothing was signed.');
    return p;
  }

  /** What an app learns of its pairing (2.4). */
  paired(token: string | undefined): { state: Pairing['state']; name: string; code: string; identities: { id: string; name: string | null; binding: string; key: string; spent: boolean; homes: string[] }[] } {
    const p = this.pairingOf(token, false);
    const f = this.file();
    return {
      state: p.state,
      name: p.name,
      code: p.code,
      identities:
        p.state === 'approved'
          ? f.held.filter((h) => p.identities.includes(h.id)).map((h) => ({ id: h.id, name: h.name, binding: h.binding, key: hex(signingPublic(unhex(h.secret))), spent: !!h.spent, homes: h.homes.map((x) => x.hint) }))
          : [],
    };
  }

  /** Approve a pairing (2.2), with the identities the app may use. */
  approve(a: { pairing: string; identities: string[] }): RunnerView {
    const f = this.file();
    const p = f.apps.find((x) => x.id === a.pairing);
    if (!p) throw new Error('No such pairing waits here.');
    const ids = a.identities.filter((x) => f.held.some((h) => h.id === x));
    if (!ids.length) throw new Error('Choose at least one identity the app may use: give one to the runner first (Identities held here).');
    p.state = 'approved';
    p.identities = ids;
    p.approved = Math.floor(this.now() / 1000);
    this.save();
    return this.view();
  }

  /** Change which identities an approved app may use. */
  allow(a: { pairing: string; identities: string[] }): RunnerView {
    const p = this.file().apps.find((x) => x.id === a.pairing && x.state === 'approved');
    if (!p) throw new Error('No such app is paired here.');
    return this.approve(a);
  }

  /** Refuse a pairing waiting, or revoke one approved (2.5): its token stops working at once. */
  revoke(a: { pairing: string }): RunnerView {
    const f = this.file();
    const p = f.apps.find((x) => x.id === a.pairing);
    if (!p) throw new Error('No such app is paired here.');
    f.apps = f.apps.filter((x) => x.id !== a.pairing);
    for (const w of [...this.waiting.values()]) if (w.app === p.id) this.settle(w, { declined: true });
    this.save();
    return this.view();
  }

  /** An app unpairs itself (2.5). */
  unpair(token: string | undefined): void {
    const p = this.pairingOf(token, false);
    this.revoke({ pairing: p.id });
  }

  /** A standing yes given or withdrawn (5.2); never for money, agreements or keys (5.3). */
  setYes(a: { pairing: string; kind: string; on: boolean }): RunnerView {
    const f = this.file();
    const p = f.apps.find((x) => x.id === a.pairing && x.state === 'approved');
    if (!p) throw new Error('No such app is paired here.');
    const k = a.kind as Kind;
    if (!KINDS.includes(k)) throw new Error('No such kind of act.');
    if (ALWAYS_ASKS.includes(k)) throw new Error('Money, agreements and keys always ask: no standing yes is given for them.');
    p.yes = a.on ? [...new Set([...p.yes, k])] : p.yes.filter((x) => x !== k);
    this.save();
    return this.view();
  }

  // ------------------------------------------------------------ a request (sections 3 to 5)

  /** The key check (3.5): the key held is the one the homes serve now, and they agree. */
  private async keyCheck(h: HeldId): Promise<void> {
    let r;
    try {
      r = (await lookUp(h.id, h.homes.map((x) => x.hint), this.via)).resolution;
    } catch (e) {
      throw new RunnerRefusal(503, `The identity’s homes did not answer (${message(e)}): Kišib’s runner signs only once it has read that its key still counts. Nothing was signed.`);
    }
    if (r.stop === 'contested') throw new RunnerRefusal(409, 'Its homes disagree about its keys (contested): nothing is signed for it until they agree. Nothing was signed.');
    if (!r.signingKey || hex(r.signingKey) !== hex(signingPublic(unhex(h.secret)))) {
      if (!h.spent) {
        h.spent = true;
        this.save();
      }
      throw new RunnerRefusal(409, RUNNER_SPENT_SAY);
    }
  }

  /** A request from an app (3.1): signed at once under a standing yes or as a companion, asked in a panel otherwise, refused with its reason. */
  async ask(token: string | undefined, req: SignRequest, panelBase: string): Promise<Answer> {
    const p = this.pairingOf(token);
    const f = this.file();
    if (!p.identities.includes(req.identity)) throw new RunnerRefusal(403, `Kišib’s runner does not sign as ${idForm(req.identity)} for ${p.name}: approve it for this app in Kišib (Runner, Apps). Nothing was signed.`);
    const h = f.held.find((x) => x.id === req.identity);
    if (!h) throw new RunnerRefusal(403, 'Kišib’s runner does not hold this identity any more. Nothing was signed.');
    const outright = refusedOutright(req);
    if (outright) throw new RunnerRefusal(400, outright);
    await this.keyCheck(h);
    if (req.binding !== h.binding) throw new RunnerRefusal(409, 'The request names the identity’s key before its last change: the app reads the identity again and starts new lines. Nothing was signed.');
    this.sweep();
    const fp = requestPrint(req);
    const was = this.waiting.get(fp);
    if (was && was.app === p.id) {
      if (was.made) return { signed: wire(was.made) };
      if (!was.declined) return this.asks(was, p, panelBase);
      this.waiting.delete(fp);
    }
    // The key delivered to itself, with the private act it belongs to (7.3).
    const own = deliveredToItself(req);
    if (own && req.line === 'apart') {
      const of = f.log.find((x) => x.app === p.id && x.identity === req.identity && x.act === own.target && x.companion === sha256(keyDeliveryPayload(own.target, own.key, false)));
      if (of) return { signed: wire(this.sign(h, p, req, of.kind, [`The key of ${of.act.slice(0, 8)}… delivered to the identity itself, for its own apps.`], { standing: true, of: of.act })) };
    }
    const kind = kindOf(req);
    const words = wordsOf(req, p.name);
    if (!ALWAYS_ASKS.includes(kind) && p.yes.includes(kind)) return { signed: wire(this.sign(h, p, req, kind, words, { standing: true })) };
    const w: Waiting = { fp, app: p.id, identity: req.identity, kind, words, req, at: this.now(), nonce: null, wake: [] };
    this.waiting.set(fp, w);
    return this.asks(w, p, panelBase);
  }

  private asks(w: Waiting, p: Pairing, panelBase: string): Answer {
    return { asks: { request: w.fp, panel: `${panelBase}/runner/panel/${w.fp}`, kind: w.kind, title: `${p.name} asks Kišib to sign ${KIND_ONE[w.kind]}` } };
  }

  /** Sign, keep what is signed, and the line's act for its card. */
  private sign(h: HeldId, p: Pairing, req: SignRequest, kind: Kind, words: string[], o: { standing?: boolean; of?: string } = {}) {
    const f = this.file();
    const made = makeEveryday({
      signingSecret: unhex(h.secret),
      signer: h.id,
      binding: h.binding,
      spec: req.spec,
      type: req.type,
      payload: req.payload,
      sequence: req.sequence,
      public: req.public,
      to: req.to,
      objects: req.objects,
      refs: req.refs,
      acks: req.acks,
    }) as { act: Uint8Array; id: string; key: Uint8Array };
    const entry: Signed = { at: Math.floor(this.now() / 1000), app: p.id, appName: p.name, identity: h.id, kind, words, act: made.id, line: req.line, position: req.sequence.length, ...(o.standing ? { standing: true } : {}), ...(o.of ? { of: o.of } : {}) };
    if (!req.public && req.line !== 'apart') entry.companion = sha256(keyDeliveryPayload(made.id, made.key, false));
    f.log.push(entry);
    if (req.line !== 'apart') {
      const line = req.line;
      f.lines = f.lines.filter((l) => !(l.identity === h.id && l.app === p.id && l.line === line));
      f.lines.push({ identity: h.id, app: p.id, appName: p.name, binding: h.binding, line, ids: [...req.sequence, made.id] });
    }
    this.save();
    return made;
  }

  /** A waiting request answered, by its panel (4.4) or by Kišib's page (4.5). */
  private answer(w: Waiting, yes: boolean, always: boolean): void {
    if (w.made || w.declined) return;
    const f = this.file();
    const p = f.apps.find((x) => x.id === w.app && x.state === 'approved');
    const h = f.held.find((x) => x.id === w.identity);
    if (!p || !h) {
      this.settle(w, { declined: true });
      throw new Error('This app or this identity is no longer paired here. Nothing was signed.');
    }
    if (!yes) return this.settle(w, { declined: true });
    if (always && !ALWAYS_ASKS.includes(w.kind)) p.yes = [...new Set([...p.yes, w.kind])];
    this.settle(w, { made: this.sign(h, p, w.req, w.kind, w.words) });
  }

  private settle(w: Waiting, o: { made?: Waiting['made']; declined?: boolean }) {
    if (o.made) w.made = o.made;
    if (o.declined) w.declined = true;
    w.nonce = null;
    for (const f of w.wake.splice(0)) f();
  }

  /** Drop what waited past its life (4.5): nothing signed. */
  private sweep() {
    const now = this.now();
    for (const [fp, w] of this.waiting) {
      const over = now - w.at > WAIT_LIFE;
      if (over && !w.made && !w.declined) this.settle(w, { declined: true });
      if (over) this.waiting.delete(fp);
    }
  }

  /** An app asks for its request's answer, waiting up to `wait` seconds (4.5). */
  async result(token: string | undefined, a: { request: string; wait?: number }): Promise<Answer> {
    const p = this.pairingOf(token);
    this.sweep();
    const w = this.waiting.get(a.request);
    if (!w || w.app !== p.id) return { expired: true };
    if (!w.made && !w.declined && a.wait) {
      await new Promise<void>((resolve) => {
        const t = setTimeout(resolve, Math.min(30, Math.max(0, a.wait!)) * 1000);
        w.wake.push(() => {
          clearTimeout(t);
          resolve();
        });
      });
    }
    if (w.made) return { signed: wire(w.made) };
    if (w.declined) return { declined: true };
    return { waiting: true };
  }

  /** An app withdraws its request: nothing signed. */
  drop(token: string | undefined, a: { request: string }): void {
    const p = this.pairingOf(token);
    const w = this.waiting.get(a.request);
    if (w && w.app === p.id && !w.made) {
      this.settle(w, { declined: true });
      this.waiting.delete(a.request);
    }
  }

  /** Answered in Kišib's own page (Runner, Waiting). */
  pageAnswer(a: { request: string; yes: boolean; always?: boolean }): RunnerView {
    this.sweep();
    const w = this.waiting.get(a.request);
    if (!w || w.made || w.declined) throw new Error('This request waits no more: answered, withdrawn, or past its ten minutes. Nothing was signed now.');
    this.answer(w, a.yes, !!a.always);
    return this.view();
  }

  // ------------------------------------------------------------ the panel (section 4)

  /** The panel's request, and the origins allowed to frame it (4.2); null where none waits. */
  panelFor(fp: string): { w: Waiting; app: Pairing; held: HeldId; ancestors: string[]; nonce: string } | null {
    if (!this.f) return null;
    this.sweep();
    const w = this.waiting.get(fp);
    if (!w || w.made || w.declined) return null;
    const app = this.f.apps.find((x) => x.id === w.app && x.state === 'approved');
    const held = this.f.held.find((x) => x.id === w.identity);
    if (!app || !held) return null;
    w.nonce = randomBytes(24).toString('hex');
    return { w, app, held, ancestors: originsOf(app.origin), nonce: w.nonce };
  }

  /** The origins a request's panel may be framed by, even once answered (its answer page). */
  ancestorsOf(fp: string): string[] {
    const w = this.waiting.get(fp);
    const app = w && this.f?.apps.find((x) => x.id === w.app);
    return app ? originsOf(app.origin) : [];
  }

  /** The click inside the panel (4.4): its single-use value checked, then answered. */
  panelAnswer(fp: string, a: { nonce: string; yes: boolean; always: boolean }): 'signed' | 'declined' | 'stale' {
    const w = this.waiting.get(fp);
    if (!w || !w.nonce || !a.nonce || w.nonce.length !== a.nonce.length || !timingSafeEqual(Buffer.from(w.nonce), Buffer.from(a.nonce))) return 'stale';
    w.nonce = null;
    this.answer(w, a.yes, a.always);
    return w.made ? 'signed' : 'declined';
  }

  /** Who the panel names, and its kind's words. */
  panelWords(x: NonNullable<ReturnType<Runner['panelFor']>>): { title: string; as: string; words: string[]; always: string | null } {
    const { w, app, held } = x;
    return {
      title: `${app.name} asks Kišib to sign ${KIND_ONE[w.kind]}`,
      as: `As ${held.name ?? 'this identity'} · ${short(idForm(held.id))} · ${w.req.public ? 'public' : 'private'}`,
      words: w.words,
      always: ALWAYS_ASKS.includes(w.kind) ? null : `Always yes for ${app.name}’s ${KIND_NAME[w.kind]}`,
    };
  }

  // ------------------------------------------------------------ lines (section 7)

  /** The cards of the lines this runner signed for an identity, under its current binding (7.2): for a change of keys. */
  cards(id: string): string {
    const f = this.f;
    const h = f?.held.find((x) => x.id === id);
    if (!f || !h) return '';
    return f.lines
      .filter((l) => l.identity === id && l.binding === h.binding && l.ids.length)
      .map((l) => cardText({ ...ownLine(l.ids).card!, hidden: l.line === 'private' ? l.ids.length : 0, line: l.line }, l.appName))
      .join('; ');
  }

  /** An act the runner signed, as any reader of its signer's homes judges it now (for its card's "Why it's valid"). */
  async standing(a: { act: string; identity: string }): Promise<{ lines: { text: string; tone?: 'ok' | 'warn' | 'bad' }[] }> {
    const h = this.f?.held.find((x) => x.id === a.identity);
    const hints = h?.homes.map((x) => x.hint) ?? [];
    if (!hints.length) return { lines: [{ text: 'The runner no longer holds this identity: its homes are not known here.', tone: 'warn' }] };
    try {
      const look = await lookUp(a.identity, hints, this.via);
      let bytes: Uint8Array | null = null;
      for (const hint of hints) {
        bytes = await relayAt(hint, this.via).getAct(a.act).catch(() => null);
        if (bytes) break;
      }
      if (!bytes) return { lines: [{ text: 'Its homes do not hold this act (yet): the app sends it, and a private act waits there locked.', tone: 'warn' }] };
      look.verifier.add(bytes);
      const st = look.verifier.status(a.act) as string;
      return { lines: [{ text: st === 'valid' ? 'Valid: signed with the identity’s signing key in force, on a line its chain keeps.' : `Judged ${st} by the core library, as any reader of its homes would.`, tone: st === 'valid' ? 'ok' : 'bad' }] };
    } catch (e) {
      return { lines: [{ text: `Its homes could not be read: ${message(e)}`, tone: 'warn' }] };
    }
  }

  // ------------------------------------------------------------ what Kišib's page shows

  view(): RunnerView {
    const f = this.f;
    this.sweep();
    const name = (id: string) => f?.held.find((h) => h.id === id)?.name ?? null;
    return {
      on: !!f,
      since: f?.since ?? null,
      risk: RISK_SAY,
      held: (f?.held ?? []).map((h) => ({ id: h.id, form: idForm(h.id), name: h.name, spent: !!h.spent, homes: h.homes.map((x) => x.hint), apps: (f?.apps ?? []).filter((p) => p.state === 'approved' && p.identities.includes(h.id)).map((p) => p.name) })),
      apps: (f?.apps ?? []).map((p) => ({ id: p.id, name: p.name, origin: p.origin, code: p.code, state: p.state, identities: p.identities, yes: p.yes, asked: p.asked, approved: p.approved ?? null })),
      waiting: [...this.waiting.values()]
        .filter((w) => !w.made && !w.declined)
        .map((w) => {
          const app = f?.apps.find((p) => p.id === w.app);
          return { request: w.fp, app: app?.name ?? 'an app', identity: w.identity, name: name(w.identity), kind: w.kind, title: `${app?.name ?? 'An app'} asks Kišib to sign ${KIND_ONE[w.kind]}`, words: w.words, at: Math.floor(w.at / 1000), always: ALWAYS_ASKS.includes(w.kind) };
        }),
      signed: (f?.log ?? [])
        .slice()
        .reverse()
        .map((s) => ({ at: s.at, app: s.appName, identity: s.identity, name: name(s.identity), kind: s.kind, words: s.words, act: s.act, standing: !!s.standing, line: s.line, position: s.position })),
      kinds: KINDS.map((k) => ({ kind: k, name: KIND_NAME[k], always: ALWAYS_ASKS.includes(k) })),
    };
  }
}

const short = (form: string) => {
  const one = form.indexOf('1');
  return one < 0 || form.length < one + 10 ? form : `${form.slice(0, one + 4)}…${form.slice(-3)}`;
};

const wire = (m: { act: Uint8Array; id: string; key: Uint8Array }) => ({ act: base64(m.act), id: m.id, key: base64(m.key) });

/** A request as an app sends it (3.1), read from JSON: the payload in base64. */
export function readRequest(v: unknown): SignRequest {
  const o = (v ?? {}) as Record<string, unknown>;
  const str = (x: unknown, what: string) => {
    if (typeof x !== 'string') throw new RunnerRefusal(400, `The request’s ${what} is missing. Nothing was signed.`);
    return x;
  };
  const h64 = (x: unknown, what: string) => {
    const s = str(x, what);
    if (!/^[0-9a-f]{64}$/.test(s)) throw new RunnerRefusal(400, `The request’s ${what} is not a hash. Nothing was signed.`);
    return s;
  };
  const list = (x: unknown, what: string): string[] | undefined => (x === undefined || x === null ? undefined : Array.isArray(x) ? x.map((y) => h64(y, what)) : (() => { throw new RunnerRefusal(400, `The request’s ${what} is not a list. Nothing was signed.`); })());
  const line = str(o.line, 'line');
  if (line !== 'public' && line !== 'private' && line !== 'apart') throw new RunnerRefusal(400, 'The request names no line: public, private or apart. Nothing was signed.');
  const type = o.type;
  if (typeof type !== 'number' || !Number.isInteger(type) || type < 0) throw new RunnerRefusal(400, 'The request’s type is not a number. Nothing was signed.');
  const payload = Uint8Array.from(Buffer.from(str(o.payload, 'payload'), 'base64'));
  const pair = (x: unknown): [string, string] => (Array.isArray(x) && x.length === 2 ? [h64(x[0], 'objects'), h64(x[1], 'objects')] : (() => { throw new RunnerRefusal(400, 'The request’s objects are not pairs. Nothing was signed.'); })());
  const refs = o.refs === undefined || o.refs === null ? undefined : Array.isArray(o.refs) ? o.refs.map((r) => (typeof r === 'string' ? h64(r, 'refs') : pair(r))) : undefined;
  return {
    identity: h64(o.identity, 'identity'),
    binding: h64(o.binding, 'binding'),
    line,
    sequence: list(o.sequence, 'sequence') ?? [],
    spec: h64(o.spec, 'specification'),
    type,
    payload,
    public: o.public === true,
    ...(list(o.to, 'to') ? { to: list(o.to, 'to') } : {}),
    ...(Array.isArray(o.objects) ? { objects: o.objects.map(pair) } : {}),
    ...(refs ? { refs } : {}),
    ...(list(o.acks, 'acks') ? { acks: list(o.acks, 'acks') } : {}),
  };
}

/** A request as an app writes it (3.1), for JSON. */
export function writeRequest(r: SignRequest): Record<string, unknown> {
  return { ...r, payload: base64(r.payload) };
}
