//! Part 4 (a) and (g) of stage one, session 2: verifier 2's 120 grammar
//! cases (`core/vectors/agreements-new/grammar.json`), by the sheet's
//! sections 4.1 to 4.3 (`docs/code/impact-draft-26.md`): each rewritten in
//! the bytes of encoding 3 (its answer kept, or changed), retired (with the
//! rule that retires it), or waiting (the 15 cases of G14, and three about
//! reports). Every answer is read from draft 26 at b58e417, with the ledger
//! and the lead's notes, quoted; never from code, never from the sheet's
//! prediction.
//!
//! One change runs through every case: the Terms act is its signer's assent
//! (§4.3, **An author's first act**), so verifier 2's separate assent by the
//! signer of the Terms to those Terms is not written again. Where that
//! assent was the signer's only later act, the first version is no longer
//! pinned by knots (5.4.1), and the answer changes: the acts of the story
//! are kept as they were, and the positive versions are the sheet's new
//! lines, written elsewhere.

use super::*;

// ---------------------------------------------------------------- quotations (draft 26 at b58e417, word for word)

const Q_541_FIRST: &str = "draft 26, 5.4.1: \"A first version comes into force when the assents its `in_force` rule requires are present (task K2).\"";
const Q_541_DEFAULT: &str = "draft 26, 5.4.1: \"Where it carries no `in_force`, it comes into force when there is an assent to it in the name of every party it names as a signer, the Terms act itself being its signer's (§4.3).\"";
const Q_541_KNOTS: &str = "draft 26, 5.4.1: \"Where it names none, knots show it: each party in whose name one of those assents is counted has made an act in that same name within the agreement (a Terms act or a Statement of that agreement, and no other knot) that is shown after every one of those assents (§5.13).\"";
const Q_541_NOT_YET: &str = "draft 26, 5.4.1: \"Until then it is not yet in force: a verifier answers **not shown** for it as in force, with that reason, no order being shown.\"";
const Q_541_UNCHECKED: &str = "draft 26, 5.4.1: \"Where an act named in a field of an act held is not held, and could be the later act of a party whose act the pin needs, the pin is **unchecked** (5.13.3).\"";
const Q_541_PIN_CS: &str = "draft 26, 5.4.1: \"Any such act pins, a counter signature included: a counter signature so shown is late, and cancels nothing (5.4.5)\"";
const Q_541_KEEPERS: &str = "draft 26, 5.4.1: \"Where it names keepers, they show it, as many of them as 5.8.3 asks, at the positions they give those assents, and an act they do not yet show is not yet placed (§3.4).\"";
const Q_541_REQUIRED: &str = "draft 26, 5.4.1: \"Those assents are the ones its `in_force` rule requires, as K2 names them, or the default's; not every assent counted.\"";
const Q_AUTHOR: &str = "draft 26, §4.3, **An author's first act**: \"The act that publishes Terms is its signer's assent to them: it is the assent counted in that signer's name, and the signer does not assent to them again.\"";
const Q_543_NOT: &str = "draft 26, 5.4.3: \"otherwise **not shown**, with the reason (those Terms are not yet in force, no order being shown; they have been replaced; they are a tip of a fork, or a late update; the assent is cancelled, 5.4.5)\"";
const Q_543_SHOWN: &str = "draft 26, 5.4.3: \"About an assent, a verifier answers **shown** where it is counted in a party's name and those Terms are in force\"";
const Q_543_BINDS: &str = "draft 26, 5.4.3: \"An assent binds its signer only while the Terms it names are in force\"";
const Q_5134_NAMES: &str = "draft 26, 5.13.4: \"An act that names another, directly or through acts that name it, came after it.\"";
const Q_5134_NONE: &str = "draft 26, 5.13.4: \"Between two acts of which neither so names the other, no order is shown from the acts alone.\"";
const Q_TASK_LACK: &str = "draft 26, §3.6: \"where it lacks the cMIP, the answer is **unchecked**.\"";
const Q_UNCH: &str = "draft 26, §3.6: \"**Unchecked**: the verifier lacks something it needs to apply a grammar rule: a cMIP the Terms name, an act named in a field that it does not hold, or a keeper's record that it does not hold.\"";
const Q_557E: &str = "draft 26, 5.5.7(e): \"A verifier answers **valid**, with the words \"by default\", where an assent to the update in the name of each of them is held, the update's own Terms act being its signer's (§4.3); where one is lacking it answers **not shown** for the update as a replacement (5.5.5(c)), and never **not valid**: the missing assent may exist.\"";
const Q_557E_DEF: &str = "draft 26, 5.5.7(e): \"Where Terms name no update condition, an update is valid when every known party of those Terms signs it (5.5.5(a)): the author among them, and never a signer who fills a role.\"";
const Q_551_TWO: &str = "draft 26, 5.5.1: \"A verifier then gives two answers: **valid** for it, and **not shown** for it as in force, with the reason: no order is shown, it is a tip of a fork, or the version it names is not in force.\"";
const Q_557D: &str = "draft 26, 5.5.7(d): \"Where the cMIP answers valid, the verifier answers **valid**, named and qualified in the same way.\"";
const Q_557C: &str = "draft 26, 5.5.7(c): \"Where the cMIP answers not valid, the proposed update does not pass the gate, and replaces nothing, whoever signed it (5.5.5)\"";
const Q_553: &str = "draft 26, 5.5.3: \"Which Terms of an agreement are in force is an answer about what is latest.\"";
const Q_552: &str = "draft 26, 5.5.2: \"Terms stop being in force when an update that replaces them is in force (5.5.1).\"";
const Q_561C: &str = "draft 26, 5.6.1(c): \"the act is a Terms act that replaces Terms by which they are bound as a known party (§3.2), and it passes the gate and the pin of those Terms (5.5.1) (5.6.2).\"";
const Q_562: &str = "draft 26, 5.6.2: \"No power makes a Terms act replace, and no power binds a party to one: `powers` has no sort `replaces`.\"";
const Q_562_UNREAD: &str = "draft 26, 5.6.2: \"An entry of `powers` of that sort gives no power; a verifier says that it left it unread (5.2.3).\"";
const Q_523_SAYS: &str = "draft 26, 5.2.3: \"A verifier says of each that it left it unread.\"";
const Q_554E_FORK: &str = "draft 26, 5.5.4(e): \"A verifier MUST answer **fork** for which Terms replace the version both tips name, show both tips, and MUST NOT choose between them, by position or in any other way.\"";
const Q_554E_STAY: &str = "draft 26, 5.5.4(e): \"until the fork is resolved (§5.12), neither is in force, nothing built on either counts, and the Terms both replace, the last shared version, stay in force.\"";
const Q_554E_SHOW: &str = "draft 26, 5.5.4(e): \"It MUST show the fork with each such answer, per keeper or as shown.\"";
const Q_554_FORK: &str = "draft 26, 5.5.4: \"Where two Terms acts each name the same version in `replaces`, each passes that version's gate (5.5.1(a)), and neither is shown after the other, they are a fork (§5.12)\"";
const Q_514_FORK: &str = "draft 26, 5.1.4: \"while a fork of its Terms stands, the receiver is the one named by the Terms both branches replace, and the verifier MUST show the fork with that answer and MUST NOT choose a branch (§5.5).\"";
const Q_5124_RES: &str = "draft 26, 5.12.4: \"A resolving update of Terms that resolves is an update of the shared Terms and takes an update's answers: **valid**, by their update condition or its default, and **in force** once pinned (§5.5)\"";
const Q_5124_CONT: &str = "draft 26, 5.12.4: \"The tip it names in `continues` then counts as the next act of the line, what is built on that tip counts as these grammar rules read it, and the line goes on from that branch.\"";
const Q_5124_ASIDE: &str = "draft 26, 5.12.4: \"Every other tip is set aside (§3.3, **Set aside**), and no act that follows it in the line counts.\"";
const Q_5124_NOFORK: &str = "draft 26, 5.12.4: \"An act that names `resolves` and does not in fact resolve the fork it sits in (it is not signed as this rule asks, or does not name every tip, or there is no fork: what it names in `resolves` is one update and no other) is an act like any other, and may itself be a tip: a fork is not hidden by adding the field.\"";
const Q_5124_LINE: &str = "draft 26, 5.12.4: \"A resolving update in one signer's line that resolves is answered **shown**, naming this rule.\"";
const Q_5124_NONE: &str = "draft 26, 5.12.4: \"Where the two tips of a signer's line both name no `previous`, a resolving update that also names none resolves them.\"";
const Q_571_PREV: &str = "draft 26, 5.7.1: \"Every act within an agreement MUST name in `previous` its signer's previous act within the same agreement, or none if it is the signer's first.\"";
const Q_5126_PAY: &str = "draft 26, 5.12.6: \"A payment that names a version of that branch is read as if the tip had stood alone: its receiver is read from that version (5.1.4), and both are shown as disputed.\"";
const Q_5128: &str = "draft 26, 5.12.8: \"Two that continue different tips are themselves a fork: two updates of the same shared act. Neither resolves the first fork while the other stands\"";
const Q_5125: &str = "draft 26, 5.12.5: \"Its answer about it is **shown**, naming this rule, the power and its rule's answer, and the signer: the update condition is not asked of it (5.5.7(g)), so it is neither valid nor not valid.\"";
const Q_5125_LINE: &str = "draft 26, 5.12.5: \"For a fork in one signer's line too, it is an entry of `powers` of sort `resolves`, in Terms by which that signer is bound: a power to make that act for the signer (5.6.1(b))\"";
const Q_554A: &str = "draft 26, 5.5.4(a): \"Where O names no keeper, L is shown after O was replaced, by knots, where L is shown after acts enough for F to pass O's gate, or, for a resolving update, to resolve (§5.12); or where no choice of acts enough for L to pass O's gate avoids an act so shown.\"";
const Q_554C: &str = "draft 26, 5.5.4(c): \"About L, a verifier answers **late**, names this rule and what shows that L came late\"";
const Q_554_GOES: &str = "draft 26, 5.5.4: \"O stays replaced by F, and the line goes on from F as if L were not there.\"";
const Q_554C_MISSING: &str = "draft 26, 5.5.4(c): \"where the acts that could show L late need an act that is named in a field of an act held, and the verifier does not hold it, whether L is late is **unchecked** (§3.6, §5.13), and so is which Terms are in force from O on (5.5.5(e)).\"";
const Q_554B: &str = "draft 26, 5.5.4(b): \"L came after O was replaced, per those keepers, where the first position at which, counting only the acts they show at or before it, L passes O's gate comes after the first position at which, so counted, F passes O's gate (§5.8); a verifier gives that **per keeper**.\"";
const Q_545_FOLLOWS: &str = "draft 26, 5.4.5: \"Made by the signer of the assent in their own name, it follows that assent in the signer's own line (§5.7): directly, or after other acts of that signer.\"";
const Q_545_CANCEL: &str = "draft 26, 5.4.5: \"It cancels that assent, and no one else's: an assent so cancelled is not counted by 5.4.1.\"";
const Q_545_BEFORE: &str = "draft 26, 5.4.5: \"where, counting every act held but those shown after the counter signature, the Terms would not come into force, it came before, and the assent it cancels is not counted.\"";
const Q_545_LATE: &str = "draft 26, 5.4.5: \"where the counter signature is shown after acts enough for the Terms to come into force (5.4.1, its first sentence), it is late, and changes nothing\"";
const Q_545_FORK: &str = "draft 26, 5.4.5: \"Otherwise the counter signature and the acts that would put the Terms in force are a fork (§5.12): two acts competing to change the same state, with no order shown.\"";
const Q_545_FORK2: &str = "draft 26, 5.4.5: \"While it stands, neither takes effect: the Terms are not in force. A verifier answers **fork**, shows both, and MUST NOT choose between them\"";
const Q_545_NOTSHOWN: &str = "draft 26, 5.4.5: \"**not shown** means that it is not shown as cancelling (it is late and changes nothing, or it follows no assent), with the reason\"";
const Q_545_SHOWN: &str = "draft 26, 5.4.5: \"About a counter signature, **shown** means that it cancels the assent it is read against\"";
const Q_572: &str = "draft 26, 5.7.2: \"Two acts by one signer within one agreement that name the same `previous` (or that both name none) are a fork, whatever else orders them\"";
const Q_5123: &str = "draft 26, 5.12.3: \"While a fork stands, neither tip counts as the next act of its line, and nothing built on either tip counts\"";
const Q_561B_INFORCE: &str = "draft 26, 5.6.1(b): \"its `under` names Terms by which they are bound and which were in force when the act was made, as 5.6.4 places it (§5.5)\"";
const Q_561A: &str = "draft 26, 5.6.1(a): \"they signed it in their own name\"";
const Q_563: &str = "draft 26, 5.6.3: \"An act with no `for` and no `under` is made in its signer's own name only.\"";
const Q_564: &str = "draft 26, 5.6.4: \"they are bound by the act if it was made before the Terms that replace those were in force, and not bound if it was made after.\"";
const Q_571_UNCH: &str = "draft 26, 5.7.1: \"Where `previous` names nothing the verifier holds, the act counts, and the verifier shows that signer's line as **unchecked** before it.\"";
const Q_571_INVALID: &str = "draft 26, 5.7.1: \"An act whose `previous` names, among the acts held, anything that is not an act of the same signer within the same agreement (an act of another signer, or of another agreement; a report; a payment; any record that is no Terms act and no Statement) is **invalid** (§3.6).\"";
const Q_INVALID_NOTHING: &str = "draft 26, §3.6: \"An invalid act counts for nothing, for anything: no answer of these grammar rules rests on it, and no act counts through it.\"";
const Q_512_SIG: &str = "draft 26, 5.1.2: \"An act is signed by an agreement x when its `for` names x, by its root; its `under` names Terms of x that are in force (§5.5) and give a power for acts of that kind; and that power's rule, applied to the acts held, says yes\"";
const Q_512_ALL: &str = "draft 26, 5.1.2: \"Where x's Terms give no such power, x signs by every one of its signers: one act by each of them, its `for` naming x and its `under` naming x's Terms in force.\"";
const Q_512_ONCE: &str = "draft 26, 5.1.2: \"x has signed once an act so matched is held from every one of its signers\"";
const Q_512_OTHER: &str = "draft 26, 5.1.2: \"Where an act's `for` names an agreement, its `under` MUST name Terms of that agreement: an act made for an agreement under any other Terms is not that agreement's signature.\"";
const Q_544: &str = "draft 26, 5.4.4: \"A party named as an agreement is not counted by the default of 5.4.1.\"";
const Q_544_ASK: &str = "draft 26, 5.4.4: \"An `in_force` rule MAY ask for its signing\"";
const Q_584_PER: &str = "draft 26, 5.8.4: \"A verifier MUST take those answers from the keepers, qualified **per keeper**, with the keepers that counted named, by K9's answer, and the others named as not showing it.\"";
const Q_584_COUNTS: &str = "draft 26, 5.8.4: \"only once it is placed (§3.4), at the position the keepers give it\"";
const Q_533_UNTIL: &str = "draft 26, 5.8.3: \"Until then, a verifier answers **not shown**, with that reason, and names the keepers that do not yet show it.\"";
const Q_533_CONTRA: &str = "draft 26, 5.8.3: \"Where the verifier holds two signed answers of one keeper that contradict each other, that keeper counts as one not showing the act, and the contradiction is shown as evidence (5.8.4)\"";
const Q_514_VER: &str = "draft 26, 5.1.4: \"Whatever a payer, an act or a rule of one agreement gives or owes to an agreement, it gives or owes to that agreement's receiver for the act (§3.2, **Receiver for an act**), read from the version of that agreement that the act names (§5.13).\"";
const Q_514_ANY: &str = "draft 26, 5.1.4: \"any version shown as a version of that agreement serves, in force or not, and whether a filling stood under it is §5.10's.\"";
const Q_514_NOVER: &str = "draft 26, 5.1.4: \"Where that act names no version, a verifier MUST take the receiver from that agreement's Terms in force, per the keepers that agreement's Terms name, qualified **per keeper** with those keepers named, or, where they name none, **as shown** (§5.5, §5.8, §5.13).\"";
const Q_514_PARTY: &str = "draft 26, 5.1.4: \"Where the receiver so named is one of that agreement's own parties, the answer is that party.\"";
const Q_514_NONE: &str = "draft 26, 5.1.4: \"If a version read names no receiver, or names as receiver a signer or a role that is not among its own parties, or the spot named is not filled, or is filled more than once (which of them receives is not said), or an agreement is met a second time on the way, no one receives, and the answer is **not shown**.\"";
const Q_514_STOP: &str = "draft 26, 5.1.4: \"A verifier that stops following receivers from agreement to agreement before a party is reached answers **unchecked**, and says how far it followed (§3.6, §7).\"";
const Q_514_LACK: &str = "draft 26, 5.1.4: \"If the verifier lacks that agreement's acts, it is **unchecked** (§3.6).\"";
const Q_5102: &str = "draft 26, 5.10.2: \"A verifier MUST answer each filling with its proof, each act reported by who signed it (the MICS, §2), qualified per the keepers its own version names, or as shown where that version names none\"";
const Q_5102_READ: &str = "draft 26, 5.10.2: \"A filling already earned is read from the version its proof names, its role and that role's cMIP as that version states them, whatever a later version says of the role (5.10.6)\"";
const Q_5105: &str = "draft 26, 5.10.5: \"Whether a spot still takes new identities is said by its K5 cMIP, applied to the version in force (the role as that version states it), the acts held, and the answers of the keepers and the clock the Terms in force name (5.8.5).\"";
const Q_5105_VER: &str = "draft 26, 5.10.5: \"an offer stops taking new identities, or takes them again, by a new version (§5.5), or by what the version in force itself states in advance (a date, a count), as that cMIP reads them.\"";
const Q_5107: &str = "draft 26, 5.10.7: \"Nothing changes what a filling earned except an assent its holder signs in their own name (5.6.1(a)), whether or not it is counted for the later version, or one made for them under a power they gave in an act of their own\"";
const Q_5107_NAME: &str = "draft 26, 5.10.7: \"A verifier MUST name, with each filling, the version it was earned under, and each later version that changes what it earned, with the assent that rests on\"";
const Q_5112: &str = "draft 26, 5.11.2: \"Terms hold the Control task (K6) where their field `control` names a cMIP (§5.2); or, with that socket empty, where they name as `receiver` one of their own parties (5.1.3) and give a part to any other party\"";
const Q_5112_PART: &str = "draft 26, 5.11.2: \"Whether Terms give a part to a party is read from their words, as the body's cMIP gives them (task K1): a share for any party other than the receiver.\"";
const Q_5112_CALL: &str = "draft 26, 5.11.2: \"A call in Terms that do not hold the task it is attached to is left unread, and the verifier says so (5.2.3).\"";
const Q_5114: &str = "draft 26, 5.11.4: \"Asked which agreements of a sequence carry a call for reports, a verifier answers from their Terms alone (5.11.2), one agreement at a time, per keeper or as shown (5.5.3), and **unchecked** where it lacks them.\"";
const Q_5118_REACH: &str = "draft 26, 5.11.8: \"Whom it reaches follows from what it is made against: the signers of that offer or vow (one level, 5.1.2), and no one else.\"";
const Q_5118_VER: &str = "draft 26, 5.11.8: \"Its `terms` names Terms shown as a version, in force or not, or a tip set aside (then the contest is shown as **disputed**, §5.12); otherwise the contest is **not shown**.\"";
const Q_5118_BUYER: &str = "draft 26, 5.11.8: \"A verifier shows a contest as a buyer's where it holds a payment by the same signer that names the same settlement and the same version; where it holds no such payment, whether the contest is a buyer's is **unchecked** (§3.6).\"";
const Q_523_REL: &str = "draft 26, 5.2.3: \"An entry of `relies_on` that is not a fingerprint is not read, and does not make the Terms invalid; a verifier says that it left it unread.\"";
const Q_531_INVALID: &str = "draft 26, 5.3.1: \"Terms whose `authors` name a party named by role or as an agreement, or one who is not one of their parties, are **invalid**\"";
const Q_521: &str = "draft 26, 5.2.1: \"The `body`, every piece in `relies_on`, and every cMIP named anywhere in a Terms act MUST be named by fingerprint.\"";
const Q_523_BODY: &str = "draft 26, 5.2.3: \"A `body`, or a cMIP in a socket, that is not named by fingerprint makes the Terms **invalid**, under 5.2.1 (§3.6).\"";
const Q_REPORT: &str = "draft 26, §4.3: \"A report (§3.1) is one act type, defined once, in the MICS's report block; every layer's tasks use that one type, and this text uses it and gives it no fields of its own.\"";
const Q_REPORT_READ: &str = "draft 26, 5.11.3: \"How a leg report is read is the MICS's report block's (§2).\"";
const Q_553_READER: &str = "draft 26, 5.5.3: \"A keeper or an anchoring of the reader's own choosing gives an answer only as that reader's, named so: it never gives the Terms' own answer, never puts Terms in force, and never makes an update late (§5.13).\"";
const Q_566A: &str = "draft 26, 5.6.6(a): \"By a version of the Terms that give the power, which ends or narrows it, made as any update of those Terms is: their update condition decides, as its cMIP dictates (5.5.7), or, where they name none, the default (5.5.5(a))\"";
const Q_557E_NOPOWER: &str = "draft 26, 5.5.7(e): \"There is no power for replacement (§5.6): Terms that name no update condition are updated only by their known parties, whatever their `powers` say.\"";

