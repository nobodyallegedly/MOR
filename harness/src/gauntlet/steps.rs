//! The gauntlet's steps, in the freeze test suite's order.

use super::*;

fn receipted(p: &Put) -> bool {
    matches!(p, Ok(r) if r.receipt.is_some())
}

fn objected(p: &Put) -> bool {
    matches!(p, Ok(r) if r.objection.is_some())
}

fn homeless(basis: Basis, final_: bool) -> How {
    How::Homeless { basis, final_ }
}

/// The inbox and the encryption key that count for an identity, from the
/// routes and encryption-key chains the reader holds: void or invalid acts
/// never count (Identity, "Declarations, succession, routes...").
fn inbox_and_key(rd: &Reader, id: &Hash) -> Option<(String, envelope::EncKey)> {
    let specs = Specs::test();
    let counts = |h: &Hash| matches!(rd.status(h), Status::Valid | Status::Disputed);
    let mut routes = vec![];
    let mut keys = vec![];
    for h in rd.v.signed_by(id) {
        if !counts(&h.id) {
            continue;
        }
        if h.inside.spec == specs.identity && h.inside.type_ == 3 {
            if let Ok(r) = Routes::decode(&h.inside.payload) {
                routes.push((h.id, r));
            }
        } else if h.inside.spec == specs.envelope && h.inside.type_ == 4 {
            if let Ok(k) = EncryptionKey::decode(&h.inside.payload) {
                keys.push((h.id, k));
            }
        }
    }
    let r = envelope::latest(
        &routes
            .iter()
            .map(|(i, r)| (*i, r.version))
            .collect::<Vec<_>>(),
    );
    let k = envelope::latest(
        &keys
            .iter()
            .map(|(i, k)| (*i, k.version))
            .collect::<Vec<_>>(),
    );
    let route = routes.iter().find(|(i, _)| Some(*i) == r.act)?;
    let key = keys.iter().find(|(i, _)| Some(*i) == k.act)?;
    let inbox = route.1.inbox(&sha256(b"a text specification"))?;
    Some((inbox.hints[0].clone(), key.1.key.clone()))
}

fn seal_to(msg: &Act, key: &[u8; 32], id: &Hash, ek: envelope::EncKey) -> envelope::Sealed {
    let one_time_secret = loop {
        let s = random::<32>();
        if mor_core::sig::SchnorrKey::from_secret(&s).is_some() {
            break s;
        }
    };
    let rnd = SealRandom {
        container_key: random::<32>(),
        nonce: random::<24>(),
        eseeds: vec![random::<64>()],
        one_time_secret,
        aux: random::<32>(),
    };
    envelope::seal(
        msg,
        Some(key),
        &[Recipient::Identity { id: *id, key: ek }],
        &rnd,
    )
    .expect("a sealed container")
}

impl Gauntlet {
    // ------------------------------------------------------------ 5.5, 5.6, 5.7 on the real homes

    pub(super) async fn step6_majority(&mut self) {
        let real = Ran::RealHomes;
        let homes: Vec<Home> = self.real.iter().map(|h| h.home()).collect();
        let (g, mut a) = self.born("A", homes, None);
        if let Err(e) = self.allow_on_machine(&a.id).await {
            self.check(
                "5.6",
                real,
                "A is listed at the home on the author's machine",
                false,
                e,
            );
        }
        fn all(s: &Gauntlet) -> Vec<&Site> {
            s.real.iter().collect()
        }
        let puts = Self::put_all(&all(self), &g).await;
        self.check(
            "5.6",
            real,
            "A is born at three homes under three operators, declaring no rule: each home receipts its genesis",
            puts.iter().all(receipted),
            Self::answers(&puts),
        );
        let routes = a.routes(1, None, &self.real[0].base);
        let p = a.post("posted before any rotation");
        for x in [&routes, &p] {
            Self::put_all(&all(self), x).await;
        }

        // 5.5: a routine rotation keeps the history before it.
        let (r1, a1) = a.rotation(Rot::default());
        let puts = Self::put_all(&all(self), &r1).await;
        let mut rd = self.read(&a.id, &[&self.real[0]], &[], &[]).await;
        rd.add_act(&p);
        let res = rd.resolve(&a.id);
        let ok = puts.iter().all(receipted)
            && rd.chain(&a.id) == vec![a.id, r1.id()]
            && res.links.get(1).map(|l| l.how) == Some(How::Homes);
        self.check(
            "5.5",
            real,
            "A rotates routinely: all three homes receipt it, and a reader counts it by the majority rule (the default for three homes and no rule)",
            ok,
            format!("{}; chain {} long", Self::answers(&puts), res.links.len()),
        );
        self.check(
            "5.5",
            real,
            "A's post from before the rotation stays valid, proved from the rotation alone",
            rd.status(&p.id()) == Status::Valid,
            format!("{:?}", rd.status(&p.id())),
        );
        self.done(&rd);

        // 5.6: one home does not store it.
        self.switch_machine(false).await;
        let (r2, mut a2) = a1.rotation(Rot::default());
        let two = Self::put_all(&[&self.real[0], &self.real[1]], &r2).await;
        let third = Self::put(&self.real[2], &r2).await;
        let after = a2.post("posted under the new key");
        Self::put_all(&[&self.real[0], &self.real[1]], &after).await;
        let mut rd = self.read(&a.id, &[&self.real[0]], &[], &[]).await;
        rd.add_act(&after);
        let ok = two.iter().all(receipted)
            && third.is_err()
            && rd.chain(&a.id) == vec![a.id, r1.id(), r2.id()];
        self.check(
            "5.6",
            real,
            "with the author's machine switched off, A's rotation counts on the receipts of the other two homes: two of three operators",
            ok,
            format!(
                "{}; the third: {}",
                Self::answers(&two),
                Self::answers(std::slice::from_ref(&third))
            ),
        );
        self.check(
            "5.6",
            real,
            "an act signed under the new key is valid",
            rd.status(&after.id()) == Status::Valid,
            format!("{:?}", rd.status(&after.id())),
        );
        self.done(&rd);
        self.switch_machine(true).await;
        let back = Self::put(&self.real[2], &r2).await;
        self.check(
            "5.6",
            real,
            "the home comes back, and receipts the same rotation bytes, resent",
            receipted(&back),
            Self::answers(std::slice::from_ref(&back)),
        );

        // One home of three is not a majority.
        let (r3, a3) = a2.rotation(Rot::default());
        let one = Self::put(&self.real[0], &r3).await;
        let rd = self.read(&a.id, &[&self.real[0]], &[], &[]).await;
        let pending = rd.resolve(&a.id).stop == Stop::Pending(vec![r3.id()]);
        self.check(
            "5.6",
            real,
            "a rotation one home of three holds is pending: not a majority",
            receipted(&one) && pending && rd.chain(&a.id).len() == 3,
            format!("{:?}", rd.resolve(&a.id).stop),
        );
        self.done(&rd);
        let rest = Self::put_all(&[&self.real[1], &self.real[2]], &r3).await;
        let rd = self.read(&a.id, &[&self.real[0]], &[], &[]).await;
        self.check(
            "5.6",
            real,
            "it counts once the other homes hold it",
            rest.iter().all(receipted) && rd.chain(&a.id).last() == Some(&r3.id()),
            Self::answers(&rest),
        );
        self.done(&rd);

        // 5.7 on the real homes: first held wins.
        let (r4, _) = a3.rotation(Rot::default());
        let own = Self::put_all(&all(self), &r4).await;
        let (rival, _) = a3.rotation(Rot {
            signing_key: Some(a.thief_key("5.7")),
            ..Default::default()
        });
        let thief = Self::put_all(&all(self), &rival).await;
        let told = thief.iter().all(|p| match p {
            Err(ClientError::Wire(e)) => {
                e.code == code::CONFLICT
                    && e.acts.first() == Some(&r4.encode())
                    && e.acts.len() == 2
            }
            _ => false,
        });
        let mut rd = self.read(&a.id, &[&self.real[0]], &[], &[]).await;
        rd.add_act(&rival);
        let ok = own.iter().all(receipted)
            && told
            && rd.chain(&a.id).last() == Some(&r4.id())
            && rd.status(&rival.id()) == Status::Invalid;
        self.check(
            "5.7",
            real,
            "a thief holding A's safety key arrives second at every home: each answers error 4 with A's rotation and its receipt, and A's rotation counts",
            ok,
            Self::answers(&thief),
        );
        self.done(&rd);
    }

