// The click, run on Agreements draft 14 (docs/agreements-from-scratch/draft-14.md, branch
// claude/agreements-draft-14-0z0ah5, pull request 167) and the report block, proposal 2
// (docs/lead/proposals/report-block-2.md, branch claude/lead-records-2). A model of acts in memory;
// not the core's code. Run: node --experimental-strip-types cmips/sketches/click/click-14.ts
//
// What changed from click-12.ts: a report is ADDRESSED, to the other side of its own leg and no one
// else (11.6, R3); a call names no place and no reader. The buyer's own leg: the receiver confirms
// the payment to the buyer with no call written (11.7). The band signs its deal through a delegate,
// "under" the band's Terms (rule 5.1(b)). A partner sees further only along a data cMIP the people
// whose data it carries signed (11.6(a)). A buyer's contest reaches the agreement bought under, and
// its signers may contest their service (11.8).
//
// Where draft 14 leaves a choice open, the sketch runs both readings and says so (`Reading`).

import { createHash } from 'node:crypto';

type FP = string;
type Who = { signer: string } | { agreement: FP };
type Reading = {
  sides: 'paid-only' | 'paid-and-call-signers'; // item 9: are a call's signers, where not paid, a side?
  doerReport: 'whole' | 'own-line'; // item 9: does each receiver see every line, or only their own?
};

class World {
  acts = new Map<FP, any>();
  inboxes = new Map<string, any[]>(); // reports addressed to each identity
  put(a: any): any {
    const fp = createHash('sha256').update(JSON.stringify(a)).digest('hex').slice(0, 10);
    const act = { ...a, fp };
    this.acts.set(fp, act);
    return act;
  }
  get(fp: FP): any {
    return this.acts.get(fp);
  }
  send(r: any, to: string[]) {
    r.addressed_to = [...new Set([...(r.addressed_to ?? []), ...to])];
    for (const t of new Set(to)) {
      if (!this.inboxes.has(t)) this.inboxes.set(t, []);
      this.inboxes.get(t)!.push(r);
    }
  }
  inbox(who: string): any[] {
    return this.inboxes.get(who) ?? [];
  }
}
const P = (s: string): Who => ({ signer: s });
const A = (t: any): Who => ({ agreement: t.fp });
const nameOf = (w: World, x: Who) => ('signer' in x ? x.signer : w.get(x.agreement).label);

// The signers of Terms, one level (rule 1.2): the parties named as signers, and, for a party named as
// an agreement, that agreement's own signer parties (not deeper).
function signers(w: World, t: any, depth = 0): string[] {
  return (t.parties as Who[]).flatMap((p) => ('signer' in p ? [p.signer] : depth === 0 ? signers(w, w.get(p.agreement), 1) : []));
}

// ---- Money, stood in for.
const waiting = new Map<string, any[]>();
function pay(w: World, to: Who, amount: number, payer: string, relies: FP[]) {
  let at = to;
  while ('agreement' in at) at = w.get(at.agreement).receiver;
  const s = w.put({ type: 'settlement', payer, to: at.signer, amount, relies_on: relies });
  if (!waiting.has(at.signer)) waiting.set(at.signer, []);
  waiting.get(at.signer)!.push(s);
  return s;
}

// ---- A leg: Terms holding K8 (a deal, or a work whose receiver is one of its owners).
type Leg = { terms: any; work: any; doer: string; cmip: 'straight' | 'pooled' | 'minimum' | 'holder'; params: any; owed: Map<string, number>; misconfirm?: Record<string, number> };

function divide(total: number, shares: [Who, number][]) {
  const out = shares.map(([, s]) => Math.floor((total * s) / 1_000_000));
  const big = shares.reduce((b, [, s], i) => (s > shares[b][1] ? i : b), 0);
  out[big] += total - out.reduce((a, b) => a + b, 0);
  return out;
}

