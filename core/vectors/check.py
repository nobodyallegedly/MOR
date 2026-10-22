#!/usr/bin/env python3
"""An independent check of the published test vectors of the core library.

A second implementation, written from the MIR texts rather than from the Rust
code, so that the vectors are not only self-consistent: two implementations
must agree (freeze test suite, scenario 8.5: "Two clients compute the same
running summary for a three-act sequence from the published test vector").

It shares nothing with the Rust library: its own strict CBOR decoder and
encoder, its own canonical text rules, its own HChaCha20 (the XChaCha20 key
step), its own Merkle mountain range.

Needs: Python 3.9+, `cryptography` (for ChaCha20-Poly1305), and
`unicodedata2==17.0.0` (Unicode 17.0 tables, the pinned version).

    pip install cryptography unicodedata2==17.0.0
    python3 core/vectors/check.py
"""

import hashlib
import json
import os
import struct
import sys

import unicodedata2
from cryptography.hazmat.primitives.ciphers.aead import ChaCha20Poly1305

import sigs  # BIP-340 and SLH-DSA, this directory

HERE = os.path.dirname(os.path.abspath(__file__))


def load(name):
    with open(os.path.join(HERE, name), encoding="utf-8") as f:
        return json.load(f)


def sha256(b):
    return hashlib.sha256(b).digest()


def tagged_hash(tag, data):
    t = sha256(tag.encode("utf-8"))
    return sha256(t + t + data)


# ------------------------------------------------------------ strict CBOR

class Reject(Exception):
    pass


class Float:
    """A float kept with the width it was read at, so NaN payloads survive."""

    def __init__(self, width, bits):
        self.width, self.bits = width, bits

    def __eq__(self, o):
        return isinstance(o, Float) and (self.width, self.bits) == (o.width, o.bits)


class Tag:
    def __init__(self, n, v):
        self.n, self.v = n, v


class Simple:
    def __init__(self, n):
        self.n = n


def half_to_float(h):
    return struct.unpack(">e", struct.pack(">H", h))[0]


def fits_half(single_bits):
    """Whether a single (as bits) is exactly representable as a half."""
    exp = (single_bits >> 23) & 0xFF
    mant = single_bits & 0x7FFFFF
    if exp == 0xFF:  # infinity or NaN: payload must survive being cut to 10 bits
        return mant & 0x1FFF == 0
    f = struct.unpack(">f", struct.pack(">I", single_bits))[0]
    try:
        h = struct.pack(">e", f)
    except OverflowError:
        return False
    return struct.pack(">f", struct.unpack(">e", h)[0]) == struct.pack(">I", single_bits)


def fits_single(double_bits):
    exp = (double_bits >> 52) & 0x7FF
    mant = double_bits & ((1 << 52) - 1)
    if exp == 0x7FF:
        return mant & ((1 << 29) - 1) == 0
    d = struct.unpack(">d", struct.pack(">Q", double_bits))[0]
    try:
        s = struct.pack(">f", d)
    except OverflowError:
        return False
    return struct.pack(">d", struct.unpack(">f", s)[0]) == struct.pack(">Q", double_bits)


