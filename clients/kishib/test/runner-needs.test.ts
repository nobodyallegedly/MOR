// The runner cMIP, draft 4 (`cmips/cmip-runner-draft-4.md`, 2.1a, 2.2,
// 2.2a, 8.1, 8.1a; hand test v3, H124, H126): an app states, in its pairing
// request, why it needs to open what is sealed to an identity and what it
// cannot do without it. Dub states its own; Damgar and Edubba pair through
// the same link (Dub's `RunnerLink`), each with its stated need. Kišib's
// Apps shows each beside the "may open" box, as the app's words, the box
// unticked; a need for a permission the runner does not define dropped, said
// nowhere; one too long refused. Approved, a pairing stays where it is,
// open, the paired apps newest first (H124). Left off, Dub says so and
// points to the box (8.1a).

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium, type Browser } from 'playwright-core';
import { DUB_NEEDS, RunnerLink, type RunnerNeeds } from '../../dub/src/runner.ts';
import { RUNNER_NO_OPEN_SAY } from '../../dub/src/dub.ts';
import { NEED_MAX, type RunnerView } from '../src/runner.ts';
import { closeAll, dub, dubBeside, kishib, runnerOn, start, type Relay, stopAll } from './world.ts';

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

const state = (c: { ask<T>(op: string, a?: unknown): Promise<T> }) => c.ask<RunnerView>('runner state');

/** The needs Damgar and Edubba state (2.1a's examples), as each would pass them to its `RunnerLink`. */
const DAMGAR_NEEDS: RunnerNeeds = { opening: { why: 'to read your lanes, your payments and your list of rules', without: 'Damgar cannot work for this identity' } };
const EDUBBA_NEEDS: RunnerNeeds = { opening: { why: 'to read the proposals you are asked to sign', without: 'To sign stays empty' } };

/** An app on this computer pairing through Dub's link, as Damgar's and Edubba's programs do, with its name and its needs. */
function linkOf(kishibDir: string, name: string, port: number, needs?: RunnerNeeds) {
  return new RunnerLink(mkdtempSync(join(tmpdir(), `kishib-needs-${name.toLowerCase()}-`)), { kishib: kishibDir, origin: () => `http://127.0.0.1:${port}`, name, needs });
}

/** A pairing request sent as is, through Kišib's door for apps. */
const pairRaw = (base: string, body: unknown) => fetch(`${base}/runner/pair`, { method: 'POST', headers: { 'content-type': 'application/json', 'mor-runner-pair': '1' }, body: JSON.stringify(body) });

