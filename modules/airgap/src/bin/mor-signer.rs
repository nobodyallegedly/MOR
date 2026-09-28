//! `mor-signer`: the offline signer, for a laptop that never connects.
//!
//! Rotations travel by file (a USB stick or SD card) or as animated QR codes
//! drawn in the terminal. Everything is refused unless it is exactly the
//! message expected. Run `mor-signer help`.

use mor_airgap::device::{self, Choices, Config, DealPlan, Signer, Standing, BACKUP_NOTICE};
use mor_airgap::msg::{kind, Holder, Message, Role, Share};
use mor_airgap::seed::{Seed, SeedModule};
use mor_airgap::shares;
use mor_airgap::transport::{self, QrReceiver, QrSender};
use mor_core::hash::sha256;
use rand_core::OsRng;
use std::io::{BufRead, Write};
use std::path::{Path, PathBuf};
use std::process::ExitCode;

const HELP: &str =
    "mor-signer — the offline safety-key signer (air-gapped safety key Module, draft 4)

PROTOTYPE, FOR TEST IDENTITIES. Keep this machine offline, always.

  mor-signer [--dir DIR] new words|hex [128s|128f]    a new safety seed; shows its backup
  mor-signer [--dir DIR] restore words|hex [128s|128f] a seed from its backup, read from input
  mor-signer [--dir DIR] seeds                        the seeds this device holds
  mor-signer [--dir DIR] export OUT [--seed N]        the commitment for a genesis (key 0)
  mor-signer [--dir DIR] sign PENDING OUT [options]   review and sign a pending rotation
      --clean-device                 generate the new signing key here (section 4)
      --fresh-seed words|hex [128s|128f]   take the next key from a new seed (rule 3.3)
  mor-signer qr FILE [--frames N]                     show a message as animated QR codes
  mor-signer scan commitment|pending|signed|share OUT read QR frames, one per line, from input
  mor-signer check-share SHARE                        a member checks their own share
  mor-signer rebuild-check SHARE...                   rebuild a dealt key, compare, forget
  mor-signer deal-genesis K OUTDIR HOLDER...          a collective's first key, dealt as shares
  mor-signer [--dir DIR] sign-collective PENDING OUT OUTDIR K HOLDER... --share FILE...
      HOLDER is member:HEX, custodian:HEX or escrow[:HEX] (an identity hash)

The state (seeds and the memory of what was signed) is DIR/state.cbor, default ./mor-signer.
It holds the seeds unencrypted: keep it on this offline machine only, on an encrypted disk.
";

fn config() -> Config {
    // Test values until the freeze fixes the MIPs' hashes.
    Config {
        identity_spec: sha256(b"IDENTITY, test value until the freeze"),
        finance_spec: Some(sha256(b"FINANCE, test value until the freeze")),
    }
}

fn fail(s: impl std::fmt::Display) -> ! {
    eprintln!("refused: {s}");
    std::process::exit(1)
}

fn ask(prompt: &str) -> String {
    eprint!("{prompt}");
    std::io::stderr().flush().ok();
    let mut line = String::new();
    std::io::stdin().lock().read_line(&mut line).ok();
    line.trim().to_string()
}

fn state_path(dir: &Path) -> PathBuf {
    dir.join("state.cbor")
}

fn load(dir: &Path) -> Signer {
    match std::fs::read(state_path(dir)) {
        Ok(b) => {
            Signer::from_bytes(config(), &b).unwrap_or_else(|| fail("the state file is damaged"))
        }
        Err(_) => Signer::new(config()),
    }
}

fn save(dir: &Path, s: &Signer) {
    std::fs::create_dir_all(dir).unwrap_or_else(|e| fail(e));
    let tmp = dir.join("state.cbor.new");
    std::fs::write(&tmp, s.to_bytes()).unwrap_or_else(|e| fail(e));
    std::fs::rename(&tmp, state_path(dir)).unwrap_or_else(|e| fail(e));
}

fn module(s: &str) -> SeedModule {
    SeedModule::from_name(s)
        .unwrap_or_else(|| fail(format!("no seed Module called {s:?}: words or hex")))
}

fn scheme(s: Option<&String>) -> u8 {
    match s.map(String::as_str) {
        None | Some("128s") => 2,
        Some("128f") => 3,
        Some(x) => fail(format!("no safety scheme {x:?}: 128s or 128f")),
    }
}

