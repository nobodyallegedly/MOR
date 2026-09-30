// The web reader's logic, end to end in Node: the same code the browser runs,
// with the genesis client's core in place of the browser's. Real homes and a
// real relay on local ports, run from the relay program of step 4. The
// browser itself is tested in browser.test.ts.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ml_kem768_x25519 as noble } from '@noble/post-quantum/hybrid.js';
import * as node from '../../genesis/src/core.ts';
import { SPECS, xwingEncapsulate } from '../../genesis/src/core.ts';
import { TestIdentity, receive } from '../../genesis/src/identity.ts';
import { kexLog } from '../../genesis/src/kex.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { start, type Running } from '../../genesis/test/world.ts';
import { publishDocument } from '../../longform/src/act.ts';
import { post } from '../../barebone/src/post.ts';
import * as web from '../src/web/common.ts';
import { parseSettings } from '../src/settings.ts';
import { makeLink, parseLink, relaysFor } from '../src/link.ts';
import { documents, fingerprint, show, standingWords } from '../src/read.ts';
import { recipient, sendMessage } from '../src/message.ts';
import { documentPage, frontPage } from '../src/view.ts';

const sample = readFileSync(new URL('../../longform/examples/sample.md', import.meta.url), 'utf8').replace(/\n$/, '');
const phone = new Uint8Array(readFileSync(new URL('../../../modules/jpeg/test/fixtures/phone.jpg', import.meta.url)));

let homes: Running[] = [];
let relay: Running;
let owner: TestIdentity;
let other: TestIdentity;
let dir: string;

before(async () => {
  kexLog.recording = true;
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  dir = mkdtempSync(join(tmpdir(), 'mor-reader-test-'));
  owner = TestIdentity.create({ homes: homes.map((h) => h.home) });
  await owner.publishGenesis();
  await owner.publishRoutes([
    { scope: null, hints: [relay.base] },
    { scope: null, hints: [homes[0].base, relay.base], kind: 1 },
  ]);
  await owner.publishEncryptionKey();
  owner.save(join(dir, 'owner.json'));
  other = TestIdentity.create({ homes: homes.map((h) => h.home) });
  await other.publishGenesis();
});

after(async () => {
  for (const r of [...homes, relay]) await r.stop();
});

const settingsFor = (relays: string[]) =>
  parseSettings({
    identity: owner.id,
    name: 'Nobody, allegedly',
    relays,
    email: 'someone@example.org',
    links: [{ label: 'The code', href: 'https://github.com/nobodyallegedly/mor' }],
    messageHomes: homes.map((h) => h.base),
  });

test('the settings: checked, never guessed', () => {
  const s = settingsFor([relay.base]);
  assert.equal(s.identity, owner.id);
  assert.deepEqual(s.messageHomes, homes.map((h) => h.base));
  const good = { identity: owner.id, relays: ['https://home1.dubsar.org/'] };
  assert.deepEqual(parseSettings(good).relays, ['https://home1.dubsar.org'], 'a trailing slash is dropped');
  assert.equal(parseSettings(good).email, null);
  assert.throws(() => parseSettings({ ...good, identity: 'abc' }), /identity/);
  assert.throws(() => parseSettings({ ...good, relays: [] }), /relays/);
  assert.throws(() => parseSettings({ ...good, relays: ['http://home1.dubsar.org'] }), /relays/, 'plain http only on this machine');
  assert.throws(() => parseSettings({ ...good, links: [{ label: 'x', href: 'javascript:alert(1)' }] }), /link/);
  assert.throws(() => parseSettings({ ...good, email: 'not an address' }), /email/);
});

test('a link carries the act id in the fragment, and relays beside the reader\'s own', () => {
  const id = 'ab'.repeat(32);
  assert.deepEqual(parseLink(''), { act: null, relays: [] });
  assert.deepEqual(parseLink(`#${id}`), { act: id, relays: [] });
  const l = makeLink('https://reader.dubsar.org/#old', id, ['https://relay.example.org']);
  assert.equal(l, `https://reader.dubsar.org/#${id}?r=https%3A%2F%2Frelay.example.org`);
  const p = parseLink(new URL(l).hash);
  assert.deepEqual(p, { act: id, relays: ['https://relay.example.org'] });
  assert.deepEqual(relaysFor(['https://home1.dubsar.org'], p), ['https://home1.dubsar.org', 'https://relay.example.org']);
  assert.deepEqual(parseLink(`#${id}?r=http://evil.example&r=javascript:x`).relays, [], 'only https relays are asked');
  assert.throws(() => parseLink('#not-an-id'), /act id/);
  assert.equal(parseLink(`#${id.toUpperCase()}`).act, id);
});

