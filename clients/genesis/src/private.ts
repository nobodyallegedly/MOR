// Every private act an app signs is left at the identity's own homes (H80's
// question 2, 21 October 2026; the Suite lead's decision, on the H80
// session's lean). Shared by Dub, Edubba, Damgar and Ummia, on the Mac and
// on the web.
//
// The copy for the identity itself: an act addressed to it alone is sealed
// to it, as its drafts are. An act addressed to someone else cannot be
// sealed to anyone it does not name (Envelopes' addressing check): its
// content key is delivered to the identity instead, by a key delivery
// (Envelopes type 1) sealed to it, signed on a line of its own
// (`signApart`) so that the app's line does not grow by one act per
// message. An act addressed to no one is sealed to the identity's own key
// without naming it, under that key's pickup tag.
//
// In plain words: an app's line of acts is kept through a change of keys by
// its card, which names the line's latest act (Identity rule 35). Kišib can
// tie a card to the identity only if the homes hold that act; a reader can
// tell that an act on the line is kept only if it can follow the line back,
// act by act, which means opening each one. So each private act goes to
// every home twice: locked (anyone may see that it exists, no one what it
// says), and sealed to the identity itself, so that any of its apps opens it
// and follows the line (as Edubba's drafts and Damgar's accepted list
// already travelled). Until a home has taken both, the act waits in the
// identity's file (`unsent`) and is sent again before the app shows its
// card. *Cost:* every private message the identity sends is readable again
// by whoever holds its encryption key (its signing words carry it), as the
// drafts and the member keys already were; the homes see one more sealed
// container per private act, never what it says.

import { ENVELOPES_TYPES, SPECS, describeAct, keyDeliveryPayload, openSealed, pickupTag, readKeyDelivery, unhex, xwingPublic } from './core.ts';
import { sealFor, type TestIdentity } from './identity.ts';
import { lookUp } from './lookup.ts';
import { actsBy, cardText, ownLine, unplaced, type Card, type LineKind } from './lines.ts';
import { relayAt, type Via } from './transport.ts';

// No Buffer: Dub's web client runs this file in a browser.
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

/** The encryption key this identity holds last, public half: the self-sealed copy is sealed to it. Null where none is held. */
function ownKey(me: TestIdentity): Uint8Array | null {
  const e = me.f.encryption[me.f.encryption.length - 1];
  if (!e) return null;
  // An identity held by Kišib's runner: this app holds its encryption key's public half only.
  return e.secret ? (xwingPublic(unhex(e.secret)) as Uint8Array) : e.public ? unhex(e.public) : null;
}

/**
 * Leave a private act of `me` at each of its homes: the locked act, and
 * (unless `sealed`, where the caller already left it sealed to the identity
 * itself, or `lockedOnly`, for an act signed under a lane, on the grant's
 * strand rather than the identity's line) a copy sealed to the identity.
 * Returns the homes that took both.
 * Once one has, the act no longer waits in `unsent`; save the file after.
 * Never throws: a home away is tried again before the card is shown.
 */
export async function leaveAtHomes(me: TestIdentity, made: { act: Uint8Array; id: string; key: Uint8Array }, o: { via?: Via; sealed?: boolean; lockedOnly?: boolean } = {}): Promise<string[]> {
  const via = o.via ?? me.via;
  const key = o.sealed || o.lockedOnly ? null : ownKey(me);
  const to = (describeAct(made.act) as { to?: string[] }).to ?? [];
  let copy: { sealed: Uint8Array; tags: string[] } | null = null;
  if (key && to.length === 1 && to[0] === me.f.identity) copy = { sealed: sealFor(made.act, made.key, [{ id: me.f.identity, key }]), tags: [] };
  else if (key && !to.length) copy = { sealed: sealFor(made.act, made.key, [{ key }]), tags: [pickupTag(key)] };
  else if (key) {
    const kd = await me.signApartNow(SPECS.envelopes, ENVELOPES_TYPES.keyDelivery, keyDeliveryPayload(made.id, made.key, false), { to: [me.f.identity] });
    copy = { sealed: sealFor(kd.act, kd.key, [{ id: me.f.identity, key }]), tags: [] };
  }
  const took: string[] = [];
  for (const h of me.f.homes) {
    try {
      await relayAt(h.hint, via).putAct(made.act);
      if (copy) await relayAt(h.hint, via).putSealed(copy.sealed, copy.tags);
      took.push(h.hint);
    } catch {
      // that home is away, or declined: tried again before the card is shown
    }
  }
  if (took.length && (o.sealed || o.lockedOnly || copy) && me.f.unsent?.[made.id]) delete me.f.unsent[made.id];
  return took;
}

