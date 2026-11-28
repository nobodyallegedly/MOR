// DubLaw's file, for the shared reader: a deal's six parameters under straight split draft 7, section 6, as the hosts' second
// reading says (act 8f359f8b…) and as DubPay's seam act 6e9ddac0… (J4, edition 2; DubLaw yes 5f756dc1…) reads them:
// any keys (and DubPay's better, act 6921 on DubWeb's 54d0e8d8…: a parameter absent from control, in a deal that carries words,
// reads 'not in control: read the words', unchecked; MISSING only where the deal has no words). Integer keys 0 fee, 1 cap, 2 cap per receiver, 3 deadline, 4 rail, 5 place; or text keys, case-insensitive,
// ignoring spaces, hyphens and underscores. Parameters held in the deal's words, not in control: unchecked, never MISSING.
export type Param = { name: string; state: 'named' | 'MISSING' | 'unchecked'; value?: unknown; why?: string };
const SIX: [string, number, string[]][] = [
  ['fee', 0, ['fee']], ['cap', 1, ['cap']], ['cap per receiver', 2, ['capperreceiver', 'perreceiver', 'receivercap']],
  ['deadline', 3, ['deadline']], ['rail', 4, ['rail']], ['place', 5, ['place', 'lodgedat']],
];
const norm = (k: string) => k.toLowerCase().replace(/[\s_-]/g, '');
const isUint = (v: unknown) => Number.isInteger(v) && (v as number) >= 0;
function valueOk(i: number, v: unknown): boolean {
  if (i === 0) return isUint(v) || (Array.isArray(v) && v.length === 1 && isUint(v[0]));
  if (i <= 3) return isUint(v);
  return typeof v === 'string' && v.length > 0;
}
// params: control's decoded parameters (a Map, a plain object, or null). paramsInWords: the deal carries words, which may name the rest.
export function dealParameters(params: unknown, paramsInWords = false): { params: Param[]; meets: boolean | null; line: string } {
  const m = new Map<string, unknown>(); const ints = new Map<number, unknown>();
  const put = (k: unknown, v: unknown) => { if (typeof k === 'number') ints.set(k, v); else if (typeof k === 'string') m.set(norm(k), v); };
  if (params instanceof Map) for (const [k, v] of params) put(k, v);
  else if (params && typeof params === 'object' && !Array.isArray(params)) for (const [k, v] of Object.entries(params)) put(/^[0-9]+$/.test(k) ? Number(k) : k, v);
  const out: Param[] = SIX.map(([name, i, keys]) => {
    const has = ints.has(i) ? ints.get(i) : keys.find((k) => m.has(k)) !== undefined ? m.get(keys.find((k) => m.has(k))!) : undefined;
    const present = ints.has(i) || keys.some((k) => m.has(k));
    if (!present) return paramsInWords ? { name, state: 'unchecked', why: 'not in control: read the words' } : { name, state: 'MISSING' };
    return valueOk(i, has) ? { name, state: 'named', value: has } : { name, state: 'unchecked', value: has, why: 'a value of another form' };
  });
  const missing = out.filter((p) => p.state === 'MISSING').map((p) => p.name);
  if (missing.length) return { params: out, meets: false, line: `does not meet straight split draft 7, section 6: missing ${missing.join(', ')}` };
  const notIn = out.filter((p) => p.why === 'not in control: read the words').map((p) => p.name);
  if (out.every((p) => p.state === 'named')) return { params: out, meets: true, line: 'section 6: all six named' };
  return { params: out, meets: null, line: notIn.length ? `unchecked: ${notIn.join(', ')} not in control: read the words` : 'section 6: all six named, some values unchecked' };
}
