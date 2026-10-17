// An agent acting under its owner's grant (decided by Nobody, allegedly, 17
// October 2026; film 2), through Edubba's program, against real homes and a
// relay on local ports and a fake of Anthropic's API:
//
// - the owner's grant read back in plain words, then signed (public, the
//   owner's own key); the agent asked, and its acceptance its own signature;
// - under a nudge, a post in the owner's name, signed with the grant key,
//   valid under Text (rule 14's second case, F343), backed by Agreements,
//   shown on whose authority;
// - the grant's limits (the grant limits cMIP, F345): a promise to pay above
//   the cap refused before signing, and judged not backed when signed
//   anyway; the expiry judged against a timestamp clock's stamps (within,
//   past, unknown before any stamp);
// - revoked: refused here, and an act signed after it judged not backed.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MIRS, SPECS, Verifier, describeAct, moneySpecs } from '../../genesis/src/core.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { obligationPayload } from '../../repo/src/agreements.ts';
import { answering, fakeApi, type Fake } from '../../assess/test/fake-api.ts';
import { readAct } from '../../connector/src/read.ts';
import { authorityOf, signUnderGrant } from '../../grants/src/grant.ts';
import { STAMP_TYPE, TIMESTAMP_SPEC, encodeStamp } from '../../../modules/timestamp/src/stamp.ts';
import { serve, type Running } from '../src/server.ts';
import { Client, newKey, type Done } from '../src/page/api.ts';

const KEY = 'sk-ant-api03-FAKE-agents-grant-never-real-QRST';
const REGTEST = (moneySpecs() as { units: { regtest: string } }).units.regtest;

let homes: Relay[];
let relay: Relay;
let api: Fake;
let app: Running;
let c: Client;
let NA: string;
let MA: string;
let creditor: TestIdentity;
let clock: TestIdentity;
let grant: string;

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  api = await fakeApi();
  const top = mkdtempSync(join(tmpdir(), 'edubba-grant-'));
  const home = join(top, 'home');
  mkdirSync(home);
  app = await serve({ dir: join(top, 'edubba'), port: 0, drafts: join(top, 'drafts'), machineEvery: 0, machine: { reach: { baseURL: api.url, maxRetries: 0 }, env: { ANTHROPIC_API_KEY: KEY }, home, today: () => '2026-10-16' } });
  c = await Client.open(await newKey(), app.base);
  await c.ask('pair', { code: app.access.newCode(), label: 'test' });
  await c.ask('settings', { homes: homes.map((h) => h.base), relays: [relay.base], via: [], drafts: '' });
  for (const name of ['Nobody, allegedly', 'Machine, allegedly']) await c.ask<Done>('identity', { name, linked: false });
  const s = await c.ask<any>('state');
  [NA, MA] = ['Nobody, allegedly', 'Machine, allegedly'].map((n) => s.identities.find((i: any) => i.name === n)!.id);
  const shown = await c.ask<{ digest: string }>('machine terms', { agent: MA, owner: NA });
  await c.ask<Done>('machine publish', { agent: MA, owner: NA, digest: shown.digest });
  creditor = TestIdentity.create({ homes: app.store.settings().homes, via: {} });
  await creditor.publishGenesis();
  clock = TestIdentity.create({ homes: app.store.settings().homes, via: {} });
  await clock.publishGenesis();
});

after(async () => {
  await app?.close();
  await api?.stop();
  for (const h of [...homes, relay]) await h.stop();
});

const hints = () => app.desk.places.hints;
const stamp = async (acts: string[], time: number) => {
  await clock.publish(TIMESTAMP_SPEC, STAMP_TYPE, encodeStamp({ time, acts }), { public: true, relays: [relay.base] });
};
const owe = (value: number) => ({ spec: MIRS.money, type: 1, payload: obligationPayload({ debtor: NA, creditor: creditor.id, unit: REGTEST, value, pointer: creditor.id }), public: true });

