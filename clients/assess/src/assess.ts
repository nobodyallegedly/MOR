// The assessment tool (roadmap step 14, defined by Nobody, allegedly, on 12
// October 2026; moved to the redesigned acts in round 9, F411: "Move it to
// next round"). It explains what people now sign, in plain words, and flags
// its obvious risks:
// - an ownership agreement: a work's (target a claim) or a collective's
//   founding agreement, its constitution (target the collective itself):
//   who owns what share, how the owners decide, who judges, how it ends
//   (this file);
// - a publication: what it sells, its price tags, its owners read by
//   reference, its partners and their labels, its split plan and fees, its
//   split service and backups, its ending (`publication.ts`).
//
// A client feature, never core: every fact is the core library's reading of
// the exact bytes (`readTerms`) or, from the relays, its verdicts
// (`gather.ts`); nothing here re-decides a rule. Each flag names the rule or
// stated cost it rests on, by its number in Agreements draft 17 and Money
// draft 11.

import { MIRS } from '../../genesis/src/core.ts';
import { list, problemWords, readAgreement, termsOf, uncovered, OUTCOMES, type Line, type Names, type Plain, type RuleOut, type Section, type TermsRead } from '../../collective/src/explain.ts';

/** The risks the tool looks for, and the stated costs an act's own clauses bring. */
export type FlagCode =
  | 'no-exit'
  | 'uncapped-fee'
  | 'judge-is-party'
  | 'no-fork-judge'
  | 'dilutable-stake'
  | 'no-owner'
  | 'absence-on-word'
  | 'split-service-window'
  | 'partners-first'
  | 'money-alone';

/** One risk an act carries. */
export interface Flag {
  code: FlagCode;
  /** "listed": one of the risks the tool names; "stated cost": a cost the rules mark as stated, brought by a clause of this act. */
  family: 'listed' | 'stated cost';
  /** In plain words. */
  text: string;
  /** The rule or stated cost it rests on. */
  rests: string;
  /** The rules `rests` cites, by their numbers in the current drafts, for quoting them in full (`rules.ts`). */
  cites: Cite[];
  /** The identities it concerns, if any. */
  who?: string[];
}

/** A rule a flag cites: which MIR, and the rule's number in its current draft. */
export interface Cite {
  mir: 'Agreements' | 'Money';
  rule: number;
}

/** Agreements rules, by number. */
export const A = (...rules: number[]): Cite[] => rules.map((rule) => ({ mir: 'Agreements', rule }));

/** What the relays show of an agreement, every fact a verdict of the core library (`gather.ts`). */
export interface Found {
  /** The relays asked. */
  at: string[];
  /** The parties whose signature acts the core counts. */
  signed: string[];
  /** Whether it exists (every signature its rule asks for); null where the core cannot say. */
  exists: boolean | null;
  /** Agreements' reason it is invalid, if it is. */
  invalid: string | null;
  /** The version in force of the deal it belongs to, as far as the relays asked show. */
  inForce: string | null;
  /** A deal's fork, if it stands forked. */
  fork: { reference: string; branches: string[][]; tangled: string | null } | null;
  /** What is still owed, in plain words, from the core's verdicts. */
  owed: Line[];
}

/** What an act is, as the tool reads it. */
export type Kind = 'ownership' | 'collective' | 'deal' | 'publication' | 'split agreement';

/** Everything the tool says about one act. */
export interface Assessment {
  kind: Kind;
  title: string;
  summary: string[];
  sections: Section[];
  /** Words signed by others, to be shown as they are. */
  plain: Plain[];
  flags: Flag[];
  /** Agreements' own objection to the act, if any: it is then explained, not judged further. */
  problem: string | null;
}

/** Each cited rule once, in the order first cited. */
export const unique = (cites: Cite[]): Cite[] => cites.filter((c, i) => cites.findIndex((d) => d.mir === c.mir && d.rule === c.rule) === i);

/** With a capital first letter. */
export const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/** A share in millionths, as a percentage. */
export const pct = (n: number): string => `${Number((n / 10_000).toFixed(4))}%`;

/** The sections of the collective client's reading this tool shows as they are. */
const SHARED = ['The five layers: who acts for it', 'Finer areas: who decides which act types', 'Who decides what', 'If someone disappears', 'Hidden characters'];

