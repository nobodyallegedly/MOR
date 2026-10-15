//! The online device's side of the air-gapped chain key Module, by file, for
//! the rehearsal of roadmap step 17 (`scripts/rehearse-step-17.sh`).
//!
//! The genesis client cannot yet make a genesis from the Module's commitment
//! export (roadmap step 16b, `clients/genesis/README.md`): this stands in for
//! that missing piece, calling the Module's own `online` functions, so the
//! chain key never leaves the signer (`mor-signer`). The client builds an
//! ordinary act as a template (its homes, rule, kept lines and new signing
//! key, under a throwaway chain key); this takes the declared fields from it
//! and nothing else.
//!
//!   online_side genesis TEMPLATE.act EXPORT.mor SIGNING-SECRET-HEX OUT.act
//!   online_side pending PREVIOUS.act TEMPLATE.act OUT.mor
//!   online_side accept PENDING.mor SIGNED.mor OUT.act
//!
//! TEST IDENTITIES ONLY, like everything before step 17.

use mor_airgap::online::{self, GenesisPlan};
use mor_core::act::Act;
use mor_core::identity::Payload;
use mor_core::sig::SchnorrKey;
use rand_core::OsRng;
use std::process::ExitCode;

fn fail(s: impl std::fmt::Display) -> ! {
    eprintln!("online_side: {s}");
    std::process::exit(1)
}

fn read(p: &str) -> Vec<u8> {
    std::fs::read(p).unwrap_or_else(|e| fail(format!("{p}: {e}")))
}

fn write(p: &str, b: &[u8]) {
    std::fs::write(p, b).unwrap_or_else(|e| fail(format!("{p}: {e}")))
}

/// A public identity-chain act, opened: its spec and payload.
fn opened(p: &str) -> (Act, mor_core::act::Inside, Payload) {
    let a = Act::decode(&read(p)).unwrap_or_else(|e| fail(format!("{p}: {e:?}")));
    let inside = a.open(None).unwrap_or_else(|e| fail(format!("{p}: {e:?}")));
    let payload = Payload::decode(inside.type_, &inside.payload)
        .unwrap_or_else(|e| fail(format!("{p}: {e:?}")));
    (a, inside, payload)
}

fn main() -> ExitCode {
    let args: Vec<String> = std::env::args().skip(1).collect();
    match args.iter().map(String::as_str).collect::<Vec<_>>().as_slice() {
        ["genesis", template, export, secret, out] => {
            let (_, inside, payload) = opened(template);
            let Payload::Genesis(g) = payload else {
                fail("the template is not a genesis")
            };
            let s: [u8; 32] = hex::decode(secret)
                .ok()
                .and_then(|b| b.try_into().ok())
                .unwrap_or_else(|| fail("the signing secret is 32 bytes, hex"));
            let key = SchnorrKey::from_secret(&s).unwrap_or_else(|| fail("not a signing key"));
            let plan = GenesisPlan {
                homes: g.homes,
                rule: g.rule,
                declarations: g.declarations,
                audit: g.audit,
            };
            let act = online::genesis(inside.spec, &read(export), &key, plan, &mut OsRng)
                .unwrap_or_else(|e| fail(e));
            write(out, &act.encode());
            println!("{}", hex::encode(act.id()));
        }
        ["pending", previous, template, out] => {
            let prev = Act::decode(&read(previous)).unwrap_or_else(|e| fail(format!("{e:?}")));
            let (_, inside, payload) = opened(template);
            let Payload::Rotation(r) = payload else {
                fail("the template is not a rotation")
            };
            if r.prev != prev.id() {
                fail("the template does not follow the previous act");
            }
            let m = online::pending(&inside.spec, &prev, &r, None, false);
            write(out, &m.encode());
        }
        ["accept", pending, signed, out] => {
            let p = read(pending);
            let Ok(mor_airgap::msg::Message::PendingRotation(pr)) = mor_airgap::msg::Message::decode(&p)
            else {
                fail("not a pending rotation")
            };
            let spec: [u8; 32] = match mor_core::cbor::decode(&pr.inside) {
                Ok(mor_core::cbor::Value::Map(m)) => m
                    .iter()
                    .find(|(k, _)| k == &mor_core::cbor::Value::Uint(0))
                    .and_then(|(_, v)| match v {
                        mor_core::cbor::Value::Bytes(b) => b.clone().try_into().ok(),
                        _ => None,
                    })
                    .unwrap_or_else(|| fail("the pending inside names no spec")),
                _ => fail("the pending inside"),
            };
            let a = online::accept(&spec, &p, &read(signed)).unwrap_or_else(|e| fail(e));
            write(out, &a.act.encode());
            println!("{}", hex::encode(a.act.id()));
        }
        _ => fail("genesis TEMPLATE EXPORT SECRET OUT | pending PREVIOUS TEMPLATE OUT | accept PENDING SIGNED OUT"),
    }
    ExitCode::SUCCESS
}
