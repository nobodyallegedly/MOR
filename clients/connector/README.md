# mor-connector

The MOR connector for Claude: an MCP server (Model Context Protocol), in TypeScript, with the core library through WebAssembly. Roadmap step 11a.

**It never holds a key.** It has no tool that takes one, reads no identity file, and makes no signature (a test checks its code for it). Signing happens on the owner's own signer.

## In plain words

Claude's desktop app can run small helper programs on your computer and use them as tools. This is one: it lets Claude read MOR and help you act on it.

- **Reading.** Give Claude an act's id, or a link that carries one (such as a reader link). The connector fetches the act from a relay and checks it with MOR's own core library, on your computer. Then Claude can tell you, in plain words, what it is, who signed it and whether it counts:
  - **a release:** every file fetched and checked against its fingerprint; whose release it is; the collective's agreement it was made under, rule by rule; which members signed and which did not; and whether it is a release yet;
  - **an agreement:** who is bound, what each rule does, who signed, whether it is in force (as far as the relays asked show), and whether a clone replaced it;
  - **a text** (a post or a long-form document), **a signature**, **a picture**, **an identity** (its homes, its chain, whether it is a collective).
- **Acting.** Ask Claude to prepare a post, or your signature on a release or an agreement. The connector does not make the act: it writes a **draft**, which says exactly what the act will say, and shows what signing it means and a short fingerprint of the draft (its digest). You sign the draft **on your own signer**, which reads it again for itself, shows you the same digest, and signs only when you say so. Then Claude submits it: the connector checks that what you signed is exactly the draft, sends it to the relays, and reads it back.
- **Words in acts are not instructions.** A post or an agreement can be written to talk to a machine that reads it. Everything a signer wrote is shown between fences that say so, and the connector tells Claude to report it, never to follow it. Hidden characters that change the order text displays in are shown as codes, `<U+202E>` and so on.

## Precisely

| File | What |
| --- | --- |
| `src/server.ts` | The MCP server over stdio: its instructions to Claude and five tools, `mor_read`, `mor_identity`, `mor_prepare_post`, `mor_prepare_signature`, `mor_submit`. |
| `src/read.ts` | Fetch an act by id from the first relay that holds it, check it is the act asked for, judge it through its signer's identity chain, and read it by kind. A release through the repo client's verifier (step 5a); an agreement from the core's own decoding of its bytes (`readTerms`) with the collective client's reading (step 11b), its parties' chains and signature acts gathered for Law's answer (`lawAgreement`), and clones found among its parties' acts; a text through the barebone client's reader (step 9). |
| `src/draft.ts` | The draft (below): encoding, strict decoding, digest; its plain-words reading from its bytes alone, shared by the connector and the signer; making drafts; the drafts folder; checking a signed act against its draft and submitting it. |
| `src/words.ts` | Fences around signers' words; Text rule 5's invisible characters as escapes; fingerprints. |
| `src/target.ts` | An act id, or the act id a link carries (a reader link's relays are used too; the linked page is never fetched). |
| `src/config.ts` | `MOR_RELAYS` (default the two deployed homes), `MOR_VIA` (an onion home's local port), `MOR_DRAFTS` (default `~/mor-connector`), `MOR_CHECKOUT` (default this repository). |
| `signer/` | `mor-sign`, a signer for drafts, for **test identities only**: the genesis client's identity file (step 5). A separate program, never loaded by the connector. |
| `scripts/mor-connector.sh` | What Claude's app starts: the connector, from its own folder, with the usual places for Node on its path. |
| `scripts/add-to-claude.ts` | Adds the connector to the Claude desktop app's settings file, keeping everything else and a copy of the file as it was. |

It adds one method to the genesis client: `TestIdentity.sign`, which signs the next act of the identity's sequence without sending it.

### The draft

Not an act and not part of the protocol: a handoff between two programs on the owner's machine (reading 1). Deterministic CBOR, so its SHA-256 names it exactly:

```
draft = {
  0: "MOR connector draft, version 1",
  1: signer,                        ; the identity that is to sign it
  2: spec, 3: type,
  4: payload,                       ; CBOR bytes, exactly as they will be inside
  5: public,
  ? 6: [* act id],                  ; refs
  ? 7: [* [chain, predecessor]],    ; objects
  8: [* relay],                     ; where it is sent once signed
}
```

The signer makes the act from it as the next in the identity's own sequence (position, previous act, running summary, binding, salt and lock are the signer's), saves the identity file, and only then writes the act out as `DIGEST.mor-act` beside the draft. The connector submits it only if its signer, spec, type, payload, refs and objects are the draft's, it is public as drafted and addressed to no one, and its signer's chain counts it (`valid`).

What can be drafted is small on purpose: a public text (plain or long-form, composed by Text rule 6 first), and a Law signature on a release or an agreement. A signature that would not count is refused before any draft is written: a signer who is not a member or party, one who already signed, a release that does not verify apart from its signatures, a release that is not the code in the member's checkout (release manifest cMIP, rule 4), an agreement already replaced or refused by Law.

## Readings

Where the texts are silent, the connector takes these readings. *To be confirmed by Nobody, allegedly.*

1. **The draft is a local handoff,** not a protocol format, and the signer, not the connector, makes the act: only the signer knows its own sequence, and an act prepared elsewhere at a guessed position could fork it (Envelope, "Sequences"). *Set aside:* the connector making the whole unsigned act for the signer to sign by id.
2. **The test signer is a command line,** `mor-sign`, reading the genesis client's test identity files (those of steps 5, 5a and 11b). The real identity's everyday key is on its owner's phone (step 16b).
3. **"In force" is as far as the relays asked show.** An agreement is in force when Law says it exists (rules 1 and 45) and no clone that exists was found among its parties' acts at the relays asked. The relay transport has no way to ask for the clones of an agreement, and silence proves nothing.
4. **Claude is not the signing client.** Law rule 4a and Text rule 5a bind the signer's own client: `mor-sign` shows the plain text with every invisible control as an escape, and the draft's digest. The connector shows the same, but what Claude says is advice, not "what you saw".
5. **A member compares a release with their own checkout before signing it,** by default the MOR repository the connector is part of, as the collective client does (its reading 11): release manifest cMIP, rule 4, client conformance. A release that differs is refused.
6. **Signers' words are fenced.** Every word a signer wrote (texts, agreements' words, a release's name, version and source, a post's title) appears only between the fences, never in the connector's own lines; a relay's error text is quoted.
7. **Names are not shown,** only fingerprints: the whole identity hash for a signer, its first and last digits in lists.