function runLeg(w: World, L: Leg, R: Reading): boolean {
  const inbox = waiting.get(L.doer) ?? [];
  if (!inbox.length) return false;
  waiting.set(L.doer, []);
  for (const batch of L.cmip === 'pooled' ? [inbox] : inbox.map((s) => [s])) {
    const total = batch.reduce((a, s) => a + s.amount, 0);
    const fee = L.cmip === 'straight' ? Math.min(total, L.params.flatFee) : L.cmip === 'pooled' ? Math.floor((total * L.params.feePermille) / 1000) : 0;
    const shares = L.work.shares as [Who, number][];
    const parts = divide(total - fee, shares);
    const passed: any[] = [];
    const owed: any[] = [];
    let own = 0;
    shares.forEach(([o], i) => {
      if (L.cmip === 'holder' && 'signer' in o && o.signer === L.doer) {
        own = parts[i];
        return;
      }
      const key = JSON.stringify(o);
      const amt = parts[i] + (L.owed.get(key) ?? 0);
      if (L.cmip === 'minimum' && amt < L.params.minPayout) {
        L.owed.set(key, amt);
        owed.push({ to: o, amount: amt });
        return;
      }
      L.owed.delete(key);
      if (amt) passed.push({ to: o, amount: amt, settlement: pay(w, o, amt, L.doer, [L.work.fp, L.terms.fp]).fp });
    });
    const call = L.terms.call; // { from: ['doer','receiver'] } or undefined
    if (!call) continue;
    const paidTo = passed.map((p) => w.get(p.settlement).to);
    const callSigners = R.sides === 'paid-and-call-signers' ? signers(w, L.terms).filter((s) => s !== L.doer) : [];
    if (call.from.includes('doer')) {
      const whole = { type: 'report', kind: 'leg', leg: L.terms.fp, signer: L.doer, relies_on: [L.terms.fp, ...batch.map((s) => s.fp)], received: batch.map((s) => ({ amount: s.amount, settlement: s.fp })), passed_on: passed, own_part: own, kept: fee, owed };
      if (R.doerReport === 'whole') w.send(w.put(whole), [...paidTo, ...callSigners]);
      else {
        // each receiver gets only its own line; the call's signers (if a side) get the whole
        for (const p of passed) w.send(w.put({ ...whole, passed_on: [p], owed: [], redacted: true }), [w.get(p.settlement).to]);
        if (callSigners.length) w.send(w.put(whole), callSigners);
      }
    }
    if (call.from.includes('receiver')) {
      for (const p of passed) {
        const s = w.get(p.settlement);
        const c = w.put({ type: 'report', kind: 'confirm', leg: L.terms.fp, signer: s.to, received: [{ amount: L.misconfirm?.[s.to] ?? s.amount, settlement: s.fp }] });
        w.send(c, [L.doer, ...callSigners]);
      }
    }
  }
  return true;
}

// ---- The scenario: a film, a song, a band (a collective signing by a delegate), a library.
type Opts = { clicks: number; amount: number; R: Reading; delegate?: boolean; undelivered?: boolean; songPerPayment?: boolean };

