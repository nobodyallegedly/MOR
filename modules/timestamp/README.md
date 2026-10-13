# mor-timestamp

The timestamp clock Module, draft 1 (`../module-clock-timestamp-draft-1.md`), in TypeScript. **Experimental, test identities only.**

## In plain words

A timestamp clock is an ordinary MOR identity that signs one kind of act, a **stamp**: "I held these acts at this time." Its time is its computer's clock. A stamp proves that the clock's identity signed it, and nothing more: its operator's word. That is enough to order what protects nothing, such as a feed; a page names the clock it listens to (website cMIP draft 8), and the feed says whose order it is.

## Precisely

| File | What |
| --- | --- |
| `src/stamp.ts` | The stamp's format: `{ 0: time, 1: [+ act id] }`, at most 256 acts, closed; `encodeStamp`, `decodeStamp`, `TIMESTAMP_SPEC` (a test value until step 17), `STAMP_TYPE` (1), `reference(clock)`. |
| `src/read.ts` | Reading a clock's stamps: `readStamps` (by signer at the places given, each judged through the clock's chain by the core library), `earliest` (each act at its earliest stamp), `earliestByNames` (an act at the earliest stamp of itself or of any act naming it). The site's display client uses it in the browser. |
| `src/service.ts` | The clock service, `ClockService`: `stamp(ids)`, `sweep()` (what it finds at the relays it follows, never its own acts), `serve(port)` (`POST /stamp`). Each act once; never back in time; its stamps on its outbox relays. |
| `src/cli.ts` | `mor-clock run` and `mor-clock stamp`. |

## Running a clock

Make its identity with the genesis client, naming the relays its stamps go to as its outbox, then run it:

```sh
mor-genesis new --file clock.json --home https://home1.dubsar.org
mor-genesis routes --file clock.json --outbox https://home1.dubsar.org
npx tsx src/cli.ts run --file clock.json --state clock-state.json \
  --outbox https://home1.dubsar.org \
  --watch https://home1.dubsar.org --watch https://home2.dubsar.org \
  --signer <identity> --signer <identity> --port 8790
```

It stamps every act it finds at the relays watched (only those of the signers named, if any) every 30 seconds, and the acts given to `http://127.0.0.1:8790/stamp` as `{"acts": ["<act id>", …]}`. `clock-state.json` is its memory: each act stamped, and where each relay was read up to.

## Tests

`npm test`: the format and its refusals; the earliest stamp, and the earliest of any act naming one; the service against a real home and relays on local ports (stamping what it finds, never its own stamps, each act once, never back in time, the open form), and a reader judging its stamps through its chain while a stamp by another identity places nothing. The feed's order by a clock is tested in a browser in `clients/site/test/feed-clock.test.ts`.
