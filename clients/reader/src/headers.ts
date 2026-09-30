// The HTTP headers the reader is served with (the Caddy setup in the README
// writes the same). The page runs only its own script and the core library's
// WebAssembly, and talks to relays over https; it cannot be framed.

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
