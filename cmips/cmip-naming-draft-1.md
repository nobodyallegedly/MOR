# cMIP: Naming (a display name)

*Draft 1, 16 October 2026 (F332: "a naming cMIP (a display name: free text, not unique, shown beside the fingerprint, never instead of it)"; "Works for me", Nobody, allegedly). **Founding cMIP, EXPERIMENTAL. Not approved, not a product; test identities only until MOR is frozen.** Written against the Identity MIR draft 13 (name, type 4; name withdrawal, type 5; "Which value counts", 4; the Naming task), the Text MIR draft 8 and the findings to F332. It fills the Identity MIR's naming task, in its narrowest form: an identity hash gives its names; a name never gives an identity. Its hash stays a draft hash until its creator is named at step 17; until then its acts name a test value, `sha256("Naming cMIP, draft 1, test value until publication")`. Its code is in Dub (`clients/dub/src/names.ts`).*

*Reading this document: normal text is the specification. Italic text is commentary. Choices the decision did not fix are marked **(mechanic, this draft's)**, taken by the session under the working practice on development-layer mechanics, to confirm when built.*

## In plain words

*An identity on MOR is a long number, its ID; its fingerprint is that number, shortened for the eye. People want a word to know each other by. This cMIP lets an identity say, in a signed act, "call me Ada". That is all.*

*It is a display name, not a name in a register. Anyone can call themselves Ada; a thousand identities can. So a client shows the name **beside** the fingerprint, never instead of it: the fingerprint is what tells two Adas apart. And a name never leads to an identity: typing "Ada" finds nobody.*

## 1. The act

1.1. A display name is an Identity name act (type 4), whose payload is the Identity MIR's: key 0, the name; key 1, this cMIP's hash. It is public, as every Identity act is, signed with the signing key, and sent to the identity's homes and to the relays its routes name.

1.2. A name is withdrawn by a name withdrawal (type 5) naming the name act in `objects`, as the entry `[name act, name act]` (the name act is the root of its own chain, as a publication is). **(mechanic, this draft's)**

1.3. To change its name, a client publishes the new name, then withdraws every name under this cMIP of the same identity it can find that still counts. *A rename is two acts, not one: the Identity MIR has no versioned name.*

## 2. The form of a name

2.1. A name is canonical text (Text MIR), on one line: no line break, no control character, no bidirectional override or isolate (U+202A to U+202E, U+2066 to U+2069), not empty and not only spaces, with no space at its start or end. **(mechanic, this draft's)**

2.2. A name is at most **48 characters** (Unicode scalar values). **(mechanic, this draft's)** *Short: a name is read in a feed beside a fingerprint, not as a paragraph.*

2.3. A name act whose name breaks 2.1 or 2.2 is valid for Identity (the core checks only that the name is text) and is **not a display name** under this cMIP: a client following this cMIP does not show it. A client MUST NOT sign one.

## 3. Which name is shown

3.1. An identity's display names are its name acts under this cMIP that count (Identity, "Which value counts", 4: valid, and no valid withdrawal by the same identity names it), and whose form is as section 2 says.

3.2. Where one counts, it is the identity's display name. Where several count (two apps renamed it at once, or a withdrawal was not found), a client shows **all of them**, in the order of their act ids, separated so that each is read as a name of its own. **(mechanic, this draft's)** *No name hides another, and no clock is needed to choose.*

3.3. Where none counts, the identity has no display name, and a client shows its fingerprint alone.

3.4. Silence proves nothing: a client shows the names it found at the places it asked (the identity's homes, then the relays its routes name), and a withdrawal it did not find leaves a name shown.

## 4. How a name is shown (client conformance)

4.1. A client MUST show a display name **beside** the identity's fingerprint, wherever it shows the name: never the name alone. *No verifier can check this; it is conformance, as the Text MIR's "what you sign is what you saw".*

4.2. A client MUST NOT use a display name to find an identity, nor treat it as unique, nor tell a person that two identities are one because their names match.

4.3. A client MUST show a display name as plain text: escaped, in the direction its own characters give (`dir="auto"`), cut at 48 characters if longer.

4.4. A name a person gives another identity in their own app (a pet name, the people cMIP's) is not a display name: it is never an act. A client that shows both says which is which.

## Costs, stated

- **Anyone can take any name.** A display name proves nothing about who stands behind it. The fingerprint beside it is the only defence, and it is only as good as the reader's habit of looking at it. *Stated, not solved: solving it is a register, which this cMIP is not.*
- **A rename leaves the old name in public.** Withdrawn names stay readable as acts; a withdrawal says only "no longer my name".
- **Two names at once.** An identity carried into two apps that each rename it shows two names until one is withdrawn (3.2). Visible, never hidden.
- **A name act is sent to the homes.** Every name an identity ever took is kept by its homes and relays.

## Tests

- A name is published and read back, beside the fingerprint; a rename withdraws the old one, and only the new one shows. *Run, `clients/dub/test/dub.test.ts`.*
- A name breaking section 2 is refused before signing (too long, a line break, a control or bidirectional character, empty). *Run, `clients/dub/test/names.test.ts`.*
- Two counting names are both shown, in act id order. *Run, same file.*
- In the browser, every name shown sits beside a fingerprint. *Run, `clients/dub/test/browser.test.ts`.*
