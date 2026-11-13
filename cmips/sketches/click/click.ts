// The click, sketched on Agreements draft 10 (docs/agreements-from-scratch/draft-10.md, branch
// claude/agreements-draft-10). Not the core's code and not a product: a model of acts in memory,
// three split-service cMIPs (sketches), and a reader of rule 11.4, to see whether one click reaches
// everyone. Run: node --experimental-strip-types cmips/sketches/click/click.ts
//
// Assumptions this sketch has to make, because draft 10 leaves them open (each is a finding in
// README.md): an amount is whole units on one rail ("sat"); a leg report's `passed_on` entry
// carries, as its "what", the amount and the settlement of the payout (P20); a Terms act's shares
// are in its body, read by the service's cMIP (K1, K4); one version per agreement (no forks).

import { createHash } from 'node:crypto';

type FP = string;
type Who = { signer: string } | { agreement: FP };
type Entry = { to: Who; amount: number; settlement: FP };
type Act = Record<string, any> & { fp: FP; type: 'terms' | 'statement' | 'settlement'; signer: string };

class World {
  acts = new Map<FP, Act>();
  put(a: Omit<Act, 'fp'>): Act {
    const fp = createHash('sha256').update(JSON.stringify(a)).digest('hex').slice(0, 12);
    const act = { ...a, fp } as Act;
    this.acts.set(fp, act);
    return act;
  }
  get(fp: FP): Act {
    const a = this.acts.get(fp);
    if (!a) throw new Error('no act ' + fp);
    return a;
  }
  // One version per agreement in this sketch: the root is the version in force.
  receiverNow(root: FP): Who {
    return this.get(root).receiver;
  }
  reports(): Act[] {
    return [...this.acts.values()].filter((a) => a.type === 'statement' && a.passed_on);
  }
  name(w: Who): string {
    if ('signer' in w) return w.signer;
    return this.get(w.agreement).label;
  }
}

// ---- The Money layer, stood in for: paying a Who lands on a signer, following receivers (rule 1.4).
const inbox = new Map<string, Act[]>(); // service signer -> settlements waiting

function pay(w: World, to: Who, amount: number, payer: string, reliesOn: FP[]): Act {
  let at: Who = to;
  const path: FP[] = [];
  while ('agreement' in at) {
    if (path.includes(at.agreement)) throw new Error('receiver loop');
    path.push(at.agreement);
    at = w.receiverNow(at.agreement);
  }
  const s = w.put({ type: 'settlement', signer: 'rail', payer, to: at.signer, amount, unit: 'sat', relies_on: [...reliesOn, ...path] });
  if (!inbox.has(at.signer)) inbox.set(at.signer, []);
  inbox.get(at.signer)!.push(s);
  return s;
}

// ---- Agreements: a work (owners with shares), a deal (a service and a work as a party).
function work(w: World, label: string, author: string, shares: [Who, number][], receiver?: Who): Act {
  return w.put({ type: 'terms', signer: author, label, parties: shares.map(([p]) => p), authors: [author], body: { shares }, receiver: receiver ?? null });
}
function deal(w: World, service: string, cmip: string, workRoot: FP, params: Record<string, number>): Act {
  return w.put({ type: 'terms', signer: service, label: `${w.get(workRoot).label}'s deal with ${service}`, parties: [{ signer: service }, { agreement: workRoot }], authors: [service], body: { cmip, params }, receiver: { signer: service } });
}
// Works name their receiver after the deal exists; a sketch shortcut for "a new version naming it".
function setReceiver(w: World, workRoot: FP, to: Who) {
  w.get(workRoot).receiver = to;
}

// ---- Split-service cMIPs (sketches; README.md describes each).
type Service = { signer: string; deal: Act; work: Act; cmip: string; params: Record<string, number>; carried: Map<string, number>; silent?: boolean; statesReceived?: number; namesReceiverNow: boolean };

