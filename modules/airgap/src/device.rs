//! The offline signing device (Module, sections 2 to 5).
//!
//! A device holds safety seeds, and a memory of every rotation it signed. It
//! reads a pending rotation, checks it, builds the complete rotation act
//! itself and shows a summary of the exact bytes it will sign ([`Signer::review`]);
//! only then does it sign ([`Signer::sign`]). A collective's rotation is the
//! same, with the current key rebuilt from shares and the next key dealt as
//! shares ([`Signer::review_collective`]).
//!
//! The device draws its own randomness (salt, content key, nonce, the next
//! seed, a clean-device signing key, SLH-DSA's hedging): the caller passes
//! the source, so that tests are reproducible.

use crate::msg::{
    self, kind, CommitmentExport, Holder, Message, MsgError, PendingRotation, Share, SignedRotation,
};
use crate::seed::{hexs, Seed, SeedModule};
use crate::shares::{self, ShareError};
use crate::summary::{self, Before, Summary};
use mor_core::act::{self, Act, Addressing, Inside, Scheme};
use mor_core::cbor::{self, Value};
use mor_core::hash::{tagged_hash_parts, Hash};
use mor_core::identity::{self, ChainState, Genesis, Payload, SafetyCommit, SigningKey};
use mor_core::sig::{self, SchnorrKey, SlhKey, Verdict};
use mor_core::text;
use rand_core::{CryptoRng, RngCore};
use std::fmt;

/// What rule 3.7 says to the user, at genesis and at every fresh seed.
pub const BACKUP_NOTICE: &str = "Back up this safety seed now, on paper, kept apart from every device. \
Back up the signing seed on your everyday device too: escaping a hostile or device-bound home needs \
your current signing key, and a lost phone with no backup can mean a lost identity at such a home.";

/// The specifications the device needs to know by hash.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Config {
    /// The Identity MIP's spec hash, fixed at the freeze.
    pub identity_spec: Hash,
    /// The Money MIP's spec hash, to read the vault; `None` shows the
    /// vault as a declaration this device cannot read.
    pub money_spec: Option<Hash>,
}

/// A seed the device holds, for keys from `from_index` on.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct StoredSeed {
    pub seed: Seed,
    /// The scheme used for the commitments this seed makes (2 or 3).
    pub scheme: u8,
    pub from_index: u64,
}

/// One rotation the device signed.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Record {
    /// The request, without what the device supplies (see [`request_hash`]).
    pub request: Hash,
    pub act: Vec<u8>,
    pub act_id: Hash,
    pub homeless: bool,
}

/// Rule 3.4: what the device signed with one safety key.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct KeyMemory {
    /// The key, by its commitment.
    pub commitment: Hash,
    pub signed: Vec<Record>,
    /// The first exception of rule 8a has been used.
    pub after_void_used: bool,
    /// The second exception of rule 8a has been used.
    pub escape_used: bool,
}

/// Why the device refuses.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Refusal {
    /// Not the message expected (rule 3.6).
    Message(MsgError),
    /// The previous act is not a valid identity-chain act (rule 3.2).
    Previous(String),
    /// The previous act commits to a key this device does not hold (rule 3.2).
    NoMatchingKey,
    /// Not a rotation (rule 3.5).
    NotARotation(&'static str),
    /// The rotation is not in its shape, or does not follow the previous act.
    Rotation(String),
    /// A different rotation with a key already used (rule 3.4).
    AlreadySigned { act: Hash },
    /// An exception of rule 8a that the user has not confirmed.
    NeedsConfirmation(Exception),
    /// Shares refused (section 5).
    Shares(ShareError),
    /// Something the device does not implement.
    Unsupported(&'static str),
}

impl fmt::Display for Refusal {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Refusal::Message(e) => write!(f, "{e}"),
            Refusal::Previous(e) => write!(f, "the previous act does not check: {e}"),
            Refusal::NoMatchingKey => f.write_str(
                "this device holds no safety key matching the commitment in the previous act",
            ),
            Refusal::NotARotation(w) => write!(f, "the safety key signs only rotations: {w}"),
            Refusal::Rotation(e) => write!(f, "the rotation does not check: {e}"),
            Refusal::AlreadySigned { act } => write!(
                f,
                "this safety key already signed a different rotation ({}); it signs no other",
                hexs(act)
            ),
            Refusal::NeedsConfirmation(e) => write!(f, "needs your explicit confirmation: {e}"),
            Refusal::Shares(e) => write!(f, "{e}"),
            Refusal::Unsupported(w) => write!(f, "not supported by this device: {w}"),
        }
    }
}

