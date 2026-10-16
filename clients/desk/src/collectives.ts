// Edubba's Collectives tab (F333, decided by Nobody, allegedly: "one section
// is collectives"; the collective client taken in as its constitution
// sub-tab). The collective client's folder is read where it is
// (~/mor-collective), and its code is the library this uses: its `Actions`
// for every reviewed operation, its `collectiveApi` for the page's requests.
//
// - Act: what this user may do for each collective, text and pictures for
//   now, each permission naming the rule it rests on (`Actions.permissions`),
//   a post reviewed before it is signed (`Actions.preparePost`), and the
//   collective's own posts.
// - Its latest constitutional agreement, as a pop-up in plain words: the
//   deal-assessment tool's reading (`clients/assess`).
// - Constitution: everything the collective client does, through its API.

import { Actions } from '../../collective/src/actions.ts';
import { Store as CollectiveStore } from '../../collective/src/store.ts';
import { collectiveApi } from '../../collective/src/server.ts';
import { assess } from '../../assess/src/assess.ts';
import { gather } from '../../assess/src/gather.ts';
import { readFeed } from '../../site/src/feed.ts';
import { escapeControls } from '../../connector/src/words.ts';
import type { Store } from './store.ts';

const err = (e: unknown) => (e instanceof Error ? e.message : String(e));
const short = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`;

export class Collectives {
  readonly store: CollectiveStore;
  readonly actions: Actions;
  readonly api: (op: string, a: Record<string, unknown>) => Promise<unknown>;

  constructor(
    readonly dir: string,
    private readonly desk: Store,
  ) {
    this.store = new CollectiveStore(dir);
    this.actions = new Actions(this.store);
    const api = collectiveApi(this.actions, this.store);
    this.api = (op, a) => {
      this.places();
      return api(op, a);
    };
  }

  /** A folder with no places yet takes the desk's, so the person names them once. */
  private places(): void {
    const s = this.store.settings();
    const d = this.desk.settings();
    if (!s.homes.length && !s.relays.length && (d.homes.length || d.relays.length)) this.store.saveSettings({ ...s, homes: d.homes, relays: d.relays, via: d.via });
  }

  /** The list on top of the Collectives tab: each collective by its ID and the name given here. */
  list(): { id: string; name: string; closed: boolean; members: number }[] {
    return this.store.book().collectives.map((x) => {
      try {
        const c = this.store.collective(x.id);
        return { id: x.id, name: x.name, closed: !!c.f.closed, members: c.f.members.length };
      } catch {
        return { id: x.id, name: x.name, closed: false, members: 0 };
      }
    });
  }

  /**
   * Its latest constitutional agreement (the agreement in force, as
   * Agreements read it from its relays and homes), in plain words: the
   * deal-assessment tool's reading, its flags each with the rule it rests on.
   */
  async constitution(collective: string) {
    this.places();
    const c = this.store.collective(collective);
    const names = this.store.names();
    const ag = await this.actions.agreementsOf(c);
    const id = ag.agreement ?? c.f.agreement;
    let found = null;
    let payload = ag.terms?.payload ?? null;
    try {
      const g = await gather(id, [...new Set([...c.f.relays, ...this.store.settings().relays, ...this.store.settings().homes.map((h) => h.hint)])], this.store.settings().via, names);
      found = g.found;
      payload = g.payload;
    } catch (e) {
      if (!payload) throw new Error(`Its agreement ${short(id)} was not found: ${err(e)}`);
    }
    const a = assess(payload!, names, found);
    return {
      agreement: id,
      inForce: !!ag.agreement,
      note: ag.agreement ? null : `Agreements' reading could not be had (${ag.broken ?? ag.unread ?? 'nothing found'}): this is the agreement this device holds in force.`,
      ...a,
      plain: a.plain.map((p) => ({ ...p, text: escapeControls(p.text) })),
    };
  }

  permissions(collective: string) {
    this.places();
    return this.actions.permissions(collective);
  }

  /** The collective's own posts, as the site's feed reads them (it shown as an identity). */
  async posts(collective: string): Promise<{ items: { id: string; text: string; standing: string; pictures: string[] }[]; problems: string[] }> {
    this.places();
    const c = this.store.collective(collective);
    const s = this.store.settings();
    try {
      const f = await readFeed([{ identity: collective, name: null }], [...new Set([...c.f.relays, ...s.relays, ...s.homes.map((h) => h.hint), ...c.f.identity.homes.map((h) => h.hint)])], s.via);
      return {
        items: f.posts.map((x) => ({
          id: x.id,
          text: escapeControls(x.post?.text ?? ''),
          standing: x.post?.standing ?? x.problem ?? 'unknown',
          pictures: (x.post?.refs ?? []).flatMap((r) => (r.kind === 'picture' && r.bytes ? [`data:image/jpeg;base64,${Buffer.from(r.bytes).toString('base64')}`] : [])),
        })),
        problems: f.authors.filter((a) => a.problem).map((a) => a.problem!),
      };
    } catch (e) {
      return { items: [], problems: [err(e)] };
    }
  }
}
