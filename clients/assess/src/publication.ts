// The assessment tool, for a publication (Agreements type 6; round 9, F411):
// what it sells and at what price (its price tags), its owners read by
// reference to the ownership agreement it names, its partners and their
// labels, its split plan and its fees, its split service and its backups,
// how it ends; and its risks, each with the rule it rests on.
//
// The publication's fields are read by the core library, strictly
// (`readPublication`, S7i, F412): every check of the format that reads the
// payload alone applied, a payload that is not a publication in Agreements'
// format refused in the core's own words. Assess reads no field itself.
// Whether it counts, who has not signed, its latest versions and which tags
// count under it are the core's verdicts (`agreementsPublication`,
// `agreementsPublicationTip`, `agreementsTagUnder`), passed in `found` where
// the relays were asked (`gather.ts`). The owners are read from the
// ownership agreement's own terms by the core (`readTerms`), never from a
// copy.

import { readPublication } from '../../genesis/src/core.ts';
import { list, termsOf, type Line, type Names, type Plain, type Section, type TermsRead } from '../../collective/src/explain.ts';
import { A, pct, risksSection, unique, type Assessment, type Cite, type Flag } from './assess.ts';

/**
 * A publication's fields as the core's `readPublication` gives them (the
 * binding is typed `any`; this is its shape, nothing converted). Hashes in
 * hex; a field the payload leaves out is undefined.
 */
export interface PublicationRead {
  /** What it sells; absent in a split agreement (no field 0); empty in a version ending it. */
  sold?: { bake?: string; vow?: string; cmip?: string; params?: Uint8Array }[] | null;
  splitAgreement: boolean;
  /** The ownership agreement whose holders take the owners' line, by its founding version; absent: its drafter, the lone owner. */
  owners?: string | null;
  partners: { identity: string; share: number; label?: string | null }[];
  service: string;
  /** The split plan, in `agreementsPublication`'s shape. */
  plan: {
    /** By kind: a publication's plan carries role and metric shares. */
    shares: { kind: 'role' | 'metric' | 'stake' | 'receiver' | 'own'; role?: string; metric?: number; stake?: number; receiver?: string; part: number }[];
    cmip: string;
    unfilled: 'stakes' | 'held-open' | 'to';
    unfilledTo?: string | null;
    top: number[];
    serviceBearsRailFees: boolean;
    /** The maximum fee per payout: in millionths of the payout, or an absolute amount; absent where the plan states none. */
    maxRailFee?: { form: 'millionths' | 'absolute' | 'unread'; value: number; unit?: string | null } | null;
    metrics: [string, string][];
    /** No `scope`: on every payment. */
    fees: { module: string; part: number; scope?: 'bake' | 'rail' | null; of?: string | null }[];
  };
  words?: string | null;
  /** The time reference's cMIP, and its parameters' bytes. */
  time?: string | null;
  timeParams?: Uint8Array | null;
  /** The point past which it takes no payment: a number where it is one; its bytes whatever it is. */
  until?: number | null;
  untilCbor?: Uint8Array | null;
  refundUntil?: number | null;
  refundUntilCbor?: Uint8Array | null;
  cmips: [number, string][];
  designated?: string | null;
  backups: string[];
  failed?: Uint8Array | null;
}

/** What else the tool knows of a publication: who drafted it, the owners' terms, its price tags, the core's verdicts. */
export interface PublicationContext {
  /** Its drafter: the lone owner where it names no ownership agreement. */
  drafter?: string | null;
  /** The exact payload of the ownership agreement it names, in the version in force (its latest, `agreementsPublicationTip`), where held. */
  owners?: Uint8Array | null;
  /** Its price tags that count under it, latest versions (Money rule 18). */
  tags?: { id?: string; price: { unit: string; value: number } | null; payee: string; signer?: string }[];
  /** Words for a unit. */
  unit?: (unit: string, value: number) => string;
  /**
   * The person's own line for "Partners paid before the owners", as a
   * percentage of each payment (30 or "30%"): flagged where that much or
   * more comes off the top. Absent: half (`DEFAULT_PARTNERS_LINE`).
   */
  partnersLine?: number | string | null;
  /** The core's verdicts, where the relays were asked. */
  found?: { at: string[]; counts: boolean; unsigned: string[]; problems: string[]; latest: string[]; ends?: boolean } | null;
}

/** Every party of the publication, once each: the owners' side, each partner, the split service, each backup (rule 11). */
function partiesOf(p: PublicationRead, ownerSide: string): string[] {
  return [...new Set([ownerSide, ...p.partners.map((x) => x.identity), p.service, ...p.backups])];
}

