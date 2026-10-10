#!/usr/bin/env python3
"""Tests for verifier2, each a story from Agreements draft 10's freeze scenarios (suite v21,
3.9f, 3.9l, 3.9n, 3.9p, 3.9w, 3.9x, 3.9y, 3.9ab, 3.9ac) or from the smallest stories
in docs/law-invariants.md (IC5, IC8, IC9), written from the text.

Run: python3 test_agreements_endings.py        (also writes each story to stories/*.json)
"""

import json
import os
import sys
import unittest

from agreements_endings import verify

STORIES: dict[str, dict] = {}


def story(name, members, acts, rule=None, areas=None, collective="C"):
    data = {"collective": collective, "members": members, "rule": rule or {"kind": "every"},
            "areas": areas or {}, "acts": acts}
    STORIES[name] = data
    return data


def genesis():
    return {"id": "genesis", "type": "genesis", "signer": "C"}


def act(id, type, prev=None, cites=(), **kw):
    a = {"id": id, "type": type, "signer": kw.pop("signer", "C/d0"), "prev": prev, "cites": list(cites)}
    a.update(kw)
    return a


def sig(member, ending, position, id=None, counts=True):
    return {"id": id or f"sig/{member}/{ending}", "type": "chain_sig", "signer": member,
            "ending": ending, "position": position, "counts": counts}


def fork(id, signer, tips, sides, assigned=(), objects=(), **kw):
    a = {"id": id, "type": "fork", "signer": signer, "tips": list(tips), "sides": sides,
         "assigned": list(assigned), "objects": list(objects), "public": True}
    a.update(kw)
    return a


def closing(id, signer, tips, objects=(), **kw):
    a = {"id": id, "type": "closing", "signer": signer, "tips": list(tips), "objects": list(objects), "public": True}
    a.update(kw)
    return a


SIDES_AB = [{"successor": "S1", "members": ["ana"]}, {"successor": "S2", "members": ["ben"]}]


class Done(unittest.TestCase):
    def test_done_and_on_chain(self):
        """Rules 35a, 35b: a debt sealed to every member and citing the chain binds; one
        sealed to too few, or citing nothing, counts for nothing."""
        s = story("done", ["ana", "ben"], [
            genesis(),
            act("d1", "obligation", cites=["genesis"], creditor="eve", amount=10),
            act("d2", "obligation", prev="d1", creditor="eve", amount=10, sealed_to_all=False),
            act("d3", "obligation", signer="C/d1", creditor="eve", amount=10),  # cites nothing
            act("d4", "obligation", prev="d2", creditor="eve", amount=10),  # its prev chain reaches genesis, its objects name nothing
        ])
        v = verify(s)
        self.assertTrue(v["acts"]["d1"]["counts"])
        self.assertFalse(v["acts"]["d2"]["counts"])
        self.assertFalse(v["acts"]["d3"]["counts"])
        # Strict: an action names the decision it acts under in its own objects (rule 35b).
        self.assertFalse(v["acts"]["d4"]["counts"])
        self.assertTrue(verify(s, cites="loose")["acts"]["d4"]["counts"])
        self.assertIsNone(v["closed_by"])


