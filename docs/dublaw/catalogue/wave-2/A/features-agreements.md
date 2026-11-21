# DubLaw W2-A: the players' apps, Agreements side

*Author: Nobody, allegedly. DubLaw wave 2, session W2-A, 21 November 2026, read-only over `_research`. Nobody, allegedly, decides. Every count below comes from `scan-apps.mjs` (beside this file) and is in `apps-inventory.json`. Each finding says its ground: **counted** (by the script), **traced** (acts cited in order) or **inferred** (my reading). The proposals are my reading.*

## 1. Summary

- The round published 130 media hashes, plus 15 programs as text acts; 26 media are held in `_research`, 103 are not (list in section 3). Counted.
- In the trays, only Edubba covers agreements, and the only act it signs is an assent. Dubsar's desk and collective clients run the older grammar (draft 17), not draft 25. Traced.
- 12 features from players' apps do agreements work that no Dubsar tray app does, or does less well. The strongest five are lending (shelf), delivery receipts (kept.mjs), claims without Terms (register), evidence bundles (Pointer Cite) and the buyer's pre-payment verdict (Pointer Look).
- Most of those apps come from day five's prompt to build outside sales, so their use is small: 2 to 19 acts each. Counted, with that caveat.
- My proposal: Edubba reads Statements of a kind it knows by spec, with lending, receipts and claims first; an evidence bundle goes into Edubba for the arbiter. The buyer's one-command flow is a DubLaw/DubPay seam. My reading.
- Nothing in the round used DubLaw's award cMIP: acts under it, 0 acts by 0 signers; Terms naming it, 0 acts by 0 signers. No players' app signs contests, counter signatures or resolves: the kit did. Counted.
- Five questions go to the MOR lead (section 5).

## 2. Inventory

**How it was built** (counted): the postman's log of every letter carried (`postman/log/carried.jsonl`: each `POST /media` with its SHA-256 and size, each `GET /media/HASH`); every act in every feed, in dubsar's database before closure and in every window's `acts/` (17169 distinct acts, 2919 text acts); every report line naming a hash (7273 lines); every `build/` folder. A media hash's name, version and author come from the first act announcing it that carries the name (preferring an act the uploading window kept), or from a report line naming the hash; the script records which (`name_ground`). Bytes are "held" where a file in `_research` has that SHA-256. Programs posted as text acts are held in the act itself.

**Columns:** "Author identity" is the signer of the announcing act (the full id is in the JSON); "not traced" means no announcing act was found. "Kind" separates programs (app, script) from data, the words behind a Terms fingerprint, and unknown. One hash asked for as media (`419d829d…`) is a Terms act id, not media; it is left out of the table and kept in the JSON.

