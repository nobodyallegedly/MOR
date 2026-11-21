// Test for Damgar 0.2.3's fix: a payment report counts only when its signature is checked against its
// signer's identity chain. Test identities made in memory for this test only; nothing is sent anywhere.
// Run:  node damgar-flow.test.mjs KIT_DIR [DAMGAR_FILE]
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const KITDIR = resolve(process.argv[2] || 'kit');
const DAMGAR = resolve(process.argv[3] || 'damgar.mjs');
const { mor, SPECS, hex, unhex } = await import(join(KITDIR, 'lib', 'core.mjs'));
const REPORT_SPEC = '7b65c60f7a41d380b017913f1ed5474bf516fdee0cde5035c383c71d8e3d7854';
const h = (s) => createHash('sha256').update(s).digest('hex');
const HOME = h('a test home operator');

function person() {
  const signing = mor.newSigningSecret();
  const ck = mor.newTestChainKey(2);
  const genesis = mor.makeGenesis({ identitySpec: SPECS.identity, signingSecret: signing, chainKeyScheme: ck.scheme, chainKeyCommit: ck.commit, homes: [{ operator: HOME, hint: 'test' }], rule: null });
  return { signing, genesis, id: mor.actId(genesis), seq: [] };
}
// A report signed with `key`'s secret, in `as`'s name (a forgery when key is not as).
function report(as, key, lines) {
  const payload = mor.cborEncode(new Map([[0, [h('call'), 0]], [1, []], [2, lines]]));
  const made = mor.makeEveryday({ signingSecret: key.signing, signer: as.id, binding: as.id, spec: REPORT_SPEC, type: 0, payload, sequence: as.seq, public: true });
  as.seq.push(made.id);
  return made;
}
function folder(feedActs, records) {
  const d = mkdtempSync(join(tmpdir(), 'damgar-test-'));
  symlinkSync(KITDIR, join(d, 'kit'));
  mkdirSync(join(d, 'in')); mkdirSync(join(d, 'out')); mkdirSync(join(d, 'acts'));
  const answer = (name, path, body) => {
    writeFileSync(join(d, 'in', `${name}.answer.body`), body);
    writeFileSync(join(d, 'in', `${name}.answer.json`), JSON.stringify({ letter: name, outcome: 'answered', to: 'test', method: 'GET', path, status: 200, bodyFile: `${name}.answer.body` }));
  };
  answer('20261121000000000-001-get-feed', '/feed?after=0', mor.cborEncode(new Map([[0, feedActs.map((a, i) => [i, 0, a])]])));
  records.forEach((p, i) => answer(`20261121000000000-00${i + 2}-get-rec${i}`, `/identity/${p.id}`, mor.cborEncode(new Map([[0, unhex(p.id)], [1, [p.genesis]]]))));
  return d;
}
function flow(d, settlement) {
  const r = spawnSync(process.execPath, [DAMGAR, 'flow', settlement], { cwd: d, encoding: 'utf8' });
  return (r.stdout || '') + (r.stderr || '');
}

const service = person(), owner = person(), stranger = person();
const S1 = h('buyer payment'), S2 = h('payment to the owner');
const sat = (n) => ['sat', n];
const legService = report(service, service, [[0, sat(100), S1], [1, sat(60), [0, owner.id], S2], [3, sat(40)]]);
const legOwner = report(owner, owner, [[0, sat(60), S2]]);
const forged = report(owner, stranger, [[0, sat(60), S2]]);   // signed by the stranger's key, in the owner's name
let failures = 0;
const t = (name, fn) => { try { fn(); console.log('ok   ' + name); } catch (e) { failures++; console.log('FAIL ' + name + '\n' + e.message); } };

t('a genuine receiver report, with both chains held, confirms the share', () => {
  const out = flow(folder([legService.act, legOwner.act], [service, owner]), S1);
  assert.match(out, /2 valid/);
  assert.match(out, /CONFIRMED by the receiver's own report/);
});
t('a forged receiver report is not counted and confirms nothing', () => {
  const out = flow(folder([legService.act, forged.act], [service, owner]), S1);
  assert.doesNotMatch(out, /CONFIRMED/);
  assert.match(out, /by the payer's word only/);
  assert.match(out, /1 invalid/);
  assert.match(out, /NOT COUNTED: its signature fails/);
});
t('a report whose signer\'s chain is not held is shown as unchecked and confirms nothing', () => {
  const out = flow(folder([legService.act, legOwner.act], [service]), S1);
  assert.doesNotMatch(out, /CONFIRMED/);
  assert.match(out, /UNCHECKED: its signer's chain is not held/);
  assert.match(out, /--get \/identity\//);
});
t('the payer\'s own report, its chain not held, is marked unchecked at the top', () => {
  const out = flow(folder([legService.act], []), S1);
  assert.match(out, new RegExp(`report ${legService.id.slice(0, 12)}…; UNCHECKED`));
});
console.log(failures ? `${failures} failed` : 'all passed');
process.exit(failures ? 1 : 0);
