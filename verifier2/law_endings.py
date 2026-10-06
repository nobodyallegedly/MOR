#!/usr/bin/env python3
"""verifier2: an independent verifier for one part of Law draft 10, collectives' endings.

Written from the specification text alone (spec/MIP-law-draft-10.md, "Made before,
made after", "Fork (type 19)", "Closing (type 20)", rules 35a, 35b, 40, 43, 44d, 47a;
Identity draft 11, "Chain signature (type 16)"; findings F131 and F132), without
reading the reference implementation.  Acts are modelled abstractly: ids, signer,
kind, what each cites; never their bytes.

What it judges, for one collective's story:

  * history: what an act cites, transitively (its previous act in its sequence, the
    acts it names on the collective's chain, a record's or ending's kept tips);
  * done: an act in the collective's name counts only once sealed to every member
    (or public) and on the collective's chain (rule 35a, 35b);
  * endings: forks and closings, complete only with members' chain signatures that
    count and are not void (F132 U1, U4, U4b), under the constitutional change rule
    counted as rule 44d says, done, holding their line, handing out every obligation
    in their history (fork) or owing nothing (closing);
  * which complete ending counts (IT1, U1, U2): a complete ending is final; a later
    one naming it, in `objects` or through a signer's chain, counts for nothing; two
    sharing no signer and naming each other in no way tie until a third names both;
  * the tie rule: an act the counting ending's history does not hold is void; an act a
    decision ending powers (a revocation, a line emptying an area, a departure) does
    not hold is void unless the collective adopted it by an act of its own key that
    counts whose history holds it, or that acknowledges it (F131 IT2a, rule 40);
  * what each successor owes after a fork.

Input: a JSON story (see README.md).  Output: a JSON verdict.

Readings the text left to the implementer are listed in README.md under "Readings".
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from collections import defaultdict

DECISIONS = ("genesis", "rotation", "record", "grant", "revocation")
ENDINGS = ("fork", "closing")
OWN_KEY_ACTIONS = ("publication", "obligation")
# Acts in the collective's name that this verifier judges as counting or not.
COLLECTIVE_ACTS = DECISIONS + OWN_KEY_ACTIONS
INF = float("inf")


class Story:
    """One collective's story, as the verifier reads it."""

    def __init__(self, data: dict, cites: str = "strict"):
        self.cites = cites  # "strict": an action names the decision it acts under in its own objects; "loose": one reached through its previous acts suffices
        self.collective = data["collective"]
        self.founding = data.get("founding")  # the founding agreement's id, where the story names agreements
        self.members = list(data["members"])
        rule = data.get("rule") or {"kind": "every"}
        self.rule_kind = rule.get("kind", "every")
        self.rule_n = int(rule.get("n", 0))
        areas = data.get("areas") or {}
        # area name -> {"holders": [...], "threshold": n}
        self.areas = {k: {"holders": list(v["holders"]), "threshold": int(v.get("threshold", len(v["holders"])))}
                      for k, v in areas.items()}
        self.acts: dict[str, dict] = {}
        for act in data["acts"]:
            a = dict(act)
            a.setdefault("valid", True)
            a.setdefault("held", True)
            a.setdefault("prev", None)
            a.setdefault("cites", [])
            a.setdefault("tips", [])
            a.setdefault("objects", [])
            a.setdefault("acks", [])
            a.setdefault("sigs", [])
            a.setdefault("area", None)
            self.acts[a["id"]] = a
        self.held = {i for i, a in self.acts.items() if a["held"]}
        self._history: dict[str, set[str]] = {}

    # ---- the collective's chain -------------------------------------------------

    def act(self, i: str) -> dict | None:
        a = self.acts.get(i)
        if a is None or not a["held"]:
            return None
        return a

    def is_collective_chain_act(self, i: str) -> bool:
        """Is this act on the collective's chain (a decision or an action in its name)?"""
        a = self.act(i)
        return a is not None and (a["type"] in COLLECTIVE_ACTS or a["type"] in ENDINGS)

    def signed_by_own_key(self, a: dict) -> bool:
        """Signed with the collective's own key (a device strand), not a grant key."""
        return a["type"] in COLLECTIVE_ACTS and a.get("grant") is None

    def direct_refs(self, i: str) -> list[str]:
        """What an act cites directly, for its history (F127, "History")."""
        a = self.act(i)
        if a is None:
            return []
        refs: list[str] = []
        if a["prev"]:
            refs.append(a["prev"])
        refs.extend(a["cites"])
        refs.extend(a["tips"])
        return refs

    def history(self, i: str) -> set[str]:
        """The acts an act's history holds, itself excluded (only held acts are followed)."""
        if i in self._history:
            return self._history[i]
        seen: set[str] = set()
        stack = list(self.direct_refs(i))
        while stack:
            j = stack.pop()
            if j in seen:
                continue
            seen.add(j)
            if self.act(j) is not None:
                stack.extend(self.direct_refs(j))
        self._history[i] = seen
        return seen

    def names_unheld(self, i: str) -> bool:
        """Does the history an act cites name an act the verifier does not hold?"""
        stack = list(self.direct_refs(i))
        seen: set[str] = set()
        while stack:
            j = stack.pop()
            if j in seen:
                continue
            seen.add(j)
            if self.act(j) is None:
                return True
            stack.extend(self.direct_refs(j))
        return False

    def before(self, a: str, line: str) -> bool:
        """An act is before a line when the line's history holds it."""
        return a in self.history(line)

    # ---- done, on the chain (rules 35a, 35b) ------------------------------------

    def on_chain(self, i: str) -> bool:
        """An action citing no decision, or naming on the collective's chain an act that
        is not on it, is on no chain of the collective (rule 35b).  Its own sequence's
        previous act counts as cited, so a decision reached through prev suffices."""
        a = self.act(i)
        if a is None:
            return False
        if a["type"] in DECISIONS:
            return True
        for j in a["cites"]:
            if not self.is_collective_chain_act(j) or self.act(j)["type"] in ENDINGS:
                return False
        if a["prev"] is not None and self.act(a["prev"]) is None:
            return False
        if self.cites == "strict":
            # "An action names, in its inside's objects, ... the decision it acts under"
            # (rule 35b): its own objects name a decision of the collective.
            return any(self.act(j) is not None and self.act(j)["type"] in DECISIONS for j in a["cites"])
        for j in self.history(i):
            b = self.act(j)
            if b is not None and b["type"] in DECISIONS:
                return True
        return False

    def done(self, i: str) -> bool:
        """Sealed to every member of the agreement in force, or public, and on the chain."""
        a = self.act(i)
        if a is None or not a["valid"]:
            return False
        if not a.get("sealed_to_all", True) and not a.get("public", False):
            return False
        if a["type"] in ENDINGS:
            return True  # an ending's line is checked separately
        return self.on_chain(i)


