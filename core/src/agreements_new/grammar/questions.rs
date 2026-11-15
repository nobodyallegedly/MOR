//! The verifier's questions by name, with their arguments as text: for the
//! WebAssembly binding and the vectors. Each name is one public question of
//! [`Verifier`]; arguments are fingerprints in hex, positions as numbers, and
//! a person or agreement as `signer:<hex>` or `agreement:<hex>`.

use super::{Answer, Verifier};
use crate::agreements_new::Who;
use crate::hash::Hash;

/// Every question's name, with its arguments.
pub const QUESTIONS: &[(&str, &str)] = &[
    ("act", "act"),
    ("whole", "terms"),
    ("in_force", "terms"),
    ("last_version", "root"),
    ("update", "terms"),
    ("assent", "statement"),
    ("counter_signature", "statement"),
    ("bound", "who, act"),
    ("signature_of", "statement"),
    ("line", "signer, root"),
    ("resolution", "act"),
    ("order", "act, act"),
    ("receiver", "root, version?"),
    ("receiver_for_payment", "payment"),
    ("fillings", "root, position"),
    ("takes_new", "root, position"),
    ("rights", "version, holder"),
    ("holds_control", "terms"),
    ("leg", "terms"),
    ("silence", "terms"),
    ("data", "report, who"),
    ("buyer_leg", "payment"),
    ("before_paying", "root"),
    ("contest", "statement"),
    ("baker", "terms"),
];

fn hash(s: &str) -> Result<Hash, String> {
    let b: Vec<u8> = (0..s.len()).step_by(2).map(|i| s.get(i..i + 2).and_then(|x| u8::from_str_radix(x, 16).ok())).collect::<Option<_>>().ok_or("not hex")?;
    b.try_into().map_err(|_| format!("not a fingerprint of 32 bytes: {s}"))
}

/// `signer:<hex>` or `agreement:<hex>`.
pub fn who(s: &str) -> Result<Who, String> {
    match s.split_once(':') {
        Some(("signer", x)) => Ok(Who::Signer(hash(x)?)),
        Some(("agreement", x)) => Ok(Who::Agreement(hash(x)?)),
        _ => Err(format!("a person or agreement is signer:<hex> or agreement:<hex>, not {s}")),
    }
}

fn flat(a: Answer) -> Vec<Answer> {
    let mut v = vec![a.clone()];
    v.extend(a.with);
    v
}

impl<'a> Verifier<'a> {
    /// Ask a question by name. Questions whose answer carries answers shown
    /// beside it (the receiver, fillings, a contest, the baker) give them after
    /// it, in order.
    pub fn ask_named(&self, name: &str, args: &[&str]) -> Result<Vec<Answer>, String> {
        let need = |n: usize| if args.len() < n { Err(format!("{name} takes {n} argument(s)")) } else { Ok(()) };
        let h = |i: usize| hash(args[i]);
        let n = |i: usize| args[i].parse::<u64>().map_err(|_| format!("a position, not {}", args[i]));
        Ok(match name {
            "act" => { need(1)?; vec![self.act(&h(0)?)] }
            "whole" => { need(1)?; vec![self.whole(&h(0)?)] }
            "in_force" => { need(1)?; vec![self.in_force(&h(0)?)] }
            "last_version" => { need(1)?; vec![self.last_version(&h(0)?)] }
            "update" => { need(1)?; vec![self.update(&h(0)?)] }
            "assent" => { need(1)?; vec![self.assent(&h(0)?)] }
            "counter_signature" => { need(1)?; vec![self.counter_signature(&h(0)?)] }
            "bound" => { need(2)?; vec![self.bound(who(args[0])?, &h(1)?)] }
            "signature_of" => { need(1)?; vec![self.signature_of(&h(0)?)] }
            "line" => { need(2)?; vec![self.line(&h(0)?, &h(1)?)] }
            "resolution" => { need(1)?; vec![self.resolution(&h(0)?)] }
            "order" => { need(2)?; vec![self.order(&h(0)?, &h(1)?)] }
            "receiver" => {
                need(1)?;
                let v = if args.len() > 1 { Some(h(1)?) } else { None };
                flat(self.receiver(&h(0)?, v.as_ref()))
            }
            "receiver_for_payment" => { need(1)?; vec![self.receiver_for_payment(&h(0)?)] }
            "fillings" => { need(2)?; flat(self.fillings(&h(0)?, n(1)?)) }
            "takes_new" => { need(2)?; vec![self.takes_new(&h(0)?, n(1)?)] }
            "rights" => { need(2)?; vec![self.rights(&h(0)?, &h(1)?)] }
            "holds_control" => { need(1)?; vec![self.holds_control(&h(0)?)] }
            "leg" => { need(1)?; self.leg(&h(0)?) }
            "silence" => { need(1)?; vec![self.silence(&h(0)?)] }
            "data" => { need(2)?; vec![self.data(&h(0)?, who(args[1])?)] }
            "buyer_leg" => { need(1)?; vec![self.buyer_leg(&h(0)?)] }
            "before_paying" => { need(1)?; self.before_paying(&h(0)?) }
            "contest" => { need(1)?; flat(self.contest(&h(0)?)) }
            "baker" => { need(1)?; flat(self.baker(&h(0)?)) }
            _ => return Err(format!("no question named {name}")),
        })
    }
}
