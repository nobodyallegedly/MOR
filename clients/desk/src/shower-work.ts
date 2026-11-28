// cMIP shower work, draft 12 (DubLaw; spec bf4e89e4…e6b6, text act fc6eb5b6…ca10), as Edubba reads it:
// released as one pipe with straight split draft 7 and public flow draft 8 (spec 5516c238…cd4a3).
// The reference code, typed loosely and unchanged in behaviour, plus `showerLines`, the plain-words reading
// Edubba shows before anyone signs. Where something rests on a cMIP, an act or a delivery note Edubba does not
// hold, the reading says "unchecked", never a guess. Pure: no keys, no network, no imports from genesis.
//
// read(words, parties, params, decode?): words as bytes with a CBOR decoder that keeps byte strings as
// Uint8Array, or as the decoded Map itself.

const hx = (b: Uint8Array): string => Buffer.from(b).toString('hex');
const isHash = (v: unknown): v is Uint8Array => v instanceof Uint8Array && v.length === 32;
const no = (why: string): any => ({ ok: false, why });

function ownerKey(o: any, parties: any[]): string | null | undefined {
  if (!Array.isArray(o) || o.length !== 2) return null;
  if (o[0] === 0 || o[0] === 1) {
    if (!isHash(o[1])) return null;
    const h = hx(o[1]);
    const party = parties.some((p) => (o[0] === 0 ? p.signer === h : p.agreement === h));
    return party ? (o[0] === 0 ? 'p:' : 'a:') + h : undefined;   // undefined: well formed but not a party
  }
  if (o[0] === 2 && Number.isInteger(o[1]) && o[1] >= 0) return parties[o[1]]?.role ? 's:' + o[1] : undefined;
  return null;
}