test('stated needs: each app’s need beside the box, unticked; unknown ones dropped; too long refused; approved in place, newest first; left off, said', async () => {
  const H = homes.map((h) => h.base);
  const a = await dub(H, [relay.base]);
  const k = await kishib();
  await runnerOn(k.c);
  await k.c.ask('runner give', { id: a.id, address: H[0], words: (await a.c.ask<{ words: string[] }>('carry')).words.join(' ') });

  // Dub states its own need (2.1a); Damgar and Edubba pair through the same link, each with its own.
  const d = await dubBeside(k.dir);
  await d.c.ask('runner pair');
  await linkOf(k.dir, 'Damgar', 41001, DAMGAR_NEEDS).pair();
  await linkOf(k.dir, 'Edubba', 41002, EDUBBA_NEEDS).pair();
  let v = await state(k.c);
  const byName = (n: string) => v.apps.find((x) => x.name === n)!;
  assert.deepEqual(byName('Dub').needs, DUB_NEEDS);
  assert.deepEqual(byName('Damgar').needs, DAMGAR_NEEDS);
  assert.deepEqual(byName('Edubba').needs, EDUBBA_NEEDS);
  // An app that states none: as in draft 3.
  await linkOf(k.dir, 'Ummia', 41003).pair();
  v = await state(k.c);
  assert.deepEqual(byName('Ummia').needs, {});
  // (At most five pairings wait at once: those only checked are refused as they go.)
  await k.c.ask('runner revoke', { pairing: byName('Ummia').id });

  // A need for a permission the runner does not define: dropped, said nowhere (2.1a).
  let r = await pairRaw(k.app.base, { name: 'Other', origin: 'http://127.0.0.1:41004', needs: { opening: { why: 'to read', without: 'nothing' }, signing: { why: 'to sign everything', without: 'nothing works' } } });
  assert.equal(r.status, 200);
  v = await state(k.c);
  assert.deepEqual(byName('Other').needs, { opening: { why: 'to read', without: 'nothing' } });
  await k.c.ask('runner revoke', { pairing: byName('Other').id });
  r = await pairRaw(k.app.base, { name: 'Only unknown', origin: 'http://127.0.0.1:41005', needs: { signing: { why: 'to sign everything', without: 'nothing works' } } });
  assert.equal(r.status, 200);
  v = await state(k.c);
  assert.deepEqual(byName('Only unknown').needs, {});
  // Longer than 300 characters: refused, said plainly, nothing paired.
  r = await pairRaw(k.app.base, { name: 'Wordy', origin: 'http://127.0.0.1:41006', needs: { opening: { why: 'x'.repeat(NEED_MAX + 1), without: 'nothing' } } });
  assert.equal(r.status, 400);
  assert.match(((await r.json()) as { error: string }).error, /longer than 300 characters/);
  assert.ok(!(await state(k.c)).apps.some((x) => x.name === 'Wordy'));
  await k.c.ask('runner revoke', { pairing: byName('Only unknown').id });

  // Kišib's Apps: each need beside the box, as the app's words; every box unticked.
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${k.app.base}/#pair=${k.app.access.newCode()}`);
  await page.locator('.k-tile').first().waitFor({ timeout: 60_000 });
  await page.click('[data-k-tile="runner"]');
  await page.click('[data-k-col="apps"]');
  for (const [name, n] of [['Dub', DUB_NEEDS], ['Damgar', DAMGAR_NEEDS], ['Edubba', EDUBBA_NEEDS]] as const) {
    const line = page.locator(`[data-pairing="${byName(name).id}"]`);
    assert.equal((await line.locator('[data-need="opening"]').innerText()).trim(), `${name} says it needs this “${n.opening!.why}”; without it, “${n.opening!.without}”.`);
    assert.equal(await line.locator('input[name="open"]').isChecked(), false, `${name}: the box unticked, whatever the app says`);
  }

  // H124: Dub approved (opening left off): it stays where it is, open, first of the paired apps.
  await page.click(`[data-action="approve"][data-pairing="${byName('Dub').id}"]`);
  await page.locator(`[data-app="${byName('Dub').id}"]`).waitFor();
  assert.equal(await page.locator('[data-app]').first().getAttribute('data-app'), byName('Dub').id);
  assert.equal(await page.locator(`[data-app="${byName('Dub').id}"] [data-open]`).count(), 1, 'open: its opening choice in place');
  assert.match(await page.locator(`[data-app="${byName('Dub').id}"] [data-need="opening"]`).innerText(), /^Dub says it needs this/);
  await page.waitForTimeout(1100);
  // Then Damgar: the newest first.
  await page.click(`[data-action="approve"][data-pairing="${byName('Damgar').id}"]`);
  await page.locator(`[data-app="${byName('Damgar').id}"]`).waitFor();
  assert.deepEqual(await page.locator('[data-app]').evaluateAll((xs) => xs.map((x) => (x as HTMLElement).dataset.app)), [byName('Damgar').id, byName('Dub').id]);
  // Changing Dub's opening later does not move it.
  await page.click(`[data-action="opening"][data-pairing="${byName('Dub').id}"][data-on="0"]`);
  await page.waitForTimeout(300);
  assert.deepEqual(await page.locator('[data-app]').evaluateAll((xs) => xs.map((x) => (x as HTMLElement).dataset.app)), [byName('Damgar').id, byName('Dub').id]);
  assert.deepEqual(errors, []);
  await context.close();

  // 8.1a: left off, Dub says so and points to the box, and goes on.
  await d.c.ask('runner take', { id: a.id });
  const box = await d.c.ask<{ encryption: boolean; opening: string | null }>('inbox');
  assert.equal(box.encryption, false);
  assert.equal(box.opening, RUNNER_NO_OPEN_SAY);
  assert.match(RUNNER_NO_OPEN_SAY, /Runner, Apps, Dub, “may open what is sealed to” this identity/);
});