test('the browser\'s helpers give the same answers as the genesis client\'s core', () => {
  assert.deepEqual(web.SPECS, node.SPECS);
  assert.deepEqual(web.IDENTITY_TYPES, node.IDENTITY_TYPES);
  assert.deepEqual(web.ENVELOPE_TYPES, node.ENVELOPE_TYPES);
  for (const n of [0, 1, 31, 32, 1000, 70_000]) {
    const b = node.randomBytes(n);
    assert.equal(web.hex(b), node.hex(b));
    assert.deepEqual(web.unhex(node.hex(b)), node.unhex(node.hex(b)));
    assert.equal(web.base64(b), node.base64(b));
    assert.equal(web.sha256(b), node.sha256(b));
  }
  assert.equal(web.sha256('é, 😀'), node.sha256('é, 😀'));
  assert.throws(() => web.unhex('0g'));
});

test('a long-form document shows verified, by the identity the reader names, with its title', async () => {
  const { id } = await publishDocument(owner, sample, [relay.base]);
  owner.save(join(dir, 'owner.json'));
  const s = await show(id, [relay.base], owner.id);
  assert.equal(s.post.standing, 'valid');
  assert.equal(s.byOwner, true);
  assert.equal(s.title, 'A long-form test document');
  const html = documentPage(s, settingsFor([relay.base]));
  assert.ok(html.includes(fingerprint(owner.id)), 'the whole fingerprint is shown');
  assert.ok(html.includes(standingWords('valid').words));
  assert.ok(html.includes('<h1'), 'rendered in the long-form format');
  assert.ok(html.includes('<summary>Plain text</summary>'), 'the plain text one tap away');
  assert.ok(html.includes('mailto:someone@example.org'));
  assert.ok(html.includes('id="message"'), 'the message form');
});

test('a post by another identity, with a picture, shows verified and says it is not by the reader\'s identity', async () => {
  const p = await post(other, { text: 'A photo, not by the owner.', jpeg: phone, relays: [relay.base] });
  const s = await show(p.id, [relay.base], owner.id);
  assert.equal(s.post.standing, 'valid');
  assert.equal(s.byOwner, false);
  assert.equal(s.title, 'A photo, not by the owner.');
  const pic = s.post.refs[0];
  assert.equal(pic.kind, 'picture');
  const html = documentPage(s, settingsFor([relay.base]));
  assert.ok(html.includes('Not the identity this reader names'));
  assert.ok(html.includes('data:image/jpeg;base64,'), 'the verified picture is shown');
});

test('an act that is not there, or not a text act, is not shown, with the reason', async () => {
  await assert.rejects(show('00'.repeat(32), [relay.base], owner.id), /not found/);
  await assert.rejects(show(owner.f.routes!.act, homes.map((h) => h.base), owner.id), /not a text act/);
});

