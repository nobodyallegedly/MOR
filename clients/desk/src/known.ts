// Who is known, in Edubba as in every app of the suite (hand test v3: H96,
// H100, H106, H109, H119): the one contacts list, the people cMIP's, sealed
// to the identity in use at its homes, nicknames included; and the names
// identities published (the naming cMIP), read by the kit's one name reader.
// The page asks `names` for every ID it draws, `contacts` for the list top
// left, and `contact add`, `contact nick`, `contact remove` to change it.
//
// H100, his words: "Edubba keeps its own Contacts on the Mac … one list, the
// people cMIP's". Edubba's own list from before (`contacts.json`, kept on
// this Mac or in this browser, never published) is carried into the sealed
// list of each identity held here once: each contact missing there is added,
// the name given in Edubba kept as its nickname. That it was carried is
// remembered (`contacts-carried.json`); from then on Edubba reads and
// changes the sealed list only (`Real.contacts`, `real contact add`).
// Identities used through Kišib's runner are not carried into: Edubba holds
// no key to sign their list with.
//
// Engine side, the same on a computer and in the web client.
//
// TEST IDENTITIES ONLY.

import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { idWhere } from '../../genesis/src/forms.ts';
import type { TestIdentity } from '../../genesis/src/identity.ts';
import type { Named } from '../../kit/src/html.ts';
import { Known, type KnownContacts } from '../../kit/src/engine/known.ts';
import { changeContacts, heldSecrets, readNick, type Said } from '../../kit/src/engine/people.ts';
import type { Member } from './member.ts';
import type { Real } from './real.ts';
import type { Store } from './store.ts';

const err = (e: unknown) => (e instanceof Error ? e.message : String(e));
const HEX64 = /^[0-9a-f]{64}$/;
/** Where Edubba remembers that its own list was carried (H100), in its folder; `Real` reads it too. */
export const CARRIED = 'contacts-carried.json';
/** The name Edubba gives an identity taken from Kišib's runner until Kišib names it: no name of the person's. */
const PLACEHOLDER = /^[0-9a-f]{8}…$/;

/** What was carried from Edubba's own list (H100): into which identities, and whether the list is retired. */
interface Carried {
  /** Each identity carried into, and when (seconds). */
  into: Record<string, number>;
  /** Every identity it could be carried into was: Edubba's own list is read no more. */
  done: boolean;
}

/** An identity held here as the top right and the identity panel show it (H88, H96): its names, its ID link. */
export interface HeldShown {
  named: Named;
  /** Its ID with where it lives (`mid1…?r=…`): Share your ID link. */
  link: string;
}

export class EdubbaKnown {
  private readers = new Map<string, Known>();

  constructor(
    private store: Store,
    private real: Real,
    private member: Member,
  ) {}

  /** The kit's reader, for the ways to reach an address in Edubba's settings now (a change of them starts a new one). */
  private get known(): Known {
    const via = this.store.settings().via;
    const k = JSON.stringify(via);
    let r = this.readers.get(k);
    if (!r) {
      r = new Known('Edubba', { via });
      this.readers.set(k, r);
    }
    return r;
  }

  private get via() {
    return this.store.settings().via;
  }

  /** Where names are asked: the identity's homes, then Edubba's relays and homes. */
  private places(me?: TestIdentity | null): string[] {
    const s = this.store.settings();
    return [...new Set([...(me?.f.homes.map((h) => h.hint) ?? []), ...s.relays, ...s.homes.map((h) => h.hint)])];
  }

  /** The identity in use, its file and what opens what is sealed to it (its keys here, or Kišib's runner where it lets Edubba open). */
  private async inUse(): Promise<{ me: TestIdentity; open: Awaited<ReturnType<Member['dub']['openerFor']>> } | null> {
    const id = await this.member.acting();
    if (!id || !this.store.holds(id)) return null;
    const me = this.store.identity(id);
    const open = await this.member.dub.openerFor(id).catch(() => null);
    return { me, open };
  }

