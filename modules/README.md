# Founding Modules

Specifications above the core that MOR V1 builds on. Not core: they compete like any other Module.

| File | What it is |
| --- | --- |
| `module-airgap-safety-signer-draft-4.md` | How an online device and an offline signer exchange safety-key commitments and rotations, and how a collective's split safety key is dealt. The genesis client implements it. |
| `module-safety-seed-words-draft-1.md` | A seed Module: the safety seed written as 24 words, and how its keys are derived. |
| `module-safety-seed-hex-draft-1.md` | A seed Module: the safety seed written as 72 hexadecimal characters, and how its keys are derived. |

| Code | What it is |
| --- | --- |
| `airgap/` | The three Modules above in Rust (crate `mor-airgap`), with `mor-signer`, the command-line signer for an offline laptop. See its README. |
