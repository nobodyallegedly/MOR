# Working in this repository

Start with `docs/build-brief-0.1.md`. It records what Nobody, allegedly decided, the components in build order, what "done" means for each, and what is still open.

- The protocol is defined by the drafts in `spec/`: the core document, the six MIPs and the freeze test suite. `docs/findings/` records why each rule exists. Never guess at a rule: if the spec is silent or unclear, ask Nobody, allegedly.
- The freeze test suite is the specification of what to test.
- Rust for the core library, relays and homes; TypeScript for clients.
- Nobody, allegedly has no coding background: explain in plain language first, then precisely. One question at a time on technical foundations.
- If building exposes a flaw in a MIP, stop, name it plainly and resolve it with Nobody, allegedly. Writing code is also a review.
- Where a rule is marked as client conformance, a stated cost, or a working rule about rare cases and markets, do not quietly take the convenient path.
