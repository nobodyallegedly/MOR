#!/usr/bin/env python3
"""Shrink a disagreeing story to its smallest form.

Usage: python3 shrink.py OUT_DIR CASE_NAME [--seed N] [--handout ..] [--cites ..]

Re-exports the case (drawn with the same run seed) with fewer steps and a smaller
shape, through the reference's exporter (VERIFIER2_REQUEST), and keeps a change
whenever the same kind of disagreement remains.  Writes the result as
OUT_DIR/CASE_NAME.min.story.json and .min.ref.json.
"""

import argparse
import glob
import json
import os
import subprocess
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from compare import compare_one  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def binary() -> str:
    cands = glob.glob(os.path.join(ROOT, "target", "release", "deps", "agreements_invariants-*"))
    cands = [c for c in cands if not c.endswith(".d")]
    if not cands:
        sys.exit("build first: cargo test -p mor-core --release --test agreements_invariants --no-run")
    return max(cands, key=os.path.getmtime)


def export(requests: list[tuple[int, str, list[int], list[str]]], seed: int, out: str):
    """Ask the reference to export each requested sub-story into `out`."""
    with tempfile.NamedTemporaryFile("w", suffix=".req", delete=False) as fh:
        for case, name, ops, overrides in requests:
            fh.write(f"{case} {name} {','.join(map(str, ops))} {' '.join(overrides)}\n")
        req = fh.name
    env = dict(os.environ, VERIFIER2_OUT=out, VERIFIER2_SEED=str(seed), VERIFIER2_REQUEST=req)
    r = subprocess.run([binary(), "--ignored", "--exact", "verifier2_export::verifier2_export"], env=env, capture_output=True, text=True)
    os.unlink(req)
    if r.returncode != 0:
        raise RuntimeError(r.stdout[-2000:] + r.stderr[-2000:])


def load(out: str, name: str):
    with open(os.path.join(out, name + ".story.json")) as fh:
        story = json.load(fh)
    with open(os.path.join(out, name + ".ref.json")) as fh:
        ref = json.load(fh)
    return story, ref


def signature(diffs: list[dict]) -> set[tuple]:
    """What kind of disagreement a story shows: (kind, mine, ref) per entry, ids left out."""
    return {(d["kind"], str(d["mine"]), str(d["ref"]), "(grant key)" in d["detail"]) for d in diffs}


def shape_of(story: dict) -> dict:
    """Parse the Debug form of the shape in the story's meta."""
    import re
    s = story["meta"]["shape"]
    m = re.search(r"members: (\d+), devices: (\d+), member_devices: (\d+), constitutional: (None|Some\((\d+)\)), lane: (None|Some\(\((\d+), (\d+)\)\)), owns_work: (true|false)", s)
    return {"members": int(m.group(1)), "devices": int(m.group(2)), "member_devices": int(m.group(3)),
            "constitutional": None if m.group(4) == "None" else int(m.group(5)),
            "lane": None if m.group(6) == "None" else (int(m.group(7)), int(m.group(8))),
            "owns_work": m.group(9) == "true"}


def overrides_of(shape: dict) -> list[str]:
    o = [f"members={shape['members']}", f"devices={shape['devices']}", f"member_devices={shape['member_devices']}",
         "constitutional=%s" % ("none" if shape["constitutional"] is None else shape["constitutional"]),
         "lane=%s" % ("none" if shape["lane"] is None else "%d,%d" % shape["lane"]),
         "owns_work=%d" % (1 if shape["owns_work"] else 0)]
    return o


def shrink(out: str, case_name: str, seed: int, handout: str, cites: str, want: set[tuple] | None = None, log=print):
    case = int(case_name.replace("case", "").split("-")[0])
    story, ref = load(out, case_name)
    diffs = compare_one(story, ref, handout, cites)
    if want is None:
        want = signature(diffs)
    if not want:
        log(f"{case_name}: no disagreement to shrink")
        return None
    ops = list(range(len(story["meta"]["ops"])))
    shape = shape_of(story)
    work = tempfile.mkdtemp(prefix="shrink-")
    probe = 0

    def keeps(cands: list[tuple[list[int], dict]]) -> int | None:
        """Export every candidate at once; the index of the first keeping a wanted disagreement."""
        nonlocal probe
        reqs = []
        for k, (o, sh) in enumerate(cands):
            probe += 1
            reqs.append((case, f"p{probe}", o, overrides_of(sh)))
        export(reqs, seed, work)
        for k, (_, _) in enumerate(cands):
            s, r = load(work, reqs[k][1])
            if signature(compare_one(s, r, handout, cites)) & want:
                return k
        return None

    # Steps: remove one at a time, largest chunks first.
    changed = True
    while changed:
        changed = False
        n = len(ops)
        chunk = max(1, n // 2)
        while chunk >= 1 and not changed:
            cands = []
            for start in range(0, n, chunk):
                o = ops[:start] + ops[start + chunk:]
                if o:
                    cands.append((o, shape))
            k = keeps(cands) if cands else None
            if k is not None:
                ops = cands[k][0]
                changed = True
            else:
                chunk //= 2
    # Shape: fewer members, devices, member devices; no lane; no work; every-member rule.
    for key, smaller in (("member_devices", lambda s: {**s, "member_devices": s["member_devices"] - 1} if s["member_devices"] > 1 else None),
                         ("devices", lambda s: {**s, "devices": s["devices"] - 1} if s["devices"] > 1 else None),
                         ("members", lambda s: {**s, "members": s["members"] - 1} if s["members"] > 2 else None),
                         ("owns_work", lambda s: {**s, "owns_work": False} if s["owns_work"] else None),
                         ("lane", lambda s: {**s, "lane": None} if s["lane"] else None),
                         ("constitutional", lambda s: {**s, "constitutional": None} if s["constitutional"] is not None else None)):
        while True:
            sh = smaller(shape)
            if sh is None:
                break
            if keeps([(ops, sh)]) is not None:
                shape = sh
                # steps may now be removable again
                changed = True
                while changed:
                    changed = False
                    for i in range(len(ops)):
                        o = ops[:i] + ops[i + 1:]
                        if o and keeps([(o, shape)]) is not None:
                            ops = o
                            changed = True
                            break
            else:
                break
    export([(case, case_name + ".min", ops, overrides_of(shape))], seed, out)
    s, r = load(out, case_name + ".min")
    d = compare_one(s, r, handout, cites)
    log(f"{case_name}: shrunk to {len(ops)} steps, shape {shape}, {len(d)} disagreements ({probe} probes)")
    return s, r, d


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("dir")
    ap.add_argument("case")
    ap.add_argument("--seed", type=int, default=1)
    ap.add_argument("--handout", default="done")
    ap.add_argument("--cites", default="strict")
    args = ap.parse_args(argv)
    res = shrink(args.dir, args.case, args.seed, args.handout, args.cites)
    if res:
        from render import render
        print(render(res[0], res[1], res[2], args.handout, args.cites))
    return 0


if __name__ == "__main__":
    sys.exit(main())
