# The players' kit, as a test fixture

The players' kit of round two, unchanged, for the draft-25 tests only (`test/agreements-25.test.ts`, and
Edubba's `clients/desk/test/agreements-25.test.ts`): `lib/kit.mjs`, `lib/core.mjs`, `lib/format.mjs`,
`mor.mjs` and `AGREEMENTS-FIELDS.md`, copied from branch `claude/round-2-postman`, commit `74739bb`,
folder `tools/postman/kit`. `core/` is a link to `../../built-25`, the kit's own `core/` folder copied
there unchanged (its fingerprints in `built-25/BUILT-WITH.txt`).

The tests make test identities with it, sign the worked examples of `AGREEMENTS-FIELDS.md` with it,
and run its `agreements check` command on every act the two clients write. No program of either
client imports it.

TEST IDENTITIES ONLY.
