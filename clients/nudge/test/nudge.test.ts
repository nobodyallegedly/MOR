// The nudge cMIP's scenarios (cmips/cmip-nudge-draft-2.md, "Scenarios to test
// when it is built"): N1 to N13 and the draft 2 additions, each act signed by
// a test identity through the core library, each reading made from the acts
// a verifier holds. Delivery to inboxes is the desk's, tested there
// (clients/desk/test/machine.test.ts).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { cborEncode, describeAct, makeEveryday, unhex } from '../../genesis/src/core.ts';
import { TestIdentity, type Reference } from '../../genesis/src/identity.ts';
import { NUDGE_SPECS, NUDGE_TYPES, TEXT_ACT } from '../src/specs.ts';
import { Invalid, Reading, decodeNudge, encodeNudge, encodePick, encodeTerms, termsInWords, type Terms } from '../src/nudge.ts';

// Offline: a genesis names homes, but nothing here is sent to them.
const HOMES = [{ operator: '11'.repeat(32), hint: 'http://127.0.0.1:9' }];
const who = () => TestIdentity.create({ homes: HOMES, scheme: 3 });

const NA = who();
const MA = who();
const names = (id: string) => (id === NA.id ? 'Nobody, allegedly' : id === MA.id ? 'Machine, allegedly' : 'a stranger');

/** Machine, allegedly's first terms, as cMIP draft 2 writes them. */
const first = (na = NA.id): Terms => ({
  principals: [na],
  allowed: [
    { kind: 0, whom: null, free: true },
    { kind: 1, whom: [na], free: true },
    { kind: 2, whom: [na], free: true },
    { kind: 1, whom: null, free: false },
    { kind: 2, whom: null, free: false },
  ],
  owner: na,
  publicOnly: true,
  pickers: [na],
  nudgedFree: true,
});

interface Made {
  act: Uint8Array;
  id: string;
  key: Uint8Array;
}

const text = (t: string) => cborEncode(new Map([[0, t]])) as Uint8Array;
const pub = (r: Made): Reference => [r.id, describeAct(r.act).signer ?? r.id];

function sign(by: TestIdentity, spec: string, type: number, payload: Uint8Array, o: { public?: boolean; to?: string[]; refs?: Reference[] } = {}): Made {
  return by.sign(spec, type, payload, { public: o.public ?? true, to: o.to, refs: o.refs });
}
const terms = (by: TestIdentity, t: Terms) => sign(by, NUDGE_SPECS.nudge, NUDGE_TYPES.terms, encodeTerms(t));
const nudge = (by: TestIdentity, agent: string, t: string, count: number, o: { public?: boolean; refs?: Reference[]; context?: string } = {}) =>
  sign(by, NUDGE_SPECS.nudge, NUDGE_TYPES.nudge, encodeNudge({ agent, terms: t, count, context: o.context }), { public: o.public, to: [agent], refs: o.refs });
const pick = (by: TestIdentity, agent: string, t: string, picked: string) => sign(by, NUDGE_SPECS.nudge, NUDGE_TYPES.pick, encodePick({ agent, terms: t, picked }), { to: [agent] });
const say = (by: TestIdentity, words: string, o: { public?: boolean; to?: string[]; refs?: Reference[] } = {}) => sign(by, NUDGE_SPECS.text, TEXT_ACT, text(words), o);

/** A verifier holding these acts. */
function holding(...acts: Made[]): Reading {
  const r = new Reading(names);
  for (const a of acts) r.add(a.act, describeAct(a.act).public ? undefined : a.key);
  return r;
}

const T = terms(MA, first());

test('the terms in plain words (item 4): who nudges, whose picks count, each kind, nudged actions, the owner as the agent’s own statement', () => {
  const words = termsInWords(first(), names).join('\n');
  assert.match(words, /Who may nudge it: Nobody, allegedly, and only by a public nudge\./);
  assert.match(words, /Whose picks count: Nobody, allegedly/);
  assert.match(words, /A public post: goes out freely\./);
  assert.match(words, /A reply to Nobody, allegedly: goes out freely\./);
  assert.match(words, /A message to Nobody, allegedly alone: goes out freely\./);
  assert.match(words, /A reply to anyone: needs a pick\./);
  assert.match(words, /A message to anyone: needs a pick\./);
  assert.match(words, /naming an allowed nudge goes out freely, whoever it answers/);
  assert.match(words, /as the agent itself states it \(it confers nothing\): Nobody, allegedly/);
});

