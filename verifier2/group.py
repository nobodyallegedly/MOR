import json, re, sys
from collections import Counter
d = json.load(open(sys.argv[1]))
c = Counter(); ex = {}
for name, diffs in d["results"].items():
    for x in diffs:
        det = x["detail"]
        if x["kind"] == "act-counts":
            typ, rest = det.split(" ", 1)
            gk = "(grant key)" in rest
            kind = rest.split(" ")[0] if not rest.startswith("|") else ""
            mine = rest.split("| mine: ")[1].split(" | ref: ")[0]
            ref = rest.split(" | ref: ")[1]
            refv = re.sub(r"\[[0-9, ]*\]", "[]", ref)[:150]
            key = (x["kind"], typ, kind, gk, str(x["mine"]), re.sub(r"[0-9a-f]{16,}", "#", mine)[:90], refv)
        elif x["kind"] == "ending-status":
            key = (x["kind"], x["mine"], x["ref"], re.sub(r"[0-9a-f]{16,}", "#", det)[:300])
        else:
            key = (x["kind"], str(x["mine"])[:40], str(x["ref"])[:40])
        c[key] += 1
        ex.setdefault(key, []).append(name)
for k, n in c.most_common():
    print(n, ex[k][:4], k)
