// The long-form text format (cmips/cmip-long-form-draft-1.md): a strict
// subset of Markdown on top of canonical text (Text MIP, task 4).
//
// The parser never fails: every canonical text has exactly one reading, and
// whatever is not markup is text. Every node keeps the positions of the
// characters it shows, as offsets into the source, so that `shown()` can
// list them; every piece of markup it hides is recorded with the entry of
// the cMIP's markup declaration that hides it. So `checkBound()` can prove,
// for any text, what the Text MIP requires of a format: it hides only its
// own declared markup, the characters the cMIP declares, in the positions
// it declares them (F149, replacing F140's bound by Unicode category), it
// adds nothing, and it shows the rest in the order of the bytes (F82 M7,
// F102). A minus sign, a decimal point or a vowel sign is never markup, so
// never hidden.
//
// Offsets are in UTF-16 code units, as JavaScript strings count. Markup is
// ASCII only, so a split never falls inside a character.

/** A range of the source, `[from, to)`. */
export interface Span {
  from: number;
  to: number;
}

export type Inline =
  /** Characters shown as they are. */
  | { t: 'text'; span: Span }
  /** A line break inside a block: the LF at `at`, shown as a break. */
  | { t: 'break'; at: number }
  | { t: 'em' | 'strong'; children: Inline[] }
  /** A code span: its characters shown exactly, markup inside ignored. */
  | { t: 'code'; span: Span }
  /** An autolink: the address, shown in full, is also the target. */
  | { t: 'link'; href: string; span: Span };

export interface Item {
  /** The marker, shown as written: `-`, `*`, `+`, or a number and its dot. */
  marker: Span;
  children: Block[];
}

export type Block =
  | { t: 'heading'; level: number; children: Inline[] }
  | { t: 'paragraph'; children: Inline[] }
  | { t: 'quote'; children: Block[] }
  | { t: 'list'; ordered: boolean; items: Item[] }
  /** A code block: its label (what follows the opening fence) and lines, shown exactly. */
  | { t: 'code'; label: Span | null; lines: Span[] }
  | { t: 'rule' };

/**
 * The entries of the cMIP's markup declaration ("Markup declaration"): each
 * names the characters a rendering may hide and where. An LF needs no
 * entry of its own: it may be hidden only where a block ends.
 */
export type MarkRule =
  /** `#` signs, one to six, and one space, opening a heading line (rule 3). */
  | 'heading'
  /** A whole line of three or more `-`, or of three or more `*` (rule 4). */
  | 'rule'
  /** Three or more backticks opening a code block line (rule 2). */
  | 'fence-open'
  /** A whole line of backticks, at least as many as opened it (rule 2). */
  | 'fence-close'
  /** A `>`, and one space after it if there is one, opening a line (rule 5). */
  | 'quote'
  /** The one space after a list marker (rule 6). */
  | 'item'
  /** The spaces, as many as the marker and its space are wide, opening a list item's later line (rule 6). */
  | 'indent'
  /** A `\` before a character it escapes (rule 8). */
  | 'escape'
  /** A run of backticks opening or closing a code span on one line (rule 9). */
  | 'code-open'
  | 'code-close'
  /** The `<` and `>` around a link's address (rule 10). */
  | 'link-open'
  | 'link-close'
  /** A run of one to three `*`, opening or closing emphasis on one line (rule 11). */
  | 'em-open'
  | 'em-close';

/** Markup a reading hides: where, and the declaration entry that hides it. */
export interface Mark {
  rule: MarkRule;
  span: Span;
}

export interface Document {
  source: string;
  blocks: Block[];
  /** Every piece of markup the reading hides, but LFs (which end blocks). */
  marks: Mark[];
}

/** How deep quotes and lists may nest; deeper markers are text (rule 3). */
export const MAX_DEPTH = 16;

/** The only characters the format ever hides (the cMIP's markup characters). */
export const MARKUP = new Set(['\n', ' ', '#', '*', '>', '<', '`', '\\', '-']);

/** The characters each declaration entry may hide. */
export const DECLARED: Readonly<Record<MarkRule, string>> = {
  heading: '# ',
  rule: '-*',
  'fence-open': '`',
  'fence-close': '`',
  quote: '> ',
  item: ' ',
  indent: ' ',
  escape: '\\',
  'code-open': '`',
  'code-close': '`',
  'link-open': '<',
  'link-close': '>',
  'em-open': '*',
  'em-close': '*',
};

/**
 * The hidden characters that end a block (Text MIP, the Text format task,
 * F178 item 16; the cMIP's markup declaration): the LF, and only the LF.
 * Every other character this format hides is markup inside a block, or at
 * a block's start.
 */
export const ENDS_BLOCK = '\n';

/** Characters a backslash escapes (rule 8). */
const ESCAPABLE = new Set(['\\', '`', '*', '_', '#', '-', '+', '.', '>', '<', '[', ']', '(', ')', '!', '|', '~']);

/** The space characters of canonical text (Text MIP, rule 4 of canonical text). */
const SPACES = new Set([
  0x20, 0xa0, 0x1680, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200a,
  0x202f, 0x205f, 0x3000,
]);
const isSpace = (s: string, i: number): boolean => SPACES.has(s.charCodeAt(i));

/**
 * Is a link's closing `>`, at `i`, next to a digit (a character of category
 * N directly before or after it)? Then it is shown, not hidden: a
 * mathematical sign next to a digit lies under the Text MIP's floor
 * (F174 item 10, F178 item 17).
 */
