#!/bin/sh
# The rehearsal of roadmap step 17 ("First acts and the repository on MOR"),
# with one command, on throwaway homes and a relay on local ports:
#
#   scripts/rehearse-step-17.sh
#
# Two fresh homes under two operators and a relay; the author's identity with
# its chain key from the air-gapped Module's signer and seed words; Machine,
# allegedly; the reporting identity; the clock; the first acts in step 17's
# order; then every check from outside, as a stranger, each passing or failing
# with a plain sentence; then a rotation of the author's identity from the seed
# words alone. Prints a checklist, and what must be done by hand at step 17.
#
# TEST IDENTITIES ONLY. Nothing reaches a real server: the homes, the relay and
# the gateway listen on 127.0.0.1, and the browser refuses every other address.
# Everything is made in one folder, removed at the end with every process
# started from it, whether the run passes, fails or is interrupted.
#
# Needs what scripts/test-all.sh needs (Rust, Node 22, wasm-bindgen-cli 0.2.129)
# and Chromium (MOR_CHROMIUM, or Playwright's in /opt/pw-browsers). Report:
# docs/step-17-rehearsal.md.
set -eu
root=$(cd "$(dirname "$0")/.." && pwd)
cd "$root"

run=$(mktemp -d "${TMPDIR:-/tmp}/mor-rehearsal-XXXXXX")
cleanup() {
  status=$?
  trap - EXIT INT TERM
  # Every process started from this run's folder: the homes, the relay, a browser.
  pkill -TERM -f "$run" 2>/dev/null || true
  sleep 1
  pkill -KILL -f "$run" 2>/dev/null || true
  rm -rf "$run"
  if pgrep -f "$run" >/dev/null 2>&1 || [ -e "$run" ]; then
    echo "LEFT BEHIND: something of this run is still here ($run)"
    status=1
  else
    echo "Nothing left running, nothing left behind: the run's folder is removed and no process of it remains."
  fi
  exit $status
}
trap cleanup EXIT
trap 'exit 130' INT TERM

echo "== Building what the rehearsal runs (the relay, the air-gapped Module's signer and its online side)"
cargo build -q --locked -p mor-relay -p mor-airgap --bin mor-relay --bin mor-signer --example online_side
if [ ! -f clients/genesis/wasm/mor_wasm_bg.wasm ]; then
  echo "== The core library for the clients (WebAssembly)"
  (cd clients/genesis && npm ci --no-audit --no-fund >/dev/null && npm run wasm >/dev/null)
fi
for pkg in clients/genesis clients/barebone clients/longform clients/site clients/repo clients/reports clients/reader modules/jpeg modules/carry modules/timestamp; do
  [ -d "$pkg/node_modules" ] || (echo "== npm ci in $pkg" && cd "$pkg" && npm ci --no-audit --no-fund >/dev/null)
done

# Every temporary folder the clients and the relays make goes into the run's folder.
export TMPDIR="$run"
set +e
(cd clients/site && node --import tsx ../../scripts/rehearsal/rehearse.ts)
result=$?
set -e

cat <<'EOF'

What the rehearsal cannot do for real, done by hand at step 17

  1. Every server that carries on past the tests is reinstalled from scratch (home1 and home2 on their hosts), not emptied: no test data, no build window key, no leftover settings.
  2. The home on the author's machine gets a fresh onion address; the test one, in old commits, leads nowhere.
  3. The author's chain key is made on the real air-gapped device, offline for good, and its 24 words written on paper once; here a signer ran on this machine and printed the words for one run.
  4. The commitment, and later each rotation, cross to the online device by file or by QR from the real air-gapped device; here they crossed as files in one folder.
  5. The real photograph of the Earth, and the first post's own words, in place of the stand-ins.
  6. "Thank you for MOR", written by the author, in place of the placeholder.
  7. DNS: dubsar.org and the homes' names point at the reinstalled servers, with their certificates; here everything was 127.0.0.1.
  8. The gateway's settings on the real server: the real site version, the display client's real release, the real relays and homes.
  9. The frozen texts and their spec hashes in place of the test values every client and relay uses now, and every client rebuilt with them (step 16).
 10. The keys of Machine, allegedly, the reporting identity and the clock, made where they will be kept, each written down by the author.
 11. The site checked on real phones and browsers, and the reader opened by its links (step 18).
EOF
exit $result
