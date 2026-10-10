//! Signatures (Identity, "Signature schemes").
//!
//! Schnorr against BIP-340's own test vectors. SLH-DSA from the `fips205`
//! crate against a second, independent implementation (RustCrypto's
//! `slh-dsa`), both variants: the same seeds give the same keys, the same
//! act id gives byte-identical signatures, and the two agree on every
//! signature, valid or broken (the author's condition for adopting fips205).

use mor_core::act::{Scheme, Signature};
use mor_core::hash::{sha256, Hash};
use mor_core::sig::{self, SchnorrKey, SlhKey, Verdict, SLH_CONTEXT};
use slh_dsa::{Sha2_128f, Sha2_128s};

// ---------------------------------------------------------------- Schnorr

fn h32(s: &str) -> [u8; 32] {
    hex::decode(s).unwrap().try_into().unwrap()
}

fn schnorr(key: &str, sig: &str) -> Signature {
    Signature {
        scheme: Scheme::Founding(1),
        key: hex::decode(key).unwrap(),
        sig: hex::decode(sig).unwrap(),
    }
}

/// BIP-340 signing vectors 0 to 3: secret, public key, aux, message, signature.
const SIGN: &[(&str, &str, &str, &str, &str)] = &[
    ("0000000000000000000000000000000000000000000000000000000000000003",
     "F9308A019258C31049344F85F89D5229B531C845836F99B08601F113BCE036F9",
     "0000000000000000000000000000000000000000000000000000000000000000",
     "0000000000000000000000000000000000000000000000000000000000000000",
     "E907831F80848D1069A5371B402410364BDF1C5F8307B0084C55F1CE2DCA821525F66A4A85EA8B71E482A74F382D2CE5EBEEE8FDB2172F477DF4900D310536C0"),
    ("B7E151628AED2A6ABF7158809CF4F3C762E7160F38B4DA56A784D9045190CFEF",
     "DFF1D77F2A671C5F36183726DB2341BE58FEAE1DA2DECED843240F7B502BA659",
     "0000000000000000000000000000000000000000000000000000000000000001",
     "243F6A8885A308D313198A2E03707344A4093822299F31D0082EFA98EC4E6C89",
     "6896BD60EEAE296DB48A229FF71DFE071BDE413E6D43F917DC8DCF8C78DE33418906D11AC976ABCCB20B091292BFF4EA897EFCB639EA871CFA95F6DE339E4B0A"),
    ("C90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B14E5C9",
     "DD308AFEC5777E13121FA72B9CC1B7CC0139715309B086C960E18FD969774EB8",
     "C87AA53824B4D7AE2EB035A2B5BBBCCC080E76CDC6D1692C4B0B62D798E6D906",
     "7E2D58D8B3BCDF1ABADEC7829054F90DDA9805AAB56C77333024B9D0A508B75C",
     "5831AAEED7B44BB74E5EAB94BA9D4294C49BCF2A60728D8B4C200F50DD313C1BAB745879A5AD954A72C45A91C3A51D3C7ADEA98D82F8481E0E1E03674A6F3FB7"),
    ("0B432B2677937381AEF05BB02A66ECD012773062CF3FA2549E44F58ED2401710",
     "25D1DFF95105F5253C4022F628A996AD3A0D95FBF21D468A1B33F8C160D8F517",
     "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
     "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
     "7EB0509757E246F19449885651611CB965ECC1A187DD51B64FDA1EDC9637D5EC97582B9CB13DB3933705B32BA982AF5AF25FD78881EBB32771FC5922EFC66EA3"),
];

