//! Agreements draft 9 on a collective's own sequences (F109): freeze suite v21,
//! scenario 3 (the label), its step 7o (the ordering stories, each named
//! after its test in `harness/ordering/tests/stories.rs`), steps 7k, 8 and
//! 8b with the abandonment declaration (B12), Flaw B1 and B11, Flaws B17
//! and B18, and scenario 1 (the film, a deal, with Flaw B19).
//!
//! The label: Ana holds the releases area (publications and the Development
//! lane, id 1); Ben, the treasurer, holds the Money lane (id 2); Cy holds
//! none. The label signs from up to three devices; members from a phone, a
//! laptop and a tablet. Acts and signatures are real: signed, held, judged
//! by the core library.

mod common;

use common::{agreements_spec, own_home, publication, schnorr, signing_key, Person, Rot, World};
use mor_core::sig::SchnorrKey;
use mor_core::act::Object;
use mor_core::cbor::Value;
use mor_core::chain::Status;
use mor_core::hash::{sha256, Hash};
use mor_core::agreements::{
    self, outcomes, Abandonment, AbsenceDeclaration, Area, Authority, Backing, CloneState, Consent, Field4, Grant, Who,
    Holding, KeyGrammar, Keepers, Kind, AgreementsError, AgreementsView, MarkEntry, Mirs, Power, Record,
    Recovery, ReleaseRule, HoldersRule, Resignation, Rule, SuccessionPlan, Terms,
};

fn mirs() -> Mirs {
    let t = |s: &str| sha256(format!("{s}, test value until the freeze").as_bytes());
    Mirs {
        identity: common::identity_spec(),
        envelopes: t("ENVELOPE"),
        text: t("TEXT"),
        money: t("FINANCE"),
        agreements: t("LAW"),
        development: t("PRODUCTION"),
    }
}

fn spec(s: &str) -> Hash {
    sha256(s.as_bytes())
}

fn pay() -> Hash {
    spec("a payment cMIP")
}
fn pay2() -> Hash {
    spec("a second payment cMIP")
}
fn pay3() -> Hash {
    spec("a third payment cMIP")
}
fn anchor() -> Hash {
    spec("an anchoring cMIP")
}
fn ext() -> Hash {
    spec("an extension declaring only Development")
}

const ANA: usize = 0;
const BEN: usize = 1;
const CY: usize = 2;

struct Lab {
    w: World,
    /// Ana, Ben, Cy: each one's phone.
    m: Vec<Person>,
    /// The label: a collective, keyless (Identity rule 1).
    col: Person,
    /// Three devices of Cy, a member holding no area, acting for the label
    /// (rule 58): each act names it in `objects`. What the label's own
    /// devices did before its signing key was withdrawn.
    c: Vec<Person>,
    /// The acts each device made for an earlier holder ([`Lab::hand_over`]).
    handed: Vec<Vec<Hash>>,
    founding: Hash,
    authority: Person,
    keeper: Person,
    keeper_logs: Vec<(Hash, Vec<Hash>)>,
    /// The rail's answer for the receipts paying debts (Money rule 4), as
    /// a verifier states it after the payment cMIP: valid, and where paid.
    rail_valid: Vec<(Hash, mor_core::money::PaidAt)>,
    /// The absence-proof cMIP's answer (rule 51, F172), as a verifier
    /// states it: each `(declaration, act using it)` it accepted.
    accepted: Vec<(Hash, Hash)>,
}

/// A grant key (F128): made by the grantee, who keeps its secret part; the
/// grant names its public part (field 9).
fn grant_key(name: &str) -> (SchnorrKey, mor_core::identity::SigningKey) {
    let k = schnorr(&format!("{name}/grant"), 0);
    let p = signing_key(&k);
    (k, p)
}

/// The label's founding terms (scenario 3.1), with a change applied.
fn label_terms(ids: &[Hash], authority: Hash, keeper: Hash, f: &dyn Fn(&mut Terms)) -> Terms {
    let m = mirs();
    let mut t = Terms {
        parties: ids.to_vec(),
        text: "The label publishes its members' records.".into(),
        cmips: vec![(6, pay()), (11, anchor())],
        keepers: Some(Keepers {
            operators: vec![keeper],
            rule: Rule::All,
        }),
        field4: Field4::Rule(Rule::All),
        clone: Rule::Threshold(2),
        time: None,
        abandonment: Some(Abandonment {
            authority: Authority::Named(authority),
            outcomes: vec![outcomes::VOICE_REMOVED],
            proof: None,
        }),
        parent: None,
        grammar: Some(KeyGrammar {
            chain_key: Holding::Shares {
                threshold: ids.len() as u64,
                members: ids.to_vec(),
            },
            recovery: Some(Recovery::Escrow { authority }),
        }),
        arbitrators: Some(vec![spec("an arbitrator")]),
        extensions: Some(vec![ext()]),
        succession: None,
        constitutional: None,
        areas: Some(vec![
            Area {
                name: "Releases".into(),
                holders: vec![ids[ANA]],
                threshold: 1,
                // Publications, and the Development lane's acts: those of
                // the adopted extension (rule 60: an area reaches act types).
                kinds: Some(vec![
                    Kind::Type {
                        spec: m.envelopes,
                        type_: 0,
                    },
                    Kind::Type { spec: ext(), type_: 0 },
                ]),
                fields: None,
                id: 1,
                limits: None,
            },
            // The Money MIR's own acts, and those of the payment cMIP named
            // for task 6: the treasurer's.
            Area {
                name: "Money".into(),
                holders: vec![ids[BEN]],
                threshold: 1,
                kinds: Some(
                    (0..=mor_core::money::types::PRICE_TAG)
                        .map(|type_| Kind::Type { spec: m.money, type_ })
                        .chain([Kind::Type { spec: pay(), type_: 0 }])
                        .collect(),
                ),
                fields: None,
                id: 2,
                limits: None,
            },
        ]),
        // Every layer's rule (field 19, rule 60): any one member, the label's
        // everyday acts outside the areas above.
        layers: Some(common::layers_all(Rule::Threshold(1))),
        area_words: Some(vec![(1, "Releases go out on Fridays.".into())]),
        chain: None,
        departed: None,
        // The label's own stake (field 7, its target [1, null]): its
        // members' shares.
        stakes: Some(vec![agreements::Stake {
            object: Who::This,
            holders: ids.iter().enumerate().map(|(i, h)| (Who::Id(*h), 1_000_000 / ids.len() as u64 + if i == 0 { 1_000_000 % ids.len() as u64 } else { 0 })).collect(),
        }]),
        target: Some(agreements::Target::Collective),
        forked_from: None,
        release_rule: None,
        settles: None,
        fork_judge: None,
        plan: None,
        refund: None,
        fees: None,
        holders_rules: None,
        transfers_counted: None,
        issues_under: None,
    };
    f(&mut t);
    t
}

/// The rule for Money (terms field 19) the treasurer's alone, `[2, [ben]]`:
/// the old Money lane, for tests where Ben stays a party.
fn money_is_bens(t: &mut Terms) {
    let ben = t.parties[BEN];
    for (l, r) in t.layers.as_mut().unwrap().iter_mut() {
        if *l == agreements::layers::MONEY {
            *r = Rule::Named(vec![ben]);
        }
    }
}

/// A liveness payload (type 12, rule 50) naming `x`: the plainest
/// Agreements act in its format, used where a test needs any act (Fable's
/// A6: an act outside its type's format is invalid).
fn liveness(x: Hash) -> Vec<(Value, Value)> {
    agreements::Liveness { agreement: x }.to_map()
}

fn obj(x: Hash) -> Option<Vec<Object>> {
    Some(vec![Object {
        chain: x,
        predecessor: x,
    }])
}

impl Lab {
    fn new(f: &dyn Fn(&mut Terms)) -> Lab {
        Lab::with(f, true)
    }

    fn with(f: &dyn Fn(&mut Terms), all_sign: bool) -> Lab {
        Lab::with_others(&[], &|t, _| f(t), all_sign).0
    }

    /// The label, with identities who are no members made first, named to
    /// `f` (holders of its stakes, say: Agreements draft 14's owners).
    fn with_others(names: &[&str], f: &dyn Fn(&mut Terms, &[Hash]), all_sign: bool) -> (Lab, Vec<Person>) {
        Lab::with_others_vault(names, f, all_sign, false)
    }

    /// The label, its genesis also declaring a vault (Money rule 14a).
    fn new_with_vault(f: &dyn Fn(&mut Terms)) -> Lab {
        Lab::with_others_vault(&[], &|t, _| f(t), true, true).0
    }

    /// [`Lab::with_others`], the label's genesis declaring a vault where `vault`.
    fn with_others_vault(names: &[&str], f: &dyn Fn(&mut Terms, &[Hash]), all_sign: bool, vault: bool) -> (Lab, Vec<Person>) {
        let mut w = World::new();
        let mut m: Vec<Person> = ["ana", "ben", "cy"]
            .iter()
            .map(|n| w.genesis(n, vec![own_home()], None, None))
            .collect();
        let authority = w.genesis("authority", vec![own_home()], None, None);
        let keeper = w.genesis("keeper", vec![own_home()], None, None);
        let others: Vec<Person> = names.iter().map(|n| w.genesis(n, vec![own_home()], None, None)).collect();
        let other_ids: Vec<Hash> = others.iter().map(|p| p.id).collect();
        let ids: Vec<Hash> = m.iter().map(|p| p.id).collect();
        let t = label_terms(&ids, authority.id, keeper.id, &|t| f(t, &other_ids));
        let founding = agreements_act(&mut w, &mut m[ANA], agreements::types::TERMS, t.to_map(), None);
        let n = if all_sign { 3 } else { 2 };
        for p in m.iter_mut().take(n) {
            sign(&mut w, p, &founding);
        }
        let col = w.genesis_with(
            "label",
            vec![own_home()],
            None,
            None,
            Some({
                let mut d = vec![agreements::founding_declaration(&mirs().agreements, &founding)];
                if vault {
                    d.push(mor_core::money::vault_declaration(&mirs().money, &[vault_entry(b"the label's vault")]));
                }
                d
            }),
            3,
        );
        let dev = m[CY].acting_for(col.id, vec![col.id]);
        let c = vec![dev.clone(), dev.clone(), dev];
        (
            Lab {
                w,
                m,
                col,
                c,
                handed: vec![vec![]; 3],
                founding,
                authority,
                keeper,
                keeper_logs: vec![],
                rail_valid: vec![],
                accepted: vec![],
            },
            others,
        )
    }

    /// What an act on the label's chain cites (F127): the decisions its
    /// devices know, and these previous acts.
    fn chain(&self, previous: &[Hash]) -> Vec<Object> {
        let c = self.col.id;
        self.decisions().iter().chain(previous).map(|d| Object { chain: c, predecessor: *d }).collect()
    }

    /// The decisions device 0 cites (rule 58): what its cite list holds
    /// besides its own actions.
    fn decisions(&self) -> Vec<Hash> {
        let (_, ds) = self.c[0].cite.clone().expect("the label's devices cite its chain");
        let own = |x: &Hash| self.handed[0].contains(x) || self.c[0].seq.contains(x);
        let record = |x: &Hash| self.w.v.get(x).is_some_and(|h| h.inside.spec == mirs().agreements && h.inside.type_ == agreements::types::RECORD);
        ds.into_iter().filter(|x| !own(x) || record(x)).collect()
    }

    fn ids(&self) -> Vec<Hash> {
        self.m.iter().map(|p| p.id).collect()
    }

    fn view(&self) -> AgreementsView<'_> {
        let mut v = common::stand_in_payments(AgreementsView::new(&self.w.v, mirs()));
        v.ext_layers.insert(ext(), vec![]);
        v.ext_layers
            .insert(spec("an extension declaring Money"), vec![agreements::layers::MONEY]);
        for (op, log) in &self.keeper_logs {
            v.keeper_logs.insert(*op, log.clone());
        }
        v.rail_valid.extend(self.rail_valid.iter().copied());
        v.absence_accepted.extend(self.accepted.iter().copied());
        v
    }

    fn consent(&self, x: &Hash) -> Consent {
        self.view().consent(x).unwrap()
    }

    fn counts(&self, x: &Hash) -> bool {
        self.consent(x).counts()
    }

    fn in_force(&self, x: &Hash) -> Hash {
        self.view().in_force(x).unwrap().unwrap()
    }

    /// The terms of the agreement in force, changed: a clone proposal.
    fn clone_terms(&self, parent: &Hash, mark: Vec<(Power, Vec<usize>)>, f: &dyn Fn(&mut Terms)) -> Terms {
        let mut t = self.view().terms(parent).unwrap();
        t.parent = Some(*parent);
        let ids = self.ids();
        t.field4 = Field4::Mark(
            mark.into_iter()
                .map(|(power, who)| MarkEntry {
                    power,
                    signers: sorted(who.iter().map(|i| ids[*i]).collect()),
                })
                .collect(),
        );
        f(&mut t);
        t
    }

    /// A member proposes terms.
    fn propose(&mut self, by: usize, t: &Terms) -> Hash {
        let objects = t.parent.and_then(obj);
        agreements_act(&mut self.w, &mut self.m[by], agreements::types::TERMS, t.to_map(), objects)
    }

    /// A member's signature act. On a clone of the label's agreement it
    /// cites, on the label's chain, the decisions and actions its signer
    /// holds (device 0's), as an action does: a rotation declaring the clone
    /// has the history of the signature acts it names (rule 58).
    fn sign(&mut self, by: usize, x: &Hash) -> Hash {
        let mut p = self.m[by].clone();
        let id = self.sign_by(&mut p, x);
        self.m[by] = p;
        id
    }

    /// [`Lab::sign`] by anyone: a joining member's, say.
    fn sign_by(&mut self, p: &mut Person, x: &Hash) -> Hash {
        let f = self.founding;
        let clone = self.view().lineage(x).is_ok_and(|l| l.len() > 1 && l.iter().any(|(i, _)| *i == f));
        if !clone {
            return sign(&mut self.w, p, x);
        }
        let mut o = obj(*x).unwrap();
        o.extend(self.line(&[0]).into_iter().map(|d| Object { chain: self.col.id, predecessor: d }));
        agreements_act(&mut self.w, p, agreements::types::SIGNATURE, agreements::signature_payload(x), Some(o))
    }

    /// A member's signature on a fork or closing: a chain signature, with
    /// their chain key, on their identity chain (F132).
    fn end(&mut self, by: usize, x: &Hash) -> Hash {
        let (id, q) = self.w.chain_sign(&self.m[by], *x);
        self.m[by] = q;
        id
    }

    /// Holds device `d`'s act for the label; the device's next act cites it
    /// among the heads (rule 58, client conformance: a member's client
    /// cites its own last act for the collective).
    fn own(&mut self, d: usize, a: &mor_core::act::Act) -> Hash {
        let id = self.w.add(a);
        if let Some((_, ds)) = self.c[d].cite.as_mut() {
            ds.push(id);
        }
        id
    }

    /// An act of the label, on device `d`, of a cMIP's own type 0: an act in
    /// the lane of the task the terms name that cMIP for (F106). Since F112
    /// a payment cMIP defines no act of its own (receipts are Money's,
    /// below); these acts stand for any act of a cMIP adopted for a task.
    fn cmip_act(&mut self, d: usize, cmip: Hash) -> Hash {
        let a = self.w.everyday_act(
            &mut self.c[d],
            cmip,
            0,
            vec![(Value::Uint(0), Value::Text("a receipt".into()))],
            None,
            None,
        );
        self.own(d, &a)
    }

    /// The label's payee pointer (Money type 0), on device `d`, naming
    /// these rail Modules: the rails it accepts (F115).
    fn pointer(&mut self, d: usize, version: u64, previous: Option<Hash>, rails: &[Hash]) -> Hash {
        let p = mor_core::money::Payload::PayeePointer(mor_core::money::PayeePointer {
            payee: self.col.id,
            version,
            previous,
            rails: rails
                .iter()
                .map(|m| mor_core::money::Rail {
                    module: *m,
                    address: b"an address".to_vec(),
                })
                .collect(),
        });
        let a = self.w.everyday_act(&mut self.c[d], mirs().money, 0, p.to_map(), None, None);
        self.own(d, &a)
    }

    /// A settlement receipt the label signs as payee (Money type 2), on
    /// device `d`, for a payment on the rail Module `rail`.
    fn money_receipt(&mut self, d: usize, rail: Hash) -> Hash {
        let r = mor_core::money::Payload::Receipt(mor_core::money::Receipt {
            rail,
            proof: vec![],
            payer: Some(mor_core::money::Payer::Identity(spec("a fan"))),
            payee: self.col.id,
            amount: mor_core::money::Amount {
                unit: spec("a unit"),
                value: 10,
            },
            fulfils: spec("an offer"),
            previous: None,
            forward: None,
            batch: None,
            purchase: None,
        });
        let a = self.w.everyday_act(&mut self.c[d], mirs().money, 2, r.to_map(), None, None);
        self.own(d, &a)
    }

    /// A publication of the label (Envelopes type 0), on device `d`.
    fn publish(&mut self, d: usize) -> Hash {
        let a = self.w.everyday_act(
            &mut self.c[d],
            mirs().envelopes,
            0,
            vec![(Value::Uint(0), Value::Text("a publication".into()))],
            None,
            None,
        );
        self.own(d, &a)
    }

    /// The label acknowledges an act by a witness act (Identity type 15),
    /// on device `d`: on neither chain, it adopts nothing (F142) and places
    /// nothing (F156).
    fn ack(&mut self, d: usize, x: Hash) -> Hash {
        self.w.ack(&mut self.c[d], x)
    }

    /// The label acknowledges an act by an action of its own key on device
    /// `d`, on its chain (an Agreements act, here a liveness on its founding
    /// agreement, type 12, in its format since Fable's A6; it may carry
    /// `acks`, F110):
    /// how it places a member's signature act before its next line
    /// ("Made before, made after", 2; C2, F156).
    fn acknowledge(&mut self, d: usize, x: Hash) -> Hash {
        let f = self.founding;
        let a = self.w.everyday_act(&mut self.c[d], agreements_spec(), 12, liveness(f), obj(f), Some(vec![x]));
        self.own(d, &a)
    }

    /// The same act citing no decision on the label's chain (naming there
    /// only its founding terms, which are not on it): an action on no chain
    /// of the label, which places nothing (rule 35b, F156).
    fn acknowledge_uncited(&mut self, d: usize, x: Hash) -> Hash {
        let f = self.founding;
        let cite = self.c[d].cite.replace((self.col.id, vec![f]));
        let a = self.w.everyday_act(&mut self.c[d], agreements_spec(), 12, liveness(f), obj(f), Some(vec![x]));
        self.c[d].cite = cite;
        self.w.add(&a)
    }

    /// The label adopts an act (rule 40, F142): an action of its own key on
    /// device `d`, on its chain, whose history holds the act (F131, IT2a).
    fn adopt(&mut self, d: usize, x: Hash) -> Hash {
        let o = self.chain(&[x]);
        let a = self.w.everyday_act(&mut self.c[d], ext(), 0, vec![], Some(o), None);
        let a = self.own(d, &a);
        // The Releases area reaches it: its holder signs, so it counts.
        self.sign(ANA, &a);
        a
    }

    /// A record on device `d`: a clone with the signature acts it names,
    /// the tips of the other devices given, and registrations.
    fn record(&mut self, d: usize, clone: Option<(Hash, Vec<Hash>)>, tips_of: &[usize], registers: Vec<Hash>, named: Hash) -> Hash {
        self.record_acking(d, clone, tips_of, registers, named, None)
    }

    /// A record that also acknowledges acts (Envelopes, `acks`).
    fn record_acking(
        &mut self,
        d: usize,
        clone: Option<(Hash, Vec<Hash>)>,
        tips_of: &[usize],
        registers: Vec<Hash>,
        named: Hash,
        acks: Option<Vec<Hash>>,
    ) -> Hash {
        let r = Record {
            clone: clone.as_ref().map(|c| c.0),
            signatures: clone.as_ref().map(|c| c.1.clone()),
            registers: (!registers.is_empty()).then_some(registers),
        };
        let named = clone.map(|c| c.0).unwrap_or(named);
        // A record is a decision: it cites on the label's chain the
        // decisions its device knows and the actions it saw, those of the
        // devices given and its own (rule 58).
        let mut devs: Vec<usize> = tips_of.to_vec();
        devs.push(d);
        let mut o = obj(named).unwrap();
        o.extend(self.line(&devs).into_iter().map(|x| Object { chain: self.col.id, predecessor: x }));
        let a = self.w.everyday_act(&mut self.c[d], mirs().agreements, agreements::types::RECORD, r.to_map(), Some(o), acks);
        let id = self.w.add(&a);
        // Every device's next action cites the decisions made so far under
        // the current key, as a device that heard of them (F127).
        for dev in self.c.iter_mut() {
            if let Some((_, ds)) = dev.cite.as_mut() {
                ds.push(id);
            }
        }
        id
    }

    /// A member's resignation, from a given device (a Person).
    fn resign_from(&mut self, dev: &mut Person, agreement: Hash, area: Option<u64>) -> Hash {
        self.resign_leaving(dev, agreement, area, vec![])
    }

    /// A resignation naming the drafts its signer leaves behind (F207).
    fn resign_leaving(&mut self, dev: &mut Person, agreement: Hash, area: Option<u64>, drafts: Vec<Hash>) -> Hash {
        let r = Resignation { agreement, area, drafts: sorted(drafts) };
        agreements_act(&mut self.w, dev, agreements::types::RESIGNATION, r.to_map(), obj(agreement))
    }

    /// The grantee acting for the label under its grant (rule 73): its own
    /// key, citing the grant on the label's chain.
    fn grantee(&self, grantee: &Person, grant: Hash) -> Person {
        grantee.acting_for(self.col.id, vec![grant])
    }

    /// The label's devices pass to member `to` (where Cy leaves): each keeps
    /// what it cites; its earlier acts stay in the line it sees.
    fn hand_over(&mut self, to: usize) {
        for (i, d) in self.c.iter_mut().enumerate() {
            let (col, ds) = d.cite.clone().expect("a device acting for the label");
            self.handed[i].extend(d.seq.iter().copied());
            *d = self.m[to].acting_for(col, ds);
        }
    }

    /// The label's line, as devices `devs` see it (rule 58): its latest
    /// identity-chain link, and those devices' actions for it (each citing,
    /// in turn, the decisions its device knew): what the label's kept tips
    /// held before its key was withdrawn.
    fn line(&self, devs: &[usize]) -> Vec<Hash> {
        let mut out: Vec<Hash> = vec![self.w.v.resolve(&self.col.id).links.last().expect("the label's chain").act];
        let v = self.view();
        for i in devs {
            for x in self.handed[*i].iter().chain(&self.c[*i].seq) {
                // An act this verifier does not hold is still the device's own,
                // and its client cites it.
                let names = self.w.v.get(x).is_none_or(|h| h.inside.objects.iter().flatten().any(|o| o.chain == self.col.id));
                // An act on no chain of the label is no head a client cites.
                let on_chain = !matches!(v.consent(x), Ok(Consent::Uncited { .. }));
                if names && on_chain && !out.contains(x) {
                    out.push(*x);
                }
            }
        }
        out
    }

    /// The grantee's acts under a grant of the label (rule 73): its own key,
    /// citing the grant on the label's chain.
    fn strand(&self, grant: Hash, grantee: &Person) -> Person {
        self.grantee(grantee, grant)
    }

    /// The label grants, on device 0.
    fn grant(&mut self, g: &Grant) -> Hash {
        let a = self.w.everyday_act(
            &mut self.c[0],
            mirs().agreements,
            agreements::types::GRANT,
            g.to_map(),
            None,
            None,
        );
        self.w.add(&a)
    }

    /// The label rotates (on device 0's key), declaring a clone with the
    /// signature acts named, keeping the tips of the devices given. Every
    /// device then signs with the new key.
    fn rotate(&mut self, decl: Option<(Hash, Vec<Hash>)>, tips_of: &[usize]) -> Hash {
        let ds = decl.map(|(k, s)| vec![agreements::clone_declaration(&mirs().agreements, &k, &s)]);
        self.rotate_with(ds, tips_of)
    }

    /// C7's recovery rotation (B16): it declares the clone taking the
    /// declared party out, with its signature acts, and names the signature
    /// acts on the declaration that it places (Flaw B18).
    fn recover(&mut self, k: Hash, sigs: Vec<Hash>, absence: Vec<Hash>, tips_of: &[usize]) -> Hash {
        let ds = vec![agreements::recovery_declaration(&mirs().agreements, &k, &sigs, &absence)];
        self.rotate_with(Some(ds), tips_of)
    }

    fn rotate_with(&mut self, declarations: Option<Vec<mor_core::identity::Declaration>>, tips_of: &[usize]) -> Hash {
        // A collective's rotation keeps no tip (rotation check 4): its
        // history is that of the signature acts its declaration names.
        let _ = tips_of;
        let (id, next) = self.w.rotate(
            &self.col,
            Rot {
                declarations,
                ..Default::default()
            },
        );
        self.col = next;
        for d in self.c.iter_mut() {
            let chain = d.cite.as_ref().map(|c| c.0);
            d.cite = chain.map(|c| (c, vec![id]));
        }
        id
    }
}

/// An act of `p` for the collective it acts for, held; its next act cites
/// it among the heads (rule 58, client conformance: a member's or
/// grantee's client cites its own last act for the collective).
fn act_for(w: &mut World, p: &mut Person, spec: Hash, type_: u64, payload: Vec<(Value, Value)>, objects: Option<Vec<Object>>) -> Hash {
    let a = w.everyday_act(p, spec, type_, payload, objects, None);
    let id = w.add(&a);
    if let Some((_, ds)) = p.cite.as_mut() {
        ds.push(id);
    }
    id
}

fn agreements_act(w: &mut World, p: &mut Person, type_: u64, payload: Vec<(Value, Value)>, objects: Option<Vec<Object>>) -> Hash {
    let a = w.everyday_act(p, mirs().agreements, type_, payload, objects, None);
    w.add(&a)
}

fn view(w: &World) -> AgreementsView<'_> {
    common::stand_in_payments(AgreementsView::new(&w.v, mirs()))
}

/// A fork's successor signs it as a member does, by a chain signature with
/// its own chain key (Identity type 16; Agreements draft 14, F303, N13).
fn successor_sign(w: &mut World, p: &mut Person, x: &Hash) -> Hash {
    let (id, q) = w.chain_sign(p, *x);
    *p = q;
    id
}

fn sign(w: &mut World, p: &mut Person, x: &Hash) -> Hash {
    agreements_act(w, p, agreements::types::SIGNATURE, agreements::signature_payload(x), obj(*x))
}

/// A mark's signers are ascending by hash (B8).
fn sorted(mut v: Vec<Hash>) -> Vec<Hash> {
    v.sort();
    v
}

/// An ending's `objects`: the agreement, and every earlier fork or
/// closing of the collective held, as a member's client names them (F131
/// IT1, client conformance; F132 U4b: a drafter names every ending they
/// signed); and its line, what it cites on the collective's chain (rule
/// 58): for the label, device 0's decisions and actions; for another
/// collective, [`col_line`].
fn ending_obj(lab: &Lab, ag: Hash, collective: Hash) -> Option<Vec<Object>> {
    let line = if collective == lab.col.id { lab.line(&[0]) } else { col_line(&lab.w, &collective) };
    ending_obj_at(lab, ag, collective, line)
}

/// An ending's `objects` at a given line.
fn ending_obj_at(lab: &Lab, ag: Hash, collective: Hash, line: Vec<Hash>) -> Option<Vec<Object>> {
    let mut o = obj(ag).unwrap();
    o.extend(lab.view().ending_acts(&collective).into_iter().map(|e| Object { chain: ag, predecessor: e }));
    o.extend(line.into_iter().map(|x| Object { chain: collective, predecessor: x }));
    Some(o)
}

/// A collective's line as a member's client sees it: its latest identity-
/// chain link, and every act held for it on its chain (endings aside).
fn col_line(w: &World, collective: &Hash) -> Vec<Hash> {
    let mut out = vec![w.v.resolve(collective).links.last().expect("a held identity").act];
    let ag = mirs().agreements;
    for h in w.v.held_acts() {
        let names = h.act.outside.signer != Some(*collective) && h.inside.objects.iter().flatten().any(|o| &o.chain == collective);
        let ending = h.inside.spec == ag && (h.inside.type_ == agreements::types::FORK || h.inside.type_ == agreements::types::CLOSING);
        if names && !ending && h.inside.spec != mirs().identity {
            out.push(h.id);
        }
    }
    out
}

fn device(p: &Person) -> Person {
    let mut d = p.clone();
    d.seq = vec![];
    d
}

fn areas(c: &Consent) -> Vec<(u64, bool, bool, Vec<Hash>)> {
    match c {
        Consent::Areas { areas, .. } => areas
            .iter()
            .map(|a| (a.area, a.frozen, a.met, a.signers.clone()))
            .collect(),
        other => panic!("no area reaches it: {other:?}"),
    }
}

fn puts(lab: &Lab, r: &Hash) -> Option<Hash> {
    lab.view().record(&lab.col.id, r).unwrap().puts
}

fn clone_state(lab: &Lab, r: &Hash) -> CloneState {
    lab.view().record(&lab.col.id, r).unwrap().clone.unwrap().1
}

fn words(t: &mut Terms, area: u64, w: &str) {
    let mut v = t.area_words.clone().unwrap_or_default();
    v.retain(|(i, _)| *i != area);
    v.push((area, w.into()));
    v.sort_by_key(|(i, _)| *i);
    t.area_words = Some(v);
}

// ---------------------------------------------------------------- founding, areas, lanes

/// 3.2, Q11: founding terms a founder has not signed found nothing.
#[test]
fn a_collective_exists_only_when_every_founder_signed() {
    let mut lab = Lab::with(&|_| {}, false);
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    assert!(matches!(lab.consent(&p), Consent::Broken { .. }));
    assert_eq!(lab.view().agreement(&lab.founding).unwrap().exists, Some(false));
    let f = lab.founding;
    lab.sign(CY, &f);
    assert!(lab.counts(&p), "once the third founder signs");
}

/// 3.7c, 3.7g, Q16, F106: acts fall in the lanes the label's own terms give.
#[test]
fn acts_fall_in_the_lanes_the_terms_give() {
    let mut lab = Lab::new(&|_| {});
    let (ana, ben) = (lab.m[ANA].id, lab.m[BEN].id);
    // A publication: the release manager's.
    let p = lab.publish(0);
    assert_eq!(areas(&lab.consent(&p)), vec![(1, false, false, vec![])]);
    lab.sign(BEN, &p);
    lab.sign(CY, &p);
    assert!(!lab.counts(&p), "signed by the two others, not the manager");
    lab.sign(ANA, &p);
    assert_eq!(areas(&lab.consent(&p)), vec![(1, false, true, vec![ana])]);
    // A receipt of the payment cMIP named for task 6: the treasurer's.
    let r = lab.cmip_act(0, pay());
    assert!(!lab.counts(&r));
    lab.sign(BEN, &r);
    assert_eq!(areas(&lab.consent(&r)), vec![(2, false, true, vec![ben])]);
    // A cMIP the terms name nowhere: counts for nothing (Q16).
    let x = lab.cmip_act(0, pay2());
    lab.sign(BEN, &x);
    assert!(matches!(lab.consent(&x), Consent::Unadopted { .. }));
    // An act of the adopted extension: the Development lane's (F106).
    let e = lab.cmip_act(0, ext());
    lab.sign(ANA, &e);
    assert_eq!(areas(&lab.consent(&e)), vec![(1, false, true, vec![ana])]);
    // In a collective with no area, the payment cMIP's act counts under
    // the rule for Money (rule 60), here any one member: Cy's own act; one
    // of a cMIP named nowhere still falls in no layer, and counts for
    // nothing (rule 60, "Layer").
    let mut plain = Lab::new(&|t| {
        t.areas = None;
        t.area_words = None;
    });
    let cy = plain.m[CY].id;
    let x = plain.cmip_act(0, pay());
    assert_eq!(areas(&plain.consent(&x)), vec![(agreements::lane_id(agreements::layers::MONEY), false, true, vec![cy])]);
    let y = plain.cmip_act(0, pay2());
    assert!(matches!(plain.consent(&y), Consent::Unadopted { .. }));
    // An identity declaring no agreement is not a collective.
    let mut solo = plain.w.genesis("solo", vec![own_home()], None, None);
    let post = plain.w.post(&mut solo, "hello");
    assert_eq!(plain.view().consent(&post).unwrap(), Consent::NotCollective);
}

/// 3.7g, F115 (suite v21): the label's receipts are Money acts, in the
/// treasurer's lane. A receipt on a rail the label's pointer names counts
/// with the treasurer's signature; one on a rail it never named counts for
/// nothing, signed or not; a pointer the treasurer never signed accepts
/// nothing.
#[test]
fn receipts_count_only_on_rails_the_collective_named() {
    let mut lab = Lab::new(&|_| {});
    let ben = lab.m[BEN].id;
    let (ln, chain) = (spec("a Lightning rail Module"), spec("an on-chain rail Module"));
    // A receipt before any pointer: the label accepted no rail.
    let early = lab.money_receipt(0, ln);
    lab.sign(BEN, &early);
    assert!(matches!(lab.consent(&early), Consent::RailNotAccepted { rail, .. } if rail == ln));
    // The label's pointer naming Lightning, not yet signed by the treasurer:
    // it does not count, so it accepts nothing.
    let p1 = lab.pointer(0, 1, None, &[ln]);
    assert!(!lab.counts(&p1));
    assert!(matches!(lab.consent(&early), Consent::RailNotAccepted { .. }));
    // The treasurer signs it: the Lightning receipt counts with him.
    lab.sign(BEN, &p1);
    assert!(lab.counts(&p1));
    assert_eq!(areas(&lab.consent(&early)), vec![(2, false, true, vec![ben])]);
    let r = lab.money_receipt(0, ln);
    assert!(!lab.counts(&r), "the treasurer has not signed it");
    lab.sign(BEN, &r);
    assert!(lab.counts(&r));
    // A receipt on a rail the label never named: nothing, signed or not.
    let x = lab.money_receipt(0, chain);
    lab.sign(BEN, &x);
    assert!(matches!(lab.consent(&x), Consent::RailNotAccepted { rail, .. } if rail == chain));
    assert!(!lab.counts(&x));
    // A new pointer (the treasurer's signature alone, no clone) adds the
    // on-chain rail: now it counts.
    let p2 = lab.pointer(0, 2, Some(p1), &[ln, chain]);
    lab.sign(BEN, &p2);
    assert!(lab.counts(&x));
}

/// 3.7g, rule 37c, A2, F109: the treasurer adopts a payment cMIP alone;
/// the label records it at once; the record's place decides.
#[test]
fn the_treasurer_adopts_a_cmip_and_the_record_places_it() {
    // The rule for Money (field 19): the treasurer's, `[2, [ben]]`.
    let mut lab = Lab::new(&money_is_bens);
    let f = lab.founding;
    let before = lab.cmip_act(0, pay2());
    let in_tip = lab.cmip_act(1, pay2());
    let third = lab.cmip_act(2, pay2());
    let money = Power::Layer(agreements::layers::MONEY);
    let k = lab.clone_terms(&f, vec![(money.clone(), vec![BEN])], &|t| {
        t.cmips = vec![(6, pay2()), (11, anchor())];
    });
    let k = lab.propose(BEN, &k);
    let a = lab.view().agreement(&k).unwrap();
    assert_eq!(a.needs, Some(vec![money.clone()]));
    assert!(!a.ready);
    let sk = lab.sign(BEN, &k);
    assert!(lab.view().agreement(&k).unwrap().ready);
    for x in [before, in_tip] {
        lab.sign(BEN, &x);
    }
    let rec = lab.record(0, Some((k, vec![sk])), &[1], vec![], k);
    assert_eq!(puts(&lab, &rec), Some(k), "no clone rule, no rotation");
    let after = lab.cmip_act(0, pay2());
    lab.sign(BEN, &after);
    let later_b = lab.cmip_act(1, pay2());
    lab.sign(BEN, &later_b);
    lab.sign(BEN, &third);
    // Before the record, in its own sequence or a tip's ancestry: under the
    // founding agreement, where the cMIP is unadopted.
    assert!(matches!(lab.consent(&before), Consent::Unadopted { .. }));
    assert!(matches!(lab.consent(&in_tip), Consent::Unadopted { .. }));
    // After it, citing it: under the clone, with the treasurer's signature.
    for x in [after, later_b] {
        assert_eq!(lab.in_force(&x), k);
        assert!(lab.counts(&x));
    }
    // F127: an act signed on a device that had not heard of the record is
    // judged under the decision it cites, the founding agreement, where the
    // cMIP was unadopted: it was not within its signer's powers, and a
    // record it never cited does not rescue it (B2's "a concurrent record
    // counts" now holds for records alone). A payer's acknowledgement
    // changes nothing (Flaw G).
    let mut payer = lab.w.genesis("payer", vec![own_home()], None, None);
    lab.w.ack(&mut payer, third);
    assert_eq!(lab.in_force(&third), f);
    assert!(matches!(lab.consent(&third), Consent::Unadopted { .. }));

    // A2: a record names its signatures. Ben's next clone is recorded with
    // Cy's signature only: a draft there; Ben's signature arriving later
    // completes nothing at that record.
    let k2 = lab.clone_terms(&k, vec![(money.clone(), vec![BEN])], &|t| {
        t.cmips = vec![(6, pay3()), (11, anchor())];
    });
    let k2 = lab.propose(BEN, &k2);
    let sc = lab.sign(CY, &k2);
    let r2 = lab.record(0, Some((k2, vec![sc])), &[1, 2], vec![], k2);
    assert!(matches!(clone_state(&lab, &r2), CloneState::Draft(_)));
    let sb = lab.sign(BEN, &k2);
    assert_eq!(puts(&lab, &r2), None);
    let r3 = lab.record(0, Some((k2, vec![sb])), &[1, 2], vec![], k2);
    assert_eq!(puts(&lab, &r3), Some(k2));
    // A record of a clone whose parent is no longer in force: nothing.
    let r4 = lab.record(0, Some((k, vec![sk])), &[1, 2], vec![], k);
    assert_eq!(puts(&lab, &r4), None);
    let x = lab.cmip_act(0, pay3());
    lab.sign(BEN, &x);
    assert_eq!(lab.in_force(&x), k2);
    // A record naming an act that is no signature on the clone: invalid.
    let k3 = lab.clone_terms(&k2, vec![(Power::Area(2), vec![BEN])], &|t| words(t, 2, "Weekly."));
    let k3 = lab.propose(BEN, &k3);
    lab.sign(BEN, &k3);
    let r5 = lab.record(0, Some((k3, vec![sb])), &[1, 2], vec![], k3);
    assert!(matches!(clone_state(&lab, &r5), CloneState::Invalid(_)));
}

/// 3.7b, 3.7d, 3.7e, 3.7f, 3.7l: marks are checked; powers are exclusive.
#[test]
fn false_marks_sink_clones_and_areas_are_exclusive() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    // 3.7b: the clone rule rewritten by two, marked as a clone-rule change.
    let ids = lab.ids();
    let t = lab.clone_terms(&f, vec![(Power::Clone, vec![ANA, BEN])], &|t| {
        t.clone = Rule::Named(vec![ids[ANA], ids[BEN]]);
    });
    let k = lab.propose(ANA, &t);
    lab.sign(ANA, &k);
    lab.sign(BEN, &k);
    assert!(lab.view().agreement(&k).unwrap().invalid.is_some());
    // Marked as constitutional, naming all three: a draft without Cy.
    let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|t| {
        t.clone = Rule::Named(vec![ids[ANA], ids[BEN]]);
    });
    let k = lab.propose(ANA, &t);
    let s1 = lab.sign(ANA, &k);
    let s2 = lab.sign(BEN, &k);
    let a = lab.view().agreement(&k).unwrap();
    assert!(a.invalid.is_none() && !a.ready);
    // A record never puts a constitutional clone in force.
    let r = lab.record(0, Some((k, vec![s1, s2])), &[], vec![], k);
    assert_eq!(puts(&lab, &r), None);

    // 3.7d: keepers changed under the manager's area power: invalid.
    let kp = lab.keeper.id;
    let t = lab.clone_terms(&f, vec![(Power::Area(1), vec![ANA])], &|t| {
        t.keepers = Some(Keepers {
            operators: vec![kp, ids[CY]],
            rule: Rule::Threshold(1),
        });
    });
    let k = lab.propose(ANA, &t);
    assert!(lab.view().agreement(&k).unwrap().invalid.is_some());
    // The manager's area changed under the clone rule by the two others.
    let t = lab.clone_terms(&f, vec![(Power::Clone, vec![BEN, CY])], &|t| words(t, 1, "Mondays."));
    let k = lab.propose(BEN, &t);
    assert!(lab.view().agreement(&k).unwrap().invalid.is_some(), "the area is hers alone (Q5)");

    // 3.7e: two areas at once: each holder.
    let t = lab.clone_terms(
        &f,
        vec![(Power::Area(1), vec![ANA]), (Power::Area(2), vec![BEN])],
        &|t| {
            words(t, 1, "Mondays.");
            words(t, 2, "Weekly.");
        },
    );
    let k = lab.propose(ANA, &t);
    let sa = lab.sign(ANA, &k);
    let r = lab.record(0, Some((k, vec![sa])), &[], vec![], k);
    assert!(matches!(clone_state(&lab, &r), CloneState::Draft(_)));
    let sb = lab.sign(BEN, &k);
    let r = lab.record(0, Some((k, vec![sa, sb])), &[], vec![], k);
    assert_eq!(puts(&lab, &r), Some(k), "in force at once, no rotation (Q7, Q8)");

    // 3.7f (F121): two of three change the arbitrator: the judicial tier
    // needs every member, so two never meet it; the clone rule is not the
    // power for it either.
    let t = lab.clone_terms(&k, vec![(Power::Clone, vec![ANA, BEN])], &|t| {
        t.arbitrators = Some(vec![spec("a friendlier arbitrator")]);
    });
    let k2 = lab.propose(ANA, &t);
    assert!(lab.view().agreement(&k2).unwrap().invalid.is_some());
    let t = lab.clone_terms(&k, vec![(Power::Judicial, vec![ANA, BEN])], &|t| {
        t.arbitrators = Some(vec![spec("a friendlier arbitrator")]);
    });
    let k2 = lab.propose(ANA, &t);
    let s1 = lab.sign(ANA, &k2);
    let s2 = lab.sign(BEN, &k2);
    let r = lab.record(0, Some((k2, vec![s1, s2])), &[], vec![], k2);
    assert_eq!(puts(&lab, &r), None, "two of three never change a judge");
    let t = lab.clone_terms(&k, vec![(Power::Judicial, vec![ANA, BEN, CY])], &|t| {
        t.arbitrators = Some(vec![spec("a friendlier arbitrator")]);
    });
    let k2 = lab.propose(ANA, &t);
    let s1 = lab.sign(ANA, &k2);
    let s2 = lab.sign(BEN, &k2);
    let r = lab.record(0, Some((k2, vec![s1, s2])), &[], vec![], k2);
    assert!(matches!(clone_state(&lab, &r), CloneState::Draft(_)), "a draft until Cy signs");
    let s3 = lab.sign(CY, &k2);
    let r = lab.record(0, Some((k2, vec![s1, s2, s3])), &[], vec![], k2);
    assert_eq!(puts(&lab, &r), Some(k2), "one version, for everyone");

    // 3.7l, Q12: the manager's words and the keepers: both powers.
    let t = lab.clone_terms(&k2, vec![(Power::Area(1), vec![ANA])], &|t| {
        words(t, 1, "Tuesdays.");
        t.keepers = None;
    });
    let k3 = lab.propose(ANA, &t);
    assert!(lab.view().agreement(&k3).unwrap().invalid.is_some());
    let t = lab.clone_terms(
        &k2,
        vec![(Power::Judicial, vec![ANA, BEN, CY]), (Power::Area(1), vec![ANA])],
        &|t| {
            words(t, 1, "Tuesdays.");
            t.keepers = None;
        },
    );
    let k3 = lab.propose(ANA, &t);
    let s: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &k3)).collect();
    let r = lab.record(0, Some((k3, s)), &[], vec![], k3);
    assert_eq!(puts(&lab, &r), Some(k3));
}

// ---------------------------------------------------------------- departures and lines

/// 3.7 and 7o, Flaws E, F and G, C1, C2, Q23 (ordering stories
/// `flaw_e_and_f_forgotten_devices`, `flaw_f_completed_clone_stays_complete`,
/// `flaw_g_friend_ack_places_nothing`, `choice_late_completion`,
/// `q23_signature_placed_before_leaving`).
#[test]
fn a_departure_takes_effect_at_the_labels_line() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let ben_phone = lab.m[BEN].clone();
    let mut ben_laptop = device(&ben_phone);
    let mut ben_tablet = device(&ben_phone);

    let x1 = lab.cmip_act(0, pay());
    lab.sign(BEN, &x1); // phone
    let x2 = lab.cmip_act(0, pay());
    sign(&mut lab.w, &mut ben_tablet, &x2); // tablet, never mentioned

    // A clone signed from the tablet, recorded before the line (Flaw F).
    let t = lab.clone_terms(&f, vec![(Power::Area(2), vec![BEN])], &|t| words(t, 2, "Weekly."));
    let k = lab.propose(BEN, &t);
    let sk = sign(&mut lab.w, &mut ben_tablet, &k);
    let r0 = lab.record(0, Some((k, vec![sk])), &[], vec![], k);
    assert_eq!(puts(&lab, &r0), Some(k));

    // Q23 and C2: a judicial clone, every member (F121); Ben signs and the
    // label acknowledges it as it arrives.
    let t = lab.clone_terms(&k, vec![(Power::Judicial, vec![ANA, BEN, CY])], &|t| {
        t.arbitrators = Some(vec![spec("arbitrator two")]);
    });
    let k2 = lab.propose(CY, &t);
    let sb2 = sign(&mut lab.w, &mut ben_tablet, &k2);
    lab.acknowledge(0, sb2);

    // Ben resigns, from the laptop.
    let res = lab.resign_from(&mut ben_laptop, k, None);
    // Between the resignation and the line, his signature still counts.
    let x3 = lab.cmip_act(0, pay());
    lab.sign(BEN, &x3);
    let pending = lab.cmip_act(0, pay());
    // The label's line.
    let line = lab.record(0, None, &[], vec![res], k);
    let e = lab.view().record(&lab.col.id, &line).unwrap();
    assert!(e.line && e.registers.len() == 1);

    let x4 = lab.cmip_act(0, pay());
    let s4 = sign(&mut lab.w, &mut ben_tablet, &x4);
    for x in [x1, x2, x3] {
        assert!(lab.counts(&x), "before the line, from any device");
    }
    let c4 = lab.consent(&x4);
    assert_eq!(areas(&c4), vec![(2, true, false, vec![])], "after: the lane is frozen");
    // C1: Ben completes, after the line, a receipt the label signed before it.
    assert!(!lab.counts(&pending));
    lab.sign(BEN, &pending);
    assert!(lab.counts(&pending), "the act was drafted with him in it");
    // Flaw G: a friend's acknowledgement places nothing.
    let mut friend = lab.w.genesis("friend", vec![own_home()], None, None);
    lab.w.ack(&mut friend, s4);
    assert!(!lab.counts(&x4));
    // The completed clone stays complete.
    assert_eq!(lab.in_force(&x4), k);

    // C2: Ana and Cy sign after the line; a record names all three: Ben
    // counts as a voice for it, the label having acknowledged his
    // signature first.
    let sa2 = lab.sign(ANA, &k2);
    let sc2 = lab.sign(CY, &k2);
    let r2 = lab.record(0, Some((k2, vec![sa2, sb2, sc2])), &[], vec![], k2);
    assert_eq!(puts(&lab, &r2), Some(k2), "{:?} {:?}", clone_state(&lab, &r2), lab.view().record(&lab.col.id, &r2).unwrap());
    // A third clone Ben signed but the label never acknowledged, recorded
    // after the line: his signature counts toward nothing.
    let t = lab.clone_terms(&k2, vec![(Power::Judicial, vec![ANA, BEN, CY])], &|t| {
        t.arbitrators = Some(vec![spec("arbitrator three")]);
    });
    let k3 = lab.propose(CY, &t);
    let sa3 = lab.sign(ANA, &k3);
    let sb3 = sign(&mut lab.w, &mut ben_tablet, &k3);
    let sc3 = lab.sign(CY, &k3);
    let r3 = lab.record(0, Some((k3, vec![sa3, sb3, sc3])), &[], vec![], k3);
    assert!(matches!(clone_state(&lab, &r3), CloneState::Invalid(_)));
    // ... and the clone needs the voices that remain: Ana and Cy.
    let t = lab.clone_terms(&k2, vec![(Power::Judicial, vec![ANA, CY])], &|t| {
        t.arbitrators = Some(vec![spec("arbitrator three")]);
    });
    let k3 = lab.propose(CY, &t);
    let sa = lab.sign(ANA, &k3);
    let sc = lab.sign(CY, &k3);
    let r3 = lab.record(0, Some((k3, vec![sa, sc])), &[], vec![], k3);
    assert_eq!(puts(&lab, &r3), Some(k3));
}

/// Q36: a record whose clone is not complete still registers the departure.
#[test]
fn a_records_registrations_stand_without_its_clone() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let t = lab.clone_terms(&f, vec![(Power::Area(1), vec![ANA])], &|t| words(t, 1, "Mondays."));
    let k = lab.propose(ANA, &t);
    let sc = lab.sign(CY, &k);
    let mut ben = lab.m[BEN].clone();
    let res = lab.resign_from(&mut ben, f, None);
    let line = lab.record(0, Some((k, vec![sc])), &[], vec![res], k);
    let e = lab.view().record(&lab.col.id, &line).unwrap();
    assert!(e.line && e.puts.is_none());
    let x = lab.cmip_act(0, pay());
    lab.sign(BEN, &x);
    assert!(!lab.counts(&x));
}

/// 3.7, Flaw M, F100: the remaining members rotate and declare a clone
/// without the departed member, naming the signature acts that complete it.
#[test]
fn a_rotation_declares_the_membership_clone_with_its_signatures() {
    for name_all in [false, true] {
        let mut lab = Lab::new(&|_| {});
        let f = lab.founding;
        let mut ben = lab.m[BEN].clone();
        let res = lab.resign_from(&mut ben, f, None);
        lab.record(0, None, &[], vec![res], f);
        let before = lab.publish(0);
        lab.sign(ANA, &before);
        let mut dee = lab.w.genesis("dee", vec![own_home()], None, None);
        let ids = lab.ids();
        let new = vec![ids[ANA], ids[CY], dee.id];
        let auth = lab.authority.id;
        let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, CY])], &|t| {
            t.parties = new.clone();
            let g = t.grammar.as_mut().unwrap();
            g.chain_key = Holding::Shares {
                threshold: 3,
                members: new.clone(),
            };
            g.recovery = Some(Recovery::Escrow { authority: auth });
            t.areas.as_mut().unwrap()[1].holders = vec![new[2]];
        });
        let k = lab.propose(ANA, &t);
        let sa = lab.sign(ANA, &k);
        let sc = lab.sign(CY, &k);
        let sd = lab.sign_by(&mut dee, &k);
        let named = if name_all { vec![sa, sc, sd] } else { vec![sa, sc] };
        lab.rotate(Some((k, named)), &[0]);
        let p = lab.publish(0);
        lab.sign(ANA, &p);
        if !name_all {
            // Dee's signature was not named: nothing is in force, and the
            // later arrival of nothing new changes that.
            assert!(matches!(lab.consent(&p), Consent::Broken { .. }));
            continue;
        }
        assert_eq!(lab.in_force(&p), k);
        assert!(lab.counts(&p));
        // The release before the rotation still counts, under the founding.
        assert!(lab.counts(&before));
        // A receipt is now Dee's.
        let r = lab.cmip_act(0, pay());
        lab.sign(BEN, &r);
        assert!(!lab.counts(&r));
        sign(&mut lab.w, &mut dee, &r);
        assert!(lab.counts(&r));
    }
}

/// 3.7k, flaw C, Q23 under three of three (ordering story
/// `q23_signature_placed_before_leaving`), with a resignation; the
/// declaration itself is in `a_declaration_removes_a_voice_at_the_labels_line`.
#[test]
fn a_number_never_asks_for_more_voices_than_remain() {
    for acked in [true, false] {
        for mark in [vec![ANA, BEN, CY], vec![BEN, CY]] {
            let mut lab = Lab::new(&|t| t.constitutional = Some(Rule::Threshold(3)));
            let f = lab.founding;
            let t = lab.clone_terms(&f, vec![(Power::Constitutional, mark.clone())], &|t| {
                t.text = "The label publishes records and books.".into();
            });
            let k = lab.propose(BEN, &t);
            let sa = lab.sign(ANA, &k);
            if acked {
                lab.acknowledge(0, sa);
            }
            let mut ana = lab.m[ANA].clone();
            let res = lab.resign_from(&mut ana, f, None);
            lab.record(0, None, &[], vec![res], f);
            let sb = lab.sign(BEN, &k);
            let sc = lab.sign(CY, &k);
            let named = if mark.len() == 3 { vec![sa, sb, sc] } else { vec![sb, sc] };
            lab.rotate(Some((k, named)), &[0]);
            let x = lab.cmip_act(0, pay());
            lab.sign(BEN, &x);
            let ok = !matches!(lab.consent(&x), Consent::Broken { .. });
            // Acknowledged: three voices, all three named meet it; two do not.
            // Not acknowledged: two voices remain, and both meet it.
            let expect = if acked { mark.len() == 3 } else { mark.len() == 2 };
            assert_eq!(ok, expect, "acked {acked}, mark {mark:?}");
        }
    }
}

/// 3.7i, Q6: a constitution of two of three removes a member who does not
/// sign.
#[test]
fn a_member_removed_where_the_constitution_allows_it() {
    let mut lab = Lab::new(&|t| t.constitutional = Some(Rule::Threshold(2)));
    let f = lab.founding;
    let ids = lab.ids();
    let keep = vec![ids[ANA], ids[BEN]];
    let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN])], &|t| {
        t.parties = keep.clone();
        t.constitutional = Some(Rule::Threshold(2));
        let g = t.grammar.as_mut().unwrap();
        g.chain_key = Holding::Shares {
            threshold: 2,
            members: keep.clone(),
        };
    });
    let k = lab.propose(ANA, &t);
    let sa = lab.sign(ANA, &k);
    let sb = lab.sign(BEN, &k);
    lab.rotate(Some((k, vec![sa, sb])), &[0]);
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    assert_eq!(lab.in_force(&p), k);
    assert!(lab.counts(&p));
}

/// F121 (freeze suite v21, 3.7q): a member removed keeps their stake as a
/// departed holder: the entry records who left and their stake, nothing
/// else. The departed holder has no voice; the stake never shrinks without
/// the holder's signature (rule 46).
#[test]
fn a_departed_holders_stake_never_shrinks_without_them() {
    let mut lab = Lab::new(&|t| {
        t.constitutional = Some(Rule::Threshold(2));
        // Founded with the shares Cy leaves with: removing Cy pays Cy no less.
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 375_000), (p[BEN], 375_000), (p[CY], 250_000)])]);
    });
    let f = lab.founding;
    let ids = lab.ids();
    let cy = ids[CY];
    let keep = vec![ids[ANA], ids[BEN]];
    // The label's stake in itself (null, S1): Ana, Ben, and Cy at `share`.
    let (ana, ben) = (ids[ANA], ids[BEN]);
    let own = move |share: u64| agreements::Stake {
        object: Who::This,
        holders: vec![(Who::Id(ana), 1_000_000 - share - 375_000), (Who::Id(ben), 375_000), (Who::Id(cy), share)],
    };
    let out = |share: u64| -> Box<dyn Fn(&mut Terms)> {
        let keep = keep.clone();
        Box::new(move |t: &mut Terms| {
            t.parties = keep.clone();
            t.constitutional = Some(Rule::Threshold(2));
            let g = t.grammar.as_mut().unwrap();
            g.chain_key = Holding::Shares { threshold: 2, members: keep.clone() };
            t.stakes = Some(vec![own(share)]);
            t.departed = Some(vec![cy]);
        })
    };
    // Cy removed, keeping a quarter of the label's income.
    let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN])], &*out(250_000));
    let k = lab.propose(ANA, &t);
    let sa = lab.sign(ANA, &k);
    let sb = lab.sign(BEN, &k);
    lab.rotate(Some((k, vec![sa, sb])), &[0]);
    // Cy's devices act for the label no more: Ben's do.
    lab.hand_over(BEN);
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    assert_eq!(lab.in_force(&p), k);
    // No voice: a mark naming the departed holder is invalid.
    let t = lab.clone_terms(&k, vec![(Power::Constitutional, vec![ANA, CY])], &|t| t.text = "Other words.".into());
    let x = lab.propose(ANA, &t);
    assert!(lab.view().agreement(&x).unwrap().invalid.is_some());
    // The two members lower Cy's stake (field 7, N5): without Cy's
    // signature, a draft (rule 46). Stakes are operational: the clone rule.
    let lower = move |share: u64| -> Box<dyn Fn(&mut Terms)> { Box::new(move |t: &mut Terms| t.stakes = Some(vec![own(share)])) };
    let t = lab.clone_terms(&k, vec![(Power::Clone, vec![ANA, BEN])], &*lower(100_000));
    let k2 = lab.propose(ANA, &t);
    let s1 = lab.sign(ANA, &k2);
    let s2 = lab.sign(BEN, &k2);
    assert!(!lab.view().agreement(&k2).unwrap().ready, "Cy has not signed");
    let r = lab.record(0, Some((k2, vec![s1, s2])), &[], vec![], k2);
    assert_eq!(puts(&lab, &r), None, "nothing in force without Cy");
    // Raising it needs no signature of Cy's (Ana's share is lowered: hers).
    let t = lab.clone_terms(&k, vec![(Power::Clone, vec![ANA, BEN])], &*lower(300_000));
    let k3 = lab.propose(ANA, &t);
    lab.sign(ANA, &k3);
    lab.sign(BEN, &k3);
    assert!(lab.view().agreement(&k3).unwrap().ready);
    // Lowered with Cy's signature named too: in force.
    let t = lab.clone_terms(&k, vec![(Power::Clone, vec![ANA, BEN])], &*lower(100_000));
    let k4 = lab.propose(ANA, &t);
    let s1 = lab.sign(ANA, &k4);
    let s2 = lab.sign(BEN, &k4);
    let s3 = lab.sign(CY, &k4);
    assert!(lab.view().agreement(&k4).unwrap().ready);
    let r = lab.record(0, Some((k4, vec![s1, s2, s3])), &[], vec![], k4);
    assert_eq!(puts(&lab, &r), Some(k4));
}

// ---------------------------------------------------------------- areas, freezes, grants

/// 3.7c, 3.7m, Q13, Q17, Q22, Flaw N, A6; F128 (grant keys, G2, replacing
/// C8): a grant hands its grantee a grant key, accepted by the grantee's
/// signature; the grantee's acts are a strand of the label's actions chain,
/// citing their grant. A departure that empties the area ends every grant
/// in it, a decision ending powers: an act the line's history holds
/// binds; one racing it, or after it, is void, the ending winning; one the
/// label acknowledged binds (A6). Reinstating is cloning the ended grant,
/// which takes nothing on.
#[test]
fn an_emptied_area_ends_its_grants() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let env = mirs().envelopes;
    let mut publisher = lab.w.genesis("publisher", vec![own_home()], None, None);
    let mut agent = lab.w.genesis("agent", vec![own_home()], None, None);
    let pubs = Kind::Type { spec: env, type_: 0 };
    let g = |who: Hash| Grant {
        grantee: who,
        scope: 2,
        agreements: None,
        limits: None,
        limits_cmip: None,
        area: Some(1),
        kinds: Some(vec![pubs.clone()]),
        reinstates: None,
        key: None,
    };
    let g1 = lab.grant(&g(publisher.id));
    lab.sign(ANA, &g1);
    let g2 = lab.grant(&g(agent.id));
    lab.sign(ANA, &g2);
    // A grant reaching Money acts, outside the area: invalid (3.7c).
    let mut bad = g(publisher.id);
    bad.kinds = Some(vec![Kind::Layer(agreements::layers::MONEY)]);
    let g3 = lab.grant(&bad);
    lab.sign(ANA, &g3);
    assert!(matches!(lab.consent(&g3), Consent::Invalid { .. }));

    let mut pubs_strand = lab.strand(g1, &publisher);
    let mut agent_strand = lab.strand(g2, &agent);
    let under = |lab: &mut Lab, st: &mut Person, spec: Hash| -> Hash { act_for(&mut lab.w, st, spec, 0, vec![], None) };
    // Not yet accepted by its grantee: the key backs nothing (F128).
    let early = under(&mut lab, &mut pubs_strand, env);
    assert!(matches!(lab.view().backing(&early).unwrap(), Backing::NotBacked { reason, .. } if reason.contains("accept")));
    sign(&mut lab.w, &mut publisher, &g1);
    sign(&mut lab.w, &mut agent, &g2);
    let p1 = under(&mut lab, &mut pubs_strand, env);
    assert_eq!(lab.view().backing(&p1).unwrap(), Backing::Backed { grant: g1 });
    assert!(matches!(lab.consent(&p1), Consent::Granted { .. }));
    // Not citing its grant: on no chain of the label, not backed.
    let loose = {
        let mut st = lab.strand(g1, &publisher);
        st.cite = None;
        let a = lab.w.everyday_act(&mut st, env, 0, publication(vec![]), None, None);
        lab.w.add(&a)
    };
    assert_eq!(lab.view().backing(&loose).unwrap(), Backing::NotUnderGrant, "it names no grantor's chain (rule 80)");
    // Signed with another key than the grant's: not the label's act.
    let forged = {
        let mut st = lab.strand(g1, &agent);
        let a = lab.w.everyday_act(&mut st, env, 0, publication(vec![]), None, None);
        lab.w.add(&a)
    };
    assert_eq!(lab.view().backing(&forged).unwrap(), Backing::NotUnderGrant);
    assert_eq!(lab.w.v.status(&forged), Status::Valid, "the agent's own act, under Identity");
    // Another publication, which the label's next act cites as the head it
    // joins (F127).
    let joined = under(&mut lab, &mut pubs_strand, env);
    let o = lab.chain(&[joined]);
    let a = lab.w.everyday_act(&mut lab.c[0], pay(), 0, vec![], Some(o), None);
    lab.w.add(&a);
    // An act beyond the grant's reach is not backed.
    let off = {
        let mut st = lab.strand(g1, &publisher);
        let a = lab.w.everyday_act(&mut st, pay(), 0, vec![], None, None);
        lab.w.add(&a)
    };
    assert!(matches!(lab.view().backing(&off).unwrap(), Backing::NotBacked { .. }));
    // The agent's deals A, B, C, on the agent's strand; the label
    // acknowledges B.
    let mut agent2 = agent_strand.clone();
    let da = under(&mut lab, &mut agent_strand, env);
    let db = under(&mut lab, &mut agent2, env);
    let mut agent3 = lab.strand(g2, &agent);
    let dc = under(&mut lab, &mut agent3, env);
    lab.adopt(0, db);

    // Ana steps down at once; the label registers it: the area is empty,
    // and every grant in it ends (G2).
    let mut ana = lab.m[ANA].clone();
    let res = lab.resign_from(&mut ana, f, Some(1));
    lab.m[ANA] = ana;
    lab.record(0, None, &[], vec![res], f);
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    assert_eq!(areas(&lab.consent(&p)), vec![(1, true, false, vec![])]);
    let dd = under(&mut lab, &mut agent_strand, env);
    let p2 = under(&mut lab, &mut pubs_strand, env);
    let v = lab.view();
    assert_eq!(v.backing(&db).unwrap(), Backing::Binds { grant: g2 }, "A6");
    for d in [da, dc, dd] {
        assert!(matches!(v.backing(&d).unwrap(), Backing::NotBacked { ref reason, .. } if reason.contains("G2")), "{d:?}");
    }
    // Done within the grant's powers, and held by the history of the line
    // that emptied the area: it binds. So does what comes before it on the
    // same strand.
    assert_eq!(v.backing(&joined).unwrap(), Backing::Binds { grant: g1 });
    assert_eq!(v.backing(&p1).unwrap(), Backing::Binds { grant: g1 });
    assert!(matches!(v.backing(&p2).unwrap(), Backing::NotBacked { ref reason, .. } if reason.contains("G2")));
    // Ana keeps the rest of her voice.
    let r = lab.cmip_act(0, pay());
    lab.sign(BEN, &r);
    assert!(lab.counts(&r));

    // A reinstatement made before the refit counts for nothing.
    let mut early = g(publisher.id);
    early.reinstates = Some(g1);
    let re0 = lab.grant(&early);
    lab.sign(CY, &re0);
    assert!(!lab.counts(&re0));

    // The refit: a constitutional clone gives the area to Cy, who signs it.
    let ids = lab.ids();
    let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|t| {
        t.areas.as_mut().unwrap()[0].holders = vec![ids[CY]];
    });
    let k = lab.propose(BEN, &t);
    let s: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &k)).collect();
    lab.rotate(Some((k, s)), &[0]);
    let p = lab.publish(0);
    lab.sign(CY, &p);
    assert!(lab.counts(&p), "the publications count again, with the new holder");
    // A signature on the ended grant itself reinstates nothing (C1).
    lab.sign(CY, &g1);
    assert!(matches!(lab.view().backing(&p2).unwrap(), Backing::NotBacked { .. }));
    // A reinstatement whose fields differ is invalid.
    let mut wrong = g(agent.id);
    wrong.reinstates = Some(g1);
    let rw = lab.grant(&wrong);
    lab.sign(CY, &rw);
    assert!(matches!(lab.consent(&rw), Consent::Invalid { .. }));
    // The reinstatement, after the refit, drawn by the new holder (Cy's
    // device: his act is his signature, rule 60): a clone of the ended
    // grant, which the grantee accepts. It takes nothing on (G2).
    let mut again = g(publisher.id);
    again.reinstates = Some(g1);
    let re = lab.grant(&again);
    assert!(lab.counts(&re));
    sign(&mut lab.w, &mut publisher, &re);
    let mut st = lab.strand(re, &publisher);
    let p3 = under(&mut lab, &mut st, env);
    assert_eq!(lab.view().backing(&p3).unwrap(), Backing::Backed { grant: re });
    assert!(matches!(lab.view().backing(&p2).unwrap(), Backing::NotBacked { .. }), "taken on by nothing");
    // The agent's grant, not reinstated: B binds, D stays void.
    assert_eq!(lab.view().backing(&db).unwrap(), Backing::Binds { grant: g2 });
    assert!(matches!(lab.view().backing(&dd).unwrap(), Backing::NotBacked { .. }));
}

/// F128, G1: a revocation is a decision ending powers; it removes the grant
/// key. A grantee's act its history holds binds; one racing it (neither
/// citing the other) or after it is void, the ending winning, unless the
/// collective itself acknowledges it (A6). A revocation of a grant within
/// an area counts only with that area's holders (Q29).
#[test]
fn a_revocation_ends_the_grant_key() {
    let mut lab = Lab::new(&|_| {});
    let env = mirs().envelopes;
    let mut agent = lab.w.genesis("an agent", vec![own_home()], None, None);
    let grant = Grant {
        area: Some(1),
        kinds: Some(vec![Kind::Type { spec: env, type_: 0 }]),
        ..plain_grant(agent.id)
    };
    let g = lab.grant(&grant);
    lab.sign(ANA, &g);
    sign(&mut lab.w, &mut agent, &g);
    let mut s1 = lab.strand(g, &agent);
    let mut s2 = s1.clone();
    let act = |lab: &mut Lab, st: &mut Person| -> Hash {
        let a = lab.w.everyday_act(st, env, 0, publication(vec![]), None, None);
        lab.w.add(&a)
    };
    let cited = act(&mut lab, &mut s1);
    let racing = act(&mut lab, &mut s2);
    // The revocation, on device 0, citing the head it saw (the cited act).
    let rev = |lab: &mut Lab| -> Hash {
        let o = lab.chain(&[cited]);
        let a = lab.w.everyday_act(&mut lab.c[0], mirs().agreements, agreements::types::REVOCATION, agreements::Revocation { grant: g }.to_map(), Some(o), None);
        lab.w.add(&a)
    };
    let r = rev(&mut lab);
    // Not yet completed by the area's holder: it counts for nothing (Q29).
    assert!(!lab.counts(&r));
    assert_eq!(lab.view().backing(&racing).unwrap(), Backing::Backed { grant: g });
    lab.sign(ANA, &r);
    assert!(lab.counts(&r));
    let v = lab.view();
    assert_eq!(v.backing(&cited).unwrap(), Backing::Binds { grant: g });
    assert!(matches!(v.backing(&racing).unwrap(), Backing::NotBacked { ref reason, .. } if reason.contains("G1")));
    drop(v);
    // After it, citing it: void.
    s1.cite.as_mut().unwrap().1.push(r);
    let after = act(&mut lab, &mut s1);
    assert!(matches!(lab.view().backing(&after).unwrap(), Backing::NotBacked { .. }));
    // A member's witness act acknowledging the racing act adopts nothing:
    // on neither chain of the label (F142, rule 42), it is another
    // identity's acknowledgement, the act disputed, conferring nothing
    // (rule 76). An action for the label on its chain, citing it, adopts it
    // (A6; F131, IT2a).
    lab.ack(0, racing);
    assert!(matches!(lab.view().backing(&racing).unwrap(), Backing::Disputed { .. }), "a witness act adopts nothing (F142): {:?}", lab.view().backing(&racing));
    lab.adopt(0, racing);
    assert_eq!(lab.view().backing(&racing).unwrap(), Backing::Binds { grant: g });
    // H3 (F129): no handover. Another grantee manages the adopted act
    // under its own grant (scope 1, naming it), with its own grant key;
    // the revoked key signs nothing more.
    let mut sofia = lab.w.genesis("sofia", vec![own_home()], None, None);
    let gs = lab.grant(&Grant { grantee: sofia.id, scope: 1, agreements: Some(vec![racing]), ..grant.clone() });
    lab.sign(ANA, &gs);
    sign(&mut lab.w, &mut sofia, &gs);
    let mut s3 = lab.strand(gs, &sofia);
    // Managing it: her act names it (rule 38, scope 1; audit, October
    // 2026, gap 9). One naming nothing of it is beyond her scope.
    let managed = {
        let a = lab.w.everyday_act(&mut s3, env, 0, publication(vec![]), obj(racing), None);
        lab.w.add(&a)
    };
    assert_eq!(lab.view().backing(&managed).unwrap(), Backing::Backed { grant: gs });
    let unrelated = act(&mut lab, &mut s3);
    assert!(matches!(lab.view().backing(&unrelated).unwrap(), Backing::NotBacked { reason, .. } if reason.contains("scope 1")));
    let marco_again = act(&mut lab, &mut s1);
    assert!(matches!(lab.view().backing(&marco_again).unwrap(), Backing::NotBacked { .. }));
}

/// Agreements rule 38 and grant fields 1 to 4 (audit, October 2026, gaps 9 and
/// 10). A grant's scope limits what its key signs within its kinds: scope 1
/// manages the agreements it names (field 2), in any version, and backs
/// nothing else; scope 0 signs new deals, and backs no receipt; scope 2
/// acts for the grantor, and signs no agreement. A grant carrying limits
/// (fields 3 and 4) under a cMIP this verifier does not implement backs
/// nothing for certain: the answer is unknown, never "backed" (rule 18d);
/// the collective's own adoption still binds (rule 40).
#[test]
fn a_grant_reaches_only_its_scope_and_its_limits_answer_unknown() {
    use mor_core::money::{Amount, Payer, Payload as Fin, Purchase, Receipt};
    let mut lab = Lab::new(&|_| {});
    let label = lab.col.id;
    let env = mirs().envelopes;
    let mut friend = lab.w.genesis("a friend", vec![own_home()], None, None);
    let fid = friend.id;
    // Two deals the label is party to, held: one the manager is hired for.
    let mut d1 = deal_terms(fid, label);
    d1.text = "The first deal.".into();
    let deal1 = agreements_act(&mut lab.w, &mut friend, agreements::types::TERMS, d1.to_map(), None);
    let mut d2 = deal_terms(fid, label);
    d2.text = "The second deal.".into();
    let deal2 = agreements_act(&mut lab.w, &mut friend, agreements::types::TERMS, d2.to_map(), None);
    let mut manager = lab.w.genesis("a manager", vec![own_home()], None, None);
    let gm = lab.grant(&Grant {
        scope: 1,
        agreements: Some(vec![deal1]),
        area: Some(2),
        kinds: Some(vec![Kind::Type { spec: mirs().money, type_: mor_core::money::types::RECEIPT }]),
        ..plain_grant(manager.id)
    });
    lab.sign(BEN, &gm);
    sign(&mut lab.w, &mut manager, &gm);
    let mut sm = lab.strand(gm, &manager);
    let rc = |fulfils: Hash| {
        Fin::Receipt(Receipt {
            rail: spec("a rail Module"),
            proof: vec![],
            payer: Some(Payer::Identity(spec("a fan"))),
            payee: label,
            amount: Amount { unit: spec("a unit"), value: 40 },
            fulfils,
            previous: None,
            forward: None,
            batch: None,
            purchase: Some(Purchase { agreement: fulfils, line: fulfils }),
        })
        .to_map()
    };
    let add = |lab: &mut Lab, st: &mut Person, p: Vec<(Value, Value)>| {
        let a = lab.w.everyday_act(st, mirs().money, 2, p, None, None);
        lab.w.add(&a)
    };
    let reason = |lab: &Lab, x: &Hash| match lab.view().backing(x).unwrap() {
        Backing::NotBacked { reason, .. } => Some(reason),
        _ => None,
    };
    // Money under the deal the grant names: backed. Under the other deal:
    // beyond the grant's scope, within its kinds (gap 9).
    let under1 = add(&mut lab, &mut sm, rc(deal1));
    assert_eq!(reason(&lab, &under1), None, "{:?}", lab.view().backing(&under1));
    let under2 = add(&mut lab, &mut sm, rc(deal2));
    assert!(reason(&lab, &under2).is_some_and(|r| r.contains("scope 1")), "{:?}", lab.view().backing(&under2));
    // A later version of the named deal is the same deal.
    let mut c1 = d1.clone();
    c1.parent = Some(deal1);
    c1.text = "The first deal, amended.".into();
    c1.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![fid, label]) }]);
    let deal1b = agreements_act(&mut lab.w, &mut friend, agreements::types::TERMS, c1.to_map(), obj(deal1));
    let under1b = add(&mut lab, &mut sm, rc(deal1b));
    assert_eq!(reason(&lab, &under1b), None, "{:?}", lab.view().backing(&under1b));
    // Scope 0, signing new deals: the terms of a new deal, backed; a
    // receipt, not.
    let mut signer = lab.w.genesis("a deal signer", vec![own_home()], None, None);
    let gs = lab.grant(&Grant { scope: 0, ..plain_grant(signer.id) });
    sign(&mut lab.w, &mut signer, &gs);
    let mut ss = lab.strand(gs, &signer);
    let new_deal = {
        let mut d = deal_terms(label, fid);
        d.text = "A new deal the signer drafts.".into();
        let a = lab.w.everyday_act(&mut ss, mirs().agreements, agreements::types::TERMS, d.to_map(), None, None);
        lab.w.add(&a)
    };
    assert_eq!(reason(&lab, &new_deal), None, "{:?}", lab.view().backing(&new_deal));
    let spent = {
        let a = lab.w.everyday_act(&mut ss, spec("a deal cMIP"), 0, vec![], None, None);
        lab.w.add(&a)
    };
    assert!(reason(&lab, &spent).is_some_and(|r| r.contains("scope 0")));
    // Scope 2, acting for the grantor: no agreement.
    let mut agent = lab.w.genesis("an agent", vec![own_home()], None, None);
    let g2 = lab.grant(&plain_grant(agent.id));
    sign(&mut lab.w, &mut agent, &g2);
    let mut sa = lab.strand(g2, &agent);
    let drafted = {
        let a = lab.w.everyday_act(&mut sa, mirs().agreements, agreements::types::TERMS, deal_terms(label, fid).to_map(), None, None);
        lab.w.add(&a)
    };
    assert!(reason(&lab, &drafted).is_some_and(|r| r.contains("scope 2")));
    let posted = {
        let a = lab.w.everyday_act(&mut sa, spec("a deal cMIP"), 0, vec![], None, None);
        lab.w.add(&a)
    };
    assert_eq!(reason(&lab, &posted), None);
    // Limits (gap 10): a grant carrying them answers unknown, and its acts
    // count for nothing until a verifier can read them.
    let mut capped = lab.w.genesis("a capped agent", vec![own_home()], None, None);
    let gc = lab.grant(&Grant {
        area: Some(1),
        kinds: Some(vec![Kind::Type { spec: env, type_: 0 }]),
        limits: Some(Value::Uint(1000)),
        limits_cmip: Some(spec("a limits cMIP")),
        ..plain_grant(capped.id)
    });
    lab.sign(ANA, &gc);
    sign(&mut lab.w, &mut capped, &gc);
    let mut sc = lab.strand(gc, &capped);
    let within = {
        let a = lab.w.everyday_act(&mut sc, env, 0, publication(vec![]), None, None);
        lab.w.add(&a)
    };
    assert!(matches!(lab.view().backing(&within).unwrap(), Backing::Unknown { grant, ref reason } if grant == gc && reason.contains("18d")), "{:?}", lab.view().backing(&within));
    assert!(matches!(lab.consent(&within), Consent::Unknown { .. }));
    assert!(!lab.counts(&within));
    // Freeze suite v28, 3.7al (F320): a verifier holding the limits cMIP and
    // its time reference states whether each act lies within the limits, an
    // expiry among them: within, backed; past the expiry, not backed, the
    // grant quiet and still revocable.
    let past = {
        let a = lab.w.everyday_act(&mut sc, env, 0, publication(vec![]), None, None);
        lab.w.add(&a)
    };
    let mut v = lab.view();
    v.grant_limits.insert(within, true);
    v.grant_limits.insert(past, false);
    assert_eq!(v.backing(&within).unwrap(), Backing::Backed { grant: gc });
    assert!(matches!(v.backing(&past).unwrap(), Backing::NotBacked { grant, ref reason } if grant == gc && reason.contains("F320")), "{:?}", v.backing(&past));
    drop(v);
    // The label adopts it by an action citing it: it binds (rule 40).
    lab.adopt(0, within);
    assert_eq!(lab.view().backing(&within).unwrap(), Backing::Binds { grant: gc });
}

/// F128, W6: a collective's negotiation message is talk: it binds nothing,
/// sits on neither chain, and need not be sealed to every member.
#[test]
fn a_collectives_negotiation_is_talk() {
    let mut lab = Lab::new(&|_| {});
    let other = lab.w.genesis("a buyer", vec![own_home()], None, None);
    // A member's message for the label names it (rule 58).
    let m = lab.w.private_act(
        &mut lab.c[0],
        mirs().agreements,
        agreements::types::NEGOTIATION,
        agreements::NegotiationMessage { text: "Shall we?".into(), format: None, follows: None, acks: None }.to_map(),
        None,
        vec![other.id],
    );
    assert_eq!(lab.consent(&m), Consent::Talk);
}

/// 3.7m, Q17: one of two holders steps down; the other carries on, and the
/// area's grants with it.
#[test]
fn co_holders_carry_on() {
    let ben_cy = |t: &mut Terms| {
        let p = t.parties.clone();
        t.areas.as_mut().unwrap()[1].holders = vec![p[BEN], p[CY]];
        t.areas.as_mut().unwrap()[1].threshold = 2;
    };
    let mut lab = Lab::new(&ben_cy);
    // The acts drawn by Ana, who holds no Money area.
    lab.hand_over(ANA);
    let f = lab.founding;
    let mut ben = lab.m[BEN].clone();
    let res = lab.resign_from(&mut ben, f, Some(2));
    let x = lab.cmip_act(0, pay());
    lab.record(0, None, &[], vec![res], f);
    let y = lab.cmip_act(0, pay());
    lab.sign(CY, &y);
    assert!(lab.counts(&y), "two deciding together, one left: the other alone (flaw C)");
    lab.sign(BEN, &x);
    assert!(!lab.counts(&x), "before the line: both needed");
    lab.sign(CY, &x);
    assert!(lab.counts(&x));
}

/// Q26, Q32: an area's number and id through clones.
#[test]
fn an_area_keeps_its_number_and_its_id() {
    let mut lab = Lab::new(&|t| {
        let p = t.parties.clone();
        t.areas.as_mut().unwrap()[1].holders = vec![p[BEN], p[CY]];
        t.areas.as_mut().unwrap()[1].threshold = 2;
    });
    let f = lab.founding;
    let ids = lab.ids();
    // Taking a holder off and keeping the number above the one left: valid.
    let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|t| {
        t.areas.as_mut().unwrap()[1].holders = vec![ids[CY]];
    });
    let k = lab.propose(ANA, &t);
    assert!(lab.view().agreement(&k).unwrap().invalid.is_none());
    // Raising a number above the holders: invalid.
    let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|t| {
        t.areas.as_mut().unwrap()[0].threshold = 2;
    });
    let k = lab.propose(ANA, &t);
    assert!(lab.view().agreement(&k).unwrap().invalid.is_some());
    // Dropping area 1, then giving its id to a new area: invalid.
    let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|t| {
        t.areas.as_mut().unwrap().remove(0);
        t.area_words = None;
    });
    let k1 = lab.propose(ANA, &t);
    assert!(lab.view().agreement(&k1).unwrap().invalid.is_none());
    let env = mirs().envelopes;
    let t = lab.clone_terms(&k1, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|t| {
        t.areas.as_mut().unwrap().push(Area {
            name: "Books".into(),
            holders: vec![ids[ANA]],
            threshold: 1,
            kinds: Some(vec![Kind::Type { spec: env, type_: 0 }]),
            fields: None,
            id: 1,
            limits: None,
        });
    });
    let k2 = lab.propose(ANA, &t);
    assert!(lab.view().agreement(&k2).unwrap().invalid.is_some(), "a retired id");
}

// ---------------------------------------------------------------- 7o: the ordering stories

/// `attack_concurrent_lines` and `agreement_fork_status_quo` (A4, Q38).
#[test]
fn concurrent_lines() {
    // One departure registered twice, on two devices neither naming the other.
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let x_named = lab.cmip_act(0, pay());
    let x_unnamed = lab.cmip_act(0, pay());
    lab.sign(BEN, &x_named);
    lab.sign(BEN, &x_unnamed);
    let mut ben = lab.m[BEN].clone();
    let res = lab.resign_from(&mut ben, f, None);
    // Device 1 cites device 0's actions only as far as `x_named`.
    let r = Record {
        clone: None,
        signatures: None,
        registers: Some(vec![res]),
    };
    let mut o = obj(f).unwrap();
    o.extend(lab.chain(&[x_named]));
    let a = lab.w.everyday_act(&mut lab.c[1], mirs().agreements, agreements::types::RECORD, r.to_map(), Some(o), None);
    lab.w.add(&a);
    lab.record(0, None, &[], vec![res], f);
    assert!(lab.counts(&x_named), "before both lines");
    assert!(!lab.counts(&x_unnamed), "after one of them: after the departure");

    // Two sibling clones recorded on two devices: the parent stays.
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let mut ks = vec![];
    for (d, w) in [(0, "Weekly."), (1, "Daily.")] {
        let t = lab.clone_terms(&f, vec![(Power::Area(2), vec![BEN])], &|t| words(t, 2, w));
        let k = lab.propose(BEN, &t);
        let s = lab.sign(BEN, &k);
        let r = lab.record(d, Some((k, vec![s])), &[], vec![], k);
        assert_eq!(puts(&lab, &r), Some(k));
        ks.push(k);
    }
    let x = lab.cmip_act(2, pay());
    assert_eq!(lab.in_force(&x), f, "two concurrent records: a fork, the parent stays");
    assert!(lab.view().current(&lab.col.id).unwrap().unwrap().fork);
    // Recorded one after the other instead: the second puts nothing.
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let mut rs = vec![];
    for w in ["Weekly.", "Daily."] {
        let t = lab.clone_terms(&f, vec![(Power::Area(2), vec![BEN])], &|t| words(t, 2, w));
        let k = lab.propose(BEN, &t);
        let s = lab.sign(BEN, &k);
        rs.push((lab.record(0, Some((k, vec![s])), &[], vec![], k), k));
    }
    assert_eq!(puts(&lab, &rs[0].0), Some(rs[0].1));
    assert_eq!(puts(&lab, &rs[1].0), None, "its parent is no longer in force");
    let _ = ks;
}

/// `attack_omitted_fork_and_the_keeper`, `attack_backdated_fork` (C4, Q34).
#[test]
fn an_omitted_fork_a_keeper_and_a_backdated_fork() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    // A receipt on device 1, which the line leaves out.
    let x = lab.cmip_act(1, pay());
    lab.sign(BEN, &x);
    let fork_point = lab.c[0].clone();
    let mut ben = lab.m[BEN].clone();
    let res = lab.resign_from(&mut ben, f, None);
    let line = lab.record(0, None, &[], vec![res], f);
    assert!(!lab.counts(&x), "left out: counts as made after the line");
    // The label's keeper recorded the receipt before the line.
    let kp = lab.keeper.id;
    lab.keeper_logs = vec![(kp, vec![x, line])];
    assert!(lab.counts(&x), "placed by the keeper (C4)");
    // A keeper never places a member's signature: tested in
    // `a_departure_takes_effect_at_the_labels_line` (the signature placed
    // only by the collective's acts).
    lab.keeper_logs = vec![(kp, vec![line, x])];
    assert!(!lab.counts(&x), "recorded after the line: nothing");

    // Backdated: after the line, a fork from an act before it.
    lab.keeper_logs = vec![];
    let mut fork = fork_point;
    let a = lab.w.everyday_act(&mut fork, pay(), 0, vec![], None, None);
    let y = lab.w.add(&a);
    lab.sign(BEN, &y);
    assert!(!lab.counts(&y));
}

/// Q34: the keepers that place the label's acts are those of the agreement
/// in force for the line.
#[test]
fn the_keepers_of_the_agreement_in_force_place() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let x = lab.cmip_act(1, pay());
    lab.sign(BEN, &x);
    let k2 = lab.w.genesis("keeper two", vec![own_home()], None, None);
    let t = lab.clone_terms(&f, vec![(Power::Judicial, vec![ANA, BEN, CY])], &|t| {
        t.keepers = Some(Keepers {
            operators: vec![k2.id],
            rule: Rule::All,
        });
    });
    let k = lab.propose(ANA, &t);
    let s: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &k)).collect();
    lab.record(0, Some((k, s)), &[], vec![], k);
    let mut ben = lab.m[BEN].clone();
    let res = lab.resign_from(&mut ben, k, None);
    let line = lab.record(0, None, &[], vec![res], k);
    let old = lab.keeper.id;
    lab.keeper_logs = vec![(old, vec![x, line])];
    assert!(!lab.counts(&x), "the replaced keeper places nothing {:?}", lab.consent(&x));
    lab.keeper_logs = vec![(k2.id, vec![x, line])];
    assert!(lab.counts(&x));
}

/// `c5_member_rotation_registered_on_the_line` and Q33.
#[test]
fn a_members_own_rotation_is_registered_on_the_line() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let mut tablet = device(&lab.m[BEN]);
    lab.cmip_act(0, pay()); // the phone signs something first, to keep a tip
    let p0 = lab.m[BEN].clone();
    let x = lab.cmip_act(0, pay());
    sign(&mut lab.w, &mut tablet, &x);
    let t = lab.clone_terms(&f, vec![(Power::Area(2), vec![BEN])], &|t| words(t, 2, "Weekly."));
    let k = lab.propose(ANA, &t);
    let sk = sign(&mut lab.w, &mut tablet, &k);
    let r = lab.record(0, Some((k, vec![sk])), &[], vec![], k);
    assert_eq!(puts(&lab, &r), Some(k));
    // A clone the tablet signs that no act of the label places before the line.
    let t2 = lab.clone_terms(&k, vec![(Power::Area(2), vec![BEN])], &|t| words(t, 2, "Daily."));
    let k2 = lab.propose(ANA, &t2);
    let sk2 = sign(&mut lab.w, &mut tablet, &k2);
    // Ben rotates his own key and forgets the tablet.
    let _ = p0;
    let (rot, ben2) = lab.w.rotate(&lab.m[BEN], Rot::default());
    lab.m[BEN] = ben2;
    assert_eq!(lab.w.v.status(&sk), Status::Void);
    // Agreements draft 14 ("Record (type 17)", F302): a signature the label
    // placed counts for it until a line registers the rotation that voided
    // it after the placement; before any such line, it stays.
    assert!(lab.counts(&x), "placed by the label, and no line registers the rotation yet");
    // The label registers the rotation on its line.
    lab.record(0, None, &[], vec![rot], k);
    assert!(lab.counts(&x), "placed before the line: kept for the label (C5)");
    assert_eq!(puts(&lab, &r), Some(k), "the clone stays in force (Q33)");
    let r2 = lab.record(0, Some((k2, vec![sk2])), &[], vec![], k2);
    assert!(matches!(clone_state(&lab, &r2), CloneState::Invalid(_)), "judged by Identity alone");
    // An old-key signature on a receipt after the line does not count.
    let y = lab.cmip_act(0, pay());
    sign(&mut lab.w, &mut tablet, &y);
    assert!(!lab.counts(&y));
    lab.sign(BEN, &y);
    assert!(lab.counts(&y), "the new key does");
}

// ---------------------------------------------------------------- open formats

#[test]
fn open_formats_are_refused_not_guessed() {
    // Step 12b: the import (type 11, OF22 b), the delivery confirmation
    // (type 7, OF6 b) and Module fee terms (type 15, F211) are retired,
    // never reused: an act of a retired type is invalid. A revocation's
    // format is exact since F128: one naming no grant is invalid.
    let mut lab = Lab::new(&|_| {});
    for retired in [11, 7, 15] {
        let a = lab
            .w
            .everyday_act(&mut lab.c[0], mirs().agreements, retired, vec![], None, None);
        let x = lab.w.add(&a);
        assert!(matches!(lab.view().consent(&x), Ok(Consent::Invalid { .. })), "type {retired} is retired");
    }
    // A publication not in its format is invalid, not guessed.
    let a = lab.w.everyday_act(&mut lab.c[0], mirs().agreements, agreements::types::PUBLICATION, vec![], None, None);
    let x = lab.w.add(&a);
    assert!(matches!(lab.view().consent(&x), Ok(Consent::Invalid { .. })), "a publication naming no split service and no plan");
    let a = lab
        .w
        .everyday_act(&mut lab.c[0], mirs().agreements, agreements::types::REVOCATION, vec![], None, None);
    let x = lab.w.add(&a);
    assert!(matches!(lab.view().consent(&x), Ok(Consent::Invalid { .. })));
    // A record registering a declaration not in the format is no line.
    let f = lab.founding;
    let mut auth = lab.authority.clone();
    let d = agreements_act(&mut lab.w, &mut auth, agreements::types::DECLARATION, vec![], obj(f));
    let r = lab.record(0, None, &[], vec![d], f);
    assert!(!lab.view().record(&lab.col.id, &r).unwrap().line);
}

// ---------------------------------------------------------------- Agreements draft 8: B1, B11

/// Flaw B1: a rotation that declares nothing carries forward the agreement
/// in force, recorded clones included; it changes keys, not rules.
#[test]
fn a_rotation_declaring_nothing_carries_the_agreement_forward() {
    // B5: a rotation declares only a constitutional clone.
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let t = lab.clone_terms(&f, vec![(Power::Area(2), vec![BEN])], &|t| words(t, 2, "Weekly."));
    let k = lab.propose(BEN, &t);
    let s = lab.sign(BEN, &k);
    lab.rotate(Some((k, vec![s])), &[0]);
    let x = lab.publish(0);
    assert!(matches!(lab.consent(&x), Consent::Broken { reason } if reason.contains("B5")));

    // The rule for Money the treasurer's (field 19, `[2, [ben]]`).
    let mut lab = Lab::new(&money_is_bens);
    let f = lab.founding;
    let money = Power::Layer(agreements::layers::MONEY);
    // The treasurer adopts a second payment cMIP alone (`[6, 3]`); the label
    // records it.
    let t = lab.clone_terms(&f, vec![(money.clone(), vec![BEN])], &|t| {
        t.cmips = vec![(6, pay2()), (11, anchor())];
    });
    let k = lab.propose(BEN, &t);
    let s = lab.sign(BEN, &k);
    lab.record(0, Some((k, vec![s])), &[], vec![], k);
    // The label rotates its chain key, declaring nothing.
    lab.rotate(None, &[0]);
    let x = lab.cmip_act(0, pay2());
    assert_eq!(lab.in_force(&x), k, "the recorded clone is still in force");
    assert!(!lab.counts(&x), "a receipt of the adopted rail needs the treasurer");
    lab.sign(BEN, &x);
    assert!(lab.counts(&x), "and counts with the treasurer, after the rotation");
    // A further record under the new key follows the agreement chain from k.
    let t2 = lab.clone_terms(&k, vec![(money.clone(), vec![BEN])], &|t| {
        t.cmips = vec![(6, pay3()), (11, anchor())];
    });
    let k2 = lab.propose(BEN, &t2);
    let s2 = lab.sign(BEN, &k2);
    let r2 = lab.record(0, Some((k2, vec![s2])), &[], vec![], k2);
    assert_eq!(puts(&lab, &r2), Some(k2));
    // A rotation declaring a constitutional clone must descend from k2,
    // the agreement in force carried forward: one of the founding terms
    // breaks the label (rule 37).
    let t3 = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|t| {
        t.text = "The label publishes records and books.".into();
    });
    let k3 = lab.propose(ANA, &t3);
    let sigs: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &k3)).collect();
    lab.rotate(Some((k3, sigs)), &[0]);
    let y = lab.publish(0);
    assert!(matches!(lab.consent(&y), Consent::Broken { .. }));
}

/// Rule 47, B11: two sibling clones recorded on concurrent lines are a
/// fork, the parent in force; a clone of either branch, recorded after
/// both lines, resolves it. One recorded after only one line does not.
#[test]
fn a_clone_of_one_branch_recorded_after_both_lines_resolves_the_fork() {
    for after_both in [true, false] {
        let mut lab = Lab::new(&|_| {});
        let f = lab.founding;
        let mut ks = vec![];
        for (d, w) in [(0, "Weekly."), (1, "Daily.")] {
            let t = lab.clone_terms(&f, vec![(Power::Area(2), vec![BEN])], &|t| words(t, 2, w));
            let k = lab.propose(BEN, &t);
            let s = lab.sign(BEN, &k);
            lab.record(d, Some((k, vec![s])), &[], vec![], k);
            ks.push(k);
        }
        let x = lab.cmip_act(2, pay());
        assert_eq!(lab.in_force(&x), f, "a fork: the parent stays");
        // A clone of the weekly branch.
        let t = lab.clone_terms(&ks[0], vec![(Power::Area(2), vec![BEN])], &|t| words(t, 2, "Weekly, on Mondays."));
        let k3 = lab.propose(BEN, &t);
        let s3 = lab.sign(BEN, &k3);
        // After both lines: on device 0, naming device 1's tip. After one
        // only: on device 0, naming nothing else.
        let tips: &[usize] = if after_both { &[1] } else { &[] };
        let r3 = lab.record(0, Some((k3, vec![s3])), tips, vec![], k3);
        assert_eq!(puts(&lab, &r3), Some(k3), "it puts its clone in force at its own line");
        let e = lab.view().record(&lab.col.id, &r3).unwrap();
        assert_eq!(e.resolves, after_both);
        // Seen from an act after all three lines.
        let y = lab.cmip_act(2, pay());
        let all = lab.record(2, None, &[0, 1], vec![], f);
        let _ = all;
        let z = lab.cmip_act(2, pay());
        let want = if after_both { k3 } else { f };
        assert_eq!(lab.in_force(&z), want, "after both {after_both}");
        let _ = y;
    }
}

/// B11, read with rule 37c (one clone at a time): where a branch moved on
/// before the resolving record, only a clone of its latest clone resolves
/// the fork; a clone of the branch's first clone puts nothing in force.
/// (Found by the ordering simulation's sweep of fork worlds.)
#[test]
fn a_fork_is_resolved_from_the_latest_clone_of_a_branch() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let area = |lab: &Lab, parent: &Hash, w: &str| lab.clone_terms(parent, vec![(Power::Area(2), vec![BEN])], &|t| words(t, 2, w));
    let t1 = area(&lab, &f, "Weekly.");
    let k1 = lab.propose(BEN, &t1);
    let s1 = lab.sign(BEN, &k1);
    lab.record(0, Some((k1, vec![s1])), &[], vec![], k1);
    let t2 = area(&lab, &f, "Daily.");
    let k2 = lab.propose(BEN, &t2);
    let s2 = lab.sign(BEN, &k2);
    lab.record(1, Some((k2, vec![s2])), &[], vec![], k2);
    // The weekly branch moves on, on device 0, which has not heard of device 1.
    let t4 = area(&lab, &k1, "Weekly, on Mondays.");
    let k4 = lab.propose(BEN, &t4);
    let s4 = lab.sign(BEN, &k4);
    let r4 = lab.record(0, Some((k4, vec![s4])), &[], vec![], k4);
    assert_eq!(puts(&lab, &r4), Some(k4));
    // After both lines, a clone of the branch's first clone resolves nothing.
    let t3 = area(&lab, &k1, "Weekly, on Fridays.");
    let k3 = lab.propose(BEN, &t3);
    let s3 = lab.sign(BEN, &k3);
    let r3 = lab.record(0, Some((k3, vec![s3])), &[1], vec![], k3);
    assert_eq!(puts(&lab, &r3), None, "k4 is that branch's latest clone");
    // A clone of the latest clone does.
    let t5 = area(&lab, &k4, "Weekly, on Mondays, at noon.");
    let k5 = lab.propose(BEN, &t5);
    let s5 = lab.sign(BEN, &k5);
    let r5 = lab.record(0, Some((k5, vec![s5])), &[1], vec![], k5);
    assert_eq!(puts(&lab, &r5), Some(k5));
    assert!(lab.view().record(&lab.col.id, &r5).unwrap().resolves);
    let x = lab.cmip_act(0, pay());
    assert_eq!(lab.in_force(&x), k5);
}

// ---------------------------------------------------------------- Agreements draft 8: declared absence (B12)

impl Lab {
    /// An abandonment declaration (type 13, B12), by the named authority
    /// (`None`) or by a member.
    fn declare(&mut self, by: Option<usize>, agreement: Hash, clause: Hash, party: usize, outs: Vec<u64>) -> Hash {
        let d = AbsenceDeclaration {
            agreement,
            clause,
            party: self.m[party].id,
            outcomes: outs,
        };
        match by {
            None => {
                let mut a = self.authority.clone();
                let x = agreements_act(&mut self.w, &mut a, agreements::types::DECLARATION, d.to_map(), obj(agreement));
                self.authority = a;
                x
            }
            Some(i) => agreements_act(&mut self.w, &mut self.m[i], agreements::types::DECLARATION, d.to_map(), obj(agreement)),
        }
    }

    /// A clone adding a succession plan, signed by `who`, recorded at once.
    fn add_plan(&mut self, parent: &Hash, who: &[usize], plan: SuccessionPlan) -> Hash {
        let t = self.clone_terms(parent, vec![(Power::Judicial, who.to_vec())], &|t| {
            t.succession = Some(vec![plan.clone()]);
        });
        let k = self.propose(who[0], &t);
        let sigs: Vec<Hash> = who.iter().map(|i| self.sign(*i, &k)).collect();
        let r = self.record(0, Some((k, sigs)), &[], vec![], k);
        assert_eq!(puts(self, &r), Some(k));
        k
    }
}

/// 3.7k (F105, flaw C, Q28, C2, C7 and Flaw L): a declaration of absence
/// with outcome 0 takes effect at the label's line registering it.
#[test]
fn a_declaration_removes_a_voice_at_the_labels_line() {
    let mut lab = Lab::new(&|t| {
        t.constitutional = Some(Rule::Threshold(3));
        // The Money lane held by Ana and Ben, deciding together.
        let ids = t.parties.clone();
        let fin = &mut t.areas.as_mut().unwrap()[1];
        fin.holders = vec![ids[ANA], ids[BEN]];
        fin.threshold = 2;
    });
    let f = lab.founding;
    // Before the line: every member signs a judicial clone (F121),
    // recorded at once.
    let t1 = lab.clone_terms(&f, vec![(Power::Judicial, vec![ANA, BEN, CY])], &|t| {
        t.arbitrators = Some(vec![spec("another arbitrator")]);
    });
    let k1 = lab.propose(ANA, &t1);
    let sa = lab.sign(ANA, &k1);
    let sb = lab.sign(BEN, &k1);
    let sc = lab.sign(CY, &k1);
    let r1 = lab.record(0, Some((k1, vec![sa, sb, sc])), &[], vec![], k1);
    // A year of receipts, both treasurers signing.
    let early = lab.cmip_act(0, pay());
    lab.sign(ANA, &early);
    lab.sign(BEN, &early);
    assert!(lab.counts(&early));
    // Ana also signs a second clone, which the label never acknowledges.
    let t2 = lab.clone_terms(&k1, vec![(Power::Judicial, vec![ANA, BEN, CY])], &|t| {
        t.arbitrators = Some(vec![spec("a third arbitrator")]);
    });
    let k2 = lab.propose(ANA, &t2);
    let sa2 = lab.sign(ANA, &k2);
    let sb2 = lab.sign(BEN, &k2);

    // Declarations that fail make no line: the wrong clause version, an
    // outcome the clause does not allow, the wrong signer.
    let bad = lab.declare(None, k1, f, ANA, vec![outcomes::VOICE_REMOVED]);
    let rb = lab.record(0, None, &[], vec![bad], k1);
    assert!(!lab.view().record(&lab.col.id, &rb).unwrap().line, "Ana signed k1 last: its clause applies");
    let bad = lab.declare(None, f, f, ANA, vec![outcomes::VOICE_REMOVED, outcomes::STAKE_REDISTRIBUTED]);
    let rb = lab.record(0, None, &[], vec![bad], k1);
    assert!(!lab.view().record(&lab.col.id, &rb).unwrap().line, "outcome 1 is not allowed");
    let bad = lab.declare(Some(CY), f, f, ANA, vec![outcomes::VOICE_REMOVED]);
    let rb = lab.record(0, None, &[], vec![bad], k1);
    assert!(!lab.view().record(&lab.col.id, &rb).unwrap().line, "Cy is not the authority");
    // The authority declares Ana absent, naming the version before k1
    // (Q28); the label registers it at once: its line.
    let d = lab.declare(None, f, f, ANA, vec![outcomes::VOICE_REMOVED]);
    let line = lab.record(0, None, &[], vec![d], k1);
    let e = lab.view().record(&lab.col.id, &line).unwrap();
    assert!(e.line, "{:?}", e.not_a_line);
    assert_eq!(e.registers.len(), 1);
    // k1 stays in force, Ana counted as a voice for it (Q28).
    assert_eq!(clone_state(&lab, &r1), CloneState::Complete);
    let x = lab.cmip_act(0, pay());
    assert_eq!(lab.in_force(&x), k1);
    // The year of receipts keeps Ana's signature (Flaw L).
    assert!(lab.counts(&early));
    assert_eq!(areas(&lab.consent(&early))[0].3.len(), 2);
    // After the line, Ben alone meets the Money lane (flaw C), and Ana's
    // signature counts for nothing.
    lab.sign(ANA, &x);
    assert!(!lab.counts(&x));
    lab.sign(BEN, &x);
    assert!(lab.counts(&x));
    assert_eq!(areas(&lab.consent(&x))[0].3, vec![lab.m[BEN].id]);
    // Ana's unacknowledged signature on k2, recorded after the line, counts
    // toward nothing: a mark naming her is invalid; Ben and Cy, every voice
    // that remains, meet it.
    let sc2 = lab.sign(CY, &k2);
    let r2 = lab.record(0, Some((k2, vec![sa2, sb2, sc2])), &[], vec![], k2);
    assert!(matches!(clone_state(&lab, &r2), CloneState::Invalid(_)));
    let t2b = lab.clone_terms(&k1, vec![(Power::Judicial, vec![BEN, CY])], &|t| {
        t.arbitrators = Some(vec![spec("a third arbitrator")]);
    });
    let k2b = lab.propose(BEN, &t2b);
    let s1 = lab.sign(BEN, &k2b);
    let s2 = lab.sign(CY, &k2b);
    let r2b = lab.record(0, Some((k2b, vec![s1, s2])), &[], vec![], k2b);
    assert_eq!(puts(&lab, &r2b), Some(k2b));
    // Ana held the Releases area alone: it stands frozen from the line.
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    assert!(areas(&lab.consent(&p))[0].1, "frozen");
    // Three of three, one voice removed: Ben and Cy change the constitution.
    let ids = lab.ids();
    let keep = vec![ids[BEN], ids[CY]];
    let auth = lab.authority.id;
    let t3 = lab.clone_terms(&k2b, vec![(Power::Constitutional, vec![BEN, CY])], &|t| {
        t.parties = keep.clone();
        t.constitutional = None;
        let g = t.grammar.as_mut().unwrap();
        g.chain_key = Holding::Shares { threshold: 2, members: keep.clone() };
        g.recovery = Some(Recovery::Escrow { authority: auth });
        let a = t.areas.as_mut().unwrap();
        a[0].holders = vec![keep[1]];
        a[1].holders = vec![keep[0]];
    });
    let k3 = lab.propose(BEN, &t3);
    let s1 = lab.sign(BEN, &k3);
    let s2 = lab.sign(CY, &k3);
    lab.rotate(Some((k3, vec![s1, s2])), &[0]);
    let y = lab.publish(0);
    lab.sign(CY, &y);
    assert_eq!(lab.in_force(&y), k3);
    assert!(lab.counts(&y));
    assert_eq!(
        lab.view().current(&lab.col.id).unwrap().unwrap().agreement,
        k3
    );
}

/// Agreements rules 50 to 52 (F172): with no absence-proof cMIP in the clause, a
/// declaration is the authority's judgment, checked for signer, outcome
/// and version only: the core reads no time. The label names a time
/// reference and nobody anchors anything; the declaration still counts and
/// the record registers it. Cy's liveness act on the agreement, made
/// before it, does not stop it: presence is shown, never proven by time in
/// the core (rule 50); a contest shows a wrongful declaration (rule 52).
#[test]
fn a_declaration_is_the_authoritys_judgment_with_no_anchors() {
    let mut lab = Lab::new(&|t| {
        t.time = Some((spec("a block height reference"), Value::Uint(0)));
    });
    let f = lab.founding;
    let mut cy = lab.m[CY].clone();
    agreements_act(&mut lab.w, &mut cy, 12, liveness(f), obj(f));
    lab.m[CY] = cy;
    let d = lab.declare(None, f, f, CY, vec![outcomes::VOICE_REMOVED]);
    assert!(lab.view().declaration(&d).unwrap().is_ok(), "{:?}", lab.view().declaration(&d).unwrap().err());
    let line = lab.record(0, None, &[], vec![d], f);
    let e = lab.view().record(&lab.col.id, &line).unwrap();
    assert!(e.line, "{:?}", e.not_a_line);
    assert_eq!(e.registers.len(), 1, "the record registers it, no anchor stated");
    // Cy's signature counts for nothing after the line.
    let x = lab.cmip_act(0, pay());
    lab.sign(BEN, &x);
    lab.sign(CY, &x);
    assert_eq!(areas(&lab.consent(&x))[0].3, vec![lab.m[BEN].id]);
}

/// The reference absence-proof module, a period on the time reference
/// (F172): the clause names it in key 3. The core takes its answer from
/// the caller and reads no anchor itself: accepted for the record, the
/// declaration counts with no anchor stated to the core at all.
#[test]
fn under_a_period_module_the_core_reads_no_anchor() {
    use agreements::view::reference_absence_proof as reference;
    let mut lab = Lab::new(&|t| {
        t.time = Some((spec("a block height reference"), Value::Uint(0)));
        t.abandonment.as_mut().unwrap().proof = Some((reference::spec(), reference::params(30)));
    });
    let f = lab.founding;
    let d = lab.declare(None, f, f, CY, vec![outcomes::VOICE_REMOVED]);
    assert!(lab.view().declaration(&d).unwrap().is_ok(), "{:?}", lab.view().declaration(&d).unwrap().err());
    let line = lab.record(0, None, &[], vec![d], f);
    lab.accepted.push((d, line));
    let e = lab.view().record(&lab.col.id, &line).unwrap();
    assert_eq!(e.registers.len(), 1, "{:?}", e.not_a_line);
}

/// Agreements draft 10, the abandonment format (F172): key 2, the period of
/// absence (F140), is retired and never reused: terms carrying it are
/// invalid, signed by every party or not. Key 3 is an absence-proof cMIP
/// and its parameters, `[hash, any]`, the parameters the cMIP's own.
#[test]
fn abandonment_key_2_is_retired_and_key_3_names_a_cmip() {
    let lab = Lab::new(&|_| {});
    let t = lab.view().terms(&lab.founding).unwrap();
    let with = |extra: (Value, Value)| -> Vec<(Value, Value)> {
        let mut m = t.to_map();
        for (k, v) in m.iter_mut() {
            if *k == Value::Uint(9) {
                let Value::Map(a) = v else { panic!("a map") };
                a.push(extra.clone());
            }
        }
        m
    };
    // Key 2: invalid.
    let got = Terms::decode(&(with((Value::Uint(2), Value::Uint(30)))));
    assert!(matches!(&got, Err(AgreementsError::Shape(w)) if w.contains("key 2") && w.contains("F172")), "{got:?}");
    // Key 3: a cMIP and any parameters, carried as they are.
    let params = Value::Map(vec![(Value::Text("period".into()), Value::Uint(30))]);
    let pair = Value::Array(vec![Value::Bytes(spec("an absence-proof cMIP").to_vec()), params.clone()]);
    let got = Terms::decode(&(with((Value::Uint(3), pair)))).unwrap();
    assert_eq!(got.abandonment.as_ref().unwrap().proof, Some((spec("an absence-proof cMIP"), params)));
    assert_eq!(got.check(&mirs()), Ok(()));
    // Not a pair, or no hash: invalid.
    for bad in [Value::Uint(30), Value::Array(vec![Value::Uint(1), Value::Uint(2)])] {
        assert!(Terms::decode(&(with((Value::Uint(3), bad.clone())))).is_err(), "{bad:?}");
    }
    // Signed by every member, terms carrying key 2 are still no agreement.
    let mut w = World::new();
    let mut m: Vec<Person> = ["a", "b"].iter().map(|n| w.genesis(n, vec![own_home()], None, None)).collect();
    let map = with((Value::Uint(2), Value::Uint(30)));
    let x = agreements_act(&mut w, &mut m[0], agreements::types::TERMS, map, None);
    for p in m.iter_mut() {
        sign(&mut w, p, &x);
    }
    assert!(view(&w).agreement(&x).is_err(), "key 2 makes the terms invalid");
}

/// F172, F178 (14): absence proof is a judicial task. The cMIP the clause
/// names for it serves no other task and is no extension.
#[test]
fn the_absence_proof_cmip_is_a_judge() {
    for (case, cmip) in [("the anchoring cMIP", anchor()), ("the payment cMIP", pay()), ("an extension", ext())] {
        let lab = Lab::new(&|_| {});
        let mut t = lab.view().terms(&lab.founding).unwrap();
        t.abandonment.as_mut().unwrap().proof = Some((cmip, Value::Null));
        let got = t.check(&mirs());
        assert!(matches!(&got, Err(AgreementsError::Check(w)) if w.contains("absence-proof")), "{case}: {got:?}");
    }
}

/// F182 item 14: absence proof is task 14, and a chain of judgment names
/// its cMIP as any judge: `[ 0, 14 ]` follows the cMIP the clause names in
/// key 3, and the specification taking over from it is a judge too, named
/// nowhere else. Field 2 does not name it: the clause does (a reading, in
/// the build's report). *Removal check: with task 14 not a judicial task a
/// chain can follow, the first assertion fails ("names no judge").*
#[test]
fn absence_proof_is_task_14_in_the_chain_of_judgment() {
    use mor_core::agreements::{ChainLink, Judge, ABSENCE_PROOF_TASK};
    assert_eq!(ABSENCE_PROOF_TASK, 14);
    let proof = spec("an absence-proof cMIP");
    let next = spec("an absence-proof cMIP taking over");
    let lab = Lab::new(&|_| {});
    let mut t = lab.view().terms(&lab.founding).unwrap();
    t.abandonment.as_mut().unwrap().proof = Some((proof, Value::Null));
    t.chain = Some(vec![ChainLink { judge: Judge::Task(14), next: vec![(next.into(), 30)] }]);
    assert_eq!(t.check(&mirs()), Ok(()));
    assert_eq!(t.chain_of(&Judge::Task(14)), Some(vec![proof, next]));
    let back = Terms::decode(&t.to_map()).unwrap();
    assert_eq!(back.chain_of(&Judge::Task(14)), Some(vec![proof, next]), "read back from its bytes");
    // The one taking over is named nowhere else.
    let mut u = t.clone();
    u.cmips.push((9, next));
    u.cmips.sort();
    assert!(matches!(u.check(&mirs()), Err(AgreementsError::Check(w)) if w.contains("named nowhere else")));
    // No absence-proof cMIP in the clause: the chain follows no judge.
    let mut u = t.clone();
    u.abandonment.as_mut().unwrap().proof = None;
    assert!(matches!(u.check(&mirs()), Err(AgreementsError::Check(w)) if w.contains("no judge")));
    // Field 2 does not name it.
    let mut u = t.clone();
    u.cmips.push((14, proof));
    u.cmips.sort();
    assert!(matches!(u.check(&mirs()), Err(AgreementsError::Check(w)) if w.contains("key 3")), "{:?}", u.check(&mirs()));
}

/// Agreements rule 51 (F172; F178 item 12): where the clause names an
/// absence-proof cMIP (key 3), the declaration counts only where that cMIP
/// accepted it, for the act using it. The core reads no cMIP: the
/// caller states its answer. Not accepted, or accepted for another act,
/// the record registers nothing; accepted for this record, it does. In a
/// deal, the same for the clone put in force under it.
#[test]
fn under_an_absence_proof_cmip_a_declaration_counts_only_where_accepted() {
    let proof = spec("an absence-proof cMIP");
    let mut lab = Lab::new(&|t| {
        t.abandonment.as_mut().unwrap().proof = Some((proof, Value::Text("its own parameters".into())));
    });
    let f = lab.founding;
    let d = lab.declare(None, f, f, CY, vec![outcomes::VOICE_REMOVED]);
    // Its own checks pass: signer, outcome, version.
    assert!(lab.view().declaration(&d).unwrap().is_ok());
    let r1 = lab.record(0, None, &[], vec![d], f);
    let e = lab.view().record(&lab.col.id, &r1).unwrap();
    assert!(e.registers.is_empty() && !e.line, "not accepted: it does not count");
    assert!(e.not_a_line.as_deref().is_some_and(|w| w.contains("absence-proof")), "{:?}", e.not_a_line);
    // Accepted for another act only: still nothing here.
    lab.accepted.push((d, spec("another record")));
    assert!(lab.view().record(&lab.col.id, &r1).unwrap().registers.is_empty());
    // Accepted for this record: it registers it.
    lab.accepted.push((d, r1));
    let e = lab.view().record(&lab.col.id, &r1).unwrap();
    assert_eq!(e.registers.len(), 1, "{:?}", e.not_a_line);

    // A deal: the clone without p3 completes only where the cMIP accepted
    // the declaration for that clone.
    let mut w = World::new();
    let mut m: Vec<Person> = ["p1", "p2", "p3"].iter().map(|n| w.genesis(n, vec![own_home()], None, None)).collect();
    let mut keeper = w.genesis("keeper", vec![own_home()], None, None);
    let ids: Vec<Hash> = m.iter().map(|p| p.id).collect();
    let mut deal = deal_terms(ids[0], ids[1]);
    deal.parties = ids.clone();
    deal.keepers = Some(Keepers { operators: vec![keeper.id], rule: Rule::All });
    deal.abandonment = Some(Abandonment {
        authority: Authority::Named(keeper.id),
        outcomes: vec![outcomes::VOICE_REMOVED],
        proof: Some((proof, Value::Null)),
    });
    assert_eq!(deal.check(&mirs()), Ok(()));
    let x = agreements_act(&mut w, &mut m[0], agreements::types::TERMS, deal.to_map(), None);
    for p in m.iter_mut() {
        sign(&mut w, p, &x);
    }
    let mut c = deal.clone();
    c.parent = Some(x);
    c.text = "Two of us carry on.".into();
    c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![ids[0], ids[1]]) }]);
    let two = agreements_act(&mut w, &mut m[0], agreements::types::TERMS, c.to_map(), obj(x));
    sign(&mut w, &mut m[0], &two);
    sign(&mut w, &mut m[1], &two);
    let decl = AbsenceDeclaration { agreement: x, clause: x, party: ids[2], outcomes: vec![outcomes::VOICE_REMOVED] };
    let dx = agreements_act(&mut w, &mut keeper, agreements::types::DECLARATION, decl.to_map(), obj(x));
    let mut v = view(&w);
    v.keeper_logs.insert(keeper.id, vec![dx]);
    assert!(v.agreement(&two).unwrap().invalid.is_some(), "not accepted: p3 still counts");
    let mut v = view(&w);
    v.keeper_logs.insert(keeper.id, vec![dx]);
    v.absence_accepted.insert((dx, two));
    let a = v.agreement(&two).unwrap();
    assert_eq!(a.exists, Some(true), "{:?}", a.invalid);
}

/// Agreements rule 51 (F172): a declaration moves nothing by itself; what is put
/// in force under it is judged where that act uses it, and no later act of
/// the party undoes it. Ana last signed the founding terms (the treasurer
/// alone signed the area clone recorded since); the authority declares her
/// absent and the label's record registers it. Ana then comes back: a
/// liveness act, a contest, and her signature on the area clone she had
/// never signed, all after the line, which no act of the label places
/// before it. The record still registers the declaration, and her voice
/// stays gone.
#[test]
fn a_later_act_of_the_party_never_undoes_the_line() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let t = lab.clone_terms(&f, vec![(Power::Area(2), vec![BEN])], &|t| words(t, 2, "Weekly."));
    let k = lab.propose(BEN, &t);
    let sk = lab.sign(BEN, &k);
    let r0 = lab.record(0, Some((k, vec![sk])), &[], vec![], k);
    assert_eq!(puts(&lab, &r0), Some(k));
    let d = lab.declare(None, k, f, ANA, vec![outcomes::VOICE_REMOVED]);
    let line = lab.record(0, None, &[], vec![d], k);
    let registered = |lab: &Lab| lab.view().record(&lab.col.id, &line).unwrap().registers.len();
    assert_eq!(registered(&lab), 1);
    // Ana comes back.
    agreements_act(&mut lab.w, &mut lab.m[ANA].clone(), 12, liveness(k), obj(k));
    let contest = agreements_act(&mut lab.w, &mut lab.m[ANA].clone(), 14, vec![], obj(d));
    assert!(lab.w.v.get(&contest).is_some(), "the contest is held, shown beside the declaration");
    lab.sign(ANA, &k);
    assert_eq!(registered(&lab), 1, "a later act of the party never undoes the line (rule 51, F172)");
    let x = lab.cmip_act(0, pay());
    lab.sign(ANA, &x);
    assert!(!lab.counts(&x), "her voice stays gone");
    // A signature of hers on that clone that the label placed before the
    // line would have made the founding terms no longer the last version
    // she signed: the declaration then names the wrong version there.
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let t = lab.clone_terms(&f, vec![(Power::Area(2), vec![BEN])], &|t| words(t, 2, "Weekly."));
    let k = lab.propose(BEN, &t);
    let sk = lab.sign(BEN, &k);
    lab.record(0, Some((k, vec![sk])), &[], vec![], k);
    let sa = lab.sign(ANA, &k);
    lab.acknowledge(0, sa);
    let d = lab.declare(None, k, f, ANA, vec![outcomes::VOICE_REMOVED]);
    let line = lab.record(0, None, &[], vec![d], k);
    let e = lab.view().record(&lab.col.id, &line).unwrap();
    assert!(e.registers.is_empty(), "placed before the line, her signature on the clone counts");
}

/// Q37, flaw C, B15: a threshold authority of two of the other parties.
/// One of them resigned and registered before the declaration's line: the
/// one who remains declares alone. Where both still count, one signs the
/// declaration and the other adds a signature act naming it; it counts
/// once both have signed, the second signature placed by the label at or
/// before the line: acknowledged by an earlier act, or by the record
/// registering the declaration. A signature the label places only after
/// that record completes nothing there; a later record registers it.
#[test]
fn a_threshold_authority_is_counted_at_the_line() {
    for case in [
        "registered before",
        "in the same record",
        "not co-signed",
        "acknowledged by the record",
        "acknowledged before",
        "acknowledged after",
        "witnessed before",
        "acknowledged off the chain",
    ] {
        let mut lab = Lab::new(&|t| {
            t.abandonment = Some(Abandonment {
                authority: Authority::Others(2),
                outcomes: vec![outcomes::VOICE_REMOVED],
                proof: None,
            });
            let ids = t.parties.clone();
            let g = t.grammar.as_mut().unwrap();
            g.chain_key = Holding::Shares { threshold: 2, members: ids };
            g.recovery = None;
        });
        let f = lab.founding;
        let mut ben = lab.m[BEN].clone();
        let res = lab.resign_from(&mut ben, f, None);
        let resigned = matches!(case, "registered before" | "in the same record");
        if case == "registered before" {
            lab.record(0, None, &[], vec![res], f);
        }
        let d = lab.declare(Some(ANA), f, f, CY, vec![outcomes::VOICE_REMOVED]);
        let regs = if case == "in the same record" { vec![res, d] } else { vec![d] };
        let mut acks = None;
        if !resigned && case != "not co-signed" {
            let sb = lab.sign(BEN, &d);
            match case {
                "acknowledged by the record" => acks = Some(vec![sb]),
                "acknowledged before" => {
                    lab.acknowledge(0, sb);
                }
                // F156: a member's witness act is on neither chain of the
                // label (it names none: their own act) and places nothing;
                // nor does an action on no chain (rule 35b).
                "witnessed before" => {
                    let w = lab.ack(0, sb);
                    assert_eq!(lab.consent(&w), Consent::NotCollective, "a witness act counts for nothing in Agreements (F156)");
                }
                "acknowledged off the chain" => {
                    let a = lab.acknowledge_uncited(0, sb);
                    assert!(matches!(lab.consent(&a), Consent::Uncited { .. }));
                }
                _ => {}
            }
            let r = lab.record_acking(0, None, &[], regs.clone(), f, acks.clone());
            if matches!(case, "witnessed before" | "acknowledged off the chain") {
                let e = lab.view().record(&lab.col.id, &r).unwrap();
                assert!(!e.line, "{case}: the signature is not placed before the record (F156)");
                assert!(e.not_a_line.as_deref().is_some_and(|w| w.contains("1 of the 2")), "{:?}", e.not_a_line);
                continue;
            }
            if case == "acknowledged after" {
                lab.acknowledge(0, sb);
                let e = lab.view().record(&lab.col.id, &r).unwrap();
                assert!(!e.line, "a signature placed after the record completes nothing there");
                assert!(e.not_a_line.as_deref().is_some_and(|w| w.contains("1 of the 2")), "{:?}", e.not_a_line);
                let r2 = lab.record(0, None, &[], regs.clone(), f);
                assert!(lab.view().record(&lab.col.id, &r2).unwrap().line);
            } else {
                assert!(lab.view().record(&lab.col.id, &r).unwrap().line, "{case}");
            }
        } else {
            let r = lab.record(0, None, &[], regs, f);
            let e = lab.view().record(&lab.col.id, &r).unwrap();
            if case == "not co-signed" {
                assert!(!e.line, "Ana alone is one of the two its number needs");
                continue;
            }
            assert!(e.line, "{case}: {:?}", e.not_a_line);
        }
        let cur = lab.view().current(&lab.col.id).unwrap().unwrap();
        assert!(cur.departed.contains(&lab.m[CY].id), "{case}");
    }
}

/// C7, as Agreements draft 17 leaves it: a declaration takes effect at the
/// rotation the recovery path makes only where no member but the declared
/// one remains to draw a record; here Ben and Cy remain, so a rotation
/// registering nothing leaves Ana counted, sole chain-key holder or not.
/// The authority's declaration draws no line by itself.
#[test]
fn a_declaration_against_the_key_holder_takes_effect_at_the_recovery_rotation() {
    for (sole, declared) in [(true, true), (true, false), (false, true)] {
        let mut lab = Lab::new(&|t| {
            if sole {
                // Ana the sole holder of the chain key (the signing key is
                // withdrawn), a successor to her seat named (F96).
                let ids = t.parties.clone();
                t.grammar.as_mut().unwrap().chain_key = Holding::One(ids[ANA]);
                t.succession = Some(vec![SuccessionPlan { party: ids[ANA], stakes: None, seats: Some(vec![spec("Ana's successor")]), entry: None }]);
            }
        });
        let f = lab.founding;
        if declared {
            lab.declare(None, f, f, ANA, vec![outcomes::VOICE_REMOVED]);
        }
        // No line yet: Ana's voice still counts on the label's acts.
        let p = lab.publish(0);
        lab.sign(ANA, &p);
        assert!(lab.counts(&p));
        // The recovery rotation declares the clone without Ana, signed by
        // Ben and Cy only.
        let ids = lab.ids();
        let keep = vec![ids[BEN], ids[CY]];
        let auth = lab.authority.id;
        let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![BEN, CY])], &|t| {
            t.parties = keep.clone();
            t.succession = None;
            let g = t.grammar.as_mut().unwrap();
            g.chain_key = Holding::Shares { threshold: 2, members: keep.clone() };
            g.recovery = Some(Recovery::Escrow { authority: auth });
            t.areas.as_mut().unwrap()[0].holders = vec![keep[1]];
        });
        let k = lab.propose(BEN, &t);
        let s1 = lab.sign(BEN, &k);
        let s2 = lab.sign(CY, &k);
        lab.rotate(Some((k, vec![s1, s2])), &[0]);
        let y = lab.publish(0);
        lab.sign(CY, &y);
        // Agreements draft 17 ("Abandonment", F404): a declaration takes
        // effect at a recovery rotation only where no member other than the
        // declared one remains to draw a record; here Ben and Cy remain,
        // and none registered it: Ana still counts, sole key holder or not.
        match lab.consent(&y) {
            Consent::Broken { reason } => assert!(reason.contains("too few signers"), "Ana still counts: {reason}"),
            other => panic!("sole holder {sole}, declared {declared}: {other:?}"),
        }
        assert!(lab.counts(&p), "what Ana signed before the rotation stands");
    }
}

/// B15 at C7's recovery rotation (B16): the rotation removing the declared
/// key holder is the declaration's line. A co-signature the label placed
/// before it counts; one it could not place counts where the recovery
/// rotation names it beside its clone's (Flaw B18). Named nowhere, it
/// completes nothing there, Ana stays counted and the clone she did not
/// sign is not complete; a rotation naming another act there puts nothing
/// in force (freeze suite v20, step 7k).
#[test]
fn a_threshold_declaration_at_the_recovery_rotation() {
    for case in ["placed before", "named by the rotation", "nowhere", "another act named"] {
        let mut lab = Lab::new(&|t| {
            let ids = t.parties.clone();
            t.abandonment = Some(Abandonment {
                authority: Authority::Others(2),
                outcomes: vec![outcomes::VOICE_REMOVED],
                proof: None,
            });
            let g = t.grammar.as_mut().unwrap();
            g.chain_key = Holding::Shares { threshold: 2, members: ids };
            g.recovery = None;
        });
        let f = lab.founding;
        let d = lab.declare(Some(BEN), f, f, ANA, vec![outcomes::VOICE_REMOVED]);
        let sc = lab.sign(CY, &d);
        if case == "placed before" {
            lab.acknowledge(0, sc);
            // Ben or Cy, members still, draw the record registering the
            // declaration (draft 17, "Abandonment": a recovery rotation is
            // its line only where no other member remains to draw one).
            lab.record(0, None, &[0], vec![d], f);
        }
        let ids = lab.ids();
        let keep = vec![ids[BEN], ids[CY]];
        // F122: the authority changes too, a judge: every member for it.
        let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![BEN, CY]), (Power::Judicial, vec![BEN, CY])], &|t| {
            t.parties = keep.clone();
            t.abandonment.as_mut().unwrap().authority = Authority::Others(1);
            let g = t.grammar.as_mut().unwrap();
            g.chain_key = Holding::Shares { threshold: 1, members: keep.clone() };
            t.areas.as_mut().unwrap()[0].holders = vec![keep[1]];
        });
        let k = lab.propose(BEN, &t);
        let s1 = lab.sign(BEN, &k);
        let s2 = lab.sign(CY, &k);
        match case {
            "named by the rotation" => lab.recover(k, vec![s1, s2], vec![sc], &[0]),
            "another act named" => lab.recover(k, vec![s1, s2], vec![s1], &[0]),
            _ => lab.rotate(Some((k, vec![s1, s2])), &[0]),
        };
        let y = lab.publish(0);
        lab.sign(CY, &y);
        let got = lab.view().consent(&y);
        // Named by the rotation: draft 17 makes a recovery rotation the
        // declaration's line only where no member but the declared one
        // remains to draw a record (rule 89); Ben and Cy remain, so naming
        // Cy's signature there is naming an act on no declaration taking
        // effect at it (B18).
        match case {
            "placed before" => {
                assert!(matches!(&got, Ok(c) if c.counts()), "{case}: {got:?}");
                assert_eq!(lab.in_force(&y), k, "{case}");
            }
            "nowhere" => assert!(
                matches!(&got, Ok(Consent::Broken { reason }) if reason.contains("not complete")),
                "{case}: Ana is still counted at the rotation: {got:?}"
            ),
            _ => assert!(
                matches!(&got, Ok(Consent::Broken { reason }) if reason.contains("B18")),
                "{case}: {got:?}"
            ),
        }
    }
}

/// Flaw B18's third element belongs to the recovery rotation alone: a
/// rotation naming a signature on a declaration against a party it does
/// not take out as C7 says puts nothing in force.
#[test]
fn only_the_recovery_rotation_names_a_declarations_signatures() {
    let mut lab = Lab::new(&|t| {
        let ids = t.parties.clone();
        t.abandonment = Some(Abandonment {
            authority: Authority::Others(2),
            outcomes: vec![outcomes::VOICE_REMOVED],
            proof: None,
        });
        let g = t.grammar.as_mut().unwrap();
        g.chain_key = Holding::Shares { threshold: 2, members: ids };
        g.recovery = None;
    });
    let f = lab.founding;
    // Signing key 2 of 3: the label can draw its line without Cy.
    let d = lab.declare(Some(ANA), f, f, CY, vec![outcomes::VOICE_REMOVED]);
    let sb = lab.sign(BEN, &d);
    let ids = lab.ids();
    let keep = vec![ids[ANA], ids[BEN]];
    let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN])], &|t| {
        t.parties = keep.clone();
        t.abandonment.as_mut().unwrap().authority = Authority::Others(1);
        let g = t.grammar.as_mut().unwrap();
        g.chain_key = Holding::Shares { threshold: 1, members: keep.clone() };
    });
    let k = lab.propose(ANA, &t);
    let s1 = lab.sign(ANA, &k);
    let s2 = lab.sign(BEN, &k);
    lab.recover(k, vec![s1, s2], vec![sb], &[0]);
    let y = lab.publish(0);
    lab.sign(ANA, &y);
    let got = lab.view().consent(&y);
    assert!(matches!(&got, Ok(Consent::Broken { reason }) if reason.contains("B18")), "{got:?}");
}

/// 3.8 (F105, Q19, Q21, rule 37b): a dead member's seat passes by
/// nomination; the Money lane they held stands frozen until the
/// constitutional clone refits it.
#[test]
fn a_seat_passes_by_nomination_after_a_declaration() {
    let mut lab = Lab::new(&|_| {});
    let dee = lab.w.genesis("dee", vec![own_home()], None, None);
    let ids = lab.ids();
    let plan = SuccessionPlan {
        party: ids[BEN],
        stakes: Some(vec![(spec("child one"), 500_000), (spec("child two"), 500_000)]),
        seats: Some(vec![dee.id]),
        entry: Some(1),
    };
    let f = lab.founding;
    let k0 = lab.add_plan(&f, &[ANA, BEN, CY], plan);
    let d = lab.declare(None, k0, k0, BEN, vec![outcomes::VOICE_REMOVED]);
    lab.record(0, None, &[], vec![d], k0);
    // The Money lane has nobody left: a receipt counts for nothing.
    let x = lab.cmip_act(0, pay());
    lab.sign(BEN, &x);
    assert!(areas(&lab.consent(&x))[0].1, "frozen");
    assert!(!lab.counts(&x));
    // The plan is a nomination: a clone marked with it is invalid.
    let new = vec![ids[ANA], ids[CY], dee.id];
    let auth = lab.authority.id;
    let shape = |t: &mut Terms| {
        t.parties = new.clone();
        t.succession = None;
        let g = t.grammar.as_mut().unwrap();
        g.chain_key = Holding::Shares { threshold: 3, members: new.clone() };
        g.recovery = Some(Recovery::Escrow { authority: auth });
        t.areas.as_mut().unwrap()[1].holders = vec![new[2]];
    };
    let mut tp = lab.clone_terms(&k0, vec![], &shape);
    tp.field4 = Field4::Mark(vec![MarkEntry { power: Power::Plan(ids[BEN]), signers: vec![dee.id] }]);
    let kp = lab.propose(ANA, &tp);
    assert!(lab.view().agreement(&kp).unwrap().invalid.is_some());
    // The nomination: a constitutional clone signed by the voices that
    // remain and by Dee, refitting the Money lane with Dee.
    // F122: the executed plan is dropped too, a judicial change: every
    // member whose voice remains for it, the same two.
    let t = lab.clone_terms(&k0, vec![(Power::Constitutional, vec![ANA, CY]), (Power::Judicial, vec![ANA, CY])], &shape);
    let k = lab.propose(ANA, &t);
    let sa = lab.sign(ANA, &k);
    let sc = lab.sign(CY, &k);
    let mut dee = dee;
    let sd = lab.sign_by(&mut dee, &k);
    lab.rotate(Some((k, vec![sa, sc, sd])), &[0]);
    let y = lab.cmip_act(0, pay());
    sign(&mut lab.w, &mut dee, &y);
    assert_eq!(lab.in_force(&y), k);
    assert!(lab.counts(&y));
}

/// 3.8b (rules 44c, 48b, 48c; Q14, Q21, Q26; Flaw B14): a clone marked
/// with an automatic succession plan. The successor takes the departed
/// member's place in the parties and in every holding of the key grammar,
/// every threshold unchanged, the executed plan dropped; the rotation
/// declaring it re-deals the keys to include the successor.
#[test]
fn a_seat_passes_by_automatic_succession() {
    // (declared, a stranger's plan cloned by two of three, Ben holds Money alone)
    for (declared, stranger, alone) in [
        (true, false, false),
        (false, false, false),
        (true, true, false),
        (true, false, true),
    ] {
        let mut lab = Lab::new(&|t| {
            if !alone {
                // Money held by Ana and Ben, deciding together (the fifth case).
                let ids = t.parties.clone();
                let fin = &mut t.areas.as_mut().unwrap()[1];
                fin.holders = vec![ids[ANA], ids[BEN]];
                fin.threshold = 2;
            }
        });
        let mut dee = lab.w.genesis("dee", vec![own_home()], None, None);
        let ids = lab.ids();
        let plan = SuccessionPlan {
            party: ids[BEN],
            stakes: Some(vec![(spec("child one"), 500_000), (spec("child two"), 500_000)]),
            seats: Some(vec![dee.id]),
            entry: Some(0),
        };
        let f = lab.founding;
        if stranger {
            // F121: a plan is judicial, and two of three never change it,
            // so the stranger's plan never comes into force.
            let t = lab.clone_terms(&f, vec![(Power::Judicial, vec![ANA, BEN])], &|t| {
                t.succession = Some(vec![plan.clone()]);
            });
            let k = lab.propose(ANA, &t);
            let sigs: Vec<Hash> = [ANA, BEN].iter().map(|i| lab.sign(*i, &k)).collect();
            let r = lab.record(0, Some((k, sigs)), &[], vec![], k);
            assert_eq!(puts(&lab, &r), None, "two of three never change a plan (F121)");
            continue;
        }
        let k0 = lab.add_plan(&f, &[ANA, BEN, CY], plan.clone());
        if declared {
            let d = lab.declare(None, k0, k0, BEN, vec![outcomes::VOICE_REMOVED]);
            lab.record(0, None, &[], vec![d], k0);
        }
        // Dee in Ben's place, in the parties and in every holding.
        let new = vec![ids[ANA], dee.id, ids[CY]];
        let shape = |t: &mut Terms| {
            t.parties = new.clone();
            t.succession = None;
            let g = t.grammar.as_mut().unwrap();
            g.chain_key = Holding::Shares { threshold: 3, members: new.clone() };
            // Ben off the Money lane; its number kept (Q26).
            let fin = &mut t.areas.as_mut().unwrap()[1];
            fin.holders.retain(|h| *h != ids[BEN]);
            // Ben's shares to his two children, half each, as his plan gives
            // (rules 64 and 83, F406).
            for st in t.stakes.iter_mut().flatten() {
                let ben = Who::Id(ids[BEN]);
                let n = st.share_of(&ben);
                if n > 0 {
                    st.holders.retain(|(w, _)| *w != ben);
                    st.holders.push((Who::Id(spec("child one")), n / 2));
                    st.holders.push((Who::Id(spec("child two")), n - n / 2));
                }
            }
        };
        let planned = |lab: &Lab, extra: &dyn Fn(&mut Terms)| {
            let mut t = lab.clone_terms(&k0, vec![], &shape);
            extra(&mut t);
            t.field4 = Field4::Mark(vec![MarkEntry { power: Power::Plan(ids[BEN]), signers: vec![dee.id] }]);
            t
        };
        if declared && !stranger && !alone {
            // What a plan cannot do (rule 44c, Q26, B14).
            let other = SuccessionPlan { party: ids[ANA], stakes: None, seats: Some(vec![dee.id]), entry: Some(1) };
            for (why, extra) in [
                ("it lowers the area's number", &(|t: &mut Terms| t.areas.as_mut().unwrap()[1].threshold = 1) as &dyn Fn(&mut Terms)),
                ("it names a new holder", &|t: &mut Terms| t.areas.as_mut().unwrap()[0].holders.push(t.parties[1])),
                ("it changes the words", &|t: &mut Terms| t.text = "Other words.".into()),
                ("it lowers a threshold of the keys", &|t: &mut Terms| {
                    let m = t.parties.clone();
                    t.grammar.as_mut().unwrap().chain_key = Holding::Shares { threshold: 2, members: m };
                }),
                ("it leaves Dee out of the chain key", &|t: &mut Terms| {
                    let m = vec![t.parties[0], t.parties[2]];
                    t.grammar.as_mut().unwrap().chain_key = Holding::Shares { threshold: 2, members: m };
                }),
                ("it keeps the executed plan", &|t: &mut Terms| {
                    let mut p = plan.clone();
                    p.party = t.parties[1];
                    t.succession = Some(vec![p]);
                }),
                ("it adds another plan", &|t: &mut Terms| t.succession = Some(vec![other.clone()])),
                ("it reorders the others", &|t: &mut Terms| t.parties = vec![t.parties[2], t.parties[1], t.parties[0]]),
            ] {
                let t = planned(&lab, extra);
                let k = lab.propose(ANA, &t);
                assert!(lab.view().agreement(&k).unwrap().invalid.is_some(), "{why}");
            }
            let mut t = planned(&lab, &|_| {});
            t.field4 = Field4::Mark(vec![
                MarkEntry { power: Power::Clone, signers: vec![ids[ANA]] },
                MarkEntry { power: Power::Plan(ids[BEN]), signers: vec![dee.id] },
            ]);
            let k = lab.propose(ANA, &t);
            assert!(lab.view().agreement(&k).unwrap().invalid.is_some(), "the plan names nothing else");
        }
        let t = planned(&lab, &|_| {});
        let k = lab.propose(ANA, &t);
        assert_eq!(lab.view().agreement(&k).unwrap().invalid, None);
        let sd = lab.sign_by(&mut dee, &k);
        lab.rotate(Some((k, vec![sd])), &[0]);
        let y = lab.publish(0);
        lab.sign(ANA, &y);
        let got = lab.view().consent(&y);
        match (declared, stranger) {
            (true, false) => {
                assert!(matches!(&got, Ok(c) if c.counts()), "{got:?}");
                assert_eq!(lab.in_force(&y), k);
                let cur = lab.view().current(&lab.col.id).unwrap().unwrap();
                assert_eq!(cur.agreement, k);
                let x = lab.cmip_act(0, pay());
                if alone {
                    // Q21, Q22: Ben held Money alone; it stands frozen.
                    assert!(cur.frozen.contains(&2));
                    sign(&mut lab.w, &mut dee, &x);
                    lab.sign(ANA, &x);
                    assert!(!lab.counts(&x));
                } else {
                    // Q26, flaw C: Ana alone meets Money's two.
                    assert!(cur.frozen.is_empty());
                    lab.sign(ANA, &x);
                    assert!(lab.counts(&x));
                }
                // Dee now has the seat: a constitutional clone needs Dee.
                let t2 = lab.clone_terms(&k, vec![(Power::Constitutional, vec![ANA, CY])], &|t| {
                    t.text = "New words.".into();
                });
                let k2 = lab.propose(ANA, &t2);
                let s1 = lab.sign(ANA, &k2);
                let s2 = lab.sign(CY, &k2);
                lab.rotate(Some((k2, vec![s1, s2])), &[0]);
                let z = lab.publish(0);
                lab.sign(ANA, &z);
                assert!(!lab.counts(&z), "Dee's voice counts: two of three do not meet everyone");
            }
            // No trigger: a draft.
            (false, _) => assert!(
                matches!(&got, Ok(Consent::Broken { reason }) if reason.contains("trigger")),
                "{got:?}"
            ),
            // The stranger: Cy never signed that plan.
            (true, true) => assert!(
                matches!(&got, Ok(Consent::Broken { reason }) if reason.contains("never signed a version carrying this plan")),
                "{got:?}"
            ),
        }
    }
}

/// Flaw B14's remaining point, now written (Agreements draft 17, rule 83):
/// a clone marked with the plan alone that places the successor elsewhere
/// than in the party's place among the parties changes more than the plan
/// gives, a false mark: invalid against its parent, never in force. (A
/// seat's voting weight is out of format since Agreements draft 14, F328,
/// Q15: `a_seat_weight_is_out_of_format_3_8d`.) The name is kept from when
/// the point was open, as the audit tables cite it.
#[test]
fn what_b14_leaves_open_is_refused() {
    for case in ["placed last"] {
        let mut lab = Lab::new(&|_| {});
        let dee = lab.w.genesis("dee", vec![own_home()], None, None);
        let ids = lab.ids();
        let plan = SuccessionPlan { party: ids[BEN], stakes: None, seats: Some(vec![dee.id]), entry: Some(0) };
        let f = lab.founding;
        let k0 = lab.add_plan(&f, &[ANA, BEN, CY], plan);
        let d = lab.declare(None, k0, k0, BEN, vec![outcomes::VOICE_REMOVED]);
        lab.record(0, None, &[], vec![d], k0);
        let order = if case == "placed last" { vec![ids[ANA], ids[CY], dee.id] } else { vec![ids[ANA], dee.id, ids[CY]] };
        let place = vec![ids[ANA], dee.id, ids[CY]];
        let mut t = lab.clone_terms(&k0, vec![], &|t| {
            t.parties = order.clone();
            t.succession = None;
            let g = t.grammar.as_mut().unwrap();
            g.chain_key = Holding::Shares { threshold: 3, members: place.clone() };
            t.areas.as_mut().unwrap()[1].holders = vec![];
        });
        t.field4 = Field4::Mark(vec![MarkEntry { power: Power::Plan(ids[BEN]), signers: vec![dee.id] }]);
        let k = lab.propose(ANA, &t);
        let invalid = lab.view().agreement(&k).unwrap().invalid;
        assert!(invalid.as_deref().is_some_and(|w| w.contains("false mark")), "{case}: {invalid:?}");
    }
}

/// Flaw B17 (freeze suite v20, step 8b, the sixth collective): where Ben
/// holds the chain key alone, the succession clone that passes his seat to
/// Dee also carries Dee's own plan, naming her successor, in the executed
/// plan's place, signed by Dee in that clone; it comes into force, and Dee
/// holds the key with a successor named (rule 36, F96). Without that plan,
/// or with it for someone else, out of place, or where the party did not
/// hold the chain key alone, the clone is invalid.
#[test]
fn a_sole_chain_key_holders_successor_names_their_own_successor() {
    // Founded with a first successor named for Ben (rule 36); the members
    // then name Dee instead, all three signing, so Ben's seat passes
    // automatically (Q14).
    let mut lab = Lab::new(&|t| {
        let ids = t.parties.clone();
        t.grammar.as_mut().unwrap().chain_key = Holding::One(ids[BEN]);
        t.succession = Some(vec![SuccessionPlan {
            party: ids[BEN],
            stakes: None,
            seats: Some(vec![spec("a first successor")]),
            entry: Some(1),
        }]);
    });
    let mut dee = lab.w.genesis("dee", vec![own_home()], None, None);
    let ids = lab.ids();
    let deesucc = spec("Dee's successor");
    let ben_plan = SuccessionPlan {
        party: ids[BEN],
        stakes: None,
        seats: Some(vec![dee.id]),
        entry: Some(0),
    };
    let ana_plan = SuccessionPlan { party: ids[ANA], stakes: None, seats: Some(vec![spec("Ana's heir")]), entry: Some(1) };
    let dee_plan = SuccessionPlan { party: dee.id, stakes: None, seats: Some(vec![deesucc]), entry: Some(1) };
    let f = lab.founding;
    let t0 = lab.clone_terms(&f, vec![(Power::Judicial, vec![ANA, BEN, CY])], &|t| {
        t.succession = Some(vec![ben_plan.clone(), ana_plan.clone()]);
    });
    let k0 = lab.propose(ANA, &t0);
    let sigs: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &k0)).collect();
    lab.record(0, Some((k0, sigs)), &[], vec![], k0);
    let d = lab.declare(None, k0, k0, BEN, vec![outcomes::VOICE_REMOVED]);
    lab.record(0, None, &[], vec![d], k0);
    let new = vec![ids[ANA], dee.id, ids[CY]];
    let planned = |lab: &Lab, plans: Vec<SuccessionPlan>| {
        let mut t = lab.clone_terms(&k0, vec![], &|t| {
            t.parties = new.clone();
            t.succession = Some(plans.clone());
            let g = t.grammar.as_mut().unwrap();
            g.chain_key = Holding::One(dee.id);
            t.areas.as_mut().unwrap()[1].holders = vec![];
        });
        t.field4 = Field4::Mark(vec![MarkEntry { power: Power::Plan(ids[BEN]), signers: vec![dee.id] }]);
        t
    };
    let mut for_cy = dee_plan.clone();
    for_cy.party = ids[CY];
    for (why, plans) in [
        ("no plan for Dee: the key has no successor named", vec![ana_plan.clone()]),
        ("the plan is not Dee's", vec![for_cy, ana_plan.clone()]),
        ("Dee's plan out of the executed plan's place", vec![ana_plan.clone(), dee_plan.clone()]),
        ("Dee's plan names no successor", vec![SuccessionPlan { seats: None, ..dee_plan.clone() }, ana_plan.clone()]),
    ] {
        let t = planned(&lab, plans);
        let k = lab.propose(ANA, &t);
        // Invalid by rule 36 on its own terms, or against its parent (rule 44c).
        let bad = match lab.view().agreement(&k) {
            Err(AgreementsError::Check(_)) => true,
            Ok(a) => a.invalid.is_some(),
            Err(e) => panic!("{why}: {e:?}"),
        };
        assert!(bad, "{why}");
    }
    let t = planned(&lab, vec![dee_plan.clone(), ana_plan.clone()]);
    let k = lab.propose(ANA, &t);
    assert_eq!(lab.view().agreement(&k).unwrap().invalid, None);
    let sd = lab.sign_by(&mut dee, &k);
    lab.rotate(Some((k, vec![sd])), &[0]);
    let y = lab.publish(0);
    lab.sign(ANA, &y);
    let got = lab.view().consent(&y);
    assert!(matches!(&got, Ok(c) if c.counts()), "{got:?}");
    assert_eq!(lab.in_force(&y), k);
    let cur = lab.view().terms(&k).unwrap();
    assert_eq!(cur.grammar.unwrap().chain_key, Holding::One(dee.id));
    assert!(cur.succession.unwrap().iter().any(|p| p.party == dee.id && p.seats.as_ref().is_some_and(|s| s[0] == deesucc)));
}

/// Flaw B17 adds a plan only where the party held the chain key alone: in
/// the label, whose chain key all three hold, a succession clone adding
/// one for the successor changes more than the plan gives.
#[test]
fn a_succession_clone_adds_no_plan_where_the_key_is_shared() {
    let mut lab = Lab::new(&|_| {});
    let dee = lab.w.genesis("dee", vec![own_home()], None, None);
    let ids = lab.ids();
    let plan = SuccessionPlan { party: ids[BEN], stakes: None, seats: Some(vec![dee.id]), entry: Some(0) };
    let f = lab.founding;
    let k0 = lab.add_plan(&f, &[ANA, BEN, CY], plan);
    let new = vec![ids[ANA], dee.id, ids[CY]];
    let mut t = lab.clone_terms(&k0, vec![], &|t| {
        t.parties = new.clone();
        t.succession = Some(vec![SuccessionPlan { party: dee.id, stakes: None, seats: Some(vec![spec("Dee's successor")]), entry: Some(1) }]);
        let g = t.grammar.as_mut().unwrap();
        g.chain_key = Holding::Shares { threshold: 3, members: new.clone() };
        t.areas.as_mut().unwrap()[1].holders = vec![];
    });
    t.field4 = Field4::Mark(vec![MarkEntry { power: Power::Plan(ids[BEN]), signers: vec![dee.id] }]);
    let k = lab.propose(ANA, &t);
    let got = lab.view().agreement(&k).unwrap().invalid;
    assert!(got.as_deref().is_some_and(|w| w.contains("B14")), "{got:?}");
}

// ---------------------------------------------------------------- scenario 1: a deal

/// Scenario 1, steps 6, 7 and 9b (F107): a deal changes only with every
/// party's signature.
#[test]
fn a_deal_changes_only_with_everyone() {
    let mut w = World::new();
    let mut m: Vec<Person> = ["p1", "p2", "p3"]
        .iter()
        .map(|n| w.genesis(n, vec![own_home()], None, None))
        .collect();
    let ids: Vec<Hash> = m.iter().map(|p| p.id).collect();
    let deal = Terms {
        parties: ids.clone(),
        layers: None,
        text: "The film's contributors share its revenue.".into(),
        cmips: vec![(6, pay()), (11, anchor())],
        keepers: None,
        field4: Field4::Rule(Rule::All),
        clone: Rule::All,
        time: None,
        abandonment: None,
        parent: None,
        grammar: None,
        arbitrators: None,
        extensions: None,
        succession: None,
        constitutional: None,
        areas: None,
        area_words: None,
        chain: None,
        departed: None,
        stakes: None,
        target: None,
        forked_from: None,
        release_rule: None,
        settles: None,
        fork_judge: None,
        plan: None,
        refund: None,
        fees: None,
        holders_rules: None,
        transfers_counted: None,
        issues_under: None,
    };
    let d = agreements_act(&mut w, &mut m[0], agreements::types::TERMS, deal.to_map(), None);
    sign(&mut w, &mut m[0], &d);
    sign(&mut w, &mut m[1], &d);
    assert_eq!(view(&w).agreement(&d).unwrap().exists, Some(false));
    sign(&mut w, &mut m[2], &d);
    assert_eq!(view(&w).agreement(&d).unwrap().exists, Some(true));

    let mut c = deal.clone();
    c.parent = Some(d);
    c.field4 = Field4::Mark(vec![MarkEntry {
        power: Power::Clone,
        signers: sorted(ids.clone()),
    }]);
    c.cmips = vec![(6, pay2()), (11, anchor())];
    let k = agreements_act(&mut w, &mut m[0], agreements::types::TERMS, c.to_map(), obj(d));
    sign(&mut w, &mut m[0], &k);
    assert_eq!(view(&w).agreement(&k).unwrap().exists, Some(false), "1.6: one signs");
    sign(&mut w, &mut m[1], &k);
    assert_eq!(view(&w).agreement(&k).unwrap().exists, Some(false), "1.9b: two of three");
    sign(&mut w, &mut m[2], &k);
    assert_eq!(view(&w).agreement(&k).unwrap().exists, Some(true), "1.7: everyone");

    // A deal's clone whose mark names two parties: invalid.
    let mut c2 = c.clone();
    c2.field4 = Field4::Mark(vec![MarkEntry {
        power: Power::Clone,
        signers: sorted(ids[..2].to_vec()),
    }]);
    let k2 = agreements_act(&mut w, &mut m[0], agreements::types::TERMS, c2.to_map(), obj(d));
    assert!(view(&w).agreement(&k2).unwrap().invalid.is_some());
}

/// Q28 in a deal (the reading confirmed in the seventh pass): a
/// declaration draws its own line; a party's signature on a clone counts
/// only where the deal's keeper recorded it before recording the
/// declaration; the others need the declared party no more.
#[test]
fn in_a_deal_a_declaration_draws_its_own_line() {
    for case in ["unsigned", "recorded before", "recorded after"] {
        let mut w = World::new();
        let mut m: Vec<Person> = ["p1", "p2", "p3"]
            .iter()
            .map(|n| w.genesis(n, vec![own_home()], None, None))
            .collect();
        let mut authority = w.genesis("authority", vec![own_home()], None, None);
        let keeper = w.genesis("keeper", vec![own_home()], None, None);
        let ids: Vec<Hash> = m.iter().map(|p| p.id).collect();
        let deal = Terms {
            parties: ids.clone(),
            layers: None,
            text: "The film's contributors share its revenue.".into(),
            cmips: vec![(6, pay()), (11, anchor())],
            keepers: Some(Keepers { operators: vec![keeper.id], rule: Rule::All }),
            field4: Field4::Rule(Rule::All),
            clone: Rule::All,
            time: None,
            abandonment: Some(Abandonment {
                authority: Authority::Named(authority.id),
                outcomes: vec![outcomes::VOICE_REMOVED],
                proof: None,
            }),
            parent: None,
            grammar: None,
            arbitrators: None,
            extensions: None,
            succession: None,
            constitutional: None,
            areas: None,
            area_words: None,
            chain: None,
            departed: None,
            stakes: None,
            target: None,
            forked_from: None,
            release_rule: None,
            settles: None,
            fork_judge: None,
            plan: None,
            refund: None,
            fees: None,
            holders_rules: None,
            transfers_counted: None,
            issues_under: None,
        };
        let d = agreements_act(&mut w, &mut m[0], agreements::types::TERMS, deal.to_map(), None);
        for p in m.iter_mut() {
            sign(&mut w, p, &d);
        }
        let mark = |who: &[usize]| {
            let mut c = deal.clone();
            c.parent = Some(d);
            c.cmips = vec![(6, pay2()), (11, anchor())];
            c.field4 = Field4::Mark(vec![MarkEntry {
                power: Power::Clone,
                signers: sorted(who.iter().map(|i| ids[*i]).collect()),
            }]);
            c
        };
        let two = agreements_act(&mut w, &mut m[0], agreements::types::TERMS, mark(&[0, 1]).to_map(), obj(d));
        let three = agreements_act(&mut w, &mut m[0], agreements::types::TERMS, mark(&[0, 1, 2]).to_map(), obj(d));
        for k in [two, three] {
            sign(&mut w, &mut m[0], &k);
            sign(&mut w, &mut m[1], &k);
        }
        let s3 = (case != "unsigned").then(|| sign(&mut w, &mut m[2], &three));
        let decl = AbsenceDeclaration {
            agreement: d,
            clause: d,
            party: ids[2],
            outcomes: vec![outcomes::VOICE_REMOVED],
        };
        // Before the declaration: two of three is no deal clone.
        assert!(view(&w).agreement(&two).unwrap().invalid.is_some());
        let x = agreements_act(&mut w, &mut authority, agreements::types::DECLARATION, decl.to_map(), obj(d));
        let mut v = view(&w);
        let log = match (case, s3) {
            ("recorded before", Some(s)) => vec![s, x],
            ("recorded after", Some(s)) => vec![x, s],
            _ => vec![x],
        };
        v.keeper_logs.insert(keeper.id, log);
        let a2 = v.agreement(&two).unwrap();
        let a3 = v.agreement(&three).unwrap();
        // Either way, p3's voice is gone for the clone p3 never signed.
        assert_eq!(a2.exists, Some(true), "{case}: {:?}", a2.invalid);
        if case == "recorded before" {
            // p3's signature on `three` was placed before the declaration:
            // p3 counts as a voice for it (Q23, Q28), named in its mark.
            assert_eq!(a3.exists, Some(true), "{case}: {:?}", a3.invalid);
        } else {
            assert_eq!(a2.exists, Some(true), "{case}: {:?}", a2.invalid);
            assert!(a3.invalid.is_some(), "{case}");
        }
    }
}

/// Flaw B19 (freeze suite v20, scenario 1, step 9c): in a deal the
/// absence authority is one identity. Terms naming a threshold of the other
/// parties, whatever its number, are invalid; terms naming a collective the
/// contributors formed are valid, and its declaration, signed with its own
/// key, removes a voice from its own place, as the deal's keepers record it.
#[test]
fn in_a_deal_the_absence_authority_is_one_identity() {
    let mut w = World::new();
    let mut m: Vec<Person> = ["p1", "p2", "p3"]
        .iter()
        .map(|n| w.genesis(n, vec![own_home()], None, None))
        .collect();
    let keeper = w.genesis("keeper", vec![own_home()], None, None);
    // The collective the contributors formed, as the authority.
    let mut board = w.genesis("the contributors' collective", vec![own_home()], None, None);
    let ids: Vec<Hash> = m.iter().map(|p| p.id).collect();
    let deal = |authority: Authority| Terms {
        parties: ids.clone(),
        layers: None,
        text: "The second film's contributors share its revenue.".into(),
        cmips: vec![(6, pay()), (11, anchor())],
        keepers: Some(Keepers { operators: vec![keeper.id], rule: Rule::All }),
        field4: Field4::Rule(Rule::All),
        clone: Rule::All,
        time: None,
        abandonment: Some(Abandonment { authority, outcomes: vec![outcomes::VOICE_REMOVED], proof: None }),
        parent: None,
        grammar: None,
        arbitrators: None,
        extensions: None,
        succession: None,
        constitutional: None,
        areas: None,
        area_words: None,
        chain: None,
        departed: None,
        stakes: None,
        target: None,
        forked_from: None,
        release_rule: None,
        settles: None,
        fork_judge: None,
        plan: None,
        refund: None,
        fees: None,
        holders_rules: None,
        transfers_counted: None,
        issues_under: None,
    };
    for k in [1, 2] {
        let got = deal(Authority::Others(k)).check(&mirs());
        assert!(matches!(&got, Err(AgreementsError::Check(w)) if w.contains("B19")), "{k}: {got:?}");
        // Signed by every party, still no deal.
        let d = agreements_act(&mut w, &mut m[0], agreements::types::TERMS, deal(Authority::Others(k)).to_map(), None);
        for p in m.iter_mut() {
            sign(&mut w, p, &d);
        }
        assert!(view(&w).agreement(&d).is_err(), "{k}");
    }
    let t = deal(Authority::Named(board.id));
    assert_eq!(t.check(&mirs()), Ok(()));
    let d = agreements_act(&mut w, &mut m[0], agreements::types::TERMS, t.to_map(), None);
    for p in m.iter_mut() {
        sign(&mut w, p, &d);
    }
    let mut c = t.clone();
    c.parent = Some(d);
    c.cmips = vec![(6, pay2()), (11, anchor())];
    c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![ids[0], ids[1]]) }]);
    let two = agreements_act(&mut w, &mut m[0], agreements::types::TERMS, c.to_map(), obj(d));
    sign(&mut w, &mut m[0], &two);
    sign(&mut w, &mut m[1], &two);
    assert!(view(&w).agreement(&two).unwrap().invalid.is_some(), "p3 still counts");
    let decl = AbsenceDeclaration { agreement: d, clause: d, party: ids[2], outcomes: vec![outcomes::VOICE_REMOVED] };
    let x = agreements_act(&mut w, &mut board, agreements::types::DECLARATION, decl.to_map(), obj(d));
    let mut v = view(&w);
    v.keeper_logs.insert(keeper.id, vec![x]);
    let a2 = v.agreement(&two).unwrap();
    assert_eq!(a2.exists, Some(true), "{:?}", a2.invalid);
}

/// Freeze scenario 1, step 9, and its pass condition (F172): the deal's
/// clause names the keeper's operator as the authority on absence, with
/// no absence-proof cMIP, so the declaration is that identity's judgment
/// (one identity, Flaw B19), checked for signer, outcome and version, no
/// anchor read. p1, with nothing to sign for months, posts a liveness act:
/// shown beside any declaration. p2 goes silent on the deal while active
/// elsewhere; the operator declares p2 absent, removing the voice and
/// redistributing the stake. The declaration moves nothing until a clone
/// puts its outcome in force: the deal's terms stay as they were, and the
/// clone without p2, no clone before, completes. p2 then contests it
/// and comes back on the deal: nothing undoes the clone (rule 51). A
/// declaration by anyone else is none.
#[test]
fn scenario_1_step_9_absence_is_the_authoritys_judgment() {
    let mut w = World::new();
    let mut m: Vec<Person> = ["p1", "p2", "p3"]
        .iter()
        .map(|n| w.genesis(n, vec![own_home()], None, None))
        .collect();
    let mut keeper = w.genesis("keeper", vec![own_home()], None, None);
    let mut stranger = w.genesis("a stranger", vec![own_home()], None, None);
    let ids: Vec<Hash> = m.iter().map(|p| p.id).collect();
    let mut terms = deal_terms(ids[0], ids[1]);
    terms.parties = ids.clone();
    terms.text = "The film's contributors share its revenue.".into();
    terms.keepers = Some(Keepers { operators: vec![keeper.id], rule: Rule::All });
    terms.time = Some((spec("a block height reference"), Value::Uint(0)));
    terms.abandonment = Some(Abandonment {
        authority: Authority::Named(keeper.id),
        outcomes: vec![outcomes::VOICE_REMOVED, outcomes::STAKE_REDISTRIBUTED],
        proof: None,
    });
    assert_eq!(terms.check(&mirs()), Ok(()));
    let d = agreements_act(&mut w, &mut m[0], agreements::types::TERMS, terms.to_map(), None);
    for p in m.iter_mut() {
        sign(&mut w, p, &d);
    }
    // p1's liveness act on the deal.
    let live = agreements_act(&mut w, &mut m[0], 12, liveness(d), obj(d));
    // p2, busy elsewhere.
    let elsewhere = agreements_act(&mut w, &mut m[1], agreements::types::TERMS, Terms { parties: vec![ids[1]], ..terms.clone() }.to_map(), None);
    agreements_act(&mut w, &mut m[1], 12, liveness(elsewhere), obj(elsewhere));
    // p1 and p3 sign a clone without p2, redistributing the stake.
    let mut c = terms.clone();
    c.parent = Some(d);
    c.parties = vec![ids[0], ids[2]];
    c.text = "The film's contributors share its revenue; p2's share is redistributed.".into();
    c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![ids[0], ids[2]]) }]);
    let k = agreements_act(&mut w, &mut m[0], agreements::types::TERMS, c.to_map(), obj(d));
    sign(&mut w, &mut m[0], &k);
    sign(&mut w, &mut m[2], &k);
    assert!(view(&w).agreement(&k).unwrap().invalid.is_some(), "no declaration yet: p2 still counts");
    // A stranger's declaration is none.
    let decl = AbsenceDeclaration {
        agreement: d,
        clause: d,
        party: ids[1],
        outcomes: vec![outcomes::VOICE_REMOVED, outcomes::STAKE_REDISTRIBUTED],
    };
    let odd = agreements_act(&mut w, &mut stranger, agreements::types::DECLARATION, decl.to_map(), obj(d));
    assert!(view(&w).declaration(&odd).unwrap().is_err());
    // The operator's, with no anchor anywhere, counts.
    let x = agreements_act(&mut w, &mut keeper, agreements::types::DECLARATION, decl.to_map(), obj(d));
    assert!(view(&w).declaration(&x).unwrap().is_ok(), "{:?}", view(&w).declaration(&x).unwrap().err());
    let judged = |w: &World, log: Vec<Hash>| {
        let mut v = view(w);
        v.keeper_logs.insert(keeper.id, log);
        v.agreement(&k).unwrap()
    };
    // The declaration moves nothing by itself: the deal's own terms still
    // name p2; what changes is the clone it lets complete, from the
    // declaration on (rule 53, Q28).
    assert!(view(&w).terms(&d).unwrap().parties.contains(&ids[1]));
    assert_eq!(judged(&w, vec![odd, x]).exists, Some(true), "{:?}", judged(&w, vec![odd, x]).invalid);
    // p2 contests and comes back: the clone stands.
    let contest = agreements_act(&mut w, &mut m[1], 14, vec![], obj(x));
    agreements_act(&mut w, &mut m[1], 12, liveness(d), obj(d));
    sign(&mut w, &mut m[1], &k);
    assert!(w.v.get(&contest).is_some() && w.v.get(&live).is_some(), "both held, shown beside the declaration");
    let after = judged(&w, vec![odd, x]);
    assert_eq!(after.exists, Some(true), "no later act undoes it (F172): {:?}", after.invalid);
}

/// The reference absence-proof module (experimental, outside the core
/// path; F172), on what was freeze scenario 1, step 9 under F136 and F148:
/// a deal whose clause names the module in key 3, with a two-week period
/// on its block height (here 30 blocks), the keeper's operator the
/// authority on absence. The caller states the anchors (formats open) to
/// the module, never to the core. A liveness act on the deal protects its
/// party once anchored, whoever anchored it; one nobody anchored does not.
/// Activity elsewhere protects no one. A declaration anchored during a gap
/// and kept is accepted only if another party or the keeper acknowledged
/// it, anchored within one further period, with no act of the party on
/// the deal anchored between.
#[test]
fn the_reference_absence_proof_module_judges_by_anchors() {
    use agreements::view::reference_absence_proof as reference;
    let mut w = World::new();
    let mut m: Vec<Person> = ["p1", "p2", "p3"]
        .iter()
        .map(|n| w.genesis(n, vec![own_home()], None, None))
        .collect();
    let mut keeper = w.genesis("keeper", vec![own_home()], None, None);
    let mut stranger = w.genesis("a stranger", vec![own_home()], None, None);
    let ids: Vec<Hash> = m.iter().map(|p| p.id).collect();
    let terms = Terms {
        parties: ids.clone(),
        layers: None,
        text: "The film's contributors share its revenue.".into(),
        cmips: vec![(6, pay()), (11, anchor())],
        keepers: Some(Keepers { operators: vec![keeper.id], rule: Rule::All }),
        field4: Field4::Rule(Rule::All),
        clone: Rule::All,
        time: Some((spec("a block height reference"), Value::Uint(0))),
        abandonment: Some(Abandonment {
            authority: Authority::Named(keeper.id),
            outcomes: vec![outcomes::VOICE_REMOVED, outcomes::STAKE_REDISTRIBUTED],
            proof: Some((reference::spec(), reference::params(30))),
        }),
        parent: None,
        grammar: None,
        arbitrators: None,
        extensions: None,
        succession: None,
        constitutional: None,
        areas: None,
        area_words: None,
        chain: None,
        departed: None,
        stakes: None,
        target: None,
        forked_from: None,
        release_rule: None,
        settles: None,
        fork_judge: None,
        plan: None,
        refund: None,
        fees: None,
        holders_rules: None,
        transfers_counted: None,
        issues_under: None,
    };
    assert_eq!(terms.check(&mirs()), Ok(()));
    let d = agreements_act(&mut w, &mut m[0], agreements::types::TERMS, terms.to_map(), None);
    for p in m.iter_mut() {
        sign(&mut w, p, &d);
    }
    // Another agreement p2 is busy on.
    let elsewhere = agreements_act(&mut w, &mut m[1], agreements::types::TERMS, Terms { parties: vec![ids[1]], ..terms.clone() }.to_map(), None);
    let mut declare = |w: &mut World, party: usize| {
        let x = AbsenceDeclaration { agreement: d, clause: d, party: ids[party], outcomes: vec![outcomes::STAKE_REDISTRIBUTED] };
        agreements_act(w, &mut keeper, agreements::types::DECLARATION, x.to_map(), obj(d))
    };
    let judged = |w: &World, anchors: &[(Hash, u64)], x: &Hash| -> Result<(), String> {
        let anchors: std::collections::BTreeMap<Hash, u64> = anchors.iter().copied().collect();
        view(w).reference_absence_proof(x, &anchors).unwrap()
    };

    // p1, with nothing to sign for months, posts a liveness act on the deal
    // (type 12, its format open: here it names the deal), anchored at 95 by
    // a friend: it keeps their vote.
    let live = agreements_act(&mut w, &mut m[0], 12, liveness(d), obj(d));
    let d1 = declare(&mut w, 0);
    let ack1 = w.ack(&mut m[1], d1);
    let base = vec![(d1, 100), (ack1, 110)];
    let got = judged(&w, &[base.clone(), vec![(live, 95)]].concat(), &d1);
    assert!(got.as_ref().is_err_and(|e| e.contains("within the period")), "{got:?}");
    // The same liveness act, anchored by nobody, protects no one.
    assert_eq!(judged(&w, &base, &d1), Ok(()));
    // Anchored before the period, it no longer protects either.
    assert_eq!(judged(&w, &[base.clone(), vec![(live, 60)]].concat(), &d1), Ok(()));

    // p2 goes silent on the deal while active elsewhere: acts anchored
    // within the period, but not on the deal, protect nothing.
    let busy = agreements_act(&mut w, &mut m[1], 12, liveness(elsewhere), obj(elsewhere));
    let post = w.post(&mut m[1], "a post far from the film");
    let d2 = declare(&mut w, 1);
    let ack2 = w.ack(&mut m[0], d2);
    let got = judged(&w, &[(busy, 95), (post, 96), (d2, 100), (ack2, 105)], &d2);
    assert_eq!(got, Ok(()), "activity elsewhere is no presence (rule 50)");

    // p3 is away in January. The operator anchors a declaration at 100,
    // during the gap, and keeps it to themselves. p3 comes back and works
    // on the deal every week (anchored at 140, 170, 200...). Published in
    // October, the declaration is acknowledged then, at 400: too late.
    let d3 = declare(&mut w, 2);
    let mut back = vec![];
    for at in [140, 170, 200, 230] {
        let x = agreements_act(&mut w, &mut m[2], 12, liveness(d), obj(d));
        back.push((x, at));
    }
    let late = w.ack(&mut m[0], d3);
    let got = judged(&w, &[back.clone(), vec![(d3, 100), (late, 400)]].concat(), &d3);
    assert!(got.as_ref().is_err_and(|e| e.contains("one further period") && e.contains("F148")), "{got:?}");
    // Acknowledged in time, at 125, but p3's act on the deal at 110 lies
    // between the two: it does not count either.
    let early = w.ack(&mut m[1], d3);
    let mut returned = back.clone();
    returned.push((agreements_act(&mut w, &mut m[2], 12, liveness(d), obj(d)), 110));
    let got = judged(&w, &[returned, vec![(d3, 100), (late, 400), (early, 125)]].concat(), &d3);
    assert!(got.as_ref().is_err_and(|e| e.contains("between")), "{got:?}");
    // With nothing of p3's between, the acknowledgement at 125 makes it
    // count: p3's later acts cannot undo it (rule 52's contest shows it).
    assert_eq!(judged(&w, &[back.clone(), vec![(d3, 100), (early, 125)]].concat(), &d3), Ok(()));
    // An acknowledgement by the declared party, or by a stranger, is none.
    let own = w.ack(&mut m[2], d3);
    let odd = w.ack(&mut stranger, d3);
    let got = judged(&w, &[(d3, 100), (own, 105), (odd, 106)], &d3);
    assert!(got.as_ref().is_err_and(|e| e.contains("acknowledgement")), "{got:?}");
    // F158: the keeper's operator is the authority here and signed the
    // declaration: its own acknowledgement is none, or it could anchor both
    // in January, keep them, and publish them in October.
    let kept = w.ack(&mut keeper, d3);
    let got = judged(&w, &[(d3, 100), (kept, 105)], &d3);
    assert!(got.as_ref().is_err_and(|e| e.contains("F158")), "{got:?}");
    // Another party's acknowledgement, anchored as early, counts.
    let other = w.ack(&mut m[0], d3);
    assert_eq!(judged(&w, &[(d3, 100), (kept, 105), (other, 106)], &d3), Ok(()));
    // F162 (3): bounds are inclusive: p3's act on the deal anchored at the
    // declaration's own point protects p3.
    let same = agreements_act(&mut w, &mut m[2], 12, liveness(d), obj(d));
    let got = judged(&w, &[(d3, 100), (other, 106), (same, 100)], &d3);
    assert!(got.as_ref().is_err_and(|e| e.contains("within the period")), "{got:?}");
    // F162 (5): an act on a later version of the deal, a clone of it, is
    // presence on the deal.
    let mut c = terms.clone();
    c.parent = Some(d);
    c.text = "The film's contributors share its revenue, version two.".into();
    c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(ids.clone()) }]);
    let later = agreements_act(&mut w, &mut m[0], agreements::types::TERMS, c.to_map(), obj(d));
    let on_later = agreements_act(&mut w, &mut m[2], 12, liveness(later), obj(later));
    let got = judged(&w, &[(d3, 100), (other, 106), (on_later, 90)], &d3);
    assert!(got.as_ref().is_err_and(|e| e.contains("within the period")), "{got:?}");
    // Not anchored at all: it does not count (F136).
    let got = judged(&w, &[(early, 125)], &d3);
    assert!(got.as_ref().is_err_and(|e| e.contains("not anchored")), "{got:?}");
}

/// The reference absence-proof module (F172), F158 and F162 (5), in a
/// collective whose clause names it with a period, its
/// authority two of the other members: Ben declares Ana absent and Cy
/// signs the declaration too. Cy, one of its signers, cannot acknowledge
/// it (F158); the keeper can. Ana's act on the label's chain, anchored
/// within the period, is presence on the agreement (F162, 5).
#[test]
fn a_threshold_declarations_signers_do_not_acknowledge_it() {
    use agreements::view::reference_absence_proof as reference;
    let mut lab = Lab::new(&|t| {
        t.time = Some((spec("a block height reference"), Value::Uint(0)));
        t.abandonment = Some(Abandonment {
            authority: Authority::Others(2),
            outcomes: vec![outcomes::VOICE_REMOVED],
            proof: Some((reference::spec(), reference::params(30))),
        });
        let ids = t.parties.clone();
        let g = t.grammar.as_mut().unwrap();
        g.chain_key = Holding::Shares { threshold: 2, members: ids };
        g.recovery = None;
    });
    let f = lab.founding;
    let d = lab.declare(Some(BEN), f, f, ANA, vec![outcomes::VOICE_REMOVED]);
    lab.sign(CY, &d);
    let by_cy = lab.w.ack(&mut lab.m[CY], d);
    let by_keeper = lab.w.ack(&mut lab.keeper, d);
    let judged = |lab: &Lab, anchors: &[(Hash, u64)]| -> Result<(), String> {
        let anchors: std::collections::BTreeMap<Hash, u64> = anchors.iter().copied().collect();
        lab.view().reference_absence_proof(&d, &anchors).unwrap()
    };
    let got = judged(&lab, &[(d, 100), (by_cy, 105)]);
    assert!(got.as_ref().is_err_and(|e| e.contains("F158")), "a signer's acknowledgement is none: {got:?}");
    assert_eq!(judged(&lab, &[(d, 100), (by_cy, 105), (by_keeper, 106)]), Ok(()));
    // Ana works on the label's chain: an act of hers naming it in
    // `objects`, anchored at 95.
    let label = lab.col.id;
    let on_chain = agreements_act(&mut lab.w, &mut lab.m[ANA], 12, liveness(label), Some(vec![Object { chain: label, predecessor: label }]));
    let got = judged(&lab, &[(d, 100), (by_keeper, 106), (on_chain, 95)]);
    assert!(got.as_ref().is_err_and(|e| e.contains("within the period")), "{got:?}");
}

/// F162 (13), rule 36a, as Agreements draft 17 leaves it ("Areas": no
/// layer's rule and no area reaches a record, as none reaches a rotation;
/// an area reaches act types, the rotation's never): no area can be
/// given the collective's rotations, so Agreements show none reaching one,
/// and under Identity it counts all the same. A member's everyday Identity
/// act is their own, and counts for nothing in the collective's Agreements.
#[test]
fn an_identity_area_shows_its_consent_on_a_rotation() {
    let mut lab = Lab::new(&|_| {});
    let ids = lab.ids();
    // An area reaching rotations is refused, by kind or by layer.
    let mut t = lab.view().terms(&lab.founding).unwrap();
    let keys = |kinds: Vec<Kind>| Area { name: "Keys".into(), holders: vec![ids[BEN], ids[CY]], threshold: 2, kinds: Some(kinds), fields: None, id: 3, limits: None };
    t.areas.as_mut().unwrap().push(keys(vec![Kind::Type { spec: common::identity_spec(), type_: 1 }]));
    assert!(t.check(&mirs()).is_err(), "rotations are never in an area's reach");
    t.areas.as_mut().unwrap().pop();
    t.areas.as_mut().unwrap().push(keys(vec![Kind::Layer(agreements::layers::IDENTITY)]));
    assert!(t.check(&mirs()).is_err(), "a whole layer is field 19's");
    lab.publish(0);
    let r = lab.rotate(None, &[0]);
    let got = lab.view().rotation_consent(&r).unwrap();
    assert!(matches!(got, Consent::NoArea { .. }), "{got:?}");
    // The rotation counts under Identity.
    assert_eq!(lab.w.v.status(&r), Status::Valid);
    // A member's witness act counts for nothing in the label's Agreements
    // (F156): it names no collective.
    let x = lab.publish(0);
    let w = lab.ack(0, x);
    assert_eq!(lab.consent(&w), Consent::NotCollective);
}

/// 3.7n, R4: one cMIP for conversion (Money) and splitting (Agreements), the
/// lanes held by two members: its acts need both.
#[test]
fn a_specification_serving_two_layers_needs_both_lanes() {
    let conv = spec("a conversion and split cMIP");
    let mut lab = Lab::new(&|t| {
        t.cmips = vec![(6, pay()), (7, conv), (11, anchor()), (13, conv)];
        // The rules for Money and for Agreements (field 19): Ben's and Cy's.
        money_is_bens(t);
        let cy = t.parties[CY];
        for (l, r) in t.layers.as_mut().unwrap().iter_mut() {
            if *l == agreements::layers::AGREEMENTS {
                *r = Rule::Named(vec![cy]);
            }
        }
    });
    // Drawn by Ana, who holds neither lane.
    lab.hand_over(ANA);
    let x = lab.cmip_act(0, conv);
    lab.sign(BEN, &x);
    assert!(!lab.counts(&x));
    lab.sign(CY, &x);
    let a = areas(&lab.consent(&x));
    assert_eq!(a.len(), 2);
    assert!(lab.counts(&x));
}

/// 3.7j, F106, Q18: the release manager adopts an extension alone, and
/// one declaring Money needs the treasurer too.
#[test]
fn the_development_lane_adopts_extensions() {
    let fin = spec("an extension declaring Money");
    // The rules for Development and for Money (field 19): the release
    // manager's and the treasurer's.
    let mut lab = Lab::new(&|t| {
        money_is_bens(t);
        let ana = t.parties[ANA];
        for (l, r) in t.layers.as_mut().unwrap().iter_mut() {
            if *l == agreements::layers::DEVELOPMENT {
                *r = Rule::Named(vec![ana]);
            }
        }
    });
    let f = lab.founding;
    let (dev, money) = (Power::Layer(agreements::layers::DEVELOPMENT), Power::Layer(agreements::layers::MONEY));
    let t = lab.clone_terms(&f, vec![(dev.clone(), vec![ANA])], &|t| {
        t.extensions = Some(vec![ext(), fin]);
    });
    let k = lab.propose(ANA, &t);
    // The specification's field 10 is read by the caller (`Lab::view`).
    assert!(lab.view().agreement(&k).unwrap().invalid.is_some(), "marked by the manager alone");
    let t = lab.clone_terms(
        &f,
        vec![(money, vec![BEN]), (dev, vec![ANA])],
        &|t| t.extensions = Some(vec![ext(), fin]),
    );
    let k = lab.propose(ANA, &t);
    let sa = lab.sign(ANA, &k);
    let a = lab.view().agreement(&k).unwrap();
    assert!(a.invalid.is_none() && !a.ready, "waiting for the treasurer");
    let sb = lab.sign(BEN, &k);
    let r = lab.record(0, Some((k, vec![sa, sb])), &[], vec![], k);
    assert_eq!(puts(&lab, &r), Some(k));
    // An act of the new extension: the Development lane's.
    let e = lab.cmip_act(0, fin);
    lab.sign(ANA, &e);
    assert!(lab.counts(&e));
}

// ---------------------------------------------------------------- F121 to F124: endings, money, the pointer

fn obligation(lab: &mut Lab, creditor: &str, value: u64) -> Hash {
    let o = mor_core::money::Payload::Obligation(mor_core::money::Obligation {
        debtor: lab.col.id,
        creditor: spec(creditor),
        amount: mor_core::money::Amount { unit: spec("a unit"), value },
        pointer: spec("its pointer"),
        agreement: None,
    });
    let a = lab.w.everyday_act(&mut lab.c[0], mirs().money, 1, o.to_map(), None, None);
    let x = lab.w.add(&a);
    // A debt is a Money act: the Money lane's holder signs it, or it is
    // not the label's (rule 36a; `docs/law-invariants.md`, IC1).
    lab.sign(BEN, &x);
    x
}

/// A debt of the label to a creditor that is an identity, so that it can
/// sign a release (F125).
fn obligation_to(lab: &mut Lab, creditor: Hash, value: u64) -> Hash {
    let o = mor_core::money::Payload::Obligation(mor_core::money::Obligation {
        debtor: lab.col.id,
        creditor,
        amount: mor_core::money::Amount { unit: spec("a unit"), value },
        pointer: spec("its pointer"),
        agreement: None,
    });
    let a = lab.w.everyday_act(&mut lab.c[0], mirs().money, 1, o.to_map(), None, None);
    let x = lab.w.add(&a);
    lab.sign(BEN, &x);
    x
}

/// A receipt paying `value` toward an obligation, signed by its payee,
/// with the rail's answer stated as valid: paid to the payee's vault
/// (Money rules 4 and 14).
fn receipt(lab: &mut Lab, payee: &mut Person, payer: Hash, obligation: Hash, value: u64) -> Hash {
    let r = receipt_unanswered(&mut lab.w, payee, payer, obligation, value);
    lab.rail_valid.push((r, mor_core::money::PaidAt::VaultEntry(payee_of(payee), 0)));
    r
}

/// A receipt paying `value` toward an obligation, signed by its payee; no
/// rail answer stated.
/// Who a signer is paid as: the collective a member's device acts for, or
/// itself.
fn payee_of(p: &Person) -> Hash {
    p.cite.as_ref().map(|c| c.0).unwrap_or(p.id)
}

fn receipt_unanswered(w: &mut World, payee: &mut Person, payer: Hash, obligation: Hash, value: u64) -> Hash {
    let rc = mor_core::money::Payload::Receipt(mor_core::money::Receipt {
        rail: spec("a rail Module"),
        proof: vec![],
        payer: Some(mor_core::money::Payer::Identity(payer)),
        payee: payee_of(payee),
        amount: mor_core::money::Amount { unit: spec("a unit"), value },
        fulfils: obligation,
        previous: None,
        forward: None,
        batch: None,
        purchase: None,
    });
    let a = w.everyday_act(payee, mirs().money, 2, rc.to_map(), None, None);
    w.add(&a)
}

/// A creditor's release (Money type 4, F126; Agreements type 21 under F125),
/// signed by `by`.
fn debt_release(w: &mut World, by: &mut Person, obligation: Hash, against: Vec<Hash>) -> Hash {
    let r = mor_core::money::Payload::Release(mor_core::money::Release { obligation, against });
    let a = w.everyday_act(by, mirs().money, mor_core::money::types::RELEASE, r.to_map(), None, None);
    w.add(&a)
}

/// The label's stake in itself (null, S1), and the label holding a work.
fn own(holders: Vec<(Hash, u64)>) -> agreements::Stake {
    agreements::Stake { object: Who::This, holders: holders.into_iter().map(|(h, n)| (Who::Id(h), n)).collect() }
}

fn owns(work: Hash) -> agreements::Stake {
    agreements::Stake { object: Who::Id(work), holders: vec![(Who::This, 1_000_000)] }
}

fn stakes(mut v: Vec<agreements::Stake>) -> Option<Vec<agreements::Stake>> {
    v.sort_by_key(|s| s.object.encoding());
    Some(v)
}

/// A payee pointer of `who`, naming these addresses on one rail Module.
fn pointer_of(w: &mut World, who: &mut Person, version: u64, previous: Option<Hash>, addresses: &[&[u8]]) -> Hash {
    // A member's device acting for a collective names the collective.
    let payee = who.cite.as_ref().map(|c| c.0).unwrap_or(who.id);
    let p = mor_core::money::Payload::PayeePointer(mor_core::money::PayeePointer {
        payee,
        version,
        previous,
        rails: addresses
            .iter()
            .map(|a| mor_core::money::Rail { module: spec("a rail Module"), address: a.to_vec() })
            .collect(),
    });
    let a = w.everyday_act(who, mirs().money, 0, p.to_map(), None, None);
    w.add(&a)
}

fn vault_entry(source: &[u8]) -> mor_core::money::VaultEntry {
    mor_core::money::VaultEntry { unit: spec("a unit"), rail_module: spec("a rail Module"), source: source.to_vec(), limit: 1000 }
}

/// The grant key a grantee made for `plain_grant` (F128).
fn key_of(grantee: Hash) -> SchnorrKey {
    grant_key(&format!("{grantee:?}")).0
}

/// A person's grant (rule 73): it names the grant key its grantee holds.
fn person_grant(grantee: Hash) -> Grant {
    Grant { key: Some(grant_key(&format!("{grantee:?}")).1), kinds: None, ..plain_grant(grantee) }
}

/// A collective's grant: it carries no key (rule 73) and names the acts it
/// reaches (field 6, rule 74): here, naming no area, the Agreements layer
/// and a deal cMIP's acts, which no area reaches.
fn plain_grant(grantee: Hash) -> Grant {
    let kinds = vec![Kind::Layer(agreements::layers::AGREEMENTS), Kind::Type { spec: spec("a deal cMIP"), type_: 0 }];
    Grant { grantee, scope: 2, agreements: None, limits: None, limits_cmip: None, area: None, kinds: Some(kinds), reinstates: None, key: None }
}

impl Lab {
    /// The label's split agreement (rule 15): a publication whose first
    /// version sells nothing (no field 0), naming the label's ownership
    /// agreement (its founding terms), `svc` its split service under the
    /// test plan, changed by `f`; drafted on the label's device 0 (the
    /// owners' side), signed by the service. Its id.
    fn split_agreement_with(&mut self, svc: &mut Person, f: &dyn Fn(&mut agreements::Publication)) -> Hash {
        let mut p = agreements::Publication {
            sold: None,
            owners: Some(self.founding),
            partners: vec![],
            service: svc.id,
            plan: common::test_plan(),
            words: None,
            time: None,
            until: None,
            refund: None,
            cmips: vec![],
            designated: None,
            backups: vec![],
            failed: None,
        };
        f(&mut p);
        let x = agreements_act(&mut self.w, &mut self.c[0], agreements::types::PUBLICATION, p.to_map(), obj(self.founding));
        // Signed for the label under the judicial tier's rule, every member
        // (rules 15, 67): Cy's device drew it, Ana and Ben sign it.
        for i in [ANA, BEN] {
            self.sign(i, &x);
        }
        sign(&mut self.w, svc, &x);
        x
    }

    fn split_agreement(&mut self, svc: &mut Person) -> Hash {
        self.split_agreement_with(svc, &|_| {})
    }
}

/// The test plan with a role share (rule 22): `role`, `part` millionths
/// off the top.
fn role_plan(role: &str, part: u64) -> agreements::SplitPlan {
    let mut p = common::test_plan();
    p.shares = vec![agreements::ShareRule::Role { role: role.into(), part }];
    p
}

/// Makes `t` a work's ownership agreement (rule 8): `p`'s claim of the
/// work its stake names, held, as its target (field 33). The claim's id.
fn on_claim(w: &mut World, p: &mut Person, t: &mut Terms) -> Hash {
    let work = match t.stakes.as_ref().and_then(|s| s.first()).map(|s| s.object.clone()) {
        Some(Who::Id(h)) => h,
        _ => spec("a work, its claim"),
    };
    let c = common::claim_alone(w, p, &mirs(), work);
    t.target = Some(agreements::Target::Claim(c));
    c
}

/// The label's work (rules 8, 91): its claim and its ownership agreement,
/// drafted on the label's device 0, the label the stake's one holder.
/// The agreement's founding id.
fn label_owns(lab: &mut Lab, work: Hash) -> Hash {
    let label = lab.col.id;
    let c = common::claim_alone(&mut lab.w, &mut lab.c[0], &mirs(), work);
    let t = common::ownership_terms(c, &[(label, 1_000_000)], "The label's work.");
    let wa = agreements_act(&mut lab.w, &mut lab.c[0], agreements::types::TERMS, t.to_map(), None);
    sign(&mut lab.w, &mut lab.c[0], &wa);
    wa
}

/// A payout on the owners' line of the ownership agreement `owners` (its
/// founding version), to `receiver` (rule 12).
fn line_payout(receiver: Hash, amount: u64, owners: Hash) -> agreements::Payout {
    agreements::Payout { receiver, amount, stake: Some(0), owners: Some(owners), ..Default::default() }
}

/// Freeze suite v21, 3.7v (F124, S1), as the ownership agreement reads it
/// (field 33): a collective's founding terms target the collective they
/// found, `[1, null]`, and carry its one stake, in the collective itself,
/// written null; a deal cannot use null; a collective holds no stake in
/// itself.
#[test]
fn founding_terms_carry_stakes_in_the_collective_itself() {
    let lab = Lab::new(&|t| {
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 400_000), (p[BEN], 300_000), (p[CY], 300_000)])]);
    });
    let f = lab.founding;
    let t = lab.view().terms(&f).unwrap();
    assert_eq!(t.target, Some(agreements::Target::Collective));
    assert_eq!(t.own_stake().unwrap().1.share_of(&Who::Id(lab.ids()[ANA])), 400_000);
    let a = lab.view().agreement(&f).unwrap();
    assert_eq!(a.exists, Some(true));
    assert_eq!(lab.view().collective_of(&f).unwrap(), Some(lab.col.id));
    // One stake: a second, on a work, is refused.
    let mut two = t.clone();
    two.stakes = stakes(vec![t.stakes.as_ref().unwrap()[0].clone(), owns(spec("a work"))]);
    assert!(two.check(&mirs()).is_err(), "an ownership agreement carries one stake");
    // A deal cannot write null: only a collective's terms name themselves.
    let mut deal = t.clone();
    deal.grammar = None;
    deal.constitutional = None;
    deal.areas = None;
    deal.layers = None;
    deal.area_words = None;
    deal.clone = Rule::All;
    deal.abandonment = None;
    deal.target = None;
    assert!(deal.check(&mirs()).is_err(), "a stake appears only with a target, and null only in a collective's terms");
    // A collective holds no stake in itself.
    let mut selfish = t.clone();
    selfish.stakes = stakes(vec![agreements::Stake { object: Who::This, holders: vec![(Who::This, 1_000_000)] }]);
    assert!(selfish.check(&mirs()).is_err());
}

/// Freeze suite v21, shape A (F121): a group splits off with the powers to
/// do so. An ordinary membership change: the label keeps its identity, Cy
/// leaves and becomes a departed holder, their stake in field 7 (N5).
#[test]
fn a_group_splits_off_and_its_members_become_departed_holders() {
    let mut lab = Lab::new(&|t| {
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 400_000), (p[BEN], 300_000), (p[CY], 300_000)])]);
    });
    let f = lab.founding;
    let ids = lab.ids();
    let keep = vec![ids[ANA], ids[BEN]];
    let cy = ids[CY];
    let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|t| {
        t.parties = keep.clone();
        let g = t.grammar.as_mut().unwrap();
        g.chain_key = Holding::Shares { threshold: 2, members: keep.clone() };
        t.departed = Some(vec![cy]);
    });
    let k2 = lab.propose(ANA, &t);
    let s: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &k2)).collect();
    lab.rotate(Some((k2, s)), &[0]);
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    assert_eq!(lab.in_force(&p), k2);
    assert!(lab.counts(&p));
    let t = lab.view().terms(&k2).unwrap();
    assert_eq!(t.own_stake().unwrap().1.share_of(&Who::Id(cy)), 300_000);
    // The departed entry records only that Cy is departed; one without a
    // share in the label is invalid (N5).
    let mut bad = t.clone();
    bad.departed = Some(vec![spec("someone with no stake")]);
    assert!(bad.check(&mirs()).is_err());
    let t2 = lab.clone_terms(&k2, vec![(Power::Constitutional, vec![ANA, CY])], &|t| t.text = "Other words.".into());
    let x = lab.propose(ANA, &t2);
    assert!(lab.view().agreement(&x).unwrap().invalid.is_some(), "a departed holder has no voice");
    assert_eq!(lab.view().current(&lab.col.id).unwrap().unwrap().closed, None);
}

/// Freeze suite v21, 3.7w (F124, M1): under a constitutional change rule of
/// two of three, Ana and Ben remove Cy, whose plan names a stake heir and a
/// seat heir. Only the seat part of the plan goes with the removal; the
/// stake part stays with the stake. The removal completes with two
/// signatures. Dropping the stake part too is a judicial change: every
/// member, Cy included.
#[test]
fn a_removal_under_a_lower_rule_completes() {
    let plan = |t: &Terms| SuccessionPlan {
        party: t.parties[CY],
        stakes: Some(vec![(spec("an heir"), 1_000_000)]),
        seats: Some(vec![spec("a seat heir")]),
        entry: Some(1),
    };
    let mut lab = Lab::new(&|t| {
        t.constitutional = Some(Rule::Threshold(2));
        t.succession = Some(vec![plan(t)]);
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 400_000), (p[BEN], 300_000), (p[CY], 300_000)])]);
    });
    let f = lab.founding;
    let ids = lab.ids();
    let keep = vec![ids[ANA], ids[BEN]];
    let cy = ids[CY];
    let removal = |keep_stake_plan: bool| {
        let keep = keep.clone();
        move |t: &mut Terms| {
            t.parties = keep.clone();
            t.succession = keep_stake_plan.then(|| {
                vec![SuccessionPlan { party: cy, stakes: Some(vec![(spec("an heir"), 1_000_000)]), seats: None, entry: None }]
            });
            t.departed = Some(vec![cy]);
            let g = t.grammar.as_mut().unwrap();
            g.chain_key = Holding::Shares { threshold: 2, members: keep.clone() };
        }
    };
    let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN])], &removal(true));
    assert_eq!(lab.view().powers_needed(&t).unwrap(), vec![Power::Constitutional]);
    let k = lab.propose(ANA, &t);
    let sa = lab.sign(ANA, &k);
    let sb = lab.sign(BEN, &k);
    let a = lab.view().agreement(&k).unwrap();
    assert!(a.invalid.is_none() && a.ready, "{:?}", a.invalid);
    lab.rotate(Some((k, vec![sa, sb])), &[0]);
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    assert_eq!(lab.in_force(&p), k, "Cy is removed without their signature");
    // The plan for Cy's stake stays, as a departed holder's.
    let tk = lab.view().terms(&k).unwrap();
    assert_eq!(tk.succession.as_ref().unwrap()[0].stakes, Some(vec![(spec("an heir"), 1_000_000)]));
    // Dropping the stake part too: judicial, every member.
    let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN])], &removal(false));
    assert_eq!(lab.view().powers_needed(&t).unwrap(), vec![Power::Constitutional, Power::Judicial]);
}

/// Freeze suite v21, 3.7t (F121 Q9, F124 N10): every payout matches its
/// stake exactly, within one smallest unit of rounding per payout, every
/// fee alike for every stake; a split is delivered to every holder it pays,
/// naming each fee and who received it.
#[test]
fn every_payout_matches_its_stake() {
    let mut lab = Lab::new(&|t| {
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 400_000), (p[BEN], 300_000), (p[CY], 300_000)])]);
    });
    let ids = lab.ids();
    let mut svc = lab.w.genesis("a split service", vec![own_home()], None, None);
    // The label names the service by its split agreement (rule 15), so that
    // the splits below are the named service's, its owners' line read from
    // the version in force (rule 12).
    let sa = lab.split_agreement(&mut svc);
    let f = lab.founding;
    let fee_module = spec("a split service's fee Module");
    let receipt = |lab: &mut Lab, svc: &mut Person, value: u64| {
        let r = mor_core::money::Payload::Receipt(mor_core::money::Receipt {
            rail: spec("a rail Module"),
            proof: vec![],
            payer: Some(mor_core::money::Payer::Identity(spec("a fan"))),
            payee: svc.id,
            amount: mor_core::money::Amount { unit: spec("a unit"), value },
            fulfils: spec("an offer"),
            previous: None,
            forward: None,
            batch: None,
            purchase: None,
        });
        let a = lab.w.everyday_act(svc, mirs().money, 2, r.to_map(), None, None);
        lab.w.add(&a)
    };
    let svc_id = svc.id;
    let split = |receipt: Hash, ana: u64, ben: u64, cy: u64| agreements::Split {
        receipt,
        payouts: vec![
            agreements::Payout { receiver: svc_id, amount: 100, fee_module: Some(fee_module), ..Default::default() },
            line_payout(ids[ANA], ana, f),
            line_payout(ids[BEN], ben, f),
            line_payout(ids[CY], cy, f),
        ],
        cmip: spec("a split cMIP"),
        publication: sa,
        tally: None,
        number: None,
        ..Default::default()
    };
    let everyone = ids.clone();
    let r1 = receipt(&mut lab, &mut svc, 1000);
    let x = lab.w.private_act(&mut svc, mirs().agreements, agreements::types::SPLIT, split(r1, 360, 270, 270).to_map(), None, everyone.clone());
    let e = lab.view().split(&x).unwrap();
    assert_eq!(e.sums, Some(true));
    assert_eq!(e.fees, vec![(fee_module, svc.id, 100)]);
    assert!(e.undelivered.is_empty());
    assert_eq!(e.collective, Some(lab.col.id));
    assert!(e.mismatched.is_empty(), "{:?}", e.mismatched);
    assert!(e.problems.is_empty(), "{:?}", e.problems);
    assert_eq!(e.in_force, f);
    assert!(e.unevidenced.is_empty());
    assert_eq!(e.unplanned, vec![svc.id], "the fee: only a fee the publication's plan states could justify it");
    // Rounding: 901 leaves 801 to divide; the leftover unit to the largest
    // remainder, Ana's 320.4 (rule 15a, F150).
    let r2 = receipt(&mut lab, &mut svc, 901);
    let own: Vec<(Hash, u64)> = lab.view().terms(&f).unwrap().own_stake().unwrap().1.holders.iter().map(|(w, n)| (w.resolve(None).unwrap(), *n)).collect();
    assert_eq!(agreements::divide_stake(801, &own, agreements::Ties::Open).unwrap(), vec![321, 240, 240], "no tie: the remainders decide");
    let x = lab.w.private_act(&mut svc, mirs().agreements, agreements::types::SPLIT, split(r2, 321, 240, 240).to_map(), None, everyone.clone());
    assert!(lab.view().split(&x).unwrap().mismatched.is_empty());
    // F162 (11): over the exact share by a whole unit or more breaks the
    // plan, though no other holder is short by one: of 803, Ana's exact
    // share is 321.2; 323 is 1.8 over. The old tolerance, as many units as
    // the stake has holders, let it through.
    let r3 = receipt(&mut lab, &mut svc, 903);
    let x = lab.w.private_act(&mut svc, mirs().agreements, agreements::types::SPLIT, split(r3, 323, 240, 240).to_map(), None, everyone.clone());
    let e = lab.view().split(&x).unwrap();
    assert_eq!(e.sums, Some(true));
    // Since F165 every unit is rule 15a's: Ben and Cy, owed 241 each, are
    // short too.
    assert_eq!(e.mismatched.iter().map(|m| m.holder).collect::<Vec<_>>(), vec![ids[ANA], ids[BEN], ids[CY]]);
    // F165: rule 15a decides every unit. Of 803, Ben and Cy (240.9 each)
    // take the two leftover units, by largest remainder: 321, 241, 241.
    // Giving one of them to Ana instead leaves every holder within one
    // unit of its exact share, and is a deviation all the same.
    let x = lab.w.private_act(&mut svc, mirs().agreements, agreements::types::SPLIT, split(r3, 321, 241, 241).to_map(), None, everyone.clone());
    assert!(lab.view().split(&x).unwrap().mismatched.is_empty());
    let x = lab.w.private_act(&mut svc, mirs().agreements, agreements::types::SPLIT, split(r3, 322, 241, 240).to_map(), None, everyone.clone());
    let who: Vec<Hash> = lab.view().split(&x).unwrap().mismatched.iter().map(|m| m.holder).collect();
    assert_eq!(std::collections::BTreeSet::from_iter(who), std::collections::BTreeSet::from([ids[ANA], ids[CY]]), "a leftover unit steered to Ana");
    // Any deviation, either way, breaks the plan (N10): Cy paid less, Ana
    // more. Not delivered to Cy, whom it pays.
    let x = lab.w.private_act(&mut svc, mirs().agreements, agreements::types::SPLIT, split(r1, 430, 270, 200).to_map(), None, vec![ids[ANA], ids[BEN]]);
    let e = lab.view().split(&x).unwrap();
    assert_eq!(e.sums, Some(true));
    let who: Vec<Hash> = e.mismatched.iter().map(|m| m.holder).collect();
    assert_eq!(who, vec![ids[ANA], ids[CY]]);
    assert_eq!(e.undelivered, vec![ids[CY]]);
    // Members paying a departed holder more is a deviation too: no
    // one-direction check remains.
    let x = lab.w.private_act(&mut svc, mirs().agreements, agreements::types::SPLIT, split(r1, 300, 270, 330).to_map(), None, everyone.clone());
    assert_eq!(lab.view().split(&x).unwrap().mismatched.len(), 2);
    // A split that does not sum exactly is shown so (rule 21).
    let x = lab.w.private_act(&mut svc, mirs().agreements, agreements::types::SPLIT, split(r1, 300, 270, 270).to_map(), None, everyone);
    assert_eq!(lab.view().split(&x).unwrap().sums, Some(false));
}

/// A duo's work at 500,000 / 500,000, named to a split service the member
/// owns (F165, F171): every one-unit payment is a tie. The lab, the
/// service, the label's ownership agreement, its split agreement, and the members' identity
/// hashes, smaller first.
fn duo() -> (Lab, Person, Hash, Hash, Hash, Hash) {
    let mut lab = Lab::new(&|t| {
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 500_000), (p[BEN], 500_000)])]);
    });
    let ids = lab.ids();
    let mut svc = lab.w.genesis("a split service the member owns", vec![own_home()], None, None);
    let sa = lab.split_agreement(&mut svc);
    let f = lab.founding;
    let (low, high) = if ids[ANA] < ids[BEN] { (ids[ANA], ids[BEN]) } else { (ids[BEN], ids[ANA]) };
    (lab, svc, f, sa, low, high)
}

/// A one-unit receipt of the duo's service, with its own salt.
fn unit_receipt(lab: &mut Lab, svc: &mut Person) -> Hash {
    let r = mor_core::money::Payload::Receipt(mor_core::money::Receipt {
        rail: spec("a rail Module"),
        proof: vec![],
        payer: Some(mor_core::money::Payer::Identity(spec("a listener"))),
        payee: svc.id,
        amount: mor_core::money::Amount { unit: spec("a unit"), value: 1 },
        fulfils: spec("a stream"),
        previous: None,
        forward: None,
        batch: None,
        purchase: None,
    });
    let a = lab.w.everyday_act(svc, mirs().money, 2, r.to_map(), None, None);
    lab.w.add(&a)
}

/// The service's split of a one-unit `receipt`, paying the unit to `to`
/// on the owners' line of `f` under the split agreement `sa`, citing `previous` in `refs`, carrying `count` as the stake's
/// running count (field 4, PROPOSED format), delivered to both members
/// (F171: every holder, paid or not).
#[allow(clippy::too_many_arguments)]
fn unit_split(lab: &mut Lab, svc: &mut Person, f: Hash, sa: Hash, receipt: Hash, to: Hash, previous: Option<Hash>, count: Option<Vec<(Hash, u64)>>) -> Hash {
    use mor_core::act::Ref;
    let s = agreements::Split {
        receipt,
        payouts: vec![line_payout(to, 1, f)],
        cmip: spec("a split cMIP"),
        publication: sa,
        tally: count.map(|c| vec![(0, c)]),
        number: None,
        ..Default::default()
    };
    let everyone = lab.ids()[..2].to_vec();
    lab.w.private_act_refs(svc, mirs().agreements, agreements::types::SPLIT, s.to_map(), None, everyone, previous.map(|p| vec![Ref::Act(p)]))
}

/// F165 (review of F145 to F162, finding 4), as F171 builds it: leftover
/// ties take turns, counted in the running count each split act carries
/// (field 4, PROPOSED format) and checked from two acts: the split and the
/// previous one it cites for the stake. A duo's work at 500,000 / 500,000
/// earns one-unit payments, so every unit is a tie. Under F150 the
/// receipt's hash decided it, and the service, which signs the receipt and
/// picks its salt, could sign one receipt after another until the hash
/// fell its way. Now:
///
/// - re-signing the receipt with twenty different salts changes nothing:
///   with no earlier split, the unit goes to the smaller identity hash,
///   and a split giving it to the other member is shown as a deviation;
/// - each split citing the previous one for the stake, the units
///   alternate: the member with fewer leftover units so far takes the next;
/// - a verifier holding only the previous split checks the tie, and the
///   running count;
/// - a running count that is not the previous one plus this split's
///   leftover units breaks the plan;
/// - a split citing an act the verifier does not hold leaves the tied unit
///   and the count unknown, never the rest of the payment.
///
/// Before F165 was built, the split check allowed each holder one unit
/// either way, so a tied unit could be given to either member.
#[test]
fn a_split_service_cannot_steer_ties_by_grinding_salts() {
    let (mut lab, mut svc, f, sa, low, high) = duo();
    // Grinding: twenty receipts for the first payment, each with its own
    // salt, each split as the first. Every one sends the unit to the
    // smaller identity hash. (Twenty first splits reset the count each
    // time: the next test shows that.)
    for _ in 0..20 {
        let r = unit_receipt(&mut lab, &mut svc);
        let steered = unit_split(&mut lab, &mut svc, f, sa, r, high, None, Some(vec![(high, 1)]));
        let e = lab.view().split(&steered).unwrap();
        assert!(!e.mismatched.is_empty(), "a tied unit steered by the receipt's salt is a deviation");
        assert!(e.turns_unknown.is_empty());
        let x = unit_split(&mut lab, &mut svc, f, sa, r, low, None, Some(vec![(low, 1)]));
        assert!(lab.view().split(&x).unwrap().mismatched.is_empty());
    }

    // Turns, on a service that has split nothing yet: each split cites the
    // previous one for the stake and carries the running count.
    let (mut lab, mut svc, f, sa, low, high) = duo();
    let r1 = unit_receipt(&mut lab, &mut svc);
    let s1 = unit_split(&mut lab, &mut svc, f, sa, r1, low, None, Some(vec![(low, 1), (high, 0)]));
    let e = lab.view().split(&s1).unwrap();
    assert!(e.mismatched.is_empty() && e.breaks.is_empty() && e.count_unknown.is_empty(), "{e:?}");
    let r2 = unit_receipt(&mut lab, &mut svc);
    let s2 = unit_split(&mut lab, &mut svc, f, sa, r2, high, Some(s1), Some(vec![(low, 1), (high, 1)]));
    let e = lab.view().split(&s2).unwrap();
    assert!(e.mismatched.is_empty() && e.breaks.is_empty(), "the member with fewer leftover units takes the next: {e:?}");
    assert_eq!(lab.view().turns(&svc.id, &f, &[(low, 500_000), (high, 500_000)], Some(&s2)).unwrap(), Some(vec![1, 1]), "one leftover unit each so far");
    let r3 = unit_receipt(&mut lab, &mut svc);
    let s3 = unit_split(&mut lab, &mut svc, f, sa, r3, low, Some(s2), Some(vec![(low, 2), (high, 1)]));
    let e = lab.view().split(&s3).unwrap();
    assert!(e.mismatched.is_empty() && e.breaks.is_empty(), "equal counts: the smaller identity hash again: {e:?}");
    let r4 = unit_receipt(&mut lab, &mut svc);
    // The fourth carries a count that lies: the unit goes to the member
    // with fewer, as it should, but the count says nobody had any before.
    let s4 = unit_split(&mut lab, &mut svc, f, sa, r4, high, Some(s3), Some(vec![(low, 0), (high, 1)]));
    let e = lab.view().split(&s4).unwrap();
    assert!(e.mismatched.is_empty());
    assert_eq!(
        e.breaks,
        vec![agreements::ChainBreak::Count { stake: 0, carried: vec![(low, 0), (high, 1)], expected: std::collections::BTreeMap::from([(low, 2), (high, 2)]).into_iter().collect() }],
        "the running count is checked from two acts"
    );

    // From two acts: a verifier holding s3 but neither s1 nor s2 still
    // checks s4's count, and a tie after s3.
    let mut v = mor_core::chain::Verifier::with_mirs(common::identity_spec(), common::money_spec(), agreements_spec());
    for (a, key) in &lab.w.log {
        if a.id() != s1 && a.id() != s2 {
            v.add_with_key(a.clone(), key.as_ref()).unwrap();
        }
    }
    let mut lv = common::stand_in_payments(AgreementsView::new(&v, mirs()));
    lv.ext_layers.insert(ext(), vec![]);
    let e = lv.split(&s4).unwrap();
    assert!(matches!(e.breaks.as_slice(), [agreements::ChainBreak::Count { .. }]), "{:?}", e.breaks);
    assert_eq!(lv.turns(&svc.id, &f, &[(low, 500_000), (high, 500_000)], Some(&s3)).unwrap(), Some(vec![2, 1]));
    let e = lv.split(&s3).unwrap();
    assert_eq!(e.count_unknown, vec![0], "s3's own previous, s2, is not held: its count is unknown, never a deviation");
    assert_eq!(e.turns_unknown, vec![0]);
    assert!(e.mismatched.is_empty() && e.breaks.is_empty(), "{e:?}");

    // A split citing an act not held: the tied unit and the count are
    // unknown, and either member's payout is within one unit; the rest
    // still checked.
    let r5 = unit_receipt(&mut lab, &mut svc);
    let x = unit_split(&mut lab, &mut svc, f, sa, r5, high, Some(spec("a split this verifier does not hold")), Some(vec![(high, 9)]));
    let e = lab.view().split(&x).unwrap();
    assert_eq!(e.turns_unknown, vec![0]);
    assert_eq!(e.count_unknown, vec![0]);
    assert!(e.mismatched.is_empty() && e.breaks.is_empty(), "{e:?}");
}

/// F171 (review of F163 to F168, finding 7): a split citing no previous
/// split for the stake, when the service has split on it before, resets
/// the count, and breaks the plan (rule 15a, rule 46b). F165 left it open:
/// a service that wanted every tied unit to go to the smaller identity hash
/// signed each split as if it were the first, every count then zero, each
/// split passing (the test this one replaces,
/// `flaw_a_service_citing_no_previous_receipt_restarts_the_turns`).
///
/// A verifier holding two first splits cannot tell from the acts which
/// came later, so each is shown, naming the other; the holder's client,
/// keeping the chain as the splits arrive, names the second.
#[test]
fn a_split_service_citing_no_previous_split_resets_the_count_a_deviation() {
    let (mut lab, mut svc, f, sa, low, _high) = duo();
    let mut firsts: Vec<Hash> = vec![];
    for i in 0..5 {
        let r = unit_receipt(&mut lab, &mut svc);
        let x = unit_split(&mut lab, &mut svc, f, sa, r, low, None, Some(vec![(low, 1)]));
        let e = lab.view().split(&x).unwrap();
        assert!(e.mismatched.is_empty(), "each split, judged alone, pays the tie as a first split would");
        if i == 0 {
            assert!(e.breaks.is_empty(), "the first split for the stake cites none: {:?}", e.breaks);
        } else {
            let mut with = firsts.clone();
            with.sort();
            assert_eq!(e.breaks, vec![agreements::ChainBreak::Reset { stake: 0, with }], "a reset: the plan is broken");
        }
        firsts.push(x);
    }
    // The first, judged now, shares its start with the resets.
    let e = lab.view().split(&firsts[0]).unwrap();
    assert!(matches!(e.breaks.as_slice(), [agreements::ChainBreak::Reset { with, .. }] if with.len() == 4), "{:?}", e.breaks);
}

/// F171: two splits citing the same previous split for the stake fork the
/// chain, and break the plan (rule 15a, rule 46b), even where each is
/// consistent with the previous one: two consecutive acts show
/// consistency, not truth. A split that cites an earlier split than the
/// latest is seen this way: it shares its previous with the split after it.
#[test]
fn two_splits_citing_the_same_previous_fork_the_chain_a_deviation() {
    let (mut lab, mut svc, f, sa, low, high) = duo();
    let r1 = unit_receipt(&mut lab, &mut svc);
    let s1 = unit_split(&mut lab, &mut svc, f, sa, r1, low, None, Some(vec![(low, 1), (high, 0)]));
    let r2 = unit_receipt(&mut lab, &mut svc);
    let s2 = unit_split(&mut lab, &mut svc, f, sa, r2, high, Some(s1), Some(vec![(low, 1), (high, 1)]));
    assert!(lab.view().split(&s2).unwrap().breaks.is_empty());
    let r3 = unit_receipt(&mut lab, &mut svc);
    let s3 = unit_split(&mut lab, &mut svc, f, sa, r3, low, Some(s2), Some(vec![(low, 2), (high, 1)]));
    // The fork: a second split citing s2, paying the unit to the low
    // member as s3 did, and carrying the count s3 carries. Judged against
    // s2 alone it is right; the low member has now had two units of three
    // from s2's position, which the chain would have shown.
    let r4 = unit_receipt(&mut lab, &mut svc);
    let s3b = unit_split(&mut lab, &mut svc, f, sa, r4, low, Some(s2), Some(vec![(low, 2), (high, 1)]));
    let e = lab.view().split(&s3b).unwrap();
    assert!(e.mismatched.is_empty(), "consistent with the previous split: {e:?}");
    assert_eq!(e.breaks, vec![agreements::ChainBreak::Fork { stake: 0, previous: s2, with: vec![s3] }], "a fork: the plan is broken");
    let e = lab.view().split(&s3).unwrap();
    assert_eq!(e.breaks, vec![agreements::ChainBreak::Fork { stake: 0, previous: s2, with: vec![s3b] }], "shown on both: the acts carry no order to trust");
    // A split citing the latest, s3, continues the chain.
    let r5 = unit_receipt(&mut lab, &mut svc);
    let s4 = unit_split(&mut lab, &mut svc, f, sa, r5, high, Some(s3), Some(vec![(low, 2), (high, 2)]));
    let e = lab.view().split(&s4).unwrap();
    assert!(e.mismatched.is_empty() && e.breaks.is_empty(), "{e:?}");
    // A split carrying no count for the stake breaks the plan too (rule
    // 15a: each split carries it); the next one's count is then unknown.
    let r6 = unit_receipt(&mut lab, &mut svc);
    let s5 = unit_split(&mut lab, &mut svc, f, sa, r6, low, Some(s4), None);
    assert_eq!(lab.view().split(&s5).unwrap().breaks, vec![agreements::ChainBreak::NoCount { stake: 0 }]);
    let r7 = unit_receipt(&mut lab, &mut svc);
    let s6 = unit_split(&mut lab, &mut svc, f, sa, r7, high, Some(s5), Some(vec![(low, 3), (high, 3)]));
    let e = lab.view().split(&s6).unwrap();
    assert_eq!((e.count_unknown, e.turns_unknown, e.breaks), (vec![0], vec![0], vec![]));
}

/// The split, as rules 12, 20 and 22 bind it (audit, October 2026, gap 8):
/// a split is the split service's own act, under the publication it names;
/// a stranger's split, or one signed with a grant key, is shown broken. The
/// owners' line is divided by the stake read by reference, from the version
/// the service's receipt names (rule 12). A role payout earns only with
/// evidence that holds (rule 22, F119); a fee or a named receiver the plan
/// does not state is shown, never passed.
#[test]
fn a_split_is_the_named_services_act_under_the_version_in_force() {
    use mor_core::money::{Amount, Payer, Payload as Fin, Purchase, Receipt};
    let mut lab = Lab::new(&|t| {
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 400_000), (p[BEN], 300_000), (p[CY], 300_000)])]);
    });
    let ids = lab.ids();
    let label = lab.col.id;
    let f = lab.founding;
    let rail = spec("a rail Module");
    let mut svc = lab.w.genesis("a split service", vec![own_home()], None, None);
    let mut stranger = lab.w.genesis("a stranger", vec![own_home()], None, None);
    let sa = lab.split_agreement(&mut svc);
    // The label's pointer names the rail (F115), signed by its Money holder.
    let ptr = lab.pointer(0, 1, None, &[rail]);
    lab.sign(BEN, &ptr);
    // Money coming in: the service's own receipt, naming the label's
    // ownership agreement and its version in force (field 9).
    let receive = |lab: &mut Lab, svc: &mut Person, line: Hash, proof: &[u8]| {
        let r = Fin::Receipt(Receipt {
            rail,
            proof: proof.to_vec(),
            payer: Some(Payer::Identity(spec("a fan"))),
            payee: svc.id,
            amount: Amount { unit: spec("a unit"), value: 1000 },
            fulfils: sa,
            previous: None,
            forward: None,
            batch: None,
            purchase: Some(Purchase { agreement: f, line }),
        });
        let a = lab.w.everyday_act(svc, mirs().money, 2, r.to_map(), None, None);
        lab.w.add(&a)
    };
    let incoming = receive(&mut lab, &mut svc, f, b"a fan's payment");
    let pay = |who: Hash, amount: u64| line_payout(who, amount, f);
    let split = |receipt: Hash, payouts: Vec<agreements::Payout>| agreements::Split { receipt, payouts, cmip: spec("a split cMIP"), publication: sa, tally: None, number: None, ..Default::default() };
    let by_stakes = vec![pay(ids[ANA], 400), pay(ids[BEN], 300), pay(ids[CY], 300)];
    let everyone = ids.clone();
    // The service's own split: no problem.
    let x = lab.w.private_act(&mut svc, mirs().agreements, agreements::types::SPLIT, split(incoming, by_stakes.clone()).to_map(), None, everyone.clone());
    let e = lab.view().split(&x).unwrap();
    assert!(e.problems.is_empty(), "{:?}", e.problems);
    assert_eq!(e.in_force, f);
    assert!(e.mismatched.is_empty() && e.unevidenced.is_empty() && e.unplanned.is_empty());
    // A stranger's split of the same receipt: not the service's (rule 20).
    let x = lab.w.private_act(&mut stranger, mirs().agreements, agreements::types::SPLIT, split(incoming, by_stakes.clone()).to_map(), None, everyone.clone());
    let e = lab.view().split(&x).unwrap();
    assert!(e.problems.iter().any(|p| p.contains("signer")), "{:?}", e.problems);
    // One the service signs for the label, under a grant the label gave it
    // (naming the label on its chain, rule 58): the label's act, not the
    // service's in its own name (rule 20; "no service signs in anyone
    // else's name").
    let g = lab.grant(&Grant { kinds: Some(vec![Kind::Type { spec: mirs().agreements, type_: agreements::types::SPLIT }]), ..plain_grant(svc.id) });
    sign(&mut lab.w, &mut svc, &g);
    let mut st = lab.strand(g, &svc);
    let x = {
        let a = lab.w.everyday_act(&mut st, mirs().agreements, agreements::types::SPLIT, split(incoming, by_stakes.clone()).to_map(), None, None);
        lab.w.add(&a)
    };
    assert!(lab.view().split(&x).unwrap().problems.iter().any(|p| p.contains("own name")), "{:?}", lab.view().split(&x).unwrap().problems);
    // Cy sells his share to Ana: a clone every holder signs, recorded. A
    // receipt naming it pays the owners' line by its stake.
    let t2 = lab.clone_terms(&f, vec![(Power::Clone, vec![ANA, BEN, CY])], &|t| {
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 700_000), (p[BEN], 300_000)])]);
    });
    let k2 = lab.propose(ANA, &t2);
    let sigs: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &k2)).collect();
    let rec2 = lab.record(0, Some((k2, sigs)), &[], vec![], k2);
    let later = receive(&mut lab, &mut svc, k2, b"a later payment");
    let x = lab.w.private_act(&mut svc, mirs().agreements, agreements::types::SPLIT, split(later, vec![pay(ids[ANA], 700), pay(ids[BEN], 300)]).to_map(), None, everyone.clone());
    let e = lab.view().split(&x).unwrap();
    assert_eq!(e.in_force, k2, "{:?}", clone_state(&lab, &rec2));
    assert!(e.problems.is_empty() && e.mismatched.is_empty(), "{:?} {:?}", e.problems, e.mismatched);
    // The same payouts on that receipt, Cy still paid: a deviation.
    let x = lab.w.private_act(&mut svc, mirs().agreements, agreements::types::SPLIT, split(later, by_stakes.clone()).to_map(), None, everyone.clone());
    let who: Vec<Hash> = lab.view().split(&x).unwrap().mismatched.iter().map(|m| m.holder).collect();
    assert!(who.contains(&ids[ANA]) && who.contains(&ids[CY]), "{who:?}");
    // Role shares (rule 22): a referral with no evidence, or evidenced by
    // the service's own act, earns nothing; a fan's act is evidence once
    // the payer the payment commits to names it in its claim (rule 22, "the
    // payer's client for a referral"; F193, F194: never on the role
    // filler's own word); a rail Module's share is evidenced by the receipt
    // naming it (F119). The plan states the roles (rule 22).
    let mut fan = lab.w.genesis("a fan", vec![own_home()], None, None);
    let post = lab.w.post(&mut fan, "I sent them here");
    let own_word = lab.w.post(&mut svc, "I say the fan sent them");
    let role = |who: Hash, amount: u64, evidence: Option<Hash>| agreements::Payout { receiver: who, amount, role: Some("referral".into()), evidence, ..Default::default() };
    let rest = vec![pay(ids[ANA], 630), pay(ids[BEN], 270)];
    let with = |lab: &mut Lab, svc: &mut Person, extra: agreements::Payout| {
        let mut ps = rest.clone();
        ps.push(extra);
        let x = lab.w.private_act(svc, mirs().agreements, agreements::types::SPLIT, split(later, ps).to_map(), None, everyone.clone());
        lab.view().split(&x).unwrap()
    };
    assert_eq!(with(&mut lab, &mut svc, role(fan.id, 100, None)).unevidenced, vec![fan.id]);
    assert_eq!(with(&mut lab, &mut svc, role(fan.id, 100, Some(own_word))).unevidenced, vec![fan.id]);
    assert_eq!(with(&mut lab, &mut svc, role(fan.id, 100, Some(post))).unevidenced, vec![fan.id], "the referrer's own post alone is its own word");
    let mut buyer = lab.w.genesis("the buyer", vec![own_home()], None, None);
    let claim = Fin::Claim(mor_core::money::Claim {
        rail,
        proof: b"a later payment".to_vec(),
        payee: svc.id,
        amount: Amount { unit: spec("a unit"), value: 1000 },
        fulfils: sa,
        disagrees: None,
        referral: Some(mor_core::money::Referral { identity: fan.id, evidence: post }),
        refund: None,
        anonymous: None,
        purchase: Some(Purchase { agreement: f, line: k2 }),
        previous: None,
    });
    let c = lab.w.everyday_act(&mut buyer, mirs().money, 3, claim.to_map(), None, None);
    let c = lab.w.add(&c);
    lab.rail_valid.push((c, mor_core::money::PaidAt::Flow(ptr)));
    assert!(with(&mut lab, &mut svc, role(fan.id, 100, Some(post))).unevidenced.is_empty(), "the buyer's claim names the referral");
    // The service, payee of the receipt, names the rail in its own pointer.
    pointer_of(&mut lab.w, &mut svc, 1, None, &[b"the service's node"]);
    let module_share = agreements::Payout { role: Some("rail".into()), ..role(spec("the Module's maintainer"), 100, Some(later)) };
    assert!(with(&mut lab, &mut svc, module_share).unevidenced.is_empty(), "the receipt names the rail its payee's pointer names");
    // A fee, or a named receiver: only the plan could justify them.
    let fee = agreements::Payout { receiver: svc.id, amount: 100, fee_module: Some(spec("a fee Module")), ..Default::default() };
    assert_eq!(with(&mut lab, &mut svc, fee).unplanned, vec![svc.id]);
    let named = agreements::Payout { receiver: spec("a position"), amount: 100, ..Default::default() };
    assert_eq!(with(&mut lab, &mut svc, named).unplanned, vec![spec("a position")]);
    let _ = label;
}

/// Rule 12, read for a collective's split agreement: the version in force
/// for a receipt is the latest complete version on the line its history
/// holds, or the version it names. A receipt naming the label's founding
/// terms, made before a clone changing the stake is recorded, is paid by
/// the founding stake.
#[test]
fn a_collectives_owners_line_is_read_from_the_version_its_receipt_names() {
    use mor_core::money::{Amount, Payer, Payload as Fin, Purchase, Receipt};
    let mut lab = Lab::new(&|t| {
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 400_000), (p[BEN], 300_000), (p[CY], 300_000)])]);
    });
    let ids = lab.ids();
    let f = lab.founding;
    let mut svc = lab.w.genesis("a split service", vec![own_home()], None, None);
    let sa = lab.split_agreement(&mut svc);
    let r = Fin::Receipt(Receipt {
        rail: spec("a rail Module"),
        proof: b"a fan's payment".to_vec(),
        payer: Some(Payer::Identity(spec("a fan"))),
        payee: svc.id,
        amount: Amount { unit: spec("a unit"), value: 1000 },
        fulfils: sa,
        previous: None,
        forward: None,
        batch: None,
        purchase: Some(Purchase { agreement: f, line: f }),
    });
    let a = lab.w.everyday_act(&mut svc, mirs().money, 2, r.to_map(), None, None);
    let incoming = lab.w.add(&a);
    let t2 = lab.clone_terms(&f, vec![(Power::Clone, vec![ANA, BEN, CY])], &|t| {
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 700_000), (p[BEN], 300_000)])]);
    });
    let k2 = lab.propose(ANA, &t2);
    let sigs: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &k2)).collect();
    lab.record(0, Some((k2, sigs)), &[], vec![], k2);
    let s = agreements::Split { receipt: incoming, payouts: vec![line_payout(ids[ANA], 400, f), line_payout(ids[BEN], 300, f), line_payout(ids[CY], 300, f)], cmip: spec("a split cMIP"), publication: sa, ..Default::default() };
    let x = lab.w.private_act(&mut svc, mirs().agreements, agreements::types::SPLIT, s.to_map(), None, ids.clone());
    let e = lab.view().split(&x).unwrap();
    assert_eq!(e.in_force, f, "the receipt's history holds no later version");
    assert!(e.mismatched.is_empty(), "{:?}", e.mismatched);
}

/// Agreements rules 20, 23 to 25, 29, 30 and 55 (audit, October 2026, gap 3): a
/// split service is held to account. Every receipt it signed for money
/// coming in under a publication it serves, and every payer's claim showing
/// money arrived to it, with no split of the service's own, and every
/// payout no receipt of its receiver discharges, is an open obligation of
/// the service, naming its receiver and the publication. A stranger's
/// split hides nothing; a service the owners replaced still owes on what it
/// received (rule 30).
/// What makes theft provable (rule 31).
#[test]
fn a_split_service_is_held_to_account() {
    use mor_core::money::{Amount, PaidAt, Payer, Payload as Fin, Purchase, Receipt};
    use mor_core::agreements::{Unpaid, Unsplit};
    let mut lab = Lab::new(&|t| {
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 500_000), (p[BEN], 300_000), (p[CY], 200_000)])]);
    });
    let ids = lab.ids();
    let unit = spec("a unit");
    let mut svc = lab.w.genesis("a split service", vec![own_home()], None, None);
    let mut stranger = lab.w.genesis("a stranger", vec![own_home()], None, None);
    let k = lab.founding;
    let sa = lab.split_agreement(&mut svc);
    let incoming = |lab: &mut Lab, st: &mut Person, value: u64, proof: &[u8]| {
        let r = Fin::Receipt(Receipt {
            rail: spec("a rail Module"),
            proof: proof.to_vec(),
            payer: Some(Payer::Identity(spec("a fan"))),
            payee: st.id,
            amount: Amount { unit, value },
            fulfils: sa,
            previous: None,
            forward: None,
            batch: None,
            purchase: Some(Purchase { agreement: k, line: k }),
        });
        let a = lab.w.everyday_act(st, mirs().money, 2, r.to_map(), None, None);
        lab.w.add(&a)
    };
    let r1 = incoming(&mut lab, &mut svc, 1000, b"the first sale");
    let account = lab.view().service_account(&svc.id).unwrap();
    assert_eq!(account.unsplit, vec![Unsplit { payment: r1, claim: false, receiver: svc.id, agreement: sa, amount: Amount { unit, value: 1000 } }]);
    assert!(account.unpaid.is_empty());
    let pay = |who: Hash, amount: u64| line_payout(who, amount, k);
    let split = |receipt: Hash| agreements::Split { receipt, payouts: vec![pay(ids[ANA], 500), pay(ids[BEN], 300), pay(ids[CY], 200)], cmip: spec("a split cMIP"), publication: sa, tally: None, number: None, ..Default::default() };
    // A stranger's split names it: the service still owes a split.
    let _ = lab.w.private_act(&mut stranger, mirs().agreements, agreements::types::SPLIT, split(r1).to_map(), None, ids.clone());
    assert_eq!(lab.view().service_account(&svc.id).unwrap().unsplit.len(), 1);
    // The service's own split: nothing unsplit; three payouts unpaid.
    let x = lab.w.private_act(&mut svc, mirs().agreements, agreements::types::SPLIT, split(r1).to_map(), None, ids.clone());
    let account = lab.view().service_account(&svc.id).unwrap();
    assert!(account.unsplit.is_empty());
    let unpaid = |i: usize, who: Hash, amount: u64, received: u64| Unpaid { split: x, payout: i, receiver: who, agreement: sa, amount, received };
    assert_eq!(account.unpaid, vec![unpaid(0, ids[ANA], 500, 0), unpaid(1, ids[BEN], 300, 0), unpaid(2, ids[CY], 200, 0)]);
    // Each payout is discharged by its receiver's own receipt naming the
    // split (rule 23): Ana's in full, Ben's for less (open for the rest,
    // rule 24a), Cy's a receipt the stranger signs in his name, which is
    // nobody's receipt of his.
    let paid = |lab: &mut Lab, who: &mut Person, value: u64, naming: Hash| {
        let r = Fin::Receipt(Receipt {
            rail: spec("a rail Module"),
            proof: vec![],
            payer: Some(Payer::Identity(svc.id)),
            payee: who.id,
            amount: Amount { unit, value },
            fulfils: naming,
            previous: None,
            forward: None,
            batch: None,
            purchase: None,
        });
        let a = lab.w.everyday_act(who, mirs().money, 2, r.to_map(), None, None);
        lab.w.add(&a)
    };
    let mut ana = lab.m[ANA].clone();
    paid(&mut lab, &mut ana, 500, x);
    lab.m[ANA] = ana;
    let mut ben = lab.m[BEN].clone();
    paid(&mut lab, &mut ben, 250, x);
    lab.m[BEN] = ben;
    let mut forger = stranger.clone();
    forger.id = ids[CY];
    let _ = {
        let r = Fin::Receipt(Receipt { rail: spec("a rail Module"), proof: vec![], payer: Some(Payer::Identity(svc.id)), payee: ids[CY], amount: Amount { unit, value: 200 }, fulfils: x, previous: None, forward: None, batch: None, purchase: None });
        let a = lab.w.everyday_act(&mut stranger, mirs().money, 2, r.to_map(), None, None);
        lab.w.add(&a)
    };
    let account = lab.view().service_account(&svc.id).unwrap();
    assert_eq!(account.unpaid, vec![unpaid(1, ids[BEN], 300, 250), unpaid(2, ids[CY], 200, 0)]);
    // A receipt naming another split pays nothing on this one.
    let mut cy = lab.m[CY].clone();
    paid(&mut lab, &mut cy, 200, spec("another split"));
    lab.m[CY] = cy;
    assert_eq!(lab.view().service_account(&svc.id).unwrap().unpaid.len(), 2);
    // A payer's claim with the rail's answer, to the service, which holds
    // no receipt for it: money arrived, to be split (rule 20).
    let mut payer = lab.w.genesis("a paying fan", vec![own_home()], None, None);
    let c = payment(&mut lab, &mut payer, true, svc.id, sa, unit, 70, b"a claimed sale");
    assert!(lab.view().service_account(&svc.id).unwrap().unsplit.is_empty(), "no rail answer yet");
    lab.rail_valid.push((c, PaidAt::Flow(spec("the label's pointer"))));
    let account = lab.view().service_account(&svc.id).unwrap();
    assert_eq!(account.unsplit, vec![Unsplit { payment: c, claim: true, receiver: svc.id, agreement: sa, amount: Amount { unit, value: 70 } }]);
    // The service signs its receipt for it: the receipt is what it splits.
    let r2 = incoming(&mut lab, &mut svc, 70, b"a claimed sale");
    let account = lab.view().service_account(&svc.id).unwrap();
    assert_eq!(account.unsplit.iter().map(|u| u.payment).collect::<Vec<_>>(), vec![r2]);
    // The label names another split service by a later version of its
    // split agreement: the old service still owes on everything it
    // received before (rule 30).
    let mut svc2 = lab.w.genesis("a second split service", vec![own_home()], None, None);
    let v2 = {
        let mut p = lab.view().publication(&sa).unwrap().publication;
        p.service = svc2.id;
        let f = lab.founding;
        let x = agreements_act(&mut lab.w, &mut lab.c[0], agreements::types::PUBLICATION, p.to_map(), Some(vec![Object { chain: sa, predecessor: sa }, Object { chain: f, predecessor: f }]));
        for i in [ANA, BEN] {
            lab.sign(i, &x);
        }
        sign(&mut lab.w, &mut svc2, &x);
        x
    };
    assert!(lab.view().publication(&v2).unwrap().counts, "{:?}", lab.view().publication(&v2).unwrap().problems);
    let account = lab.view().service_account(&svc.id).unwrap();
    assert_eq!(account.unsplit.len(), 1);
    assert_eq!(account.unpaid.len(), 2);
}

/// Agreements draft 11, rule 15, rule 91 and "Closing (type 20)" (new in
/// draft 11, F262, F265): the core checks nothing new. An absentee's money
/// share follows the collective's own rules: here its split plan pays the
/// absentee through its split service, which keeps what it cannot deliver
/// as its open obligation (rule 24). The absentee never takes their payout.
/// The closing names nothing for it (field 4 stays for money owed back),
/// and still counts: the collective holds nothing and owes nothing of its
/// own. The share stays visible, owed by the service: nothing vanishes
/// silently.
#[test]
fn f262_f265_an_absentees_share_follows_the_collectives_rules_and_the_closing_counts() {
    use mor_core::money::{Amount, Payer, Payload as Fin, Purchase, Receipt};
    let absentee = spec("an absent holder");
    let mut lab = Lab::new(&|t| {
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 500_000), (p[BEN], 300_000), (absentee, 200_000)])]);
    });
    let ids = lab.ids();
    let label = lab.col.id;
    let unit = spec("a unit");
    let mut svc = lab.w.genesis("a split service", vec![own_home()], None, None);
    let k = lab.founding;
    let sa = lab.split_agreement(&mut svc);
    // Income, receipted by the service, and split by the label's split
    // agreement: the absentee's 20% among it.
    let r = Fin::Receipt(Receipt {
        rail: spec("a rail Module"),
        proof: b"the last sale".to_vec(),
        payer: Some(Payer::Identity(spec("a fan"))),
        payee: svc.id,
        amount: Amount { unit, value: 1000 },
        fulfils: sa,
        previous: None,
        forward: None,
        batch: None,
        purchase: Some(Purchase { agreement: k, line: k }),
    });
    let a = lab.w.everyday_act(&mut svc, mirs().money, 2, r.to_map(), None, None);
    let incoming = lab.w.add(&a);
    let pay = |who: Hash, amount: u64| line_payout(who, amount, k);
    let sp = agreements::Split { receipt: incoming, payouts: vec![pay(ids[ANA], 500), pay(ids[BEN], 300), pay(absentee, 200)], cmip: spec("a split cMIP"), publication: sa, ..Default::default() };
    let x = lab.w.private_act(&mut svc, mirs().agreements, agreements::types::SPLIT, sp.to_map(), None, ids.clone());
    // Ana and Ben take theirs; the absentee never does.
    for i in [ANA, BEN] {
        let mut who = lab.m[i].clone();
        let r = Fin::Receipt(Receipt { rail: spec("a rail Module"), proof: vec![], payer: Some(Payer::Identity(svc.id)), payee: who.id, amount: Amount { unit, value: if i == ANA { 500 } else { 300 } }, fulfils: x, previous: None, forward: None, batch: None, purchase: None });
        let a = lab.w.everyday_act(&mut who, mirs().money, 2, r.to_map(), None, None);
        lab.w.add(&a);
        lab.m[i] = who;
    }
    let account = lab.view().service_account(&svc.id).unwrap();
    assert_eq!(account.unpaid.iter().map(|u| (u.receiver, u.amount, u.received)).collect::<Vec<_>>(), vec![(absentee, 200, 0)], "the absentee's share: the service's open obligation (rule 24)");
    // The closing names nothing for it, and counts.
    let cur = lab.view().current(&label).unwrap().unwrap().agreement;
    let c = agreements::Closing { agreement: cur, collective: label, open: vec![] };
    let eo = ending_obj(&lab, cur, label);
    let closing = agreements_act(&mut lab.w, &mut lab.m[ANA], agreements::types::CLOSING, c.to_map(), eo);
    lab.end(ANA, &closing);
    lab.end(BEN, &closing);
    lab.end(CY, &closing);
    let e = lab.view().closing(&closing).unwrap();
    assert!(e.complete && e.holds.is_empty() && e.open_debts.is_empty(), "{:?}", e.why);
    assert!(e.closing.open.is_empty(), "field 4 stays for money owed back");
    // Nothing vanished silently: still owed, still shown.
    let account = lab.view().service_account(&svc.id).unwrap();
    assert_eq!(account.unpaid.iter().map(|u| (u.receiver, u.amount)).collect::<Vec<_>>(), vec![(absentee, 200)]);
}

/// Freeze suite v21, 3.7r (F121, F123, F124 P2): the pointer check, now
/// reaching the vault. The label's pointer counts for Agreements only if every
/// address in it is in the split service's own signed pointer in force, and
/// every entry of its vault in the service's own vault, or both in those of
/// a backup its split agreement names (publication field 11).
#[test]
fn the_pointer_check() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let mut svc = lab.w.genesis_with(
        "a split service",
        vec![own_home()],
        None,
        None,
        Some(vec![mor_core::money::vault_declaration(&mirs().money, &[vault_entry(b"the service's vault")])]),
        3,
    );
    let mut svc2 = lab.w.genesis("a second split service", vec![own_home()], None, None);
    // The label's split agreement names the service, and a backup (field
    // 11), each signing it.
    let id2 = svc2.id;
    let sa = lab.split_agreement_with(&mut svc, &|p| p.backups = vec![id2]);
    sign(&mut lab.w, &mut svc2, &sa);
    assert!(lab.view().publication(&sa).unwrap().counts, "{:?}", lab.view().publication(&sa).unwrap().problems);
    let k = f;
    let label = lab.col.id;
    pointer_of(&mut lab.w, &mut svc, 1, None, &[b"the service's node"]);
    pointer_of(&mut lab.w, &mut svc2, 1, None, &[b"the second service's node"]);
    let p1 = pointer_of(&mut lab.w, &mut lab.c[0], 1, None, &[b"the service's node"]);
    lab.sign(BEN, &p1);
    assert_eq!(lab.view().pointer_check(&label, &k).unwrap(), agreements::PointerCheck::Ordinary { pointer: p1, service: svc.id });
    let p2 = pointer_of(&mut lab.w, &mut lab.c[0], 2, Some(p1), &[b"the service's node", b"the treasurer's own node"]);
    lab.sign(BEN, &p2);
    match lab.view().pointer_check(&label, &k).unwrap() {
        agreements::PointerCheck::Bypasses { pointer, missing, vault_missing } => {
            assert_eq!(pointer, p2);
            assert_eq!(missing.len(), 1);
            assert_eq!(missing[0].address, b"the treasurer's own node".to_vec());
            assert!(vault_missing.is_empty());
        }
        other => panic!("{other:?}"),
    }
    let p3 = pointer_of(&mut lab.w, &mut lab.c[0], 3, Some(p2), &[b"the service's node"]);
    lab.sign(BEN, &p3);
    assert_eq!(lab.view().pointer_check(&label, &k).unwrap(), agreements::PointerCheck::Ordinary { pointer: p3, service: svc.id });
    // P2: the label's vault takes payments above its limit to an address
    // of the treasurer's own: the vault bypasses the service, shown so.
    lab.rotate_with(
        Some(vec![mor_core::money::vault_declaration(&mirs().money, &[vault_entry(b"the treasurer's own vault")])]),
        &[0],
    );
    match lab.view().pointer_check(&label, &k).unwrap() {
        agreements::PointerCheck::Bypasses { missing, vault_missing, .. } => {
            assert!(missing.is_empty());
            assert_eq!(vault_missing, vec![vault_entry(b"the treasurer's own vault")]);
        }
        other => panic!("{other:?}"),
    }
    // The vault the service's own vault carries: ordinary again.
    lab.rotate_with(
        Some(vec![mor_core::money::vault_declaration(&mirs().money, &[vault_entry(b"the service's vault")])]),
        &[0],
    );
    assert_eq!(lab.view().pointer_check(&label, &k).unwrap(), agreements::PointerCheck::Ordinary { pointer: p3, service: svc.id });
    // A label naming no split agreement: no split service to check against.
    let other = Lab::new(&|_| {});
    assert_eq!(other.view().pointer_check(&other.col.id, &other.founding).unwrap(), agreements::PointerCheck::NoSplitService);
}

/// Rule 15a (F150; the hostile review of F133 to F144, finding 6): one
/// unit among holders at 333,333, 333,333 and 333,334 goes to the largest
/// remainder, the third, however the holders are listed: a clone that only
/// reorders them moves nothing. F140 gave it to the first listed. (Read
/// once by a payer-side split, withdrawn: rule 12's split service divides.)
#[test]
fn leftovers_go_by_largest_remainder_whatever_the_order() {
    let lab = Lab::new(&|_| {});
    let ids = lab.ids();
    let listed = [vec![(ids[ANA], 333_333), (ids[BEN], 333_333), (ids[CY], 333_334)], vec![(ids[CY], 333_334), (ids[ANA], 333_333), (ids[BEN], 333_333)]];
    for holders in listed.iter() {
        assert_eq!(agreements::divide_stake(1, holders, agreements::Ties::Open).unwrap().iter().zip(holders).find(|(n, _)| **n == 1).map(|(_, h)| h.0), Some(ids[CY]), "the third holder, wherever listed");
    }
    // Two units: the third's remainder first, then Ana and Ben tie; they
    // take turns (F165), equal counts to the smaller identity hash, the
    // listing never deciding.
    for holders in listed.iter() {
        let parts = agreements::divide_stake(2, holders, agreements::Ties::Turns(&[0, 0, 0])).unwrap();
        let of = |h: Hash| parts[holders.iter().position(|x| x.0 == h).unwrap()];
        let ana_first = ids[ANA] < ids[BEN];
        assert_eq!((of(ids[ANA]), of(ids[BEN]), of(ids[CY])), if ana_first { (1, 0, 1) } else { (0, 1, 1) });
    }
}

/// The successor of one side, founded first (N4): founding terms whose
/// parties are the side's members, keeping each departed holder at their
/// share of all its income, recorded departed; the members divide the
/// rest. Its genesis declares them. Returns (identity, terms).
fn found_successor(lab: &mut Lab, name: &str, members: &[usize], kept: &[(Hash, u64)], original: Hash) -> (Person, Hash) {
    found_successor_with(lab, name, members, kept, original, &|_| {})
}

/// [`found_successor`], its founding terms changed by `f`.
fn found_successor_with(lab: &mut Lab, name: &str, members: &[usize], kept: &[(Hash, u64)], original: Hash, f: &dyn Fn(&mut Terms)) -> (Person, Hash) {
    let ids = lab.ids();
    let m: Vec<Hash> = members.iter().map(|i| ids[*i]).collect();
    let rest = 1_000_000 - kept.iter().map(|(_, n)| n).sum::<u64>();
    let t = label_terms(&ids, lab.authority.id, lab.keeper.id, &|t| {
        t.parties = m.clone();
        t.clone = Rule::Threshold(m.len().min(2) as u64);
        t.areas.as_mut().unwrap()[0].holders = vec![m[0]];
        t.areas.as_mut().unwrap()[1].holders = vec![*m.last().unwrap()];
        let g = t.grammar.as_mut().unwrap();
        g.chain_key = Holding::Shares { threshold: m.len() as u64, members: m.clone() };
        let mut holders: Vec<(Hash, u64)> = kept.to_vec();
        let each = rest / m.len() as u64;
        for (i, x) in m.iter().enumerate() {
            holders.push((*x, if i == 0 { rest - each * (m.len() as u64 - 1) } else { each }));
        }
        t.stakes = stakes(vec![own(holders)]);
        if !kept.is_empty() {
            t.departed = Some(kept.iter().map(|(h, _)| *h).collect());
        }
        t.forked_from = Some(original);
        f(t);
    });
    let x = agreements_act(&mut lab.w, &mut lab.m[members[0]], agreements::types::TERMS, t.to_map(), None);
    for i in members {
        lab.sign(*i, &x);
    }
    let mut p = lab.w.genesis_with(name, vec![own_home()], None, None, Some(vec![agreements::founding_declaration(&mirs().agreements, &x)]), 3);
    p.cite = Some((p.id, vec![p.id]));
    (p, x)
}

/// Freeze suite v21, 3.9 (F121 shape B, F124 N1 to N4, N13, N14): the fork
/// of a collective. Each side founds its successor first; the fork act names
/// them; every member signs under the constitutional rule (every party
/// here); the original is closed in Agreements; its ownership passes to the
/// successors by the members' stakes; the departed holder keeps their share
/// in each; the fork hands out every obligation in the history it cites,
/// published or not, each successor signing for its debts (F127); grants
/// end, a grantee's deal the history cites binding, any other void (the
/// tie rule); the original's publications sell nothing from the fork's
/// line, a payment after it owed back (rule 12, "Owners that ended"). 3.9g (F127, replacing F125 D1): a
/// debt still unpublished at the fork must be handed out all the same, so
/// publishing it later changes nothing; a successor cannot close while it
/// owes it (D5).
#[test]
fn a_collective_forks() {
    let dee = spec("dee");
    let mut lab = Lab::new(&|t| {
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 250_000), (p[BEN], 250_000), (p[CY], 250_000), (dee, 250_000)])]);
        t.departed = Some(vec![dee]);
    });
    let mut svc = lab.w.genesis("the old split service", vec![own_home()], None, None);
    let f = lab.founding;
    let ids = lab.ids();
    let label = lab.col.id;
    let k = f;
    // A work the label owns: its ownership agreement names the label as
    // the stake's one holder (rules 8, 91).
    let wa = {
        let c = common::claim_alone(&mut lab.w, &mut lab.m[ANA], &mirs(), spec("a work made before the fork"));
        let t = common::ownership_terms(c, &[(label, 1_000_000)], "The label's work.");
        agreements_act(&mut lab.w, &mut lab.m[ANA], agreements::types::TERMS, t.to_map(), None)
    };
    // Before the fork: a bake, a publication of the label selling access
    // under its own ownership agreement, the old split service its
    // service and the signer of its price tag, a grant and a deal under
    // it, and three debts, two of them public.
    let before = lab.publish(0);
    lab.sign(ANA, &before);
    let sid = svc.id;
    let offer = {
        let p = agreements::Publication {
            sold: Some(vec![agreements::Sold::Access(spec("a live stream cMIP"), mor_core::cbor::encode(&Value::Null))]),
            owners: Some(f),
            partners: vec![],
            service: sid,
            plan: common::test_plan(),
            words: None,
            time: None,
            until: None,
            refund: None,
            cmips: vec![],
            designated: None,
            backups: vec![],
            failed: None,
        };
        let x = agreements_act(&mut lab.w, &mut lab.c[0], agreements::types::PUBLICATION, p.to_map(), obj(f));
        sign(&mut lab.w, &mut svc, &x);
        x
    };
    assert!(lab.view().publication(&offer).unwrap().counts, "{:?}", lab.view().publication(&offer).unwrap().problems);
    let tag = common::price_tag(&mut lab.w, &mut svc, mirs().money, mor_core::money::Priced::Publication(offer), 300, spec("a unit"), sid);
    let mut agent = lab.w.genesis("an agent", vec![own_home()], None, None);
    // Acting for the label (scope 2): its "deals" here are acts of a test
    // cMIP, not Agreements terms, which scope 0 is for (rule 38).
    let g = lab.grant(&plain_grant(agent.id));
    sign(&mut lab.w, &mut agent, &g);
    // F128: the agent signs with its grant key, on its strand of the
    // label's actions chain.
    // Two of the agent's devices, each a strand under the same grant key.
    let mut s1 = lab.strand(g, &agent);
    let mut s2 = s1.clone();
    let deal_on_chain = |lab: &mut Lab, st: &mut Person| {
        let a = lab.w.everyday_act(st, spec("a deal cMIP"), 0, vec![(Value::Uint(0), Value::Text("a deal".into()))], None, None);
        lab.w.add(&a)
    };
    // One deal the label's chain never cites; another its next act joins.
    let deal = deal_on_chain(&mut lab, &mut s1);
    let cited_deal = deal_on_chain(&mut lab, &mut s2);
    let o = lab.chain(&[cited_deal]);
    let a = lab.w.everyday_act(&mut lab.c[0], spec("a deal cMIP"), 1, vec![], Some(o), None);
    lab.w.add(&a);
    let d1 = obligation(&mut lab, "a supplier", 900);
    // The creditor of d2 is an identity, so that its own receipt can
    // discharge it (Money rule 7; `docs/law-invariants.md`, IC2).
    let mut supplier = lab.w.genesis("another supplier's till", vec![own_home()], None, None);
    let d2 = obligation_to(&mut lab, supplier.id, 300);
    let mut hidden = lab.w.genesis("a creditor kept out of sight", vec![own_home()], None, None);
    let d3 = obligation_to(&mut lab, hidden.id, 50);
    // Each side founds its successor first (N4); the departed holder keeps
    // their quarter in each.
    let kept = vec![(dee, 250_000)];
    let (mut sa, ta) = found_successor(&mut lab, "side A", &[ANA], &kept, label);
    let (mut sb, tb) = found_successor(&mut lab, "side B", &[BEN, CY], &kept, label);
    let (sa_id, sb_id) = (sa.id, sb.id);
    let fork = |_: &Lab, debts: Vec<(Hash, Vec<u64>)>| agreements::Fork {
        agreement: k,
        collective: label,
        sides: vec![agreements::Side { successor: sa_id, members: vec![ids[ANA]] }, agreements::Side { successor: sb_id, members: vec![ids[BEN], ids[CY]] }],
        shares: vec![],
        debts,
    };
    // F127: the fork cites its history (its line), and must hand out
    // everything in it, d3 included, unpublished as it is: otherwise the
    // fork does not take effect.
    let x = fork(&lab, vec![(d1, vec![1]), (d2, vec![0, 1])]);
    let eo = ending_obj(&lab, k, x.collective);
    let short = agreements_act(&mut lab.w, &mut lab.m[ANA], agreements::types::FORK, x.to_map(), eo);
    lab.end(ANA, &short);
    for i in [BEN, CY] {
        lab.end(i, &short);
    }
    successor_sign(&mut lab.w, &mut sb, &short);
    successor_sign(&mut lab.w, &mut sa, &short);
    let e = lab.view().fork(&short).unwrap();
    assert!(!e.complete);
    assert_eq!(e.unassigned, vec![d3]);
    assert!(e.why.as_deref().is_some_and(|w| w.contains("F127")), "{:?}", e.why);
    // Every debt handed out: d1 to side B, d2 to both jointly, d3 to A.
    let x = fork(&lab, vec![(d1, vec![1]), (d2, vec![0, 1]), (d3, vec![0])]);
    let eo = ending_obj(&lab, k, x.collective);
    let fa = agreements_act(&mut lab.w, &mut lab.m[ANA], agreements::types::FORK, x.to_map(), eo);
    lab.end(ANA, &fa);
    lab.end(BEN, &fa);
    let e = lab.view().fork(&fa).unwrap();
    assert!(!e.complete, "Cy has not signed");
    lab.end(CY, &fa);
    successor_sign(&mut lab.w, &mut sb, &fa);
    let e = lab.view().fork(&fa).unwrap();
    assert!(!e.complete, "side A's successor has not signed for its debt");
    assert!(e.why.as_deref().is_some_and(|w| w.contains("N13")), "{:?}", e.why);
    successor_sign(&mut lab.w, &mut sa, &fa);
    let v = lab.view();
    let e = v.fork(&fa).unwrap();
    assert!(e.complete, "{:?}", e.why);
    assert_eq!(e.voices, vec![ids[ANA], ids[BEN], ids[CY]]);
    assert_eq!(e.successors[1], Some(tb));
    assert_eq!(e.shares, vec![333_333, 666_667], "the leftover to the largest remainder (F150, F162)");
    assert_eq!(e.kept, vec![(dee, 250_000)]);
    assert!(!e.by_count);
    assert!(e.unassigned.is_empty());
    assert_eq!(v.fork_transfer(&fa, &wa, 0).unwrap(), Some(vec![333_333, 666_667]), "the work's stake passes to the successors");
    // d3, unpublished, is done all the same (sealed to every member, on
    // the chain): it binds, and it is handed out. Where an act is held is
    // never a condition (F128).
    assert_eq!(v.obligation_binds(&d3).unwrap(), Some(true));
    assert_eq!(v.debtors(&d1).unwrap(), Some(vec![sb.id]));
    assert_eq!(v.debtors(&d2).unwrap(), Some(vec![sa.id, sb.id]));
    drop(v);
    // Closed in Agreements: what the label's keys sign afterwards counts for
    // nothing; what it signed before stands.
    let after = lab.publish(0);
    lab.sign(ANA, &after);
    assert_eq!(lab.view().consent(&after).unwrap(), Consent::Closed { by: fa });
    assert!(lab.view().consent(&before).unwrap().counts());
    assert_eq!(lab.view().current(&label).unwrap().unwrap().closed, Some(fa));
    // The grantee's deals: the one the fork's history cites binds; the
    // other is missing from the ending's history, and void (the tie rule).
    assert_eq!(lab.view().backing(&cited_deal).unwrap(), Backing::Binds { grant: g });
    assert!(matches!(lab.view().backing(&deal).unwrap(), Backing::NotBacked { reason, .. } if reason.contains("tie rule")));
    // A debt the label's device signed after the fork's line: void, owed
    // by nobody (the tie rule; D1's joint liability withdrawn).
    let late = obligation(&mut lab, "a late supplier", 40);
    assert_eq!(lab.view().obligation_binds(&late).unwrap(), Some(false));
    assert_eq!(lab.view().debtors(&late).unwrap(), Some(vec![]));
    // Rule 12, "Owners that ended": the label's publication sells nothing
    // from the fork's line. A wallet that does not read Agreements pays its
    // price tag, naming no version; the old split service receives it. No
    // purchase: owed back to the payer.
    let pay = |lab: &mut Lab, svc: &mut Person, purchase: Option<mor_core::money::Purchase>| {
        let r = mor_core::money::Payload::Receipt(mor_core::money::Receipt {
            rail: spec("a rail Module"),
            proof: vec![],
            payer: Some(mor_core::money::Payer::Identity(spec("a fan"))),
            payee: svc.id,
            amount: mor_core::money::Amount { unit: spec("a unit"), value: 300 },
            fulfils: tag,
            previous: None,
            forward: None,
            batch: None,
            purchase,
        });
        let a = lab.w.everyday_act(svc, mirs().money, 2, r.to_map(), None, None);
        lab.w.add(&a)
    };
    let stray = pay(&mut lab, &mut svc, None);
    let got = common::stand_in_answers(lab.view()).purchase(&stray).unwrap().unwrap();
    assert!(matches!(got.verdict, agreements::PurchaseVerdict::NoPurchase { .. }), "{got:?}");
    assert_eq!(got.refund_to, mor_core::money::RefundTo::Identity(spec("a fan")));
    // The same, naming the version before the fork: no purchase, owed back.
    let stale = pay(&mut lab, &mut svc, Some(mor_core::money::Purchase { agreement: f, line: k }));
    let got = common::stand_in_answers(lab.view()).purchase(&stale).unwrap().unwrap();
    assert!(matches!(got.verdict, agreements::PurchaseVerdict::NoPurchase { ref why } if why.contains("closed collective")), "{got:?}");
    // Naming the fork: no purchase either; nothing keeps the old
    // publication alive past the fork's line.
    let current = pay(&mut lab, &mut svc, Some(mor_core::money::Purchase { agreement: f, line: fa }));
    assert!(matches!(common::stand_in_answers(lab.view()).purchase(&current).unwrap().unwrap().verdict, agreements::PurchaseVerdict::NoPurchase { .. }));
    // Naming a line that is none of the agreement's versions: no purchase.
    let wrong = pay(&mut lab, &mut svc, Some(mor_core::money::Purchase { agreement: f, line: d1 }));
    assert!(matches!(common::stand_in_answers(lab.view()).purchase(&wrong).unwrap().unwrap().verdict, agreements::PurchaseVerdict::NoPurchase { .. }));
    // 3.9g (F127): d3 surfaces, published by its creditor after the fork.
    // It was handed out, so the fork stands as it was, and side A owes it.
    let v = lab.view();
    let e = v.fork(&fa).unwrap();
    assert!(e.complete, "{:?}", e.why);
    assert!(e.unassigned.is_empty());
    assert_eq!(v.current(&label).unwrap().unwrap().closed, Some(fa));
    assert_eq!(v.debtors(&d3).unwrap(), Some(vec![sa.id]));
    assert_eq!(sorted(v.owes(&sa.id).unwrap()), sorted(vec![d2, d3]));
    assert_eq!(sorted(v.owes(&sb.id).unwrap()), sorted(vec![d1, d2]));
    drop(v);
    // D5: side A's successor, holding nothing here, cannot close while it
    // owes d2 (jointly) and d3 (handed to it).
    let sa_terms = ta;
    // (Side A's successor signed the fork by a chain signature: its line's
    // tips are its sequences since.)
    let closing = agreements::Closing { agreement: sa_terms, collective: sa.id, open: vec![] };
    let eo = ending_obj(&lab, sa_terms, closing.collective);
    let cl = agreements_act(&mut lab.w, &mut lab.m[ANA], agreements::types::CLOSING, closing.to_map(), eo);
    lab.end(ANA, &cl);
    let v = lab.view();
    let e = v.closing(&cl).unwrap();
    assert!(!e.complete);
    assert_eq!(sorted(e.open_debts.clone()), sorted(vec![d2, d3]), "{:?}", e.why);
    assert!(e.why.as_deref().is_some_and(|w| w.contains("D5")), "{:?}", e.why);
    drop(v);
    // Side B pays d2 in full; d3's creditor releases it, taking nothing.
    let paid = receipt(&mut lab, &mut supplier, sb.id, d2, 300);
    let released = debt_release(&mut lab.w, &mut hidden, d3, vec![]);
    let v = lab.view();
    assert_eq!(v.owes(&sa.id).unwrap(), Vec::<Hash>::new());
    assert_eq!(v.owes(&sb.id).unwrap(), vec![d1]);
    // F303 (freeze suite v28, 3.9ae): a closing relies on another identity's
    // receipt or release only where an act of the collective in its history
    // acknowledges it; one nobody acknowledged is shown, and the closing waits.
    let e = v.closing(&cl).unwrap();
    assert!(!e.complete, "nobody acknowledged the receipt or the release: {:?}", e.why);
    drop(v);
    let mut ana_for_a = lab.m[ANA].acting_for(sa.id, vec![sa.id]);
    let a = lab.w.everyday_act(&mut ana_for_a, mirs().agreements, 12, liveness(sa_terms), obj(sa_terms), Some(vec![paid, released]));
    lab.w.add(&a);
    let eo = ending_obj(&lab, sa_terms, closing.collective);
    let cl2 = agreements_act(&mut lab.w, &mut lab.m[ANA], agreements::types::CLOSING, closing.to_map(), eo);
    lab.end(ANA, &cl2);
    let e = lab.view().closing(&cl2).unwrap();
    assert!(e.complete, "{:?}", e.why);
}

/// Freeze suite v21, 3.9g (F127, replacing F125 D1): a fork cites its
/// history (its line) and hands out every obligation in it, or does not
/// take effect: one a device signed and the label's chain joined counts as
/// in it; one on a device the line leaves out is void (the tie rule), owed
/// by nobody; while an act the history names is not held, what it must hand
/// out cannot be told. A later fork of a successor hands out what it
/// inherited too (F125 reading 4, as adjusted in F126).
#[test]
fn a_fork_hands_out_its_whole_history() {
    let mut lab = Lab::new(&|t| {
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 400_000), (p[BEN], 300_000), (p[CY], 300_000)])]);
    });
    let f = lab.founding;
    let ids = lab.ids();
    let label = lab.col.id;
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    let d1 = obligation(&mut lab, "a supplier", 100);
    let d2 = obligation(&mut lab, "a printer", 60);
    // Two debts on device 1: d4 no act of device 0 ever cites; d5 device
    // 0's next act joins, as the head it saw.
    let debt_on = |lab: &mut Lab, d: usize, creditor: &str| {
        let o = mor_core::money::Payload::Obligation(mor_core::money::Obligation {
            debtor: label,
            creditor: spec(creditor),
            amount: mor_core::money::Amount { unit: spec("a unit"), value: 10 },
            pointer: spec("its pointer"),
            agreement: None,
        });
        let a = lab.w.everyday_act(&mut lab.c[d], mirs().money, 1, o.to_map(), None, None);
        let x = lab.w.add(&a);
        lab.sign(BEN, &x);
        x
    };
    let d5 = debt_on(&mut lab, 1, "a creditor whose debt was joined");
    let o = lab.chain(&[d5]);
    let a = lab.w.everyday_act(&mut lab.c[0], spec("a note cMIP"), 0, vec![], Some(o), None);
    lab.w.add(&a);
    let d4 = debt_on(&mut lab, 1, "a creditor on a device left out");
    let (mut sa, _) = found_successor(&mut lab, "side A", &[ANA], &[], label);
    let (mut sb, tb) = found_successor(&mut lab, "side B", &[BEN, CY], &[], label);
    let fork = |lab: &mut Lab, debts: Vec<(Hash, Vec<u64>)>, sa: &mut Person, sb: &mut Person| {
        let x = agreements::Fork {
            agreement: f,
            collective: label,
            sides: vec![agreements::Side { successor: sa.id, members: vec![ids[ANA]] }, agreements::Side { successor: sb.id, members: vec![ids[BEN], ids[CY]] }],
            shares: vec![],
            debts,
        };
        let eo = ending_obj(&lab, f, x.collective);
        let fk = agreements_act(&mut lab.w, &mut lab.m[ANA], agreements::types::FORK, x.to_map(), eo);
        lab.end(ANA, &fk);
        lab.end(BEN, &fk);
        lab.end(CY, &fk);
        successor_sign(&mut lab.w, sa, &fk);
        successor_sign(&mut lab.w, sb, &fk);
        fk
    };
    // d2 and d5 left out: no fork.
    let short = fork(&mut lab, vec![(d1, vec![0])], &mut sa, &mut sb);
    let e = lab.view().fork(&short).unwrap();
    assert!(!e.complete);
    assert_eq!(sorted(e.unassigned.clone()), sorted(vec![d2, d5]));
    // Everything in the history handed out: the fork takes effect.
    let fk = fork(&mut lab, vec![(d1, vec![0]), (d2, vec![1]), (d5, vec![0, 1])], &mut sa, &mut sb);
    let v = lab.view();
    let e = v.fork(&fk).unwrap();
    assert!(e.complete, "{:?}", e.why);
    assert!(e.unassigned.is_empty());
    assert_eq!(v.debtors(&d1).unwrap(), Some(vec![sa.id]));
    assert_eq!(v.debtors(&d5).unwrap(), Some(vec![sa.id, sb.id]));
    // d4: public and on the relay, but missing from the history the fork
    // cites: made with powers that were ending, void, owed by nobody.
    assert_eq!(v.obligation_binds(&d4).unwrap(), Some(false));
    assert_eq!(v.debtors(&d4).unwrap(), Some(vec![]));
    drop(v);
    // Side B forks in turn: it must hand out d2, which it took on by its
    // own signature on the first fork, in its history.
    let (mut b1, _) = found_successor(&mut lab, "side B1", &[BEN], &[], sb.id);
    let (mut b2, _) = found_successor(&mut lab, "side B2", &[CY], &[], sb.id);
    let (b1_id, b2_id) = (b1.id, b2.id);
    let fork_b = |lab: &mut Lab, debts: Vec<(Hash, Vec<u64>)>, sb: &Person| {
        let x = agreements::Fork {
            agreement: tb,
            collective: sb.id,
            sides: vec![agreements::Side { successor: b1_id, members: vec![ids[BEN]] }, agreements::Side { successor: b2_id, members: vec![ids[CY]] }],
            shares: vec![],
            debts,
        };
        let eo = ending_obj(&lab, tb, x.collective);
        let x = agreements_act(&mut lab.w, &mut lab.m[BEN], agreements::types::FORK, x.to_map(), eo);
        lab.end(BEN, &x);
        lab.end(CY, &x);
        x
    };
    // Side B's successor draws its own line at a later chain act: its chain
    // signature on the first fork lies before it (F303).
    let (_, sb2) = lab.w.rotate(&sb, Rot::default());
    let sb = sb2;
    let fb = fork_b(&mut lab, vec![], &sb);
    let e = lab.view().fork(&fb).unwrap();
    assert!(!e.complete);
    assert!(e.unassigned.contains(&d2), "{:?}", e.why);
    successor_sign(&mut lab.w, &mut b1, &fb);
    successor_sign(&mut lab.w, &mut b2, &fb);
    assert!(e.unassigned.contains(&d5), "inherited jointly");
    let fb = fork_b(&mut lab, vec![(d2, vec![0]), (d5, vec![1])], &sb);
    successor_sign(&mut lab.w, &mut b1, &fb);
    successor_sign(&mut lab.w, &mut b2, &fb);
    let e = lab.view().fork(&fb).unwrap();
    assert!(e.complete, "{:?}", e.why);
    assert_eq!(lab.view().debtors(&d2).unwrap(), Some(vec![b1.id]));
    assert_eq!(lab.view().debtors(&d5).unwrap(), Some(vec![sa.id, b2.id]));

    // While an act the history cites is not held, what the fork must hand
    // out cannot be told: no fork, for this verifier.
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let label = lab.col.id;
    let mut o = lab.chain(&[]);
    o.push(Object { chain: label, predecessor: spec("an act this verifier does not hold") });
    let a = lab.w.everyday_act(&mut lab.c[0], spec("a note cMIP"), 0, vec![], Some(o), None);
    lab.w.add(&a);
    let (mut sa, _) = found_successor(&mut lab, "side A", &[ANA], &[], label);
    let (mut sb, _) = found_successor(&mut lab, "side B", &[BEN, CY], &[], label);
    let x = agreements::Fork {
        agreement: f,
        collective: label,
        sides: vec![agreements::Side { successor: sa.id, members: vec![ids[ANA]] }, agreements::Side { successor: sb.id, members: vec![ids[BEN], ids[CY]] }],
        shares: vec![],
        debts: vec![],
    };
    let eo = ending_obj(&lab, f, x.collective);
    let fk = agreements_act(&mut lab.w, &mut lab.m[ANA], agreements::types::FORK, x.to_map(), eo);
    lab.end(ANA, &fk);
    lab.end(BEN, &fk);
    lab.end(CY, &fk);
    successor_sign(&mut lab.w, &mut sa, &fk);
    successor_sign(&mut lab.w, &mut sb, &fk);
    // F304 (freeze suite v28, 3.9af, "the same for a fork"): unknown, never
    // "not complete".
    assert!(matches!(lab.view().fork(&fk), Err(AgreementsError::Missing(_))));
}

/// Freeze suite v21, 3.9d (F124 N1): under a constitutional rule of two of
/// three, Ana and Ben fork without Cy, who signs no side: no seat in any
/// successor, and a departed holder of each at their percentage. Without
/// the rule met, no fork.
#[test]
fn a_member_who_signs_no_side() {
    let mut lab = Lab::new(&|t| {
        t.constitutional = Some(Rule::Threshold(2));
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 500_000), (p[BEN], 250_000), (p[CY], 250_000)])]);
    });
    let f = lab.founding;
    let ids = lab.ids();
    let label = lab.col.id;
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    let kept = vec![(ids[CY], 250_000)];
    let (sa, ta) = found_successor(&mut lab, "side A", &[ANA], &kept, label);
    let (sb, _) = found_successor(&mut lab, "side B", &[BEN], &kept, label);
    // A successor that drops Cy is no successor.
    let (sbad, _) = found_successor(&mut lab, "side B without Cy", &[BEN], &[], label);
    let x = |succ: Hash| agreements::Fork {
        agreement: f,
        collective: label,
        sides: vec![agreements::Side { successor: sa.id, members: vec![ids[ANA]] }, agreements::Side { successor: succ, members: vec![ids[BEN]] }],
        shares: vec![],
        debts: vec![],
    };
    let eo = ending_obj(&lab, f, x(sbad.id).collective);
    let bad = agreements_act(&mut lab.w, &mut lab.m[ANA], agreements::types::FORK, x(sbad.id).to_map(), eo);
    lab.end(ANA, &bad);
    lab.end(BEN, &bad);
    let e = lab.view().fork(&bad).unwrap();
    assert!(!e.complete && e.why.as_deref().is_some_and(|w| w.contains("N4")), "{:?}", e.why);
    let eo = ending_obj(&lab, f, x(sb.id).collective);
    let fa = agreements_act(&mut lab.w, &mut lab.m[ANA], agreements::types::FORK, x(sb.id).to_map(), eo);
    lab.end(ANA, &fa);
    let e = lab.view().fork(&fa).unwrap();
    assert!(!e.complete, "Ben has not signed: Ana alone does not meet two of three");
    lab.end(BEN, &fa);
    let e = lab.view().fork(&fa).unwrap();
    assert!(e.complete, "{:?}", e.why);
    assert_eq!(e.leaving, vec![ids[CY]]);
    assert_eq!(e.kept, vec![(ids[CY], 250_000)]);
    assert_eq!(e.successors[0], Some(ta));
    // By the joining members' stakes: Ana's half against Ben's quarter.
    assert_eq!(e.shares, vec![666_667, 333_333]);
    assert_eq!(lab.view().current(&label).unwrap().unwrap().closed, Some(fa));
    let after = lab.publish(0);
    lab.sign(ANA, &after);
    assert!(!lab.counts(&after));
}

/// 3.9 (F121, B; F124 N4): what is not a fork. A member whose voice remains
/// left off a fork under every-party, a stranger on a side, a fork naming
/// an agreement not in force, closes nothing; with no stakes written, each
/// member counts alike (N3); two complete forks are concurrent acts on the
/// agreement chain, and the status quo stands.
#[test]
fn what_is_not_a_fork() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let ids = lab.ids();
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    let label = lab.col.id;
    let (sa, _) = found_successor(&mut lab, "side A", &[ANA, BEN], &[], label);
    let (sb, _) = found_successor(&mut lab, "side B", &[CY], &[], label);
    let side = |s: &Person, m: Vec<Hash>| agreements::Side { successor: s.id, members: m };
    let cases: Vec<(&str, Vec<agreements::Side>, Hash)> = vec![
        ("a member on no side", vec![side(&sa, vec![ids[ANA]]), side(&sb, vec![ids[BEN]])], f),
        ("a stranger on a side", vec![side(&sa, vec![ids[ANA], ids[BEN]]), side(&sb, vec![ids[CY], spec("a stranger")])], f),
        ("an agreement not in force", vec![side(&sa, vec![ids[ANA], ids[BEN]]), side(&sb, vec![ids[CY]])], spec("another agreement")),
    ];
    for (why, sides, ag) in cases {
        let x = agreements::Fork { agreement: ag, collective: label, sides, shares: vec![], debts: vec![] };
        let eo = ending_obj(&lab, ag, x.collective);
        let fa = agreements_act(&mut lab.w, &mut lab.m[ANA], agreements::types::FORK, x.to_map(), eo);
        lab.end(ANA, &fa);
        for i in [BEN, CY] {
            lab.end(i, &fa);
        }
        let e = lab.view().fork(&fa).unwrap();
        assert!(!e.complete && e.why.is_some(), "{why}");
    }
    assert!(lab.counts(&p));
    assert_eq!(lab.view().current(&label).unwrap().unwrap().closed, None);
    let x = agreements::Fork {
        agreement: f,
        collective: label,
        sides: vec![side(&sa, vec![ids[ANA], ids[BEN]]), side(&sb, vec![ids[CY]])],
        shares: vec![],
        debts: vec![],
    };
    let eo = ending_obj(&lab, f, x.collective);
    let fa = agreements_act(&mut lab.w, &mut lab.m[ANA], agreements::types::FORK, x.to_map(), eo);
    lab.end(ANA, &fa);
    lab.end(BEN, &fa);
    lab.end(CY, &fa);
    let e = lab.view().fork(&fa).unwrap();
    assert!(e.complete, "{:?}", e.why);
    assert!(!e.by_count, "a collective's ownership agreement always carries its stake (field 33): divided by it, not by head");
    assert_eq!(e.shares, vec![666_667, 333_333]);
    assert_eq!(lab.view().current(&label).unwrap().unwrap().closed, Some(fa));
    // A second complete fork, not naming the first in its objects: its
    // signers signed the first earlier in their own identity chains, so it
    // names the first through their chains, and counts for nothing (F131
    // IT1, F132 U1). Before F132 the two were concurrent and neither
    // counted.
    let z = agreements::Fork { sides: vec![side(&sb, vec![ids[CY]]), side(&sa, vec![ids[ANA], ids[BEN]])], ..x };
    let eo = ending_obj(&lab, f, z.collective);
    let fb = agreements_act(&mut lab.w, &mut lab.m[CY], agreements::types::FORK, z.to_map(), eo);
    lab.end(CY, &fb);
    lab.end(ANA, &fb);
    lab.end(BEN, &fb);
    assert!(lab.view().fork(&fb).unwrap().complete);
    assert_eq!(lab.view().endings(&label).unwrap().len(), 2);
    assert!(lab.view().ending_knows(&label, &fb).contains(&fa));
    assert_eq!(lab.view().current(&label).unwrap().unwrap().closed, Some(fa));
    assert!(lab.counts(&p));
}

/// F153 (Identity, the sentence after rule 17): a fork that counts a
/// member's chain signature only through a rotation "re-homed without
/// audit", which only this reader's own failed attempt to reach the old
/// home lets count, is unknown: neither complete nor incomplete, and it
/// closes nothing, until the rotation no longer rests on that attempt.
/// Reading still follows the member's identity.
#[test]
fn a_fork_resting_on_a_readers_own_attempt_is_unknown() {
    use common::home;
    use mor_core::chain::{Basis, How};
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let ids = lab.ids();
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    let label = lab.col.id;
    let (sa, _) = found_successor(&mut lab, "side A", &[ANA, BEN], &[], label);
    let (sb, _) = found_successor(&mut lab, "side B", &[CY], &[], label);
    // Cy moves to a home, then leaves it by a homeless rotation that only
    // this reader's failed attempt to reach it lets count.
    let old = lab.w.operator("cy's old home");
    let mut new = lab.w.operator("cy's new home");
    let (_, cy1) = lab.w.rotate(&lab.m[CY], Rot { homes: Some(vec![home(&old)]), ..Default::default() });
    let (hr, cy2) = lab.w.rotate(&cy1, Rot { homeless: true, homes: Some(vec![home(&new)]), ..Default::default() });
    lab.w.receipt(&mut new, &ids[CY], &hr, 2);
    lab.w.v.failed_to_reach(old.id);
    lab.m[CY] = cy2;
    let side = |s: &Person, m: Vec<Hash>| agreements::Side { successor: s.id, members: m };
    let x = agreements::Fork {
        agreement: f,
        collective: label,
        sides: vec![side(&sa, vec![ids[ANA], ids[BEN]]), side(&sb, vec![ids[CY]])],
        shares: vec![],
        debts: vec![],
    };
    let eo = ending_obj(&lab, f, x.collective);
    let fa = agreements_act(&mut lab.w, &mut lab.m[ANA], agreements::types::FORK, x.to_map(), eo);
    lab.end(ANA, &fa);
    lab.end(BEN, &fa);
    let cs = lab.end(CY, &fa);
    lab.w.receipt(&mut new, &ids[CY], &cs, 3);
    // Reading follows Cy to the new home, and counts the signature there.
    let res = lab.w.v.resolve(&ids[CY]);
    assert_eq!(res.links[2].how, How::Homeless { basis: Basis::OwnAttempt, final_: false });
    assert_eq!(res.position_of(&cs), Some(3));
    // The fork counts it only through that rotation: unknown.
    assert_eq!(lab.view().fork(&fa), Err(AgreementsError::OwnAttempt));
    assert_eq!(lab.view().closed_by(&label), Err(AgreementsError::OwnAttempt));
    // The old home's operator closes it: the rotation no longer rests on
    // the reader's attempt, and the fork is complete and closes the label.
    lab.w.rotate(&old, Rot { closure: true, ..Default::default() });
    let e = lab.view().fork(&fa).unwrap();
    assert!(e.complete, "{:?}", e.why);
    assert_eq!(lab.view().closed_by(&label).unwrap().map(|c| c.by), Some(fa));
}

/// Freeze suite v21, 3.9c (F121 shape D, F124 N7, N8, N12): a release to
/// the public domain ends the claim, names the work's history and publishes
/// its content key; it needs every direct owner's signature, unless the
/// release rule says otherwise; a clone every owner signs changes that
/// rule; a claim it does not name is shown beside it.
#[test]
fn a_work_is_released_to_the_public_domain() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut cy = w.genesis("cy", vec![own_home()], None, None);
    let work = spec("a work");
    let claim = common::claim_alone(&mut w, &mut ana, &mirs(), work);
    let terms = |ana: &Person, ben: &Person, cy: &Person, rule: Option<ReleaseRule>| Terms {
        parties: vec![ana.id, ben.id],
        layers: None,
        text: "Ana and Ben share a work with Cy.".into(),
        cmips: vec![],
        keepers: None,
        field4: Field4::Rule(Rule::All),
        clone: Rule::All,
        time: None,
        abandonment: None,
        parent: None,
        grammar: None,
        arbitrators: None,
        extensions: None,
        succession: None,
        constitutional: None,
        areas: None,
        area_words: None,
        chain: None,
        departed: None,
        stakes: Some(vec![agreements::Stake {
            object: Who::Id(work),
            holders: vec![(Who::Id(ana.id), 500_000), (Who::Id(ben.id), 400_000), (Who::Id(cy.id), 100_000)],
        }]),
        target: Some(agreements::Target::Claim(claim)),
        forked_from: None,
        release_rule: rule,
        settles: None,
        fork_judge: None,
        plan: None,
        refund: None,
        fees: None,
        holders_rules: None,
        transfers_counted: None,
        issues_under: None,
    };
    let t = terms(&ana, &ben, &cy, None);
    let d = agreements_act(&mut w, &mut ana, agreements::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut ana, &d);
    sign(&mut w, &mut ben, &d);
    let release = agreements::Release { work, stakes: vec![(d, 0)], claims: vec![claim], keys: vec![(spec("a publication carrying it"), vec![7; 32])], timed: None };
    let r = agreements_act(&mut w, &mut ana, agreements::types::RELEASE, release.to_map(), obj(d));
    sign(&mut w, &mut ben, &r);
    let e = view(&w).release(&r).unwrap();
    assert!(!e.complete, "Cy, an owner of a tenth, has not signed");
    sign(&mut w, &mut cy, &r);
    let e = view(&w).release(&r).unwrap();
    assert!(e.complete, "{:?}", e.why);
    assert_eq!(e.signed, vec![ana.id, ben.id, cy.id]);
    assert_eq!(e.ended(None), Some(true));
    // N12: the claim it names is history; a claim it does not name is
    // shown beside it, openly contested.
    assert_eq!(view(&w).claim_after_release(&claim, &work).unwrap(), None);
    let other = common::claim_alone(&mut w, &mut ben, &mirs(), work);
    assert_eq!(view(&w).claim_after_release(&other, &work).unwrap(), Some(r));
    // N8: a clone changing the release rule needs every owner, Cy too.
    let mut c = terms(&ana, &ben, &cy, Some(ReleaseRule::Holders(HoldersRule::Share(900_000))));
    c.parent = Some(d);
    c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![ana.id, ben.id]) }]);
    let k = agreements_act(&mut w, &mut ana, agreements::types::TERMS, c.to_map(), obj(d));
    sign(&mut w, &mut ana, &k);
    sign(&mut w, &mut ben, &k);
    assert_eq!(view(&w).agreement(&k).unwrap().exists, Some(false), "Cy has not signed");
    sign(&mut w, &mut cy, &k);
    assert_eq!(view(&w).agreement(&k).unwrap().exists, Some(true));
    // Under the clone's rule, two owners release.
    let release2 = agreements::Release { stakes: vec![(k, 0)], ..release.clone() };
    let r2 = agreements_act(&mut w, &mut ana, agreements::types::RELEASE, release2.to_map(), obj(k));
    sign(&mut w, &mut ben, &r2);
    assert!(view(&w).release(&r2).unwrap().complete);
    // A release that keeps its key private publishes nothing: incomplete.
    let p = w.private_act(&mut ana, mirs().agreements, agreements::types::RELEASE, release2.to_map(), obj(k), vec![ben.id]);
    assert!(!view(&w).release(&p).unwrap().complete);
    let bad = agreements::Release { work: spec("another work"), ..release2.clone() };
    let r3 = agreements_act(&mut w, &mut ana, agreements::types::RELEASE, bad.to_map(), obj(k));
    assert!(!view(&w).release(&r3).unwrap().complete);
    let r4 = agreements_act(&mut w, &mut ana, agreements::types::RELEASE, release2.to_map(), None);
    assert!(view(&w).release(&r4).is_err());
}

/// Agreements rule 17 and "Release" (audit, October 2026, gap 7): a release is
/// judged by the release rule, holders and time reference of the claiming
/// agreement in force, never by the version it names. The owners tighten
/// the rule from "any one holder" to "every holder" by a clone every owner
/// signs (N8); one owner's release naming the older version ends nothing.
#[test]
fn a_release_is_judged_by_the_agreement_in_force() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let work = spec("a work");
    let mut t = deal_terms(ana.id, ben.id);
    t.stakes = Some(vec![agreements::Stake { object: Who::Id(work), holders: vec![(Who::Id(ana.id), 500_000), (Who::Id(ben.id), 500_000)] }]);
    on_claim(&mut w, &mut ana, &mut t);
    t.release_rule = Some(ReleaseRule::Holders(HoldersRule::Share(500_000)));
    let d = agreements_act(&mut w, &mut ana, agreements::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut ana, &d);
    sign(&mut w, &mut ben, &d);
    // Every owner signs the clone that needs every holder to release.
    let mut c = t.clone();
    c.parent = Some(d);
    c.release_rule = Some(ReleaseRule::Holders(HoldersRule::Every));
    c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![ana.id, ben.id]) }]);
    let k = agreements_act(&mut w, &mut ana, agreements::types::TERMS, c.to_map(), obj(d));
    sign(&mut w, &mut ana, &k);
    sign(&mut w, &mut ben, &k);
    assert_eq!(view(&w).agreement(&k).unwrap().exists, Some(true));
    // Ana alone, naming the older version: not complete.
    let release = agreements::Release { work, stakes: vec![(d, 0)], claims: vec![], keys: vec![(spec("a publication carrying it"), vec![7; 32])], timed: None };
    let r = agreements_act(&mut w, &mut ana, agreements::types::RELEASE, release.to_map(), obj(d));
    let e = view(&w).release(&r).unwrap();
    assert!(!e.complete, "the rule in force needs every holder");
    assert_eq!(e.holders, vec![ana.id, ben.id]);
    assert_eq!(e.signed, vec![ana.id]);
    assert_eq!(view(&w).released(&work).unwrap(), None);
    // Naming the version in force, Ana alone: not complete; with Ben: complete.
    let r2 = agreements_act(&mut w, &mut ana, agreements::types::RELEASE, agreements::Release { stakes: vec![(k, 0)], ..release.clone() }.to_map(), obj(k));
    assert!(!view(&w).release(&r2).unwrap().complete);
    sign(&mut w, &mut ben, &r2);
    assert!(view(&w).release(&r2).unwrap().complete);
    // Naming the older version with every holder's signature: the rule in
    // force is met all the same.
    sign(&mut w, &mut ben, &r);
    assert!(view(&w).release(&r).unwrap().complete);
    // A version on no line to the one in force ends nothing.
    let mut other = t.clone();
    other.text = "Another agreement on the same work.".into();
    let o = agreements_act(&mut w, &mut ana, agreements::types::TERMS, other.to_map(), None);
    let r3 = agreements_act(&mut w, &mut ana, agreements::types::RELEASE, agreements::Release { stakes: vec![(o, 0)], ..release.clone() }.to_map(), obj(o));
    sign(&mut w, &mut ben, &r3);
    let e = view(&w).release(&r3).unwrap();
    assert!(e.complete, "a separate agreement is judged on its own lineage");
}

/// Agreements rule 45b, F186 (decided 9 October 2026), freeze suite v21, step
/// 1.7a: two complete clones of one version of a deal are a fork. While it
/// stands, the version before the split is the reference, and a new act
/// may follow either branch and counts, judged against that branch's latest
/// version: the buyer is protected. A branch that grows settles nothing
/// (this replaces "the longer branch wins", decided 8 October). A split is
/// settled only by a complete version naming both branches: beside its one
/// parent, the other branch's tip it settles (field 26); settlement is
/// final, and the other branch never comes back. (Audit R5b had the parent
/// in force for good.)
#[test]
fn two_complete_versions_of_a_deal() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let work = spec("a work");
    let mut t = deal_terms(ana.id, ben.id);
    t.stakes = Some(vec![agreements::Stake { object: Who::Id(work), holders: vec![(Who::Id(ana.id), 500_000), (Who::Id(ben.id), 500_000)] }]);
    on_claim(&mut w, &mut ana, &mut t);
    t.release_rule = Some(ReleaseRule::Holders(HoldersRule::Share(500_000)));
    let d = agreements_act(&mut w, &mut ana, agreements::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut ana, &d);
    sign(&mut w, &mut ben, &d);
    let clone = |w: &mut World, ana: &mut Person, ben: &mut Person, parent: Hash, text: &str, settles: Option<Hash>| {
        let mut c = t.clone();
        c.parent = Some(parent);
        c.text = text.into();
        c.release_rule = Some(ReleaseRule::Holders(HoldersRule::Every));
        c.settles = settles.map(|x| vec![x]);
        c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![ana.id, ben.id]) }]);
        let k = agreements_act(w, ana, agreements::types::TERMS, c.to_map(), obj(parent));
        sign(w, ana, &k);
        sign(w, ben, &k);
        k
    };
    let k1 = clone(&mut w, &mut ana, &mut ben, d, "One amendment.", None);
    assert_eq!(view(&w).version_in_force(&d).unwrap(), k1);
    let release = agreements::Release { work, stakes: vec![(d, 0)], claims: vec![], keys: vec![(spec("a publication carrying it"), vec![7; 32])], timed: None };
    let r = agreements_act(&mut w, &mut ana, agreements::types::RELEASE, release.to_map(), obj(d));
    assert!(!view(&w).release(&r).unwrap().complete, "one existing clone: its rule, every holder, is in force");
    // A rival clone of the same parent: a fork. The version before the
    // split is the reference, and the reading names both branches.
    let k2 = clone(&mut w, &mut ana, &mut ben, d, "Another amendment.", None);
    assert_eq!(view(&w).version_in_force(&d).unwrap(), d);
    let fk = view(&w).deal_fork(&d).unwrap().expect("forked");
    assert_eq!(fk.reference, d);
    assert_eq!(sorted(fk.branches.iter().map(|b| b[0]).collect()), sorted(vec![k1, k2]));
    assert!(view(&w).release(&r).unwrap().complete, "naming the reference, judged by it: any one holder");
    // A release may follow either branch, and counts, judged by that branch.
    let rk1 = agreements_act(&mut w, &mut ana, agreements::types::RELEASE, agreements::Release { stakes: vec![(k1, 0)], ..release.clone() }.to_map(), obj(k1));
    assert!(!view(&w).release(&rk1).unwrap().complete, "k1's rule: every holder");
    sign(&mut w, &mut ben, &rk1);
    assert!(view(&w).release(&rk1).unwrap().complete, "{:?}", view(&w).release(&rk1).unwrap().why);
    // One branch grows: still forked, the reference unchanged; an act
    // naming k1 is judged by its branch's latest version.
    let k3 = clone(&mut w, &mut ana, &mut ben, k1, "A third amendment, on the first branch.", None);
    assert_eq!(view(&w).version_in_force(&d).unwrap(), d, "a longer branch settles nothing");
    let fk = view(&w).deal_fork(&d).unwrap().expect("still forked");
    assert!(fk.branches.contains(&vec![k1, k3]));
    // A version naming as settled something not on the other branch settles nothing.
    let stray = {
        let mut c = t.clone();
        c.parent = Some(k3);
        c.text = "Settling nothing.".into();
        c.release_rule = Some(ReleaseRule::Holders(HoldersRule::Every));
        c.settles = Some(vec![d]);
        c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![ana.id, ben.id]) }]);
        let o = vec![Object { chain: k3, predecessor: k3 }, Object { chain: d, predecessor: d }];
        let k = agreements_act(&mut w, &mut ana, agreements::types::TERMS, c.to_map(), Some(o));
        sign(&mut w, &mut ana, &k);
        sign(&mut w, &mut ben, &k);
        k
    };
    assert_eq!(view(&w).version_in_force(&d).unwrap(), d);
    assert!(view(&w).deal_fork(&d).unwrap().expect("still forked").branches.contains(&vec![k1, k3, stray]));
    // Field 26 is a deal's: founding terms, or a version naming its own parent, are invalid.
    let mut bad = t.clone();
    bad.settles = Some(vec![d]);
    assert!(agreements::Terms::decode(&bad.to_map()).and_then(|x| x.check(&mirs())).is_err());
}

/// F186 (decided 9 October 2026): settled only by a version naming both
/// branches, complete; from then on the settling version's line is in
/// force. (What grows on the discarded branch, and the tangled shapes:
/// `f189_4_…`, `f189_5_…`, `f188_dq1_to_dq4_…`.)
#[test]
fn a_deals_fork_is_settled_by_a_version_naming_both_branches() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "Branch A.", None);
    let b1 = l.version(d, "Branch B.", None);
    let a2 = l.version(a1, "Branch A grows.", None);
    assert_eq!(l.in_force().unwrap(), d);
    // A settling version that is a draft settles nothing.
    let half = l.propose(a2, "Settled, half signed.", Some(b1));
    sign(&mut l.w, &mut l.ana, &half);
    assert_eq!(l.in_force().unwrap(), d);
    // Settled: a complete version on branch A naming branch B's tip.
    let s = l.version(a2, "Settled: A, having seen B.", Some(b1));
    assert_eq!(l.in_force().unwrap(), s);
    assert_eq!(view(&l.w).deal_fork(&d).unwrap(), None);
    assert_eq!(view(&l.w).version_in_force(&b1).unwrap(), s, "an act naming B is judged by the version in force");
    let s2 = l.version(s, "Life goes on.", None);
    assert_eq!(l.in_force().unwrap(), s2);
}

/// F186, client conformance (decided 9 October 2026): a seller's client
/// and a split service raise the alarm when a payment names a version of
/// the deal that does not descend from the version they hold. The reading
/// gives both lines from the last version they share.
#[test]
fn a_payment_naming_another_branch_raises_the_alarm() {
    use mor_core::money::{Amount, Claim, Payload as Fin, Purchase};
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut fan = w.genesis("a fan", vec![own_home()], None, None);
    let t = deal_terms(ana.id, ben.id);
    let d = agreements_act(&mut w, &mut ana, agreements::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut ana, &d);
    sign(&mut w, &mut ben, &d);
    let clone = |w: &mut World, ana: &mut Person, ben: &mut Person, text: &str| {
        let mut c = t.clone();
        c.parent = Some(d);
        c.text = text.into();
        c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![ana.id, ben.id]) }]);
        let k = agreements_act(w, ana, agreements::types::TERMS, c.to_map(), obj(d));
        sign(w, ana, &k);
        sign(w, ben, &k);
        k
    };
    let a = clone(&mut w, &mut ana, &mut ben, "3A: the price is 100.");
    let b = clone(&mut w, &mut ana, &mut ben, "3B: the price is 120.");
    let pay = |w: &mut World, fan: &mut Person, line: Hash, proof: &[u8]| {
        let c = Fin::Claim(Claim {
            rail: spec("a rail Module"),
            proof: proof.to_vec(),
            payee: ana.id,
            amount: Amount { unit: spec("a unit"), value: 120 },
            fulfils: spec("a publication"),
            disagrees: None,
            referral: None,
            refund: None,
            anonymous: None,
            purchase: Some(Purchase { agreement: d, line }),
            previous: None,
        });
        let x = w.everyday_act(fan, mirs().money, 3, c.to_map(), None, None);
        w.add(&x)
    };
    let under_b = pay(&mut w, &mut fan, b, b"b");
    let v = view(&w);
    let alarm = v.fork_alarm(&under_b, &a).unwrap().expect("Ana's client holds 3A: the alarm");
    assert_eq!((alarm.named, alarm.held, alarm.shared, alarm.kind), (b, a, d, agreements::AlarmKind::Fork));
    assert_eq!((alarm.held_line.clone(), alarm.named_line.clone()), (vec![a], vec![b]));
    assert_eq!(v.fork_alarm(&under_b, &b).unwrap(), None, "Ben's client holds 3B: it descends");
    assert_eq!(v.fork_alarm(&under_b, &d).unwrap(), None, "a client holding the version before the split: 3B descends from it");
    drop(v);
    let under_d = pay(&mut w, &mut fan, d, b"d");
    let alarm = view(&w).fork_alarm(&under_d, &a).unwrap().expect("an older version does not descend from 3A");
    assert_eq!(alarm.kind, agreements::AlarmKind::Older, "a plain notice (DQ7)");
}

/// Freeze suite v21, 3.9e (F124 N11): a timed release names a future point
/// on the agreement's time reference and the identity that delivers the
/// content key then; the claim ends there, checkably. Without a time
/// reference, no timed release.
#[test]
fn a_timed_release() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let keeper = w.genesis("a key keeper", vec![own_home()], None, None);
    let work = spec("a work");
    let claim = common::claim_alone(&mut w, &mut ana, &mirs(), work);
    let deal = |w: &mut World, ana: &mut Person, time: bool| {
        let t = Terms {
            parties: vec![ana.id],
            layers: None,
            text: "Ana's work.".into(),
            cmips: vec![],
            keepers: None,
            field4: Field4::Rule(Rule::All),
            clone: Rule::All,
            time: time.then(|| (spec("a block height reference"), Value::Uint(0))),
            abandonment: None,
            parent: None,
            grammar: None,
            arbitrators: None,
            extensions: None,
            succession: None,
            constitutional: None,
            areas: None,
            area_words: None,
            chain: None,
            departed: None,
            stakes: Some(vec![agreements::Stake { object: Who::Id(work), holders: vec![(Who::Id(ana.id), 1_000_000)] }]),
            target: Some(agreements::Target::Claim(claim)),
            forked_from: None,
            release_rule: None,
            settles: None,
            fork_judge: None,
            plan: None,
            refund: None,
            fees: None,
            holders_rules: None,
            transfers_counted: None,
            issues_under: None,
        };
        let x = agreements_act(w, ana, agreements::types::TERMS, t.to_map(), None);
        sign(w, ana, &x);
        x
    };
    let d = deal(&mut w, &mut ana, true);
    let rel = agreements::Release { work, stakes: vec![(d, 0)], claims: vec![], keys: vec![], timed: Some((Value::Uint(900_000), keeper.id)) };
    let r = agreements_act(&mut w, &mut ana, agreements::types::RELEASE, rel.to_map(), obj(d));
    let e = view(&w).release(&r).unwrap();
    assert!(e.complete, "{:?}", e.why);
    assert_eq!(e.ended(Some(false)), Some(false), "before its point, the claim stands");
    assert_eq!(e.ended(Some(true)), Some(true));
    assert_eq!(e.ended(None), None, "undetermined as the time reference is");
    let d2 = deal(&mut w, &mut ana, false);
    let rel2 = agreements::Release { stakes: vec![(d2, 0)], ..rel };
    let r2 = agreements_act(&mut w, &mut ana, agreements::types::RELEASE, rel2.to_map(), obj(d2));
    let e = view(&w).release(&r2).unwrap();
    assert!(!e.complete && e.why.as_deref().is_some_and(|w| w.contains("N11")));
    // An immediate release still carries its keys.
    let mut bare = agreements::Release { timed: None, ..rel2 }.to_map();
    bare.retain(|(k, _)| *k != Value::Uint(3));
    let x = agreements_act(&mut w, &mut ana, agreements::types::RELEASE, bare, obj(d2));
    assert!(view(&w).release(&x).is_err());
}

/// Freeze suite v21, 3.9f (F124 N7, N9): a collective that owns a work
/// releases it by its own rules, across the lanes a release touches (here
/// the Money lane's holder); then, holding nothing, it closes by a
/// closing act signed under the constitutional rule; its keys count for
/// nothing in Agreements after the line. A closing while it still holds the work,
/// or owes anything, does not take effect (F125, D5): one debt is paid by
/// a receipt, the other ended by its creditor's release, after a partial
/// payment; a release signed by anyone else ends nothing.
#[test]
fn a_collective_releases_its_work_and_closes() {
    let work = spec("the label's work");
    // The rule for Money the treasurer's (field 19).
    let mut lab = Lab::new(&money_is_bens);
    let f = lab.founding;
    let wa = label_owns(&mut lab, work);
    let label = lab.col.id;
    let closing = |_: &Lab| agreements::Closing { agreement: f, collective: label, open: vec![] };
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    let x = closing(&lab);
    let eo = ending_obj(&lab, f, x.collective);
    let early = agreements_act(&mut lab.w, &mut lab.m[ANA], agreements::types::CLOSING, x.to_map(), eo);
    lab.end(ANA, &early);
    lab.end(BEN, &early);
    lab.end(CY, &early);
    let e = lab.view().closing(&early).unwrap();
    assert!(!e.complete);
    assert_eq!(e.holds, vec![(wa, 0)], "the label holds the work's stake");
    // The release: the label signs it; it needs its Money lane too (N7).
    let rel = agreements::Release { work, stakes: vec![(wa, 0)], claims: vec![], keys: vec![(spec("its publication"), vec![9; 32])], timed: None };
    let r = {
        let a = lab.w.everyday_act(&mut lab.c[0], mirs().agreements, agreements::types::RELEASE, rel.to_map(), obj(wa), None);
        lab.w.add(&a)
    };
    assert!(!lab.view().release(&r).unwrap().complete, "the Money lane's holder has not signed");
    lab.sign(BEN, &r);
    let e = lab.view().release(&r).unwrap();
    assert!(e.complete, "{:?}", e.why);
    assert_eq!(e.holders, vec![label]);
    // Two debts open: no closing (F125, D5).
    let mut supplier = lab.w.genesis("the supplier", vec![own_home()], None, None);
    let mut printer = lab.w.genesis("the printer", vec![own_home()], None, None);
    let d = obligation_to(&mut lab, supplier.id, 100);
    let d2 = obligation_to(&mut lab, printer.id, 80);
    let x = closing(&lab);
    let eo = ending_obj(&lab, f, x.collective);
    let c1 = agreements_act(&mut lab.w, &mut lab.m[ANA], agreements::types::CLOSING, x.to_map(), eo);
    lab.end(ANA, &c1);
    lab.end(BEN, &c1);
    lab.end(CY, &c1);
    let v = lab.view();
    let e = v.closing(&c1).unwrap();
    assert!(e.holds.is_empty());
    assert_eq!(sorted(e.open_debts.clone()), sorted(vec![d, d2]));
    assert!(!e.complete);
    assert!(e.why.as_deref().is_some_and(|w| w.contains("cannot close while it owes anything")), "{:?}", e.why);
    drop(v);
    // The supplier is paid in full; the printer is paid 30 of 80.
    let full = receipt(&mut lab, &mut supplier, label, d, 100);
    let part = receipt(&mut lab, &mut printer, label, d2, 30);
    let v = lab.view();
    assert_eq!(v.owes(&label).unwrap(), vec![d2]);
    // F303: the closing relies on another identity's receipt only where an
    // act of the label in its history acknowledges it; drawn before them,
    // the first closing waits.
    assert_eq!(sorted(v.closing(&c1).unwrap().open_debts), sorted(vec![d, d2]));
    assert_eq!(v.paid_toward(&d2).unwrap(), 30);
    drop(v);
    // A release of the printer's debt signed by a member ends nothing:
    // only the creditor signs it.
    let wrong = debt_release(&mut lab.w, &mut lab.m[ANA], d2, vec![part]);
    let v = lab.view();
    let e = v.debt_release(&wrong).unwrap();
    assert!(!e.counts);
    assert!(e.why.as_deref().is_some_and(|w| w.contains("only the creditor")), "{:?}", e.why);
    assert!(!v.closing(&c1).unwrap().complete);
    drop(v);
    // The printer releases the rest, against the partial payment: the
    // closing takes effect; the label's later acts count for nothing; what
    // it did before stands.
    let rel = debt_release(&mut lab.w, &mut printer, d2, vec![part]);
    let v = lab.view();
    assert!(v.debt_release(&rel).unwrap().counts);
    assert_eq!(v.debt_released(&d2).unwrap(), Some(rel));
    assert!(!v.closing(&c1).unwrap().complete, "nothing in its history acknowledges them (F303)");
    drop(v);
    // The label acknowledges the receipt and the release, and closes again.
    lab.acknowledge(0, full);
    lab.acknowledge(0, rel);
    let x = closing(&lab);
    let eo = ending_obj(&lab, f, x.collective);
    let c2 = agreements_act(&mut lab.w, &mut lab.m[ANA], agreements::types::CLOSING, x.to_map(), eo);
    lab.end(ANA, &c2);
    lab.end(BEN, &c2);
    lab.end(CY, &c2);
    let v = lab.view();
    let e = v.closing(&c2).unwrap();
    assert!(e.complete, "{:?}", e.why);
    assert_eq!(v.current(&label).unwrap().unwrap().closed, Some(c2));
    drop(v);
    let after = lab.publish(0);
    lab.sign(ANA, &after);
    let v = lab.view();
    assert_eq!(v.consent(&after).unwrap(), Consent::Closed { by: c2 });
    assert!(v.consent(&p).unwrap().counts());
}

/// Freeze suite v21, 3.9h (F125, bankruptcy): a collective that cannot pay
/// keeps its debt open and visible; it settles with its creditor by stakes
/// and a release: it pays what it can, gives the creditor a share of its
/// work by a version of the work's ownership agreement (debt turned into
/// ownership), and the
/// creditor, alone, releases the rest. Its members are never made personal
/// debtors; it now owes nothing, and, still holding its share of the work,
/// stays open.
#[test]
fn a_bankrupt_collective_settles_by_stakes_and_a_release() {
    let work = spec("the label's only work");
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let wa = label_owns(&mut lab, work);
    let label = lab.col.id;
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    let mut lender = lab.w.genesis("the lender", vec![own_home()], None, None);
    let d = obligation_to(&mut lab, lender.id, 1_000);
    fn view2(lab: &Lab, _d: Hash) -> AgreementsView<'_> {
        lab.view()
    }
    let owes = |lab: &Lab| -> Vec<Hash> { view2(lab, d).owes(&lab.col.id).unwrap() };
    assert_eq!(owes(&lab), vec![d]);
    // It pays what it can: 300 of 1,000. The debt stays open, visible.
    let part = receipt(&mut lab, &mut lender, label, d, 300);
    assert_eq!(owes(&lab), vec![d]);
    // A version of the work's ownership agreement gives the lender 40% of
    // the work, the label signing it as the stake's holder.
    let lid = lender.id;
    let mut t = lab.view().terms(&wa).unwrap();
    t.parent = Some(wa);
    t.stakes.as_mut().unwrap()[0].holders = vec![(Who::Id(label), 600_000), (Who::Id(lid), 400_000)];
    t.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: vec![label] }]);
    let k = agreements_act(&mut lab.w, &mut lab.c[0], agreements::types::TERMS, t.to_map(), obj(wa));
    sign(&mut lab.w, &mut lab.c[0], &k);
    assert_eq!(view2(&lab, d).agreement(&k).unwrap().exists, Some(true), "{:?}", view2(&lab, d).agreement(&k).unwrap());
    let _ = f;
    // Still owed until the lender signs a release: the clone ends nothing.
    assert_eq!(owes(&lab), vec![d]);
    // A release naming the receipt instead of the obligation ends nothing.
    let odd = debt_release(&mut lab.w, &mut lender, part, vec![]);
    assert!(!view2(&lab, d).debt_release(&odd).unwrap().counts);
    // The lender releases the rest, against the payment and the stake.
    let rel = debt_release(&mut lab.w, &mut lender, d, vec![part, k]);
    let v = view2(&lab, d);
    let e = v.debt_release(&rel).unwrap();
    assert!(e.counts, "{:?}", e.why);
    assert_eq!(e.release.against, vec![part, k]);
    assert_eq!(v.owes(&label).unwrap(), Vec::<Hash>::new());
    assert_eq!(v.paid_toward(&d).unwrap(), 300);
    drop(v);
    // It owes nothing, but holds 60% of the work: a closing still does not
    // take effect; it stays open, paying the lender as a holder. (The label
    // acknowledges the lender's release, so a closing may rely on it: F303.)
    lab.acknowledge(0, rel);
    let x = agreements::Closing { agreement: f, collective: label, open: vec![] };
    let eo = ending_obj(&lab, f, x.collective);
    let c = agreements_act(&mut lab.w, &mut lab.m[ANA], agreements::types::CLOSING, x.to_map(), eo);
    lab.end(ANA, &c);
    lab.end(BEN, &c);
    lab.end(CY, &c);
    let e = view2(&lab, d).closing(&c).unwrap();
    assert!(e.open_debts.is_empty());
    assert_eq!(e.holds, vec![(k, 0)]);
    assert!(!e.complete);
}

/// Reading 7, corrected (F121): for a party whose voice was removed before
/// a judicial change, the abandonment clause in force applies, not the
/// older one it signed; field 1 still names the last version it signed.
#[test]
fn the_clause_in_force_judges_a_party_removed_before_a_judicial_change() {
    let mut lab = Lab::new(&|t| {
        t.abandonment.as_mut().unwrap().outcomes = vec![outcomes::VOICE_REMOVED, outcomes::STAKE_REDISTRIBUTED];
        t.grammar.as_mut().unwrap().recovery = None;
        t.grammar.as_mut().unwrap().chain_key = Holding::Shares { threshold: 2, members: t.parties.clone() };
    });
    let f = lab.founding;
    let d = lab.declare(None, f, f, CY, vec![outcomes::VOICE_REMOVED]);
    lab.record(0, None, &[], vec![d], f);
    // Ana and Ben, every voice that remains, change the authority.
    let mut second = lab.w.genesis("a second authority", vec![own_home()], None, None);
    let sid = second.id;
    let t = lab.clone_terms(&f, vec![(Power::Judicial, vec![ANA, BEN])], &|t| {
        t.abandonment.as_mut().unwrap().authority = Authority::Named(sid);
    });
    let k = lab.propose(ANA, &t);
    let sa = lab.sign(ANA, &k);
    let sb = lab.sign(BEN, &k);
    let r = lab.record(0, Some((k, vec![sa, sb])), &[], vec![], k);
    assert_eq!(puts(&lab, &r), Some(k));
    // A second declaration against Cy, redistributing their stake: field 1
    // names the founding terms, the last Cy signed; the clause in force
    // (the second authority) judges it.
    let x = AbsenceDeclaration { agreement: k, clause: f, party: lab.m[CY].id, outcomes: vec![outcomes::STAKE_REDISTRIBUTED] };
    let by_new = agreements_act(&mut lab.w, &mut second, agreements::types::DECLARATION, x.to_map(), obj(k));
    assert!(lab.view().declaration(&by_new).unwrap().is_ok(), "the clause in force applies");
    let by_old = lab.declare(None, k, f, CY, vec![outcomes::STAKE_REDISTRIBUTED]);
    assert!(lab.view().declaration(&by_old).unwrap().is_err(), "the older clause's authority no longer judges");
}

/// The creditor's release's format (Money type 4, F126; Agreements type 21
/// under F125): the obligation it ends, and, for the record only, what it
/// was released against. Agreements type 21 is retired.
#[test]
fn a_creditors_release_has_one_format() {
    use mor_core::money::{self as fin, Payload as Fin};
    let o = spec("an obligation");
    let r = fin::Release { obligation: o, against: vec![spec("a receipt"), spec("a clone")] };
    let mut w = World::new();
    let mut lender = w.genesis("a lender", vec![own_home()], None, None);
    let x = debt_release(&mut w, &mut lender, o, r.against.clone());
    let decode = |w: &World, x: &Hash| {
        let i = &w.v.get(x).unwrap().inside;
        Fin::decode(i.type_, &i.payload)
    };
    assert_eq!(decode(&w, &x).unwrap(), Fin::Release(r.clone()));
    // Nothing more: an unknown field, or an act named twice, is not in the format.
    let mut extra = Fin::Release(r.clone()).to_map();
    extra.push((Value::Uint(2), Value::Uint(0)));
    let a = w.everyday_act(&mut lender, mirs().money, fin::types::RELEASE, extra, None, None);
    let y = w.add(&a);
    assert!(decode(&w, &y).is_err());
    let z = debt_release(&mut w, &mut lender, o, vec![spec("a receipt"), spec("a receipt")]);
    assert!(decode(&w, &z).is_err());
    // An Agreements act of type 21 is no release: the type is retired.
    let old = agreements_act(&mut w, &mut lender, 21, vec![(Value::Uint(0), Value::Bytes(o.to_vec()))], None);
    assert!(view(&w).debt_release(&old).is_err());
    // The obligation it names is not held: it ends nothing.
    let e = view(&w).debt_release(&x).unwrap();
    assert!(!e.counts);
}

/// Freeze suite v21, 3.9i (F126, F128): an act in a collective's name is
/// done, and binds it, once sealed to every member (or public) and on the
/// collective's chain; before that, even signed, it binds no one. Where a
/// verifier found it is never a condition (F128: named relays withdrawn
/// from validity). A grantee's act, signed with its grant key, is held to
/// the same.
#[test]
fn an_act_in_the_collectives_name_is_done_once_sealed_wherever_held() {
    use mor_core::money::{Amount, Obligation, Payload as Fin};
    let mut lab = Lab::new(&|_| {});
    let ids = lab.ids();
    let label = lab.col.id;
    let creditor = lab.w.genesis("a printer", vec![own_home()], None, None);
    let debt = |lab: &mut Lab, to: Vec<Hash>| {
        let o = Fin::Obligation(Obligation {
            debtor: label,
            creditor: creditor.id,
            amount: Amount { unit: spec("a unit"), value: 70 },
            pointer: spec("its pointer"),
            agreement: None,
        });
        let x = lab.w.private_act(&mut lab.c[0], mirs().money, 1, o.to_map(), None, to);
        lab.sign(BEN, &x);
        x
    };
    // Sealed to the creditor alone: not done.
    let secret = debt(&mut lab, vec![creditor.id]);
    let v = lab.view();
    assert_eq!(v.obligation_binds(&secret).unwrap(), Some(false));
    assert!(v.done(&secret).unwrap().unwrap().unwrap_err().contains("sealed to every member"));
    assert!(matches!(v.consent(&secret).unwrap(), Consent::NotDone { .. }));
    drop(v);
    // Sealed to the creditor and every member: done, and it binds, found
    // on no relay at all (F128).
    let mut all = vec![creditor.id];
    all.extend(ids.iter().copied());
    let open = debt(&mut lab, all);
    let v = lab.view();
    assert_eq!(v.done(&open).unwrap(), Some(Ok(())));
    assert_eq!(v.obligation_binds(&open).unwrap(), Some(true));
    drop(v);
    // A public act is readable by every member: done.
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    assert!(lab.counts(&p));
    // A grantee's act in the label's name, signed with its grant key: the
    // same condition.
    let mut agent = lab.w.genesis("an agent", vec![own_home()], None, None);
    let g = lab.grant(&plain_grant(agent.id));
    sign(&mut lab.w, &mut agent, &g);
    let mut st = lab.strand(g, &agent);
    let deal = {
        let a = lab.w.everyday_act(&mut st, spec("a deal cMIP"), 0, vec![(Value::Uint(0), Value::Text("a deal".into()))], None, None);
        lab.w.add(&a)
    };
    assert_eq!(lab.view().backing(&deal).unwrap(), Backing::Backed { grant: g });
    assert!(matches!(lab.consent(&deal), Consent::Granted { grant, .. } if grant == g));
    let quiet = lab.w.private_act(&mut st, spec("a deal cMIP"), 0, vec![], None, vec![creditor.id]);
    assert!(matches!(lab.view().backing(&quiet).unwrap(), Backing::NotBacked { reason, .. } if reason.contains("F126")));
    // Not a collective's act: the condition does not apply.
    assert_eq!(lab.view().done(&creditor.id).ok().flatten(), None);
}

/// F128: terms field 25 (the relays, F126, constitutional under F127) is
/// withdrawn: relays are transport, where a collective's clients publish
/// and look first (client conformance, the relay transport cMIP), never a
/// condition of validity. Terms carrying it are refused, the number never
/// reused; no area reaches it.
#[test]
fn terms_field_25_is_withdrawn() {
    let lab = Lab::new(&|_| {});
    let ids = lab.ids();
    let t = label_terms(&ids, lab.authority.id, lab.keeper.id, &|_| {});
    assert!(t.check(&mirs()).is_ok(), "a collective's terms name no relays");
    let mut m = t.to_map();
    m.push((Value::Uint(25), Value::Array(vec![Value::Array(vec![Value::Null, Value::Text("https://relay.test".into())])])));
    assert!(Terms::decode(&m).unwrap_err().to_string().contains("F128"));
    let mut reach = t.clone();
    reach.areas.as_mut().unwrap()[0].fields = Some(vec![agreements::FieldRef::Field(25)]);
    assert!(reach.check(&mirs()).is_err());
}

/// F126 (E2): a collective forgives a debt owed to it by its Money lane
/// alone: the release is a Money act (type 4), so the lane reaching
/// Money decides; nobody else's signature is needed.
#[test]
fn a_collective_releases_a_debt_by_its_money_lane() {
    use mor_core::money::{Amount, Obligation, Payload as Fin};
    let mut lab = Lab::new(&|_| {});
    let label = lab.col.id;
    let mut debtor = lab.w.genesis("a debtor", vec![own_home()], None, None);
    let o = Fin::Obligation(Obligation {
        debtor: debtor.id,
        creditor: label,
        amount: Amount { unit: spec("a unit"), value: 500 },
        pointer: spec("the label's pointer"),
        agreement: None,
    });
    let a = lab.w.everyday_act(&mut debtor, mirs().money, 1, o.to_map(), None, None);
    let d = lab.w.add(&a);
    let rel = {
        let r = Fin::Release(mor_core::money::Release { obligation: d, against: vec![] });
        let a = lab.w.everyday_act(&mut lab.c[0], mirs().money, mor_core::money::types::RELEASE, r.to_map(), None, None);
        lab.w.add(&a)
    };
    let e = lab.view().debt_release(&rel).unwrap();
    assert!(!e.counts, "the Money lane's holder has not signed");
    assert!(e.why.as_deref().is_some_and(|w| w.contains("Money lane")), "{:?}", e.why);
    // Ana, who holds no Money lane, signing changes nothing.
    lab.sign(ANA, &rel);
    assert!(!lab.view().debt_release(&rel).unwrap().counts);
    lab.sign(BEN, &rel);
    assert!(lab.view().debt_release(&rel).unwrap().counts);
    assert_eq!(lab.view().debt_released(&d).unwrap(), Some(rel));
}

/// Freeze suite v21, 3.9m (F127): a collective keeps two chains. Its
/// actions cite, in `objects`, the decision they act under and the heads
/// they join; an act citing nothing on the chain counts for nothing; a
/// citation of a decision under a later key, or of an act off the chain,
/// likewise. Identity's own everyday acts carry no objects and cite
/// nothing (reading). An Agreements act of the collective carries the citations
/// after the entries its type defines.
#[test]
fn a_collective_keeps_two_chains() {
    let mut lab = Lab::new(&|_| {});
    let label = lab.col.id;
    // Cited: counts on the label's own signature (no area reaches it).
    let x = lab.cmip_act(0, spec("a note cMIP"));
    assert!(matches!(lab.consent(&x), Consent::Unadopted { .. }));
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    assert!(lab.counts(&p));
    // The same act naming nothing on the chain: the member's own act, not
    // the label's (rule 58).
    let saved = lab.c[0].cite.take();
    let loose = lab.publish(0);
    lab.sign(ANA, &loose);
    assert_eq!(lab.consent(&loose), Consent::NotCollective);
    // Citing only an act that is not on the chain: still uncited.
    let mut friend = lab.w.genesis("a friend", vec![own_home()], None, None);
    let post = lab.w.post(&mut friend, "hello");
    let a = lab.w.everyday_act(&mut lab.c[0], mirs().envelopes, 0, publication(vec![]), Some(vec![Object { chain: label, predecessor: post }]), None);
    let odd = lab.w.add(&a);
    lab.sign(ANA, &odd);
    assert!(matches!(lab.consent(&odd), Consent::Uncited { .. }), "{:?}", lab.consent(&odd));
    lab.c[0].cite = saved;
    // Joining a head of another device: the join is the chain's, and a
    // line drawn on the joining device places the joined act before it.
    let other = lab.publish(1);
    lab.sign(ANA, &other);
    let o = lab.chain(&[other]);
    let a = lab.w.everyday_act(&mut lab.c[0], mirs().envelopes, 0, publication(vec![]), Some(o), None);
    let join = lab.w.add(&a);
    lab.sign(ANA, &join);
    assert!(lab.counts(&join));
    let f = lab.founding;
    let t = lab.clone_terms(&f, vec![(Power::Area(1), vec![ANA])], &|t| words(t, 1, "Releases go out on Mondays."));
    let k = lab.propose(ANA, &t);
    let sk = lab.sign(ANA, &k);
    let line = lab.record(0, Some((k, vec![sk])), &[], vec![], k);
    assert!(lab.view().counts_before(&other, &line).unwrap(), "joined: before the line");
    let left = lab.publish(1);
    assert!(!lab.view().counts_before(&left, &line).unwrap(), "never joined: after it");
    // An Agreements act of the label (its signature on terms of a deal, as a
    // party) carries its citations after the entry its type defines.
    let fid = friend.id;
    let deal = agreements_act(&mut lab.w, &mut friend, agreements::types::TERMS, deal_terms(fid, label).to_map(), None);
    let s = sign(&mut lab.w, &mut lab.c[0], &deal);
    let h = lab.w.v.get(&s).unwrap();
    assert_eq!(agreements::decode_signature(&h.inside).unwrap(), deal);
    assert_eq!(h.inside.objects.as_ref().unwrap()[1].chain, label);
}

/// Terms of a plain deal between two identities.
fn deal_terms(a: Hash, b: Hash) -> Terms {
    let mut d = label_terms(&[a, b], spec("an authority"), spec("a keeper"), &|_| {});
    d.grammar = None;
    d.areas = None;
    d.layers = None;
    d.area_words = None;
    d.clone = Rule::All;
    d.abandonment = None;
    d.stakes = None;
    d.target = None;
    d
}

/// Freeze suite v21, 3.9l (F127, W3): a record is an act in the
/// collective's name like any other: not done (not sealed to every member,
/// nor public), it is no line: it puts nothing in force and registers
/// nothing. Where it is held decides nothing (F128).
#[test]
fn a_record_not_done_is_no_line() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let t = lab.clone_terms(&f, vec![(Power::Area(2), vec![BEN])], &|t| words(t, 2, "Weekly."));
    let k = lab.propose(BEN, &t);
    let s = lab.sign(BEN, &k);
    let r = lab.record(0, Some((k, vec![s])), &[], vec![], k);
    // Public: the line, and the clone in force.
    assert_eq!(puts(&lab, &r), Some(k));
    let x = lab.cmip_act(0, pay());
    lab.sign(BEN, &x);
    assert_eq!(lab.in_force(&x), k);
    // A resignation registered by a record sealed to Ben alone: no line,
    // and Ben's voice remains.
    let mut ben = lab.m[BEN].clone();
    let res = lab.resign_from(&mut ben, k, None);
    let rec = Record { clone: None, signatures: None, registers: Some(vec![res]) };
    let mut o = obj(k).unwrap();
    o.extend(lab.line(&[0]).into_iter().map(|x| Object { chain: lab.col.id, predecessor: x }));
    let line = lab.w.private_act(&mut lab.c[0], mirs().agreements, agreements::types::RECORD, rec.to_map(), Some(o), vec![lab.m[BEN].id]);
    let e = lab.view().record(&lab.col.id, &line).unwrap();
    assert!(!e.line && e.registers.is_empty());
    assert!(e.not_a_line.as_deref().is_some_and(|w| w.contains("sealed to every member")), "{:?}", e.not_a_line);
    let y = lab.cmip_act(0, pay());
    lab.sign(BEN, &y);
    assert!(lab.counts(&y), "Ben's voice remains");
}

/// Freeze suite v21, 3.9n (F127, the tie rule): a closing ends powers; a
/// debt a device signed that the closing's history does not cite was made
/// with powers that were ending: void, owed by nobody, and it does not keep
/// the collective from closing.
#[test]
fn the_ending_wins() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let label = lab.col.id;
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    // A public debt on device 1, which no act of device 0 cites.
    let o = mor_core::money::Payload::Obligation(mor_core::money::Obligation {
        debtor: label,
        creditor: spec("a printer"),
        amount: mor_core::money::Amount { unit: spec("a unit"), value: 300 },
        pointer: spec("its pointer"),
        agreement: None,
    });
    let a = lab.w.everyday_act(&mut lab.c[1], mirs().money, 1, o.to_map(), None, None);
    let d = lab.w.add(&a);
    lab.sign(BEN, &d);
    assert_eq!(lab.view().obligation_binds(&d).unwrap(), Some(true), "done: it binds, for now");
    let closing = agreements::Closing { agreement: f, collective: label, open: vec![] };
    let eo = ending_obj(&lab, f, closing.collective);
    let cl = agreements_act(&mut lab.w, &mut lab.m[ANA], agreements::types::CLOSING, closing.to_map(), eo);
    lab.end(ANA, &cl);
    lab.end(BEN, &cl);
    lab.end(CY, &cl);
    let v = lab.view();
    let e = v.closing(&cl).unwrap();
    assert!(e.complete, "{:?}", e.why);
    assert_eq!(v.obligation_binds(&d).unwrap(), Some(false), "the ending wins: void");
    drop(v);
    // Had the closing cited device 1's tip, the debt would be in its
    // history, and the label could not close while owing it (D5).
    let mut lab2 = Lab::new(&|_| {});
    let f2 = lab2.founding;
    let label2 = lab2.col.id;
    let o = mor_core::money::Payload::Obligation(mor_core::money::Obligation {
        debtor: label2,
        creditor: spec("a printer"),
        amount: mor_core::money::Amount { unit: spec("a unit"), value: 300 },
        pointer: spec("its pointer"),
        agreement: None,
    });
    let a = lab2.w.everyday_act(&mut lab2.c[1], mirs().money, 1, o.to_map(), None, None);
    let d2 = lab2.w.add(&a);
    lab2.sign(BEN, &d2);
    let closing = agreements::Closing { agreement: f2, collective: label2, open: vec![] };
    let eo = ending_obj_at(&lab2, f2, closing.collective, lab2.line(&[1]));
    let cl = agreements_act(&mut lab2.w, &mut lab2.m[ANA], agreements::types::CLOSING, closing.to_map(), eo);
    lab2.end(ANA, &cl);
    lab2.end(BEN, &cl);
    lab2.end(CY, &cl);
    let e = lab2.view().closing(&cl).unwrap();
    assert!(!e.complete);
    assert_eq!(e.open_debts, vec![d2]);
}

/// Rule 11 and rule 12, replacing 3.9o (F128, W4): which version of a
/// publication a payment buys is settled where it takes place. On a
/// request rail, the version the seller's request committed to: a
/// purchase, whatever came after. On a push rail, the split service's own
/// receipt, before or after its signature on the version ending the
/// publication: before, a purchase; after, a payment racing the ending, no
/// purchase, owed back by the service from what it holds.
#[test]
fn a_payment_racing_a_publications_ending_is_settled_by_the_split_service() {
    use mor_core::money::{Amount, Payer, Payload as Fin, Purchase, Receipt};
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut svc = w.genesis("their split service", vec![own_home()], None, None);
    let sid = svc.id;
    let deal = owners_of(&mut w, &mut ana, &mut ben, spec("their song, W4"));
    let pb = publish_under(&mut w, &mut ana, deal, sid, &mut [&mut ben, &mut svc], &|_| {});
    let tag = common::price_tag(&mut w, &mut svc, mirs().money, mor_core::money::Priced::Publication(pb), 5, spec("a unit"), sid);
    let push = spec("a push rail");
    let receipt = |w: &mut World, svc: &mut Person, rail: Hash, proof: &[u8]| {
        let r = Fin::Receipt(Receipt { rail, proof: proof.to_vec(), payer: Some(Payer::Identity(spec("a fan"))), payee: svc.id, amount: Amount { unit: spec("a unit"), value: 5 }, fulfils: tag, previous: None, forward: None, batch: None, purchase: Some(Purchase { agreement: deal, line: deal }) });
        let a = w.everyday_act(svc, mirs().money, 2, r.to_map(), None, None);
        w.add(&a)
    };
    let before = receipt(&mut w, &mut svc, push, b"before the ending");
    // The owners end the publication: a later version selling nothing,
    // every party signing it.
    let mut p = view(&w).publication(&pb).unwrap().publication;
    p.sold = Some(vec![]);
    let ending = agreements_act(&mut w, &mut ana, agreements::types::PUBLICATION, p.to_map(), Some(vec![Object { chain: pb, predecessor: pb }, Object { chain: deal, predecessor: deal }]));
    sign(&mut w, &mut ben, &ending);
    let pending = receipt(&mut w, &mut svc, push, b"after the owners, before the service");
    sign(&mut w, &mut svc, &ending);
    let e = view(&w).publication(&ending).unwrap();
    assert!(e.counts && e.ends, "{:?}", e.problems);
    let after = receipt(&mut w, &mut svc, push, b"after the service's signature");
    let on_request = receipt(&mut w, &mut svc, spec("a request rail"), b"on a request rail, after");
    let mut v = common::stand_in_answers(common::stand_in_payments(AgreementsView::new(&w.v, mirs())));
    v.rails.insert(push, push_rail_spec());
    assert_eq!(v.purchase(&before).unwrap().unwrap().verdict, agreements::PurchaseVerdict::Purchase);
    assert_eq!(v.purchase(&pending).unwrap().unwrap().verdict, agreements::PurchaseVerdict::Purchase, "before the service's own signature on the ending");
    assert!(matches!(v.purchase(&after).unwrap().unwrap().verdict, agreements::PurchaseVerdict::NoPurchase { .. }), "racing the ending");
    assert_eq!(v.owed_back_by(&after).unwrap(), vec![(sid, 5)], "owed back by the service from what it holds");
    assert_eq!(v.purchase(&on_request).unwrap().unwrap().verdict, agreements::PurchaseVerdict::Purchase, "a request rail: the version the request committed to");
}

/// F143 ("Judged on its own history"): a fork or closing is complete or not
/// on its own line and history, as if it were the ending that counts,
/// never with another ending already in force. A closing is complete and
/// counts; the label then signs a debt; a later closing, naming the first,
/// whose line holds the debt, owes it on its own history: incomplete, and
/// counting for nothing, whenever a verifier asks.
#[test]
fn an_ending_is_judged_on_its_own_history() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let label = lab.col.id;
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    let close = |lab: &mut Lab| {
        let c = agreements::Closing { agreement: f, collective: label, open: vec![] };
        let eo = ending_obj(lab, f, label);
        let x = agreements_act(&mut lab.w, &mut lab.m[ANA], agreements::types::CLOSING, c.to_map(), eo);
        for i in [ANA, BEN, CY] {
            lab.end(i, &x);
        }
        x
    };
    let c1 = close(&mut lab);
    let e = lab.view().closing(&c1).unwrap();
    assert!(e.complete, "{:?}", e.why);
    assert_eq!(e.counts, Some(true));
    assert_eq!(lab.view().closed_by(&label).unwrap().map(|c| c.by), Some(c1));
    // A debt after the first closing's line, sealed to everyone and on the
    // chain: void under the ending that counts (the tie rule), but in the
    // second closing's own history, where it binds.
    let d = obligation(&mut lab, "a supplier", 40);
    assert_eq!(lab.view().obligation_binds(&d).unwrap(), Some(false), "void after the closing that counts");
    let c2 = close(&mut lab);
    let v = lab.view();
    let e = v.closing(&c2).unwrap();
    assert!(!e.complete, "on its own history the second closing owes the debt (F143): {:?} {:?} binds {:?}", e.why, e.open_debts, v.obligation_binds(&d));
    assert_eq!(e.open_debts, vec![d]);
    assert_eq!(e.counts, Some(false));
    assert_eq!(v.closed_by(&label).unwrap().map(|c| c.by), Some(c1), "the first closing stays final (IT1)");
    // The same answer asked again, after the choice.
    let e = v.closing(&c2).unwrap();
    assert!(!e.complete);
    assert_eq!(v.closing(&c1).unwrap().counts, Some(true));
}

/// Freeze suite v21, 3.9p (F128, W5): a fork or a closing counts only once
/// done: sealed to every member, or public. A closing sealed to one member
/// takes no effect.
#[test]
fn a_closing_must_be_done() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let label = lab.col.id;
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    let c = agreements::Closing { agreement: f, collective: label, open: vec![] };
    let ben = lab.m[BEN].id;
    let eo = ending_obj(&lab, f, c.collective);
    let quiet = lab.w.private_act(&mut lab.m[ANA], mirs().agreements, agreements::types::CLOSING, c.to_map(), eo, vec![ben]);
    lab.end(ANA, &quiet);
    lab.end(BEN, &quiet);
    lab.end(CY, &quiet);
    let e = lab.view().closing(&quiet).unwrap();
    assert!(!e.complete);
    assert!(e.why.as_deref().is_some_and(|w| w.contains("W5")), "{:?}", e.why);
    let eo = ending_obj(&lab, f, c.collective);
    let open = agreements_act(&mut lab.w, &mut lab.m[ANA], agreements::types::CLOSING, c.to_map(), eo);
    lab.end(ANA, &open);
    lab.end(BEN, &open);
    lab.end(CY, &open);
    let e = lab.view().closing(&open).unwrap();
    assert!(e.complete, "{:?}", e.why);
}

/// Fable's step-15 review of Agreements, A3 (F127, F298): a closing's "owes
/// nothing" is judged on the history its line cites, as a fork's hand-out
/// is. While an act that history names is not held, this verifier cannot
/// tell what the collective owes before the line: the closing is not
/// complete for it, as the fork is not (`a_fork_hands_out_its_whole_history`,
/// its last part), never complete on partial knowledge.
#[test]
fn a_closing_whose_history_names_an_act_not_held_is_unknown_3_9af() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let label = lab.col.id;
    let mut o = lab.chain(&[]);
    o.push(Object { chain: label, predecessor: spec("an act this verifier does not hold") });
    let a = lab.w.everyday_act(&mut lab.c[0], spec("a note cMIP"), 0, vec![], Some(o), None);
    lab.w.add(&a);
    let c = agreements::Closing { agreement: f, collective: label, open: vec![] };
    let eo = ending_obj(&lab, f, c.collective);
    let k = agreements_act(&mut lab.w, &mut lab.m[ANA], agreements::types::CLOSING, c.to_map(), eo);
    lab.end(ANA, &k);
    lab.end(BEN, &k);
    lab.end(CY, &k);
    let unheld = spec("an act this verifier does not hold");
    // Freeze suite v28, 3.9af (F304): unknown, never complete and never "not complete".
    assert_eq!(lab.view().closing(&k), Err(AgreementsError::Missing(unheld)));
    assert_eq!(lab.view().closed_by(&label), Err(AgreementsError::Missing(unheld)));
}

/// F128, extended to every identity (Nobody, allegedly, 4 October 2026):
/// a person grants a key too. The grant and its revocation are everyday
/// acts signed with the person's own signing key, public: no rotation, no
/// chain key. A rotation still fences off a grant it does not keep, so a
/// thief who stole the signing key and granted itself a key loses it at
/// the owner's next rotation.
#[test]
fn a_persons_grant_key_is_added_and_revoked_by_everyday_acts() {
    let mut w = World::new();
    let mut singer = w.genesis("a singer", vec![own_home()], None, None);
    let mut agent = w.genesis("her agent", vec![own_home()], None, None);
    let env = mirs().envelopes;
    let grant = Grant { kinds: Some(vec![Kind::Type { spec: env, type_: 0 }]), ..person_grant(agent.id) };
    let g = agreements_act(&mut w, &mut singer, agreements::types::GRANT, grant.to_map(), None);
    assert!(w.v.get(&g).unwrap().act.outside.is_public());
    assert_eq!(w.v.status(&g), Status::Valid, "an everyday act: no chain key");
    sign(&mut w, &mut agent, &g);
    // The agent's strand: acts in the singer's name, citing the grant.
    let mut s1 = singer.clone();
    s1.binding = g;
    s1.sign = key_of(agent.id);
    s1.seq = vec![];
    s1.cite = Some((singer.id, vec![g]));
    let mut s2 = s1.clone();
    let post = |w: &mut World, st: &mut Person| {
        let a = w.everyday_act(st, env, 0, publication(vec![]), None, None);
        w.add(&a)
    };
    let cited = post(&mut w, &mut s1);
    let racing = post(&mut w, &mut s2);
    fn view(w: &World) -> AgreementsView<'_> {
        common::stand_in_payments(AgreementsView::new(&w.v, mirs()))
    }
    assert_eq!(view(&w).backing(&cited).unwrap(), Backing::Backed { grant: g });
    // A person is no collective: Agreements read the act by its backing.
    assert_eq!(view(&w).consent(&cited).unwrap(), Consent::NotCollective);
    // Beyond its reach: a Money act.
    let off = {
        let a = w.everyday_act(&mut s1, mirs().money, 0, vec![], None, None);
        w.add(&a)
    };
    assert!(matches!(view(&w).backing(&off).unwrap(), Backing::NotBacked { .. }));
    // The revocation: an everyday act of the singer, public, citing the
    // head it saw on her chain.
    let sid = singer.id;
    let r = agreements_act(
        &mut w,
        &mut singer,
        agreements::types::REVOCATION,
        agreements::Revocation { grant: g }.to_map(),
        Some(vec![Object { chain: sid, predecessor: cited }]),
    );
    assert_eq!(w.v.status(&r), Status::Valid, "an everyday act: no chain key");
    assert_eq!(view(&w).backing(&cited).unwrap(), Backing::Binds { grant: g });
    assert!(matches!(view(&w).backing(&racing).unwrap(), Backing::NotBacked { ref reason, .. } if reason.contains("G1")));
    // A thief holding the singer's signing key grants itself a key.
    let mut thief = w.genesis("a thief", vec![own_home()], None, None);
    let mut stolen = singer.clone();
    let tg = agreements_act(&mut w, &mut stolen, agreements::types::GRANT, person_grant(thief.id).to_map(), None);
    sign(&mut w, &mut thief, &tg);
    let mut ts = singer.clone();
    ts.binding = tg;
    ts.sign = key_of(thief.id);
    ts.seq = vec![];
    ts.cite = Some((singer.id, vec![tg]));
    let forged = post(&mut w, &mut ts);
    assert_eq!(view(&w).backing(&forged).unwrap(), Backing::Backed { grant: tg }, "until the owner rotates");
    // The singer rotates, keeping her own line's tip, not the thief's act:
    // the thief's grant is void under Identity, and its key with it.
    let (_, next) = w.rotate(&singer, Rot::default());
    singer = next;
    assert_eq!(w.v.status(&tg), Status::Void);
    assert!(matches!(view(&w).backing(&forged).unwrap(), Backing::NotBacked { .. }));
    // A private grant of a person is not visible to those who check the
    // grantee's acts, and backs nothing (reading).
    let mut quiet = w.genesis("a quiet agent", vec![own_home()], None, None);
    let qid = quiet.id;
    let qg = w.private_act(&mut singer, mirs().agreements, agreements::types::GRANT, person_grant(qid).to_map(), None, vec![qid]);
    sign(&mut w, &mut quiet, &qg);
    let mut qs = singer.clone();
    qs.binding = qg;
    qs.sign = key_of(qid);
    qs.seq = vec![];
    qs.cite = Some((singer.id, vec![qg]));
    let q = post(&mut w, &mut qs);
    assert!(matches!(view(&w).backing(&q).unwrap(), Backing::NotBacked { .. }));
}

/// A work's ownership agreement between `a` and `b`, half each, on a claim
/// of `work` by `by`, signed by both. Its founding id.
fn owners_of(w: &mut World, by: &mut Person, other: &mut Person, work: Hash) -> Hash {
    let c = common::claim_alone(w, by, &mirs(), work);
    let t = common::ownership_terms(c, &[(by.id, 500_000), (other.id, 500_000)], "A work shared half and half.");
    let d = agreements_act(w, by, agreements::types::TERMS, t.to_map(), None);
    sign(w, by, &d);
    sign(w, other, &d);
    d
}

/// A publication of the ownership agreement `owners`, drafted by `by` (one
/// of its parties), `service` its split service, changed by `f`; signed by
/// every other party in `signers`. Its id.
fn publish_under(w: &mut World, by: &mut Person, owners: Hash, service: Hash, signers: &mut [&mut Person], f: &dyn Fn(&mut agreements::Publication)) -> Hash {
    let mut p = agreements::Publication {
        sold: Some(vec![agreements::Sold::Access(spec("a stream cMIP"), mor_core::cbor::encode(&Value::Null))]),
        owners: Some(owners),
        partners: vec![],
        service,
        plan: common::test_plan(),
        words: None,
        time: None,
        until: None,
        refund: None,
        cmips: vec![],
        designated: None,
        backups: vec![],
        failed: None,
    };
    f(&mut p);
    let x = agreements_act(w, by, agreements::types::PUBLICATION, p.to_map(), obj(owners));
    for s in signers.iter_mut() {
        sign(w, s, &x);
    }
    x
}

/// "Publication (type 6)", fields 11 and 12 (rule 17): backups are the
/// publication's, each an identity that signs it, distinct and none the
/// split service; field 12, the failure terms, only with field 11.
#[test]
fn a_publications_backups_are_its_fields_11_and_12() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut s = w.genesis("service S", vec![own_home()], None, None);
    let mut t = w.genesis("service T", vec![own_home()], None, None);
    let (sid, tid) = (s.id, t.id);
    let d = owners_of(&mut w, &mut ana, &mut ben, spec("a song with backups"));
    let ok = publish_under(&mut w, &mut ana, d, sid, &mut [&mut ben, &mut s, &mut t], &|p| {
        p.backups = vec![tid];
        p.failed = Some(Value::Uint(60));
    });
    let e = view(&w).publication(&ok).unwrap();
    assert!(e.counts, "{:?}", e.problems);
    assert_eq!(e.publication.services(), vec![sid, tid], "field 3's service first, then the backups in order");
    // Unsigned by the backup: not every party signed.
    let unsigned = publish_under(&mut w, &mut ana, d, sid, &mut [&mut ben, &mut s], &|p| p.backups = vec![tid]);
    assert!(!view(&w).publication(&unsigned).unwrap().counts);
    // Out of format: the service as its own backup, a backup twice, or
    // failure terms with no backup.
    for f in [
        (&|p: &mut agreements::Publication| p.backups = vec![sid]) as &dyn Fn(&mut agreements::Publication),
        &|p: &mut agreements::Publication| p.backups = vec![tid, tid],
        &|p: &mut agreements::Publication| p.failed = Some(Value::Uint(60)),
    ] {
        let x = publish_under(&mut w, &mut ana, d, sid, &mut [&mut ben, &mut s, &mut t], f);
        assert!(view(&w).publication(&x).is_err() || !view(&w).publication(&x).unwrap().counts, "out of its format");
    }
}

/// Agreements rules 15 and 17 (F260, as the publication carries it): every
/// payer tries the services in order, a direct buyer too. A fan pays T,
/// the publication's backup (field 11), directly; T receipts it and splits
/// it. Unless the attempt at S, field 3's, is stated failed for that
/// payment, T's split breaks the plan, and Ana's cut check says so; once it
/// is, the split stands, and the check follows it to Ana's payout.
#[test]
fn f260_a_direct_buyer_tries_the_services_in_order() {
    use mor_core::money::{Amount, Payer, Payload as Fin, Purchase, Receipt};
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut s = w.genesis("service S", vec![own_home()], None, None);
    let mut t = w.genesis("service T", vec![own_home()], None, None);
    let (aid, bid, sid, tid) = (ana.id, ben.id, s.id, t.id);
    let deal = owners_of(&mut w, &mut ana, &mut ben, spec("a song, F260"));
    let pb = publish_under(&mut w, &mut ana, deal, sid, &mut [&mut ben, &mut s, &mut t], &|p| p.backups = vec![tid]);
    assert!(view(&w).publication(&pb).unwrap().counts);
    // T receipts the fan's payment, naming the ownership agreement.
    let r = Fin::Receipt(Receipt {
        rail: spec("a rail Module"),
        proof: b"a fan pays T directly".to_vec(),
        payer: Some(Payer::Identity(spec("a fan"))),
        payee: tid,
        amount: Amount { unit: spec("a unit"), value: 10 },
        fulfils: pb,
        previous: None,
        forward: None,
        batch: None,
        purchase: Some(Purchase { agreement: deal, line: deal }),
    });
    let a = w.everyday_act(&mut t, mirs().money, 2, r.to_map(), None, None);
    let receipt = w.add(&a);
    // T splits it, 5 and 5.
    let pay = |who: Hash| line_payout(who, 5, deal);
    let sp = agreements::Split { receipt, payouts: vec![pay(aid), pay(bid)], cmip: spec("a split cMIP"), publication: pb, tally: Some(vec![(0, vec![(aid, 0), (bid, 0)])]), number: Some(1), ..Default::default() };
    let x = w.private_act(&mut t, mirs().agreements, agreements::types::SPLIT, sp.to_map(), None, sorted(vec![aid, bid]));
    let order = |v: &AgreementsView| v.split(&x).unwrap().problems.iter().any(|p| p.contains("rule 17"));
    let v = view(&w);
    assert!(order(&v), "T took it out of order: its split breaks the plan");
    let check = v.cut_check(&receipt, &aid).unwrap();
    assert!(check.stops.iter().any(|w| w.contains("breaks its plan")), "{:?}", check.stops);
    // The attempt at S failed for this payment, as the split cMIP answers.
    let mut v = view(&w);
    v.attempts_failed.insert((receipt, sid));
    let e = v.split(&x).unwrap();
    assert!(e.problems.is_empty() && e.mismatched.is_empty(), "{:?} {:?}", e.problems, e.mismatched);
    let check = v.cut_check(&receipt, &aid).unwrap();
    assert_eq!(check.due, 5, "the participant's check follows a direct buyer's payment to its payout");
    assert!(!check.stops.iter().any(|w| w.contains("breaks its plan")), "{:?}", check.stops);
}

// ---------------------------------------------------------------- what pays a debt (audit, October 2026)

/// A payment toward a debt as its receiver (a receipt, type 2) or its payer
/// (a claim, type 3) signs it, with its own rail proof.
#[allow(clippy::too_many_arguments)]
fn payment(
    lab: &mut Lab,
    signer: &mut Person,
    claim: bool,
    payee: Hash,
    obligation: Hash,
    unit: Hash,
    value: u64,
    proof: &[u8],
) -> Hash {
    use mor_core::money::{Amount, Claim, Payer, Payload, Receipt};
    let amount = Amount { unit, value };
    let (t, p) = if claim {
        (3, Payload::Claim(Claim {
            rail: spec("a rail Module"),
            proof: proof.to_vec(),
            payee,
            amount,
            fulfils: obligation,
            disagrees: None,
            referral: None,
            refund: None,
            anonymous: None,
            purchase: None,
            previous: None,
        }))
    } else {
        (2, Payload::Receipt(Receipt {
            rail: spec("a rail Module"),
            proof: proof.to_vec(),
            payer: Some(Payer::Identity(lab.col.id)),
            payee,
            amount,
            fulfils: obligation,
            previous: None,
            forward: None,
            batch: None,
            purchase: None,
        }))
    };
    let a = lab.w.everyday_act(signer, mirs().money, t, p.to_map(), None, None);
    lab.w.add(&a)
}

/// Money rules 4 and 7 (audit, October 2026, gap 2): a receipt its
/// creditor signs pays a debt only with the rail's answer, valid, and only
/// in the debt's unit. A creditor-signed receipt with an empty proof and no
/// rail answer, or one for 100 of another unit, settles nothing: the
/// collective still owes, and cannot close.
#[test]
fn a_receipt_pays_a_debt_only_with_the_rails_answer_and_in_its_unit() {
    use mor_core::money::PaidAt;
    let mut lab = Lab::new(&|_| {});
    let label = lab.col.id;
    let mut printer = lab.w.genesis("the printer", vec![own_home()], None, None);
    let pid = printer.id;
    let d = obligation_to(&mut lab, pid, 100);
    // Signed by the creditor, naming the debt, the right amount: no proof,
    // no rail answer. Nothing paid.
    receipt_unanswered(&mut lab.w, &mut printer, label, d, 100);
    assert_eq!(lab.view().paid_toward(&d).unwrap(), 0);
    assert_eq!(lab.view().owes(&label).unwrap(), vec![d]);
    // A valid rail answer, but 100 of another unit: nothing paid.
    let other = payment(&mut lab, &mut printer, false, pid, d, spec("another unit"), 100, b"proof: another unit");
    lab.rail_valid.push((other, PaidAt::VaultEntry(pid, 0)));
    assert_eq!(lab.view().paid_toward(&d).unwrap(), 0);
    assert_eq!(lab.view().owes(&label).unwrap(), vec![d]);
    // In the debt's unit, with the rail's answer: paid.
    let good = payment(&mut lab, &mut printer, false, pid, d, spec("a unit"), 100, b"proof: paid");
    lab.rail_valid.push((good, PaidAt::VaultEntry(pid, 0)));
    assert_eq!(lab.view().paid_toward(&d).unwrap(), 100);
    assert_eq!(lab.view().owes(&label).unwrap(), Vec::<Hash>::new());
}

/// Money rules 12, 12a, 14 and 14a in Agreements' discharge (audit, October
/// 2026, gaps 2 and 6): where the creditor's rules say a payment counts.
/// The printer has a vault (limit 50 in the debt's unit) and a flow pointer
/// chain. The label's debts to it are IOUs (no agreement act): each counts
/// on the printer's flow only once the printer acknowledges it with an act
/// of its own, and then for the latest version that act holds, or an older
/// one, whatever the IOU names (rule 14, F145, F155); only within the
/// vault's limit (rule 14a); and only up to a fork of the chain (rule 12):
/// once a thief, with the stolen signing key, signs a second version 2
/// naming the same predecessor, a payment to either version 2 pays
/// nothing. *Changed by F145: under F133 an IOU citing the pointer it
/// named counted on that flow without any act of the printer's.*
#[test]
fn a_debt_is_paid_only_where_the_creditors_rules_let_it_count() {
    use mor_core::money::{vault_declaration, Amount, Obligation, PaidAt, PayeePointer, Payload, Rail, VaultEntry};
    let mut lab = Lab::new(&|_| {});
    let fin = mirs().money;
    let vault = VaultEntry { unit: spec("a unit"), rail_module: spec("a rail Module"), source: b"the printer's vault".to_vec(), limit: 50 };
    let mut printer = lab.w.genesis_with("the printer", vec![own_home()], None, None, Some(vec![vault_declaration(&fin, &[vault])]), 3);
    let pid = printer.id;
    let pointer = |lab: &mut Lab, p: &mut Person, version: u64, previous: Option<Hash>, node: &str| {
        let x = Payload::PayeePointer(PayeePointer {
            payee: pid,
            version,
            previous,
            rails: vec![Rail { module: spec("a rail Module"), address: node.as_bytes().to_vec() }],
        });
        let a = lab.w.everyday_act(p, fin, 0, x.to_map(), None, None);
        lab.w.add(&a)
    };
    let v1 = pointer(&mut lab, &mut printer, 1, None, "the printer's first node");
    // IOUs the label signs, naming a pointer (informative only, F155).
    let iou = |lab: &mut Lab, named: Hash, value: u64| {
        let o = Payload::Obligation(Obligation {
            debtor: lab.col.id,
            creditor: pid,
            amount: Amount { unit: spec("a unit"), value },
            pointer: named,
            agreement: None,
        });
        let a = lab.w.everyday_act(&mut lab.c[0], fin, 1, o.to_map(), None, None);
        let x = lab.w.add(&a);
        lab.sign(BEN, &x);
        x
    };
    // The printer acknowledges a debt with an act of its own (F145).
    let ack = |lab: &mut Lab, printer: &mut Person, d: Hash| {
        let a = lab.w.everyday_act(printer, mirs().agreements, agreements::types::NEGOTIATION, vec![(Value::Uint(0), Value::Text("Noted.".into()))], None, Some(vec![d]));
        lab.w.add(&a)
    };
    let paid = |lab: &mut Lab, printer: &mut Person, d: Hash, value: u64, at: PaidAt, proof: &str| {
        let r = payment(lab, printer, false, pid, d, spec("a unit"), value, proof.as_bytes());
        lab.rail_valid.push((r, at));
        lab.view().paid_toward(&d).unwrap()
    };
    // Rule 14: a debt the printer acknowledged while its pointer was
    // version 1, paid to version 2's flow, pays nothing; paid to the vault,
    // it pays.
    let old = iou(&mut lab, v1, 40);
    ack(&mut lab, &mut printer, old);
    let v2 = pointer(&mut lab, &mut printer, 2, Some(v1), "the printer's second node");
    assert_eq!(paid(&mut lab, &mut printer, old, 40, PaidAt::Flow(v2), "old, to v2"), 0);
    assert_eq!(paid(&mut lab, &mut printer, old, 40, PaidAt::VaultEntry(pid, 0), "old, to the vault"), 40);
    // F145: a debt the printer has not acknowledged counts on no flow.
    let bare = iou(&mut lab, v2, 30);
    assert_eq!(paid(&mut lab, &mut printer, bare, 30, PaidAt::Flow(v2), "bare, to v2"), 0);
    ack(&mut lab, &mut printer, bare);
    assert_eq!(lab.view().paid_toward(&bare).unwrap(), 30, "acknowledged by an act holding version 2");
    // Rule 14a: above the vault's limit of 50, paid to the flow, nothing.
    let big = iou(&mut lab, v2, 80);
    ack(&mut lab, &mut printer, big);
    assert_eq!(paid(&mut lab, &mut printer, big, 80, PaidAt::Flow(v2), "big, to the flow"), 0);
    assert_eq!(paid(&mut lab, &mut printer, big, 80, PaidAt::VaultEntry(pid, 0), "big, to the vault"), 80);
    // Within the limit, acknowledged by an act holding version 2, paid to
    // it: it counts...
    let d = iou(&mut lab, v2, 30);
    ack(&mut lab, &mut printer, d);
    assert_eq!(paid(&mut lab, &mut printer, d, 30, PaidAt::Flow(v2), "d, to v2"), 30);
    // ...until the thief forks the chain (rule 12). Paid to the thief's
    // version 2, or to the owner's, past the fork, nothing counts; paid to
    // version 1, the last pointer before the fork, it counts.
    let mut thief = printer.clone();
    let forked = pointer(&mut lab, &mut thief, 2, Some(v1), "the thief's node");
    assert_eq!(lab.view().paid_toward(&d).unwrap(), 0, "the owner's version 2 is past the fork");
    let d2 = iou(&mut lab, v2, 30);
    ack(&mut lab, &mut printer, d2);
    assert_eq!(paid(&mut lab, &mut thief, d2, 30, PaidAt::Flow(forked), "d2, to the thief"), 0);
    assert_eq!(paid(&mut lab, &mut printer, d2, 30, PaidAt::Flow(v1), "d2, to v1"), 30);
}

/// F153 (Identity, the sentence after rule 17): a debt paid to a pointer
/// its creditor published after a homeless rotation that only this
/// reader's own failed attempt to reach the old home lets count is
/// unknown: neither paid nor unpaid, and nothing binding relies on the
/// payment. Reading follows the creditor; once the old home's operator
/// closes it, the payment counts.
#[test]
fn a_debt_paid_through_a_readers_own_attempt_is_unknown() {
    use common::home;
    use mor_core::money::{Amount, Obligation, PaidAt, PayeePointer, Payload, Rail};
    let mut lab = Lab::new(&|_| {});
    let fin = mirs().money;
    let old = lab.w.operator("the printer's old home");
    let mut new = lab.w.operator("the printer's new home");
    let printer = lab.w.genesis("the printer", vec![home(&old)], None, None);
    let pid = printer.id;
    let (hr, mut p1) = lab.w.rotate(&printer, Rot { homeless: true, homes: Some(vec![home(&new)]), ..Default::default() });
    lab.w.receipt(&mut new, &pid, &hr, 1);
    lab.w.v.failed_to_reach(old.id);
    let x = Payload::PayeePointer(PayeePointer {
        payee: pid,
        version: 1,
        previous: None,
        rails: vec![Rail { module: spec("a rail Module"), address: b"the printer's new node".to_vec() }],
    });
    let a = lab.w.everyday_act(&mut p1, fin, 0, x.to_map(), None, None);
    let v1 = lab.w.add(&a);
    // The label's IOU, citing the pointer it names (F133), and its payment.
    let o = Payload::Obligation(Obligation {
        debtor: lab.col.id,
        creditor: pid,
        amount: Amount { unit: spec("a unit"), value: 100 },
        pointer: v1,
        agreement: None,
    });
    let a = lab.w.everyday_act(&mut lab.c[0], fin, 1, o.to_map(), Some(vec![Object { chain: pid, predecessor: v1 }]), None);
    let d = lab.w.add(&a);
    lab.sign(BEN, &d);
    // The printer acknowledges the IOU with an act of its own, which holds
    // its pointer through its sequence (F145): only then can it count on
    // the flow.
    let a = lab.w.everyday_act(&mut p1, mirs().agreements, agreements::types::NEGOTIATION, vec![(Value::Uint(0), Value::Text("Noted.".into()))], None, Some(vec![d]));
    lab.w.add(&a);
    let mut payer = lab.c[0].clone();
    let c = payment(&mut lab, &mut payer, true, pid, d, spec("a unit"), 100, b"paid to the new node");
    lab.rail_valid.push((c, PaidAt::Flow(v1)));
    // Reading follows the printer to its new home: the pointer is valid.
    assert_eq!(lab.w.v.status(&v1), Status::Valid);
    // Discharging the debt rests on the attempt: unknown, never paid.
    let v = lab.view();
    assert_eq!(v.paid(&d), Err(AgreementsError::OwnAttempt));
    assert_eq!(v.paid_toward(&d).unwrap(), 0, "nothing binding relies on it");
    // The old home closes: the payment counts.
    lab.w.rotate(&old, Rot { closure: true, ..Default::default() });
    assert_eq!(lab.view().paid(&d), Ok(100));
    assert_eq!(lab.view().paid_toward(&d).unwrap(), 100);
}

/// Money rule 10, double entry (audit, October 2026, gap 5): a payer's
/// valid claim is evidence on equal footing with a receipt. A receiver
/// that signs no receipt cannot keep the debt open: the claim alone shows
/// the money arrived. One that signs a receipt for less is outweighed: the
/// greater amount counts. Both are shown as open questions on the receiver.
/// A claim without the rail's answer counts for nothing and is not shown.
#[test]
fn a_payers_claim_counts_and_shows_what_the_receiver_hides() {
    use mor_core::money::{Amount, PaidAt};
    use mor_core::agreements::Disagreement;
    let mut lab = Lab::new(&|_| {});
    let label = lab.col.id;
    let mut printer = lab.w.genesis("the printer", vec![own_home()], None, None);
    let pid = printer.id;
    let unit = spec("a unit");
    let d = obligation_to(&mut lab, pid, 100);
    let at = PaidAt::VaultEntry(pid, 0);
    // The label, paying, signs a claim without the rail's answer: nothing.
    let mut payer = lab.c[0].clone();
    let bare = payment(&mut lab, &mut payer, true, pid, d, unit, 100, b"no answer");
    assert_eq!(lab.view().paid_toward(&d).unwrap(), 0);
    assert!(lab.view().disagreements(&pid).unwrap().is_empty());
    // A claim with the rail's answer for 60: the printer signs no receipt.
    let c1 = payment(&mut lab, &mut payer, true, pid, d, unit, 60, b"payment one");
    lab.rail_valid.push((c1, at));
    assert_eq!(lab.view().paid_toward(&d).unwrap(), 60, "the claim alone shows the money arrived");
    assert_eq!(lab.view().disagreements(&pid).unwrap(), vec![Disagreement::NoReceipt { claim: c1 }]);
    // A second payment of 40, claimed; the printer signs a receipt for 10.
    let c2 = payment(&mut lab, &mut payer, true, pid, d, unit, 40, b"payment two");
    lab.rail_valid.push((c2, at));
    let r2 = payment(&mut lab, &mut printer, false, pid, d, unit, 10, b"payment two");
    lab.rail_valid.push((r2, at));
    let v = lab.view();
    assert_eq!(v.paid_toward(&d).unwrap(), 100, "the greater amount counts");
    assert_eq!(v.owes(&label).unwrap(), Vec::<Hash>::new());
    let shown = v.disagreements(&pid).unwrap();
    assert!(shown.contains(&Disagreement::NoReceipt { claim: c1 }));
    assert!(shown.contains(&Disagreement::Differs {
        claim: c2,
        receipt: r2,
        claimed: Amount { unit, value: 40 },
        receipted: Amount { unit, value: 10 },
        payee: false,
        fulfils: false,
        previous: false,
    }));
    assert_eq!(shown.len(), 2);
    drop(v);
    // The printer signs a receipt matching the first payment: that question
    // closes, and the payment is not counted twice.
    let r1 = payment(&mut lab, &mut printer, false, pid, d, unit, 60, b"payment one");
    lab.rail_valid.push((r1, at));
    let v = lab.view();
    assert_eq!(v.paid_toward(&d).unwrap(), 100);
    assert!(!v.disagreements(&pid).unwrap().iter().any(|x| matches!(x, Disagreement::NoReceipt { .. })));
    let _ = bare;
}

/// Step 11b, human test of 8 October 2026: a client composing a clone's
/// mark asks Agreements who counts at the collective's next line (rule 44d,
/// `next_voices`), and Agreements say why it reads a collective as broken
/// (`broken`). A removal whose record never reached Agreements: Agreements still counts
/// the member's voice, so a mark naming only those who stay is false
/// (rule 45a), and the rotation declaring it leaves the collective broken.
#[test]
fn the_next_line_counts_the_voices_a_mark_names() {
    for drawn in [true, false] {
        let mut lab = Lab::new(&|_| {});
        let f = lab.founding;
        let col = lab.col.id;
        let ids = lab.ids();
        let all = sorted(vec![ids[ANA], ids[BEN], ids[CY]]);
        let n = lab.view().next_voices(&col, &Power::Constitutional, &[]).unwrap().unwrap();
        assert_eq!(n.agreement, f);
        assert_eq!(sorted(n.voices.clone()), all);
        assert_eq!(n.needed, Some(3), "every party whose voice remains");
        // Those whose resignations a record of the change will register first are left out.
        let n = lab.view().next_voices(&col, &Power::Constitutional, &[ids[BEN]]).unwrap().unwrap();
        assert_eq!((sorted(n.voices), n.needed), (sorted(vec![ids[ANA], ids[CY]]), Some(2)));

        let mut ben = lab.m[BEN].clone();
        let res = lab.resign_from(&mut ben, f, None);
        if drawn {
            lab.record(0, None, &[], vec![res], f);
        }
        let n = lab.view().next_voices(&col, &Power::Constitutional, &[]).unwrap().unwrap();
        assert_eq!(n.voices.contains(&ids[BEN]), !drawn, "a resignation counts at the record registering it, not before");

        // The clone removing Ben, marked with Ana and Cy only.
        let stay = vec![ids[ANA], ids[CY]];
        let auth = lab.authority.id;
        let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, CY])], &|t| {
            t.parties = stay.clone();
            let g = t.grammar.as_mut().unwrap();
            g.chain_key = Holding::Shares { threshold: 2, members: stay.clone() };
            g.recovery = Some(Recovery::Escrow { authority: auth });
            for a in t.areas.as_mut().unwrap() {
                a.holders.retain(|h| stay.contains(h));
            }
        });
        let k = lab.propose(ANA, &t);
        let sa = lab.sign(ANA, &k);
        let sc = lab.sign(CY, &k);
        lab.rotate(Some((k, vec![sa, sc])), &[0]);
        let broken = lab.view().broken(&col).unwrap();
        if drawn {
            assert_eq!(broken, None);
            let n = lab.view().next_voices(&col, &Power::Constitutional, &[]).unwrap().unwrap();
            assert_eq!((n.agreement, sorted(n.voices)), (k, sorted(stay)));
        } else {
            let w = broken.expect("the rotation's clone names too few signers");
            assert!(w.contains("the mark names too few signers to meet the power (rule 45a)"), "{w}");
            assert_eq!(lab.view().next_voices(&col, &Power::Constitutional, &[]).unwrap().unwrap_err(), w);
        }
    }
}

/// Agreements draft 10, revised in place for F185 (rule 37d), freeze suite v21,
/// step 3.7w: a broken collective, and its way back. Ben resigns, but the
/// record registering it never reaches the verifier; the rotation removing
/// him declares a clone whose mark names only Ana and Cy, too few for
/// "every party whose voice remains": the broken act. Every act of the
/// broken stretch counts for nothing, for good; a rollback naming the
/// broken act, a clone of the founding agreement, registering Ben's
/// resignation, signed by Ana and Cy, brings the collective back.
#[test]
fn a_broken_collective_rolls_back() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let col = lab.col.id;
    let ids = lab.ids();
    let agreements = mirs().agreements;
    let auth = lab.authority.id;
    let stay = vec![ids[ANA], ids[CY]];
    let without_ben = move |t: &mut Terms| {
        t.parties = stay.clone();
        let g = t.grammar.as_mut().unwrap();
        g.chain_key = Holding::Shares { threshold: 2, members: stay.clone() };
        g.recovery = Some(Recovery::Escrow { authority: auth });
        for a in t.areas.as_mut().unwrap() {
            a.holders.retain(|h| stay.contains(h));
        }
    };

    // Ben resigns from the founding agreement; the record is lost.
    let mut ben = lab.m[BEN].clone();
    let res_b = lab.resign_from(&mut ben, f, None);
    let broken_clone = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, CY])], &without_ben);
    let k1 = lab.propose(ANA, &broken_clone);
    let (sa, sc) = (lab.sign(ANA, &k1), lab.sign(CY, &k1));
    let rot1 = lab.rotate(Some((k1, vec![sa, sc])), &[0]);
    let b = lab.view().broken_act(&col).unwrap().expect("broken, with a way back");
    assert_eq!((b.act, b.before), (rot1, f));
    assert!(b.reason.contains("too few signers"), "{}", b.reason);

    // The broken stretch: a publication counts for nothing; a record is no line.
    let pub1 = lab.publish(0);
    lab.sign(ANA, &pub1);
    assert!(matches!(lab.consent(&pub1), Consent::Broken { .. }));
    let rec = lab.record(0, None, &[], vec![res_b], k1);
    assert!(!lab.view().record(&col, &rec).unwrap().line, "a record of the broken stretch is no line");

    // Who counts for the rollback: the founding agreement's constitutional
    // change rule, every voice that remains; Ben's resignation, once the
    // rollback registers it, takes him out.
    let n = lab.view().rollback_voices(&col, &Power::Constitutional, &[]).unwrap().unwrap();
    assert_eq!((n.agreement, n.voices.len(), n.needed), (f, 3, Some(3)));
    let n = lab.view().rollback_voices(&col, &Power::Constitutional, &[ids[BEN]]).unwrap().unwrap();
    assert_eq!((sorted(n.voices), n.needed), (sorted(vec![ids[ANA], ids[CY]]), Some(2)));

    let rb = |lab: &mut Lab, k: Hash, sigs: Vec<Hash>, broken: Hash, regs: Vec<Hash>| {
        lab.rotate_with(Some(vec![agreements::rollback_declaration(&agreements, &k, &sigs, &broken, &regs)]), &[0])
    };
    let still_broken = |lab: &Lab| lab.view().broken_act(&col).unwrap().map(|b| b.act);

    // Rollbacks that put nothing in force, each part of the broken stretch.
    let r = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, CY])], &without_ben);
    let r = lab.propose(ANA, &r);
    let (ra, rc) = (lab.sign(ANA, &r), lab.sign(CY, &r));
    rb(&mut lab, r, vec![ra, rc], pub1, vec![res_b]); // names another act as broken
    assert_eq!(still_broken(&lab), Some(rot1));
    rb(&mut lab, r, vec![ra, rc], rot1, vec![]); // Ben's voice still counted: too few
    assert_eq!(still_broken(&lab), Some(rot1));
    rb(&mut lab, r, vec![ra, rc], rot1, vec![pub1]); // registers what is no resignation
    assert_eq!(still_broken(&lab), Some(rot1));
    // (A declaration of absence made during the stretch may be registered
    // by the rollback: RB3, `rb3_a_rollback_registers_a_declaration_of_absence`.)
    let of_broken = lab.clone_terms(&k1, vec![(Power::Constitutional, vec![ANA, CY])], &|_| {});
    let of_broken = lab.propose(ANA, &of_broken);
    let (oa, oc) = (lab.sign(ANA, &of_broken), lab.sign(CY, &of_broken));
    rb(&mut lab, of_broken, vec![oa, oc], rot1, vec![res_b]); // a clone of the broken clone
    assert_eq!(still_broken(&lab), Some(rot1));
    let by_clone_rule = lab.clone_terms(&f, vec![(Power::Clone, vec![ANA, CY])], &|_| {});
    let by_clone_rule = lab.propose(ANA, &by_clone_rule);
    let (ca, cc) = (lab.sign(ANA, &by_clone_rule), lab.sign(CY, &by_clone_rule));
    rb(&mut lab, by_clone_rule, vec![ca, cc], rot1, vec![res_b]); // marked with the clone rule
    assert_eq!(still_broken(&lab), Some(rot1));
    // A normal clone declaration in the stretch is part of it too.
    lab.rotate(Some((r, vec![ra, rc])), &[0]);
    assert_eq!(still_broken(&lab), Some(rot1));

    // The rollback: the founding agreement without Ben, naming the broken
    // act, registering his resignation, signed by Ana and Cy.
    let back = rb(&mut lab, r, vec![ra, rc], rot1, vec![res_b]);
    let v = lab.view();
    assert_eq!(v.broken(&col).unwrap(), None);
    assert_eq!(v.broken_act(&col).unwrap(), None);
    assert_eq!(v.current(&col).unwrap().unwrap().agreement, r);
    let n = v.next_voices(&col, &Power::Constitutional, &[]).unwrap().unwrap();
    assert_eq!((n.agreement, sorted(n.voices)), (r, sorted(vec![ids[ANA], ids[CY]])));
    // The identity chain carried on: the broken act is still there, shown.
    let res = lab.w.v.resolve(&col);
    assert!(res.position_of(&rot1).unwrap() < res.position_of(&back).unwrap());
    drop(v);
    // The broken stretch counts for nothing, for good; a publication after the rollback counts.
    assert!(matches!(lab.consent(&pub1), Consent::Broken { .. }));
    let pub2 = lab.publish(0);
    lab.sign(ANA, &pub2);
    assert!(lab.counts(&pub2), "{:?}", lab.consent(&pub2));
}

/// Rule 37d: a rollback may change nothing; its mark names the
/// constitutional change rule all the same, never the clone rule rule 44c.2
/// would give such a clone. It needs every voice that remains: a draft with
/// two signatures of three. The resignations it registers take effect at
/// its line and stay in effect after it.
#[test]
fn a_rollback_may_change_nothing_and_needs_every_voice_that_remains() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let col = lab.col.id;
    let ids = lab.ids();
    let agreements = mirs().agreements;
    // A rotation declaring a clone marked with the clone rule: broken (rule 37, B5).
    let k1 = lab.clone_terms(&f, vec![(Power::Clone, vec![ANA, BEN])], &|t| t.text = "Changed words.".into());
    let k1 = lab.propose(ANA, &k1);
    let (s1, s2) = (lab.sign(ANA, &k1), lab.sign(BEN, &k1));
    let rot1 = lab.rotate(Some((k1, vec![s1, s2])), &[0]);
    assert!(lab.view().broken_act(&col).unwrap().is_some());

    // The founding agreement again, changing nothing, marked with the constitutional change rule.
    let same = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|_| {});
    let r = lab.propose(ANA, &same);
    let v = lab.view();
    assert!(v.agreement(&r).unwrap().invalid.is_some(), "as an ordinary clone its mark is false");
    assert_eq!(v.rollback_agreement(&r).unwrap().invalid, None, "as a rollback's it is not");
    drop(v);
    let (a, b) = (lab.sign(ANA, &r), lab.sign(BEN, &r));
    lab.rotate_with(Some(vec![agreements::rollback_declaration(&agreements, &r, &[a, b], &rot1, &[])]), &[0]);
    assert!(lab.view().broken_act(&col).unwrap().is_some(), "a draft: Cy has not signed");
    let c = lab.sign(CY, &r);
    lab.rotate_with(Some(vec![agreements::rollback_declaration(&agreements, &r, &[a, b, c], &rot1, &[])]), &[0]);
    assert_eq!(lab.view().broken(&col).unwrap(), None);
    assert_eq!(lab.view().current(&col).unwrap().unwrap().agreement, r);

    // Broken again, and rolled back registering Cy's resignation: the clone
    // keeps Cy among the parties, but from that line his voice is gone.
    let k2 = lab.clone_terms(&r, vec![(Power::Clone, vec![ANA, BEN])], &|t| t.text = "Other words.".into());
    let k2 = lab.propose(ANA, &k2);
    let (t1, t2) = (lab.sign(ANA, &k2), lab.sign(BEN, &k2));
    let rot2 = lab.rotate(Some((k2, vec![t1, t2])), &[0]);
    let b = lab.view().broken_act(&col).unwrap().unwrap();
    assert_eq!((b.act, b.before), (rot2, r), "the next rollback names the new broken act, before it the first rollback's clone");
    let mut cy = lab.m[CY].clone();
    let res_c = lab.resign_from(&mut cy, r, None);
    let same2 = lab.clone_terms(&r, vec![(Power::Constitutional, vec![ANA, BEN])], &|_| {});
    let r2 = lab.propose(ANA, &same2);
    let (u1, u2) = (lab.sign(ANA, &r2), lab.sign(BEN, &r2));
    lab.rotate_with(Some(vec![agreements::rollback_declaration(&agreements, &r2, &[u1, u2], &rot2, &[res_c])]), &[0]);
    let v = lab.view();
    assert_eq!(v.broken(&col).unwrap(), None);
    let n = v.next_voices(&col, &Power::Constitutional, &[]).unwrap().unwrap();
    assert_eq!((n.agreement, sorted(n.voices)), (r2, sorted(vec![ids[ANA], ids[BEN]])));
    assert_eq!(v.current(&col).unwrap().unwrap().departed, vec![ids[CY]]);
    drop(v);

    // F185: a rollback voids only an act Agreements read as broken. An attempt on
    // the working collective, naming an act already repaired, puts nothing
    // in force and is itself a broken act, repaired by a rollback to just
    // before it.
    let attempt = lab.rotate_with(Some(vec![agreements::rollback_declaration(&agreements, &r2, &[u1, u2], &rot1, &[])]), &[0]);
    let b = lab.view().broken_act(&col).unwrap().expect("the attempt breaks the collective");
    assert_eq!((b.act, b.before), (attempt, r2));
    assert!(b.reason.contains("not broken"), "{}", b.reason);
}

/// Rule 37d with rule 44d: a resignation in the broken stretch cannot make
/// the rule impossible while a voice remains; once every voice has
/// resigned, nothing meets it and no rollback is possible (the last voice,
/// rule 37a). A resignation naming the broken clone names an agreement
/// never in force: no rollback registers it.
#[test]
fn no_rollback_once_every_voice_has_resigned() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let col = lab.col.id;
    let ids = lab.ids();
    let agreements = mirs().agreements;
    let k1 = lab.clone_terms(&f, vec![(Power::Clone, vec![ANA, BEN])], &|t| t.text = "Changed words.".into());
    let k1 = lab.propose(ANA, &k1);
    let (s1, s2) = (lab.sign(ANA, &k1), lab.sign(BEN, &k1));
    let rot1 = lab.rotate(Some((k1, vec![s1, s2])), &[0]);

    let mut cy = lab.m[CY].clone();
    let wrong = lab.resign_from(&mut cy, k1, None);
    let same = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN])], &|_| {});
    let r = lab.propose(ANA, &same);
    let (a, b) = (lab.sign(ANA, &r), lab.sign(BEN, &r));
    lab.rotate_with(Some(vec![agreements::rollback_declaration(&agreements, &r, &[a, b], &rot1, &[wrong])]), &[0]);
    assert!(lab.view().broken_act(&col).unwrap().is_some(), "a resignation from the broken clone registers nothing");

    let n = lab.view().rollback_voices(&col, &Power::Constitutional, &ids).unwrap().unwrap();
    assert_eq!((n.voices.len(), n.needed), (0, None), "every voice leaving: nothing meets the rule");
    let mut regs = vec![];
    for who in [ANA, BEN, CY] {
        let mut p = lab.m[who].clone();
        regs.push(lab.resign_from(&mut p, f, None));
    }
    lab.rotate_with(Some(vec![agreements::rollback_declaration(&agreements, &r, &[a, b], &rot1, &regs)]), &[0]);
    // Every voice registered as gone: no rollback can complete; the
    // collective stays broken, its reason still the broken act's.
    assert_eq!(lab.view().broken_act(&col).unwrap().map(|b| b.act), Some(rot1));
}

// ---------------------------------------------------------------- F187, RB1 to RB6 (9 October 2026)

/// The broken act of `a_broken_collective_rolls_back`: Ben resigns, the
/// record is lost, the rotation removing him names too few signers. The
/// clone it declared (`k1`, marked with Ana and Cy), its signature acts,
/// Ben's resignation and the broken act.
fn break_by_lost_record(lab: &mut Lab) -> (Hash, Vec<Hash>, Hash, Hash) {
    let f = lab.founding;
    let ids = lab.ids();
    let auth = lab.authority.id;
    let stay = vec![ids[ANA], ids[CY]];
    let mut ben = lab.m[BEN].clone();
    let res_b = lab.resign_from(&mut ben, f, None);
    let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, CY])], &move |t| {
        t.parties = stay.clone();
        let g = t.grammar.as_mut().unwrap();
        g.chain_key = Holding::Shares { threshold: 2, members: stay.clone() };
        g.recovery = Some(Recovery::Escrow { authority: auth });
        for a in t.areas.as_mut().unwrap() {
            a.holders.retain(|h| stay.contains(h));
        }
    });
    let k1 = lab.propose(ANA, &t);
    let sigs = vec![lab.sign(ANA, &k1), lab.sign(CY, &k1)];
    let rot1 = lab.rotate(Some((k1, sigs.clone())), &[0]);
    (k1, sigs, res_b, rot1)
}

/// Absence judged by two of the other members; the chain key two of
/// three, so that no escrowed share is needed.
fn others_judge_absence(t: &mut Terms) {
    let ids = t.parties.clone();
    t.abandonment.as_mut().unwrap().authority = Authority::Others(2);
    let g = t.grammar.as_mut().unwrap();
    g.chain_key = Holding::Shares { threshold: 2, members: ids };
    g.recovery = None;
}

/// The label's own publication (type 6) selling `sold`, under its own
/// ownership agreement (the founding), the label its own split service,
/// drafted on device `d`; and its price tag, signed for the label on the
/// same device under the Money area (Ben signing): `(publication, tag)`.
/// Drafted during a broken stretch, the publication never counts (rule 93).
fn self_sale(lab: &mut Lab, d: usize, sold: Vec<agreements::Sold>, price: u64) -> (Hash, Hash) {
    let f = lab.founding;
    let label = lab.col.id;
    let p = agreements::Publication { sold: Some(sold), owners: Some(f), partners: vec![], service: label, plan: common::test_plan(), words: None, time: None, until: None, refund: None, cmips: vec![], designated: None, backups: vec![], failed: None };
    let o = lab.chain(&[]);
    let mut objects = vec![Object { chain: f, predecessor: f }];
    objects.extend(o);
    let a = lab.w.everyday_act(&mut lab.c[d], mirs().agreements, agreements::types::PUBLICATION, p.to_map(), Some(objects), None);
    let pb = lab.own(d, &a);
    let t = mor_core::money::Payload::PriceTag(mor_core::money::PriceTag { priced: mor_core::money::Priced::Publication(pb), version: 1, previous: None, price: Some(mor_core::money::Amount { unit: spec("a unit"), value: price }), payee: label });
    let a = lab.w.everyday_act(&mut lab.c[d], mirs().money, mor_core::money::types::PRICE_TAG, t.to_map(), None, None);
    let tag = lab.own(d, &a);
    lab.sign(BEN, &tag);
    (pb, tag)
}

/// The label's receipt (Money type 2), on device `d`, of `fan`'s payment
/// of `value` on `rail` following `tag`, naming the ownership agreement
/// `f` at `line` (field 9); Ben signs it under the Money area.
#[allow(clippy::too_many_arguments)]
fn stretch_receipt(lab: &mut Lab, d: usize, rail: Hash, fan: Hash, proof: &[u8], tag: Hash, line: Hash, value: u64) -> Hash {
    use mor_core::money::{Amount, Payer, Payload as Fin, Purchase, Receipt};
    let label = lab.col.id;
    let f = lab.founding;
    let r = Fin::Receipt(Receipt { rail, proof: proof.to_vec(), payer: Some(Payer::Identity(fan)), payee: label, amount: Amount { unit: spec("a unit"), value }, fulfils: tag, previous: None, forward: None, batch: None, purchase: Some(Purchase { agreement: f, line }) });
    let a = lab.w.everyday_act(&mut lab.c[d], mirs().money, 2, r.to_map(), None, None);
    let x = lab.own(d, &a);
    lab.sign(BEN, &x);
    x
}

/// A rotation declaring a rollback.
fn roll_back(lab: &mut Lab, k: Hash, sigs: &[Hash], broken: Hash, regs: &[Hash]) -> Hash {
    let agreements = mirs().agreements;
    lab.rotate_with(Some(vec![agreements::rollback_declaration(&agreements, &k, sigs, &broken, regs)]), &[0])
}

/// F187 (5), rule 37d: "the broken clone stays on its own branch, never in
/// force". The clone the broken act declared is refused as a rollback's
/// clone, even where its mark happens to equal a rollback's.
#[test]
fn f187_5_the_broken_clone_is_never_the_rollbacks_clone() {
    let mut lab = Lab::new(&|_| {});
    let col = lab.col.id;
    let (k1, sigs, res_b, rot1) = break_by_lost_record(&mut lab);
    roll_back(&mut lab, k1, &sigs, rot1, &[res_b]);
    assert_eq!(
        lab.view().broken_act(&col).unwrap().map(|b| b.act),
        Some(rot1),
        "the broken clone itself puts nothing in force"
    );
    // A new clone of the same agreement, the same rules, signed afresh: the way back.
    let f = lab.founding;
    let r = lab.view().terms(&k1).unwrap();
    let r = lab.propose(ANA, &r);
    let rs = vec![lab.sign(ANA, &r), lab.sign(CY, &r)];
    assert_eq!(lab.view().terms(&r).unwrap().parent, Some(f));
    roll_back(&mut lab, r, &rs, rot1, &[res_b]);
    assert_eq!(lab.view().broken(&col).unwrap(), None);
    assert_eq!(lab.view().current(&col).unwrap().unwrap().agreement, r);
}

/// F187 (6), rule 37d and C2: a departing member's signature that the
/// collective placed before the rollback counts there as at every other
/// line. A constitutional clone of the founding agreement, signed by all
/// three and acknowledged by the label before the broken act, is declared
/// as the rollback's clone while the rollback registers Cy's resignation:
/// Cy still counts for it, so a mark naming Ana and Ben alone is too few,
/// and one naming all three completes it. (The text said "counts for
/// nothing there"; it now says what the core does. No code changed.)
#[test]
fn f187_6_a_departing_members_placed_signature_counts_at_the_rollback() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let col = lab.col.id;
    let drafted = |lab: &mut Lab, mark: Vec<usize>| -> (Hash, Vec<Hash>) {
        let t = lab.clone_terms(&f, vec![(Power::Constitutional, mark)], &|t| t.text = "Drafted before the break.".into());
        let k = lab.propose(ANA, &t);
        // Cy's signature, acknowledged on the label's chain before Ana and
        // Ben sign: their signature acts cite the acknowledgement, so a
        // rotation naming them holds it (rule 58).
        let sc = lab.sign(CY, &k);
        lab.acknowledge(0, sc);
        let s: Vec<Hash> = [ANA, BEN].iter().map(|w| lab.sign(*w, &k)).chain([sc]).collect();
        (k, s)
    };
    let (two, s2) = drafted(&mut lab, vec![ANA, BEN]);
    let (three, s3) = drafted(&mut lab, vec![ANA, BEN, CY]);
    // Broken by a clone marked with the clone rule (rule 37, B5).
    let k1 = lab.clone_terms(&f, vec![(Power::Clone, vec![ANA, BEN])], &|t| t.text = "Changed words.".into());
    let k1 = lab.propose(ANA, &k1);
    let ks = vec![lab.sign(ANA, &k1), lab.sign(BEN, &k1)];
    let rot1 = lab.rotate(Some((k1, ks)), &[0]);
    // F207: her resignation names the drafts she signed and leaves behind.
    let mut cy = lab.m[CY].clone();
    let res_c = lab.resign_leaving(&mut cy, f, None, vec![two, three]);
    roll_back(&mut lab, two, &s2[..2], rot1, &[res_c]);
    let b = lab.view().broken_act(&col).unwrap();
    assert_eq!(b.map(|b| b.act), Some(rot1), "Cy's placed signature counts: two is too few");
    roll_back(&mut lab, three, &s3, rot1, &[res_c]);
    assert_eq!(lab.view().broken(&col).unwrap(), None);
    assert_eq!(lab.view().current(&col).unwrap().unwrap().agreement, three);
    assert_eq!(lab.view().current(&col).unwrap().unwrap().departed, vec![lab.m[CY].id]);
}

/// F187 (7), rule 37d: an act of the broken stretch places no signature
/// at all, a declaration of absence's included. Ben's signature act on
/// Ana's declaration of Cy's absence, acknowledged by the label during the
/// broken stretch, does not count at a record after the rollback; the
/// same acknowledgement made after the rollback does.
#[test]
fn f187_7_a_stretch_acknowledgement_places_no_signature_on_a_declaration() {
    let mut lab = Lab::new(&others_judge_absence);
    let f = lab.founding;
    let col = lab.col.id;
    let k1 = lab.clone_terms(&f, vec![(Power::Clone, vec![ANA, BEN])], &|t| t.text = "Changed words.".into());
    let k1 = lab.propose(ANA, &k1);
    let ks = vec![lab.sign(ANA, &k1), lab.sign(BEN, &k1)];
    let rot1 = lab.rotate(Some((k1, ks)), &[0]);
    let d = lab.declare(Some(ANA), f, f, CY, vec![outcomes::VOICE_REMOVED]);
    let sb = lab.sign(BEN, &d);
    lab.acknowledge(0, sb);
    // The rollback restores the founding agreement, every voice signing.
    let same = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|_| {});
    let r = lab.propose(ANA, &same);
    let rs: Vec<Hash> = [ANA, BEN, CY].iter().map(|w| lab.sign(*w, &r)).collect();
    roll_back(&mut lab, r, &rs, rot1, &[]);
    assert_eq!(lab.view().broken(&col).unwrap(), None);
    let rec = lab.record(0, None, &[], vec![d], r);
    let e = lab.view().record(&col, &rec).unwrap();
    assert!(!e.line, "Ben's signature, acknowledged only during the broken stretch, is not placed");
    assert!(e.not_a_line.as_deref().is_some_and(|w| w.contains("1 of the 2")), "{:?}", e.not_a_line);
    lab.acknowledge(0, sb);
    let rec = lab.record(0, None, &[], vec![d], r);
    let e = lab.view().record(&col, &rec).unwrap();
    assert!(e.line, "{:?}", e.not_a_line);
}

/// RB4 (decided 9 October 2026, "broken is broken"): a rotation whose
/// Agreements declaration is missing (the kind removed) or unreadable is a broken
/// act, a technical one, with the same way back: a rollback to the
/// agreement in force just before it.
#[test]
fn rb4_a_missing_or_unreadable_declaration_is_a_break_with_a_rollback() {
    for case in ["removed", "unreadable"] {
        let mut lab = Lab::new(&|_| {});
        let f = lab.founding;
        let col = lab.col.id;
        let agreements = mirs().agreements;
        let value = match case {
            "removed" => None,
            _ => Some(Value::Uint(7)),
        };
        let rot1 = lab.rotate_with(Some(vec![mor_core::identity::Declaration { spec: agreements, kind: 0, value }]), &[0]);
        let b = lab.view().broken_act(&col).unwrap().unwrap_or_else(|| panic!("{case}: a broken act, with a way back"));
        assert_eq!((b.act, b.before), (rot1, f), "{case}");
        let p = lab.publish(0);
        lab.sign(ANA, &p);
        assert!(matches!(lab.consent(&p), Consent::Broken { .. }), "{case}");
        let same = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|_| {});
        let r = lab.propose(ANA, &same);
        let rs: Vec<Hash> = [ANA, BEN, CY].iter().map(|w| lab.sign(*w, &r)).collect();
        roll_back(&mut lab, r, &rs, rot1, &[]);
        assert_eq!(lab.view().broken(&col).unwrap(), None, "{case}");
        assert_eq!(lab.view().current(&col).unwrap().unwrap().agreement, r, "{case}");
    }
}

/// RB3 (decided 9 October 2026, third round): the rollback may register a
/// declaration of absence made during the broken stretch under the clause
/// of the agreement in force just before the broken act, exactly as a
/// record does outside it: the vanished member then no longer blocks the
/// way back. Where the clause asks for several of the other members, the
/// rollback names their signature acts beside the declaration and places
/// them; an acknowledgement made during the stretch places nothing.
#[test]
fn rb3_a_rollback_registers_a_declaration_of_absence() {
    // A named authority.
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let col = lab.col.id;
    let ids = lab.ids();
    let k1 = lab.clone_terms(&f, vec![(Power::Clone, vec![ANA, BEN])], &|t| t.text = "Changed words.".into());
    let k1 = lab.propose(ANA, &k1);
    let ks = vec![lab.sign(ANA, &k1), lab.sign(BEN, &k1)];
    let rot1 = lab.rotate(Some((k1, ks)), &[0]);
    let d = lab.declare(None, f, f, CY, vec![outcomes::VOICE_REMOVED]);
    let n = lab.view().rollback_voices(&col, &Power::Constitutional, &[ids[CY]]).unwrap().unwrap();
    assert_eq!((sorted(n.voices), n.needed), (sorted(vec![ids[ANA], ids[BEN]]), Some(2)));
    let same = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN])], &|_| {});
    let r = lab.propose(ANA, &same);
    let rs = vec![lab.sign(ANA, &r), lab.sign(BEN, &r)];
    roll_back(&mut lab, r, &rs, rot1, &[d]);
    let v = lab.view();
    assert_eq!(v.broken(&col).unwrap(), None);
    let cur = v.current(&col).unwrap().unwrap();
    assert_eq!((cur.agreement, cur.departed), (r, vec![ids[CY]]));
    drop(v);

    // Two of the other members judge absence.
    let mut lab = Lab::new(&others_judge_absence);
    let f = lab.founding;
    let col = lab.col.id;
    let k1 = lab.clone_terms(&f, vec![(Power::Clone, vec![ANA, BEN])], &|t| t.text = "Changed words.".into());
    let k1 = lab.propose(ANA, &k1);
    let ks = vec![lab.sign(ANA, &k1), lab.sign(BEN, &k1)];
    let rot1 = lab.rotate(Some((k1, ks)), &[0]);
    let d = lab.declare(Some(ANA), f, f, CY, vec![outcomes::VOICE_REMOVED]);
    let sb = lab.sign(BEN, &d);
    lab.acknowledge(0, sb);
    let same = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN])], &|_| {});
    let r = lab.propose(ANA, &same);
    let rs = vec![lab.sign(ANA, &r), lab.sign(BEN, &r)];
    roll_back(&mut lab, r, &rs, rot1, &[d]);
    assert_eq!(lab.view().broken_act(&col).unwrap().map(|b| b.act), Some(rot1), "Ben's signature, acknowledged in the stretch, is not placed");
    // A signature act on something else is no registration.
    roll_back(&mut lab, r, &rs, rot1, &[d, rs[0]]);
    assert_eq!(lab.view().broken_act(&col).unwrap().map(|b| b.act), Some(rot1));
    roll_back(&mut lab, r, &rs, rot1, &[d, sb]);
    assert_eq!(lab.view().broken(&col).unwrap(), None);
    assert_eq!(lab.view().current(&col).unwrap().unwrap().departed, vec![lab.m[CY].id]);
}

/// RB1 (decided 8 and 9 October 2026): a broken collective is quarantined.
/// A grantee's act during the broken stretch counts for nothing, like the
/// collective's own; the grant works again after the rollback, which
/// restores every condition as at the act before the break. An act the
/// broken act's history holds was made before it, and stands; one racing
/// it, or after it, is of the stretch, placed only by citing the rollback
/// or a later decision. What was signed in the stretch is signed anew,
/// never adopted (RB2). A grant made during the stretch backs nothing.
#[test]
fn rb1_a_grant_is_quarantined_during_the_broken_stretch() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let col = lab.col.id;
    let env = mirs().envelopes;
    let mut agent = lab.w.genesis("an agent", vec![own_home()], None, None);
    let grant = Grant {
        area: Some(1),
        kinds: Some(vec![Kind::Type { spec: env, type_: 0 }]),
        ..plain_grant(agent.id)
    };
    let g = lab.grant(&grant);
    lab.sign(ANA, &g);
    sign(&mut lab.w, &mut agent, &g);
    let mut st = lab.strand(g, &agent);
    let act = |lab: &mut Lab, st: &mut Person| -> Hash {
        let a = lab.w.everyday_act(st, env, 0, publication(vec![]), None, None);
        lab.w.add(&a)
    };
    // Made before the break, and held by its history: the label's next act cites it.
    let early = act(&mut lab, &mut st);
    let seen = {
        let o = lab.chain(&[early]);
        let a = lab.w.everyday_act(&mut lab.c[0], env, 0, publication(vec![]), Some(o), None);
        lab.w.add(&a)
    };
    lab.sign(ANA, &seen);
    assert_eq!(lab.view().backing(&early).unwrap(), Backing::Backed { grant: g });
    let k1 = lab.clone_terms(&f, vec![(Power::Clone, vec![ANA, BEN])], &|t| t.text = "Changed words.".into());
    let k1 = lab.propose(ANA, &k1);
    let ks = vec![lab.sign(ANA, &k1), lab.sign(BEN, &k1)];
    let rot1 = lab.rotate(Some((k1, ks)), &[0]);
    assert!(lab.view().broken_act(&col).unwrap().is_some());
    // During the stretch: the grantee, citing its grant and the latest
    // decision it holds, the broken rotation (rule 58, client conformance),
    // counts for nothing.
    st.cite.as_mut().unwrap().1.push(rot1);
    let during = act(&mut lab, &mut st);
    st.cite.as_mut().unwrap().1.retain(|x| *x != rot1);
    assert!(matches!(lab.view().backing(&during).unwrap(), Backing::NotBacked { ref reason, .. } if reason.contains("broken stretch")), "{:?}", lab.view().backing(&during).unwrap());
    assert!(!lab.counts(&during));
    assert_eq!(lab.view().backing(&early).unwrap(), Backing::Backed { grant: g }, "made before the break, it stands");
    // A grant made in the stretch counts for nothing, then and after.
    let mut other = lab.w.genesis("another agent", vec![own_home()], None, None);
    let g2 = lab.grant(&plain_grant(other.id));
    lab.sign(ANA, &g2);
    sign(&mut lab.w, &mut other, &g2);
    let mut st2 = lab.strand(g2, &other);
    // The rollback restores the founding agreement.
    let same = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|_| {});
    let r = lab.propose(ANA, &same);
    let rs: Vec<Hash> = [ANA, BEN, CY].iter().map(|w| lab.sign(*w, &r)).collect();
    let back = roll_back(&mut lab, r, &rs, rot1, &[]);
    assert_eq!(lab.view().broken(&col).unwrap(), None);
    // After it, the grant works again for an act citing the rollback.
    st.cite.as_mut().unwrap().1.push(back);
    let after = act(&mut lab, &mut st);
    assert_eq!(lab.view().backing(&after).unwrap(), Backing::Backed { grant: g });
    st2.cite.as_mut().unwrap().1.push(back);
    let under_g2 = act(&mut lab, &mut st2);
    assert!(matches!(lab.view().backing(&under_g2).unwrap(), Backing::NotBacked { .. }));
    // The stretch's act stays void, even acknowledged after the rollback: signed anew, never adopted.
    lab.adopt(0, during);
    assert!(matches!(lab.view().backing(&during).unwrap(), Backing::NotBacked { .. }));
}

/// RB2's follow-up, narrowed by BQ2 and BQ3 (decided 9 October 2026), as
/// rule 93 reads it now: a broken collective keeps exactly what its rules
/// before the break allowed, judged by the publication a payment names,
/// never by when it was paid. A sale under a publication the collective
/// signed before the break is kept, even received in the stretch; one under
/// a publication it signed during the stretch is no purchase and is owed
/// back, a payer's claim alone included (BQ3), unless the sale is signed
/// anew after the rollback: a receipt of the collective for the same
/// payment, never an acknowledgement adopting the stretch's.
#[test]
fn rb2_bq2_bq3_what_a_broken_collective_keeps_is_judged_by_the_publication_named() {
    use mor_core::money::{Amount, Claim, Payload as Fin, Purchase, RefundTo};
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let label = lab.col.id;
    let rail = spec("a rail Module");
    let ptr = lab.pointer(0, 1, None, &[rail]);
    lab.sign(BEN, &ptr);
    let bake = lab.publish(0);
    lab.sign(ANA, &bake);
    let (pre, pre_tag) = self_sale(&mut lab, 0, vec![agreements::Sold::Bake(bake)], 10);
    assert!(lab.view().publication(&pre).unwrap().counts, "{:?}", lab.view().publication(&pre).unwrap().problems);
    let k1 = lab.clone_terms(&f, vec![(Power::Clone, vec![ANA, BEN])], &|t| t.text = "Changed words.".into());
    let k1 = lab.propose(ANA, &k1);
    let ks = vec![lab.sign(ANA, &k1), lab.sign(BEN, &k1)];
    let rot1 = lab.rotate(Some((k1, ks)), &[0]);
    assert!(lab.view().broken(&label).unwrap().is_some(), "the clone changes no constitutional field: broken (rule 93)");
    // A publication the label signs during the stretch, and its tag.
    let (during, during_tag) = self_sale(&mut lab, 0, vec![agreements::Sold::Bake(bake)], 10);
    assert!(!lab.view().publication(&during).unwrap().counts, "a publication of the stretch never counts");
    // Under the publication signed before the break, received in the stretch: kept.
    let kept = stretch_receipt(&mut lab, 0, rail, spec("Dee the fan"), b"dee", pre_tag, f, 10);
    let got = common::stand_in_answers(lab.view()).purchase(&kept).unwrap().unwrap();
    assert!(!matches!(got.verdict, agreements::PurchaseVerdict::NoPurchase { .. }), "{got:?}");
    // Under the publication of the stretch: owed back.
    let paid = stretch_receipt(&mut lab, 0, rail, spec("Eve the fan"), b"eve", during_tag, f, 10);
    let got = common::stand_in_answers(lab.view()).purchase(&paid).unwrap().unwrap();
    assert!(matches!(got.verdict, agreements::PurchaseVerdict::NoPurchase { .. }), "{got:?}");
    assert_eq!(got.refund_to, RefundTo::Identity(spec("Eve the fan")));
    // BQ3: shown only by the payer's own claim, judged by the publication its tag names.
    let mut fan = lab.w.genesis("Fay the fan", vec![own_home()], None, None);
    let claim = |w: &mut World, fan: &mut Person, tag: Hash, proof: &[u8]| {
        let c = Fin::Claim(Claim {
            rail,
            proof: proof.to_vec(),
            payee: label,
            amount: Amount { unit: spec("a unit"), value: 10 },
            fulfils: tag,
            disagrees: None,
            referral: None,
            refund: None,
            anonymous: None,
            purchase: Some(Purchase { agreement: f, line: f }),
            previous: None,
        });
        let x = w.everyday_act(fan, mirs().money, 3, c.to_map(), None, None);
        w.add(&x)
    };
    let by_claim = claim(&mut lab.w, &mut fan, during_tag, b"fay");
    let before_claim = claim(&mut lab.w, &mut fan, pre_tag, b"fay2");
    let v = common::stand_in_answers(lab.view());
    assert!(matches!(v.purchase(&by_claim).unwrap().unwrap().verdict, agreements::PurchaseVerdict::NoPurchase { .. }));
    assert!(!matches!(v.purchase(&before_claim).unwrap().unwrap().verdict, agreements::PurchaseVerdict::NoPurchase { .. }));
    let owed: Vec<Hash> = v.owed_back(&label).unwrap().iter().map(|o| o.payment).collect();
    assert_eq!(sorted(owed), sorted(vec![paid, by_claim]));
    drop(v);
    // The rollback; Eve's payment is still owed back.
    let same = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|_| {});
    let r = lab.propose(ANA, &same);
    let rs: Vec<Hash> = [ANA, BEN, CY].iter().map(|w| lab.sign(*w, &r)).collect();
    roll_back(&mut lab, r, &rs, rot1, &[]);
    assert_eq!(lab.view().broken(&label).unwrap(), None);
    // Adopting the stretch's receipt by an acknowledgement does not sign the sale anew.
    lab.adopt(0, paid);
    assert!(common::stand_in_answers(lab.view()).owed_back(&label).unwrap().iter().any(|o| o.payment == paid));
    // A receipt for the same payment, signed after the rollback: the sale, signed anew.
    stretch_receipt(&mut lab, 0, rail, spec("Eve the fan"), b"eve", during_tag, f, 10);
    assert!(common::stand_in_answers(lab.view()).owed_back(&label).unwrap().iter().all(|o| o.payment != paid));
}

/// RB6 (decided 8 and 9 October 2026): a broken collective cannot fork or
/// close before it is fixed. A closing signed by every member during the
/// broken stretch, naming the agreement in force just before the broken
/// act, counts for nothing, then and after the rollback.
#[test]
fn rb6_a_broken_collective_cannot_close_before_the_rollback() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let label = lab.col.id;
    let (_, _, res_b, rot1) = break_by_lost_record(&mut lab);
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    let c = agreements::Closing { agreement: f, collective: label, open: vec![] };
    let eo = ending_obj(&lab, f, c.collective);
    let x = agreements_act(&mut lab.w, &mut lab.m[ANA], agreements::types::CLOSING, c.to_map(), eo);
    lab.end(ANA, &x);
    lab.end(BEN, &x);
    lab.end(CY, &x);
    let e = lab.view().closing(&x).unwrap();
    assert!(!e.complete, "a closing of a broken collective counts for nothing");
    assert_eq!(lab.view().closed_by(&label).unwrap(), None);
    // Rolled back: the stretch's closing still counts for nothing.
    let ids = lab.ids();
    let stay = vec![ids[ANA], ids[CY]];
    let auth = lab.authority.id;
    let r = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, CY])], &move |t| {
        t.parties = stay.clone();
        let g = t.grammar.as_mut().unwrap();
        g.chain_key = Holding::Shares { threshold: 2, members: stay.clone() };
        g.recovery = Some(Recovery::Escrow { authority: auth });
        for a in t.areas.as_mut().unwrap() {
            a.holders.retain(|h| stay.contains(h));
        }
    });
    let k = lab.propose(ANA, &r);
    let ks = vec![lab.sign(ANA, &k), lab.sign(CY, &k)];
    roll_back(&mut lab, k, &ks, rot1, &[res_b]);
    assert_eq!(lab.view().broken(&label).unwrap(), None);
    assert!(!lab.view().closing(&x).unwrap().complete);
    assert_eq!(lab.view().closed_by(&label).unwrap(), None);
}

/// A sale through `owners`' publication by its split service `svc` (Ana
/// drafting, Ben signing), on a push rail, its receipt naming `line` in
/// field 9: the receipt and the verifier's verdict on it, the rail's
/// answers stated.
fn push_sale(w: &mut World, ana: &mut Person, ben: &mut Person, owners: Hash, line: Hash, proof: &[u8]) -> agreements::PurchaseVerdict {
    use mor_core::money::{Amount, Payer, Payload as Fin, Purchase, Receipt};
    let mut svc = w.genesis(&format!("a split service {proof:?}"), vec![own_home()], None, None);
    let sid = svc.id;
    let pb = publish_under(w, ana, owners, sid, &mut [ben, &mut svc], &|_| {});
    let tag = common::price_tag(w, &mut svc, mirs().money, mor_core::money::Priced::Publication(pb), 5, spec("a unit"), sid);
    let push = spec("a push rail");
    let r = Fin::Receipt(Receipt { rail: push, proof: proof.to_vec(), payer: Some(Payer::Identity(spec("a fan"))), payee: sid, amount: Amount { unit: spec("a unit"), value: 5 }, fulfils: tag, previous: None, forward: None, batch: None, purchase: Some(Purchase { agreement: owners, line }) });
    let a = w.everyday_act(&mut svc, mirs().money, 2, r.to_map(), None, None);
    let x = w.add(&a);
    let mut v = common::stand_in_answers(common::stand_in_payments(AgreementsView::new(&w.v, mirs())));
    v.rails.insert(push, push_rail_spec());
    v.purchase(&x).unwrap().unwrap().verdict
}

/// F186, as rule 12 reads it now ("Acts on either branch"): while an
/// ownership agreement stands forked, the shares a payment pays are those
/// of the reference: the split service's receipt naming branch B is a
/// wrong receipt, counting for nothing; one naming the reference is a
/// purchase. (Before, a purchase following either branch counted.)
#[test]
fn a_payment_during_a_fork_pays_the_reference() {
    let mut w = World::new();
    let mut ana = w.genesis("ana the singer", vec![own_home()], None, None);
    let mut ben = w.genesis("ben the drummer", vec![own_home()], None, None);
    let work = spec("their song");
    let both = sorted(vec![ana.id, ben.id]);
    let mut d = deal_terms(both[0], both[1]);
    d.stakes = Some(vec![agreements::Stake { object: Who::Id(work), holders: vec![(Who::Id(both[0]), 500_000), (Who::Id(both[1]), 500_000)] }]);
    on_claim(&mut w, &mut ana, &mut d);
    let deal = agreements_act(&mut w, &mut ana, agreements::types::TERMS, d.to_map(), None);
    sign(&mut w, &mut ana, &deal);
    sign(&mut w, &mut ben, &deal);
    let branch = |w: &mut World, ana: &mut Person, ben: &mut Person, a: u64| {
        let mut k = d.clone();
        k.parent = Some(deal);
        k.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: both.clone() }]);
        k.stakes = Some(vec![agreements::Stake { object: Who::Id(work), holders: vec![(Who::Id(both[0]), a), (Who::Id(both[1]), 1_000_000 - a)] }]);
        let x = agreements_act(w, ana, agreements::types::TERMS, k.to_map(), obj(deal));
        sign(w, ana, &x);
        sign(w, ben, &x);
        x
    };
    let _a = branch(&mut w, &mut ana, &mut ben, 600_000);
    let b = branch(&mut w, &mut ana, &mut ben, 700_000);
    assert_eq!(view(&w).version_in_force(&deal).unwrap(), deal, "forked: the reference");
    assert!(matches!(push_sale(&mut w, &mut ana, &mut ben, deal, b, b"tx on B"), agreements::PurchaseVerdict::WrongReceipt { .. }));
    assert_eq!(push_sale(&mut w, &mut ana, &mut ben, deal, deal, b"tx on the reference"), agreements::PurchaseVerdict::Purchase);
}

/// F187 (3) and RB3, readings for clients: the resignations the parties
/// published, registered or not (during a broken stretch, from the
/// agreement in force just before the broken act), and the declarations
/// naming a party, which its client shows it.
#[test]
fn published_resignations_and_declarations_naming_a_party() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let col = lab.col.id;
    let ids = lab.ids();
    let (_, _, res_b, _) = break_by_lost_record(&mut lab);
    let mut cy = lab.m[CY].clone();
    let res_c = lab.resign_from(&mut cy, f, None);
    let v = lab.view();
    let got: Vec<(Hash, Hash)> = v.published_resignations(&col).unwrap().iter().map(|d| (d.act, d.party)).collect();
    assert_eq!(sorted(got.iter().map(|x| x.0).collect()), sorted(vec![res_b, res_c]));
    assert!(got.contains(&(res_c, ids[CY])));
    assert!(v.declarations_naming(&ids[ANA]).is_empty());
    drop(v);
    let d = lab.declare(None, f, f, ANA, vec![outcomes::VOICE_REMOVED]);
    let v = lab.view();
    let named = v.declarations_naming(&ids[ANA]);
    assert_eq!(named.len(), 1);
    assert_eq!((named[0].0, named[0].1, named[0].2.party), (d, lab.authority.id, ids[ANA]));
}

/// RB2 with BQ2, as rule 93 reads it now: a payment following a price tag
/// of a publication the collective signed during the broken stretch, paid
/// to the collective itself as its own split service, is owed back too.
#[test]
fn rb2_a_payment_to_the_collective_itself_during_the_stretch_is_owed_back() {
    use mor_core::money::{Amount, Payer, Payload as Fin, Purchase, Receipt};
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let label = lab.col.id;
    let bake = lab.publish(0);
    lab.sign(ANA, &bake);
    break_by_lost_record(&mut lab);
    let (_, tag) = self_sale(&mut lab, 0, vec![agreements::Sold::Bake(bake)], 7);
    let r = Fin::Receipt(Receipt {
        rail: spec("a rail Module"),
        proof: b"gift".to_vec(),
        payer: Some(Payer::Identity(spec("a patron"))),
        payee: label,
        amount: Amount { unit: spec("a unit"), value: 7 },
        fulfils: tag,
        previous: None,
        forward: None,
        batch: None,
        purchase: Some(Purchase { agreement: f, line: f }),
    });
    let a = lab.w.everyday_act(&mut lab.c[0], mirs().money, 2, r.to_map(), None, None);
    let x = lab.w.add(&a);
    let got = common::stand_in_answers(lab.view()).purchase(&x).unwrap().unwrap();
    assert!(matches!(got.verdict, agreements::PurchaseVerdict::NoPurchase { .. }), "{got:?}");
    let owed = common::stand_in_answers(lab.view()).owed_back(&label).unwrap();
    assert_eq!((owed.len(), owed[0].still_broken, owed[0].amount.value), (1, true, 7));
}

// ---------------------------------------------------------------- F189 and F188 (9 October 2026)

/// Ben resigns, a record registers it, and a year later Ben comes back: a
/// constitutional clone naming Ben again, signed by all three, declared by
/// a rotation (B10). Returns (Ben's old resignation, the clone of the return).
fn ben_leaves_and_returns(lab: &mut Lab) -> (Hash, Hash) {
    let f = lab.founding;
    let mut ben = lab.m[BEN].clone();
    let res_b = lab.resign_from(&mut ben, f, None);
    lab.record(0, None, &[], vec![res_b], f);
    let back = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, CY])], &|t| t.text = "Ben is back.".into());
    let back = lab.propose(ANA, &back);
    let sigs = vec![lab.sign(ANA, &back), lab.sign(BEN, &back), lab.sign(CY, &back)];
    lab.rotate(Some((back, sigs)), &[0]);
    (res_b, back)
}

/// F189 (1), decided 9 October 2026 (Fable's review, finding 1): a
/// resignation is spent once its signer comes back by signing a version
/// that names them (B10). A line registers only a resignation naming the
/// version of the member's latest return, or one descending from it: an
/// old resignation registered again, by a record or by a rollback, takes
/// nothing from a returned member.
#[test]
fn f189_1_an_old_resignation_cannot_take_a_returned_members_voice() {
    // By a record, drawn by the signing key's holder alone.
    let mut lab = Lab::new(&|_| {});
    let col = lab.col.id;
    let ids = lab.ids();
    let all = sorted(ids.clone());
    let (res_b, back) = ben_leaves_and_returns(&mut lab);
    let n = lab.view().next_voices(&col, &Power::Constitutional, &[]).unwrap().unwrap();
    assert_eq!((n.agreement, sorted(n.voices)), (back, all.clone()), "Ben counts again (B10)");
    lab.record(0, None, &[], vec![res_b], back);
    let n = lab.view().next_voices(&col, &Power::Constitutional, &[]).unwrap().unwrap();
    assert_eq!(sorted(n.voices), all, "the old resignation, registered again, takes nothing");
    assert!(
        lab.view().published_resignations(&col).unwrap().iter().all(|d| d.act != res_b),
        "a spent resignation is not shown as a resignation to come"
    );
    // A resignation Ben signs after the return counts.
    let mut ben = lab.m[BEN].clone();
    let again = lab.resign_from(&mut ben, back, None);
    lab.record(0, None, &[], vec![again], back);
    let n = lab.view().next_voices(&col, &Power::Constitutional, &[]).unwrap().unwrap();
    assert_eq!(sorted(n.voices), sorted(vec![ids[ANA], ids[CY]]));

    // By a rollback: Ana and Cy break the collective on purpose, then roll
    // back registering Ben's old resignation, signed by the two of them.
    let mut lab = Lab::new(&|_| {});
    let col = lab.col.id;
    let (res_b, back) = ben_leaves_and_returns(&mut lab);
    let k1 = lab.clone_terms(&back, vec![(Power::Clone, vec![ANA, CY])], &|t| t.text = "Broken on purpose.".into());
    let k1 = lab.propose(ANA, &k1);
    let ks = vec![lab.sign(ANA, &k1), lab.sign(CY, &k1)];
    let rot1 = lab.rotate(Some((k1, ks)), &[0]);
    assert!(lab.view().broken_act(&col).unwrap().is_some());
    assert!(
        lab.view().rollback_registers(&col, &[res_b]).unwrap().is_err(),
        "the client is told before anything is signed"
    );
    let same = lab.clone_terms(&back, vec![(Power::Constitutional, vec![ANA, CY])], &|_| {});
    let r = lab.propose(ANA, &same);
    let rs = vec![lab.sign(ANA, &r), lab.sign(CY, &r)];
    roll_back(&mut lab, r, &rs, rot1, &[res_b]);
    assert_eq!(
        lab.view().broken_act(&col).unwrap().map(|b| b.act),
        Some(rot1),
        "Ben's voice remains: the rollback needs Ben too"
    );
}

/// A deal between Ana and Ben, signed by both, for the F186 and F188 tests.
struct DealLab {
    w: World,
    ana: Person,
    ben: Person,
    t: Terms,
    d: Hash,
}

impl DealLab {
    fn new() -> DealLab {
        let mut w = World::new();
        let mut ana = w.genesis("ana", vec![own_home()], None, None);
        let mut ben = w.genesis("ben", vec![own_home()], None, None);
        let t = deal_terms(ana.id, ben.id);
        let d = agreements_act(&mut w, &mut ana, agreements::types::TERMS, t.to_map(), None);
        sign(&mut w, &mut ana, &d);
        sign(&mut w, &mut ben, &d);
        DealLab { w, ana, ben, t, d }
    }

    /// A version cloning `parent`, proposed by Ana; settling, it cites the
    /// version it settles beside its parent (F189, 6).
    fn propose(&mut self, parent: Hash, text: &str, settles: Option<Hash>) -> Hash {
        let mut c = self.t.clone();
        c.parent = Some(parent);
        c.text = text.into();
        c.settles = settles.map(|x| vec![x]);
        c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![self.ana.id, self.ben.id]) }]);
        let mut o = vec![Object { chain: parent, predecessor: parent }];
        if let Some(s) = settles {
            o.push(Object { chain: s, predecessor: s });
        }
        agreements_act(&mut self.w, &mut self.ana, agreements::types::TERMS, c.to_map(), Some(o))
    }

    /// A version cloning `parent`, proposed by Ana, naming in field 26 the
    /// tips it settles (QF3), cited in `objects` in that order, then citing
    /// the acts in `cites` (QF1).
    fn propose_full(&mut self, parent: Hash, text: &str, settles: Vec<Hash>, cites: Vec<Hash>) -> Hash {
        let mut c = self.t.clone();
        c.parent = Some(parent);
        c.text = text.into();
        let settles = sorted(settles);
        c.settles = (!settles.is_empty()).then(|| settles.clone());
        c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![self.ana.id, self.ben.id]) }]);
        let mut o = vec![Object { chain: parent, predecessor: parent }];
        o.extend(settles.iter().chain(&cites).map(|s| Object { chain: *s, predecessor: *s }));
        agreements_act(&mut self.w, &mut self.ana, agreements::types::TERMS, c.to_map(), Some(o))
    }

    /// A complete version of [`Self::propose_full`].
    fn version_full(&mut self, parent: Hash, text: &str, settles: Vec<Hash>, cites: Vec<Hash>) -> Hash {
        let k = self.propose_full(parent, text, settles, cites);
        sign(&mut self.w, &mut self.ana, &k);
        sign(&mut self.w, &mut self.ben, &k);
        k
    }

    fn tangled(&self) -> bool {
        self.in_force() == Ok(self.d) && view(&self.w).deal_fork(&self.d).unwrap().is_some_and(|f| f.tangled.is_some())
    }

    /// A complete version: proposed, signed by both.
    fn version(&mut self, parent: Hash, text: &str, settles: Option<Hash>) -> Hash {
        let k = self.propose(parent, text, settles);
        sign(&mut self.w, &mut self.ana, &k);
        sign(&mut self.w, &mut self.ben, &k);
        k
    }

    fn in_force(&self) -> Result<Hash, AgreementsError> {
        view(&self.w).version_in_force(&self.d)
    }
}

/// F189 (2), decided 9 October 2026 (Fable's review, finding 2): a version
/// is checked to be complete and to belong to the deal before it is read
/// as settling a fork, so no draft or stranger's act makes a forked deal
/// unreadable.
#[test]
fn f189_2_no_draft_or_strangers_act_makes_a_forked_deal_unreadable() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "Branch A.", None);
    let _b1 = l.version(d, "Branch B.", None);
    assert_eq!(l.in_force().unwrap(), d);
    // Ana alone signs a version of A naming in field 26 a hash nobody holds.
    let half = l.propose(a1, "Settles nothing anybody holds.", Some(spec("nothing held")));
    sign(&mut l.w, &mut l.ana, &half);
    assert_eq!(l.in_force().unwrap(), d, "a draft is nobody's version");
    assert!(view(&l.w).deal_fork(&d).unwrap().is_some());
    // A stranger's terms, whose parent nobody holds, carrying field 26.
    let mut eve = l.w.genesis("eve", vec![own_home()], None, None);
    let mut e = deal_terms(eve.id, spec("someone"));
    e.parent = Some(spec("an unheld parent"));
    e.settles = Some(vec![spec("another unheld version")]);
    e.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: vec![eve.id] }]);
    let o = vec![
        Object { chain: spec("an unheld parent"), predecessor: spec("an unheld parent") },
        Object { chain: spec("another unheld version"), predecessor: spec("another unheld version") },
    ];
    agreements_act(&mut l.w, &mut eve, agreements::types::TERMS, e.to_map(), Some(o));
    assert_eq!(l.in_force().unwrap(), d, "a stranger's act belongs to no version of this deal");
    assert!(view(&l.w).deal_fork(&d).unwrap().is_some());
}

/// F189 (4), with F188's settling version naming the tip: settlement is
/// final. A settling version made after the settlement, which names the
/// settling version itself, is growth on the discarded branch and changes
/// nothing. A plain version on the discarded branch past the tip the
/// settling version named, citing nothing, reopens nothing either (F192,
/// decided 10 October 2026, replacing QF1, under which it tangled the deal).
#[test]
fn f189_4_what_grows_on_the_discarded_branch() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "Branch A.", None);
    let b1 = l.version(d, "Branch B.", None);
    let s = l.version(a1, "Settled: A, having seen B.", Some(b1));
    assert_eq!(l.in_force().unwrap(), s);
    // Settled again from the discarded branch, naming the settlement: after it.
    let late = l.version(b1, "Settled the other way, too late.", Some(s));
    assert_eq!(l.in_force().unwrap(), s, "made after the settlement, it settles nothing");
    let s2 = l.version(s, "Life goes on.", None);
    assert_eq!(l.in_force().unwrap(), s2);
    let _ = late;
    // A plain version on the discarded branch past the tip named, citing
    // nothing: the settlement could not see it, and it reopens nothing
    // (F192; `f192_…`).
    l.version(b1, "B grows, when?", None);
    assert_eq!(l.in_force().unwrap(), s2);
}

/// F189 (5), F188 (decided 9 October 2026, "Tips are what matter on the
/// forks"): a settling version names the tip of the branch it discards;
/// one naming an older version settles nothing. Under F192 (10 October
/// 2026) "older" is what the settlement can be shown to have seen: where
/// it holds the newer version in its history, it settles nothing; where it
/// does not, the newer version is a late version, and loses (the stated
/// cost: whoever signed it, and the settlement's signers could not see it).
#[test]
fn f189_5_a_settling_version_names_the_discarded_tip() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "Branch A.", None);
    let b1 = l.version(d, "Branch B.", None);
    let b2 = l.version(b1, "B, a new price and a new payee.", None);
    let s = l.version_full(a1, "Settles B1, says Ana, citing B2.", vec![b1], vec![b2]);
    let got = l.in_force();
    assert!(got != Ok(s), "holding the newer version, naming an older one, it is never reported settled: {got:?}");
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "Branch A.", None);
    let b1 = l.version(d, "Branch B.", None);
    l.version(b1, "B, a new price and a new payee.", None);
    let s = l.version(a1, "Settles B1, as Ana and Ben saw B.", Some(b1));
    assert_eq!(l.in_force().unwrap(), s, "the newer version, not seen, loses (F192)");
}

/// F189 (6), decided 9 October 2026 (Fable's review, finding 7): a settling
/// version also cites the version it settles in `objects`, beside its
/// parent, so that verifiers fetching by citation find it. One that does
/// not is invalid.
#[test]
fn f189_6_a_settling_version_cites_the_version_it_settles() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "Branch A.", None);
    let b1 = l.version(d, "Branch B.", None);
    let mut c = l.t.clone();
    c.parent = Some(a1);
    c.text = "Settled, citing only its parent.".into();
    c.settles = Some(vec![b1]);
    c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![l.ana.id, l.ben.id]) }]);
    let k = agreements_act(&mut l.w, &mut l.ana, agreements::types::TERMS, c.to_map(), obj(a1));
    sign(&mut l.w, &mut l.ana, &k);
    sign(&mut l.w, &mut l.ben, &k);
    assert!(view(&l.w).terms(&k).is_err(), "it does not cite the version it settles");
    assert_eq!(l.in_force().unwrap(), d);
    let s = l.version(a1, "Settled, citing both.", Some(b1));
    assert_eq!(l.in_force().unwrap(), s);
}

/// F188, DQ1 to DQ4 (decided 9 October 2026, "Yes"): when a deal's fork
/// turns tangled (three complete versions of one version, a branch that
/// splits again, two competing settling versions, a settling version that
/// splits its own branch again), the deal stays on its last agreed
/// version, the reference, until one clean settlement; the parties lose
/// the changes the tangled versions made.
#[test]
fn f188_dq1_to_dq4_a_tangled_fork_stays_on_the_reference() {
    let tangled = |l: &DealLab| {
        assert_eq!(l.in_force().unwrap(), l.d, "the reference");
        let f = view(&l.w).deal_fork(&l.d).unwrap().expect("shown forked");
        assert!(f.tangled.is_some(), "and tangled");
    };
    // DQ2: three complete versions of one version.
    let mut l = DealLab::new();
    let d = l.d;
    for x in ["One.", "Two.", "Three."] {
        l.version(d, x, None);
    }
    tangled(&l);
    // DQ1: a branch that splits again before the settlement.
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    l.version(d, "B.", None);
    l.version(a1, "A, one way.", None);
    l.version(a1, "A, the other way.", None);
    tangled(&l);
    // DQ3: two settling versions, one on each branch, each naming the other's tip.
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    l.version(a1, "Settled for A.", Some(b1));
    l.version(b1, "Settled for B.", Some(a1));
    tangled(&l);
    // DQ4: a settling version made from below its branch's latest
    // version, which it holds (F192: what it could see): it settles
    // nothing, and its branch splits again.
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let a2 = l.version(a1, "A grows.", None);
    l.version_full(a1, "Settled from below, having seen A grow.", vec![b1], vec![a2]);
    tangled(&l);
    // Not holding it, it could not see it: A's later version loses (F192).
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    l.version(a1, "A grows.", None);
    let s = l.version(a1, "Settled from below.", Some(b1));
    assert_eq!(l.in_force().unwrap(), s);
}

/// F188, DQ1 to DQ4, as rule 12 reads it now: a tangled fork leaves the
/// ownership agreement on its reference, and the payment pays the
/// reference's shares: a receipt naming a tangled version is a wrong
/// receipt; one naming the reference is a purchase.
#[test]
fn f188_a_buyer_under_a_tangled_version_pays_the_reference() {
    let mut l = DealLab::new();
    let work = spec("their song");
    let (a, b) = (l.ana.id, l.ben.id);
    let both = sorted(vec![a, b]);
    l.t.stakes = Some(vec![agreements::Stake { object: Who::Id(work), holders: vec![(Who::Id(both[0]), 500_000), (Who::Id(both[1]), 500_000)] }]);
    let mut ana = l.ana.clone();
    on_claim(&mut l.w, &mut ana, &mut l.t);
    l.ana = ana;
    let mut t = l.t.clone();
    let d = agreements_act(&mut l.w, &mut l.ana, agreements::types::TERMS, t.to_map(), None);
    sign(&mut l.w, &mut l.ana, &d);
    sign(&mut l.w, &mut l.ben, &d);
    l.d = d;
    let mut tangled = vec![];
    for (x, share) in [("One.", 600_000), ("Two.", 700_000), ("Three.", 800_000)] {
        t.stakes = Some(vec![agreements::Stake { object: Who::Id(work), holders: vec![(Who::Id(both[0]), share), (Who::Id(both[1]), 1_000_000 - share)] }]);
        l.t = t.clone();
        tangled.push(l.version(d, x, None));
    }
    assert_eq!(view(&l.w).version_in_force(&d).unwrap(), d, "tangled: the reference");
    let (mut ana, mut ben) = (l.ana.clone(), l.ben.clone());
    assert!(matches!(push_sale(&mut l.w, &mut ana, &mut ben, d, tangled[1], b"tx on two"), agreements::PurchaseVerdict::WrongReceipt { .. }));
    assert_eq!(push_sale(&mut l.w, &mut ana, &mut ben, d, d, b"tx on the reference"), agreements::PurchaseVerdict::Purchase);
}

/// F188, DQ5 (decided 9 October 2026, "Yes, Carla needs to sign either
/// way"): a version that settles a deal's fork must be signed by the
/// parties of both branches, so no one on the discarded side is dropped
/// without consent.
#[test]
fn f188_dq5_the_parties_of_both_branches_sign_the_settlement() {
    let mut l = DealLab::new();
    let d = l.d;
    let mut carla = l.w.genesis("carla", vec![own_home()], None, None);
    let a1 = l.version(d, "A.", None);
    // Branch B adds Carla, who signs it.
    let mut c = l.t.clone();
    c.parent = Some(d);
    c.text = "B, with Carla.".into();
    c.parties = vec![l.ana.id, l.ben.id, carla.id];
    c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![l.ana.id, l.ben.id]) }]);
    let b1 = agreements_act(&mut l.w, &mut l.ana, agreements::types::TERMS, c.to_map(), obj(d));
    sign(&mut l.w, &mut l.ana, &b1);
    sign(&mut l.w, &mut l.ben, &b1);
    sign(&mut l.w, &mut carla, &b1);
    assert_eq!(l.in_force().unwrap(), d, "forked");
    let s = l.version(a1, "Settled for A, without Carla.", Some(b1));
    assert_eq!(l.in_force().unwrap(), d, "Carla has not signed the version that drops her branch");
    sign(&mut l.w, &mut carla, &s);
    assert_eq!(l.in_force().unwrap(), s);
}

/// F189 (3), decided 9 October 2026 (Fable's review, finding 3): a payment
/// naming a version the seller does not hold raises the alarm: an unknown
/// version is the hidden fork the alarm exists for. And F188, DQ7: a
/// payment naming an older version of the same line, with no fork, raises
/// a plain notice; the alarm is kept for forks.
#[test]
fn f189_3_a_payment_naming_a_version_the_seller_does_not_hold_raises_the_alarm() {
    use mor_core::money::{Amount, Claim, Payload as Fin, Purchase};
    let mut l = DealLab::new();
    let d = l.d;
    let mut fan = l.w.genesis("a fan", vec![own_home()], None, None);
    let a = l.version(d, "3A: the price is 100.", None);
    let ana = l.ana.id;
    let pay = |w: &mut World, fan: &mut Person, line: Hash, proof: &[u8]| {
        let c = Fin::Claim(Claim {
            rail: spec("a rail Module"),
            proof: proof.to_vec(),
            payee: ana,
            amount: Amount { unit: spec("a unit"), value: 120 },
            fulfils: spec("a publication"),
            disagrees: None,
            referral: None,
            refund: None,
            anonymous: None,
            purchase: Some(Purchase { agreement: d, line }),
            previous: None,
        });
        let x = w.everyday_act(fan, mirs().money, 3, c.to_map(), None, None);
        w.add(&x)
    };
    // 3B, signed by both from Ben's device, never reached Ana's relays.
    let hidden = spec("3B, held nowhere Ana looks");
    let under_hidden = pay(&mut l.w, &mut fan, hidden, b"b");
    let alarm = view(&l.w).fork_alarm(&under_hidden, &a).unwrap().expect("an unknown version: the alarm");
    assert_eq!((alarm.named, alarm.held, alarm.kind), (hidden, a, agreements::AlarmKind::Unheld));
    let under_d = pay(&mut l.w, &mut fan, d, b"d");
    let notice = view(&l.w).fork_alarm(&under_d, &a).unwrap().expect("an older version: a notice");
    assert_eq!(notice.kind, agreements::AlarmKind::Older);
    assert!(!notice.kind.is_alarm(), "the alarm is kept for forks");
    let b = l.version(d, "3B: the price is 120.", None);
    let under_b = pay(&mut l.w, &mut fan, b, b"bb");
    let alarm = view(&l.w).fork_alarm(&under_b, &a).unwrap().unwrap();
    assert_eq!(alarm.kind, agreements::AlarmKind::Fork);
    assert!(alarm.kind.is_alarm());
}

/// F189 (7), decided 9 October 2026 ("It's an emergency situation with
/// emergency rules"): while a collective is broken, no fork or closing
/// counts, whatever line it names, the last good link before the broken
/// act included (Fable's review, finding 5).
#[test]
fn f189_7_no_closing_counts_while_broken_whatever_its_line() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let label = lab.col.id;
    // The last good link, and the collective's tips there.
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    let good = lab.line(&[0]);
    break_by_lost_record(&mut lab);
    assert!(lab.view().broken(&label).unwrap().is_some());
    let c = agreements::Closing { agreement: f, collective: label, open: vec![] };
    let eo = ending_obj_at(&lab, f, label, good);
    let x = agreements_act(&mut lab.w, &mut lab.m[ANA], agreements::types::CLOSING, c.to_map(), eo);
    lab.end(ANA, &x);
    lab.end(BEN, &x);
    lab.end(CY, &x);
    let v = lab.view();
    let e = v.closing(&x).unwrap();
    assert!(!e.complete, "a closing on the line before the broken act counts for nothing while broken: {:?}", e.why);
    assert_eq!(v.closed_by(&label).unwrap(), None);
}

/// F189 (7): money owed back from the broken stretch counts as a debt for
/// a closing's "owes nothing", so a collective cannot close until those
/// payers are settled.
#[test]
fn f189_7_money_owed_back_from_the_stretch_is_a_debt_before_closing() {
    use mor_core::money::{Amount, Payer, Payload as Fin, Purchase, Receipt};
    let mut lab = Lab::new(&|_| {});
    let label = lab.col.id;
    let bake = lab.publish(0);
    lab.sign(ANA, &bake);
    let (_, _, _, rot1) = break_by_lost_record(&mut lab);
    let f = lab.founding;
    // A patron pays a tag of a publication of the broken stretch: owed back (rule 93).
    let (_, tag) = self_sale(&mut lab, 0, vec![agreements::Sold::Bake(bake)], 7);
    let r = Fin::Receipt(Receipt {
        rail: spec("a rail Module"),
        proof: b"gift".to_vec(),
        payer: Some(Payer::Identity(spec("a patron"))),
        payee: label,
        amount: Amount { unit: spec("a unit"), value: 7 },
        fulfils: tag,
        previous: None,
        forward: None,
        batch: None,
        purchase: Some(Purchase { agreement: f, line: f }),
    });
    let a = lab.w.everyday_act(&mut lab.c[0], mirs().money, 2, r.to_map(), None, None);
    lab.w.add(&a);
    assert_eq!(common::stand_in_answers(lab.view()).owed_back(&label).unwrap().len(), 1);
    // The rollback; then every member closes.
    let same = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|_| {});
    let r = lab.propose(ANA, &same);
    let rs: Vec<Hash> = [ANA, BEN, CY].iter().map(|w| lab.sign(*w, &r)).collect();
    roll_back(&mut lab, r, &rs, rot1, &[]);
    assert_eq!(lab.view().broken(&label).unwrap(), None);
    let c = agreements::Closing { agreement: r, collective: label, open: vec![] };
    let eo = ending_obj(&lab, r, label);
    let x = agreements_act(&mut lab.w, &mut lab.m[ANA], agreements::types::CLOSING, c.to_map(), eo);
    lab.end(ANA, &x);
    lab.end(BEN, &x);
    lab.end(CY, &x);
    let e = lab.view().closing(&x).unwrap();
    assert!(!e.complete, "the patron is still owed: {:?}", e.why);
    assert!(e.why.iter().any(|w| w.contains("owed back")), "{:?}", e.why);
}

/// F189 (8), decided 9 October 2026, in essence: a declaration of absence
/// counts only if it is public, or addressed (sealed) to the member it
/// names, among others if wished; one that is neither counts for nothing,
/// so no line or rollback can register it.
#[test]
fn f189_8_a_declaration_counts_only_if_public_or_addressed_to_the_member() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let col = lab.col.id;
    let ids = lab.ids();
    let d = AbsenceDeclaration { agreement: f, clause: f, party: ids[CY], outcomes: vec![outcomes::VOICE_REMOVED] };
    // Sealed to Ana and Ben only.
    let mut a = lab.authority.clone();
    let hidden = lab.w.private_act(&mut a, mirs().agreements, agreements::types::DECLARATION, d.to_map(), obj(f), vec![ids[ANA], ids[BEN]]);
    lab.authority = a;
    assert!(lab.view().declaration(&hidden).unwrap().is_err(), "kept from the member it names, it counts for nothing");
    lab.record(0, None, &[], vec![hidden], f);
    let n = lab.view().next_voices(&col, &Power::Constitutional, &[]).unwrap().unwrap();
    assert!(n.voices.contains(&ids[CY]), "no line registers it");
    // Sealed to Cy too: it counts.
    let mut a = lab.authority.clone();
    let shown = lab.w.private_act(&mut a, mirs().agreements, agreements::types::DECLARATION, d.to_map(), obj(f), vec![ids[ANA], ids[CY]]);
    lab.authority = a;
    assert!(lab.view().declaration(&shown).unwrap().is_ok());
    lab.record(0, None, &[], vec![shown], f);
    let n = lab.view().next_voices(&col, &Power::Constitutional, &[]).unwrap().unwrap();
    assert!(!n.voices.contains(&ids[CY]));
}

/// F188, BQ1 (decided 9 October 2026, "Yes, everyone have to acknowledge
/// the rollback. Safer."): after a rollback, a grantee's act counts only
/// once it cites the rollback or a later decision of the collective; one
/// citing nothing newer than the time before the break, including one made
/// just before the break that no act of the collective took in, counts for
/// nothing and is signed again.
#[test]
fn bq1_after_a_rollback_a_grantees_act_counts_once_it_cites_the_rollback() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let col = lab.col.id;
    let env = mirs().envelopes;
    let mut agent = lab.w.genesis("an agent", vec![own_home()], None, None);
    let grant = Grant { area: Some(1), kinds: Some(vec![Kind::Type { spec: env, type_: 0 }]), ..plain_grant(agent.id) };
    let g = lab.grant(&grant);
    lab.sign(ANA, &g);
    sign(&mut lab.w, &mut agent, &g);
    let mut st = lab.strand(g, &agent);
    let act = |lab: &mut Lab, st: &mut Person| -> Hash {
        let a = lab.w.everyday_act(st, env, 0, publication(vec![]), None, None);
        lab.w.add(&a)
    };
    // Made just before the break; no act of the collective takes it in.
    let unseen = act(&mut lab, &mut st);
    let k1 = lab.clone_terms(&f, vec![(Power::Clone, vec![ANA, BEN])], &|t| t.text = "Changed words.".into());
    let k1 = lab.propose(ANA, &k1);
    let ks = vec![lab.sign(ANA, &k1), lab.sign(BEN, &k1)];
    let rot1 = lab.rotate(Some((k1, ks)), &[0]);
    let same = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|_| {});
    let r = lab.propose(ANA, &same);
    let rs: Vec<Hash> = [ANA, BEN, CY].iter().map(|w| lab.sign(*w, &r)).collect();
    let back = roll_back(&mut lab, r, &rs, rot1, &[]);
    assert_eq!(lab.view().broken(&col).unwrap(), None);
    // Draft 17, rule 93 (stated cost): "an act that cites only decisions
    // before the break is judged under the rules before it, even where it
    // was made during the stretch or after the rollback". Made just before
    // the break, or after the rollback citing nothing newer: backed, under
    // the rules before the break.
    assert_eq!(lab.view().backing(&unseen).unwrap(), Backing::Backed { grant: g }, "made just before the break, judged as before it");
    let stale = act(&mut lab, &mut st);
    assert_eq!(lab.view().backing(&stale).unwrap(), Backing::Backed { grant: g });
    // Citing the rollback: it counts.
    st.cite.as_mut().unwrap().1.push(back);
    let fresh = act(&mut lab, &mut st);
    assert_eq!(lab.view().backing(&fresh).unwrap(), Backing::Backed { grant: g });
}

/// F188, BQ4 (decided 9 October 2026): the contest act's format (Agreements type
/// 14). It names the declaration it answers and is signed by the party
/// declared absent, which shows presence; it shows the dispute and voids
/// nothing (rule 52).
#[test]
fn bq4_a_contest_names_the_declaration_and_is_signed_by_the_party_named() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let col = lab.col.id;
    let ids = lab.ids();
    let d = lab.declare(None, f, f, CY, vec![outcomes::VOICE_REMOVED]);
    lab.record(0, None, &[], vec![d], f);
    let c = agreements::Contest::of_declaration(d);
    let mut cy = lab.m[CY].clone();
    let x = agreements_act(&mut lab.w, &mut cy, agreements::types::CONTEST, c.to_map(), obj(d));
    // Someone else's "contest" of it shows nothing.
    let mut ben = lab.m[BEN].clone();
    let y = agreements_act(&mut lab.w, &mut ben, agreements::types::CONTEST, c.to_map(), obj(d));
    let v = lab.view();
    assert_eq!(v.contests(&d).unwrap(), vec![x]);
    let _ = y;
    // It voids nothing: Cy's voice stays removed.
    let n = v.next_voices(&col, &Power::Constitutional, &[]).unwrap().unwrap();
    assert!(!n.voices.contains(&ids[CY]));
    // Its objects name the declaration, as chain and predecessor.
    let mut cy2 = lab.m[CY].clone();
    drop(v);
    let bad = agreements_act(&mut lab.w, &mut cy2, agreements::types::CONTEST, c.to_map(), obj(f));
    assert!(!lab.view().contests(&d).unwrap().contains(&bad));
}

/// F188, DQ8 (decided 9 October 2026): where the parties cannot agree, the
/// arbitrator the deal's reference version names may settle the fork,
/// only once activated by one of the signing parties, by a signed request
/// naming the fork, which its settlement names: never on its own
/// initiative. With no arbitrator named, the deal stays on its reference.
#[test]
fn f188_dq8_the_arbitrator_settles_a_fork_only_on_a_partys_request() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut arb = w.genesis("an arbitrator", vec![own_home()], None, None);
    let mut eve = w.genesis("eve", vec![own_home()], None, None);
    let mut t = deal_terms(ana.id, ben.id);
    t.arbitrators = Some(vec![arb.id]);
    t.fork_judge = Some(arb.id);
    let d = agreements_act(&mut w, &mut ana, agreements::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut ana, &d);
    sign(&mut w, &mut ben, &d);
    let mut l = DealLab { w, ana, ben, t, d };
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let settle = |w: &mut World, arb: &mut Person, request: Hash| {
        let s = agreements::ForkSettlement { request, kept: a1, discarded: vec![b1] };
        agreements_act(w, arb, agreements::types::FORK_SETTLEMENT, s.to_map(), obj(request))
    };
    let ask = |w: &mut World, who: &mut Person| {
        let r = agreements::SettlementRequest { reference: d };
        agreements_act(w, who, agreements::types::SETTLEMENT_REQUEST, r.to_map(), obj(d))
    };
    // Never on its own initiative: a settlement naming a request nobody made.
    settle(&mut l.w, &mut arb, spec("no request"));
    assert_eq!(l.in_force().unwrap(), d);
    // A request by someone who signed nothing activates nothing.
    let by_eve = ask(&mut l.w, &mut eve);
    settle(&mut l.w, &mut arb, by_eve);
    assert_eq!(l.in_force().unwrap(), d);
    // Ben asks; the arbitrator keeps A.
    let by_ben = ask(&mut l.w, &mut l.ben);
    let s = settle(&mut l.w, &mut arb, by_ben);
    assert_eq!(l.in_force().unwrap(), a1, "settled by the arbitrator, on Ben's request");
    // Only the arbitrator the reference names settles.
    let mut l2 = DealLab::new();
    let d2 = l2.d;
    l2.version(d2, "A.", None);
    l2.version(d2, "B.", None);
    let _ = s;
    let req = {
        let r = agreements::SettlementRequest { reference: d2 };
        agreements_act(&mut l2.w, &mut l2.ana, agreements::types::SETTLEMENT_REQUEST, r.to_map(), obj(d2))
    };
    let mut other = l2.w.genesis("not the arbitrator", vec![own_home()], None, None);
    let kids = view(&l2.w).deal_fork(&d2).unwrap().unwrap().branches;
    let s2 = agreements::ForkSettlement { request: req, kept: kids[0][0], discarded: vec![kids[1][0]] };
    agreements_act(&mut l2.w, &mut other, agreements::types::FORK_SETTLEMENT, s2.to_map(), obj(req));
    assert_eq!(l2.in_force().unwrap(), d2);
}

/// F188, DQ6 (decided 9 October 2026, "Yes"), as the publication carries
/// it: a single numbering runs across every split the service makes under
/// one publication, whichever version of the ownership agreement the
/// payments name, each split showing its number; a holder's client raises
/// the alarm where the numbers on the splits it receives skip: splits are
/// then being made where it is not shown.
#[test]
fn f188_dq6_one_numbering_across_a_deals_splits_shows_a_hidden_branch() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let mut svc = l.w.genesis("a split service", vec![own_home()], None, None);
    let svc_id = svc.id;
    let ana = l.ana.id;
    // The splits name the publication by its first version (a hash here:
    // the numbering reads the splits alone).
    let pb = spec("the deal's publication");
    let mut split = |l: &mut DealLab, branch: Hash, number: Option<u64>| {
        let s = agreements::Split {
            receipt: spec(&format!("a receipt {number:?} {branch:?}")),
            payouts: vec![line_payout(ana, 1, d)],
            cmip: spec("a split cMIP"),
            publication: pb,
            tally: None,
            number, ..Default::default() };
        agreements_act(&mut l.w, &mut svc, agreements::types::SPLIT, s.to_map(), None)
    };
    split(&mut l, a1, Some(1));
    split(&mut l, a1, Some(2));
    // Number 3, paid under branch B, never reaches the holder who sees A only.
    split(&mut l, a1, Some(4));
    let n = view(&l.w).split_numbers(&svc_id, &pb).unwrap();
    assert_eq!(n.gaps, vec![3], "the alarm: a split numbered 3 was made where this holder is not shown");
    // Delivered after all: one numbering across both branches.
    split(&mut l, b1, Some(3));
    let n = view(&l.w).split_numbers(&svc_id, &pb).unwrap();
    assert!(n.gaps.is_empty());
    assert_eq!(n.numbers.iter().map(|x| x.0).collect::<Vec<_>>(), vec![1, 2, 3, 4]);
    split(&mut l, a1, Some(4));
    split(&mut l, b1, None);
    let n = view(&l.w).split_numbers(&svc_id, &pb).unwrap();
    assert_eq!((n.repeated, n.unnumbered.len()), (vec![4], 1));
    // A number counts from 1.
    let mut s = agreements::Split { receipt: spec("r"), payouts: vec![], cmip: spec("c"), publication: pb, tally: None, number: Some(0), ..Default::default() };
    s.payouts.push(line_payout(ana, 1, d));
    assert!(agreements::Split::decode(&s.to_map()).is_err());
}

/// QF1 (F190), replaced by F192 (decided 10 October 2026, "Yes agreed"): a
/// complete version on a discarded branch, beyond the tip the settlement
/// named and not citing the settlement, reopens nothing (under QF1 it made
/// the deal tangled). A version that cites the settlement is plainly after
/// it and changes nothing, and so is every version after that one.
#[test]
fn f192_replaces_qf1_a_version_beyond_the_settled_tip() {
    // Not citing the settlement: the settlement could not see it.
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "Branch A.", None);
    let b1 = l.version(d, "Branch B.", None);
    let s = l.version(a1, "Settled: A, having seen B.", Some(b1));
    assert_eq!(l.in_force().unwrap(), s);
    l.version(b1, "B grows, when?", None);
    assert_eq!(l.in_force().unwrap(), s, "beyond the tip named, citing nothing: it reopens nothing (F192)");

    // Citing the settlement: plainly after it, nothing changes.
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "Branch A.", None);
    let b1 = l.version(d, "Branch B.", None);
    let s = l.version(a1, "Settled: A, having seen B.", Some(b1));
    let b2 = l.version_full(b1, "B grows, after the settlement.", vec![], vec![s]);
    assert_eq!(l.in_force().unwrap(), s, "a version citing the settlement changes nothing");
    l.version(b2, "B grows again, after that one.", None);
    assert_eq!(l.in_force().unwrap(), s, "nor does a version after one citing it");
    // A settling version naming the settlement cites it, as F189 (6) asks.
    l.version(b1, "Settled the other way, too late.", Some(s));
    assert_eq!(l.in_force().unwrap(), s, "settlement is final (A3)");
    let s2 = l.version(s, "Life goes on.", None);
    assert_eq!(l.in_force().unwrap(), s2);
}

/// QF3, decided by Nobody, allegedly, 9 October 2026 ("Yes, expand to
/// multiple tips as needed"; F190): a settling version names every tip it
/// discards (field 26, a list), and is signed by the parties of all the
/// branches involved, so a tangled deal settles cleanly: everyone sees
/// every option, everyone signs the choice.
#[test]
fn f190_qf3_a_tangled_deal_settles_cleanly() {
    // DQ2: three complete versions of one version.
    let mut l = DealLab::new();
    let d = l.d;
    let x = l.version(d, "One.", None);
    let y = l.version(d, "Two.", None);
    let z = l.version(d, "Three.", None);
    assert!(l.tangled());
    // F192: a settlement naming one of the two other tips, not holding the
    // third, settles what it saw; Three, which it could not see, loses.
    let partial = l.version_full(x, "Settles Two only.", vec![y], vec![]);
    assert_eq!(l.in_force().unwrap(), partial);
    let s = l.version_full(partial, "One, having seen Two and Three.", vec![z], vec![]);
    assert_eq!(l.in_force().unwrap(), s, "a version on the line in force");
    // Holding the third and not naming it, it settles nothing.
    let mut l = DealLab::new();
    let d = l.d;
    let x = l.version(d, "One.", None);
    let y = l.version(d, "Two.", None);
    let z = l.version(d, "Three.", None);
    l.version_full(x, "Settles Two only, citing Three.", vec![y], vec![z]);
    assert!(l.tangled(), "it saw Three and dropped it unnamed");
    let mut l = DealLab::new();
    let d = l.d;
    let x = l.version(d, "One.", None);
    let y = l.version(d, "Two.", None);
    let z = l.version(d, "Three.", None);
    let s = l.version_full(x, "One, having seen Two and Three.", vec![y, z], vec![]);
    assert_eq!(l.in_force().unwrap(), s, "every tip named: settled");

    // DQ1: a branch that splits again.
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let a2 = l.version(a1, "A, one way.", None);
    let a3 = l.version(a1, "A, the other way.", None);
    assert!(l.tangled());
    let s = l.version_full(a2, "A one way, having seen the rest.", vec![a3, b1], vec![]);
    assert_eq!(l.in_force().unwrap(), s);

    // DQ3: two settlements, each naming the other's tip; a third names them.
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let s1 = l.version(a1, "Settled for A.", Some(b1));
    let s2 = l.version(b1, "Settled for B.", Some(a1));
    assert!(l.tangled());
    let s3 = l.version_full(s1, "For A, having seen both settlements.", vec![s2], vec![]);
    assert_eq!(l.in_force().unwrap(), s3);

    // DQ4: a settling version made from below its branch's latest
    // version, holding it: it settles nothing, and A splits again (DQ1); a
    // settlement naming every tip settles it.
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let a2 = l.version(a1, "A grows.", None);
    let s0 = l.version_full(a1, "Settled from below, having seen A grow.", vec![b1], vec![a2]);
    assert!(l.tangled());
    let s = l.version_full(a2, "A grown, having seen it all.", vec![b1, s0], vec![]);
    assert_eq!(l.in_force().unwrap(), s);

    // What QF1 tangled no longer tangles (F192): B grows unaware, and
    // nothing reopens; a later version on the line in force may name it.
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let s = l.version(a1, "Settled for A.", Some(b1));
    let b2 = l.version(b1, "B grows, unaware.", None);
    assert_eq!(l.in_force().unwrap(), s);
    let s4 = l.version_full(s, "Still A, having seen B grow.", vec![b2], vec![]);
    assert_eq!(l.in_force().unwrap(), s4);

    // Field 26 is ascending, none twice.
    let mut l = DealLab::new();
    let d = l.d;
    let x = l.version(d, "One.", None);
    let y = l.version(d, "Two.", None);
    let z = l.version(d, "Three.", None);
    let mut both = sorted(vec![y, z]);
    both.reverse();
    let mut c = l.t.clone();
    c.parent = Some(x);
    c.settles = Some(both.clone());
    c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![l.ana.id, l.ben.id]) }]);
    assert!(c.check(&mirs()).is_err(), "descending tips are refused");
    c.settles = Some(vec![y, y]);
    assert!(c.check(&mirs()).is_err(), "a tip twice is refused");
}

/// QF3 with DQ5: the parties of every tip discarded sign the settlement.
#[test]
fn f190_qf3_the_parties_of_every_branch_sign() {
    let mut l = DealLab::new();
    let d = l.d;
    let mut carla = l.w.genesis("carla", vec![own_home()], None, None);
    let x = l.version(d, "One.", None);
    let y = l.version(d, "Two.", None);
    let mut c = l.t.clone();
    c.parent = Some(d);
    c.text = "Three, with Carla.".into();
    c.parties = vec![l.ana.id, l.ben.id, carla.id];
    c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![l.ana.id, l.ben.id]) }]);
    let z = agreements_act(&mut l.w, &mut l.ana, agreements::types::TERMS, c.to_map(), obj(d));
    sign(&mut l.w, &mut l.ana, &z);
    sign(&mut l.w, &mut l.ben, &z);
    sign(&mut l.w, &mut carla, &z);
    assert!(l.tangled());
    let s = l.version_full(x, "One, without Carla's word.", vec![y, z], vec![]);
    assert!(l.tangled(), "Carla has not signed the version that drops her branch");
    sign(&mut l.w, &mut carla, &s);
    assert_eq!(l.in_force().unwrap(), s);
}

/// QF2, decided by Nobody, allegedly, 9 October 2026 ("Yes"; F190): the
/// deal's reference version names which of its judges settles forks (terms
/// field 27, one identity of field 13); where that is unclear, none does,
/// and the deal waits on its reference. With QF3, the judge's settlement
/// names every tip it discards.
#[test]
fn f190_qf2_the_reference_names_the_judge_of_forks() {
    let lab = |judge: bool, arbitrators: usize| {
        let mut w = World::new();
        let mut ana = w.genesis("ana", vec![own_home()], None, None);
        let mut ben = w.genesis("ben", vec![own_home()], None, None);
        let arbs: Vec<Person> = (0..arbitrators).map(|i| w.genesis(&format!("arbitrator {i}"), vec![own_home()], None, None)).collect();
        let mut t = deal_terms(ana.id, ben.id);
        t.arbitrators = Some(arbs.iter().map(|a| a.id).collect());
        if judge {
            t.fork_judge = arbs.last().map(|a| a.id);
        }
        let d = agreements_act(&mut w, &mut ana, agreements::types::TERMS, t.to_map(), None);
        sign(&mut w, &mut ana, &d);
        sign(&mut w, &mut ben, &d);
        (DealLab { w, ana, ben, t, d }, arbs)
    };
    let ask = |l: &mut DealLab| {
        let r = agreements::SettlementRequest { reference: l.d };
        agreements_act(&mut l.w, &mut l.ben, agreements::types::SETTLEMENT_REQUEST, r.to_map(), obj(l.d))
    };
    let settle = |l: &mut DealLab, arb: &mut Person, request: Hash, kept: Hash, discarded: Vec<Hash>| {
        let s = agreements::ForkSettlement { request, kept, discarded: sorted(discarded) };
        agreements_act(&mut l.w, arb, agreements::types::FORK_SETTLEMENT, s.to_map(), obj(request))
    };
    // One arbitrator, but the reference does not say it judges forks: none does.
    let (mut l, mut arbs) = lab(false, 1);
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let r = ask(&mut l);
    settle(&mut l, &mut arbs[0], r, a1, vec![b1]);
    assert_eq!(l.in_force().unwrap(), d, "unclear which judge settles forks: none does (QF2)");
    // Two arbitrators; the reference names the second as the judge of forks.
    let (mut l, mut arbs) = lab(true, 2);
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let r = ask(&mut l);
    settle(&mut l, &mut arbs[0], r, a1, vec![b1]);
    assert_eq!(l.in_force().unwrap(), d, "the other arbitrator settles nothing");
    let (first, second) = arbs.split_at_mut(1);
    let _ = first;
    settle(&mut l, &mut second[0], r, a1, vec![b1]);
    assert_eq!(l.in_force().unwrap(), a1, "the judge of forks the reference names settles");
    // A tangled deal: the judge names every tip it discards (QF3).
    let (mut l, mut arbs) = lab(true, 1);
    let d = l.d;
    let x = l.version(d, "One.", None);
    let y = l.version(d, "Two.", None);
    let z = l.version(d, "Three.", None);
    let r = ask(&mut l);
    settle(&mut l, &mut arbs[0], r, x, vec![y, z]);
    assert_eq!(l.in_force().unwrap(), x, "every tip named");
    // F192: a judge's settlement naming one of two other tips settles what
    // it saw; the third, which it did not see (made after the request),
    // loses.
    let (mut l, mut arbs) = lab(true, 1);
    let d = l.d;
    let x = l.version(d, "One.", None);
    let y = l.version(d, "Two.", None);
    let r = ask(&mut l);
    l.version(d, "Three.", None);
    settle(&mut l, &mut arbs[0], r, x, vec![y]);
    assert_eq!(l.in_force().unwrap(), x, "Three, not seen, reopens nothing (F192)");
    // S7e question 2: the request it cites, with its history, is seen too.
    // The requester signed Three before asking: a settlement leaving it
    // unnamed settles nothing.
    let (mut l, mut arbs) = lab(true, 1);
    let d = l.d;
    let x = l.version(d, "One.", None);
    let y = l.version(d, "Two.", None);
    l.version(d, "Three.", None);
    let r = ask(&mut l);
    settle(&mut l, &mut arbs[0], r, x, vec![y]);
    assert_eq!(l.in_force().unwrap(), d, "Three, in the request's history, unnamed: nothing settled");
    // Field 27 names one of field 13, in a deal only.
    let mut t = deal_terms(spec("p"), spec("q"));
    t.arbitrators = Some(vec![spec("an arbitrator")]);
    t.fork_judge = Some(spec("someone else"));
    assert!(t.check(&mirs()).is_err(), "the judge of forks is one of the deal's arbitrators or verifiers");
    t.fork_judge = Some(spec("an arbitrator"));
    assert!(t.check(&mirs()).is_ok());
    let c = label_terms(&[spec("p"), spec("q"), spec("r")], spec("an authority"), spec("a keeper"), &|t| {
        t.arbitrators = Some(vec![spec("an arbitrator")]);
        t.fork_judge = Some(spec("an arbitrator"));
    });
    assert!(c.check(&mirs()).is_err(), "a collective's forks are settled by its records");
}

/// QF4, decided by Nobody, allegedly, 9 October 2026 ("Yes"; F190): a
/// split with no number, or with a number another split of the same
/// service under the publication carries, is a deviation that breaks the
/// plan, as a reset of the tally chain does (F171). A gap is the holder's
/// alarm, not a deviation: the missing split may simply not have reached
/// this holder.
#[test]
fn f190_qf4_a_missing_or_repeated_number_breaks_the_plan() {
    let mut w = World::new();
    let mut ana_p = w.genesis("ana", vec![own_home()], None, None);
    let mut ben_p = w.genesis("ben", vec![own_home()], None, None);
    let mut svc = w.genesis("a split service", vec![own_home()], None, None);
    let d = owners_of(&mut w, &mut ana_p, &mut ben_p, spec("a numbered song"));
    let pb = publish_under(&mut w, &mut ana_p, d, svc.id, &mut [&mut ben_p, &mut svc], &|_| {});
    let mut l = DealLab { w, ana: ana_p.clone(), ben: ben_p, t: deal_terms(spec("p"), spec("q")), d };
    let ana = ana_p.id;
    let mut split = |l: &mut DealLab, number: Option<u64>, tag: &str| {
        let s = agreements::Split {
            receipt: spec(&format!("a receipt {tag}")),
            payouts: vec![line_payout(ana, 1, d)],
            cmip: spec("a split cMIP"),
            publication: pb,
            tally: None,
            number, ..Default::default() };
        agreements_act(&mut l.w, &mut svc, agreements::types::SPLIT, s.to_map(), None)
    };
    let one = split(&mut l, Some(1), "one");
    let three = split(&mut l, Some(3), "three");
    let v = view(&l.w);
    assert_eq!(v.split(&one).unwrap().numbering, None);
    assert_eq!(v.split(&three).unwrap().numbering, None, "a gap is the alarm, not a deviation");
    let none = split(&mut l, None, "none");
    let again = split(&mut l, Some(3), "three again");
    let v = view(&l.w);
    assert_eq!(v.split(&none).unwrap().numbering, Some(agreements::NumberBreak::Unnumbered));
    assert_eq!(v.split(&again).unwrap().numbering, Some(agreements::NumberBreak::Repeated { number: 3, with: vec![three] }));
    assert_eq!(
        v.split(&three).unwrap().numbering,
        Some(agreements::NumberBreak::Repeated { number: 3, with: vec![again] }),
        "shown on every split involved"
    );
}

/// QF5, decided by Nobody, allegedly, 9 October 2026 ("Yes"; F190): money
/// owed back is repaid like any debt, by a payment naming what it repays,
/// proven by either side's record (double entry): the payer's receipt, or
/// the collective's claim. No new act. Repaid in full, it no longer blocks
/// a closing (F189, 7).
#[test]
fn f190_qf5_money_owed_back_is_repaid_by_a_payment_naming_it() {
    use mor_core::money::{Amount, PaidAt, Payer, Payload as Fin, Purchase, Receipt};
    let mut lab = Lab::new(&|_| {});
    let label = lab.col.id;
    let mut patron = lab.w.genesis("a patron", vec![own_home()], None, None);
    let bake = lab.publish(0);
    lab.sign(ANA, &bake);
    let (_, _, _, rot1) = break_by_lost_record(&mut lab);
    let f = lab.founding;
    let unit = spec("a unit");
    let (_, k1) = self_sale(&mut lab, 0, vec![agreements::Sold::Bake(bake)], 7);
    let r = Fin::Receipt(Receipt {
        rail: spec("a rail Module"),
        proof: b"gift".to_vec(),
        payer: Some(Payer::Identity(patron.id)),
        payee: label,
        amount: Amount { unit, value: 7 },
        fulfils: k1,
        previous: None,
        forward: None,
        batch: None,
        purchase: Some(Purchase { agreement: f, line: f }),
    });
    let a = lab.w.everyday_act(&mut lab.c[0], mirs().money, 2, r.to_map(), None, None);
    let owed = lab.w.add(&a);
    assert_eq!(common::stand_in_answers(lab.view()).owed_back(&label).unwrap().len(), 1);
    let node = pointer_of(&mut lab.w, &mut patron, 1, None, &[b"the patron's node"]);
    let pid = patron.id;
    // Paid back to the patron, but the rail's proof was never checked: nothing.
    let mut payer = lab.c[0].clone();
    payment(&mut lab, &mut payer, true, pid, owed, unit, 7, b"unchecked");
    assert_eq!(common::stand_in_answers(lab.view()).owed_back(&label).unwrap().len(), 1, "a payment its rail does not show repays nothing");
    // Three of seven, by the patron's own receipt naming the payment owed back.
    let part = payment(&mut lab, &mut patron, false, pid, owed, unit, 3, b"refund, part one");
    lab.rail_valid.push((part, PaidAt::Flow(node)));
    assert_eq!(common::stand_in_answers(lab.view()).owed_back(&label).unwrap().len(), 1, "three of seven: still owed");
    // The rest, by the collective's own claim, paid to the patron's pointer.
    let rest = payment(&mut lab, &mut payer, true, pid, owed, unit, 4, b"refund, part two");
    lab.rail_valid.push((rest, PaidAt::Flow(node)));
    lab.c[0] = payer;
    assert!(common::stand_in_answers(lab.view()).owed_back(&label).unwrap().is_empty(), "repaid in full, by either side's record");
    // The rollback; then every member closes: nothing is owed back.
    let same = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|_| {});
    let r = lab.propose(ANA, &same);
    let rs: Vec<Hash> = [ANA, BEN, CY].iter().map(|w| lab.sign(*w, &r)).collect();
    roll_back(&mut lab, r, &rs, rot1, &[]);
    let c = agreements::Closing { agreement: r, collective: label, open: vec![] };
    let eo = ending_obj(&lab, r, label);
    let x = agreements_act(&mut lab.w, &mut lab.m[ANA], agreements::types::CLOSING, c.to_map(), eo);
    lab.end(ANA, &x);
    lab.end(BEN, &x);
    lab.end(CY, &x);
    let e = lab.view().closing(&x).unwrap();
    assert!(!e.why.iter().any(|w| w.contains("owed back")), "{:?}", e.why);
}

/// QF6, decided by Nobody, allegedly, 9 October 2026 ("Yes"; F190): an old
/// stepping down is spent once the member holds the area again, as a
/// resignation is once its signer comes back (F189, 1). Registered again,
/// by a record, it takes nothing; a stepping down signed after the return
/// counts.
#[test]
fn f190_qf6_an_old_stepping_down_is_spent_once_the_member_holds_the_area_again() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let ids = lab.ids();
    // Ana steps down from Releases (area 1); the label registers it.
    let mut ana = lab.m[ANA].clone();
    let old = lab.resign_from(&mut ana, f, Some(1));
    lab.m[ANA] = ana;
    lab.record(0, None, &[], vec![old], f);
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    assert!(!lab.counts(&p), "Releases is frozen");
    // A constitutional clone gives Releases back to Ana, who signs it.
    let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|t| {
        t.areas.as_mut().unwrap()[0].holders = vec![ids[ANA]];
        t.text = "Ana runs the releases again.".into();
    });
    let back = lab.propose(BEN, &t);
    let s: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &back)).collect();
    lab.rotate(Some((back, s)), &[0]);
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    assert!(lab.counts(&p), "Ana holds Releases again");
    // Her old stepping down, registered again: spent, it takes nothing.
    lab.record(0, None, &[], vec![old], back);
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    assert!(lab.counts(&p), "the old stepping down is spent (QF6): {:?}", lab.consent(&p));
    // One she signs after the return counts.
    let mut ana = lab.m[ANA].clone();
    let again = lab.resign_from(&mut ana, back, Some(1));
    lab.m[ANA] = ana;
    lab.record(0, None, &[], vec![again], back);
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    assert!(!lab.counts(&p), "a stepping down after the return counts");
}

/// F184, decided by Nobody, allegedly, 9 October 2026 ("Yes"): a relay's
/// delivery record (the relay transport cMIP, draft 3, type 0) counts as
/// evidence for a relay's role share only when the payer's claim for the
/// payment acknowledges it, and the object it names is the one the payment
/// was for (Agreements rules 19 and 22, the role share). The relay's word alone is
/// evidence of nothing: paying for usage invites faking usage.
#[test]
fn f184_a_delivery_record_counts_only_when_the_payers_claim_acknowledges_it() {
    use mor_core::money::{Amount, Claim, Payer, Payload as Fin, Purchase, Receipt};
    let mut lab = Lab::new(&|t| {
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 400_000), (p[BEN], 300_000), (p[CY], 300_000)])]);
    });
    let ids = lab.ids();
    let rail = spec("a rail Module");
    let transport = spec("the relay transport cMIP, draft 3");
    let mut svc = lab.w.genesis("a split service", vec![own_home()], None, None);
    let mut fan = lab.w.genesis("a fan", vec![own_home()], None, None);
    let mut relay = lab.w.genesis("a relay's operator", vec![own_home()], None, None);
    let k1 = lab.founding;
    let sa = lab.split_agreement_with(&mut svc, &|p| p.plan = role_plan("relay", 100_000));
    let ptr = lab.pointer(0, 1, None, &[rail]);
    lab.sign(BEN, &ptr);
    // The song's publication, its media locked under one locked hash.
    let locked = spec("the song's locked bytes");
    let song = {
        let x = lab.w.everyday_act(&mut lab.c[0], mirs().envelopes, 0, publication(vec![(Value::Uint(1), Value::Bytes(spec("the song").to_vec())), (Value::Uint(2), Value::Bytes(locked.to_vec()))]), None, None);
        lab.w.add(&x)
    };
    let proof = b"the fan's payment".to_vec();
    let svc_id = svc.id;
    let incoming = {
        let r = Fin::Receipt(Receipt {
            rail,
            proof: proof.clone(),
            payer: Some(Payer::Identity(fan.id)),
            payee: svc_id,
            amount: Amount { unit: spec("a unit"), value: 1000 },
            fulfils: song,
            previous: None,
            forward: None,
            batch: None,
            purchase: Some(Purchase { agreement: k1, line: k1 }),
        });
        let a = lab.w.everyday_act(&mut svc, mirs().money, 2, r.to_map(), None, None);
        lab.w.add(&a)
    };
    let record = |lab: &mut Lab, relay: &mut Person, object: Hash, nonce: u8| {
        let p = vec![(Value::Uint(0), Value::Bytes(object.to_vec())), (Value::Uint(1), Value::Uint(4096)), (Value::Uint(2), Value::Bytes(vec![nonce; 32]))];
        let a = lab.w.everyday_act(relay, transport, 0, p, None, None);
        lab.w.add(&a)
    };
    let served = record(&mut lab, &mut relay, locked, 1);
    let other = record(&mut lab, &mut relay, spec("another object"), 2);
    let mut relay2 = lab.w.genesis("a second relay's operator", vec![own_home()], None, None);
    let served2 = record(&mut lab, &mut relay2, locked, 3);
    let everyone = ids.clone();
    let relay_id = relay.id;
    let read = |lab: &mut Lab, svc: &mut Person, evidence: Hash| {
        let payouts = vec![
            line_payout(ids[ANA], 360, k1),
            line_payout(ids[BEN], 270, k1),
            line_payout(ids[CY], 270, k1),
            agreements::Payout { receiver: relay_id, amount: 100, stake: None, role: Some("relay".into()), evidence: Some(evidence), fee_module: None, rail_fee: None, ..Default::default() },
        ];
        let s = agreements::Split { receipt: incoming, payouts, cmip: spec("a split cMIP"), publication: sa, tally: None, number: None, ..Default::default() };
        let x = lab.w.private_act(svc, mirs().agreements, agreements::types::SPLIT, s.to_map(), None, everyone.clone());
        let mut v = lab.view();
        v.delivery_records.insert(transport);
        v.split(&x).unwrap().unevidenced
    };
    assert_eq!(read(&mut lab, &mut svc, served), vec![relay_id], "the relay's word alone is evidence of nothing");
    // The relay signs a claim for the payment itself, acknowledging its record:
    // not the payer's claim.
    let claim = Fin::Claim(Claim {
        rail,
        proof: proof.clone(),
        payee: svc_id,
        amount: Amount { unit: spec("a unit"), value: 1000 },
        fulfils: song,
        disagrees: None,
        referral: None,
        refund: None,
        anonymous: None,
        purchase: Some(Purchase { agreement: k1, line: k1 }),
        previous: None,
    })
    .to_map();
    let a = lab.w.everyday_act(&mut relay, mirs().money, 3, claim.clone(), None, Some(vec![served]));
    lab.w.add(&a);
    assert_eq!(read(&mut lab, &mut svc, served), vec![relay_id], "only the payer's claim acknowledges a delivery");
    // The fan's claim, acknowledging the record of the object it paid for;
    // the rail answers that it carries the payment's commitment, the fan
    // as payer (F193).
    let a = lab.w.everyday_act(&mut fan, mirs().money, 3, claim, None, Some(sorted(vec![served, other, served2])));
    let a = lab.w.add(&a);
    lab.rail_valid.push((a, mor_core::money::PaidAt::Flow(ptr)));
    assert!(read(&mut lab, &mut svc, served).is_empty(), "acknowledged by the payer's claim: it counts");
    assert!(read(&mut lab, &mut svc, served2).is_empty(), "one claim acknowledges several relays' records");
    assert_eq!(read(&mut lab, &mut svc, other), vec![relay_id], "a record of another object than the one paid for counts for nothing");
}

// ---------------------------------------------------------------------------
// Hostile review of the F190 and F184 build (9 October 2026, night):
// `docs/reviews/f190-review-2026-10-09.md`. Each test reproduces a finding
// as the code stands. A test that shows an attack working passes, and says
// so in its name; nothing here changes the protocol or the code.
// ---------------------------------------------------------------------------

/// Review finding 1 (BREAKS as built, rule 45b, QF1): where a party left
/// the deal on the branch later discarded, those who remain there grew it
/// alone, citing nothing, and the settled deal fell back to its reference.
/// Closed by F192 (decided 10 October 2026): a version a lone party grows
/// on a dropped branch reopens nothing; only a version on the line in
/// force changes the deal.
#[test]
fn review_f190_1_a_party_left_alone_on_a_dropped_branch_reopens_nothing() {
    let mut l = DealLab::new();
    let d = l.d;
    // Branch A: both carry on.
    let a1 = l.version(d, "A: Ana and Ben carry on, Ben's share raised.", None);
    // Branch B: Ben leaves the deal; a clone dropping him needs his signature too.
    let b1 = {
        let mut c = l.t.clone();
        c.parent = Some(d);
        c.text = "B: Ben leaves, Ana alone.".into();
        c.parties = vec![l.ana.id];
        c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![l.ana.id, l.ben.id]) }]);
        let k = agreements_act(&mut l.w, &mut l.ana, agreements::types::TERMS, c.to_map(), obj(d));
        sign(&mut l.w, &mut l.ana, &k);
        sign(&mut l.w, &mut l.ben, &k);
        k
    };
    assert_eq!(l.in_force().unwrap(), d, "forked: the reference");
    // Settled for A, naming B's tip, signed by both: in force.
    let s = l.version(a1, "Settled: A, having seen B.", Some(b1));
    assert_eq!(l.in_force().unwrap(), s, "settled, by everyone");
    // Ana alone, the only party of B's tip, grows B past the tip named,
    // citing nothing: a complete version by every party whose voice remains there.
    let b2 = {
        let mut c = l.t.clone();
        c.parent = Some(b1);
        c.text = "B grows: Ana alone, citing nothing.".into();
        c.parties = vec![l.ana.id];
        c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: vec![l.ana.id] }]);
        let k = agreements_act(&mut l.w, &mut l.ana, agreements::types::TERMS, c.to_map(), obj(b1));
        sign(&mut l.w, &mut l.ana, &k);
        k
    };
    assert_eq!(view(&l.w).agreement(&b2).unwrap().exists, Some(true), "Ana's version is complete: she is every party of that branch");
    assert_eq!(l.in_force().unwrap(), s, "Ana alone reopens nothing: Ben's raise stands (F192)");
    assert!(view(&l.w).deal_fork(&d).unwrap().is_none());
}

/// Review finding 2 (BREAKS as built, rule 45b, "the first clean
/// settlement holds"): the judge of forks unsettled its own settlement by
/// a second one, and the next plain version then decided which held.
/// Closed by F192 (decided 10 October 2026): any judge speaks once per
/// fork, a second settlement counting for nothing, and no plain version
/// decides anything. A verifier tells the second from the first by
/// history: here the second drops a version citing the first. Where
/// neither holds the other (the judge's first settlement uncited), which
/// came first cannot be told: F206 (a), decided 10 October 2026, reads
/// the two as the judge answering "unknown" (QH1 closed).
#[test]
fn review_f190_2_the_judge_speaks_once_and_no_plain_version_decides() {
    let lab = |cite: bool| {
        let (mut l, mut judges) = judged_deal(0);
        let d = l.d;
        let a1 = l.version(d, "A.", None);
        let b1 = l.version(d, "B.", None);
        let request = ask_judge(&mut l);
        let j1 = judge_settles(&mut l, &mut judges[0], request, a1, vec![b1], vec![]);
        assert_eq!(l.in_force().unwrap(), a1, "the judge keeps A on Ben's request");
        // Life goes on under A; a conforming client cites the settlement.
        let a2 = l.version_full(a1, "A grows, after the judge spoke.", vec![], if cite { vec![j1] } else { vec![] });
        assert_eq!(l.in_force().unwrap(), a2);
        // The judge, alone, on the same request, later keeps B instead.
        judge_settles(&mut l, &mut judges[0], request, b1, vec![a2], vec![]);
        (l, a2, b1)
    };
    let (mut l, a2, b1) = lab(true);
    assert_eq!(l.in_force().unwrap(), a2, "the second settlement counts for nothing");
    l.version(b1, "A harmless change on B.", None);
    assert_eq!(l.in_force().unwrap(), a2, "a plain version on B decides nothing");
    let a3 = l.version(a2, "A harmless change on A.", None);
    assert_eq!(l.in_force().unwrap(), a3, "a version on the line in force changes the deal, as any version does");
    // The first settlement uncited: neither holds the other. F206 (a),
    // decided 10 October 2026: both count for nothing, the judge answered
    // "unknown"; with no next link, the deal stays on its reference.
    let (l, _, _) = lab(false);
    assert_eq!(l.in_force().unwrap(), l.d, "a judge that contradicts itself has spoken for nothing (F206)");
}

/// Review finding 5 (BREAKS as built, rules 19 and 22, F184): the
/// receipt's payer is written by the split service that signs the receipt.
/// Where the real payer published no claim and committed to nobody, the
/// service named a payer of its own choosing, whose claim for the same
/// rail proof then acknowledged the record of a relay the service runs.
/// Closed by F193 (decided 10 October 2026): only the payer the payment's
/// own commitment names acknowledges; the puppet's claim does not carry
/// the commitment (the rail refuses it), and acknowledges nothing.
#[test]
fn review_f190_5_the_payer_the_service_names_acknowledges_nothing() {
    use mor_core::money::{Amount, Claim, Payer, Payload as Fin, Purchase, Receipt};
    let mut lab = Lab::new(&|t| {
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 400_000), (p[BEN], 300_000), (p[CY], 300_000)])]);
    });
    let ids = lab.ids();
    let rail = spec("a rail Module");
    let transport = spec("the relay transport cMIP, draft 3");
    let mut svc = lab.w.genesis("a split service", vec![own_home()], None, None);
    let mut puppet = lab.w.genesis("the service's puppet, named as payer", vec![own_home()], None, None);
    let mut relay = lab.w.genesis("the service's own relay", vec![own_home()], None, None);
    let k1 = lab.founding;
    let sa = lab.split_agreement_with(&mut svc, &|p| p.plan = role_plan("relay", 100_000));
    let svc_id = svc.id;
    let ptr = lab.pointer(0, 1, None, &[rail]);
    lab.sign(BEN, &ptr);
    let locked = spec("the song's locked bytes");
    let song = {
        let x = lab.w.everyday_act(&mut lab.c[0], mirs().envelopes, 0, publication(vec![(Value::Uint(1), Value::Bytes(spec("the song").to_vec())), (Value::Uint(2), Value::Bytes(locked.to_vec()))]), None, None);
        lab.w.add(&x)
    };
    // A real, anonymous buyer paid on the rail and published nothing. The
    // service receipts the payment naming its puppet as the payer.
    let proof = b"an anonymous buyer's payment".to_vec();
    let incoming = {
        let r = Fin::Receipt(Receipt {
            rail,
            proof: proof.clone(),
            payer: Some(Payer::Identity(puppet.id)),
            payee: svc_id,
            amount: Amount { unit: spec("a unit"), value: 1000 },
            fulfils: song,
            previous: None,
            forward: None,
            batch: None,
            purchase: Some(Purchase { agreement: k1, line: k1 }),
        });
        let a = lab.w.everyday_act(&mut svc, mirs().money, 2, r.to_map(), None, None);
        lab.w.add(&a)
    };
    // The service's relay signs a record of the song; nobody fetched it.
    let served = {
        let p = vec![(Value::Uint(0), Value::Bytes(locked.to_vec())), (Value::Uint(1), Value::Uint(4096)), (Value::Uint(2), Value::Bytes(vec![7; 32]))];
        let a = lab.w.everyday_act(&mut relay, transport, 0, p, None, None);
        lab.w.add(&a)
    };
    // The puppet's claim for the same rail proof acknowledges it.
    let claim = Fin::Claim(Claim {
        rail,
        proof,
        payee: svc_id,
        amount: Amount { unit: spec("a unit"), value: 1000 },
        fulfils: song,
        disagrees: None,
        referral: None,
        refund: None,
        anonymous: None,
        purchase: Some(Purchase { agreement: k1, line: k1 }),
        previous: None,
    });
    let a = lab.w.everyday_act(&mut puppet, mirs().money, 3, claim.to_map(), None, Some(vec![served]));
    lab.w.add(&a);
    let payouts = vec![
        line_payout(ids[ANA], 360, k1),
        line_payout(ids[BEN], 270, k1),
        line_payout(ids[CY], 270, k1),
        agreements::Payout { receiver: relay.id, amount: 100, stake: None, role: Some("relay".into()), evidence: Some(served), fee_module: None, rail_fee: None, ..Default::default() },
    ];
    let s = agreements::Split { receipt: incoming, payouts, cmip: spec("a split cMIP"), publication: sa, tally: None, number: None, ..Default::default() };
    let x = lab.w.private_act(&mut svc, mirs().agreements, agreements::types::SPLIT, s.to_map(), None, ids.clone());
    let mut v = lab.view();
    v.delivery_records.insert(transport);
    assert_eq!(v.split(&x).unwrap().unevidenced, vec![relay.id], "the puppet's claim carries no commitment of the payment: the relay's share is unevidenced");
    // Were the rail to answer it valid, the puppet would be the committed
    // payer, and its acknowledgement would count: the commitment decides.
    let mut v = lab.view();
    v.delivery_records.insert(transport);
    let puppet_claim = lab.w.v.signed_by(&puppet.id).find(|h| h.inside.spec == mirs().money).unwrap().id;
    v.rail_valid.insert(puppet_claim, mor_core::money::PaidAt::Flow(ptr));
    assert!(v.split(&x).unwrap().unevidenced.is_empty());
}

/// Review finding 6 (BREAKS as built, the resignation format, QF6 and
/// F189 1): a stepping down was spent only after a line registered it and
/// the member came back; one never registered stayed a standing weapon.
/// Closed by F195 (decided 10 October 2026, "Good"): a resignation or a
/// stepping down is spent by any later version its signer signed that
/// names them again, registered or not; once spent, no line registers it.
#[test]
fn review_f190_6_an_old_stepping_down_never_registered_is_spent() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let ids = lab.ids();
    // Ana signs a stepping down from Releases (area 1) and hands it in; the
    // label never registers it: everyone agreed she would stay.
    let mut ana = lab.m[ANA].clone();
    let old = lab.resign_from(&mut ana, f, Some(1));
    lab.m[ANA] = ana;
    // Later, a constitutional clone that every member signs names Ana the
    // holder of Releases.
    let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|t| {
        t.areas.as_mut().unwrap()[0].holders = vec![ids[ANA]];
        t.text = "Ana runs the releases.".into();
    });
    let back = lab.propose(BEN, &t);
    let s: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &back)).collect();
    lab.rotate(Some((back, s)), &[0]);
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    assert!(lab.counts(&p), "Ana holds Releases");
    // Whoever holds the signing key registers the old stepping down now.
    lab.record(0, None, &[], vec![old], back);
    let p = lab.publish(0);
    lab.sign(ANA, &p);
    assert!(lab.counts(&p), "the old stepping down, spent by Ana's later signature as holder, takes nothing (F195)");
}

/// Review, smaller reading (UNCLEAR as built, rule 45b): where every
/// party signed a version naming in field 26 a hash that exists nowhere,
/// every reading of the deal erred, for good. Closed by F196 (decided 10
/// October 2026): such a version is read as a plain version until the
/// version it names is held; the deal stays readable, and the parties may
/// sign a correct settlement.
#[test]
fn review_f190_7_a_complete_version_naming_a_tip_nobody_holds_is_a_plain_version() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let bad = l.version(a1, "Settles a hash that exists nowhere.", Some(spec("nothing, anywhere")));
    assert_eq!(l.in_force().unwrap(), d, "readable: forked, on the reference");
    let next = l.version(bad, "Life tries to go on.", None);
    assert_eq!(l.in_force().unwrap(), d);
    assert!(view(&l.w).deal_fork(&d).unwrap().is_some());
    let s = l.version_full(next, "Settled correctly.", vec![b1], vec![]);
    assert_eq!(l.in_force().unwrap(), s);
}

/// Review finding 5b (BREAKS, rule 22, F184), closed by step 12b (Fable's
/// 4b), as the publication carries it: "the object the payment was for" is
/// read from the bake the payment names in `fulfils`, or, for a purchase
/// naming a price tag, from the bakes the publication it prices sells.
/// The record of the song the publication sells, acknowledged by the
/// buyer's claim, fills the relay's role.
#[test]
fn review_f190_5b_a_delivery_record_counts_on_a_purchase_naming_the_tag_of_the_publication_that_sells_it() {
    use mor_core::money::{Amount, Claim, Payer, Payload as Fin, Purchase, Receipt};
    let mut lab = Lab::new(&|t| {
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 400_000), (p[BEN], 300_000), (p[CY], 300_000)])]);
    });
    let ids = lab.ids();
    let rail = spec("a rail Module");
    let transport = spec("the relay transport cMIP, draft 3");
    let mut svc = lab.w.genesis("a split service", vec![own_home()], None, None);
    let mut fan = lab.w.genesis("a fan", vec![own_home()], None, None);
    let mut relay = lab.w.genesis("a relay's operator", vec![own_home()], None, None);
    let k1 = lab.founding;
    let svc_id = svc.id;
    let ptr = lab.pointer(0, 1, None, &[rail]);
    lab.sign(BEN, &ptr);
    let locked = spec("the song's locked bytes");
    let song = {
        let x = lab.w.everyday_act(&mut lab.c[0], mirs().envelopes, 0, publication(vec![(Value::Uint(1), Value::Bytes(spec("the song").to_vec())), (Value::Uint(2), Value::Bytes(locked.to_vec()))]), None, None);
        lab.w.add(&x)
    };
    // The collective's publication of the song, its split service pricing
    // it by a price tag (rules 11, 12).
    let sa = lab.split_agreement_with(&mut svc, &|p| {
        p.sold = Some(vec![agreements::Sold::Bake(song)]);
        p.plan = role_plan("relay", 100_000);
    });
    let offer = common::price_tag(&mut lab.w, &mut svc, mirs().money, mor_core::money::Priced::Publication(sa), 1000, spec("a unit"), svc_id);
    let proof = b"the fan's payment under the offer".to_vec();
    let incoming = {
        let r = Fin::Receipt(Receipt {
            rail,
            proof: proof.clone(),
            payer: Some(Payer::Identity(fan.id)),
            payee: svc_id,
            amount: Amount { unit: spec("a unit"), value: 1000 },
            fulfils: offer,
            previous: None,
            forward: None,
            batch: None,
            purchase: Some(Purchase { agreement: k1, line: k1 }),
        });
        let a = lab.w.everyday_act(&mut svc, mirs().money, 2, r.to_map(), None, None);
        lab.w.add(&a)
    };
    let served = {
        let p = vec![(Value::Uint(0), Value::Bytes(locked.to_vec())), (Value::Uint(1), Value::Uint(4096)), (Value::Uint(2), Value::Bytes(vec![9; 32]))];
        let a = lab.w.everyday_act(&mut relay, transport, 0, p, None, None);
        lab.w.add(&a)
    };
    // The fan's own claim for the payment acknowledges the record of the
    // song it fetched.
    let claim = Fin::Claim(Claim {
        rail,
        proof,
        payee: svc_id,
        amount: Amount { unit: spec("a unit"), value: 1000 },
        fulfils: offer,
        disagrees: None,
        referral: None,
        refund: None,
        anonymous: None,
        purchase: Some(Purchase { agreement: k1, line: k1 }),
        previous: None,
    });
    let a = lab.w.everyday_act(&mut fan, mirs().money, 3, claim.to_map(), None, Some(vec![served]));
    let a = lab.w.add(&a);
    // The fan is the payer the payment committed to (F193).
    lab.rail_valid.push((a, mor_core::money::PaidAt::Flow(ptr)));
    let payouts = vec![
        line_payout(ids[ANA], 360, k1),
        line_payout(ids[BEN], 270, k1),
        line_payout(ids[CY], 270, k1),
        agreements::Payout { receiver: relay.id, amount: 100, stake: None, role: Some("relay".into()), evidence: Some(served), fee_module: None, rail_fee: None, ..Default::default() },
    ];
    let s = agreements::Split { receipt: incoming, payouts, cmip: spec("a split cMIP"), publication: sa, tally: None, number: None, ..Default::default() };
    let x = lab.w.private_act(&mut svc, mirs().agreements, agreements::types::SPLIT, s.to_map(), None, ids.clone());
    let mut v = lab.view();
    v.delivery_records.insert(transport);
    assert!(v.split(&x).unwrap().unevidenced.is_empty(), "acknowledged by the payer, for the song the publication sells: the relay's role is filled");
}

/// Review, what held: the judge's settlement made after the parties'
/// clean settlement changes nothing: it names the settling version, so it
/// is after it, and the first clean settlement holds.
#[test]
fn review_f190_held_the_judge_cannot_overturn_the_parties_clean_settlement() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut judge = w.genesis("the judge of forks", vec![own_home()], None, None);
    let mut t = deal_terms(ana.id, ben.id);
    t.arbitrators = Some(vec![judge.id]);
    t.fork_judge = Some(judge.id);
    let d = agreements_act(&mut w, &mut ana, agreements::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut ana, &d);
    sign(&mut w, &mut ben, &d);
    let mut l = DealLab { w, ana, ben, t, d };
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let s = l.version(a1, "Settled for A by everyone.", Some(b1));
    assert_eq!(l.in_force().unwrap(), s);
    let request = {
        let r = agreements::SettlementRequest { reference: d };
        agreements_act(&mut l.w, &mut l.ana, agreements::types::SETTLEMENT_REQUEST, r.to_map(), obj(d))
    };
    // The judge, asked afterwards by Ana, keeps B and discards the
    // settlement: made after it, it changes nothing.
    let j = agreements::ForkSettlement { request, kept: b1, discarded: vec![s] };
    agreements_act(&mut l.w, &mut judge, agreements::types::FORK_SETTLEMENT, j.to_map(), obj(request));
    assert_eq!(l.in_force().unwrap(), s, "the judge cannot overturn a clean settlement of the parties");
}

// ---------------------------------------------------------------------------
// The F191 to F199 build (10 October 2026): `docs/f191-f199-build-2026-10-10.md`.
// Each test was written first and seen to fail for the reason the decision
// gives.
// ---------------------------------------------------------------------------

/// A deal naming a judge of forks, with a chain of judgment for it (QG4):
/// those who take over, in order, each after a period on the deal's time
/// reference.
fn judged_deal(takers: usize) -> (DealLab, Vec<Person>) {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let judges: Vec<Person> = (0..=takers).map(|i| w.genesis(&format!("judge {i}"), vec![own_home()], None, None)).collect();
    let mut t = deal_terms(ana.id, ben.id);
    t.arbitrators = Some(judges.iter().map(|j| j.id).collect());
    t.fork_judge = Some(judges[0].id);
    if takers > 0 {
        t.time = Some((spec("a block height reference"), Value::Uint(0)));
        t.chain = Some(vec![agreements::ChainLink {
            judge: agreements::Judge::Identity(judges[0].id),
            next: judges[1..].iter().map(|j| (j.id, 30)).collect(),
        }]);
    }
    let d = agreements_act(&mut w, &mut ana, agreements::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut ana, &d);
    sign(&mut w, &mut ben, &d);
    (DealLab { w, ana, ben, t, d }, judges)
}

fn ask_judge(l: &mut DealLab) -> Hash {
    let r = agreements::SettlementRequest { reference: l.d };
    agreements_act(&mut l.w, &mut l.ben, agreements::types::SETTLEMENT_REQUEST, r.to_map(), obj(l.d))
}

fn judge_settles(l: &mut DealLab, judge: &mut Person, request: Hash, kept: Hash, discarded: Vec<Hash>, cites: Vec<Hash>) -> Hash {
    let s = agreements::ForkSettlement { request, kept, discarded: sorted(discarded) };
    let mut o = vec![Object { chain: request, predecessor: request }];
    o.extend(cites.iter().map(|c| Object { chain: *c, predecessor: *c }));
    agreements_act(&mut l.w, judge, agreements::types::FORK_SETTLEMENT, s.to_map(), Some(o))
}

/// F192, decided by Nobody, allegedly, 10 October 2026 ("Yes agreed"),
/// replacing QF1: a settlement is final for everything its signers could
/// see. A version on a dropped branch that the settlement did not hold in
/// its history (made late, or kept back) reopens nothing; only a new
/// version on the line in force, signed as rule 45b asks, changes the deal.
#[test]
fn f192_a_late_version_on_a_dropped_branch_reopens_nothing() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "Branch A.", None);
    let b1 = l.version(d, "Branch B.", None);
    let s = l.version(a1, "Settled: A, having seen B.", Some(b1));
    assert_eq!(l.in_force().unwrap(), s);
    let b2 = l.version(b1, "B grows, when? Nobody can tell.", None);
    assert_eq!(l.in_force().unwrap(), s, "a version the settlement could not see reopens nothing");
    assert!(view(&l.w).deal_fork(&d).unwrap().is_none(), "the deal is settled, not forked");
    l.version(b2, "B grows again.", None);
    assert_eq!(l.in_force().unwrap(), s);
    let s2 = l.version(s, "Life goes on, on the line in force.", None);
    assert_eq!(l.in_force().unwrap(), s2, "only a version on the line in force changes the deal");
    // A whole branch the settlement never saw: dropped too (F192: "anything
    // else is not seen").
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let s = l.version(a1, "Settled for A, naming B.", Some(b1));
    l.version(d, "C, a third version of the reference, never seen.", None);
    assert_eq!(l.in_force().unwrap(), s);
}

/// A verifier holding everything `w` holds but the acts in `skip` and
/// their signature acts: a verifier that has not been given them yet.
fn held_without(w: &World, skip: &[Hash]) -> mor_core::chain::Verifier {
    let mut v = mor_core::chain::Verifier::with_mirs(common::identity_spec(), common::money_spec(), agreements_spec());
    for (a, key) in &w.log {
        let id = a.id();
        let cites = w.v.get(&id).is_some_and(|h| {
            h.inside.spec == agreements_spec() && h.inside.type_ == agreements::types::SIGNATURE && h.inside.objects.iter().flatten().any(|o| skip.contains(&o.chain))
        });
        if !skip.contains(&id) && !cites {
            v.add_with_key(a.clone(), key.as_ref()).unwrap();
        }
    }
    v
}

/// F192, Fable's finding 3 (a complete version held back): a version
/// signed by everyone while the fork stood, published after the
/// settlement, reopens nothing. Its signer loses it: the stated cost.
#[test]
fn f192_a_version_held_back_and_published_late_reopens_nothing() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    // Ben signs a small change on B; Ana keeps it to herself.
    let b2 = l.version(b1, "B: a small change, signed by both, kept back.", None);
    let s = l.version(a1, "Settled for A, naming B's tip as everyone could see it.", Some(b1));
    let before = held_without(&l.w, &[b2]);
    assert_eq!(common::stand_in_payments(AgreementsView::new(&before, mirs())).version_in_force(&d).unwrap(), s, "before Ana publishes it: settled");
    assert_eq!(view(&l.w).agreement(&b2).unwrap().exists, Some(true));
    assert_eq!(l.in_force().unwrap(), s, "published late, it reopens nothing");
}

/// F188's "one naming an older version of that branch settles nothing",
/// under F192: it holds where the settlement holds the newer version in its
/// history, and only there; a newer version it does not hold is a late
/// version, and loses.
#[test]
fn f192_a_settlement_that_saw_a_newer_tip_and_named_an_older_settles_nothing() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let b2 = l.version(b1, "B grows.", None);
    let s = l.version_full(a1, "Names B1, but cites B2: it saw B2.", vec![b1], vec![b2]);
    assert_ne!(l.in_force().unwrap(), s, "it saw the newer tip and named an older one: it settles nothing");
    assert!(l.tangled() || view(&l.w).deal_fork(&d).unwrap().is_some(), "a plain version: still forked");
    let s2 = l.version_full(a1, "Names B2.", vec![b2], vec![]);
    assert_eq!(l.in_force().unwrap(), s2, "naming the tip it saw, it settles; the plain version it did not see loses");
    let _ = s;
    // Not citing B2, it could not see it: it counts, and B2 loses.
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    l.version(b1, "B grows.", None);
    let s = l.version(a1, "Names B1, as it saw B.", Some(b1));
    assert_eq!(l.in_force().unwrap(), s, "B2, not seen, reopens nothing (F192)");
}

/// F192 against Fable's finding 2: a party left alone on a dropped branch
/// grows it, citing nothing: nothing reopens. "Only a new version signed
/// by every party whose voice remains in the version the settlement put in
/// force changes the deal."
#[test]
fn f192_a_party_alone_on_a_dropped_branch_reopens_nothing() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A: Ana and Ben carry on.", None);
    let b1 = {
        let mut c = l.t.clone();
        c.parent = Some(d);
        c.text = "B: Ben leaves, Ana alone.".into();
        c.parties = vec![l.ana.id];
        c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![l.ana.id, l.ben.id]) }]);
        let k = agreements_act(&mut l.w, &mut l.ana, agreements::types::TERMS, c.to_map(), obj(d));
        sign(&mut l.w, &mut l.ana, &k);
        sign(&mut l.w, &mut l.ben, &k);
        k
    };
    let s = l.version(a1, "Settled: A.", Some(b1));
    let mut c = l.t.clone();
    c.parent = Some(b1);
    c.text = "B grows: Ana alone.".into();
    c.parties = vec![l.ana.id];
    c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: vec![l.ana.id] }]);
    let b2 = agreements_act(&mut l.w, &mut l.ana, agreements::types::TERMS, c.to_map(), obj(b1));
    sign(&mut l.w, &mut l.ana, &b2);
    assert_eq!(l.in_force().unwrap(), s, "Ana alone reopens nothing");
}

/// F192, Fable's finding 1: the judge of forks speaks once per fork. A
/// second settlement that holds the first in its history (it drops a
/// version made after the first, citing it) counts for nothing, and no
/// plain version then decides anything.
#[test]
fn f192_the_judge_speaks_once() {
    let (mut l, mut judges) = judged_deal(0);
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let r = ask_judge(&mut l);
    let j1 = judge_settles(&mut l, &mut judges[0], r, a1, vec![b1], vec![]);
    assert_eq!(l.in_force().unwrap(), a1);
    // Life goes on under A; a conforming client cites the settlement.
    let a2 = l.version_full(a1, "A grows, after the judge spoke.", vec![], vec![j1]);
    assert_eq!(l.in_force().unwrap(), a2);
    judge_settles(&mut l, &mut judges[0], r, b1, vec![a2], vec![]);
    assert_eq!(l.in_force().unwrap(), a2, "a second settlement, made after the first, counts for nothing");
    let b2 = l.version(b1, "A harmless change on B.", None);
    assert_eq!(l.in_force().unwrap(), a2, "and a plain version on B decides nothing");
    let _ = b2;
}

/// F192 with DQ3: two settling versions of the parties, neither holding the
/// other, stay a tangle (every party signed both); a later one holding both
/// and naming every tip settles it, as QF3 allows.
#[test]
fn f192_rival_settling_versions_of_the_parties_and_a_third() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let s1 = l.version(a1, "Settled for A.", Some(b1));
    let s2 = l.version(b1, "Settled for B.", Some(a1));
    assert!(l.tangled());
    // A version on one of them that saw only that one changes nothing.
    l.version(s1, "On A's settlement, not seeing B's.", None);
    assert!(l.tangled());
    let s3 = l.version_full(s1, "For A, having seen both settlements.", vec![s2], vec![]);
    assert_eq!(l.in_force().unwrap(), s3, "settled by the version that saw both; the version on s1 it did not see loses (F192)");
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let s1 = l.version(a1, "Settled for A.", Some(b1));
    let s2 = l.version(b1, "Settled for B.", Some(a1));
    let s3 = l.version_full(s1, "For A, having seen both settlements.", vec![s2], vec![]);
    assert_eq!(l.in_force().unwrap(), s3, "settled by the version that saw both");
}

/// F196, decided by Nobody, allegedly, 10 October 2026 ("Approved"): a
/// settling version naming a version the verifier does not hold is read as
/// a plain version until it is held; the deal stays readable.
#[test]
fn f196_a_settlement_naming_a_version_nobody_holds_is_a_plain_version() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let bad = l.version(a1, "Settles a hash that exists nowhere.", Some(spec("nothing, anywhere")));
    assert_eq!(l.in_force().unwrap(), d, "readable: forked, on its reference");
    let f = view(&l.w).deal_fork(&d).unwrap().expect("forked");
    assert!(f.branches.iter().any(|b| b.contains(&bad)), "read as a plain version of branch A");
    let s = l.version_full(bad, "A correct settlement.", vec![b1], vec![]);
    assert_eq!(l.in_force().unwrap(), s, "the parties may sign a correct settlement");
}

/// F196: once the named version is held, the settlement counts from then.
#[test]
fn f196_once_held_the_settlement_counts() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b0 = l.version(d, "B.", None);
    let b1 = l.version(b0, "B grows.", None);
    let s = l.version(a1, "Settled: A, naming B's tip.", Some(b1));
    let partial = held_without(&l.w, &[b1]);
    let v = common::stand_in_payments(AgreementsView::new(&partial, mirs()));
    assert_eq!(v.version_in_force(&d).unwrap(), d, "B's tip not held: the settlement is a plain version, the deal forked");
    assert!(v.deal_fork(&d).unwrap().is_some_and(|f| f.branches.iter().any(|b| b.contains(&s))));
    assert_eq!(l.in_force().unwrap(), s, "held: the settlement counts");
}

/// QG4, decided by Nobody, allegedly, 9 October 2026: the judge of forks
/// follows the chain of judgment (field 21) like any judge the terms name.
/// Where it does not act within its period, the next link takes over, and
/// an answer it gives after that counts for nothing (rule 34a, F124). Under
/// F246 (10 October 2026) the stage is the fork's, `(reference, judge)`,
/// and a settlement the next link signed before its stage opened counts for
/// nothing even once it opens: it signs again within its stage.
#[test]
fn qg4_the_judge_of_forks_follows_the_chain_of_judgment() {
    let (mut l, mut judges) = judged_deal(1);
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let r = ask_judge(&mut l);
    let (first, next) = judges.split_at_mut(1);
    // The next link may not act while the judge's period runs.
    let early = judge_settles(&mut l, &mut next[0], r, a1, vec![b1], vec![]);
    assert_eq!(l.in_force().unwrap(), d, "the next link waits on the judge's period");
    // Its period on the fork passed, as the deal's time reference says: the
    // next link is active, but what it signed before then counts for nothing.
    let mut v = view(&l.w);
    v.judges_lapsed.insert((d, first[0].id));
    v.settled_out_of_turn.insert(early);
    assert_eq!(v.version_in_force(&d).unwrap(), d, "signed before its stage opened: counts for nothing (F246)");
    // Within its stage, the next link settles.
    judge_settles(&mut l, &mut next[0], r, a1, vec![b1], vec![]);
    let mut v = view(&l.w);
    v.judges_lapsed.insert((d, first[0].id));
    v.settled_out_of_turn.insert(early);
    assert_eq!(v.version_in_force(&d).unwrap(), a1, "the next link settles");
    // The judge, speaking after its period, counts for nothing.
    judge_settles(&mut l, &mut first[0], r, b1, vec![a1], vec![]);
    let mut v = view(&l.w);
    v.judges_lapsed.insert((d, first[0].id));
    v.settled_out_of_turn.insert(early);
    assert_eq!(v.version_in_force(&d).unwrap(), a1, "the judge's late answer counts for nothing");
}

/// A label selling its song through a split service, a relay share in its
/// plan, for the role-share decisions of 10 October 2026 (F193, F194, QG3):
/// the lab, the service, the payment's receipt as the service signs it
/// (naming `payer`), the label's pointer act (where the rail shows the
/// money paid), and the split's reading for one piece of evidence.
struct RoleLab {
    lab: Lab,
    svc: Person,
    /// The buyer.
    fan: Person,
    incoming: Hash,
    k1: Hash,
    song: Hash,
    ptr: Hash,
    rail: Hash,
    proof: Vec<u8>,
    /// The label's split agreement, its plan naming the role.
    sa: Hash,
}

impl RoleLab {
    /// `names_fan`: the receipt the service signs names the fan as payer.
    fn new(names_fan: bool) -> RoleLab {
        use mor_core::money::{Amount, Payload as Fin, Purchase, Receipt};
        let mut lab = Lab::new(&|t| {
            let p = t.parties.clone();
            t.stakes = stakes(vec![own(vec![(p[ANA], 400_000), (p[BEN], 300_000), (p[CY], 300_000)])]);
        });
        let rail = spec("a rail Module");
        let mut svc = lab.w.genesis("a split service", vec![own_home()], None, None);
        let fan = lab.w.genesis("a fan", vec![own_home()], None, None);
        let payer = names_fan.then_some(mor_core::money::Payer::Identity(fan.id));
        let k1 = lab.founding;
        let sa = lab.split_agreement_with(&mut svc, &|p| p.plan = role_plan("a helper", 100_000));
        let ptr = lab.pointer(0, 1, None, &[rail]);
        lab.sign(BEN, &ptr);
        let song = {
            let x = lab.w.everyday_act(&mut lab.c[0], mirs().envelopes, 0, publication(vec![(Value::Uint(1), Value::Bytes(spec("the song").to_vec())), (Value::Uint(2), Value::Bytes(spec("the song's locked bytes").to_vec()))]), None, None);
            lab.w.add(&x)
        };
        let proof = b"a payment for the song".to_vec();
        let incoming = {
            let r = Fin::Receipt(Receipt {
                rail,
                proof: proof.clone(),
                payer,
                payee: svc.id,
                amount: Amount { unit: spec("a unit"), value: 1000 },
                fulfils: song,
                previous: None,
                forward: None,
                batch: None,
                purchase: Some(Purchase { agreement: k1, line: k1 }),
            });
            let a = lab.w.everyday_act(&mut svc, mirs().money, 2, r.to_map(), None, None);
            lab.w.add(&a)
        };
        // The service's receipt carries the rail's valid answer.
        lab.rail_valid.push((incoming, mor_core::money::PaidAt::Flow(ptr)));
        RoleLab { lab, svc, fan, incoming, k1, song, ptr, rail, proof, sa }
    }

    /// A claim for the same payment by `who`, acknowledging `acks`; `valid`:
    /// the rail answered valid for it (the commitment recomputed from it,
    /// its signer as payer, matches), as the caller states it; otherwise
    /// the rail refused it, or was not asked.
    fn claim(&mut self, who: Option<&mut Person>, acks: Vec<Hash>, valid: bool) -> Hash {
        use mor_core::money::{Amount, Claim, Payload as Fin, Purchase};
        let c = Fin::Claim(Claim {
            rail: self.rail,
            proof: self.proof.clone(),
            payee: self.svc.id,
            amount: Amount { unit: spec("a unit"), value: 1000 },
            fulfils: self.song,
            disagrees: None,
            referral: None,
            refund: None,
            anonymous: None,
            purchase: Some(Purchase { agreement: self.k1, line: self.k1 }),
            previous: None,
        });
        let who = match who {
            Some(p) => p,
            None => &mut self.fan,
        };
        let a = self.lab.w.everyday_act(who, mirs().money, 3, c.to_map(), None, Some(sorted(acks)));
        let id = self.lab.w.add(&a);
        if valid {
            self.lab.rail_valid.push((id, mor_core::money::PaidAt::Flow(self.ptr)));
        }
        id
    }

    /// The receivers whose role share the split leaves unevidenced, for a
    /// role payout to `to` with `evidence`; `told`: the verifier read
    /// `transport` as the relay transport cMIP.
    fn unevidenced(&mut self, to: Hash, evidence: Hash, told: Option<Hash>) -> Vec<Hash> {
        let ids = self.lab.ids();
        let payouts = vec![
            line_payout(ids[ANA], 360, self.k1),
            line_payout(ids[BEN], 270, self.k1),
            line_payout(ids[CY], 270, self.k1),
            agreements::Payout { receiver: to, amount: 100, stake: None, role: Some("a helper".into()), evidence: Some(evidence), fee_module: None, rail_fee: None, ..Default::default() },
        ];
        let s = agreements::Split { receipt: self.incoming, payouts, cmip: spec("a split cMIP"), publication: self.sa, tally: None, number: None, ..Default::default() };
        let x = self.lab.w.private_act(&mut self.svc, mirs().agreements, agreements::types::SPLIT, s.to_map(), None, ids);
        let mut v = self.lab.view();
        v.delivery_records.extend(told);
        v.split(&x).unwrap().unevidenced
    }

    /// A record of `object` signed by `who` under `spec_`, type 0.
    fn record(&mut self, who: &mut Person, spec_: Hash, object: Hash) -> Hash {
        let p = vec![(Value::Uint(0), Value::Bytes(object.to_vec())), (Value::Uint(1), Value::Uint(4096)), (Value::Uint(2), Value::Bytes(vec![1; 32]))];
        let a = self.lab.w.everyday_act(who, spec_, 0, p, None, None);
        self.lab.w.add(&a)
    }
}

/// F193, decided by Nobody, allegedly, 10 October 2026 ("Yes, the loss is
/// minimal"): only the payer the payment's own commitment names (an
/// identity, a bare key, or nobody) acknowledges a delivery record: a claim
/// whose rail proof carries the commitment recomputed from it, its signer
/// as payer. Never the payer a receipt names: the split service writes it.
#[test]
fn f193_only_the_payer_the_payment_commits_to_acknowledges_a_delivery() {
    let transport = spec("the relay transport cMIP, draft 3");
    let locked = spec("the song's locked bytes");
    // The fan committed to their identity, and acknowledges: it counts.
    let mut l = RoleLab::new(false);
    let mut relay = l.lab.w.genesis("a relay's operator", vec![own_home()], None, None);
    let served = l.record(&mut relay, transport, locked);
    l.claim(None, vec![served], true);
    assert!(l.unevidenced(relay.id, served, Some(transport)).is_empty(), "the committed payer's claim acknowledges: it counts");
    // The receipt, which the service writes, names the fan as payer; the
    // payment committed to nobody (the buyer stayed anonymous), so the
    // rail refuses the fan's claim: it acknowledges nothing.
    let mut l = RoleLab::new(true);
    let mut relay = l.lab.w.genesis("a relay's operator", vec![own_home()], None, None);
    let served = l.record(&mut relay, transport, locked);
    l.claim(None, vec![served], false);
    assert_eq!(l.unevidenced(relay.id, served, Some(transport)), vec![relay.id], "a claim the payment did not commit to acknowledges nothing, whoever the receipt names");
}

/// QG3, decided by Nobody, allegedly, 9 October 2026 ("Agreed"): any act
/// offered as a relay's evidence for its role share counts only when the
/// committed payer's claim acknowledges it, whatever cMIP defines it: a
/// verifier not told which specification is the relay transport cMIP
/// gives the same answer.
#[test]
fn qg3_any_act_offered_as_evidence_needs_the_payers_acknowledgement() {
    let transport = spec("the relay transport cMIP, draft 3");
    let mut l = RoleLab::new(false);
    let mut relay = l.lab.w.genesis("a relay's operator", vec![own_home()], None, None);
    let served = l.record(&mut relay, transport, spec("the song's locked bytes"));
    assert_eq!(l.unevidenced(relay.id, served, None), vec![relay.id], "not told: the relay's own word is still nothing");
    assert_eq!(l.unevidenced(relay.id, served, Some(transport)), vec![relay.id]);
    l.claim(None, vec![served], true);
    assert!(l.unevidenced(relay.id, served, None).is_empty(), "acknowledged: every verifier counts it");
    assert!(l.unevidenced(relay.id, served, Some(transport)).is_empty());
}

/// F194, decided by Nobody, allegedly, 10 October 2026 ("Yes, then it is a
/// question of good practice from clients devs"): no service is paid on its
/// own use record alone. A service the payer chose is paid by a role share
/// only when the committed payer acknowledges its record (the relay's
/// rule); one evidenced only by its own record is not paid.
#[test]
fn f194_no_service_is_paid_on_its_own_record_alone() {
    let mut l = RoleLab::new(false);
    let mut carla = l.lab.w.genesis("Carla, who runs a transcoding service", vec![own_home()], None, None);
    let used = l.record(&mut carla, spec("a transcoding service's use record"), spec("the song's locked bytes"));
    assert_eq!(l.unevidenced(carla.id, used, None), vec![carla.id], "her own record alone pays her nothing");
    l.claim(None, vec![used], true);
    assert!(l.unevidenced(carla.id, used, None).is_empty(), "the payer who chose it acknowledges: paid");
}

/// F195, decided by Nobody, allegedly, 10 October 2026 ("Good"): a
/// resignation is spent by any later version its signer signed that names
/// them again, whether or not it was ever registered; once spent, no line
/// registers it, and no rollback either.
#[test]
fn f195_a_resignation_never_registered_is_spent_by_coming_back() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let col = lab.col.id;
    let all = sorted(lab.ids());
    // Ben resigns, naming the founding agreement; it is never registered.
    let mut ben = lab.m[BEN].clone();
    let old = lab.resign_from(&mut ben, f, None);
    lab.m[BEN] = ben;
    // Later, a constitutional clone every member signs, Ben among them.
    let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|t| t.text = "A new constitution.".into());
    let later = lab.propose(ANA, &t);
    let s: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &later)).collect();
    lab.rotate(Some((later, s)), &[0]);
    // Whoever holds the signing key registers the old resignation now.
    lab.record(0, None, &[], vec![old], later);
    let n = lab.view().next_voices(&col, &Power::Constitutional, &[]).unwrap().unwrap();
    assert_eq!(sorted(n.voices), all, "spent: Ben's voice remains");
    assert!(lab.view().published_resignations(&col).unwrap().iter().all(|d| d.act != old), "not shown as a resignation to come");
    // A resignation Ben signs after the later version counts.
    let mut ben = lab.m[BEN].clone();
    let again = lab.resign_from(&mut ben, later, None);
    lab.m[BEN] = ben;
    lab.record(0, None, &[], vec![again], later);
    let n = lab.view().next_voices(&col, &Power::Constitutional, &[]).unwrap().unwrap();
    assert!(!n.voices.contains(&lab.ids()[BEN]));
}

/// A broken collective that took a payment following the price tag of a
/// publication it signed in its broken stretch, from `payer` (as the
/// receipt names it): owed back (rule 93). Returns the lab, the
/// collective, the receipt, that tag and the broken act.
fn owed_back_lab(payer: Option<mor_core::money::Payer>, proof: &[u8]) -> (Lab, Hash, Hash, Hash, Hash) {
    let (lab, label, owed, k1, rot1, _) = owed_back_lab_with(|_| (payer, None), proof);
    (lab, label, owed, k1, rot1)
}

/// [`owed_back_lab`], the payer made in the lab first: `make` gives the
/// payer the receipt names, and the person, where there is one.
fn owed_back_lab_with(make: impl FnOnce(&mut Lab) -> (Option<mor_core::money::Payer>, Option<Person>), proof: &[u8]) -> (Lab, Hash, Hash, Hash, Hash, Option<Person>) {
    owed_back_lab_terms(&|_| {}, make, proof)
}

/// [`owed_back_lab_with`], the founding terms shaped by `f`.
fn owed_back_lab_terms(f: &dyn Fn(&mut Terms), make: impl FnOnce(&mut Lab) -> (Option<mor_core::money::Payer>, Option<Person>), proof: &[u8]) -> (Lab, Hash, Hash, Hash, Hash, Option<Person>) {
    use mor_core::money::{Amount, Payload as Fin, Purchase, Receipt};
    let mut lab = Lab::new(f);
    let (payer, person) = make(&mut lab);
    let label = lab.col.id;
    let bake = lab.publish(0);
    lab.sign(ANA, &bake);
    let (_, _, _, rot1) = break_by_lost_record(&mut lab);
    let f = lab.founding;
    let (_, k1) = self_sale(&mut lab, 0, vec![agreements::Sold::Bake(bake)], 7);
    let r = Fin::Receipt(Receipt {
        rail: spec("a rail Module"),
        proof: proof.to_vec(),
        payer,
        payee: label,
        amount: Amount { unit: spec("a unit"), value: 7 },
        fulfils: k1,
        previous: None,
        forward: None,
        batch: None,
        purchase: Some(Purchase { agreement: f, line: f }),
    });
    let a = lab.w.everyday_act(&mut lab.c[0], mirs().money, 2, r.to_map(), None, None);
    let owed = lab.w.add(&a);
    assert_eq!(common::stand_in_answers(lab.view()).owed_back(&label).unwrap().len(), 1);
    (lab, label, owed, k1, rot1, person)
}

/// A payer with an identity, made in the lab.
fn patron_pays(lab: &mut Lab) -> (Option<mor_core::money::Payer>, Option<Person>) {
    let p = lab.w.genesis("a patron", vec![own_home()], None, None);
    (Some(mor_core::money::Payer::Identity(p.id)), Some(p))
}

/// The payer's own claim on the payment owed back (Money type 3), naming
/// a refund rail (key 7) where given, citing `cites`.
fn payers_claim_on(lab: &mut Lab, payer: &mut Person, label: Hash, owed_proof: &[u8], k1: Hash, refund: Option<&[u8]>, cites: Option<Vec<Object>>) -> Hash {
    use mor_core::money::{Amount, Claim, Payload as Fin, Purchase, Rail};
    let c = Fin::Claim(Claim {
        rail: spec("a rail Module"),
        proof: owed_proof.to_vec(),
        payee: label,
        amount: Amount { unit: spec("a unit"), value: 7 },
        fulfils: k1,
        disagrees: None,
        referral: None,
        refund: refund.map(|a| Rail { module: spec("a rail Module"), address: a.to_vec() }),
        anonymous: None,
        purchase: Some(Purchase { agreement: lab.founding, line: lab.founding }),
        previous: None,
    });
    let a = lab.w.everyday_act(payer, mirs().money, 3, c.to_map(), cites, None);
    lab.w.add(&a)
}

/// QG2, decided by Nobody, allegedly, 9 October 2026 ("Agreed"): money
/// owed back follows the debt rule exactly: to the refund rail the payer's
/// own claim on the payment names (key 7), where it names one; otherwise to
/// the pointer Money rule 14 selects from the payer's own acts on that
/// payment, or the payer's pointer in force where there is none; the
/// payer's own receipt counts wherever the money went.
#[test]
fn qg2_money_owed_back_follows_the_debt_rule() {
    use mor_core::money::PaidAt;
    let unit = spec("a unit");
    // The payer's claim names a refund rail: only a repayment there counts.
    let (mut lab, label, owed, k1, _, patron) = owed_back_lab_with(patron_pays, b"gift");
    let mut patron = patron.unwrap();
    let pid = patron.id;
    let node = pointer_of(&mut lab.w, &mut patron, 1, None, &[b"the patron's node"]);
    let own = payers_claim_on(&mut lab, &mut patron, label, b"gift", k1, Some(b"the patron's refund address"), None);
    let mut payer = lab.c[0].clone();
    let to_node = payment(&mut lab, &mut payer, true, pid, owed, unit, 7, b"back to the pointer");
    lab.rail_valid.push((to_node, PaidAt::Flow(node)));
    lab.c[0] = payer.clone();
    assert_eq!(common::stand_in_answers(lab.view()).owed_back(&label).unwrap().len(), 1, "the payer's claim names a refund rail: a repayment elsewhere repays nothing");
    let to_rail = payment(&mut lab, &mut payer, true, pid, owed, unit, 7, b"back to the refund rail");
    lab.rail_valid.push((to_rail, PaidAt::Flow(own)));
    lab.c[0] = payer;
    assert!(common::stand_in_answers(lab.view()).owed_back(&label).unwrap().is_empty(), "repaid where the payer's own claim said");
}

/// Freeze suite v21, 7w, "The debt rule" (QG2), with Agreements draft 11,
/// rule 11 (new in draft 11, F255): a refund paid to the refund rail the
/// payer's own claim names counts only up to the payer's vault limit for
/// its unit; above it, only once it reaches the payer's vault. A payer
/// whose vault lets 5 units to the flow is owed 7: the 7 paid to the
/// refund rail repays nothing; paid to the vault, it repays. With a limit
/// of 10, the refund rail repays it, as before F255.
#[test]
fn f255_the_vault_limit_protects_a_refund_to_the_refund_rail() {
    use mor_core::money::{vault_declaration, PaidAt, VaultEntry};
    let unit = spec("a unit");
    for (limit, rail_repays) in [(5u64, false), (10, true)] {
        let with_vault = |lab: &mut Lab| {
            let v = VaultEntry { unit: spec("a unit"), rail_module: spec("a rail Module"), source: b"the patron's vault".to_vec(), limit };
            let p = lab.w.genesis_with("a patron with a vault", vec![own_home()], None, None, Some(vec![vault_declaration(&mirs().money, &[v])]), 3);
            (Some(mor_core::money::Payer::Identity(p.id)), Some(p))
        };
        let (mut lab, label, owed, k1, _, patron) = owed_back_lab_with(with_vault, b"gift");
        let mut patron = patron.unwrap();
        let pid = patron.id;
        let own = payers_claim_on(&mut lab, &mut patron, label, b"gift", k1, Some(b"the patron's refund address"), None);
        let mut payer = lab.c[0].clone();
        let to_rail = payment(&mut lab, &mut payer, true, pid, owed, unit, 7, b"back to the refund rail");
        lab.rail_valid.push((to_rail, PaidAt::Flow(own)));
        lab.c[0] = payer.clone();
        assert_eq!(common::stand_in_answers(lab.view()).owed_back(&label).unwrap().is_empty(), rail_repays, "limit {limit}: the refund rail repays 7 only within the vault's limit (F255)");
        if !rail_repays {
            let to_vault = payment(&mut lab, &mut payer, true, pid, owed, unit, 7, b"back to the vault");
            lab.rail_valid.push((to_vault, PaidAt::VaultEntry(pid, 0)));
            lab.c[0] = payer;
            assert!(common::stand_in_answers(lab.view()).owed_back(&label).unwrap().is_empty(), "above the limit, repaid once it reaches the vault");
        }
    }
}

/// QG2, the second branch: the payer's own act on the payment holds an
/// earlier pointer; a repayment to a newer one counts for nothing, as for
/// a debt (Money rule 14: the selected wallet or an older one, never a
/// newer one); with no act of theirs on it, the pointer in force.
#[test]
fn qg2_the_pointer_the_payers_own_acts_hold() {
    use mor_core::money::PaidAt;
    let unit = spec("a unit");
    let (mut lab, label, owed, k1, _, patron) = owed_back_lab_with(patron_pays, b"gift");
    let mut patron = patron.unwrap();
    let pid = patron.id;
    let v1 = pointer_of(&mut lab.w, &mut patron, 1, None, &[b"the old node"]);
    payers_claim_on(&mut lab, &mut patron, label, b"gift", k1, None, Some(vec![Object { chain: v1, predecessor: v1 }]));
    let v2 = pointer_of(&mut lab.w, &mut patron, 2, Some(v1), &[b"a newer node"]);
    let mut payer = lab.c[0].clone();
    let x = payment(&mut lab, &mut payer, true, pid, owed, unit, 7, b"to the newer");
    lab.rail_valid.push((x, PaidAt::Flow(v2)));
    lab.c[0] = payer.clone();
    assert_eq!(common::stand_in_answers(lab.view()).owed_back(&label).unwrap().len(), 1, "a newer pointer than the payer's own act holds: nothing");
    let y = payment(&mut lab, &mut payer, true, pid, owed, unit, 7, b"to the one held");
    lab.rail_valid.push((y, PaidAt::Flow(v1)));
    lab.c[0] = payer;
    assert!(common::stand_in_answers(lab.view()).owed_back(&label).unwrap().is_empty());
}

/// QG1, decided by Nobody, allegedly, 9 October 2026: a refund owed to a
/// bare key (Money rule 10a) is repaid once the collective's claim
/// carries the rail's proof that the money reached where the claim signed
/// with that key said (key 7).
#[test]
fn qg1_a_refund_to_a_bare_key_is_repaid_by_the_collectives_claim() {
    use mor_core::money::{Amount, Anonymous, Citations, Claim, PaidAt, Payer, Payload as Fin, Purchase, Rail};
    let key = SchnorrKey::from_secret(&spec("a one-time key")).unwrap();
    let bare = mor_core::identity::SigningKey { scheme: mor_core::act::Scheme::Founding(1), key: key.public().to_vec() };
    let (mut lab, label, owed, k1, _) = owed_back_lab(Some(Payer::Key(bare.clone())), b"anonymous gift");
    // The payer's claim, signed by a one-time identity, carrying the key's
    // signature and the refund rail.
    let mut once = lab.w.genesis("a one-time identity", vec![own_home()], None, None);
    let mut c = Claim {
        rail: spec("a rail Module"),
        proof: b"anonymous gift".to_vec(),
        payee: label,
        amount: Amount { unit: spec("a unit"), value: 7 },
        fulfils: k1,
        disagrees: None,
        referral: None,
        refund: Some(Rail { module: spec("a rail Module"), address: b"the key's refund address".to_vec() }),
        anonymous: None,
        purchase: Some(Purchase { agreement: lab.founding, line: lab.founding }),
        previous: None,
    };
    c.anonymous = Some(Anonymous { key: bare, sig: key.sign(&c.anonymous_message(&Citations::default()), &[0; 32]).sig });
    let a = lab.w.everyday_act(&mut once, mirs().money, 3, Fin::Claim(c).to_map(), None, None);
    let kc = lab.w.add(&a);
    assert_eq!(common::stand_in_answers(lab.view()).owed_back(&label).unwrap().len(), 1);
    // The collective's claim, naming the payment owed back, the rail's
    // proof showing it reached the refund address the key's claim gave.
    let mut payer = lab.c[0].clone();
    let back = payment(&mut lab, &mut payer, true, once.id, owed, spec("a unit"), 7, b"back to the key");
    lab.c[0] = payer;
    assert_eq!(common::stand_in_answers(lab.view()).owed_back(&label).unwrap().len(), 1, "no rail answer: nothing");
    lab.rail_valid.push((back, PaidAt::Flow(kc)));
    assert!(common::stand_in_answers(lab.view()).owed_back(&label).unwrap().is_empty(), "repaid where the key's claim said");
}

/// The rollback of an `owed_back_lab` collective, then a closing every
/// member signs, leaving `open` open; the closing's reading, with
/// `lapsed` notices stated lapsed.
fn close_with(lab: &mut Lab, label: Hash, rot1: Hash, open: Vec<agreements::OpenOwed>, lapsed: &[Hash]) -> agreements::ClosingEval {
    let f = lab.founding;
    if lab.view().broken(&label).unwrap().is_some() {
        let same = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|_| {});
        let r = lab.propose(ANA, &same);
        let rs: Vec<Hash> = [ANA, BEN, CY].iter().map(|w| lab.sign(*w, &r)).collect();
        roll_back(lab, r, &rs, rot1, &[]);
    }
    let r = lab.view().current(&label).unwrap().unwrap().agreement;
    let c = agreements::Closing { agreement: r, collective: label, open };
    let eo = ending_obj(lab, r, label);
    let x = agreements_act(&mut lab.w, &mut lab.m[ANA], agreements::types::CLOSING, c.to_map(), eo);
    lab.end(ANA, &x);
    lab.end(BEN, &x);
    lab.end(CY, &x);
    let mut v = lab.view();
    v.notices_lapsed.extend(lapsed.iter().copied());
    v.closing(&x).unwrap()
}

/// QG1, decided by Nobody, allegedly, 9 October 2026: money owed back to
/// nobody (a payment that committed no key: unclaimable, Money rule 10a)
/// stays open and visible, but does not block a closing: the closing act
/// names every such obligation it leaves open (field 4).
#[test]
fn qg1_money_owed_to_nobody_does_not_block_a_closing_that_names_it() {
    let owed_why = |e: &agreements::ClosingEval| e.why.iter().any(|w| w.contains("owed back"));
    let (mut lab, label, owed, _, rot1) = owed_back_lab(None, b"an anonymous tip");
    let e = close_with(&mut lab, label, rot1, vec![], &[]);
    assert!(owed_why(&e), "not named in the closing: it blocks ({:?})", e.why);
    let (mut lab, label, owed2, _, rot1) = owed_back_lab(None, b"an anonymous tip");
    let _ = owed;
    let e = close_with(&mut lab, label, rot1, vec![agreements::OpenOwed { payment: owed2, notice: None, holder: None }], &[]);
    assert!(!owed_why(&e), "named, owed to nobody: it does not block ({:?})", e.why);
    assert_eq!(common::stand_in_answers(lab.view()).owed_back(&label).unwrap().len(), 1, "and it stays visible");
}

/// F197, decided by Nobody, allegedly, 10 October 2026 ("Yes, exactly"):
/// before closing, a collective owing money back to a payer who gave no
/// address sends that payer a notice sealed to their identity, with a
/// deadline on a time reference; once it lapses with no address given, the
/// collective may close, the debt named in the closing act, visible and
/// unpaid. A holder outliving the closing may be named (a cMIP's role):
/// shown, not required.
#[test]
fn f197_a_notice_with_a_deadline_then_the_collective_may_close() {
    use mor_core::money::Payer;
    let owed_why = |e: &agreements::ClosingEval| e.why.iter().any(|w| w.contains("owed back"));
    let carla = spec("Carla, a payer with no address");
    // Sealed to the payer and to every member (rule 35a), or public.
    let notice = |lab: &mut Lab, owed: Hash, to: Vec<Hash>| {
        let to: Vec<Hash> = to.into_iter().chain(lab.ids()).collect();
        let n = agreements::Notice { payment: owed, deadline: (spec("a block height reference"), Value::Uint(900_000)) };
        let mut dev = lab.c[0].clone();
        let x = lab.w.private_act(&mut dev, mirs().agreements, agreements::types::NOTICE, n.to_map(), obj(owed), to);
        lab.c[0] = dev;
        x
    };
    // Named with no notice: it blocks.
    let (mut lab, label, owed, _, rot1) = owed_back_lab(Some(Payer::Identity(carla)), b"a penny");
    let e = close_with(&mut lab, label, rot1, vec![agreements::OpenOwed { payment: owed, notice: None, holder: None }], &[]);
    assert!(owed_why(&e), "{:?}", e.why);
    // A notice sealed to Carla, its deadline not passed: it blocks.
    let (mut lab, label, owed, _, rot1) = owed_back_lab(Some(Payer::Identity(carla)), b"a penny");
    let n = notice(&mut lab, owed, vec![carla]);
    let open = vec![agreements::OpenOwed { payment: owed, notice: Some(n), holder: None }];
    let e = close_with(&mut lab, label, rot1, open.clone(), &[]);
    assert!(owed_why(&e), "the deadline has not passed: {:?}", e.why);
    // Lapsed, as the time reference says: the collective may close.
    let (mut lab, label, owed, _, rot1) = owed_back_lab(Some(Payer::Identity(carla)), b"a penny");
    let n = notice(&mut lab, owed, vec![carla]);
    let holder = spec("a holder that outlives the closing");
    let open = vec![agreements::OpenOwed { payment: owed, notice: Some(n), holder: Some(holder) }];
    let e = close_with(&mut lab, label, rot1, open, &[n]);
    assert!(!owed_why(&e), "{:?}", e.why);
    assert_eq!(e.closing.open[0].holder, Some(holder), "the holder chosen is shown");
    assert_eq!(common::stand_in_answers(lab.view()).owed_back(&label).unwrap().len(), 1, "the debt stays visible, unpaid");
    // A notice sealed to someone else only reached nobody: it blocks.
    let (mut lab, label, owed, _, rot1) = owed_back_lab(Some(Payer::Identity(carla)), b"a penny");
    let n = notice(&mut lab, owed, vec![spec("someone else")]);
    let e = close_with(&mut lab, label, rot1, vec![agreements::OpenOwed { payment: owed, notice: Some(n), holder: None }], &[n]);
    assert!(owed_why(&e), "not sealed to the payer: {:?}", e.why);
}

// ---------------------------------------------------------------------------
// Fable's review of "EXPLORED, NOT DECIDED: a forked deal is broken, like a
// collective" (`docs/reviews/forked-deal-broken-review.md`, 10 October
// 2026). The shape is not built; these tests pin what the core answers
// today under F192, at the four places where the explored shape would
// answer differently. Each passes as the code stands. If the shape is ever
// built, the ones its text says must flip are named in the review.
// ---------------------------------------------------------------------------

/// Review question 2 (the stated cost). Today: a whole branch made at the
/// split by every party, hidden, and revealed after the settlement reopens
/// nothing (F192: "a whole branch the settlement never saw"). The explored
/// shape says the same branch "breaks the deal again": the deal would fall
/// back to its reference, and everything written into the repair would
/// need signing again. The verifier has no clock: nothing in `w` says when
/// C was made, which is the point.
#[test]
fn review_fdb_1_today_a_hidden_sibling_revealed_after_a_settlement_reopens_nothing() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A: Ben's share raised.", None);
    let b1 = l.version(d, "B: a retry Ben's client signed again.", None);
    // C: a third complete version of the reference, in Ana's drawer.
    let c1 = l.version(d, "C: another retry, kept back.", None);
    let s = l.version(a1, "Repaired for A, naming B, the only other branch anyone could see.", Some(b1));
    let s2 = l.version(s, "Life goes on under the repair: Ben delivers.", None);
    let before = held_without(&l.w, &[c1]);
    assert_eq!(common::stand_in_payments(AgreementsView::new(&before, mirs())).version_in_force(&d).unwrap(), s2, "before C surfaces: the repaired line is in force");
    // Ana publishes C.
    assert_eq!(l.in_force().unwrap(), s2, "today, under F192: C reopens nothing, Ben's raise stands");
    assert!(view(&l.w).deal_fork(&d).unwrap().is_none(), "today: not forked, not broken");
    // Under the explored shape the two lines above would read: in force =
    // d (the reference), deal broken, and Ana may refuse every repair.
}

/// Review question 1 (the new hole: the asymmetry). Today a version the
/// settlement's signers could not see loses whatever its parent is: a
/// child grown on the dropped branch (B2) and a sibling at the reference
/// (C1) are treated alike. The explored shape treats them differently:
/// B2 "grown on a closed tip counts for nothing", C1 "breaks the deal
/// again". Whoever hides a version therefore makes it a sibling, never a
/// child, and the shape's own protection against growth is sidestepped.
#[test]
fn review_fdb_2_today_a_hidden_child_and_a_hidden_sibling_lose_alike() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let b2 = l.version(b1, "B grows: hidden child of the dropped tip.", None);
    let c1 = l.version(d, "C: hidden sibling at the reference.", None);
    let s = l.version(a1, "Repaired for A, naming B1.", Some(b1));
    let before = held_without(&l.w, &[b2, c1]);
    assert_eq!(common::stand_in_payments(AgreementsView::new(&before, mirs())).version_in_force(&d).unwrap(), s);
    // Both surface.
    assert_eq!(l.in_force().unwrap(), s, "today: the hidden child and the hidden sibling lose alike (F192)");
    assert!(view(&l.w).deal_fork(&d).unwrap().is_none());
    // Under the explored shape: B2 counts for nothing (closed tip), and C1
    // re-breaks the deal to d. Same signatures, same ignorance of the
    // settlers, opposite outcomes, chosen by whoever hid the version.
}

/// Review question 8 (what the common case carries) and the pre-repair
/// escape hatch, which exists today and is DQ5's stated cost: a deal that
/// never visibly forked runs A1, A2, A3; a sibling of A1 surfaces; the
/// reference is in force and a party who refuses to settle keeps it there.
/// Today this ends with one settlement naming the sibling, and acts under
/// A3 kept counting meanwhile (A4). The explored shape keeps the first
/// half, voids A2 and A3 as versions, and never gives the second half the
/// finality F192 gives it (test 1).
#[test]
fn review_fdb_3_before_any_settlement_a_hidden_sibling_already_sends_the_deal_to_its_reference() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A1.", None);
    let a2 = l.version(a1, "A2.", None);
    let a3 = l.version(a2, "A3: Ben's share raised for more work.", None);
    let c1 = l.version(d, "C1: a sibling of A1, from a device out of step at the time.", None);
    let before = held_without(&l.w, &[c1]);
    assert_eq!(common::stand_in_payments(AgreementsView::new(&before, mirs())).version_in_force(&d).unwrap(), a3, "a deal that never visibly forked: A3 in force");
    // C1 surfaces, however late.
    assert_eq!(l.in_force().unwrap(), d, "today: forked at d, the reference in force (A1 beside A4)");
    let f = view(&l.w).deal_fork(&d).unwrap().expect("forked");
    assert!(f.tangled.is_none(), "a simple fork, not tangled");
    assert_eq!(f.branches.len(), 2);
    // A new version on A3 changes nothing while the fork stands; Ana can
    // hold the deal here by refusing to settle (DQ5's stated cost).
    let a4 = l.version(a3, "A4, signed by both without naming C1.", None);
    assert_eq!(l.in_force().unwrap(), d, "a version that does not name the other tip settles nothing");
    // One settlement naming C1 ends it, for good (F192), under today's rule.
    let s = l.version(a4, "Settled for A, naming C1.", Some(c1));
    assert_eq!(l.in_force().unwrap(), s);
    assert!(view(&l.w).deal_fork(&d).unwrap().is_none());
}

/// Review question 1 (a repair of a repair) and question 3. Today a second
/// settling version made from the reference, naming the settled line's tip
/// as dropped, holds the first settlement in its history, is after it, and
/// changes nothing: a settlement is final (A3, F192). In the explored
/// shape a repair is a complete version whose parent is the reference and
/// which closes tips; a second such version closing the first repair's
/// tip is, by the shape's own test ("two complete versions naming the same
/// parent"), either a new break or an undo of a valid repair. The texts
/// have the first answer for a collective (F185: a rollback naming an act
/// Agreements do not read as broken is itself a broken act) and nothing yet for
/// a deal, where no single act is the broken one.
#[test]
fn review_fdb_4_today_a_second_settlement_from_the_reference_naming_the_first_changes_nothing() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let s = l.version(a1, "Repaired for A, naming B.", Some(b1));
    let s2 = l.version(s, "Carla's work written in under the repair.", None);
    assert_eq!(l.in_force().unwrap(), s2);
    // A "repair of the repair": from the reference, closing the repaired
    // line's tip and B's, signed by both parties of the reference.
    let r2 = l.version_full(d, "From the reference again, closing S2 and B1 as mistakes.", vec![s2, b1], vec![]);
    assert_eq!(view(&l.w).agreement(&r2).unwrap().exists, Some(true), "complete: every party of the reference signed it");
    assert_eq!(l.in_force().unwrap(), s2, "today: it holds the first settlement in its history, is after it, and changes nothing");
    assert!(view(&l.w).deal_fork(&d).unwrap().is_none(), "today: the deal is neither forked nor broken by it");
    // Under the explored shape, r2 is a third complete child of d beside a1
    // and b1 (closed) and s's line: the deal reads as broken again or r2
    // undoes s. Neither is what A3 decided.
}

// ---------------------------------------------------------------------------
// Step 12b, the open formats (10 October 2026): `docs/formats-build-12b.md`.
// Each test was written first and seen to fail for the reason the decision
// gives. Test identities only.
// ---------------------------------------------------------------------------

/// F208, decided by Nobody, allegedly, 10 October 2026 ("Agreed"): F197
/// applies to a one-time key too. A notice addressed to the key, published
/// naming the payment (a bare signing key cannot be sealed to: the
/// mechanic, the build's), with a deadline: once it lapses with no address
/// given, the closing names the debt and does not wait. Without a notice,
/// or before the deadline, the debt still blocks.
#[test]
fn f208_a_one_time_key_is_noticed_and_never_blocks_a_closing_for_good() {
    use mor_core::money::Payer;
    let owed_why = |e: &agreements::ClosingEval| e.why.iter().any(|w| w.contains("owed back"));
    let key = SchnorrKey::from_secret(&spec("a one-time key, F208")).unwrap();
    let bare = mor_core::identity::SigningKey { scheme: mor_core::act::Scheme::Founding(1), key: key.public().to_vec() };
    let public_notice = |lab: &mut Lab, owed: Hash| {
        let n = agreements::Notice { payment: owed, deadline: (spec("a block height reference"), Value::Uint(900_000)) };
        let mut dev = lab.c[0].clone();
        let a = lab.w.everyday_act(&mut dev, mirs().agreements, agreements::types::NOTICE, n.to_map(), obj(owed), None);
        let x = lab.w.add(&a);
        lab.c[0] = dev;
        x
    };
    // Named, no notice: it blocks.
    let (mut lab, label, owed, _, rot1) = owed_back_lab(Some(Payer::Key(bare.clone())), b"a key's penny");
    let e = close_with(&mut lab, label, rot1, vec![agreements::OpenOwed { payment: owed, notice: None, holder: None }], &[]);
    assert!(owed_why(&e), "{:?}", e.why);
    // A public notice, its deadline not passed: it blocks.
    let (mut lab, label, owed, _, rot1) = owed_back_lab(Some(Payer::Key(bare.clone())), b"a key's penny");
    let n = public_notice(&mut lab, owed);
    let e = close_with(&mut lab, label, rot1, vec![agreements::OpenOwed { payment: owed, notice: Some(n), holder: None }], &[]);
    assert!(owed_why(&e), "the deadline has not passed: {:?}", e.why);
    // Lapsed: the collective may close, the debt named and visible.
    let (mut lab, label, owed, _, rot1) = owed_back_lab(Some(Payer::Key(bare)), b"a key's penny");
    let n = public_notice(&mut lab, owed);
    let e = close_with(&mut lab, label, rot1, vec![agreements::OpenOwed { payment: owed, notice: Some(n), holder: None }], &[n]);
    assert!(!owed_why(&e), "{:?}", e.why);
    assert_eq!(common::stand_in_answers(lab.view()).owed_back(&label).unwrap().len(), 1, "the debt stays visible, unpaid");
}

/// F207, decided by Nobody, allegedly, 10 October 2026 ("Yes. If the
/// resignation needs it, the resignation gets it."): a resignation names
/// the drafts its signer had signed and leaves behind; a version it names
/// never brings its signer back, whichever line puts it in force. A draft
/// it fails to name is her stated cost (F195): it brings her back.
#[test]
fn f207_a_resignation_names_the_drafts_it_leaves_behind() {
    let run = |named: bool| {
        let mut lab = Lab::new(&|_| {});
        let f = lab.founding;
        let col = lab.col.id;
        // A constitutional draft every member signs, Cy among them.
        let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|t| t.text = "A draft Cy signed.".into());
        let draft = lab.propose(ANA, &t);
        let s: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &draft)).collect();
        for x in &s {
            lab.acknowledge(0, *x);
        }
        // Cy resigns; a first line registers it, putting nothing in force.
        let mut cy = lab.m[CY].clone();
        let res = lab.resign_leaving(&mut cy, f, None, if named { vec![draft] } else { vec![] });
        lab.m[CY] = cy;
        lab.record(0, None, &[], vec![res], f);
        let n0 = lab.view().next_voices(&col, &Power::Constitutional, &[]).unwrap().unwrap();
        assert!(!n0.voices.contains(&lab.ids()[CY]), "registered: Cy has left");
        // A later line, a rotation, declares the draft (rule 37).
        lab.rotate(Some((draft, s)), &[0]);
        assert_eq!(lab.view().current(&col).unwrap().unwrap().agreement, draft);
        let n = lab.view().next_voices(&col, &Power::Constitutional, &[]).unwrap().unwrap();
        n.voices.contains(&lab.ids()[CY])
    };
    assert!(!run(true), "named in her resignation: the draft never brings her back");
    assert!(run(false), "not named: her stated cost, the draft brings her back (F195)");
}

/// F207's stepping-down half ("a resignation (or a stepping down) names
/// the drafts its signer had signed and leaves behind"): a stepping down
/// from an area names the drafts its signer leaves behind; a version it
/// names never gives her the area back, whichever line puts it in force.
/// A draft it fails to name is her stated cost (F195): it gives the area
/// back.
#[test]
fn f207_a_stepping_down_names_the_drafts_it_leaves_behind() {
    let run = |named: bool| {
        let mut lab = Lab::new(&|_| {});
        let f = lab.founding;
        let ids = lab.ids();
        // A constitutional draft every member signs, Ana among them, that
        // redraws Releases (area 1) with Ana as its one holder.
        let t = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|t| {
            t.areas.as_mut().unwrap()[0].holders = vec![ids[ANA]];
            t.text = "A draft Ana signed: she runs the releases.".into();
        });
        let draft = lab.propose(BEN, &t);
        let s: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &draft)).collect();
        for x in &s {
            lab.acknowledge(0, *x);
        }
        // Ana steps down from Releases; a first line registers it, putting
        // nothing in force.
        let mut ana = lab.m[ANA].clone();
        let down = lab.resign_leaving(&mut ana, f, Some(1), if named { vec![draft] } else { vec![] });
        lab.m[ANA] = ana;
        lab.record(0, None, &[], vec![down], f);
        // A later line, a rotation, declares the draft (rule 37).
        lab.rotate(Some((draft, s)), &[0]);
        assert_eq!(lab.view().current(&lab.col.id).unwrap().unwrap().agreement, draft);
        let p = lab.publish(0);
        lab.sign(ANA, &p);
        lab.counts(&p)
    };
    assert!(!run(true), "named in her stepping down: the draft never gives her the area back");
    assert!(run(false), "not named: her stated cost, the draft gives her the area back (F195)");
}

/// Fable's formats review, 2.6, taken under the delegation (F189 (8) by
/// analogy): a request to a judge counts, and the judge's period runs, only
/// where the request is public or sealed to the judge it reaches. A
/// settlement request Ben keeps sealed to himself activates no judge: the
/// judge's settlement made on it settles nothing. Sealed to the judge, it
/// does.
#[test]
fn review_2_6_a_settlement_request_counts_only_where_it_reaches_the_judge() {
    for reaches in [false, true] {
        let (mut l, mut judges) = judged_deal(0);
        let d = l.d;
        let a1 = l.version(d, "Branch A.", None);
        let b1 = l.version(d, "Branch B.", None);
        assert_eq!(l.in_force().unwrap(), d);
        let r = agreements::SettlementRequest { reference: d };
        let to = if reaches { vec![l.ben.id, judges[0].id] } else { vec![l.ben.id] };
        let rq = l.w.private_act(&mut l.ben, mirs().agreements, agreements::types::SETTLEMENT_REQUEST, r.to_map(), obj(d), to);
        judge_settles(&mut l, &mut judges[0], rq, a1, vec![b1], vec![]);
        if reaches {
            assert_eq!(l.in_force().unwrap(), a1, "sealed to the judge: the settlement counts");
        } else {
            assert_eq!(l.in_force().unwrap(), d, "sealed to nobody but the asker: no judge was asked");
        }
    }
}

/// A work of Ana and Ben (60% / 40%), its ownership agreement on their
/// claim, a song Ana baked, and their publication of it naming a split
/// service, which signs it, and a fan: the selling side.
struct ServiceDeal {
    w: World,
    ana: Person,
    ben: Person,
    svc: Person,
    fan: Person,
    deal: Hash,
    song: Hash,
    locked: Hash,
    /// The publication (its first version).
    publication: Hash,
}

impl ServiceDeal {
    fn new() -> ServiceDeal {
        Self::with(&|_| {})
    }

    /// The deal, its publication changed by `f` before it is signed.
    fn with(f: &dyn Fn(&mut agreements::Publication)) -> ServiceDeal {
        let mut w = World::new();
        let mut ana = w.genesis("ana", vec![own_home()], None, None);
        let mut ben = w.genesis("ben", vec![own_home()], None, None);
        let mut svc = w.genesis("a split service", vec![own_home()], None, None);
        let fan = w.genesis("a fan", vec![own_home()], None, None);
        let locked = spec("the song's locked bytes, 12b");
        let work = spec("the song, 12b");
        let claim = agreements::WorkClaim { work, creators: sorted(vec![ana.id, ben.id]), commitment: None };
        let c = agreements_act(&mut w, &mut ana, agreements::types::CLAIM, claim.to_map(), None);
        sign(&mut w, &mut ben, &c);
        let t = common::ownership_terms(c, &[(ana.id, 600_000), (ben.id, 400_000)], "The song's ownership, 12b.");
        let deal = agreements_act(&mut w, &mut ana, agreements::types::TERMS, t.to_map(), None);
        sign(&mut w, &mut ana, &deal);
        sign(&mut w, &mut ben, &deal);
        let song = {
            let x = w.everyday_act(&mut ana, mirs().envelopes, 0, publication(vec![(Value::Uint(1), Value::Bytes(work.to_vec())), (Value::Uint(2), Value::Bytes(locked.to_vec()))]), None, None);
            w.add(&x)
        };
        let sid = svc.id;
        let publication = publish_under(&mut w, &mut ana, deal, sid, &mut [&mut ben, &mut svc], &|p| {
            p.sold = Some(vec![agreements::Sold::Bake(song)]);
            f(p);
        });
        ServiceDeal { w, ana, ben, svc, fan, deal, song, locked, publication }
    }

    /// A receipt for a fan's payment, in `payee`'s name, by its signer
    /// `by`, following `fulfils` and naming in field 9 the ownership
    /// agreement `purchase` at its founding version.
    fn receipt(w: &mut World, by: &mut Person, payee: Hash, payer: Hash, fulfils: Hash, purchase: Option<Hash>, proof: &[u8]) -> Hash {
        use mor_core::money::{Amount, Payer, Payload as Fin, Purchase, Receipt};
        let r = Fin::Receipt(Receipt {
            rail: spec("a rail Module"),
            proof: proof.to_vec(),
            payer: Some(Payer::Identity(payer)),
            payee,
            amount: Amount { unit: spec("a unit"), value: 1000 },
            fulfils,
            previous: None,
            forward: None,
            batch: None,
            purchase: purchase.map(|a| Purchase { agreement: a, line: a }),
        });
        let a = w.everyday_act(by, mirs().money, 2, r.to_map(), None, None);
        w.add(&a)
    }
}

/// Fable's formats review 2.1 to 2.3 (OF3 a), as the publication carries
/// them: a publication is signed by every party: the owners' side (the
/// ownership agreement, every party of it), each partner and the split
/// service; a lone seller's needs only its own; a publication is always
/// public (F215).
#[test]
fn review_2_1_to_2_3_every_party_signs_a_publication() {
    let mut l = ServiceDeal::new();
    let (deal, sid) = (l.deal, l.svc.id);
    let o = publish_under(&mut l.w, &mut l.ana, deal, sid, &mut [], &|_| {});
    let e = view(&l.w).publication(&o).unwrap();
    assert!(!e.counts && e.unsigned == vec![deal, sid], "Ana alone: neither the owners' side nor the service ({:?})", e.unsigned);
    sign(&mut l.w, &mut l.ben, &o);
    let e = view(&l.w).publication(&o).unwrap();
    assert!(!e.counts && e.unsigned == vec![sid], "the owners' side signed; the service has not");
    sign(&mut l.w, &mut l.svc, &o);
    let e = view(&l.w).publication(&o).unwrap();
    assert!(e.counts, "every party signed: {:?}", e.problems);
    assert_eq!(e.latest, vec![o]);
    // A partner signs it too.
    let mut carla = l.w.genesis("carla, a partner", vec![own_home()], None, None);
    let cid = carla.id;
    let x = publish_under(&mut l.w, &mut l.ana, deal, sid, &mut [&mut l.ben, &mut l.svc], &|p| p.partners = vec![agreements::Partner { identity: cid, share: 100_000, label: None }]);
    assert_eq!(view(&l.w).publication(&x).unwrap().unsigned, vec![cid]);
    sign(&mut l.w, &mut carla, &x);
    assert!(view(&l.w).publication(&x).unwrap().counts);
    // A lone seller (F215): her own publication counts; a sealed one never.
    let song = l.song;
    let lone = common::lone_publication(&mut l.w, &mut l.ben, &mirs(), vec![agreements::Sold::Bake(song)], None);
    assert!(view(&l.w).publication(&lone).unwrap().counts);
    let p = agreements::Publication { sold: Some(vec![agreements::Sold::Bake(song)]), owners: None, partners: vec![], service: l.ben.id, plan: common::test_plan(), words: None, time: None, until: None, refund: None, cmips: vec![], designated: None, backups: vec![], failed: None };
    let sealed = l.w.private_act(&mut l.ben, mirs().agreements, agreements::types::PUBLICATION, p.to_map(), None, vec![l.fan.id]);
    assert!(!view(&l.w).publication(&sealed).unwrap().counts, "a publication is always public (F215)");
}

/// OF4 (a), Fable's reading, as the publication carries it: a publication
/// changes by versions naming `[first, previous]`; the latest replaces the
/// earlier; one selling nothing ends it; two versions naming the same
/// previous are the seller's fork, both shown.
#[test]
fn of4_a_publications_chain_of_versions() {
    let mut l = ServiceDeal::new();
    let song = l.song;
    let first = common::lone_publication(&mut l.w, &mut l.ben, &mirs(), vec![agreements::Sold::Bake(song)], None);
    let bid = l.ben.id;
    let v = |l: &mut ServiceDeal, prev: Hash, sold: Vec<agreements::Sold>| {
        let p = agreements::Publication { sold: Some(sold), owners: None, partners: vec![], service: bid, plan: common::test_plan(), words: None, time: None, until: None, refund: None, cmips: vec![], designated: None, backups: vec![], failed: None };
        agreements_act(&mut l.w, &mut l.ben, agreements::types::PUBLICATION, p.to_map(), Some(vec![Object { chain: first, predecessor: prev }]))
    };
    let v2 = v(&mut l, first, vec![agreements::Sold::Bake(song)]);
    assert_eq!(view(&l.w).publication(&first).unwrap().latest, vec![v2]);
    let gone = v(&mut l, v2, vec![]);
    let e = view(&l.w).publication(&gone).unwrap();
    assert!(e.ends && e.counts && e.latest == vec![gone], "{:?}", e.problems);
    let other = v(&mut l, v2, vec![agreements::Sold::Bake(song)]);
    assert_eq!(view(&l.w).publication(&first).unwrap().latest, sorted(vec![gone, other]), "a fork of the seller's: both tips shown");
}

/// F215, decided by Nobody, allegedly, 10 October 2026, as the publication
/// carries it: a lone seller's publication is itself the agreement with the
/// buyer: a payment for its price tag names no ownership agreement and is
/// a purchase under it. A publication not every party signed sells
/// nothing (rule 11).
#[test]
fn f215_a_lone_sellers_publication_is_the_agreement_with_the_buyer() {
    let mut l = ServiceDeal::new();
    let (bid, fid, deal, sid) = (l.ben.id, l.fan.id, l.deal, l.svc.id);
    let song = l.song;
    let lone = common::lone_publication(&mut l.w, &mut l.ben, &mirs(), vec![agreements::Sold::Bake(song)], None);
    let tag = common::price_tag(&mut l.w, &mut l.ben, mirs().money, mor_core::money::Priced::Publication(lone), 1000, spec("a unit"), bid);
    let mut ben = l.ben.clone();
    let paid = ServiceDeal::receipt(&mut l.w, &mut ben, bid, fid, tag, None, b"a lone sale");
    let e = common::stand_in_answers(view(&l.w)).purchase(&paid).unwrap().unwrap();
    assert_eq!(e.verdict, agreements::PurchaseVerdict::Purchase, "accepted under the publication's terms");
    // A publication the owners' side did not sign sells nothing.
    let alone = publish_under(&mut l.w, &mut l.ana, deal, sid, &mut [&mut l.svc], &|_| {});
    let tag = common::price_tag(&mut l.w, &mut l.svc, mirs().money, mor_core::money::Priced::Publication(alone), 1000, spec("a unit"), sid);
    let mut svc = l.svc.clone();
    let x = ServiceDeal::receipt(&mut l.w, &mut svc, sid, fid, tag, Some(deal), b"outside");
    assert!(matches!(common::stand_in_answers(view(&l.w)).purchase(&x).unwrap().unwrap().verdict, agreements::PurchaseVerdict::NoPurchase { why } if why.contains("does not count")));
}

/// T-1, dissolved (Fable's review 6.1), as the publication carries it:
/// two ownership agreements hold stakes in one work, each on its own claim
/// (contested): the shared one of Ana and Ben, and Ana's own. Each
/// publication sells under the agreement it names; a payment for either
/// publication's price tag is a purchase under it.
#[test]
fn t1_a_purchase_under_either_agreement_holding_a_stake_in_the_work() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let fan = w.genesis("a fan", vec![own_home()], None, None);
    let work = spec("a song two agreements claim");
    let shared = owners_of(&mut w, &mut ana, &mut ben, work);
    let own = {
        let c = common::claim_alone(&mut w, &mut ana, &mirs(), work);
        let t = common::ownership_terms(c, &[(ana.id, 1_000_000)], "Ana's own.");
        let d = agreements_act(&mut w, &mut ana, agreements::types::TERMS, t.to_map(), None);
        sign(&mut w, &mut ana, &d);
        d
    };
    let aid = ana.id;
    let p_own = publish_under(&mut w, &mut ana, own, aid, &mut [], &|_| {});
    let p_shared = publish_under(&mut w, &mut ana, shared, aid, &mut [&mut ben], &|_| {});
    for (p, owners, proof) in [(p_own, own, b"under her own".as_slice()), (p_shared, shared, b"under the shared deal".as_slice())] {
        let tag = common::price_tag(&mut w, &mut ana, mirs().money, mor_core::money::Priced::Publication(p), 1000, spec("a unit"), aid);
        let paid = ServiceDeal::receipt(&mut w, &mut ana, aid, fan.id, tag, Some(owners), proof);
        assert_eq!(common::stand_in_answers(view(&w)).purchase(&paid).unwrap().unwrap().verdict, agreements::PurchaseVerdict::Purchase, "a purchase under the publication its tag names");
    }
    assert!(view(&w).work_owners(&work).unwrap().contested, "two claims on one work: contested, shown");
}

/// A plan with these shares (roles and metrics, off the top; Agreements
/// draft 12, F280) and metrics.
fn plan_of(shares: Vec<agreements::ShareRule>, metrics: Vec<agreements::Metric>) -> agreements::SplitPlan {
    agreements::SplitPlan { shares, cmip: spec("a split cMIP"), unfilled: agreements::Unfilled::Stakes, top: vec![], service_bears_rail_fees: false, max_rail_fee: None, params: None, metrics, fees: vec![] }
}

fn payout(receiver: Hash, amount: u64) -> agreements::Payout {
    agreements::Payout { receiver, amount, ..Default::default() }
}

impl ServiceDeal {
    /// A payment through the publication (fulfilling it, a tip),
    /// receipted by its split service, with the fan's claim acknowledging `acks`, its rail proof valid: the
    /// payer the payment commits to is the fan (F193).
    fn sale(&mut self, proof: &[u8], acks: Vec<Hash>) -> (Hash, Hash) {
        use mor_core::money::{Amount, Claim, Payload as Fin, Purchase};
        let (sid, fid, deal, song) = (self.svc.id, self.fan.id, self.deal, self.publication);
        let mut svc = self.svc.clone();
        let r = ServiceDeal::receipt(&mut self.w, &mut svc, sid, fid, song, Some(deal), proof);
        self.svc = svc;
        let c = Fin::Claim(Claim {
            rail: spec("a rail Module"),
            proof: proof.to_vec(),
            payee: sid,
            amount: Amount { unit: spec("a unit"), value: 1000 },
            fulfils: song,
            disagrees: None,
            referral: None,
            refund: None,
            anonymous: None,
            purchase: Some(Purchase { agreement: deal, line: deal }),
            previous: None,
        });
        let a = self.w.everyday_act(&mut self.fan, mirs().money, 3, c.to_map(), None, (!acks.is_empty()).then_some(acks));
        (r, self.w.add(&a))
    }

    fn split(&mut self, receipt: Hash, payouts: Vec<agreements::Payout>, metrics: Vec<Hash>) -> Hash {
        let s = agreements::Split { receipt, payouts, cmip: spec("a split cMIP"), publication: self.publication, tally: None, number: Some(1), modules: vec![], metric_records: metrics, transfers: vec![] };
        let all = vec![self.ana.id, self.ben.id];
        self.w.private_act(&mut self.svc, mirs().agreements, agreements::types::SPLIT, s.to_map(), None, all)
    }

    /// The owners' line of 800, by the stake.
    fn stake_payouts(&self) -> Vec<agreements::Payout> {
        vec![line_payout(self.ana.id, 480, self.deal), line_payout(self.ben.id, 320, self.deal)]
    }
}

/// Fable's review 7.2, taken under the delegation: a role share is named
/// by its role; a payout filling a role the plan names counts on any act
/// the committed payer acknowledges, whatever cMIP defines it; a payout
/// filling a role the plan does not name is unplanned. Several fillers of
/// one role divide it equally (OF11 a, Fable's reading).
#[test]
fn review_7_2_a_role_share_is_named_by_its_role() {
    let mut l = ServiceDeal::with(&|p| p.plan = role_plan("relay", 200_000));
    let mut r1 = l.w.genesis("relay one", vec![own_home()], None, None);
    let mut r2 = l.w.genesis("relay two", vec![own_home()], None, None);
    let rec = |w: &mut World, p: &mut Person, cmip: &str| {
        let a = w.everyday_act(p, spec(cmip), 0, vec![(Value::Uint(0), Value::Bytes(spec("the song's locked bytes, 12b").to_vec()))], None, None);
        w.add(&a)
    };
    // Two transport cMIPs, neither named in the plan.
    let e1 = rec(&mut l.w, &mut r1, "a relay transport cMIP, draft 3");
    let e2 = rec(&mut l.w, &mut r2, "its successor, draft 4");
    let (receipt, claim) = l.sale(b"a sale", vec![e1, e2]);
    let mut ps = l.stake_payouts();
    ps.push(agreements::Payout { role: Some("relay".into()), evidence: Some(e1), ..payout(r1.id, 100) });
    ps.push(agreements::Payout { role: Some("relay".into()), evidence: Some(e2), ..payout(r2.id, 100) });
    let x = l.split(receipt, ps.clone(), vec![]);
    let mut v = view(&l.w);
    v.rail_valid.insert(claim, mor_core::money::PaidAt::Flow(spec("a pointer")));
    let e = v.split(&x).unwrap();
    assert!(e.unevidenced.is_empty() && e.unplanned.is_empty() && e.unequal_roles.is_empty(), "{e:?}");
    // Unequal: 150 and 50.
    ps[2].amount = 150;
    ps[3].amount = 50;
    let x = l.split(receipt, ps.clone(), vec![]);
    let mut v = view(&l.w);
    v.rail_valid.insert(claim, mor_core::money::PaidAt::Flow(spec("a pointer")));
    assert_eq!(v.split(&x).unwrap().unequal_roles, vec!["relay".to_string()]);
    // A role the plan does not name.
    ps[3].role = Some("mastering".into());
    let x = l.split(receipt, ps, vec![]);
    let mut v = view(&l.w);
    v.rail_valid.insert(claim, mor_core::money::PaidAt::Flow(spec("a pointer")));
    assert_eq!(v.split(&x).unwrap().unplanned, vec![r2.id]);
}

/// F214, decided by Nobody, allegedly, 10 October 2026 ("A service not
/// respecting this is liable"), as the publication's plan carries the
/// fees: a fee entry says when it applies; a split leaving out a fee its
/// entry makes owed is a wrong split, and the fee is the service's open
/// obligation (rule 28). The split's list of Modules (key 6) is the
/// service's statement, never what decides. A fee scoped to another rail
/// is not owed.
#[test]
fn f214_a_skipped_fee_is_the_services_open_obligation() {
    let (m, n) = (spec("a publishing Module, 12b"), spec("an on-chain rail Module, 12b"));
    let mut l = ServiceDeal::with(&|p| {
        p.plan.fees = vec![
            agreements::Fee { module: spec("a publishing Module, 12b"), part: 20_000, scope: agreements::FeeScope::Every },
            agreements::Fee { module: spec("an on-chain rail Module, 12b"), part: 10_000, scope: agreements::FeeScope::Rail(spec("an on-chain rail Module, 12b")) },
        ];
    });
    let creator = spec("the publishing Module's creator");
    let (receipt, _) = l.sale(b"a sale", vec![]);
    let x = l.split(receipt, l.stake_payouts(), vec![]);
    let e = view(&l.w).split(&x).unwrap();
    assert_eq!(e.fees_skipped, vec![m], "owed on every payment; the rail fee is not owed on another rail");
    assert!(!e.fees_skipped.contains(&n));
    assert!(e.problems.iter().any(|w| w.contains("rule 28")), "{:?}", e.problems);
    let svc = l.svc.id;
    assert_eq!(view(&l.w).service_account(&svc).unwrap().fees_skipped, vec![(x, m)]);
    let mut ps = l.stake_payouts();
    ps.push(agreements::Payout { fee_module: Some(m), ..payout(creator, 20) });
    let y = l.split(receipt, ps, vec![]);
    let e = view(&l.w).split(&y).unwrap();
    assert!(e.fees_skipped.is_empty() && e.unplanned.is_empty(), "{e:?}");
}

/// Fable's review 2.7, taken under the delegation (F194), with OF13 (a)
/// and (d), Fable's readings: a metric's measurer is none of the
/// identities its metric divides among, nor the split service; the metric
/// pays only identities the plan already pays (here the owners); its
/// record is signed by the measurer, of the metric's Module.
#[test]
fn review_2_7_a_measurer_never_weighs_its_own_share() {
    let module = spec("a play-count Module");
    let run = |measurer_is_ana: bool| {
        let fan_id = spec("a fan's id, filled below");
        let _ = fan_id;
        let mut w0 = ServiceDeal::new();
        let (aid, bid) = (w0.ana.id, w0.ben.id);
        let measurer = if measurer_is_ana { aid } else { w0.fan.id };
        let plan = plan_of(vec![agreements::ShareRule::Metric { metric: 0, part: 500_000 }], vec![agreements::Metric { module, measurer, params: None }]);
        // A fresh publication carrying the plan, the same parties.
        let (deal, sid, song) = (w0.deal, w0.svc.id, w0.song);
        let mut ben = w0.ben.clone();
        let mut svc = w0.svc.clone();
        let pb = publish_under(&mut w0.w, &mut w0.ana, deal, sid, &mut [&mut ben, &mut svc], &|p| {
            p.sold = Some(vec![agreements::Sold::Bake(song)]);
            p.plan = plan.clone();
        });
        w0.ben = ben;
        w0.svc = svc;
        w0.publication = pb;
        let l = &mut w0;
        let counts = {
            let mut who = if measurer_is_ana { l.ana.clone() } else { l.fan.clone() };
            let a = l.w.everyday_act(&mut who, module, 0, vec![(Value::Uint(0), Value::Uint(600))], None, None);
            l.w.add(&a)
        };
        let (receipt, _) = l.sale(b"a month", vec![]);
        let mut ps = vec![line_payout(aid, 300, deal), line_payout(bid, 200, deal)];
        ps.push(agreements::Payout { metric: Some(0), ..payout(aid, 300) });
        ps.push(agreements::Payout { metric: Some(0), ..payout(bid, 200) });
        let x = l.split(receipt, ps, vec![counts]);
        view(&l.w).split(&x).unwrap().metric_problems
    };
    assert!(run(true).iter().any(|w| w.contains("measurer")), "Ana measures and is paid by the metric: refused");
    assert!(run(false).is_empty(), "{:?}", run(false));
}

/// F210, decided by Nobody, allegedly, 10 October 2026 ("Yes. The grammar
/// is there to make it work, responsibility then goes onto the clients."):
/// no held shares, no completing split. A record acknowledged by the claim
/// written at payment fills the role; one record acknowledged again by the
/// same payer's claim for another payment is spent there (review 2.10):
/// it counts for the first claim on the payer's sequence (mechanic, the
/// build's).
#[test]
fn f210_one_record_is_spent_for_its_payers_other_claims() {
    let mut l = ServiceDeal::with(&|p| p.plan = role_plan("relay", 200_000));
    let mut relay = l.w.genesis("a relay", vec![own_home()], None, None);
    let rec = {
        let a = l.w.everyday_act(&mut relay, spec("a relay transport cMIP, draft 3"), 0, vec![(Value::Uint(0), Value::Bytes(l.locked.to_vec()))], None, None);
        l.w.add(&a)
    };
    let (r1, c1) = l.sale(b"first", vec![rec]);
    let (r2, c2) = l.sale(b"second", vec![rec]);
    let split_for = |l: &mut ServiceDeal, r: Hash| {
        let mut ps = l.stake_payouts();
        ps.push(agreements::Payout { role: Some("relay".into()), evidence: Some(rec), ..payout(relay.id, 200) });
        l.split(r, ps, vec![])
    };
    let x1 = split_for(&mut l, r1);
    let x2 = split_for(&mut l, r2);
    let mut v = view(&l.w);
    for c in [c1, c2] {
        v.rail_valid.insert(c, mor_core::money::PaidAt::Flow(spec("a pointer")));
    }
    assert!(v.split(&x1).unwrap().unevidenced.is_empty(), "the first claim acknowledging it");
    assert_eq!(v.split(&x2).unwrap().unevidenced, vec![relay.id], "spent for the payer's other claim");
}

/// F219, decided by Nobody, allegedly, 10 October 2026 ("Yes, and bad faith
/// terms remain public."): a refund past the terms the buyer accepted by
/// paying is ended: the obligation closes there, the owners keep the
/// money, and it does not block a closing. Past its terms is the time
/// reference's answer, which the caller states; before it, the refund is
/// owed and blocks as before. Terms with no refund terms never lapse
/// (rule 32: the core sets no lapse).
#[test]
fn f219_a_refund_past_its_terms_is_ended() {
    use mor_core::money::Payer;
    let carla = spec("Carla, a payer, F219");
    let refundable = |t: &mut Terms| {
        t.time = Some((spec("a block height reference"), Value::Uint(0)));
        t.refund = Some(agreements::RefundTerms { until: Value::Uint(900_000) });
    };
    let owed_why = |e: &agreements::ClosingEval| e.why.iter().any(|w| w.contains("owed back"));
    let (mut lab, label, owed, _, rot1, _) = owed_back_lab_terms(&refundable, |_| (Some(Payer::Identity(carla)), None), b"a refund with terms");
    assert_eq!(common::stand_in_answers(lab.view()).owed_back(&label).unwrap().len(), 1, "before its point: owed");
    let mut v = lab.view();
    v.refunds_past_terms.insert(owed);
    assert!(v.owed_back(&label).unwrap().is_empty(), "past its terms: ended");
    drop(v);
    let e = close_with_past(&mut lab, label, rot1, &[owed]);
    assert!(!owed_why(&e), "it does not block a closing: {:?}", e.why);
    // Terms with no refund terms: the caller's word changes nothing.
    let (mut lab, label, owed, _, rot1) = owed_back_lab(Some(Payer::Identity(carla)), b"a refund with no terms");
    let e = close_with_past(&mut lab, label, rot1, &[owed]);
    assert!(owed_why(&e), "no lapse without terms: {:?}", e.why);
}

/// [`close_with`], refunds stated past their terms.
fn close_with_past(lab: &mut Lab, label: Hash, rot1: Hash, past: &[Hash]) -> agreements::ClosingEval {
    let f = lab.founding;
    if lab.view().broken(&label).unwrap().is_some() {
        let same = lab.clone_terms(&f, vec![(Power::Constitutional, vec![ANA, BEN, CY])], &|_| {});
        let r = lab.propose(ANA, &same);
        let rs: Vec<Hash> = [ANA, BEN, CY].iter().map(|w| lab.sign(*w, &r)).collect();
        roll_back(lab, r, &rs, rot1, &[]);
    }
    let r = lab.view().current(&label).unwrap().unwrap().agreement;
    let c = agreements::Closing { agreement: r, collective: label, open: vec![] };
    let eo = ending_obj(lab, r, label);
    let x = agreements_act(&mut lab.w, &mut lab.m[ANA], agreements::types::CLOSING, c.to_map(), eo);
    lab.end(ANA, &x);
    lab.end(BEN, &x);
    lab.end(CY, &x);
    let mut v = lab.view();
    v.refunds_past_terms.extend(past.iter().copied());
    v.closing(&x).unwrap()
}

/// The work claim (type 3, rule 15), with Fable's readings of OF16 (a,
/// public or addressed to every creator) and OF17 (a, no roles), and F218,
/// decided by Nobody, allegedly, 10 October 2026 ("Yes"): in MOR's eyes the
/// owners are who the recorded work claim names, with the shares its
/// agreement gives; where no agreement writes shares, the default holder is
/// the creator who opened the work claim. A claim binds once every other
/// creator signs it; a second claim on the same work shows it contested.
#[test]
fn f218_the_default_holder_is_the_creator_who_opened_the_claim() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut stranger = w.genesis("a stranger", vec![own_home()], None, None);
    let work = spec("a song, F218");
    let claim = agreements::WorkClaim { work, creators: sorted(vec![ana.id, ben.id]), commitment: None };
    let c = agreements_act(&mut w, &mut ana, agreements::types::CLAIM, claim.to_map(), None);
    let o = view(&w).work_owners(&work).unwrap();
    assert_eq!(o.default_holder, None, "not bound until Ben signs");
    sign(&mut w, &mut ben, &c);
    let o = view(&w).work_owners(&work).unwrap();
    assert_eq!(o.claims, vec![c]);
    assert_eq!(o.default_holder, Some(ana.id), "no shares written: the creator who opened it");
    assert!(!o.contested);
    // A sealed claim, addressed to Ana only, counts for nothing (OF16 a).
    let sealed = agreements::WorkClaim { work, creators: sorted(vec![ben.id, stranger.id]), commitment: None };
    w.private_act(&mut stranger, mirs().agreements, agreements::types::CLAIM, sealed.to_map(), None, vec![ana.id]);
    assert!(!view(&w).work_owners(&work).unwrap().contested);
    // A stranger's public claim: contested, shown as recorded.
    let theirs = agreements::WorkClaim { work, creators: vec![stranger.id], commitment: None };
    let s = agreements_act(&mut w, &mut stranger, agreements::types::CLAIM, theirs.to_map(), None);
    let o = view(&w).work_owners(&work).unwrap();
    assert!(o.contested && o.claims == sorted(vec![c, s]));
    // Once an agreement writes shares in the work, those are the owners.
    let mut t = deal_terms(ana.id, ben.id);
    t.stakes = Some(vec![agreements::Stake { object: agreements::Who::Id(work), holders: vec![(agreements::Who::Id(ana.id), 300_000), (agreements::Who::Id(ben.id), 700_000)] }]);
    t.target = Some(agreements::Target::Claim(c));
    let d = agreements_act(&mut w, &mut ana, agreements::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut ana, &d);
    sign(&mut w, &mut ben, &d);
    let o = view(&w).work_owners(&work).unwrap();
    assert_eq!(o.default_holder, None);
    assert_eq!(o.agreements, vec![d]);
    // A claim the opener is not among the creators of is refused.
    let bad = agreements::WorkClaim { work, creators: vec![ben.id], commitment: None };
    let b = agreements_act(&mut w, &mut ana, agreements::types::CLAIM, bad.to_map(), None);
    assert!(!view(&w).work_owners(&work).unwrap().claims.contains(&b));
}

/// F217, decided by Nobody, allegedly, 10 October 2026 ("Yes, it's an
/// acceptable cost. Make it legible, don't ban it."): a stake's sale takes
/// effect on the seller's own line. The seller signs the transfer by a
/// chain signature (F132), fixing its place; the buyer completes it. Once
/// signed, a payout receipt the seller signs for that stake after it on his
/// own line is a wrong receipt, counting for nothing; that payout is owed
/// to the buyer as the service's open obligation (rule 29). A split paying
/// the seller for the stake is shown beside the transfer (client
/// conformance); the window before the service follows is a stated cost.
#[test]
fn f217_a_stakes_sale_takes_effect_on_the_sellers_own_line() {
    use mor_core::money::{Amount, Payer, Payload as Fin, Receipt};
    let mut l = ServiceDeal::new();
    let (bid, deal) = (l.ben.id, l.deal);
    let mut carla = l.w.genesis("carla, who buys", vec![own_home()], None, None);
    let t = agreements::StakeTransfer { agreement: deal, stake: 0, to: carla.id, share: 200_000, record: vec![] };
    let x = agreements_act(&mut l.w, &mut l.ben, agreements::new_types::STAKE_TRANSFER, t.to_map(), obj(deal));
    let e = view(&l.w).transfer(&x).unwrap();
    assert!(!e.effective, "no chain signature, no buyer: {:?}", e.problems);
    sign(&mut l.w, &mut carla, &x);
    assert!(!view(&l.w).transfer(&x).unwrap().effective, "still no chain signature");
    // A payout receipt Ben signs before his chain signature: not wrong.
    let (receipt, _) = l.sale(b"a sale", vec![]);
    let split = l.split(receipt, l.stake_payouts(), vec![]);
    let payout_receipt = |w: &mut World, ben: &mut Person, proof: &[u8]| {
        let r = Fin::Receipt(Receipt { rail: spec("a rail Module"), proof: proof.to_vec(), payer: Some(Payer::Identity(spec("the service"))), payee: bid, amount: Amount { unit: spec("a unit"), value: 320 }, fulfils: split, previous: None, forward: None, batch: None, purchase: None });
        let a = w.everyday_act(ben, mirs().money, 2, r.to_map(), None, None);
        w.add(&a)
    };
    let mut ben = l.ben.clone();
    let before = payout_receipt(&mut l.w, &mut ben, b"before");
    let (cs, after_ben) = l.w.chain_sign(&ben, x);
    let e = view(&l.w).transfer(&x).unwrap();
    assert!(e.effective, "{:?}", e.problems);
    assert!(e.place.is_some());
    assert_eq!(e.splits_paying_seller, vec![split], "shown beside the transfer");
    // Identity binds an everyday act to genesis or a rotation only, never to
    // a chain signature: a receipt bound to the chain signature is invalid
    // (question QJ1 in the build report). As built, a receipt is after the
    // transfer on Ben's line once bound to a rotation after it.
    let mut stale = after_ben.clone();
    stale.binding = cs;
    let bad = payout_receipt(&mut l.w, &mut stale, b"bound to the chain signature");
    assert_eq!(l.w.v.status(&bad), Status::Invalid);
    let still_before = payout_receipt(&mut l.w, &mut after_ben.clone(), b"same rotation as before");
    let (_, mut ben) = l.w.rotate(&after_ben, Rot::default());
    let after = payout_receipt(&mut l.w, &mut ben, b"after");
    assert_eq!(l.w.v.status(&after), Status::Valid);
    assert!(!view(&l.w).transfer(&x).unwrap().wrong_receipts.contains(&still_before), "bound to the rotation before the chain signature: not after it (QJ1)");
    let e = view(&l.w).transfer(&x).unwrap();
    assert_eq!(e.wrong_receipts, vec![after], "the receipt after the transfer is wrong; the one before is not ({before:?})");
    let acct = view(&l.w).service_account(&l.svc.id).unwrap();
    assert_eq!(acct.owed_to_buyers, vec![(split, 1, carla.id, 160)], "Ben's payout, in the share sold, owed to Carla");
}

/// F216, decided by Nobody, allegedly, 10 October 2026 ("Yes. The owners
/// have to all sign that agreement according to the rules of their deal
/// and define the terms of the publication. The agreement of the work acts
/// as a single use collective."), as the publication carries it: the
/// publication names the work's ownership agreement (WE), whose consent is
/// given by its own rule (every party of it signing the publication), and
/// a partner, the publisher; a sale through it pays the publisher its
/// share off the top, and the owners' line by the WE's stake.
#[test]
fn f216_a_publication_carries_two_agreements() {
    use mor_core::money::{Amount, Payer, Payload as Fin, Purchase, Receipt};
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut label = w.genesis("a publisher", vec![own_home()], None, None);
    let we = {
        let c = common::claim_alone(&mut w, &mut ana, &mirs(), spec("a song, F216"));
        let t = common::ownership_terms(c, &[(ana.id, 600_000), (ben.id, 400_000)], "The song's ownership, F216.");
        let d = agreements_act(&mut w, &mut ana, agreements::types::TERMS, t.to_map(), None);
        sign(&mut w, &mut ana, &d);
        sign(&mut w, &mut ben, &d);
        d
    };
    let lid = label.id;
    let pe = publish_under(&mut w, &mut ana, we, lid, &mut [&mut label], &|p| p.partners = vec![agreements::Partner { identity: lid, share: 150_000, label: None }]);
    assert!(!view(&w).publication(&pe).unwrap().counts, "the WE consents only by its own rule: Ben has not signed");
    sign(&mut w, &mut ben, &pe);
    let e = view(&w).publication(&pe).unwrap();
    assert!(e.counts, "every party of the WE signed: the WE signed, as a single-use collective ({:?})", e.problems);
    assert!(e.parties.contains(&we));
    // A sale: the publisher 15% off the top, the WE's line 85%, which its
    // stake divides 60/40.
    let r = Fin::Receipt(Receipt { rail: spec("a rail Module"), proof: b"a sale, F216".to_vec(), payer: Some(Payer::Identity(spec("a fan"))), payee: lid, amount: Amount { unit: spec("a unit"), value: 1000 }, fulfils: pe, previous: None, forward: None, batch: None, purchase: Some(Purchase { agreement: we, line: we }) });
    let a = w.everyday_act(&mut label, mirs().money, 2, r.to_map(), None, None);
    let receipt = w.add(&a);
    let payouts = vec![agreements::Payout { partner: Some(0), ..payout(lid, 150) }, line_payout(ana.id, 510, we), line_payout(ben.id, 340, we)];
    let sp = agreements::Split { receipt, payouts, cmip: spec("a split cMIP"), publication: pe, number: Some(1), ..Default::default() };
    let x = w.private_act(&mut label, mirs().agreements, agreements::types::SPLIT, sp.to_map(), None, sorted(vec![ana.id, ben.id, lid]));
    let e = view(&w).split(&x).unwrap();
    assert!(e.mismatched.is_empty() && e.partners_mismatched.is_empty() && e.unplanned.is_empty() && e.problems.is_empty(), "{e:?}");
}

// ---------------------------------------------------------------------------
// Agreements draft 11, rule 15 (new in draft 11, F254): any agreement may
// be a party of another, named by its line, consenting by its own rule; no
// loops; nesting bounded at 8 (`docs/agreements-draft-11-build.md`).
// ---------------------------------------------------------------------------

/// A deal's terms between `parties`, with the stake `object` split among
/// `holders`.
fn deal_of(parties: &[Hash], text: &str) -> Terms {
    let mut t = deal_terms(parties[0], parties[1]);
    t.parties = parties.to_vec();
    t.text = text.into();
    t
}

/// Propose `t` by the first of `signers`, and have each sign it.
fn deal_signed_by(w: &mut World, t: &Terms, signers: &mut [&mut Person], parent: Option<Hash>) -> Hash {
    let x = agreements_act(w, signers[0], agreements::types::TERMS, t.to_map(), parent.map(|p| obj(p)).unwrap_or(None));
    for p in signers.iter_mut() {
        sign(w, p, &x);
    }
    x
}

/// A clone of the deal `parent` (terms `pt`), changed by `f`, its mark the
/// clone rule and the parent's parties.
fn deal_clone(pt: &Terms, parent: Hash, f: &dyn Fn(&mut Terms)) -> Terms {
    let mut c = pt.clone();
    c.parent = Some(parent);
    f(&mut c);
    c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(pt.parties.clone()) }]);
    c
}

/// Draft 11, rule 15 (F254, part 3): an agreement is named as a party by
/// its line, its founding version. A publication's agreement naming the
/// work's agreement by a later version is refused; named by its line, it
/// counts. What the line signed it carries through every later version:
/// once Ana and Ben signed the publication's agreement for the work's
/// agreement, a re-version replacing Ben with Cy does not undo it.
#[test]
fn draft_11_f254_an_agreement_is_named_by_its_line_and_carries_what_it_signed() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut cy = w.genesis("cy", vec![own_home()], None, None);
    let mut label = w.genesis("a publisher", vec![own_home()], None, None);
    let wt = deal_of(&[ana.id, ben.id], "The work's agreement.");
    let we = deal_signed_by(&mut w, &wt, &mut [&mut ana, &mut ben], None);
    // A later version of it: the text changes.
    let w2t = deal_clone(&wt, we, &|t| t.text = "The work's agreement, amended.".into());
    let we2 = deal_signed_by(&mut w, &w2t, &mut [&mut ana, &mut ben], Some(we));
    assert_eq!(view(&w).version_in_force(&we).unwrap(), we2);
    // Named by the later version: refused, failing closed.
    let bad = deal_signed_by(&mut w, &deal_of(&[we2, label.id], "Named by a version."), &mut [&mut label, &mut ana, &mut ben], None);
    let a = view(&w).agreement(&bad).unwrap();
    assert!(a.invalid.as_deref().is_some_and(|x| x.contains("by its line")), "{:?}", a.invalid);
    assert_eq!(a.exists, Some(false));
    // Named by its line: Ana and Ben sign, the line consents.
    let pt = deal_of(&[we, label.id], "The publication's agreement.");
    let pe = deal_signed_by(&mut w, &pt, &mut [&mut label, &mut ana, &mut ben], None);
    assert_eq!(view(&w).agreement(&pe).unwrap().exists, Some(true));
    // The work's agreement re-versions: Ben out, Cy in. What the line
    // signed stays signed.
    let w3t = deal_clone(&w2t, we2, &|t| t.parties = vec![t.parties[0], cy.id]);
    let we3 = deal_signed_by(&mut w, &w3t, &mut [&mut ana, &mut ben, &mut cy], Some(we2));
    assert_eq!(view(&w).version_in_force(&we).unwrap(), we3);
    assert_eq!(view(&w).agreement(&pe).unwrap().exists, Some(true), "carried through every later version (F254)");
    // A new act the line signs under its version in force: Ana and Cy.
    let nt = deal_of(&[we, label.id], "A second publication.");
    let ne = deal_signed_by(&mut w, &nt, &mut [&mut label, &mut ana], None);
    assert_eq!(view(&w).agreement(&ne).unwrap().exists, Some(false), "Cy has not signed");
    sign(&mut w, &mut cy, &ne);
    assert_eq!(view(&w).agreement(&ne).unwrap().exists, Some(true));
}

/// Draft 11, rule 15 (F254, part 4): an agreement is never a party of
/// itself, directly or through others; terms making one so are refused,
/// failing closed. The founding version that was named first is never the
/// one refused: whatever names its line was made after it.
#[test]
fn draft_11_f254_no_loops() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut cy = w.genesis("cy", vec![own_home()], None, None);
    let at = deal_of(&[ana.id, ben.id], "Deal A.");
    let a = deal_signed_by(&mut w, &at, &mut [&mut ana, &mut ben], None);
    // Directly: a version of A naming its own line.
    let selft = deal_clone(&at, a, &|t| t.parties.push(a));
    let own = deal_signed_by(&mut w, &selft, &mut [&mut ana, &mut ben], Some(a));
    let e = view(&w).agreement(&own).unwrap();
    assert!(e.invalid.as_deref().is_some_and(|x| x.contains("party of itself")), "{:?}", e.invalid);
    assert_eq!(e.exists, Some(false));
    assert_eq!(view(&w).version_in_force(&a).unwrap(), a, "refused: A stays in force");
    // Through another: B has A as a party; a version of A naming B.
    let bt = deal_of(&[a, cy.id], "Deal B.");
    let b = deal_signed_by(&mut w, &bt, &mut [&mut cy, &mut ana, &mut ben], None);
    let eb = view(&w).agreement(&b).unwrap();
    assert_eq!(eb.exists, Some(true), "B's founding version names A: no loop ({:?})", eb.invalid);
    let loopt = deal_clone(&at, a, &|t| t.parties.push(b));
    let looped = deal_signed_by(&mut w, &loopt, &mut [&mut ana, &mut ben, &mut cy], Some(a));
    let e = view(&w).agreement(&looped).unwrap();
    assert!(e.invalid.as_deref().is_some_and(|x| x.contains("loop")), "{:?}", e.invalid);
    assert_eq!(view(&w).version_in_force(&a).unwrap(), a);
    assert_eq!(view(&w).agreement(&b).unwrap().exists, Some(true), "B, named first, stands");
}


/// The album and the song (F254's loop walk, `docs/f254-loop-walk-fix.md`):
/// the Label and Carla's album agreement A; Ana and Ben's song agreement B.
/// A's later version adds B as a party, every party signing (Ana and Ben for
/// B). Returns the world, the four people, A, B and A's later version.
fn album_and_song() -> (World, [Person; 4], Hash, Terms, Hash, Terms, Hash) {
    let mut w = World::new();
    let mut label = w.genesis("a label", vec![own_home()], None, None);
    let mut carla = w.genesis("carla", vec![own_home()], None, None);
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let at = deal_of(&[label.id, carla.id], "The album's agreement.");
    let a = deal_signed_by(&mut w, &at, &mut [&mut label, &mut carla], None);
    let bt = deal_of(&[ana.id, ben.id], "The song's agreement.");
    let b = deal_signed_by(&mut w, &bt, &mut [&mut ana, &mut ben], None);
    let a2t = deal_clone(&at, a, &|t| t.parties.push(b));
    let a2 = deal_signed_by(&mut w, &a2t, &mut [&mut label, &mut carla, &mut ana, &mut ben], Some(a));
    assert_eq!(view(&w).agreement(&a2).unwrap().exists, Some(true));
    assert_eq!(view(&w).version_in_force(&a).unwrap(), a2, "the song is in the album");
    (w, [label, carla, ana, ben], a, at, b, bt, a2)
}

/// F254's loop walk (settled 11 October 2026, evening; F254, F107): a
/// version of B naming A needs A's consent, so B's own parties alone
/// cannot make one. Ana and Ben sign a version of B naming A, the Label
/// and Carla do not: it is no version of B, only a draft, and A's later
/// version, which every party signed, stands. (The build's walk counted
/// that draft and refused A's later version for a loop.)
#[test]
fn f254_a_draft_of_the_song_naming_the_album_does_not_undo_the_album() {
    let (mut w, [_, _, mut ana, mut ben], a, _, b, bt, a2) = album_and_song();
    let b2t = deal_clone(&bt, b, &|t| t.parties.push(a));
    let b2 = deal_signed_by(&mut w, &b2t, &mut [&mut ana, &mut ben], Some(b));
    let e = view(&w).agreement(&b2).unwrap();
    assert_eq!(e.exists, Some(false), "without the album's consent it is no version of the song");
    assert_eq!(view(&w).version_in_force(&b).unwrap(), b);
    let e = view(&w).agreement(&a2).unwrap();
    assert_eq!((e.invalid, e.exists), (None, Some(true)), "the album's later version stands");
    assert_eq!(view(&w).version_in_force(&a).unwrap(), a2);
}

/// The same, then the Label and Carla sign B's version naming A too: every
/// party consents to a loop, and the loop is refused, failing closed, as
/// before: both later versions, each line returning to its earlier one.
#[test]
fn f254_a_loop_every_party_signed_is_still_refused() {
    let (mut w, [mut label, mut carla, mut ana, mut ben], a, _, b, bt, a2) = album_and_song();
    let b2t = deal_clone(&bt, b, &|t| t.parties.push(a));
    let b2 = deal_signed_by(&mut w, &b2t, &mut [&mut ana, &mut ben], Some(b));
    assert_eq!(view(&w).version_in_force(&a).unwrap(), a2, "a draft moves nothing");
    sign(&mut w, &mut label, &b2);
    sign(&mut w, &mut carla, &b2);
    for x in [a2, b2] {
        let e = view(&w).agreement(&x).unwrap();
        assert!(e.invalid.as_deref().is_some_and(|m| m.contains("loop")), "{:?}", e.invalid);
        assert_eq!(e.exists, Some(false));
    }
    assert_eq!(view(&w).version_in_force(&a).unwrap(), a);
    assert_eq!(view(&w).version_in_force(&b).unwrap(), b);
}

/// The walk's consent comes from versions of the album's line every party
/// signed, never from a clone its drafters alone signed (F107: a deal
/// changes only unanimously; mechanic, the build's). Ana and Ben draft a
/// clone of A naming themselves, sign it and B's version naming A: still
/// no version of B, and A's later version stands.
#[test]
fn f254_a_clone_its_drafters_alone_signed_gives_no_consent() {
    let (mut w, [_, _, mut ana, mut ben], a, at, b, bt, a2) = album_and_song();
    let (aid, bid) = (ana.id, ben.id);
    let ft = deal_clone(&at, a, &|t| t.parties = vec![aid, bid]);
    let forged = deal_signed_by(&mut w, &ft, &mut [&mut ana, &mut ben], Some(a));
    assert_eq!(view(&w).agreement(&forged).unwrap().exists, Some(false));
    let b2t = deal_clone(&bt, b, &|t| t.parties.push(a));
    let b2 = deal_signed_by(&mut w, &b2t, &mut [&mut ana, &mut ben], Some(b));
    assert_eq!(view(&w).agreement(&b2).unwrap().exists, Some(false));
    let e = view(&w).agreement(&a2).unwrap();
    assert_eq!((e.invalid, e.exists), (None, Some(true)), "the album's later version stands");
    assert_eq!(view(&w).version_in_force(&a).unwrap(), a2);
}

/// F254's loop walk reads a deal's clone made after a party's voice was
/// removed as rule 45b does (B19, Q28; mechanic, settled by the project
/// lead, `docs/closing-owes-fix.md`). The song agreement B has a keeper and
/// names an absence authority. The album's later version adds B, every
/// party signing. B's clone drops Ben and names A, signed by Ana, the Label
/// and Carla: while Ben's voice remains it is a draft, and the album's
/// later version stands. Once the authority declares Ben absent, removing
/// his voice, the clone is B's version as rule 45b reads it, and the loop
/// it makes is refused, failing closed: both later versions.
#[test]
fn f254_a_loop_through_a_clone_after_an_absence_is_refused() {
    let mut w = World::new();
    let mut label = w.genesis("a label", vec![own_home()], None, None);
    let mut carla = w.genesis("carla", vec![own_home()], None, None);
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let keeper = w.genesis("the song's keeper", vec![own_home()], None, None);
    let mut authority = w.genesis("the song's absence authority", vec![own_home()], None, None);
    let at = deal_of(&[label.id, carla.id], "The album's agreement.");
    let a = deal_signed_by(&mut w, &at, &mut [&mut label, &mut carla], None);
    let mut bt = deal_of(&[ana.id, ben.id], "The song's agreement.");
    bt.keepers = Some(Keepers { operators: vec![keeper.id], rule: Rule::All });
    bt.abandonment = Some(Abandonment { authority: Authority::Named(authority.id), outcomes: vec![outcomes::VOICE_REMOVED], proof: None });
    let b = deal_signed_by(&mut w, &bt, &mut [&mut ana, &mut ben], None);
    let a2t = deal_clone(&at, a, &|t| t.parties.push(b));
    let a2 = deal_signed_by(&mut w, &a2t, &mut [&mut label, &mut carla, &mut ana, &mut ben], Some(a));
    assert_eq!(view(&w).version_in_force(&a).unwrap(), a2);
    // B's clone: Ben out, A in; its mark names the voice that remains.
    let (aid, bid) = (ana.id, ben.id);
    let mut b2t = deal_clone(&bt, b, &|t| t.parties = vec![aid, a]);
    b2t.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: vec![aid] }]);
    let b2 = deal_signed_by(&mut w, &b2t, &mut [&mut ana, &mut label, &mut carla], Some(b));
    let e = view(&w).agreement(&a2).unwrap();
    assert_eq!((e.invalid, e.exists), (None, Some(true)), "Ben's voice remains: the clone is a draft");
    // The authority declares Ben absent; the keeper records it.
    let decl = AbsenceDeclaration { agreement: b, clause: b, party: bid, outcomes: vec![outcomes::VOICE_REMOVED] };
    let x = agreements_act(&mut w, &mut authority, agreements::types::DECLARATION, decl.to_map(), obj(b));
    let mut v = view(&w);
    v.keeper_logs.insert(keeper.id, vec![x]);
    for y in [a2, b2] {
        let e = v.agreement(&y).unwrap();
        assert!(e.invalid.as_deref().is_some_and(|m| m.contains("loop")), "{:?}", e.invalid);
        assert_eq!(e.exists, Some(false));
    }
    assert_eq!(v.version_in_force(&a).unwrap(), a, "the album returns to its earlier version");
    assert_eq!(v.version_in_force(&b).unwrap(), b);
}
/// Draft 11, rule 15 and "Open technical parameters" (F254, part 4):
/// nesting is bounded at 8 layers, one constant. An agreement with eight
/// layers of agreements below it stands; a ninth is refused, failing
/// closed, and gives no consent.
#[test]
fn draft_11_f254_nesting_is_bounded_at_8() {
    assert_eq!(agreements::NESTING_BOUND, 8, "a freeze parameter");
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut inner = deal_signed_by(&mut w, &deal_of(&[ana.id, ben.id], "Layer 0."), &mut [&mut ana, &mut ben], None);
    let mut layers = vec![inner];
    for i in 1..=9 {
        // Each layer: the one below and Ben, Ana signing for every layer
        // below (each is Ana and Ben, all the way down).
        let t = deal_of(&[inner, ben.id], &format!("Layer {i}."));
        inner = deal_signed_by(&mut w, &t, &mut [&mut ana, &mut ben], None);
        layers.push(inner);
    }
    let at = |i: usize| view(&w).agreement(&layers[i]).unwrap();
    assert_eq!((at(8).invalid, at(8).exists), (None, Some(true)), "eight layers of agreements below it");
    let e = at(9);
    assert!(e.invalid.as_deref().is_some_and(|x| x.contains("nesting bound")), "{:?}", e.invalid);
    assert_eq!(e.exists, Some(false));
}

/// Draft 11, rule 7 (F254): a manifest neither claims its parts nor is
/// reached by their claims. The album's claim binds the album's hash; a
/// song's claim binds the song. Neither owner is shown owning the other.
#[test]
fn draft_11_f254_a_manifest_neither_claims_its_parts_nor_is_reached_by_them() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut label = w.genesis("a label", vec![own_home()], None, None);
    let song = spec("a song");
    let album = spec("an album naming the song");
    let (aid, lid) = (ana.id, label.id);
    let sc = agreements_act(&mut w, &mut ana, agreements::types::CLAIM, agreements::WorkClaim { work: song, creators: vec![aid], commitment: None }.to_map(), None);
    let ac = agreements_act(&mut w, &mut label, agreements::types::CLAIM, agreements::WorkClaim { work: album, creators: vec![lid], commitment: None }.to_map(), None);
    let (s, a) = (view(&w).work_owners(&song).unwrap(), view(&w).work_owners(&album).unwrap());
    assert_eq!((s.claims, s.default_holder, s.contested), (vec![sc], Some(ana.id), false));
    assert_eq!((a.claims, a.default_holder, a.contested), (vec![ac], Some(label.id), false));
}

/// Fable's readings of OF24 (a) with review 2.6, and OF23 (a): a request
/// to a judge is its own act (type 25), by a party who signed the version,
/// naming a judge the terms name; it counts, and the judge's period runs,
/// only where public or sealed to the judge. A liveness act counts only
/// where public or addressed to the agreement's other parties.
#[test]
fn of24_of23_a_request_reaches_its_judge_and_presence_is_shown() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let arb = w.genesis("an arbitrator", vec![own_home()], None, None);
    let mut t = deal_terms(ana.id, ben.id);
    t.arbitrators = Some(vec![arb.id]);
    let d = agreements_act(&mut w, &mut ana, agreements::types::TERMS, t.to_map(), None);
    sign(&mut w, &mut ana, &d);
    sign(&mut w, &mut ben, &d);
    let (aid, bid) = (ana.id, ben.id);
    let milestone = spec("a milestone in dispute");
    let r = agreements::JudgeRequest { agreement: d, judge: agreements::Judge::Identity(arb.id), question: milestone };
    let kept = w.private_act(&mut ana, mirs().agreements, agreements::new_types::JUDGE_REQUEST, r.to_map(), obj(d), vec![aid]);
    assert!(view(&w).judge_request(&kept).unwrap().is_err(), "kept to herself: no judge was asked");
    let sent = w.private_act(&mut ana, mirs().agreements, agreements::new_types::JUDGE_REQUEST, r.to_map(), obj(d), vec![aid, arb.id]);
    assert_eq!(view(&w).judge_request(&sent).unwrap(), Ok(vec![arb.id]));
    let other = agreements::JudgeRequest { judge: agreements::Judge::Identity(spec("someone the terms never name")), ..r.clone() };
    let x = agreements_act(&mut w, &mut ana, agreements::new_types::JUDGE_REQUEST, other.to_map(), obj(d));
    assert!(view(&w).judge_request(&x).unwrap().is_err(), "a judge the terms name");
    let l = agreements::Liveness { agreement: d };
    let quiet = w.private_act(&mut ben, mirs().agreements, agreements::new_types::LIVENESS, l.to_map(), obj(d), vec![bid]);
    assert!(!view(&w).liveness(&quiet).unwrap());
    let shown = w.private_act(&mut ben, mirs().agreements, agreements::new_types::LIVENESS, l.to_map(), obj(d), vec![aid, bid]);
    assert!(view(&w).liveness(&shown).unwrap());
}

// ---------------------------------------------------------------------------
// Deals and owning (10 October 2026, evening): F206, F221 to F224 and QJ2
// (a), `docs/deals-owning-build.md`. Each test was written first and seen
// to fail for the reason the decision gives. Test identities only.
// ---------------------------------------------------------------------------

/// F206 (a), decided by Nobody, allegedly, 10 October 2026 ("If nothing
/// new is created, agreed."): a judge's two settlements of one fork,
/// neither holding the other, both count for nothing, read as the judge
/// answering "unknown": the deal stays on its reference and the next link
/// of the chain of judgment settles (rule 34a, QG4), with no period to
/// wait. The double signature stays visible.
#[test]
fn f206_a_a_judge_that_contradicts_itself_has_spoken_for_nothing() {
    let (mut l, mut judges) = judged_deal(1);
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let request = ask_judge(&mut l);
    let j1 = judge_settles(&mut l, &mut judges[0], request, a1, vec![b1], vec![]);
    assert_eq!(l.in_force().unwrap(), a1, "one settlement: the judge keeps A");
    let j2 = judge_settles(&mut l, &mut judges[0], request, b1, vec![a1], vec![]);
    assert_eq!(l.in_force().unwrap(), d, "two, neither holding the other: both count for nothing, the deal stays on its reference");
    let f = view(&l.w).deal_fork(&d).unwrap().expect("still forked");
    assert_eq!(f.branches.len(), 2);
    let seen = view(&l.w).judges_contradicted(&d).unwrap();
    assert_eq!(seen, vec![(judges[0].id, sorted(vec![j1, j2]))], "the double signature stays visible");
    // The next link settles, at once: the first answered "unknown".
    let mut next = judges.remove(1);
    judge_settles(&mut l, &mut next, request, b1, vec![a1], vec![]);
    assert_eq!(l.in_force().unwrap(), b1, "the chain of judgment moved on");
    // A judge settling the same way twice has not contradicted itself.
    let (mut l, mut judges) = judged_deal(0);
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let request = ask_judge(&mut l);
    judge_settles(&mut l, &mut judges[0], request, a1, vec![b1], vec![]);
    let other = ask_judge(&mut l);
    judge_settles(&mut l, &mut judges[0], other, a1, vec![b1], vec![]);
    assert_eq!(l.in_force().unwrap(), a1);
    assert!(view(&l.w).judges_contradicted(&d).unwrap().is_empty());
}

/// F206 (b): a settlement signed by every party and a judge's, neither
/// holding the other: the parties' holds, the judge's counts for nothing
/// (rule 45b: the judge is a fallback a request activates). Where one
/// holds the other, the first is final (F192), whoever signed it.
#[test]
fn f206_b_the_parties_settlement_beats_a_judges_neither_holding_the_other() {
    for judge_first in [true, false] {
        let (mut l, mut judges) = judged_deal(0);
        let d = l.d;
        let a1 = l.version(d, "A.", None);
        let b1 = l.version(d, "B.", None);
        let request = ask_judge(&mut l);
        let (s, j) = if judge_first {
            let j = judge_settles(&mut l, &mut judges[0], request, a1, vec![b1], vec![]);
            (l.version(b1, "Settled by both for B, naming A, not the judge's.", Some(a1)), j)
        } else {
            let s = l.version(b1, "Settled by both for B, naming A.", Some(a1));
            (s, judge_settles(&mut l, &mut judges[0], request, a1, vec![b1], vec![]))
        };
        assert_eq!(l.in_force().unwrap(), s, "the parties' settlement holds (judge first: {judge_first})");
        let _ = j;
    }
    // The parties' settlement holding the judge's: the judge's was first, and final.
    let (mut l, mut judges) = judged_deal(0);
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let request = ask_judge(&mut l);
    let j = judge_settles(&mut l, &mut judges[0], request, a1, vec![b1], vec![]);
    l.version_full(b1, "For B, naming A, having seen the judge's settlement.", vec![a1], vec![j]);
    assert_eq!(l.in_force().unwrap(), a1, "made after the judge's settlement: final, it stands (F192)");
}

// ---------------------------------------------------------------------------
// Judges, vows and the pointer (11 October 2026): F246, F247 and F248,
// `docs/judges-vows-pointer-build.md`. Test identities only.
// ---------------------------------------------------------------------------

/// Ana's settlement request on the deal's fork, after Ben's: a second
/// request on the same question.
fn ana_asks_judge(l: &mut DealLab) -> Hash {
    let r = agreements::SettlementRequest { reference: l.d };
    agreements_act(&mut l.w, &mut l.ana, agreements::types::SETTLEMENT_REQUEST, r.to_map(), obj(l.d))
}

/// F246, decided by Nobody, allegedly, 10 October 2026 ("There is no 'one
/// party deadline'. There is an agreed deadline."), superseding F236: the
/// chain of judgment runs on the agreement's deadlines, stage by stage, per
/// question, never per party. Ben asks first, starting the judge's stage on
/// the fork; Ana asks later, joining that stage, with no clock of her own.
/// The stage passes with no answer: the next link is active and the judge
/// is void on the fork, so its answer to Ana counts for nothing, whichever
/// was signed first. F236's case (two links each settling, neither holding
/// the other) cannot arise: before F246 the judge's prevailed here.
#[test]
fn f246_the_chain_runs_per_question_a_judge_whose_stage_passed_is_void_on_it() {
    for earlier_signs_first in [true, false] {
        let (mut l, mut judges) = judged_deal(1);
        let d = l.d;
        let a1 = l.version(d, "A.", None);
        let b1 = l.version(d, "B.", None);
        let ben_asks = ask_judge(&mut l);
        let ana_asks = ana_asks_judge(&mut l);
        let (first, next) = judges.split_at_mut(1);
        if earlier_signs_first {
            judge_settles(&mut l, &mut first[0], ana_asks, b1, vec![a1], vec![]);
            judge_settles(&mut l, &mut next[0], ben_asks, a1, vec![b1], vec![]);
        } else {
            judge_settles(&mut l, &mut next[0], ben_asks, a1, vec![b1], vec![]);
            judge_settles(&mut l, &mut first[0], ana_asks, b1, vec![a1], vec![]);
        }
        let mut v = view(&l.w);
        v.judges_lapsed.insert((d, first[0].id));
        assert_eq!(
            v.version_in_force(&d).unwrap(),
            a1,
            "the judge's stage on the fork passed: it is void on it, and the active link settles (earlier signs first: {earlier_signs_first})"
        );
        assert!(v.judges_contradicted(&d).unwrap().is_empty(), "two links, each speaking once: nobody contradicted itself");
    }
}

/// F246: the active link settles on any request on the question, Ana's as
/// well as Ben's; and while the judge's stage runs, the next link is not
/// active: its settlement counts for nothing and the judge's answer,
/// given within its stage, settles the fork.
#[test]
fn f246_only_the_active_link_settles_on_any_request_on_the_question() {
    let (mut l, mut judges) = judged_deal(1);
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let ben_asks = ask_judge(&mut l);
    let ana_asks = ana_asks_judge(&mut l);
    let (first, next) = judges.split_at_mut(1);
    judge_settles(&mut l, &mut next[0], ana_asks, a1, vec![b1], vec![]);
    assert_eq!(l.in_force().unwrap(), d, "the judge's stage runs: the next link is not active");
    judge_settles(&mut l, &mut first[0], ben_asks, b1, vec![a1], vec![]);
    assert_eq!(l.in_force().unwrap(), b1, "the judge, active, settles; the next link's counts for nothing");
    // Another deal: the judge lets its stage pass; the next link answers
    // Ana's request, the later one, which joined the stage.
    let (mut l, mut judges) = judged_deal(1);
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let _ben_asks = ask_judge(&mut l);
    let ana_asks = ana_asks_judge(&mut l);
    judge_settles(&mut l, &mut judges[1], ana_asks, a1, vec![b1], vec![]);
    let mut v = view(&l.w);
    v.judges_lapsed.insert((d, judges[0].id));
    assert_eq!(v.version_in_force(&d).unwrap(), a1, "the active link settles on the later request too: the stage is the question's");
}

/// F246, QL2 (F245, decided by Nobody, allegedly, 10 October 2026: "Yes,
/// the currently active judge settles it"): the judge lets its stage pass,
/// the next link settles, and the judge then settles the other way, having
/// seen the next link's settlement (its history holds it). The later
/// link's settlement stands: the judge was void on the fork.
#[test]
fn f246_ql2_the_later_links_settlement_stands() {
    let (mut l, mut judges) = judged_deal(1);
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let ben_asks = ask_judge(&mut l);
    let ana_asks = ana_asks_judge(&mut l);
    let (first, next) = judges.split_at_mut(1);
    let later = judge_settles(&mut l, &mut next[0], ben_asks, a1, vec![b1], vec![]);
    judge_settles(&mut l, &mut first[0], ana_asks, b1, vec![a1], vec![later]);
    let mut v = view(&l.w);
    v.judges_lapsed.insert((d, first[0].id));
    assert_eq!(v.version_in_force(&d).unwrap(), a1, "the active link's settlement stands");
}

/// F246, the active window (mechanic, the project lead's, under the
/// delegation): a settlement signed outside its link's active window
/// counts for nothing. Before the window opened: the next link settling
/// while the judge's stage still ran, placed so by the time reference,
/// counts for nothing even once the judge's stage passes. After it closed:
/// a link whose stage passed is void, the last link included, and the deal
/// waits on its reference.
#[test]
fn f246_a_settlement_outside_its_links_active_window_counts_for_nothing() {
    let (mut l, mut judges) = judged_deal(2);
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let r = ask_judge(&mut l);
    let ids: Vec<Hash> = judges.iter().map(|j| j.id).collect();
    let early = judge_settles(&mut l, &mut judges[2], r, b1, vec![a1], vec![]);
    let mut v = view(&l.w);
    v.judges_lapsed.insert((d, ids[0]));
    v.judges_lapsed.insert((d, ids[1]));
    assert_eq!(v.version_in_force(&d).unwrap(), b1, "unplaced, the third link's settlement counts once both stages passed");
    v.settled_out_of_turn.insert(early);
    assert_eq!(v.version_in_force(&d).unwrap(), d, "placed before its stage opened: it counts for nothing");
    let within = judge_settles(&mut l, &mut judges[2], r, a1, vec![b1], vec![]);
    let mut v = view(&l.w);
    v.judges_lapsed.insert((d, ids[0]));
    v.judges_lapsed.insert((d, ids[1]));
    v.settled_out_of_turn.insert(early);
    assert_eq!(v.version_in_force(&d).unwrap(), a1, "within its stage, the third link settles");
    v.judges_lapsed.insert((d, ids[2]));
    assert_eq!(v.version_in_force(&d).unwrap(), d, "had its stage passed first, the third link would be void too: the deal waits on its reference");
    let _ = within;
}

/// A split by the deal's service under its publication, numbered (DQ6),
/// following `transfers` (split key 8).
fn numbered_split(l: &mut ServiceDeal, receipt: Hash, payouts: Vec<agreements::Payout>, number: u64, transfers: Vec<(u64, Hash)>) -> Hash {
    let s = agreements::Split { receipt, payouts, cmip: spec("a split cMIP"), publication: l.publication, tally: None, number: Some(number), modules: vec![], metric_records: vec![], transfers };
    let all = vec![l.ana.id, l.ben.id];
    l.w.private_act(&mut l.svc, mirs().agreements, agreements::types::SPLIT, s.to_map(), None, all)
}

/// Ben's stake transfer of `share` of stake 0 to `to`, completed by the
/// buyer; not yet chain-signed.
fn ben_sells(l: &mut ServiceDeal, buyer: &mut Person, share: u64, record: Vec<Hash>) -> Hash {
    let t = agreements::StakeTransfer { agreement: l.deal, stake: 0, to: buyer.id, share, record };
    let x = agreements_act(&mut l.w, &mut l.ben, agreements::new_types::STAKE_TRANSFER, t.to_map(), obj(l.deal));
    sign(&mut l.w, buyer, &x);
    x
}

/// F223, decided by Nobody, allegedly, 10 October 2026 ("Agreed"), option
/// (b), no Identity change: a seller's payout receipt for a stake he
/// transferred is "after" the transfer, and wrong, once bound to a rotation
/// later than the transfer's chain signature (the seller's identity line).
/// Until then, what moves the money is the service: from its first split
/// citing the transfer (split key 8), every payout to the seller for that
/// stake is the service's debt to the buyer, in the share sold, receipted
/// or not; "first" and "from" read on the service's split numbers under
/// the deal (DQ6). Before it, the window: a stated cost, with its second
/// edge, the seller's next rotation.
#[test]
fn f223_from_the_services_first_split_citing_the_transfer_the_buyer_is_owed() {
    use mor_core::money::{Amount, Payer, Payload as Fin, Receipt};
    let mut l = ServiceDeal::new();
    let bid = l.ben.id;
    let mut carla = l.w.genesis("carla, who buys", vec![own_home()], None, None);
    let x = ben_sells(&mut l, &mut carla, 200_000, vec![]);
    let ben = l.ben.clone();
    let (_, ben) = l.w.chain_sign(&ben, x);
    l.ben = ben;
    assert!(view(&l.w).transfer(&x).unwrap().effective);
    let receipt_for = |w: &mut World, ben: &mut Person, split: Hash, proof: &[u8]| {
        let r = Fin::Receipt(Receipt { rail: spec("a rail Module"), proof: proof.to_vec(), payer: Some(Payer::Identity(spec("the service"))), payee: bid, amount: Amount { unit: spec("a unit"), value: 320 }, fulfils: split, previous: None, forward: None, batch: None, purchase: None });
        let a = w.everyday_act(ben, mirs().money, 2, r.to_map(), None, None);
        w.add(&a)
    };
    // The window: split 1 does not cite the transfer; Ben receipts it,
    // bound to his rotation before the chain signature. Not yet owed.
    let (r1, _) = l.sale(b"sale one", vec![]);
    let s1 = { let p = l.stake_payouts(); numbered_split(&mut l, r1, p, 1, vec![]) };
    let mut b = l.ben.clone();
    receipt_for(&mut l.w, &mut b, s1, b"s1");
    assert!(view(&l.w).service_account(&l.svc.id).unwrap().owed_to_buyers.is_empty(), "the window before the first citing split: a stated cost");
    // Split 2 cites the transfer and still pays Ben on the old holdings,
    // and Ben's receipt is bound before his chain signature: owed anyway.
    let (r2, _) = l.sale(b"sale two", vec![]);
    let s2 = { let p = l.stake_payouts(); numbered_split(&mut l, r2, p, 2, vec![(0, x)]) };
    receipt_for(&mut l.w, &mut b, s2, b"s2");
    // Split 3 does not cite it, but comes after split 2 on the service's numbers.
    let (r3, _) = l.sale(b"sale three", vec![]);
    let s3 = { let p = l.stake_payouts(); numbered_split(&mut l, r3, p, 3, vec![]) };
    // Split 4 follows the transfer rightly: Ben 160, Carla 160.
    let (r4, _) = l.sale(b"sale four", vec![]);
    let right = vec![
        agreements::Payout { stake: Some(0), ..payout(l.ana.id, 480) },
        agreements::Payout { stake: Some(0), ..payout(bid, 160) },
        agreements::Payout { stake: Some(0), ..payout(carla.id, 160) },
    ];
    numbered_split(&mut l, r4, right, 4, vec![(0, x)]);
    let mut owed = view(&l.w).service_account(&l.svc.id).unwrap().owed_to_buyers;
    owed.sort();
    let mut want = vec![(s2, 1, carla.id, 160), (s3, 1, carla.id, 160)];
    want.sort();
    assert_eq!(owed, want, "from the first split citing the transfer, the service owes the buyer");
    // The second edge: Ben rotates; his receipt for split 1, bound to the
    // new rotation, is after the transfer, and wrong (F217, F223).
    let (_, mut b) = l.w.rotate(&b, Rot::default());
    let late = receipt_for(&mut l.w, &mut b, s1, b"s1, after the rotation");
    assert!(view(&l.w).transfer(&x).unwrap().wrong_receipts.contains(&late));
    assert!(view(&l.w).service_account(&l.svc.id).unwrap().owed_to_buyers.contains(&(s1, 1, carla.id, 160)));
}

/// F224, decided by Nobody, allegedly, 10 October 2026 ("Yes"): a stake's
/// transfers are ordered on the seller's own line (their chain
/// signatures); each is checked against what the seller still held at that
/// point; transfers that fit are all valid (two partial sales are not a
/// fork); an over-sale confers nothing, and its payment is owed back by
/// the seller (Money, rule 10c: money received for nothing). The order is
/// the chain signatures', never the order the transfers were written in.
#[test]
fn f224_a_stake_sold_twice_is_settled_on_the_sellers_own_line() {
    use mor_core::money::{Amount, Claim, Payload as Fin};
    let mut l = ServiceDeal::new();
    let bid = l.ben.id;
    let mut carla = l.w.genesis("carla", vec![own_home()], None, None);
    let mut dan = l.w.genesis("dan", vec![own_home()], None, None);
    let mut eve = l.w.genesis("eve", vec![own_home()], None, None);
    // Ben holds 400,000. Written first, signed on his line last: 300,000 to Eve.
    let to_eve = ben_sells(&mut l, &mut eve, 300_000, vec![]);
    let to_carla = ben_sells(&mut l, &mut carla, 200_000, vec![]);
    let to_dan = ben_sells(&mut l, &mut dan, 100_000, vec![]);
    for t in [to_carla, to_dan, to_eve] {
        let ben = l.ben.clone();
        let (_, ben) = l.w.chain_sign(&ben, t);
        l.ben = ben;
    }
    let v = view(&l.w);
    let (c, d, e) = (v.transfer(&to_carla).unwrap(), v.transfer(&to_dan).unwrap(), v.transfer(&to_eve).unwrap());
    assert!(c.effective && d.effective, "two partial sales that fit are both valid, not a fork: {:?} {:?}", c.problems, d.problems);
    assert_eq!((c.held_before, d.held_before), (Some(400_000), Some(200_000)), "each checked against what Ben still held");
    assert!(c.place < d.place && d.place < e.place);
    assert!(!e.effective && e.over_sale, "300,000 of the 100,000 Ben still held: it confers nothing ({:?})", e.problems);
    assert_eq!(e.held_before, Some(100_000));
    // Payments: each names the transfer it pays for (fulfils). Eve's is owed
    // back by Ben; Carla's is a purchase.
    let pays = |w: &mut World, buyer: &mut Person, t: Hash, proof: &[u8]| {
        let c = Fin::Claim(Claim { rail: spec("a rail Module"), proof: proof.to_vec(), payee: bid, amount: Amount { unit: spec("a unit"), value: 5000 }, fulfils: t, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None, previous: None });
        let a = w.everyday_act(buyer, mirs().money, 3, c.to_map(), None, None);
        w.add(&a)
    };
    let pe = pays(&mut l.w, &mut eve, to_eve, b"eve pays");
    let pc = pays(&mut l.w, &mut carla, to_carla, b"carla pays");
    let v = common::stand_in_answers(view(&l.w));
    assert!(matches!(v.purchase(&pe).unwrap().map(|p| p.verdict), Some(agreements::PurchaseVerdict::NoPurchase { why }) if why.contains("over-sale")), "the over-sale's payment is owed back by the seller");
    assert_eq!(v.purchase(&pc).unwrap().map(|p| p.verdict), Some(agreements::PurchaseVerdict::Purchase));
    assert_eq!(v.transfer(&to_eve).unwrap().owed_back, vec![pe]);
    assert!(v.transfer(&to_carla).unwrap().owed_back.is_empty());
    // A payment made first (against the client conformance line), named by
    // the transfer in field 4: an over-sale owes it back too.
    let mut fay = l.w.genesis("fay", vec![own_home()], None, None);
    let early = pays(&mut l.w, &mut fay, spec("Ben's word, before any transfer"), b"fay pays first");
    let to_fay = ben_sells(&mut l, &mut fay, 50_000, vec![early]);
    let ben = l.ben.clone();
    l.w.chain_sign(&ben, to_fay);
    let f = view(&l.w).transfer(&to_fay).unwrap();
    assert!(f.effective, "50,000 of the 100,000 still held: it fits ({:?})", f.problems);
    let _ = f;
}

/// F224, client conformance: a buyer's client pays only once the seller's
/// transfer is on the seller's resolved line (receipted by his homes,
/// where he has operated homes) and checked against what he still holds.
#[test]
fn f224_a_buyers_client_pays_only_once_the_transfer_is_placed_and_fits() {
    let mut l = ServiceDeal::new();
    let mut carla = l.w.genesis("carla", vec![own_home()], None, None);
    let mut dan = l.w.genesis("dan", vec![own_home()], None, None);
    let x = ben_sells(&mut l, &mut carla, 300_000, vec![]);
    assert!(view(&l.w).transfer_payable(&x).unwrap().is_err(), "not yet on Ben's line: do not pay");
    let ben = l.ben.clone();
    let (_, ben) = l.w.chain_sign(&ben, x);
    l.ben = ben;
    assert_eq!(view(&l.w).transfer_payable(&x).unwrap(), Ok(100_000), "placed and fits: pay; Ben keeps 100,000");
    let y = ben_sells(&mut l, &mut dan, 200_000, vec![]);
    let ben = l.ben.clone();
    let (_, ben) = l.w.chain_sign(&ben, y);
    l.ben = ben;
    assert!(view(&l.w).transfer_payable(&y).unwrap().is_err_and(|w| w.contains("over-sale")), "Dan's client sees the earlier sale: do not pay");
}

/// An ownership agreement on a claim of `work` by `by`, its holders as
/// given (identities, or other ownership agreements by their founding
/// versions), its parties the holders, signed by `by` and `signers`. Its
/// founding id.
fn owned_by(w: &mut World, by: &mut Person, work: Hash, holders: &[(Hash, u64)], signers: &mut [&mut Person]) -> Hash {
    let c = common::claim_alone(w, by, &mirs(), work);
    let t = common::ownership_terms(c, holders, "A work's ownership, its holders as given.");
    let d = agreements_act(w, by, agreements::types::TERMS, t.to_map(), None);
    sign(w, by, &d);
    for s in signers.iter_mut() {
        sign(w, s, &d);
    }
    d
}

/// A split of a 1000- (or `value`-) unit receipt `svc` signs for the
/// publication `pb`, naming `owners` in field 9, with these payouts.
fn split_through(w: &mut World, svc: &mut Person, pb: Hash, owners: Hash, value: u64, payouts: Vec<agreements::Payout>, to: Vec<Hash>, proof: &[u8]) -> Hash {
    use mor_core::money::{Amount, Payer, Payload as Fin, Purchase, Receipt};
    let r = Fin::Receipt(Receipt { rail: spec("a rail Module"), proof: proof.to_vec(), payer: Some(Payer::Identity(spec("a fan"))), payee: svc.id, amount: Amount { unit: spec("a unit"), value }, fulfils: pb, previous: None, forward: None, batch: None, purchase: Some(Purchase { agreement: owners, line: owners }) });
    let a = w.everyday_act(svc, mirs().money, 2, r.to_map(), None, None);
    let receipt = w.add(&a);
    let sp = agreements::Split { receipt, payouts, cmip: spec("a split cMIP"), publication: pb, number: Some(1), ..Default::default() };
    w.private_act(svc, mirs().agreements, agreements::types::SPLIT, sp.to_map(), None, sorted(to))
}

/// F235 and rule 15, as the publication carries them: an owner that is
/// another ownership agreement (a manifest's parts, rule 7) is paid
/// through it, in the same split: the split service divides that owner's
/// part among that agreement's holders by their shares, each payout naming
/// that agreement (key 2). The album's agreement holds the song's (85%)
/// and a label's share (15%); the song's divides 60/40. Paying Ana the
/// song's whole part, or naming the album for her, breaks the plan.
#[test]
fn f235_an_owner_that_is_an_ownership_agreement_is_paid_through_it() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut label = w.genesis("a label", vec![own_home()], None, None);
    let mut svc = w.genesis("the album's split service", vec![own_home()], None, None);
    let (aid, bid, lid, sid) = (ana.id, ben.id, label.id, svc.id);
    let we = owned_by(&mut w, &mut ana, spec("a song, F235"), &[(aid, 600_000), (bid, 400_000)], &mut [&mut ben]);
    let pe = owned_by(&mut w, &mut label, spec("an album, F235"), &[(we, 850_000), (lid, 150_000)], &mut [&mut ana, &mut ben]);
    assert_eq!(view(&w).agreement(&pe).unwrap().exists, Some(true), "the song's agreement signed by its own rule, the label by its own act: {:?}", view(&w).agreement(&pe).unwrap());
    let pb = publish_under(&mut w, &mut label, pe, sid, &mut [&mut ana, &mut ben, &mut svc], &|_| {});
    assert!(view(&w).publication(&pb).unwrap().counts, "{:?}", view(&w).publication(&pb).unwrap().problems);
    let all = vec![aid, bid, lid];
    let good = split_through(&mut w, &mut svc, pb, pe, 1000, vec![line_payout(lid, 150, pe), line_payout(aid, 510, we), line_payout(bid, 340, we)], all.clone(), b"a fan pays");
    let e = view(&w).split(&good).unwrap();
    assert!(e.mismatched.is_empty() && e.problems.is_empty(), "{:?} {:?}", e.mismatched, e.problems);
    let whole = split_through(&mut w, &mut svc, pb, pe, 1000, vec![line_payout(lid, 150, pe), line_payout(aid, 850, we)], all.clone(), b"another fan");
    assert!(!view(&w).split(&whole).unwrap().mismatched.is_empty(), "the song's part, divided by its own stake");
    let unnamed = split_through(&mut w, &mut svc, pb, pe, 1000, vec![line_payout(lid, 150, pe), line_payout(aid, 510, pe), line_payout(bid, 340, pe)], all, b"a third fan");
    assert!(!view(&w).split(&unnamed).unwrap().mismatched.is_empty(), "Ana and Ben hold nothing of the album's agreement directly");
}

/// F235: "It could even be three layers, and it should." Three ownership
/// agreements nested: a pool's (the album's 70%, a music service's 30%),
/// the album's (the song's 85%, the label's 15%), the song's (Ana 60%, Ben
/// 40%): one split pays every layer's holders, each payout naming the
/// agreement it is paid through.
#[test]
fn f235_three_layers_a_pool_a_publication_and_a_work() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut label = w.genesis("a label", vec![own_home()], None, None);
    let mut music = w.genesis("a music service", vec![own_home()], None, None);
    let mut svc = w.genesis("the pool's split service", vec![own_home()], None, None);
    let (aid, bid, lid, mid, sid) = (ana.id, ben.id, label.id, music.id, svc.id);
    let we = owned_by(&mut w, &mut ana, spec("a song, three layers"), &[(aid, 600_000), (bid, 400_000)], &mut [&mut ben]);
    let pe = owned_by(&mut w, &mut label, spec("an album, three layers"), &[(we, 850_000), (lid, 150_000)], &mut [&mut ana, &mut ben]);
    let pool = owned_by(&mut w, &mut music, spec("a subscription pool, one month"), &[(pe, 700_000), (mid, 300_000)], &mut [&mut label, &mut ana, &mut ben]);
    assert_eq!(view(&w).agreement(&pool).unwrap().exists, Some(true));
    let pb = publish_under(&mut w, &mut music, pool, sid, &mut [&mut label, &mut ana, &mut ben, &mut svc], &|_| {});
    assert!(view(&w).publication(&pb).unwrap().counts, "{:?}", view(&w).publication(&pb).unwrap().problems);
    let payouts = vec![line_payout(mid, 600, pool), line_payout(lid, 210, pe), line_payout(aid, 714, we), line_payout(bid, 476, we)];
    let x = split_through(&mut w, &mut svc, pb, pool, 2000, payouts, vec![aid, bid, lid, mid], b"a month's subscription");
    let e = view(&w).split(&x).unwrap();
    assert!(e.mismatched.is_empty() && e.problems.is_empty(), "{:?} {:?}", e.mismatched, e.problems);
}

/// F244, as the publication carries it: a lone owner's ownership
/// agreement is paid at its owner: the owners' line goes to her whole.
/// Anyone else on that line is a mismatch.
#[test]
fn f244_a_lone_owners_agreement_is_paid_at_its_owner() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut svc = w.genesis("a split service, F244", vec![own_home()], None, None);
    let (aid, sid) = (ana.id, svc.id);
    let stranger = spec("someone the work's agreement never names");
    let we = owned_by(&mut w, &mut ana, spec("a song, F244"), &[(aid, 1_000_000)], &mut []);
    let pb = publish_under(&mut w, &mut ana, we, sid, &mut [&mut svc], &|_| {});
    let x = split_through(&mut w, &mut svc, pb, we, 1000, vec![line_payout(aid, 1000, we)], vec![aid], b"one");
    assert!(view(&w).split(&x).unwrap().mismatched.is_empty(), "the lone owner receives the owners' line");
    let y = split_through(&mut w, &mut svc, pb, we, 1000, vec![line_payout(stranger, 1000, we)], vec![aid, stranger], b"two");
    assert!(!view(&w).split(&y).unwrap().mismatched.is_empty(), "anyone else on the owners' line is a mismatch");
}


/// F221, decided by Nobody, allegedly, 10 October 2026 ("Yes, if that is
/// the version that shifts the weight and the responsible party the
/// best."), client conformance: before signing a successor of a version,
/// a client checks, across all its owner's devices, whether its owner has
/// already signed another successor of the same version, and shows the
/// first; a settling version its client signs names every successor of
/// the reference its owner signed. Finality stands (rule 45b; F192 and the
/// `review_fdb_*` pins).
#[test]
fn f221_a_client_never_signs_two_successors_of_one_version_silently() {
    let mut l = DealLab::new();
    let d = l.d;
    let (aid, bid) = (l.ana.id, l.ben.id);
    let a1 = l.version(d, "A.", None);
    // Ben's second device: a retry of the same change, proposed by Ana.
    let retry = l.propose(d, "A, retried from a device out of step.", None);
    let c = view(&l.w).before_signing(&bid, &retry).unwrap();
    assert_eq!(c.already_signed, vec![a1], "Ben already signed A1: his client shows it first");
    assert!(!c.clear());
    // Ana proposed the retry: proposing is signing, from whatever device.
    assert_eq!(view(&l.w).before_signing(&aid, &a1).unwrap().already_signed, vec![retry]);
    // Ben signs anyway, past the warning: the deal is forked.
    sign(&mut l.w, &mut l.ben, &retry);
    sign(&mut l.w, &mut l.ana, &retry);
    assert_eq!(l.in_force().unwrap(), d);
    // A settling version names every successor of the reference its
    // owner signed.
    let plain = l.propose(a1, "A plain change on A, settling nothing.", None);
    assert!(view(&l.w).before_signing(&bid, &plain).unwrap().clear(), "a plain version needs no naming");
    let good = l.propose(a1, "Settled for A, naming the retry.", Some(retry));
    assert!(view(&l.w).before_signing(&bid, &good).unwrap().clear(), "names every successor of the reference Ben signed");
    // A third, Ana's draft only: unnamed by `good`, and only Ana signed it.
    let c3 = l.propose(d, "C, Ana's draft from a third device.", None);
    assert!(view(&l.w).before_signing(&bid, &good).unwrap().unnamed.is_empty(), "Ben never signed C");
    assert_eq!(view(&l.w).before_signing(&aid, &good).unwrap().unnamed, vec![c3], "Ana's client names her own draft before she settles");
}

/// F222, decided by Nobody, allegedly, 10 October 2026 ("Agreed"): QH2 is
/// F192's stated cost (a newcomer on a branch the settlers hid is dropped
/// by their settlement); client conformance: before a newcomer signs onto
/// a deal, her client looks for another successor of a version on the line
/// she joins, at the parties' relays and keepers, and warns her. A branch
/// a settlement on her line already dropped is not warned of.
#[test]
fn f222_a_newcomers_client_looks_for_another_successor_and_warns() {
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A: in the open.", None);
    let b1 = l.version(d, "B: kept out of sight.", None);
    // Carla is asked to join on B.
    let mut carla = l.w.genesis("carla", vec![own_home()], None, None);
    let join = {
        let mut c = l.t.clone();
        c.parent = Some(b1);
        c.text = "B2: Carla joins.".into();
        c.parties = sorted(vec![l.ana.id, l.ben.id, carla.id]);
        c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![l.ana.id, l.ben.id]) }]);
        agreements_act(&mut l.w, &mut l.ana, agreements::types::TERMS, c.to_map(), obj(b1))
    };
    assert_eq!(view(&l.w).joining_warnings(&join).unwrap(), vec![a1], "her client finds A beside the line she joins, and warns her");
    // The stated cost, unchanged: if she signs anyway and the settlers
    // settle for A naming only B1, her branch is dropped (F192).
    sign(&mut l.w, &mut carla, &join);
    // On a line that settled its fork, the branch dropped is not warned of.
    let mut l = DealLab::new();
    let d = l.d;
    let a1 = l.version(d, "A.", None);
    let b1 = l.version(d, "B.", None);
    let s = l.version(a1, "Settled for A, naming B.", Some(b1));
    let next = l.propose(s, "Carla joins the settled line.", None);
    assert!(view(&l.w).joining_warnings(&next).unwrap().is_empty());
}

// ---------------------------------------------------------------- Agreements rules 48 and 89: F270, F274, F279, F280

fn f270_version(t: &Terms, parent: Hash, voices: &[Hash], f: &dyn Fn(&mut Terms)) -> Terms {
    let mut c = t.clone();
    c.parent = Some(parent);
    c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(voices.to_vec()) }]);
    f(&mut c);
    c
}

/// The label for the F279 tests: Ana, Ben and Cy hold its own stake; the
/// clause lets the authority remove a voice or share out a stake. Cy leaves, keeping 300,000 of the
/// label's own stake, and any succession plan for it (M1).
fn f270_label() -> (Lab, Hash) {
    f270_label_with(&|_| {})
}

fn f270_label_with(g: &dyn Fn(&mut Terms)) -> (Lab, Hash) {
    let mut lab = Lab::new(&|t| {
        let p = t.parties.clone();
        t.stakes = stakes(vec![own(vec![(p[ANA], 400_000), (p[BEN], 300_000), (p[CY], 300_000)])]);
        t.abandonment.as_mut().unwrap().outcomes = vec![outcomes::VOICE_REMOVED, outcomes::STAKE_REDISTRIBUTED];
        g(t);
    });
    let f = lab.founding;
    let ids = lab.ids();
    let keep = vec![ids[ANA], ids[BEN]];
    let cy = ids[CY];
    let leave = |t: &mut Terms| {
        t.parties = keep.clone();
        let g = t.grammar.as_mut().unwrap();
        // With no recovery path, the key must rotate without one of them.
        let n = if g.recovery.is_some() { 2 } else { 1 };
        g.chain_key = Holding::Shares { threshold: n, members: keep.clone() };
        t.departed = Some(vec![cy]);
        // Two members left: one of the others is all a threshold can ask.
        if let Some(a) = t.abandonment.as_mut() {
            if let Authority::Others(n) = a.authority {
                a.authority = Authority::Others(n.min(1));
            }
        }
        // M1: a departed holder's plan keeps its stake part alone.
        if let Some(plans) = t.succession.as_mut() {
            for s in plans.iter_mut().filter(|s| s.party == cy) {
                s.seats = None;
                s.entry = None;
            }
        }
    };
    let k = f270_in_force(&mut lab, &f, &[ANA, BEN, CY], &leave, &[]);
    (lab, k)
}

/// A clone of `parent` changed by `f`, its mark the powers the core says it
/// needs, met by `who`, signed by them and by `also`, put in force: by a
/// rotation where it changes the constitution, else by a record.
fn f270_in_force(lab: &mut Lab, parent: &Hash, who: &[usize], f: &dyn Fn(&mut Terms), also: &[usize]) -> Hash {
    let probe = lab.clone_terms(parent, vec![], f);
    let powers = lab.view().powers_needed(&probe).unwrap();
    let mark = powers.iter().map(|p| (p.clone(), who.to_vec())).collect();
    let t = lab.clone_terms(parent, mark, f);
    let k = lab.propose(who[0], &t);
    let s: Vec<Hash> = who.iter().chain(also).map(|i| lab.sign(*i, &k)).collect();
    if powers.contains(&Power::Constitutional) {
        lab.rotate(Some((k, s)), &[0]);
        let p = lab.publish(0);
        lab.sign(ANA, &p);
        assert_eq!(lab.in_force(&p), k);
    } else {
        let r = lab.record(0, Some((k, s)), &[], vec![], k);
        assert_eq!(puts(lab, &r), Some(k), "{:?}", lab.view().agreement(&k).unwrap());
    }
    k
}

/// Rule 48, as the split agreement carries it: a version of the label's
/// split agreement that pays its stake less (a partner's share added, off
/// the top) needs the signature of every holder it pays less who has no
/// voice in the power making the change: Cy, departed.
#[test]
fn f270_f274_a_departed_holder_signs_a_split_agreement_version_that_pays_it_less() {
    let (mut lab, _k) = f270_label();
    let mut svc = lab.w.genesis("the label's split service", vec![own_home()], None, None);
    let sa = lab.split_agreement(&mut svc);
    assert!(lab.view().publication(&sa).unwrap().counts);
    let mut partner = lab.w.genesis("a partner", vec![own_home()], None, None);
    let pid = partner.id;
    let mut p = lab.view().publication(&sa).unwrap().publication;
    p.partners = vec![agreements::Partner { identity: pid, share: 100_000, label: None }];
    let f = lab.founding;
    let v2 = agreements_act(&mut lab.w, &mut lab.c[0], agreements::types::PUBLICATION, p.to_map(), Some(vec![Object { chain: sa, predecessor: sa }, Object { chain: f, predecessor: f }]));
    sign(&mut lab.w, &mut svc, &v2);
    sign(&mut lab.w, &mut partner, &v2);
    // Signed for the label as its first version was: Ana and Ben, every
    // member (rules 15, 67).
    for i in [ANA, BEN] {
        lab.sign(i, &v2);
    }
    assert!(!lab.view().publication(&v2).unwrap().counts, "Cy, departed, has not signed what pays the stake less");
    lab.sign(CY, &v2);
    assert!(lab.view().publication(&v2).unwrap().counts, "with Cy's signature");
}

/// Cy's stake in the label passing whole to `to`, or shared out among Ana
/// and Ben in proportion to their shares; Cy no longer departed, holding
/// nothing, and Cy's plan dropped as executed.
fn f279_moved(lab: &Lab, to: Option<Hash>) -> impl Fn(&mut Terms) {
    let ids = lab.ids();
    move |t: &mut Terms| {
        let i = t.own_stake().unwrap().0;
        let st = &mut t.stakes.as_mut().unwrap()[i];
        st.holders = match to {
            // 400,000 + 300,000 × 4/7 = 571,428.57…; 300,000 + 300,000 × 3/7 = 428,571.43…
            None => vec![(Who::Id(ids[ANA]), 571_429), (Who::Id(ids[BEN]), 428_571)],
            Some(h) => vec![(Who::Id(ids[ANA]), 400_000), (Who::Id(ids[BEN]), 300_000), (Who::Id(h), 300_000)],
        };
        t.departed = None;
        t.succession = None;
    }
}

/// Freeze suite v24, 3.7y (Agreements draft 12, rules 48 and 89: F279,
/// decided by Nobody, allegedly: "What abandonment can trigger in that
/// regard is succession. Where the stake and associated pay go to the
/// successor."). Cy, departed, names a stake successor. Declared absent,
/// Cy's stake passes whole to the successor by a clone the members sign
/// alone; the successor, who holds it with no voice, must then sign a
/// lowering of its share. A declaration stating outcome 1 against Cy is
/// refused: the stake goes by succession.
#[test]
fn f279_a_declaration_passes_the_stake_to_the_successor() {
    let heir = spec("Cy's heir");
    let (mut lab, k) = f270_label_with(&move |t| {
        let cy = t.parties[CY];
        t.succession = Some(vec![SuccessionPlan { party: cy, stakes: Some(vec![(heir, 1_000_000)]), seats: None, entry: None }]);
    });
    let f = lab.founding;
    // Outcome 1 against a holder whose plan names a stake successor: refused.
    let d1 = lab.declare(None, f, f, CY, vec![outcomes::STAKE_REDISTRIBUTED]);
    let w = lab.view().declaration(&d1).unwrap().unwrap_err();
    assert!(w.contains("rule 89"), "{w}");
    // Outcome 0 alone: valid, and the plan executes.
    let d0 = lab.declare(None, f, f, CY, vec![outcomes::VOICE_REMOVED]);
    assert!(lab.view().declaration(&d0).unwrap().is_ok());
    // Shared out instead of passed to the heir: not the plan, Cy signs.
    let t = lab.clone_terms(&k, vec![], &f279_moved(&lab, None));
    let powers = lab.view().powers_needed(&t).unwrap();
    let t = lab.clone_terms(&k, powers.iter().map(|p| (p.clone(), vec![ANA, BEN])).collect(), &f279_moved(&lab, None));
    let y = lab.propose(ANA, &t);
    lab.sign(ANA, &y);
    lab.sign(BEN, &y);
    assert!(!lab.view().agreement(&y).unwrap().ready, "the plan names the heir");
    // The stake passes whole to the heir: the members alone.
    let to_heir = f279_moved(&lab, Some(heir));
    let k2 = f270_in_force(&mut lab, &k, &[ANA, BEN], &to_heir, &[]);
    let t2 = lab.view().terms(&k2).unwrap();
    assert_eq!(t2.own_stake().unwrap().1.share_of(&Who::Id(heir)), 300_000);
    // The heir holds it with no voice: a version lowering its share needs
    // the heir.
    let t = lab.clone_terms(&k2, vec![(Power::Clone, vec![ANA, BEN])], &|t| {
        let i = t.own_stake().unwrap().0;
        t.stakes.as_mut().unwrap()[i].holders = vec![(Who::Id(t.parties[0]), 500_000), (Who::Id(t.parties[1]), 300_000), (Who::Id(heir), 200_000)];
    });
    let z = lab.propose(ANA, &t);
    lab.sign(ANA, &z);
    lab.sign(BEN, &z);
    assert!(!lab.view().agreement(&z).unwrap().ready, "the heir has not signed (rule 48)");
}

/// Freeze suite v24, 3.7y (F279): Cy, departed, names no stake successor.
/// Declared absent with outcome 1, Cy's stake is shared out among Ana and
/// Ben in proportion to their shares, by a clone the members sign alone. A
/// clone lowering Cy's share but leaving Cy part of it, or
/// sharing it out otherwise than in proportion, still needs Cy; and with a
/// declaration that only removes a voice, nothing moves without Cy.
#[test]
fn f279_with_no_successor_outcome_1_shares_the_stake_out() {
    for outs in [vec![outcomes::STAKE_REDISTRIBUTED], vec![outcomes::VOICE_REMOVED]] {
        let (mut lab, k) = f270_label();
        let f = lab.founding;
        let ids = lab.ids();
        lab.declare(None, f, f, CY, outs.clone());
        let shared = outs.contains(&outcomes::STAKE_REDISTRIBUTED);
        let moved = f279_moved(&lab, None);
        let probe = lab.clone_terms(&k, vec![], &moved);
        let mark: Vec<(Power, Vec<usize>)> = lab.view().powers_needed(&probe).unwrap().into_iter().map(|p| (p, vec![ANA, BEN])).collect();
        // Not in proportion, or Cy keeping part: Cy signs, whatever the outcome.
        for (bad, holders) in [
            ("out of proportion", vec![(Who::Id(ids[ANA]), 700_000), (Who::Id(ids[BEN]), 300_000)]),
            ("Cy keeps part", vec![(Who::Id(ids[ANA]), 450_000), (Who::Id(ids[BEN]), 350_000), (Who::Id(ids[CY]), 200_000)]),
        ] {
            let t = lab.clone_terms(&k, mark.clone(), &|t| {
                moved(t);
                let i = t.own_stake().unwrap().0;
                t.stakes.as_mut().unwrap()[i].holders = holders.clone();
                if holders.iter().any(|(w, _)| *w == Who::Id(ids[CY])) {
                    t.departed = Some(vec![ids[CY]]);
                }
            });
            let x = lab.propose(ANA, &t);
            lab.sign(ANA, &x);
            lab.sign(BEN, &x);
            assert!(!lab.view().agreement(&x).unwrap().ready, "{outs:?}, {bad}");
        }
        let t = lab.clone_terms(&k, mark.clone(), &moved);
        let x = lab.propose(ANA, &t);
        lab.sign(ANA, &x);
        lab.sign(BEN, &x);
        assert_eq!(lab.view().agreement(&x).unwrap().ready, shared, "{outs:?}");
        if !shared {
            continue;
        }
        f270_in_force(&mut lab, &k, &[ANA, BEN], &moved, &[]);
    }
}

/// Freeze suite v24, 3.7y (F279): where the clause's authority is two of
/// the other members, the declaration that moves a departed holder's stake
/// counts once two have signed it, placed at the line where the clone is
/// judged (rule 85, Q37): Ana's declaration alone does not; with Ben's
/// signature act on it, which the label acknowledged before the rotation,
/// it does. Taking Cy out of the departed members entry is constitutional,
/// so the clone comes into force by a rotation. The declaration names the
/// version Cy signed as a member, whose clause asks two (rule 87, reading 7
/// as built).
#[test]
fn f279_a_threshold_authority_moves_the_stake_at_the_line() {
    for cosigned in [false, true] {
        let (mut lab, k) = f270_label_with(&others_judge_absence);
        let f = lab.founding;
        let d = lab.declare(Some(ANA), f, f, CY, vec![outcomes::STAKE_REDISTRIBUTED]);
        if cosigned {
            let sb = lab.sign(BEN, &d);
            lab.acknowledge(0, sb);
        }
        let moved = f279_moved(&lab, None);
        let probe = lab.clone_terms(&k, vec![], &moved);
        let powers = lab.view().powers_needed(&probe).unwrap();
        assert_eq!(powers, vec![Power::Constitutional]);
        let t = lab.clone_terms(&k, vec![(Power::Constitutional, vec![ANA, BEN])], &moved);
        let k2 = lab.propose(ANA, &t);
        let s1 = lab.sign(ANA, &k2);
        let s2 = lab.sign(BEN, &k2);
        assert_eq!(lab.view().agreement(&k2).unwrap().ready, cosigned, "cosigned: {cosigned}");
        if cosigned {
            lab.rotate(Some((k2, vec![s1, s2])), &[0]);
            let p = lab.publish(0);
            lab.sign(ANA, &p);
            assert_eq!(lab.in_force(&p), k2, "the stake shared out at the rotation");
        }
    }
}

// ---------------------------------------------------------------------------
// F284 (decided by Nobody, allegedly, 13 October 2026: "The deal in
// question is based on a vow. Somebody owns the vow."): a deal made on a
// vow has an owner, the vow's signer, who holds the stake; the overhead
// comes off the top, and what is left is hers. Agreements draft 13, rule 14;
// `docs/f282-f284-build.md`. Test identities only.
// ---------------------------------------------------------------------------

/// A vow (Envelopes type 5, F237) signed by `p`: its genesis id is its name.
fn f284_vow(w: &mut World, p: &mut Person, words: &str) -> Hash {
    let v = mor_core::envelopes::vow::Vow { words: words.into(), cmip: None };
    let a = w.everyday_act(p, mirs().envelopes, mor_core::envelopes::types::VOW, v.to_map(), None, None);
    w.add(&a)
}

/// A job's ownership agreement among `parties`, on `by`'s claim of the vow
/// `vow`'s name, its one stake held as `holders` says. Its founding id,
/// signed by every party.
fn f284_job(w: &mut World, by: &mut Person, others: &mut [&mut Person], vow: Hash, holders: Vec<(Hash, u64)>, text: &str) -> Hash {
    let c = common::claim_alone(w, by, &mirs(), vow);
    let mut t = common::ownership_terms(c, &holders, text);
    let mut parties = vec![by.id];
    parties.extend(others.iter().map(|p| p.id));
    t.parties = parties;
    let d = agreements_act(w, by, agreements::types::TERMS, t.to_map(), None);
    sign(w, by, &d);
    for p in others.iter_mut() {
        sign(w, p, &d);
    }
    d
}

/// Freeze suite v26, 1.9f (Agreements rule 14; F284), as the ownership
/// agreement carries it: a cleaner's vow; the job's ownership agreement
/// with a platform, on a claim of the vow's name, gives her, the vow's
/// signer, the whole stake in its founding version; written otherwise,
/// wholly or in part, it is invalid where the verifier holds the vow. From
/// then on the stake moves as any stake moves: a later version she signs
/// may share it.
#[test]
fn f284_a_deal_on_a_vow_names_its_signer_as_the_stakes_holder() {
    let mut w = World::new();
    let mut cleaner = w.genesis("a cleaner", vec![own_home()], None, None);
    let mut platform = w.genesis("a platform", vec![own_home()], None, None);
    let vow = f284_vow(&mut w, &mut cleaner, "Cleaning, two hours, at your home");
    let ids = vec![cleaner.id, platform.id];
    let d = f284_job(&mut w, &mut cleaner, &mut [&mut platform], vow, vec![(ids[0], 1_000_000)], "Hers.");
    let a = view(&w).agreement(&d).unwrap();
    assert_eq!((a.invalid.clone(), a.exists), (None, Some(true)), "the cleaner holds the stake in her own vow");
    for (name, holders) in [
        ("the platform holding part of it", vec![(ids[0], 900_000), (ids[1], 100_000)]),
        ("the platform holding it", vec![(ids[1], 1_000_000)]),
    ] {
        let x = f284_job(&mut w, &mut platform, &mut [&mut cleaner], vow, holders, name);
        let a = view(&w).agreement(&x).unwrap();
        assert!(a.invalid.as_deref().is_some_and(|r| r.contains("F284")), "{name}: {:?}", a.invalid);
        assert_eq!(a.exists, Some(false), "{name}");
    }
    // A later version she signs shares her stake (rule 48).
    let t = view(&w).terms(&d).unwrap();
    let shared = f270_version(&t, d, &sorted(ids.clone()), &|x: &mut Terms| {
        x.stakes.as_mut().unwrap()[0].holders = vec![(Who::Id(ids[0]), 900_000), (Who::Id(ids[1]), 100_000)];
    });
    let k2 = agreements_act(&mut w, &mut platform, agreements::types::TERMS, shared.to_map(), obj(d));
    sign(&mut w, &mut platform, &k2);
    sign(&mut w, &mut cleaner, &k2);
    let a = view(&w).agreement(&k2).unwrap();
    assert_eq!((a.invalid, a.exists), (None, Some(true)), "a share of her stake, given with her signature");
}

/// F285 (decided by Nobody, allegedly, 13 October 2026: "A platform sells
/// somebody else's vow… sounds like cMIP to me"), as the publication carries
/// it: a publication selling the cleaner's vow under the ownership
/// agreement claiming it counts once every party signed it; the core shows
/// such a sale, and how a marketplace sells others' vows is a cMIP's.
#[test]
fn f285_a_publication_selling_a_vow_counts_under_its_ownership_agreement() {
    let mut w = World::new();
    let mut cleaner = w.genesis("a cleaner", vec![own_home()], None, None);
    let mut platform = w.genesis("a platform", vec![own_home()], None, None);
    let vow = f284_vow(&mut w, &mut cleaner, "Cleaning, two hours, at your home");
    let cid = cleaner.id;
    let d = f284_job(&mut w, &mut cleaner, &mut [], vow, vec![(cid, 1_000_000)], "Hers.");
    let pid = platform.id;
    let pb = publish_under(&mut w, &mut cleaner, d, pid, &mut [&mut platform], &|p| {
        p.sold = Some(vec![agreements::Sold::Vow(vow)]);
        p.words = Some("Two hours of cleaning, booked through the platform.".into());
        p.partners = vec![agreements::Partner { identity: pid, share: 100_000, label: None }];
    });
    let e = view(&w).publication(&pb).unwrap();
    assert!(e.counts && e.problems.is_empty(), "{:?}", e.problems);
}

/// Rule 14: "A publication selling a vow that no ownership agreement claims
/// is a lone seller's publication: its drafter is its owners' side" (F405,
/// Q1). The platform's publication of the cleaner's vow, naming no
/// ownership agreement, counts on the platform's own signature; the
/// cleaner's signature is not asked, and she is paid nothing by it (the
/// stated cost).
#[test]
fn f285_a_publication_selling_anothers_vow_with_no_ownership_agreement_is_its_drafters() {
    let mut w = World::new();
    let mut cleaner = w.genesis("a cleaner", vec![own_home()], None, None);
    let mut platform = w.genesis("a platform", vec![own_home()], None, None);
    let vow = f284_vow(&mut w, &mut cleaner, "Cleaning, two hours, at your home");
    let p = agreements::Publication { sold: Some(vec![agreements::Sold::Vow(vow)]), owners: None, partners: vec![], service: platform.id, plan: common::test_plan(), words: Some("Two hours of cleaning.".into()), time: None, until: None, refund: None, cmips: vec![], designated: None, backups: vec![], failed: None };
    let pb = agreements_act(&mut w, &mut platform, agreements::types::PUBLICATION, p.to_map(), None);
    let e = view(&w).publication(&pb).unwrap();
    assert!(e.counts && e.problems.is_empty(), "the drafter is the owners' side: {:?}", e.problems);
    assert_eq!(e.parties, vec![platform.id], "the cleaner is no party of it");
    let _ = &mut cleaner;
}

/// F284 beside a collective: a member's vow, claimed by an ownership
/// agreement, is held by that member; the collective's own vow, by the
/// collective. Held otherwise, the founding version is invalid.
#[test]
fn f284_in_a_collective_the_vows_signer_holds_its_stake() {
    let mut lab = Lab::new(&|_| {});
    let ids = lab.ids();
    let label = lab.col.id;
    let anas = f284_vow(&mut lab.w, &mut lab.m[ANA], "Ana's lessons, an hour a week");
    let v = mor_core::envelopes::vow::Vow { words: "The label's summer concert".into(), cmip: None };
    let a = lab.w.everyday_act(&mut lab.c[0], mirs().envelopes, mor_core::envelopes::types::VOW, v.to_map(), None, None);
    let labels = lab.w.add(&a);
    for (name, object, holder, ok) in [
        ("Ana's vow, held by Ana", anas, ids[ANA], true),
        ("Ana's vow, held by Ben", anas, ids[BEN], false),
        ("Ana's vow, held by the collective", anas, label, false),
        ("the collective's vow, held by it", labels, label, true),
        ("the collective's vow, held by Ana", labels, ids[ANA], false),
    ] {
        let c = common::claim_alone(&mut lab.w, &mut lab.m[ANA], &mirs(), object);
        let mut t = common::ownership_terms(c, &[(holder, 1_000_000)], name);
        t.parties = vec![ids[ANA]];
        let k = agreements_act(&mut lab.w, &mut lab.m[ANA], agreements::types::TERMS, t.to_map(), None);
        lab.sign(ANA, &k);
        let a = lab.view().agreement(&k).unwrap();
        if ok {
            assert_eq!(a.invalid.clone(), None, "{name}");
        } else {
            assert!(a.invalid.as_deref().is_some_and(|r| r.contains("F284")), "{name}: {:?}", a.invalid);
        }
    }
}


/// A push rail's specification as these tests read it (F301): field 11 is
/// 1, and its proof binds the payee and the purpose (field 13 [0, 1]), as
/// the tests' push rails did before F301 made both fields of the spec.
fn push_rail_spec() -> mor_core::development::Rail {
    use mor_core::development::{Bound, Rail, RailKind};
    Rail { kind: RailKind::Push, binds: [Bound::Payee, Bound::Purpose].into_iter().collect() }
}

// ---------------------------------------------------------------- Agreements draft 14 (the code after step 15, part 3)

/// Freeze suite v28, 3.7aa (F304, F298; Fable's Agreements review, A4): a
/// verifier missing one act a line's history names voids nothing on that
/// line and takes no voice away: whether an act is before it is unknown,
/// and it judges again once it holds the act. An action citing a decision
/// the verifier does not hold is unknown.
#[test]
fn a_hole_in_the_history_voids_nothing_3_7aa() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let label = lab.col.id;
    // On the label's third device, an act Ben signs; on its second, an act
    // joining it that this verifier never receives. The line names only the
    // second device's tip: the third device's act is in its history only
    // through the act not held.
    let y = lab.cmip_act(2, pay());
    lab.sign(BEN, &y);
    let o = lab.chain(&[y]);
    let hole = lab.w.everyday_act(&mut lab.c[1], pay(), 0, vec![(Value::Uint(0), Value::Text("a receipt".into()))], Some(o), None);
    let hole_id = hole.id();
    // Ben resigns; the line registering it names the second device's tip.
    let mut ben = lab.m[BEN].clone();
    let res = lab.resign_from(&mut ben, f, None);
    lab.m[BEN] = ben;
    let line = lab.record(0, None, &[1], vec![res], f);
    assert!(lab.view().record(&label, &line).unwrap().line);
    // Whether `y` is before the line is unknown: Ben's voice on it is
    // neither kept nor taken away.
    assert_eq!(lab.view().consent(&y), Err(AgreementsError::Missing(hole_id)), "unknown, never void");
    // Held, it is judged: `y` lies before the line, and Ben's signature counts.
    lab.w.add(&hole);
    assert!(lab.counts(&y));
    // An action citing a decision this verifier does not hold is unknown.
    let mut o = lab.chain(&[]);
    o.push(Object { chain: label, predecessor: spec("a record this verifier does not hold") });
    let a = lab.w.everyday_act(&mut lab.c[0], pay(), 0, vec![(Value::Uint(0), Value::Text("a receipt".into()))], Some(o), None);
    let x = lab.w.add(&a);
    assert_eq!(lab.view().consent(&x), Err(AgreementsError::Missing(spec("a record this verifier does not hold"))));
}

/// Freeze suite v28, 3.7z (F302; Fable's Agreements review, A1): a member
/// resigns, the label's line registers it and lives on under it; the member
/// rotates and disowns the resignation: the line stands, as does every record
/// after it, before and after the label registers the rotation (C5, "placed
/// by this line before any line of the collective registering the rotation
/// that voided it"), the resignation shown disputed under Identity. A
/// declaration of absence by an
/// authority who is no party, registered by a line, stays registered when
/// the authority rotates and disowns it: no line of the label registers that
/// rotation, and the declaration is kept wherever the line placed it.
#[test]
fn what_the_line_placed_stays_placed_3_7z() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let label = lab.col.id;
    let ben_phone = lab.m[BEN].clone();
    let mut ben_laptop = device(&ben_phone);
    lab.cmip_act(0, pay());
    // Ben resigns from his laptop; the label's line registers it.
    let res = lab.resign_from(&mut ben_laptop, f, None);
    let line = lab.record(0, None, &[], vec![res], f);
    assert!(lab.view().record(&label, &line).unwrap().line);
    // The label lives on under that line: a later clone, and its record.
    let t = lab.clone_terms(&f, vec![(Power::Area(1), vec![ANA])], &|t| words(t, 1, "Monthly releases."));
    let k = lab.propose(ANA, &t);
    let s = lab.sign(ANA, &k);
    let r = lab.record(0, Some((k, vec![s])), &[], vec![], k);
    assert_eq!(puts(&lab, &r), Some(k));
    // Ben rotates, keeping his phone and forgetting the laptop: the
    // resignation is void under Identity.
    let (rot, ben2) = lab.w.rotate(&lab.m[BEN], Rot::default());
    lab.m[BEN] = ben2;
    assert!(matches!(lab.w.v.status(&res), Status::Void | Status::Disputed));
    // The line stands at once: no line of the label registers the rotation
    // before it (Agreements draft 14, "Record (type 17)").
    assert!(lab.view().record(&label, &line).unwrap().line, "the line stands");
    // The label registers it (C5): what its line placed stays placed.
    let r2 = lab.record(0, None, &[], vec![rot], k);
    assert!(lab.view().record(&label, &r2).unwrap().line);
    assert!(lab.view().record(&label, &line).unwrap().line, "the line stands");
    assert_eq!(puts(&lab, &r), Some(k), "every record after it stands");
    assert!(matches!(lab.w.v.status(&res), Status::Void | Status::Disputed), "its status under Identity is unchanged");

    // A declaration by the label's authority, who is no party, registered by
    // a line; the authority rotates, keeping nothing, and disowns it.
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let label = lab.col.id;
    let d = lab.declare(None, f, f, CY, vec![outcomes::VOICE_REMOVED]);
    let line = lab.record(0, None, &[], vec![d], f);
    assert!(lab.view().record(&label, &line).unwrap().line);
    let (_, a2) = lab.w.rotate(&lab.authority, Rot { kept: Some(vec![]), ..Default::default() });
    lab.authority = a2;
    assert!(matches!(lab.w.v.status(&d), Status::Void | Status::Disputed), "disowned under Identity");
    let e = lab.view().record(&label, &line).unwrap();
    assert!(e.line, "the record stays a line: {:?}", e.not_a_line);
    let n = lab.view().next_voices(&label, &Power::Constitutional, &[]).unwrap().unwrap();
    assert!(!n.voices.contains(&lab.m[CY].id), "Cy's voice stays removed");
}

/// Freeze suite v28, 3.9ae (F303; Fable's Agreements review, A2): an
/// ending's finality rests on chain keys and the collective's own chain. A
/// closing relies on a creditor's release an act of the collective in its
/// history acknowledged; the creditor rotates and disowns it: the closing
/// stays complete, the release shown disputed. (A successor's chain
/// signature, and a successor's signature act being no signature on a
/// fork: `a_collective_forks`, `a_fork_hands_out_its_whole_history`.)
#[test]
fn an_endings_finality_rests_on_chain_keys_and_the_collectives_chain_3_9ae() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let label = lab.col.id;
    let mut printer = lab.w.genesis("the printer", vec![own_home()], None, None);
    let d = obligation_to(&mut lab, printer.id, 80);
    let rel = debt_release(&mut lab.w, &mut printer, d, vec![]);
    lab.acknowledge(0, rel);
    let x = agreements::Closing { agreement: f, collective: label, open: vec![] };
    let eo = ending_obj(&lab, f, x.collective);
    let c = agreements_act(&mut lab.w, &mut lab.m[ANA], agreements::types::CLOSING, x.to_map(), eo);
    for m in [ANA, BEN, CY] {
        lab.end(m, &c);
    }
    let e = lab.view().closing(&c).unwrap();
    assert!(e.complete, "{:?}", e.why);
    // The printer rotates, keeping nothing: its release is disowned.
    let (_, p2) = lab.w.rotate(&printer, Rot { kept: Some(vec![]), ..Default::default() });
    let _ = p2;
    assert!(matches!(lab.w.v.status(&rel), Status::Void | Status::Disputed));
    let e = lab.view().closing(&c).unwrap();
    assert!(e.complete, "the closing stays complete: {:?}", e.why);
}

/// Freeze suite v28, 1.9g (F314; Agreements draft 14, rule 47): a deal's
/// version relied on stays complete for everyone. Ana and Ben sign a deal
/// from their phones, Ben from a laptop; a later version clones it. Ben then
/// rotates and forgets the laptop, disowning his signature: the version
/// stays complete, the signature shown as a dispute under Identity, the
/// clone its place. A version nothing relied on is judged by its signatures
/// as Identity judges them. (Terms of a deal carrying a holders' rule are
/// invalid: `a_holders_rule_is_a_collectives_only_1_9g_3_7aj`.)
#[test]
fn a_version_relied_on_stays_complete_1_9g() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let ben = w.genesis("ben", vec![own_home()], None, None);
    let mut ben_laptop = device(&ben);
    let deal = |w: &mut World, ana: &mut Person, laptop: &mut Person, words: &str| {
        let mut t = deal_terms(ana.id, laptop.id);
        t.text = words.into();
        let d = agreements_act(w, ana, agreements::types::TERMS, t.to_map(), None);
        sign(w, ana, &d);
        sign(w, laptop, &d);
        (d, t)
    };
    let (relied, t) = deal(&mut w, &mut ana, &mut ben_laptop, "The film's deal.");
    let (alone, _) = deal(&mut w, &mut ana, &mut ben_laptop, "Another deal, nothing relies on.");
    assert_eq!(view(&w).agreement(&relied).unwrap().exists, Some(true));
    assert_eq!(view(&w).agreement(&alone).unwrap().exists, Some(true));
    // A later version clones the first, signed from Ben's phone.
    let mut c = t.clone();
    c.parent = Some(relied);
    c.text = "The film's deal, a later version.".into();
    c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![ana.id, ben.id]) }]);
    let k = agreements_act(&mut w, &mut ana, agreements::types::TERMS, c.to_map(), obj(relied));
    sign(&mut w, &mut ana, &k);
    let mut ben_phone = ben.clone();
    sign(&mut w, &mut ben_phone, &k);
    // Ben rotates, keeping his phone's sequence, forgetting the laptop's.
    let (_, ben2) = w.rotate(&ben_phone, Rot::default());
    let _ = ben2;
    let s = w.v.signed_by(&ben.id).find(|h| agreements::decode_signature(&h.inside).ok() == Some(relied)).unwrap().id;
    assert!(matches!(w.v.status(&s), Status::Void | Status::Disputed), "disowned under Identity");
    assert_eq!(view(&w).agreement(&relied).unwrap().exists, Some(true), "relied on: it stays complete");
    assert_eq!(view(&w).agreement(&alone).unwrap().exists, Some(false), "nothing relied on it: judged as Identity judges");
}

/// Freeze suite v28, 1.9h (F316; Agreements draft 14, rule 94): in a deal,
/// a version carrying an owners' matter names the transfers it counts
/// (field 31). An investor holding part of the film's stake, no party,
/// sells it to Carla by a transfer on its own line; a version lowering the
/// sold part that names the transfer asks Carla's signature, not the
/// investor's; one not naming it asks the investor's, who holds for it, not
/// Carla's.
#[test]
fn a_sold_stake_is_asked_through_the_version_1_9h() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut ivy = w.genesis("ivy, the investor", vec![own_home()], None, None);
    let mut carla = w.genesis("carla, who buys", vec![own_home()], None, None);
    let film = spec("the film");
    let mut t = deal_terms(ana.id, ben.id);
    t.stakes = Some(vec![agreements::Stake {
        object: Who::Id(film),
        holders: vec![(Who::Id(ana.id), 400_000), (Who::Id(ben.id), 400_000), (Who::Id(ivy.id), 200_000)],
    }]);
    on_claim(&mut w, &mut ana, &mut t);
    let d = agreements_act(&mut w, &mut ana, agreements::types::TERMS, t.to_map(), None);
    for p in [&mut ana, &mut ben, &mut ivy] {
        sign(&mut w, p, &d);
    }
    assert_eq!(view(&w).agreement(&d).unwrap().exists, Some(true));
    // Ivy sells her part to Carla, on her own line.
    let tr = agreements::StakeTransfer { agreement: d, stake: 0, to: carla.id, share: 200_000, record: vec![] };
    let x = agreements_act(&mut w, &mut ivy, agreements::new_types::STAKE_TRANSFER, tr.to_map(), obj(d));
    let (_, ivy2) = w.chain_sign(&ivy, x);
    ivy = ivy2;
    sign(&mut w, &mut carla, &x);
    assert!(view(&w).transfer(&x).unwrap().effective);
    // Versions lowering the sold part by a quarter, to Ana: its holder
    // signs (rule 48).
    let (aid, bid, iid, cid) = (ana.id, ben.id, ivy.id, carla.id);
    let version = |w: &mut World, ana: &mut Person, ben: &mut Person, counted: Option<Vec<Hash>>, words: &str| {
        let mut c = t.clone();
        c.parent = Some(d);
        c.text = words.into();
        let part = if counted.is_some() { cid } else { iid };
        c.stakes.as_mut().unwrap()[0].holders = vec![(Who::Id(aid), 450_000), (Who::Id(bid), 400_000), (Who::Id(part), 150_000)];
        c.transfers_counted = counted;
        c.field4 = Field4::Mark(vec![MarkEntry { power: Power::Clone, signers: sorted(vec![ana.id, ben.id]) }]);
        let k = agreements_act(w, ana, agreements::types::TERMS, c.to_map(), obj(d));
        sign(w, ana, &k);
        sign(w, ben, &k);
        k
    };
    let named = version(&mut w, &mut ana, &mut ben, Some(vec![x]), "With the fee, counting the sale to Carla.");
    let unnamed = version(&mut w, &mut ana, &mut ben, None, "With the fee, counting no sale.");
    assert_eq!(view(&w).agreement(&named).unwrap().exists, Some(false), "Carla, counted, has not signed");
    assert_eq!(view(&w).agreement(&unnamed).unwrap().exists, Some(false), "Ivy holds for it, and has not signed");
    sign(&mut w, &mut carla, &named);
    sign(&mut w, &mut carla, &unnamed);
    assert_eq!(view(&w).agreement(&named).unwrap().exists, Some(true), "the buyer's signature, not the seller's");
    assert_eq!(view(&w).agreement(&unnamed).unwrap().exists, Some(false), "the buyer counts nothing toward it");
    sign(&mut w, &mut ivy, &unnamed);
    assert_eq!(view(&w).agreement(&unnamed).unwrap().exists, Some(true), "the seller's signature");
}

/// The label, with a stake in itself held by its three members and Dana, an
/// owner who is no member, under a 60% holders' rule every holder signed
/// (Agreements draft 14, rule 94, F307): put in force by a record. Returns
/// the lab, Dana, and the version in force.
fn owned_label(dana_share: u64) -> (Lab, Person, Hash) {
    owned_label_with(dana_share, true, None)
}

/// [`owned_label`], with or without the holders' rule, and with Eve, a
/// holder who signs nothing, where `eve` gives her share.
fn owned_label_with(dana_share: u64, rule: bool, eve: Option<(&str, u64)>) -> (Lab, Person, Hash) {
    owned_label_full(dana_share, rule, eve, None)
}

/// [`owned_label_with`], the label also holding the whole of `work` (stake 1).
fn owned_label_full(dana_share: u64, rule: bool, eve: Option<(&str, u64)>, work: Option<Hash>) -> (Lab, Person, Hash) {
    owned_label_by(dana_share, rule, eve, work, &|_| {}, false)
}

/// [`owned_label_full`], founded with `founding` applied to the label's terms.
fn owned_label_by(dana_share: u64, rule: bool, eve: Option<(&str, u64)>, work: Option<Hash>, founding: &dyn Fn(&mut Terms), vault: bool) -> (Lab, Person, Hash) {
    let mut lab = if vault { Lab::new_with_vault(founding) } else { Lab::new(founding) };
    let f = lab.founding;
    let ids = lab.ids();
    let mut dana = lab.w.genesis("dana", vec![own_home()], None, None);
    let eve_share = eve.map_or(0, |(_, n)| n);
    let eve_id = eve.map(|(name, _)| lab.w.genesis(name, vec![own_home()], None, None).id);
    let each = (1_000_000 - dana_share - eve_share) / 3;
    let first = 1_000_000 - dana_share - eve_share - 2 * each;
    let did = dana.id;
    let t0 = lab.clone_terms(&f, vec![], &|t| {
        let mut holders = vec![(Who::Id(ids[ANA]), first), (Who::Id(ids[BEN]), each), (Who::Id(ids[CY]), each), (Who::Id(did), dana_share)];
        if let Some(e) = eve_id {
            holders.push((Who::Id(e), eve_share));
        }
        // The label's work, where named, is its own ownership agreement's
        // ([`label_owns`]): the label's terms carry one stake.
        let _ = work;
        t.stakes = Some(vec![agreements::Stake { object: Who::This, holders }]);
        if rule {
            t.holders_rules = Some(vec![agreements::HoldersEntry { stake: 0, rule: HoldersRule::Share(600_000), waived: false }]);
        }
    });
    let needs = lab.view().powers_needed(&t0).unwrap();
    let t = lab.clone_terms(&f, needs.iter().map(|p| (p.clone(), vec![ANA, BEN, CY])).collect(), &|t| {
        t.stakes = t0.stakes.clone();
        t.holders_rules = t0.holders_rules.clone();
    });
    let k = lab.propose(ANA, &t);
    let mut s: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &k)).collect();
    s.push(sign(&mut lab.w, &mut dana, &k));
    let r = lab.record(0, Some((k, s)), &[], vec![], k);
    assert_eq!(puts(&lab, &r), Some(k), "{:?}", clone_state(&lab, &r));
    (lab, dana, k)
}

/// A clone of `parent` adding a fee every stake bears (rule 48: paying the
/// stakes less, an owners' matter, rule 95), its mark naming the powers it
/// needs: the members' (all three) and, where asked, the stake's holders'
/// rule with `holders`.
fn fee_clone(lab: &mut Lab, parent: &Hash, part: u64, holders: &[Hash]) -> (Hash, Vec<Power>) {
    let ids = lab.ids();
    let f = |t: &mut Terms| t.fees = Some(vec![agreements::Fee { module: spec("a studio"), part, scope: agreements::FeeScope::Every }]);
    let probe = lab.clone_terms(parent, vec![], &f);
    let needs = lab.view().powers_needed(&probe).unwrap();
    let mut t = lab.clone_terms(parent, vec![], &f);
    t.field4 = Field4::Mark(
        needs
            .iter()
            .map(|p| MarkEntry { power: p.clone(), signers: sorted(if matches!(p, Power::Holders(_)) { holders.to_vec() } else { ids.clone() }) })
            .collect(),
    );
    (lab.propose(ANA, &t), needs)
}

/// The label's split agreement (rule 15), its service `svc`, and a later
/// version of `prev` taking `part` off the top for a studio, a fee every
/// stake bears: what the stake is paid lowered, an owners' matter (rule
/// 95). Drawn for the label by device 0, signed by the service and by
/// every member, the judicial tier (rule 67); the holders sign apart.
fn fee_version(lab: &mut Lab, svc: &mut Person, prev: Hash, part: u64) -> Hash {
    let e = lab.view().publication(&prev).unwrap();
    let mut p = e.publication;
    p.plan.fees = vec![agreements::Fee { module: spec("a studio"), part, scope: agreements::FeeScope::Every }];
    let f = lab.founding;
    let a = lab.w.everyday_act(&mut lab.c[0], mirs().agreements, agreements::types::PUBLICATION, p.to_map(), Some(vec![Object { chain: e.first, predecessor: prev }, Object { chain: f, predecessor: f }]), None);
    let v = lab.own(0, &a);
    sign(&mut lab.w, svc, &v);
    for i in [ANA, BEN, CY] {
        lab.sign(i, &v);
    }
    v
}

fn counts(lab: &Lab, v: &Hash) -> bool {
    lab.view().publication(v).unwrap().counts
}

/// Freeze suite v28, 3.7aj (F307; Agreements draft 17, rules 15, 48, 94):
/// Dana holds 10% of the label's stake in itself under a 60% holders' rule
/// she signed; owners holding 90% take 5% off the top for a studio by a
/// version of the label's split agreement; she votes no, and it counts,
/// every holder paid alike less; holding half, her vote is needed. A clone adding a holders' rule, or
/// changing it, signed by every holder but one stays a draft. *Stated cost
/// (F307): she loses the personal veto.*
#[test]
fn a_holders_rule_3_7aj() {
    // Ana, Ben and Cy hold 30% each, Dana 10%, under a 60% holders' rule
    // she signed: the members carry the fee, Dana's no aside.
    let (mut lab, _dana, k) = owned_label(100_000);
    let ids = lab.ids();
    let mut svc = lab.w.genesis("the label's split service", vec![own_home()], None, None);
    let sa = lab.split_agreement(&mut svc);
    let x = fee_version(&mut lab, &mut svc, sa, 50_000);
    assert!(counts(&lab, &x), "owners holding 90% carried it, Dana's no aside: {:?}", lab.view().publication(&x).unwrap().problems);
    // Members holding half, Dana half: the members alone fall short.
    let (mut lab, mut dana2, _) = owned_label(500_000);
    let mut svc = lab.w.genesis("the label's split service", vec![own_home()], None, None);
    let sa = lab.split_agreement(&mut svc);
    let x = fee_version(&mut lab, &mut svc, sa, 50_000);
    assert!(!counts(&lab, &x), "half the stake does not meet 60%");
    sign(&mut lab.w, &mut dana2, &x);
    assert!(counts(&lab, &x), "with Dana's signature: {:?}", lab.view().publication(&x).unwrap().problems);
    // A clone changing the holders' rule: every holder of the stake, Dana too.
    let _ = k;
    let (mut lab, mut dana, k) = owned_label(100_000);
    let mut t = lab.clone_terms(&k, vec![], &|t| {
        t.holders_rules = Some(vec![agreements::HoldersEntry { stake: 0, rule: HoldersRule::Share(500_000), waived: false }]);
    });
    let needs = lab.view().powers_needed(&t).unwrap();
    t.field4 = Field4::Mark(needs.iter().map(|p| MarkEntry { power: p.clone(), signers: sorted(ids.clone()) }).collect());
    let y = lab.propose(ANA, &t);
    let s: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &y)).collect();
    let r2 = lab.record(0, Some((y, s.clone())), &[], vec![], y);
    assert!(matches!(clone_state(&lab, &r2), CloneState::Draft(w) if w.contains("holders' rule")), "{:?}", clone_state(&lab, &r2));
    let sd = sign(&mut lab.w, &mut dana, &y);
    let mut s2 = s;
    s2.push(sd);
    let r3 = lab.record(0, Some((y, s2)), &[], vec![], y);
    assert_eq!(puts(&lab, &r3), Some(y), "{:?}", clone_state(&lab, &r3));

    // Without a holders' rule, Dana, no member, is asked for her pay (rule 48).
    let (mut lab, mut dana, _) = owned_label_with(100_000, false, None);
    let mut svc = lab.w.genesis("the label's split service", vec![own_home()], None, None);
    let sa = lab.split_agreement(&mut svc);
    let x = fee_version(&mut lab, &mut svc, sa, 50_000);
    assert!(!counts(&lab, &x), "Dana's no blocks it");
    sign(&mut lab.w, &mut dana, &x);
    assert!(counts(&lab, &x));

    // Eve holds part of the stake and never accepted the rule: still asked.
    let (mut lab, _dana, _) = owned_label_with(100_000, true, Some(("eve", 50_000)));
    let mut svc = lab.w.genesis("the label's split service", vec![own_home()], None, None);
    let sa = lab.split_agreement(&mut svc);
    let x = fee_version(&mut lab, &mut svc, sa, 50_000);
    assert!(!counts(&lab, &x), "a holder the rule does not bind signs for itself");
}

/// Freeze suite v28, 3.7ab (F302, F314; A2-1): a holder votes on an owners'
/// matter, the record names the signature, the holder rotates and disowns
/// it: the change stays in force, the vote shown disputed.
#[test]
fn a_disowned_vote_stays_placed_3_7ab() {
    let (mut lab, dana, k) = owned_label(400_000);
    let ids = lab.ids();
    let mut dana_laptop = device(&dana);
    let (x, _) = fee_clone(&mut lab, &k, 50_000, &[ids[ANA], dana.id]);
    let mut s = vec![lab.sign(ANA, &x), lab.sign(BEN, &x), lab.sign(CY, &x)];
    s.push(sign(&mut lab.w, &mut dana_laptop, &x));
    let r = lab.record(0, Some((x, s.clone())), &[], vec![], x);
    assert_eq!(puts(&lab, &r), Some(x), "{:?}", clone_state(&lab, &r));
    // Dana rotates, forgetting the laptop: her vote is disowned under Identity.
    let (_, d2) = lab.w.rotate(&dana, Rot::default());
    let _ = d2;
    assert!(matches!(lab.w.v.status(s.last().unwrap()), Status::Void | Status::Disputed));
    assert_eq!(puts(&lab, &r), Some(x), "the change stays in force");
}

/// Freeze suite v28, 3.7ad (F316; A2-3): Ben sells his part of the label's
/// stake in itself to Fay, on his own line; for the owners' matters, the
/// transfer counts only where the label's line placed it (a record naming
/// it in field 3, or an act of the label acknowledging it), and seller and
/// buyer never both count. A transfer the label acknowledged that this
/// verifier does not hold leaves the vote unknown.
#[test]
fn who_holds_what_at_the_vote_3_7ad() {
    // Ana, Ben and Cy hold 20% each, Dana 40%, under a 60% holders' rule.
    let (mut lab, _dana, k) = owned_label(400_000);
    let mut svc = lab.w.genesis("the label's split service", vec![own_home()], None, None);
    let sa = lab.split_agreement(&mut svc);
    let mut fay = lab.w.genesis("fay, who buys", vec![own_home()], None, None);
    let tr = agreements::StakeTransfer { agreement: k, stake: 0, to: fay.id, share: 200_000, record: vec![] };
    let mut ben = lab.m[BEN].clone();
    let t = agreements_act(&mut lab.w, &mut ben, agreements::new_types::STAKE_TRANSFER, tr.to_map(), obj(k));
    let (_, ben2) = lab.w.chain_sign(&ben, t);
    lab.m[BEN] = ben2;
    sign(&mut lab.w, &mut fay, &t);
    assert!(lab.view().transfer(&t).unwrap().effective);
    // Not yet placed: Ben still holds for the label; the members' 60% meet the rule.
    let x = fee_version(&mut lab, &mut svc, sa, 50_000);
    assert!(counts(&lab, &x), "Ben's fifth still counts: {:?}", lab.view().publication(&x).unwrap().problems);
    // The label's line places the transfer: Fay holds, Ben does not.
    lab.record(0, None, &[], vec![t], k);
    let y = fee_version(&mut lab, &mut svc, x, 60_000);
    assert!(!counts(&lab, &y), "the seller no longer counts: the members hold 40%");
    sign(&mut lab.w, &mut fay, &y);
    assert!(counts(&lab, &y), "with the buyer's vote: {:?}", lab.view().publication(&y).unwrap().problems);
    // An act of the label acknowledging something this verifier does not hold.
    let unheld = spec("a transfer this verifier does not hold");
    lab.acknowledge(0, unheld);
    let z = fee_version(&mut lab, &mut svc, y, 70_000);
    assert_eq!(lab.view().publication(&z).map(|e| e.counts), Err(AgreementsError::Missing(unheld)), "unknown, never silently short");
}

/// F330 (Agreements draft 14, rules 47a, 69; "operate by share, die by
/// share"): a closing under a constitutional change rule by share, sixty
/// per cent of the label's stake in itself (Ana half, Ben three tenths, Cy
/// a fifth), is counted by share at the closing's line, each member by its
/// chain signature: Ana and Cy (seven tenths) close it, Ben and Cy (half) do
/// not. A transfer placed in the closing's history counts there: once Ana's
/// tenth to Ben is placed, Ben and Cy hold six tenths, and close it.
#[test]
fn an_ending_is_counted_by_share_at_its_line_f330() {
    let owned = |t: &mut Terms| {
        let p = t.parties.clone();
        t.stakes = Some(vec![own(vec![(p[ANA], 500_000), (p[BEN], 300_000), (p[CY], 200_000)])]);
        t.constitutional = Some(Rule::ByShare { stake: 0, share: 600_000 });
    };
    let close = |lab: &mut Lab, who: &[usize]| -> agreements::ClosingEval {
        // An act of the label, so that its line has a tip to name.
        if lab.c[0].seq.is_empty() {
            lab.publish(0);
        }
        let f = lab.founding;
        let label = lab.col.id;
        let c = agreements::Closing { agreement: f, collective: label, open: vec![] };
        let eo = ending_obj(lab, f, c.collective);
        let x = agreements_act(&mut lab.w, &mut lab.m[who[0]], agreements::types::CLOSING, c.to_map(), eo);
        for i in who {
            lab.end(*i, &x);
        }
        lab.view().closing(&x).unwrap()
    };
    let mut lab = Lab::new(&owned);
    let e = close(&mut lab, &[ANA, CY]);
    assert!(e.complete, "seven tenths of the stake close it: {:?}", e.why);
    let mut lab = Lab::new(&owned);
    let e = close(&mut lab, &[BEN, CY]);
    assert!(!e.complete && e.why.as_deref().is_some_and(|w| w.contains("F330")), "half does not: {:?}", e.why);
    // Ana sells a tenth to Ben, placed by the label's line before the closing's.
    let mut lab = Lab::new(&owned);
    let f = lab.founding;
    let ben = lab.m[BEN].id;
    let tr = agreements::StakeTransfer { agreement: f, stake: 0, to: ben, share: 100_000, record: vec![] };
    let mut ana = lab.m[ANA].clone();
    let t = agreements_act(&mut lab.w, &mut ana, agreements::new_types::STAKE_TRANSFER, tr.to_map(), obj(f));
    let (_, ana2) = lab.w.chain_sign(&ana, t);
    lab.m[ANA] = ana2;
    let mut b = lab.m[BEN].clone();
    sign(&mut lab.w, &mut b, &t);
    lab.m[BEN] = b;
    assert!(lab.view().transfer(&t).unwrap().effective);
    lab.record(0, None, &[], vec![t], f);
    let e = close(&mut lab, &[BEN, CY]);
    assert!(e.complete, "Ben and Cy now hold six tenths at the closing's line: {:?}", e.why);
}

/// F331 (F330's open point, case a): an owner who is no member consents to
/// an ending as a member does, by a chain signature with its own chain key.
/// Under a constitution counted among the holders of the label's stake in
/// itself, sixty per cent, Dana, no member, holding half: the members alone
/// (half) do not close it; with Dana's chain signature on the closing, they
/// do. Her signature act on it, which nothing can acknowledge in the
/// closing's own history, counts for nothing.
#[test]
fn an_owner_who_is_no_member_signs_an_ending_by_chain_signature_f331() {
    let (mut lab, others) = Lab::with_others(
        &["dana"],
        &|t, o| {
            let p = t.parties.clone();
            t.stakes = Some(vec![own(vec![(p[ANA], 200_000), (p[BEN], 150_000), (p[CY], 150_000), (o[0], 500_000)])]);
            t.constitutional = Some(Rule::Holders { stake: 0, share: 600_000 });
            // F328 Q11: membership counted among holders, the clause can move
            // a vanished holder's stake.
            if let Some(a) = t.abandonment.as_mut() {
                a.outcomes = vec![outcomes::VOICE_REMOVED, outcomes::STAKE_REDISTRIBUTED];
            }
        },
        true,
    );
    let mut dana = others[0].clone();
    let f = lab.founding;
    sign(&mut lab.w, &mut dana, &f);
    let label = lab.col.id;
    lab.publish(0);
    let c = agreements::Closing { agreement: f, collective: label, open: vec![] };
    let eo = ending_obj(&lab, f, label);
    let x = agreements_act(&mut lab.w, &mut lab.m[ANA], agreements::types::CLOSING, c.to_map(), eo);
    for m in [ANA, BEN, CY] {
        lab.end(m, &x);
    }
    let e = lab.view().closing(&x).unwrap();
    assert!(!e.complete && e.why.as_deref().is_some_and(|w| w.contains("F330")), "the members hold half: {:?}", e.why);
    sign(&mut lab.w, &mut dana, &x);
    assert!(!lab.view().closing(&x).unwrap().complete, "a signature act on the closing is no consent to it");
    let (_, dana2) = lab.w.chain_sign(&dana, x);
    let _ = dana2;
    let e = lab.view().closing(&x).unwrap();
    assert!(e.complete, "with Dana's chain signature, holders of the whole stake: {:?}", e.why);
}

/// F330, for a fork: under the same rule by share, a fork whose sides are
/// Ana and Cy, Ben leaving (kept at his three tenths), is signed by
/// members holding seven tenths, and completes; one whose sides are Ben
/// and Cy, Ana leaving, by members holding half, and does not. Before
/// F330, both needed every member.
#[test]
fn a_fork_is_counted_by_share_at_its_line_f330() {
    let owned = |t: &mut Terms| {
        let p = t.parties.clone();
        t.stakes = Some(vec![own(vec![(p[ANA], 500_000), (p[BEN], 300_000), (p[CY], 200_000)])]);
        t.constitutional = Some(Rule::ByShare { stake: 0, share: 600_000 });
    };
    let attempt = |sides: [usize; 2], leaving: usize, share: u64| -> agreements::ForkEval {
        let mut lab = Lab::new(&owned);
        let f = lab.founding;
        let label = lab.col.id;
        let ids = lab.ids();
        let kept = vec![(ids[leaving], share)];
        let (sa, _) = found_successor(&mut lab, "side A", &[sides[0]], &kept, label);
        let (sb, _) = found_successor(&mut lab, "side B", &[sides[1]], &kept, label);
        lab.cmip_act(0, pay());
        let x = agreements::Fork {
            agreement: f,
            collective: label,
            sides: vec![agreements::Side { successor: sa.id, members: vec![ids[sides[0]]] }, agreements::Side { successor: sb.id, members: vec![ids[sides[1]]] }],
            shares: vec![],
            debts: vec![],
        };
        let eo = ending_obj(&lab, f, label);
        let k = agreements_act(&mut lab.w, &mut lab.m[sides[0]], agreements::types::FORK, x.to_map(), eo);
        for m in sides {
            lab.end(m, &k);
        }
        lab.view().fork(&k).unwrap()
    };
    let e = attempt([ANA, CY], BEN, 300_000);
    assert!(e.complete, "seven tenths of the stake fork it: {:?}", e.why);
    let e = attempt([BEN, CY], ANA, 500_000);
    assert!(!e.complete && e.why.as_deref().is_some_and(|w| w.contains("F330")), "half does not: {:?}", e.why);
}

/// Freeze suite v28, 3.7ah (F308; A2-7), counted: a clone rule by share,
/// sixty per cent of the label's stake in itself, a departed holder (Dee)
/// holding half of it. The members' sixty per cent is of what the voices
/// that remain hold: Ana alone (250 of the members' 500) does not meet it;
/// Ana and Ben (400) do. Under "all of" two members and sixty per cent, each
/// rule is counted as if alone.
#[test]
fn counting_by_share_3_7ah() {
    let dee = spec("dee, departed");
    let owned = |rule: Rule| {
        move |t: &mut Terms| {
            let p = t.parties.clone();
            t.stakes = Some(vec![agreements::Stake {
                object: Who::This,
                holders: vec![(Who::Id(p[ANA]), 250_000), (Who::Id(p[BEN]), 150_000), (Who::Id(p[CY]), 100_000), (Who::Id(dee), 500_000)],
            }]);
            t.clone = rule.clone();
            // A time reference, so that refund terms (field 17, in no area:
            // the clone rule's) can change.
            t.time = Some((spec("a clock"), Value::Uint(1)));
        }
    };
    let by_share = Rule::ByShare { stake: 0, share: 600_000 };
    let attempt = |lab: &mut Lab, who: &[usize]| -> CloneState {
        let f = lab.founding;
        let t = lab.clone_terms(&f, vec![(Power::Clone, who.to_vec())], &|t| t.refund = Some(agreements::RefundTerms { until: Value::Uint(5) }));
        let k = lab.propose(ANA, &t);
        let s: Vec<Hash> = who.iter().map(|i| lab.sign(*i, &k)).collect();
        let r = lab.record(0, Some((k, s)), &[], vec![], k);
        clone_state(&lab, &r)
    };
    let mut lab = Lab::new(&owned(by_share.clone()));
    let got = attempt(&mut lab, &[ANA]);
    assert!(matches!(&got, CloneState::Invalid(w) if w.contains("by share")), "{got:?}");
    assert_eq!(attempt(&mut lab, &[ANA, BEN]), CloneState::Complete);
    let mut lab = Lab::new(&owned(Rule::AllOf(vec![Rule::Threshold(2), by_share.clone()])));
    assert_eq!(attempt(&mut lab, &[ANA, CY]), CloneState::Complete, "two members, holding 70% of the voices' part");
    assert!(matches!(attempt(&mut lab, &[BEN, CY]), CloneState::Invalid(_)), "two members, holding 50%: the share is not met");
}

/// Freeze suite v28, 3.9ah (F310; Fable's Agreements review, A11): a sale
/// or release of a work is an owners' matter. The label, with Dana a holder
/// of its stake in itself who is no member and no holders' rule, releases
/// its work: the release waits for her signature, placed by the label's
/// line; the same for a transfer of its stake in the work. Under a holders'
/// rule she accepted, holders meeting it carry it.
#[test]
fn a_sale_of_works_is_an_owners_matter_3_9ah() {
    let work = spec("the label's work");
    let release = |lab: &mut Lab, wa: Hash| {
        let rel = agreements::Release { work, stakes: vec![(wa, 0)], claims: vec![], keys: vec![(spec("its publication"), vec![9; 32])], timed: None };
        let a = lab.w.everyday_act(&mut lab.c[0], mirs().agreements, agreements::types::RELEASE, rel.to_map(), obj(wa), None);
        let r = lab.w.add(&a);
        lab.sign(BEN, &r);
        r
    };
    let (mut lab, mut dana, _k) = owned_label_full(100_000, false, None, Some(work));
    let wa = label_owns(&mut lab, work);
    let r = release(&mut lab, wa);
    assert!(!lab.view().release(&r).unwrap().complete, "Dana has not consented");
    // Her signature act naming the release, an act of the label, is placed
    // at it ("Made before, made after", 2, C1).
    sign(&mut lab.w, &mut dana, &r);
    let e = lab.view().release(&r).unwrap();
    assert!(e.complete, "{:?}", e.why);
    // A transfer of the label's stake in the work: the same.
    let (mut lab, mut dana, _k) = owned_label_full(100_000, false, None, Some(work));
    let wa = label_owns(&mut lab, work);
    let mut buyer = lab.w.genesis("the members' new collective", vec![own_home()], None, None);
    let tr = agreements::StakeTransfer { agreement: wa, stake: 0, to: buyer.id, share: 1_000_000, record: vec![] };
    let a = lab.w.everyday_act(&mut lab.c[0], mirs().agreements, agreements::new_types::STAKE_TRANSFER, tr.to_map(), obj(wa), None);
    let t = lab.w.add(&a);
    let (_, c0) = lab.w.chain_sign(&lab.c[0], t);
    lab.c[0] = c0;
    sign(&mut lab.w, &mut buyer, &t);
    let e = lab.view().transfer(&t).unwrap();
    assert!(!e.effective && e.problems.iter().any(|p| p.contains("F310")), "{:?}", e.problems);
    sign(&mut lab.w, &mut dana, &t);
    let e = lab.view().transfer(&t).unwrap();
    assert!(!e.problems.iter().any(|p| p.contains("F310")), "{:?}", e.problems);
    // Under a 60% holders' rule she signed: holders meeting it carry it.
    let (mut lab, _dana, _k) = owned_label_full(100_000, true, None, Some(work));
    let wa = label_owns(&mut lab, work);
    let r = release(&mut lab, wa);
    assert!(!lab.view().release(&r).unwrap().complete, "Ben alone holds 30%");
    lab.sign(ANA, &r);
    let e = lab.view().release(&r).unwrap();
    assert!(e.complete, "Ana and Ben hold 60%, Dana's no aside: {:?}", e.why);
}

/// Freeze suite v28, 3.9ag (F310, F328 Q12; Fable's Agreements review,
/// A10): in a fork, the first side's successor's founding terms take a fee
/// the original's did not, the departed holder kept at her quarter: the
/// fork is incomplete until she consents; her consent counts only where an
/// act of the original in the fork's history acknowledges it; once so
/// acknowledged, her later rotation disowning it leaves the fork complete.
/// With the original's terms, the fork is complete at once.
#[test]
fn a_forks_founding_plans_3_9ag() {
    let (mut lab, others) = Lab::with_others(
        &["dee"],
        &|t, o| {
            let p = t.parties.clone();
            t.stakes = stakes(vec![own(vec![(p[ANA], 250_000), (p[BEN], 250_000), (p[CY], 250_000), (o[0], 250_000)])]);
            t.departed = Some(vec![o[0]]);
        },
        true,
    );
    let mut dee = others[0].clone();
    let f = lab.founding;
    let label = lab.col.id;
    let ids = lab.ids();
    let kept = vec![(dee.id, 250_000)];
    let (_sa, ta) = found_successor(&mut lab, "side A", &[ANA], &kept, label);
    let (_sb, _tb) = found_successor(&mut lab, "side B", &[BEN, CY], &kept, label);
    // Side A's founding names a split agreement taking a tenth off the top
    // for an overhead (rule 15); the original names none.
    let mut svc = lab.w.genesis("side A's split service", vec![own_home()], None, None);
    let p = agreements::Publication {
        sold: None,
        owners: Some(ta),
        partners: vec![],
        service: svc.id,
        plan: agreements::SplitPlan { fees: vec![agreements::Fee { module: spec("an overhead"), part: 100_000, scope: agreements::FeeScope::Every }], ..common::test_plan() },
        words: None,
        time: None,
        until: None,
        refund: None,
        cmips: vec![],
        designated: None,
        backups: vec![],
        failed: None,
    };
    let mut ana_a = lab.m[ANA].acting_for(_sa.id, vec![_sa.id]);
    let spa = agreements_act(&mut lab.w, &mut ana_a, agreements::types::PUBLICATION, p.to_map(), obj(ta));
    sign(&mut lab.w, &mut svc, &spa);
    let (sa_id, sb_id) = (_sa.id, _sb.id);
    let fork = |lab: &mut Lab| {
        let x = agreements::Fork {
            agreement: f,
            collective: label,
            sides: vec![agreements::Side { successor: sa_id, members: vec![ids[ANA]] }, agreements::Side { successor: sb_id, members: vec![ids[BEN], ids[CY]] }],
            shares: vec![],
            debts: vec![],
        };
        let eo = ending_obj(lab, f, label);
        let k = agreements_act(&mut lab.w, &mut lab.m[ANA], agreements::types::FORK, x.to_map(), eo);
        for m in [ANA, BEN, CY] {
            lab.end(m, &k);
        }
        k
    };
    lab.cmip_act(0, pay());
    let f1 = fork(&mut lab);
    let e = lab.view().fork(&f1).unwrap();
    assert!(!e.complete && e.why.as_deref().is_some_and(|w| w.contains("F310")), "{:?}", e.why);
    // Dee consents, but nothing of the label acknowledges it in a fork's history.
    let sd = sign(&mut lab.w, &mut dee, &ta);
    let e = lab.view().fork(&f1).unwrap();
    assert!(!e.complete, "her consent, acknowledged by no act of the original in the fork's history");
    // The label acknowledges it; a fork drawn after it is complete.
    lab.acknowledge(0, sd);
    let f2 = fork(&mut lab);
    let e = lab.view().fork(&f2).unwrap();
    assert!(e.complete, "{:?}", e.why);
    // Dee rotates, keeping nothing: the fork stays complete and final.
    let (_, d2) = lab.w.rotate(&dee, Rot { kept: Some(vec![]), ..Default::default() });
    let _ = d2;
    assert!(matches!(lab.w.v.status(&sd), Status::Void | Status::Disputed));
    assert!(lab.view().fork(&f2).unwrap().complete, "complete and final");
}


/// A clone of `parent` issuing in the label's stake in itself (rule 96):
/// field 7's stake 0 written as `holders`, field 32 as `under`, its mark
/// naming the members for their powers and `voters` for the stake's
/// holders' rule.
fn issuance(lab: &mut Lab, parent: &Hash, under: agreements::IssuesUnder, holders: Vec<(Hash, u64)>, voters: &[Hash]) -> Hash {
    let ids = lab.ids();
    let f = |t: &mut Terms| {
        let mut st = t.stakes.clone().unwrap();
        st[0].holders = holders.iter().map(|(h, n)| (Who::Id(*h), *n)).collect();
        t.stakes = Some(st);
        t.issues_under = Some(under.clone());
    };
    let probe = lab.clone_terms(parent, vec![], &f);
    let needs = lab.view().powers_needed(&probe).unwrap();
    assert!(needs.contains(&Power::Holders(0)), "an issuance under a holders' rule by share: {needs:?}");
    let mut t = lab.clone_terms(parent, vec![], &f);
    t.field4 = Field4::Mark(
        needs
            .iter()
            .map(|p| MarkEntry { power: p.clone(), signers: sorted(if matches!(p, Power::Holders(_)) { voters.to_vec() } else { ids.clone() }) })
            .collect(),
    );
    lab.propose(ANA, &t)
}

/// The issuance's record, named signatures the members' and `others'`.
fn issuance_record(lab: &mut Lab, x: Hash, others: &mut [&mut Person]) -> Hash {
    let mut s: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &x)).collect();
    for p in others.iter_mut() {
        s.push(sign(&mut lab.w, p, &x));
    }
    lab.record(0, Some((x, s)), &[], vec![], x)
}

/// The clone's state at record `r`, the offers in `lapsed` past their
/// period, the take-ups in `within` made within it (the time reference's
/// answers, stated by the caller).
fn state_at(lab: &Lab, r: &Hash, lapsed: &[Hash], within: &[Hash]) -> CloneState {
    let mut v = lab.view();
    v.offer_periods_lapsed.extend(lapsed.iter().copied());
    v.take_ups_within.extend(within.iter().copied());
    v.record(&lab.col.id, r).unwrap().clone.unwrap().1
}

/// Freeze suite v28, 3.7ac (F309, F315, F328 Q14; A2-2): an issuance. The
/// label's stake in itself (Ana, Ben and Cy 30% each, Dana, no member, 10%)
/// carries a sixty per cent holders' rule, and the label a time reference.
/// It offers a fifth of the stake after it, publicly, for 10,000 units in
/// all, Ivy the new holder. Ben takes up and pays his 3,000; the others let
/// their period lapse; owners holding 60% decide: every existing share
/// scaled by 0.8, Ben keeping his 30%, Ivy taking the rest (14%). While the
/// period runs, it waits; without Ivy's signature, it waits; giving Ben less
/// than his proportion, or scaling one share unlike the others, it is a
/// draft. An offer sealed to the members alone did not reach Dana: the
/// issuance naming it waits, unless every holder signs it. A share added any
/// other way needs every holder. A standing waiver, set by every holder,
/// lets an issuance go without an offer. *Stated cost (F315): Dana, who let
/// her period pass, is diluted.*
#[test]
fn an_issuance_3_7ac() {
    let clock = |t: &mut Terms| t.time = Some((spec("a clock"), Value::Uint(1)));
    let (mut lab, dana, k) = owned_label_by(100_000, true, None, None, &clock, false);
    let ids = lab.ids();
    let mut ivy = lab.w.genesis("ivy, the new holder", vec![own_home()], None, None);
    let unit = spec("a unit");
    let offer = agreements::IssuanceOffer {
        version: k,
        stake: 0,
        size: 200_000,
        new_holders: vec![(ivy.id, 1_000_000)],
        period: Value::Uint(10),
        price: Some(mor_core::money::Amount { unit, value: 10_000 }),
        words: Some("A fifth, for the studio.".into()),
        more: None,
    };
    let a = lab.w.everyday_act(&mut lab.c[0], mirs().agreements, agreements::owner_types::ISSUANCE_OFFER, offer.to_map(), obj(k), None);
    let o = lab.w.add(&a);
    // Ben takes up; no line of the label places it: within the period, it
    // counts all the same (F329 Q3).
    let up = lab.sign(BEN, &o);
    let (a_, b_, c_, d_, i_) = (ids[ANA], ids[BEN], ids[CY], dana.id, ivy.id);
    let right = vec![(a_, 240_000), (b_, 300_000), (c_, 240_000), (d_, 80_000), (i_, 140_000)];
    let x = issuance(&mut lab, &k, agreements::IssuesUnder::Offer(o), right.clone(), &[a_, b_]);
    let r_no_ivy = issuance_record(&mut lab, x, &mut []);
    let got = state_at(&lab, &r_no_ivy, &[o], &[up]);
    assert!(matches!(&got, CloneState::Draft(w) if w.contains("new holder")), "{got:?}");
    // Ben pays his part: 3,000 of the 10,000, to the label, on a rail its
    // pointer names.
    label_pointer(&mut lab, BEN, &[]);
    let mut c0 = lab.c[0].clone();
    let paid = receipt(&mut lab, &mut c0, b_, up, 3_000);
    lab.c[0] = c0;
    // The label's receipt, a Money act: its Money area's holder signs it.
    lab.sign(BEN, &paid);
    eprintln!("DBG {:?} {:?}", lab.consent(&paid), lab.w.v.status(&paid));
    // Ben given less than his proportion; Dana scaled unlike the others.
    for wrong in [
        vec![(a_, 240_000), (b_, 280_000), (c_, 240_000), (d_, 80_000), (i_, 160_000)],
        vec![(a_, 240_000), (b_, 300_000), (c_, 240_000), (d_, 70_000), (i_, 150_000)],
    ] {
        let y = issuance(&mut lab, &k, agreements::IssuesUnder::Offer(o), wrong, &[a_, b_]);
        let r = issuance_record(&mut lab, y, &mut [&mut ivy]);
        let got = state_at(&lab, &r, &[o], &[up]);
        assert!(matches!(&got, CloneState::Draft(w) if w.contains("other than its proportion")), "{got:?}");
    }
    // A share added any other way (no field 32) needs every holder: Dana's
    // lowered share asks her own signature.
    let mut t = lab.clone_terms(&k, vec![], &|t| {
        let mut st = t.stakes.clone().unwrap();
        st[0].holders = right.iter().map(|(h, n)| (Who::Id(*h), *n)).collect();
        t.stakes = Some(st);
    });
    let needs = lab.view().powers_needed(&t).unwrap();
    t.field4 = Field4::Mark(needs.iter().map(|p| MarkEntry { power: p.clone(), signers: sorted(ids.clone()) }).collect());
    let plain = lab.propose(ANA, &t);
    let r_plain = issuance_record(&mut lab, plain, &mut [&mut ivy]);
    let got = state_at(&lab, &r_plain, &[o], &[up]);
    assert!(matches!(&got, CloneState::Draft(w) if w.contains("lowers a holder's stake")), "{got:?}");
    // An offer sealed to the members alone did not reach Dana.
    let sealed = agreements::IssuanceOffer { period: Value::Uint(11), ..offer.clone() };
    let o2 = lab.w.private_act(&mut lab.c[0], mirs().agreements, agreements::owner_types::ISSUANCE_OFFER, sealed.to_map(), obj(k), sorted(vec![a_, b_, c_]));
    let scaled = vec![(a_, 240_000), (b_, 240_000), (c_, 240_000), (d_, 80_000), (i_, 200_000)];
    let y = issuance(&mut lab, &k, agreements::IssuesUnder::Offer(o2), scaled.clone(), &[a_, b_]);
    let r_sealed = issuance_record(&mut lab, y, &mut [&mut ivy]);
    let got = state_at(&lab, &r_sealed, &[o2], &[]);
    assert!(matches!(&got, CloneState::Draft(w) if w.contains("did not reach")), "{got:?}");
    // The right issuance: waiting while the period runs; complete once it
    // lapsed, Dana diluted, Ben keeping his 30%; unpaid, or made past the
    // period, his take-up counts nothing.
    let r = issuance_record(&mut lab, x, &mut [&mut ivy]);
    let got = state_at(&lab, &r, &[], &[]);
    assert!(matches!(&got, CloneState::Draft(w) if w.contains("still runs")), "{got:?}");
    let got = state_at(&lab, &r, &[o], &[]);
    assert!(matches!(&got, CloneState::Draft(w) if w.contains("other than its proportion")), "late: {got:?}");
    let mut unpaid = lab.view();
    unpaid.rail_valid.remove(&paid);
    unpaid.offer_periods_lapsed.insert(o);
    unpaid.take_ups_within.insert(up);
    let got = unpaid.record(&lab.col.id, &r).unwrap().clone.unwrap().1;
    assert!(matches!(&got, CloneState::Draft(w) if w.contains("other than its proportion")), "unpaid: {got:?}");
    assert_eq!(state_at(&lab, &r, &[o], &[up]), CloneState::Complete, "the period lapsed: Dana diluted, Ben kept his 30%");

    // Every holder signs: no offer needed, the sealed one serving.
    let (mut lab, mut dana, k) = owned_label_by(100_000, true, None, None, &clock, false);
    let ids = lab.ids();
    let mut ivy = lab.w.genesis("ivy, the new holder", vec![own_home()], None, None);
    let (a_, b_, c_, d_, i_) = (ids[ANA], ids[BEN], ids[CY], dana.id, ivy.id);
    let sealed = agreements::IssuanceOffer { version: k, new_holders: vec![(i_, 1_000_000)], ..offer.clone() };
    let o3 = lab.w.private_act(&mut lab.c[0], mirs().agreements, agreements::owner_types::ISSUANCE_OFFER, sealed.to_map(), obj(k), sorted(vec![a_, b_, c_]));
    let scaled = vec![(a_, 240_000), (b_, 240_000), (c_, 240_000), (d_, 80_000), (i_, 200_000)];
    let y = issuance(&mut lab, &k, agreements::IssuesUnder::Offer(o3), scaled.clone(), &[a_, b_]);
    let r = issuance_record(&mut lab, y, &mut [&mut ivy, &mut dana]);
    assert_eq!(state_at(&lab, &r, &[], &[]), CloneState::Complete, "an issuance every holder signs needs no offer");

    // A standing waiver (F328 Q14): set by every holder, Dana included; then
    // an issuance names no offer, decided by owners holding 60% and signed
    // by its new holder. Set without Dana, the version is a draft.
    let (mut lab, mut dana, k) = owned_label_by(100_000, true, None, None, &clock, false);
    let ids = lab.ids();
    let mut ivy = lab.w.genesis("ivy, the new holder", vec![own_home()], None, None);
    let (a_, b_, c_, d_, i_) = (ids[ANA], ids[BEN], ids[CY], dana.id, ivy.id);
    // [0] where the parent carries no waiver: invalid.
    let mut t = lab.clone_terms(&k, vec![], &|t| {
        let mut st = t.stakes.clone().unwrap();
        st[0].holders = scaled.iter().map(|(h, n)| (Who::Id(*h), *n)).collect();
        t.stakes = Some(st);
        t.issues_under = Some(agreements::IssuesUnder::Waived);
        t.holders_rules = Some(vec![agreements::HoldersEntry { stake: 0, rule: HoldersRule::Share(600_000), waived: true }]);
    });
    let needs = lab.view().powers_needed(&t).unwrap();
    t.field4 = Field4::Mark(needs.iter().map(|p| MarkEntry { power: p.clone(), signers: sorted(if matches!(p, Power::Holders(_)) { vec![a_, b_] } else { ids.clone() }) }).collect());
    let z = lab.propose(ANA, &t);
    let rz = issuance_record(&mut lab, z, &mut [&mut ivy, &mut dana]);
    let got = state_at(&lab, &rz, &[], &[]);
    assert!(matches!(&got, CloneState::Invalid(w) if w.contains("standing waiver")), "{got:?}");
    let mut t = lab.clone_terms(&k, vec![], &|t| {
        t.holders_rules = Some(vec![agreements::HoldersEntry { stake: 0, rule: HoldersRule::Share(600_000), waived: true }]);
    });
    let needs = lab.view().powers_needed(&t).unwrap();
    t.field4 = Field4::Mark(needs.iter().map(|p| MarkEntry { power: p.clone(), signers: sorted(ids.clone()) }).collect());
    let wv = lab.propose(ANA, &t);
    let r = issuance_record(&mut lab, wv, &mut []);
    assert!(matches!(state_at(&lab, &r, &[], &[]), CloneState::Draft(w) if w.contains("holders' rule")), "set by every holder but one");
    let r = issuance_record(&mut lab, wv, &mut [&mut dana]);
    assert_eq!(state_at(&lab, &r, &[], &[]), CloneState::Complete);
    let y = issuance(&mut lab, &wv, agreements::IssuesUnder::Waived, scaled.clone(), &[a_, b_]);
    let r_no_ivy = issuance_record(&mut lab, y, &mut []);
    assert!(matches!(state_at(&lab, &r_no_ivy, &[], &[]), CloneState::Draft(w) if w.contains("new holder")));
    let lop = vec![(a_, 240_000), (b_, 240_000), (c_, 240_000), (d_, 70_000), (i_, 210_000)];
    let y2 = issuance(&mut lab, &wv, agreements::IssuesUnder::Waived, lop, &[a_, b_]);
    let r2 = issuance_record(&mut lab, y2, &mut [&mut ivy]);
    assert!(matches!(state_at(&lab, &r2, &[], &[]), CloneState::Draft(w) if w.contains("unlike the others")));
    let r = issuance_record(&mut lab, y, &mut [&mut ivy]);
    assert_eq!(state_at(&lab, &r, &[], &[]), CloneState::Complete, "no offer, under the standing waiver");
}

/// A proxy act of `holder` (rule 97), public, on the label's stake in
/// itself (stake 0 of `k`), naming `proxy`, scoped to `scoped` or standing.
fn proxy_act(lab: &mut Lab, holder: &mut Person, k: Hash, proxy: Hash, scoped: Option<Hash>) -> Hash {
    let p = agreements::Proxy { version: k, stake: 0, proxy, scoped };
    agreements_act(&mut lab.w, holder, agreements::owner_types::PROXY, p.to_map(), obj(k))
}

/// Freeze suite v28, 3.7ak (F327): Dana, holding half the label's stake in
/// itself under its 60% holders' rule, names Pat her proxy, standing,
/// placed by the label's line before a fee version of the label's split
/// agreement (rules 15, 97): Pat's signature counts as Dana's vote; Dana's
/// own signature is her vote. A proxy scoped to another version,
/// one revoked before the line, one replaced by a newer proxy, and one placed
/// after the line count nothing; nor a sub-proxy, nor a proxy's vote on
/// changing the holders' rule. *A proxy only votes, on what a majority of
/// the stake decides.*
#[test]
fn proxies_3_7ak() {
    // Dana holds half the label's stake in itself, the members the other
    // half, under its 60% holders' rule: a fee version of the label's split
    // agreement needs her vote, which Pat, her proxy, may cast.
    let fresh = || {
        let (mut lab, dana, k) = owned_label(500_000);
        let pat = lab.w.genesis("pat, the proxy", vec![own_home()], None, None);
        let mut svc = lab.w.genesis("the label's split service", vec![own_home()], None, None);
        let sa = lab.split_agreement(&mut svc);
        (lab, dana, k, pat, svc, sa)
    };
    // The fee version, signed by the members and by `voter`.
    let vote = |lab: &mut Lab, svc: &mut Person, sa: Hash, voter: &mut Person| -> bool {
        let x = fee_version(lab, svc, sa, 50_000);
        sign(&mut lab.w, voter, &x);
        counts(lab, &x)
    };
    // Placed before the version: Pat's vote counts as Dana's.
    let (mut lab, mut dana, k, mut pat, mut svc, sa) = fresh();
    let px = proxy_act(&mut lab, &mut dana, k, pat.id, None);
    lab.acknowledge(0, px);
    assert!(vote(&mut lab, &mut svc, sa, &mut pat));
    // Not placed: nothing.
    let (mut lab, mut dana, k, mut pat, mut svc, sa) = fresh();
    proxy_act(&mut lab, &mut dana, k, pat.id, None);
    assert!(!vote(&mut lab, &mut svc, sa, &mut pat), "a proxy no line placed counts nothing");
    // Dana signs the version herself: her own vote.
    let (mut lab, mut dana, _k, _pat, mut svc, sa) = fresh();
    assert!(vote(&mut lab, &mut svc, sa, &mut dana), "the owner's own vote");
    // Scoped to another version.
    let (mut lab, mut dana, k, mut pat, mut svc, sa) = fresh();
    let px = proxy_act(&mut lab, &mut dana, k, pat.id, Some(spec("another version")));
    lab.acknowledge(0, px);
    assert!(!vote(&mut lab, &mut svc, sa, &mut pat), "scoped to another version");
    // Revoked before the version.
    let (mut lab, mut dana, k, mut pat, mut svc, sa) = fresh();
    let px = proxy_act(&mut lab, &mut dana, k, pat.id, None);
    lab.acknowledge(0, px);
    let rv = agreements_act(&mut lab.w, &mut dana, agreements::owner_types::PROXY_REVOCATION, agreements::proxy_revocation_payload(&px), obj(px));
    lab.acknowledge(0, rv);
    assert!(!vote(&mut lab, &mut svc, sa, &mut pat), "revoked");
    // Replaced by a newer proxy: Quinn votes, Pat does not.
    let (mut lab, mut dana, k, mut pat, mut svc, sa) = fresh();
    let mut quinn = lab.w.genesis("quinn", vec![own_home()], None, None);
    let px = proxy_act(&mut lab, &mut dana, k, pat.id, None);
    lab.acknowledge(0, px);
    let qx = proxy_act(&mut lab, &mut dana, k, quinn.id, None);
    lab.acknowledge(0, qx);
    assert!(!vote(&mut lab, &mut svc, sa, &mut pat), "replaced");
    assert!(vote(&mut lab, &mut svc, sa, &mut quinn), "the newer proxy votes");
    // A sub-proxy: Pat names Quinn for Dana's stake.
    let (mut lab, mut dana, k, mut pat, mut svc, sa) = fresh();
    let mut quinn = lab.w.genesis("quinn", vec![own_home()], None, None);
    let px = proxy_act(&mut lab, &mut dana, k, pat.id, None);
    lab.acknowledge(0, px);
    let sx = proxy_act(&mut lab, &mut pat, k, quinn.id, None);
    lab.acknowledge(0, sx);
    assert!(!vote(&mut lab, &mut svc, sa, &mut quinn), "no sub-proxies");
    // Changing the holders' rule needs every holder: Pat's vote counts nothing.
    let (mut lab, mut dana, k, mut pat, _svc, _sa) = fresh();
    let px = proxy_act(&mut lab, &mut dana, k, pat.id, None);
    lab.acknowledge(0, px);
    let ids = lab.ids();
    let mut t = lab.clone_terms(&k, vec![], &|t| {
        t.holders_rules = Some(vec![agreements::HoldersEntry { stake: 0, rule: HoldersRule::Share(500_000), waived: false }]);
    });
    let needs = lab.view().powers_needed(&t).unwrap();
    t.field4 = Field4::Mark(needs.iter().map(|p| MarkEntry { power: p.clone(), signers: sorted(ids.clone()) }).collect());
    let y = lab.propose(ANA, &t);
    let r = issuance_record(&mut lab, y, &mut [&mut pat]);
    assert!(matches!(clone_state(&lab, &r), CloneState::Draft(w) if w.contains("holders' rule")), "{:?}", clone_state(&lab, &r));
}


/// Freeze suite v28, 3.7ai (F312; A2-8), as the split agreement carries
/// it (rule 22): the collective's own reserve is a partner of its split
/// agreement naming the collective itself, paid to its vault, never split
/// again: a collective that declares no vault keeps no part of its own,
/// its split shown so. A payment of the part the rail shows paid to the
/// label's flow pointer breaks the plan.
#[test]
fn the_collectives_own_reserve_3_7ai() {
    let shares = |t: &mut Terms| {
        let p = t.parties.clone();
        t.stakes = Some(vec![own(vec![(p[ANA], 400_000), (p[BEN], 300_000), (p[CY], 300_000)])]);
    };
    let run = |vault: bool| {
        let mut lab = if vault { Lab::new_with_vault(&shares) } else { Lab::new(&shares) };
        let label = lab.col.id;
        let f = lab.founding;
        let ids = lab.ids();
        let mut svc = lab.w.genesis("a split service", vec![own_home()], None, None);
        let sa = lab.split_agreement_with(&mut svc, &|p| p.partners = vec![agreements::Partner { identity: label, share: 100_000, label: None }]);
        let r = mor_core::money::Payload::Receipt(mor_core::money::Receipt {
            rail: spec("a rail Module"),
            proof: vec![],
            payer: Some(mor_core::money::Payer::Identity(spec("a fan"))),
            payee: svc.id,
            amount: mor_core::money::Amount { unit: spec("a unit"), value: 1000 },
            fulfils: sa,
            previous: None,
            forward: None,
            batch: None,
            purchase: Some(mor_core::money::Purchase { agreement: f, line: f }),
        });
        let a = lab.w.everyday_act(&mut svc, mirs().money, 2, r.to_map(), None, None);
        let r1 = lab.w.add(&a);
        let split = agreements::Split {
            receipt: r1,
            payouts: vec![agreements::Payout { partner: Some(0), ..payout(label, 100) }, line_payout(ids[ANA], 360, f), line_payout(ids[BEN], 270, f), line_payout(ids[CY], 270, f)],
            cmip: spec("a split cMIP"),
            publication: sa,
            ..Default::default()
        };
        let x = lab.w.private_act(&mut svc, mirs().agreements, agreements::types::SPLIT, split.to_map(), None, ids.clone());
        (lab, svc, x, label)
    };
    let (lab, _, x, _) = run(false);
    let e = lab.view().split(&x).unwrap();
    assert!(e.problems.iter().any(|p| p.contains("vault")), "no vault declared: {:?}", e.problems);
    let (mut lab, svc, x, label) = run(true);
    let e = lab.view().split(&x).unwrap();
    assert!(e.problems.is_empty() && e.mismatched.is_empty() && e.partners_mismatched.is_empty() && e.unplanned.is_empty(), "{e:?}");
    assert!(e.own_not_to_vault.is_empty());
    // The label's receipts for its part: one paid to its vault, one to its flow.
    let own_receipt = |lab: &mut Lab, at: mor_core::money::PaidAt| {
        let rc = mor_core::money::Payload::Receipt(mor_core::money::Receipt {
            rail: spec("a rail Module"),
            proof: vec![],
            payer: Some(mor_core::money::Payer::Identity(svc.id)),
            payee: label,
            amount: mor_core::money::Amount { unit: spec("a unit"), value: 100 },
            fulfils: x,
            previous: None,
            forward: None,
            batch: None,
            purchase: None,
        });
        let a = lab.w.everyday_act(&mut lab.c[0], mirs().money, 2, rc.to_map(), None, None);
        let id = lab.w.add(&a);
        lab.rail_valid.push((id, at));
        id
    };
    own_receipt(&mut lab, mor_core::money::PaidAt::VaultEntry(label, 0));
    assert!(lab.view().split(&x).unwrap().own_not_to_vault.is_empty(), "paid to the vault");
    let flow = own_receipt(&mut lab, mor_core::money::PaidAt::Flow(spec("the label's pointer")));
    assert_eq!(lab.view().split(&x).unwrap().own_not_to_vault, vec![flow], "paid to the flow, split again");
}

/// Freeze suite v28, 3.7ag (F313; A2-6): a departed holder vanishes. The
/// label releases its work, which needs Dana's agreement, a holder of its
/// stake in itself who is no member (F310), and Dana has vanished. Declared
/// absent under the clause in force, though no party: with no plan,
/// outcome 1 shares her stake out among the other holders, by a clone she
/// need not sign, and the release proceeds; with a plan naming Sam her
/// stake successor, the stake passes to Sam, who signs the release. A
/// declaration against her stating outcome 3 or 4 counts for nothing; nor
/// outcome 1 where her plan names a successor.
#[test]
fn a_departed_holder_vanishes_3_7ag() {
    let work = spec("the label's work");
    let both = |t: &mut Terms| {
        if let Some(a) = t.abandonment.as_mut() {
            a.outcomes = vec![outcomes::VOICE_REMOVED, outcomes::STAKE_REDISTRIBUTED, outcomes::OBLIGATIONS_REDIRECTED];
        }
    };
    let declare = |lab: &mut Lab, k: Hash, dana: Hash, outs: Vec<u64>| {
        let d = AbsenceDeclaration { agreement: k, clause: k, party: dana, outcomes: outs };
        let mut a = lab.authority.clone();
        let x = agreements_act(&mut lab.w, &mut a, agreements::types::DECLARATION, d.to_map(), obj(k));
        lab.authority = a;
        x
    };
    let release = |lab: &mut Lab, wa: Hash| {
        let rel = agreements::Release { work, stakes: vec![(wa, 0)], claims: vec![], keys: vec![(spec("its publication"), vec![9; 32])], timed: None };
        let a = lab.w.everyday_act(&mut lab.c[0], mirs().agreements, agreements::types::RELEASE, rel.to_map(), obj(wa), None);
        let r = lab.w.add(&a);
        lab.sign(BEN, &r);
        r
    };
    // A clone writing stake 0 as `holders`, recorded with the members' signatures.
    let move_stake = |lab: &mut Lab, k: Hash, holders: Vec<(Hash, u64)>, extra: &mut [&mut Person]| {
        let mut t = lab.clone_terms(&k, vec![], &|t| {
            let mut st = t.stakes.clone().unwrap();
            let i = t.own_stake().unwrap().0;
            st[i].holders = holders.iter().map(|(h, n)| (Who::Id(*h), *n)).collect();
            t.stakes = Some(st);
        });
        let needs = lab.view().powers_needed(&t).unwrap();
        let ids = lab.ids();
        t.field4 = Field4::Mark(needs.iter().map(|p| MarkEntry { power: p.clone(), signers: sorted(ids.clone()) }).collect());
        let y = lab.propose(ANA, &t);
        let r = issuance_record(lab, y, extra);
        (y, r)
    };

    // No plan: outcome 1 shares her 10% out; the release proceeds.
    let (mut lab, dana, k) = owned_label_by(100_000, false, None, Some(work), &both, false);
    let wa = label_owns(&mut lab, work);
    let ids = lab.ids();
    let r = release(&mut lab, wa);
    assert!(!lab.view().release(&r).unwrap().complete, "Dana has not consented, and has vanished");
    for bad in [vec![outcomes::OBLIGATIONS_REDIRECTED], vec![outcomes::VOICE_REMOVED]] {
        let x = declare(&mut lab, k, dana.id, bad.clone());
        assert!(lab.view().declaration(&x).unwrap().is_err(), "{bad:?} against a holder who is no party counts for nothing");
    }
    let x = declare(&mut lab, k, dana.id, vec![outcomes::STAKE_REDISTRIBUTED]);
    assert!(lab.view().declaration(&x).unwrap().is_ok(), "{:?}", lab.view().declaration(&x).unwrap());
    let shared = vec![(ids[ANA], 333_334), (ids[BEN], 333_333), (ids[CY], 333_333)];
    let (y, ry) = move_stake(&mut lab, k, shared, &mut []);
    assert_eq!(puts(&lab, &ry), Some(y), "{:?}", clone_state(&lab, &ry));
    let _ = y;
    let r2 = release(&mut lab, wa);
    let e = lab.view().release(&r2).unwrap();
    assert!(e.complete, "{:?}", e.why);

    // A plan naming Sam: the stake passes to Sam, who signs the release.
    // Dee, departed, holds 10%; her plan, a departed holder's, carries only
    // its stake part (M1).
    let (mut lab, others) = Lab::with_others(
        &["dee", "sam, dee's successor"],
        &|t, o| {
            let p = t.parties.clone();
            t.stakes = stakes(vec![own(vec![(p[ANA], 300_000), (p[BEN], 300_000), (p[CY], 300_000), (o[0], 100_000)])]);
            t.departed = Some(vec![o[0]]);
            t.succession = Some(vec![SuccessionPlan { party: o[0], stakes: Some(vec![(o[1], 1_000_000)]), seats: None, entry: None }]);
            both(t);
        },
        true,
    );
    let (dana, mut sam) = (others[0].clone(), others[1].clone());
    let wa = label_owns(&mut lab, work);
    let kp = lab.founding;
    let ids = lab.ids();
    let x = declare(&mut lab, kp, dana.id, vec![outcomes::STAKE_REDISTRIBUTED]);
    assert!(lab.view().declaration(&x).unwrap().is_err(), "her plan names a successor: succession, not outcome 1");
    let x = declare(&mut lab, kp, dana.id, vec![outcomes::VOICE_REMOVED]);
    assert!(lab.view().declaration(&x).unwrap().is_err(), "against a holder who is no party, never outcome 0 (rule 85)");
    let x = declare(&mut lab, kp, dana.id, vec![]);
    assert!(lab.view().declaration(&x).unwrap().is_ok(), "no outcome: the stake goes by succession ({:?})", lab.view().declaration(&x).unwrap());
    let to_sam: Vec<(Who, u64)> = vec![(Who::Id(ids[ANA]), 300_000), (Who::Id(ids[BEN]), 300_000), (Who::Id(ids[CY]), 300_000), (Who::Id(sam.id), 100_000)];
    let _ = &dana;
    // The departed entry and the plan go with the stake: a constitutional
    // change, declared by a rotation the members sign alone.
    let y = f270_in_force(
        &mut lab,
        &kp,
        &[ANA, BEN, CY],
        &|t| {
            let i = t.own_stake().unwrap().0;
            t.stakes.as_mut().unwrap()[i].holders = to_sam.clone();
            t.departed = None;
            t.succession = None;
        },
        &[],
    );
    let _ = y;
    let r3 = release(&mut lab, wa);
    assert!(!lab.view().release(&r3).unwrap().complete, "Sam has not signed");
    sign(&mut lab.w, &mut sam, &r3);
    let e = lab.view().release(&r3).unwrap();
    assert!(e.complete, "{:?}", e.why);
}

/// Freeze suite v28, 3.7af (F318, F328 Q13, F329 Q4; A2-5): owners see the
/// money. Dana holds part of the label's stake in itself and is no member; a
/// debt of the label sealed to the members alone binds no one; sealed to
/// Dana too, or public, it is done. Where part of the stake is held by a
/// deal, a Money act is done only public (F329 Q4, replacing the suite's
/// "sealed to every party of the deal's version in force"); sealed to the
/// deal's pointer alone, or to its parties, it binds no one.
#[test]
fn owners_see_the_money_3_7af() {
    use mor_core::money::{Amount, Obligation, Payload as Fin};
    let (mut lab, mut dana, k) = owned_label(100_000);
    let ids = lab.ids();
    let label = lab.col.id;
    let creditor = spec("a printer");
    let debt = |lab: &mut Lab, to: Option<Vec<Hash>>| {
        let o = Fin::Obligation(Obligation { debtor: label, creditor, amount: Amount { unit: spec("a unit"), value: 70 }, pointer: spec("its pointer"), agreement: None });
        let x = match to {
            Some(to) => lab.w.private_act(&mut lab.c[0], mirs().money, 1, o.to_map(), None, to),
            None => {
                let a = lab.w.everyday_act(&mut lab.c[0], mirs().money, 1, o.to_map(), None, None);
                lab.w.add(&a)
            }
        };
        lab.sign(BEN, &x);
        x
    };
    let members = ids.clone();
    let x = debt(&mut lab, Some(members.clone()));
    let got = lab.view().done(&x).unwrap().unwrap();
    assert!(got.as_ref().is_err_and(|w| w.contains("F318")), "{got:?}");
    let mut with_dana = members.clone();
    with_dana.push(dana.id);
    let x = debt(&mut lab, Some(with_dana.clone()));
    assert_eq!(lab.view().done(&x).unwrap(), Some(Ok(())));
    let x = debt(&mut lab, None);
    assert_eq!(lab.view().done(&x).unwrap(), Some(Ok(())), "public");

    // Dana passes half her part to a deal, by a clone she signs.
    let mut p1 = lab.w.genesis("a band member", vec![own_home()], None, None);
    let mut p2 = lab.w.genesis("another band member", vec![own_home()], None, None);
    let deal = deal_terms(p1.id, p2.id);
    let d = agreements_act(&mut lab.w, &mut p1, agreements::types::TERMS, deal.to_map(), None);
    sign(&mut lab.w, &mut p1, &d);
    sign(&mut lab.w, &mut p2, &d);
    let (a_, b_, c_) = (ids[ANA], ids[BEN], ids[CY]);
    let mut t = lab.clone_terms(&k, vec![], &|t| {
        let mut st = t.stakes.clone().unwrap();
        st[0].holders = vec![(Who::Id(a_), 300_000), (Who::Id(b_), 300_000), (Who::Id(c_), 300_000), (Who::Id(dana.id), 50_000), (Who::Id(d), 50_000)];
        t.stakes = Some(st);
    });
    let needs = lab.view().powers_needed(&t).unwrap();
    t.field4 = Field4::Mark(needs.iter().map(|p| MarkEntry { power: p.clone(), signers: sorted(if matches!(p, Power::Holders(_)) { vec![a_, b_] } else { ids.clone() }) }).collect());
    let y = lab.propose(ANA, &t);
    let r = issuance_record(&mut lab, y, &mut [&mut dana]);
    assert_eq!(puts(&lab, &r), Some(y), "{:?}", clone_state(&lab, &r));
    let mut to_pointer = with_dana.clone();
    to_pointer.push(d);
    let x = debt(&mut lab, Some(to_pointer));
    assert!(lab.view().done(&x).unwrap().unwrap().is_err(), "sealed to the deal's pointer alone: no one");
    // F329 Q4 (Fable's aggregated review, G4): a deal has no line, so no
    // verifier could tell which version was in force when the act was
    // sealed; sealed to its parties, it reaches no one; public, it is done.
    let mut to_parties = with_dana.clone();
    to_parties.extend([p1.id, p2.id]);
    let x = debt(&mut lab, Some(to_parties));
    assert!(lab.view().done(&x).unwrap().unwrap().is_err(), "sealed to the deal's parties: a holder that is an agreement is reached only in public");
    let x = debt(&mut lab, None);
    assert_eq!(lab.view().done(&x).unwrap(), Some(Ok(())), "public");
}

/// Freeze suite v28, 3.8c (F305, with F300; Fable's Agreements review, A5):
/// a successor with no plan. Cy has no succession plan and declares an
/// identity-level succession to Sam in a rotation: until Sam confirms it,
/// it nominates nobody; confirmed, Sam is a nomination for Cy's seat, never
/// an automatic seat, approved under the constitutional change rule (the
/// ordinary clone, step 3.8's nomination). With a plan, the plan decides.
#[test]
fn a_successor_with_no_plan_3_8c() {
    use mor_core::identity::Successor;
    let mut lab = Lab::new(&|_| {});
    let label = lab.col.id;
    let cy = lab.m[CY].clone();
    let mut sam = lab.w.genesis("sam", vec![own_home()], None, None);
    let mor = |id: &Hash| Successor { protocol: "mor".into(), identifier: id.to_vec() };
    let (rot, cy2) = lab.w.rotate(&cy, Rot { successor: Some(Some(mor(&sam.id))), ..Default::default() });
    lab.m[CY] = cy2;
    // Cy's devices sign with his new key.
    lab.hand_over(CY);
    assert_eq!(lab.view().nominee(&label, &cy.id).unwrap(), None, "declared, not confirmed: nobody");
    let conf = lab.w.everyday_act(&mut sam, common::identity_spec(), mor_core::identity::types::LINK_CONFIRMATION, vec![], Some(vec![Object { chain: cy.id, predecessor: rot }]), None);
    lab.w.add(&conf);
    assert_eq!(lab.view().nominee(&label, &cy.id).unwrap(), Some(sam.id), "a nomination, once confirmed");
    // The seat is no automatic one: Cy is still a party, Sam is not.
    let cur = lab.view().current(&label).unwrap().unwrap();
    let t = lab.view().terms(&cur.agreement).unwrap();
    assert!(t.parties.contains(&cy.id) && !t.parties.contains(&sam.id));
    // With a plan, the plan decides.
    let f = lab.founding;
    lab.add_plan(&f, &[ANA, BEN, CY], SuccessionPlan { party: cy.id, stakes: None, seats: Some(vec![spec("Cy's planned successor")]), entry: Some(1) });
    assert_eq!(lab.view().nominee(&label, &cy.id).unwrap(), None);
}

/// Freeze suite v28, 3.7ae (F311, F317; A2-4): owners choose the operators.
/// The label's constitutional change rule is counted among its stake's
/// holders by share (`[5, 0, 60%]`): Dee and Eve, no members, hold 70% of
/// its stake in itself. They sign a constitutional clone; the members do not
/// rotate: the clone stands complete and unexecuted, the label running on
/// under its old terms. A rotation by the members declaring a constitutional
/// clone without the owners' signatures breaks the collective. *Stated
/// cost (F317): the owners' power binds only through the keys.*
#[test]
fn owners_choose_the_operators_3_7ae() {
    let (mut lab, others) = Lab::with_others(
        &["dee", "eve"],
        &|t, o| {
            let p = t.parties.clone();
            t.stakes = Some(vec![own(vec![(p[ANA], 100_000), (p[BEN], 100_000), (p[CY], 100_000), (o[0], 350_000), (o[1], 350_000)])]);
            t.constitutional = Some(Rule::Holders { stake: 0, share: 600_000 });
            // F328 Q11: membership counted among holders, the clause can move
            // a vanished holder's stake.
            if let Some(a) = t.abandonment.as_mut() {
                a.outcomes = vec![outcomes::VOICE_REMOVED, outcomes::STAKE_REDISTRIBUTED];
            }
        },
        true,
    );
    let (mut dee, mut eve) = (others[0].clone(), others[1].clone());
    let label = lab.col.id;
    let f = lab.founding;
    assert!(lab.view().current(&label).unwrap().is_some(), "founded");
    let constitutional = |lab: &Lab, signers: Vec<Hash>, rule: Rule| {
        let mut t = lab.clone_terms(&f, vec![], &|t| t.clone = rule.clone());
        let needs = lab.view().powers_needed(&t).unwrap();
        assert!(needs.contains(&Power::Constitutional), "{needs:?}");
        t.field4 = Field4::Mark(needs.iter().map(|p| MarkEntry { power: p.clone(), signers: sorted(signers.clone()) }).collect());
        t
    };
    // The owners sign: complete, and unexecuted while no rotation declares it.
    let t = constitutional(&lab, vec![dee.id, eve.id], Rule::Threshold(3));
    let k = lab.propose(ANA, &t);
    let sd = lab.sign_by(&mut dee, &k);
    let se = sign(&mut lab.w, &mut eve, &k);
    let a = lab.view().agreement(&k).unwrap();
    // A collective's clone is judged at a line (rule 45); the rotation that
    // would declare it judges it complete (the control below).
    assert!(a.invalid.is_none(), "{:?}", a.invalid);
    let cur = lab.view().current(&label).unwrap().unwrap();
    assert_eq!(cur.agreement, f, "complete and unexecuted: the label runs on under its old terms");
    // The members rotate, declaring a constitutional clone of their own
    // that the owners did not sign: the label is broken.
    let ids = lab.ids();
    let t = constitutional(&lab, ids.clone(), Rule::Threshold(1));
    let y = lab.propose(ANA, &t);
    let s: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &y)).collect();
    lab.rotate(Some((y, s)), &[0]);
    assert!(lab.view().current(&label).unwrap().is_none(), "a rotation by the operators without the owners' signatures breaks the collective");
    // Where the members rotate declaring the owners' clone, it is in force.
    let (mut lab2, others2) = Lab::with_others(
        &["dee", "eve"],
        &|t, o| {
            let p = t.parties.clone();
            t.stakes = Some(vec![own(vec![(p[ANA], 100_000), (p[BEN], 100_000), (p[CY], 100_000), (o[0], 350_000), (o[1], 350_000)])]);
            t.constitutional = Some(Rule::Holders { stake: 0, share: 600_000 });
            if let Some(a) = t.abandonment.as_mut() {
                a.outcomes = vec![outcomes::VOICE_REMOVED, outcomes::STAKE_REDISTRIBUTED];
            }
        },
        true,
    );
    let (mut dee2, mut eve2) = (others2[0].clone(), others2[1].clone());
    let f2 = lab2.founding;
    let t = {
        let mut t = lab2.clone_terms(&f2, vec![], &|t| t.clone = Rule::Threshold(3));
        let needs = lab2.view().powers_needed(&t).unwrap();
        t.field4 = Field4::Mark(needs.iter().map(|p| MarkEntry { power: p.clone(), signers: sorted(vec![dee2.id, eve2.id]) }).collect());
        t
    };
    let k2 = lab2.propose(ANA, &t);
    let s2 = vec![sign(&mut lab2.w, &mut dee2, &k2), sign(&mut lab2.w, &mut eve2, &k2)];
    lab2.rotate(Some((k2, s2)), &[0]);
    let label2 = lab2.col.id;
    assert_eq!(lab2.view().current(&label2).unwrap().map(|c| c.agreement), Some(k2), "executed once the key holders rotate");
    let _ = (sd, se);
}

// ---------------------------------------------------------------- the owners' acts in any order

/// A step of an owners' story (Agreements draft 14, rules 94 to 97): a sale
/// of part of the stake, a proxy, its revocation, an issuance offer and a
/// take-up, or a vote on an owners' matter recorded by the label's line;
/// each placed by the line or not.
#[derive(Clone, Debug)]
enum OwnerOp {
    Sell { seller: u8, buyer: u8, part: u8, placed: bool },
    Proxy { holder: u8, proxy: u8, scoped: bool, placed: bool },
    Revoke { placed: bool },
    Offer { public: bool },
    TakeUp { holder: u8, placed: bool },
    Vote { mark: u8, sign: u8, proxies: bool },
    Issue { took: u8 },
}

fn owner_op() -> impl proptest::strategy::Strategy<Value = OwnerOp> {
    use proptest::prelude::*;
    prop_oneof![
        2 => (any::<u8>(), any::<u8>(), 1u8..5, any::<bool>()).prop_map(|(seller, buyer, part, placed)| OwnerOp::Sell { seller, buyer, part, placed }),
        2 => (any::<u8>(), any::<u8>(), any::<bool>(), prop::bool::weighted(0.7)).prop_map(|(holder, proxy, scoped, placed)| OwnerOp::Proxy { holder, proxy, scoped, placed }),
        1 => any::<bool>().prop_map(|placed| OwnerOp::Revoke { placed }),
        1 => any::<bool>().prop_map(|public| OwnerOp::Offer { public }),
        1 => (any::<u8>(), any::<bool>()).prop_map(|(holder, placed)| OwnerOp::TakeUp { holder, placed }),
        4 => (any::<u8>(), any::<u8>(), any::<bool>()).prop_map(|(mark, sign, proxies)| OwnerOp::Vote { mark, sign, proxies }),
        1 => any::<u8>().prop_map(|took| OwnerOp::Issue { took }),
    ]
}

/// The label of `owned_label`'s kind with two owners who are no members
/// (Dana, Eve) and two outsiders who buy or stand as proxies (Fay, Gus),
/// under a sixty per cent holders' rule every holder signed, and a clock;
/// the story's steps applied. Returns the lab and the people by index:
/// Ana, Ben, Cy, Dana, Eve, Fay, Gus.
fn owners_story(ops: &[OwnerOp]) -> Lab {
    let (mut lab, mut others) = Lab::with_others(
        &["dana", "eve", "fay", "gus"],
        &|t, o| {
            let p = t.parties.clone();
            t.stakes = Some(vec![own(vec![(p[ANA], 200_000), (p[BEN], 200_000), (p[CY], 200_000), (o[0], 200_000), (o[1], 200_000)])]);
            t.holders_rules = Some(vec![agreements::HoldersEntry { stake: 0, rule: HoldersRule::Share(600_000), waived: false }]);
            t.time = Some((spec("a clock"), Value::Uint(1)));
        },
        true,
    );
    let f = lab.founding;
    for p in others.iter_mut().take(2) {
        sign(&mut lab.w, p, &f);
    }
    let ids: Vec<Hash> = lab.ids().into_iter().chain(others.iter().map(|p| p.id)).collect();
    // Who signs as person `i`: a member's phone, or one of the others.
    fn with<T>(lab: &mut Lab, others: &mut [Person], i: usize, f: impl FnOnce(&mut World, &mut Person) -> T) -> T {
        if i < 3 {
            let mut p = lab.m[i].clone();
            let out = f(&mut lab.w, &mut p);
            lab.m[i] = p;
            out
        } else {
            f(&mut lab.w, &mut others[i - 3])
        }
    }
    let mut cur = f;
    let mut proxies: Vec<Hash> = vec![];
    let mut offer: Option<Hash> = None;
    let mut part = 10_000u64;
    for op in ops {
        match op {
            OwnerOp::Sell { seller, buyer, part: q, placed } => {
                let s = *seller as usize % 5;
                let b = 5 + *buyer as usize % 2;
                let tr = agreements::StakeTransfer { agreement: cur, stake: 0, to: ids[b], share: *q as u64 * 20_000, record: vec![] };
                let t = with(&mut lab, &mut others, s, |w, p| {
                    let t = agreements_act(w, p, agreements::new_types::STAKE_TRANSFER, tr.to_map(), obj(cur));
                    let (_, q) = w.chain_sign(p, t);
                    *p = q;
                    t
                });
                with(&mut lab, &mut others, b, |w, p| sign(w, p, &t));
                if *placed {
                    lab.acknowledge(0, t);
                }
            }
            OwnerOp::Proxy { holder, proxy, scoped, placed } => {
                let h = *holder as usize % 5;
                let to = ids[5 + *proxy as usize % 2];
                let p = agreements::Proxy { version: cur, stake: 0, proxy: to, scoped: scoped.then_some(cur) };
                let x = with(&mut lab, &mut others, h, |w, q| agreements_act(w, q, agreements::owner_types::PROXY, p.to_map(), obj(cur)));
                proxies.push(x);
                if *placed {
                    lab.acknowledge(0, x);
                }
            }
            OwnerOp::Revoke { placed } => {
                let Some(px) = proxies.last().copied() else { continue };
                let Some(h) = lab.w.v.get(&px).and_then(|a| a.act.outside.signer) else { continue };
                let Some(i) = ids.iter().position(|x| *x == h) else { continue };
                let r = with(&mut lab, &mut others, i, |w, q| agreements_act(w, q, agreements::owner_types::PROXY_REVOCATION, agreements::proxy_revocation_payload(&px), obj(px)));
                if *placed {
                    lab.acknowledge(0, r);
                }
            }
            OwnerOp::Offer { public } => {
                let o = agreements::IssuanceOffer { version: cur, stake: 0, size: 100_000, new_holders: vec![(ids[5], 1_000_000)], period: Value::Uint(9), price: None, words: None, more: None };
                let x = if *public {
                    let a = lab.w.everyday_act(&mut lab.c[0], mirs().agreements, agreements::owner_types::ISSUANCE_OFFER, o.to_map(), obj(cur), None);
                    lab.w.add(&a)
                } else {
                    let to = sorted(lab.ids());
                    lab.w.private_act(&mut lab.c[0], mirs().agreements, agreements::owner_types::ISSUANCE_OFFER, o.to_map(), obj(cur), to)
                };
                offer = Some(x);
            }
            OwnerOp::TakeUp { holder, placed } => {
                let Some(o) = offer else { continue };
                let h = *holder as usize % 5;
                let x = with(&mut lab, &mut others, h, |w, p| sign(w, p, &o));
                if *placed {
                    lab.acknowledge(0, x);
                }
            }
            OwnerOp::Vote { mark, sign: who, proxies: by_proxy } => {
                let marked: Vec<Hash> = (0..7).filter(|i| mark >> i & 1 == 1).map(|i| ids[i]).collect();
                part += 1_000;
                let (x, _) = fee_clone(&mut lab, &cur, part, &marked);
                let mut s: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &x)).collect();
                for i in 3..7 {
                    if (who >> i & 1 == 1) || (*by_proxy && i >= 5) {
                        s.push(with(&mut lab, &mut others, i, |w, p| sign(w, p, &x)));
                    }
                }
                let r = lab.record(0, Some((x, s)), &[], vec![], x);
                if lab.view().record(&lab.col.id, &r).ok().and_then(|e| e.puts) == Some(x) {
                    cur = x;
                }
            }
            OwnerOp::Issue { took } => {
                let Some(o) = offer else { continue };
                let roster: Vec<(Hash, u64)> = {
                    let t = lab.view().terms(&cur).unwrap();
                    t.own_stake().unwrap().1.identified()
                };
                // Pro rata, those in `took` keeping their whole share.
                let mut holders: Vec<(Hash, u64)> = vec![];
                let mut left = 100_000u64;
                for (i, (h, n)) in roster.iter().enumerate() {
                    if took >> i & 1 == 1 {
                        holders.push((*h, *n));
                        left -= n / 10;
                    } else {
                        holders.push((*h, n - n / 10));
                    }
                }
                let _ = left;
                // The new holder takes what is left, so the shares sum exactly.
                holders.retain(|(h, _)| *h != ids[5]);
                let rest = 1_000_000 - holders.iter().map(|(_, n)| *n).sum::<u64>();
                // Every holder took up its whole share: nothing is issued, so
                // there is no issuance to make (no owners' matter either).
                if rest == 0 {
                    continue;
                }
                holders.push((ids[5], rest));
                holders.retain(|(_, n)| *n > 0);
                let x = issuance(&mut lab, &cur, agreements::IssuesUnder::Offer(o), holders, &[ids[ANA], ids[BEN], ids[CY]]);
                let mut s: Vec<Hash> = [ANA, BEN, CY].iter().map(|i| lab.sign(*i, &x)).collect();
                s.push(with(&mut lab, &mut others, 5, |w, p| sign(w, p, &x)));
                let r = lab.record(0, Some((x, s)), &[], vec![], x);
                if lab.view().record(&lab.col.id, &r).ok().and_then(|e| e.puts) == Some(x) {
                    cur = x;
                }
            }
        }
    }
    lab
}

/// What the library says of every act an owners' story made: each act's
/// status; each record's verdict (what it puts in force, its clone's state);
/// each transfer's effect; the label's agreement in force.
fn owners_verdicts(v: &mor_core::chain::Verifier, label: &Hash) -> std::collections::BTreeMap<Hash, String> {
    let mut lv = common::stand_in_payments(AgreementsView::new(v, mirs()));
    lv.ext_layers.insert(ext(), vec![]);
    let mut out = std::collections::BTreeMap::new();
    let ids: Vec<Hash> = v.held_acts().map(|h| h.id).collect();
    for id in ids {
        let h = v.get(&id).unwrap();
        let mut s = format!("status={:?}", v.status(&id));
        if h.inside.spec == mirs().agreements {
            match h.inside.type_ {
                agreements::types::RECORD => s += &format!(" record={:?}", lv.record(label, &id).map(|e| (e.puts, e.clone.map(|c| c.1)))),
                agreements::new_types::STAKE_TRANSFER => s += &format!(" transfer={:?}", lv.transfer(&id).map(|e| (e.effective, e.place))),
                _ => {}
            }
        }
        out.insert(id, s);
    }
    out.insert(*label, format!("current={:?}", lv.current(label).map(|c| c.map(|c| c.agreement))));
    out
}

/// Freeze suite v28, 3.7ab, 3.7ac, 3.7ad and 3.7ak in any order (Agreements
/// draft 14, rules 94 to 97; F302, F316, F327, F329 Q3): random owners'
/// stories (sales placed by the line or not, proxies and revocations,
/// issuance offers and take-ups, votes on owners' matters with and without
/// proxies) are judged, then their acts are delivered again into fresh
/// verifiers in shuffled orders: every verdict must come out the same. Cases:
/// `AGREEMENTS_INVARIANT_CASES` (default 16); the stories are drawn from
/// `AGREEMENTS_INVARIANT_SEED` (default 1), so a run is the same everywhere
/// and another seed explores other stories.
#[test]
fn owners_verdicts_do_not_depend_on_order() {
    use proptest::prelude::*;
    use proptest::test_runner::{Config, TestRunner};
    let cases = std::env::var("AGREEMENTS_INVARIANT_CASES").ok().and_then(|v| v.parse().ok()).unwrap_or(16);
    let seed: u64 = std::env::var("AGREEMENTS_INVARIANT_SEED").ok().and_then(|v| v.parse().ok()).unwrap_or(1);
    let mut bytes = [0u8; 32];
    bytes[..8].copy_from_slice(&seed.to_le_bytes());
    let rng = proptest::test_runner::TestRng::from_seed(proptest::test_runner::RngAlgorithm::ChaCha, &bytes);
    let mut runner = TestRunner::new_with_rng(Config { cases, failure_persistence: None, ..Config::default() }, rng);
    // Stories whose votes moved the label off its founding terms: the
    // property is about something only if some do.
    let moved = std::sync::atomic::AtomicUsize::new(0);
    let check = |(ops, seed): (Vec<OwnerOp>, u64)| -> Result<(), proptest::test_runner::TestCaseError> {
        let lab = owners_story(&ops);
        let label = lab.col.id;
        let first = owners_verdicts(&lab.w.v, &label);
        if first.get(&label).is_some_and(|c| !c.contains(&format!("{:?}", lab.founding))) {
            moved.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
        }
        let mut order: Vec<usize> = (0..lab.w.log.len()).collect();
        let mut x = seed | 1;
        for i in (1..order.len()).rev() {
            x ^= x << 13;
            x ^= x >> 7;
            x ^= x << 17;
            order.swap(i, (x % (i as u64 + 1)) as usize);
        }
        let mut v = mor_core::chain::Verifier::with_mirs(common::identity_spec(), common::money_spec(), common::agreements_spec());
        for i in order {
            let (a, k) = &lab.w.log[i];
            v.add_with_key(a.clone(), k.as_ref()).unwrap();
        }
        let second = owners_verdicts(&v, &label);
        for (k, a) in &first {
            let b = second.get(k).map(String::as_str).unwrap_or("(not held)");
            prop_assert_eq!(a.as_str(), b, "act {:?} judged differently in another order, story {:?}", k, ops);
        }
        Ok(())
    };
    // Stories that put an owners' matter in force whatever the seed: a fee
    // clone the members mark (three fifths of the stake, its holders' rule),
    // alone, and after a placed sale and a proxy; each shuffled too.
    let fixed = [
        vec![OwnerOp::Vote { mark: 0b0000111, sign: 0, proxies: false }],
        vec![
            OwnerOp::Sell { seller: 3, buyer: 5, part: 1, placed: true },
            OwnerOp::Proxy { holder: 4, proxy: 6, scoped: true, placed: true },
            OwnerOp::Vote { mark: 0b0000111, sign: 0b1111000, proxies: true },
        ],
    ];
    for (i, ops) in fixed.into_iter().enumerate() {
        if let Err(e) = check((ops, i as u64 + 1)) {
            panic!("{e}");
        }
    }
    let r = runner.run(&(prop::collection::vec(owner_op(), 1..9), any::<u64>()), check);
    if let Err(e) = r {
        panic!("{e}");
    }
    assert!(moved.into_inner() > 0, "no story put an owners' matter in force");
}

/// F334 (Text draft 9, rule 14; Agreements rule 58): a collective's text act
/// names, as its one object, its own decision on its actions chain, and is
/// valid and counted. Any other `objects` on a text act stays invalid (F296):
/// another collective's chain, an individual signer, two objects, a pointer
/// to an act that is no decision of its own, any other object; and an act
/// its verifier judges invalid counts for nothing in Agreements either.
#[test]
fn a_collectives_text_names_its_own_decision_f334() {
    let mut lab = Lab::new(&|t| {
        t.areas = None;
        t.area_words = None;
    });
    let col = lab.col.id;
    let text = |s: &str| vec![(Value::Uint(0), Value::Text(s.into()))];
    // Its own pointer, as its client cites it (rule 58): valid, and counted.
    let a = lab.w.everyday_act(&mut lab.c[0], mirs().text, 0, text("For the house."), None, None);
    let good = lab.w.add(&a);
    assert_eq!(lab.w.v.status(&good), Status::Valid);
    // No area: the rule for Text, any one member (field 19, rule 60).
    assert!(matches!(lab.consent(&good), Consent::Areas { .. }), "{:?}", lab.consent(&good));
    assert!(lab.counts(&good));
    // Without the pointer it is valid as a text, the member's own, on no
    // chain of the collective (rule 58).
    let mut bare = lab.c[0].clone();
    bare.cite = None;
    let a = lab.w.everyday_act(&mut bare, mirs().text, 0, text("Uncited."), None, None);
    let uncited = lab.w.add(&a);
    assert_eq!(lab.w.v.status(&uncited), Status::Valid);
    assert_eq!(lab.consent(&uncited), Consent::NotCollective);

    // Another collective, declaring an agreement of its own.
    let other = lab.w.genesis_with(
        "other",
        vec![own_home()],
        None,
        None,
        Some(vec![agreements::founding_declaration(&mirs().agreements, &lab.founding)]),
        3,
    );
    let ana = lab.m[ANA].id;
    let one = |chain: Hash, predecessor: Hash| Some(vec![Object { chain, predecessor }]);
    let mut dev = lab.c[1].clone();
    dev.seq = lab.c[0].seq.clone();
    let cases: Vec<(&str, Option<Vec<Object>>)> = vec![
        ("its own chain, another collective's decision", one(col, other.id)),
        ("its own chain, an act that is no decision", one(col, good)),
        ("two objects", Some(vec![Object { chain: col, predecessor: col }, Object { chain: col, predecessor: col }])),
        // An identity that is no collective (a chain not held answers
        // unknown, Text rule 14).
        ("any other object", one(lab.keeper.id, lab.keeper.id)),
    ];
    for (label, objects) in cases {
        // Exactly these objects: the device adds no pointer of its own.
        let mut d = dev.clone();
        d.cite = None;
        let a = lab.w.everyday_act(&mut d, mirs().text, 0, text(label), objects, None);
        let id = lab.w.add(&a);
        assert_eq!(lab.w.v.status(&id), Status::Invalid, "{label}: {:?}", lab.consent(&id));
        match lab.consent(&id) {
            // Naming no collective: the member's own act, invalid under Text.
            Consent::NotCollective => {}
            c => {
                assert!(!c.counts(), "{label}: counts for nothing in Agreements");
                assert!(matches!(c, Consent::Invalid { .. } | Consent::Uncited { .. }), "{label}");
            }
        }
    }
    // An individual signer naming its own chain: no collective, invalid (F296 kept).
    let mut ana_dev = lab.m[ANA].clone();
    let a = lab.w.everyday_act(&mut ana_dev, mirs().text, 0, text("My own log."), one(ana, ana), None);
    let solo = lab.w.add(&a);
    assert_eq!(lab.w.v.status(&solo), Status::Invalid);
}

/// F343 (Text draft 10, rule 14; Agreements rules 58, 73 and 75): an act
/// signed with a grant key names, as its one object, the grant its binding
/// names, on its grantor's chain. A post under a person's grant and under a
/// collective's grant is valid under Text and backed by Agreements; a
/// grantee's post naming anything else, or two objects, stays invalid; an
/// individual's own post naming its own chain stays invalid (F296).
#[test]
fn a_post_under_a_grant_names_its_grant_f343() {
    let text = |s: &str| vec![(Value::Uint(0), Value::Text(s.into()))];
    let one = |chain: Hash, predecessor: Hash| Some(vec![Object { chain, predecessor }]);
    fn view(w: &World) -> AgreementsView<'_> {
        common::stand_in_payments(AgreementsView::new(&w.v, mirs()))
    }

    // A person's grant: an owner grants its agent posting in its name.
    let mut w = World::new();
    let mut owner = w.genesis("an owner", vec![own_home()], None, None);
    let mut agent = w.genesis("its agent", vec![own_home()], None, None);
    let oid = owner.id;
    let g = agreements_act(&mut w, &mut owner, agreements::types::GRANT, person_grant(agent.id).to_map(), None);
    sign(&mut w, &mut agent, &g);
    let mut strand = owner.clone();
    strand.binding = g;
    strand.sign = key_of(agent.id);
    strand.seq = vec![];
    strand.cite = Some((oid, vec![g]));
    let a = w.everyday_act(&mut strand, mirs().text, 0, text("Posted for my owner, under its grant."), None, None);
    let post = w.add(&a);
    assert_eq!(w.v.status(&post), Status::Scoped, "Identity checks the grant key's signature only (rule 8)");
    assert_eq!(view(&w).backing(&post).unwrap(), Backing::Backed { grant: g });
    // Naming another act of the grantor, another chain, or two objects: invalid.
    let other = agreements_act(&mut w, &mut owner, agreements::types::REVOCATION, agreements::Revocation { grant: sha256(b"no grant") }.to_map(), None);
    let cases: Vec<(&str, Option<Vec<Object>>)> = vec![
        ("another act of the grantor", one(oid, other)),
        ("another chain", one(agent.id, g)),
        ("two objects", Some(vec![Object { chain: oid, predecessor: g }, Object { chain: oid, predecessor: g }])),
    ];
    for (label, objects) in cases {
        let mut d = strand.clone();
        d.cite = None;
        let a = w.everyday_act(&mut d, mirs().text, 0, text(label), objects, None);
        let id = w.add(&a);
        assert_eq!(w.v.status(&id), Status::Invalid, "{label}");
    }
    // An individual's own post naming its own chain: invalid, as before (F296).
    let mut own_dev = owner.clone();
    own_dev.cite = None;
    let a = w.everyday_act(&mut own_dev, mirs().text, 0, text("My own log."), one(oid, g), None);
    let solo = w.add(&a);
    assert_eq!(w.v.status(&solo), Status::Invalid);

    // A collective's grant, naming no area, in a collective with none.
    let mut lab = Lab::new(&|t| {
        t.areas = None;
        t.area_words = None;
    });
    let mut grantee = lab.w.genesis("a grantee", vec![own_home()], None, None);
    let cg = lab.grant(&Grant { kinds: Some(vec![Kind::Layer(agreements::layers::TEXT)]), ..plain_grant(grantee.id) });
    lab.sign(ANA, &cg);
    sign(&mut lab.w, &mut grantee, &cg);
    let mut cs = lab.strand(cg, &grantee);
    let a = lab.w.everyday_act(&mut cs, mirs().text, 0, text("For the house, under its grant."), None, None);
    let cpost = lab.w.add(&a);
    assert_eq!(lab.w.v.status(&cpost), Status::Valid, "the grantee's own act, naming the house and its grant");
    assert_eq!(lab.view().backing(&cpost).unwrap(), Backing::Backed { grant: cg });
}

/// F345 (Agreements rule 80, draft 14, F320): a person's grant carrying
/// limits under a cMIP (fields 3 and 4): with no verdict on them the act is
/// unknown; with the client's verdict, backed within them and not backed
/// outside them, the grant quiet.
#[test]
fn a_grants_limits_take_a_clients_verdict_f345() {
    let mut w = World::new();
    let mut owner = w.genesis("an owner", vec![own_home()], None, None);
    let mut agent = w.genesis("its agent", vec![own_home()], None, None);
    let oid = owner.id;
    let grant = Grant { limits: Some(Value::Uint(1000)), limits_cmip: Some(spec("a grant limits cMIP")), ..person_grant(agent.id) };
    let g = agreements_act(&mut w, &mut owner, agreements::types::GRANT, grant.to_map(), None);
    sign(&mut w, &mut agent, &g);
    let mut strand = owner.clone();
    strand.binding = g;
    strand.sign = key_of(agent.id);
    strand.seq = vec![];
    strand.cite = Some((oid, vec![g]));
    let a = w.everyday_act(&mut strand, mirs().text, 0, vec![(Value::Uint(0), Value::Text("Within?".into()))], None, None);
    let post = w.add(&a);
    let mut v = common::stand_in_payments(AgreementsView::new(&w.v, mirs()));
    assert!(matches!(v.backing(&post).unwrap(), Backing::Unknown { .. }));
    v.grant_limits.insert(post, true);
    assert_eq!(v.backing(&post).unwrap(), Backing::Backed { grant: g });
    v.grant_limits.insert(post, false);
    assert!(matches!(v.backing(&post).unwrap(), Backing::NotBacked { ref reason, .. } if reason.contains("limits")));
}

/// F350 (Money draft 9, rule 7): a receipt or a claim may be signed with a
/// grant key its party granted (a person's lane), whose grant reaches that
/// act type; judged as scoped, by Agreements (rules 73 and 80). A payer's
/// claim under a person's lane and a payee's receipt under a person's
/// receipt lane both count for a verifier reading Agreements; Identity alone
/// (a Money-only client) sees them scoped, never valid; a lane whose grant
/// does not reach receipts backs no receipt, and its receipt pays nothing.
#[test]
fn a_persons_lane_signs_its_receipts_and_claims_f350() {
    use mor_core::money::{types as money_types, Amount, Claim, Obligation, Payer, Payload as Fin, PaidAt, Receipt};
    let mut w = World::new();
    let mut p = w.genesis("a payer", vec![own_home()], None, None);
    let mut q = w.genesis("a payee", vec![own_home()], None, None);
    let (pid, qid) = (p.id, q.id);
    let ptr = pointer_of(&mut w, &mut q, 1, None, &[b"its node"]);
    let unit = spec("a unit");
    let debt = {
        let o = Fin::Obligation(Obligation { debtor: pid, creditor: qid, amount: Amount { unit, value: 1000 }, pointer: ptr, agreement: None });
        let a = w.everyday_act(&mut p, mirs().money, money_types::OBLIGATION, o.to_map(), None, None);
        w.add(&a)
    };
    // A lane: the person's own grant to itself (F338, F350), reaching one Money type, its key held by an app.
    let lane = |w: &mut World, who: &mut Person, name: &str, ty: u64| -> (Hash, SchnorrKey) {
        let (k, key) = grant_key(name);
        let g = Grant { kinds: Some(vec![Kind::Type { spec: mirs().money, type_: ty }]), key: Some(key), ..plain_grant(who.id) };
        let id = agreements_act(w, who, agreements::types::GRANT, g.to_map(), None);
        sign(w, who, &id);
        (id, k)
    };
    let strand = |who: &Person, g: Hash, k: &SchnorrKey| {
        let mut s = who.clone();
        s.binding = g;
        s.sign = k.clone();
        s.seq = vec![];
        s.cite = Some((who.id, vec![g]));
        s
    };
    let proof = b"the rail's proof".to_vec();
    let receipt = |w: &mut World, by: &mut Person| {
        let r = Fin::Receipt(Receipt { rail: spec("a rail Module"), proof: proof.clone(), payer: Some(Payer::Identity(pid)), payee: qid, amount: Amount { unit, value: 1000 }, fulfils: debt, previous: None, forward: None, batch: None, purchase: None });
        let a = w.everyday_act(by, mirs().money, money_types::RECEIPT, r.to_map(), None, None);
        w.add(&a)
    };

    // The payer's claim, signed by Dub under the payer's lane for claims.
    let (pl, pk) = lane(&mut w, &mut p, "the payer's lane", money_types::CLAIM);
    let mut ps = strand(&p, pl, &pk);
    let claim = {
        let c = Fin::Claim(Claim { rail: spec("a rail Module"), proof: proof.clone(), payee: qid, amount: Amount { unit, value: 1000 }, fulfils: debt, disagrees: None, referral: None, refund: None, anonymous: None, purchase: None, previous: None });
        let a = w.everyday_act(&mut ps, mirs().money, money_types::CLAIM, c.to_map(), None, None);
        w.add(&a)
    };
    assert_eq!(w.v.status(&claim), Status::Scoped, "a Money-only client: scoped, shown unknown, never valid (Identity rule 8)");
    let mut v = common::stand_in_payments(AgreementsView::new(&w.v, mirs()));
    v.rail_valid.insert(claim, PaidAt::VaultEntry(qid, 0));
    assert_eq!(v.backing(&claim).unwrap(), Backing::Backed { grant: pl });
    assert_eq!(v.payers_claims(&proof), vec![claim], "the payer's claim, under its lane, counts");
    drop(v);

    // A lane reaching claims only, used to sign a receipt: not backed, and the receipt pays nothing.
    let (wrong, wk) = lane(&mut w, &mut q, "a lane for claims only", money_types::CLAIM);
    let mut ws = strand(&q, wrong, &wk);
    let bad = receipt(&mut w, &mut ws);
    assert_eq!(w.v.status(&bad), Status::Scoped);
    let mut v = common::stand_in_payments(AgreementsView::new(&w.v, mirs()));
    v.rail_valid.insert(bad, PaidAt::VaultEntry(qid, 0));
    assert!(matches!(v.backing(&bad).unwrap(), Backing::NotBacked { ref reason, .. } if reason.contains("reach")));
    assert_eq!(v.paid_toward(&debt).unwrap(), 0, "a grant not reaching receipts signs none that counts");
    drop(v);

    // The payee's receipt lane: its receipt counts toward the debt.
    let (rl, rk) = lane(&mut w, &mut q, "the payee's receipt lane", money_types::RECEIPT);
    let mut rs = strand(&q, rl, &rk);
    let good = receipt(&mut w, &mut rs);
    assert_eq!(w.v.status(&good), Status::Scoped, "a Money-only client: scoped, shown unknown");
    let mut v = common::stand_in_payments(AgreementsView::new(&w.v, mirs()));
    v.rail_valid.insert(bad, PaidAt::VaultEntry(qid, 0));
    v.rail_valid.insert(good, PaidAt::VaultEntry(qid, 0));
    assert_eq!(v.backing(&good).unwrap(), Backing::Backed { grant: rl });
    assert_eq!(v.paid_toward(&debt).unwrap(), 1000, "the receipt under the receipt lane counts");
    drop(v);

    // Revoked before it signs: the next receipt under it pays nothing.
    // Revoked, its revocation citing the act signed under the lane before it (rule 76: an act the revocation's history holds binds).
    let rev = agreements_act(&mut w, &mut q, agreements::types::REVOCATION, agreements::Revocation { grant: rl }.to_map(), Some(vec![Object { chain: qid, predecessor: good }]));
    assert_eq!(w.v.status(&rev), Status::Valid);
    let late = receipt(&mut w, &mut rs);
    let mut v = common::stand_in_payments(AgreementsView::new(&w.v, mirs()));
    v.rail_valid.insert(late, PaidAt::VaultEntry(qid, 0));
    assert!(!matches!(v.backing(&late).unwrap(), Backing::Backed { .. }), "after its revocation, a lane backs nothing");
    // Paid toward the debt: the receipt its revocation's history holds, as Money counts payments (rule 76).
    v.rail_valid.insert(good, PaidAt::VaultEntry(qid, 0));
    assert!(matches!(v.backing(&good).unwrap(), Backing::Binds { .. } | Backing::Backed { .. }), "{:?}", v.backing(&good));
    assert_eq!(v.paid_toward(&debt).unwrap(), 1000);
    drop(v);
    let mut v = common::stand_in_payments(AgreementsView::new(&w.v, mirs()));
    v.rail_valid.insert(late, PaidAt::VaultEntry(qid, 0));
    assert_eq!(v.paid_toward(&debt).unwrap(), 0, "a receipt under a revoked lane pays nothing");

    // F352 (A'): a lane's acts are chained on its strand, each naming the one
    // before; a payee holds only its own act, sealed to it. A revocation
    // citing every act under the lane keeps each counted for its payee; one
    // citing only the last does not, since the chain runs inside acts that
    // payee cannot open (Inside field 2): the reason the revocation cites them all.
    let chained = |w: &mut World, q: &mut Person, name: &str| {
        let (l, k) = lane(w, q, name, money_types::RECEIPT);
        let mut s = strand(q, l, &k);
        let acts = [receipt(w, &mut s), receipt(w, &mut s), receipt(w, &mut s)];
        (l, acts)
    };
    // What one payee holds: everything public, and of the lane's acts its own alone.
    let payee_of = |w: &World, own: Hash, others: &[Hash]| {
        let mut f = World::new();
        for (a, k) in &w.log {
            if others.contains(&a.id()) && a.id() != own {
                continue;
            }
            let _ = f.v.add_with_key(a.clone(), k.as_ref());
        }
        f
    };
    let (all, acts) = chained(&mut w, &mut q, "a lane revoked citing every act");
    let objects = acts.iter().map(|a| Object { chain: qid, predecessor: *a }).collect();
    agreements_act(&mut w, &mut q, agreements::types::REVOCATION, agreements::Revocation { grant: all }.to_map(), Some(objects));
    for own in acts {
        let f = payee_of(&w, own, &acts);
        let v = common::stand_in_payments(AgreementsView::new(&f.v, mirs()));
        assert!(matches!(v.backing(&own).unwrap(), Backing::Binds { .. } | Backing::Backed { .. }), "each payee, holding only its own act, finds it counted: {:?}", v.backing(&own));
    }
    let (last, acts) = chained(&mut w, &mut q, "a lane revoked citing its last act only");
    agreements_act(&mut w, &mut q, agreements::types::REVOCATION, agreements::Revocation { grant: last }.to_map(), Some(vec![Object { chain: qid, predecessor: acts[2] }]));
    let v = common::stand_in_payments(AgreementsView::new(&w.v, mirs()));
    for a in acts {
        assert!(matches!(v.backing(&a).unwrap(), Backing::Binds { .. } | Backing::Backed { .. }), "a reader holding every act follows the chain: {:?}", v.backing(&a));
    }
    drop(v);
    let f = payee_of(&w, acts[0], &acts);
    let v = common::stand_in_payments(AgreementsView::new(&f.v, mirs()));
    assert!(
        matches!(v.backing(&acts[0]).unwrap(), Backing::NotBacked { ref reason, .. } if reason.contains("tie rule")),
        "the first payee cannot follow the chain through acts it cannot open: its act is void"
    );
}

// ---------------------------------------------------------------- members' own keys (F353)

/// The label's payee pointer naming the rail [`label_receipt`] pays on,
/// drawn by `by` for it and signed by `cosigners`.
fn label_pointer(lab: &mut Lab, by: usize, cosigners: &[usize]) -> Hash {
    let label = lab.col.id;
    let p = mor_core::money::Payload::PayeePointer(mor_core::money::PayeePointer {
        payee: label,
        version: 1,
        previous: None,
        rails: vec![mor_core::money::Rail { module: spec("a rail Module"), address: b"an address".to_vec() }],
    });
    let mut d = lab.m[by].acting_for(label, vec![label]);
    let x = lab.w.everyday_act(&mut d, mirs().money, 0, p.to_map(), None, None);
    let x = lab.w.add(&x);
    for i in cosigners {
        lab.sign(*i, &x);
    }
    x
}

/// A receipt the label is paid by (Money type 2), payee the label.
fn label_receipt(label: Hash, value: u64) -> Vec<(Value, Value)> {
    mor_core::money::Payload::Receipt(mor_core::money::Receipt {
        rail: spec("a rail Module"),
        proof: vec![],
        payer: Some(mor_core::money::Payer::Identity(spec("a fan"))),
        payee: label,
        amount: mor_core::money::Amount { unit: spec("a unit"), value },
        fulfils: spec("an offer"),
        previous: None,
        forward: None,
        batch: None,
        purchase: None,
    })
    .to_map()
}

/// F353, carried into Agreements draft 17 (rules 58 and 60, F404): each
/// member acts for the collective with their own key, naming it; their act
/// counts as their signature within the areas and lanes the agreement in
/// force gives them. A one-signature area takes one member's act; a
/// two-signature area takes one member's act and another member's
/// signature act.
#[test]
fn members_act_with_their_own_keys() {
    let mut lab = Lab::new(&|t| {
        // Money: Ana and Ben, two signatures.
        let a = t.areas.as_mut().unwrap().iter_mut().find(|a| a.id == 2).unwrap();
        a.holders = vec![t.parties[ANA], t.parties[BEN]];
        a.threshold = 2;
    });
    let f = lab.founding;
    let label = lab.col.id;
    let (ana, ben) = (lab.m[ANA].id, lab.m[BEN].id);
    let mut a = lab.m[ANA].acting_for(label, vec![label]);
    let mut b = lab.m[BEN].acting_for(label, vec![label]);
    let mut c = lab.m[CY].acting_for(label, vec![label]);
    let act = |lab: &mut Lab, st: &mut Person, spec: Hash, ty: u64, p: Vec<(Value, Value)>| -> Hash {
        let x = lab.w.everyday_act(st, spec, ty, p, None, None);
        lab.w.add(&x)
    };
    let env = mirs().envelopes;
    // Ana alone publishes: the Releases area, one signature, her act.
    let p = act(&mut lab, &mut a, env, 0, publication(vec![]));
    assert_eq!(lab.w.v.status(&p), Status::Valid, "her own act, under Identity");
    assert!(lab.counts(&p), "{:?}", lab.consent(&p));
    assert_eq!(areas(&lab.consent(&p)), vec![(1, false, true, vec![ana])], "the act shows which member signed");
    // Ben's receipt for the label, on the rail its pointer names: one
    // signature of two.
    label_pointer(&mut lab, ANA, &[BEN]);
    let m = act(&mut lab, &mut b, mirs().money, 2, label_receipt(label, 10));
    assert!(!lab.counts(&m));
    assert_eq!(areas(&lab.consent(&m)), vec![(2, false, false, vec![ben])]);
    // Ana's signature act: the second.
    lab.sign(ANA, &m);
    assert!(lab.counts(&m), "{:?}", lab.consent(&m));
    assert_eq!(areas(&lab.consent(&m)).into_iter().map(|a| sorted(a.3)).collect::<Vec<_>>(), vec![sorted(vec![ana, ben])]);
    // Ben alone cannot publish: he holds no Releases area.
    let q = act(&mut lab, &mut b, env, 0, publication(vec![]));
    assert_eq!(areas(&lab.consent(&q)), vec![(1, false, false, vec![])]);
    // Cy holds no area: his publication waits for Ana's signature.
    let r = act(&mut lab, &mut c, env, 0, publication(vec![]));
    assert_eq!(areas(&lab.consent(&r)), vec![(1, false, false, vec![])]);
    let _ = f;
}

/// F358, Money draft 10, rule 7 (decided by Nobody, allegedly, 19 October
/// 2026: "money areas should be able to do it. A founder should not have a
/// special position if the constitution does not say so"): a collective's
/// payee pointer (Money type 0) signed with the member keys of the area
/// reaching Money is scoped, judged by Agreements with that area's holders
/// and threshold. Money held by Ana and Ben, two keys: Ana's key alone
/// puts no pointer in force; with Ben's, it is the collective's pointer; a
/// later one by Cy's key, who holds no box in Money, never counts, and the
/// collective's own key is not needed.
#[test]
fn a_collectives_pointer_signed_by_its_money_area_f358() {
    let mut lab = Lab::new(&|t| {
        let a = t.areas.as_mut().unwrap().iter_mut().find(|a| a.id == 2).unwrap();
        a.holders = vec![t.parties[ANA], t.parties[BEN]];
        a.threshold = 2;
    });
    let label = lab.col.id;
    let pointer = |lab: &mut Lab, st: &mut Person, version: u64, previous: Option<Hash>, address: &[u8]| -> Hash {
        let p = mor_core::money::Payload::PayeePointer(mor_core::money::PayeePointer {
            payee: label,
            version,
            previous,
            rails: vec![mor_core::money::Rail { module: spec("a rail"), address: address.to_vec() }],
        });
        let x = lab.w.everyday_act(st, mirs().money, 0, p.to_map(), None, None);
        lab.w.add(&x)
    };
    let mut a = lab.m[ANA].acting_for(label, vec![label]);
    let mut b = lab.m[BEN].acting_for(label, vec![label]);
    let mut c = lab.m[CY].acting_for(label, vec![label]);
    let p1 = pointer(&mut lab, &mut a, 1, None, b"the split service's node");
    assert_eq!(lab.w.v.status(&p1), Status::Valid, "a member's pointer for the label is their own act under Identity");
    assert!(lab.view().payee_pointer(&label).unwrap().is_err(), "one signature of two: no pointer in force");
    lab.sign(BEN, &p1);
    let (id, got) = lab.view().payee_pointer(&label).unwrap().expect("with Ben's signature, the area's two");
    assert_eq!((id, got.version, got.rails[0].address.clone()), (p1, 1, b"the split service's node".to_vec()));
    // Cy holds no box in Money: his later pointer counts for nothing, even signed by Ana.
    let p2 = pointer(&mut lab, &mut c, 2, Some(p1), b"Cy's node");
    lab.sign(ANA, &p2);
    assert_eq!(lab.view().payee_pointer(&label).unwrap().map(|(i, _)| i), Ok(p1));
    // The area's two move it on; the label signs none of it (it has no key).
    let p3 = pointer(&mut lab, &mut b, 2, Some(p1), b"another node");
    lab.sign(ANA, &p3);
    assert_eq!(lab.view().payee_pointer(&label).unwrap().map(|(i, _)| i), Ok(p3));
}

/// F353, draft 16, and the grant limits cMIP's draft 2: an area's limits
/// (key 6) are a cMIP's. Money held by Ana and Ben at one key, with a cap:
/// within it, one key counts; above it, the cMIP asks a second; a verifier
/// with no verdict answers unknown, and the act does not count.
#[test]
fn a_lanes_limits_ask_a_second_key_above_them() {
    let cap = spec("the grant limits cMIP, draft 2");
    let mut lab = Lab::new(&|t| {
        let a = t.areas.as_mut().unwrap().iter_mut().find(|a| a.id == 2).unwrap();
        a.holders = vec![t.parties[ANA], t.parties[BEN]];
        a.threshold = 1;
        a.limits = Some((cap, Value::Map(vec![(Value::Uint(0), Value::Array(vec![Value::Bytes(spec("a unit").to_vec()), Value::Uint(10_000)]))])));
    });
    let label = lab.col.id;
    // Its pointer, within the cap.
    let ptr = label_pointer(&mut lab, BEN, &[]);
    let mut b = lab.m[BEN].acting_for(label, vec![label]);
    let small = {
        let x = lab.w.everyday_act(&mut b, mirs().money, 2, label_receipt(label, 1_000), None, None);
        lab.w.add(&x)
    };
    let large = {
        let x = lab.w.everyday_act(&mut b, mirs().money, 2, label_receipt(label, 50_000), None, None);
        lab.w.add(&x)
    };
    let judged = |lab: &Lab, x: &Hash, within: Option<bool>| -> Consent {
        let mut v = lab.view();
        v.grant_limits.insert(ptr, true);
        if let Some(w) = within {
            v.grant_limits.insert(*x, w);
        }
        v.consent(x).unwrap()
    };
    // No verdict: unknown, never counted.
    let c = judged(&lab, &small, None);
    assert!(!c.counts());
    assert!(matches!(&c, Consent::Areas { areas, .. } if areas[0].limits == Some(agreements::AreaLimits::Unknown)), "{c:?}");
    assert!(judged(&lab, &small, Some(true)).counts(), "within the cap, one signature");
    assert!(!judged(&lab, &large, Some(false)).counts(), "above it, a second is asked");
    lab.sign(ANA, &large);
    let c = judged(&lab, &large, Some(false));
    assert!(c.counts(), "{c:?}");
    assert!(matches!(&c, Consent::Areas { areas, .. } if areas[0].needed == 2 && areas[0].limits == Some(agreements::AreaLimits::Above)));
}

// ---------------------------------------------------------------- S2: keepers read from their records, deadlines, rule 76, a member key's text

/// A keeper record (type 2) of `keeper`, naming `act` and `signer`: an
/// everyday act of the keeper's operator, public, in its sequence.
fn keep(w: &mut World, keeper: &mut Person, act: Hash, signer: Hash) -> Hash {
    agreements_act(w, keeper, agreements::types::KEEPER_RECORD, agreements::KeeperRecord { act, signer }.to_map(), None)
}

/// A deal between `a` and `b`, naming `keepers` under `rule`, signed by both.
fn kept_deal(w: &mut World, a: &mut Person, b: &mut Person, keepers: Vec<Hash>, rule: Rule) -> Hash {
    let mut deal = deal_terms(a.id, b.id);
    deal.keepers = Some(Keepers { operators: keepers, rule });
    let x = agreements_act(w, a, agreements::types::TERMS, deal.to_map(), None);
    sign(w, a, &x);
    sign(w, b, &x);
    x
}

/// Agreements 17, rules 37, 41 and 42 and "Keeper record (type 2)": the
/// view reads a keeper's sequence from the records it holds. One record is
/// before another when it lies in the other's ancestry; records of two
/// sequences of one operator are not ordered; a record naming the wrong
/// signer, or an act not held, counts for nothing; a private record is no
/// keeper record.
#[test]
fn a_keepers_sequence_is_read_from_its_records() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut keeper = w.genesis("a keeper", vec![own_home()], None, None);
    let x = w.post(&mut ana, "an act");
    let y = w.post(&mut ana, "a later act");
    let mut second = keeper.clone();
    let rx = keep(&mut w, &mut keeper, x, ana.id);
    let ry = keep(&mut w, &mut keeper, y, ana.id);
    let v = view(&w);
    let s = v.keeper_sequence(&keeper.id);
    assert!(s.before(&rx, &ry) && !s.before(&ry, &rx));
    assert!(v.keeper_before(&keeper.id, &x, &y) && !v.keeper_before(&keeper.id, &y, &x));
    drop(v);
    // A second sequence of the same operator (its first record names no
    // earlier one): never ordered against the first.
    second.seq.clear();
    let z = w.post(&mut ana, "a third act");
    keep(&mut w, &mut second, z, ana.id);
    let v = view(&w);
    assert!(!v.keeper_before(&keeper.id, &x, &z) && !v.keeper_before(&keeper.id, &z, &y), "two sequences are not ordered");
    drop(v);
    // A record naming another signer, or an act not held, counts for nothing.
    let q = w.post(&mut ana, "a fourth act");
    let kid = keeper.id;
    keep(&mut w, &mut keeper, q, kid);
    let unheld = spec("an act nobody holds");
    keep(&mut w, &mut keeper, unheld, ana.id);
    let last = w.post(&mut ana, "a fifth act");
    keep(&mut w, &mut keeper, last, ana.id);
    let v = view(&w);
    assert!(!v.keeper_before(&keeper.id, &q, &last), "the wrong signer");
    assert!(!v.keeper_recorded_act(&keeper.id, &unheld), "an act nobody can produce");
    assert!(v.keeper_before(&keeper.id, &x, &last));
}

/// Agreements 17, "Belongs to", rules 41 and 42, Identity rule 34: an act
/// naming a deal in `objects` belongs to it; its keeper's record of it,
/// before its record of the signer's rotation disowning it, makes it
/// disputed, not void. The same recorded by a keeper the deal does not
/// name stays void. Freeze suite v30, "Belongs to".
#[test]
fn a_deals_keeper_keeps_a_disowned_act_disputed() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut keeper = w.genesis("the deal's keeper", vec![own_home()], None, None);
    let mut stranger = w.genesis("a keeper nobody named", vec![own_home()], None, None);
    let deal = kept_deal(&mut w, &mut ana, &mut ben, vec![keeper.id], Rule::All);
    let live = |w: &mut World, p: &mut Person| agreements_act(w, p, agreements::new_types::LIVENESS, liveness(deal), obj(deal));
    let x = live(&mut w, &mut ana);
    let y = live(&mut w, &mut ana);
    assert_eq!(view(&w).belongs_to(&x), vec![deal]);
    assert_eq!(view(&w).keepers_for(&x).len(), 1);
    keep(&mut w, &mut keeper, x, ana.id);
    keep(&mut w, &mut stranger, y, ana.id);
    let (r, _) = w.rotate(&ana, Rot { disowned: Some(vec![x, y]), ..Default::default() });
    keep(&mut w, &mut keeper, r, ana.id);
    keep(&mut w, &mut stranger, r, ana.id);
    assert_eq!(w.v.status(&x), Status::Void, "before Identity is told");
    let rescued = view(&w).keeper_disputed_acts();
    assert_eq!(rescued, vec![x], "the deal's keeper, not the unnamed one");
    for a in rescued {
        w.v.keeper_recorded(a);
    }
    assert_eq!(w.v.status(&x), Status::Disputed);
    assert_eq!(w.v.status(&y), Status::Void);
}

/// Agreements 17, rule 33: a deadline met by an anchor of the act, or by
/// keepers whose records of it lie before records anchored by the point;
/// missed only by keepers' sequences anchored past it that hold no record
/// of it, enough that the keepers' rule can no longer be met; otherwise
/// undetermined. An anchor of the act wins over any keeper's silence.
/// Freeze suite v30, scenario 1 step 8 and the deadlines component.
#[test]
fn a_deadline_met_missed_or_undetermined_rule_33() {
    use mor_core::envelopes::anchoring::{Anchor, Reference};
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut k: Vec<Person> = ["k1", "k2", "k3"].iter().map(|n| w.genesis(n, vec![own_home()], None, None)).collect();
    let ops: Vec<Hash> = k.iter().map(|p| p.id).collect();
    let keepers = Keepers { operators: ops.clone(), rule: Rule::Threshold(2) };
    let clock = Reference { cmip: spec("a clock"), params: Value::Uint(0) };
    let at = |v: &mut AgreementsView, act: Hash, point: u64| v.anchored.add(&Anchor { act, reference: clock.clone(), point });
    let x = w.post(&mut ana, "the delivery");
    let other = w.post(&mut ana, "something else");
    // k1 and k2 record the delivery; k3 records only something else.
    let r1 = keep(&mut w, &mut k[0], x, ana.id);
    let r2 = keep(&mut w, &mut k[1], x, ana.id);
    let r3 = keep(&mut w, &mut k[2], other, ana.id);
    let mut v = view(&w);
    assert_eq!(v.deadline(&x, Some(&keepers), &clock, 100), agreements::Deadline::Undetermined, "nothing anchored");
    at(&mut v, r1, 90);
    assert_eq!(v.deadline(&x, Some(&keepers), &clock, 100), agreements::Deadline::Undetermined, "one keeper of two needed");
    at(&mut v, r2, 99);
    assert_eq!(v.deadline(&x, Some(&keepers), &clock, 100), agreements::Deadline::Met { by_anchor: false });
    // Missed: two keepers' sequences anchored past the point lack the act.
    let y = w.post(&mut ana, "a late delivery");
    let s1 = keep(&mut w, &mut k[0], other, ana.id);
    let mut v = view(&w);
    at(&mut v, s1, 150);
    at(&mut v, r3, 150);
    assert_eq!(v.deadline(&y, Some(&keepers), &clock, 100), agreements::Deadline::Missed { keepers: vec![ops[0], ops[2]] });
    // One silent keeper is not enough under two of three.
    let mut v = view(&w);
    at(&mut v, r3, 150);
    assert_eq!(v.deadline(&y, Some(&keepers), &clock, 100), agreements::Deadline::Undetermined);
    // An anchor of the act itself wins over every keeper's silence.
    let mut v = view(&w);
    at(&mut v, s1, 150);
    at(&mut v, r3, 150);
    at(&mut v, y, 100);
    assert_eq!(v.deadline(&y, Some(&keepers), &clock, 100), agreements::Deadline::Met { by_anchor: true });
    // A single keeper: its anchored silence shows it missed; its record
    // before the anchored one does not show it late.
    let one = Keepers { operators: vec![ops[2]], rule: Rule::All };
    let mut v = view(&w);
    at(&mut v, r3, 150);
    assert_eq!(v.deadline(&y, Some(&one), &clock, 100), agreements::Deadline::Missed { keepers: vec![ops[2]] });
    assert_eq!(v.deadline(&y, None, &clock, 100), agreements::Deadline::Undetermined, "no keeper, no anchor");
}

/// Agreements 17, rule 76: an act of a grant key the revocation's history
/// does not hold is void, unless another identity, never the grantee,
/// acknowledged it, or a keeper of an agreement it belongs to recorded it
/// before recording the revocation: then it is shown disputed, conferring
/// nothing unless the grantor adopts it. Freeze suite v30, "A revoked
/// grant's acts".
#[test]
fn an_act_a_revocation_misses_is_void_or_disputed_rule_76() {
    let mut w = World::new();
    let mut singer = w.genesis("a singer", vec![own_home()], None, None);
    let mut agent = w.genesis("her agent", vec![own_home()], None, None);
    let mut fan = w.genesis("a fan", vec![own_home()], None, None);
    let mut keeper = w.genesis("a keeper", vec![own_home()], None, None);
    let env = mirs().envelopes;
    let deal = kept_deal(&mut w, &mut singer, &mut fan, vec![keeper.id], Rule::All);
    let grant = Grant { kinds: Some(vec![Kind::Type { spec: env, type_: 0 }]), ..person_grant(agent.id) };
    let g = agreements_act(&mut w, &mut singer, agreements::types::GRANT, grant.to_map(), None);
    sign(&mut w, &mut agent, &g);
    let mut s1 = singer.clone();
    s1.binding = g;
    s1.sign = key_of(agent.id);
    s1.seq = vec![];
    s1.cite = Some((singer.id, vec![g]));
    let mut strands: Vec<Person> = (0..4).map(|_| s1.clone()).collect();
    let mut post = |w: &mut World, i: usize, o: Option<Vec<Object>>| {
        let mut ob = vec![Object { chain: singer.id, predecessor: g }];
        ob.extend(o.into_iter().flatten());
        let a = w.everyday_act(&mut strands[i], env, 0, publication(vec![]), Some(ob), None);
        w.add(&a)
    };
    let cited = post(&mut w, 0, None);
    let by_grantee = post(&mut w, 1, None);
    let by_other = post(&mut w, 2, None);
    let in_deal = post(&mut w, 3, Some(vec![Object { chain: deal, predecessor: deal }]));
    w.ack(&mut agent, by_grantee);
    keep(&mut w, &mut keeper, in_deal, singer.id);
    let sid = singer.id;
    let r = agreements_act(&mut w, &mut singer, agreements::types::REVOCATION, agreements::Revocation { grant: g }.to_map(), Some(vec![Object { chain: sid, predecessor: cited }]));
    keep(&mut w, &mut keeper, r, singer.id);
    w.ack(&mut fan, by_other);
    let v = view(&w);
    assert_eq!(v.backing(&cited).unwrap(), Backing::Binds { grant: g });
    assert!(matches!(v.backing(&by_grantee).unwrap(), Backing::NotBacked { .. }), "the grantee's own acknowledgement rescues nothing");
    assert!(matches!(v.backing(&by_other).unwrap(), Backing::Disputed { ref reason, .. } if reason.contains("acknowledged")));
    assert!(matches!(v.backing(&in_deal).unwrap(), Backing::Disputed { ref reason, .. } if reason.contains("keeper")), "{:?}", v.backing(&in_deal));
    // Disputed confers nothing (a person is no collective: Agreements
    // read the act by its backing).
    assert!(!matches!(v.backing(&by_other).unwrap(), Backing::Backed { .. } | Backing::Binds { .. }));
}

/// Text 11, rule 14, and Agreements 17, rules 58 and 73: a text signed with
/// a holder's member key carries one object, `[collective, version]`, the
/// founding or clone its binding's signature names; it counts where the
/// holder's area reaches texts. Naming the signature act itself is invalid.
#[test]
fn a_member_keys_text_names_its_version_text_rule_14() {
    let mut lab = Lab::new(&|_| {});
    let f = lab.founding;
    let label = lab.col.id;
    let mut a = lab.m[ANA].acting_for(label, vec![label]);
    let text = |lab: &mut Lab, st: &mut Person, pred: Hash| {
        let x = lab.w.everyday_act(st, mirs().text, 0, vec![(Value::Uint(0), Value::Text("A text of the label.".into()))], Some(vec![Object { chain: label, predecessor: pred }]), None);
        lab.w.add(&x)
    };
    let good = text(&mut lab, &mut a, label);
    assert_eq!(lab.w.v.status(&good), Status::Valid);
    assert!(lab.counts(&good), "{:?}", lab.consent(&good));
    let bad = text(&mut lab, &mut a, f);
    assert_eq!(lab.w.v.status(&bad), Status::Invalid, "the founding terms are no decision of the collective");
    assert!(!lab.counts(&bad));
}

/// Money 11, rule 7: every Money act of a collective (a receipt, an
/// obligation, a claim, as a pointer) may be signed with the member key of
/// a holder of the area reaching Money, judged by Agreements under that
/// area; Cy, holding no Money area, signs none that counts.
#[test]
fn a_member_key_signs_every_money_act_of_its_area_money_rule_7() {
    use mor_core::money::{Amount, Obligation, Payload as Fin, Payer, Receipt};
    let mut lab = Lab::new(&|_| {});
    let label = lab.col.id;
    let mut b = lab.m[BEN].acting_for(label, vec![label]);
    let mut c = lab.m[CY].acting_for(label, vec![label]);
    // The label's pointer names the rail, its Money area (Ben) consenting.
    let ptr = lab.pointer(0, 1, None, &[spec("a rail")]);
    lab.sign(BEN, &ptr);
    let amount = Amount { unit: spec("a unit"), value: 10 };
    let receipt = Fin::Receipt(Receipt { rail: spec("a rail"), proof: vec![], payer: Some(Payer::Identity(spec("a fan"))), payee: label, amount: amount.clone(), fulfils: spec("an offer"), previous: None, forward: None, batch: None, purchase: None });
    let obligation = Fin::Obligation(Obligation { debtor: label, creditor: spec("a creditor"), amount, pointer: spec("its pointer"), agreement: None });
    for (what, p, t) in [("a receipt", receipt, 2u64), ("an obligation", obligation, 1u64)] {
        let x = { let a = lab.w.everyday_act(&mut b, mirs().money, t, p.to_map(), None, None); lab.w.add(&a) };
        assert_eq!(lab.w.v.status(&x), Status::Valid, "{what}");
        assert!(lab.counts(&x), "{what}: {:?}", lab.consent(&x));
        let y = { let a = lab.w.everyday_act(&mut c, mirs().money, t, p.to_map(), None, None); lab.w.add(&a) };
        assert!(!lab.counts(&y), "{what} by a member of no Money area");
    }
}

/// Agreements 17, rules 38 and 41 (suite: "Several keepers"): each keeper's
/// record is judged against its own record of the rotation; the agreement's
/// rule, two of three, counts them.
#[test]
fn several_keepers_each_against_its_own_record_of_the_rotation_rule_38() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut k: Vec<Person> = ["k1", "k2", "k3"].iter().map(|n| w.genesis(n, vec![own_home()], None, None)).collect();
    let ops: Vec<Hash> = k.iter().map(|p| p.id).collect();
    let deal = kept_deal(&mut w, &mut ana, &mut ben, ops.clone(), Rule::Threshold(2));
    let live = |w: &mut World, p: &mut Person| agreements_act(w, p, agreements::new_types::LIVENESS, liveness(deal), obj(deal));
    let x = live(&mut w, &mut ana);
    let y = live(&mut w, &mut ana);
    let (r, _) = w.rotate(&ana, Rot { disowned: Some(vec![x, y]), ..Default::default() });
    // x: k1 and k2 recorded it before their own record of the rotation; k3 after.
    keep(&mut w, &mut k[0], x, ana.id);
    keep(&mut w, &mut k[0], r, ana.id);
    keep(&mut w, &mut k[1], x, ana.id);
    keep(&mut w, &mut k[1], r, ana.id);
    keep(&mut w, &mut k[2], r, ana.id);
    keep(&mut w, &mut k[2], x, ana.id);
    // y: only k3 recorded it first.
    keep(&mut w, &mut k[2], y, ana.id);
    let v = view(&w);
    assert!(v.keepers_recorded_before(&x, &r), "two of three, each before its own record of the rotation");
    assert!(!v.keepers_recorded_before(&y, &r), "one of three: the rule is not met");
}

/// Agreements 17, rule 42 (suite: "A keeper keeps one sequence"): a keeper's
/// own later rotation, disowning its record, never undoes what the record
/// placed; the record shows as a dispute.
#[test]
fn a_keepers_later_rotation_never_undoes_what_its_records_placed_rule_42() {
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let mut keeper = w.genesis("the deal's keeper", vec![own_home()], None, None);
    let deal = kept_deal(&mut w, &mut ana, &mut ben, vec![keeper.id], Rule::All);
    let x = agreements_act(&mut w, &mut ana, agreements::new_types::LIVENESS, liveness(deal), obj(deal));
    let (r, _) = w.rotate(&ana, Rot { disowned: Some(vec![x]), ..Default::default() });
    let rx = keep(&mut w, &mut keeper, x, ana.id);
    keep(&mut w, &mut keeper, r, ana.id);
    // The keeper's own rotation disowns its record of x.
    w.rotate(&keeper, Rot { disowned: Some(vec![rx]), ..Default::default() });
    assert_eq!(w.v.status(&rx), Status::Void, "the record itself, under Identity");
    assert_eq!(view(&w).keeper_disputed_acts(), vec![x], "its effect stands");
}

/// Agreements 17, "Belongs to": a receipt belongs to a deal through what it
/// fulfils (an obligation arising from the deal) and through the claim it
/// pays under; an act naming nothing of the deal belongs to none.
#[test]
fn a_receipt_belongs_to_a_deal_through_what_it_fulfils() {
    use mor_core::money::{Amount, Obligation, Payload as Fin, Purchase, Receipt};
    let mut w = World::new();
    let mut ana = w.genesis("ana", vec![own_home()], None, None);
    let mut ben = w.genesis("ben", vec![own_home()], None, None);
    let deal = kept_deal(&mut w, &mut ana, &mut ben, vec![spec("a keeper")], Rule::All);
    let amount = Amount { unit: spec("a unit"), value: 10 };
    let ob = Fin::Obligation(Obligation { debtor: ben.id, creditor: ana.id, amount: amount.clone(), pointer: spec("a pointer"), agreement: Some(deal) });
    let o = { let a = w.everyday_act(&mut ben, mirs().money, 1, ob.to_map(), None, None); w.add(&a) };
    let aid = ana.id;
    let rec = |fulfils: Hash, purchase: Option<Purchase>| Fin::Receipt(Receipt { rail: spec("a rail"), proof: vec![], payer: None, payee: aid, amount: amount.clone(), fulfils, previous: None, forward: None, batch: None, purchase });
    let r1 = { let a = w.everyday_act(&mut ana, mirs().money, 2, rec(o, None).to_map(), None, None); w.add(&a) };
    let r2 = { let a = w.everyday_act(&mut ana, mirs().money, 2, rec(spec("something else"), Some(Purchase { agreement: deal, line: deal })).to_map(), None, None); w.add(&a) };
    let r3 = { let a = w.everyday_act(&mut ana, mirs().money, 2, rec(spec("something else"), None).to_map(), None, None); w.add(&a) };
    let v = view(&w);
    assert_eq!(v.belongs_to(&o), vec![deal], "an obligation, through the agreement it arises from");
    assert_eq!(v.belongs_to(&r1), vec![deal], "a receipt, through the obligation it fulfils");
    assert_eq!(v.belongs_to(&r2), vec![deal], "a receipt, through the claim it pays under");
    assert!(v.belongs_to(&r3).is_empty(), "naming nothing of the deal");
}

// ------------------------------------------------ S7g: Agreements' suspected differences, lines 1 to 1125

/// A payout receipt `by` signs in its own name for `value`, naming `split`.
fn s7g_payout_receipt(w: &mut World, by: &mut Person, split: Hash, value: u64, proof: &[u8]) -> Hash {
    use mor_core::money::{Amount, Payer, Payload as Fin, Receipt};
    let r = Fin::Receipt(Receipt { rail: spec("a rail Module"), proof: proof.to_vec(), payer: Some(Payer::Identity(spec("the service"))), payee: by.id, amount: Amount { unit: spec("a unit"), value }, fulfils: split, previous: None, forward: None, batch: None, purchase: None });
    let a = w.everyday_act(by, mirs().money, 2, r.to_map(), None, None);
    w.add(&a)
}

/// S7g, Agreements rule 14 (`docs/untested-sentences.md`, Agreements row
/// 14): "an over-sale confers nothing". The seller's payout receipts after
/// it are no wrong receipts, and nothing is owed to its buyer; the
/// seller's own receipt discharges the payout. (Before S7g the core read
/// the over-sale as a sale: Ben's receipt discharged nothing, and its
/// payout was owed to the over-sale's buyer.)
#[test]
fn s7g_an_over_sale_turns_no_payout_receipt_into_a_debt() {
    let mut l = ServiceDeal::new();
    let bid = l.ben.id;
    let mut dan = l.w.genesis("dan, who buys more than ben holds", vec![own_home()], None, None);
    // Ben holds 400,000 millionths; he sells 500,000.
    let x = ben_sells(&mut l, &mut dan, 500_000, vec![]);
    let ben = l.ben.clone();
    let (_, ben) = l.w.chain_sign(&ben, x);
    let e = view(&l.w).transfer(&x).unwrap();
    assert!(e.over_sale && !e.effective, "{:?}", e.problems);
    let (r, _) = l.sale(b"a sale after the over-sale", vec![]);
    let split = l.split(r, l.stake_payouts(), vec![]);
    let (_, mut ben) = l.w.rotate(&ben, Rot::default());
    s7g_payout_receipt(&mut l.w, &mut ben, split, 320, b"ben's payout");
    let acct = view(&l.w).service_account(&l.svc.id).unwrap();
    assert!(acct.owed_to_buyers.is_empty(), "an over-sale's buyer is owed nothing: {:?}", acct.owed_to_buyers);
    assert!(!acct.unpaid.iter().any(|u| u.split == split && u.receiver == bid), "Ben's own receipt discharges his payout");
}

/// S7g, Agreements rule 14 ("The transfers name the current holder of
/// each stake, and a split service MUST follow them") and rule 26 ("the
/// stakes as currently held"; row 15). A split following Ben's completed
/// sale to Carla matches; one still paying Ben on field 7 alone does not.
/// (Before S7g the core judged splits on field 7 only, the other way
/// round.)
#[test]
fn s7g_a_split_follows_the_stakes_transfers() {
    let mut l = ServiceDeal::new();
    let (aid, bid) = (l.ana.id, l.ben.id);
    let mut carla = l.w.genesis("carla, who buys half of ben's stake", vec![own_home()], None, None);
    let x = ben_sells(&mut l, &mut carla, 200_000, vec![]);
    let ben = l.ben.clone();
    let (_, ben) = l.w.chain_sign(&ben, x);
    l.ben = ben;
    assert!(view(&l.w).transfer(&x).unwrap().effective);
    let (r1, _) = l.sale(b"sale one", vec![]);
    let follows = vec![
        agreements::Payout { stake: Some(0), ..payout(aid, 480) },
        agreements::Payout { stake: Some(0), ..payout(bid, 160) },
        agreements::Payout { stake: Some(0), ..payout(carla.id, 160) },
    ];
    let s1 = numbered_split(&mut l, r1, follows, 1, vec![(0, x)]);
    let e = view(&l.w).split(&s1).unwrap();
    assert!(e.mismatched.is_empty(), "the split follows the transfer: {:?}", e.mismatched);
    let (r2, _) = l.sale(b"sale two", vec![]);
    let p = l.stake_payouts();
    let s2 = numbered_split(&mut l, r2, p, 2, vec![]);
    let who: Vec<Hash> = view(&l.w).split(&s2).unwrap().mismatched.iter().map(|m| m.holder).collect();
    assert!(who.contains(&bid) && who.contains(&carla.id), "still paying the seller what he sold: {who:?}");
}

/// S7g, Agreements rule 21 ("A split that does not sum exactly is
/// invalid"; row 48) and rule 30: the receipt it names stays without a
/// matching split, an open obligation of the service. (Before S7g the
/// core let a non-summing split match its receipt.)
#[test]
fn s7g_a_split_that_does_not_sum_matches_no_receipt() {
    let mut l = ServiceDeal::new();
    let (aid, bid) = (l.ana.id, l.ben.id);
    let unsplit = |l: &ServiceDeal, r: Hash| view(&l.w).service_account(&l.svc.id).unwrap().unsplit.iter().any(|u| u.payment == r);
    let (r1, _) = l.sale(b"sale one", vec![]);
    assert!(unsplit(&l, r1), "a receipt with no split");
    let p = l.stake_payouts();
    let short = numbered_split(&mut l, r1, p, 1, vec![]);
    assert_eq!(view(&l.w).split(&short).unwrap().sums, Some(false), "800 of 1,000");
    assert!(unsplit(&l, r1), "an invalid split matches no receipt");
    let (r2, _) = l.sale(b"sale two", vec![]);
    let whole = vec![agreements::Payout { stake: Some(0), ..payout(aid, 600) }, agreements::Payout { stake: Some(0), ..payout(bid, 400) }];
    numbered_split(&mut l, r2, whole, 2, vec![]);
    assert!(!unsplit(&l, r2), "a split summing exactly matches it");
}
