// The assessment tool, for a publication (Agreements type 6; round 9, F411):
// what it sells and at what price (its price tags), its owners read by
// reference to the ownership agreement it names, its partners and their
// labels, its split plan and its fees, its split service and its backups,
// how it ends; and its risks, each with the rule it rests on.
//
// The publication's fields are read from its exact payload, field by field
// as Agreements draft 17 writes them ("Publication (type 6)", "Split plan
// and split (type 8)"): a reading, deciding nothing. Whether it counts, who
// has not signed, its latest versions and which tags count under it are
// the core's verdicts (`agreementsPublication`, `agreementsPublicationTip`,
// `agreementsTagUnder`), passed in `found` where the relays were asked
// (`gather.ts`). The owners are read from the ownership agreement's own
// terms by the core (`readTerms`), never from a copy.

import { cborDecode, hex } from '../../genesis/src/core.ts';
import { list, termsOf, type Line, type Names, type Plain, type Section, type TermsRead } from '../../collective/src/explain.ts';
import { A, cap, pct, risksSection, unique, type Assessment, type Cite, type Flag } from './assess.ts';

/** A publication's fields, as read from its payload. */
export interface PublicationFields {
  /** What it sells; null in a split agreement (no field 0); empty in a version ending it. */
  sold: ({ bake: string } | { vow: string } | { cmip: string })[] | null;
  /** The ownership agreement whose holders take the owners' line, by its founding version; null: its drafter, the lone owner. */
  owners: string | null;
  partners: { identity: string; share: number; label: string | null }[];
  service: string;
  plan: {
    roles: { role: string; part: number }[];
    metrics: { metric: number; part: number }[];
    cmip: string;
    unfilled: 'owners' | 'held-open' | 'to';
    unfilledTo: string | null;
    serviceBearsRailFees: boolean;
    /** The maximum fee per payout: in millionths of the payout, or an absolute amount; null where the plan states none. */
    maxRailFee: { millionths: number } | { unit: string; value: number } | null;
    fees: { module: string; part: number; scope: 'every' | 'bake' | 'rail'; of: string | null }[];
  };
  words: string | null;
  /** The time reference's cMIP, its deadline and its refund point, where present. */
  time: string | null;
  until: unknown;
  refundUntil: unknown;
  cmips: [number, string][];
  designated: string | null;
  backups: string[];
}

const h = (x: unknown): string => {
  if (!(x instanceof Uint8Array)) throw new Error('a hash was expected');
  return hex(x);
};
const arr = (x: unknown): unknown[] => (Array.isArray(x) ? x : []);