// ---------------------------------------------------------------- readings

const R_HER: &str = "the ledger, \"Publishing the Terms is the publisher's assent\" (27 November, 20:49–20:50): \"Yes, I don’t see the need to have her sign twice\": verifier 2's separate assent by the signer of the Terms, to those Terms, is not written again";
const R_GATE: &str = "the ledger, \"The gate and the pin; a fork, not a race\" (26 November, 17:39–17:46)";
const R_KNOWN: &str = "the ledger, \"Who signs an update by default: the known parties\" (26 November, 17:51–17:56)";
const R_FORK: &str = "the ledger, \"A fork is a fork\" (27 November, 07:01–07:08)";
const R_KNOTS: &str = "the ledger, \"Knots are knots: one reading, \"shown after\"\" (27 November, 07:38–07:49): \"Missing act is always “I don’t know”\"";
const R_VALID: &str = "the ledger, \"Valid and in force, two words, two jobs\" (26 November, 18:00)";
const R_C2: &str = "the lead's note of 27 November (docs/lead/notes/2026-11-27-draft-26-readings.md), row C2: \"Only the assents the agreement's own rule requires; the cMIP in `in_force` names which (K2's output). Not every assent counted.\" The lead's reading";
const R_C3: &str = "the lead's note of 27 November, row C3: \"Either: the update's own knots, or those of the acts that put it through the gate. (ii).\" The lead's reading";
const R_C4: &str = "the lead's note of 27 November, row C4: \"Valid, since the gate asks only whether the rule allows it; in force waits for the original. Two answers, \"valid\" and \"not in force: <reason>\".\" The lead's reading";
const R_C5: &str = "the lead's note of 27 November, row C5: \"An act named and not held leaves the pin unchecked wherever it could be a needed party's later act.\" The lead's reading";
const R_C6: &str = "the lead's note of 27 November, row C6: \"Any version shown as a version of that agreement; whether a filling stood under it is 5.10's.\" The lead's reading";
const R_C7: &str = "the lead's note of 27 November, row C7: \"Valid and in force, as any update.\" The lead's reading";
const R_C12: &str = "the lead's note of 27 November, row C12, F12: \"a contest needs its Terms shown as a version, in force or not.\" The lead's reading";
const R_C17: &str = "the lead's note of 27 November, row C17, F2: \"Together. L is late when no choice of assents enough for L's gate avoids an act shown after acts enough for F's gate.\" The lead's reading";
const R_C20: &str = "the lead's note of 27 November, row C20: \"A Terms act or Statement of that agreement, in that name.\" The lead's reading";
const R_C29: &str = "the lead's note of 27 November, row C29: \"Unchecked, saying how far.\" The lead's reading";
const R_C39: &str = "the lead's note of 27 November, row C39: \"Shown.\" The lead's reading";
const R_C10: &str = "the lead's note of 27 November, row F17, C10: \"grammar case 74 is kept, renamed.\" The lead's reading";
const R_C18: &str = "the lead's note of 27 November, row C18: \"The version `under` names.\" The lead's reading";
const R_P7: &str = "the lead's readings for P2 (docs/lead/notes/2026-11-27-readings-for-p2.md), \"P7's three\", answer 1: \"Not shown where the verifier holds a record of that keeper's without the act; unchecked where it holds none of that keeper's records for it.\" The lead's reading";
const R_P6_4: &str = "the lead's readings for P2, \"P6's four lines\", line 4: \"A keeper whose two signed answers contradict each other counts as one not showing the act, and the contradiction is shown as evidence (5.8.4); the other keepers may still meet the cMIP.\" The lead's reading";
const R_KEEPER: &str = "the ledger, \"An update the keeper never showed is no update\" (27 November, 22:27–22:30): \"To be valid the agreement needs to be checked at the keeper.\"";
const R_PLACE: &str = "the ledger, \"The place vouches for the chaining only\" (26 November, 17:47–17:49), the place renamed keeper there";
const R_UNKNOWN: &str = "the ledger, \"For the unknown party there is no update, only the agreement she signed\" (27 November, 07:53–07:55)";
const R_GIVER: &str = "the ledger, \"The giver bears it, not the agent\" (27 November, 16:50–16:53)";
const R_K5_STUB: &str = "the K5 stub as the framework now gives it: a filling for each assent, to a version naming the role, by a signer its parameters list (test data)";

