// Real collectives (H18) across separate apps, each in its own folder, as
// three people on three devices: one Edubba (the founder's) and Dubs (the
// members'), against real homes and a relay on local ports, each driven
// through its own program's requests. Nothing is simulated: each member
// signs in its own Dub.
//
// - Founding: contacts; the terms proposed and sent; a Dub with Signing off
//   keeps the proposal waiting; each member reads it in plain words and signs
//   on its own; Edubba gathers the answers and founds once every party
//   signed; each share sealed to a one-time key, opened once in its Dub,
//   three words typed back, then the one-time key destroyed; the founder's
//   own share shown in Edubba once.
// - No app holds another's key or share: every folder read whole.
// - A release, counting once two members sign it in their own apps.
// - A decline; a member change proposed and signed the same way; its
//   rotation from two paper shares (the repo client standing in for Kišib);
//   the new shares to the members' new one-time keys.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MIRS, SPECS, Verifier, hex, shareOnPaper } from '../../genesis/src/core.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { fromWords } from '../../../modules/carry/src/carry.ts';
import { AGREEMENTS_SPECS } from '../../repo/src/agreements.ts';
import { sealShare } from '../../repo/src/proposals.ts';
import { serve, type Running } from '../src/server.ts';
import { serve as serveDub, DOMAIN as DUB_DOMAIN, type Running as DubRunning } from '../../dub/src/server.ts';
import { Client, newKey, type Done } from '../src/page/api.ts';

let homes: Relay[];
let relay: Relay;
const apps: { close(): Promise<void> }[] = [];

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
});

after(async () => {
  for (const a of apps) await a.close();
  for (const h of [...homes, relay]) await h.stop();
});

async function edubba(): Promise<{ app: Running; c: Client; dir: string }> {
  const dir = join(mkdtempSync(join(tmpdir(), 'real-edubba-')), 'edubba');
  const app = await serve({ dir, port: 0, machineEvery: 0, drafts: join(dir, '..', 'drafts') });
  apps.push(app);
  const c = await Client.open(await newKey(), app.base);
  await c.ask('pair', { code: app.access.newCode(), label: 'test' });
  await c.ask('settings', { homes: homes.map((h) => h.base), relays: [relay.base], via: [], drafts: '' });
  return { app, c, dir };
}

async function dub(): Promise<{ app: DubRunning; c: Client; dir: string; id: string }> {
  const dir = mkdtempSync(join(tmpdir(), 'real-dub-'));
  const app = await serveDub({ dir, port: 0 });
  apps.push(app);
  const c = await Client.open(await newKey(), app.base, DUB_DOMAIN);
  await c.ask('pair', { code: app.access.newCode(), label: 'test' });
  const b = await c.ask<{ words: string[]; positions: number[] }>('begin', { homes: [homes[0].base], relays: [relay.base] });
  await c.ask('confirm', { typed: b.positions.map((p) => b.words[p - 1]) });
  const id = (await c.ask<any>('state')).identity.id;
  return { app, c, dir, id };
}

const refused = async (p: Promise<unknown>, words: RegExp) => {
  await assert.rejects(p, (e: Error) => {
    assert.match(e.message, words);
    return true;
  });
};

/** Every file under a folder, read whole. */
function everything(dir: string): string {
  const out: string[] = [];
  const walk = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else out.push(readFileSync(p).toString('latin1'));
    }
  };
  walk(dir);
  return out.join('\n');
}

/** Every way a secret could be written in a file. */
const forms = (b: Uint8Array) => [hex(b), Buffer.from(b).toString('base64'), Buffer.from(b).toString('latin1')];

/** Show a member's share in its Dub once, read its paper, type three words back. */
async function receiveShare(c: Client, thread: string): Promise<{ x: number; words: string[] }> {
  const shown = await c.ask<any>('share', { thread });
  assert.equal(shown.words.length, 24);
  await refused(c.ask('share', { thread }), /shown once already/);
  await refused(c.ask('shareback', { thread, typed: ['wrong', 'wrong', 'wrong'] }), /not words .* kept until they are/);
  const done = await c.ask<{ lines: { text: string }[] }>('shareback', { thread, typed: shown.positions.map((p: number) => shown.words[p - 1]) });
  assert.match(done.lines[0].text, /one-time key is destroyed/);
  return { x: shown.x, words: shown.words };
}

