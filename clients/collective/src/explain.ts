// Plain words for what is about to be signed (Law rule 4a, Text rule 5a:
// what you sign is what you saw). Every reading is made from the exact bytes
// that will be signed, as the core library decodes them (`readTerms`,
// `lawClonePlan`), never from what someone typed into a form; so what the
// page shows and what the key signs cannot drift apart.
//
// The reading of an agreement is the first piece of the deal-assessment
// tool (roadmap step 14): who is bound, what each rule does, who decides
// what (Law draft 7: tiers and areas), what changes.

import { MIPS, SPECS, lawClonePlan, readTerms } from '../../genesis/src/core.ts';
import { LAW_SPECS } from '../../repo/src/law.ts';
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

/** A power a clone's mark claims, or a plan needs (Law rule 44c). */
export type PowerOut = { form: 'constitutional' | 'clone' | 'area' | 'plan' | 'judicial'; area?: number | null; party?: string | null };

/** An area (terms field 19): who holds it, how many decide, what it reaches (Law rule 36a). */
export interface AreaRead {
  id: number;
  name: string;
  holders: string[];
  threshold: number;
  kinds: { form: 'layer' | 'type'; layer?: number | null; spec?: string | null; type?: number | null }[];
  fields: { form: 'field' | 'task'; number: number }[];
}

/** Why Law refuses terms: its code, and its own words. */
export interface Problem {
  code: 'shape' | 'unsupported' | 'check' | 'missing' | 'unsettled' | string;
  text: string;
}

/** Terms (Law type 0) as the core library decodes them (`readTerms`). A field absent from the terms is null or undefined. */
export interface TermsRead {
  parties: string[];
  text: string;
  cmips: [number, string][];
  keepers: [string[], RuleOut] | null;
  /** Founding terms: which signatures make them exist (field 4). */
  signing: RuleOut | null;
  /** A clone: its mark (field 4), each power it claims and the parties whose signatures meet it (F104). */
  mark: { power: PowerOut; signers: string[] }[] | null;
  clone: RuleOut;
  /** The constitutional change rule (field 18); null: every party whose voice remains (F103). */
  constitutional: RuleOut | null;
  areas: AreaRead[];
  /** Each area's own words, by area id (field 20). */
  areaWords: [number, string][];
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
    recovery: { form: 'custodian' | 'escrow'; custodian?: string | null; grant?: string | null; authority?: string | null } | null;
  } | null;
  arbitrators: string[] | null;
  splitGrant: string | null;
  extensions: string[] | null;
  succession: { party: string; stakes: [string, number][] | null; seats: [string, number][] | null; entry: number | null }[] | null;
  /** Why the terms fail Law's own checks, if they do: Law's code and its own words. */
  problem?: Problem | null;
}

/** Read terms from their exact bytes. Throws if they are not terms, or use a field whose format is still open. */
export function termsOf(payload: Uint8Array): TermsRead {
  return readTerms(payload, LAW_SPECS) as TermsRead;
}

/** The specs and cMIPs this client implements, by name. Anything else is unknown here. */
const KNOWN: Record<string, string> = {
  [SPECS.identity]: 'the Identity MIP',
  [SPECS.envelope]: 'the Envelope MIP',
  [SPECS.text]: 'the Text MIP',
  [MIPS.finance]: 'the Finance MIP',
  [MIPS.production]: 'the Production MIP',
  [REPO_SPECS.law]: 'the Law MIP',
  [REPO_SPECS.manifest]: 'the release manifest cMIP (draft 1)',
};

/** Extensions this client implements: it can sign agreements that name them (Law rule 2). */
const EXTENSIONS = new Set([REPO_SPECS.manifest]);

const specName = (h: string) => KNOWN[h] ?? `an unknown specification (${short(h)})`;