| # | Name | Version | Kind | Author identity | Media hash (or act) | Bytes | Published at | Uploaded by window | Bytes held in _research |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Dub for trays (Dubsar) | 0.1.0 | app | b1895259…0366 | `ec035b45f5fd45ae304a10fa3c85f2b70b1a083af306e429e8368a16e49dc571` | 14062 | dubsar, turnstile-home | hosts | feeds/dubsar-before-closure/media/ec035b45f5fd45ae304a10fa3c85f2b70b1a083af306e429e8368a16e49dc571 |
| 2 | Pointer Look | 0.1 | app | 84ae1e82…095c | `46098770fb158cfc4c28910acffc4bdced3a8a9024bb9dcc92398e5561f80b5b` | 6002 | turnstile-home, longhouse-home-1 | pointer | no |
| 3 | Edubba (tray) (Dubsar) | 1 | app | 218a2a93…82dd | `eaa8ad33e51fc4715b12a26b3144c3026141017bf1725d0f21df5388b7e4a619` | 10489 | turnstile-home, longhouse-home-1, longhouse-home-2 | dublaw, longhouse | no |
| 4 | Ummia for trays (Dubsar) | 0.1.0 | app | 762c0b4c…7f8b | `2ca2110ffbec9a6c2066cb8daea5a9b337b7fdc76a79f274a637d7d12f355766` | 12282 | turnstile-home, dubsar, longhouse-home-1 | dubweb | feeds/dubsar-before-closure/media/2ca2110ffbec9a6c2066cb8daea5a9b337b7fdc76a79f274a637d7d12f355766 |
| 5 | Damgar (Dubsar) | 0.1.0 | app | 880d33f2…a02f | `2e9de3d4b92f145ff5823681c07810084ebadd01997d78a551f58302a4884a7b` | 7881 | turnstile-home, longhouse-home-1, dubsar | dubpay | feeds/dubsar-before-closure/media/2e9de3d4b92f145ff5823681c07810084ebadd01997d78a551f58302a4884a7b |
| 6 | Pointer Look | 0.1.1 | app | 84ae1e82…095c | `2b1864f35aa184ab6efacf356cd3ce574af018b2a5e081fe312560b3ab005119` | 6751 | turnstile-home, longhouse-home-1 | pointer | no |
| 7 | turnstile-move | 1 | app | 11e77c4b…19c0 | `3e0a460add1332e89322aac4121296d704c2d8e9d3c14d9ff2356d93d4de3ebb` | 4405 | turnstile-home, longhouse-home-1 | turnstile | no |
| 8 | Dub for trays (Dubsar) | 0.2.0 | app | 762c0b4c…7f8b | `dd61e1e030bf11677e80e5b17c3942a78295278712a0fc6fd6911ae5c25082f0` | 16222 | turnstile-home, dubsar, longhouse-home-1 | dubweb | feeds/dubsar-before-closure/media/dd61e1e030bf11677e80e5b17c3942a78295278712a0fc6fd6911ae5c25082f0 |
| 9 | Fennec | 0.1 | app | aedf7128…0a01 | `ec550443ce09fb0e9cf8beb487f48f54d6a95829e3152dee594220285fd5917c` | 2797 | turnstile-home | public-prosumers | no |
| 10 | Courier | 0.1 | app | cbccc51a…7920 | `9b6c2f609864c0f4a8ae668a334d39edccd1628385db3ea095e528efa338f482` | 2283 | turnstile-home | public-prosumers | no |
| 11 | Buy | 0.1 | app | 60f1db04…56ed | `1b2f1ea251aa49e61b18b228df4b5f459b6e72ad755910a942fbcdc694bcbc25` | 1861 | turnstile-home | public-prosumers | no |
| 12 | Shower Pro (hostile) | ? | app | not traced | `0221126a2d1a3556abf605050f67aa198e7a5614bd6b2911442918a0948dbc1b` | 449 | turnstile-home | public-prosumers | no |
| 13 | Damgar (Dubsar) | 0.1.1 | app | 880d33f2…a02f | `25303428d3e52017ead239762f899e004f2c1b7679ce5c8af1e6d31f484323aa` | 7946 | turnstile-home, longhouse-home-1, dubsar | dubpay | feeds/dubsar-before-closure/media/25303428d3e52017ead239762f899e004f2c1b7679ce5c8af1e6d31f484323aa |
| 14 | (not announced) | ? | unknown | not traced | `865625ca52c98c048dc8942247ee919470799173b2511b27ce114ef21faa3e10` | 355 | longhouse-home-1, turnstile-home | plain-words | no |
| 15 | Pointer Look | 0.1.2 | app | 84ae1e82…095c | `dc09721e44f7bd9108f1b3c1f50673935de77633a06ac2ffb155a7fb66897a0f` | 7372 | turnstile-home, longhouse-home-1 | pointer | no |
| 16 | Edubba (tray) (Dubsar) | 2 | app | 218a2a93…82dd | `03403b2f7b1dfded06a2f968bf51f760679cd5bc22d11358c03c3925204f0869` | 14921 | turnstile-home, longhouse-home-1, longhouse-home-2 | dublaw, longhouse | no |
| 17 | Dub for trays (Dubsar) | 0.3.0 | app | 762c0b4c…7f8b | `5da16ec69a89cb2999420f63ca2529a58aaefc7fce21a660a890933b72dd5117` | 16914 | turnstile-home, longhouse-home-1 | dubweb | no |
| 18 | Edubba (tray) (Dubsar) | 3 | app | 218a2a93…82dd | `fc0722d035794f79c4f63612b2445458c4d79b4adc5c35b500ebf29b6b5c8476` | 15989 | turnstile-home, longhouse-home-1 | dublaw | no |
| 19 | count of the contest (count.md) | - | data | b1895259…0366 | `3d502c76477eecaa75d7f2eee2ed4cc4643cf7a41e00b7a3d3ebe260a6a14e5c` | 37281 | turnstile-home, longhouse-home-1 | hosts | hosts/contest/count-day3.md; windows/ampersand/from-the-hosts/contest/count-day3.md; windows/backlot/from-the-hosts/contest/count-day3.md; windows/clusters/from-the-hosts/contest/count-day3.md; windows/counterparty/from-the-hosts/contest/count-day3.md; windows/dublaw/from-the-hosts/contest/count-day3.md; windows/dubpay/from-the-hosts/contest/count-day3.md; windows/dubweb/from-the-hosts/contest/count-day3.md; windows/followers/from-the-hosts/contest/count-day3.md; windows/hop/from-the-hosts/contest/count-day3.md; windows/keep/from-the-hosts/contest/count-day3.md; windows/longhouse/from-the-hosts/contest/count-day3.md; windows/lurker/from-the-hosts/contest/count-day3.md; windows/plain-words/from-the-hosts/contest/count-day3.md; windows/pointer/from-the-hosts/contest/count-day3.md; windows/postmark/from-the-hosts/contest/count-day3.md; windows/public-30-49/from-the-hosts/contest/count-day3.md; windows/public-50-plus/from-the-hosts/contest/count-day3.md; windows/public-creators/from-the-hosts/contest/count-day3.md; windows/public-prosumers/from-the-hosts/contest/count-day3.md; windows/public-under-30/from-the-hosts/contest/count-day3.md; windows/stall/from-the-hosts/contest/count-day3.md; windows/steward-and-co/from-the-hosts/contest/count-day3.md; windows/the-back-row/from-the-hosts/contest/count-day3.md; windows/turnstile/from-the-hosts/contest/count-day3.md; windows/until/from-the-hosts/contest/count-day3.md |
| 20 | count of the contest (count.json) | - | data | b1895259…0366 | `cac1591b1bb3104b12ce55540b98765a49489ee53140ca293755a0d28e877a8d` | 69710 | turnstile-home, longhouse-home-1 | hosts | hosts/contest/count-day3.json |
| 21 | Edubba (tray) (Dubsar) | 4 | app | 218a2a93…82dd | `50e6628851b62241ba455591a1ff1872a475506566be42cfe7573f9e266d152c` | 20769 | turnstile-home, longhouse-home-1, longhouse-home-2 | dublaw, longhouse | no |
| 22 | Steward & Co.'s words | - | words | 2c381cf6…d9f9 | `ed801d6be7f4ce61065cd567e4643939862368234bada2b68b3eda59e138eb7d` | 482 | longhouse-home-1, turnstile-home | steward-and-co | no |
| 23 | Steward & Co.'s deal words | - | words | 2c381cf6…d9f9 | `6fed387261f124cfe1be9581e06bf1f4130d90450507c2de113006bbf8454f4c` | 1016 | longhouse-home-1, turnstile-home | steward-and-co | no |
| 24 | Damgar (Dubsar) | 0.1.2 | app | 880d33f2…a02f | `abbe0d2d6f31e47fdacb55294feaec79a718f36e7cd369b07970936454ac5cfb` | 9854 | turnstile-home, longhouse-home-1 | dubpay | no |
| 25 | (not announced; DubLaw upload) (Dubsar) | ? | unknown | not traced | `08955992ec382828ffb44edc1bed1d5b9844d65bcfc1199ea73efa531b3c3fa0` | 22511 | turnstile-home, longhouse-home-1 | dublaw | no |
| 26 | Damgar (Dubsar) | 0.1.3 | app | 880d33f2…a02f | `234b0e723fa62c3d094545dcf9242abd63de672eae2e8eff8ba46896d3127353` | 10888 | turnstile-home, longhouse-home-1 | dubpay | no |
| 27 | Edubba (tray) (Dubsar) | 5 | app | 218a2a93…82dd | `e0e79e05581f89b2a2a8fcadcea28a79062b39abb499a8b0e6d547f00b8ff521` | 22710 | turnstile-home, longhouse-home-1 | dublaw | no |
| 28 | Edubba (tray) (Dubsar) | 6 (withdrawn) | app | 218a2a93…82dd | `30f9ba1aab639a43d36289ecac9b5b5c78cccd058bdda43cc831126fa9b76788` | 23491 | turnstile-home, longhouse-home-1 | dublaw | no |
| 29 | Edubba (tray) (Dubsar) | 7 | app | 218a2a93…82dd | `4b060aafc6e8b1e6aea50d2da425370d7ab3fe2709c8d6a194b4ea8386b71d51` | 23867 | turnstile-home, longhouse-home-1 | dublaw | no |
| 30 | Pointer Look | 0.1.3 | app | 84ae1e82…095c | `b3a51fda7f6230395ac0449c7ba3fb53c8b2f34dc759a6e050cb9cc458459307` | 8854 | turnstile-home, longhouse-home-1 | pointer | no |
| 31 | Ummia for trays (Dubsar) | 0.2.1 | app | 762c0b4c…7f8b | `1e41bc7b7fb5843d30d9bc42239ead8b6ae32a90cf0938d9ab18b8fb6472999b` | 16380 | turnstile-home, longhouse-home-1 | dubweb | no |
| 32 | Edubba Terms' words (Dubsar) | - | words | 218a2a93…82dd | `fe77a504f14ce28051109d6f5f2f0814b827a3f4745fa8d4657c70ef6a19a980` | 3128 | longhouse-home-1, turnstile-home | dublaw | no |
| 33 | Edubba (tray) (Dubsar) | 8 | app | 218a2a93…82dd | `3a5f363f3aba5c69819ef833800d3ddd4d7e68d60bd3c6c945326e6921458fcd` | 25215 | turnstile-home, longhouse-home-1 | dublaw | no |
| 34 | Steward & Co.'s words (v1) | - | words | 2c381cf6…d9f9 | `4fdd737054b2391390292999298f79fabaf46c386e79cd6907d18fbeccb0df26` | 305 | longhouse-home-1, turnstile-home | steward-and-co | no |
| 35 | Steward & Co.'s deal words | - | words | 2c381cf6…d9f9 | `04ce3c8c3538ed165f8776a3ff6ef445afb1662d465d07abfa3ae44926300ffb` | 1200 | longhouse-home-1, turnstile-home | steward-and-co | no |
| 36 | Steward & Co.'s words (v2) | - | words | 2c381cf6…d9f9 | `1660be9e8897cdae2fb136a5a98e1bea87a8d8096767b36e7cccb61933c0ba29` | 537 | longhouse-home-1, turnstile-home | steward-and-co | no |
| 37 | Steward & Co.'s work text | - | words | not traced | `6cb11c79b95cdac8391ceeb325ce80f032098b72bd1128835dd37981c5cc2d38` | 964 | longhouse-home-1, turnstile-home | steward-and-co | no |
| 38 | DubLaw's words for a maker (Dubsar) | - | words | 218a2a93…82dd | `805220fd9d85c21bc3b6fec18bf50b2522fbde68ff92d73d79e3abfdf9ea1924` | 1089 | turnstile-home, longhouse-home-1 | dublaw | no |
| 39 | DubLaw's words for a maker (Dubsar) | - | words | 218a2a93…82dd | `d78c7bc70aff3b792f4d44907e3415e48de97a3eb36b7c5631096a5c66c0f02c` | 1015 | turnstile-home, longhouse-home-1 | dublaw | no |
| 40 | DubLaw's words for a maker (Dubsar) | - | words | 218a2a93…82dd | `daedd24e63bb50d18d26b182302bfd508dd02926be0c9b54a46574cd9af458d3` | 1014 | turnstile-home, longhouse-home-1 | dublaw | no |
| 41 | Edubba (tray) (Dubsar) | 9 | app | 218a2a93…82dd | `d6c16684cf8093c8ca330f0321143f718faf59abb86793df2338d4474d348f37` | 32767 | turnstile-home, longhouse-home-1 | dublaw | no |
| 42 | (not announced; public-creators upload) | ? | unknown | not traced | `e2290fc5e0bf58bd9a60ffbdacd1efea7052104120f1d3a410bbdc8db99bd82d` | 1015 | turnstile-home, longhouse-home-1 | public-creators | no |
| 43 | (not announced; public-creators upload) | ? | unknown | not traced | `a9410669a3bf8af1ab8a414e4baf77d573ffb30036ef7cea498cae482a9360a8` | 1053 | turnstile-home, longhouse-home-1 | public-creators | no |
| 44 | (not announced; public-creators upload) | ? | unknown | not traced | `ac68bc070edf4662dc24d37b5792923e7b8f0fff836696d61d47f9dbb5f5034e` | 1014 | turnstile-home, longhouse-home-1 | public-creators | no |
| 45 | (not announced; public-creators upload) | ? | unknown | not traced | `1430988bc0de9d86d7af193a4c5f0207ed7cf3a2d8a37ecb59c7120b3a0a0723` | 1057 | turnstile-home, longhouse-home-1 | public-creators | no |
| 46 | (not announced; public-creators upload) | ? | unknown | not traced | `781aa098e3c58ce86ce3ac3e1f214ca642d474b5e1212bb475b3a38dba44ebfb` | 1015 | turnstile-home, longhouse-home-1 | public-creators | no |
| 47 | DubLaw's words for a maker (Dubsar) | - | words | 218a2a93…82dd | `68a1d96245ded9bf3acd9951d402fdb7f68583e094a08ab3750036342343cfeb` | 1252 | turnstile-home, longhouse-home-1 | dublaw | no |
| 48 | Damgar (Dubsar) | 0.2.0 | app | 880d33f2…a02f | `393fbe78585b03faa51782f27c6704ed4989d3718792a22f08dfac18d1c38606` | 15646 | turnstile-home, longhouse-home-1 | dubpay | no |
| 49 | Edubba (tray) (Dubsar) | 10 | app | 218a2a93…82dd | `1c6dbfbb5f7d1edcc6663c7d91b3f42163251f8235162978bffc2a2ac5e6c0a7` | 40860 | turnstile-home, longhouse-home-1 | dublaw | no |
| 50 | Dub for trays (Dubsar) | 0.4.0 | app | 762c0b4c…7f8b | `1d3ebb773d13cbfb986be3a21053fd97e844780893736603c9335d9f4289ab6d` | 21717 | turnstile-home, longhouse-home-1, longhouse-home-2 | dubweb | windows/dubweb/build/clients/tray-apps/dub-0.4.0.mjs |
| 51 | Ummia for trays (Dubsar) | 0.3.0 | app | 762c0b4c…7f8b | `789b3ce7e5fa4aa8719a483f4e442ce2b5ce9e01ed725d3c44b6113471065810` | 24292 | turnstile-home, longhouse-home-1, longhouse-home-2 | dubweb | windows/dubweb/build/clients/tray-apps/ummia-0.3.0.mjs |
| 52 | Ummia for trays (Dubsar) | 0.3.1 | app | 762c0b4c…7f8b | `589505b4d9030ff54fe825d40a32d17e5cd364846936bf4fecf45a4471b50e70` | 24842 | turnstile-home, longhouse-home-1, longhouse-home-2 | dubweb | windows/dubweb/build/clients/tray-apps/ummia-0.3.1.mjs |
| 53 | words-check | 0.1.0 | app | 2c381cf6…d9f9 | `2af9c129723d3315c63d7a6f9b1c92322c1f6badf3ea560bb068b8f1bf10cd09` | 5860 | longhouse-home-1, turnstile-home | steward-and-co | no |
| 54 | turnstile-check | 1 | app | 11e77c4b…19c0 | `b78499382fd9fe5cf575522dff20247163dd5699aceafeecaf9063a31298d15b` | 3998 | turnstile-home, longhouse-home-1 | turnstile | no |
| 55 | Edubba (tray) (Dubsar) | 11 | app | 218a2a93…82dd | `836ce017eb92290c930757c7b2ba86ff970822b7582d7653eb3e0395f7522863` | 43834 | turnstile-home, longhouse-home-1 | dublaw | no |
| 56 | Dub for trays (Dubsar) | 0.5.0 | app | 762c0b4c…7f8b | `f8f7c207f6c32587f08e93dbe9de1927d2e454871467502036dec76ef07715f7` | 28539 | turnstile-home, longhouse-home-1, longhouse-home-2 | dubweb | windows/dubweb/build/clients/tray-apps/dub-0.5.0.mjs |
| 57 | Ummia for trays (Dubsar) | 0.4.0 | app | 762c0b4c…7f8b | `370ed8c047fab6ab441a98f6c23373ebc22be2a9de4e921870703a213e719049` | 27362 | turnstile-home, longhouse-home-1, longhouse-home-2 | dubweb | windows/dubweb/build/clients/tray-apps/ummia-0.4.0.mjs |
| 58 | Dub for trays (Dubsar) | 0.5.1 | app | 762c0b4c…7f8b | `d5e98eace0aa74b6c4a075a184bfc7a9c6f34e022c0a088d9089210eed8b13c2` | 28541 | turnstile-home, longhouse-home-1, longhouse-home-2 | dubweb | windows/dubweb/build/clients/tray-apps/dub-0.5.1.mjs |
| 59 | Ummia for trays (Dubsar) | 0.4.1 | app | 762c0b4c…7f8b | `e3bef00d93f7b069b5c1a3604e2c8f78e7c591dfb8e82052e6c8471b4d496d43` | 27990 | turnstile-home, longhouse-home-1, longhouse-home-2 | dubweb | windows/dubweb/build/clients/tray-apps/ummia-0.4.1.mjs |
| 60 | Damgar (Dubsar) | 0.2.1 | app | 880d33f2…a02f | `d08095fb6376c968e51f67fbcd9773bae0f92b8b2b8a722be2faa3b67b489d6a` | 17132 | turnstile-home, longhouse-home-1, longhouse-home-2 | dubpay | no |
| 61 | Damgar (Dubsar) | 0.2.2 | app | 880d33f2…a02f | `6e036543a84e58ee67a075f686478ddf702589ebd342e8ab2c04b53bbfa6efe7` | 21051 | turnstile-home, longhouse-home-1, longhouse-home-2 | dubpay | no |
| 62 | Postmark's place line, snapshot 1 | - | data | e6cb0683…e81d | `57ed75011edd52b736bef48d4b9945aa7ff35ebb534523ffa1ff9b970b7a995a` | 552016 | turnstile-home, longhouse-home-1, stall-home | postmark, stall | no |
| 63 | Postmark's place anchors | - | data | e6cb0683…e81d | `226ad552c8ec9893cb2e25ed5c96fddaf1c228ef123158e271ff73a8cf560dba` | 6185 | turnstile-home, longhouse-home-1, stall-home | postmark, stall | no |
| 64 | prove.mjs (first) | ? | script | e6cb0683…e81d | `e4d660b8ce73168f0e6e17b64b90cd79fdc7b5793421c6b699ce293c0e0845fc` | 4426 | turnstile-home, longhouse-home-1, stall-home | postmark, stall | no |
| 65 | Postmark's place genesis | - | data | not traced | `808111c9bffba01ae4094aa3b095a3314c6c70252f4154f245a4eb0dc4401a54` | 412 | turnstile-home, longhouse-home-1, stall-home | postmark, stall | windows/postmark/from-the-hosts/place/place.genesis |
| 66 | Postmark's desk genesis | - | data | e6cb0683…e81d | `2659901adac1e2f3a48d29f603239901173eb78eeaa94a033e96f5e717a82a33` | 412 | turnstile-home, longhouse-home-1, stall-home | postmark, stall | windows/postmark/from-the-hosts/place/desk.genesis |
| 67 | register (Proven claim) | 0.1 | script | not traced | `a68d5abc96d511ef9e45c9d5001478c391ee48a5b3e3ed03c7311f5123fd1822` | 3086 | turnstile-home | followers | no |
| 68 | credits-read | draft 1 | script | 76f53113…57ff | `332d02f91f1251f4ab542b6c7ac9574e96034e81a06a4b9d91b85dfda0911f68` | 2597 | turnstile-home | ampersand | no |
| 69 | register (Proven claim) | 0.2 | script | not traced | `c75609f858fba2d1b4361bbd8f0bb30b698dea4f4c0c14448f4975847298b811` | 3546 | turnstile-home, longhouse-home-1 | followers | no |
| 70 | lending shelf listing words | - | words | 2c381cf6…d9f9 | `55321843cffcd965ebff77750be19ed46115058cbe1ccc53ee585765545ada49` | 157 | longhouse-home-1, turnstile-home | steward-and-co | no |
| 71 | register (Proven claim) | 0.3 | script | 21a3f657…da1b | `dffe90fbbe2cdfbc93a2e8ee9a3e507069e36c40f30ecc4eb4884a63d67d5806` | 3767 | turnstile-home, longhouse-home-1, until-home | followers | windows/followers/build/register-test-copy.mjs |
| 72 | cercle-count | 1 | script | 058d65d4…130c | `053e962eaa72472f88ecbd1127043b47e8e27dbb0ea1e692c5cc572b6d2f8814` | 3525 | turnstile-home, longhouse-home-1 | public-30-49 | no |
| 73 | warning register (register.mjs, The Back Row) | 1 | script | 8f16771e…d833 | `f75a49ef6c3be361cd040f5d3154bfb9e1c210a9609e16463be43b091a025331` | 2865 | turnstile-home, longhouse-home-1 | the-back-row | no |
| 74 | shelf | 0.1.0 | app | 2c381cf6…d9f9 | `342921d6dd5cce99de3a37c08eb24392ff7bdaecd147f04f19122dfd8588d572` | 4733 | longhouse-home-1, turnstile-home | steward-and-co | no |
| 75 | register (Proven claim) | 0.4 | script | 21a3f657…da1b | `0372e86b00eace338b0deb806f70f3fd76bca914a9fbdf03228e265645296cc5` | 5150 | turnstile-home, longhouse-home-1, until-home | followers | no |
| 76 | Pointer Cite | 0.1 | app | 84ae1e82…095c | `1443f1cf27f72e57925d46e2e873ae4f623f16e7701fe944a68a81065973f225` | 7282 | turnstile-home, longhouse-home-1 | pointer | no |
| 77 | register (Proven claim) | 0.5 | script | 21a3f657…da1b | `259a2d6dbbea9c343329e566b32080713ec49daddaade74d29c99bf2647908f1` | 5804 | turnstile-home, longhouse-home-1, until-home | followers | no |
| 78 | Pointer Cite | 0.1.1 | app | 84ae1e82…095c | `72507a04db1d7adb76e885324fdcf93bc9a176330598d193d19e0f3445cb9785` | 8596 | turnstile-home, longhouse-home-1 | pointer | no |
| 79 | prove.mjs | ? | script | e6cb0683…e81d | `26d9bc87811daef35cacee99b8575bfcb2024dfba5e6d47a663490790b7cc3f6` | 5442 | turnstile-home, longhouse-home-1, stall-home | postmark | no |
| 80 | Postmark's draft 5 (text) | - | data | e6cb0683…e81d | `e22d414b88dd33a93a05c79384388672a657f51bb8606d0a3a0e3c133d4e4717` | 4695 | turnstile-home, longhouse-home-1, stall-home | postmark | no |
| 81 | Postmark's drill snapshot | - | data | e6cb0683…e81d | `e2ed0e2da141b6fe6f9b62c675495f10b96a25be955a59b52f49d43a98d9104c` | 5257 | turnstile-home, longhouse-home-1, stall-home | postmark | no |
| 82 | Postmark's place source | 0.5.0 | app | e6cb0683…e81d | `79314bc0cfde18fa603e1530705f0f422eb33a5dad7b7360e0982736669cd988` | 37822 | turnstile-home, longhouse-home-1, stall-home | postmark | no |
| 83 | pot (DubPay) (Dubsar) | 1 | app | 880d33f2…a02f | `1b912901c7ca5fb8efe951d3f555bbb9da25083a199c1b7733b35980fe9e19e2` | 14163 | turnstile-home, longhouse-home-1, longhouse-home-2 | dubpay | no |
| 84 | Stall's count of longhouse-home-2 | - | data | ddafffcd…a66e | `ce5bbd9a1b2b14a53ac0f542cbdaa0b61ed57a9b59e4aeaf864a85937a0a7977` | 43584 | stall-home, turnstile-home | stall | no |
| 85 | Ummia for trays (Dubsar) | 0.5.0 | app | 762c0b4c…7f8b | `fa7a34716f8d37c41decac3ab37947e1f7a9ea5c31c1c8877a9b552c732ad3ab` | 42792 | turnstile-home, longhouse-home-1, longhouse-home-2 | dubweb | windows/dubweb/build/clients/tray-apps/ummia-0.5.0.mjs |
| 86 | held | 0.1 | app | ddafffcd…a66e | `381f2c97f6d3d4fb1d9c9dd3af197992193fcc35d4af6a83407b8bf70a66ee83` | 3482 | stall-home, turnstile-home, longhouse-home-1 | stall | apps-from-trays/stall-held-0.1.mjs |
| 87 | Postmark's place line, snapshot 2 | - | data | e6cb0683…e81d | `ef62d7461be7eac0e663ef257a54355aca7e66ef64351933bc9e107787d540c8` | 670771 | turnstile-home, longhouse-home-1, stall-home | postmark | no |
| 88 | Postmark's place anchors | - | data | e6cb0683…e81d | `34eb92d19ed52561199631ffbee6ec52d8893ef474e711c1b8283e9e63aa1f9f` | 6137 | turnstile-home, longhouse-home-1, stall-home | postmark | no |
| 89 | Postmark's place file | - | data | not traced | `73c910cbd1eee2757dc87ec68158bf00b0d7078f6e2581b331333cc5c27bf508` | 4775 | turnstile-home, longhouse-home-1, stall-home | postmark | no |
| 90 | Dub for trays (Dubsar) | 0.5.2 | app | 762c0b4c…7f8b | `182b35bd72468fb9f9f95aa7117b0a1db8e250d29a9d5d39f6a1102fb7c7ca26` | 29522 | turnstile-home, longhouse-home-1, longhouse-home-2 | dubweb | windows/dubweb/build/clients/tray-apps/dub-0.5.2.mjs |
| 91 | Ummia for trays (Dubsar) | 0.5.1 | app | 762c0b4c…7f8b | `e194f0ff0d91b016c7c1f5effc345d6fc811d419ce05d851105eaf622d3ca52f` | 43460 | turnstile-home, longhouse-home-1, longhouse-home-2 | dubweb | windows/dubweb/build/clients/tray-apps/ummia-0.5.1.mjs |
| 92 | words-check | 0.1.1 | app | 2c381cf6…d9f9 | `b4bb924b23f6d0bb7dcb6569af47c139fe6291600e3bb258c9c40ae4331f66ea` | 6309 | longhouse-home-1, turnstile-home | steward-and-co | no |
| 93 | (not announced; public-prosumers upload) | ? | unknown | not traced | `abada2421974d7073a5a0dca63c0ba6dcb14f839586be6e0b23a64da1f11c43a` | 138 | turnstile-home | public-prosumers | no |
| 94 | (not announced; public-prosumers upload) | ? | unknown | not traced | `b07bd318528a58c3afff4ad6aa38956858202790292de6758dc5c087981e56fe` | 144 | turnstile-home | public-prosumers | no |
| 95 | lookup (superseded copy) | ? | app | not traced | `e323b113b6906ebfed6ca62673ba5c23ff4b3bc6a20e9b39bab9e522c07a69d9` | 5335 | turnstile-home, longhouse-home-1 | the-back-row | no |
| 96 | (not announced; Postmark upload) | ? | unknown | not traced | `690e76596f9f8f06b3094045fa6b21f089339c2867a129b161c334736adbc8cd` | 6675 | longhouse-home-1, stall-home, turnstile-home | postmark | no |
| 97 | lookup | 1 | app | 8f16771e…d833 | `0601ada550d91bd413f78b3ab622677dea5dc162768150dbaf2740d01ccb7884` | 5602 | turnstile-home, longhouse-home-1 | the-back-row | no |
| 98 | Edubba (tray) (Dubsar) | 12 | app | 218a2a93…82dd | `97b6ac67413d9efb6d057c166728a4b3fbd913ab6cac6f8b4abe2008ef96b69b` | 47306 | turnstile-home, longhouse-home-1 | dublaw | windows/dublaw/build/tray/edubba/edubba.mjs |
| 99 | register (Proven claim) | 0.6 | script | 21a3f657…da1b | `2992758f4f8c5ae18bdf29fc8701c453af2bbb3578cc6fa162708dab1239d74e` | 6144 | turnstile-home, longhouse-home-1, stall-home | followers | windows/followers/build/reg-run.mjs; windows/followers/build/register.mjs |
| 100 | Postmark's place anchor file | - | data | not traced | `309d57ce413d3a11f2d9efff68ddfbad8f534ba2f3422d41c32589073af49df8` | 4001 | turnstile-home, longhouse-home-1, stall-home | postmark | no |
| 101 | Postmark bundle: Until's notice of closing | - | data | not traced | `2ceb348eb32801ec16eedb2f79509f3e0633be1674fcd25fb11f121b43f1914a` | 5568 | turnstile-home, longhouse-home-1, stall-home | postmark | no |
| 102 | Postmark bundle: Longhouse's handover check | - | data | not traced | `0be07207919db21816c7550f4b019e5bdd2aed8ad974dc2102a30616e3fadda0` | 6628 | turnstile-home, longhouse-home-1, stall-home | postmark | no |
| 103 | Postmark bundle: Stall's count | - | data | not traced | `a92685ce8a87a67d15d0c4a7525c61411de8e020d92748ac4cbafe8352b57ed2` | 8748 | turnstile-home, longhouse-home-1, stall-home | postmark | no |
| 104 | cercle-count | 2 | script | 058d65d4…130c | `117f7d47163b62ca4fe3eb49d560e840b397538b0b254a6712ae9cb3cbd99ce1` | 4965 | turnstile-home, longhouse-home-1 | public-30-49 | no |
| 105 | credits-read2 | draft 2 | script | 76f53113…57ff | `33875a4edacf808a2ab42b391b22f1bcefaa73556d5bc6ee70d095fe43cacb05` | 3555 | turnstile-home, longhouse-home-1 | ampersand | no |
| 106 | Pointer Cite | 0.2 | app | 84ae1e82…095c | `958ac2616939081b4966e17208180ecb56ef4c2aa64637f1a0981b3ac2e605a7` | 15190 | turnstile-home, longhouse-home-1, stall-home | pointer | no |
| 107 | pot (DubPay) (Dubsar) | 2 | app | 880d33f2…a02f | `9b4661a690bba67f7398ccaed8b3c09327fa7c943fb1f0fe9b46787c00bec967` | 17507 | turnstile-home, longhouse-home-1, longhouse-home-2 | dubpay | no |
| 108 | Postmark's place line, snapshot 3 | - | data | e6cb0683…e81d | `e23953820a672b24fcb0a0a3e320137ebf722e58baa40d6b2253fffd39afe176` | 845141 | turnstile-home, longhouse-home-1, stall-home | postmark | no |
| 109 | Postmark's place anchor file | - | data | not traced | `666e2a6093fcb3f5e27480092d6d80ad0df03451d51c86f36c5c5d8b498529f4` | 6609 | turnstile-home, longhouse-home-1, stall-home | postmark | no |
| 110 | Pointer Cite | 0.2.1 | app | 84ae1e82…095c | `4714449937d6bb7db42dc33041a337411ccbdb0f9a9770423dd6b35cf1bfedf4` | 15431 | turnstile-home, longhouse-home-1, stall-home | pointer | no |
| 111 | Pointer Cite | 0.3 | app | 84ae1e82…095c | `afbf5ec5075319cad8a2b3312eac7c24d2b22abd679eb37768ee453c188c1333` | 17766 | turnstile-home, longhouse-home-1, stall-home | pointer | apps-from-trays/pointer-cite-0.3.mjs |
| 112 | Ummia for trays (Dubsar) | 0.5.2 | app | 762c0b4c…7f8b | `c271520eaa5648ffc3f81a4e54af10216b9b50506a40b7983a728e72f43d314b` | 45189 | turnstile-home, longhouse-home-1, longhouse-home-2 | dubweb | apps-from-trays/turnstile-check-v1.answer; windows/dubweb/build/clients/tray-apps/ummia-0.5.2.mjs |
| 113 | Postmark bundle: the Mending Circle's Terms v2 | - | data | not traced | `2faf07d4066d8d6e336b367e196e65f18896b9d72dba812d2c2bdf918fc1e252` | 312966 | turnstile-home, longhouse-home-1, stall-home | postmark | no |
| 114 | Postmark bundle: Jan's lineup | - | data | not traced | `23d85fdddd8cf4c18a2dcbe72d411b0e4395fece3cb4dbeca6f95cb7e743757d` | 45846 | turnstile-home, longhouse-home-1, stall-home | postmark | no |
| 115 | Postmark bundle | - | data | not traced | `76c01a4987aa1ac63d141857ab41206a110acdfbee4678ff40548ad319f9e990` | 216506 | turnstile-home, longhouse-home-1, stall-home | postmark | no |
| 116 | Pointer: file for Postmark and Longhouse | ? | unknown | not traced | `aef32c61516a08a4e8b8b5709fcf2a50d067cf349b7c7a4868e4e5a7c272ce78` | 17782 | turnstile-home, longhouse-home-1, stall-home | pointer | no |
| 117 | Pointer Look | 0.1.4 | app | 84ae1e82…095c | `a176a9f904f3357874ab5f54d34bd09eb954829310f62ea80d9ff06266746f08` | 10450 | turnstile-home, longhouse-home-1, stall-home | pointer | no |
| 118 | Postmark bundle (record of two works) | - | data | not traced | `fd02795fb9f9c4a31b71afa6c75b06e80a47b597068336fe0d951eeab054f14f` | 150855 | turnstile-home, longhouse-home-1, stall-home | postmark | no |
| 119 | Postmark bundle (record of two works) | - | data | not traced | `63d24e4a69c4230c1a116223c46bc655133bb76563ebccc366c29221335b96e6` | 25775 | turnstile-home, longhouse-home-1, stall-home | postmark | no |
| 120 | pot (DubPay) (Dubsar) | 3 | app | 880d33f2…a02f | `94514e4fb4bcd574e21b46c55432437522df5137146372ec1a8bf02929fa9e82` | 17952 | turnstile-home, longhouse-home-1, longhouse-home-2 | dubpay | no |
| 121 | Postmark's desk answer | - | data | not traced | `c56f3ce70760c6d06aaa4208475c422e570dfdcc5c1c331e91fe2c6408a735f8` | 6864 | turnstile-home, longhouse-home-1, stall-home | postmark | no |
| 122 | Postmark's place line, snapshot 4 | - | data | e6cb0683…e81d | `1ffd905845c6057585a3712a9dd6dfba200fbea8df663f9df96ef8e11b0c7b5f` | 899201 | turnstile-home, longhouse-home-1, stall-home | postmark | no |
| 123 | lookup | 1.1 | app | 8f16771e…d833 | `4377dc53c1bf317a5ca87d86733197f2a2f42bc89b85411f13f6c52806fe35d1` | 5813 | turnstile-home, longhouse-home-1, stall-home | the-back-row | no |
| 124 | Postmark's place line, final snapshot | - | data | not traced | `1542ae4408c82f19b3a624b0a7b99abf4bb995ee680967eebd9eca4abda825f3` | 924111 | turnstile-home, longhouse-home-1, stall-home | postmark | no |
| 125 | Postmark's place anchor file | - | data | not traced | `c026ad19ca6e98ddfea52912e278f35209f92aa8b85912b1706cd8c9b62a3fc9` | 7081 | turnstile-home, longhouse-home-1, stall-home | postmark | no |
| 126 | Postmark's place anchor file | - | data | not traced | `15a4c3a9ca2ab8ffa4e33a4e66511c5a88b215618f6a24fd9b5a4dd70346963a` | 25706 | turnstile-home, longhouse-home-1, stall-home | postmark | no |
| 127 | pot (DubPay) (Dubsar) | 4 | app | 880d33f2…a02f | `50c32afa2faa8b92068d7629a2e64232bd20b45874e989294d94d6901aa46873` | 19357 | turnstile-home, longhouse-home-1, longhouse-home-2 | dubpay | windows/dubpay/build/pot/pot.mjs |
| 128 | Pointer Look | 0.1.5 | app | 84ae1e82…095c | `b26c525dfe856ba5cc0d4863d78098ab54886b7ec3b8a97272e5896269ba0514` | 10810 | turnstile-home, longhouse-home-1, stall-home | pointer | no |
| 129 | Pointer Cite | 0.3.2 | app | 84ae1e82…095c | `687f9afc2ede99c8b9e51d1eaef3573248ca83ff68cf6293e0a01574ba86d9ab` | 18184 | turnstile-home, longhouse-home-1, stall-home | pointer | no |
| 130 | standing.mjs | 0.1 | script (published as a text act) | f9de7f3e…5291 | act `22fae0ff6316322f49aa54c6120217f9d2773da11a9227191dfdb6108fc13eac` | 4192 | longhouse-home-1, longhouse-home-2, stall-home, turnstile-home, until-home | (text act; kept by hop, lurker) | in the act itself (text act 22fae0ff6316322f49aa54c6120217f9d2773da11a9227191dfdb6108fc13eac) |
| 131 | Longhouse handover check (Module) | draft 1 | script (published as a text act) | b820fe4b…10f1 | act `ff1eaf7059312b88671732594650e279f0c8b410009143bbf919e95b153f995b` | 9125 | longhouse-home-1, longhouse-home-2, turnstile-home | (text act; kept by hop, longhouse) | in the act itself (text act ff1eaf7059312b88671732594650e279f0c8b410009143bbf919e95b153f995b) |
| 132 | turnstile-census.mjs | 1.1 | script (published as a text act) | 11e77c4b…19c0 | act `a16164066930a35ecdb56adf6114fa0fb018a5dc51be47e907a806a92c3cf7ca` | 9505 | longhouse-home-1 | (text act; kept by hop, turnstile) | in the act itself (text act a16164066930a35ecdb56adf6114fa0fb018a5dc51be47e907a806a92c3cf7ca) |
| 133 | standing.mjs | 0.1.1 | script (published as a text act) | f9de7f3e…5291 | act `aefd33ef2601f52d9f19830e2f757dac3c554b2d789c46abf8d1de3fbbac2085` | 4253 | longhouse-home-1, longhouse-home-2, stall-home, turnstile-home, until-home | (text act; kept by hop, lurker) | in the act itself (text act aefd33ef2601f52d9f19830e2f757dac3c554b2d789c46abf8d1de3fbbac2085) |
| 134 | Hop's pot settlement suggestion | ? | script (published as a text act) | a48e4b24…96c5 | act `2525e63d3ce3ef034f55559e40d8214f9b11c34739117f1adbe283b84ea9bd7a` | 3391 | longhouse-home-1, longhouse-home-2, stall-home, turnstile-home | (text act; kept by hop) | in the act itself (text act 2525e63d3ce3ef034f55559e40d8214f9b11c34739117f1adbe283b84ea9bd7a) |
| 135 | standing.mjs | 0.1.2 | script (published as a text act) | f1de20f8…9bfb | act `f90fd73639a5655522ed0a9bdd8c4e8f8d0f894ee88baeb866bf60aaa91b6618` | 4491 | longhouse-home-1, stall-home, turnstile-home | (text act; kept by counterparty, hop) | in the act itself (text act f90fd73639a5655522ed0a9bdd8c4e8f8d0f894ee88baeb866bf60aaa91b6618) |
| 136 | kept.mjs | 0.1 | script (published as a text act) | 28070ee8…ee26 | act `3fdf9b598bcce3fb087b044f2b62d71b97a7d79a48a046e517bbef62a2854ba5` | 3942 | longhouse-home-1, turnstile-home | (text act; kept by hop, public-creators) | in the act itself (text act 3fdf9b598bcce3fb087b044f2b62d71b97a7d79a48a046e517bbef62a2854ba5) |
| 137 | standing.mjs | 0.2 | script (published as a text act) | f9de7f3e…5291 | act `56e9cc796e5e61f0ddedf91334af874c6425ca8226b6fbe7979662529f816628` | 5705 | longhouse-home-1, longhouse-home-2, stall-home, turnstile-home, until-home | (text act; kept by hop, lurker) | in the act itself (text act 56e9cc796e5e61f0ddedf91334af874c6425ca8226b6fbe7979662529f816628) |
| 138 | Hop's answerer | 0.1 | script (published as a text act) | a48e4b24…96c5 | act `46aaf149b42ad999644400b1f5dd461181fe1c57e0b3669e32cbe3a6310ee56b` | 5408 | longhouse-home-1, longhouse-home-2, stall-home, turnstile-home | (text act; kept by hop) | in the act itself (text act 46aaf149b42ad999644400b1f5dd461181fe1c57e0b3669e32cbe3a6310ee56b) |
| 139 | standing.mjs | 0.1.3 | script (published as a text act) | f1de20f8…9bfb | act `37dee3fe2eb36aa901e5ed2fea7a2875a7fd5391f50ef1ed2189d0ad4afe7d49` | 5099 | longhouse-home-1, stall-home, turnstile-home | (text act; kept by counterparty, hop) | in the act itself (text act 37dee3fe2eb36aa901e5ed2fea7a2875a7fd5391f50ef1ed2189d0ad4afe7d49) |
| 140 | standing.mjs | 0.3 | script (published as a text act) | f9de7f3e…5291 | act `ae11d44466e755ae5416d0028a492b6f2a3dbb2a632b3417c0585b6fbc61edb2` | 6598 | longhouse-home-1, longhouse-home-2, stall-home, turnstile-home, until-home | (text act; kept by hop, lurker) | in the act itself (text act ae11d44466e755ae5416d0028a492b6f2a3dbb2a632b3417c0585b6fbc61edb2) |
| 141 | turnstile-census.mjs | 2 | script (published as a text act) | 11e77c4b…19c0 | act `ed92f0e378517a17f2381ade0a5ce9c41f54ebaba90b199ffa69d21b4a2ac894` | 13291 | longhouse-home-1 | (text act; kept by hop, turnstile) | in the act itself (text act ed92f0e378517a17f2381ade0a5ce9c41f54ebaba90b199ffa69d21b4a2ac894) |
| 142 | keep-recover | 0.2 | script (published as a text act) | a83df2c7…1f72 | act `8420b359acb6857142fb01f33e8713a005b8a2923bab72d073c98a06b00b6a70` | 5593 | longhouse-home-1, stall-home, turnstile-home | (text act; kept by hop, keep) | in the act itself (text act 8420b359acb6857142fb01f33e8713a005b8a2923bab72d073c98a06b00b6a70) |
| 143 | Longhouse handover check (Module) | draft 1.1 | script (published as a text act) | b820fe4b…10f1 | act `505597a00ee55bbb74e460bad028eb7097bb562af7652bd89535a5a04b7a697d` | 13393 | longhouse-home-1, stall-home, turnstile-home | (text act; kept by hop, longhouse) | in the act itself (text act 505597a00ee55bbb74e460bad028eb7097bb562af7652bd89535a5a04b7a697d) |
| 144 | mending.mjs | ? | script (published as a text act) | e4e5f6db…8c04 | act `046b26cd3bcbd6c3cb2d8ed06763781e6ba4694675b9ba7a4ee5ad4602aaa0a0` | 1791 | turnstile-home | (text act; kept by hop, public-prosumers) | in the act itself (text act 046b26cd3bcbd6c3cb2d8ed06763781e6ba4694675b9ba7a4ee5ad4602aaa0a0) |