class Verdict:
    def __init__(self):
        self.endings: dict[str, dict] = {}
        self.closed_by: str | None = None
        self.acts: dict[str, dict] = {}
        self.debtors: dict[str, list[str]] = {}

    def to_json(self) -> dict:
        return {
            "closed_by": self.closed_by,
            "endings": {k: self.endings[k] for k in sorted(self.endings)},
            "acts": {k: self.acts[k] for k in sorted(self.acts)},
            "debtors": {k: self.debtors[k] for k in sorted(self.debtors)},
        }


class Verifier:
    def __init__(self, story: Story, handout: str = "binding"):
        self.s = story
        self.handout = handout  # "binding" (F144): only obligations that bind the collective; "done": every done one (the first reading)
        self.verdict = Verdict()

    # ---- departures and voices ----------------------------------------------------

    def in_force_at(self, hist: set[str]) -> str | None:
        """The agreement in force for an act whose history is `hist`: the clone written by
        the record furthest along among the done records in that history that put one
        in force (rule 37c: only the records before it count), else the founding
        agreement.  None where the story names no agreements."""
        if self.s.founding is None:
            return None
        best = None
        for rec in hist:
            a = self.s.act(rec)
            if a is None or a["type"] != "record" or not a.get("clone") or not a.get("clone_complete", True):
                continue
            if not self.s.done(rec) or not self.record_names_in_force(rec):
                continue
            if best is None or len(self.s.history(rec)) > len(self.s.history(best)):
                best = rec
        return self.s.acts[best]["clone"] if best else self.s.founding

    def record_names_in_force(self, rec: str) -> bool:
        """A record naming no clone names the agreement in force for it; one naming a clone
        names that clone (as chain and predecessor); the clone's parent is the agreement
        in force for the record (rule 37c)."""
        a = self.s.acts[rec]
        named = a.get("agreement")
        if named is None or self.s.founding is None:
            return True
        in_force = self.in_force_at(self.s.history(rec))
        if a.get("clone"):
            return named == a["clone"] and a.get("clone_parent", in_force) == in_force
        return named == in_force

    def record_registers(self, rec: str, ending: str | None) -> bool:
        """A record registers what it names only where it is done (W3), names the
        agreement in force for it (rule 37c, B2) and is not after the ending that ended
        the collective (rule 47a: after its line, the keys count for nothing)."""
        a = self.s.act(rec)
        if a is None or a["type"] != "record" or not self.s.done(rec):
            return False
        if not self.record_names_in_force(rec):
            return False
        if ending is not None and not self.s.before(rec, ending):
            return False
        return True

    def departure_lines(self, member: str, area: str | None, ending: str | None) -> list[str]:
        """The counting records registering this member's resignation (any area and the
        constitution) or stepping down from the given area."""
        out = []
        for i, a in self.s.acts.items():
            if a["type"] != "record" or not self.record_registers(i, ending):
                continue
            for reg in a.get("registers", []):
                if reg["member"] != member:
                    continue
                what = reg.get("what", "resign")
                if what == "resign" or (area is not None and what == "stepdown" and reg.get("area") == area):
                    out.append(i)
                    break
        return sorted(out)

    def voice_at_line(self, member: str, line: str, ending: str | None) -> bool:
        """A member's constitutional voice remains at a line unless a counting record in
        the line's history registered their resignation (rule 44d)."""
        for rec in self.departure_lines(member, None, ending):
            if self.s.before(rec, line):
                return False
        return True

    def voices_at_line(self, line: str, ending: str | None) -> list[str]:
        return [m for m in self.s.members if self.voice_at_line(m, line, ending)]

    def need(self, voices: int) -> int:
        """Rule 44d: a number stands where enough voices remain; else all remaining meet it."""
        if self.s.rule_kind == "every":
            return voices
        return min(self.s.rule_n, voices)

    # ---- endings: signatures, U4b, U4, naming -------------------------------------

    def all_ending_acts(self) -> list[str]:
        """Every held fork or closing act of this collective, whatever its state."""
        return sorted(i for i, a in self.s.acts.items()
                      if a["type"] in ENDINGS and a["held"]
                      and a.get("collective", self.s.collective) == self.s.collective)

    def ending_acts(self) -> list[str]:
        """The fork and closing acts that are forks and closings: valid under Identity and
        of the right shape (a fork act breaking the format rules is no fork)."""
        return [i for i in self.all_ending_acts() if self.s.acts[i]["valid"] and self.s.acts[i].get("format_ok", True)]

    def chain_sigs(self) -> dict[str, dict[str, int]]:
        """ending id -> member -> position of the member's earliest counting chain
        signature naming it.  Only chain signatures (Identity type 16) are members'
        signatures on an ending; a signature act (Law type 1) is none (F132 U1)."""
        out: dict[str, dict[str, int]] = defaultdict(dict)
        for i, a in sorted(self.s.acts.items()):
            if a["type"] != "chain_sig" or not a["held"] or not a["valid"] or not a.get("counts", True):
                continue
            e, m, p = a["ending"], a["signer"], int(a["position"])
            if m not in self.s.members:
                continue  # only a member's chain signature is a signature on an ending
            if e not in self.s.acts or self.s.acts[e]["type"] not in ENDINGS:
                continue
            if m not in out[e] or p < out[e][m]:
                out[e][m] = p
        return out

    def objects_names(self, endings: list[str]) -> dict[str, set[str]]:
        """What each ending names in its own `objects`, directly or through the endings it
        names there (transitively)."""
        direct = {e: set(x for x in self.s.acts[e]["objects"] if x in self.s.acts and self.s.acts[x]["type"] in ENDINGS)
                  for e in endings}
        # Through the endings it names there: their objects too, whatever their own state.
        for e in list(direct):
            stack = list(direct[e])
            while stack:
                x = stack.pop()
                for y in self.s.acts[x]["objects"]:
                    if y in self.s.acts and self.s.acts[y]["type"] in ENDINGS and y not in direct[e]:
                        direct[e].add(y)
                        stack.append(y)
        return direct

    def judge_endings(self) -> tuple[list[str], dict[str, dict[str, int]], dict[str, set[str]], dict[str, dict[str, str]]]:
        """Returns (endings that are endings, counting non-void sigs, final naming, signature statuses)."""
        all_endings = self.ending_acts()
        sigs = self.chain_sigs()
        status: dict[str, dict[str, str]] = {e: {} for e in all_endings}
        obj_names = self.objects_names(all_endings)

        # U4b: an ending whose drafter signed, earlier in their own chain than their chain
        # signature on it, another fork or closing of the same collective that it does not
        # name in its objects (directly or through the endings it names) is no ending.
        no_ending: set[str] = set()
        for e in all_endings:
            drafter = self.s.acts[e]["signer"]
            p = sigs.get(e, {}).get(drafter)
            if p is None:
                continue  # reading: with no chain signature of the drafter on it, U4b has no reference point
            for e2 in self.all_ending_acts():
                if e2 == e:
                    continue
                p2 = sigs.get(e2, {}).get(drafter)
                if p2 is not None and p2 < p and e2 not in obj_names[e]:
                    no_ending.add(e)
                    break
        endings = [e for e in all_endings if e not in no_ending]

        # Signatures left: on endings only (a no ending's signatures count for nothing).
        left: dict[str, dict[str, int]] = {e: dict(sigs.get(e, {})) for e in endings}

        def void_pass(naming: dict[str, set[str]]) -> dict[str, dict[str, int]]:
            """U4: a member's signature on E counts for nothing where it lies after their
            own signature (among those left) on another ending that names E."""
            out = {e: {} for e in endings}
            for e in endings:
                for m, p in left[e].items():
                    void = False
                    for e2 in endings:
                        if e2 == e or e not in naming[e2]:
                            continue
                        p2 = left[e2].get(m)
                        if p2 is not None and p2 < p:
                            void = True
                            break
                    if not void:
                        out[e][m] = p
            return out

        # Step 1: by objects.
        obj_only = {e: obj_names[e] & set(endings) for e in endings}
        after1 = void_pass(obj_only)
        left = after1
        # Step 2: among the signatures left, through signers' chains too.
        naming2 = transitive_closure(self.union_naming(endings, obj_only, left))
        after2 = void_pass(naming2)
        left = after2
        # The endings an ending names are read from the signatures left after both steps.
        naming = transitive_closure(self.union_naming(endings, obj_only, left))

        for e in all_endings:
            for m, p in sigs.get(e, {}).items():
                if e in no_ending:
                    status[e][m] = "void"
                elif m in left[e]:
                    status[e][m] = "counts"
                else:
                    status[e][m] = "void"
        return endings, left, naming, status, no_ending

    def union_naming(self, endings, obj_only, left) -> dict[str, set[str]]:
        """An ending names another in its objects, or through a signer's own chain: where
        one member's chain signature on it lies, in their chain, after the same member's
        signature on the other."""
        out = {e: set(obj_only[e]) for e in endings}
        for e in endings:
            for e2 in endings:
                if e2 == e:
                    continue
                for m, p in left[e].items():
                    p2 = left[e2].get(m)
                    if p2 is not None and p2 < p:
                        out[e].add(e2)
                        break
        return out

    # ---- completeness -------------------------------------------------------------

    def fork_complete(self, e: str, sigs: dict[str, int]) -> tuple[bool, list[str]]:
        a = self.s.acts[e]
        s = self.s
        why: list[str] = []
        if s.names_unheld(e):
            why.append("line: an act the history names is not held")
        if not a.get("agreement_ok", True) or not self.ending_names_in_force(e):
            why.append("agreement named is not the one in force at its line")
        if not a.get("chain_act_ok", True):
            why.append("chain act does not count in the original's identity chain")
        if not s.done(e):
            why.append("not done: sealed to too few members and not public")
        sides = a.get("sides", [])
        if len(sides) < 2:
            why.append("fewer than two sides")
        successors = [side["successor"] for side in sides]
        if len(set(successors)) != len(successors) or s.collective in successors:
            why.append("field 4 must name each successor once, never the original")
        if not a.get("successors_ok", True):
            why.append("a successor is not held, or its founding terms do not fit")
        # N1, N4: each successor's founding terms have exactly that side's members as
        # parties, and keep every departed holder of the original and every member whose
        # voice remains on no side (as a departed holder; their share is not modelled).
        voices_now = self.voices_at_line(e, None)
        on_no_side = [m for m in voices_now if not any(m in side.get("members", []) for side in sides)]
        for side in sides:
            if side.get("parties") is None and side.get("keeps") is None:
                continue
            if side.get("parties") is not None and sorted(side["parties"]) != sorted(side.get("members", [])):
                why.append(f"successor {side['successor']}'s founding terms do not have its side's members as parties")
            keeps = side.get("keeps") or []
            for m in on_no_side:
                if m not in keeps:
                    why.append(f"successor {side['successor']} does not keep {m}, a member whose voice remains on no side")
        listed: list[str] = []
        for side in sides:
            listed.extend(side.get("members", []))
        if len(set(listed)) != len(listed):
            why.append("a member is listed on two sides")
        voices = self.voices_at_line(e, None)
        for m in listed:
            if m not in s.members:
                why.append(f"{m} is no member")
            elif m not in voices:
                why.append(f"{m}'s voice does not remain at the line")
            elif m not in sigs:
                why.append(f"{m} has no counting chain signature on it")
        signed = [m for m in listed if m in voices and m in sigs]
        if s.rule_kind == "every":
            if set(signed) != set(voices):
                why.append("the constitutional change rule (every member) is not met")
        else:
            if len(signed) < self.need(len(voices)):
                why.append("the constitutional change rule (threshold) is not met")
        # Hands out everything in the history it cites.
        hist = s.history(e)
        assigned = {x["obligation"]: x["sides"] for x in a.get("assigned", [])}
        if len(assigned) != len(a.get("assigned", [])):
            why.append("field 6 names an obligation twice")
        for ob, side_ixs in assigned.items():
            if sorted(side_ixs) != list(side_ixs) or len(set(side_ixs)) != len(side_ixs) or any(
                    ix < 0 or ix >= len(sides) for ix in side_ixs) or not side_ixs:
                why.append(f"field 6 entry for {ob}: sides must be ascending, each a side the act lists")
        must = self.obligations_to_hand_out(e)
        for ob in must:
            if ob not in assigned:
                why.append(f"does not hand out {ob}")
        succ_signed = a.get("successor_signed", {})
        for ob, side_ixs in assigned.items():
            for ix in side_ixs:
                if 0 <= ix < len(sides):
                    succ = sides[ix]["successor"]
                    if not succ_signed.get(succ, True):
                        why.append(f"successor {succ} did not sign for {ob}")
        return (not why), why

    def ending_names_in_force(self, e: str) -> bool:
        """The agreement an ending names is the one in force at its line, the records
        before the line counted (rule 37c)."""
        named = self.s.acts[e].get("agreement")
        if named is None or self.s.founding is None:
            return True
        return named == self.in_force_at(self.s.history(e))

    def obligations_to_hand_out(self, e: str) -> list[str]:
        """Every obligation of the original in the history the fork cites, published or
        not, paid or not, that binds the collective: done, on its chain, within its
        signer's powers, or adopted (F144, as reworded after the review of F133 to F144);
        one signed with a grant key included. The first reading ("done": every done
        obligation, whether or not its lane signed it) is kept as a switch."""
        hist = self.s.history(e)
        out = []
        if self.handout == "binding":
            judged = self.judge_acts(e)
            for ob in sorted(hist):
                a = self.s.act(ob)
                if a is not None and a["type"] == "obligation" and judged.get(ob, {}).get("counts"):
                    out.append(ob)
            return out
        for ob in sorted(hist):
            a = self.s.act(ob)
            if a is not None and a["type"] == "obligation" and self.s.done(ob):
                out.append(ob)
        return out

    def closing_complete(self, e: str, sigs: dict[str, int]) -> tuple[bool, list[str]]:
        a = self.s.acts[e]
        s = self.s
        why: list[str] = []
        if s.names_unheld(e):
            why.append("line: an act the history names is not held")
        if not a.get("agreement_ok", True) or not self.ending_names_in_force(e):
            why.append("agreement named is not the one in force at its line")
        if not a.get("chain_act_ok", True):
            why.append("chain act does not count in the collective's identity chain")
        if not s.done(e):
            why.append("not done: sealed to too few members and not public")
        voices = self.voices_at_line(e, None)
        signers = sorted(sigs)
        for m in signers:
            if m not in s.members:
                why.append(f"{m} is no member")
            elif m not in voices:
                why.append(f"{m}'s voice does not remain at the line")
        if a["signer"] not in sigs:
            why.append("its signer has no counting chain signature on it")
        good = [m for m in signers if m in voices]
        if s.rule_kind == "every":
            if set(good) != set(voices):
                why.append("the constitutional change rule (every member) is not met")
        elif len(good) < self.need(len(voices)):
            why.append("the constitutional change rule (threshold) is not met")
        if not a.get("holds_nothing", True):
            why.append("the collective holds a stake")
        # Owes nothing: every obligation that binds it and lies in its history is paid
        # in full by the creditor's receipts, or ended by the creditor's release.
        judged = self.judge_acts(e)
        for ob in sorted(s.history(e)):
            b = s.act(ob)
            if b is None or b["type"] != "obligation" or not judged.get(ob, {}).get("counts"):
                continue
            if not self.settled(ob):
                why.append(f"owes {ob}")
        return (not why), why

    def settled(self, ob: str) -> bool:
        b = self.s.act(ob)
        creditor = b.get("creditor")
        amount = int(b.get("amount", 1))
        paid = 0
        for i, p in self.s.acts.items():
            if not p["held"] or not p["valid"] or p.get("obligation") != ob:
                continue
            if p["type"] == "release" and p["signer"] == creditor:
                return True
            if p["type"] == "payment" and p["signer"] == creditor:
                paid += int(p.get("amount", amount))
        return paid >= amount

    # ---- the acts in the collective's name, judged under an ending or none --------

    def judge_acts(self, ending: str | None) -> dict[str, dict]:
        """Which acts in the collective's name count, judged as if `ending` were the
        ending that counts (or none).  Acts of the collective's own key first, later
        acts before the acts their history holds, so that adoption by a later citing
        act is known when the cited act is judged; then the acts of grant keys, which
        depend only on the former (their grant, its revocations, their adopters)."""
        s = self.s
        own = [i for i, a in s.acts.items() if a["held"] and a["type"] in COLLECTIVE_ACTS and a.get("grant") is None]
        keyed = [i for i, a in s.acts.items() if a["held"] and a["type"] in COLLECTIVE_ACTS and a.get("grant") is not None]
        order = later_first(s, own)
        out: dict[str, dict] = {}
        counts: dict[str, bool] = {}

        def adopters(i: str) -> list[str]:
            """Acts of the collective's own key that count, whose history holds i or which
            acknowledge it (rule 40, F131 IT2a, reading U3); before the ending's line where
            an ending counts (rule 47a)."""
            res = []
            for j in order:
                if j == i or not counts.get(j, False):
                    continue
                b = s.acts[j]
                if i in s.history(j) or i in b["acks"]:
                    if ending is None or s.before(j, ending):
                        res.append(j)
            return res

        for i in order:
            a = s.acts[i]
            why: list[str] = []
            adopted = None
            if not a["valid"]:
                why.append("invalid under Identity")
            if not s.done(i):
                why.append("not done (rule 35a) or on no chain (rule 35b)")
            if ending is not None and not s.before(i, ending):
                why.append("outside the ending's history (the tie rule)")
            if a["type"] == "record" and not self.record_names_in_force(i):
                why.append("names an agreement that is not the one in force for it (rule 37c)")
            if a["area"]:
                ok, how = self.consent(i, a, ending, counts, order)
                if not ok:
                    why.append(how)
                elif how:
                    adopted = how
            counts[i] = not why
            out[i] = {"done": s.done(i), "counts": not why, "why": why}
            if adopted:
                out[i]["adopted_by"] = adopted

        for i in later_first(s, keyed):
            a = s.acts[i]
            why: list[str] = []
            adopted = None
            if not a["valid"]:
                why.append("invalid under Identity")
            if not s.done(i):
                why.append("not done (rule 35a) or on no chain (rule 35b)")
            g = s.act(a["grant"])
            if g is None or g["type"] != "grant":
                why.append("cites no grant")
            else:
                if not counts.get(a["grant"], False):
                    why.append("its grant does not count")
                if not g.get("accepted", True):
                    why.append("its grantee did not accept the grant")
                if a["grant"] not in s.history(i):
                    why.append("does not cite its grant")
                if not a.get("within_reach", True):
                    why.append("beyond the grant's reach")
                if a["type"] in DECISIONS or a.get("decision", False):
                    why.append("a grant key signs no decision")
                # Decisions ending the grant's powers that do not hold the act: a
                # revocation, a line emptying its area, the ending itself (rule 43).
                enders = []
                for j in order:
                    b = s.acts[j]
                    if b["type"] == "revocation" and b.get("revokes") == a["grant"] and counts.get(j, False):
                        if not s.before(i, j):
                            enders.append(j)
                if g.get("area"):
                    for j in self.area_emptying_lines(g["area"], ending):
                        if not s.before(i, j):
                            enders.append(j)
                if ending is not None and not s.before(i, ending):
                    enders.append(ending)
                if enders and not why:
                    ad = adopters(i)
                    if ad:
                        adopted = ad[0]
                    else:
                        why.append("a decision ending its grant does not hold it (%s) and nothing adopted it" % ", ".join(sorted(enders)))
            counts[i] = not why
            out[i] = {"done": s.done(i), "counts": not why, "why": why}
            if adopted:
                out[i]["adopted_by"] = adopted
        return out

    def area_emptying_lines(self, area: str, ending: str | None) -> list[str]:
        """Records registering the departure of an area's last holder whose voice there
        remained (rule 37b), counting ones only."""
        holders = set(self.s.areas.get(area, {}).get("holders", []))
        if not holders:
            return []
        out = []
        for i, a in self.s.acts.items():
            if a["type"] != "record" or not self.record_registers(i, ending):
                continue
            gone = set()
            for h in holders:
                for rec in self.departure_lines(h, area, ending):
                    if rec == i or self.s.before(rec, i):
                        gone.add(h)
            if holders <= gone and any(r["member"] in holders for r in a.get("registers", [])):
                out.append(i)
        return sorted(out)

    def consent(self, i: str, a: dict, ending: str | None, counts: dict[str, bool], order: list[str]):
        """Rule 36a: an act an area reaches counts only with its holders' signatures,
        meeting the threshold as rule 44d counts it among the holders whose voice remains
        for the act.  A departure racing a counting citation of the act is set aside
        where the act does not count as judged (F131 IT2a, the IC9 reading)."""
        s = self.s
        area = s.areas.get(a["area"])
        if area is None:
            return False, f"area {a['area']} is not in the agreement"
        holders = area["holders"]
        threshold = area["threshold"]
        sigs = [m for m in a["sigs"] if m in holders]

        def judge(set_aside: set[str]):
            remaining = []
            for h in holders:
                gone = False
                for rec in self.departure_lines(h, a["area"], ending):
                    if rec in set_aside:
                        continue
                    if not s.before(i, rec):
                        gone = True
                        break
                if not gone:
                    remaining.append(h)
            if not remaining:
                return False
            need = threshold if len(remaining) >= threshold else len(remaining)
            return len([m for m in sigs if m in remaining]) >= need

        if judge(set()):
            return True, None
        # Departures racing a counting citation of the act, set aside.
        citers = []
        for j in order:
            if j == i or not counts.get(j, False):
                continue
            b = s.acts[j]
            if s.signed_by_own_key(b) and (i in s.history(j) or i in b["acks"]):
                if ending is None or s.before(j, ending):
                    citers.append(j)
        for c in citers:
            racing = set()
            for h in holders:
                for rec in self.departure_lines(h, a["area"], ending):
                    if not s.before(c, rec) and not s.before(rec, c):
                        racing.add(rec)
            if racing and judge(racing):
                return True, c
        return False, "the area's holders did not meet its threshold (rule 36a, 44d)"

    # ---- the whole judgment ---------------------------------------------------------

    def run(self) -> Verdict:
        v = self.verdict
        endings, sigs, naming, status, no_ending = self.judge_endings()
        complete: list[str] = []
        for e in self.ending_acts():
            a = self.s.acts[e]
            if e in no_ending:
                v.endings[e] = {"status": "no-ending", "counts": False, "signatures": status[e],
                                "names": [], "why": ["its drafter signed earlier an ending it does not name (U4b)"]}
                continue
            if a["type"] == "fork":
                ok, why = self.fork_complete(e, sigs[e])
            else:
                ok, why = self.closing_complete(e, sigs[e])
            v.endings[e] = {"status": "complete" if ok else "incomplete", "counts": False,
                            "signatures": status[e], "names": sorted(naming[e]), "why": why}
            if ok:
                complete.append(e)
        # Of the complete endings, the one that counts is the one every other names or is
        # named by, and that names no other such one.
        candidates = []
        for e in complete:
            if all(e2 == e or e2 in naming[e] or e in naming[e2] for e2 in complete):
                candidates.append(e)
        counting = [e for e in candidates if not any(e2 != e and e2 in naming[e] for e2 in candidates)]
        v.closed_by = counting[0] if len(counting) == 1 else None
        if v.closed_by:
            v.endings[v.closed_by]["counts"] = True
        for e in self.ending_acts():
            v.endings[e].setdefault("counts", False)
            if e in no_ending:
                continue
            if e in complete and e != v.closed_by:
                if e in candidates:
                    v.endings[e]["why"] = ["names a complete ending that counts, or is not the one that counts"]
                else:
                    v.endings[e]["why"] = ["concurrent with another complete ending (neither names the other)"]
        v.acts = self.judge_acts(v.closed_by)
        # Debtors: what each successor owes after the counting fork.
        if v.closed_by and self.s.acts[v.closed_by]["type"] == "fork":
            f = self.s.acts[v.closed_by]
            sides = f.get("sides", [])
            for x in f.get("assigned", []):
                ob = x["obligation"]
                if v.acts.get(ob, {}).get("counts"):
                    v.debtors[ob] = sorted(sides[ix]["successor"] for ix in x["sides"] if 0 <= ix < len(sides))
        return v