fn show_backup(seed: &Seed) {
    println!(
        "\nSAFETY SEED BACKUP ({} Module). Write it down, in order:\n",
        seed.module.name()
    );
    match seed.module {
        SeedModule::Words => {
            for (i, w) in seed.backup().split(' ').enumerate() {
                println!("  {:>2}. {w}", i + 1);
            }
        }
        SeedModule::Hex => {
            for line in seed.backup().split(' ').collect::<Vec<_>>().chunks(6) {
                println!("  {}", line.join(" "));
            }
        }
    }
    println!("\n{BACKUP_NOTICE}\n");
    if ask("Type WRITTEN once the backup is on paper: ") != "WRITTEN" {
        fail("the backup was not confirmed; nothing was saved");
    }
}

fn holder(s: &str) -> Holder {
    let (role, id) = s
        .split_once(':')
        .map(|(r, i)| (r, Some(i)))
        .unwrap_or((s, None));
    let role = match role {
        "member" => Role::Member,
        "custodian" => Role::Custodian,
        "escrow" => Role::Escrow,
        _ => fail(format!(
            "a holder is member:HEX, custodian:HEX or escrow[:HEX], not {s:?}"
        )),
    };
    let identity = id.map(|h| {
        let b: Vec<u8> = (0..h.len())
            .step_by(2)
            .map(|i| {
                u8::from_str_radix(h.get(i..i + 2).unwrap_or("x"), 16)
                    .unwrap_or_else(|_| fail("not hexadecimal"))
            })
            .collect();
        b.try_into()
            .unwrap_or_else(|_| fail("an identity hash is 32 bytes"))
    });
    if role != Role::Escrow && identity.is_none() {
        fail("a member or custodian is named by identity hash");
    }
    Holder { role, identity }
}

fn read_share(p: &str) -> Share {
    match transport::read_file(Path::new(p), kind::SHARE) {
        Ok(Message::Share(s)) => s,
        Ok(_) => unreachable!(),
        Err(e) => fail(format!("{p}: {e}")),
    }
}

fn write_shares(dir: &Path, shares: &[Share]) {
    std::fs::create_dir_all(dir).unwrap_or_else(|e| fail(e));
    for s in shares {
        let p = dir.join(format!("share-{}.mor", s.x));
        transport::write_file(&p, &Message::Share(s.clone())).unwrap_or_else(|e| fail(e));
        println!("  share {} → {}", s.x, p.display());
    }
    if let Some(s) = shares.first() {
        println!(
            "\nDealing fingerprint (every holder compares it with every other): {}",
            hex(&s.dealing.fingerprint())
        );
    }
}

fn hex(b: &[u8]) -> String {
    b.iter().map(|x| format!("{x:02x}")).collect()
}

fn show_qr(m: &Message, frames: Option<usize>) {
    let mut s = QrSender::new(m, transport::FRAGMENT);
    let n = frames.unwrap_or(usize::MAX);
    eprintln!(
        "{} fragments; showing frames until interrupted (Ctrl-C).",
        s.fragments()
    );
    for i in 0..n {
        let f = s.next_frame();
        println!("\x1b[2J\x1b[H{}frame {}", transport::qr_text(&f), i + 1);
        std::io::stdout().flush().ok();
        std::thread::sleep(std::time::Duration::from_millis(250));
    }
}