def decode(b):
    """Decode one deterministic CBOR item (RFC 8949, 4.2.1); raise Reject otherwise.
    Maps come back as lists of (key, value, encoded key) triples."""
    pos = 0

    def take(n):
        nonlocal pos
        if len(b) - pos < n:
            raise Reject("unexpected end")
        s = b[pos:pos + n]
        pos += n
        return s

    def arg(info):
        if info < 24:
            return info
        if info == 31:
            raise Reject("indefinite length")
        if info > 27:
            raise Reject("reserved additional information")
        size = {24: 1, 25: 2, 26: 4, 27: 8}[info]
        v = int.from_bytes(take(size), "big")
        if v < {24: 24, 25: 0x100, 26: 0x10000, 27: 0x100000000}[info]:
            raise Reject("argument not in shortest form")
        return v

    def item(depth):
        if depth > 128:
            raise Reject("too deep")
        ib = take(1)[0]
        major, info = ib >> 5, ib & 31
        if major == 0:
            return arg(info)
        if major == 1:
            return -1 - arg(info)
        if major == 2:
            return bytes(take(arg(info)))
        if major == 3:
            try:
                return take(arg(info)).decode("utf-8", errors="strict")
            except UnicodeDecodeError:
                raise Reject("invalid UTF-8")
        if major == 4:
            return [item(depth + 1) for _ in range(arg(info))]
        if major == 5:
            out, last = [], None
            for _ in range(arg(info)):
                start = pos
                k = item(depth + 1)
                kb = b[start:pos]
                if last is not None and not last < kb:
                    raise Reject("duplicate map key" if last == kb else "map keys out of order")
                last = kb
                out.append((k, item(depth + 1), kb))
            return out_map(out)
        if major == 6:
            return Tag(arg(info), item(depth + 1))
        # major 7
        if info < 20:
            return Simple(info)
        if info in (20, 21, 22, 23):
            return {20: False, 21: True, 22: None, 23: Simple(23)}[info]
        if info == 24:
            n = take(1)[0]
            if n < 32:
                raise Reject("two-byte simple value below 32")
            return Simple(n)
        if info == 25:
            return Float(2, int.from_bytes(take(2), "big"))
        if info == 26:
            bits = int.from_bytes(take(4), "big")
            if fits_half(bits):
                raise Reject("single that fits in a half")
            return Float(4, bits)
        if info == 27:
            bits = int.from_bytes(take(8), "big")
            if fits_single(bits):
                raise Reject("double that fits in a single")
            return Float(8, bits)
        raise Reject("reserved or break")

    v = item(0)
    if pos != len(b):
        raise Reject("trailing bytes")
    return v


class out_map(list):
    """A decoded map: (key, value, encoded key) triples, in order."""

    def get(self, key):
        for k, v, _ in self:
            if type(k) is type(key) and k == key:
                return v
        return None

    def keys(self):
        return [k for k, _, _ in self]


def head(major, n):
    if n < 24:
        return bytes([major << 5 | n])
    for info, size in ((24, 1), (25, 2), (26, 4), (27, 8)):
        if n < 1 << (8 * size):
            return bytes([major << 5 | info]) + n.to_bytes(size, "big")


def encode(v):
    """Deterministic encoding for the kinds used in acts: uint, bytes, text,
    lists, and dicts (encoded with keys sorted by their encodings)."""
    if isinstance(v, bool) or v is None:
        return {False: b"\xf4", True: b"\xf5", None: b"\xf6"}[v]
    if isinstance(v, int):
        return head(0, v) if v >= 0 else head(1, -1 - v)
    if isinstance(v, bytes):
        return head(2, len(v)) + v
    if isinstance(v, str):
        e = v.encode("utf-8")
        return head(3, len(e)) + e
    if isinstance(v, list):
        return head(4, len(v)) + b"".join(encode(x) for x in v)
    if isinstance(v, dict):
        entries = sorted((encode(k), encode(x)) for k, x in v.items())
        return head(5, len(entries)) + b"".join(k + x for k, x in entries)
    raise TypeError(v)


# ------------------------------------------------------------ canonical text

SPACES = {0x20, 0xA0, 0x1680, *range(0x2000, 0x200B), 0x202F, 0x205F, 0x3000}


def text_rule(s):
    """The rule of canonical text that s breaks, numbered as Text numbers
    them: the first of rules 7 to 12 in that order, each checked over the
    whole string (Text, rule 13); or None."""
    cps = [ord(c) for c in s]
    if 0xFEFF in cps:
        return 7
    if any(c in (0x0D, 0x2028, 0x2029) for c in cps):
        return 8
    if any((c <= 0x1F and c != 0x0A) or 0x7F <= c <= 0x9F for c in cps):
        return 9
    if any(c == 0x0A and i > 0 and cps[i - 1] in SPACES for i, c in enumerate(cps)):
        return 10
    if cps and (cps[-1] == 0x0A or cps[-1] in SPACES):
        return 10
    if any(0xFDD0 <= c <= 0xFDEF or (c & 0xFFFE) == 0xFFFE for c in cps):
        return 11
    if unicodedata2.normalize("NFC", s) != s:
        return 12
    return None