test('N1: a public nudge for 1 action, a post naming it: a stranger holding the post follows it to the nudge and the terms; caused by the nudge, within, free', () => {
  const n = nudge(NA, MA.id, T.id, 1);
  const post = say(MA, 'Something of my own.', { refs: [pub(n)] });
  const r = holding(T, n, post);
  const read = r.readAction(post.id)!;
  assert.equal(read.verdict, 'within, free');
  assert.equal(read.kind, 'post');
  assert.equal(read.nudge?.signer, NA.id);
  assert.equal(read.words, 'Written by Machine, allegedly after a nudge from Nobody, allegedly, its first of one. Within its terms (free).');
  assert.ok(r.mayAct(n.id).ok);
});

test('N2: a nudge naming a post of his; a reply to that post: within, free, a reply to him', () => {
  const his = say(NA, 'A post of mine.');
  const n = nudge(NA, MA.id, T.id, 1, { refs: [pub(his)], context: 'Have a look at this.' });
  const reply = say(MA, 'A reply.', { to: [NA.id], refs: [pub(n), pub(his)] });
  const read = holding(T, his, n, reply).readAction(reply.id)!;
  assert.equal(read.verdict, 'within, free');
  assert.equal(read.kind, 'reply');
  assert.deepEqual(read.addressees, [NA.id]);
  assert.equal(read.nudge?.nudge?.context, 'Have a look at this.');
});

test('N3: a visitor writes from a one-time identity; his signed pick; the reply naming the pick and the message: answered, picked by him; within, by pick', () => {
  const visitor = who();
  const msg = say(visitor, 'Hello, machine.', { to: [MA.id] });
  const p = pick(NA, MA.id, T.id, msg.id);
  const reply = say(MA, 'Hello, visitor.', { to: [visitor.id], refs: [pub(p), pub(msg)] });
  const r = holding(T, msg, p, reply);
  assert.equal(r.readCause(p.id)!.verdict, 'allowed');
  const read = r.readAction(reply.id)!;
  assert.equal(read.verdict, 'within, by pick');
  assert.equal(read.words, 'Answered by Machine, allegedly, picked by Nobody, allegedly. Within its terms (by pick).');
});

test('N3b: under terms setting field 5, a reply to a stranger naming no allowed pick of what it answers is outside; under terms without field 5, by pick, no pick shown', () => {
  const visitor = who();
  const msg = say(visitor, 'Hello again.', { to: [MA.id] });
  const other = say(visitor, 'Another message.', { to: [MA.id] });
  // The pick names another act: the reply answers an act no pick selected.
  const p = pick(NA, MA.id, T.id, other.id);
  const reply = say(MA, 'Hi.', { to: [visitor.id], refs: [pub(p), pub(msg)] });
  const read = holding(T, msg, other, p, reply).readAction(reply.id)!;
  assert.equal(read.verdict, 'outside');
  assert.match(read.words, /does not answer the act its pick selected/);
  // The same reply naming nothing of this cMIP is no action of it (items 13 and 16): nothing is said.
  const bare = say(MA, 'Hi, unprompted.', { to: [visitor.id], refs: [pub(msg)] });
  assert.equal(holding(T, msg, bare).readAction(bare.id), null);

  // Terms without field 5 or 6: a nudged reply to a stranger follows the by-pick entry, and no pick is shown.
  const noPickers = first();
  delete noPickers.pickers;
  delete noPickers.nudgedFree;
  const T2 = terms(MA, noPickers);
  const n = nudge(NA, MA.id, T2.id, 1);
  const r2 = say(MA, 'Hi.', { to: [visitor.id], refs: [pub(n), pub(msg)] });
  const read2 = holding(T2, msg, n, r2).readAction(r2.id)!;
  assert.equal(read2.verdict, 'within, by pick');
  assert.match(read2.words, /its terms asked for a pick, and no one’s pick is shown/);
  assert.doesNotMatch(read2.words, /picked by/);
});