/** Send again every private act still waiting (`unsent`). Returns how many still wait; save the file after. */
export async function sendWaiting(me: TestIdentity, via: Via = me.via): Promise<number> {
  for (const [id, x] of Object.entries(me.f.unsent ?? {})) {
    await leaveAtHomes(me, { id, act: unb64(x.act), key: unb64(x.key) }, { via });
  }
  return Object.keys(me.f.unsent ?? {}).length;
}

/** An app's line, as its identity window shows it for Kišib. */
export interface LineAtHomes {
  acts: number;
  latest: string | null;
  summary: string | null;
  /** Whether the homes hold its latest act; null where no home answered. */
  atHomes: boolean | null;
  /** Acts of the line the homes do not hold, after sending again what waited. */
  missing: number;
  /** Acts of the line, under the key in force, that Kišib cannot place by reading. */
  hidden: number | null;
  /** The card to give Kišib: null where there is no line, or its latest act is not at the homes. */
  card: string | null;
}

/** An app's lines, each with its kind (F376); a file not yet split keeps its one line, kind unnamed. */
function linesHeld(f: TestIdentity['f']): { kind?: LineKind; ids: string[] }[] {
  if (!f.split) return f.sequence.length ? [{ ids: f.sequence }] : [];
  return ([['public', f.sequence], ['private', f.private ?? []], ['earlier', f.earlier ?? []]] as [LineKind, string[]][]).filter(([, ids]) => ids.length).map(([kind, ids]) => ({ kind, ids }));
}

/**
 * This app's lines of `me`, as the homes hold them (the Suite lead's point
 * 3; F376: its public line, its private line, and the line it kept before,
 * each with its own card), read back from the homes and the relays the
 * identity's routes name, as Kišib reads them. The cards name only acts the
 * homes hold; where one does not, there is no card yet, and `missing` says
 * how many acts are not there. Read only: the app sends what waits first
 * (`sendWaiting`), in its own turn, so that no save overtakes an act being
 * signed.
 */
export async function lineAtHomes(me: TestIdentity, app: string, via: Via = me.via): Promise<LineAtHomes> {
  const lines = linesHeld(me.f).map((l) => ({ ...l, card: ownLine(l.ids).card! }));
  const acts = lines.reduce((n, l) => n + l.ids.length, 0);
  const shown = (l?: (typeof lines)[number]) => ({ acts, latest: l?.card.act ?? null, summary: l?.card.summary ?? null });
  // The line named first: the private one, where the latest private act lives; else the public one.
  const first = lines.find((l) => l.kind === 'private') ?? lines[0];
  if (!lines.length) return { ...shown(), atHomes: null, missing: 0, hidden: 0, card: null };
  const homes = me.f.homes.map((h) => h.hint);
  let places = homes;
  try {
    const look = await lookUp(me.f.identity, homes, via);
    places = [...new Set([...homes, ...look.resolution.homes.map((h) => h.hint), ...look.routes.routes.flatMap((x) => x.hints)])];
  } catch {
    // its homes did not answer: read what can be read
  }
  const found = await actsBy(me.f.identity, places, via);
  if (!found.length) return { ...shown(first), atHomes: null, missing: 0, hidden: null, card: null };
  const held = new Set(found.map((a) => (describeAct(a) as { id: string }).id));
  const u = new Set(unplaced({ identity: me.f.identity, binding: me.f.binding, acts: found }));
  const cards = lines.map((l) => {
    const missing = l.ids.filter((id) => !held.has(id)).length;
    const card: Card = { ...l.card, hidden: l.ids.filter((id) => u.has(id)).length, ...(l.kind ? { line: l.kind } : {}), ...(missing ? { missing } : {}) };
    return { l, card, missing, atHomes: held.has(l.card.act) };
  });
  const away = cards.find((c) => !c.atHomes);
  return {
    ...shown(away?.l ?? first),
    atHomes: !away,
    missing: cards.reduce((n, c) => n + c.missing, 0),
    hidden: cards.reduce((n, c) => n + c.card.hidden!, 0),
    card: away ? null : cards.map((c) => cardText(c.card, app)).join('; '),
  };
}

