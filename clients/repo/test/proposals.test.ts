// Real collectives (H18) at the protocol level, against three homes and a
// relay on local ports: a founding proposed by negotiation messages and
// signed by each member on its own; the shares sealed to one-time keys,
// opened once, then never again by anything a member keeps; a release signed
// by members; a member change proposed and signed the same way; the rotation
// rebuilt from two paper shares (the stand-in for Kišib).

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { MIRS, SPECS, Verifier, describeAct, hex, shareOnPaper, unhex, xwingPublic } from '../../genesis/src/core.ts';
import { relayAt } from '../../genesis/src/transport.ts';
import { TestIdentity, receive } from '../../genesis/src/identity.ts';
import { lookUp } from '../../genesis/src/lookup.ts';
import { start, type Running } from '../../genesis/test/world.ts';
import { encryptionSecret } from '../../../modules/carry/src/carry.ts';
import { TestCollective, type Governance } from '../src/collective.ts';
import { AGREEMENTS_SPECS, proposePayload, sign } from '../src/agreements.ts';
import { DECLINED, NEGOTIATION, acceptanceText, negotiate, oneTimeKeyOf, openShare, readMessage, sealShare, type Reach } from '../src/proposals.ts';
import { prepareRelease, publishPrepared, verifyRelease } from '../src/release.ts';
import { REPO_SPECS } from '../src/specs.ts';

let homes: Running[] = [];
let relay: Running;
const people: TestIdentity[] = [];

const governance: Governance = {
  safetyThreshold: 2,
  releaseThreshold: 2,
  cloneThreshold: 2,
  abandonmentOthers: 2,
  text: 'Three members on three devices. Any two rebuild the chain key; a release counts once two members sign it.',
};

before(async () => {
  homes = [await start('home'), await start('home')];
  relay = await start('relay');
  for (let i = 0; i < 4; i++) {
    const t = TestIdentity.create({ homes: homes.map((h) => h.home), scheme: 3 });
    await t.publishGenesis();
    await t.publishRoutes([
      { scope: null, hints: [relay.base], kind: 0 },
      { scope: null, hints: [relay.base], kind: 1 },
    ]);
    await t.publishEncryptionKey(encryptionSecret(unhex(t.f.signingSecret)));
    people.push(t);
  }
});

after(async () => {
  for (const r of [...homes, relay]) await r.stop();
});

const reach = async (t: TestIdentity): Promise<Reach> => {
  const l = await lookUp(t.id, [relay.base, homes[0].base]);
  return { id: t.id, key: l.encryptionKey!, inbox: l.inbox(REPO_SPECS.agreements) ?? [relay.base] };
};

/** What `me` finds in its inbox: the negotiation messages addressed to it, opened. */
async function inbox(me: TestIdentity) {
  const page = await relayAt(relay.base).feed({ to: me.id });
  const out = [];
  for (const it of page.items) {
    if (it.kind !== 'sealed') continue;
    const r = await receive(it.item, me.id, me.f.encryption.map((e) => unhex(e.secret)), [relay.base, homes[0].base]);
    if (!r.opened) continue;
    const { openSealed } = await import('../../genesis/src/core.ts');
    const o = openSealed(it.item, me.id, unhex(me.f.encryption.at(-1)!.secret)) as { described: Parameters<typeof readMessage>[0] };
    const m = readMessage(o.described);
    if (m) out.push({ ...m, status: r.status });
  }
  return out;
}

