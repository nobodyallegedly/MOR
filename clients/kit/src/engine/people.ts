// The one contacts list every app reads and writes (hand test v3, H100,
// H109): the follow list the people cMIP seals to the identity itself at its
// homes (`cmips/cmip-people-draft-2.md`, section 3), each contact its ID and,
// where given, its nickname (sealed, "only you see it"). A contact or a
// nickname added in one app is in all. Written on the latest version read,
// sealed to the identity's own encryption key, left at its homes, as Dub has
// always written it. Opened with the keys the app holds, or through Kišib's
// runner where it lets the app open what is sealed to the identity.
//
// Engine side; nothing from Node: the web clients run it too.

import { hex, unhex, xwingPublic } from '../../../genesis/src/core.ts';
import { sealFor, type TestIdentity } from '../../../genesis/src/identity.ts';
import { lookUp } from '../../../genesis/src/lookup.ts';
import { leaveAtHomes } from '../../../genesis/src/private.ts';
import { relayAt, type Via } from '../../../genesis/src/transport.ts';
import { MAX_NAME } from '../../../dub/src/names.ts';
import { PEOPLE_SPEC, SEALED_LIST, readSealedList, sealedListPayload, type Followed, type Opener } from '../../../dub/src/people.ts';

export type { Followed, Opener };

/** One line said back, its tone: as every app's lines. */
export interface Said {
  text: string;
  tone?: 'ok' | 'warn';
}

/** The keys this app holds to open what is sealed to the identity, newest first. */
export const heldSecrets = (me: TestIdentity): Uint8Array[] => [...me.f.encryption].reverse().filter((x) => x.secret).map((x) => unhex(x.secret));

/** The contacts sealed to the identity, as its homes hold them; empty, with why, where they cannot be read here. */
export async function readContacts(me: TestIdentity, open: Opener | Uint8Array[] | null, via: Via = {}): Promise<{ contacts: Followed[]; version: number; problem: string | null }> {
  if (!open || (Array.isArray(open) && !open.length)) return { contacts: [], version: 0, problem: 'this app cannot open what is sealed to this identity, so its contacts cannot be read here' };
  const l = await readSealedList(me.id, open, me.f.homes.map((h) => h.hint), via);
  return { contacts: l.follows, version: l.version, problem: !l.act && l.problems.length ? `its homes did not answer (${l.problems.join('; ')})` : null };
}

/** A nickname as typed: trimmed, at most the naming cMIP's length; empty means none. */
export function readNick(typed: string | null | undefined): string | null {
  const n = (typed ?? '').normalize('NFC').trim();
  if (!n) return null;
  if ([...n].length > MAX_NAME) throw new Error(`A nickname is at most ${MAX_NAME} characters. Nothing was signed.`);
  if (/[\u0000-\u001f\u007f-\u009f\u2028\u2029\u202a-\u202e\u2066-\u2069]/u.test(n)) throw new Error('A nickname holds no line break, control character or direction override. Nothing was signed.');
  return n;
}

/**
 * Change the contacts: `change` is given the latest list read and returns the
 * new one (or null for no change). The next version is signed by the
 * identity (with its key held here, or through Kišib's runner), sealed to
 * its own encryption key and left at its homes. `app` names this app in what
 * is said.
 */
export async function changeContacts(me: TestIdentity, change: (now: Followed[]) => Followed[] | null, o: { open: Opener | Uint8Array[] | null; via?: Via; app: string; save?: () => Promise<void> | void }): Promise<Said[]> {
  const via = o.via ?? {};
  if (!o.open || (Array.isArray(o.open) && !o.open.length)) throw new Error(`${o.app} cannot open what is sealed to this identity, so its contacts cannot be changed from here. Nothing was signed.`);
  const homes = me.f.homes.map((h) => h.hint);
  const found = await readSealedList(me.id, o.open, homes, via);
  if (!found.act && found.problems.length >= homes.length) throw new Error(`The contacts could not be read: its homes did not answer (${found.problems.join('; ')}). Nothing was signed.`);
  const next = change(found.follows.map((f) => ({ ...f })));
  if (!next) return [{ text: 'Nothing changed.', tone: 'ok' }];
  const look = await lookUp(me.id, homes, via);
  if (!look.encryptionKey) throw new Error('This identity publishes no encryption key: its contacts cannot be sealed to it. Nothing was signed.');
  // With keys held here, the one published must be among them, or what is sealed could not be opened here again.
  if (Array.isArray(o.open) && !me.f.encryption.some((x) => x.secret && hex(xwingPublic(unhex(x.secret))) === hex(look.encryptionKey!))) throw new Error(`The encryption key this identity publishes is not one ${o.app} holds: its contacts cannot be sealed from here. Nothing was signed.`);
  let made: { act: Uint8Array; id: string; key: Uint8Array };
  try {
    made = await me.signNow(PEOPLE_SPEC, SEALED_LIST, sealedListPayload({ version: found.version + 1, previous: found.act, follows: next }), { public: false, to: [me.id] });
  } finally {
    await o.save?.();
  }
  const sealed = sealFor(made.act, made.key, [{ id: me.id, key: look.encryptionKey }]);
  let left = 0;
  for (const h of homes) {
    try {
      await relayAt(h, via).putSealed(sealed);
      left++;
    } catch {
      // that home is away: the others hold it
    }
  }
  // Its locked act beside it (H80's question 2): the latest act of this app's line, which Kišib finds at the homes.
  await leaveAtHomes(me, made, { via, sealed: left > 0 });
  await o.save?.();
  const said: Said[] = [];
  if (found.forked) said.push({ text: 'Your contacts were forked at your homes: two apps changed them at once. The longer branch was continued.', tone: 'warn' });
  said.push(left ? { text: `Your contacts are sealed to you and kept at your homes (version ${found.version + 1}): every app holding this identity reads them.`, tone: 'ok' } : { text: 'No home took your contacts: nothing changed there. Try again.', tone: 'warn' });
  return said;
}

/** Add a contact, with a nickname if given (H109); one there already keeps its place, its nickname set where one is given. */
export const addContact = (me: TestIdentity, who: { id: string; nick?: string | null }, o: Parameters<typeof changeContacts>[2]) =>
  changeContacts(
    me,
    (now) => {
      if (who.id === me.id) throw new Error('That is this identity itself. Nothing was signed.');
      const nick = readNick(who.nick);
      const had = now.find((f) => f.id === who.id);
      if (had && (!nick || had.name === nick)) return null;
      if (had) had.name = nick;
      else now.push({ id: who.id, name: nick });
      return now;
    },
    o,
  );

/** Give a contact a nickname, change it, or take it away (empty): the people cMIP's name, sealed (H109). */
export const setNick = (me: TestIdentity, who: { id: string; nick: string | null }, o: Parameters<typeof changeContacts>[2]) =>
  changeContacts(
    me,
    (now) => {
      const nick = readNick(who.nick);
      const had = now.find((f) => f.id === who.id);
      if (!had) {
        if (who.id === me.id) throw new Error('That is this identity itself. Nothing was signed.');
        now.push({ id: who.id, name: nick });
        return now;
      }
      if ((had.name ?? null) === nick) return null;
      had.name = nick;
      return now;
    },
    o,
  );

/** Take a contact out of the list. */
export const removeContact = (me: TestIdentity, id: string, o: Parameters<typeof changeContacts>[2]) => changeContacts(me, (now) => (now.some((f) => f.id === id) ? now.filter((f) => f.id !== id) : null), o);
