// The HTTP headers Dub's web client is served with (the Caddy setup in the
// README writes the same). As the reader's: the page runs only its own
// script and the core library's WebAssembly, talks to homes and relays over
// https, loads nothing else and cannot be framed.

export function contentSecurityPolicy(extraConnect: string[] = []): string {
  return [
    "default-src 'none'",
    "script-src 'self' 'wasm-unsafe-eval'",
    "style-src 'self'",
    "img-src 'self' data:",
    `connect-src 'self' https: ${extraConnect.join(' ')}`.trim(),
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join('; ');
}
