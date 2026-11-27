//! Part 4 (b) of stage one, session 2, first half: the codemeister's sheet
//! (`docs/code/impact-draft-26.md`, section 4.4), lines 1 to 45, rules 5.1 to
//! 5.5 of draft 26. Every answer is read from draft 26 at b58e417 with the
//! ledger and the lead's notes, quoted beside it; never from the sheet's
//! prediction, never from code. Where the sheet predicted otherwise, the
//! case says so in `against_sheet`.

use super::*;

// ---------------------------------------------------------------- draft 26, quoted
const Q_512_ONE_SIG: &str = "draft 26, 5.1.2: \"it binds a party of x only where that party's own signature is on the version of x's Terms that gives the power: no update condition can give it for a party who did not sign that version (§5.6).\"";
const Q_561B: &str = "draft 26, 5.6.1(b): \"their own signature is on the version of those Terms that gives the power, the version `under` names, as an assent counted in their name (5.6.5(f)), and they are a known party of that version\"";
const Q_561B_RULE: &str = "draft 26, 5.6.1(b): \"those Terms give a power for acts of this kind; and that power's rule, applied to the acts held, says yes\"";
const Q_563: &str = "draft 26, 5.6.3: \"it binds the grantor (5.6.6), who gave the power, and never its signer, the agent, as an act of the agent's own.\"";
const Q_561A: &str = "draft 26, 5.6.1(a): \"they signed it in their own name (an act made for another under a power is not made in its signer's own name: 5.6.3)\"";
const Q_514_NO_VERSION: &str = "draft 26, 5.1.4: \"Where that act names no version, a verifier MUST take the receiver from that agreement's Terms in force, per the keepers that agreement's Terms name, qualified **per keeper** with those keepers named, or, where they name none, **as shown** (§5.5, §5.8, §5.13).\"";
const Q_514_PARTY: &str = "draft 26, 5.1.4: \"Where the receiver so named is one of that agreement's own parties, the answer is that party.\"";
const Q_5135_READER: &str = "draft 26, 5.13.5: \"An anchoring of the reader's own choosing, whether or not the agreement names any, gives an answer only as that reader's, named so, given beside the Terms' answer and never in its place\"";
const Q_533_DISAGREE: &str = "draft 26, 5.8.3: \"under the default, there is none for what they disagree on: a verifier answers **not shown** for the answers that rest on it, with the reason that the keepers disagree; answers that rest only on what they agree on stand.\"";
const Q_533_DEFAULT: &str = "draft 26, 5.8.3: \"Where the Terms name several keepers, how many of them must show an act is said by the cMIP the same Terms name beside them (task K9); where that socket is empty, every keeper named is needed.\"";
const Q_533_UNTIL: &str = "draft 26, 5.8.3: \"Until then, a verifier answers **not shown**, with that reason, and names the keepers that do not yet show it.\"";
const Q_584_NAMED: &str = "draft 26, 5.8.4: \"A verifier MUST take those answers from the keepers, qualified **per keeper**, with the keepers that counted named, by K9's answer, and the others named as not showing it.\"";
const Q_557H: &str = "draft 26, 5.5.7(h): \"Where the verifier lacks the cMIP, whether the update passes the gate is **unchecked** (§3.6), and so is every answer that rests on it (5.5.5(e)).\"";
const Q_521: &str = "draft 26, 5.2.1: \"The `body`, every piece in `relies_on`, and every cMIP named anywhere in a Terms act MUST be named by fingerprint.\"";
const Q_UNCHECKED: &str = "draft 26, §3.6: \"**Unchecked**: the verifier lacks something it needs to apply a grammar rule: a cMIP the Terms name, an act named in a field that it does not hold, or a keeper's record that it does not hold.\"";
const Q_522_TEXT: &str = "draft 26, 5.2.2: \"The words of Terms MUST be a Text act (Text, rule 14), public or private, and the Terms MUST name it in `body` by its act id, beside the socket of the cMIP that reads it (task K1).\"";
const Q_522_NOT_TEXT: &str = "draft 26, 5.2.2: \"Where the act `body` names is held and is not a Text act, the Terms are **invalid**: they lack what they need.\"";
const Q_523_IN_FORCE: &str = "draft 26, 5.2.3: \"and the answer of `in_force` on coming into force, in a Terms act that carries `replaces` (5.4.2, §5.5). A verifier says of each that it left it unread.\"";
const Q_542: &str = "draft 26, 5.4.2: \"In an update it is read only for who fills a role, as K5's input (§5.10); its answer on coming into force is left unread there (5.2.3, 5.5.1).\"";
const Q_551_OWN_IN_FORCE: &str = "draft 26, 5.5.1: \"An update's own `in_force` is left unread (5.2.3): whether it replaces is answered by this rule alone.\"";
const Q_531_MUST: &str = "draft 26, 5.3.1: \"`authors` MUST name one or more of the parties these Terms name, each named as a signer: an author is never a party named by role, and never one named as an agreement (§3.2).\"";
const Q_531_INVALID: &str = "draft 26, 5.3.1: \"Terms whose `authors` name a party named by role or as an agreement, or one who is not one of their parties, are **invalid**; so are Terms that carry `parties` and whose signer is not one of the parties they name as signers.\"";
const Q_531_SIGNER: &str = "draft 26, 5.3.1: \"The signer of a Terms act is its first author, whether or not `authors` names them: `authors` names the other authors, and MAY name the signer too. No Terms are invalid for leaving their signer out of `authors`.\"";
const Q_AUTHOR_ASSENT: &str = "draft 26, §4.3, **An author's first act**: \"The act that publishes Terms is its signer's assent to them: it is the assent counted in that signer's name, and the signer does not assent to them again.\"";
const Q_541_DEFAULT: &str = "draft 26, 5.4.1: \"Where it carries no `in_force`, it comes into force when there is an assent to it in the name of every party it names as a signer, the Terms act itself being its signer's (§4.3).\"";
const Q_541_KNOTS: &str = "draft 26, 5.4.1: \"Where it names none, knots show it: each party in whose name one of those assents is counted has made an act in that same name within the agreement (a Terms act or a Statement of that agreement, and no other knot) that is shown after every one of those assents (§5.13).\"";
const Q_541_NOT_YET: &str = "draft 26, 5.4.1: \"Until then it is not yet in force: a verifier answers **not shown** for it as in force, with that reason, no order being shown.\"";
const Q_541_KEEPERS: &str = "draft 26, 5.4.1: \"Where it names keepers, they show it, as many of them as 5.8.3 asks, at the positions they give those assents, and an act they do not yet show is not yet placed (§3.4).\"";
const Q_541_WHICH: &str = "draft 26, 5.4.1: \"Those assents are the ones its `in_force` rule requires, as K2 names them, or the default's; not every assent counted.\"";
const Q_541_CS_PINS: &str = "draft 26, 5.4.1: \"Any such act pins, a counter signature included: a counter signature so shown is late, and cancels nothing (5.4.5)\"";
const Q_545_LATE: &str = "draft 26, 5.4.5: \"A counter signature is available only until the assents that put the Terms in force (5.4.1, its first sentence) are shown before it, by the keepers the Terms name, at the positions they give, or, where they name none, by knots: one shown after them is late, cancels nothing, and pins as any act of its signer within the agreement does (5.4.1).\"";
const Q_545_AGENT: &str = "draft 26, 5.4.5: \"the party itself MAY make it, in its own name, as may the agent, as that assent's signer, or another under a power of sort `counter_signature` (§5.6; 5.6.6(c)).\"";
const Q_545_NONE: &str = "draft 26, 5.4.5: \"Where the Terms would not come into force even with every act held counted, nothing had completed them, and the counter signature cancels.\"";
const Q_545_ANSWER: &str = "draft 26, 5.4.5: \"About a counter signature, **shown** means that it cancels the assent it is read against; **not shown** means that it is not shown as cancelling (it is late and changes nothing, or it follows no assent), with the reason\"";
const Q_545_WHICH: &str = "draft 26, 5.4.5: \"Which is first is read by knots or keepers only, never by act id: two counter signatures in one name that nothing orders stand as one.\"";
const Q_545_FOR: &str = "draft 26, 5.4.5: \"Made for a party under a power of sort `counter_signature` (§5.6), or as an agreement's signature (5.1.2), it cancels the assent counted in that party's name that it names, directly or through acts that name it.\"";
const Q_543_SHOWN: &str = "draft 26, 5.4.3: \"About an assent, a verifier answers **shown** where it is counted in a party's name and those Terms are in force, or where it earned a filling under a version since replaced, with that version named (§5.10)\"";
const Q_543_NOT: &str = "draft 26, 5.4.3: \"otherwise **not shown**, with the reason (those Terms are not yet in force, no order being shown; they have been replaced; they are a tip of a fork, or a late update; the assent is cancelled, 5.4.5).\"";
const Q_5102_FILLED: &str = "draft 26, 5.10.2: \"A spot is filled, by a signer, when its K5 cMIP, applied to the acts held and the keepers' answers, names that signer on the strength of a **proof**: the acts that earn the spot.\"";
const Q_5105_LACK: &str = "draft 26, 5.10.5: \"Where the verifier lacks the cMIP, the answer is **unchecked** (§3.6).\"";
const Q_551A: &str = "draft 26, 5.5.1(a): \"The update condition of the version it names, or that condition's default where the version names none, answers **valid** for it (5.5.7). No other assent is asked.\"";
const Q_551A_KEEPERS: &str = "draft 26, 5.5.1(a): \"Where that version names keepers, the gate counts only the assents its keepers show, as many of them as 5.8.3 asks, and answers per keeper: an update not shown so is no update of that version while they do not show it; it competes with nothing and makes no fork (5.5.4, §5.12).\"";
const Q_551B: &str = "draft 26, 5.5.1(b): \"Its order after the last replacement of that version is shown: it is shown after the acts that put that version in force (for a first version, the assents of 5.4.1's first sentence; for one that is itself an update, the acts that put it through its gate); and every other update of that version that passes the gate is shown after it, and so is late.\"";
const Q_551B_EITHER: &str = "draft 26, 5.5.1(b): \"The update is shown after those acts where it, or an act that put it through the gate, is shown after them.\"";
const Q_551_TWO: &str = "draft 26, 5.5.1: \"A verifier then gives two answers: **valid** for it, and **not shown** for it as in force, with the reason: no order is shown, it is a tip of a fork, or the version it names is not in force.\"";
const Q_551_FORK: &str = "draft 26, 5.5.1: \"Two updates of one version that both pass the gate, neither shown after the other, are a fork (§5.12): both stop, and the version both name stays in force (5.5.4(e)).\"";
const Q_551B_ORDER: &str = "draft 26, 5.5.1(b): \"The order between two updates of one version is read from the acts that put each through the gate, as 5.5.4 says: it does not wait on either update's own pin.\"";
const Q_557D: &str = "draft 26, 5.5.7(d): \"Where the cMIP answers valid, the verifier answers **valid**, named and qualified in the same way.\"";
const Q_557E: &str = "draft 26, 5.5.7(e): \"A verifier answers **valid**, with the words \"by default\", where an assent to the update in the name of each of them is held, the update's own Terms act being its signer's (§4.3); where one is lacking it answers **not shown** for the update as a replacement (5.5.5(c)), and never **not valid**: the missing assent may exist.\"";
const Q_555A: &str = "draft 26, 5.5.5(a): \"Where the original names no update condition, the signers its default asks for are the known parties of the original (§3.2), the author among them: the parties the original names as signers or as agreements; never a party named by role, and never a signer who fills a role.\"";
const Q_555A_AGREEMENT: &str = "draft 26, 5.5.5(a): \"A party named as an agreement is a known party, and among the default signers, whether or not it has ever signed: how it signs is §5.1's (5.1.2), and an update it does not sign is not valid by default.\"";
const Q_555A_FORKED: &str = "draft 26, 5.5.5(a): \"Two assents of one signer that name the same `previous` fork that signer's line (5.7.2), and neither counts for any update's gate until that line is resolved (§5.12)\"";
const Q_555A_KNOT: &str = "draft 26, 5.5.5(a): \"A second assent that names the first, directly or through acts that name it, is a knot: it may show the update it assents to late, by 5.5.4(a)'s test and by no other\"";
const Q_555A_NEW: &str = "draft 26, 5.5.5(a): \"A party the update names that the original does not is not among them: it is a known party from the update on (§3.2).\"";
const Q_KNOWN: &str = "draft 26, §3.2, **Known party**: \"A party that an update names, and the version it replaces does not, is a known party from that update on, and is not one of the known parties of the versions before it.\"";
const Q_555C: &str = "draft 26, 5.5.5(c): \"Under the default, a Terms act that lacks one of those signatures does not pass the gate, and replaces nothing: the Terms it names stay in force, and it is not a tip of a fork.\"";
const Q_554_LATE: &str = "draft 26, 5.5.4(a): \"Where O names no keeper, L is shown after O was replaced, by knots, where L is shown after acts enough for F to pass O's gate, or, for a resolving update, to resolve (§5.12); or where no choice of acts enough for L to pass O's gate avoids an act so shown.\"";
const Q_554_KNOTS: &str = "draft 26, 5.5.4(a): \"Every fingerprint in a field of every act the verifier holds is a knot, Terms or Statement, of this agreement or another, of any layer (§3.4, §5.13).\"";
const Q_554C_LATE: &str = "draft 26, 5.5.4(c): \"About L, a verifier answers **late**, names this rule and what shows that L came late (the act of L, or the act it needs, shown after F's acts; or the positions the keepers give, or the times the clock gives), and qualifies the answer **as shown** where knots show it\"";
const Q_554C_MISSING: &str = "draft 26, 5.5.4(c): \"where the acts that could show L late need an act that is named in a field of an act held, and the verifier does not hold it, whether L is late is **unchecked** (§3.6, §5.13), and so is which Terms are in force from O on (5.5.5(e)).\"";
const Q_554C_KEEPER: &str = "draft 26, 5.5.4(c): \"Where O names keepers, a keeper's record that contradicts a knot the verifier holds (it places L before an act that L, or an act L needs, is shown after) gives **not shown** for the answers that rest on that record, with the reason that the keeper contradicts the acts, and the record is kept as evidence (5.8.4).\"";
const Q_554_FORK: &str = "draft 26, 5.5.4: \"Where nothing shows it, L and F are a fork whose shared act is O, as for any two updates of one version, however late L may in fact be\"";
const Q_5133_NEVER: &str = "draft 26, 5.13.3: \"It proves that B came after A, and nothing more: never that an act came before one that does not name it, and never that an act does not exist.\"";
const Q_5131_PREV: &str = "draft 26, 5.13.1: \"An act is read against the versions and acts it names, in any field that holds a fingerprint (`body`, `terms`, `under`, `replaces`, `agreement`, `previous`, `answers`, `resolves`, `continues`, `relies_on`, `settlement`, `envelope`, `envelope_at`, the layer below's `prev` and `refs`, and any other), the body's field included.\"";
const Q_571_PRIVATE: &str = "draft 26, 5.7.1: \"So it is where `previous` names an act the verifier holds and cannot open (a private act, held without its key): what that act is cannot be read\"";
const Q_572: &str = "draft 26, 5.7.2: \"Two acts by one signer within one agreement that name the same `previous` (or that both name none) are a fork, whatever else orders them\"";
const Q_544: &str = "draft 26, 5.4.4: \"A party named as an agreement is not counted by the default of 5.4.1.\"";