test('N3c: a second reply naming the same pick: the first in the agent’s sequence is within, the second outside', () => {
  const visitor = who();
  const msg = say(visitor, 'One question.', { to: [MA.id] });
  const p = pick(NA, MA.id, T.id, msg.id);
  const one = say(MA, 'First answer.', { to: [visitor.id], refs: [pub(p), pub(msg)] });
  const two = say(MA, 'Second answer.', { to: [visitor.id], refs: [pub(p), pub(msg)] });
  const r = holding(T, msg, p, one, two);
  assert.equal(r.readAction(one.id)!.verdict, 'within, by pick');
  assert.equal(r.readAction(two.id)!.verdict, 'outside');
  assert.match(r.readAction(two.id)!.words, /a pick allows one action/);
});

test('N3d: a pick by an identity the terms do not name as picker: not allowed; the reply naming it outside', () => {
  const visitor = who();
  const stranger = who();
  const msg = say(visitor, 'Pick me.', { to: [MA.id] });
  const p = pick(stranger, MA.id, T.id, msg.id);
  const reply = say(MA, 'Picked by a stranger.', { to: [visitor.id], refs: [pub(p), pub(msg)] });
  const r = holding(T, msg, p, reply);
  assert.equal(r.readCause(p.id)!.verdict, 'not allowed');
  assert.equal(r.readAction(reply.id)!.verdict, 'outside');
  assert.equal(r.mayAct(p.id).ok, false);
});

test('N4: a nudge from a stranger: not allowed, the agent’s client does not act; an action naming it anyway is outside, the text still valid', () => {
  const stranger = who();
  const n = nudge(stranger, MA.id, T.id, 1);
  const post = say(MA, 'Moved by a stranger.', { refs: [pub(n)] });
  const r = holding(T, n, post);
  assert.equal(r.readCause(n.id)!.verdict, 'not allowed');
  assert.equal(r.mayAct(n.id).ok, false);
  const read = r.readAction(post.id)!;
  assert.equal(read.verdict, 'outside');
  assert.match(read.words, /caused by a nudge the terms do not allow/);
  assert.equal(describeAct(post.act).spec, NUDGE_SPECS.text);
});

test('N4b: a nudge for 1; a reply to a stranger’s message naming the nudge, no pick: within, free (field 6), shown as answered under his nudge, never “picked by”', () => {
  const visitor = who();
  const msg = say(visitor, 'Anyone there?', { to: [MA.id] });
  const n = nudge(NA, MA.id, T.id, 1);
  const reply = say(MA, 'Yes.', { to: [visitor.id], refs: [pub(n), pub(msg)] });
  const read = holding(T, msg, n, reply).readAction(reply.id)!;
  assert.equal(read.verdict, 'within, free');
  assert.equal(read.words, 'Answered by Machine, allegedly, under a nudge from Nobody, allegedly, its first of one. Within its terms (free).');
  assert.doesNotMatch(read.words, /picked/);
});

test('N4c: a nudge for 2 answered by 3 in one sequence: two within, the third over the count; in two sequences: each over the count, order unknown', () => {
  const n = nudge(NA, MA.id, T.id, 2);
  const a = [1, 2, 3].map((i) => say(MA, `Action ${i}.`, { refs: [pub(n)] }));
  const r = holding(T, n, ...a);
  assert.deepEqual(
    a.map((x) => r.readAction(x.id)!.verdict),
    ['within, free', 'within, free', 'outside'],
  );
  assert.match(r.readAction(a[1].id)!.words, /its second of two/);
  assert.match(r.readAction(a[2].id)!.words, /over the count: the third action naming a nudge for two/);

  // Two sequences: a copy of the agent's file signs from the same place.
  const dir = mkdtempSync(join(tmpdir(), 'mor-nudge-'));
  const fresh = who();
  const T3 = terms(fresh, first());
  const n3 = nudge(NA, fresh.id, T3.id, 2);
  fresh.save(join(dir, 'a.json'));
  const fork = TestIdentity.load(join(dir, 'a.json'), {});
  const x = say(fresh, 'One.', { refs: [pub(n3)] });
  const y = say(fresh, 'Two.', { refs: [pub(n3)] });
  const z = say(fork, 'Three, on another line.', { refs: [pub(n3)] });
  const r3 = holding(T3, n3, x, y, z);
  for (const act of [x, y, z]) {
    const read = r3.readAction(act.id)!;
    assert.equal(read.verdict, 'outside');
    assert.match(read.words, /over the count, order unknown/);
  }
});

