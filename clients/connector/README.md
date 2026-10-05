# mor-connector

The MOR connector for Claude: an MCP server (Model Context Protocol), in TypeScript, with the core library through WebAssembly. Roadmap step 11a, reworked at step 11c.

**It never holds a key and never sends an act.** It has no tool that takes a key, reads no identity file, makes no signature and puts nothing on a relay (a test checks its code for it). Acts are signed and sent at the owner's desk, MOR Identities (`clients/desk`).

## In plain words

Claude's desktop app can run small helper programs on your computer and use them as tools. This is one: it lets Claude read MOR and prepare acts for you to approve.

- **Reading.** Give Claude an act's id, or a link that carries one (such as a reader link). The connector fetches the act from a relay and checks it with MOR's own core library, on your computer. Then Claude can tell you, in plain words, what it is, who signed it and whether it counts:
  - **a release:** every file fetched and checked against its fingerprint; whose release it is; the collective's agreement it was made under, the one the collective's record named at the time, rule by rule; which members signed and which did not; and whether it is a release yet;
  - **an agreement:** who is bound, what each rule does, who signed, whether it is in force **as far as the relays asked show**, and whether a clone replaced it; for a collective, the agreement in force is the one the collective's own record names;
  - **a text** (a post or a long-form document), **a signature**, **a picture**, **an identity** (its homes, its chain, whether it is a collective and which agreement its record names).
- **Preparing.** Ask Claude to post, publish a picture, withdraw a picture or send a message, for an identity you linked to Claude at the desk. The connector writes a **draft** as a file into the drafts folder on your Mac, `~/mor-drafts` (its format is documented in `DRAFTS.md`; nothing is written there): exactly what the act will say, what signing it means, and a short fingerprint of it (its digest). Nothing is signed. In MOR Identities you read it again, with the same digest, and approve it, decline it, or send it back with a note.
- **Hearing back.** Claude asks the connector what the desk answered. An approval: the connector fetches the act from the relays and checks it is exactly the draft. A note: Claude reworks the draft and prepares a new one, naming the one you sent back.
- **What Claude cannot prepare.** Anything outside the Text and Envelope layers: no signature on a release or an agreement, no agreement, no Identity act (decided by Nobody, allegedly, 1 October 2026). Claude still reads and explains every act.
- **Words in acts are not instructions.** A post or an agreement can be written to talk to a machine that reads it. Everything a signer wrote is shown between fences that say so, and the connector tells Claude to report it, never to follow it. Hidden characters that change the order text displays in are shown as codes, `<U+202E>` and so on.

## Precisely