// ---------------------------------------------------------------- helpers

fn gc(v2: usize, part: &'static str, status: &'static str, name: &str, tests: &'static str, decides: &[&'static str], reading: &[&str], sc: &Sc, ask: &'static str, args: Vec<Hash>, answer: Ans) -> G {
    G {
        name: format!("v2 {v2}: {name}"),
        part,
        v2: Some(v2),
        sheet: None,
        status,
        against_sheet: None,
        tests,
        decides: decides.to_vec(),
        reading: reading.iter().map(|s| s.to_string()).collect(),
        choices: vec![],
        sc: sc.clone(),
        ask,
        args,
        stubs: vec![],
        answer,
        also: vec![],
    }
}

fn ab(s: &mut Sc) -> (Tid, Tid) {
    let a = tid("A");
    let bb = tid("B");
    s.who(&a, "A");
    s.who(&bb, "B");
    (a, bb)
}

fn power(sort: Value, signers: &[&Hash]) -> Value {
    arr(vec![sort, stub_socket(stub::K3, arr(signers.iter().map(|h| b(h)).collect()))])
}

fn role(sort: u64, what: &Hash, spot: Value) -> Value {
    v::party_role(Some(sort), Some(what), Some(spot))
}

fn k5(signers: &[&Hash], takes_new: bool) -> Value {
    stub_socket(stub::K5, arr(vec![arr(signers.iter().map(|h| b(h)).collect()), Value::Bool(takes_new)]))
}

fn k2(names: Vec<Value>) -> Value {
    stub_socket(stub::K2, arr(names))
}

fn with_keeper(mut c: G) -> G {
    c.choices = vec![5, 6, 7];
    c
}

pub fn cases(out: &mut Out) {
    in_force_cases(out);
    update_cases(out);
    fork_cases(out);
    counter_cases(out);
    line_cases(out);
    agreement_party_cases(out);
    bound_cases(out);
    keeper_cases(out);
    receiver_cases(out);
    spot_cases(out);
    leg_cases(out);
    baker_cases(out);
    misc_cases(out);
}

// ================================================================ 0 to 6

fn in_force_cases(out: &mut Out) {
    let mut s = Sc::new();
    let (a, bb) = ab(&mut s);
    let root = s.root("v2/in force/root", &a, terms(signers(&[&a, &bb])));
    out.cases.push(gc(0, "4.1", "rewritten", "in force by the default: the Terms act, A's assent, alone of two signers' is not enough", "5.4.1",
        &[Q_541_DEFAULT, Q_AUTHOR, Q_541_NOT_YET], &[R_HER], &s, "in_force", vec![root],
        ans("not shown", "5.4.1", "as shown", "no assent is counted in B's name: an assent of every party named as a signer is lacking")));
    let b1 = s.assent("v2/in force/B's assent", &bb, &root, &root);
    let mut c = gc(1, "4.1", "changed", "in force by the default: an assent in the name of every party named as a signer, and no later act of either: not shown, no order shown", "5.4.1",
        &[Q_541_DEFAULT, Q_541_KNOTS, Q_541_NOT_YET], &[R_HER, R_GATE], &s, "in_force", vec![root],
        ans("not shown", "5.4.1", "as shown", "the assents are present (A's, the Terms act, and B's), but no order is shown: neither A nor B has made an act within the agreement shown after both"));
    c.against_sheet = None;
    out.cases.push(c);
    out.cases.push(gc(2, "4.1", "changed", "an assent counted, to Terms not yet in force: not shown", "5.4.3",
        &[Q_543_NOT, Q_541_NOT_YET], &[R_HER], &s, "assent", vec![b1],
        ans("not shown", "5.4.3", "as shown", "those Terms are not yet in force, no order being shown").who(&bb.id)));
    out.cases.push(gc(3, "4.1", "rewritten", "order from naming: B's assent names the Terms, and came after them", "5.13.4",
        &[Q_5134_NAMES], &[TEXT_ALONE], &s, "order", vec![b1, root],
        ans("shown", "5.13.4", "none", "B's assent names the Terms act in `terms`")));
    let mut s4 = s.clone();
    let an = s4.note("v2/in force/A's next act, naming only the Terms", &a, &root, &root, &[]);
    out.cases.push(gc(4, "4.1", "rewritten", "order from naming: A's next act (naming only the Terms) and B's assent name nothing of each other: no order", "5.13.4",
        &[Q_5134_NONE], &[TEXT_ALONE, "verifier 2's two assents (A's and B's) are A's next act, a note naming only the Terms act, and B's assent: A's assent to her own Terms is not written again (the ledger, \"Publishing the Terms is the publisher's assent\", 27 November, 20:49–20:50)"], &s4, "order", vec![an, b1],
        ans("not shown", "5.13.4", "none", "neither act names the other, directly or through acts that name it")));
    // in force by a K2 stub asking A's name.
    let mut s = Sc::new();
    let (a, bb) = ab(&mut s);
    let root = s.root("v2/in force/K2 root", &a, terms(signers(&[&a, &bb])).set(tk::IN_FORCE, k2(vec![who_signer(&a.id)])));
    let mut c = gc(5, "4.1", "changed", "in force by `in_force` (a stub asking A's name): the assent it requires, the Terms act, is present, and no later act of A's pins it: not shown", "5.4.1",
        &[Q_541_FIRST, Q_541_REQUIRED, Q_541_KNOTS, Q_541_NOT_YET], &[R_HER, R_C2], &s, "in_force", vec![root],
        ans("not shown", "5.4.1", "as shown", "K2 says the assent it requires (A's, the Terms act) is present; A has made no act within the agreement shown after it, so no order is shown"));
    c.stubs = vec![asked("K2", stub::K2, "are the assents that put these Terms in force present? (parameters: A's name)", "yes; it requires the assent counted in A's name: the Terms act")];
    out.cases.push(c);
    // a K2 cMIP not held.
    let mut s = Sc::new();
    let (a, _) = ab(&mut s);
    let root = s.root("v2/in force/unknown K2 root", &a, terms(signers(&[&a])).set(tk::IN_FORCE, socket(&g("a cMIP this verifier does not hold"), Value::Null)));
    out.cases.push(gc(6, "4.1", "rewritten", "in force by an `in_force` cMIP the verifier does not hold: unchecked", "5.4.1",
        &[Q_541_FIRST, Q_TASK_LACK], &[R_HER], &s, "last_version", vec![root],
        ans("unchecked", "5.4.1", "none", "the cMIP in `in_force` (task K2) is not held")));
}

// ================================================================ 7 to 16

fn update_cases(out: &mut Out) {
    let mut s = Sc::new();
    let (a, bb) = ab(&mut s);
    let root = s.root("v2/update/root", &a, terms(signers(&[&a, &bb])));
    s.assent("v2/update/B's assent to root", &bb, &root, &root);
    let v2 = s.version("v2/update/v2", &a, &root, &root, terms(signers(&[&a, &bb])));
    out.cases.push(gc(7, "4.1", "rewritten", "an update by the default, lacking B's assent: not shown, never not valid", "5.5.7(e)",
        &[Q_557E, Q_557E_DEF], &[R_HER, R_KNOWN], &s, "update", vec![v2],
        ans("not shown", "5.5.7(e)", "as shown", "no assent to the update in B's name is held; the missing assent may exist")));
    s.assent("v2/update/B's assent to v2", &bb, &root, &v2);
    let mut c = gc(8, "4.2", "rewritten", "an update by the default: every known party of the original signs it: valid, by default; not in force, the original not being in force", "5.5.7(e)",
        &[Q_557E, Q_551_TWO], &[R_HER, R_KNOWN, R_C4, R_VALID], &s, "update", vec![v2],
        ans("valid", "5.5.7(e)", "as shown", "by default: an assent in the name of each known party of the original is held: A's (the update's own Terms act) and B's"));
    c.also = vec![ans("not shown", "5.5.1", "as shown", "not shown as in force: the version it names is not in force (no act of A's is shown after B's assent to the root)")];
    out.cases.push(c);
    out.cases.push(gc(9, "4.1", "rewritten", "the root, not yet in force (no act of A's shown after B's assent), and an update not in force: the root not shown as in force", "5.4.1",
        &[Q_541_KNOTS, Q_541_NOT_YET], &[R_HER], &s, "in_force", vec![root],
        ans("not shown", "5.4.1", "as shown", "no order is shown for the root's coming into force: no act of A's within the agreement is shown after B's assent to it; it is not replaced either, since the update is not in force")));
    let mut c = gc(10, "4.1", "changed", "the last version: none is shown in force, the first version not pinned", "5.5.3",
        &[Q_553, Q_541_KNOTS, Q_541_NOT_YET], &[R_HER], &s, "last_version", vec![root],
        ans("not shown", "5.4.1", "as shown", "no version is shown in force: the root's order is not shown (A has no act shown after B's assent to it), and so no update of it is in force"));
    c.against_sheet = None;
    out.cases.push(c);
    // By an update condition: one of the original's known parties.
    let mut s = Sc::new();
    let (a, bb) = ab(&mut s);
    let cc = tid("C");
    s.who(&cc, "C");
    let root = s.root("v2/condition/root", &a, terms(signers(&[&a, &bb, &cc])).set(tk::CONDITION, stub_socket(stub::K4, arr(vec![u(0), u(1)]))));
    s.assent("v2/condition/B's assent to root", &bb, &root, &root);
    s.assent("v2/condition/C's assent to root", &cc, &root, &root);
    let v2 = s.version("v2/condition/v2", &a, &root, &root, terms(signers(&[&a, &bb, &cc])).set(tk::IN_FORCE, k2(vec![who_signer(&a.id)])));
    let k4 = asked("K4", stub::K4, "can the agreement be updated like this? (original: the root; proposed: v2; the assents that count: A's, v2 itself; parameters [0, 1])", "valid: one of the original's known parties, A, signs it");
    let mut c = gc(11, "4.2", "rewritten", "an update by an update condition (a stub: one of the original's known parties): valid, the condition named; not in force, the original not being in force", "5.5.7(d)",
        &[Q_557D, Q_551_TWO], &[R_HER, R_C4, R_VALID], &s, "update", vec![v2],
        ans("valid", "5.5.7(d)", "as shown", "the update condition (the K4 stub, one of the original's known parties) answers valid: A's assent, v2 itself"));
    c.stubs = vec![k4];
    c.also = vec![ans("not shown", "5.5.1", "as shown", "not shown as in force: the version it names is not in force (no act of A's is shown after B's and C's assents)")];
    out.cases.push(c);
    let mut c = gc(12, "4.1", "changed", "bound by an update without an assent of one's own, the update condition answering valid: not shown, the update not passing the pin", "5.6.1(c)",
        &[Q_561C, Q_543_BINDS], &[R_HER], &s, "bound", vec![bb.id, v2],
        ans("not shown", "5.6.1(c)", "as shown", "B is not bound by the root, which is not shown in force, and the update does not pass the pin: the version it names is not in force"));
    c.stubs = vec![asked("K4", stub::K4, "can the agreement be updated like this? (original: the root; proposed: v2; parameters [0, 1])", "valid")];
    out.cases.push(c);
    // A condition that answers not valid.
    let mut s = Sc::new();
    let (a, bb) = ab(&mut s);
    let root = s.root("v2/never/root", &a, terms(signers(&[&a, &bb])).set(tk::CONDITION, stub_socket(stub::K4, arr(vec![u(1)]))));
    s.assent("v2/never/B's assent", &bb, &root, &root);
    let v2 = s.version("v2/never/v2", &a, &root, &root, terms(signers(&[&a, &bb])));
    s.assent("v2/never/B's assent to v2", &bb, &root, &v2);
    let mut c = gc(13, "4.1", "rewritten", "an update condition that answers not valid: not valid, whoever signed it", "5.5.7(c)",
        &[Q_557C], &[R_HER], &s, "update", vec![v2],
        ans("not valid", "5.5.7(c)", "as shown", "the update condition (the K4 stub, never) answers not valid"));
    c.stubs = vec![asked("K4", stub::K4, "can the agreement be updated like this? (original: the root; proposed: v2; parameters [1])", "not valid: never")];
    out.cases.push(c);
    out.cases.push(gc(14, "4.1", "changed", "the original, an update of which is not valid: not shown as in force, its own order not shown", "5.4.1",
        &[Q_541_KNOTS, Q_541_NOT_YET], &[R_HER], &s, "in_force", vec![root],
        ans("not shown", "5.4.1", "as shown", "no act of A's within the agreement is shown after B's assent to the root (v2, A's next act, names only the root); no order is shown")));
    // A power of sort replaces.
    let mut s = Sc::new();
    let (a, bb) = ab(&mut s);
    let root = s.root("v2/replaces power/root", &a, terms(signers(&[&a, &bb])).set(tk::POWERS, arr(vec![power(u(4), &[&a.id])])));
    s.assent("v2/replaces power/B", &bb, &root, &root);
    let v2 = s.version("v2/replaces power/v2", &a, &root, &root, terms(signers(&[&a, &bb])));
    out.cases.push(gc(15, "4.1", "rewritten", "a power of sort `replaces` gives no power: the default still asks every known party of the original", "5.5.7(e)",
        &[Q_562, Q_557E_NOPOWER, Q_557E], &[R_HER, R_KNOWN], &s, "update", vec![v2],
        ans("not shown", "5.5.7(e)", "as shown", "no assent to the update in B's name is held; the power of sort `replaces` gives none")));
    out.cases.push(gc(16, "4.1", "rewritten", "a power of sort `replaces` is left unread, and the verifier says so", "5.2.3",
        &[Q_562_UNREAD, Q_523_SAYS], &[TEXT_ALONE], &s, "whole", vec![root],
        ans("shown", "5.2.3", "none", "left unread: the entry of `powers` of sort `replaces`")));
}

