// The accepted cMIP, draft 1 (`cmips/cmip-accepted-draft-1.md`, F340): the
// list of specifications a person accepts, a private act sealed to their
// own identity at its homes, read by any app holding the identity, each
// applying the part it understands. Damgar changes the Money layer's part
// (`specs.ts`, OURS) and keeps every other entry as it found it.
//
// Two apps writing at once fork it; the next writer merges the branches
// against their last common act, never dropping a change (2.6), and reads
// the tips again just before sending (2.5).

import { MIRS, SPECS, Verifier, cborDecode, cborEncode, hex, openSealed, unhex, xwingPublic } from '../../genesis/src/core.ts';
import { sealFor, type TestIdentity } from '../../genesis/src/identity.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { relayAt, type Via } from '../../genesis/src/transport.ts';
import { ACCEPTED_SPEC, labelOf } from './specs.ts';

export const SEALED_LIST = 1;
export const PUBLISHED_LIST = 0;

export interface ListAct {
  id: string;
  version: number;
  previous: string | null;
  merged: string[];
  entries: Map<string, string | null>;
}

export interface Accepted {
  /** What counts: the one tip, or the merge of the tips. */
  entries: Map<string, string | null>;
  /** The tips read (one, or several where forked). */
  tips: ListAct[];
  /** Where forked: what the merge took from each branch, in plain words. */
  merged: string[];
  /** The highest version among the tips. */
  version: number;
  problems: string[];
}

interface Opened {
  act: Uint8Array;
  key?: Uint8Array;
  described: { id: string; signer?: string; public: boolean; spec?: string; type?: number; payload?: Uint8Array };
}

export function listPayload(a: { version: number; previous: string | null; merged: string[]; entries: Map<string, string | null> }, withdrawn = false): Uint8Array {
  const m = new Map<number, unknown>([[0, a.version]]);
  if (a.previous) m.set(1, unhex(a.previous));
  m.set(
    2,
    [...a.entries.entries()]
      .sort(([x], [y]) => (x < y ? -1 : 1))
      .map(([h, label]) => (label ? [unhex(h), label.slice(0, 120)] : [unhex(h)])),
  );
  if (a.merged.length) m.set(3, a.merged.map(unhex));
  if (withdrawn) m.set(4, true);
  return cborEncode(m);
}

function readList(id: string, payload: Uint8Array): ListAct | null {
  try {
    const m = cborDecode(payload) as Map<number, unknown>;
    for (const k of m.keys()) if (![0, 1, 2, 3].includes(k)) return null;
    const version = m.get(0);
    if (typeof version !== 'number' || version < 1) return null;
    const prev = m.get(1);
    // Version 1 names no predecessor; every later one does.
    if ((version === 1) !== (prev === undefined)) return null;
    const entries = new Map<string, string | null>();
    for (const x of m.get(2) as unknown[]) {
      if (!Array.isArray(x) || !(x[0] instanceof Uint8Array) || x[0].length !== 32) return null;
      entries.set(hex(x[0]), typeof x[1] === 'string' ? x[1].slice(0, 120) : null);
    }
    const merged = ((m.get(3) as unknown[] | undefined) ?? []).map((x) => {
      if (!(x instanceof Uint8Array) || x.length !== 32) throw new Error('merged');
      return hex(x);
    });
    return { id, version, previous: prev instanceof Uint8Array ? hex(prev) : null, merged, entries };
  } catch {
    return null;
  }
}

