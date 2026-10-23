// Specification cards (the Dubsar Specification Card cMIP, draft 1,
// `cmips/cmip-specification-card-draft-1.md`; decided by Nobody, allegedly,
// 23 October 2026: "I think it's cMIP territory"; nothing core). A card is
// a plain public text act (Text type 0, no format), so every client shows
// it as a post; its lines say a specification's title, a summary, and where
// its releases, its test vectors and its discussion are. The creator's
// latest card in its own sequence counts; anyone else's is shown as their
// word. The core's eight texts name no creator: no card counts as theirs,
// and Ummia carries a built-in card for each, keyed by its hash, as its own
// words.
//
// Nothing from Node: the web client runs it too.

import { MIRS, cborDecode, describeAct } from '../../genesis/src/core.ts';
import type { TestIdentity } from '../../genesis/src/identity.ts';
import { referTo, type Reference } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { readActId, readForm, specForm, actForm } from '../../genesis/src/forms.ts';
import { Judge, post } from '../../barebone/src/post.ts';
import { POST_SPECS, TEXT_ACT } from '../../barebone/src/specs.ts';
import type { Line } from './shapes.ts';

/** A card's first line, exactly (1.2). */
export const CARD_HEAD = 'Dubsar Specification Card';

/** The limits of draft 1 (1.3). */
export const LIMITS = { title: 120, summary: 600, releases: 16, vectors: 8 } as const;

/** At most this many text acts read from one relay when looking for others' cards (section 7, its cost). */
export const CARDS_READ = 2000;

/** Said wherever cards are shown. */
export const CARD_SAY = [
  'A specification card is a signed post saying what a specification is for and where its releases, test vectors and discussion are (the Dubsar Specification Card cMIP). Every app shows it, as the plain post it is.',
  'Only its creator’s latest card speaks for the specification; anyone else’s is shown as their own word. A card changes nothing in the specification, which stays as it was published.',
  'Cards are found by asking the relays you name: one on a relay not asked stays unseen.',
];

/** What a card says (1.3). */
export interface CardFields {
  /** The specification's spec hash, hexadecimal. */
  spec: string;
  title: string;
  summary: string | null;
  /** Release acts, hexadecimal. */
  releases: string[];
  /** Act ids (hexadecimal) or web addresses. */
  vectors: string[];
  discussion: string | null;
}

const HEX64 = /^[0-9a-f]{64}$/;
const oneLine = (s: string) => s.replace(/\s+/g, ' ').trim();

/** A spec hash or an act id, typed in either form. */
function readHex(typed: string, label: 'mspec' | 'mact', what: string): string {
  const t = typed.trim();
  if (HEX64.test(t.toLowerCase())) return t.toLowerCase();
  try {
    return readForm(t, label).hex;
  } catch (e) {
    throw new Error(`${what}: ${e instanceof Error ? e.message : String(e)}.`);
  }
}

/** A card's text, canonical, from its fields; refused with why where a field is not as draft 1 writes it. */
export function cardText(c: CardFields): string {
  const title = oneLine(c.title);
  const summary = c.summary ? oneLine(c.summary) : '';
  if (!title) throw new Error('A card needs a title. Nothing was signed.');
  if (title.length > LIMITS.title) throw new Error(`A card’s title is at most ${LIMITS.title} characters. Nothing was signed.`);
  if (summary.length > LIMITS.summary) throw new Error(`A card’s summary is at most ${LIMITS.summary} characters. Nothing was signed.`);
  if (c.releases.length > LIMITS.releases) throw new Error(`A card names at most ${LIMITS.releases} releases. Nothing was signed.`);
  if (c.vectors.length > LIMITS.vectors) throw new Error(`A card names at most ${LIMITS.vectors} places for test vectors. Nothing was signed.`);
  const lines = [CARD_HEAD, `Specification: ${specForm(c.spec)}`, `Title: ${title}`];
  if (summary) lines.push(`Summary: ${summary}`);
  for (const r of c.releases) lines.push(`Release: ${actForm(r)}`);
  for (const v of c.vectors) lines.push(`Vectors: ${HEX64.test(v) ? actForm(v) : v}`);
  if (c.discussion) lines.push(`Discussion: ${actForm(c.discussion)}`);
  return lines.join('\n');
}

