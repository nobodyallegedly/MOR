# The display client re-released, 6 October 2026

*Report of the machine session on the author's Mac, with the project lead's notes. Server paths and addresses are kept out, as always.*

**Rebuilt:** the core library's WebAssembly and the display client (`clients/site/built/`) from main at a539f9b, with rustc 1.97.0, wasm-bindgen 0.2.129 and esbuild 0.25.12, as `BUILT-WITH.txt` names. `index.html` and `gateway.css` came out unchanged; `gateway.js`, `mor_wasm_bg.wasm` and `BUILT-WITH.txt` changed. On the Mac: `site.test.ts` 15/15, `test:build` 2/2; the browser tests ran on GitHub.

**Commit:** c510d4e on main, pushed by the project lead from the cloud, identical (by SHA-256) to the Mac's local commit, which could not be pushed for want of a GitHub login on the Mac.

**Server:** the gateway updated to c510d4e; the previous copy kept for rollback. Settings unchanged; the same signed site version served. No content published, no wording changed.

**Check:** `mor-site check https://dubsar.org` says SAME (twice). In a browser, all five pages say "Verified", signed by the test identity.

**Mac and Linux:**
- `gateway.js` differed because, on GitHub, the bundle took a package from `clients/reader/node_modules`. Fixed in the build script (2f43366): every package now comes from the site client's own folder. The bundle is now the same on both.
- The WebAssembly still differs by 348 bytes between the Mac (arm64) and Linux (x86-64), with the same tools and sources; each is reproducible with itself. The Mac showed nothing of its own in the file: no extra sections, no Mac paths, the same output from another folder or another Cargo home. The growth from 1.19 MB to 2.49 MB since 1 October is real code. **Linux is the release platform** (project lead's proposal, roadmap); the cross-platform difference is open work.

**Other things noticed:**
1. The reproducible-build test's copies left out `rust-toolchain.toml`, so on a machine whose default Rust is another version they built with it. Fixed: the file is now copied.
2. The test varies the folder but not Cargo's home; varying it on the Mac changed nothing. Open, minor.
3. In a browser, the display client tries an onion home still named in the test identity's routes, and the page's security policy blocks it; pages verify through the https homes. Dropping that route needs new routes signed by the test identity: a later machine session.
4. `docs/core-pass-v21.md` does not cover the gateway; the update followed `clients/site/README.md`, "Run a gateway".
