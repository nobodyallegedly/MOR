// The HTTP headers Kišib's web client is served with (the Caddy setup in the
// README writes the same): as Dub's. The page runs only its own script and
// the core library's WebAssembly, talks to homes and relays over https,
// loads its own fonts and nothing else, and cannot be framed.

export { contentSecurityPolicy } from '../../../dub/src/web/headers.ts';