fn main() -> ExitCode {
    let mut args: Vec<String> = std::env::args().skip(1).collect();
    let mut dir = PathBuf::from("mor-signer");
    if args.first().map(String::as_str) == Some("--dir") {
        if args.len() < 2 {
            fail("--dir needs a directory");
        }
        dir = PathBuf::from(args.remove(1));
        args.remove(0);
    }
    let flag = |args: &mut Vec<String>, f: &str| -> bool {
        if let Some(i) = args.iter().position(|a| a == f) {
            args.remove(i);
            true
        } else {
            false
        }
    };
    let option = |args: &mut Vec<String>, f: &str, n: usize| -> Option<Vec<String>> {
        let i = args.iter().position(|a| a == f)?;
        let taken: Vec<String> = args.drain(i..(i + 1 + n).min(args.len())).skip(1).collect();
        Some(taken)
    };
    let cmd = if args.is_empty() {
        "help".to_string()
    } else {
        args.remove(0)
    };
    let mut rng = OsRng;
    match cmd.as_str() {
        "new" | "restore" => {
            let Some(m) = args.first() else {
                fail("words or hex")
            };
            let (m, sc) = (module(m), scheme(args.get(1)));
            let mut s = load(&dir);
            let seed = if cmd == "new" {
                let seed = s.new_seed(m, sc, &mut rng);
                show_backup(&seed);
                seed
            } else {
                let mut written = String::new();
                for line in std::io::stdin().lock().lines() {
                    written.push_str(&line.unwrap_or_default());
                    written.push(' ');
                }
                let seed = Seed::restore(m, &written).unwrap_or_else(|e| fail(e));
                s.add_seed(seed.clone(), sc, 0);
                seed
            };
            save(&dir, &s);
            println!(
                "Seed {} held ({} Module).",
                s.seeds.len() - 1,
                seed.module.name()
            );
            if cmd == "restore" {
                println!("Note: the memory of what the lost device signed is not in the backup (rule 3.4 starts afresh).");
            }
        }
        "seeds" => {
            let s = load(&dir);
            for (i, x) in s.seeds.iter().enumerate() {
                println!(
                    "{i}: {} Module, scheme {}, keys from index {}, seed id {}",
                    x.seed.module.name(),
                    if x.scheme == 2 { "128s" } else { "128f" },
                    x.from_index,
                    hex(&x.seed.id()[..8])
                );
            }
            println!("{} key(s) used to sign rotations.", s.memory.len());
        }
        "export" => {
            let n = option(&mut args, "--seed", 1)
                .and_then(|v| v.first().and_then(|x| x.parse().ok()))
                .unwrap_or(0usize);
            let qr = flag(&mut args, "--qr");
            let Some(out) = args.first() else {
                fail("export OUT")
            };
            let s = load(&dir);
            if n >= s.seeds.len() {
                fail("no such seed: run `new` first");
            }
            let m = s.export_commitment(n, 0);
            transport::write_file(Path::new(out), &m).unwrap_or_else(|e| fail(e));
            println!("Commitment to key 0 written to {out}.");
            if qr {
                show_qr(&m, None);
            }
        }
        "sign" => {
            let clean = flag(&mut args, "--clean-device");
            let qr = flag(&mut args, "--qr");
            let fresh = option(&mut args, "--fresh-seed", 2).map(|v| {
                let sc = v.get(1).filter(|x| x.starts_with("128"));
                if sc.is_none() && v.len() == 2 {
                    args.insert(0, v[1].clone());
                }
                (module(&v[0]), scheme(sc))
            });
            let [pending, out] = args.as_slice() else {
                fail("sign PENDING OUT")
            };
            let mut s = load(&dir);
            let bytes = std::fs::read(pending).unwrap_or_else(|e| fail(e));
            let choices = Choices {
                fresh_seed: fresh,
                next_scheme: None,
                clean_device: clean,
            };
            let review = s
                .review(&bytes, &choices, &mut rng)
                .unwrap_or_else(|e| fail(e));
            println!("{}", review.summary);
            let confirmed = match &review.standing {
                Standing::Exception(e) => {
                    println!("EXCEPTION: {e}");
                    ask("Type I CONFIRM THE EXCEPTION to allow it: ") == "I CONFIRM THE EXCEPTION"
                }
                _ => true,
            };
            if let Some(seed) = &review.new_seed {
                show_backup(seed);
            }
            if ask("Type SIGN to sign exactly this: ") != "SIGN" {
                fail("not signed");
            }
            let signed = s
                .sign(review, confirmed, &mut rng)
                .unwrap_or_else(|e| fail(e));
            save(&dir, &s);
            let m = Message::SignedRotation(signed.message);
            transport::write_file(Path::new(out), &m).unwrap_or_else(|e| fail(e));
            println!("Signed rotation {} written to {out}.", hex(&signed.act_id));
            if clean {
                println!("It carries the new signing key: load it onto a clean everyday device only, and back it up there.");
            }
            if qr {
                show_qr(&m, None);
            }
        }
        "qr" => {
            let frames = option(&mut args, "--frames", 1)
                .and_then(|v| v.first().and_then(|x| x.parse().ok()));
            let Some(f) = args.first() else {
                fail("qr FILE")
            };
            let bytes = std::fs::read(f).unwrap_or_else(|e| fail(e));
            let m = Message::decode(&bytes).unwrap_or_else(|e| fail(e));
            show_qr(&m, frames);
        }
        "scan" => {
            let [k, out] = args.as_slice() else {
                fail("scan KIND OUT")
            };
            let k = match k.as_str() {
                "commitment" => kind::COMMITMENT_EXPORT,
                "pending" => kind::PENDING_ROTATION,
                "signed" => kind::SIGNED_ROTATION,
                "share" => kind::SHARE,
                _ => fail("commitment, pending, signed or share"),
            };
            let mut r = QrReceiver::new(k);
            for line in std::io::stdin().lock().lines() {
                let line = line.unwrap_or_default();
                if line.trim().is_empty() {
                    continue;
                }
                if let Err(e) = r.receive(line.trim()) {
                    eprintln!("{e}");
                    continue;
                }
                let (a, b) = r.progress();
                eprintln!("{a} of {b} fragments");
                if r.complete() {
                    break;
                }
            }
            match r.message() {
                Some(Ok(m)) => {
                    transport::write_file(Path::new(out), &m).unwrap_or_else(|e| fail(e));
                    println!("Received; written to {out}.");
                }
                Some(Err(e)) => fail(e),
                None => fail("the sequence is incomplete"),
            }
        }
        "check-share" => {
            let Some(p) = args.first() else {
                fail("check-share SHARE")
            };
            let s = read_share(p);
            shares::verify_share(&s).unwrap_or_else(|e| fail(e));
            let h = s.dealing.holders[s.x as usize - 1];
            println!(
                "Share {} of {} is on the dealing's commitments.",
                s.x,
                s.dealing.holders.len()
            );
            println!(
                "Held as: {:?} {}",
                h.role,
                h.identity.map(|i| hex(&i)).unwrap_or_default()
            );
            println!("Any {} shares rebuild the key.", s.dealing.threshold);
            println!(
                "Dealing fingerprint — compare it with every other holder: {}",
                hex(&s.dealing.fingerprint())
            );
        }
        "rebuild-check" => {
            let shares: Vec<Share> = args.iter().map(|p| read_share(p)).collect();
            let c = shares::rebuild_check(&shares).unwrap_or_else(|e| fail(e));
            println!(
                "The shares rebuild the committed key {}. It has been forgotten.",
                hex(&c)
            );
            println!("This device held the key for a moment: that cannot be checked.");
        }
        "deal-genesis" | "sign-collective" => {
            let mut files = vec![];
            while let Some(v) = option(&mut args, "--share", 1) {
                files.extend(v);
            }
            let (head, rest) = if cmd == "deal-genesis" {
                (2, &args[..])
            } else {
                (4, &args[..])
            };
            if rest.len() < head + 1 {
                fail("see `mor-signer help`");
            }
            let k: u64 = rest[head - 2]
                .parse()
                .unwrap_or_else(|_| fail("K is a number"));
            let outdir = PathBuf::from(&rest[head - 1]);
            let holders: Vec<Holder> = rest[head..].iter().map(|h| holder(h)).collect();
            if k < 1 || k as usize > holders.len() {
                fail("1 ≤ K ≤ the number of holders");
            }
            let plan = DealPlan {
                seed_module: SeedModule::Words,
                scheme: 2,
                threshold: k,
                holders,
            };
            if cmd == "deal-genesis" {
                let (export, dealt) = device::deal_genesis(&plan, &mut rng);
                std::fs::create_dir_all(&outdir).unwrap_or_else(|e| fail(e));
                let p = outdir.join("commitment.mor");
                transport::write_file(&p, &export).unwrap_or_else(|e| fail(e));
                println!("Commitment for the collective's genesis → {}", p.display());
                write_shares(&outdir, &dealt);
                println!("\nNow: every holder runs check-share; then {k} of them bring their shares to a SECOND offline device for rebuild-check.");
            } else {
                let (pending, out) = (&rest[0], &rest[1]);
                let shares: Vec<Share> = files.iter().map(|p| read_share(p)).collect();
                let s = load(&dir);
                let bytes = std::fs::read(pending).unwrap_or_else(|e| fail(e));
                let review = s
                    .review_collective(&bytes, &shares, &plan, &mut rng)
                    .unwrap_or_else(|e| fail(e));
                println!("{}", review.summary);
                if ask("Type SIGN to sign exactly this: ") != "SIGN" {
                    fail("not signed");
                }
                let new_shares = review.new_shares.clone();
                let mut s = s;
                let signed = s.sign(review, false, &mut rng).unwrap_or_else(|e| fail(e));
                save(&dir, &s);
                transport::write_file(Path::new(out), &Message::SignedRotation(signed.message))
                    .unwrap_or_else(|e| fail(e));
                println!(
                    "Signed rotation {} written to {out}. The next key's shares:",
                    hex(&signed.act_id)
                );
                write_shares(&outdir, &new_shares);
            }
        }
        _ => {
            print!("{HELP}");
        }
    }
    ExitCode::SUCCESS
}
