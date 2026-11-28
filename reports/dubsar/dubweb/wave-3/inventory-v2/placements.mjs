// placements.mjs — DubWeb wave 3 A: the three Dubs' wave-2 placements of each text, by spec hash or act id. Read only.
import { readFileSync } from 'node:fs';
const T = new URL('../../../', import.meta.url).pathname;
const J = (p) => JSON.parse(readFileSync(T + p, 'utf8'));
export const web = J('dubweb/wave-2/results/inventory-web.json');
export const pay = J('dubpay/wave-2/results/B/listing-money.json');
export const law = J('dublaw/wave-2/results/B/listing-agreements.json');
const PAYCAT = pay.categories;
const LAWCAT = { 1: 'When Terms are in force, and who signs', 2: 'Ownership and collectives', 3: 'Disputes', 4: 'Consent and terms for people', 5: 'Leaving and carrying on' };
export { PAYCAT, LAWCAT };
const area = (s) => s;
/** keys: full spec hashes and act ids of one text. Returns the three placements. */
export function placementsOf(keys) {
  const K = new Set(keys.filter(Boolean));
  const out = { DubWeb: null, DubPay: null, DubLaw: null };
  const w = web.specifications.find((s) => K.has(s.spec_hash) || s.acts_same_text.some((a) => K.has(a)));
  if (w) { const c = w.category.category; out.DubWeb = { area: c === 'unassigned' ? null : c.startsWith("not DubWeb's: DubPay") ? 'Money' : c.startsWith("not DubWeb's: DubLaw") ? 'Agreements' : 'Web', category: c, reason: w.category.reason, listed: 'specifications' }; }
  else if (web.named_as_a_spec_but_no_text_found.some((x) => K.has(x.hash))) out.DubWeb = { area: null, category: 'named as a spec, no text found', listed: 'named_as_a_spec_but_no_text_found' };
  else if (web.draft_titled_texts_not_included.some((x) => K.has(x.act) || K.has(x.spec_hash_kind_0))) out.DubWeb = { area: null, category: 'draft-titled, not included', listed: 'draft_titled_texts_not_included' };
  for (const e of pay.entries) for (const d of e.drafts ?? []) if (K.has(d.spec) || K.has(d.act) || K.has(d.wordsTextAct)) {
    out.DubPay = { area: 'Money', category: `${e.category}. ${PAYCAT[e.category]}`, also_in: (e.alsoIn ?? []).map((c) => `${c}. ${PAYCAT[c]}`), entry: e.key, draft: d.draft, kind: e.kind }; }
  if (!out.DubPay) for (const b of pay.beside ?? []) if (K.has(b.spec) || K.has(b.act)) out.DubPay = { area: /DubLaw/.test(b.what) ? 'Agreements' : /DubWeb/.test(b.what) ? 'Web' : 'not Money (beside)', category: 'beside: ' + b.what, listed: 'beside' };
  const l = law.entries.find((e) => K.has(e.fingerprint) || K.has(e.specHash) || K.has(e.publishedBy) || (e.sameTextAs ?? []).some?.((a) => K.has(a)));
  if (l) { const c = String(l.category); out.DubLaw = { area: /^[1-5]$/.test(c) ? 'Agreements' : c === 'other: DubWeb' ? 'Web' : c === 'other: DubPay' ? 'Money' : null, category: /^[1-5]$/.test(c) ? `${c}. ${LAWCAT[c]}` : c, ground: l.ground, fingerprint: l.fingerprint, held: l.held }; }
  return out;
}