export function linkCloseShown(s: string, i: number): boolean {
  return isDigit(charBefore(s, i)) || isDigit(charAt(s, i + 1));
}

/**
 * Is a link's opening `<`, at `i`, one the Text MIP's floor forbids hiding
 * (a mathematical sign directly after a digit)? Then it is shown, as text,
 * and the address is still the link (F182).
 */
export function linkOpenShown(s: string, i: number): boolean {
  return underFloor(s, i) !== null;
}

/** Link schemes shown as links (rule 9). */
const AUTOLINK = /^<((?:https?|mailto):[^ <>]+)>/;

// ---------------------------------------------------------------- blocks

export function parse(source: string): Document {
  const lines: Span[] = [];
  let start = 0;
  for (;;) {
    const lf = source.indexOf('\n', start);
    if (lf < 0) {
      lines.push({ from: start, to: source.length });
      break;
    }
    lines.push({ from: start, to: lf });
    start = lf + 1;
  }
  const p = new Parser(source);
  const blocks = p.blocks(lines, 0);
  return { source, blocks, marks: p.marks.sort((a, b) => a.span.from - b.span.from) };
}

const FENCE = /^(`{3,})([^`]*)$/;
const HEADING = /^(#{1,6}) (.+)$/;
const RULE = /^(?:-{3,}|\*{3,})$/;
const BULLET = /^([-*+]) /;
const ORDERED = /^([0-9]{1,9}\.) /;

class Parser {
  readonly marks: Mark[] = [];
  constructor(readonly s: string) {}

  mark(rule: MarkRule, from: number, to: number): void {
    if (to > from) this.marks.push({ rule, span: { from, to } });
  }

  text(l: Span): string {
    return this.s.slice(l.from, l.to);
  }

  /** The item marker a line starts with, if any, and its width including the space. */
  marker(l: Span): { kind: string; width: number; marker: Span } | null {
    const x = this.text(l);
    let m = BULLET.exec(x);
    if (m) return { kind: m[1], width: 2, marker: { from: l.from, to: l.from + 1 } };
    m = ORDERED.exec(x);
    if (m) return { kind: '.', width: m[1].length + 1, marker: { from: l.from, to: l.from + m[1].length } };
    return null;
  }

  /** Does this line open a block other than a paragraph (so it ends one)? */
  starts(l: Span, depth: number): boolean {
    const x = this.text(l);
    if (FENCE.test(x) || HEADING.test(x) || RULE.test(x)) return true;
    if (depth < MAX_DEPTH && (this.quoteOpens(l) || this.marker(l))) return true;
    return false;
  }

  /**
   * Does this line open a quote? A `>` opening it does, unless the Text
   * MIP's floor forbids hiding it (a mathematical sign directly before a
   * digit, `>5`): then it is shown as text, and the line is no quote
   * (F182).
   */
  quoteOpens(l: Span): boolean {
    return l.from < l.to && this.s[l.from] === '>' && underFloor(this.s, l.from) === null;
  }

  blocks(lines: Span[], depth: number): Block[] {
    const out: Block[] = [];
    let i = 0;
    while (i < lines.length) {
      const l = lines[i];
      const x = this.text(l);
      if (x === '') {
        i++;
        continue;
      }
      // Code block (rule 4).
      let m = FENCE.exec(x);
      if (m) {
        const n = m[1].length;
        const label = m[2] === '' ? null : { from: l.from + n, to: l.to };
        this.mark('fence-open', l.from, l.from + n);
        const body: Span[] = [];
        i++;
        while (i < lines.length) {
          const y = this.text(lines[i]);
          if (/^`+$/.test(y) && y.length >= n) {
            this.mark('fence-close', lines[i].from, lines[i].to);
            i++;
            break;
          }
          body.push(lines[i]);
          i++;
        }
        out.push({ t: 'code', label, lines: body });
        continue;
      }
      // Heading (rule 5).
      m = HEADING.exec(x);
      if (m) {
        const level = m[1].length;
        this.mark('heading', l.from, l.from + level + 1);
        out.push({ t: 'heading', level, children: this.inline({ from: l.from + level + 1, to: l.to }) });
        i++;
        continue;
      }
      // Rule line (rule 6).
      if (RULE.test(x)) {
        this.mark('rule', l.from, l.to);
        out.push({ t: 'rule' });
        i++;
        continue;
      }
      // Quote (rule 7).
      if (depth < MAX_DEPTH && this.quoteOpens(l)) {
        const inner: Span[] = [];
        while (i < lines.length && this.quoteOpens(lines[i])) {
          const q = lines[i];
          const skip = this.s[q.from + 1] === ' ' && q.from + 1 < q.to ? 2 : 1;
          this.mark('quote', q.from, q.from + skip);
          inner.push({ from: q.from + skip, to: q.to });
          i++;
        }
        out.push({ t: 'quote', children: this.blocks(inner, depth + 1) });
        continue;
      }
      // List (rule 8).
      const first = depth < MAX_DEPTH ? this.marker(l) : null;
      if (first) {
        const items: Item[] = [];
        while (i < lines.length) {
          const mk = this.marker(lines[i]);
          if (!mk || mk.kind !== first.kind) break;
          const w = mk.width;
          this.mark('item', lines[i].from + w - 1, lines[i].from + w);
          const body: Span[] = [{ from: lines[i].from + w, to: lines[i].to }];
          i++;
          // Continuation: lines indented by the marker's width; blank lines
          // only when an indented line follows them.
          const indent = ' '.repeat(w);
          while (i < lines.length) {
            const y = this.text(lines[i]);
            if (y.startsWith(indent)) {
              this.mark('indent', lines[i].from, lines[i].from + w);
              body.push({ from: lines[i].from + w, to: lines[i].to });
              i++;
              continue;
            }
            if (y === '') {
              let j = i;
              while (j < lines.length && this.text(lines[j]) === '') j++;
              if (j < lines.length && this.text(lines[j]).startsWith(indent)) {
                for (; i < j; i++) body.push({ from: lines[i].from, to: lines[i].to });
                continue;
              }
            }
            break;
          }
          items.push({ marker: mk.marker, children: this.blocks(body, depth + 1) });
          // The list goes on past blank lines to the next item of its kind.
          let j = i;
          while (j < lines.length && this.text(lines[j]) === '') j++;
          const next = j < lines.length ? this.marker(lines[j]) : null;
          if (!next || next.kind !== first.kind) break;
          i = j;
        }
        out.push({ t: 'list', ordered: first.kind === '.', items });
        continue;
      }
      // Paragraph (rule 10): up to a blank line or a line that opens another block.
      const children: Inline[] = [...this.inline(l)];
      i++;
      while (i < lines.length && this.text(lines[i]) !== '' && !this.starts(lines[i], depth)) {
        children.push({ t: 'break', at: lines[i - 1].to }, ...this.inline(lines[i]));
        i++;
      }
      out.push({ t: 'paragraph', children });
    }
    return out;
  }

  // -------------------------------------------------------------- inlines

  /**
   * The inline content of one line (rule 9). Where the Text MIP's floor
   * forbids hiding a piece of emphasis, code or link markup (a run of
   * hidden markup between two digits, `1*2*3`, `1`2`3`), that piece is
   * shown as text rather than the document refused (F175, F182): the line
   * is read again with it as text, until no hidden run lies between two
   * digits.
   */
  inline(l: Span): Inline[] {
    const literal = new Set<number>();
    for (;;) {
      const from = this.marks.length;
      const nodes = this.inlineOnce(l, literal);
      const at = this.betweenDigits(from);
      if (at === null) return nodes;
      this.marks.length = from;
      literal.add(at);
    }
  }

  /**
   * The first run of markup hidden since mark `from` that lies between two
   * digits, as the offset to read as text instead: an emphasis run, a code
   * span's or a link's opening sign. Null if none.
   */
  betweenDigits(from: number): number | null {
    const s = this.s;
    const ms = this.marks.slice(from).sort((a, b) => a.span.from - b.span.from);
    for (let i = 0; i < ms.length; ) {
      let j = i;
      while (j + 1 < ms.length && ms[j + 1].span.from === ms[j].span.to) j++;
      if (isDigit(charBefore(s, ms[i].span.from)) && isDigit(charAt(s, ms[j].span.to))) {
        const m = ms.slice(i, j + 1).find((x) => x.rule !== 'escape') ?? ms[i];
        if (m.rule === 'code-close') return [...ms].reverse().find((x) => x.rule === 'code-open' && x.span.from < m.span.from)!.span.from;
        if (m.rule === 'link-close') return s.lastIndexOf('<', m.span.from);
        return m.span.from;
      }
      i = j + 1;
    }
    return null;
  }

  /** One reading of a line's inline content, with the offsets in `literal` read as text. */
  inlineOnce(l: Span, literal: Set<number>): Inline[] {
    const s = this.s;
    type Tok =
      | { k: 'node'; node: Inline }
      | { k: 'delim'; span: Span; n: number; open: boolean; close: boolean; pair?: 'open' | 'close' };
    const toks: Tok[] = [];
    let run = -1; // start of pending text
    const flush = (end: number) => {
      if (run >= 0 && end > run) toks.push({ k: 'node', node: { t: 'text', span: { from: run, to: end } } });
      run = -1;
    };
    const lit = (at: number) => {
      if (run < 0) run = at;
    };
    let p = l.from;
    while (p < l.to) {
      const c = s[p];
      if (c === '\\' && p + 1 < l.to && ESCAPABLE.has(s[p + 1]) && !literal.has(p)) {
        flush(p);
        this.mark('escape', p, p + 1);
        run = p + 1; // the backslash is hidden, the character shown
        p += 2;
        continue;
      }
      if (c === '`') {
        let n = 0;
        while (p + n < l.to && s[p + n] === '`') n++;
        if (literal.has(p)) {
          lit(p);
          p += n;
          continue;
        }
        let q = p + n;
        let close = -1;
        while (q < l.to) {
          if (s[q] !== '`') {
            q++;
            continue;
          }
          let k = 0;
          while (q + k < l.to && s[q + k] === '`') k++;
          if (k === n) {
            close = q;
            break;
          }
          q += k;
        }
        if (close >= 0) {
          flush(p);
          this.mark('code-open', p, p + n);
          this.mark('code-close', close, close + n);
          toks.push({ k: 'node', node: { t: 'code', span: { from: p + n, to: close } } });
          p = close + n;
        } else {
          lit(p);
          p += n;
        }
        continue;
      }
      if (c === '<') {
        const m = literal.has(p) ? null : AUTOLINK.exec(s.slice(p, l.to));
        if (m) {
          const span = { from: p + 1, to: p + 1 + m[1].length };
          // The opening < after a digit is shown, as text (F182), as the
          // closing > next to one is (F178 item 17).
          if (linkOpenShown(s, p)) {
            lit(p);
            flush(p + 1);
          } else {
            flush(p);
            this.mark('link-open', p, p + 1);
          }
          toks.push({ k: 'node', node: { t: 'link', href: m[1], span } });
          p = span.to + 1;
          // The closing > next to a digit is shown, as text (F178 item 17).
          if (linkCloseShown(s, span.to)) lit(span.to);
          else this.mark('link-close', span.to, span.to + 1);
          continue;
        }
        lit(p);
        p++;
        continue;
      }
      if (c === '*') {
        let n = 0;
        while (p + n < l.to && s[p + n] === '*') n++;
        if (n > 3 || literal.has(p)) {
          lit(p);
          p += n;
          continue;
        }
        flush(p);
        const open = p + n < l.to && !isSpace(s, p + n);
        const close = p > l.from && !isSpace(s, p - 1);
        toks.push({ k: 'delim', span: { from: p, to: p + n }, n, open, close });
        p += n;
        continue;
      }
      lit(p);
      p++;
    }
    flush(l.to);

    // Pair the delimiters: a closer takes the nearest opener of its own
    // length; openers between the two stay text.
    const stack: number[] = [];
    toks.forEach((tk, idx) => {
      if (tk.k !== 'delim') return;
      if (tk.close) {
        for (let j = stack.length - 1; j >= 0; j--) {
          const o = toks[stack[j]] as Extract<Tok, { k: 'delim' }>;
          if (o.n === tk.n) {
            o.pair = 'open';
            tk.pair = 'close';
            stack.length = j;
            return;
          }
        }
      }
      if (tk.open) stack.push(idx);
    });
    // Unpaired openers left on the stack were never closed.
    for (const j of stack) delete (toks[j] as Extract<Tok, { k: 'delim' }>).pair;

    // Build the tree.
    const root: Inline[] = [];
    const frames: Inline[][] = [root];
    const top = () => frames[frames.length - 1];
    for (const tk of toks) {
      if (tk.k === 'node') {
        top().push(tk.node);
      } else if (tk.pair === 'open') {
        this.mark('em-open', tk.span.from, tk.span.to);
        const outer: Inline[] = [];
        if (tk.n === 1) {
          top().push({ t: 'em', children: outer });
          frames.push(outer);
        } else if (tk.n === 2) {
          top().push({ t: 'strong', children: outer });
          frames.push(outer);
        } else {
          const inner: Inline[] = [];
          top().push({ t: 'strong', children: [{ t: 'em', children: inner }] });
          frames.push(inner);
        }
      } else if (tk.pair === 'close') {
        this.mark('em-close', tk.span.from, tk.span.to);
        frames.pop();
      } else {
        top().push({ t: 'text', span: tk.span });
      }
    }
    return merge(root);
  }
}

/** Join adjacent text nodes, so a document has one node per run of text. */
function merge(nodes: Inline[]): Inline[] {
  const out: Inline[] = [];
  for (const n of nodes) {
    const last = out[out.length - 1];
    if (n.t === 'text' && last?.t === 'text' && last.span.to === n.span.from) {
      last.span = { from: last.span.from, to: n.span.to };
    } else if (n.t === 'em' || n.t === 'strong') {
      out.push({ t: n.t, children: merge(n.children) });
    } else {
      out.push(n.t === 'text' ? { t: 'text', span: { ...n.span } } : n);
    }
  }
  return out;
}

// ---------------------------------------------------------------- what is shown

/**
 * The offsets of every character the rendering shows, in the order it shows
 * them. Everything else in the source is hidden.
 */
export function shown(doc: Document): number[] {
  return shownIn(doc).map(([i]) => i);
}

/**
 * The offsets shown, in order, each with the leaf block that shows it: a
 * heading, a paragraph, a code block's label, its lines, a list marker.
 */
function shownIn(doc: Document): [number, number][] {
  const out: [number, number][] = [];
  let leaf = 0;
  const span = (x: Span) => {
    for (let i = x.from; i < x.to; i++) out.push([i, leaf]);
  };
  const inl = (ns: Inline[]) => {
    for (const n of ns) {
      if (n.t === 'text' || n.t === 'code' || n.t === 'link') span(n.span);
      else if (n.t === 'break') out.push([n.at, leaf]);
      else inl(n.children);
    }
  };
  const blk = (bs: Block[]) => {
    for (const b of bs) {
      switch (b.t) {
        case 'heading':
        case 'paragraph':
          leaf++;
          inl(b.children);
          break;
        case 'quote':
          blk(b.children);
          break;
        case 'list':
          for (const it of b.items) {
            leaf++;
            span(it.marker);
            blk(it.children);
          }
          break;
        case 'code':
          leaf++;
          if (b.label) span(b.label);
          leaf++;
          b.lines.forEach((l, k) => {
            span(l);
            if (k + 1 < b.lines.length) out.push([l.to, leaf]); // the LF between two lines
          });
          break;
        case 'rule':
          break;
      }
    }
  };
  blk(doc.blocks);
  return out;
}

// ---------------------------------------------------------------- the floor

// F167, F174 items 10 and 11, F175, F178 items 16 and 17 (Text MIP draft 6,
// the Text format task): the format's author writes its markup declaration,
// and a hostile author could declare a decimal point or a minus sign as
// markup. So under every declaration lies a floor the Text MIP sets:
// characters no format hides, whatever its declaration says. The floor is
// written here apart from this format's own declaration, so it holds for any
// declaration. Each part below is one clause of the Text MIP's list.

/**
 * The percent, per-mille and per-ten-thousand signs, by code point as the
 * Text MIP lists them (F178 item 16): U+0025, U+066A, U+FE6A, U+FF05,
 * U+2030, U+0609, U+2031. They are punctuation (Po), so no category covers
 * them. (U+060A, the Arabic-Indic per-ten-thousand sign, is not in the
 * list.)
 */
export const PERCENT_SIGNS = new Set([0x0025, 0x066a, 0xfe6a, 0xff05, 0x2030, 0x0609, 0x2031]);

/**
 * The plus and minus signs the floor names (F167, F175, F182): + - U+2212,
 * and the dash-like minus signs U+2010 (hyphen), U+2011 (non-breaking
 * hyphen), U+2012 (figure dash), U+2013 (en dash), U+2796 (heavy minus
 * sign), U+FE63 (small hyphen-minus) and U+FF0D (fullwidth hyphen-minus).
 */
export const SIGNS = new Set([0x002b, 0x002d, 0x2212, 0x2010, 0x2011, 0x2012, 0x2013, 0x2796, 0xfe63, 0xff0d]);

/**
 * Full stops and commas (F174 item 11): the punctuation characters (Po)
 * Unicode names FULL STOP or COMMA, and the Arabic decimal and thousands
 * separators (U+066B, U+066C), which do their work in Arabic-Indic numbers.
 */
export const STOPS = new Set([
  // Full stops.
  0x002e, 0x0589, 0x06d4, 0x0701, 0x0702, 0x1362, 0x166e, 0x1803, 0x1809, 0x2cf9, 0x2cfe, 0x2e3c, 0x3002, 0xa4ff, 0xa60e, 0xa6f3,
  0xfe12, 0xfe52, 0xff0e, 0xff61, 0x16af5, 0x16e98, 0x1bc9f, 0x1da88,
  // Commas.
  0x002c, 0x055d, 0x060c, 0x07f8, 0x1363, 0x1802, 0x1808, 0x2e32, 0x2e34, 0x2e41, 0x2e49, 0x2e4c, 0x3001, 0xa4fe, 0xa60d, 0xa6f5,
  0xfe10, 0xfe11, 0xfe50, 0xfe51, 0xff0c, 0xff64, 0x1144d, 0x1145a, 0x16e97, 0x1da87,
  // The Arabic decimal and thousands separators.
  0x066b, 0x066c,
]);

/**
 * Apostrophes (F174 item 11): U+0027, U+2019 (the typographic apostrophe),
 * U+055A (Armenian) and U+FF07 (fullwidth). U+02BC, the modifier letter
 * apostrophe, is a letter (Lm), so always under the floor.
 */
export const APOSTROPHES = new Set([0x0027, 0x2019, 0x055a, 0xff07]);

/**
 * Question and exclamation marks (F174 item 11): the punctuation characters
 * (Po) Unicode names QUESTION MARK or EXCLAMATION MARK, and the interrobangs
 * (U+203D, U+2E18).
 */
export const MARKS_QE = new Set([
  0x003f, 0x00bf, 0x037e, 0x055e, 0x061f, 0x1367, 0x1945, 0x2047, 0x2049, 0x2cfa, 0x2cfb, 0x2e2e, 0x2e54, 0xa60f, 0xa6f7, 0xfe16,
  0xfe56, 0xff1f, 0x11143, 0x1e95f,
  0x0021, 0x00a1, 0x055c, 0x07f9, 0x1944, 0x203c, 0x2048, 0x2e53, 0xfe15, 0xfe57, 0xff01, 0x1e95e,
  0x203d, 0x2e18,
]);

/**
 * A digit, for "next to", "between two digits", "before a digit": any
 * character of category N, as the rule reads "a digit" in the same breath
 * as N. So Arabic-Indic and Devanagari digits count, and so do ½ and Ⅻ.
 */
const DIGIT = /^\p{N}$/u;
const LETTER = /^\p{L}$/u;
const MARK = /^\p{M}$/u;
const ALWAYS = /^[\p{L}\p{N}\p{M}]$/u;
const CURRENCY = /^\p{Sc}$/u;
const MATHS = /^\p{Sm}$/u;
const OPEN_BRACKET = /^\p{Ps}$/u;
const CLOSE_BRACKET = /^\p{Pe}$/u;

/** The character at offset `i`, whole even where `i` falls inside a surrogate pair. */
function charAt(s: string, i: number): { c: string; from: number; to: number } | null {
  if (i < 0 || i >= s.length) return null;
  let from = i;
  const u = s.charCodeAt(i);
  if (u >= 0xdc00 && u <= 0xdfff && i > 0) {
    const h = s.charCodeAt(i - 1);
    if (h >= 0xd800 && h <= 0xdbff) from = i - 1;
  }
  const c = String.fromCodePoint(s.codePointAt(from)!);
  return { c, from, to: from + c.length };
}

/** The character ending just before offset `i`, whole. */
const charBefore = (s: string, i: number) => (i > 0 ? charAt(s, i - 1) : null);

const isDigit = (x: { c: string } | null): boolean => x !== null && DIGIT.test(x.c);

/**
 * A letter, for "between two letters", on the side before: a letter, or a
 * letter followed by its combining marks, so that the space after "हिंदी"
 * (whose last character is a vowel sign) or after a decomposed "é" lies
 * between two letters.
 */
function letterBefore(s: string, i: number): boolean {
  let x = charBefore(s, i);
  while (x && MARK.test(x.c)) x = charBefore(s, x.from);
  return x !== null && LETTER.test(x.c);
}

/** The characters of an amount, for "a bracket directly around an amount". */
function inAmount(c: string): boolean {
  const cp = c.codePointAt(0)!;
  return DIGIT.test(c) || CURRENCY.test(c) || SIGNS.has(cp) || STOPS.has(cp) || PERCENT_SIGNS.has(cp) || APOSTROPHES.has(cp) || SPACES.has(cp);
}

/**
 * Is the bracket at [from, to) directly around an amount? An opening
 * bracket (Ps) directly before an amount and a closing bracket (Pe)
 * directly after it, as "(5)", "(−2.50)", "($5)" or "(1 000 €)": between
 * them only digits, currency, plus and minus signs, full stops and commas,
 * percent signs, apostrophes and spaces, at least one digit, and no space
 * directly inside either bracket.
 */
function aroundAmount(s: string, from: number, to: number, open: boolean): boolean {
  let digits = 0;
  let edge: { c: string; from: number; to: number } | null = null;
  let x = open ? charAt(s, to) : charBefore(s, from);
  const first = x;
  while (x && inAmount(x.c)) {
    if (DIGIT.test(x.c)) digits++;
    edge = x;
    x = open ? charAt(s, x.to) : charBefore(s, x.from);
  }
  if (!x || !digits || !first || !edge) return false;
  if (SPACES.has(first.c.codePointAt(0)!) || SPACES.has(edge.c.codePointAt(0)!)) return false;
  return open ? CLOSE_BRACKET.test(x.c) : OPEN_BRACKET.test(x.c);
}

/** One character in its place: itself and its neighbours in the text. */
interface Here {
  s: string;
  c: string;
  cp: number;
  from: number;
  to: number;
  before: { c: string; from: number; to: number } | null;
  after: { c: string; from: number; to: number } | null;
}

/**
 * The floor, clause by clause, in the Text MIP's order: each clause names
 * why a character lies under it, and says whether this one does. A clause
 * that needs the rendering (a run of hidden characters between two digits,
 * emphasis or code markup between two digits) is checked in `checkBound()`.
 */
export const FLOOR: readonly [string, (h: Here) => boolean][] = [
  ['a letter, a digit or a combining mark', (h) => ALWAYS.test(h.c)],
  ['a currency sign', (h) => CURRENCY.test(h.c)],
  ['a mathematical sign next to a digit', (h) => MATHS.test(h.c) && (isDigit(h.before) || isDigit(h.after))],
  ['a percent, per-mille or per-ten-thousand sign', (h) => PERCENT_SIGNS.has(h.cp)],
  ['a character between two digits', (h) => isDigit(h.before) && isDigit(h.after)],
  [
    'a plus or minus sign directly before a digit or a currency sign, or directly after a digit',
    (h) => SIGNS.has(h.cp) && (isDigit(h.after) || (h.after !== null && CURRENCY.test(h.after.c)) || isDigit(h.before)),
  ],
  ['a full stop or comma directly before a digit', (h) => STOPS.has(h.cp) && isDigit(h.after)],
  [
    'a bracket directly around an amount',
    (h) => (OPEN_BRACKET.test(h.c) && aroundAmount(h.s, h.from, h.to, true)) || (CLOSE_BRACKET.test(h.c) && aroundAmount(h.s, h.from, h.to, false)),
  ],
  [
    'a space or apostrophe between two letters',
    (h) => (SPACES.has(h.cp) || APOSTROPHES.has(h.cp)) && h.after !== null && LETTER.test(h.after.c) && letterBefore(h.s, h.from),
  ],
  ['a question or exclamation mark', (h) => MARKS_QE.has(h.cp)],
];

/**
 * Why the character at offset `i` of `s` lies under the Text MIP's floor,
 * so that no format may hide it, or null if a format may. Its neighbours
 * are the characters directly before and after it in the text. A line
 * break between two digits is reported here; `checkBound()` lets a format
 * hide it where it ends a block (F175).
 */
export function underFloor(s: string, i: number): string | null {
  const here = charAt(s, i);
  if (!here) return null;
  const h: Here = { s, c: here.c, cp: here.c.codePointAt(0)!, from: here.from, to: here.to, before: charBefore(s, here.from), after: charAt(s, here.to) };
  for (const [why, holds] of FLOOR) if (holds(h)) return why;
  return null;
}

/**
 * Check the Text MIP's bound on a format (task 4, with F102 and F149) for
 * one rendering: every character shown is the source's own, shown once and
 * in the order of the bytes, and every character hidden is the format's own
 * declared markup, in a position the cMIP's markup declaration declares it
 * ("Markup declaration"). Each position is checked against the source
 * itself, never taken from the reading: a rendering that hid a minus sign,
 * a decimal point, a vowel sign, or a markup character anywhere else (a
 * `-` before a number, a `*` between spaces, an LF inside a paragraph) is
 * refused. And whatever the declaration says, nothing under the Text MIP's
 * floor is hidden (F167, `underFloor()`). Returns the first breach found,
 * or null.
 *
 * `declared` is the declaration's table of characters, and `endsBlock` the
 * hidden characters it says end a block, this cMIP's own unless given: the
 * floor holds whatever declaration a check is handed, which a test shows by
 * handing it a hostile one. Only a line break is ever let through between
 * two digits for ending a block, and only where the rendering does show a
 * new block after it (F175).
 */
export function checkBound(
  doc: Document,
  declared: Readonly<Record<MarkRule, string>> = DECLARED,
  endsBlock: string = ENDS_BLOCK,
): string | null {
  const s = doc.source;
  const n = s.length;
  const at = shownIn(doc);
  // 1 shown, 2 hidden as declared markup.
  const state = new Uint8Array(n);
  const leafOf = new Int32Array(n).fill(-1);
  let last = -1;
  for (const [i, leaf] of at) {
    if (i < 0 || i >= n) return `shows offset ${i}, outside the text`;
    if (i <= last) return `shows offset ${i} after ${last}: out of the order of the bytes`;
    last = i;
    state[i] = 1;
    leafOf[i] = leaf;
  }
  // The floor first (F167, F174, F175): every character not shown is
  // hidden, whether a declaration entry claims it, it ends a block, or
  // nothing claims it.
  const prevShown = new Int32Array(n + 1).fill(-1);
  for (let i = 0; i < n; i++) prevShown[i + 1] = state[i] ? i : prevShown[i];
  const nextShown = new Int32Array(n + 1).fill(-1);
  for (let i = n - 1; i >= 0; i--) nextShown[i] = state[i] ? i : nextShown[i + 1];
  // A line break the declaration says ends a block, after which the
  // rendering does show another block: hidden, it joins nothing.
  const endsABlock = (i: number) => {
    if (s[i] !== '\n' || !endsBlock.includes('\n')) return false;
    const a = prevShown[i];
    const b = nextShown[i];
    return a >= 0 && b >= 0 && leafOf[a] !== leafOf[b];
  };
  const floor = (i: number, why: string) => `hides ${JSON.stringify(s[i])} at ${i}, which no format may hide (F167): ${why}`;
  const ruleAt = new Map<number, MarkRule>();
  for (const m of doc.marks) for (let i = m.span.from; i < m.span.to; i++) ruleAt.set(i, m.rule);
  const emphasisOrCode = (i: number) => {
    const rule = ruleAt.get(i);
    return rule === 'em-open' || rule === 'em-close' || rule === 'code-open' || rule === 'code-close';
  };
  const BETWEEN = 'a character between two digits';
  for (let i = 0; i < n; i++) {
    if (state[i]) continue;
    const why = underFloor(s, i);
    if (why === BETWEEN && endsABlock(i)) continue;
    if (why === BETWEEN && emphasisOrCode(i)) return floor(i, 'emphasis or code markup between two digits');
    if (why) return floor(i, why);
  }
  // Any run of hidden characters between two digits, and emphasis or code
  // markup between two digits (F175): "1, 2" must never read "12", nor
  // "1*2*3" read "123". A run with a line break that ends a block is
  // excepted, since a new block is shown, not hidden: the two digits are
  // never read as one number. (Read for the whole run, so a heading's, a
  // quote's, a fence's or a rule line's markup may stand between two
  // digits in two blocks: confirmed, F182 item 10.)
  for (let a = 0; a < n; ) {
    if (state[a]) {
      a++;
      continue;
    }
    let b = a;
    while (b < n && !state[b]) b++;
    const before = charBefore(s, a);
    const after = charAt(s, b);
    let newBlock = false;
    for (let i = a; i < b && !newBlock; i++) newBlock = endsABlock(i);
    if (isDigit(before) && isDigit(after) && !newBlock) {
      for (let i = a; i < b; i++) if (emphasisOrCode(i)) return floor(i, 'emphasis or code markup between two digits');
      return floor(a, 'a run of hidden characters between two digits');
    }
    a = b;
  }
  const said = (i: number) => JSON.stringify(s[i] ?? '');
  const lineStart = (i: number) => s.lastIndexOf('\n', i - 1) + 1;
  const lineEnd = (i: number) => {
    const e = s.indexOf('\n', i);
    return e < 0 ? n : e;
  };
  // Positions that open a line's content: everything before them on their
  // line is a container's markup (a quote's sign, an item's indentation or
  // its marker's space) or a list marker, shown as written.
  const markers = new Uint8Array(n);
  const markerSpans = (bs: Block[]): void => {
    for (const b of bs) {
      if (b.t === 'quote') markerSpans(b.children);
      if (b.t === 'list')
        for (const it of b.items) {
          for (let i = it.marker.from; i < it.marker.to; i++) markers[i] = 1;
          markerSpans(it.children);
        }
    }
  };
  markerSpans(doc.blocks);
  const container = new Uint8Array(n);
  for (const m of doc.marks)
    if (m.rule === 'quote' || m.rule === 'indent' || m.rule === 'item')
      for (let i = m.span.from; i < m.span.to; i++) container[i] = 1;
  const opensLine = (i: number) => {
    for (let j = lineStart(i); j < i; j++) if (!container[j] && !markers[j]) return false;
    return true;
  };
  // A character a backslash escapes is text: it ends a run of signs
  // (rule 8 is read before the run starts, left to right).
  const escaped = new Uint8Array(n + 1);
  for (const m of doc.marks) if (m.rule === 'escape') escaped[m.span.to] = 1;
  const run = (i: number, c: string) => {
    let a = i;
    let b = i;
    while (a > lineStart(i) && s[a - 1] === c && !escaped[a - 1]) a--;
    while (b < lineEnd(i) && s[b] === c && !escaped[b]) b++;
    return { from: a, to: b };
  };
  const isSpaceAt = (i: number) => i >= 0 && i < n && SPACES.has(s.charCodeAt(i));
  const wholeRun = (m: Mark, c: string) => {
    const r = run(m.span.from, c);
    return r.from === m.span.from && r.to === m.span.to;
  };
  const sameLine = (a: Mark, b: Mark) => lineEnd(a.span.from) === lineEnd(b.span.from);
  const closeShown = (i: number) => linkCloseShown(s, i);
  // Pairs on one line: an opener closed by the next closer of its kind,
  // emphasis nesting as the reading pairs it.
  const stack: Mark[] = [];
  let code: Mark | null = null;
  let link: Mark | null = null;
  for (const m of doc.marks) {
    const { from, to } = m.span;
    if (from < 0 || to > n || from >= to) return `declares markup outside the text at ${from}`;
    for (let i = from; i < to; i++) {
      if (state[i]) return `hides ${said(i)} at ${i}, which it also shows`;
      if (!declared[m.rule].includes(s[i])) return `hides ${said(i)} at ${i}, which is not ${m.rule} markup`;
      state[i] = 2;
    }
    const text = s.slice(from, to);
    const fail = (why: string) => `hides ${JSON.stringify(text)} at ${from}, not in a declared position: ${why}`;
    switch (m.rule) {
      case 'heading':
        if (!/^#{1,6} $/.test(text) || !opensLine(from) || to >= lineEnd(from)) return fail('one to six # and a space, opening a line, before some text');
        break;
      case 'rule':
        if (!opensLine(from) || to !== lineEnd(from) || !/^(?:-{3,}|\*{3,})$/.test(text)) return fail('a whole line of three or more - or *');
        break;
      case 'fence-open':
        if (!opensLine(from) || to - from < 3 || !wholeRun(m, '`') || s.slice(to, lineEnd(from)).includes('`')) return fail('three or more backticks opening a line, nothing after them a backtick');
        break;
      case 'fence-close':
        if (!opensLine(from) || to !== lineEnd(from)) return fail('a whole line of backticks');
        break;
      case 'quote':
        if (s[from] !== '>' || (to - from === 2 && s[from + 1] !== ' ') || !opensLine(from)) return fail('a > and one space, opening a line');
        break;
      case 'item':
        if (from === 0 || !markers[from - 1] || to - from !== 1) return fail('the one space after a list marker');
        break;
      case 'indent':
        if (!opensLine(from) || !/^ +$/.test(text)) return fail('spaces opening an item\'s later line');
        break;
      case 'escape':
        if (to - from !== 1 || to >= lineEnd(from) || !ESCAPABLE.has(s[to]) || state[to] !== 1) return fail('a backslash before a character it escapes');
        break;
      case 'code-open':
        if (code || !wholeRun(m, '`')) return fail('a whole run of backticks opening a code span');
        code = m;
        break;
      case 'code-close':
        if (!code || !sameLine(code, m) || !wholeRun(m, '`') || to - from !== code.span.to - code.span.from) return fail('a run of as many backticks closing a code span on its line');
        code = null;
        break;
      case 'link-open': {
        const a = AUTOLINK.exec(s.slice(from, lineEnd(from)));
        if (!a || link) return fail('a < opening a link to an https, http or mailto address');
        // The closing > next to a digit is shown (F178 item 17): then no
        // closing mark follows.
        const close = from + a[0].length - 1;
        if (state[close] === 1) {
          if (!closeShown(close)) return fail('a link whose closing > is shown, though not next to a digit');
        } else link = m;
        break;
      }
      case 'link-close': {
        // Its opening <: hidden (the link-open mark), or shown because the
        // floor forbids hiding it (F182).
        const o = link ? link.span.from : s.lastIndexOf('<', from);
        if (!link && !(o >= lineStart(from) && state[o] === 1 && linkOpenShown(s, o))) return fail('the > closing a link');
        const a = AUTOLINK.exec(s.slice(o, lineEnd(o)));
        if (!a || o + a[0].length !== to) return fail('the > closing a link');
        if (closeShown(from)) return fail('the > closing a link, next to a digit, is shown');
        link = null;
        break;
      }
      case 'em-open':
        if (to - from > 3 || !wholeRun(m, '*') || to >= lineEnd(from) || isSpaceAt(to)) return fail('a run of one to three * before a character not a space');
        stack.push(m);
        break;
      case 'em-close': {
        const o = stack.pop();
        if (to - from > 3 || !wholeRun(m, '*') || from <= lineStart(from) || isSpaceAt(from - 1)) return fail('a run of one to three * after a character not a space');
        if (!o || !sameLine(o, m) || o.span.to - o.span.from !== to - from) return fail('no opener of its length on its line');
        break;
      }
    }
  }
  if (stack.length || code || link) return 'an opening sign is never closed on its line';
  // An LF is hidden only where a block ends: never between two characters
  // one block shows, which would join two lines of text into one.
  let prev = -1;
  const next = new Int32Array(n + 1).fill(-1);
  for (let i = n - 1; i >= 0; i--) next[i] = state[i] === 1 ? i : next[i + 1];
  for (let i = 0; i < n; i++) {
    if (state[i] === 1) {
      prev = i;
      continue;
    }
    if (state[i] === 2) continue;
    if (!endsBlock.includes(s[i])) return `hides ${said(i)} at ${i}, which is not markup`;
    const after = next[i + 1] ?? -1;
    if (prev >= 0 && after >= 0 && leafOf[prev] === leafOf[after]) return `hides the LF at ${i}, inside a block`;
  }
  return null;
}

/** The text a rendering shows, as a string: the source minus what it hides. */
export function shownText(doc: Document): string {
  return shown(doc)
    .map((i) => doc.source[i])
    .join('');
}

/** A document's title, where a client needs one: the text its first heading shows. */
export function title(doc: Document): string | null {
  const h = doc.blocks.find((b) => b.t === 'heading');
  if (!h || h.t !== 'heading') return null;
  return shownText({ ...doc, blocks: [h] }).trim() || null;
}
