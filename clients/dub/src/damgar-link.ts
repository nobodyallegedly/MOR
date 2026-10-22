// Dub waking Damgar on this computer (the second way to pay, 2A; decided by
// Nobody, allegedly, 21 October 2026: "Damgar should act as Kišib for money
// acts, it should pop up and authorise"). Dub leaves the payment on MOR as
// before, a draft sealed to the identity; then it only wakes Damgar's
// program, naming the identity and the draft's id. Damgar finds the draft on
// MOR and draws its panel inside Dub's window (the kit's slot), where the
// person authorises it or not. Dub learns only the answer. Nothing travels
// outside MOR but the wake-up.
//
// The computer's program only: Dub's web client wakes nothing.

import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

/** Damgar's folder, where its running program names its port (`run.json`). */
export const DAMGAR_DIR = join(homedir(), 'mor-damgar');
/** The port Damgar's program listens on unless told otherwise. */
export const DAMGAR_PORT = 8476;

/** Said where Damgar's program does not answer on this computer: the payment still waits for it. */
export const NO_DAMGAR_SAY = 'Damgar is not running on this computer: the payment waits on MOR, sealed to you. Open Damgar: it shows it in Waiting, to sign or decline.';

export interface Woken {
  request: string;
  panel: string;
  title: string;
  origin: string;
}

export class DamgarLink {
  constructor(private readonly o: { damgar?: string; origin: () => string; name?: string }) {}

  /** Damgar's origin, as its folder names it: framed by Dub's slot, with Kišib's, and nothing else. */
  origin(): string {
    try {
      const run = JSON.parse(readFileSync(join(this.o.damgar ?? DAMGAR_DIR, 'run.json'), 'utf8')) as { port: number };
      return `http://127.0.0.1:${run.port}`;
    } catch {
      return `http://127.0.0.1:${DAMGAR_PORT}`;
    }
  }

  private async call<T>(path: string, body: unknown): Promise<T> {
    let r: Response;
    try {
      r = await fetch(`${this.origin()}${path}`, { method: 'POST', headers: { 'content-type': 'application/json', 'mor-damgar-wake': '1' }, body: JSON.stringify(body) });
    } catch {
      throw new Error(NO_DAMGAR_SAY);
    }
    const v = (await r.json().catch(() => ({}))) as T & { error?: string };
    if (!r.ok) throw new Error(v.error ?? `Damgar answered ${r.status}.`);
    return v;
  }

  /** Wake Damgar for a draft just left on MOR: the panel to frame, once Damgar has found it (it looks a few times while the homes catch up). */
  async wake(a: { identity: string; draft: string }): Promise<Woken> {
    let last: unknown = null;
    for (let i = 0; i < 4; i++) {
      try {
        const w = await this.call<Omit<Woken, 'origin'>>('/damgar/wake', { app: this.o.name ?? 'Dub', origin: this.o.origin(), identity: a.identity, draft: a.draft });
        return { ...w, origin: this.origin() };
      } catch (e) {
        last = e;
        if (!/did not find the payment/.test(e instanceof Error ? e.message : '')) throw e;
        await new Promise((r) => setTimeout(r, 500));
      }
    }
    throw last;
  }

  /** Where the panel stands: waiting, signed, declined, or expired, with Damgar's words. */
  answer(request: string): Promise<{ answer: 'waiting' | 'signed' | 'declined' | 'expired'; lines: { text: string; tone?: string }[] }> {
    return this.call('/damgar/answer', { request });
  }
}
