//! What Nakišib does, step by step, with the Module's own code
//! (`modules/airgap`): every rule it applies is the Module's. This file only
//! walks the person through it and keeps nothing secret on disk.
//!
//! A change of keys: [`Nakisib::read`] reads Kišib's pending rotation and
//! shows Nakišib's own reading of its bytes before the paper is typed;
//! [`Nakisib::paper`] takes the current paper and runs the Module's review
//! (`Signer::review`: its checks, its own next commitment from a fresh seed,
//! its summary of the exact bytes); [`Nakisib::show`], [`Nakisib::hide`] and
//! [`Nakisib::typed`] walk the fresh seed's backup (Module rule 3.3, draft 6);
//! [`Nakisib::sign`] signs on SIGN, writes the memory (rule 3.4) and forgets
//! both papers; [`Nakisib::write`] writes the signed rotation where chosen.
//!
//! A new identity: [`Nakisib::first`] draws its first paper, shown, hidden,
//! three parts asked back, then [`Nakisib::write`] writes its commitment
//! (message 2.1) for Kišib's "Make an identity with Nakišib".
//!
//! Nakišib's folder holds one file, `memory.cbor`: the Module's own device
//! state (`Signer::to_bytes`) with its list of seeds always empty, so only
//! its memory of what it signed (rule 3.4), which is not secret.

use mor_airgap::device::{ask_places, Choices, Config, Refusal, Review, Signer, Standing, BACKUP_NOTICE};
use mor_airgap::msg::{kind, Message, SignedRotation};
use mor_airgap::seed::{Seed, SeedModule};
use mor_airgap::summary::{self, Before, Summary};
use mor_airgap::device::request_hash;
use mor_core::act::Act;
use mor_core::cbor::{self, Value};
use mor_core::hash::{sha256, Hash};
use mor_core::identity::{self, ChainKeyCommit, Payload};
use mor_core::sig::{self, Verdict};
use rand_core::OsRng;
use serde_json::{json, Value as Json};
use std::path::{Path, PathBuf};
use std::time::{Duration, Instant};

/// The memory's file, in Nakišib's folder: the only file it writes there.
pub const MEMORY: &str = "memory.cbor";

/// How long words typed or shown are held without a step: then forgotten.
pub const LIFE: Duration = Duration::from_secs(15 * 60);

/// The Identity and Money MIRs' spec hashes: test values until the freeze,
/// the same as `mor-signer`, the relays and every client of the suite.
pub fn config() -> Config {
    Config {
        identity_spec: sha256(b"IDENTITY, test value until the freeze"),
        money_spec: Some(sha256(b"FINANCE, test value until the freeze")),
    }
}

/// Said on the first screen, and wherever the Mac's connection matters.
pub const NEVER_CONNECT: &str = "This Mac should never connect again.";

/// The scheme of a new identity's first chain key: SLH-DSA-SHA2-128f
/// (founding scheme 3), as Kišib and Dub make an identity's chain key.
pub const FIRST_SCHEME: u8 = 3;

fn hexs(b: &[u8]) -> String {
    b.iter().map(|x| format!("{x:02x}")).collect()
}

fn grouped(h: &str) -> String {
    h.as_bytes().chunks(4).map(|c| std::str::from_utf8(c).unwrap()).collect::<Vec<_>>().join(" ")
}

/// Overwrite a string's bytes before it is dropped: words typed or shown.
/// Zero bytes are valid UTF-8, so the string stays a string.
pub fn scrub(s: &mut String) {
    // SAFETY: only zero bytes are written, which keep the string valid UTF-8.
    for b in unsafe { s.as_bytes_mut() } {
        unsafe { std::ptr::write_volatile(b, 0) };
    }
    s.clear();
}

/// Overwrite every string in a JSON value (a request's words).
pub fn scrub_json(v: &mut Json) {
    match v {
        Json::String(s) => scrub(s),
        Json::Array(a) => a.iter_mut().for_each(scrub_json),
        Json::Object(o) => o.values_mut().for_each(scrub_json),
        _ => {}
    }
}

/// Overwrite bytes.
pub fn scrub_bytes(b: &mut [u8]) {
    for x in b.iter_mut() {
        unsafe { std::ptr::write_volatile(x, 0) };
    }
}

/// A summary as the page shows it: the Module's lines, the prominent first
/// under its own heading, then what it did not check, then the online
/// side's context, apart and unchecked.
fn summary_json(s: &Summary) -> Json {
    json!({
        "prominent": s.lines.iter().filter(|l| l.prominent).map(|l| l.text.clone()).collect::<Vec<_>>(),
        "plain": s.lines.iter().filter(|l| !l.prominent).map(|l| l.text.clone()).collect::<Vec<_>>(),
        "notChecked": s.not_checked,
        "context": s.context,
    })
}

/// Where a sitting stands.
enum Sitting {
    /// A change of keys.
    Rotation(Box<Rotation>),
    /// A new identity's first paper.
    First(First),
}

