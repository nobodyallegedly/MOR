// `node:fs` in Kišib's web client: there are no files in a browser. The
// genesis client's identity.ts imports it for `TestIdentity.load` and
// `save`, which the web client never calls (it keeps the identity in
// IndexedDB, `keep.ts`); were one called, it would fail here, saying so.

const none = (name: string) => () => {
  throw new Error(`${name}: there are no files in a browser`);
};

export const readFileSync = none('readFileSync');
export const writeFileSync = none('writeFileSync');
export const renameSync = none('renameSync');