/** Every valid act of the list at the identity's homes (2.4). */
async function readActs(identity: string, secrets: Uint8Array[], homes: string[], via: Via): Promise<{ acts: Map<string, ListAct>; problems: string[] }> {
  const acts = new Map<string, ListAct>();
  const problems: string[] = [];
  if (!secrets.length) return { acts, problems: ['this app holds no encryption key of this identity'] };
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  let l: Awaited<ReturnType<typeof lookUp>>;
  try {
    l = await lookUp(identity, homes, via, v);
  } catch (e) {
    return { acts, problems: [`its homes did not answer (${e instanceof Error ? e.message : String(e)})`] };
  }
  const at = [...new Set([...homes, ...l.resolution.homes.map((h) => h.hint)])];
  for (const h of at) {
    let after: number | undefined;
    try {
      for (;;) {
        const page = await relayAt(h, via).feed({ to: identity, after });
        for (const it of page.items) {
          if (it.kind !== 'sealed') continue;
          let o: Opened | null = null;
          for (const s of secrets) {
            try {
              o = openSealed(it.item, identity, s) as Opened;
              break;
            } catch {
              // the next key
            }
          }
          const d = o?.described;
          if (!o || !d || acts.has(d.id) || d.public || d.signer !== identity || d.spec !== ACCEPTED_SPEC || d.type !== SEALED_LIST || !d.payload) continue;
          if (o.key) l.verifier.addWithKey(o.act, o.key);
          else l.verifier.add(o.act);
          if (l.verifier.status(d.id) !== 'valid') continue;
          const x = readList(d.id, d.payload);
          if (x) acts.set(d.id, x);
        }
        if (!page.items.length || page.next === after) break;
        after = page.next;
      }
    } catch (e) {
      problems.push(`${h}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return { acts, problems };
}

/** The acts an act follows or merges, itself included. */
function ancestors(acts: Map<string, ListAct>, id: string): Set<string> {
  const out = new Set<string>();
  const walk = (x: string) => {
    if (out.has(x)) return;
    out.add(x);
    const a = acts.get(x);
    if (!a) return;
    if (a.previous) walk(a.previous);
    for (const m of a.merged) walk(m);
  };
  walk(id);
  return out;
}

/** Read the list: the tips, and what counts (2.4, 2.6). */
export async function readAccepted(identity: string, secrets: Uint8Array[], homes: string[], via: Via = {}): Promise<Accepted> {
  const { acts, problems } = await readActs(identity, secrets, homes, via);
  const followed = new Set<string>();
  for (const a of acts.values()) {
    if (a.previous) followed.add(a.previous);
    for (const m of a.merged) followed.add(m);
  }
  const tips = [...acts.values()].filter((a) => !followed.has(a.id)).sort((x, y) => (x.id < y.id ? -1 : 1));
  const version = Math.max(0, ...tips.map((t) => t.version));
  if (tips.length <= 1) return { entries: new Map(tips[0]?.entries ?? []), tips, merged: [], version, problems };
  // The last common act: the common ancestor of highest version.
  const anc = tips.map((t) => ancestors(acts, t.id));
  const common = [...anc[0]].filter((x) => anc.every((s) => s.has(x)) && acts.has(x));
  const base = common.map((x) => acts.get(x)!).sort((a, b) => b.version - a.version)[0];
  const baseEntries = base?.entries ?? new Map<string, string | null>();
  const entries = new Map(baseEntries);
  const merged: string[] = [];
  for (const t of tips) {
    for (const [h, label] of t.entries) {
      if (!baseEntries.has(h)) {
        entries.set(h, label);
        merged.push(`Added in one app: ${label ?? labelOf(h) ?? h.slice(0, 12)}.`);
      }
    }
    for (const h of baseEntries.keys()) {
      if (!t.entries.has(h) && entries.has(h)) {
        entries.delete(h);
        merged.push(`Removed in one app: ${baseEntries.get(h) ?? labelOf(h) ?? h.slice(0, 12)}.`);
      }
    }
  }
  return { entries, tips, merged: [...new Set(merged)], version, problems };
}

const sameTips = (a: ListAct[], b: ListAct[]) => a.map((x) => x.id).join() === b.map((x) => x.id).join();

/**
 * Change this app's part of the list (2.5): read the tips, merge them,
 * apply `change`, read the tips again just before sending, and start again
 * if they moved. Then the next version is signed, sealed to the identity's
 * own current encryption key and left at its homes. Returns the list as
 * written, or as found where nothing changed.
 */
export async function changeAccepted(
  me: TestIdentity,
  change: (entries: Map<string, string | null>) => void,
  opts: { via?: Via; save: () => Promise<void>; check: () => Promise<void> },
): Promise<{ written: string | null; list: Accepted }> {
  const via = opts.via ?? {};
  const homes = me.f.homes.map((h) => h.hint);
  const secrets = [...me.f.encryption].reverse().map((e) => unhex(e.secret));
  if (!secrets.length) throw new Error('This app holds no encryption key of this identity, so its accepted list cannot be sealed to it. Nothing was changed.');
  for (let round = 0; round < 5; round++) {
    const read = await readAccepted(me.id, secrets, homes, via);
    if (read.problems.length >= homes.length && !read.tips.length) throw new Error(`The identity’s homes did not answer (${read.problems.join('; ')}): the accepted list was not changed.`);
    const next = new Map(read.entries);
    change(next);
    const same = read.tips.length === 1 && JSON.stringify([...next].sort()) === JSON.stringify([...read.entries].sort());
    if (same || (!read.tips.length && !next.size)) return { written: null, list: read };
    // Checked again before sending (F340): another app may have written meanwhile.
    const again = await readAccepted(me.id, secrets, homes, via);
    if (!sameTips(again.tips, read.tips)) continue;
    await opts.check();
    const look = await lookUp(me.id, homes, via);
    if (!look.encryptionKey || !me.f.encryption.some((e) => hex(xwingPublic(unhex(e.secret))) === hex(look.encryptionKey!))) {
      throw new Error('The encryption key this identity publishes is not one this app holds: the accepted list cannot be sealed. Nothing was changed.');
    }
    const [first, ...others] = read.tips;
    const payload = listPayload({ version: read.version + 1, previous: first?.id ?? null, merged: others.map((t) => t.id), entries: next });
    let made: { act: Uint8Array; id: string; key: Uint8Array };
    try {
      made = me.sign(ACCEPTED_SPEC, SEALED_LIST, payload, { public: false, to: [me.id] });
    } finally {
      await opts.save();
    }
    const sealed = sealFor(made.act, made.key, [{ id: me.id, key: look.encryptionKey }]);
    let left = 0;
    for (const h of homes) {
      try {
        await relayAt(h, via).putSealed(sealed);
        await relayAt(h, via).putAct(made.act);
        left++;
      } catch {
        // that home is away
      }
    }
    if (!left) throw new Error('No home took the accepted list: nothing was changed. Try again.');
    return { written: made.id, list: { entries: next, tips: [{ id: made.id, version: read.version + 1, previous: first?.id ?? null, merged: others.map((t) => t.id), entries: next }], merged: read.merged, version: read.version + 1, problems: [] } };
  }
  throw new Error('Another app kept changing the accepted list while this one wrote: nothing was changed. Try again.');
}

/** Publish the list (the other option, 3.1), or withdraw it: a public act at the outbox relays. */
export async function publishAccepted(me: TestIdentity, list: Accepted, relays: string[], previous: { act: string; version: number } | null, withdrawn: boolean, save: () => Promise<void>): Promise<string> {
  const payload = listPayload({ version: (previous?.version ?? 0) + 1, previous: previous?.act ?? null, merged: [], entries: withdrawn ? new Map() : list.entries }, withdrawn);
  let made: { act: Uint8Array; id: string };
  try {
    made = me.sign(ACCEPTED_SPEC, PUBLISHED_LIST, payload, { public: true });
  } finally {
    await save();
  }
  let left = 0;
  for (const r of relays) {
    try {
      await relayAt(r, me.via).putAct(made.act);
      left++;
    } catch {
      // that relay is away
    }
  }
  if (!left) throw new Error('No relay took the published list.');
  return made.id;
}