/** The risks the tool looks for, in words, for "none found". */
export const NONE_FOUND =
  'None of the risks this tool looks for: a party with no exit, an uncapped fee, a judge who is also a party, no judge of forks, a stake diluted without its holder, money divided with no owner, partners paid before the owners with no cap, one member alone holding Money, or a stated cost one of its clauses brings.';

/** The "Risks" section: the flags, or the core's objection, or none. */
export function risksSection(flags: Flag[], problem: string | null): Section {
  return {
    heading: 'Risks',
    lines: problem
      ? [{ text: `Not judged further: ${problem}`, tone: 'bad' }]
      : flags.length
        ? flags.map((f) => ({ text: `${cap(f.text)} Rests on: ${f.rests}.`, tone: 'warn' as const }))
        : [{ text: NONE_FOUND, tone: 'ok' }],
  };
}

/** What the act is, from the core's reading of terms. */
function kindOf(t: TermsRead): Kind {
  if (t.grammar || t.target?.[0] === 'collective') return 'collective';
  if (t.target?.[0] === 'claim') return 'ownership';
  return 'deal';
}

/** Explain and flag the terms whose exact payload is `payload`: a work's ownership agreement, a collective's constitution, or other terms. `found`: what the relays show, if they were asked. Throws if the payload is not terms in Agreements' format. */
export function assess(payload: Uint8Array, names: Names, found?: Found | null): Assessment {
  const t = termsOf(payload);
  const kind = kindOf(t);
  const problem = t.problem ? problemWords(t.problem) : null;
  const flags = problem ? [] : flagsOf(t, names);
  const shared = readAgreement(t, names);

  const sections: Section[] = [
    signedSection(t, names, found),
    boundSection(t, names),
    sharesSection(t, names),
    decideSection(t, names),
    judgesSection(t, names),
    endsSection(t, names),
    owedSection(found),
    ...shared.sections.filter((s) => SHARED.includes(s.heading)),
    risksSection(flags, problem),
  ];

  const who = list(t.parties.map(names));
  const summary = [
    kind === 'collective'
      ? `${t.parent ? 'A new version of a collective’s constitution' : 'The constitution of a collective, its founding agreement'}, of ${t.parties.length} members: ${who}. It is an ownership agreement with an identity of its own: its stake is a share of all the collective’s income.`
      : kind === 'ownership'
        ? `${t.parent ? 'A new version of a work’s ownership agreement' : 'A work’s ownership agreement'}, between ${t.parties.length === 1 ? 'one owner' : `${t.parties.length} parties`}: ${who}. It says who owns what share of the work and how the owners decide; what is sold, and how payments divide, is a publication’s.`
        : `${t.parent ? 'A new version of a deal' : 'A deal'} between ${t.parties.length === 1 ? 'one party' : `${t.parties.length} parties`}: ${who}.`,
    problem ? 'Agreements refuse these terms: they bind nobody as they stand.' : flags.length ? `${flags.length === 1 ? 'One risk' : `${flags.length} risks`} flagged, each with the rule it rests on.` : 'No risk flagged.',
  ];
  return {
    kind,
    title: kind === 'collective' ? 'A collective’s constitution, assessed' : kind === 'ownership' ? 'An ownership agreement, assessed' : 'A deal, assessed',
    summary,
    sections,
    plain: [{ heading: 'The words, as signed', text: t.text }, ...shared.plain],
    flags,
    problem,
  };
}

// ---------------------------------------------------------------- the explanation

