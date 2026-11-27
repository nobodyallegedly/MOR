//! Part 4 (c) to (f) of stage one, session 2: the assignment's evening
//! vectors, the lead's five and the pair of his P7 answer 1, K9 lifting the
//! default, and the Terms act as its signer's assent. Every answer is read
//! from draft 26 at b58e417 with the ledger and the lead's notes, quoted.

use super::*;

pub const Q_AUTHOR_ASSENT: &str = "draft 26, §4.3, **An author's first act**: \"The act that publishes Terms is its signer's assent to them: it is the assent counted in that signer's name, and the signer does not assent to them again.\"";
pub const Q_AUTHOR_PREVIOUS: &str = "draft 26, §4.3, **An author's first act**: \"The first Terms act is its signer's first act within the agreement (§5.7): that signer's next act there, whatever it is, names it in `previous`.\"";
pub const Q_541_DEFAULT: &str = "draft 26, 5.4.1: \"Where it carries no `in_force`, it comes into force when there is an assent to it in the name of every party it names as a signer, the Terms act itself being its signer's (§4.3).\"";
pub const Q_541_KNOTS: &str = "draft 26, 5.4.1: \"Where it names none, knots show it: each party in whose name one of those assents is counted has made an act in that same name within the agreement (a Terms act or a Statement of that agreement, and no other knot) that is shown after every one of those assents (§5.13).\"";
pub const Q_541_NOT_YET: &str = "draft 26, 5.4.1: \"Until then it is not yet in force: a verifier answers **not shown** for it as in force, with that reason, no order being shown.\"";
pub const Q_541_KEEPERS: &str = "draft 26, 5.4.1: \"Where it names keepers, they show it, as many of them as 5.8.3 asks, at the positions they give those assents, and an act they do not yet show is not yet placed (§3.4).\"";
pub const Q_543_SHOWN: &str = "draft 26, 5.4.3: \"About an assent, a verifier answers **shown** where it is counted in a party's name and those Terms are in force\"";
pub const Q_533_DEFAULT: &str = "draft 26, 5.8.3: \"Where the Terms name several keepers, how many of them must show an act is said by the cMIP the same Terms name beside them (task K9); where that socket is empty, every keeper named is needed.\"";
pub const Q_533_UNTIL: &str = "draft 26, 5.8.3: \"Until then, a verifier answers **not shown**, with that reason, and names the keepers that do not yet show it.\"";
pub const Q_584_NAMED: &str = "draft 26, 5.8.4: \"A verifier MUST take those answers from the keepers, qualified **per keeper**, with the keepers that counted named, by K9's answer, and the others named as not showing it.\"";

pub const R_HER_ASSENT: &str = "the ledger, \"Publishing the Terms is the publisher's assent\" (27 November, 20:49–20:50): \"Yes, I don’t see the need to have her sign twice\"";
pub const R_CROSS: &str = "the ledger, \"Keepers: cross verification by default, a socket to lift it\" (27 November, 23:52, to 28 November, 00:00): \"Agreed, and there is a socket to lift it. (Which needs to be in the header)\"";
pub const R_P7_1: &str = "the lead's readings for P2 (docs/lead/notes/2026-11-27-readings-for-p2.md), \"P7's three\", answer 1: \"Not shown where the verifier holds a record of that keeper's without the act; unchecked where it holds none of that keeper's records for it.\" The lead's reading";

pub fn cases(out: &mut Out) {
    the_authors_first_act(out);
    the_lead_five(out);
}