def all_text_canonical(v):
    if isinstance(v, str):
        return text_rule(v) is None
    if isinstance(v, list):
        if isinstance(v, out_map):
            return all(all_text_canonical(k) and all_text_canonical(x) for k, x, _ in v)
        return all(all_text_canonical(x) for x in v)
    if isinstance(v, Tag):
        return all_text_canonical(v.v)
    return True


# ------------------------------------------------------------ XChaCha20-Poly1305

def rotl(x, n):
    return ((x << n) | (x >> (32 - n))) & 0xFFFFFFFF


def hchacha20(key, nonce16):
    s = [0x61707865, 0x3320646E, 0x79622D32, 0x6B206574]
    s += list(struct.unpack("<8I", key)) + list(struct.unpack("<4I", nonce16))

    def qr(a, b, c, d):
        s[a] = (s[a] + s[b]) & 0xFFFFFFFF; s[d] = rotl(s[d] ^ s[a], 16)
        s[c] = (s[c] + s[d]) & 0xFFFFFFFF; s[b] = rotl(s[b] ^ s[c], 12)
        s[a] = (s[a] + s[b]) & 0xFFFFFFFF; s[d] = rotl(s[d] ^ s[a], 8)
        s[c] = (s[c] + s[d]) & 0xFFFFFFFF; s[b] = rotl(s[b] ^ s[c], 7)

    for _ in range(10):
        qr(0, 4, 8, 12); qr(1, 5, 9, 13); qr(2, 6, 10, 14); qr(3, 7, 11, 15)
        qr(0, 5, 10, 15); qr(1, 6, 11, 12); qr(2, 7, 8, 13); qr(3, 4, 9, 14)
    return struct.pack("<8I", *(s[0:4] + s[12:16]))


def xchacha(key, nonce24):
    return ChaCha20Poly1305(hchacha20(key, nonce24[:16])), b"\0\0\0\0" + nonce24[16:]


def lock(pt, key, nonce):
    aead, n = xchacha(key, nonce)
    return aead.encrypt(n, pt, b"")


def unlock(ct, key, nonce):
    aead, n = xchacha(key, nonce)
    return aead.decrypt(n, ct, b"")  # raises InvalidTag


# ------------------------------------------------------------ running summary

def mmr_root(ids):
    leaf = lambda x: tagged_hash("MOR/mmr-leaf", x)
    node = lambda l, r: tagged_hash("MOR/mmr-node", l + r)
    peaks = []  # (height, hash), left to right
    for i in ids:
        h, height = leaf(i), 0
        while peaks and peaks[-1][0] == height:
            h = node(peaks.pop()[1], h)
            height += 1
        peaks.append((height, h))
    if not peaks:
        return bytes(32)
    acc = peaks[-1][1]
    for _, p in reversed(peaks[:-1]):
        acc = node(p, acc)
    return acc


# ------------------------------------------------------------ acts

def is_hash(v):
    return isinstance(v, bytes) and len(v) == 32


def check_outside_shape(o):
    assert isinstance(o, out_map), "outside is a map"
    assert all(isinstance(k, int) and not isinstance(k, bool) and 0 <= k <= 6 for k in o.keys())
    for k in (0, 1):
        assert o.get(k) is None or is_hash(o.get(k))
    assert is_hash(o.get(2)) and is_hash(o.get(3))
    assert isinstance(o.get(4), bytes) and len(o.get(4)) == 24
    assert o.get(5) is None or (isinstance(o.get(5), bytes) and len(o.get(5)) == 32)


def inside_shape_ok(i):
    if not isinstance(i, out_map):
        return False
    ks = i.keys()
    if not all(isinstance(k, int) and not isinstance(k, bool) and 0 <= k <= 10 for k in ks):
        return False
    if not (is_hash(i.get(0)) and isinstance(i.get(1), int) and isinstance(i.get(4), out_map)):
        return False
    salt = i.get(10)
    return isinstance(salt, bytes) and len(salt) == 16


def open_act(outside, locked):
    """The first check that fails, in the order the vectors state, or 'ok'."""
    if sha256(locked) != outside.get(3):
        return "locked_hash"
    key = outside.get(5)
    if key is None:
        return "no_key"
    try:
        plain = unlock(locked, key, outside.get(4))
    except Exception:
        return "unlock"
    if tagged_hash("MOR/inside", plain) != outside.get(2):
        return "inside_commitment"
    try:
        inside = decode(plain)
    except Reject:
        return "cbor"
    if not inside_shape_ok(inside):
        return "shape"
    if not all_text_canonical(inside):
        return "text"
    return "ok"


