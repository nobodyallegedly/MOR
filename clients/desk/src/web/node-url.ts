// `node:url` in Edubba's web client: the shared code turns its own module's
// address into a path (`clients/collective/src/actions.ts`, ROOT); in a
// browser that address is the page's, and the path names no file.

export const fileURLToPath = (u: string | URL) => decodeURIComponent(new URL(String(u)).pathname);
export const pathToFileURL = (p: string) => new URL(`file://${encodeURI(p)}`);
