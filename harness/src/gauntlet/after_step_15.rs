//! The gauntlet's checks for the Identity decisions of step 15 (Identity
//! draft 13; freeze suite v28, scenario 5): 5.5c (F298), 5.7e (F297), 5.7f
//! (F299), 5.7g (Fable's I5) and 5.8b (F300). Each runs on throwaway homes:
//! they steal an operator's key, rotate an operator, or serve a thief's
//! rotation at a self-hosted home. The air-gapped Module's half of 5.7f and
//! 5.7g (it signs only on bytes it checks itself) is run by the Module's own
//! tests (`modules/airgap/tests/rule_29.rs`), since the harness's test
//! identities hold their chain keys in software.

use super::*;
use crate::person::naming;
use mor_core::chain::SuccessionSeen;
use mor_core::identity::{HomeRule, Successor};

fn receipted(p: &Put) -> bool {
    matches!(p, Ok(r) if r.receipt.is_some())
}

impl Gauntlet {
    /// 5.5c (F298): a reader holding the rotation and its kept tip but not
    /// every act of the line leading to it: the first post is unknown, never
    /// void, until the line arrives; then valid. The tip too is unknown until
    /// then: whether its summary fits its line cannot be told (rotation
    /// check 7).
    pub(super) async fn step5c_reader_without_the_line(&mut self) {
        let t = Ran::Throwaway;
        let h = self.throwaway("home-5c").await;
        let (g, mut j) = self.born("J5c", vec![h.home()], None);
        let _ = Self::put(&h, &g).await;
        let posts: Vec<Act> = ["the first post", "the second", "the third"].iter().map(|x| j.post(x)).collect();
        for p in &posts {
            let _ = Self::put(&h, p).await;
        }
        let (r, _) = j.rotation(Rot::default());
        let put = Self::put(&h, &r).await;
        let mut rd = self.reader();
        rd.fetch_record(&j.id, &h.base).await;
        rd.add_act(&posts[0]);
        rd.add_act(&posts[2]);
        let before = (rd.status(&posts[0].id()), rd.status(&posts[2].id()));
        rd.add_act(&posts[1]);
        let after = rd.status(&posts[0].id());
        self.check(
            "5.5c",
            t,
            "(F298) a reader holding the rotation and its kept tip but not the whole line: the first post is unknown, never void, until the line arrives; then valid",
            receipted(&put) && rd.chain(&j.id) == vec![j.id, r.id()] && before == (Status::Unknown, Status::Unknown) && after == Status::Valid,
            format!("{before:?}, then {after:?}"),
        );
        self.done(&rd);
    }

