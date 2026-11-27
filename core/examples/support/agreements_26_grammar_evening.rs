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

pub const Q_561B_FILL: &str = "draft 26, 5.6.1(b): \"no update condition can give a power for a person who did not sign the version that gives it, and an assent that fills an unknown party's spot gives no power\"";
pub const Q_5107_NOPOWER: &str = "draft 26, 5.10.7: \"An assent that fills an unknown party's spot gives no power: a power the version carries is given by its known parties and binds only them.\"";
pub const Q_5106_POWER: &str = "draft 26, 5.10.6: \"No update of the known parties reaches a filling in any way, and no power a version carries is used for its holder but one they gave in an act of their own (5.10.7)\"";
pub const Q_551A: &str = "draft 26, 5.5.1(a): \"Where that version names keepers, the gate counts only the assents its keepers show, as many of them as 5.8.3 asks, and answers per keeper: an update not shown so is no update of that version while they do not show it; it competes with nothing and makes no fork (5.5.4, §5.12).\"";
pub const Q_557C_KEEPERS: &str = "draft 26, 5.5.7(c): \"Where the original names keepers, the cMIP is asked on the assents the keepers show (5.5.1(a)), and its answer is passed on per keeper, with **not shown** for the update as in force.\"";
pub const Q_533_AGREE: &str = "draft 26, 5.8.3: \"under the default, there is none for what they disagree on: a verifier answers **not shown** for the answers that rest on it, with the reason that the keepers disagree; answers that rest only on what they agree on stand.\"";
pub const Q_533_DISAGREE: &str = "draft 26, 5.8.3: \"Where they disagree, a verifier names the keepers and shows the records of each as evidence of the disagreement\"";
pub const Q_UNKNOWN_KNOWN: &str = "draft 26, §3.2, **Unknown party**: \"A spot that a known party of the version naming it fills is filled by a known party's act: that filling is no unknown party's, the known parties' rules apply to it, and an update reaches it as it reaches that party.\"";
pub const Q_5107_KNOWN: &str = "draft 26, 5.10.7: \"A spot a known party fills is a known party's act (§3.2), and this rule does not stand for it.\"";
pub const Q_561C: &str = "draft 26, 5.6.1(c): \"the act is a Terms act that replaces Terms by which they are bound as a known party (§3.2), and it passes the gate and the pin of those Terms (5.5.1) (5.6.2).\"";
pub const Q_531_SIGNER_G: &str = "draft 26, 5.3.1: \"The signer of a Terms act is its first author, whether or not `authors` names them: `authors` names the other authors, and MAY name the signer too. No Terms are invalid for leaving their signer out of `authors`.\"";
pub const Q_557E: &str = "draft 26, 5.5.7(e): \"A verifier answers **valid**, with the words \"by default\", where an assent to the update in the name of each of them is held, the update's own Terms act being its signer's (§4.3)\"";
pub const Q_551B: &str = "draft 26, 5.5.1(b): \"Its order after the last replacement of that version is shown: it is shown after the acts that put that version in force (for a first version, the assents of 5.4.1's first sentence; for one that is itself an update, the acts that put it through its gate); and every other update of that version that passes the gate is shown after it, and so is late.\"";
pub const Q_551B_KNOTS: &str = "draft 26, 5.5.1(b): \"where it names none, knots pin it (§5.13), qualified **as shown**.\"";
pub const Q_553: &str = "draft 26, 5.5.3: \"A verifier MUST take it per the keepers the Terms name, qualified **per keeper**, with the keepers that counted named, by K9's answer, and the others named as not showing it (§5.8)\"";
pub const Q_533_STAYS: &str = "draft 26, 5.8.3: \"An agreement whose keepers do not show its acts, as many of them as this rule asks, stays where they left it: no act gets past them as an update (5.5.1).\"";
pub const Q_533_NEW: &str = "draft 26, 5.8.3: \"What its parties do next is a new agreement: a new first act, which MAY name the earlier agreement, and is not an update of it and no fork with it (5.4.1, §5.12).\"";
pub const Q_541_FIRST: &str = "draft 26, 5.4.1: \"A Terms act without `replaces` is a first version.\"";
pub const Q_584_COPY: &str = "draft 26, 5.8.4: \"A keeper's signed record counts wherever a copy is held, for every answer about order; what a keeper signed stands when it no longer shows the agreement's acts.\"";
pub const Q_5106_COPY: &str = "draft 26, 5.10.6: \"Where the agreement's keepers no longer show its acts, such a filling stands where a copy that the verifier holds of their signed records shows it (5.10.2, 5.8.4), as many of them as 5.8.3 asks, bound by its version for as long as its words say; with no copy held, whether it stands is **unchecked** (§3.6).\"";
pub const Q_UNCHECKED_REC: &str = "draft 26, §3.6, **Unchecked**: \"the verifier lacks something it needs to apply a grammar rule: a cMIP the Terms name, an act named in a field that it does not hold, or a keeper's record that it does not hold. A missing act never becomes a yes, and never a no.\"";
pub const Q_5102: &str = "draft 26, 5.10.2: \"A verifier MUST answer each filling with its proof, each act reported by who signed it (the MICS, §2), qualified per the keepers its own version names, or as shown where that version names none\"";
pub const Q_K9_ROW: &str = "draft 26, §6, K9: \"Have enough of the keepers named shown this act?\"";
pub const Q_533_CMIP: &str = "draft 26, 5.8.3: \"An act counts for an answer about order only once as many of them show it as that cMIP, or this default, asks.\"";
pub const Q_5133_KEEPER: &str = "draft 26, 5.13.3: \"Act B is shown after act A when the verifier holds acts, each naming the one before by fingerprint, that lead from B back to A, or a keeper's record or an anchoring that places them so (5.13.5).\"";