export function list(xs: string[]): string {
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

/** The constitutional change rule, in words (Law rule 44d: counted among the voices that remain). */
export function constitutionWords(t: Pick<TermsRead, 'constitutional' | 'parties'>, names: Names): string {
  const r = t.constitutional;
  if (!r || r.form === 'all') return 'every member whose voice remains: nobody loses their say without signing (F103)';
  if (r.form === 'threshold') return `any ${r.threshold} of the ${t.parties.length} members (all of those whose voice remains, if fewer remain)`;
  return list((r.named ?? []).map(names));
}

/** A power, in words: a change rule of the parent, an area's power, a succession plan. */
export function powerWords(p: PowerOut, areas: AreaRead[], names: Names): string {
  switch (p.form) {
    case 'constitutional':
      return 'the constitutional change rule';
    case 'clone':
      return 'the clone rule';
    case 'area': {
      const a = areas.find((x) => x.id === p.area);
      return a ? `the power of the “${a.name}” area (area ${p.area})` : `the power of area ${p.area}`;
    }
    case 'plan':
      return `the succession plan of ${names(p.party ?? '')}`;
    case 'judicial':
      return "the judicial tier's rule, every member whose voice remains";
  }
}

/** The layers, as Law numbers them in an area's kinds ("Layer", F106). */
const LAYERS = ['Identity', 'Envelope and Text', 'Finance', 'Law', 'Production'];

const TYPE_NAMES: Record<string, Record<number, string>> = {
  [SPECS.envelope]: { 0: 'every publication of the collective (a release is one)', 1: 'every key delivery of the collective', 4: 'every encryption key of the collective' },
  [REPO_SPECS.law]: { 0: 'every terms act of the collective', 1: 'every signature of the collective' },
  [SPECS.text]: { 0: 'every text of the collective' },
};

/** What an area reaches, in words. */
export function kindWords(k: AreaRead['kinds'][number]): string {
  if (k.form === 'layer') {
    const layer = LAYERS[k.layer ?? -1] ?? `layer ${k.layer}`;
    return `every act of the ${layer} layer: its lane, which also adopts the cMIPs for that layer's tasks`;
  }
  return TYPE_NAMES[k.spec ?? '']?.[k.type ?? -1] ?? `every act of type ${k.type} of ${specName(k.spec ?? '')} made by the collective`;
}

const OPERATIONAL_FIELDS: Record<number, string> = { 7: 'the stakes', 8: 'the split plan', 17: 'the refund terms' };

function fieldRefWords(f: AreaRead['fields'][number]): string {
  return f.form === 'field' ? (OPERATIONAL_FIELDS[f.number] ?? `field ${f.number}`) : `the cMIP for task ${f.number}`;
}

const OUTCOMES = [
  'their voice is removed (they no longer count in any rule or area)',
  'their stake is shared among the remaining holders',
  'their stake is transferred to parties named or defined by role',
  'their obligations are redirected or held',
  'the agreement is closed',
];

const WORDS = {
  f96: (n: number) =>
    `With ${n} members, a safety key that needs all ${n} of them would be lost with any one of them (F96). Lower the number of members needed to rebuild it.`,
  absence: (n: number) => `Absence is judged by some of the other members: between 1 and ${Math.max(n - 1, 0)} of them.`,
  rule: (n: number) => `The number of members who must sign a change outside the constitution is not between 1 and the ${n} members.`,
  constitution: (n: number) => `The number of members who must sign a change of the constitution is not between 1 and the ${n} members.`,
  shares: (n: number) => `The number of members needed to rebuild the safety key is not between 1 and the ${n} members.`,
  release: (n: number) => `The number of members who must sign a release is not between 1 and the ${n} members.`,
};

/**
 * What is wrong with a collective's numbers for `n` members, all at once,
 * in plain words: this client's own reading of the numbers. Law judges the
 * terms themselves and stops at its first objection (`problemWords`); this
 * lists every one, so the numbers can be fixed together.
 */
export function rulesHints(r: { safety: number; release: number; clone: number; others: number; constitution?: number }, n: number): string[] {
  const out: string[] = [];
  if (r.safety < 1 || r.safety > n) out.push(WORDS.shares(n));
  else if (r.safety === n) out.push(WORDS.f96(n));
  if (r.release < 1 || r.release > n) out.push(WORDS.release(n));
  if (r.constitution !== undefined && (r.constitution < 1 || r.constitution > n)) out.push(WORDS.constitution(n));
  if (r.clone < 1 || r.clone > n) out.push(WORDS.rule(n));
  if (r.others < 1 || r.others >= n) out.push(WORDS.absence(n));
  return out;
}

const LAW_SAYS: Record<string, string> = {
  check: 'Law refuses these terms',
  shape: "These are not terms in Law's format",
  unsupported: 'Law does not support these terms yet',
  missing: 'Law lacks something it needs to judge these terms',
  unsettled: 'Law cannot settle these terms yet',
};

/**
 * Law's objection, by its code, with Law's own words quoted as they are.
 * The client never reads meaning into Law's wording: its own reading of
 * the numbers is `rulesHints`.
 */
export function problemWords(p: Problem): string {
  return `${LAW_SAYS[p.code] ?? `Law refuses these terms (${p.code})`}. Law's own words: “${p.text}”.`;
}

/** Law's objection from an error the core threw (`law/<code>: <why>`), or null if it is not one. */
export function lawThrown(e: unknown): Problem | null {
  const m = /^law\/([a-z]+): ([\s\S]*)$/.exec(e instanceof Error ? e.message : String(e));
  return m ? { code: m[1], text: m[2] } : null;
}

/**
 * Blocking reasons: this client's own hints first, then every other
 * reason, Law's objection among them once, in Law's own words. Nothing is
 * folded by comparing wordings: the core's words may change, its codes not.
 */
export function withLaw(hints: string[], others: string[]): string[] {
  const out = [...hints];
  for (const o of others) if (!out.includes(o)) out.push(o);
  return out;
}

/** Invisible characters that can make text display differently from its bytes (Text rule 5). */
const INVISIBLE = /[؜​‎‏‪-‮⁦-⁩]/g;

/**
 * The parties with a say in the constitution whom the abandonment clause
 * does not cover (Law rule 36b, F105): empty when every one can be
 * declared absent and lose their voice.
 */
export function uncovered(t: TermsRead): string[] {
  const voices = t.constitutional?.form === 'named' ? (t.constitutional.named ?? []) : t.parties;
  const a = t.abandonment;
  if (!a || !a.outcomes.includes(0)) return voices;
  if (a.authority === 'named') return voices.filter((v) => v === a.identity);
  return [];
}

/**
 * An agreement, founding or clone, in plain words: who is bound, how it
 * comes into force, who decides what. From the core's own reading of the
 * exact payload. `parent`: the agreement a clone replaces, if fetched.
 */
export function readAgreement(t: TermsRead, names: Names, parent?: TermsRead | null): { sections: Section[]; blocking: string[]; plain: Plain[] } {
  const blocking: string[] = [];
  const plain: Plain[] = [];
  const who = t.parties.map(names);
  const sections: Section[] = [];
  const g = t.grammar;

  const bound: Line[] = [
    { text: `${t.parties.length} parties: ${list(who)}.` },
    { text: 'Each is bound only by their own signature act. Until someone signs, nothing in it binds them (Law rule 1).' },
  ];
  if (!t.parent) {
    if (t.signing?.form === 'all') {
      bound.push({
        text: g
          ? 'It exists only once every one of them has signed it: nobody is founded into a collective without signing (Law, “Founding terms”, Q11).'
          : 'It exists only once every one of them has signed it (Law, “Founding terms”, F107).',
      });
    } else if (t.signing) {
      bound.push({ text: `It says it exists once ${ruleWords(t.signing, t.parties, names)} have signed it; Law asks for every party.`, tone: 'bad' });
    }
  } else {
    bound.push({ text: `It is a clone of agreement ${short(t.parent)}: once in force, it replaces it, and that one closes (Law rule 45).` });
  }
  sections.push({ heading: 'Who is bound', lines: bound });

  if (t.parent) {
    const areas = parent?.areas ?? t.areas;
    const lines: Line[] = [];
    if (!t.mark?.length) lines.push({ text: 'It carries no mark: it does not say by which power it comes in.', tone: 'bad' });
    // The mark lists signers by hash (Law draft 8, B8); read them in the
    // order the parties are listed, which means something to a reader.
    const order = (ids: string[]) => {
      const at = (x: string) => (t.parties.indexOf(x) + 1 || Infinity);
      return [...ids].sort((x, y) => at(x) - at(y));
    };
    for (const e of t.mark ?? []) {
      lines.push({ text: `It says it comes in by ${powerWords(e.power, areas, names)} of that agreement, signed by ${list(order(e.signers).map(names))}.` });
    }
    lines.push({
      text: 'Law checks that these are exactly the powers its changes need, and that those named meet them, counted among the voices that remain. A false mark sinks the clone, whatever signatures it gathers (F104).',
    });
    lines.push({ text: 'It is complete once everyone its mark names, and everyone it adds, has signed it (Law rule 45).' });
    if (g) {
      lines.push({
        text: "A change of the constitution is then put in force by a rotation of the collective; any other change by the collective's record, at once, with its everyday key (Law rules 37, 37c).",
      });
    }
    sections.push({ heading: 'How it comes into force: its mark', lines });
  }

  if (g) {
    const lines: Line[] = [{ text: 'It founds a collective: an identity of its own, whose keys its members hold as follows (Law rule 36).' }];
    const s = g.signing;
    if (s.form === 'one') {
      lines.push({
        text: `${names(s.holder!)} holds the collective's everyday key, and signs the collective's acts with it. An act no area reaches needs nobody else's signature.`,
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
    sections.push({ heading: "The collective's keys", lines });

    const words = new Map(t.areaWords);
    const al: Line[] = [];
    if (!t.areas.length) al.push({ text: "No area: no act of the collective needs members' own signatures; its everyday key alone speaks for it.", tone: 'warn' });
    for (const a of t.areas) {
      al.push(
        a.holders.length
          ? { text: `“${a.name}” (area ${a.id}): held by ${list(a.holders.map(names))}; any ${a.threshold} of them decide together.` }
          : { text: `“${a.name}” (area ${a.id}): held by nobody. It stands frozen until the members refit it (Law rule 37b).`, tone: 'warn' },
      );
      const reach = [...a.kinds.map(kindWords), ...a.fields.map(fieldRefWords)];
      al.push({ text: `It reaches ${list(reach) || 'nothing'}.` });
      const releases = a.kinds.some((k) => k.form === 'type' && k.spec === MIPS.envelope && k.type === 0);
      al.push({
        text: `${releases ? 'A release' : 'An act it reaches'} counts only once that many of its holders have signed it, each with a visible act of their own, under the agreement in force when the collective signed it (Law rule 36a, F100).`,
      });
      const own = words.get(a.id);
      if (own !== undefined) {
        al.push({ text: 'It has words of its own, shown below; its holders change them alone.' });
        plain.push({ heading: `The “${a.name}” area's own words`, text: own });
      }
    }
    if (t.areas.length) {
      al.push({ text: 'In an area, its holders alone decide, and may grant within it (Q5). Its holders, and how many of them decide, change only by the constitutional change rule.' });
      al.push({
        text: 'A holder may step down at once, alone. The other holders carry on: their number stands while enough of them remain, and all of them together meet it when fewer do (Law rule 44d). With no holder left, the area is frozen: its acts count for nothing until the members refit it (Law rule 37b).',
      });
      al.push({ text: "An act no area reaches counts on the collective's own signature; an act of a specification this agreement names nowhere counts for nothing (Q16)." });
    }
    sections.push({ heading: 'Areas: who decides which acts', lines: al });

    const clone = ruleWords(t.clone, t.parties, names);
    sections.push({
      heading: 'Who decides what',
      lines: [
        {
          text: `Constitutional: the members, the change rules, the key grammar, the areas and the constitution's words. They change only by the constitutional change rule: ${constitutionWords(t, names)}. Such a change is declared by a rotation of the collective to new keys; whatever its old key signs afterwards is void (Law rule 37, F100).`,
        },
        {
          text: `Judicial: the protected clauses (the abandonment clause, the keepers, the arbitrators, the time reference, the succession plans, the fork rule, and the condition, time reference and anchoring cMIPs). They change only with the signature of every member whose voice remains: one version for everyone (Law rule 46a, F121).`,
        },
        {
          text: `Operational: matters outside every area change by the clone rule, ${clone}, and are written on the collective's record at once (Law rule 37c); matters inside an area, by its holders.`,
        },
        { text: 'A change touching the constitution needs the constitutional change rule alone, which may change every tier; any other needs the power of each area and tier it touches, all at once (Law rule 44c, Q7).' },
      ],
    });
  }

  sections.push({
    heading: 'Changing it',
    lines: [
      {
        text: g
          ? 'It is never edited. It changes only by a clone, a new version naming this one, whose mark names the powers its changes need (Law rule 45). A member who joins is bound once they sign it too: nobody is added without signing (Law rule 1, Q11).'
          : 'It is never edited. It changes only by a clone, a new version naming this one, that every party signs (Law rule 45b, F107).',
      },
    ],
  });

  if (g) {
    sections.push({
      heading: 'Leaving',
      lines: [
        { text: 'Any member can leave alone, at any time, by a resignation no one else signs, keeping what they own and staying bound by what they signed (Law rule 37a).' },
        {
          text: "It takes effect for the collective at the collective's next record, its line, drawn with its everyday key. Until then their signature still counts (F109, a stated cost). The members who stay then rotate the collective to keys the one who left never held (Law rule 37).",
          tone: 'warn',
        },
      ],
    });
  }

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
  if (g) {
    const out = uncovered(t);
    if (!out.length) {
      absence.push({
        text: 'Every member with a say in the constitution is covered: if one disappears, their voice can be removed, so the constitution never freezes for want of them (F105).',
        tone: 'ok',
      });
    } else {
      absence.push({ text: `Not covered by the abandonment clause, though they have a say in the constitution: ${list(out.map(names))} (Law rule 36b, F105).`, tone: 'bad' });
    }
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

  if (t.problem) blocking.push(problemWords(t.problem));
  const controls = [t.text, ...t.areaWords.map(([, w]) => w)].join('').match(INVISIBLE)?.length ?? 0;
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
  return { sections, blocking, plain };
}

/** Every field of the terms, named, for saying what a clone changes (Law rule 44a). */
const FIELD_NAMES: Record<number, string> = {
  0: 'who the members are',
  1: "the constitution's words",
  3: 'the keepers',
  5: 'the clone rule',
  6: 'the time reference',
  7: 'the stakes',
  8: 'the split plan',
  9: 'the abandonment clause',
  10: 'the fork rule',
  12: 'the key grammar',
  13: 'the arbitrators',
  14: "the split service's grant",
  16: 'the succession plans',
  17: 'the refund terms',
  18: 'the constitutional change rule',
  19: 'the areas',
};

type Change = { form: 'field' | 'task' | 'extension' | 'words'; field?: number | null; task?: number | null; extension?: string | null; area?: number | null; tier: 'constitutional' | 'judicial' | 'operational' };

/** What a clone changes, field by field, and the powers its mark must name: the core's own plan (Law rules 44a to 44c). */
export function planOf(before: Uint8Array, after: Uint8Array): { changes: Change[]; needs: PowerOut[] } {
  return lawClonePlan(before, after, LAW_SPECS) as { changes: Change[]; needs: PowerOut[] };
}

const powerKey = (p: PowerOut) => (p.form === 'area' ? `area ${p.area}` : p.form === 'plan' ? `plan ${p.party}` : p.form);

/**
 * What a clone changes, compared with the agreement in force, from the two
 * exact payloads: who joins and leaves, the keys, each area's holders, and
 * each change with its tier and the powers the clone's mark must name.
 * A mark that names other powers is said in red (F104).
 */
export function readChanges(beforePayload: Uint8Array, afterPayload: Uint8Array, names: Names): Line[] {
  const before = termsOf(beforePayload);
  const after = termsOf(afterPayload);
  const out: Line[] = [];
  const joined = after.parties.filter((p) => !before.parties.includes(p));
  const left = before.parties.filter((p) => !after.parties.includes(p));
  for (const p of joined) out.push({ text: `${names(p)} joins, bound once they sign the clone.` });
  for (const p of left)
    out.push({
      text: `${names(p)} leaves. They hand over nothing: the collective rotates to keys they never held, and from then on they have no say in it. They keep what they own (Law rules 37, 46, F100).`,
    });
  const holder = (t: TermsRead) => (t.grammar?.signing.form === 'one' ? t.grammar.signing.holder! : null);
  if (holder(before) !== holder(after) && holder(after)) {
    out.push({ text: `The everyday key passes to ${names(holder(after)!)}${holder(before) ? ` (was ${names(holder(before)!)})` : ''}.` });
  }
  const sb = before.grammar?.safety;
  const sa = after.grammar?.safety;
  if (sa?.form === 'shares' && sb?.form === 'shares' && JSON.stringify(sa) !== JSON.stringify(sb)) {
    out.push({
      text: `The safety key is dealt afresh: ${sa.members!.length} shares, any ${sa.threshold} rebuild it (was ${sb.members!.length} shares, any ${sb.threshold}). Nobody leaving ever holds a share of the new key.`,
      tone: sa.threshold === 1 && sb.threshold !== 1 ? 'warn' : undefined,
    });
  }
  const ids = [...new Set([...before.areas, ...after.areas].map((a) => a.id))];
  for (const id of ids) {
    const b = before.areas.find((a) => a.id === id);
    const a = after.areas.find((x) => x.id === id);
    const held = (x: AreaRead) => (x.holders.length ? `any ${x.threshold} of ${list(x.holders.map(names))}` : 'nobody: frozen');
    if (!b && a) out.push({ text: `A new area, “${a.name}” (area ${id}): ${held(a)}.` });
    else if (b && !a) out.push({ text: `The “${b.name}” area (area ${id}) is dropped.`, tone: 'warn' });
    else if (a && b && JSON.stringify(a) !== JSON.stringify(b)) {
      out.push({ text: `The “${a.name}” area (area ${id}) is now decided by ${held(a)} (was ${held(b)}).` });
    }
  }
  const rule = (r: RuleOut, parties: string[]) => ruleWords(r, parties, names);
  if (JSON.stringify(before.constitutional) !== JSON.stringify(after.constitutional)) {
    out.push({ text: `The constitution now changes with ${constitutionWords(after, names)} (was ${constitutionWords(before, names)}).` });
  }
  if (JSON.stringify(before.clone) !== JSON.stringify(after.clone)) {
    out.push({ text: `Other changes now need ${rule(after.clone, after.parties)} (was ${rule(before.clone, before.parties)}).` });
  }
  if (JSON.stringify(before.abandonment) !== JSON.stringify(after.abandonment)) {
    const words = (a: TermsRead['abandonment']) =>
      !a ? 'no one' : a.authority === 'named' ? names(a.identity!) : `any ${a.threshold} of the other parties`;
    out.push({
      text: `Absence is now judged by ${words(after.abandonment)} (was ${words(before.abandonment)}). A protected clause: it changes only with every member's signature, one version for everyone (Law rule 46a, F121).`,
      tone: 'warn',
    });
  }
  if (before.text !== after.text) out.push({ text: "The constitution's words change: read the new words below, in full.", tone: 'warn' });
  else out.push({ text: "The constitution's words stay the same." });
  const wb = new Map(before.areaWords);
  for (const [id, w] of after.areaWords) {
    if (wb.get(id) !== w) out.push({ text: `The “${after.areas.find((a) => a.id === id)?.name ?? `area ${id}`}” area's own words change: read them below.`, tone: 'warn' });
  }

  // The core's plan: each change, its tier, and the powers the mark must name.
  let plan: ReturnType<typeof planOf>;
  try {
    plan = planOf(beforePayload, afterPayload);
  } catch (e) {
    out.push({ text: `Law cannot say what this clone changes: ${e instanceof Error ? e.message : e}`, tone: 'bad' });
    return out;
  }
  const areaName = (id: number | null | undefined) => before.areas.find((a) => a.id === id)?.name ?? after.areas.find((a) => a.id === id)?.name ?? `area ${id}`;
  for (const ch of plan.changes) {
    const what =
      ch.form === 'field'
        ? (FIELD_NAMES[ch.field!] ?? `field ${ch.field}`)
        : ch.form === 'task'
          ? `the cMIP for task ${ch.task}`
          : ch.form === 'extension'
            ? `the extension ${specName(ch.extension!)}`
            : `the “${areaName(ch.area)}” area's own words`;
    const tier =
      ch.tier === 'constitutional'
        ? 'constitutional'
        : ch.tier === 'judicial'
          ? 'judicial, a protected clause: it changes only with every member\'s signature, one version for everyone (Law rule 46a, F121)'
          : ch.form === 'words'
            ? `operational, in the “${areaName(ch.area)}” area`
            : 'operational';
    out.push({ text: `A change to ${what}: ${tier}.` });
  }
  if (!plan.changes.length) out.push({ text: 'Law finds nothing changed in the terms.' });
  const areas = before.areas;
  out.push({ text: `So its mark must name ${list(plan.needs.map((p) => powerWords(p, areas, names)))} (Law rule 44c).` });
  const claimed = (after.mark ?? []).map((e) => powerKey(e.power));
  if (JSON.stringify(claimed) === JSON.stringify(plan.needs.map(powerKey))) {
    out.push({ text: 'Its mark names exactly that.', tone: 'ok' });
  } else {
    out.push({
      text: `Its mark names ${list((after.mark ?? []).map((e) => powerWords(e.power, areas, names))) || 'nothing'}: a false mark sinks the clone (F104).`,
      tone: 'bad',
    });
  }
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
