# Step 11b: the false clone mark, 8 October 2026

*A building session after the human test of 8 October 2026 (roadmap step 11b). Against Law draft 10, core v21, freeze suite v21. For Nobody, allegedly.*

## In plain words

The collective client let a change be signed and sent whose record of who signed was wrong in Law's eyes. That record is the clone's "mark" (rule 45a): it names the members who bring the change into force. The client counted those members from its own notes on this computer, not from what Law reads at the relays. When the two disagreed, the client named too few people. Law then judged the change invalid. From that moment, Law found no agreement in force for the collective and read it as broken. The client went on showing the new rules as if they applied.

Now the client asks Law before anything is signed: which powers the change needs, and whose voices count for each. Law asks again, from what the relays hold, before the clone is proposed and before the change is sent. If Law would not count the change, it stops there and says why. The collective's box shows Law's reading. Where Law reads a collective as broken, the box says so and gives Law's reason. Signing and checking a release say the same in full sentences.

## What was wrong

**Which change carries the false mark: the first one,** the removal of a member with the release rule set to one. On the Mac, the release made after it, under the rule of one, was already refused to a second signer as "not a collective's release". The client says that only when Law gives no agreement in force. So the collective was broken from the removal on, and the rule of one played no part. The change back to two then built on a broken collective. Law reads a collective's rotations in order and stops at the first one that fails. Both checks therefore report the removal's rotation.

**Why the client computed it.** A removal works in three steps:

1. The member resigns, and the collective draws a record, its line (rule 37a).
2. The members who stay sign the clone.
3. A rotation declares the clone.

Law counts the constitutional change rule (rule 44d), here "every member whose voice remains", among the voices that remain *at the rotation*. A member who resigned counts as gone only if the record registering the resignation is a line before the rotation, in what the relays hold. The client did not check this. It took the record as drawn because its own file said so, and it named the three who stay. Where Law did not see that record as a line, Law still counted four voices. A mark naming three is then "too few signers to meet the power" (rule 45a). The rotation's clone is invalid, and by rule 37 "the collective's acts that need member signatures count for nothing".

**The trigger on the Mac is not known.** The sequence as described (four found, one removed with the rule set to one, the rule set back to two) passes against today's code. I tried it with 80 combinations of the change form, with a home that refuses the collective at first (as the onion home did), with a home away during the removal and the change sent again, and with a run that stopped halfway and was tried again. Law counted the change in every case. The failing test therefore reproduces the mechanism. The removal's record is lost on the way to the relay, although the relay answered that it took it. Against the client before this step, that test fails with the human test's words exactly: "not a release: nothing: the rotation's declared clone is not complete with the signature acts it names: the mark names too few signers to meet the power (rule 45a) must sign it; 0 did (none)". A core test shows the same thing at the level of Law (`the_next_line_counts_the_voices_a_mark_names`). Whatever the Mac's trigger was, the fix covers it, because Law counts from what the relays hold before anything more is signed.

## What changed

**The core library and its bindings** (`core/src/law/view.rs`, `wasm/src/lib.rs`). These are two new questions a client can ask Law. They add no rule.
- `next_voices` / `lawNextVoices`: who counts for a power of the agreement in force at the collective's *next* line, after every act held under its latest key. It gives the voices that remain and how many of them meet the power, counted by Law's own `voices` and `Rule::needed` (rule 44d). It can leave out members whose resignations the change will register first. It returns why there is no count where the collective is broken, ended or forked. Built on a new point in Law's counting, `Point::Tip`: every record held counts before it.
- `broken` / `lawBroken`: why Law reads a collective as broken, or nothing.

**The collective client** (`clients/collective/src/actions.ts`, `page/`; `clients/repo/src/collective.ts`, `release.ts`).
1. *Marks from Law.* Every clone the client makes takes its mark from Law: a member or rules change, new words for the Releases area, who judges absence, stakes and the split service. The powers come from the agreement in force as Law finds it and the clone's bytes (`lawClonePlan`). For each power, the signers are the voices Law counts (`lawNextVoices`). If too few of them can sign on this computer, the review is blocked with a plain sentence. The review also shows what Law counts. The repo client takes the mark as given and runs two checks: Law counts again from a fresh reading of the relays before the clone is proposed, and again once it is signed, before the record or rotation is sent. If either check fails, the change stops, nothing more is signed and nothing is put in force, and the result says so. Resignations already registered stay, as leaving always does.
2. *The client's reading comes from the verifier.* The collective's box shows the members, the rules, the Releases area and its holders, how many a release needs, and the agreement in force, all from Law's reading of what the relays and homes hold. The same goes for the counts in the reviews for releasing, leaving, stepping down, declaring absence, forking and closing. Where Law reads the collective as broken, the box says so with Law's reason, and the rules shown are labelled as this device's copy. Releases and changes of a broken collective cannot be signed. Leaving is never blocked (rule 37a); its review carries the same warning. One reading is kept from this device: a member declared absent while holding the everyday key is shown as left. Their declaration is signed and takes effect at the recovery rotation, where Law still counts them until then (C7, B16).
3. *Wording.* A broken collective is never called "not a collective's release". Signing one of its releases says: "No signature can make it a release. Law reads the collective that published it as broken: no agreement can be found in force for it, so no member's signature can make this a release. Law's reason: …". The check no longer writes "It needs nothing: …" or "not a release: nothing: … must sign it; 0 did". It writes that same sentence. A release under a signer's own name reads: "It is published under its signer's own name, not by a collective: no member's signature is asked for."

**Tests.** `clients/collective/test/mark.test.ts` has three tests: the human test's sequence, the lost record (failing before this step, as above) and a broken collective's wording. There is also the core test named above. Collective client 24 of 24, including the browser test. Rust workspace 408 passed, Law's collective tests 98 of 98 with the new one. Repo client 13 of 13. Connector 12, desk 10, genesis 17, reader 16, site 27, barebone 9, manage 7, longform 26, all passing.

## Questions for Nobody, allegedly

1. **Can a broken collective be repaired?** Rule 37 says that when a rotation declares a clone that is not complete, "the collective's acts that need member signatures count for nothing". It does not say what happens next. Could a later rotation declare a complete clone of the last agreement that was in force (here the founding agreement) and bring the collective back? Or is the collective finished, so that its members refound it? The core today reads it as broken for good, and the client says so and signs nothing for it. The test collective on the Mac is in this state; being test only, it can be refounded either way.
2. **Can a member leave a broken collective?** A resignation names the agreement in force (rule 37a), and Law finds none. The client lets the member sign one, with a warning, because nothing may block leaving. Whether that resignation counts for anything is open.

## Open, not a question of Law

- **What lost the record on the Mac.** With this version, the collective's box on the Mac will state Law's reason. If the cause matters, the collective's file (`~/mor-collective/collectives/`) and `history.jsonl` from that run would show which acts the client made, to compare with what the homes hold.
