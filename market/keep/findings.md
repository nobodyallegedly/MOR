# Keep: findings

*Newest first. Each: what was tried; what the texts or the code did; what was expected; the rule or vector involved; whether it blocks. Read at the rehearsal commit `af2ed6f8`: Identity draft 15, Agreements draft 23, Development draft 11, MICS v36, freeze test suite v36. From reading the texts; no vector run yet.*

## 3. A member who has lost their chain key holds up a collective's ending (6 November 2026)

- **Tried:** following a DAO member who lost their chain key but kept their signing key, through the collective's fork and closing.
- **The texts:** a fork or closing counts members by their chain signatures on the ending (Agreements rule 91). A chain signature needs the current chain key (Identity, "Chain signature"; section 7). By default a fork needs every member, "a silent member being the abandonment clause's business". The member who lost the key can never sign, so the ending waits until that member is declared absent (Agreements rule 89).
- **Expected:** this, once read. It is consistent with the texts and is not a flaw. We record it because a collective learns it only when it wants to end.
- **Rules:** Agreements rules 89 and 91; Identity rules 7 and 27, section 7.
- **Blocks:** no. It asks for constitutions whose abandonment clause names an authority and a delay that make this case routine.

## 2. Nothing in the core detects a home that leaves out a rotation it holds (6 November 2026)

- **Tried:** an audit that catches a home serving a client an identity chain without its latest rotation, where that home has receipted the rotation.
- **The texts:** a home MUST serve the full chain it holds (Identity rule 19), but leaving something out produces no bytes. The texts say so: a dishonest home "can hide or delay a rotation, never fake one" (Identity, reasoning). Audited log summaries stop a home from erasing a receipt or showing two logs (section 13), but the Merkle tree runs over every identity's receipts in log order (log summary, type 9), so it proves a receipt is present, never that one is absent.
- **Expected:** a stated cost, and that is what we found. The core needs no change: a receipt carries its log position (receipt, field 3), so a home's signed statement of what it holds can be proved false above the core. We publish that as an xtype: `cmip-head-statement-draft-1.md`.
- **Question for Nobody, allegedly:** does anything in the core forbid this xtype, or does it break a rule we have not seen? It decides nothing binding; it is shown, never counted ("Evidence counts only while its signer's chain keeps it" speaks of evidence a MIR uses, and this is none).
- **Rules:** Identity rules 19, 20, 28, section 13; receipt (type 2), log summary (type 9); Development rule 18.
- **Blocks:** no.

## 1. A collective cannot confirm a succession; the texts don't say whether that is meant (6 November 2026)

- **Tried:** naming a collective (a family, or a member's DAO) as an identity's successor, so that no single person holds the trigger.
- **The texts:** a succession to a MOR identity is confirmed "by a link confirmation of the successor naming the rotation, or by a witness act of the successor" (Identity section 8). Both are everyday acts, and an everyday act whose signer is a collective is invalid (everyday check 4; rule 1). A collective's members act for it with their own keys, naming it (Agreements rule 58), but section 8 asks for an act *of the successor*, and a member's act has the member as signer.
- **Expected:** either a way for a collective to confirm, or a sentence saying a collective is never a confirmed successor. As written, two clients could read a member's witness act naming the collective differently.
- **Rules:** Identity section 8, everyday check 4, rule 1; Agreements rules 58 and 84.
- **Blocks:** no. We name a person as successor meanwhile.
