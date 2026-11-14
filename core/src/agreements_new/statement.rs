//! Statement (type 1 under draft 24's spec hash): draft 24, section 3.2;
//! `encoding-1.md`, "Statement".
//!
//! ```cddl
//! statement = {
//!   0 => hash,               ; agreement: the root
//!   1 => hash,               ; terms: the Terms act it is made within
//!   2 => kind,               ; 0 assent, 1 counter_signature, 2 contest, or a K7 socket
//!   ? 3 => any,              ; content: as the kind requires; never on 0 or 1
//!   ? 4 => who,              ; for: exactly when 5 is present
//!   ? 5 => hash,             ; under: exactly when 4 is present
//!   6 => [] / [hash],        ; previous
//!   ? 7 => [+ hash],         ; answers
//!   ? 8 => [+ any],          ; relies_on: an entry that is not a fingerprint is left unread
//!   ? 9 => hash,             ; settlement: the Money act it is tied to
//!   ? 10 => [+ hash],        ; resolves
//!   ? 11 => hash,            ; continues: one of 10; only beside 10
//! }
//! kind = 0 / 1 / 2 / [ cmip: hash, params: any ]
//! who = [0, hash] / [2, hash]
//! ```

use super::{
    check_set, closed, get, hash_of, hashes_value, hv, list_of, previous_of, previous_value, put, rej, resolves_of, sorted, Finding, Named,
    Who, R,
};
use crate::cbor::Value;
use crate::hash::Hash;

/// A Statement's kind (E15).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Kind {
    Assent,
    CounterSignature,
    Contest,
    /// A kind defined by a cMIP (task K7): its spec hash, with its parameters.
    Defined { cmip: Hash, params: Value },
}

impl Kind {
    fn to_value(&self) -> Value {
        match self {
            Kind::Assent => Value::Uint(0),
            Kind::CounterSignature => Value::Uint(1),
            Kind::Contest => Value::Uint(2),
            Kind::Defined { cmip, params } => Value::Array(vec![hv(cmip), params.clone()]),
        }
    }

    fn from_value(v: &Value) -> R<Kind> {
        Ok(match v {
            Value::Uint(0) => Kind::Assent,
            Value::Uint(1) => Kind::CounterSignature,
            Value::Uint(2) => Kind::Contest,
            Value::Array(a) if a.len() == 2 => match &a[0] {
                Value::Bytes(b) if b.len() == 32 => Kind::Defined { cmip: b.as_slice().try_into().unwrap(), params: a[1].clone() },
                _ => return rej("E15", "a kind defined by a cMIP names it by fingerprint: [spec hash, params]"),
            },
            _ => return rej("E15", "a Statement's kind is 0 (assent), 1 (counter_signature), 2 (contest), or a K7 socket [spec hash, params]"),
        })
    }

    /// The fingerprint a power's kind matches: the K7 cMIP's spec hash.
    pub fn defined(&self) -> Option<Hash> {
        match self {
            Kind::Defined { cmip, .. } => Some(*cmip),
            _ => None,
        }
    }
}

/// A Statement's payload. `None` is a field left out.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Statement {
    pub agreement: Hash,
    pub terms: Hash,
    pub kind: Kind,
    pub content: Option<Value>,
    pub for_: Option<Who>,
    pub under: Option<Hash>,
    /// `previous`, always written: `None` is `[]`.
    pub previous: Option<Hash>,
    pub answers: Option<Vec<Hash>>,
    pub relies_on: Option<Vec<Named>>,
    pub settlement: Option<Hash>,
    pub resolves: Option<Vec<Hash>>,
    pub continues: Option<Hash>,
}