function divide(total: number, shares: [Who, number][]): number[] {
  const out = shares.map(([, s]) => Math.floor((total * s) / 1_000_000));
  let rest = total - out.reduce((a, b) => a + b, 0);
  const largest = shares.reduce((bi, [, s], i) => (s > shares[bi][1] ? i : bi), 0);
  out[largest] += rest;
  return out;
}

function upstreamReport(w: World, settlement: FP): Act | undefined {
  return w.reports().find((r) => (r.passed_on as Entry[]).some((e) => e.settlement === settlement));
}

function run(w: World, s: Service) {
  const waiting = inbox.get(s.signer) ?? [];
  if (waiting.length === 0) return false;
  inbox.set(s.signer, []);
  const batches = s.cmip === 'straight' ? waiting.map((x) => [x]) : [waiting];
  for (const batch of batches) {
    const total = batch.reduce((a, x) => a + x.amount, 0);
    const fee = s.cmip === 'straight' ? Math.min(total, s.params.flatFee) : Math.floor((total * (s.params.feePermille ?? 0)) / 1000);
    const shares = s.work.body.shares as [Who, number][];
    const parts = divide(total - fee, shares);
    const entries: Entry[] = [];
    shares.forEach(([owner], i) => {
      const key = JSON.stringify(owner);
      let amt = parts[i] + (s.carried.get(key) ?? 0);
      if (s.cmip === 'minimum' && amt < s.params.minPayout) {
        s.carried.set(key, amt);
        return;
      }
      s.carried.delete(key);
      if (amt === 0) return;
      const st = pay(w, owner, amt, s.signer, [s.work.fp, s.deal.fp]);
      // namesReceiverNow: the entry names where the money went (the owner's deal), not the owner.
      let to: Who = owner;
      if (s.namesReceiverNow && 'agreement' in owner) {
        const r = w.receiverNow(owner.agreement);
        if ('agreement' in r) to = r;
      }
      entries.push({ to, amount: amt, settlement: st.fp });
    });
    if (s.silent) continue;
    const ups = batch.map((x) => upstreamReport(w, x.fp)?.fp).filter(Boolean) as FP[];
    const report: Record<string, any> = {
      type: 'statement', signer: s.signer, agreement: s.deal.fp, terms: s.deal.fp, kind: 'leg-report',
      received: [...batch.map((x) => x.fp), ...ups], passed_on: entries, relies_on: [s.work.fp],
    };
    if (s.statesReceived !== undefined) report.received_amount = s.statesReceived;
    w.put(report as any);
  }
  return true;
}

// ---- The reader: rule 11.4, followed from one click's settlement.
type Reach = { who: string; amount: number; how: string; by: string[] };
type Result = { reached: Reach[]; stops: string[]; kept: string[]; disagree: string[]; loops: number };

function read(w: World, click: FP, mode: 'literal' | 'receiver-now'): Result {
  const res: Result = { reached: [], stops: [], kept: [], disagree: [], loops: 0 };
  const first = w.reports().find((r) => r.received.includes(click));
  const clickAmt = w.get(click).amount;
  if (!first) {
    res.stops.push(`the first leg (${w.name({ signer: w.get(click).to })}) gave no leg report: nothing beyond is shown`);
    return res;
  }
  walk(w, first, clickAmt, 1, [], mode, res, new Set());
  return res;
}

function inflow(w: World, report: Act): number {
  // What reached this leg, as the legs before state it (draft 10's `received` names acts, not amounts).
  let total = 0;
  for (const fp of report.received as FP[]) {
    const a = w.get(fp);
    if (a.type === 'settlement' && !w.reports().some((r) => r.passed_on.some((e: Entry) => e.settlement === fp))) total += a.amount;
    if (a.type === 'statement') total += (a.passed_on as Entry[]).filter((e) => report.received.includes(e.settlement)).reduce((x, e) => x + e.amount, 0);
  }
  return total;
}

