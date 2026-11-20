A fresh-eyes review of the new Agreements encoding, in the MOR repository (`nobodyallegedly/MOR`), branch `claude/agreements-encoding-1-nwgiyk` (pull request 179). Read-only: change no text, code or vector.

**What it is.** Agreements has been rewritten from scratch as a grammar of blocks (`docs/agreements-from-scratch/draft-24.md`). `docs/agreements-from-scratch/encoding-1.md` gives its acts their bytes: Terms and Statement (and, as a proposal, the report) as everyday acts of the existing act format, with CDDL payloads and rules E1 to E24. The core library implements it, a checker reads acts, and `core/vectors/agreements-new/` holds 133 generated cases. Tomorrow, test identities in a simulation start writing these acts from these texts. The question this review answers: **can a careful stranger write correct bytes, and check them, from `encoding-1.md` and `draft-24.md` alone?**

**Read first, and form your own view before anything else:** `encoding-1.md` and `draft-24.md` (section 3 and section 10 above all). Then the vectors and their README. Only after your view is written may you read `encoding-1-report.md` (its choices and its 18 questions) and the code in `core/src/agreements_new/`, and say in a separate last section where they change your view. Do not open the old Agreements MIR, `core/src/agreements/`, `docs/findings/` or `docs/agreements-inventory/`.

**Please say, plainly:**
1. **Can the bytes be written from the text?** Where would a stranger not know what to write, or could write two different byte strings for the same act? Quote the sentence.
2. **Does the text say the same as draft 24?** Any field, required or optional, kind or rule where `encoding-1.md` and section 3 of draft 24 differ.
3. **Do the vectors say what the text says?** Take at least ten cases, valid and invalid, and judge each by hand from the text alone: same answer, same rule cited, or not.
4. **What a player will trip on first**, in a few lines, for the Dubsar Suite lead's briefing.
5. **The 18 questions** (after your view): which you would settle as the report leans, which otherwise, and which must be settled before players write many acts.

Judge, do not fix. Plain words first, then precisely. Write `docs/reviews/fable-encoding-1.md` (branch `claude/fable-encoding-1`, a pull request, no merge). Never write the author's personal name; write "Nobody, allegedly". No server addresses or keys.
