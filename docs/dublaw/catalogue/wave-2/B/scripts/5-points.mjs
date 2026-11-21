// DubLaw wave 2, session B. Step 5: the known starting points, checked against what was decoded; forks and resolves in
// the rerun's entries; Terms words that are starting points; the evidence to pass to the MOR lead.
// Usage: node 5-points.mjs RESEARCH_DIR OUT_DIR   (after steps 1 to 4). Writes OUT_DIR/points.json.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const [R, OUT] = process.argv.slice(2);
const acts = readFileSync(join(OUT, 'acts.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
const byId = new Map(acts.map((a) => [a.id, a]));
const L = JSON.parse(readFileSync(join(OUT, 'listing-raw.json'), 'utf8'));
const textOf = (a) => (a?.payload && typeof a.payload['0'] === 'string' ? a.payload['0'] : null);
const first = (a) => (textOf(a) ?? '').split('\n').find((l) => l.trim())?.replace(/^#\s*/, '') ?? '';
const isTerms = (a) => a.specName === 'agreements' && a.type === 0 && a.payload;
const isSt = (a) => a.specName === 'agreements' && a.type === 1 && a.payload;
const H = (x) => x?.h ?? null;
const ID = { dublaw: '218a2a934f1e5883984bdfce9d45e30ad4004d2522fa99089306d9f9d37f82dd', plainWords: '76a78f70bc47ba945ce7ab081facc4f0327ba3698efffc4deccf11adce7aeb59', until: '3022fb293b6376834a4ced0fed7ae9402f77d9f616bea8bf6080df61b2ac89e7' };
const by = (re, signer) => L.filter((e) => re.test(e.title ?? '') && (!signer || e.author === signer));
const row = (e) => ({ fingerprint: e.fingerprint, title: e.title, draft: e.draft, act: e.publishedBy, author: e.author, terms: e.use.terms });
const point = (name, entries, note) => ({ point: name, found: entries.length > 0, entries: entries.map((x) => (x.fingerprint ? row(x) : x)), note: note ?? null });
// The Terms that name a text's words (body words, key 4, item 0) by any fingerprint held for it
const { byHash } = JSON.parse(readFileSync(join(OUT, 'texts.json'), 'utf8'));
const wordsTerms = {};
for (const a of acts) if (isTerms(a)) { const w = H(a.payload['4']?.[0]); if (w) (wordsTerms[w] ??= []).push(a.id); }
function termsOfWords(textAct) {
  const out = new Set();
  for (const [h, es] of Object.entries(byHash)) if (es.some((e) => e.text === 'act:' + textAct) && wordsTerms[h]) wordsTerms[h].forEach((t) => out.add(t));
  return [...out];
}
const words = (re, signer) => acts.filter((a) => a.specName === 'text' && textOf(a) && re.test(first(a)) && (!signer || a.signer === signer)).map((a) => ({ textAct: a.id, title: first(a).slice(0, 140), author: a.signer, termsNamingItsWords: termsOfWords(a.id) }));

const points = [];
points.push(point("DubLaw's named signers", by(/named signers/i, ID.dublaw)));
points.push(point("DubLaw's buyer by assent", by(/buyer by assent/i, ID.dublaw), 'draft 2 is named in two windows\' reports; no text of it is held (see report-names-unmatched.json)'));
const sw = by(/^cMIP shower work, draft \d+$/i, ID.dublaw).sort((a, b) => a.draft - b.draft);
points.push(point('Shower work drafts 1 to 12', sw, `drafts held: ${sw.map((e) => e.draft).join(', ')}; missing: ${[...Array(12).keys()].map((i) => i + 1).filter((d) => !sw.some((e) => e.draft === d)).join(', ') || 'none'}`));
points.push(point("Plain Words' shares nobody may rewrite", by(/shares nobody may rewrite/i, ID.plainWords).sort((a, b) => a.draft - b.draft)));
points.push(point("Plain Words' room let", by(/room let/i, ID.plainWords).sort((a, b) => a.draft - b.draft), 'a template of Terms words, not a cMIP: listed as a Module-like text'));
points.push(point("Plain Words' in force by the condition", by(/in force by the condition/i, ID.plainWords).sort((a, b) => a.draft - b.draft)));
points.push(point("Until's escrow drafts", by(/^cMIP escrow/i, ID.until).sort((a, b) => a.draft - b.draft), 'drafts 3 and 4 are named in sockets by the act id of their text, not by spec hash; draft 4 is also listed under its spec hash, which other texts cite'));
const untilArb = acts.filter((a) => a.signer === ID.until && a.specName === 'text' && /^cMIP[^\n]*arbit/i.test(first(a)));
const untilArbMentions = acts.filter((a) => a.signer === ID.until && a.specName === 'text' && /arbit/i.test(textOf(a) ?? '')).length;
const escrowWithArbiter = by(/^cMIP escrow/i, ID.until).filter((e) => /arbit/i.test(textOf(byId.get(e.publishedBy)) ?? '')).map((e) => e.draft);
points.push(point("Until's arbiter drafts", untilArb.map((a) => ({ textAct: a.id, title: first(a).slice(0, 140) })), `no text act by Until titled as an arbiter cMIP. ${untilArbMentions} of Until's texts mention an arbiter; escrow drafts ${[...new Set(escrowWithArbiter)].sort((a, b) => a - b).join(', ')} speak of one inside them`));
points.push(point("DubLaw's arbiter's award, drafts 1 and 2", by(/arbiter's award/i, ID.dublaw).sort((a, b) => a.draft - b.draft)));
points.push(point("The clusters' consent to be recorded", by(/consent to be recorded/i)));
points.push(point('Kept Word: delivery receipt', by(/delivery receipt/i).sort((a, b) => a.draft - b.draft)));
points.push(point("Kept Word: the makers' guild (its charter)", words(/^Kept Word, a guild of makers/), 'Terms words (a charter), not a cMIP'));
// consignment: Terms by Léa Marchand naming Léa Faure among parties; and the plain-words page
const lm = '0a3025aea5b95c4b20b19e3bdc77f347e891ef7c4d2cfa1be20283d0eddcfe5f';
const lf = acts.find((a) => a.id.startsWith('5108dade'))?.signer;
const consTerms = acts.filter((a) => isTerms(a) && a.signer === lm && (a.payload['2'] ?? []).some((p) => p?.[0] === 0 && H(p[1]) === lf)).map((a) => ({ terms: a.id, bodyCmip: H(a.payload['4']?.[1]?.[0]), parties: a.payload['2'].length }));
const consPage = acts.filter((a) => a.signer === lm && a.specName === 'text' && /dépôt|consign/i.test(textOf(a) ?? '')).map((a) => ({ textAct: a.id, title: first(a).slice(0, 140) }));
points.push(point('The consignment Terms', [...consTerms, ...consPage], `found by: Terms signed by Léa Marchand (${lm.slice(0, 8)}…) naming Léa Faure (${lf?.slice(0, 8)}…) as a signer party, and her texts mentioning dépôt or consignment. The clusters' report says the Terms were written and deliberately left unsigned: ${consTerms.length} such Terms decoded`));
const odile = 'd79c1ba74980bd25ba90b84ed598933cb6b934267b4a9583e4e9327db79970ff';
const com = words(/^Commission 1/i, odile);
const comTerms = acts.filter((a) => isTerms(a) && a.signer === odile).map((a) => ({ terms: a.id, bodyCmip: H(a.payload['4']?.[1]?.[0]), inForce: H(a.payload['6']?.[0]), condition: H(a.payload['13']?.[0]), data: H(a.payload['16']?.[0]), replaces: H(a.payload['0']) }));
const readingRules = acts.filter((a) => a.signer === odile && a.specName === 'text' && /lecteur|reader|lecture|reading/i.test(textOf(a) ?? '') && /r[eè]gle|rule/i.test(textOf(a) ?? '')).map((a) => ({ textAct: a.id, title: first(a).slice(0, 140) }));
points.push(point("Odile Ferrant's Commission 1", [...com, ...comTerms], 'Terms words and Terms, not a cMIP; their sockets name the cMIPs listed in the tables'));
const comReaders = com.filter((c) => /\nREADERS:/.test(textOf(byId.get(c.textAct)) ?? ''));
points.push(point("Commission 1's reading rules", comReaders.map((c) => ({ textAct: c.textAct, title: 'the READERS paragraph of ' + c.title.slice(0, 40) })), `no separate text: the rules for readers are a paragraph (READERS) inside Commission 1's words, in ${comReaders.length} of its ${com.length} word texts (inferred: read, not counted). By keyword, Odile Ferrant's texts also hold "Word in advance" 1 and 2 (${readingRules.map((r) => r.textAct.slice(0, 8)).join(', ')}): Terms words on what to believe if her identity is taken, not reading rules`));
points.push(point('Proven claim', by(/proven claim/i).sort((a, b) => a.draft - b.draft)));

// ---- Forks and resolves in the rerun's entries (hosts/count-rerun.json, entries' Terms roots and receiver deals)
const rr = JSON.parse(readFileSync(join(R, 'hosts/count-rerun.json'), 'utf8'));
const roots = new Map();
for (const e of rr.entries) { if (e.terms_root) roots.set(e.terms_root, { entry: e.work, part: 'work Terms', verdict: e.verdict }); if (e.receiver_deal) roots.set(e.receiver_deal, { entry: e.work, part: 'receiver deal', verdict: e.verdict }); }
const agreementOf = (a) => (isTerms(a) ? H(a.payload['1']) ?? a.id : isSt(a) ? H(a.payload['0']) : null);
const prevOf = (a) => { const p = isTerms(a) ? a.payload['19'] : a.payload['6']; return Array.isArray(p) && p.length ? H(p[0]) : null; };
const inAg = {};
for (const a of acts) if (isTerms(a) || isSt(a)) { const g = agreementOf(a); if (roots.has(g)) (inAg[g] ??= []).push(a); }
const forks = [];
for (const [g, list] of Object.entries(inAg)) {
  const seen = {};
  for (const a of list) { if (isSt(a) && a.payload['2'] === 3) continue; const k = a.signer + '|' + (prevOf(a) ?? 'none'); (seen[k] ??= []).push(a); }
  const resolves = list.filter((a) => isSt(a) && a.payload['2'] === 3).map((a) => ({ act: a.id, signer: a.signer, resolves: (a.payload['10'] ?? []).map(H), continues: H(a.payload['11']), order: a.order }));
  const tips = Object.entries(seen).filter(([, v]) => v.length > 1).map(([k, v]) => ({ signer: k.split('|')[0], previous: k.split('|')[1], acts: v.sort((x, y) => x.order - y.order).map((a) => a.id) }));
  // a fork of versions: two Terms acts in the agreement that replace the same version
  const rep = {};
  for (const a of list) if (isTerms(a) && H(a.payload['0'])) (rep[H(a.payload['0'])] ??= []).push(a);
  const versionForks = Object.entries(rep).filter(([, v]) => v.length > 1).map(([r, v]) => ({ replaced: r, versions: v.sort((x, y) => x.order - y.order).map((a) => a.id) }));
  if (tips.length || resolves.length || versionForks.length) forks.push({ agreement: g, ...roots.get(g), lineForks: tips, versionForks, resolves });
}
const allResolves = acts.filter((a) => isSt(a) && a.payload['2'] === 3).length;
// ---- Assents naming a Terms version that a later Terms act replaces (for the MOR lead: how they were counted)
const replaced = new Set(acts.filter((a) => isTerms(a) && H(a.payload['0'])).map((a) => H(a.payload['0'])));
const assentsToReplaced = acts.filter((a) => isSt(a) && a.payload['2'] === 0 && replaced.has(H(a.payload['1'])));
const lead = {
  defaults: { question: 'whether named signers and buyer by assent should be the grammar\'s default', acts: L.filter((e) => /named signers|buyer by assent/i.test(e.title ?? '') && e.author === ID.dublaw).map((e) => ({ text: e.publishedBy, fingerprint: e.fingerprint, termsNamingIt: e.use.terms, assents: e.use.assents })) },
  forksAndResolves: { question: 'how assents to replaced versions, resolved forks and in force at a deadline were counted', resolveStatementsInRerunEntries: forks.flatMap((f) => f.resolves.map((r) => r.act)), forkTipsInRerunEntries: forks.flatMap((f) => [...f.lineForks.flatMap((x) => x.acts), ...f.versionForks.flatMap((x) => x.versions)]), assentsToReplacedVersions: assentsToReplaced.length, assentsToReplacedVersionsIds: assentsToReplaced.map((a) => a.id) },
  place: { question: "Postmark's place's role in ordering acts between signers", specsOfThePlace: L.filter((e) => e.held === 'not held' && e.actsUnderIt).map((e) => ({ spec: e.fingerprint, acts: e.actsUnderIt, signers: e.signersUnderIt?.length ?? 0 })) },
};
writeFileSync(join(OUT, 'points.json'), JSON.stringify({ points, rerunForks: { agreements: forks.length, totalResolveStatementsDecoded: allResolves, list: forks }, lead }, null, 1));
for (const p of points) console.log(p.found ? 'FOUND ' : 'NOT   ', p.point, p.entries.length, (p.note ?? '').slice(0, 120));
console.log('rerun agreements with forks or resolves', forks.length, 'resolves decoded', allResolves, 'assents to replaced', assentsToReplaced.length);
for (const f of forks) console.log(' ', f.agreement.slice(0, 8), f.part, f.verdict, 'line forks', f.lineForks.length, 'version forks', f.versionForks.length, 'resolves', f.resolves.length);