test('three people on three devices: a real collective founded, a release, a member change, a rotation from paper shares', async () => {
  const e = await edubba();
  const nobody = (await e.c.ask<Done>('identity', { name: 'Nobody, allegedly', linked: false })).acts[0];
  const ana = await dub();
  const bo = await dub();
  const cy = await dub();

  // Contacts: added by ID with a name; one followed by an agent shows too.
  await refused(e.c.ask('real contact add', { id: 'not an id', name: 'X' }), /64/);
  await e.c.ask('real contact add', { id: ana.id, name: 'Ana' });
  await e.c.ask('real contact add', { id: bo.id, name: 'Bo' });
  e.app.store.savePeople(nobody, { follows: [{ id: cy.id, name: 'Cy' }], muted: [] });
  const contacts = await e.c.ask<any[]>('real contacts');
  assert.deepEqual(contacts.map((x) => [x.name, x.from === 'added' ? 'added' : 'agent']), [['Ana', 'added'], ['Bo', 'added']], 'an identity that is not an agent adds nothing');

  // Founding, reviewed: nothing signed until confirmed.
  const review = await e.c.ask<any>('real found prepare', { name: 'The tablet house', founder: nobody, members: [ana.id, bo.id], safety: 2, release: 2, clone: 2, others: 2 });
  assert.match(review.reading.title, /Propose to found the collective “The tablet house”/);
  assert.ok(review.reading.sections.some((s: any) => s.heading === 'How it travels'));
  assert.ok(review.reading.sections.some((s: any) => s.lines.some((l: any) => /holds the whole chain key/.test(l.text))));
  await refused(e.c.ask('real confirm', { plan: review.plan, digest: '00'.repeat(32) }), /does not match/);
  const proposed = await e.c.ask<Done>('real confirm', { plan: review.plan, digest: review.digest });
  const terms = proposed.acts[0];
  assert.ok(proposed.lines.some((l) => /Sent to Ana/.test(l.text)), JSON.stringify(proposed.lines));

  // Bo's Dub has Signing off: the proposal waits, unread; nothing can be signed.
  let bp = await bo.c.ask<any>('proposals');
  assert.deepEqual([bp.on, bp.waiting, bp.proposals.length], [false, 1, 0]);
  assert.match(bp.say, /Signing is off/);

  // Ana turns Signing on, reads it in plain words, signs.
  await ana.c.ask('signing', { on: true });
  let ap = await ana.c.ask<any>('proposals');
  assert.equal(ap.proposals.length, 1);
  const ap0 = ap.proposals[0];
  assert.equal(ap0.act, terms);
  assert.equal(ap0.reading.kind, 'founding');
  assert.match(ap0.reading.title, /^Found a collective/);
  const headings = ap0.reading.sections.map((s: any) => s.heading);
  for (const h of ['What each party is bound to', 'Who decides what', 'Shares and fees', 'How it ends', 'Risks']) assert.ok(headings.some((x: string) => x.startsWith(h)), `${h} in ${headings.join(' / ')}`);
  assert.ok(ap0.reading.plain.length);
  assert.ok(Array.isArray(ap0.reading.risks));
  assert.equal(ap0.share, 'none');
  const signedA = await ana.c.ask<any>('accept', { thread: ap0.thread });
  assert.ok(signedA.lines.some((l: any) => /one-time key was made/.test(l.text)));
  await refused(ana.c.ask('accept', { thread: ap0.thread }), /already signed/);
  ap = await ana.c.ask<any>('proposals');
  assert.equal(ap.proposals[0].share, 'waiting');
  assert.equal(ap.proposals[0].answer.verdict, 'signed');

  // Edubba: one has signed, one has not.
  let g = await e.c.ask<any>('real gather', { act: terms });
  assert.deepEqual(g.standing.signed.sort(), [nobody, ana.id].sort());
  assert.deepEqual(g.standing.waiting, [bo.id]);
  await refused(e.c.ask('real found', { act: terms }), /Waiting for Bo/);

  // Bo turns it on and signs.
  await bo.c.ask('signing', { on: true });
  bp = await bo.c.ask<any>('proposals');
  await bo.c.ask('accept', { thread: bp.proposals[0].thread });
  g = await e.c.ask<any>('real gather', { act: terms });
  assert.equal(g.standing.enough, true);
  assert.ok(g.proposal.answers[ana.id].oneTime && g.proposal.answers[bo.id].oneTime);

  // Found: the key dealt here, each share sealed to its one-time key; the founder's own shown here once.
  const f = await e.c.ask<Done & { show: string[] }>('real found', { act: terms });
  const col = f.acts[0];
  assert.deepEqual(f.show, [nobody]);
  assert.ok(f.lines.some((l) => /sealed to Ana .*one-time key/.test(l.text)), JSON.stringify(f.lines));
  const mine = await e.c.ask<any>('real show share', { collective: col, member: nobody });
  await refused(e.c.ask('real show share', { collective: col, member: nobody }), /shown once already/);
  await e.c.ask('real share back', { collective: col, member: nobody, typed: mine.positions.map((p: number) => mine.words[p - 1]) });
  await refused(e.c.ask('real show share', { collective: col, member: nobody }), /No share waits/);
  const papers: Record<string, { x: number; value: Uint8Array }> = { [nobody]: { x: mine.x, value: fromWords(mine.words) } };

  // Each member opens its own, once.
  for (const [who, m] of [['ana', ana], ['bo', bo]] as const) {
    const p = (await m.c.ask<any>('proposals')).proposals[0];
    assert.equal(p.share, 'ready', who);
    assert.equal(p.collective, col);
    assert.ok(p.later.some((t: string) => /is founded/.test(t)));
    const s = await receiveShare(m.c, p.thread);
    papers[m.id] = { x: s.x, value: fromWords(s.words) };
    assert.equal((await m.c.ask<any>('proposals')).proposals[0].share, 'received');
  }
  assert.deepEqual(Object.values(papers).map((p) => p.x).sort(), [1, 2, 3]);

  // Agreements read it founded under the terms every party signed, each in its own app.
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  await lookUp(col, [relay.base, homes[0].base], {}, v);
  for (const id of [nobody, ana.id, bo.id]) {
    await lookUp(id, [relay.base, homes[0].base], {}, v);
    for (const it of (await relayAt(relay.base).feed({ signer: id })).items) if (it.kind === 'act') v.add(it.item);
  }
  assert.equal((v.agreementsCurrent(AGREEMENTS_SPECS, col) as { agreement: string }).agreement, terms);

  // No app holds another's key, nor any share, nor a one-time secret: every folder read whole.
  const folders = { edubba: everything(e.dir), ana: everything(ana.dir), bo: everything(bo.dir), cy: everything(cy.dir) };
  for (const [who, paper] of Object.entries(papers)) {
    for (const [where, text] of Object.entries(folders)) for (const form of forms(paper.value)) assert.ok(!text.includes(form), `${who}'s share in ${where}'s folder`);
  }
  for (const m of [ana, bo]) {
    const st = JSON.parse(readFileSync(join(m.dir, 'identities', m.id, 'signing.json'), 'utf8'));
    assert.deepEqual(st.waiting, {}, 'the one-time secret is destroyed');
  }
  const keyOf = (dir: string, id: string) => JSON.parse(readFileSync(join(dir, 'identities', id, 'identity.json'), 'utf8')).signingSecret as string;
  for (const [who, dir, id] of [['ana', ana.dir, ana.id], ['bo', bo.dir, bo.id]] as const) {
    for (const [where, text] of Object.entries(folders)) if (where !== who) assert.ok(!text.includes(keyOf(dir, id)), `${who}'s signing key in ${where}'s folder`);
  }
  assert.ok(!folders.ana.includes(JSON.parse(readFileSync(join(e.dir, 'identities', `${nobody}.json`), 'utf8')).signingSecret));

  // A release of the collective: published by Edubba, counting once two members sign it, each in its own app.
  const folder = join(mkdtempSync(join(tmpdir(), 'real-release-')), 'tablets');
  mkdirSync(folder);
  writeFileSync(join(folder, 'clay.txt'), 'a tablet\n');
  const rr = await e.c.ask<any>('real release prepare', { collective: col, folder, name: 'tablets', version: '1' });
  const rel = (await e.c.ask<Done>('real confirm', { plan: rr.plan, digest: rr.digest })).acts[0];
  let standing = await e.c.ask<any>('real release standing', { act: rel });
  assert.equal(standing.ok, false, 'one signature of two');
  const ar = (await ana.c.ask<any>('proposals')).proposals.find((p: any) => p.act === rel);
  assert.equal(ar.reading.kind, 'release');
  assert.match(ar.reading.title, /Sign a release: tablets 1/);
  assert.ok(ar.reading.sections.some((s: any) => s.lines.some((l: any) => /clay\.txt: 9 bytes/.test(l.text))));
  await ana.c.ask('accept', { thread: ar.thread });
  standing = await e.c.ask<any>('real release standing', { act: rel });
  assert.ok(standing.ok, JSON.stringify(standing.problems));
  assert.deepEqual(standing.signers.sort(), [nobody, ana.id].sort());
  // Bo declines it: a negotiation message, nothing signed.
  const br = (await bo.c.ask<any>('proposals')).proposals.find((p: any) => p.act === rel);
  await bo.c.ask('decline', { thread: br.thread, why: 'Not checked yet.' });
  g = await e.c.ask<any>('real gather', { act: rel });
  assert.equal(g.proposal.answers[bo.id].verdict, 'declined');
  assert.match(g.proposal.answers[bo.id].text, /Not checked yet/);

  // A member change: Cy joins, Bo leaves. Every voice and the joining member sign, each in its own app.
  await e.c.ask('real contact add', { id: cy.id, name: 'Cy' });
  const ch = await e.c.ask<any>('real change prepare', { collective: col, members: [nobody, ana.id, cy.id] });
  assert.ok(ch.reading.sections[0].heading === 'What it changes');
  assert.match(ch.reading.summary[1], /waits for Kišib/);
  const clone = (await e.c.ask<Done>('real confirm', { plan: ch.plan, digest: ch.digest })).acts[0];
  await cy.c.ask('signing', { on: true });
  for (const m of [ana, bo, cy]) {
    const p = (await m.c.ask<any>('proposals')).proposals.find((x: any) => x.act === clone);
    assert.equal(p.reading.kind, 'clone');
    assert.ok(p.reading.sections.some((s: any) => s.heading === 'What it changes'));
    await m.c.ask('accept', { thread: p.thread });
  }
  g = await e.c.ask<any>('real gather', { act: clone });
  assert.equal(g.standing.enough, true);

  // The rotation, from two paper shares (Ana's and Bo's): Kišib's work; the repo client stands in.
  const c = e.app.real.collective(col);
  const p = g.proposal;
  const rot = await c.rotateFromPaper({
    agreement: clone,
    signatures: p.signers.map((m: string) => p.answers[m].signature),
    members: p.members,
    governance: p.governance,
    holder: p.holder,
    papers: [papers[ana.id], papers[bo.id]],
  });
  assert.ok(await c.settle());
  writeFileSync(join(e.dir, 'real', 'collectives', `${col}.json`), JSON.stringify(c.f, null, 2));
  // The new shares, each to the one-time key its member sent with its acceptance of the clone.
  const founder = e.app.store.identity(nobody);
  for (const s of rot.shares) {
    if (s.holder === nobody) continue;
    await sealShare(founder, s.share, Uint8Array.from(Buffer.from(p.answers[s.holder].oneTime, 'base64')), [relay.base]);
  }
  e.app.store.saveIdentity(founder);
  for (const m of [ana, cy]) {
    const q = (await m.c.ask<any>('proposals')).proposals.find((x: any) => x.act === clone);
    assert.equal(q.share, 'ready');
    const s = await receiveShare(m.c, q.thread);
    assert.equal(s.x, rot.shares.findIndex((x) => x.holder === m.id) + 1);
  }
  // Bo, leaving, gets no new share: its one-time key waits, and it may destroy it.
  const bq = (await bo.c.ask<any>('proposals')).proposals.find((x: any) => x.act === clone);
  assert.equal(bq.share, 'waiting');
  await bo.c.ask('sharehand', { thread: bq.thread });

  const after = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  await lookUp(col, [homes[0].base, relay.base], {}, after);
  for (const id of [nobody, ana.id, bo.id, cy.id, col]) {
    if (id !== col) await lookUp(id, [relay.base, homes[0].base], {}, after);
    for (const it of (await relayAt(relay.base).feed({ signer: id })).items) if (it.kind === 'act') try { after.add(it.item); } catch { /* private */ }
  }
  assert.equal((after.agreementsCurrent(AGREEMENTS_SPECS, col) as { agreement: string }).agreement, clone, 'the clone in force after the rotation');
  void shareOnPaper;
  void statSync;
});
