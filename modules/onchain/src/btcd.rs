//! A minimal client for a btcd node on regtest: start one, mine, broadcast,
//! connect and disconnect peers, and read what a payer's wallet and a
//! payee's watcher need to build a payment's proof from the chain. Test
//! networks only: nothing here is meant to hold real money.

use crate::{block, Block, OnchainProof, Paid, CONFIRMATIONS};
use serde_json::{json, Value};
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};

pub type R<T> = Result<T, String>;

/// A btcd node this process started on regtest, stopped when dropped.
pub struct Node {
    pub rpc: Btcd,
    /// Its peer-to-peer address, for another node to connect to.
    pub p2p: String,
    child: Child,
}

impl Node {
    /// Start `btcd` from `bin` on regtest in `dir` (emptied first), mining
    /// to `mining_address`, with its RPC on `rpc_port` without TLS (this
    /// machine only) and peers on `p2p_port`.
    pub async fn start(bin: &Path, dir: &Path, rpc_port: u16, p2p_port: u16, mining_address: &str) -> R<Node> {
        let _ = std::fs::remove_dir_all(dir);
        std::fs::create_dir_all(dir).map_err(|e| e.to_string())?;
        let child = Command::new(bin.join("btcd"))
            .args([
                "--regtest",
                "--notls",
                "--txindex",
                "--rpcuser=u",
                "--rpcpass=p",
                &format!("--rpclisten=127.0.0.1:{rpc_port}"),
                &format!("--listen=127.0.0.1:{p2p_port}"),
                &format!("--datadir={}", dir.join("data").display()),
                &format!("--logdir={}", dir.join("log").display()),
                &format!("--configfile={}", dir.join("btcd.conf").display()),
                &format!("--miningaddr={mining_address}"),
            ])
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
            .map_err(|e| format!("starting btcd: {e}"))?;
        let rpc = Btcd::new(&format!("http://127.0.0.1:{rpc_port}"))?;
        for _ in 0..100 {
            if rpc.block_count().await.is_ok() {
                return Ok(Node { rpc, p2p: format!("127.0.0.1:{p2p_port}"), child });
            }
            tokio::time::sleep(std::time::Duration::from_millis(200)).await;
        }
        Err("btcd did not answer".into())
    }

    pub fn dir_in(base: &Path, name: &str) -> PathBuf {
        base.join(name)
    }
}

impl Drop for Node {
    fn drop(&mut self) {
        let _ = self.child.kill();
        let _ = self.child.wait();
    }
}

/// A btcd node's JSON-RPC, user `u`, password `p`.
pub struct Btcd {
    url: String,
    http: reqwest::Client,
}

/// A hash as btcd shows it (reversed) from Bitcoin's own byte order, and
/// back.
pub fn shown(h: &[u8; 32]) -> String {
    h.iter().rev().map(|b| format!("{b:02x}")).collect()
}

pub fn unshown(s: &str) -> R<[u8; 32]> {
    let mut b = unhex(s)?;
    b.reverse();
    b.try_into().map_err(|_| "not 32 bytes".into())
}

pub fn unhex(s: &str) -> R<Vec<u8>> {
    (0..s.len())
        .step_by(2)
        .map(|i| u8::from_str_radix(s.get(i..i + 2).ok_or("odd hex")?, 16).map_err(|e| e.to_string()))
        .collect()
}

pub fn hex(b: &[u8]) -> String {
    b.iter().map(|x| format!("{x:02x}")).collect()
}

impl Btcd {
    pub fn new(url: &str) -> R<Btcd> {
        let http = reqwest::Client::builder().no_proxy().build().map_err(|e| e.to_string())?;
        Ok(Btcd { url: url.into(), http })
    }

    pub async fn call(&self, method: &str, params: Value) -> R<Value> {
        let rs = self
            .http
            .post(&self.url)
            .basic_auth("u", Some("p"))
            .json(&json!({"jsonrpc": "1.0", "id": 1, "method": method, "params": params}))
            .send()
            .await
            .map_err(|e| e.to_string())?;
        let v: Value = rs.json().await.map_err(|e| e.to_string())?;
        if !v["error"].is_null() {
            return Err(format!("{method}: {}", v["error"]));
        }
        Ok(v["result"].clone())
    }

    pub async fn block_count(&self) -> R<u64> {
        self.call("getblockcount", json!([])).await?.as_u64().ok_or("a count".into())
    }

    /// Mine `n` blocks to the node's mining address; their hashes.
    pub async fn generate(&self, n: u64) -> R<Vec<[u8; 32]>> {
        let v = self.call("generate", json!([n])).await?;
        v.as_array().ok_or("hashes")?.iter().map(|h| unshown(h.as_str().ok_or("a hash")?)).collect()
    }

    pub async fn block_hash(&self, height: u64) -> R<[u8; 32]> {
        unshown(self.call("getblockhash", json!([height])).await?.as_str().ok_or("a hash")?)
    }

    pub async fn header(&self, hash: &[u8; 32]) -> R<[u8; 80]> {
        let v = self.call("getblockheader", json!([shown(hash), false])).await?;
        unhex(v.as_str().ok_or("a header")?)?.try_into().map_err(|_| "not 80 bytes".into())
    }

