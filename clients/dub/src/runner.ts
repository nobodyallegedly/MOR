// Dub's side of the Dubsar runner (`cmips/cmip-runner-draft-2.md`): an
// identity used through Kišib, on this Mac, Dub holding none of its keys.
// Pairing is started here and approved in Kišib (section 2); each act is a
// request Kišib reads, shows in its panel inside Dub's window, and signs
// once the person says yes (sections 3 and 4); the act then goes on as any
// act Dub signs. The one exception to the working rule that apps talk
// through MOR (decided by Nobody, allegedly): Dub holds no key, so it
// cannot put a draft on MOR; it asks Kišib's program directly, on this
// computer only. Where Kišib lets Dub open what is sealed to the identity
// (draft 2, section 8), Dub sends the sealed containers it finds to Kišib,
// which returns the acts inside: never the identity's key.
//
// The computer's program only (the Mac and Linux): Dub's web client neither
// pairs nor asks (decided: never on the web).

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
/** At most this many sealed containers in one request to Kišib (its `OPEN_MAX`). */
const OPEN_BATCH = 100;

/** The port Kišib's program listens on unless told otherwise. */
export const KISHIB_PORT = 8474;

/** What Dub keeps of its pairing with Kišib, in its own folder (`kishib.json`): the token, never shown. */
interface Kept {
  token: string;
  pairing: string;
  code: string;
  at: number;
}

/** A member key Kišib holds for an identity (draft 3): its public parts only, never its secret. */
export interface HeldMember {
  collective: string;
  terms: string;
  signature: string;
  position: number;
}

/** Where Dub's pairing stands (2.4): the identities it may use, which of them it may have opened (draft 3, per identity), and the member keys Kišib holds for each. */
export interface Paired {
  state: string;
  code: string;
  opens: string[];
  identities: { id: string; name: string | null; binding: string; key: string; spent: boolean; homes: string[]; members?: HeldMember[] }[];
  /** The collectives' keys this app asked Kišib to add, waiting for their approval there. */
  asked?: { identity: string; collective: string }[];
}

/** A request waiting for the person, while Dub waits for its answer. */
export interface Asking {
  request: string;
  panel: string;
  title: string;
  kind: string;
}

/**
 * An app's stated needs (the runner cMIP, draft 4, 2.1a; H126): for each
 * permission a pairing can give (today one, `opening`: "may open what is
 * sealed to this identity"), why the app needs it and what it cannot do
 * without it, in plain words, at most 300 characters each. A statement,
 * never a choice: Kišib shows it beside the box, which stays unticked.
 */
export interface RunnerNeeds {
  opening?: { why: string; without: string };
}

/** Dub's stated need (draft 4, 2.1a): its private side reads what is sealed to the identity; its public posts do not. */
export const DUB_NEEDS: RunnerNeeds = { opening: { why: 'to read your private messages, your contacts and your purchases', without: 'public posts still work' } };

type Answer = { signed?: { act: string; id: string; key: string }; asks?: Asking; declined?: true; waiting?: true; expired?: true };

export class RunnerLink {
  /** The request waiting for the person now, if any: Dub's page draws its panel in the slot. */
  asking: Asking | null = null;
  private dropped = new Set<string>();

  constructor(
    private readonly dir: string,
    /** `needs`: what the app states in its pairing request (H126); Dub's own where the app is Dub and states none. */
    private readonly o: { kishib?: string; origin: () => string; name?: string; needs?: RunnerNeeds },
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
    const needs = this.o.needs ?? (this.o.name === undefined || this.o.name === 'Dub' ? DUB_NEEDS : undefined);
    const p = await this.call<{ pairing: string; code: string; token: string }>('/runner/pair', { name: this.o.name ?? 'Dub', origin: this.o.origin(), ...(needs ? { needs } : {}) });
    this.keep({ token: p.token, pairing: p.pairing, code: p.code, at: Math.floor(Date.now() / 1000) });
    return { code: p.code };
  }

  /** Where the pairing stands (2.4), with the identities Kišib lets Dub use once approved. Null: never paired here. */
  async paired(): Promise<Paired | null> {
    const k = this.kept();
    if (!k) return null;
    try {
      return await this.call('/runner/paired', {}, k.token);
    } catch (e) {
      if (/no longer knows this app/.test(message(e))) return { state: 'revoked', code: k.code, opens: [], identities: [] };
      throw e;
    }
  }

  /**
   * Open what is sealed to an identity, through Kišib (draft 2, section 8):
   * each container's act and its content key, or null where it does not open
   * with the identity's key. Refused, said plainly, where Kišib does not let
   * Dub open, is locked, or does not run.
   */
  async open(identity: string, sealed: Uint8Array[]): Promise<({ act: Uint8Array; key?: Uint8Array } | null)[]> {
    const k = this.kept();
    if (!k) throw new Error('Dub is not paired with Kišib’s runner: + Add, Use one from Kišib. Nothing was opened.');
    const out: ({ act: Uint8Array; key?: Uint8Array } | null)[] = [];
    for (let i = 0; i < sealed.length; i += OPEN_BATCH) {
      const part = sealed.slice(i, i + OPEN_BATCH);
      const r = await this.call<{ opened: ({ act: string; key: string | null } | null)[] }>('/runner/open', { identity, sealed: part.map((b) => Buffer.from(b).toString('base64')) }, k.token);
      out.push(...r.opened.map((o) => (o ? { act: unb64(o.act), ...(o.key ? { key: unb64(o.key) } : {}) } : null)));
    }
    return out;
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
    return (req: SignRequest) => this.request(req);
  }

  /**
   * Ask Kišib to hold an identity's key for a collective (draft 3, 9.1),
   * approved in Kišib. Answered held (Kišib has it) or asked.
   */
  async memberAsk(identity: string, collective: string, places: string[]): Promise<{ held: boolean; asked: boolean }> {
    const k = this.kept();
    if (!k) throw new Error('Dub is not paired with Kišib’s runner: + Add, Use one from Kišib.');
    return this.call('/runner/member', { identity, collective, places }, k.token);
  }

  /**
   * A request to Kišib (section 3): an act of the identity, or (draft 3,
   * section 9) of a collective it is a member of (`as`, on the member key's
   * strand), signed with the key Kišib holds.
   */
  async request(req: SignRequest | (Omit<SignRequest, 'line'> & { line: 'member'; as: string })): Promise<{ act: Uint8Array; id: string; key: Uint8Array }> {
    {
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
    }
  }

  /** Withdraw the request waiting now (the person said not to sign it, from Dub). */
  drop(request: string): void {
    if (this.asking?.request === request) this.dropped.add(request);
  }
}
