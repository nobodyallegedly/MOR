// The lines of acts an identity keeps, read from its homes and relays
// (Identity draft 12, rule 35, was 17: "Clients SHOULD track every sequence
// the owner has started, on any device, and warn before a rotation that
// omits one"; client conformance). Shared by every client that rotates
// (the genesis client, the collective client) and every client that shows
// its own line (MOR Post, the desk, the genesis client; F152).
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
      ...(why ? { why } : {}),
    });
  }
  // Own line first, then by latest act.
  return out.sort((a, b) => Number(b.own) - Number(a.own) || (a.tip < b.tip ? -1 : 1));
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
  /** Said before signing where anything is left out; null where nothing is. */
  warning: string | null;
}

/**
 * Plan a rotation's kept lines (Identity rule 35, client conformance): every
 * line kept, except those named in `leaveOut` (by their latest act); a line
 * this device cannot read is kept by its card in `cards`, or, given none,
 * left out after the same warning. A card for a line read here must match
 * what was read; a card for an act not found is kept as given, and said.
 */
export function planLines(lines: FoundLine[], o: { leaveOut?: string[]; cards?: Card[] } = {}): LinePlan {
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
  const kept: Card[] = [];
  const left: FoundLine[] = [];
  const shown: LinePlan['shown'] = [];
  for (const l of lines) {
    const card = cards.find((c) => c.act === l.tip) ?? l.card;
    if (leaveOut.has(l.tip)) {
      left.push(l);
      shown.push({ text: `${lineWords(l)} Left out by name: its acts become void.`, tone: 'bad' });
    } else if (card) {
      kept.push(card);
      shown.push({ text: l.readable ? `${lineWords(l)} Kept.` : `${lineWords(l)} Kept by the card given: position ${card.position}, summary ${card.summary}.`, tone: l.readable ? 'ok' : 'warn' });
    } else {
      left.push(l);
      shown.push({ text: `${lineWords(l)} No card was given, so it is left out: its acts become void.`, tone: 'bad' });
    }
  }
  for (const c of cards) {
    if (lines.some((l) => l.tip === c.act)) continue;
    kept.push(c);
    shown.push({ text: `A line ending at ${c.act}, not found at the identity's homes or relays: kept by the card given (position ${c.position}, summary ${c.summary}).`, tone: 'warn' });
  }
  return { kept, left, shown, warning: left.length ? voidWarning(left) : null };
}

/** Refuse a plan whose warning was not shown: the caller passes back, word for word, what it showed. */
export function checkWarned(plan: LinePlan, warned: string | undefined): void {
  if (plan.warning && warned !== plan.warning) {
    throw new Error(`Nothing was signed. ${plan.warning} Show this to the owner and pass it back to leave ${plan.left.length === 1 ? 'it' : 'them'} out, or give a card for each line to keep.`);
  }
}

/**
 * Cards as the owner types or pastes them, one per line: the latest act, its
 * position and its summary, separated by spaces, colons or commas (as an
 * app's card shows them).
 */
export function readCards(text: string): Card[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [act, position, summary, ...rest] = l.split(/[\s:,]+/);
      if (rest.length || !act || !position || !summary) throw new Error(`“${l}”: a card is a latest act, a position and a summary`);
      return { act: act.toLowerCase(), position: Number(position), summary: summary.toLowerCase() };
    });
}