function signedSection(t: TermsRead, names: Names, found?: Found | null): Section {
  const lines: Line[] = [];
  if (!found) {
    lines.push({ text: `The relays were not asked: who has signed is not known here. Its parties: ${list(t.parties.map(names))}.` });
  } else {
    for (const p of t.parties) {
      lines.push(
        found.signed.includes(p)
          ? { text: `${names(p)} has signed.`, tone: 'ok' }
          : { text: `${names(p)} has not signed: nothing in it binds ${names(p)} yet.`, tone: 'warn' },
      );
    }
    if (found.invalid) lines.push({ text: `Agreements count it invalid: ${found.invalid}`, tone: 'bad' });
    else if (found.exists === true) lines.push({ text: 'It exists: every signature its rule asks for is there, as far as the relays asked show.', tone: 'ok' });
    else if (found.exists === false) lines.push({ text: 'It is not in force: it exists only once every party has signed it.', tone: 'warn' });
    else lines.push({ text: 'Whether it exists cannot be said from what the relays hold.', tone: 'warn' });
    if (found.fork) {
      lines.push({
        text: found.fork.tangled
          ? `The deal is tangled (${found.fork.tangled}): it stays on its reference ${found.fork.reference.slice(0, 8)}… until one version names every tip it drops (rule 47).`
          : `The deal stands forked: ${found.fork.branches.length} branches from its reference ${found.fork.reference.slice(0, 8)}…; a payment under either branch counts (rule 47).`,
        tone: 'warn',
      });
    } else if (found.inForce) {
      lines.push({ text: `The version of this agreement in force is ${found.inForce.slice(0, 8)}…, as far as ${list(found.at)} show. A payment under it names that version (Agreements rule 12).` });
    }
  }
  lines.push({ text: 'Each party is bound only through its own signature act (Agreements rule 1).' });
  return { heading: 'Who signed', lines };
}

/** The holders of the one stake (field 7), in order. */
function stakeOf(t: TermsRead): [string | null, number][] {
  return (t.stakes ?? [])[0]?.[1] ?? [];
}

/** The parts each identity plays in the terms. */
function roles(t: TermsRead, who: string, names: Names): string[] {
  const out: string[] = [];
  for (const [h, n] of stakeOf(t)) if (h === who) out.push(`holds ${pct(n)} of ${t.target?.[0] === 'collective' ? 'all of this collective’s income' : 'the work'}`);
  if (t.arbitrators?.includes(who)) out.push('is named arbitrator or verifier');
  if (t.forkJudge === who) out.push('is the judge of the deal’s forks');
  if (t.keepers?.[0].includes(who)) out.push('operates a keeper');
  if (t.abandonment?.authority === 'named' && t.abandonment.identity === who) out.push('judges whether a party is absent');
  for (const [, next] of t.chain ?? []) if (next.some(([hs]) => hs[0] === who)) out.push('takes over as a judge in the chain of judgment');
  for (const a of t.areas ?? []) if (a.holders.includes(who)) out.push(`holds the “${a.name}” area`);
  for (const p of t.succession ?? []) if (p.party === who) out.push('has a succession plan in it');
  return out;
}

function boundSection(t: TermsRead, names: Names): Section {
  const lines: Line[] = [{ text: 'Each party who signs is bound to the words below, as signed, and to every rule of these terms: a signature is consent to everything they define, pre-authorised changes included (Agreements rule 8).' }];
  for (const p of t.parties) {
    const r = roles(t, p, names);
    lines.push({ text: `${names(p)}: ${r.length ? list(r) : 'a party, with no share or role of its own in these terms'}.` });
  }
  for (const [h] of stakeOf(t)) if (h && !t.parties.includes(h)) lines.push({ text: `${names(h)}, not a party: ${list(roles(t, h, names))}. Bound by nothing here; protected by it (Agreements rules 45, 48).` });
  lines.push({
    text:
      kindOf(t) === 'collective'
        ? 'A member’s obligations change only as the constitution’s rules allow; no share is lowered without its holder’s signature (Agreements rules 45, 48).'
        : 'No version of it changes without every party’s signature (Agreements rule 47).',
  });
  return { heading: 'What each party is bound to', lines };
}

function sharesSection(t: TermsRead, names: Names): Section {
  const lines: Line[] = [];
  const holders = stakeOf(t);
  const collective = t.target?.[0] === 'collective';
  if (holders.length) {
    lines.push({
      text: `The stake, in ${collective ? 'this collective itself, a share of all its income, whoever earns it' : `the work its claim ${t.target?.[1] ? names(t.target[1]) : ''} names`}: ${list(holders.map(([h, n]) => `${h == null ? 'this collective' : names(h)} ${pct(n)}`))}, written in millionths summing to 100% (Agreements rule 9).`,
    });
    lines.push({
      text: collective
        ? 'Every payment to the collective is divided by these shares, member or departed, by the split service its split agreement names, which reads them here at each payment, never a copy (Agreements rule 15).'
        : 'A publication naming this agreement pays these owners what is left of each payment once its partners and its plan’s shares are paid off the top, read here by reference at each payment (Agreements rules 11, 12).',
    });
  } else {
    lines.push({ text: 'It writes no stake: it owns nothing, and divides no money.' });
  }
  lines.push({ text: 'An ownership agreement carries no split plan, no fees and no split service: those are a publication’s (Agreements, “Ownership agreement”).' });
  return { heading: 'Who owns what', lines };
}