/** A card's fields from a text act's text; null where it is not a card as draft 1 writes one (1.3). */
export function readCardText(text: string): CardFields | null {
  const lines = text.split('\n');
  if (lines[0] !== CARD_HEAD) return null;
  const c: CardFields = { spec: '', title: '', summary: null, releases: [], vectors: [], discussion: null };
  let specs = 0;
  let titles = 0;
  for (const l of lines.slice(1)) {
    const m = /^([A-Za-z]+): (.+)$/.exec(l);
    if (!m) return null;
    const [, key, value] = m;
    try {
      if (key === 'Specification') {
        c.spec = readHex(value, 'mspec', 'Specification');
        specs++;
      } else if (key === 'Title') {
        c.title = value.slice(0, LIMITS.title);
        titles++;
      } else if (key === 'Summary') c.summary = value.slice(0, LIMITS.summary);
      else if (key === 'Release' && c.releases.length < LIMITS.releases) c.releases.push(readHex(value, 'mact', 'Release'));
      else if (key === 'Vectors' && c.vectors.length < LIMITS.vectors) c.vectors.push(/^https:\/\//.test(value) ? value : readHex(value, 'mact', 'Vectors'));
      else if (key === 'Discussion') c.discussion = readHex(value, 'mact', 'Discussion');
      // A key this draft does not know is skipped (1.3): a later draft may add keys.
    } catch {
      // a value not as written: that entry is skipped
    }
  }
  return specs === 1 && titles === 1 ? c : null;
}

/** The first line of a discussion thread (4.2), then its spec hash. */
export const discussionText = (title: string, spec: string) => `Discussion of ${oneLine(title)}\n${specForm(spec)}`;

/**
 * Sign and publish a card, its references written as Envelopes rule 20
 * asks (1.4, client conformance): the specification's publication first,
 * with its signer, where there is one; then each release and the
 * discussion, each held here first and its signer named.
 */
export async function publishCard(me: TestIdentity, c: CardFields, o: { publication: string | null; relays: string[]; find?: string[]; via: Via }): Promise<{ id: string; text: string }> {
  const text = cardText(c);
  const refs = await cardRefs([...(o.publication ? [o.publication] : []), ...c.releases, ...(c.discussion ? [c.discussion] : [])], [...new Set([...o.relays, ...(o.find ?? [])])], o.via);
  const made = await post(me, { text, relays: o.relays, refs });
  return { id: made.id, text };
}

/** Each act held first, then referred to with its signer; an act not found refuses the card (F272). */
async function cardRefs(ids: string[], relays: string[], via: Via): Promise<Reference[]> {
  const out: Reference[] = [];
  for (const id of [...new Set(ids)]) {
    try {
      out.push((await referTo(id, relays, via)).ref);
    } catch {
      throw new Error(`The act ${actForm(id)} was not found on your relays: a card names only acts held, with their signers. Nothing was signed.`);
    }
  }
  return out;
}

/** A discussion thread naming the specification (4.2): a public post whose reference is the specification's publication. */
export async function publishDiscussion(me: TestIdentity, a: { title: string; spec: string; publication: string | null; relays: string[]; find?: string[]; via: Via }): Promise<{ id: string }> {
  const refs = a.publication ? await cardRefs([a.publication], [...new Set([...a.relays, ...(a.find ?? [])])], a.via) : [];
  const made = await post(me, { text: discussionText(a.title, a.spec), relays: a.relays, refs });
  return { id: made.id };
}

/** A card as found and shown. */
export interface FoundCard {
  id: string;
  signer: string;
  fields: CardFields;
  /** Signed by the specification's creator: the specification's own card (2.1). */
  creators: boolean;
  /** Superseded by a later card of the same signer, in its own sequence (2.1). */
  superseded: boolean;
  standing: string;
  hint: string | null;
}

export interface Described {
  id: string;
  signer?: string;
  public: boolean;
  spec?: string;
  type?: number;
  prev?: string;
  payload?: Uint8Array;
  hint?: string;
}

/** The text acts at the relays named (of one signer, where given), up to `CARDS_READ` a relay: each a card, or not. */
export type CardRead = { act: Uint8Array; d: Described; card: CardFields };

export async function readCards(relays: string[], via: Via, signer?: string): Promise<CardRead[]> {
  const out = new Map<string, { act: Uint8Array; d: Described; card: CardFields }>();
  for (const r of relays) {
    let after: number | undefined;
    let read = 0;
    try {
      for (;;) {
        const page = await relayAt(r, via).feed({ spec: POST_SPECS.text, type: TEXT_ACT, signer, after });
        for (const it of page.items) {
          if (it.kind !== 'act' || read >= CARDS_READ) continue;
          read++;
          let d: Described;
          try {
            d = describeAct(it.item) as Described;
          } catch {
            continue;
          }
          if (!d.public || !d.signer || !d.payload || out.has(d.id)) continue;
          const t = (cborDecode(d.payload) as Map<number, unknown>).get(0);
          const card = typeof t === 'string' ? readCardText(t) : null;
          if (card) out.set(d.id, { act: it.item, d, card });
        }
        if (!page.items.length || page.next === after || read >= CARDS_READ) break;
        after = page.next;
      }
    } catch {
      // that relay is away: the others answer
    }
  }
  return [...out.values()];
}

/** The public acts of one signer, as `prev` links: to tell which of two acts of one line is later (2.1). */
async function prevLinks(signer: string, relays: string[], via: Via): Promise<Map<string, string | null>> {
  const links = new Map<string, string | null>();
  for (const r of relays) {
    let after: number | undefined;
    try {
      for (;;) {
        const page = await relayAt(r, via).feed({ signer, after });
        for (const it of page.items) {
          if (it.kind !== 'act') continue;
          try {
            const d = describeAct(it.item) as Described;
            if (d.signer === signer && !links.has(d.id)) links.set(d.id, d.prev ?? null);
          } catch {
            // not an act this client reads
          }
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch {
      // that relay is away
    }
  }
  return links;
}

/** Whether `later` follows `earlier` in one line: its chain of previous acts reaches it. */
function follows(links: Map<string, string | null>, later: string, earlier: string): boolean {
  let at: string | null | undefined = links.get(later);
  for (let i = 0; at && i < 100_000; i++) {
    if (at === earlier) return true;
    at = links.get(at);
  }
  return false;
}

/**
 * Every card found for one specification at the relays named: its
 * creator's (by the signer filter) and anyone's (among the text acts the
 * relays hold), each judged through its signer's chain; of each signer's
 * cards, the latest in its own sequence marked, the others superseded
 * (2.1); where a signer's latest cards sit on two lines, both shown, the
 * one the clock stamped later first where `times` holds both (2.1a).
 */
export async function cardsFor(spec: string, creator: string | null, relays: string[], via: Via, times: Map<string, number> = new Map(), o: { pre?: CardRead[]; onlyCreator?: boolean } = {}): Promise<{ cards: FoundCard[]; lines: Line[] }> {
  const all = new Map<string, CardRead>();
  const read = o.pre ?? [...(creator ? await readCards(relays, via, creator) : []), ...(o.onlyCreator ? [] : await readCards(relays, via))];
  for (const x of read) if (x.card.spec === spec && (!o.onlyCreator || x.d.signer === creator)) all.set(x.d.id, x);
  const judge = new Judge(relays, via);
  const lines: Line[] = [];
  const found: FoundCard[] = [];
  for (const { act, d, card } of all.values()) {
    let standing = 'unknown';
    try {
      standing = await judge.standing(act, d.id, d.signer!);
    } catch (e) {
      standing = `not checked: ${e instanceof Error ? e.message : String(e)}`;
    }
    if (standing !== 'valid') {
      lines.push({ text: `A card by ${d.signer!.slice(0, 8)}… is ${standing}, not valid for its signer’s chain: not shown.`, tone: 'warn' });
      continue;
    }
    found.push({ id: d.id, signer: d.signer!, fields: card, creators: creator !== null && d.signer === creator, superseded: false, standing, hint: d.hint ?? null });
  }
  // The latest of each signer's cards, in its own sequence (2.1, 2.1a).
  const bySigner = new Map<string, FoundCard[]>();
  for (const c of found) bySigner.set(c.signer, [...(bySigner.get(c.signer) ?? []), c]);
  for (const [signer, cs] of bySigner) {
    if (cs.length < 2) continue;
    const links = await prevLinks(signer, relays, via);
    for (const c of cs) if (cs.some((o) => o !== c && follows(links, o.id, c.id))) c.superseded = true;
    const tops = cs.filter((c) => !c.superseded);
    if (tops.length > 1) {
      const stamped = tops.filter((c) => times.has(c.id));
      if (stamped.length === tops.length) {
        const last = stamped.reduce((a, b) => (times.get(b.id)! > times.get(a.id)! ? b : a));
        for (const c of tops) if (c !== last) c.superseded = true;
      } else lines.push({ text: `${signer.slice(0, 8)}… signed cards for it on ${tops.length} lines, and no clock stamped them all: each line’s latest is shown, and which is newer cannot be told.`, tone: 'warn' });
    }
  }
  found.sort((a, b) => Number(b.creators) - Number(a.creators) || Number(a.superseded) - Number(b.superseded) || (times.get(b.id) ?? 0) - (times.get(a.id) ?? 0) || (a.id < b.id ? -1 : 1));
  return { cards: found, lines };
}

/** The latest card of the creator, among those found: the specification's own (2.1). */
export const ownCard = (cards: FoundCard[]): FoundCard | null => cards.find((c) => c.creators && !c.superseded) ?? null;

/** The core's eight texts (3.2): their test hashes until the freeze, their own first heading as title, a line of Ummia's own words. */
export interface BuiltIn {
  hash: string;
  title: string;
  summary: string;
  kind: string;
}

/**
 * The MICS document's and the freeze test suite's spec hashes: the core
 * names no test value for them, so these are the hashes Development rule 26
 * computes from the current drafts' text (MICS v30, the freeze test suite
 * v30); `test/cards.test.ts` computes them again from the files.
 */
export const MICS_HASH = '647c5fcef155bde9878c5378dc57733006e2938d3b42b2cef2c9356eb9634439';
export const SUITE_HASH = 'e0599d7d3588998ac4dcac0b159f7165ad101eeb81d605236db448a81fdc014b';

export const BUILT_IN: BuiltIn[] = [
  { hash: MIRS.identity, title: 'MIR: Identity', kind: 'MIR', summary: 'Who signs: identities, their keys, homes, rotations, receipts and succession.' },
  { hash: MIRS.text, title: 'MIR: Text', kind: 'MIR', summary: 'What a text act is, and canonical text: the words every act is written in.' },
  { hash: MIRS.envelopes, title: 'MIR: Envelopes', kind: 'MIR', summary: 'The shape of every act: public and private acts, sequences, references, media, relays.' },
  { hash: MIRS.money, title: 'MIR: Money', kind: 'MIR', summary: 'Payments, claims and receipts, rails and units: how a payment is proven.' },
  { hash: MIRS.agreements, title: 'MIR: Agreements', kind: 'MIR', summary: 'Agreements, collectives, vows and offers, splits, keepers and judgments.' },
  { hash: MIRS.development, title: 'MIR: Development', kind: 'MIR', summary: 'cMIPs and Modules: named by hash, frozen at publication, adopted by choice.' },
  { hash: MICS_HASH, title: 'The MICS: MOR Inscribed Core Spec', kind: 'MICS document', summary: 'The core in one document: what MOR is, its layers and the six MIRs it names.' },
  { hash: SUITE_HASH, title: 'MOR Freeze Test Suite', kind: 'test suite', summary: 'What must be tested before the freeze: every step, and what it shows.' },
];

/** Said of a built-in card (3.1, 3.2). */
export const BUILT_IN_SAY = 'One of the core’s texts: it names no creator, so no card speaks for it. Its title is its own first heading; these words are Ummia’s. The front door to the frozen texts is dubsar.org’s.';

export const builtIn = (hash: string): BuiltIn | null => BUILT_IN.find((b) => b.hash === hash) ?? null;

export { readActId };
