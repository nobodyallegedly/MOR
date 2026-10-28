// The Dubsar runner (the Dubsar runner cMIP, draft 2, `cmips/cmip-runner-draft-2.md`):
// Kišib signs for the apps paired with it, on this computer only, from the
// signing keys of the identities given to it. Decided by Nobody, allegedly
// (`docs/design/suite-redesign.md`, "The Dubsar runner cMIP"): the computer's
// program only, never the web client ("not on web", draft 2);
// off by default, no key stored while off; turned on with the risk stated
// first; the chain key never kept; pairing started in the app and approved
// here; the approval panel drawn inside the asking app's window, in a frame
// it cannot read or change; standing yeses per app and kind, money,
// agreements, relying and keys always asking.
//
// Draft 2 (decided by Nobody, allegedly, 22 October 2026): what it keeps is
// encrypted at rest under a passphrase chosen when it is turned on and asked
// each time Kišib starts (a key derived with scrypt, the file sealed with
// AES-256-GCM); locked and off are two states (closed, it is locked and
// keeps everything, encrypted; off, it erases everything); an app approved
// for it may have what is sealed to an identity opened, each opening listed.
//
// What it keeps, while on, in Kišib's folder (`runner.json`, owner only,
// never in the clear): the identities given (their signing keys), the
// pairings (a hash of each app's token, never the token), and what it signed
// and opened. Requests waiting for an answer live in memory. Turned off, the
// file is overwritten and removed: nothing of the runner remains.
//
// TEST IDENTITIES ONLY, until MOR is frozen.

import { closeSync, existsSync, openSync, readFileSync, renameSync, rmSync, statSync, writeSync, writeFileSync } from 'node:fs';
import { createCipheriv, createDecipheriv, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { join } from 'node:path';
import { base64, cborEncode, describeAct, hex, keyDeliveryPayload, makeEveryday, openSealed, openWithKey, sha256, signingPublic, unhex } from '../../genesis/src/core.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { cardText, ownLine } from '../../genesis/src/lines.ts';
import { TestIdentity, type Home, type IdentityFile, type SignRequest } from '../../genesis/src/identity.ts';
import { relayAt, sealedId, type Via } from '../../genesis/src/transport.ts';
import { idForm, idWhere, readId } from '../../genesis/src/forms.ts';
import type { Opener } from '../../kit/src/engine/people.ts';
import { Refused as WordsRefused, encryptionSecret, fromWords } from '../../../modules/carry/src/carry.ts';
import { lookCurrent, NOT_CURRENT } from '../../dub/src/carryin.ts';
import { namesOf } from '../../dub/src/names.ts';
import { ALWAYS_ASKS, KIND_NAME, KIND_ONE, KINDS, deliveredToItself, kindOf, refusedOutright, wordsOf, type Kind, type RunnerRequest } from './runner-read.ts';
import { memberKeyFor, readMemberKeys } from '../../grants/src/member.ts';

export type { Kind, RunnerRequest };
export { KIND_NAME, KINDS, ALWAYS_ASKS };

/** Said before the runner is turned on, and read (6.2; draft 2: the passphrase). */
export const RISK_SAY = [
  'Kišib keeps the signing keys of the identities you give it on this Mac, in its folder, encrypted under a passphrase you choose now. The chain key: never.',
  'Whoever gets into this Mac while Kišib is open and unlocked can sign as those identities through Kišib, within what you allowed. Kišib’s folder alone gives them nothing without the passphrase.',
  'Still at risk: someone who saw your passphrase typed, or who guesses it; a Mac taken, or a program running as you, while Kišib is open and unlocked.',
  'Forget the passphrase, and the runner cannot be opened again: turn it off, which erases everything, and give the signing words again.',
  'Quitting Kišib (from its page, or its seal in the menu bar), or restarting the Mac, locks the runner, and so does Lock now: its keys, apps and log stay, encrypted, until the passphrase is given again. Closing Kišib’s window does not: its program keeps running, unlocked.',
  'Its panel is drawn by Kišib inside the asking app’s window. A malicious app could cover it or trick a click: a gap you accept.',
  'Money, agreements, relying on another’s act, and keys always ask, even with a standing yes.',
  'An app you let open what is sealed to an identity reads its private messages through Kišib without asking each time; each opening is listed.',
  'Turning the runner off erases every key it holds, every app paired with it and what it signed and opened.',
];

/** Said where the runner refuses because it is off (6.1). */
export const OFF_SAY = 'Kišib’s runner is off: it signs for no app. Turn it on in Kišib (Runner), knowing the risk, or sign with the identity’s own words. Nothing was signed.';

/** Said where the runner refuses because it is locked (draft 2, 6.2). Its first words are how an app knows it. */
export const LOCKED_SAY = 'Kišib is locked: its runner signs and opens nothing until its passphrase is given in Kišib (Runner). Open Kišib and give it; nothing has to be paired again. Nothing was signed.';

/** Said where a passphrase does not open the runner (draft 2, 6.2). */
export const WRONG_SAY = 'That passphrase does not open Kišib’s runner: nothing was opened. Forgotten, it cannot be found again: turn the runner off (it erases everything) and give the signing words again.';

/** Said where an app may not open what is sealed to an identity (draft 2, section 8). Its first words are how an app knows it. */
export const NO_OPEN_SAY = 'Kišib does not open what is sealed to this identity for this app: it may send, not read. To allow it, in Kišib: Runner, Apps, the app, “may open what is sealed to this identity” beside the identity. Nothing was opened.';

/** Said where an app asks to sign as a collective whose key Kišib does not hold for the identity (draft 3, 9.2). */
export const NO_MEMBER_SAY = 'Kišib holds no key of this identity for that collective: ask Kišib to add it (from the app: the collective, Add it in Kišib), then approve it in Kišib (Identities, Held here). Nothing was signed.';

/** Said when a lane's key delivery is signed without a panel (draft 3, 7.5). */
const LANE_WORDS = (app: string) => `The key of a payment ${app} signed under its own lane, delivered to the identity itself, so that Damgar keeps its record. It moves no money, and gives nothing to anyone else.`;

/** The identities an app may have what is sealed to them opened (draft 3, per identity; draft 2's one choice read as all of them). */
export const opensOf = (p: { identities: string[]; open?: boolean; opens?: string[] }): string[] => (p.opens ?? (p.open ? p.identities : [])).filter((x) => p.identities.includes(x));

/** The passphrase's shortest length (draft 2, 6.2). */
export const PASSPHRASE_MIN = 8;

/** The key derivation (draft 2, 6.3): scrypt, RFC 7914, 128 MiB of memory. */
const KDF = { name: 'scrypt', N: 1 << 17, r: 8, p: 1 } as const;
const CIPHER = 'aes-256-gcm';

/** Said where the key the runner holds no longer counts (3.5; H80). Its first words are how an app knows it. */
export const RUNNER_SPENT_SAY =
  'This identity’s signing key was changed with its chain key, so the signing key Kišib’s runner holds no longer counts. Nothing was signed. Give the runner the new signing key’s words, in Kišib: Runner, Identities held here.';

/** How long a request waits for its answer, in milliseconds (4.5). */
export const WAIT_LIFE = 10 * 60 * 1000;

const FILE = 'runner.json';
/** Draft 1's file, in the clear: read once, to be sealed under a passphrase. */
const LABEL_1 = 'MOR Kišib runner: signing keys, kept while the runner is on. TEST IDENTITIES ONLY.';
const LABEL = 'MOR Kišib runner, draft 2: signing keys, pairings and log, encrypted under a passphrase. TEST IDENTITIES ONLY.';
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
  /** Draft 3: its own keys for its collectives, opened from its homes, kept with it (decided: "kišib should be able to hold your key and the keys you hold for your collectives"). */
  members?: HeldMember[];
}

