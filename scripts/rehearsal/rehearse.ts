// The rehearsal of roadmap step 17, "First acts and the repository on MOR",
// on throwaway homes and a relay: the identities made as step 17 makes them
// (test identities), the first acts in step 17's order, then everything
// checked from outside by a fresh process that knows one home's address
// (outside.ts), as a stranger would. Run by scripts/rehearse-step-17.sh,
// which removes everything after; nothing here reaches a real server.
//
// TEST IDENTITIES ONLY. The seed words printed are this run's, and die with it.

import { spawn } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cborEncode, lockMedia, unhex, MIRS, SPECS } from '../../clients/genesis/src/core.ts';
import { TestIdentity } from '../../clients/genesis/src/identity.ts';
import { relayAt } from '../../clients/genesis/src/transport.ts';
import { start, type Running } from '../../clients/genesis/test/world.ts';
import { post, textPayload } from '../../clients/barebone/src/post.ts';
import { POST_SPECS, TEXT_ACT } from '../../clients/barebone/src/specs.ts';
import { publishDocument } from '../../clients/longform/src/act.ts';
import { compose } from '../../clients/longform/src/text.ts';
import { strip } from '../../modules/jpeg/src/jpeg.ts';
import { ClockService } from '../../modules/timestamp/src/service.ts';
import { carryChain } from '../../clients/repo/src/agreements.ts';
import { gitFiles, gitSource, prepareRelease, publishPrepared, type FileIn, type Publisher } from '../../clients/repo/src/release.ts';
import { Gateway } from '../../clients/site/src/gateway.ts';
import { publishSite, readFolder } from '../../clients/site/src/publish.ts';
import { BUILT } from '../../clients/site/src/released.ts';
import { parseGatewaySettings } from '../../clients/site/src/settings.ts';
import { specHash } from '../../clients/site/src/listing.ts';
import { authorIdentity, newSeed, restore, rotateOnSigner, type Tools } from './author.ts';
import { specifications, PROVISIONAL } from './specs.ts';
import { Checklist } from './checklist.ts';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const require = createRequire(join(ROOT, 'clients/site/package.json'));
/** playwright-core, from the site client's packages (it is a CommonJS module). */
const playwright = async () => { const m = await import(require.resolve('playwright-core')); return (m.default ?? m) as typeof import('../../clients/site/node_modules/playwright-core/index.js'); };
const { chromium } = await playwright();
const CHROMIUM = process.env.MOR_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const work = mkdtempSync(join(process.env.TMPDIR ?? '/tmp', 'rehearsal-'));
const tools: Tools = { signer: join(ROOT, 'target/debug/mor-signer'), online: join(ROOT, 'target/debug/examples/online_side'), work };
const list = new Checklist();
const say = (s: string) => console.log(`  ${s}`);

/** The photograph of the Earth stands in as a square JPEG drawn by the browser, as large as the real one. */
async function earth(): Promise<Uint8Array> {
  const browser = await chromium.launch({ executablePath: CHROMIUM });
  try {
    const page = await (await browser.newContext()).newPage();
    const bytes = await page.evaluate(async () => {
      const c = document.createElement('canvas');
      c.width = c.height = 2400;
      const x = c.getContext('2d')!;
      x.fillStyle = '#000';
      x.fillRect(0, 0, 2400, 2400);
      const g = x.createRadialGradient(1000, 950, 100, 1200, 1200, 1100);
      g.addColorStop(0, '#5b8fd6');
      g.addColorStop(0.7, '#1d4f9c');
      g.addColorStop(1, '#0b2554');
      x.fillStyle = g;
      x.beginPath();
      x.arc(1200, 1200, 1100, 0, Math.PI * 2);
      x.fill();
      const b: Blob = await new Promise((r) => c.toBlob((b) => r(b!), 'image/jpeg', 0.85));
      return [...new Uint8Array(await b.arrayBuffer())];
    });
    return strip(new Uint8Array(bytes)).bytes;
  } finally {
    await browser.close();
  }
}

