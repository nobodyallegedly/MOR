// The census's decoder: the kit's own core library (describeAct,
// agreementsNewCheck, agreementsNewCheckHeld, agreementsNewAsk), in Node.js,
// no network. Reads on stdin a JSON list of homes, each with the paths of
// its feed pages (or record pages) and/or its items as hex; reads those files
// in place; prints counts only, as JSON, on stdout. Writes nothing.
//
// node census-kit.mjs KIT_DIR < homes.json
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const kitDir = process.argv[2];
if (!kitDir) throw new Error('usage: node census-kit.mjs KIT_DIR < homes.json');
const { mor, plain, SPECS } = await import(pathToFileURL(resolve(kitDir, 'lib/core.mjs')).href);

const NEW = plain(mor.agreementsNewSpecs());
const specName = new Map([...Object.entries(SPECS).map(([k, v]) => [v, k]), [NEW.terms.spec, 'agreements draft 25'], [NEW.report.spec, 'report block 4']]);
const typeName = (spec, type) => {
  if (spec === NEW.terms.spec) return type === 0 ? 'Terms' : type === 1 ? 'Statement' : `type ${type}`;
  if (spec === NEW.report.spec) return type === 0 ? 'report' : `type ${type}`;
  return `type ${type}`;
};
const bump = (o, k, n = 1) => { o[k] = (o[k] ?? 0) + n; };

const input = JSON.parse(readFileSync(0, 'utf8'));
const out = [];
for (const home of input) {
  const items = new Map(); // arrival -> [kind, bytes]
  for (const p of home.pages ?? []) {
    const m = mor.cborDecode(new Uint8Array(readFileSync(p)));
    if (home.records) {
      // A place's record page: a list of byte strings, one per entry.
      const list = m instanceof Map ? m.get(0) : m;
      list.forEach((b, n) => items.set(`${p}#${n}`, [0, b instanceof Uint8Array ? b : b[b.length - 1]]));
      continue;
    }
    for (const [arrival, kind, bytes] of m.get(0)) items.set(String(arrival), [Number(kind), bytes]);
  }
  for (const [arrival, kind, h] of home.items ?? []) items.set(String(arrival), [kind, Uint8Array.from(Buffer.from(h, 'hex'))]);

  const c = { home: home.name, note: home.note ?? null, items: items.size, byKind: {}, byType: {}, check: {}, checkHeld: {}, terms: {}, termsTotal: 0, askErrors: 0 };
  const acts = [];
  for (const [kind, bytes] of items.values()) {
    if (kind === 1) { bump(c.byKind, 'sealed container'); continue; }
    if (kind !== 0) { bump(c.byKind, `kind ${kind}`); continue; }
    acts.push(bytes);
    let d;
    try { d = mor.describeAct(bytes); } catch { bump(c.byKind, 'act, does not decode'); }
    if (d) {
      bump(c.byKind, d.public ? 'act, public' : 'act, private');
      bump(c.byType, d.public ? `${specName.get(d.spec) ?? 'other spec'} / ${typeName(d.spec, d.type)}` : 'private act (not opened: no spec or type read)');
    }
    let v;
    try { v = mor.agreementsNewCheck(bytes).verdict; } catch { v = 'check threw'; }
    bump(c.check, v);
  }
  let held = [];
  try { held = mor.agreementsNewCheckHeld(acts.map((a) => ({ act: a }))); } catch { held = null; }
  if (held) held.forEach((a) => bump(c.checkHeld, a.verdict)); else c.checkHeld = { 'check threw': acts.length };
  // Terms acts: a check alone of pass or invalid, draft 25's spec, type 0.
  const terms = [];
  acts.forEach((a, n) => {
    const r = (held ?? [])[n];
    const alone = mor.agreementsNewCheck(a);
    if ((alone.verdict === 'pass' || alone.verdict === 'invalid') && alone.act === 'Terms') terms.push(alone.id);
  });
  c.termsTotal = terms.length;
  const all = acts.map((b) => ({ bytes: b }));
  for (const id of terms) {
    try {
      const ans = JSON.parse(mor.agreementsNewAsk({ acts: all, ask: 'in_force', args: [id] }));
      bump(c.terms, ans.length ? ans.map((a) => a.word).join(' + ') : '(no answer)');
    } catch { c.askErrors++; }
  }
  out.push(c);
}
process.stdout.write(JSON.stringify(out));
