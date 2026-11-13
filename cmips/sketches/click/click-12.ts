// The click, run again on Agreements draft 12 (docs/agreements-from-scratch/draft-12.md, branch
// claude/agreements-draft-12, pull request 165) and the report block proposal
// (docs/lead/proposals/report-block-1.md, branch claude/lead-records-2).
// Not the core's code: a model of acts in memory, to see who can follow one click, from where.
// Run: node --experimental-strip-types cmips/sketches/click/click-12.ts
//
// What changed from click.ts (draft 10): a leg is Terms holding the Control task (K8) and its call
// (from the doer, from receivers, where each report is expected); the doer reports with amounts,
// kept and still owed (K8's row); each receiver confirms, tied by the settlement both name (11.4(b));
// reports go only where the call says, so a reader sees only the legs whose places it can read
// (11.6, "one leg"); a data cMIP ("waterfall view", sketched) adds a reader's place to a leg's call.

import { createHash } from 'node:crypto';

type FP = string;
type Who = { signer: string } | { agreement: FP };
type Amt = { amount: number; settlement: FP };
type Call = { task: 'K8'; from: ('doer' | 'receiver')[]; where: string[] };

class World {
  acts = new Map<FP, any>();
  places = new Map<string, any[]>(); // where reports are expected
  put(a: any): any {
    const fp = createHash('sha256').update(JSON.stringify(a)).digest('hex').slice(0, 10);
    const act = { ...a, fp };
    this.acts.set(fp, act);
    return act;
  }
  get(fp: FP): any {
    return this.acts.get(fp);
  }
  deliver(report: any, where: string[]) {
    for (const p of where) {
      if (!this.places.has(p)) this.places.set(p, []);
      this.places.get(p)!.push(report);
    }
  }
}

// ---- Agreements.
function terms(w: World, a: { label: string; parties: Who[]; shares?: [Who, number][]; receiver?: Who; k8?: string; params?: any; calls?: Call[]; signsBy?: string }) {
  return w.put({ type: 'terms', ...a, receiver: a.receiver ?? null, calls: a.calls ?? [] });
}
const P = (s: string): Who => ({ signer: s });
const A = (t: any): Who => ({ agreement: t.fp });

// The Terms that hold the Control task for passing on what reaches agreement `root` (rule 11.2):
// its deal, where its receiver is an agreement naming a K8 cMIP; or the agreement itself, where its
// receiver is one of its own parties and others have a part.
function legOf(w: World, root: FP): { terms: any; doer: string } | null {
  const t = w.get(root);
  const r = t.receiver as Who | null;
  if (!r) return null;
  if ('agreement' in r) {
    const d = w.get(r.agreement);
    return { terms: d, doer: (d.receiver as any).signer };
  }
  if (t.shares && t.shares.some(([o]: [Who]) => !('signer' in o) || o.signer !== r.signer)) return { terms: t, doer: r.signer };
  return null;
}

// Who signed a leg's Terms (rule 1.2): its signers, and an agreement party "as its own Terms
// require". nested=true reads that as every person beneath it; false, the agreement only (P17 open).
// depth 1: an agreement party signs by its own people (rule 1.2, "a small work by all its owners");
// nested: and so on through every agreement above them (P17: what that signing binds them to).
function signersOf(w: World, t: any, nested: boolean, depth = 0, seen = new Set<FP>()): Set<string> {
  const out = new Set<string>();
  for (const p of t.parties as Who[]) {
    if ('signer' in p) out.add(p.signer);
    else if ((nested || depth === 0) && !seen.has(p.agreement)) {
      seen.add(p.agreement);
      for (const s of signersOf(w, w.get(p.agreement), nested, depth + 1, seen)) out.add(s);
    }
  }
  return out;
}

// ---- Money, stood in for.
const waiting = new Map<string, any[]>();
function pay(w: World, to: Who, amount: number, payer: string, relies: FP[]): any {
  let at = to;
  while ('agreement' in at) {
    const r = w.get(at.agreement).receiver;
    if (!r) throw new Error('nowhere to pay');
    at = r;
  }
  const s = w.put({ type: 'settlement', payer, to: at.signer, amount, relies_on: relies });
  if (!waiting.has(at.signer)) waiting.set(at.signer, []);
  waiting.get(at.signer)!.push(s);
  return s;
}