class Endings(unittest.TestCase):
    def test_9w_a_complete_ending_is_final(self):
        """3.9w (F131, IT1): a second fork naming the first counts for nothing; a closing
        naming both too."""
        s = story("9w", ["ana", "ben"], [
            genesis(),
            act("p1", "publication", cites=["genesis"]),
            fork("F1", "ana", ["p1"], SIDES_AB),
            sig("ana", "F1", 1), sig("ben", "F1", 1),
            fork("F2", "ana", ["p1"], SIDES_AB, objects=["F1"]),
            sig("ana", "F2", 2), sig("ben", "F2", 2),
            closing("C3", "ben", ["p1"], objects=["F1", "F2"]),
            sig("ana", "C3", 3), sig("ben", "C3", 3),
        ])
        v = verify(s)
        self.assertEqual(v["closed_by"], "F1")
        self.assertEqual(v["endings"]["F2"]["status"], "complete")
        self.assertFalse(v["endings"]["F2"]["counts"])
        self.assertFalse(v["endings"]["C3"]["counts"])

    def test_u1_a_signers_chain_orders_two_endings(self):
        """3.9ab (F132, U1): Ana, Ben and Cy, two of three sufficing: Ana and Ben close
        their collective.  Cy, who did not sign it, drafts a second closing naming
        nothing in its objects, and Ben signs it: it names the first through Ben's chain,
        counts for nothing, and the first stays final.  A closing signed by signature
        acts (Agreements type 1), the old way, has no signature at all."""
        s = story("u1", ["ana", "ben", "cy"], [
            genesis(),
            act("p1", "publication", cites=["genesis"]),
            closing("C1", "ana", ["p1"]),
            sig("ana", "C1", 1), sig("ben", "C1", 1),
            closing("C2", "cy", ["p1"]),
            sig("cy", "C2", 1), sig("ben", "C2", 2),
            closing("C3", "cy", ["p1"], objects=["C1", "C2"]),
            {"id": "sa", "type": "sig_act", "signer": "ana", "ending": "C3"},
            {"id": "sb", "type": "sig_act", "signer": "ben", "ending": "C3"},
        ], rule={"kind": "threshold", "n": 2})
        v = verify(s)
        self.assertEqual(v["closed_by"], "C1")
        self.assertEqual(v["endings"]["C2"]["status"], "complete")
        self.assertIn("C1", v["endings"]["C2"]["names"])
        self.assertEqual(v["endings"]["C3"]["status"], "incomplete")
        self.assertEqual(v["endings"]["C3"]["signatures"], {})

    def test_u2_a_true_tie_settled_by_a_third(self):
        """3.9ab (F132, U2): two closings sharing no signer, neither naming the other:
        neither counts; a third naming one in its objects and the other through a
        signer's chain counts."""
        base = [
            genesis(),
            act("p1", "publication", cites=["genesis"]),
            closing("C1", "ana", ["p1"]),
            sig("ana", "C1", 1), sig("ben", "C1", 1),
            closing("C2", "cy", ["p1"]),
            sig("cy", "C2", 1), sig("dee", "C2", 1),
        ]
        s = story("u2-tie", ["ana", "ben", "cy", "dee"], base, rule={"kind": "threshold", "n": 2})
        v = verify(s)
        self.assertIsNone(v["closed_by"])
        self.assertEqual(v["endings"]["C1"]["status"], "complete")
        self.assertEqual(v["endings"]["C2"]["status"], "complete")
        s = story("u2-settled", ["ana", "ben", "cy", "dee"], base + [
            closing("C3", "ana", ["p1"], objects=["C1"]),
            sig("ana", "C3", 2), sig("cy", "C3", 2),
        ], rule={"kind": "threshold", "n": 2})
        v = verify(s)
        self.assertEqual(v["closed_by"], "C3")
        self.assertEqual(sorted(v["endings"]["C3"]["names"]), ["C1", "C2"])

    def test_u4_an_old_proposal_finished_late(self):
        """3.9ac (F132, U4): Ana's late signature on the proposal, after her signature on
        the closing naming it, counts for nothing."""
        s = story("u4", ["ana", "ben"], [
            genesis(),
            act("p1", "publication", cites=["genesis"]),
            closing("P", "ben", ["p1"]),
            sig("ben", "P", 1),
            closing("X", "ben", ["p1"], objects=["P"]),
            sig("ana", "X", 1), sig("ben", "X", 2),
            sig("ana", "P", 2),
        ])
        v = verify(s)
        self.assertEqual(v["closed_by"], "X")
        self.assertEqual(v["endings"]["P"]["signatures"]["ana"], "void")
        self.assertEqual(v["endings"]["P"]["status"], "incomplete")

    def test_u4_stated_cost_under_a_threshold(self):
        """3.9ac: Cy, who signed neither, finishes the proposal with Ben's earlier
        signature: it counts as the earlier ending, the second for nothing."""
        s = story("u4-cost", ["ana", "ben", "cy"], [
            genesis(),
            act("p1", "publication", cites=["genesis"]),
            closing("P", "ben", ["p1"]),
            sig("ben", "P", 1),
            closing("X", "ben", ["p1"], objects=["P"]),
            sig("ana", "X", 1), sig("ben", "X", 2),
            sig("cy", "P", 1),
        ], rule={"kind": "threshold", "n": 2})
        v = verify(s)
        self.assertEqual(v["closed_by"], "P")
        self.assertEqual(v["endings"]["X"]["status"], "complete")
        self.assertFalse(v["endings"]["X"]["counts"])

    def test_u4b_a_drafter_names_the_endings_they_signed(self):
        """3.9ac (F132, U4b): Ben's second fork leaving out the first, which he signed, is
        no fork; Ana then finishes the first, which ends the collective."""
        s = story("u4b", ["ana", "ben"], [
            genesis(),
            act("p1", "publication", cites=["genesis"]),
            fork("F1", "ben", ["p1"], SIDES_AB),
            sig("ben", "F1", 1),
            fork("F2", "ben", ["p1"], SIDES_AB),
            sig("ana", "F2", 1), sig("ben", "F2", 2),
            sig("ana", "F1", 2),
        ])
        v = verify(s)
        self.assertEqual(v["endings"]["F2"]["status"], "no-ending")
        self.assertEqual(v["closed_by"], "F1")

    def test_9p_a_closing_not_done_takes_no_effect(self):
        """3.9p (W5): a closing sealed to one member takes no effect; public, it does."""
        for sealed, expect in ((False, None), (True, "C1")):
            s = story("9p-%s" % ("public" if sealed else "sealed-to-one"), ["ana", "ben"], [
                genesis(),
                act("p1", "publication", cites=["genesis"]),
                closing("C1", "ana", ["p1"], public=sealed, sealed_to_all=False),
                sig("ana", "C1", 1), sig("ben", "C1", 1),
            ])
            self.assertEqual(verify(s)["closed_by"], expect)

    def test_fork_under_a_threshold_with_a_member_on_no_side(self):
        """3.9d (N1): under two of three, two members fork without the third."""
        s = story("threshold-fork", ["ana", "ben", "cy"], [
            genesis(),
            act("p1", "publication", cites=["genesis"]),
            fork("F1", "ana", ["p1"], SIDES_AB),
            sig("ana", "F1", 1), sig("ben", "F1", 1),
        ], rule={"kind": "threshold", "n": 2})
        self.assertEqual(verify(s)["closed_by"], "F1")
        s = story("every-fork-member-on-no-side", ["ana", "ben", "cy"], s["acts"])
        self.assertIsNone(verify(s)["closed_by"])

    def test_a_departed_member_signs_no_fork(self):
        """A member whose resignation a record before the line registered has no voice at
        the line; the others fork without them."""
        s = story("departed-forks", ["ana", "ben", "cy"], [
            genesis(),
            act("r1", "record", cites=["genesis"], registers=[{"member": "cy", "what": "resign"}]),
            fork("F1", "ana", ["r1"], SIDES_AB),
            sig("ana", "F1", 1), sig("ben", "F1", 1),
            fork("F2", "ana", ["r1"], [{"successor": "S1", "members": ["ana", "cy"]}, {"successor": "S2", "members": ["ben"]}], objects=["F1"]),
            sig("ana", "F2", 2), sig("ben", "F2", 2), sig("cy", "F2", 1),
        ])
        v = verify(s)
        self.assertEqual(v["closed_by"], "F1")
        self.assertEqual(v["endings"]["F2"]["status"], "incomplete")