/**
 * Every act `identity` signed that its apps can read: the public ones at
 * `places`; every one sealed to it that `secrets` open, addressed to it or
 * left under its own keys' pickup tags; and every private one whose content
 * key it delivered to itself (`leaveAtHomes`). For a verifier that must
 * follow the identity's lines (a member key, F353).
 */
export async function ownActs(identity: string, secrets: Uint8Array[], places: string[], via: Via = {}): Promise<{ act: Uint8Array; key?: Uint8Array }[]> {
  const out = new Map<string, { act: Uint8Array; key?: Uint8Array }>();
  const locked = new Map<string, Uint8Array>();
  for (const a of await actsBy(identity, places, via)) {
    const d = describeAct(a) as { id: string; public: boolean };
    if (d.public) out.set(d.id, { act: a });
    else locked.set(d.id, a);
  }
  const delivered = new Map<string, Uint8Array>();
  if (!secrets.length) return [...out.values()];
  const queries: { q: { to?: string; pickup?: string }; me?: string }[] = [{ q: { to: identity }, me: identity }, ...secrets.map((s) => ({ q: { pickup: pickupTag(xwingPublic(s)) } }))];
  for (const h of places) {
    for (const { q, me } of queries) {
      let after: number | undefined;
      try {
        for (;;) {
          const page = await relayAt(h, via).feed({ ...q, after });
          for (const it of page.items) {
            if (it.kind !== 'sealed') continue;
            for (const s of secrets) {
              try {
                const o = openSealed(it.item, me, s) as { act: Uint8Array; key?: Uint8Array; described: { id: string; signer?: string; spec?: string; type?: number; payload?: Uint8Array } };
                const d = o.described;
                if (d.signer !== identity) break;
                if (d.spec === SPECS.envelopes && d.type === ENVELOPES_TYPES.keyDelivery && d.payload) {
                  const k = readKeyDelivery(d.payload) as { target: string; key: Uint8Array };
                  delivered.set(k.target, k.key);
                } else if (!out.has(d.id)) out.set(d.id, { act: o.act, key: o.key });
                break;
              } catch {
                // the next key
              }
            }
          }
          if (!page.items.length || page.next === after) break;
          after = page.next;
        }
      } catch {
        // that place is away
      }
    }
  }
  for (const [id, key] of delivered) if (!out.has(id) && locked.has(id)) out.set(id, { act: locked.get(id)!, key });
  return [...out.values()];
}

/**
 * `lineAtHomes`, remembered for a minute per identity while its line does
 * not move and nothing waits: an app's state is read at every refresh of its
 * page. A line whose latest act is not yet at the homes is read again each
 * time.
 */
export function lineReader(app: string): (me: TestIdentity, via?: Via) => Promise<LineAtHomes> {
  const seen = new Map<string, { latest: string | null; at: number; line: LineAtHomes }>();
  return async (me, via = me.via) => {
    const latest = linesHeld(me.f).map((l) => l.ids[l.ids.length - 1]).join(' ') || null;
    const was = seen.get(me.f.identity);
    const waiting = Object.keys(me.f.unsent ?? {}).length > 0;
    if (was && was.latest === latest && !waiting && was.line.atHomes && Date.now() - was.at < 60_000) return was.line;
    const line = await lineAtHomes(me, app, via);
    seen.set(me.f.identity, { latest, at: Date.now(), line });
    return line;
  };
}

/** This app's lines as it holds them, where its homes could not be read: no card. */
export function noLine(f: TestIdentity['f']): LineAtHomes {
  const lines = linesHeld(f);
  const l = (lines.find((x) => x.kind === 'private') ?? lines[0])?.ids ?? [];
  const own = ownLine(l);
  return { acts: lines.reduce((n, x) => n + x.ids.length, 0), latest: own.card?.act ?? null, summary: own.card?.summary ?? null, atHomes: null, missing: 0, hidden: null, card: null };
}