function walk(w: World, rep: Act, amountHere: number, ratio: number, by: string[], mode: string, res: Result, seen: Set<FP>) {
  const legName = w.get(rep.agreement).label;
  if (seen.has(rep.agreement)) res.loops++;
  const seen2 = new Set(seen).add(rep.agreement);
  const signedBy = [...by, `${rep.signer} (${legName})`];
  const inn = inflow(w, rep);
  const out = (rep.passed_on as Entry[]).reduce((a, e) => a + e.amount, 0);
  if (inn !== out) res.kept.push(`${legName}: ${rep.signer} kept ${inn - out} of ${inn} sat; the report does not say whether as a fee or as money still owed`);
  if (rep.received_amount !== undefined && rep.received_amount !== inn) res.disagree.push(`${legName}: ${rep.signer} states it received ${rep.received_amount}; the leg before states it passed on ${inn}`);
  const r = (inn === 0 ? 0 : amountHere / inn) * 1; // this click's part of what this leg handled
  for (const e of rep.passed_on as Entry[]) {
    const mine = e.amount * r;
    const how = r === 1 ? 'stated' : `pro rata (${(r * 100).toFixed(1)}% of a report covering several payments), not stated`;
    if ('signer' in e.to) {
      res.reached.push({ who: e.to.signer, amount: mine, how, by: signedBy });
      continue;
    }
    const target = e.to.agreement;
    const rn = w.receiverNow(target);
    if (mode === 'receiver-now' && 'signer' in rn && w.get(target).body.shares) {
      // The agreement's receiver is a person: the money reached them, holding for the other owners.
      res.reached.push({ who: rn.signer, amount: mine, how: `${how}; as receiver of ${w.name(e.to)}, holding the other owners' parts`, by: signedBy });
      const others = (w.get(target).body.shares as [Who, number][]).map(([o]) => w.name(o)).filter((n) => n !== rn.signer);
      res.stops.push(`${w.name(e.to)}: ${mine.toFixed(1)} sat reached its receiver ${rn.signer}; what reached ${others.join(', ')} is not shown: no leg report, and none is asked of a person receiver (P20).`);
      continue;
    }
    const look: FP[] = [target];
    if (mode === 'receiver-now' && 'agreement' in rn) look.push(rn.agreement);
    const next = w.reports().find((x) => look.includes(x.agreement) && x.received.includes(rep.fp));
    if (!next) {
      const inDeal = 'agreement' in rn && w.reports().some((x) => x.agreement === rn.agreement && x.received.includes(rep.fp));
      const why = mode === 'literal' && inDeal
        ? `a report exists, but in ${w.name(rn)}, not in ${w.name(e.to)} itself, which rule 11.4 read literally asks for`
        : 'no leg report names it as received';
      res.stops.push(`${w.name(e.to)}: ${mine.toFixed(1)} sat of this click went there; ${why}. Not shown from there on.`);
      continue;
    }
    if (seen2.has(next.agreement) && res.loops > 20) return;
    walk(w, next, mine, 1, signedBy, mode, res, seen2);
  }
}

// ---- Scenarios.
type Opts = { clicks: number; amount: number; silentB?: boolean; namesReceiverNow?: boolean; lieC?: number; loop?: boolean };

