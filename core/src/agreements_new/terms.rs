//! Terms (type 0 under draft 24's spec hash): draft 24, section 3.1;
//! `encoding-1.md`, "Terms".
//!
//! ```cddl
//! terms = {
//!   ? 0 => hash,             ; replaces: the Terms act this one replaces
//!   ? 1 => hash,             ; agreement: the root; exactly when 0 is present
//!   ? 2 => [+ party],        ; parties, in the writer's order; required unless 17 and 18
//!   ? 3 => [+ uint],         ; authors: indexes into parties; required unless 17 and 18
//!   ? 4 => body,             ; body: [words, socket]; required unless 17 and 18
//!   ? 5 => [+ any],          ; relies_on: fingerprints; an entry that is not one is left unread
//!   ? 6 => socket,           ; in_force (K2); absent: G4.1's default
//!   ? 7 => [+ power],        ; powers: [kind, rule], each rule a socket (K3)
//!   ? 8 => hash,             ; place, by identifier
//!   ? 9 => hash,             ; clock, by identifier
//!   ? 10 => uint / hash,     ; receiver: a party's index, or another agreement's root
//!   ? 11 => hash,            ; envelope: the bake's act id
//!   ? 12 => hash,            ; envelope_at: the act of the envelope's chain cited; exactly when 11 is present
//!   ? 13 => socket,          ; condition (K4); absent: G4.11(e)'s default
//!   ? 14 => socket,          ; control (K6)
//!   ? 15 => [+ call],        ; calls: [task, from]
//!   ? 16 => socket,          ; data (K8); absent: one leg
//!   ? 17 => [+ hash],        ; resolves: every tip of a fork
//!   ? 18 => hash,            ; continues: one of 17; only beside 17
//!   19 => [] / [hash],       ; previous: the signer's previous act in this agreement
//! }
//! party = [0, hash] / [1, role] / [2, hash]   ; a signer; a role; an agreement by its root
//! role = { ? 0 => any, ? 1 => any, ? 2 => socket }   ; kind (0..4), what, spot (K5)
//! body = [ words: any, socket ]
//! power = [ kind: 0 / 1 / 2 / 3 / 4 / hash, rule: socket ]
//! call = [ task: 1..8, from: 0 / 1 / 2 ]
//! ```

use super::{
    check_distinct, check_set, closed, get, hash_of, hashes_value, hv, list_of, previous_of, previous_value, put, rej, resolves_of, sorted,
    uint_of, Finding, Named, Socket, R,
};
use crate::cbor::Value;
use crate::hash::Hash;

/// How a party is named (E9).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Party {
    /// `[0, identity hash]`.
    Signer(Hash),
    /// `[1, role]`.
    Role(Role),
    /// `[2, root]`: another agreement.
    Agreement(Hash),
}

/// A role (E10). Each field is kept as written: draft 24 reads a role that
/// lacks its kind, its `what` or its cMIP, or holds a kind or `what` that is
/// not one it allows, as invalid (G10.1), not as rejected.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Role {
    /// 0: its kind, one of [`RoleKind`] by number.
    pub kind: Option<Value>,
    /// 1: its `what`, by fingerprint (not read for kind future).
    pub what: Option<Value>,
    /// 2: its spot socket (task K5).
    pub spot: Option<Socket>,
}

/// The five kinds of spot (G10.1), by number (E10).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum RoleKind {
    Done = 0,
    Received = 1,
    Holding = 2,
    Fits = 3,
    Future = 4,
}

impl RoleKind {
    pub fn of(n: u64) -> Option<RoleKind> {
        Some(match n {
            0 => RoleKind::Done,
            1 => RoleKind::Received,
            2 => RoleKind::Holding,
            3 => RoleKind::Fits,
            4 => RoleKind::Future,
            _ => return None,
        })
    }

    pub fn word(self) -> &'static str {
        ["done", "received", "holding", "fits", "future"][self as usize]
    }
}