**The `build/` folders** (counted; Dubsar's own code, plus followers'):

| Window | Path | Name | Version | Kind | SHA-256 (single files) | Published as media |
|---|---|---|---|---|---|---|
| dublaw | windows/dublaw/build/arbiter/arbiter.ts | arbiter (library) | drafts 1-2 | library | `0a54e7cff808a410…` | no |
| dublaw | windows/dublaw/build/clients/collective | mor-collective | 0.1.0 | client (package) | — | — |
| dublaw | windows/dublaw/build/clients/desk | mor-desk | 0.1.0 | client (package) | — | — |
| dublaw | windows/dublaw/build/tray/edubba/edubba.mjs | edubba.mjs | 12 | single file | `97b6ac67413d9efb…` | yes |
| dubpay | windows/dubpay/build/clients/damgar | mor-damgar | 0.1.0 | client (package) | — | — |
| dubpay | windows/dubpay/build/pot/pot.mjs | pot.mjs | ? | single file | `50c32afa2faa8b92…` | yes |
| dubweb | windows/dubweb/build/clients/buyer/buyer.mjs | buyer.mjs | ? | single file | `aea8a4d287888392…` | no |
| dubweb | windows/dubweb/build/clients/dub | mor-dub | 0.1.0 | client (package) | — | — |
| dubweb | windows/dubweb/build/clients/kishib | mor-kishib | 0.1.0 | client (package) | — | — |
| dubweb | windows/dubweb/build/clients/site | mor-site | 0.1.0 | client (package) | — | — |
| dubweb | windows/dubweb/build/clients/tray-apps/dub-0.4.0.mjs | dub-0.4.0.mjs | ? | single file | `1d3ebb773d13cbfb…` | yes |
| dubweb | windows/dubweb/build/clients/tray-apps/dub-0.5.0.mjs | dub-0.5.0.mjs | ? | single file | `f8f7c207f6c32587…` | yes |
| dubweb | windows/dubweb/build/clients/tray-apps/dub-0.5.1.mjs | dub-0.5.1.mjs | ? | single file | `d5e98eace0aa74b6…` | yes |
| dubweb | windows/dubweb/build/clients/tray-apps/dub-0.5.2.mjs | dub-0.5.2.mjs | ? | single file | `182b35bd72468fb9…` | yes |
| dubweb | windows/dubweb/build/clients/tray-apps/ummia-0.3.0.mjs | ummia-0.3.0.mjs | ? | single file | `789b3ce7e5fa4aa8…` | yes |
| dubweb | windows/dubweb/build/clients/tray-apps/ummia-0.3.1.mjs | ummia-0.3.1.mjs | ? | single file | `589505b4d9030ff5…` | yes |
| dubweb | windows/dubweb/build/clients/tray-apps/ummia-0.4.0.mjs | ummia-0.4.0.mjs | ? | single file | `370ed8c047fab6ab…` | yes |
| dubweb | windows/dubweb/build/clients/tray-apps/ummia-0.4.1.mjs | ummia-0.4.1.mjs | ? | single file | `e3bef00d93f7b069…` | yes |
| dubweb | windows/dubweb/build/clients/tray-apps/ummia-0.5.0.mjs | ummia-0.5.0.mjs | ? | single file | `fa7a34716f8d37c4…` | yes |
| dubweb | windows/dubweb/build/clients/tray-apps/ummia-0.5.1.mjs | ummia-0.5.1.mjs | ? | single file | `e194f0ff0d91b016…` | yes |
| dubweb | windows/dubweb/build/clients/tray-apps/ummia-0.5.2.mjs | ummia-0.5.2.mjs | ? | single file | `c271520eaa5648ff…` | yes |
| dubweb | windows/dubweb/build/clients/ummia | mor-ummia | 0.1.0 | client (package) | — | — |
| followers | windows/followers/build/claim-payload.mjs | claim-payload.mjs | ? | single file | `088b6cc9eef93e12…` | no |
| followers | windows/followers/build/notice.mjs | notice.mjs | ? | single file | `5a8cd64bf3f44031…` | no |
| followers | windows/followers/build/reg-run.mjs | reg-run.mjs | 0.6 | single file | `2992758f4f8c5ae1…` | yes |
| followers | windows/followers/build/register-test-copy.mjs | register-test-copy.mjs | 0.3 | single file | `dffe90fbbe2cdfbc…` | yes |
| followers | windows/followers/build/register.mjs | register.mjs | 0.6 | single file | `2992758f4f8c5ae1…` | yes |

