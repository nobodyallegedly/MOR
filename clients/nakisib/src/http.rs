//! The smallest HTTP server the page needs, on the loopback address only:
//! one request per connection, read, answered, closed. A request is
//! answered only if it is addressed to 127.0.0.1 at Nakišib's port (no other
//! name, so a page elsewhere cannot rebind a name to it), and an operation
//! only if it carries Nakišib's own header (which a page of another origin
//! cannot send without asking first, and Nakišib never answers that ask).
//! Every body, asked and answered, is overwritten once used: words travel
//! through here.

use crate::sitting::scrub_bytes;
use serde_json::Value as Json;
use std::io::{Read, Write};
use std::net::TcpStream;

/// The header every operation carries, set by Nakišib's page.
pub const HEADER: &str = "x-nakisib";

/// A request's body may not be larger than this (words, a path): 64 KiB.
const MAX_BODY: usize = 64 * 1024;

pub struct Request {
    pub method: String,
    pub path: String,
    pub body: Vec<u8>,
}

pub struct Answer {
    status: u16,
    kind: &'static str,
    body: Vec<u8>,
    end: bool,
}

impl Answer {
    pub fn asset(kind: &'static str, body: &[u8]) -> Answer {
        Answer { status: 200, kind, body: body.to_vec(), end: false }
    }
    pub fn json(v: &Json) -> Answer {
        Answer { status: 200, kind: "application/json", body: serde_json::to_vec(v).unwrap_or_default(), end: false }
    }
    pub fn error(e: &str) -> Answer {
        Answer { status: 400, kind: "application/json", body: serde_json::to_vec(&serde_json::json!({ "error": e })).unwrap_or_default(), end: false }
    }
    pub fn not_found() -> Answer {
        Answer { status: 404, kind: "text/plain; charset=utf-8", body: b"not here".to_vec(), end: false }
    }
    fn refused() -> Answer {
        Answer { status: 403, kind: "text/plain; charset=utf-8", body: b"refused".to_vec(), end: false }
    }
    pub fn ending(mut self) -> Answer {
        self.end = true;
        self
    }
}

fn header<'a>(head: &'a str, name: &str) -> Option<&'a str> {
    head.lines().skip(1).find_map(|l| {
        let (k, v) = l.split_once(':')?;
        k.trim().eq_ignore_ascii_case(name).then(|| v.trim())
    })
}

/// Serve one connection. Returns whether Nakišib should end (Quit).
pub fn serve(mut s: TcpStream, port: u16, handle: impl FnOnce(Request) -> Answer) -> bool {
    let mut buf = Vec::new();
    let mut chunk = [0u8; 4096];
    let head_end = loop {
        if let Some(i) = buf.windows(4).position(|w| w == b"\r\n\r\n") {
            break i;
        }
        if buf.len() > 16 * 1024 {
            return false;
        }
        match s.read(&mut chunk) {
            Ok(0) | Err(_) => return false,
            Ok(n) => buf.extend_from_slice(&chunk[..n]),
        }
    };
    let head = String::from_utf8_lossy(&buf[..head_end]).to_string();
    let mut first = head.lines().next().unwrap_or("").split(' ');
    let method = first.next().unwrap_or("").to_string();
    let path = first.next().unwrap_or("").split('?').next().unwrap_or("").to_string();
    let own = format!("127.0.0.1:{port}");
    let answer = if header(&head, "host") != Some(own.as_str()) {
        Answer::refused()
    } else if method == "GET" {
        handle(Request { method, path, body: vec![] })
    } else if method == "POST" && path.starts_with("/api/") {
        let origin_ok = matches!(header(&head, "origin"), None | Some("null")) || header(&head, "origin") == Some(format!("http://{own}").as_str());
        if header(&head, HEADER) != Some("1") || !origin_ok {
            Answer::refused()
        } else {
            let len: usize = header(&head, "content-length").and_then(|l| l.parse().ok()).unwrap_or(0);
            if len > MAX_BODY {
                Answer::error("Too large.")
            } else {
                let mut body = buf[head_end + 4..].to_vec();
                while body.len() < len {
                    match s.read(&mut chunk) {
                        Ok(0) | Err(_) => break,
                        Ok(n) => body.extend_from_slice(&chunk[..n]),
                    }
                }
                body.truncate(len);
                scrub_bytes(&mut chunk);
                scrub_bytes(&mut buf);
                let a = handle(Request { method, path, body: body.clone() });
                scrub_bytes(&mut body);
                a
            }
        }
    } else {
        Answer::refused()
    };
    scrub_bytes(&mut buf);
    let reason = match answer.status {
        200 => "OK",
        400 => "Bad Request",
        403 => "Forbidden",
        _ => "Not Found",
    };
    let head = format!(
        "HTTP/1.1 {} {reason}\r\nContent-Type: {}\r\nContent-Length: {}\r\nContent-Security-Policy: {}\r\nX-Content-Type-Options: nosniff\r\nReferrer-Policy: no-referrer\r\nCache-Control: no-store\r\nCross-Origin-Resource-Policy: same-origin\r\nConnection: close\r\n\r\n",
        answer.status,
        answer.kind,
        answer.body.len(),
        crate::policy()
    );
    let mut out = head.into_bytes();
    out.extend_from_slice(&answer.body);
    let _ = s.write_all(&out);
    let _ = s.flush();
    let end = answer.end;
    let mut body = answer.body;
    scrub_bytes(&mut body);
    scrub_bytes(&mut out);
    end
}
