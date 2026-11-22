// Test for Damgar 0.2.3's fix and 0.2.4's corrections (after review W3-F): a payment report counts only when its signature is checked against its
// signer's identity chain. Test identities made in memory for this test only; nothing is sent anywhere.
// Run:  node damgar-flow.test.mjs KIT_DIR [DAMGAR_FILE]
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync } from 'node:fs';
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
const made = [];
// A kit without lib/kit.mjs, to check Damgar still runs (and counts nothing) when it is missing.
function kitWithoutKitMjs() {
  const k = mkdtempSync(join(tmpdir(), 'damgar-kit-')); made.push(k);
  symlinkSync(join(KITDIR, 'mor.mjs'), join(k, 'mor.mjs'));
  symlinkSync(join(KITDIR, 'core'), join(k, 'core'));
  mkdirSync(join(k, 'lib'));
  symlinkSync(join(KITDIR, 'lib', 'core.mjs'), join(k, 'lib', 'core.mjs'));
  for (const f of ['format.mjs']) try { symlinkSync(join(KITDIR, 'lib', f), join(k, 'lib', f)); } catch {}
  return k;
}
function folder(feedActs, records, kitdir = KITDIR) {
  const d = mkdtempSync(join(tmpdir(), 'damgar-test-')); made.push(d);
  symlinkSync(kitdir, join(d, 'kit'));
  mkdirSync(join(d, 'in')); mkdirSync(join(d, 'out')); mkdirSync(join(d, 'acts'));
  const answer = (name, path, body) => {
    writeFileSync(join(d, 'in', `${name}.answer.body`), body);
    writeFileSync(join(d, 'in', `${name}.answer.json`), JSON.stringify({ letter: name, outcome: 'answered', to: 'test', method: 'GET', path, status: 200, bodyFile: `${name}.answer.body` }));
  };
  answer('20261121000000000-001-get-feed', '/feed?after=0', mor.cborEncode(new Map([[0, feedActs.map((a, i) => [i, 0, a])]])));
  records.forEach((p, i) => answer(`20261121000000000-00${i + 2}-get-rec${i}`, `/identity/${p.id}`, mor.cborEncode(new Map([[0, unhex(p.id)], [1, [p.genesis]]]))));
  return d;
}
function run(d, args) {
  const r = spawnSync(process.execPath, [DAMGAR, ...args], { cwd: d, encoding: 'utf8' });
  return (r.stdout || '') + (r.stderr || '');
}
const flow = (d, settlement) => run(d, ['flow', settlement]);

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
// 0.2.4, after review W3-F.
const S3 = h('a later payment to the owner');
const owing = report(service, service, [[0, sat(100), h('second buyer')], [4, sat(60), [0, owner.id]], [3, sat(40)]]);
const closeGood = report(service, service, [[1, sat(60), [0, owner.id], S3, [owing.id, 1]]]);
const closeForged = report(service, stranger, [[1, sat(60), [0, owner.id], S3, [owing.id, 1]]]);
t('a genuine closing report, its chain held, pays the still-owed line', () => {
  const out = flow(folder([owing.act, closeGood.act], [service, owner]), h('second buyer'));
  assert.match(out, /PAID LATER by report/);
});
t('a forged closing report leaves the still-owed line NOT PAID', () => {
  const out = flow(folder([owing.act, closeForged.act], [service, owner]), h('second buyer'));
  assert.doesNotMatch(out, /PAID LATER/);
  assert.match(out, /NOT PAID in any report held/);
});
t('a closing report whose chain is not complete says so, not NOT PAID', () => {
  const svc2 = person();
  const ow = report(svc2, svc2, [[0, sat(10), h('third buyer')], [4, sat(6), [0, owner.id]]]);
  const cl = report(svc2, svc2, [[1, sat(6), [0, owner.id], h('p'), [ow.id, 1]]]);
  const out = flow(folder([ow.act, cl.act], [owner]), h('third buyer'));
  assert.match(out, /STILL OWED as far as checked: a later report/);
  assert.doesNotMatch(out, /NOT PAID in any report held/);
});
const forgedService = report(service, stranger, [[0, sat(100), h('fourth buyer')], [1, sat(60), [0, owner.id], h('fake leg')]]);
t('a forged report\'s lines are not shown, in flow or in reports', () => {
  const d = folder([forgedService.act], [service, owner]);
  const out = flow(d, h('fourth buyer'));
  assert.match(out, /NOT COUNTED: its signature fails/);
  assert.doesNotMatch(out, /passed on:/);
  const rep = run(d, ['reports']);
  assert.match(rep, /its lines are not shown/);
  assert.doesNotMatch(rep, /passed on: /);
});
const wrongSigner = report(stranger, stranger, [[0, sat(60), S2]]);
t('a valid report by someone other than the receiver is never shown as their receipt', () => {
  const out = flow(folder([legService.act, wrongSigner.act], [service, owner, stranger]), S1);
  assert.doesNotMatch(out, /CONFIRMED/);
  assert.match(out, /NOT the receiver the line names/);
  assert.doesNotMatch(out, new RegExp(`${stranger.id.slice(0, 12)}… received`));
});
t('a receiver report held but not counted is said to be held, not missing', () => {
  const out = flow(folder([legService.act, legOwner.act], [service]), S1);
  assert.match(out, /is held but does not count yet/);
  assert.doesNotMatch(out, /no received line from the receiver held/);
});
t('"valid" is said to be valid as held here', () => {
  const out = flow(folder([legService.act, legOwner.act], [service, owner]), S1);
  assert.match(out, /AS HELD HERE/);
});
t('without kit/lib/kit.mjs Damgar still runs and confirms nothing', () => {
  const out = flow(folder([legService.act, legOwner.act], [service, owner], kitWithoutKitMjs()), S1);
  assert.match(out, /Following/);
  assert.doesNotMatch(out, /CONFIRMED/);
});
for (const d of made) try { rmSync(d, { recursive: true, force: true }); } catch {}
console.log(failures ? `${failures} failed` : 'all passed');
process.exit(failures ? 1 : 0);