impl std::error::Error for Refusal {}

impl From<MsgError> for Refusal {
    fn from(e: MsgError) -> Self {
        Refusal::Message(e)
    }
}

impl From<ShareError> for Refusal {
    fn from(e: ShareError) -> Self {
        Refusal::Shares(e)
    }
}

/// The two exceptions of Identity rule 8a, each allowed once per key.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Exception {
    /// One normal rotation after a homeless rotation voided by an objection.
    AfterVoidedHomeless { voided: Hash },
    /// One endorsed homeless rotation (an escape) after a normal rotation the
    /// homes refused; the endorsement must list it as abandoned.
    Escape { abandoned: Hash },
}

impl fmt::Display for Exception {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Exception::AfterVoidedHomeless { voided } => write!(
                f,
                "this key already signed a homeless rotation ({}). Sign a normal rotation with it only if that homeless rotation was voided by an objection. Allowed once.",
                hexs(voided)
            ),
            Exception::Escape { abandoned } => write!(
                f,
                "this key already signed a normal rotation ({}). Sign this escape only if the homes refused that rotation; the escape endorsement MUST list it as abandoned. Allowed once.",
                hexs(abandoned)
            ),
        }
    }
}

/// Whether the device has signed this request before.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Standing {
    New,
    /// The same rotation: the device re-exports the same bytes.
    Repeat,
    /// A different rotation, allowed only as an exception, once.
    Exception(Exception),
}

/// What the user chooses on the device.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct Choices {
    /// Derive the next key from a fresh seed of this Module and scheme,
    /// because the current seed may be exposed (rule 3.3).
    pub fresh_seed: Option<(SeedModule, u8)>,
    /// The scheme of the next safety key, if not the seed's own. A scheme
    /// named by specification hash is not implemented by this device.
    pub next_scheme: Option<u8>,
    /// Clean-device mode (section 4): the device generates the new signing key.
    pub clean_device: bool,
}

/// How a collective deals its next key (section 5).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct DealPlan {
    pub seed_module: SeedModule,
    pub scheme: u8,
    pub threshold: u64,
    pub holders: Vec<Holder>,
}

enum Current {
    Seed { key: SlhKey },
    Shares { key: SlhKey },
}

enum Next {
    Held {
        seed: Option<StoredSeed>,
    },
    Dealt {
        shares: Vec<Share>,
    },
    /// A repeat: nothing new.
    None,
}

/// A rotation checked, built and summarised, waiting for the user.
pub struct Review {
    pub summary: Summary,
    pub standing: Standing,
    /// A fresh seed the user must back up before the rotation is used.
    pub new_seed: Option<Seed>,
    /// The next key's shares, one per holder, for a collective.
    pub new_shares: Vec<Share>,
    identity: Hash,
    request: Hash,
    homeless: bool,
    commitment: Hash,
    inside: Option<Inside>,
    current: Option<Current>,
    next: Next,
    signing_secret: Option<[u8; 32]>,
    repeat: Option<Vec<u8>>,
}

/// The device's output: the message for the online device.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Signed {
    pub message: SignedRotation,
    pub act_id: Hash,
}

/// The offline signing device.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Signer {
    pub config: Config,
    pub seeds: Vec<StoredSeed>,
    pub memory: Vec<KeyMemory>,
}

fn random<const N: usize>(rng: &mut (impl RngCore + CryptoRng)) -> [u8; N] {
    let mut b = [0u8; N];
    rng.fill_bytes(&mut b);
    b
}

/// The request's identity for rule 3.4: `tagged_hash("MOR/module/airgap/request",
/// inside ‖ previous act id)`, over the inside as the online device sent it,
/// with the salt and the next commitment left out if it sent them.
pub fn request_hash(stripped_inside: &[u8], prev_id: &Hash) -> Hash {
    tagged_hash_parts(crate::tag::REQUEST, &[stripped_inside, prev_id])
}

/// The previous identity-chain act, checked as far as the device can (rule 3.2).
struct Previous {
    id: Hash,
    identity: Hash,
    position: u64,
    commit: SafetyCommit,
    genesis: Option<Genesis>,
    vault: Option<Option<Value>>,
}