/// The payload keys (encoding-1, "Statement").
pub mod key {
    pub const AGREEMENT: u64 = 0;
    pub const TERMS: u64 = 1;
    pub const KIND: u64 = 2;
    pub const CONTENT: u64 = 3;
    pub const FOR: u64 = 4;
    pub const UNDER: u64 = 5;
    pub const PREVIOUS: u64 = 6;
    pub const ANSWERS: u64 = 7;
    pub const RELIES_ON: u64 = 8;
    pub const SETTLEMENT: u64 = 9;
    pub const RESOLVES: u64 = 10;
    pub const CONTINUES: u64 = 11;
    pub const COUNT: u64 = 12;
}

/// The keys whose values two acts must share, byte for byte, to be one
/// signing of an agreement (G1.2; encoding-1, E24): all but `previous`,
/// `answers` and `relies_on`.
pub const ONE_SIGNING: [u64; 9] = [
    key::AGREEMENT,
    key::TERMS,
    key::KIND,
    key::CONTENT,
    key::FOR,
    key::UNDER,
    key::SETTLEMENT,
    key::RESOLVES,
    key::CONTINUES,
];

impl Statement {
    /// A Statement with only its required fields.
    pub fn new(agreement: Hash, terms: Hash, kind: Kind, previous: Option<Hash>) -> Statement {
        Statement {
            agreement,
            terms,
            kind,
            content: None,
            for_: None,
            under: None,
            previous,
            answers: None,
            relies_on: None,
            settlement: None,
            resolves: None,
            continues: None,
        }
    }

    /// The payload, in its one byte form; refused where it would be rejected.
    pub fn to_payload(&self) -> R<Vec<(Value, Value)>> {
        let p = self.payload_unchecked();
        Statement::from_payload(&p)?;
        Ok(p)
    }

    /// The payload as written, unchecked: for tests and vectors only.
    pub fn payload_unchecked(&self) -> Vec<(Value, Value)> {
        use key::*;
        let mut m = Vec::new();
        put(&mut m, AGREEMENT, hv(&self.agreement));
        put(&mut m, TERMS, hv(&self.terms));
        put(&mut m, KIND, self.kind.to_value());
        if let Some(c) = &self.content {
            put(&mut m, CONTENT, c.clone());
        }
        if let Some(f) = &self.for_ {
            put(&mut m, FOR, f.to_value());
        }
        if let Some(u) = &self.under {
            put(&mut m, UNDER, hv(u));
        }
        put(&mut m, PREVIOUS, previous_value(&self.previous));
        if let Some(a) = &self.answers {
            put(&mut m, ANSWERS, hashes_value(a));
        }
        if let Some(r) = &self.relies_on {
            put(&mut m, RELIES_ON, sorted(r.iter().map(Named::to_value).collect()));
        }
        if let Some(s) = &self.settlement {
            put(&mut m, SETTLEMENT, hv(s));
        }
        if let Some(r) = &self.resolves {
            put(&mut m, RESOLVES, hashes_value(r));
        }
        if let Some(c) = &self.continues {
            put(&mut m, CONTINUES, hv(c));
        }
        m
    }

    /// Decode a payload strictly (E4, E5, E11, E15, E17, E18, E20).
    pub fn from_payload(payload: &[(Value, Value)]) -> R<Statement> {
        use key::*;
        let m = closed(payload, COUNT, "a Statement's payload")?;
        let g = |k| get(&m, k);
        let req = |k, name: &str| g(k).ok_or_else(|| super::Rejected { rule: "E20", says: format!("{name} is required in every Statement (draft 24, section 3.2)") });
        let agreement = hash_of(req(AGREEMENT, "agreement")?, "E5", "agreement")?;
        let terms = hash_of(req(TERMS, "terms")?, "E5", "terms")?;
        let kind = Kind::from_value(req(KIND, "kind")?)?;
        let previous = previous_of(req(PREVIOUS, "previous")?)?;
        let content = g(CONTENT).cloned();
        if content.is_some() && matches!(kind, Kind::Assent | Kind::CounterSignature) {
            return rej("E20", "an assent's content, and a counter signature's, are empty: the field is left out (draft 24, section 3.2)");
        }
        let for_ = g(FOR).map(|v| Who::from_value(v, "for")).transpose()?;
        let under = g(UNDER).map(|v| hash_of(v, "E5", "under")).transpose()?;
        if for_.is_some() != under.is_some() {
            return rej("E20", "for and under are written together, or neither (draft 24, section 3.2)");
        }
        let answers = g(ANSWERS)
            .map(|v| {
                let l = list_of(v, "answers")?;
                let a = l.iter().map(|x| hash_of(x, "E5", "an entry of answers")).collect::<R<Vec<_>>>()?;
                check_set(l, "answers")?;
                Ok(a)
            })
            .transpose()?;
        let relies_on = g(RELIES_ON)
            .map(|v| {
                let l = list_of(v, "relies_on")?;
                check_set(l, "relies_on")?;
                Ok(l.iter().map(Named::from_value).collect::<Vec<_>>())
            })
            .transpose()?;
        let settlement = g(SETTLEMENT).map(|v| hash_of(v, "E5", "settlement")).transpose()?;
        let (resolves, continues) = resolves_of(g(RESOLVES), g(CONTINUES), "E20")?;
        Ok(Statement { agreement, terms, kind, content, for_, under, previous, answers, relies_on, settlement, resolves, continues })
    }