// ---- One leg's exchange: the doer passes on and reports; each receiver confirms.
type Leg = { terms: any; work: any; doer: string; cmip: 'straight' | 'pooled' | 'minimum' | 'holder'; params: any; owed: Map<string, number>; silent?: boolean; silentReceivers?: string[]; misconfirm?: Record<string, number> };

function divide(total: number, shares: [Who, number][]): number[] {
  const out = shares.map(([, s]) => Math.floor((total * s) / 1_000_000));
  const largest = shares.reduce((b, [, s], i) => (s > shares[b][1] ? i : b), 0);
  out[largest] += total - out.reduce((a, b) => a + b, 0);
  return out;
}

function runLeg(w: World, L: Leg): boolean {
  const inbox = waiting.get(L.doer) ?? [];
  if (!inbox.length) return false;
  waiting.set(L.doer, []);
  const batches = L.cmip === 'pooled' ? [inbox] : inbox.map((s) => [s]);
  for (const batch of batches) {
    const total = batch.reduce((a, s) => a + s.amount, 0);
    const fee = L.cmip === 'straight' ? Math.min(total, L.params.flatFee) : L.cmip === 'pooled' ? Math.floor((total * L.params.feePermille) / 1000) : 0;
    const shares = L.work.shares as [Who, number][];
    const parts = divide(total - fee, shares);
    const passed: any[] = [];
    const owed: any[] = [];
    shares.forEach(([o], i) => {
      const key = JSON.stringify(o);
      if (L.cmip === 'holder' && 'signer' in o && o.signer === L.doer) return; // the holder's own part stays with them
      const amt = parts[i] + (L.owed.get(key) ?? 0);
      if (L.cmip === 'minimum' && amt < L.params.minPayout) {
        L.owed.set(key, amt);
        owed.push({ to: o, amount: amt });
        return;
      }
      L.owed.delete(key);
      if (!amt) return;
      const s = pay(w, o, amt, L.doer, [L.work.fp, L.terms.fp]);
      passed.push({ to: o, amount: amt, settlement: s.fp });
    });
    const call: Call | undefined = L.terms.calls.find((c: Call) => c.task === 'K8');
    if (!call) continue; // no report called for
    const own = L.cmip === 'holder' ? parts[shares.findIndex(([o]) => 'signer' in o && o.signer === L.doer)] : 0;
    if (call.from.includes('doer') && !L.silent) {
      const r = w.put({ type: 'report', kind: 'leg', answers: call, agreement: L.terms.fp, signer: L.doer, relies_on: [L.terms.fp, ...batch.map((s) => s.fp), ...passed.map((p) => p.settlement)], received: batch.map((s) => ({ amount: s.amount, settlement: s.fp })), passed_on: passed, kept: fee + own, owed });
      w.deliver(r, call.where);
    }
    if (call.from.includes('receiver')) {
      for (const p of passed) {
        const s = w.get(p.settlement);
        if (L.silentReceivers?.includes(s.to)) continue;
        const said = L.misconfirm?.[s.to] ?? s.amount;
        const r = w.put({ type: 'report', kind: 'confirm', answers: call, agreement: L.terms.fp, signer: s.to, relies_on: [s.fp], received: [{ amount: said, settlement: s.fp }] });
        w.deliver(r, call.where);
      }
    }
  }
  return true;
}

// ---- The reader: rule 11.4, from the places a reader can read (11.6).
type View = { line: string[]; reached: Map<string, string> };

