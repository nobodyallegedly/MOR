"""An independent check of the grammar verifier's vectors (core/vectors/agreements-new/grammar.json).

Written from the rules text, not from the Rust code: draft 25's section 2
(the definitions and the answers), section 3 (the fields) and section 4 (the
grammar rules), read against encoding-1 for the bytes. It shares with
agreements_new_check.py only the decoding of an act's bytes (its `judge`,
which gives the payload's fields and the cases of invalid an act shows by
itself), and with check.py the act format under that. Everything the grammar
says about several acts (in force, updates, forks of Terms and of a signer's
line, late updates by knots and by place, counter signatures, the order from
citing, the receiver for an act, legs and their reports, the baker) is read
again here, in its own small way.

The stub cMIPs' outputs are taken from each case's `stubs_asked`, as the
sockets' outputs; a socket whose cMIP is not among the file's `stubs` is a
cMIP this verifier lacks, and what rests on it is unchecked (G9.1). The Rust
verifier's `answers` and their plain words are never read here: only the
expected `answer` is compared.

Where the grammar has a piece this check does not reproduce, the case is not
judged, and the reason is listed (run alone: python3
core/vectors/agreements_new_grammar_check.py). Not reproduced: a delegation
ended by the delegator alone (G5.5: the body's cMIP names the delegator, and
the stub's answer does not), the timing of an act made under a power after its
Terms were replaced (G5.4, which rests on G5.5 here), fillings and their
rights (G10.2, G10.6), the sequence walked before paying (G11.4(e)), counter
signatures made under a power or judged per place, who fills a role of an
original asked again by the default (G4.8(a)), and any stub cMIP that would
have to be asked about only part of the acts held (late updates by knots, a
place's positions): the recorded stub answers are about the acts as held.

Choices of this reading, where draft 25 leaves the wording open:
- a late update by knots (G4.7(a)): "enough for F to be valid and in force" is
  read with the original's own signers taken from every act held (the original
  was in force before either update), and F's assents and in force from the
  acts the late one names;
- the qualifier: "as shown" (or per place, per anchoring) on answers about
  what is latest or who receives; none on answers fixed by fingerprint
  (invalid, order from citing, the baker, legs, counter signatures,
  unchecked).
"""

import json
import os
import re

import agreements_new_check as an

HERE = os.path.dirname(os.path.abspath(__file__))



def recv(f):
    """The receiver (encoding 2, E12): [0, position] for one of the Terms'
    own parties, [2, root] for an agreement; read as the position, or the
    root."""
    r = f.get(10)
    if r is None:
        return None
    return r[1]


class Skip(Exception):
    """A case this check does not judge, with the reason."""


class Unchecked(Exception):
    """A cMIP, an act or a layer's answer the verifier lacks (G9.1)."""

    def __init__(self, rule=None):
        self.rule = rule


def A(word, rule, qualifier="none", who=None, disputed=False):
    return {"word": word, "rule": rule, "qualifier": qualifier, "who": who, "disputed": disputed}


def is_fp(v):
    return isinstance(v, bytes) and len(v) == 32


def signer_who(h):
    return {"signer": h.hex()}


_JUDGED = {}  # an act's bytes -> agreements_new_check.judge's answer: many cases hold the same acts


class Act:
    def __init__(self, label, b):
        if b not in _JUDGED:
            _JUDGED[b] = an.judge(b, None)
        verdict, rule, notes, facts = _JUDGED[b]
        self.label, self.verdict, self.rule, self.notes = label, verdict, rule, notes
        self.kind = facts["kind"] if facts else None
        self.id = facts["id"] if facts else None
        self.signer = facts["signer"] if facts else None
        self.f = facts["f"] if facts else {}

    # ---- fields read alike for Terms and Statements
    def prev(self):
        v = self.f.get(19 if self.kind == "terms" else 6)
        return v[0] if v else None

    def agreement(self):
        if self.kind == "terms":
            return self.f.get(1, self.id)
        return self.f.get(0)

    def resolution_shaped(self):
        k = (17, 18) if self.kind == "terms" else (10, 11)
        return k[0] in self.f and k[1] in self.f

    def resolves(self):
        return self.f.get(17 if self.kind == "terms" else 10, [])

    def continues(self):
        return self.f.get(18 if self.kind == "terms" else 11)

    def names(self):
        """Every fingerprint this act names in a field that names an act (G13.1, G4.7(a))."""
        f, out = self.f, []
        if self.kind == "terms":
            keys, lists = (0, 1, 11, 12, 18), (5, 17, 19)
        elif self.kind == "statement":
            keys, lists = (0, 1, 5, 9, 11), (6, 7, 8, 10)
        else:  # a report: its call, what it relied on, each line's act
            out.append(f[0][0])
            for x in f.get(1, []):
                out.append(x)
            for line in f.get(2, []):
                if line[0] == 0:
                    out.append(line[2])
                elif line[0] == 1:
                    out.append(line[3])
            return [x for x in out if is_fp(x)]
        for k in keys:
            if is_fp(f.get(k)):
                out.append(f[k])
        for k in lists:
            for x in f.get(k, []):
                if is_fp(x):
                    out.append(x)
        return out

    # ---- Terms
    def parties(self):
        return self.f.get(2, [])

    def signers(self):
        return [p[1] for p in self.parties() if p[0] == 0]

    def roles(self):
        return [p for p in self.parties() if p[0] == 1]

    def is_assent(self):
        return self.kind == "statement" and self.f.get(2) == 0 and not isinstance(self.f.get(2), list)

    def is_counter(self):
        return self.kind == "statement" and self.f.get(2) == 1 and not isinstance(self.f.get(2), list)


