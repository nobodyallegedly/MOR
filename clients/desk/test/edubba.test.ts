// Edubba (F333), through the program's requests, against real homes and a
// relay on local ports and a fake of Anthropic's API (no network, no real
// key):
//
// - MOR Identities' folder read where it is, and its one agent moved into
//   agents/ with its terms and its history; the collective client's folder
//   read where it is.
// - Agents: several, each with its own cap; the shared key or one of its own,
//   shown by its last four characters only, kept owner-only; the prompt box
//   an act, answered at once; a nudge reading its followed feed.
// - The desk's fixes from the Dub report: a private message's locked act at
//   the sender's homes (Identity rule 35); a new identity's encryption key
//   drawn from its signing words (the carry Module, draft 2).
// - Collectives: what you may do, each naming its rule; a post; a picture
//   needing the release area's signatures; the constitution in plain words.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, renameSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { cborEncode, describeAct, hex, unhex } from '../../genesis/src/core.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { leaveInInbox, post as postAs } from '../../barebone/src/post.ts';
import { answering, fakeApi, type Fake } from '../../assess/test/fake-api.ts';
import { encryptionSecret } from '../../../modules/carry/src/carry.ts';
import { NUDGE_SPECS, TEXT_ACT } from '../../nudge/src/specs.ts';
import { serve, type Running } from '../src/server.ts';
import { collectiveDir, defaultDir } from '../src/cli.ts';
import { Client, newKey, type Done } from '../src/page/api.ts';

const KEY = 'sk-ant-api03-FAKE-edubba-shared-never-real-ABCD';
const OWN = 'sk-ant-api03-FAKE-edubba-own-never-real-EFGH';

let homes: Relay[];
let relay: Relay;
let api: Fake;
let dir: string;
let home: string;
let app: Running;
let c: Client;
let NA: string;
let MA: string;

const opts = () => ({
  dir,
  port: 0,
  drafts: join(dir, '..', 'drafts'),
  machineEvery: 0,
  machine: { reach: { baseURL: api.url, maxRetries: 0 }, env: {}, home, today: () => '2026-10-16' },
});

async function open() {
  app = await serve(opts());
  c = await Client.open(await newKey(), app.base);
  await c.ask('pair', { code: app.access.newCode(), label: 'test' });
}

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  api = await fakeApi();
  const top = mkdtempSync(join(tmpdir(), 'edubba-'));
  dir = join(top, 'mor-desk');
  home = join(top, 'home');
  mkdirSync(home);
  await open();
  await c.ask('settings', { homes: homes.map((h) => h.base), relays: [relay.base], via: [], drafts: '' });
  for (const name of ['Nobody, allegedly', 'Machine, allegedly']) await c.ask<Done>('identity', { name, linked: false });
  const s = await c.ask<any>('state');
  [NA, MA] = ['Nobody, allegedly', 'Machine, allegedly'].map((n) => s.identities.find((i: any) => i.name === n)!.id);
});

after(async () => {
  await app?.close();
  await api?.stop();
  for (const h of [...homes, relay]) await h.stop();
});

test('the folders: ~/edubba, or MOR Identities’ ~/mor-desk read where it is; the collective client’s ~/mor-collective read where it is', () => {
  const h = mkdtempSync(join(tmpdir(), 'edubba-home-'));
  assert.equal(defaultDir(h), join(h, 'edubba'));
  assert.equal(collectiveDir(join(h, 'edubba'), h), join(h, 'edubba', 'collective'));
  mkdirSync(join(h, 'mor-desk'));
  mkdirSync(join(h, 'mor-collective'));
  assert.equal(defaultDir(h), join(h, 'mor-desk'));
  assert.equal(collectiveDir(join(h, 'mor-desk'), h), join(h, 'mor-collective'));
  mkdirSync(join(h, 'edubba'));
  assert.equal(defaultDir(h), join(h, 'edubba'), 'once ~/edubba exists, it is the folder');
});

test('a new identity’s encryption key is the one its signing key’s words carry (the carry Module, draft 2)', () => {
  for (const id of [NA, MA]) {
    const f = app.store.identity(id).f;
    assert.equal(f.encryption.length, 1);
    assert.equal(f.encryption[0].secret, hex(encryptionSecret(unhex(f.signingSecret))));
  }
});

