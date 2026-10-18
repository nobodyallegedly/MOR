// `Buffer` in Edubba's web client: only what the shared code it runs uses
// (bytes from and to base64, hex and UTF-8; concat, compare, equals), on
// the browser's own Uint8Array. The build puts it wherever that code names
// `Buffer` (`scripts/build-web.ts`, `inject`).

const HEX = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, '0'));

type Encoding = 'utf8' | 'utf-8' | 'base64' | 'hex' | 'latin1' | 'binary';

export class Buffer extends Uint8Array {
  /** Node's `Buffer.from`, with an encoding, in place of Uint8Array's (no mapping function is ever passed). */
  static from(v: string | ArrayLike<number> | ArrayBuffer | Uint8Array | Iterable<number>, encoding: Encoding | any = 'utf8'): Buffer {
    if (typeof v !== 'string') return v instanceof ArrayBuffer ? new Buffer(new Uint8Array(v)) : new Buffer(Array.isArray(v) || ArrayBuffer.isView(v) ? (v as ArrayLike<number>) : [...(v as Iterable<number>)]);
    switch (encoding) {
      case 'base64': {
        // As Node: the URL-safe alphabet too, padding and anything else left out.
        const s = atob(v.replace(/-/g, '+').replace(/_/g, '/').replace(/[^A-Za-z0-9+/]/g, ''));
        const out = new Buffer(s.length);
        for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
        return out;
      }
      case 'hex': {
        const n = Math.floor(v.length / 2);
        const out = new Buffer(n);
        for (let i = 0; i < n; i++) {
          const b = parseInt(v.slice(2 * i, 2 * i + 2), 16);
          if (Number.isNaN(b)) return out.subarray(0, i) as Buffer;
          out[i] = b;
        }
        return out;
      }
      case 'latin1':
      case 'binary': {
        const out = new Buffer(v.length);
        for (let i = 0; i < v.length; i++) out[i] = v.charCodeAt(i) & 0xff;
        return out;
      }
      default:
        return new Buffer(new TextEncoder().encode(v));
    }
  }

  static alloc(n: number): Buffer {
    return new Buffer(n);
  }

  static isBuffer(v: unknown): v is Buffer {
    return v instanceof Buffer;
  }

  static byteLength(s: string): number {
    return new TextEncoder().encode(s).length;
  }

  static concat(list: Uint8Array[], total?: number): Buffer {
    const n = total ?? list.reduce((a, b) => a + b.length, 0);
    const out = new Buffer(n);
    let at = 0;
    for (const b of list) {
      if (at >= n) break;
      out.set(b.subarray(0, n - at), at);
      at += b.length;
    }
    return out;
  }

  static compare(a: Uint8Array, b: Uint8Array): number {
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
    return a.length === b.length ? 0 : a.length < b.length ? -1 : 1;
  }

  equals(other: Uint8Array): boolean {
    return Buffer.compare(this, other) === 0;
  }

  toString(encoding: Encoding = 'utf8'): string {
    switch (encoding) {
      case 'hex': {
        let s = '';
        for (const x of this) s += HEX[x];
        return s;
      }
      case 'base64': {
        let s = '';
        for (let i = 0; i < this.length; i += 0x8000) s += String.fromCharCode(...this.subarray(i, i + 0x8000));
        return btoa(s);
      }
      case 'latin1':
      case 'binary': {
        let s = '';
        for (const x of this) s += String.fromCharCode(x);
        return s;
      }
      default:
        return new TextDecoder().decode(this);
    }
  }

  toJSON(): { type: 'Buffer'; data: number[] } {
    return { type: 'Buffer', data: [...this] };
  }
}
