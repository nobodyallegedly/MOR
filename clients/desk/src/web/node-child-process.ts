// `node:child_process` in Edubba's web client: a browser runs no program.
// Only git is ever run by the shared code (a release's folder), and the web
// client makes no release (`../ops.ts`, RELEASE_ON_WEB).

export function execFileSync(cmd: string): never {
  throw Object.assign(new Error(`${cmd}: a browser runs no program; a release is made in Edubba on a computer`), { code: 'ENOENT' });
}
