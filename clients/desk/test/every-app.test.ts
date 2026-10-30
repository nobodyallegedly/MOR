// The kit's rows of hand test v3, checked in every app at once, in a real
// browser (headless Chromium; WebKit where the iPad's and iPhone's fixes
// are, when it is installed): each app's program with an identity in it,
// driven by clicks alone.
//
// - H102 (with H91): Remove from the identity panel, its confirmation drawn
//   on top of the panel, in view; Keep it returns to the panel; Escape
//   closes the top one only; the panel's ×.
// - H105: every app's tiles at 390 px wide, a tall and a short phone, light
//   and dark: no icon over its words.
// - H82, H83: an identity whose signing key was changed elsewhere: the
//   warning a pop-up over the page, with the box for the new words; closed,
//   a one-line reminder under the top; switching to an identity whose key
//   is fine, nothing of it stays; back, the reminder again.
//
// Real homes and a relay on local ports. Test identities only.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { chromium, type Browser, type Page } from 'playwright-core';
import { ACCEPTABLE } from '../../damgar/src/specs.ts';
import { closeAll, damgar, dub, edubba, start, type Relay } from '../../damgar/test/world.ts';
import { closeAll as closeUmmia, ummia } from '../../ummia/test/world.ts';
import { closeAll as closeKishib, kishib } from '../../kishib/test/world.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { unhex } from '../../genesis/src/core.ts';
import { encryptionSecret, toWords } from '../../../modules/carry/src/carry.ts';

const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const shots = process.env.MOR_SCREENSHOTS;
const SIZES = { mac: { width: 1280, height: 800 }, phone: { width: 390, height: 844 } } as const;

let homes: Relay[];
let relay: Relay;
let browser: Browser;
/** Each app's page, with an identity in use: its address (paired once per page opened), and how it brings another identity. */
const apps: { name: string; url: () => string; bring: (id: string, words: string) => Promise<unknown>; ask: (op: string, a?: Record<string, unknown>) => Promise<unknown> }[] = [];
let MAX = '';
const problems: string[] = [];
/** The pages that open on tiles: Kišib's (no identity needed) beside the others. */
const tiled: { name: string; url: () => string }[] = [];

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const max = await dub(H, R);
  await max.c.ask('name', { name: 'Max' });
  MAX = max.id;
  apps.push({ name: 'Dub', url: () => `${max.app.base}/#pair=${max.app.access.newCode()}`, bring: (id, words) => max.c.ask('bring', { id, words, address: H[0] }), ask: (op, a) => max.c.ask(op, a ?? {}) });
  const g = await damgar();
  await g.c.ask('bring', { id: max.id, words: max.words, address: H[0] });
  await g.c.ask('accept', { keys: ACCEPTABLE.map((a) => a.key) });
  apps.push({ name: 'Damgar', url: () => `${g.app.base}/#pair=${g.app.access.newCode()}`, bring: async (id, words) => (await g.c.ask('bring', { id, words, address: H[0] }), await g.c.ask('accept', { keys: ACCEPTABLE.map((a) => a.key) })), ask: (op, a) => g.c.ask(op, a ?? {}) });
  const e = await edubba(H, R);
  await e.c.ask('bring', { name: 'Max', id: max.id, words: max.words, address: H[0], linked: false });
  apps.push({ name: 'Edubba', url: () => `${e.app.base}/#pair=${e.app.access.newCode()}`, bring: async (id, words) => (await e.c.ask('bring', { name: 'Changed elsewhere', id, words, address: H[0], linked: false }), await e.c.ask('acting as', { id })), ask: (op, a) => e.c.ask(op, a ?? {}) });
  const u = await ummia();
  await u.c.ask('bring', { id: max.id, words: max.words, address: H[0] });
  await u.c.ask('settings', { relays: R, track: R });
  apps.push({ name: 'Ummia', url: () => `${u.app.base}/#pair=${u.app.access.newCode()}`, bring: (id, words) => u.c.ask('bring', { id, words, address: H[0] }), ask: (op, a) => u.c.ask(op, a ?? {}) });
  const k = await kishib();
  tiled.push({ name: 'Kišib', url: () => `${k.app.base}/#pair=${k.app.access.newCode()}` }, ...apps.filter((a) => a.name !== 'Dub'));
  browser = await chromium.launch({ executablePath: CHROMIUM });
});

after(async () => {
  await browser?.close();
  await closeAll();
  await closeUmmia();
  await closeKishib();
  for (const r of [...(homes ?? []), relay]) await r?.stop();
});

async function open(url: string, size: { width: number; height: number }): Promise<Page> {
  const context = await browser.newContext({ viewport: size });
  const page = await context.newPage();
  page.on('console', (m) => {
    if (m.type() === 'error' && !/status of 4\d\d|Failed to load resource/.test(m.text())) problems.push(m.text());
  });
  page.on('pageerror', (err) => problems.push(err.message));
  await page.goto(url);
  await page.locator('[data-k-open="identity"]').first().waitFor({ timeout: 90_000 }).catch(async (err) => {
    await shot(page, `open-failed-${new URL(url).port}`);
    throw new Error(`${(await page.locator('body').innerText()).slice(0, 600)}: ${err instanceof Error ? err.message : String(err)}`);
  });
  return page;
}

