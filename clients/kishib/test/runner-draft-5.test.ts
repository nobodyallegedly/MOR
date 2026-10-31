// The Dubsar runner, draft 5 (`cmips/cmip-runner-draft-5.md`, section 9 and
// 5.5; the redesign, Agreements rules 56 to 60): there are no member keys.
// An act for a collective is an ordinary request of the member's own
// identity, the collective named in its objects; Kišib signs it with the
// member's own key, through its panel, always (no standing yes), the panel
// saying for which collective and under which decision. Draft 3's member
// line, its `as`, and its ask to hold a key are refused, said plainly; a
// draft 3 or 4 file holding a member key is opened, the key dropped.
//
// These replace draft 3's member-key tests (`runner-draft-3.test.ts`), whose
// premise (a member key per collective, held in Kišib) no longer exists.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { MIRS, SPECS, cborEncode, describeAct, unhex } from '../../genesis/src/core.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { POST_SPECS, TEXT_ACT } from '../../barebone/src/specs.ts';
import { textPayload } from '../../barebone/src/post.ts';
import { dub, everything, kishib, PASS, refused, runnerOn, start, stopAll, type Relay } from './world.ts';
import { FOR_COLLECTIVE_SAY, MEMBER_KEYS_ERASED_SAY, NO_MEMBER_ASK_SAY, NO_MEMBER_KEYS_SAY, Runner, type RunnerView } from '../src/runner.ts';
import type { RunnerRequest } from '../src/runner-read.ts';

let homes: Relay[];
let relay: Relay;
const others: (() => Promise<unknown>)[] = [];

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
});

after(async () => {
  // Part 4: every program and server this file started, stopped whatever the outcome.
  await stopAll(...others);
});

const ORIGIN = 'http://127.0.0.1:1';

/** A Kišib with its runner on, holding the identities given, and an app (a probe, as the cMIP's tests use) approved for them. */
async function runnerFor(people: { id: string; words: string }[]) {
  const H = homes.map((h) => h.base);
  const k = await kishib();
  await runnerOn(k.c);
  for (const p of people) await k.c.ask('runner give', { id: p.id, address: H[0], words: p.words });
  const probe = k.app.runner.pair({ name: 'Probe', origin: ORIGIN });
  k.app.runner.approve({ pairing: probe.pairing, identities: people.map((p) => p.id) });
  const bindingOf = (id: string) => k.app.runner.paired(probe.token).identities.find((x) => x.id === id)!.binding;
  return { k, token: probe.token, pairing: probe.pairing, bindingOf };
}

/** Answered yes in Kišib's page, then the signed act, as the app gets it. */
async function signedThroughPage(k: Awaited<ReturnType<typeof kishib>>, token: string, request: string): Promise<Uint8Array> {
  await k.c.ask('runner answer', { request, yes: true });
  const r = await k.app.runner.result(token, { request });
  assert.ok('signed' in r, JSON.stringify(r));
  return Uint8Array.from(Buffer.from(r.signed.act, 'base64'));
}

