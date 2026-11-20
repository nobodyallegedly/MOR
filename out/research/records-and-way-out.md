# Records and the way out

*Research session C for DubWeb (the Dubsar Suite), 20 November 2026. A record of research work, written for Nobody, allegedly. Nothing here is a decision. Every "For DubWeb" paragraph is this session's suggestion, labelled as such.*

## Summary

1. Append-only logs prove "nothing was changed". They do not prove "everyone was shown the same thing". Every system studied leaves that second check to someone else, and often nobody does it.
2. The fix that is winning is witnesses: independent parties co-sign what they saw. DubWeb's place and second keeper already play this part.
3. A timestamp proves "existed by". It never proves "not before". A fresh public value inside the text gives "not before".
4. Two time references do not get averaged. Each must hold on its own. A clash is evidence, to be shown, not smoothed.
5. Open books are rarely read raw. Measured readership is tiny. They work when a short summary meets the reader at the moment of a choice.
6. Amounts and times alone can identify a giver in a small group.
7. A payment preimage proves an invoice was paid. It does not prove who paid, or what for.
8. Proof-of-reserves shows the limit of "each person checks their own line": no exchange has published how many do.
9. Moving works where identity is a key the person holds and a copy exists elsewhere before the server dies. It fails where the old server must help.
10. Few people ever move, and official guides warn of permanent lock-out. The way out must be rehearsed and nearly automatic.

## How to read the marks

- **(M)** measured: an observed fact, incident, number, or behaviour of running code.
- **(I)** designers' intent: what a spec, policy or author says the system is meant to do.
- **(A)** analysis: argued or proven in a paper, not observed in the field.
- A dagger (†) after a link means the page could not be opened from this session. The container reached only GitHub. Those claims rest on search excerpts and must be opened before anyone relies on them. Links without a dagger were opened, mostly as the GitHub-hosted source of the official text.
- Wording in quotation marks was read through a fetch tool. Spot-check any quote before printing it elsewhere.

## 1. Transparency logs

**Certificate Transparency (CT).**

