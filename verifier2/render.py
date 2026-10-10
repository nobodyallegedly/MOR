#!/usr/bin/env python3
"""Render a story and both verdicts in plain words (for the report)."""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from agreements_endings import verify  # noqa: E402


def render(story: dict, ref: dict, diffs: list[dict], handout="done", cites="strict") -> str:
    names = dict(story.get("names", {}))
    mine = verify(story, handout=handout, cites=cites)
    acts = sorted(story["acts"], key=lambda a: a.get("order", 0))
    # Short names for acts, in creation order.
    counter = {}
    for a in acts:
        if a["id"] in names:
            continue
        t = a["type"]
        base = {"chain_sig": "sig", "publication": "pub", "obligation": "debt", "record": "rec", "revocation": "rev", "grant": "grant",
                "fork": "fork", "closing": "closing", "payment": "pay", "release": "release", "genesis": "genesis"}.get(t, t)
        counter[base] = counter.get(base, 0) + 1
        names[a["id"]] = f"{base}{counter[base]}" if base != "genesis" else "genesis"

    def n(x):
        if isinstance(x, list):
            return "[" + ", ".join(n(y) for y in x) + "]"
        if x is None:
            return "none"
        if x in names:
            return names[x]
        if isinstance(x, str) and x.startswith("C/"):
            return x
        if isinstance(x, str) and x.endswith("/key"):
            return n(x[:-4]) + "'s key"
        return str(x)[:8]

    lines = []
    lines.append("shape: " + story["meta"]["shape"])
    lines.append("members: " + ", ".join(n(m) for m in story["members"]) + "; rule: " + json.dumps(story["rule"]) +
                 ("; areas: " + ", ".join(f"{k} held by {n(v['holders'])} threshold {v['threshold']}" for k, v in story["areas"].items()) if story["areas"] else ""))
    lines.append("steps: " + " | ".join(story["meta"]["ops"]))
    lines.append("acts, in the order made:")
    for a in acts:
        t = a["type"]
        parts = [f"  {n(a['id'])}: {t}"]
        if t == "chain_sig":
            parts.append(f"by {n(a['signer'])} on {n(a['ending'])}, position {a['position']}" + ("" if a.get("counts", True) else ", not counting"))
        elif t in ("payment", "release"):
            parts.append(f"by {n(a['signer'])} on {n(a['obligation'])}" + (f", amount {a['amount']}" if t == "payment" else ""))
        else:
            parts.append(f"by {n(a['signer'])}")
            if a.get("prev"):
                parts.append(f"prev {n(a['prev'])}")
            if a.get("cites"):
                parts.append("cites " + n(a["cites"]))
            if a.get("tips"):
                parts.append("tips " + n(a["tips"]))
            if a.get("acks"):
                parts.append("acks " + n(a["acks"]))
            if a.get("objects"):
                parts.append("objects " + n(a["objects"]))
            if t == "fork":
                parts.append("sides " + "; ".join(f"{n(s['successor'])}: {n(s['members'])}" for s in a["sides"]))
                parts.append("hands out " + (", ".join(f"{n(x['obligation'])} to sides {x['sides']}" for x in a["assigned"]) or "nothing"))
            if t == "obligation":
                parts.append(f"to {n(a['creditor'])} for {a['amount']}")
            if t == "record" and a.get("registers"):
                parts.append("registers " + ", ".join(f"{n(r['member'])} {r['what']}" for r in a["registers"]))
            if t == "revocation":
                parts.append("revokes " + n(a["revokes"]))
            if t == "grant":
                parts.append("to " + n(a["grantee"]) + ("" if a.get("accepted", True) else ", not accepted"))
            if a.get("area"):
                parts.append(f"area {a['area']} signed by {n(a.get('sigs', []))}")
            if a.get("grant"):
                parts.append("under " + n(a["grant"]) + ("" if a.get("within_reach", True) else ", beyond its reach"))
            seal = "public" if a.get("public") else ("sealed to every member" if a.get("sealed_to_all") else "sealed to too few")
            parts.append(seal)
            if not a.get("valid", True):
                parts.append("INVALID under Identity")
        lines.append(", ".join(parts))
    lines.append("verdicts:")
    lines.append(f"  closed_by: mine {n(mine['closed_by'])}, ref {n(ref['closed_by'])}")
    for e in sorted(ref["endings"], key=lambda x: names.get(x, x)):
        mv, rv = mine["endings"].get(e, {}), ref["endings"][e]
        lines.append(f"  {n(e)}: mine {mv.get('status')} (counts {mv.get('counts')}; sigs {mv.get('signatures')}; why: {'; '.join(mv.get('why', []))})")
        lines.append(f"  {' ' * len(n(e))}  ref  {rv['status']} (counts {rv['counts']}; sigs {rv['signatures']}; why: {'; '.join(rv['why'])})")
    for i in sorted(ref["acts"], key=lambda x: next((a.get("order", 0) for a in acts if a["id"] == x), 0)):
        mv, rv = mine["acts"].get(i, {}), ref["acts"][i]
        flag = "" if mv.get("counts") == rv["counts"] else "  <-- DISAGREE"
        lines.append(f"  {n(i)}: counts mine {mv.get('counts')} ref {rv['counts']}{flag}" + (f" (mine: {'; '.join(mv.get('why', []))})" if mv.get("why") else ""))
    if mine["debtors"] or ref["debtors"]:
        lines.append(f"  debtors: mine { {n(k): n(v) for k, v in mine['debtors'].items()} } ref { {n(k): n(v) for k, v in ref['debtors'].items()} }")
    lines.append("disagreements:")
    for d in diffs:
        lines.append(f"  {d['kind']} {d['subject']}: mine={d['mine']} ref={d['ref']} {d['detail'][:300]}")
    return "\n".join(lines)


if __name__ == "__main__":
    d, name = sys.argv[1], sys.argv[2]
    with open(os.path.join(d, name + ".story.json")) as fh:
        story = json.load(fh)
    with open(os.path.join(d, name + ".ref.json")) as fh:
        ref = json.load(fh)
    from compare import compare_one
    print(render(story, ref, compare_one(story, ref, "done", "strict")))
