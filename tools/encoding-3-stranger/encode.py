"""Payload bytes of eight examples, written from encoding 3 alone.

Encoding 3: docs/agreements-from-scratch/encoding-3.md, branch
claude/draft-26-outline-vbtvu7, commit 1f81c2a5964219cf53f2ead192c3c26be879e034.
Deterministic CBOR and tagged_hash: Identity draft 16, Part three,
"Encoding and conventions".

Standard library only. Test data only: every fingerprint is SHA-256 of an
ASCII label. Writes payloads.json beside this file and prints it.

Where encoding 3 leaves a choice open after the choices given to this
session, each reading is written under its own name (X1-a, X1-b, ...),
and a reading that cannot be written is listed with why. See README.md.
"""

import hashlib
import json
import os

# ---- deterministic CBOR (Identity, "Encoding and conventions") ----------

NULL = object()


def _head(major, n):
    if n < 24:
        return bytes([major << 5 | n])
    for size, ai in ((1, 24), (2, 25), (4, 26), (8, 27)):
        if n < 1 << (8 * size):
            return bytes([major << 5 | ai]) + n.to_bytes(size, "big")
    raise ValueError("integer too large")


def cbor(x):
    if x is NULL:
        return b"\xf6"
    if isinstance(x, bool):
        raise TypeError("no booleans in these examples")
    if isinstance(x, int):
        if x < 0:
            raise TypeError("no negative integers in these examples")
        return _head(0, x)
    if isinstance(x, bytes):
        return _head(2, len(x)) + x
    if isinstance(x, str):
        b = x.encode("utf-8")
        return _head(3, len(b)) + b
    if isinstance(x, list):
        return _head(4, len(x)) + b"".join(cbor(i) for i in x)
    if isinstance(x, dict):
        items = sorted((cbor(k), cbor(v)) for k, v in x.items())
        keys = [k for k, _ in items]
        if len(set(keys)) != len(keys):
            raise ValueError("duplicate key")
        return _head(5, len(x)) + b"".join(k + v for k, v in items)
    raise TypeError(type(x))


def as_set(entries):
    """E18: sorted by the bytewise order of their deterministic encodings, each once."""
    out = []
    for e in sorted(entries, key=cbor):
        if not out or cbor(out[-1]) != cbor(e):
            out.append(e)
    return out


# ---- hashes --------------------------------------------------------------


def fp(label):
    """Test data: a fingerprint is SHA-256 of the ASCII label."""
    return hashlib.sha256(label.encode("ascii")).digest()


def tagged_hash(tag, x):
    t = hashlib.sha256(tag.encode("utf-8")).digest()
    return hashlib.sha256(t + t + x).digest()


SET_LABEL = "MOR/act-set"  # given: the set's label


def set_value(act_ids):
    """The set of acts: ids sorted bytewise, repeats dropped, concatenated (given), tagged."""
    members = sorted(set(act_ids))
    for m in members:
        assert len(m) == 32
    return tagged_hash(SET_LABEL, b"".join(members))


# ---- the fields of Terms (encoding 3, section 4) -------------------------

ANA = fp("test:ana")
WORDS = fp("test:words-1")
CMIP = fp("test:cmip-in-force")
KEEPER_1 = fp("test:keeper-1")
KEEPER_2 = fp("test:keeper-2")
CLOCK_1 = fp("test:clock-1")
TERMS_V1 = fp("test:terms-v1")
PAYMENT_1 = fp("test:payment-1")


def socket(cmip, params=NULL):
    return [cmip, params]  # E7: [cmip, params]; null for none


def signer_party(h):
    return [0, h]  # E9


def role_party(role):
    return [1, role]  # E9, E10


def keeper(ids):
    return as_set(ids)  # given: key 8 always a list; sorted, each once


# X1, reading a: the one socket the example names is the body's socket (K1).
# Reading b (the socket is in_force, key 6) needs the body's own socket,
# which the example does not give: not written.
def x1a_fields():
    return {
        2: [signer_party(ANA)],          # parties
        3: as_set([0]),                  # authors
        4: [WORDS, socket(CMIP)],        # body: [words, socket]
        8: keeper([KEEPER_1]),           # keeper
        19: [],                          # previous: the signer's first act here
    }


def terms(fields):
    return cbor(fields)


def build():
    out = {}
    notes = {}

    # X1
    out["X1-a"] = terms(x1a_fields())
    notes["X1-b"] = ("not written: the socket as in_force (key 6) leaves the body (key 4) "
                     "without its socket, which E8 requires and the example does not give")

    # X2: two keepers, given as keeper-2 then keeper-1; key 8 sorted
    f = x1a_fields()
    f[8] = keeper([KEEPER_2, KEEPER_1])
    out["X2-a"] = terms(f)

    # X3: a clock, key 9, 32 bytes
    f = x1a_fields()
    f[9] = CLOCK_1
    out["X3-a"] = terms(f)

    # X4: a second party, a role "named buyer". A role carries no label
    # (E10), and the example gives no sort, what or spot: the role is
    # written with none of its three keys. The name is not written.
    f = x1a_fields()
    f[2] = [signer_party(ANA), role_party({})]
    out["X4-a-empty-role"] = terms(f)
    notes["X4"] = ("written only as a role with no fields, the name 'buyer' nowhere; "
                   "such Terms are invalid (5.10.1 three times; 5.4.2 under reading a)")

    # X5: an update of X1, replacing test:terms-v1. The root is the act id
    # of the first Terms act; X1 is the first, and test:terms-v1 names it,
    # so agreement = test:terms-v1. previous: the signer's act before this
    # one in the agreement; read here as X1 itself (no act of ana between).
    f = x1a_fields()
    f[0] = TERMS_V1
    f[1] = TERMS_V1
    f[19] = [TERMS_V1]
    out["X5-a"] = terms(f)
    notes["X5"] = ("previous = [test:terms-v1] assumes ana signed nothing in the agreement "
                   "after X1 (no assent of ana's to X1); the example does not say")

    # X6: a Statement assenting to test:terms-v1 (section 5). The signer is
    # not given: previous depends on it (E17).
    st = {
        0: TERMS_V1,     # agreement: the root, read as test:terms-v1 (X1)
        1: TERMS_V1,     # terms
        2: 0,            # kind: assent
    }
    s = dict(st)
    s[6] = [TERMS_V1]
    out["X6-signer-ana"] = cbor(s)        # ana, X1's author: names X1 (E17)
    s = dict(st)
    s[6] = []
    out["X6-signer-other"] = cbor(s)      # a party with no act in the agreement yet

    # X7: values, not payloads
    out["X7-set-a-b"] = set_value([fp("test:act-a"), fp("test:act-b")])
    out["X7-set-empty"] = set_value([])

    # X8: relying on test:payment-1, key 5
    f = x1a_fields()
    f[5] = as_set([PAYMENT_1])
    out["X8-a"] = terms(f)

    return out, notes


def main():
    out, notes = build()
    doc = {
        "text": "docs/agreements-from-scratch/encoding-3.md at 1f81c2a5964219cf53f2ead192c3c26be879e034",
        "what": "payload bytes before signing, hex; X7 holds set values, not payloads",
        "payloads": {k: v.hex() for k, v in out.items()},
        "not_written_or_partial": notes,
    }
    text = json.dumps(doc, indent=2, sort_keys=True) + "\n"
    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, "payloads.json"), "w", encoding="utf-8") as fh:
        fh.write(text)
    print(text, end="")


if __name__ == "__main__":
    main()
