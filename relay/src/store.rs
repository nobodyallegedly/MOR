//! Storage: one SQLite file per relay.
//!
//! Items (acts, sealed containers, media) are stored byte for byte, each with
//! its arrival number: a counter increasing by one with every item stored,
//! local to this relay, never a time (cMIP, "Definitions"). Media bytes live
//! in files beside the database, named by their locked hash.
//!
//! The indexes hold only what a relay can read: an act's outside, and the
//! inside of a public act. A home adds its own tables: the identity chains
//! it holds, its receipt log, its log summaries and its objections.

use mor_core::hash::Hash;
use rusqlite::{params, Connection, OptionalExtension};
use std::path::Path;

pub use rusqlite::Error as DbError;

/// Item kinds, as stored. 0 and 1 are the feed's kinds.
pub mod kind {
    pub const ACT: i64 = 0;
    pub const SEALED: i64 = 1;
    pub const MEDIA: i64 = 2;
}

const SCHEMA: &str = "
CREATE TABLE IF NOT EXISTS items(
    arrival INTEGER PRIMARY KEY AUTOINCREMENT,
    kind INTEGER NOT NULL,
    id BLOB NOT NULL UNIQUE,
    bytes BLOB,
    size INTEGER NOT NULL,
    signer BLOB,
    spec BLOB,
    type INTEGER,
    unaddressed INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS items_signer ON items(signer, arrival);
CREATE INDEX IF NOT EXISTS items_spec ON items(spec, type, arrival);
CREATE TABLE IF NOT EXISTS item_to(target BLOB NOT NULL, arrival INTEGER NOT NULL, PRIMARY KEY(target, arrival));
CREATE TABLE IF NOT EXISTS item_pickup(tag BLOB NOT NULL, arrival INTEGER NOT NULL, PRIMARY KEY(tag, arrival));
CREATE TABLE IF NOT EXISTS about(target BLOB NOT NULL, id BLOB NOT NULL, PRIMARY KEY(target, id));
CREATE TABLE IF NOT EXISTS chain(identity BLOB NOT NULL, position INTEGER NOT NULL, act BLOB NOT NULL, receipt BLOB, PRIMARY KEY(identity, position));
CREATE TABLE IF NOT EXISTS served(identity BLOB PRIMARY KEY);
CREATE TABLE IF NOT EXISTS log(position INTEGER PRIMARY KEY, receipt BLOB NOT NULL);
CREATE TABLE IF NOT EXISTS summaries(size INTEGER PRIMARY KEY, act BLOB NOT NULL);
CREATE TABLE IF NOT EXISTS objections(rotation BLOB PRIMARY KEY, objection BLOB NOT NULL);
CREATE TABLE IF NOT EXISTS own(position INTEGER PRIMARY KEY, act BLOB NOT NULL);
CREATE TABLE IF NOT EXISTS allow(identity BLOB PRIMARY KEY);
CREATE TABLE IF NOT EXISTS proofs(identity BLOB NOT NULL, summary BLOB NOT NULL, receipt BLOB NOT NULL, idx INTEGER NOT NULL, path BLOB NOT NULL, PRIMARY KEY(summary, receipt));
CREATE INDEX IF NOT EXISTS proofs_identity ON proofs(identity);
CREATE TABLE IF NOT EXISTS strict(identity BLOB PRIMARY KEY);
CREATE TABLE IF NOT EXISTS approved(rotation BLOB PRIMARY KEY);
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value BLOB NOT NULL);
CREATE TABLE IF NOT EXISTS pending(rotation BLOB PRIMARY KEY, identity BLOB NOT NULL, position INTEGER NOT NULL, bytes BLOB NOT NULL, at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS pending_identity ON pending(identity, at);
CREATE TABLE IF NOT EXISTS newcomers(identity BLOB PRIMARY KEY, at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS newcomers_at ON newcomers(at);
CREATE TABLE IF NOT EXISTS managers(key BLOB PRIMARY KEY, label TEXT NOT NULL, added INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS pairing(code BLOB PRIMARY KEY, expires INTEGER NOT NULL);
";

/// Rotations awaiting the operator's approval kept per identity: the
/// oldest go first. A stranger can send rotations of a strict identity,
/// but can only push older ones off this list, never onto the chain.
const PENDING_PER_IDENTITY: i64 = 8;

/// What is stored with an item, besides its bytes.
#[derive(Clone, Debug, Default)]
pub struct NewItem {
    pub kind: i64,
    pub id: Hash,
    /// Acts and sealed containers; media bytes are in files.
    pub bytes: Option<Vec<u8>>,
    pub size: u64,
    pub signer: Option<Hash>,
    /// Public acts only: the inside's spec and type.
    pub spec: Option<Hash>,
    pub type_: Option<u64>,
    /// A sealed container whose `to` is empty.
    pub unaddressed: bool,
    pub to: Vec<Hash>,
    pub pickup: Vec<Hash>,
    /// Identities, acts and hashes a public act concerns (its `objects`,
    /// and the fields of Identity payloads that name an identity or act).
    pub about: Vec<Hash>,
}

/// The feed's filters, combined with "and".
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct Filter {
    pub signer: Option<Hash>,
    pub to: Option<Hash>,
    pub pickup: Option<Hash>,
    pub unaddressed: bool,
    pub spec: Option<Hash>,
    pub type_: Option<u64>,
}

pub struct Store {
    conn: Connection,
}

fn h(v: Vec<u8>) -> Hash {
    v.try_into().expect("a stored hash is 32 bytes")
}

type R<T> = Result<T, DbError>;

/// A carried inclusion proof as kept: summary, receipt, index, path.
pub type CarriedProof = (Hash, Hash, u64, Vec<Hash>);

/// A feed row: arrival number, kind, bytes.
pub type Row = (u64, i64, Vec<u8>);

/// An item as the management page lists it: what the relay can read.
#[derive(Clone, Debug)]
pub struct Listed {
    pub arrival: u64,
    pub kind: i64,
    pub id: Hash,
    pub size: u64,
    pub signer: Option<Hash>,
    pub spec: Option<Hash>,
    pub type_: Option<u64>,
}

/// How much a relay holds.
#[derive(Clone, Copy, Debug, Default)]
pub struct Counts {
    pub acts: u64,
    pub sealed: u64,
    pub media: u64,
    /// Bytes of acts, sealed containers and media together.
    pub bytes: u64,
}

/// A rotation refused for want of the operator's approval.
#[derive(Clone, Debug)]
pub struct Pending {
    pub rotation: Hash,
    pub identity: Hash,
    pub position: u64,
    pub bytes: Vec<u8>,
    /// Unix seconds, when it was last sent.
    pub at: i64,
    pub approved: bool,
}

/// A browser paired to manage this relay.
#[derive(Clone, Debug)]
pub struct Manager {
    pub key: [u8; 32],
    pub label: String,
    /// Unix seconds.
    pub added: i64,
}

impl Store {
    pub fn open(path: &Path) -> R<Self> {
        let conn = Connection::open(path)?;
        conn.pragma_update(None, "journal_mode", "WAL")?;
        // Every write reaches the disk before it is answered: a home must never
        // lose a rotation it has receipted (Identity rule 10).
        conn.pragma_update(None, "synchronous", "FULL")?;
        conn.execute_batch(SCHEMA)?;
        Ok(Store { conn })
    }

    pub fn begin(&self) -> R<()> {
        self.conn.execute_batch("BEGIN IMMEDIATE")
    }

    pub fn commit(&self) -> R<()> {
        self.conn.execute_batch("COMMIT")
    }

    pub fn rollback(&self) {
        let _ = self.conn.execute_batch("ROLLBACK");
    }

    // ------------------------------------------------------------ items

    /// Store an item; returns its arrival number.
    pub fn insert_item(&self, it: &NewItem) -> R<u64> {
        self.conn.execute(
            "INSERT INTO items(kind, id, bytes, size, signer, spec, type, unaddressed) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                it.kind,
                it.id.as_slice(),
                it.bytes,
                it.size as i64,
                it.signer.as_ref().map(|s| s.to_vec()),
                it.spec.as_ref().map(|s| s.to_vec()),
                it.type_.map(|t| t as i64),
                it.unaddressed as i64,
            ],
        )?;
        let arrival = self.conn.last_insert_rowid();
        for t in &it.to {
            self.conn.execute(
                "INSERT OR IGNORE INTO item_to(target, arrival) VALUES (?1, ?2)",
                params![t.as_slice(), arrival],
            )?;
        }
        for t in &it.pickup {
            self.conn.execute(
                "INSERT OR IGNORE INTO item_pickup(tag, arrival) VALUES (?1, ?2)",
                params![t.as_slice(), arrival],
            )?;
        }
        for t in &it.about {
            self.conn.execute(
                "INSERT OR IGNORE INTO about(target, id) VALUES (?1, ?2)",
                params![t.as_slice(), it.id.as_slice()],
            )?;
        }
        Ok(arrival as u64)
    }

    /// The arrival number and kind of an item held, by its id.
    pub fn arrival_of(&self, id: &Hash) -> R<Option<(u64, i64)>> {
        self.conn
            .query_row(
                "SELECT arrival, kind FROM items WHERE id = ?1",
                [id.as_slice()],
                |r| Ok((r.get::<_, i64>(0)? as u64, r.get(1)?)),
            )
            .optional()
    }

    /// The bytes of an act or sealed container held, by its id and kind.
    pub fn item(&self, id: &Hash, kind: i64) -> R<Option<Vec<u8>>> {
        self.conn
            .query_row(
                "SELECT bytes FROM items WHERE id = ?1 AND kind = ?2",
                params![id.as_slice(), kind],
                |r| r.get(0),
            )
            .optional()
    }

    /// The size of a media object held.
    pub fn media_size(&self, id: &Hash) -> R<Option<u64>> {
        self.conn
            .query_row(
                "SELECT size FROM items WHERE id = ?1 AND kind = ?2",
                params![id.as_slice(), kind::MEDIA],
                |r| r.get::<_, i64>(0).map(|n| n as u64),
            )
            .optional()
    }

    pub fn max_arrival(&self) -> R<u64> {
        self.conn
            .query_row("SELECT COALESCE(MAX(arrival), 0) FROM items", [], |r| {
                r.get::<_, i64>(0)
            })
            .map(|n| n as u64)
    }

    /// One page of the feed: matching acts and sealed containers after
    /// `after`, in arrival order, and the arrival number to ask after next.
    pub fn feed(&self, f: &Filter, after: u64, limit: u64) -> R<(Vec<Row>, u64)> {
        let max = self.max_arrival()?;
        let mut sql = String::from(
            "SELECT arrival, kind, bytes FROM items WHERE kind IN (0, 1) AND arrival > ?1 AND arrival <= ?2",
        );
        let mut args: Vec<Box<dyn rusqlite::ToSql>> =
            vec![Box::new(after as i64), Box::new(max as i64)];
        let mut arg = |sql: &mut String, clause: &str, v: Box<dyn rusqlite::ToSql>| {
            args.push(v);
            sql.push_str(&clause.replace('?', &format!("?{}", args.len())));
        };
        if let Some(s) = &f.signer {
            arg(&mut sql, " AND signer = ?", Box::new(s.to_vec()));
        }
        if let Some(t) = &f.to {
            arg(
                &mut sql,
                " AND arrival IN (SELECT arrival FROM item_to WHERE target = ?)",
                Box::new(t.to_vec()),
            );
        }
        if let Some(t) = &f.pickup {
            arg(
                &mut sql,
                " AND arrival IN (SELECT arrival FROM item_pickup WHERE tag = ?)",
                Box::new(t.to_vec()),
            );
        }
        if f.unaddressed {
            sql.push_str(" AND kind = 1 AND unaddressed = 1");
        }
        if let Some(s) = &f.spec {
            arg(&mut sql, " AND spec = ?", Box::new(s.to_vec()));
        }
        if let Some(t) = f.type_ {
            arg(&mut sql, " AND type = ?", Box::new(t as i64));
        }
        args.push(Box::new(limit as i64));
        sql.push_str(&format!(" ORDER BY arrival LIMIT ?{}", args.len()));
        let mut st = self.conn.prepare(&sql)?;
        let rows = st
            .query_map(
                rusqlite::params_from_iter(args.iter().map(|b| b.as_ref())),
                |r| Ok((r.get::<_, i64>(0)? as u64, r.get(1)?, r.get(2)?)),
            )?
            .collect::<R<Vec<_>>>()?;
        // A full page continues after its last item; otherwise everything
        // up to `max` has been looked at.
        let next = if rows.len() as u64 == limit {
            rows.last().map(|r| r.0).unwrap_or(after)
        } else {
            max.max(after)
        };
        Ok((rows, next))
    }

    fn acts(&self, sql: &str, p: impl rusqlite::Params) -> R<Vec<(Hash, Vec<u8>)>> {
        let mut st = self.conn.prepare(sql)?;
        let rows = st.query_map(p, |r| Ok((h(r.get(0)?), r.get(1)?)))?;
        rows.collect()
    }

    /// Public acts of one signer, of the given spec and types, in arrival order.
    pub fn acts_by(&self, signer: &Hash, spec: &Hash, types: &[u64]) -> R<Vec<(Hash, Vec<u8>)>> {
        let list = types
            .iter()
            .map(|t| t.to_string())
            .collect::<Vec<_>>()
            .join(",");
        self.acts(
            &format!(
                "SELECT id, bytes FROM items WHERE kind = 0 AND signer = ?1 AND spec = ?2 AND type IN ({list}) ORDER BY arrival"
            ),
            params![signer.as_slice(), spec.as_slice()],
        )
    }

    /// Private acts `signer` signed, held here, in arrival order: acts whose
    /// inside this relay cannot open, so whose spec and type it cannot tell.
    pub fn private_acts_by(&self, signer: &Hash) -> R<Vec<(Hash, Vec<u8>)>> {
        self.acts(
            "SELECT id, bytes FROM items WHERE kind = 0 AND signer = ?1 AND spec IS NULL ORDER BY arrival",
            params![signer.as_slice()],
        )
    }

    /// Public acts of the given spec and types that concern `target`, in arrival order.
    pub fn acts_about(&self, target: &Hash, spec: &Hash, types: &[u64]) -> R<Vec<(Hash, Vec<u8>)>> {
        let list = types
            .iter()
            .map(|t| t.to_string())
            .collect::<Vec<_>>()
            .join(",");
        self.acts(
            &format!(
                "SELECT i.id, i.bytes FROM items i JOIN about a ON a.id = i.id WHERE a.target = ?1 AND i.kind = 0 AND i.spec = ?2 AND i.type IN ({list}) ORDER BY i.arrival"
            ),
            params![target.as_slice(), spec.as_slice()],
        )
    }

    /// Whether any held act of the given spec and type concerns `target`.
    pub fn any_about(&self, target: &Hash, spec: &Hash, type_: u64) -> R<bool> {
        self.conn
            .query_row(
                "SELECT 1 FROM items i JOIN about a ON a.id = i.id WHERE a.target = ?1 AND i.spec = ?2 AND i.type = ?3 LIMIT 1",
                params![target.as_slice(), spec.as_slice(), type_ as i64],
                |_| Ok(()),
            )
            .optional()
            .map(|o| o.is_some())
    }

    // ------------------------------------------------------------ a home's chains

    /// The identity-chain acts a home holds for an identity, by position:
    /// `(position, act, receipt)`.
    pub fn chain(&self, identity: &Hash) -> R<Vec<(u64, Hash, Option<Hash>)>> {
        let mut st = self.conn.prepare(
            "SELECT position, act, receipt FROM chain WHERE identity = ?1 ORDER BY position",
        )?;
        let rows = st.query_map([identity.as_slice()], |r| {
            Ok((
                r.get::<_, i64>(0)? as u64,
                h(r.get(1)?),
                r.get::<_, Option<Vec<u8>>>(2)?.map(h),
            ))
        })?;
        rows.collect()
    }

    pub fn chain_insert(&self, identity: &Hash, position: u64, act: &Hash) -> R<()> {
        self.conn.execute(
            "INSERT INTO chain(identity, position, act) VALUES (?1, ?2, ?3)",
            params![identity.as_slice(), position as i64, act.as_slice()],
        )?;
        Ok(())
    }

    pub fn chain_set_receipt(&self, identity: &Hash, position: u64, receipt: &Hash) -> R<()> {
        self.conn.execute(
            "UPDATE chain SET receipt = ?3 WHERE identity = ?1 AND position = ?2",
            params![identity.as_slice(), position as i64, receipt.as_slice()],
        )?;
        Ok(())
    }

    /// The receipt this home signed for a chain act, if any.
    pub fn receipt_for(&self, act: &Hash) -> R<Option<Hash>> {
        self.conn
            .query_row(
                "SELECT receipt FROM chain WHERE act = ?1",
                [act.as_slice()],
                |r| r.get::<_, Option<Vec<u8>>>(0),
            )
            .optional()
            .map(|o| o.flatten().map(h))
    }

    pub fn is_served(&self, identity: &Hash) -> R<bool> {
        self.conn
            .query_row(
                "SELECT 1 FROM served WHERE identity = ?1",
                [identity.as_slice()],
                |_| Ok(()),
            )
            .optional()
            .map(|o| o.is_some())
    }

    pub fn serve(&self, identity: &Hash) -> R<()> {
        self.conn.execute(
            "INSERT OR IGNORE INTO served(identity) VALUES (?1)",
            [identity.as_slice()],
        )?;
        Ok(())
    }

    // ------------------------------------------------------------ a home's log

    /// The receipt act ids, in log order.
    pub fn log(&self) -> R<Vec<Hash>> {
        let mut st = self
            .conn
            .prepare("SELECT receipt FROM log ORDER BY position")?;
        let rows = st.query_map([], |r| Ok(h(r.get(0)?)))?;
        rows.collect()
    }

    pub fn log_len(&self) -> R<u64> {
        self.conn
            .query_row("SELECT COUNT(*) FROM log", [], |r| r.get::<_, i64>(0))
            .map(|n| n as u64)
    }

    pub fn log_push(&self, position: u64, receipt: &Hash) -> R<()> {
        self.conn.execute(
            "INSERT INTO log(position, receipt) VALUES (?1, ?2)",
            params![position as i64, receipt.as_slice()],
        )?;
        Ok(())
    }

    pub fn log_at(&self, position: u64) -> R<Option<Hash>> {
        self.conn
            .query_row(
                "SELECT receipt FROM log WHERE position = ?1",
                [position as i64],
                |r| Ok(h(r.get(0)?)),
            )
            .optional()
    }

    /// The latest log summary, or the one of a given size.
    pub fn summary(&self, size: Option<u64>) -> R<Option<Hash>> {
        match size {
            Some(n) => self
                .conn
                .query_row(
                    "SELECT act FROM summaries WHERE size = ?1",
                    [n as i64],
                    |r| Ok(h(r.get(0)?)),
                )
                .optional(),
            None => self
                .conn
                .query_row(
                    "SELECT act FROM summaries ORDER BY size DESC LIMIT 1",
                    [],
                    |r| Ok(h(r.get(0)?)),
                )
                .optional(),
        }
    }

    pub fn summary_insert(&self, size: u64, act: &Hash) -> R<()> {
        self.conn.execute(
            "INSERT INTO summaries(size, act) VALUES (?1, ?2)",
            params![size as i64, act.as_slice()],
        )?;
        Ok(())
    }

    /// Every log summary this home signed, oldest first.
    pub fn summaries(&self) -> R<Vec<Hash>> {
        let mut st = self
            .conn
            .prepare("SELECT act FROM summaries ORDER BY size")?;
        let rows = st.query_map([], |r| Ok(h(r.get(0)?)))?;
        rows.collect()
    }

    pub fn objection_for(&self, rotation: &Hash) -> R<Option<Hash>> {
        self.conn
            .query_row(
                "SELECT objection FROM objections WHERE rotation = ?1",
                [rotation.as_slice()],
                |r| Ok(h(r.get(0)?)),
            )
            .optional()
    }

    pub fn objection_insert(&self, rotation: &Hash, objection: &Hash) -> R<()> {
        self.conn.execute(
            "INSERT INTO objections(rotation, objection) VALUES (?1, ?2)",
            params![rotation.as_slice(), objection.as_slice()],
        )?;
        Ok(())
    }

    // ------------------------------------------------------------ the operator's own sequence

    pub fn own(&self) -> R<Vec<Hash>> {
        let mut st = self.conn.prepare("SELECT act FROM own ORDER BY position")?;
        let rows = st.query_map([], |r| Ok(h(r.get(0)?)))?;
        rows.collect()
    }

    pub fn own_push(&self, position: u64, act: &Hash) -> R<()> {
        self.conn.execute(
            "INSERT INTO own(position, act) VALUES (?1, ?2)",
            params![position as i64, act.as_slice()],
        )?;
        Ok(())
    }

    // ------------------------------------------------------------ policy and settings

    pub fn allowed(&self, identity: &Hash) -> R<bool> {
        self.conn
            .query_row(
                "SELECT 1 FROM allow WHERE identity = ?1",
                [identity.as_slice()],
                |_| Ok(()),
            )
            .optional()
            .map(|o| o.is_some())
    }

    pub fn allow(&self, identity: &Hash) -> R<()> {
        self.conn.execute(
            "INSERT OR IGNORE INTO allow(identity) VALUES (?1)",
            [identity.as_slice()],
        )?;
        Ok(())
    }

    pub fn disallow(&self, identity: &Hash) -> R<()> {
        self.conn.execute(
            "DELETE FROM allow WHERE identity = ?1",
            [identity.as_slice()],
        )?;
        Ok(())
    }

    pub fn allow_list(&self) -> R<Vec<Hash>> {
        let mut st = self
            .conn
            .prepare("SELECT identity FROM allow ORDER BY identity")?;
        let rows = st.query_map([], |r| Ok(h(r.get(0)?)))?;
        rows.collect()
    }

    // ------------------------------------------------------------ carried proofs (F101)

    /// Keep a carried inclusion proof, for the identity its receipt names.
    pub fn proof_insert(
        &self,
        identity: &Hash,
        summary: &Hash,
        receipt: &Hash,
        index: u64,
        path: &[Hash],
    ) -> R<()> {
        let p: Vec<u8> = path.iter().flat_map(|h| h.iter().copied()).collect();
        self.conn.execute(
            "INSERT OR IGNORE INTO proofs(identity, summary, receipt, idx, path) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![
                identity.as_slice(),
                summary.as_slice(),
                receipt.as_slice(),
                index as i64,
                p
            ],
        )?;
        Ok(())
    }

    /// The carried proofs kept for an identity: summary, receipt, index, path.
    pub fn proofs_for(&self, identity: &Hash) -> R<Vec<CarriedProof>> {
        let mut st = self.conn.prepare(
            "SELECT summary, receipt, idx, path FROM proofs WHERE identity = ?1 ORDER BY summary, idx",
        )?;
        let rows = st.query_map([identity.as_slice()], |r| {
            let path: Vec<u8> = r.get(3)?;
            Ok((
                h(r.get(0)?),
                h(r.get(1)?),
                r.get::<_, i64>(2)? as u64,
                path.chunks(32).map(|c| h(c.to_vec())).collect(),
            ))
        })?;
        rows.collect()
    }

    /// Identities whose rotations this home accepts only once its operator
    /// has approved them (a registered-device check, simulated).
    pub fn is_strict(&self, identity: &Hash) -> R<bool> {
        self.has("strict", "identity", identity)
    }

    pub fn set_strict(&self, identity: &Hash) -> R<()> {
        self.conn.execute(
            "INSERT OR IGNORE INTO strict(identity) VALUES (?1)",
            [identity.as_slice()],
        )?;
        Ok(())
    }

    pub fn is_approved(&self, rotation: &Hash) -> R<bool> {
        self.has("approved", "rotation", rotation)
    }

    pub fn approve(&self, rotation: &Hash) -> R<()> {
        self.conn.execute(
            "INSERT OR IGNORE INTO approved(rotation) VALUES (?1)",
            [rotation.as_slice()],
        )?;
        Ok(())
    }

    pub fn unset_strict(&self, identity: &Hash) -> R<()> {
        self.conn.execute(
            "DELETE FROM strict WHERE identity = ?1",
            [identity.as_slice()],
        )?;
        Ok(())
    }

    pub fn strict_list(&self) -> R<Vec<Hash>> {
        let mut st = self
            .conn
            .prepare("SELECT identity FROM strict ORDER BY identity")?;
        let rows = st.query_map([], |r| Ok(h(r.get(0)?)))?;
        rows.collect()
    }

    // ------------------------------------------------------------ what the management page shows

    pub fn counts(&self) -> R<Counts> {
        let mut c = Counts::default();
        let mut st = self
            .conn
            .prepare("SELECT kind, COUNT(*), COALESCE(SUM(size), 0) FROM items GROUP BY kind")?;
        let rows = st.query_map([], |r| {
            Ok((
                r.get::<_, i64>(0)?,
                r.get::<_, i64>(1)? as u64,
                r.get::<_, i64>(2)? as u64,
            ))
        })?;
        for row in rows {
            let (k, n, bytes) = row?;
            match k {
                kind::ACT => c.acts = n,
                kind::SEALED => c.sealed = n,
                _ => c.media = n,
            }
            c.bytes += bytes;
        }
        Ok(c)
    }

    /// The latest items, newest first, below arrival `before` if given.
    pub fn recent(&self, before: Option<u64>, limit: u64) -> R<Vec<Listed>> {
        let mut st = self.conn.prepare(
            "SELECT arrival, kind, id, size, signer, spec, type FROM items WHERE arrival < ?1 ORDER BY arrival DESC LIMIT ?2",
        )?;
        let rows = st.query_map(
            params![before.map(|b| b as i64).unwrap_or(i64::MAX), limit as i64],
            |r| {
                Ok(Listed {
                    arrival: r.get::<_, i64>(0)? as u64,
                    kind: r.get(1)?,
                    id: h(r.get(2)?),
                    size: r.get::<_, i64>(3)? as u64,
                    signer: r.get::<_, Option<Vec<u8>>>(4)?.map(h),
                    spec: r.get::<_, Option<Vec<u8>>>(5)?.map(h),
                    type_: r.get::<_, Option<i64>>(6)?.map(|t| t as u64),
                })
            },
        )?;
        rows.collect()
    }

    /// The identities this home serves.
    pub fn served(&self) -> R<Vec<Hash>> {
        let mut st = self
            .conn
            .prepare("SELECT identity FROM served ORDER BY identity")?;
        let rows = st.query_map([], |r| Ok(h(r.get(0)?)))?;
        rows.collect()
    }

    // ------------------------------------------------------------ rotations awaiting approval

    /// Keep a rotation refused for want of approval, or note that it came again.
    pub fn pending_insert(
        &self,
        rotation: &Hash,
        identity: &Hash,
        position: u64,
        bytes: &[u8],
        at: i64,
    ) -> R<()> {
        self.conn.execute(
            "INSERT INTO pending(rotation, identity, position, bytes, at) VALUES (?1, ?2, ?3, ?4, ?5) ON CONFLICT(rotation) DO UPDATE SET at = excluded.at",
            params![rotation.as_slice(), identity.as_slice(), position as i64, bytes, at],
        )?;
        self.conn.execute(
            "DELETE FROM pending WHERE identity = ?1 AND rotation NOT IN (SELECT rotation FROM pending WHERE identity = ?1 ORDER BY at DESC, rotation LIMIT ?2)",
            params![identity.as_slice(), PENDING_PER_IDENTITY],
        )?;
        Ok(())
    }

    /// A chain act is held at `position`: rotations awaiting approval at
    /// that position or before are settled, one way or the other.
    pub fn pending_settle(&self, identity: &Hash, position: u64) -> R<()> {
        self.conn.execute(
            "DELETE FROM pending WHERE identity = ?1 AND position <= ?2",
            params![identity.as_slice(), position as i64],
        )?;
        Ok(())
    }

    pub fn pending(&self) -> R<Vec<Pending>> {
        let mut st = self.conn.prepare(
            "SELECT p.rotation, p.identity, p.position, p.bytes, p.at, a.rotation IS NOT NULL FROM pending p LEFT JOIN approved a ON a.rotation = p.rotation ORDER BY p.at DESC, p.rotation",
        )?;
        let rows = st.query_map([], |r| {
            Ok(Pending {
                rotation: h(r.get(0)?),
                identity: h(r.get(1)?),
                position: r.get::<_, i64>(2)? as u64,
                bytes: r.get(3)?,
                at: r.get(4)?,
                approved: r.get(5)?,
            })
        })?;
        rows.collect()
    }

    // ------------------------------------------------------------ new identities

    pub fn newcomer(&self, identity: &Hash, at: i64) -> R<()> {
        self.conn.execute(
            "INSERT OR IGNORE INTO newcomers(identity, at) VALUES (?1, ?2)",
            params![identity.as_slice(), at],
        )?;
        Ok(())
    }

    /// How many new identities this home took since `since` (Unix seconds).
    pub fn newcomers_since(&self, since: i64) -> R<u64> {
        self.conn
            .query_row(
                "SELECT COUNT(*) FROM newcomers WHERE at >= ?1",
                [since],
                |r| r.get::<_, i64>(0),
            )
            .map(|n| n as u64)
    }

    // ------------------------------------------------------------ management keys and pairing codes

    pub fn managers(&self) -> R<Vec<Manager>> {
        let mut st = self
            .conn
            .prepare("SELECT key, label, added FROM managers ORDER BY added, rowid")?;
        let rows = st.query_map([], |r| {
            let k: Vec<u8> = r.get(0)?;
            Ok(Manager {
                key: k.try_into().expect("a stored key is 32 bytes"),
                label: r.get(1)?,
                added: r.get(2)?,
            })
        })?;
        rows.collect()
    }

    pub fn is_manager(&self, key: &[u8; 32]) -> R<bool> {
        self.has("managers", "key", key)
    }

    pub fn manager_insert(&self, key: &[u8; 32], label: &str, at: i64) -> R<()> {
        self.conn.execute(
            "INSERT OR IGNORE INTO managers(key, label, added) VALUES (?1, ?2, ?3)",
            params![key.as_slice(), label, at],
        )?;
        Ok(())
    }

    /// Returns whether the key was paired.
    pub fn manager_remove(&self, key: &[u8; 32]) -> R<bool> {
        Ok(self
            .conn
            .execute("DELETE FROM managers WHERE key = ?1", [key.as_slice()])?
            > 0)
    }

    /// Keep a pairing code, by its hash, until `expires` (Unix seconds).
    pub fn pairing_insert(&self, code: &Hash, expires: i64) -> R<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO pairing(code, expires) VALUES (?1, ?2)",
            params![code.as_slice(), expires],
        )?;
        Ok(())
    }

    /// Use a pairing code: true if it was there and unexpired. It is gone
    /// either way, and so is every expired one.
    pub fn pairing_take(&self, code: &Hash, now: i64) -> R<bool> {
        let live = self
            .conn
            .query_row(
                "SELECT expires FROM pairing WHERE code = ?1",
                [code.as_slice()],
                |r| r.get::<_, i64>(0),
            )
            .optional()?
            .is_some_and(|e| e > now);
        self.conn.execute(
            "DELETE FROM pairing WHERE code = ?1 OR expires <= ?2",
            params![code.as_slice(), now],
        )?;
        Ok(live)
    }

    fn has(&self, table: &str, column: &str, key: &[u8]) -> R<bool> {
        self.conn
            .query_row(
                &format!("SELECT 1 FROM {table} WHERE {column} = ?1"),
                [key],
                |_| Ok(()),
            )
            .optional()
            .map(|o| o.is_some())
    }

    pub fn setting(&self, key: &str) -> R<Option<Vec<u8>>> {
        self.conn
            .query_row("SELECT value FROM settings WHERE key = ?1", [key], |r| {
                r.get(0)
            })
            .optional()
    }

    pub fn remove_setting(&self, key: &str) -> R<()> {
        self.conn
            .execute("DELETE FROM settings WHERE key = ?1", [key])?;
        Ok(())
    }

    pub fn set_setting(&self, key: &str, value: &[u8]) -> R<()> {
        self.conn.execute(
            "INSERT INTO settings(key, value) VALUES (?1, ?2) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            params![key, value],
        )?;
        Ok(())
    }
}