/** What comes off the top of each payment before the owners' line, in millionths: partners, roles, metrics, fees on every payment. */
function offTop(p: PublicationRead): number {
  return (
    p.partners.reduce((s, x) => s + x.share, 0) +
    roles(p).reduce((s, x) => s + x.part, 0) +
    metrics(p).reduce((s, x) => s + x.part, 0) +
    p.plan.fees.filter((f) => !f.scope).reduce((s, x) => s + x.part, 0)
  );
}

/** The plan's role shares and metric shares, by kind as the core reads them. */
const roles = (p: PublicationRead) => p.plan.shares.filter((s) => s.kind === 'role').map((s) => ({ role: s.role ?? '', part: s.part }));
const metrics = (p: PublicationRead) => p.plan.shares.filter((s) => s.kind === 'metric').map((s) => ({ metric: s.metric ?? 0, part: s.part }));

/** The line "Partners paid before the owners" is flagged at by default, as a percentage: half of each payment (the suite's round 9, reading 1; kept in round 10, F415). */
export const DEFAULT_PARTNERS_LINE = 50;

/**
 * The person's line for "Partners paid before the owners", in millionths of
 * each payment: their percentage (a number, or text such as "30" or
 * "30%"), or half where none is set. Throws, in plain words, where it is
 * not a percentage above 0 and below 100, to at most four decimals (a
 * share is counted in millionths).
 */
export function partnersLine(setting?: number | string | null): number {
  if (setting === undefined || setting === null || setting === '') return DEFAULT_PARTNERS_LINE * 10_000;
  const text = typeof setting === 'string' ? setting.trim().replace(/\s*%$/, '') : String(setting);
  const n = typeof setting === 'number' ? setting : /^\d+(\.\d+)?$/.test(text) ? Number(text) : NaN;
  const m = Math.round(n * 10_000);
  if (!Number.isFinite(n) || n <= 0 || n >= 100 || Math.abs(m - n * 10_000) > 1e-6) {
    throw new Error(
      `The line for “Partners paid before the owners” is a percentage of each payment above 0 and below 100, such as 50 or 12.5 (at most four decimals), not “${String(setting)}”. At 100% nothing is left to the owners, which Assess always flags as “No owner”.`,
    );
  }
  return m;
}

/** The line used, in the warning's words: "half or more" at the default, "N% or more" otherwise. */
const lineWords = (line: number): string => (line === DEFAULT_PARTNERS_LINE * 10_000 ? 'half or more, the line this warning is set at' : `${pct(line)} or more, the line set for this warning`);

