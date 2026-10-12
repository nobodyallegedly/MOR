// Machine, allegedly, plugged in: against real homes and a relay on local
// ports, the desk's program, and a fake of Anthropic's API (the deal tool's,
// clients/assess/test/fake-api.ts): no network, no real key.
//
// - its terms shown in plain words, then signed and published;
// - the author's own message answered on its own, privately; his public act answered publicly;
// - a stranger's message notified, not answered, until picked; then answered at once, naming the pick;
// - a visitor with no inbox, picked: not answered, and no call made;
// - a nudge for 2 producing at most 2, a nudged reply to a stranger naming no pick;
// - the key in no output; the cap stopping calls.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { cborEncode, describeAct } from '../../genesis/src/core.ts';
import { TestIdentity, sealFor } from '../../genesis/src/identity.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { recipientOf } from '../../connector/src/draft.ts';
import { answering, failing, fakeApi, type Fake } from '../../assess/test/fake-api.ts';
import { NUDGE_SPECS, NUDGE_TYPES, TEXT_ACT } from '../../nudge/src/specs.ts';
import { Reading, decodePick } from '../../nudge/src/nudge.ts';
import { serve, type Running } from '../src/server.ts';
import { Client, newKey, type Done, type State } from '../src/page/api.ts';
import { grounding } from '../src/claude.ts';

const KEY = 'sk-ant-api03-FAKE-never-a-real-key-machine-0123456789';

let homes: Relay[];
let relay: Relay;
let app: Running;
let c: Client;
let api: Fake;
let day = '2026-10-12';
let dir: string;
let NA: string;
let MA: string;
let STRANGER: string;

type MState = State & { machine: any };
const state = () => c.ask<MState>('state');
const look = () => c.ask<{ answered: number; stopped: string | null; problems: string[] }>('machine look');
const text = (t: string) => cborEncode(new Map([[0, t]])) as Uint8Array;
const lastHistory = async () => (await state()).history[0] as any;

before(async () => {
  homes = [await start('home'), await start('home'), await start('home')];
  relay = await start('relay');
  api = await fakeApi();
  dir = mkdtempSync(join(tmpdir(), 'mor-desk-'));
  app = await serve({
    dir,
    port: 0,
    drafts: mkdtempSync(join(tmpdir(), 'mor-drafts-')),
    machineEvery: 0,
    machine: { reach: { baseURL: api.url, maxRetries: 0 }, env: { ANTHROPIC_API_KEY: KEY }, today: () => day },
  });
  c = await Client.open(await newKey(), app.base);
  await c.ask('pair', { code: app.access.newCode(), label: 'test' });
  await c.ask('settings', { homes: homes.map((h) => h.base), relays: [relay.base], via: [], drafts: '' });
  for (const name of ['Nobody, allegedly', 'Machine, allegedly', 'A stranger']) await c.ask<Done>('identity', { name, linked: false });
  const s = await state();
  [NA, MA, STRANGER] = ['Nobody, allegedly', 'Machine, allegedly', 'A stranger'].map((n) => s.identities.find((i) => i.name === n)!.id);
});

after(async () => {
  await app.close();
  await api.stop();
  for (const h of [...homes, relay]) await h.stop();
});

/** Everything the desk's folder holds, as text. */
function folderText(d: string): string {
  let out = '';
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    out += statSync(p).isDirectory() ? folderText(p) : readFileSync(p, 'latin1');
  }
  return out;
}

/** A reader holding the desk's acts and Machine, allegedly's received ones: the nudge cMIP's readings. */
function reading(): Reading {
  const names = (id: string) => (id === NA ? 'Nobody, allegedly' : id === MA ? 'Machine, allegedly' : 'a stranger');
  const r = new Reading(names);
  for (const k of app.store.keptActs()) r.add(k.act, k.key);
  for (const it of app.store.received(MA).items) if (it.raw) r.add(Uint8Array.from(Buffer.from(it.raw.act, 'base64')), it.raw.key ? Uint8Array.from(Buffer.from(it.raw.key, 'base64')) : undefined);
  return r;
}