class TieRule(unittest.TestCase):
    def test_9x_a_cited_act_is_adopted(self):
        """3.9x (F131, IT2a): the sale device 1 cited binds against device 0's racing
        revocation; the agent's act after it is void."""
        s = story("9x", ["ana", "ben"], [
            genesis(),
            act("G", "grant", cites=["genesis"], grantee="agent", accepted=True),
            act("S", "publication", signer="G/key", grant="G", cites=["G"]),
            act("S2", "publication", signer="G/key", grant="G", prev="S"),
            act("p1", "publication", signer="C/d1", cites=["G", "S"]),
            act("R", "revocation", prev="G", revokes="G"),
        ])
        v = verify(s)
        self.assertTrue(v["acts"]["S"]["counts"])
        self.assertEqual(v["acts"]["S"]["adopted_by"], "p1")
        self.assertFalse(v["acts"]["S2"]["counts"])
        self.assertTrue(v["acts"]["R"]["counts"])

    def test_a_revocation_holding_the_act(self):
        """Rule 40: an act the revocation's history holds binds; one after it is void."""
        s = story("revocation-holds", ["ana", "ben"], [
            genesis(),
            act("G", "grant", cites=["genesis"], grantee="agent"),
            act("S", "publication", signer="G/key", grant="G", cites=["G"]),
            act("R", "revocation", prev="G", revokes="G", cites=["S"]),
            act("S2", "publication", signer="G/key", grant="G", prev="S", cites=["R"]),
        ])
        v = verify(s)
        self.assertTrue(v["acts"]["S"]["counts"])
        self.assertFalse(v["acts"]["S2"]["counts"])

    def test_9y_a_stale_line_is_a_stated_cost(self):
        """3.9y (F131, IT2b): a fork drawn before a cited debt is complete; the debt and
        its citation are void, legibly."""
        s = story("9y", ["ana", "ben"], [
            genesis(),
            act("p0", "publication", cites=["genesis"]),
            act("D", "obligation", prev="p0", creditor="eve", amount=5),
            act("p1", "publication", prev="D"),
            fork("F1", "ana", ["p0"], SIDES_AB),
            sig("ana", "F1", 1), sig("ben", "F1", 1),
        ])
        v = verify(s)
        self.assertEqual(v["closed_by"], "F1")
        self.assertFalse(v["acts"]["D"]["counts"])
        self.assertFalse(v["acts"]["p1"]["counts"])
        self.assertEqual(v["debtors"], {})

    def test_9n_the_tie_rule_at_a_closing(self):
        """3.9n (F127): a public debt on a device a closing's history does not cite is
        void and does not keep the collective from closing; cited, it does."""
        acts = [
            genesis(),
            act("p0", "publication", cites=["genesis"]),
            act("D", "obligation", signer="C/d1", cites=["genesis"], creditor="eve", amount=5, public=True),
        ]
        s = story("9n-uncited", ["ana", "ben"], acts + [
            closing("C1", "ana", ["p0"]), sig("ana", "C1", 1), sig("ben", "C1", 1)])
        v = verify(s)
        self.assertEqual(v["closed_by"], "C1")
        self.assertFalse(v["acts"]["D"]["counts"])
        s = story("9n-cited", ["ana", "ben"], acts + [
            closing("C1", "ana", ["p0", "D"]), sig("ana", "C1", 1), sig("ben", "C1", 1)])
        v = verify(s)
        self.assertIsNone(v["closed_by"])
        self.assertIn("owes D", v["endings"]["C1"]["why"])

    def test_ic8_a_record_after_the_ending_registers_nothing(self):
        """A resignation registered by a record outside the fork's history removes no
        voice from an act inside it."""
        s = story("ic8", ["ana", "ben"], [
            genesis(),
            act("D", "obligation", cites=["genesis"], creditor="eve", amount=5, area="finance", sigs=["ben"]),
            act("r1", "record", signer="C/d2", cites=["genesis"], registers=[{"member": "ben", "what": "resign"}]),
            fork("F1", "ana", ["D"], SIDES_AB, assigned=[{"obligation": "D", "sides": [0]}]),
            sig("ana", "F1", 1), sig("ben", "F1", 1),
        ], areas={"finance": {"holders": ["ben"], "threshold": 1}})
        v = verify(s)
        self.assertEqual(v["closed_by"], "F1")
        self.assertTrue(v["acts"]["D"]["counts"])
        self.assertFalse(v["acts"]["r1"]["counts"])
        self.assertEqual(v["debtors"], {"D": ["S1"]})

    def test_ic9_a_departure_racing_a_citation_takes_no_voice(self):
        """A grant the Money area's two holders sign, cited by the other device; both
        holders then leave by records on a device that never saw the citation: the grant
        counts, the departures racing its citation set aside."""
        acts = [
            genesis(),
            act("G", "grant", cites=["genesis"], grantee="agent", area="finance", sigs=["ana", "ben"]),
            act("p1", "publication", signer="C/d2", cites=["G"]),
            act("r1", "record", signer="C/d1", cites=["genesis"], registers=[{"member": "ana", "what": "resign"}]),
            act("r2", "record", signer="C/d1", prev="r1", registers=[{"member": "ben", "what": "resign"}]),
        ]
        s = story("ic9", ["ana", "ben", "cy"], acts, areas={"finance": {"holders": ["ana", "ben"], "threshold": 2}})
        v = verify(s)
        self.assertTrue(v["acts"]["G"]["counts"])
        self.assertEqual(v["acts"]["G"]["adopted_by"], "p1")
        # Without the citation, the departures race the grant and the ending wins.
        s = story("ic9-uncited", ["ana", "ben", "cy"], [a for a in acts if a["id"] != "p1"],
                  areas={"finance": {"holders": ["ana", "ben"], "threshold": 2}})
        self.assertFalse(verify(s)["acts"]["G"]["counts"])

    def test_an_area_emptied_ends_its_grants(self):
        """Rule 37b, G2: an act of a grant key the emptying line holds binds; one it does
        not hold is void."""
        s = story("area-emptied", ["ana", "ben"], [
            genesis(),
            act("G", "grant", cites=["genesis"], grantee="agent", area="finance", sigs=["ana"]),
            act("S", "publication", signer="G/key", grant="G", cites=["G"]),
            act("S2", "publication", signer="G/key", grant="G", prev="S"),
            act("r1", "record", prev="G", tips=["S"], registers=[{"member": "ana", "what": "stepdown", "area": "finance"}]),
        ], areas={"finance": {"holders": ["ana"], "threshold": 1}})
        v = verify(s)
        self.assertTrue(v["acts"]["S"]["counts"])
        self.assertFalse(v["acts"]["S2"]["counts"])