// ---------------------------------------------------------------- readings
const R_HER_ASSENT: &str = "the ledger, \"Publishing the Terms is the publisher's assent\" (27 November, 20:49–20:50): \"Yes, I don’t see the need to have her sign twice\"";
const R_GATE_PIN: &str = "the ledger, \"The gate and the pin; a fork, not a race\" (26 November, 17:39–17:46)";
const R_VALID_TWO: &str = "the lead's note of 27 November (docs/lead/notes/2026-11-27-draft-26-readings.md), rows C4 and C46a: \"Valid, since the gate asks only whether the rule allows it; in force waits for the original. Two answers, \"valid\" and \"not in force: <reason>\".\" The lead's reading";
const R_C3: &str = "the lead's note of 27 November, row C3: \"Either: the update's own knots, or those of the acts that put it through the gate. (ii).\" The lead's reading, resting on the ledger's \"The gate and the pin\"";
const R_C2: &str = "the lead's note of 27 November, row C2: \"Only the assents the agreement's own rule requires; the cMIP in `in_force` names which (K2's output). Not every assent counted.\" The lead's reading";
const R_C18: &str = "the lead's note of 27 November, row C18: \"The version `under` names.\" The lead's reading, resting on the ledger's \"A power given binds its giver\"";
const R_GIVER: &str = "the ledger, \"The giver bears it, not the agent\" (27 November, 16:50–16:53): \"No, Ana took the risk, she bears the responsability.\"";
const R_C31: &str = "the lead's note of 27 November, row C31, F8: \"Given beside the Terms' answer, labelled the reader's, never in its place.\" The lead's reading, resting on \"Whose place counts\"";
const R_C9: &str = "the lead's note of 27 November, row C9: grammar case 64 \"Retired; its sentence is gone.\" This case stands in its place (the sheet's line 29)";
const R_C46D: &str = "the lead's note of 27 November, row C46d: \"Only answers resting on C are not shown.\" The lead's reading, resting on \"More than one place\"";
const R_BOTH_KEEPERS: &str = "the ledger, \"Two keepers named, both needed\" (27 November, 16:40–16:44): \"If the terms stipulate two keepers, both keepers are needed. Sorry can’t do\"";
const R_CROSS: &str = "the ledger, \"Keepers: cross verification by default, a socket to lift it\" (27 November, 23:52, to 28 November, 00:00): \"Agreed, and there is a socket to lift it. (Which needs to be in the header)\"";
const R_P7_1: &str = "the lead's readings for P2 (docs/lead/notes/2026-11-27-readings-for-p2.md), \"P7's three\", answer 1: \"Not shown where the verifier holds a record of that keeper's without the act; unchecked where it holds none of that keeper's records for it.\" The lead's reading";
const R_KEEPER_GATE: &str = "the lead's readings for P2, \"After his 22:36 and 22:39, for P5, 22:45\", answer 1: \"With keepers named, the gate of every update counts only the assents every keeper shows\"; resting on the ledger's \"An update the keeper never showed is no update\" (27 November, 22:27–22:30): \"To be valid the agreement needs to be checked at the keeper.\"";
const R_C28: &str = "the lead's note of 27 November, row C28: \"Only the answers resting on that record are \"not shown, the keeper contradicts the acts\"; the record is kept as evidence.\" The lead's reading";
const R_KNOTS: &str = "the ledger, \"Knots are knots: one reading, \"shown after\"\" (27 November, 07:38–07:49): \"Knots a cross acts by nature, and possibly cross layer.\"";
const R_F6: &str = "the lead's note of 27 November, row F6, C26: \"Knots.\" (`refs` and `prev`) The lead's reading, resting on \"Knots are knots\"";
const R_C25: &str = "the lead's note of 27 November, row C25: \"Every layer of the core; a verifier decodes the core's six.\" The lead's reading";
const R_MISSING: &str = "the ledger, \"Knots are knots\" (27 November, 07:38–07:49): \"Missing act is always “I don’t know”\"";
const R_C15: &str = "the lead's note of 27 November, row C15: \"By knots or keepers only; where nothing orders them, not by id: both stand as one withdrawal.\" The lead's reading, resting on \"Knots are knots\"";
const R_P2_10: &str = "the lead's readings for P2 (docs/lead/notes/2026-11-27-readings-for-p2.md), \"The rest of the batch of 19\", row 10 (a): \"A counter signature in the party's own name cancels an assent an agent made for her, while one is available: 5.6.6(c) already says so\". The lead's reading";
const R_C14: &str = "the lead's note of 27 November, row C14: \"Known parties, as the version names them; how they sign is their own rule's.\" The lead's reading, resting on the ledger's \"The known parties of a version are the signers it names\" (27 November, 16:44–16:46)";
const R_DANA: &str = "the ledger, \"The known parties of a version are the signers it names\" (27 November, 16:44–16:46): \"Yes\"";
const R_UNKNOWN: &str = "the ledger, \"Who signs an update by default: the known parties\" (26 November, 17:51–17:56): \"It’s the protect the unknown party expressed the old way.\"";
const R_C46C: &str = "the lead's note of 27 November, row C46c: \"The line's fork only (5.7.2); the gate makes no test of its own.\" The lead's reading";
const R_F3: &str = "the lead's note of 27 November, row F3: \"It is one case of 5.5.4(a), not a second test: a second assent naming the first is a knot that may show the second update late by 5.5.4(a).\" The lead's reading";
const R_C17: &str = "the lead's note of 27 November, row C17, F2: \"Together. L is late when no choice of assents enough for L's gate avoids an act shown after acts enough for F's gate.\" The lead's reading";
const R_C46B: &str = "the lead's note of 27 November, row C46b: \"Yes: lateness is against the gate, not the pin.\" The lead's reading";
const R_C1: &str = "the lead's note of 27 November, row C1, S: \"The signer is the first author whether or not listed; `authors` names the others; no Terms are invalid for leaving the signer out.\" The lead's reading, resting on the ledger's \"The signer of a Terms act is an author\" (27 November, 16:48–16:50)";
const R_NO_PARTY: &str = "the lead's readings for P2 (docs/lead/notes/2026-11-27-readings-for-p2.md), the seven, row 6: \"A Terms act signed by someone who is not a party is invalid.\" The lead's reading";