    /// What the bytes of a Statement show by themselves: no case of invalid
    /// that draft 24 lists is one a Statement shows alone (G6.1 needs the
    /// acts held: [`super::check_held`]); the notes.
    pub fn grammar(&self) -> (Vec<Finding>, Vec<Finding>) {
        let mut notes = Vec::new();
        for r in self.relies_on.iter().flatten() {
            if r.fp().is_none() {
                notes.push(Finding::new("G2.2", "an entry of relies_on is not a fingerprint: it is not read (section 3, G2.2)"));
            }
        }
        if self.resolves.is_some() && self.continues.is_none() {
            notes.push(Finding::new("G12.3", "this Statement names resolves and no continues: it resolves nothing, and is read as an act like any other (G12.3)"));
        }
        (Vec::new(), notes)
    }
}

/// Whether two Statements' payloads are one signing of an agreement (G1.2):
/// the same values, byte for byte, under every key of [`ONE_SIGNING`].
/// Whether their signers are that agreement's is the grammar's, not this.
pub fn one_signing(a: &[(Value, Value)], b: &[(Value, Value)]) -> bool {
    let pick = |p: &[(Value, Value)], k: u64| p.iter().find(|(x, _)| *x == Value::Uint(k)).map(|(_, v)| v.clone());
    ONE_SIGNING.iter().all(|k| pick(a, *k) == pick(b, *k))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn statement_rules() {
        let s = Statement::new([1; 32], [2; 32], Kind::Assent, None);
        let p = s.to_payload().unwrap();
        assert_eq!(Statement::from_payload(&p).unwrap(), s);
        let mut c = s.clone();
        c.content = Some(Value::Text("no".into()));
        assert_eq!(c.to_payload().unwrap_err().rule, "E20");
        let mut f = s.clone();
        f.for_ = Some(Who::Agreement([3; 32]));
        assert_eq!(f.to_payload().unwrap_err().rule, "E20");
        f.under = Some([4; 32]);
        assert!(f.to_payload().is_ok());
        let mut k = s.clone();
        k.kind = Kind::Contest;
        k.content = Some(Value::Text("not delivered".into()));
        assert!(k.to_payload().is_ok());
    }

    #[test]
    fn one_signing_ignores_line_fields() {
        let mut a = Statement::new([1; 32], [2; 32], Kind::Assent, None);
        a.for_ = Some(Who::Agreement([3; 32]));
        a.under = Some([4; 32]);
        let mut b = a.clone();
        b.previous = Some([9; 32]);
        b.answers = Some(vec![[8; 32]]);
        assert!(one_signing(&a.to_payload().unwrap(), &b.to_payload().unwrap()));
        b.under = Some([5; 32]);
        assert!(!one_signing(&a.to_payload().unwrap(), &b.to_payload().unwrap()));
    }
}
