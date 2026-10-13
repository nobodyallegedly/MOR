// The mirror of reports on MOR to GitHub (F287), against real homes and
// relays on local ports and a fake of GitHub's API on another port. Test
// identities only. The reporting identity has an inbox and an encryption key;
// visitors write to it as the report page's box writes (the display client's
// own `writeNote`), publicly and privately; it answers in public. The command
// is run as the author runs it, as its own process.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { start, type Running } from '../../genesis/test/world.ts';
import { textPayload } from '../../barebone/src/post.ts';
import { POST_SPECS, TEXT_ACT } from '../../barebone/src/specs.ts';
import { writeNote } from '../../site/src/write.ts';
import { findToken, GitHubError, TOKEN_FILE } from '../src/github.ts';
import { fenced } from '../src/mirror.ts';
import { FakeGitHub } from './fake-github.ts';

const here = fileURLToPath(new URL('..', import.meta.url));
const REPO_ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const TOKEN = 'ghp_TestTokenNeverToBeSeen0123456789abcdef';
const REPOSITORY = 'test-owner/test-repo';

let home: Running;
let inbox: Running;
let outbox: Running;
let reporting: TestIdentity;
let places: string[];
let gh: FakeGitHub;
let homeDir: string;
const outputs: string[] = [];
const ids: Record<string, string> = {};

const PUBLIC_WORDS = 'The feed shows a reply above the post it answers on Safari.\nSteps: open feed.html, scroll. `code` and @someone and <img src=x>.';
const PRIVATE_WORDS = 'An attack not yet safe to show: a secret detail 7f3a.';

before(async () => {
  [home, inbox, outbox] = [await start('home'), await start('relay'), await start('relay')];
  reporting = TestIdentity.create({ homes: [home.home] });
  await reporting.publishGenesis();
  await reporting.publishRoutes([
    { scope: null, hints: [outbox.base], kind: 0 },
    { scope: null, hints: [inbox.base], kind: 1 },
  ]);
  await reporting.publishEncryptionKey();
  places = [home.base];
  const report = async (text: string, isPublic: boolean) =>
    (await writeNote({ text, to: reporting.id, public: isPublic, places, homes: [home.base] })).note;
  ids.public = await report(PUBLIC_WORDS, true);
  ids.private = await report(PRIVATE_WORDS, false);

  gh = new FakeGitHub(TOKEN, REPOSITORY);
  await gh.listen();
  gh.seed({ title: 'Found on GitHub: the reader hangs', author: 'a-visitor', body: 'It hangs.' });
  gh.seed({ title: 'A pull request, never listed', author: 'a-visitor', pull: true });
  gh.seed({ title: 'Closed on GitHub', author: 'a-visitor', state: 'closed' });
  homeDir = mkdtempSync(join(tmpdir(), 'mor-reports-home-'));
});

after(async () => {
  await gh?.close();
  for (const r of [home, inbox, outbox]) await r?.stop().catch(() => {});
});

/** The command, as the author runs it, with the token in the environment unless told otherwise. */
function run(args: string[], env: Record<string, string> = { MOR_GITHUB_TOKEN: TOKEN }): Promise<{ code: number; out: string }> {
  return new Promise((resolve) => {
    execFile(
      process.execPath,
      ['--import', 'tsx', 'src/cli.ts', '--identity', reporting.id, '--at', home.base, '--repo', REPOSITORY, ...args],
      { cwd: here, env: { PATH: process.env.PATH ?? '', HOME: homeDir, MOR_GITHUB_API: gh.base, ...env } },
      (err, stdout, stderr) => {
        const out = stdout + stderr;
        outputs.push(out);
        resolve({ code: err ? ((err as { code?: number }).code ?? 1) : 0, out });
      },
    );
  });
}

const mirrored = () => gh.issues.filter((i) => i.author === gh.login);
const writes = () => gh.seen.filter((s) => s.method !== 'GET');

test('a dry run says what it would do and changes nothing', async () => {
  const r = await run(['--dry-run']);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /1 public report checked/);
  assert.match(r.out, /1 sealed item in its inbox \(private: never opened nor mirrored here\)/);
  assert.match(r.out, new RegExp(`Would open an issue for the report ${ids.public}`));
  assert.match(r.out, /Dry run: nothing was changed on GitHub/);
  assert.equal(writes().length, 0);
  assert.equal(mirrored().length, 0);
});

