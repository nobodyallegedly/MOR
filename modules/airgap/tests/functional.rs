//! The Module's functional tests (section 7), and the seed Modules.

mod common;

use common::*;
use mor_airgap::device::{Choices, Refusal, Signer, Standing};
use mor_airgap::msg::{kind, Message};
use mor_airgap::online;
use mor_airgap::seed::{Seed, SeedModule};
use mor_airgap::transport::{self, QrReceiver, QrSender};
use mor_core::chain::Status;
use mor_core::sig;

// ---------------------------------------------------------------- QR helpers

/// Draw a frame as a greyscale image, `scale` pixels per module, with a
/// quiet zone, and read it back with an independent QR decoder (`rqrr`).
/// `light` and `dark` are the grey levels, so poor light can be simulated:
/// low contrast, and noise from `noise`.
fn photograph(
    frame: &str,
    scale: usize,
    light: u8,
    dark: u8,
    noise: &mut Option<TestRng>,
) -> Option<String> {
    use rand_core::RngCore;
    let code = transport::qr_code(frame);
    let w = code.width();
    let colors = code.to_colors();
    let q = 4;
    let side = (w + 2 * q) * scale;
    let mut px = vec![light; side * side];
    for y in 0..w {
        for x in 0..w {
            if colors[y * w + x] == qrcode::Color::Dark {
                for dy in 0..scale {
                    for dx in 0..scale {
                        px[((y + q) * scale + dy) * side + (x + q) * scale + dx] = dark;
                    }
                }
            }
        }
    }
    if let Some(rng) = noise {
        // Uneven light: a gradient across the image, darker by up to 50
        // levels towards one corner, and faint blotches the size of a module.
        // (Stronger noise defeats the reference decoder's thresholding before
        // it tests anything of ours; real cameras and decoders are tested on
        // the device.)
        let blotch: Vec<i16> = (0..(side / scale + 1).pow(2))
            .map(|_| (rng.next_u32() % 7) as i16 - 3)
            .collect();
        for y in 0..side {
            for x in 0..side {
                let shade = -(((x + y) * 50 / (2 * side)) as i16);
                let b = blotch[(y / scale) * (side / scale + 1) + x / scale];
                let p = &mut px[y * side + x];
                *p = (*p as i16 + shade + b).clamp(0, 255) as u8;
            }
        }
    }
    let mut img = rqrr::PreparedImage::prepare_from_greyscale(side, side, |x, y| px[y * side + x]);
    let grids = img.detect_grids();
    let (_, content) = grids.first()?.decode().ok()?;
    Some(content)
}

/// Send a message over the air gap as animated QR codes, photographed and
/// read back, dropping every frame `drop` says to. Returns the message and
/// how many frames were shown.
fn over_qr(
    m: &Message,
    drop: impl Fn(usize) -> bool,
    light: u8,
    dark: u8,
    noisy: bool,
) -> (Message, usize) {
    let mut sender = QrSender::new(m, transport::FRAGMENT);
    let mut receiver = QrReceiver::new(m.kind());
    let mut noise = noisy.then(|| TestRng::new("camera noise"));
    for shown in 1..=10 * sender.fragments() + 20 {
        let frame = sender.next_frame();
        if drop(shown) {
            continue;
        }
        // A frame the camera cannot read is a dropped frame.
        let Some(read) = photograph(&frame, 3, light, dark, &mut noise) else {
            continue;
        };
        receiver.receive(&read).unwrap();
        if receiver.complete() {
            return (receiver.message().unwrap().unwrap(), shown);
        }
    }
    panic!("never completed");
}

// ---------------------------------------------------------------- identity creation

#[test]
fn identity_creation_with_commitment_export_by_file() {
    let dir = std::env::temp_dir().join("mor-airgap-test-genesis-file");
    std::fs::create_dir_all(&dir).unwrap();
    let mut rng = TestRng::new("genesis by file");
    let mut device = Signer::new(config());
    device.new_seed(SeedModule::Words, 2, &mut rng);
    let path = dir.join("commitment.mor");
    transport::write_file(&path, &device.export_commitment(0, 0)).unwrap();

    // The online device reads the file and builds the genesis.
    let export = transport::read_file(&path, kind::COMMITMENT_EXPORT).unwrap();
    let g = online::genesis(
        identity_spec(),
        &export.encode(),
        &signing("file", 0),
        online::GenesisPlan {
            homes: vec![own_home()],
            ..Default::default()
        },
        &mut rng,
    )
    .unwrap();
    let mut v = mor_core::chain::Verifier::new(identity_spec());
    let id = v.add(g).unwrap();
    assert_eq!(v.resolve(&id).latest().unwrap().0.act, id);
}

