// node text.mjs DATA KIT IDPREFIX... : prints a public text act's words to the terminal, for reading only.
import { loadCore, loadActs } from './round.mjs';
const [data, kit, ...ids] = process.argv.slice(2);
const { mor } = await loadCore(kit);
const all = loadActs(mor, data);
for (const p of ids) {
  const id = [...all.keys()].find((k) => k.startsWith(p));
  if (!id) { console.log(p, 'not found'); continue; }
  const d = mor.describeAct(all.get(id).bytes);
  const m = mor.cborDecode(Uint8Array.from(Buffer.from(d.payload, 'hex')));
  console.log(`===== ${id.slice(0, 8)} by ${d.signer.slice(0, 8)} spec ${d.spec.slice(0, 8)} type ${d.type} refs ${d.refs.map((x) => x.slice(0, 8))}`);
  console.log(m instanceof Map ? (typeof m.get(0) === 'string' ? m.get(0) : m) : m);
}
