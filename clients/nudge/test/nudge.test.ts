// The nudge cMIP's scenarios (cmips/cmip-nudge-draft-3.md, "Scenarios to test
// when it is built"): N1 to N13, the draft 2 additions, and draft 3's (N3b
// rewritten, N3e, N3f: every text act of an agent read against its terms, and
// the agent's client refusing to sign what needs a cause it lacks), each act signed by
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

test('N3b (draft 3): a reply to a stranger with no pick and no nudge, under field 5, is outside the terms, and the agent’s client refuses to sign it; naming a pick of another act, outside; without field 5, by pick, no pick shown', () => {
  const visitor = who();
  const msg = say(visitor, 'Hello again.', { to: [MA.id] });
  // Naming no cause at all (Q2, "it should not exist without a nudge", the pick his other cause): read against the terms, outside.
  const bare = say(MA, 'Hi, unprompted.', { to: [visitor.id], refs: [pub(msg)] });
  const r0 = holding(T, msg, bare);
  const read0 = r0.readAction(bare.id)!;
  assert.equal(read0.verdict, 'outside');
  assert.equal(read0.uncaused, true);
  assert.equal(read0.terms, T.id);
  assert.equal(read0.words, 'Machine, allegedly wrote this outside its terms: it names no nudge or pick, and the terms let a reply to a stranger go out only with a signed pick, or under a nudge.');
  assert.doesNotMatch(read0.words, /picked by/);
  // Client conformance: the agent's client, asking first, does not sign it.
  const may = holding(T, msg).maySign({ signer: MA.id, public: true, to: [visitor.id], refs: [msg.id] });
  assert.equal(may.ok, false);
  assert.match(may.why, /outside its terms/);

  // The pick names another act: the reply answers an act no pick selected.
  const other = say(visitor, 'Another message.', { to: [MA.id] });
  const p = pick(NA, MA.id, T.id, other.id);
  const reply = say(MA, 'Hi.', { to: [visitor.id], refs: [pub(p), pub(msg)] });
  const read = holding(T, msg, other, p, reply).readAction(reply.id)!;
  assert.equal(read.verdict, 'outside');
  assert.match(read.words, /does not answer the act its pick selected/);

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
  // The same reply naming no cause, under terms without field 5: by pick, no pick shown (draft 1's cost, kept).
  const r3 = say(MA, 'Hi, no cause.', { to: [visitor.id], refs: [pub(msg)] });
  const read3 = holding(T2, msg, r3).readAction(r3.id)!;
  assert.equal(read3.verdict, 'within, by pick');
  assert.equal(read3.words, 'Answered by Machine, allegedly, naming no nudge or pick; its terms asked for a pick, and no one’s pick is shown. Within its terms (by pick).');
});

test('N3e (draft 3): what the terms let go out freely needs no cause; anything else naming none reads outside; an act signed before the agent’s first terms, or of an identity with no terms held, is read under none', () => {
  const agent = who();
  const before = say(agent, 'Before any terms.');
  const Ta = terms(agent, first());
  const stranger = who();
  const theirs = say(stranger, 'A stranger’s post.');
  const his = say(NA, 'A post of his.');
  const post = say(agent, 'A post of its own.');
  const toHim = say(agent, 'A reply to him.', { to: [NA.id], refs: [pub(his)] });
  const dm = say(agent, 'For him alone.', { public: false, to: [NA.id] });
  const toStranger = say(agent, 'A reply to a stranger.', { to: [stranger.id], refs: [pub(theirs)] });
  const dmStranger = say(agent, 'A message to a stranger.', { public: false, to: [stranger.id] });
  const note = say(agent, 'A private note to no one.', { public: false });
  const r = holding(before, Ta, theirs, his, post, toHim, dm, toStranger, dmStranger, note);
  const v = (x: Made) => r.readAction(x.id)?.verdict ?? null;
  assert.equal(v(post), 'within, free');
  assert.equal(r.readAction(post.id)!.words, `Written by a stranger, naming no nudge or pick. Within its terms (free).`);
  assert.equal(v(toHim), 'within, free');
  assert.equal(v(dm), 'within, free');
  assert.equal(v(toStranger), 'outside');
  assert.equal(v(dmStranger), 'outside');
  // A private act addressed to no one reaches no one: nothing is said.
  assert.equal(v(note), null);
  // Signed before its first terms, in its own sequence: the identity was not yet an agent for it.
  assert.equal(v(before), null);
  // A verifier holding none of the agent's terms says nothing.
  assert.equal(holding(theirs, toStranger).readAction(toStranger.id), null);
  // An act it names not held: unknown, saying what is missing.
  const blind = holding(Ta, toStranger).readAction(toStranger.id)!;
  assert.equal(blind.verdict, 'unknown');
  assert.match(blind.words, /is not held, so whom it addresses cannot be known/);
});

