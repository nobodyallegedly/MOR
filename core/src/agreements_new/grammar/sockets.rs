//! The sockets K1 to K8 (draft 24, section 5): one interface for every cMIP.
//!
//! In plain words: a socket is a field of an act where a cMIP plugs in and
//! answers one question. The verifier never computes those answers itself
//! (section 5: "they never compute it"): it asks the cMIP named in the
//! socket, through the one interface [`Cmip`], and uses the output where the
//! grammar rule needs it. Where the cMIP named is not among those the
//! verifier holds, every answer that rests on it is **unchecked** (G9).
//! Where the socket is empty, the default the grammar rules give applies
//! (K2, K4, K6, K8), and otherwise nothing is asked.

use super::held::Held;
use crate::agreements_new::{PowerKind, Who};
use crate::cbor::Value;
use crate::hash::Hash;
use std::collections::HashMap;

/// The eight tasks, by number (section 5's table).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Task {
    K1,
    K2,
    K3,
    K4,
    K5,
    K6,
    K7,
    K8,
}

impl Task {
    pub fn word(self) -> &'static str {
        ["K1", "K2", "K3", "K4", "K5", "K6", "K7", "K8"][self as usize]
    }
}

/// An assent counted in a party's name (G4.1): the assent, and the name.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Counted {
    pub assent: Hash,
    pub name: Who,
}

/// The one question a socket asks, with what that task accepts (section 5,
/// "Accepts"). Every cMIP is also given its own parameters and the acts held
/// ([`Held`], with the answers of the place and the clock through the
/// verifier's layers).
#[derive(Clone, Debug)]
pub enum Ask<'a> {
    /// K1: what do these words say? Accepts the `body` bytes (here, the
    /// Terms act that carries them).
    Body { terms: Hash },
    /// K2: are the assents that put these Terms in force present? Accepts
    /// the Terms, and the assents counted, each in a name (G4.1, G4.10).
    InForce { terms: Hash, counted: &'a [Counted] },
    /// K3: does this act, of this power's kind, bind the parties: was it
    /// made by those who may? Accepts the Terms that give the power, and the
    /// act asked about.
    Power { terms: Hash, kind: PowerKind, act: Hash, signer: Hash },
    /// K4: can the agreement be updated like this? Accepts the original and
    /// the proposed update, with the assents to it that are held, counted in
    /// their names, and everyone who signed the original (G4.8(a)), which
    /// the cMIP may use or not.
    Update { original: Hash, proposed: Hash, counted: &'a [Counted], signed_original: &'a [Who] },
    /// K4, asked about a filling (G10.6(b)): given the version it was earned
    /// under and the later one.
    FillingRights { earned_under: Hash, later: Hash, holder: Hash },
    /// K5: who fills this spot, by which proof, and does it still take new
    /// identities? Accepts the role as the version in force states it: the
    /// Terms and the role's position in `parties`.
    Spot { terms: Hash, party: u64 },
    /// K6: has what these Terms receive been passed on as they say?
    Control { terms: Hash },
    /// K7: what does a Statement of this kind state?
    Kind { statement: Hash },
    /// K8: may this reader read this report (or, about silence, know of
    /// this call) beyond its own leg?
    Data { terms: Hash, reader: Who, report: Option<Hash>, call: Option<Hash> },
}

impl Ask<'_> {
    pub fn task(&self) -> Task {
        match self {
            Ask::Body { .. } => Task::K1,
            Ask::InForce { .. } => Task::K2,
            Ask::Power { .. } => Task::K3,
            Ask::Update { .. } | Ask::FillingRights { .. } => Task::K4,
            Ask::Spot { .. } => Task::K5,
            Ask::Control { .. } => Task::K6,
            Ask::Kind { .. } => Task::K7,
            Ask::Data { .. } => Task::K8,
        }
    }
}

/// What a cMIP produces (section 5, "Produces").
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Out {
    /// K1: the parts for machines these grammar rules read.
    Body(BodyReading),
    /// K2, K3, K6, K8: yes or no, with its ground.
    YesNo { yes: bool, ground: String },
    /// K4: valid or not valid, with its ground (an act, or a time).
    Update { valid: bool, ground: String },
    /// K5: the fillings, and whether the spot still takes new identities.
    Spot(SpotReading),
    /// K7: the meaning of `content`.
    Kind { meaning: String },
    /// The cMIP itself cannot answer from what it was given (it lacks an act
    /// it reads, a place's answer): the verifier answers **unchecked** (G9).
    CannotAnswer(String),
}

/// K1's parts for machines that these grammar rules read (section 5, K1's
/// row): the part each party is given (G11.2), and, for a delegation, that
/// it is one, who delegates to whom, and what conditions it puts on ending
/// (G5.5). Positions are positions in the Terms' `parties`.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct BodyReading {
    /// The parties given a part (a share), by position.
    pub parts: Vec<u64>,
    pub delegation: Option<Delegation>,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Delegation {
    pub delegator: u64,
    pub agent: u64,
    pub ending: Ending,
}

/// What the words of a delegation say of ending it (G5.5).
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Ending {
    /// No condition stated: the delegator ends it at any time, alone.
    ByDelegator,
    /// A condition that leaves ending to the agent alone.
    ByAgentAlone,
    /// A condition stated (a notice, a term, a cause) that this verifier
    /// cannot apply in the form the body's cMIP gives it.
    Stated(String),
}

/// K5's output.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct SpotReading {
    pub fillings: Vec<Filling>,
    /// Whether the spot holds one filling or many (G10.2).
    pub many: bool,
    /// Whether it still takes new identities, and why (G10.5).
    pub takes_new: bool,
    pub why: String,
}

/// One filling: the signer, the proof that earned it, the version it was
/// earned under (the version its proof names, G10.6), and who confirmed it
/// (G8.4).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Filling {
    pub signer: Hash,
    pub proof: Vec<Hash>,
    pub version: Hash,
    pub confirmed_by: Option<Who>,
}

/// The one interface every cMIP is plugged in through.
pub trait Cmip {
    /// A name for people (a stub says it is one).
    fn name(&self) -> &str;
    /// Answer the socket's one question, given its parameters and the acts
    /// held.
    fn ask(&self, params: &Value, ask: &Ask, held: &Held) -> Out;
}

/// The cMIPs a verifier holds, by fingerprint.
#[derive(Default)]
pub struct Cmips {
    map: HashMap<Hash, Box<dyn Cmip>>,
}

impl Cmips {
    pub fn new() -> Cmips {
        Cmips::default()
    }

    /// Hold a cMIP under its fingerprint.
    pub fn hold(&mut self, fingerprint: Hash, c: Box<dyn Cmip>) {
        self.map.insert(fingerprint, c);
    }

    pub fn get(&self, fingerprint: &Hash) -> Option<&dyn Cmip> {
        self.map.get(fingerprint).map(|b| b.as_ref())
    }

    pub fn holds(&self, fingerprint: &Hash) -> bool {
        self.map.contains_key(fingerprint)
    }
}