// ================================================================ 17 to 31

/// A fork of Terms: v2a by A and v2b by B, each assented by the other.
fn fork_base(s: &mut Sc, a: &Tid, bb: &Tid, keeper: Option<Hash>) -> (Hash, Hash, Hash, Vec<Hash>) {
    let t = |p: Vec<Value>| {
        let x = terms(p);
        match keeper {
            Some(k) => x.set(tk::KEEPER, keepers(&[k])),
            None => x,
        }
    };
    let root = s.root("v2/fork/root", a, t(signers(&[a, bb])).set(tk::RECEIVER, arr(vec![u(0), u(0)])));
    let r2 = s.assent("v2/fork/B's assent to root", bb, &root, &root);
    let v2a = s.version("v2/fork/v2a", a, &root, &root, t(signers(&[a, bb])));
    let v2b = s.version("v2/fork/v2b", bb, &root, &root, t(signers(&[a, bb])).set(tk::RECEIVER, arr(vec![u(0), u(1)])));
    let b2 = s.assent("v2/fork/B's assent to v2a", bb, &root, &v2a);
    let a2 = s.assent("v2/fork/A's assent to v2b", a, &root, &v2b);
    (root, v2a, v2b, vec![root, r2, v2a, v2b, b2, a2])
}

const FORK_PIN: &str = "the root is in force, as shown: A's assent to v2b follows v2a, which follows the Terms act, and names v2b, which follows B's assent to the root; B's v2b follows his assent to the root, which names the Terms act";

fn fork_cases(out: &mut Out) {
    let mut s = Sc::new();
    let (a, bb) = ab(&mut s);
    let (root, v2a, v2b, _) = fork_base(&mut s, &a, &bb, None);
    out.cases.push(gc(17, "4.1", "rewritten", "a fork of Terms: two updates of the same version, each passing its gate, neither shown after the other: fork", "5.5.4(e)",
        &[Q_554_FORK, Q_554E_FORK, Q_554A], &[R_HER, R_FORK, R_C17], &s, "last_version", vec![root],
        ans("fork", "5.5.4(e)", "as shown", &format!("v2a and v2b each pass the root's gate by default (A's and B's assents to each), and no choice of acts enough for either's gate is shown after acts enough for the other's; {FORK_PIN}"))));
    out.cases.push(gc(18, "4.1", "rewritten", "while a fork stands, the Terms both branches replace stay in force", "5.5.4(e)",
        &[Q_554E_STAY, Q_541_KNOTS], &[R_HER, R_FORK], &s, "in_force", vec![root],
        ans("in force", "5.5.4(e)", "as shown", FORK_PIN)));
    out.cases.push(gc(19, "4.1", "rewritten", "a tip of a fork that stands: not in force", "5.5.4(e)",
        &[Q_554E_STAY, Q_551_TWO], &[R_HER, R_FORK], &s, "in_force", vec![v2a],
        ans("not shown", "5.5.4(e)", "as shown", "it is a tip of a fork that stands")));
    let mut c = gc(20, "4.1", "rewritten", "the receiver while a fork of Terms stands: the one named by the Terms both branches replace, the fork shown", "5.1.4",
        &[Q_514_FORK, Q_514_NOVER, Q_514_PARTY], &[R_HER, R_FORK], &s, "receiver", vec![root],
        ans("shown", "5.1.4", "as shown", "the root names party 0, A, as receiver").who(&a.id));
    c.also = vec![ans("fork", "5.5.4(e)", "as shown", "shown with the fork of v2a and v2b")];
    out.cases.push(c);
    let mut c = gc(21, "4.1", "rewritten", "the receiver while a fork stands is shown with the fork", "5.5.4(e)",
        &[Q_554E_SHOW], &[R_HER, R_FORK], &s, "receiver", vec![root],
        ans("fork", "5.5.4(e)", "as shown", "the fork of v2a and v2b, shown beside the receiver"));
    c.also = vec![ans("shown", "5.1.4", "as shown", "the receiver named by the root, A").who(&a.id)];
    out.cases.push(c);
    // Resolved by a resolving update every known party signs.
    let mut s2 = s.clone();
    let a_last = *s2.acts.iter().rev().find(|m| m.label == "v2/fork/A's assent to v2b").map(|m| &m.id).unwrap();
    let r = s2.resolving("v2/fork/resolving update", &a, &root, &root, &[v2a, v2b], &v2a, Some(&a_last));
    s2.assent("v2/fork/B's assent to the resolving update", &bb, &root, &r);
    let mut c = gc(22, "4.2", "changed", "a fork of Terms resolved by an update of the shared Terms that names every tip and the one that continues: valid by default, and in force", "5.12.4",
        &[Q_5124_RES, Q_557E, Q_571_PREV], &[R_HER, R_C7, "its `previous` names A's last act within the agreement (draft 26, 5.7.1), not the shared act, which its `replaces` names (5.12.4: \"for Terms whose `replaces`, names the shared act\"); encoding 3's E17 says a Terms act written as a resolving update names the shared act in `previous`: a question in this fork's report"], &s2, "resolution", vec![r],
        ans("valid", "5.12.4", "as shown", "by default: assents in the name of every known party of the shared Terms, A's (the resolving update itself) and B's"));
    c.also = vec![ans("in force", "5.12.4", "as shown", "pinned: it follows A's assent to v2b, shown after the acts that put the root in force")];
    c.against_sheet = None;
    out.cases.push(c);
    out.cases.push(gc(23, "4.1", "rewritten", "after the resolving update, the tip continued is in force", "5.12.4",
        &[Q_5124_CONT], &[R_HER, R_C7], &s2, "last_version", vec![root],
        ans("in force", "5.12.4", "as shown", "the resolving update continues v2a, which counts as the next version").who(&v2a)));
    out.cases.push(gc(24, "4.1", "rewritten", "the other tip is set aside: it never counted as the next version", "5.12.4",
        &[Q_5124_ASIDE], &[R_HER], &s2, "in_force", vec![v2b],
        ans("not shown", "5.12.4", "as shown", "set aside by the resolving update, which continues v2a")));
    let mut s3 = s2.clone();
    let buyer = tid("U");
    s3.who(&buyer, "U");
    let pay = g("v2/a payment naming the tip set aside (stand-in)");
    s3.names.insert(pay, "a payment naming v2b (stand-in, Money table)".into());
    s3.money.push(json!({ "payment": v::hx(&pay), "payer": v::hx(&buyer.id), "version": v::hx(&v2b), "settlement": v::hx(&g("v2/its settlement (stand-in)")), "amount": 5 }));
    out.cases.push(gc(25, "4.1", "rewritten", "a payment by one who signed none of the branch, naming a version of a branch set aside: its receiver read from that version, disputed", "5.12.6",
        &[Q_5126_PAY], &[R_HER, R_FORK], &s3, "receiver_for_payment", vec![pay],
        ans("shown", "5.1.4", "as shown", "read as if v2b had stood alone: v2b names party 1, B, as receiver").who(&bb.id).disputed()));
    // A resolving-shaped act with no fork.
    let mut s = Sc::new();
    let (a, bb) = ab(&mut s);
    let root = s.root("v2/no fork/root", &a, terms(signers(&[&a, &bb])));
    s.assent("v2/no fork/B's assent to root", &bb, &root, &root);
    let v2 = s.version("v2/no fork/v2", &a, &root, &root, terms(signers(&[&a, &bb])));
    let x = s.resolving("v2/no fork/x", &a, &root, &root, &[v2], &v2, Some(&v2));
    s.assent("v2/no fork/B's assent to x", &bb, &root, &x);
    s.assent("v2/no fork/B's assent to v2", &bb, &root, &v2);
    let mut c = gc(26, "4.1", "changed", "an act shaped as a resolving update where there is no fork: no version in force, the first version not pinned", "5.4.1",
        &[Q_5124_NOFORK, Q_541_KNOTS, Q_541_NOT_YET], &[R_HER], &s, "last_version", vec![root],
        ans("not shown", "5.4.1", "as shown", "no version is shown in force: no act of A's within the agreement is shown after B's assent to the root (v2 and x name only A's own acts)"));
    c.against_sheet = None;
    out.cases.push(c);
    // Rival resolving updates.
    let mut s = Sc::new();
    let (a, bb) = ab(&mut s);
    let (root, v2a, v2b, _) = fork_base(&mut s, &a, &bb, None);
    let a_last = *s.acts.iter().rev().find(|m| m.label == "v2/fork/A's assent to v2b").map(|m| &m.id).unwrap();
    let b_last = *s.acts.iter().rev().find(|m| m.label == "v2/fork/B's assent to v2a").map(|m| &m.id).unwrap();
    let r1 = s.resolving("v2/rivals/R1 (continues v2a)", &a, &root, &root, &[v2a, v2b], &v2a, Some(&a_last));
    let r2 = s.resolving("v2/rivals/R2 (continues v2b)", &bb, &root, &root, &[v2a, v2b], &v2b, Some(&b_last));
    s.assent("v2/rivals/A's assent to R2", &a, &root, &r2);
    s.assent("v2/rivals/B's assent to R1", &bb, &root, &r1);
    out.cases.push(gc(27, "4.1", "rewritten", "two resolving updates that continue different tips: neither resolves the first fork while the other stands", "5.12.8",
        &[Q_5128, Q_554A], &[R_HER, R_FORK, R_C17], &s, "last_version", vec![root],
        ans("fork", "5.12.8", "as shown", &format!("R1 and R2 each pass the root's gate by default (A's and B's assents), and neither is shown after acts enough for the other's gate; {FORK_PIN}"))));
    // A power to resolve.
    let mut s = Sc::new();
    let (a, bb) = ab(&mut s);
    let j = tid("J");
    s.who(&j, "J");
    let root = s.root("v2/power to resolve/root", &a, terms(signers(&[&a, &bb])).set(tk::POWERS, arr(vec![power(u(3), &[&j.id])])));
    s.assent("v2/power to resolve/B's assent to root", &bb, &root, &root);
    let v2a = s.version("v2/power to resolve/v2a", &a, &root, &root, terms(signers(&[&a, &bb])));
    let v2b = s.version("v2/power to resolve/v2b", &bb, &root, &root, terms(signers(&[&a, &bb])));
    s.assent("v2/power to resolve/B's assent to v2a", &bb, &root, &v2a);
    s.assent("v2/power to resolve/A's assent to v2b", &a, &root, &v2b);
    let r = s.resolving("v2/power to resolve/J's resolving update", &j, &root, &root, &[v2a, v2b], &v2b, None);
    let mut c = gc(28, "4.1", "rewritten", "a fork resolved under a power to resolve given in advance: shown, naming 5.12.5, the power and its signer", "5.12.5",
        &[Q_5125], &[R_HER, R_FORK], &s, "resolution", vec![r],
        ans("shown", "5.12.5", "as shown", "signed by J under the root's power of sort `resolves`, whose rule (the K3 stub) says yes; the root is in force (A's assent to v2b and B's v2b pin it)").who(&j.id));
    c.stubs = vec![asked("K3", stub::K3, "does this resolving update, of sort `resolves`, bind the parties: was it made by those who may? (parameters: J)", "yes: signed by J")];
    out.cases.push(c);
    // A late rival, by knots.
    let mut s = Sc::new();
    let (a, bb) = ab(&mut s);
    let root = s.root("v2/late/root", &a, terms(signers(&[&a, &bb])));
    s.assent("v2/late/B's assent to root", &bb, &root, &root);
    let v2a = s.version("v2/late/v2a", &a, &root, &root, terms(signers(&[&a, &bb])));
    s.assent("v2/late/B's assent to v2a", &bb, &root, &v2a);
    let v2b = s.version("v2/late/v2b (relies on v2a)", &bb, &root, &root, terms(signers(&[&a, &bb])).set(tk::RELIES_ON, arr(vec![b(&v2a)])));
    s.assent("v2/late/A's assent to v2b", &a, &root, &v2b);
    let mut c = gc(29, "4.1", "changed", "a late rival, shown by knots: it follows acts enough for the other update to pass the gate", "5.5.4(c)",
        &[Q_554A, Q_554C], &[R_HER, R_C17, R_KNOTS], &s, "update", vec![v2b],
        ans("late", "5.5.4(c)", "as shown", "v2b and A's assent to it, every act its gate needs, are shown after v2a and B's assent to v2a, enough for v2a to pass the root's gate (v2b's `previous` is B's assent to v2a)"));
    c.against_sheet = None;
    out.cases.push(c);
    out.cases.push(gc(30, "4.2", "rewritten", "after a late rival, the line goes on from the update that came first", "5.5.4",
        &[Q_554_GOES, Q_553], &[R_HER, R_C3], &s, "last_version", vec![root],
        ans("in force", "5.5.4", "as shown", "the root is in force (A's assent to v2b is shown after B's assent to the root; B's assent to v2a follows his assent to the root); v2a passes the gate and is pinned (B's assent to v2a, which put it through the gate, follows the acts that put the root in force); v2b is late").who(&v2a)));
    // Lateness that cannot be checked.
    let mut s = Sc::new();
    let (a, bb) = ab(&mut s);
    let root = s.root("v2/late?/root", &a, terms(signers(&[&a, &bb])));
    s.assent("v2/late?/B's assent to root", &bb, &root, &root);
    let lacking = s.missing("an act this verifier does not hold");
    let v2c = s.version("v2/late?/v2c (names an act not held)", &a, &root, &root, terms(signers(&[&a, &bb])).set(tk::RELIES_ON, arr(vec![b(&lacking)])));
    let v2a = s.version("v2/late?/v2a", &a, &root, &root, terms(signers(&[&a, &bb])));
    s.assent("v2/late?/B's assent to v2c", &bb, &root, &v2c);
    s.assent("v2/late?/B's assent to v2a", &bb, &root, &v2a);
    out.cases.push(gc(31, "4.2", "rewritten", "an update naming an act the verifier does not hold, which might be A's later act or show a rival late: which Terms are in force is unchecked", "5.5.4(c)",
        &[Q_554C_MISSING, Q_541_UNCHECKED], &[R_HER, R_C5, R_KNOTS], &s, "last_version", vec![root],
        ans("unchecked", "5.5.4(c)", "none", "v2c's `relies_on` names an act not held: it could be A's later act that the root's pin needs, or show v2c or v2a late")));
}