    /// 5.7e (F297): a thief holding a home operator's signing key signs an
    /// objection to the journalist's homeless rotation; an accomplice
    /// witnesses it; the operator rotates, leaving it out: the objection is
    /// shown as a dispute, voids nothing, and the exit counts. Before the
    /// operator rotates, it voids the homeless rotation: the stated cost.
    pub(super) async fn step7e_evidence_disowned(&mut self) {
        let t = Ran::Throwaway;
        let mut v = self.throwaway("objecting-home").await;
        let n = self.throwaway("new-home-7e").await;
        let (g, j) = self.born("J7e", vec![v.home()], None);
        let _ = Self::put(&v, &g).await;
        let (hr, _) = j.rotation(Rot {
            homeless: true,
            homes: Some(vec![n.home()]),
            ..Default::default()
        });
        // The operator's own chain, public, carried by the relays: the
        // reader judges the objection against it.
        let (v_client, v_op, v_base) = (v.client.clone(), v.op(), v.base.clone());
        // (Published while the home runs: once before the objection is
        // judged, once after the operator's rotation.)
        let publish_operator = |g: &Gauntlet| {
            let (c, op, relays) = (v_client.clone(), v_op, g.relays.iter().map(|r| r.client.clone()).collect::<Vec<_>>());
            async move {
                let mut acts = c.identity(&op, None).await.map(|r| r.all_acts()).unwrap_or_default();
                acts.extend(c.get_act(&op).await.ok());
                acts.extend(c.acts_by(&op).await.unwrap_or_default());
                for r in &relays {
                    for a in &acts {
                        let _ = r.put_act(a).await;
                    }
                }
            }
        };
        publish_operator(self).await;
        // The thief breaks into the server and takes the operator's signing
        // key; the home then vanishes, before the journalist re-homes (were
        // it alive, the new home would forward the homeless rotation to it,
        // and its own genuine objection would void the exit).
        let (keys, own) = v.stolen_keys();
        v.stop().await;
        let at_new = Self::give(&n, &[&g, &hr]).await;
        let mut stolen = Person::from_signing_key("home-7e", v.op(), keys.binding, &keys.signing_secret, own);
        let obj = stolen.object(&j.id, &hr.id());
        self.to_relays(&obj).await;
        // An accomplice witnesses it.
        let (ag, mut acc) = self.born("accomplice-7e", vec![self.audit_home.home()], None);
        let _ = Self::put(&self.audit_home, &ag).await;
        let wit = acc.witness(&obj.id());
        self.to_relays(&ag).await;
        self.to_relays(&wit).await;
        // The reader cannot reach the old home (it tries, and is blocked).
        let read = |g: &Gauntlet| {
            let (v_base, n_base, j_id, acc_id) = (v_base.clone(), n.base.clone(), j.id, acc.id);
            let hr_bytes = hr.encode();
            let relays = g.relay_bases();
            let mut rd = g.reader();
            let http = g.http.clone();
            async move {
                for r in &relays {
                    rd.fetch_signed(r, &[v_op, acc_id]).await;
                    // A genesis names no signer: fetched by its id.
                    for id in [&v_op, &acc_id] {
                        if let Ok(b) = http.client(r).get_act(id).await {
                            rd.add(&b);
                        }
                    }
                }
                rd.block(&v_base);
                rd.follow(&j_id, std::slice::from_ref(&n_base)).await;
                let _ = rd.attempt(&v_op, &j_id, std::slice::from_ref(&v_base), &hr_bytes, &relays).await;
                rd
            }
        };
        let rd = read(self).await;
        let voided = rd.chain(&j.id) == vec![j.id] && rd.status(&obj.id()) == Status::Valid;
        self.check(
            "5.7e",
            t,
            "(F297, F328 Q2) before the operator rotates, the objection signed with its stolen key voids the journalist's homeless rotation: the stated cost",
            receipted(&at_new[1]) && voided,
            format!("chain {} long; objection {:?}; operator {:?}; held {}", rd.chain(&j.id).len(), rd.status(&obj.id()), rd.resolve(&v.op()).stop, rd.v.get(&obj.id()).is_some()),
        );
        self.done(&rd);
        // The operator rotates, keeping its genuine line only.
        v.restart().await;
        let rotated = v.with_node(|x| x.rotate_operator(false));
        publish_operator(self).await;
        v.stop().await;
        let rd = read(self).await;
        let res = rd.resolve(&j.id);
        self.check(
            "5.7e",
            t,
            "(F297) the operator rotates and the objection falls outside its kept line: witnessed by an accomplice, it is shown as a dispute and voids nothing; the exit counts",
            rotated.is_ok()
                && rd.status(&obj.id()) == Status::Disputed
                && rd.chain(&j.id) == vec![j.id, hr.id()]
                && res.links.get(1).map(|l| l.how) == Some(How::Homeless { basis: Basis::OwnAttempt, final_: false }),
            format!("{:?}; chain {}; {:?}; {:?}", rd.status(&obj.id()), rd.chain(&j.id).len(), res.stop, res.links.last().map(|l| l.how)),
        );
        self.done(&rd);
    }