fn check_previous(bytes: &[u8], cfg: &Config) -> Result<Previous, Refusal> {
    let p = |e: String| Refusal::Previous(e);
    let a = Act::decode(bytes).map_err(|e| p(format!("{e:?}")))?;
    if !a.outside.is_public() {
        return Err(p("an identity-chain act is always public".into()));
    }
    let inside = a.open(None).map_err(|e| p(format!("{e:?}")))?;
    if inside.spec != cfg.identity_spec {
        return Err(p("not an act of the Identity MIP".into()));
    }
    match sig::verify(&a.signature, &a.id()) {
        Verdict::Valid => {}
        Verdict::Invalid => return Err(p("its signature is not valid".into())),
        Verdict::Unknown => {
            return Err(p(
                "signed under a scheme this device does not implement".into()
            ))
        }
    }
    let payload = Payload::decode(inside.type_, &inside.payload).map_err(|e| p(e.to_string()))?;
    let id = a.id();
    let vault_of = |ds: &Option<Vec<identity::Declaration>>| -> Option<Option<Value>> {
        let f = cfg.money_spec?;
        ds.iter()
            .flatten()
            .find(|d| d.spec == f && d.kind == 0)
            .map(|d| d.value.clone())
    };
    match payload {
        Payload::Genesis(g) => {
            identity::check_genesis(&a, &inside, &g).map_err(|e| p(e.to_string()))?;
            Ok(Previous {
                id,
                identity: id,
                position: 0,
                commit: g.safety,
                vault: vault_of(&g.declarations),
                genesis: Some(g),
            })
        }
        Payload::Rotation(r) => {
            identity::check_rotation_shape(&a, &inside, &r).map_err(|e| p(e.to_string()))?;
            if !sig::is_slh(&a.signature.scheme) {
                return Err(p("a rotation is signed with a safety key".into()));
            }
            Ok(Previous {
                id,
                identity: a.outside.signer.expect("checked"),
                position: r.position,
                commit: r.safety,
                vault: vault_of(&r.declarations),
                genesis: None,
            })
        }
        _ => Err(p("neither a genesis nor a rotation".into())),
    }
}

/// The pending inside, parsed: spec, type 1 and a payload; nothing else
/// (reading: the device never signs a field it cannot show). A salt, or a
/// next safety commitment, from the online device is dropped.
struct Parsed {
    payload: Vec<(Value, Value)>,
    stripped: Vec<u8>,
    commitment_supplied: bool,
}

fn parse_inside(bytes: &[u8], cfg: &Config) -> Result<Parsed, Refusal> {
    let bad = |e: String| Refusal::Rotation(e);
    let v = cbor::decode(bytes).map_err(|e| bad(e.to_string()))?;
    text::check_value(&v).map_err(|e| bad(format!("{e:?}")))?;
    let Value::Map(m) = v else {
        return Err(bad("the inside is not a map".into()));
    };
    let mut spec = None;
    let mut type_ = None;
    let mut payload = None;
    for (k, x) in &m {
        match (k, x) {
            (Value::Uint(0), Value::Bytes(b)) if b.len() == 32 => spec = Some(b.clone()),
            (Value::Uint(1), Value::Uint(t)) => type_ = Some(*t),
            (Value::Uint(4), Value::Map(p)) => payload = Some(p.clone()),
            (Value::Uint(10), _) => {}
            (Value::Uint(2), _) => return Err(bad("a rotation carries no prev".into())),
            (Value::Uint(_), _) => return Err(bad(
                "a field besides spec, type and payload, which this device will not sign unseen"
                    .into(),
            )),
            _ => return Err(bad("the inside is not in the Envelopes' shape".into())),
        }
    }
    if spec.as_deref() != Some(&cfg.identity_spec[..]) {
        return Err(Refusal::NotARotation("not an act of the Identity MIP"));
    }
    if type_ != Some(identity::types::ROTATION) {
        return Err(Refusal::NotARotation("not of type 1"));
    }
    let mut payload = payload.ok_or_else(|| bad("no payload".into()))?;
    let before = payload.len();
    payload.retain(|(k, _)| k != &Value::Uint(3));
    let commitment_supplied = payload.len() != before;
    let stripped = cbor::encode(&Value::Map(vec![
        (Value::Uint(0), Value::Bytes(cfg.identity_spec.to_vec())),
        (Value::Uint(1), Value::Uint(identity::types::ROTATION)),
        (Value::Uint(4), Value::Map(payload.clone())),
    ]));
    Ok(Parsed {
        payload,
        stripped,
        commitment_supplied,
    })
}