pub const R_FILL_NO_POWER: &str = "the ledger, \"A filling gives no power\" (27 November, 18:39–18:44), and his correction (18:46): \"“that fills an unknown party spot”\"";
pub const R_NEVER_SHOWN: &str = "the ledger, \"An update the keeper never showed is no update\" (27 November, 22:27–22:30): \"To be valid the agreement needs to be checked at the keeper.\"";
pub const R_P5_1: &str = "the lead's readings for P2 (docs/lead/notes/2026-11-27-readings-for-p2.md), \"P5's batch of four, 23:22\", answer 1: \"With keepers named, the assents the update condition is given are those the keepers show (22:45, 1); the verifier passes on its answer per keeper (likely not valid), and \"not shown\" as in force.\" The lead's reading";
pub const R_TWO_DISAGREE: &str = "the ledger, \"The place vouches for the chaining only\" (26 November, 17:47–17:49): \"Two disagreeing has its value though\"; and the lead's note of 27 November (docs/lead/notes/2026-11-27-draft-26-readings.md), row C46d: \"Only answers resting on C are not shown.\" The lead's reading";
pub const R_KNOWN_FILLS: &str = "the ledger, \"A filling gives no power\" (27 November, 18:46–18:47): \"“that fills an unknown party spot”\"; and the lead's readings for P2 (docs/lead/notes/2026-11-27-readings-for-p2.md), the seven, row 7: \"A spot a known party fills is a known party's act: 5.10.7 (an unknown party's filling) does not stand for it.\" The lead's reading";
pub const R_SIGNER_AUTHOR: &str = "the ledger, \"The signer of a Terms act is an author\" (27 November, 16:48–16:50): \"Absolutely. The person publishing the act is by default an author, the rest adds signature later\"; and the lead's note of 27 November, row C1, S";
pub const R_DEAD: &str = "the ledger, \"A dead keeper: two of three cannot leave it\" (27 November, 21:29–21:42): \"Keeper is dead. That version of the agreement is dead.\"";
pub const R_NEW_ACT: &str = "the ledger, \"A dead keeper: the agreement is dead; what follows is a new act\" (27 November, 22:36): \"So, whatever they do next is a new act, a new agreement, that can point to the dead one if they wish to show lineage, but the truth is, every single time, it’s a new act.\"";
pub const R_LOGIC: &str = "the ledger, \"No rule for an exception logic covers\" (27 November, 22:37–22:39): \"Are you creating rules for exceptions that are covered by logic?\"";
pub const R_P6_2: &str = "the lead's readings for P2 (docs/lead/notes/2026-11-27-readings-for-p2.md), \"P6's four lines, 23:55\", line 2: \"A keeper's signed record counts wherever a copy is held, for every answer about order; a keeper's death does not void what it signed.\" The lead's reading";
pub const R_FILL_COPY: &str = "the ledger, \"How many keepers are needed: the agreement and its cMIP decide\" (27 November, 23:22–23:28), and the line after it (23:29): \"It’s not something I would specify.\" (Arrived at, to check: \"Her filling stands where a held copy of the keeper's record shows it; with no copy held, unchecked.\")";
pub const R_MISSING: &str = "the ledger, \"Knots are knots: one reading, \"shown after\"\" (27 November, 07:38–07:49): \"Missing act is always “I don’t know”\"";
pub const R_HOW_MANY: &str = "the ledger, \"How many keepers are needed: the agreement and its cMIP decide\" (27 November, 23:22–23:28): \"What decides if it’s two out of two or three out of two or just one. The agreement and the cMIP it uses\"";
pub const R_LEAD_PROMPT: &str = "the lead's expected answer, as the prompt of this session gives it";

