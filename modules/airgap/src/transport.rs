//! The two transports (Module, section 6). Both carry the same message
//! bytes, unchanged.
//!
//! - **Animated QR codes:** Blockchain Commons' Uniform Resources (UR),
//!   multi-part, with fountain codes, so that dropped frames are recovered
//!   from later ones. Each message kind has its own UR type, and a receiver
//!   accepts only the kind it expects. A UR carries a CRC-32 of the whole
//!   message, which catches accidents, not attacks: an attacker who swaps
//!   the whole sequence is caught by the device's own checks (rules 3.1,
//!   3.2) and by the online device's check of what comes back.
//! - **Files:** the message bytes and nothing else. A file larger than any
//!   message is rejected before it is read further.

use crate::msg::{kind, Message, MsgError, MAX_MESSAGE};
use qrcode::{EcLevel, QrCode};
use std::fmt;
use std::io::Read;
use std::path::Path;

/// The UR type of each message kind.
pub fn ur_type(k: u64) -> &'static str {
    match k {
        kind::COMMITMENT_EXPORT => "mor-commitment-export",
        kind::PENDING_ROTATION => "mor-pending-rotation",
        kind::SIGNED_ROTATION => "mor-signed-rotation",
        kind::SHARE => "mor-share",
        _ => unreachable!("a message kind"),
    }
}

/// The default fragment length, in bytes: small QR codes that older phone
/// cameras read reliably (about version 11 at error correction level M).
pub const FRAGMENT: usize = 120;

#[derive(Debug)]
pub enum TransportError {
    Message(MsgError),
    /// A frame that is not a UR part of the expected type, or a sequence
    /// whose parts do not fit together or fail their checksum.
    Frame(String),
    Io(std::io::Error),
}

impl fmt::Display for TransportError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            TransportError::Message(e) => write!(f, "{e}"),
            TransportError::Frame(e) => write!(f, "QR frame rejected: {e}"),
            TransportError::Io(e) => write!(f, "{e}"),
        }
    }
}

impl std::error::Error for TransportError {}

impl From<MsgError> for TransportError {
    fn from(e: MsgError) -> Self {
        TransportError::Message(e)
    }
}

impl From<std::io::Error> for TransportError {
    fn from(e: std::io::Error) -> Self {
        TransportError::Io(e)
    }
}

// ---------------------------------------------------------------- animated QR

/// Sends a message as an endless sequence of UR frames: first each fragment
/// once, then fountain-coded mixtures of them.
pub struct QrSender {
    encoder: ur::Encoder<'static>,
}

impl QrSender {
    pub fn new(m: &Message, fragment: usize) -> QrSender {
        let bytes = m.encode();
        QrSender {
            encoder: ur::Encoder::new(&bytes, fragment, ur_type(m.kind()))
                .expect("a message is never empty"),
        }
    }

    /// How many fragments the message is split into: the fewest frames a
    /// receiver can finish with.
    pub fn fragments(&self) -> usize {
        self.encoder.fragment_count()
    }

    /// The next frame, in upper case (QR alphanumeric mode is denser).
    pub fn next_frame(&mut self) -> String {
        self.encoder
            .next_part()
            .expect("encoding a part")
            .to_ascii_uppercase()
    }
}

/// Collects frames of one expected kind until the message is complete.
pub struct QrReceiver {
    decoder: ur::Decoder,
    expected: u64,
}

impl QrReceiver {
    pub fn new(expected: u64) -> QrReceiver {
        QrReceiver {
            decoder: ur::Decoder::default(),
            expected,
        }
    }

    /// Take one scanned frame. Frames of another UR type, malformed frames,
    /// and frames inconsistent with those already received are rejected.
    pub fn receive(&mut self, frame: &str) -> Result<(), TransportError> {
        let t = frame
            .to_ascii_lowercase()
            .strip_prefix("ur:")
            .and_then(|r| r.split('/').next().map(str::to_string))
            .ok_or_else(|| TransportError::Frame("not a UR".into()))?;
        if t != ur_type(self.expected) {
            return Err(TransportError::Frame(format!(
                "a frame of type {t}, not {}",
                ur_type(self.expected)
            )));
        }
        self.decoder
            .receive(frame)
            .map_err(|e| TransportError::Frame(format!("{e:?}")))
    }

    pub fn complete(&self) -> bool {
        self.decoder.complete()
    }

    /// Progress, as fragments resolved out of the total.
    pub fn progress(&self) -> (usize, usize) {
        (
            self.decoder.resolved_fragment_count().unwrap_or(0),
            self.decoder.fragment_count(),
        )
    }

    /// The message, once complete, decoded strictly as the kind expected.
    pub fn message(&self) -> Option<Result<Message, TransportError>> {
        match self.decoder.message() {
            Ok(Some(bytes)) => {
                Some(Message::decode_kind(&bytes, self.expected).map_err(Into::into))
            }
            Ok(None) => None,
            Err(e) => Some(Err(TransportError::Frame(format!("{e:?}")))),
        }
    }
}

/// One frame as a QR code, error correction level M.
pub fn qr_code(frame: &str) -> QrCode {
    QrCode::with_error_correction_level(frame.as_bytes(), EcLevel::M)
        .expect("a frame fits a QR code")
}

/// One frame as a QR code drawn in the terminal, two modules per character
/// row, with a quiet zone.
pub fn qr_text(frame: &str) -> String {
    let code = qr_code(frame);
    let w = code.width();
    let colors = code.to_colors();
    let dark = |x: isize, y: isize| -> bool {
        x >= 0
            && y >= 0
            && (x as usize) < w
            && (y as usize) < w
            && colors[y as usize * w + x as usize] == qrcode::Color::Dark
    };
    let q = 2isize;
    let mut out = String::new();
    let mut y = -q;
    while y < w as isize + q {
        for x in -q..w as isize + q {
            // Light on dark terminals: draw light modules as blocks.
            out.push(match (!dark(x, y), !dark(x, y + 1)) {
                (true, true) => '█',
                (true, false) => '▀',
                (false, true) => '▄',
                (false, false) => ' ',
            });
        }
        out.push('\n');
        y += 2;
    }
    out
}

// ---------------------------------------------------------------- files

/// Write a message to a file: its bytes, nothing else.
pub fn write_file(path: &Path, m: &Message) -> Result<(), TransportError> {
    std::fs::write(path, m.encode())?;
    Ok(())
}

/// Read a message of the expected kind from a file. Nothing in the file is
/// ever run; a file larger than any message is refused unread.
pub fn read_file(path: &Path, expected: u64) -> Result<Message, TransportError> {
    let f = std::fs::File::open(path)?;
    let mut bytes = Vec::new();
    f.take(MAX_MESSAGE as u64 + 1).read_to_end(&mut bytes)?;
    Ok(Message::decode_kind(&bytes, expected)?)
}
