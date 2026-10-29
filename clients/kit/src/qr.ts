// A QR code, drawn here (hand test v3, H117: an invoice "and its QR"), so a
// phone's wallet can read what a page shows: ISO/IEC 18004, byte mode only,
// versions 1 to 40, the error correction level chosen by the caller, the
// mask with the lowest penalty. Nothing loaded from elsewhere. Checked module
// by module against the Rust `qrcode` crate (`test/qr.test.ts`).

type Level = 'L' | 'M' | 'Q' | 'H';

// Per level (L, M, Q, H), by version (index 0 unused): error correction codewords per block, and the number of blocks.
const ECC_PER_BLOCK: Record<Level, number[]> = {
  L: [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  M: [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  Q: [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  H: [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
};
const BLOCKS: Record<Level, number[]> = {
  L: [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  M: [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  Q: [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  H: [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
};
const FORMAT_BITS: Record<Level, number> = { L: 1, M: 0, Q: 3, H: 2 };

/** The modules a version holds for data and its error correction, all but the function patterns. */
function rawModules(ver: number): number {
  let r = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const n = Math.floor(ver / 7) + 2;
    r -= (25 * n - 10) * n - 55;
    if (ver >= 7) r -= 36;
  }
  return r;
}
const dataCodewords = (ver: number, l: Level) => Math.floor(rawModules(ver) / 8) - ECC_PER_BLOCK[l][ver] * BLOCKS[l][ver];

// GF(256), the polynomial 0x11D.
function gfMul(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}
function rsDivisor(degree: number): number[] {
  const r = new Array<number>(degree).fill(0);
  r[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < r.length; j++) {
      r[j] = gfMul(r[j], root);
      if (j + 1 < r.length) r[j] ^= r[j + 1];
    }
    root = gfMul(root, 0x02);
  }
  return r;
}
function rsRemainder(data: number[], div: number[]): number[] {
  const r = new Array<number>(div.length).fill(0);
  for (const b of data) {
    const f = b ^ (r.shift() as number);
    r.push(0);
    div.forEach((c, i) => (r[i] ^= gfMul(c, f)));
  }
  return r;
}

/** The data codewords interleaved with their error correction, as the version's blocks hold them. */
function codewords(data: number[], ver: number, l: Level): number[] {
  const nBlocks = BLOCKS[l][ver];
  const ecLen = ECC_PER_BLOCK[l][ver];
  const raw = Math.floor(rawModules(ver) / 8);
  const nShort = nBlocks - (raw % nBlocks);
  const shortLen = Math.floor(raw / nBlocks);
  const div = rsDivisor(ecLen);
  const blocks: number[][] = [];
  for (let i = 0, k = 0; i < nBlocks; i++) {
    const d = data.slice(k, k + shortLen - ecLen + (i < nShort ? 0 : 1));
    k += d.length;
    const ec = rsRemainder(d, div);
    if (i < nShort) d.push(0);
    blocks.push([...d, ...ec]);
  }
  const out: number[] = [];
  for (let i = 0; i < blocks[0].length; i++) blocks.forEach((b, j) => (i !== shortLen - ecLen || j >= nShort) && out.push(b[i]));
  return out;
}

function alignment(ver: number, size: number): number[] {
  if (ver === 1) return [];
  const n = Math.floor(ver / 7) + 2;
  const step = Math.floor((ver * 8 + n * 3 + 5) / (n * 4 - 4)) * 2;
  const r = [6];
  for (let pos = size - 7; r.length < n; pos -= step) r.splice(1, 0, pos);
  return r;
}

/**
 * The QR code of `text` (UTF-8, byte mode): its modules, true for dark, row
 * by row, and its size. The smallest version holding it at `level`
 * (default M); `mask` fixed only for checking.
 */
export function qr(text: string, o: { level?: Level; mask?: number } = {}): { size: number; dark: boolean[][] } {
  const level = o.level ?? 'M';
  const bytes = [...new TextEncoder().encode(text)];
  let ver = 1;
  for (; ver <= 40; ver++) if (4 + (ver < 10 ? 8 : 16) + bytes.length * 8 <= dataCodewords(ver, level) * 8) break;
  if (ver > 40) throw new Error('Too long for a QR code.');
  // The segment: mode (byte), count, the bytes; a terminator, then padding.
  const bits: number[] = [];
  const put = (v: number, n: number) => {
    for (let i = n - 1; i >= 0; i--) bits.push((v >>> i) & 1);
  };
  put(4, 4);
  put(bytes.length, ver < 10 ? 8 : 16);
  for (const b of bytes) put(b, 8);
  const cap = dataCodewords(ver, level) * 8;
  put(0, Math.min(4, cap - bits.length));
  put(0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < cap; pad ^= 0xec ^ 0x11) put(pad, 8);
  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(''), 2));
  const all = codewords(data, ver, level);

  const size = ver * 4 + 17;
  const m: boolean[][] = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const fn: boolean[][] = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const set = (x: number, y: number, d: boolean) => {
    m[y][x] = d;
    fn[y][x] = true;
  };
  // Timing, then finders with their separators, alignment, format and version areas.
  for (let i = 0; i < size; i++) {
    set(6, i, i % 2 === 0);
    set(i, 6, i % 2 === 0);
  }
  const finder = (cx: number, cy: number) => {
    for (let dy = -4; dy <= 4; dy++)
      for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        const d = Math.max(Math.abs(dx), Math.abs(dy));
        if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, d !== 2 && d !== 4);
      }
  };
  finder(3, 3);
  finder(size - 4, 3);
  finder(3, size - 4);
  const al = alignment(ver, size);
  for (let i = 0; i < al.length; i++)
    for (let j = 0; j < al.length; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === al.length - 1) || (i === al.length - 1 && j === 0)) continue;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(al[i] + dx, al[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
  const format = (mask: number) => {
    const d = (FORMAT_BITS[level] << 3) | mask;
    let rem = d;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const b = ((d << 10) | rem) ^ 0x5412;
    const bit = (i: number) => ((b >>> i) & 1) !== 0;
    for (let i = 0; i <= 5; i++) set(8, i, bit(i));
    set(8, 7, bit(6));
    set(8, 8, bit(7));
    set(7, 8, bit(8));
    for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
    for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(i));
    set(8, size - 8, true);
  };
  format(0);
  if (ver >= 7) {
    let rem = ver;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const b = (ver << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const d = ((b >>> i) & 1) !== 0;
      const a = size - 11 + (i % 3);
      const c = Math.floor(i / 3);
      set(a, c, d);
      set(c, a, d);
    }
  }
  // The codewords, in the zigzag.
  let i = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let v = 0; v < size; v++)
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - v : v;
        if (!fn[y][x] && i < all.length * 8) {
          m[y][x] = ((all[i >>> 3] >>> (7 - (i & 7))) & 1) !== 0;
          i++;
        }
      }
  }
  const masked = (mask: number): boolean[][] => {
    const r = m.map((row) => [...row]);
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        if (fn[y][x]) continue;
        const inv = [(x + y) % 2 === 0, y % 2 === 0, x % 3 === 0, (x + y) % 3 === 0, (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, ((x * y) % 2) + ((x * y) % 3) === 0, (((x * y) % 2) + ((x * y) % 3)) % 2 === 0, (((x + y) % 2) + ((x * y) % 3)) % 2 === 0][mask];
        if (inv) r[y][x] = !r[y][x];
      }
    return r;
  };
  const withFormat = (grid: boolean[][], mask: number) => {
    const keep = m.map((row) => [...row]);
    format(mask);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (fn[y][x]) grid[y][x] = m[y][x];
    for (let y = 0; y < size; y++) m[y] = keep[y];
    return grid;
  };
  if (o.mask !== undefined) return { size, dark: withFormat(masked(o.mask), o.mask) };
  let best: boolean[][] | null = null;
  let bestScore = Infinity;
  for (let k = 0; k < 8; k++) {
    const g = withFormat(masked(k), k);
    const sc = penalty(g);
    if (sc < bestScore) [best, bestScore] = [g, sc];
  }
  return { size, dark: best! };
}

