// Roadmap step 11c, "done when": a draft prepared by Claude reaches the
// desk, is read in plain words, sent back with a note, reworked, approved,
// and accepted by a relay; a Law act cannot be prepared; and an identity's
// received interactions are sorted into to answer, answered and ignored.
// Claude's side is the connector, driven over MCP as Claude's app drives
// it; the owner's side is the desk's program, through the page's requests.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { IDENTITY_TYPES, SPECS, WITNESS_EXPLANATION, cborEncode, signaturePayload, unhex } from '../../genesis/src/core.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { textPayload } from '../../barebone/src/post.ts';
import { POST_SPECS } from '../../barebone/src/specs.ts';
import { readPost } from '../../barebone/src/post.ts';
import { LAW_TYPES, REPO_SPECS } from '../../repo/src/specs.ts';
import { decodeDraft, encodeDraft, loadAnswer, loadLinked, saveDraft, type Draft } from '../../connector/src/draft.ts';
import { DESK_SPECS } from '../src/specs.ts';
import type { Done } from '../src/page/api.ts';
import { handed, state, waiting, words, world, type World } from './setup.ts';

let w: World;
/** The author's identity, and "Machine, allegedly", both held at the desk. */
let me: string;
let machine: string;
/** Machine's post, published in the first test. */
let post: string;

before(async () => {
  w = await world();
  const a = await w.client.ask<Done>('identity', { name: 'Me', linked: false });
  const b = await w.client.ask<Done>('identity', { name: 'Machine, allegedly', linked: true });
  me = a.acts[0];
  machine = b.acts[0];
});

after(async () => {
  await w?.stop();
});

const ask = (tool: string, args: object) => w.claude.ask(tool, args);

test('Claude may prepare only for identities linked at the desk, and knows them by name', async () => {
  assert.deepEqual(loadLinked(w.drafts), [{ id: machine, name: 'Machine, allegedly' }]);
  const r = await ask('mor_drafts', {});
  assert.match(r.text, new RegExp(`Machine, allegedly: ${machine}`));
  const refused = await ask('mor_prepare_post', { signer: me, text: 'Not linked.' });
  assert.equal(refused.isError, true);
  assert.match(refused.text, /is not linked to Claude at the desk/);
  assert.equal(readdirSync(w.drafts).filter((f) => f.endsWith('.mor-draft')).length, 0);
});

