# Encoding 3, written by a stranger

27 November 2026. A record of work by a session that read one text, for the codemeister to compare; not a decision.

## In plain words

This folder holds the bytes of eight small examples, written from one text alone: `docs/agreements-from-scratch/encoding-3.md`, branch `claude/draft-26-outline-vbtvu7`, commit `1f81c2a5964219cf53f2ead192c3c26be879e034`. The only other text read is Identity draft 16, Part three, "Encoding and conventions" (deterministic CBOR and `tagged_hash`), which encoding 3 names for what it does not give. No code, vector file, sheet or other draft was read.

Where another session's bytes agree with these, the text is clear there. Where they differ, or where this session could not tell what to write, there is a gap. Each gap is listed below, with encoding 3's sentence quoted and the readings seen. Nothing here is chosen beyond the choices handed to this session: the set's label `MOR/act-set`; members concatenated; the set's rule its own E-rule; no field holds a set's value; key 8 always a list; the keeper list sorted, each once; a keeper's identifier its identity hash; key 9 32 bytes.

`encode.py` (Python, standard library only) writes `payloads.json`: each example's payload, before signing and without the act around it, in hex. Every fingerprint is SHA-256 of an ASCII label: test data. Run twice, it printed the same bytes both times.

Where a reading is open, the example is written once per reading, named `X1-a`, `X6-signer-ana` and so on.

## The examples

Hex is in `payloads.json`. In short, in CBOR diagnostic form, `H(x)` the SHA-256 of label `x`:

- **X1-a**: `{2: [[0, H(test:ana)]], 3: [0], 4: [H(test:words-1), [H(test:cmip-in-force), null]], 8: [H(test:keeper-1)], 19: []}`. Gap 1.
- **X2-a**: X1-a with key 8 `[H(test:keeper-2), H(test:keeper-1)]`: sorted bytewise, keeper-2's hash (`92eb…`) comes before keeper-1's (`ddda…`), which happens to be the writer's order.
- **X3-a**: X1-a with key 9 `H(test:clock-1)`.
- **X4-a-empty-role**: X1-a with key 2 `[[0, H(test:ana)], [1, {}]]`. Partial: gap 2.
- **X5-a**: X1-a with key 0 and key 1 both `H(test:terms-v1)`, and key 19 `[H(test:terms-v1)]`. Gaps 3 and 4.
- **X6**: `{0: H(test:terms-v1), 1: H(test:terms-v1), 2: 0, 6: previous}`, two readings of key 6: `X6-signer-ana` with `[H(test:terms-v1)]`, `X6-signer-other` with `[]`. Gaps 3 and 5.
- **X7**: not payloads, the values. `X7-set-a-b` is `tagged_hash("MOR/act-set", lo || hi)`, the two ids sorted bytewise and concatenated; `X7-set-empty` is `tagged_hash("MOR/act-set", "")`.
- **X8-a**: X1-a with key 5 `[H(test:payment-1)]`.

All eight were written in some form. X1's second reading could not be written (gap 1); X4 is written only partly (gap 2).

## Where this session could not tell what to write

**1. X1: which field the one socket fills.** The example gives "one socket naming cMIP `test:cmip-in-force`". Encoding 3, E8: "The body … is the words, named by the act id of the Text act that carries them, and the socket of the cMIP that reads them (task K1)", and "Anything other than an array of two items, the second a socket, is rejected." So the body always holds a socket. Readings: (a) the one socket is the body's (K1), and there is no key 6; this is what `X1-a` writes, and every later example is built on it. (b) the socket is `in_force` (key 6), as its label suggests; then the body needs a socket of its own, which the example does not give, and the act cannot be written. This is a gap in the example more than in encoding 3, but encoding 3 is why the body cannot go without one: it gives no empty form for the body's socket ("An empty socket is the field left out", E7, does not reach a socket inside an array).

**2. X4: a role "named `buyer`".** Encoding 3, E10: "How a role is named: by its position in `parties` (E13, E12). A role carries no label." So the name has no place in the bytes. The role's three fields (sort, `what`, spot socket) are optional in the bytes, and the example gives none: "a role with no sort … is read as lacking it; a role of any sort but 4 with no `what` … is read as lacking it; a role with no spot socket lacks its cMIP; each makes the Terms invalid (5.10.1)". `X4-a-empty-role` writes the role as an empty map `{}`, which is not rejected but makes the Terms invalid three times under 5.10.1, and under reading 1(a) also under 5.4.2 ("a party is named by role, and `in_force` is absent"). Under reading 1(b) the 5.4.2 case would not arise. What a writer meant by "named buyer" (a sort, a `what`, a spot) cannot be read from encoding 3.

**3. X5 and X6: the root.** Encoding 3, section 4: key 1 is "agreement: the root"; E5: "the root of an agreement | the act id of its first Terms act". The examples name only `test:terms-v1`. Read here: X5 is "an update of X1", X1 is a first Terms act, and `test:terms-v1` is the version replaced, so `test:terms-v1` is X1's act id and is the root: key 1 equals key 0. This is a reading of the examples, not of a gap in encoding 3; it is listed because if `test:terms-v1` were meant as some later version, key 1 could not be written.

**4. X5: `previous`.** Encoding 3, E17: it "names the signer's act before this one within the same agreement", and "the first Terms act is its signer's first act within its agreement, so that signer's assent to it, and any next act of theirs there, names it, or the act after it, in `previous`; never `[]`." Readings: ana signed nothing in the agreement between X1 and X5, so `previous` is `[H(test:terms-v1)]` (written); or ana assented to X1 (or signed anything else there) first, and `previous` names that act, which the example does not give. Encoding 3 does not say whether an author assents to their own first Terms.

**5. X6: who signs the assent.** The example does not name the Statement's signer, and E17 makes `previous` depend on it: ana, X1's signer, names X1 (`[H(test:terms-v1)]`, "never `[]`"); a party with no act in the agreement yet writes `[]` ("A party with no act in the agreement yet writes `[]`"). X1 has only one party, ana, so the second reading would be an assent by someone not a party; encoding 3 does not say whether that is written differently. Both are written.

## Where encoding 3 seems to say two things

- **Whether `SPEC_DRAFT_26` is computed.** E2 gives its value (`04bae25c…`), and section 11, item 12, says it was "computed by M11 once the text was final, and again by N1 after wave four"; section 12, under E2, says "`SPEC_DRAFT_26` in place of `SPEC_DRAFT_25`, not yet computed". No payload byte depends on it.
- **Where the set's rule stands.** E5's table carries a row for "a set of acts: reading (i)", and "The set of acts" says the rule is "a row of E5's table (reading (i)) or an E-rule of its own (reading (ii), numbered E26 if taken)". Taken here as its own E-rule (given); the table row then stands in E5 while the rule is elsewhere. No byte changes ("The bytes below are the same under both readings").
- **"Three exceptions", four items.** E5: "save where draft 26 says it reaches the grammar rules (§4.1's three exceptions: E7, E8, E10, and an entry of `relies_on`)". Four names are given for three exceptions; section 10, item 11, groups the body's words and a socket's cMIP as one. No byte of these examples depends on it.
- **"Sort" and "kind" for a role.** E10 writes a role's `sort`; section 4's notes say "a `what` on a role of kind future", and section 9 "5.10.1 for a role's kind or `what`". Read as one field. No byte depends on it.