#[test]
fn identity_creation_with_commitment_export_by_qr() {
    let mut rng = TestRng::new("genesis by QR");
    let mut device = Signer::new(config());
    device.new_seed(SeedModule::Hex, 2, &mut rng);
    let export = device.export_commitment(0, 0);
    let (read, _) = over_qr(&export, |_| false, 255, 0, false);
    assert_eq!(read, export);
    let g = online::genesis(
        identity_spec(),
        &read.encode(),
        &signing("qr", 0),
        online::GenesisPlan {
            homes: vec![own_home()],
            ..Default::default()
        },
        &mut rng,
    )
    .unwrap();
    let mut v = mor_core::chain::Verifier::new(identity_spec());
    let id = v.add(g).unwrap();
    assert_eq!(v.resolve(&id).latest().unwrap().0.act, id);
}

// ---------------------------------------------------------------- rotation round trips

#[test]
fn rotation_round_trip_by_file_built_entirely_offline() {
    let dir = std::env::temp_dir().join("mor-airgap-test-rotation-file");
    std::fs::create_dir_all(&dir).unwrap();
    let mut o = Owner::new("file rotation", SeedModule::Words, 2);
    let plan = o.plan();
    let pending = o.pending(&plan);
    transport::write_file(&dir.join("pending.mor"), &pending).unwrap();

    // Offline: read the file, review, sign, write the answer.
    let p = transport::read_file(&dir.join("pending.mor"), kind::PENDING_ROTATION).unwrap();
    let signed = o.sign(&p, &Choices::default());
    transport::write_file(&dir.join("signed.mor"), &signed).unwrap();

    // Online: read it back, check it, publish it.
    let back = transport::read_file(&dir.join("signed.mor"), kind::SIGNED_ROTATION).unwrap();
    let a = o.publish(&pending, &back);
    assert_eq!(o.counting(), a.id(), "the rotation counts");
    // The device built the act: outside, locked inside, commitment, signature.
    let r = rotation_of(&a);
    assert_eq!(r.signing_key, plan.signing_key);
    assert_ne!(r.chain_key.commit, [0; 32]);
    assert_eq!(o.post("after the rotation"), Status::Valid);
}

#[test]
fn rotation_round_trip_by_animated_qr_both_variants() {
    for scheme in [2u8, 3] {
        let mut o = Owner::new(&format!("qr rotation {scheme}"), SeedModule::Words, scheme);
        let pending = o.pending(&o.plan());
        let (p, _) = over_qr(&pending, |_| false, 255, 0, false);
        let signed = o.sign(&p, &Choices::default());
        let (back, frames) = over_qr(&signed, |_| false, 255, 0, false);
        assert!(frames >= QrSender::new(&signed, transport::FRAGMENT).fragments());
        let a = o.publish(&pending, &back);
        assert_eq!(o.counting(), a.id());
        assert_eq!(a.signature.scheme, mor_core::act::Scheme::Founding(scheme));
    }
}

#[test]
fn dropped_qr_frames_are_recovered() {
    let mut o = Owner::new("dropped frames", SeedModule::Words, 2);
    let pending = o.pending(&o.plan());
    let signed = o.sign(&pending, &Choices::default());
    let n = QrSender::new(&signed, transport::FRAGMENT).fragments();
    // A third of the frames missed, including some of the first pass.
    let (back, shown) = over_qr(&signed, |i| i % 3 == 0, 255, 0, false);
    assert_eq!(back, signed);
    assert!(
        shown > n,
        "recovery needed frames beyond the first pass ({shown} of {n})"
    );
}

#[test]
fn poor_light_is_simulated_as_low_contrast_and_noise() {
    // Not a camera: a simulation. Grey on grey, with noise, read by an
    // independent decoder. Real cameras and real light are tested on the
    // device (see the README: not run here).
    let o = Owner::new("poor light", SeedModule::Words, 2);
    let pending = o.pending(&o.plan());
    let (p, shown) = over_qr(&pending, |_| false, 140, 90, true);
    assert_eq!(p, pending);
    eprintln!(
        "poor light: {} fragments, complete after {shown} frames",
        QrSender::new(&pending, transport::FRAGMENT).fragments()
    );
}