    pub(super) async fn step6_self_hosted(&mut self) {
        let real = Ran::RealHomes;
        let mut made: Option<(Act, Person)> = None;
        let backups = vec![self.real[0].home(), self.real[1].home()];
        let seed = self.seed;
        let own = Site::start_as(
            &self.run,
            "B-self",
            Role::Home,
            Policy::Open,
            &self.http,
            |base| {
                let mut homes = vec![Home {
                    operator: None,
                    hint: base.to_string(),
                }];
                homes.extend(backups);
                let (g, b) = Person::genesis(&seed, "B", homes, None, None);
                let keys = Keys {
                    identity: b.id,
                    binding: b.id,
                    signing_secret: b.signing_secret(),
                    safety: None,
                };
                let chain = vec![g.encode()];
                made = Some((g, b));
                OperatorSetup::Existing { keys, chain }
            },
        )
        .await;
        let (g, b) = made.expect("B was made");
        let puts = Self::put_all(&[&self.real[0], &self.real[1]], &g).await;
        self.check(
            "5.6",
            real,
            "B is born self-hosted, on a home it runs on this machine, with two public homes as backups: the backups receipt its genesis",
            puts.iter().all(receipted),
            Self::answers(&puts),
        );
        let warning = "B is self-hosted: its rotations count on its own signature, with no receipt. A thief holding B's safety key would win at once, as at a single lax home (Identity rule 22a).";
        self.report.say(warning);
        self.check(
            "5.6",
            Ran::Conformance,
            "the client tells B's owner plainly what self-hosting costs",
            true,
            warning,
        );
        let (rb, _) = b.rotation(Rot::default());
        let at_own = Self::put(&own, &rb).await;
        let at_backups = Self::put_all(&[&self.real[0], &self.real[1]], &rb).await;
        let mut rd = self.reader();
        rd.fetch_record(&b.id, &own.base).await;
        let alone = rd.chain(&b.id) == vec![b.id, rb.id()];
        self.done(&rd);
        self.check(
            "5.6",
            real,
            "B rotates with no receipt: a reader holding only what B's own home serves counts the rotation",
            matches!(&at_own, Ok(r) if r.receipt.is_none()) && alone,
            format!("backups: {}", Self::answers(&at_backups)),
        );
        let rd = self.read(&b.id, &[&own], &[], &[]).await;
        self.check(
            "5.6",
            real,
            "a reader following B to all its homes counts the same rotation; the self-hosted home is authoritative, the others backups (the default)",
            rd.chain(&b.id) == vec![b.id, rb.id()] && rd.resolve(&b.id).links[1].how == How::Homes,
            "",
        );
        self.done(&rd);
    }

    // ------------------------------------------------------------ 5.7: strict and lax homes

    pub(super) async fn step7_strict_homes(&mut self) {
        let t = Ran::Throwaway;
        let s1 = self.throwaway("strict-1").await;
        let s2 = self.throwaway("strict-2").await;
        let lax = self.throwaway("lax").await;
        let (g, mut j) = self.born("J", vec![s1.home(), s2.home(), lax.home()], None);
        Self::put_all(&[&s1, &s2, &lax], &g).await;
        for s in [&s1, &s2] {
            s.with_node(|n| n.set_strict(&j.id)).expect("strict");
        }
        let said = "J chose a device policy at two of its three homes: a rotation there needs the registered device. Losing that device is survivable here, since the third home and the majority remain, and the signing seed was backed up first (rules 12, 12a, 37).";
        self.report.say(said);
        self.check("5.7", Ran::Conformance, "the client says what the device policy costs, and asks for the signing seed's backup first", true, said);
        let p = j.post("posted before the theft");
        Self::put_all(&[&s1, &s2, &lax], &p).await;

        let (thief, mut t1) = j.rotation(Rot {
            signing_key: Some(j.thief_key("7")),
            ..Default::default()
        });
        let tp = Self::put_all(&[&s1, &s2, &lax], &thief).await;
        self.check(
            "5.7",
            t,
            "a thief holding J's safety key submits a rotation first: both strict homes refuse it (error 5, no approval), the lax home receipts it",
            code_of(&tp[0]) == Some(code::REFUSED)
                && code_of(&tp[1]) == Some(code::REFUSED)
                && receipted(&tp[2]),
            Self::answers(&tp),
        );
        let (own, _) = j.rotation(Rot::default());
        for s in [&s1, &s2] {
            s.with_node(|n| n.approve(&own.id())).expect("approve");
        }
        let op = Self::put_all(&[&s1, &s2, &lax], &own).await;
        self.check(
            "5.7",
            t,
            "J's own rotation, approved as coming from the registered device: the strict homes receipt it; the lax home answers error 4 with the thief's",
            receipted(&op[0]) && receipted(&op[1]) && code_of(&op[2]) == Some(code::CONFLICT),
            Self::answers(&op),
        );
        let tpost = t1.post("posted under the thief's key");
        let _ = Self::put(&lax, &tpost).await;
        let mut rd = self.read(&j.id, &[&s1], &[], &[]).await;
        rd.add_act(&p);
        rd.add_act(&tpost);
        let ok = rd.chain(&j.id) == vec![j.id, own.id()]
            && rd.status(&thief.id()) == Status::Invalid
            && rd.status(&tpost.id()) == Status::Invalid
            && rd.status(&p.id()) == Status::Valid;
        self.check(
            "5.7",
            t,
            "the thief's rotation, held only by the lax home, misses the majority: J's counts, the thief's acts are invalid, J's history stays valid, and the lax home is outvoted",
            ok,
            format!("chain {} long", rd.chain(&j.id).len()),
        );
        self.done(&rd);
    }