struct Rotation {
    pending: Vec<u8>,
    preview: Json,
    /// From the paper on: the Module's device, holding the current seed, and its review.
    signer: Option<Signer>,
    review: Option<Review>,
    /// The Module's summary of the exact bytes, once reviewed.
    reviewed: Option<Json>,
    repeat: bool,
    stage: &'static str,
    /// Once signed: the signed rotation's message (not secret), and its act.
    signed: Option<(Vec<u8>, Hash)>,
    written: Vec<String>,
}

struct First {
    signer: Option<Signer>,
    asked: Option<[usize; 3]>,
    /// The commitment export, made once the paper is typed back.
    export: Option<Vec<u8>>,
    commit: String,
    module: SeedModule,
    stage: &'static str,
    written: Vec<String>,
}

/// Nakišib: its folder, and the sitting held in memory only.
pub struct Nakisib {
    dir: PathBuf,
    config: Config,
    sitting: Option<Sitting>,
    touched: Instant,
}

type R<T> = Result<T, String>;

impl Nakisib {
    pub fn new(dir: PathBuf) -> Self {
        Nakisib { dir, config: config(), sitting: None, touched: Instant::now() }
    }

    /// The memory of what was signed (rule 3.4), from the folder; the device
    /// starts with no seed, ever.
    fn device(&self) -> R<Signer> {
        match std::fs::read(self.dir.join(MEMORY)) {
            Ok(b) => {
                let mut s = Signer::from_bytes(self.config.clone(), &b).ok_or("Nakišib’s memory file is damaged: nothing was signed. Keep it aside, as it is, and ask before going on.")?;
                if !s.seeds.is_empty() {
                    // A file Nakišib never writes: a seed has no place here.
                    s.seeds.clear();
                    return Err("Nakišib’s memory file holds a seed, which Nakišib never writes there: nothing was signed. Remove that file from this Mac only once you are sure what made it.".into());
                }
                Ok(s)
            }
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(Signer::new(self.config.clone())),
            Err(e) => Err(format!("Nakišib’s memory could not be read: {e}")),
        }
    }

    /// Forget everything this sitting holds: papers, seeds, the review.
    pub fn forget(&mut self) -> Json {
        self.sitting = None; // every Seed overwrites itself as it is dropped
        self.state()
    }

    /// Words held too long without a step are forgotten.
    pub fn expire(&mut self) {
        let holds = match &self.sitting {
            Some(Sitting::Rotation(r)) => r.signer.is_some() || r.review.is_some(),
            Some(Sitting::First(f)) => f.signer.is_some(),
            None => false,
        };
        if holds && self.touched.elapsed() > LIFE {
            self.forget();
        }
    }

    pub fn touch(&mut self) {
        self.touched = Instant::now();
    }

    /// What the page shows now.
    pub fn state(&self) -> Json {
        match &self.sitting {
            None => json!({ "stage": "home", "never": NEVER_CONNECT }),
            Some(Sitting::Rotation(r)) => json!({
                "kind": "rotation",
                "stage": r.stage,
                "preview": r.preview,
                "summary": r.reviewed,
                "repeat": r.repeat,
                "asked": r.review.as_ref().and_then(|v| v.asked()),
                "act": r.signed.as_ref().map(|s| hexs(&s.1)),
                "written": r.written,
            }),
            Some(Sitting::First(f)) => json!({
                "kind": "first",
                "stage": f.stage,
                "module": f.module.name(),
                "asked": f.asked,
                "commit": if f.export.is_some() { Some(f.commit.clone()) } else { None },
                "written": f.written,
            }),
        }
    }

    fn busy(&self) -> R<()> {
        match &self.sitting {
            Some(Sitting::Rotation(r)) if r.stage != "written" && r.stage != "read" && r.stage != "signed" => {
                Err("Nakišib is in the middle of a change of keys: finish it, or press Forget, first.".into())
            }
            Some(Sitting::First(f)) if f.stage != "written" && f.stage != "ready" => {
                Err("Nakišib is in the middle of a new paper: finish it, or press Forget, first.".into())
            }
            _ => Ok(()),
        }
    }

    // ------------------------------------------------------------ a change of keys

    /// Read Kišib's pending rotation, believing none of it: Nakišib's own
    /// reading of the exact bytes, before any paper is typed.
    pub fn read(&mut self, bytes: Vec<u8>) -> R<Json> {
        self.busy()?;
        let memory = self.device()?;
        let preview = preview(&bytes, &self.config, &memory)?;
        let repeat = preview["already"] == json!("same");
        self.sitting = Some(Sitting::Rotation(Box::new(Rotation {
            pending: bytes,
            preview,
            signer: None,
            review: None,
            reviewed: None,
            repeat,
            stage: "read",
            signed: None,
            written: vec![],
        })));
        Ok(self.state())
    }

    /// The current paper, typed: its 24 words or 72 characters. The Module
    /// reviews the request with it: its checks, its own next commitment from
    /// a fresh seed, its summary of the exact bytes it will sign.
    pub fn paper(&mut self, written: &mut String) -> R<Json> {
        let result = self.paper_(written);
        scrub(written);
        result
    }