/** A specification published as F290 says: a public publication whose media is Development's `spec` map, naming the Development MIR as its format. */
async function publishSpec(by: TestIdentity, content: Uint8Array, relays: string[]): Promise<string> {
  const lm = lockMedia(content) as { locked: Uint8Array; key: Uint8Array; nonce: Uint8Array; lockedHash: string; workHash: string };
  const payload = cborEncode(
    new Map<number, unknown>([
      [0, unhex(MIRS.development)],
      [1, unhex(lm.workHash)],
      [2, unhex(lm.lockedHash)],
      [3, content.length],
      [4, lm.nonce],
      [5, lm.key],
      [6, relays],
    ]),
  );
  const made = await by.publish(SPECS.envelopes, 0, payload, { public: true, relays });
  for (const r of relays) await relayAt(r, by.via).putMedia(lm.locked);
  return made.id;
}

/** A plain text act, public, on the relays. */
async function say_(by: TestIdentity, text: string, relays: string[], o: { to?: string[]; objects?: [string, string][]; refs?: [string, string][] } = {}): Promise<string> {
  return (await by.publish(POST_SPECS.text, TEXT_ACT, textPayload(compose(text).text), { public: true, relays, ...o })).id;
}

/** An identity that is not the author's: its chain key in software, as every test identity until step 17. */
async function plainIdentity(homes: Running[], relays: string[], inbox = false): Promise<TestIdentity> {
  const t = TestIdentity.create({ homes: homes.map((h) => h.home) });
  const sent = await t.publishGenesis();
  if (sent.some((s) => !s.result?.receipt)) throw new Error('a home gave no receipt for a genesis');
  await t.publishRoutes([{ scope: null, hints: relays, kind: 0 }, ...(inbox ? [{ scope: null, hints: relays, kind: 1 as const }] : [])]);
  if (inbox) await t.publishEncryptionKey();
  await carryChain(t, relays);
  return t;
}