    pub(super) async fn step7_lost_phone(&mut self) {
        let t = Ran::Throwaway;
        let strict = self.throwaway("strict-home").await;
        let new = self.throwaway("new-home").await;
        let (g, j) = self.born("J-phone", vec![strict.home()], None);
        let _ = Self::put(&strict, &g).await;
        strict.with_node(|n| n.set_strict(&j.id)).expect("strict");
        let said = "A device policy at your only home: if you lose the registered device, the home refuses every rotation, and you can leave only with both keys. Back up your signing seed first (rules 12, 12a).";
        self.report.say(said);
        self.check(
            "5.7",
            Ran::Conformance,
            "the client says plainly what a device policy at a single home costs",
            true,
            said,
        );
        // The phone is lost; the signing key comes back from its seed backup.
        let mut restored = j.clone();
        let (normal, _) = j.rotation(Rot::default());
        let refused = Self::put(&strict, &normal).await;
        let (hr, j1) = j.rotation(Rot {
            homeless: true,
            homes: Some(vec![new.home()]),
            ..Default::default()
        });
        let at_new = Self::give(&new, &[&g, &hr]).await;
        let at_strict = Self::put(&strict, &hr).await;
        let e = restored.endorse(&hr.id(), Some(vec![normal.id()]));
        Self::put_all(&[&new, &strict], &e).await;
        let rd = self.read(&j.id, &[&strict, &new], &[], &[]).await;
        let res = rd.resolve(&j.id);
        let ok = code_of(&refused) == Some(code::REFUSED)
            && objected(&at_strict)
            && receipted(&at_new[1])
            && rd.chain(&j.id) == vec![j.id, hr.id()]
            && res.links.get(1).map(|l| l.how) == Some(homeless(Basis::Escape, false));
        self.check(
            "5.7",
            t,
            "the phone is lost at the strict home: the normal rotation is refused, the homeless rotation objected to; with the signing key restored from its seed, the journalist leaves with both keys",
            ok,
            format!("{:?}", res.links.last().map(|l| l.how)),
        );
        self.done(&rd);
        let (r2, _) = j1.rotation(Rot::default());
        let _ = Self::put(&new, &r2).await;
        let rd = self.read(&j.id, &[&strict, &new], &[], &[]).await;
        let res = rd.resolve(&j.id);
        self.check(
            "5.7",
            t,
            "the next rotation, at the new home, makes the escape final",
            res.links.len() == 3
                && res.links.get(1).map(|l| l.how) == Some(homeless(Basis::Escape, true)),
            "",
        );
        self.done(&rd);
    }

    // ------------------------------------------------------------ 5.7b: a stolen operator key

    pub(super) async fn step7b_stolen_operator_key(&mut self) {
        let t = Ran::Throwaway;
        let h = self.throwaway("home-7b").await;
        let n = self.throwaway("new-home-7b").await;
        let mut aud = self.auditor("auditor-7b").await;
        let (g, j) = self.born("J7b", vec![h.home()], None);
        let _ = Self::put(&h, &g).await;
        let (r1, j1) = j.rotation(Rot::default());
        let _ = Self::put(&h, &r1).await;
        let before = aud.cosign_latest(&h).await;

        let (keys, own) = h.stolen_keys();
        let mut stolen =
            Person::from_everyday_key("home-7b", h.op(), keys.binding, &keys.signing_secret, own);
        let forged = stolen.receipt(&j.id, &sha256(b"a made-up rotation"), 1, 1000);
        self.to_relays(&forged).await;
        let rd = self.read(&j.id, &[&h], &[&aud], &[h.op()]).await;
        let res = rd.resolve(&j.id);
        self.check(
            "5.7b",
            t,
            "a thief with the home operator's everyday key signs a receipt naming a made-up act: it changes nothing, and J7b is never contested",
            rd.v.get(&forged.id()).is_some()
                && rd.chain(&j.id) == vec![j.id, r1.id()]
                && res.contested.is_empty(),
            format!("{:?}", res.stop),
        );
        self.done(&rd);

        let (sum, _) = h.client.log_summary(None).await.expect("a summary");
        let size = summary_size(&sum).expect("a summary");
        let prev = Some(Act::decode(&sum).expect("an act").id());
        let mut pair = vec![];
        for root in [b"one".as_slice(), b"two".as_slice()] {
            let s = stolen.identity_act(
                Payload::LogSummary(LogSummary {
                    size: size + 1,
                    root: sha256(root),
                    prev,
                }),
                None,
            );
            self.to_relays(&s).await;
            pair.push(s);
        }
        let rd = self.read(&j.id, &[&h], &[&aud], &[h.op()]).await;
        self.check(
            "5.7b",
            t,
            "the same key signs two log summaries of which neither extends the other: no receipt's standing changes",
            rd.chain(&j.id) == vec![j.id, r1.id()] && rd.resolve(&j.id).contested.is_empty(),
            "",
        );
        self.done(&rd);
        let shown = aud.check_and_cosign(&pair[0].encode(), &[]);
        // The home goes on: another identity's genesis grows its log.
        let (og, _) = self.born("J7b-neighbour", vec![h.home()], None);
        let _ = Self::put(&h, &og).await;
        let after = aud.cosign_latest(&h).await;
        self.check(
            "5.7b",
            t,
            "the auditor, shown a summary that does not extend the one it cosigned, refuses it and stops cosigning that home",
            before.is_ok() && shown.is_err() && after.is_err() && aud.stopped.contains(&h.op()),
            after.err().unwrap_or_default().to_string(),
        );

        // Closure needs the operator's safety key.
        let (fake, _) = stolen.rotation(Rot {
            closure: true,
            ..Default::default()
        });
        let at_home = Self::put(&h, &fake).await;
        self.to_relays(&fake).await;
        let (hr, _) = j1.rotation(Rot {
            homeless: true,
            homes: Some(vec![n.home()]),
            ..Default::default()
        });
        let _ = Self::give(&n, &[&g, &r1, &hr]).await;
        let mut rd = self.read(&j.id, &[&h, &n], &[], &[h.op()]).await;
        rd.add_act(&fake);
        let reached = rd
            .attempt(
                &h.op(),
                &j.id,
                std::slice::from_ref(&h.base),
                &hr.encode(),
                &self.relay_bases(),
            )
            .await;
        let ok = code_of(&at_home) == Some(code::INVALID)
            && rd.chain(&h.op()).len() == 1
            && reached == Reached::Yes
            && rd.chain(&j.id) == vec![j.id, r1.id()];
        self.check(
            "5.7b",
            t,
            "the thief cannot close the home: a \"closure\" without the operator's safety key is no rotation, the home is not gone, and it objects to a homeless rotation",
            ok,
            Self::answers(std::slice::from_ref(&at_home)),
        );
        self.done(&rd);
    }

