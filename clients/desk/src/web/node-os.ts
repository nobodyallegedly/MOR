// `node:os` in Edubba's web client: there is no computer's home folder in a
// browser. The shared code names one for paths it keeps in Edubba's folder
// (`vfs.ts`), never read from any computer.

export const homedir = () => '/home';
export const tmpdir = () => '/tmp';
export const platform = () => 'browser';
export const EOL = '\n';
