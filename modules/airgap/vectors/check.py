#!/usr/bin/env python3
"""A second, independent check of the seed vectors, written from the seed
Modules' texts and sharing no code with the Rust library: the key-generation
seeds each key is derived from, and the hex Module's backups and checksum.
(The public keys are checked against a second SLH-DSA implementation by the
Rust tests; BIP-39's word encoding by its own published vectors.)

    python3 modules/airgap/vectors/check.py
"""
import hashlib, json, os, struct

def tagged_hash(tag, data):
    t = hashlib.sha256(tag.encode()).digest()
    return hashlib.sha256(t + t + data).digest()

TAGS = {"words": "MOR/module/seed-words/key", "hex": "MOR/module/seed-hex/key"}

here = os.path.dirname(os.path.abspath(__file__))
vectors = json.load(open(os.path.join(here, "seeds.json")))["vectors"]
n = 0
for v in vectors:
    seed = bytes.fromhex(v["seed"])
    if v["module"] == "hex":
        check = tagged_hash("MOR/module/seed-hex/check", seed)[:4]
        written = (seed + check).hex()
        groups = " ".join(written[i:i + 4] for i in range(0, 72, 4))
        assert v["backup"] == groups, v["backup"]
    for k in v["keys"]:
        pre = seed + bytes([k["scheme"]]) + struct.pack(">Q", k["index"])
        a = tagged_hash(TAGS[v["module"]], pre + b"\x00")
        b = tagged_hash(TAGS[v["module"]], pre + b"\x01")
        assert a[:16].hex() == k["sk_seed"]
        assert a[16:].hex() == k["sk_prf"]
        assert b[:16].hex() == k["pk_seed"]
        # An SLH-DSA public key begins with pk_seed (FIPS 205).
        assert k["public_key"].startswith(k["pk_seed"])
        # The commitment: tagged_hash("MOR/safety", scheme || key).
        c = tagged_hash("MOR/safety", bytes([k["scheme"]]) + bytes.fromhex(k["public_key"]))
        assert c.hex() == k["commitment"]
        n += 1
print(f"seed vectors: {n} keys checked")