    // ------------------------------------------------------------ 5.7c: the homeless paths

    pub(super) async fn step7c_closure(&mut self) {
        let t = Ran::Throwaway;
        let c = self.throwaway("closing-home").await;
        let n = self.throwaway("new-home-7c").await;
        let (g, j) = self.born("J7c", vec![c.home()], None);
        let _ = Self::put(&c, &g).await;
        let closed = c.with_node(|x| x.rotate_operator(true));
        let (hr, j1) = j.rotation(Rot {
            homeless: true,
            homes: Some(vec![n.home()]),
            ..Default::default()
        });
        let at_closed = Self::put(&c, &hr).await;
        let at_new = Self::give(&n, &[&g, &hr]).await;
        let rd = self.read(&j.id, &[&c, &n], &[], &[]).await;
        let res = rd.resolve(&j.id);
        let ok = closed.is_ok()
            && code_of(&at_closed) == Some(code::REFUSED)
            && receipted(&at_new[1])
            && rd.chain(&j.id) == vec![j.id, hr.id()]
            && res.links.get(1).map(|l| l.how) == Some(homeless(Basis::Gone, false));
        self.check(
            "5.7c",
            t,
            "the operator closes the home by a rotation; the journalist leaves with a homeless rotation, which counts on the new home's receipt once a reader finds the closure at the operator's home",
            ok,
            format!("{:?}", res.stop),
        );
        self.done(&rd);
        let (late, _) = self.born("J7c-late", vec![c.home()], None);
        let refused = Self::put(&c, &late).await;
        self.check(
            "5.7c",
            t,
            "the closed home holds no new identity and signs nothing more",
            code_of(&refused) == Some(code::REFUSED),
            Self::answers(std::slice::from_ref(&refused)),
        );
        let (r2, _) = j1.rotation(Rot::default());
        let _ = Self::put(&n, &r2).await;
        let rd = self.read(&j.id, &[&c, &n], &[], &[]).await;
        self.check(
            "5.7c",
            t,
            "the next rotation, counting under the new home, makes the homeless rotation final",
            rd.resolve(&j.id).links.get(1).map(|l| l.how) == Some(homeless(Basis::Gone, true)),
            "",
        );
        self.done(&rd);
    }

    pub(super) async fn step7c_auditors_absence(&mut self) {
        let t = Ran::Throwaway;
        let mut v = self.throwaway("vanishing-home").await;
        let n = self.throwaway("new-home-absence").await;
        let mut a1 = self.auditor("auditor-1").await;
        let mut a2 = self.auditor("auditor-2").await;
        let audit = Audit {
            threshold: 2,
            auditors: vec![a1.me.id, a2.me.id],
        };
        let (g, j) = self.born("J7c-audited", vec![v.home()], Some(audit));
        let _ = Self::put(&v, &g).await;
        let (r1, j1) = j.rotation(Rot::default());
        let _ = Self::put(&v, &r1).await;
        let rd = self.read(&j.id, &[&v], &[&a1, &a2], &[]).await;
        let pending = rd.chain(&j.id) == vec![j.id];
        self.done(&rd);
        let c1 = a1.cosign_latest(&v).await;
        let c2 = a2.cosign_latest(&v).await;
        let rd = self.read(&j.id, &[&v], &[&a1, &a2], &[]).await;
        self.check(
            "5.7c",
            t,
            "an audited identity's rotation counts only once its home's log summary carries the required cosignatures",
            pending && c1.is_ok() && c2.is_ok() && rd.chain(&j.id) == vec![j.id, r1.id()],
            format!("{:?} {:?}", c1.err(), c2.err()),
        );
        self.done(&rd);

        // While the home lives, the owner's client keeps the inclusion
        // proofs of its receipts under cosigned summaries (F101).
        let kept = crate::carry::keep(&v.client, &j.id).await;
        v.stop().await; // it vanishes without closing
        let (hr, j2) = j1.rotation(Rot {
            homeless: true,
            homes: Some(vec![n.home()]),
            audit: Some(None),
            ..Default::default()
        });
        let _ = Self::give(&n, &[&g, &r1, &hr]).await;
        let addrs = [v.base.clone()];
        let mut stated = 0;
        for a in [&mut a1, &mut a2] {
            if let Some(s) = a
                .absence(&v.op(), &j.id, &hr.id(), &addrs, &self.http)
                .await
            {
                let _ = Self::put(&n, &s).await;
                stated += 1;
            }
        }
        // F101: without the carried proofs, a new reader cannot prove the
        // audited rotation before, so the chain stops at genesis.
        let rd = self.read(&j.id, &[&v, &n], &[&a1, &a2], &[]).await;
        let stuck = rd.chain(&j.id) == vec![j.id];
        self.done(&rd);
        let carried = crate::carry::deliver(&n.client, &kept).await;
        self.check(
            "5.7c",
            t,
            "(F101) a new reader cannot prove the audited rotation of a vanished home until the owner carries its inclusion proofs to the new home; the new home keeps them",
            stuck && carried > 0,
            format!("{} proofs carried, {carried} kept", kept.proofs.len()),
        );
        let rd = self.read(&j.id, &[&v, &n], &[&a1, &a2], &[]).await;
        let res = rd.resolve(&j.id);
        self.check(
            "5.7c",
            t,
            "the home vanishes without closing: both declared auditors try it, fail, and sign absence statements; the homeless rotation counts",
            stated == 2
                && rd.chain(&j.id) == vec![j.id, r1.id(), hr.id()]
                && res.links.get(2).map(|l| l.how) == Some(homeless(Basis::Gone, false)),
            format!("{:?}", res.stop),
        );
        self.done(&rd);
        let (r3, _) = j2.rotation(Rot::default());
        let _ = Self::put(&n, &r3).await;
        v.restart().await;
        let late = Self::put(&v, &hr).await;
        let rd = self.read(&j.id, &[&v, &n], &[&a1, &a2], &[]).await;
        let res = rd.resolve(&j.id);
        self.check(
            "5.7c",
            t,
            "after re-homing the journalist rotates once more; the old home comes back and objects, too late: nothing changes",
            objected(&late)
                && rd.chain(&j.id) == vec![j.id, r1.id(), hr.id(), r3.id()]
                && res.links.get(2).map(|l| l.how) == Some(homeless(Basis::Gone, true)),
            Self::answers(std::slice::from_ref(&late)),
        );
        self.done(&rd);
    }