test('N4d: a message to him alone, naming his nudge: free; naming none: no action of this cMIP; without field 6, free under the third entry', () => {
  const n = nudge(NA, MA.id, T.id, 1);
  const m = say(MA, 'Just for you.', { public: false, to: [NA.id], refs: [pub(n)] });
  const read = holding(T, n, m).readAction(m.id)!;
  assert.equal(read.kind, 'message');
  assert.equal(read.verdict, 'within, free');
  const plain = say(MA, 'Unprompted, just for you.', { public: false, to: [NA.id] });
  assert.equal(holding(T, plain).readAction(plain.id), null);
  const no6 = first();
  delete no6.nudgedFree;
  const T6 = terms(MA, no6);
  const n6 = nudge(NA, MA.id, T6.id, 1);
  const m6 = say(MA, 'For you alone.', { public: false, to: [NA.id], refs: [pub(n6)] });
  const read6 = holding(T6, n6, m6).readAction(m6.id)!;
  assert.equal(read6.verdict, 'within, free');
  assert.match(read6.why.join(), /a message to Nobody, allegedly go out freely/);
});

test('N5: a second version dropping a principal: his nudge naming the first version is allowed, “terms since replaced”; the agent does not act on it; an action after the change says so', () => {
  const agent = who();
  const other = who();
  const v1 = terms(agent, { ...first(), principals: [NA.id, other.id] });
  const v2 = terms(agent, { ...first(), previous: v1.id });
  const n = nudge(other, agent.id, v1.id, 1);
  const post = say(agent, 'After the change.', { refs: [pub(n)] });
  const r = holding(v1, v2, n, post);
  const c = r.readCause(n.id)!;
  assert.equal(c.verdict, 'allowed');
  assert.deepEqual(c.replaced, { latest: v2.id, fork: null, stillNamed: false });
  assert.match(c.words, /Terms since replaced: the latest held is .*, where its signer is no longer named\./);
  assert.equal(r.mayAct(n.id).ok, false);
  const read = r.readAction(post.id)!;
  assert.equal(read.afterChange, v2.id);
  assert.match(read.words, /signed after the agent replaced those terms/);
});

test('N6: two versions naming one previous: following stops there, both named', () => {
  const agent = who();
  const v1 = terms(agent, first());
  const a = terms(agent, { ...first(), previous: v1.id });
  const b = terms(agent, { ...first(), previous: v1.id, publicOnly: undefined });
  const r = holding(v1, a, b);
  const f = r.follow(v1.id);
  assert.equal(f.latest, v1.id);
  assert.deepEqual(f.fork, [a.id, b.id].sort());
  const n = nudge(NA, agent.id, v1.id, 1);
  r.add(n.act);
  assert.match(r.readCause(n.id)!.words, /following stopped at a fork, between/);
  assert.equal(r.mayAct(n.id).ok, false);
});

test('N7: a post mentioning a stranger’s act, naming no nudge: no action of this cMIP; naming his nudge: free', () => {
  const stranger = who();
  const theirs = say(stranger, 'A stranger’s post.');
  const post = say(MA, 'About that post.', { refs: [pub(theirs)] });
  assert.equal(holding(T, theirs, post).readAction(post.id), null);
  const n = nudge(NA, MA.id, T.id, 1);
  const nudged = say(MA, 'About that post, nudged.', { to: [stranger.id], refs: [pub(n), pub(theirs)] });
  const read = holding(T, theirs, n, nudged).readAction(nudged.id)!;
  assert.equal(read.kind, 'reply');
  assert.equal(read.verdict, 'within, free');
});

