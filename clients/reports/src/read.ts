// What the reporting identity holds on MOR (F287): the public reports left in
// its inbox, and its own public acts. A report is a public text act addressed
// to it (`to`), left unsealed in its inbox, signed by its reporter's own
// identity ("Bug reports come from people truly on MOR, their own ID",
// Nobody, allegedly): sent from Dub (its "To an identity") or any client.
// A sealed message is private: this tool holds no key, so it can neither
// open one nor tell what it says, and never mirrors it. The reporting
// identity's own public text acts are its answers (one naming a report in
// `refs` answers that report; one whose words carry a GitHub issue's address
// answers that issue) and its re-publications of GitHub issues (`mirror.ts`,
// `republishes`). Every act is checked through its signer's identity chain
// by the core library; anything not valid is said, never mirrored.

import { MIRS, SPECS, Verifier, describeAct } from '../../genesis/src/core.ts';
import { lookUp, type Lookup } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { readPost, type Judging } from '../../barebone/src/post.ts';
import { POST_SPECS, TEXT_ACT } from '../../barebone/src/specs.ts';

/** A report or an answer, read and checked. */
export interface Signed {
  id: string;
  signer: string;
  /** The words, exactly as signed. */
  text: string;
  /** The acts it names in `refs`. */
  refs: string[];
}

export interface Held {
  /** Public reports, valid for their signers' chains, in the order the inbox holds them. */
  reports: Signed[];
  /** The reporting identity's public text acts, valid for its chain. */
  answers: Signed[];
  /** What was found and not taken, or could not be asked, in plain words. */
  problems: string[];
  /** Sealed items in the inbox: private reports (or anything else private), never opened here. */
  sealed: number;
  /** Where the reporting identity's public acts go (its route for text, else for everything, else the places given): where a re-publication of a GitHub issue is sent once signed. */
  publishAt: string[];
}

interface Described {
  id: string;
  signer?: string;
  public: boolean;
  to?: string[];
  spec?: string;
  type?: number;
  position?: number;
}

/** One verifier for the whole run, each signer looked up once. */
class Judge implements Judging {
  readonly v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements);
  private looked = new Map<string, Promise<Lookup>>();
  constructor(
    private places: string[],
    private via: Via,
  ) {}
  lookUp(identity: string): Promise<Lookup> {
    let l = this.looked.get(identity);
    if (!l) {
      l = lookUp(identity, this.places, this.via, this.v);
      this.looked.set(identity, l);
    }
    return l;
  }
  async standing(act: Uint8Array, id: string, signer: string): Promise<string> {
    await this.lookUp(signer);
    this.v.add(act);
    return this.v.status(id);
  }
}

const short = (id: string) => `${id.slice(0, 12)}…`;
const message = (e: unknown) => (e instanceof Error ? e.message : String(e));
const isText = (d: Described) => d.spec === POST_SPECS.text && d.type === TEXT_ACT;

/** Every item a relay's feed holds for the query, oldest first, page after page. */
async function feedAll(hint: string, q: { to?: string; signer?: string }, via: Via): Promise<{ kind: 'act' | 'sealed'; item: Uint8Array }[]> {
  const out: { kind: 'act' | 'sealed'; item: Uint8Array }[] = [];
  let after: number | undefined;
  for (;;) {
    const page = await relayAt(hint, via).feed({ ...q, after });
    out.push(...page.items);
    if (!page.items.length || page.next === after) break;
    after = page.next;
  }
  return out;
}

/** Read one text act by id and check it; null and a problem when it is not valid. */
async function readChecked(id: string, places: string[], via: Via, judge: Judge, problems: string[], what: string): Promise<Signed | null> {
  try {
    const p = await readPost(id, places, via, judge);
    if (p.standing !== 'valid') {
      problems.push(`${what} ${short(id)} is not mirrored: its standing is “${p.standing}”, not valid.`);
      return null;
    }
    return { id, signer: p.signer, text: p.text, refs: p.refs.flatMap((r) => (r.kind === 'act' ? [r.id] : [])) };
  } catch (e) {
    problems.push(`${what} ${short(id)} is not mirrored: ${message(e)}.`);
    return null;
  }
}

/**
 * The reporting identity's reports and answers, from the places given (its
 * homes and relays) and the routes it declares: its inbox for the reports,
 * its outbox (and the places) for its answers. Throws only when the
 * identity itself cannot be looked up.
 */
export async function readHeld(identity: string, places: string[], via: Via = {}): Promise<Held> {
  const judge = new Judge(places, via);
  const l = await judge.lookUp(identity);
  const problems: string[] = [];
  const inbox = l.inbox(SPECS.text) ?? [];
  if (!inbox.length) problems.push('The reporting identity declares no inbox: no report can reach it.');
  const outbox = l.routes.routes.filter((r) => (r.kind ?? 0) === 0);
  const route = outbox.find((r) => r.scope === POST_SPECS.text) ?? outbox.find((r) => r.scope === null);
  const answerPlaces = [...new Set([...(route?.hints ?? []), ...places])];
  const publishAt = route?.hints.length ? [...route.hints] : [...places];
  const readPlaces = [...new Set([...inbox, ...answerPlaces])];

  // The reports: unsealed public text acts addressed to it, in its inbox.
  const reportIds: string[] = [];
  const sealed = new Set<string>();
  for (const hint of inbox) {
    let items;
    try {
      items = await feedAll(hint, { to: identity }, via);
    } catch (e) {
      problems.push(`The inbox at ${hint} could not be read: ${message(e)}.`);
      continue;
    }
    for (const it of items) {
      if (it.kind === 'sealed') {
        sealed.add(Buffer.from(it.item).toString('base64'));
        continue;
      }
      let d: Described;
      try {
        d = describeAct(it.item) as Described;
      } catch {
        continue;
      }
      if (reportIds.includes(d.id) || d.signer === identity) continue;
      if (!d.public) continue; // private, never mirrored
      if (!isText(d) || !(d.to ?? []).includes(identity)) continue;
      reportIds.push(d.id);
    }
  }
  const reports: Signed[] = [];
  for (const id of reportIds) {
    const r = await readChecked(id, readPlaces, via, judge, problems, 'The report');
    if (r) reports.push(r);
  }

  // The answers: its own public text acts.
  const answerIds: string[] = [];
  const position = new Map<string, number>();
  for (const hint of answerPlaces) {
    let items;
    try {
      items = await feedAll(hint, { signer: identity }, via);
    } catch {
      continue; // that place is away: silence proves nothing
    }
    for (const it of items) {
      if (it.kind !== 'act') continue;
      let d: Described;
      try {
        d = describeAct(it.item) as Described;
      } catch {
        continue;
      }
      if (d.signer !== identity || !d.public || !isText(d) || answerIds.includes(d.id)) continue;
      answerIds.push(d.id);
      position.set(d.id, d.position ?? 0);
    }
  }
  // In its own signed order, so answers are appended as they were signed.
  answerIds.sort((a, b) => position.get(a)! - position.get(b)!);
  const answers: Signed[] = [];
  for (const id of answerIds) {
    const a = await readChecked(id, readPlaces, via, judge, problems, 'The answer');
    if (a) answers.push(a);
  }
  return { reports, answers, problems, sealed: sealed.size, publishAt };
}
