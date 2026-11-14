"""An independent check of the new Agreements vectors (core/vectors/agreements-new/).

Written from docs/agreements-from-scratch/encoding-1.md, not from the Rust
code: its own reading of every payload rule (E4 to E22), of the cases of
invalid draft 24 says an act shows (G2.1, G3.1, G4.2, G10.1, G6.1), and of
the notes (G1.4, G2.2, G5.2, G10.4, G12.3). It shares with check.py only the
act format's parts written there from the MIRs (strict CBOR, the lock,
canonical text, the signatures), so it judges each case's verdict, rule and
notes again, and must agree.

Run by check.py; or alone: python3 core/vectors/agreements_new_check.py
"""

import json
import os

import check as c  # the act format's parts: strict CBOR, lock, text, signatures
import sigs

HERE = os.path.dirname(os.path.abspath(__file__))


class Stop(Exception):
    def __init__(self, verdict, rule):
        self.verdict, self.rule = verdict, rule


def rej(rule):
    raise Stop("rejected", rule)


def is_uint(v):
    return isinstance(v, int) and not isinstance(v, bool) and v >= 0


def is_fp(v):
    return isinstance(v, bytes) and len(v) == 32


def is_map(v):
    return isinstance(v, c.out_map)


def enc(v):
    return c.encode_any(v)


def fields(m, count):
    """A closed payload map (E4): every key a small unsigned integer below count."""
    if not is_map(m):
        rej("E4")
    out = {}
    for k, v, _ in m:
        if not is_uint(k) or k >= count:
            rej("E4")
        out[k] = v
    return out


def a_list(v):
    """E18: a list is an array of one or more items."""
    if not isinstance(v, list) or is_map(v) or len(v) == 0:
        rej("E18")
    return v


def a_set(v):
    """E18: sorted by the bytes of the encodings, each once."""
    e = [enc(x) for x in v]
    for i in range(1, len(e)):
        if not e[i - 1] < e[i]:
            rej("E18")


def distinct(v):
    e = sorted(enc(x) for x in v)
    if any(e[i - 1] == e[i] for i in range(1, len(e))):
        rej("E18")


def fp(v, rule="E5"):
    if not is_fp(v):
        rej(rule)
    return v


def socket(v):
    """E7: [cmip, params]. The cmip's kind is the grammar's (G2.1)."""
    if not isinstance(v, list) or is_map(v) or len(v) != 2:
        rej("E7")
    return v


def who(v):
    if not (isinstance(v, list) and not is_map(v) and len(v) == 2 and v[0] in (0, 2) and is_uint(v[0]) and is_fp(v[1])):
        rej("E11")
    return v


def previous(v, rule_missing):
    if v is None:
        rej(rule_missing)
    if not isinstance(v, list) or is_map(v) or len(v) > 1:
        rej("E17")
    if len(v) == 1 and not is_fp(v[0]):
        rej("E17")
    return v[0] if v else None


def resolves(f, kr, kc, rule):
    r = f.get(kr)
    if r is not None:
        a_list(r)
        a_set(r)
        for x in r:
            fp(x)
    cont = f.get(kc)
    if cont is not None:
        fp(cont)
        if r is None or cont not in r:
            rej(rule)
    return r, cont


# ------------------------------------------------------------ Terms

