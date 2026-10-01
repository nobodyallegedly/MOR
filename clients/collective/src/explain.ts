// Plain words for what is about to be signed (Law rule 4a, Text rule 5a:
// what you sign is what you saw). Every reading is made from the exact bytes
// that will be signed, as the core library decodes them (`readTerms`), never
// from what someone typed into a form; so what the page shows and what the
// key signs cannot drift apart.
//
// The reading of an agreement is the first piece of the deal-assessment
// tool (roadmap step 14): who is bound, what each rule does, what changes.

import { SPECS, readTerms } from '../../genesis/src/core.ts';
import { REPO_SPECS } from '../../repo/src/specs.ts';
import type { Manifest } from '../../repo/src/release.ts';

/** One statement. `tone` marks what deserves attention before signing. */
export interface Line {
  text: string;
  tone?: 'warn' | 'bad' | 'ok';
}

export interface Section {
  heading: string;
  lines: Line[];
}

/** A text to be shown as plain text, character for character, invisible controls as escapes. */
export interface Plain {
  heading: string;
  text: string;
}

/** Everything the page shows about one thing before it is signed. */
export interface Reading {
  title: string;
  /** A few sentences: what happens if you sign. */
  summary: string[];
  sections: Section[];
  plain: Plain[];
  /** Reasons it must not be signed. While any remains, nothing is signed. */
  blocking: string[];
}

/** How an identity is named on screen: its name here, if any, and its fingerprint. */
export type Names = (id: string) => string;

export const short = (id: string): string => `${id.slice(0, 8)}…${id.slice(-4)}`;

/** "1 file", "2 files". */
export const count = (n: number, one: string, many = `${one}s`): string => `${n} ${n === 1 ? one : many}`;

// ---------------------------------------------------------------- terms, as the core reads them

type RuleOut = { form: 'all' | 'threshold' | 'named'; threshold?: number | null; named?: string[] | null };
type HoldingOut = {
  form: 'one' | 'shares' | 'custodian';
  holder?: string | null;
  threshold?: number | null;
  members?: string[] | null;
  custodian?: string | null;
  grant?: string | null;
};

/** Terms (Law type 0) as the core library decodes them (`readTerms`). A field absent from the terms is null or undefined. */
export interface TermsRead {
  parties: string[];
  text: string;
  cmips: [number, string][];
  keepers: [string[], RuleOut] | null;
  signing: RuleOut;
  clone: RuleOut;
  time: string | null;
  abandonment: {
    authority: 'named' | 'others';
    identity?: string | null;
    threshold?: number | null;
    outcomes: number[];
    period?: number | null;
  } | null;
  parent: string | null;
  grammar: {
    signing: HoldingOut;
    safety: HoldingOut;
    listed: { spec: string; type: number; rule: RuleOut }[] | null;
    recovery: { form: 'custodian' | 'escrow'; custodian?: string | null; grant?: string | null; authority?: string | null } | null;
  } | null;
  arbitrators: string[] | null;
  splitGrant: string | null;
  extensions: string[] | null;
  succession: { party: string; stakes: [string, number][] | null; seats: [string, number][] | null; entry: number | null }[] | null;
  /** Why the terms fail Law's own checks, if they do. */
  problem?: string | null;
}

/** Read terms from their exact bytes. Throws if they are not terms, or use a field whose format is still open. */
export function termsOf(payload: Uint8Array): TermsRead {
  return readTerms(payload) as TermsRead;
}

/** The specs and cMIPs this client implements, by name. Anything else is unknown here. */
const KNOWN: Record<string, string> = {
  [SPECS.identity]: 'the Identity MIP',
  [SPECS.envelope]: 'the Envelope MIP',
  [SPECS.text]: 'the Text MIP',
  [REPO_SPECS.law]: 'the Law MIP',
  [REPO_SPECS.manifest]: 'the release manifest cMIP (draft 1)',
};

/** Extensions this client implements: it can sign agreements that name them (Law rule 2). */
const EXTENSIONS = new Set([REPO_SPECS.manifest]);

const specName = (h: string) => KNOWN[h] ?? `an unknown specification (${short(h)})`;

function list(xs: string[]): string {
  if (xs.length <= 1) return xs.join('');
  return `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`;
}

/** Who a rule needs, in words. */
export function ruleWords(r: RuleOut, parties: string[], names: Names): string {
  switch (r.form) {
    case 'all':
      return parties.length === 1 ? 'the one party' : `all ${parties.length} parties`;
    case 'threshold':
      return `any ${r.threshold} of the ${parties.length} parties`;
    case 'named':
      return list((r.named ?? []).map(names));
  }
}