/** Read a publication's fields from its exact payload. Throws where it is not a publication in Agreements' format, as far as these fields go. */
export function readPublicationPayload(payload: Uint8Array): PublicationFields {
  const m = cborDecode(payload);
  if (!(m instanceof Map)) throw new Error('not a publication: its payload is no map');
  const plan = m.get(4);
  if (!(plan instanceof Map)) throw new Error('not a publication: it carries no split plan (field 4)');
  const shares = arr(plan.get(0));
  const max = plan.get(6);
  const unfilled = arr(plan.get(3));
  const time = arr(m.get(6));
  const refund = m.get(8);
  return {
    sold: m.has(0)
      ? arr(m.get(0)).map((x) => {
          const s = arr(x);
          if (s[0] === 0) return { bake: h(s[1]) };
          if (s[0] === 3) return { vow: h(s[1]) };
          return { cmip: h(arr(s[1])[0]) };
        })
      : null,
    owners: m.has(1) ? h(m.get(1)) : null,
    partners: arr(m.get(2)).map((p) => {
      if (!(p instanceof Map)) throw new Error('not a publication: a partner is no map');
      return { identity: h(p.get(0)), share: Number(p.get(1) ?? 0), label: typeof p.get(2) === 'string' ? (p.get(2) as string) : null };
    }),
    service: h(m.get(3)),
    plan: {
      roles: shares.filter((s) => arr(s)[0] === 1).map((s) => ({ role: String(arr(s)[1]), part: Number(arr(s)[2]) })),
      metrics: shares.filter((s) => arr(s)[0] === 3).map((s) => ({ metric: Number(arr(s)[1]), part: Number(arr(s)[2]) })),
      cmip: h(plan.get(1)),
      unfilled: unfilled[0] === 1 ? 'held-open' : unfilled[0] === 2 ? 'to' : 'owners',
      unfilledTo: unfilled[0] === 2 ? h(unfilled[1]) : null,
      serviceBearsRailFees: plan.get(5) === 1,
      maxRailFee: typeof max === 'number' ? { millionths: max } : Array.isArray(max) ? { unit: h(max[0]), value: Number(max[1]) } : null,
      fees: arr(plan.get(9)).map((f) => {
        const x = arr(f);
        const sc = arr(x[2]);
        return { module: h(x[0]), part: Number(x[1]), scope: sc[0] === 0 ? ('bake' as const) : sc[0] === 1 ? ('rail' as const) : ('every' as const), of: sc.length ? h(sc[1]) : null };
      }),
    },
    words: typeof m.get(5) === 'string' ? (m.get(5) as string) : null,
    time: time.length ? h(time[0]) : null,
    until: m.get(7) ?? null,
    refundUntil: refund instanceof Map ? (arr(refund.get(0))[1] ?? null) : null,
    cmips: m.get(9) instanceof Map ? [...(m.get(9) as Map<number, unknown>)].map(([k, v]) => [Number(k), h(v)] as [number, string]) : [],
    designated: m.has(10) ? h(m.get(10)) : null,
    backups: arr(m.get(11)).map(h),
  };
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
  /** The core's verdicts, where the relays were asked. */
  found?: { at: string[]; counts: boolean; unsigned: string[]; problems: string[]; latest: string[]; ends?: boolean } | null;
}

/** Every party of the publication, once each: the owners' side, each partner, the split service, each backup (rule 11). */
function partiesOf(p: PublicationFields, ownerSide: string): string[] {
  return [...new Set([ownerSide, ...p.partners.map((x) => x.identity), p.service, ...p.backups])];
}

/** What comes off the top of each payment before the owners' line, in millionths: partners, roles, metrics, fees on every payment. */
function offTop(p: PublicationFields): number {
  return (
    p.partners.reduce((s, x) => s + x.share, 0) +
    p.plan.roles.reduce((s, x) => s + x.part, 0) +
    p.plan.metrics.reduce((s, x) => s + x.part, 0) +
    p.plan.fees.filter((f) => f.scope === 'every').reduce((s, x) => s + x.part, 0)
  );
}

