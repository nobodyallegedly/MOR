#!/usr/bin/env -S node --import tsx
// mor-reports: the mirror of reports on MOR to GitHub issues (F287), run by
// hand on the author's computer.
//
//   mor-reports [--dry-run] [--identity ID] [--at URL]... [--repo OWNER/NAME] [--settings FILE]
//
// Without flags, the settings are read from ~/.config/mor/reports.json:
//   { "identity": "<the reporting identity, 64 hex digits>",
//     "places": ["https://home1.dubsar.org", "https://home2.dubsar.org"],
//     "repository": "nobodyallegedly/MOR" }
// The GitHub token: MOR_GITHUB_TOKEN, else ~/.config/mor/github-token. It is
// never printed. --dry-run says what would be done and changes nothing.

import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { GitHub, findToken, redact } from './github.ts';
import { apply, plan } from './mirror.ts';
import { readHeld } from './read.ts';

export const SETTINGS_FILE = join('.config', 'mor', 'reports.json');
export const DEFAULT_REPOSITORY = 'nobodyallegedly/MOR';
const ID = /^[0-9a-f]{64}$/;

interface Settings {
  identity: string;
  places: string[];
  repository: string;
  dryRun: boolean;
}

function settings(argv: string[]): Settings {
  let file = join(process.env.HOME || homedir(), SETTINGS_FILE);
  const at: string[] = [];
  let identity: string | null = null;
  let repository: string | null = null;
  let dryRun = false;
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
    else if (a === '--help' || a === '-h') {
      console.log('mor-reports [--dry-run] [--identity ID] [--at URL]... [--repo OWNER/NAME] [--settings FILE]\nSee clients/reports/README.md.');
      process.exit(0);
    } else throw new Error(`unknown argument ${a}`);
  }
  let saved: { identity?: unknown; places?: unknown; repository?: unknown } = {};
  if (existsSync(file)) saved = JSON.parse(readFileSync(file, 'utf8'));
  const id = identity ?? (typeof saved.identity === 'string' ? saved.identity : null);
  if (!id || id === 'REPORTS-IDENTITY') throw new Error(`no reporting identity: give --identity, or "identity" in ${file}. It is made at step 17; until then the page names a placeholder.`);
  if (!ID.test(id)) throw new Error(`the reporting identity must be 64 hex digits, not “${id}”`);
  const places = at.length ? at : Array.isArray(saved.places) ? saved.places.filter((p): p is string => typeof p === 'string') : [];
  if (!places.length) throw new Error(`no place to read from: give --at with a home's address, or "places" in ${file}`);
  const repo = repository ?? (typeof saved.repository === 'string' ? saved.repository : DEFAULT_REPOSITORY);
  return { identity: id, places, repository: repo, dryRun };
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
        else say(`Would add the answer ${x.answer.id} to ${typeof x.issue === 'number' ? `issue #${x.issue}` : `the issue of the report ${x.issue.report}`}.`);
      }
      say('Dry run: nothing was changed on GitHub.');
    } else {
      await apply(p, gh, say);
    }
    if (p.unplaced) say(`${p.unplaced} public act(s) of the reporting identity answer no report or issue known here: not mirrored.`);
    if (p.waiting.length) {
      say(`Opened on GitHub and not yet answered on MOR (${p.waiting.length}): answer each on MOR as the reporting identity, with the issue's address in the words; the next run adds the answer to the issue. Nothing is signed here.`);
      for (const i of p.waiting) say(`  #${i.number} by ${i.author}: “${i.title}” ${i.url}`);
    } else say('No issue opened on GitHub waits for an answer on MOR.');
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