export function read(words: Uint8Array | Map<number, any>, parties: any[], params: Record<number, number> = {}, decode?: (b: Uint8Array) => any): any {
  let m: any; try { m = words instanceof Map ? words : decode!(new Uint8Array(words)); } catch { return no('the words do not decode'); }
  if (!(m instanceof Map)) return no('the words are not a map');
  for (const k of m.keys()) if (!Number.isInteger(k) || k < 0 || k > 10) return no('unknown key ' + String(k));
  if (typeof m.get(0) !== 'string') return no('key 0 (the name) is missing');
  type Owner = { err: string; k?: undefined } | { err?: undefined; k: string };
  const key = (o: unknown, where: number): Owner => { const k = ownerKey(o, parties); if (k === null) return { err: `an owner in key ${where} is not [0 or 1, 32 bytes] or [2, position]: text is never a hash` }; if (k === undefined) return { err: `an owner in key ${where} is not a party (or a spot is not a role)` }; return { k }; };
  const holdings = new Map();
  if (!Array.isArray(m.get(1)) || !m.get(1).length) return no('key 1 (who owns what) is missing');
  for (const h of m.get(1)) {
    if (!Array.isArray(h) || h.length !== 2) return no('a holding is not [owner, parts]');
    const r = key(h[0], 1); if (r.err) return no(r.err);
    if (!Number.isInteger(h[1]) || h[1] < 1 || holdings.has(r.k)) return no('bad parts, or an owner twice, in key 1');
    holdings.set(r.k, h[1]);
  }
  const roles = [...holdings.keys()].filter((k) => k.startsWith('s:')).map((k) => JSON.stringify(parties[+k.slice(2)].role));
  if (new Set(roles).size !== roles.length) return no('two alike roles hold parts');
  const named = (k: string) => holdings.has(k) && !k.startsWith('s:');
  let remainder;
  const r2 = m.get(2);
  if (Array.isArray(r2) && r2.length === 1 && r2[0] === 3) remainder = 'rotating';
  else { const r = key(r2, 2); if (r.err) return no(r.err); if (!named(r.k!)) return no('the remainder owner must be a named owner in key 1'); remainder = r.k; }
  const set = (n: number): { err: string; s?: undefined } | { err?: undefined; s: Set<unknown> } => { const s = new Set(); for (const o of m.get(n) ?? []) { const r = key(o, n); if (r.err) return r; if (!named(r.k!)) return { err: `an owner in key ${n} must be a named owner in key 1` }; s.add(r.k); } return { s }; };
  const k3 = set(3); if (k3.err) return no(k3.err);
  const k6 = set(6); if (k6.err) return no(k6.err);
  for (const k of k6.s!) if (k3.s!.has(k)) return no('an owner in key 6 may not be in key 3');
  const fixed = [];
  for (const f of m.get(5) ?? []) {
    if (!Array.isArray(f) || (f.length !== 2 && f.length !== 3)) return no('a fixed line is not [owner, sats, ?evidence]');
    const r = key(f[0], 5); if (r.err) return no(r.err);
    if (!Number.isInteger(f[1]) || f[1] < 1) return no('a fixed line must be at least 1 sat');
    let ev = null;
    if (f.length === 3) { if (!Array.isArray(f[2]) || f[2].length !== 2 || !isHash(f[2][0])) return no('a fixed line\'s evidence is not [cmip, params]'); ev = hx(f[2][0]); }
    fixed.push({ to: r.k, sats: f[1], evidence: ev });
  }
  const admitted = new Map();
  for (const h of m.get(7) ?? []) {
    if (!Array.isArray(h) || h.length !== 2) return no('a key-7 entry is not [owner, parts]');
    const r = key(h[0], 7); if (r.err) return no(r.err);
    if (!named(r.k!) || admitted.has(r.k) || !Number.isInteger(h[1]) || h[1] < 1 || h[1] > holdings.get(r.k)) return no('a key-7 owner must be named in key 1, once, with at most their parts');
    admitted.set(r.k, h[1]);
  }
  const floor = params[2] ?? 1008;
  const standins = new Map();
  for (const e of m.get(8) ?? []) {
    if (!Array.isArray(e) || e.length !== 5) return no('a stand-in entry is not [owner, stand-in, witnesses, k, wait]');
    const r = key(e[0], 8); if (r.err) return no(r.err);
    const [, s, w, k, wait] = e;
    if (!named(r.k!) || standins.has(r.k)) return no('a key-8 owner must be named in key 1, once');
    if (!isHash(s) || !Array.isArray(w) || !w.length || !w.every(isHash)) return no('a stand-in or witness is not 32 bytes');
    const si = hx(s), ws = w.map(hx);
    if (!parties.some((p) => p.signer === si)) return no('the stand-in must be a party of the Terms');
    if (ws.includes(si) || ws.includes(r.k!.slice(2)) || new Set(ws).size !== ws.length) return no('a witness may not be the owner or the stand-in, nor named twice');
    if (!Number.isInteger(k) || k < 1 || k > ws.length) return no('k must be at least 1 and at most the number of witnesses');
    if (!Number.isInteger(wait) || wait < floor) return no(`the wait is below the floor of ${floor} blocks`);
    standins.set(r.k, { standIn: 'p:' + si, witnesses: ws.map((x) => 'p:' + x), k, wait });
  }
  let delivery = null;
  if (m.has(9)) {
    const d = m.get(9);
    if (!Array.isArray(d) || d.length !== 3) return no('key 9 is not [deliverer, within, refund]');
    const r = key(d[0], 9); if (r.err) return no(r.err);
    if (!named(r.k!) || !Number.isInteger(d[1]) || d[1] < 1 || typeof d[2] !== 'boolean') return no('the deliverer must be a named owner; within at least 1 block; refund true or false');
    delivery = { by: r.k, within: d[1], refund: d[2] };
  }
  const former = [];
  for (const h of m.get(10) ?? []) { if (!isHash(h)) return no('a former receiver in key 10 is not 32 bytes'); former.push(hx(h)); }
  const total = [...holdings.values()].reduce((a, b) => a + b, 0);
  return { ok: true, name: m.get(0), holdings, total, remainder, left: k3.s, whole: k6.s, fixed, admitted, standins, delivery, former, raw: m };
}