function readClick(w: World, click: any, canRead: (place: string) => boolean): View {
  const v: View = { line: [], reached: new Map() };
  const reports = (place: string) => (canRead(place) ? w.places.get(place) ?? [] : []);
  // Walk settlement by settlement; at each, find the leg that receives it.
  const visit = (s: any, depth: number, viaLeg: string) => {
    const pad = '  '.repeat(depth);
    // Which Terms hold the passing on of what this settlement brought, if any (the landed signer as doer).
    const leg = [...w.acts.values()].find((t) => t.type === 'terms' && t.calls !== undefined && legDoer(w, t) === s.to);
    if (!leg) {
      v.reached.set(s.to, `${s.amount} sat, ${viaLeg}`);
      return;
    }
    const call: Call | undefined = leg.calls.find((c: Call) => c.task === 'K8');
    if (!call) {
      v.line.push(`${pad}${leg.label}: no report called for; beyond it, not shown`);
      v.reached.set(s.to, `${s.amount} sat reached ${s.to}, who holds for others (${leg.label}); no report called for`);
      return;
    }
    const readable = call.where.some(canRead);
    const rep = call.where.flatMap(reports).find((r: any) => r.kind === 'leg' && r.received.some((x: Amt) => x.settlement === s.fp));
    if (!rep) {
      v.line.push(`${pad}${leg.label}: ${readable ? 'UNANSWERED (the call was read; no doer report)' : 'NOT SHOWN to this reader (one leg)'}`);
      v.reached.set(s.to, `${s.amount} sat reached ${s.to} (doer of ${leg.label}); ${readable ? 'unanswered' : 'not shown'} beyond`);
      return;
    }
    if (leg.shares) v.reached.set(rep.signer, `kept own part as holder of ${leg.label}`);
    const share = s.amount / rep.received.reduce((a: number, x: Amt) => a + x.amount, 0);
    const owed = rep.owed.map((o: any) => `${nameOf(w, o.to)} ${o.amount}`).join(', ');
    v.line.push(`${pad}${leg.label}: ${rep.signer} reports ${rep.received.reduce((a: number, x: Amt) => a + x.amount, 0)} in, kept ${rep.kept}${owed ? `, still owed: ${owed}` : ''}${share < 1 ? `; this click is ${(share * 100).toFixed(0)}% of the batch (pro rata, not stated)` : ''}`);
    for (const p of rep.passed_on) {
      const conf = call.where.flatMap(reports).find((r: any) => r.kind === 'confirm' && r.received.some((x: Amt) => x.settlement === p.settlement));
      const tie = conf ? (conf.received[0].amount === p.amount ? 'matched' : `MISMATCHED (${conf.signer} confirms ${conf.received[0].amount})`) : 'one side only';
      v.line.push(`${pad}  → ${nameOf(w, p.to)}: ${p.amount} [${tie}]`);
      visit(w.get(p.settlement), depth + 2, `via ${leg.label}`);
    }
  };
  v.line.push(`click: ${click.amount} sat from ${click.payer}`);
  visit(click, 0, 'paid directly');
  return v;
}
function legDoer(w: World, t: any): string | null {
  if (!t.k8 && !(t.shares && t.receiver && 'signer' in t.receiver)) return null;
  if (t.k8) return (t.receiver as any).signer;
  return legOf(w, t.fp)?.doer ?? null;
}
function nameOf(w: World, x: Who): string {
  return 'signer' in x ? x.signer : w.get(x.agreement).label;
}

// ---- The scenario.
type Opts = { clicks: number; amount: number; bandHolder?: boolean; libCall?: boolean; silentSong?: boolean; view?: 'all-but-band' | 'all' | 'none'; misconfirm?: boolean; silentNoor?: boolean };