const OUTCOMES = [
  'their voice is removed from the clone rule (they no longer count among those who must sign a change)',
  'their stake is shared among the remaining holders',
  'their stake is transferred to parties named or defined by role',
  'their obligations are redirected or held',
  'the agreement is closed',
];

const TYPE_NAMES: Record<string, Record<number, string>> = {
  [SPECS.envelope]: { 0: 'publication of the collective (a release is one)', 1: 'key delivery of the collective', 4: 'encryption key of the collective' },
  [REPO_SPECS.law]: { 0: 'terms act of the collective', 1: 'signature of the collective' },
  [SPECS.text]: { 0: 'text of the collective' },
};

function actTypeWords(spec: string, type: number): string {
  const t = TYPE_NAMES[spec]?.[type];
  return t ? `Every ${t}` : `Every act of type ${type} of ${specName(spec)} made by the collective`;
}

const WORDS = {
  f96: (n: number) =>
    `With ${n} members, a safety key that needs all ${n} of them would be lost with any one of them (F96). Lower the number of members needed to rebuild it.`,
  absence: (n: number) => `Absence is judged by some of the other members: between 1 and ${Math.max(n - 1, 0)} of them.`,
  rule: (n: number) => `A number of signatures asked for is not between 1 and the ${n} members.`,
  shares: (n: number) => `The number of members needed to rebuild the safety key is not between 1 and the ${n} members.`,
  release: (n: number) => `The number of members who must sign a release is not between 1 and the ${n} members.`,
};

/**
 * What is wrong with a collective's numbers for `n` members, all at once,
 * in plain words. Law judges the terms themselves (`problemWords`) and
 * stops at its first objection; this lists every one, so the numbers can
 * be fixed together.
 */
export function rulesHints(r: { safety: number; release: number; clone: number; others: number }, n: number): string[] {
  const out: string[] = [];
  if (r.safety < 1 || r.safety > n) out.push(WORDS.shares(n));
  else if (r.safety === n) out.push(WORDS.f96(n));
  if (r.release < 1 || r.release > n) out.push(WORDS.release(n));
  if (r.clone < 1 || r.clone > n) out.push(WORDS.rule(n));
  if (r.others < 1 || r.others >= n) out.push(WORDS.absence(n));
  return out;
}