test('draft 5: an act for a collective, signed with the member’s own key through the panel (no standing yes), naming the collective and its decision; counted for the collective; a stranger’s, the same panel, counted for nobody', async () => {
  const H = homes.map((h) => h.base);
  // Founded in Edubba under the keyless genesis (the cast's shared fixture). Loaded here only:
  // Edubba's and Damgar's code is not needed by the other tests of this file.
  const { edubba, dub: dubOf, closeAll: closeDamgar } = await import('../../damgar/test/world.ts');
  others.push(closeDamgar);
  const { foundCollective } = await import('../../desk/test/cast.ts');
  const { chainFor, judgeCollective } = await import('../../grants/src/member.ts');
  const e = await edubba(H, [relay.base]);
  const A = (await e.c.ask<{ acts: string[] }>('identity', { name: 'A', linked: false })).acts[0];
  const max = await dubOf(H, [relay.base]);
  const pa = await dubOf(H, [relay.base]);
  const stranger = await dubOf(H, [relay.base]);
  const { collective } = await foundCollective(e, A, [max, pa], [{ name: 'Posts', layer: [1, 2], holders: [A, max.id, pa.id], number: 1 }], { name: 'Collective Y' });

  const { k, token, pairing, bindingOf } = await runnerFor([max, stranger]);
  // A standing yes for posts: never used for an act for a collective (5.5).
  await k.c.ask('runner yes', { pairing, kind: 'posts', on: true });

  const { decision } = await chainFor(collective, [relay.base, ...H]);
  const ask = (who: { id: string }, text: string): RunnerRequest => ({
    identity: who.id,
    binding: bindingOf(who.id),
    line: 'public',
    sequence: [],
    spec: POST_SPECS.text,
    type: TEXT_ACT,
    payload: textPayload(text),
    public: true,
    // Text rule 14: a text act carries one object, the collective and the decision it acts under.
    objects: [[collective, decision]],
  });

  for (const [who, text, counts] of [
    [max, 'For the collective, with my own key, through Kišib.', true],
    [stranger, 'A stranger naming the collective.', false],
  ] as const) {
    const a = await k.app.runner.ask(token, ask(who, text), k.app.base);
    assert.ok('asks' in a, 'an act for a collective asks, even with a standing yes for posts');
    assert.equal(a.asks.title, 'Probe asks Kišib to sign a post for a collective');
    const w = (await k.c.ask<RunnerView>('runner state')).waiting.find((x) => x.request === a.asks.request)!;
    assert.equal(w.always, true, 'no standing yes offered');
    assert.match(w.as ?? '', /^For the collective mid1.*, under its decision .*, signed with .*’s own key \(mid1/);
    assert.ok(w.words.includes(FOR_COLLECTIVE_SAY));
    assert.doesNotMatch(JSON.stringify(w), /member key/);
    const bytes = await signedThroughPage(k, token, a.asks.request);
    const d = describeAct(bytes) as { id: string; signer: string; binding: string; objects?: [string, string][] };
    assert.equal(d.signer, who.id, 'signed by the member, with their own key');
    assert.equal(d.binding, bindingOf(who.id));
    assert.deepEqual(d.objects, [[collective, decision]], 'naming the collective and the decision it acts under');
    for (const h of [relay.base, ...H]) await relayAt(h).putAct(bytes).catch(() => undefined);
    const judged = (await judgeCollective(collective, [d.id], [relay.base, ...H])).get(d.id)!;
    assert.equal(judged.met, counts, `${text}: ${JSON.stringify(judged)}`);
    const signed = (await k.c.ask<RunnerView>('runner state')).signed[0];
    assert.equal(signed.as, collective, 'listed in Signed as for the collective');
  }
  void MIRS;
});

test('draft 5: draft 3’s member line, its `as`, and its ask to hold a key are refused, said plainly; nothing kept, nothing waiting', async () => {
  const H = homes.map((h) => h.base);
  const a = await dub(H, [relay.base]);
  const words = (await a.c.ask<{ words: string[] }>('carry')).words.join(' ');
  const { k, token, bindingOf } = await runnerFor([{ id: a.id, words }]);
  const base: RunnerRequest = { identity: a.id, binding: bindingOf(a.id), line: 'public', sequence: [], spec: POST_SPECS.text, type: TEXT_ACT, payload: textPayload('x'), public: true };
  await refused(k.app.runner.ask(token, { ...base, line: 'member', as: 'cd'.repeat(32) }, ORIGIN), new RegExp(NO_MEMBER_KEYS_SAY.slice(0, 40)));
  await refused(k.app.runner.ask(token, { ...base, as: 'cd'.repeat(32) }, ORIGIN), /There are no member keys any more/);
  assert.throws(() => k.app.runner.memberAsk(token, { identity: a.id, collective: 'cd'.repeat(32), places: H }), (e: Error) => e.message === NO_MEMBER_ASK_SAY);
  const v = await k.c.ask<RunnerView>('runner state');
  assert.deepEqual(v.waiting, []);
  assert.equal((v as unknown as Record<string, unknown>).memberAsks, undefined, 'no member asks kept');
  // What an app learns of the identity: its own key, nothing of any member key.
  assert.deepEqual(Object.keys(k.app.runner.paired(token).identities[0]).sort(), ['binding', 'homes', 'id', 'key', 'name', 'spent']);
});

test('draft 5, 9.3: a draft 3 or 4 file holding a member key is opened, the key dropped and said once, the file sealed again holding none', async () => {
  const H = homes.map((h) => h.base);
  const a = await dub(H, [relay.base]);
  const words = (await a.c.ask<{ words: string[] }>('carry')).words.join(' ');
  const { k } = await runnerFor([{ id: a.id, words }]);
  // A draft 4 file: the identity held with a member key for a collective, and an app's ask for another.
  const secret = 'ab'.repeat(32);
  const r = k.app.runner as unknown as { f: { held: Record<string, unknown>[]; memberAsks?: unknown[] }; save(): void };
  r.f.held[0].members = [{ collective: 'cd'.repeat(32), act: 'ef'.repeat(32), terms: '01'.repeat(32), signature: '02'.repeat(32), public: [1, '03'.repeat(32)], secret, position: 0, added: 1 }];
  r.f.memberAsks = [{ id: '00', app: 'x', appName: 'Dub', identity: a.id, collective: '04'.repeat(32), places: [], at: 1 }];
  r.save();
  k.app.runner.lock();
  // Opened again: dropped, said once.
  const opened = new Runner(k.dir);
  const v = await opened.unlock({ passphrase: PASS });
  assert.equal(v.notice, MEMBER_KEYS_ERASED_SAY);
  assert.equal(v.held.length, 1, 'the identity itself kept');
  // The file sealed again without them: read whole by another opening, no key and no notice left.
  const again = new Runner(k.dir);
  const v2 = await again.unlock({ passphrase: PASS });
  assert.equal(v2.notice, null);
  const whole = JSON.stringify((again as unknown as { f: unknown }).f);
  assert.ok(!whole.includes(secret) && !/members|memberAsks/.test(whole), 'no member key, and no ask, in the file read whole');
  assert.ok(!everything(k.dir).includes(secret), 'nothing of it in the clear in Kišib’s folder');
  void readFileSync;
  void join;
});

test('draft 5, 5.1: a bake is a post (a standing yes for posts signs it); a price tag is money, always asking', async () => {
  const H = homes.map((h) => h.base);
  const a = await dub(H, [relay.base]);
  const words = (await a.c.ask<{ words: string[] }>('carry')).words.join(' ');
  const { k, token, pairing, bindingOf } = await runnerFor([{ id: a.id, words }]);
  await k.c.ask('runner yes', { pairing, kind: 'posts', on: true });
  await refused(k.c.ask('runner yes', { pairing, kind: 'money', on: true }), /always ask/);
  const bake = cborEncode(new Map<number, unknown>([[0, unhex(POST_SPECS.jpeg)], [1, new Uint8Array(32).fill(7)], [2, new Uint8Array(32).fill(8)], [3, 1234]]));
  const b = await k.app.runner.ask(token, { identity: a.id, binding: bindingOf(a.id), line: 'public', sequence: [], spec: SPECS.envelopes, type: 0, payload: bake, public: true }, ORIGIN);
  assert.ok('signed' in b, 'a bake under a standing yes for posts: signed at once');
  const log = (await k.c.ask<RunnerView>('runner state')).signed[0];
  assert.equal(log.kind, 'posts');
  assert.match(log.words.join(' '), /uploaded by this identity \(a bake\).*never withdrawn/);
  const tag = await k.app.runner.ask(token, { identity: a.id, binding: bindingOf(a.id), line: 'public', sequence: [], spec: MIRS.money, type: 5, payload: cborEncode(new Map()), public: true }, ORIGIN);
  assert.ok('asks' in tag, 'a price tag always asks');
  assert.equal(tag.asks.kind, 'money');
});