    fn paper_(&mut self, written: &str) -> R<Json> {
        let mut device = self.device()?;
        let Some(Sitting::Rotation(r)) = &mut self.sitting else {
            return Err("Read a request from Kišib first.".into());
        };
        if r.stage != "read" {
            return Err("The paper was already given for this request: press Forget to start again.".into());
        }
        // H104 (decided: "Chain key, only words in dubsar apps"): the paper is its 24 words, no other form.
        let parts = written.split_whitespace().count();
        if parts != 24 {
            return Err(format!("A chain key’s paper is its 24 words: {parts} were typed. Nothing was signed."));
        }
        let seed = Seed::restore(SeedModule::Words, written).map_err(|e| format!("These are not a paper’s words as written: {e}. Look at the paper again. Nothing was signed."))?;
        let scheme = match preview_scheme(&r.preview) {
            Some(s) => s,
            None => return Err("This request’s previous act commits to a chain key Nakišib does not implement.".into()),
        };
        device.add_seed(seed, scheme, 0);
        let review = match device.review(&r.pending, &Choices::default(), &mut OsRng) {
            Ok(v) => v,
            Err(e) => return Err(refused(&e)),
        };
        if let Standing::Exception(e) = &review.standing {
            return Err(format!("Not in this first version of Nakišib: {e} Such an exception is signed with the command-line signer (mor-signer), which asks for it to be confirmed. Nothing was signed, and the paper is forgotten."));
        }
        r.repeat = review.standing == Standing::Repeat;
        r.reviewed = Some(summary_json(&review.summary));
        r.stage = if review.new_seed.is_some() { "review" } else { "sign" };
        r.review = Some(review);
        r.signer = Some(device);
        Ok(self.state())
    }

    /// The fresh seed's backup, shown: the new paper (rule 3.3, draft 6).
    pub fn show(&mut self) -> R<Json> {
        match &mut self.sitting {
            Some(Sitting::Rotation(r)) => {
                let Some(review) = &r.review else { return Err("No new paper is waiting.".into()) };
                let Some(seed) = &review.new_seed else { return Err("No new paper is waiting.".into()) };
                if r.stage != "review" && r.stage != "shown" {
                    return Err("No new paper is waiting.".into());
                }
                r.stage = "paper";
                Ok(paper_json(seed, "rotation"))
            }
            Some(Sitting::First(f)) => {
                let Some(signer) = &f.signer else { return Err("No new paper is waiting.".into()) };
                if f.stage != "drawn" && f.stage != "shown" {
                    return Err("No new paper is waiting.".into());
                }
                f.stage = "paper";
                Ok(paper_json(&signer.seeds[0].seed, "first"))
            }
            None => Err("No new paper is waiting.".into()),
        }
    }

    /// The new paper hidden: three parts asked back, chosen by the Module.
    pub fn hide(&mut self) -> R<Json> {
        match &mut self.sitting {
            Some(Sitting::Rotation(r)) if r.stage == "paper" => r.stage = "shown",
            Some(Sitting::First(f)) if f.stage == "paper" => {
                let n = f.signer.as_ref().map(|s| s.seeds[0].seed.backup().split_whitespace().count()).unwrap_or(24);
                f.asked.get_or_insert_with(|| ask_places(n, &mut OsRng));
                f.stage = "shown";
            }
            _ => return Err("No new paper is shown.".into()),
        }
        Ok(self.state())
    }

    /// Three parts typed back. A wrong part is refused, and nothing is signed or written.
    pub fn typed(&mut self, typed: &mut [String]) -> R<Json> {
        let result = self.typed_(typed);
        typed.iter_mut().for_each(scrub);
        result
    }

    fn typed_(&mut self, typed: &[String]) -> R<Json> {
        match &mut self.sitting {
            Some(Sitting::Rotation(r)) if r.stage == "shown" => {
                let review = r.review.as_mut().expect("a review");
                let t: Vec<&str> = typed.iter().map(String::as_str).collect();
                review.confirm_backup(&t).map_err(|e| refused(&e))?;
                r.stage = "sign";
            }
            Some(Sitting::First(f)) if f.stage == "shown" => {
                let signer = f.signer.as_ref().expect("a paper");
                let mut backup = signer.seeds[0].seed.backup();
                let parts: Vec<&str> = backup.split_whitespace().collect();
                let norm = |x: &str| x.split_whitespace().collect::<String>().to_ascii_lowercase();
                let at = f.asked.expect("asked");
                let ok = typed.len() == 3 && at.iter().zip(typed).all(|(&i, t)| norm(t) == parts[i - 1].to_ascii_lowercase());
                scrub(&mut backup);
                if !ok {
                    return Err(refused(&Refusal::BackupMismatch).replace("nothing was signed", "nothing was written"));
                }
                // The paper is written: its commitment made (message 2.1), its seed forgotten.
                let export = signer.export_commitment(0, 0);
                if let Message::CommitmentExport(c) = &export {
                    f.commit = grouped(&hexs(&c.chain_key.commit));
                }
                f.export = Some(export.encode());
                f.signer = None;
                f.stage = "ready";
            }
            _ => return Err("No new paper is asked back.".into()),
        }
        Ok(self.state())
    }

