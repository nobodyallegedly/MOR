# Why the display client's release failed, 10 October 2026

*Report of a GitHub session, for the project lead. Branch `claude/display-client-release-fix-ses9ht`. No server details.*

## The cause, in plain words

The release has a check: build the WebAssembly twice, in two different folders, and make sure both come out the same. To do that, the check copies the Rust code into two fresh folders. It copies a list of folders written into the test by hand.

Step 12a added a new Rust package, the on-chain rail (`modules/onchain`), to the workspace. Nobody added it to that list. So the copies were missing one package, and Cargo (Rust's build tool) refuses to build anything in a workspace where a listed package is missing. The build in the copies stopped within a tenth of a second. Nothing was compared, so this was not a case of two builds coming out different. The check could not build at all.

The release itself was fine. The real build, in the real checkout, succeeded in the step before. Neither the F191 to F199 changes to `wasm/src/lib.rs` nor the on-chain crate changes what goes into the WebAssembly. The test's copy was simply incomplete. The same thing happened on 6 October with the payment cMIP and the Lightning Module (roadmap: "it did not copy the payment cMIP and the Lightning Module").

## Precisely

- `clients/site/test/build/reproducible.test.ts`, `copySources()`, passed a fixed list to `git ls-files`: `core wasm cmips/payment modules/airgap modules/lightning relay harness …`. The root `Cargo.toml` lists `modules/onchain` among the workspace members since `c4c7654` (step 12a), merged to main as `ee7c0c6` at 07:46 UTC on 10 October. `harness` also depends on it by path.
- In the copy, `cargo build -p mor-wasm` fails at loading the workspace: `failed to load manifest for dependency mor-onchain … failed to read …/modules/onchain/Cargo.toml: No such file or directory`. I reproduced this locally with the pinned tools.
- The test ran the build with all its output thrown away (`stdio: 'ignore'`). So the GitHub log showed only `Command failed: sh clients/genesis/scripts/build-wasm.sh`, and then test 2's `the WebAssembly was built`. That is why the cause could not be read from the log.
- **Release workflow**, run 38048906098 (two attempts, `88c3d67`): "The release, built twice, is the same" failed this way after 0.3 seconds.
- **Tests workflow on main**: green up to `8f372cd` (9 October, 21:34 UTC). It has been red from `8822dc8` (10 October, 07:46 UTC, the step 12a merge) onwards, so before the F191 to F199 merge. It fails at the same step, "Reproducible build of the display client".
- The step after it, "Fingerprints of this machine's build", is also red on main. That is not a fault. The step runs `diff` between `built/` and a fresh build, and GitHub's shell stops on a `diff` that finds differences. It is red whenever `built/` is older than the code, which it has been since F191 to F199 changed `gateway.js` (for example, "QF1" became "QH1" in a comment). This is the "red by design" check the roadmap describes (6 October). It turns green when the release commits the new `built/`.

## The fix

One file, `clients/site/test/build/reproducible.test.ts` (commit `81e0ff2`):

1. The copy now reads the list of packages from `Cargo.toml`'s `members` line, instead of from a hand-kept list. A package added to the workspace later is copied without anyone remembering to. The other files copied are unchanged: `Cargo.toml`, `Cargo.lock`, `rust-toolchain.toml` and `clients/genesis/scripts`.
2. If the WebAssembly build fails, the test now shows Cargo's last twelve lines of output instead of nothing. The tests workflow already marks such lines as errors.

This is a fix to the test, because the test was what was wrong: it no longer copied what the build needs. What the test checks has not changed. It still checks two folders, the same bytes, no machine folders in the file, two display client builds, and a match with `built/`.

Nothing else changed. `built/` was not committed; the release workflow does that.

## How I checked it

With the pinned tools: rustc 1.97.0, wasm-bindgen 0.2.129, esbuild 0.25.12, Node 22.22, Linux x86-64.

1. **Reproduced the failure.** Copying the old list and building in the copy gave the Cargo error above.
2. **Ran the release workflow's steps locally on the fix:** `npm run wasm`, `npm run release`, then `npm run test:build`. Result: **2 of 2 pass**. The WebAssembly is the same, byte for byte, from two folders and from this checkout, and names none of them. The display client built twice is the same, and it matches the `built/` the release step had just written. I then put `built/` back as it was.
3. **`gateway.js` built here is identical to GitHub's.** Its SHA-256 is `b9e98b85…`, the same as GitHub's own build in the tests run on main at 12:00 UTC.
4. **The "tests" workflow on the branch:** see below.

## The tests workflow on this branch

Run 38051757150 on `81e0ff2`, started by hand, finished at 12:32 UTC:

- **Passed:** the Rust workspace, the WebAssembly, every client (barebone, collective, connector, desk, genesis, longform, manage, reader, repo, site) and the JPEG Module.
- **Reproducible build: test 1 passes on GitHub.** The WebAssembly is the same from two folders and from the checkout, and names none of them. **Test 2 passes its own check:** the display client built twice is the same. Then it fails at its last line, `gateway.js differs from the released copy in built/`. **Fingerprints** is red for the same reason.

Those two red checks are not a fault of the fix. They say that `built/` is older than the code: GitHub's fresh build has "QH1" where `built/` still has "QF1". Only the release can make them green, by committing the new `built/`, and I was asked not to commit `built/` myself. The release workflow runs `npm run release` before the check, so it compares against the `built/` it has just made. Locally, those exact steps gave 2 of 2. So the "tests" workflow cannot be fully green on this branch. It will be green on main after the release commit. Everything that can pass before the release does.

## Something else found: a 12-byte difference between GitHub's WebAssembly and a rebuild

This is not the cause of the failure, but it bears on the claim "anyone on Linux x86-64 can rebuild the same bytes". So I name it here rather than change it quietly.

**In plain words.** My WebAssembly was 12 bytes shorter than GitHub's, from the same code. The only difference is a label inside the file. wasm-bindgen writes the name and version of the tools that made the file into it. GitHub's copy of wasm-bindgen writes "0.2.129 (165586f85)". A copy installed the way `build-wasm.sh` tells people to install it (`cargo install wasm-bindgen-cli --version 0.2.129 --locked`) writes "0.2.129". Every other byte is the same.

**Precisely.** GitHub installs wasm-bindgen with `taiki-e/install-action`, which downloads the project's prebuilt binary, and that binary has its source commit, `165586f85`, built into its version string. I rebuilt the last GitHub release's source (`1b080b9`) here and compared it with what GitHub released (`c46cba3`, `built/mor_wasm_bg.wasm`). Mine is 3,270,318 bytes and GitHub's is 3,270,330. They differ only in the `producers` custom section: its length byte, and the wasm-bindgen version string. With those 12 bytes taken out, the files are identical.

Both binaries print `wasm-bindgen 0.2.129` for `--version`. So the test's tools check (`BUILT-WITH.txt`) does not catch the difference. Someone who follows `build-wasm.sh` gets a WebAssembly whose hash differs from the release, while being told their tools are the same. The 348-byte Mac and Linux difference found on 6 October may include these 12 bytes, but I have not checked that.

**Options, for Nobody, allegedly, to decide (not done):**
- (a) Strip the `producers` section in `build-wasm.sh`: with `wasm-bindgen --remove-producers-section`, a flag 0.2.129 has. The release's bytes then change once, and every install gives the same file.
- (b) Install wasm-bindgen on GitHub with `cargo install … --locked`, as the script says, so GitHub's bytes match a rebuild. This makes each run slower, unless the install is cached.
- (c) Tell rebuilders to use the prebuilt binary, and record its full version string in `BUILT-WITH.txt`.

My lean is (a). It removes a tool fingerprint from the released bytes, and the bytes then no longer depend on how a tool was installed.

## What the project lead must do to release

1. **Merge** `claude/display-client-release-fix-ses9ht` into main.
2. **Push to main a commit whose message contains `[release display client]`**, for example "Release the display client after F191 to F199 [release display client]". Or run the "release display client" workflow by hand from the Actions tab. The workflow rebuilds `built/` on GitHub, runs the check (it now passes), and commits "Display client released from …" to main.
3. **After the release commit, main's "tests" workflow should be fully green.** Both "Reproducible build of the display client" and "Fingerprints" compare with `built/`, which will then be current.
4. Then, as before: a machine session updates the gateway to the new `built/` and runs `mor-site check`.