    pub(super) async fn step7c_objection(&mut self) {
        let t = Ran::Throwaway;
        let h = self.throwaway("live-home").await;
        let th = self.thiefs("thief-home").await;
        let (g, j) = self.born("J7c-live", vec![h.home()], None);
        let _ = Self::put(&h, &g).await;
        let (hr, _) = j.rotation(Rot {
            homeless: true,
            homes: Some(vec![th.home()]),
            signing_key: Some(j.thief_key("7c")),
            ..Default::default()
        });
        let _ = Self::give(&th, &[&g, &hr]).await;
        // A relay given the rotation forwards it to the old home.
        let relay = &self.relays[0];
        let _ = Self::give(relay, &[&g, &hr]).await;
        let mut carried = false;
        for _ in 0..50 {
            let acts = relay.client.acts_by(&h.op()).await.unwrap_or_default();
            if acts.iter().any(|a| {
                Act::decode(a)
                    .ok()
                    .and_then(|x| x.open(None).ok())
                    .is_some_and(|i| i.type_ == mor_core::identity::types::OBJECTION)
            }) {
                carried = true;
                break;
            }
            tokio::time::sleep(std::time::Duration::from_millis(100)).await;
        }
        let mut rd = self.read(&j.id, &[&th], &[], &[h.op()]).await;
        let voided = rd.chain(&j.id) == vec![j.id];
        let reached = rd
            .attempt(
                &h.op(),
                &j.id,
                std::slice::from_ref(&h.base),
                &hr.encode(),
                &self.relay_bases(),
            )
            .await;
        self.check(
            "5.7c",
            t,
            "a thief's homeless rotation for a live home: a relay given it forwards it to the home and carries the objection back, which voids it",
            carried && voided && reached == Reached::Yes,
            format!("carried {carried}, chain {} long", rd.chain(&j.id).len()),
        );
        self.done(&rd);
        // Rule 8a's exception: one normal rotation with the same safety key.
        let (own, _) = j.rotation(Rot::default());
        let put = Self::put(&h, &own).await;
        let rd = self.read(&j.id, &[&h, &th], &[], &[h.op()]).await;
        self.check(
            "5.7c",
            t,
            "after the voided homeless rotation, the owner's one normal rotation with the same safety key counts",
            receipted(&put) && rd.chain(&j.id) == vec![j.id, own.id()],
            Self::answers(std::slice::from_ref(&put)),
        );
        self.done(&rd);
    }

    pub(super) async fn step7c_hostile_home(&mut self) {
        let t = Ran::Throwaway;
        let x = self.throwaway("hostile-home").await;
        let n = self.throwaway("new-home-hostile").await;
        let (g, mut j) = self.born("J7c-hostile", vec![x.home()], None);
        let _ = Self::put(&x, &g).await;
        // Hostile: it accepts only what its operator approves, and approves nothing.
        x.with_node(|y| y.set_strict(&j.id)).expect("strict");
        let (normal, _) = j.rotation(Rot::default());
        let refused = Self::put(&x, &normal).await;
        let (hr, _) = j.rotation(Rot {
            homeless: true,
            homes: Some(vec![n.home()]),
            ..Default::default()
        });
        let _ = Self::give(&n, &[&g, &hr]).await;
        let obj = Self::put(&x, &hr).await;
        let e = j.endorse(&hr.id(), Some(vec![normal.id()]));
        Self::put_all(&[&n, &x], &e).await;
        let rd = self.read(&j.id, &[&x, &n], &[], &[]).await;
        let res = rd.resolve(&j.id);
        self.check(
            "5.7c",
            t,
            "a live but hostile home refuses the normal rotation; the journalist leaves with both keys, the endorsement listing the refused rotation as abandoned, and the home's objection does not stop it",
            code_of(&refused) == Some(code::REFUSED)
                && objected(&obj)
                && rd.chain(&j.id) == vec![j.id, hr.id()]
                && res.links.get(1).map(|l| l.how) == Some(homeless(Basis::Escape, false))
                && rd.status(&e.id()) == Status::Valid,
            format!("{:?}", res.stop),
        );
        self.done(&rd);
        x.with_node(|y| y.approve(&normal.id())).expect("approve");
        let late = Self::put(&x, &normal).await;
        let rd = self.read(&j.id, &[&x, &n], &[], &[]).await;
        self.check(
            "5.7c",
            t,
            "the hostile home receipting the abandoned rotation later changes nothing",
            receipted(&late) && rd.chain(&j.id) == vec![j.id, hr.id()],
            Self::answers(std::slice::from_ref(&late)),
        );
        self.done(&rd);
    }

