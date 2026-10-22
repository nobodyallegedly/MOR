#!/usr/bin/env bash
# Assembles the C verifier's box from this repository: the eight freeze-ready
# texts, the published vectors (data only, no code), a README for each, and a
# manifest of SHA-256 fingerprints. Usage: scripts/c-box/make-c-box.sh OUT_DIR
set -euo pipefail
repo="$(cd "$(dirname "$0")/../.." && pwd)"
out="${1:?usage: make-c-box.sh OUT_DIR}"
mkdir -p "$out/spec" "$out/vectors"
for fam in MIR-identity-draft- MIR-text-draft- MIR-envelopes-draft- MIR-money-draft- MIR-agreements-draft- MIR-development-draft-; do
  f=$(ls "$repo/spec" | grep -E "^${fam}[0-9]+\.md$" | sed -E "s/^${fam}([0-9]+)\.md$/\1 &/" | sort -n | tail -1 | cut -d' ' -f2)
  cp "$repo/spec/$f" "$out/spec/"
done
for fam in 02-MOR-MICS-v 03-MOR-freeze-test-suite-v; do
  f=$(ls "$repo/spec" | grep -E "^${fam}[0-9]+\.md$" | sed -E "s/^${fam}([0-9]+)\.md$/\1 &/" | sort -n | tail -1 | cut -d' ' -f2)
  cp "$repo/spec/$f" "$out/spec/"
done
cp "$repo"/core/vectors/*.json "$out/vectors/"
cp "$repo/scripts/c-box/vectors-README.md" "$out/vectors/README.md"
cp "$repo/scripts/c-box/README.md" "$out/README.md"
commit=$(git -C "$repo" rev-parse HEAD)
printf '# Snapshot\n\nTaken from the MOR repository at commit `%s`, %s (UTC).\n' "$commit" "$(date -u +%Y-%m-%d)" > "$out/SNAPSHOT.md"
(cd "$out" && find spec vectors README.md SNAPSHOT.md -type f | LC_ALL=C sort | xargs sha256sum > MANIFEST.sha256)
# Nothing of the record or the code may travel.
if grep -rIlE '\bF[0-9]{2,3}\b|docs/|\.rs\b|check\.py|cargo ' "$out" --exclude=MANIFEST.sha256 >/dev/null; then
  echo "refused: a finding number or a pointer to code or docs in:" >&2
  grep -rIlE '\bF[0-9]{2,3}\b|docs/|\.rs\b|check\.py|cargo ' "$out" --exclude=MANIFEST.sha256 >&2
  exit 1
fi
echo "box assembled in $out: $(ls "$out/spec" | wc -l) texts, $(ls "$out/vectors" | wc -l) vector files"