test('N8: two nudges, or two picks: unclear; a nudge addressed to another agent: no action of this agent’s', () => {
  const n1 = nudge(NA, MA.id, T.id, 1);
  const n2 = nudge(NA, MA.id, T.id, 1);
  const two = say(MA, 'Two nudges.', { refs: [pub(n1), pub(n2)] });
  assert.equal(holding(T, n1, n2, two).readAction(two.id)!.verdict, 'unclear');
  const visitor = who();
  const msg = say(visitor, 'Hi.', { to: [MA.id] });
  const p1 = pick(NA, MA.id, T.id, msg.id);
  const p2 = pick(NA, MA.id, T.id, msg.id);
  const twoPicks = say(MA, 'Two picks.', { to: [visitor.id], refs: [pub(p1), pub(p2), pub(msg)] });
  assert.equal(holding(T, msg, p1, p2, twoPicks).readAction(twoPicks.id)!.verdict, 'unclear');
  const otherAgent = who();
  const To = terms(otherAgent, first());
  const elsewhere = nudge(NA, otherAgent.id, To.id, 1);
  const post = say(MA, 'Naming another agent’s nudge.', { refs: [pub(elsewhere)] });
  assert.equal(holding(To, elsewhere, post).readAction(post.id), null);
});

test('N9: a private nudge under terms setting field 4: not allowed; under terms without it, unknown to a reader who cannot open it', () => {
  const n = nudge(NA, MA.id, T.id, 1, { public: false });
  assert.equal(holding(T, n).readCause(n.id)!.verdict, 'not allowed');
  const open = first();
  delete open.publicOnly;
  const T4 = terms(MA, open);
  const n4 = nudge(NA, MA.id, T4.id, 1, { public: false });
  const post = say(MA, 'Moved by something private.', { refs: [n4.id] });
  const outsider = new Reading(names);
  outsider.add(T4.act);
  outsider.add(n4.act); // its key not held
  outsider.add(post.act);
  const read = outsider.readAction(post.id)!;
  assert.equal(read.verdict, 'unknown');
  assert.match(read.words, /a private act that cannot be opened here/);
  // The agent, holding the key, reads it as allowed.
  assert.equal(holding(T4, n4).readCause(n4.id)!.verdict, 'allowed');
});

test('N9b: a pick of a private message: a reader who cannot open the message is not shown it', () => {
  const visitor = who();
  const secret = say(visitor, 'For the machine only.', { public: false, to: [MA.id] });
  const p = pick(NA, MA.id, T.id, secret.id);
  const outsider = new Reading(names);
  outsider.add(T.act);
  outsider.add(p.act);
  outsider.add(secret.act); // no key
  const shown = outsider.pickedShown(p.id)!;
  assert.equal(shown.text, null);
  assert.match(shown.why, /a private act, which only its recipients can open/);
  const agent = holding(T, p, secret);
  assert.equal(agent.pickedShown(p.id)!.text, 'For the machine only.');
});

test('N10: a client without this cMIP reads the action as the text it is, with references to acts it does not know', () => {
  const n = nudge(NA, MA.id, T.id, 1);
  const post = say(MA, 'Plain text to anyone.', { refs: [pub(n)] });
  const d = describeAct(post.act) as { spec: string; type: number; refs: string[]; payload: Uint8Array };
  assert.equal(d.spec, NUDGE_SPECS.text);
  assert.equal(d.type, TEXT_ACT);
  assert.deepEqual(d.refs, [n.id]);
  assert.equal(new Reading().readAction(post.id), null); // nothing held, nothing said
});