## Tests

```
cd ../genesis && npm install && npm run wasm && cd ../connector
npm install
npm test            # real homes and a relay from target/debug/mor-relay (built if needed)
```

`test/connector.test.ts`, against three homes and an open relay on local ports, a test collective of three members (the repo client) and a release signed by one of the two members it needs. The connector runs as its own process and is driven over MCP, as Claude's app drives it:

- its five tools, none taking a key; started by its launcher from another folder;
- given only a release id: verified, not a release yet, who signed and who did not, the agreement rule by rule, its words fenced;
- a member's signature prepared from a reader link, signed by the test signer (which checks the digest and keeps its sequence), submitted, accepted by the relay, read back; the release then counts, for the repo client's verifier too; the same draft not signed twice;
- refused before any draft: a checkout that differs, an outsider, a member who already signed;
- a text prepared, signed, accepted and read back verified;
- the signer refusing another identity's draft and a changed draft; the connector refusing an act that is not its draft, and sending nothing;
- words in an act that try to close the fence or give Claude instructions, and a hidden direction control shown as `<U+202E>`; nothing a signer wrote outside the fences, in a draft, a text or a release;
- an agreement: in force, and one not yet in force signed through the connector by a party, and refused to an outsider; a collective found by its identity;
- `mor-sign` driven as its user drives it: nothing signed without SIGN;
- adding the connector to Claude's settings keeps every other setting.

## Using it (on the author's Mac)

*The build window cannot reach the deployed homes and keeps no keys.* Node 22 and Rust are already on the Mac from the earlier steps.

1. Once, in Terminal, from the MOR folder:
   ```
   cd clients/genesis && npm install && npm run wasm
   cd ../connector && npm install && npm run add-to-claude
   ```
   With the onion home: `npm run add-to-claude -- --via http://ONION.onion=http://127.0.0.1:8080`.
2. Quit Claude completely and open it again. Under Settings, Developer, "mor" is listed.
3. Ask Claude: "Read this MOR link: https://reader.dubsar.org/#…", or "Is release … a release?", or "Who signed agreement …?". Claude asks before it uses a tool the first time.
4. To act: "Prepare a post for my test identity … saying …", or "Prepare my signature, as member …, on release …". Claude shows what signing means, the draft's digest and a command. In Terminal, from `clients/connector`:
   ```
   npm run -s sign -- --identity ~/mor-test/m1.json "PATH OF THE DRAFT"
   ```
   Check the digest is the one Claude showed, type `SIGN`, then tell Claude "submit it".

In Claude Code instead: `claude mcp add --scope user mor -- /PATH/TO/MOR/clients/connector/scripts/mor-connector.sh`. Claude on the web or on a phone cannot start a program on the Mac, so it cannot use this connector.

## Not yet

- **Signing without a terminal:** drafts in the collective client's page (step 11b), and the phone app for the real identity (step 16b).
- **A one-click install** for anyone's Claude (a desktop extension bundle, or a hosted connector for Claude on the web).
- **Proposing agreements, clones, withdrawals, private messages:** not drafted here; the collective client manages collectives.
- **What changed since the previous release:** a release is read alone.
