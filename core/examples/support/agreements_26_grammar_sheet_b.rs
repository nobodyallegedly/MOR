//! Part 4 (b) of stage one, session 2, second half: the codemeister's sheet,
//! section 4.4, lines 46 to 79 (draft 26's 5.6 to 5.13). Every answer is
//! read from draft 26 at b58e417, with the ledger and the lead's notes,
//! quoted beside it; never from the sheet's prediction, never from code.

use super::*;

// ---------------------------------------------------------------- draft 26, quoted
const Q_541_DEFAULT: &str = "draft 26, 5.4.1: \"Where it carries no `in_force`, it comes into force when there is an assent to it in the name of every party it names as a signer, the Terms act itself being its signer's (§4.3).\"";
const Q_541_KNOTS: &str = "draft 26, 5.4.1: \"Where it names none, knots show it: each party in whose name one of those assents is counted has made an act in that same name within the agreement (a Terms act or a Statement of that agreement, and no other knot) that is shown after every one of those assents (§5.13).\"";
const Q_541_KEEPERS: &str = "draft 26, 5.4.1: \"Where it names keepers, they show it, as many of them as 5.8.3 asks, at the positions they give those assents, and an act they do not yet show is not yet placed (§3.4).\"";
const Q_561B: &str = "draft 26, 5.6.1(b): \"their own signature is on the version of those Terms that gives the power, the version `under` names, as an assent counted in their name (5.6.5(f)), and they are a known party of that version\"";
const Q_561B_NO_COND: &str = "draft 26, 5.6.1(b): \"no update condition can give a power for a person who did not sign the version that gives it\"";
const Q_561B_FOR: &str = "draft 26, 5.6.1(b): \"the act's `for` names them, or names an agreement by whose Terms they are bound (5.1.2); its `under` names Terms by which they are bound and which were in force when the act was made, as 5.6.4 places it (§5.5)\"";
const Q_561C_FILL: &str = "draft 26, 5.6.1(c): \"No update binds anyone through an unknown party's filling (§3.2): such a filling is bound by the version its proof names, and by no update (5.4.3, §5.10).\"";
const Q_5106: &str = "draft 26, 5.10.6: \"A verifier MUST NOT read any update, or any update condition's answer, as reaching an unknown party's filling (5.5.7).\"";
const Q_563: &str = "draft 26, 5.6.3: \"An act with `for` and `under` is made in the name its `for` names, and binds only as 5.6.1(b) says: it binds the grantor (5.6.6), who gave the power, and never its signer, the agent, as an act of the agent's own.\"";
const Q_564_A: &str = "draft 26, 5.6.4: \"they are bound by the act if it was made before the Terms that replace those were in force, and not bound if it was made after.\"";
const Q_564_KEEPER: &str = "draft 26, 5.6.4: \"A verifier MUST answer from §5.8: per the keepers the Terms that gave the power name, by the act's position against the position at which the replacing Terms passed the gate and the pin\"";
const Q_564_DISAGREE: &str = "draft 26, 5.6.4: \"where fewer of those keepers show it than 5.8.3 asks, or they disagree, **not shown**, with that reason (5.8.3).\"";
const Q_533_DISAGREE: &str = "draft 26, 5.8.3: \"under the default, there is none for what they disagree on: a verifier answers **not shown** for the answers that rest on it, with the reason that the keepers disagree; answers that rest only on what they agree on stand.\"";
const Q_533_DEFAULT: &str = "draft 26, 5.8.3: \"Where the Terms name several keepers, how many of them must show an act is said by the cMIP the same Terms name beside them (task K9); where that socket is empty, every keeper named is needed.\"";
const Q_533_EVIDENCE: &str = "draft 26, 5.8.3: \"Where they disagree, a verifier names the keepers and shows the records of each as evidence of the disagreement\"";
const Q_584_NAMED: &str = "draft 26, 5.8.4: \"A verifier MUST take those answers from the keepers, qualified **per keeper**, with the keepers that counted named, by K9's answer, and the others named as not showing it.\"";
const Q_584_CONTRA: &str = "draft 26, 5.8.4: \"a keeper's record that contradicts a knot the verifier holds (B placed before A, while A names B) gives **not shown** for the answers that rest on that record, with the reason that the keeper contradicts the acts, and the record is kept as evidence (5.5.4(c)).\"";
const Q_557E: &str = "draft 26, 5.5.7(e): \"A verifier answers **valid**, with the words \"by default\", where an assent to the update in the name of each of them is held, the update's own Terms act being its signer's (§4.3); where one is lacking it answers **not shown** for the update as a replacement (5.5.5(c)), and never **not valid**: the missing assent may exist.\"";
const Q_566A: &str = "draft 26, 5.6.6(a): \"By a version of the Terms that give the power, which ends or narrows it, made as any update of those Terms is: their update condition decides, as its cMIP dictates (5.5.7), or, where they name none, the default (5.5.5(a))\"";
const Q_551B: &str = "draft 26, 5.5.1(b): \"Its order after the last replacement of that version is shown: it is shown after the acts that put that version in force (for a first version, the assents of 5.4.1's first sentence; for one that is itself an update, the acts that put it through its gate); and every other update of that version that passes the gate is shown after it, and so is late.\"";
const Q_551_TWO: &str = "draft 26, 5.5.1: \"In force needs both checks.\"";
const Q_572: &str = "draft 26, 5.7.2: \"Two acts by one signer within one agreement that name the same `previous` (or that both name none) are a fork, whatever else orders them\"";
const Q_572_KEEPER: &str = "draft 26, 5.7.2: \"A verifier holding both MUST answer **fork** for that signer, whatever a keeper shows: an act the keepers do not show is still a tip.\"";
const Q_571_AS_SHOWN: &str = "draft 26, 5.7.1: \"Whether two acts of a line are a fork, and whether a line is unchecked before an act, are answered from the acts held, **as shown**, whatever a keeper shows.\"";
const Q_582: &str = "draft 26, 5.8.2: \"Only the order given by the keepers the Terms name counts for the agreement: a relay the Terms do not name gives no order for it, whatever it relays.\"";
const Q_5133_OTHER: &str = "draft 26, 5.13.3: \"Any other anchoring or keeper is evidence a reader may show, labelled as that reader's: it never pins, and never makes an update late (5.5.3, 5.13.5).\"";
const Q_5135: &str = "draft 26, 5.13.5: \"An anchoring of the reader's own choosing, whether or not the agreement names any, gives an answer only as that reader's, named so, given beside the Terms' answer and never in its place\"";
const Q_585_FILL: &str = "draft 26, 5.8.5: \"For a filling, the keepers and the clock are those its own version names (the version its proof names), never those of the Terms in force\"";
const Q_5102_FILL: &str = "draft 26, 5.10.2: \"A verifier MUST answer each filling with its proof, each act reported by who signed it (the MICS, §2), qualified per the keepers its own version names, or as shown where that version names none: a filling's keepers and clock are those of its own version, never those of the Terms in force (5.8.5).\"";
const Q_5102_EARNED: &str = "draft 26, 5.10.2: \"A filling already earned is read from the version its proof names, its role and that role's cMIP as that version states them, whatever a later version says of the role (5.10.6)\"";
const Q_5107_RIGHTS: &str = "draft 26, 5.10.7: \"An unknown party's filling (§3.2) has exactly the rights offered by the version it was earned under, with every condition that version puts on them.\"";
const Q_5107_ONLY: &str = "draft 26, 5.10.7: \"Nothing changes what a filling earned except an assent its holder signs in their own name (5.6.1(a)), whether or not it is counted for the later version\"";
const Q_5107_NAME: &str = "draft 26, 5.10.7: \"A verifier MUST name, with each filling, the version it was earned under, and each later version that changes what it earned, with the assent that rests on\"";
const Q_5108_CLOCK: &str = "draft 26, 5.10.8: \"What a filling gave lasts as long as the words of the version it was earned under say, measured on the clock that version names, from the anchoring of the purchase\"";
const Q_5108_K1: &str = "draft 26, 5.10.8: \"The cMIP that reads those words (task K1), given that version and its acts and nothing a later version made, answers whether what the filling gave still applies; a verifier shows that answer as that cMIP's, with the ground it gives, qualified **per clock**, and gives none of its own; where it lacks that cMIP, the answer is **unchecked** (§3.6).\"";
const Q_5108_NOTRIG: &str = "draft 26, 5.10.8: \"No condition triggers: these grammar rules have no answer **triggered**, and a verifier MUST NOT give one.\"";
const Q_TASK_OUT: &str = "draft 26, §3.6, *A task's output*: \"Where a task answers yes or no (K2, K3, K6, K8, K9; whether a spot still takes new identities, K5; and whether what a filling gave still applies, K1, 5.10.8), a verifier passes that output on as the task's, with the cMIP named and the ground or cause it gives, and not as an answer of this text; where it lacks the cMIP, the answer is **unchecked**.\"";
const Q_5119_MAY: &str = "draft 26, 5.11.9: \"The holder of the baker's rights in an envelope, as the envelope's chain names them (Envelopes, §2), MAY make a contest (5.11.8) against Terms that name another envelope of the same work.\"";
const Q_5119_AT: &str = "draft 26, 5.11.9: \"a contest names the contested Terms in `terms`, and in `relies_on` the act of the chain of its signer's own envelope that it relies on (5.13.2), and the holder is read at that act, not from the contested Terms.\"";
const Q_5119_REACH: &str = "draft 26, 5.11.9: \"It reaches the signers of those Terms, is its signer's word (the MICS, §2), and stands on the record.\"";
const Q_5118_VERSION: &str = "draft 26, 5.11.8: \"Its `terms` names Terms shown as a version, in force or not, or a tip set aside (then the contest is shown as **disputed**, §5.12); otherwise the contest is **not shown**.\"";
const Q_5123_STAY: &str = "draft 26, 5.12.3: \"Terms that were in force before a fork was made stay in force: Terms stop only by replacement (5.5.2).\"";
const Q_5124_NOTHING: &str = "draft 26, 5.12.4: \"Where what it names in `resolves` are not the tips of a fork in its own line (for a Statement of kind `resolve`, its signer's line; for a Terms act, the agreement's chain), a verifier answers **not shown** for it as a resolving update, with the reason: nothing to resolve\"";
const Q_5124_ONE: &str = "draft 26, 5.12.4: \"or there is no fork: what it names in `resolves` is one update and no other) is an act like any other\"";
const Q_5124_TERMS: &str = "draft 26, 5.12.4: \"A resolving update of Terms that resolves is an update of the shared Terms and takes an update's answers: **valid**, by their update condition or its default, and **in force** once pinned (§5.5)\"";
const Q_5124_CONT: &str = "draft 26, 5.12.4: \"The tip it names in `continues` then counts as the next act of the line, what is built on that tip counts as these grammar rules read it, and the line goes on from that branch.\"";
const Q_5124_NOT_TIP: &str = "draft 26, 5.12.4: \"A resolving update is not a tip of the fork it resolves, and carries no words of its own\"";
const Q_5124_AFTER: &str = "draft 26, 5.12.4: \"For Terms the same holds: a version whose `replaces` names a resolving update replaces the last version of the continued branch\"";
const Q_557G: &str = "draft 26, 5.5.7(g): \"With none named, the default asks for the known parties (5.5.5(a)).\"";
const Q_555A_ROLE: &str = "draft 26, 5.5.5(a): \"the parties the original names as signers or as agreements; never a party named by role, and never a signer who fills a role.\"";
const Q_5133_MISS: &str = "draft 26, 5.13.3: \"Where the acts that could show B after A need an act that is named in a field of an act held, and the verifier does not hold it, the answer is **unchecked** (§3.6): never a yes, and never a no.\"";
const Q_5134: &str = "draft 26, 5.13.4: \"An act that names another, directly or through acts that name it, came after it. A verifier MAY give that order as **shown**, from the acts alone, with no keeper and no qualifier.\"";
const Q_5131: &str = "draft 26, 5.13.1: \"An act is read against the versions and acts it names, in any field that holds a fingerprint (`body`, `terms`, ... the layer below's `prev` and `refs`, and any other), the body's field included.\"";
const Q_5131_LAYERS: &str = "draft 26, 5.13.1: \"Each such naming is a knot (§3.4): any fingerprint in any field of any act the verifier holds, whatever layer either act belongs to; a verifier reads the fields of every layer of the core (§2).\"";
const Q_554_FORK: &str = "draft 26, 5.5.4: \"Where two Terms acts each name the same version in `replaces`, each passes that version's gate (5.5.1(a)), and neither is shown after the other, they are a fork (§5.12)\"";
const Q_554B_READER: &str = "draft 26, 5.5.4(b): \"An anchoring of the reader's own choosing gives only that reader's answer, named so (5.5.3).\"";
const Q_554E: &str = "draft 26, 5.5.4(e): \"A verifier MUST answer **fork** for which Terms replace the version both tips name, show both tips, and MUST NOT choose between them, by position or in any other way.\"";