def transitive_closure(rel: dict[str, set[str]]) -> dict[str, set[str]]:
    out = {k: set(vs) for k, vs in rel.items()}
    changed = True
    while changed:
        changed = False
        for k in out:
            add = set()
            for x in out[k]:
                add |= out.get(x, set())
            if not add <= out[k]:
                out[k] |= add
                changed = True
    return out


def later_first(s: Story, ids: list[str]) -> list[str]:
    """A deterministic order in which every act comes before every act its history
    holds (so later acts are judged first)."""
    hist = {i: s.history(i) for i in ids}
    # Sort by history size descending (an act's history strictly contains the history of
    # every act it holds), ties broken by id.
    return sorted(ids, key=lambda i: (-len(hist[i]), i))


def verify(data: dict, handout: str = "binding", cites: str = "strict") -> dict:
    return Verifier(Story(data, cites=cites), handout=handout).run().to_json()


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description="verifier2: Law draft 10, collectives' endings")
    ap.add_argument("paths", nargs="+", help="story files (.json), or directories of them")
    ap.add_argument("--handout", choices=["done", "binding"], default="binding",
                    help="which obligations a fork must hand out: every done one in its history (the text's words), or only binding ones")
    ap.add_argument("--cites", choices=["strict", "loose"], default="strict",
                    help="what 'citing no decision' means: the action's own objects name none (strict), or none is reached through its previous acts either (loose)")
    ap.add_argument("--out", help="directory to write one verdict per story into")
    ap.add_argument("--quiet", action="store_true")
    args = ap.parse_args(argv)
    files = []
    for p in args.paths:
        if os.path.isdir(p):
            files.extend(sorted(os.path.join(p, f) for f in os.listdir(p) if f.endswith(".json")))
        else:
            files.append(p)
    if args.out:
        os.makedirs(args.out, exist_ok=True)
    for f in files:
        with open(f) as fh:
            data = json.load(fh)
        verdict = verify(data, handout=args.handout, cites=args.cites)
        if args.out:
            with open(os.path.join(args.out, os.path.basename(f)), "w") as fh:
                json.dump(verdict, fh, indent=1, sort_keys=True)
        if not args.quiet:
            print(json.dumps({"story": f, **verdict}, indent=1, sort_keys=True))
    return 0


if __name__ == "__main__":
    sys.exit(main())
