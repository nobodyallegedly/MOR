// The Agreements acts of the round, decoded in memory with the kit's own core.
// node agreements.mjs DATA KIT  -> prints counts only.
import { loadCore, loadActs, loadPlace, hex, plain } from './round.mjs';

const toHex = (v) => (v instanceof Uint8Array ? hex(v) : null);
// `previous` is always written: none is an empty list, one is a list of one fingerprint (encoding 2).
const prevOf = (p) => (p instanceof Uint8Array ? hex(p) : Array.isArray(p) && p[0] instanceof Uint8Array ? hex(p[0]) : null);

/** { acts: Map(id -> {bytes, where, files, d, f}), place: Map(actId -> record number), records } */
export async function loadRound(data, kit) {
  const { mor } = await loadCore(kit);
  const specs = mor.agreementsNewSpecs();
  const all = loadActs(mor, data);
  const ag = new Map();
  for (const [id, e] of all) {
    let d;
    try { d = mor.describeAct(e.bytes); } catch { continue; }
    e.d = d;
    if (d.spec !== specs.terms.spec || !d.payload) continue;
    let m;
    try { m = mor.cborDecode(Uint8Array.from(Buffer.from(d.payload, 'hex'))); } catch { continue; }
    if (!(m instanceof Map)) continue;
    const f = { id, signer: d.signer, seq: d.position };
    if (d.type === 0) {
      f.act = 'terms';
      f.replaces = toHex(m.get(0)); f.agreement = toHex(m.get(1)); f.root = f.agreement ?? id;
      f.parties = (m.get(2) ?? []).map((p) => (p[0] === 0 ? { signer: hex(p[1]) } : p[0] === 2 ? { agreement: hex(p[1]) } : { role: true }));
      f.inForce = m.get(6) ? toHex(m.get(6)[0]) : null;
      f.condition = m.get(13) ? toHex(m.get(13)[0]) : null;
      f.place = toHex(m.get(8)); f.clock = toHex(m.get(9));
      const r = m.get(10); f.receiver = r ? (r[0] === 0 ? { party: Number(r[1]) } : { agreement: toHex(r[1]) }) : null;
      f.body = m.get(4) ? { words: toHex(m.get(4)[0]), cmip: Array.isArray(m.get(4)[1]) ? toHex(m.get(4)[1][0]) : null } : null;
      f.reliesOn = (m.get(5) ?? []).map(toHex);
      f.resolves = m.get(17) ? m.get(17).map(toHex) : null; f.continues = toHex(m.get(18));
      const p = m.get(19); f.previous = prevOf(p);
      f.powers = m.get(7) ? m.get(7).length : 0;
    } else if (d.type === 1) {
      f.act = 'statement';
      f.agreement = toHex(m.get(0)); f.root = f.agreement; f.terms = toHex(m.get(1));
      const k = m.get(2); f.kind = typeof k === 'number' || typeof k === 'bigint' ? ['assent', 'counter_signature', 'contest', 'resolve'][Number(k)] ?? `kind ${k}` : 'defined';
      f.for = m.get(4) ? plain(m.get(4)) : null; f.under = toHex(m.get(5));
      const p = m.get(6); f.previous = prevOf(p);
      f.resolves = m.get(10) ? m.get(10).map(toHex) : null; f.continues = toHex(m.get(11));
    } else continue;
    e.f = f;
    ag.set(id, e);
  }
  const records = loadPlace(mor, data);
  const place = new Map();
  // A page boundary repeats a record: keep one of each; a record's number is its own position in the place's sequence.
  const seenRec = new Set();
  const recs = records.filter((r) => (seenRec.has(r.d.id) ? false : (seenRec.add(r.d.id), true)));
  recs.forEach((r) => {
    const m = mor.cborDecode(Uint8Array.from(Buffer.from(r.d.payload, 'hex')));
    const a = m instanceof Map && m.get(0) instanceof Uint8Array ? hex(m.get(0)) : null;
    r.names = a; r.n = r.d.position;
    if (a && !place.has(a)) place.set(a, r.n);
  });
  return { mor, all, ag, place, records: recs, specs };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [data, kit] = process.argv.slice(2);
  const r = await loadRound(data, kit);
  let t = 0, s = 0, nofile = 0, kinds = {}, withPlace = 0, withClock = 0, resolvesT = 0, resolvesS = 0, inForce = {}, cond = {};
  for (const e of r.ag.values()) {
    if (e.f.act === 'terms') { t++; if (e.f.place) withPlace++; if (e.f.clock) withClock++; if (e.f.resolves) resolvesT++; inForce[e.f.inForce?.slice(0, 8) ?? 'none'] = (inForce[e.f.inForce?.slice(0, 8) ?? 'none'] ?? 0) + 1; cond[e.f.condition?.slice(0, 8) ?? 'none'] = (cond[e.f.condition?.slice(0, 8) ?? 'none'] ?? 0) + 1; }
    else { s++; kinds[e.f.kind] = (kinds[e.f.kind] ?? 0) + 1; if (e.f.resolves) resolvesS++; }
    if (!e.files) nofile++;
  }
  console.log({ allActs: r.all.size, agreementsActs: r.ag.size, terms: t, statements: s, kinds, noWindowFile: nofile, termsWithPlace: withPlace, termsWithClock: withClock, resolvingTerms: resolvesT, resolvingStatements: resolvesS, records: r.records.length, inForce, cond });
  const pos = r.records.map((x) => x.d.position);
  console.log('record positions', pos[0], pos[pos.length - 1], 'specs', [...new Set(r.records.map((x) => x.d.spec.slice(0, 8)))]);
}