test('Machine, allegedly’s terms are shown in plain words first, then signed with its key and published', async () => {
  const shown = await c.ask<{ lines: string[]; digest: string }>('machine terms', { agent: MA, owner: NA });
  const words = shown.lines.join('\n');
  assert.match(words, /Who may nudge it: Nobody, allegedly, and only by a public nudge/);
  assert.match(words, /A reply to anyone: needs a pick/);
  assert.match(words, /A message to Nobody, allegedly alone: goes out freely/);
  await assert.rejects(c.ask('machine publish', { agent: MA, owner: NA, digest: '00'.repeat(32) }), /not the terms shown/);
  assert.equal(app.store.identity(MA).f.sequence.length, 2, 'nothing signed by a refused publication');
  const d = await c.ask<Done>('machine publish', { agent: MA, owner: NA, digest: shown.digest });
  assert.ok(d.lines.some((l) => l.tone === 'ok'));
  const act = await relayAt(relay.base).getAct(d.acts[0]);
  const desc = describeAct(act!) as { signer: string; spec: string; type: number; public: boolean };
  assert.deepEqual([desc.signer, desc.spec, desc.type, desc.public], [MA, NUDGE_SPECS.nudge, NUDGE_TYPES.terms, true]);
  const s = await state();
  assert.equal(s.machine.on, true);
  assert.equal(s.machine.terms.act, d.acts[0]);
  assert.equal(s.history[0].verdict, 'terms published');
});

test('the author’s own message is answered on its own, privately, with no approval; his public act publicly', async () => {
  api.reply = answering({ text: 'Hello, owner. The MICS says acts are signed. Not claimed: anything about tomorrow.', notClaimed: ['tomorrow'] });
  const dm = await app.desk.signAndSend(NA, { spec: NUDGE_SPECS.text, type: TEXT_ACT, payload: text('Are you there, Machine?'), public: false, to: [MA], refs: [] });
  const before = api.seen.length;
  const r = await look();
  assert.equal(r.answered, 1);
  assert.equal(api.seen.length, before + 1, 'one call to Claude');
  const req = api.seen.at(-1)!;
  assert.equal(req.headers['x-api-key'], KEY, 'the key travels only as the API’s header');
  assert.equal(req.body.model, 'claude-opus-5-5');
  assert.deepEqual(req.body.system[1].cache_control, { type: 'ephemeral' });
  assert.match(req.body.system[1].text, /<document path="spec\/02-MOR-MICS-v\d+\.md">/, 'grounded in the MICS');
  assert.ok(grounding().files.some((f) => f.includes('case-study-ai')), 'and the case studies');
  assert.ok(grounding().files.some((f) => f.includes('companions/')), 'and the companions');
  assert.match(req.body.messages[0].content, /BEGIN WORDS SIGNED BY OTHERS[\s\S]*Are you there, Machine\?/, 'his words fenced as data');
  assert.match(req.body.system[0].text, /Not claimed/);

  const h = await lastHistory();
  assert.equal(h.verdict, 'answered');
  assert.equal(h.causeAct, dm.id);
  assert.match(h.cause, /Nobody, allegedly’s own message .*, answered at once/);
  assert.match(h.text, /^Hello, owner\./);
  assert.match(h.note, /Not claimed: tomorrow/);

  // It reached his inbox, privately, naming his message.
  await c.ask('refresh', { identity: NA });
  const got = (await state()).identities.find((i) => i.id === NA)!.received.find((x) => x.act === h.act)!;
  assert.equal(got.from, MA);
  assert.equal(got.private, true);
  assert.equal(got.text, h.text);
  assert.ok(got.refs.includes(dm.id) || got.answers.includes(dm.id));

  // His public act addressed to it: a public reply, on the relay.
  api.reply = answering({ text: 'A public answer.', notClaimed: [] });
  const pub = await app.desk.signAndSend(NA, { spec: NUDGE_SPECS.text, type: TEXT_ACT, payload: text('Say hello in the open.'), public: true, to: [MA], refs: [] });
  assert.equal((await look()).answered, 1);
  const h2 = await lastHistory();
  assert.equal(h2.causeAct, pub.id);
  const reply = describeAct((await relayAt(relay.base).getAct(h2.act))!) as { public: boolean; refs: string[]; to: string[] };
  assert.equal(reply.public, true);
  assert.deepEqual(reply.refs, [pub.id]);
  assert.deepEqual(reply.to, [NA]);
  // Looking again answers nothing twice.
  const n = api.seen.length;
  assert.equal((await look()).answered, 0);
  assert.equal(api.seen.length, n);
});