    /// SIGN typed: the Module signs, the memory is written, both papers are forgotten.
    pub fn sign(&mut self, word: &str) -> R<Json> {
        let Some(Sitting::Rotation(r)) = &mut self.sitting else {
            return Err("Nothing is waiting to be signed.".into());
        };
        if r.stage != "sign" {
            return Err("Not yet: the new paper is written and three of its words typed back first.".into());
        }
        if word != "SIGN" {
            return Err("Type SIGN, in capitals, to sign exactly this. Nothing was signed.".into());
        }
        let mut device = r.signer.take().expect("a device");
        let review = r.review.take().expect("a review");
        let signed = device.sign(review, false, &mut OsRng).map_err(|e| refused(&e));
        let signed = match signed {
            Ok(s) => s,
            Err(e) => {
                device.seeds.clear();
                r.stage = "read";
                return Err(e);
            }
        };
        // Rule 3.4 first, written before anything leaves: then the device and its seeds go.
        if let Err(e) = save(&self.dir, device) {
            return Err(format!("Nakišib could not write its memory ({e}), so the signed rotation is not given out. Nothing left this Mac."));
        }
        let message = Message::SignedRotation(signed.message).encode();
        r.signed = Some((message, signed.act_id));
        r.stage = "signed";
        Ok(self.state())
    }

    /// Write what is ready (the signed rotation, or the commitment) to the file chosen.
    pub fn write(&mut self, path: &Path) -> R<Json> {
        let (bytes, list) = match &mut self.sitting {
            Some(Sitting::Rotation(r)) if r.signed.is_some() => (r.signed.as_ref().unwrap().0.clone(), &mut r.written),
            Some(Sitting::First(f)) if f.export.is_some() => (f.export.clone().unwrap(), &mut f.written),
            _ => return Err("Nothing is ready to be written.".into()),
        };
        std::fs::write(path, &bytes).map_err(|e| format!("Not written to {}: {e}", path.display()))?;
        list.push(path.display().to_string());
        match &mut self.sitting {
            Some(Sitting::Rotation(r)) => r.stage = "written",
            Some(Sitting::First(f)) => f.stage = "written",
            None => {}
        }
        Ok(self.state())
    }

    // ------------------------------------------------------------ a new identity's first paper

    /// Draw a new identity's first paper (24 words: H104, words only in
    /// Dubsar apps), its key 0 under scheme 3. Shown next; nothing is
    /// written before three parts are typed back.
    pub fn first(&mut self, module: &str) -> R<Json> {
        self.busy()?;
        let module = match SeedModule::from_name(module) {
            Some(SeedModule::Words) => SeedModule::Words,
            _ => return Err("Nakišib draws a chain key’s paper as 24 words only.".into()),
        };
        let mut signer = Signer::new(self.config.clone());
        signer.new_seed(module, FIRST_SCHEME, &mut OsRng);
        self.sitting = Some(Sitting::First(First { signer: Some(signer), asked: None, export: None, commit: String::new(), module, stage: "drawn", written: vec![] }));
        Ok(self.state())
    }

    // ------------------------------------------------------------ the memory

    /// What Nakišib signed before, from its memory: nothing secret in it.
    pub fn memory(&self) -> R<Json> {
        let d = self.device()?;
        let mut out = vec![];
        for m in &d.memory {
            for rec in &m.signed {
                let (identity, position) = Act::decode(&rec.act)
                    .ok()
                    .map(|a| {
                        let pos = a.open(None).ok().and_then(|i| match Payload::decode(i.type_, &i.payload) {
                            Ok(Payload::Rotation(r)) => Some(r.position),
                            _ => None,
                        });
                        (a.outside.signer.map(|s| hexs(&s)), pos)
                    })
                    .unwrap_or((None, None));
                out.push(json!({
                    "key": grouped(&hexs(&m.commitment[..16])),
                    "identity": identity,
                    "position": position,
                    "act": hexs(&rec.act_id),
                    "request": hexs(&rec.request),
                    "homeless": rec.homeless,
                }));
            }
        }
        Ok(json!({ "signed": out }))
    }

    /// The same signed bytes written again, from the memory (rule 3.4: the
    /// same request is answered with the same bytes). No paper is needed.
    pub fn write_again(&self, act: &str, path: &Path) -> R<Json> {
        let d = self.device()?;
        let rec = d
            .memory
            .iter()
            .flat_map(|m| m.signed.iter())
            .find(|r| hexs(&r.act_id) == act)
            .ok_or("Nakišib did not sign that act.")?;
        let m = Message::SignedRotation(SignedRotation { act: rec.act.clone(), signing_secret: None });
        std::fs::write(path, m.encode()).map_err(|e| format!("Not written to {}: {e}", path.display()))?;
        Ok(json!({ "written": path.display().to_string() }))
    }

    /// From the preview: the same request signed before, answered with the
    /// same bytes, without the paper (rule 3.4).
    pub fn same_again(&mut self) -> R<Json> {
        let d = self.device()?;
        let Some(Sitting::Rotation(r)) = &mut self.sitting else {
            return Err("Read a request from Kišib first.".into());
        };
        let Some(act) = r.preview["sameAct"].as_str().map(str::to_string) else {
            return Err("Nakišib has not signed this request before.".into());
        };
        let rec = d.memory.iter().flat_map(|m| m.signed.iter()).find(|x| hexs(&x.act_id) == act).ok_or("Nakišib did not sign that act.")?;
        let m = Message::SignedRotation(SignedRotation { act: rec.act.clone(), signing_secret: None });
        r.signed = Some((m.encode(), rec.act_id));
        r.repeat = true;
        r.stage = "signed";
        Ok(self.state())
    }
}