/// (f) The Terms act as its signer's assent.
fn the_authors_first_act(out: &mut Out) {
    let a = tid("A");
    let bb = tid("B");
    let mut s = Sc::new();
    s.who(&a, "A");
    s.who(&bb, "B");
    let root = s.root("first act/root, by A", &a, terms(signers(&[&a, &bb])));
    let b1 = s.assent("first act/B's assent", &bb, &root, &root);
    let an = s.note("first act/A's next act, naming B's assent", &a, &root, &root, &[b1]);
    let bn = s.note("first act/B's next act", &bb, &root, &root, &[]);
    let _ = (an, bn);
    out.cases.push(G {
        name: "the Terms act counted as its signer's assent: A publishes the Terms (naming A and B), B assents, A's next act names the Terms act in `previous` and B's assent in `relies_on`, B's next act follows her assent: in force, as shown".into(),
        part: "the author's first act",
        v2: None,
        sheet: None,
        status: "new",
        against_sheet: None,
        tests: "§4.3, 5.4.1",
        decides: vec![Q_AUTHOR_ASSENT, Q_AUTHOR_PREVIOUS, Q_541_DEFAULT, Q_541_KNOTS],
        reading: vec![R_HER_ASSENT.into()],
        choices: vec![],
        sc: s.clone(),
        ask: "in_force",
        args: vec![root],
        stubs: vec![],
        answer: ans("in force", "5.4.1", "as shown", "an assent is counted in the name of each party named as a signer: A's, the Terms act itself, and B's; each has made an act in that name within the agreement shown after both: A's next act (its `previous` the Terms act, its `relies_on` B's assent) and B's next act (its `previous` B's assent, which names the Terms act)"),
        also: vec![],
    });
    out.cases.push(G {
        name: "the Terms act counted as its signer's assent: asked about the Terms act as an assent, shown, in A's name".into(),
        part: "the author's first act",
        v2: None,
        sheet: None,
        status: "new",
        against_sheet: None,
        tests: "§4.3, 5.4.3",
        decides: vec![Q_AUTHOR_ASSENT, Q_543_SHOWN],
        reading: vec![R_HER_ASSENT.into()],
        choices: vec![],
        sc: s,
        ask: "assent",
        args: vec![root],
        stubs: vec![],
        answer: ans("shown", "5.4.3", "as shown", "the Terms act is the assent counted in A's name, and the Terms are in force").who(&a.id),
        also: vec![],
    });
}

/// (d) The lead's five, and the pair of his P7 answer 1.
fn the_lead_five(out: &mut Out) {
    let a = tid("A");
    let bb = tid("B");
    // K9 empty, three keepers, one silent: not shown.
    let mut s = Sc::new();
    s.who(&a, "A");
    s.who(&bb, "B");
    let (k1, k2, k3) = (keeper_id("K1"), keeper_id("K2"), keeper_id("K3"));
    let root = s.root("three keepers/root, by A", &a, terms(signers(&[&a, &bb])).set(tk::KEEPER, keepers(&[k1, k2, k3])));
    let b1 = s.assent("three keepers/B's assent", &bb, &root, &root);
    s.keeper("K1", "live", vec![vec![root, b1]]);
    s.keeper("K2", "live", vec![vec![root, b1]]);
    s.keeper("K3", "live", vec![vec![]]);
    out.cases.push(G {
        name: "three keepers named, K9's socket empty: two show the Terms act and B's assent, the third's record is held and shows neither: not shown, per keeper, the third named as not showing them".into(),
        part: "the lead's five",
        v2: None,
        sheet: None,
        status: "new",
        against_sheet: None,
        tests: "5.8.3",
        decides: vec![Q_533_DEFAULT, Q_533_UNTIL, Q_541_KEEPERS, Q_584_NAMED],
        reading: vec![R_CROSS.into(), R_P7_1.into(), "the lead's expected answer, in the prompt of this session: \"K9 empty, three keepers, one silent: not shown\"".into()],
        choices: vec![5, 6, 7, 15],
        sc: s,
        ask: "in_force",
        args: vec![root],
        stubs: vec![],
        answer: ans("not shown", "5.8.3", "per keeper", "every keeper named is needed (K9's socket empty); keeper K3 does not yet show the Terms act or B's assent: a record of K3's is held without them").counted(&[k1, k2]).not_showing(&[k3]),
        also: vec![],
    });
}
