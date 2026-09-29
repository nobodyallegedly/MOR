// Every X-Wing key exchange this client makes or opens, recorded so that the
// tests can re-make each one with a second, independent implementation (F98:
// "the tests check every key exchange against a second implementation").
// Only public keys, eseeds, ciphertexts and, for opening, the private key
// used are recorded, in memory, and only while `recording` is on.

export type Exchange =
  | { kind: 'encapsulate'; publicKey: Uint8Array; eseed: Uint8Array; ct: Uint8Array }
  | { kind: 'decapsulate'; secret: Uint8Array; ct: Uint8Array };

export const kexLog: { recording: boolean; entries: Exchange[] } = { recording: false, entries: [] };

export function record(e: Exchange): void {
  if (kexLog.recording) kexLog.entries.push(e);
}
