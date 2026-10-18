// The textual forms (Identity draft 14, "Written for people"; F349), for
// display on pages that carry no core library: bech32m (BIP-350),
// lowercase, from an ID's hex. Encoding only, to show and to copy: every
// string a person types is read and checked by the core library
// (`forms.ts`, `formRead`). Checked against the published vectors
// (`core/vectors/textual-forms.json`) by `test/shown.test.ts`.

const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

function polymod(values: number[]): number {
  const G = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (const v of values) {
    const b = chk >>> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) if ((b >>> i) & 1) chk ^= G[i];
  }
  return chk >>> 0;
}

/** A hex string's short form under a label: `mid`, `mact`, `mkey`, `mspec`, `mwork`. */
export function shownForm(label: 'mid' | 'mact' | 'mkey' | 'mspec' | 'mwork', hex: string): string {
  if (!/^([0-9a-f]{2})+$/i.test(hex)) return hex;
  const bytes = hex.match(/../g)!.map((b) => parseInt(b, 16));
  const five: number[] = [];
  let acc = 0;
  let bits = 0;
  for (const b of bytes) {
    acc = ((acc << 8) | b) & 0xffff;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      five.push((acc >> bits) & 31);
    }
  }
  if (bits > 0) five.push((acc << (5 - bits)) & 31);
  const hrp = [...label].map((c) => c.charCodeAt(0));
  const values = [...hrp.map((c) => c >> 5), 0, ...hrp.map((c) => c & 31), ...five, 0, 0, 0, 0, 0, 0];
  const pm = polymod(values) ^ 0x2bc830a3;
  const check = [0, 1, 2, 3, 4, 5].map((i) => (pm >>> (5 * (5 - i))) & 31);
  return `${label}1${[...five, ...check].map((v) => CHARSET[v]).join('')}`;
}

export const shownId = (hex: string) => shownForm('mid', hex);
export const shownAct = (hex: string) => shownForm('mact', hex);
export const shownSpec = (hex: string) => shownForm('mspec', hex);
