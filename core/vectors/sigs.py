"""Signature verification for the vector check, written from the standards.

BIP-340 (Schnorr over secp256k1), from the BIP's text; SLH-DSA-SHA2-128s and
-128f (FIPS 205, pure, with a context string), from the standard's
algorithms 4 to 20 and section 11.2. Verification only: nothing here signs.
Shares no code with the Rust library.
"""

import hashlib

# ------------------------------------------------------------ BIP-340

P = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F
N = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141
G = (0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798,
     0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8)


def _tagged(tag, data):
    t = hashlib.sha256(tag.encode()).digest()
    return hashlib.sha256(t + t + data).digest()


def _add(p1, p2):
    if p1 is None:
        return p2
    if p2 is None:
        return p1
    if p1[0] == p2[0] and p1[1] != p2[1]:
        return None
    if p1 == p2:
        lam = 3 * p1[0] * p1[0] * pow(2 * p1[1], P - 2, P) % P
    else:
        lam = (p2[1] - p1[1]) * pow(p2[0] - p1[0], P - 2, P) % P
    x3 = (lam * lam - p1[0] - p2[0]) % P
    return (x3, (lam * (p1[0] - x3) - p1[1]) % P)


def _mul(p, n):
    r = None
    for i in range(256):
        if (n >> i) & 1:
            r = _add(r, p)
        p = _add(p, p)
    return r