# ------------------------------------------------------------ the checks

# ---------------------------------------------------------------- textual forms (Identity draft 14, F349)

B32 = "qpzry9x8gf2tvdw0s3jn54khce6mua7l"
LABELS = {"mid", "mact", "mkey", "mspec", "mwork"}


def b32_polymod(values):
    gen = [0x3B6A57B2, 0x26508E6D, 0x1EA119FA, 0x3D4233DD, 0x2A1462B3]
    chk = 1
    for v in values:
        b = chk >> 25
        chk = ((chk & 0x1FFFFFF) << 5) ^ v
        for i in range(5):
            if (b >> i) & 1:
                chk ^= gen[i]
    return chk


def b32_expand(hrp):
    return [ord(c) >> 5 for c in hrp] + [0] + [ord(c) & 31 for c in hrp]


def textual_read(s, want):
    """A string where `want` is asked: (data, hints), or raise Reject with why, as the MIR says."""
    head, hints = (s.split("?", 1) + [""])[:2] if "?" in s else (s, "")
    hs = []
    for part in hints.split("&") if hints else []:
        if part.startswith("r="):
            from urllib.parse import unquote
            hs.append(unquote(part[2:]))
    if want != "mkey" and len(head) == 64 and all(c in "0123456789abcdefABCDEF" for c in head):
        return bytes.fromhex(head), hs
    if any(c.islower() for c in head) and any(c.isupper() for c in head):
        raise Reject("mixed case")
    head = head.lower()
    sep = head.rfind("1")
    hrp, rest = head[:sep], head[sep + 1:]
    if sep < 1 or len(rest) < 6 or any(c not in B32 for c in rest):
        raise Reject("checksum")
    data5 = [B32.index(c) for c in rest]
    if b32_polymod(b32_expand(hrp) + data5) != 0x2BC830A3:
        raise Reject("checksum")
    if hrp not in LABELS:
        raise Reject("unknown label")
    if hrp != want:
        raise Reject(f"wrong kind: {hrp} where {want} is wanted")
    acc = bits = 0
    out = bytearray()
    for v in data5[:-6]:
        acc = (acc << 5) | v
        bits += 5
        if bits >= 8:
            bits -= 8
            out.append((acc >> bits) & 0xFF)
    if bits >= 5 or acc & ((1 << bits) - 1):
        raise Reject("checksum")
    return bytes(out), hs


# ------------------------------------------------------------ verdicts this implementation can judge

def open_whole(b):
    """An act's bytes, [outside, locked, [scheme, key, sig]]: the decoded
    outside, inside (or None where it does not open) and signature."""
    a = decode(b)
    assert isinstance(a, list) and len(a) == 3
    outside, locked, sig = a
    check_outside_shape(outside)
    inside = None
    if open_act(outside, locked) == "ok":
        inside = decode(unlock(locked, outside.get(5), outside.get(4)))
    return outside, inside, sig


def act_id(outside):
    return tagged_hash("MOR/act", encode_map(outside))


def encode_map(m):
    """Re-encode a decoded map: its entries are already in deterministic order."""
    return head(5, len(m)) + b"".join(ek + encode_any(v) for _, v, ek in m)


def encode_any(v):
    if isinstance(v, out_map):
        return encode_map(v)
    if isinstance(v, list):
        return head(4, len(v)) + b"".join(encode_any(x) for x in v)
    return encode(v)


def sig_ok(outside, sig):
    scheme, key, s = sig
    return sigs.verify(scheme, key, s, act_id(outside)) is True


def genesis_key(inside):
    p = inside.get(4)
    k = p.get(0) if isinstance(p, out_map) else None
    return k if isinstance(k, list) and len(k) == 2 else None


