// The lines of acts an identity keeps, read from its homes and relays
// (Identity draft 12, rule 35, was 17: "Clients SHOULD track every sequence
// the owner has started, on any device, and warn before a rotation that
// omits one"; client conformance). Shared by every client that rotates
// (the genesis client, the collective client) and every client that shows
// its own line (Dub, the desk, the genesis client; F152).
//
// In plain words: an identity's everyday acts form lines. Each act names
// the act before it in its line (`prev`); each app or device keeps its own
// line. A rotation keeps a line by naming its latest act, its position and
// the running summary of all its acts (Identity, rotation field 4). A line
// the rotation does not name becomes void. So before a rotation, the client
// reads every act the identity signed with the key being replaced, follows
// `prev` back from each line's latest act to its first, and keeps every
// line unless the owner leaves one out by name, after a warning.
//
// A private act's inside is locked: only whoever holds its key reads its
// `prev`. A line holding a private act made elsewhere cannot be followed
// here. It is shown as such, and its card (latest act, position, summary),
// copied from the app that made it, is asked for. Given nothing, it is left
// out only after the same warning as a line left out on purpose: never a
// refusal to rotate (a stolen key could block the owner by one private
// act), never a warning alone (Q2 of docs/rule-17-clients.md, read as
// mechanics, 12 October 2026).
//
// Every act is opened by the core library (`describeAct`, which gives
// `prev` since this build); this file only follows ids.
//
// A line holding private acts (H80's question 2, 21 October 2026): every
// app leaves each private act it signs at the identity's homes, locked,
// with a copy sealed to the identity itself (`private.ts`). Kišib still
// cannot open them, so each app's card also says how many acts of its line
// under the key in force Kišib cannot place (`unplaced`), and which app it
// is. The homes' count and the cards' counts agree only when every such act
// lies on a line whose card was given: the private acts are then placed
// without being read. A card whose latest act the homes do not hold, or an
// app's line with acts missing from the homes, is said in red before
// anything is signed: no reader could follow that line, so what lives on it
// (a member key, notes, a list) may stop counting.

import { MIRS, ENVELOPES_TYPES, IDENTITY_TYPES, describeAct, runningSummary } from './core.ts';
import { relayAt, type Via } from './transport.ts';

/** What a rotation names to keep a line (Identity, rotation field 4). */
export interface Card {
  /** The line's latest act. */
  act: string;
  /** Its position in its line, from 1. */
  position: number;
  /** The running summary of the line's acts, the latest included. */
  summary: string;
  /** Not part of what a rotation names. How many acts of the line, under the key in force, Kišib cannot place by reading (`unplaced`), as the app counts them. */
  hidden?: number;
  /** Not named either: how many acts of the line its app found missing from the homes. */
  missing?: number;
  /** Not named either: which app's line, as the app names itself (Dub, Edubba, Damgar, Ummia). */
  app?: string;
}

/** One line of acts, as read. */
export interface FoundLine {
  /** Its latest act. */
  tip: string;
  /** Whether this device made it: its sequence ends at `tip`. */
  own: boolean;
  /** Whether it could be followed back to its first act. */
  readable: boolean;
  /** Its card, where readable; null otherwise. */
  card: Card | null;
  /** Its latest act, in plain words. */
  latest: string;
  /** Where it cannot be followed: why, in plain words. */
  why?: string;
  /** The acts followed back from its latest act, latest first, as far as they could be followed. */
  walked: string[];
}

/** The parts of a described act this file reads. */
interface Described {
  id: string;
  signer?: string;
  binding?: string;
  public: boolean;
  spec?: string;
  type?: number;
  position?: number;
  prev?: string;
}

/** Which specification is which, for the plain words: by default the client's test values. */
export interface Specs {
  identity: string;
  envelopes: string;
  text: string;
  money: string;
  agreements: string;
}