/// BIP-340 verification vectors 4 to 14: public key, message, signature, valid.
const VERIFY: &[(&str, &str, &str, bool)] = &[
    ("D69C3509BB99E412E68B0FE8544E72837DFA30746D8BE2AA65975F29D22DC7B9",
     "4DF3C3F68FCC83B27E9D42C90431A72499F17875C81A599B566C9889B9696703",
     "00000000000000000000003B78CE563F89A0ED9414F5AA28AD0D96D6795F9C6376AFB1548AF603B3EB45C9F8207DEE1060CB71C04E80F593060B07D28308D7F4", true),
    ("EEFDEA4CDB677750A420FEE807EACF21EB9898AE79B9768766E4FAA04A2D4A34",
     "243F6A8885A308D313198A2E03707344A4093822299F31D0082EFA98EC4E6C89",
     "6CFF5C3BA86C69EA4B7376F31A9BCB4F74C1976089B2D9963DA2E5543E17776969E89B4C5564D00349106B8497785DD7D1D713A8AE82B32FA79D5F7FC407D39B", false),
    ("DFF1D77F2A671C5F36183726DB2341BE58FEAE1DA2DECED843240F7B502BA659",
     "243F6A8885A308D313198A2E03707344A4093822299F31D0082EFA98EC4E6C89",
     "FFF97BD5755EEEA420453A14355235D382F6472F8568A18B2F057A14602975563CC27944640AC607CD107AE10923D9EF7A73C643E166BE5EBEAFA34B1AC553E2", false),
    ("DFF1D77F2A671C5F36183726DB2341BE58FEAE1DA2DECED843240F7B502BA659",
     "243F6A8885A308D313198A2E03707344A4093822299F31D0082EFA98EC4E6C89",
     "1FA62E331EDBC21C394792D2AB1100A7B432B013DF3F6FF4F99FCB33E0E1515F28890B3EDB6E7189B630448B515CE4F8622A954CFE545735AAEA5134FCCDB2BD", false),
    ("DFF1D77F2A671C5F36183726DB2341BE58FEAE1DA2DECED843240F7B502BA659",
     "243F6A8885A308D313198A2E03707344A4093822299F31D0082EFA98EC4E6C89",
     "6CFF5C3BA86C69EA4B7376F31A9BCB4F74C1976089B2D9963DA2E5543E177769961764B3AA9B2FFCB6EF947B6887A226E8D7C93E00C5ED0C1834FF0D0C2E6DA6", false),
    ("DFF1D77F2A671C5F36183726DB2341BE58FEAE1DA2DECED843240F7B502BA659",
     "243F6A8885A308D313198A2E03707344A4093822299F31D0082EFA98EC4E6C89",
     "0000000000000000000000000000000000000000000000000000000000000000123DDA8328AF9C23A94C1FEECFD123BA4FB73476F0D594DCB65C6425BD186051", false),
    ("DFF1D77F2A671C5F36183726DB2341BE58FEAE1DA2DECED843240F7B502BA659",
     "243F6A8885A308D313198A2E03707344A4093822299F31D0082EFA98EC4E6C89",
     "00000000000000000000000000000000000000000000000000000000000000017615FBAF5AE28864013C099742DEADB4DBA87F11AC6754F93780D5A1837CF197", false),
    ("DFF1D77F2A671C5F36183726DB2341BE58FEAE1DA2DECED843240F7B502BA659",
     "243F6A8885A308D313198A2E03707344A4093822299F31D0082EFA98EC4E6C89",
     "4A298DACAE57395A15D0795DDBFD1DCB564DA82B0F269BC70A74F8220429BA1D69E89B4C5564D00349106B8497785DD7D1D713A8AE82B32FA79D5F7FC407D39B", false),
    ("DFF1D77F2A671C5F36183726DB2341BE58FEAE1DA2DECED843240F7B502BA659",
     "243F6A8885A308D313198A2E03707344A4093822299F31D0082EFA98EC4E6C89",
     "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F69E89B4C5564D00349106B8497785DD7D1D713A8AE82B32FA79D5F7FC407D39B", false),
    ("DFF1D77F2A671C5F36183726DB2341BE58FEAE1DA2DECED843240F7B502BA659",
     "243F6A8885A308D313198A2E03707344A4093822299F31D0082EFA98EC4E6C89",
     "6CFF5C3BA86C69EA4B7376F31A9BCB4F74C1976089B2D9963DA2E5543E177769FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141", false),
    ("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC30",
     "243F6A8885A308D313198A2E03707344A4093822299F31D0082EFA98EC4E6C89",
     "6CFF5C3BA86C69EA4B7376F31A9BCB4F74C1976089B2D9963DA2E5543E17776969E89B4C5564D00349106B8497785DD7D1D713A8AE82B32FA79D5F7FC407D39B", false),
];

