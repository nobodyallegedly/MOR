# mor-grants

Grants between identities, as a shared piece (decided by Nobody, allegedly, 17 October 2026, "an example of grant": "Build it as a shared piece: Damgar's round 2 lanes (grants to apps) will reuse it"). TypeScript, with the core library through WebAssembly; nothing from Node, so the web clients can use it (Dub's does).

**Test identities only, until MOR is frozen.**

## In plain words

A grant lets someone act in your name, within limits, with a key of their own (Agreements, F128: "Grant keys for every identity"). You sign the grant, public, saying who may act, what it may sign, how much one act may move and until when. The grantee makes the key, and signs to accept. What it then signs with that key is your own act, naming the grant, so every reader sees who signed it and on whose authority. One revocation ends it.

## Precisely

| File | What |
| --- | --- |
| `src/grant.ts` | A person's grant (Agreements type 9, scope 2: acting for the grantor) with its kinds (field 6), limits (fields 3 and 4) and grant key (field 9): `personGrantPayload`, `readGrant`, `grantInWords`; the grantee's key (`makeGrantKey`) and acceptance (`acceptance`, a signature act naming the grant); a revocation (`revocationPayload`); signing with the grant key on the grantee's strand, citing `[grantor, grant]` (Text rule 14's second case, F343; `signUnderGrant`); on whose authority an act stands, as any reader judges it: the grant, the acceptance and the grantor's revocations looked for, the limits judged, Agreements' backing (rule 80) through the core's limits input (`authorityOf`, `authorityOfId`); a timestamp clock's stamps read (`stampsOf`). |
| `src/limits.ts` | The grant limits cMIP, draft 1 (`cmips/cmip-grant-limits-draft-1.md`, F345): the format (`encodeLimits`, `readLimits`), the amount an act moves (`amountOf`), each act judged (`judge`: within, outside, unknown), and the grantee's client refusing before signing (`refuseBeforeSigning`). |

Relays and homes store an act signed under a grant as scoped (relay transport cMIP draft 5, F346; `relay/src/node.rs`, `check_binding`).

## Readings

1. **A person's grant offered to an agent** reaches Text posts, Envelopes publications, or the Money layer (`GRANTABLE`); scope 2.
2. **A cap applies to the amount a Money act names**; an act naming none moves nothing.
3. **An expiry on a timestamp clock** is judged by the earliest verified stamp of that clock naming the act; with none, unknown.

## Tests

`npm test`: the limits format and its refusals, the cap and the expiry judged, a person's grant read back. The grants on real relays, accepted, signed under, limited and revoked: `clients/desk/test/agents-grant.test.ts`; the relay's storing them: `relay/tests/grants.rs`.
