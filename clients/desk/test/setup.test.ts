// The Identities tab as an identity setup page (F333), and the small
// session's other Edubba changes (H14, H15, H16), through the program's
// requests, against real homes and a relay on local ports:
//
// - an identity brought by its ID and its signing key's words (H15; the
//   carry Module, draft 2, as Dub does): wrong words and IDs refused, nothing
//   signed by bringing it, its encryption key carried;
// - its record in plain words: homes, routes, keys, display names, and every
//   line of its acts with the latest act, position and summary;
// - relying on an act: read back in plain words, signed only once RELY is
//   typed (the genesis client's witness);
// - releases under one's own name moved to Ummia (F339; H16's checks run in
//   clients/ummia/test/releases.test.ts): the operations gone, the card
//   saying where;
// - "What you may do for it" folded and remembered per collective (H14);
// - a collective brought by its ID, one of your identities among its
//   members (H15).
//
// TEST IDENTITIES ONLY.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describeAct, hex, unhex, workHash } from '../../genesis/src/core.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { leaveInInbox, post as postAs } from '../../barebone/src/post.ts';
import { encryptionSecret, groupId, toWords } from '../../../modules/carry/src/carry.ts';
import { verifyRelease } from '../../repo/src/release.ts';
import { serve, type Running } from '../src/server.ts';
import { Client, newKey, type Done } from '../src/page/api.ts';
import { releaseCard } from '../src/page/view.ts';

let homes: Relay[];
let relay: Relay;
const apps: Running[] = [];

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
});

after(async () => {
  for (const a of apps) await a.close();
  for (const h of [...homes, relay]) await h.stop();
});

/** A fresh Edubba with the test homes and relay in its settings, and a paired client. */
async function edubba(): Promise<{ app: Running; c: Client }> {
  const dir = join(mkdtempSync(join(tmpdir(), 'edubba-setup-')), 'edubba');
  const app = await serve({ dir, port: 0, machineEvery: 0, drafts: join(dir, '..', 'drafts') });
  apps.push(app);
  const c = await Client.open(await newKey(), app.base);
  await c.ask('pair', { code: app.access.newCode(), label: 'test' });
  await c.ask('settings', { homes: homes.map((h) => h.base), relays: [relay.base], via: [], drafts: '' });
  return { app, c };
}

/** An identity made elsewhere, as Dub makes one: an inbox, and the encryption key its signing key's words carry. */
async function elsewhere(): Promise<TestIdentity> {
  const g = TestIdentity.create({ homes: [homes[0].home] });
  await g.publishGenesis();
  await g.publishRoutes([
    { scope: null, hints: [relay.base], kind: 0 },
    { scope: null, hints: [relay.base], kind: 1 },
  ]);
  await g.publishEncryptionKey(encryptionSecret(unhex(g.f.signingSecret)));
  for (const act of g.chainActs()) await relayAt(relay.base).putAct(act);
  return g;
}

const refused = async (p: Promise<unknown>, words: RegExp) => {
  await assert.rejects(p, (e: Error) => {
    assert.match(e.message, words);
    return true;
  });
};

const actsBy = async (signer: string) => (await relayAt(relay.base).feed({ signer })).items.length;

test('H15: an identity brought by its ID and its signing key’s words; nothing signed by bringing it', async () => {
  const { app, c } = await edubba();
  const g = await elsewhere();
  const words = toWords(unhex(g.f.signingSecret)).join(' ');
  const other = toWords(crypto.getRandomValues(new Uint8Array(32))).join(' ');
  await refused(c.ask('bring', { name: 'Ada', id: g.id, words: other, address: homes[0].base }), /do not give this identity’s current signing key.*Nothing was kept/);
  await refused(c.ask('bring', { name: 'Ada', id: g.id, words: 'one two three', address: homes[0].base }), /Nothing was kept/);
  await refused(c.ask('bring', { name: 'Ada', id: 'abc', words, address: homes[0].base }), /Nothing was kept/);
  await refused(c.ask('bring', { name: '', id: g.id, words, address: homes[0].base }), /Give it a name/);
  assert.equal(app.store.holds(g.id), false);
  const before = await actsBy(g.id);
  const d = await c.ask<Done>('bring', { name: 'Ada', id: groupId(g.id), words, address: homes[0].base, linked: false });
  assert.equal(d.acts[0], g.id);
  assert.ok(d.lines.some((l) => /current signing key matches the words/.test(l.text)));
  assert.ok(d.lines.some((l) => /encryption key is the one the words carry/.test(l.text)));
  assert.ok(d.lines.some((l) => /its own line of acts/.test(l.text)));
  assert.equal(await actsBy(g.id), before, 'nothing signed or published by bringing it');
  const f = app.store.identity(g.id).f;
  assert.equal(f.safety.seeds, '', 'no chain key held');
  assert.deepEqual(f.sequence, []);
  assert.equal(f.encryption[0].secret, hex(encryptionSecret(unhex(g.f.signingSecret))));
  const s = await c.ask<any>('state');
  const held = s.identities.find((i: any) => i.id === g.id);
  assert.equal(held.kind, 'brought');
  await refused(c.ask('bring', { name: 'Ada again', id: g.id, words, address: homes[0].base }), /already holds/);
  // Brought, it receives: a message sealed to it opens here.
  const sender = await elsewhere();
  const sent = await postAs(sender, { text: 'To Ada.', relays: [relay.base], to: [g.id] });
  await leaveInInbox(sender, sent.act, [relay.base]);
  const got = await c.ask<{ added: number; problems: string[] }>('refresh', { identity: g.id });
  assert.deepEqual(got.problems, []);
  assert.equal(got.added, 1);
  assert.ok((await c.ask<any>('state')).identities.find((i: any) => i.id === g.id).received.some((x: any) => x.text === 'To Ada.' && x.standing === 'valid'));
});