#[test]
fn schnorr_signs_bip340_vectors_exactly() {
    for (secret, public, aux, msg, expected) in SIGN {
        let k = SchnorrKey::from_secret(&h32(secret)).unwrap();
        assert_eq!(hex::encode_upper(k.public()), *public);
        let s = k.sign(&h32(msg), &h32(aux));
        assert_eq!(hex::encode_upper(&s.sig), *expected);
        assert_eq!(sig::verify(&s, &h32(msg)), Verdict::Valid);
    }
}

#[test]
fn schnorr_verifies_bip340_vectors() {
    for (i, (key, msg, s, valid)) in VERIFY.iter().enumerate() {
        let want = if *valid {
            Verdict::Valid
        } else {
            Verdict::Invalid
        };
        assert_eq!(
            sig::verify(&schnorr(key, s), &h32(msg)),
            want,
            "vector {}",
            i + 4
        );
    }
}

#[test]
fn wrong_lengths_are_invalid_and_other_schemes_unknown() {
    let (_, public, _, msg, s) = SIGN[1];
    let good = schnorr(public, s);
    assert_eq!(sig::verify(&good, &h32(msg)), Verdict::Valid);
    let mut short = good.clone();
    short.sig.pop();
    assert_eq!(sig::verify(&short, &h32(msg)), Verdict::Invalid);
    let mut long_key = good.clone();
    long_key.key.push(0);
    assert_eq!(sig::verify(&long_key, &h32(msg)), Verdict::Invalid);
    let mut other = good.clone();
    other.scheme = Scheme::Spec(sha256(b"a signature-scheme specification"));
    assert_eq!(sig::verify(&other, &h32(msg)), Verdict::Unknown);
    let mut slh = good;
    slh.scheme = Scheme::Founding(2);
    assert_eq!(sig::verify(&slh, &h32(msg)), Verdict::Invalid);
}

#[test]
fn chain_key_commitment_is_tagged_over_scheme_and_key() {
    let key = [7u8; 32];
    let spec = sha256(b"spec");
    // tagged_hash("MOR/safety", 0x02 || key)
    let mut two = vec![2u8];
    two.extend_from_slice(&key);
    assert_eq!(
        sig::chain_key_commitment(&Scheme::Founding(2), &key),
        mor_core::tagged_hash("MOR/safety", &two)
    );
    let mut by_spec = spec.to_vec();
    by_spec.extend_from_slice(&key);
    assert_eq!(
        sig::chain_key_commitment(&Scheme::Spec(spec), &key),
        mor_core::tagged_hash("MOR/safety", &by_spec)
    );
    assert_ne!(
        sig::chain_key_commitment(&Scheme::Founding(2), &key),
        sig::chain_key_commitment(&Scheme::Founding(3), &key)
    );
}

// ---------------------------------------------------------------- SLH-DSA, two implementations

/// The second implementation's verdict on a signature.
pub fn second_opinion(s: &Signature, msg: &[u8]) -> bool {
    fn check<P: slh_dsa::ParameterSet>(key: &[u8], sig: &[u8], msg: &[u8]) -> bool {
        let (Ok(vk), Ok(sg)) = (
            slh_dsa::VerifyingKey::<P>::try_from(key),
            slh_dsa::Signature::<P>::try_from(sig),
        ) else {
            return false;
        };
        vk.try_verify_with_context(msg, SLH_CONTEXT, &sg).is_ok()
    }
    match s.scheme {
        Scheme::Founding(2) => check::<Sha2_128s>(&s.key, &s.sig, msg),
        Scheme::Founding(3) => check::<Sha2_128f>(&s.key, &s.sig, msg),
        _ => panic!("not SLH-DSA"),
    }
}

fn seeds(n: u8) -> ([u8; 16], [u8; 16], [u8; 16]) {
    let h = sha256(&[n]);
    let g = sha256(&h);
    (
        h[..16].try_into().unwrap(),
        h[16..].try_into().unwrap(),
        g[..16].try_into().unwrap(),
    )
}

fn agree(s: &Signature, msg: &Hash) -> bool {
    let ours = sig::verify(s, msg) == Verdict::Valid;
    assert_eq!(ours, second_opinion(s, msg), "fips205 and slh-dsa disagree");
    ours
}

fn both_variants(f: impl Fn(u8)) {
    f(2);
    f(3);
}

