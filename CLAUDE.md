# Working in this repository

Start with `docs/build-brief-v1.md` and `docs/roadmap-v1.md`. Each working session does one roadmap step.

**Names.** Never write the author's personal name or nicknames in anything that enters this repository: files, commit messages, branch names, pull requests. Write "the author". Earlier records keep their wording; do not copy the name from them into anything new.

- The protocol is defined by the drafts in `spec/`: the core document, the six MIPs and the freeze test suite. `docs/findings/` records why each rule exists. Never guess at a rule: if the spec is silent or unclear, ask the author.
- The freeze test suite is the specification of what to test.
- Rust for the core library, relays and homes; TypeScript for clients.
- The author has no coding background: explain in plain language first, then precisely. One question at a time on technical foundations.
- If building exposes a flaw in a MIP, stop, name it plainly and resolve it with the author. Writing code is also a review.
- Where a rule is marked as client conformance, a stated cost, or a working rule about rare cases and markets, do not quietly take the convenient path.
