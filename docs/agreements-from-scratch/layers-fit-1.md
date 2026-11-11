# Agreements from scratch, draft 1: does it fit the layers below it?

11 November 2026. A record of work by a Claude session: a check, not a decision. It decides nothing, and changes neither draft 1 nor any MIR.

**Current wish** (Nobody, allegedly, `docs/decisions.md`): "I've decided for a total rewrite of agreements from scratch." "No translation, fresh from the research we had all agreed was excellent direction."

**What was read.** `docs/agreements-from-scratch/draft-1.md` (branch `claude/agreements-from-scratch-3ibcsy`, pull request 147), section 8 first, then the whole draft; and, in `spec/`, Identity draft 16, Text draft 11, Envelopes draft 12 and Money draft 14. **Not opened:** any Agreements draft, the MICS, Development, `docs/findings/`, `docs/reviews/`, `docs/agreements-inventory/`, `docs/agreements-marking/`. Where a MIR cites "Agreements rule n" or Development, the citation is reported as the MIR's own words; what the cited rule says was not looked up.

**Quotations.** "Draft 1" quotes `draft-1.md`. "Identity", "Text", "Envelopes" and "Money" quote the MIR drafts named above, with the rule or section.

---

## 0. In plain words

Draft 1 says that five things are done by the layers under it: fixing words (State), signing (Sign), carrying acts to people (Deliver), putting acts in order (Order) and power over value (Control). The four MIRs were read to see whether they really do.

**What the layers give, more or less as draft 1 hopes:**

- **State.** Every act and every work has one fingerprint, and the same words always make the same bytes. This holds.
- **Sign.** Every act has exactly one signer. An act of two people is two acts, the second naming the first: the same shape draft 1's assents already have.
- **Deliver, as carrying.** Acts can be public or sealed to a recipient, and anyone can find anyone's inbox. A recipient can sign "I received this". What the layers do not give is proof that an act *arrived* other than the recipient's own word.
- **Order, inside one line.** Each person's acts carry a running count, any chain of acts can be forked and the fork is provable, and a person's identity chain is one line that never branches.
- **Control, as proof of payment.** A payment is proven by the receiver's receipt or the payer's claim, checked against the rail. Money holds nothing and moves nothing.

**What the layers do not give, though draft 1 counts on it:**

1. **No "place to look" that can say "nothing later".** There is no Order layer. The layers give order *inside* a chain and say plainly that nobody can prove something is missing: "no verifier can prove an omission; completeness and freshness are the market's" (Identity, rule 20). Draft 1's rule 6 rests on a place the layers do not define. The nearest things (a home's receipts, a "keeper") are either for identity-chain acts only, or are named by the layers as *Agreements'* own.
2. **No holder of value.** Draft 1's task K8 asks a "controller" whether it carried out an instruction. Money defines no controller, no escrow and no release: "A Module is a specification: it signs nothing and holds no money" (Money).
3. **No independent evidence of delivery.** Draft 1's K9 allows "the Deliver layer's evidence". Envelopes gives none: the sealed container's outside "is unauthenticated by design", and what a relay holds "is the relay transport cMIP's".

**Where draft 1 and the layers pull against each other** (section 3 below has each one quoted on both sides):

- **When a key is lost or stolen.** Draft 1's rule 5 says two acts naming the same previous act prove "that person told two stories", and a verifier "MUST NOT choose between the branches". Identity lets the owner's next rotation choose: acts it does not keep are void, unless someone relied on them, and then they are "disputed". A thief's act, under draft 1, would convict the owner.
- **Agents signing with the principal's key.** The layers already have "grant keys": a key the principal installs, so that the act's *signer* is the principal. Draft 1's rule 4.1(a) binds anyone who "signed it in their own name". An agent's act under a grant key would pass as the principal's own signature, and skip the power check of 4.1(b).
- **Words.** "Fork", "shown", "position", "witness", "kind" and "unknown" already mean something in the layers, and not what draft 1 means.
- **What the layers expect of Agreements.** The four MIRs name Agreements 186 times between them: payment cMIP in "terms field 2", publications, ownership agreements, grants, collectives, keepers, chain-signed forks and closings, negotiation messages. Draft 1 provides none of these hooks. That is not a flaw in draft 1 by itself (it was written fresh, as wished), but every one of these sentences in the lower MIRs will point at nothing until either draft 1 or the MIR is changed. Which way is for Nobody, allegedly, to decide.