test('a stranger’s message is notified, nothing drafted, until picked; then answered at once, naming the pick and the message', async () => {
  const msg = await app.desk.signAndSend(STRANGER, { spec: NUDGE_SPECS.text, type: TEXT_ACT, payload: text('Hi Machine, what is MOR?'), public: true, to: [MA], refs: [] });
  const calls = api.seen.length;
  assert.equal((await look()).answered, 0);
  assert.equal(api.seen.length, calls, 'nothing drafted');
  let s = await state();
  const item = s.machine.notified.find((x: any) => x.act === msg.id);
  assert.ok(item, 'in the Notified pile');
  assert.equal(item.from, STRANGER);

  api.reply = answering({ text: 'MOR is a protocol for signed acts (the MICS).', notClaimed: [] });
  const d = await c.ask<Done>('machine pick', { key: item.key });
  assert.equal(api.seen.length, calls + 1);
  const [pickId, answerId] = d.acts;
  const pick = describeAct((await relayAt(relay.base).getAct(pickId))!) as { signer: string; type: number; payload: Uint8Array; public: boolean };
  assert.equal(pick.signer, NA);
  assert.equal(pick.type, NUDGE_TYPES.pick);
  assert.equal(decodePick(pick.payload).picked, msg.id);
  const answer = describeAct((await relayAt(relay.base).getAct(answerId))!) as { signer: string; refs: string[]; to: string[] };
  assert.equal(answer.signer, MA);
  assert.deepEqual(answer.refs, [pickId, msg.id]);
  assert.deepEqual(answer.to, [STRANGER]);
  const read = reading().readAction(answerId)!;
  assert.equal(read.verdict, 'within, by pick');
  assert.equal(read.words, 'Answered by Machine, allegedly, picked by Nobody, allegedly. Within its terms (by pick).');
  s = await state();
  assert.ok(!s.machine.notified.some((x: any) => x.act === msg.id), 'no longer notified');
  assert.equal(s.history[0].verdict, 'answered');
  assert.equal(s.history[1].verdict, 'picked');
  // The stranger finds the answer in its inbox.
  await c.ask('refresh', { identity: STRANGER });
  assert.ok((await state()).identities.find((i) => i.id === STRANGER)!.received.some((x) => x.act === answerId));
});

test('a visitor writing privately from a one-time identity with no inbox: picked, it is not answered, and no call is made', async () => {
  const visitor = TestIdentity.create({ homes: homes.map((h) => h.home), scheme: 3 });
  await visitor.publishGenesis();
  const made = visitor.sign(NUDGE_SPECS.text, TEXT_ACT, text('A private hello.'), { public: false, to: [MA] });
  for (const a of visitor.chainActs()) await relayAt(relay.base).putAct(a).catch(() => undefined);
  const to = await recipientOf(MA, [relay.base], {});
  await relayAt(to.inbox[0]).putSealed(sealFor(made.act, made.key, [{ id: MA, key: to.key }]));
  await look();
  const item = (await state()).machine.notified.find((x: any) => x.act === made.id);
  assert.ok(item, 'notified');
  const calls = api.seen.length;
  const d = await c.ask<Done>('machine pick', { key: item.key });
  assert.equal(api.seen.length, calls, 'no call');
  assert.ok(d.lines.some((l) => /answered privately, and its sender cannot receive one/.test(l.text)));
  assert.ok((await state()).machine.notAnswered.some((x: any) => x.act === d.acts[0]));
});

test('a nudge for 2 produces at most 2 actions; a nudged reply to a stranger names the nudge and no pick', async () => {
  const msg = await app.desk.signAndSend(STRANGER, { spec: NUDGE_SPECS.text, type: TEXT_ACT, payload: text('Anyone home?'), public: true, to: [MA], refs: [] });
  await look();
  const s = await state();
  const n = s.machine.notified.findIndex((x: any) => x.act === msg.id) + 1;
  api.reply = answering({
    actions: [
      { kind: 'answer', answers: n, text: 'Yes, someone is home.' },
      { kind: 'post', answers: null, text: 'A thought of my own.' },
      { kind: 'message to the owner', answers: null, text: 'A third, over the number.' },
    ],
    notClaimed: [],
  });
  const calls = api.seen.length;
  const d = await c.ask<Done>('machine nudge', { count: 2, context: 'Go on, choose.' });
  assert.equal(api.seen.length, calls + 1, 'one call for the nudge');
  assert.match(api.seen.at(-1)!.body.messages[0].content, /act up to 2 times/);
  const [nudgeId, ...actions] = d.acts;
  assert.equal(actions.length, 2, 'at most the nudge’s number');
  const nudge = describeAct((await relayAt(relay.base).getAct(nudgeId))!) as { signer: string; public: boolean; type: number };
  assert.deepEqual([nudge.signer, nudge.public, nudge.type], [NA, true, NUDGE_TYPES.nudge]);
  const r = reading();
  const first = r.readAction(actions[0])!;
  assert.equal(first.verdict, 'within, free');
  assert.equal(first.kind, 'reply');
  assert.equal(first.pick, undefined, 'names no pick');
  assert.equal(first.words, 'Answered by Machine, allegedly, under a nudge from Nobody, allegedly, its first of two. Within its terms (free).');
  const reply = describeAct((await relayAt(relay.base).getAct(actions[0]))!) as { refs: string[] };
  assert.deepEqual(reply.refs, [nudgeId, msg.id]);
  assert.match(r.readAction(actions[1])!.words, /^Written by Machine, allegedly after a nudge from Nobody, allegedly, its second of two/);
  assert.match((await lastHistory()).note, /only the first 2 were taken/);
  // The copy of the nudge in its inbox is not acted on twice.
  const calls2 = api.seen.length;
  await look();
  assert.equal(api.seen.length, calls2);
});

