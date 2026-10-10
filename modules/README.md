# Founding Modules

Specifications above the core that MOR V1 builds on. Not core: they compete like any other Module.

| File | What it is |
| --- | --- |
| `module-airgap-chain-key-signer-draft-4.md` | How an online device and an offline signer exchange chain-key commitments and rotations, and how a collective's split chain key is dealt. The genesis client implements it. |
| `module-chain-key-seed-words-draft-1.md` | A seed Module: the chain-key seed written as 24 words, and how its keys are derived. |
| `module-chain-key-seed-hex-draft-1.md` | A seed Module: the chain-key seed written as 72 hexadecimal characters, and how its keys are derived. |
| `module-lightning-rail-draft-2.md` | A rail Module under the payment cMIP: a BOLT 11 invoice signed by the node the payee declared, committing to the payment, and its preimage, as the proof of a Lightning payment (roadmap step 12). Draft 2: **experimental**, its costs stated (F117), an instrument for testing Money, never for real money. Not approved. |
| `module-onchain-rail-draft-2.md` | A rail Module under the payment cMIP: pay-to-contract, a fresh Taproot address tweaked by the payment commitment, signed for by the payee's request key, and the confirmed transaction at its one canonical position, checked against the headers of the chain the verifier follows, as the proof of an on-chain payment (roadmap step 12a; F200 to F205). Draft 2: **experimental**, its costs stated; a request rail. Not approved. |
| `module-bitcoin-clock-draft-2.md` | A clock Module under the anchoring cMIP (`cmips/cmip-anchoring-draft-2.md`, now draft 3): a point on Bitcoin is the block; an on-chain payment's proof is that payment's anchor (F201, F202); a batch anchor, the anchoring cMIP's batch with its root committed by pay-to-contract, checked by a sibling of the rail's rule (the same tweak and header checks against the chain followed, no amount, six confirmations), roadmap step 14a. Draft 2: **experimental, not approved**; draft 1 (`module-bitcoin-clock-draft-1.md`) kept, superseded. Code: `onchain/src/clock.rs` (crate `mor-onchain`). |
| `units-bitcoin-draft-1.md` | Four units: the satoshi, and the satoshis of testnet, signet and regtest, which are not satoshis. Not yet approved. |
| `module-jpeg-draft-1.md` | A media type (task 5): a JPEG file as a picture, which way up and in what colours, and how a posting client strips it to the picture alone (roadmap step 9). |

| Code | What it is |
| --- | --- |
| `airgap/` | The three chain-key Modules above in Rust (crate `mor-airgap`), with `mor-signer`, the command-line signer for an offline laptop. See its README. |
| `lightning/` | The Lightning rail Module in Rust (crate `mor-lightning`): the BOLT 11 decoder and the rule, a client for lnd (feature `lnd`), and the regtest network for the end-to-end test. See its README. |
| `onchain/` | The on-chain rail Module in Rust (crate `mor-onchain`): the tweak, the transaction and header decoder, the rule, and a btcd client (feature `btcd`) for the end-to-end test on regtest. See its README. |
| `jpeg/` | The JPEG Module in TypeScript (`mor-jpeg`): reading and stripping, with test pictures and vectors checked by Pillow. See its README. |
