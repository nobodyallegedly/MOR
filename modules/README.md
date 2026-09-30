# Founding Modules

Specifications above the core that MOR V1 builds on. Not core: they compete like any other Module.

| File | What it is |
| --- | --- |
| `module-airgap-safety-signer-draft-4.md` | How an online device and an offline signer exchange safety-key commitments and rotations, and how a collective's split safety key is dealt. The genesis client implements it. |
| `module-safety-seed-words-draft-1.md` | A seed Module: the safety seed written as 24 words, and how its keys are derived. |
| `module-safety-seed-hex-draft-1.md` | A seed Module: the safety seed written as 72 hexadecimal characters, and how its keys are derived. |
| `module-jpeg-draft-1.md` | A media type (task 5): a JPEG file as a picture, which way up and in what colours, and how a posting client strips it to the picture alone (roadmap step 9). |

| Code | What it is |
| --- | --- |
| `airgap/` | The three safety Modules above in Rust (crate `mor-airgap`), with `mor-signer`, the command-line signer for an offline laptop. See its README. |
| `jpeg/` | The JPEG Module in TypeScript (`mor-jpeg`): reading and stripping, with test pictures and vectors checked by Pillow. See its README. |
