//! The plain summary the device builds from the exact bytes it will sign
//! (Module, rule 3.1). Nothing the online device says about the rotation is
//! used here; its context, if any, is shown apart and marked as unchecked.

use crate::seed::hexs;
use mor_core::act::Scheme;
use mor_core::cbor::Value;
use mor_core::hash::{tagged_hash_parts, Hash};
use mor_core::identity::{HomeRule, Rotation, SigningKey};
use mor_core::sig::scheme_bytes;
use std::fmt;

/// One line of the summary. Consequential lines are prominent: the device
/// shows them first and marked.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Line {
    pub prominent: bool,
    pub text: String,
}

/// What the device shows before signing.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct Summary {
    pub lines: Vec<Line>,
    /// What this device did not, and cannot, check (rule 3.2).
    pub not_checked: Vec<String>,
    /// The online device's context, shown as unchecked.
    pub context: Vec<String>,
}

impl Summary {
    pub(crate) fn plain(&mut self, t: impl Into<String>) {
        self.lines.push(Line {
            prominent: false,
            text: t.into(),
        });
    }

    pub(crate) fn warn(&mut self, t: impl Into<String>) {
        self.lines.push(Line {
            prominent: true,
            text: t.into(),
        });
    }

    /// Whether any line contains `s` (for tests and scripts).
    pub fn says(&self, s: &str) -> bool {
        self.lines.iter().any(|l| l.text.contains(s))
    }

    /// Whether a prominent line contains `s`.
    pub fn warns(&self, s: &str) -> bool {
        self.lines.iter().any(|l| l.prominent && l.text.contains(s))
    }
}

impl fmt::Display for Summary {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let prominent: Vec<_> = self.lines.iter().filter(|l| l.prominent).collect();
        if !prominent.is_empty() {
            writeln!(f, "!! CONSEQUENTIAL — READ BEFORE SIGNING")?;
            for l in prominent {
                writeln!(f, "!! {}", l.text)?;
            }
            writeln!(f)?;
        }
        for l in self.lines.iter().filter(|l| !l.prominent) {
            writeln!(f, "   {}", l.text)?;
        }
        if !self.not_checked.is_empty() {
            writeln!(f)?;
            writeln!(f, "This device did NOT check:")?;
            for t in &self.not_checked {
                writeln!(f, " - {t}")?;
            }
        }
        if !self.context.is_empty() {
            writeln!(f)?;
            writeln!(
                f,
                "Context from the online device (NOT checked, never trusted):"
            )?;
            for t in &self.context {
                writeln!(f, " | {t}")?;
            }
        }
        Ok(())
    }
}

/// A key's fingerprint, as both screens show it: the first 16 bytes of
/// `tagged_hash("MOR/module/airgap/fingerprint", scheme ‖ key)`, in eight
/// groups of four hexadecimal characters.
pub fn fingerprint(scheme: &Scheme, key: &[u8]) -> String {
    let h = tagged_hash_parts(crate::tag::FINGERPRINT, &[&scheme_bytes(scheme), key]);
    hexs(&h[..16])
        .as_bytes()
        .chunks(4)
        .map(|c| std::str::from_utf8(c).unwrap())
        .collect::<Vec<_>>()
        .join(" ")
}

pub fn scheme_name(s: &Scheme) -> String {
    match s {
        Scheme::Founding(1) => "Schnorr over secp256k1 (founding scheme 1)".into(),
        Scheme::Founding(2) => "SLH-DSA-SHA2-128s (founding scheme 2)".into(),
        Scheme::Founding(3) => "SLH-DSA-SHA2-128f (founding scheme 3)".into(),
        Scheme::Founding(n) => format!("founding scheme {n}"),
        Scheme::Spec(h) => format!("the scheme specified by {}", hexs(h)),
    }
}

fn key_line(k: &SigningKey) -> String {
    format!(
        "New signing key: fingerprint {} — {}",
        fingerprint(&k.scheme, &k.key),
        scheme_name(&k.scheme)
    )
}