- A log gives a signed promise to include a certificate. The promise is not proof of inclusion. (I) [RFC 6962 §3](https://raw.githubusercontent.com/google/certificate-transparency-rfcs/master/rfc6962.txt)
- The browser checks the promise's signature. It is not required to check inclusion. (I) [RFC 6962 §5.2](https://raw.githubusercontent.com/google/certificate-transparency-rfcs/master/rfc6962.txt)
- Monitors are meant to read every entry. Auditors check that two signed tree heads are consistent. (I) [RFC 6962 §5.3–5.4](https://raw.githubusercontent.com/google/certificate-transparency-rfcs/master/rfc6962.txt)
- A split view is a log showing different histories to different people. RFC 6962 says it is caught by "global gossiping", and does not define gossip. Two conflicting signed heads are proof of misbehaviour. (I) [RFC 6962 §5, §7.3](https://raw.githubusercontent.com/google/certificate-transparency-rfcs/master/rfc6962.txt)
- The gossip draft expired in 2018 and never became a standard. (M) [IETF datatracker](https://datatracker.ietf.org/doc/draft-ietf-trans-gossip/)†
- CT version 2 also puts split views "outside the scope". (I) [draft-ietf-trans-rfc6962-bis-42](https://raw.githubusercontent.com/google/certificate-transparency-rfcs/master/draft-ietf-trans-rfc6962-bis-42.txt)
- Chrome counts promises: two or three, from at least two different operators. (I) [Chrome CT policy](https://github.com/GoogleChrome/CertificateTransparency/blob/master/ct_policy.md)
- Chrome's inclusion checking is a sampled side check through Google, capped at three full reports per browser. (M, source code) [sct_reporting_service.cc](https://github.com/chromium/chromium/blob/main/chrome/browser/ssl/sct_reporting_service.cc)
- Chrome requires logs never to show two conflicting views, and runs the compliance monitoring itself. (I) [Chrome log policy](https://github.com/GoogleChrome/CertificateTransparency/blob/master/log_policy.md)
- Newer "static" logs publish the tree as plain files. Readers compute proofs themselves. (I) [static-ct-api](https://github.com/C2SP/C2SP/blob/main/static-ct-api.md)
- Old-style logs were costly and fragile: 5 to 10 terabytes each, with several incidents. (M, operator's figures) [Let's Encrypt, 2024](https://github.com/letsencrypt/website/blob/main/content/en/post/2024-03-14-introducing-sunlight.md)
- It has worked. Outside readers of logs found mis-issued Symantec certificates in 2015 and 2017. (M) [Google, 2015](https://security.googleblog.com/2015/09/improved-digital-certificate-security.html)†, [Mozilla wiki](https://wiki.mozilla.org/CA:Symantec_Issues)†
- Logs fail too. One flipped bit ended the Yeti 2022 log in 2021. An outside monitor found it. (M) [How CT logs fail](https://www.agwa.name/blog/post/how_ct_logs_fail)†
- Third-party monitors are incomplete. A 2019 study of five monitors found none returned every certificate for a domain. (M) [Li et al., CCS 2019](https://dl.acm.org/doi/pdf/10.1145/3319535.3345653)†
- A widely used monitor still lists gossip between monitors as future work. (M) [Cert Spotter](https://github.com/SSLMate/certspotter)
- No measurement was found of how many domain owners watch the logs at all.

**Sigstore's Rekor.**

- The client checks an inclusion proof against a signed checkpoint, offline. (I) [Sigstore client spec](https://github.com/sigstore/architecture-docs/blob/main/client-spec.md)
- Noticing misuse is left to the owner: users "are responsible for monitoring the log" for their own identity. (I) [Sigstore security model](https://github.com/sigstore/docs/blob/main/content/en/about/security.md)
- The monitoring tool is opt-in and starts from "now". It does not look back. (M) [rekor-monitor](https://github.com/sigstore/rekor-monitor)
- Rekor version 2 launched without witnesses and no longer serves proofs on request. (I) [rekor-tiles CLIENTS.md](https://github.com/sigstore/rekor-tiles/blob/main/CLIENTS.md)

**Key transparency.**

- CONIKS (2015) made each person's device watch its own entry, to avoid needing global monitors. (I) [Melara et al.](https://www.usenix.org/conference/usenixsecurity15/technical-sessions/presentation/melara)†
- WhatsApp's library splits the work. Devices check look-ups. An auditor checks the directory only grows. Making sure all devices see the same directory is "outside of the scope of this library". (I) [facebook/akd](https://github.com/facebook/akd/blob/main/akd/src/lib.rs)
- Cloudflare is the named outside auditor for WhatsApp. That is one auditor. (I) [cloudflare/plexi](https://github.com/cloudflare/plexi)
- Apple's Contact Key Verification has a person's devices compare views automatically. Manual code comparison stays for the human. (I) [Apple, 2023](https://security.apple.com/blog/imessage-contact-key-verification/)†
- The IETF design keeps one job for the person: judging whether a key change was really theirs. (I) [KEYTRANS architecture](https://github.com/ietf-wg-keytrans/draft-arch/blob/main/draft-ietf-keytrans-architecture.md)

**Witnesses.**

- A witness co-signs a checkpoint only if it is consistent with the last one it saw. Readers then demand a quorum of co-signatures. (I) [tlog-witness](https://github.com/C2SP/C2SP/blob/main/tlog-witness.md), [tlog-cosignature](https://github.com/C2SP/C2SP/blob/main/tlog-cosignature.md)
- The public witness network had no production tier when read: 13 witnesses, all staging or testing. (M, snapshot) [witness tables](https://github.com/transparency-dev/witness-network/blob/main/site/content/witness-tables.md)

**What a reader must check, and what is left to others.** The reader's own software checks signatures and proofs. Reading everything is left to monitors. Noticing a wrong entry is left to the owner of the name. Catching a split view is left to gossip that was never built, to one company's sampling, to one auditor, or to witnesses that are not yet in production.

**For DubWeb:** (suggestion)

- "Each edition begins with the last one, unchanged" is a consistency proof a person can do with two text files. Keep it that plain. The client should keep the last edition it saw and compare by itself, every time.
- The split view is the open hole: a keeper could show two different "edition 7"s. The place and the second keeper are witnesses in all but name. Say so. A reader should be able to fetch an edition's fingerprint from the keeper and from the place and see that they match.
- Two different editions with the same number, both signed, are proof of misbehaviour. Make that easy to show to others.
- Name who is expected to read every line. CT assumed monitors would appear. Where they did not, nothing was checked.
- Any watching tool should look back to the first edition, not start from "now".

## 2. Timestamping and anchoring

**RFC 3161 time-stamp authorities (TSAs).**

- A token is evidence that data "existed before a particular time". That is an upper bound only. (I) [RFC 3161 §1](https://raw.githubusercontent.com/mcpherrinm/rfc-mirror/main/rfc3161.txt)
- The trust sits in the authority's clock and key. A policy baseline is one second of accuracy. (I) [RFC 3628](https://raw.githubusercontent.com/mcpherrinm/rfc-mirror/main/rfc3628.txt)
- If the authority's key is compromised, no token from that key can be trusted, genuine old ones included. The RFC names backdating as the risk and a second authority as one remedy. (I) [RFC 3161 §4](https://raw.githubusercontent.com/mcpherrinm/rfc-mirror/main/rfc3161.txt)
- Timestamps age. Keys expire and hash methods weaken, so old stamps must be stamped again before they fail. (I) [RFC 4998 §1](https://raw.githubusercontent.com/mcpherrinm/rfc-mirror/main/rfc4998.txt)
- RFC 4998 recommends at least two records from different authorities. (I) [RFC 4998 §7](https://raw.githubusercontent.com/mcpherrinm/rfc-mirror/main/rfc4998.txt)
- Clocks do slip. One commercial authority reports about 7.5 hours of possibly inaccurate stamps in 2012. (M) [DigiStamp incident reports](https://www.digistamp.com/about-us/tsa-incident-reports)†
- Signers do backdate. In 2023, tools were found forging signature dates on Windows drivers to slip under an old-date exception. (M) [Cisco Talos](https://blog.talosintelligence.com/old-certificate-new-signature/)†
- Sigstore added outside authorities because its log's own clock was "not externally verifiable". (I) [Sigstore, Trusted Time](https://raw.githubusercontent.com/sigstore/sigstore-blog/main/content/trusted-time.md)

**Linked timestamps and OpenTimestamps.**

- The older idea: hash a batch, chain it to the last one, publish the hash widely, such as in a newspaper. (I) [Bitcoin paper §3](https://raw.githubusercontent.com/karask/satoshi-paper/master/bitcoin.md); history of Haber, Stornetta and Surety (M) [Wikipedia](https://en.wikipedia.org/wiki/Stuart_Haber)†
- OpenTimestamps says the same thing about itself: a timestamp proves data "existed prior to some point in time". (I) [opentimestamps.org source](https://raw.githubusercontent.com/opentimestamps/opentimestamps.org/master/index.html)
- A fresh proof is only a calendar server's promise. It becomes checkable alone after the blockchain confirms it, which takes "a few hours". (I) [client README](https://raw.githubusercontent.com/opentimestamps/opentimestamps-client/master/README.md)
- If the calendar loses its part before the proof is completed, the proof cannot be checked. (I) [git integration notes](https://raw.githubusercontent.com/opentimestamps/opentimestamps-client/master/doc/git-integration.md)
- The time shown is the block's own time field, printed as a date with no clock time. (M, code) [notary.py](https://raw.githubusercontent.com/opentimestamps/python-opentimestamps/master/opentimestamps/core/notary.py), [cmds.py](https://raw.githubusercontent.com/opentimestamps/opentimestamps-client/master/otsclient/cmds.py)
- Bitcoin block times are loose. A block may be dated up to two hours ahead, and may be dated earlier than the block before it. (M, consensus code) [chain.h](https://raw.githubusercontent.com/bitcoin/bitcoin/master/src/chain.h); (A) [BIP 113](https://raw.githubusercontent.com/bitcoin/bips/master/bip-0113.mediawiki)
- Chains can reorganise. It happened in March 2013. The reference calendar waits six confirmations. (M) [BIP 50](https://raw.githubusercontent.com/bitcoin/bips/master/bip-0050.mediawiki), [otsd defaults](https://raw.githubusercontent.com/opentimestamps/opentimestamps-server/master/otsd)
- Checking later needs the chain, the proof path and the data. An anchor alone proves nothing to a reader who lacks the path and the leaf. (M, tool requirement) [client README](https://raw.githubusercontent.com/opentimestamps/opentimestamps-client/master/README.md)

**"Existed by" and "not before".**

- To prove "not before", put a fresh value nobody could predict inside the signed text. A signature over a fresh random value proves it was made after that value. (I) [Roughtime draft](https://raw.githubusercontent.com/ietf-wg-ntp/draft-roughtime/master/draft-ietf-ntp-roughtime.md), [Peter Todd, 2017](https://gist.github.com/petertodd/e640b09dcab14a3014d2968a58c58659)
- In practice: Qubes OS notices embed news headlines and a recent Bitcoin block hash as "proof of freshness". (M, practice since 2015) [Qubes canary template](https://raw.githubusercontent.com/QubesOS/qubes-secpack/main/canaries/canary-template.txt)
- Public randomness services exist for this. (I) [drand](https://raw.githubusercontent.com/drand/drand/master/README.md)

**Two references, and disagreement.**

- RFC 3161: two stamps can be put in order only if they differ by more than their stated accuracies added together. (I) [RFC 3161 §2.4.2](https://raw.githubusercontent.com/mcpherrinm/rfc-mirror/main/rfc3161.txt)
- Sigstore: where both a log time and an authority time exist, the check runs at each. "If either fails, verification fails." No averaging. (I and M, code) [client spec](https://raw.githubusercontent.com/sigstore/architecture-docs/main/client-spec.md), [sigstore-go](https://raw.githubusercontent.com/sigstore/sigstore-go/main/pkg/verify/signed_entity.go)
- Roughtime: ask at least three servers in a chain. Answers that cannot be put in a consistent order are proof that one lied, and are reported. (I, draft) [Roughtime draft](https://raw.githubusercontent.com/ietf-wg-ntp/draft-roughtime/master/draft-ietf-ntp-roughtime.md)
- None of the RFCs read says more about two authorities that disagree than the ordering rule above.

**For DubWeb:** (suggestion)

- Say "existed by" in the reader's words: "recorded no later than this date". Never "made at".
- Show dates, not minutes, for anything resting on a blockchain. The chain's own clock is loose by hours.
- If "not before" matters for an edition, put a recent block hash in its first line. Then the edition is boxed between two public events.
- With two references, each gives its own "no later than". Show the earlier one as the answer and keep both. Where they contradict on order by more than their stated looseness, show both and say so. That is a finding about a witness.
- Keep every proof with the act it proves. A pending proof depends on a server staying alive. Complete it and store it.
- Plan for old proofs to age. Stamping again later is ordinary upkeep.

## 3. Open finances in practice

**Open Collective.**

- Every group has a public budget of money in and out. The ledger is add-only. (I) [budgets](https://documentation.opencollective.com/collectives/managing-money/budgets)†, [ledger](https://documentation.opencollective.com/advanced/ledger)†
- Public expense pages show amount and description. Receipts, payment details and addresses are hidden. (M, page text) [example expense](https://opencollective.com/stashapp/expenses/297114)†
- "Incognito" gifts show the amount and hide the name. (I) [contributing](https://documentation.opencollective.com/giving-to-collectives/contributing)†
- What administrators can see of incognito givers changed in 2021, and the documentation still conflicts. (M) [2021 update](https://opencollective.com/opencollective/updates/removing-identifying-information-from-incognito-contributions)†
- A host can close. Open Collective Foundation announced its end on 28 February 2024. Over 600 groups had to spend down, move or hand over funds by 30 September 2024. Then all were frozen. (M) [announcement](https://opencollective.com/foundation/updates/announcement-we-are-dissolving-open-collective-foundation-at-the-end-of-this-year)†, [timeline](https://blog.opencollective.com/open-collective-official-statement-ocf-dissolution/)†
- No data was found on how many people view these public ledgers.

**Do people read open books?**

- UK councils published all spending over £500 from 2010, to "unleash an army of armchair auditors". (I) [gov.uk](https://gov.uk/government/news/armchair-auditors-pore-over-council-spending-data)†
- The army did not come. One researcher reported about 200 views a month. A parliamentary committee found "no evidence" it had happened. (M) [Worthy](https://www.inkl.com/news/open-data-on-council-spending-is-largely-unread-by-voters)†, [Worthy 2015, abstract](https://zendy.io/title/10.1111/padm.12166)†, [committee, via trade press](https://ukauthority.com/articles/councils-still-obscuring-data-from-armchair-auditors/)†
- Most open datasets are rarely viewed or downloaded. (M) [six-portal study](https://mdpi.com/2220-9964/10/1/30)†
- Disclosure works when the information enters a routine choice the reader already makes. Much of it is incomplete or incomprehensible. (M, eighteen cases; and I) [Fung, Graham and Weil](https://www.hks.harvard.edu/publications/full-disclosure-perils-and-promise-transparency)†
- A review of 16 experiments found mixed results. It worked better where information was understandable and mattered to people. (M) [Kosack and Fung, 2014](https://www.hks.harvard.edu/publications/does-transparency-improve-governance)†
- It can work strongly. In Uganda, schools got 13% of a grant on average. After monthly transfers were printed in newspapers, the share lost fell from 80% to under 20%. (M) [Reinikka and Svensson](https://ideas.repec.org/a/oup/qjecon/v119y2004i2p679-705..html)†
- A critic accepts the fall but says wider reforms share the credit. (M, re-analysis) [Hubbard, 2007](https://www.cgdev.org/sites/default/files/15050_file_Uganda.pdf)†
- Raw data is mostly read by go-betweens: journalists and watchdog groups. (M, qualitative) [Baack, 2015](https://journals.sagepub.com/doi/10.1177/2053951715594634)†
- Opaque openness does not show how a body really behaves. Answering questions is "soft" accountability. Consequences make it "hard". (A) [Fox, 2007](https://gsdrc.org/document-library/the-uncertain-relationship-between-transparency-and-accountability/)†

**Participatory budgets.**

- Porto Alegre began in 1989 and grew to about 40,000 participants a year by 1999. It was suspended in 2017 after a change of government. (M) [WRI](https://www.wri.org/research/porto-alegre-participatory-budgeting-and-challenge-sustaining-transformative-change)†
- Brazilian cities using it spent more on health and sanitation and saw lower infant mortality. (M) [Gonçalves, 2014](https://ideas.repec.org/a/eee/wdevel/v53y2014icp94-110.html)†, [Touchton and Wampler, 2014](https://scholarworks.boisestate.edu/polsci_facpubs/146/)†
- Turnout is small. New York: about 103,000 voters in 2016–17, near 1 in 100 residents by this session's arithmetic. Paris: about 6 to 7 in 100. (M) [NYC Council](https://council.nyc.gov/labs/2017/05/09/participatory-budgeting-visualizing-the-results-cycle-6/)†, [Paris](https://www.paris.fr/pages/plus-de-200-000-votants-au-budget-participatif-6141)†

**Charities and how figures are misread.**

- About 35 in 100 wealthy US donors did any research before giving. About 3 in 100 compared charities. (M, 2010 survey; secondary sources vary) [Money for Good](https://www.philanthropy.com/article/donors-value-charity-research-but-few-seek-it-out-report-finds/)†
- Readers fix on the wrong number. Telling donors that overhead was already covered raised the giving rate by 80%. (M, field experiment, 40,000 people) [Gneezy et al., Science 2014](https://ui.adsabs.harvard.edu/abs/2014Sci...346..632G)†
- Seen alone, people prefer low overhead. Seen side by side, they prefer results. Overhead is simply easier to judge. (M) [Caviola et al., 2014](https://pmc.ncbi.nlm.nih.gov/articles/PMC4179876)†
- Charities with a transparency seal received 53% more the next year. This is a link, not proof of cause. (M) [Harris and Neely, via Candid](https://candid.org/post/research-shows-nonprofit-transparency-matters/)†
- GiveWell keeps a public page of its own mistakes. (I) [GiveWell](https://www.givewell.org/node/1681)†

**Triple-entry accounting.**

- The idea: one signed receipt, held identically by payer, payee and a third party. (I) [Grigg, 2005](https://www.iang.org/papers/triple_entry.html)†
- The term has two unrelated meanings, and real use is scarce. (M, reviews) [Ibañez et al.](https://arxiv.org/abs/2101.02632)†, [Cai, 2021](https://researchers.mq.edu.au/en/publications/tripleentry-accounting-with-blockchain-how-far-have-we-come/)†
- A shared signed record does not make the outside fact true. (A) [critique](https://arxiv.org/pdf/2412.20447v1)†

**Privacy for givers.**

- Courts have protected member and donor lists because disclosure brought reprisals. (M, court findings) [NAACP v. Alabama](https://www.law.cornell.edu/constitution-conan/amendment-1/disclosure-of-membership-lists)†, [AFP v. Bonta](https://supreme.justia.com/cases/federal/us/594/19-251)†
- Exposed donors have been harassed: a 2022 leak of about 90,000 donors, and maps of Proposition 8 donors in 2008–09. (M, incidents) [Have I Been Pwned](https://haveibeenpwned.com/Breach/GiveSendGo)†, [NPR](https://www.npr.org/transcripts/101460517)†
- Hiding the name is not enough. In card records of 1.1 million people, four place-and-time points singled out 90%. Knowing the price raised the risk by 22%. (M) [de Montjoye et al., Science 2015](https://dspace.mit.edu/handle/1721.1/130329?show=full)†

**What a preimage proves.**

- A Lightning invoice names a hash. The preimage is the secret behind it, and is "proof of payment". (I) [BOLT 11](https://github.com/lightning/bolts/blob/master/11-payment-encoding.md)
- The spec defines it as proof that payment "has been received", held by the recipient. (I) [BOLT 0](https://github.com/lightning/bolts/blob/master/00-introduction.md)
- Alone it does not show who paid. It is the invoice's signature that ties the payment to a payee. (M, protocol property) [bLIP 3](https://github.com/lightning/blips/blob/master/blip-0003.md)

**For DubWeb:** (suggestion)

- Expect almost nobody to read the raw book. Put three plain lines at the top of every edition: total in, total out, what is left. The raw lines are for the few, and for go-betweens.
- Show the book where a choice is made: beside the button to give, and beside any vote on spending.
- Say what each line proves. A preimage proves that invoice was paid by someone. To mean anything, the "out" line needs the invoice too, and a few words on what it was for. The invoice names the payee, so decide what payees are told before they are paid.
- Lead with purpose, not ratios. Readers seize on the easiest number.
- "Amount only" does not make a giver anonymous in a small group. Exact amounts and exact times are fingerprints. Consider rounded times or batched lines, and tell givers plainly what can be inferred. This touches the rule "every payment in", so it is an open question below.
- Give the reader someone to ask. Publishing is the soft half. An answer, and a consequence, are the hard half.

## 4. Proof of reserves and liabilities

**How it works.**

- Proof of solvency is two proofs: what is owed to customers, and control of at least that much. (I) [Buterin, 2022](https://raw.githubusercontent.com/vbuterin/blog/master/posts/proof_of_solvency.md)
- Each customer is a leaf: a salted hash and a balance. Each branch carries the sum below it. The top is the total owed. Only the top is public. Each customer gets their own branch. (I) [proof-of-liabilities](https://raw.githubusercontent.com/olalonde/proof-of-liabilities/master/README.md)
- Assets are shown by signing with the keys of the exchange's addresses. (I) [proof-of-assets](https://raw.githubusercontent.com/olalonde/proof-of-assets/master/README.md)
- First done by Kraken in 2014. (M) [CoinDesk](https://coindesk.com/krakens-audit-proves-holds-100-bitcoins-reserve/)†

**Known limits.**

- It works only if customers check. An exchange can leave out accounts it expects will not look. (A) [Buterin](https://raw.githubusercontent.com/vbuterin/blog/master/posts/proof_of_solvency.md), [2014 spec](https://raw.githubusercontent.com/olalonde/proof-of-solvency/master/README.md)
- In theory few checkers suffice, if the exchange cannot guess who they are. But handing out proofs on request tells it exactly who checks. (A) [Summa, part 2](https://raw.githubusercontent.com/privacy-scaling-explorations/pse.dev/main/content/articles/from-cex-to-ccex-with-summa-part-2.md)
- **No exchange was found to publish how many customers actually check.** No user study of the checking was found either. This absence is a finding.
- A customer who finds a bad proof cannot easily prove it to others. (A) [Summa, part 2](https://raw.githubusercontent.com/privacy-scaling-explorations/pse.dev/main/content/articles/from-cex-to-ccex-with-summa-part-2.md)
- The original tree could understate the total. Later designs changed because of it. (A) [Hu, Zhang and Guo](https://eprint.iacr.org/2018/1139)†; (M) [BitMEX README](https://raw.githubusercontent.com/BitMEX/proof-of-reserves-liabilities/master/README.md)
- Real deployments had weak hashing and cut-short hashes. (M, survey) [Chalkias et al., 2022](https://eprint.iacr.org/2022/043)†
- It is a snapshot. Assets can be borrowed for the day. (A) [Summa, part 2](https://raw.githubusercontent.com/privacy-scaling-explorations/pse.dev/main/content/articles/from-cex-to-ccex-with-summa-part-2.md). One 2022 transfer of 320,000 ETH between exchanges raised that suspicion. It was not proven. (M, incident) [Cointelegraph](https://cointelegraph.com/news/crypto-com-accidentally-sends-320k-eth-to-gate-io-recovers-funds-days-after)†
- Control of keys is not ownership. Someone else may hold the coins. Debts off the chain are invisible. (A) [Bitcoin Optech](https://raw.githubusercontent.com/bitcoinops/bitcoinops.github.io/master/_topics/en/proof-of-reserves.md)
- It warns. It prevents nothing. (I, stated limit) [2014 spec](https://raw.githubusercontent.com/olalonde/proof-of-solvency/master/README.md)
- Fake accounts with negative balances can shrink the total. (A) [Buterin](https://raw.githubusercontent.com/vbuterin/blog/master/posts/proof_of_solvency.md). A later flaw of this family is documented in Binance's own code. (M) [Binance](https://raw.githubusercontent.com/binance/zkmerkle-proof-of-solvency/main/docs/updated_proof_of_solvency_to_mitigate_dummy_user_attack.md)
- Accountants stepped back. Mazars paused this work in December 2022. Its reports were not audits. US regulators told investors to be wary. (M) [CNBC](https://www.cnbc.com/2022/12/16/mazars-suspends-all-work-with-crypto-clients-including-binance-cryptocom.html)†, [PCAOB advisory](https://pcaobus.org/resources/information-for-investors/investor-advisories/investor-advisory-exercise-caution-with-third-party-verification-proof-of-reserve-reports)†
- The plain tree leaks a neighbour's balance and the total. (A) [Summa, part 1](https://raw.githubusercontent.com/privacy-scaling-explorations/pse.dev/main/content/articles/from-cex-to-ccex-with-summa-part-1.md)
- Checking is hard. One exchange's method needs your own Bitcoin node and 30 minutes or more. Another has six steps with files and a command line. (M, documented steps) [BitMEX](https://raw.githubusercontent.com/BitMEX/proof-of-reserves-liabilities/master/README.md), [OKX](https://raw.githubusercontent.com/okx/proof-of-reserves/main/README.md)
- A "verify" button supplied by the exchange defeats the purpose. (A) [Summa, part 2](https://raw.githubusercontent.com/privacy-scaling-explorations/pse.dev/main/content/articles/from-cex-to-ccex-with-summa-part-2.md)
- Customer pressure faded. A team building better tools found "limited demand" and stopped. (M, field observation) [Summa retrospective](https://raw.githubusercontent.com/privacy-scaling-explorations/pse.dev/main/content/articles/retrospective-summa.md)

**For DubWeb:** (suggestion)

- Open books are stronger than a Merkle sum in one way. Every line is public, so anyone can add them up.
- They share the main weakness. Only a giver can tell that their own gift is missing. Give each giver an easy way to find their own line. One candidate: publish each incoming payment's hash, which the giver's own wallet also holds. Whether that hash leaks anything about the giver must be checked first.
- Say what the book cannot show: money that arrived by a path the book never lists, debts, and whether what is left is still there. The book proves flows. It does not prove a balance.
- The checking tool must not come only from the keeper. A second client, or steps a person can do by hand, is what makes it a check.
- Count the checkers. If givers can confirm their own line with one act, publish how many did. No exchange does.
- Make a complaint provable: a signed receipt for the giver at payment time, so a missing line can be shown to others.

## 5. Leaving a server

**Mastodon.**

- A move carries followers. It does not carry posts. Follows, blocks and bookmarks go by hand as files. After a move there is a 30-day wait. (I) [Mastodon docs, moving](https://raw.githubusercontent.com/mastodon/documentation/main/content/en/user/moving.md)
- The move is started from the old account, so the old server must still be working. (I; the last part is this session's inference) [same page](https://raw.githubusercontent.com/mastodon/documentation/main/content/en/user/moving.md)
- Listed servers promise three months' notice of closing. Nothing enforces it. (I) [Server Covenant](https://joinmastodon.org/covenant)†
- Closures with notice: mastodon.technology (2022), mastodon.lol (2023, about 16,000 active users), mozilla.social (2024). (M) [mastodon.technology](https://ashfurrow.com/blog/mastodon-technology-shutdown/)†, [mastodon.lol](https://wiki.archiveteam.org/index.php/Mastodon)†, [mozilla.social](https://techcrunch.com/2024/09/17/mozilla-exits-the-fediverse-and-will-shutter-its-mastodon-server-in-december)†
- Closure without notice: queer.af lost its domain name in February 2024 and vanished at once. (M) [404 Media](https://www.404media.co/taliban-shuts-down-queer-af-domain-breaking-mastodon-instance)†
- About 14% of users could not reach their server for a whole day at least once in a 15-month study. (M) [Raman et al., 2019](https://arxiv.org/pdf/1909.05801)†
- Few people ever move. Of 136,009 tracked users, 4.09% ever switched server. (M) ["Flocking to Mastodon", 2023](https://arxiv.org/pdf/2302.14294)†
- A proposal to carry posts between servers still needs the old one alive: "An offline server cannot participate". (I, draft) [LOLA](https://raw.githubusercontent.com/swicg/activitypub-data-portability/main/lola.html)

**Bluesky / AT Protocol.**

- A move carries the signed record of posts, the media and private settings. (I) [migration guide](https://raw.githubusercontent.com/bluesky-social/atproto-website/main/src/app/%5Blocale%5D/guides/account-migration/en.mdx)
- The official guide warns that a person "could be permanently locked out", and advises non-experts not to move their main account. (I) [PDS migration notes](https://raw.githubusercontent.com/bluesky-social/pds/main/ACCOUNT_MIGRATION.md)
- If the old server is gone or hostile, the person needs a rotation key they already hold, and a copy of their record. Without the copy, old content is missing. (I) [migration guide](https://raw.githubusercontent.com/bluesky-social/atproto-website/main/src/app/%5Blocale%5D/guides/account-migration/en.mdx)
- A higher-ranked key can undo a lower key's change for 72 hours. (I) [did:plc spec](https://raw.githubusercontent.com/did-method-plc/did-method-plc/main/website/spec/v0.1/did-plc.md)
- Identity rests on one central directory. An independent body was founded in 2026 to steward it. (M) [did-method-plc](https://github.com/did-method-plc/did-method-plc)
- Moving back to the main server was impossible until September 2025. (M) [Bluesky, 2025](https://raw.githubusercontent.com/bluesky-social/bsky-docs/main/blog/2025-09-26-incoming-migration.md)
- Well under 1 account in 100 sits on an independent server, by third-party counts. (M, undated snapshot) [PDS directory](https://blue.mackuba.eu/directory/pdses)†
- No case was found of an independent server closing with people stranded. The hard path looks untested at scale.

**Nostr.**

- A person publishes a short list of relays they write to and read from. Advice: two to four of each. To find someone's posts, look on their write relays. (I) [NIP-65](https://github.com/nostr-protocol/nips/blob/master/65.md)
- There is no standard for changing or recovering a key. The proposal has been open since October 2023. Lose the key and the identity is gone. (M) [NIP pull request 829](https://github.com/nostr-protocol/nips/pull/829)
- Posts are widely copied: 93% sat on more than one relay. With the top 30 relays down, over 90% stayed reachable. (M) [Wei and Tyson, 2024](https://arxiv.org/abs/2402.05709)†
- 95% of free relays could not cover their costs. (M) [same study](https://arxiv.org/html/2402.05709v2)†
- No figure was found for how many people publish a relay list.

**Solid pods.**

- No standard way to move a pod. The request has been open since 2019, and an older one since 2016. (M) [issue 88](https://github.com/solid/specification/issues/88), [issue 285](https://github.com/solid/specification/issues/285)
- A person's identity is usually an address on the provider's domain. When solid.community closed in 2020, every address changed and stored links broke. (M) [W3C list](https://lists.w3.org/Archives/Public/public-solid/2020Oct/0020.html)†

**Law.**

- GDPR Article 20 gives a right to receive data one has provided, in a machine-readable form, and to have it sent direct "where technically feasible". (I) [Article 20](https://gdpr-info.eu/art-20-gdpr/)†
- In practice: of 182 services, 28.6% met all the requirements, and 76.8% offered no way to import. (M; figures via a secondary source) [Syrmoudis et al., 2021](https://www.petsymposium.org/popets/2021/popets-2021-0051.php)†
- Of 230 real requests, about three in four were completed, in varied formats. (M) [Wong and Henderson, 2019](https://core.ac.uk/download/444077811.pdf)†
- Export without import changes little. No direct count of re-use was found.

**Comparisons.**

- Phone number portability lowered prices by 7.6% on average, and helped only where moving took five days or less. (M) [Cho et al.](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2032287)†, [Lyons](https://www.tcd.ie/Economics/TEP/2006_papers/TEP9.pdf)†
- Matrix has proposed portable accounts since 2020. It has not shipped. (M) [MSC2787](https://github.com/matrix-org/matrix-spec-proposals/pull/2787)

**What breaks for ordinary people.** The name others know them by. Their history. Links that pointed at the old place. Private messages. And time: the move must be made while the old server still answers, by a person who may not know it is closing.

**For DubWeb:** (suggestion)

- MOR starts ahead. Identity is a key, and every act is signed, so a copy held anywhere proves itself. The round showed people can move. The lessons are about making it ordinary.
- Keep a second copy from the first day, not from the day of closing. Sudden loss is the case that hurts. The client should hold, or send to a second home, every act as it is made.
- A home that closes should say so in a signed act: the date, and a period when it still serves but accepts nothing new. The client should show it and offer the move in one step.
- Rehearse the hostile case: a home that vanishes with no notice. If the way out needs the old home's help, it is not a way out.
- Speed decides whether people use it. Aim for minutes.
- Recovery of a lost key is the gap in the nearest systems. Whatever MOR's rotation rules give, the client should press people to set it up before they need it.
- Tell the person what did not move. Mastodon says it plainly. That honesty is worth copying.
- Count, in each round, how many moved, how long it took and what was lost. The studies above had to infer this from outside.

## What a reader should be able to check unaided

Of open books:

1. That this edition begins with the last one they saw, unchanged.
2. That the lines add up to the totals at the top.
3. That their own gift is in it.
4. That an "out" line's preimage matches its invoice, and for how much.
5. That the edition they see is the one others see: the same fingerprint from the keeper and from the place.
6. The date by which each edition existed, and which witness says so.
7. What the book does not show.

Of a record:

1. Who signed each act, and that the signature holds.
2. The order of acts, and that none is missing between two they hold.
3. "No later than" for an act, from each witness separately, with any clash shown.
4. That a proof still stands without the server that issued it.
5. Where the identity's acts are kept now, and where the second copy is.
6. That a move was signed by the identity itself, not only announced by a home.

"Unaided" should mean: with a client the keeper did not supply, or by hand.

## Open questions

1. Who reads every line? Name the monitor, or accept that there is none.
2. When the two time references disagree, what does the reader see, and does anything follow for the witness that was wrong?
3. Should an edition carry a recent block hash, to give "not before" as well as "existed by"?
4. Does "every payment in, amount only" protect givers in a small group? Would rounded times or batched lines break the rule that every payment is listed?
5. May the keeper publish a payee's invoice without the payee's agreement? What does an "out" line prove without it?
6. Can a giver find their own line without the keeper's help, and can they prove it is missing?
7. Which blockchain's clock do the anchors rest on, and how loose is it? This session assumed looseness of hours.
8. Who keeps the inclusion proofs when the second keeper closes?
9. What did not move when homes closed in the round? Private messages, links, anything else?
10. What happens to open books when their keeper's home closes mid-edition?
11. How many people checked anything in the round? No comparable system publishes this number. DubWeb could be the first.

## Limits of this research

- Only GitHub could be opened from this session. Every link marked † rests on search excerpts. That covers nearly all academic numbers, all news incidents, the Open Collective pages and the legal texts.
- Gaps, searched for and not found: how many domain owners watch CT logs; how many exchange customers check their leaf; any user study of that checking; how many people view Open Collective ledgers; how many Mastodon servers die each year; how many Nostr users publish a relay list; any independent Bluesky server closing with people stranded.
- The "For DubWeb" paragraphs rest on the brief's description of the round. They were not checked against the MIRs. Where one touches a rule, the rule decides, and the question goes to Nobody, allegedly.