test('N11: a nudge or a pick carrying acks: invalid (Envelopes rule 18); a nudge with count 0: invalid under this cMIP', () => {
  assert.throws(() => encodeNudge({ agent: MA.id, terms: T.id, count: 0 }), Invalid);
  // A test identity refuses to sign acks on a cMIP's act (F110); forged here with the core directly.
  const forger = who();
  const forge = (type: number, payload: Uint8Array, acks?: string[]) =>
    makeEveryday({
      signingSecret: unhex(forger.f.signingSecret),
      signer: forger.f.identity,
      binding: forger.f.binding,
      spec: NUDGE_SPECS.nudge,
      type,
      payload,
      sequence: forger.f.sequence,
      public: true,
      acks,
    }) as Made;
  const withAcks = forge(NUDGE_TYPES.nudge, encodeNudge({ agent: MA.id, terms: T.id, count: 1 }), [T.id]);
  assert.equal(holding(T, withAcks).readCause(withAcks.id)!.verdict, 'invalid');
  const pickAcks = forge(NUDGE_TYPES.pick, encodePick({ agent: MA.id, terms: T.id, picked: T.id }), [T.id]);
  assert.equal(holding(T, pickAcks).readCause(pickAcks.id)!.verdict, 'invalid');
  const zero = cborEncode(new Map<number, unknown>([[0, unhex(MA.id)], [1, unhex(T.id)], [2, 0]])) as Uint8Array;
  assert.throws(() => decodeNudge(zero), /count \(field 2\) is 0/);
  const z = sign(NA, NUDGE_SPECS.nudge, NUDGE_TYPES.nudge, zero, { to: [MA.id] });
  const c = holding(T, z).readCause(z.id)!;
  assert.equal(c.verdict, 'invalid');
  // An action naming an invalid nudge names no nudge of this cMIP.
  const post = say(MA, 'Naming a nudge for nothing.', { refs: [pub(z)] });
  assert.equal(holding(T, z, post).readAction(post.id), null);
});

test('N12: an action naming an act the verifier does not hold: unknown, saying what is missing', () => {
  const stranger = who();
  const theirs = say(stranger, 'Not held by the reader.');
  const n = nudge(NA, MA.id, T.id, 1);
  const reply = say(MA, 'Answering something.', { to: [stranger.id], refs: [pub(n), pub(theirs)] });
  const read = holding(T, n, reply).readAction(reply.id)!;
  assert.equal(read.verdict, 'unknown');
  assert.match(read.words, new RegExp(`the act ${theirs.id.slice(0, 8)}… ?.* is not held, so whom it addresses cannot be known`));
  const lost = nudge(NA, MA.id, 'ab'.repeat(32), 1);
  assert.match(holding(lost).readCause(lost.id)!.words, /unknown: the terms it names, .* are not held/);
});

test('N13: terms with a post entry naming identities are invalid, a nudge under them not allowed; terms with no entries and no field 6 put every nudged action outside', () => {
  assert.throws(() => encodeTerms({ principals: [NA.id], allowed: [{ kind: 0, whom: [NA.id], free: true }] }), /a post names no one/);
  const agent = who();
  const bad = cborEncode(new Map<number, unknown>([[0, [unhex(NA.id)]], [1, [[0, [unhex(NA.id)], true]]]])) as Uint8Array;
  const Tb = sign(agent, NUDGE_SPECS.nudge, NUDGE_TYPES.terms, bad);
  const nb = nudge(NA, agent.id, Tb.id, 1);
  const rb = holding(Tb, nb).readCause(nb.id)!;
  assert.equal(rb.verdict, 'not allowed');
  assert.match(rb.words, /the terms are invalid under this cMIP/);
  const Te = terms(agent, { principals: [NA.id], allowed: [] });
  assert.match(termsInWords({ principals: [NA.id], allowed: [] }, names).join(' '), /stopped acting under this cMIP/);
  const ne = nudge(NA, agent.id, Te.id, 1);
  const post = say(agent, 'Under empty terms.', { refs: [pub(ne)] });
  const read = holding(Te, ne, post).readAction(post.id)!;
  assert.equal(read.verdict, 'outside');
  assert.match(read.words, /no entry of the terms allows a public post/);
});

test('the three payloads read back exactly, and malformed ones are refused', () => {
  const t = first();
  const back = new Reading(names);
  back.add(T.act);
  const held = back.termsAct(T.id)!;
  assert.ok('terms' in held);
  assert.deepEqual(held.terms, t);
  assert.throws(() => encodeTerms({ ...t, principals: [NA.id, NA.id] }), /names an identity twice/);
  assert.throws(() => encodeNudge({ agent: MA.id, terms: T.id, count: 1, context: 'e\u0301' }), /not canonical text/);
});
