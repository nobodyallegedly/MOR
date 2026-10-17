// A collective's rotation in Kišib (F337), completing a member change
// proposed in Edubba, as human test 10 runs it: the founder made in Dub and
// brought into Edubba, two members in their own Dubs; founded, the shares on
// paper; a member change (one joins, one leaves) signed by everyone in their
// own app; then Kišib: the founder starts it (their paper share and their
// signing words), a member gives theirs from their own Kišib, sealed to the
// one-time key; exactly two of three papers rebuild the key; rotated,
// counting; the new shares sealed to the one-time keys the members' Dubs
// made, the founder's shown once; the clone in force. Nothing kept in any
// Kišib's folder. And the hour: a request that expired opens nothing.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { MIRS, SPECS, Verifier, unhex } from '../../genesis/src/core.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { fromWords, toWords } from '../../../modules/carry/src/carry.ts';
import { AGREEMENTS_SPECS } from '../../repo/src/agreements.ts';
import { closeAll, everything, forms, founded, kishib, receiveShare, refused, start, type Relay } from './world.ts';
import type { Review, State } from '../src/shapes.ts';

let homes: Relay[];
let relay: Relay;

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
});

after(async () => {
  await closeAll();
  for (const h of [...homes, relay]) await h.stop();
});

test('a collective rotation from two of three paper shares, remote, completes the member change proposed in Edubba; the new shares reach the members’ one-time keys; nothing kept', async () => {
  const { H, e, f, fWords, ana, bo, cy, col, clone, papers } = await founded(homes, relay);
  const aWords = (await ana.c.ask<{ words: string[] }>('carry')).words.join(' ');

  // The founder starts it in Kišib: F337's plain words first; the change read back; who gets what.
  const k1 = await kishib();
  await refused(k1.c.ask('collective start', { collective: col, address: H[0], number: String(papers[f.id].x), shareWords: papers[f.id].words.join(' ') }), /signing key’s words/);
  await refused(k1.c.ask('collective start', { collective: col, address: H[0], founder: ana.id, founderWords: aWords, number: String(papers[f.id].x), shareWords: papers[f.id].words.join(' ') }), /proposed by/);
  const r = await k1.c.ask<Review>('collective start', { collective: col, address: H[0], founder: f.id, founderWords: fWords, number: String(papers[f.id].x), shareWords: papers[f.id].words.join(' ') });
  assert.equal(r.sections[0].heading, 'Before you start: what this device will hold (F337)');
  assert.match(r.sections[0].lines[0].text, /whole chain key for a moment/);
  assert.match(r.sections[0].lines[1].text, /keep the new key and later act alone/);
  assert.match(r.sections[0].lines[2].text, /the app rather than the web page/);
  assert.deepEqual(r.blocking, [], JSON.stringify(r.blocking));
  const change = r.sections.find((s) => s.heading === 'The member change it completes')!;
  assert.ok(change.lines.some((l) => l.text.includes(clone)));
  const dealt = r.sections.find((s) => s.heading === 'The new shares')!;
  assert.ok(dealt.lines.some((l) => /you, the starter/.test(l.text)));
  assert.equal(dealt.lines.filter((l) => /sealed to the one-time key/.test(l.text)).length, 2, JSON.stringify(dealt));
  let s = await k1.c.ask<State>('confirm', { plan: r.plan, digest: r.digest });
  assert.equal(s.sitting!.stage, 'waiting');
  const q = s.sitting!.request!;
  assert.deepEqual([q.have, q.need, q.room], [1, 2, false]);
  assert.ok(q.expires > Date.now() / 1000 + 3500 && q.expires <= Date.now() / 1000 + 3600, 'an hour');
  await refused(k1.c.ask('collective rotate'), /1 of 2/);

  // Ana's Dub shows the announcement in the change's thread, with the fingerprint.
  const ap = (await ana.c.ask<any>('proposals')).proposals.find((x: any) => x.act === clone);
  assert.ok(ap.later.some((t: string) => t.includes(q.full) && /waits for your paper share, in Kišib/.test(t)), JSON.stringify(ap.later));

  // Ana, in her own Kišib: the rotation read back first; then her paper and her signing words.
  const k2 = await kishib();
  await refused(k2.c.ask('collective read', { collective: col, fingerprint: 'ab'.repeat(32), address: H[0] }), /No rotation request/);
  const rd = await k2.c.ask<{ title: string; sections: { heading: string; lines: { text: string }[] }[] }>('collective read', { collective: col, fingerprint: q.full, address: H[0] });
  assert.ok(rd.sections[0].lines.some((l) => l.text.includes(q.full)));
  assert.ok(rd.sections.some((x) => x.heading === 'What the starter’s device will hold (F337)'));
  const gr = await k2.c.ask<Review>('collective give', { collective: col, fingerprint: q.full, address: H[0], member: ana.id, memberWords: aWords, number: String(papers[ana.id].x), shareWords: papers[ana.id].words.join(' ') });
  assert.match(gr.signs[0], /sealed to the starter’s one-time key/);
  const given = await k2.c.ask<State>('confirm', { plan: gr.plan, digest: gr.digest });
  assert.equal(given.sitting!.stage, 'done');
  assert.match(given.sitting!.title, /is given/);

  // The founder's Kišib finds it: exactly two of three; rebuilt, rotated, dealt, in one sitting.
  s = await k1.c.ask<State>('collective gather');
  assert.equal(s.sitting!.request!.have, 2, JSON.stringify(s.sitting!.lines));
  assert.ok(s.sitting!.request!.from.includes(ana.id));
  s = await k1.c.ask<State>('collective rotate');
  for (let i = 0; (s.sitting!.stage as string) === 'sent' && i < 3; i++) s = await k1.c.ask<State>('resend');
  assert.equal(s.sitting!.stage, 'counts', JSON.stringify(s.sitting!.lines));
  assert.ok(s.sitting!.lines.some((l) => /chain key is overwritten/.test(l.text)));
  assert.equal(s.sitting!.lines.filter((l) => /sealed to its one-time key/.test(l.text)).length, 2, JSON.stringify(s.sitting!.lines));
  assert.deepEqual(s.sitting!.shares!.map((x) => x.holder), [f.id]);

  // The founder's new share, shown here once.
  const own = await k1.c.ask<{ x: number; words: string[] }>('collective share', { holder: f.id });
  assert.equal(own.words.length, 24);
  s = await k1.c.ask<State>('collective share written', { holder: f.id });
  await refused(k1.c.ask('collective share', { holder: f.id }), /No share/);
  // The collective's new signing key's words, for its holder.
  const cw = await k1.c.ask<{ words: string[]; holder: string }>('words show');
  assert.equal(cw.holder, f.id);
  s = await k1.c.ask<State>('words written');
  s = await k1.c.ask<State>('words typed', { typed: s.sitting!.positions!.map((n) => cw.words[n - 1]) });
  assert.equal(s.sitting!.stage, 'done');

  // Ana's and Cy's new shares arrive in their Dubs, once each; Bo, leaving, gets none.
  const fresh: Record<string, { x: number; words: string[] }> = { [f.id]: own };
  for (const m of [ana, cy]) fresh[m.id] = await receiveShare(m.c, clone);
  assert.deepEqual(Object.values(fresh).map((x) => x.x).sort(), [1, 2, 3]);
  assert.equal((await bo.c.ask<any>('proposals')).proposals.find((x: any) => x.act === clone).share, 'waiting');

  // As anyone reads it: the rotation counts, and the clone is in force.
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  const look = await lookUp(col, [H[0], relay.base], {}, v);
  assert.equal(look.resolution.links.length, 2);
  for (const id of [f.id, ana.id, bo.id, cy.id, col]) {
    if (id !== col) await lookUp(id, [relay.base, ...H], {}, v);
    for (const it of (await relayAt(relay.base).feed({ signer: id })).items) if (it.kind === 'act') try { v.add(it.item); } catch { /* private */ }
  }
  assert.equal((v.agreementsCurrent(AGREEMENTS_SPECS, col) as { agreement: string }).agreement, clone, 'the clone in force after the rotation');

  // Nothing kept in either Kišib's folder: no paper, no signing words, no new share, no collective key.
  for (const k of [k1, k2]) {
    const folder = everything(k.dir);
    for (const ws of [papers[f.id].words, papers[ana.id].words, fWords.split(' '), aWords.split(' '), own.words, cw.words, fresh[ana.id].words]) {
      for (const x of forms(ws, fromWords(ws))) assert.ok(!folder.includes(x), `“${x.slice(0, 16)}…” in a Kišib folder`);
    }
  }
  void e;
  void readFileSync;
  void join;
  void unhex;
  void toWords;
});