impl Signer {
    pub fn new(config: Config) -> Self {
        Signer {
            config,
            seeds: vec![],
            memory: vec![],
        }
    }

    /// A new seed, for a new identity or a fresh start. The caller shows its
    /// backup and [`BACKUP_NOTICE`] (rule 3.7).
    pub fn new_seed(
        &mut self,
        module: SeedModule,
        scheme: u8,
        rng: &mut (impl RngCore + CryptoRng),
    ) -> Seed {
        let seed = Seed::new(module, random(rng));
        self.add_seed(seed.clone(), scheme, 0);
        seed
    }

    /// Hold a seed restored from its backup.
    pub fn add_seed(&mut self, seed: Seed, scheme: u8, from_index: u64) {
        assert!(scheme == 2 || scheme == 3, "safety schemes are 2 and 3");
        self.seeds.push(StoredSeed {
            seed,
            scheme,
            from_index,
        });
    }

    /// 2.1: the commitment to a seed's key at `index` (0 at genesis).
    pub fn export_commitment(&self, seed: usize, index: u64) -> Message {
        let s = &self.seeds[seed];
        let k = s.seed.key(s.scheme, index);
        Message::CommitmentExport(CommitmentExport {
            safety: SafetyCommit {
                scheme: k.scheme(),
                commit: k.commitment(),
            },
            index,
        })
    }

    /// Rule 3.2: the key at `index` whose commitment is `commit`, if a seed
    /// of this device gives it.
    fn find_key(&self, commit: &SafetyCommit, index: u64) -> Option<(usize, SlhKey)> {
        let scheme = match commit.scheme {
            Scheme::Founding(n @ (2 | 3)) => n,
            _ => return None,
        };
        self.seeds.iter().enumerate().find_map(|(i, s)| {
            if s.from_index > index {
                return None;
            }
            let k = s.seed.key(scheme, index);
            (k.commitment() == commit.commit).then_some((i, k))
        })
    }

    fn memory_of(&self, commitment: &Hash) -> Option<&KeyMemory> {
        self.memory.iter().find(|m| &m.commitment == commitment)
    }

    /// Rule 3.4: has this key signed this request, or another?
    fn standing(
        &self,
        commitment: &Hash,
        request: &Hash,
        homeless: bool,
        escape: bool,
    ) -> Result<(Standing, Option<Vec<u8>>), Refusal> {
        let Some(m) = self.memory_of(commitment) else {
            return Ok((Standing::New, None));
        };
        if let Some(r) = m.signed.iter().find(|r| &r.request == request) {
            return Ok((Standing::Repeat, Some(r.act.clone())));
        }
        let last = m
            .signed
            .last()
            .expect("a memory holds at least one rotation");
        if last.homeless && !homeless && !m.after_void_used {
            return Ok((
                Standing::Exception(Exception::AfterVoidedHomeless {
                    voided: last.act_id,
                }),
                None,
            ));
        }
        if !last.homeless && homeless && escape && !m.escape_used {
            return Ok((
                Standing::Exception(Exception::Escape {
                    abandoned: last.act_id,
                }),
                None,
            ));
        }
        Err(Refusal::AlreadySigned { act: last.act_id })
    }

    /// Read a pending rotation, check it, build the rotation act, and
    /// summarise the exact bytes that will be signed.
    pub fn review(
        &self,
        bytes: &[u8],
        choices: &Choices,
        rng: &mut (impl RngCore + CryptoRng),
    ) -> Result<Review, Refusal> {
        let Message::PendingRotation(pending) =
            Message::decode_kind(bytes, kind::PENDING_ROTATION)?
        else {
            unreachable!()
        };
        let prev = check_previous(&pending.prev, &self.config)?;
        let (seed_i, key) = self
            .find_key(&prev.commit, pending.index)
            .ok_or(Refusal::NoMatchingKey)?;
        let next = if let Some((module, scheme)) = choices.fresh_seed {
            if scheme != 2 && scheme != 3 {
                return Err(Refusal::Unsupported("safety schemes other than 2 and 3"));
            }
            let seed = Seed::new(module, random(rng));
            let s = StoredSeed {
                seed,
                scheme,
                from_index: pending.index + 1,
            };
            let k = s.seed.key(scheme, pending.index + 1);
            (Next::Held { seed: Some(s) }, k)
        } else {
            let s = &self.seeds[seed_i];
            let scheme = choices.next_scheme.unwrap_or(s.scheme);
            if scheme != 2 && scheme != 3 {
                return Err(Refusal::Unsupported("safety schemes other than 2 and 3"));
            }
            (
                Next::Held { seed: None },
                s.seed.key(scheme, pending.index + 1),
            )
        };
        self.build(
            pending,
            prev,
            Current::Seed { key },
            next,
            choices.clean_device,
            rng,
        )
    }

