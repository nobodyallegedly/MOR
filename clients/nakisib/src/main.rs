//! Nakišib (𒎎𒈩, "stone seal"; the reading is built, not attested): Kišib's
//! offline companion, for a Mac that never connects again. The air-gapped
//! chain-key signer Module (`modules/airgap`, draft 6) with a face.
//!
//! One program, no network: it serves its page on 127.0.0.1 only and opens
//! no other connection, ever (no request to a home, a relay, a font, an
//! update). On the Mac, Nakišib's window (`window/main.swift`, a web view
//! that keeps nothing on disk) starts this program and shows its page;
//! without the window, this program opens the page in the default browser.
//!
//!   nakisib [--dir DIR] [--port PORT] [--no-open]
//!
//! DIR is `~/mor-nakisib` by default: it holds `memory.cbor` alone, the
//! Module's memory of what was signed (rule 3.4), never a seed or a word.
//! TEST IDENTITIES ONLY, until MOR is frozen and the step 17 rehearsal.

mod http;
mod sitting;

use serde_json::{json, Value as Json};
use sitting::Nakisib;
use std::io::Read;
use std::net::{SocketAddr, TcpListener};
use std::path::{Path, PathBuf};
use std::process::{Command, ExitCode};
use std::sync::{Arc, Mutex};
use std::time::Duration;

/// Its port on this Mac, beside Kišib's 8474: a second start finds it taken
/// and only opens the window again.
pub const PORT: u16 = 8475;

/// The page, built from `src/page/` into `built/` (`npm run build`), carried inside the program.
const ASSETS: &[(&str, &str, &[u8])] = &[
    ("/", "text/html; charset=utf-8", include_bytes!("../built/index.html")),
    ("/nakisib.js", "text/javascript; charset=utf-8", include_bytes!("../built/nakisib.js")),
    ("/nakisib.css", "text/css; charset=utf-8", include_bytes!("../built/nakisib.css")),
    ("/atkinson_next.woff2", "font/woff2", include_bytes!("../built/atkinson_next.woff2")),
    ("/atkinson_next_license.txt", "text/plain; charset=utf-8", include_bytes!("../built/atkinson_next_license.txt")),
    ("/atkinson_mono.woff2", "font/woff2", include_bytes!("../built/atkinson_mono.woff2")),
    ("/atkinson_mono_license.txt", "text/plain; charset=utf-8", include_bytes!("../built/atkinson_mono_license.txt")),
    ("/gentium_book_plus_italic.woff2", "font/woff2", include_bytes!("../built/gentium_book_plus_italic.woff2")),
    ("/gentium_book_plus_license.txt", "text/plain; charset=utf-8", include_bytes!("../built/gentium_book_plus_license.txt")),
    ("/icon.png", "image/png", include_bytes!("../built/icon.png")),
];

/// The page may load from its own origin only, and send nowhere else.
const POLICY: &str = "default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";

/// A message for a refused file: the Module's limit (rule 3.6), plus one byte to see it exceeded.
const MAX_FILE: u64 = 256 * 1024 + 1;

fn fail(s: impl std::fmt::Display) -> ! {
    eprintln!("nakisib: {s}");
    std::process::exit(1)
}

fn main() -> ExitCode {
    let mut args: Vec<String> = std::env::args().skip(1).collect();
    let mut take = |f: &str| -> Option<String> {
        let i = args.iter().position(|a| a == f)?;
        args.remove(i);
        (i < args.len()).then(|| args.remove(i))
    };
    let dir = take("--dir").map(PathBuf::from).unwrap_or_else(|| {
        PathBuf::from(std::env::var_os("HOME").unwrap_or_else(|| fail("no HOME"))).join("mor-nakisib")
    });
    let port: u16 = take("--port").map(|p| p.parse().unwrap_or_else(|_| fail("--port is a number"))).unwrap_or(PORT);
    let open = !args.iter().any(|a| a == "--no-open");
    if args.iter().any(|a| a == "--version") {
        println!("nakisib {}", env!("CARGO_PKG_VERSION"));
        return ExitCode::SUCCESS;
    }
    if args.iter().any(|a| a == "help" || a == "--help") {
        println!("nakisib [--dir DIR] [--port PORT] [--no-open]\n\nKišib's offline companion. {}", sitting::NEVER_CONNECT);
        return ExitCode::SUCCESS;
    }

    // The loopback address only: nothing else on any network can reach it.
    let listener = match TcpListener::bind(SocketAddr::from(([127, 0, 0, 1], port))) {
        Ok(l) => l,
        Err(e) if e.kind() == std::io::ErrorKind::AddrInUse && port == PORT => {
            // Already open: its page again (said first, for Nakišib's window).
            let base = format!("http://127.0.0.1:{port}/");
            println!("nakisib: {base} (already open)");
            if open {
                show(&base);
            }
            return ExitCode::SUCCESS;
        }
        Err(e) => fail(format!("cannot listen on 127.0.0.1:{port}: {e}")),
    };
    let port = listener.local_addr().map(|a| a.port()).unwrap_or(port);
    let base = format!("http://127.0.0.1:{port}/");
    println!("nakisib: {base} (folder {})", dir.display());
    let app = Arc::new(Mutex::new(Nakisib::new(dir)));

    if open {
        show(&base);
    }

    listener.set_nonblocking(true).unwrap_or_else(|e| fail(e));
    loop {
        match listener.accept() {
            Ok((stream, peer)) => {
                if !peer.ip().is_loopback() {
                    continue;
                }
                let _ = stream.set_nonblocking(false);
                let _ = stream.set_read_timeout(Some(Duration::from_secs(30)));
                let mut a = app.lock().unwrap_or_else(|p| p.into_inner());
                let quit = http::serve(stream, port, |req| handle(&mut a, req));
                if quit {
                    a.forget();
                    return ExitCode::SUCCESS;
                }
            }
            Err(e) if e.kind() == std::io::ErrorKind::WouldBlock => {
                app.lock().unwrap_or_else(|p| p.into_inner()).expire();
                std::thread::sleep(Duration::from_millis(50));
            }
            Err(_) => std::thread::sleep(Duration::from_millis(50)),
        }
    }
}