    pub(super) async fn step7c_audit_dropped(&mut self) {
        let t = Ran::Throwaway;
        let h = self.throwaway("home-audit-dropped").await;
        let mut a = self.auditor("auditor-closing").await;
        let audit = Audit {
            threshold: 1,
            auditors: vec![a.me.id],
        };
        let (g, j) = self.born("J7c-drop", vec![h.home()], Some(audit));
        let _ = Self::put(&h, &g).await;
        let (r1, j1) = j.rotation(Rot::default());
        let _ = Self::put(&h, &r1).await;
        let _ = a.cosign_latest(&h).await;
        // The auditor closes: it never cosigns again.
        let (r2, _) = j1.rotation(Rot {
            audit: Some(None),
            ..Default::default()
        });
        let put = Self::put(&h, &r2).await;
        let rd = self.read(&j.id, &[&h], &[&a], &[]).await;
        self.check(
            "5.7c",
            t,
            "the declared auditor closes; the journalist rotates, dropping the requirement, and the rotation counts on the home's receipt alone",
            receipted(&put) && rd.chain(&j.id) == vec![j.id, r1.id(), r2.id()],
            format!("{:?}", rd.resolve(&j.id).stop),
        );
        self.done(&rd);
    }

    pub(super) async fn step7c_used_key_after_closure(&mut self) {
        let t = Ran::Throwaway;
        let c = self.throwaway("closing-home-2").await;
        let th = self.thiefs("thief-home-2").await;
        let (g, j0) = self.born("J7c-oldkey", vec![c.home()], None);
        let _ = Self::put(&c, &g).await;
        let (r1, j1) = j0.rotation(Rot::default());
        let (r2, _) = j1.rotation(Rot::default());
        Self::put_all(&[&c], &r1).await;
        Self::put_all(&[&c], &r2).await;
        let _ = c.with_node(|x| x.rotate_operator(true));
        // A thief finds the first, long-used safety key on an old backup.
        let (thr, t1) = j0.rotation(Rot {
            homeless: true,
            homes: Some(vec![th.home()]),
            signing_key: Some(j0.thief_key("old backup")),
            ..Default::default()
        });
        let (t2, _) = t1.rotation(Rot::default());
        let _ = Self::give(&th, &[&g, &thr, &t2]).await;
        let rd = self.read(&j0.id, &[&c, &th], &[], &[]).await;
        self.check(
            "5.7c",
            t,
            "(F92) after the home closes, a thief with the first, used safety key makes a homeless rotation at that old position and rotates again at once: the rotations the home receipted still count, the thief's chain counts for nothing",
            rd.chain(&j0.id) == vec![j0.id, r1.id(), r2.id()]
                && rd.status(&thr.id()) == Status::Invalid
                && rd.status(&t2.id()) == Status::Invalid,
            format!("chain {} long", rd.chain(&j0.id).len()),
        );
        self.done(&rd);
    }

    pub(super) async fn step7c_thief_drops_auditing(&mut self) {
        let t = Ran::Throwaway;
        let h = self.throwaway("home-audited").await;
        let th = self.thiefs("thief-home-3").await;
        let a = self.auditor("auditor-3").await;
        let mut ta = self.auditor("thief-auditor").await;
        let audit = Audit {
            threshold: 1,
            auditors: vec![a.me.id],
        };
        let (g, j) = self.born("J7c-f93", vec![h.home()], Some(audit));
        let _ = Self::put(&h, &g).await;
        let (hr, _) = j.rotation(Rot {
            homeless: true,
            homes: Some(vec![th.home()]),
            audit: Some(Some(Audit {
                threshold: 1,
                auditors: vec![ta.me.id],
            })),
            signing_key: Some(j.thief_key("f93")),
            ..Default::default()
        });
        let _ = Self::give(&th, &[&g, &hr]).await;
        let abs = ta.me.absent(&h.op(), &j.id, &hr.id());
        let _ = Self::put(&th, &abs).await;
        let mut rd = self.reader();
        rd.block(&h.base);
        rd.follow(&a.me.id, std::slice::from_ref(&self.audit_home.base))
            .await;
        rd.follow(&ta.me.id, std::slice::from_ref(&self.audit_home.base))
            .await;
        rd.follow(&j.id, std::slice::from_ref(&th.base)).await;
        rd.add_act(&abs);
        let reached = rd
            .attempt(
                &h.op(),
                &j.id,
                std::slice::from_ref(&h.base),
                &hr.encode(),
                &[],
            )
            .await;
        self.check(
            "5.7c",
            t,
            "(F93) a thief holding the safety key of an audited identity drops auditing in a homeless rotation and names an auditor of its own: neither the reader's failed attempt nor the thief's auditor makes the live home gone",
            reached == Reached::No && rd.chain(&j.id) == vec![j.id],
            format!("{:?}", rd.resolve(&j.id).stop),
        );
        self.done(&rd);
    }