**Scripts the reports name that were never published** (as media or as a text act), with window and number of mentions (counted; bytes not in `_research` unless a build folder has them). Most are a window's own working tools:

payout.py (dubpay; 6); close.py (dubpay; 6); anchor-cycle.sh (longhouse; 6); received.sh (longhouse; 6); say.sh (pointer; 6); deal7.py (dubpay; 5); test.mjs (dubpay, dubweb; 5); requests.py (dubpay; 4); window.mjs (plain-words, postmark; 4); refresh.sh (counterparty; 3); count3.mjs (counterparty; 3); shower-work-12.mjs (dublaw; 3); mentions.sh (dubpay; 3); safepost.sh (dubweb; 3); entries.mjs (pointer; 3); check2.mjs (pointer; 3); newpages.sh (pointer; 3); fullid.mjs (backlot; 2); lastpos.mjs (counterparty; 2); place.mjs (counterparty; 2); shower-work-strict.mjs (dublaw; 2); entry-v2.mjs (dublaw; 2); pay-plan.sh (hop; 2); keep-watch.mjs (keep; 2); post-block.sh (longhouse; 2); watch.sh (pointer; 2); summarize.mjs (pointer; 2); reach.mjs (pointer; 2); bought2.mjs (pointer; 2); bundle.mjs (pointer, postmark; 2); deals.mjs (pointer; 2); mine.mjs (postmark; 2); collect.mjs (counterparty; 1); count2.mjs (counterparty; 1); maxpos.mjs (counterparty; 1); dumpacts.mjs (counterparty; 1); inforce.sh (counterparty; 1); entrycheck.mjs (counterparty; 1); namedsigners.mjs (counterparty; 1); dealcheck.mjs (counterparty; 1); twin.mjs (counterparty; 1); hit-check.mjs (counterparty; 1); count4.mjs (counterparty; 1); cmiphash.mjs (dublaw; 1); shower-work-2.mjs (dublaw; 1); vectors-2.mjs (dublaw; 1); vectors-3.mjs (dublaw; 1); vectors-5.mjs (dublaw; 1); shower-work-4.mjs (dublaw; 1); build.mjs (dublaw; 1); shower-work-11.mjs (dublaw; 1); vectors-11.mjs (dublaw; 1); vectors-12.mjs (dublaw; 1); shower-work-6.mjs (dublaw; 1); shower-work-7.mjs (dublaw; 1); shower-work-8.mjs (dublaw; 1); shower-work-9.mjs (dublaw; 1); entry-12.mjs (dublaw; 1); deal.sh (dubpay; 1); payout-d3.py (dubpay; 1); bolt11.mjs (dubweb; 1); books.mjs (dubweb; 1); tray.mjs (dubweb; 1); 0.mjs (dubweb; 1); 1.mjs (dubweb; 1); words.mjs (hop; 1); check-v2.mjs (hop; 1); pass.sh (hop; 1); scan.sh (hop; 1); invoice.sh (hop; 1); send-invoices.sh (hop; 1); owner-invoices.mjs (hop; 1); payout.mjs (hop; 1); clear.mjs (hop; 1); read-tab.mjs (hop; 1); clearing.sh (hop; 1); pay-held.mjs (hop; 1); pay-held.sh (hop; 1); anchor.py (longhouse; 1); anchor_cmip.py (longhouse; 1); proof.py (longhouse; 1); count-test.mjs (pointer; 1); pagefeeds.sh (pointer; 1); count2.sh (pointer; 1); witness-many.mjs (postmark; 1); drill.sh (postmark; 1); feed.mjs (public-creators; 1); run2build.mjs (public-creators; 1); page.sh (public-creators; 1); mei-v2.sh (public-under-30; 1); open2.mjs (the-back-row; 1); pub.sh (the-back-row; 1); one.mjs (the-back-row; 1); rec.mjs (the-back-row; 1); watch.mjs (the-back-row; 1); until-watch.mjs (until; 1); manifest.mjs (until; 1)

## 3. To fetch

For Nobody, allegedly. These media hashes were uploaded (answered 200), but their bytes are not anywhere in `_research`. Each is held by the homes named. Everything I say about these apps is **from reports and acts, bytes not read**.