  /** H96: the name Edubba gives an identity held here (kept here, never published): a nickname, the person's own. */
  private bookName(id: string): string | null {
    const n = this.store.book().identities.find((i) => i.id === id)?.name ?? null;
    return n && !PLACEHOLDER.test(n) ? n : null;
  }

  /** Forget the lists kept a while (read again at the next ask): asked when the follow lists are read again. */
  forget(): void {
    for (const k of this.readers.values()) for (const i of this.store.book().identities) k.forget(i.id);
  }

  // ------------------------------------------------------------ names (H96, H106)

  /**
   * The names of these identities, for the page (the kit's `attachIds`):
   * the nickname (from the sealed list of the identity in use; for an
   * identity held here, the name Edubba gives it where the list gives none)
   * and the name each published, read at its homes. `fresh`: asked again.
   */
  async names(ids: string[], fresh = false): Promise<Record<string, Named>> {
    const want = [...new Set(ids.filter((x) => HEX64.test(x)))].slice(0, 200);
    const u = await this.inUse();
    let out: Record<string, Named>;
    if (u) out = await this.known.named(u.me, u.open, want, this.places(u.me), { via: this.via, fresh });
    else {
      const published = await this.known.names.many(want, this.places(), fresh);
      out = Object.fromEntries(want.map((id) => [id, { nick: null, published: published[id] }]));
    }
    // Until Edubba's own list is carried into the sealed list (H100), the names given in it are nicknames too.
    const mine = this.retired() ? [] : this.real.macList();
    for (const id of want) {
      const own = this.bookName(id) ?? mine.find((m) => m.id === id)?.name ?? null;
      if (own && !out[id]?.nick) out[id] = { ...out[id], nick: own };
    }
    return out;
  }

  /**
   * Each identity held here (agents aside), as `state` gives it (H88, H96):
   * its names and its ID link. Kept fast: the published names are asked with
   * the reader's cache, waiting a moment at most; where not read yet,
   * "Loading…", and the page asks `names` once it is drawn.
   */
  async held(): Promise<Record<string, HeldShown>> {
    const s = this.store.settings();
    const ids = this.store.book().identities.map((i) => i.id).filter((id) => this.store.holds(id));
    const reading = Promise.all(ids.map((id) => this.known.names.read(id, this.places(this.store.identity(id))))).catch(() => undefined);
    await Promise.race([reading, new Promise((r) => setTimeout(r, 1500))]);
    return Object.fromEntries(
      ids.map((id) => {
        const me = this.store.identity(id);
        const home = me.f.homes.map((h) => h.hint).slice(0, 1);
        const relay = (s.relays.length ? s.relays : s.homes.map((h) => h.hint)).filter((r) => !home.includes(r)).slice(0, 1);
        return [id, { named: { nick: this.bookName(id), published: this.known.names.now(id) }, link: idWhere(id, [...home, ...relay]) }];
      }),
    );
  }

  // ------------------------------------------------------------ the one list (H100, H109)

  /** The contacts of the identity in use, each with its names; Edubba's own list carried into it first, once (H100). */
  async contacts(fresh = false): Promise<KnownContacts> {
    const u = await this.inUse();
    if (!u) return { contacts: [], problem: 'No identity in use: choose one in the identity panel, top right' };
    const problems = await this.carry();
    // Carried just now: the lists the read-backs name from are read again.
    if (problems.carried) await this.real.readLists().catch(() => undefined);
    const r = await this.known.contacts(u.me, u.open, this.places(u.me), { via: this.via, fresh: fresh || problems.carried });
    return { contacts: r.contacts, problem: r.problem ?? (problems.lines.length ? `Your contacts kept in Edubba before could not all be carried into the sealed list yet (${problems.lines.join('; ')})` : null) };
  }

