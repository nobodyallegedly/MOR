// Dub's side of the Dubsar runner (`cmips/cmip-runner-draft-1.md`): an
// identity used through Kišib, on this Mac, Dub holding none of its keys.
// Pairing is started here and approved in Kišib (section 2); each act is a
// request Kišib reads, shows in its panel inside Dub's window, and signs
// once the person says yes (sections 3 and 4); the act then goes on as any
// act Dub signs. The one exception to the working rule that apps talk
// through MOR (decided by Nobody, allegedly): Dub holds no key, so it
// cannot put a draft on MOR; it asks Kišib's program directly, on this
// computer only.
//
// The program on the Mac only: Dub's web client neither pairs nor asks.

import { existsSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { SignRequest, Signer } from '../../genesis/src/identity.ts';

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));
const unb64 = (s: string) => Uint8Array.from(Buffer.from(s, 'base64'));

/** Said where Kišib's program does not answer on this Mac. */
export const NO_KISHIB_SAY = 'Kišib is not running on this Mac: open Kišib, and turn its runner on (Runner), then try again. Nothing was signed.';

/** Kišib's folder, where its running program names its port (`run.json`). */
export const KISHIB_DIR = join(homedir(), 'mor-kishib');
/** The port Kišib's program listens on unless told otherwise. */
export const KISHIB_PORT = 8474;

/** What Dub keeps of its pairing with Kišib, in its own folder (`kishib.json`): the token, never shown. */
interface Kept {
  token: string;
  pairing: string;
  code: string;
  at: number;
}

/** A request waiting for the person, while Dub waits for its answer. */
export interface Asking {
  request: string;
  panel: string;
  title: string;
  kind: string;
}

type Answer = { signed?: { act: string; id: string; key: string }; asks?: Asking; declined?: true; waiting?: true; expired?: true };

export class RunnerLink {
  /** The request waiting for the person now, if any: Dub's page draws its panel in the slot. */
  asking: Asking | null = null;
  private dropped = new Set<string>();

  constructor(
    private readonly dir: string,
    private readonly o: { kishib?: string; origin: () => string; name?: string },
  ) {}

  private get path() {
    return join(this.dir, 'kishib.json');
  }

  private kept(): Kept | null {
    try {
      return existsSync(this.path) ? (JSON.parse(readFileSync(this.path, 'utf8')) as Kept) : null;
    } catch {
      return null;
    }
  }

  private keep(k: Kept | null) {
    if (!k) return void rmSync(this.path, { force: true });
    writeFileSync(`${this.path}.tmp`, JSON.stringify(k) + '\n', { mode: 0o600 });
    renameSync(`${this.path}.tmp`, this.path);
  }

  /** Kišib's origin, as its folder names it: framed by Dub's slot, and nothing else. */
  origin(): string {
    try {
      const run = JSON.parse(readFileSync(join(this.o.kishib ?? KISHIB_DIR, 'run.json'), 'utf8')) as { port: number };
      return `http://127.0.0.1:${run.port}`;
    } catch {
      return `http://127.0.0.1:${KISHIB_PORT}`;
    }
  }

  private async call<T>(path: string, body: unknown, token?: string | null): Promise<T> {
    let r: Response;
    try {
      r = await fetch(`${this.origin()}${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...(token ? { 'mor-runner': token } : { 'mor-runner-pair': '1' }) },
        body: JSON.stringify(body),
      });
    } catch {
      throw new Error(NO_KISHIB_SAY);
    }
    const v = (await r.json().catch(() => ({}))) as T & { error?: string };
    if (!r.ok) throw new Error(v.error ?? `Kišib’s runner answered ${r.status}. Nothing was signed.`);
    return v;
  }

  /** Pair with Kišib (section 2.1): a code to compare there. Asking again starts a new pairing. */
  async pair(): Promise<{ code: string }> {
    const p = await this.call<{ pairing: string; code: string; token: string }>('/runner/pair', { name: this.o.name ?? 'Dub', origin: this.o.origin() });
    this.keep({ token: p.token, pairing: p.pairing, code: p.code, at: Math.floor(Date.now() / 1000) });
    return { code: p.code };
  }

  /** Where the pairing stands (2.4), with the identities Kišib lets Dub use once approved. Null: never paired here. */
  async paired(): Promise<{ state: string; code: string; identities: { id: string; name: string | null; binding: string; key: string; spent: boolean; homes: string[] }[] } | null> {
    const k = this.kept();
    if (!k) return null;
    try {
      return await this.call('/runner/paired', {}, k.token);
    } catch (e) {
      if (/no longer knows this app/.test(message(e))) return { state: 'revoked', code: k.code, identities: [] };
      throw e;
    }
  }

  /** The code shown while a pairing waits, without asking Kišib. */
  code(): string | null {
    return this.kept()?.code ?? null;
  }

  /** Forget the pairing here, and tell Kišib (2.5). */
  async unpair(): Promise<void> {
    const k = this.kept();
    if (k) await this.call('/runner/unpair', {}, k.token).catch(() => undefined);
    this.keep(null);
  }

  /**
   * The signer for an identity used through Kišib (section 3): the request
   * sent, signed at once under a standing yes, or waiting for the person's
   * answer in the panel (`asking`, for Dub's page to draw), or in Kišib's
   * own page, until it is signed, declined, withdrawn here, or expires.
   */
  signer(): Signer {
    return async (req: SignRequest) => {
      const k = this.kept();
      if (!k) throw new Error('Dub is not paired with Kišib’s runner: + Add, Use one from Kišib. Nothing was signed.');
      let a = await this.call<Answer>('/runner/ask', { ...req, payload: Buffer.from(req.payload).toString('base64') }, k.token);
      if (a.asks) {
        const asked = a.asks;
        this.asking = asked;
        try {
          while (!a.signed) {
            if (this.dropped.delete(asked.request)) {
              await this.call('/runner/drop', { request: asked.request }, k.token).catch(() => undefined);
              throw new Error('Not signed: you withdrew the request. Nothing was signed.');
            }
            a = await this.call<Answer>('/runner/answer', { request: asked.request, wait: 2 }, k.token);
            if (a.declined) throw new Error('Declined in Kišib: nothing was signed.');
            if (a.expired) throw new Error('Kišib’s request waited past its ten minutes: nothing was signed.');
          }
        } finally {
          if (this.asking?.request === asked.request) this.asking = null;
        }
      }
      if (!a.signed) throw new Error('Kišib’s runner did not sign. Nothing was signed.');
      return { act: unb64(a.signed.act), id: a.signed.id, key: unb64(a.signed.key) };
    };
  }

  /** Withdraw the request waiting now (the person said not to sign it, from Dub). */
  drop(request: string): void {
    if (this.asking?.request === request) this.dropped.add(request);
  }
}
