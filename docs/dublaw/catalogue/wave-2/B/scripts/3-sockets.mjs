// DubLaw wave 2, session B. Step 3: every fingerprint named in a socket of any Terms, every cMIP named as an
// act's spec, and every text whose fingerprint a later act names. Usage: node 3-sockets.mjs OUT_DIR KIT_DIR
// Reads OUT_DIR/acts.jsonl and texts.json; writes OUT_DIR/named.json.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const [OUT, KIT] = process.argv.slice(2);
const { mor, SPECS } = await import(join(KIT, 'lib/core.mjs'));
const AG = mor.agreementsNewSpecs();
const acts = readFileSync(join(OUT, 'acts.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
const byId = new Map(acts.map((a) => [a.id, a]));
const { byHash } = JSON.parse(readFileSync(join(OUT, 'texts.json'), 'utf8'));
const h = (x) => (x && typeof x === 'object' && typeof x.h === 'string' && x.h.length === 64 ? x.h : null);
const named = {}; // hash -> {sockets: {K1: [termsIds]}, asSpec: n, statementKinds: [ids], namedBy: [actIds]}
const N = (x) => (named[x] ??= { hash: x, sockets: {}, actsUnderSpec: [], k7Statements: [], namedBy: new Set() });
const sock = (x, k, t) => { if (!x) return; const n = N(x); (n.sockets[k] ??= []).push(t.id); n.namedBy.add(t.id); };
const CORE = new Set([...Object.values(SPECS), AG.terms.spec, AG.report.spec]);
for (const a of acts) {
  if (a.spec && !CORE.has(a.spec)) N(a.spec).actsUnderSpec.push(a.id);
  if (a.specName === 'agreements' && a.type === 0 && a.payload) {
    const p = a.payload;
    sock(h(p['4']?.[1]?.[0]), 'K1 body', a);
    sock(h(p['6']?.[0]), 'K2 in_force', a);
    for (const pw of p['7'] ?? []) { sock(h(pw?.[1]?.[0]), 'K3 power rule', a); if (h(pw?.[0])) sock(h(pw[0]), 'K7 kind (in a power)', a); }
    sock(h(p['13']?.[0]), 'K4 condition', a);
    for (const party of p['2'] ?? []) if (party?.[0] === 1) sock(h(party[1]?.['2']?.[0]), 'K5 spot', a);
    sock(h(p['14']?.[0]), 'K6 control', a);
    sock(h(p['16']?.[0]), 'K8 data', a);
  }
  if (a.specName === 'agreements' && a.type === 1 && a.payload && Array.isArray(a.payload['2'])) { const x = h(a.payload['2'][0]); if (x) { N(x).k7Statements.push(a.id); N(x).namedBy.add(a.id); } }
}
// Any other act naming a held text's fingerprint anywhere in its payload or refs (relies_on included).
const walk = (v, f) => { if (Array.isArray(v)) v.forEach((x) => walk(x, f)); else if (v && typeof v === 'object') { if (typeof v.h === 'string') f(v.h); else Object.values(v).forEach((x) => walk(x, f)); } };
const textNaming = {};
for (const a of acts) {
  const seen = new Set();
  walk(a.payload, (x) => seen.add(x));
  for (const r of a.refs ?? []) seen.add(typeof r === 'string' ? r : r?.id ?? r);
  if (a.payload && typeof a.payload['0'] === 'string') for (const m of a.payload['0'].matchAll(/\b[0-9a-f]{64}\b/g)) seen.add(m[0]);
  for (const x of seen) {
    if (!byHash[x] || x === a.id) continue;
    const e = byHash[x].filter((y) => y.how !== 'act' || y.text !== 'act:' + a.id);
    if (!e.length) continue;
    (textNaming[x] ??= new Set()).add(a.id);
  }
}
for (const [x, s] of Object.entries(textNaming)) { const n = N(x); for (const id of s) n.namedBy.add(id); }
const out = Object.values(named).map((n) => ({ ...n, namedBy: [...n.namedBy], held: byHash[n.hash] ?? [] }));
writeFileSync(join(OUT, 'named.json'), JSON.stringify(out));
const inSocket = out.filter((n) => Object.keys(n.sockets).length || n.k7Statements.length);
console.log({ named: out.length, inSocket: inSocket.length, inSocketHeld: inSocket.filter((n) => n.held.length).length, asSpec: out.filter((n) => n.actsUnderSpec.length).length });
for (const n of inSocket.sort((a,b)=>b.namedBy.length-a.namedBy.length)) console.log(n.hash.slice(0, 12), Object.entries(n.sockets).map(([k, v]) => k.split(' ')[0] + ':' + v.length).join(','), n.k7Statements.length ? 'K7st:' + n.k7Statements.length : '', n.held.map((e) => e.how + ':' + e.text.slice(0, 40)).slice(0, 2).join(' | '));