#[test]
fn frames_are_small_enough_for_older_cameras() {
    let mut o = Owner::new("frame size", SeedModule::Words, 3);
    let pending = o.pending(&o.plan());
    let signed = o.sign(&pending, &Choices::default());
    let mut s = QrSender::new(&signed, transport::FRAGMENT);
    for _ in 0..5 {
        let code = transport::qr_code(&s.next_frame());
        match code.version() {
            qrcode::Version::Normal(v) => assert!(v <= 11, "QR version {v}"),
            _ => panic!("micro QR"),
        }
    }
}

#[test]
fn a_retried_rotation_is_re_exported_identically() {
    let mut o = Owner::new("retry", SeedModule::Words, 2);
    let pending = o.pending(&o.plan());
    let first = o.sign(&pending, &Choices::default());
    // The online device lost the answer and asks again, even with other choices.
    let review = o
        .device
        .review(
            &pending.encode(),
            &Choices {
                clean_device: true,
                ..Default::default()
            },
            &mut o.rng,
        )
        .unwrap();
    assert_eq!(review.standing, Standing::Repeat);
    assert!(review.summary.says("ALREADY SIGNED"));
    let again = Message::SignedRotation(o.device.sign(common::confirmed(review), false, &mut o.rng).unwrap().message);
    assert_eq!(again, first);
    o.publish(&pending, &again);
}

#[test]
fn clean_device_mode_loads_an_offline_signing_key_onto_a_fresh_device() {
    let mut o = Owner::new("clean device", SeedModule::Words, 2);
    let plan = o.plan();
    let pending = o.pending(&plan);
    let review = o
        .device
        .review(
            &pending.encode(),
            &Choices {
                clean_device: true,
                ..Default::default()
            },
            &mut o.rng,
        )
        .unwrap();
    assert!(review.summary.warns("CLEAN-DEVICE MODE"));
    let s = o.device.sign(common::confirmed(review), false, &mut o.rng).unwrap();
    let secret = s
        .message
        .signing_secret
        .expect("the private part travels with the rotation");
    let signed = Message::SignedRotation(s.message);
    let acc = online::accept(&identity_spec(), &pending.encode(), &signed.encode()).unwrap();
    let fresh = acc.signing_key.clone().unwrap();
    assert_ne!(
        acc.rotation.signing_key, plan.signing_key,
        "not the online device's key"
    );
    assert_eq!(fresh.public().to_vec(), acc.rotation.signing_key.clone().unwrap().key);
    assert_eq!(
        mor_core::sig::SchnorrKey::from_secret(&secret)
            .unwrap()
            .public(),
        fresh.public()
    );
    // The fresh everyday device signs with it, and its acts are valid.
    o.publish(&pending, &signed);
    assert_eq!(o.post("from the clean device"), Status::Valid);
}

#[test]
fn several_rotations_then_a_fresh_seed_under_another_module() {
    let mut o = Owner::new("fresh seed", SeedModule::Words, 2);
    o.rotate();
    o.rotate();
    // Every rotation draws a fresh seed; this one under the other seed
    // Module and the other variant.
    let pending = o.pending(&o.plan());
    let mut review = o
        .device
        .review(
            &pending.encode(),
            &Choices {
                seed_module: Some(SeedModule::Hex),
                next_scheme: Some(3),
                ..Default::default()
            },
            &mut o.rng,
        )
        .unwrap();
    assert!(review.summary.warns("FRESH SEED (hex Module)"));
    assert!(review.summary.warns("Back up this chain-key seed now"));
    let new_seed = review.new_seed.clone().unwrap();
    // Hex: three groups of four characters of eighteen are asked back.
    assert!(review.asked().unwrap().iter().all(|&i| (1..=18).contains(&i)));
    common::confirm(&mut review);
    let s = o.device.sign(review, false, &mut o.rng).unwrap();
    let signed = Message::SignedRotation(s.message);
    let a = o.publish(&pending, &signed);
    let r = rotation_of(&a);
    assert_eq!(r.chain_key.scheme, sig::SLH_128F);
    assert_eq!(r.chain_key.commit, new_seed.key(3, 3).commitment());
    // The next rotation uses the fresh seed's key.
    let a = o.rotate();
    assert_eq!(a.signature.scheme, sig::SLH_128F);
    assert_eq!(o.counting(), a.id());
    assert_eq!(o.post("still me"), Status::Valid);
}