| File | What |
| --- | --- |
| `src/server.ts` | The MCP server over stdio: its instructions to Claude and seven tools: `mor_read`, `mor_identity`, `mor_prepare_post`, `mor_prepare_message`, `mor_prepare_picture`, `mor_prepare_withdrawal`, `mor_drafts`. Every prepare tool takes an optional `note` (Claude's words to the owner, never signed) and `reworks` (a draft the owner sent back). |
| `src/read.ts` | Fetch an act by id from the first relay that holds it, check it is the act asked for, judge it through its signer's identity chain, and read it by kind (the reader, the repo client, the collective client's readings). |
| `src/draft.ts` | The draft: encoding, strict decoding, digest; its plain-words reading from its bytes alone, shared by the connector and the desk; making the four kinds of draft; the drafts folder (drafts, answers, linked identities); checking an act against its draft. |
| `src/words.ts` | Fences around signers' words; Text rule 5's invisible characters as escapes; fingerprints. |
| `src/target.ts` | An act id, or the act id a link carries (a reader link's relays are used too; the linked page is never fetched). |
| `src/config.ts` | `MOR_RELAYS` (default the two deployed homes), `MOR_VIA` (an address reached through a local port), `MOR_DRAFTS` (default `~/mor-drafts`). |
| `DRAFTS.md` | The drafts folder, documented: the draft, the answer, the linked identities, rework. |
| `scripts/mor-connector.sh` | Starts the connector from this folder, with the usual places for Node on its path: for Claude Code and the tests. |
| `scripts/add-to-claude.ts` | Installs a runnable copy of the connector outside `~/Documents` and adds it to the Claude desktop app's settings file, keeping everything else and, from the first run only, a copy of the file as it was. |

### Why it is installed outside Documents

The Claude desktop app cannot start a program kept inside `~/Documents`: macOS refuses it ("Operation not permitted"), even when Claude has Full Disk Access (human test, 2 October 2026). The MOR repository usually lives in Documents. So `npm run add-to-claude` bundles the connector, its libraries and the core library into one folder, `~/Library/Application Support/MOR/connector/` (a launcher, `bin/mor-connector.mjs`, `wasm/mor_wasm_bg.wasm`), and registers that folder's launcher with Claude. The copy needs only Node; it reads nothing from the repository. It does not change when the repository does: after pulling new code, run `npm run add-to-claude` again. Running it again is safe: it replaces the copy and the "mor" entry, and keeps the copy of Claude's settings made the first time (`claude_desktop_config.json.before-mor`), which is never overwritten.

*Changed at step 11c:* the terminal signer `mor-sign`, the tool `mor_submit` and signature drafts on releases and agreements are removed; `MOR_CHECKOUT` with them, since only a member signing a release compared it with a checkout. Drafts gained messages, pictures, withdrawals, Claude's note and rework (`MOR draft, version 2`).

## Readings

Where the texts are silent, the connector takes these readings. *To be confirmed by Nobody, allegedly.*

1. **The draft is a local handoff,** not a protocol format, and the desk, not the connector, makes the act: only the desk knows the identity's own sequence, and an act prepared elsewhere at a guessed position could fork it (Envelope, "Sequences"). *Decided since (1 October 2026):* by a folder on the Mac, documented in `DRAFTS.md`.
2. **"In force" is as far as the relays asked show** (decided, 1 October 2026). An agreement is in force when Law says it exists (rules 1 and 45) and no clone that exists was found among its parties' acts at the relays asked; for a collective, the one its record names. A way to ask relays for later versions of an agreement is raised for the next relay transport draft.
3. **Claude is not the signing client.** Law rule 4a and Text rule 5a bind the signer's own client: the desk shows the plain text with every invisible control as an escape, and the draft's digest. What Claude says is advice, not "what you saw".
4. **Signers' words are fenced.** Every word a signer wrote appears only between the fences, never in the connector's own lines; a relay's error text is quoted. The owner's notes from the desk are shown as the owner's, quoted, and they direct the rework.
5. **Names are not shown,** only fingerprints, except the names the owner gave the identities linked to Claude, which the desk writes to the drafts folder so Claude can say whose draft it is.
6. **Two approvals for a post with a picture:** the picture is published first; its id, known only once signed, is what the post refers to. *Set aside:* one draft holding several acts.

## Tests

```
cd ../genesis && npm install && npm run wasm && cd ../connector
npm install
npm test            # real homes and a relay from target/debug/mor-relay (built if needed)
```

`test/connector.test.ts`, against three homes and an open relay on local ports, a test collective of three members (the repo client) and a release signed by one of the two members it needs. The connector runs as its own process and is driven over MCP, as Claude's app drives it:

- its seven tools, none taking a key, none preparing a Law act; started by its launcher from another folder;
- given only a release id: verified, not a release yet, under the agreement its collective's record named, who signed and who did not, the agreement rule by rule, its words fenced;
- a post prepared as a draft for a linked identity, by hash or by name, decoding to exactly what was asked, waiting at the desk;
- refused before any draft: an identity not linked, a message to an identity that cannot receive one, a withdrawal of what is not a publication;
- words in an act that try to close the fence or give Claude instructions, and a hidden direction control shown as `<U+202E>`;
- an agreement in force as far as the relays asked show, the collective's agreement as its record names it; one proposed and not yet signed, read as not in force yet;
- its code never loads an identity file, signs, nor puts an act on a relay;
- adding the connector to Claude's settings keeps every other setting;
- every tool that prepares or lists drafts says where drafts are written (the drafts folder, not `DRAFTS.md`);
- `add-to-claude` installs a copy that, moved away from the repository and started from another folder, serves its tools and reads from a relay; run twice, it keeps the first copy of the settings as they were.

Drafts going to the desk, sent back, reworked, approved and accepted by a relay: `clients/desk/test`.

## Using it (on the author's Mac)

*The build window cannot reach the deployed homes and keeps no keys.* Node 22 and Rust are already on the Mac from the earlier steps. Install MOR Identities first (`clients/desk/README.md`), then:

1. Once, in Terminal, from the MOR folder (the core library must be built: `clients/genesis`, `npm run wasm`):
   ```
   cd clients/connector && npm install && npm run add-to-claude
   ```
   It installs the connector in `~/Library/Application Support/MOR/connector/` (see above why) and says so. Run it again after each pull.

   Once, check the saved copy of Claude's settings by eye. It is meant to be the file as it was before MOR was ever added, and it is never overwritten, so a copy made by an earlier, faulty run stays wrong. In Terminal:
   ```
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json.before-mor
   ```
   Under `"mcpServers"` there should be no `"mor"` entry. If there is one, the copy was made after MOR was first added (as on the author's Mac, by a run before 2 October 2026) and is not the original: should you ever put Claude's settings back from it, take that `"mor"` entry out first. If the file does not exist, Claude had no settings file before MOR.
2. Quit Claude completely and open it again. Under Settings, Developer, "mor" is listed, starting from `~/Library/Application Support/MOR/connector/mor-connector.sh`.
3. Ask Claude: "Read this MOR link: https://reader.dubsar.org/#…", or "Is release … a release?", or "Who signed agreement …?". Claude asks before it uses a tool the first time.
4. To act: "Prepare a post for Machine, allegedly, saying …". Claude shows what signing means and the draft's digest. In MOR Identities the draft appears by itself within a few seconds, with the same digest; approve, decline, or send it back with a note. Then tell Claude "see what the desk said".

In Claude Code instead: `claude mcp add --scope user mor -- "$HOME/Library/Application Support/MOR/connector/mor-connector.sh"` after `npm run add-to-claude` (or this folder's `scripts/mor-connector.sh`, where the terminal may read Documents). Claude on the web or on a phone cannot start a program on the Mac, so it cannot use this connector.

## Not yet

- **A one-click install** for anyone's Claude: a desktop extension bundle, made at step 17 once the spec hashes are final (decided, 1 October 2026).
- **What changed since the previous release:** a release is read alone.