impl Role {
    /// A role as G10.1 asks: its kind, its `what` (none for kind future), and
    /// its spot socket.
    pub fn new(kind: RoleKind, what: Option<Hash>, spot: Socket) -> Role {
        Role { kind: Some(Value::Uint(kind as u64)), what: what.map(|h| hv(&h)), spot: Some(spot) }
    }

    /// The kind, where it is one of the five.
    pub fn kind(&self) -> Option<RoleKind> {
        match self.kind {
            Some(Value::Uint(n)) => RoleKind::of(n),
            _ => None,
        }
    }

    fn to_value(&self) -> Value {
        let mut m = Vec::new();
        if let Some(k) = &self.kind {
            put(&mut m, 0, k.clone());
        }
        if let Some(w) = &self.what {
            put(&mut m, 1, w.clone());
        }
        if let Some(s) = &self.spot {
            put(&mut m, 2, s.to_value());
        }
        Value::Map(m)
    }

    fn from_value(v: &Value) -> R<Role> {
        let Value::Map(entries) = v else {
            return rej("E10", "a role is a map: { ? 0 => kind, ? 1 => what, ? 2 => spot socket }");
        };
        let m = closed(entries, 3, "a role")?;
        Ok(Role {
            kind: get(&m, 0).cloned(),
            what: get(&m, 1).cloned(),
            spot: get(&m, 2).map(|s| Socket::from_value(s, "a role's spot")).transpose()?,
        })
    }
}

impl Party {
    fn to_value(&self) -> Value {
        match self {
            Party::Signer(h) => Value::Array(vec![Value::Uint(0), hv(h)]),
            Party::Role(r) => Value::Array(vec![Value::Uint(1), r.to_value()]),
            Party::Agreement(h) => Value::Array(vec![Value::Uint(2), hv(h)]),
        }
    }

    fn from_value(v: &Value) -> R<Party> {
        let says = "a party is a signer, [0, identity hash]; a role, [1, role]; or an agreement, [2, root]";
        let Value::Array(a) = v else { return rej("E9", says) };
        if a.len() != 2 {
            return rej("E9", says);
        }
        match a[0] {
            Value::Uint(0) => Ok(Party::Signer(hash_of(&a[1], "E9", "a party named as a signer")?)),
            Value::Uint(1) => Ok(Party::Role(Role::from_value(&a[1])?)),
            Value::Uint(2) => Ok(Party::Agreement(hash_of(&a[1], "E9", "a party named as an agreement")?)),
            _ => rej("E9", says),
        }
    }
}

/// The body: the words, by fingerprint, and the socket of the cMIP that says
/// how to read them (task K1) (E8).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Body {
    pub words: Named,
    pub socket: Socket,
}

impl Body {
    pub fn new(words: Hash, socket: Socket) -> Body {
        Body { words: Named::Fp(words), socket }
    }
}

/// A power's kind (E14): a kind of Statement, `resolves`, or `replaces`,
/// which gives no power and is left unread (G5.2).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum PowerKind {
    Assent,
    CounterSignature,
    Contest,
    Resolves,
    Replaces,
    /// A kind of Statement defined by a cMIP (task K7), by its spec hash.
    Defined(Hash),
}

impl PowerKind {
    fn to_value(self) -> Value {
        match self {
            PowerKind::Assent => Value::Uint(0),
            PowerKind::CounterSignature => Value::Uint(1),
            PowerKind::Contest => Value::Uint(2),
            PowerKind::Resolves => Value::Uint(3),
            PowerKind::Replaces => Value::Uint(4),
            PowerKind::Defined(h) => hv(&h),
        }
    }

    fn from_value(v: &Value) -> R<PowerKind> {
        Ok(match v {
            Value::Uint(0) => PowerKind::Assent,
            Value::Uint(1) => PowerKind::CounterSignature,
            Value::Uint(2) => PowerKind::Contest,
            Value::Uint(3) => PowerKind::Resolves,
            Value::Uint(4) => PowerKind::Replaces,
            Value::Bytes(b) if b.len() == 32 => PowerKind::Defined(b.as_slice().try_into().unwrap()),
            _ => {
                return rej(
                    "E14",
                    "a power's kind is 0 (assent), 1 (counter_signature), 2 (contest), 3 (resolves), 4 (replaces, left unread) or a K7 cMIP's spec hash",
                )
            }
        })
    }
}