/** Explain and flag a publication, by its exact payload (or its fields already read). */
export function assessPublication(payload: Uint8Array | PublicationRead, names: Names, ctx: PublicationContext = {}): Assessment {
  const line = partnersLine(ctx.partnersLine);
  const p = payload instanceof Uint8Array ? (readPublication(payload) as PublicationRead) : payload;
  let owners: TermsRead | null = null;
  try {
    owners = ctx.owners ? termsOf(ctx.owners) : null;
  } catch {
    owners = null;
  }
  const split = p.splitAgreement;
  const drafter = ctx.drafter ?? null;
  const ownerSide = p.owners ?? drafter ?? '';
  const parties = partiesOf(p, ownerSide);
  const say = ctx.unit ?? ((u: string, v: number) => `${v} of ${names(u)}`);
  // A publication waiting for signatures is still judged: its risks are its terms', whoever has signed. The core's reasons it does not count are said under "Who signs".
  const problem: string | null = null;
  const flags = flagsOf(p, owners, names, parties, ownerSide, line);

  const sections: Section[] = [];
  // What it sells.
  {
    const lines: Line[] = [];
    if (split) {
      lines.push({ text: 'A split agreement: it sells nothing and takes no price tag; it divides what reaches its split service for the ownership agreement it names, whose target is a collective (Agreements rule 15).' });
      if (!p.owners) lines.push({ text: 'It names no ownership agreement: a split agreement naming none counts for nothing.', tone: 'bad' });
    } else if (!p.sold!.length) {
      lines.push({ text: 'This version sells nothing: it ends the publication. Past sales stand; a payment racing the ending is owed back (Agreements rule 11).', tone: 'warn' });
    } else {
      for (const s of p.sold!) {
        if (s.bake) lines.push({ text: `The upload ${names(s.bake)} (a bake): its bytes, its key delivered to each buyer once paid.` });
        else if (s.vow) lines.push({ text: `The vow ${names(s.vow)}, a promised delivery: each sale is pending until those who signed onto it confirm it, or a buyer contests it (Agreements rule 13).` });
        else lines.push({ text: `A proven delivery under the cMIP ${names(s.cmip ?? '')}: its proof is checked from data alone, never on the cMIP’s say-so (Agreements rule 11).` });
      }
    }
    if (p.untilCbor) lines.push({ text: `It takes no payment after ${p.until != null ? String(p.until) : 'a point its time reference’s cMIP reads'} on its time reference${p.time ? `, ${names(p.time)}` : ''}; a later payment is owed back (Agreements rule 11).` });
    if (p.refundUntilCbor) lines.push({ text: `A refund owed on a payment under it is claimable until ${p.refundUntil != null ? String(p.refundUntil) : 'a point its time reference’s cMIP reads'} on its time reference; past that, it is ended (Agreements rule 11).` });
    else if (!split) lines.push({ text: 'No refund terms: a refund owed stays open until claimed (Agreements rule 11; the core sets no lapse).' });
    sections.push({ heading: 'What it sells', lines });
  }
  // Its price.
  if (!split) {
    const lines: Line[] = [];
    const tags = ctx.tags ?? [];
    if (!tags.length) lines.push({ text: 'No price tag is known here. Its price is a price tag naming it, signed by its split service or the party it designates (Money rule 18).' });
    for (const t of tags) {
      if (!t.price) {
        lines.push({ text: `A price tag${t.id ? ` ${names(t.id)}` : ''}, withdrawn by its signer: it buys nothing now (Money rule 18).`, tone: 'warn' });
        continue;
      }
      const bypass = t.payee !== p.service;
      lines.push({
        text: `${say(t.price.unit, t.price.value)}, paid to ${names(t.payee)}${bypass ? ', not to its split service: a payment to it bypasses the service, and every other share of it is an open obligation of whoever received it (Agreements rule 16)' : ', its split service'}. A buyer pays exactly the price it states (Money rule 18).`,
        tone: bypass ? 'warn' : undefined,
      });
    }
    lines.push({ text: `Its tags are signed by its split service${p.designated ? ` or by ${names(p.designated)}, the party it designates (field 10)` : ''}: only theirs count, and either may withdraw one alone, stopping sales at that price at once (Agreements rule 11; Money rule 18).` });
    lines.push({ text: 'A buyer’s app follows the publication and its tag to their latest versions before paying (Agreements rule 11).' });
    sections.push({ heading: 'Its price', lines });
  }
  // The owners.
  {
    const lines: Line[] = [];
    if (!p.owners) {
      lines.push({ text: `A lone seller’s publication: it names no ownership agreement, so ${drafter ? names(drafter) : 'its drafter'}, who drafted it, takes the owners’ line alone, selling what they own alone (Agreements rule 11).` });
    } else {
      lines.push({ text: `The owners are the holders of the ownership agreement ${names(p.owners)}, read by reference at each payment in the version in force for its receipt, never a copy (Agreements rules 11, 12).` });
      if (owners) {
        const st = owners.stakes?.[0]?.[1] ?? [];
        const coll = owners.target?.[0] === 'collective';
        lines.push({ text: `${coll ? 'It is a collective’s constitution: the collective owns what this publication sells, and its income divides among its members and departed holders' : 'It is a work’s ownership agreement'}; its holders now: ${list(st.map(([x, n]) => `${x ? names(x) : 'the collective'} ${pct(n)}`))}.` });
        if (coll) {
          const r = owners.layers?.find(([l]) => l === 4)?.[1];
          const n = owners.parties.length;
          const k = !r || r.form === 'all' ? n : r.form === 'threshold' ? (r.threshold ?? n) : r.form === 'named' ? (r.named ?? []).length : n;
          lines.push({ text: `The collective signs it under its rule for Agreements: ${k >= n ? 'every member' : k === 1 ? 'any one member alone' : `any ${k} of its ${n} members`}, each with their own key, naming the collective (Agreements rules 11, 15, 60).` });
        } else {
          lines.push({ text: 'The agreement signs it as one party, consenting by its own rule: every party of it (Agreements rules 11, 15, 47).' });
        }
      } else {
        lines.push({ text: 'The ownership agreement itself is not held here: who its holders are is not known here.', tone: 'warn' });
      }
    }
    sections.push({ heading: 'The owners', lines });
  }
  // Partners.
  {
    const lines: Line[] = [];
    if (!p.partners.length) lines.push({ text: 'No partners: nobody but the owners takes a share named in advance.' });
    for (const x of p.partners) lines.push({ text: `${names(x.identity)}${x.label ? `, labelled “${x.label}”` : ', with no label'}: ${pct(x.share)} of each payment, off the top. The label is shown to every reader and decides nothing (Agreements, “Publication (type 6)”).` });
    sections.push({ heading: 'Partners and their labels', lines });
  }
  // The split plan and its fees.
  {
    const lines: Line[] = [];
    const top = offTop(p);
    for (const r of roles(p)) lines.push({ text: `The role “${r.role}”: ${pct(r.part)} of each payment, off the top, to whoever fills it, with evidence the payer acknowledges (Agreements rule 22).` });
    for (const m of metrics(p)) lines.push({ text: `Metric share ${m.metric}: ${pct(m.part)} of each payment, off the top, divided by a measure named in advance (Agreements rule 29).` });
    for (const f of p.plan.fees) lines.push({ text: `A fee: ${names(f.module)} takes ${pct(f.part)} of ${!f.scope ? 'every payment' : f.scope === 'bake' ? `payments for ${names(f.of ?? '')}` : `payments by the rail ${names(f.of ?? '')}`}, off the top, borne alike by every share (Agreements rule 28).` });
    if (roles(p).length) lines.push({ text: p.plan.unfilled === 'stakes' ? 'A role nobody fills goes to the owners’ line.' : p.plan.unfilled === 'held-open' ? 'A role nobody fills is held open, as an obligation.' : `A role nobody fills goes to ${names(p.plan.unfilledTo ?? '')}.` });
    lines.push({ text: `Off the top of each payment: ${pct(top)}${p.plan.fees.some((f) => f.scope) ? ', more on payments a scoped fee reaches' : ''}. What is left, ${pct(Math.max(0, 1_000_000 - top))}, is the owners’ line, divided by their shares (Agreements rule 22).` });
    const bearer = p.plan.serviceBearsRailFees ? 'The split service bears each payout’s rail fee' : 'Each receiver bears its payout’s rail fee';
    const m = p.plan.maxRailFee;
    lines.push(
      m
        ? { text: `${bearer}; no payout may lose more than ${m.form === 'millionths' ? `${pct(m.value)} of it` : say(m.unit ?? '', m.value)} to it, and a shortfall beyond is the service’s open obligation (Agreements rule 25).` }
        : { text: `${bearer}; the plan states no maximum fee per payout: there is no cap (Agreements rule 25).`, tone: 'warn' },
    );
    lines.push({ text: `The amounts are computed by the split cMIP ${names(p.plan.cmip)}; a verifier checks each split against this plan, payout by payout, and each payout is paid with its own receipt (Agreements rules 17, 23, 27).` });
    sections.push({ heading: 'The split plan and its fees', lines });
  }
  // The split service and its backups.
  {
    const lines: Line[] = [];
    lines.push({ text: `${names(p.service)} is its split service: every payment under it goes to the service’s own pointer; the service signs its receipt as itself, divides the payment by the plan, publishes the split to everyone it pays, and pays each payout, every receiver receipting their own (Agreements rules 16, 20, 23).` });
    if (p.backups.length) lines.push({ text: `If an attempt at the service fails, ${list(p.backups.map(names))} take${p.backups.length === 1 ? 's' : ''} that payment, in order; each is a party and signs it (Agreements rule 17).` });
    else lines.push({ text: 'No backup: if the service is away, nothing else takes a payment under it.' });
    sections.push({ heading: 'The split service and its backups', lines });
  }
  // Who signs, and how it ends.
  {
    const lines: Line[] = [];
    lines.push({ text: `Its parties: ${list(parties.filter(Boolean).map(names))}. It counts, and sells, once every one of them has signed it: its drafter by drafting it, each other by a signature act naming it (Agreements rule 11).` });
    if (ctx.found) {
      if (ctx.found.counts) lines.push({ text: `It counts, as far as ${list(ctx.found.at)} show.`, tone: 'ok' });
      else if (ctx.found.unsigned.length) lines.push({ text: `It does not count yet: ${list(ctx.found.unsigned.map(names))} ${ctx.found.unsigned.length === 1 ? 'has' : 'have'} not signed.`, tone: 'warn' });
      if (!ctx.found.counts) for (const x of ctx.found.problems) lines.push({ text: `Agreements: ${x}`, tone: 'warn' });
      if (ctx.found.latest.length > 1) lines.push({ text: `Its line stands forked: ${ctx.found.latest.length} latest versions; a purchase under any version counts (Agreements rule 11).`, tone: 'warn' });
    }
    lines.push({ text: 'It changes by later versions, each signed by every party of that version. It ends by a later version that sells nothing, signed by every party: no party ends it alone (Agreements rule 11).' });
    lines.push({ text: 'Its price tag’s signer can withdraw the tag alone, at once: the one-sided stop. Bakes it sells stay where they were uploaded unless homes and relays drop them (Money rule 18).' });
    sections.push({ heading: 'Who signs, and how it ends', lines });
  }
  sections.push(risksSection(flags, problem));

  const plain: Plain[] = p.words ? [{ heading: 'Its words, as signed', text: p.words }] : [];
  const kind = split ? 'split agreement' : 'publication';
  return {
    kind,
    title: split ? 'A split agreement, assessed' : 'A publication, assessed',
    summary: [
      split
        ? `A split agreement of ${p.owners ? names(p.owners) : 'no ownership agreement'}, its split service ${names(p.service)}.`
        : `A publication ${p.sold!.length ? `selling ${p.sold!.length === 1 ? 'one thing' : `${p.sold!.length} things`}` : 'ending its line'}, its owners ${p.owners ? `the holders of ${names(p.owners)}` : `its drafter${drafter ? `, ${names(drafter)}` : ''}, alone`}, ${p.partners.length ? `with ${p.partners.length === 1 ? 'one partner' : `${p.partners.length} partners`}` : 'with no partner'}, its split service ${names(p.service)}.`,
      problem ? 'Agreements do not count it as it stands.' : flags.length ? `${flags.length === 1 ? 'One risk' : `${flags.length} risks`} flagged, each with the rule it rests on.` : 'No risk flagged.',
    ],
    sections,
    plain,
    flags,
    problem,
  };
}

