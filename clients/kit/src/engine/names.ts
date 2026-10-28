// The one name reader every app's engine uses (hand test v3, H96, H106): an
// identity's published name (the naming cMIP, `cmips/cmip-naming-draft-1.md`),
// read at its homes, the relays its routes name and the places given, with
// the states a page shows: the name; none published (its homes answered and
// none is attached: "No name published", which is also what an identity that
// never uses the naming cMIP reads as); not reached (its homes could not be
// asked: "Name not reached", never "no name", since silence proves nothing).
// Read once a few minutes per identity, in this program's memory only.
//
// Engine side: it reads MOR; the page shows what it gives through the kit's
// `who` and `attachIds`. Nothing from Node: the web clients run it too.

import type { Via } from '../../../genesis/src/transport.ts';
import { namesOf } from '../../../dub/src/names.ts';
import type { NameShown } from '../html.ts';

const now = () => Date.now();

export class NameReader {
  private kept = new Map<string, { shown: NameShown; at: number }>();
  private reading = new Map<string, Promise<NameShown>>();

  /** `keep`: how long a name read (or none) is kept, in milliseconds; a name not reached is asked again after a tenth of it. */
  constructor(private o: { via?: Via; keep?: number } = {}) {}

  /** Its published name, as its homes give it; `fresh` asks again whatever was kept. */
  read(id: string, places: string[], fresh = false): Promise<NameShown> {
    const keep = this.o.keep ?? 300_000;
    const k = this.kept.get(id);
    if (k && !fresh && now() - k.at < (k.shown.state === 'unreached' ? keep / 10 : keep)) return Promise.resolve(k.shown);
    const r = this.reading.get(id);
    if (r && !fresh) return r;
    const p = (async (): Promise<NameShown> => {
      let shown: NameShown;
      try {
        const found = await namesOf(id, places, this.o.via ?? {});
        const name = found.map((x) => x.name).pop();
        shown = name ? { state: 'name', name } : { state: 'none' };
      } catch {
        shown = { state: 'unreached' };
      }
      this.kept.set(id, { shown, at: now() });
      this.reading.delete(id);
      return shown;
    })();
    this.reading.set(id, p);
    return p;
  }

  /** Several at once, by ID. */
  async many(ids: string[], places: string[], fresh = false): Promise<Record<string, NameShown>> {
    const out: Record<string, NameShown> = {};
    await Promise.all([...new Set(ids)].filter((x) => /^[0-9a-f]{64}$/.test(x)).map(async (id) => (out[id] = await this.read(id, places, fresh))));
    return out;
  }

  /** What is kept of it now, without asking: "Loading…" where nothing is. */
  now(id: string): NameShown {
    return this.kept.get(id)?.shown ?? { state: 'loading' };
  }

  /** Forget what was kept of one (its name was just changed here). */
  forget(id: string): void {
    this.kept.delete(id);
  }
}
