#!/usr/bin/env python3
"""Compare verifier2's verdicts with the reference library's on exported stories.

Usage: python3 compare.py OUT_DIR [--handout done|binding] [--json summary.json]

OUT_DIR holds, per story, NAME.story.json (as verifier2/export/export.rs writes it)
and NAME.ref.json (the library's verdicts in the same terms).  Prints every
disagreement, grouped by kind, and a summary.
"""

import argparse
import json
import os
import sys
from collections import Counter, defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from law_endings import verify  # noqa: E402


def short(names: dict, x):
    if x is None:
        return None
    if x in names:
        return names[x]
    return x[:8]


def compare_one(story: dict, ref: dict, handout: str, cites: str = "strict") -> list[dict]:
    """Every disagreement between verifier2 and the reference on one story."""
    mine = verify(story, handout=handout, cites=cites)
    names = story.get("names", {})
    kinds = {a["id"]: a for a in story["acts"]}
    out = []

    def note(kind, subject, m, r, detail=""):
        out.append({"kind": kind, "subject": subject, "mine": m, "ref": r, "detail": detail})

    if mine["closed_by"] != ref["closed_by"]:
        note("closed_by", "collective", short(names, mine["closed_by"]), short(names, ref["closed_by"]))
    for e, rv in ref["endings"].items():
        mv = mine["endings"].get(e)
        if mv is None:
            note("ending-missing", short(names, e), None, rv["status"])
            continue
        if mv["status"] != rv["status"]:
            note("ending-status", short(names, e), mv["status"], rv["status"],
                 "mine: %s | ref: %s" % ("; ".join(mv["why"]), "; ".join(rv["why"])))
        if mv["counts"] != rv["counts"]:
            note("ending-counts", short(names, e), mv["counts"], rv["counts"])
        if rv["status"] == "no-ending" and mv["status"] == "no-ending":
            continue  # a no ending's signatures count for nothing; the reference lists none
        for m in set(mv["signatures"]) | set(rv["signatures"]):
            a, b = mv["signatures"].get(m), rv["signatures"].get(m)
            if a != b:
                note("signature", f"{short(names, m)} on {short(names, e)}", a, b)
    for i, rv in ref["acts"].items():
        if rv.get("out_of_scope"):
            continue
        mv = mine["acts"].get(i)
        if mv is None:
            note("act-missing", short(names, i), None, rv["counts"])
            continue
        if mv["counts"] != rv["counts"]:
            a = kinds[i]
            note("act-counts", short(names, i), mv["counts"], rv["counts"],
                 "%s %s%s | mine: %s | ref: %s" % (a["type"], a.get("kind", ""), " (grant key)" if a.get("grant") else "",
                                                   "; ".join(mv["why"]) or "counts", rv.get("consent", "") + " " + rv.get("backing", "") + " " + rv.get("binds", "")))
    for ob in set(mine["debtors"]) | set(ref["debtors"]):
        a, b = sorted(mine["debtors"].get(ob, [])), sorted(ref["debtors"].get(ob, []))
        if a != b:
            note("debtors", short(names, ob), [short(names, x) for x in a], [short(names, x) for x in b])
    return out


def load_dir(d: str):
    for f in sorted(os.listdir(d)):
        if f.endswith(".story.json"):
            name = f[: -len(".story.json")]
            with open(os.path.join(d, f)) as fh:
                story = json.load(fh)
            with open(os.path.join(d, name + ".ref.json")) as fh:
                ref = json.load(fh)
            yield name, story, ref


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("dir")
    ap.add_argument("--handout", default="done", choices=["done", "binding"])
    ap.add_argument("--cites", default="strict", choices=["strict", "loose"])
    ap.add_argument("--json")
    ap.add_argument("--quiet", action="store_true")
    args = ap.parse_args(argv)
    total = 0
    by_kind = Counter()
    stories_with = defaultdict(set)
    results = {}
    for name, story, ref in load_dir(args.dir):
        total += 1
        diffs = compare_one(story, ref, args.handout, args.cites)
        results[name] = diffs
        for d in diffs:
            by_kind[d["kind"]] += 1
            stories_with[d["kind"]].add(name)
            if not args.quiet:
                print(f"{name}: {d['kind']} {d['subject']}: mine={d['mine']} ref={d['ref']}  {d['detail']}")
    print(f"\n{total} stories; {sum(1 for v in results.values() if v)} with disagreements")
    for k, n in sorted(by_kind.items()):
        print(f"  {k}: {n} disagreements in {len(stories_with[k])} stories")
    if args.json:
        with open(args.json, "w") as fh:
            json.dump({"stories": total, "by_kind": by_kind, "results": results}, fh, indent=1)
    return 0


if __name__ == "__main__":
    sys.exit(main())
