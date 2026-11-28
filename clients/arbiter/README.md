# An arbiter's award (DubLaw's)

Reference code for cMIP "an arbiter's award", drafts 1 and 2 (DubLaw; draft 1 act 5102247f…, spec ebcc09e3…; draft 2 spec 7d42b01c…9130). Pure functions, no network, no keys: `readAward` says valid, not an award (and why), or unchecked; `execute` says what an escrow pays on it. Tests are the text's section 8 vectors.

Built on: Until's escrow draft 4 (its `arbiter`), Plain Words' room let (the deposit case), Proven claim (debts where no Terms exist), Postmark's place (order). Not yet attacked.