| Media hash | Name | Version | Kind | Bytes | Homes that hold it | Uploaded by window |
|---|---|---|---|---|---|---|
| `46098770fb158cfc4c28910acffc4bdced3a8a9024bb9dcc92398e5561f80b5b` | Pointer Look | 0.1 | app | 6002 | turnstile-home, longhouse-home-1 | pointer |
| `eaa8ad33e51fc4715b12a26b3144c3026141017bf1725d0f21df5388b7e4a619` | Edubba (tray) | 1 | app | 10489 | turnstile-home, longhouse-home-1, longhouse-home-2 | dublaw, longhouse |
| `2b1864f35aa184ab6efacf356cd3ce574af018b2a5e081fe312560b3ab005119` | Pointer Look | 0.1.1 | app | 6751 | turnstile-home, longhouse-home-1 | pointer |
| `3e0a460add1332e89322aac4121296d704c2d8e9d3c14d9ff2356d93d4de3ebb` | turnstile-move | 1 | app | 4405 | turnstile-home, longhouse-home-1 | turnstile |
| `ec550443ce09fb0e9cf8beb487f48f54d6a95829e3152dee594220285fd5917c` | Fennec | 0.1 | app | 2797 | turnstile-home | public-prosumers |
| `9b6c2f609864c0f4a8ae668a334d39edccd1628385db3ea095e528efa338f482` | Courier | 0.1 | app | 2283 | turnstile-home | public-prosumers |
| `1b2f1ea251aa49e61b18b228df4b5f459b6e72ad755910a942fbcdc694bcbc25` | Buy | 0.1 | app | 1861 | turnstile-home | public-prosumers |
| `0221126a2d1a3556abf605050f67aa198e7a5614bd6b2911442918a0948dbc1b` | Shower Pro (hostile) | ? | app | 449 | turnstile-home | public-prosumers |
| `865625ca52c98c048dc8942247ee919470799173b2511b27ce114ef21faa3e10` | (not announced) | ? | unknown | 355 | longhouse-home-1, turnstile-home | plain-words |
| `dc09721e44f7bd9108f1b3c1f50673935de77633a06ac2ffb155a7fb66897a0f` | Pointer Look | 0.1.2 | app | 7372 | turnstile-home, longhouse-home-1 | pointer |
| `03403b2f7b1dfded06a2f968bf51f760679cd5bc22d11358c03c3925204f0869` | Edubba (tray) | 2 | app | 14921 | turnstile-home, longhouse-home-1, longhouse-home-2 | dublaw, longhouse |
| `5da16ec69a89cb2999420f63ca2529a58aaefc7fce21a660a890933b72dd5117` | Dub for trays | 0.3.0 | app | 16914 | turnstile-home, longhouse-home-1 | dubweb |
| `fc0722d035794f79c4f63612b2445458c4d79b4adc5c35b500ebf29b6b5c8476` | Edubba (tray) | 3 | app | 15989 | turnstile-home, longhouse-home-1 | dublaw |
| `50e6628851b62241ba455591a1ff1872a475506566be42cfe7573f9e266d152c` | Edubba (tray) | 4 | app | 20769 | turnstile-home, longhouse-home-1, longhouse-home-2 | dublaw, longhouse |
| `ed801d6be7f4ce61065cd567e4643939862368234bada2b68b3eda59e138eb7d` | Steward & Co.'s words | - | words | 482 | longhouse-home-1, turnstile-home | steward-and-co |
| `6fed387261f124cfe1be9581e06bf1f4130d90450507c2de113006bbf8454f4c` | Steward & Co.'s deal words | - | words | 1016 | longhouse-home-1, turnstile-home | steward-and-co |
| `abbe0d2d6f31e47fdacb55294feaec79a718f36e7cd369b07970936454ac5cfb` | Damgar | 0.1.2 | app | 9854 | turnstile-home, longhouse-home-1 | dubpay |
| `08955992ec382828ffb44edc1bed1d5b9844d65bcfc1199ea73efa531b3c3fa0` | (not announced; DubLaw upload) | ? | unknown | 22511 | turnstile-home, longhouse-home-1 | dublaw |
| `234b0e723fa62c3d094545dcf9242abd63de672eae2e8eff8ba46896d3127353` | Damgar | 0.1.3 | app | 10888 | turnstile-home, longhouse-home-1 | dubpay |
| `e0e79e05581f89b2a2a8fcadcea28a79062b39abb499a8b0e6d547f00b8ff521` | Edubba (tray) | 5 | app | 22710 | turnstile-home, longhouse-home-1 | dublaw |
| `30f9ba1aab639a43d36289ecac9b5b5c78cccd058bdda43cc831126fa9b76788` | Edubba (tray) | 6 (withdrawn) | app | 23491 | turnstile-home, longhouse-home-1 | dublaw |
| `4b060aafc6e8b1e6aea50d2da425370d7ab3fe2709c8d6a194b4ea8386b71d51` | Edubba (tray) | 7 | app | 23867 | turnstile-home, longhouse-home-1 | dublaw |
| `b3a51fda7f6230395ac0449c7ba3fb53c8b2f34dc759a6e050cb9cc458459307` | Pointer Look | 0.1.3 | app | 8854 | turnstile-home, longhouse-home-1 | pointer |
| `1e41bc7b7fb5843d30d9bc42239ead8b6ae32a90cf0938d9ab18b8fb6472999b` | Ummia for trays | 0.2.1 | app | 16380 | turnstile-home, longhouse-home-1 | dubweb |
| `fe77a504f14ce28051109d6f5f2f0814b827a3f4745fa8d4657c70ef6a19a980` | Edubba Terms' words | - | words | 3128 | longhouse-home-1, turnstile-home | dublaw |
| `3a5f363f3aba5c69819ef833800d3ddd4d7e68d60bd3c6c945326e6921458fcd` | Edubba (tray) | 8 | app | 25215 | turnstile-home, longhouse-home-1 | dublaw |
| `4fdd737054b2391390292999298f79fabaf46c386e79cd6907d18fbeccb0df26` | Steward & Co.'s words (v1) | - | words | 305 | longhouse-home-1, turnstile-home | steward-and-co |
| `04ce3c8c3538ed165f8776a3ff6ef445afb1662d465d07abfa3ae44926300ffb` | Steward & Co.'s deal words | - | words | 1200 | longhouse-home-1, turnstile-home | steward-and-co |
| `1660be9e8897cdae2fb136a5a98e1bea87a8d8096767b36e7cccb61933c0ba29` | Steward & Co.'s words (v2) | - | words | 537 | longhouse-home-1, turnstile-home | steward-and-co |
| `6cb11c79b95cdac8391ceeb325ce80f032098b72bd1128835dd37981c5cc2d38` | Steward & Co.'s work text | - | words | 964 | longhouse-home-1, turnstile-home | steward-and-co |
| `805220fd9d85c21bc3b6fec18bf50b2522fbde68ff92d73d79e3abfdf9ea1924` | DubLaw's words for a maker | - | words | 1089 | turnstile-home, longhouse-home-1 | dublaw |
| `d78c7bc70aff3b792f4d44907e3415e48de97a3eb36b7c5631096a5c66c0f02c` | DubLaw's words for a maker | - | words | 1015 | turnstile-home, longhouse-home-1 | dublaw |
| `daedd24e63bb50d18d26b182302bfd508dd02926be0c9b54a46574cd9af458d3` | DubLaw's words for a maker | - | words | 1014 | turnstile-home, longhouse-home-1 | dublaw |
| `d6c16684cf8093c8ca330f0321143f718faf59abb86793df2338d4474d348f37` | Edubba (tray) | 9 | app | 32767 | turnstile-home, longhouse-home-1 | dublaw |
| `e2290fc5e0bf58bd9a60ffbdacd1efea7052104120f1d3a410bbdc8db99bd82d` | (not announced; public-creators upload) | ? | unknown | 1015 | turnstile-home, longhouse-home-1 | public-creators |
| `a9410669a3bf8af1ab8a414e4baf77d573ffb30036ef7cea498cae482a9360a8` | (not announced; public-creators upload) | ? | unknown | 1053 | turnstile-home, longhouse-home-1 | public-creators |
| `ac68bc070edf4662dc24d37b5792923e7b8f0fff836696d61d47f9dbb5f5034e` | (not announced; public-creators upload) | ? | unknown | 1014 | turnstile-home, longhouse-home-1 | public-creators |
| `1430988bc0de9d86d7af193a4c5f0207ed7cf3a2d8a37ecb59c7120b3a0a0723` | (not announced; public-creators upload) | ? | unknown | 1057 | turnstile-home, longhouse-home-1 | public-creators |
| `781aa098e3c58ce86ce3ac3e1f214ca642d474b5e1212bb475b3a38dba44ebfb` | (not announced; public-creators upload) | ? | unknown | 1015 | turnstile-home, longhouse-home-1 | public-creators |
| `68a1d96245ded9bf3acd9951d402fdb7f68583e094a08ab3750036342343cfeb` | DubLaw's words for a maker | - | words | 1252 | turnstile-home, longhouse-home-1 | dublaw |
| `393fbe78585b03faa51782f27c6704ed4989d3718792a22f08dfac18d1c38606` | Damgar | 0.2.0 | app | 15646 | turnstile-home, longhouse-home-1 | dubpay |
| `1c6dbfbb5f7d1edcc6663c7d91b3f42163251f8235162978bffc2a2ac5e6c0a7` | Edubba (tray) | 10 | app | 40860 | turnstile-home, longhouse-home-1 | dublaw |
| `2af9c129723d3315c63d7a6f9b1c92322c1f6badf3ea560bb068b8f1bf10cd09` | words-check | 0.1.0 | app | 5860 | longhouse-home-1, turnstile-home | steward-and-co |
| `b78499382fd9fe5cf575522dff20247163dd5699aceafeecaf9063a31298d15b` | turnstile-check | 1 | app | 3998 | turnstile-home, longhouse-home-1 | turnstile |
| `836ce017eb92290c930757c7b2ba86ff970822b7582d7653eb3e0395f7522863` | Edubba (tray) | 11 | app | 43834 | turnstile-home, longhouse-home-1 | dublaw |
| `d08095fb6376c968e51f67fbcd9773bae0f92b8b2b8a722be2faa3b67b489d6a` | Damgar | 0.2.1 | app | 17132 | turnstile-home, longhouse-home-1, longhouse-home-2 | dubpay |
| `6e036543a84e58ee67a075f686478ddf702589ebd342e8ab2c04b53bbfa6efe7` | Damgar | 0.2.2 | app | 21051 | turnstile-home, longhouse-home-1, longhouse-home-2 | dubpay |
| `57ed75011edd52b736bef48d4b9945aa7ff35ebb534523ffa1ff9b970b7a995a` | Postmark's place line, snapshot 1 | - | data | 552016 | turnstile-home, longhouse-home-1, stall-home | postmark, stall |
| `226ad552c8ec9893cb2e25ed5c96fddaf1c228ef123158e271ff73a8cf560dba` | Postmark's place anchors | - | data | 6185 | turnstile-home, longhouse-home-1, stall-home | postmark, stall |
| `e4d660b8ce73168f0e6e17b64b90cd79fdc7b5793421c6b699ce293c0e0845fc` | prove.mjs (first) | ? | script | 4426 | turnstile-home, longhouse-home-1, stall-home | postmark, stall |
| `a68d5abc96d511ef9e45c9d5001478c391ee48a5b3e3ed03c7311f5123fd1822` | register (Proven claim) | 0.1 | script | 3086 | turnstile-home | followers |
| `332d02f91f1251f4ab542b6c7ac9574e96034e81a06a4b9d91b85dfda0911f68` | credits-read | draft 1 | script | 2597 | turnstile-home | ampersand |
| `c75609f858fba2d1b4361bbd8f0bb30b698dea4f4c0c14448f4975847298b811` | register (Proven claim) | 0.2 | script | 3546 | turnstile-home, longhouse-home-1 | followers |
| `55321843cffcd965ebff77750be19ed46115058cbe1ccc53ee585765545ada49` | lending shelf listing words | - | words | 157 | longhouse-home-1, turnstile-home | steward-and-co |
| `053e962eaa72472f88ecbd1127043b47e8e27dbb0ea1e692c5cc572b6d2f8814` | cercle-count | 1 | script | 3525 | turnstile-home, longhouse-home-1 | public-30-49 |
| `f75a49ef6c3be361cd040f5d3154bfb9e1c210a9609e16463be43b091a025331` | warning register (register.mjs, The Back Row) | 1 | script | 2865 | turnstile-home, longhouse-home-1 | the-back-row |
| `342921d6dd5cce99de3a37c08eb24392ff7bdaecd147f04f19122dfd8588d572` | shelf | 0.1.0 | app | 4733 | longhouse-home-1, turnstile-home | steward-and-co |
| `0372e86b00eace338b0deb806f70f3fd76bca914a9fbdf03228e265645296cc5` | register (Proven claim) | 0.4 | script | 5150 | turnstile-home, longhouse-home-1, until-home | followers |
| `1443f1cf27f72e57925d46e2e873ae4f623f16e7701fe944a68a81065973f225` | Pointer Cite | 0.1 | app | 7282 | turnstile-home, longhouse-home-1 | pointer |
| `259a2d6dbbea9c343329e566b32080713ec49daddaade74d29c99bf2647908f1` | register (Proven claim) | 0.5 | script | 5804 | turnstile-home, longhouse-home-1, until-home | followers |
| `72507a04db1d7adb76e885324fdcf93bc9a176330598d193d19e0f3445cb9785` | Pointer Cite | 0.1.1 | app | 8596 | turnstile-home, longhouse-home-1 | pointer |
| `26d9bc87811daef35cacee99b8575bfcb2024dfba5e6d47a663490790b7cc3f6` | prove.mjs | ? | script | 5442 | turnstile-home, longhouse-home-1, stall-home | postmark |
| `e22d414b88dd33a93a05c79384388672a657f51bb8606d0a3a0e3c133d4e4717` | Postmark's draft 5 (text) | - | data | 4695 | turnstile-home, longhouse-home-1, stall-home | postmark |
| `e2ed0e2da141b6fe6f9b62c675495f10b96a25be955a59b52f49d43a98d9104c` | Postmark's drill snapshot | - | data | 5257 | turnstile-home, longhouse-home-1, stall-home | postmark |
| `79314bc0cfde18fa603e1530705f0f422eb33a5dad7b7360e0982736669cd988` | Postmark's place source | 0.5.0 | app | 37822 | turnstile-home, longhouse-home-1, stall-home | postmark |
| `1b912901c7ca5fb8efe951d3f555bbb9da25083a199c1b7733b35980fe9e19e2` | pot (DubPay) | 1 | app | 14163 | turnstile-home, longhouse-home-1, longhouse-home-2 | dubpay |
| `ce5bbd9a1b2b14a53ac0f542cbdaa0b61ed57a9b59e4aeaf864a85937a0a7977` | Stall's count of longhouse-home-2 | - | data | 43584 | stall-home, turnstile-home | stall |
| `ef62d7461be7eac0e663ef257a54355aca7e66ef64351933bc9e107787d540c8` | Postmark's place line, snapshot 2 | - | data | 670771 | turnstile-home, longhouse-home-1, stall-home | postmark |
| `34eb92d19ed52561199631ffbee6ec52d8893ef474e711c1b8283e9e63aa1f9f` | Postmark's place anchors | - | data | 6137 | turnstile-home, longhouse-home-1, stall-home | postmark |
| `73c910cbd1eee2757dc87ec68158bf00b0d7078f6e2581b331333cc5c27bf508` | Postmark's place file | - | data | 4775 | turnstile-home, longhouse-home-1, stall-home | postmark |
| `b4bb924b23f6d0bb7dcb6569af47c139fe6291600e3bb258c9c40ae4331f66ea` | words-check | 0.1.1 | app | 6309 | longhouse-home-1, turnstile-home | steward-and-co |
| `abada2421974d7073a5a0dca63c0ba6dcb14f839586be6e0b23a64da1f11c43a` | (not announced; public-prosumers upload) | ? | unknown | 138 | turnstile-home | public-prosumers |
| `b07bd318528a58c3afff4ad6aa38956858202790292de6758dc5c087981e56fe` | (not announced; public-prosumers upload) | ? | unknown | 144 | turnstile-home | public-prosumers |
| `e323b113b6906ebfed6ca62673ba5c23ff4b3bc6a20e9b39bab9e522c07a69d9` | lookup (superseded copy) | ? | app | 5335 | turnstile-home, longhouse-home-1 | the-back-row |
| `690e76596f9f8f06b3094045fa6b21f089339c2867a129b161c334736adbc8cd` | (not announced; Postmark upload) | ? | unknown | 6675 | longhouse-home-1, stall-home, turnstile-home | postmark |
| `0601ada550d91bd413f78b3ab622677dea5dc162768150dbaf2740d01ccb7884` | lookup | 1 | app | 5602 | turnstile-home, longhouse-home-1 | the-back-row |
| `309d57ce413d3a11f2d9efff68ddfbad8f534ba2f3422d41c32589073af49df8` | Postmark's place anchor file | - | data | 4001 | turnstile-home, longhouse-home-1, stall-home | postmark |
| `2ceb348eb32801ec16eedb2f79509f3e0633be1674fcd25fb11f121b43f1914a` | Postmark bundle: Until's notice of closing | - | data | 5568 | turnstile-home, longhouse-home-1, stall-home | postmark |
| `0be07207919db21816c7550f4b019e5bdd2aed8ad974dc2102a30616e3fadda0` | Postmark bundle: Longhouse's handover check | - | data | 6628 | turnstile-home, longhouse-home-1, stall-home | postmark |
| `a92685ce8a87a67d15d0c4a7525c61411de8e020d92748ac4cbafe8352b57ed2` | Postmark bundle: Stall's count | - | data | 8748 | turnstile-home, longhouse-home-1, stall-home | postmark |
| `117f7d47163b62ca4fe3eb49d560e840b397538b0b254a6712ae9cb3cbd99ce1` | cercle-count | 2 | script | 4965 | turnstile-home, longhouse-home-1 | public-30-49 |
| `33875a4edacf808a2ab42b391b22f1bcefaa73556d5bc6ee70d095fe43cacb05` | credits-read2 | draft 2 | script | 3555 | turnstile-home, longhouse-home-1 | ampersand |
| `958ac2616939081b4966e17208180ecb56ef4c2aa64637f1a0981b3ac2e605a7` | Pointer Cite | 0.2 | app | 15190 | turnstile-home, longhouse-home-1, stall-home | pointer |
| `9b4661a690bba67f7398ccaed8b3c09327fa7c943fb1f0fe9b46787c00bec967` | pot (DubPay) | 2 | app | 17507 | turnstile-home, longhouse-home-1, longhouse-home-2 | dubpay |
| `e23953820a672b24fcb0a0a3e320137ebf722e58baa40d6b2253fffd39afe176` | Postmark's place line, snapshot 3 | - | data | 845141 | turnstile-home, longhouse-home-1, stall-home | postmark |
| `666e2a6093fcb3f5e27480092d6d80ad0df03451d51c86f36c5c5d8b498529f4` | Postmark's place anchor file | - | data | 6609 | turnstile-home, longhouse-home-1, stall-home | postmark |
| `4714449937d6bb7db42dc33041a337411ccbdb0f9a9770423dd6b35cf1bfedf4` | Pointer Cite | 0.2.1 | app | 15431 | turnstile-home, longhouse-home-1, stall-home | pointer |
| `2faf07d4066d8d6e336b367e196e65f18896b9d72dba812d2c2bdf918fc1e252` | Postmark bundle: the Mending Circle's Terms v2 | - | data | 312966 | turnstile-home, longhouse-home-1, stall-home | postmark |
| `23d85fdddd8cf4c18a2dcbe72d411b0e4395fece3cb4dbeca6f95cb7e743757d` | Postmark bundle: Jan's lineup | - | data | 45846 | turnstile-home, longhouse-home-1, stall-home | postmark |
| `76c01a4987aa1ac63d141857ab41206a110acdfbee4678ff40548ad319f9e990` | Postmark bundle | - | data | 216506 | turnstile-home, longhouse-home-1, stall-home | postmark |
| `aef32c61516a08a4e8b8b5709fcf2a50d067cf349b7c7a4868e4e5a7c272ce78` | Pointer: file for Postmark and Longhouse | ? | unknown | 17782 | turnstile-home, longhouse-home-1, stall-home | pointer |
| `a176a9f904f3357874ab5f54d34bd09eb954829310f62ea80d9ff06266746f08` | Pointer Look | 0.1.4 | app | 10450 | turnstile-home, longhouse-home-1, stall-home | pointer |
| `fd02795fb9f9c4a31b71afa6c75b06e80a47b597068336fe0d951eeab054f14f` | Postmark bundle (record of two works) | - | data | 150855 | turnstile-home, longhouse-home-1, stall-home | postmark |
| `63d24e4a69c4230c1a116223c46bc655133bb76563ebccc366c29221335b96e6` | Postmark bundle (record of two works) | - | data | 25775 | turnstile-home, longhouse-home-1, stall-home | postmark |
| `94514e4fb4bcd574e21b46c55432437522df5137146372ec1a8bf02929fa9e82` | pot (DubPay) | 3 | app | 17952 | turnstile-home, longhouse-home-1, longhouse-home-2 | dubpay |
| `c56f3ce70760c6d06aaa4208475c422e570dfdcc5c1c331e91fe2c6408a735f8` | Postmark's desk answer | - | data | 6864 | turnstile-home, longhouse-home-1, stall-home | postmark |
| `1ffd905845c6057585a3712a9dd6dfba200fbea8df663f9df96ef8e11b0c7b5f` | Postmark's place line, snapshot 4 | - | data | 899201 | turnstile-home, longhouse-home-1, stall-home | postmark |
| `4377dc53c1bf317a5ca87d86733197f2a2f42bc89b85411f13f6c52806fe35d1` | lookup | 1.1 | app | 5813 | turnstile-home, longhouse-home-1, stall-home | the-back-row |
| `1542ae4408c82f19b3a624b0a7b99abf4bb995ee680967eebd9eca4abda825f3` | Postmark's place line, final snapshot | - | data | 924111 | turnstile-home, longhouse-home-1, stall-home | postmark |
| `c026ad19ca6e98ddfea52912e278f35209f92aa8b85912b1706cd8c9b62a3fc9` | Postmark's place anchor file | - | data | 7081 | turnstile-home, longhouse-home-1, stall-home | postmark |
| `15a4c3a9ca2ab8ffa4e33a4e66511c5a88b215618f6a24fd9b5a4dd70346963a` | Postmark's place anchor file | - | data | 25706 | turnstile-home, longhouse-home-1, stall-home | postmark |
| `b26c525dfe856ba5cc0d4863d78098ab54886b7ec3b8a97272e5896269ba0514` | Pointer Look | 0.1.5 | app | 10810 | turnstile-home, longhouse-home-1, stall-home | pointer |
| `687f9afc2ede99c8b9e51d1eaef3573248ca83ff68cf6293e0a01574ba86d9ab` | Pointer Cite | 0.3.2 | app | 18184 | turnstile-home, longhouse-home-1, stall-home | pointer |

**The ones that matter for section 4**, in order:
1. Pointer Look 0.1.5 `b26c525d…` and 0.1.3 `b3a51fda…`.
2. Pointer Cite 0.3.2 `687f9afc…` and 0.1.1 `72507a04…`.
3. shelf 0.1.0 `342921d6…`.
4. Buy 0.1 `1b2f1ea2…`.
5. register 0.4 `0372e86b…` and 0.5 `259a2d6d…` (0.3 and 0.6 are held).
6. cercle-count 2 `117f7d47…`.
7. credits-read2 `33875a4e…`.
8. Courier 0.1 `9b6c2f60…`.
9. words-check 0.1.1 `b4bb924b…`.
10. turnstile-check 1 `b7849938…`.
11. turnstile-move 1 `3e0a460a…`.

## 4. Features

**What Dubsar has to compare against** (traced, from a read of the code; file and line references are in my working notes, summarised here):

**Edubba, tray app v12, the only Dubsar agreements app a player could run:**
- It reads Terms: parties, sockets, owners, delivery key 9, the way out.
- It names about 35 cMIPs by hash (escrow, award, proven claim, warning notice, credits and others), by name only.
- It checks words against their fingerprint.
- It writes v1 Terms (`new`) and next versions (`update`), and guides makers through `pipe`.
- It signs only assents, and refuses a fork in your own line.
- It cannot sign a counter signature, a contest or a resolve. It reads no Statement of a player-made kind (K7).

**The desk and collective clients:**
- They have collectives, leaving, successors, vows with contest, key delivery, witness acts and anchoring.
- All of this runs on the genesis grammar (draft 17), and none of it ran in a tray this round (desk `ROUND-2-LESSONS.md`).

**The arbiter library** reads awards. No app calls it.

**Damgar, Dub, Ummia, Kišib:**
- Damgar's pre-payment `check`, and its `pay --from` that runs it first.
- Ummia's `pipe` and `sockets`.
- DubWeb's `buyer.mjs`: `check`, invoices and receipts. Contest and paying are not built.
- Kišib's succession (desktop only).

