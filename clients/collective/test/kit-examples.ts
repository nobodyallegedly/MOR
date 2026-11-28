// The players' kit (test/kit/, round two's, unchanged) for the draft-25 tests of the collective
// client and Edubba: its worked examples (AGREEMENTS-FIELDS.md) signed by the kit itself, and its
// own `agreements check` command run on act files. TEST IDENTITIES ONLY.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Fields, Held } from '../src/agreements-25.ts';

export const KIT = join(fileURLToPath(new URL('.', import.meta.url)), 'kit');
const HOME = { operator: 'a'.repeat(64), hint: 'home.test' };
const h = (c: string) => c.repeat(64);

interface KitLike {
  newIdentity(name: string, homes: { operator: string; hint: string }[]): { identity: string };
  agreementsSign(name: string, act: string, fields: Fields, o: { held: Held[] }): { signed: { act: Uint8Array; id: string; key: Uint8Array } | null; check: unknown };
}

/** The kit's own command line, run on act files with the acts before each held: its answers (`agreements check FILE...`). */
export function kitCheck(acts: { act: Uint8Array; key?: Uint8Array | null }[]): { verdict: string; rule: string | null }[] {
  const dir = mkdtempSync(join(tmpdir(), 'mor-kit-check-'));
  const files = acts.map((a, i) => {
    const f = join(dir, `${i}.mor`);
    writeFileSync(f, a.act);
    return a.key ? `${f}:${Buffer.from(a.key).toString('hex')}` : f;
  });
  const out = execFileSync(process.execPath, [join(KIT, 'mor.mjs'), 'agreements', 'check', ...files], { cwd: dir, encoding: 'utf8' });
  return JSON.parse(out) as { verdict: string; rule: string | null }[];
}

/** The JSON blocks of AGREEMENTS-FIELDS.md, in order, each under the heading before it. */
export function workedExamples(): { heading: string; json: string }[] {
  const md = readFileSync(join(KIT, 'AGREEMENTS-FIELDS.md'), 'utf8');
  const out: { heading: string; json: string }[] = [];
  let heading = '';
  const lines = md.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('## ')) heading = lines[i].slice(3);
    if (lines[i] === '```json') {
      const end = lines.indexOf('```', i + 1);
      out.push({ heading, json: lines.slice(i + 1, end).join('\n') });
      i = end;
    }
  }
  return out;
}

export interface Signed {
  heading: string;
  act: 'terms' | 'statement' | 'report';
  bytes: Uint8Array;
  id: string;
  /** The fields the kit was given, as the builder writes them (`resolves` sorted, a set: E18). */
  fields: Fields;
  /** The acts the kit signed before this one. */
  before: Held[];
}

/**
 * Every worked example, signed by the kit in one agreement as the guide
 * describes it: the Terms by "you"; the assent and the counter signature
 * by the other party ("for a party who did not write the Terms"); the
 * contest by the other party against an offer the kit signs first (Terms
 * naming a party by role, the guide's own role example, with in_force:
 * G4.2); the resolve by "you"; the report. The capitals replaced by real
 * values, test fingerprints where no act is needed.
 */
export async function signWorkedExamples(): Promise<{ signed: Signed[]; extra: Signed[]; you: string; other: string }> {
  const { Kit } = (await import(join(KIT, 'lib', 'kit.mjs'))) as { Kit: new (dir: string) => KitLike };
  const kit = new Kit(mkdtempSync(join(tmpdir(), 'mor-kit-')));
  const you = kit.newIdentity('you', [HOME]).identity;
  const other = kit.newIdentity('other', [HOME]).identity;
  const ids: Record<string, string> = { 'YOUR-ID': you, 'OTHER-ID': other, 'WORDS-FINGERPRINT': h('1'), 'TERMS-READING-CMIP-HASH': h('2'), 'TIP-A': h('3'), 'TIP-B': h('4'), 'CALL-ACT-ID': h('5'), 'UNIT-HASH': h('6'), 'PAYMENT-ACT-ID': h('7') };
  const fill = (s: string) => JSON.parse(s.replace(/"([A-Z][A-Z-]+[A-Z])"/g, (m, k: string) => (ids[k] ? `"${ids[k]}"` : m))) as Fields;
  const held: Held[] = [];
  const signed: Signed[] = [];
  const extra: Signed[] = [];
  const signs = (heading: string, who: string, act: Signed['act'], f: Fields): Signed => {
    const r = kit.agreementsSign(who, act, structuredClone(f), { held: [...held] });
    if (!r.signed) throw new Error(`the kit did not sign the example "${heading}": ${JSON.stringify(r.check)}`);
    const fields = structuredClone(f);
    if (Array.isArray(fields.resolves)) fields.resolves = [...(fields.resolves as string[])].sort();
    const s = { heading, act, bytes: r.signed.act, id: r.signed.id, fields, before: [...held] };
    held.push({ act: r.signed.act });
    return s;
  };
  for (const ex of workedExamples()) {
    const head = ex.heading;
    if (head === 'Terms') {
      const s = signs(head, 'you', 'terms', fill(ex.json));
      ids['TERMS-ID'] = s.id;
      signed.push(s);
    } else if (head.includes('assent')) {
      const s = signs(head, 'other', 'statement', fill(ex.json));
      ids['YOUR-ASSENT-ID'] = s.id;
      signed.push(s);
    } else if (head.includes('counter signature')) signed.push(signs(head, 'other', 'statement', fill(ex.json)));
    else if (head.includes('contest')) {
      const offer = signs('Terms naming a party by role (the guide’s role example)', 'you', 'terms', { parties: [{ signer: you }, { role: { kind: 'future', spot: { cmip: h('8'), params: 'f6' } } }], authors: [0], body: { words: h('1'), cmip: h('2'), params: 'f6' }, inForce: { cmip: h('9'), params: 'f6' }, previous: null });
      extra.push(offer);
      ids['OFFER-ID'] = offer.id;
      ids['OFFER-VERSION-ID'] = offer.id;
      signed.push(signs(head, 'other', 'statement', fill(ex.json)));
    } else if (head.includes('resolve')) signed.push(signs(head, 'you', 'statement', fill(ex.json)));
    else signed.push(signs(head, 'you', 'report', fill(ex.json)));
  }
  return { signed, extra, you, other };
}
