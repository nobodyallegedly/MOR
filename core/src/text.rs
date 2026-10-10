//! Canonical text (Text MIP, "Canonical text").
//!
//! Every text field of every act is canonical text. A verifier checks rules
//! 1 to 5 exactly, and rule 6 (NFC) with the tables of the pinned Unicode
//! version, never with whatever version its system happens to have (Text,
//! validity rule 2). The pinned version is Unicode 17.0 as of Text draft 5;
//! the tables come from `unicode-normalization`, pinned to a release that
//! carries exactly that version, and checked at compile time below.

use crate::cbor::Value;
use std::fmt;
use unicode_normalization::UnicodeNormalization;

/// The Unicode version whose normalization tables every verifier uses.
pub const PINNED_UNICODE_VERSION: (u8, u8, u8) = (17, 0, 0);

const _: () = {
    let v = unicode_normalization::UNICODE_VERSION;
    assert!(
        v.0 == PINNED_UNICODE_VERSION.0
            && v.1 == PINNED_UNICODE_VERSION.1
            && v.2 == PINNED_UNICODE_VERSION.2,
        "the normalization tables are not the pinned Unicode version"
    );
};

/// Which rule of canonical text a string breaks, and where: the byte offset
/// of the offending character in the UTF-8 string.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum TextError {
    /// Rule 1: U+FEFF appears.
    ByteOrderMark { at: usize },
    /// Rule 2: CR, U+2028 or U+2029 appears.
    LineBreak { at: usize },
    /// Rule 3: a control character other than LF (U+0000 to U+001F, U+007F to U+009F).
    Control { at: usize },
    /// Rule 4: a line ends with a space character (the fixed list).
    TrailingSpace { at: usize },
    /// Rule 4: the text ends with LF.
    FinalLineBreak { at: usize },
    /// Rule 5: one of the 66 noncharacters.
    Noncharacter { at: usize },
    /// Rule 6: the text is not in NFC under the pinned tables.
    NotNfc,
}

impl TextError {
    /// The rule number in the Text MIP.
    pub fn rule(&self) -> u8 {
        match self {
            TextError::ByteOrderMark { .. } => 1,
            TextError::LineBreak { .. } => 2,
            TextError::Control { .. } => 3,
            TextError::TrailingSpace { .. } | TextError::FinalLineBreak { .. } => 4,
            TextError::Noncharacter { .. } => 5,
            TextError::NotNfc => 6,
        }
    }
}

impl fmt::Display for TextError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            TextError::ByteOrderMark { at } => write!(f, "rule 1: U+FEFF at byte {at}"),
            TextError::LineBreak { at } => {
                write!(f, "rule 2: a line break other than LF at byte {at}")
            }
            TextError::Control { at } => write!(f, "rule 3: a control character at byte {at}"),
            TextError::TrailingSpace { at } => write!(f, "rule 4: a trailing space at byte {at}"),
            TextError::FinalLineBreak { at } => {
                write!(f, "rule 4: a final line break at byte {at}")
            }
            TextError::Noncharacter { at } => write!(f, "rule 5: a noncharacter at byte {at}"),
            TextError::NotNfc => write!(f, "rule 6: not in NFC (Unicode 17.0 tables)"),
        }
    }
}

impl std::error::Error for TextError {}

/// The space characters of rule 4. The list is fixed, so it cannot change with Unicode.
pub fn is_space(c: char) -> bool {
    matches!(
        c,
        '\u{0020}' | '\u{00A0}' | '\u{1680}' | '\u{2000}'
            ..='\u{200A}' | '\u{202F}' | '\u{205F}' | '\u{3000}'
    )
}

/// The 66 noncharacters: U+FDD0 to U+FDEF, and the last two code points of every plane.
pub fn is_noncharacter(c: char) -> bool {
    let u = c as u32;
    (0xFDD0..=0xFDEF).contains(&u) || (u & 0xFFFE) == 0xFFFE
}