    /// 5.7f (F299): a self-hosted identity meets a thief's rotation, signed
    /// with its stolen chain key, at the owner's position: contested for
    /// good, nobody wins; the owner leaves by the escape with both keys, the
    /// endorsement listing both rotations as abandoned, and the escape
    /// counts at the new home.
    pub(super) async fn step7f_contested_self_hosted(&mut self) {
        let t = Ran::Throwaway;
        let seed = self.seed;
        let mut made: Option<(Act, Person)> = None;
        let own = Site::start_as(&self.run, "F-self", Role::Home, Policy::Open, &self.http, |base| {
            let homes = vec![Home { operator: None, hint: base.to_string() }];
            let (g, b) = Person::genesis(&seed, "F", homes, None, None);
            let keys = Keys { identity: b.id, binding: b.id, signing_secret: b.signing_secret(), chain_key: None };
            let chain = vec![g.encode()];
            made = Some((g, b));
            OperatorSetup::Existing { keys, chain }
        })
        .await;
        let (g, b) = made.expect("F was made");
        let n = self.throwaway("new-home-7f").await;
        let (rb, _) = b.rotation(Rot::default());
        let (rival, _) = b.rotation(Rot { signing_key: Some(b.thief_key("7f")), ..Default::default() });
        let _ = Self::put(&own, &rb).await;
        // The thief serves its rotation from elsewhere.
        self.to_relays(&rival).await;
        let rd = {
            let mut rd = self.reader();
            for r in self.relay_bases() {
                rd.fetch_signed(&r, &[b.id]).await;
            }
            rd.follow(&b.id, std::slice::from_ref(&own.base)).await;
            rd
        };
        let res = rd.resolve(&b.id);
        self.check(
            "5.7f",
            t,
            "(F299) a thief's rotation and the owner's at one position of a self-hosted identity: contested for good, nobody wins",
            matches!(res.stop, Stop::Contested(ref c) if c.contains(&rb.id()) && c.contains(&rival.id())) && rd.chain(&b.id) == vec![b.id],
            format!("{:?}", res.stop),
        );
        self.done(&rd);
        // The escape: a homeless rotation with the same chain key, endorsed
        // with the current signing key, both rotations listed as abandoned.
        let (esc, _) = b.rotation(Rot { homeless: true, homes: Some(vec![n.home()]), ..Default::default() });
        let mut owner = b.clone();
        let endorsement = owner.endorse(&esc.id(), Some(vec![rb.id(), rival.id()]));
        let at_new = Self::give(&n, &[&g, &esc]).await;
        let _ = Self::put(&n, &endorsement).await;
        self.to_relays(&endorsement).await;
        let rd = {
            let mut rd = self.reader();
            for r in self.relay_bases() {
                rd.fetch_signed(&r, &[b.id]).await;
            }
            rd.follow(&b.id, &[own.base.clone(), n.base.clone()]).await;
            rd
        };
        let res = rd.resolve(&b.id);
        self.check(
            "5.7f",
            t,
            "(F299) the owner leaves the contested position by the escape with both keys, the endorsement listing both rotations as abandoned: the escape counts at the new home (the air-gapped Module signs it only on the rival's bytes: modules/airgap/tests/rule_29.rs)",
            // With both rotations abandoned, the escape is the one rotation
            // left at the position: it counts.
            receipted(&at_new[1]) && rd.chain(&b.id) == vec![b.id, esc.id()],
            format!("{:?}; {:?}; {}", res.stop, [&rb, &rival, &esc, &endorsement].map(|x| rd.status(&x.id())), Self::answers(&at_new)),
        );
        self.done(&rd);
        let _ = naming;
    }

