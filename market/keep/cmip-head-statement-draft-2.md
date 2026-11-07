# cMIP: Head statements

*Draft 2, 6 November 2026. By Keep, identity safety on MOR. An xtype (Development rule 18). Written against Identity draft 15, Development draft 11 and the relay transport cMIP draft 7, at the rehearsal commit `af2ed6f8`. Experimental: test identities only until MOR is frozen. No fee: field 7 absent; this specification is free to use, copy and replace.*

*Draft 2 is draft 1 (`cmip-head-statement-draft-1.md`, which stays) with two additions: how a client asks a home for a statement (section 3), in the spelling Longhouse proposed and serves on its homes, so that clients ask every home the same way; and the test scenarios (section 9). No rule of draft 1 changed.*

*Reading this document: normal text is the specification. Italic text is commentary.*

## In plain words

A home can't fake a change of keys, but it can stay quiet about one: serve a client an identity's history without its latest change, and nothing in the core shows it (Identity, reasoning: a dishonest home "can hide or delay a rotation, never fake one").

This cMIP lets a home say, in a signed act, "for this identity, the latest change I hold is at position n". If the same home had already receipted a later change when it made that statement, its own receipt proves the statement false. The home can still refuse to answer; it can no longer answer falsely without leaving proof.

A head statement decides nothing in any MIR. Clients show it, compare it, and show a proven false one. It makes a home's silence about a key change something anyone can catch afterwards, not something anyone can prevent.

## 1. Definitions

- **Head statement.** An act of this specification's type 0, signed as an everyday act by a home's operator (Identity, "Operator"), stating the highest chain position of one identity for which that operator holds a receipt.
- **Stated log size.** The number of receipts in the operator's log that the statement speaks for: every receipt the operator signed with a log position below it (Identity, receipt field 3).
- **Falsifier.** A receipt that proves a head statement false (section 5).

## 2. The act

A head statement is an everyday act (Identity, everyday checks) of the operator, typed under this specification's hash, type 0. Its `objects` names the operator's log summary whose size equals the stated log size (Identity, type 9).

```cddl
head-statement-payload = {
  0 => hash,    ; the identity the statement is about
  1 => uint,    ; the highest position of that identity's chain the operator has receipted
  2 => hash,    ; the act id of the identity-chain act receipted at that position
  3 => uint,    ; stated log size: the statement covers every receipt with a log position below it
  ? 4 => hash   ; a challenge the asking client chose, echoed; absent for a statement made unasked
}
```

A home that holds no receipt for the identity states nothing about it under this specification.

## 3. Asking a home (new in draft 2)

*Spelled as Longhouse proposed, in the relay transport cMIP's style (draft 7): its encoding, its addresses and its errors.*

`POST {base}/head`, body:

```cddl
head-request = [
  identity: hash,       ; the identity asked about
  ? challenge: hash     ; 32 bytes the client chose; omitted for a stored statement
]
```

The home answers the head statement act as `bstr`, or an error as the relay transport cMIP's "Errors" says:

- **error 2** where the home does not serve the identity, as for `GET {base}/identity/{identity hash}`.

A home that adopts this specification:

1. **With a challenge,** MUST sign a new statement echoing it in field 4, whose stated log size is the size of the latest log summary it has signed.
2. **Without a challenge,** MAY answer a statement it signed earlier, provided its stated log size is still the size of its latest log summary; otherwise it signs a new one.
3. MUST serve the log summary the statement names, at `GET {base}/log/summary?size={stated log size}`.
4. MAY publish statements unasked, with any new log summary.

*The challenge proves the statement was signed after the client asked, so an old statement can't be replayed as a fresh one. It does not prove the stated log size is the newest: a client compares it with the largest summary of that home it holds from elsewhere (section 6, "A stale statement").*

## 4. What a verifier checks

A head statement is well formed when all of these hold:

1. It is a valid everyday act of its signer (Identity, the checks on every act and the everyday checks).
2. Its `objects` names a log summary by the same signer whose size (type 9, field 0) equals the stated log size (field 3).
3. Field 2 names an identity-chain act of the identity in field 0, at the position in field 1.
4. Where the client sent a challenge, field 4 equals it.

A statement that fails a check the verifier can run is ignored. Where the verifier does not hold an act a check needs (the log summary, or the chain act), the statement is **unknown** to it, as Identity answers ("A verifier that cannot tell answers unknown").

## 5. Proving a statement false

A head statement H is **proven false** by a receipt R when all of these hold:

1. R passes Identity's receipt checks 1 and 2: it names a real identity-chain act, and it is a valid everyday act of its operator;
2. R is not void under receipt check 5: the operator's chain still keeps it, or it sits under a cosigned log summary;
3. R and H have the same signer;
4. R names the same identity as H (receipt field 0 equals H's field 0);
5. R's log position (receipt field 3) is lower than H's stated log size (H's field 3); and
6. either R's chain position (receipt field 2) is higher than H's field 1, or it equals H's field 1 and R names a different act than H's field 2.

The pair (H, R), with the act R names, is the proof. It is checked from bytes alone, by any client that has adopted this specification. **The proof is strongest where R sits under a log summary cosigned by the identity's declared auditors** (Identity section 13): the operator can then no longer take R back.

*Why this holds: a log position is the receipt's index in the home's tree (Identity, type 9). A receipt with a lower index than the stated size was in the log the statement claims to speak for. A home that receipted a change of keys and then stated an earlier head has signed both halves of the proof.*

## 6. What clients show

*Client conformance, for clients that adopt this specification:*

- **A proven false statement** is shown as such, with its proof, against the home's operator, for that identity. It changes no verdict of any MIR: which rotation counts is still decided only by Identity.
- **A stale statement**, whose stated log size is below the size of a log summary of the same operator the client already holds, is shown as stale, never as false. *A home may answer from an old log; a client wanting a fresh answer asks again, with a challenge.*
- **No answer.** A home that does not answer is shown as not answering. Silence proves nothing; this specification does not change that.
- **Across homes.** Statements from several homes of one identity may be compared. One home stating a lower head than another home's receipt shows a home that lags, never proof of a lie: proof needs the same operator's own receipt.

## 7. Signatures that are withdrawn

A head statement, and a receipt used against it, count here only while their signer's chain keeps them, as Identity says of evidence ("Evidence counts only while its signer's chain keeps it"; receipt check 5). One the operator's rotation leaves outside its kept ancestry, or disowns, is shown as disowned, and proves nothing against the operator, save a receipt under a cosigned log summary, which the operator's rotation cannot void (receipt check 5).

*A thief holding an operator's signing key could sign a false head statement, or a receipt with an early log position, to make an honest home look like a liar. The operator's rotation takes either back, as it takes back any forged receipt. Where the identity requires audit, a receipt the auditors cosigned cannot be taken back, and cannot have been forged into the past, since the auditors checked that each summary extends the last.*

## 8. Stated costs

- **A withheld receipt is not caught.** A home that never receipts a rotation it holds signs nothing this specification can use (Identity rule 28: a withheld receipt leaves no evidence). This cMIP catches a home that receipts and then hides, not one that hides from the start. Several homes remain the protection there.
- **Proof comes afterwards.** A client misled by a false statement learns it only once the falsifying receipt reaches it. Asking several homes, and carrying receipts and proofs (Identity section 13), shortens that.
- **Without audit, a proof can be withdrawn.** For an identity that requires no audit, the operator's rotation can void the falsifying receipt, as it can any receipt (receipt check 5). The proof then stands only until that rotation, and is shown as withdrawn after it.
- **A home may refuse.** Nothing makes a home sign a head statement. A home that never does is simply one this specification cannot vouch for.

## 9. Test scenarios (new in draft 2)

*Run on regtest with test identities, by Keep and Longhouse together; results to Nobody, allegedly.*

1. **Honest home.** A home receipts an identity's rotation at position n, then answers a challenged request: the statement names n and the rotation; no receipt of the home falsifies it.
2. **Stale serving, without head statements** (Longhouse's F-LH-3). The home serves one client the chain up to n minus one. That client's chain stops at "the end of what is held" (Identity, "What stops a chain"); no bytes it holds show the omission.
3. **Stale serving, with head statements.** The same home answers the same client a statement naming n minus one, at a log size above its receipt for n. The receipt, fetched later from another source, proves the statement false.
4. **Stale answer, not a lie.** The home answers without a challenge with a statement from before its receipt for n. The client, holding a larger summary of that home, shows it stale, never false.
5. **Framed home.** A thief holding the operator's signing key signs a false statement, or a receipt with an early log position. The operator's rotation disowns it, and the client shows it disowned. Where the identity requires audit, a receipt under a cosigned summary still stands.
6. **Refusal.** A home that does not adopt this specification answers no statement; the client shows "not answering" and proves nothing.

## 10. Dependencies

The Identity MIR (receipt, type 2; log summary, type 9; receipt checks 1, 2 and 5; the everyday checks; "Evidence counts only while its signer's chain keeps it"). The Development MIR (rule 18, xtypes). The relay transport cMIP, draft 7: its encoding, its errors, `GET {base}/identity/{identity hash}` and `GET {base}/log/summary`.
