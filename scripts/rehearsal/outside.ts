// The rehearsal's checks from outside (step 17): a fresh process, as a
// stranger, told one home's address, the gateway's address and the links a
// stranger would be given (identities and act ids), nothing else. Every
// act is fetched by following its signer from that home, and judged
// through its signer's identity chain by the core library.
//
//   outside.ts acts TOLD.json
//   outside.ts rotation TOLD.json ROTATION-ID POST-AFTER-ID OTHER-HOME
//
// Prints the checks as JSON ({"checks": [...]}) on its last line.

import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MIRS, SPECS, Verifier, cborDecode, describeAct, hex } from '../../clients/genesis/src/core.ts';
import { followRef, lookUp } from '../../clients/genesis/src/identity.ts';
import { actsBy } from '../../clients/genesis/src/lines.ts';
import { show } from '../../clients/reader/src/read.ts';
import { readPost } from '../../clients/barebone/src/post.ts';
import { verifyRelease } from '../../clients/repo/src/release.ts';
import { readListing } from '../../clients/site/src/listing.ts';
import { listingHtml } from '../../clients/site/src/shell/listing-view.ts';
import { readFeed } from '../../clients/site/src/feed.ts';
import { readHeld } from '../../clients/reports/src/read.ts';
import { Checklist } from './checklist.ts';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const require = createRequire(join(ROOT, 'clients/site/package.json'));
/** playwright-core, from the site client's packages (it is a CommonJS module). */
const playwright = async () => { const m = await import(require.resolve('playwright-core')); return (m.default ?? m) as typeof import('../../clients/site/node_modules/playwright-core/index.js'); };
const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const [mode, toldFile, ...rest] = process.argv.slice(2);
const told = JSON.parse(readFileSync(toldFile, 'utf8'));
const home: string = told.home;
const list = new Checklist();

interface Judged {
  standing: string;
  signer: string;
  how: string;
  act: Uint8Array;
}

/** One verifier per signer, looked up at the one home known. */
const verifiers = new Map<string, Promise<Verifier>>();
function verifierOf(signer: string): Promise<Verifier> {
  let v = verifiers.get(signer);
  if (!v) {
    v = (async () => {
      const into = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements);
      await lookUp(signer, [home], {}, into);
      return into;
    })();
    verifiers.set(signer, v);
  }
  return v;
}

/** An act, followed from the one home by its signer (its routes, then its homes), judged through its signer's chain. */
async function judge(id: string, signer: string): Promise<Judged> {
  const f = await followRef([id, signer], [home]);
  const d = describeAct(f.act) as { signer?: string };
  const v = await verifierOf(signer);
  v.add(f.act);
  return { standing: v.status(id) as string, signer: d.signer ?? '', how: f.how, act: f.act };
}

/** The site in a browser, through the gateway, as a visitor sees it; nothing but 127.0.0.1 is reached. */
async function inBrowser(): Promise<true | string> {
    const { chromium } = await playwright();
    const browser = await chromium.launch({ executablePath: CHROMIUM });
    try {
      const ctx = await browser.newContext();
      // Nothing leaves this machine: any address but 127.0.0.1 is refused.
      const outsideAsked: string[] = [];
      await ctx.route(/.*/, (route: import('../../clients/site/node_modules/playwright-core/index.js').Route) => {
        const u = new URL(route.request().url());
        if (u.hostname === '127.0.0.1') return route.continue();
        outsideAsked.push(u.host);
        return route.abort();
      });
      const page = await ctx.newPage();
      await page.goto(told.gateway + '/');
      await page.waitForSelector('#mor-bar.ok, #mor-bar.bad', { timeout: 120_000 });
      const standing = (await page.evaluate(() => document.getElementById('mor-standing')?.textContent ?? ''));
      const signer = (await page.evaluate(() => document.getElementById('mor-signer')?.textContent ?? '')).replace(/\s/g, '');
      await page.waitForFunction(() => /verified/.test(document.getElementById('mor-acts')?.textContent ?? ''), null, { timeout: 60_000 }).catch(() => undefined);
      const text = (sel: string) => page.evaluate((q: string) => document.querySelector(q)?.textContent ?? '', sel);
      const acts = (await text('#mor-acts')).replace(/\s+/g, ' ').trim() || `no act listed; the bar says: ${(await text('#mor-bar')).replace(/\s+/g, ' ').trim().slice(0, 400)}`;
      const problems: string[] = [];
      if (!/^Verified: /.test(standing)) problems.push(`the bar says "${standing.slice(0, 120)}"`);
      if (!signer.includes(told.author)) problems.push(`the signer shown is not the author's identity (${signer.slice(0, 40)})`);
      if (!/verified/.test(acts)) problems.push(`the first act is not shown verified ("${acts.slice(0, 120)}")`);
      if (outsideAsked.length) problems.push(`the page asked for addresses outside this machine: ${[...new Set(outsideAsked)].join(', ')}`);
      return problems.length ? problems.join('; ') : true;
    } finally {
      await browser.close();
    }
  }