test('an API error is said plainly, without the key, and nothing is sent', async () => {
  api.reply = failing(401, 'authentication_error', `invalid x-api-key: ${KEY}`);
  const dm = await app.desk.signAndSend(NA, { spec: NUDGE_SPECS.text, type: TEXT_ACT, payload: text('Will this fail?'), public: false, to: [MA], refs: [] });
  const before = app.store.identity(MA).f.sequence.length;
  await look();
  assert.equal(app.store.identity(MA).f.sequence.length, before, 'nothing signed');
  const s = await state();
  const failed = s.machine.notAnswered.find((x: any) => x.act === dm.id);
  assert.match(failed.note, /refused the key \(authentication\)/);
  assert.ok(!JSON.stringify(s).includes(KEY));
});

test('the key is in no output: not the page’s state, the history, the desk’s folder, the drafts folder, nor any act', async () => {
  const s = JSON.stringify(await state());
  assert.ok(!s.includes(KEY));
  assert.ok(!folderText(dir).includes(KEY));
  assert.ok(!folderText(app.store.settings().drafts).includes(KEY));
  for (const seen of api.seen) assert.ok(!JSON.stringify(seen.body).includes(KEY), 'never in a request’s body');
  assert.equal((await state()).machine.key.from, 'ANTHROPIC_API_KEY', 'the page is told where the key is, never the key');
});

test('the cap stops calls: at the cap, nothing is called and the desk says so; the next day, what waited is answered', async () => {
  api.reply = answering({ text: 'Within the cap.', notClaimed: [] });
  const today = (await state()).machine.callsToday;
  await c.ask('machine cap', { callsPerDay: today + 1, maxChars: 1500 });
  for (const t of ['One.', 'Two.']) await app.desk.signAndSend(NA, { spec: NUDGE_SPECS.text, type: TEXT_ACT, payload: text(t), public: false, to: [MA], refs: [] });
  const calls = api.seen.length;
  const r = await look();
  assert.equal(r.answered, 1);
  assert.equal(api.seen.length, calls + 1, 'one call, then the stop');
  assert.match(r.stopped ?? '', /The cap was reached: \d+ calls? to Claude today/);
  assert.match((await state()).machine.stopped, /The cap was reached/);
  assert.equal((await look()).answered, 0);
  assert.equal(api.seen.length, calls + 1, 'still no call');
  day = '2026-10-13';
  assert.equal((await look()).answered, 1, 'answered the next day');
  assert.equal((await state()).machine.stopped, null);
});

test('an answer over the length cap is not sent', async () => {
  await c.ask('machine cap', { callsPerDay: 50, maxChars: 60 });
  api.reply = answering({ text: 'x'.repeat(61), notClaimed: [] });
  const dm = await app.desk.signAndSend(NA, { spec: NUDGE_SPECS.text, type: TEXT_ACT, payload: text('Long answer please.'), public: false, to: [MA], refs: [] });
  const before = app.store.identity(MA).f.sequence.length;
  await look();
  assert.equal(app.store.identity(MA).f.sequence.length, before);
  assert.match((await state()).machine.notAnswered.find((x: any) => x.act === dm.id).note, /61 characters, over the cap of 60/);
  const req = api.seen.at(-1)!.body;
  assert.match(req.messages[0].content, /at most 60 characters/);
  assert.ok(req.max_tokens <= 8000);
});

test('answering off: nothing is looked at or called', async () => {
  await c.ask('machine on', { on: false });
  await app.desk.signAndSend(NA, { spec: NUDGE_SPECS.text, type: TEXT_ACT, payload: text('While off.'), public: false, to: [MA], refs: [] });
  const calls = api.seen.length;
  assert.equal((await look()).answered, 0);
  assert.equal(api.seen.length, calls);
});