function build(o: Opts) {
  waiting.clear();
  const w = new World();
  const K8 = { from: ['doer', 'receiver'] };
  // The band: a collective whose Terms let a named delegate (mia) sign deals for it, and a majority
  // decide anything else (rule 5: powers).
  const band = w.put({ type: 'terms', label: 'the band', parties: [P('mia'), P('noor'), P('omar')], shares: [[P('mia'), 400_000], [P('noor'), 300_000], [P('omar'), 300_000]], powers: o.delegate ? [{ kind: 'sign-deals', rule: 'delegate:mia' }, { kind: 'other', rule: 'majority' }] : [] });
  const lib = w.put({ type: 'terms', label: 'the sound library', parties: [P('lea'), P('lou')], shares: [[P('lea'), 600_000], [P('lou'), 400_000]], receiver: P('lea'), call: K8 });
  const song = w.put({ type: 'terms', label: 'the song', parties: [A(band), P('pat')], shares: [[A(band), 700_000], [P('pat'), 300_000]] });
  const film = w.put({ type: 'terms', label: 'the film', parties: [P('dana'), P('eli'), A(song), A(lib)], shares: [[P('dana'), 500_000], [P('eli'), 200_000], [A(song), 200_000], [A(lib), 100_000]] });
  const dF = w.put({ type: 'terms', label: "the film's deal with svcA", parties: [P('svcA'), A(film)], receiver: P('svcA'), call: K8 });
  const dS = w.put({ type: 'terms', label: "the song's deal with svcB", parties: [P('svcB'), A(song)], receiver: P('svcB'), call: K8 });
  const dB = w.put({ type: 'terms', label: "the band's deal with svcC", parties: [P('svcC'), A(band)], receiver: P('svcC'), call: K8 });
  const dD = w.put({ type: 'terms', label: "the film's deal with svcD (delivery)", parties: [P('svcD'), A(film)], task: 'K9' });
  film.receiver = A(dF);
  song.receiver = A(dS);
  band.receiver = A(dB);
  // Signatures. The film's deal: svcA, and the film by its signers (dana, eli: one level).
  const sign = (t: any, who: string, extra: any = {}) => w.put({ type: 'statement', kind: 'assent', terms: t.fp, signer: who, ...extra });
  ['svcA', 'dana', 'eli'].forEach((x) => sign(dF, x));
  ['svcD', 'dana', 'eli'].forEach((x) => sign(dD, x));
  sign(dS, 'svcB');
  sign(dS, 'pat');
  // The song signs its deal as its Terms require: its signer parties (pat) and, one level, the band.
  // How the band signs: by all its members, or by its delegate "under" the band's Terms.
  const bandSigns = (t: any) => {
    if (o.delegate) return [sign(t, 'mia', { for: { agreement: band.fp }, under: band.fp })];
    return ['mia', 'noor', 'omar'].map((m) => sign(t, m));
  };
  // One level (rule 1.2): the song's deal is signed by svcB and the song's signer parties (pat).
  // The band, a party of the song named as an agreement, is not one of them, and does not sign.
  const bandOnSong: any[] = [];
  sign(dB, 'svcC');
  const bandOnDeal = bandSigns(dB);
  const legs: Leg[] = [
    { terms: dF, work: film, doer: 'svcA', cmip: 'straight', params: { flatFee: 10 }, owed: new Map() },
    { terms: dS, work: song, doer: 'svcB', cmip: o.songPerPayment ? 'straight' : 'pooled', params: { feePermille: 20, flatFee: 0 }, owed: new Map() },
    { terms: dB, work: band, doer: 'svcC', cmip: 'minimum', params: { minPayout: 50 }, owed: new Map() },
    { terms: lib, work: lib, doer: 'lea', cmip: 'holder', params: {}, owed: new Map() },
  ];
  // The buyer's leg (11.7): each payment confirmed by the receiver now of the film (svcA) to the buyer.
  const clicks: any[] = [];
  for (let i = 0; i < o.clicks; i++) {
    const s = pay(w, A(film), o.amount, `buyer${i + 1}`, [film.fp]);
    clicks.push(s);
    w.send(w.put({ type: 'report', kind: 'confirm', leg: 'buyer', signer: 'svcA', received: [{ amount: s.amount, settlement: s.fp }] }), [s.payer]);
    if (!o.undelivered) w.send(w.put({ type: 'delivery', signer: 'svcD', for: s.payer, settlement: s.fp }), [s.payer]);
  }
  for (let g = 0; g < 20; g++) if (!legs.map((L) => runLeg(w, L, o.R)).some(Boolean)) break;
  return { w, clicks, band, song, film, dF, dS, dB, dD, lib, bandOnSong, bandOnDeal };
}

// ---- What one seat holds: reports addressed to it, and settlements to or from it.
function seat(w: World, who: string): string[] {
  const out: string[] = [];
  const mine = w.inbox(who);
  const set = [...w.acts.values()].filter((a) => a.type === 'settlement' && (a.to === who || a.payer === who));
  for (const s of set.slice(0, 2)) out.push(`settlement: ${s.payer} → ${s.to}, ${s.amount}`);
  const uniq = new Map<string, any>();
  for (const r of mine) uniq.set(r.fp, r);
  for (const r of [...uniq.values()].slice(0, 6)) {
    if (r.type === 'delivery') {
      out.push(`access given by ${r.signer}`);
      continue;
    }
    const leg = r.leg === 'buyer' ? "the buyer's own leg" : w.get(r.leg).label;
    if (r.kind === 'confirm') out.push(`confirmation from ${r.signer} (${leg}): received ${r.received[0].amount}`);
    else if (r.kind === 'leg') out.push(`doer's report from ${r.signer} (${leg})${r.redacted ? ', own line only' : ''}: in ${r.received.reduce((a: number, x: any) => a + x.amount, 0)}, passed on ${r.passed_on.map((p: any) => `${nameOf(w, p.to)} ${p.amount}`).join(', ')}${r.own_part ? `, own part ${r.own_part}` : ''}, fee ${r.kept}${r.owed.length ? `, owed ${r.owed.map((x: any) => `${nameOf(w, x.to)} ${x.amount}`).join(', ')}` : ''}`);
    else if (r.type === 'delivery') out.push(`access given by ${r.signer}`);
  }
  if (uniq.size > 6) out.push(`… and ${uniq.size - 6} more`);
  const counts = new Map<string, number>();
  for (const l of out) counts.set(l, (counts.get(l) ?? 0) + 1);
  return [...counts].map(([l, n]) => (n > 1 ? `${l} (×${n}, one per payment)` : l));
}