// fillings: { 's:3': [signer, ...] } (null: its cMIP cannot answer); evidence: { <index of fixed line>: true | false } (absent: cannot answer, the line is held, N3); settlement: hex string (for a rotating remainder);
// successors: { 'p:<gone>': 'p:<new>' } from later versions in force under rules 3b(a) and 3c (section 2, succession).
export function divide(rd: any, sats: number, { fillings = {}, evidence = {}, settlement = null, successors = {}, fee = 0 }: { fillings?: Record<string, string[] | null>; evidence?: Record<number, boolean>; settlement?: string | null; successors?: Record<string, string>; fee?: number } = {}): [string, number, string][] {
  const pay = (k: string) => successors[k] ?? k;
  const filler = (k: string) => { const f = fillings[k] ?? []; return f && f.length === 1 ? 'p:' + f[0] : null; };
  const silent = (k: string) => fillings[k] === null;   // the spot's cMIP cannot answer
  const out: [string, number, string][] = []; let pot = sats;
  rd.fixed.forEach((f: any, i: number) => {
    const to = f.to.startsWith('s:') ? filler(f.to) : pay(f.to);
    if (f.evidence && evidence[i] === undefined) { if (f.sats <= pot) { pot -= f.sats; out.push([f.to, f.sats, 'held: its evidence cannot be read']); } else out.push([f.to, 0, 'did not fit']); return; }
    if (f.evidence && evidence[i] !== true) { out.push([f.to, 0, 'no evidence']); return; }
    if (f.to.startsWith('s:') && silent(f.to)) { if (f.sats <= pot) { pot -= f.sats; out.push([f.to, f.sats, 'held: its spot cannot be read']); } else out.push([f.to, 0, 'did not fit']); return; }
    if (!to) { out.push([f.to, 0, (fillings[f.to] ?? []).length ? 'spot filled twice' : 'spot unfilled']); return; }
    if (f.sats > pot) { out.push([to, 0, 'did not fit']); return; }
    pot -= f.sats; out.push([to, f.sats, 'fixed']);
  });
  if (fee > 0) { const f = Math.min(fee, pot); pot -= f; out.push(['service', f, 'fee']); }   // W8: after the fixed lines, before the parts
  const named = [...rd.holdings].filter(([k]) => !k.startsWith('s:'));
  let toNamed = pot;
  for (const [k, p] of rd.holdings) if (k.startsWith('s:')) {
    const s = Math.floor((pot * p) / rd.total); const f = filler(k);
    if (f) { out.push([f, s, 'spot ' + k.slice(2)]); toNamed -= s; } else if (silent(k)) { out.push([k, s, 'held: its spot cannot be read']); toNamed -= s; } else out.push([k, 0, ((fillings[k] ?? []).length ? 'spot filled twice' : 'spot unfilled') + `: ${s} sats to the owners by parts`]);
  }
  const nTotal = named.reduce((a, [, p]) => a + p, 0);
  const lines = named.map(([k, p]) => [k, Math.floor((toNamed * p) / nTotal)]);
  const rest = toNamed - lines.reduce((a, [, s]) => a + s, 0);
  let rk = rd.remainder;
  if (rk === 'rotating') { if (!settlement) throw new Error('a rotating remainder needs the payment\'s settlement'); rk = named[Number(BigInt('0x' + settlement) % BigInt(named.length))][0]; }
  for (const [k, s] of lines) out.push([pay(k), k === rk ? s + rest : s, k === rk && rest ? 'remainder ' + rest : '']);
  return out;
}