**What the layers offer that draft 1 could use instead of its own rules:** the per-person sequence and the identity chain (for rule 5), rotation and "disputed" (for honest forks), `acks` and the witness act (for K9 and #20), anchoring on a clock (for deadlines), succession (for #37), vows (for things that cannot be hashed), "going public later" (for #40), Money's obligations, releases and double entry, and the layers' one word for "could not check": **unknown**.

---

## 1. Draft 1's section 8, answered from the MIRs

### 1.1 Does the core give fingerprints of fixed bytes?

**Plain words.** Yes, several, each kept apart by a tag so one kind can never pass for another. An act's fingerprint is its act id; a file's or a text's is its work hash; a specification's is its spec hash. But a fingerprint of the *first* act of a chain (a vow, a price tag, an agreement's root) names the chain, not fixed words: later versions can change what it says.

**Precisely.**

- Act id: "The act id is `tagged_hash("MOR/act", outside)`, where `outside` is the encoded outside of the act, which commits to its locked inside (Envelopes MIR). The signature is not part of the act id, so a signature can never change which act is meant." (Identity, Part three, "Act id")
- Work hash: "The work hash is `tagged_hash("MOR/work", plaintext)`, over the complete plaintext of the work. For a text work, the plaintext is its canonical text. It is the same wherever the work travels and however it is locked or cut" (Envelopes, section 8)
- Spec hash: "Every act names the specification that defines its type by that specification's spec hash. [...] `tagged_hash("MOR/spec", content)`" (Identity, Part three, "Spec hash")
- Identity hash: "The hash of an identity's genesis act. It is the identity." (Identity, Words)
- Tags keep kinds apart: "Every tag the core uses begins with `MOR/`: `MOR/act`, `MOR/inside`, `MOR/mmr-leaf`, `MOR/mmr-node`, `MOR/work`, `MOR/spec`, `MOR/safety`, `MOR/sealed/wrap` and `MOR/law/leftover` (Agreements). [...] *Tags keep the hashes of different kinds of object apart, so one can never be passed off as another.*" (Identity, Part three, "Hashes")
- Same words, same bytes: "**Canonical text:** the one form every piece of text takes inside any act, so that the same words always give the same bytes, and therefore the same hash." (Text, Purpose)
- Written for people: labels `mact` (an act), `mwork` (a work), `mspec` (a specification), `mid` (an identity) (Identity, "Written for people").
- A web reference may carry a hash: "A web reference may carry the hash of what was there when it was referenced, so readers can check it has not changed." (Envelopes, rule 20)
- **The limit.** A vow's fingerprint names a chain whose words can change: "**It is its own chain:** its first act is its **genesis**, **whose id is its name for good**; a later version (a new date, a changed description) is signed again on that chain by the genesis's signer" (Envelopes, section 9). The same pattern holds for price tags ("A tag is versioned", Money rule 18) and payee pointers (Money rule 1).

**What it means for draft 1.** Draft 1 defines "**Fingerprint**: the identifier the core gives to fixed bytes" as if there were one. There are several; rule 1 ("named by fingerprint") is met by any of them, but `body` should say which (a text act's act id, or a work hash of the words), and rule 1 is not met by naming a chain's root when what is relied on is one version of it. Draft 1's own Agreement identifier, "the fingerprint of the first Terms act (the **root**)", is such a chain name.

### 1.2 Does a per-signer chain already exist (making rule 5 redundant)?

**Plain words.** A per-signer line exists, and a second, stronger one too. Neither makes rule 5 redundant, because neither is *per agreement* and neither treats two acts on one previous act as proof of a lie. The ordinary line (the "sequence") lets a person keep as many lines as they like and start a new one at any time. The strong line (the identity chain) never branches, but each act on it costs a chain-key ceremony.

**Precisely.**

- The sequence: "Every everyday act (Identity: every act other than genesis, a rotation and a chain signature) carries, inside, its position in the signer's sequence and a running summary of that sequence." and "**Single lines.** Within a sequence, every act names at most one predecessor. Parallel devices keep separate sequences." (Envelopes, section 4)
- Several sequences, by choice: "**Sequence.** A line of everyday acts by one identity, each naming the previous act in the line. An identity may keep one sequence or several; the split is the owner's choice." (Identity, Words)
- A new sequence at will: "`prev` holds one act id in the ordinary case, and none (an empty array) when the act starts a new sequence." (Identity, "The envelope")
- What a sequence is for: "*These make it cheap to prove that an act lies on the line leading to a later one, which is how a rotation's kept ancestry is checked (Identity).*" (Envelopes, rule 13)
- A fork is defined over chains named in `objects`, not over sequences: "**Fork.** Two acts naming the same predecessor in the same chain." and "**Chain.** The acts on one object, each naming the act or acts it follows." (Envelopes, Words); "Two valid acts naming the same predecessor in the same chain are a fork, provable from their signatures and insides. Whether a fork is normal or a conflict is defined by the MIR that defines the object." (Envelopes, rule 15). I found no sentence calling two acts with one `prev` a fork.
- The line that never branches: "*The one line of an identity that never branches is its identity chain; a signature placed there is ordered against every other one of the same identity, whatever devices the identity uses. A higher MIR says which of its acts need one*" (Identity, Words, "Chain signature"); "*Stated cost:* every chain signature spends a chain key, so it goes through the same ceremony as a rotation (the air-gapped device), and is as slow and heavy." (Identity, section 7)

**What it means for draft 1.** Rule 5 is not redundant. It also overlaps two things the layers have: an `objects` chain whose root is the agreement (an agreement-wide chain, all signers together, forks provable by Envelopes rule 15), and the signer's sequence. Rule 5.2's "or that both name none" is draft 1's own convention; the sequence has no equivalent, since "none" is how any new sequence starts.

### 1.3 Acts signed by several people

**Plain words.** No act has two signers. An act two people agree to is two acts, the second naming the first. Draft 1 already works this way (Terms, then one assent per person).

**Precisely.** "Every act has exactly one signer. An act that needs the agreement of two identities, such as a link, is made of two acts: one by each, the second naming the first." (Identity, section 2). The format has one `signer` and one `signature` per act: "`act = [ outside, locked: bstr, signature ]`" with "`? 0 => hash, ; signer: identity hash (absent only in genesis)`" (Envelopes, Part three).

A person can also place their signature on someone else's act by a chain signature: "The act it signs need not be held, nor be the signer's" (Identity, section 7).

### 1.4 Field names

**Plain words.** Fields have numbers, not names, and every map is closed: a field not listed makes the act invalid. Every act already has a set of fields; an Agreements act adds only its payload. Some of draft 1's fields have a near twin among them.

**Precisely.**

- Closed maps, integer keys: "Every map a format defines is closed. Its keys are the small unsigned integers it lists. A key it does not list, a key that is not an unsigned integer, a required key missing, or a value of another type than the one written makes the act invalid." (Identity, "Encoding and conventions")
- What every act carries (Envelopes, Part three, "The act"): outside `0` signer, `1` binding, `2` inside commitment, `3` locked hash, `4` nonce, `5` content key, `6` to; inside `0` spec, `1` type, `2` prev, `3` objects, `4` payload, `5` position, `6` running summary, `7` acks, `8` refs, `9` hint, `10` salt.
- The chain pointer: "`object = [ chain: hash, predecessor: hash ] ; the chain's root act, and the act in that chain this one follows`" (Envelopes, Part three)
- A type is a specification and a number: "Every act names, inside, the specification that defines its type by hash, and a type number within it." (Envelopes, section 1)

Near twins of draft 1's fields: `previous` and core `prev`; `agreement` + `previous` and an `objects` entry `[root, predecessor]`; `answers` and `acks` / `refs`; `kind` and spec + type; `for` + `under` and the `[grantor, grant]` / `[collective, decision]` objects of Text rule 14. Section 3 below takes them one by one.

### 1.5 What an ordered place can answer; "nothing later than this"; how it is identified

**Plain words.** There is no Order layer and no "place" in the four MIRs. Nothing in them can sign "nothing later than this", and Identity says so in so many words. What exists:

- **inside a chain**, an order of what was added, with forks provable;
- **a home's receipt** for an identity-chain act, saying it was the *first* valid act the home accepted at that position, with a log whose growth auditors can check; but only for identity-chain acts (genesis, rotation, chain signature), and never a proof of absence;
- **an anchor** on a clock, proving an act existed *by* a point, a task for a cMIP;
- **a keeper**, which the layers name as an *Agreements* role.

A home is identified by its operator's identity hash, never by its address: that much carries over to any place draft 1 defines.

**Precisely.**

- Order inside a chain: "A chain's order records when acts were added to it, never when the things they refer to were created. Hints are never load-bearing. Every "before" in the core is judged inside one named chain, by reference to a specific act." (Envelopes, rule 16)
- No proof of omission: "**The same evidence is not promised.** The core decides alike on the same evidence and does not promise the same evidence: a home's compliance with rules 19 and 20 shows only through its receipts, its cosigned summaries and the other homes, and no verifier can prove an omission; completeness and freshness are the market's." (Identity, rule 20)
- A receipt: "**Receipt.** A home's signed statement that it holds a given identity-chain act, at a given position in that chain, recorded at a given position in the home's own log, and that it is the first valid act the home accepted at that chain position. The home's log position is a sequence number, never a time. A receipt counts only alongside the act it names." (Identity, Words)
- First held wins: "The first valid rotation a home holds wins at that home, and its receipt fixes that order." (Identity, rule 30)
- The log can be checked to grow, not to be complete: "a consistency proof shows that a later summary extends an earlier one" (Identity, "Log summary (type 9) and cosignature (type 10)")
- Relays state nothing in the core: "*Retired.* Rule 28 and type 2 of this MIR are retired [...] A relay's statement of the acts it holds is the relay transport cMIP's." (Envelopes, rule 28); "Nothing a relay says is trusted unless it is signed." (Envelopes, rule 25)
- Anchoring, a cMIP's: "**Anchoring.** A cMIP accepts any act id and produces a proof that the act existed by a point on a named clock. Two anchors are compared only on the same clock; anchors on clocks that cannot be compared order nothing. [...] Every layer above may rely on it: [...] Agreements for agreements' deadlines and time references, absence-proof modules for presence." (Envelopes, Tasks)
- The keeper, Agreements': "or a named keeper recorded it before recording the rotation (Agreements: the keeper record, type 2, and Agreements rules 41 and 42)" (Identity, rule 34); "A client SHOULD consult the homes before relying on an identity's act. Keepers MUST (see Agreements)." (Identity, rule 23)
- Identification without an address: "A home is declared by its operator's identity hash plus the relay's address." and "An address hint is where the home can currently be reached. It is not checked: the operator's identity is what counts, and the operator announces a new address through its own routes, so a home can move servers without any owner rotating." (Identity, Words and section 4)

**What it means for draft 1.** Rule 6, task K6, and every row of section 5 that lands on "rule 6" (#11 Title, #12 Sum, #13 Transfer, #32 Notify, #33 Current, #34 Whole, #36 Wait) rest on an operation that is **not provided**. Draft 1's `place` field ("the place to look, by the identifier the Order layer gives it") has no identifier to hold; an identity hash, as for homes, is what the layers would offer. Whether such a place can sign "nothing later" at all, given Identity rule 20, is a question for Nobody, allegedly; this check only reports that no layer does.

### 1.6 What happens to a chain when a key is replaced or lost

**Plain words.** A person replaces their everyday key by a *rotation*, signed with a separate chain key kept offline. The rotation names the latest genuine act of each of the person's lines. Everything on those lines up to there stays valid. Everything else signed with the old key is void, unless someone else relied on it in a way the layers can see (an acknowledgement, a keeper's record); then it stays, marked "disputed". A stolen key's acts are voided this way. A lost device with a backed-up seed is survivable; a lost chain key is the owner's loss. So: the layers do not leave a fork standing as proof of a lie; the owner's rotation settles which branch was theirs, and what others relied on stays visible.

**Precisely.**

- Rotation: "the owner rotates: the chain key, kept offline, signs a rotation that installs a new signing key, commits the next chain key and names the latest genuine act of each sequence. The rotation counts once the homes the home rule requires have receipted it; acts it does not keep, or disowns, are void, unless another identity acknowledged them or a named keeper recorded them." (Identity, Part one, *How it runs most of the time*)
- Kept: "If it lies within the rotation's kept ancestry and is not listed as disowned, it is valid, however old." (Identity, rule 33)
- Left out: "If it lies outside the kept ancestry, or within it but listed as disowned, it is void, unless: another identity acknowledged it [...] or a named keeper recorded it before recording the rotation [...] then it is valid and shown as disputed." (Identity, rule 34)
- A line not named: "An act signed with the old key in a sequence the rotation does not name is outside the kept ancestry." (Identity, rule 35)
- While a rotation waits: "Until then it is pending, and acts under its new key are pending too." (Identity, rule 28)
- The owner's own fork of a versioned chain: "If two valid routes acts name the same predecessor, or two are version 1, the routes are contested from that point [...] clients use the last act before the fork and warn the owner, who settles it by rotating." (Identity, "Which value counts", 3); a vow: "**Two versions naming one previous are the signer's fork, shown**, both standing (rule 15)" (Envelopes, section 9)
- Honest use does not break the line: "*A bad position or summary comes only from a buggy client or a careless thief, never from honest use (parallel devices, a restored backup)*" (Envelopes, rule 13)
- A lost device: "*That risk is the owner's choice, and it is survivable exactly when the signing seed is backed up apart from the device (rule 32).*" (Identity, rule 24)
- Homes gone, or hostile: the homeless rotation (Identity, section 10) and the escape with both keys: "An owner holding both keys can always leave homes that refuse them." (Identity, rule 53)
- A lost chain key: "*Stated cost: confirmation does not stop a thief holding the chain key from naming, and confirming, an identity of the thief's own; that is the cost of a lost chain key.*" (Identity, section 8)
- Evidence lasts only while its signer keeps it: "An act of another identity that a MIR uses as evidence (a receipt, an objection, an absence statement, a cosignature, an acknowledgement) counts only while its signer's chain keeps it valid." (Identity, section 6)

**What it means for draft 1.** Rule 5 *does* see a fork after a theft or a restored backup, and calls it a lie; Identity calls the stolen branch void and the relied-on one disputed. Section 3.2 below sets the two side by side. Draft 1's stated cost "Honest forks" has a remedy in the layers that the draft does not use.

### 1.7 How a cMIP is identified

**Plain words.** By its spec hash: the hash of its frozen text, in the format Development defines. A client that lacks it can fetch it by that hash and adopt it by choice; until then, what it defines is "unknown". So rule 1's "named by fingerprint" can be met for cMIPs.

**Precisely.**

- "**Specification.** The MIR or cMIP that defines an act's type, named by its hash." (Envelopes, Words)
- "*Since a specification's hash is unique, types can never collide, and no registry is needed.* A specification other than a MIR, the MICS document or a test suite names its creator (Development)." (Envelopes, section 1)
- "`mspec` | a specification: a MIR, a cMIP, a Module or a MIP | its 32-byte spec hash" (Identity, "Written for people")
- "A client MAY fetch an unknown specification by its hash, show it to the user, and adopt it by opt-in." (Envelopes, rule 31)
- "An act naming a specification whose content is not in Development's format names no specification: it is unknown to every client, since no client can have adopted it" (Envelopes, rule 30)
- A cMIP with parameters, as a pair: "`? 1 => [hash, any] ; a cMIP and its parameters`" (Envelopes, "Vow (type 5)"); clocks likewise, "each a clock Module under the anchoring cMIP and its parameters" (Money, "The clock").

The spec hash's exact content (`{ 0 => 4, 9 => text }` for Identity) and Development rule 26 are cited by Identity; Development was not opened.

### 1.8 Do "shown, not shown, fork, unchecked" have names elsewhere?

**Plain words.** One does, under another word: what draft 1 calls **unchecked**, every layer calls **unknown**. "Fork" exists, but means only the shape (two acts on one previous act), and each MIR says whether it is normal or a conflict. "Shown" exists too, but as what a *client displays* ("shown as disputed"), not as a verdict. "Not shown" has no twin. The layers also have verdicts draft 1 has no word for: **valid, invalid, void, disputed, pending, contested, scoped**.

**Precisely.**

- Unknown: "A verifier that holds the acts a rule needs answers as the rule says. One that does not (an act below a kept tip whose line it cannot rebuild, a scoped key whose installing act it has not held, a chain it cannot resolve) answers unknown, never valid, void or invalid, unless a rule it can apply shows the act invalid" (Identity, "A verifier that cannot tell answers unknown"); "A client MUST NOT sign, pay or accept anything whose specification it does not implement. It shows such an act as unknown." (Envelopes, rule 30); Money's verification answer: "valid, invalid, pending or unknown" (Money, Words).
- Invalid beats unknown: "A verifier that can show an act invalid by any rule it can apply (its shape, its text, its acknowledgements) does so, whatever else in it the verifier cannot read; unknown is the verdict only where no rule it can apply fails." (Envelopes, rule 30)
- Fork as shape: "Whether a fork is normal or a conflict is defined by the MIR that defines the object." (Envelopes, rule 15); for a person's own versioned chains the word used is **contested**: "Two pointers naming the same predecessor are contested: clients use the last pointer before the fork and warn the owner." (Money, rule 1)
- Shown as display: "then it is valid and shown as disputed" (Identity, rule 34); "A bake whose size (field 3) is not the size of the unlocked media is shown as inconsistent." (Envelopes, rule 22)
- Answers that rest on one's own attempts: "An answer that rests on the verifier's own failed attempts is marked as such ("re-homed without audit"), and nothing binding may rely on it (MUST NOT)" (Identity, "Every verifier gives the same answer"). This is the nearest twin of draft 1's qualifier **as shown**.

---

## 2. Each operation draft 1 names

| Operation (draft 1) | Layer | What provides it | Verdict |
|---|---|---|---|
| **State**: "words that cannot shift" | Text, Envelopes, Identity | Canonical text (Text rules 1, 7 to 13); act id, work hash, spec hash (1.1 above); the text act (Text, type 0); the vow for what cannot be hashed (Envelopes, type 5) | **Provided**, with the limit in 1.1: a chain's root names a chain, not fixed words |
| **Sign**: "a mark that binds someone" | Identity | One signer per act (section 2); binding to the key's identity-chain act (everyday check 2); rotation (section 5); chain signature for a signature ordered on the identity's one line (section 7) | **Provided** for one's own name. Acting for another by a grant key (Identity rule 8) or for a collective (Text rule 14) is carried by the layers but **judged by "Agreements rules 73 to 80" and "Agreements rule 58"**, which draft 1 does not have |
| **Deliver**: "getting the words to someone" | Envelopes, Identity | Public and private acts, sealed container, key delivery (Envelopes sections 2, 3); inbox routes (Identity rule 12); "going public later" (Envelopes, after rule 12); `acks`, "I received this" (Envelopes rule 17); witness act (Identity type 15) | **Carrying: provided. Evidence of arrival: only the recipient's own act.** "An act counts for a verifier only once the verifier holds it. Nothing forces propagation; delivery is the signer's interest." (Envelopes, section 7). The "Deliver layer's evidence" of K9 is **not provided** |
| **Order**: "placing them before or after something else" | Envelopes, Identity | Chains and provable forks (Envelopes rules 14 to 16); sequences (Envelopes section 4); identity chain, chain signature, home receipts, audited logs (Identity sections 4, 7, 13); anchoring on a clock (Envelopes, task, a cMIP) | **Order inside a chain: provided.** A place that answers "latest", "whole" or "nothing later": **not provided** (1.5 above). The keeper is named as Agreements' |
| **Control**: "power over a thing" | Money | Payee pointer, vault, settlement receipt, payment claim, obligation, creditor's release, price tag (Money Part three); verification by the rail Module's rule (Money rule 8); a named trusted party (Money rule 9) | **Proof that a payment reached a payee: provided.** Holding, releasing or dividing value (K8, #23 Hold, #24 pledge, #26 Divide's payout, #45 Enforce): **not provided**. "Money defines how a simple payment moves through MOR: never the rails themselves, and nothing about who owns what." (Money, Purpose). Ownership of a work: "its ownership written only by an ownership agreement" (Envelopes, section 8), that is, by Agreements |

---

## 3. Fields and rules: what a layer already does, and what a layer contradicts

### 3.1 Already done by a layer, so the draft need not

**(a) The act's signer, signature and fingerprint.** Draft 1 already leaves these to the core ("The fields the core gives every act (who signed, the signature, the act's own fingerprint) are not repeated here", Definitions, Act). Confirmed: Envelopes, Part three, "The act". One correction of words: the act id is not a field but computed from the outside (Identity, "Act id").

**(b) Rule 7.2, a time written in an act is a claim.**
- Draft 1: "A time written inside an act is reported as its signer's claim. Only a place gives a position."
- Envelopes: "`? 9 => tstr, ; hint: a timestamp or other hint, never load-bearing`" (Part three); "A hint MUST NOT be used for any validity decision." (rule 6); "Hints are never load-bearing." (rule 16).
The first sentence is done by the layer. The second is not (see 3.2 (e)).

**(c) Rule 8, unchecked is not passed, for acts and specifications.**
- Draft 1, 8.1: "Where a verifier cannot apply a rule it needs, because it lacks a cMIP named by fingerprint, lacks an act named by fingerprint, or cannot get an answer from a named place, it MUST answer **unchecked** for every answer that depends on it."
- Envelopes, rule 30: "A client MUST NOT sign, pay or accept anything whose specification it does not implement. It shows such an act as unknown."; Identity, rule 9: "A client that meets an act defined by a MIR it does not implement MUST show that act as unknown, never as valid."; Identity: "an act the verifier does not hold is unknown to it" ("A verifier that cannot tell answers unknown").
Done by the layers for an act's own specification and for an act not held. **Not** done for a cMIP named *inside an Agreements payload* (draft 1's `kind`, `body`'s reading cMIP, a power's rule): the layers' fail-closed reads the act's spec, not hashes in its payload. That part of rule 8 is draft 1's own.

**(d) Rule 7.3 and K8's "say who said it", for payments.**
- Draft 1, 7.3: "A verifier MUST NOT report value as moved on the strength of an Agreements act alone. An act can instruct Control; whether Control obeyed is the controller's or the receiver's signed word."
- Money, rule 10: "A client MUST NOT treat a receipt or claim as valid unless its verification answer is valid."; rule 9: "The verification answer MUST name that party, so everyone sees what the answer rests on."; rule 11: "A payment claim is admitted as evidence on equal footing with a receipt."
Done by Money for payments, including naming whom an answer rests on.

**(e) `answers` (K9, K10, #20 Acknowledge).**
- Draft 1: "`answers` | no | fingerprints of acts this one replies to | tasks K9, K10"
- Envelopes, rule 17: "An act acknowledges another identity's act by naming it in `acks`. It says only "I received this"."; rule 20: "An act names other acts, or web resources, in `refs`, meaning only "look at this"."; rule 18: "Only an act whose type is defined by the Identity, Money or Agreements MIR may carry `acks`."
Both meanings already exist as envelope fields, and an Agreements act may carry `acks`. A reply that is also an acknowledgement is `acks`; a reply that is not is `refs`.

**(f) `kind` (K11).**
- Draft 1: "`kind` | yes | `assent`, or the fingerprint of a cMIP filling task K11"
- Envelopes, section 1: "Every act names, inside, the specification that defines its type by hash, and a type number within it."
The envelope already says what an act is. Draft 1 nests a second "what it is" inside an Agreements act. That is a choice with a reason in the layers: a cMIP's own act type "MUST NOT carry `acks`" (Envelopes rule 18), so a Statement kind that must acknowledge has to stay an Agreements type. The overlap is real, the choice is open.

**(g) `for` and `under` (rule 4.1(b), "the act must say so at the time").**
- Draft 1, rule 4: "the act must name that agreement at the time it is made, not afterwards."
- Text, rule 14: "where the act is signed with a grant key [...] it may carry exactly one object, `[grantor, grant]`, naming its signer (the grantor) as chain and, as predecessor, the grant its `binding` names, the grant it acts under"; and for a collective: "`[collective, decision]`, naming the collective [...] as chain and, as predecessor, the decision it acts under".
The layers already carry "on whose authority" in the act itself, at signing time, through `binding` and `objects`. They leave the judgement to Agreements: "whether the grant backs it is Agreements' to judge" (Text rule 14).

**(h) `agreement` and `replaces` (chain identity and versions).**
- Draft 1: "`replaces` | in every Terms act except the first | fingerprint of the Terms act this one replaces"; "`agreement` | exactly when `replaces` is present | fingerprint of the root"
- Envelopes, Part three: "`object = [ chain: hash, predecessor: hash ] ; the chain's root act, and the act in that chain this one follows`"; the versioning pattern: "A later version names the first and the one it replaces in `objects`, `[first, previous]`, and is signed by the same signer" (Money, "Price tag (type 5)"); vows likewise (Envelopes section 9).
An `objects` entry `[root, replaced]` already says both, and makes two replacements of one Terms act a provable fork (Envelopes rule 15). Draft 1 would then say, as Envelopes rule 15 asks, whether such a fork is normal or a conflict.

**(i) Acts of several people (rule 3, assent).** Draft 1's one-assent-per-party shape is exactly Identity's: "An act that needs the agreement of two identities [...] is made of two acts: one by each, the second naming the first." (Identity, section 2). Nothing to add.

**(j) Rule 1, words with one hash.** Text makes the words' bytes unique: "*If the same words could be written in two byte forms, two people could sign "the same" terms with different hashes [...] Canonical text removes that.*" (Text, Reasoning). Draft 1 need not say anything about the form of words.

**(k) Rule 6.3's honesty about what is held.** In part: "These rules are part of validity and MUST give the same answer to every conforming verifier holding the same identity chain, the same acts [...]" and "The core decides alike on the same evidence and does not promise the same evidence" (Identity, section 6 and rule 20). The layers already make every verdict relative to what is held; draft 1's "as shown" says it aloud, which the layers do only for "re-homed without audit".

### 3.2 Contradicted by a layer, quoted on both sides

**(a) Rule 5 against rotation: who settles one person's two branches.**
- Draft 1, 5.2: "Two acts by one signer within one agreement that name the same `previous` (or that both name none) are a fork. A verifier holding both MUST answer **fork** for that signer, and MUST NOT choose between the branches."; plain words: "If two acts point at the same previous one, that person has told two stories, and that is proven without a judge."
- Identity, rule 34: "If it lies outside the kept ancestry, or within it but listed as disowned, it is void, unless: [...] then it is valid and shown as disputed."; and for a signer's own versioned chain: "clients use the last act before the fork and warn the owner, who settles it by rotating." (Identity, "Which value counts", 3)
- The case: a thief with the signing key signs an act in the agreement on the owner's last act. Under draft 1, the owner is convicted of two stories. Under Identity, once the owner rotates without keeping it, the thief's act is void (or disputed, if relied on), and the owner's own branch stands. The same for a restored backup, which Envelopes calls "honest use". Draft 1 also does not say what a "fork" verdict does to an act Identity calls void, pending or disputed.

**(b) Rule 4.1(a) against grant keys: an agent's act signed as the principal.**
- Draft 1, 4.1: "A person is bound by an act if, and only if: (a) they signed it in their own name, or (b) the act's `for` names them, its `under` names Terms by which they are bound [...]"; 4.3: "An act with no `for` and no `under` is made in its signer's own name only."
- Identity, Words: "**Scoped key.** A key of a person that an act of a higher MIR installs, limited to a scope that MIR defines: a grant key, installed by its grant and removed by its revocation (Agreements rules 73 to 80). It signs everyday acts in the person's name"; Money, rule 7: "*Why: a grant key's act is its grantor's own (Agreements rule 73), so an application holding a person's grant to itself signs that person's claims, and a payee's application its receipts*".
- The case: an act signed with a grant key has the *principal* as `signer`, and no `for` or `under`. Read literally, 4.1(a) and 4.3 bind the principal by their "own" signature, and the power check of 4.1(b), its rule and its limits, is never run. Identity leaves the judgement to the higher MIR: "the higher MIR whose act its `binding` names judges it" (Identity, rule 8). Draft 1 does not mention scoped keys.

**(c) "Fork" and "shown" as verdicts against their meaning in the layers.**
- Draft 1, Definitions: "**shown**: the acts held establish it under these rules"; "**fork**: two acts by one signer contradict under rule 5".
- Envelopes: "**Fork.** Two acts naming the same predecessor in the same chain." and "Whether a fork is normal or a conflict is defined by the MIR that defines the object." (Words, rule 15). Identity and Envelopes use "shown" for display: "shown as disputed" (Identity rule 34), "shown as inconsistent" (Envelopes rule 22), "shown, as a dispute, and decides nothing" (Identity section 6).
- The words collide: in a lower layer "shown" never means "established", and a fork can be normal.

**(d) "Unchecked" against "unknown", and the missing "invalid".**
- Draft 1, 2: "Answers: a verifier's answer is one of: shown [...] not shown [...] fork [...] unchecked".
- Envelopes, rule 30: "unknown is the verdict only where no rule it can apply fails"; Identity: "answers unknown, never valid, void or invalid, unless a rule it can apply shows the act invalid".
- Two disagreements: the same idea under another word; and draft 1 has no answer for an act that a lower layer finds **invalid**, **void**, **pending** or **disputed**, nor says that invalid beats unchecked, as Envelopes rule 30 says invalid beats unknown.

**(e) "Only a place gives a position" against positions the layers already give.**
- Draft 1, 7.2: "Only a place gives a position."
- Envelopes, section 4: "**Position.** The first act of a sequence (empty `prev`) has position 1; every later act has its predecessor's position plus one."; Identity: "**Identity chain.** Genesis followed by the identity's rotations and chain signatures [...] Genesis is position 0."; a receipt states "its position in the home's own log" (Identity, type 2); an anchor places an act "by a point on a named clock" (Envelopes, Tasks).
- The sentence is true of draft 1's place and false of the word "position" as the layers use it. An anchor is also a time reference the layers offer Agreements by name: "Agreements for agreements' deadlines and time references" (Envelopes, Tasks).

**(f) Rule 6 and K6 against Identity rule 20.**
- Draft 1, 6: "Then the questions "is this the latest?", "is this all of it?" and "who holds this now?" have answers"; K6: "Is this act in the place, at what position, and is anything later? [...] a signed answer by the place | place (Order layer)".
- Identity, rule 20: "no verifier can prove an omission; completeness and freshness are the market's."
- Not a contradiction of a rule, since Identity speaks of homes, but the only ordered places the layers define say the opposite of what K6 needs; and the operation draft 1 assigns to an "Order layer" is not in any layer read.

**(g) Rule 1's "named by fingerprint" against chains named by their root.**
- Draft 1, 1.1: "The `body`, every piece in `relies_on`, and every cMIP named anywhere in a Terms act MUST be named by fingerprint."; reasoning: "A signature over words that point at something changeable proves only that the pointer was signed."
- Envelopes, section 9: a vow's genesis id "is its name for good; a later version (a new date, a changed description) is signed again on that chain".
- A fingerprint can be a pointer to something changeable. Rule 1, as worded, accepts a vow's or price tag's root id as fixed.

**(h) `relies_on` against what Money counts as "held".**
- Draft 1: "`relies_on` | if anything else is used | fingerprints of every other piece the Terms use".
- Money, rule 17: "An act holds what is reachable through its citations (`prev`, `objects`, `acks`, `refs`, directly or through what they cite), never a hash merely written in its payload."
- Money says this for choosing a payee's pointer; it is not a general rule. But a hash in draft 1's payload is, for Money, not something the Terms "hold". Whether `relies_on` should be `refs` is open.

**(i) Draft 1 without the hooks the layers expect of Agreements.** Not one sentence against one sentence, but the largest gap. The four MIRs cite Agreements rules, types and fields that draft 1 does not define, among them:
- "An agreement names its payment cMIP (Agreements, terms field 2, task 6)" and "where the payment falls under an agreement, that rail Module implements the payment cMIP the agreement names" (Money, rule 4). Draft 1's Terms have no payment cMIP and its tasks are K1 to K11; draft 1's K8 is not Money's "task 6".
- Publications and ownership agreements: "its ownership written only by an ownership agreement, and it is sold only by a publication (Agreements)" (Envelopes, section 8); the receipt's "`? 9 => purchase ; a purchase: the ownership agreement whose shares it pays, and its version (rule 18)`" (Money).
- Grants: "a grant key, installed by its grant and removed by its revocation (Agreements rules 73 to 80)" (Identity); "the Agreements MIR gives the same status, in rule 34's words, to an act under a revoked grant (Agreements rule 76)" (Identity, "Which value counts").
- Collectives: "**A collective's genesis declares its founding agreement in place of a first signing key** (an Agreements declaration of kind 0 in its declarations slot)" (Identity, rule 1); "its members act for it with their own keys (Agreements rule 58)" (Identity, Words).
- Keepers: "Keepers MUST (see Agreements)" (Identity, rule 23); "the keeper record, type 2" (Identity, rule 34).
- Chain signatures: "A higher MIR says which of its acts need one: Agreements' forks, closings and stake transfers" (Identity, Words).
- Negotiation: "Negotiation messages acknowledge the latest message received from the other side (Agreements rule 52). A negotiation message is an Agreements act type carrying text (Agreements type 18)" (Envelopes, rule 18).
- Signing what you saw: "Before signing terms, a grant or a clone (Agreements), a client MUST show every bidirectional control visibly" (Text, rule 6). Draft 1's Terms are "terms" here, and its grants are Terms; there is no clone.
- Obligations past their terms: "Agreements decide when an obligation's terms have passed and what follows (Agreements rule 33)" (Money, rule 15).

Each of these is a sentence in a lower MIR that, beside draft 1, names nothing. Whether draft 1 should provide each hook, or the lower MIR should drop or rename it, is a decision for Nobody, allegedly, under his words "Just be mindful to not attempt to solve something the cMIPs will" (`docs/decisions.md`, 11 November). This check does not take it.

---

## 4. What the layers provide that draft 1 does not use

Each item is something draft 1 could rely on instead of a rule or a cost of its own. None is recommended here; each is a possibility, with what it costs.

1. **The identity chain and chain signatures, for one person's order.** A signature placed on the identity chain "is ordered against every other one of the same identity, whatever devices the identity uses" (Identity, Words). An act chain-signed cannot fork for that signer at all. Cost: "every chain signature spends a chain key [...] as slow and heavy" as a rotation (Identity, section 7). Could serve rule 5 for the few acts where a fork matters most (an assent, an End), as the layers already intend for "Agreements' forks, closings and stake transfers".
2. **The sequence and `objects` chains, for rule 5's pointer.** `prev` with position and running summary already line up a signer's acts (Envelopes, section 4); an `objects` entry `[root, predecessor]` already gives an agreement-wide chain with provable forks (Envelopes, rules 14 and 15).
3. **Rotation, kept ancestry and "disputed", for honest forks.** Draft 1's cost "Honest forks. A signer who loses track of their last act (a lost device, a restored backup) and signs again produces a fork that looks exactly like a lie." The layers' answer: the owner's rotation keeps one tip; what others relied on stays, "valid and shown as disputed" (Identity, rule 34).
4. **`acks` and the witness act, for K9 and #20 Acknowledge.** "It says only "I received this"." (Envelopes, rule 17); "**"I received this act and rely on it."**" (Identity, rule 10), which also keeps the act alive after its signer's rotation. Note the word: the layers' "witness" is reliance on an act, not testimony about the world, so it does not fill draft 1's K5.
5. **Anchoring, for deadlines and "before".** "a proof that the act existed by a point on a named clock [...] Every layer above may rely on it: [...] Agreements for agreements' deadlines and time references" (Envelopes, Tasks). Draft 1 lands #16 Due and #36 Wait on "K4 over place positions"; an anchor is the layers' existing tool. It proves "existed by", never "nothing later".
6. **Home receipts and audited logs, as a model of a place.** "first valid act the home accepted at that chain position" (Identity, Words), with first-held-wins (rule 30), several homes counted per operator under a home rule (rule 2), and consistency proofs checked by declared auditors (section 13). A place identified by an operator's identity hash, never an address. Only for identity-chain acts, and with no proof of omission (rule 20).
7. **Succession, for #37 Succeed.** "A succession to a MOR identity is declared by the rotation and confirmed by the successor" (Identity, section 8). Draft 1 lands #37 on "power named in advance; rule 4"; Identity already gives a confirmed successor to a whole identity. Cost stated there: a thief with the chain key can name one too.
8. **The vow, for what cannot be hashed (#1 Fix of goods and services).** "naming in words **something MOR cannot hash, existing or to come**: a good in stock or to be made, a service, an hourly rate, storage, a seat, a work not yet made" (Envelopes, section 9).
9. **Going public later, for #40 Reveal and #39 Conceal.** "The signer uploads a public key delivery addressed to no one, with the key on its outside. *One act turns a private act public, for an embargo, a timed release, or disclosing a negotiation record*" (Envelopes, after rule 12). Draft 1's "Deliver the Terms; check against fingerprint" works with it unchanged.
10. **Money's debts and releases, for #16 Due, #26 Divide, #48 End.** The obligation ("A signed statement by a debtor that it owes a creditor an amount, in a unit", Money, Words), its discharge, and the creditor's release ("Signed by the creditor the obligation names, alone", Money, type 4). Draft 1 builds these from Statements of K11 kinds.
11. **Double entry and the payment's commitment, for #17 Perform where value moved.** "Where they disagree in payee, in what the payment fulfils, or in the previous hop's receipt, the payment's own commitment decides" (Money, rule 11). This is already rule 7's "say who said it", with a rule for disagreement.
12. **"Judged both ways", in place of a blanket "unchecked".** "an answer that depends on one such record is answered taking it as valid, and again taking it as counting for nothing; it stands where both agree, and is unknown where they differ." (Money, rule 8). Draft 1's rule 8 answers unchecked "for every answer that depends on it"; Money's method lets an answer stand when the missing piece could not change it.
13. **The layers' verdict words.** "unknown" for draft 1's "unchecked"; "contested" for a person's own versioned fork; "pending" for what waits on a rotation; "re-homed without audit" as the one existing qualifier for an answer resting on what a verifier could not reach; Identity's named reasons a chain stops ("no genesis", "the end of what is held", "pending", "contested", "cannot tell", and the rest, Identity section 5).
14. **Text rule 6, for part of #4 Align and K3 Assurance.** "Before any act is signed, a client MUST be able to show all of its text as plain text, character for character" (Text, rule 6, client conformance). It records nothing, but it is the layers' share of "the signer saw these words".
15. **Fail closed, for unknown kinds.** "A client MUST NOT sign, pay or accept anything whose specification it does not implement." (Envelopes, rule 30). Draft 1 could say its `kind` and rule cMIPs are read the same way, so that a client does not *sign* under a cMIP it lacks, which draft 1's rule 8 (a verifier rule) does not say.

---

## 5. Summary table

| Draft 1 item | Layer gives | Verdict of this check |
|---|---|---|
| Fingerprints (rule 1, Definitions) | act id, work hash, spec hash; canonical text | fits; say which fingerprint; a chain's root is not fixed bytes |
| Per-signer chain (rule 5) | sequence; `objects` chains; identity chain | not redundant; contradicts rotation on lost or stolen keys |
| Acts of several people (rule 3) | one signer per act, second names the first | fits exactly |
| Field names (section 3) | integer keys, closed maps; `prev`, `objects`, `acks`, `refs`, spec + type | several fields have a twin in the envelope |
| Place (rule 6, K6) | order inside a chain; receipts; anchors; keeper named as Agreements' | **not provided**; "nothing later" not given by any layer |
| Key replaced or lost | rotation, kept ancestry, void, disputed, pending | the layers settle it; rule 5 does not follow them |
| cMIP identity (rule 1) | spec hash, `mspec`, fetch by hash | fits |
| Answers (Definitions) | unknown, invalid, void, disputed, pending, contested | "unchecked" is "unknown"; "fork" and "shown" collide; "invalid" missing |
| Agency (rule 4) | grant keys, `[grantor, grant]`, `[collective, decision]` | 4.1(a) lets a grant-key act bypass 4.1(b) |
| Control (K8) | proof of payment only | holding and releasing value not provided |
| Deliver (K9) | carrying; recipient's `acks` | no layer evidence of arrival |
| Hooks the layers expect of Agreements | payment cMIP field, publications, grants, collectives, keepers, chain-signed forks, negotiation | none provided by draft 1; open for Nobody, allegedly |