class World:
    """The acts one case holds, the stand-in layers, and the stub cMIPs' recorded answers."""

    def __init__(self, case, stubs):
        self.case = case
        self.acts = {}
        self.order = []
        for a in case["acts"]:
            x = Act(a["label"], bytes.fromhex(a["bytes"]))
            assert x.id is None or x.id.hex() == a["id"], a["label"]
            if x.id is not None:
                self.acts[x.id] = x
                self.order.append(x)
        self.layers = case["layers"]
        self.reader = case["reader"]
        self.limits = case["limits"] or {}
        self.asked = case["stubs_asked"]
        self.stubs = stubs
        money = self.layers.get("money") or {}
        self.known = set()  # ids the layers know, which are not Agreements acts
        for s in money.get("settlements", []):
            self.known.add(bytes.fromhex(s))
        for p in money.get("payments", []):
            self.known.add(bytes.fromhex(p["id"]))
        for e in (self.layers.get("envelope_chain") or {}).get("envelopes", []):
            self.known.add(bytes.fromhex(e["bake"]))
            for t in e["transfers"]:
                self.known.add(bytes.fromhex(t["id"]))
        self.bad = {}
        self._invalid_among_held()
        self._lines()
        self._closures = {}
        self._chains = {}

    # ------------------------------------------------ the sockets

    def stub(self, task, about, sock):
        """The output of the cMIP in a socket, as the case recorded it."""
        cm = sock[0]
        if not is_fp(cm) or cm.hex() not in self.stubs:
            raise Unchecked()
        want = [x.hex() for x in about]
        for s in self.asked:
            if s["task"] == task and s["about"] == want and s["cmip"] == cm.hex():
                return s["answer"]
        raise Skip(f"no recorded answer of the {task} stub about these acts")

    # ------------------------------------------------ G6.1: invalid among the acts held

    def _invalid_among_held(self):
        for a in self.order:
            if a.verdict == "invalid":
                self.bad[a.id] = a.rule
        for a in self.order:
            if a.kind not in ("terms", "statement") or a.id in self.bad:
                continue
            p = a.prev()
            if p is None:
                continue
            if p in self.known:
                self.bad[a.id] = "G6.1"  # a payment, a settlement, an envelope's act
                continue
            o = self.acts.get(p)
            if o is None:
                continue  # names nothing held: the act counts, the line is unchecked before it
            if o.kind not in ("terms", "statement") or o.signer != a.signer or o.agreement() != a.agreement():
                self.bad[a.id] = "G6.1"

    # ------------------------------------------------ G6.2, G12.3: a signer's line

    def _lines(self):
        """Forks in each signer's line within each agreement, and what stops (G12.2)."""
        groups = {}
        for a in self.order:
            if a.kind in ("terms", "statement") and a.id not in self.bad:
                groups.setdefault((a.signer, a.agreement(), a.prev()), []).append(a)
        self.line_forks = {}  # (signer, agreement) -> "fork" or "resolved"
        stopped = set()
        for (s, agr, _), members in groups.items():
            if len(members) < 2:
                continue
            res = [m for m in members if m.resolution_shaped()]
            tips = [m for m in members if not m.resolution_shaped()]
            resolvers = [r for r in res if len(tips) >= 2 and set(t.id for t in tips) <= set(r.resolves()) and r.continues() in [t.id for t in tips]]
            others = [r for r in res if r not in resolvers]
            tips += others  # an act shaped as a resolving update that resolves nothing is an act like any other
            if len(tips) < 2:
                continue
            conts = set(r.continues() for r in resolvers)
            if len(conts) == 1 and not others:
                self.line_forks[(s, agr)] = "resolved"
                stopped |= set(t.id for t in tips if t.id not in conts)
            elif len(conts) > 1:
                raise Skip("rival resolving updates in a signer's line")
            else:
                r = self._resolved_under_power(s, agr, tips) if not resolvers else None
                if r is not None:
                    # G12.4 (draft 25): a resolve made for the signer, under a
                    # power of kind `resolves` in Terms by which it is bound.
                    self.line_forks[(s, agr)] = "resolved under a power"
                    stopped |= set(t.id for t in tips if t.id != r)
                else:
                    self.line_forks[(s, agr)] = "fork"
                    stopped |= set(t.id for t in tips)
        # Whatever follows a stopped act in the line stops with it.
        grew = True
        while grew:
            grew = False
            for a in self.order:
                if a.id not in stopped and a.kind in ("terms", "statement") and a.prev() in stopped:
                    stopped.add(a.id)
                    grew = True
        self.stopped = stopped

    def _resolved_under_power(self, signer, agr, tips):
        """G12.4 for a signer's line: a Statement of kind resolve (3) whose
        `for` names the signer, within the same agreement, naming every tip and
        continuing one, made under Terms that give a power of kind `resolves`
        (3) whose rule's recorded answer about that act is yes; those Terms
        bind the signer (an assent of its own to them, as held). Returns the tip
        continued, or None."""
        ids = [t.id for t in tips]
        for R in self.order:
            if R.kind != "statement" or R.id in self.bad or R.f.get(2) != 3:
                continue
            fr, under = R.f.get(4), R.f.get(5)
            if fr != [0, signer] or R.f.get(0) != agr or under is None:
                continue
            if not set(ids) <= set(R.f.get(10, [])) or R.f.get(11) not in ids:
                continue
            U = self.acts.get(under)
            if U is None or U.id in self.bad:
                continue
            bound = any(a.kind == "statement" and a.signer == signer and a.f.get(2) == 0 and a.f.get(1) == U.id and 4 not in a.f for a in self.order)
            if not bound:
                continue
            for kind, rule in U.f.get(7, []):
                if kind == 3:
                    try:
                        if self.stub("K3", [U.id, R.id], rule) == "yes":
                            return R.f.get(11)
                    except Unchecked:
                        continue
        return None

    def counts(self, a):
        return a is not None and a.id not in self.bad and a.id not in self.stopped

    # ------------------------------------------------ G13.1, G13.3: knots

    def closure(self, x):
        """Every id an act names, directly or through acts that name them."""
        if x.id in self._closures:
            return self._closures[x.id]
        seen, todo = set(), list(x.names())
        while todo:
            i = todo.pop()
            if i in seen:
                continue
            seen.add(i)
            o = self.acts.get(i)
            if o is not None:
                todo.extend(o.names())
        self._closures[x.id] = seen
        return seen

    def missing(self, ids):
        """Ids named that are neither held nor known to a layer: acts the verifier lacks."""
        return [i for i in ids if i not in self.acts and i not in self.known]

    # ------------------------------------------------ assents and in force (G4.1, G4.10, G5.1(b))

    def power_yes(self, under, kind, act):
        """G5.1(b): `under` held, in force, giving a power of this kind whose rule says yes."""
        U = self.acts.get(under)
        if U is None or U.kind != "terms":
            raise Unchecked()
        if not self.counts(U) or not self.is_in_force_now(U):
            return False
        for k, rule in U.f.get(7, []):
            if k == kind:
                if self.stub("K3", [U.id, act.id], rule) == "yes":
                    return True
        return False

    def assents(self, T, held=None):
        """The assents to T that count, each with the name it is counted in."""
        out = []
        for s in self.order:
            if not (s.is_assent() and s.f[1] == T.id and s.f[0] == T.agreement() and self.counts(s)):
                continue
            if held is not None and s.id not in held:
                continue
            if 4 not in s.f:
                out.append((s, ("s", s.signer)))
            elif s.f[4][0] == 0:
                if held is not None:
                    raise Skip("an assent made under a power, read on part of the acts")
                if self.power_yes(s.f[5], 0, s):
                    out.append((s, ("s", s.f[4][1])))
            else:
                out.append((s, ("a", s.f[4][1])))
        return out

    def default_ok(self, T, assents):
        names = set(n for _, n in assents)
        return all(("s", p) in names for p in T.signers())

    def in_force(self, T, held=None):
        """True, False, or "unknown" (a counter signature whose order is not shown), by G4.1."""
        if 6 in T.f:
            if held is not None:
                raise Skip("an `in_force` cMIP asked on part of the acts")
            return self.stub("K2", [T.id], T.f[6]) == "yes"
        if not T.signers():
            return True
        got = self.assents(T, held)  # a party named as an agreement is not counted by the default (G4.4)
        cs = [s for s in self.order if s.is_counter() and s.f[1] == T.id and s.f[0] == T.agreement()
              and self.counts(s) and (held is None or s.id in held)]
        if not cs:
            return self.default_ok(T, got)
        if held is not None:
            raise Skip("counter signatures read on part of the acts")
        cancelled, unknown = set(), False
        for C in cs:
            if 4 in C.f:
                raise Skip("a counter signature made under a power")
            a = self.cancelled_assent(T, C)
            if a is None:
                continue
            r = self.counter_order(T, C, got)
            if r == "before":
                cancelled.add(a.id)
            elif r == "unknown":
                unknown = True
        if unknown:
            return "unknown"
        return self.default_ok(T, [(s, n) for s, n in got if s.id not in cancelled])

    def cancelled_assent(self, T, C):
        """The assent a counter signature is read against: the signer's latest own assent to T
        before it in the line, after any earlier counter signature (G4.10, "Which assent")."""
        p = C.prev()
        while p is not None and p in self.acts:
            o = self.acts[p]
            if o.is_counter() and o.f[1] == T.id:
                return None
            if o.is_assent() and o.f[1] == T.id and 4 not in o.f:
                return o
            p = o.prev()
        return None

    def counter_order(self, T, C, got):
        """G4.10 with no place: "before" (it cancels), "after" (it changes nothing), or "unknown"."""
        if not self.default_ok(T, got):
            return "before"  # nothing had completed them
        cl = self.closure(C)
        if self.default_ok(T, [(s, n) for s, n in got if s.id in cl]):
            return "after"
        if not self.default_ok(T, [(s, n) for s, n in got if C.id not in self.closure(s)]):
            return "before"
        return "unknown"

    # ------------------------------------------------ updates (G4.8, G4.11)

    def signed_original(self, O):
        """G4.8(a): the parties in whose name an assent to the original counts."""
        if 0 in O.f:
            prev = self.acts.get(O.f[0])
            if prev is not None and 13 in prev.f:
                raise Skip("parties bound by an update without an assent of their own (G4.8(a), G5.1(c)) asked again")
        got = self.assents(O)
        names = set()
        for _, n in got:
            if n[0] == "a":
                raise Skip("an agreement's signing of the original (G4.8(a), G1.2)")
            if n[1] in O.signers():
                names.add(n[1])
        for r in O.roles():
            role = dict((k, v) for k, v, _ in r[1])
            spot = role.get(2)
            others = [n for _, n in got if n[1] not in O.signers()]
            if spot is None or not is_fp(spot[0]) or spot[0].hex() not in self.stubs:
                if others:
                    raise Unchecked()
                continue
            fill = self.stub("K5", [O.id], spot)
            if not fill.startswith("0 filling"):
                raise Skip("who fills a role of the original (K5)")
        return names

    def condition(self, O, U, held=None):
        """The update condition of O about U: "valid", "not valid", or "lacking" (the default, one missing)."""
        if 13 in O.f:
            if held is not None:
                raise Skip("an update condition's cMIP asked on part of the acts")
            return "valid" if self.stub("K4", [O.id, U.id], O.f[13]) == "valid" else "not valid"
        need = self.signed_original(O)
        names = set(n[1] for _, n in self.assents(U, held) if n[0] == "s")
        if need <= names:
            return "valid"
        if O.f.get(7):
            # G5.5 (iii): Terms that carry powers, not signed by all: the body is read.
            if 4 not in O.f:
                raise Skip("Terms with powers and no body")
            parts = self.stub("K1", [O.id], O.f[4][1])
            if "delegation" in parts:
                raise Skip("a delegation ended by the delegator alone (G5.5)")
        return "lacking"

    def update_ok(self, U, O, held=None):
        return self.condition(O, U, held) == "valid" and self.in_force(U, held) is True

    def needed_assents(self, L, O):
        """The assents without which L is not an update of O."""
        got = self.assents(L)
        out = []
        for s, _ in got:
            held = set(x.id for x in self.order) - {s.id}
            try:
                if not self.update_ok(L, O, held):
                    out.append(s)
            except Skip:
                raise Skip("a late update read where the update needs a cMIP")
        return out

    def late_by_knots(self, L, F, O):
        """G4.7(a): True, False, or "unchecked" (L names an act not held)."""
        missing = False
        for X in [L] + self.needed_assents(L, O):
            cl = self.closure(X)
            if self.missing(cl):
                missing = True
            if self.update_ok(F, O, cl):
                return True
        return "unchecked" if missing else False

    def first_position(self, U, O, positions):
        """G4.7(b): the first position at which, counting only the acts the place shows at or
        before it, U is valid and in force."""
        for p in sorted(set(positions.values())):
            held = set(i for i, q in positions.items() if q <= p)
            if U.id in held and self.update_ok(U, O, held):
                return p
        return None

    # ------------------------------------------------ the place, or the anchoring the reader accepts

    def anchoring(self, root):
        R = self.acts.get(root)
        place = R.f.get(8) if R else None
        if place is not None:
            want, q = place.hex(), "per place"
        elif self.reader.get("anchoring"):
            want, q = self.reader["anchoring"], "per anchoring"
        else:
            return None, "as shown"
        for p in self.layers.get("places", []):
            if p["id"] == want:
                if p["contradicted"]:
                    raise Unchecked()
                return {bytes.fromhex(i): n for i, n in p["positions"]}, q
        raise Unchecked()

    # ------------------------------------------------ the chain of versions

    def g14_counts(self, T):
        if 11 not in T.f:
            return True
        word = self.baker(T)[0]["word"]
        if word == "unchecked":
            raise Unchecked()
        return word == "shown"

    def chain(self, root):
        """Walk an agreement's versions from its root (G4.5 to G4.9, G12.3)."""
        if root not in self._chains:
            self._chains[root] = self._chain(root)
        return self._chains[root]

    def _chain(self, root):
        R = self.acts.get(root)
        if R is None or R.kind != "terms":
            raise Unchecked()
        positions, q = self.anchoring(root)
        held = set(positions) if positions is not None else None
        out = {"q": q, "versions": [R], "tips": [], "setaside": set(), "late": {}, "resolved": {}, "status": "ok", "last": R}
        if not self.counts(R) or not self.g14_counts(R):
            out["status"] = "notinforce"
            return out
        r = self.in_force(R, held)
        if r is not True:
            out["status"] = "notinforce"
            out["why"] = r
            return out
        cur, alias = R, {R.id}
        while True:
            ups = [U for U in self.order if U.kind == "terms" and U.f.get(0) in alias and self.counts(U)
                   and U.f.get(1) == root and (held is None or U.id in held) and self.g14_counts(U)]
            plain = [U for U in ups if not U.resolution_shaped()]
            shaped = [U for U in ups if U.resolution_shaped()]
            cands = [U for U in plain if self.update_ok(U, cur, held)]
            if len(cands) < 2:
                cands += [U for U in shaped if self.update_ok(U, cur, held)]
                shaped = []
            # Late updates (G4.7): by knots, then by the place the original names.
            if len(cands) >= 2:
                late, unsure = set(), False
                for L in cands:
                    for F in cands:
                        if F is L:
                            continue
                        k = self.late_by_knots(L, F, cur)
                        if k is True:
                            late.add(L.id)
                            out["late"][L.id] = (F, "as shown")
                        elif k == "unchecked":
                            unsure = True
                if unsure:
                    raise Unchecked("G4.8")
                rest = [U for U in cands if U.id not in late]
                if len(rest) >= 2 and positions is not None and q == "per place":
                    firsts = {U.id: self.first_position(U, cur, positions) for U in rest}
                    first = min(firsts.values())
                    if list(firsts.values()).count(first) == 1:
                        for U in rest:
                            if firsts[U.id] != first:
                                F = [V for V in rest if firsts[V.id] == first][0]
                                out["late"][U.id] = (F, "per place")
                        rest = [U for U in rest if firsts[U.id] == first]
                cands = rest
            if not cands:
                break
            if len(cands) == 1:
                cur = cands[0]
                alias = {cur.id}
                out["versions"].append(cur)
                continue
            tips = set(U.id for U in cands)
            resolvers, also = [], []
            for S in shaped:
                if tips <= set(S.resolves()) and S.continues() in tips:
                    rule = self.resolves_fork(S, cur, held)
                    if rule:
                        resolvers.append((S, rule))
                elif self.update_ok(S, cur, held):
                    also.append(S)
            if also:
                raise Skip("an act shaped as a resolving update that names some tips only")
            conts = set(S.continues() for S, _ in resolvers)
            if len(conts) == 1:
                c = list(conts)[0]
                for S, rule in resolvers:
                    out["resolved"][S.id] = rule
                out["setaside"] |= tips - {c}
                cur = self.acts[c]
                alias = {c} | set(S.id for S, _ in resolvers)
                out["versions"].append(cur)
                continue
            out["status"] = "fork"
            out["tips"] = [self.acts[t] for t in tips] if not resolvers else [S for S, _ in resolvers]
            break
        out["last"] = cur
        return out

    def resolves_fork(self, S, O, held):
        """G12.3, G12.4: the rule under which S resolves the fork at O, or None."""
        for k, rule in O.f.get(7, []):
            if k == 3 and self.stub("K3", [O.id, S.id], rule) == "yes":
                return "G12.4"
        if self.update_ok(S, O, held):
            return "G12.3"
        return None

    def is_in_force_now(self, T):
        """Whether T is the Terms in force of its agreement (while a fork stands, the shared one)."""
        ch = self.chain(T.agreement())
        return ch["status"] in ("ok", "fork") and ch["last"] is T

    # ------------------------------------------------ G14: the baker

    def baker(self, T):
        """[the answer of G14.3 or G14.2, then G14.5 beside it for each other bake of the same work]."""
        chain = self.layers.get("envelope_chain")
        if chain is None:
            return [A("unchecked", "G14.3")]
        envs = [e for e in chain["envelopes"] if e["bake"] == T.f[11].hex()]
        if not envs:
            return [A("unchecked", "G14.3")]
        e = envs[0]
        beside = [A("shown", "G14.5", "as shown", {"signer": o["baker"]}) for o in chain["envelopes"]
                  if o is not e and o["work"] == e["work"]]
        at = T.f[12].hex()
        ts = {t["id"]: t for t in e["transfers"]}
        if at == e["bake"]:
            holder = e["baker"]
        elif at in ts:
            t = ts[at]
            # A double sale: another transfer follows the same act as this one, or one before it.
            p, path = t, []
            while True:
                path.append(p)
                if p["follows"] == e["bake"]:
                    break
                p = ts.get(p["follows"])
                if p is None:
                    return [A("unchecked", "G14.3")] + beside
            for q in path:
                if any(o["follows"] == q["follows"] and o["id"] != q["id"] for o in e["transfers"]):
                    if not e["holder_in_fork"]:
                        return [A("not shown", "G14.3")] + beside
                    raise Skip("a holder the envelope's layer gives within a fork")
            holder = t["to"]
        elif T.f[12] in self.acts:
            return [A("invalid", "G14.3")] + beside  # envelope_at names an act held, not of the chain
        else:
            return [A("unchecked", "G14.3")] + beside
        # Late Terms (G14.2): T, or an assent without which it is not in force, names a transfer
        # that follows the act it cites.
        after, grew = set(), True
        cited = at
        while grew:
            grew = False
            for t in e["transfers"]:
                if t["id"] not in after and (t["follows"] == cited or t["follows"] in after):
                    after.add(t["id"])
                    grew = True
        after = set(bytes.fromhex(x) for x in after)
        if 6 in T.f:
            needed = []
        else:
            got = self.assents(T)
            needed = [s for s, _ in got if not self.default_ok(T, [(x, n) for x, n in got if x is not s])]
        for X in [T] + needed:
            if after & self.closure(X):
                return [A("not shown", "G14.2", "as shown")] + beside
        if bytes.fromhex(holder) not in T.signers():
            if T.roles():
                raise Skip("the holder reached through a role (G14.3(b))")
            return [A("invalid", "G14.3", who={"signer": holder})] + beside
        if 0 in T.f:
            raise Skip("the holder bound through the update condition of the Terms replaced (G5.1(c))")
        if any(n == ("s", bytes.fromhex(holder)) for _, n in self.assents(T)):
            return [A("shown", "G14.3", who={"signer": holder})] + beside
        return [A("not shown", "G14.3", who={"signer": holder})] + beside

    # ------------------------------------------------ G1.4: the receiver for an act

    def receiver(self, root, version=None):
        seen, n, beside, q = set(), 0, [], "as shown"
        limit = self.limits.get("receivers")
        while True:
            if root in seen:
                return [A("not shown", "G1.4")]
            seen.add(root)
            n += 1
            if limit is not None and n > limit:
                return [A("unchecked", "G1.4")]
            if version is None:
                if root not in self.acts:
                    return [A("unchecked", "G1.4")]
                ch = self.chain(root)
                q = ch["q"]
                if ch["status"] == "fork":
                    beside = [A("fork", "G4.7", q)]
                elif ch["status"] != "ok":
                    raise Skip("a receiver read from Terms not in force")
                V = ch["last"]
            else:
                V = self.acts.get(version)
                if V is None:
                    return [A("unchecked", "G1.4")]
                if V.id in self.bad:
                    return [A("invalid", self.bad[V.id])]
                if 11 in V.f:
                    b = self.baker(V)[0]
                    if b["word"] != "shown":
                        return [A(b["word"], b["rule"], b["qualifier"])]
            r = recv(V.f)
            if r is None:
                return [A("not shown", "G1.4")]
            if is_fp(r):
                root, version = r, None
                continue
            parties = V.parties()
            if r >= len(parties) or parties[r][0] == 2:
                return [A("not shown", "G1.4")]
            p = parties[r]
            if p[0] == 0:
                return [A("shown", "G1.4", q, signer_who(p[1]))] + beside
            role = dict((k, v) for k, v, _ in p[1])
            try:
                fill = self.stub("K5", [V.id], role[2])
            except Unchecked:
                return [A("unchecked", "G1.4")]
            m = re.match(r"(\d+) filling", fill)
            if not m:
                raise Skip("a K5 answer this check cannot read")
            if int(m.group(1)) != 1:
                return [A("not shown", "G1.4")]
            # The stub lists its fillings in its parameters: [[signer, proof, ...], ...].
            table = role[2][1][0] if isinstance(role[2][1], list) and role[2][1] else None
            if not table or len(table) != 1 or not is_fp(table[0][0]):
                raise Skip("a K5 stub whose fillings this check cannot read")
            return [A("shown", "G1.4", q, signer_who(table[0][0]))] + beside

    # ------------------------------------------------ G11: legs

    def holds_control(self, T):
        if 14 in T.f:
            cm = T.f[14][0]
            return "shown" if is_fp(cm) and cm.hex() in self.stubs else "unchecked"
        r = recv(T.f)
        if r is None or is_fp(r) or r >= len(T.parties()) or T.parties()[r][0] == 2:
            return "not shown"
        if 4 not in T.f:
            raise Skip("Terms with no body")
        try:
            parts = self.stub("K1", [T.id], T.f[4][1])
        except Unchecked:
            return "unchecked"
        m = re.match(r"parts \[([0-9, ]*)\]", parts)
        if not m:
            raise Skip("a K1 answer this check cannot read")
        idx = [int(x) for x in m.group(1).replace(" ", "").split(",") if x]
        return "shown" if any(i != r for i in idx) else "not shown"

    def reports_for(self, T, task):
        return [r for r in self.order if r.kind == "report" and r.f[0] == [T.id, task]]

    def doer(self, T):
        r = recv(T.f)
        if r is None or is_fp(r):
            return None
        p = T.parties()[r] if r < len(T.parties()) else None
        return p[1] if p and p[0] == 0 else None

    def settlements(self):
        return set(bytes.fromhex(s) for s in (self.layers.get("money") or {}).get("settlements", []))

    def leg(self, T):
        hc = self.holds_control(T)
        if hc != "shown":
            raise Skip("a leg under Terms not shown to hold the Control task")
        calls = [c for c in T.f.get(15, []) if c[0] == 6]
        if not calls:
            return [A("no report called for", "G11.4")]
        frm = calls[0][1]
        reps = self.reports_for(T, 6)
        if not reps:
            raise Skip("a call with no report, asked as a leg")
        if frm != 2:
            return [A("shown", "G11.4")]  # one side expected: each report shown as stated, no tie
        doer = self.doer(T)
        if doer is None:
            raise Skip("no doer among the parties")
        mine = [r for r in reps if r.signer == doer]
        lines = [ln for r in mine for ln in r.f.get(2, []) if ln[0] == 1]
        if len(lines) > 1:
            raise Skip("several passed-on lines")
        if lines:
            _, amount, to, by = lines[0][:4]
            if to[0] != 0:
                raise Skip("a line passed on to an agreement")
            if by not in self.settlements():
                return [A("unchecked", "G11.4")]
            confs = [ln for r in reps if r.signer == to[1] for ln in r.f.get(2, []) if ln[0] == 0 and ln[2] == by]
            if not confs:
                return [A("one side only", "G11.4")]
            if all(c[1] == amount for c in confs):
                return [A("matched", "G11.4")]
            return [A("mismatched", "G11.4")]
        confs = [r for r in reps if r.signer != doer and r.signer in T.signers()]
        if confs:
            return [A("one side only", "G11.4")]
        raise Skip("reports by no side of the leg")

    def silence(self, T):
        if self.holds_control(T) != "shown" or not [c for c in T.f.get(15, []) if c[0] == 6]:
            raise Skip("silence asked of Terms with no call")
        if self.reports_for(T, 6):
            raise Skip("silence asked of a call with reports")
        who = self.reader.get("on_behalf_of")
        if who is None:
            return [A("not shown", "G11.4")]
        if "signer" in who:
            s = bytes.fromhex(who["signer"])
            if s == self.doer(T) or s in T.signers():
                return [A("unanswered", "G11.4")]
        raise Skip("silence read by a reader who is no side, or along a data path")

    def payment(self, pid):
        for p in (self.layers.get("money") or {}).get("payments", []):
            if p["id"] == pid:
                return p
        return None

    def data(self, rep, reader):
        call = rep.f[0]
        if len(call) == 2:
            T = self.acts.get(call[0])
            if T is None:
                return [A("unchecked", "G11.6")]
        else:
            # Draft 25, G11.7: a confirmation names, as its call, the
            # settlement the payment names, never the payment.
            p = next((x for x in (self.layers.get("money") or {}).get("payments", []) if x["settlement"] == call[0].hex()), None)
            if p is None:
                raise Skip("a report whose call names no settlement of a payment held")
            T = self.acts.get(bytes.fromhex(p["version"]))
            if T is None:
                return [A("unchecked", "G11.6")]
            payer = bytes.fromhex(p["payer"])
            if not any(n == ("s", payer) for _, n in self.assents(T)):
                return [A("no (the task's output)", "G11.6")]
            if self.doer(T) is None:
                raise Skip("a receiving side reached through another agreement")
        for ln in rep.f.get(2, []):
            if ln[0] in (1, 4) and ln[2][0] == 2:
                raise Skip("a line naming an agreement: its Terms asked too")
        if 16 not in T.f:
            return [A("no (the task's output)", "G11.6")]
        try:
            a = self.stub("K8", [T.id, rep.id], T.f[16])
        except Unchecked:
            return [A("unchecked", "G11.6")]
        return [A(f"{a} (the task's output)", "G11.6")]

    def buyer_leg(self, pid):
        p = self.payment(pid)
        if p is None:
            raise Skip("a payment not held")
        V = bytes.fromhex(p["version"])
        if V not in self.acts:
            return [A("unchecked", "G11.7")]
        rec = self.receiver(self.acts[V].agreement(), V)[0]
        if rec["word"] != "shown":
            raise Skip("a buyer's leg with no receiving side shown")
        side = bytes.fromhex(rec["who"]["signer"])
        s = bytes.fromhex(p["settlement"])
        if s not in self.settlements():
            return [A("unchecked", "G11.7")]
        confs = [ln for r in self.order if r.kind == "report" and r.signer == side
                 and r.f[0] == [s]  # draft 25, G11.7: the settlement, never the payment
                 for ln in r.f.get(2, []) if ln[0] == 0 and ln[2] == s]
        amount = [bytes.fromhex(p["amount"][0]), p["amount"][1]]
        if not confs:
            word = "one side only"
        elif all(c[1] == amount for c in confs):
            word = "matched"
        else:
            word = "mismatched"
        return [A(word, "G11.7", who=rec["who"])]

    def contest(self, C):
        V = self.acts.get(C.f[1])
        if V is None:
            raise Skip("a contest against Terms not held")
        ch = self.chain(C.f[0])
        if V in ch["versions"]:
            out = [A("shown", "G11.8", ch["q"])]
        elif V.id in ch["setaside"]:
            out = [A("shown", "G11.8", ch["q"], disputed=True)]
        else:
            out = [A("not shown", "G11.8", ch["q"])]
        if 9 in C.f:
            pays = (self.layers.get("money") or {}).get("payments", [])
            if any(bytes.fromhex(x["payer"]) == C.signer and bytes.fromhex(x["settlement"]) == C.f[9]
                   and bytes.fromhex(x["version"]) == V.id for x in pays):
                out.append(A("shown", "G11.8"))
            else:
                out.append(A("unchecked", "G11.8"))
        return out