#[test]
fn same_seeds_same_keys_same_signatures() {
    both_variants(|scheme| {
        for n in 0..3u8 {
            let (sk_seed, sk_prf, pk_seed) = seeds(n + 10 * scheme);
            let ours = SlhKey::from_seeds(scheme, &sk_seed, &sk_prf, &pk_seed);
            let msg = sha256(&[n, scheme, 1]);
            // Deterministic signing (opt_rand = pk_seed), then hedged.
            for opt_rand in [None, Some(sha256(&[n])[..16].try_into().unwrap())] {
                let s = ours.sign(&msg, opt_rand.as_ref());
                let theirs: Vec<u8> = match scheme {
                    2 => {
                        let k = slh_dsa::SigningKey::<Sha2_128s>::slh_keygen_internal(
                            &sk_seed, &sk_prf, &pk_seed,
                        );
                        assert_eq!(k.as_ref().to_bytes().as_slice(), ours.public().as_slice());
                        k.try_sign_with_context(
                            &msg,
                            SLH_CONTEXT,
                            opt_rand.as_ref().map(|r| &r[..]),
                        )
                        .unwrap()
                        .to_vec()
                    }
                    _ => {
                        let k = slh_dsa::SigningKey::<Sha2_128f>::slh_keygen_internal(
                            &sk_seed, &sk_prf, &pk_seed,
                        );
                        assert_eq!(k.as_ref().to_bytes().as_slice(), ours.public().as_slice());
                        k.try_sign_with_context(
                            &msg,
                            SLH_CONTEXT,
                            opt_rand.as_ref().map(|r| &r[..]),
                        )
                        .unwrap()
                        .to_vec()
                    }
                };
                assert_eq!(s.sig, theirs, "scheme {scheme}: signatures differ");
                assert_eq!(s.sig.len(), if scheme == 2 { 7856 } else { 17088 });
                assert!(agree(&s, &msg));
            }
        }
    });
}

#[test]
fn both_implementations_reject_every_broken_signature() {
    both_variants(|scheme| {
        let (a, b, c) = seeds(40 + scheme);
        let k = SlhKey::from_seeds(scheme, &a, &b, &c);
        let msg = sha256(b"an act id");
        let good = k.sign(&msg, None);
        assert!(agree(&good, &msg));
        // Another act id.
        assert!(!agree(&good, &sha256(b"another act id")));
        // A flipped bit in the randomizer, the FORS part, the hypertree, the last byte.
        for at in [0, 20, good.sig.len() / 2, good.sig.len() - 1] {
            let mut bad = good.clone();
            bad.sig[at] ^= 1;
            assert!(!agree(&bad, &msg), "flipped byte {at}");
        }
        // Another key: a flipped bit in pk_seed, then in pk_root.
        for at in [0, 31] {
            let mut bad = good.clone();
            bad.key[at] ^= 0x80;
            assert!(!agree(&bad, &msg));
        }
        // The same signature under the other variant's name has the wrong length.
        let mut other = good.clone();
        other.scheme = Scheme::Founding(if scheme == 2 { 3 } else { 2 });
        assert_eq!(sig::verify(&other, &msg), Verdict::Invalid);
    });
}

#[test]
fn the_context_string_is_mor() {
    both_variants(|scheme| {
        let (a, b, c) = seeds(50 + scheme);
        let msg = sha256(b"x");
        let s = SlhKey::from_seeds(scheme, &a, &b, &c).sign(&msg, None);
        let check = |ctx: &[u8]| -> bool {
            match scheme {
                2 => slh_dsa::VerifyingKey::<Sha2_128s>::try_from(&s.key[..])
                    .unwrap()
                    .try_verify_with_context(
                        &msg,
                        ctx,
                        &slh_dsa::Signature::try_from(&s.sig[..]).unwrap(),
                    )
                    .is_ok(),
                _ => slh_dsa::VerifyingKey::<Sha2_128f>::try_from(&s.key[..])
                    .unwrap()
                    .try_verify_with_context(
                        &msg,
                        ctx,
                        &slh_dsa::Signature::try_from(&s.sig[..]).unwrap(),
                    )
                    .is_ok(),
            }
        };
        assert!(check(b"MOR"));
        assert!(!check(b""));
        assert!(!check(b"MOR/"));
    });
}
