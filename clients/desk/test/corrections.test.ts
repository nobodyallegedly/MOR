// Corrections (decided by Nobody, allegedly, 17 October 2026; the
// corrections cMIP, draft 2, F344, F347), in Edubba against real homes and a relay
// on local ports: an identity corrects its own post by a new act naming the
// old one; the correction is labelled wherever it is shown (Edubba, the
// feed Dub reads, Dub's page, the connector's reading) and the original
// stays signed, "corrected by"; someone else's act is never corrected, and a
// stranger's text in the corrections format corrects nothing. A long-form
// act is corrected in long form, and rendered as long form (F347).

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SPECS, cborDecode, cborEncode, describeAct, hex, sha256 } from '../../genesis/src/core.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { start, type Running as Relay } from '../../genesis/test/world.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { post as postAs } from '../../barebone/src/post.ts';
import { CORRECTIONS_SPEC, LONG_FORM_CORRECTION } from '../../barebone/src/corrections.ts';
import { POST_SPECS } from '../../barebone/src/specs.ts';
import { readPost } from '../../barebone/src/post.ts';
import { titleOf } from '../../reader/src/read.ts';
import { feedHtml } from '../../site/src/shell/feed-view.ts';
import { readFeed } from '../../site/src/feed.ts';
import { readAct } from '../../connector/src/read.ts';
import { post as postHtml } from '../../dub/src/page/view.ts';
import { serve, type Running } from '../src/server.ts';
import { Client, newKey, type Done } from '../src/page/api.ts';

let homes: Relay[];
let relay: Relay;
let app: Running;
let c: Client;
let NA: string;
let wrong: string;
let fix: string;

before(async () => {
  homes = [await start('home')];
  relay = await start('relay');
  const top = mkdtempSync(join(tmpdir(), 'edubba-corrections-'));
  app = await serve({ dir: join(top, 'edubba'), port: 0, drafts: join(top, 'drafts'), machineEvery: 0 });
  c = await Client.open(await newKey(), app.base);
  await c.ask('pair', { code: app.access.newCode(), label: 'test' });
  await c.ask('settings', { homes: homes.map((h) => h.base), relays: [relay.base], via: [], drafts: '' });
  NA = (await c.ask<Done>('identity', { name: 'Nobody, allegedly', linked: false })).acts[0];
  wrong = (await app.desk.signAndSend(NA, { spec: SPECS.text, type: 0, payload: cborEncode(new Map([[0, 'The meeting is on the 12th.']])) as Uint8Array, public: true, to: [], refs: [] })).id;
});

after(async () => {
  await app?.close();
  for (const h of [...homes, relay]) await h.stop();
});

test('an identity corrects its own post: a new act in the corrections format naming the old first; the old one stays as signed', async () => {
  const before = await relayAt(relay.base).getAct(wrong);
  const d = await c.ask<Done>('identity correct', { identity: NA, act: wrong, text: 'The meeting is on the 21st.' });
  assert.match(d.title, /Correction signed/);
  fix = d.acts[0];
  const x = describeAct((await relayAt(relay.base).getAct(fix))!) as { signer: string; refs: string[]; refSigners: string[]; payload: Uint8Array };
  assert.equal(x.signer, NA);
  assert.equal(x.refs[0], wrong);
  assert.equal(x.refSigners[0], NA);
  assert.equal(hex((cborDecode(x.payload) as Map<number, Uint8Array>).get(1)!), CORRECTIONS_SPEC, 'its format: the corrections cMIP');
  assert.deepEqual(await relayAt(relay.base).getAct(wrong), before, 'the original unchanged');
});

test('labelled wherever it is shown: Edubba’s list, the feed Dub reads, Dub’s page, the connector', async () => {
  const p = await c.ask<{ items: { id: string; corrects: string | null; correctedBy: string[] }[] }>('identity posts', { identity: NA });
  assert.equal(p.items.find((i) => i.id === fix)!.corrects, wrong);
  assert.deepEqual(p.items.find((i) => i.id === wrong)!.correctedBy, [fix]);
  const f = await readFeed([{ identity: NA, name: null }], [relay.base, homes[0].base]);
  const item = f.posts.find((x) => x.id === fix)!;
  assert.equal(item.corrects, wrong);
  const shown = { id: fix, who: { id: NA, short: 'NA', names: ['Nobody, allegedly'], pet: null, me: true, followed: false, muted: false }, standing: 'valid', text: 'The meeting is on the 21st.', doc: null, pictures: [], answers: [], toMe: false, via: 'feed' as const, problem: null, seen: true, corrects: wrong, correctedBy: [] };
  assert.match(postHtml(shown), /<strong>Correction<\/strong> of .*which stays as signed/);
  assert.match(postHtml({ ...shown, id: wrong, corrects: null, correctedBy: [fix] }), /Corrected by .*: shown as it was signed/);
  const told = await readAct(fix, [relay.base, homes[0].base]);
  assert.equal(told.title, 'A text: a correction');
  assert.ok(told.sections.some((s) => s.lines.some((l) => /^Correction: it corrects act/.test(l.text))), JSON.stringify(told.sections));
});