fn ev(name: &str, part: &'static str, tests: &'static str, decides: Vec<&'static str>, reading: Vec<String>, choices: Vec<u8>, sc: &Sc, ask: &'static str, args: Vec<Hash>, stubs: Vec<Asked>, answer: Ans, also: Vec<Ans>) -> G {
    G { name: name.into(), part, v2: None, sheet: None, status: "new", against_sheet: None, tests, decides, reading, choices, sc: sc.clone(), ask, args, stubs, answer, also }
}

fn rd(v: &[&str]) -> Vec<String> {
    v.iter().map(|s| s.to_string()).collect()
}

pub fn cases(out: &mut Out) {
    the_evening(out);
    the_lead_five(out);
    k9_lifts(out);
    the_authors_first_act(out);
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
    lead_five_rest(out);
}

/// (c) The assignment's evening vectors.
fn the_evening(out: &mut Out) {
    let a = tid("A");
    let bb = tid("B");
    let c = tid("C");
    let m = tid("M");
    let uu = tid("U");
    let what = g("what: an identity that fits (stand-in)");

    // c1. A power written into an offer, used for a filler: not her signature.
    let mut s = Sc::new();
    s.who(&m, "M (the offer's maker)");
    s.who(&uu, "U (a buyer, an unknown party)");
    let role = v::party_role(Some(3), Some(&what), Some(stub_socket(stub::K5, arr(vec![arr(vec![b(&uu.id)]), Value::Bool(true)]))));
    let offer = s.root(
        "evening/power over a filler/the offer O, by M",
        &m,
        terms(vec![v::party_signer(&m.id), role.clone()])
            .set(tk::IN_FORCE, stub_socket(stub::K2, arr(vec![who_signer(&m.id)])))
            .set(tk::POWERS, arr(vec![arr(vec![u(0), stub_socket(stub::K3, arr(vec![b(&m.id)]))])])),
    );
    let ua = s.assent("evening/power over a filler/U's assent to O (her filling's proof)", &uu, &offer, &offer);
    let o2 = s.version("evening/power over a filler/O v2, by M", &m, &offer, &offer, terms(vec![v::party_signer(&m.id), role.clone()]).set(tk::IN_FORCE, stub_socket(stub::K2, arr(vec![who_signer(&m.id)]))));
    let forher = s.st(
        "evening/power over a filler/M's assent to O v2 for U, under O",
        &m,
        v::statement(&offer, &o2, v::kind::ASSENT, None).set(sk::FOR, who_signer(&uu.id)).set(sk::UNDER, b(&offer)).set(sk::RELIES_ON, arr(vec![b(&ua)])),
    );
    out.cases.push(ev(
        "evening 1: a power of sort `assent` written by the offer's maker into the offer, for the maker over its fillers; U fills the spot by her assent; the maker assents for U to the offer's next version under that power: U is not bound by it, not her signature",
        "evening",
        "5.6.1(b), 5.10.7",
        vec![Q_561B_FILL, Q_5107_NOPOWER, Q_5106_POWER],
        rd(&[R_FILL_NO_POWER, "the lead's readings for P2, the seven, row 5: \"In an act of her own\" means a Statement in her own name, naming the grantee and the power's sort; K3 reads it. No such act of U's is held. The lead's reading"]),
        vec![],
        &s,
        "bound",
        vec![uu.id, forher],
        vec![asked("K5", stub::K5, "who fills the role at position 1 of O", "U, by her assent to O, earned under O")],
        ans("not shown", "5.6.1(b)", "as shown", "U holds a filling of an unknown party's spot; the power the act is made under is one O carries, given by its known parties, and her assent that filled the spot gives no power; no act of her own giving that power is held").who(&uu.id),
        vec![],
    ));

    // c2. An update signed by fewer than the condition asks, under a silent keeper: not shown.
    let mut s = Sc::new();
    s.who(&a, "A");
    s.who(&bb, "B");
    s.who(&c, "C");
    let k = keeper_id("K");
    let root = s.root(
        "evening/silent keeper/root, by A (A, B, C; the condition asks all three; keeper K)",
        &a,
        terms(signers(&[&a, &bb, &c])).set(tk::KEEPER, keepers(&[k])).set(tk::CONDITION, stub_socket(stub::K4, arr(vec![u(0), u(3)]))),
    );
    let b1 = s.assent("evening/silent keeper/B's assent", &bb, &root, &root);
    let c1 = s.assent("evening/silent keeper/C's assent", &c, &root, &root);
    let v2 = s.version("evening/silent keeper/v2, by A", &a, &root, &root, terms(signers(&[&a, &bb, &c])).set(tk::KEEPER, keepers(&[k])).set(tk::CONDITION, stub_socket(stub::K4, arr(vec![u(0), u(3)]))));
    let b2 = s.assent("evening/silent keeper/B's assent to v2", &bb, &root, &v2);
    let _ = b2;
    s.keeper("K", "live", vec![vec![root, b1, c1]]);
    out.cases.push(ev(
        "evening 2: Terms of A, B and C naming keeper K, whose condition asks all three; K shows the root and every assent to it; v2, signed by A and B only, two of the three the condition asks, and K's record held shows neither v2 nor B's assent to it: not shown, per keeper, K named; no update of the root while K does not show it",
        "evening",
        "5.5.1(a)",
        vec![Q_551A, Q_557C_KEEPERS],
        rd(&[R_NEVER_SHOWN, R_P5_1, "the condition is not asked: the update is not shown at the keeper, so it is no update of the root (5.5.1(a)); were K to show it with its two assents, the condition, asked on them, would answer not valid (all three asked), and that answer would be passed on per keeper (5.5.7(c), the lead's P5 answer 1)"]),
        vec![5, 6, 7],
        &s,
        "update",
        vec![v2],
        vec![],
        ans("not shown", "5.5.1(a)", "per keeper", "keeper K, which the root names, does not show v2 or any assent to it: v2 is no update of the root while K does not show it; it competes with nothing and makes no fork").not_showing(&[k]),
        vec![ans("in force", "5.5.3", "per keeper", "the root stays in force: K shows the Terms act and the assents of B and C").who(&root).counted(&[k])],
    ));

    // c3. Two keepers disagreeing on one act only: what they agree on stands.
    let mut s = Sc::new();
    s.who(&a, "A");
    s.who(&bb, "B");
    let (k1, k2) = (keeper_id("K1"), keeper_id("K2"));
    let root = s.root("evening/two keepers disagree/root, by A (keepers K1 and K2)", &a, terms(signers(&[&a, &bb])).set(tk::KEEPER, keepers(&[k1, k2])));
    let b1 = s.assent("evening/two keepers disagree/B's assent", &bb, &root, &root);
    let x = s.note("evening/two keepers disagree/A's note X", &a, &root, &root, &[]);
    let y = s.note("evening/two keepers disagree/B's note Y", &bb, &root, &root, &[]);
    s.keeper("K1", "live", vec![vec![root, b1, x, y]]);
    s.keeper("K2", "live", vec![vec![root, b1, y, x]]);
    out.cases.push(ev(
        "evening 3a: two keepers named, K9's socket empty; both place the Terms act and B's assent in the same order, and disagree only on the order of two later notes, X and Y: in force, per keeper, both named: the answer rests only on what they agree on",
        "evening",
        "5.8.3",
        vec![Q_533_AGREE, Q_533_DEFAULT, Q_541_KEEPERS],
        rd(&[R_CROSS, R_TWO_DISAGREE]),
        vec![5, 6, 7],
        &s,
        "in_force",
        vec![root],
        vec![],
        ans("in force", "5.4.1", "per keeper", "every keeper named places the Terms act and B's assent, in the same order; they disagree only on X and Y, on which this answer does not rest").counted(&[k1, k2]),
        vec![],
    ));
    out.cases.push(ev(
        "evening 3b: the same two keepers: asked whether Y is shown after X, on which they disagree: not shown, the keepers disagree, both records shown as evidence",
        "evening",
        "5.8.3",
        vec![Q_533_AGREE, Q_533_DISAGREE, Q_5133_KEEPER],
        rd(&[R_CROSS, R_TWO_DISAGREE]),
        vec![5, 6, 7],
        &s,
        "order",
        vec![y, x],
        vec![],
        ans("not shown", "5.8.3", "per keeper", "the keepers disagree: K1 places X before Y, K2 places Y before X; neither note names the other, so no knot orders them; each keeper's record is shown as evidence of the disagreement").not_showing(&[k1, k2]),
        vec![],
    ));

    // c4. A known party fills a spot, then the others update: the update reaches her.
    let mut s = Sc::new();
    s.who(&a, "A");
    s.who(&bb, "B (a known party, who also fills the role)");
    let k = keeper_id("K");
    let role = v::party_role(Some(3), Some(&what), Some(stub_socket(stub::K5, arr(vec![arr(vec![b(&bb.id)]), Value::Bool(true)]))));
    let fields = |p: P| p.set(tk::KEEPER, keepers(&[k])).set(tk::IN_FORCE, stub_socket(stub::K2, arr(vec![who_signer(&a.id), who_signer(&bb.id)]))).set(tk::CONDITION, stub_socket(stub::K4, arr(vec![u(0), u(1)])));
    let root = s.root("evening/a known party fills/root, by A (A, B, a role; keeper K; the condition asks one known party)", &a, fields(terms(vec![v::party_signer(&a.id), v::party_signer(&bb.id), role.clone()])));
    let b1 = s.assent("evening/a known party fills/B's assent (it also fills the role)", &bb, &root, &root);
    let v2 = s.version("evening/a known party fills/v2, by A alone", &a, &root, &root, fields(terms(vec![v::party_signer(&a.id), v::party_signer(&bb.id), role.clone()])));
    s.keeper("K", "live", vec![vec![root, b1, v2]]);
    out.cases.push(ev(
        "evening 4: B, a known party named as a signer, also fills the role of the root by her assent; A alone then makes v2, which the condition (one known party) answers valid, K showing it: B is bound by v2, as a known party: the update reaches her filling as it reaches her",
        "evening",
        "5.6.1(c), §3.2",
        vec![Q_UNKNOWN_KNOWN, Q_5107_KNOWN, Q_561C],
        rd(&[R_KNOWN_FILLS]),
        vec![5, 6, 7],
        &s,
        "bound",
        vec![bb.id, v2],
        vec![
            asked("K2", stub::K2, "are assents in the names of A and B present, for the root", "yes: A's Terms act and B's assent"),
            asked("K5", stub::K5, "who fills the role at position 2 of the root", "B, by her assent to the root"),
            asked("K4", stub::K4, "is v2 valid, given the root and the assents to v2 K shows", "valid: one of the root's known parties (A, by the Terms act v2) signs it"),
        ],
        ans("shown", "5.6.1(c)", "per keeper", "v2 replaces Terms by which B is bound as a known party, and passes their gate (the condition answers valid) and their pin (K places v2 after the root's completing assents); her filling is a known party's act, which an update reaches as it reaches her").who(&bb.id).counted(&[k]),
        vec![],
    ));

    // c5. The signer unlisted in authors: valid.
    let mut s = Sc::new();
    s.who(&a, "A");
    s.who(&bb, "B");
    let root = s.root("evening/signer unlisted/root, by A (A, B)", &a, terms(signers(&[&a, &bb])));
    let b1 = s.assent("evening/signer unlisted/B's assent", &bb, &root, &root);
    s.note("evening/signer unlisted/A's note, naming B's assent", &a, &root, &root, &[b1]);
    s.note("evening/signer unlisted/B's note", &bb, &root, &root, &[]);
    let v2 = s.version("evening/signer unlisted/v2, by B, its authors naming A only", &bb, &root, &root, terms(signers(&[&a, &bb])));
    s.assent("evening/signer unlisted/A's assent to v2", &a, &root, &v2);
    out.cases.push(ev(
        "evening 5: v2 signed by B, a party named as a signer, whose `authors` name A only; A assents to v2: valid, by default; B is v2's first author, and its Terms act her assent",
        "evening",
        "5.3.1, 5.5.7(e)",
        vec![Q_531_SIGNER_G, Q_557E, Q_551B, Q_551B_KNOTS],
        rd(&[R_SIGNER_AUTHOR, R_HER_ASSENT]),
        vec![],
        &s,
        "update",
        vec![v2],
        vec![],
        ans("valid", "5.5.7(e)", "as shown", "by default: an assent in the name of each known party of the root is held: B's, the Terms act v2 itself, and A's"),
        vec![ans("in force", "5.5.1", "as shown", "the root is in force (each party's note is shown after both completing assents); v2, through B's Terms act (its `previous` B's note), is shown after them; no other update of the root is held")],
    ));
}