/// One entry of `powers` (E14).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Power {
    pub kind: PowerKind,
    pub rule: Socket,
}

/// The receiver (E12): one of these Terms' parties, by its index in
/// `parties`, or another agreement, by its root.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Receiver {
    Party(u64),
    Agreement(Hash),
}

/// From whom a call expects a report (E16).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum CallFrom {
    Doer = 0,
    ReceivingSide = 1,
    Both = 2,
}

/// A call for reports (E16; the report block's R1, a proposal): the task it
/// is attached to, by its number (K1 to K8 written 1 to 8), and from whom.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Call {
    pub task: u8,
    pub from: CallFrom,
}

/// A Terms act's payload. `None` is a field left out: an empty socket, no
/// entry, or a field this act does not carry.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct Terms {
    pub replaces: Option<Hash>,
    pub agreement: Option<Hash>,
    pub parties: Option<Vec<Party>>,
    pub authors: Option<Vec<u64>>,
    pub body: Option<Body>,
    pub relies_on: Option<Vec<Named>>,
    pub in_force: Option<Socket>,
    pub powers: Option<Vec<Power>>,
    pub place: Option<Hash>,
    pub clock: Option<Hash>,
    pub receiver: Option<Receiver>,
    pub envelope: Option<Hash>,
    pub envelope_at: Option<Hash>,
    pub condition: Option<Socket>,
    pub control: Option<Socket>,
    pub calls: Option<Vec<Call>>,
    pub data: Option<Socket>,
    pub resolves: Option<Vec<Hash>>,
    pub continues: Option<Hash>,
    /// `previous`, always written: `None` is `[]`.
    pub previous: Option<Hash>,
}

/// The payload keys (encoding-1, "Terms").
pub mod key {
    pub const REPLACES: u64 = 0;
    pub const AGREEMENT: u64 = 1;
    pub const PARTIES: u64 = 2;
    pub const AUTHORS: u64 = 3;
    pub const BODY: u64 = 4;
    pub const RELIES_ON: u64 = 5;
    pub const IN_FORCE: u64 = 6;
    pub const POWERS: u64 = 7;
    pub const PLACE: u64 = 8;
    pub const CLOCK: u64 = 9;
    pub const RECEIVER: u64 = 10;
    pub const ENVELOPE: u64 = 11;
    pub const ENVELOPE_AT: u64 = 12;
    pub const CONDITION: u64 = 13;
    pub const CONTROL: u64 = 14;
    pub const CALLS: u64 = 15;
    pub const DATA: u64 = 16;
    pub const RESOLVES: u64 = 17;
    pub const CONTINUES: u64 = 18;
    pub const PREVIOUS: u64 = 19;
    /// One more than the highest key.
    pub const COUNT: u64 = 20;
}

impl Terms {
    /// Whether this act is written as a resolving update: `resolves` and
    /// `continues` both present (E19; draft 24, G12.3).
    pub fn is_resolving(&self) -> bool {
        self.resolves.is_some() && self.continues.is_some()
    }

    /// The payload, in its one byte form: set-like lists sorted (E18).
    /// Refused where the result would be rejected (a repeated entry, a
    /// missing required field), so a payload built here is always one the
    /// decoder takes; invalid cases (G2.1 and the like) can be built.
    pub fn to_payload(&self) -> R<Vec<(Value, Value)>> {
        let p = self.payload_unchecked();
        Terms::from_payload(&p)?;
        Ok(p)
    }

