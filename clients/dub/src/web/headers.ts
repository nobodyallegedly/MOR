// The HTTP headers Dub's web client is served with (the Caddy setup in the
// README writes the same). As the reader's: the page runs only its own
// script and the core library's WebAssembly, talks to homes and relays over
// https, loads its own fonts (Inter, beside the page), plays films from bytes it checked, and nothing else, and cannot be framed.

export function contentSecurityPolicy(extraConnect: string[] = []): string {
  return [
    "default-src 'none'",
    "script-src 'self' 'wasm-unsafe-eval'",
    "style-src 'self'",
    "font-src 'self'",
    "img-src 'self' data:",
    // Films, played from bytes checked in the page (the video Module), as a blob of their own.
    "media-src blob:",
    `connect-src 'self' https: ${extraConnect.join(' ')}`.trim(),
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join('; ');
}
