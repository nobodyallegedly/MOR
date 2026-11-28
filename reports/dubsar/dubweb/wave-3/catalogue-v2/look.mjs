// DubWeb wave 3, session C: look one thing up in the research copy (public acts only), to read a cited act.
//   node look.mjs show ID-PREFIX [CHARS]      an act's signer, spec, type, position, homes and words
//   node look.mjs grep 'REGEX' [CHARS]        public acts whose words match
//   node look.mjs texts SIGNER-PREFIX         a signer's public text acts, first line each
//   node look.mjs naming HASH-PREFIX [CHARS]  acts naming a 32-byte value (spec hash or act id), with the way
//   node look.mjs answers ID-PREFIX [CHARS]   acts whose refs hold this act
import { acts, named, textOf, wordsOf, rest, specOfText, AGREEMENTS, TEXT_MIR } from './read.mjs';
const [mode, arg, n] = rest;
const N = Number(n ?? 300);
const lab = (s) => s === TEXT_MIR ? 'Text' : s === AGREEMENTS ? 'Agreements' : s.slice(0, 8);
const show = (id, x, chars = N, extra = '') => {
  const d = x.d;
  console.log(`${id} signer ${d.signer.slice(0, 8)} ${lab(d.spec)} type ${d.type} pos ${d.position} homes ${Object.entries(x.seen).map(([h, a]) => h + ':' + a[0]).join(',')}${specOfText.has(id) ? ' spec-of-text ' + specOfText.get(id).slice(0, 8) + '…' + specOfText.get(id).slice(-4) : ''} ${extra}\n    ${wordsOf(d).slice(0, chars).replace(/\n/g, ' / ')}`);
};
if (mode === 'show') for (const [id, x] of acts) if (id.startsWith(arg)) show(id, x, Number(n ?? 100000));
if (mode === 'grep') { const re = new RegExp(arg, 'i'); for (const [id, x] of acts) { const w = wordsOf(x.d); const m = re.exec(w); if (m) { const d = x.d; console.log(`${id} signer ${d.signer.slice(0, 8)} ${lab(d.spec)} t${d.type} pos ${d.position} len ${w.length}\n    …${w.slice(Math.max(0, m.index - N / 3), m.index + N).replace(/\n/g, ' / ')}`); } } }
if (mode === 'texts') for (const [id, x] of [...acts].sort((a, b) => (a[1].d.position ?? 0) - (b[1].d.position ?? 0))) if (x.d.signer.startsWith(arg) && textOf(x.d) != null) show(id, x, Number(n ?? 110));
if (mode === 'naming') for (const [h, list] of named) if (h.startsWith(arg)) for (const [id, way] of list) show(id, acts.get(id), N, `[${way}]`);
if (mode === 'answers') for (const [h, list] of named) if (h.startsWith(arg)) for (const [id, way] of list) if (way === 'refs') show(id, acts.get(id), N);