    /// A collective's rotation (section 5): the current key rebuilt from
    /// shares, the next key dealt to the plan's holders.
    pub fn review_collective(
        &self,
        bytes: &[u8],
        shares: &[Share],
        plan: &DealPlan,
        rng: &mut (impl RngCore + CryptoRng),
    ) -> Result<Review, Refusal> {
        let Message::PendingRotation(pending) =
            Message::decode_kind(bytes, kind::PENDING_ROTATION)?
        else {
            unreachable!()
        };
        let prev = check_previous(&pending.prev, &self.config)?;
        let (key, dealing) = shares::rebuild_key(shares)?;
        if dealing.safety != prev.commit || dealing.index != pending.index {
            return Err(Refusal::NoMatchingKey);
        }
        let seed = shares::fresh_dealable_seed(plan.seed_module, rng);
        let new = shares::deal(
            &seed,
            plan.scheme,
            pending.index + 1,
            plan.threshold,
            plan.holders.clone(),
            rng,
        );
        let next_key = seed.key(plan.scheme, pending.index + 1);
        drop(seed);
        let mut review = self.build(
            pending,
            prev,
            Current::Shares { key },
            (Next::Dealt { shares: new }, next_key),
            false,
            rng,
        )?;
        // 5.2: which shares were used, and through which path.
        let used = &shares[..dealing.threshold as usize];
        for s in used {
            let h = &dealing.holders[s.x as usize - 1];
            let who = h
                .identity
                .map(|i| hexs(&i))
                .unwrap_or_else(|| "unnamed".into());
            match h.role {
                msg::Role::Member => review.summary.plain(format!("Share {} used: member {}", s.x, who)),
                msg::Role::Custodian => review.summary.warn(format!(
                    "Share {} used through the RECOVERY PATH: the custodian {} holding it under the collective's grant",
                    s.x, who
                )),
                msg::Role::Escrow => review.summary.warn(format!(
                    "Share {} used through the RECOVERY PATH: an escrowed share, released by the abandonment authority ({})",
                    s.x, who
                )),
            }
        }
        if let Some(first) = review.new_shares.first() {
            let d = &first.dealing;
            review.summary.warn(format!(
                "The next key is dealt as {} shares, any {} of which rebuild it. Every holder must check their share, and compare this dealing fingerprint with every other holder: {}",
                d.holders.len(),
                d.threshold,
                hexs(&d.fingerprint())
            ));
            review.summary.warn("Before this rotation is published, a second offline device should rebuild the next key from shares held by other members and confirm it matches (rebuild check). This device, and that one, could each keep a copy of the key they held: that cannot be checked.");
        }
        Ok(review)
    }