test('never someone else’s act; a stranger’s text in the corrections format corrects nothing', async () => {
  const stranger = TestIdentity.create({ homes: app.store.settings().homes, via: {} });
  await stranger.publishGenesis();
  await stranger.publishRoutes([{ scope: null, hints: [relay.base], kind: 0 }]);
  const theirs = await postAs(stranger, { text: 'Not yours.', relays: [relay.base] });
  await assert.rejects(c.ask('identity correct', { identity: NA, act: theirs.id, text: 'A correction of someone else.' }), /Only its own acts are corrected/);
  const fake = await postAs(stranger, { text: 'I correct Nobody, allegedly.', relays: [relay.base], corrects: [wrong, NA] });
  const f = await readFeed([{ identity: stranger.id, name: null }], [relay.base, homes[0].base]);
  assert.equal(f.posts.find((x) => x.id === fake.id)!.corrects, undefined, 'no correction: not its signer’s act');
  const told = await readAct(fake.id, [relay.base, homes[0].base]);
  assert.equal(told.title, 'A text');
});

test('a long-form act corrected in long form (F347, F348): in Edubba and through a collective’s way of posting; rendered as long form, labelled', async () => {
  const hints = [relay.base, homes[0].base];
  const doc = (await app.desk.signAndSend(NA, { spec: SPECS.text, type: 0, payload: cborEncode(new Map<number, unknown>([[0, '# Opening hours\n\nThe house opens at *nine*.'], [1, Buffer.from(POST_SPECS.longform, 'hex')]])) as Uint8Array, public: true, to: [], refs: [] })).id;
  const d = await c.ask<Done>('identity correct', { identity: NA, act: doc, text: '# Opening hours\n\nThe house opens at *ten*.' });
  assert.ok(d.lines.some((l) => /in long form, as the act it corrects/.test(l.text)), JSON.stringify(d.lines));
  const lf = d.acts[0];
  const x = describeAct((await relayAt(relay.base).getAct(lf))!) as { payload: Uint8Array };
  assert.equal(hex((cborDecode(x.payload) as Map<number, Uint8Array>).get(1)!), LONG_FORM_CORRECTION, 'its format: the long-form correction');
  assert.equal(LONG_FORM_CORRECTION, sha256('Long-form corrections cMIP, draft 1, test value until publication'), 'a cMIP of its own (F348), not a name derived from the corrections cMIP');
  assert.notEqual(LONG_FORM_CORRECTION, CORRECTIONS_SPEC);
  // A plain act is still corrected plainly (the first test); a long-form one in long form, by the shared post() too (a collective's way).
  const stranger = TestIdentity.create({ homes: app.store.settings().homes, via: {} });
  await stranger.publishGenesis();
  await stranger.publishRoutes([{ scope: null, hints: [relay.base], kind: 0 }]);
  const theirDoc = await postAs(stranger, { text: '# Notes\n\nOne *two*.', format: POST_SPECS.longform, relays: [relay.base] });
  const theirFix = await postAs(stranger, { text: '# Notes\n\nOne *three*.', relays: [relay.base], corrects: [theirDoc.id, stranger.id] });
  assert.equal((await readPost(theirFix.id, hints)).format, LONG_FORM_CORRECTION);
  // Rendered as long form: the reader's title, the site's feed, the connector; labelled a correction.
  const shown = await readPost(lf, hints);
  assert.equal(titleOf(shown), 'Opening hours');
  const f = await readFeed([{ identity: NA, name: null }], hints);
  assert.equal(f.posts.find((p) => p.id === lf)!.corrects, doc);
  const html = feedHtml(f, f.authors, '');
  assert.match(html, /<em>ten<\/em>/, 'emphasis rendered, as long form');
  const told = await readAct(lf, hints);
  assert.equal(told.title, 'A text: a correction');
  assert.ok(told.sections.some((s) => s.lines.some((l) => /^Correction: it corrects act .*written in long form/.test(l.text))), JSON.stringify(told.sections));
});