    /// The payload as written, unchecked: for tests and vectors only.
    pub fn payload_unchecked(&self) -> Vec<(Value, Value)> {
        use key::*;
        let mut m = Vec::new();
        let sock = |m: &mut Vec<_>, k, s: &Option<Socket>| {
            if let Some(s) = s {
                put(m, k, s.to_value());
            }
        };
        let h = |m: &mut Vec<_>, k, x: &Option<Hash>| {
            if let Some(x) = x {
                put(m, k, hv(x));
            }
        };
        h(&mut m, REPLACES, &self.replaces);
        h(&mut m, AGREEMENT, &self.agreement);
        if let Some(p) = &self.parties {
            put(&mut m, PARTIES, Value::Array(p.iter().map(Party::to_value).collect()));
        }
        if let Some(a) = &self.authors {
            put(&mut m, AUTHORS, sorted(a.iter().map(|n| Value::Uint(*n)).collect()));
        }
        if let Some(b) = &self.body {
            put(&mut m, BODY, Value::Array(vec![b.words.to_value(), b.socket.to_value()]));
        }
        if let Some(r) = &self.relies_on {
            put(&mut m, RELIES_ON, sorted(r.iter().map(Named::to_value).collect()));
        }
        sock(&mut m, IN_FORCE, &self.in_force);
        if let Some(p) = &self.powers {
            put(&mut m, POWERS, sorted(p.iter().map(|p| Value::Array(vec![p.kind.to_value(), p.rule.to_value()])).collect()));
        }
        h(&mut m, PLACE, &self.place);
        h(&mut m, CLOCK, &self.clock);
        if let Some(r) = &self.receiver {
            put(
                &mut m,
                RECEIVER,
                match r {
                    Receiver::Party(i) => Value::Uint(*i),
                    Receiver::Agreement(h) => hv(h),
                },
            );
        }
        h(&mut m, ENVELOPE, &self.envelope);
        h(&mut m, ENVELOPE_AT, &self.envelope_at);
        sock(&mut m, CONDITION, &self.condition);
        sock(&mut m, CONTROL, &self.control);
        if let Some(c) = &self.calls {
            put(
                &mut m,
                CALLS,
                sorted(c.iter().map(|c| Value::Array(vec![Value::Uint(c.task as u64), Value::Uint(c.from as u64)])).collect()),
            );
        }
        sock(&mut m, DATA, &self.data);
        if let Some(r) = &self.resolves {
            put(&mut m, RESOLVES, hashes_value(r));
        }
        h(&mut m, CONTINUES, &self.continues);
        put(&mut m, PREVIOUS, previous_value(&self.previous));
        m
    }

