// Who is known, in every app the same (hand test v3, H96, H100, H106, H109,
// H119): the one contacts list (the people cMIP's, sealed to the identity at
// its homes, nicknames included) and the names identities published (the
// naming cMIP), read by the one name reader. An app's engine holds one
// `Known` and answers its page's operations with it: `names` (the names of
// the IDs it draws), `contacts` (the list, each with its names), and the
// list changed (`contact add`, `contact nick`, `contact remove`).
//
// Engine side; nothing from Node: the web clients run it too.

import type { TestIdentity } from '../../../genesis/src/identity.ts';
import type { Via } from '../../../genesis/src/transport.ts';
import { idForm, readIdWhere } from '../../../genesis/src/forms.ts';
import type { Named } from '../html.ts';
import { NameReader } from './names.ts';
import { addContact, readContacts, removeContact, setNick, type Followed, type Opener, type Said } from './people.ts';

/** A contact as an app's page is given it: its ID, as written for people, and its names. */
export interface KnownContact {
  id: string;
  form: string;
  /** Its nickname (sealed, the person's own), or null. */
  name: string | null;
  named: Named;
}

/** Where a contacts list was read from, and why not where it could not be. */
export interface KnownContacts {
  contacts: KnownContact[];
  /** Why the sealed list could not be read or changed here; null where it can. */
  problem: string | null;
}

const HEX = /^[0-9a-f]{64}$/;

export class Known {
  readonly names: NameReader;
  private lists = new Map<string, { contacts: Followed[]; problem: string | null; at: number }>();

  /** `app`: this app's name, as said ("Damgar"). */
  constructor(
    private app: string,
    o: { via?: Via } = {},
  ) {
    this.names = new NameReader({ via: o.via });
  }

  /** The contacts sealed to the identity, read again at most once a minute (or now, `fresh`). */
  async followed(me: TestIdentity, open: Opener | Uint8Array[] | null, via: Via = {}, fresh = false): Promise<{ contacts: Followed[]; problem: string | null }> {
    const c = this.lists.get(me.id);
    if (c && !fresh && c.at + 60_000 > Date.now()) return c;
    let r: { contacts: Followed[]; problem: string | null };
    try {
      r = await readContacts(me, open, via);
    } catch (e) {
      r = { contacts: c?.contacts ?? [], problem: e instanceof Error ? e.message : String(e) };
    }
    this.lists.set(me.id, { ...r, at: Date.now() });
    return r;
  }

  /** The names of these identities: the nickname given (none for oneself), and the name each published, read at `places` and its own homes. */
  async named(me: TestIdentity, open: Opener | Uint8Array[] | null, ids: string[], places: string[], o: { via?: Via; fresh?: boolean } = {}): Promise<Record<string, Named>> {
    const want = [...new Set(ids.filter((x) => HEX.test(x)))].slice(0, 200);
    const [{ contacts }, published] = await Promise.all([this.followed(me, open, o.via), this.names.many(want, places, !!o.fresh)]);
    return Object.fromEntries(want.map((id) => [id, { nick: id === me.id ? null : (contacts.find((f) => f.id === id)?.name ?? null), published: published[id] }]));
  }

  /** The list, each contact with its names (its published name read, or its state). */
  async contacts(me: TestIdentity, open: Opener | Uint8Array[] | null, places: string[], o: { via?: Via; fresh?: boolean } = {}): Promise<KnownContacts> {
    const { contacts, problem } = await this.followed(me, open, o.via, o.fresh);
    const published = await this.names.many(contacts.map((c) => c.id), places);
    return { contacts: contacts.map((c) => ({ id: c.id, form: idForm(c.id), name: c.name, named: { nick: c.name, published: published[c.id] } })), problem };
  }

  /** Add a contact, with a nickname if given; set or take away a nickname; take a contact out. Each sealed as the people cMIP keeps the list. */
  async change(me: TestIdentity, a: { op: 'add' | 'nick' | 'remove'; id: string; nick?: string | null }, o: { open: Opener | Uint8Array[] | null; via?: Via; save?: () => Promise<void> | void }): Promise<Said[]> {
    // Typed or pasted as people write it (`mid1…`, an ID link), or as an app passes it.
    const id = HEX.test(a.id) ? a.id : readIdWhere(a.id.trim()).id;
    a = { ...a, id };
    const opts = { open: o.open, via: o.via, app: this.app, save: o.save };
    const said = a.op === 'add' ? await addContact(me, { id: a.id, nick: a.nick ?? null }, opts) : a.op === 'nick' ? await setNick(me, { id: a.id, nick: a.nick ?? null }, opts) : await removeContact(me, a.id, opts);
    this.lists.delete(me.id);
    return said;
  }

  /** Forget what was kept for an identity (it was removed, or its key changed). */
  forget(id: string): void {
    this.lists.delete(id);
    this.names.forget(id);
  }
}