class Forks(unittest.TestCase):
    def test_a_fork_hands_out_its_whole_history(self):
        """A debt on another device the line's history joined must be handed out; one on
        a device it leaves out is void and owed by nobody."""
        acts = [
            genesis(),
            act("D1", "obligation", cites=["genesis"], creditor="eve", amount=5),
            act("D2", "obligation", signer="C/d1", cites=["genesis", "D1"], creditor="eve", amount=7),
            act("D3", "obligation", signer="C/d2", cites=["genesis"], creditor="eve", amount=9),
        ]
        s = story("handout-missing", ["ana", "ben"], acts + [
            fork("F1", "ana", ["D2"], SIDES_AB, assigned=[{"obligation": "D2", "sides": [1]}]),
            sig("ana", "F1", 1), sig("ben", "F1", 1)])
        v = verify(s)
        self.assertEqual(v["endings"]["F1"]["status"], "incomplete")
        self.assertIn("does not hand out D1", v["endings"]["F1"]["why"])
        s = story("handout-complete", ["ana", "ben"], acts + [
            fork("F1", "ana", ["D2"], SIDES_AB, assigned=[{"obligation": "D1", "sides": [0, 1]}, {"obligation": "D2", "sides": [1]}]),
            sig("ana", "F1", 1), sig("ben", "F1", 1)])
        v = verify(s)
        self.assertEqual(v["closed_by"], "F1")
        self.assertEqual(v["debtors"], {"D1": ["S1", "S2"], "D2": ["S2"]})
        self.assertFalse(v["acts"]["D3"]["counts"])

    def test_ic5_no_successor_owes_a_debt_outside_the_history(self):
        """A fork drawn one act earlier that lists the debt anyway: the debt binds no one."""
        s = story("ic5", ["ana", "ben"], [
            genesis(),
            act("p0", "publication", cites=["genesis"]),
            act("D", "obligation", prev="p0", creditor="eve", amount=5),
            fork("F1", "ana", ["p0"], SIDES_AB, assigned=[{"obligation": "D", "sides": [0]}]),
            sig("ana", "F1", 1), sig("ben", "F1", 1),
        ])
        v = verify(s)
        self.assertEqual(v["closed_by"], "F1")
        self.assertEqual(v["debtors"], {})

    def test_an_unheld_act_in_the_history(self):
        """A verifier that does not hold every act the history names cannot tell what it
        must hand out: for it, the fork is not complete."""
        s = story("unheld", ["ana", "ben"], [
            genesis(),
            act("p0", "publication", cites=["genesis"], held=False),
            act("p1", "publication", prev="p0"),
            fork("F1", "ana", ["p1"], SIDES_AB),
            sig("ana", "F1", 1), sig("ben", "F1", 1),
        ])
        self.assertEqual(verify(s)["endings"]["F1"]["status"], "incomplete")

    def test_a_successor_signs_for_its_debt(self):
        s = story("successor-unsigned", ["ana", "ben"], [
            genesis(),
            act("D", "obligation", cites=["genesis"], creditor="eve", amount=5),
            fork("F1", "ana", ["D"], SIDES_AB, assigned=[{"obligation": "D", "sides": [0]}], successor_signed={"S1": False}),
            sig("ana", "F1", 1), sig("ben", "F1", 1),
        ])
        self.assertEqual(verify(s)["endings"]["F1"]["status"], "incomplete")