/** A member key held for an identity (draft 3, section 9): the member keys cMIP's, its secret kept here only. */
interface HeldMember {
  collective: string;
  /** The sealed act it came in. */
  act: string;
  /** The founding or clone that named it, and the identity's signature act naming it (the binding of the acts it signs). */
  terms: string;
  signature: string;
  public: [number, string];
  /** Its private half, hex: never returned to an app. */
  secret: string;
  position: number;
  added: number;
  /** The collective's published name, as read when the key was added: said in the panel beside its ID. */
  name?: string | null;
}

/** An app's ask that Kišib hold a collective's key for an identity (draft 3, 9.1): waiting for the person, in Kišib. */
interface MemberAsk {
  id: string;
  app: string;
  appName: string;
  identity: string;
  collective: string;
  /** Where the app reads the collective: its places, to find which founding names the key. */
  places: string[];
  at: number;
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
  /** Draft 2: may have what is sealed to its identities opened (off unless chosen). Read as every identity it may use (draft 3). */
  open?: boolean;
  /** Draft 3: the identities whose sealed acts it may have opened, each chosen (decided: "per identity, per app"). */
  opens?: string[];
  asked: number;
  approved?: number;
  /** Draft 4 (2.1a, H126): the app's stated needs, as it wrote them: shown beside the box, never ticking it. */
  needs?: Needs;
}

/** An app's stated needs (draft 4, 2.1a): per permission the runner defines (today, opening), why and without it. */
export interface Needs {
  opening?: { why: string; without: string };
}

/** The longest a stated need's words may be (2.1a). */
export const NEED_MAX = 300;

/**
 * The needs an app states in its pairing request (draft 4, 2.1a): only the
 * permissions the runner defines (one today, `opening`); any other dropped,
 * said nowhere. Each in plain words, at most 300 characters: longer, or
 * holding a control character, the pairing is refused, said plainly.
 */
export function readNeeds(v: unknown): Needs | undefined {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return undefined;
  const o = (v as Record<string, unknown>).opening;
  if (!o || typeof o !== 'object') return undefined;
  const words = (x: unknown, what: string) => {
    const t = (typeof x === 'string' ? x : '').normalize('NFC').trim();
    if (!t) throw new RunnerRefusal(400, `The app’s stated need says no ${what}. Nothing was paired.`);
    if ([...t].length > NEED_MAX) throw new RunnerRefusal(400, `The app’s stated need is longer than ${NEED_MAX} characters (${what}). Nothing was paired.`);
    if (/[\u0000-\u001f\u007f-\u009f\u2028\u2029\u202a-\u202e\u2066-\u2069]/u.test(t)) throw new RunnerRefusal(400, `The app’s stated need holds a line break or a control character (${what}). Nothing was paired.`);
    return t;
  };
  const r = o as Record<string, unknown>;
  return { opening: { why: words(r.why, 'why it needs it'), without: words(r.without, 'what it cannot do without it') } };
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
  line: RunnerRequest['line'];
  position: number;
  /** For a private act: SHA-256 of the key delivery that leaves its content key to the identity itself (7.3). */
  companion?: string;
  /** For the key delivered to itself: the act whose key it delivers. */
  of?: string;
  /** Signed without a panel: under a standing yes, or as an act's companion. */
  standing?: boolean;
  /** Draft 2: an opening, not a signature: what was sealed to the identity, opened for the app. */
  opened?: boolean;
  /** For an opening: the sealed container's ID, and how many times the app had it opened. */
  sealed?: string;
  times?: number;
  /** Draft 3: signed as this collective, with the identity's member key. */
  as?: string;
  /** Draft 3: the key of an act signed under the app's own lane, delivered to the identity itself, without a panel. */
  lane?: boolean;
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
  /** Draft 3: the collectives' keys apps asked Kišib to hold, waiting for the person. */
  memberAsks?: MemberAsk[];
}

/** The runner's file on disk (draft 2, 6.3): everything sealed under the passphrase's key. */
interface Envelope {
  label: string;
  kdf: { name: 'scrypt'; N: number; r: number; p: number; salt: string };
  cipher: typeof CIPHER;
  nonce: string;
  /** The ciphertext and its 16-byte tag, base64. */
  sealed: string;
}

