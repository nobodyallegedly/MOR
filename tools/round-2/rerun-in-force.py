#!/usr/bin/env python3
"""Finding 3: verifier 2's in-force answers for the rerun count's entries.

    python3 -I rerun-in-force.py RESEARCH_DIR ASK_BINARY [--as-default FP ...]

Reads hosts/count-rerun.json (each entry's Terms version in force and its
receiver deal's version), holds every act of every home feed and of the
place's record (read in place, through ask's --feed), and asks verifier 2
`in_force` of each. With --as-default, ask also holds those fingerprints as
a K2 cMIP read as G4.1's default: an experiment, never the kit's answer.
Prints short ids (8 characters) and answers only.
"""
import glob
import json
import os
import subprocess
import sys
from collections import Counter


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    root, binary, extra = sys.argv[1], sys.argv[2], sys.argv[3:]
    feeds = sorted(glob.glob(os.path.join(root, "feeds", "*", "feed-after-*.cbor"))) + sorted(glob.glob(os.path.join(root, "feeds", "*", "records-*.cbor")))
    pool = [x for f in feeds for x in ("--feed", f)]
    count = json.load(open(os.path.join(root, "hosts", "count-rerun.json")))
    asked = {}
    tally = Counter()
    for e in count["entries"]:
        for role in ("terms_in_force", "deal_version"):
            v = e.get(role)
            if not v or v in asked:
                continue
            r = subprocess.run([binary, "--json", *extra, "in_force", v, "--acts", *pool], capture_output=True, text=True)
            if r.returncode:
                asked[v] = ("refused", r.stderr.strip()[:120])
            else:
                a = json.loads(r.stdout)
                asked[v] = (" + ".join(x["word"] for x in a), " | ".join(f'{x["rule"]}: {x["says"][:110]}' for x in a))
            tally[(role, asked[v][0])] += 1
            print(f'{e.get("position")}\t{role}\t{v[:8]}…\t{asked[v][0]}\t{asked[v][1]}')
    print("\ncounts (each version once):")
    for (role, word), n in sorted(tally.items()):
        print(f"  {n:>3}  {role}  {word}")


if __name__ == "__main__":
    main()