/// (e) K9 lifting the default: a stub "any one of the two".
fn k9_lifts(out: &mut Out) {
    let a = tid("A");
    let bb = tid("B");
    let (k1, k2) = (keeper_id("K1"), keeper_id("K2"));
    for (silent, shows, tag) in [(k2, k1, "K2"), (k1, k2, "K1")] {
        let mut s = Sc::new();
        s.who(&a, "A");
        s.who(&bb, "B");
        let lbl = format!("K9 any one/{tag} silent");
        let root = s.root(&format!("{lbl}/root, by A (keepers K1 and K2; K9: any one of the two)"), &a, terms(signers(&[&a, &bb])).set(tk::KEEPER, keepers(&[k1, k2])).set(tk::KEEPERS_CMIP, stub_socket(stub::K9, arr(vec![u(1)]))));
        let b1 = s.assent(&format!("{lbl}/B's assent"), &bb, &root, &root);
        let showing = if shows == k1 { "K1" } else { "K2" };
        s.keeper("K1", "live", if shows == k1 { vec![vec![root, b1]] } else { vec![vec![]] });
        s.keeper("K2", "live", if shows == k2 { vec![vec![root, b1]] } else { vec![vec![]] });
        out.cases.push(ev(
            &format!("K9 lifting the default: keepers K1 and K2 named, K9 a stub asking any one of the two; {showing} shows the Terms act and B's assent, {tag}'s record is held and shows neither: in force, per keeper, {showing} named as the keeper that counted, {tag} as not showing them"),
            "K9",
            "5.8.3, K9",
            vec![Q_533_DEFAULT, Q_533_CMIP, Q_K9_ROW, Q_584_NAMED, Q_541_KEEPERS],
            rd(&[R_CROSS, R_HOW_MANY]),
            vec![5, 6, 7, 15],
            &s,
            "in_force",
            vec![root],
            vec![
                asked("K9", stub::K9, &format!("have enough of K1 and K2 shown the Terms act? (the records held: {showing} places it at 1, {tag} places nothing)"), &format!("yes: {showing} shows it, one of the two")),
                asked("K9", stub::K9, &format!("have enough of K1 and K2 shown B's assent? ({showing} places it at 2)"), &format!("yes: {showing} shows it, one of the two")),
            ],
            ans("in force", "5.4.1", "per keeper", &format!("the assents of 5.4.1 (A's Terms act, B's assent) are placed: K9's cMIP answers that enough of the keepers show each, {showing} counting; {tag} named as not showing them")).counted(&[shows]).not_showing(&[silent]),
            vec![],
        ));
    }
}