/** The key from a passphrase (draft 2, 6.3). */
function derive(passphrase: string, k: Envelope['kdf']): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(passphrase.normalize('NFC'), Buffer.from(k.salt, 'base64'), 32, { N: k.N, r: k.r, p: k.p, maxmem: 256 * k.N * k.r }, (e, key) => (e ? reject(e) : resolve(key))),
  );
}

/** What the envelope's tag also covers: its label and how its key is derived, so neither can be changed unseen. */
const aad = (e: Pick<Envelope, 'label' | 'kdf' | 'cipher'>) => Buffer.from(JSON.stringify([e.label, e.kdf, e.cipher]));

/** A request waiting for the person (4.5), in memory only. */
interface Waiting {
  fp: string;
  app: string;
  identity: string;
  kind: Kind;
  words: string[];
  req: RunnerRequest;
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

/** The runner's state (draft 2): off (nothing kept), locked (kept, encrypted, its passphrase not given since Kišib started), or on. */
export type RunnerState = 'off' | 'locked' | 'on';

/** What Kišib's page shows of the runner. */
export interface RunnerView {
  /** On and unlocked: signing for its apps. */
  on: boolean;
  state: RunnerState;
  /** Locked, with draft 1's file in the clear: a passphrase is chosen to seal it. */
  upgrade: boolean;
  since: number | null;
  risk: string[];
  /** Each identity held: its ID, its ID link (H88: one of its homes, for Share your ID link), the name it published as read when given. */
  held: { id: string; form: string; link: string; name: string | null; spent: boolean; apps: string[]; homes: string[]; members: { collective: string; form: string; added: number }[] }[];
  /** Draft 3: the collectives' keys apps asked Kišib to hold, waiting for an answer here. */
  memberAsks: { id: string; app: string; identity: string; name: string | null; collective: string; form: string; at: number }[];
  apps: { id: string; name: string; origin: string; code: string; state: Pairing['state']; identities: string[]; yes: Kind[]; opens: string[]; asked: number; approved: number | null; needs: Needs }[];
  /** `as`: for an act as a collective (draft 3, 9.2), which key signs, said plainly, the IDs whole. */
  waiting: { request: string; app: string; identity: string; name: string | null; as: string | null; kind: Kind; title: string; words: string[]; at: number; always: boolean }[];
  signed: { at: number; app: string; identity: string; name: string | null; kind: Kind; words: string[]; act: string; standing: boolean; line: string; position: number; opened: boolean; sealed: string | null; times: number; as: string | null; lane: boolean }[];
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
export function requestPrint(r: RunnerRequest): string {
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
      // Draft 3: an act of a collective names it; draft 2's requests keep their fingerprint.
      ...(r.as !== undefined ? [r.as] : []),
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
  /** What the runner keeps, in memory while on (unlocked) only. */
  private f: RunnerFile | null = null;
  /** The key derived from the passphrase, in memory while on only; and how it was derived. */
  private key: Buffer | null = null;
  private kdf: Envelope['kdf'] | null = null;
  /** Locked: the file as read from disk, encrypted. */
  private env: Envelope | null = null;
  /** Locked, with draft 1's file in the clear: read, to be sealed under a passphrase chosen now. */
  private legacy: RunnerFile | null = null;
  private waiting = new Map<string, Waiting>();

  constructor(
    readonly dir: string,
    private readonly opts: { now?: () => number; via?: Via } = {},
  ) {
    const p = join(dir, FILE);
    if (existsSync(p)) {
      try {
        const f = JSON.parse(readFileSync(p, 'utf8')) as Envelope & RunnerFile;
        // Kišib started with the runner on: it is locked until its passphrase is given (draft 2, 6.2).
        if (f.label === LABEL && f.kdf?.name === 'scrypt' && f.cipher === CIPHER) this.env = f;
        else if (f.label === LABEL_1 && Array.isArray(f.held)) this.legacy = f;
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

  /** Off, locked or on (draft 2). */
  get state(): RunnerState {
    return this.f ? 'on' : this.env || this.legacy ? 'locked' : 'off';
  }

  /** Everything kept, sealed under the passphrase's key with a fresh nonce, and written: never in the clear (draft 2, 6.3). */
  private save() {
    if (!this.f || !this.key || !this.kdf) return;
    const p = join(this.dir, FILE);
    const head = { label: LABEL, kdf: this.kdf, cipher: CIPHER } as const;
    const nonce = randomBytes(12);
    const c = createCipheriv(CIPHER, this.key, nonce);
    c.setAAD(aad(head));
    const body = Buffer.concat([c.update(JSON.stringify(this.f), 'utf8'), c.final(), c.getAuthTag()]);
    const env: Envelope = { ...head, nonce: nonce.toString('base64'), sealed: body.toString('base64') };
    writeFileSync(`${p}.tmp`, JSON.stringify(env) + '\n', { mode: 0o600 });
    renameSync(`${p}.tmp`, p);
  }

  private file(): RunnerFile {
    if (!this.f) throw new RunnerRefusal(this.state === 'locked' ? 423 : 403, this.state === 'locked' ? LOCKED_SAY : OFF_SAY);
    return this.f;
  }

  /** A passphrase chosen: typed twice, long enough (draft 2, 6.2). */
  private static chosen(a: { passphrase?: string; again?: string }): string {
    const pass = a.passphrase ?? '';
    if ([...pass].length < PASSPHRASE_MIN) throw new Error(`Choose a passphrase of at least ${PASSPHRASE_MIN} characters. The runner stays as it was.`);
    if (pass !== a.again) throw new Error('The passphrase typed twice differs: type it again, the same both times. The runner stays as it was.');
    return pass;
  }

  /** A fresh key from a passphrase chosen now, with its own salt. */
  private async newKey(pass: string): Promise<void> {
    const kdf = { ...KDF, salt: randomBytes(16).toString('base64') };
    this.key = await derive(pass, kdf);
    this.kdf = kdf;
  }

  // ------------------------------------------------------------ on, locked and off (section 6)

  /** Turn the runner on, once its risk was read, with a passphrase chosen, typed twice (6.2). Nothing is kept yet. */
  async turnOn(a: { read: boolean; passphrase?: string; again?: string }): Promise<RunnerView> {
    if (this.f) return this.view();
    if (this.state === 'locked') throw new Error('Kišib’s runner is locked, not off: give its passphrase to open it, or turn it off to start from nothing.');
    if (!a.read) throw new Error('Read the risk, and say so, before the runner is turned on. It stays off.');
    const pass = Runner.chosen(a);
    await this.newKey(pass);
    this.f = { label: LABEL, since: Math.floor(this.now() / 1000), held: [], apps: [], log: [], lines: [] };
    this.save();
    return this.view();
  }

  /**
   * Unlock the runner with its passphrase (6.2): everything back as it was
   * when Kišib closed, no app paired again. A wrong passphrase opens nothing.
   * Draft 1's file, in the clear, is sealed under the passphrase chosen now
   * (typed twice), and the clear one overwritten.
   */
  async unlock(a: { passphrase?: string; again?: string }): Promise<RunnerView> {
    if (this.f) return this.view();
    if (this.legacy) {
      const pass = Runner.chosen(a);
      await this.newKey(pass);
      this.f = { ...this.legacy, label: LABEL };
      this.legacy = null;
      erase(join(this.dir, FILE));
      this.save();
      return this.view();
    }
    const env = this.env;
    if (!env) throw new Error('Kišib’s runner is off: there is nothing to unlock. Turn it on to start.');
    const key = await derive(a.passphrase ?? '', env.kdf);
    let f: RunnerFile;
    try {
      const body = Buffer.from(env.sealed, 'base64');
      const d = createDecipheriv(CIPHER, key, Buffer.from(env.nonce, 'base64'));
      d.setAAD(aad(env));
      d.setAuthTag(body.subarray(body.length - 16));
      f = JSON.parse(Buffer.concat([d.update(body.subarray(0, body.length - 16)), d.final()]).toString('utf8')) as RunnerFile;
    } catch {
      key.fill(0);
      throw new RunnerRefusal(403, WRONG_SAY);
    }
    this.f = f;
    this.key = key;
    this.kdf = env.kdf;
    this.env = null;
    return this.view();
  }

  /**
   * Lock now, without quitting Kišib (6.4): the key derived from the
   * passphrase and everything opened forgotten from memory; the file on disk
   * stays, encrypted; the passphrase is asked again. Requests waiting are
   * dropped, nothing signed.
   */
  lock(): RunnerView {
    if (!this.f) return this.view();
    this.save();
    const p = join(this.dir, FILE);
    const env = JSON.parse(readFileSync(p, 'utf8')) as Envelope;
    for (const w of this.waiting.values()) this.settle(w, { declined: true });
    this.waiting.clear();
    for (const h of this.f.held) wipe(h);
    this.key?.fill(0);
    this.f = this.key = this.kdf = null;
    this.env = env;
    return this.view();
  }

  /** Turn it off (6.5), from on or locked: every key, pairing and record erased; the file overwritten, then removed. */
  turnOff(): RunnerView {
    const p = join(this.dir, FILE);
    for (const w of this.waiting.values()) this.settle(w, { declined: true });
    this.waiting.clear();
    for (const h of [...(this.f?.held ?? []), ...(this.legacy?.held ?? [])]) wipe(h);
    this.key?.fill(0);
    this.f = this.key = this.kdf = this.env = this.legacy = null;
    for (const x of [p, `${p}.tmp`]) erase(x);
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
    if (h) wipe(h);
    f.memberAsks = (f.memberAsks ?? []).filter((x) => x.identity !== a.id);
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
  pair(a: { name: string; origin: string; needs?: unknown }): { pairing: string; code: string; token: string } {
    const f = this.file();
    const name = a.name.trim();
    if (!name || name.length > 40 || /[\u0000-\u001f]/.test(name)) throw new RunnerRefusal(400, 'An app names itself in a few words. Nothing was paired.');
    const origin = readOrigin(a.origin);
    const needs = readNeeds(a.needs);
    // At most a few waiting at once: a program asking again and again is not shown more.
    f.apps = f.apps.filter((p) => !(p.state === 'waiting' && p.origin === origin && p.name === name));
    if (f.apps.filter((p) => p.state === 'waiting').length >= 5) throw new RunnerRefusal(429, 'Too many pairings wait in Kišib: answer them first.');
    const token = randomBytes(32).toString('hex');
    const bytes = randomBytes(8);
    const code = [...bytes].map((b) => ALPHABET[b % 32]).join('').replace(/^(.{4})/, '$1-');
    const p: Pairing = { id: randomBytes(8).toString('hex'), name, origin, token: tokenHash(token), code, state: 'waiting', identities: [], yes: [], asked: Math.floor(this.now() / 1000), ...(needs ? { needs } : {}) };
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
  paired(token: string | undefined): {
    state: Pairing['state'];
    name: string;
    code: string;
    opens: string[];
    identities: { id: string; name: string | null; binding: string; key: string; spent: boolean; homes: string[]; members: { collective: string; terms: string; signature: string; position: number }[] }[];
    asked: { identity: string; collective: string }[];
  } {
    const p = this.pairingOf(token, false);
    const f = this.file();
    return {
      state: p.state,
      name: p.name,
      code: p.code,
      opens: p.state === 'approved' ? opensOf(p) : [],
      identities:
        p.state === 'approved'
          ? f.held
              .filter((h) => p.identities.includes(h.id))
              // Draft 3: the member keys held for it, their public parts only (never a secret).
              .map((h) => ({ id: h.id, name: h.name, binding: h.binding, key: hex(signingPublic(unhex(h.secret))), spent: !!h.spent, homes: h.homes.map((x) => x.hint), members: (h.members ?? []).map((m) => ({ collective: m.collective, terms: m.terms, signature: m.signature, position: m.position })) }))
          : [],
      asked: (f.memberAsks ?? []).filter((x) => x.app === p.id).map((x) => ({ identity: x.identity, collective: x.collective })),
    };
  }

  /** Approve a pairing (2.2), with the identities the app may use, and whether it may have what is sealed to them opened (draft 2, 8.1). */
  approve(a: { pairing: string; identities: string[]; opens?: string[] }): RunnerView {
    const f = this.file();
    const p = f.apps.find((x) => x.id === a.pairing);
    if (!p) throw new Error('No such pairing waits here.');
    const ids = a.identities.filter((x) => f.held.some((h) => h.id === x));
    if (!ids.length) throw new Error('Choose at least one identity the app may use: give one to the runner first (Runner, Add an identity to the runner).');
    // H124: approved once, it keeps its place; changing its identities later does not move it.
    const first = p.state !== 'approved';
    p.state = 'approved';
    p.identities = ids;
    if (a.opens !== undefined) p.opens = a.opens.filter((x) => ids.includes(x));
    else if (p.opens) p.opens = p.opens.filter((x) => ids.includes(x));
    delete p.open;
    if (first || !p.approved) p.approved = Math.floor(this.now() / 1000);
    this.save();
    return this.view();
  }

  /** Change which identities an approved app may use. */
  allow(a: { pairing: string; identities: string[] }): RunnerView {
    const p = this.file().apps.find((x) => x.id === a.pairing && x.state === 'approved');
    if (!p) throw new Error('No such app is paired here.');
    return this.approve(a);
  }

  /** Let an approved app have what is sealed to one of its identities opened, or no more (draft 3: per identity, per app). */
  setOpen(a: { pairing: string; identity: string; on: boolean }): RunnerView {
    const p = this.file().apps.find((x) => x.id === a.pairing && x.state === 'approved');
    if (!p) throw new Error('No such app is paired here.');
    if (!p.identities.includes(a.identity)) throw new Error('This app does not use that identity through Kišib.');
    const now = opensOf(p);
    p.opens = a.on ? [...new Set([...now, a.identity])] : now.filter((x) => x !== a.identity);
    delete p.open;
    this.save();
    return this.view();
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
    if (ALWAYS_ASKS.includes(k)) throw new Error('Money, agreements, relying on another’s act, and keys always ask: no standing yes is given for them.');
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
  async ask(token: string | undefined, req: RunnerRequest, panelBase: string): Promise<Answer> {
    const p = this.pairingOf(token);
    const f = this.file();
    if (!p.identities.includes(req.identity)) throw new RunnerRefusal(403, `Kišib’s runner does not sign as ${idForm(req.identity)} for ${p.name}: approve it for this app in Kišib (Runner, Apps). Nothing was signed.`);
    const h = f.held.find((x) => x.id === req.identity);
    if (!h) throw new RunnerRefusal(403, 'Kišib’s runner does not hold this identity any more. Nothing was signed.');
    const outright = refusedOutright(req);
    if (outright) throw new RunnerRefusal(400, outright);
    if (req.as !== undefined) return this.askAsMember(p, h, req, panelBase);
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
      // Draft 3 (decided: "if establishing lanes it has to be setup this way"): the key of a payment the app signed under its own lane, delivered to the identity itself.
      if (await this.underOwnLane(h, own)) return { signed: wire(this.sign(h, p, req, 'keys', [LANE_WORDS(p.name)], { standing: true, of: own.target, lane: true })) };
    }
    const kind = kindOf(req);
    const words = wordsOf(req, p.name);
    if (!ALWAYS_ASKS.includes(kind) && p.yes.includes(kind)) return { signed: wire(this.sign(h, p, req, kind, words, { standing: true })) };
    const w: Waiting = { fp, app: p.id, identity: req.identity, kind, words, req, at: this.now(), nonce: null, wake: [] };
    this.waiting.set(fp, w);
    return this.asks(w, p, panelBase);
  }

  private asks(w: Waiting, p: Pairing, panelBase: string): Answer {
    return { asks: { request: w.fp, panel: `${panelBase}/runner/panel/${w.fp}`, kind: w.kind, title: titleOf(p.name, w) } };
  }

  /**
   * Whether a key delivered to the identity itself is the key of an act the
   * app signed under a lane of this identity (draft 3, 7.5): the act, read
   * from the identity's homes, opens with that key, is the identity's, is
   * signed under another binding than its own key's (a grant), and is valid
   * for any reader of its homes. Signed with the lane's key, it shows the
   * app holds that lane. Anything else is a key act, asked in the panel.
   */
  private async underOwnLane(h: HeldId, own: { target: string; key: Uint8Array }): Promise<boolean> {
    try {
      const hints = h.homes.map((x) => x.hint);
      let bytes: Uint8Array | null = null;
      for (const hint of hints) {
        bytes = await relayAt(hint, this.via).getAct(own.target).catch(() => null);
        if (bytes) break;
      }
      if (!bytes) return false;
      const d = openWithKey(bytes, own.key) as { id: string; signer?: string; binding?: string };
      if (d.id !== own.target || d.signer !== h.id || !d.binding || d.binding === h.binding) return false;
      const look = await lookUp(h.id, hints, this.via);
      for (const hint of hints) {
        const grant = await relayAt(hint, this.via).getAct(d.binding).catch(() => null);
        if (grant) {
          look.verifier.add(grant);
          break;
        }
      }
      look.verifier.addWithKey(bytes, own.key);
      const st = look.verifier.status(d.id) as string;
      return st === 'valid' || st === 'scoped';
    } catch {
      return false;
    }
  }

  /**
   * An act of a collective, as one of its members (draft 3, section 9;
   * decided: Kišib "signs with them itself through its panel"): signed with
   * the member key Kišib holds for the identity, after the panel, always.
   * The key never leaves Kišib; the app has the signed act, as for any act.
   */
  private askAsMember(p: Pairing, h: HeldId, req: RunnerRequest, panelBase: string): Answer {
    const k = h.members?.find((m) => m.collective === req.as);
    if (!k) throw new RunnerRefusal(403, NO_MEMBER_SAY);
    if (req.binding !== k.signature) throw new RunnerRefusal(409, 'The request names another member key than the one Kišib holds for this collective: the app reads the collective again. Nothing was signed.');
    this.sweep();
    const fp = requestPrint(req);
    const was = this.waiting.get(fp);
    if (was && was.app === p.id) {
      if (was.made) return { signed: wire(was.made) };
      if (!was.declined) return this.asks(was, p, panelBase);
      this.waiting.delete(fp);
    }
    const w: Waiting = { fp, app: p.id, identity: h.id, kind: kindOf(req), words: wordsOf(req, p.name), req, at: this.now(), nonce: null, wake: [] };
    this.waiting.set(fp, w);
    return this.asks(w, p, panelBase);
  }

  // ------------------------------------------------------------ member keys (draft 3, section 9)

  /** An app asks Kišib to hold the identity's key for a collective (9.1): waiting for the person, here. */
  memberAsk(token: string | undefined, a: { identity: string; collective: string; places: string[] }): { held: boolean; asked: boolean } {
    const p = this.pairingOf(token);
    const f = this.file();
    if (!p.identities.includes(a.identity)) throw new RunnerRefusal(403, `Kišib’s runner does not hold ${idForm(a.identity)} for ${p.name}. Nothing was asked.`);
    const h = f.held.find((x) => x.id === a.identity);
    if (!h) throw new RunnerRefusal(403, 'Kišib’s runner does not hold this identity any more. Nothing was asked.');
    const collective = readId(a.collective);
    if (h.members?.some((m) => m.collective === collective)) return { held: true, asked: false };
    f.memberAsks = (f.memberAsks ?? []).filter((x) => !(x.app === p.id && x.identity === h.id && x.collective === collective));
    if (f.memberAsks.length >= 10) throw new RunnerRefusal(429, 'Too many keys wait to be added in Kišib: answer them first.');
    const places = [...new Set(a.places.map((x) => x.trim()).filter((x) => /^https?:\/\//.test(x)))].slice(0, 8);
    f.memberAsks.push({ id: randomBytes(8).toString('hex'), app: p.id, appName: p.name, identity: h.id, collective, places, at: Math.floor(this.now() / 1000) });
    this.save();
    return { held: false, asked: true };
  }

  /**
   * Answer an app's ask (9.1). Yes: Kišib, holding the identity's words,
   * opens the member keys sealed to it at its homes (the member keys cMIP,
   * as any app holding the words does), takes the one for this collective,
   * and keeps it with the identity, encrypted under the passphrase.
   */
  async memberAnswer(a: { ask: string; yes: boolean }): Promise<RunnerView> {
    const f = this.file();
    const x = (f.memberAsks ?? []).find((m) => m.id === a.ask);
    if (!x) throw new Error('This ask waits no more.');
    f.memberAsks = (f.memberAsks ?? []).filter((m) => m.id !== a.ask);
    if (!a.yes) {
      this.save();
      return this.view();
    }
    const h = f.held.find((m) => m.id === x.identity);
    if (!h) throw new Error('Kišib does not hold this identity any more.');
    const seed = unhex(h.secret);
    const enc = encryptionSecret(seed);
    seed.fill(0);
    const homes = h.homes.map((m) => m.hint);
    let k;
    try {
      const keys = await readMemberKeys(h.id, [enc], homes, this.via);
      k = keys.length ? await memberKeyFor(keys, x.collective, [...new Set([...x.places, ...homes])], this.via) : null;
    } finally {
      enc.fill(0);
    }
    if (!k) {
      this.save();
      throw new Error(`No key of ${h.name ?? 'this identity'} for that collective was found sealed to it at its homes: one is made when it signs the collective’s founding (in Edubba). Nothing was kept.`);
    }
    let cname: string | null = null;
    try {
      cname = (await namesOf(x.collective, [...new Set([...x.places, ...homes])], this.via)).pop()?.name ?? null;
    } catch {
      // no name read: its ID is said
    }
    h.members = [...(h.members ?? []).filter((m) => m.collective !== x.collective), { collective: x.collective, act: k.act, terms: k.terms, signature: k.signature, public: [k.public[0], hex(k.public[1])], secret: hex(k.secret), position: k.position, added: Math.floor(this.now() / 1000), name: cname }];
    k.secret.fill(0);
    this.save();
    return this.view();
  }

  /** Forget a member key held for an identity (9.4). */
  memberRemove(a: { identity: string; collective: string }): RunnerView {
    const f = this.file();
    const h = f.held.find((m) => m.id === a.identity);
    const k = h?.members?.find((m) => m.collective === a.collective);
    if (!h || !k) throw new Error('Kišib holds no such key.');
    k.secret = '0'.repeat(k.secret.length);
    h.members = (h.members ?? []).filter((m) => m.collective !== a.collective);
    this.save();
    return this.view();
  }

  /** Sign, keep what is signed, and the line's act for its card. */
  private sign(h: HeldId, p: Pairing, req: RunnerRequest, kind: Kind, words: string[], o: { standing?: boolean; of?: string; lane?: boolean } = {}) {
    const f = this.file();
    // Draft 3: as a collective, with the member key held for the identity (9.2).
    const member = req.as !== undefined ? h.members?.find((m) => m.collective === req.as) : undefined;
    if (req.as !== undefined && !member) throw new RunnerRefusal(403, NO_MEMBER_SAY);
    const made = makeEveryday({
      signingSecret: unhex(member ? member.secret : h.secret),
      signer: member ? member.collective : h.id,
      binding: member ? member.signature : h.binding,
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
    const entry: Signed = { at: Math.floor(this.now() / 1000), app: p.id, appName: p.name, identity: h.id, kind, words, act: made.id, line: req.line, position: req.sequence.length + 1, ...(o.standing ? { standing: true } : {}), ...(o.of ? { of: o.of } : {}), ...(member ? { as: member.collective } : {}), ...(o.lane ? { lane: true } : {}) };
    if (!req.public && req.line !== 'apart' && !member) entry.companion = sha256(keyDeliveryPayload(made.id, made.key, false));
    f.log.push(entry);
    if (req.line === 'public' || req.line === 'private') {
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

  // ------------------------------------------------------------ opening (draft 2, section 8)

  /**
   * Open what is sealed to an identity, for an app allowed to (8.1): each
   * container opened with the encryption key the identity's signing words
   * carry (the carry Module), the act inside and its content key returned;
   * never the identity's encryption key. No panel: an opening signs nothing.
   * Each container opened is listed in Signed, once, with how many times.
   */
  open(token: string | undefined, a: { identity: string; sealed: Uint8Array[] }): { opened: ({ act: string; key: string | null } | null)[] } {
    const p = this.pairingOf(token);
    const f = this.file();
    if (p.identities.includes(a.identity) && !opensOf(p).includes(a.identity)) throw new RunnerRefusal(403, NO_OPEN_SAY);
    if (!p.identities.includes(a.identity)) throw new RunnerRefusal(403, `Kišib’s runner does not open for ${p.name} as ${idForm(a.identity)}: approve it for this app in Kišib (Runner, Apps). Nothing was opened.`);
    const h = f.held.find((x) => x.id === a.identity);
    if (!h) throw new RunnerRefusal(403, 'Kišib’s runner does not hold this identity any more. Nothing was opened.');
    if (a.sealed.length > OPEN_MAX) throw new RunnerRefusal(400, `At most ${OPEN_MAX} sealed containers at once. Nothing was opened.`);
    const seed = unhex(h.secret);
    const secret = encryptionSecret(seed);
    seed.fill(0);
    const at = Math.floor(this.now() / 1000);
    let changed = false;
    const opened = a.sealed.map((bytes) => {
      let o: { act: Uint8Array; key?: Uint8Array; described: { id: string; signer?: string; spec?: string; type?: number; payload?: Uint8Array; public?: boolean; to?: string[] } };
      try {
        o = openSealed(bytes, h.id, secret) as typeof o;
      } catch {
        return null;
      }
      const sealed = sealedId(bytes);
      const was = f.log.find((x) => x.opened && x.app === p.id && x.identity === h.id && x.sealed === sealed);
      if (was) {
        was.times = (was.times ?? 1) + 1;
        was.at = at;
      } else {
        const d = o.described;
        const kind = kindOf({ identity: h.id, binding: '', line: 'private', sequence: [], spec: d.spec ?? '', type: d.type ?? 0, payload: d.payload ?? new Uint8Array(), public: false, to: d.to });
        const from = !d.signer ? '' : d.signer === h.id ? ', its own' : `, from ${idForm(d.signer)}`;
        f.log.push({ at, app: p.id, appName: p.name, identity: h.id, kind, words: [`Opened for ${p.name}: ${KIND_ONE[kind]}${from}. Nothing was signed.`], act: d.id, line: 'private', position: 0, opened: true, sealed, times: 1 });
      }
      changed = true;
      return { act: base64(o.act), key: o.key ? base64(o.key) : null };
    });
    secret.fill(0);
    if (changed) this.save();
    return { opened };
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
      title: titleOf(app.name, w),
      // H121: IDs whole here; the panel shows each short, its tap showing it whole.
      // Draft 3, 9.2: as a collective, which key signs said plainly: the identity's own member key for that collective, held here; never the collective's key, nor the identity's signing key.
      as: w.req.as !== undefined ? memberWords(w.req.as, held.members?.find((m) => m.collective === w.req.as)?.name ?? null, held) + ` · ${w.req.public ? 'public' : 'private'}` : `As ${held.name ?? 'this identity'} · ${idForm(held.id)} · ${w.req.public ? 'public' : 'private'}`,
      words: w.words,
      always: ALWAYS_ASKS.includes(w.kind) || w.req.as !== undefined ? null : `Always yes for ${app.name}’s ${KIND_NAME[w.kind]}`,
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
      // At its homes, and at the relays its routes name, where its posts are published.
      for (const hint of [...new Set([...hints, ...look.routes.routes.flatMap((r) => r.hints)])]) {
        bytes = await relayAt(hint, this.via).getAct(a.act).catch(() => null);
        if (bytes) break;
      }
      if (!bytes) return { lines: [{ text: 'Neither its homes nor its relays hold this act (yet): the app that asked sends it.', tone: 'warn' }] };
      look.verifier.add(bytes);
      const st = look.verifier.status(a.act) as string;
      return { lines: [{ text: st === 'valid' ? 'Valid: signed with the identity’s signing key in force, on a line its chain keeps.' : `Judged ${st} by the core library, as any reader of its homes would.`, tone: st === 'valid' ? 'ok' : 'bad' }] };
    } catch (e) {
      return { lines: [{ text: `Its homes could not be read: ${message(e)}`, tone: 'warn' }] };
    }
  }

  // ------------------------------------------------------------ Kišib's own contacts (hand test v3, H100, H109)

  /** The identities held, with their homes, while on: where Kišib reads names, and whose contacts it shows. */
  holding(): { id: string; homes: string[] }[] {
    return (this.f?.held ?? []).map((h) => ({ id: h.id, homes: h.homes.map((x) => x.hint) }));
  }

  /**
   * A held identity, as the one contacts list needs it (H100: the people
   * cMIP's list, sealed to the identity at its homes): opened with the
   * encryption key its signing words carry, to be shown in Kišib's own page.
   * Nothing is signed for Kišib itself: its contacts are read-only (the
   * runner signs only for the apps paired with it). Locked or off: refused,
   * nothing read.
   */
  self(id: string): { me: TestIdentity; open: Opener } {
    const f = this.file();
    const h = f.held.find((x) => x.id === id);
    if (!h) throw new RunnerRefusal(403, 'Kišib’s runner does not hold this identity. Nothing was read.');
    const file = { label: '', identity: h.id, position: 0, binding: h.binding, signingSecret: '', chain: [], homes: h.homes, rule: null, sequence: [], private: [], split: true, routes: null, encryption: [], pending: null } as unknown as IdentityFile;
    const me = new TestIdentity(file, this.via);
    me.signer = async () => {
      throw new RunnerRefusal(403, 'Kišib signs only for the apps paired with it. Nothing was signed.');
    };
    const open: Opener = async (sealed) => {
      const held = this.file().held.find((x) => x.id === id);
      if (!held) return sealed.map(() => null);
      const seed = unhex(held.secret);
      const secret = encryptionSecret(seed);
      seed.fill(0);
      try {
        return sealed.map((bytes) => {
          try {
            return openSealed(bytes, held.id, secret) as Awaited<ReturnType<Opener>>[number];
          } catch {
            return null;
          }
        });
      } finally {
        secret.fill(0);
      }
    };
    return { me, open };
  }

  // ------------------------------------------------------------ what Kišib's page shows

  view(): RunnerView {
    const f = this.f;
    this.sweep();
    const name = (id: string) => f?.held.find((h) => h.id === id)?.name ?? null;
    return {
      on: !!f,
      state: this.state,
      upgrade: !!this.legacy,
      since: f?.since ?? null,
      risk: RISK_SAY,
      held: (f?.held ?? []).map((h) => ({ id: h.id, form: idForm(h.id), link: idWhere(h.id, h.homes.map((x) => x.hint).slice(0, 1)), name: h.name, spent: !!h.spent, homes: h.homes.map((x) => x.hint), apps: (f?.apps ?? []).filter((p) => p.state === 'approved' && p.identities.includes(h.id)).map((p) => p.name), members: (h.members ?? []).map((m) => ({ collective: m.collective, form: idForm(m.collective), added: m.added })) })),
      memberAsks: (f?.memberAsks ?? []).map((x) => ({ id: x.id, app: x.appName, identity: x.identity, name: name(x.identity), collective: x.collective, form: idForm(x.collective), at: x.at })),
      apps: (f?.apps ?? []).map((p) => ({ id: p.id, name: p.name, origin: p.origin, code: p.code, state: p.state, identities: p.identities, yes: p.yes, opens: opensOf(p), asked: p.asked, approved: p.approved ?? null, needs: p.needs ?? {} })),
      waiting: [...this.waiting.values()]
        .filter((w) => !w.made && !w.declined)
        .map((w) => {
          const app = f?.apps.find((p) => p.id === w.app);
          const h = f?.held.find((x) => x.id === w.identity);
          return { request: w.fp, app: app?.name ?? 'an app', identity: w.identity, name: name(w.identity), as: w.req.as !== undefined && h ? memberWords(w.req.as, h.members?.find((m) => m.collective === w.req.as)?.name ?? null, h) : null, kind: w.kind, title: titleOf(app?.name ?? 'An app', w), words: w.words, at: Math.floor(w.at / 1000), always: ALWAYS_ASKS.includes(w.kind) || w.req.as !== undefined };
        }),
      signed: (f?.log ?? [])
        .slice()
        .reverse()
        .map((s) => ({ at: s.at, app: s.appName, identity: s.identity, name: name(s.identity), kind: s.kind, words: s.words, act: s.act, standing: !!s.standing, line: s.line, position: s.position, opened: !!s.opened, sealed: s.sealed ?? null, times: s.times ?? 1, as: s.as ?? null, lane: !!s.lane })),
      kinds: KINDS.map((k) => ({ kind: k, name: KIND_NAME[k], always: ALWAYS_ASKS.includes(k) })),
    };
  }
}

/** An identity's secrets overwritten in memory, its member keys' with them. */
function wipe(h: HeldId) {
  h.secret = '0'.repeat(h.secret.length);
  for (const m of h.members ?? []) m.secret = '0'.repeat(m.secret.length);
}

/** A file overwritten, as far as software can (a copy the system made elsewhere is out of reach), then removed. */
function erase(x: string) {
  if (!existsSync(x)) return;
  try {
    const n = statSync(x).size;
    const fd = openSync(x, 'r+');
    writeSync(fd, Buffer.alloc(n));
    closeSync(fd);
  } catch {
    // removed below all the same
  }
  rmSync(x, { force: true });
}


/** Which key signs an act as a collective (draft 3, 9.2), in plain words, the IDs whole (the panel shows each short, a tap showing it whole). */
const memberWords = (collective: string, cname: string | null, h: { id: string; name: string | null }) =>
  `As the collective ${cname ? `${cname} ` : ''}${idForm(collective)}, signed with ${h.name ?? 'this identity'}’s own member key for it (${idForm(h.id)}), held here in Kišib`;

/** A request's title, as the panel and Waiting say it. */
const titleOf = (app: string, w: { kind: Kind; req: RunnerRequest }) => `${app} asks Kišib to sign ${KIND_ONE[w.kind]}${w.req.as !== undefined ? ' as a collective' : ''}`;

/** At most this many sealed containers opened in one request. */
export const OPEN_MAX = 100;

const wire = (m: { act: Uint8Array; id: string; key: Uint8Array }) => ({ act: base64(m.act), id: m.id, key: base64(m.key) });

/** A request as an app sends it (3.1), read from JSON: the payload in base64. */
export function readRequest(v: unknown): RunnerRequest {
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
  if (line !== 'public' && line !== 'private' && line !== 'apart' && line !== 'member') throw new RunnerRefusal(400, 'The request names no line: public, private, apart or member. Nothing was signed.');
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
    ...(o.as !== undefined && o.as !== null ? { as: h64(o.as, 'collective') } : {}),
  };
}

/** A request as an app writes it (3.1), for JSON. */
export function writeRequest(r: SignRequest): Record<string, unknown> {
  return { ...r, payload: base64(r.payload) };
}