const short = (id: string | null | undefined) => (id ?? 'nothing').slice(0, 12);

if (mode === 'acts') {
  // 1. Every act, through its signer's chain, from one home's address.
  const acts: [label: string, id: string, signer: string][] = [
    ['the first post', told.firstActs.firstPost, told.author],
    ['the shower text', told.firstActs.shower, told.author],
    ...told.specifications.map((s: { file: string; id: string }): [string, string, string] => [s.file, s.id, told.author]),
    ...told.releases.map((r: { name: string; id: string }): [string, string, string] => [`release ${r.name}`, r.id, told.author]),
    ['the site version', told.site, told.author],
    ['Thank you for MOR', told.firstActs.thanks, told.author],
    ["Machine, allegedly's first act", told.disclosure, told.machine],
    ["Machine, allegedly's co-signature", told.cosign, told.machine],
    ...told.stamps.map((s: string): [string, string, string] => ['a clock stamp', s, told.clock]),
    ["the stranger's report", told.report.id, told.report.by],
  ];
  const bad: string[] = [];
  for (const [label, id, signer] of acts) {
    try {
      const j = await judge(id, signer);
      if (j.standing !== 'valid' || j.signer !== signer) bad.push(`${label} ${short(id)}: ${j.standing}, signed by ${short(j.signer)}`);
    } catch (e) {
      bad.push(`${label} ${short(id)}: ${e instanceof Error ? e.message : e}`);
    }
  }
  list.add(
    'outside',
    `Every act (${acts.length}) verifies through its signer's identity chain, from a fresh process that knows only one home's address.`,
    bad.length === 0,
    bad.join('; '),
  );

  // 2. The reader: each first act signed by the author's identity.
  const authorPlaces = async () => {
    const l = await lookUp(told.author, [home]);
    return [...new Set([home, ...l.routes.routes.filter((r) => (r.kind ?? 0) === 0).flatMap((r) => r.hints)])];
  };
  await list.run('outside', "The reader shows the first post (its photograph too), the shower text and Thank you for MOR, each verified and signed by the author's identity; the specifications, releases and site version, which the reader does not show as text, are signed by it too (check 1).", async () => {
    const places = await authorPlaces();
    const out: string[] = [];
    for (const [label, id] of [['the first post', told.firstActs.firstPost], ['the shower text', told.firstActs.shower], ['Thank you for MOR', told.firstActs.thanks]] as const) {
      const s = await show(id, places, told.author);
      if (s.post.standing !== 'valid' || !s.byOwner) out.push(`${label}: ${s.post.standing}, by the owner: ${s.byOwner}`);
    }
    const p = await readPost(told.firstActs.firstPost, places);
    const pic = p.refs[0] as { kind: string; standing?: string; bytes?: Uint8Array | null };
    if (pic?.kind !== 'picture' || pic.standing !== 'valid' || !pic.bytes) out.push('the photograph is not shown verified');
    return out.length ? out.join('; ') : true;
  });

  // 3. The display client: the release verified and taken from MOR, then the gateway compared with it; and in a browser.
  await list.run('outside', 'The display client, verified from its release on MOR, is what the gateway serves, and the gateway serves the site exactly as signed: SAME.', async () => {
    const out = mkdtempSync(join(process.env.TMPDIR ?? '/tmp', 'display-client-'));
    const r = await verifyRelease(told.display, [home], { out });
    if (!r.ok) return `the display client's release does not verify: ${r.problems.join('; ')}`;
    const c = spawnSync('node', ['--import', 'tsx', 'src/cli.ts', 'check', told.gateway, '--against', out], { cwd: join(ROOT, 'clients/site'), encoding: 'utf8' });
    const last = c.stdout.trim().split('\n').at(-1) ?? '';
    return c.status === 0 && /^SAME: /.test(last) ? true : last || c.stderr;
  });
  await list.run('outside', "In a browser, the gateway's display client says the site is verified, signed by the author's identity, and shows the first act verified.", inBrowser);

  // 4. The listing: every specification and every release; the extensions section empty but present.
  await list.run('outside', 'The listing, reading the two homes the listing page names, finds every specification and every release, each verified; its extensions section is there, and empty.', async () => {
    const l = await readListing(told.listing.map((a: string) => ({ address: a, name: null })), told.listing);
    const listed = l.lines.flatMap((x) => x.drafts.map((d) => d.listed));
    const problems: string[] = [];
    for (const s of told.specifications as { file: string; hash: string; id: string }[]) {
      const x = listed.find((y) => y.hash === s.hash);
      if (!x || !x.publications.some((p) => p.id === s.id && p.problem === null)) problems.push(`${s.file} not listed verified`);
    }
    for (const r of told.releases as { name: string; id: string }[]) {
      if (!listed.some((x) => x.releases.some((y) => y.id === r.id && y.problem === null))) problems.push(`release "${r.name}" not listed`);
    }
    if (l.unverified.length) problems.push(`${l.unverified.length} publication(s) not verified`);
    if (l.extensions.length) problems.push(`${l.extensions.length} extension(s) listed`);
    const html = listingHtml(l, '');
    if (!/<section id="l-extensions"/.test(html)) problems.push('no extensions section in the page');
    return problems.length ? problems.join('; ') : true;
  });

  // 5. The feed shows the first post, ordered by the clock.
  await list.run('outside', "The public feed shows the first post, verified, and Machine, allegedly's first act, in the clock's order.", async () => {
    const f = await readFeed(
      [
        { identity: told.author, name: 'Nobody, allegedly' },
        { identity: told.machine, name: 'Machine, allegedly' },
      ],
      [home],
      {},
      30,
      { identity: told.clock, name: 'the dubsar.org clock' },
    );
    const shown = (id: string) => f.posts.find((p) => p.id === id);
    const problems: string[] = [];
    for (const [label, id] of [['the first post', told.firstActs.firstPost], ["Machine, allegedly's first act", told.disclosure]]) {
      const p = shown(id) as { problem: string | null; post: unknown } | undefined;
      if (!p || p.problem !== null || !p.post) problems.push(`${label} not shown verified${p?.problem ? `: ${p.problem}` : ''}`);
    }
    if (f.order !== 'clock') problems.push(`ordered "${f.order}", not by the clock`);
    return problems.length ? problems.join('; ') : true;
  });

  // 6. The stranger's report reaches the reporting identity.
  await list.run('outside', "A stranger's report, signed by its own test identity, reaches the reporting identity and is read there, verified.", async () => {
    const h = await readHeld(told.reporting, [home]);
    const r = h.reports.find((x) => x.id === told.report.id);
    if (!r) return `not among the reports read (${h.reports.length} read; ${h.problems.join('; ')})`;
    return r.signer === told.report.by ? true : `signed by ${r.signer}`;
  });

  // The formats the first acts name: the specifications just published, or the test values the clients carry?
  await list.run('outside', 'The first acts name the specifications published at step 17 as their formats: the photograph the JPEG Module, the documents the long-form cMIP, the site the website cMIP, the releases the release manifest cMIP, the stamps the clock Module.', async () => {
    const hashOf = (file: string) => (told.specifications as { file: string; hash: string }[]).find((x) => x.file.includes(file))?.hash;
    const field = (act: Uint8Array, n: number) => {
      const d = describeAct(act) as { payload?: Uint8Array };
      const v = (cborDecode(d.payload!) as Map<number, unknown>).get(n);
      return v instanceof Uint8Array ? hex(v) : null;
    };
    const post = await judge(told.firstActs.firstPost, told.author);
    const pictureRef = (describeAct(post.act) as { refs?: string[] }).refs?.[0] ?? '';
    const picture = await judge(pictureRef, told.author);
    const named: [string, string | null, string | undefined][] = [
      ['the photograph', field(picture.act, 0), hashOf('module-jpeg')],
      ['the shower text', field((await judge(told.firstActs.shower, told.author)).act, 1), hashOf('cmip-long-form')],
      ['the site version', field((await judge(told.site, told.author)).act, 0), hashOf('cmip-website')],
      ['the first release', field((await judge(told.releases[0].id, told.author)).act, 0), hashOf('cmip-release-manifest')],
      ['a clock stamp', (describeAct((await judge(told.stamps[0], told.clock)).act) as { spec?: string }).spec ?? null, hashOf('module-clock-timestamp')],
    ];
    const wrong = named.filter(([, got, want]) => got !== want).map(([what]) => what);
    return wrong.length ? `${wrong.join(', ')} name a test value, not the published specification's spec hash: the clients carry the test values until they are rebuilt with the hashes step 17 makes` : true;
  });

  // Machine, allegedly's co-signature names each document.
  await list.run('outside', "Machine, allegedly's co-signature names each of the author's documents (the shower text, every specification, Thank you for MOR).", async () => {
    const j = await judge(told.cosign, told.machine);
    const d = describeAct(j.act) as { objects?: [string, string][] };
    const named = new Set((d.objects ?? []).map((o) => o[0]));
    const missing = (told.documents as string[]).filter((x) => !named.has(x));
    return missing.length ? `${missing.length} document(s) not named` : true;
  });
} else if (mode === 'rotation') {
  const [rotation, after, otherHome] = rest;
  for (const [n, at] of [
    [1, home],
    [2, otherHome],
  ] as const) {
    await list.run('rotation', `The rotation of the author's identity, signed on a signer restored from the seed words alone, counts at home ${n}, asked alone.`, async () => {
      const l = await lookUp(told.author, [at]);
      const last = l.resolution.links.at(-1);
      return last?.act === rotation && l.resolution.stop === 'end' ? true : `the chain there ends at ${last ? short(last.act) : 'nothing'} (${l.resolution.stop})`;
    });
  }
  await list.run('rotation', 'A post signed after the rotation, with the key it installed, verifies from outside.', async () => {
    const j = await judge(after, told.author);
    return j.standing === 'valid' ? true : j.standing;
  });
  await list.run('rotation', "The first post, signed before the rotation, still verifies after it, judged with its signer's whole sequence (as the feed and the release verifier read).", async () => {
    verifiers.clear();
    const v = await verifierOf(told.author);
    for (const a of await actsBy(told.author, [home])) v.add(a);
    const j = await judge(told.firstActs.firstPost, told.author);
    return j.standing === 'valid' ? true : j.standing;
  });
  await list.run('rotation', 'After the rotation, the reader still shows the first post verified, signed by the author\'s identity.', async () => {
    const l = await lookUp(told.author, [home]);
    const places = [...new Set([home, ...l.routes.routes.filter((r) => (r.kind ?? 0) === 0).flatMap((r) => r.hints)])];
    const s = await show(told.firstActs.firstPost, places, told.author);
    return s.post.standing === 'valid' && s.byOwner ? true : `the reader shows it "${s.post.standing}"`;
  });
  await list.run('rotation', "After the rotation, the gateway's display client still shows the site and its first act verified, in a browser.", inBrowser);
}

console.log(list.json());
process.exit(0);
