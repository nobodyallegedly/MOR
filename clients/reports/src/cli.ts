#!/usr/bin/env -S node --import tsx
// mor-reports: the mirror of reports on MOR to GitHub issues (F287), run by
// hand on the author's computer.
//
//   mor-reports [--dry-run] [--prepare N[,N...]]... [--identity ID] [--at URL]...
//               [--repo OWNER/NAME] [--drafts DIR] [--settings FILE]
//
// Without flags, the settings are read from ~/.config/mor/reports.json:
//   { "identity": "<the reporting identity, 64 hex digits>",
//     "places": ["https://home1.dubsar.org", "https://home2.dubsar.org"],
//     "repository": "nobodyallegedly/MOR",
//     "drafts": "<the desk's drafts folder; ~/mor-drafts if not given>" }
// The GitHub token: MOR_GITHUB_TOKEN, else ~/.config/mor/github-token. It is
// never printed. --dry-run says what would be done and changes nothing, and
// shows, word for word, what each issue opened on GitHub would be published
// again as. --prepare N: for issue N, as read in the dry run, a draft for
// MOR Identities, where the reporting identity's key is; nothing is signed
// here.

import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { GitHub, findToken, redact } from './github.ts';
import { apply, plan, republicationText } from './mirror.ts';
import { atDesk, prepareRepublication } from './prepare.ts';
import { readHeld } from './read.ts';

export const SETTINGS_FILE = join('.config', 'mor', 'reports.json');
export const DEFAULT_REPOSITORY = 'nobodyallegedly/MOR';
const ID = /^[0-9a-f]{64}$/;

interface Settings {
  identity: string;
  places: string[];
  repository: string;
  dryRun: boolean;
  /** Issues named to be prepared for the desk. */
  prepare: number[];
  drafts: string;
}

