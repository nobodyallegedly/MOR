// mor-assess against real homes and a relay on local ports (test identities
// only): a deal proposed and signed by one party, then the other; the
// command reads it from the relay, and the core says who signed and whether
// it is in force.

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { short } from '../../collective/src/explain.ts';
import { TestIdentity } from '../../genesis/src/identity.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { start, type Running } from '../../genesis/test/world.ts';
import { proposePayload, sign } from '../../repo/src/agreements.ts';
import { answering, failing, fakeApi } from './fake-api.ts';
import { encode, id } from './terms.ts';

const run = promisify(execFile);
const cli = (...args: string[]) => cliIn(process.env, ...args);
const cliIn = (env: NodeJS.ProcessEnv, ...args: string[]) =>
  run(process.execPath, ['--import', 'tsx', fileURLToPath(new URL('../src/cli.ts', import.meta.url)), ...args], { cwd: fileURLToPath(new URL('..', import.meta.url)), env });

let homes: Running[] = [];
let relay: Running;
before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
});
after(async () => {
  for (const r of [...homes, relay]) await r.stop();
});

async function person(): Promise<TestIdentity> {
  const t = TestIdentity.create({ homes: homes.map((h) => h.home), scheme: 3 });
  await t.publishGenesis();
  for (const a of t.chainActs()) await relayAt(relay.base).putAct(a);
  return t;
}

test('mor-assess reads a deal from the relay: who signed, whether it is in force, its risks', async () => {
  const [ana, ben] = [await person(), await person()];
  const relays = [relay.base];
  const payload = encode({
    parties: [ana.id, ben.id],
    text: 'Ana and Ben share a song, half each.',
    stakes: [[id('the song'), [[ana.id, 500_000], [ben.id, 500_000]]]],
    payeeGrants: [id('a grant no relay holds'), id('another grant no relay holds')],
  });
  const deal = (await proposePayload(ana, payload, undefined, relays)).id;
  await sign(ana, deal, relays);

  const one = (await cli(deal, '--at', relay.base)).stdout;
  assert.match(one, new RegExp(`${short(ana.id)} has signed`));
  assert.match(one, new RegExp(`${short(ben.id)} has not signed`));
  assert.match(one, /It is not in force/);
  assert.match(one, /## Risks\n/);
  assert.match(one, /cannot be declared absent.*Rests on: Agreements rule 47/);
  assert.match(one, /No judge of forks/);
  assert.match(one, /payee grant .* is not on the relays asked/);
  assert.match(one, /BEGIN WORDS SIGNED BY OTHERS[^\n]*\nAna and Ben share a song, half each\.\n----- END/);

  await sign(ben, deal, relays);
  const both = JSON.parse((await cli(deal, '--at', relay.base, '--json')).stdout) as { flags: { code: string }[]; sections: { heading: string; lines: { text: string }[] }[] };
  const signed = both.sections.find((s) => s.heading === 'Who signed')!.lines.map((l) => l.text).join(' ');
  assert.match(signed, /It exists/);
  assert.match(signed, new RegExp(`version of this deal in force is ${deal.slice(0, 8)}`));
  assert.deepEqual(both.flags.map((f) => f.code).sort(), ['no-exit', 'no-fork-judge', 'split-service-window']);
});

test('mor-assess says plainly when there is nothing to assess', async () => {
  await assert.rejects(cli(id('no such act'), '--at', relay.base), (e: { stderr: string; code: number }) => e.code === 1 && /No relay asked holds act/.test(e.stderr));
  const ana = await person();
  await assert.rejects(cli(ana.id, '--at', relay.base), (e: { stderr: string }) => /is not terms/.test(e.stderr));
  await assert.rejects(cli(), (e: { stdout: string; code: number }) => e.code === 2 && /mor-assess ID --at URL/.test(e.stdout));
});

test('mor-assess --ask: the deal read from the relay, its reading and quoted rules sent to the (fake) API, the answer printed without the key', async () => {
  const KEY = 'sk-ant-api03-FAKE-cli-never-a-real-key';
  const api = await fakeApi();
  try {
    const [ana, ben] = [await person(), await person()];
    const payload = encode({ parties: [ana.id, ben.id], text: 'Ana and Ben share a song, half each.', stakes: [[id('the song'), [[ana.id, 500_000], [ben.id, 500_000]]]], payeeGrants: [id('g1'), id('g2')] });
    const deal = (await proposePayload(ana, payload, undefined, [relay.base])).id;
    const env = { ...process.env, ANTHROPIC_API_KEY: KEY, ANTHROPIC_BASE_URL: api.url, MOR_ASK_MODEL: 'claude-test-model' };
    api.reply = answering({ answer: 'If Ben goes silent, nothing can change the deal (Agreements rule 47).', restsOn: ['Agreements rule 47'], notClaimed: [] });
    const out = await cliIn(env, deal, '--at', relay.base, '--ask', 'What if Ben goes silent?');
    assert.equal(api.seen.length, 1);
    const body = api.seen[0].body;
    assert.equal(body.model, 'claude-test-model');
    assert.match(body.messages[0].content, /<rule name="Agreements rule 47" quoted-from="spec\/MIR-agreements-draft-\d+\.md">\n#### Rule 47 /);
    assert.match(body.messages[0].content, new RegExp(`${short(ben.id)} has not signed`));
    assert.match(body.messages[0].content, /<question>\nWhat if Ben goes silent\?\n<\/question>/);
    assert.match(out.stdout, /## Answer\nIf Ben goes silent/);
    assert.match(out.stdout, /## Rests on\n- Agreements rule 47 \(quoted from spec\//);
    for (const s of [out.stdout, out.stderr]) assert.ok(!s.includes(KEY), 'the key is not printed');

    const json = JSON.parse((await cliIn(env, deal, '--at', relay.base, '--ask', 'Who judges?', '--json')).stdout);
    assert.deepEqual(json.restsOn, ['Agreements rule 47']);
    assert.ok(!JSON.stringify(json).includes(KEY));

    api.reply = failing(401, 'authentication_error', `invalid x-api-key: ${KEY}`);
    await assert.rejects(cliIn(env, deal, '--at', relay.base, '--ask', 'Who judges?'), (e: { stdout: string; stderr: string; code: number }) => {
      assert.equal(e.code, 1);
      assert.match(e.stderr, /refused the key/);
      assert.ok(!e.stderr.includes(KEY) && !e.stdout.includes(KEY), 'the key is not printed');
      return true;
    });
  } finally {
    await api.stop();
  }
});