def py_verdict(case, pool, mirs):
    """The verdict of this implementation for the cases tagged with what it
    judges: Identity's genesis checks, a text act at a Text-only verifier,
    a sequence's prev, position and summary, invalid beating unknown."""
    acts = {}
    for i in case["acts"]:
        o, ins, sg = open_whole(bytes.fromhex(pool[i]))
        assert act_id(o).hex() == i
        acts[i] = (o, ins, sg)
    o, ins, sg = acts[case["ask"]["act"]]
    if ins is None:
        return "invalid"  # it does not open: Envelopes rules 1 to 5
    signer, binding = o.get(0), o.get(1)
    tag = case["python"]
    if tag == "genesis checks":
        k = genesis_key(ins)
        homes = ins.get(4).get(2) if isinstance(ins.get(4), out_map) else None
        ok = (ins.get(0) == H(mirs["identity"]) and ins.get(1) == 0 and signer is None and binding is None
              and k is not None and k == sg[:2] and isinstance(homes, list) and homes and sig_ok(o, sg))
        return "valid" if ok else "invalid"
    if not sig_ok(o, sg):
        return "invalid"
    if tag == "invalid beats unknown":
        return "unknown" if ins.get(0) not in [H(x) for x in mirs.values()] else "valid"
    # An everyday act bound to its signer's genesis, held in the case.
    g = acts.get(binding.hex()) if binding else None
    if g is None or g[1] is None or genesis_key(g[1]) != sg[:2] or act_id(g[0]) != signer:
        return "unknown"
    prev = ins.get(2)
    if not isinstance(prev, list) or len(prev) > 1:
        return "invalid"
    if tag == "sequence":
        line = []
        cur = prev
        while cur:
            line.insert(0, cur[0])
            cur = acts[cur[0].hex()][1].get(2)
        if ins.get(5) != len(line) + 1 or ins.get(6) != mmr_root(line):
            return "invalid"
        return "valid"
    # A text act, at a verifier implementing Text (Text rule 14, part three).
    if ins.get(0) != H(mirs["text"]):
        return "unknown"
    p = ins.get(4)
    keys = p.keys()
    if ins.get(1) != 0 or ins.get(7) is not None or 0 not in keys or not set(keys) <= {0, 1} or not isinstance(p.get(0), str):
        return "invalid"
    objs = ins.get(3)
    if objs is None:
        return "valid"
    if len(objs) == 1 and objs[0][0] == signer:
        return "unknown"  # a collective or a grant key cannot be told without Agreements
    return "invalid"


def py_spec(content, money, held):
    """Development, "How the content is decoded": 'a specification', 'no
    specification', or unknown where a payment cMIP's field 2 is needed."""
    try:
        m = decode(content)
    except Reject:
        return "no specification"
    if not isinstance(m, out_map) or not all_text_canonical(m):
        return "no specification"
    f = {}
    for k, v, _ in m:
        if not isinstance(k, int) or isinstance(k, bool) or not 0 <= k <= 13:
            return "no specification"
        f[k] = v
    is_uint = lambda v: isinstance(v, int) and not isinstance(v, bool) and v >= 0
    nonempty = lambda v: isinstance(v, list) and len(v) > 0
    ascending = lambda v, allowed: isinstance(v, list) and all(is_uint(x) and x in allowed for x in v) and all(a < b for a, b in zip(v, v[1:]))
    checks = {
        1: is_hash, 5: is_hash, 8: is_hash, 9: lambda v: isinstance(v, str), 11: is_uint, 12: lambda v: v is True,
        2: lambda v: nonempty(v) and all(isinstance(t, list) and len(t) == 2 and is_hash(t[0]) and is_uint(t[1]) for t in v),
        3: lambda v: nonempty(v) and all(isinstance(t, list) and len(t) == 3 and is_uint(t[0]) and isinstance(t[1], str) and isinstance(t[2], str) for t in v),
        4: lambda v: nonempty(v) and all(is_hash(x) for x in v),
        6: lambda v: nonempty(v) and all(isinstance(t, list) and len(t) == 4 and is_hash(t[0]) and is_uint(t[1]) and is_uint(t[2]) and is_hash(t[3]) for t in v),
        7: lambda v: isinstance(v, list) and len(v) in (1, 2) and isinstance(v[0], list) and len(v[0]) == 2 and v[0][0] in (0, 1) and (len(v) == 1 or is_hash(v[1])),
        10: lambda v: nonempty(v) and ascending(v, {0, 1, 2, 3}),
        13: lambda v: ascending(v, {0, 1, 2}),
        0: lambda v: is_uint(v) and v <= 8,
    }
    for k, v in f.items():
        if not checks[k](v):
            return "no specification"
    if 0 not in f or 9 not in f:
        return "no specification"
    kind = f[0]
    if (1 in f) == (kind in (4, 6, 7)):
        return "no specification"
    if (5 in f) != (kind == 1) or (kind == 8 and 8 not in f) or (12 in f and kind != 0):
        return "no specification"
    if (11 in f) != (13 in f) or (11 in f and kind != 1) or (11 in f and f[11] not in (0, 1)):
        return "no specification"
    if f.get(11) == 0 and not {0, 1} <= set(f[13]):
        return "no specification"
    if kind == 1 and 11 not in f:
        target = held.get(f[5].hex())
        if target is None:
            return "unknown: the cMIP %s is not held" % f[5].hex()
        c = decode(bytes.fromhex(target))
        tasks = c.get(2) or []
        if c.get(0) == 0 and any(t[0] == money and t[1] == 6 for t in tasks):
            return "no specification"
    return "a specification"