// ---- The partner's data cMIP ("waterfall view", sketched only as far as its signatures).
// To show the partner that a given person was paid from a given work, it must carry, leg by leg,
// the report lines on the path. Whose data is in them, and so whose signature must cover the path?
function dataPath(w: World, b: ReturnType<typeof build>, target: string) {
  const path = [b.dF, b.dS, b.dB];
  const lines: string[] = [];
  const signersAll = new Set<string>();
  const subjectsWhole = new Set<string>();
  const subjectsPath = new Set<string>();
  for (const leg of path) {
    const doer = [...w.acts.values()].find((r) => r.kind === 'leg' && r.leg === leg.fp && !r.redacted);
    const paid = doer ? doer.passed_on.map((p: any) => w.get(p.settlement).to) : [];
    const next = leg === b.dB ? target : paid.find((p: string) => ['svcB', 'svcC'].includes(p));
    const sg = signers(w, leg);
    sg.forEach((x) => signersAll.add(x));
    [doer.signer, ...paid].forEach((x: string) => subjectsWhole.add(x));
    [doer.signer, next].forEach((x: string) => subjectsPath.add(x));
    lines.push(`${leg.label}: Terms signed by ${sg.join(', ')}; whole report is data about ${[doer.signer, ...paid].join(', ')}; the path's line about ${doer.signer}, ${next}`);
  }
  return { lines, signersAll: [...signersAll], subjectsWhole: [...subjectsWhole], subjectsPath: [...subjectsPath] };
}

const R0: Reading = { sides: 'paid-only', doerReport: 'whole' };
function block(title: string, body: string[]) {
  return [`\n## ${title}`, '```', ...body, '```'].join('\n');
}

const base = build({ clicks: 3, amount: 1000, R: R0 });
const del = build({ clicks: 3, amount: 1000, R: R0, delegate: true });
const small = build({ clicks: 3, amount: 100, R: R0 });
const own = build({ clicks: 3, amount: 1000, R: { sides: 'paid-only', doerReport: 'own-line' } });
const sides = build({ clicks: 3, amount: 1000, R: { sides: 'paid-and-call-signers', doerReport: 'whole' } });

const out: string[] = ['# The click, run on draft 14'];

// 1. Seats.
out.push(block("1. The buyer's seat (11.7)", seat(base.w, 'buyer1')));
out.push(block("2. A film owner's seat (she is paid in the film's leg)", seat(base.w, 'dana')));
out.push(block('3. The song\'s service (paid in the film\'s leg, so a side of it: it is shown the film\'s whole split)', seat(base.w, 'svcB')));
out.push(block('4. A band member\'s seat', seat(base.w, 'noor')));
out.push(block('5. The same, each receiver shown only its own line (draft 14 item 9, the other reading)', seat(own.w, 'noor')));
out.push(block('6. The producer, under the reading that a call\'s signers are a side (item 9)', seat(sides.w, 'pat')));
out.push(block('7. The same producer, under the reading that only those paid are a side', seat(base.w, 'pat')));

// 2. The collective signing through its delegate.
const viaDelegate = del.bandOnDeal[0];
out.push(block('8. The band signs its deal with svcC through its delegate', [
  `act: assent to "${del.dB.label}" signed by ${viaDelegate.signer}, for: ${JSON.stringify(viaDelegate.for)}, under: the band's Terms`,
  `the band's Terms give the power: ${JSON.stringify(del.band.powers[0])}`,
  `draft 14's \`for\` field holds "the person in whose name the act is made" (3.2); here it must hold an agreement (P17: "how an act names an agreement in \`for\`")`,
  `noor and omar are paid by svcC under a deal they did not sign themselves; they are bound by it only through the band's Terms they signed (rule 5.1(b))`,
  `noor's seat: ${seat(del.w, 'noor').join(' | ')}`,
  `noor "may inform the agreement she is under": to whom? the band has no inbox; its members are each a party; informing them is a path beyond her leg with svcC (11.6(a))`,
]));

