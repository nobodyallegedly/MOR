"""Sort each disagreeing story into the findings of docs/verifier2-report.md."""
import json, sys
from collections import Counter
total = 0; stories = 0; per = Counter(); unexplained = []
for path in sys.argv[1:]:
    d = json.load(open(path))
    total += d["stories"]
    for name, diffs in d["results"].items():
        if not diffs:
            continue
        stories += 1
        kinds = set()
        for x in diffs:
            det = x["detail"]
            if x["kind"] == "act-counts" and (" Ack " in det or "Binds" in det or "Backed" in det):
                kinds.add("A")  # a witness act counting, and the grant key's acts it adopts
            if x["kind"] == "ending-status" and ("hands out every obligation" in det):
                kinds.add("C")
            if x["kind"] == "ending-status" and (("owes" in det.split("| ref:")[0] and x["ref"] == "complete") or "cannot close while it owes" in det):
                kinds.add("B")
        if not kinds:
            unexplained.append((path, name, [(x["kind"], x["subject"], x["mine"], x["ref"], x["detail"][:120]) for x in diffs]))
        for k in kinds:
            per[k] += 1
print(f"{total} stories, {stories} with disagreements; per finding (a story may show several): {dict(per)}")
print("unexplained:", len(unexplained))
for u in unexplained[:10]:
    print(u)