/** Law's own reasons, in plain words where this client knows them; the core's words follow. */
export function problemWords(problem: string, t: Pick<TermsRead, 'parties'>): string {
  const n = t.parties.length;
  const known: [RegExp, string][] = [
    [/needs every member to rotate and names no recovery path/, WORDS.f96(n)],
    [/abandonment authority's threshold does not fit/, WORDS.absence(n)],
    [/a rule names a threshold or party that does not fit the parties/, WORDS.rule(n)],
    [/a holding's members or threshold do not fit the parties/, WORDS.shares(n)],
    [/a member-signature rule does not fit the parties/, WORDS.release(n)],
    [/a party is listed twice/, 'Someone is listed twice among the members.'],
  ];
  const hit = known.find(([re]) => re.test(problem));
  return hit ? `${hit[1]} (Law: “${problem}”)` : `Law refuses these terms: ${problem}.`;
}

/** Blocking reasons: the hints, with Law's own objection folded into the hint that says the same, or added. */
export function withLaw(hints: string[], law: string[]): string[] {
  const out = [...hints];
  for (const l of law) {
    const i = out.findIndex((h) => l.startsWith(`${h} (Law:`));
    if (i >= 0) out[i] = l;
    else out.push(l);
  }
  return out;
}

/** Invisible characters that can make text display differently from its bytes (Text rule 5). */
const INVISIBLE = /[؜​‎‏‪-‮⁦-⁩]/g;

/**
 * An agreement, founding or clone, in plain words: who is bound, what each
 * rule does. From the core's own reading of the exact payload.
 */
export function readAgreement(t: TermsRead, names: Names, parent?: TermsRead | null): { sections: Section[]; blocking: string[] } {
  const blocking: string[] = [];
  const who = t.parties.map(names);
  const sections: Section[] = [];

  sections.push({
    heading: 'Who is bound',
    lines: [
      { text: `${t.parties.length} parties: ${list(who)}.` },
      { text: 'Each is bound only by their own signature act. Until someone signs, nothing in it binds them (Law rule 1).' },
      t.parent
        ? {
            text: `It is a clone of agreement ${short(t.parent)}: it replaces it, and that one closes, once ${
              parent ? `${ruleWords(parent.clone, parent.parties, names)} of that agreement` : 'the parties that agreement’s clone rule asks for'
            } have signed it (Law rule 45).`,
          }
        : { text: `It comes into force once ${ruleWords(t.signing, t.parties, names)} have signed it.` },
    ],
  });

  const g = t.grammar;
  if (g) {
    const lines: Line[] = [{ text: 'It founds a collective: an identity of its own, whose keys its members hold as follows (Law rule 36).' }];
    const s = g.signing;
    if (s.form === 'one') {
      lines.push({
        text: `${names(s.holder!)} holds the collective's everyday key, and signs the collective's acts with it. Acts the list below does not name need nobody else's signature.`,
      });
    } else if (s.form === 'shares') {
      lines.push({ text: `The everyday key is held jointly: any ${s.threshold} of ${list((s.members ?? []).map(names))} sign together.` });
    } else {
      lines.push({ text: `${names(s.custodian!)} holds the everyday key as custodian, under grant ${short(s.grant!)}.` });
    }
    const k = g.safety;
    if (k.form === 'shares') {
      const m = k.members ?? [];
      lines.push({
        text: `The safety key, the one that rotates the collective (new keys, new members, new homes), is cut into ${m.length} shares, one each for ${list(m.map(names))}. Any ${k.threshold} of them together rebuild it.`,
      });
      if (k.threshold === 1) {
        lines.push({ text: 'Any one member alone can rebuild the safety key and rotate the collective, without the others.', tone: 'warn' });
      } else if (k.threshold! < m.length) {
        lines.push({ text: `If one member is lost, the other ${m.length - 1} can still rotate the collective (F96).`, tone: 'ok' });
      }
    } else if (k.form === 'one') {
      lines.push({ text: `${names(k.holder!)} alone holds the safety key.`, tone: 'warn' });
    } else {
      lines.push({ text: `${names(k.custodian!)} holds the safety key as custodian, under grant ${short(k.grant!)}.`, tone: 'warn' });
    }
    if (g.recovery) {
      const r = g.recovery;
      lines.push({
        text:
          r.form === 'escrow'
            ? `A further share is held in escrow, released by ${names(r.authority!)}, the authority on absence.`
            : `A further share is held by ${names(r.custodian!)}, as custodian under grant ${short(r.grant!)}.`,
      });
    }
    for (const l of g.listed ?? []) {
      lines.push({
        text: `${actTypeWords(l.spec, l.type)} counts only once ${ruleWords(l.rule, t.parties, names)} have signed it, each with a visible act of their own, under the agreement in force when the collective signed it (F100).`,
      });
    }
    if (!g.listed?.length) lines.push({ text: "No act of the collective needs members' own signatures: its everyday key alone speaks for it.", tone: 'warn' });
    sections.push({ heading: "The collective's keys", lines });
  }

  sections.push({
    heading: 'Changing it',
    lines: [
      {
        text: `It is never edited. It changes only by a clone, a new version naming this one, complete once ${ruleWords(t.clone, t.parties, names)} sign the clone. A member who joins is bound once they sign it too (Law rules 45, 1).`,
      },
      ...(g ? [{ text: 'For a collective, a change of members also rotates the collective to new keys; whatever its old key signs after that is void (Law rule 37, F100).' }] : []),
    ],
  });

  const a = t.abandonment;
  const absence: Line[] = [];
  if (a) {
    const by = a.authority === 'named' ? names(a.identity!) : `any ${a.threshold} of the other parties together`;
    absence.push({
      text: `If a party stops acting on the agreement, ${by} may declare them absent. What may then follow: ${list(a.outcomes.map((o) => OUTCOMES[o] ?? `outcome ${o}`))}.`,
      tone: 'warn',
    });
    absence.push({ text: 'Signing agrees to this in advance (Law rule 13). It is a protected clause: a later clone you do not sign cannot change it for you (Law rule 46a).' });
    if (a.period != null) absence.push({ text: `Absence means no act for ${a.period}, measured on the agreement's time reference.` });
    else absence.push({ text: 'No period is set and no time reference is named, so a missed deadline can never be proven; whoever judges absence judges it (Law rule 33).' });
  } else {
    absence.push({ text: 'No abandonment clause: nobody can declare a party absent.' });
  }
  sections.push({ heading: 'If someone disappears', lines: absence });

  const more: Line[] = [];
  if (!t.cmips.length) more.push({ text: 'It uses no task cMIP.' });
  for (const [task, h] of t.cmips) {
    const known = KNOWN[h];
    more.push({ text: `For task ${task}: ${specName(h)}.`, tone: known ? undefined : 'bad' });
    if (!known) blocking.push(`It names a cMIP this client does not implement (${short(h)}, task ${task}); a client that does not implement it cannot sign it (Law rule 2).`);
  }
  for (const h of t.extensions ?? []) {
    if (EXTENSIONS.has(h)) more.push({ text: `It adds the rules of ${specName(h)}.` });
    else {
      more.push({ text: `It adds the rules of ${specName(h)}.`, tone: 'bad' });
      blocking.push(`It names an extension this client does not implement (${short(h)}); a client that does not implement all of them cannot sign it (Law rule 2).`);
    }
  }
  if (t.keepers) {
    more.push({ text: `Keepers record the deal as it happens: ${list(t.keepers[0].map(names))}; ${ruleWords(t.keepers[1], t.keepers[0], names)} count as recorded. A protected clause (Law rule 46a).` });
  }
  if (t.time) {
    more.push({ text: `Time reference: ${specName(t.time)}. This client does not read time references.`, tone: 'bad' });
    blocking.push('It names a time reference, which this client does not read: it cannot show what its deadlines mean.');
  }
  if (t.arbitrators) more.push({ text: `Arbitrators or verifiers, who receive keys to judge content: ${list(t.arbitrators.map(names))}.` });
  if (t.splitGrant) {
    more.push({ text: `Incoming payments go to a split service, under grant ${short(t.splitGrant)}.`, tone: 'bad' });
    blocking.push('It names a split service, which this client does not implement yet (roadmap step 13).');
  }
  for (const p of t.succession ?? []) {
    const parts: string[] = [];
    if (p.stakes) parts.push(`stakes to ${list(p.stakes.map(([h, n]) => `${names(h)} (${n / 10_000}%)`))}`);
    if (p.seats) parts.push(`the seat to ${list(p.seats.map(([h, w]) => `${names(h)} (weight ${w})`))}${p.entry === 1 ? ', with the members’ approval' : ''}`);
    more.push({ text: `If ${names(p.party)} leaves or is declared absent: ${parts.join('; ') || 'nothing named'}. A protected clause.` });
  }
  if (more.length) sections.push({ heading: 'Also', lines: more });

  if (t.problem) blocking.push(problemWords(t.problem, t));
  const controls = t.text.match(INVISIBLE)?.length ?? 0;
  if (controls) {
    sections.push({
      heading: 'Hidden characters',
      lines: [
        {
          text: `The words contain ${controls} invisible character${controls > 1 ? 's' : ''} that can make text display in another order than it is written. ${controls > 1 ? 'They are' : 'It is'} shown below as U+… codes (Text rule 5a). Read the words as shown before signing.`,
          tone: 'warn',
        },
      ],
    });
  }
  return { sections, blocking };
}

/**
 * What a clone changes, compared with the agreement in force: who joins and
 * leaves, and every rule that differs. Protected clauses are named as such.
 */
export function readChanges(before: TermsRead, after: TermsRead, names: Names): Line[] {
  const out: Line[] = [];
  const joined = after.parties.filter((p) => !before.parties.includes(p));
  const left = before.parties.filter((p) => !after.parties.includes(p));
  for (const p of joined) out.push({ text: `${names(p)} joins, bound once they sign the clone.` });
  for (const p of left)
    out.push({
      text: `${names(p)} leaves. They hand over nothing: the collective rotates to keys they never held, and from then on they can no longer help make a release (Law rule 37, F100).`,
    });
  const holder = (t: TermsRead) => (t.grammar?.signing.form === 'one' ? t.grammar.signing.holder! : null);
  if (holder(before) !== holder(after) && holder(after)) {
    out.push({ text: `The everyday key passes to ${names(holder(after)!)}${holder(before) ? ` (was ${names(holder(before)!)})` : ''}.` });
  }
  const safety = (t: TermsRead) => t.grammar?.safety;
  const sb = safety(before);
  const sa = safety(after);
  if (sa?.form === 'shares' && sb?.form === 'shares') {
    out.push({
      text: `The safety key is dealt afresh: ${sa.members!.length} shares, any ${sa.threshold} rebuild it (was ${sb.members!.length} shares, any ${sb.threshold}). Nobody leaving ever holds a share of the new key.`,
      tone: sa.threshold === 1 && sb.threshold !== 1 ? 'warn' : undefined,
    });
  }
  const rule = (r: RuleOut | undefined, parties: string[]) => (r ? ruleWords(r, parties, names) : 'nobody');
  const release = (t: TermsRead) => t.grammar?.listed?.find((l) => l.spec === SPECS.envelope && l.type === 0)?.rule;
  const rb = rule(release(before), before.parties);
  const ra = rule(release(after), after.parties);
  if (rb !== ra || JSON.stringify(release(before)) !== JSON.stringify(release(after))) {
    out.push({ text: `A release now needs ${ra} to sign it (was ${rb}).` });
  }
  if (JSON.stringify(before.clone) !== JSON.stringify(after.clone)) {
    out.push({ text: `A later change needs ${rule(after.clone, after.parties)} (was ${rule(before.clone, before.parties)}).` });
  }
  if (JSON.stringify(before.signing) !== JSON.stringify(after.signing)) {
    out.push({ text: `It comes into force with ${rule(after.signing, after.parties)} (was ${rule(before.signing, before.parties)}).` });
  }
  if (JSON.stringify(before.abandonment) !== JSON.stringify(after.abandonment)) {
    const words = (a: TermsRead['abandonment']) =>
      !a ? 'no one' : a.authority === 'named' ? names(a.identity!) : `any ${a.threshold} of the other parties`;
    out.push({
      text: `Absence is now judged by ${words(after.abandonment)} (was ${words(before.abandonment)}). A protected clause: for a party who does not sign this clone, the version they signed still applies (Law rule 46a).`,
      tone: 'warn',
    });
  }
  for (const [k, what] of [
    ['keepers', 'The keepers change. A protected clause (Law rule 46a).'],
    ['time', 'The time reference changes. A protected clause (Law rule 46a).'],
    ['succession', 'The succession plans change. A protected clause (Law rule 46a).'],
    ['extensions', 'The extensions it names change.'],
    ['cmips', 'The cMIPs it names change.'],
  ] as const) {
    if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) out.push({ text: what, tone: 'warn' });
  }
  if (before.text !== after.text) out.push({ text: 'The words change: read the new words below, in full.', tone: 'warn' });
  else out.push({ text: 'The words stay the same.' });
  if (!out.length) out.push({ text: 'Nothing changes.' });
  return out;
}

// ---------------------------------------------------------------- releases

/** What a release changes, file by file, compared with the one before. */
export function readRelease(m: Manifest, before: Manifest | null): Section[] {
  const files: Line[] = [
    { text: `${m.name} ${m.version}: ${count(m.files.length, 'file')}, ${count(m.dependencies.length, 'library', 'libraries')} it depends on.` },
    { text: m.source ? `Made from ${m.source}.` : 'It names no source.' },
  ];
  if (!m.previous) files.push({ text: 'It is the first release: it names no release before it.' });
  if (before) {
    const old = new Map(before.files.map((f) => [f.path, f.work]));
    const now = new Map(m.files.map((f) => [f.path, f.work]));
    const added = m.files.filter((f) => !old.has(f.path)).map((f) => f.path);
    const changed = m.files.filter((f) => old.has(f.path) && old.get(f.path) !== f.work).map((f) => f.path);
    const removed = before.files.filter((f) => !now.has(f.path)).map((f) => f.path);
    files.push({
      text: `Since ${before.name} ${before.version}: ${count(added.length, 'file')} added, ${changed.length} changed, ${removed.length} removed; ${count(m.files.length - added.length - changed.length, 'file')} the same.`,
    });
    const some = (xs: string[], what: string) => {
      if (!xs.length) return;
      const shown = xs.slice(0, 30);
      files.push({ text: `${what}: ${shown.join(', ')}${xs.length > shown.length ? `, and ${xs.length - shown.length} more` : ''}.` });
    };
    some(added, 'Added');
    some(changed, 'Changed');
    some(removed, 'Removed');
    const key = (d: Manifest['dependencies'][number]) => `${d.registry} ${d.name}`;
    const oldDeps = new Map(before.dependencies.map((d) => [key(d), d.version]));
    const newDeps = new Map(m.dependencies.map((d) => [key(d), d.version]));
    const depsAdded = [...newDeps.keys()].filter((k) => !oldDeps.has(k));
    const depsRemoved = [...oldDeps.keys()].filter((k) => !newDeps.has(k));
    const depsChanged = [...newDeps.keys()].filter((k) => oldDeps.has(k) && oldDeps.get(k) !== newDeps.get(k));
    if (depsAdded.length + depsRemoved.length + depsChanged.length) {
      files.push({ text: `Libraries: ${depsAdded.length} added, ${depsChanged.length} at another version, ${depsRemoved.length} removed.` });
    } else files.push({ text: 'The libraries are the same.' });
  } else if (m.previous) {
    files.push({ text: `It follows release ${short(m.previous)}, which this client does not hold, so what changed is not shown.` });
  }
  return [{ heading: 'What is released', lines: files }];
}