const IDENTITY_WORDS: Record<number, string> = {
  [IDENTITY_TYPES.routes]: 'routes: where its acts are found and where to reach it',
  4: 'a name',
  5: 'a name withdrawn',
  6: 'a link claimed',
  7: 'a link confirmed',
  8: 'a link ended',
  14: 'an escape endorsement',
  [IDENTITY_TYPES.witness]: 'a witness act: acts of others it relies on',
};
const ENVELOPES_WORDS: Record<number, string> = {
  [ENVELOPES_TYPES.publication]: 'a publication (a post, a picture, a file)',
  [ENVELOPES_TYPES.keyDelivery]: 'a key delivery',
  3: 'a withdrawal of a publication',
  [ENVELOPES_TYPES.encryptionKey]: 'a new encryption key, to receive sealed messages',
  5: 'a vow',
};
const MONEY_WORDS: Record<number, string> = {
  0: 'a payee pointer: where it is paid',
  1: 'a debt it owes',
  2: 'a receipt of a payment',
  3: 'a claim of a payment it made',
  4: 'a release of a debt owed to it',
};
const AGREEMENTS_WORDS: Record<number, string> = {
  0: 'an agreement proposed',
  1: 'its signature on an agreement',
  3: 'a work claimed',
  4: 'a stake transferred',
  5: 'a release',
  6: 'a standing offer',
  8: 'a split',
  9: 'a grant',
  10: 'a grant revoked',
  16: 'a resignation',
  17: 'a record',
  19: 'a fork',
  20: 'a closing',
};

/** What an act is, in plain words, from what its outside and inside show. */
export function whatIs(d: { public: boolean; spec?: string; type?: number }, specs: Specs = MIRS): string {
  if (d.spec === undefined || d.type === undefined) return 'a private act: only those it was meant for can read what it is';
  const words =
    d.spec === specs.identity
      ? IDENTITY_WORDS[d.type]
      : d.spec === specs.envelopes
        ? ENVELOPES_WORDS[d.type]
        : d.spec === specs.text
          ? d.type === 0
            ? 'a text, such as a post or a message'
            : undefined
          : d.spec === specs.money
            ? MONEY_WORDS[d.type]
            : d.spec === specs.agreements
              ? AGREEMENTS_WORDS[d.type]
              : undefined;
  const w = words ?? `an act of type ${d.type} under ${d.spec === specs.identity ? 'Identity' : d.spec === specs.envelopes ? 'Envelopes' : d.spec === specs.money ? 'Money' : d.spec === specs.agreements ? 'Agreements' : 'another specification'}`;
  return d.public ? w : `${w}, private`;
}

/** This device's own line, as its sequence holds it (F152: each app shows its own line's latest act). */
export function ownLine(sequence: string[]): { acts: number; card: Card | null } {
  if (!sequence.length) return { acts: 0, card: null };
  return { acts: sequence.length, card: { act: sequence[sequence.length - 1], position: sequence.length, summary: runningSummary(sequence) } };
}