test('the front page lists the identity\'s documents, newest first, from every relay, once each', async () => {
  const second = await publishDocument(owner, '# A second document\n\nNewer.', [relay.base, homes[1].base]);
  owner.save(join(dir, 'owner.json'));
  const ids = await documents(owner.id, [relay.base, homes[1].base]);
  assert.equal(ids[0], second.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(ids.length, 2, 'the other identity\'s post is not listed');
  const f = frontPage(settingsFor([relay.base]));
  assert.ok(f.includes(fingerprint(owner.id)) && f.includes('https://github.com/nobodyallegedly/mor'));
  assert.deepEqual(await documents(owner.id, ['http://127.0.0.1:9']), [], 'a relay that is away proves nothing');
});

test('a visitor sends a message over MOR; only the owner opens it, and it verifies', async () => {
  const to = await recipient(owner.id, [relay.base]);
  assert.equal(to.warning, null);
  assert.deepEqual(to.inbox, [homes[0].base, relay.base]);
  const text = 'Hello from a visitor.\r\nWith a second line.   ';
  const sent = await sendMessage({ text, to, homes: homes.map((h) => h.base) });
  assert.deepEqual(sent.delivered, [homes[0].base, relay.base]);
  assert.deepEqual(sent.failed, []);

  // What the relay holds: a container for the owner; not the sender, not the text.
  const page = await relayAt(relay.base).feed({ to: owner.id });
  const item = page.items.find((i) => i.kind === 'sealed')!;
  assert.ok(!Buffer.from(item.item).includes(Buffer.from(sent.sender, 'hex')), 'the sender is hidden from relays');
  assert.ok(!Buffer.from(item.item).includes('Hello from a visitor'), 'the text is hidden from relays');

  // The owner reads the inbox with the genesis client: opened, verified, the text composed canonical.
  const me = TestIdentity.load(join(dir, 'owner.json'));
  const got = await me.readInbox({ inbox: [relay.base], senderHints: [relay.base] });
  const m = got.find((g) => g.act === sent.message)!;
  assert.ok(m.opened);
  assert.equal(m.from, sent.sender);
  assert.equal(m.status, 'valid');
  assert.equal(m.text, 'Hello from a visitor.\nWith a second line.');

  // Any other key cannot open it.
  const wrong = await receive(item.item, owner.id, [node.newEncryptionSecret()], [relay.base]);
  assert.equal(wrong.opened, false);
});

test('the owner reads messages from the command line, with invisible characters shown', async () => {
  const to = await recipient(owner.id, [relay.base]);
  await sendMessage({ text: 'Look: ‮evil‬ and a bell \u0007.', to, homes: homes.map((h) => h.base) });
  const out = execFileSync(
    'node',
    ['--import', 'tsx', 'src/cli.ts', 'inbox', '--file', join(dir, 'owner.json'), '--at', relay.base],
    { cwd: new URL('../../genesis/', import.meta.url), encoding: 'utf8' },
  );
  assert.match(out, /a message:\n {2}\| Hello from a visitor\./);
  assert.ok(out.includes('\\u{202e}evil\\u{202c}'), out);
  assert.ok(!out.includes('‮') && !out.includes('\u0007'));
});

test('nothing is sent to an identity with no encryption key, or when no home takes the one-time identity', async () => {
  await assert.rejects(recipient(other.id, [relay.base]), /no encryption key/);
  const to = await recipient(owner.id, [relay.base]);
  const before = (await relayAt(relay.base).feed({ to: owner.id })).items.length;
  await assert.rejects(sendMessage({ text: 'x', to, homes: [relay.base] }), /no home/, 'a basic relay is not a home');
  await assert.rejects(sendMessage({ text: 'x', to, homes: ['http://127.0.0.1:9'] }), /no home/);
  await assert.rejects(sendMessage({ text: ' \n ', to, homes: homes.map((h) => h.base) }), /empty/);
  assert.equal((await relayAt(relay.base).feed({ to: owner.id })).items.length, before);
});

test('every key exchange in these tests agrees with a second implementation (noble)', () => {
  const enc = kexLog.entries.filter((e) => e.kind === 'encapsulate');
  const dec = kexLog.entries.filter((e) => e.kind === 'decapsulate');
  assert.ok(enc.length >= 2 && dec.length >= 2, `${enc.length} encapsulations, ${dec.length} decapsulations`);
  for (const e of kexLog.entries) {
    if (e.kind === 'encapsulate') {
      const a = xwingEncapsulate(e.publicKey, e.eseed) as { ct: Uint8Array; ss: Uint8Array };
      const b = noble.encapsulate(e.publicKey, e.eseed);
      assert.deepEqual(a.ct, e.ct);
      assert.deepEqual(b.cipherText, e.ct);
    } else {
      assert.deepEqual(node.xwingDecapsulate(e.secret, e.ct), noble.decapsulate(e.ct, e.secret));
    }
  }
  assert.ok(SPECS.text);
});