test('a public report is mirrored once, its words exactly, with its act id and signer; a private one never', async () => {
  const r = await run([]);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /Opened issue #\d+ for the report/);
  assert.equal(mirrored().length, 1);
  const issue = mirrored()[0];
  assert.equal(issue.title, 'The feed shows a reply above the post it answers on Safari.');
  assert.deepEqual(issue.labels, ['reported on MOR']);
  assert.ok(issue.body.includes(fenced(PUBLIC_WORDS)), 'the words, exactly, fenced');
  assert.ok(issue.body.includes(`\`${ids.public}\``), 'its act id');
  assert.ok(issue.body.includes(`- **To:** \`${reporting.id}\``), 'the reporting identity');
  const signer = /\*\*Signed by:\*\* `([0-9a-f]{64})`/.exec(issue.body)?.[1];
  assert.ok(signer && signer !== reporting.id, 'its signer, the one-time identity');
  assert.ok(issue.body.trimEnd().endsWith(`<!-- mor-report ${ids.public} -->`));

  // The private report: in no issue, no request, no output.
  for (const s of gh.seen) {
    assert.ok(!s.body.includes(PRIVATE_WORDS) && !s.body.includes('7f3a'), 'no private word sent to GitHub');
    assert.ok(!s.body.includes(ids.private), 'not even its id');
  }
  assert.ok(!r.out.includes('7f3a'));

  // The other way: the issue opened on GitHub, open, is listed; the pull request and the closed issue are not.
  assert.match(r.out, /Opened on GitHub and not yet answered on MOR \(1\)/);
  assert.match(r.out, /#1 by a-visitor: “Found on GitHub: the reader hangs” https:\/\/github.com\/test-owner\/test-repo\/issues\/1/);
  assert.ok(!r.out.includes('A pull request, never listed') && !r.out.includes('Closed on GitHub'));

  // Again: nothing new.
  const before = writes().length;
  const again = await run([]);
  assert.equal(again.code, 0, again.out);
  assert.match(again.out, /0 issue\(s\) to open, 0 to update, 0 answer\(s\) to add, 1 report\(s\) already mirrored as signed/);
  assert.equal(writes().length, before);
  assert.equal(mirrored().length, 1);
});

test('an answer on MOR is appended to the report’s issue once', async () => {
  const issue = mirrored()[0];
  const signer = /\*\*Signed by:\*\* `([0-9a-f]{64})`/.exec(issue.body)![1];
  const answer = await reporting.publish(POST_SPECS.text, TEXT_ACT, textPayload('Thank you: confirmed, fixed in the next release.'), {
    public: true,
    relays: [outbox.base],
    refs: [[ids.public, signer]],
    to: [signer],
  });
  ids.answer = answer.id;
  const r = await run([]);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, new RegExp(`Added the answer ${answer.id.slice(0, 12)}… to issue #${issue.number}`));
  assert.equal(issue.comments.length, 1);
  assert.ok(issue.comments[0].body.includes(fenced('Thank you: confirmed, fixed in the next release.')));
  assert.ok(issue.comments[0].body.includes(`\`${answer.id}\``));
  assert.ok(issue.comments[0].body.trimEnd().endsWith(`<!-- mor-answer ${answer.id} -->`));

  const again = await run([]);
  assert.equal(again.code, 0, again.out);
  assert.equal(issue.comments.length, 1, 'never twice');
});

test('an issue opened on GitHub, answered on MOR by its address, gets the answer and leaves the list', async () => {
  const answer = await reporting.publish(POST_SPECS.text, TEXT_ACT, textPayload(`About ${gh.url(1)}: the reader waits for a home that is away; fixed.`), {
    public: true,
    relays: [outbox.base],
  });
  // A post naming another issue's number that merely starts the same (issue 10) does not count for issue 1.
  await reporting.publish(POST_SPECS.text, TEXT_ACT, textPayload(`Unrelated: ${gh.url(1)}0 is another issue.`), { public: true, relays: [outbox.base] });
  const r = await run([]);
  assert.equal(r.code, 0, r.out);
  const seeded = gh.issues.find((i) => i.number === 1)!;
  assert.equal(seeded.comments.length, 1);
  assert.ok(seeded.comments[0].body.includes(`\`${answer.id}\``));
  assert.match(r.out, /No issue opened on GitHub waits for an answer on MOR/);
  assert.match(r.out, /1 public act\(s\) of the reporting identity answer no report or issue known here/);
  const again = await run([]);
  assert.equal(seeded.comments.length, 1, 'never twice');
  assert.equal(again.code, 0);
});