/** Every act `signer` signed that `hints` hold, each once, as the relays serve them. */
export async function actsBy(signer: string, hints: string[], via: Via = {}): Promise<Uint8Array[]> {
  const out = new Map<string, Uint8Array>();
  for (const hint of hints) {
    try {
      let after: number | undefined;
      for (;;) {
        const page = await relayAt(hint, via).feed({ signer, after });
        for (const it of page.items) {
          if (it.kind !== 'act') continue;
          try {
            const d = describeAct(it.item) as Described;
            if (!out.has(d.id)) out.set(d.id, it.item);
          } catch {
            // malformed: proves nothing
          }
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch {
      // that relay or home did not answer: silence proves nothing
    }
  }
  return [...out.values()];
}

/**
 * The lines of `identity` that a rotation replacing the signing key bound
 * by `binding` judges: every line whose latest act was signed with that
 * key, from the acts `acts` (as `actsBy` reads them), followed back by
 * `prev` to its first act. `own` is this device's sequence, oldest first:
 * its own acts are followed from it, private ones included. This device's
 * line is always among them, even where no relay holds it yet.
 */
export function linesOf(o: { identity: string; binding: string; own: string[]; acts: Uint8Array[]; specs?: Specs }): FoundLine[] {
  const specs = o.specs ?? MIRS;
  const held = new Map<string, Described>();
  for (const a of o.acts) {
    let d: Described;
    try {
      d = describeAct(a) as Described;
    } catch {
      continue;
    }
    if (d.signer !== o.identity) continue;
    // The identity chain is not a line of everyday acts.
    if (d.spec === specs.identity && (d.type === IDENTITY_TYPES.genesis || d.type === IDENTITY_TYPES.rotation || d.type === IDENTITY_TYPES.chainSignature)) continue;
    held.set(d.id, d);
  }
  // This device's own acts: their order is known from its sequence, even where private.
  const ownPrev = new Map<string, string | null>(o.own.map((id, i) => [id, i ? o.own[i - 1] : null]));
  const prevOf = (id: string): { known: boolean; prev: string | null } => {
    if (ownPrev.has(id)) return { known: true, prev: ownPrev.get(id)! };
    const d = held.get(id);
    if (!d || d.spec === undefined) return { known: false, prev: null };
    return { known: true, prev: d.prev ?? null };
  };
  // A tip is an act no other act names as its `prev`. A private act made
  // elsewhere names nothing this device can read, so an act it follows may
  // look like a tip: it is shown, and its line's card asked for.
  const named = new Set<string>();
  for (const id of [...held.keys(), ...o.own]) {
    const p = prevOf(id);
    if (p.prev) named.add(p.prev);
  }
  const ownTip = o.own[o.own.length - 1];
  const tips = [...held.values()].filter((d) => !named.has(d.id) && d.binding === o.binding).map((d) => d.id);
  if (ownTip && !tips.includes(ownTip) && !named.has(ownTip)) tips.push(ownTip);
  const out: FoundLine[] = [];
  for (const tip of tips) {
    const d = held.get(tip);
    const latest = d ? whatIs(d, specs) : 'an act made on this device';
    const ids: string[] = [];
    let at: string | null = tip;
    let why: string | undefined;
    while (at) {
      if (ids.includes(at)) {
        why = 'its acts name each other in a circle';
        break;
      }
      ids.push(at);
      const p = prevOf(at);
      if (!p.known) {
        why = held.has(at)
          ? `it holds a private act made elsewhere (${at.slice(0, 12)}…): only the app that made it can read which act comes before it`
          : `an act in it (${at.slice(0, 12)}…) was not found at its homes or relays`;
        break;
      }
      at = p.prev;
    }
    ids.reverse();
    const position = d?.position ?? (ownPrev.has(tip) ? o.own.indexOf(tip) + 1 : undefined);
    if (!why && position !== undefined && position !== ids.length) why = `its latest act says position ${position}, but ${ids.length} acts were found behind it`;
    out.push({
      tip,
      own: tip === ownTip,
      readable: !why,
      card: why ? null : { act: tip, position: ids.length, summary: runningSummary(ids) },
      latest,
      walked: [...ids].reverse(),
      ...(why ? { why } : {}),
    });
  }
  // Own line first, then by latest act.
  return out.sort((a, b) => Number(b.own) - Number(a.own) || (a.tip < b.tip ? -1 : 1));
}

/**
 * The acts of `identity` signed with the key `binding` bound that a reader
 * holding no key cannot place on a line (Kišib's view): every act under
 * that key, outside the lines it can follow from start to end. Private acts,
 * and acts whose line runs back into one. Each app counts its own among them
 * (`hidden` on its card), from the same acts, so that Kišib can tell whether
 * every one lies on a line whose card was given.
 */
export function unplaced(o: { identity: string; binding: string; acts: Uint8Array[]; specs?: Specs }): string[] {
  const specs = o.specs ?? MIRS;
  const placed = new Set(linesOf({ ...o, own: [] }).filter((l) => l.readable).flatMap((l) => l.walked));
  const out = new Set<string>();
  for (const a of o.acts) {
    let d: Described;
    try {
      d = describeAct(a) as Described;
    } catch {
      continue;
    }
    if (d.signer !== o.identity || d.binding !== o.binding || placed.has(d.id)) continue;
    if (d.spec === specs.identity && (d.type === IDENTITY_TYPES.genesis || d.type === IDENTITY_TYPES.rotation || d.type === IDENTITY_TYPES.chainSignature)) continue;
    out.add(d.id);
  }
  return [...out];
}

/** What may live on each app's line, for Kišib's warnings (which app's line, what leaving it out would cost). */
export const APP_LINES: Record<string, string> = {
  Dub: 'sealed messages, the follow list, answers to proposals, a member key for a collective, keys delivered to buyers, lane requests for Damgar',
  Edubba: 'drafts, an agent’s notes and diary, sealed messages and prompts, a member key for a collective, invitations to a founding, payments prepared for Damgar',
  Damgar: 'the accepted list, payment claims, receipts, requests and answers, sales, a vault transfer, asks for a collective’s promise',
  Ummia: 'the accepted list, payments prepared for an anchor, asks for a collective’s release, MIP discussions',
};

/** An app's line, named for the person: “Edubba’s line”, or “a line” where the card names no app. */
export function lineOf(app: string | undefined): string {
  return app ? `${app}’s line` : 'a line';
}

/** What may live on that app's line, in plain words. */
export function livesOn(app: string | undefined): string {
  return (app && APP_LINES[app]) ?? 'whatever its app signed there: possibly a member key for a collective, notes, a list';
}

/**
 * A card as an app shows it, for Kišib: its latest act, position and summary
 * (what the rotation names), then how many of its acts Kišib cannot place
 * by reading, then the app's name, and, where acts are missing from the
 * homes, how many: `<act> <position> <summary> <hidden> <App>[ missing <n>]`.
 */
export function cardText(c: Card, app: string): string {
  return `${c.act} ${c.position} ${c.summary}${c.hidden === undefined ? '' : ` ${c.hidden}`} ${app}${c.missing ? ` missing ${c.missing}` : ''}`;
}

/** The plain words for one line. */
export function lineWords(l: FoundLine): string {
  const whose = l.own ? 'This device’s line' : 'A line made elsewhere';
  if (l.readable && l.card) return `${whose}: ${l.card.position} act${l.card.position === 1 ? '' : 's'}, the latest ${l.card.act} (${l.latest}); summary ${l.card.summary}.`;
  return `${whose} that this device cannot read, ending at ${l.tip} (${l.latest}): ${l.why}. Give its card (its latest act, position and summary, as the app that made it shows them) to keep it.`;
}

/** The warning said before any line is left out: the same for a line left out by name and for an unread line given no card. */
export function voidWarning(left: FoundLine[]): string {
  return `${left.length === 1 ? 'One line of acts is' : `${left.length} lines of acts are`} left out of this rotation: ${left.map((l) => l.tip).join(', ')}. Every act of ${left.length === 1 ? 'that line' : 'those lines'}, signed with the key this rotation replaces, becomes void, unless someone relied on it in a way the protocol can see (Identity rules 34 and 35). Leave ${left.length === 1 ? 'it' : 'them'} out only if you did not make ${left.length === 1 ? 'it' : 'them'}, or no longer want ${left.length === 1 ? 'it' : 'them'} to count.`;
}

/** What a rotation keeps and leaves out, as shown to the owner. */
export interface LinePlan {
  /** What the rotation names (field 4). */
  kept: Card[];
  /** Lines left out: by name, or unread and given no card. */
  left: FoundLine[];
  /** What to show, in plain words, line by line. */
  shown: { text: string; tone?: 'ok' | 'warn' | 'bad' }[];
  /** Said before signing where anything is left out, or a line cannot be placed; null where neither. */
  warning: string | null;
}

/**
 * Plan a rotation's kept lines (Identity rule 35, client conformance): every
 * line kept, except those named in `leaveOut` (by their latest act); a line
 * this device cannot read is kept by its card in `cards`, or, given none,
 * left out after the same warning. A card for a line read here must match
 * what was read.
 *
 * With `held` (every act found at the identity's homes and relays) and
 * `unplaced` (`unplaced` above), a line is also placed (H80's question 2):
 * a card whose latest act is not held, or whose app found acts of its line
 * missing from the homes, is said in red, and the warning holds it until
 * read; and where every card counts the acts Kišib cannot place and the
 * counts add up to what the homes hold, the unread acts that are no card's
 * latest lie on those lines, kept with them, not left out.
 */
export function planLines(lines: FoundLine[], o: { leaveOut?: string[]; cards?: Card[]; held?: Iterable<string>; unplaced?: string[] } = {}): LinePlan {
  const leaveOut = new Set(o.leaveOut ?? []);
  const cards = o.cards ?? [];
  for (const t of leaveOut) if (!lines.some((l) => l.tip === t)) throw new Error(`no line found ends at ${t}: nothing to leave out`);
  for (const c of cards) {
    if (!Number.isSafeInteger(c.position) || c.position < 1 || !/^[0-9a-f]{64}$/.test(c.act) || !/^[0-9a-f]{64}$/.test(c.summary)) {
      throw new Error('a card is a latest act and a summary (64 hexadecimal characters each) and a position from 1');
    }
    const l = lines.find((x) => x.tip === c.act);
    if (l?.card && (l.card.position !== c.position || l.card.summary !== c.summary)) {
      throw new Error(`the card for ${c.act} does not match its line as read here (position ${l.card.position}, summary ${l.card.summary})`);
    }
    if (leaveOut.has(c.act)) throw new Error(`${c.act} is both given a card and left out`);
  }
  const held = o.held ? new Set(o.held) : null;
  const found = (act: string) => (held ? held.has(act) : lines.some((l) => l.tip === act));
  const kept: Card[] = [];
  const left: FoundLine[] = [];
  const shown: LinePlan['shown'] = [];
  // Red, before anything is signed: lines kept by a card that no reader can follow.
  const unplacedSay: string[] = [];
  for (const c of cards) {
    const whose = lineOf(c.app);
    if (!found(c.act)) {
      unplacedSay.push(
        `${whose[0].toUpperCase()}${whose.slice(1)} is not placed: its latest act (${c.act}) is not at the identity's homes, so no reader can follow it. What lives on it (${livesOn(c.app)}) may stop counting after this change, as if the line were left out: a member key for a collective would be lost with it. ${c.app ? `Open ${c.app} first: it sends its acts to the homes; then give its card again.` : 'Open the app that shows this card first: it sends its acts to the homes; then give its card again.'}`,
      );
    } else if (c.missing) {
      unplacedSay.push(
        `${whose[0].toUpperCase()}${whose.slice(1)} is not placed: ${c.missing === 1 ? 'one of its acts is' : `${c.missing} of its acts are`} not at the identity's homes (${c.app ?? 'its app'} says so), so no reader can follow it past ${c.missing === 1 ? 'it' : 'them'}. What lives on it (${livesOn(c.app)}) may stop counting after this change, as if the line were left out: a member key for a collective would be lost with it.`,
      );
    }
  }
  // Every act Kišib cannot place lies on a carded line: the cards' counts add up to the homes'.
  const counts = o.unplaced && cards.length && cards.every((c) => c.hidden !== undefined) ? cards.reduce((n, c) => n + c.hidden!, 0) : null;
  const covered = counts !== null && counts === o.unplaced!.length && !unplacedSay.length;
  const unread: FoundLine[] = [];
  for (const l of lines) {
    const card = cards.find((c) => c.act === l.tip) ?? l.card;
    const given = cards.find((c) => c.act === l.tip);
    if (leaveOut.has(l.tip)) {
      left.push(l);
      shown.push({ text: `${lineWords(l)} Left out by name: its acts become void.`, tone: 'bad' });
    } else if (card) {
      kept.push({ act: card.act, position: card.position, summary: card.summary });
      shown.push({
        text: l.readable && !given?.app ? `${lineWords(l)} Kept.` : `${given?.app ? `${given.app}’s line. ` : ''}${lineWords(l)} Kept by the card given: position ${card.position}, summary ${card.summary}.`,
        tone: l.readable || (given && !given.missing) ? 'ok' : 'warn',
      });
    } else if (covered) {
      unread.push(l);
    } else {
      left.push(l);
      shown.push({ text: `${lineWords(l)} No card was given, so it is left out: its acts become void.`, tone: 'bad' });
    }
  }
  if (unread.length) {
    shown.push({
      text: `${unread.length === 1 ? 'One more act Kišib cannot read lies' : `${unread.length} more acts Kišib cannot read (private, or behind a private act) lie`} on the lines kept by the cards given: those apps count ${counts} such act${counts === 1 ? '' : 's'}, and the homes hold ${counts}. Kept with them: ${unread.map((l) => l.tip).join(', ')}.`,
      tone: 'ok',
    });
  }
  if (counts !== null && !covered && !unplacedSay.length && counts < o.unplaced!.length) {
    const n = o.unplaced!.length - counts;
    shown.push({ text: `${n === 1 ? 'One act' : `${n} acts`} at the homes, signed with this key, lie${n === 1 ? 's' : ''} on no line whose card was given (the cards count ${counts}, the homes hold ${o.unplaced!.length}): an app whose card is missing, or someone else holding the signing key. Left out unless you give that app’s card.`, tone: 'bad' });
  }
  for (const c of cards) {
    if (lines.some((l) => l.tip === c.act)) continue;
    kept.push({ act: c.act, position: c.position, summary: c.summary });
    shown.push({ text: `${c.app ? `${c.app}’s line, ending` : 'A line ending'} at ${c.act}, not found at the identity's homes or relays: kept by the card given (position ${c.position}, summary ${c.summary}), but no reader can follow it.`, tone: found(c.act) ? 'warn' : 'bad' });
  }
  for (const t of unplacedSay) shown.push({ text: t, tone: 'bad' });
  const warning = [left.length ? voidWarning(left) : '', ...unplacedSay].filter(Boolean).join(' ') || null;
  return { kept, left, shown, warning };
}

/** Refuse a plan whose warning was not shown: the caller passes back, word for word, what it showed. */
export function checkWarned(plan: LinePlan, warned: string | undefined): void {
  if (plan.warning && warned !== plan.warning) {
    throw new Error(`Nothing was signed. ${plan.warning} Show this to the owner and pass it back to go on as it says, or give a card for each line to keep, its acts at the homes.`);
  }
}

/**
 * Cards as the owner types or pastes them, one per line: the latest act, its
 * position and its summary, separated by spaces, colons or commas (as an
 * app's card shows them); then, as the apps show them since H80's question 2,
 * how many of its acts Kišib cannot place, the app's name, and “missing” and
 * a number where acts are missing from the homes.
 */
export function readCards(text: string): Card[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [act, position, summary, ...rest] = l.split(/[\s:,]+/);
      if (!act || !position || !summary) throw new Error(`“${l}”: a card is a latest act, a position and a summary`);
      const c: Card = { act: act.toLowerCase(), position: Number(position), summary: summary.toLowerCase() };
      const words: string[] = [];
      for (let i = 0; i < rest.length; i++) {
        const w = rest[i];
        if (/^missing$/i.test(w) && /^\d+$/.test(rest[i + 1] ?? '')) c.missing = Number(rest[++i]);
        else if (/^\d+$/.test(w) && c.hidden === undefined && !words.length) c.hidden = Number(w);
        else if (/^[\p{L}\p{M}’'-]+$/u.test(w)) words.push(w);
        else throw new Error(`“${l}”: a card is a latest act, a position and a summary, then what its app adds (a count and its name)`);
      }
      if (words.length) c.app = words.join(' ');
      return c;
    });
}