test('the record, in plain words: homes, routes, keys, names, and every line with its latest act, position and summary', async () => {
  const { c } = await edubba();
  const g = await elsewhere();
  await c.ask('bring', { name: 'Bea', id: g.id, words: toWords(unhex(g.f.signingSecret)).join(' '), address: homes[0].base });
  // A line made here (a witness act), and one made elsewhere (a post by the original holder).
  const theirs = await elsewhere();
  const p = await postAs(theirs, { text: 'Worth relying on.', relays: [relay.base] });
  await c.ask('witness', { identity: g.id, act: p.id, shown: 'A witness act says "I received this act and rely on it". It keeps the act visible as disputed even if its author later disowns it. It is public: anyone can see that you rely on this act, though not what it says.', typed: 'RELY' });
  await postAs(g, { text: 'From the other app.', relays: [relay.base] });
  const r = await c.ask<any>('record', { identity: g.id });
  assert.equal(r.kind, 'brought');
  const text = JSON.stringify(r.sections);
  assert.match(text, /Made elsewhere, brought here by its signing key’s words/);
  assert.match(text, new RegExp(homes[0].base.replace(/[.]/g, '\\.')));
  assert.match(text, /Its acts are published at/);
  assert.match(text, /Its inbox is at/);
  assert.match(text, /Signing key: the one Edubba holds, current/);
  assert.match(text, /Chain key: committed as [0-9a-f]+.*Not held here/);
  assert.match(text, /Edubba holds it: messages sealed to it open here/);
  assert.match(text, /Its display names/);
  assert.equal(r.lines.length, 2, JSON.stringify(r.lines));
  const own = r.lines.find((l: any) => l.own);
  assert.match(own.words, /^This device’s line: 1 act/);
  assert.equal(own.card.position, 1);
  assert.match(own.card.summary, /^[0-9a-f]{64}$/);
  const there = r.lines.find((l: any) => !l.own);
  assert.match(there.words, /^A line made elsewhere/);
  assert.equal(there.card.act.length, 64);
  // A made identity says so, and that its chain key is held here (a test identity).
  const made = (await c.ask<Done>('identity', { name: 'Made', linked: false })).acts[0];
  const m = await c.ask<any>('record', { identity: made });
  assert.match(JSON.stringify(m.sections), /Made here, by Edubba.*chain key is held in this program’s folder/);
});

test('relying on an act: read back in plain words, signed only once RELY is typed', async () => {
  const { c } = await edubba();
  const me = (await c.ask<Done>('identity', { name: 'Me', linked: false })).acts[0];
  const them = await elsewhere();
  const p = await postAs(them, { text: 'A promise‮ kept.', relays: [relay.base] });
  const read = await c.ask<any>('read act', { identity: me, act: p.id.toUpperCase() });
  assert.equal(read.act, p.id);
  assert.deepEqual(read.blocking, []);
  assert.ok(read.lines.some((l: any) => /a text, such as a post or a message/.test(l.text)));
  assert.ok(read.lines.some((l: any) => /Valid, through its signer’s identity chain/.test(l.text)));
  assert.equal(read.text, 'A promise<U+202E> kept.', 'its words as plain text, every invisible control written out');
  assert.match(read.explanation, /I received this act and rely on it/);
  const before = await actsBy(me);
  await refused(c.ask('witness', { identity: me, act: p.id, shown: read.explanation, typed: 'rely' }), /Type RELY.*Nothing was signed/);
  await refused(c.ask('witness', { identity: me, act: p.id, shown: 'something else', typed: 'RELY' }), /shown what it does/);
  assert.equal(await actsBy(me), before, 'nothing signed');
  const w = await c.ask<{ id: string }>('witness', { identity: me, act: p.id, shown: read.explanation, typed: ' RELY ' });
  const act = describeAct((await relayAt(relay.base).getAct(w.id))!) as { signer: string; spec: string; type: number; acks: string[]; public: boolean };
  assert.deepEqual([act.signer, act.type, act.public, act.acks], [me, 15, true, [p.id]]);
  // Its own act, and an act found nowhere, are not relied on.
  const own = await c.ask<any>('read act', { identity: me, act: w.id });
  assert.ok(own.blocking.some((b: string) => /this identity’s own act/.test(b)));
  const nowhere = await c.ask<any>('read act', { identity: me, act: '0'.repeat(64) });
  assert.ok(nowhere.blocking.some((b: string) => /not found/.test(b)));
  await refused(c.ask('witness', { identity: me, act: '0'.repeat(64), shown: read.explanation, typed: 'RELY' }), /not found.*Nothing was signed/);
  await refused(c.ask('read act', { identity: me, act: 'xyz' }), /64 hexadecimal/);
});

