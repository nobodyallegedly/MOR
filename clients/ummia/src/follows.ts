// Contacts, in Ummia: the follow list the people cMIP seals to the identity
// itself at its homes (`cmips/cmip-people-draft-2.md`, section 3), the same
// list Dub and Edubba read. Decided by Nobody, allegedly (the redesign,
// "Look"): following a developer's releases is "the same follow list, but
// here it filters". So Ummia reads it for Look's "my contacts", and adds to
// it from a signer's menu (Follow: add to contacts; Follow their releases),
// writing the next version as Dub does: on the latest version read, sealed
// to the identity's own encryption key, left at its homes. Muting is Dub's.
//
// Nothing from Node: the web client runs it too.

import { hex, unhex, xwingPublic } from '../../genesis/src/core.ts';
import { sealFor, type TestIdentity } from '../../genesis/src/identity.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { leaveAtHomes } from '../../genesis/src/private.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { PEOPLE_SPEC, SEALED_LIST, readSealedList, sealedListPayload, type Followed } from '../../dub/src/people.ts';
import type { Line } from './shapes.ts';

/** Said where the follow list is used here. */
export const FOLLOW_SAY = 'One follow list for every app: sealed to you at your homes, read by Dub, Edubba and Ummia. Here it points Look at the people you follow; muting is Dub’s.';

const secrets = (me: TestIdentity) => [...me.f.encryption].reverse().filter((e) => e.secret).map((e) => unhex(e.secret));

/** The follow list sealed to the identity, as its homes hold it; empty, with why, where it cannot be read here. */
export async function contacts(me: TestIdentity, via: Via): Promise<{ follows: Followed[]; problem: string | null }> {
  const keys = secrets(me);
  if (!keys.length) return { follows: [], problem: 'Ummia holds no encryption key of this identity: its follow list cannot be opened here.' };
  const l = await readSealedList(me.id, keys, me.f.homes.map((h) => h.hint), via);
  return { follows: l.follows, problem: !l.act && l.problems.length ? `its homes did not answer (${l.problems.join('; ')})` : null };
}

/**
 * Add an identity to the follow list (or give it a name there): the next
 * version written on the latest read, sealed to the identity, left at its
 * homes. Nothing changes where it is already followed with that name.
 */
export async function follow(me: TestIdentity, who: { id: string; name: string | null }, via: Via): Promise<Line[]> {
  const keys = secrets(me);
  if (!keys.length) throw new Error('Ummia holds no encryption key of this identity, so its follow list cannot be sealed to it. Follow in Dub instead. Nothing was signed.');
  if (who.id === me.id) throw new Error('That is this identity itself. Nothing was signed.');
  const homes = me.f.homes.map((h) => h.hint);
  const found = await readSealedList(me.id, keys, homes, via);
  if (!found.act && found.problems.length >= homes.length) throw new Error(`The follow list could not be read: its homes did not answer (${found.problems.join('; ')}). Nothing was signed.`);
  const follows = found.follows.map((f) => ({ ...f }));
  const had = follows.find((f) => f.id === who.id);
  if (had && (!who.name || had.name === who.name)) return [{ text: 'Already in your contacts: nothing to change.', tone: 'ok' }];
  if (had) had.name = who.name;
  else follows.push({ id: who.id, name: who.name });
  const look = await lookUp(me.id, homes, via);
  const held = me.f.encryption.find((e) => look.encryptionKey && e.secret && hex(xwingPublic(unhex(e.secret))) === hex(look.encryptionKey));
  if (!held || !look.encryptionKey) throw new Error('The encryption key this identity publishes is not one Ummia holds: the follow list cannot be sealed from here. Nothing was signed.');
  const made = await me.signNow(PEOPLE_SPEC, SEALED_LIST, sealedListPayload({ version: found.version + 1, previous: found.act, follows }), { public: false, to: [me.id] });
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
  // Its locked act beside it (H80's question 2): the latest act of Ummia's line, which Kišib must find at the homes.
  await leaveAtHomes(me, made, { via, sealed: left > 0 });
  const lines: Line[] = [];
  if (found.forked) lines.push({ text: 'The follow list at your homes was forked: two apps changed it at once. The longer branch was continued.', tone: 'warn' });
  lines.push(left ? { text: `Added to your contacts: the follow list is sealed to you and kept at your homes (version ${found.version + 1}); Dub and Edubba read it too.`, tone: 'ok' } : { text: 'No home took the follow list: nothing changed there. Try again.', tone: 'warn' });
  return lines;
}