/// Check that a string is canonical text. The empty string is canonical.
///
/// Rules 1 to 5 are checked character by character and the first failure is
/// reported; rule 6 is checked last, on a text that meets the others.
pub fn check(s: &str) -> Result<(), TextError> {
    let mut last: Option<(usize, char)> = None;
    for (at, c) in s.char_indices() {
        match c {
            '\u{FEFF}' => return Err(TextError::ByteOrderMark { at }),
            '\r' | '\u{2028}' | '\u{2029}' => return Err(TextError::LineBreak { at }),
            '\n' => {
                if let Some((p, pc)) = last {
                    if is_space(pc) {
                        return Err(TextError::TrailingSpace { at: p });
                    }
                }
            }
            '\u{0000}'..='\u{001F}' | '\u{007F}'..='\u{009F}' => {
                return Err(TextError::Control { at })
            }
            _ if is_noncharacter(c) => return Err(TextError::Noncharacter { at }),
            _ => {}
        }
        last = Some((at, c));
    }
    if let Some((at, c)) = last {
        if c == '\n' {
            return Err(TextError::FinalLineBreak { at });
        }
        if is_space(c) {
            return Err(TextError::TrailingSpace { at });
        }
    }
    if !is_nfc(s) {
        return Err(TextError::NotNfc);
    }
    Ok(())
}

/// Rule 6 alone: whether a string is in NFC under the pinned tables. A full
/// comparison with the normalized form, which is exactly what "in NFC" means,
/// with no reliance on quick-check tables.
pub fn is_nfc(s: &str) -> bool {
    s.chars().eq(s.nfc())
}

/// Whether a string is canonical text.
pub fn is_canonical(s: &str) -> bool {
    check(s).is_ok()
}

/// Check every text string inside a CBOR value, map keys included: every
/// `tstr` in an act is canonical text (Identity, "Encoding"; Envelopes rule 5).
pub fn check_value(v: &Value) -> Result<(), TextError> {
    match v {
        Value::Text(s) => check(s),
        Value::Array(items) => items.iter().try_for_each(check_value),
        Value::Map(entries) => entries.iter().try_for_each(|(k, v)| {
            check_value(k)?;
            check_value(v)
        }),
        Value::Tag(_, inner) => check_value(inner),
        _ => Ok(()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_rules() {
        assert_eq!(check(""), Ok(()));
        assert_eq!(check("Hello\n\nworld"), Ok(()));
        assert_eq!(check("\nleading line break is fine"), Ok(()));
        assert_eq!(check("caf\u{e9}"), Ok(()));
        assert_eq!(check("a\u{FEFF}b"), Err(TextError::ByteOrderMark { at: 1 }));
        assert_eq!(check("a\r\nb"), Err(TextError::LineBreak { at: 1 }));
        assert_eq!(check("a\u{2028}b"), Err(TextError::LineBreak { at: 1 }));
        assert_eq!(check("a\tb"), Err(TextError::Control { at: 1 }));
        assert_eq!(check("a\u{85}b"), Err(TextError::Control { at: 1 }));
        assert_eq!(check("a\u{7f}"), Err(TextError::Control { at: 1 }));
        assert_eq!(check("a \nb"), Err(TextError::TrailingSpace { at: 1 }));
        assert_eq!(check("a\u{3000}"), Err(TextError::TrailingSpace { at: 1 }));
        assert_eq!(check(" "), Err(TextError::TrailingSpace { at: 0 }));
        assert_eq!(check("a\n"), Err(TextError::FinalLineBreak { at: 1 }));
        assert_eq!(check("\n"), Err(TextError::FinalLineBreak { at: 0 }));
        assert_eq!(check("a\u{FDD0}"), Err(TextError::Noncharacter { at: 1 }));
        assert_eq!(check("\u{10FFFF}"), Err(TextError::Noncharacter { at: 0 }));
        assert_eq!(check("\u{1FFFE}"), Err(TextError::Noncharacter { at: 0 }));
        assert_eq!(check("cafe\u{301}"), Err(TextError::NotNfc));
        // A space not on the fixed list (U+200B, zero width) is not a trailing space.
        assert_eq!(check("a\u{200B}"), Ok(()));
        // Bidirectional controls are valid canonical text.
        assert_eq!(check("a\u{202E}b\u{2066}c"), Ok(()));
        // A space inside a line, and on an otherwise empty line's neighbours, is fine.
        assert_eq!(check("a b\nc"), Ok(()));
    }

    #[test]
    fn exactly_66_noncharacters() {
        let n = (0..=0x10FFFFu32)
            .filter_map(char::from_u32)
            .filter(|c| is_noncharacter(*c))
            .count();
        assert_eq!(n, 66);
    }

    #[test]
    fn text_inside_values() {
        let good = Value::Map(vec![(
            Value::Text("k".into()),
            Value::Array(vec![Value::Text("v".into())]),
        )]);
        assert_eq!(check_value(&good), Ok(()));
        let bad_key = Value::Map(vec![(Value::Text("k ".into()), Value::Uint(1))]);
        assert_eq!(
            check_value(&bad_key),
            Err(TextError::TrailingSpace { at: 1 })
        );
    }
}
