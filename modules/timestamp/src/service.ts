// The clock service (modules/module-clock-timestamp-draft-1.md, "The clock
// service"): an ordinary identity that stamps the acts it is given and the
// acts it finds at the relays its operator names, each once, never its own
// stamps, never back in time, and publishes its stamps on its outbox relays.
// Its time is its computer's clock: its operator's word, and only that.

import { createServer, type Server } from 'node:http';
import { describeAct } from '../../../clients/genesis/src/core.ts';
import type { TestIdentity } from '../../../clients/genesis/src/identity.ts';
import { relayAt, type Via } from '../../../clients/genesis/src/transport.ts';
import { MOST_PER_STAMP, STAMP_TYPE, TIMESTAMP_SPEC, encodeStamp } from './stamp.ts';

const HEX64 = /^[0-9a-f]{64}$/;

/** A stamp the service signed. */
export interface Made {
  stamp: string;
  time: number;
  acts: string[];
}

/** What the service remembers between runs (kept by its operator; nothing secret). */
export interface ClockState {
  /** Each act stamped, with its time. */
  stamped: Record<string, number>;
  /** Where each relay followed was read up to. */
  cursors: Record<string, number>;
  /** The time of its latest stamp: none after it is earlier. */
  last: number;
}

export const emptyState = (): ClockState => ({ stamped: {}, cursors: {}, last: 0 });

export interface ClockOptions {
  /** The clock's identity (a test identity). */
  identity: TestIdentity;
  /** Its outbox relays: where its stamps are published. */
  outbox: string[];
  /** The relays it follows, stamping what it finds there. */
  watch?: string[];
  /** If given, only acts signed by these identities are stamped when found (acts given are stamped whoever signed them). */
  signers?: string[];
  /** Its memory, carried between runs. */
  state?: ClockState;
  /** Called after each stamp is signed, so the identity file and the state are saved before anything else is signed. */
  save?: () => void;
  /** Its clock, in seconds since 1970 (UTC); the computer's by default. */
  now?: () => number;
  via?: Via;
}

export class ClockService {
  readonly state: ClockState;
  private chain: Promise<unknown> = Promise.resolve();

  constructor(private o: ClockOptions) {
    this.state = o.state ?? emptyState();
  }

  get id(): string {
    return this.o.identity.id;
  }

  private now(): number {
    return Math.floor(this.o.now ? this.o.now() : Date.now() / 1000);
  }

  /**
   * Stamp the acts named that it has not stamped, at one time: one stamp per
   * 256. Returns the stamps made (none when every act was stamped before).
   * Calls are taken one after another, so the clock's line never forks and
   * never runs back in time.
   */
  stamp(acts: string[]): Promise<Made[]> {
    const run = this.chain.then(() => this.stampNow(acts));
    this.chain = run.catch(() => undefined);
    return run;
  }

  private async stampNow(acts: string[]): Promise<Made[]> {
    for (const a of acts) if (!HEX64.test(a)) throw new Error(`not an act id: ${a}`);
    const fresh = [...new Set(acts)].filter((a) => !(a in this.state.stamped));
    if (!fresh.length) return [];
    const time = Math.max(this.now(), this.state.last);
    const made: Made[] = [];
    for (let i = 0; i < fresh.length; i += MOST_PER_STAMP) {
      const part = fresh.slice(i, i + MOST_PER_STAMP);
      const s = this.o.identity.sign(TIMESTAMP_SPEC, STAMP_TYPE, encodeStamp({ time, acts: part }), { public: true });
      this.state.last = time;
      this.o.save?.();
      // Counted as stamped once published: a stamp that did not reach its
      // relays is made again later, at a later time (the earliest counts).
      for (const r of this.o.outbox) await relayAt(r, this.o.via).putAct(s.act);
      for (const a of part) this.state.stamped[a] = time;
      this.o.save?.();
      made.push({ stamp: s.id, time, acts: part });
    }
    return made;
  }

  /**
   * Read each relay followed from where it was left, and stamp every act
   * found there that it has not stamped: never its own acts, only the
   * signers named where some are. A relay that does not answer, or a stamp
   * that could not be published, is tried again next time.
   */
  async sweep(): Promise<Made[]> {
    const found: string[] = [];
    const cursors: Record<string, number> = {};
    for (const r of this.o.watch ?? []) {
      let after = this.state.cursors[r];
      for (;;) {
        let page;
        try {
          page = await relayAt(r, this.o.via).feed({ after });
        } catch {
          break;
        }
        for (const it of page.items) {
          if (it.kind !== 'act') continue;
          let d: { id: string; signer?: string };
          try {
            d = describeAct(it.item) as { id: string; signer?: string };
          } catch {
            continue;
          }
          if (!d.signer || d.signer === this.id) continue;
          if (this.o.signers && !this.o.signers.includes(d.signer)) continue;
          if (!(d.id in this.state.stamped) && !found.includes(d.id)) found.push(d.id);
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
        cursors[r] = after;
      }
    }
    // The cursors move only once what was found is stamped, so a failure
    // to publish finds the same acts again next time.
    const made = await this.stamp(found);
    Object.assign(this.state.cursors, cursors);
    this.o.save?.();
    return made;
  }

  /**
   * The open form for acts given (`POST /stamp`, a JSON body `{"acts":
   * ["<act id>", …]}`): answers `{"stamps": [{stamp, time, acts}],
   * "before": {"<act id>": time}}`, the stamps made now, and the time each
   * act already stamped was stamped at.
   */
  serve(port: number, host = '127.0.0.1'): Promise<Server> {
    const server = createServer((req, res) => {
      const answer = (code: number, body: unknown) => {
        res.writeHead(code, { 'content-type': 'application/json' });
        res.end(JSON.stringify(body));
      };
      if (req.method !== 'POST' || req.url !== '/stamp') return answer(404, { error: 'POST /stamp only' });
      let body = '';
      req.setEncoding('utf8');
      req.on('data', (c: string) => {
        body += c;
        if (body.length > 64 * 1024) req.destroy();
      });
      req.on('end', async () => {
        let acts: unknown;
        try {
          acts = (JSON.parse(body) as { acts?: unknown }).acts;
        } catch {
          return answer(400, { error: 'not JSON' });
        }
        if (!Array.isArray(acts) || !acts.length || !acts.every((a) => typeof a === 'string' && HEX64.test(a))) {
          return answer(400, { error: 'acts: a list of act ids (64 lower-case hex digits)' });
        }
        const before = Object.fromEntries((acts as string[]).filter((a) => a in this.state.stamped).map((a) => [a, this.state.stamped[a]]));
        try {
          answer(200, { stamps: await this.stamp(acts as string[]), before });
        } catch (e) {
          answer(502, { error: e instanceof Error ? e.message : String(e) });
        }
      });
    });
    return new Promise((resolve) => server.listen(port, host, () => resolve(server)));
  }
}