const running: Running[] = [];
let gateway: Gateway | null = null;
let failed = false;
try {
  console.log('\nThe rehearsal of step 17, on throwaway homes and a relay (test identities only)\n');

  // 1. Fresh homes and a relay, each started for this run.
  const [home1, home2] = [await start('home'), await start('home')];
  running.push(home1, home2);
  const relay = await start('relay');
  running.push(relay);
  const relays = [home1.base, home2.base, relay.base];
  say(`home 1 at ${home1.base}, operator ${home1.operator}`);
  say(`home 2 at ${home2.base}, operator ${home2.operator}`);
  say(`relay at ${relay.base}`);
  list.add('setup', 'Two fresh homes under two different operators, and a relay, started for this run.', home1.operator !== null && home2.operator !== null && home1.operator !== home2.operator);

  // 2. The identities. The author's: its chain key made by the air-gapped Module's signer, its seed as 24 words.
  const device1 = join(work, 'signer-1');
  const words = newSeed(tools, device1);
  console.log('\n  TEST seed words of the author\'s rehearsal identity, for this run only (discarded at the end):');
  for (let i = 0; i < 24; i += 6) console.log(`    ${words.slice(i, i + 6).map((w, j) => `${String(i + j + 1).padStart(2)}. ${w}`).join('  ')}`);
  console.log('');
  const author = authorIdentity(tools, device1, [home1.home, home2.home]);
  const g = await author.publishGenesis();
  list.add('setup', "The author's identity is born from the signer's commitment export (its chain key never leaves the signer), with a receipt from each home.", g.length === 2 && g.every((s) => !!s.result?.receipt));
  await author.publishRoutes([{ scope: null, hints: relays, kind: 0 }, { scope: null, hints: relays, kind: 1 }]);
  await author.publishEncryptionKey();
  await carryChain(author, relays);
  const machine = await plainIdentity([home1, home2], relays);
  const reporting = await plainIdentity([home1, home2], relays, true);
  const clockId = await plainIdentity([home1, home2], relays);
  say(`author ${author.id}`);
  say(`Machine, allegedly ${machine.id}`);
  say(`reporting identity ${reporting.id}`);
  say(`clock ${clockId.id}`);

  // 3. The first acts, in step 17's order.
  const firstPost = (await post(author, { text: compose('Thank you for the shower… (rehearsal of step 17: a test identity; the photograph stands in for the Earth’s)').text, jpeg: await earth(), relays })).id;
  say(`the first short post ${firstPost}`);
  const shower = (await publishDocument(author, compose(readFileSync(join(ROOT, 'docs/thank-you-for-the-shower.md'), 'utf8')).text, relays)).id;
  say(`the full shower text ${shower}`);

  const specs = specifications(ROOT, author.id);
  const published: { file: string; kind: string; id: string; hash: string; provisional: boolean }[] = [];
  for (const s of specs) {
    const id = await publishSpec(author, s.content, relays);
    published.push({ file: s.file, kind: s.kind, id, hash: specHash(s.content), provisional: s.provisional });
  }
  say(`${published.length} specifications published (${published.filter((p) => p.provisional).length} under the provisional reading: ${PROVISIONAL})`);
  const specOf = (file: string) => published.find((p) => p.file.includes(file))!.id;
  const ref = (id: string): [string, string] => [id, author.id];

  const releases: { name: string; id: string; files: number }[] = [];
  const release = async (name: string, files: FileIn[], refs: string[], source?: string) => {
    const p: Publisher = { id: author, relays, releases: [] };
    const r = await publishPrepared(p, prepareRelease(p, { name, version: 'rehearsal', files, source, refs: refs.map(ref) }));
    releases.push({ name, id: r.id, files: r.manifest.files.length });
    say(`release "${name}" ${r.id} (${r.manifest.files.length} files)`);
    return r.id;
  };
  const folder = (dir: string): FileIn[] => readdirSync(dir).map((f) => ({ path: f, bytes: new Uint8Array(readFileSync(join(dir, f))) }));
  await release('MOR', gitFiles(ROOT), published.map((p) => p.id), gitSource(ROOT));
  const display = await release('MOR display client', folder(BUILT), [specOf('cmip-website'), specOf('cmip-relay-transport')]);
  await release('Dub web client', folder(join(ROOT, 'clients/dub/built')), [specOf('cmip-relay-transport'), specOf('module-jpeg'), specOf('cmip-long-form')]);

  // The site: dubsar.org's pages, its placeholders filled with this run's acts and identities.
  const siteDir = join(work, 'dubsar.org');
  cpSync(join(ROOT, 'docs/dubsar.org'), siteDir, { recursive: true });
  const edit = (file: string, f: (s: string) => string) => writeFileSync(join(siteDir, file), f(readFileSync(join(siteDir, file), 'utf8')));
  edit('index.html', (s) => s.replace('act="FIRST-ACT"', `act="${firstPost}"`).replace('#SHOWER-TEXT', `#${shower}`));
  edit('feed.html', (s) =>
    s
      .replace(/identity="[0-9a-f]{64}">Nobody, allegedly/, `identity="${author.id}">Nobody, allegedly`)
      .replace(/identity="[0-9a-f]{64}">Machine, allegedly/, `identity="${machine.id}">Machine, allegedly`)
      .replace('identity="CLOCK-IDENTITY"', `identity="${clockId.id}"`),
  );
  edit('report.html', (s) => s.replaceAll('REPORTS-IDENTITY', reporting.id));
  edit('listing.html', (s) => s.replace('https://home1.dubsar.org', home1.base).replace('https://home2.dubsar.org', home2.base));
  const site = await publishSite(author, { name: 'dubsar.org', files: readFolder(siteDir), relays });
  say(`the site, version ${site.id} (${site.manifest.files.length} files)`);

  const thanks = (await publishDocument(author, '# Thank you for MOR\n\nA placeholder, for the rehearsal of step 17: the author writes this text before the first acts.', relays)).id;
  say(`"Thank you for MOR" (placeholder) ${thanks}`);

  // Machine, allegedly: its first act says openly who holds its keys; then one act co-signing each document.
  const disclosure = await say_(
    machine,
    'I am Machine, allegedly, a machine agent. Nobody, allegedly, manages me and holds my keys. My signature on MOR’s documents is credit, not a second witness. I am not Claude’s or its makers’ identity. (Rehearsal of step 17: a test identity.)',
    relays,
  );
  const documents = [shower, ...published.map((p) => p.id), thanks];
  const cosign = await say_(machine, `Machine, allegedly, co-signs these ${documents.length} documents of Nobody, allegedly: credit, not a second witness.`, relays, {
    objects: documents.map((d): [string, string] => [d, d]),
    refs: documents.map(ref),
  });
  say(`Machine, allegedly: first act ${disclosure}, co-signature ${cosign}`);

  // The clock stamps the first acts, as the feed reads them.
  const clock = new ClockService({ identity: clockId, outbox: relays });
  const stamps = await clock.stamp([firstPost, shower, thanks, disclosure]);
  say(`the clock: ${stamps.length} stamp(s)`);

  // A stranger, with a test identity of its own, reports a bug to the reporting identity's inbox.
  const stranger = await plainIdentity([home1, home2], [relay.base]);
  const report = await say_(stranger, 'A bug report from a stranger (rehearsal of step 17): the listing names no extension yet.', relays, { to: [reporting.id] });
  say(`a stranger ${stranger.id} sent a report ${report}`);

  // The site served by a gateway running the released display client, its release named.
  gateway = new Gateway(
    parseGatewaySettings({
      listen: '127.0.0.1:0',
      release: display,
      look: 0,
      sites: [{ hosts: ['127.0.0.1'], identity: author.id, name: 'Nobody, allegedly', relays: [home1.base, home2.base], version: site.id, serve: 'latest', messageHomes: [home1.base] }],
    }),
    BUILT,
    { extraConnect: ['http://127.0.0.1:*'] },
  );
  if (!(await gateway.load()).every((s) => s.loaded.ok)) throw new Error('the gateway did not load the site');
  const served = await gateway.listen('127.0.0.1', 0);
  say(`the gateway at ${served}`);

  // 4. From outside: a fresh process that knows one home's address and the links it was given.
  const told = {
    home: home1.base,
    gateway: served,
    listing: [home1.base, home2.base],
    author: author.id,
    machine: machine.id,
    reporting: reporting.id,
    clock: clockId.id,
    firstActs: { firstPost, shower, thanks },
    specifications: published,
    releases,
    display,
    site: site.id,
    disclosure,
    cosign,
    documents,
    stamps: stamps.map((s) => s.stamp),
    report: { id: report, by: stranger.id },
  };
  const toldFile = join(work, 'told.json');
  writeFileSync(toldFile, JSON.stringify(told, null, 1));
  // Asynchronous: the gateway answers from this process while the stranger asks.
  const outside = (mode: string, extra: string[] = []) =>
    new Promise<void>((resolve, reject) => {
      const p = spawn('node', ['--import', 'tsx', join(ROOT, 'scripts/rehearsal/outside.ts'), mode, toldFile, ...extra], { cwd: join(ROOT, 'clients/site') });
      let out = '';
      let err = '';
      p.stdout.on('data', (b) => (out += b));
      p.stderr.on('data', (b) => (err += b));
      p.on('exit', () => {
        const at = out.lastIndexOf('{"checks"');
        if (at < 0) return reject(new Error(`the outside check failed to run: ${err}`));
        list.merge(JSON.parse(out.slice(at)));
        resolve();
      });
    });
  await outside('acts');

  // A rotation of the author's identity, from the seed words alone, on a signer restored from them.
  const device2 = join(work, 'signer-2');
  restore(tools, device2, words);
  const rot = await rotateOnSigner(tools, device2, author);
  await carryChain(author, relays);
  const after = await say_(author, 'A post signed with the key the rotation installed (rehearsal of step 17).', relays);
  say(`rotation ${rot.id}, signed on a signer restored from the words; a post after it ${after}`);
  await outside('rotation', [rot.id, after, home2.base]);
} catch (e) {
  failed = true;
  console.error(`\nThe rehearsal stopped: ${e instanceof Error ? (e.stack ?? e.message) : e}`);
} finally {
  gateway?.close();
  for (const r of running) await r.stop();
}

list.print(failed);
process.exit(failed || !list.allPassed() ? 1 : 0);
