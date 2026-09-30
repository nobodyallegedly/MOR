// Composing canonical text (Text MIP, rule 6): what a client does to the
// user's text before it goes into an act, so no one meets a rejection for
// invisible reasons. The verifier's check is the core library's, with the
// pinned Unicode tables; this uses the system's, which is enough to compose.

const SPACE = '[ \u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]';
const TRAILING = new RegExp(`${SPACE}+$`, 'gmu');
const TRAILING_END = new RegExp(`(?:${SPACE}|\n)+$`, 'u');
// Controls other than LF (TAB is replaced first), and noncharacters.
const CONTROL = /[\u0000-\u0009\u000B-\u001F\u007F-\u009F]/gu;
const NONCHAR = /[\uFDD0-\uFDEF\uFFFE\uFFFF\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/gu;

/** Normalize text as a composing client should, saying what changed. */
export function compose(raw: string): { text: string; changes: string[] } {
  const changes: string[] = [];
  let t = raw;
  const step = (next: string, what: string) => {
    if (next !== t) changes.push(what);
    t = next;
  };
  step(t.replace(/\r\n?|[\u2028\u2029]/g, '\n'), 'line breaks converted to LF');
  step(t.replace(/\uFEFF/g, ''), 'byte order marks removed');
  step(t.replace(/\t/g, '    '), 'tabs replaced with four spaces');
  step(t.replace(CONTROL, ''), 'control characters removed');
  step(t.replace(NONCHAR, ''), 'noncharacters removed');
  step(t.normalize('NFC'), 'normalized to NFC');
  step(t.replace(TRAILING, ''), 'trailing spaces removed');
  step(t.replace(TRAILING_END, ''), 'final line breaks removed');
  return { text: t, changes };
}
