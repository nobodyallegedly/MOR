//! The report (type 0 under the spec hash of the report block's third
//! proposal): a **proposal**, as the block is (`docs/lead/proposals/report-block-3.md`,
//! the MOR lead's; `encoding-1.md`, "The report").
//!
//! ```cddl
//! report = {
//!   0 => call-ref,           ; the call it answers: the act that holds it, and the task where it is written in Terms
//!   ? 1 => [+ hash],         ; relies_on: the acts it relied on, other than those its lines name
//!   ? 2 => [+ line],         ; lines (K6's row), in the writer's order
//! }
//! call-ref = [ act: hash ] / [ act: hash, task: 1..8 ]
//! line = [0, amount, by: hash]                          ; received
//!      / [1, amount, to: who, by: hash]                 ; passed on
//!      / [1, amount, to: who, by: hash, closes: line-ref]
//!      / [2, amount]                                    ; the doer's own part
//!      / [3, amount]                                    ; kept (a fee)
//!      / [4, amount, to: who]                           ; still owed
//! amount = [ unit: hash, value: uint ]                  ; as Money writes one
//! line-ref = [ report: hash, line: uint ]
//! ```

use super::{check_set, closed, get, hash_of, hashes_value, hv, list_of, put, rej, uint_of, Who, R};
use crate::cbor::Value;
use crate::hash::Hash;

/// The call a report answers (E21): the act that holds it, by fingerprint;
/// and, where the call is written in Terms (`calls`), the task it is
/// attached to. A call made by default (a payment's, G11.7) has no bytes:
/// the report names the payment, or its settlement, and no task.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct CallRef {
    pub act: Hash,
    pub task: Option<u8>,
}

/// An amount, as the Money MIR writes one: its unit's spec hash and a value
/// in the unit's smallest part. Two amounts are the same where their bytes
/// are (G11.4(c)).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Amount {
    pub unit: Hash,
    pub value: u64,
}

impl Amount {
    fn to_value(self) -> Value {
        Value::Array(vec![hv(&self.unit), Value::Uint(self.value)])
    }

    fn from_value(v: &Value) -> R<Amount> {
        match v {
            Value::Array(a) if a.len() == 2 => Ok(Amount { unit: hash_of(&a[0], "E22", "an amount's unit")?, value: uint_of(&a[1], "E22", "an amount's value")? }),
            _ => rej("E22", "an amount is [unit, value], as Money writes one"),
        }
    }
}

/// One line of a leg report (E22; K6's row).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Line {
    /// What was received, with the act it came by (a settlement).
    Received { amount: Amount, by: Hash },
    /// What was passed on, to whom, with the act it went by; and, where it
    /// pays what an earlier line stated as still owed, that line.
    PassedOn { amount: Amount, to: Who, by: Hash, closes: Option<(Hash, u64)> },
    /// The doer's own part.
    OwnPart { amount: Amount },
    /// What was kept: a fee.
    Kept { amount: Amount },
    /// What is still owed, to whom.
    StillOwed { amount: Amount, to: Who },
}

impl Line {
    fn to_value(&self) -> Value {
        let u = |n| Value::Uint(n);
        Value::Array(match self {
            Line::Received { amount, by } => vec![u(0), amount.to_value(), hv(by)],
            Line::PassedOn { amount, to, by, closes } => {
                let mut v = vec![u(1), amount.to_value(), to.to_value(), hv(by)];
                if let Some((r, i)) = closes {
                    v.push(Value::Array(vec![hv(r), u(*i)]));
                }
                v
            }
            Line::OwnPart { amount } => vec![u(2), amount.to_value()],
            Line::Kept { amount } => vec![u(3), amount.to_value()],
            Line::StillOwed { amount, to } => vec![u(4), amount.to_value(), to.to_value()],
        })
    }

