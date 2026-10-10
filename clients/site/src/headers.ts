// The HTTP headers every answer of the gateway carries. The display client
// runs only its own script and the core library's WebAssembly; pictures and
// stylesheets of the site reach a page only as checked bytes (blob: URLs);
// a film plays only from its checked bytes too (blob: URLs, website cMIP
// draft 4, rule 12a); it talks to relays over https; it cannot be framed. A page, shown in a
// frame without scripts, inherits the same policy, so it can load nothing
// from elsewhere either.

export function contentSecurityPolicy(extraConnect: string[] = []): string {
  return [
    "default-src 'none'",
    "script-src 'self' 'wasm-unsafe-eval'",
    "style-src 'self' blob:",
    "img-src 'self' blob: data:",
    "media-src blob:",
    `connect-src 'self' https: ${extraConnect.join(' ')}`.trim(),
    "frame-src 'self'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join('; ');
}

export function headers(extraConnect: string[] = []): Record<string, string> {
  return {
    'content-security-policy': contentSecurityPolicy(extraConnect),
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer',
    'cache-control': 'no-cache',
  };
}