# ---------------------------------------------------------------- the questions

def arg_id(x):
    return bytes.fromhex(x.split(":", 1)[1] if x.startswith("signer:") else x)


def q_in_force(w, T):
    if T.id in w.bad:
        return [A("invalid", w.bad[T.id])]
    if 11 in T.f:
        b = w.baker(T)[0]
        if b["word"] != "shown":
            return [A(b["word"], b["rule"], b["qualifier"])]
    ch = w.chain(T.agreement())
    q = ch["q"]
    if ch["status"] == "notinforce":
        if T.id == T.agreement():
            return [A("not shown", "G4.1", q)]
        raise Skip("a later version of an agreement whose root is not in force")
    if T is ch["last"]:
        return [A("shown", "G4.7" if ch["status"] == "fork" else "G4.6", q)]
    if T in ch["versions"]:
        return [A("not shown", "G4.9", q)]
    if ch["status"] == "fork" and T in ch["tips"]:
        return [A("not shown", "G4.7", q)]
    if T.id in ch["setaside"]:
        return [A("not shown", "G12.3", q)]
    if T.id in ch["late"]:
        return [A("not shown", "G4.7", ch["late"][T.id][1])]
    raise Skip("in force asked of Terms that are no version")


def q_last_version(w, root):
    ch = w.chain(root)
    if ch["status"] == "fork":
        return [A("fork", "G4.7", ch["q"])]
    if ch["status"] == "ok":
        return [A("shown", "G4.6", ch["q"])]
    raise Skip("the last version of an agreement whose root is not in force")