test('the hour (F337): a waiting one-time key expires; a share cannot be given after, and nothing can be opened', async () => {
  const { H, f, fWords, ana, col, papers } = await founded(homes, relay);
  const aWords = (await ana.c.ask<{ words: string[] }>('carry')).words.join(' ');
  let clock = Math.floor(Date.now() / 1000);
  const k1 = await kishib(() => clock);
  const r = await k1.c.ask<Review>('collective start', { collective: col, address: H[0], founder: f.id, founderWords: fWords, number: String(papers[f.id].x), shareWords: papers[f.id].words.join(' ') });
  let s = await k1.c.ask<State>('confirm', { plan: r.plan, digest: r.digest });
  const fp = s.sitting!.request!.full;
  // A member's Kišib reads the expiry from the request itself, by its own clock.
  const k2 = await kishib(() => clock + 3601);
  await refused(k2.c.ask('collective give', { collective: col, fingerprint: fp, address: H[0], member: ana.id, memberWords: aWords, number: String(papers[ana.id].x), shareWords: papers[ana.id].words.join(' ') }), /expired/);
  clock += 3601;
  s = await k1.c.ask<State>('collective gather');
  assert.equal(s.sitting!.stage, 'expired');
  assert.match(s.sitting!.lines[0].text, /one-time key is destroyed/);
  await refused(k1.c.ask('collective rotate'), /No rotation waits/);
  assert.equal((await lookUp(col, H)).resolution.links.length, 1, 'nothing signed');
  assert.equal((await k1.c.ask<State>('forget')).sitting, null);
});