function build(o: Opts) {
  waiting.clear();
  const w = new World();
  const both = (place: string, data: boolean): Call => ({ task: 'K8', from: ['doer', 'receiver'], where: data ? [place, 'partner'] : [place] });
  const v = o.view ?? 'none';
  // Works (owners and shares), then the deals that hold K8, then each work names its deal.
  const band = terms(w, { label: 'the band', parties: [P('mia'), P('noor'), P('omar')], shares: [[P('mia'), 400_000], [P('noor'), 300_000], [P('omar'), 300_000]], receiver: o.bandHolder ? P('mia') : undefined, calls: o.bandHolder ? [both('band', v === 'all')] : [] });
  const lib = terms(w, { label: 'the sound library', parties: [P('lea'), P('lou')], shares: [[P('lea'), 600_000], [P('lou'), 400_000]], receiver: P('lea'), calls: o.libCall === false ? [] : [both('library', v !== 'none')] });
  const song = terms(w, { label: 'the song', parties: [A(band), P('pat')], shares: [[A(band), 700_000], [P('pat'), 300_000]] });
  const film = terms(w, { label: 'the film', parties: [P('dana'), P('eli'), A(song), A(lib)], shares: [[P('dana'), 500_000], [P('eli'), 200_000], [A(song), 200_000], [A(lib), 100_000]] });
  const dF = terms(w, { label: "the film's deal with svcA", parties: [P('svcA'), A(film)], receiver: P('svcA'), k8: 'straight', calls: [both('film-deal', v !== 'none')] });
  const dS = terms(w, { label: "the song's deal with svcB", parties: [P('svcB'), A(song)], receiver: P('svcB'), k8: 'pooled', calls: [both('song-deal', v !== 'none')] });
  const dB = o.bandHolder ? null : terms(w, { label: "the band's deal with svcC", parties: [P('svcC'), A(band)], receiver: P('svcC'), k8: 'minimum', calls: [both('band-deal', v === 'all')] });
  film.receiver = A(dF);
  song.receiver = A(dS);
  if (dB) band.receiver = A(dB);
  const legs: Leg[] = [
    { terms: dF, work: film, doer: 'svcA', cmip: 'straight', params: { flatFee: 10 }, owed: new Map() },
    { terms: dS, work: song, doer: 'svcB', cmip: 'pooled', params: { feePermille: 20 }, owed: new Map(), silent: o.silentSong },
    o.bandHolder
      ? { terms: band, work: band, doer: 'mia', cmip: 'holder', params: {}, owed: new Map(), misconfirm: o.misconfirm ? { noor: 100 } : undefined, silentReceivers: o.silentNoor ? ['noor'] : undefined }
      : { terms: dB!, work: band, doer: 'svcC', cmip: 'minimum', params: { minPayout: 50 }, owed: new Map() },
    { terms: lib, work: lib, doer: 'lea', cmip: 'holder', params: {}, owed: new Map() },
  ];
  const clicks = Array.from({ length: o.clicks }, (_, i) => pay(w, A(film), o.amount, `payer${i + 1}`, [film.fp]));
  for (let g = 0; g < 20; g++) if (!legs.map((L) => runLeg(w, L)).some(Boolean)) break;
  // Places each person can read: the places named by calls in Terms they signed (11.6).
  const legTerms = [dF, dS, dB, o.bandHolder ? band : null, lib].filter(Boolean);
  const placesFor = (who: string, nested: boolean) => new Set(legTerms.filter((t) => signersOf(w, t, nested).has(who) || (t.receiver as any)?.signer === who).flatMap((t) => t.calls.flatMap((c: Call) => c.where.filter((p) => p !== 'partner'))));
  return { w, click: clicks[0], placesFor };
}

// Up from a contributor: from what reached them, to the leg that paid it, and on up (11.4: "both ways").
function readUp(w: World, who: string, canRead: (place: string) => boolean): string[] {
  const all = [...w.places.entries()].filter(([p]) => canRead(p)).flatMap(([, r]) => r);
  const lines: string[] = [];
  const up = (settlement: FP, depth: number) => {
    const pad = '  '.repeat(depth);
    const rep = all.find((r: any) => r.kind === 'leg' && r.passed_on.some((x: any) => x.settlement === settlement));
    const st = w.get(settlement);
    if (!rep) {
      const isDoer = [...w.acts.values()].some((t) => t.type === 'terms' && legDoer(w, t) === st.payer);
      lines.push(isDoer ? `${pad}${st.payer} paid it on; under which leg, and from what: NOT SHOWN to this reader` : `${pad}paid in by ${st.payer}, a payer (Money's record, not a report)`);
      return;
    }
    lines.push(`${pad}paid by ${rep.signer} under ${w.get(rep.agreement).label}, from ${rep.received.reduce((a: number, x: Amt) => a + x.amount, 0)} received in ${rep.received.length} payment(s)`);
    up(rep.received[0].settlement, depth + 1);
    if (rep.received.length > 1) lines.push(`${pad}  (and ${rep.received.length - 1} more payment(s) in the same report)`);
  };
  const mine = [...w.acts.values()].filter((a) => a.type === 'settlement' && a.to === who);
  if (!mine.length) lines.push(`${who} received nothing`);
  for (const s of mine.slice(0, 1)) {
    lines.push(`${who} received ${s.amount} sat (settlement ${s.fp})`);
    up(s.fp, 1);
  }
  return lines;
}
function callStatus(w: World, seat: string, canRead: (place: string) => boolean): string[] {
  // A call is in signed Terms, so anyone reads that it exists (11.4(e)); its reports only where it says (11.6).
  return [...w.acts.values()].filter((t) => t.type === 'terms' && t.calls?.length).map((t) => {
    const c: Call = t.calls[0];
    const head = `${t.label}: calls for reports from ${c.from.join(' and ')}`;
    if (!c.where.some(canRead)) return `${head}; whether answered: NOT SHOWN to ${seat}`;
    const reps = c.where.filter(canRead).flatMap((p) => w.places.get(p) ?? []);
    const doer = reps.filter((r: any) => r.kind === 'leg').length;
    const conf = reps.filter((r: any) => r.kind === 'confirm').length;
    return `${head}; doer's reports: ${doer || 'UNANSWERED'}; receivers' confirmations: ${conf}`;
  });
}