// ---------------------------------------------------------------- readings
const R_C2: &str = "the lead's note of 27 November (docs/lead/notes/2026-11-27-draft-26-readings.md), row C2: \"Only the assents the agreement's own rule requires; the cMIP in `in_force` names which (K2's output). Not every assent counted.\" The lead's reading";
const R_C3: &str = "the lead's note of 27 November (docs/lead/notes/2026-11-27-draft-26-readings.md), row C3: \"Either: the update's own knots, or those of the acts that put it through the gate. (ii).\" The lead's reading";
const R_C4: &str = "the lead's note of 27 November (docs/lead/notes/2026-11-27-draft-26-readings.md), row C4: \"Two answers, \\\"valid\\\" and \\\"not in force: <reason>\\\".\" The lead's reading, resting on the ledger's \"Valid and in force, two words, two jobs\" (26 November, 18:00)";
const R_C18: &str = "the lead's note of 27 November (docs/lead/notes/2026-11-27-draft-26-readings.md), row C18: \"The version `under` names.\" The lead's reading, resting on \"A power given binds its giver\"";
const R_GIVER: &str = "the ledger, \"The giver bears it, not the agent\" (27 November, 16:50–16:53): \"No, Ana took the risk, she bears the responsability.\"";
const R_UNKNOWN: &str = "the ledger, \"For the unknown party there is no update, only the agreement she signed\" (27 November, 07:53–07:55): \"There is no valid update for her anymore. Only a valid agreement, this is because she is the unknown party the network protects. No?\"";
const R_KNOWN: &str = "the ledger, \"Who signs an update by default: the known parties\" (26 November, 17:51–17:56): \"It’s the protect the unknown party expressed the old way.\"";
const R_F9: &str = "the lead's note of 27 November (docs/lead/notes/2026-11-27-draft-26-readings.md), row F9, F10, C24: \"Her own assent to a later version is her signature, counted or not.\" The lead's reading, resting on the ledger's \"A filling gives no power\" (27 November, 18:39–18:44)";
const R_C23: &str = "the lead's note of 27 November (docs/lead/notes/2026-11-27-draft-26-readings.md), row C23: \"A spot named by the version and position the asker gives (B).\" The lead's reading";
const R_BOTH: &str = "the ledger, \"Two keepers named, both needed\" (27 November, 16:40–16:44): \"If the terms stipulate two keepers, both keepers are needed. Sorry can’t do\"; and \"Keepers: cross verification by default, a socket to lift it\" (27 November, 23:52, to 28 November, 00:00)";
const R_DISAGREE: &str = "the ledger, \"The place vouches for the chaining only\" (26 November, 17:47–17:49): \"Two disagreeing has its value though\"; \"Yes, they should.\"";
const R_C28: &str = "the lead's note of 27 November (docs/lead/notes/2026-11-27-draft-26-readings.md), row C28: \"Only the answers resting on that record are \\\"not shown, the keeper contradicts the acts\\\"; the record is kept as evidence.\" The lead's reading";
const R_C31: &str = "the lead's note of 27 November (docs/lead/notes/2026-11-27-draft-26-readings.md), row C31, F8: \"Given beside the Terms' answer, labelled the reader's, never in its place.\" The lead's reading";
const R_C7: &str = "the lead's note of 27 November (docs/lead/notes/2026-11-27-draft-26-readings.md), row C7: \"Valid and in force, as any update.\" The lead's reading, resting on the ledger's \"A fork is a fork\" (27 November, 07:01–07:08)";
const R_F6: &str = "the lead's note of 27 November (docs/lead/notes/2026-11-27-draft-26-readings.md), row F6, C26: \"Knots. Encoding 3's E3 is wrong and follows draft 26.\" The lead's reading, resting on the ledger's \"Knots are knots: one reading, \\\"shown after\\\"\" (27 November, 07:38–07:49)";
const R_KNOTS: &str = "the ledger, \"Knots are knots: one reading, \\\"shown after\\\"\" (27 November, 07:38–07:49): \"Knots a cross acts by nature, and possibly cross layer.\"";
const R_MISSING: &str = "the ledger, \"Knots are knots: one reading, \\\"shown after\\\"\" (27 November, 07:38–07:49): \"Missing act is always “I don’t know”\"";
const R_CLOCK: &str = "the ledger, \"Ana's month ends by the clock the agreement names\" (27 November, 07:50–07:53): \"The clock specified in the agreement and its anchoring.\"";
const R_FORK: &str = "the ledger, \"A fork is a fork\" (27 November, 07:01–07:08): \"A fork is a fork.\"";
const R_HER_ASSENT: &str = "the ledger, \"Publishing the Terms is the publisher's assent\" (27 November, 20:49–20:50): \"Yes, I don’t see the need to have her sign twice\": the sheet's separate assent by the Terms' signer is not written";

// ---------------------------------------------------------------- helpers

