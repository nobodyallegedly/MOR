// DubLaw's reference code for cMIP "an arbiter's award", draft 1 (act 5102247f…, spec ebcc09e3…). Pure: no network, no keys.
// A reader gives the decoded acts it holds and the place's positions; it answers valid, not an award (with why), or unchecked.
export type Clause = { arbiter: string; fee?: unknown; answerWindow?: number; awardWindow?: number; default?: 0 | 1; place?: string };
export type Act = { id: string; signer: string; pos?: number; block?: number };
export type Claim = Act & { terms: string; disputed: string; evidence: string[] };
export type Answer = Act & { claim: string; evidence: string[] };
export type Award = Act & { claim: string; outcome: unknown; read: string[] };
export type Ctx = { termsInForceAtSettlement: string | null; clauseOf: (terms: string) => Clause | null; parties: string[]; lodgedBefore: (id: string, pos: number) => boolean };
export type Verdict = { word: 'valid' | 'not an award' | 'unchecked'; why: string; outcome?: [0] | [1] | [2, number]; apply?: 'award' | 'default'; default?: 0 | 1 };

export function outcomeOk(o: unknown): o is [0] | [1] | [2, number] {
  return Array.isArray(o) && ((o.length === 1 && (o[0] === 0 || o[0] === 1)) || (o.length === 2 && o[0] === 2 && Number.isInteger(o[1]) && o[1] >= 0 && o[1] <= 1_000_000));
}

// awards: every award the reader holds for this claim, by this clause's arbiter or anyone.
export function readAward(claim: Claim, answer: Answer | null, awards: Award[], ctx: Ctx): Verdict {
  if (ctx.termsInForceAtSettlement === null) return { word: 'unchecked', why: 'the version in force at the disputed settlement is not held' };
  if (claim.terms !== ctx.termsInForceAtSettlement) return { word: 'not an award', why: 'the claim names a version that was not in force at the disputed settlement (named late, or the wrong one)' };
  const c = ctx.clauseOf(claim.terms);
  if (!c) return { word: 'not an award', why: 'the Terms in force rely on no arbiter clause: no dispute under this cMIP' };
  const dflt = (c.default ?? 0) as 0 | 1;
  if (!ctx.parties.includes(claim.signer)) return { word: 'not an award', why: 'the claim is not signed by a party of the Terms', apply: 'default', default: dflt };
  const mine = awards.filter((a) => a.signer === c.arbiter && a.claim === claim.id);
  if (mine.length === 0) {
    return { word: 'not an award', why: 'no award by the clause\'s arbiter is held (if award_window has passed, the default applies)', apply: 'default', default: dflt };
  }
  if (mine.length > 1) return { word: 'not an award', why: 'two awards for one claim: a fork, neither counts', apply: 'default', default: dflt };
  const aw = mine[0];
  if (claim.pos === undefined || aw.pos === undefined || (answer && answer.pos === undefined)) return { word: 'unchecked', why: 'the place\'s positions are not held' };
  if (!(claim.pos < aw.pos && (!answer || (claim.pos < answer.pos! && answer.pos! < aw.pos)))) return { word: 'not an award', why: 'claim, answer and award are not in that order in the lane', apply: 'default', default: dflt };
  const ansWin = c.answerWindow ?? 144, awdWin = c.awardWindow ?? 288;
  if (claim.block !== undefined && aw.block !== undefined && aw.block > claim.block + ansWin + awdWin) return { word: 'not an award', why: 'the award came after award_window', apply: 'default', default: dflt };
  if (!outcomeOk(aw.outcome)) return { word: 'not an award', why: 'the outcome is not one of the three forms', apply: 'default', default: dflt };
  const named = new Set([...claim.evidence, ...(answer?.evidence ?? []), claim.id, ...(answer ? [answer.id] : [])]);
  for (const r of aw.read) if (!named.has(r) && !ctx.lodgedBefore(r, aw.pos)) return { word: 'not an award', why: `the award reads ${r.slice(0, 8)}…, which was never lodged: an arbiter decides on the record`, apply: 'default', default: dflt };
  return { word: 'valid', why: 'a valid award', outcome: aw.outcome as [0] | [1] | [2, number], apply: 'award' };
}

// What an escrow pays on a verdict, for an amount held (whole sats): to release_to, and back to the payer. Rounded down to release_to.
export function execute(v: Verdict, held: number): { release: number; refund: number } | null {
  if (v.word === 'unchecked') return null;
  const o = v.apply === 'award' ? v.outcome! : v.default === 1 ? [0] : [1];
  if (o[0] === 0) return { release: held, refund: 0 };
  if (o[0] === 1) return { release: 0, refund: held };
  const rel = Math.floor((held * (o as [2, number])[1]) / 1_000_000); return { release: rel, refund: held - rel };
}

// Draft 2, section 3a: a window read by the clause's time references, in order. Each entry: true on time, false late,
// null when no anchor of that reference places the record yet. The first reference governs; disagreement is shown, never hidden.
export function onTime(byRef: (boolean | null)[], names: string[] = byRef.map((_, i) => `reference ${i + 1}`)): { word: 'on time' | 'late' | 'unchecked'; line: string } {
  const first = byRef[0] ?? null;
  if (first === null) return { word: 'unchecked', line: `unchecked: no anchor of ${names[0]} places the record yet` };
  const parts = byRef.map((b, i) => `${b === null ? 'unplaced' : b ? 'on time' : 'late'} by ${names[i]}`);
  const agree = byRef.every((b) => b === null || b === first);
  return { word: first ? 'on time' : 'late', line: agree ? `${first ? 'on time' : 'late'} by ${names.filter((_, i) => byRef[i] !== null).join(' and ')}` : parts.join(', ') };
}