/** Explain and flag a publication, by its exact payload (or its fields already read). */
export function assessPublication(payload: Uint8Array | PublicationFields, names: Names, ctx: PublicationContext = {}): Assessment {
  const p = payload instanceof Uint8Array ? readPublicationPayload(payload) : payload;
  let owners: TermsRead | null = null;
  try {
    owners = ctx.owners ? termsOf(ctx.owners) : null;
  } catch {
    owners = null;
  }
  const split = p.sold === null;
  const drafter = ctx.drafter ?? null;
  const ownerSide = p.owners ?? drafter ?? '';
  const parties = partiesOf(p, ownerSide);
  const say = ctx.unit ?? ((u: string, v: number) => `${v} of ${names(u)}`);
  // A publication waiting for signatures is still judged: its risks are its terms', whoever has signed. The core's reasons it does not count are said under "Who signs".
  const problem: string | null = null;
  const flags = flagsOf(p, owners, names, parties, ownerSide);

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
        if ('bake' in s) lines.push({ text: `The upload ${names(s.bake)} (a bake): its bytes, its key delivered to each buyer once paid.` });
        else if ('vow' in s) lines.push({ text: `The vow ${names(s.vow)}, a promised delivery: each sale is pending until those who signed onto it confirm it, or a buyer contests it (Agreements rule 13).` });
        else lines.push({ text: `A proven delivery under the cMIP ${names(s.cmip)}: its proof is checked from data alone, never on the cMIP’s say-so (Agreements rule 11).` });
      }
    }
    if (p.until != null) lines.push({ text: `It takes no payment after ${String(p.until)} on its time reference${p.time ? `, ${names(p.time)}` : ''}; a later payment is owed back (Agreements rule 11).` });
    if (p.refundUntil != null) lines.push({ text: `A refund owed on a payment under it is claimable until ${String(p.refundUntil)} on its time reference; past that, it is ended (Agreements rule 11).` });
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
    for (const r of p.plan.roles) lines.push({ text: `The role “${r.role}”: ${pct(r.part)} of each payment, off the top, to whoever fills it, with evidence the payer acknowledges (Agreements rule 22).` });
    for (const m of p.plan.metrics) lines.push({ text: `Metric share ${m.metric}: ${pct(m.part)} of each payment, off the top, divided by a measure named in advance (Agreements rule 29).` });
    for (const f of p.plan.fees) lines.push({ text: `A fee: ${names(f.module)} takes ${pct(f.part)} of ${f.scope === 'every' ? 'every payment' : f.scope === 'bake' ? `payments for ${names(f.of ?? '')}` : `payments by the rail ${names(f.of ?? '')}`}, off the top, borne alike by every share (Agreements rule 28).` });
    if (p.plan.roles.length) lines.push({ text: p.plan.unfilled === 'owners' ? 'A role nobody fills goes to the owners’ line.' : p.plan.unfilled === 'held-open' ? 'A role nobody fills is held open, as an obligation.' : `A role nobody fills goes to ${names(p.plan.unfilledTo ?? '')}.` });
    lines.push({ text: `Off the top of each payment: ${pct(top)}${p.plan.fees.some((f) => f.scope !== 'every') ? ', more on payments a scoped fee reaches' : ''}. What is left, ${pct(Math.max(0, 1_000_000 - top))}, is the owners’ line, divided by their shares (Agreements rule 22).` });
    const bearer = p.plan.serviceBearsRailFees ? 'The split service bears each payout’s rail fee' : 'Each receiver bears its payout’s rail fee';
    const m = p.plan.maxRailFee;
    lines.push(
      m
        ? { text: `${bearer}; no payout may lose more than ${'millionths' in m ? `${pct(m.millionths)} of it` : say(m.unit, m.value)} to it, and a shortfall beyond is the service’s open obligation (Agreements rule 25).` }
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

function flagsOf(p: PublicationFields, owners: TermsRead | null, names: Names, parties: string[], ownerSide: string): Flag[] {
  const out: Flag[] = [];
  const split = p.sold === null;
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

  // Partners paid before the owners, with no cap but 100%.
  if (top >= 500_000 && top < 1_000_000) {
    const takers = p.partners.map((x) => x.identity);
    out.push({
      code: 'partners-first',
      family: 'listed',
      who: takers.length ? takers : undefined,
      text: `Partners paid before the owners: ${pct(top)} of each payment is taken off the top (${list([...p.partners.map((x) => `${names(x.identity)}${x.label ? ` (${x.label})` : ''} ${pct(x.share)}`), ...p.plan.roles.map((r) => `the role “${r.role}” ${pct(r.part)}`), ...p.plan.metrics.map((m) => `metric ${m.metric} ${pct(m.part)}`), ...p.plan.fees.filter((f) => f.scope === 'every').map((f) => `a fee ${pct(f.part)}`)])}), leaving the owners ${pct(1_000_000 - top)}. Nothing caps it below 100%: only the parties’ signatures do.`,
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
  const paidOthers = p.partners.some((x) => x.identity !== p.service) || p.plan.roles.length > 0 || holders.some((x) => x !== p.service) || (!p.owners && ownerSide && ownerSide !== p.service);
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

/** What a signing client shows of the tool before a publication is signed: its plan and the risks. Empty where the payload is not a publication. */
export function beforeSigningPublication(payload: Uint8Array, names: Names, ctx: PublicationContext = {}): Section[] {
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