// 3. The partner's data path.
const dp = dataPath(base.w, base, 'noor');
out.push(block("9. A partner of the film wants to see that noor was paid from the film's money: what the data cMIP's signatures must cover", [
  ...dp.lines,
  `11.6(b): Terms naming the data cMIP must be signed by each leg's people: ${dp.signersAll.join(', ')} (the band's by its own rule)`,
  `11.6(a): the people whose data it carries, if it carries whole reports: ${dp.subjectsWhole.join(', ')}`,
  `if it carries only the lines on the path: ${dp.subjectsPath.join(', ')}`,
  `the two lists differ: lea is in a whole report but signed none of these Terms; dana, eli, pat sign Terms but are not on noor's path`,
  `the band's leg, where its Terms let a majority decide: omar outvoted is read as the rule he signed (11.6(b))`,
]));

// 4. A contest on an undelivered purchase.
const und = build({ clicks: 1, amount: 1000, R: R0, undelivered: true });
const s = und.clicks[0];
const contest = und.w.put({ type: 'statement', kind: 'contest', agreement: und.film.fp, terms: und.film.fp, signer: 'buyer1', settlement: s.fp, content: 'not delivered' });
const reached = (und.film.parties as Who[]).filter((p) => 'signer' in p).map((p: any) => p.signer); // the film's signer parties: one level
const passOn = und.w.put({ type: 'statement', kind: 'contest', agreement: und.dD.fp, terms: und.dD.fp, signer: 'dana', answers: [contest.fp], content: 'your delivery failed' });
out.push(block('10. The buyer contests an undelivered purchase (11.8)', [
  `buyer1 holds: ${seat(und.w, 'buyer1').join(' | ')} (no access given)`,
  `contest made within ${und.film.label}, naming the version read and the payment`,
  `it reaches the film's signers, one level: ${reached.join(', ')}`,
  `not the song's or the library's people, not svcA (the split), not svcD (the delivery)`,
  `dana passes it on: a contest of her own within ${und.dD.label}, signed by the film (dana, eli) and svcD: reaches svcD`,
  `the buyer's money meanwhile went down every leg: the film's leg paid ${[...und.w.acts.values()].filter((a) => a.type === 'settlement' && a.payer === 'svcA').map((a) => a.to + ' ' + a.amount).join(', ')}`,
]));

// 5. 3d: a later payment of an owed line. Four small clicks, each passed on separately all the way.
const late = build({ clicks: 4, amount: 300, R: R0, songPerPayment: true });
const svcC = [...late.w.acts.values()].filter((a) => a.kind === 'leg' && a.signer === 'svcC');
out.push(block('11. 3d: money owed under the minimum, later paid (reading: only those paid are a side)', svcC.map((r) => `svcC: in ${r.received.reduce((a: number, x: any) => a + x.amount, 0)}, passed on ${r.passed_on.map((p: any) => nameOf(late.w, p.to) + ' ' + p.amount).join(', ') || 'nothing'}${r.owed.length ? `, owed ${r.owed.map((x: any) => nameOf(late.w, x.to) + ' ' + x.amount).join(', ')}` : ''}; addressed to: ${r.addressed_to?.join(', ') || 'NOBODY'}`).concat([
  'a report that only owes is addressed to nobody: under this reading the other side is whoever was paid, and nobody was',
  'a later payout carries old owed money and new money in one amount; nothing in K8\'s row says which part settles which earlier "owed" line',
])));
const late2 = build({ clicks: 4, amount: 300, R: { sides: 'paid-and-call-signers', doerReport: 'whole' }, songPerPayment: true });
const svcC2 = [...late2.w.acts.values()].filter((a) => a.kind === 'leg' && a.signer === 'svcC');
out.push(block('12. The same, reading that the call\'s signers are a side', svcC2.slice(0, 2).map((r) => `svcC: passed on ${r.passed_on.map((p: any) => nameOf(late2.w, p.to) + ' ' + p.amount).join(', ') || 'nothing'}${r.owed.length ? `, owed ${r.owed.map((x: any) => nameOf(late2.w, x.to) + ' ' + x.amount).join(', ')}` : ''}; addressed to: ${r.addressed_to?.join(', ') || 'NOBODY'}`)));

console.log(out.join('\n'));