const people = ['dana', 'eli', 'pat', 'mia', 'noor', 'omar', 'lea', 'lou'];
function show(title: string, o: Opts, seat: string, nested = false, way: 'down' | 'up' | 'calls' = 'down') {
  const { w, click, placesFor } = build(o);
  const can = seat === 'everyone' ? () => true : seat === 'partner' ? (p: string) => p === 'partner' : (p: string) => placesFor(seat, nested).has(p);
  const how = seat === 'everyone' ? '' : seat === 'partner' ? ' (reads only what the legs agreed to send it)' : ` (reads the places of the legs it signed${nested ? ', its signature counted through every agreement above it' : ', and those its own agreements signed'})`;
  const out = [`\n## ${title}`, `Seat: **${seat}**${how}. ${o.clicks} click(s) of ${o.amount} sat.`];
  if (way === 'down') {
    const v = readClick(w, click, can);
    out.push('Down from click 1:', '```', ...v.line, '```');
    const got = people.filter((p) => v.reached.has(p));
    out.push(`Shown reached, to this seat: ${got.length ? got.join(', ') : 'nobody'}. Not shown: ${people.filter((p) => !v.reached.has(p)).join(', ') || 'nobody'}.`);
  } else if (way === 'up') {
    out.push('Up from what reached this seat:', '```', ...readUp(w, seat, can), '```');
  } else out.push('The calls this seat can see:', '```', ...callStatus(w, seat, can), '```');
  return out.join('\n');
}

console.log([
  '# The click, run on draft 12',
  show('1. Every leg calls for both halves; a reader who holds every report', { clicks: 3, amount: 1000 }, 'everyone'),
  show('2. The payer, after paying', { clicks: 3, amount: 1000 }, 'payer1'),
  show('3. The payer, before paying: which legs called for reports', { clicks: 3, amount: 1000 }, 'payer1', false, 'calls'),
  show('4. A film owner', { clicks: 3, amount: 1000 }, 'dana'),
  show('5. A band member, reading up', { clicks: 3, amount: 1000 }, 'mia', false, 'up'),
  show('6. The same band member, her signature counted through every agreement above her (P17)', { clicks: 3, amount: 1000 }, 'mia', true, 'up'),
  show('7. The song\'s service gives no report; a reader who holds every report', { clicks: 3, amount: 1000, silentSong: true }, 'everyone'),
  show('8. The same, seen by the producer, who signed the song and so its deal', { clicks: 3, amount: 1000, silentSong: true }, 'pat', false, 'calls'),
  show('9. Small clicks: the band\'s service holds what is under its minimum', { clicks: 3, amount: 100 }, 'everyone'),
  show('10. A band member receives for the band (the answer to 3g); one bandmate confirms a different amount', { clicks: 3, amount: 1000, bandHolder: true, misconfirm: true }, 'everyone'),
  show('11. A partner of the film, with a waterfall view every leg agreed to except the band\'s', { clicks: 3, amount: 1000, view: 'all-but-band' }, 'partner'),
  show('12. The same partner, every leg agreed', { clicks: 3, amount: 1000, view: 'all' }, 'partner'),
].join('\n'));