/// Write the memory, its list of seeds emptied first: nothing secret on
/// disk. Written to a new file, then put in place, so a crash leaves the old
/// memory or the new one, never half of one.
fn save(dir: &Path, mut device: Signer) -> std::io::Result<()> {
    device.seeds.clear();
    std::fs::create_dir_all(dir)?;
    let tmp = dir.join(format!("{MEMORY}.new"));
    std::fs::write(&tmp, device.to_bytes())?;
    std::fs::rename(&tmp, dir.join(MEMORY))
}

fn paper_json(seed: &Seed, for_: &str) -> Json {
    let backup = seed.backup();
    let words: Vec<String> = backup.split_whitespace().map(str::to_string).collect();
    let mut b = backup;
    scrub(&mut b);
    let say = if for_ == "first" {
        vec![
            "This is the first chain-key paper of a new identity, drawn now on this Mac. It is the only way ever to change the identity’s keys.".to_string(),
            BACKUP_NOTICE.to_string(),
            "When you say it is written, it is hidden and three parts are asked back. Only then is its commitment ready for Kišib; Nakišib then forgets the paper.".to_string(),
        ]
    } else {
        vec![
            "This is the new chain-key paper, drawn now on this Mac (a fresh seed, as at every change of keys). It is the one the next change of keys needs.".to_string(),
            BACKUP_NOTICE.to_string(),
            "When you say it is written, it is hidden and three parts are asked back. Nothing is signed before. Walk away before, and nothing is signed: this paper is then worthless.".to_string(),
            "The paper you typed stays the one that counts until the homes accept this change; until then it only answers this same request again.".to_string(),
        ]
    };
    json!({ "module": seed.module.name(), "parts": words, "say": say })
}

/// Say a Module refusal in plain words.
fn refused(e: &Refusal) -> String {
    let base = e.to_string();
    let mut s = base[..1].to_uppercase() + &base[1..];
    if !s.ends_with('.') {
        s.push('.');
    }
    if !s.contains("othing was signed") {
        s.push_str(" Nothing was signed.");
    }
    s
}

fn preview_scheme(p: &Json) -> Option<u8> {
    match p["scheme"].as_u64() {
        Some(n @ (2 | 3)) => Some(n as u8),
        _ => None,
    }
}