// ctx: { own: Set of keys who assented in their own name, changed: Set of field names the update changes beyond the words
//        (receiver, control, calls, data, bodyCmip, conditionCmip, params, powersAssent, others), params, shape: 'leave'|'whole'|'standin'|null,
//        standin: { gone:[{signer, block}], assentBlock, ownerActsBlocks:[...] }, serviceOwner: key or null }
export function condition(orig: any, upd: any, ctx: any): { answer: string; rule: string | number; ground: string } {
  if (!orig.ok || !upd.ok) return { answer: 'not valid', rule: 'reading', ground: orig.why || upd.why };
  const { own = new Set(), changed = new Set(), params = {} } = ctx;
  const named = (rd: any) => [...rd.holdings.keys()].filter((k) => !k.startsWith('s:'));
  const voiced = (rd: any) => named(rd).filter((k) => !rd.left.has(k) && !rd.admitted.has(k));
  const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
  const ser = (rd: any, n: number) => JSON.stringify(rd.raw.get(n) ?? null);
  // Rule 3c, a stand-in (asked first where the update has its shape).
  if (ctx.shape === 'standin') {
    const [gone] = [...orig.standins.keys()].filter((k) => !upd.holdings.has(k));
    const e = gone && orig.standins.get(gone); if (!e) return { answer: 'not valid', rule: '3c', ground: 'no owner with a stand-in entry is replaced' };
    if (upd.holdings.get(e.standIn) !== orig.holdings.get(gone)) return { answer: 'not valid', rule: '3c.1', ground: 'the stand-in does not take exactly the owner\'s parts' };
    if (!own.has(e.standIn)) return { answer: 'not valid', rule: '3c.2', ground: 'the stand-in has not assented in their own name' };
    const firsts = new Map(); for (const g of ctx.standin?.gone ?? []) if (e.witnesses.includes(g.signer) && (!firsts.has(g.signer) || firsts.get(g.signer) > g.block)) firsts.set(g.signer, g.block);
    const b = [...firsts.values()].sort((x, y) => x - y);
    if (b.length < e.k) return { answer: 'not valid', rule: '3c.3', ground: `${b.length} of ${e.k} witnesses have said the owner is gone` };
    const kth = b[e.k - 1], at = ctx.standin?.assentBlock;
    if (at == null) return { answer: 'not valid', rule: '3c.4', ground: 'no placement answers for the wait' };
    if (at - kth < e.wait) return { answer: 'not valid', rule: '3c.4', ground: `${at - kth} of ${e.wait} blocks waited` };
    const back = (ctx.standin?.ownerActsBlocks ?? []).find((x: number) => x >= kth && x <= at);
    if (back !== undefined) return { answer: 'not valid', rule: '3c.5', ground: `the owner acted at block ${back}, within the wait` };
    return { answer: 'valid', rule: '3c', ground: 'the stand-in takes the owner\'s place' };
  }
  // Rule 3, leaving one's voice.
  if (ctx.shape === 'leave') {
    const added = [...upd.left].filter((k) => !orig.left.has(k));
    const onlyThat = added.length === 1 && [0, 1, 2, 4, 5, 6, 7, 8, 9].every((n) => ser(orig, n) === ser(upd, n)) && changed.size === 0;
    return onlyThat && own.has(added[0]) && own.size === 1 ? { answer: 'valid', rule: 3, ground: 'leaves their voice, keeps their parts' } : { answer: 'not valid', rule: 3, ground: 'not only one owner added to key 3, signed by that owner alone' };
  }
  // Rule 3b, leaving wholly.
  if (ctx.shape === 'whole') {
    const gone = named(orig).filter((k) => !upd.holdings.has(k));
    if (gone.length !== 1 || !orig.whole.has(gone[0]) || !own.has(gone[0])) return { answer: 'not valid', rule: '3b', ground: 'not one owner of key 6 leaving by their own assent' };
    const added = named(upd).filter((k) => !orig.holdings.has(k));
    const othersSame = named(orig).filter((k) => k !== gone[0]).every((k) => upd.holdings.get(k) === orig.holdings.get(k));
    const a = added.length === 1 && upd.holdings.get(added[0]) === orig.holdings.get(gone[0]) && own.has(added[0]);
    const b = added.length === 0;
    return othersSame && (a || b) && changed.size === 0 ? { answer: 'valid', rule: a ? '3b(a)' : '3b(b)', ground: a ? 'leaves wholly, parts to a successor who assents' : 'leaves wholly, parts shared by all in proportion' } : { answer: 'not valid', rule: '3b', ground: 'more changes than leaving wholly' };
  }
  // Rule 1, cuts.
  const cut = new Set();
  const everyone = () => named(orig).forEach((k) => cut.add(k));
  for (const n of [2, 5, 9]) if (ser(orig, n) !== ser(upd, n)) everyone();
  if (!orig.former.every((h: string) => upd.former.includes(h))) everyone();   // a former receiver removed
  // W1: a change of service like for like (ctx.likeForLike, computed by the caller from both deals' Terms with sameService) is not a cut.
  const likeForLike = ctx.likeForLike === true && [...changed].every((f) => ['receiver', 'calls'].includes(f));
  for (const f of ['receiver', 'control', 'calls', 'data', 'bodyCmip', 'conditionCmip', 'powersAssent']) if (changed.has(f) && !(likeForLike && (f === 'receiver' || f === 'calls'))) everyone();
  if (changed.has('params') && !ctx.paramsOnlyRise) everyone();
  const newWhole = [...upd.whole].filter((k) => !orig.whole.has(k) && orig.holdings.has(k)); if (newWhole.length) everyone();
  for (const [k, p] of orig.holdings) if (k.startsWith('s:') && (upd.holdings.get(k) ?? 0) < p) everyone();
  // Key 7 and the cap.
  const k7changed = [...orig.admitted].some(([k, p]) => upd.admitted.get(k) !== p);
  const k7added = [...upd.admitted.keys()].filter((k) => !orig.admitted.has(k));
  if (k7changed) { const onlyRemovals = [...orig.admitted].every(([k, p]) => !upd.admitted.has(k) || upd.admitted.get(k) === p); if (!onlyRemovals) everyone(); else { const need = voiced(orig).filter((k) => !own.has(k)); if (need.length) return { answer: 'not valid', rule: 1, ground: 'giving an admitted owner a voice needs every owner with a voice; missing ' + need.join(', ') }; } }
  let underCap = false;
  if (k7added.length) {
    const adm = [...upd.admitted.values()].reduce((a, b) => a + b, 0);
    const base = named(upd).filter((k) => !upd.admitted.has(k)).reduce((a, k) => a + upd.holdings.get(k), 0);
    const cap = params[1] ?? 0;
    if (adm > Math.floor((base * cap) / 1_000_000)) return { answer: 'not valid', rule: 'cap', ground: `admissions together ${adm}, cap ${Math.floor((base * cap) / 1_000_000)}` };
    if (!k7added.every((k) => own.has(k))) return { answer: 'not valid', rule: 'cap', ground: 'a newcomer has not assented in their own name' };
    underCap = named(orig).every((k) => upd.holdings.get(k) === orig.holdings.get(k));
  }
  for (const k of named(orig)) {
    const a = orig.holdings.get(k), b = upd.holdings.get(k) ?? 0;
    if (b < a) cut.add(k);
    else if (!underCap && b / upd.total < a / orig.total) cut.add(k);
    if (!same(orig.standins.get(k), upd.standins.get(k))) { cut.add(k); const o = orig.standins.get(k), n = upd.standins.get(k); if (o && n && o.standIn !== n.standIn) cut.add(o.standIn); }
  }
  for (const k of upd.standins.keys()) if (!orig.standins.has(k)) cut.add(k);
  if (ctx.serviceOwner /* the party at the old deal's receiver position, where it is an owner */ && ctx.onlyReceiverChange) cut.delete(ctx.serviceOwner /* the party at the old deal's receiver position, where it is an owner */);
  const missing = [...cut].filter((k) => !own.has(k));
  if (missing.length) return { answer: 'not valid', rule: 1, ground: 'cut without their own-name assent: ' + missing.join(', ') };
  // Rule 2, the group.
  const vo = voiced(orig); const held = vo.reduce((a, k) => a + orig.holdings.get(k), 0);
  if (!held) return { answer: 'not valid', rule: 2, ground: 'no owner has a voice' };
  const need = Math.ceil((held * (params[0] ?? 1_000_000)) / 1_000_000);
  const got = vo.filter((k) => own.has(k)).reduce((a, k) => a + orig.holdings.get(k), 0);
  return got >= need ? { answer: 'valid', rule: 2, ground: `${got} of ${need} needed` } : { answer: 'not valid', rule: 2, ground: `${got} of ${need} needed` };
}