    /// Decode a payload strictly: every rejection of the bytes (E4 to E19).
    /// What reaches the grammar rules is kept, and [`Terms::grammar`] reads it.
    pub fn from_payload(payload: &[(Value, Value)]) -> R<Terms> {
        use key::*;
        let m = closed(payload, COUNT, "a Terms act's payload")?;
        let g = |k| get(&m, k);
        let hash = |k, what| g(k).map(|v| hash_of(v, "E5", what)).transpose();
        let sock = |k, what| g(k).map(|v| Socket::from_value(v, what)).transpose();

        let parties = g(PARTIES)
            .map(|v| {
                let l = list_of(v, "parties")?;
                check_distinct(l, "parties")?;
                l.iter().map(Party::from_value).collect::<R<Vec<_>>>()
            })
            .transpose()?;
        let authors = g(AUTHORS)
            .map(|v| {
                let l = list_of(v, "authors")?;
                let a = l.iter().map(|x| uint_of(x, "E13", "an entry of authors (a party's index)")).collect::<R<Vec<_>>>()?;
                check_set(l, "authors")?;
                Ok(a)
            })
            .transpose()?;
        let body = g(BODY)
            .map(|v| match v {
                Value::Array(a) if a.len() == 2 => Ok(Body { words: Named::from_value(&a[0]), socket: Socket::from_value(&a[1], "the body's socket")? }),
                _ => rej("E8", "the body is [words, socket]: an array of exactly two items"),
            })
            .transpose()?;
        let relies_on = g(RELIES_ON)
            .map(|v| {
                let l = list_of(v, "relies_on")?;
                check_set(l, "relies_on")?;
                Ok(l.iter().map(Named::from_value).collect::<Vec<_>>())
            })
            .transpose()?;
        let powers = g(POWERS)
            .map(|v| {
                let l = list_of(v, "powers")?;
                let p = l
                    .iter()
                    .map(|e| match e {
                        Value::Array(a) if a.len() == 2 => Ok(Power { kind: PowerKind::from_value(&a[0])?, rule: Socket::from_value(&a[1], "a power's rule")? }),
                        _ => rej("E14", "an entry of powers is [kind, rule]: an array of exactly two items"),
                    })
                    .collect::<R<Vec<_>>>()?;
                check_set(l, "powers")?;
                Ok(p)
            })
            .transpose()?;
        let receiver = g(RECEIVER)
            .map(|v| match v {
                Value::Uint(i) => Ok(Receiver::Party(*i)),
                Value::Bytes(b) if b.len() == 32 => Ok(Receiver::Agreement(b.as_slice().try_into().unwrap())),
                _ => rej("E12", "the receiver is a party's index in parties (an unsigned integer) or another agreement's root (a fingerprint)"),
            })
            .transpose()?;
        let calls = g(CALLS)
            .map(|v| {
                let l = list_of(v, "calls")?;
                let c = l
                    .iter()
                    .map(|e| {
                        let says = "a call is [task, from]: the task 1 to 8 (K1 to K8), and from whom, 0 (the doer), 1 (the receiving side) or 2 (both)";
                        let Value::Array(a) = e else { return rej("E16", says) };
                        if a.len() != 2 {
                            return rej("E16", says);
                        }
                        let task = match a[0] {
                            Value::Uint(t @ 1..=8) => t as u8,
                            _ => return rej("E16", says),
                        };
                        let from = match a[1] {
                            Value::Uint(0) => CallFrom::Doer,
                            Value::Uint(1) => CallFrom::ReceivingSide,
                            Value::Uint(2) => CallFrom::Both,
                            _ => return rej("E16", says),
                        };
                        Ok(Call { task, from })
                    })
                    .collect::<R<Vec<_>>>()?;
                check_set(l, "calls")?;
                if c.windows(2).any(|w| w[0].task == w[1].task) {
                    return rej("E16", "calls holds at most one call for each task");
                }
                Ok(c)
            })
            .transpose()?;
        let (resolves, continues) = resolves_of(g(RESOLVES), g(CONTINUES), "E19")?;
        let previous = match g(PREVIOUS) {
            Some(v) => previous_of(v)?,
            None => return rej("E19", "previous is required in every Terms act (draft 24, section 3.1): [] for none"),
        };
        let t = Terms {
            replaces: hash(REPLACES, "replaces")?,
            agreement: hash(AGREEMENT, "agreement")?,
            parties,
            authors,
            body,
            relies_on,
            in_force: sock(IN_FORCE, "in_force")?,
            powers,
            place: g(PLACE).map(|v| hash_of(v, "E6", "the place's identifier")).transpose()?,
            clock: g(CLOCK).map(|v| hash_of(v, "E6", "the clock's identifier")).transpose()?,
            receiver,
            envelope: hash(ENVELOPE, "envelope")?,
            envelope_at: hash(ENVELOPE_AT, "envelope_at")?,
            condition: sock(CONDITION, "condition")?,
            control: sock(CONTROL, "control")?,
            calls,
            data: sock(DATA, "data")?,
            resolves,
            continues,
            previous,
        };
        if t.replaces.is_some() != t.agreement.is_some() {
            return rej("E19", "agreement is written exactly when replaces is (draft 24, section 3.1)");
        }
        if t.envelope.is_some() != t.envelope_at.is_some() {
            return rej("E19", "envelope_at is written exactly when envelope is (draft 24, section 3.1: an act with one and not the other is rejected)");
        }
        if !t.is_resolving() {
            for (present, name) in [(t.parties.is_some(), "parties"), (t.authors.is_some(), "authors"), (t.body.is_some(), "body")] {
                if !present {
                    return rej("E19", format!("{name} is required in Terms, except in a resolving update, written with resolves and continues (draft 24, section 3.1)"));
                }
            }
        }
        Ok(t)
    }