class Closings(unittest.TestCase):
    def test_9f_a_collective_owing_nothing_closes(self):
        """3.9f (N9, D5, 47b): a closing while owing does not take effect; it completes
        once one debt is paid and the other released by its creditor; a release by
        anyone else ends nothing."""
        base = [
            genesis(),
            act("D1", "obligation", cites=["genesis"], creditor="eve", amount=10),
            act("D2", "obligation", prev="D1", cites=["genesis"], creditor="fay", amount=20),
            closing("C1", "ana", ["D2"]), sig("ana", "C1", 1), sig("ben", "C1", 1),
        ]
        s = story("9f-owing", ["ana", "ben"], base)
        self.assertIsNone(verify(s)["closed_by"])
        s = story("9f-stranger-release", ["ana", "ben"], base + [
            {"id": "pay1", "type": "payment", "signer": "eve", "obligation": "D1", "amount": 10},
            {"id": "rel2", "type": "release", "signer": "gus", "obligation": "D2"}])
        self.assertIsNone(verify(s)["closed_by"])
        s = story("9f-settled", ["ana", "ben"], base + [
            {"id": "pay1a", "type": "payment", "signer": "eve", "obligation": "D1", "amount": 4},
            {"id": "pay1b", "type": "payment", "signer": "eve", "obligation": "D1", "amount": 6},
            {"id": "pay2", "type": "payment", "signer": "fay", "obligation": "D2", "amount": 5},
            {"id": "rel2", "type": "release", "signer": "fay", "obligation": "D2"}])
        self.assertEqual(verify(s)["closed_by"], "C1")
        s = story("9f-debtor-receipt", ["ana", "ben"], base + [
            {"id": "pay1", "type": "payment", "signer": "C/d0", "obligation": "D1", "amount": 10},
            {"id": "rel2", "type": "release", "signer": "fay", "obligation": "D2"}])
        self.assertIsNone(verify(s)["closed_by"])

    def test_9l_a_record_not_done_is_no_line(self):
        """3.9l (W3): a record sealed to nobody registers nothing; the member's voice
        remains, and a closing without them does not complete."""
        s = story("9l", ["ana", "ben"], [
            genesis(),
            act("r1", "record", cites=["genesis"], registers=[{"member": "ben", "what": "resign"}], sealed_to_all=False),
            closing("C1", "ana", ["r1"]), sig("ana", "C1", 1),
        ])
        v = verify(s)
        self.assertIsNone(v["closed_by"])
        self.assertFalse(v["acts"]["r1"]["counts"])
        s = story("9l-done", ["ana", "ben"], [
            genesis(),
            act("r1", "record", cites=["genesis"], registers=[{"member": "ben", "what": "resign"}]),
            closing("C1", "ana", ["r1"]), sig("ana", "C1", 1),
        ])
        self.assertEqual(verify(s)["closed_by"], "C1")


def write_stories():
    here = os.path.join(os.path.dirname(os.path.abspath(__file__)), "stories")
    os.makedirs(here, exist_ok=True)
    for name, data in STORIES.items():
        with open(os.path.join(here, name + ".json"), "w") as fh:
            json.dump(data, fh, indent=1)
            fh.write("\n")


if __name__ == "__main__":
    result = unittest.main(exit=False, verbosity=1)
    write_stories()
    sys.exit(0 if result.result.wasSuccessful() else 1)