def frozen_text(file):
    # Development rule 26: the file's content less one final line break, and nothing else.
    return file[:-1] if file.endswith("\n") else file


def H(x):
    return bytes.fromhex(x)


def main():
    H = bytes.fromhex
    assert unicodedata2.unidata_version == "17.0.0", unicodedata2.unidata_version
    n = 0

    for v in load("tagged-hash.json")["vectors"]:
        assert tagged_hash(v["tag"], H(v["data"])) == H(v["hash"]), v
        n += 1

    f = load("cbor.json")
    for v in f["valid"]:
        decode(H(v["hex"]))
        n += 1
    for v in f["invalid"]:
        try:
            decode(H(v["hex"]))
        except Reject:
            n += 1
            continue
        raise AssertionError("accepted " + v["hex"])

    f = load("canonical-text.json")
    for v in f["vectors"]:
        s = "".join(chr(int(c[2:], 16)) for c in v["codepoints"])
        assert s.encode("utf-8") == H(v["utf8"])
        assert text_rule(s) == v["rule"], (v["note"], text_rule(s))
        assert (text_rule(s) is None) == v["canonical"]
        n += 1

    for v in load("lock.json")["vectors"]:
        locked = lock(H(v["plaintext"]), H(v["key"]), H(v["nonce"]))
        assert locked == H(v["locked"]) and sha256(locked) == H(v["locked_hash"])
        n += 1

    f = load("running-summary.json")
    ids = [H(x) for x in f["act_ids"]]
    for s in f["summaries"]:
        assert mmr_root(ids[: s["acts"]]) == H(s["summary"]), s
        n += 1

    # The three-act sequence, built from its fields alone.
    f = load("sequence-three-acts.json")
    spec, signer, binding = H(f["spec"]), H(f["signer"]), H(f["binding"])
    ids = []
    for a in f["acts"]:
        pos = a["position"]
        inside = {0: spec, 1: 0, 2: list(ids[-1:]), 4: {0: a["text"]},
                  5: pos, 6: mmr_root(ids), 10: H(a["salt"])}
        if pos == 2:
            inside[8] = [ids[0]]
        if pos == 3:
            inside[9] = "2026-09-28"
        enc = encode(inside)
        assert enc == H(a["inside"]), f"inside of act {pos}"
        assert text_rule(a["text"]) is None
        assert mmr_root(ids) == H(a["summary"])
        key, nonce = H(a["content_key"]), H(a["nonce"])
        locked = lock(enc, key, nonce)
        assert locked == H(a["locked"])
        outside = {0: signer, 1: binding, 2: tagged_hash("MOR/inside", enc),
                   3: sha256(locked), 4: nonce, 5: key}
        oenc = encode(outside)
        assert oenc == H(a["outside"]), f"outside of act {pos}"
        check_outside_shape(decode(oenc))
        act_id = tagged_hash("MOR/act", oenc)
        assert act_id == H(a["act_id"]), f"act id of act {pos}"
        assert open_act(decode(oenc), locked) == "ok"
        ids.append(act_id)
        n += 1
    assert mmr_root(ids) == H(f["summary_including_last"])

    for v in load("open-act.json")["vectors"]:
        o = decode(H(v["outside"]))
        check_outside_shape(o)
        assert open_act(o, H(v["locked"])) == v["result"], v["why"]
        n += 1

    f = load("textual-forms.json")
    for v in f["forms"]:
        assert textual_read(v["form"], v["kind"])[0] == H(v["data"]), v
        assert v["form"] == v["form"].lower()
        n += 1
    for k in ("upper", "lives", "bare"):
        data, hs = textual_read(f[k]["form"], f[k]["want"])
        assert data == H(f[k]["data"]), k
        if k == "lives":
            assert hs == f[k]["hints"], hs
        n += 1
    for v in f["refused"]:
        try:
            textual_read(v["form"], v["want"])
        except Reject as e:
            assert str(e) == v["why"], (str(e), v["why"])
            n += 1
            continue
        raise AssertionError("accepted " + v["form"])

    # Part 2: signatures, verified by sigs.py (BIP-340 and FIPS 205 written
    # from the standards); the keys recomputed from their secrets and seeds.
    f = load("signatures.json")
    m = H(f["msg"])
    s = f["schnorr"]
    assert sigs.schnorr_public(H(s["secret"])) == H(s["public_key"])
    for k in ("sig", "sig_zero_aux"):
        assert sigs.verify(1, H(s["public_key"]), H(s[k]), m), k
        n += 1
    assert tagged_hash("MOR/safety", bytes([1]) + H(s["public_key"])) == H(s["commitment_if_scheme_1"])
    for v in s["invalid"]:
        assert not sigs.verify(1, H(v["key"]), H(v["sig"]), H(v["msg"])), v["why"]
        n += 1
    for x in f["slh_dsa"]:
        pk = H(x["public_key"])
        assert pk[:16] == H(x["pk_seed"]) and sigs.slh_keygen_root(x["scheme"], H(x["sk_seed"]), H(x["pk_seed"])) == pk[16:], x["name"]
        assert tagged_hash("MOR/safety", bytes([x["scheme"]]) + pk) == H(x["commitment"])
        for k in ("deterministic", "hedged"):
            assert sigs.verify(x["scheme"], pk, H(x[k]), m), (x["name"], k)
            n += 1
        for v in x["invalid"]:
            assert not sigs.verify(x["scheme"], H(v["key"]), H(v["sig"]), H(v["msg"])), (x["name"], v["why"])
            n += 1

    # Verdict vectors: those this implementation judges (README, "verdicts.json").
    f = load("verdicts.json")
    mirs, pool = f["mirs"], f["pool"]
    # A new content key, and a new nonce, for every act (Envelopes rule 9):
    # no two acts of the pool share either.
    keys, nonces = {}, {}
    for i, b in pool.items():
        o = decode(bytes.fromhex(b))[0]
        k, nc = o.get(5), o.get(4)
        assert keys.setdefault(k, i) == i, ("a content key locks two acts", i, keys[k])
        assert nonces.setdefault(nc, i) == i, ("a nonce locks two acts", i, nonces[nc])
    n += 1
    judged = 0
    for layer in ("identity", "text", "envelopes", "money", "agreements"):
        for c in f["cases"][layer]:
            if "python" not in c:
                continue
            got = py_verdict(c, pool, mirs)
            want = "unknown" if c["python"] == "at a Text-only verifier: unknown" else c["verdict"]
            assert got == want, (c["name"], got, want)
            n += 1
            judged += 1
    for c in f["cases"]["development"]:
        held = c["held_specifications"]
        assert tagged_hash("MOR/spec", H(c["content"])) == H(c["spec_hash"])
        assert py_spec(H(c["content"]), H(c["money"]), held) == c["verdict"], c["name"]
        n += 1
        judged += 1
    for c in f["cases"]["mir_hashes"]:
        t = frozen_text(c["file"])
        got = None if text_rule(t) is not None else tagged_hash("MOR/spec", encode({0: 4, 9: t})).hex()
        assert got == c["spec_hash"], c["name"]
        n += 1
        judged += 1

    print(f"all {n} vectors agree ({judged} verdict vectors judged here)")


if __name__ == "__main__":
    try:
        main()
    except AssertionError as e:
        print("MISMATCH:", e)
        sys.exit(1)