/// Nakišib's own reading of a pending rotation's exact bytes, before the
/// paper: the Module's strict decoding (rule 3.6) and its own summary lines
/// (`summary::describe`, rule 3.1), with the memory of what it signed (rule
/// 3.4). The Module's review, once the paper is typed, checks everything
/// again and its summary is the one shown before SIGN.
fn preview(bytes: &[u8], cfg: &Config, memory: &Signer) -> R<Json> {
    let Message::PendingRotation(p) = Message::decode_kind(bytes, kind::PENDING_ROTATION).map_err(|e| {
        format!("This file is not a request from Kišib (a pending rotation): {e}. Nakišib reads nothing else, and runs nothing it reads.")
    })?
    else {
        unreachable!()
    };
    let bad = |e: String| format!("Nakišib refuses this request: {e}. Nothing was signed.");
    // The previous act: public, of the Identity MIR, its signature valid.
    let a = Act::decode(&p.prev).map_err(|e| bad(format!("its previous act does not decode ({e:?})")))?;
    if !a.outside.is_public() {
        return Err(bad("its previous act is not public".into()));
    }
    let inside = a.open(None).map_err(|e| bad(format!("its previous act does not open ({e:?})")))?;
    if inside.spec != cfg.identity_spec {
        return Err(bad("its previous act is not an act of the Identity MIR".into()));
    }
    if sig::verify(&a.signature, &a.id()) != Verdict::Valid {
        return Err(bad("its previous act’s signature is not valid".into()));
    }
    let prev_id = a.id();
    let decls = |ds: &Option<Vec<identity::Declaration>>| -> Option<Option<Value>> {
        let f = cfg.money_spec?;
        ds.iter().flatten().find(|d| d.spec == f && d.kind == 0).map(|d| d.value.clone())
    };
    let (who, commit, vault): (Hash, ChainKeyCommit, Option<Option<Value>>) =
        match Payload::decode(inside.type_, &inside.payload).map_err(|e| bad(format!("its previous act: {e}")))? {
            Payload::Genesis(g) => (prev_id, g.chain_key.clone(), decls(&g.declarations)),
            Payload::Rotation(r) => (a.outside.signer.ok_or_else(|| bad("its previous act names no signer".into()))?, r.chain_key.clone(), decls(&r.declarations)),
            _ => return Err(bad("its previous act is neither a genesis nor a rotation".into())),
        };
    // The rotation asked for: spec, type 1, a payload; a next commitment sent anyway is set aside.
    let v = cbor::decode(&p.inside).map_err(|e| bad(format!("its rotation does not decode ({e})")))?;
    let Value::Map(m) = v else { return Err(bad("its rotation is not a map".into())) };
    let mut payload = None;
    for (k, x) in &m {
        match (k, x) {
            (Value::Uint(0), Value::Bytes(b)) if b[..] == cfg.identity_spec[..] => {}
            (Value::Uint(0), _) => return Err(bad("it is not an act of the Identity MIR".into())),
            (Value::Uint(1), Value::Uint(1)) => {}
            (Value::Uint(1), _) => return Err(bad("the chain key signs only rotations, and this is not one".into())),
            (Value::Uint(4), Value::Map(pm)) => payload = Some(pm.clone()),
            (Value::Uint(10), _) => {}
            _ => return Err(bad("its rotation carries a field besides spec, type and payload, which Nakišib will not sign unseen".into())),
        }
    }
    let mut payload = payload.ok_or_else(|| bad("its rotation has no payload".into()))?;
    let before = payload.len();
    payload.retain(|(k, _)| k != &Value::Uint(3));
    let supplied = payload.len() != before;
    let stripped = cbor::encode(&Value::Map(vec![
        (Value::Uint(0), Value::Bytes(cfg.identity_spec.to_vec())),
        (Value::Uint(1), Value::Uint(identity::types::ROTATION)),
        (Value::Uint(4), Value::Map(payload.clone())),
    ]));
    let mut probe = payload.clone();
    probe.push((Value::Uint(3), ChainKeyCommit { scheme: sig::SLH_128S, commit: [0; 32] }.to_value()));
    let Payload::Rotation(r) = Payload::decode(identity::types::ROTATION, &probe).map_err(|e| bad(format!("its rotation: {e}")))? else {
        unreachable!()
    };
    let mut s = Summary::default();
    if supplied {
        // Said as the Module says it (rule 3.3); the Module's review drops it and says it again.
        s.lines.push(summary::Line { prominent: true, text: "The online device supplied a next chain-key commitment. It is IGNORED and replaced by this device’s own: a well-behaved client never sends one. Check the online device.".into() });
    }
    summary::describe(&mut s, &who, &r, &Before { vault: vault.as_ref().map(|v| v.as_ref()) }, cfg.money_spec.as_ref(), p.escape == Some(true));
    for c in p.context.iter().flatten() {
        s.context.push(String::from_utf8(c.clone()).unwrap_or_else(|_| format!("h'{}'", hexs(c))));
    }
    // Rule 3.4: this request, or another, signed before with this key?
    let request = request_hash(&stripped, &prev_id);
    let mine = memory.memory.iter().find(|k| k.commitment == commit.commit);
    let same = mine.and_then(|k| k.signed.iter().find(|x| x.request == request));
    let already = match (mine, same) {
        (_, Some(_)) => "same",
        (Some(_), None) => "other",
        _ => "new",
    };
    let scheme = match commit.scheme {
        mor_core::act::Scheme::Founding(n) => n as u64,
        _ => 0,
    };
    Ok(json!({
        "identity": hexs(&who),
        "position": r.position,
        "index": p.index,
        "scheme": scheme,
        "summary": summary_json(&s),
        "supplied": supplied,
        "already": already,
        "sameAct": same.map(|x| hexs(&x.act_id)),
        "otherAct": mine.and_then(|k| k.signed.last()).map(|x| hexs(&x.act_id)),
    }))
}

#[cfg(test)]
mod tests {
    //! The sequence through Nakišib's own steps, with the Module's online side
    //! standing in for Kišib (`online::genesis`, `pending`, `accept`). Kišib
    //! itself, the homes and the page are in `test/*.test.ts`.
    use super::*;
    use mor_airgap::online::{self, GenesisPlan};
    use mor_core::identity::{Home, Rotation, SigningKey};
    use mor_core::sig::SchnorrKey;

