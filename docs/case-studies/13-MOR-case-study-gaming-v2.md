# MOR Case Study: From Pocket Game to Open Market

*Case study, draft 2, 9 October 2026. Draft 1 with the technical pass of 9 October 2026 applied (`docs/technical-pass-2026-10-09.md`), items 1 to 5, nothing else changed; items 6 and 7 needed no change. The rest is unchanged, for the author's own passes and the redraft. Draft 1's notes follow.*

*Case study, draft 1, 27 September 2026. What MOR could be, with your help.*

*Note, 6 October 2026: this draft predates the current core (Identity draft 11, Finance draft 6, Law draft 10) and the review rounds that changed it. Some rules it describes have since changed. It is to be redrafted (roadmap, 9 October 2026).*

## Why this case study

Games are the largest entertainment industry in the world, and one of the most locked. A handful of stores and platform owners decide what gets sold, take a large share of every sale, and can change the rules at any time. Players buy games they never really own: when a store closes an account or a publisher shuts down a server, what they paid for can disappear. Modders build entire genres on other people's games and are rarely paid. Players make items that others buy, and see little of the money.

Some have tried to change this. Blockchain gaming platforms promised that players would own and resell their games, with developers paid on every resale, but tied the idea to tokens and speculation. The idea itself was sound.

This case study follows one developer, Mina, from a small mobile game to a studio, a large release on a store, a dispute with that store, and a move to an open market. It ends with a console maker, to show that closed systems still work on MOR.

MOR does not run games. Engines, servers, matchmaking and anti-cheat stay outside the protocol. MOR carries ownership, licences, payments, lineage and exit around them.

## 1. Solo: a mobile game

**Mina makes a small puzzle game** on her own. She has an identity with a signing key on her laptop and a safety key on an offline device.

**The game is a work,** bound to her by a claim. Each version she releases is a new work naming the previous one, since nothing on MOR is updated.

**She sells through several channels at once.** The mobile app stores take between 15% and 30% of each sale and set their own rules; in the European Union they must now also allow alternative stores. On MOR, each store is a publisher holding a stake in its own publication, never in the game. Mina also sells directly through a standing offer. Each settlement shows what each store took, so she can see which channel actually pays.

**The licence belongs to the player.** A purchase is an agreement between the player and Mina, recorded under the player's identity, so the player's wallet must read Law: a wallet that reads only Finance cannot buy the licence. The store that sold it is named in the settlement, but the licence does not depend on the store staying in business.

**Players tip,** and some start making level packs for her game.

## 2. A studio: the collective

**Mina forms a studio** with an artist and a composer. The studio is a collective: a full identity with its own keys and a founding agreement setting how they are held, as for the band in the music case study.

**Each game has its own stakes.** The next game's agreement sets the shares, in millionths. The composer's soundtrack is a work of its own, sold separately to players and licensed to streamers, and it earns through the same split.

**Mods and levels pay their makers.** Mina publishes her game's level format with a standing offer: anyone may make and sell levels, and a share of each sale goes to the studio. A level pack names the game as its source; when it sells, the split pays both the level maker and the studio, if the level maker's agreement honours the studio's offer; if it does not, its published split shows exactly that. A mod built on a mod pays its own parent the same way, and the chain takes care of itself among people who keep their offers.

**Tools used.** The game is built with a commercial engine and a few paid asset packs. Each is a work under a signed licence. If an asset pack's licence asks for a share of sales, it appears as a "tools used" role share in the game's split, if the game's agreement honours the licence; if it does not, the split shows exactly that.

## 3. A bigger game on a large store

**Early access, funded by a target.** For its first large game, the studio publishes a target: what it needs to finish the game, and what players get for supporting it. Progress is computed from receipts, which the studio publishes without the payers' names, not claimed. Early supporters receive their licence immediately and every later version of the game.

**The store publishes it.** A large PC store publishes the game, holding a publication stake: for example 30% of sales through its channel, visible in every settlement.

**Players make and sell items.** Skins, maps and characters made by players are works, bound to their makers. When one player sells an item to another, the settlement pays the seller, a share to the item's maker, a share to the studio and the marketplace's fee, all visible, if the seller's agreement honours the maker's and the studio's offers; if it does not, that is visible too.

**Loot boxes, made legible.** The game sells random item boxes. Their odds are published as a signed rule, and each draw can be checked afterwards against the published odds, for example by committing to the random result before the box is opened. The studio may sell boxes; players can see exactly what they are buying. Some countries treat paid loot boxes as gambling, and law decides where they can be sold at all.

**Streamers pay back, if the studio asks.** Streaming the game is a use of the studio's work. The studio's standing offer can ask streamers for a small share of what they earn while playing it, as a "tools used" share, or leave streaming free to promote the game. Either way, it is stated in advance.

## 4. The dispute

**Two blows arrive in the same month.**

**First, the engine maker announces a new fee** per installation, applying to games already released. This has happened before in the industry, and developers revolted.

On MOR, the studio's engine licence is a signed agreement. It changes only by cloning, and a clone needs the signature of every party whose terms would change. The engine maker can offer new terms for new versions of its engine; it cannot change the licence the studio already signed. The announcement becomes a proposal the studio can decline, visibly.

**Second, the store delists the game** after the studio refuses a new revenue split. On a traditional store, delisting can leave players unable to download what they bought.