fn operator(o: &Option<Hash>) -> String {
    match o {
        None => "self-hosted (this identity)".into(),
        Some(h) => format!("operator {}", hexs(h)),
    }
}

/// Everything the device knows about the chain before this rotation, from
/// the previous act alone.
pub struct Before<'a> {
    /// The previous act's vault declaration, if it made one: `None` if it
    /// said nothing about the vault, `Some(None)` if it removed it.
    pub vault: Option<Option<&'a Value>>,
}

/// Build the summary lines for a rotation payload.
pub fn describe(
    s: &mut Summary,
    identity: &Hash,
    r: &Rotation,
    before: &Before,
    finance: Option<&Hash>,
    escape_announced: bool,
) {
    s.plain(format!("Identity: {}", hexs(identity)));
    s.plain(format!(
        "Rotation at position {}, after the act {}",
        r.position,
        hexs(&r.prev)
    ));
    s.warn(key_line(&r.signing_key));

    if r.homeless {
        s.warn(
            "HOMELESS rotation: it claims the old homes are gone and counts without their receipts",
        );
    }
    if escape_announced {
        s.warn("ESCAPE announced: the online device says it has prepared an escape endorsement, signed with your current signing key");
    }
    if r.closure {
        s.warn("CLOSURE: if you operate a home, it stops serving every identity, for good");
    }
    if let Some(hs) = &r.homes {
        s.warn(format!("Homes change to {} home(s):", hs.len()));
        for (i, h) in hs.iter().enumerate() {
            s.warn(format!(
                "  home {i}: {} at {}",
                operator(&h.operator),
                h.hint
            ));
        }
    }
    match &r.rule {
        None => {}
        Some(None) => s.warn("Home rule: back to the default (majority of operators, or the self-hosted home as authoritative)"),
        Some(Some(HomeRule::Authoritative(i))) => {
            s.warn(format!("Home rule: home {i} alone decides (authoritative)"))
        }
        Some(Some(HomeRule::Threshold(k))) => {
            s.warn(format!("Home rule: homes of {k} distinct operators must hold a rotation"))
        }
    }
    match &r.audit {
        None => {}
        Some(None) => {
            s.warn("Audit requirement REMOVED: receipts no longer need cosigned log summaries")
        }
        Some(Some(a)) => {
            s.warn(format!(
                "Audit requirement: {} cosignature(s) from these {} auditor(s):",
                a.threshold,
                a.auditors.len()
            ));
            for x in &a.auditors {
                s.warn(format!("  auditor {}", hexs(x)));
            }
        }
    }
    match &r.successor {
        None => {}
        Some(None) => s.warn("Succession ENDED: no identity succeeds this one"),
        Some(Some(x)) if x.protocol == "mor" => s.warn(format!(
            "SUCCESSION declared: the MOR identity {} succeeds this one",
            hexs(&x.identifier)
        )),
        Some(Some(x)) => s.warn(format!(
            "SUCCESSION declared: {} on the protocol \"{}\" succeeds this one",
            hexs(&x.identifier),
            x.protocol
        )),
    }
    for d in r.declarations.iter().flatten() {
        if Some(&d.spec) == finance && d.kind == 0 {
            vault(s, d.value.as_ref(), before);
        } else {
            s.warn(format!(
                "A declaration this device cannot read: specification {}, kind {}, value {}",
                hexs(&d.spec),
                d.kind,
                d.value
                    .as_ref()
                    .map(diag)
                    .unwrap_or_else(|| "null (removes it)".into())
            ));
        }
    }

    if r.kept.is_empty() {
        s.warn("KEEPS NO SEQUENCE: every act signed with the old key becomes void, unless someone relied on it");
    } else {
        s.plain(format!("Keeps {} sequence(s):", r.kept.len()));
        for t in &r.kept {
            s.plain(format!(
                "  up to position {} (act {})",
                t.position,
                hexs(&t.act)
            ));
        }
    }
    if let Some(d) = &r.disowned {
        s.warn(format!(
            "DISOWNS {} act(s). Disowning voids an act unless someone relied on it (acknowledged it, or a keeper recorded it): then it stays, shown as disputed.",
            d.len()
        ));
        for x in d {
            s.warn(format!("  disowned {}", hexs(x)));
        }
    }
}