def q_update(w, U):
    O = w.acts.get(U.f.get(0))
    if O is None:
        raise Skip("an update of Terms not held")
    ch = w.chain(U.agreement())
    q = ch["q"]
    if U.id in ch["late"]:
        return [A("shown", "G4.7", ch["late"][U.id][1])]
    c = w.condition(O, U)
    if c == "not valid":
        return [A("not valid", "G4.11", q)]
    if c == "lacking":
        return [A("not shown", "G4.8", q)]
    if w.in_force(U) is True:
        return [A("valid", "G4.11", q)]
    raise Skip("an update answered valid and not in force by its own `in_force`")


def q_resolution(w, S):
    ch = w.chain(S.agreement())
    if S.id in ch["resolved"]:
        return [A("shown", ch["resolved"][S.id], ch["q"])]
    raise Skip("a resolving update that does not resolve")


def q_assent(w, s):
    if s.id in w.bad:
        return [A("invalid", w.bad[s.id])]
    if s.id in w.stopped:
        return [A("not shown", "G12.2")]
    T = w.acts.get(s.f[1])
    try:
        got = w.assents(T)
    except Unchecked:
        return [A("unchecked", "G5.1")]
    names = [n for x, n in got if x is s]
    if not names or names[0][0] != "s":
        raise Skip("an assent not counted in a signer's name")
    ch = w.chain(T.agreement())
    if ch["status"] in ("ok", "fork") and ch["last"] is T:
        return [A("shown", "G4.3", ch["q"], signer_who(names[0][1]))]
    raise Skip("an assent to Terms not in force")