fn rs(v: &[&str]) -> Vec<String> {
    v.iter().map(|s| s.to_string()).collect()
}

/// A new case of the sheet's section 4.4.
#[allow(clippy::too_many_arguments)]
fn case(line: &'static str, name: &str, tests: &'static str, decides: Vec<&'static str>, reading: Vec<String>, choices: Vec<u8>, sc: Sc, ask: &'static str, args: Vec<Hash>, stubs: Vec<Asked>, answer: Ans, also: Vec<Ans>, against: Option<&str>) -> G {
    G {
        name: format!("line {line}: {name}"),
        part: "4.4",
        v2: None,
        sheet: Some(line),
        status: "new",
        against_sheet: against.map(|s| s.to_string()),
        tests,
        decides,
        reading,
        choices,
        sc,
        ask,
        args,
        stubs,
        answer,
        also,
    }
}

/// A first version naming A and B (and `extra`), signed by A, B's assent, and
/// each side pinned by a later act (5.4.1): in force, as shown.
struct Two {
    root: Hash,
    b1: Hash,
    anote: Hash,
    bnote: Hash,
}

fn two(s: &mut Sc, l: &str, a: &Tid, bb: &Tid, extra: P) -> Two {
    s.who(a, "A");
    s.who(bb, "B");
    let mut t = terms(signers(&[a, bb]));
    for (k, val) in extra.0 {
        t = t.set(k, val);
    }
    let root = s.root(&format!("{l}/root, by A"), a, t);
    let b1 = s.assent(&format!("{l}/B's assent"), bb, &root, &root);
    let anote = s.note(&format!("{l}/A's next act, naming B's assent"), a, &root, &root, &[b1]);
    let bnote = s.note(&format!("{l}/B's next act"), bb, &root, &root, &[]);
    Two { root, b1, anote, bnote }
}

const PINNED: &str = "the first version in force, as shown: A's Terms act (her assent) and B's assent, each side pinned by a later act shown after both (5.4.1)";

fn k4(p: Value) -> Value {
    stub_socket(stub::K4, p)
}