function scenario(o: Opts) {
  inbox.clear();
  const w = new World();
  const P = (signer: string): Who => ({ signer });
  const band = work(w, 'the band', 'mia', [[P('mia'), 400_000], [P('noor'), 300_000], [P('omar'), 300_000]]);
  const lib = work(w, 'the sound library', 'lea', [[P('lea'), 600_000], [P('lou'), 400_000]], P('lea'));
  // The film is made first in the loop variant so the song can name it.
  const film = work(w, 'the film', 'dana', [[P('dana'), 500_000], [P('eli'), 200_000], [{ agreement: 'SONG' }, 200_000], [{ agreement: lib.fp }, 100_000]]);
  const songShares: [Who, number][] = o.loop
    ? [[{ agreement: band.fp }, 650_000], [P('pat'), 300_000], [{ agreement: film.fp }, 50_000]]
    : [[{ agreement: band.fp }, 700_000], [P('pat'), 300_000]];
  const song = work(w, 'the song', 'pat', songShares);
  (film.body.shares as [Who, number][])[2][0] = { agreement: song.fp }; // sketch shortcut: the film names the song
  const dF = deal(w, 'svcA', 'straight', film.fp, { flatFee: 10 });
  const dS = deal(w, 'svcB', 'pooled', song.fp, { feePermille: 20 });
  const dB = deal(w, 'svcC', 'minimum', band.fp, { minPayout: 50 });
  setReceiver(w, film.fp, { agreement: dF.fp });
  setReceiver(w, song.fp, { agreement: dS.fp });
  setReceiver(w, band.fp, { agreement: dB.fp });
  const nr = o.namesReceiverNow ?? true;
  const svcs: Service[] = [
    { signer: 'svcA', deal: dF, work: film, cmip: 'straight', params: { flatFee: 10 }, carried: new Map(), namesReceiverNow: nr },
    { signer: 'svcB', deal: dS, work: song, cmip: 'pooled', params: { feePermille: 20 }, carried: new Map(), silent: o.silentB, namesReceiverNow: nr },
    { signer: 'svcC', deal: dB, work: band, cmip: 'minimum', params: { minPayout: 50 }, carried: new Map(), statesReceived: o.lieC, namesReceiverNow: nr },
  ];
  const clicks: Act[] = [];
  for (let i = 0; i < o.clicks; i++) clicks.push(pay(w, { agreement: film.fp }, o.amount, `payer${i + 1}`, [film.fp]));
  // Services run in turn until nothing waits (svcA per payment, svcB and svcC per batch).
  for (let guard = 0; guard < 50; guard++) {
    let any = false;
    any = run(w, svcs[0]) || any;
    any = run(w, svcs[1]) || any;
    any = run(w, svcs[2]) || any;
    if (!any) break;
  }
  return { w, click: clicks[0].fp };
}

const everyone = ['dana', 'eli', 'pat', 'mia', 'noor', 'omar', 'lea', 'lou'];

function show(title: string, o: Opts, mode: 'literal' | 'receiver-now' = 'receiver-now') {
  const { w, click } = scenario(o);
  const r = read(w, click, mode);
  const lines = [`\n## ${title}`, `${o.clicks} click(s) of ${o.amount} sat to the film; following click 1; reader: rule 11.4, ${mode === 'literal' ? 'read literally' : 'following the receiver now between legs (rule 1.4)'}.`];
  const got = new Map<string, Reach[]>();
  for (const x of r.reached) got.set(x.who, [...(got.get(x.who) ?? []), x]);
  for (const p of everyone) {
    const g = got.get(p);
    if (g) {
      const sum = g.reduce((a, x) => a + x.amount, 0);
      lines.push(`- ${p}: reached, ${sum.toFixed(1)} sat, ${g[0].how}; signed by ${g[0].by.join(' → ')}`);
    } else lines.push(`- ${p}: NOT SHOWN`);
  }
  for (const s of r.stops) lines.push(`  stop: ${s}`);
  for (const k of r.kept) lines.push(`  kept: ${k}`);
  for (const d of r.disagree) lines.push(`  disagree: ${d}`);
  if (r.loops) lines.push(`  loop: the climb came back to a leg it had passed ${r.loops} time(s)`);
  return lines.join('\n');
}

const out = [
  '# The click, run on draft 10',
  show('1. Every leg reports', { clicks: 3, amount: 1000 }),
  show('2. The same acts, rule 11.4 read literally', { clicks: 3, amount: 1000, namesReceiverNow: false }, 'literal'),
  show('3. The song\'s service gives no leg report', { clicks: 3, amount: 1000, silentB: true }),
  show('4. Small clicks: the band\'s service holds payouts under its minimum', { clicks: 3, amount: 100 }),
  show('5. The band\'s service states a received amount that does not match', { clicks: 3, amount: 1000, lieC: 300 }),
  show('6. A loop: the song names the film as a party', { clicks: 1, amount: 1000, loop: true }),
].join('\n');
console.log(out);
