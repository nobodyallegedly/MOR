//! The second, independent X-Wing, for the tests only: libcrux's formally
//! verified ML-KEM-768, X25519 and SHA-3 (Cryspen), sharing no code with
//! `fips203`, `x25519-dalek` or `sha3`, and the draft's construction written
//! again from its text. Every key exchange in the tests goes through the
//! `checked_*` functions, which run both implementations and require them
//! to agree byte for byte (the condition of F98).

#![allow(dead_code)]

use mor_core::xwing;

const LABEL: [u8; 6] = [0x5c, 0x2e, 0x2f, 0x2f, 0x5e, 0x5c];

struct Expanded {
    sk_m: libcrux_ml_kem::mlkem768::MlKem768PrivateKey,
    pk_m: [u8; 1184],
    sk_x: [u8; 32],
    pk_x: [u8; 32],
}

fn expand(sk: &[u8; 32]) -> Expanded {
    let e: [u8; 96] = libcrux_sha3::shake256::<96>(sk);
    let kp = libcrux_ml_kem::mlkem768::generate_key_pair(e[..64].try_into().unwrap());
    let sk_x: [u8; 32] = e[64..].try_into().unwrap();
    let mut pk_x = [0u8; 32];
    libcrux_curve25519::secret_to_public(&mut pk_x, &sk_x);
    let (sk_m, pk_m) = kp.into_parts();
    Expanded {
        sk_m,
        pk_m: *pk_m.as_slice(),
        sk_x,
        pk_x,
    }
}

fn combiner(ss_m: &[u8], ss_x: &[u8], ct_x: &[u8], pk_x: &[u8]) -> [u8; 32] {
    let mut m = Vec::with_capacity(134);
    for part in [ss_m, ss_x, ct_x, pk_x, &LABEL[..]] {
        m.extend_from_slice(part);
    }
    libcrux_sha3::sha256(&m)
}

pub fn public_key(sk: &[u8; 32]) -> Vec<u8> {
    let e = expand(sk);
    [&e.pk_m[..], &e.pk_x[..]].concat()
}

pub fn encapsulate(pk: &[u8], eseed: &[u8; 64]) -> Option<([u8; 32], Vec<u8>)> {
    if pk.len() != 1216 {
        return None;
    }
    let pk_m = libcrux_ml_kem::mlkem768::MlKem768PublicKey::from(
        <[u8; 1184]>::try_from(&pk[..1184]).unwrap(),
    );
    if !libcrux_ml_kem::mlkem768::validate_public_key(&pk_m) {
        return None;
    }
    let pk_x: [u8; 32] = pk[1184..].try_into().unwrap();
    let ek_x: [u8; 32] = eseed[32..].try_into().unwrap();
    let mut ct_x = [0u8; 32];
    libcrux_curve25519::secret_to_public(&mut ct_x, &ek_x);
    let mut ss_x = [0u8; 32];
    libcrux_curve25519::ecdh(&mut ss_x, &pk_x, &ek_x).ok()?;
    let (ct_m, ss_m) =
        libcrux_ml_kem::mlkem768::encapsulate(&pk_m, eseed[..32].try_into().unwrap());
    let ss = combiner(&ss_m, &ss_x, &ct_x, &pk_x);
    Some((ss, [ct_m.as_slice().as_slice(), &ct_x[..]].concat()))
}

pub fn decapsulate(sk: &[u8; 32], ct: &[u8]) -> Option<[u8; 32]> {
    if ct.len() != 1120 {
        return None;
    }
    let e = expand(sk);
    let ct_m = libcrux_ml_kem::mlkem768::MlKem768Ciphertext::from(
        <[u8; 1088]>::try_from(&ct[..1088]).unwrap(),
    );
    let ct_x: [u8; 32] = ct[1088..].try_into().unwrap();
    let ss_m = libcrux_ml_kem::mlkem768::decapsulate(&e.sk_m, &ct_m);
    let mut ss_x = [0u8; 32];
    libcrux_curve25519::ecdh(&mut ss_x, &ct_x, &e.sk_x).ok()?;
    Some(combiner(&ss_m, &ss_x, &ct_x, &e.pk_x))
}

/// Counts the key exchanges checked, so a test can show none escaped.
pub static CHECKED: std::sync::atomic::AtomicUsize = std::sync::atomic::AtomicUsize::new(0);

fn count() {
    CHECKED.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
}

pub fn checked_public_key(sk: &[u8; 32]) -> Vec<u8> {
    let a = xwing::public_key(sk);
    assert_eq!(
        a,
        public_key(sk),
        "the two X-Wing implementations disagree on a public key"
    );
    count();
    a
}

pub fn checked_encapsulate(pk: &[u8], eseed: &[u8; 64]) -> Option<([u8; 32], Vec<u8>)> {
    let a = xwing::encapsulate(pk, eseed).ok();
    assert_eq!(
        a,
        encapsulate(pk, eseed),
        "the two X-Wing implementations disagree on an encapsulation"
    );
    count();
    a
}

pub fn checked_decapsulate(sk: &[u8; 32], ct: &[u8]) -> Option<[u8; 32]> {
    let a = xwing::decapsulate(sk, ct).ok();
    assert_eq!(
        a,
        decapsulate(sk, ct),
        "the two X-Wing implementations disagree on a decapsulation"
    );
    count();
    a
}