/// Draft 6, rule 3.3 and section 7: a fresh seed by default, its first key at
/// the rotation's index; its backup shown, part of it asked back, a wrong
/// answer refused, and nothing signed until it matches.
#[test]
fn every_rotation_draws_a_fresh_seed_confirmed_before_signing() {
    for module in SeedModule::ALL {
        let mut o = Owner::new(&format!("draft 6 {}", module.name()), module, 2);
        let pending = o.pending(&o.plan());
        let seeds_before = o.device.seeds.len();
        let review = o.device.review(&pending.encode(), &Choices::default(), &mut o.rng).unwrap();
        let fresh = review.new_seed.clone().expect("a fresh seed, by default");
        assert_eq!(fresh.module, module, "the Module of the seed that signs, unless chosen");
        assert_ne!(fresh, o.device.seeds[0].seed, "never the current seed");
        assert!(review.summary.warns("its backup is confirmed before signing"));
        let asked = review.asked().expect("three parts asked back");
        assert!(asked[0] < asked[1] && asked[1] < asked[2]);
        // Not confirmed: nothing signed.
        assert!(matches!(o.device.sign(review, false, &mut o.rng), Err(Refusal::BackupNotConfirmed)));
        assert_eq!(o.device.seeds.len(), seeds_before, "the fresh seed is not kept");
        assert!(o.device.memory.is_empty(), "nothing signed");
        // Again: a wrong answer refused, then the right one.
        let mut review = o.device.review(&pending.encode(), &Choices::default(), &mut o.rng).unwrap();
        let fresh = review.new_seed.clone().unwrap();
        let written = fresh.backup();
        let parts: Vec<&str> = written.split_whitespace().collect();
        let at = review.asked().unwrap();
        assert!(matches!(review.confirm_backup(&["wrong", parts[at[1] - 1], parts[at[2] - 1]]), Err(Refusal::BackupMismatch)));
        assert!(!review.backed_up());
        let typed: Vec<String> = at.iter().map(|&i| parts[i - 1].to_ascii_uppercase()).collect();
        review.confirm_backup(&typed.iter().map(String::as_str).collect::<Vec<_>>()).unwrap();
        let s = o.device.sign(review, false, &mut o.rng).unwrap();
        let signed = Message::SignedRotation(s.message);
        let a = o.publish(&pending, &signed);
        // Its key at the rotation's index (position 1), never its key 0.
        assert_eq!(rotation_of(&a).chain_key.commit, fresh.key(2, 1).commitment());
        assert_ne!(rotation_of(&a).chain_key.commit, fresh.key(2, 0).commitment());
        assert_eq!(o.counting(), a.id());
    }
}

/// Draft 6: a review abandoned before its backup is confirmed signs nothing;
/// its seed is dropped (overwritten), and the next review draws another.
#[test]
fn an_abandoned_review_signs_nothing_and_the_next_draws_another_seed() {
    let mut o = Owner::new("abandoned", SeedModule::Words, 2);
    let pending = o.pending(&o.plan());
    let first = o.device.review(&pending.encode(), &Choices::default(), &mut o.rng).unwrap();
    let abandoned = first.new_seed.clone().unwrap();
    drop(first);
    assert_eq!(o.device.seeds.len(), 1);
    assert!(o.device.memory.is_empty());
    let second = o.device.review(&pending.encode(), &Choices::default(), &mut o.rng).unwrap();
    assert_ne!(second.new_seed.clone().unwrap(), abandoned, "a backup written for a rotation never signed is worthless");
    drop(second);
    // The same rotation then signs, from a third seed.
    let a = o.rotate();
    assert_eq!(o.counting(), a.id());
    assert_ne!(rotation_of(&a).chain_key.commit, abandoned.key(2, 1).commitment());
}

/// Draft 6: a request to derive the next key from the current seed (draft 5's
/// choice) refused, whoever asks.
#[test]
fn a_request_for_the_current_seed_is_refused() {
    let mut o = Owner::new("current seed", SeedModule::Hex, 3);
    let pending = o.pending(&o.plan());
    let r = o.device.review(&pending.encode(), &Choices { current_seed: true, ..Default::default() }, &mut o.rng);
    assert!(matches!(r, Err(Refusal::CurrentSeed)));
    assert!(o.device.memory.is_empty());
    assert!(Refusal::CurrentSeed.to_string().contains("never derived from the current seed"));
}