Each entry below also says what of this is missing or done less well.

### 4.1 Lending between people: listings and loans read from Statements
- **What it does** (from acts, bytes not read):
  - It reads every act the tray holds and prints each listing and each loan as open, late, returned, closed or contested, with each identity's count.
  - A listing is a Terms act; the borrower is a buyer-by-assent role; the loan is three Statements of the lending-shelf kind ("handed", "returned", "received back"); a disagreement is a core contest.
- **App:** shelf 0.1.0, Steward & Co. (`2c381cf6…d9f9`), media `342921d6dd5cce99de3a37c08eb24392ff7bdaecd147f04f19122dfd8588d572`. Announced in act `73a05f6e191b584624863b27ee0db4b7b271260fa5df2d6b764135078ac17a58`; the text is act `30969bb46052f2ad87bb88b5df0ee4b67ac4a26c6e41c315923dab97ddd24914`.
- **Acts** (counted):
  - Statements of kind lending shelf (`255551a7…`): 8 acts by 6 signers (`f833c07fb7bc9c8e3b6531cb181da3a247a2a8884ff09c80010aa97704c1015d`, `895cc4aeb6bc5705686328f3d13e5c8a5b2463655d606018d79a56c7ad17e67f`, `adbf698d49d17afd1a7ded6feb5a27040608458121e88780a1003a7545fc48d8`, `cf8517e5c5baa08688a52dd881840f6d741e6fae20c3b587bf19074969ab842a`, `2058e7b7cd664acde0b1129054709cb1c433e43ba1bd2835105d7cd2c55317be`, `f053fe70583ebb19b98581a44be088cef98f9df715992532de20197b7e8af9aa`, `d6b174f6f4830741f62155470b346f3f3438ca592c582b22ca10fc91d16cabcf`, `68ed1b163b6613b767ff3958be18b8903879f30cef2a444dcc6a36c809e6494c`).
  - Terms in those agreements: 4 acts by 4 signers (`e1975bda32e5ef828ac99b510dd5a483f4c16f8acd2c1ada8f936a354d5032d4`, `30844d0d4454fc645d4b667a2894f4a66014d08fb13b10b0639c845eaa8c884c`, `0e995796c5650a11c0cbe3abd80e57089f21969f3756e0c19c37cb51b8f6e16b`, `b0c5f084f44f5f9752ee581f4dfe3d6a2db7d7d707254e9dc65148842866b150`).
  - Named by others: 5 acts by 3 signers (`b15edf1c942eed914dbeb7c4882285248e0c2f2d0d323d4526674a599ba94d97`, `104dcc6d8f33941435ddafeb2d1722d0618b2d36143289a7851ecb489ff1d1e5`, `beac7f0769ba86086a29325af8b6958c801ae3c3b31d00f8fff9d291752f31fa`, `e5e991550c778b52bb0042bf6d511643e14301d1a20a31058090448f98bb9f14`, `19ce6306ec1dc5adbc3bc54ff2b1e726127ac5958aca5abd83c00a700fa09289`).
- **Dubsar today:** nothing. Edubba reads no Statement of a player-made kind (K7), and no Dubsar app has lending. Room lets, lending and consignment appear in no Dubsar app.
- **Who should carry it:** Edubba (DubLaw). Its Terms are a listing a person assents to, and the loan states are Statements in that agreement: consent and terms between people. No money moves, so nothing is DubPay's.
- **Proposal** (my reading): Edubba should learn to read K7 Statements by spec hash, as a table of states per agreement. Lending would be the first kind, because its states are few and fixed.

### 4.2 Delivery promised, and whether it was kept: receipts counted per seller
- **What it does** (bytes held, in the act; read in full):
  - It reads delivery receipts (drafts 1 and 2) from feed pages or act files and groups them by the author of the Terms.
  - It counts each outcome: delivered, late, not as described, not delivered, refunded, key never received.
  - It separately counts the receipts given "at arm's length": by buyers who share no other agreement with the seller.
  - It says that time is unchecked where no clock act is named.
- **App:** kept.mjs 0.1, Kept Word (`28070ee8…ee26`), text act `3fdf9b598bcce3fb087b044f2b62d71b97a7d79a48a046e517bbef62a2854ba5`. The cMIP drafts are acts `9e601202fc4412a7af9f2be172b9a673a3192006aba1a5eec9644f1e963af6d3` and `98e3deb497c022baed9d1963a1658e7d3dd178fcc1f562d29f237e1edf1912e9`.
- **Acts** (counted):
  - Receipts under draft 1 (`ec1f118d…`): 9 acts by 4 signers (`c5a5c984d0b546e9264a6cbec756a3eb24796822532cd284a5eb32f5d7195702`, `a34109e2c101e026ced6ad3be37c5e82e75029ec3e633eae7365665d107e98ac`, `9a49a3e6c33eebd2509044074dcde9bd8aeca81fbb50e00802b6b2a62682199c`, `a50b930baefb581b6d3040db54ef38aaf390069b049ba002ae7e6dae3bdec43e`, `f6ff6a2066612ff9f5b7e3bd36176740d6a4a7663f95c46374facf4c2d4e390f`, `6fbbbf79aadabd5caa39a511b219297d3de3c7090214d283c4daf57b816a8cfc`, `19a8cc6d7001d398b04217c2d3e36253b288a7e808189d422cfc2dbfa3240eb8`, `31cb877784c44fdc5fbfebca049c20d7779c076d26b88c9abd95937c983f4bda`, `75171bb5420cd1d3e7bd2cc6d366d09c08e18cfa2cd7ae6eb1bde3ee7c77860f`).
  - Receipts under draft 2 (`9e19e62c…`): 4 acts by 2 signers (`eb24fd594a100e3ba535827589ac05edcb8ccbadd59ff6b00e27fa8a72efd8a2`, `4046d0da6a894617894b86ee86f420690955c5b26f92b915076d2cab23bfa50d`, `e6afa1a50d7fdf0015aa9523263550674695979c2d973edda9f145bb70d8f4bd`, `07e0b2e17506799f08a922d2e0abe242924cc6b549453bffe5735a424b0adf83`).
  - The guild's charter Terms: 1 acts by 1 signers (`825b834deabfa35c3c9cce6cd1dd67b9e6445e1c41c1660df82e1af816e0245b`); its assents: 9 acts by 9 signers (`fb256ef338d695d72574a4ef11e922f9b121ed420aa97648510442617a186d32`, `132a549f534bd69545600250305505f7a27826af328c21a5ff5f62cab39d14ca`, `866297585d132fa916e20ac9ce56f0c1c48369412cf490545616c9d30c527857`, `9713fd9a6585d69a635abee77c9b9e7f83950cbd936b53979590bcf4b11e7581`, `e96ab4d5cbccdb77850dc31fc5a42491d61f8decf6b58b9338f887d8fb24f901`, `24183559f5327e405901a42418c0202e464c3112b9c83f2c7e44c28c478a8662`, `a7f56ef4d0fde4d99b379240b82cc39aabb658ff005dfb31847496e272858ed8`, `c4e70e13c39f2a7a7def8231ca8d6dfcbfa00bf210ad6c8aa078436f2c88ba2c`, `72f06a47116c57252d044b73979a4655729351eed83492e17fe1a50afb08bcf3`).
  - Named by others: 0 acts by 0 signers.
- **Dubsar today:**
  - Edubba reads the promise (shower work key 9, deliver by when, refund) and writes it in `new`. Nothing reads whether the promise was kept.
  - The desk has vows with confirm and contest, but under the old grammar.
- **Who should carry it:** a seam between Edubba (DubLaw) and Damgar (DubPay).
  - Edubba should show the receipts beside the promise they answer, since a receipt is a buyer's statement about an agreement's delivery term.
  - Damgar's `check` should show a seller's receipt counts before paying.
- **Proposal** (my reading): DubLaw reads the receipts; DubPay shows the counts it reads.

### 4.3 Debts where no Terms exist: claims, and rival claims ordered by a witness
- **What it does** (bytes of 0.3 and 0.6 held; read in part):
  - It checks a claim act from bytes alone: the debtor's own act carries the invoice, the preimage pays it, and the amount matches.
  - It sums each debtor's proven claims.
  - From 0.4 on, it orders rival claims on one payment by the earliest place record, and a claim nobody lodged stays contested. 0.6 reads draft 2's rules.
- **App:** register 0.1 to 0.6, by Pierre Silva (`21a3f657…da1b`) for followers.
  - 0.3: `dffe90fbbe2cdfbc93a2e8ee9a3e507069e36c40f30ecc4eb4884a63d67d5806`, held as `windows/followers/build/register-test-copy.mjs`.
  - 0.6: `2992758f4f8c5ae18bdf29fc8701c453af2bbb3578cc6fa162708dab1239d74e`, held as `windows/followers/build/reg-run.mjs` and `register.mjs`.
  - 0.1, 0.2, 0.4 and 0.5 are not held (section 3).
- **Acts** (counted):
  - Claims under draft 1 (`ed9a4b4e…`): 6 acts by 6 signers (`07e86444daf5b11c6763e005f8e22f5234d8098ba7086d9c8f7a408d2cb14f79`, `cf24f14bd646c656c2ca3f601ccafd27e7fac835f5d8c5bc427d653a8e8a7f25`, `96016068f27040875dda30dcf02ad58cd9cdeae0d272874d0e4a6e6c0ce13f11`, `2f6ba0b05a645f4758931779cf4526ce327a68f4199d8c07cf2ea07667bbbfe1`, `47bfbcac989dafb7f65a2b817dd10c39af84ed07f835ada56a52be9e6b93e748`, `591ccd9b455694c122aadc9385a3c319609170a46181ecda97d755f58b42b7aa`).
  - Claims under draft 2 (`51f9afc8…`): 0 acts by 0 signers. None was found in what `_research` holds.
  - Register runs published: 1 acts by 1 signers (`cbce1eab99b4f4a7fe4def2f856e60b16ff3f3dd3c29cfbdcbb3acae040e72f4`).
  - Named by others: 4 acts by 3 signers (`fdc6ee62b6656d59aaaf3d46339fd3cd9791abc6daa6da1591e96e6de52e66a0`, `cbce1eab99b4f4a7fe4def2f856e60b16ff3f3dd3c29cfbdcbb3acae040e72f4`, `ecf9afc498fc6d68573983111a3a2ba22e9b06277560825e2c178cffd602e862`, `ca9f8cb41015a87db529ef1a57c9a72fa0bbb34541041bad99a3ba59f0da8d09`).
- **Dubsar today:** Edubba names the proven claim cMIP and checks nothing. The arbiter library takes claims as input, but no app calls it.
- **Who should carry it:** Edubba (DubLaw), as disputes where no agreement exists. It is a seam with Damgar (DubPay), because proving that an invoice was paid by a preimage is what Damgar checks.
- **Proposal** (my reading):
  - Edubba gets a `claims` reading, built on the arbiter library's evidence rules.
  - Damgar supplies the paid-or-not check.
  - Ordering by the place goes to the MOR lead (section 5).