fn g4(name: String, sheet: &'static str, tests: &'static str, decides: Vec<&'static str>, reading: Vec<&str>, choices: Vec<u8>, sc: Sc, ask: &'static str, args: Vec<Hash>, stubs: Vec<Asked>, answer: Ans, also: Vec<Ans>, against: Option<&str>) -> G {
    G {
        name,
        part: "4.4",
        v2: None,
        sheet: Some(sheet),
        status: "new",
        against_sheet: against.map(|s| s.to_string()),
        tests,
        decides,
        reading: reading.into_iter().map(String::from).collect(),
        choices,
        sc,
        ask,
        args,
        stubs,
        answer,
        also,
    }
}

/// Each party in `pins` makes a note within `root`, made within `terms`,
/// naming every completing assent: what pins its side (5.4.1).
fn pin(s: &mut Sc, tag: &str, root: &Hash, terms: &Hash, pins: &[(&Tid, &str)], completing: &[Hash]) {
    for (t, n) in pins {
        s.note(&format!("{tag}/{n}'s next act, naming the completing assents"), t, root, terms, completing);
    }
}

fn k2(names: &[&Tid]) -> Value {
    stub_socket(stub::K2, arr(names.iter().map(|t| who_signer(&t.id)).collect()))
}

fn k3(signers: &[&Tid]) -> Value {
    stub_socket(stub::K3, arr(signers.iter().map(|t| b(&t.id)).collect()))
}

/// A role (sort fits) whose spot is the K5 stub: an assent by one of
/// `fillers` to a version naming the role is a filling.
fn role(fillers: &[&Tid], takes_new: bool) -> Value {
    v::party_role(Some(3), Some(&g("what: an identity that fits (stand-in)")), Some(stub_socket(stub::K5, arr(vec![arr(fillers.iter().map(|t| b(&t.id)).collect()), Value::Bool(takes_new)]))))
}

/// A power of sort assent (0) whose rule is the K3 stub.
fn power_assent(signers: &[&Tid]) -> Value {
    arr(vec![arr(vec![u(0), k3(signers)])])
}

fn k4_k(k: u64) -> Value {
    stub_socket(stub::K4, arr(vec![u(0), u(k)]))
}

fn pos(sc: &mut Sc, n: u64, note: &str) {
    sc.limits = Some(json!({ "position": n, "about": note }));
}

