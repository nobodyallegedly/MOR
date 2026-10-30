// The rotation notice cMIP, draft 1 (`cmips/cmip-rotation-notice-draft-1.md`,
// section 4; hand test v3, H97): a collective rotation started by one
// member in Kišib, its message to each other member carrying the notice's
// structured part. The other member's Kišib on the Mac, the runner on and
// holding the member: Waiting for you lists it at once, prefilled, by clicks
// too; on the web, only after the member's words. The rotation read and
// checked as by hand, then the share given. A notice whose fingerprint does
// not match a request: listed, then refused when read, nothing signed. A
// notice with its structured part spoiled: read as free text only, never
// listed; a plain reading (a client without the cMIP) shows the whole text.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { chromium, type Browser } from 'playwright-core';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { openSealed } from '../../genesis/src/core.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { encryptionSecret, fromWords } from '../../../modules/carry/src/carry.ts';
import { negotiate, readMessage } from '../../repo/src/proposals.ts';
import { REPO_SPECS } from '../../repo/src/specs.ts';
import { Kishib } from '../src/kishib.ts';
import { NOTICE_HEAD, ROTATION_NOTICE_FORMAT, noticeText, readNotice, type Listed } from '../src/collective.ts';
import { closeAll, founded, kishib, refused, runnerOn, start, type Relay, stopAll } from './world.ts';
import type { Review, State } from '../src/shapes.ts';

const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
let browser: Browser;
let homes: Relay[];
let relay: Relay;

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  browser = await chromium.launch({ executablePath: CHROMIUM });
});

after(async () => {
  // Part 4: every program, page and server this file started, stopped whatever the outcome (`world.ts`, stopAll).
  await stopAll(() => browser?.close());
});

type Notices = { notices: Listed[]; problem: string | null; by: string | null };

