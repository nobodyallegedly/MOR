// A long-form document as a MOR act, end to end: a test identity publishes
// it on a relay, and a reader who knows only the act's id and the relay
// fetches it, verifies it through the signer's identity chain, and renders
// it, with the plain text always available. Real homes and a real relay on
// local ports, run from the relay program of step 4.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { checkText, describeAct } from '../../genesis/src/core.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { start, type Running } from '../../genesis/test/world.ts';
import { publishDocument, readDocument, textPayload } from '../src/act.ts';
import { checkBound, parse, shownText, title } from '../src/format.ts';
import { plainHtml, renderHtml, renderPage } from '../src/html.ts';
import { LONGFORM_SPECS, TEXT_ACT } from '../src/specs.ts';

let homes: Running[] = [];
let relay: Running;
let author: TestIdentity;
const sample = readFileSync(new URL('../examples/sample.md', import.meta.url), 'utf8').replace(/\n$/, '');

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  author = TestIdentity.create({ homes: homes.map((h) => h.home) });
  await author.publishGenesis();
});

after(async () => {
  for (const r of [...homes, relay]) await r.stop();
});

test('the sample document is canonical text', () => {
  checkText(sample);
});

test('a long-form document published as a text act renders, verified, from a relay alone', async () => {
  const { id } = await publishDocument(author, sample, [relay.base]);

  // A reader who knows only the id and the relay.
  const got = await readDocument(id, [relay.base]);
  assert.equal(got.signer, author.id);
  assert.equal(got.standing, 'valid');
  assert.equal(got.text, sample, 'the text is the bytes signed');
  assert.equal(got.format, LONGFORM_SPECS.longform);
  assert.equal(got.formatted, true);

  const doc = parse(got.text);
  assert.equal(checkBound(doc), null);
  assert.equal(title(doc), 'A long-form test document');
  const h = renderHtml(doc);
  assert.match(h, /<h1 dir="auto">A long-form test document<\/h1>/);
  assert.match(h, /<em>in italic<\/em>, <strong>in bold<\/strong>, or <strong><em>both<\/em><\/strong>/);
  assert.match(h, /<a href="https:\/\/dubsar.org" rel="nofollow noopener noreferrer">https:\/\/dubsar.org<\/a>/);
  assert.match(h, /<span class="mor-lf-marker">1.<\/span><div><p dir="auto">never renumbered/);
  assert.match(h, /&lt;b&gt;this&lt;\/b&gt; and codes such as &amp;amp;/);

  // The plain text, one tap away, is the text itself.
  const page = renderPage(doc, title(doc)!);
  assert.ok(page.includes(plainHtml(got.text, { showControls: true })));
  // What the rendering shows is the text minus markup, in order.
  const shown = shownText(doc);
  assert.ok(shown.length < got.text.length);
  assert.ok(shown.includes('never renumbered, so this says 1 twice.'));
});

test('a text act naming a format this client lacks is still shown, as plain text', async () => {
  const other = 'ab'.repeat(32);
  const made = await author.publish(LONGFORM_SPECS.text, TEXT_ACT, textPayload('# Not ours\n\n*plain*', other), {
    public: true,
    relays: [relay.base],
  });
  const got = await readDocument(made.id, [relay.base]);
  assert.equal(got.standing, 'valid');
  assert.equal(got.format, other);
  assert.equal(got.formatted, false);
  assert.equal(got.text, '# Not ours\n\n*plain*');
  assert.equal(plainHtml(got.text), '<div class="mor-lf-plain" dir="ltr"># Not ours\n\n*plain*</div>');
});

test('a text that is not canonical never becomes a valid act', async () => {
  const bad = 'trailing space \nhere';
  assert.throws(() => checkText(bad), /rule 4/);
  const made = await author.publish(LONGFORM_SPECS.text, TEXT_ACT, textPayload(bad), { public: true, relays: [] });
  assert.equal((describeAct(made.act) as { payload?: Uint8Array }).payload, undefined, 'it does not open');
  // A relay that can open it (it is public) refuses it, or a reader does.
  await relayAt(relay.base).putAct(made.act).then(
    async () => {
      await assert.rejects(readDocument(made.id, [relay.base]), /rule 4/);
    },
    () => {},
  );
});

test('bidirectional controls are shown visibly in the plain view', () => {
  const text = 'I agree to pay ‮001‬ euros';
  const doc = parse(text);
  assert.equal(checkBound(doc), null);
  const p = plainHtml(text, { showControls: true });
  assert.match(p, /<span class="mor-lf-ctl" title="invisible character">U\+202E<\/span>/);
  assert.match(p, /<span class="mor-lf-ctl" title="invisible character">U\+202C<\/span>/);
  // The rendering isolates each block, so an override cannot reach past it.
  assert.match(renderHtml(parse(`${text}\n\nnext`)), /<p dir="auto">I agree[^<]*<\/p><p dir="auto">next<\/p>/);
});
