// The deal-assessment tool (roadmap step 14, defined by Nobody, allegedly, on
// 12 October 2026): it explains an agreement in plain words and flags its
// obvious risks. A client feature, never core: every fact is the core
// library's reading of the exact bytes (`readTerms`, `agreementsClonePlan`)
// or, from the relays, its verdicts (`gather.ts`); nothing here re-decides
// a rule. Each flag names the rule or stated cost it rests on.
//
// Rules are cited by their numbers in Agreements draft 11, with the number
// the code and the findings use where it differs ("was").

import { agreementsClonePlan, cborDecode, cborEncode, sha256, unhex } from '../../genesis/src/core.ts';
import { AGREEMENTS_SPECS } from '../../repo/src/agreements.ts';
import {
  OUTCOMES,
  list,
  problemWords,
  readAgreement,
  termsOf,
  uncovered,
  type Line,
  type Names,
  type Plain,
  type PowerOut,
  type Section,
  type TermsRead,
} from '../../collective/src/explain.ts';

/** The risks step 14 lists, and the stated costs a deal's own clauses bring. */
export type FlagCode =
  | 'no-exit'
  | 'uncapped-fee'
  | 'judge-is-party'
  | 'no-fork-judge'
  | 'dilutable-stake'
  | 'absence-on-word'
  | 'payer-side-split'
  | 'split-service-window';

/** One risk the terms carry. */
export interface Flag {
  code: FlagCode;
  /** "listed": one of the risks step 14 names; "stated cost": a cost the rules mark as stated, brought by a clause of these terms. */
  family: 'listed' | 'stated cost';
  /** In plain words. */
  text: string;
  /** The rule or stated cost it rests on. */
  rests: string;
  /** The identities it concerns, if any. */
  who?: string[];
}

/** What the relays show of the agreement, every fact a verdict of the core library (`gather.ts`). */
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

/** Everything the tool says about one agreement. */
export interface Assessment {
  kind: 'deal' | 'collective';
  title: string;
  summary: string[];
  sections: Section[];
  /** Words signed by others, to be shown as they are. */
  plain: Plain[];
  flags: Flag[];
  /** Agreements' own objection to the terms, if any: the terms are then explained, not judged further. */
  problem: string | null;
}

/** With a capital first letter. */
const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/** A share in millionths, as a percentage. */
const pct = (n: number): string => `${Number((n / 10_000).toFixed(4))}%`;

/** The sections of the collective client's reading this tool shows as they are. */
const SHARED = ["The collective's keys", 'Areas: who decides which acts', 'Who decides what', 'If someone disappears', 'Hidden characters'];

/** Explain and flag the terms whose exact payload is `payload`. `found`: what the relays show, if they were asked. Throws if the payload is not terms in Agreements' format. */
export function assess(payload: Uint8Array, names: Names, found?: Found | null): Assessment {
  const t = termsOf(payload);
  const collective = !!t.grammar;
  const problem = t.problem ? problemWords(t.problem) : null;
  const flags = problem ? [] : flagsOf(t, payload, names);
  const shared = readAgreement(t, names);

  const sections: Section[] = [
    signedSection(t, names, found),
    boundSection(t, names),
    sharesSection(t, names),
    judgesSection(t, names),
    endsSection(t, names),
    owedSection(t, found),
    ...shared.sections.filter((s) => SHARED.includes(s.heading)),
    {
      heading: 'Risks',
      lines: problem
        ? [{ text: `Not judged further: ${problem}`, tone: 'bad' }]
        : flags.length
          ? flags.map((f) => ({ text: `${cap(f.text)} Rests on: ${f.rests}.`, tone: 'warn' as const }))
          : [{ text: 'None of the risks this tool looks for: a party with no exit, an uncapped fee, a judge who is also a party, no judge of forks, a stake diluted without its holder, or a stated cost one of its clauses brings.', tone: 'ok' }],
    },
  ];

  const who = list(t.parties.map(names));
  const kind = collective ? 'collective' : 'deal';
  const summary = [
    collective
      ? `${t.parent ? 'A new version of a collective’s agreement' : 'The founding agreement of a collective'} of ${t.parties.length} members: ${who}.`
      : `${t.parent ? 'A new version of a deal' : 'A deal'} between ${t.parties.length === 1 ? 'one party' : `${t.parties.length} parties`}: ${who}.`,
    problem ? 'Agreements refuse these terms: they bind nobody as they stand.' : flags.length ? `${flags.length === 1 ? 'One risk' : `${flags.length} risks`} flagged, each with the rule it rests on.` : 'No risk flagged.',
  ];
  return {
    kind,
    title: collective ? 'A collective’s agreement, assessed' : 'A deal, assessed',
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
      lines.push({ text: `The version of this deal in force is ${found.inForce.slice(0, 8)}…, as far as ${list(found.at)} show.` });
    }
  }
  lines.push({ text: 'Each party is bound only through its own signature act (Agreements rule 1).' });
  return { heading: 'Who signed', lines };
}