test('a draft from Claude reaches the desk, is sent back with a note, reworked, approved and accepted by a relay', async () => {
  // Claude prepares a post for Machine, allegedly, by name.
  const first = await ask('mor_prepare_post', { signer: 'Machine, allegedly', text: 'Hello, word.', note: 'A first post, as you asked.' });
  assert.equal(first.isError, false, first.text);
  assert.match(first.text, /Waiting at the desk/);
  const d1 = handed(first.text);

  // The desk shows it, read again from its bytes, with the same digest.
  let ds = await waiting(w.client);
  assert.equal(ds.length, 1);
  assert.equal(ds[0].digest, d1);
  assert.equal(ds[0].signer, machine);
  assert.match(ds[0].signerName, /^Machine, allegedly \[/);
  assert.equal(ds[0].kind, 'post');
  assert.deepEqual(ds[0].blocking, []);
  assert.match(words(ds[0]), /Signing publishes this text, publicly/);
  assert.equal(ds[0].plain[0].text, 'Hello, word.');
  assert.equal(ds[0].note, 'A first post, as you asked.');

  // Not yet answered: Claude hears it is waiting.
  assert.match((await ask('mor_drafts', { draft: d1.slice(0, 12) })).text, /Waiting at the desk/);

  // The owner sends it back with a note. Nothing is signed.
  const seq = () => w.app.store.identity(machine).f.sequence.length;
  const before = seq();
  const back = await w.client.ask<Done>('send back', { digest: d1, note: 'Hello, world: the word is world. And sign it as the machine you are.' });
  assert.match(back.title, /Sent back/);
  assert.equal(seq(), before);
  assert.equal(loadAnswer(w.drafts, d1)?.verdict, 'sent back');
  assert.equal((await waiting(w.client)).length, 0);

  // The connector returns the note to Claude.
  const told = await ask('mor_drafts', { draft: d1.slice(0, 12) });
  assert.match(told.text, /SENT BACK by the owner/);
  assert.match(told.text, /> Hello, world: the word is world\. And sign it as the machine you are\./);

  // Claude reworks it, naming the draft it replaces.
  const second = await ask('mor_prepare_post', { signer: machine, text: 'Hello, world. Machine, allegedly, speaking.', reworks: d1.slice(0, 12), note: 'Corrected as you said.' });
  assert.equal(second.isError, false, second.text);
  assert.match(second.text, new RegExp(`It reworks draft ${d1.slice(0, 12)}`));
  const d2 = handed(second.text);
  // A draft still waiting, or approved, is not reworked.
  const early = await ask('mor_prepare_post', { signer: machine, text: 'x', reworks: d2.slice(0, 12) });
  assert.match(early.text, /was not sent back by the owner \(it is still waiting at the desk\)/);

  ds = await waiting(w.client);
  assert.equal(ds.length, 1);
  assert.equal(ds[0].digest, d2);
  assert.equal(ds[0].reworks?.digest, d1);
  assert.match(ds[0].reworks!.note, /the word is world/);
  assert.equal(ds[0].reworks!.text, 'Hello, word.');

  // Approved: signed as the next act of Machine's own sequence, and sent.
  const ok = await w.client.ask<Done>('approve', { digest: d2 });
  post = ok.acts[0];
  assert.equal(seq(), before + 1);
  assert.equal(w.app.store.identity(machine).f.sequence.at(-1), post);
  assert.ok(ok.lines.some((l) => l.text === `${w.relay.base}: accepted`), JSON.stringify(ok.lines));

  // The relay holds it; any reader verifies it.
  assert.ok(await relayAt(w.relay.base).getAct(post));
  const shown = await readPost(post, [w.relay.base]);
  assert.equal(shown.standing, 'valid');
  assert.equal(shown.text, 'Hello, world. Machine, allegedly, speaking.');
  assert.equal(shown.signer, machine);

  // Claude hears it was approved, and the connector checks the act at the relay against the draft.
  const done = await ask('mor_drafts', { draft: d2.slice(0, 12) });
  assert.match(done.text, new RegExp(`APPROVED by the owner, signed at the desk: act ${post}`));
  assert.match(done.text, new RegExp(`Fetched back from the relays: it says exactly what draft ${d2.slice(0, 12)} said`));
  assert.match(done.text, /A text, verified/);

  // Answered once: not approved twice, nor sent back after.
  await assert.rejects(w.client.ask('approve', { digest: d2 }), /already answered/);
  await assert.rejects(w.client.ask('send back', { digest: d2, note: 'too late' }), /already answered/);
  const h = (await state(w.client)).history.map((x) => x.verdict);
  assert.deepEqual(h.slice(0, 2), ['approved', 'sent back']);
});

test('a Law act cannot be prepared: the connector has no tool for one, and the desk refuses one written by hand', async () => {
  const { tools } = await w.claude.client.listTools();
  assert.deepEqual(tools.map((t) => t.name).sort(), ['mor_drafts', 'mor_identity', 'mor_prepare_message', 'mor_prepare_picture', 'mor_prepare_post', 'mor_prepare_withdrawal', 'mor_read']);
  for (const t of tools) {
    for (const k of Object.keys((t.inputSchema as { properties?: object }).properties ?? {})) assert.doesNotMatch(k, /key|secret|seed|identity_file|password/i, `${t.name} takes ${k}`);
  }
  // Something else on the machine writes a Law signature, as a draft, into the folder.
  const law: Draft = {
    signer: machine,
    spec: REPO_SPECS.law,
    type: LAW_TYPES.signature,
    payload: signaturePayload(post),
    public: true,
    refs: [],
    objects: [[post, post]],
    relays: [w.relay.base],
    to: [],
    media: [],
    note: 'Please sign this agreement.',
    reworks: null,
  };
  const s = saveDraft(w.drafts, law);
  const ds = await waiting(w.client);
  const d = ds.find((x) => x.digest === s.digest)!;
  assert.equal(d.kind, 'refused');
  assert.match(d.blocking.join(' '), /It is a Law act .* Claude prepares acts of the Text and Envelope layers only: posts, publications, withdrawals and messages/);
  const before = w.app.store.identity(machine).f.sequence.length;
  await assert.rejects(w.client.ask('approve', { digest: s.digest }), /This cannot be signed: It is a Law act/);
  assert.equal(w.app.store.identity(machine).f.sequence.length, before, 'nothing signed');
  await w.client.ask('decline', { digest: s.digest, note: '' });
  // An Identity act, and a key delivery, likewise.
  for (const [spec, type] of [
    [SPECS.identity, 3],
    [POST_SPECS.envelope, 1],
  ] as [string, number][]) {
    const x = saveDraft(w.drafts, { ...law, spec, type, payload: cborEncode(new Map()), objects: [], note: null });
    const v = (await waiting(w.client)).find((y) => y.digest === x.digest)!;
    assert.equal(v.kind, 'refused', words(v));
    await assert.rejects(w.client.ask('approve', { digest: x.digest }), /This cannot be signed/);
    await w.client.ask('decline', { digest: x.digest, note: '' });
  }
});

test('what is approved is the draft shown: a file changed after it was shown is refused', async () => {
  const p = await ask('mor_prepare_post', { signer: machine, text: 'An honest text.' });
  const digest = handed(p.text);
  const file = join(w.drafts, `${digest}.mor-draft`);
  const d = decodeDraft(new Uint8Array(readFileSync(file)));
  // The file is replaced by another draft under the same name.
  writeFileSync(file, encodeDraft({ ...d, payload: textPayload('A changed text.') }));
  const ds = await waiting(w.client);
  assert.match(ds.find((x) => x.digest === digest)!.blocking.join(' '), /is not the draft its name says/);
  const before = w.app.store.identity(machine).f.sequence.length;
  await assert.rejects(w.client.ask('approve', { digest }), /is not the draft its name says/);
  assert.equal(w.app.store.identity(machine).f.sequence.length, before, 'nothing signed');
  // Put back, and declined, so it waits no more.
  writeFileSync(file, encodeDraft(d));
  await w.client.ask('decline', { digest, note: 'not now' });
  assert.match((await ask('mor_drafts', { draft: digest.slice(0, 12) })).text, /DECLINED by the owner\. Nothing was signed\. The owner's note:\n\n> not now/);
});

test('a picture and a withdrawal, prepared by Claude and approved at the desk', async () => {
  const jpeg = join(import.meta.dirname, '../../../modules/jpeg/test/fixtures/phone.jpg');
  const p = await ask('mor_prepare_picture', { signer: machine, file: jpeg });
  assert.equal(p.isError, false, p.text);
  assert.match(p.text, /taken out: the place the picture was taken \(GPS\)/);
  const digest = handed(p.text);
  const d = (await waiting(w.client)).find((x) => x.digest === digest)!;
  assert.equal(d.kind, 'picture');
  assert.deepEqual(d.blocking, []);
  assert.match(d.picture!.src, /^data:image\/jpeg;base64,\/9j\//);
  assert.match(words(d), /stripped to the picture alone/);
  const ok = await w.client.ask<Done>('approve', { digest });
  const publication = ok.acts[0];
  assert.match(ok.lines.map((l) => l.text).join('\n'), /accepted, and the picture/);

  // A post showing it, then the picture withdrawn.
  const withPic = await ask('mor_prepare_post', { signer: machine, text: 'A picture.', refs: [publication] });
  await w.client.ask('approve', { digest: handed(withPic.text) });
  const shown = await readPost(w.app.store.identity(machine).f.sequence.at(-1)!, [w.relay.base]);
  assert.equal(shown.refs[0].kind, 'picture');
  assert.equal(shown.refs[0].kind === 'picture' && shown.refs[0].problem, null);
  assert.equal(shown.refs[0].kind === 'picture' && shown.refs[0].standing, 'valid');

  const wd = await ask('mor_prepare_withdrawal', { signer: machine, publication });
  assert.equal(wd.isError, false, wd.text);
  assert.match(wd.text, /Signing withdraws a publication/);
  await w.client.ask('approve', { digest: handed(wd.text) });
  const after = await readPost(w.app.store.identity(machine).f.sequence.at(-2)!, [w.relay.base]);
  assert.ok(after.refs[0].kind === 'picture' && after.refs[0].withdrawn, 'the post no longer shows the picture: withdrawn');

  // A publication it did not sign is not withdrawn: refused before any draft.
  const other = TestIdentity.create({ homes: w.homes.map((h) => h.home), scheme: 3 });
  await other.publishGenesis();
  const theirs = await other.publish(POST_SPECS.envelope, 0, cborEncode(new Map<number, unknown>([[0, unhex(POST_SPECS.jpeg)], [1, new Uint8Array(32)], [2, new Uint8Array(32)], [3, 1], [4, new Uint8Array(24)]])), { public: true, relays: [w.relay.base] });
  const no = await ask('mor_prepare_withdrawal', { signer: machine, publication: theirs.id });
  assert.match(no.text, /did not sign that publication and is not the one it was made for/);
  assert.match(no.text, /No draft was written/);
});

test("an identity's received interactions: messages, replies, acknowledgements and payments, sorted", async () => {
  // Linked now: Claude prepares a message from the author to Machine, allegedly.
  await w.client.ask('link', { id: me, on: true });
  const m = await ask('mor_prepare_message', { signer: me, to: machine, text: 'A word for the machine, privately.' });
  assert.equal(m.isError, false, m.text);
  assert.match(m.text, /Signing sends this text, privately/);
  const md = (await waiting(w.client)).find((x) => x.digest === handed(m.text))!;
  assert.equal(md.kind, 'message');
  assert.deepEqual(md.blocking, []);
  const sent = await w.client.ask<Done>('approve', { digest: md.digest });
  assert.ok(sent.lines.some((l) => /inbox .*: sealed and delivered/.test(l.text)), JSON.stringify(sent.lines));

  // Someone else, outside the desk: a reply to Machine's post, an acknowledgement of it, and a payment claim, each addressed to it.
  const inbox = [w.relay.base];
  const other = TestIdentity.create({ homes: w.homes.map((h) => h.home), scheme: 3 });
  await other.publishGenesis();
  for (const a of other.chainActs()) await relayAt(w.relay.base).putAct(a);
  await other.publish(POST_SPECS.text, 0, textPayload('A fine first post.'), { public: true, relays: inbox, to: [machine], refs: [post] });
  // F110: a text act may not acknowledge; the genesis client refuses to sign one. Reliance is a witness act.
  await assert.rejects(other.publish(POST_SPECS.text, 0, textPayload('Received.'), { public: true, relays: inbox, to: [machine], acks: [post] }), /witness act/);
  await other.publish(SPECS.identity, IDENTITY_TYPES.witness, cborEncode(new Map()), { public: true, relays: inbox, to: [machine], acks: [post] });
  await other.publish(DESK_SPECS.finance, 3, cborEncode(new Map<number, unknown>([[2, unhex(machine)]])), { public: true, relays: inbox, to: [machine] });

  const r = await w.client.ask<{ added: number; problems: string[] }>('refresh', { identity: machine });
  assert.deepEqual(r.problems, []);
  assert.equal(r.added, 4);
  let got = (await state(w.client)).identities.find((i) => i.id === machine)!.received;
  const kind = (k: string) => got.find((x) => x.kind === k)!;
  assert.equal(kind('message').text, 'A word for the machine, privately.');
  assert.equal(kind('message').from, me);
  assert.equal(kind('message').private, true);
  assert.equal(kind('message').standing, 'valid');
  assert.equal(kind('reply').text, 'A fine first post.');
  assert.deepEqual(kind('reply').answers, [post]);
  assert.deepEqual(kind('acknowledgement').acknowledges, [post]);
  assert.equal(kind('acknowledgement').witness, true);
  assert.equal(kind('acknowledgement').standing, 'valid');
  assert.equal(kind('payment').from, other.id);
  assert.match(kind('payment').problem!, /does not read Finance yet/);
  assert.ok(got.every((x) => x.sorted === 'new'));

  // The owner sorts them.
  const sort = (k: string, sorted: string) => w.client.ask('sort', { identity: machine, key: kind(k).key, sorted });
  await sort('message', 'to answer');
  await sort('reply', 'answered');
  await sort('acknowledgement', 'ignored');
  await sort('payment', 'to answer');
  await assert.rejects(w.client.ask('sort', { identity: machine, key: kind('reply').key, sorted: 'deleted' }), /sort into one of/);

  // Looking again finds nothing new, and keeps the sorting.
  const again = await w.client.ask<{ added: number }>('refresh', { identity: machine });
  assert.equal(again.added, 0);
  got = (await state(w.client)).identities.find((i) => i.id === machine)!.received;
  assert.deepEqual(
    Object.fromEntries(got.map((x) => [x.kind, x.sorted])),
    { message: 'to answer', reply: 'answered', acknowledgement: 'ignored', payment: 'to answer' },
  );
  // Machine relies on the reply it received: a witness act, only once the explanation was shown (F110).
  await assert.rejects(w.client.ask('witness', { identity: machine, act: kind('reply').act, shown: 'Like' }), /shown what it does/);
  const wit = await w.client.ask<{ id: string }>('witness', { identity: machine, act: kind('reply').act, shown: WITNESS_EXPLANATION });
  assert.match(wit.id, /^[0-9a-f]{64}$/);

  // The author's own identity received nothing.
  assert.equal((await w.client.ask<{ added: number }>('refresh', { identity: me })).added, 0);
});

test('unlinking an identity at the desk stops Claude preparing for it, and the desk refuses its drafts', async () => {
  const p = await ask('mor_prepare_post', { signer: me, text: 'Prepared while linked.' });
  const digest = handed(p.text);
  await w.client.ask('link', { id: me, on: false });
  assert.deepEqual(loadLinked(w.drafts), [{ id: machine, name: 'Machine, allegedly' }]);
  assert.match((await ask('mor_prepare_post', { signer: me, text: 'x' })).text, /is not linked to Claude/);
  const d = (await waiting(w.client)).find((x) => x.digest === digest)!;
  assert.match(d.blocking.join(' '), /is not linked to Claude/);
  await assert.rejects(w.client.ask('approve', { digest }), /not linked to Claude/);
  assert.equal(existsSync(join(w.drafts, `${digest}.mor-answer`)), false);
});