def _lift_x(x):
    if x >= P:
        return None
    y_sq = (pow(x, 3, P) + 7) % P
    y = pow(y_sq, (P + 1) // 4, P)
    if pow(y, 2, P) != y_sq:
        return None
    return (x, y if y % 2 == 0 else P - y)


def schnorr_verify(pk, msg, sig):
    """BIP-340 Verify(pk, m, sig), any message length (here the 32-byte act id)."""
    if len(pk) != 32 or len(sig) != 64:
        return False
    pt = _lift_x(int.from_bytes(pk, "big"))
    r = int.from_bytes(sig[:32], "big")
    s = int.from_bytes(sig[32:], "big")
    if pt is None or r >= P or s >= N:
        return False
    e = int.from_bytes(_tagged("BIP0340/challenge", sig[:32] + pk + msg), "big") % N
    R = _add(_mul(G, s), _mul(pt, N - e))
    return R is not None and R[1] % 2 == 0 and R[0] == r


# ------------------------------------------------------------ SLH-DSA (FIPS 205)

PARAMS = {
    # name: (n, h, d, h', a, k, lg_w, m)
    2: ("SLH-DSA-SHA2-128s", 16, 63, 7, 9, 12, 14, 4, 30),
    3: ("SLH-DSA-SHA2-128f", 16, 66, 22, 3, 6, 33, 4, 34),
}
WOTS_HASH, WOTS_PK, TREE, FORS_TREE, FORS_ROOTS = 0, 1, 2, 3, 4


class Adrs:
    """The 32-byte address: layer (4), tree (12), type (4), three words."""

    def __init__(self):
        self.b = bytearray(32)

    def copy(self):
        a = Adrs()
        a.b = bytearray(self.b)
        return a

    def _set(self, off, ln, v):
        self.b[off:off + ln] = v.to_bytes(ln, "big")

    def layer(self, v):
        self._set(0, 4, v)

    def tree(self, v):
        self._set(4, 12, v)

    def type_and_clear(self, t):
        self._set(16, 4, t)
        self.b[20:32] = bytes(12)

    def keypair(self, v):
        self._set(20, 4, v)

    def get_keypair(self):
        return int.from_bytes(self.b[20:24], "big")

    def chain(self, v):
        self._set(24, 4, v)

    tree_height = chain

    def hash_(self, v):
        self._set(28, 4, v)

    tree_index = hash_

    def get_tree_index(self):
        return int.from_bytes(self.b[28:32], "big")

    def compressed(self):
        # Section 11.2: layer's last byte, the tree's last 8 bytes, the type's last byte, the three words.
        return bytes(self.b[3:4] + self.b[8:16] + self.b[19:20] + self.b[20:32])


def _base_2b(x, b, out_len):
    i, bits, total, out = 0, 0, 0, []
    for _ in range(out_len):
        while bits < b:
            total = (total << 8) + x[i]
            i += 1
            bits += 8
        bits -= b
        out.append((total >> bits) % (1 << b))
    return out


def _mgf1_sha256(seed, ln):
    out = b""
    c = 0
    while len(out) < ln:
        out += hashlib.sha256(seed + c.to_bytes(4, "big")).digest()
        c += 1
    return out[:ln]


class Slh:
    def __init__(self, scheme):
        _, self.n, self.h, self.d, self.hp, self.a, self.k, self.lg_w, self.m = PARAMS[scheme]
        self.w = 1 << self.lg_w
        self.len1 = (8 * self.n + self.lg_w - 1) // self.lg_w
        self.len2 = ((self.len1 * (self.w - 1)).bit_length() - 1) // self.lg_w + 1
        self.len = self.len1 + self.len2

    # Section 11.2.1, security category 1: SHA-256 throughout.
    def _th(self, pk_seed, adrs, msg):
        pad = bytes(64 - self.n)
        return hashlib.sha256(pk_seed + pad + adrs.compressed() + msg).digest()[: self.n]

    F = H = T = _th

    def h_msg(self, r, pk_seed, pk_root, msg):
        return _mgf1_sha256(r + pk_seed + hashlib.sha256(r + pk_seed + pk_root + msg).digest(), self.m)

    def _chain(self, x, i, s, pk_seed, adrs):
        tmp = x
        for j in range(i, i + s):
            adrs.hash_(j)
            tmp = self.F(pk_seed, adrs, tmp)
        return tmp

    def wots_pk_from_sig(self, sig, msg, pk_seed, adrs):
        m = _base_2b(msg, self.lg_w, self.len1)
        csum = sum(self.w - 1 - x for x in m)
        csum <<= (8 - (self.len2 * self.lg_w) % 8) % 8
        m += _base_2b(csum.to_bytes((self.len2 * self.lg_w + 7) // 8, "big"), self.lg_w, self.len2)
        tmp = b""
        for i in range(self.len):
            adrs.chain(i)
            tmp += self._chain(sig[i * self.n:(i + 1) * self.n], m[i], self.w - 1 - m[i], pk_seed, adrs)
        pk_adrs = adrs.copy()
        pk_adrs.type_and_clear(WOTS_PK)
        pk_adrs.keypair(adrs.get_keypair())
        return self.T(pk_seed, pk_adrs, tmp)

    def xmss_pk_from_sig(self, idx, sig, msg, pk_seed, adrs):
        n = self.n
        adrs.type_and_clear(WOTS_HASH)
        adrs.keypair(idx)
        node = self.wots_pk_from_sig(sig[: self.len * n], msg, pk_seed, adrs)
        auth = sig[self.len * n:]
        adrs.type_and_clear(TREE)
        adrs.tree_index(idx)
        for k in range(self.hp):
            adrs.tree_height(k + 1)
            a = auth[k * n:(k + 1) * n]
            if (idx >> k) % 2 == 0:
                adrs.tree_index(adrs.get_tree_index() // 2)
                node = self.H(pk_seed, adrs, node + a)
            else:
                adrs.tree_index((adrs.get_tree_index() - 1) // 2)
                node = self.H(pk_seed, adrs, a + node)
        return node

    def ht_verify(self, msg, sig, pk_seed, idx_tree, idx_leaf, pk_root):
        n = self.n
        step = (self.hp + self.len) * n
        adrs = Adrs()
        adrs.tree(idx_tree)
        node = self.xmss_pk_from_sig(idx_leaf, sig[:step], msg, pk_seed, adrs)
        for j in range(1, self.d):
            idx_leaf = idx_tree % (1 << self.hp)
            idx_tree >>= self.hp
            adrs.layer(j)
            adrs.tree(idx_tree)
            node = self.xmss_pk_from_sig(idx_leaf, sig[j * step:(j + 1) * step], node, pk_seed, adrs)
        return node == pk_root

    def fors_pk_from_sig(self, sig, md, pk_seed, adrs):
        n, a = self.n, self.a
        idx = _base_2b(md, a, self.k)
        roots = b""
        for i in range(self.k):
            part = sig[i * (a + 1) * n:(i + 1) * (a + 1) * n]
            adrs.tree_height(0)
            adrs.tree_index(i * (1 << a) + idx[i])
            node = self.F(pk_seed, adrs, part[:n])
            auth = part[n:]
            for j in range(a):
                adrs.tree_height(j + 1)
                x = auth[j * n:(j + 1) * n]
                if (idx[i] >> j) % 2 == 0:
                    adrs.tree_index(adrs.get_tree_index() // 2)
                    node = self.H(pk_seed, adrs, node + x)
                else:
                    adrs.tree_index((adrs.get_tree_index() - 1) // 2)
                    node = self.H(pk_seed, adrs, x + node)
            roots += node
        pk_adrs = adrs.copy()
        pk_adrs.type_and_clear(FORS_ROOTS)
        pk_adrs.keypair(adrs.get_keypair())
        return self.T(pk_seed, pk_adrs, roots)

    def sig_len(self):
        return (1 + self.k * (1 + self.a) + self.h + self.d * self.len) * self.n

    def verify_internal(self, msg, sig, pk):
        n = self.n
        if len(sig) != self.sig_len() or len(pk) != 2 * n:
            return False
        pk_seed, pk_root = pk[:n], pk[n:]
        r = sig[:n]
        fors_len = self.k * (1 + self.a) * n
        sig_fors, sig_ht = sig[n:n + fors_len], sig[n + fors_len:]
        digest = self.h_msg(r, pk_seed, pk_root, msg)
        ka = (self.k * self.a + 7) // 8
        tl = (self.h - self.h // self.d + 7) // 8
        ll = (self.h // self.d + 7) // 8
        md = digest[:ka]
        idx_tree = int.from_bytes(digest[ka:ka + tl], "big") % (1 << (self.h - self.h // self.d))
        idx_leaf = int.from_bytes(digest[ka + tl:ka + tl + ll], "big") % (1 << (self.h // self.d))
        adrs = Adrs()
        adrs.tree(idx_tree)
        adrs.type_and_clear(FORS_TREE)
        adrs.keypair(idx_leaf)
        pk_fors = self.fors_pk_from_sig(sig_fors, md, pk_seed, adrs)
        return self.ht_verify(pk_fors, sig_ht, pk_seed, idx_tree, idx_leaf, pk_root)

    def verify(self, msg, sig, pk, ctx):
        """Algorithm 24, slh_verify, pure: M' = 0x00 || |ctx| || ctx || M."""
        if len(ctx) > 255:
            return False
        return self.verify_internal(bytes([0, len(ctx)]) + ctx + msg, sig, pk)


def verify(scheme, key, sig, msg):
    """A MOR signature over an act id: scheme 1 Schnorr; 2 and 3 SLH-DSA with context MOR."""
    if scheme == 1:
        return schnorr_verify(key, msg, sig)
    if scheme in (2, 3):
        return Slh(scheme).verify(msg, sig, key, b"MOR")
    return None  # a scheme this implementation does not implement: unknown


def schnorr_public(secret):
    """BIP-340's public key of a secret: the x-only coordinate of d*G."""
    return _mul(G, int.from_bytes(secret, "big"))[0].to_bytes(32, "big")


def slh_keygen_root(scheme, sk_seed, pk_seed):
    """FIPS 205 algorithm 18's PK.root, the top tree's root (xmss_node at layer d-1)."""
    s = Slh(scheme)
    adrs = Adrs()
    adrs.layer(s.d - 1)

    def wots_pk(idx):
        a = adrs.copy()
        a.type_and_clear(WOTS_HASH)
        a.keypair(idx)
        sk_adrs = a.copy()
        sk_adrs.type_and_clear(5)  # WOTS_PRF
        sk_adrs.keypair(idx)
        tmp = b""
        for i in range(s.len):
            sk_adrs.chain(i)
            sk = s.F(pk_seed, sk_adrs, sk_seed)  # PRF has the same shape as F at category 1
            a.chain(i)
            tmp += s._chain(sk, 0, s.w - 1, pk_seed, a)
        pk_adrs = a.copy()
        pk_adrs.type_and_clear(WOTS_PK)
        pk_adrs.keypair(idx)
        return s.T(pk_seed, pk_adrs, tmp)

    def node(i, z):
        if z == 0:
            return wots_pk(i)
        left, right = node(2 * i, z - 1), node(2 * i + 1, z - 1)
        a = adrs.copy()
        a.type_and_clear(TREE)
        a.tree_height(z)
        a.tree_index(i)
        return s.H(pk_seed, a, left + right)

    return node(0, s.hp)

