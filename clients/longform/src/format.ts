// The long-form text format (cmips/cmip-long-form-draft-1.md): a strict
// subset of Markdown on top of canonical text (Text MIP, task 4).
//
// The parser never fails: every canonical text has exactly one reading, and
// whatever is not markup is text. Every node keeps the positions of the
// characters it shows, as offsets into the source, so that `shown()` can
// list them and `checkBound()` can prove, for any text, what the Text MIP
// requires of a format: it hides only markup characters, which are never
// letters or digits, it adds nothing, and it shows the rest in the order of
// the bytes (F82 M7, F102).
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

export interface Document {
  source: string;
  blocks: Block[];
}

/** How deep quotes and lists may nest; deeper markers are text (rule 3). */
export const MAX_DEPTH = 16;

/** The only characters the format ever hides (rule 2). None is a letter or digit. */
export const MARKUP = new Set(['\n', ' ', '#', '*', '>', '<', '`', '\\', '-']);

/** Characters a backslash escapes (rule 8). */
const ESCAPABLE = new Set(['\\', '`', '*', '_', '#', '-', '+', '.', '>', '<', '[', ']', '(', ')', '!', '|', '~']);

/** The space characters of canonical text (Text MIP, rule 4 of canonical text). */
const SPACES = new Set([
  0x20, 0xa0, 0x1680, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200a,
  0x202f, 0x205f, 0x3000,
]);
const isSpace = (s: string, i: number): boolean => SPACES.has(s.charCodeAt(i));

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
  return { source, blocks: new Parser(source).blocks(lines, 0) };
}

const FENCE = /^(`{3,})([^`]*)$/;
const HEADING = /^(#{1,6}) (.+)$/;
const RULE = /^(?:-{3,}|\*{3,})$/;
const BULLET = /^([-*+]) /;
const ORDERED = /^([0-9]{1,9}\.) /;

class Parser {
  constructor(readonly s: string) {}

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
    if (depth < MAX_DEPTH && (x.startsWith('>') || this.marker(l))) return true;
    return false;
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
        const body: Span[] = [];
        i++;
        while (i < lines.length) {
          const y = this.text(lines[i]);
          if (/^`+$/.test(y) && y.length >= n) {
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
        out.push({ t: 'heading', level, children: this.inline({ from: l.from + level + 1, to: l.to }) });
        i++;
        continue;
      }
      // Rule line (rule 6).
      if (RULE.test(x)) {
        out.push({ t: 'rule' });
        i++;
        continue;
      }
      // Quote (rule 7).
      if (depth < MAX_DEPTH && x.startsWith('>')) {
        const inner: Span[] = [];
        while (i < lines.length && this.s[lines[i].from] === '>' && lines[i].from < lines[i].to) {
          const q = lines[i];
          const skip = this.s[q.from + 1] === ' ' && q.from + 1 < q.to ? 2 : 1;
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
          const body: Span[] = [{ from: lines[i].from + w, to: lines[i].to }];
          i++;
          // Continuation: lines indented by the marker's width; blank lines
          // only when an indented line follows them.
          const indent = ' '.repeat(w);
          while (i < lines.length) {
            const y = this.text(lines[i]);
            if (y.startsWith(indent)) {
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

  /** The inline content of one line (rule 9). */
  inline(l: Span): Inline[] {
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
      if (c === '\\' && p + 1 < l.to && ESCAPABLE.has(s[p + 1])) {
        flush(p);
        run = p + 1; // the backslash is hidden, the character shown
        p += 2;
        continue;
      }
      if (c === '`') {
        let n = 0;
        while (p + n < l.to && s[p + n] === '`') n++;
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
          toks.push({ k: 'node', node: { t: 'code', span: { from: p + n, to: close } } });
          p = close + n;
        } else {
          lit(p);
          p += n;
        }
        continue;
      }
      if (c === '<') {
        const m = AUTOLINK.exec(s.slice(p, l.to));
        if (m) {
          flush(p);
          const span = { from: p + 1, to: p + 1 + m[1].length };
          toks.push({ k: 'node', node: { t: 'link', href: m[1], span } });
          p = span.to + 1;
          continue;
        }
        lit(p);
        p++;
        continue;
      }
      if (c === '*') {
        let n = 0;
        while (p + n < l.to && s[p + n] === '*') n++;
        if (n > 3) {
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
  const out: number[] = [];
  const span = (x: Span) => {
    for (let i = x.from; i < x.to; i++) out.push(i);
  };
  const inl = (ns: Inline[]) => {
    for (const n of ns) {
      if (n.t === 'text' || n.t === 'code' || n.t === 'link') span(n.span);
      else if (n.t === 'break') out.push(n.at);
      else inl(n.children);
    }
  };
  const blk = (bs: Block[]) => {
    for (const b of bs) {
      switch (b.t) {
        case 'heading':
        case 'paragraph':
          inl(b.children);
          break;
        case 'quote':
          blk(b.children);
          break;
        case 'list':
          for (const it of b.items) {
            span(it.marker);
            blk(it.children);
          }
          break;
        case 'code':
          if (b.label) span(b.label);
          b.lines.forEach((l, k) => {
            span(l);
            if (k + 1 < b.lines.length) out.push(l.to); // the LF between two lines
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

/**
 * Check the Text MIP's bound on a format (task 4, with F102) for one
 * rendering: every character shown is the source's own, shown once and in
 * the order of the bytes, and every character hidden is markup. Returns the
 * first breach found, or null.
 */
export function checkBound(doc: Document): string | null {
  const at = shown(doc);
  const seen = new Uint8Array(doc.source.length);
  let last = -1;
  for (const i of at) {
    if (i < 0 || i >= doc.source.length) return `shows offset ${i}, outside the text`;
    if (i <= last) return `shows offset ${i} after ${last}: out of the order of the bytes`;
    last = i;
    seen[i] = 1;
  }
  for (let i = 0; i < doc.source.length; i++) {
    if (!seen[i] && !MARKUP.has(doc.source[i])) {
      return `hides ${JSON.stringify(doc.source[i])} at ${i}, which is not markup`;
    }
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
  return shownText({ source: doc.source, blocks: [h] }).trim() || null;
}