def q_order(w, a, b):
    if b.id in w.closure(a):
        return [A("shown", "G13.3")]
    if a.id in w.closure(b):
        raise Skip("the order asked the other way round")
    return [A("not shown", "G13.3")]


def q_counter(w, C):
    T = w.acts.get(C.f[1])
    if T is None or 6 in T.f or T.f.get(8) is not None:
        raise Skip("a counter signature read against a K2 rule or a place")
    a = w.cancelled_assent(T, C)
    if a is None:
        return [A("not shown", "G4.10")]
    r = w.counter_order(T, C, w.assents(T))
    return [A("shown" if r == "before" else "not shown", "G4.10")]


def q_line(w, signer, root):
    st = w.line_forks.get((signer, root))
    if st == "fork":
        return [A("fork", "G6.2", "as shown")]
    if st == "resolved":
        return [A("shown", "G12.3", "as shown")]
    if st == "resolved under a power":
        return [A("shown", "G12.4", "as shown")]
    return [A("shown", "G6.1", "as shown")]


def q_signature_of(w, s):
    """G1.2: is this act an agreement's signature? (`who` is not compared: see SKIP_WHO.)"""
    if 4 not in s.f or s.f[4][0] != 2:
        raise Skip("an act made for no agreement")
    x, U = s.f[4][1], w.acts.get(s.f[5])
    if U is None:
        return [A("unchecked", "G1.2")]
    if U.agreement() != x:
        return [A("not shown", "G1.2")]
    if not w.is_in_force_now(U):
        return [A("not shown", "G1.2")]
    kind = s.f[2]
    if isinstance(kind, list):
        raise Skip("a K7 kind")
    if U.f.get(7):
        for k, rule in U.f[7]:
            if k == kind and w.stub("K3", [U.id, s.id], rule) == "yes":
                return [A("shown", "G1.2", who={"agreement": x.hex()})]
        return [A("not shown", "G1.2")]
    keys = (0, 1, 2, 3, 4, 5, 9, 10, 11)
    sig = [an.enc(s.f.get(k)) if k in s.f else None for k in keys]
    by = set()
    for o in w.order:
        if o.kind == "statement" and w.counts(o) and [an.enc(o.f.get(k)) if k in o.f else None for k in keys] == sig:
            by.add(o.signer)
    if set(U.signers()) <= by:
        return [A("shown", "G1.2", who={"agreement": x.hex()})]
    return [A("not shown", "G1.2")]