// Key 9: is a refund owed? payBlock: the settlement's block; now: the block read; delivered/received: held statements.
export function refundOwed(rd: any, { noteBlock, now, delivered, received }: { noteBlock: number | null; now: number; delivered: boolean; received: boolean }): any {
  if (!rd.delivery) return { owed: false, why: 'the words name no delivery' };
  if (noteBlock == null) return { owed: false, why: 'the deliverer holds no delivery note: nothing owed by the deliverer (unchecked to anyone without the note)' };
  if (delivered || received) return { owed: false, why: delivered ? 'delivered' : 'received' };
  if (now - noteBlock <= rd.delivery.within) return { owed: false, why: 'still within the delivery time' };
  return { owed: rd.delivery.refund, by: rd.delivery.by, why: rd.delivery.refund ? 'not delivered in time: the deliverer refunds' : 'not delivered in time; the words name no refund' };
}

// W1, N8, N11: are two deals the same service? old/new: { control, controlCreator, controlReplaces: [hashes its text names as replaced], fee, unit,
//   signers: [person ids], agreements: [roots named with their signing asked] }; owners: the update's named owners (keys).
export function sameService(oldDeal: any, newDeal: any, owners: string[]): boolean {
  if (!oldDeal || !newDeal) return false;   // not held: cannot tell like from unlike
  // N11: the same split cMIP is the same draft, or a later draft by the same creator naming the old one as replaced in its own text.
  const sameSplit = oldDeal.control === newDeal.control || (newDeal.controlCreator && newDeal.controlCreator === oldDeal.controlCreator && (newDeal.controlReplaces ?? []).includes(oldDeal.control));
  if (!sameSplit || oldDeal.unit !== newDeal.unit || newDeal.fee > oldDeal.fee) return false;
  return owners.every((k) => (k.startsWith('p:') ? (newDeal.signers ?? []).includes(k.slice(2)) : k.startsWith('a:') ? (newDeal.agreements ?? []).includes(k.slice(2)) : true));
}

