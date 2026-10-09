# Founding Modules

Specifications above the core that MOR V1 builds on. Not core: they compete like any other Module.

| File | What it is |
| --- | --- |
| `module-airgap-safety-signer-draft-4.md` | How an online device and an offline signer exchange safety-key commitments and rotations, and how a collective's split safety key is dealt. The genesis client implements it. |
| `module-safety-seed-words-draft-1.md` | A seed Module: the safety seed written as 24 words, and how its keys are derived. |
| `module-safety-seed-hex-draft-1.md` | A seed Module: the safety seed written as 72 hexadecimal characters, and how its keys are derived. |
| `module-lightning-rail-draft-2.md` | A rail Module under the payment cMIP: a BOLT 11 invoice signed by the node the payee declared, committing to the payment, and its preimage, as the proof of a Lightning payment (roadmap step 12). Draft 2: **experimental**, its costs stated (F117), an instrument for testing Finance, never for real money. Not approved. |
| `module-onchain-rail-draft-1.md` | A rail Module under the payment cMIP: pay-to-contract, a fresh Taproot address tweaked by the payment commitment, signed for by the payee's request key, and the confirmed transaction with six headers as the proof of an on-chain payment (roadmap step 12a). Draft 1: **experimental**, its costs stated; a request rail; questions for Finance open. Not approved. |
| `units-bitcoin-draft-1.md` | Four units: the satoshi, and the satoshis of testnet, signet and regtest, which are not satoshis. Not yet approved. |
| `module-jpeg-draft-1.md` | A media type (task 5): a JPEG file as a picture, which way up and in what colours, and how a posting client strips it to the picture alone (roadmap step 9). |

| Code | What it is |
| --- | --- |
| `airgap/` | The three safety Modules above in Rust (crate `mor-airgap`), with `mor-signer`, the command-line signer for an offline laptop. See its README. |
| `lightning/` | The Lightning rail Module in Rust (crate `mor-lightning`): the BOLT 11 decoder and the rule, a client for lnd (feature `lnd`), and the regtest network for the end-to-end test. See its README. |
| `onchain/` | The on-chain rail Module in Rust (crate `mor-onchain`): the tweak, the transaction and header decoder, the rule, and a btcd client (feature `btcd`) for the end-to-end test on regtest. See its README. |
| `jpeg/` | The JPEG Module in TypeScript (`mor-jpeg`): reading and stripping, with test pictures and vectors checked by Pillow. See its README. |