/** A rule over the parties, in words. */
function ruleText(r: RuleOut | null | undefined, n: number, names: Names): string {
  if (!r || r.form === 'all') return 'every party';
  if (r.form === 'threshold') return r.threshold === 1 ? 'any one party alone' : `any ${r.threshold} of the ${n} parties`;
  if (r.form === 'named') return list((r.named ?? []).map(names));
  if (r.form === 'share' || r.form === 'holders') return `holders of at least ${pct(r.share ?? 0)} of the stake, by share`;
  return 'all of several rules together';
}

function decideSection(t: TermsRead, names: Names): Section {
  const lines: Line[] = [];
  const n = t.parties.length;
  if (kindOf(t) !== 'collective') {
    lines.push({ text: 'Every party signs every change, and every publication that names it (as one party, consenting by its own rule: every party, Agreements rules 11, 15, 47).' });
  } else {
    lines.push({ text: `Its constitution (who the members are, the change rules, the key grammar, the layers and areas) changes with ${ruleText(t.constitutional, n, names)} (field 18, Agreements rule 62).` });
    lines.push({ text: 'Its judicial tier (judges, keepers, the abandonment clause, succession, and its split agreement) changes only with every member whose voice remains (Agreements rule 67).' });
    lines.push({ text: `Operational matters outside every layer and area change with ${ruleText(t.clone, n, names)} (field 5).` });
    const hr = (t as TermsRead & { holdersRules?: { stake: number; rule: RuleOut; waived: boolean }[] | null }).holdersRules ?? [];
    const own = hr.find((x) => x.stake === 0);
    lines.push({
      text: own && own.rule.form !== 'all'
        ? `The owners’ matters (what the stake is paid, an issuance in it, a sale of a share it holds) are decided by ${ruleText(own.rule, n, names)}, binding only holders who accepted that rule by signing or buying (field 30, Agreements rules 94, 95).`
        : 'The owners’ matters (what the stake is paid, an issuance in it, a sale of a share it holds) need every holder (Agreements rules 94, 95).',
    });
    if (own?.waived) lines.push({ text: 'It waives pre-emption on the stake for good: an issuance need not first offer existing holders their proportion (Agreements rule 96).', tone: 'warn' });
  }
  return { heading: 'How the owners decide', lines };
}

function judgesSection(t: TermsRead, names: Names): Section {
  const lines: Line[] = [];
  const then = (key: string): string => {
    const next = (t.chain ?? []).find(([j]) => j === key)?.[1] ?? [];
    return next.length ? `, then ${list(next.map(([hs, p]) => `${names(hs[0])} after ${p} on the time reference`))}, in that order` : '';
  };
  const cmip = (task: number) => t.cmips.find(([n]) => n === task)?.[1];
  const c9 = cmip(9);
  if (c9) lines.push({ text: `Conditions are judged by the condition cMIP ${names(c9)}${then('task 9')}.` });
  const time = t.time ?? cmip(10);
  if (time) lines.push({ text: `Time is judged by the time reference ${names(time)}: for this agreement, only it says whether something is before, after or past its terms (Agreements rule 33)${then('task 10')}.` });
  const c11 = cmip(11);
  if (c11) lines.push({ text: `Anchoring is judged by ${names(c11)}${then('task 11')}.` });
  for (const a of t.arbitrators ?? []) lines.push({ text: `Content is judged by ${names(a)}, an arbitrator or verifier, who receives the keys it must judge${then(a)}.` });
  if (kindOf(t) !== 'collective' && t.parties.length > 1) {
    lines.push(
      t.forkJudge
        ? { text: `The judge of forks is ${names(t.forkJudge)} (field 27): if two complete versions ever stand side by side, it settles them on a party’s request${then(t.forkJudge)} (Agreements rule 47).` }
        : { text: 'No judge of forks: if two complete versions ever stand side by side, only a version every party signs settles them (Agreements rule 47).', tone: 'warn' },
    );
  }
  if (t.keepers) {
    const [ops, r] = t.keepers;
    const need = ops.length === 1 ? 'its record counts' : `${r.form === 'all' ? `all ${ops.length}` : r.form === 'threshold' ? `any ${r.threshold}` : list((r.named ?? []).map(names))} count as recorded`;
    lines.push({ text: `${ops.length === 1 ? 'A keeper records' : 'Keepers record'} what happens, sealed, without reading it: operated by ${list(ops.map((o) => `${names(o)}${then(o)}`))}; ${need} (Agreements rule 36).` });
  }
  const a = t.abandonment;
  if (a) {
    lines.push({
      text:
        a.authority === 'named'
          ? `Whether a party is absent is judged by ${names(a.identity ?? '')}${a.proof ? `, checked by the absence-proof cMIP ${names(a.proof)}` : ''}${then(a.identity ?? '')} (Agreements rules 85, 87).`
          : `Whether a member is absent is judged by any ${a.threshold} of the other members${a.proof ? `, checked by the absence-proof cMIP ${names(a.proof)}` : ''} (Agreements rules 85, 87).`,
    });
  }
  if (lines.length) lines.push({ text: 'A judge that answers “unknown”, or does not act within its period, passes the question to the next in its chain, which every party signed; only the active link settles (Agreements rule 35).' });
  else lines.push({ text: 'Nobody judges anything: no condition cMIP, no time reference, no arbitrator, keeper or absence authority.' });
  return { heading: 'Who judges, and in what order', lines };
}