const shot = async (page: Page, name: string) => {
  if (shots) await page.screenshot({ path: `${shots}/every-app-${name}.png` });
};

/** Whether the element is what a tap at its middle reaches, in view. */
const onTop = (page: Page, sel: string) =>
  page.locator(sel).first().evaluate((el) => {
    const r = el.getBoundingClientRect();
    const at = document.elementFromPoint(r.left + r.width / 2, r.top + Math.min(r.height / 2, 40));
    return !!at && el.contains(at) && r.top >= 0 && r.bottom <= window.innerHeight + 1;
  });

for (const size of ['mac', 'phone'] as const) {
  test(`H102: in every app, Remove from the identity panel: its confirmation on top of the panel, in view; Keep it; Escape closes the top one only (${size})`, async () => {
    for (const a of apps) {
      const page = await open(a.url(), SIZES[size]);
      try {
      // Whatever a page said on opening is closed first, so it covers nothing.
      await page.keyboard.press('Escape');
      await page.locator('[data-k-open="identity"]').first().click();
      const panel = page.locator('.k-panel[data-k-panel="identity"]');
      await panel.waitFor();
      assert.equal(await panel.locator('[data-k-close]').count(), 1, `${a.name}: the panel’s ×`);
      await panel.locator('[data-k-idmenu]').first().click();
      await page.getByRole('menuitem', { name: /^Remove from / }).click();
      const confirm = page.locator('[data-k-confirm]');
      await confirm.waitFor();
      assert.match(await confirm.innerText(), /Remove .+\?/, a.name);
      assert.ok(await onTop(page, '[data-k-confirm]'), `${a.name}: the confirmation is on top, in view`);
      await shot(page, `${a.name}-remove-${size}`);
      await confirm.locator('[data-k-remove-no]').click();
      await confirm.waitFor({ state: 'detached' });
      assert.ok(await panel.isVisible(), `${a.name}: Keep it returns to the panel`);
      await panel.locator('[data-k-idmenu]').first().click();
      await page.getByRole('menuitem', { name: /^Remove from / }).click();
      await confirm.waitFor();
      await page.keyboard.press('Escape');
      await confirm.waitFor({ state: 'detached' });
      assert.ok(await panel.isVisible(), `${a.name}: Escape closed the confirmation only`);
      await panel.locator('[data-k-close]').click();
      await panel.waitFor({ state: 'detached' });
      assert.equal(await page.locator('.k-shade').count(), 0, `${a.name}: nothing left over the page`);
      } catch (err) {
        await shot(page, `${a.name}-failed-${size}`);
        throw new Error(`${a.name}: ${err instanceof Error ? err.message : String(err)}`);
      }
      await page.context().close();
    }
    assert.deepEqual(problems, []);
  });
}

test('H93: Rules I follow in Dub, Edubba and Ummia: asked under the top; followed in this app only, or added to the list every app reads', async () => {
  // Max accepted every money rule in Damgar (its list sealed at the homes): Payment, Money messages and Grant limits are on it.
  const steps = [
    { app: 'Dub', here: 'corrections', list: 'naming', listed: ['payment', 'grant-limits'], notCarried: [] as string[] },
    { app: 'Edubba', here: 'agent-memory', list: 'appended', listed: ['naming', 'messages'], notCarried: ['corrections'] },
    { app: 'Ummia', here: 'release-manifest', list: 'long-form', listed: ['naming'], notCarried: [] },
  ];
  for (const st of steps) {
    const a = apps.find((x) => x.name === st.app)!;
    // Read afresh by the program, as on opening after another app changed the list.
    await a.ask('rules');
    const page = await open(a.url(), SIZES.mac);
    try {
      const line = page.locator('[data-k-rules-ask]');
      await line.waitFor({ timeout: 60_000 });
      assert.match(await line.innerText(), new RegExp(`${st.app} runs (a rule|\\d+ rules) you have not approved`), st.app);
      await line.getByRole('button', { name: 'Rules I follow' }).click();
      const part = page.locator('[data-k-rules-part]').first();
      await part.waitFor();
      const row = (k: string) => part.locator(`[data-k-rule-row="${k}"]`);
      for (const k of st.listed) assert.match(await row(k).locator('.k-rule-on').innerText(), /On your list/, `${st.app}: ${k} read from the list`);
      for (const k of st.notCarried) assert.match(await row(k).locator('.k-rule-on').innerText(), /Not followed yet/, `${st.app}: ${k}, followed in another app only, is asked here`);
      await shot(page, `${st.app}-rules`);
      await row(st.here).locator(`[data-k-rule-where="here"]`).click();
      await page.locator(`[data-k-rules-part] [data-k-rule-row="${st.here}"] .k-rule-on`, { hasText: `In ${st.app} only` }).waitFor({ timeout: 60_000 });
      await page.locator(`[data-k-rules-part] [data-k-rule-row="${st.list}"] [data-k-rule-where="list"]`).click();
      await page.locator(`[data-k-rules-part] [data-k-rule-row="${st.list}"] .k-rule-on`, { hasText: 'On your list' }).waitFor({ timeout: 60_000 });
      await shot(page, `${st.app}-rules-approved`);
    } catch (err) {
      await shot(page, `${st.app}-rules-failed`);
      throw new Error(`${st.app}: ${err instanceof Error ? err.message : String(err)}`);
    }
    await page.context().close();
  }
  // Everything approved in Dub: the line under the top goes.
  const dub = apps.find((x) => x.name === 'Dub')!;
  await dub.ask('rules approve', { keys: ['*'], where: 'here' });
  const page = await open(dub.url(), SIZES.mac);
  await page.waitForTimeout(1500);
  assert.equal(await page.locator('[data-k-rules-ask]').count(), 0, 'nothing left to ask in Dub');
  await page.context().close();
  assert.deepEqual(problems, []);
});

