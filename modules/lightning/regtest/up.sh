#!/usr/bin/env bash
# A private Lightning test network on regtest, for the Lightning rail
# Module's end-to-end test. No real money: regtest coins exist only here.
#
#   BTCD_DIR=/path/to/btcd-dir LND_DIR=/path/to/lnd-dir ./up.sh RUN_DIR
#
# BTCD_DIR holds `btcd` and `btcctl` (github.com/btcsuite/btcd releases);
# LND_DIR holds `lnd` and `lncli` (github.com/lightningnetwork/lnd releases).
# It starts btcd on regtest and three lnd nodes: alice (the payer), bob (the
# payee's flow node) and carol (the payee's vault node); funds alice; opens
# channels alice -> bob and alice -> carol. Then, to run the test:
#
#   MOR_LN_REGTEST=RUN_DIR cargo test -p mor-harness --test lightning_rail -- --nocapture
#
# Stop it with ./down.sh RUN_DIR. Everything lives in RUN_DIR, which this
# script empties first.
set -euo pipefail
R=${1:?usage: up.sh RUN_DIR}
B=${BTCD_DIR:?set BTCD_DIR to the directory holding btcd and btcctl}
L=${LND_DIR:?set LND_DIR to the directory holding lnd and lncli}
mkdir -p "$R"; R=$(cd "$R" && pwd)
rm -rf "${R:?}"/*; mkdir -p "$R/btcd"

C() { "$B/btcctl" --regtest --rpcuser=u --rpcpass=p --rpcserver=127.0.0.1:18334 --rpccert="$R/btcd/rpc.cert" "$@" 2>/dev/null; }
startbtcd() {
  nohup "$B/btcd" --regtest --datadir="$R/btcd/data" --logdir="$R/btcd/log" --rpcuser=u --rpcpass=p \
    --rpclisten=127.0.0.1:18334 --listen=127.0.0.1:18444 --rpccert="$R/btcd/rpc.cert" --rpckey="$R/btcd/rpc.key" \
    --txindex "$@" > "$R/btcd.out" 2>&1 &
  echo $! > "$R/btcd.pid"
  until C getblockcount >/dev/null; do sleep 1; done
}
# name, gRPC port, peer port, REST port
NODES="alice:10009:9735:18080 bob:10010:9736:18081 carol:10011:9737:18082"
node() { local n=$1; shift; local rpc; rpc=$(echo "$NODES" | tr ' ' '\n' | grep "^$n:" | cut -d: -f2)
  "$L/lncli" --lnddir="$R/$n" --network=regtest --rpcserver=127.0.0.1:$rpc "$@"; }
field() { sed -n "s/.*\"$1\": *\"\([^\"]*\)\".*/\1/p" | head -n 1; }

startbtcd
for spec in $NODES; do IFS=: read -r n rpc p2p rest <<< "$spec"
  nohup "$L/lnd" --lnddir="$R/$n" --noseedbackup --bitcoin.active --bitcoin.regtest --bitcoin.node=btcd \
    --btcd.rpchost=127.0.0.1:18334 --btcd.rpcuser=u --btcd.rpcpass=p --btcd.rpccert="$R/btcd/rpc.cert" \
    --rpclisten=127.0.0.1:$rpc --listen=127.0.0.1:$p2p --restlisten=127.0.0.1:$rest \
    --tlsextradomain=localhost > "$R/$n.out" 2>&1 &
  echo $! > "$R/$n.pid"
done
for n in alice bob carol; do until node $n getinfo >/dev/null 2>&1; do sleep 1; done; done

# btcd mines to one address it is started with: restart it mining to alice.
ADDR=""
until [ -n "$ADDR" ]; do ADDR=$(node alice newaddress p2wkh 2>/dev/null | field address || true); sleep 1; done
kill "$(cat "$R/btcd.pid")"; while kill -0 "$(cat "$R/btcd.pid")" 2>/dev/null; do sleep 1; done
startbtcd --miningaddr="$ADDR"
# Segregated witness activates on btcd's regtest only after a few hundred blocks.
C generate 500 >/dev/null
until node alice getinfo | grep -q '"synced_to_chain": *true'; do sleep 1; done
for n in bob carol; do
  K=$(node $n getinfo | field identity_pubkey)
  until node $n getinfo | grep -q '"synced_to_chain": *true'; do sleep 1; done
  P=$(echo "$NODES" | tr ' ' '\n' | grep "^$n:" | cut -d: -f3)
  until node alice connect "$K@127.0.0.1:$P" >/dev/null 2>&1 || node alice listpeers | grep -q "$K"; do sleep 1; done
  until node alice openchannel --node_key="$K" --local_amt=5000000 >/dev/null 2>&1; do sleep 1; done
  C generate 1 >/dev/null
done
C generate 6 >/dev/null
until [ "$(node alice listchannels | grep -c '"active": *true')" = 2 ]; do sleep 1; done
echo "regtest Lightning network ready in $R"