    fn tmp(name: &str) -> PathBuf {
        let d = std::env::temp_dir().join(format!("nakisib-test-{name}-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&d);
        std::fs::create_dir_all(&d).unwrap();
        d
    }

    /// Walk a shown paper: show, hide, the three parts typed back. Returns its parts.
    fn walk(n: &mut Nakisib, wrong_first: bool) -> Vec<String> {
        let shown = n.show().unwrap();
        let parts: Vec<String> = shown["parts"].as_array().unwrap().iter().map(|x| x.as_str().unwrap().to_string()).collect();
        let st = n.hide().unwrap();
        let asked: Vec<usize> = st["asked"].as_array().unwrap().iter().map(|x| x.as_u64().unwrap() as usize).collect();
        if wrong_first {
            let mut bad = vec!["abandon".to_string(); 3];
            assert!(n.typed(&mut bad).unwrap_err().contains("not the backup shown"));
        }
        let mut typed: Vec<String> = asked.iter().map(|&i| parts[i - 1].clone()).collect();
        n.typed(&mut typed).unwrap();
        parts
    }

    fn rotation(prev: &Act, position: u64, key: &SchnorrKey) -> Rotation {
        Rotation {
            prev: prev.id(),
            position,
            signing_key: SigningKey { scheme: sig::SCHNORR, key: key.public().to_vec() },
            chain_key: ChainKeyCommit { scheme: sig::SLH_128S, commit: [0; 32] },
            kept: vec![],
            disowned: None,
            homes: None,
            rule: None,
            declarations: None,
            successor: None,
            audit: None,
            homeless: false,
            closure: false,
        }
    }

    /// Everything in the folder, read whole.
    fn folder(d: &Path) -> Vec<(String, Vec<u8>)> {
        let mut out = vec![];
        for e in std::fs::read_dir(d).unwrap() {
            let e = e.unwrap();
            out.push((e.file_name().to_string_lossy().to_string(), std::fs::read(e.path()).unwrap()));
        }
        out
    }

    fn holds_nothing_of(d: &Path, papers: &[&[String]]) {
        let files = folder(d);
        assert!(files.iter().all(|(n, _)| n == MEMORY), "only the memory: {:?}", files.iter().map(|f| &f.0).collect::<Vec<_>>());
        for (_, b) in &files {
            let all = String::from_utf8_lossy(b).to_string();
            for p in papers {
                let s = Seed::restore(if p.len() == 24 { SeedModule::Words } else { SeedModule::Hex }, &p.join(" ")).unwrap();
                assert!(!b.windows(32).any(|w| w == s.entropy), "a seed on disk");
                for k in [2u8, 3] {
                    for i in 0..4 {
                        let ks = s.key_seeds(k, i);
                        assert!(!b.windows(16).any(|w| w == &ks[..16]), "a chain key's seed on disk");
                    }
                }
                assert!(!all.contains(&p[..6].join(" ")), "words on disk");
            }
            let mem = Signer::from_bytes(config(), b).unwrap();
            assert!(mem.seeds.is_empty());
        }
    }

    #[test]
    fn a_first_paper_a_genesis_two_changes_of_keys_a_repeat_and_a_refusal() {
        let spec = config().identity_spec;
        let dir = tmp("whole");
        let mut n = Nakisib::new(dir.clone());

        // A new identity's first paper: drawn, shown, a wrong part refused, three typed back; its commitment.
        n.first("words").unwrap();
        let first = walk(&mut n, true);
        assert_eq!(first.len(), 24);
        let export = dir.join("commitment.mor");
        n.write(&export).unwrap();
        let export_bytes = std::fs::read(&export).unwrap();
        std::fs::remove_file(&export).unwrap();
        assert!(matches!(Message::decode_kind(&export_bytes, kind::COMMITMENT_EXPORT), Ok(Message::CommitmentExport(c)) if c.index == 0));
        assert!(!dir.join(MEMORY).exists(), "a genesis signs nothing: nothing in the memory");

        // Kišib's side: the genesis from that commitment.
        let k0 = SchnorrKey::from_secret(&sha256(b"test signing 0")).unwrap();
        let home = Home { operator: Some(sha256(b"operator h")), hint: "https://h.example".into() };
        let g = online::genesis(spec, &export_bytes, &k0, GenesisPlan { homes: vec![home], ..Default::default() }, &mut OsRng).unwrap();

        // A change of keys, asked by Kišib: read, the paper, the new paper, SIGN, written.
        let k1 = SchnorrKey::from_secret(&sha256(b"test signing 1")).unwrap();
        let pending = online::pending(&spec, &g, &rotation(&g, 1, &k1), Some(vec!["Kišib says: an ordinary change".into()]), false).encode();
        let st = n.read(pending.clone()).unwrap();
        assert_eq!(st["stage"], "read");
        assert_eq!(st["preview"]["already"], "new");
        assert!(st["preview"]["summary"]["prominent"].as_array().unwrap().iter().any(|l| l.as_str().unwrap().starts_with("New signing key: fingerprint")));
        assert_eq!(st["preview"]["summary"]["context"][0], "Kišib says: an ordinary change");
        // A wrong paper is refused, plainly.
        let mut wrong = Seed::new(SeedModule::Words, [7; 32]).backup();
        assert!(n.paper(&mut wrong).unwrap_err().contains("may be an earlier, spent one"));
        assert!(wrong.is_empty(), "the words typed are overwritten");
        let mut paper = first.join(" ");
        n.paper(&mut paper).unwrap();
        assert!(n.sign("SIGN").unwrap_err().contains("Not yet"), "nothing signed before the new paper");
        let second = walk(&mut n, true);
        assert_ne!(second, first, "a fresh seed");
        assert!(n.sign("sign").unwrap_err().contains("Type SIGN"));
        let st = n.sign("SIGN").unwrap();
        assert!(st["summary"]["prominent"].as_array().unwrap().iter().any(|l| l.as_str().unwrap().starts_with("FRESH SEED")));
        let answer = dir.join("answer.mor");
        n.write(&answer).unwrap();
        let signed = std::fs::read(&answer).unwrap();
        std::fs::remove_file(&answer).unwrap();
        let acc = online::accept(&spec, &pending, &signed).unwrap();
        holds_nothing_of(&dir, &[&first, &second]);

        // Asked again for the same request: the same bytes, without the paper.
        n.forget();
        let st = n.read(pending.clone()).unwrap();
        assert_eq!(st["preview"]["already"], "same");
        n.same_again().unwrap();
        n.write(&answer).unwrap();
        assert_eq!(std::fs::read(&answer).unwrap(), signed);
        // And with the paper typed: the Module answers with the same bytes too.
        n.forget();
        n.read(pending.clone()).unwrap();
        let mut paper = first.join(" ");
        let st = n.paper(&mut paper).unwrap();
        assert_eq!(st["stage"], "sign");
        assert_eq!(st["repeat"], true);
        n.sign("SIGN").unwrap();
        n.write(&answer).unwrap();
        assert_eq!(std::fs::read(&answer).unwrap(), signed);
        std::fs::remove_file(&answer).unwrap();

        // A different change of keys with the same key: refused, as the Module says.
        n.forget();
        let k1b = SchnorrKey::from_secret(&sha256(b"test signing 1b")).unwrap();
        let other = online::pending(&spec, &g, &rotation(&g, 1, &k1b), None, false).encode();
        assert_eq!(n.read(other).unwrap()["preview"]["already"], "other");
        let mut paper = first.join(" ");
        assert!(n.paper(&mut paper).unwrap_err().contains("already signed a different rotation"));

        // The next change of keys, from the new paper; the old paper refused, said plainly.
        n.forget();
        let k2 = SchnorrKey::from_secret(&sha256(b"test signing 2")).unwrap();
        let pending2 = online::pending(&spec, &acc.act, &rotation(&acc.act, 2, &k2), None, false).encode();
        n.read(pending2.clone()).unwrap();
        let mut old = first.join(" ");
        assert!(n.paper(&mut old).unwrap_err().contains("it may be an earlier, spent one"));
        let mut paper = second.join(" ");
        n.paper(&mut paper).unwrap();
        let third = walk(&mut n, false);
        n.sign("SIGN").unwrap();
        n.write(&answer).unwrap();
        online::accept(&spec, &pending2, &std::fs::read(&answer).unwrap()).unwrap();
        std::fs::remove_file(&answer).unwrap();
        holds_nothing_of(&dir, &[&first, &second, &third]);
        assert_eq!(n.memory().unwrap()["signed"].as_array().unwrap().len(), 2);
        std::fs::remove_dir_all(&dir).unwrap();
    }

    #[test]
    fn a_request_slipping_in_a_next_commitment_is_ignored_and_said() {
        let spec = config().identity_spec;
        let dir = tmp("slip");
        let mut n = Nakisib::new(dir.clone());
        // H104: words only; a hex paper is refused.
        assert!(n.first("hex").is_err(), "no hex paper");
        n.first("words").unwrap();
        let first = walk(&mut n, false);
        assert_eq!(first.len(), 24, "a paper of 24 words");
        n.write(&dir.join("c.mor")).unwrap();
        let export = std::fs::read(dir.join("c.mor")).unwrap();
        std::fs::remove_file(dir.join("c.mor")).unwrap();
        let k0 = SchnorrKey::from_secret(&sha256(b"slip 0")).unwrap();
        let g = online::genesis(spec, &export, &k0, GenesisPlan { homes: vec![Home { operator: None, hint: "https://self.example".into() }], ..Default::default() }, &mut OsRng).unwrap();
        let k1 = SchnorrKey::from_secret(&sha256(b"slip 1")).unwrap();
        let Message::PendingRotation(mut p) = online::pending(&spec, &g, &rotation(&g, 1, &k1), None, false) else { unreachable!() };
        // An attacker's commitment slipped in as payload key 3.
        let Value::Map(mut inside) = cbor::decode(&p.inside).unwrap() else { unreachable!() };
        for (k, v) in inside.iter_mut() {
            if k == &Value::Uint(4) {
                let Value::Map(pl) = v else { unreachable!() };
                pl.push((Value::Uint(3), ChainKeyCommit { scheme: sig::SLH_128S, commit: [9; 32] }.to_value()));
                pl.sort_by_key(|(k, _)| cbor::encode(k));
            }
        }
        p.inside = cbor::encode(&Value::Map(inside));
        let pending = Message::PendingRotation(p).encode();
        let st = n.read(pending.clone()).unwrap();
        assert_eq!(st["preview"]["supplied"], true);
        assert!(st["preview"]["summary"]["prominent"][0].as_str().unwrap().contains("IGNORED"));
        let mut paper = first.join(" ");
        let st = n.paper(&mut paper).unwrap();
        assert!(st["summary"]["prominent"].as_array().unwrap().iter().any(|l| l.as_str().unwrap().contains("IGNORED and replaced by this device")));
        walk(&mut n, false);
        n.sign("SIGN").unwrap();
        n.write(&dir.join("a.mor")).unwrap();
        let signed = std::fs::read(dir.join("a.mor")).unwrap();
        let Message::SignedRotation(s) = Message::decode(&signed).unwrap() else { unreachable!() };
        let a = Act::decode(&s.act).unwrap();
        let Ok(Payload::Rotation(r)) = Payload::decode(1, &a.open(None).unwrap().payload) else { unreachable!() };
        assert_ne!(r.chain_key.commit, [9; 32], "the attacker's commitment is not the one signed");
        std::fs::remove_dir_all(&dir).unwrap();
    }

    #[test]
    fn not_a_request_is_refused_unread() {
        let mut n = Nakisib::new(tmp("junk"));
        assert!(n.read(b"#!/bin/sh\nrm -rf /\n".to_vec()).unwrap_err().contains("not a request from Kišib"));
        assert!(n.read(vec![0; 300 * 1024]).is_err());
    }
}