function endsSection(t: TermsRead, names: Names): Section {
  const lines: Line[] = [];
  if (t.parent) lines.push({ text: `It is a new version of ${names(t.parent)}: once complete, it replaces it (Agreements rule 45).` });
  if (kindOf(t) === 'collective') {
    lines.push({ text: 'Any member can leave alone, at any time, by a resignation no one else signs, keeping what they own (Agreements rule 70).' });
    lines.push({ text: 'The collective ends by a fork, its members splitting into successors, or by a closing once it holds nothing and owes nothing (Agreements rule 91).' });
  } else {
    lines.push({ text: 'A deal has no closing act. It ends, or winds down, by a new version every party signs, stating where its stake went, what is still owed, and to whom it now pays (Agreements rule 47).' });
    lines.push({ text: 'A party leaves only as its terms provide.' });
  }
  if (t.abandonment?.outcomes.includes(4)) lines.push({ text: `A declaration of absence may close it (Agreements rule 89, outcome 4: ${OUTCOMES[4]}).` });
  if (stakeOf(t).length && t.target?.[0] === 'claim') {
    const r = t.releaseRule;
    lines.push({ text: `The work leaves ownership if released to the public domain, which ${!r || r.form === 'all' ? 'every holder signs' : r.form === 'named' ? `${list((r.named ?? []).map(names))} sign` : `holders together holding at least ${pct(r.share ?? 0)} sign`} (Agreements rule 55, field 24: by share, never by head).` });
  }
  return { heading: 'How it ends', lines };
}

function owedSection(found?: Found | null): Section {
  const lines: Line[] = [];
  if (found) lines.push(...(found.owed.length ? found.owed : [{ text: `Nothing owed under it, as far as ${list(found.at)} show.` }]));
  else lines.push({ text: 'The relays were not asked: no payment made under it is known here.' });
  lines.push({ text: 'A party who has not signed owes nothing under it: its obligations are shown as unsigned, never as open (Agreements rule 1).' });
  return { heading: 'What is still owed', lines };
}

// ---------------------------------------------------------------- the flags

/** The identified holders of the stake, once each, in order. */
function holders(t: TermsRead): string[] {
  const out: string[] = [];
  for (const [h] of stakeOf(t)) if (h && !out.includes(h)) out.push(h);
  return out;
}

/** How many members a layer's rule lets act alone: 1 where one member can, else more (0 where the rule is by share). */
function alone(r: RuleOut | undefined, n: number): number {
  if (!r) return n;
  if (r.form === 'all') return n;
  if (r.form === 'threshold') return r.threshold ?? n;
  if (r.form === 'named') return (r.named ?? []).length;
  return 0;
}