/// Draft 6, rules 3.3 and 3.8: the next rotation from the new backup; the
/// earlier backup restores no key that matches, said in plain words.
#[test]
fn the_next_rotation_from_the_new_backup_and_the_earlier_one_spent() {
    for module in SeedModule::ALL {
        let mut o = Owner::new(&format!("spent {}", module.name()), module, 2);
        let old = o.device.seeds[0].seed.backup();
        o.rotate();
        let new = o.device.seeds.last().unwrap().seed.backup();
        assert_ne!(old, new);
        // The earlier backup, restored on a new device: no key matches.
        let mut spent = Signer::new(config());
        spent.add_seed(Seed::restore(module, &old).unwrap(), 2, 0);
        let pending = o.pending(&o.plan());
        let refused = spent.review(&pending.encode(), &Choices::default(), &mut o.rng);
        match refused {
            Err(e @ Refusal::NoMatchingKey) => assert!(e.to_string().contains("it may be an earlier, spent one"), "{e}"),
            Err(e) => panic!("{e}"),
            Ok(_) => panic!("signed from a spent backup"),
        }
        // The new backup, restored: it makes the next rotation.
        let mut restored = Signer::new(config());
        restored.add_seed(Seed::restore(module, &new).unwrap(), 2, 1);
        o.device = restored;
        let a = o.rotate();
        assert_eq!(o.counting(), a.id());
    }
}

#[test]
fn a_device_restored_from_its_backup_finds_its_key_and_rotates() {
    for module in SeedModule::ALL {
        let mut o = Owner::new(&format!("restore {}", module.name()), module, 2);
        o.rotate();
        // The seed the last rotation drew (a fresh one, rule 3.3).
        let backup = o.device.seeds.last().unwrap().seed.backup();
        // The device is lost; a new one is restored from the written backup.
        let mut restored = Signer::new(config());
        restored.add_seed(Seed::restore(module, &backup).unwrap(), 2, 0);
        o.device = restored;
        let a = o.rotate();
        assert_eq!(o.counting(), a.id());
    }
}

#[test]
fn the_devices_memory_survives_a_restart() {
    let mut o = Owner::new("restart", SeedModule::Hex, 2);
    let pending = o.pending(&o.plan());
    let first = o.sign(&pending, &Choices::default());
    let stored = o.device.to_bytes();
    let back = Signer::from_bytes(config(), &stored).unwrap();
    assert_eq!(back, o.device);
    o.device = back;
    // Still the same answer for the same rotation, and a refusal for another.
    assert_eq!(o.sign(&pending, &Choices::default()), first);
    let mut other = o.plan();
    other.homes = Some(vec![home("elsewhere")]);
    let p2 = o.pending(&other);
    assert!(o
        .device
        .review(&p2.encode(), &Choices::default(), &mut o.rng)
        .is_err());
}

// ---------------------------------------------------------------- the seed Modules

#[test]
fn both_seed_modules_write_and_restore_their_backups() {
    let e = [0x5au8; 32];
    for module in SeedModule::ALL {
        let s = Seed::new(module, e);
        let b = s.backup();
        assert_eq!(Seed::restore(module, &b).unwrap(), s);
        assert_eq!(
            Seed::restore(module, &b.to_uppercase()).unwrap(),
            s,
            "case does not matter"
        );
    }
    assert_eq!(
        Seed::new(SeedModule::Words, e).backup().split(' ').count(),
        24
    );
    assert_eq!(
        Seed::new(SeedModule::Hex, e)
            .backup()
            .replace(' ', "")
            .len(),
        72
    );
}

#[test]
fn a_miswritten_backup_is_caught_by_its_checksum() {
    let w = Seed::new(SeedModule::Words, [7; 32]).backup();
    let mut words: Vec<&str> = w.split(' ').collect();
    words[3] = if words[3] == "abandon" {
        "ability"
    } else {
        "abandon"
    };
    assert!(Seed::restore(SeedModule::Words, &words.join(" ")).is_err());
    let h = Seed::new(SeedModule::Hex, [7; 32]).backup();
    let bad = h.replacen('7', "8", 1);
    assert!(Seed::restore(SeedModule::Hex, &bad).is_err());
    assert!(Seed::restore(SeedModule::Hex, &h[..40]).is_err());
}