test('F339: releases under one’s own name moved to Ummia: the operations gone, the card saying where they are, the releases made before still listed', async () => {
  const { c } = await edubba();
  const me = (await c.ask<Done>('identity', { name: 'Releaser', linked: false })).acts[0];
  for (const op of ['release folder', 'release prepare', 'release confirm', 'release cancel']) await refused(c.ask(op, { identity: me, folder: tmpdir() }), /unknown operation/);
  const held = (await c.ask<any>('state')).identities.find((i: any) => i.id === me);
  assert.match(releaseCard(held), /made in Ummia, the developers’ app/);
  assert.match(releaseCard(held), /A collective’s releases stay here, in the Collectives tab, until Ummia’s second round/);
  assert.match(releaseCard({ ...held, releases: [{ id: 'a'.repeat(64), name: 'site', version: '1.0', folder: '/tmp/site' }] }), /Its releases made here before \(1\)/);
});

test('H14 and H15 for collectives: “What you may do for it” folded and remembered per collective; a collective brought by its ID, one of your identities among its members', async () => {
  const { app, c } = await edubba();
  const confirm = async (args: object) => {
    const r = await c.ask<{ plan: string; digest: string }>('collective prepare', args);
    return c.ask<Done>('collective confirm', { plan: r.plan, digest: r.digest });
  };
  const ids: string[] = [];
  for (const [name, mine] of [['Me', true], ['Ana', false], ['Bo', false]] as const) ids.push((await confirm({ kind: 'identity', name, mine })).acts[0]);
  await confirm({ kind: 'found', name: 'Tablet house', members: ids, rules: {} });
  const col = (await c.ask<any>('state')).collectives[0].id;
  await c.ask<Done>('collective prepare', { kind: 'post', collective: col, text: 'For the house.' }).then((r: any) => c.ask('collective confirm', { plan: r.plan, digest: r.digest }));

  // H14: folded, remembered by the program, per collective.
  assert.deepEqual((await c.ask<any>('state')).unfolded, {});
  await c.ask('fold', { collective: col, open: false });
  assert.deepEqual((await c.ask<any>('state')).unfolded, { [col]: false });
  await c.ask('fold', { collective: col, open: true });
  assert.deepEqual((await c.ask<any>('state')).unfolded, { [col]: true });
  // H26, H34: any other fold by its name; anything else refused.
  await c.ask('fold', { key: 'identity-record', open: false });
  assert.deepEqual((await c.ask<any>('state')).unfolded, { [col]: true, 'identity-record': false });
  await refused(c.ask('fold', { collective: 'X/../y', open: true }), /not a fold/);
  await refused(c.ask('fold', { key: '__proto__', open: true }), /not a fold/);

  // H15: in another Edubba, Ana brought by her words, then the collective by its ID.
  const { c: b } = await edubba();
  await refused(b.ask('collective bring', { id: col, name: 'The house' }), /None of your identities here is a party.*Nothing was kept/);
  await refused(b.ask('collective bring', { id: 'abc', name: 'x' }), /64 hexadecimal/);
  const ana = app.collectives.store.identity(ids[1]);
  await b.ask('bring', { name: 'Ana', id: ana.id, words: toWords(unhex(ana.f.signingSecret)).join(' '), address: homes[0].base });
  const d = await b.ask<Done>('collective bring', { id: groupId(col), name: 'The house' });
  assert.equal(d.acts[0], col);
  assert.ok(d.lines.some((l) => /Ana .* is a party of it: 3 parties in all/.test(l.text)), JSON.stringify(d.lines));
  assert.ok(d.lines.some((l) => /holds none of its keys/.test(l.text)));
  await refused(b.ask('collective bring', { id: col, name: 'Again' }), /already here/);
  const listed = (await b.ask<any>('state')).collectives;
  assert.deepEqual(listed.map((x: any) => [x.id, x.name, x.brought]), [[col, 'The house', true]]);
  const p = await b.ask<any>('collective permissions', { collective: col });
  assert.ok(p.notes.some((n: any) => /Edubba holds none of its keys/.test(n.text)));
  assert.ok(p.notes.some((n: any) => /Ana .* is a party of it/.test(n.text)));
  assert.ok(p.items.every((i: any) => i.state === 'no'));
  assert.ok(p.items[1].lines.some((l: any) => /“Releases” area reaches a picture’s publication: any 2 of .*You hold this area/.test(l.text)), JSON.stringify(p.items[1].lines));
  const k = await b.ask<any>('collective constitution', { collective: col });
  assert.equal(k.agreement, p.agreement);
  assert.ok(k.sections.some((s: any) => s.heading === 'Areas: who decides which acts'));
  const posts = await b.ask<any>('collective posts', { collective: col });
  assert.ok(posts.items.some((x: any) => x.text === 'For the house.' && x.standing === 'valid'), JSON.stringify(posts));
});