    /// What the bytes of a Terms act show by themselves to the grammar rules:
    /// the cases of **invalid** (first list) and the notes (second list).
    pub fn grammar(&self) -> (Vec<Finding>, Vec<Finding>) {
        let mut bad = Vec::new();
        let mut notes = Vec::new();
        let socket = |s: &Socket, what: &str, bad: &mut Vec<Finding>| {
            if s.cmip.fp().is_none() {
                bad.push(Finding::new("G2.1", format!("the cMIP in {what} is not named by fingerprint, so these Terms are invalid (G2.1, G2.2)")));
            }
        };
        if let Some(b) = &self.body {
            if b.words.fp().is_none() {
                bad.push(Finding::new("G2.1", "the body's words are not named by fingerprint, so these Terms are invalid (G2.1, G2.2)"));
            }
            socket(&b.socket, "the body's socket", &mut bad);
        }
        for (s, what) in [(&self.in_force, "in_force"), (&self.condition, "condition"), (&self.control, "control"), (&self.data, "data")] {
            if let Some(s) = s {
                socket(s, what, &mut bad);
            }
        }
        for p in self.powers.iter().flatten() {
            socket(&p.rule, "a power's rule", &mut bad);
            if p.kind == PowerKind::Replaces {
                notes.push(Finding::new("G5.2", "an entry of powers of kind replaces gives no power, and is left unread (G5.2)"));
            }
        }
        let parties = self.parties.as_deref().unwrap_or(&[]);
        for (i, p) in parties.iter().enumerate() {
            let Party::Role(r) = p else { continue };
            let kind = r.kind();
            match (&r.kind, kind) {
                (None, _) => bad.push(Finding::new("G10.1", format!("the role at party {i} names no kind, so these Terms are invalid (G10.1)"))),
                (Some(_), None) => bad.push(Finding::new(
                    "G10.1",
                    format!("the role at party {i} has a kind that is not one of the five (0 done, 1 received, 2 holding, 3 fits, 4 future), read as lacking it: these Terms are invalid (G10.1)"),
                )),
                _ => {}
            }
            if kind == Some(RoleKind::Future) {
                if r.what.is_some() {
                    notes.push(Finding::new("G10.4", format!("the role at party {i} is of kind future: its what is not read (G10.4)")));
                }
            } else {
                match r.what.as_ref().map(Named::from_value) {
                    None => bad.push(Finding::new("G10.1", format!("the role at party {i} names no what, so these Terms are invalid (G10.1)"))),
                    Some(Named::Not(_)) => bad.push(Finding::new(
                        "G10.1",
                        format!("the role at party {i} has a what that is not a fingerprint, read as lacking it: these Terms are invalid (G10.1)"),
                    )),
                    _ => {}
                }
            }
            match &r.spot {
                None => bad.push(Finding::new("G10.1", format!("the role at party {i} names no spot socket (its cMIP, task K5), so these Terms are invalid (G10.1)"))),
                Some(s) => socket(s, &format!("the spot socket of the role at party {i}"), &mut bad),
            }
        }
        if parties.iter().any(|p| matches!(p, Party::Role(_))) && self.in_force.is_none() {
            bad.push(Finding::new("G4.2", "these Terms name a party by role and carry no in_force, so they are invalid (G4.2)"));
        }
        for a in self.authors.iter().flatten() {
            match parties.get(*a as usize) {
                None => bad.push(Finding::new("G3.1", format!("author {a} is not one of these Terms' parties (there are {}), so they are invalid (G3.1)", parties.len()))),
                Some(Party::Agreement(_)) => bad.push(Finding::new(
                    "G3.1",
                    format!("author {a} is a party named as an agreement; authors name parties named as signers or roles, so these Terms are invalid (G3.1)"),
                )),
                _ => {}
            }
        }
        for r in self.relies_on.iter().flatten() {
            if r.fp().is_none() {
                notes.push(Finding::new("G2.2", "an entry of relies_on is not a fingerprint: it is not read, and does not make these Terms invalid (G2.2)"));
            }
        }
        if let Some(Receiver::Party(i)) = self.receiver {
            if !matches!(parties.get(i as usize), Some(Party::Signer(_) | Party::Role(_))) {
                notes.push(Finding::new(
                    "G1.4",
                    format!("the receiver, party {i}, is not one of these Terms' parties named as a signer or a role: by them no one receives, and G1.4 answers not shown"),
                ));
            }
        }
        if self.resolves.is_some() && self.continues.is_none() {
            notes.push(Finding::new("G12.3", "these Terms name resolves and no continues: they resolve nothing, and are read as an act like any other (G12.3)"));
        }
        (bad, notes)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn s(n: u8) -> Socket {
        Socket::new([n; 32], Value::Null)
    }

    pub(crate) fn root() -> Terms {
        Terms {
            parties: Some(vec![Party::Signer([1; 32])]),
            authors: Some(vec![0]),
            body: Some(Body::new([2; 32], s(3))),
            ..Default::default()
        }
    }

    #[test]
    fn round_trip_is_one_byte_form() {
        let mut t = root();
        t.relies_on = Some(vec![Named::Fp([9; 32]), Named::Fp([8; 32])]);
        let p = t.to_payload().unwrap();
        let back = Terms::from_payload(&p).unwrap();
        assert_eq!(back.payload_unchecked(), p);
        // Sorted on the way out.
        assert_eq!(back.relies_on.unwrap()[0], Named::Fp([8; 32]));
    }

    #[test]
    fn presence_rules() {
        let mut t = root();
        t.replaces = Some([4; 32]);
        assert_eq!(t.to_payload().unwrap_err().rule, "E19");
        t.agreement = Some([5; 32]);
        assert!(t.to_payload().is_ok());
        let mut t = root();
        t.envelope = Some([6; 32]);
        assert_eq!(t.to_payload().unwrap_err().rule, "E19");
        t.envelope_at = Some([6; 32]);
        assert!(t.to_payload().is_ok());
        let mut t = root();
        t.continues = Some([7; 32]);
        assert_eq!(t.to_payload().unwrap_err().rule, "E19");
        t.resolves = Some(vec![[8; 32]]);
        assert_eq!(t.to_payload().unwrap_err().rule, "E19");
        t.resolves = Some(vec![[7; 32], [8; 32]]);
        assert!(t.to_payload().is_ok());
        // A resolving update needs no parties, authors or body.
        let r = Terms { resolves: Some(vec![[7; 32], [8; 32]]), continues: Some([7; 32]), ..Default::default() };
        assert!(r.to_payload().is_ok());
        // resolves alone does not excuse them.
        let r = Terms { resolves: Some(vec![[7; 32]]), ..Default::default() };
        assert_eq!(r.to_payload().unwrap_err().rule, "E19");
    }

    #[test]
    fn grammar_cases() {
        let mut t = root();
        t.parties.as_mut().unwrap().push(Party::Role(Role::new(RoleKind::Done, Some([1; 32]), s(4))));
        let (bad, _) = t.grammar();
        assert_eq!(bad.iter().map(|f| f.rule).collect::<Vec<_>>(), vec!["G4.2"]);
        t.in_force = Some(s(5));
        assert!(t.grammar().0.is_empty());
        t.authors = Some(vec![0, 2]);
        assert_eq!(t.grammar().0[0].rule, "G3.1");
        let mut t = root();
        t.body = Some(Body { words: Named::Not(Value::Text("https://example.org".into())), socket: s(3) });
        assert_eq!(t.grammar().0[0].rule, "G2.1");
    }
}