/// (d) The rest of the lead's five, and the pair of his P7 answer 1.
fn lead_five_rest(out: &mut Out) {
    let a = tid("A");
    let bb = tid("B");
    let m = tid("M");
    let uu = tid("U");
    let what = g("what: an identity that fits (stand-in)");

    // d1. An update the keepers never show: no update, no fork.
    let mut s = Sc::new();
    s.who(&a, "A");
    s.who(&bb, "B");
    let k = keeper_id("K");
    let root = s.root("five/never shown/root, by A (keeper K)", &a, terms(signers(&[&a, &bb])).set(tk::KEEPER, keepers(&[k])));
    let b1 = s.assent("five/never shown/B's assent", &bb, &root, &root);
    let v2a = s.version("five/never shown/v2a, by A", &a, &root, &root, terms(signers(&[&a, &bb])).set(tk::KEEPER, keepers(&[k])));
    let b2a = s.assent("five/never shown/B's assent to v2a", &bb, &root, &v2a);
    let v2b = s.version("five/never shown/v2b, by B", &bb, &root, &root, terms(signers(&[&a, &bb])).set(tk::KEEPER, keepers(&[k])));
    let a2b = s.assent("five/never shown/A's assent to v2b", &a, &root, &v2b);
    let _ = b2a;
    s.keeper("K", "live", vec![vec![root, b1, v2b, a2b]]);
    let base_reading = rd(&[R_NEVER_SHOWN, R_LOGIC, R_LEAD_PROMPT]);
    out.cases.push(ev(
        "the lead's five, 1a: keeper K named; v2a (A's) and B's assent to it are held, signed by every known party, and K never shows them; v2b (B's) and A's assent to it, K shows: asked about v2a: not shown, per keeper: no update of the root, and no fork with v2b",
        "the lead's five",
        "5.5.1(a)",
        vec![Q_551A],
        base_reading.clone(),
        vec![5, 6, 7],
        &s,
        "update",
        vec![v2a],
        vec![],
        ans("not shown", "5.5.1(a)", "per keeper", "K, which the root names, does not show v2a or B's assent to it: v2a is no update of the root while K does not show it; it competes with nothing and makes no fork").not_showing(&[k]),
        vec![],
    ));
    out.cases.push(ev(
        "the lead's five, 1b: the same acts: which Terms are in force: v2b, per keeper, K named; no fork with v2a",
        "the lead's five",
        "5.5.1, 5.5.3",
        vec![Q_551A, Q_553, "draft 26, 5.5.5(d): \"Whether a Terms act has replaced the original is judged per the keepers, and the clock, that the original names (§5.8), whatever keepers the new version names: the Terms act, and each act its gate and its pin count, count once those keepers have placed them (5.5.1).\""],
        base_reading,
        vec![5, 6, 7],
        &s,
        "last_version",
        vec![root],
        vec![],
        ans("in force", "5.5.3", "per keeper", "the root is in force per K (its Terms act and B's assent placed); v2b passes the root's gate by default (B's Terms act and A's assent, both placed by K) and its pin (K places it after the root's completing assents); v2a, not shown at K, is no update and makes no fork").who(&v2b).counted(&[k]),
        vec![],
    ));

    // d2. A new first act naming a dead one: a new agreement.
    let mut s = Sc::new();
    s.who(&a, "A");
    s.who(&bb, "B");
    let (k1, k2) = (keeper_id("K1"), keeper_id("K2"));
    let old = s.root("five/new agreement/the old agreement's root, by A (keeper K1, dead)", &a, terms(signers(&[&a, &bb])).set(tk::KEEPER, keepers(&[k1])));
    let ob = s.assent("five/new agreement/B's assent to the old root", &bb, &old, &old);
    let new = s.root("five/new agreement/a new first act, by A (keeper K2), relying on the old agreement's tip", &a, terms(signers(&[&a, &bb])).set(tk::KEEPER, keepers(&[k2])).set(tk::RELIES_ON, arr(vec![b(&old)])));
    let nb = s.assent("five/new agreement/B's assent to the new first act", &bb, &new, &new);
    s.keeper("K1", "dead: it shows nothing after position 2", vec![vec![old, ob]]);
    s.keeper("K2", "live", vec![vec![new, nb]]);
    let r = rd(&[R_DEAD, R_NEW_ACT, "the clone of 21:42 is the new agreement of 22:36: the ledger, \"The clone is the new agreement\" (27 November, 23:30–23:32)", R_LEAD_PROMPT]);
    out.cases.push(ev(
        "the lead's five, 2a: an agreement whose keeper K1 is dead (a held copy of its signed record shows the root and B's assent, and it shows nothing more); A and B make a new first act naming keeper K2 and, in `relies_on`, the old agreement's tip: the new act is a first version, a new agreement: in force, per keeper, K2 named",
        "the lead's five",
        "5.8.3, 5.4.1",
        vec![Q_533_NEW, Q_541_FIRST, Q_541_KEEPERS],
        r.clone(),
        vec![5, 6, 7, 14],
        &s,
        "in_force",
        vec![new],
        vec![],
        ans("in force", "5.4.1", "per keeper", "a first version (no `replaces`): its own root, of its own agreement; K2, which it names, places A's Terms act and B's assent").counted(&[k2]),
        vec![],
    ));
    out.cases.push(ev(
        "the lead's five, 2b: the same acts: which Terms of the old agreement are in force: its root, per keeper K1, as K1 left it; the new first act is not an update of it",
        "the lead's five",
        "5.8.3, 5.8.4",
        vec![Q_533_STAYS, Q_533_NEW, Q_584_COPY],
        r,
        vec![5, 6, 7, 14],
        &s,
        "last_version",
        vec![old],
        vec![],
        ans("in force", "5.5.3", "per keeper", "the old agreement stays where its keeper left it: the held copy of K1's signed record places its root and B's assent; the new first act names it in `relies_on`, and is not an update of it and no fork with it").who(&old).counted(&[k1]),
        vec![],
    ));

    // d4, d5. A held copy of a dead keeper's record: it stands; none held: unchecked.
    for held in [true, false] {
        let mut s = Sc::new();
        s.who(&a, "A");
        s.who(&bb, "B");
        let k = keeper_id("K");
        let tag = if held { "copy held" } else { "no copy" };
        let root = s.root(&format!("five/dead keeper/{tag}/root, by A (keeper K)"), &a, terms(signers(&[&a, &bb])).set(tk::KEEPER, keepers(&[k])));
        let b1 = s.assent(&format!("five/dead keeper/{tag}/B's assent"), &bb, &root, &root);
        s.keeper("K", "dead: it shows nothing after position 2", if held { vec![vec![root, b1]] } else { vec![] });
        let (name, answer, decides) = if held {
            (
                "the lead's five, 4a: keeper K named, now dead; the verifier holds a copy of K's signed record, which places the root and B's assent: in force, per keeper: what K signed stands",
                ans("in force", "5.4.1", "per keeper", "the held copy of K's signed record places A's Terms act and B's assent; what K signed stands when it no longer shows the agreement's acts").counted(&[k]),
                vec![Q_584_COPY, Q_541_KEEPERS],
            )
        } else {
            (
                "the lead's five, 5a: keeper K named, now dead; the verifier holds none of K's records: unchecked",
                ans("unchecked", "5.4.1", "per keeper", "the verifier lacks a keeper's record it needs: none of K's records is held; a missing record never becomes a yes, and never a no").not_showing(&[k]),
                vec![Q_UNCHECKED_REC, Q_584_COPY, Q_541_KEEPERS],
            )
        };
        out.cases.push(ev(name, "the lead's five", "5.8.4, §3.6", decides, rd(&[R_P6_2, R_MISSING, R_LEAD_PROMPT]), vec![5, 6, 7], &s, "in_force", vec![root], vec![], answer, vec![]));
    }
    for held in [true, false] {
        let mut s = Sc::new();
        s.who(&m, "M (the offer's maker)");
        s.who(&uu, "U (a buyer, an unknown party)");
        let k = keeper_id("K");
        let tag = if held { "copy held" } else { "no copy" };
        let role = v::party_role(Some(3), Some(&what), Some(stub_socket(stub::K5, arr(vec![arr(vec![b(&uu.id)]), Value::Bool(true)]))));
        let offer = s.root(&format!("five/dead keeper, a filling/{tag}/the offer O, by M (keeper K)"), &m, terms(vec![v::party_signer(&m.id), role]).set(tk::KEEPER, keepers(&[k])).set(tk::IN_FORCE, stub_socket(stub::K2, arr(vec![who_signer(&m.id)]))));
        let ua = s.assent(&format!("five/dead keeper, a filling/{tag}/U's assent to O (her proof)"), &uu, &offer, &offer);
        s.keeper("K", "dead: it shows nothing after position 2", if held { vec![vec![offer, ua]] } else { vec![] });
        let (name, answer) = if held {
            ("the lead's five, 4b: an offer naming keeper K, now dead; U filled its spot by her assent, and the verifier holds a copy of K's signed record placing the offer and her assent: her filling stands, per keeper, earned under the offer", ans("shown", "5.10.2", "per keeper", "the spot's cMIP names U, by her assent to O, earned under O; the held copy of K's signed record, the keeper her version names, places her proof: her filling stands").who(&uu.id).counted(&[k]))
        } else {
            ("the lead's five, 5b: the same offer and filling, keeper K dead, none of K's records held: whether her filling stands is unchecked", ans("unchecked", "5.10.6", "per keeper", "with no copy of K's records held, whether her filling stands is unchecked").who(&uu.id).not_showing(&[k]))
        };
        out.cases.push(ev(
            name,
            "the lead's five",
            "5.10.6, 5.10.2",
            vec![Q_5106_COPY, Q_5102],
            rd(&[R_FILL_COPY, "the lead's readings for P2 (docs/lead/notes/2026-11-27-readings-for-p2.md), \"After his 22:36 and 22:39, for P5, 22:45\", answer 4: \"her filling stands as the keeper showed it before it died, bound by her version for as long as its words say, recorded and checkable; nothing reaches it, the new agreement included.\" The lead's reading", R_LEAD_PROMPT]),
            vec![5, 6, 7],
            &s,
            "fillings",
            vec![offer],
            vec![asked("K5", stub::K5, "who fills the role at position 1 of O, on the acts held and the keepers' answers", "U, by her assent to O, earned under O")],
            answer,
            vec![],
        ));
    }

    // The pair of the lead's P7 answer 1: a record of that keeper's held
    // without the act: not shown; none of its records held: unchecked.
    for held in [true, false] {
        let mut s = Sc::new();
        s.who(&a, "A");
        s.who(&bb, "B");
        let (k1, k2) = (keeper_id("K1"), keeper_id("K2"));
        let tag = if held { "held without the act" } else { "none held" };
        let root = s.root(&format!("P7 pair/{tag}/root, by A (keepers K1 and K2)"), &a, terms(signers(&[&a, &bb])).set(tk::KEEPER, keepers(&[k1, k2])));
        let b1 = s.assent(&format!("P7 pair/{tag}/B's assent"), &bb, &root, &root);
        s.keeper("K1", "live", vec![vec![root, b1]]);
        s.keeper("K2", "live", if held { vec![vec![root]] } else { vec![] });
        let (name, answer, decides) = if held {
            ("the lead's P7 answer 1, the first of the pair: keepers K1 and K2 named, K9's socket empty; K1 places the root and B's assent; a record of K2's is held, placing the root and not B's assent: not shown, per keeper, K2 named as not showing it", ans("not shown", "5.8.3", "per keeper", "every keeper named is needed; the verifier holds a record of K2's without B's assent: K2 does not yet show it").counted(&[k1]).not_showing(&[k2]), vec![Q_533_DEFAULT, Q_533_UNTIL, Q_584_NAMED])
        } else {
            ("the lead's P7 answer 1, the second of the pair: the same, none of K2's records held: unchecked", ans("unchecked", "5.8.3", "per keeper", "every keeper named is needed; the verifier holds none of K2's records: it lacks a keeper's record it needs").counted(&[k1]).not_showing(&[k2]), vec![Q_533_DEFAULT, Q_UNCHECKED_REC])
        };
        out.cases.push(ev(name, "the lead's five", "5.8.3, §3.6", decides, rd(&[R_P7_1, R_CROSS, R_MISSING]), vec![5, 6, 7], &s, "in_force", vec![root], vec![], answer, vec![]));
    }
}