    pub(super) async fn step7c_censored_reader(&mut self) {
        let t = Ran::Throwaway;
        let mut abroad = self.throwaway("home-abroad").await;
        let th = self.thiefs("thief-home-4").await;
        let (g, mut j) = self.born("J7c-censored", vec![abroad.home()], None);
        let _ = Self::put(&abroad, &g).await;
        let last = j.post("the last genuine post");
        let _ = Self::put(&abroad, &last).await;
        let (hr, t1) = j.rotation(Rot {
            homeless: true,
            homes: Some(vec![th.home()]),
            signing_key: Some(j.thief_key("censor")),
            ..Default::default()
        });
        let _ = Self::give(&th, &[&g, &hr]).await;
        // The censor: nothing in the reader's network reaches the home.
        abroad.stop().await;
        let mut rd = self.reader();
        rd.block(&abroad.base);
        rd.add_act(&last);
        rd.follow(&j.id, std::slice::from_ref(&th.base)).await;
        let reached = rd
            .attempt(
                &abroad.op(),
                &j.id,
                std::slice::from_ref(&abroad.base),
                &hr.encode(),
                &self.relay_bases(),
            )
            .await;
        let res = rd.resolve(&j.id);
        self.check(
            "5.7c",
            t,
            "(F87) a censored reader tries every address and asks relays to probe, all blocked: the thief's homeless rotation shows as re-homed without audit",
            reached == Reached::No
                && rd.chain(&j.id) == vec![j.id, hr.id()]
                && res.links.get(1).map(|l| l.how) == Some(homeless(Basis::OwnAttempt, false)),
            format!("{:?}", res.links.last().map(|l| l.how)),
        );
        let said = "J7c-censored is RE-HOMED WITHOUT AUDIT: its old home could not be reached from here. Nothing private, no key and no payment is sent to it without a plain warning.";
        self.report.say(said);
        self.check(
            "5.7c",
            Ran::Conformance,
            "the reader's client labels it, and sends nothing private without a plain warning",
            true,
            said,
        );
        let (t2, _) = t1.rotation(Rot::default());
        let _ = Self::put(&th, &t2).await;
        rd.follow(&j.id, std::slice::from_ref(&th.base)).await;
        let res = rd.resolve(&j.id);
        self.check(
            "5.7c",
            t,
            "the thief rotates again at once under the homes it chose: the first is not made final",
            rd.chain(&j.id) == vec![j.id, hr.id(), t2.id()]
                && res.links.get(1).map(|l| l.how) == Some(homeless(Basis::OwnAttempt, false)),
            "",
        );
        // Abroad, the owner gets the home's objection and sends a bundle.
        abroad.restart().await;
        let obj = Self::put(&abroad, &hr).await;
        let rec = abroad.client.identity(&j.id, None).await;
        let mut acts = rec.map(|r| r.all_acts()).unwrap_or_default();
        if let Ok(p) = &obj {
            acts.extend(p.objection.clone());
        }
        // The home operator's own chain, so the objection can be checked.
        if let Ok(r) = abroad.client.identity(&abroad.op(), None).await {
            acts.extend(r.all_acts());
        }
        let bundle = Bundle {
            acts,
            sealed: vec![],
            proofs: vec![],
        }
        .encode();
        let imported = rd.import(&bundle);
        self.check(
            "5.7c",
            t,
            "the home's objection reaches the reader in a bundle: the homeless rotation and the thief's second rotation are both void, and the last genuine act counts again",
            objected(&obj)
                && imported > 0
                && rd.chain(&j.id) == vec![j.id]
                && rd.status(&last.id()) == Status::Valid
                && rd.status(&t2.id()) == Status::Invalid,
            format!("chain {} long", rd.chain(&j.id).len()),
        );
        self.done(&rd);
    }

    pub(super) async fn step7c_redirected_inbox(&mut self) {
        let t = Ran::Throwaway;
        let h = self.throwaway("home-inbox").await;
        let (g, mut j) = self.born("J7c-inbox", vec![h.home()], None);
        let _ = Self::put(&h, &g).await;
        let k1 = DecKey::from_secret(random::<32>());
        let routes1 = j.routes(1, None, &self.relays[0].base);
        let key1 = j.encryption_key(1, None, &k1);
        Self::put_all(&[&h], &routes1).await;
        Self::put_all(&[&h], &key1).await;
        // A thief with the signing key points the inbox and the key elsewhere.
        let mut thief = j.clone();
        let kt = DecKey::from_secret(random::<32>());
        let routes2 = thief.routes(2, Some(routes1.id()), &self.relays[1].base);
        let key2 = thief.encryption_key(2, Some(key1.id()), &kt);
        Self::put_all(&[&h], &routes2).await;
        Self::put_all(&[&h], &key2).await;
        let (sg, mut sender) = self.born("sender", vec![h.home()], None);
        let _ = Self::put(&h, &sg).await;
        let rd = self.read(&j.id, &[&h], &[], &[]).await;
        let first = inbox_and_key(&rd, &j.id);
        self.done(&rd);
        let (msg, ck) = sender.message(j.id, "for the journalist only");
        let mut thief_opened = false;
        let mut owner_opened_first = true;
        if let Some((inbox, ek)) = first.clone() {
            let sealed = seal_to(&msg, &ck, &j.id, ek);
            let _ = self
                .http
                .client(&inbox)
                .put_sealed(&sealed.encode(), &[])
                .await;
            thief_opened = envelope::open(&sealed, Some(&j.id), &kt).is_ok();
            owner_opened_first = envelope::open(&sealed, Some(&j.id), &k1).is_ok();
        }
        self.check(
            "5.7c",
            t,
            "a thief with the signing key redirects the inbox and the encryption key: a delivery in the window goes where the thief pointed",
            first.as_ref().map(|f| f.0.as_str()) == Some(self.relays[1].base.as_str())
                && thief_opened
                && !owner_opened_first,
            "",
        );
        let (rot, _) = j.rotation(Rot::default());
        let _ = Self::put(&h, &rot).await;
        let rd = self.read(&j.id, &[&h], &[], &[]).await;
        let then = inbox_and_key(&rd, &j.id);
        let voided =
            rd.status(&routes2.id()) == Status::Void && rd.status(&key2.id()) == Status::Void;
        self.done(&rd);
        let mut owner_opened = false;
        if let Some((inbox, ek)) = then.clone() {
            let sealed = seal_to(&msg, &ck, &j.id, ek);
            let put = self
                .http
                .client(&inbox)
                .put_sealed(&sealed.encode(), &[])
                .await;
            owner_opened = put.is_ok() && envelope::open(&sealed, Some(&j.id), &k1).is_ok();
        }
        self.check(
            "5.7c",
            t,
            "the owner's rotation voids the thief's routes and key; the sender re-delivers to the owner's inbox, and the owner opens it",
            voided
                && then.as_ref().map(|f| f.0.as_str()) == Some(self.relays[0].base.as_str())
                && owner_opened,
            "",
        );
    }

    // ------------------------------------------------------------ 5.7d: a genuine conflict