function flagsOf(t: TermsRead, names: Names): Flag[] {
  const out: Flag[] = [];
  const kind = kindOf(t);
  const deal = kind !== 'collective';
  const who = (xs: string[]) => list(xs.map(names));
  const owners = holders(t);
  const a = t.abandonment;

  // A party with no exit (rule 47's stated cost): in a deal, a work's
  // ownership agreement included, every party signs every change, so a
  // party nobody can declare absent holds it.
  if (deal && t.parties.length > 1) {
    const stuck = uncovered(t);
    if (stuck.length) {
      out.push({
        code: 'no-exit',
        family: 'listed',
        who: stuck,
        text: `${who(stuck)} cannot be declared absent: if ${stuck.length === 1 ? 'that party goes' : 'any of them goes'} silent, nobody can change or end it, sign a publication for it, or leave it.`,
        rests: 'Agreements rule 47, stated cost: one silent party blocks every change to a deal, however large; the way out is an abandonment clause removing an absent party’s voice (rule 89, outcome 0)',
        cites: A(47, 89),
      });
    }
  }

  // A judge who is also a party.
  {
    const judges = new Map<string, string[]>();
    const add = (h: string | null | undefined, as: string) => {
      if (!h || !t.parties.includes(h)) return;
      judges.set(h, [...(judges.get(h) ?? []), as]);
    };
    for (const x of t.arbitrators ?? []) add(x, 'an arbitrator');
    add(t.forkJudge, 'the judge of forks');
    for (const x of t.keepers?.[0] ?? []) add(x, 'a keeper’s operator');
    if (a?.authority === 'named') add(a.identity, 'the absence authority');
    for (const [, next] of t.chain ?? []) for (const [hs] of next) add(hs[0], 'a later link of the chain of judgment');
    if (judges.size) {
      const ids = [...judges.keys()];
      out.push({
        code: 'judge-is-party',
        family: 'listed',
        who: ids,
        text: `A judge who is also a party: ${list(ids.map((h) => `${names(h)} judges as ${list([...new Set(judges.get(h))])}`))}, in a question where they have a stake of their own.`,
        rests: 'Agreements rule 35, the chain of judgment, which every party signs; Agreements bar it for specifications only (a judge never handles what it judges), and let a party be the absence authority (rule 85)',
        cites: A(35, 85),
      });
    }
  }

  // No judge of forks.
  if (deal && t.parties.length > 1 && !t.forkJudge) {
    out.push({
      code: 'no-fork-judge',
      family: 'listed',
      text: 'No judge of forks: if two complete versions ever stand side by side, it stays on its reference until every party signs one settling version, and any party can keep it there.',
      rests: 'Agreements rule 47, field 27: with no judge of forks named, the deal stays on its reference; stated cost: a party of either branch can refuse every settlement and keep the deal on its reference',
      cites: A(47),
    });
  }

  // A stake diluted, or ended, without its holder.
  if (owners.length) {
    const hit = new Set<string>();
    const why: string[] = [];
    const rests: string[] = [];
    const cites: Cite[] = [];
    // Outcome 1 reaches only a holder whose succession plan names no stake successor (F279).
    if (a && a.outcomes.includes(1)) {
      const heir = (h: string) => (t.succession ?? []).some((s) => s.party === h && (s.stakes ?? []).length > 0);
      const declarable = (h: string) => (t.parties.includes(h) || (t.departed ?? []).includes(h)) && !(a.authority === 'named' && h === a.identity);
      const declared = owners.filter((h) => declarable(h) && !heir(h));
      if (declared.length) {
        for (const h of declared) hit.add(h);
        why.push(`${who(declared)}, naming no stake successor, may be declared absent and have ${declared.length === 1 ? 'that share' : 'those shares'} shared among the remaining holders, without signing; naming a successor sends it to the successor instead`);
        rests.push('Agreements rule 89: outcome 1 applies to a stake only where the holder’s succession plan names no stake successor; rule 48');
        cites.push(...A(48, 89));
      }
    }
    const r = t.releaseRule;
    if (r && r.form !== 'all') {
      const need = new Set(r.form === 'named' ? (r.named ?? []) : []);
      const left = owners.filter((h) => !need.has(h));
      if (left.length) {
        for (const h of left) hit.add(h);
        why.push(`the work can be released to the public domain, ending what it earns, without ${who(left)}`);
        rests.push('Agreements rule 55, field 24: the release rule says which holders sign a release');
        cites.push(...A(55));
      }
    }
    const hr = (t as TermsRead & { holdersRules?: { stake: number; rule: RuleOut; waived: boolean }[] | null }).holdersRules ?? [];
    const own = hr.find((x) => x.stake === 0);
    if (own && own.rule.form !== 'all') {
      for (const h of owners) hit.add(h);
      why.push(`owners holding together ${pct(own.rule.share ?? 0)} of the stake decide what it is paid and whether new shares are issued in it, without the others, once they have accepted that rule by signing or buying`);
      rests.push('Agreements rules 94 and 95: the holders’ rule decides the owners’ matters, binding only holders who accepted it');
      cites.push(...A(94, 95));
    }
    if (own?.waived) {
      for (const h of owners) hit.add(h);
      why.push('pre-emption is waived for good, so an issuance need not first offer each holder their proportion');
      rests.push('Agreements rule 96: an issuance is pre-emptive, waived only by every holder, here in advance (field 30)');
      cites.push(...A(96));
    }
    if (why.length) out.push({ code: 'dilutable-stake', family: 'listed', who: owners.filter((h) => hit.has(h)), text: `A stake can be diluted without its holder: ${why.join('; and ')}.`, rests: rests.join('; '), cites: unique(cites) });
  }

  // One member alone holding Money (rule 60): a constitution letting one
  // member set the collective's payee pointer, sign its receipts and price
  // tags and take on debts without the others; or a finer area in Money
  // held by one member with no cap.
  if (kind === 'collective' && t.parties.length > 1) {
    const n = t.parties.length;
    const money = (t.layers ?? []).find(([l]) => l === 3)?.[1];
    const k = alone(money, n);
    const why: string[] = [];
    let ids: string[] = [];
    if (k === 1) {
      ids = money?.form === 'named' ? (money.named ?? []) : t.parties;
      why.push(`${money?.form === 'named' ? who(ids) : 'any one member'} can act alone in Money for the collective: set where its income goes, sign its receipts and price tags, and take on debts in its name`);
    }
    for (const ar of t.areas ?? []) {
      const inMoney = ar.kinds.some((x) => x.layer === 3 || (x.form === 'type' && x.spec === MIRS.money));
      if (inMoney && ar.threshold === 1 && !ar.limitsCmip) {
        ids = [...new Set([...ids, ...ar.holders])];
        why.push(`the area “${ar.name}”, in Money, lets ${ar.holders.length === 1 ? names(ar.holders[0]) : `any one of ${who(ar.holders)}`} act alone there, with no cap`);
      }
    }
    if (why.length) {
      out.push({
        code: 'money-alone',
        family: 'listed',
        who: ids,
        text: `One member alone holds Money: ${why.join('; and ')}. The others learn of it from the act, sealed to them, never by being asked first.`,
        rests: 'Agreements rule 60, the layers: who acts for the collective in Money is the founders’ choice, shown before signing (client conformance); rule 57: an act for it is done once sealed to every member',
        cites: A(60, 57),
      });
    }
  }

  // Stated costs the terms' own clauses bring.
  if (a && !a.proof) {
    out.push({
      code: 'absence-on-word',
      family: 'stated cost',
      text: `Absence is on ${a.authority === 'named' ? `${names(a.identity ?? '')}’s` : 'the other members’'} word alone: no absence-proof cMIP checks it, and a party declared absent wrongly can only contest it, in public.`,
      rests: 'Agreements rule 87, stated cost: a declaration is the authority’s judgment, a stated cost the party accepted; rule 85, client conformance',
      cites: A(87, 85),
    });
  }
  return out;
}

/**
 * What a signing client shows of the tool before terms are signed, beside
 * its own reading: who owns what, how the owners decide, and the risks.
 * Empty where the payload is not terms in Agreements' format: the client's
 * own reading says why.
 */
export function beforeSigning(payload: Uint8Array, names: Names): Section[] {
  let a: Assessment;
  try {
    a = assess(payload, names);
  } catch {
    return [];
  }
  const lines = (h: string) => a.sections.find((s) => s.heading === h)?.lines ?? [];
  return [
    { heading: 'Who owns what', lines: lines('Who owns what') },
    { heading: 'How the owners decide', lines: lines('How the owners decide') },
    { heading: 'Risks, before you sign (the assessment tool)', lines: lines('Risks') },
  ];
}

export { assessPublication, beforeSigningPublication, readPublicationPayload, type PublicationContext, type PublicationFields } from './publication.ts';