// ================================================================ 32 to 37

fn counter_cases(out: &mut Out) {
    let cs_kind = v::kind::COUNTER_SIGNATURE;
    // Before: the completing assent names the counter signature.
    let mut s = Sc::new();
    let (a, bb) = ab(&mut s);
    let root = s.root("v2/counter/before/root", &a, terms(signers(&[&a, &bb])));
    let cs = s.st("v2/counter/before/A's counter signature", &a, v::statement(&root, &root, cs_kind, None));
    s.assent_rel("v2/counter/before/B's assent, naming it", &bb, &root, &root, &[cs]);
    out.cases.push(gc(32, "4.1", "rewritten", "a counter signature of A's, following the Terms act (her assent), before the Terms came into force (the completing assent names it): it cancels", "5.4.5",
        &[Q_545_FOLLOWS, Q_545_BEFORE, Q_545_SHOWN, Q_AUTHOR], &[R_HER, "A's counter signature cancels the assent counted in her name, which is the Terms act (§4.3)"], &s, "counter_signature", vec![cs],
        ans("shown", "5.4.5", "as shown", "it cancels A's assent, the Terms act: counting every act held but those shown after it (B's assent), the Terms would not come into force")));
    out.cases.push(gc(33, "4.1", "rewritten", "with A's assent cancelled, the Terms are not in force by the default", "5.4.1",
        &[Q_545_CANCEL, Q_541_DEFAULT], &[R_HER], &s, "in_force", vec![root],
        ans("not shown", "5.4.1", "as shown", "the assent counted in A's name, the Terms act, is cancelled")));
    // After.
    let mut s = Sc::new();
    let (a, bb) = ab(&mut s);
    let root = s.root("v2/counter/after/root", &a, terms(signers(&[&a, &bb])));
    let b1 = s.assent("v2/counter/after/B's assent", &bb, &root, &root);
    let cs = s.st("v2/counter/after/A's counter signature, naming B's assent", &a, v::statement(&root, &root, cs_kind, None).set(sk::RELIES_ON, arr(vec![b(&b1)])));
    out.cases.push(gc(34, "4.1", "rewritten", "a counter signature shown after every assent the Terms need: late, it changes nothing", "5.4.5",
        &[Q_545_LATE, Q_545_NOTSHOWN], &[R_HER], &s, "counter_signature", vec![cs],
        ans("not shown", "5.4.5", "as shown", "late: it is shown after the Terms act and B's assent, enough for the Terms to come into force")));
    let mut c = gc(35, "4.1", "changed", "a late counter signature pins A's side, and B has no later act: not in force, no order shown", "5.4.1",
        &[Q_541_PIN_CS, Q_541_KNOTS, Q_541_NOT_YET], &[R_HER, R_C20], &s, "in_force", vec![root],
        ans("not shown", "5.4.1", "as shown", "A's counter signature pins her side; B has made no act within the agreement shown after his assent, so no order is shown"));
    c.against_sheet = None;
    out.cases.push(c);
    // No order.
    let mut s = Sc::new();
    let (a, bb) = ab(&mut s);
    let root = s.root("v2/counter/no order/root", &a, terms(signers(&[&a, &bb])));
    let cs = s.st("v2/counter/no order/A's counter signature", &a, v::statement(&root, &root, cs_kind, None));
    s.assent("v2/counter/no order/B's assent", &bb, &root, &root);
    let mut c = gc(36, "4.1", "changed", "a counter signature and a completing assent, neither naming the other: fork", "5.4.5",
        &[Q_545_FORK, Q_545_FORK2], &[R_HER, R_FORK], &s, "counter_signature", vec![cs],
        ans("fork", "5.4.5", "as shown", "it is not shown after acts enough for the Terms to come into force, and counting every act held but those shown after it (none) the Terms would come into force: it and B's assent are a fork"));
    c.against_sheet = None;
    out.cases.push(c);
    let mut c = gc(37, "4.1", "changed", "while the counter signature and the completing assent are a fork, the Terms are not in force: fork", "5.4.5",
        &[Q_545_FORK2], &[R_HER, R_FORK], &s, "in_force", vec![root],
        ans("fork", "5.4.5", "as shown", "A's counter signature and B's completing assent are a fork; while it stands the Terms are not in force"));
    c.also = vec![ans("not shown", "5.4.5", "as shown", "not in force while the fork stands")];
    c.against_sheet = Some("the sheet lists G 37 as renamed only (not shown kept); draft 26's 5.4.5 makes the counter signature and the completing assent a fork, and \"A verifier answers **fork**\"".into());
    out.cases.push(c);
}

// ================================================================ 38 to 48

fn line_cases(out: &mut Out) {
    let assent = v::kind::ASSENT;
    let mut s = Sc::new();
    let a = tid("A");
    s.who(&a, "A");
    let root = s.root("v2/line/root", &a, terms(signers(&[&a])));
    let a1 = s.st_raw("v2/line/A's first assent", &a, v::statement(&root, &root, assent, Some(&root)));
    let a2 = s.st_raw("v2/line/A's second assent, naming the same previous", &a, v::statement(&root, &root, assent, Some(&root)));
    let r_tips = "the tips are two assents of A's, the Terms' own signer, each naming the Terms act in `previous`: verifier 2's story is kept (5.4.5: \"A later assent by the same signer to the same Terms is counted as any assent is\")";
    out.cases.push(gc(38, "4.1", "rewritten", "a fork in a signer's line: two acts that name the same previous act", "5.7.2",
        &[Q_572], &[r_tips], &s, "line", vec![a.id, root],
        ans("fork", "5.7.2", "as shown", "A's two assents both name the Terms act in `previous`")));
    out.cases.push(gc(39, "4.1", "rewritten", "both tips of a signer's fork stop: neither pins the Terms, which are not in force", "5.12.3",
        &[Q_5123, Q_541_KNOTS], &[r_tips], &s, "in_force", vec![root],
        ans("not shown", "5.12.3", "as shown", "the assent counted in A's name is the Terms act; A's only later acts are the tips of a fork in her line, which count for nothing while it stands, so no order is shown")));
    out.cases.push(gc(40, "4.1", "rewritten", "an assent that is a tip of a signer's fork: not shown, it does not count", "5.12.3",
        &[Q_5123, Q_543_NOT], &[r_tips], &s, "assent", vec![a1],
        ans("not shown", "5.12.3", "as shown", "it is a tip of a fork in A's line").who(&a.id)));
    let mut s2 = s.clone();
    s2.st_raw("v2/line/A's resolving update", &a, v::statement(&root, &root, v::kind::RESOLVE, Some(&root)).set(sk::RESOLVES, v::sorted_set(vec![b(&a1), b(&a2)])).set(sk::CONTINUES, b(&a1)));
    out.cases.push(gc(41, "4.1", "rewritten", "a signer's fork resolved by that signer's resolving update: the line goes on from the tip continued", "5.12.4",
        &[Q_5124_LINE, Q_5124_CONT], &[r_tips, R_C39], &s2, "line", vec![a.id, root],
        ans("shown", "5.12.4", "as shown", "A's resolve names both tips and continues her first assent")));
    out.cases.push(gc(42, "4.1", "rewritten", "after the resolution, the continued assent counts: it pins the Terms, which are in force", "5.4.1",
        &[Q_5124_CONT, Q_541_KNOTS], &[r_tips, R_C20], &s2, "in_force", vec![root],
        ans("in force", "5.4.1", "as shown", "the assent counted in A's name is the Terms act; A's continued first assent, a Statement in her name within the agreement, is shown after it")));
    // A signer's fork, a resolve under a power to resolve in Terms not pinned.
    let mut s = Sc::new();
    s.who(&a, "A");
    let j = tid("J");
    s.who(&j, "J");
    let d = s.root("v2/line power/D, a power to resolve for A", &a, terms(signers(&[&a, &j])).set(tk::POWERS, arr(vec![power(u(3), &[&j.id])])));
    s.assent("v2/line power/J's assent to D", &j, &d, &d);
    let y = s.root("v2/line power/Y", &a, terms(signers(&[&a])));
    let a1 = s.st_raw("v2/line power/A's first assent", &a, v::statement(&y, &y, assent, Some(&y)));
    let a2 = s.st_raw("v2/line power/A's second assent, naming the same previous", &a, v::statement(&y, &y, assent, Some(&y)));
    s.st("v2/line power/J's resolve for A, under D", &j, v::statement(&y, &y, v::kind::RESOLVE, None).set(sk::FOR, who_signer(&a.id)).set(sk::UNDER, b(&d)).set(sk::RESOLVES, v::sorted_set(vec![b(&a1), b(&a2)])).set(sk::CONTINUES, b(&a2)));
    let mut c = gc(43, "4.1", "changed", "a signer's fork and a resolve made for her under a power to resolve in Terms not in force (D not pinned): the fork stands", "5.7.2",
        &[Q_5125_LINE, Q_561B_INFORCE, Q_572, Q_541_KNOTS], &[r_tips, R_HER], &s, "line", vec![a.id, y],
        ans("fork", "5.7.2", "as shown", "J's resolve is made under D, which is not in force (A has no act within D shown after J's assent), so it is not A's act; A's line stays forked"));
    c.against_sheet = Some("the sheet lists G 43 as renamed only (shown kept); D, which gives the power, is not pinned by knots (5.4.1), and 5.6.1(b) asks Terms in force when the act was made".into());
    c.stubs = vec![];
    out.cases.push(c);
    let mut c = gc(44, "4.1", "changed", "the fork unresolved, the Terms are not pinned: not in force", "5.12.3",
        &[Q_5123, Q_541_KNOTS], &[r_tips, R_HER], &s, "in_force", vec![y],
        ans("not shown", "5.12.3", "as shown", "A's only later acts within Y are the tips of a fork that stands"));
    c.against_sheet = Some("the sheet lists G 44 as renamed only (shown kept); the resolve under D does not count, D not being in force".into());
    out.cases.push(c);
    // A line unchecked before.
    let mut s = Sc::new();
    let (a, bb) = ab(&mut s);
    let root = s.root("v2/unchecked line/root", &a, terms(signers(&[&a, &bb])));
    let lack = s.missing("an act of B's");
    s.st_raw("v2/unchecked line/B's assent after an act not held", &bb, v::statement(&root, &root, assent, Some(&lack)));
    out.cases.push(gc(45, "4.1", "rewritten", "an act whose `previous` names nothing held counts, and its signer's line is shown unchecked before it", "5.7.1",
        &[Q_571_UNCH], &[R_HER], &s, "line", vec![bb.id, root],
        ans("shown", "5.7.1", "as shown", "B's assent counts; his line is unchecked before it")));
    let mut c = gc(46, "4.1", "changed", "the act after an act not held counts toward in force, and no later act of A's pins it: not shown", "5.4.1",
        &[Q_571_UNCH, Q_541_KNOTS, Q_541_NOT_YET], &[R_HER], &s, "in_force", vec![root],
        ans("not shown", "5.4.1", "as shown", "B's assent counts, but neither A nor B has made an act within the agreement shown after both assents; the act not held precedes B's assent in his line, so it cannot be a later act the pin needs"));
    c.against_sheet = None;
    out.cases.push(c);
    // previous naming another signer's act.
    let mut s = Sc::new();
    let (a, bb) = ab(&mut s);
    let root = s.root("v2/invalid previous/root", &a, terms(signers(&[&a, &bb])));
    let bad = s.st_raw("v2/invalid previous/B's assent naming A's act", &bb, v::statement(&root, &root, assent, Some(&root)));
    out.cases.push(gc(47, "4.1", "rewritten", "`previous` naming another signer's act (A's Terms act): invalid, and it counts for nothing", "5.7.1",
        &[Q_571_INVALID], &[R_HER, "B's assent names A's Terms act in `previous`, as verifier 2's named A's assent"], &s, "act", vec![bad],
        ans("invalid", "5.7.1", "none", "its `previous` names an act of another signer, A")));
    out.cases.push(gc(48, "4.1", "rewritten", "an invalid assent counts for nothing: the Terms are not in force", "5.4.1",
        &[Q_INVALID_NOTHING, Q_541_DEFAULT], &[R_HER], &s, "in_force", vec![root],
        ans("not shown", "5.4.1", "as shown", "no assent is counted in B's name: his is invalid")));
}