test('the owner’s grant, read back in plain words, then signed; the agent asked, and its acceptance its own signature', async () => {
  const until = Math.floor(Date.now() / 1000) + 3600;
  const shown = await c.ask<any>('agent grant preview', { agent: MA, kinds: ['posts', 'money'], cap: 5000, clock: clock.id, until });
  const words = shown.lines.join('\n');
  assert.match(words, /Nobody, allegedly .* grants Machine, allegedly .* authority to sign in Nobody, allegedly .*’s name, with a key of Machine, allegedly .*’s own/);
  assert.match(words, /What it may sign: posts and messages \(Text acts\); money acts/);
  assert.match(words, /at most 5000 regtest satoshis/);
  assert.match(words, /Until: .* UTC, by the timestamp clock/);
  assert.match(shown.say, /every act it signs that way names the grant/);
  await assert.rejects(c.ask('agent grant publish', { agent: MA, digest: '00'.repeat(32) }), /not a grant shown/);
  api.reply = answering({ accept: true, why: 'I will act within it.' });
  const d = await c.ask<any>('agent grant publish', { agent: MA, digest: shown.digest });
  assert.equal(d.accepted, true, JSON.stringify(d.lines));
  grant = d.grant;
  assert.match(JSON.stringify(api.seen.at(-1)!.body.messages), /Do you accept it\?/);
  // The grant: public, signed by the owner's own key, an Agreements grant naming the agent.
  const g = describeAct((await relayAt(relay.base).getAct(grant))!) as { signer: string; public: boolean; spec: string; type: number };
  assert.deepEqual([g.signer, g.public, g.spec, g.type], [NA, true, MIRS.agreements, 9]);
  // The acceptance: the agent's signature act naming it.
  const acc = describeAct((await relayAt(relay.base).getAct(d.acts[1]))!) as { signer: string; type: number; objects: [string, string][] };
  assert.deepEqual([acc.signer, acc.type, acc.objects], [MA, 1, [[grant, grant]]]);
  // The grant key's secret is kept here, owner-only, never in the grant.
  const kept = JSON.parse(readFileSync(join(app.store.dir, 'agents', `${MA}.grants.json`), 'utf8'));
  assert.equal(kept[0].grant, grant);
  assert.ok(!JSON.stringify(g).includes(kept[0].secret));
});

test('under a nudge, a post in its owner’s name: signed with the grant key, valid under Text (F343), backed, shown on whose authority', async () => {
  api.reply = answering({ actions: [{ kind: 'post in your owner’s name', answers: null, text: 'Posted for Nobody, allegedly, under the grant.' }], notClaimed: [], memory: { add: [], retire: [] } });
  const d = await c.ask<Done>('machine nudge', { agent: MA, count: 1, context: 'Post something for me.' });
  assert.match(JSON.stringify(api.seen.at(-1)!.body.messages), /<your-grant>/);
  const act = d.acts[1];
  assert.ok(act, JSON.stringify(d.lines));
  const bytes = (await relayAt(relay.base).getAct(act))!;
  const x = describeAct(bytes) as { signer: string; binding: string; objects: [string, string][]; public: boolean };
  assert.deepEqual([x.signer, x.binding, x.objects, x.public], [NA, grant, [[NA, grant]], true], 'the owner’s own act, bound to the grant, naming it');
  assert.ok(d.lines.some((l) => /Signed by Machine, allegedly .* in Nobody, allegedly .*’s name, under the grant .*: whether it backs it is unknown/.test(l.text)), JSON.stringify(d.lines));
  // Identity: scoped (a grant key's act); its standing Agreements' to judge.
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  await lookUp(NA, hints(), {}, v);
  v.add((await relayAt(relay.base).getAct(grant))!);
  v.add(bytes);
  assert.equal(v.status(act), 'scoped');
  // Any reader: on whose authority. Its expiry is unknown until the clock stamps it.
  const before = await authorityOf(bytes, hints());
  assert.equal(before!.backing, 'unknown');
  assert.match(before!.reason ?? '', /limits/);
  await stamp([act], Math.floor(Date.now() / 1000));
  const a = await authorityOf(bytes, hints());
  assert.equal(a!.backing, 'backed', a!.reason ?? '');
  assert.deepEqual([a!.grantor, a!.grantee], [NA, MA]);
  // The connector's reading says the same: signed with a grant key.
  const told = await readAct(act, hints());
  assert.equal(told.standing, 'scoped');
  assert.equal(told.title, 'An act signed under a grant');
  assert.equal(told.counts, true);
  assert.ok(told.quoted.some((q) => q.text === 'Posted for Nobody, allegedly, under the grant.'));
  // The agent's details list the grant and the act under it.
  const list = await c.ask<any[]>('agent grants', { agent: MA });
  assert.equal(list[0].acts[0].act, act);
  assert.equal(list[0].acts[0].backing, 'backed');
});