test('a rotation notice: listed and prefilled in the member’s Kišib, at once with the runner, after the words without it; checked as by hand; a wrong one refused; a spoiled one free text only', async () => {
  const { H, f, fWords, ana, bo, col, papers } = await founded(homes, relay);
  const aWords = (await ana.c.ask<{ words: string[] }>('carry')).words.join(' ');

  // The founder starts the rotation: each other member told, the notice's structured part at the end of the message.
  const k1 = await kishib();
  const r = await k1.c.ask<Review>('collective start', { collective: col, address: H[0], founder: f.id, founderWords: fWords, number: String(papers[f.id].x), shareWords: papers[f.id].words.join(' ') });
  const s = await k1.c.ask<State>('confirm', { plan: r.plan, digest: r.digest });
  const q = s.sitting!.request!;

  // A client without the cMIP (Ana's Dub, a plain reading): the whole text, the values readable in it.
  const ap = (await ana.c.ask<any>('proposals')).proposals.flatMap((x: any) => x.later as string[]);
  const told = ap.find((t: string) => t.includes(q.full));
  assert.ok(told, JSON.stringify(ap));
  assert.ok(told.includes(NOTICE_HEAD) && told.includes(`collective: ${col}`) && told.includes(`share: ${papers[ana.id].x}`), told);
  assert.deepEqual(readNotice(told), { collective: col, fingerprint: q.full, relays: readNotice(told)!.relays, expires: q.expires, share: papers[ana.id].x });

  // On the Mac, the runner on and holding Ana: listed at once, prefilled.
  const k2 = await kishib();
  await runnerOn(k2.c);
  await k2.c.ask('runner give', { id: ana.id, address: H[0], words: aWords });
  const at = await k2.c.ask<Notices>('collective notices', {});
  assert.equal(at.by, 'runner');
  assert.equal(at.problem, null);
  assert.equal(at.notices.length, 1, JSON.stringify(at));
  const n = at.notices[0];
  assert.deepEqual([n.collective, n.fingerprint, n.share, n.member, n.from, n.expires], [col, q.full, papers[ana.id].x, ana.id, f.id, q.expires]);
  assert.ok(n.relays.length >= 1 && n.relays.every((x) => /^https?:\/\//.test(x)));

  // By clicks: Collectives, Waiting for you, the rotation listed; tapped, the form filled in and the rotation read back.
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${k2.app.base}/#pair=${k2.app.access.newCode()}`);
  await page.locator('.k-tile').first().waitFor({ timeout: 60_000 });
  await page.click('[data-k-tile="collectives"]');
  await page.click('[data-action="open-door"]');
  await page.click('[data-k-col="give"]');
  const listed = page.locator(`#notices [data-notice="${q.full}"]`);
  await listed.waitFor({ timeout: 60_000 });
  assert.match(await listed.innerText(), new RegExp(`your share ${papers[ana.id].x}`));
  await listed.locator('[data-action="notice-pick"]').click();
  await page.locator('#request .kishib-review').waitFor({ timeout: 60_000 });
  assert.equal(await page.inputValue('#form-give [name="fingerprint"]'), q.full);
  assert.equal(await page.inputValue('#form-give [name="number"]'), String(papers[ana.id].x));
  assert.match(await page.inputValue('#form-give [name="collective"]'), /^mid1/);
  assert.match(await page.locator('#request').innerText(), /The rotation you are asked to give your share to/);
  if (process.env.MOR_SCREENSHOTS) await page.screenshot({ path: join(process.env.MOR_SCREENSHOTS, 'notice-01-listed.png') });
  assert.deepEqual(errors, []);
  await context.close();

  // On the web (Kišib holds nothing): said first; listed only after the member's words.
  const web = new Kishib({ web: true });
  const none = await web.collectiveNotices({});
  assert.deepEqual([none.notices.length, none.by], [0, null]);
  assert.match(none.problem ?? '', /give your ID, one of your homes and your signing words/);
  const after = await web.collectiveNotices({ member: ana.id, address: H[0], words: aWords });
  assert.equal(after.by, 'words');
  assert.deepEqual(after.notices.map((x) => x.fingerprint), [q.full]);

  // Read and checked as by hand, from the notice's values; then the share given.
  const rd = await k2.c.ask<{ sections: { heading: string; lines: { text: string }[] }[] }>('collective read', { collective: n.collective, fingerprint: n.fingerprint, address: n.relays.join(' ') });
  assert.ok(rd.sections[0].lines.some((l) => l.text.includes(q.full)));
  const gr = await k2.c.ask<Review>('collective give', { collective: n.collective, fingerprint: n.fingerprint, address: n.relays.join(' '), member: ana.id, memberWords: aWords, number: String(n.share), shareWords: papers[ana.id].words.join(' ') });
  assert.equal((await k2.c.ask<State>('confirm', { plan: gr.plan, digest: gr.digest })).sitting!.stage, 'done');

  // Bo, a member, sends two more notices to Ana: one naming no request there is, one with its structured part spoiled.
  const boId = TestIdentity.load(join(bo.dir, 'identities', bo.id, 'identity.json'));
  const look = await lookUp(ana.id, H);
  const reach = { id: ana.id, key: look.encryptionKey!, inbox: look.inbox(REPO_SPECS.agreements) ?? [] };
  const wrong = 'ab'.repeat(32);
  await negotiate(boId, reach, { text: noticeText('A rotation waits for your share.', { collective: col, fingerprint: wrong, relays: n.relays, expires: q.expires, share: n.share }), format: ROTATION_NOTICE_FORMAT, home: false });
  const spoiled = `${noticeText('Another rotation waits.', { collective: col, fingerprint: 'cd'.repeat(32), relays: n.relays, expires: q.expires, share: n.share })}\nand a line after it`;
  assert.equal(readNotice(spoiled), null, 'nothing follows the structured part');
  await negotiate(boId, reach, { text: spoiled, format: ROTATION_NOTICE_FORMAT, home: false });

  // The wrong one is listed (it only saves copying), and refused when read: said, nothing signed. The spoiled one, never listed.
  const again = await k2.c.ask<Notices>('collective notices', {});
  const fps = again.notices.map((x) => x.fingerprint);
  assert.ok(fps.includes(wrong), JSON.stringify(fps));
  assert.ok(!fps.includes('cd'.repeat(32)), 'a spoiled structured part is free text only');
  const signedBefore = (await k2.c.ask<{ signed: unknown[] }>('runner state')).signed.length;
  await refused(k2.c.ask('collective read', { collective: col, fingerprint: wrong, address: n.relays.join(' ') }), /No rotation request with this fingerprint/);
  assert.equal((await k2.c.ask<{ signed: unknown[] }>('runner state')).signed.length, signedBefore, 'nothing signed');

  // A plain reading of the spoiled one (a client without the cMIP): the whole text, as written.
  const secret = encryptionSecret(fromWords(aWords));
  const texts: string[] = [];
  for (const hint of reach.inbox)
    for (const it of (await relayAt(hint).feed({ to: ana.id })).items) {
      if (it.kind !== 'sealed') continue;
      try {
        const m = readMessage((openSealed(it.item, ana.id, secret) as { described: Parameters<typeof readMessage>[0] }).described);
        if (m) texts.push(m.text);
      } catch {
        // not Ana's to open
      }
    }
  assert.ok(texts.includes(spoiled), 'the whole text, as written');
});