function settings(argv: string[]): Settings {
  let file = join(process.env.HOME || homedir(), SETTINGS_FILE);
  const at: string[] = [];
  let identity: string | null = null;
  let repository: string | null = null;
  let dryRun = false;
  let drafts: string | null = null;
  const prepare: number[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined) throw new Error(`${a} needs a value`);
      return v;
    };
    if (a === '--dry-run') dryRun = true;
    else if (a === '--identity') identity = next();
    else if (a === '--at') at.push(next());
    else if (a === '--repo') repository = next();
    else if (a === '--settings') file = next();
    else if (a === '--drafts') drafts = next();
    else if (a === '--prepare') {
      for (const n of next().split(',')) {
        if (!/^\d+$/.test(n.trim().replace(/^#/, ''))) throw new Error(`--prepare names issues by number, as the dry run lists them: not “${n}”`);
        prepare.push(Number(n.trim().replace(/^#/, '')));
      }
    } else if (a === '--help' || a === '-h') {
      console.log('mor-reports [--dry-run] [--prepare N[,N...]]... [--identity ID] [--at URL]... [--repo OWNER/NAME] [--drafts DIR] [--settings FILE]\nSee clients/reports/README.md.');
      process.exit(0);
    } else throw new Error(`unknown argument ${a}`);
  }
  let saved: { identity?: unknown; places?: unknown; repository?: unknown; drafts?: unknown } = {};
  if (existsSync(file)) saved = JSON.parse(readFileSync(file, 'utf8'));
  const id = identity ?? (typeof saved.identity === 'string' ? saved.identity : null);
  if (!id || id === 'REPORTS-IDENTITY') throw new Error(`no reporting identity: give --identity, or "identity" in ${file}. It is made at step 17; until then the page names a placeholder.`);
  if (!ID.test(id)) throw new Error(`the reporting identity must be 64 hex digits, not “${id}”`);
  const places = at.length ? at : Array.isArray(saved.places) ? saved.places.filter((p): p is string => typeof p === 'string') : [];
  if (!places.length) throw new Error(`no place to read from: give --at with a home's address, or "places" in ${file}`);
  const repo = repository ?? (typeof saved.repository === 'string' ? saved.repository : DEFAULT_REPOSITORY);
  const folder = drafts ?? (typeof saved.drafts === 'string' ? saved.drafts : process.env.MOR_DRAFTS || join(process.env.HOME || homedir(), 'mor-drafts'));
  return { identity: id, places, repository: repo, dryRun, prepare: [...new Set(prepare)], drafts: folder };
}

async function main(): Promise<number> {
  const s = settings(process.argv.slice(2));
  const t = findToken();
  if (t.warning) console.log(t.warning);
  const say = (line: string) => console.log(redact(line, t.token));
  try {
    const gh = new GitHub(t.token, s.repository);
    say(`Reading the reporting identity ${s.identity.slice(0, 12)}… from ${s.places.join(', ')}.`);
    const held = await readHeld(s.identity, s.places);
    say(`On MOR: ${held.reports.length} public report${held.reports.length === 1 ? '' : 's'} checked, ${held.answers.length} public act${held.answers.length === 1 ? '' : 's'} of the reporting identity checked, ${held.sealed} sealed item${held.sealed === 1 ? '' : 's'} in its inbox (private: never opened nor mirrored here).`);
    for (const p of held.problems) say(p);
    say(`On GitHub, ${s.repository}, as ${await gh.me()} (token from ${t.from === 'MOR_GITHUB_TOKEN' ? 'MOR_GITHUB_TOKEN' : '~/.config/mor/github-token'}).`);
    const p = await plan(held, s.identity, gh);
    const counts = (d: string) => p.steps.filter((x) => x.do === d).length;
    say(`${counts('open')} issue(s) to open, ${counts('update')} to update, ${counts('comment')} answer(s) to add, ${p.kept} report(s) already mirrored as signed.`);
    if (s.dryRun) {
      for (const x of p.steps) {
        if (x.do === 'open') say(`Would open an issue for the report ${x.report.id}: “${x.title}”.`);
        else if (x.do === 'update') say(`Would update issue #${x.issue} to the report ${x.report.id} as signed.`);
        else if (p.republished.get(x.issue as number) === x.answer.id) say(`Would tell issue #${x.issue} that it is published again on MOR as ${x.answer.id}.`);
        else say(`Would add the answer ${x.answer.id} to ${typeof x.issue === 'number' ? `issue #${x.issue}` : `the issue of the report ${x.issue.report}`}.`);
      }
      say('Dry run: nothing was changed on GitHub.');
    } else {
      await apply(p, gh, say);
    }
    if (p.unplaced) say(`${p.unplaced} public act(s) of the reporting identity answer no report or issue known here: not mirrored.`);
    if (p.republished.size) say(`Published again on MOR from GitHub: ${[...p.republished].map(([n, id]) => `#${n} as ${id.slice(0, 12)}…`).join(', ')}.`);

    // GitHub to MOR: the issues not yet on MOR, what the desk holds for each, and the drafts named.
    const desk = atDesk(s.drafts, s.identity, p.waiting);
    for (const n of s.prepare) if (!p.waiting.some((i) => i.number === n)) say(`#${n} is not an issue waiting to be published on MOR (opened on GitHub, open, not yet on MOR): nothing prepared for it.`);
    const fresh = p.waiting.filter((i) => !desk.has(i.number));
    if (!p.waiting.length) say('No issue opened on GitHub waits to be published on MOR.');
    else {
      say(`Opened on GitHub and not yet on MOR (${p.waiting.length}). Each is published again on MOR as the reporting identity only once you approve its draft at MOR Identities: read it below with --dry-run, then name it with --prepare N.`);
      for (const i of p.waiting) {
        const at = desk.get(i.number);
        const where = !at
          ? ''
          : !at.answer
            ? ` Its draft ${at.digest.slice(0, 12)}… waits at the desk.`
            : at.answer.verdict === 'approved'
              ? ` Approved at the desk as ${at.answer.act?.slice(0, 12)}…, not yet found on MOR: if no relay took it, send it again at the desk.`
              : ` Its draft ${at.digest.slice(0, 12)}… was ${at.answer.verdict} at the desk: not prepared again (remove the draft's file from ${s.drafts} to prepare it again).`;
        say(`  #${i.number} by ${i.author}: “${i.title}” ${i.url}${where}`);
      }
    }
    if (s.dryRun) {
      for (const i of fresh) {
        say(`Would be published again on MOR, as the reporting identity, if you name it (--prepare ${i.number}), word for word:`);
        for (const l of republicationText(i).split('\n')) say(`  | ${l}`);
      }
      if (s.prepare.length) say(`Dry run: no draft was written to ${s.drafts}.`);
    } else {
      for (const n of s.prepare) {
        const i = fresh.find((x) => x.number === n);
        if (!i) {
          if (desk.has(n)) say(`#${n} already has a draft at the desk: not prepared again.`);
          continue;
        }
        const r = await prepareRepublication(i, { dir: s.drafts, identity: s.identity, relays: held.publishAt, hints: [...new Set([...s.places, ...held.publishAt])] });
        say(`Prepared draft ${r.digest} for issue #${n}, in ${s.drafts}: approve it at MOR Identities to publish it on MOR as the reporting identity. Nothing was signed here.${r.changes.length ? ` Its words were composed as canonical text: ${r.changes.join('; ')}.` : ''}`);
      }
    }
    return 0;
  } catch (e) {
    console.error(redact(`Stopped: ${e instanceof Error ? e.message : String(e)}`, t.token));
    return 1;
  }
}

main().then(
  (code) => process.exit(code),
  (e) => {
    // Before the token is found (settings, a missing token): nothing secret to scrub but the variable itself.
    const token = process.env.MOR_GITHUB_TOKEN ?? '';
    console.error(redact(`Stopped: ${e instanceof Error ? e.message : String(e)}`, token.trim()));
    process.exit(1);
  },
);