/** The penalty of a masked symbol (ISO/IEC 18004, 7.8.3): runs, 2×2 blocks, finder-like patterns, balance. */
function penalty(g: boolean[][]): number {
  const size = g.length;
  let r = 0;
  const line = (at: (i: number) => boolean) => {
    let color = false;
    let run = 0;
    const hist = [0, 0, 0, 0, 0, 0, 0];
    const add = (len: number) => {
      if (hist[0] === 0) len += size;
      hist.pop();
      hist.unshift(len);
    };
    const count = () => {
      const n = hist[1];
      const core = n > 0 && hist[2] === n && hist[3] === n * 3 && hist[4] === n && hist[5] === n;
      return (core && hist[0] >= n * 4 && hist[6] >= n ? 1 : 0) + (core && hist[6] >= n * 4 && hist[0] >= n ? 1 : 0);
    };
    for (let i = 0; i < size; i++) {
      if (at(i) === color) {
        run++;
        if (run === 5) r += 3;
        else if (run > 5) r++;
      } else {
        add(run);
        if (!color) r += count() * 40;
        color = at(i);
        run = 1;
      }
    }
    if (color) {
      add(run);
      run = 0;
    }
    add(run + size);
    r += count() * 40;
  };
  for (let y = 0; y < size; y++) line((x) => g[y][x]);
  for (let x = 0; x < size; x++) line((y) => g[y][x]);
  for (let y = 0; y < size - 1; y++) for (let x = 0; x < size - 1; x++) if (g[y][x] === g[y][x + 1] && g[y][x] === g[y + 1][x] && g[y][x] === g[y + 1][x + 1]) r += 3;
  const dark = g.flat().filter(Boolean).length;
  const total = size * size;
  r += (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10;
  return r;
}

/** The QR code as an SVG, its quiet zone included, dark on light whatever the page's colours (a reader needs the contrast). */
export function qrSvg(text: string, o: { level?: Level; px?: number; label?: string } = {}): string {
  const { size, dark } = qr(text, { level: o.level });
  const q = 4;
  const n = size + q * 2;
  let d = '';
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (dark[y][x]) d += `M${x + q} ${y + q}h1v1h-1z`;
  const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
  return `<svg class="k-qr" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" width="${o.px ?? 220}" height="${o.px ?? 220}" shape-rendering="crispEdges" role="img" aria-label="${esc(o.label ?? 'QR code')}"><rect width="${n}" height="${n}" fill="#fff"/><path fill="#000" d="${d}"/></svg>`;
}