test('in the same room: the papers typed one after another into one Kišib, nothing sent, no signing words; every new share shown here once', async () => {
  const { H, f, ana, bo, cy, col, clone, papers } = await founded(homes, relay);
  const k = await kishib();
  const r = await k.c.ask<Review>('collective start', { collective: col, address: H[0], room: true, number: String(papers[bo.id].x), shareWords: papers[bo.id].words.join(' ') });
  assert.deepEqual(r.blocking, []);
  assert.match(r.signs[2], /Nothing is signed with anyone’s signing key/);
  let s = await k.c.ask<State>('confirm', { plan: r.plan, digest: r.digest });
  assert.deepEqual([s.sitting!.request!.have, s.sitting!.request!.room], [1, true]);
  await refused(k.c.ask('collective paper', { number: String(papers[bo.id].x), words: papers[bo.id].words.join(' ') }), /already typed/);
  s = await k.c.ask<State>('collective paper', { number: String(papers[ana.id].x), words: papers[ana.id].words.join(' ') });
  await refused(k.c.ask('collective paper', { number: String(papers[f.id].x), words: papers[f.id].words.join(' ') }), /no more/);
  s = await k.c.ask<State>('collective rotate');
  for (let i = 0; (s.sitting!.stage as string) === 'sent' && i < 3; i++) s = await k.c.ask<State>('resend');
  assert.equal(s.sitting!.stage, 'counts', JSON.stringify(s.sitting!.lines));
  assert.deepEqual(s.sitting!.shares!.map((x) => x.holder).sort(), [f.id, ana.id, cy.id].sort(), 'every new share shown here');
  const xs: number[] = [];
  for (const m of [f.id, ana.id, cy.id]) {
    xs.push((await k.c.ask<{ x: number }>('collective share', { holder: m })).x);
    await k.c.ask('collective share written', { holder: m });
  }
  assert.deepEqual(xs.sort(), [1, 2, 3]);
  const v = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  await lookUp(col, [H[0], relay.base], {}, v);
  for (const id of [f.id, ana.id, bo.id, cy.id, col]) {
    if (id !== col) await lookUp(id, [relay.base, ...H], {}, v);
    for (const it of (await relayAt(relay.base).feed({ signer: id })).items) if (it.kind === 'act') try { v.add(it.item); } catch { /* private */ }
  }
  assert.equal((v.agreementsCurrent(AGREEMENTS_SPECS, col) as { agreement: string }).agreement, clone);
});