def terms(p):
    f = fields(p, 20)
    notes, bad = [], []
    if 0 in f:
        fp(f[0])
    if 1 in f:
        fp(f[1])
    parties = f.get(2)
    if parties is not None:
        a_list(parties)
        distinct(parties)
        for x in parties:
            if not (isinstance(x, list) and not is_map(x) and len(x) == 2 and is_uint(x[0]) and x[0] in (0, 1, 2)):
                rej("E9")
            if x[0] in (0, 2) and not is_fp(x[1]):
                rej("E9")
            if x[0] == 1:
                if not is_map(x[1]):
                    rej("E10")
                role = fields(x[1], 3)
                if 2 in role:
                    socket(role[2])
    authors = f.get(3)
    if authors is not None:
        a_list(authors)
        if not all(is_uint(x) for x in authors):
            rej("E13")
        a_set(authors)
    if 4 in f:
        b = f[4]
        if not (isinstance(b, list) and not is_map(b) and len(b) == 2):
            rej("E8")
        socket(b[1])
    if 5 in f:
        a_list(f[5])
        a_set(f[5])
    for k in (6, 13, 14, 16):
        if k in f:
            socket(f[k])
    if 7 in f:
        a_list(f[7])
        for x in f[7]:
            if not (isinstance(x, list) and not is_map(x) and len(x) == 2):
                rej("E14")
            if not ((is_uint(x[0]) and x[0] <= 4) or is_fp(x[0])):
                rej("E14")
            socket(x[1])
        a_set(f[7])
    for k in (8, 9):
        if k in f:
            fp(f[k], "E6")
    if 10 in f and not (is_uint(f[10]) or is_fp(f[10])):
        rej("E12")
    for k in (11, 12):
        if k in f:
            fp(f[k])
    if 15 in f:
        a_list(f[15])
        for x in f[15]:
            if not (isinstance(x, list) and not is_map(x) and len(x) == 2 and is_uint(x[0]) and 1 <= x[0] <= 8 and is_uint(x[1]) and x[1] <= 2):
                rej("E16")
        a_set(f[15])
        tasks = [x[0] for x in f[15]]
        if len(set(tasks)) != len(tasks):
            rej("E16")
    r, cont = resolves(f, 17, 18, "E19")
    previous(f.get(19), "E19")
    if (0 in f) != (1 in f):
        rej("E19")
    if (11 in f) != (12 in f):
        rej("E19")
    if not (r is not None and cont is not None):
        for k in (2, 3, 4):
            if k not in f:
                rej("E19")

    # What the bytes show by themselves.
    def cmip(s):
        if not is_fp(s[0]):
            bad.append("G2.1")

    if 4 in f:
        if not is_fp(f[4][0]):
            bad.append("G2.1")
        cmip(f[4][1])
    for k in (6, 13, 14, 16):
        if k in f:
            cmip(f[k])
    for x in f.get(7, []):
        cmip(x[1])
        if x[0] == 4:
            notes.append("G5.2")
    parties = parties or []
    for x in parties:
        if x[0] != 1:
            continue
        role = dict((k, v) for k, v, _ in x[1])
        kind = role.get(0)
        good_kind = is_uint(kind) and kind <= 4
        if not good_kind:
            bad.append("G10.1")
        if good_kind and kind == 4:
            if 1 in role:
                notes.append("G10.4")
        elif not is_fp(role.get(1)):
            bad.append("G10.1")
        if 2 not in role:
            bad.append("G10.1")
        else:
            cmip(role[2])
    if any(x[0] == 1 for x in parties) and 6 not in f:
        bad.append("G4.2")
    for a in authors or []:
        if a >= len(parties) or parties[a][0] == 2:
            bad.append("G3.1")
    for x in f.get(5, []):
        if not is_fp(x):
            notes.append("G2.2")
    if is_uint(f.get(10)):
        i = f[10]
        if not (i < len(parties) and parties[i][0] in (0, 1)):
            notes.append("G1.4")
    if r is not None and cont is None:
        notes.append("G12.3")
    return bad, notes, f


# ------------------------------------------------------------ Statement

def statement(p):
    f = fields(p, 12)
    for k in (0, 1, 2):
        if k not in f:
            rej("E20")
    fp(f[0])
    fp(f[1])
    kind = f[2]
    if not ((is_uint(kind) and kind <= 2) or (isinstance(kind, list) and not is_map(kind) and len(kind) == 2)):
        rej("E15")
    if isinstance(kind, list) and not is_fp(kind[0]):
        rej("E15")
    previous(f.get(6), "E20")
    if 3 in f and kind in (0, 1) and not isinstance(kind, list):
        rej("E20")
    if 4 in f:
        who(f[4])
    if 5 in f:
        fp(f[5])
    if (4 in f) != (5 in f):
        rej("E20")
    if 7 in f:
        a_list(f[7])
        for x in f[7]:
            fp(x)
        a_set(f[7])
    if 8 in f:
        a_list(f[8])
        a_set(f[8])
    if 9 in f:
        fp(f[9])
    r, cont = resolves(f, 10, 11, "E20")
    notes = ["G2.2" for x in f.get(8, []) if not is_fp(x)]
    if r is not None and cont is None:
        notes.append("G12.3")
    return [], notes, f