test('N3f (draft 3): an uncaused act is read under the latest terms before it in the agent’s sequence; terms that cannot be followed leave it unknown', () => {
  const agent = who();
  const stranger = who();
  const theirs = say(stranger, 'Hello.');
  const v1 = terms(agent, { ...first(), allowed: [{ kind: 1, whom: null, free: true }] });
  const early = say(agent, 'Free under the first version.', { to: [stranger.id], refs: [pub(theirs)] });
  const v2 = terms(agent, { ...first(), previous: v1.id });
  const late = say(agent, 'Needs a pick under the second.', { to: [stranger.id], refs: [pub(theirs)] });
  const r = holding(theirs, v1, early, v2, late);
  assert.equal(r.readAction(early.id)!.terms, v1.id);
  assert.equal(r.readAction(early.id)!.verdict, 'within, free');
  assert.equal(r.readAction(late.id)!.terms, v2.id);
  assert.equal(r.readAction(late.id)!.verdict, 'outside');
  // Two versions naming one previous: following stops, the act unknown.
  const fork = terms(agent, { ...first(), previous: v1.id, publicOnly: undefined });
  const after = say(agent, 'After a fork.', { to: [stranger.id], refs: [pub(theirs)] });
  const rf = holding(theirs, v1, v2, fork, after);
  assert.equal(rf.readAction(after.id)!.verdict, 'unknown');
  assert.match(rf.readAction(after.id)!.words, /stopped at a fork/);
  // The first version not held: its later versions cannot be followed.
  const rn = holding(theirs, v2, late);
  assert.equal(rn.readAction(late.id)!.verdict, 'unknown');
  assert.match(rn.readAction(late.id)!.words, /first version of its terms is not held/);
});

test('maySign (draft 3, client conformance): the agent’s client signs a free act, or one an allowed nudge or pick allows, and nothing else', () => {
  const visitor = who();
  const msg = say(visitor, 'Hi, machine.', { to: [MA.id] });
  const his = say(NA, 'His post.');
  // Free, naming no cause: a post, a reply to him.
  assert.equal(holding(T).maySign({ signer: MA.id, public: true, to: [], refs: [] }).ok, true);
  assert.equal(holding(T, his).maySign({ signer: MA.id, public: true, to: [NA.id], refs: [his.id] }).ok, true);
  // A reply to the visitor: only with his pick of that message, or his nudge.
  assert.equal(holding(T, msg).maySign({ signer: MA.id, public: true, to: [visitor.id], refs: [msg.id] }).ok, false);
  const p = pick(NA, MA.id, T.id, msg.id);
  assert.equal(holding(T, msg, p).maySign({ signer: MA.id, public: true, to: [visitor.id], refs: [p.id, msg.id] }).ok, true);
  const n = nudge(NA, MA.id, T.id, 1);
  assert.equal(holding(T, msg, n).maySign({ signer: MA.id, public: true, to: [visitor.id], refs: [n.id, msg.id] }).ok, true);
  // A second answer to the same pick, after the first in its sequence: refused.
  const one = say(MA, 'First answer.', { to: [visitor.id], refs: [pub(p), pub(msg)] });
  const second = holding(T, msg, p, one).maySign({ signer: MA.id, public: true, to: [visitor.id], refs: [p.id, msg.id], prev: one.id });
  assert.equal(second.ok, false);
  assert.match(second.why, /a pick allows one action/);
  // Past a nudge's count: refused.
  const used = say(MA, 'The one action.', { refs: [pub(n)] });
  assert.equal(holding(T, n, used).maySign({ signer: MA.id, public: true, to: [], refs: [n.id], prev: used.id }).ok, false);
  // A nudge under terms since replaced: allowed as read, but not acted on.
  const agent = who();
  const v1 = terms(agent, first());
  const v2 = terms(agent, { ...first(), previous: v1.id });
  const old = nudge(NA, agent.id, v1.id, 1);
  const stale = holding(v1, v2, old, msg).maySign({ signer: agent.id, public: true, to: [visitor.id], refs: [old.id, msg.id], prev: v2.id });
  assert.equal(stale.ok, false);
  assert.match(stale.why, /may not be acted on: it names an earlier version of the terms/);
  // An identity with no terms held is no agent for this check; nothing held is added by asking.
  const r = holding(msg);
  assert.equal(r.maySign({ signer: visitor.id, public: true, to: [MA.id], refs: [msg.id] }).ok, true);
  assert.equal(r.all().length, 1);
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
  // Naming none (draft 3): read against the terms all the same, free under the third entry.
  const plain = say(MA, 'Unprompted, just for you.', { public: false, to: [NA.id] });
  const readPlain = holding(T, plain).readAction(plain.id)!;
  assert.equal(readPlain.verdict, 'within, free');
  assert.equal(readPlain.uncaused, true);
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

test('N7 (draft 3): a post mentioning a stranger’s act, naming no nudge, reads as a reply to the stranger with no cause: outside; naming his nudge: free', () => {
  const stranger = who();
  const theirs = say(stranger, 'A stranger’s post.');
  const post = say(MA, 'About that post.', { refs: [pub(theirs)] });
  const mention = holding(T, theirs, post).readAction(post.id)!;
  assert.equal(mention.kind, 'reply');
  assert.equal(mention.verdict, 'outside');
  // Held without the agent's terms, nothing is said.
  assert.equal(holding(theirs, post).readAction(post.id), null);
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
  // An action naming an invalid nudge names no nudge of this cMIP: it is read as naming no cause
  // (draft 3), and the invalid act's signer, Nobody, allegedly, is whom it addresses: a reply to him, free.
  const post = say(MA, 'Naming a nudge for nothing.', { refs: [pub(z)] });
  const read = holding(T, z, post).readAction(post.id)!;
  assert.equal(read.uncaused, true);
  assert.equal(read.verdict, 'within, free');
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