test('H82, H83: in every app, a key changed elsewhere: a pop-up over the page, closed to a line under the top; it follows the identity in use', async () => {
  // An identity held in every app beside Max, its signing key then changed elsewhere (a rotation, as Kišib makes one).
  const g = TestIdentity.create({ homes: [homes[0].home] });
  await g.publishGenesis();
  await g.publishRoutes([{ scope: null, hints: [relay.base], kind: 0 }, { scope: null, hints: [relay.base], kind: 1 }]);
  await g.publishEncryptionKey(encryptionSecret(unhex(g.f.signingSecret)));
  const words = toWords(unhex(g.f.signingSecret)).join(' ');
  for (const a of apps) await a.bring(g.id, words);
  // The apps' own lines are left out (their acts void): only the warning matters here.
  const { plan } = await g.planRotation({});
  await g.prepareRotation({ warned: plan.warning ?? undefined });
  await g.submitRotation();
  assert.ok((await g.settleRotation()).counts);
  for (const a of apps) {
    const page = await open(a.url(), SIZES.mac);
    try {
      const box = page.locator('[data-k-keychanged-box]');
      await box.waitFor({ timeout: 90_000 });
      assert.match(await box.innerText(), /changed elsewhere/, a.name);
      assert.ok(await onTop(page, '[data-k-confirm]'), `${a.name}: the warning on top`);
      assert.equal(await box.locator('textarea').count(), 1, `${a.name}: the box for the new words in it`);
      await shot(page, `${a.name}-key-changed`);
      await page.locator('[data-k-confirm] [data-k-close]').click();
      const line = page.locator('.k-reminder[data-k-keychanged]');
      await line.waitFor();
      // Max, whose key is fine: nothing of the warning stays.
      await page.locator('[data-k-open="identity"]').first().click();
      await page.locator(`.k-panel [data-k-use="${MAX}"]`).click();
      await page.waitForFunction(() => !document.querySelector('[data-k-keychanged], [data-k-keychanged-box]'), undefined, { timeout: 60_000 });
      await page.waitForTimeout(1500);
      assert.equal(await page.locator('[data-k-keychanged], [data-k-keychanged-box]').count(), 0, `${a.name}: nothing for Max`);
      // Back: the line again.
      await page.locator('[data-k-open="identity"]').first().click();
      await page.locator(`.k-panel [data-k-use="${g.id}"]`).click();
      await line.waitFor({ timeout: 60_000 });
    } catch (err) {
      await shot(page, `${a.name}-key-failed`);
      throw new Error(`${a.name}: ${err instanceof Error ? err.message : String(err)}`);
    }
    await page.context().close();
  }
  assert.deepEqual(problems, []);
});

test('H105: every app’s tiles at 390 px wide, light and dark: a tile’s icon never over its words', async () => {
  for (const a of tiled) {
    for (const height of [844, 664]) {
      for (const colorScheme of ['light', 'dark'] as const) {
        const context = await browser.newContext({ viewport: { width: 390, height }, colorScheme });
        const page = await context.newPage();
        page.on('pageerror', (err) => problems.push(err.message));
        await page.goto(a.url());
        const home = page.locator('[data-action="home-tiles"]');
        await page.locator('.k-tile, [data-action="home-tiles"]').first().waitFor({ timeout: 90_000 });
        if (!(await page.locator('.k-tile').count())) await home.first().click();
        await page.locator('.k-tile').first().waitFor({ timeout: 60_000 });
        const overlaps = await page.locator('.k-tile').evaluateAll((ts) =>
          ts.flatMap((t) => {
            const ic = t.querySelector('.k-ic')!.getBoundingClientRect();
            return [...t.querySelectorAll('h2, p')].map((w) => w.getBoundingClientRect()).filter((w) => w.height && ic.bottom > w.top + 0.5 && ic.top < w.bottom && ic.right > w.left && ic.left < w.right).map(() => t.querySelector('h2')!.textContent);
          }),
        );
        assert.deepEqual(overlaps, [], `${a.name} at 390×${height}, ${colorScheme}`);
        await shot(page, `${a.name}-tiles-390x${height}-${colorScheme}`);
        await context.close();
      }
    }
  }
  assert.deepEqual(problems, []);
});