    pub(super) async fn step7d_contested_until_the_operator_rotates(&mut self) {
        let t = Ran::Throwaway;
        let h = self.throwaway("home-7d").await;
        let (g, j) = self.born("J7d", vec![h.home()], None);
        let _ = Self::put(&h, &g).await;
        let (own, _) = j.rotation(Rot::default());
        let _ = Self::put(&h, &own).await;
        let (rival, _) = j.rotation(Rot {
            signing_key: Some(j.thief_key("7d")),
            ..Default::default()
        });
        let (sum, _) = h.client.log_summary(None).await.expect("a summary");
        let size = summary_size(&sum).expect("a summary");
        let (keys, seq) = h.stolen_keys();
        let mut stolen =
            Person::from_everyday_key("home-7d", h.op(), keys.binding, &keys.signing_secret, seq);
        let forged = stolen.receipt(&j.id, &rival.id(), 1, size);
        self.to_relays(&rival).await;
        self.to_relays(&forged).await;
        let rd = self.read(&j.id, &[&h], &[], &[h.op(), j.id]).await;
        let res = rd.resolve(&j.id);
        self.check(
            "5.7d",
            t,
            "a thief holding J7d's safety key gets a genuine rival rotation receipted with the home's stolen operator key: J7d is contested at that position, not frozen",
            matches!(res.stop, Stop::Contested(_)) && res.contested == vec![1] && rd.chain(&j.id) == vec![j.id],
            format!("{:?}", res.stop),
        );
        self.done(&rd);
        let rotated = h.with_node(|n| n.rotate_operator(false));
        let rd = self.read(&j.id, &[&h], &[], &[h.op(), j.id]).await;
        let res = rd.resolve(&j.id);
        self.check(
            "5.7d",
            t,
            "the operator rotates, keeping its genuine line: the forged receipt is void, and J7d's own rotation counts",
            rotated.is_ok()
                && rd.status(&forged.id()) == Status::Void
                && rd.chain(&j.id) == vec![j.id, own.id()]
                && res.dishonest.is_empty(),
            format!("{:?}", res.stop),
        );
        self.done(&rd);
    }

    pub(super) async fn step7d_settled_by_audit(&mut self) {
        let t = Ran::Throwaway;
        let d1 = self.throwaway("audited-1").await;
        let d2 = self.throwaway("audited-2").await;
        let mut d3 = self.throwaway("audited-3").await;
        let mut aud = self.auditor("auditor-7d").await;
        let audit = Audit {
            threshold: 1,
            auditors: vec![aud.me.id],
        };
        let (g, j) = self.born(
            "J7d-audited",
            vec![d1.home(), d2.home(), d3.home()],
            Some(audit),
        );
        Self::put_all(&[&d1, &d2, &d3], &g).await;
        let (r1, j1) = j.rotation(Rot::default());
        Self::put_all(&[&d1, &d2, &d3], &r1).await;
        for d in [&d1, &d2, &d3] {
            let _ = aud.cosign_latest(d).await;
        }
        let (r2, _) = j1.rotation(Rot::default());
        Self::put_all(&[&d1, &d2, &d3], &r2).await;
        for d in [&d1, &d2, &d3] {
            let _ = aud.cosign_latest(d).await;
        }
        // The theft: J's safety key for position 2, and home 1's everyday key.
        let (rival, _) = j1.rotation(Rot {
            signing_key: Some(j.thief_key("7d-audited")),
            ..Default::default()
        });
        let (sum, _) = d1.client.log_summary(None).await.expect("a summary");
        let size = summary_size(&sum).expect("a summary");
        let prev = Act::decode(&sum).expect("an act").id();
        let mut log = vec![];
        for i in 0..size {
            let b = d1.client.log_receipt(i).await.expect("a receipt");
            log.push(Act::decode(&b).expect("an act").id());
        }
        let (keys, seq) = d1.stolen_keys();
        let mut stolen = Person::from_everyday_key(
            "audited-1",
            d1.op(),
            keys.binding,
            &keys.signing_secret,
            seq,
        );
        let forged = stolen.receipt(&j.id, &rival.id(), 2, size);
        let mut forged_log = log.clone();
        forged_log.push(forged.id());
        let fsum = stolen.identity_act(
            Payload::LogSummary(LogSummary {
                size: size + 1,
                root: merkle::root(&forged_log),
                prev: Some(prev),
            }),
            None,
        );
        for a in [&rival, &forged, &fsum] {
            self.to_relays(a).await;
        }
        let signers = [d1.op(), j.id, aud.me.id];
        let rd = self.read(&j.id, &[&d1], &[&aud], &signers).await;
        let res = rd.resolve(&j.id);
        self.check(
            "5.7d",
            t,
            "with audit required, the audit settles which receipt is real: the forged one sits under no cosigned summary, and J7d-audited's rotations count",
            rd.chain(&j.id) == vec![j.id, r1.id(), r2.id()]
                && res.contested.is_empty()
                && res.dishonest.is_empty(),
            format!("{:?}", res.stop),
        );
        self.done(&rd);

        // Shown a summary that extends the one it cosigned, an auditor can
        // only cosign it: the stolen key gets the rival into shared history.
        let proof = merkle::consistency_proof(&forged_log, size as usize);
        let cos = aud.check_and_cosign(&fsum.encode(), &proof);
        if let Ok(c) = &cos {
            self.to_relays(c).await;
        }
        d3.stop().await;
        let rd = self.read(&j.id, &[&d1, &d2], &[&aud], &signers).await;
        let res = rd.resolve(&j.id);
        let proven = res.dishonest == vec![(mor_core::identity::Operator::Id(d1.op()), 2)];
        self.check(
            "5.7d",
            t,
            "both receipts end up under cosigned summaries: home 1 is proven dishonest at position 2 only; with home 3 off, position 1 still counts on homes 1 and 2, so home 1's earlier receipt under a cosigned summary survives",
            cos.is_ok() && proven && rd.chain(&j.id) == vec![j.id, r1.id()],
            format!("dishonest {:?}, {:?}", res.dishonest, res.stop),
        );
        self.done(&rd);
        d3.restart().await;
        let rd = self.read(&j.id, &[&d1, &d2, &d3], &[&aud], &signers).await;
        self.check(
            "5.7d",
            t,
            "with home 3 back, position 2 counts on homes 2 and 3; the thief contests nothing before it",
            rd.chain(&j.id) == vec![j.id, r1.id(), r2.id()],
            format!("{:?}", rd.resolve(&j.id).stop),
        );
        self.done(&rd);
        let (og, _) = self.born("J7d-neighbour", vec![d1.home()], None);
        let _ = Self::put(&d1, &og).await;
        let after = aud.cosign_latest(&d1).await;
        self.check(
            "5.7d",
            t,
            "home 1's next real summary does not extend the forged one: the auditor stops cosigning that home",
            after.is_err() && aud.stopped.contains(&d1.op()),
            after.err().unwrap_or_default(),
        );
    }
}