test('the cap per act: a promise above it refused before signing; one signed anyway judged not backed; one within it backed', async () => {
  await assert.rejects(app.agents.grants.sign(MA, grant, owe(9000)), /9000 is above the grant’s cap of 5000 per act/);
  const within = await app.agents.grants.sign(MA, grant, owe(4000));
  await stamp([within.act], Math.floor(Date.now() / 1000));
  const w = await authorityOf((await relayAt(relay.base).getAct(within.act))!, hints());
  assert.equal(w!.backing, 'backed', w!.reason ?? '');
  // Signed past this app's refusal (another app, careless): the limits judged here, the core told.
  const held = app.agents.grants.held(MA).find((h) => h.grant === grant)!;
  const over = signUnderGrant(held, owe(9000));
  app.store.saveGrants(MA, app.agents.grants.held(MA).map((h) => (h.grant === grant ? held : h)));
  await relayAt(relay.base).putAct(over.act);
  await stamp([over.id], Math.floor(Date.now() / 1000));
  const o = await authorityOf(over.act, hints());
  assert.equal(o!.backing, 'not-backed');
  assert.match(o!.reason ?? '', /outside the limits/);
  assert.match(JSON.stringify(o!.limits), /above the cap of 5000 per act/);
});

test('the expiry: an act the named clock stamped past it is not backed; another clock’s stamp places nothing', async () => {
  const held = app.agents.grants.held(MA).find((h) => h.grant === grant)!;
  const late = signUnderGrant(held, owe(10));
  app.store.saveGrants(MA, app.agents.grants.held(MA).map((h) => (h.grant === grant ? held : h)));
  await relayAt(relay.base).putAct(late.act);
  // A stamp by another identity places nothing: still unknown.
  const other = TestIdentity.create({ homes: app.store.settings().homes, via: {} });
  await other.publishGenesis();
  await other.publish(TIMESTAMP_SPEC, STAMP_TYPE, encodeStamp({ time: Math.floor(Date.now() / 1000), acts: [late.id] }), { public: true, relays: [relay.base] });
  assert.equal((await authorityOf(late.act, hints()))!.backing, 'unknown');
  // The named clock stamps it two hours later than now: past the expiry.
  await stamp([late.id], Math.floor(Date.now() / 1000) + 7200);
  const a = await authorityOf(late.act, hints());
  assert.equal(a!.backing, 'not-backed');
  assert.match(JSON.stringify(a!.limits), /past the expiry/);
});

test('revoked: refused here; an act signed after the revocation is not backed (the tie rule)', async () => {
  const d = await c.ask<Done>('agent grant revoke', { agent: MA, grant });
  assert.match(d.lines[0].text, /backs nothing after it/);
  await assert.rejects(app.agents.grants.sign(MA, grant, owe(10)), /revoked/);
  const held = app.agents.grants.held(MA).find((h) => h.grant === grant)!;
  const after = signUnderGrant(held, owe(10));
  await relayAt(relay.base).putAct(after.act);
  await stamp([after.id], Math.floor(Date.now() / 1000));
  const a = await authorityOf(after.act, hints());
  assert.equal(a!.backing, 'not-backed');
  assert.match(a!.reason ?? '', /revocation/);
});