def q_bound(w, p, X):
    if X.kind == "statement":
        if X.signer == p:
            return [A("shown", "G5.1(a)", "as shown")]
        if 4 not in X.f:
            return [A("not shown", "G5.3")]
        raise Skip("bound by a Statement made for someone (G5.4 timing)")
    got = w.assents(X)
    for s, n in got:
        if n == ("s", p) and 4 not in s.f and s.signer == p:
            return [A("shown", "G5.1(a)", "as shown")]
    for s, n in got:
        if n == ("s", p):
            U = w.acts[s.f[5]]
            if not w.is_in_force_now(U):
                raise Skip("an act under a power whose Terms were replaced (G5.4)")
            return [A("shown", "G5.1(b)", "as shown")]
    if 0 in X.f:
        O = w.acts.get(X.f[0])
        if O is not None and any(n == ("s", p) for _, n in w.assents(O)) and 13 in O.f:
            if w.condition(O, X) == "valid":
                return [A("shown", "G5.1(c)", "as shown")]
    raise Skip("not bound by any of G5.1's three ways")


def q_baker(w, T):
    return w.baker(T)


def q_holds_control(w, T):
    return [A(w.holds_control(T), "G11.2")]


def q_takes_new(w, root, idx):
    ch = w.chain(root)
    if ch["status"] != "ok":
        raise Skip("a spot read while no version is in force alone")
    V = ch["last"]
    p = V.parties()[idx]
    if p[0] != 1:
        raise Skip("no role at that position")
    role = dict((k, v) for k, v, _ in p[1])
    try:
        a = w.stub("K5", [V.id], role[2])
    except Unchecked:
        return [A("unchecked", "G10.5")]
    if "takes no new identities" in a:
        return [A("no (the task's output)", "G10.5", ch["q"])]
    if "takes new identities" in a:
        return [A("yes (the task's output)", "G10.5", ch["q"])]
    raise Skip("a K5 answer this check cannot read")


