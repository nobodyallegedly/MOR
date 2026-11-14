# agreements-check

Reads acts of the new Agreements encoding (`docs/agreements-from-scratch/encoding-1.md`) and says, in plain words, whether each one's shape, fields and signature pass, and if not, which rule of encoding-1 or of draft 24 it fails.

```sh
cargo run -p agreements-check -- [--hex] [--json] [--key HEX]... FILE...
```

- Each `FILE` holds one act's bytes; with `--hex`, written in hexadecimal (`-` reads standard input).
- Several files are read as the acts a verifier holds together: `previous` is then also checked among them (G6.1).
- `--key HEX` is the content key of a private act; give one for each private file, in order.
- `--json` prints one line per act: `{ verdict, act, id, signer, rule, says, invalid, notes }`.
- Exit status: 0 when every act passes, 1 when one does not, 2 on a usage error.

Answers: **PASS**; **REJECTED** (no Agreements act: it never reaches the grammar rules); **INVALID** (its bytes show it cannot count, the grammar rule named); **UNKNOWN** (a signature scheme not implemented); **CANNOT OPEN** (private, no key); **NOT THIS ENCODING**. It gives none of the grammar's answers (in force, fork, unchecked): that is a later step. The vectors are in `core/vectors/agreements-new/`.
