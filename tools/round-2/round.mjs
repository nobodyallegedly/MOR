// Reads the round's data in place, into memory only. Paths are given at run
// time: DATA (the research copy) and KIT (a kit folder, tools/postman/kit).
// Nothing is written by this module. No data inside.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const hex = (b) => Buffer.from(b).toString('hex');
export const s8 = (h) => (h ? h.slice(0, 8) + '…' : 'none');

export async function loadCore(kit) {
  const mod = await import(pathToFileURL(join(kit, 'lib', 'core.mjs')).href);
  return mod;
}

export function plain(v) {
  if (v instanceof Uint8Array) return hex(v);
  if (typeof v === 'bigint') return v.toString();
  if (v instanceof Map) return { map: [...v].map(([k, x]) => [plain(k), plain(x)]) };
  if (Array.isArray(v)) return v.map(plain);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, plain(x)]));
  return v;
}

/** Every act of the data: windows' .mor files, feed pages, place records. Map id -> { bytes, where:Set } */
export function loadActs(mor, data, { feeds = true } = {}) {
  const acts = new Map();
  const add = (bytes, where) => {
    let id;
    try { id = mor.actId(bytes); } catch { return; }
    if (typeof id !== 'string') id = hex(id);
    const e = acts.get(id);
    if (e) e.where.add(where);
    else acts.set(id, { bytes, where: new Set([where]) });
  };
  const w = join(data, 'windows');
  for (const name of readdirSync(w)) {
    const dir = join(w, name, 'acts');
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (!f.endsWith('.mor')) continue;
      const p = join(dir, f);
      // A file named by its act's id is taken at its name; any other name is read and its id computed.
      let id = /^[0-9a-f]{64}\.mor$/.test(f) ? f.slice(0, 64) : null;
      let bytes = null;
      if (!id) {
        bytes = new Uint8Array(readFileSync(p));
        try { id = mor.actId(bytes); if (typeof id !== 'string') id = hex(id); } catch { continue; }
      }
      const e = acts.get(id);
      if (e) { e.where.add('window:' + name); (e.files ??= []).push(p); continue; }
      acts.set(id, { bytes: bytes ?? new Uint8Array(readFileSync(p)), where: new Set(['window:' + name]), files: [p] });
    }
  }
  if (feeds) {
    const fd = join(data, 'feeds');
    for (const home of readdirSync(fd)) {
      const dir = join(fd, home);
      if (!statSync(dir).isDirectory()) continue;
      for (const f of readdirSync(dir)) {
        if (!/^feed-after-\d+\.cbor$/.test(f)) continue;
        const page = mor.cborDecode(new Uint8Array(readFileSync(join(dir, f))));
        const rows = page instanceof Map ? page.get(0) : page;
        for (const row of rows ?? []) {
          const bytes = Array.isArray(row) ? row[row.length - 1] : row;
          if (bytes instanceof Uint8Array) add(bytes, 'feed:' + home);
        }
      }
    }
  }
  return acts;
}

/** The place's records, in order: [{ n, id (the record's own id), payload }] */
export function loadPlace(mor, data) {
  const dir = join(data, 'feeds', 'postmark-place');
  const files = readdirSync(dir).filter((f) => /^records-\d+\.cbor$/.test(f)).sort((a, b) => parseInt(a.slice(8)) - parseInt(b.slice(8)));
  const out = [];
  for (const f of files) {
    const page = mor.cborDecode(new Uint8Array(readFileSync(join(dir, f))));
    for (const bytes of page) {
      const d = mor.describeAct(bytes);
      out.push({ bytes, d });
    }
  }
  return out;
}
