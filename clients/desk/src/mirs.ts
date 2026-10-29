// The MIRs' test hashes, written here so the page's bundle never loads the
// core library for them; `test/grid.test.ts` checks each against the core's.

/** The MIRs' test hashes (`genesis/src/core.ts`, MIRS). */
export const MIRS = {
  text: 'a9167c22f01bd8f9489bd364f04b1144d5ff7a755aa59ffdbf34cfac374daf80',
  envelopes: '591d75d82930983b3412942b954070754183771d4ec70e2c7faab5cbf4e8ede7',
  money: 'b6cea993bfce99cf52c277648855d42cfd32654a6a8c018519f4e92179d8c69d',
  agreements: '00538b90e190a5808df8dc9ba3c470c9b04a9c3d4f8baab3d4ac8362b4b4796a',
  development: 'f62cc059fd01d5643cac6375b06323ad15c3d2d96729f00df15c457e5a0da6f8',
} as const;