function flagsOf(p: PublicationRead, owners: TermsRead | null, names: Names, parties: string[], ownerSide: string, line: number): Flag[] {
  const out: Flag[] = [];
  const split = p.splitAgreement;
  const top = offTop(p);
  const who = (xs: string[]) => list(xs.map(names));
  const holders = (owners?.stakes?.[0]?.[1] ?? []).map(([x]) => x).filter((x): x is string => !!x);

  // A party with no exit: a publication changes and ends only by a later
  // version every party signs; one silent party keeps it as it stands.
  const others = parties.filter((x) => x && x !== ownerSide);
  if (others.length) {
    out.push({
      code: 'no-exit',
      family: 'listed',
      who: parties.filter(Boolean),
      text: `No party can change or end it alone: if any of ${who(parties.filter(Boolean))} goes silent, it can never be changed or ended${split ? '' : '; its price tag’s signer can still withdraw the tag, stopping sales at that price'}.`,
      rests: 'Agreements rule 11: a publication changes by later versions, each signed by every party of that version, and is ended by a later version selling nothing, signed by every party; a price tag’s withdrawal is its signer’s alone (Money rule 18)',
      cites: [...A(11), { mir: 'Money', rule: 18 }],
    });
  }

  // An uncapped fee (rule 25, client conformance: flagged before signing).
  if (!p.plan.maxRailFee) {
    out.push({
      code: 'uncapped-fee',
      family: 'listed',
      text: `Uncapped fee: the split plan states no maximum fee per payout, so ${p.plan.serviceBearsRailFees ? 'the service may pass any rail fee on' : 'any rail fee may come off each receiver’s payout'}, and no shortfall is the service’s obligation.`,
      rests: 'Agreements rule 25, client conformance: the split plan may state a maximum fee per payout; where it states none, there is no cap, and a client must flag the absence before a party signs; Money rule 21',
      cites: [...A(25), { mir: 'Money', rule: 21 }],
    });
  }

  // Money divided with no owner.
  if (split && (!p.owners || (owners && owners.target?.[0] !== 'collective'))) {
    out.push({
      code: 'no-owner',
      family: 'listed',
      text: `No owner: a split agreement ${p.owners ? 'naming a work’s ownership agreement' : 'naming no ownership agreement'} counts for nothing, so what reaches its service is divided for nobody.`,
      rests: 'Agreements, “Publication (type 6)”: a split agreement naming a work’s ownership agreement, or naming none, counts for nothing; rule 15',
      cites: A(15),
    });
  } else if (top >= 1_000_000) {
    out.push({
      code: 'no-owner',
      family: 'listed',
      text: `No owner: the shares off the top take ${pct(top)} of each payment, so nothing is left for the owners’ line.`,
      rests: 'Agreements rule 22: every share paying anyone but the owners is paid off the top, what is left going to the owners alone; a publication counts only where the partners’ shares and the plan’s fixed shares do not exceed 100% together (rule 11)',
      cites: A(22, 11),
    });
  }

  // Partners paid before the owners, with no cap but 100%: flagged from
  // the person's line, half by default (round 10, F415).
  if (top >= line && top < 1_000_000) {
    const takers = p.partners.map((x) => x.identity);
    out.push({
      code: 'partners-first',
      family: 'listed',
      who: takers.length ? takers : undefined,
      text: `Partners paid before the owners: ${pct(top)} of each payment is taken off the top (${list([...p.partners.map((x) => `${names(x.identity)}${x.label ? ` (${x.label})` : ''} ${pct(x.share)}`), ...roles(p).map((r) => `the role “${r.role}” ${pct(r.part)}`), ...metrics(p).map((m) => `metric ${m.metric} ${pct(m.part)}`), ...p.plan.fees.filter((f) => !f.scope).map((f) => `a fee ${pct(f.part)}`)])}), leaving the owners ${pct(1_000_000 - top)}: ${lineWords(line)}. Nothing caps it below 100%: only the parties’ signatures do.`,
      rests: 'Agreements rule 22: partners, role and metric shares and fees are paid off the top, the owners taking what is left; rule 11: the only cap is that they do not exceed 100% together',
      cites: A(22, 11),
    });
  }

  // A stake diluted without its holder: a collective's publication is
  // signed under its rule for Agreements, so what comes off the top of its
  // income is set without the holders outside that rule.
  if (owners && owners.target?.[0] === 'collective' && holders.length) {
    const r = owners.layers?.find(([l]) => l === 4)?.[1];
    const n = owners.parties.length;
    const k = !r || r.form === 'all' ? n : r.form === 'threshold' ? (r.threshold ?? n) : r.form === 'named' ? (r.named ?? []).length : n;
    const departed = holders.filter((x) => !owners!.parties.includes(x));
    if (k < n || departed.length) {
      out.push({
        code: 'dilutable-stake',
        family: 'listed',
        who: holders,
        text: `A stake can be diluted without its holder: the collective signs this publication under its rule for Agreements (${k >= n ? 'every member' : k === 1 ? 'any one member' : `any ${k} of ${n} members`}), so what comes off the top before every holder’s line${departed.length ? `, departed holders ${who(departed)} included,` : ''} is set without asking each holder.`,
        rests: 'Agreements rules 11 and 15: the owners’ side consents by its own rule, in a collective under its rule for Agreements (rule 60); rule 48 protects a stake against a version paying it less, not against a new publication',
        cites: A(11, 15, 60, 48),
      });
    }
  }

  // Stated cost: the split service holds others' money between receiving and paying out.
  const paidOthers = p.partners.some((x) => x.identity !== p.service) || roles(p).length > 0 || holders.some((x) => x !== p.service) || (!p.owners && ownerSide && ownerSide !== p.service);
  if (paidOthers) {
    out.push({
      code: 'split-service-window',
      family: 'stated cost',
      who: [p.service],
      text: `${names(p.service)}, the split service, holds other people’s money between receiving a payment and paying it out: MOR cannot prevent theft, only make it provable from the receipts.`,
      rests: 'Agreements rule 32, the trust that remains; rule 10, the window after a share is sold',
      cites: A(32, 10),
    });
  }
  return out.map((f) => ({ ...f, cites: unique(f.cites as Cite[]) }));
}

/** What a signing client shows of the tool before a publication is signed: its plan and the risks. Empty where the payload is not a publication; throws where `ctx.partnersLine` is refused. */
export function beforeSigningPublication(payload: Uint8Array, names: Names, ctx: PublicationContext = {}): Section[] {
  // A setting refused is said, never swallowed with a payload that is not a publication.
  partnersLine(ctx.partnersLine);
  let a: Assessment;
  try {
    a = assessPublication(payload, names, ctx);
  } catch {
    return [];
  }
  const lines = (h: string) => a.sections.find((s) => s.heading === h)?.lines ?? [];
  return [
    { heading: 'The split plan and its fees', lines: lines('The split plan and its fees') },
    { heading: 'Risks, before you sign (the assessment tool)', lines: lines('Risks') },
  ];
}