    fn build(
        &self,
        pending: PendingRotation,
        prev: Previous,
        current: Current,
        next: (Next, SlhKey),
        clean_device: bool,
        rng: &mut (impl RngCore + CryptoRng),
    ) -> Result<Review, Refusal> {
        let (next, next_key) = next;
        let parsed = parse_inside(&pending.inside, &self.config)?;
        let request = request_hash(&parsed.stripped, &prev.id);
        let commitment = prev.commit.commit;
        let bad = |e: String| Refusal::Rotation(e);

        // The payload as the online device sent it, with a placeholder
        // commitment, to read its fields.
        let mut probe = parsed.payload.clone();
        probe.push((
            Value::Uint(3),
            SafetyCommit {
                scheme: sig::SLH_128S,
                commit: [0; 32],
            }
            .to_value(),
        ));
        let Payload::Rotation(asked) =
            Payload::decode(identity::types::ROTATION, &probe).map_err(|e| bad(e.to_string()))?
        else {
            unreachable!()
        };
        if asked.prev != prev.id {
            return Err(bad("it does not name the previous act given".into()));
        }
        if asked.position != prev.position + 1 {
            return Err(bad(format!(
                "position {} does not follow {}",
                asked.position, prev.position
            )));
        }
        if pending.index != prev.position {
            return Err(bad(format!(
                "key index {} is not the number of the key the previous act commits to ({})",
                pending.index, prev.position
            )));
        }
        if asked.homeless && asked.homes.is_none() {
            return Err(bad("a homeless rotation must declare new homes".into()));
        }
        let escape = pending.escape == Some(true);
        if escape && !asked.homeless {
            return Err(bad(
                "an escape endorsement is announced for a rotation that is not homeless".into(),
            ));
        }

        let (standing, repeat) = self.standing(&commitment, &request, asked.homeless, escape)?;

        let mut summary = Summary::default();
        if parsed.commitment_supplied {
            summary.warn("The online device supplied a next safety commitment. It was IGNORED and replaced by this device's own: a well-behaved client never sends one. Check the online device.");
        }
        if let Standing::Exception(e) = &standing {
            summary.warn(format!("EXCEPTION to single use: {e}"));
        }
        if let Some(bytes) = &repeat {
            // The same request: re-export the same bytes, summarised from them.
            let a = Act::decode(bytes).expect("stored by this device");
            let inside = a.open(None).expect("stored by this device");
            let Ok(Payload::Rotation(r)) = Payload::decode(1, &inside.payload) else {
                unreachable!()
            };
            summary.plain("ALREADY SIGNED: this device re-exports the same signed rotation.");
            summary::describe(
                &mut summary,
                &prev.identity,
                &r,
                &Before {
                    vault: prev.vault.as_ref().map(|v| v.as_ref()),
                },
                self.config.money_spec.as_ref(),
                escape,
            );
            self.finish_summary(&mut summary, &pending, &prev);
            return Ok(Review {
                summary,
                standing,
                new_seed: None,
                new_shares: vec![],
                identity: prev.identity,
                request,
                homeless: r.homeless,
                commitment,
                inside: None,
                current: None,
                next: Next::None,
                signing_secret: None,
                repeat,
            });
        }

        // Rule 3.3: the device's own next commitment; section 4: clean-device mode.
        let mut payload = parsed.payload;
        payload.push((
            Value::Uint(3),
            SafetyCommit {
                scheme: next_key.scheme(),
                commit: next_key.commitment(),
            }
            .to_value(),
        ));
        let mut signing_secret = None;
        if clean_device {
            let k = loop {
                let s: [u8; 32] = random(rng);
                if let Some(k) = SchnorrKey::from_secret(&s) {
                    break (s, k);
                }
            };
            payload.retain(|(x, _)| x != &Value::Uint(2));
            payload.push((
                Value::Uint(2),
                SigningKey {
                    scheme: sig::SCHNORR,
                    key: k.1.public().to_vec(),
                }
                .to_value(),
            ));
            signing_secret = Some(k.0);
        }
        payload.sort_by_key(|(k, _)| cbor::encode(k));
        let inside = Inside {
            spec: self.config.identity_spec,
            type_: identity::types::ROTATION,
            prev: None,
            objects: None,
            payload,
            position: None,
            summary: None,
            acks: None,
            refs: None,
            hint: None,
            salt: random(rng),
        };
        // Summarise from the exact bytes that will be signed.
        let exact = Inside::decode(&inside.encode()).map_err(|e| bad(format!("{e:?}")))?;
        let Payload::Rotation(r) =
            Payload::decode(1, &exact.payload).map_err(|e| bad(e.to_string()))?
        else {
            unreachable!()
        };
        if let Some(Some(a)) = &r.audit {
            if !identity::audit_valid(a) {
                return Err(bad("the audit requirement cannot be met".into()));
            }
        }
        if let (Some(Some(rule)), Some(homes)) = (&r.rule, &r.homes) {
            if !identity::rule_valid(rule, homes, Some(&prev.identity)) {
                return Err(bad("the home rule does not fit the new homes".into()));
            }
        }
        if let Some(g) = &prev.genesis {
            // The whole state is known after a genesis: rotation check 5 (F94).
            ChainState::genesis(prev.identity, g)
                .apply(&r)
                .map_err(|e| bad(e.to_string()))?;
        }

        summary::describe(
            &mut summary,
            &prev.identity,
            &r,
            &Before {
                vault: prev.vault.as_ref().map(|v| v.as_ref()),
            },
            self.config.money_spec.as_ref(),
            escape,
        );
        if clean_device {
            summary.warn("CLEAN-DEVICE MODE: this device generated the new signing key. Load it only onto a clean everyday device, and back it up there. This device does not keep it.");
        }
        let new_seed = match &next {
            Next::Held { seed: Some(s) } => {
                summary.warn(format!(
                    "FRESH SEED ({} Module): the next safety key comes from a new seed. {BACKUP_NOTICE}",
                    s.seed.module.name()
                ));
                Some(s.seed.clone())
            }
            _ => None,
        };
        summary.plain(format!(
            "Next safety key: {}, committed by this device, never by the online device",
            summary::scheme_name(&next_key.scheme())
        ));
        self.finish_summary(&mut summary, &pending, &prev);
        if prev.genesis.is_none() && r.homes.is_some() && r.rule.is_none() {
            summary
                .not_checked
                .push("whether the home rule in effect still fits the new homes (the device holds only the previous act, not the whole chain)".into());
        }
        let new_shares = match &next {
            Next::Dealt { shares } => shares.clone(),
            _ => vec![],
        };
        Ok(Review {
            summary,
            standing,
            new_seed,
            new_shares,
            identity: prev.identity,
            request,
            homeless: r.homeless,
            commitment,
            inside: Some(exact),
            current: Some(current),
            next,
            signing_secret,
            repeat: None,
        })
    }