test('MOR Identities’ Machine, allegedly is moved into agents/ with its terms and history, the first time Edubba reads the folder', async () => {
  const shown = await c.ask<{ lines: string[]; digest: string }>('machine terms', { agent: MA, owner: NA });
  await c.ask<Done>('machine publish', { agent: MA, owner: NA, digest: shown.digest });
  const terms = app.agents.for(MA).state().terms!.act;
  await app.close();
  // As MOR Identities left it: machine.json, and history lines naming no agent.
  renameSync(join(dir, 'agents', `${MA}.json`), join(dir, 'machine.json'));
  const lines = readFileSync(join(dir, 'history.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  writeFileSync(join(dir, 'history.jsonl'), lines.map((l) => JSON.stringify({ ...l, agent: undefined })).join('\n') + '\n');
  await open();
  assert.ok(!existsSync(join(dir, 'machine.json')));
  assert.ok(existsSync(join(dir, 'agents', `${MA}.json`)));
  const s = await c.ask<any>('state');
  assert.deepEqual(s.agents.map((a: any) => [a.id, a.name]), [[MA, 'Machine, allegedly']]);
  const d = await c.ask<any>('agent', { agent: MA });
  assert.equal(d.terms.act, terms, 'its signed terms carried over');
  assert.ok(d.history.some((h: any) => h.verdict === 'terms published'), 'its history carried over');
  assert.equal(s.machine.agent, MA, 'the operations naming no agent act for it, as before');
});

test('the shared key and an agent’s own: owner-only files, the page told their last four characters only; each agent its own cap', async () => {
  await assert.rejects(c.ask('shared key', { key: 'not a key' }), /does not look like an Anthropic API key/);
  assert.deepEqual(await c.ask('shared key', { key: KEY }), { last4: 'ABCD' });
  const s = await c.ask<any>('state');
  assert.equal(s.sharedKey.last4, 'ABCD');
  assert.ok(!JSON.stringify(s).includes(KEY.slice(0, -4)), 'nothing of the key but its last four characters');
  // A second agent, owned by the same identity, with a key of its own.
  const add = await c.ask<any>('agent add', { name: 'Second agent', owner: NA, key: OWN, own: true });
  assert.ok(add.lines.some((l: any) => /display name “Second agent” is published/.test(l.text)));
  await c.ask('machine publish', { agent: add.agent, owner: NA, digest: add.terms.digest, own: true });
  const list = (await c.ask<any>('state')).agents;
  const second = list.find((a: any) => a.name === 'Second agent');
  assert.deepEqual(second.key, { kind: 'own', found: true, last4: 'EFGH' });
  assert.equal(list.find((a: any) => a.id === MA).key.last4, 'ABCD');
  // Its display name is a naming cMIP act, signed by it, public.
  const named = app.agents.for(second.id).state().named!;
  const act = describeAct((await relayAt(relay.base).getAct(named.act))!) as { signer: string; type: number; public: boolean };
  assert.deepEqual([act.signer, act.type, act.public], [second.id, 4, true]);
  // Its own cap.
  await c.ask('machine cap', { agent: second.id, callsPerDay: 3, maxChars: 500 });
  assert.equal(app.agents.for(second.id).state().callsPerDay, 3);
  assert.equal(app.agents.for(MA).state().callsPerDay, 20);
  // It calls with its own key; prompted, it answers at once.
  api.reply = answering({ text: 'Second agent here.', notClaimed: [] });
  const r = await c.ask<any>('agent prompt', { agent: second.id, text: 'Hello, second.' });
  assert.equal(r.answer, 'Second agent here.');
  assert.equal(api.seen.at(-1)!.headers['x-api-key'], OWN);
  assert.match(api.seen.at(-1)!.body.system[0].text, /You write as "Second agent"/);
  // Back to the shared key.
  await c.ask('agent key', { agent: second.id, own: false });
  await c.ask('agent prompt', { agent: second.id, text: 'Again.' });
  assert.equal(api.seen.at(-1)!.headers['x-api-key'], KEY);
  // The folder holds no key.
  assert.ok(!readFileSync(join(dir, 'agents', `${second.id}.json`), 'utf8').includes('sk-ant'));
});

test('the prompt box: a private message sealed from the owner to the agent, signed and kept, answered at once; with answering off, said so', async () => {
  api.reply = answering({ text: 'Here, at once.', notClaimed: [] });
  const r = await c.ask<any>('agent prompt', { agent: MA, text: 'Are you there?' });
  assert.equal(r.answer, 'Here, at once.');
  const prompt = r.acts[0];
  const rec = app.store.signed(prompt)!;
  assert.ok(rec.sealed, 'sealed');
  const d = describeAct(Uint8Array.from(Buffer.from(rec.bytes, 'base64'))) as { signer: string; public: boolean; to: string[] };
  assert.deepEqual([d.signer, d.public, d.to], [NA, false, [MA]]);
  const conv = (await c.ask<any>('agent', { agent: MA })).conversation;
  assert.deepEqual(conv.slice(-2).map((m: any) => [m.from, m.text]), [['owner', 'Are you there?'], ['agent', 'Here, at once.']]);
  await c.ask('machine on', { agent: MA, on: false });
  const off = await c.ask<any>('agent prompt', { agent: MA, text: 'Still there?' });
  assert.equal(off.answer, null);
  assert.ok(off.lines.some((l: any) => /Answering is off/.test(l.text)));
  await c.ask('machine on', { agent: MA, on: true });
});

test('a private act’s locked copy goes to the sender’s homes too, so its line stays readable (Identity rule 35)', async () => {
  const s = await app.desk.signAndSend(NA, { spec: NUDGE_SPECS.text, type: TEXT_ACT, payload: cborEncode(new Map([[0, 'Private.']])) as Uint8Array, public: false, to: [MA], refs: [] });
  assert.ok(s.sent.some((x) => x.to === 'its homes' && x.accepted && /Identity rule 35/.test(x.answer)));
  for (const h of homes) {
    const held = await relayAt(h.base).getAct(s.id);
    assert.ok(held, 'held at its home');
    assert.equal((describeAct(held!) as { payload?: Uint8Array }).payload, undefined, 'locked: the home cannot read it');
  }
});

test('MOR as seen by this agent: those it follows, kept here; under a nudge, Claude is given its feed, and may answer a post of it', async () => {
  const stranger = TestIdentity.create({ homes: app.store.settings().homes, via: {} });
  await stranger.publishGenesis();
  await stranger.publishRoutes([{ scope: null, hints: [relay.base], kind: 0 }]);
  const p = await postAs(stranger, { text: 'A thought worth an answer.', relays: [relay.base] });
  await c.ask('agent follow', { agent: MA, id: stranger.id, name: 'The stranger' });
  const v = await c.ask<any>('agent view', { agent: MA });
  assert.deepEqual(v.follows, [{ id: stranger.id, name: 'The stranger' }]);
  assert.ok(v.feed.some((x: any) => x.text === 'A thought worth an answer.'));
  api.reply = answering({ actions: [{ kind: 'answer', answers: 1, text: 'An answer to your thought.' }], notClaimed: [] });
  const d = await c.ask<Done>('machine nudge', { agent: MA, count: 1, context: '' });
  assert.match(api.seen.at(-1)!.body.messages[0].content, /a public post by .* in your feed[\s\S]*A thought worth an answer\./);
  const answer = d.acts[1];
  assert.ok(answer, JSON.stringify(d.lines));
  const a = describeAct((await relayAt(relay.base).getAct(answer))!) as { refs: string[]; to: string[]; public: boolean };
  assert.ok(a.public);
  assert.deepEqual(a.to, [stranger.id]);
  assert.ok(a.refs.includes(p.id), 'it names the post it answers');
  await c.ask('agent unfollow', { agent: MA, id: stranger.id });
  assert.deepEqual(app.store.people(MA).follows, []);
  // A stranger's message to it waits in its queue; the second agent's queue stays its own.
  const m = await postAs(stranger, { text: 'For Machine only.', relays: [relay.base], to: [MA] });
  await leaveInInbox(stranger, m.act, [relay.base]);
  await c.ask('machine look', { agent: MA });
  const second = app.agents.ids().find((x) => x !== MA)!;
  assert.ok((await c.ask<any>('agent', { agent: MA })).notified.some((x: any) => x.text === 'For Machine only.'));
  assert.equal((await c.ask<any>('agent', { agent: second })).notified.length, 0);
});

test('collectives: what you may do, each naming its rule; a post; a picture needing the release area; its constitution in plain words', async () => {
  const confirm = async (args: object) => {
    const r = await c.ask<{ plan: string; digest: string; reading: any }>('collective prepare', args);
    return c.ask<Done>('collective confirm', { plan: r.plan, digest: r.digest });
  };
  const ids: string[] = [];
  for (const [name, mine] of [['Me', true], ['Ana', false], ['Bo', false]] as const) ids.push((await confirm({ kind: 'identity', name, mine })).acts[0]);
  await confirm({ kind: 'found', name: 'Tablet house', members: ids, rules: {} });
  const col = (await c.ask<any>('state')).collectives[0];
  assert.equal(col.name, 'Tablet house');
  const p = await c.ask<any>('collective permissions', { collective: col.id });
  const text = p.items[0];
  assert.equal(text.what, 'Post a text for it');
  assert.equal(text.state, 'yes');
  assert.ok(text.lines.some((l: any) => /No area reaches a text .*Agreements rule 60/.test(l.text)));
  assert.ok(text.lines.some((l: any) => /rule 59/.test(l.text) && /You hold it/.test(l.text)));
  const pic = p.items[1];
  assert.equal(pic.state, 'with others');
  assert.ok(pic.lines.some((l: any) => /“Releases” area .*any 2 of .*Agreements rule 60/.test(l.text)));
  assert.ok(pic.lines.some((l: any) => /cannot tell a release from a picture/.test(l.text)));
  assert.equal(p.items[2].state, 'no');

  // A text: read back first, nothing signed by reading; then signed, counting on its own signature.
  const before = app.collectives.store.collective(col.id).id.f.sequence.length;
  const r = await c.ask<any>('collective prepare', { kind: 'post', collective: col.id, text: 'For the house.' });
  assert.equal(r.reading.plain[0].text, 'For the house.');
  assert.equal(app.collectives.store.collective(col.id).id.f.sequence.length, before);
  await assert.rejects(c.ask('collective confirm', { plan: r.plan, digest: '00'.repeat(32) }), /does not match/);
  const done = await c.ask<Done>('collective confirm', { plan: r.plan, digest: r.digest });
  assert.ok(done.lines.some((l) => /The text: counts for the collective, on its own signature/.test(l.text)));
  const posted = describeAct((await relayAt(relay.base).getAct(done.acts[0]))!) as { signer: string; public: boolean; objects: [string, string][] };
  assert.equal(posted.signer, col.id);
  assert.ok(posted.public);
  assert.ok(posted.objects.some(([chain]) => chain === col.id), 'it cites the collective’s latest decision on its chain (rule 58)');

  // A picture: the release area's signatures, by you and a simulated member, said; it counts.
  const jpeg = readFileSync(new URL('../../../modules/jpeg/test/fixtures/phone.jpg', import.meta.url)).toString('base64');
  const rp = await c.ask<any>('collective prepare', { kind: 'post', collective: col.id, text: 'With a picture.', jpeg });
  const words = JSON.stringify(rp.reading);
  assert.match(words, /Taken out before publishing/);
  assert.match(words, /its consent simulated/);
  const dp = await c.ask<Done>('collective confirm', { plan: rp.plan, digest: rp.digest });
  assert.ok(dp.lines.some((l) => /The picture: counts for the collective, its area’s signatures met/.test(l.text)), JSON.stringify(dp.lines));
  const posts = await c.ask<any>('collective posts', { collective: col.id });
  assert.ok(posts.items.some((x: any) => x.text === 'For the house.'));
  assert.ok(posts.items.some((x: any) => x.pictures.length === 1));

  // Its constitution, in plain words: the deal-assessment tool's reading of its agreement in force.
  const k = await c.ask<any>('collective constitution', { collective: col.id });
  assert.equal(k.inForce, true);
  assert.equal(k.kind, 'collective');
  assert.ok(k.sections.some((s: any) => s.heading === 'Areas: who decides which acts'));
});