def q_whole(w, T):
    if "G2.2" in T.notes or "G5.2" in T.notes:
        return [A("shown", "G2.2")]
    # Draft 25, G2.2 and G11.2: a call in Terms that do not hold the task it is
    # attached to is left unread. Terms with an empty `control`, and no
    # receiver among their own parties, hold no Control task.
    if T.f.get(15) and 14 not in T.f and recv(T.f) is None:
        return [A("shown", "G2.2")]
    raise Skip("whole asked of Terms with nothing left unread")


def q_act(w, X):
    if X.id in w.bad:
        return [A("invalid", w.bad[X.id])]
    raise Skip("an act that counts")


# What each family is skipped for, where this check reads none of it.
NOT_JUDGED = {
    "fillings": "fillings and their proofs (G10.2): read from the K5 stub's own parameters, a list of answers",
    "rights": "a filling's rights across versions (G10.6)",
    "before_paying": "the sequence walked before paying (G11.4(e)): its list of answers",
}

# Families whose expected `who` is a presentation this check does not derive from draft 25:
# a leg's answer (G11.4) and an agreement's signature (G1.2) name no one this reading must name.
SKIP_WHO = {"leg", "signature_of"}

# Cases whose expected answer this check reads otherwise, by draft 25 (reported, not asserted).
DISAGREE = {
    # Empty. One case was listed here ("Terms whose completing assent rests on Terms not held"):
    # this check read its rule as G4.6, not G4.8; the verifier was corrected to G4.6.
}