// N3: a held line still held at the deal's deadline is released to the named owners by their parts (remainder as step 4).
// P1 (DubLaw's ruling, act 3b2237d8…): "the deal's deadline" is the deadline of the deal version in force when the payment settled;
// the caller passes deadlinePassed computed against that deadline, never a later version's.
export function releaseHeld(rd: any, sats: number, opts: any = {}): [string, number, string][] {
  return divide({ ...rd, fixed: [], holdings: new Map([...rd.holdings].filter(([k]) => !k.startsWith('s:'))), total: [...rd.holdings].filter(([k]) => !k.startsWith('s:')).reduce((a, [, p]) => a + p, 0) }, sats, opts);
}

export const SHOWER_WORK = {
  current: 'bf4e89e47839b26038a9e9872a7ee373711ed906051a8ff05cfab6364361e6b6',
  older: {
    '121aad7a40758e1b9cb249c68dc2ec9cf5c197daf4caeb221d6bac6b37fbf1b4': 'draft 11 (a silent owner could still freeze the work; delivery could not be done)',
    '589f817964a5c6e853a736d1a3f1bf30edae1a6b09600a6a5464cc2848aa5004': 'draft 10 ("the service" could match every owner: name draft 11)',
    '87c6b7b0e2744a0a3c2d83969471da562d6f42cbaffddfe7aa6198354faa6b72': 'draft 9',
    'eea5e5644b2fd2b0f611e096e2b64f6240219077298264ba131ce8507002f335': 'draft 8 (a group could set a quiet owner\'s stand-in: do not use)',
    '49aba57b1bb77c591d1041804f3d6c817e8a63421529e73056aeadb7825d2c7b': 'draft 7',
    '3fcec24427b02fd347704420a09bb17950059423d10ce0d0e868d209b6f32c34': 'draft 6',
    '04c3185f636b2e40ed0e005fc711bb0e6f1e3ab9a101463605f066aa30b6a78c': 'draft 5 (admission compounds; a leaver may be paid twice)',
  } as Record<string, string>,
};

