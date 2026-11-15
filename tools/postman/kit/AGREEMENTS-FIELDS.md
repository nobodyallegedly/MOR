# FIELDS.json for `agreements sign`

*The fields of each new Agreements act, as the core library's builders take them (Agreements draft 25, encoding 2; the report block, proposal 4). Each example below is signed and checked in the kit's tests. Replace the capitals with real values.*

**Rules for every act:**
- Hashes are 64 lowercase hexadecimal characters.
- `previous` is one act id, or `null`. Never `[]`: an empty list is refused ("invalid type … expected a string").
- `params` and `content` are CBOR bytes written in hex (`"f6"` is CBOR null).
- A field the builder does not know is refused.
- `node kit/mor.mjs agreements words WORDS.txt` gives the fingerprint for `body.words`, computed from the file's exact bytes.

**`previous`, plainly:** your own previous act in this agreement.
- The first act you sign in it: `null`.
- If you wrote the Terms, they are your previous act. Your assent then names them: `"previous": "TERMS-ID"` (draft 25, section 3.2). An author's assent with `null` passes the check but forks your own line, and it is **not counted**.

## Terms

```json
{
  "parties": [{ "signer": "YOUR-ID" }, { "signer": "OTHER-ID" }],
  "authors": [0],
  "body": { "words": "WORDS-FINGERPRINT", "cmip": "TERMS-READING-CMIP-HASH", "params": "f6" },
  "previous": null
}
```

`authors` are positions in `parties`. A party can also be named by role, as in `{ "role": { "kind": "future", "spot": { "cmip": "HASH", "params": "f6" } } }`. Terms naming a party by role must carry `in_force` (G4.2).

**Signing Terms is not agreeing to them (G4.1).** They come into force once every party named as a signer has signed an assent, the author included. When you sign Terms in which you are a party, the kit says so and writes your assent's fields to `acts/TERMS-ID.assent.json`, with the one command that signs it.

## Statement: assent

```json
{ "agreement": "TERMS-ID", "terms": "TERMS-ID", "kind": "assent", "previous": null }
```

This is for a party who did not write the Terms. The author writes `"previous": "TERMS-ID"`. `agreement` is the agreement's root: for a first version, the Terms act itself. Sign with `--held acts/TERMS-ID.mor`, so the check sees the Terms.

## Statement: counter signature (cancels your assent, until the Terms are in force)

```json
{ "agreement": "TERMS-ID", "terms": "TERMS-ID", "kind": "counter_signature", "previous": "YOUR-ASSENT-ID" }
```

It follows the assent it cancels in your own line (G4.10).

## Statement: contest (against an offer or vow: Terms naming a party by role)

```json
{ "agreement": "OFFER-ID", "terms": "OFFER-VERSION-ID", "kind": "contest", "previous": null }
```

It may carry `content`. The grammar does not read it (G11.8).

## Statement: resolve (a fork in your own line)

```json
{ "agreement": "TERMS-ID", "terms": "TERMS-ID", "kind": "resolve", "previous": "TERMS-ID", "resolves": ["TIP-A", "TIP-B"], "continues": "TIP-A" }
```

`resolves` is sorted. A resolve carries no `content` (G12.3).

## Report (the report block, proposal 4: a proposal)

```json
{ "call": { "act": "CALL-ACT-ID" }, "lines": [{ "line": "received", "amount": { "unit": "UNIT-HASH", "value": 5 }, "by": "PAYMENT-ACT-ID" }] }
```

The kinds of line are `received`, `passed on` (with `to`, `by` and optionally `closes`), `own part`, `kept` and `still owed` (with `to`). `to` is `{ "signer": ID }` or `{ "agreement": ID }`.
