// A path to drafting MIPs (F339, "A) only once the dev is ready it truly
// published the specs"): written in the MIP shape, drafts published for
// discussion as signed long-form documents (a reply from Dub shown with
// its draft), and only once ready, the MIP as a specification of kind 8,
// naming its creator and what it would replace, found again by tracking.
// And bug reports (F287): sent from one's own identity, answered by the
// reporting identity, the answer shown.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { MIRS } from '../../genesis/src/core.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { readDocument } from '../../longform/src/act.ts';
import { post } from '../../barebone/src/post.ts';
import { readHeld } from '../../reports/src/read.ts';
import { closeAll, developer, refused, start, type Relay } from './world.ts';
import type { Done, Review } from '../src/shapes.ts';
import type { Tracked } from '../src/track.ts';
import type { MipDraft, Reply } from '../src/mips.ts';

let homes: Relay[];
let relay: Relay;

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
});

// Every app and server this file starts is stopped whatever the outcome, even where one before it fails (Part 4).
after(async () => {
  try {
    await closeAll();
  } finally {
    for (const h of [...homes, relay]) await h?.stop().catch(() => undefined);
  }
});

test('a MIP: the shape, drafts for discussion with a reply from Dub, then published as a specification, found by tracking', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  const d = await developer(H, R);
  const c = d.ummia.c;
  const m = await c.ask<{ key: string; text: string }>('mip new', { title: 'Money, with a clock of its own', forks: 'money' });
  assert.match(m.text, /^# MIP: Money, with a clock of its own\n/);
  assert.match(m.text, new RegExp(`It forks Money MIR \\(${MIRS.money}\\)`));
  for (const h of ['## Purpose', '## What it changes', '## Rules', '## Reasoning', '## Freeze scenarios']) assert.ok(m.text.includes(h), h);
  const shape = await c.ask<{ lines: { text: string; tone?: string }[] }>('mip save', { key: m.key, text: m.text });
  assert.ok(shape.lines.every((l) => l.tone !== 'warn'), JSON.stringify(shape.lines));
  const off = await c.ask<{ lines: { text: string; tone?: string }[] }>('mip save', { key: m.key, text: 'Just words.' });
  assert.ok(off.lines.some((l) => l.tone === 'warn' && /title/.test(l.text)), 'the shape advises');
  const text = m.text.replace('What this proposal is for, in plain words.', 'A clock for Money, so a theft’s window ends at a block.');
  await c.ask('mip save', { key: m.key, text });

  // Draft 1, for discussion: a long-form document, no specification yet.
  const dr = await c.ask<Done>('mip draft', { key: m.key });
  const doc = await readDocument(dr.acts[0], R);
  assert.equal(doc.standing, 'valid');
  assert.equal(doc.formatted, true, 'in the long form cMIP’s format');
  assert.equal(doc.text, text);
  let t = await c.ask<Tracked>('track', {});
  assert.equal(t.mips.flatMap((x) => x.forks).length, 0, 'a draft is no specification');

  // Someone answers it from Dub: the reply shown with its draft.
  const other = await developer(H, R);
  await other.dub.c.ask('post', { text: 'Why a block and not a time?', reply: { id: dr.acts[0], signer: d.id } });
  const rp = await c.ask<{ replies: Record<string, Reply[]> }>('mip replies', { key: m.key });
  assert.equal(rp.replies[dr.acts[0]]?.length, 1, JSON.stringify(rp));
  assert.equal(rp.replies[dr.acts[0]][0].text, 'Why a block and not a time?');
  assert.equal(rp.replies[dr.acts[0]][0].standing, 'valid');

  // Ready: published as a MIP, kind 8, its creator and what it forks; then found by tracking, under the Money MIR.
  const rv = await c.ask<Review>('mip prepare', { key: m.key });
  assert.deepEqual(rv.blocking, []);
  assert.ok(rv.sections[0].lines.some((l) => l.text.includes(`Forks ${MIRS.money}`)));
  const pub = await c.ask<Done>('confirm', { plan: rv.plan, digest: rv.digest });
  const mips = await c.ask<{ drafts: MipDraft[] }>('mips');
  assert.deepEqual(mips.drafts[0].published, { id: pub.acts[0], hash: rv.hash });
  await refused(c.ask('mip save', { key: m.key, text: 'changed' }), /a changed MIP is a new one/);
  t = await c.ask<Tracked>('track', {});
  const fork = t.mips.find((x) => x.root === MIRS.money)!;
  assert.ok(fork, JSON.stringify(t.mips));
  assert.deepEqual(fork.forks.map((f) => [f.hash, f.creator]), [[rv.hash, d.id]]);
});

test('a bug report sent from one’s own identity, read as the reports mirror reads it, and its answer shown', async () => {
  const H = homes.map((h) => h.base);
  const R = [relay.base];
  // The reporting identity: a test identity with an inbox (as at step 17).
  const reporting = TestIdentity.create({ homes: [homes[0].home] });
  await reporting.publishGenesis();
  await reporting.publishRoutes([{ kind: 0, scope: null, hints: R }, { kind: 1, scope: null, hints: R }]);
  const d = await developer(H, R);
  const c = d.ummia.c;
  await refused(c.ask('report send', { text: 'No reporting identity yet' }), /reporting identity’s ID under Settings/);
  await c.ask('settings', { reports: reporting.id });
  const sent = await c.ask<Done>('report send', { text: 'Ummia: the track tab shows nothing\n\nSteps: open it, press Look.' });
  // The reports mirror reads it as a public report, from its reporter's own identity.
  const held = await readHeld(reporting.id, [...R, ...H]);
  assert.deepEqual(held.reports.map((r) => [r.id, r.signer]), [[sent.acts[0], d.id]]);
  // Answered on MOR by the reporting identity; shown in Ummia.
  await post(reporting, { text: 'Thank you: fixed in the next release.', relays: R, refs: [[sent.acts[0], d.id]] as never });
  const r = await c.ask<{ sent: { id: string }[]; answers: { report: string; text: string; standing: string }[] }>('reports');
  assert.deepEqual(r.sent.map((x) => x.id), [sent.acts[0]]);
  assert.deepEqual(r.answers.map((a) => [a.report, a.text, a.standing]), [[sent.acts[0], 'Thank you: fixed in the next release.', 'valid']]);
});