def judge(w, ask, args):
    g = lambda i: w.acts.get(arg_id(args[i]))  # noqa: E731
    if ask in NOT_JUDGED:
        raise Skip(NOT_JUDGED[ask])
    if ask == "in_force":
        return q_in_force(w, g(0))
    if ask == "last_version":
        return q_last_version(w, arg_id(args[0]))
    if ask == "update":
        return q_update(w, g(0))
    if ask == "resolution":
        return q_resolution(w, g(0))
    if ask == "assent":
        return q_assent(w, g(0))
    if ask == "order":
        return q_order(w, g(0), g(1))
    if ask == "counter_signature":
        return q_counter(w, g(0))
    if ask == "line":
        return q_line(w, arg_id(args[0]), arg_id(args[1]))
    if ask == "signature_of":
        return q_signature_of(w, g(0))
    if ask == "bound":
        return q_bound(w, arg_id(args[0]), g(1))
    if ask == "receiver":
        return w.receiver(arg_id(args[0]), arg_id(args[1]) if len(args) > 1 else None)
    if ask == "receiver_for_payment":
        p = w.payment(args[0])
        if p is None:
            raise Skip("a payment not held")
        V = w.acts.get(bytes.fromhex(p["version"]))
        if V is None:
            return [A("unchecked", "G1.4")]
        ch = w.chain(V.agreement())
        if V.id in ch["setaside"]:
            # G12.5: read as if the tip had stood alone, where the payer signed none of the branch.
            if bytes.fromhex(p["payer"]) == V.signer:
                raise Skip("a payer who signed the branch set aside")
            if 0 in V.f and w.acts[V.f[0]].id in [x.id for x in ch["versions"]] and recv(V.f) is not None and not is_fp(recv(V.f)):
                out = w.receiver(V.agreement(), V.id)
                for x in out:
                    x["disputed"] = True
                return out
            raise Skip("a version further along a branch set aside")
        if ch["status"] == "fork" and V in ch["tips"]:
            raise Skip("a payment naming a tip of a fork that stands")
        return w.receiver(V.agreement(), V.id)
    if ask == "leg":
        return w.leg(g(0))
    if ask == "silence":
        return w.silence(g(0))
    if ask == "holds_control":
        return q_holds_control(w, g(0))
    if ask == "data":
        return w.data(g(0), arg_id(args[1]))
    if ask == "buyer_leg":
        return w.buyer_leg(args[0])
    if ask == "contest":
        return w.contest(g(0))
    if ask == "baker":
        return q_baker(w, g(0))
    if ask == "takes_new":
        return q_takes_new(w, arg_id(args[0]), int(args[1]))
    if ask == "whole":
        return q_whole(w, g(0))
    if ask == "act":
        return q_act(w, g(0))
    raise Skip(f"a question this check does not read: {ask}")


def unchecked_rule(ask):
    return {"in_force": "G4.6", "last_version": "G4.6", "update": "G4.11", "receiver": "G1.4",
            "assent": "G5.1"}.get(ask)


def run():
    with open(os.path.join(HERE, "agreements-new", "grammar.json"), encoding="utf-8") as fh:
        d = json.load(fh)
    an.D25, an.RB4 = bytes.fromhex(d["spec"]["draft_25"]), bytes.fromhex(d["spec"]["report_block_4"])
    stubs = set(s["cmip"] for s in d["stubs"])
    judged, skipped, disagreed = [], [], []
    for case in d["cases"]:
        want = case["answer"]
        name = case["name"]
        ask, args = case["question"]["ask"], case["question"]["args"]
        try:
            w = World(case, stubs)
            try:
                got = judge(w, ask, args)
            except Unchecked as e:
                rule = e.rule or unchecked_rule(ask)
                if rule is None:
                    raise Skip("unchecked, with no rule this check names")
                got = [A("unchecked", rule)]
        except Skip as e:
            skipped.append((want["rule"], ask, name, str(e)))
            continue
        if want["pick"] >= len(got):
            skipped.append((want["rule"], ask, name, "an answer beside the first this check does not give"))
            continue
        mine = got[want["pick"]]
        keys = ["word", "rule", "qualifier", "disputed"] + ([] if ask in SKIP_WHO else ["who"])
        exp = {k: want[k] for k in keys}
        exp_mine = {k: mine[k] for k in keys}
        if name in DISAGREE:
            # Not asserted: this check's reading, and the expected answer, both shown.
            assert exp != exp_mine, (name, "listed as a disagreement, and agrees")
            disagreed.append((case, exp_mine, DISAGREE[name]))
            continue
        assert exp == exp_mine, (name, "expected", exp, "this check", exp_mine)
        judged.append(name)
    return judged, skipped, disagreed, len(d["cases"])


def main():
    judged, _, _, _ = run()
    return len(judged)


if __name__ == "__main__":
    judged, skipped, disagreed, total = run()
    print(f"grammar.json: {len(judged)} of {total} cases judged again, and agree")
    by = {}
    for rule, ask, name, why in skipped:
        by.setdefault(rule, []).append((ask, name, why))
    print(f"{len(skipped)} not judged, by the grammar rule of the expected answer:")
    for rule in sorted(by):
        print(f"  {rule}:")
        for ask, name, why in by[rule]:
            print(f"    - [{ask}] {name}: {why}")
    if disagreed:
        print(f"{len(disagreed)} not asserted: this check reads draft 25 otherwise:")
        for case, mine, why in disagreed:
            a = case["answer"]
            print(f"  - {case['name']}: expected {a['word']}, {a['rule']}; this check {mine['word']}, {mine['rule']}.")
            print(f"    {why}")