    fn from_value(v: &Value) -> R<Line> {
        let says = "a line is [0, amount, by] (received), [1, amount, to, by, ? closes] (passed on), [2, amount] (own part), [3, amount] (kept) or [4, amount, to] (still owed)";
        let Value::Array(a) = v else { return rej("E22", says) };
        let n = a.len();
        let amount = || Amount::from_value(&a[1]);
        Ok(match (a.first(), n) {
            (Some(Value::Uint(0)), 3) => Line::Received { amount: amount()?, by: hash_of(&a[2], "E22", "a received line's act")? },
            (Some(Value::Uint(1)), 4 | 5) => Line::PassedOn {
                amount: amount()?,
                to: Who::from_value(&a[2], "a passed-on line's to")?,
                by: hash_of(&a[3], "E22", "a passed-on line's act")?,
                closes: a
                    .get(4)
                    .map(|c| match c {
                        Value::Array(r) if r.len() == 2 => Ok((hash_of(&r[0], "E22", "the report a line closes")?, uint_of(&r[1], "E22", "the line it closes")?)),
                        _ => rej("E22", "a line closed is named [report, line]"),
                    })
                    .transpose()?,
            },
            (Some(Value::Uint(2)), 2) => Line::OwnPart { amount: amount()? },
            (Some(Value::Uint(3)), 2) => Line::Kept { amount: amount()? },
            (Some(Value::Uint(4)), 3) => Line::StillOwed { amount: amount()?, to: Who::from_value(&a[2], "a still-owed line's to")? },
            _ => return rej("E22", says),
        })
    }
}

/// A report's payload.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Report {
    pub call: CallRef,
    pub relies_on: Option<Vec<Hash>>,
    pub lines: Option<Vec<Line>>,
}

impl Report {
    pub fn to_payload(&self) -> R<Vec<(Value, Value)>> {
        let p = self.payload_unchecked();
        Report::from_payload(&p)?;
        Ok(p)
    }

    pub fn payload_unchecked(&self) -> Vec<(Value, Value)> {
        let mut m = Vec::new();
        let mut c = vec![hv(&self.call.act)];
        if let Some(t) = self.call.task {
            c.push(Value::Uint(t as u64));
        }
        put(&mut m, 0, Value::Array(c));
        if let Some(r) = &self.relies_on {
            put(&mut m, 1, hashes_value(r));
        }
        if let Some(l) = &self.lines {
            put(&mut m, 2, Value::Array(l.iter().map(Line::to_value).collect()));
        }
        m
    }

    pub fn from_payload(payload: &[(Value, Value)]) -> R<Report> {
        let m = closed(payload, 3, "a report's payload")?;
        let call = match get(&m, 0) {
            None => return rej("E21", "a report names the call it answers (the block's R2: a report that names no call is no report)"),
            Some(Value::Array(a)) if a.len() == 1 || a.len() == 2 => CallRef {
                act: hash_of(&a[0], "E21", "the act that holds the call")?,
                task: match a.get(1) {
                    None => None,
                    Some(Value::Uint(t @ 1..=8)) => Some(*t as u8),
                    Some(_) => return rej("E21", "the task of a call written in Terms is 1 to 8 (K1 to K8)"),
                },
            },
            Some(_) => return rej("E21", "the call is [act] or [act, task]"),
        };
        let relies_on = get(&m, 1)
            .map(|v| {
                let l = list_of(v, "a report's relies_on")?;
                let r = l.iter().map(|x| hash_of(x, "E21", "an entry of a report's relies_on")).collect::<R<Vec<_>>>()?;
                check_set(l, "a report's relies_on")?;
                Ok(r)
            })
            .transpose()?;
        let lines = get(&m, 2).map(|v| list_of(v, "lines")?.iter().map(Line::from_value).collect::<R<Vec<_>>>()).transpose()?;
        Ok(Report { call, relies_on, lines })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn report_round_trip() {
        let amount = Amount { unit: [1; 32], value: 100 };
        let r = Report {
            call: CallRef { act: [2; 32], task: Some(6) },
            relies_on: Some(vec![[3; 32]]),
            lines: Some(vec![
                Line::Received { amount, by: [4; 32] },
                Line::PassedOn { amount, to: Who::Signer([5; 32]), by: [6; 32], closes: Some(([7; 32], 1)) },
                Line::OwnPart { amount },
                Line::Kept { amount },
                Line::StillOwed { amount, to: Who::Agreement([8; 32]) },
            ]),
        };
        let p = r.to_payload().unwrap();
        assert_eq!(Report::from_payload(&p).unwrap(), r);
        let bad = Report { call: CallRef { act: [2; 32], task: Some(9) }, relies_on: None, lines: None };
        assert_eq!(bad.to_payload().unwrap_err().rule, "E21");
    }
}