# ------------------------------------------------------------ the report (a proposal)

def amount(v):
    if not (isinstance(v, list) and not is_map(v) and len(v) == 2 and is_fp(v[0]) and is_uint(v[1])):
        rej("E22")


def report(p):
    f = fields(p, 3)
    call = f.get(0)
    if call is None:
        rej("E21")
    if not (isinstance(call, list) and not is_map(call) and len(call) in (1, 2) and is_fp(call[0])):
        rej("E21")
    if len(call) == 2 and not (is_uint(call[1]) and 1 <= call[1] <= 8):
        rej("E21")
    if 1 in f:
        a_list(f[1])
        for x in f[1]:
            fp(x, "E21")
        a_set(f[1])
    if 2 in f:
        for line in a_list(f[2]):
            if not (isinstance(line, list) and not is_map(line) and line and is_uint(line[0])):
                rej("E22")
            k, n = line[0], len(line)
            shapes = {0: (3,), 1: (4, 5), 2: (2,), 3: (2,), 4: (3,)}
            if k not in shapes or n not in shapes[k]:
                rej("E22")
            amount(line[1])
            if k == 0:
                fp(line[2], "E22")
            if k == 1:
                who(line[2])
                fp(line[3], "E22")
                if n == 5:
                    cl = line[4]
                    if not (isinstance(cl, list) and not is_map(cl) and len(cl) == 2 and is_fp(cl[0]) and is_uint(cl[1])):
                        rej("E22")
            if k == 4:
                who(line[2])
    return [], [], f


# ------------------------------------------------------------ one act

def judge(b, key):
    """(verdict, rule, notes, facts) for one act's bytes."""
    try:
        a = c.decode(b)
    except c.Reject as e:
        return ("rejected", "Envelopes rule 2" if str(e) == "too deep" else "Envelopes rule 1", [], None)
    if not (isinstance(a, list) and not is_map(a) and len(a) == 3 and isinstance(a[1], bytes)):
        return ("rejected", "Envelopes rule 1", [], None)
    outside, locked, sig = a
    try:
        c.check_outside_shape(outside)
        assert isinstance(sig, list) and len(sig) == 3
    except AssertionError:
        return ("rejected", "Envelopes rule 1", [], None)
    if not c.all_text_canonical(a):
        return ("rejected", "Envelopes rule 5", [], None)
    act_id = c.act_id(outside)
    if c.sha256(locked) != outside.get(3):
        return ("rejected", "Envelopes rule 3", [], None)
    k = outside.get(5) or key
    if k is None:
        return ("cannot open", "Envelopes rule 10", [], None)
    try:
        plain = c.unlock(locked, k, outside.get(4))
    except Exception:
        return ("rejected", "Envelopes rule 3", [], None)
    if c.tagged_hash("MOR/inside", plain) != outside.get(2):
        return ("rejected", "Envelopes rule 3", [], None)
    try:
        inside = c.decode(plain)
    except c.Reject:
        return ("rejected", "Envelopes rule 1", [], None)
    if not c.inside_shape_ok(inside):
        return ("rejected", "Envelopes rule 1", [], None)
    if not c.all_text_canonical(inside):
        return ("rejected", "Envelopes rule 5", [], None)
    spec, type_ = inside.get(0), inside.get(1)
    if spec == D24:
        if type_ not in (0, 1):
            return ("rejected", "E2", [], None)
        which = (terms, statement)[type_]
    elif spec == RB3:
        if type_ != 0:
            return ("rejected", "E2", [], None)
        which = report
    else:
        return ("not this encoding", "E2", [], None)
    signer = outside.get(0)
    if signer is None:
        return ("rejected", "E1", [], None)
    prev = inside.get(2)
    if prev is None or len(prev) > 1:
        return ("rejected", "Envelopes rule 13", [], None)
    if inside.get(3) is not None or inside.get(7) is not None:
        return ("rejected", "E3", [], None)
    scheme, pk, s = sig
    ok = sigs.verify(scheme, pk, s, act_id)
    if ok is False:
        return ("rejected", "E1", [], None)
    try:
        bad, notes, f = which(inside.get(4))
    except Stop as e:
        return (e.verdict, e.rule, [], None)
    facts = {"id": act_id, "signer": signer, "kind": which.__name__, "f": f}
    if bad:
        return ("invalid", bad[0], notes, facts)
    if ok is None:
        return ("unknown", "E1", notes, facts)
    return ("pass", None, notes, facts)


