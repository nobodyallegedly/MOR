// Rules I follow (hand test v3, H93): the cMIPs and Modules an app runs,
// each held against the identity's accepted list (the accepted cMIP, F340),
// sealed to the identity at its homes and read by every app, and against
// what the person approved in this app only. A rule the app runs that is
// in neither is asked about, two ways (his decision, 24 October 2026):
// **in this app only** (kept by the app, the sealed list unchanged, so the
// other apps still ask) or **added to the list** (read by every app).
// Until then an act under it is unknown here (Development rule 10), and
// nothing is signed under it.
//
// Engine side; nothing from Node: the web clients run it too.

import type { TestIdentity } from '../../../genesis/src/identity.ts';
import type { Via } from '../../../genesis/src/transport.ts';
import type { Opener } from '../../../dub/src/people.ts';
import { changeAccepted, readAccepted } from '../../../damgar/src/accepted.ts';
import { heldSecrets, type Said } from './people.ts';
import { acceptable } from '../../../damgar/src/specs.ts';
import { PEOPLE_SPEC, PEOPLE_SPEC_1 } from '../../../dub/src/people.ts';
import { NAMING_SPEC } from '../../../dub/src/names.ts';
import { APPENDED_FORMAT } from '../../../dub/src/appended.ts';
import { CORRECTIONS_SPEC } from '../../../barebone/src/corrections.ts';
import { MEMBER_KEYS_SPEC } from '../../../grants/src/member.ts';
import { MEMORY_SPEC } from '../../../desk/src/memory.ts';
import { LONGFORM_SPECS } from '../../../longform/src/specs.ts';
import { REPO_SPECS } from '../../../repo/src/specs.ts';
import { NOTES_FORMAT } from '../../../dub/src/notes.ts';

/** One rule an app runs: a cMIP or a Module, by the spec hashes it stands for. */
export interface Rule {
  key: string;
  name: string;
  kind: 'cMIP' | 'Module';
  /** Every hash it stands for (a cMIP's drafts still read, a units Module's units). */
  hashes: string[];
  /** What it does here, in plain words. */
  does: string;
  /** Its text in the repository. */
  text?: string;
}

/** A rule as shown: where it is followed, if anywhere. */
export interface RuleShown {
  key: string;
  name: string;
  kind: 'cMIP' | 'Module';
  does: string;
  text?: string;
  /** On the identity's list (every app), in this app only, or not followed. */
  on: 'list' | 'here' | null;
}

export interface RulesShown {
  /** The app's name, as said ("Dub"). */
  app: string;
  rules: RuleShown[];
  /** The names of the rules not followed yet. */
  missing: string[];
  /** Why the sealed list could not be read here, if it could not. */
  problem: string | null;
}

/** Whether every hash a rule stands for is followed. */
const holds = (r: Rule, set: Set<string>) => r.hashes.every((h) => set.has(h));

/**
 * Read the rules an app runs for the identity: the sealed list, as its
 * homes hold it, and `here`, the hashes the app keeps as approved in it
 * only. Returns what is shown and the set of hashes followed.
 */
export async function readRules(app: string, runs: Rule[], me: TestIdentity, here: string[], o: { open?: Opener | Uint8Array[] | null; via?: Via } = {}): Promise<{ shown: RulesShown; followed: Set<string> }> {
  const open = heldSecrets(me).length ? heldSecrets(me) : (o.open ?? null);
  const listed = new Set<string>();
  let problem: string | null = null;
  if (!open || (Array.isArray(open) && !open.length)) problem = `${app} cannot open what is sealed to this identity, so its list of rules cannot be read here: only what you approved in ${app} counts`;
  else {
    try {
      const l = await readAccepted(me.id, open, me.f.homes.map((h) => h.hint), o.via ?? {});
      for (const h of l.entries.keys()) listed.add(h);
      if (!l.tips.length && l.problems.length) problem = `its homes did not answer (${l.problems.join('; ')})`;
    } catch (e) {
      problem = e instanceof Error ? e.message : String(e);
    }
  }
  const hereSet = new Set(here);
  const followed = new Set([...listed, ...hereSet]);
  const rules = runs.map((r) => ({ key: r.key, name: r.name, kind: r.kind, does: r.does, text: r.text, on: holds(r, listed) ? ('list' as const) : holds(r, hereSet) ? ('here' as const) : null }));
  return { shown: { app, rules, missing: rules.filter((r) => !r.on).map((r) => r.name), problem }, followed };
}

/**
 * Approve rules the app runs: `here`, in this app only (the hashes are
 * returned for the app to keep; the sealed list is not touched), or `list`,
 * added to the identity's sealed list (written on its latest version, every
 * other entry kept as found). Removing works the same way back.
 */