/// Open the page in the default browser (where Nakišib's window does not
/// start this program). Opening a page on 127.0.0.1 is no network.
fn show(url: &str) {
    let r = if cfg!(target_os = "macos") { Command::new("open").arg(url).status() } else { Command::new("xdg-open").arg(url).status() };
    if r.is_err() {
        println!("Open {url} in a browser on this computer.");
    }
}

/// A file chosen in the Mac's own dialog (AppleScript, which comes with
/// macOS); `None` where there is no such dialog (the page then asks for a path).
fn choose(write: bool, name: &str) -> Result<Option<PathBuf>, String> {
    if !cfg!(target_os = "macos") {
        return Ok(None);
    }
    let script = if write {
        format!("POSIX path of (choose file name with prompt \"Where should Nakišib write it? (your USB stick)\" default name \"{name}\")")
    } else {
        "POSIX path of (choose file with prompt \"The request from Kišib (on your USB stick)\")".to_string()
    };
    let out = Command::new("osascript").arg("-e").arg("activate").arg("-e").arg(&script).output().map_err(|e| e.to_string())?;
    if !out.status.success() {
        return Err("Nothing was chosen.".into());
    }
    let p = String::from_utf8_lossy(&out.stdout).trim().to_string();
    Ok(Some(PathBuf::from(p)))
}

fn text(v: &Json, k: &str) -> String {
    v.get(k).and_then(Json::as_str).unwrap_or("").to_string()
}

fn read_file(p: &Path) -> Result<Vec<u8>, String> {
    let f = std::fs::File::open(p).map_err(|e| format!("{} could not be read: {e}", p.display()))?;
    let mut b = vec![];
    f.take(MAX_FILE).read_to_end(&mut b).map_err(|e| e.to_string())?;
    Ok(b)
}

fn path_of(v: &Json) -> Result<PathBuf, String> {
    let p = text(v, "path");
    if p.trim().is_empty() {
        return Err("Choose where, or type the file’s path.".into());
    }
    Ok(PathBuf::from(p.trim()))
}

/// One request from the page. Returns the answer, and whether to end.
fn handle(a: &mut Nakisib, req: http::Request) -> http::Answer {
    if req.method == "GET" {
        return match ASSETS.iter().find(|(p, _, _)| *p == req.path) {
            Some((_, kind, body)) => http::Answer::asset(kind, body),
            None => http::Answer::not_found(),
        };
    }
    let Some(op) = req.path.strip_prefix("/api/") else { return http::Answer::not_found() };
    let mut body: Json = serde_json::from_slice(&req.body).unwrap_or(json!({}));
    a.expire();
    a.touch();
    let r: Result<Json, String> = match op {
        "state" => Ok(a.state()),
        "forget" => Ok(a.forget()),
        "choose" => {
            let write = text(&body, "for") == "write";
            choose(write, &text(&body, "name")).map(|p| json!({ "path": p.map(|p| p.display().to_string()), "dialog": cfg!(target_os = "macos") }))
        }
        "read" => path_of(&body).and_then(|p| read_file(&p)).and_then(|b| a.read(b)),
        "paper" => match body.get_mut("words") {
            Some(Json::String(w)) => a.paper(w),
            _ => Err("Type the paper’s words.".into()),
        },
        "show" => a.show(),
        "hide" => a.hide(),
        "typed" => {
            let mut t: Vec<String> = body.get("typed").and_then(Json::as_array).map(|x| x.iter().map(|s| s.as_str().unwrap_or("").to_string()).collect()).unwrap_or_default();
            a.typed(&mut t)
        }
        "sign" => a.sign(&text(&body, "word")),
        "write" => path_of(&body).and_then(|p| a.write(&p)),
        "first" => a.first(&text(&body, "module")),
        "memory" => a.memory(),
        "again" => path_of(&body).and_then(|p| a.write_again(&text(&body, "act"), &p)),
        "same" => a.same_again(),
        "quit" => {
            sitting::scrub_json(&mut body);
            return http::Answer::json(&json!({ "quit": true })).ending();
        }
        _ => Err(format!("unknown operation {op}")),
    };
    sitting::scrub_json(&mut body);
    match r {
        Ok(v) => http::Answer::json(&v),
        Err(e) => http::Answer::error(&e),
    }
}

/// Headers every answer carries.
pub fn policy() -> &'static str {
    POLICY
}
