// Which version of the program this is (the desk's fingerprint): every
// source file it runs, here and in the clients and Modules it uses, its page
// and the core library's WebAssembly. The launcher restarts a program left
// running from older code.

import { fileURLToPath } from 'node:url';
import { fingerprint } from '../../desk/src/version.ts';

const pkg = fileURLToPath(new URL('../', import.meta.url));

export const version = (): Promise<string> => fingerprint(pkg, ['src/cli.ts', 'src/page/app.ts']);
