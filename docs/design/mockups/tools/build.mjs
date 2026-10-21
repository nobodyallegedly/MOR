// The Dubsar Suite redesign: writes every mockup page (static HTML, pictures only, no app code).
// Run from the repository root: node docs/design/mockups/tools/build.mjs
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGES } from './lib.mjs';
import './screens.mjs';

writeFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'pages.json'), JSON.stringify(PAGES, null, 1));
console.log(`${PAGES.length} pages`);