On MOR:

- **Players keep their licences.** Each licence is an agreement between the player and the studio, recorded under the player's identity. The store's publication ends; the licences do not.
- **The game files stay available.** They live on relays, and the studio's identity tells clients where to find them.
- **The record is complete.** The negotiation between the studio and the store is signed, each message acknowledging the last. If the store claims the studio broke its terms, either side can publish the record.

**The store keeps what it earned.** Its publication stake in past sales stands. It simply stops earning on future ones.

## 5. The open market

**The studio moves to an open game market,** or rather to several: marketplaces where any studio can list its games, any client can show them, and players own their licences outright.

**Resale.** A player who has finished the game can sell their licence to another player. The resale is a clone of the licence agreement, transferring it to the new owner, and the studio's share of each resale is part of the licence's terms. Since the studio is a party to the licence, each resale needs the studio's signature too; a resale service working under the studio's grant can sign for it. This is what blockchain gaming platforms set out to do, without needing a token: the licence is an agreement, and the resale is signed like any other.

**A resale cMIP is needed,** and studios choose, for example:

- **free resale:** players resell freely, with nothing to the studio;
- **resale with a share:** each resale pays the studio a set share;
- **no resale:** the licence cannot be transferred, stated clearly before purchase.

**Marketplaces compete** on fees, discovery and curation, each holding a publication stake in its own listings. The studio sees in real settlements which marketplace sells.

**When a game ends.** Online games need servers, and servers eventually close. A European citizens' initiative, "Stop Killing Games", campaigns against games becoming unplayable when publishers switch them off. On MOR, the licence and the player's items stay the player's, whatever happens to the servers. **What a studio promises at the end is a question for an end-of-life cMIP**, for example:

- **server release:** the studio publishes the server software so players can run it themselves;
- **offline mode:** the game is updated to run without servers before they close;
- **partial refunds** for recent purchases;
- **nothing,** stated clearly at purchase.

Whatever the studio chooses, it is part of the licence players sign, visible before they buy.

## 6. Consoles: closed systems still work

**A console maker wants the game.** Consoles are closed systems: the console maker decides what runs on its hardware, certifies every game, and takes a share of every sale.

**This works on MOR unchanged.** The studio licenses the game to the console maker for its platform, under an agreement with conditions, a time reference and a keeper. The game's content key is delivered to a key held in the console's secure hardware, as the streaming service's app does in the video case study. Players on the console play it; they never hold the key.

**What stays legible:** the console maker's share, any exclusivity window, and the players' licences, which remain theirs as a record of what they paid for, even if the console's store later closes.

**What the console maker keeps:** its certification, its hardware, its exclusives, its brand. It gains a studio that arrives with its own players, and players who arrive with their own identities and histories.

## 7. The network behind it

- **Developers and studios:** paid by sales, resales, targets and tips.
- **Composers, artists and asset makers:** paid through splits and "tools used" shares.
- **Modders and item makers:** paid through lineage.
- **Stores, marketplaces and console makers:** paid through publication stakes.
- **Engine makers:** paid under licences that cannot change without consent.
- **Streamers:** promoting games, paying shares where studios ask.
- **Relays:** storing and serving game files.
- **Developers of tools:** building licence, marketplace and modding modules.

## 8. What MOR provides, and what it needs

**From the core, nothing new.** Works and versions, claims, standing offers, agreements and clones, splits and role shares, publication stakes, the negotiation record, keepers, time references, collectives and key delivery to secure hardware are already defined; lineage, and targets computed from receipts, are built from these core pieces.

**Open for others to build (cMIPs and Modules):**

- **Game licence cMIPs:** what a licence grants, across versions and platforms.
- **Resale cMIPs:** free, with a share, or not at all.
- **End-of-life cMIPs:** server release, offline mode, refunds.
- **Item cMIPs:** player-made items, their makers and their resale.
- **Mod lineage cMIPs:** how mods and levels name their sources and share income.
- **Random draw modules:** published odds and verifiable draws.
- **Streaming terms:** shares for streaming a game, or free use.
- **Marketplace clients:** open game markets.
- **Console licensing toolkits:** closed-platform keys and certification.

## 9. Honest limits

- **MOR does not run games.** Servers, engines and anti-cheat stay outside. A licence on MOR guarantees ownership of the record, not that the game still runs.
- **A licence is not a copy.** If nobody keeps the game files on a relay, owning the licence does not bring them back. Studios and players who care must keep files available.
- **Closed platforms stay closed.** On a console, the player's licence is a record; playing still depends on the console maker.
- **Resale changes game economics.** Studios fear that resale undercuts new sales; resale shares help, but each studio decides.
- **Verifiable odds are not fair odds.** A loot box with visible, terrible odds is still a loot box.
- **Law comes first:** on loot boxes, on resale of digital goods, and on what happens when games are switched off.

## 10. What it demonstrates

A pocket puzzle game and a console release use the same rules. Stores, engines, marketplaces and console makers keep their roles and their cuts, visibly. What changes is who holds what: the player holds the licence, the modder holds a share in what they built on, the studio holds its agreements, and nobody can change terms already signed. The right of exit, applied to games, means that when a store, an engine maker or a server walks away, what people paid for and what they built stays theirs.
