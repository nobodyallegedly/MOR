#!/usr/bin/env python3
"""The round-two census: counts only.

    python3 -I census.py RESEARCH_DIR KIT_DIR

RESEARCH_DIR is the research copy (read in place, never copied, nothing
written into it). KIT_DIR is a kit folder (tools/postman/kit on the postman
branch): its core library decodes and checks every act (census-kit.mjs,
beside this file). Prints, for each home's feed: items by kind, acts by
specification and type, agreements-check's answers (each act alone, and all
of the home's acts held together), and verifier 2's in-force answer for every
Terms act with all of that home's acts held. Numbers only: no act, id or
excerpt is printed.
"""
import json
import os
import re
import sqlite3
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))


def pages(folder, prefix):
    found = []
    for f in os.listdir(folder):
        m = re.fullmatch(prefix + r"-(\d+)\.cbor", f)
        if m:
            found.append((int(m.group(1)), os.path.join(folder, f)))
    return [p for _, p in sorted(found)]


def dubsar_items(db):
    # Opened immutable: SQLite writes nothing (no lock, no -shm). Rows still
    # only in the write-ahead log are not read.
    uri = "file:" + db + "?immutable=1"
    c = sqlite3.connect(uri, uri=True)
    rows = c.execute("SELECT arrival, kind, bytes FROM items WHERE kind IN (0, 1) ORDER BY arrival").fetchall()
    c.close()
    return [[a, k, b.hex()] for a, k, b in rows if b is not None]


def table(title, counts, total=None):
    print(f"\n  {title}" + (f" (of {total})" if total is not None else ""))
    if not counts:
        print("    (none)")
    for k, v in sorted(counts.items(), key=lambda kv: (-kv[1], kv[0])):
        print(f"    {v:>7}  {k}")


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    root, kit = sys.argv[1], sys.argv[2]
    feeds = os.path.join(root, "feeds")
    homes = []
    for name in sorted(os.listdir(feeds)):
        folder = os.path.join(feeds, name)
        if not os.path.isdir(folder):
            continue
        fp = pages(folder, "feed-after")
        rp = pages(folder, "records")
        db = os.path.join(folder, "relay.db")
        if fp:
            homes.append({"name": name, "pages": fp})
        elif rp:
            homes.append({"name": name, "pages": rp, "records": True, "note": "a place's record, no home's feed"})
        elif os.path.exists(db):
            homes.append({"name": name, "items": dubsar_items(db), "note": "relay.db opened immutable: the write-ahead log is not read"})
        else:
            homes.append({"name": name, "pages": [], "note": "no feed pages in this folder"})
    r = subprocess.run(["node", os.path.join(HERE, "census-kit.mjs"), kit], input=json.dumps(homes), capture_output=True, text=True)
    if r.returncode:
        sys.exit(r.stderr)
    for c in json.loads(r.stdout):
        print(f"\n== {c['home']}: {c['items']} items" + (f"  [{c['note']}]" if c["note"] else ""))
        acts = sum(v for k, v in c["byKind"].items() if k.startswith("act"))
        table("items by kind", c["byKind"], c["items"])
        table("acts by specification / type", c["byType"], acts)
        table("agreements-check, each act alone", c["check"], acts)
        table("agreements-check, all the home's acts held", c["checkHeld"], acts)
        table("Terms in force (verifier 2, all the home's acts held)", c["terms"], c["termsTotal"])
        if c["askErrors"]:
            print(f"    {c['askErrors']:>7}  asks refused")


if __name__ == "__main__":
    main()