fn vault(s: &mut Summary, value: Option<&Value>, before: &Before) {
    let Some(v) = value else {
        s.warn("VAULT REMOVED: every payment goes to the flow pointer, which the everyday key can change");
        return;
    };
    let Some(entries) = vault_entries(v) else {
        s.warn(format!("A vault this device cannot read: {}", diag(v)));
        return;
    };
    s.warn(format!("VAULT set to {} entr(y/ies):", entries.len()));
    for e in &entries {
        let limit = if e.limit == 0 {
            "flow off: every payment in this unit goes to the vault".to_string()
        } else {
            format!(
                "payments up to {} may go to the flow; larger ones go to the vault",
                e.limit
            )
        };
        s.warn(format!(
            "  unit {}, rail {}: {}",
            hexs(&e.unit),
            hexs(&e.rail),
            limit
        ));
    }
    match before.vault {
        Some(Some(old)) => {
            if let Some(old) = vault_entries(old) {
                let mut gone: Vec<Hash> = old
                    .iter()
                    .map(|e| e.unit)
                    .filter(|u| !entries.iter().any(|e| &e.unit == u))
                    .collect();
                gone.dedup();
                for u in gone {
                    s.warn(format!(
                        "  unit {} REMOVED: payments in it become undeliverable until a later rotation (fail closed)",
                        hexs(&u)
                    ));
                }
            }
        }
        _ => s.warn("  Any unit not listed: payments in it are undeliverable until a later rotation (fail closed)"),
    }
}

struct VaultEntry {
    unit: Hash,
    rail: Hash,
    limit: u64,
}

/// `vault-entry = [ unit: hash, rail-module: hash, source: bstr, limit: uint ]` (Finance).
fn vault_entries(v: &Value) -> Option<Vec<VaultEntry>> {
    let Value::Array(es) = v else { return None };
    if es.is_empty() {
        return None;
    }
    es.iter()
        .map(|e| match e {
            Value::Array(a) if a.len() == 4 => match (&a[0], &a[1], &a[2], &a[3]) {
                (Value::Bytes(u), Value::Bytes(r), Value::Bytes(_), Value::Uint(l)) => {
                    Some(VaultEntry {
                        unit: u.as_slice().try_into().ok()?,
                        rail: r.as_slice().try_into().ok()?,
                        limit: *l,
                    })
                }
                _ => None,
            },
            _ => None,
        })
        .collect()
}

/// A short diagnostic rendering of a CBOR value (RFC 8949, section 8), for
/// values the device cannot interpret.
pub fn diag(v: &Value) -> String {
    match v {
        Value::Uint(n) => n.to_string(),
        Value::Nint(n) => format!("-{}", *n as u128 + 1),
        Value::Bytes(b) => format!("h'{}'", hexs(b)),
        Value::Text(t) => format!("{t:?}"),
        Value::Array(a) => format!("[{}]", a.iter().map(diag).collect::<Vec<_>>().join(", ")),
        Value::Map(m) => format!(
            "{{{}}}",
            m.iter()
                .map(|(k, v)| format!("{}: {}", diag(k), diag(v)))
                .collect::<Vec<_>>()
                .join(", ")
        ),
        Value::Tag(t, x) => format!("{t}({})", diag(x)),
        Value::Bool(b) => b.to_string(),
        Value::Null => "null".into(),
        Value::Undefined => "undefined".into(),
        Value::Simple(n) => format!("simple({n})"),
        Value::Float(bits) => format!("{}", f64::from_bits(*bits)),
    }
}
