// Who may use the page: a browser paired once with a one-time code, as the
// management page of step 11 does it (decided by Nobody, allegedly, for
// relays; taken over here). The browser makes an Ed25519 key it cannot read
// out; every request is its exact JSON body, signed after a domain line,
// naming this program, the time and a single-use nonce.
//
// A code is never typed here: the program's `open` command asks the
// running program for one, over a secret only the owner's account can read
// (`run.json`, in the program's folder), and opens the browser at a link
// carrying it in the fragment, which never leaves the browser.

import { createHash, createPublicKey, randomBytes, timingSafeEqual, verify } from 'node:crypto';
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** What a browser's key signs, before the request body. */
export const DOMAIN = 'MOR collective client, version 1\n';

/** Requests are accepted within this many seconds of this program's clock. */
export const SKEW = 300;
/** A pairing code lasts ten minutes. */
export const CODE_LIFE = 600;

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export interface Paired {
  key: string;
  label: string;
  added: number;
}

interface AccessFile {
  /** This program's id: every request names it, so a request made for another is refused. */
  app: string;
  paired: Paired[];
  /** Codes not yet used, by hash. */
  codes: { hash: string; expires: number }[];
}

export class Refusal extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

const now = () => Math.floor(Date.now() / 1000);

/** A code as typed or linked, read leniently (case, dashes, I and L for 1, O for 0), hashed. */
export function codeHash(typed: string, label = 'MOR collective client pairing code'): string | null {
  let s = '';
  for (const ch of typed.toUpperCase()) {
    if (ch === '-' || ch === ' ') continue;
    const c = ch === 'I' || ch === 'L' ? '1' : ch === 'O' ? '0' : ch;
    if (!ALPHABET.includes(c)) return null;
    s += c;
  }
  if (s.length !== 20) return null;
  return createHash('sha256').update(`${label}\n${s}`).digest('hex');
}

export class Access {
  private nonces = new Map<string, number>();
  private wrong: number[] = [];

  /**
   * `domain` and `label` name the program a key signs for and a code is
   * made for; another program built on this one (the desk, step 11c) gives
   * its own, so a request or code for one is never good for the other.
   */
  constructor(
    private readonly dir: string,
    private readonly names: { domain: string; label: string } = { domain: DOMAIN, label: 'MOR collective client pairing code' },
  ) {
    if (!existsSync(this.path)) this.save({ app: randomBytes(16).toString('hex'), paired: [], codes: [] });
  }

  private get path() {
    return join(this.dir, 'access.json');
  }

  private load(): AccessFile {
    return JSON.parse(readFileSync(this.path, 'utf8')) as AccessFile;
  }

  private save(f: AccessFile) {
    writeFileSync(`${this.path}.tmp`, JSON.stringify(f, null, 2) + '\n', { mode: 0o600 });
    renameSync(`${this.path}.tmp`, this.path);
  }

  get app(): string {
    return this.load().app;
  }

  paired(): Paired[] {
    return this.load().paired;
  }

  /** A new one-time pairing code: four groups of five, 100 random bits. */
  newCode(): string {
    const bytes = randomBytes(13);
    let bits = 0n;
    for (const b of bytes) bits = (bits << 8n) | BigInt(b);
    let chars = '';
    for (let i = 0; i < 20; i++) chars += ALPHABET[Number((bits >> BigInt(i * 5)) & 31n)];
    const code = `${chars.slice(0, 5)}-${chars.slice(5, 10)}-${chars.slice(10, 15)}-${chars.slice(15)}`;
    const f = this.load();
    f.codes = f.codes.filter((c) => c.expires > now());
    f.codes.push({ hash: codeHash(code, this.names.label)!, expires: now() + CODE_LIFE });
    this.save(f);
    return code;
  }

  /** Pair a browser's key with a code, once. */
  pair(key: string, code: string, label: string): void {
    const t = now();
    this.wrong = this.wrong.filter((x) => x > t - 60);
    if (this.wrong.length >= 10) throw new Refusal(429, 'Too many wrong codes: wait a minute.');
    const h = codeHash(code, this.names.label);
    const f = this.load();
    const i = f.codes.findIndex((c) => c.hash === h && c.expires > t);
    if (!h || i < 0) {
      this.wrong.push(t);
      throw new Refusal(401, 'That code is not one this program gave, or it has expired or was used.');
    }
    f.codes.splice(i, 1);
    if (!f.paired.some((p) => p.key === key)) f.paired.push({ key, label: label.slice(0, 64) || 'a browser', added: t });
    this.save(f);
  }

  unpair(key: string): void {
    const f = this.load();
    f.paired = f.paired.filter((p) => p.key !== key);
    this.save(f);
  }

  /**
   * Check one request: the signature over the exact body, this program's
   * id, the time, a fresh nonce, and (except to pair) a paired key.
   * Returns the request's operation and arguments.
   */
  check(body: Buffer, key: string | undefined, sig: string | undefined): { op: string; args: Record<string, unknown>; key: string } {
    if (!key || !/^[0-9a-f]{64}$/.test(key) || !sig || !/^[0-9a-f]{128}$/.test(sig)) throw new Refusal(401, 'The request is not signed.');
    const pub = createPublicKey({ key: { kty: 'OKP', crv: 'Ed25519', x: Buffer.from(key, 'hex').toString('base64url') }, format: 'jwk' });
    if (!verify(null, Buffer.concat([Buffer.from(this.names.domain), body]), pub, Buffer.from(sig, 'hex'))) {
      throw new Refusal(401, 'The signature does not match the request.');
    }
    let r: { app?: unknown; time?: unknown; nonce?: unknown; op?: unknown; args?: unknown };
    try {
      r = JSON.parse(body.toString('utf8'));
    } catch {
      throw new Refusal(400, 'The request is not JSON.');
    }
    const app = Buffer.from(String(r.app ?? ''));
    const mine = Buffer.from(this.app);
    if (app.length !== mine.length || !timingSafeEqual(app, mine)) throw new Refusal(401, 'The request was made for another program.');
    const t = now();
    if (typeof r.time !== 'number' || Math.abs(r.time - t) > SKEW) throw new Refusal(401, 'The request is too old, or this device’s clock is off.');
    if (typeof r.nonce !== 'string' || !/^[0-9a-f]{32}$/.test(r.nonce)) throw new Refusal(400, 'The request has no nonce.');
    for (const [n, at] of this.nonces) if (at < t - 2 * SKEW) this.nonces.delete(n);
    if (this.nonces.has(r.nonce)) throw new Refusal(401, 'The request was already received once.');
    this.nonces.set(r.nonce, t);
    if (typeof r.op !== 'string') throw new Refusal(400, 'The request names no operation.');
    const args = (r.args && typeof r.args === 'object' ? r.args : {}) as Record<string, unknown>;
    if (r.op !== 'pair' && !this.load().paired.some((p) => p.key === key)) throw new Refusal(401, 'This browser is not paired.');
    return { op: r.op, args, key };
  }
}
