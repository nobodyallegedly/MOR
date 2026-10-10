# Units: the satoshi, and the satoshis of Bitcoin's test networks

*Draft 1, 2 October 2026 (roadmap step 12). **Not yet approved.** Four unit specifications (Development kind 2), one per network, written together. Each is published as its own specification, with its own hash; until their creator is named at step 17 each is named by a test value. The unit specification format is an open parameter of the Money MIP: each text below is the whole of its specification for now.*

*Reading this document: normal text is the specification. Italic text is commentary.*

*Why four: a unit names what an amount is counted in, so that one unit has one name on every rail (Money, "One name per unit"). A coin of a test network is worth nothing and can be made at will; counting it as a satoshi would let a test payment discharge a real debt. The Lightning rail Module (and the on-chain Module of step 12a) carry each network's own unit.*

## Satoshi (Bitcoin)

The smallest part of a bitcoin on the Bitcoin network (main chain): one hundred-millionth of a bitcoin. An amount in this unit counts whole satoshis.

## Satoshi (testnet)

The smallest part of a coin of Bitcoin's public test network (testnet3, or its successor named by the rail Module): worth nothing, never a satoshi. An amount in this unit counts whole units.

## Satoshi (signet)

The smallest part of a coin of Bitcoin's default signet: worth nothing, never a satoshi. An amount in this unit counts whole units.

## Satoshi (regtest)

The smallest part of a coin of a private regression-test network: worth nothing, never a satoshi, and different on every such network. An amount in this unit counts whole units. *Two regtest networks share this unit's name though not their coins; it is for tests only.*