/** The parts each identity plays in the terms. */
function roles(t: TermsRead, who: string, names: Names): string[] {
  const out: string[] = [];
  for (const [object, holders] of t.stakes ?? []) {
    for (const [h, n] of holders) if (h === who) out.push(`holds ${pct(n)} of ${object == null ? 'all of this collective’s income' : names(object)}`);
  }
  if (t.arbitrators?.includes(who)) out.push('is named arbitrator or verifier');
  if (t.forkJudge === who) out.push('is the judge of the deal’s forks');
  if (t.keepers?.[0].includes(who)) out.push('operates a keeper');
  if (t.abandonment?.authority === 'named' && t.abandonment.identity === who) out.push('judges whether a party is absent');
  for (const [, next] of t.chain ?? []) if (next.some(([hs]) => hs[0] === who)) out.push('takes over as a judge in the chain of judgment');
  for (const a of t.areas ?? []) if (a.holders.includes(who)) out.push(`holds the “${a.name}” area`);
  for (const p of t.succession ?? []) if (p.party === who) out.push('has a succession plan in it');
  if (t.plan?.shares.some((s) => s.kind === 'receiver' && s.receiver === who)) out.push('is a named receiver in the split plan');
  return out;
}

function boundSection(t: TermsRead, names: Names): Section {
  const lines: Line[] = [{ text: 'Each party who signs is bound to the words below, as signed, and to every rule of these terms: a signature is consent to everything they define, pre-authorised changes included (Agreements rule 8).' }];
  for (const p of t.parties) {
    const r = roles(t, p, names);
    lines.push({ text: `${names(p)}: ${r.length ? list(r) : 'a party, with no stake or role of its own in these terms'}.` });
  }
  const others = new Set<string>();
  for (const [, holders] of t.stakes ?? []) for (const [h] of holders) if (h && !t.parties.includes(h)) others.add(h);
  for (const h of others) lines.push({ text: `${names(h)}, not a party: ${list(roles(t, h, names))}. Bound by nothing here; protected by it (Agreements rules 45, 48).` });
  lines.push({
    text: t.grammar
      ? 'A member’s obligations change only as the constitution’s rules allow; no share is lowered without its holder’s signature (Agreements rules 45, 48).'
      : 'No version of it changes without every party’s signature (Agreements rule 47, was 45b).',
  });
  return { heading: 'What each party is bound to', lines };
}