def agreement_of(facts):
    f = facts["f"]
    if facts["kind"] == "terms":
        return f.get(1, facts["id"])
    return f[0]


def previous_of(facts):
    f = facts["f"]
    v = f.get(19) if facts["kind"] == "terms" else f.get(6)
    return v[0] if v else None


def outside_id(b):
    """An act's id, where its bytes decode as an act; else None."""
    try:
        a = c.decode(b)
        return c.act_id(a[0]) if isinstance(a, list) and len(a) == 3 and is_map(a[0]) else None
    except c.Reject:
        return None


def judge_held(acts):
    """G6.1 among the acts held, for the last act."""
    js = [judge(b, k) for b, k in acts]
    verdict, rule, notes, facts = js[-1]
    if verdict not in ("pass", "invalid", "unknown") or facts["kind"] == "report":
        return verdict, rule, notes
    p = previous_of(facts)
    if p is None:
        return verdict, rule, notes
    held = [(j, b) for j, (b, _) in zip(js, acts) if outside_id(b) == p]
    if not held:
        return verdict, rule, notes + ["G6.1"]
    j, _ = held[0]
    if j[0] == "cannot open":
        return verdict, rule, notes + ["G6.1"]
    h = j[3]
    if h is None or h["kind"] == "report" or h["signer"] != facts["signer"] or agreement_of(h) != agreement_of(facts):
        return "invalid", (rule if verdict == "invalid" else "G6.1"), notes
    return verdict, rule, notes


D24 = RB3 = None


def main():
    global D24, RB3
    n = 0
    for name in ("valid.json", "invalid.json"):
        with open(os.path.join(HERE, "agreements-new", name), encoding="utf-8") as fh:
            d = json.load(fh)
        D24, RB3 = bytes.fromhex(d["spec"]["draft_24"]), bytes.fromhex(d["spec"]["report_block_3"])
        for case in d["cases"]:
            acts = [(bytes.fromhex(a["bytes"]), bytes.fromhex(a["key"]) if a["key"] else None) for a in case["acts"]]
            if len(acts) == 1:
                v, r, notes, _ = judge(*acts[0])
            else:
                v, r, notes = judge_held(acts)
            want = case["answer"]
            assert (v, r, notes) == (want["verdict"], want["rule"], want["notes"]), (case["name"], v, r, notes)
            n += 1
    # The spec hashes are the files' (Development rule 26, as the core computes a MIR's).
    root = os.path.join(HERE, "..", "..")
    for rel, h in (("docs/agreements-from-scratch/draft-24.md", D24), ("docs/lead/proposals/report-block-3.md", RB3)):
        with open(os.path.join(root, rel), encoding="utf-8", newline="") as fh:
            t = c.frozen_text(fh.read())
        assert c.text_rule(t) is None and c.tagged_hash("MOR/spec", c.encode({0: 4, 9: t})) == h, rel
        n += 1
    return n


if __name__ == "__main__":
    print(f"all {main()} agreements-new vectors agree")