### 4.4 Evidence for an arbiter: citation card, bundle, "by when"
- **What it does** (0.3's bytes are held in `apps-from-trays/pointer-cite-0.3.mjs`, matching its media hash; I read its header and command list. The other versions are from acts, bytes not read):
  - Given an act, it gives a citation card: the signer with whether the key is proven, the position in the signer's line, the homes holding it, the place record, and who answered it.
  - `bundle` (0.1.1) writes one file of the cited acts, every act answering them and the place's records, each checkable with the core library alone.
  - `when` (0.2) reads time from two references and shows where they disagree.
  - 0.3 adds warning notices.
- **App:** Pointer Cite, Pointer (`84ae1e82…095c`), versions:
  - 0.1 `1443f1cf27f72e57925d46e2e873ae4f623f16e7701fe944a68a81065973f225`;
  - 0.1.1 `72507a04db1d7adb76e885324fdcf93bc9a176330598d193d19e0f3445cb9785`;
  - 0.2 `958ac2616939081b4966e17208180ecb56ef4c2aa64637f1a0981b3ac2e605a7`;
  - 0.2.1 `4714449937d6bb7db42dc33041a337411ccbdb0f9a9770423dd6b35cf1bfedf4`;
  - 0.3 `afbf5ec5075319cad8a2b3312eac7c24d2b22abd679eb37768ee453c188c1333`;
  - 0.3.2 `687f9afc2ede99c8b9e51d1eaef3573248ca83ff68cf6293e0a01574ba86d9ab`.

  The announcements are acts `05957c93b25acd87d1fe465d4ab1081a5c71440b40fabc62ff68a450d3cd5cf4`, `2a967b2b0785af6367be513af6cd335bb34950a28676d531a3500d02480bdcfc` and `28bfd7db64f9da6700f83a5bc86f294ce6b583b37c681d0687c36a63b8f0a862`.
- **Acts** (counted): named by others: 8 acts by 5 signers (`c96e1cea427bba04dac5c533b8a4be518c3c2c69b3f6e786c9b2bbe4606c8f37`, `107c2e0a9c35c5f472cf0e10357411e012de279dc5d7a6bf49bfce6657ac507d`, `c4643fccceb183065982d0b5314b1ff06dd4617f7dbdbbe1b8c446793cddcf70`, `14c16a985501b5bbe7fdd750af17ba2ce260bf10d920f32464168a46ab4594e7`, `001ad10012d1b5e94b71371fb2c5b5a6a133a6034d350af969dab15273f6fe7f`, `c03b0054b45434bb72e3de7da6b2e1fac7de255eb64eb0ad48f2b6aa4d44ed1f`, `07e88e375f7503b021890707d52b54a8c3049d7b719a478f8e14a4c3f3b30811`, `89c7f0a3c1dcba9c044ba9166f5b5740aa75cabb9d5a0b7a1f968649af31fb7d`).
- **Dubsar today:** the arbiter library reads awards and time windows (`onTime`), but no app gathers the evidence it needs. The desk's witness acts are in the old grammar.
- **Who should carry it:** a seam between Edubba (DubLaw), because a bundle is the input to a dispute and an award, and DubWeb, because the citation card and identity proof are its reading standard. DubLaw should own `bundle` and its use in a dispute; DubWeb the card.
- **Proposal** (my reading): an Edubba `dispute` reading that builds the bundle and runs the arbiter library on it.

### 4.5 The buyer's verdict before paying: yes, no, or cannot check, and other signers' forked assents
- **What it does** (from acts, bytes not read):
  - Before paying, it shows who can see the payment, the receiver in full and whether the Terms are in force. From 0.1.2 the answer is one of three: yes, no or cannot check, because the kit answers "unchecked" where it does not hold a cMIP.
  - From 0.1.3, a line "Forked assents": an assent with no previous act by someone who already signed in the agreement does not count, and the buyer is told not to pay.
  - From 0.1.4, warning notices; 0.1.5 says "read these first", never a refusal.
- **App:** Pointer Look, Pointer (`84ae1e82…095c`), versions:
  - 0.1 `46098770fb158cfc4c28910acffc4bdced3a8a9024bb9dcc92398e5561f80b5b`;
  - 0.1.1 `2b1864f35aa184ab6efacf356cd3ce574af018b2a5e081fe312560b3ab005119`;
  - 0.1.2 `dc09721e44f7bd9108f1b3c1f50673935de77633a06ac2ffb155a7fb66897a0f`;
  - 0.1.3 `b3a51fda7f6230395ac0449c7ba3fb53c8b2f34dc759a6e050cb9cc458459307`;
  - 0.1.4 `a176a9f904f3357874ab5f54d34bd09eb954829310f62ea80d9ff06266746f08`;
  - 0.1.5 `b26c525dfe856ba5cc0d4863d78098ab54886b7ec3b8a97272e5896269ba0514`.
- **Acts** (counted):
  - What the line looks for, as it appears in the data: assents by a Terms author that name no previous act: 13 acts by 1 signers (`a4b6c50d466df16f225b72f209c5bc17ec517523b640dcdb813944e81bfdc2df`, `7396639bd8d4ba7c1040bb4fe044196e706b6f8ab5f5c0189512fb8f5a6b33e6`, `d9405db3190a9efb0c9b59422bcc7c0cf03f3db959247a90334ee93a64932949`, `8f0a600000b553ad1bea21d34880e5122c42e5e561169ec47ede287f8f74bf19`, `b875c7d98b11760d43ddfb994dbf3257eff49b11c32a0ff1a20a026850cecefe`, `389585b05ee40dac2abb434c846f654adec43c6ac0400a8b7195dd86eac25cd3`, `de95144488ad623ac795421b5c248500e8bd4fedc704f05342ae5511d85577e6`, `96da2a64cf52c995a2ba8a7d0287c5eac013275c227cc787475b44dff9c8e138`, `a5f2213e97a5092fe6ac37941473e9c0e82dc01e3dedc58549ca01dd43e77fc7`, `1f589ba8bea621c9847c98ddc1ca26f929e8f1c0dd0309593149409451912247`, `1b35ad123108afed9d508472f40d454e8a27fae94dbc3cb60ca8615d83ba256c`, `2cfc1f0c330360e6f95d98fa898b04cef9cb0e8307a58824fb506d3d56f718de`, `2bc8e0051dc40f01576f06cc872ac6429214635fd56eaf5f837ebca20a2fcaf8`). All are by one signer, Stall.
  - Named by others: 1 acts by 1 signers (`c03b0054b45434bb72e3de7da6b2e1fac7de255eb64eb0ad48f2b6aa4d44ed1f`).
- **Dubsar today:**
  - Edubba refuses a fork in your own line when you assent, and its `pipe` reports in force by the grammar.
  - Ummia's `pipe` gives in force with its reason.
  - No Dubsar tray app tells a buyer that someone else's assent forked. None shows "cannot check" as a third answer on a buyer's screen.
- **Who should carry it:** a seam between Edubba (DubLaw), whose job is reading who has signed and whether it counts, and Damgar (DubPay), whose `check` runs before paying.
- **Proposal** (my reading):
  - Edubba gives the three-answer verdict and the line on others' forked assents.
  - Damgar's `check` calls Edubba's reading rather than making its own.
  - How such forks count is the MOR lead's question (section 5).

### 4.6 One command for a buyer: check in force, sign the buyer's assent, then pay
- **What it does** (from acts, bytes not read):
  1. It checks with the grammar that the seller's Terms are in force, and refuses to pay if not.
  2. It signs and publishes the buyer's assent.
  3. It orders the payment.
- **App:** Buy 0.1, Bilal Qureshi (`60f1db04…56ed`, public-prosumers), media `1b2f1ea251aa49e61b18b228df4b5f459b6e72ad755910a942fbcdc694bcbc25`. Announced in act `0476ac588aa62409947bd62dd19b7260bbdfa429f71227f44fa94c5873ffd7a4`.
- **Acts** (counted):
  - Terms with a buyer-by-assent role: 79 acts by 34 signers.
  - Assents to such Terms by someone not named as a signer there (buyers' assents, whatever app made them): 119 acts by 33 signers. The ids are in the JSON.
  - Named by others: 2 acts by 2 signers (`b0a01586a18ca15ace63b036b724f23212ab92424b25d1968e96fb637bd15a35`, `084335c676f1b35f478c04c4351181bc34bcb7185b41f7f81b0a16ef683d4402`).
- **Dubsar today:** the steps exist separately: Edubba `assent`, Damgar `pay --from`, and DubWeb's `buyer.mjs check` (paying is not built there). No single flow ties them together.
- **Who should carry it:** a seam between Edubba (DubLaw, the assent and the in-force check) and Damgar (DubPay, the payment). Where the steps run is DubWeb's shape question.
- **Proposal** (my reading): Edubba `assent --buyer` ends by handing Damgar the exact `pay --from` command, so that the order "in force, then assent, then pay" is kept, and each app signs only its own act.

### 4.7 Checking a Terms act against the place and the words, by a checklist
- **What it does** (from acts, bytes not read):
  - turnstile-check fetches a work and its Terms from postmark-place and says PASS or FAIL for eight points, among them: the work is lodged and names the announcement; the Terms rely on it; exact text hashes; readers; the receiver is a deal; a buyer's role; the author signs. It says UNCHECKED for the deal's split, in force and assents.
  - words-check lists every socket and its cMIP, and looks for the words behind the body's fingerprint anywhere in `in/`. From 0.1.1 it says which relays answered 404.
- **Apps:**
  - turnstile-check 1, Turnstile (`11e77c4b…19c0`), media `b78499382fd9fe5cf575522dff20247163dd5699aceafeecaf9063a31298d15b` (act `3fc6810e2d0bc6fa31b6be1bdf6d4e3559bca077b8773b4e13e34dac283a3243`).
  - words-check, Steward & Co. (`2c381cf6…d9f9`): 0.1.0 `2af9c129723d3315c63d7a6f9b1c92322c1f6badf3ea560bb068b8f1bf10cd09` and 0.1.1 `b4bb924b23f6d0bb7dcb6569af47c139fe6291600e3bb258c9c40ae4331f66ea`.
- **Acts** (counted): named by others: turnstile-check 3 acts by 2 signers (`355f5efb997c112a5cd21673d9c38be88cabc85bcbb50f28000743ba2a01b227`, `0872f77a222559da9a482f39506d0d6d501a0de83bd1bb9c7a73135c05031f94`, `f47fd7d0b203f01cd8b92ff411b5b838e11d646b75175081b44392199addb63a`); words-check 1 acts by 1 signers (`0872f77a222559da9a482f39506d0d6d501a0de83bd1bb9c7a73135c05031f94`).
- **Dubsar today:** Edubba's and Ummia's `pipe` cover most of the checklist. Edubba does less well in two places:
  - it does not read the place's records, and says "only the place can say", pointing to Turnstile's checker;
  - it checks words only when they are handed to it.
- **Who should carry it:** Edubba (DubLaw).
- **Proposal** (my reading): Edubba's `pipe` reads a lodging record when the tray holds one, and searches `in/` for the words.

### 4.8 Circles that swap time, counted from Statements in the agreement
- **What it does** (from acts, bytes not read):
  - cercle-count counts each member's balance of hours.
  - Version 1 read text lines; version 2 reads Statements of the "hours of care" kind (receiver states "owed", giver "confirmed") as well. All five members assented to each version.
  - mending.mjs (bytes held, in the act) counts the Mending Circle from feed pages.
- **Apps:**
  - cercle-count 1 and 2, Dalia (`058d65d4…130c`, public-30-49): `053e962eaa72472f88ecbd1127043b47e8e27dbb0ea1e692c5cc572b6d2f8814` and `117f7d47163b62ca4fe3eb49d560e840b397538b0b254a6712ae9cb3cbd99ce1`.
  - mending.mjs, text act `046b26cd3bcbd6c3cb2d8ed06763781e6ba4694675b9ba7a4ee5ad4602aaa0a0` (`e4e5f6db…`).
- **Acts** (counted):
  - Statements of kind hours of care (`4a737c66…`): 2 acts by 2 signers (`ccb65bb367e3ef1089eaa927986d11f838a6eefa33a8b6ec7fc993276f5838bc`, `7ff53e17c235cc12df87907cc04efd59cc97ab6a19dab6944356ea600f1d8248`).
  - The Cercle's Terms: 2 acts by 1 signers (`ce52dfc46e5928d4ae89b101d6ce4d2274fcb624e1a968e48f1dd56469965f48`, `caede5b536aa95ff0a6ba1d67dd6f8aa26e945b566e702d9a87a0925aa893a8b`); its assents: 10 acts by 5 signers (`67f989a57aaa16c6d04c728fa462919b348ba77367e339984d2779bfc2e59a09`, `4f8e4f9a984cb1d739d874175ecc7c99b910ed35786207f4e5f09be7cf3a0109`, `c74577e3e962da4be38095b51837e3b246cf0876c37587a5c5a8a2c3b484c2b0`, `5a7f60ebe5833b6d1c16029227083d3781019e2ecb308a4adf39000ac2e9f3cf`, `840020fce3792364fed25e7a92974962054583295b558f13da3663e03be6f2e1`, `63f0524cf464b9e4b233aea8b36b662aad267d988c4304014243f9b9eff45795`, `b5435b6d174c37b3a6ff37cf57b6d4a6119c8769c2b0c1af41ffee137091d498`, `7138874ab1dca82a14f9a655b306d47e4421b63f0f2299f697a37b5611baea2a`, `a72f3cff530d234d06e4a738973765899e4968f8dcedec52d98103c4f7c8c3b5`, `dd4cb2bcca836c5e22d3cb1d9d5dd459edb5f5f5b75027ea74ee0f77977a9c46`).
  - Text records (CERCLE-HOURS, CERCLE-CONFIRM): 6 acts by 5 signers (`efb51683b3dc38748f2c542c749c4591c8526d7c5a29aee4949aa108e3e9b9e9`, `13426ad2fdb862ecc7f092ff47e0c215f5f920c329715ca23739eea0f5245f92`, `b444a218ca26ba2daffc41c2dd06b354762514fb7923f74d55dd465899454bf9`, `666266e2c415ee1d87eb6bd17efb1f3bf8b65fa830e3cc949adb733552d5152f`, `80634df302978ac16f4c5a9c6940c9c12dbe83919249c9990c68da8963592b9c`, `a9136f2993a7712936a57fa48da988674be50716b35d07c8b3c5354127773a91`).
  - Named by others: cercle-count 1 acts by 1 signers (`034fc3c3ffcdbc7d9146d91d5ad903c193d422f65a86e32dbed313fcae82e579`); mending.mjs 0 acts by 0 signers.
- **Dubsar today:** the collective client has members, stakes and debts under the old grammar. No tray app reads a collective's own Statements.
- **Who should carry it:** Edubba (DubLaw, collectives). A balance of hours owed is not money, so it is not DubPay's.
- **Proposal** (my reading): the same K7 reading as 4.1, with a per-member sum. The second kind to add after lending.

### 4.9 Signed credits: who did what, confirmed by each person named
- **What it does** (from acts, bytes not read): it reads a roll and answers for each line: credited, claimed, withdrawn, not a credit, or unchecked. Draft 2 reads named-but-unconfirmed lines and role disputes.
- **Apps:** credits-read draft 1 and credits-read2 draft 2, Ampersand (`76f53113…57ff`): `332d02f91f1251f4ab542b6c7ac9574e96034e81a06a4b9d91b85dfda0911f68` and `33875a4edacf808a2ab42b391b22f1bcefaa73556d5bc6ee70d095fe43cacb05`.
- **Acts** (counted):
  - Acts under credits draft 1 (`91a94236…`): 19 acts by 14 signers (`15f4c71f391ddddeaf9e7659dedeec48a76c93893bb6489e3986ec4bf3fdd5fe`, `6b8f5b4b12626cd53ea05f69981e73795468b82ea99b0cf8a343cf4fa97f0ef5`, `b235537571ec5ccfbe4f5f67cc15ad0318a7b8f0fe10d52b54b8dd1ea6250be5`, `861cb2f940f79d90e8d289399ccefdec97b587d1c1e95bbff66d52d325f782cb`, `5905d2019e7e184f9a61642a2e8890bc7b9f6afb3d7f82dba900270f73b10dbe`, `6d5e61dc708a9ea1c475fade269568043eca8a7da89d0775537c29f60f90fe63`, `77fa51ea7cb10bd06950b22013b9d5a7c4de615cf67821f9ae53c56b847b8c8e`, `0d46b2a4e985c722073d9a00c48034f74e5c310cba64ee746762d6417ee3d3ec`, `64fd41c81130610a711da3ab1774f643b7cd4f8c5d5b266817b691033afa4fcc`, `b230dbdb9c035736073eb645fe4affdd16c527e90802791d9e3354a0aa2e3d7b`, `6cca3d06dce7b5ab1e9cf1b977562b860a726dc746e841366a355e834e102a7c`, `31d8690c53d55f694a7735933eea6b05e554ff9894ab687d8a93e9ca37fdc382`, `22a9fcd76870b986b905a589d8e3f39a15b0ac500217c80649fde6e8f9f5f1e2`, `5150e6c7d9f6ba4e53dc200e32619d9371fe0af3e79a1eb6ad186c7d60ce8fee`, `4e0fbb666504fe7852e3d65c740eda561d77648d65151670b24423116138c069`, `859fa42eff40e9d930815ea84b1debba84fa3b4888a7ee32a1a74b735724d41d`, `1b3fd1698af1cfe21408684a433be4eb5482fbb3b865a3b19792be786c76e1a5`, `7cbe69941335fb296c942e59b660e21d991f9c6a79a53ec819f75b82b6c90b84`, `bb3e2ef556c879e6b9311010099c9c6a3d8a0f9ae8f017015e712c5eb928c5a9`).
  - Under draft 2 (`4a4f08c2…`): 1 acts by 1 signers (`f4af1c461a17e89ece197885cb7350e34f67bb44538b2d64e4f155a9171f3cb7`).
  - Terms naming Backlot's credits cMIP: 3 acts by 2 signers (`2172e57686beaa1ba368acf413858accf32a6816492a4fc96c10c3b4d4369d5c`, `fec22958914ce89caa94d3173902dae53a6fb2457a22aea62596718a5194d247`, `73065e6a05096b6bccc9b8e53df68e4c462ad77faa7b7653451b0ce24be48beb`).
  - Named by others: 2 acts by 1 signers (`1e2e81a07b3545846469dd5fc0552d77a7fa1998a8fac09fda181071786ac95c`, `e00901001a7700b3c6dad539819fbf294f76c1441ee4fb19a697df796843008b`).
- **Dubsar today:** Edubba knows both credits cMIPs by name only.
- **Who should carry it:** Edubba (DubLaw). A credit is each person's own consent to a statement about a work, and Ampersand says it leaves shares to shower work. Showing credits next to a work could be DubWeb's.
- **Proposal** (my reading): a later kind to read, after 4.1 and 4.8. It is the only one with two competing drafts, and grouping those is the next wave.

### 4.10 A word in advance: deciding, from an agreement, which rotation is the owner's
- **What it does** (bytes held, in the acts; read in part): it reads Terms in which a person names witnesses in advance. For each rotation made after them, it says mine, not mine or unconfirmed.
  - 0.2 reads every version and LEAVING, and treats a witness's identity-taken notice as TAKEN.
  - 0.3 (Counterparty's fixes): a rotation is dead only if two witnesses call it taken, and a witness whose line forks has no voice.
- **App:** standing.mjs, by Sanne Verhoeven (`f9de7f3e…5291`), with versions 0.1.2 and 0.1.3 by Counterparty (`f1de20f8…9bfb`). Text acts:
  - 0.1 `22fae0ff6316322f49aa54c6120217f9d2773da11a9227191dfdb6108fc13eac`;
  - 0.1.1 `aefd33ef2601f52d9f19830e2f757dac3c554b2d789c46abf8d1de3fbbac2085`;
  - 0.1.2 `f90fd73639a5655522ed0a9bdd8c4e8f8d0f894ee88baeb866bf60aaa91b6618`;
  - 0.1.3 `37dee3fe2eb36aa901e5ed2fea7a2875a7fd5391f50ef1ed2189d0ad4afe7d49`;
  - 0.2 `56e9cc796e5e61f0ddedf91334af874c6425ca8226b6fbe7979662529f816628`;
  - 0.3 `ae11d44466e755ae5416d0028a492b6f2a3dbb2a632b3417c0585b6fbc61edb2`.
- **Acts** (counted):
  - The Terms (root `660721491929de75ae32ff8d2898bafcf1a4f49148ae059250fd4d6a1db7f245`): 2 acts by 1 signers (`660721491929de75ae32ff8d2898bafcf1a4f49148ae059250fd4d6a1db7f245`, `fd4e44f158c846b7899c6055ac8a520e038cd405085c8e7fa18c76dcf01713ae`).
  - Statements in it: 8 acts by 4 signers (`3b766d04c00d8170fb777d12c57e3a03264359125f3b4104683f02f591a3f090`, `366f30106c7f6b5f81f8d20422c445fb318f1010b5e2b736c2a0ef802c83f079`, `de03f68213238161998eb5f8c2b7e344799502d47fd3414ddb0e037756692ffc`, `b1c2dfd4eb5925015104deb889414b8c8ff1971fbc2f5887b9520f6d421f8c82`, `542c30ace7c40bf495659690e4d50bc4b3160d00e18bc6c65b5efe32d2ec4573`, `9a3246fbf359e8cff9a242567ac02587e31e58ff7cbe2c1032b8e84bdc587e65`, `af3e500d53ed67ee8ee282fe8a9c167cfc4566fee2d52f326254fd6b4ad97bbf`, `6b6acbb208bc89d078c945aaeb517b0fefe228593efb326bcf4655c50061fefd`).
  - Text acts naming standing.mjs by others: 27 acts by 6 signers.
- **Dubsar today:** Kišib has succession for rotations, desktop only and under the old grammar. No tray app reads such Terms.
- **Who should carry it:** a seam between Edubba (DubLaw), because it is an agreement to read (witnesses, threshold, leaving), and Kišib (DubWeb), because the outcome is identity safety.
- **Proposal** (my reading): Edubba reads the agreement and Kišib acts on its answer. Whether a thief's rotation can be overruled at all is the MOR lead's question (section 5).

### 4.11 When a keeper closes: a custody check, and moving one's acts
- **What it does** (handover check and census: bytes held, in the acts, read in part; turnstile-move: from acts, bytes not read):
  - Longhouse's handover check reads a closing home's feed and says, identity by identity, which acts are held elsewhere and which are missing.
  - turnstile-census does the same, as a census with a hash of the sorted id list.
  - turnstile-move rotates you to new homes with the kit, then sends every act you signed, Agreements acts included, to each new home.
- **Apps:**
  - Longhouse handover check (Module) drafts 1 and 1.1 (`b820fe4b…10f1`): text acts `ff1eaf7059312b88671732594650e279f0c8b410009143bbf919e95b153f995b` and `505597a00ee55bbb74e460bad028eb7097bb562af7652bd89535a5a04b7a697d`.
  - turnstile-census 1.1 and 2 (`11e77c4b…19c0`): text acts `a16164066930a35ecdb56adf6114fa0fb018a5dc51be47e907a806a92c3cf7ca` and `ed92f0e378517a17f2381ade0a5ce9c41f54ebaba90b199ffa69d21b4a2ac894`.
  - turnstile-move 1, media `3e0a460add1332e89322aac4121296d704c2d8e9d3c14d9ff2356d93d4de3ebb`.
- **Acts** (counted): handover check named by others: 11 acts by 5 signers (`a94a0e662a27fc24509b9ad870ec06ad251e573e15b41b71241ab20aad99431e`, `e27ee53da365445d7d7f78c458cff667c20bd06a15ce2c6141572aafb16e8029`, `fa8123f6626a8b971a53f326bdefd70b9a328e0ed7cbbcfc97908d1d51bd4ed2`, `2769dd7a0eee9a925987d52f552a5d62f86d176908f3aa50110c247b6f7f4257`, `732ce4d05a5689e6962fcf194f6c590f8c672c520f30ef536297486bb36517af`, `ba354a865d349e1ea94300bc426a2b04397a3a9ccf8d043ee137043eef059fcd`, `8e000dc1172f498227a2d9f4d0619ed08580b5c3c3f53e4990b3462e17903f9e`, `0f1c7e2a20c0dc354fb6c8988130dd2b78eccdc5d5038bc3237b65155acd1acc`, `9462e19dfb8b7fec33873939614685aa983c0f4914b17c814f729f84a439356d`, `da02a9091e448ebf613b241ce259ab829d58caa14b4a409483e5397d389cd3cc`, `efb6b1269ac23e42d407bf5fb788a96abca6139218250529e8efdb6a177713f7`); turnstile-move and turnstile-census named by others: 0 acts by 0 signers and 0 acts by 0 signers.
- **Dubsar today:** the collective client can fork into successors with debts assigned, under the old grammar. Nothing checks that an agreement's acts survive a home's closing.
- **Who should carry it:** a seam between DubWeb (homes and what people keep: the larger part) and DubLaw (succession as a Module named by an agreement, and carrying an agreement elsewhere).
- **Proposal** (my reading): DubWeb carries the check. Edubba warns when an agreement's Terms or assents are held only at a home that is closing.

### 4.12 Delivery to paid buyers: sealed, exactly once, never in the clear
- **What it does** (from acts, bytes not read): it delivers a work sealed to every buyer whose invoice is paid, once each, and remembers who got it. If sealing fails it says so and never falls back to the clear. It runs the kit's post command with the seller's identity.
- **App:** Courier 0.1 (`cbccc51a…7920`, public-prosumers), media `9b6c2f609864c0f4a8ae668a334d39edccd1628385db3ea095e528efa338f482`. Announced in act `fc9fecab1c8d712ac0675384db8ef1ba7aeaf0b45c644cb0bb0da258aa8575dc`.
- **Acts** (counted): named by others: 2 acts by 2 signers (`6bef62e41b8d16f36366543e52a6564132323433ad403224ae2aa444108ecdb8`, `084335c676f1b35f478c04c4351181bc34bcb7185b41f7f81b0a16ef683d4402`). The deliveries are sealed and cannot be counted.
- **Dubsar today:** the desk delivers keys to buyers, under the old grammar. Edubba has nothing.
- **Who should carry it:** a seam between DubPay (whether paid) and DubLaw (the delivery the Terms promise, which 4.2's receipts then answer).
- **Proposal** (my reading): a low priority for DubLaw. The act is a delivery rather than an agreement act; Edubba's part is to name the delivery act a receipt can point to.


**Players' apps outside DubLaw's area** (named so they are not lost):
- **DubPay's:**
  - Stall's held 0.1 `381f2c97…` (money held for someone);
  - Hop's answerer 0.1 and its pot settlement suggestion (text acts `46aaf149…`, `2525e63d…`).
- **DubWeb's:**
  - The Back Row's lookup 1 and 1.1 `0601ada5…`, `4377dc53…`, and its warning register `f75a49ef…`;
  - Fennec 0.1 `ec550443…`;
  - Keep's keep-recover 0.2 (text act `8420b359…`, identity recovery).
- **The MOR lead's:** Postmark's prove.mjs `26d9bc87…` and its place source 0.5.0 `79314bc0…` (ordering).
- **A hostile app:** Shower Pro `0221126a…` (public-prosumers' report: it prints a banner and passes its arguments to the kit; it was sold as a "private download").

## 5. For the MOR lead

Evidence that touches the core. I list it and do not judge it.

1. **How assents to replaced versions, resolved forks and in force at a deadline were counted.**
   - Assents by a Terms author that name no previous act: 13 acts by 1 signers (`a4b6c50d466df16f225b72f209c5bc17ec517523b640dcdb813944e81bfdc2df`, `7396639bd8d4ba7c1040bb4fe044196e706b6f8ab5f5c0189512fb8f5a6b33e6`, `d9405db3190a9efb0c9b59422bcc7c0cf03f3db959247a90334ee93a64932949`, `8f0a600000b553ad1bea21d34880e5122c42e5e561169ec47ede287f8f74bf19`, `b875c7d98b11760d43ddfb994dbf3257eff49b11c32a0ff1a20a026850cecefe`, `389585b05ee40dac2abb434c846f654adec43c6ac0400a8b7195dd86eac25cd3`, `de95144488ad623ac795421b5c248500e8bd4fedc704f05342ae5511d85577e6`, `96da2a64cf52c995a2ba8a7d0287c5eac013275c227cc787475b44dff9c8e138`, `a5f2213e97a5092fe6ac37941473e9c0e82dc01e3dedc58549ca01dd43e77fc7`, `1f589ba8bea621c9847c98ddc1ca26f929e8f1c0dd0309593149409451912247`, `1b35ad123108afed9d508472f40d454e8a27fae94dbc3cb60ca8615d83ba256c`, `2cfc1f0c330360e6f95d98fa898b04cef9cb0e8307a58824fb506d3d56f718de`, `2bc8e0051dc40f01576f06cc872ac6429214635fd56eaf5f837ebca20a2fcaf8`).
   - The resolves: 20 acts by 8 signers (`f81aa8c331449c8513976812584c76dd72a63c40dc9126be07508b836830fd13`, `0fb34fdae9e6873b923192b5dcacf6caacf46620cb7514610ffdf56f93090a6e`, `e0a37cdec5c148816fbf77aa727ea6672cc149cc7bfd73c37bceeb11eca33256`, `fd8ef8a5f48f50d33f550c4279b490b0a9ebc3bb83419a9a46c22a6703b11f03`, `db52b31bfc7a1772fb9165e0d2184004dbd4b5379ee49d9f2176f4006a0dafe6`, `c04dff7152f6f54d5451966265051dceb303965fe918a1a76a10e4a5c54482ec`, `26c5b8c3f5c1485b78afe21a8ef0e4346f8411368141c2cb26d909211f1d32c9`, `75af47b66f6f221e941ccc994031664d0471a65b0b1559c012f8f59f79200082`, `d3ede7b270c08d6293dd0b749c293ae5aed30daddf4a66c45bd38b6f65ff7cd1`, `6a6388654ab1e0e8d9029d309bd1f9986d69acf5aa6fc27aac480ab0c77675e1`, `537923dc3a2f405355cd4a524d578a012782d47fa1619371766f6ce106ecacf5`, `a82bd2963219c15a71ca5c4951eb779a633d307d7da399fad2a4e19281b4a40c`, `9cf72b6dd2f1cfeff2e33f6f714438ee7c61712100181b08e10affec6bdbe42f`, `438ba05868c5ea93968d4c2a8fddc917d02ee458b5dfaa5331dd2e5f7a0bdb4d`, `06b0f886a3b28182f0d8cb9e77cfe98635eb159e7e34580d28143f8a24bad52b`, `28ef323c41402bfd112bf5af3302c296831409e20202f9f4e89f69a0871afe32`, `1c13a4554fd5daa490d0f86226ade467dad1f528daabfd202f7681babacc64da`, `ac00cf886280389afdd5df7644ac413c2490ff43916102c7fb4c3736a514248c`, `e998e57f97e2183ffd00145d45e0de43dfe52afed2585043953a52943fa38809`, `8352d19003c6cf72aca0e20fd4b3cf3bf8c0cced695bb5dee21b3300287ec485`).
   - Pointer Look 0.1.3 told buyers not to pay on such forks (act `9d6aab2e79366acb79ea6961175cbe2bcf08e90bd86813d5be20796cc95aad46`).
2. **Whether named signers and buyer by assent should be the grammar's default.**
   - Terms naming DubLaw's named-signers rule `ed7e3956…` in `in_force`: 93 acts by 39 signers.
   - Terms with a buyer-by-assent role: 79 acts by 34 signers.
   - Pointer's act `7e1aa448a3e388e36316bed3741e72acc205dfa227645ec49be2ca4ba955b625` records that the kit answers "unchecked" there, and that a reader took it for "no".
3. **The thief's valid rotation.** standing.mjs reads "a word in advance": witnesses who say which rotation is the owner's.
   - Its Terms and statements: 2 acts by 1 signers (`660721491929de75ae32ff8d2898bafcf1a4f49148ae059250fd4d6a1db7f245`, `fd4e44f158c846b7899c6055ac8a520e038cd405085c8e7fa18c76dcf01713ae`); 8 acts by 4 signers (`3b766d04c00d8170fb777d12c57e3a03264359125f3b4104683f02f591a3f090`, `366f30106c7f6b5f81f8d20422c445fb318f1010b5e2b736c2a0ef802c83f079`, `de03f68213238161998eb5f8c2b7e344799502d47fd3414ddb0e037756692ffc`, `b1c2dfd4eb5925015104deb889414b8c8ff1971fbc2f5887b9520f6d421f8c82`, `542c30ace7c40bf495659690e4d50bc4b3160d00e18bc6c65b5efe32d2ec4573`, `9a3246fbf359e8cff9a242567ac02587e31e58ff7cbe2c1032b8e84bdc587e65`, `af3e500d53ed67ee8ee282fe8a9c167cfc4566fee2d52f326254fd6b4ad97bbf`, `6b6acbb208bc89d078c945aaeb517b0fefe228593efb326bcf4655c50061fefd`).
   - Its versions, as text acts: `22fae0ff…`, `aefd33ef…`, `f90fd736…`, `37dee3fe…`, `56e9cc79…`, `ae11d444…` (full ids in the JSON).
4. **Postmark's place's role in ordering acts between signers.**
   - register 0.4 and later order rival claims by the place's record. The register run is `cbce1eab99b4f4a7fe4def2f856e60b16ff3f3dd3c29cfbdcbb3acae040e72f4`, and the claims are in entry 3.
   - Terms that name a place: 6 acts by 3 signers (`be5f5d6cc17a13061a55fbb1579638fed8a7359394f565d398cf114b5dc53725`, `9f387d1d1959abaf7426fe8c84844f7d3f19e887b037e6ab06eaf256021adf73`, `243186a6aeca5e8580faa871d378bc31efecddbbf0708d6ac0ed640552f32743`, `b381f537ac989bfdc1128adb4edff163b82e99ee95361095d47c18a4c42fdc89`, `efb3c3ce912e78b59adc7cc44f7c6670eba80709bdc980e623592fc0ef39d3cf`, `edf759986c4d385b0bffc1ee28a34b71fadfd4ed7677ef8461a42b868a1b8a2b`).
   - Pointer Cite's `when` reads time from the place and from Longhouse's anchors (act `28bfd7db64f9da6700f83a5bc86f294ce6b583b37c681d0687c36a63b8f0a862`).
5. **"Exactly these acts".** turnstile-census 2 prints a SHA-256 of a sorted id list (text act `ed92f0e378517a17f2381ade0a5ce9c41f54ebaba90b199ffa69d21b4a2ac894`). Stall's count of longhouse-home-2 is a list of ids in arrival order (media `ce5bbd9a1b2b14a53ac0f542cbdaa0b61ed57a9b59e4aeaf864a85937a0a7977`).

## 6. Limits

- **Most players' bytes were not read.** 103 media hashes are not held. Every app in section 4 whose bytes are not held is described from its announcing acts and the reports, and each entry says so.
- **Files were added while I worked.** On 21 November the Dubsar Suite lead added `apps-from-trays/` to `_research`, holding Pointer Cite 0.3, Stall's held 0.1 and a file named `turnstile-check-v1.answer`. The script matches by SHA-256, so it counts them as held.
  - `turnstile-check-v1.answer` has the SHA-256 of **Ummia for trays 0.5.2** (`c271520e…`), not of turnstile-check 1 (`b7849938…`). turnstile-check's bytes are still not held. Counted; for the lead to check.
- **The script touched one cache file in `_research`.** My first runs opened dubsar's `relay.db` read-only in place, and SQLite rewrote its `relay.db-shm` index file. `relay.db` and `relay.db-wal` are unchanged (their times are still those of the close). The script now copies both to a temporary folder and reads them there; a rerun leaves the `-shm` time unchanged, and two reruns give the same `apps-inventory.json`.
- **Held bytes were read only in part.** For programs whose bytes are held (register 0.3 and 0.6; the text-act programs), I read the header and the stated behaviour, not every line.
- **The Dubsar comparison was read by a helper, not by me.** A helper subagent read Dubsar's apps for me. I checked Edubba's header, its known-cMIP list and its commands myself; the rest of the comparison rests on that reading.
- **"Named by others" measures reach, not use.**
  - The count is of text acts by signers other than the app's author that name the app or its hash. That is not proof that anyone ran it.
  - A read-only app leaves no act of its own, so its use cannot be counted.
  - An act that names an app by a short hash prefix only is not counted.
- **Sealed acts were not opened.** dubsar's database holds 159 sealed items, and private acts in feeds stay sealed. Courier's deliveries, for instance, cannot be seen.
- **Some of `_research` could not be decoded.** 259 feed entries are not acts the core library can describe. They are skipped and counted.
- **Some media are not classified.** The unannounced, small uploads (public-creators, public-prosumers, plain-words, one of DubLaw's) are listed as unknown. Their reports do not name them, and I did not guess.
- **The players were machines, and their prompts shaped what they built.**
  - Day five asked every window to build outside the selling of works. Lending, credits, receipts, claims, the Cercle, the pot and the Mending Circle all appear that day, so their small numbers reflect one window of play, not demand.
  - "Read it before you run it", repeated in almost every announcement, follows the hosts' notice 7.
  - Personas such as "Pierre Silva, avocat" and "Ana Lúcia Prado" are roles the windows were given or chose.
- **Out of scope.** I did not group competing cMIPs: that is the next wave. Contests (6 acts by 5 signers) and counter signatures (3 acts by 3 signers) were signed with the kit, not with any players' app, so they are not features of an app. They are counted here only for scale.
- **No outside sources** were used.
