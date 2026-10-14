// The mirror of reports between MOR and GitHub, both ways (F287; F289's
// question 6), against real homes and relays on local ports and a fake of
// GitHub's API on another port. Test identities only. The reporting identity
// has an inbox and an encryption key, and is held at MOR Identities (the
// desk's own code, run here in this process), as the author holds it.
// Reporters write from their own identities, as Dub's "To an identity" does
// (the barebone client's `post` and `leaveInInbox`, which Dub calls); a
// sealed message is sent as the reader sends one. The reporting identity
// answers in public. The command is run as the author runs it, as its own
// process.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { start, type Running } from '../../genesis/test/world.ts';
import { SPECS } from '../../genesis/src/core.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { leaveInInbox, post, readPost, textPayload } from '../../barebone/src/post.ts';
import { POST_SPECS, TEXT_ACT } from '../../barebone/src/specs.ts';
import { writeNote } from '../../site/src/write.ts';
import { Desk } from '../../desk/src/desk.ts';
import { Store } from '../../desk/src/store.ts';
import { loadDraft } from '../../connector/src/draft.ts';
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
let reporter: TestIdentity;
let desk: Desk;
let drafts: string;
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
  for (const a of reporting.chainActs()) await relayAt(outbox.base).putAct(a);
  places = [home.base];
  // From here on the reporting identity is held at the desk, alone: every act of it is signed there.
  drafts = mkdtempSync(join(tmpdir(), 'mor-reports-drafts-'));
  const store = new Store(mkdtempSync(join(tmpdir(), 'mor-reports-desk-')));
  store.saveSettings({ homes: [home.home], relays: [outbox.base], via: {}, drafts });
  store.saveIdentity(reporting);
  store.saveBook({ ...store.book(), identities: [{ id: reporting.id, name: 'The reporting identity', linked: true }] });
  desk = new Desk(store);

  // A reporter on MOR, with an identity of its own, writing as Dub writes "To an identity".
  reporter = TestIdentity.create({ homes: [home.home] });
  await reporter.publishGenesis();
  const theInbox = (await lookUp(reporting.id, places)).inbox(SPECS.text)!;
  const made = await post(reporter, { text: PUBLIC_WORDS, relays: [outbox.base], to: [reporting.id] });
  assert.deepEqual((await leaveInInbox(reporter, made.act, theInbox)).left, [inbox.base]);
  ids.public = made.id;
  // A sealed message, as the reader sends one: private, never mirrored.
  ids.private = (await writeNote({ text: PRIVATE_WORDS, to: reporting.id, public: false, places, homes: [home.base] })).note;

  gh = new FakeGitHub(TOKEN, REPOSITORY);
  await gh.listen();
  gh.seed({ title: 'Found on GitHub: the reader hangs', author: 'a-visitor', body: 'It hangs.' });
  gh.seed({ title: 'A pull request, never listed', author: 'a-visitor', pull: true });
  gh.seed({ title: 'Closed on GitHub', author: 'a-visitor', state: 'closed' });
  homeDir = mkdtempSync(join(tmpdir(), 'mor-reports-home-'));
});

/** The reporting identity signs, at the desk's own file: one line of acts, never forked. */
async function asReporting(text: string, opts: { refs?: [string, string][]; to?: string[] } = {}): Promise<string> {
  const me = desk.store.identity(reporting.id);
  const made = await me.publish(POST_SPECS.text, TEXT_ACT, textPayload(text), { public: true, relays: [outbox.base], ...opts });
  desk.store.saveIdentity(me);
  return made.id;
}

after(async () => {
  await gh?.close();
  for (const r of [home, inbox, outbox]) await r?.stop().catch(() => {});
});