    fn finish_summary(&self, s: &mut Summary, pending: &PendingRotation, prev: &Previous) {
        s.not_checked.push(format!(
            "whether the previous act ({}) counts under the home rule: receipts live at the homes, so the online device checks that",
            hexs(&prev.id)
        ));
        s.not_checked
            .push("whether the homes will accept this rotation".into());
        if pending.escape == Some(true) {
            s.not_checked.push("the escape endorsement itself: it is signed on the online device with the current signing key".into());
        }
        s.not_checked.push("that the new signing key really is yours: compare its fingerprint on a second, trusted screen".into());
        for c in pending.context.iter().flatten() {
            s.context.push(match std::str::from_utf8(c) {
                Ok(t) => t.to_string(),
                Err(_) => format!("h'{}'", hexs(c)),
            });
        }
    }

    /// Sign what was reviewed. An exception of rule 8a needs `confirmed`.
    pub fn sign(
        &mut self,
        review: Review,
        confirmed: bool,
        rng: &mut (impl RngCore + CryptoRng),
    ) -> Result<Signed, Refusal> {
        if let Some(bytes) = review.repeat {
            let a = Act::decode(&bytes).expect("stored by this device");
            return Ok(Signed {
                act_id: a.id(),
                message: SignedRotation {
                    act: bytes,
                    signing_secret: None,
                },
            });
        }
        if let Standing::Exception(e) = review.standing {
            if !confirmed {
                return Err(Refusal::NeedsConfirmation(e));
            }
        }
        let inside = review.inside.expect("a new rotation");
        let key = match review.current.expect("a new rotation") {
            Current::Seed { key } | Current::Shares { key } => key,
        };
        let opt_rand: [u8; 16] = random(rng);
        let a = act::make(
            &inside,
            &random(rng),
            &random(rng),
            &Addressing {
                signer: Some(review.identity),
                binding: None,
                public: true,
                to: None,
            },
            |id| key.sign(id, Some(&opt_rand)),
        );
        drop(key);
        // Check its own work before it leaves the device.
        assert_eq!(sig::verify(&a.signature, &a.id()), Verdict::Valid);
        let opened = a.open(None).expect("the device's own act opens");
        let Ok(Payload::Rotation(r)) = Payload::decode(1, &opened.payload) else {
            unreachable!()
        };
        identity::check_rotation_shape(&a, &opened, &r)
            .map_err(|e| Refusal::Rotation(e.to_string()))?;

        let bytes = a.encode();
        let id = a.id();
        let record = Record {
            request: review.request,
            act: bytes.clone(),
            act_id: id,
            homeless: review.homeless,
        };
        match self
            .memory
            .iter_mut()
            .find(|m| m.commitment == review.commitment)
        {
            Some(m) => {
                match review.standing {
                    Standing::Exception(Exception::AfterVoidedHomeless { .. }) => {
                        m.after_void_used = true
                    }
                    Standing::Exception(Exception::Escape { .. }) => m.escape_used = true,
                    _ => {}
                }
                m.signed.push(record);
            }
            None => self.memory.push(KeyMemory {
                commitment: review.commitment,
                signed: vec![record],
                after_void_used: false,
                escape_used: false,
            }),
        }
        if let Next::Held { seed: Some(s) } = review.next {
            self.seeds.push(s);
        }
        Ok(Signed {
            act_id: id,
            message: SignedRotation {
                act: bytes,
                signing_secret: review.signing_secret,
            },
        })
    }