test('an issue someone else writes with the mirror’s line is not taken for the mirror’s; an edited one is put back as signed', async () => {
  const mine = mirrored()[0];
  mine.body = mine.body.replace('Safari', 'Firefox');
  const forged = gh.seed({ title: 'Forged', author: 'someone-else', body: `Words.\n<!-- mor-report ${ids.public} -->` });
  const r = await run([]);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, new RegExp(`Updated issue #${mine.number} to the report`));
  assert.ok(mine.body.includes('Safari') && !mine.body.includes('Firefox'));
  assert.equal(mirrored().length, 1);
  assert.match(r.out, new RegExp(`#${forged.number} by someone-else: “Forged”`), 'listed as any issue opened on GitHub');
  forged.state = 'closed';
});

test('the token: from the home folder, never inside the repository, and in no output', async () => {
  // From a file in the home folder.
  mkdirSync(join(homeDir, '.config', 'mor'), { recursive: true });
  writeFileSync(join(homeDir, TOKEN_FILE), `${TOKEN}\n`, { mode: 0o600 });
  const fromFile = await run([], {});
  assert.equal(fromFile.code, 0, fromFile.out);
  assert.match(fromFile.out, /token from ~\/\.config\/mor\/github-token/);

  // None: said plainly, nothing sent.
  const empty = mkdtempSync(join(tmpdir(), 'mor-reports-nohome-'));
  assert.throws(() => findToken({ HOME: empty }, empty), /No GitHub token, so nothing was sent/);
  // A token file inside the repository is refused.
  mkdirSync(join(REPO_ROOT, 'target', 'mor-reports-test', '.config', 'mor'), { recursive: true });
  const inRepo = join(REPO_ROOT, 'target', 'mor-reports-test');
  writeFileSync(join(inRepo, TOKEN_FILE), TOKEN);
  try {
    assert.throws(() => findToken({ HOME: inRepo }, inRepo), (e: unknown) => e instanceof GitHubError && /inside the repository/.test(e.message) && !e.message.includes(TOKEN));
  } finally {
    rmSync(inRepo, { recursive: true, force: true });
  }

  // Refused by GitHub: said plainly, the token scrubbed even where GitHub echoes it.
  gh.refuse = 401;
  const refused = await run([]);
  gh.refuse = null;
  assert.equal(refused.code, 1);
  assert.match(refused.out, /it refused the token/);
  assert.match(refused.out, /Bad credentials \(Bearer \[the GitHub token\]\)/, 'echoed by GitHub, scrubbed');

  // In no output of any run, and in no request but its header.
  assert.ok(outputs.length >= 8);
  for (const out of outputs) assert.ok(!out.includes(TOKEN) && !out.includes(TOKEN.slice(4, 20)), 'the token in no output');
  for (const s of gh.seen) {
    assert.ok(!s.body.includes(TOKEN) && !s.path.includes(TOKEN), 'the token in no request body or address');
  }
  assert.ok(gh.seen.every((s) => s.authorization === `Bearer ${TOKEN}`));
});

test('the placeholder is no identity', async () => {
  const r = await new Promise<{ code: number; out: string }>((resolve) =>
    execFile(process.execPath, ['--import', 'tsx', 'src/cli.ts', '--identity', 'REPORTS-IDENTITY', '--at', home.base], { cwd: here, env: { PATH: process.env.PATH ?? '', HOME: homeDir, MOR_GITHUB_TOKEN: TOKEN } }, (err, o, e) =>
      resolve({ code: err ? 1 : 0, out: o + e }),
    ),
  );
  assert.equal(r.code, 1);
  assert.match(r.out, /no reporting identity/);
  assert.ok(!r.out.includes(TOKEN));
});

test('the report page: the box writes to the reporting identity only, with the mirror’s link', () => {
  const page = readFileSync(join(REPO_ROOT, 'docs', 'dubsar.org', 'report.html'), 'utf8');
  const box = /<mor-write>([\s\S]*?)<\/mor-write>/.exec(page)?.[1] ?? '';
  const authors = [...box.matchAll(/<mor-author identity="([^"]*)">/g)].map((m) => m[1]);
  assert.deepEqual(authors, ['REPORTS-IDENTITY']);
  assert.equal((page.match(/<mor-write>/g) ?? []).length, 1);
  assert.match(page, /href="https:\/\/github.com\/nobodyallegedly\/MOR\/issues"/);
  assert.match(page, /Public/);
  assert.match(page, /Private/);
  assert.ok(!/<script/i.test(page), 'no script in a page (website cMIP, rule 11)');
});
