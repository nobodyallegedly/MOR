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
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value BLOB NOT NULL);
";

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

/// A feed row: arrival number, kind, bytes.
pub type Row = (u64, i64, Vec<u8>);

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

    pub fn setting(&self, key: &str) -> R<Option<Vec<u8>>> {
        self.conn
            .query_row("SELECT value FROM settings WHERE key = ?1", [key], |r| {
                r.get(0)
            })
            .optional()
    }

    pub fn set_setting(&self, key: &str, value: &[u8]) -> R<()> {
        self.conn.execute(
            "INSERT INTO settings(key, value) VALUES (?1, ?2) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            params![key, value],
        )?;
        Ok(())
    }
}