  /** Add a contact (with a nickname), give or change one, or take a contact out: sealed as the people cMIP keeps the list, as the identity in use. */
  async change(op: 'add' | 'nick' | 'remove', id: string, nick: string | null = null): Promise<{ lines: Said[] }> {
    const u = await this.inUse();
    if (!u) throw new Error('No identity in use: choose one in the identity panel, top right. Nothing was signed.');
    if (op !== 'remove') await this.carry();
    const lines = await this.member.keep.exclusive(() => this.known.change(u.me, { op, id, nick }, { open: u.open, via: this.via, save: () => this.store.saveIdentity(u.me) }));
    // What `state` and the read-backs name from, read again.
    const now = await this.known.followed(u.me, u.open, this.via, true).catch(() => null);
    if (now && !now.problem) this.real.setListed(u.me.id, now.contacts);
    return { lines };
  }

  // ------------------------------------------------------------ Edubba's own list, carried once (H100)

  private carriedPath() {
    return this.store.path(CARRIED);
  }

  private carried(): Carried {
    return existsSync(this.carriedPath()) ? { into: {}, done: false, ...(JSON.parse(readFileSync(this.carriedPath(), 'utf8')) as Partial<Carried>) } : { into: {}, done: false };
  }

  /** Whether Edubba's own list was carried into the sealed lists: then only they are read. */
  retired(): boolean {
    return this.carried().done;
  }

  /**
   * Carry Edubba's own list into the sealed list of each identity held here
   * that Edubba can sign for (agents and identities used through Kišib
   * aside), once each: every contact missing there added, its name here as
   * its nickname; then the list is retired. An identity whose homes did not
   * answer is carried into the next time.
   */
  async carry(): Promise<{ carried: boolean; lines: string[] }> {
    const c = this.carried();
    if (c.done) return { carried: false, lines: [] };
    const mine = this.real.macList();
    const into = this.store
      .book()
      .identities.filter((i) => i.kind !== 'runner' && !this.store.isAgent(i.id) && this.store.holds(i.id))
      .map((i) => i.id)
      .filter((id) => heldSecrets(this.store.identity(id)).length && this.store.identity(id).f.signingSecret);
    const lines: string[] = [];
    let carried = false;
    // Nothing kept in Edubba's own list: nothing to carry, nothing signed.
    if (!mine.length) for (const id of into) c.into[id] ??= Math.floor(Date.now() / 1000);
    for (const id of into.filter((x) => !c.into[x])) {
      const me = this.store.identity(id);
      const nickOf = (name: string) => {
        try {
          return readNick(name);
        } catch {
          return null;
        }
      };
      try {
        const said = await this.member.keep.exclusive(() =>
          changeContacts(
            me,
            (now) => {
              const missing = mine.filter((m) => HEX64.test(m.id) && m.id !== id && !now.some((f) => f.id === m.id));
              return missing.length ? [...now, ...missing.map((m) => ({ id: m.id, name: nickOf(m.name) }))] : null;
            },
            { open: heldSecrets(me), via: this.via, app: 'Edubba', save: () => this.store.saveIdentity(me) },
          ),
        );
        // No home took it: not carried, asked again the next time.
        const away = said.find((x) => /^No home took/.test(x.text));
        if (away) throw new Error(away.text);
        c.into[id] = Math.floor(Date.now() / 1000);
        carried = true;
      } catch (e) {
        lines.push(`${this.bookName(id) ?? 'an identity'}: ${err(e).replace(/ Nothing was signed\.$/, '')}`);
      }
    }
    // Retired once every identity it could go to has it; with none held yet, it waits for one.
    c.done = into.length > 0 && into.every((x) => !!c.into[x]);
    if (carried || c.done || !mine.length) {
      const tmp = `${this.carriedPath()}.tmp`;
      writeFileSync(tmp, `${JSON.stringify(c, null, 2)}\n`, { mode: 0o600 });
      renameSync(tmp, this.carriedPath());
    }
    return { carried, lines };
  }
}