pub fn cases(out: &mut Out) {
    let a = tid("A");
    let bb = tid("B");
    let c = tid("C");
    let d = tid("D");
    let gil = tid("G");
    let hana = tid("H");
    let m = tid("M");
    let buyer = tid("U");

    // ================================================================ 5.1 An agreement as a party (lines 1 to 5)
    {
        // x: version 1 (A, B), a power of sort assent for B; version 2 adds C,
        // under a condition stub (two of the original's known parties).
        let mk = |with_c_assent: bool| -> (Sc, Hash, Hash, Hash) {
            let mut s = Sc::new();
            s.who(&a, "A");
            s.who(&bb, "B");
            s.who(&c, "C");
            s.who(&d, "D");
            let pw = arr(vec![arr(vec![u(0), stub_socket(stub::K3, arr(vec![b(&bb.id)]))])]);
            let x = s.root("line 1/x v1, by A", &a, terms(signers(&[&a, &bb])).set(tk::POWERS, pw.clone()).set(tk::CONDITION, k4(arr(vec![u(0), u(2)]))));
            let b1 = s.assent("line 1/B's assent to x v1", &bb, &x, &x);
            s.note("line 1/A's next act in x, naming B's assent", &a, &x, &x, &[b1]);
            s.note("line 1/B's next act in x", &bb, &x, &x, &[]);
            let v2 = s.version("line 1/x v2, adding C, by A", &a, &x, &x, terms(signers(&[&a, &bb, &c])).set(tk::POWERS, pw).set(tk::CONDITION, k4(arr(vec![u(0), u(2)]))));
            let b2 = s.assent("line 1/B's assent to x v2", &bb, &x, &v2);
            if with_c_assent {
                s.assent("line 2/C's assent to x v2", &c, &x, &v2);
            }
            let y = s.root("line 1/Y, by D, naming D and x", &d, terms(vec![v::party_signer(&d.id), arr(vec![u(2), b(&x)])]));
            let sig = s.st(
                "line 1/B's assent to Y for x, under x v2",
                &bb,
                v::statement(&y, &y, v::kind::ASSENT, None).set(sk::FOR, who_agreement(&x)).set(sk::UNDER, b(&v2)).set(sk::RELIES_ON, arr(vec![b(&b2)])),
            );
            (s, x, v2, sig)
        };
        let stubs = || {
            vec![
                asked("K4", stub::K4, "x v1's condition, of x v2 (two of x v1's known parties, A and B)", "valid: A's Terms act and B's assent are held"),
                asked("K3", stub::K3, "x v2's power of sort assent, of B's assent to Y for x", "yes: its signer, B, is listed"),
            ]
        };
        let (s, _x, _v2, sig) = mk(false);
        out.cases.push(case("1", "x's version 2 (A, B, C), passed by a condition without C, gives B a power of sort assent; B assents to outside Terms for x, under version 2: C is not bound", "5.1.2, 5.6.1(b)", vec![Q_512_ONE_SIG, Q_561B], rs(&[R_C18]), vec![], s.clone(), "bound", vec![c.id, sig], stubs(), ans("not shown", "5.6.1(b)", "as shown", "C's own signature is not on x v2, the version `under` names: no assent is counted in C's name to it"), vec![], None));
        out.cases.push(case("1", "the same: A, who signed x's version 2 (its Terms act), is bound by B's assent for x", "5.1.2, 5.6.1(b)", vec![Q_512_ONE_SIG, Q_561B, Q_561B_RULE, Q_AUTHOR_ASSENT], rs(&[R_C18, R_HER_ASSENT]), vec![], s.clone(), "bound", vec![a.id, sig], stubs(), ans("shown", "5.6.1(b)", "as shown", "the act's `for` names x; `under` names x v2, in force, which A signed (her Terms act) and of which she is a known party; its power of sort assent; the power's rule says yes"), vec![], None));
        out.cases.push(case("3", "the same: B, the agent who signed the assent for x, is not bound by it as an act of his own", "5.6.3", vec![Q_563, Q_561A], rs(&[R_GIVER]), vec![], s, "bound", vec![bb.id, sig], vec![], ans("not shown", "5.6.3", "none", "the act is made in x's name under a power: it binds the grantor, never its signer as an act of his own"), vec![], None));
        let (s, _x, _v2, sig) = mk(true);
        let mut st = stubs();
        st.push(asked("K3", stub::K3, "(the same power, asked again for C's binding)", "yes"));
        out.cases.push(case("2", "the same, C's own assent to x's version 2 held: C is bound", "5.1.2, 5.6.1(b)", vec![Q_512_ONE_SIG, Q_561B], rs(&[R_C18]), vec![], s, "bound", vec![c.id, sig], st, ans("shown", "5.6.1(b)", "as shown", "C's own signature is on x v2, the version `under` names, and she is a known party of it"), vec![], None));
    }
    {
        // line 4: a payment naming no version; no keeper; the reader's own anchoring.
        let mut s = Sc::new();
        s.who(&buyer, "U");
        let t = two(&mut s, "line 4", &a, &bb, P::new().set(tk::RECEIVER, arr(vec![u(0), u(0)])));
        let pay = g("line 4/U's payment (stand-in)");
        s.names.insert(pay, "line 4/U's payment, naming no version (stand-in)".into());
        s.money.push(json!({ "payment": v::hx(&pay), "payer": v::hx(&buyer.id), "to_agreement": v::hx(&t.root), "version": null, "settlement": v::hx(&g("line 4/its settlement")), "amount": 10 }));
        s.anchoring = Some(AnchorT { id: g("line 4/the reader's own anchoring"), label: "an anchoring of the reader's own choosing (test)".into(), order: vec![t.root, t.b1, t.anote, t.bnote] });
        out.cases.push(case("4", "a payment naming no version; Terms naming no keeper, their receiver A; the reader accepts an anchoring of its own: the receiver from the Terms in force, as shown, the reader's answer beside it, as the reader's", "5.1.4", vec![Q_514_NO_VERSION, Q_514_PARTY, Q_5135_READER], rs(&[R_C31, PINNED]), vec![], s, "receiver_for_payment", vec![pay], vec![], ans("shown", "5.1.4", "as shown", "the Terms in force (the root, pinned by knots) name A, by position, as receiver").who(&a.id), vec![ans("shown", "5.1.4", "per anchoring", "the reader's own answer, named as the reader's, beside the Terms' answer and never in its place").who(&a.id)], None));
    }
    // line 5 and line 43 (2): two keepers that disagree on which update came first.
    let disagree = |line: &'static str| -> (Sc, Hash, Hash, Hash, Hash, Hash) {
        let mut s = Sc::new();
        let (k1, k2) = (keeper_id("K1"), keeper_id("K2"));
        s.who(&a, "A");
        s.who(&bb, "B");
        let root = s.root(&format!("line {line}/root, by A, receiver A, keepers K1 and K2"), &a, terms(signers(&[&a, &bb])).set(tk::KEEPER, keepers(&[k1, k2])).set(tk::RECEIVER, arr(vec![u(0), u(0)])));
        let b1 = s.assent(&format!("line {line}/B's assent"), &bb, &root, &root);
        let v2a = s.version(&format!("line {line}/v2a, by A, receiver A"), &a, &root, &root, terms(signers(&[&a, &bb])).set(tk::KEEPER, keepers(&[k1, k2])).set(tk::RECEIVER, arr(vec![u(0), u(0)])));
        let v2b = s.version(&format!("line {line}/v2b, by B, receiver B"), &bb, &root, &root, terms(signers(&[&a, &bb])).set(tk::KEEPER, keepers(&[k1, k2])).set(tk::RECEIVER, arr(vec![u(0), u(1)])));
        let ba = s.assent(&format!("line {line}/B's assent to v2a"), &bb, &root, &v2a);
        let ab = s.assent(&format!("line {line}/A's assent to v2b"), &a, &root, &v2b);
        s.keeper("K1", "live", vec![vec![root, b1, v2a, v2b, ba, ab]]);
        s.keeper("K2", "live", vec![vec![root, b1, v2a, v2b, ab, ba]]);
        (s, root, v2a, v2b, k1, k2)
    };
    {
        let (mut s, root, _v2a, _v2b, k1, k2) = disagree("5");
        s.who(&buyer, "U");
        let pay = g("line 5/U's payment (stand-in)");
        s.names.insert(pay, "line 5/U's payment, naming no version (stand-in)".into());
        s.money.push(json!({ "payment": v::hx(&pay), "payer": v::hx(&buyer.id), "to_agreement": v::hx(&root), "version": null, "settlement": v::hx(&g("line 5/its settlement")), "amount": 10 }));
        out.cases.push(case("5", "a payment naming no version; Terms naming keepers K1 and K2 (K9 empty), which disagree on which of two updates passed the gate first (K1: v2a, naming A as receiver; K2: v2b, naming B): the receiver is not shown, the keepers disagree", "5.1.4, 5.8.3", vec![Q_514_NO_VERSION, Q_533_DISAGREE], rs(&[R_C46D, R_CROSS]), vec![5, 6, 7], s, "receiver_for_payment", vec![pay], vec![], ans("not shown", "5.8.3", "per keeper", "which Terms are in force rests on the order of v2a's and v2b's gates, on which K1 and K2 disagree; both records are shown as evidence").not_showing(&[k1, k2]), vec![], None));
    }

    // ================================================================ 5.2 The words (lines 6 to 10)
    {
        let mut s = Sc::new();
        let unknown = g("line 6/a cMIP no text hashes to (stand-in, not held)");
        s.names.insert(unknown, "a condition cMIP no text hashes to (not held)".into());
        let t = two(&mut s, "line 6", &a, &bb, P::new().set(tk::CONDITION, socket(&unknown, Value::Null)));
        let v2 = s.version("line 6/v2, by A", &a, &t.root, &t.root, terms(signers(&[&a, &bb])).set(tk::CONDITION, socket(&unknown, Value::Null)));
        s.assent("line 6/B's assent to v2", &bb, &t.root, &v2);
        out.cases.push(case("6", "Terms whose `condition` names a fingerprint no text hashes to, the cMIP not held; an update signed by both: whether it passes the gate is unchecked, and the Terms are not invalid (a fingerprint, 5.2.1)", "5.5.7(h), 5.2.1", vec![Q_557H, Q_521, Q_UNCHECKED], rs(&[TEXT_ALONE, PINNED]), vec![], s, "update", vec![v2], vec![], ans("unchecked", "5.5.7(h)", "none", "the verifier lacks the cMIP the original names in `condition`"), vec![], None));
    }
    {
        let mut s = Sc::new();
        s.who(&a, "A");
        let root = s.root("line 7/root, by A", &a, terms(signers(&[&a])));
        out.cases.push(case("7", "Terms whose `body` names a Text act held beside them: the words are a Text act, the Terms not invalid under 5.2.2", "5.2.2", vec![Q_522_TEXT, Q_522_NOT_TEXT], rs(&[TEXT_ALONE, "the checker's twin is line 92 (valid.json)"]), vec![], s, "act", vec![root], vec![], ans("shown", "5.2.2", "none", "the act `body` names is held and is a Text act (Text draft 11, type 0, field 0 a text string)"), vec![], None));
    }
    {
        let mut s = Sc::new();
        s.who(&a, "A");
        s.who(&bb, "B");
        let x = s.root("line 8/another agreement X, by B", &bb, terms(signers(&[&bb])));
        let st = s.note("line 8/B's Statement within X", &bb, &x, &x, &[]);
        let t = terms(signers(&[&a])).set(tk::BODY, v::body(&st, stub_socket(stub::K1, Value::Null))).set(tk::PREVIOUS, previous(None));
        let bad = s.terms_raw("line 8/Terms by A whose body names B's Statement", &a, None, t);
        out.cases.push(case("8", "Terms whose `body` names a Statement held: invalid", "5.2.2", vec![Q_522_NOT_TEXT], rs(&[TEXT_ALONE, "the checker's twin is line 93 (invalid.json)"]), vec![], s, "act", vec![bad], vec![], ans("invalid", "5.2.2", "none", "the act `body` names is held and is not a Text act: a Statement"), vec![], None));
    }
    out.waiting.push(Waiting {
        what: "line 9 (5.2.2): Terms whose `body` names a Text act that its signer's key change has left out (Identity, rule 34), a party's witness act relying on it".into(),
        why: "waiting: the case needs Identity's key change and a witness act as bytes or as a table; this builder writes neither, and the format carries no Identity table. Written once the layer below is given a stand-in".into(),
    });
    {
        let mut s = Sc::new();
        s.who(&c, "C");
        let t = two(&mut s, "line 10", &a, &bb, P::new());
        let v2 = s.version("line 10/v2, by A, carrying its own in_force (asking C's name)", &a, &t.root, &t.root, terms(signers(&[&a, &bb])).set(tk::IN_FORCE, stub_socket(stub::K2, arr(vec![who_signer(&c.id)]))));
        s.assent("line 10/B's assent to v2", &bb, &t.root, &v2);
        out.cases.push(case("10", "an update carrying its own `in_force`: the verifier says it left unread its answer on coming into force", "5.2.3", vec![Q_523_IN_FORCE, Q_542], rs(&[TEXT_ALONE, "the checker's twin is line 87 (valid.json)"]), vec![], s.clone(), "whole", vec![v2], vec![], ans("shown", "5.2.3", "none", "left unread: the answer of `in_force` on coming into force, in a Terms act that carries `replaces`"), vec![], None));
        out.cases.push(case("10", "the same update: whether it replaces is answered by the gate and the pin alone (its own `in_force`, asking a name never held, unread): valid, by default, and in force", "5.5.1", vec![Q_551_OWN_IN_FORCE, Q_557E, Q_551B], rs(&[R_C3, PINNED]), vec![], s, "update", vec![v2], vec![], ans("valid", "5.5.7(e)", "as shown", "by default: A's Terms act (v2) and B's assent, every known party of the original"), vec![ans("in force", "5.5.1", "as shown", "v2 is shown after the root's completing assents (its `previous`, A's next act, names B's assent), and no other update of the root passes the gate")], None));
    }

    // ================================================================ 5.3 Authors (lines 11, 12)
    {
        let mut s = Sc::new();
        s.who(&a, "A");
        let role = v::party_role(Some(0), Some(&g("line 11/what: a deed (stand-in)")), Some(stub_socket(stub::K5, arr(vec![arr(vec![]), Value::Bool(true)]))));
        let bad = s.root("line 11/Terms by A whose only author is a role", &a, P::new().set(tk::PARTIES, arr(vec![v::party_signer(&a.id), role])).set(tk::AUTHORS, arr(vec![u(1)])).set(tk::IN_FORCE, stub_socket(stub::K2, arr(vec![who_signer(&a.id)]))));
        out.cases.push(case("11", "Terms whose only author named in `authors` is a party named by role: invalid", "5.3.1", vec![Q_531_MUST, Q_531_INVALID], rs(&[TEXT_ALONE, "the checker's twin is line 84 (invalid.json)"]), vec![], s, "act", vec![bad], vec![], ans("invalid", "5.3.1", "none", "`authors` names, at position 1, a party named by role"), vec![], None));
    }
    {
        let mut s = Sc::new();
        s.who(&a, "A");
        s.who(&bb, "B");
        let root = s.root("line 12/root, by B, naming A and B, authors A only", &bb, terms(signers(&[&a, &bb])));
        let a1 = s.assent("line 12/A's assent", &a, &root, &root);
        s.note("line 12/B's next act, naming A's assent", &bb, &root, &root, &[a1]);
        s.note("line 12/A's next act", &a, &root, &root, &[]);
        out.cases.push(case("12", "Terms signed by B, naming A and B as signers, whose `authors` names A only: not invalid; B is their first author, and with A's assent and each side pinned they are in force", "5.3.1, 5.4.1", vec![Q_531_SIGNER, Q_AUTHOR_ASSENT, Q_541_DEFAULT, Q_541_KNOTS], rs(&[R_C1, R_HER_ASSENT]), vec![], s, "in_force", vec![root], vec![], ans("in force", "5.4.1", "as shown", "B's Terms act is his assent; A's assent; each side pinned by a later act shown after both"), vec![], Some("the sheet: invalid (the lead's first line of 16:50, since corrected); draft 26's 5.3.1: \"No Terms are invalid for leaving their signer out of `authors`\"")));
        let mut s = Sc::new();
        s.who(&a, "A");
        s.who(&bb, "B");
        let bad = s.root("line 12/Terms by B naming A only", &bb, terms(signers(&[&a])));
        out.cases.push(case("12", "the same story's other half: Terms signed by B naming A as their one party, B no party: invalid", "5.3.1", vec![Q_531_INVALID], rs(&[R_NO_PARTY]), vec![], s, "act", vec![bad], vec![], ans("invalid", "5.3.1", "none", "the Terms carry `parties`, and their signer is not one of the parties they name as signers"), vec![], None));
    }

    // ================================================================ 5.4 The first version (lines 13 to 25)
    {
        let mut s = Sc::new();
        s.who(&a, "A");
        s.who(&bb, "B");
        let root = s.root("line 13/root, by A", &a, terms(signers(&[&a, &bb])));
        let b1 = s.assent("line 13/B's assent", &bb, &root, &root);
        out.cases.push(case("13", "A publishes the Terms (her assent), B assents, nothing after: not shown as in force, no order shown", "5.4.1", vec![Q_541_DEFAULT, Q_541_KNOTS, Q_541_NOT_YET], rs(&[R_HER_ASSENT, R_GATE_PIN]), vec![], s.clone(), "in_force", vec![root], vec![], ans("not shown", "5.4.1", "as shown", "not yet in force, no order being shown: neither A nor B has an act in her name within the agreement shown after both completing assents"), vec![], None));
        let mut s14 = s.clone();
        s14.note("line 14/A's next act, naming B's assent", &a, &root, &root, &[b1]);
        out.cases.push(case("14", "the same, A's later act naming both assents (the Terms act in `previous`, B's assent in `relies_on`), B's none: not shown, B's side not pinned", "5.4.1", vec![Q_541_KNOTS, Q_541_NOT_YET], rs(&[R_GATE_PIN]), vec![], s14.clone(), "in_force", vec![root], vec![], ans("not shown", "5.4.1", "as shown", "not yet in force, no order being shown: B has made no act in his name shown after both completing assents"), vec![], None));
        let mut s15 = s14.clone();
        s15.note("line 15/B's next act", &bb, &root, &root, &[]);
        out.cases.push(case("15", "the same, B's later act too (its `previous` B's assent): in force, as shown", "5.4.1", vec![Q_541_DEFAULT, Q_541_KNOTS], rs(&[R_HER_ASSENT]), vec![], s15, "in_force", vec![root], vec![], ans("in force", "5.4.1", "as shown", "each party in whose name a completing assent is counted has a later act shown after both"), vec![], None));
        // line 18: B's counter signature after both assents, naming them; with A's later act.
        let mut s18 = s14.clone();
        let cs = s18.st("line 18/B's counter signature, after both assents", &bb, v::statement(&root, &root, v::kind::COUNTER_SIGNATURE, None).set(sk::RELIES_ON, arr(vec![b(&b1)])));
        out.cases.push(case("18", "B's counter signature shown after both completing assents (its `previous` B's assent, which names the Terms act): late, it cancels nothing", "5.4.5", vec![Q_545_LATE, Q_545_ANSWER], rs(&[TEXT_ALONE]), vec![], s18.clone(), "counter_signature", vec![cs], vec![], ans("not shown", "5.4.5", "as shown", "late: shown after the assents that put the Terms in force; it changes nothing"), vec![], None));
        out.cases.push(case("18", "the same: the late counter signature pins B's side, and with A's later act naming B's assent the Terms are in force", "5.4.1, 5.4.5", vec![Q_541_CS_PINS, Q_541_KNOTS], rs(&[TEXT_ALONE]), vec![], s18, "in_force", vec![root], vec![], ans("in force", "5.4.1", "as shown", "A's side pinned by her later act, B's by his counter signature, each shown after both completing assents; B's assent stays counted"), vec![], None));
    }
    {
        let (k1, k2) = (keeper_id("K1"), keeper_id("K2"));
        let mut s = Sc::new();
        s.who(&a, "A");
        s.who(&bb, "B");
        let root = s.root("line 16/root, by A, keeper K1", &a, terms(signers(&[&a, &bb])).set(tk::KEEPER, keepers(&[k1])));
        let b1 = s.assent("line 16/B's assent", &bb, &root, &root);
        s.keeper("K1", "live", vec![vec![root, b1]]);
        out.cases.push(case("16", "Terms naming one keeper, which shows the Terms act and B's assent; no later act: in force, per keeper", "5.4.1", vec![Q_541_KEEPERS, Q_584_NAMED], rs(&[TEXT_ALONE]), vec![5, 6, 7], s, "in_force", vec![root], vec![], ans("in force", "5.4.1", "per keeper", "K1 places both completing assents").counted(&[k1]), vec![], None));
        let mut s = Sc::new();
        s.who(&a, "A");
        s.who(&bb, "B");
        let root = s.root("line 17/root, by A, keepers K1 and K2", &a, terms(signers(&[&a, &bb])).set(tk::KEEPER, keepers(&[k1, k2])));
        let b1 = s.assent("line 17/B's assent", &bb, &root, &root);
        s.keeper("K1", "live", vec![vec![root, b1]]);
        s.keeper("K2", "live", vec![vec![]]);
        out.cases.push(case("17", "Terms naming two keepers, K9's socket empty: K1 shows both completing assents, K2's record is held and shows neither: not shown, per keeper, K2 named", "5.8.3, 5.4.1", vec![Q_533_DEFAULT, Q_533_UNTIL, Q_541_KEEPERS, Q_584_NAMED], rs(&[R_BOTH_KEEPERS, R_CROSS, R_P7_1]), vec![5, 6, 7, 15], s, "in_force", vec![root], vec![], ans("not shown", "5.8.3", "per keeper", "every keeper named is needed; K2 does not yet show the Terms act or B's assent").counted(&[k1]).not_showing(&[k2]), vec![], Some("the sheet gave two readings (not shown, on the ledger's line; shown, on draft 26 as then written); draft 26 at b58e417, 5.8.3, settles it: not shown")));
    }
    {
        // lines 19, 20: a filling under a version since replaced.
        let mk = |held: bool| -> (Sc, Hash, Hash, Hash) {
            let mut s = Sc::new();
            s.who(&m, "M");
            s.who(&buyer, "U");
            let spot = if held { stub_socket(stub::K5, arr(vec![arr(vec![b(&buyer.id)]), Value::Bool(true)])) } else { socket(&g("a spot cMIP not held"), Value::Null) };
            let role = v::party_role(Some(0), Some(&g("what: a deed (stand-in)")), Some(spot));
            let t = || P::new().set(tk::PARTIES, arr(vec![v::party_signer(&m.id), role.clone()])).set(tk::AUTHORS, arr(vec![u(0)])).set(tk::IN_FORCE, stub_socket(stub::K2, arr(vec![who_signer(&m.id)])));
            let root = s.root("line 19/offer v1, by M", &m, t());
            s.note("line 19/M's next act", &m, &root, &root, &[]);
            let ua = s.assent("line 19/U's assent to v1 (the proof)", &buyer, &root, &root);
            let v2 = s.version("line 19/offer v2, by M", &m, &root, &root, t());
            (s, root, ua, v2)
        };
        let (s, _root, ua, _v2) = mk(true);
        out.cases.push(case("19", "U's assent to an offer's version 1 earned a filling of its role; version 2, by the maker, its only known party, is in force; the role's K5 cMIP held: shown, with version 1 named", "5.4.3, 5.10.2", vec![Q_543_SHOWN, Q_5102_FILLED], rs(&[R_UNKNOWN]), vec![], s, "assent", vec![ua], vec![
            asked("K2", stub::K2, "the offer v1's in_force: are the assents it requires present (M's)?", "yes: M's Terms act; it requires M's assent only"),
            asked("K5", stub::K5, "v1's role at position 1: its fillings", "a filling: U, its proof U's assent to v1, earned under v1"),
        ], ans("shown", "5.4.3", "as shown", "it earned a filling under v1, a version since replaced by v2; v1 named").who(&buyer.id), vec![], Some("the sheet: earned under version 2, version 3 in force; written one version shorter (earned under v1, v2 in force): the same rule")));
        let (s, _root, ua, _v2) = mk(false);
        out.cases.push(case("20", "the same, the role's K5 cMIP not held: whether U's assent earned a filling is unchecked", "5.4.3, 5.10.5", vec![Q_UNCHECKED, Q_5105_LACK], rs(&[R_MISSING]), vec![], s, "assent", vec![ua], vec![asked("K2", stub::K2, "the offer v1's in_force (M's)", "yes")], ans("unchecked", "5.4.3", "none", "the verifier lacks the spot's cMIP, so whether U's assent earned a filling cannot be read; U is no known party, and v1 is replaced"), vec![], None));
    }
    {
        let mut s = Sc::new();
        let t = two(&mut s, "line 21", &a, &bb, P::new());
        let v2 = s.version("line 21/v2, by A", &a, &t.root, &t.root, terms(signers(&[&a, &bb])));
        let b2 = s.assent("line 21/B's assent to v2", &bb, &t.root, &v2);
        let v3 = s.version("line 21/v3, by A", &a, &t.root, &v2, terms(signers(&[&a, &bb])));
        s.assent("line 21/B's assent to v3", &bb, &t.root, &v3);
        out.cases.push(case("21", "B's assent, as a known party, to version 2; version 3 in force: not shown, they have been replaced", "5.4.3", vec![Q_543_NOT], rs(&[TEXT_ALONE, PINNED]), vec![], s, "assent", vec![b2], vec![], ans("not shown", "5.4.3", "as shown", "the Terms it names, v2, have been replaced by v3 (valid by default, shown after B's assent to v2 by B's assent to v3)"), vec![], None));
    }
    {
        // lines 22, 23: counter signatures for Ana (A) by her agent Gil.
        let mk = |sort: u64, l: &str| -> (Sc, Hash) {
            let mut s = Sc::new();
            s.who(&a, "A");
            s.who(&gil, "G");
            let dd = s.root(&format!("{l}/D, by A, giving G a power"), &a, terms(signers(&[&a, &gil])).set(tk::POWERS, arr(vec![arr(vec![u(sort), stub_socket(stub::K3, arr(vec![b(&gil.id)]))])])));
            let g1 = s.assent(&format!("{l}/G's assent to D"), &gil, &dd, &dd);
            s.note(&format!("{l}/A's next act in D"), &a, &dd, &dd, &[g1]);
            s.note(&format!("{l}/G's next act in D"), &gil, &dd, &dd, &[]);
            (s, dd)
        };
        let (mut s, dd) = mk(0, "line 22");
        s.who(&bb, "B");
        s.who(&c, "C");
        let y = s.root("line 22/Y, by B, naming B, A and C", &bb, terms(signers(&[&bb, &a, &c])));
        let ga = s.st("line 22/G's assent to Y for A, under D", &gil, v::statement(&y, &y, v::kind::ASSENT, None).set(sk::FOR, who_signer(&a.id)).set(sk::UNDER, b(&dd)));
        let cs = s.st("line 22/G's counter signature, in his own name, naming his assent", &gil, v::statement(&y, &y, v::kind::COUNTER_SIGNATURE, None));
        s.assent_rel("line 22/C's assent, naming G's counter signature", &c, &y, &y, &[cs]);
        let _ = ga;
        out.cases.push(case("22", "G assents for A under a power of sort assent; then, with no power of sort counter_signature, G counter-signs it as that assent's signer; C's completing assent names the counter signature: it cancels", "5.4.5", vec![Q_545_AGENT, Q_545_NONE, Q_545_ANSWER], rs(&[R_P2_10]), vec![], s, "counter_signature", vec![cs], vec![asked("K3", stub::K3, "D's power of sort assent, of G's assent to Y for A", "yes: G is listed")], ans("shown", "5.4.5", "as shown", "G's counter signature follows his assent in his own line, and the assents that would complete Y are not shown before it (C's names it): it cancels the assent counted in A's name"), vec![], None));
        let (mut s, dd) = mk(1, "line 23");
        s.who(&bb, "B");
        s.who(&c, "C");
        let y = s.root("line 23/Y, by B, naming B, A and C", &bb, terms(signers(&[&bb, &a, &c])));
        let aa = s.assent("line 23/A's assent to Y", &a, &y, &y);
        let cs_a = s.st("line 23/A's counter signature", &a, v::statement(&y, &y, v::kind::COUNTER_SIGNATURE, None));
        let cs_g = s.st("line 23/G's counter signature for A, under D", &gil, v::statement(&y, &y, v::kind::COUNTER_SIGNATURE, None).set(sk::FOR, who_signer(&a.id)).set(sk::UNDER, b(&dd)).set(sk::RELIES_ON, arr(vec![b(&aa)])));
        s.assent_rel("line 23/C's assent, naming both counter signatures", &c, &y, &y, &[cs_a, cs_g]);
        out.cases.push(case("23", "two counter signatures in A's name, one by A, one by G under a power of sort counter_signature, nothing ordering them; C's completing assent names both: they stand as one, and cancel A's assent", "5.4.5", vec![Q_545_WHICH, Q_545_FOR, Q_545_ANSWER], rs(&[R_C15]), vec![], s, "counter_signature", vec![cs_g], vec![asked("K3", stub::K3, "D's power of sort counter_signature, of G's counter signature for A", "yes: G is listed")], ans("shown", "5.4.5", "as shown", "the two counter signatures in A's name are not ordered by knots or keepers, and stand as one; both are shown before the completing assent: A's assent is cancelled"), vec![], None));
    }
    {
        let mut s = Sc::new();
        s.who(&a, "A");
        s.who(&bb, "B");
        let y = s.root("line 24/Y, by B, naming B and A", &bb, terms(signers(&[&bb, &a])));
        let aa = s.assent("line 24/A's assent", &a, &y, &y);
        s.note("line 24/B's next act, naming A's assent", &bb, &y, &y, &[aa]);
        let cs = s.st("line 24/A's counter signature, after both assents", &a, v::statement(&y, &y, v::kind::COUNTER_SIGNATURE, None));
        out.cases.push(case("24", "A's counter signature shown after every completing assent, by knots (its `previous` her assent, which names the Terms act): late; it pins A's side", "5.4.5", vec![Q_545_LATE, Q_545_ANSWER], rs(&[TEXT_ALONE]), vec![], s, "counter_signature", vec![cs], vec![], ans("not shown", "5.4.5", "as shown", "late: shown after the assents that put the Terms in force; it cancels nothing, and pins A's side"), vec![], None));
    }
    {
        let mut s = Sc::new();
        s.who(&a, "A");
        s.who(&bb, "B");
        s.who(&c, "C");
        let y = s.root("line 25/Y, by A, naming A, B and C, in_force asking A and B", &a, terms(signers(&[&a, &bb, &c])).set(tk::IN_FORCE, stub_socket(stub::K2, arr(vec![who_signer(&a.id), who_signer(&bb.id)]))));
        let b1 = s.assent("line 25/B's assent", &bb, &y, &y);
        let _ = b1;
        let cs = s.st("line 25/B's counter signature, after the two", &bb, v::statement(&y, &y, v::kind::COUNTER_SIGNATURE, None));
        out.cases.push(case("25", "an `in_force` stub asking two of three names (A's and B's); B's counter signature after the two assents: late", "5.4.5, 5.4.1", vec![Q_545_LATE, Q_541_WHICH], rs(&[R_C2]), vec![], s, "counter_signature", vec![cs], vec![asked("K2", stub::K2, "Y's in_force: are the assents it requires present?", "yes: A's (the Terms act) and B's; those two are the ones it requires")], ans("not shown", "5.4.5", "as shown", "late: shown after A's Terms act and B's assent, the assents the `in_force` rule requires"), vec![], None));
    }

    // ================================================================ 5.5 Updates (lines 26 to 45)
    {
        let mut s = Sc::new();
        s.who(&c, "C");
        let t = two(&mut s, "line 26", &a, &bb, P::new().set(tk::CONDITION, k4(arr(vec![u(0), u(1)]))));
        let v2 = s.version("line 26/v2, by A, its own in_force asking C", &a, &t.root, &t.root, terms(signers(&[&a, &bb])).set(tk::IN_FORCE, stub_socket(stub::K2, arr(vec![who_signer(&c.id)]))));
        out.cases.push(case("26", "version 2, valid by a condition stub (one of the original's known parties), its own `in_force` (asking C, who never assents) unread, shown after version 1's acts: valid, and in force", "5.5.1, 5.5.7(d)", vec![Q_557D, Q_551_OWN_IN_FORCE, Q_551B], rs(&[R_C3, PINNED]), vec![], s, "update", vec![v2], vec![asked("K4", stub::K4, "the root's condition, of v2 (one of A and B)", "valid: A's Terms act")], ans("valid", "5.5.7(d)", "as shown", "the condition (the K4 stub, one of the known parties) answers valid"), vec![ans("in force", "5.5.1", "as shown", "v2's `previous`, A's next act, names B's assent: shown after the root's completing assents; no other update passes the gate")], None));
    }
    // lines 27 and 45: an update valid, not shown after the original's acts.
    let unordered = |line: &'static str, cond: Value| -> (Sc, Hash, Hash) {
        let mut s = Sc::new();
        s.who(&a, "A");
        s.who(&bb, "B");
        let root = s.root(&format!("line {line}/root, by A"), &a, terms(signers(&[&a, &bb])).set(tk::CONDITION, k4(cond.clone())));
        let b1 = s.assent(&format!("line {line}/B's assent"), &bb, &root, &root);
        let v2 = s.version(&format!("line {line}/v2, by A, naming only the root"), &a, &root, &root, terms(signers(&[&a, &bb])).set(tk::CONDITION, k4(cond)));
        s.note(&format!("line {line}/A's next act, after v2, naming B's assent"), &a, &root, &root, &[b1]);
        s.note(&format!("line {line}/B's next act"), &bb, &root, &root, &[]);
        (s, root, v2)
    };
    {
        let (s, root, v2) = unordered("27", arr(vec![u(0), u(1)]));
        let st = || vec![asked("K4", stub::K4, "the root's condition, of v2 (one of A and B)", "valid: A's Terms act")];
        out.cases.push(case("27", "version 2 valid by a condition stub, its only gate act (A's Terms act) naming nothing of B's assent to version 1: valid, and not shown as in force, no order shown", "5.5.1", vec![Q_557D, Q_551_TWO, Q_551B, Q_551B_EITHER], rs(&[R_VALID_TWO, R_C3]), vec![], s.clone(), "update", vec![v2], st(), ans("valid", "5.5.7(d)", "as shown", "the condition answers valid"), vec![ans("not shown", "5.5.1", "as shown", "no order is shown: neither v2 nor an act that put it through the gate is shown after B's assent to the root")], None));
        out.cases.push(case("27", "the same: which Terms are in force: version 1", "5.5.1, 5.5.3", vec![Q_551B, Q_551_TWO], rs(&[R_VALID_TWO, "the root in force, as shown: A's later act (after v2) names B's assent, B's later act follows his"]), vec![], s, "last_version", vec![root], st(), ans("in force", "5.5.3", "as shown", "the root stays in force: v2 is not shown after its completing assents").who(&root), vec![], None));
        let (s, _root, v2) = unordered("45", arr(vec![u(2)]));
        out.cases.push(case("45", "a condition stub answering valid always; version 1 in force; version 2 not yet shown after version 1's acts: valid, the condition named; not shown as in force", "5.5.7(d), 5.5.1", vec![Q_557D, Q_551_TWO], rs(&[R_VALID_TWO]), vec![], s, "update", vec![v2], vec![asked("K4", stub::K4, "the root's condition, of v2", "valid: always")], ans("valid", "5.5.7(d)", "as shown", "the condition (the K4 stub, always) answers valid"), vec![ans("not shown", "5.5.1", "as shown", "no order is shown")], None));
    }
    {
        let mut s = Sc::new();
        s.who(&a, "A");
        s.who(&bb, "B");
        let cond = arr(vec![u(0), u(1)]);
        let root = s.root("line 28/root, by A", &a, terms(signers(&[&a, &bb])).set(tk::CONDITION, k4(cond.clone())));
        let b1 = s.assent("line 28/B's assent", &bb, &root, &root);
        s.note("line 28/B's next act", &bb, &root, &root, &[]);
        let v2b = s.version("line 28/v2b, by A, naming only the root", &a, &root, &root, terms(signers(&[&a, &bb])).set(tk::CONDITION, k4(cond.clone())));
        s.note("line 28/A's next act, after v2b, naming B's assent", &a, &root, &root, &[b1]);
        let v2a = s.version("line 28/v2a, by B, after B's acts", &bb, &root, &root, terms(signers(&[&a, &bb])).set(tk::CONDITION, k4(cond)));
        let _ = (v2a, v2b);
        out.cases.push(case("28", "two updates of version 1, both valid by a condition stub (one known party), one (by B) shown after version 1's acts, the other (by A) not, neither naming the other: fork", "5.5.1, 5.5.4", vec![Q_551_FORK, Q_551B_ORDER], rs(&[R_GATE_PIN, "the ledger, \"A fork is a fork\" (27 November, 07:01–07:08)"]), vec![], s, "last_version", vec![root], vec![asked("K4", stub::K4, "the root's condition, of v2a and of v2b", "valid for each: its Terms act")], ans("fork", "5.5.4", "as shown", "both pass the gate, and neither is shown after the acts that put the other through it; the root stays in force").who(&root), vec![], None));
    }
    {
        let mut s = Sc::new();
        let t = two(&mut s, "line 29", &a, &bb, P::new());
        s.anchoring = Some(AnchorT { id: g("line 29/the reader's own anchoring"), label: "an anchoring of the reader's own choosing (test)".into(), order: vec![t.root, t.b1, t.anote, t.bnote] });
        out.cases.push(case("29", "no keeper named; the reader holds an anchoring of its own: in force, as shown; the reader's answer beside it, named as the reader's", "5.5.3, 5.13.5", vec![Q_5135_READER, Q_541_KNOTS], rs(&[R_C31, R_C9]), vec![], s, "in_force", vec![t.root], vec![], ans("in force", "5.4.1", "as shown", PINNED), vec![ans("in force", "5.4.1", "per anchoring", "the reader's own answer, named as the reader's, beside the Terms' answer and never in its place")], None));
    }
    // lines 30, 31, 33, 34, 35: v1 with a condition (one known party); v2 by A, in force.
    let base = |s: &mut Sc, l: &str| -> (Two, Hash) {
        let t = two(s, l, &a, &bb, P::new().set(tk::CONDITION, k4(arr(vec![u(0), u(1)]))));
        let v2 = s.version(&format!("{l}/v2, by A"), &a, &t.root, &t.root, terms(signers(&[&a, &bb])).set(tk::CONDITION, k4(arr(vec![u(0), u(1)]))));
        (t, v2)
    };
    let k4_both = || vec![asked("K4", stub::K4, "the root's condition, of v2 and of v3 (one of A and B)", "valid for each: its Terms act")];
    {
        let mut s = Sc::new();
        let (t, _v2) = base(&mut s, "line 30");
        let text = s.make("line 30/A's Text act, after v2 (its prev v2)", &a, v::text_11(), 0, v::text_payload("A note of A's, after v2 (test)."), true);
        let v3 = s.version("line 30/v3, by B, replacing v1, relying on A's Text act", &bb, &t.root, &t.root, terms(signers(&[&a, &bb])).set(tk::CONDITION, k4(arr(vec![u(0), u(1)]))).set(tk::RELIES_ON, arr(vec![b(&text)])));
        out.cases.push(case("30", "version 3 names version 1, version 2 having replaced it; v3's `relies_on` names a Text act held, whose `prev` (its signer's sequence) names v2: late, as shown", "5.5.4", vec![Q_554_LATE, Q_554_KNOTS, Q_5131_PREV, Q_554C_LATE], rs(&[R_KNOTS, R_F6, R_C46B]), vec![], s, "update", vec![v3], k4_both(), ans("late", "5.5.4", "as shown", "v3 is shown after v2, which is all F needs to pass v1's gate: v3 names the Text act, whose `prev` names v2"), vec![], None));
    }
    {
        let mut s = Sc::new();
        let (t, v2) = base(&mut s, "line 31");
        let w2 = s.names.iter().find(|(_, n)| n.as_str() == "line 31/v2, by A/its words").map(|(h, _)| *h).unwrap();
        let v3 = s.version("line 31/v3, by B, replacing v1, relying on v2's words", &bb, &t.root, &t.root, terms(signers(&[&a, &bb])).set(tk::CONDITION, k4(arr(vec![u(0), u(1)]))).set(tk::RELIES_ON, arr(vec![b(&w2)])));
        let _ = v2;
        out.cases.push(case("31", "the same, v3's `relies_on` naming the Text act that v2's `body` names: that shows v3 after v2's words, not after v2; neither update shown after the other: a fork", "5.5.4, 5.13.3", vec![Q_5133_NEVER, Q_554_FORK, Q_551_FORK], rs(&[R_KNOTS]), vec![], s, "update", vec![v3], k4_both(), ans("fork", "5.5.4", "as shown", "v3 and v2 both pass v1's gate; v3 is shown after v2's words, which v2 names, and that shows no order between v2 and v3"), vec![], Some("the sheet: late, as shown; a knot to the words v2's `body` names shows v3 after those words, never after v2 (5.13.3): no order between the two updates, a fork")));
    }
    out.waiting.push(Waiting {
        what: "line 32 (5.5.4, 5.13.3): line 30's story with the work declared as a piece".into(),
        why: "waiting: the format carries no `pieces` (an act held only as a piece), and whether a Text act handed only as a piece is held is not settled (the sheet's question 46, part 1's \"a Text act handed only as a piece\"; the lead's row C43, \"a piece held names nothing\", is for a piece as such)".into(),
    });
    {
        let mut s = Sc::new();
        let (t, _v2) = base(&mut s, "line 33");
        s.make("line 33/A's private Text act, after v2", &a, v::text_11(), 0, v::text_payload("A private note of A's, after v2 (test)."), false);
        let p = s.acts.last().unwrap().id;
        s.acts.last_mut().unwrap().key = None;
        s.names.insert(p, "line 33/A's private Text act, after v2 (held without its key)".into());
        let _v3 = s.version("line 33/v3, by B, replacing v1, relying on the private act", &bb, &t.root, &t.root, terms(signers(&[&a, &bb])).set(tk::CONDITION, k4(arr(vec![u(0), u(1)]))).set(tk::RELIES_ON, arr(vec![b(&p)])));
        out.cases.push(case("33", "the same, v3's `relies_on` naming a private act held without its key: what it names cannot be read, so whether v3 is late, and which Terms are in force from v1 on, are unchecked", "5.5.4(c)", vec![Q_554C_MISSING, Q_571_PRIVATE], rs(&[R_MISSING]), vec![], s, "last_version", vec![t.root], k4_both(), ans("unchecked", "5.5.4", "none", "the act that could show v3 late (its fields, its `prev`) is held and cannot be opened"), vec![], None));
    }
    {
        let mut s = Sc::new();
        s.who(&c, "C");
        let t = two(&mut s, "line 34", &a, &bb, P::new().set(tk::CONDITION, k4(arr(vec![u(0), u(1)]))));
        let v2 = s.version("line 34/v2, by A, its own in_force asking C", &a, &t.root, &t.root, terms(signers(&[&a, &bb])).set(tk::CONDITION, k4(arr(vec![u(0), u(1)]))).set(tk::IN_FORCE, stub_socket(stub::K2, arr(vec![who_signer(&c.id)]))));
        let v3 = s.version("line 34/v3, by B, replacing v1, relying on v2", &bb, &t.root, &t.root, terms(signers(&[&a, &bb])).set(tk::CONDITION, k4(arr(vec![u(0), u(1)]))).set(tk::RELIES_ON, arr(vec![b(&v2)])));
        out.cases.push(case("34", "a late update shown by knots (v3 names v2) where the update that came first, v2, is valid and not in force by its own `in_force` (left unread): late", "5.5.4, 5.5.1", vec![Q_554_LATE, Q_551_OWN_IN_FORCE, Q_554C_LATE], rs(&[R_C46B, R_C3]), vec![], s, "update", vec![v3], k4_both(), ans("late", "5.5.4", "as shown", "v3 names v2, the act enough for v2 to pass v1's gate; v2's own `in_force` is unread"), vec![], None));
    }
    {
        let mut s = Sc::new();
        s.who(&buyer, "U");
        let (t, v2) = base(&mut s, "line 35");
        let claim = mor_core::money::Payload::Claim(mor_core::money::Claim {
            rail: g("a rail Module (stand-in)"),
            proof: g("a rail's proof (stand-in)").to_vec(),
            payee: a.id,
            amount: mor_core::money::Amount { unit: g("a unit (stand-in)"), value: 10 },
            fulfils: v2,
            disagrees: None,
            referral: None,
            refund: None,
            purchase: None,
            previous: None,
        });
        let payload = P(claim.to_map().into_iter().map(|(k, val)| (if let Value::Uint(k) = k { k } else { unreachable!() }, val)).collect());
        let pay = s.make("line 35/U's payment (a Money claim), naming v2", &buyer, v::file_hash(v::MONEY_FILE), claim.type_(), payload, true);
        let v3 = s.version("line 35/v3, by B, replacing v1, relying on the payment", &bb, &t.root, &t.root, terms(signers(&[&a, &bb])).set(tk::CONDITION, k4(arr(vec![u(0), u(1)]))).set(tk::RELIES_ON, arr(vec![b(&pay)])));
        out.cases.push(case("35", "v3's `relies_on` names a payment (a Money claim) whose own field (`fulfils`) names v2: late, as shown, by a knot across layers", "5.5.4", vec![Q_554_LATE, Q_554_KNOTS, Q_554C_LATE], rs(&[R_KNOTS, R_C25]), vec![], s, "update", vec![v3], k4_both(), ans("late", "5.5.4", "as shown", "v3 names the payment, whose field names v2: v3 is shown after v2"), vec![], None));
    }
    out.waiting.push(Waiting {
        what: "line 36 (5.13.1): v3's `relies_on` names an Identity witness act whose own field names B's assent to v2".into(),
        why: "waiting: the witness act's bytes are Identity's (rule 10); this builder writes none. The answer (late, as shown) rests on the text and the lead's row C25; written once the builder writes a witness act".into(),
    });
    {
        let k = keeper_id("K");
        let mut s = Sc::new();
        s.who(&a, "A");
        s.who(&bb, "B");
        let root = s.root("line 37/root, by A, keeper K", &a, terms(signers(&[&a, &bb])).set(tk::KEEPER, keepers(&[k])));
        let b1 = s.assent("line 37/B's assent", &bb, &root, &root);
        let v2 = s.version("line 37/v2, by B", &bb, &root, &root, terms(signers(&[&a, &bb])).set(tk::KEEPER, keepers(&[k])));
        let a2 = s.assent("line 37/A's assent to v2", &a, &root, &v2);
        let v3 = s.version("line 37/v3, by A, replacing v1, its previous A's assent to v2", &a, &root, &root, terms(signers(&[&a, &bb])).set(tk::KEEPER, keepers(&[k])));
        let b3 = s.assent("line 37/B's assent to v3", &bb, &root, &v3);
        s.keeper("K", "live", vec![vec![root, b1, v2, v3, a2, b3]]);
        out.cases.push(case("37", "v1 names keeper K, whose record places v3 before A's assent to v2, while v3's `previous` names that assent: not shown, the keeper contradicts the acts, the record kept as evidence", "5.5.4(c), 5.8.4", vec![Q_554C_KEEPER], rs(&[R_C28]), vec![5, 6, 7], s, "update", vec![v3], vec![], ans("not shown", "5.5.4", "per keeper", "K's record places v3 (position 4) before A's assent to v2 (position 5), which v3 names: the keeper contradicts the acts; the record is kept as evidence").not_showing(&[k]), vec![], None));
    }
    {
        let mk = |held: bool, l: &str| -> (Sc, Hash) {
            let mut s = Sc::new();
            s.who(&m, "M");
            s.who(&buyer, "U");
            let spot = if held { stub_socket(stub::K5, arr(vec![arr(vec![b(&buyer.id)]), Value::Bool(true)])) } else { socket(&g("a spot cMIP not held"), Value::Null) };
            let role = v::party_role(Some(0), Some(&g("what: a deed (stand-in)")), Some(spot));
            let t = || P::new().set(tk::PARTIES, arr(vec![v::party_signer(&m.id), role.clone()])).set(tk::AUTHORS, arr(vec![u(0)])).set(tk::IN_FORCE, stub_socket(stub::K2, arr(vec![who_signer(&m.id)])));
            let root = s.root(&format!("{l}/offer v1, by M"), &m, t());
            s.note(&format!("{l}/M's next act"), &m, &root, &root, &[]);
            s.assent(&format!("{l}/U's assent to v1"), &buyer, &root, &root);
            let v2 = s.version(&format!("{l}/offer v2, by M alone"), &m, &root, &root, t());
            (s, v2)
        };
        let (s, v2) = mk(true, "line 38");
        out.cases.push(case("38", "an offer with a filled role and no condition, updated by its maker alone, its only known party: valid, by default, and in force", "5.5.5(a), 5.5.7(e)", vec![Q_555A, Q_557E], rs(&[R_UNKNOWN]), vec![], s, "update", vec![v2], vec![asked("K2", stub::K2, "the offer v1's in_force (M's)", "yes: M's Terms act")], ans("valid", "5.5.7(e)", "as shown", "by default: M, the original's only known party, signs it (its Terms act); U fills a role and is not among the default signers"), vec![ans("in force", "5.5.1", "as shown", "v2 is shown after M's Terms act (its `previous`, M's next act), the assent v1's `in_force` requires")], None));
        let (s, v2) = mk(false, "line 39");
        out.cases.push(case("39", "the same, the role's K5 cMIP not held, U's assent to the original held: valid, by default (the default asks no one who fills a role)", "5.5.5(a), 5.5.7(e)", vec![Q_555A, Q_557E], rs(&[R_UNKNOWN]), vec![], s, "update", vec![v2], vec![asked("K2", stub::K2, "the offer v1's in_force (M's)", "yes")], ans("valid", "5.5.7(e)", "as shown", "by default: M signs it; whoever fills the role is never among the default signers, so the spot's cMIP is not needed"), vec![ans("in force", "5.5.1", "as shown", "as line 38")], Some("the sheet: \"valid, where today unchecked\": the same answer")));
    }
    {
        let mut s = Sc::new();
        s.who(&a, "A");
        s.who(&bb, "B");
        let j = tid("J");
        s.who(&j, "J");
        let x = s.root("line 40/the co-op x, by J", &j, terms(signers(&[&j])));
        let parties = vec![v::party_signer(&a.id), v::party_signer(&bb.id), arr(vec![u(2), b(&x)])];
        let y = s.root("line 40/Y, by A, naming A, B and x", &a, terms(parties.clone()));
        let b1 = s.assent("line 40/B's assent to Y", &bb, &y, &y);
        s.note("line 40/A's next act, naming B's assent", &a, &y, &y, &[b1]);
        s.note("line 40/B's next act", &bb, &y, &y, &[]);
        let v2 = s.version("line 40/Y v2, by A", &a, &y, &y, terms(parties));
        s.assent("line 40/B's assent to Y v2", &bb, &y, &v2);
        out.cases.push(case("40", "Terms naming the co-op x as a party, x never having signed; an update signed by every signer: not shown, x's signing lacking, never not valid", "5.5.5(a), 5.5.7(e)", vec![Q_555A_AGREEMENT, Q_557E, Q_544], rs(&[R_C14]), vec![], s, "update", vec![v2], vec![], ans("not shown", "5.5.5(c)", "as shown", "by default every known party of the original signs; x, a party named as an agreement, is one and has not signed"), vec![], None));
    }
    {
        let mut s = Sc::new();
        let t = two(&mut s, "line 41", &a, &bb, P::new());
        let v2a = s.version("line 41/v2a, by A", &a, &t.root, &t.root, terms(signers(&[&a, &bb])));
        s.assent("line 41/B's first assent, to v2a", &bb, &t.root, &v2a);
        let v2b = s.version("line 41/v2b, by A, its previous v2a", &a, &t.root, &t.root, terms(signers(&[&a, &bb])));
        s.assent("line 41/B's second assent, to v2b, naming his first in previous", &bb, &t.root, &v2b);
        out.cases.push(case("41", "B's two assents to two updates of one version, the second naming the first in `previous`: the second update is late (every choice of acts for its gate holds B's second assent, shown after v2a and B's first)", "5.5.5(a), 5.5.4(a)", vec![Q_555A_KNOT, Q_554_LATE, Q_554C_LATE], rs(&[R_F3, R_C17, PINNED]), vec![], s, "update", vec![v2b], vec![], ans("late", "5.5.4", "as shown", "B's assent to v2b names his assent to v2a, which with v2a put v2a through the root's gate"), vec![], None));
    }
    {
        let mut s = Sc::new();
        let t = two(&mut s, "line 42", &a, &bb, P::new());
        let v2a = s.version("line 42/v2a, by A", &a, &t.root, &t.root, terms(signers(&[&a, &bb])));
        let v2b = s.version("line 42/v2b, by A", &a, &t.root, &t.root, terms(signers(&[&a, &bb])));
        let ba = s.st_raw("line 42/B's assent to v2a, previous his next act", &bb, v::statement(&t.root, &v2a, v::kind::ASSENT, Some(&t.bnote)));
        let bbb = s.st_raw("line 42/B's assent to v2b, the same previous", &bb, v::statement(&t.root, &v2b, v::kind::ASSENT, Some(&t.bnote)));
        let _ = (ba, bbb);
        out.cases.push(case("42", "two assents of B, each to a different update of one version, both naming the same `previous`: B's line forks", "5.7.2", vec![Q_572, Q_555A_FORKED], rs(&[R_C46C]), vec![], s.clone(), "line", vec![bb.id, t.root], vec![], ans("fork", "5.7.2", "as shown", "two acts of B within the agreement name the same `previous`"), vec![], None));
        out.cases.push(case("42", "the same: neither assent counts for any update's gate, so v2a does not pass it by default: not shown as a replacement, never not valid", "5.5.5(a), 5.5.7(e)", vec![Q_555A_FORKED, Q_557E, Q_555C], rs(&[R_C46C]), vec![], s, "update", vec![v2a], vec![], ans("not shown", "5.5.5(c)", "as shown", "B's assent to v2a is a tip of his line's fork and does not count for the gate; an assent may yet exist"), vec![], None));
    }
    {
        let (k1, k2) = (keeper_id("K1"), keeper_id("K2"));
        let mut s = Sc::new();
        s.who(&a, "A");
        s.who(&bb, "B");
        let root = s.root("line 43/root, by A, keepers K1 and K2", &a, terms(signers(&[&a, &bb])).set(tk::KEEPER, keepers(&[k1, k2])));
        let b1 = s.assent("line 43/B's assent", &bb, &root, &root);
        let v2 = s.version("line 43/v2, by A", &a, &root, &root, terms(signers(&[&a, &bb])).set(tk::KEEPER, keepers(&[k1, k2])));
        let b2 = s.assent("line 43/B's assent to v2", &bb, &root, &v2);
        s.keeper("K1", "live", vec![vec![root, b1, v2, b2]]);
        s.keeper("K2", "live", vec![vec![root, b1]]);
        out.cases.push(case("43", "the original names two keepers (K9 empty); K1 shows the update and B's assent to it, K2's record is held without them: the update is not shown, per keeper, K2 named; it is no update of the original while K2 does not show it", "5.5.1(a), 5.8.3", vec![Q_551A_KEEPERS, Q_533_DEFAULT, Q_533_UNTIL], rs(&[R_KEEPER_GATE, R_BOTH_KEEPERS, R_CROSS, R_P7_1]), vec![5, 6, 7, 15], s, "update", vec![v2], vec![], ans("not shown", "5.5.1", "per keeper", "the gate counts only the assents every keeper named shows; K2 does not yet show v2 or B's assent to it").counted(&[k1]).not_showing(&[k2]), vec![], None));
        let (s, _root, v2a, _v2b, k1, k2) = disagree("43");
        out.cases.push(case("43", "the original names two keepers (K9 empty) that give contrary orders to two updates' gates: not shown, the keepers disagree, both records kept", "5.8.3", vec![Q_533_DISAGREE], rs(&[R_C46D, R_CROSS]), vec![5, 6, 7, 15], s, "update", vec![v2a], vec![], ans("not shown", "5.8.3", "per keeper", "K1 places v2a's gate first, K2 v2b's; under the default there is no answer for what they disagree on; both records shown as evidence").not_showing(&[k1, k2]), vec![], None));
    }
    {
        let mut s = Sc::new();
        s.who(&hana, "H");
        let t = two(&mut s, "line 44", &a, &bb, P::new());
        let v2 = s.version("line 44/v2, by A, adding H as a signer", &a, &t.root, &t.root, terms(signers(&[&a, &bb, &hana])));
        s.assent("line 44/B's assent to v2", &bb, &t.root, &v2);
        s.assent("line 44/H's assent to v2", &hana, &t.root, &v2);
        let v3 = s.version("line 44/v3, by A", &a, &t.root, &v2, terms(signers(&[&a, &bb, &hana])));
        s.assent("line 44/B's assent to v3", &bb, &t.root, &v3);
        out.cases.push(case("44", "version 2, signed by A and B, adds H as a signer, and H assents; version 3 signed by A and B alone: not shown, H's assent lacking", "5.5.5(a), 5.5.7(e)", vec![Q_KNOWN, Q_555A_NEW, Q_557E], rs(&[R_DANA]), vec![], s, "update", vec![v3], vec![], ans("not shown", "5.5.5(c)", "as shown", "H, named by v2 as a signer, is a known party of v2, the original, and has not assented to v3"), vec![], None));
    }
}
