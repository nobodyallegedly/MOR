# The gateway names the newer version it could not serve

A small fix to the website gateway (`clients/site`), client work. No rule of the protocol changes.

## In plain words

A gateway that follows an owner's site serves the newest version, but only if every file of it arrives and matches what the owner signed. When one doesn't, it serves the version before instead. That part was already right. But its log named only the version it served, so nobody could tell from the log that a newer one existed and was passed over.

Now the log says so, once for each newer version:

```
start: 127.0.0.1: tried the newer version <newer> and could not serve it: 1 file did not arrive or did not match what was signed (run.html); serving version <older> instead
start: 127.0.0.1: version <older> verified, <n> files; serving it
```

On later looks the second line repeats, as before. The first line does not repeat for the same newer version. If a still newer version is also passed over later, it gets its own line.

## Precisely

- `clients/site/src/gateway.ts`: `Loaded` gains `passed`, the newer versions tried and passed over in one load, each with the paths of its files that did not arrive or did not match. `Carried.passedOver(loaded)` turns those into log lines and remembers which versions it has named, so each is named once. The existing problem texts (the 503 page, the "NOT VERIFIED" line) read exactly as before.
- `clients/site/src/cli.ts`: the `gateway` command prints those lines before its usual line for each site.
- `clients/site/test/site.test.ts`: a new test publishes three versions and reaches the relay by a route that loses `run.html` of the newest. It runs the real `gateway` command with a look every second and reads its output. It checks that the line above appears with the real version ids, that the newer version is named once across the start and two looks, and that the version before is served.

## Tests

- On `main`, before writing: `scripts/test-all.sh` passed: the Rust workspace and every TypeScript package, 57 tests in the site package. The first attempt stopped before any TypeScript test because `wasm-bindgen` 0.2.129, which the script lists as needed, wasn't installed in the machine. It was installed outside the repository and the second run passed. The tree was unchanged.
- With the change: see the pull request.