    /// Whether a block is on this node's best chain: what a client running
    /// a node can see beside the rule's answer, and the rule cannot (btcd
    /// refuses to describe a block that is not in its main chain).
    pub async fn on_best_chain(&self, hash: &[u8; 32]) -> R<bool> {
        match self.call("getblockheader", json!([shown(hash), true])).await {
            Ok(v) => Ok(v["confirmations"].as_i64().is_some_and(|c| c > 0)),
            Err(e) if e.contains("not in the main chain") => Ok(false),
            Err(e) => Err(e),
        }
    }

    /// A block's height, and its confirmations, for a block on this node's
    /// best chain.
    pub async fn header_info(&self, hash: &[u8; 32]) -> R<(u64, i64)> {
        let v = self.call("getblockheader", json!([shown(hash), true])).await?;
        Ok((v["height"].as_u64().ok_or("a height")?, v["confirmations"].as_i64().ok_or("confirmations")?))
    }

    pub async fn block_txids(&self, hash: &[u8; 32]) -> R<Vec<[u8; 32]>> {
        let v = self.call("getblock", json!([shown(hash), 1])).await?;
        v["tx"].as_array().ok_or("txs")?.iter().map(|t| unshown(t.as_str().ok_or("a txid")?)).collect()
    }

    /// A transaction as the node serialises it (with its witness), and the
    /// block holding it on this node's best chain, if any.
    pub async fn transaction(&self, txid: &[u8; 32]) -> R<(Vec<u8>, Option<[u8; 32]>)> {
        let v = self.call("getrawtransaction", json!([shown(txid), 1])).await?;
        let raw = unhex(v["hex"].as_str().ok_or("hex")?)?;
        let block = match v["blockhash"].as_str() {
            Some(b) if !b.is_empty() => Some(unshown(b)?),
            _ => None,
        };
        Ok((raw, block))
    }

    pub async fn send(&self, raw: &[u8]) -> R<[u8; 32]> {
        unshown(self.call("sendrawtransaction", json!([hex(raw)])).await?.as_str().ok_or("a txid")?)
    }

    /// An unspent output, or `None` where it is spent or never existed on
    /// this node's best chain.
    pub async fn unspent(&self, txid: &[u8; 32], vout: u32) -> R<Option<Value>> {
        let v = self.call("gettxout", json!([shown(txid), vout, false])).await?;
        Ok((!v.is_null()).then_some(v))
    }

    pub async fn connect(&self, peer: &str) -> R<()> {
        self.call("node", json!(["connect", peer, "perm"])).await.map(|_| ())
    }

    pub async fn disconnect(&self, peer: &str) -> R<()> {
        // A permanent peer is removed; a temporary one disconnected.
        match self.call("node", json!(["remove", peer])).await {
            Ok(_) => Ok(()),
            Err(_) => self.call("node", json!(["disconnect", peer])).await.map(|_| ()),
        }
    }

    pub async fn peers(&self) -> R<usize> {
        Ok(self.call("getpeerinfo", json!([])).await?.as_array().map_or(0, |a| a.len()))
    }

    pub async fn best(&self) -> R<[u8; 32]> {
        unshown(self.call("getbestblockhash", json!([])).await?.as_str().ok_or("a hash")?)
    }

    /// The proof of a payment as this node's best chain shows it, built the
    /// way the payer's wallet and the payee's watcher each build it: the
    /// request the payee's side gave, the transaction without its witness
    /// (`tx`), its output, and, once mined, its block's branch and at most
    /// [`CONFIRMATIONS`] headers. Two parties reading the same chain build
    /// the same bytes.
    pub async fn proof(&self, request: [u8; 64], tx: &[u8], output: u64) -> R<OnchainProof> {
        let txid = crate::tx::dsha256(tx);
        let (_, at) = self.transaction(&txid).await?;
        let block = match at {
            None => None,
            Some(hash) => {
                let (height, _) = self.header_info(&hash).await?;
                let txids = self.block_txids(&hash).await?;
                let index = txids.iter().position(|t| t == &txid).ok_or("the block does not list it")?;
                let branch = block::merkle_branch(&txids, index).ok_or("a branch")?;
                let tip = self.block_count().await?;
                let mut headers = vec![];
                for hgt in height..=tip.min(height + CONFIRMATIONS as u64 - 1) {
                    headers.push(self.header(&self.block_hash(hgt).await?).await?);
                }
                Some(Block { index: index as u64, branch, headers })
            }
        };
        Ok(OnchainProof { request, confirmations: None, paid: Some(Paid { tx: tx.to_vec(), output, block }) })
    }

    /// The headers of this node's best chain, from its genesis to its tip:
    /// what a client hands the rule as data (F204). The node checked them
    /// (work, difficulty schedule, times) as every node does.
    pub async fn chain(&self, network: crate::Network) -> R<crate::chain::HeaderChain> {
        let tip = self.block_count().await?;
        let mut headers = Vec::with_capacity(tip as usize + 1);
        for hgt in 0..=tip {
            headers.push(self.header(&self.block_hash(hgt).await?).await?);
        }
        Ok(crate::chain::HeaderChain::new(network, 0, headers)?)
    }
}