/** Which shower work a Terms' body names, in plain words; "unchecked" for any other cMIP. */
export function whichShowerWork(cmip: string): { known: boolean; said: string } {
  if (cmip === SHOWER_WORK.current) return { known: true, said: 'shower work, draft 12 (DubLaw), the current draft' };
  const old = SHOWER_WORK.older[cmip];
  if (old) return { known: false, said: `shower work, ${old}: an older draft. Edubba reads only draft 12, so this reading is unchecked` };
  return { known: false, said: `a cMIP Edubba does not know (${cmip.slice(0, 8)}…): unchecked. Read its text before you sign` };
}

/** The plain-words reading of draft 12's words, as Edubba shows it before anyone signs. `name` turns a key into a name. */
export function showerLines(rd: any, name: (key: string) => string = (k) => k.slice(0, 10) + '…'): string[] {
  if (!rd.ok) return [`No reading: ${rd.why}. Under shower work, a split service pays nobody under these words, and no later version can be valid. Do not sign.`];
  const who = (k: string) => (k.startsWith('s:') ? `the spot at position ${k.slice(2)}` : name(k));
  const L: string[] = [`Work: ${rd.name}`, `Who owns what (${rd.total} parts in all):`];
  for (const [k, p] of rd.holdings) L.push(`  - ${who(k)}: ${p} parts${rd.left.has(k) ? ' (left their voice, still paid)' : ''}${rd.admitted.has(k) ? ' (admitted, no voice yet)' : ''}`);
  rd.fixed.forEach((f: any) => L.push(`  - ${who(f.to)}: a fixed ${f.sats} sats from every payment, taken first${f.evidence ? `, only on evidence (cMIP ${f.evidence.slice(0, 8)}…; unchecked by Edubba)` : ''}`));
  L.push(rd.remainder === 'rotating' ? 'What a division leaves over rotates among the named owners, by the payment\'s settlement.' : `What a division leaves over goes to ${who(rd.remainder)}.`);
  if (rd.whole.size) L.push(`May leave wholly: ${[...rd.whole].map(who).join(', ')}.`);
  for (const [k, e] of rd.standins) L.push(`${who(k)} named a stand-in (${name(e.standIn)}): ${e.k} of ${e.witnesses.length} witnesses and a wait of ${e.wait} blocks.`);
  if (rd.former.length) L.push(`No longer the work's receivers (do not pay them): ${rd.former.map((h: string) => h.slice(0, 8) + '…').join(', ')}.`);
  L.push(rd.delivery ? `Delivery: ${who(rd.delivery.by)} delivers within ${rd.delivery.within} blocks of payment${rd.delivery.refund ? ', or refunds in full' : ''}, counted from the service\'s delivery note, by a statement sealed to the buyer.` : 'Delivery: the words name no one who delivers. A buyer cannot check "not delivered".');
  L.push('Spots, evidence, succession and delivery rest on other cMIPs, later versions and the service\'s delivery note: Edubba shows them unchecked unless it holds them. A step that cannot be checked holds only its own line; everything else is paid.');
  return L;
}