test('founding: proposed by negotiation messages, each member signing alone; shares sealed to one-time keys, opened once; a release; a member change; a rotation from two paper shares', async () => {
  const [founder, ana, bo, cy] = people;
  const members = [founder.id, ana.id, bo.id];

  // The founder proposes the terms, signs them, and opens one thread per other member.
  const payload = TestCollective.foundingTerms(governance, members);
  const terms = await proposePayload(founder, payload, undefined, [relay.base]);
  await sign(founder, terms.id, [relay.base]);
  for (const m of [ana, bo]) {
    await negotiate(founder, await reach(m), { text: `A proposal to found “The tablet house”. The terms are act ${terms.id}.`, refs: [[terms.id, founder.id]] });
  }

  // Each member, on its own: opens the proposal, signs, sends a one-time key with the acceptance.
  const secrets = new Map<string, Uint8Array>();
  for (const m of [ana, bo]) {
    const got = await inbox(m);
    assert.equal(got.length, 1);
    const inv = got[0];
    assert.equal(inv.from, founder.id);
    assert.equal(inv.status, 'valid', 'a valid negotiation message');
    assert.deepEqual(inv.refs, [[terms.id, founder.id]]);
    assert.equal(inv.thread, inv.id);
    const sig = await sign(m, terms.id, [relay.base]);
    const one = TestIdentity.newBareKey();
    secrets.set(m.id, one.secret);
    await negotiate(m, await reach(founder), { text: acceptanceText(sig.id, one.public), thread: inv.id, previous: inv.id, acks: [inv.id] });
  }

  // The founder reads the answers: two acceptances, each with its one-time key, acknowledging its own message.
  const answers = await inbox(founder);
  assert.equal(answers.length, 2);
  for (const a of answers) {
    assert.equal(a.status, 'valid');
    assert.equal(a.previous, a.thread);
    assert.deepEqual(a.acks, [a.thread]);
    assert.ok(oneTimeKeyOf(a.text));
  }

  // Every party signed: found, deal, seal each other member's share to its one-time key.
  const { collective: c, shares } = await TestCollective.foundSigned({ agreement: terms.id, members, homes: homes.map((h) => h.home), relays: [relay.base], governance, actor: founder });
  assert.deepEqual(c.f.safety.shares, [], 'no share kept in the collective file');
  const fv = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  await lookUp(c.identity, [relay.base, homes[0].base], {}, fv);
  for (const t of [founder, ana, bo]) {
    await lookUp(t.id, [relay.base], {}, fv);
    for (const it of (await relayAt(relay.base).feed({ signer: t.id })).items) if (it.kind === 'act') fv.add(it.item);
  }
  for (const it of (await relayAt(relay.base).feed({ signer: founder.id })).items) if (it.kind === 'act') fv.add(it.item);
  assert.equal((fv.agreementsCurrent(AGREEMENTS_SPECS, c.identity) as { agreement: string }).agreement, terms.id, 'Agreements read it founded under the terms every party signed');
  const papers = new Map<string, { x: number; value: Uint8Array }>();
  papers.set(founder.id, ((p) => ({ x: p.x, value: p.value }))(shareOnPaper(shares[0].share) as { x: number; value: Uint8Array }));
  for (const a of answers) {
    const share = shares.find((s) => s.holder === a.from)!;
    await sealShare(founder, share.share, oneTimeKeyOf(a.text)!, [relay.base]);
  }

  // Each member opens its share once with its one-time secret, checks it against the dealing, keeps its paper.
  const fingerprints = new Set<string>();
  for (const m of [ana, bo]) {
    const got = await openShare(secrets.get(m.id)!, [relay.base], [relay.base, homes[0].base]);
    assert.ok(got);
    assert.equal(got.from, founder.id);
    const p = shareOnPaper(got.share) as { x: number; value: Uint8Array; fingerprint: string; threshold: number; holders: number };
    assert.deepEqual([p.threshold, p.holders], [2, 3]);
    fingerprints.add(p.fingerprint);
    papers.set(m.id, { x: p.x, value: p.value });
    // The one-time secret destroyed: nothing the member keeps opens the relay's copy again.
    const kept = [unhex(m.f.signingSecret), encryptionSecret(unhex(m.f.signingSecret)), ...m.f.encryption.map((e) => unhex(e.secret))];
    for (const k of kept) assert.equal(await openShare(k, [relay.base], [relay.base]), null, 'not found under any key the member keeps');
    const sealedHere = (await relayAt(relay.base).feed({ pickup: (await import('../../genesis/src/core.ts')).pickupTag(xwingPublic(secrets.get(m.id)!)) })).items[0].item;
    for (const k of kept) assert.equal((await receive(sealedHere, null, [k], [relay.base])).opened, false, 'the sealed copy opens with nothing the member keeps');
    secrets.get(m.id)!.fill(0);
  }
  assert.equal(fingerprints.size, 1, 'one dealing for all');

  // A release of the collective, counting once two members signed it, each from its own identity.
  const pub = { id: c.id, relays: c.f.relays, releases: c.f.releases };
  const rel = await publishPrepared(pub, prepareRelease(pub, { name: 'tablets', version: '1', files: [{ path: 'a.txt', bytes: new TextEncoder().encode('clay\n') }] }));
  // The founder uploads it for the collective with their own key (it has none, Agreements rule 56): one of the two.
  let v = await verifyRelease(rel.id, [relay.base]);
  assert.equal(v.ok, false, 'not a release before a second member signs it');
  assert.deepEqual(v.signers, [founder.id]);
  await sign(ana, rel.id, c.f.relays);
  v = await verifyRelease(rel.id, [relay.base]);
  assert.ok(v.ok, JSON.stringify(v.problems));
  assert.deepEqual(v.signers.sort(), [founder.id, ana.id].sort());

  // A member change: Cy joins, Bo leaves. The clone proposed; every voice and the joining member sign alone.
  const next = [founder.id, ana.id, cy.id];
  const clone = c.cloneFor(next);
  assert.deepEqual(clone.signers.sort(), [founder.id, ana.id, bo.id, cy.id].sort());
  const proposed = await proposePayload(founder, clone.payload, c.f.agreement, c.f.relays);
  const sigs = [];
  for (const t of [founder, ana, bo, cy]) sigs.push((await sign(t, proposed.id, c.f.relays)).id);

  // The rotation, from two paper shares (Ana's and Bo's): Kišib's work, the repo client standing in.
  await assert.rejects(
    c.rotateFromPaper({ agreement: proposed.id, signatures: sigs, members: next, governance: clone.governance, papers: [papers.get(ana.id)!] }),
    /do not rebuild the collective's chain key/,
  );
  const wrong = { ...papers.get(bo.id)!, value: papers.get(bo.id)!.value.slice() };
  wrong.value[5] ^= 1;
  await assert.rejects(c.rotateFromPaper({ agreement: proposed.id, signatures: sigs, members: next, governance: clone.governance, papers: [papers.get(ana.id)!, wrong] }), /written wrong/);
  const rot = await c.rotateFromPaper({ agreement: proposed.id, signatures: sigs, members: next, governance: clone.governance, papers: [papers.get(ana.id)!, papers.get(bo.id)!] });
  assert.equal(rot.shares.length, 3);
  assert.deepEqual(rot.shares.map((s) => s.holder), next);
  assert.ok(await c.settle(), 'the rotation counts');
  assert.deepEqual(c.f.members, next);
  assert.deepEqual(c.f.safety.shares, [], 'still no share kept');
  const after = new Verifier(SPECS.identity, MIRS.money, MIRS.agreements, MIRS.envelopes, MIRS.text);
  await lookUp(c.identity, [homes[0].base, relay.base], {}, after);
  for (const t of [c.identity, founder.id, ana.id, bo.id, cy.id]) {
    try {
      await lookUp(t, [relay.base, homes[0].base], {}, after);
    } catch {
      // the collective is looked up above
    }
    for (const it of (await relayAt(relay.base).feed({ signer: t })).items) if (it.kind === 'act') try { after.add(it.item); } catch { /* private */ }
  }
  assert.equal((after.agreementsCurrent(AGREEMENTS_SPECS, c.identity) as { agreement: string }).agreement, proposed.id, 'the clone in force after the rotation');

  // The new key rebuilds from two of the new papers (the old ones no longer). Key 0 signed the
  // genesis (Identity rule 1), key 1 was dealt at founding, so the new key is key 2.
  assert.equal(c.f.safety.index, 2);
  const newPapers = rot.shares.map((s) => shareOnPaper(s.share) as { x: number; value: Uint8Array });
  const { rebuildChainKeyFromPaper } = await import('../../genesis/src/core.ts');
  assert.equal((rebuildChainKeyFromPaper({ seedModule: 'words', scheme: 3, index: c.f.safety.index, commit: c.f.safety.commit, papers: newPapers.slice(1) }) as { commit: string }).commit, c.f.safety.commit);
  assert.throws(() => rebuildChainKeyFromPaper({ seedModule: 'words', scheme: 3, index: c.f.safety.index, commit: c.f.safety.commit, papers: [papers.get(ana.id)!, papers.get(bo.id)!] }));

  // A decline is a negotiation message too, read as such.
  const t2 = await negotiate(founder, await reach(cy), { text: 'Another proposal.', refs: [[terms.id, founder.id]] });
  await negotiate(cy, await reach(founder), { text: DECLINED, thread: t2.id, previous: t2.id, acks: [t2.id] });
  const d = (await inbox(founder)).find((x) => x.thread === t2.id)!;
  assert.equal(d.text, DECLINED);
  void describeAct;
  void hex;
  void NEGOTIATION;
});