export async function approveRules(
  app: string,
  runs: Rule[],
  me: TestIdentity,
  a: { keys: string[]; where: 'here' | 'list'; remove?: boolean; here: string[] },
  o: { open?: Opener | null; via?: Via; save: () => Promise<void>; check?: () => Promise<void> },
): Promise<{ here: string[]; lines: Said[] }> {
  const chosen = a.keys.map((k) => {
    const r = runs.find((x) => x.key === k);
    if (!r) throw new Error(`${app} runs no rule called ${k}. Nothing was changed.`);
    return r;
  });
  const names = chosen.map((r) => r.name).join(', ');
  const hashes = chosen.flatMap((r) => r.hashes);
  if (a.where === 'here') {
    const here = a.remove ? a.here.filter((h) => !hashes.includes(h)) : [...new Set([...a.here, ...hashes])];
    return { here, lines: [a.remove ? { text: `${names}: no longer followed in ${app} only.` } : { text: `${names}: followed in ${app} only. Your list is unchanged, so the other apps still ask.`, tone: 'ok' }] };
  }
  const r = await changeAccepted(
    me,
    (entries) => {
      for (const x of chosen) for (const h of x.hashes) (a.remove ? entries.delete(h) : entries.has(h) || entries.set(h, x.name));
    },
    { via: o.via ?? {}, save: o.save, check: o.check ?? (async () => {}), open: o.open ?? null },
  );
  const lines: Said[] = [];
  if (r.list.merged.length) lines.push({ text: `Two apps had changed your list at once. Both changes were merged: ${r.list.merged.join(' ')}`, tone: 'warn' });
  lines.push(
    r.written
      ? { text: a.remove ? `${names}: removed from your list. Every app holding this identity reads the change.` : `${names}: added to your list, sealed to this identity at its homes. Every app holding it reads it.`, tone: 'ok' }
      : { text: 'Nothing changed: your list already said so.' },
  );
  // Added to the list: no longer needed in this app only.
  return { here: a.remove ? a.here : a.here.filter((h) => !hashes.includes(h)), lines };
}

const money = (key: string, does: string): Rule => {
  const a = acceptable(key);
  return { key, name: a.name, kind: a.kind, hashes: a.hashes, does, text: a.text };
};

/** Every rule an app of the suite runs, by key: each app names the ones it runs. The Money layer's are Damgar's own entries (`damgar/src/specs.ts`). */
export const SUITE_RULES: Record<string, Rule> = {
  payment: money('payment', 'Paying and being paid: a request, its claim and its receipt.'),
  messages: money('messages', 'The messages between apps and people about money: a draft for Damgar, a lane asked, a sale told to your own app.'),
  'grant-limits': money('grant-limits', 'A lane’s limits: how much one payment under it may move, and until when.'),
  people: { key: 'people', name: 'People', kind: 'cMIP', hashes: [PEOPLE_SPEC, PEOPLE_SPEC_1], does: 'Your contacts and their nicknames, sealed to yourself at your homes; the people you mute.', text: 'cmips/cmip-people-draft-2.md' },
  naming: { key: 'naming', name: 'Naming', kind: 'cMIP', hashes: [NAMING_SPEC], does: 'Display names: the name an identity publishes for itself, shown beside its ID.', text: 'cmips/cmip-naming-draft-1.md' },
  corrections: { key: 'corrections', name: 'Corrections', kind: 'cMIP', hashes: [CORRECTIONS_SPEC], does: 'A post corrected by its author: the correction shown in its place, the earlier text kept beneath it.', text: 'cmips/cmip-corrections-draft-2.md' },
  appended: { key: 'appended', name: 'Appended collective', kind: 'cMIP', hashes: [APPENDED_FORMAT], does: 'A collective’s posts whose members append, each signed by its member.', text: 'cmips/cmip-appended-collective-draft-1.md' },
  'member-keys': { key: 'member-keys', name: 'Member keys', kind: 'cMIP', hashes: [MEMBER_KEYS_SPEC], does: 'A member’s own key for acting as a collective, granted and revoked by it.', text: 'cmips/cmip-member-keys-draft-1.md' },
  'agent-memory': { key: 'agent-memory', name: 'Agent memory', kind: 'cMIP', hashes: [MEMORY_SPEC], does: 'What an agent keeps between its sessions, sealed to its owner.', text: 'cmips/cmip-agent-memory-draft-2.md' },
  notes: { key: 'notes', name: 'Notes', kind: 'cMIP', hashes: [NOTES_FORMAT], does: 'Your notes: private text sealed to yourself at your homes, each change a new version, the earlier ones kept.', text: 'cmips/cmip-notes-draft-1.md' },
  'long-form': { key: 'long-form', name: 'Long form', kind: 'cMIP', hashes: [LONGFORM_SPECS.longform], does: 'Long documents with headings: drafts of MIPs, and their replies.', text: 'cmips/cmip-long-form-draft-1.md' },
  'release-manifest': { key: 'release-manifest', name: 'Release manifest', kind: 'cMIP', hashes: [REPO_SPECS.manifest], does: 'A release of an app: its files, their fingerprints, and who signed it.', text: 'cmips/cmip-release-manifest-draft-4.md' },
};

/** The rules an app runs, by their keys. */
export const rulesOf = (...keys: string[]): Rule[] => keys.map((k) => SUITE_RULES[k]);