/** The command, as the author runs it, with the token in the environment unless told otherwise. */
function run(args: string[], env: Record<string, string> = { MOR_GITHUB_TOKEN: TOKEN }): Promise<{ code: number; out: string }> {
  return new Promise((resolve) => {
    execFile(
      process.execPath,
      ['--import', 'tsx', 'src/cli.ts', '--identity', reporting.id, '--at', home.base, '--repo', REPOSITORY, '--drafts', drafts, ...args],
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
  assert.equal(signer, reporter.id, 'its signer: the reporter, from its own identity');
  assert.ok(issue.body.trimEnd().endsWith(`<!-- mor-report ${ids.public} -->`));

  // The private report: in no issue, no request, no output.
  for (const s of gh.seen) {
    assert.ok(!s.body.includes(PRIVATE_WORDS) && !s.body.includes('7f3a'), 'no private word sent to GitHub');
    assert.ok(!s.body.includes(ids.private), 'not even its id');
  }
  assert.ok(!r.out.includes('7f3a'));

  // The other way: the issue opened on GitHub, open, is listed; the pull request and the closed issue are not.
  assert.match(r.out, /Opened on GitHub and not yet on MOR \(1\)/);
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
  const answer = { id: await asReporting('Thank you: confirmed, fixed in the next release.', { refs: [[ids.public, signer]], to: [signer] }) };
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
  const answer = { id: await asReporting(`About ${gh.url(1)}: the reader waits for a home that is away; fixed.`) };
  // A post naming another issue's number that merely starts the same (issue 10) does not count for issue 1.
  await asReporting(`Unrelated: ${gh.url(1)}0 is another issue.`);
  const r = await run([]);
  assert.equal(r.code, 0, r.out);
  const seeded = gh.issues.find((i) => i.number === 1)!;
  assert.equal(seeded.comments.length, 1);
  assert.ok(seeded.comments[0].body.includes(`\`${answer.id}\``));
  assert.match(r.out, /No issue opened on GitHub waits to be published on MOR/);
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

test('GitHub to MOR: an issue is published again by the reporting identity only once the author names it after the dry run and signs it at the desk; answers flow back; a declined one is not prepared again', async () => {
  const issue = gh.seed({ title: 'The listing shows nothing', author: 'another-visitor', body: 'Steps:\r\n1. open listing.html\r\n2. wait.\r\n@someone' });
  const draftsNow = () => readdirSync(drafts).filter((f) => f.endsWith('.mor-draft'));
  const expected = `Reported on GitHub by @another-visitor: The listing shows nothing\n\nSteps:\n1. open listing.html\n2. wait.\n@someone\n\n${gh.url(issue.number)}`;

  // The dry run shows, word for word, what it would be; nothing is written anywhere.
  const before = writes().length;
  const dry = await run(['--dry-run']);
  assert.equal(dry.code, 0, dry.out);
  assert.match(dry.out, /Opened on GitHub and not yet on MOR \(1\)/);
  assert.ok(dry.out.includes(`(--prepare ${issue.number}), word for word:`), dry.out);
  for (const l of expected.split('\n')) assert.ok(dry.out.includes(`  | ${l}`), `the dry run shows “${l}”`);
  // A run that names nothing prepares nothing; nor does a dry run that names it.
  assert.equal((await run([])).code, 0);
  const dryNamed = await run(['--dry-run', '--prepare', String(issue.number)]);
  assert.match(dryNamed.out, /Dry run: no draft was written/);
  assert.deepEqual(draftsNow(), []);
  assert.equal(writes().length, before, 'nothing sent to GitHub');

  // Named: one draft for the desk, as the reporting identity, never signed here.
  const signedBefore = desk.store.identity(reporting.id).f.sequence.length;
  const named = await run(['--prepare', `#${issue.number}`]);
  assert.equal(named.code, 0, named.out);
  const digest = /Prepared draft ([0-9a-f]{64}) for issue #(\d+)/.exec(named.out)?.[1];
  assert.ok(digest, named.out);
  assert.match(named.out, /Nothing was signed here\. Its words were composed as canonical text: line breaks converted to LF/);
  assert.deepEqual(draftsNow(), [`${digest}.mor-draft`]);
  const { draft } = loadDraft(drafts, digest!);
  assert.equal(draft.signer, reporting.id);
  assert.equal(draft.public, true);
  assert.deepEqual(draft.relays, [outbox.base]);
  assert.match(draft.note!, /^Prepared by mor-reports, the GitHub mirror, not by Claude: issue #\d+ by @another-visitor/);
  assert.equal(desk.store.identity(reporting.id).f.sequence.length, signedBefore, 'nothing signed by the command');
  // Still not on MOR: listed as waiting at the desk, and never prepared twice.
  const again = await run(['--prepare', String(issue.number)]);
  assert.match(again.out, new RegExp(`#${issue.number} by another-visitor: “The listing shows nothing” \\S+ Its draft ${digest!.slice(0, 12)}… waits at the desk\\.`));
  assert.match(again.out, new RegExp(`#${issue.number} already has a draft at the desk: not prepared again`));
  assert.equal(draftsNow().length, 1);

  // At the desk: read from its own bytes, approved by the author, signed there.
  const shown = (await desk.drafts()).find((d) => d.digest === digest)!;
  assert.deepEqual(shown.blocking, []);
  const done = await desk.approve(digest!);
  const act = done.acts[0];
  const onMor = await readPost(act, [outbox.base]);
  assert.equal(onMor.standing, 'valid');
  assert.equal(onMor.signer, reporting.id);
  assert.equal(onMor.text, expected);

  // The next run sees it on MOR: the issue is told once, and leaves the list.
  const seen = await run([]);
  assert.equal(seen.code, 0, seen.out);
  assert.match(seen.out, new RegExp(`Told issue #${issue.number} that it is published again on MOR as ${act.slice(0, 12)}`));
  assert.match(seen.out, new RegExp(`Published again on MOR from GitHub: #${issue.number} as ${act.slice(0, 12)}`));
  assert.match(seen.out, /No issue opened on GitHub waits to be published on MOR/);
  assert.equal(issue.comments.length, 1);
  assert.ok(issue.comments[0].body.includes('labelled “Reported on GitHub by @another-visitor”'));
  assert.ok(issue.comments[0].body.trimEnd().endsWith(`<!-- mor-republished ${act} -->`));

  // Answered on MOR, naming the re-publication: the answer flows back to the issue, once.
  const answer = await asReporting('Confirmed: the listing waited for a relay that was away. Fixed.', { refs: [[act, reporting.id]] });
  const back = await run([]);
  assert.equal(back.code, 0, back.out);
  assert.equal(issue.comments.length, 2);
  assert.ok(issue.comments[1].body.includes(fenced('Confirmed: the listing waited for a relay that was away. Fixed.')));
  assert.ok(issue.comments[1].body.includes(`published again on MOR as \`${act}\``));
  assert.ok(issue.comments[1].body.trimEnd().endsWith(`<!-- mor-answer ${answer} -->`));
  await run([]);
  assert.equal(issue.comments.length, 2, 'never twice');

  // Declined at the desk: said, and not prepared again.
  const spam = gh.seed({ title: 'Buy now', author: 'a-spammer', body: 'Cheap.' });
  const p = await run(['--prepare', String(spam.number)]);
  const spamDraft = /Prepared draft ([0-9a-f]{64})/.exec(p.out)![1];
  await desk.decline(spamDraft, 'Not a report.');
  const later = await run(['--prepare', String(spam.number)]);
  assert.match(later.out, new RegExp(`#${spam.number} by a-spammer: “Buy now” \\S+ Its draft ${spamDraft.slice(0, 12)}… was declined at the desk: not prepared again`));
  assert.equal(draftsNow().length, 2);
  assert.equal(spam.comments.length, 0);
  spam.state = 'closed';
  // An issue that is not waiting is named: said, nothing prepared.
  const none = await run(['--prepare', '999']);
  assert.match(none.out, /#999 is not an issue waiting to be published on MOR/);
  assert.equal(draftsNow().length, 2);
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

test('the report page: no writing box; how to report from one’s own identity, to the reporting identity; its answers; the mirror both ways', () => {
  const page = readFileSync(join(REPO_ROOT, 'docs', 'dubsar.org', 'report.html'), 'utf8');
  assert.ok(!page.includes('<mor-write'), 'no writing box: a report is signed by its reporter, from their own client');
  assert.match(page, /<code>REPORTS-IDENTITY<\/code>/, 'the reporting identity, to copy');
  assert.match(page, /In Dub<\/strong>/);
  assert.match(page, /href="https:\/\/dub\.dubsar\.org\/"/);
  assert.match(page, /“To an identity”/, 'the field Dub names');
  assert.match(page, /From any other client:<\/strong> a public message to the reporting identity/);
  const feed = /<mor-feed>([\s\S]*?)<\/mor-feed>/.exec(page)?.[1] ?? '';
  assert.deepEqual([...feed.matchAll(/<mor-author identity="([^"]*)">/g)].map((m) => m[1]), ['REPORTS-IDENTITY'], 'the answers, beside the public reports');
  assert.match(page, /href="https:\/\/github.com\/nobodyallegedly\/MOR\/issues"/);
  assert.match(page, /“Reported on GitHub by”/);
  assert.ok(!/<script/i.test(page), 'no script in a page (website cMIP, rule 11)');
});