// ================================================================ 49 to 54

fn agreement_party_cases(out: &mut Out) {
    let assent = v::kind::ASSENT;
    let mut s = Sc::new();
    let a = tid("A");
    let j = tid("J");
    let k = tid("K");
    s.who(&a, "A");
    s.who(&j, "J");
    let x = s.root("v2/party/X, with a power to assent", &j, terms(signers(&[&j])).set(tk::POWERS, arr(vec![power(u(0), &[&j.id])])));
    let y = s.root("v2/party/Y, naming X as a party", &a, terms(vec![v::party_signer(&a.id), arr(vec![u(2), b(&x)])]).set(tk::IN_FORCE, k2(vec![who_signer(&a.id), who_agreement(&x)])));
    let sig = s.st("v2/party/J's assent to Y for X, under X", &j, v::statement(&y, &y, assent, None).set(sk::FOR, who_agreement(&x)).set(sk::UNDER, b(&x)));
    let mut c = gc(49, "4.1", "changed", "an agreement as a party signs through a power its own Terms give, those Terms not pinned: not its signature", "5.1.2",
        &[Q_512_SIG, Q_541_KNOTS], &[R_HER], &s, "signature_of", vec![sig],
        ans("not shown", "5.1.2", "as shown", "its `under` names X, which is not in force: J, X's one signer, has made no act within X after its Terms act"));
    c.against_sheet = None;
    out.cases.push(c);
    let mut c = gc(50, "4.1", "changed", "Terms whose `in_force` asks for the agreement's signing, which is not shown: not in force", "5.4.4",
        &[Q_544_ASK, Q_541_FIRST, Q_512_SIG], &[R_HER, R_C2], &s, "in_force", vec![y],
        ans("not shown", "5.4.1", "as shown", "K2 asks for an assent counted in X's name; J's assent for X is not X's signature, X not being in force"));
    c.stubs = vec![asked("K2", stub::K2, "are the assents that put these Terms in force present? (parameters: A's name and X's)", "no: no assent is counted in X's name")];
    out.cases.push(c);
    // X2 signs by all its signers.
    let mut s = Sc::new();
    s.who(&a, "A");
    s.who(&j, "J");
    s.who(&k, "K");
    let x2 = s.root("v2/party/X2, two signers, no power", &j, terms(signers(&[&j, &k])));
    s.assent("v2/party/K's assent to X2", &k, &x2, &x2);
    let y2 = s.root("v2/party/Y2, naming X2", &a, terms(vec![v::party_signer(&a.id), arr(vec![u(2), b(&x2)])]).set(tk::IN_FORCE, k2(vec![who_signer(&a.id), who_agreement(&x2)])));
    let st = v::statement(&y2, &y2, assent, None).set(sk::FOR, who_agreement(&x2)).set(sk::UNDER, b(&x2));
    let sj = s.st("v2/party/J's assent to Y2 for X2", &j, st.clone());
    out.cases.push(gc(51, "4.1", "rewritten", "an agreement with no power signs by every one of its signers: one of two signed: not shown", "5.1.2",
        &[Q_512_ALL, Q_512_ONCE], &[R_HER], &s, "signature_of", vec![sj],
        ans("not shown", "5.1.2", "as shown", "no matching act of K's is held; and X2 is not in force")));
    s.st("v2/party/K's assent to Y2 for X2", &k, st);
    let mut c = gc(52, "4.1", "changed", "an agreement with no power signs by every one of its signers, the same act from each, its Terms not pinned: not shown", "5.1.2",
        &[Q_512_ALL, Q_512_ONCE, Q_541_KNOTS], &[R_HER], &s, "signature_of", vec![sj],
        ans("not shown", "5.1.2", "as shown", "the two acts match, but their `under`, X2, is not in force: J has made no act within X2 shown after K's assent to it"));
    c.against_sheet = None;
    out.cases.push(c);
    // An agreement named and not counted by the default.
    let mut s = Sc::new();
    s.who(&a, "A");
    s.who(&j, "J");
    let x3 = s.root("v2/party/X3", &j, terms(signers(&[&j])));
    let y3 = s.root("v2/party/Y3, naming X3, no in_force", &a, terms(vec![v::party_signer(&a.id), arr(vec![u(2), b(&x3)])]));
    let mut c = gc(53, "4.1", "changed", "a party named as an agreement is not counted by the default; the Terms act alone, not pinned: not in force", "5.4.1",
        &[Q_544, Q_541_DEFAULT, Q_541_KNOTS], &[R_HER], &s, "in_force", vec![y3],
        ans("not shown", "5.4.1", "as shown", "the one assent the default asks, A's, is the Terms act; A has made no act within Y3 shown after it"));
    c.against_sheet = None;
    out.cases.push(c);
    let bad = s.st("v2/party/J's assent for X3 under Y3", &j, v::statement(&y3, &y3, assent, None).set(sk::FOR, who_agreement(&x3)).set(sk::UNDER, b(&y3)));
    out.cases.push(gc(54, "4.1", "rewritten", "an act made for an agreement under Terms of another agreement is not its signature", "5.1.2",
        &[Q_512_OTHER], &[R_HER], &s, "signature_of", vec![bad],
        ans("not shown", "5.1.2", "none", "its `for` names X3 and its `under` names Y3, Terms of another agreement")));
}

// ================================================================ 55 to 59

fn bound_cases(out: &mut Out) {
    let assent = v::kind::ASSENT;
    let mut s = Sc::new();
    let (a, bb) = ab(&mut s);
    let gg = tid("G");
    s.who(&gg, "G");
    let d = s.root_body("v2/bound/delegation D", &a, terms(signers(&[&a, &gg])).set(tk::POWERS, arr(vec![power(u(0), &[&gg.id])])), Value::Map(vec![(u(1), Value::Bool(true))]));
    s.assent("v2/bound/G's assent to D", &gg, &d, &d);
    let y = s.root("v2/bound/Y", &bb, terms(signers(&[&a, &bb])));
    let before_g = s.clone();
    s.st("v2/bound/G's assent to Y for A, under D", &gg, v::statement(&y, &y, assent, None).set(sk::FOR, who_signer(&a.id)).set(sk::UNDER, b(&d)));
    let mut c = gc(55, "4.1", "changed", "bound through a power whose Terms are not pinned: not shown", "5.6.1(b)",
        &[Q_561B_INFORCE, Q_541_KNOTS], &[R_HER, R_GIVER, R_C18], &s, "bound", vec![a.id, y],
        ans("not shown", "5.6.1(b)", "as shown", "G's assent for A is made under D, which is not in force (A has no act within D shown after G's assent to it)"));
    c.against_sheet = None;
    out.cases.push(c);
    let mut c = gc(56, "4.1", "changed", "bound by one's own Terms act, those Terms not in force: not shown", "5.6.1(a)",
        &[Q_561A, Q_543_BINDS, Q_AUTHOR], &[R_HER], &s, "bound", vec![bb.id, y],
        ans("not shown", "5.6.1(a)", "as shown", "B signed Y in his own name (the Terms act, his assent), but Y is not in force: no assent is counted in A's name (G's is made under D, not in force), and no order is shown"));
    c.against_sheet = None;
    out.cases.push(c);
    out.cases.push(gc(57, "4.1", "rewritten", "an act with no `for` is made in its signer's own name only: A is not bound by B's Terms act", "5.6.3",
        &[Q_563], &[R_HER, "verifier 2 asked of B's assent to Y; B's Terms act Y is that assent now (§4.3), asked before G's act for A is written"], &before_g, "bound", vec![a.id, y],
        ans("not shown", "5.6.3", "none", "Y is B's act, with no `for` and no `under`: made in B's own name only")));
    // 58 retired below. 59: an act under a power after the Terms that gave it were replaced.
    let mut s3 = before_g;
    let d2 = s3.version("v2/bound/D2, without the power", &a, &d, &d, terms(signers(&[&a, &gg])));
    let late = s3.st("v2/bound/G's assent to Y for A, made after D2", &gg, v::statement(&y, &y, assent, None).set(sk::FOR, who_signer(&a.id)).set(sk::UNDER, b(&d)).set(sk::RELIES_ON, arr(vec![b(&d2)])));
    out.cases.push(gc(59, "4.1", "rewritten", "an act made under a power whose Terms are not in force when it is made: not bound", "5.6.1(b)",
        &[Q_561B_INFORCE, Q_564], &[R_HER, R_GIVER, "verifier 2's G's act relied on A's assent to D2; A's assent to D2 is D2 itself now (§4.3), so the act names D2"], &s3, "bound", vec![a.id, late],
        ans("not shown", "5.6.1(b)", "as shown", "D, which gives the power, is not in force (A has no act within D shown after G's assent to it); D2 is not in force either (G's assent to it is lacking)")));
}

// ================================================================ 60 to 65

fn keeper_cases(out: &mut Out) {
    let mut s = Sc::new();
    let (a, bb) = ab(&mut s);
    let kk = keeper_id("K");
    let root = s.root("v2/keeper/root", &a, terms(signers(&[&a, &bb])).set(tk::KEEPER, keepers(&[kk])));
    let y = s.assent("v2/keeper/B's assent", &bb, &root, &root);
    let mut s1 = s.clone();
    s1.keeper("K", "live", vec![vec![root, y]]);
    out.cases.push(with_keeper(gc(60, "4.1", "rewritten", "in force per the keeper the Terms name, which shows both assents", "5.4.1",
        &[Q_541_DEFAULT, Q_541_KEEPERS, Q_584_PER], &[R_HER, R_PLACE, R_KEEPER], &s1, "in_force", vec![root],
        ans("in force", "5.4.1", "per keeper", "keeper K shows the Terms act (A's assent) and B's assent").counted(&[kk]))));
    let mut s2 = s.clone();
    s2.keeper("K", "live", vec![vec![root]]);
    out.cases.push(with_keeper(gc(61, "4.1", "rewritten", "an assent the keeper does not show does not count: not in force, per keeper", "5.4.1",
        &[Q_584_COUNTS, Q_541_KEEPERS, Q_533_UNTIL], &[R_HER, R_P7], &s2, "in_force", vec![root],
        ans("not shown", "5.4.1", "per keeper", "keeper K, a record of which is held, does not yet show B's assent").not_showing(&[kk]))));
    let mut s3 = s.clone();
    s3.keeper("K", "live", vec![]);
    out.cases.push(with_keeper(gc(62, "4.1", "rewritten", "a keeper named, and none of its records held: unchecked", "§3.6",
        &[Q_UNCH], &[R_HER, R_P7], &s3, "last_version", vec![root],
        ans("unchecked", "§3.6", "none", "no record of keeper K is held"))));
    let mut s4 = s.clone();
    s4.keeper("K", "live", vec![vec![root, y], vec![y, root]]);
    let mut c = with_keeper(gc(63, "4.1", "changed", "two signed records of the keeper that contradict each other: that keeper counts as one not showing the act: not shown", "5.8.3",
        &[Q_533_CONTRA], &[R_HER, R_P6_4], &s4, "last_version", vec![root],
        ans("not shown", "5.8.3", "per keeper", "keeper K's two signed records place B's assent and the Terms act in contrary orders: K counts as not showing them, the contradiction shown as evidence").not_showing(&[kk])));
    c.against_sheet = Some("the sheet lists G 63 as renamed only (unchecked kept); draft 26's 5.8.3 now says such a keeper \"counts as one not showing the act\": not shown".into());
    out.cases.push(c);
    // 64 retired below. 65: a late rival per keeper.
    let mut s = Sc::new();
    let (a, bb) = ab(&mut s);
    let (_root, _v2a, v2b, order) = fork_base(&mut s, &a, &bb, Some(kk));
    s.keeper("K", "live", vec![order]);
    let mut c = with_keeper(gc(65, "4.1", "changed", "a late rival shown by the keeper the original names: late, per keeper", "5.5.4(b)",
        &[Q_554B, Q_554C], &[R_HER, R_KEEPER], &s, "update", vec![v2b],
        ans("late", "5.5.4(b)", "per keeper", "keeper K places B's assent to v2a (v2a's gate passed) at position 5, before A's assent to v2b (v2b's gate passed) at position 6").counted(&[kk])));
    c.against_sheet = None;
    out.cases.push(c);
}