    // ------------------------------------------------------------ the device's own storage

    /// The device's state, for its own storage: seeds and memory, as CBOR.
    /// It is secret (it holds the seeds); the device keeps it offline.
    pub fn to_bytes(&self) -> Vec<u8> {
        let b = |h: &[u8]| Value::Bytes(h.to_vec());
        let seeds = self
            .seeds
            .iter()
            .map(|s| {
                Value::Array(vec![
                    b(&s.seed.module.spec()),
                    b(&s.seed.entropy),
                    Value::Uint(s.scheme as u64),
                    Value::Uint(s.from_index),
                ])
            })
            .collect();
        let memory = self
            .memory
            .iter()
            .map(|m| {
                Value::Array(vec![
                    b(&m.commitment),
                    Value::Bool(m.after_void_used),
                    Value::Bool(m.escape_used),
                    Value::Array(
                        m.signed
                            .iter()
                            .map(|r| {
                                Value::Array(vec![
                                    b(&r.request),
                                    b(&r.act),
                                    Value::Bool(r.homeless),
                                ])
                            })
                            .collect(),
                    ),
                ])
            })
            .collect();
        cbor::encode(&Value::Array(vec![
            Value::Array(seeds),
            Value::Array(memory),
        ]))
    }

    pub fn from_bytes(config: Config, bytes: &[u8]) -> Option<Signer> {
        let v = cbor::decode(bytes).ok()?;
        let Value::Array(top) = v else { return None };
        let [Value::Array(seeds), Value::Array(memory)] = top.as_slice() else {
            return None;
        };
        let h = |v: &Value| -> Option<[u8; 32]> {
            match v {
                Value::Bytes(b) => b.as_slice().try_into().ok(),
                _ => None,
            }
        };
        let seeds = seeds
            .iter()
            .map(|s| match s {
                Value::Array(a) if a.len() == 4 => match (&a[2], &a[3]) {
                    (Value::Uint(sc @ (2 | 3)), Value::Uint(from)) => Some(StoredSeed {
                        seed: Seed::new(SeedModule::from_spec(&h(&a[0])?)?, h(&a[1])?),
                        scheme: *sc as u8,
                        from_index: *from,
                    }),
                    _ => None,
                },
                _ => None,
            })
            .collect::<Option<Vec<_>>>()?;
        let memory = memory
            .iter()
            .map(|m| match m {
                Value::Array(a) if a.len() == 4 => {
                    let (Value::Bool(av), Value::Bool(es), Value::Array(rs)) =
                        (&a[1], &a[2], &a[3])
                    else {
                        return None;
                    };
                    let signed = rs
                        .iter()
                        .map(|r| match r {
                            Value::Array(x) if x.len() == 3 => {
                                let (Value::Bytes(act), Value::Bool(hl)) = (&x[1], &x[2]) else {
                                    return None;
                                };
                                Some(Record {
                                    request: h(&x[0])?,
                                    act_id: Act::decode(act).ok()?.id(),
                                    act: act.clone(),
                                    homeless: *hl,
                                })
                            }
                            _ => None,
                        })
                        .collect::<Option<Vec<_>>>()?;
                    Some(KeyMemory {
                        commitment: h(&a[0])?,
                        signed,
                        after_void_used: *av,
                        escape_used: *es,
                    })
                }
                _ => None,
            })
            .collect::<Option<Vec<_>>>()?;
        Some(Signer {
            config,
            seeds,
            memory,
        })
    }
}

/// A collective's first dealing, at genesis: a fresh seed dealt to the
/// holders, and the commitment for the collective's genesis. The dealing
/// device forgets the seed; nothing can check that it did.
pub fn deal_genesis(
    plan: &DealPlan,
    rng: &mut (impl RngCore + CryptoRng),
) -> (Message, Vec<Share>) {
    let seed = shares::fresh_dealable_seed(plan.seed_module, rng);
    let dealt = shares::deal(
        &seed,
        plan.scheme,
        0,
        plan.threshold,
        plan.holders.clone(),
        rng,
    );
    let export = Message::CommitmentExport(CommitmentExport {
        safety: dealt[0].dealing.safety,
        index: 0,
    });
    (export, dealt)
}