    /// 5.7g (Fable's I5): a rotation that changes the homes and leaves in
    /// place a home rule that no longer fits is invalid: no home stores it,
    /// it never counts, and the owner signs again with the same chain key,
    /// which counts.
    pub(super) async fn step7g_a_rotation_that_never_counted(&mut self) {
        let t = Ran::Throwaway;
        let homes = [self.throwaway("home-7g-1").await, self.throwaway("home-7g-2").await, self.throwaway("home-7g-3").await];
        let (g, j) = self.born("J7g", homes.iter().map(|h| h.home()).collect(), None);
        let all: Vec<&Site> = homes.iter().collect();
        let _ = Self::put_all(&all, &g).await;
        let (r1, j1) = j.rotation(Rot { rule: Some(Some(HomeRule::Threshold(3))), ..Default::default() });
        let p1 = Self::put_all(&all, &r1).await;
        // Two homes now, the rule of three left in place: invalid (F94).
        let (bad, _) = j1.rotation(Rot { homes: Some(vec![homes[0].home(), homes[1].home()]), ..Default::default() });
        let refused = Self::put_all(&all[..2], &bad).await;
        let rd = self.read(&j.id, &all, &[], &[]).await;
        // No home holds it: a reader never meets it, and nothing counts on it.
        let never = rd.chain(&j.id) == vec![j.id, r1.id()] && rd.v.get(&bad.id()).is_none();
        self.done(&rd);
        self.check(
            "5.7g",
            t,
            "(Fable's I5) a rotation leaving in place a home rule that no longer fits its homes is invalid: the homes refuse it, and it never counts",
            p1.iter().all(receipted) && refused.iter().all(|p| code_of(p) == Some(code::INVALID)) && never,
            Self::answers(&refused),
        );
        // Signed again with the same chain key, the rule fitting: it counts.
        let (good, _) = j1.rotation(Rot {
            homes: Some(vec![homes[0].home(), homes[1].home()]),
            rule: Some(Some(HomeRule::Threshold(2))),
            ..Default::default()
        });
        // It counts under the rule in effect before it: all three homes.
        let p2 = Self::put_all(&all, &good).await;
        let rd = self.read(&j.id, &all, &[], &[]).await;
        self.check(
            "5.7g",
            t,
            "(Fable's I5) the owner signs again with the same chain key: no home holds a rival, and the second rotation counts (the air-gapped Module signs it only on the chain's bytes: modules/airgap/tests/rule_29.rs)",
            p2.iter().all(receipted) && rd.chain(&j.id) == vec![j.id, r1.id(), good.id()],
            Self::answers(&p2),
        );
        self.done(&rd);
    }

    /// 5.8b (F300): a stranger's rotation declaring the journalist its
    /// successor is shown as declared, never followed; the successor the
    /// journalist declared is followed once it signs a confirmation naming
    /// the rotation.
    pub(super) async fn step8b_succession_confirmed(&mut self) {
        let t = Ran::Throwaway;
        let h = self.throwaway("home-8b").await;
        let (gj, j) = self.born("J8b", vec![h.home()], None);
        let (gs, stranger) = self.born("stranger-8b", vec![h.home()], None);
        let (gh, mut heir) = self.born("heir-8b", vec![h.home()], None);
        for a in [&gj, &gs, &gh] {
            let _ = Self::put(&h, a).await;
        }
        let mor = |id: &Hash| Successor { protocol: "mor".into(), identifier: id.to_vec() };
        let (sr, _) = stranger.rotation(Rot { successor: Some(Some(mor(&j.id))), ..Default::default() });
        let (jr, _) = j.rotation(Rot { successor: Some(Some(mor(&heir.id))), ..Default::default() });
        let _ = Self::put(&h, &sr).await;
        let _ = Self::put(&h, &jr).await;
        let rd = {
            let mut rd = self.reader();
            for id in [&stranger.id, &j.id, &heir.id] {
                rd.follow(id, std::slice::from_ref(&h.base)).await;
            }
            rd
        };
        let declared = (rd.v.succession(&stranger.id), rd.v.succession(&j.id));
        self.done(&rd);
        self.check(
            "5.8b",
            t,
            "(F300) a stranger's rotation naming the journalist as successor, and the journalist's own declaration before its heir confirms: both shown as declared, never followed",
            declared
                == (
                    SuccessionSeen::Declared { rotation: sr.id(), successor: j.id },
                    SuccessionSeen::Declared { rotation: jr.id(), successor: heir.id },
                ),
            format!("{declared:?}"),
        );
        let conf = heir.confirm_succession(&j.id, &jr.id());
        let _ = Self::put(&h, &conf).await;
        self.to_relays(&conf).await;
        let rd = {
            let mut rd = self.reader();
            for r in self.relay_bases() {
                rd.fetch_signed(&r, &[heir.id]).await;
            }
            for id in [&j.id, &heir.id] {
                rd.follow(id, std::slice::from_ref(&h.base)).await;
            }
            rd
        };
        let seen = rd.v.succession(&j.id);
        self.done(&rd);
        self.check(
            "5.8b",
            t,
            "(F300) the heir signs a link confirmation naming the rotation: the succession is followed",
            seen == SuccessionSeen::Confirmed { rotation: jr.id(), successor: heir.id, confirmation: conf.id() },
            format!("{seen:?}"),
        );
    }
}