pub fn cases(out: &mut Out) {
    let a = tid("A");
    let bb = tid("B");
    let c = tid("C");
    let gil = tid("G");
    let ids = |s: &mut Sc| {
        s.who(&tid("A"), "A");
        s.who(&tid("B"), "B");
        s.who(&tid("C"), "C");
        s.who(&tid("G"), "G");
    };

    // ================================================================ line 46
    {
        let mut s = Sc::new();
        ids(&mut s);
        let x = s.root("line 46/X v1, condition two of three", &a, terms(signers(&[&a, &bb, &c])).set(tk::CONDITION, k4_k(2)));
        let xb = s.assent("line 46/B's assent to X v1", &bb, &x, &x);
        let xc = s.assent("line 46/C's assent to X v1", &c, &x, &x);
        pin(&mut s, "line 46/X v1", &x, &x, &[(&a, "A"), (&bb, "B"), (&c, "C")], &[x, xb, xc]);
        let v2 = s.version("line 46/X v2, giving B a power to assent", &a, &x, &x, terms(signers(&[&a, &bb, &c])).set(tk::CONDITION, k4_k(2)).set(tk::POWERS, power_assent(&[&bb])));
        let v2b = s.assent("line 46/B's assent to X v2", &bb, &x, &v2);
        let y = s.root("line 46/Y, by B, naming B and C", &bb, terms(signers(&[&bb, &c])));
        let act = s.st("line 46/B's assent to Y for C, under X v2", &bb, v::statement(&y, &y, v::kind::ASSENT, None).set(sk::FOR, who_signer(&c.id)).set(sk::UNDER, b(&v2)));
        let _ = v2b;
        out.cases.push(g4(
            "line 46: X v2, passed by a condition two of three without C's assent, gives B a power to assent; B assents for C to Y under v2: C is not bound".into(),
            "46",
            "5.6.1(b)",
            vec![Q_561B, Q_561B_NO_COND],
            vec![R_C18, R_GIVER],
            vec![],
            s,
            "bound",
            vec![c.id, act],
            vec![
                asked("K4", stub::K4, "X v1's condition, of X v2 with the assents that count (A's, the Terms act itself; B's)", "valid: two of the known parties A, B, C sign it"),
                asked("K3", stub::K3, "v2's power of sort assent, of B's assent for C to Y", "yes: its signer is B"),
            ],
            ans("not shown", "5.6.1(b)", "as shown", "C's own signature is not on X v2, the version `under` names and that gives the power: no update condition can give a power for a person who did not sign it").who(&c.id),
            vec![],
            None,
        ));
    }

    // ================================================================ line 47
    {
        let mut s = Sc::new();
        ids(&mut s);
        let v1 = s.root("line 47/v1, a role C fills", &a, terms(vec![v::party_signer(&a.id), v::party_signer(&bb.id), role(&[&c], true)]).set(tk::IN_FORCE, k2(&[&a, &bb])).set(tk::CONDITION, k4_k(2)));
        let b1 = s.assent("line 47/B's assent to v1", &bb, &v1, &v1);
        let c1 = s.assent("line 47/C's assent to v1 (the proof of her filling)", &c, &v1, &v1);
        pin(&mut s, "line 47/v1", &v1, &v1, &[(&a, "A"), (&bb, "B")], &[v1, b1]);
        let v2 = s.version("line 47/v2, by A", &a, &v1, &v1, terms(vec![v::party_signer(&a.id), v::party_signer(&bb.id), role(&[&c], true)]).set(tk::IN_FORCE, k2(&[&a, &bb])).set(tk::CONDITION, k4_k(2)));
        s.assent("line 47/B's assent to v2", &bb, &v1, &v2);
        let _ = c1;
        out.cases.push(g4(
            "line 47: C filled a role under v1; v2 passes v1's condition (two of the known parties A and B) without her: C is not bound by v2".into(),
            "47",
            "5.6.1(c), 5.10.6",
            vec![Q_561C_FILL, Q_5106, Q_555A_ROLE],
            vec![R_UNKNOWN, R_KNOWN],
            vec![],
            s,
            "bound",
            vec![c.id, v2],
            vec![
                asked("K5", stub::K5, "v1's role at position 2: who fills it", "C, by her assent to v1; earned under v1"),
                asked("K4", stub::K4, "v1's condition, of v2 with the assents that count (A's, the Terms act itself; B's)", "valid: two of the known parties A and B sign it"),
            ],
            ans("not shown", "5.6.1(c)", "as shown", "C is bound by v1, the version her proof names, as an unknown party's filling; no update binds anyone through a filling").who(&c.id),
            vec![],
            None,
        ));
    }

    // ================================================================ line 48
    {
        let mut s = Sc::new();
        ids(&mut s);
        let d = s.root("line 48/D, A gives G a power to assent", &a, terms(signers(&[&a, &gil])).set(tk::POWERS, power_assent(&[&gil])));
        let dg = s.assent("line 48/G's assent to D", &gil, &d, &d);
        pin(&mut s, "line 48/D", &d, &d, &[(&a, "A"), (&gil, "G")], &[d, dg]);
        let y = s.root("line 48/Y, by B, naming A and B", &bb, terms(vec![v::party_signer(&bb.id), v::party_signer(&a.id)]));
        let act = s.st("line 48/G's assent to Y for A, under D", &gil, v::statement(&y, &y, v::kind::ASSENT, None).set(sk::FOR, who_signer(&a.id)).set(sk::UNDER, b(&d)));
        let stubs = || vec![asked("K3", stub::K3, "D's power of sort assent, of G's assent for A to Y", "yes: its signer is G")];
        out.cases.push(g4(
            "line 48: G assents to Y for A under D, a power A gave and signed (D in force by knots): A is bound".into(),
            "48",
            "5.6.1(b)",
            vec![Q_561B_FOR, Q_561B, Q_541_DEFAULT, Q_541_KNOTS],
            vec![R_GIVER, R_C18, R_HER_ASSENT],
            vec![],
            s.clone(),
            "bound",
            vec![a.id, act],
            stubs(),
            ans("shown", "5.6.1(b)", "as shown", "the act's `for` names A; its `under` names D, which binds A (her Terms act is her assent), is in force, and was in force when the act was made (G's act follows G's pinning act in D by `prev`); A is a known party of D; D gives a power of sort assent, and its rule says yes").who(&a.id),
            vec![],
            None,
        ));
        out.cases.push(g4(
            "line 48: the same act: G, the agent who signed it, is not bound by it".into(),
            "48",
            "5.6.3",
            vec![Q_563],
            vec![R_GIVER],
            vec![],
            s,
            "bound",
            vec![gil.id, act],
            vec![],
            ans("not shown", "5.6.3", "none", "made for A under a power, the act binds the grantor and never its signer, the agent, as an act of the agent's own").who(&gil.id),
            vec![],
            None,
        ));
    }

    // ================================================================ lines 49, 50
    for two in [false, true] {
        let mut s = Sc::new();
        ids(&mut s);
        let (kk, km) = (keeper_id("K"), keeper_id("M"));
        let kl: Vec<Hash> = if two { vec![kk, km] } else { vec![kk] };
        let tag = if two { "line 50" } else { "line 49" };
        let d = s.root(&format!("{tag}/D, A gives G a power to assent"), &a, terms(signers(&[&a, &gil])).set(tk::POWERS, power_assent(&[&gil])).set(tk::KEEPER, keepers(&kl)));
        let dg = s.assent(&format!("{tag}/G's assent to D"), &gil, &d, &d);
        let y = s.root(&format!("{tag}/Y, by B, naming A and B"), &bb, terms(vec![v::party_signer(&bb.id), v::party_signer(&a.id)]));
        let act = s.st(&format!("{tag}/G's assent to Y for A, under D"), &gil, v::statement(&y, &y, v::kind::ASSENT, None).set(sk::FOR, who_signer(&a.id)).set(sk::UNDER, b(&d)));
        let d2 = s.version(&format!("{tag}/D2, without the power"), &a, &d, &d, terms(signers(&[&a, &gil])).set(tk::KEEPER, keepers(&kl)));
        let d2g = s.assent(&format!("{tag}/G's assent to D2"), &gil, &d, &d2);
        s.keeper("K", "live", vec![vec![d, dg, act, d2, d2g]]);
        if two {
            s.keeper("M", "live", vec![vec![d, dg, d2, d2g, act]]);
        }
        let stubs = vec![asked("K3", stub::K3, "D's power of sort assent, of G's assent for A to Y", "yes: its signer is G")];
        if !two {
            out.cases.push(g4(
                "line 49: D names keeper K, which places G's act for A before the position at which D2, replacing D, passes the gate and the pin: A is bound, per keeper".into(),
                "49",
                "5.6.4",
                vec![Q_564_A, Q_564_KEEPER, Q_541_KEEPERS],
                vec![R_GIVER],
                vec![5, 6, 7],
                s,
                "bound",
                vec![a.id, act],
                stubs,
                ans("shown", "5.6.4", "per keeper", "K places G's act at position 3; D2 passes D's gate (A, its Terms act; G's assent) and pin at position 5, counting only what K shows: the act was made before D2 was in force").who(&a.id).counted(&[kk]),
                vec![],
                None,
            ));
        } else {
            out.cases.push(g4(
                "line 50: the same with two keepers, K and M, that disagree on whether G's act came before D2 passed the gate and the pin (K9's socket empty): not shown, the keepers disagree".into(),
                "50",
                "5.6.4",
                vec![Q_564_DISAGREE, Q_533_DISAGREE, Q_533_EVIDENCE],
                vec![R_GIVER, R_DISAGREE, R_BOTH],
                vec![5, 6, 7, 15],
                s,
                "bound",
                vec![a.id, act],
                stubs,
                ans("not shown", "5.6.4", "per keeper", "the keepers disagree: K places G's act before the position at which D2 passes the gate and the pin, M after; under the default there is no answer for what they disagree on; both records are shown as evidence").who(&a.id),
                vec![],
                None,
            ));
        }
    }

    // ================================================================ line 51
    {
        let mut s = Sc::new();
        ids(&mut s);
        let d = s.root("line 51/D, A gives G a power to assent, no condition", &a, terms(signers(&[&a, &gil])).set(tk::POWERS, power_assent(&[&gil])));
        let dg = s.assent("line 51/G's assent to D", &gil, &d, &d);
        pin(&mut s, "line 51/D", &d, &d, &[(&a, "A"), (&gil, "G")], &[d, dg]);
        let d2 = s.version("line 51/D2, by A, without the power", &a, &d, &d, terms(signers(&[&a, &gil])));
        out.cases.push(g4(
            "line 51: A alone signs D2, removing the power she gave G, D naming no condition: not shown as a replacement, G's assent lacking, never not valid".into(),
            "51",
            "5.5.7(e)",
            vec![Q_566A, Q_557E],
            vec![R_KNOWN],
            vec![],
            s.clone(),
            "update",
            vec![d2],
            vec![],
            ans("not shown", "5.5.7(e)", "as shown", "D names no condition: the default asks every known party of D, A and G; an assent in G's name to D2 is not held, and may exist"),
            vec![ans("not shown", "5.5.1", "as shown", "not in force: it does not pass the gate")],
            None,
        ));
        s.assent("line 51/G's assent to D2", &gil, &d, &d2);
        out.cases.push(g4(
            "line 51: the same, with G's assent to D2 held, its order shown: valid, by default, and in force".into(),
            "51",
            "5.5.7(e), 5.5.1",
            vec![Q_566A, Q_557E, Q_551B, Q_551_TWO],
            vec![R_KNOWN, R_C3],
            vec![],
            s,
            "update",
            vec![d2],
            vec![],
            ans("valid", "5.5.7(e)", "as shown", "by default: an assent in the name of each known party of D is held (A's, D2 itself; G's)"),
            vec![ans("in force", "5.5.1", "as shown", "D2 is shown after the acts that put D in force (its `previous` is A's act naming G's assent to D), and no other update of D is held")],
            None,
        ));
    }

    // ================================================================ line 52
    {
        let mut s = Sc::new();
        ids(&mut s);
        let kk = keeper_id("K");
        let root = s.root("line 52/root, keeper K", &a, terms(signers(&[&a, &bb])).set(tk::KEEPER, keepers(&[kk])));
        let b1 = s.assent("line 52/B's assent to root", &bb, &root, &root);
        let v2a = s.version("line 52/v2a, by A", &a, &root, &root, terms(signers(&[&a, &bb])).set(tk::KEEPER, keepers(&[kk])));
        let v2b = s.version("line 52/v2b, by A", &a, &root, &root, terms(signers(&[&a, &bb])).set(tk::KEEPER, keepers(&[kk])));
        let t1 = s.st_raw("line 52/B's assent to v2a", &bb, v::statement(&root, &v2a, v::kind::ASSENT, Some(&b1)));
        let t2 = s.st_raw("line 52/B's assent to v2b, naming the same previous", &bb, v::statement(&root, &v2b, v::kind::ASSENT, Some(&b1)));
        let _ = t2;
        s.keeper("K", "live", vec![vec![root, b1, v2a, t1]]);
        out.cases.push(g4(
            "line 52: B's two assents, to two updates of the root, both name his assent to the root in `previous`; keeper K shows only the first: B's line is a fork, as shown, whatever K shows".into(),
            "52",
            "5.7.2",
            vec![Q_572, Q_572_KEEPER, Q_571_AS_SHOWN],
            vec![R_FORK],
            vec![5, 6, 7],
            s,
            "line",
            vec![bb.id, root],
            vec![],
            ans("fork", "5.7.2", "as shown", "two acts of B within the agreement name the same `previous`; both are tips, the one K does not show included"),
            vec![],
            None,
        ));
    }

    // ================================================================ lines 53, 54, 55, 56
    {
        let mut s = Sc::new();
        ids(&mut s);
        let kk = keeper_id("K");
        let root = s.root("line 53/root, keeper K", &a, terms(signers(&[&a, &bb])).set(tk::KEEPER, keepers(&[kk])));
        let b1 = s.assent("line 53/B's assent", &bb, &root, &root);
        s.keeper("K", "live", vec![vec![root, b1]]);
        let r = g("line 53/relay R, the reader's (stand-in)");
        s.names.insert(r, "relay R, an order the reader accepts (test)".into());
        s.anchoring = Some(AnchorT { id: r, label: "relay R (test): a relay the Terms do not name".into(), order: vec![b1, root] });
        out.cases.push(g4(
            "line 53: Terms naming keeper K, which shows the Terms act and B's assent; the reader accepts relay R, whose order puts B's assent first: in force, per keeper, K named; R's order is only the reader's".into(),
            "53",
            "5.8.2",
            vec![Q_582, Q_541_DEFAULT, Q_541_KEEPERS, Q_5133_OTHER],
            vec![R_C31],
            vec![5, 6, 7],
            s,
            "in_force",
            vec![root],
            vec![],
            ans("in force", "5.4.1", "per keeper", "an assent in the name of each party named as a signer (A's, the Terms act; B's), both placed by K; R, a relay the Terms do not name, gives no order for the agreement: its order is evidence the reader may show, labelled as the reader's").counted(&[kk]),
            vec![],
            None,
        ));
    }
    for (line, m_order_swapped) in [("54", false), ("55", true)] {
        let mut s = Sc::new();
        ids(&mut s);
        let (kk, km) = (keeper_id("K"), keeper_id("M"));
        let root = s.root(&format!("line {line}/root, keepers K and M"), &a, terms(signers(&[&a, &bb])).set(tk::KEEPER, keepers(&[kk, km])));
        let b1 = s.assent(&format!("line {line}/B's assent"), &bb, &root, &root);
        s.keeper("K", "live", vec![vec![root, b1]]);
        s.keeper("M", "live", vec![if m_order_swapped { vec![b1, root] } else { vec![root, b1] }]);
        if !m_order_swapped {
            out.cases.push(g4(
                "line 54: Terms naming keepers K and M (K9's socket empty), each showing the Terms act and B's assent in order: in force, per keeper, K and M named".into(),
                "54",
                "5.8.3",
                vec![Q_533_DEFAULT, Q_541_KEEPERS, Q_584_NAMED],
                vec![R_BOTH],
                vec![5, 6, 7, 15],
                s,
                "in_force",
                vec![root],
                vec![],
                ans("in force", "5.4.1", "per keeper", "every keeper named shows both assents (A's, the Terms act; B's)").counted(&[kk, km]),
                vec![],
                None,
            ));
        } else {
            out.cases.push(g4(
                "line 55: the same, M placing B's assent before the Terms act it names: not shown, the keepers disagree, and M's record contradicts the acts; both records kept as evidence".into(),
                "55",
                "5.8.3, 5.8.4",
                vec![Q_533_DISAGREE, Q_533_EVIDENCE, Q_584_CONTRA],
                vec![R_DISAGREE, R_C28, R_BOTH],
                vec![5, 6, 7, 15],
                s,
                "in_force",
                vec![root],
                vec![],
                ans("not shown", "5.8.3", "per keeper", "the keepers disagree on the order of the Terms act and B's assent, and under the default there is no answer for it; M's record also contradicts a knot (B's assent names the Terms act in `terms`), so the answers resting on it are not shown for that reason too (5.8.4); both records are kept as evidence"),
                vec![],
                None,
            ));
        }
    }
    {
        let mut s = Sc::new();
        ids(&mut s);
        let kk = keeper_id("K");
        let root = s.root("line 56/root, keeper K", &a, terms(signers(&[&a, &bb])).set(tk::KEEPER, keepers(&[kk])));
        let b1 = s.assent_rel("line 56/B's assent, naming A's (the Terms act) in relies_on", &bb, &root, &root, &[root]);
        s.keeper("K", "live", vec![vec![b1, root]]);
        out.cases.push(g4(
            "line 56: Terms naming keeper K; B's assent names A's assent (the Terms act itself) in `relies_on`; K places B's assent first: not shown, the keeper contradicts the acts".into(),
            "56",
            "5.8.4",
            vec![Q_584_CONTRA],
            vec![R_C28, R_HER_ASSENT],
            vec![5, 6, 7],
            s,
            "in_force",
            vec![root],
            vec![],
            ans("not shown", "5.8.4", "per keeper", "K's record places B's assent before the Terms act it names: the keeper contradicts the acts; the record is kept as evidence").not_showing(&[kk]),
            vec![],
            None,
        ));
    }

    // ================================================================ line 57
    {
        let mut s = Sc::new();
        ids(&mut s);
        let (kk, km) = (keeper_id("K"), keeper_id("M"));
        let v1 = s.root("line 57/v1, keeper K, a role C fills", &a, terms(vec![v::party_signer(&a.id), role(&[&c], true)]).set(tk::IN_FORCE, k2(&[&a])).set(tk::KEEPER, keepers(&[kk])));
        let c1 = s.assent("line 57/C's assent to v1 (her proof)", &c, &v1, &v1);
        let v2 = s.version("line 57/v2, by A, keeper M", &a, &v1, &v1, terms(signers(&[&a])).set(tk::KEEPER, keepers(&[km])));
        s.keeper("K", "live", vec![vec![v1, c1, v2]]);
        s.keeper("M", "live", vec![vec![v2]]);
        let mut s2 = s.clone();
        pos(&mut s2, 1, "the spot's position among v1's parties, which the question gives (5.10.2)");
        out.cases.push(g4(
            "line 57: v1 names keeper K and a role C fills, K showing her proof; v2, in force per K, names keeper M, which does not: the filling is shown, C, per keeper K".into(),
            "57",
            "5.8.5, 5.10.2",
            vec![Q_585_FILL, Q_5102_FILL, Q_5102_EARNED],
            vec![R_C23, R_UNKNOWN],
            vec![5, 6, 7],
            s2,
            "fillings",
            vec![v1],
            vec![asked("K5", stub::K5, "v1's role at position 1, as v1 states it, given v1 and its acts", "one filling: C, its proof her assent to v1, earned under v1")],
            ans("shown", "5.10.2", "per keeper", "C's filling, its proof her assent to v1, placed by K, the keeper v1 names; M, named by v2, is not asked").who(&c.id).counted(&[kk]),
            vec![],
            None,
        ));
    }

    // ================================================================ lines 58 to 60
    out.waiting.push(Waiting {
        what: "line 58 to 60 (5.8.6): Terms whose condition is a stub declaring it needs a clock, with no clock, with a keeper and no clock, and with a clock".into(),
        why: "question: draft 26 puts the declaration in the cMIP's own published text, \"in the form Development fixes (§7)\" (5.8.6), and the codemeister's taking (item 11) gives its reading to the grammar verifier; Development has fixed no form, and the format has no table for a cMIP's published act. A stub's declaration written now would settle that form in bytes. Lean: write them when Development fixes the form, or once a stand-in table \"declared needs\" is added to the format".into(),
    });

    // ================================================================ line 61
    {
        let mut s = Sc::new();
        ids(&mut s);
        let v1 = s.root("line 61/v1, a role at position 2", &a, terms(vec![v::party_signer(&a.id), v::party_signer(&bb.id), role(&[&c], true)]).set(tk::IN_FORCE, k2(&[&a, &bb])));
        let b1 = s.assent("line 61/B's assent to v1", &bb, &v1, &v1);
        s.assent("line 61/C's assent to v1 (her proof)", &c, &v1, &v1);
        pin(&mut s, "line 61/v1", &v1, &v1, &[(&a, "A"), (&bb, "B")], &[v1, b1]);
        let v2 = s.version("line 61/v2, by A, no role", &a, &v1, &v1, terms(signers(&[&a, &bb])));
        s.assent("line 61/B's assent to v2", &bb, &v1, &v2);
        pos(&mut s, 2, "the spot's position among v1's parties, which the question gives (5.10.2)");
        out.cases.push(g4(
            "line 61: v1 names a role at position 2, which C fills; v2, valid and in force, names no role: the filling is shown, C, earned under v1".into(),
            "61",
            "5.10.2",
            vec![Q_5102_EARNED, Q_5102_FILL],
            vec![R_C23, R_C2, R_UNKNOWN],
            vec![],
            s,
            "fillings",
            vec![v1],
            vec![asked("K5", stub::K5, "v1's role at position 2, as v1 states it, given v1 and its acts", "one filling: C, its proof her assent to v1, earned under v1")],
            ans("shown", "5.10.2", "as shown", "C's filling, its proof her assent to v1, read from v1 and its role at position 2 as v1 states it, whatever v2 says; v1 names no keeper").who(&c.id),
            vec![],
            None,
        ));
        out.waiting.push(Waiting {
            what: "line 61, its second half: whether the spot still takes new identities under v2, which names no role".into(),
            why: "question: 5.10.5 asks the spot's K5 cMIP \"applied to the version in force (the role as that version states it)\"; v2 states no role, so there is no cMIP to ask, and no sentence says what is answered then (the sheet's \"not shown\"). Lean: not shown, no role being named by the version in force".into(),
        });
    }

    // ================================================================ lines 62, 63, 65
    let offer = |s: &mut Sc, tag: &str| -> (Hash, Hash) {
        let v1 = s.root(&format!("{tag}/v1, a role C fills, condition two of the known parties"), &a, terms(vec![v::party_signer(&a.id), v::party_signer(&bb.id), role(&[&c], true)]).set(tk::IN_FORCE, k2(&[&a, &bb])).set(tk::CONDITION, k4_k(2)));
        let b1 = s.assent(&format!("{tag}/B's assent to v1"), &bb, &v1, &v1);
        s.assent(&format!("{tag}/C's assent to v1 (her proof)"), &c, &v1, &v1);
        pin(s, &format!("{tag}/v1"), &v1, &v1, &[(&a, "A"), (&bb, "B")], &[v1, b1]);
        (v1, b1)
    };
    {
        let mut s = Sc::new();
        ids(&mut s);
        let (v1, _) = offer(&mut s, "line 62");
        let v2 = s.version("line 62/v2, cutting C's share", &a, &v1, &v1, terms(vec![v::party_signer(&a.id), v::party_signer(&bb.id), role(&[&c], true)]).set(tk::IN_FORCE, k2(&[&a, &bb])).set(tk::CONDITION, k4_k(2)));
        s.assent("line 62/B's assent to v2", &bb, &v1, &v2);
        out.cases.push(g4(
            "line 62: v2 cuts C's share, under v1's condition that lets A and B change it: her rights are v1's, no later version changes them, K4 not asked about her filling".into(),
            "62",
            "5.10.7",
            vec![Q_5107_RIGHTS, Q_5107_ONLY, Q_5107_NAME, Q_5106],
            vec![R_UNKNOWN, R_F9],
            vec![],
            s,
            "rights",
            vec![v1, c.id],
            vec![asked("K5", stub::K5, "v1's role at position 2, given v1 and its acts", "one filling: C, its proof her assent to v1, earned under v1")],
            ans("shown", "5.10.7", "as shown", "C's filling has the rights v1 offers; no assent of hers, and none made for her, rests on any later version: no later version changes them").who(&c.id),
            vec![],
            None,
        ));
    }
    for (line, names_role) in [("63", true), ("65", false)] {
        let mut s = Sc::new();
        ids(&mut s);
        let (v1, _) = offer(&mut s, &format!("line {line}"));
        let t = if names_role {
            terms(vec![v::party_signer(&a.id), v::party_signer(&bb.id), role(&[&c], true)]).set(tk::IN_FORCE, k2(&[&a, &bb])).set(tk::CONDITION, k4_k(2))
        } else {
            terms(signers(&[&a, &bb])).set(tk::CONDITION, k4_k(2))
        };
        let v2 = s.version(&format!("line {line}/v2"), &a, &v1, &v1, t);
        s.assent(&format!("line {line}/B's assent to v2"), &bb, &v1, &v2);
        let cv2 = s.assent(&format!("line {line}/C's assent to v2, in her own name"), &c, &v1, &v2);
        let _ = cv2;
        if names_role {
            out.cases.push(g4(
                "line 63: v2 assented by C in her own name: her rights are v1's, and v2 changes them as far as its words say, her assent named".into(),
                "63",
                "5.10.7",
                vec![Q_5107_ONLY, Q_5107_NAME],
                vec![R_F9],
                vec![],
                s,
                "rights",
                vec![v1, c.id],
                vec![asked("K5", stub::K5, "v1's role at position 2, given v1 and its acts", "one filling: C, its proof her assent to v1, earned under v1")],
                ans("shown", "5.10.7", "as shown", "earned under v1; v2 changes what it earned, as far as v2's words say, resting on C's own assent to v2").who(&c.id),
                vec![],
                None,
            ));
        } else {
            out.cases.push(g4(
                "line 65: v2 names neither C nor her role; she assents to it in her own name: v2 changes what her filling earned, her assent named".into(),
                "65",
                "5.10.7",
                vec![Q_5107_ONLY, Q_5107_NAME],
                vec![R_F9],
                vec![],
                s,
                "rights",
                vec![v1, c.id],
                vec![asked("K5", stub::K5, "v1's role at position 2, given v1 and its acts", "one filling: C, its proof her assent to v1, earned under v1")],
                ans("shown", "5.10.7", "as shown", "earned under v1; v2 changes what it earned, as far as v2's words say, resting on C's own assent to v2, whether or not it is counted for v2 (v2 names her neither as a signer nor by role)").who(&c.id),
                vec![],
                Some("the sheet gave two readings, changed (its question 6 (A)) or unchanged (B); the text settles (A): \"whether or not it is counted for the later version\" (5.10.7), the lead's row F9 reading so"),
            ));
        }
    }
    out.waiting.push(Waiting {
        what: "line 64 (5.10.7): v2 assented for C by G under a power of sort assent".into(),
        why: "question: under draft 26 a power counts for a filling's holder only where \"they gave that power in an act of their own: a Statement in their own name, of a kind a K7 cMIP gives ..., that names the one the power is given to and the power's sort, and that the power's rule reads through that cMIP (K3)\" (5.6.1(b)), not a power in Terms she signed (the sheet's acts). The stubs have no K7 kind for such a grant nor a K3 rule that reads one, and which Terms `under` names while v1 is being replaced by v2 (5.6.4) is not settled by the acts the line gives. Lean: C's grant Statement (a K7 kind) within v1's agreement, G's assent for C made under v1 before v2 passes its gate, ordered by knots; answer shown, the power and G named".into(),
    });

    // ================================================================ lines 66 to 68
    for (line, applies, held) in [("66", Some(true), true), ("67", Some(false), true), ("68", None, false)] {
        let mut s = Sc::new();
        ids(&mut s);
        let kk = keeper_id("K");
        let clock = g("a clock (stand-in)");
        s.names.insert(clock, "clock T (test)".into());
        let tag = format!("line {line}");
        let t = terms(vec![v::party_signer(&a.id), role(&[&c], true)]).set(tk::IN_FORCE, k2(&[&a])).set(tk::KEEPER, keepers(&[kk])).set(tk::CLOCK, b(&clock));
        let v1 = if held {
            s.root_body(&format!("{tag}/v1, a clock, a role C fills"), &a, t, Value::Map(vec![(u(1), Value::Bool(applies.unwrap()))]))
        } else {
            let w = s.words(&a, &format!("{tag}/v1, a clock, a role C fills, its body's cMIP not held"));
            let t = t.set(tk::BODY, v::body(&w, socket(&g("a body cMIP this verifier does not hold"), Value::Null))).set(tk::PREVIOUS, previous(None));
            let id = s.terms_raw(&format!("{tag}/v1, a clock, a role C fills, its body's cMIP not held"), &a, None, t);
            id
        };
        let c1 = s.assent(&format!("{tag}/C's assent to v1 (her proof, the purchase)"), &c, &v1, &v1);
        s.keeper("K", "live", vec![vec![v1, c1]]);
        s.clocks.push(json!({ "clock": v::hx(&clock), "label": "clock T (test)", "times": [{ "act": v::hx(&c1), "label": s.label(&c1), "time": 1000 }] }));
        let k5 = asked("K5", stub::K5, "v1's role at position 1, given v1 and its acts", "one filling: C, its proof her assent to v1, earned under v1");
        match applies {
            Some(yes) => out.cases.push(g4(
                format!("line {line}: v1 names clock T; its K1 stub answers that what C's filling gave {}: the task's output, K1 named, per clock", if yes { "still applies" } else { "no longer applies" }),
                if yes { "66" } else { "67" },
                "5.10.8",
                if yes { vec![Q_5108_CLOCK, Q_5108_K1, Q_TASK_OUT] } else { vec![Q_5108_CLOCK, Q_5108_K1, Q_TASK_OUT, Q_5108_NOTRIG] },
                vec![R_CLOCK],
                vec![5, 6, 7, 8],
                s,
                "still_applies",
                vec![v1, c.id],
                vec![k5, asked("K1", stub::K1, "v1's words, given v1 and its acts and the clock v1 names: whether what C's filling gave still applies", if yes { "yes, by its parameters" } else { "no, by its parameters" })],
                ans(if yes { "yes (the task's output)" } else { "no (the task's output)" }, "5.10.8", "per clock", if yes { "K1's output, its cMIP named, counted on clock T from the anchoring of the purchase" } else { "K1's output, its cMIP named, counted on clock T from the anchoring of the purchase; never \"triggered\"" }).who(&c.id),
                vec![],
                None,
            )),
            None => {
                let _ = k5;
                out.cases.push(g4(
                    "line 68: the same, v1's body naming a cMIP the verifier does not hold: unchecked".into(),
                    "68",
                    "5.10.8",
                    vec![Q_5108_K1, Q_TASK_OUT],
                    vec![R_CLOCK, R_MISSING],
                    vec![5, 6, 7, 8],
                    s,
                    "still_applies",
                    vec![v1, c.id],
                    vec![asked("K5", stub::K5, "v1's role at position 1, given v1 and its acts", "one filling: C, its proof her assent to v1, earned under v1")],
                    ans("unchecked", "5.10.8", "none", "the cMIP that reads v1's words (K1) is not held").who(&c.id),
                    vec![],
                    None,
                ));
            }
        }
    }

    // ================================================================ line 69
    {
        let mut s = Sc::new();
        ids(&mut s);
        let work = g("a work (stand-in)");
        let e = g("envelope E: its bake, by A (stand-in)");
        let f = g("envelope F: its bake, by B (stand-in)");
        s.names.insert(e, "envelope E's bake (Envelopes layer, stand-in)".into());
        s.names.insert(f, "envelope F's bake (Envelopes layer, stand-in)".into());
        s.chain = Some(json!({ "envelopes": [
            { "bake": v::hx(&e), "label": "envelope E (test)", "baker": v::hx(&a.id), "work": v::hx(&work), "transfers": [] },
            { "bake": v::hx(&f), "label": "envelope F (test)", "baker": v::hx(&bb.id), "work": v::hx(&work), "transfers": [] },
        ], "about": "the Envelopes layer's answers, as a table: each envelope's bake, its baker, its work; no transfer, so each baker holds the baker's rights at its bake (test data)" }));
        let y = s.root("line 69/B's Terms, naming envelope F", &bb, terms(signers(&[&bb])).set(tk::ENVELOPE, b(&f)).set(tk::ENVELOPE_AT, b(&f)));
        let ct = s.st("line 69/A's contest against B's Terms, relying on E's bake", &a, v::statement(&y, &y, v::kind::CONTEST, None).set(sk::RELIES_ON, arr(vec![b(&e)])));
        out.cases.push(g4(
            "line 69: envelope E baked by A, F of the same work by B; B's Terms name F; A's contest against them names E's bake in `relies_on`: shown, a baker's contest, A read as the holder at the act cited, reaching B".into(),
            "69",
            "5.11.9",
            vec![Q_5119_MAY, Q_5119_AT, Q_5119_REACH, Q_5118_VERSION],
            vec![TEXT_ALONE],
            vec![],
            s,
            "contest",
            vec![ct],
            vec![],
            ans("shown", "5.11.9", "as shown", "a contest against Terms that name another envelope of the same work, by A, who holds the baker's rights in E at the act its `relies_on` cites; it reaches B, the signer of those Terms, and is A's word").who(&bb.id),
            vec![],
            None,
        ));
    }

    // ================================================================ line 70
    {
        let mut s = Sc::new();
        ids(&mut s);
        let kk = keeper_id("K");
        let root = s.root("line 70/root, keeper K", &a, terms(signers(&[&a, &bb])).set(tk::KEEPER, keepers(&[kk])));
        let b1 = s.assent("line 70/B's assent", &bb, &root, &root);
        let k7 = stub_socket(stub::K7, Value::Null);
        let t1 = s.st_raw("line 70/B's next act, a note", &bb, P::new().set(sk::AGREEMENT, b(&root)).set(sk::TERMS, b(&root)).set(sk::KIND, k7.clone()).set(sk::PREVIOUS, previous(Some(&b1))));
        let t2 = s.st_raw("line 70/B's other next act, a note naming the same previous", &bb, P::new().set(sk::AGREEMENT, b(&root)).set(sk::TERMS, b(&root)).set(sk::KIND, k7).set(sk::PREVIOUS, previous(Some(&b1))));
        s.keeper("K", "live", vec![vec![root, b1, t1, t2]]);
        out.cases.push(g4(
            "line 70: Terms in force per keeper K; B's next two acts both name his assent in `previous`: the Terms stay in force".into(),
            "70",
            "5.12.3",
            vec![Q_5123_STAY, Q_541_KEEPERS],
            vec![R_FORK],
            vec![5, 6, 7],
            s.clone(),
            "in_force",
            vec![root],
            vec![],
            ans("in force", "5.4.1", "per keeper", "the completing assents (A's, the Terms act; B's) are placed by K at positions 1 and 2, before the two acts that fork B's line; Terms in force before a fork was made stay in force").counted(&[kk]),
            vec![],
            Some("the sheet's line names no keeper; one is named here so that the Terms are in force before the fork without a pinning act of B's, which would be a tip (5.12.3, \"neither tip counts as the next act of its line\")"),
        ));
        out.cases.push(g4(
            "line 70: the same: B's line is a fork".into(),
            "70",
            "5.7.2",
            vec![Q_572, Q_571_AS_SHOWN],
            vec![R_FORK],
            vec![5, 6, 7],
            s,
            "line",
            vec![bb.id, root],
            vec![],
            ans("fork", "5.7.2", "as shown", "two acts of B within the agreement name his assent in `previous`"),
            vec![],
            None,
        ));
    }

    // ================================================================ lines 71, 72
    {
        let mut s = Sc::new();
        ids(&mut s);
        let root = s.root("line 71/root, naming A and C", &a, terms(signers(&[&a, &c])));
        let a1 = s.st_raw("line 71/A's next act, a note", &a, P::new().set(sk::AGREEMENT, b(&root)).set(sk::TERMS, b(&root)).set(sk::KIND, stub_socket(stub::K7, Value::Null)).set(sk::PREVIOUS, previous(Some(&root))));
        let a2 = s.st_raw("line 71/A's other next act, naming the same previous", &a, P::new().set(sk::AGREEMENT, b(&root)).set(sk::TERMS, b(&root)).set(sk::KIND, stub_socket(stub::K7, Value::Null)).set(sk::PREVIOUS, previous(Some(&root))));
        let _ = a2;
        let c1 = s.assent("line 71/C's assent", &c, &root, &root);
        let r = s.st_raw("line 71/C's resolve, naming one of A's tips", &c, v::statement(&root, &root, v::kind::RESOLVE, Some(&c1)).set(sk::RESOLVES, arr(vec![b(&a1)])).set(sk::CONTINUES, b(&a1)));
        out.cases.push(g4(
            "line 71: A's line forked; C's resolve names one of A's tips in `resolves`: not shown as a resolving update, nothing to resolve in C's own line".into(),
            "71",
            "5.12.4",
            vec![Q_5124_NOTHING],
            vec![TEXT_ALONE],
            vec![],
            s,
            "resolution",
            vec![r],
            vec![],
            ans("not shown", "5.12.4", "as shown", "what it names in `resolves` is no tip of a fork in its signer's line: nothing to resolve"),
            vec![],
            Some("the sheet asks of C's assent, which counts and is not built on the tip; an assent carries no `resolves` (§4.3), so C's act is a resolve, asked here as a resolving update (5.12.4); \"built on a tip\" lists `terms`, `under`, `answers` and `relies_on`, not `resolves`"),
        ));
    }
    {
        let mut s = Sc::new();
        ids(&mut s);
        let root = s.root("line 72/root, naming A and B", &a, terms(signers(&[&a, &bb])));
        let b1 = s.assent("line 72/B's assent", &bb, &root, &root);
        let v2a = s.version("line 72/v2a, by A", &a, &root, &root, terms(signers(&[&a, &bb])));
        let v2b = s.version("line 72/v2b, by B", &bb, &root, &root, terms(signers(&[&a, &bb])));
        let _ = b1;
        let r = s.st("line 72/A's resolve, naming v2a and v2b", &a, v::statement(&root, &root, v::kind::RESOLVE, None).set(sk::RESOLVES, v::sorted_set(vec![b(&v2a), b(&v2b)])).set(sk::CONTINUES, b(&v2a)));
        out.cases.push(g4(
            "line 72: A's resolve names two Terms acts in `resolves`, her own line not forked: not shown, nothing to resolve".into(),
            "72",
            "5.12.4",
            vec![Q_5124_NOTHING],
            vec![TEXT_ALONE],
            vec![],
            s,
            "resolution",
            vec![r],
            vec![],
            ans("not shown", "5.12.4", "as shown", "for a Statement of kind resolve, the fork must be in its signer's line; A's line holds no fork: nothing to resolve"),
            vec![],
            None,
        ));
    }

    // ================================================================ line 73
    {
        let mut s = Sc::new();
        ids(&mut s);
        let root = s.root("line 73/root, naming A and B", &a, terms(signers(&[&a, &bb])));
        let b1 = s.assent("line 73/B's assent to root", &bb, &root, &root);
        pin(&mut s, "line 73/root", &root, &root, &[(&a, "A"), (&bb, "B")], &[root, b1]);
        let v2 = s.version("line 73/v2, by A", &a, &root, &root, terms(signers(&[&a, &bb])));
        s.assent("line 73/B's assent to v2", &bb, &root, &v2);
        let prev = s.acts.iter().rev().find(|m| m.label == "line 73/v2, by A").map(|m| m.id).unwrap();
        let x = s.resolving("line 73/x, shaped as a resolving update, naming v2 alone", &a, &root, &root, &[v2], &v2, Some(&prev));
        out.cases.push(g4(
            "line 73: a Terms act shaped as a resolving update (replacing the root, naming v2 alone in `resolves`), with no fork: not shown as a resolving update, nothing to resolve".into(),
            "73",
            "5.12.4",
            vec![Q_5124_ONE, Q_5124_NOTHING],
            vec![TEXT_ALONE],
            vec![],
            s,
            "resolution",
            vec![x],
            vec![],
            ans("not shown", "5.12.4", "as shown", "what it names in `resolves` is one update, v2, and no fork of the agreement's chain: nothing to resolve; its answer as an update of the root is §5.5's, beside this one, and not asked here"),
            vec![],
            None,
        ));
    }

    // ================================================================ line 74
    {
        let mut s = Sc::new();
        ids(&mut s);
        let root = s.root("line 74/root, naming A", &a, terms(signers(&[&a])));
        let a1 = s.note("line 74/A's next act", &a, &root, &root, &[]);
        let m = s.missing("line 74/an act of A's named in the resolve");
        let r = s.st_raw("line 74/A's resolve, naming her act and an act not held", &a, v::statement(&root, &root, v::kind::RESOLVE, Some(&root)).set(sk::RESOLVES, v::sorted_set(vec![b(&a1), b(&m)])).set(sk::CONTINUES, b(&a1)));
        out.cases.push(g4(
            "line 74: A's resolve names two acts in `resolves`, one of them not held: unchecked".into(),
            "74",
            "5.12.4",
            vec![Q_5133_MISS, Q_5124_NOTHING],
            vec![R_MISSING],
            vec![],
            s,
            "resolution",
            vec![r],
            vec![],
            ans("unchecked", "5.12.4", "none", "whether what it names in `resolves` are the tips of a fork in A's line needs the act not held: it might be an act of A's naming the same `previous`"),
            vec![],
            None,
        ));
    }

    // ================================================================ lines 75, 79: a fork of Terms
    let fork = |s: &mut Sc, tag: &str, filled: bool| -> (Hash, Hash, Hash, Vec<Hash>) {
        let mut parties = signers(&[&a, &bb]);
        let mut t = terms(parties.clone());
        if filled {
            parties.push(role(&[&c], true));
            t = terms(parties.clone()).set(tk::IN_FORCE, k2(&[&a, &bb]));
        }
        let v1 = s.root(&format!("{tag}/v1, by A"), &a, t.clone());
        let b1 = s.assent(&format!("{tag}/B's assent to v1"), &bb, &v1, &v1);
        if filled {
            s.assent(&format!("{tag}/C's assent to v1 (her proof)"), &c, &v1, &v1);
        }
        pin(s, &format!("{tag}/v1"), &v1, &v1, &[(&a, "A"), (&bb, "B")], &[v1, b1]);
        let v2a = s.version(&format!("{tag}/v2a, by A"), &a, &v1, &v1, t.clone());
        let v2b = s.version(&format!("{tag}/v2b, by B"), &bb, &v1, &v1, t);
        let x1 = s.assent(&format!("{tag}/B's assent to v2a"), &bb, &v1, &v2a);
        let x2 = s.assent(&format!("{tag}/A's assent to v2b"), &a, &v1, &v2b);
        (v1, v2a, v2b, vec![v2a, x1, v2b, x2])
    };
    {
        let mut s = Sc::new();
        ids(&mut s);
        let (v1, v2a, v2b, _) = fork(&mut s, "line 75", true);
        let last_a = s.acts.iter().rev().find(|m| m.label == "line 75/A's assent to v2b").map(|m| m.id).unwrap();
        let r = s.resolving("line 75/A's resolving update, continuing v2a", &a, &v1, &v1, &[v2a, v2b], &v2a, Some(&last_a));
        s.assent("line 75/B's assent to the resolving update", &bb, &v1, &r);
        let decides = vec![Q_5124_TERMS, Q_557G, Q_555A_ROLE, Q_5124_NOT_TIP, Q_551B];
        out.cases.push(g4(
            "line 75: v1 names a role C fills; two versions 2 fork; A and B sign the resolving update: valid, by default (C not asked), and in force".into(),
            "75",
            "5.12.4",
            decides,
            vec![R_C7, R_KNOWN, R_C3],
            vec![],
            s.clone(),
            "resolution",
            vec![r],
            vec![asked("K5", stub::K5, "v1's role at position 2, given v1 and its acts", "one filling: C, its proof her assent to v1, earned under v1")],
            ans("valid", "5.5.7(g)", "as shown", "by default: v1, the shared Terms, names no condition; its known parties A (the resolving update itself) and B sign it; C, who fills a role, is not among them"),
            vec![ans("in force", "5.12.4", "as shown", "shown after the acts that put v1 in force; the tips it names are not its rivals: it resolves them")],
            None,
        ));
        out.cases.push(g4(
            "line 75: the same: the agreement's last version is v2a, the continued tip".into(),
            "75",
            "5.12.4",
            vec![Q_5124_CONT, Q_5124_AFTER],
            vec![R_C7],
            vec![],
            s,
            "last_version",
            vec![v1],
            vec![],
            ans("in force", "5.12.4", "as shown", "the resolving update continues v2a, which counts as the next version; v2b is set aside").who(&v2a),
            vec![],
            None,
        ));
    }
    // ================================================================ lines 76, 77, 78
    {
        let mut s = Sc::new();
        ids(&mut s);
        let root = s.root("line 76/root, naming A and B", &a, terms(signers(&[&a, &bb])));
        let b1 = s.assent("line 76/B's assent to root", &bb, &root, &root);
        pin(&mut s, "line 76/root", &root, &root, &[(&a, "A"), (&bb, "B")], &[root, b1]);
        let v2 = s.version("line 76/v2, by A", &a, &root, &root, terms(signers(&[&a, &bb])));
        let words = s.acts.iter().find(|m| m.label == "line 76/v2, by A/its words").map(|m| m.id).unwrap();
        let bv2 = s.assent("line 76/B's assent to v2", &bb, &root, &v2);
        out.cases.push(g4(
            "line 76: B's assent names v2, whose `body` names Text act T: the assent is shown after T".into(),
            "76",
            "5.13.1",
            vec![Q_5131, Q_5134],
            vec![R_KNOTS],
            vec![],
            s,
            "order",
            vec![bv2, words],
            vec![],
            ans("shown", "5.13.4", "none", "B's assent names v2 in `terms`, and v2 names T in `body`"),
            vec![],
            None,
        ));
    }
    {
        let mut s = Sc::new();
        ids(&mut s);
        let x = s.root("line 77/X, by B, naming A and B", &bb, terms(signers(&[&bb, &a])));
        let a1 = s.assent("line 77/A's assent to X", &a, &x, &x);
        let y = s.root("line 77/Y, by A, another agreement", &a, terms(signers(&[&a])));
        out.cases.push(g4(
            "line 77: A's assent to X, and her later act in another agreement, Y's first Terms act, which names it only through her sequence's `prev`: shown after it".into(),
            "77",
            "5.13.1",
            vec![Q_5131, Q_5131_LAYERS, Q_5134],
            vec![R_F6],
            vec![],
            s,
            "order",
            vec![y, a1],
            vec![],
            ans("shown", "5.13.4", "none", "Y's first Terms act names, by `prev`, Y's words, A's Text act, which names A's assent to X by `prev`"),
            vec![],
            None,
        ));
    }
    {
        let mut s = Sc::new();
        ids(&mut s);
        let kk = keeper_id("K");
        let root = s.root("line 78/root, keeper K", &a, terms(signers(&[&a, &bb])).set(tk::KEEPER, keepers(&[kk])));
        let b1 = s.assent("line 78/B's assent", &bb, &root, &root);
        s.keeper("K", "live", vec![vec![root, b1]]);
        let x = g("line 78/the reader's anchoring X (stand-in)");
        s.names.insert(x, "anchoring X, the reader's (test)".into());
        s.anchoring = Some(AnchorT { id: x, label: "anchoring X (test): an anchoring of the reader's own choosing, showing neither act".into(), order: vec![] });
        out.cases.push(g4(
            "line 78: Terms naming keeper K, which shows the Terms act and B's assent; the reader's anchoring X shows neither: in force, per keeper; X's answer beside it, as the reader's".into(),
            "78",
            "5.13.5",
            vec![Q_5135, Q_541_KEEPERS],
            vec![R_C31],
            vec![5, 6, 7],
            s,
            "in_force",
            vec![root],
            vec![],
            ans("in force", "5.4.1", "per keeper", "both completing assents placed by K, the keeper the Terms name").counted(&[kk]),
            vec![ans("not shown", "5.13.5", "per anchoring", "the reader's own answer, named as the reader's, beside the Terms' answer: X shows neither act")],
            None,
        ));
    }
    // ---------------------------------------------------------------- line 79
    {
        let mut s = Sc::new();
        ids(&mut s);
        let (v1, v2a, v2b, order) = fork(&mut s, "line 79", false);
        let x = g("line 79/the reader's anchoring X (stand-in)");
        s.names.insert(x, "anchoring X, the reader's (test)".into());
        s.anchoring = Some(AnchorT { id: x, label: "anchoring X (test): an anchoring of the reader's own choosing".into(), order });
        out.cases.push(g4(
            "line 79: two versions 2 replacing v1, nothing ordering them; the reader's anchoring X places v2a's acts first: fork, as shown; X's order only as the reader's, beside it".into(),
            "79",
            "5.5.4",
            vec![Q_554_FORK, Q_554E, Q_554B_READER, Q_5135],
            vec![R_C31, R_FORK],
            vec![],
            s,
            "last_version",
            vec![v1],
            vec![],
            ans("fork", "5.5.4", "as shown", "v2a and v2b each pass v1's gate (A's and B's assents) and neither is shown after the other: both tips are shown, v1 stays in force"),
            vec![ans("in force", "5.5.4(b)", "per anchoring", "the reader's own answer, named as the reader's, given beside the Terms' and never in its place: per X, v2a passes the gate first, and v2b is late").who(&v2a)],
            None,
        ));
        let _ = v2b;
    }

}