// ================================================================ 66 to 70

fn receiver_cases(out: &mut Out) {
    let mut s = Sc::new();
    let (a, bb) = ab(&mut s);
    let j = tid("J");
    s.who(&j, "J");
    let x = s.root("v2/receiver/X", &j, terms(signers(&[&j])).set(tk::RECEIVER, arr(vec![u(0), u(0)])));
    let w = s.root("v2/receiver/W, receiver X", &a, terms(signers(&[&a, &bb])).set(tk::RECEIVER, arr(vec![u(2), b(&x)])));
    s.assent("v2/receiver/B's assent to W", &bb, &w, &w);
    out.cases.push(gc(66, "4.2", "rewritten", "the receiver for an act: the receiver named by the version it read, in force or not", "5.1.4",
        &[Q_514_VER, Q_514_ANY, Q_514_PARTY], &[R_HER, R_C6], &s, "receiver", vec![x, x],
        ans("shown", "5.1.4", "as shown", "the version named, X, names party 0, J").who(&j.id)));
    let mut c = gc(67, "4.1", "changed", "a receiver that is another agreement, no version named, W's Terms not in force: not shown", "5.1.4",
        &[Q_514_NOVER, Q_541_KNOTS], &[R_HER], &s, "receiver", vec![w],
        ans("not shown", "5.1.4", "as shown", "no version is named, and W has no Terms in force (A has no act within W shown after B's assent)"));
    c.against_sheet = None;
    out.cases.push(c);
    let mut c = gc(68, "4.1", "changed", "a verifier that would stop following receivers after one agreement: W's Terms not in force before the limit: not shown", "5.1.4",
        &[Q_514_NOVER, Q_514_STOP], &[R_HER, R_C29], &s, "receiver", vec![w],
        ans("not shown", "5.1.4", "as shown", "W, the first agreement read, has no Terms in force, so no receiver is followed and the limit is not reached"));
    c.sc.limits = Some(json!({ "receivers": 1 }));
    c.against_sheet = None;
    out.cases.push(c);
    let w2 = s.root("v2/receiver/W2, no receiver", &a, terms(signers(&[&a, &bb])));
    out.cases.push(gc(69, "4.1", "rewritten", "a version that names no receiver: no one receives, not shown", "5.1.4",
        &[Q_514_NONE], &[R_HER], &s, "receiver", vec![w2, w2],
        ans("not shown", "5.1.4", "none", "the version named, W2, names no receiver")));
    // A loop.
    let mut s = Sc::new();
    let (a, bb) = ab(&mut s);
    let y1 = s.root("v2/loop/Y1, no receiver", &a, terms(signers(&[&a])));
    let y2 = s.root("v2/loop/Y2, receiver Y1", &bb, terms(signers(&[&bb])).set(tk::RECEIVER, arr(vec![u(2), b(&y1)])));
    s.version("v2/loop/Y1 v2, receiver Y2", &a, &y1, &y1, terms(signers(&[&a])).set(tk::RECEIVER, arr(vec![u(2), b(&y2)])));
    out.cases.push(gc(70, "4.1", "rewritten", "a receiver asked of Y2 with no version named, Y2 not in force: no one receives, not shown (the loop not reached)", "5.1.4",
        &[Q_514_NOVER, Q_514_NONE, Q_541_KNOTS], &[R_HER], &s, "receiver", vec![y2],
        ans("not shown", "5.1.4", "as shown", "Y2 has no Terms in force (B has no act within Y2 after its Terms act), so the agreement met a second time on the way is never reached")));
}

// ================================================================ 71 to 77

fn spot_cases(out: &mut Out) {
    let m = tid("M");
    let buyer = tid("U");
    let what = g("what: a deed (stand-in)");
    let mut s = Sc::new();
    s.who(&m, "M");
    s.who(&buyer, "U");
    let in_force_m = k2(vec![who_signer(&m.id)]);
    let o_terms = |takes: bool| terms(vec![v::party_signer(&m.id), role(0, &what, k5(&[&buyer.id], takes))]).set(tk::IN_FORCE, k2(vec![who_signer(&m.id)])).set(tk::RECEIVER, arr(vec![u(0), u(0)]));
    let _ = in_force_m;
    let o0 = s.root("v2/spot/offer O", &m, o_terms(true));
    let au = s.assent("v2/spot/U's assent to O (the proof)", &buyer, &o0, &o0);
    let o = s.version("v2/spot/O v2", &m, &o0, &o0, o_terms(true).set(tk::CONDITION, stub_socket(stub::K4, arr(vec![u(2)]))));
    let r_m = "verifier 2's O v2 listed U's filling in its spot's parameters; the K5 stub now finds a filling in each assent to a version naming the role, so O v2's role is as O's";
    let mut c = gc(71, "4.1", "rewritten", "a spot filled: each filling with its proof, reported by who signed it", "5.10.2",
        &[Q_5102, Q_5102_READ], &[R_HER, R_UNKNOWN, R_K5_STUB, r_m], &s, "fillings", vec![o0],
        ans("shown", "5.10.2", "as shown", "U's filling, its proof U's assent to O, earned under O; reported by its signer, U").who(&buyer.id));
    c.stubs = vec![asked("K5", stub::K5, "who fills the spot at position 1 of O, by which proof? (O's role, as O states it; parameters [[U], true])", "one filling: U, by U's assent to O, earned under O")];
    out.cases.push(c);
    let mut c = gc(72, "4.1", "rewritten", "whether a spot still takes new identities: the task's output, from the version in force", "5.10.5",
        &[Q_5105], &[R_HER, R_C2, R_K5_STUB], &s, "takes_new", vec![o0],
        ans("yes (the task's output)", "5.10.5", "as shown", "O v2 is in force (O came into force by K2, M's assent, pinned by M's O v2; O v2 valid by default, M its one known party, and pinned); its K5 answers yes"));
    c.stubs = vec![
        asked("K2", stub::K2, "are the assents that put O in force present? (parameters: M's name)", "yes; it requires the assent counted in M's name: the Terms act"),
        asked("K5", stub::K5, "does the spot at position 1 still take new identities? (O v2's role; parameters [[U], true])", "yes"),
    ];
    out.cases.push(c);
    let _ = (au, o);
    let mut s2 = s.clone();
    s2.version("v2/spot/O v3, closed", &m, &o0, &o, o_terms(false).set(tk::CONDITION, stub_socket(stub::K4, arr(vec![u(2)]))));
    let mut c = gc(73, "4.1", "rewritten", "an offer stops taking new identities by a new version", "5.10.5",
        &[Q_5105_VER, Q_5105], &[R_HER, R_C2, R_K5_STUB], &s2, "takes_new", vec![o0],
        ans("no (the task's output)", "5.10.5", "as shown", "O v3 is in force (O v2's condition, always, answers valid; pinned after O v2); its K5 answers no"));
    c.stubs = vec![
        asked("K4", stub::K4, "can O v2 be updated like this? (proposed: O v3; parameters [2])", "valid: always"),
        asked("K5", stub::K5, "does the spot at position 1 still take new identities? (O v3's role; parameters [[U], false])", "no"),
    ];
    out.cases.push(c);
    let mut c = gc(74, "4.3", "rewritten", "a filling's rights: those of the version it was earned under; no later version changes them, U having assented to none", "5.10.7",
        &[Q_5107, Q_5107_NAME], &[R_HER, R_C10, R_UNKNOWN], &s2, "rights", vec![o0, buyer.id],
        ans("shown", "5.10.7", "as shown", "U's filling has the rights O offers; O v2 and O v3 change nothing of it: U has signed no assent to either").who(&buyer.id));
    c.stubs = vec![asked("K5", stub::K5, "who fills the spot at position 1 of O, by which proof? (O's role; parameters [[U], true])", "U, by U's assent to O, earned under O")];
    out.cases.push(c);
    out.cases.push(gc(75, "4.2", "rewritten", "the receiver named by an offer: its maker", "5.1.4",
        &[Q_514_NOVER, Q_514_PARTY], &[R_HER, R_C2], &s, "receiver", vec![o0],
        ans("shown", "5.1.4", "as shown", "O v2, in force, names party 0, M, as receiver").who(&m.id)));
    // A role as receiver, filled once; an unknown spot cMIP.
    let mut s = Sc::new();
    s.who(&m, "M");
    s.who(&buyer, "U");
    let x0 = s.root("v2/spot receiver/X", &m, terms(vec![v::party_signer(&m.id), role(3, &what, k5(&[&buyer.id], true))]).set(tk::IN_FORCE, k2(vec![who_signer(&m.id)])).set(tk::RECEIVER, arr(vec![u(0), u(1)])));
    s.assent("v2/spot receiver/U's assent to X (the proof)", &buyer, &x0, &x0);
    let mut c = gc(76, "4.2", "rewritten", "a receiver named as a role, filled once: the one who fills it receives", "5.1.4",
        &[Q_514_VER, Q_514_ANY, Q_514_NONE], &[R_HER, R_C6, R_K5_STUB, "U's assent to X is written as the proof: verifier 2's stub listed the filling in its parameters"], &s, "receiver", vec![x0, x0],
        ans("shown", "5.1.4", "as shown", "X names the role at position 1 as receiver; it is filled once, by U").who(&buyer.id));
    c.stubs = vec![asked("K5", stub::K5, "who fills the spot at position 1 of X? (parameters [[U], true])", "one filling: U, by U's assent to X")];
    out.cases.push(c);
    let mut s = Sc::new();
    s.who(&m, "M");
    let x1 = s.root("v2/spot unknown/X", &m, terms(vec![v::party_signer(&m.id), role(3, &what, socket(&g("a spot cMIP not held"), Value::Null))]).set(tk::IN_FORCE, k2(vec![who_signer(&m.id)])).set(tk::RECEIVER, arr(vec![u(0), u(1)])));
    out.cases.push(gc(77, "4.2", "rewritten", "a receiver named as a role whose cMIP the verifier lacks: unchecked", "5.1.4",
        &[Q_514_LACK, Q_TASK_LACK], &[R_HER], &s, "receiver", vec![x1, x1],
        ans("unchecked", "5.1.4", "none", "the role's spot cMIP (task K5) is not held")));
}

// ================================================================ 78 to 98