function sharesSection(t: TermsRead, names: Names): Section {
  const lines: Line[] = [];
  const stakes = t.stakes ?? [];
  stakes.forEach(([object, holders], i) => {
    lines.push({
      text: `Stake ${i}, in ${object == null ? 'this collective itself, a share of all its income' : names(object)}: ${list(holders.map(([h, n]) => `${h == null ? 'this collective' : names(h)} ${pct(n)}`))}, written in millionths summing to 100% (Agreements rule 9).`,
    });
  });
  const p = t.plan;
  if (p) {
    const share = (s: NonNullable<TermsRead['plan']>['shares'][number]) =>
      s.kind === 'stake'
        ? `stake ${s.stake}, paid to its holders as currently held`
        : s.kind === 'role'
          ? `the role “${s.role}”, paid to whoever fills it, with evidence the payer acknowledges (rule 22)`
          : s.kind === 'receiver'
            ? `${names(s.receiver ?? '')}, a named receiver holding no stake`
            : `metric ${s.metric}`;
    lines.push({
      text: `Each payment in is divided by the split cMIP ${names(p.cmip)}, which computes the amounts from these parts: ${p.shares.map((s, i) => `${share(s)}, part ${s.part}${p.top.includes(i) ? ', taken off the top first' : ''}`).join('; ')} (Agreements rules 17, 27).`,
    });
    if (p.shares.some((s) => s.kind === 'role')) {
      lines.push({
        text:
          p.unfilled === 'stakes'
            ? 'A role nobody fills goes to the stakes, in proportion to their parts (F218).'
            : p.unfilled === 'held-open'
              ? 'A role nobody fills is held open, as an obligation.'
              : `A role nobody fills goes to ${names(p.unfilledTo ?? '')}.`,
      });
    }
    const bearer = p.serviceBearsRailFees ? 'The split service bears each payout’s rail fee' : 'Each receiver bears its payout’s rail fee';
    const m = p.maxRailFee;
    lines.push(
      m
        ? { text: `${bearer}; no payout may lose more than ${m.form === 'millionths' ? `${pct(m.value)} of each payout` : `${m.value} of ${names(m.unit ?? '')}`} to it, and a shortfall beyond that is the service’s open obligation (Agreements rule 25).` }
        : { text: `${bearer}; the plan states no maximum fee per payout (Agreements rule 25).`, tone: 'warn' },
    );
  }
  for (const f of t.fees ?? []) {
    const when = f.scope === 'every' ? 'every payment' : f.scope === 'publication' ? `payments for ${names(f.of ?? '')}` : `payments by the rail ${names(f.of ?? '')}`;
    lines.push({ text: `A fee entry: ${names(f.module)} is owed part ${f.part} of ${when}, taken off the top before the stakes divide, so it falls alike on every stake; a split leaving it out owes it (Agreements rule 28, F213, F214).` });
  }
  if (t.payeeGrants?.length || t.splitGrant) {
    lines.push({ text: `Payments go to a split service, by ${t.splitGrant ? 'the collective’s grant' : `${t.payeeGrants!.length === 1 ? 'one payee’s grant' : `each payee’s own grant (${t.payeeGrants!.length})`}`}: it publishes each split, delivered to every holder it pays, naming each fee and who received it (Agreements rules 16, 20).` });
    if (t.backups?.services.length) lines.push({ text: `If an attempt at the service fails, ${t.backups.services.length === 1 ? 'one backup' : `${t.backups.services.length} backups`} take${t.backups.services.length === 1 ? 's' : ''} that payment, in order (Agreements rule 17, field 29).` });
  } else if (stakes.length) {
    lines.push({ text: 'No split service: each payer’s wallet pays each holder’s own pointer by the stakes (payer-side splitting, Agreements rule 16).' });
  }
  if (!lines.length) lines.push({ text: 'It divides no money: no stakes, no split plan, no fees.' });
  return { heading: 'Shares and fees', lines };
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
  if (!t.grammar) {
    lines.push(
      t.forkJudge
        ? { text: `The judge of forks is ${names(t.forkJudge)} (field 27): if two complete versions of the deal ever stand side by side, it settles them on a party’s request${then(t.forkJudge)} (Agreements rule 47).` }
        : { text: 'No judge of forks: if two complete versions of the deal ever stand side by side, only a version every party signs settles them (Agreements rule 47).', tone: 'warn' },
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
  if (t.grammar) {
    lines.push({ text: 'Any member can leave alone, at any time, by a resignation no one else signs, keeping what they own (Agreements rule 70).' });
    lines.push({ text: 'The collective ends by a fork, its members splitting into successors, or by a closing once it holds nothing and owes nothing (Agreements rule 91).' });
  } else {
    lines.push({ text: 'A deal has no closing act. It ends, or winds down, by a new version every party signs, stating where its stakes went, what is still owed, and, where it is a party of another agreement, to whom that one now pays (Agreements rule 47, F263).' });
    lines.push({ text: 'A party leaves only as its terms provide.' });
  }
  if (t.abandonment?.outcomes.includes(4)) lines.push({ text: `A declaration of absence may close it (Agreements rule 89, outcome 4: ${OUTCOMES[4]}).` });
  if ((t.stakes ?? []).length) {
    const r = t.releaseRule;
    lines.push({ text: `A stake ends if released to the public domain, which ${!r || r.form === 'all' ? 'every holder of it signs' : r.form === 'named' ? `${list((r.named ?? []).map(names))} sign` : `any ${r.threshold} of its holders sign`} (Agreements rule 55, field 24).` });
  }
  return { heading: 'How it ends', lines };
}

function owedSection(t: TermsRead, found?: Found | null): Section {
  const lines: Line[] = [];
  const service = !!(t.payeeGrants?.length || t.splitGrant);
  if (found) {
    lines.push(...(found.owed.length ? found.owed : [{ text: `Nothing owed under it, as far as ${list(found.at)} show.` }]));
  } else {
    lines.push({ text: 'The relays were not asked: no payment made under it is known here.' });
    if (service) lines.push({ text: 'What its split service receives and does not split, or splits and does not pay out, is that service’s open obligation, naming one receiver and this agreement (Agreements rule 30).' });
  }
  if (t.refund?.until != null) lines.push({ text: `A refund owed on a payment under it is claimable until ${t.refund.until} on its time reference; past that point it is ended (field 17, F219).` });
  else if (service || (t.stakes ?? []).length) lines.push({ text: 'No refund terms: a refund owed stays open until claimed (Agreements rule 11; the core sets no lapse, F80).' });
  lines.push({ text: 'A party who has not signed owes nothing under it: its obligations are shown as unsigned, never as open (Agreements rule 1, F74).' });
  return { heading: 'What is still owed', lines };
}

// ---------------------------------------------------------------- the flags

/** Who must sign whatever a power changes, from the terms (rules 47, 60, 65, 67): those named, or all, where the power needs all of them; nobody in particular where any k of more do. */
function mustSign(t: TermsRead, p: PowerOut): string[] {
  const rule = (r: { form: string; threshold?: number | null; named?: string[] | null } | null, among: string[]): string[] => {
    if (!r || r.form === 'all') return among;
    if (r.form === 'named') return r.named ?? [];
    return (r.threshold ?? 0) >= among.length ? among : [];
  };
  switch (p.form) {
    case 'clone':
      return rule(t.clone, t.parties);
    case 'constitutional':
      return rule(t.constitutional, t.parties);
    case 'judicial':
      return t.parties;
    case 'area': {
      const a = t.areas.find((x) => x.id === p.area);
      return a && a.threshold >= a.holders.length ? a.holders : [];
    }
    default:
      return [];
  }
}

/**
 * The identities whose signatures a change of terms field `field` (8, the
 * split plan; 28, the fees) needs, as the core library says: the powers it
 * asks of a version changing that field alone (`agreementsClonePlan`), and
 * those each power cannot do without. Null where the core cannot say.
 */
function signersFor(payload: Uint8Array, t: TermsRead, field: 8 | 28): Set<string> | null {
  const m = new Map(cborDecode(payload) as Map<number, unknown>);
  const mark = (x: string) => unhex(sha256(`deal assessment: a version changing field ${field}, ${x}`));
  m.set(11, mark('its parent'));
  m.set(4, [[[1], [...t.parties].sort().map(unhex)]]);
  if (field === 8) {
    const plan = m.get(8);
    if (plan instanceof Map) m.set(8, new Map([...plan, [7, 'a changed parameter']]));
    else m.set(8, new Map<number, unknown>([[0, [[2, unhex(t.parties[0]), 1]]], [1, mark('a split cMIP')]]));
  } else {
    m.set(28, [[mark('a fee Module'), 1]]);
  }
  try {
    const plan = agreementsClonePlan(payload, cborEncode(m), AGREEMENTS_SPECS) as { needs: PowerOut[] };
    return new Set(plan.needs.flatMap((p) => mustSign(t, p)));
  } catch {
    return null;
  }
}

/** The identified holders of every stake, once each, in order. */
function holders(t: TermsRead): string[] {
  const out: string[] = [];
  for (const [, hs] of t.stakes ?? []) for (const [h] of hs) if (h && !out.includes(h)) out.push(h);
  return out;
}

function flagsOf(t: TermsRead, payload: Uint8Array, names: Names): Flag[] {
  const out: Flag[] = [];
  const deal = !t.grammar;
  const who = (xs: string[]) => list(xs.map(names));
  const owners = holders(t);
  const a = t.abandonment;

  // A party with no exit (rule 47's stated cost): in a deal, every party
  // signs every change, so a party nobody can declare absent holds it.
  if (deal && t.parties.length > 1) {
    const stuck = uncovered(t);
    if (stuck.length) {
      out.push({
        code: 'no-exit',
        family: 'listed',
        who: stuck,
        text: `${who(stuck)} cannot be declared absent: if ${stuck.length === 1 ? 'that party goes' : 'any of them goes'} silent, nobody can change or end the deal, and no party can leave it.`,
        rests: 'Agreements rule 47 (was 45b), stated cost: “one silent party blocks every change to a deal, however large”; the way out is an abandonment clause removing an absent party’s voice (rule 89, outcome 0)',
      });
    }
  }

  // An uncapped fee: no maximum per payout (rule 25), or fees raised
  // without those who bear them (rule 28).
  {
    const why: string[] = [];
    const rests: string[] = [];
    let bearers: string[] = [];
    if (t.plan && !t.plan.maxRailFee) {
      why.push('the split plan states no maximum fee per payout, so a payout may lose any rail fee and nothing beyond a maximum becomes the service’s obligation');
      rests.push('Agreements rule 25 (was 24a): the split plan “states a maximum fee per payout”; Money rule 21');
    }
    if (owners.length) {
      const need = signersFor(payload, t, 28);
      bearers = need ? owners.filter((h) => !need.has(h)) : [];
      if (bearers.length) {
        why.push(`fees can be added or raised without ${who(bearers)}, who bear${bearers.length === 1 ? 's' : ''} them with every stake`);
        rests.push('Agreements rule 28 (was 27): fees come off the top of every stake, and their bearers consent by the power the fees field falls under, not each by their own signature');
      }
    }
    if (why.length) out.push({ code: 'uncapped-fee', family: 'listed', who: bearers.length ? bearers : undefined, text: `Uncapped fee: ${why.join('; and ')}.`, rests: rests.join('; ') });
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
        rests: 'Agreements rule 35 (was 34a), the chain of judgment, which every party signs; Agreements bar it for specifications only (“a judge never handles what it judges”, Q20), and let a party be the absence authority (rule 85)',
      });
    }
  }

  // No judge of forks.
  if (deal && t.parties.length > 1 && !t.forkJudge) {
    out.push({
      code: 'no-fork-judge',
      family: 'listed',
      text: 'No judge of forks: if two complete versions of the deal ever stand side by side, the deal stays on its reference until every party signs one settling version, and any party can keep it there.',
      rests: 'Agreements rule 47 (was 45b), field 27: “With no judge of forks named, the deal stays on its reference”; stated cost: “a party of either branch can refuse every settlement and keep the deal on its reference”',
    });
  }

  // A stake diluted, or ended, without its holder.
  if (owners.length) {
    const hit = new Set<string>();
    const why: string[] = [];
    const rests: string[] = [];
    const lose = (a?.outcomes ?? []).filter((o) => o === 1 || o === 2);
    if (a && lose.length) {
      const declared = a.authority === 'named' ? owners.filter((h) => t.parties.includes(h) && h !== a.identity) : owners.filter((h) => t.parties.includes(h));
      for (const h of declared) hit.add(h);
      why.push(`a party declared absent may have its stake ${list(lose.map((o) => (o === 1 ? 'shared among the remaining holders' : 'transferred to parties named or defined by role')))}, without signing`);
      rests.push('Agreements rule 48 (was 46): no stake reduced without its holder’s signature “unless the agreement pre-authorised it”; rule 89, outcomes 1 and 2');
    }
    const r = t.releaseRule;
    if (r && r.form !== 'all') {
      const need = new Set(r.form === 'named' ? (r.named ?? []) : []);
      const left = owners.filter((h) => !need.has(h));
      if (left.length) {
        for (const h of left) hit.add(h);
        why.push(`a stake can be released to the public domain, ending what it earns, without ${who(left)}`);
        rests.push('Agreements rule 55 (was 17), field 24: the release rule says which holders sign a release');
      }
    }
    const need = signersFor(payload, t, 8);
    const left = need ? owners.filter((h) => !need.has(h)) : [];
    if (left.length) {
      for (const h of left) hit.add(h);
      why.push(`the split plan, which sets what each stake is paid, can be changed without ${who(left)}`);
      rests.push('Agreements rules 45 and 48: a new version needs a holder’s signature to lower its share, not to change the split plan (field 8), which falls under its own power (rules 62 to 65; every party in a deal, rule 47)');
    }
    if (why.length) out.push({ code: 'dilutable-stake', family: 'listed', who: owners.filter((h) => hit.has(h)), text: `A stake can be diluted without its holder: ${why.join('; and ')}.`, rests: rests.join('; ') });
  }

  // Stated costs the terms' own clauses bring.
  if (a && !a.proof) {
    out.push({
      code: 'absence-on-word',
      family: 'stated cost',
      text: `Absence is on ${a.authority === 'named' ? `${names(a.identity ?? '')}’s` : 'the other members’'} word alone: no absence-proof cMIP checks it, and a party declared absent wrongly can only contest it, in public.`,
      rests: 'Agreements rule 87 (was 51), stated cost: a declaration is the authority’s judgment, “a stated cost the party accepted”; rule 85 (was 49), client conformance (F178)',
    });
  }
  if (owners.length) {
    if (t.payeeGrants?.length || t.splitGrant) {
      out.push({
        code: 'split-service-window',
        family: 'stated cost',
        text: 'A split service holds the money between receiving and paying out: after a stake is sold, a seller and the service acting together can keep paying the seller until the first split citing the sale.',
        rests: 'Agreements rule 10 (was 14), stated cost (the window after a transfer); rule 32 (was 31), the trust that remains',
      });
    } else {
      out.push({
        code: 'payer-side-split',
        family: 'stated cost',
        text: 'No split service: each payer divides its own payment, so a payer can pay some holders and not others, every holder’s pointer is visible to payers, and the payer decides who gets a leftover unit.',
        rests: 'Agreements rule 16 (was 18), stated cost (payer-side splitting); rule 9, stated cost (the payer decides tied units)',
      });
    }
  }
  return out;
}

/**
 * What a signing client shows of the tool before terms are signed, beside
 * its own reading (the collective client), or when terms arrive (the desk):
 * the shares and fees, and the risks. Empty where the payload is not terms
 * in Agreements' format: the client's own reading says why.
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
    { heading: 'Shares and fees', lines: lines('Shares and fees') },
    { heading: 'Risks, before you sign (the deal-assessment tool)', lines: lines('Risks') },
  ];
}