#[test]
fn the_two_seed_modules_give_unrelated_keys_from_the_same_bits() {
    let e = [9u8; 32];
    let a = Seed::new(SeedModule::Words, e).key(2, 0);
    let b = Seed::new(SeedModule::Hex, e).key(2, 0);
    assert_ne!(a.public(), b.public());
    // Keys differ by index and by scheme too.
    let w = Seed::new(SeedModule::Words, e);
    assert_ne!(w.key(2, 0).public(), w.key(2, 1).public());
    assert_ne!(w.key(2, 0).public(), w.key(3, 0).public());
}

#[test]
fn seed_derivation_agrees_with_the_second_slh_dsa_implementation() {
    // The derived key-generation seeds give the same key pair in both
    // implementations, and a signature by one verifies in the other.
    use mor_core::hash::tagged_hash_parts;
    for module in SeedModule::ALL {
        let s = Seed::new(module, [3u8; 32]);
        for (scheme, index) in [(2u8, 0u64), (2, 5), (3, 1)] {
            let tag = match module {
                SeedModule::Words => mor_airgap::seed::tag::WORDS_KEY,
                SeedModule::Hex => mor_airgap::seed::tag::HEX_KEY,
            };
            let i = index.to_be_bytes();
            let a = tagged_hash_parts(tag, &[&s.entropy, &[scheme], &i, &[0]]);
            let b = tagged_hash_parts(tag, &[&s.entropy, &[scheme], &i, &[1]]);
            let pk: Vec<u8> = match scheme {
                2 => {
                    let k = slh_dsa::SigningKey::<slh_dsa::Sha2_128s>::slh_keygen_internal(
                        &a[..16],
                        &a[16..],
                        &b[..16],
                    );
                    let v: &slh_dsa::VerifyingKey<slh_dsa::Sha2_128s> = k.as_ref();
                    v.to_bytes().to_vec()
                }
                _ => {
                    let k = slh_dsa::SigningKey::<slh_dsa::Sha2_128f>::slh_keygen_internal(
                        &a[..16],
                        &a[16..],
                        &b[..16],
                    );
                    let v: &slh_dsa::VerifyingKey<slh_dsa::Sha2_128f> = k.as_ref();
                    v.to_bytes().to_vec()
                }
            };
            let k = s.key(scheme, index);
            assert_eq!(k.public(), pk);
            let sig = k.sign(&[1; 32], None);
            assert!(second_opinion(&sig, &[1; 32]));
        }
    }
}

#[test]
fn the_published_seed_vectors_hold_in_both_slh_dsa_implementations() {
    let v: serde_json::Value = serde_json::from_str(include_str!("../vectors/seeds.json")).unwrap();
    let vs = v["vectors"].as_array().unwrap();
    assert_eq!(vs.len(), 6);
    for x in vs {
        let module = SeedModule::from_name(x["module"].as_str().unwrap()).unwrap();
        let e: [u8; 32] = hex::decode(x["seed"].as_str().unwrap())
            .unwrap()
            .try_into()
            .unwrap();
        let s = Seed::restore(module, x["backup"].as_str().unwrap()).unwrap();
        assert_eq!(s, Seed::new(module, e));
        for k in x["keys"].as_array().unwrap() {
            let scheme = k["scheme"].as_u64().unwrap() as u8;
            let index = k["index"].as_u64().unwrap();
            let h = |f: &str| hex::decode(k[f].as_str().unwrap()).unwrap();
            let key = s.key(scheme, index);
            assert_eq!(key.public(), h("public_key"));
            assert_eq!(key.commitment().to_vec(), h("commitment"));
            let theirs: Vec<u8> = match scheme {
                2 => {
                    let k = slh_dsa::SigningKey::<slh_dsa::Sha2_128s>::slh_keygen_internal(
                        &h("sk_seed"),
                        &h("sk_prf"),
                        &h("pk_seed"),
                    );
                    let v: &slh_dsa::VerifyingKey<slh_dsa::Sha2_128s> = k.as_ref();
                    v.to_bytes().to_vec()
                }
                _ => {
                    let k = slh_dsa::SigningKey::<slh_dsa::Sha2_128f>::slh_keygen_internal(
                        &h("sk_seed"),
                        &h("sk_prf"),
                        &h("pk_seed"),
                    );
                    let v: &slh_dsa::VerifyingKey<slh_dsa::Sha2_128f> = k.as_ref();
                    v.to_bytes().to_vec()
                }
            };
            assert_eq!(theirs, h("public_key"));
        }
    }
}