fn leg_cases(out: &mut Out) {
    let reading = vec!["the lead's note of 27 November, row F21, C40: \"§5.11 names the report block; until the MICS carries it, every answer about reports is unchecked, and the eleven leg cases wait with it.\" The lead's reading; the sheet, section 4.3: retired, the reading of leg reports going to the MICS's report block".to_string()];
    for i in [78usize, 80, 81, 82, 83, 84, 85, 86, 92, 93, 94] {
        out.retired.push(Retired { v2: i, rule: "§4.3", says: vec![Q_REPORT, Q_REPORT_READ], reading: reading.clone() });
    }
    let sv = tid("S");
    let p = tid("P");
    // 79: control named.
    let mut s = Sc::new();
    s.who(&sv, "S");
    s.who(&p, "P");
    let w = s.root("v2/leg/W, a service passing on to P", &sv, terms(signers(&[&sv, &p])).set(tk::RECEIVER, arr(vec![u(0), u(0)])).set(tk::CONTROL, stub_socket(stub::K6, Value::Null)).set(tk::CALLS, arr(vec![arr(vec![u(6), u(2)])])));
    s.assent("v2/leg/P's assent", &p, &w, &w);
    out.cases.push(gc(79, "4.1", "rewritten", "Terms whose `control` names a cMIP hold the Control task", "5.11.2",
        &[Q_5112], &[R_HER], &s, "holds_control", vec![w],
        ans("shown", "5.11.2", "none", "their `control` names a cMIP (the K6 stub)")));
    // 87, 88: control empty.
    let mut s = Sc::new();
    s.who(&sv, "S");
    s.who(&p, "P");
    let w1 = s.root_body("v2/leg/W1, empty control, a part for P", &sv, terms(signers(&[&sv, &p])).set(tk::RECEIVER, arr(vec![u(0), u(0)])), Value::Map(vec![(u(0), arr(vec![u(0), u(1)]))]));
    let mut c = gc(87, "4.1", "rewritten", "with `control` empty, a receiver among the parties who holds for others holds the Control task", "5.11.2",
        &[Q_5112, Q_5112_PART], &[R_HER], &s, "holds_control", vec![w1],
        ans("shown", "5.11.2", "none", "the receiver is party 0, S, and the body's cMIP gives a part to party 1, P"));
    c.stubs = vec![asked("K1", stub::K1, "what do these words say: which parties are given a part? (parameters {0: [0, 1]})", "parties 0 and 1")];
    out.cases.push(c);
    let mut s = Sc::new();
    s.who(&sv, "S");
    s.who(&p, "P");
    let w2 = s.root("v2/leg/W2, empty control, no part", &sv, terms(signers(&[&sv, &p])).set(tk::RECEIVER, arr(vec![u(0), u(0)])));
    let mut c = gc(88, "4.1", "rewritten", "with `control` empty and no part given to another party: the Control task is not held", "5.11.2",
        &[Q_5112_PART], &[R_HER], &s, "holds_control", vec![w2],
        ans("not shown", "5.11.2", "none", "the body's cMIP gives no part to any party other than the receiver"));
    c.stubs = vec![asked("K1", stub::K1, "what do these words say: which parties are given a part? (parameters null)", "none")];
    out.cases.push(c);
    // 89, 90, 98: a data question about a report: no report in encoding 3.
    for (i, what) in [(89usize, "may a reader read a leg report beyond its leg: a data cMIP that answers yes"), (90, "may a reader read a leg report beyond its leg: an empty data socket"), (98, "the buyer's leg beyond it: the confirmation, the offer's data empty")] {
        out.waiting.push(Waiting {
            what: format!("verifier 2's grammar case {i}: {what}"),
            why: "waits for the MICS's report block: the question is asked of a report, an act draft 26 and encoding 3 give no bytes (draft 26, §4.3; encoding 3, section 6); the lead's note, row F21, C40: \"until the MICS carries it, every answer about reports is unchecked\". Not on the list of the eleven leg cases retired; written when the report's bytes exist".into(),
        });
    }
    // 91: before paying.
    let mut s = Sc::new();
    s.who(&sv, "S");
    s.who(&p, "P");
    let w = s.root("v2/before paying/W", &sv, terms(signers(&[&sv, &p])).set(tk::RECEIVER, arr(vec![u(0), u(0)])).set(tk::CONTROL, stub_socket(stub::K6, Value::Null)).set(tk::CALLS, arr(vec![arr(vec![u(6), u(2)])])));
    s.assent("v2/before paying/P's assent", &p, &w, &w);
    let o = s.root("v2/before paying/the work, receiver W", &p, terms(signers(&[&p])).set(tk::RECEIVER, arr(vec![u(2), b(&w)])));
    let mut c = gc(91, "4.1", "changed", "before paying: the work's Terms not in force, so no sequence is followed: not shown", "5.11.4",
        &[Q_5114, Q_541_KNOTS], &[R_HER], &s, "before_paying", vec![o],
        ans("not shown", "5.11.4", "as shown", "the work has no Terms in force (P has made no act within it after its Terms act), so `receiver` is not followed to W"));
    c.against_sheet = None;
    out.cases.push(c);
    // 95 to 97: contests.
    let m = tid("M");
    let buyer = tid("U");
    let what = g("what: a buyer (stand-in)");
    let mut s = Sc::new();
    s.who(&m, "M");
    s.who(&buyer, "U");
    let o = s.root("v2/buyer/the offer", &m, terms(vec![v::party_signer(&m.id), role(3, &what, k5(&[&buyer.id], true))]).set(tk::IN_FORCE, k2(vec![who_signer(&m.id)])).set(tk::RECEIVER, arr(vec![u(0), u(0)])));
    s.assent("v2/buyer/U's assent (the buyer signs the offer's Terms)", &buyer, &o, &o);
    let pay = g("v2/the buyer's payment (stand-in)");
    let st = g("v2/the buyer's settlement (stand-in)");
    s.names.insert(pay, "the buyer's payment (stand-in, Money table)".into());
    s.names.insert(st, "the buyer's settlement (stand-in, Money table)".into());
    let money = json!({ "payment": v::hx(&pay), "payer": v::hx(&buyer.id), "version": v::hx(&o), "settlement": v::hx(&st), "amount": 10 });
    s.money.push(money);
    let cid = s.st("v2/buyer/U's contest", &buyer, v::statement(&o, &o, v::kind::CONTEST, None).set(sk::SETTLEMENT, b(&st)));
    out.cases.push(gc(95, "4.2", "rewritten", "a contest made against an offer: it reaches the signers that version names, and no one else", "5.11.8",
        &[Q_5118_REACH, Q_5118_VER], &[R_HER, R_C12], &s, "contest", vec![cid],
        ans("shown", "5.11.8", "as shown", "it names the offer, a version shown (in force or not); it reaches M, the one party the offer names as a signer").who(&m.id)));
    let mut c = gc(96, "4.1", "rewritten", "a buyer's contest: a payment by the same signer naming the same settlement and version is held", "5.11.8",
        &[Q_5118_BUYER], &[R_HER], &s, "contest", vec![cid],
        ans("shown", "5.11.8", "none", "a buyer's contest: U's payment names the same settlement and the offer").who(&buyer.id));
    c.also = vec![ans("shown", "5.11.8", "as shown", "it reaches M").who(&m.id)];
    out.cases.push(c);
    let mut s2 = s.clone();
    s2.money.clear();
    let mut c = gc(97, "4.1", "rewritten", "a contest naming a settlement, and no such payment held: whether it is a buyer's is unchecked", "5.11.8",
        &[Q_5118_BUYER], &[R_HER], &s2, "contest", vec![cid],
        ans("unchecked", "5.11.8", "none", "no payment by U naming that settlement and version is held"));
    c.also = vec![ans("shown", "5.11.8", "as shown", "it reaches M").who(&m.id)];
    out.cases.push(c);
}

// ================================================================ 99 to 113: waiting

fn baker_cases(out: &mut Out) {
    let names = [
        (99, "the baker at the cited act is a party, bound: the Terms count"),
        (100, "no answer from the envelope's chain: unchecked"),
        (101, "after a sale, Terms made with the holder of the moment keep counting"),
        (102, "after a sale, Terms with the holder of the moment stay in force"),
        (103, "the buyer of the rights holds them from the transfer on: Terms citing it need that holder"),
        (104, "Terms citing the transfer, without the holder it names: invalid"),
        (105, "late Terms, shown by knots: they name a transfer that follows the act they cite"),
        (106, "late Terms are not in force"),
        (107, "a thief's Terms cite a point of the chain where he held nothing: invalid, for good"),
        (108, "a thief's Terms: no one receives by them"),
        (109, "`envelope_at` names an act, held, that is not an act of the envelope's chain: invalid"),
        (110, "Terms that name the holder, who is not shown bound by them: not shown"),
        (111, "a double sale: the act cited lies in a fork of the envelope's chain"),
        (112, "the same work baked again: shown beside the answer, with each other envelope"),
        (113, "the same bytes baked by another: Terms that name that envelope and its baker"),
    ];
    for (i, n) in names {
        out.waiting.push(Waiting {
            what: format!("verifier 2's grammar case {i} (G14): {n}"),
            why: "not placed, as asked: the sheet's question 11 (retired with G14, moved to Envelopes' vectors, or kept where draft 26 still reads an envelope: 5.1.4, 5.11.9, §4.4 case 7); the lead's note, row C11, F20, reads \"Moved to Envelopes' vectors, except those the three rules draft 26 keeps (5.1.4, 5.11.9, §4.4 case 7) still exercise\", his reading, not yet taken".into(),
        });
    }
}

// ================================================================ 114 to 119, and the retirements 58 and 64

fn misc_cases(out: &mut Out) {
    out.retired.push(Retired {
        v2: 58,
        rule: "5.6.6(a)",
        says: vec![Q_566A, Q_557E_NOPOWER],
        reading: vec![
            "the sheet, section 4.3: \"G 58 (`update`; 5.5.5, part 1): a delegation ended by the delegator alone, valid by default: G5.5 is gone (its bytes would answer **not shown**)\"".into(),
            "draft 26 has no rule letting the delegator alone end a delegation by default: by 5.6.6(a) and 5.5.7(e) such a version needs every known party, the agent among them; the case's sentence (draft 25's G5.5) is gone, and its bytes, read under draft 26, would answer not shown (the sheet's new line 51 tells that story)".into(),
            R_KNOWN.into(),
        ],
    });
    out.retired.push(Retired {
        v2: 64,
        rule: "5.5.3",
        says: vec![Q_553_READER],
        reading: vec!["the lead's note of 27 November, row C9: \"Retired; its sentence is gone.\" The lead's reading, resting on the ledger's \"A condition in time with no anchor is refused\" (26 November, 18:00–18:30)".into()],
    });
    let mut s = Sc::new();
    let (a, bb) = ab(&mut s);
    let root = s.root("v2/whole/root, a relies_on entry that is no fingerprint", &a, terms(signers(&[&a])).set(tk::RELIES_ON, arr(vec![txt("a side piece, by name")])));
    out.cases.push(gc(114, "4.1", "rewritten", "an entry of `relies_on` that is no fingerprint is not part of the Terms, and is left unread", "5.2.3",
        &[Q_523_REL], &[TEXT_ALONE], &s, "whole", vec![root],
        ans("shown", "5.2.3", "none", "left unread: the entry of `relies_on` that is a text, not a fingerprint")));
    let mut s = Sc::new();
    s.who(&a, "A");
    s.who(&bb, "B");
    let root = s.root("v2/whole/a call in Terms that do not hold its task", &a, terms(signers(&[&a, &bb])).set(tk::CALLS, arr(vec![arr(vec![u(6), u(2)])])));
    out.cases.push(gc(115, "4.1", "rewritten", "a call in Terms that do not hold the task it is attached to is left unread", "5.2.3",
        &[Q_5112_CALL, Q_5112], &[TEXT_ALONE], &s, "whole", vec![root],
        ans("shown", "5.2.3", "none", "left unread: the call for K6, in Terms whose `control` is empty and that name no receiver")));
    let mut s = Sc::new();
    s.who(&a, "A");
    let bad = s.root("v2/author/an author who is no party", &a, terms(signers(&[&a])).set(tk::AUTHORS, arr(vec![u(1)])));
    out.cases.push(gc(116, "4.1", "rewritten", "an author who is not one of the parties: invalid", "5.3.1",
        &[Q_531_INVALID], &[TEXT_ALONE], &s, "act", vec![bad],
        ans("invalid", "5.3.1", "none", "`authors` names position 1, beyond the one party")));
    let mut s = Sc::new();
    s.who(&a, "A");
    let bad = s.terms_raw("v2/whole/a body not named by fingerprint", &a, None, terms(signers(&[&a])).set(tk::BODY, arr(vec![txt("words by address"), stub_socket(stub::K1, Value::Null)])).set(tk::PREVIOUS, previous(None)));
    out.cases.push(gc(117, "4.1", "rewritten", "a body not named by fingerprint makes the Terms invalid", "5.2.1",
        &[Q_521, Q_523_BODY], &[TEXT_ALONE], &s, "in_force", vec![bad],
        ans("invalid", "5.2.1", "none", "the body's words are a text, not a fingerprint")));
    // An assent made under Terms not held.
    let mut s = Sc::new();
    let (a, bb) = ab(&mut s);
    let gg = tid("G");
    s.who(&gg, "G");
    let root = s.root("v2/unchecked under/root", &a, terms(signers(&[&a, &bb])));
    let d = s.missing("a delegation this verifier does not hold");
    let x = s.st("v2/unchecked under/G's assent for B under Terms not held", &gg, v::statement(&root, &root, v::kind::ASSENT, None).set(sk::FOR, who_signer(&bb.id)).set(sk::UNDER, b(&d)));
    out.cases.push(gc(118, "4.1", "rewritten", "an assent made under Terms the verifier lacks: unchecked", "5.6.1(b)",
        &[Q_UNCH, Q_561B_INFORCE], &[R_HER, R_KNOTS], &s, "assent", vec![x],
        ans("unchecked", "5.6.1(b)", "none", "its `under` names Terms not held")));
    out.cases.push(gc(119, "4.1", "rewritten", "Terms whose completing assent rests on Terms not held: in force is unchecked", "5.4.1",
        &[Q_UNCH, Q_541_DEFAULT], &[R_HER, R_KNOTS], &s, "in_force", vec![root],
        ans("unchecked", "5.4.1", "none", "whether an assent is counted in B's name rests on Terms not held")));
}
