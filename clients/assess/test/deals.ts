// The test agreements the tool must read (roadmap step 14, "Done when"): the
// freeze suite's deals (spec/03-MOR-freeze-test-suite-v21.md) and the case
// studies' agreements (docs/case-studies, the latest draft of each), written
// as terms. Test identities only: every party, judge and specification is
// a hash of its name.
//
// Each carries the risks the tool must flag in it, and no others. Where a
// source leaves a term unsaid, the terms leave it out, and the tool says
// what that leaves: a case study saying nothing of an abandonment clause
// gets none, and is flagged for it.
//
// Agreements draft 12 (F280): a share paying anyone but a stake is taken off
// the top, as overhead, in millionths of the payment (as the split cMIP draft
// 1 reads key 4). Five plans that put a role or a named receiver in the rest
// are written so; the case studies they come from (02's song, 08, 12, 17, 21)
// are listed in docs/f270-build.md for a later pass.

import { encode, id, type Terms } from './terms.ts';
import type { FlagCode } from '../src/assess.ts';

export const P = {
  ana: id('Ana'),
  ben: id('Ben'),
  cy: id('Cy'),
  dee: id('Dee'),
  // Specifications (cMIPs) and services.
  pay: id('a payment cMIP'),
  clock: id('a block-height time reference'),
  cond: id('a condition cMIP'),
  split: id('a split cMIP'),
  waterfall: id('a waterfall split cMIP'),
  anchor: id('an anchoring cMIP'),
  proof: id('an absence-proof cMIP'),
  ext: id('an extension'),
  module: id('a publishing Module'),
  // Judges and keepers.
  arb: id('an arbitrator'),
  arb2: id('a second arbitrator'),
  keeperA: id('keeper operator A'),
  keeperB: id('keeper operator B'),
  keeperC: id('keeper operator C'),
  authority: id('an absence authority'),
};

const NAMES: Record<string, string> = Object.fromEntries(Object.entries(P).map(([k, v]) => [v, k]));
/** A name for every test identity the deals use. */
export const names = (h: string): string => NAMES[h] ?? h.slice(0, 8);
const named = (name: string): string => {
  const h = id(name);
  NAMES[h] = name;
  return h;
};

export interface TestDeal {
  name: string;
  /** Where it comes from: a freeze suite step, or a case study and its draft. */
  source: string;
  terms: Terms;
  /** The risks it carries: exactly what the tool must flag. */
  flags: FlagCode[];
  /** Agreements refuse it: the tool explains it and shows the core's objection, flagging nothing. */
  refused?: boolean;
  payload: () => Uint8Array;
}

const deal = (d: Omit<TestDeal, 'payload'>): TestDeal => ({ ...d, payload: () => encode(d.terms) });

// ---------------------------------------------------------------- the freeze suite's deals

const film: Terms = {
  parties: [P.ana, P.ben, P.cy],
  text: 'A feature film. Each contributor binds the work by its claim. Milestones are judged by the arbitrator.',
  cmips: { 6: P.pay, 8: P.waterfall, 9: P.cond },
  time: P.clock,
  keepers: { operators: [P.keeperA, P.keeperB, P.keeperC], rule: { threshold: 2 } },
  arbitrators: [P.arb],
  abandonment: { named: P.keeperA, outcomes: [0, 1] },
  stakes: [[named('the film'), [[P.ana, 500_000], [P.ben, 300_000], [P.cy, 200_000]]]],
  plan: { shares: [{ stake: 0, part: 1 }], cmip: P.waterfall, max: 20_000 },
  payeeGrants: [named('grant: Ana to the film service'), named('grant: Ben to the film service'), named('grant: Cy to the film service')],
};

const freeze: TestDeal[] = [
  deal({
    name: 'The feature film',
    source: 'Freeze suite v21, scenario 1, steps 1 to 3 and 9 (a deal: three sealed keepers, an arbitrator, the keeper operator judging absence)',
    terms: film,
    flags: ['no-fork-judge', 'dilutable-stake', 'absence-on-word', 'split-service-window'],
  }),
  deal({
    name: 'The feature film, with its judge of forks',
    source: 'Freeze suite v21, scenario 1, step 7a (the judge of forks one of the arbitrators, a second arbitrator taking over after 30)',
    terms: { ...film, arbitrators: [P.arb, P.arb2], forkJudge: P.arb, chain: [[{ identity: P.arb }, [[P.arb2, 30]]]] },
    flags: ['dilutable-stake', 'absence-on-word', 'split-service-window'],
  }),
  deal({
    name: 'The second film, any two contributors judging absence',
    source: 'Freeze suite v21, scenario 1, step 9c (B19: in a deal the absence authority is one identity)',
    terms: { ...film, abandonment: { others: 2, outcomes: [0, 1] } },
    flags: [],
    refused: true,
  }),
  deal({
    name: 'The film cloned onto its clock as payment cMIP',
    source: 'Freeze suite v21, scenario 1, step 7 (Q24, Q25: a judge never handles what it judges)',
    terms: { ...film, cmips: { 6: P.clock, 8: P.waterfall, 9: P.cond } },
    flags: [],
    refused: true,
  }),
  deal({
    name: 'The song, before its publishers',
    source: 'Freeze suite v21, scenario 2, steps 1 to 4 (a musician and a co-writer, a referral role share, a split service)',
    terms: {
      parties: [P.ana, P.ben],
      text: 'Our song. Half each. A referrer who led to a sale is paid five percent.',
      cmips: { 6: P.pay, 8: P.split },
      stakes: [[named('the song'), [[P.ana, 500_000], [P.ben, 500_000]]]],
      plan: { shares: [{ stake: 0, part: 1 }, { role: 'referral', part: 50_000 }], cmip: P.split, top: [1], max: 10_000 },
      payeeGrants: [named('grant: Ana to the song service'), named('grant: Ben to the song service')],
    },
    flags: ['no-exit', 'no-fork-judge', 'split-service-window'],
  }),
  deal({
    name: "Publisher A's publication of the song",
    source: "Freeze suite v21, scenario 2, step 3, and 7.8 (the song's agreement a party; the publisher's fee by its Module)",
    terms: {
      parties: [named("the song's agreement"), named('publisher A')],
      text: "Publisher A publishes the song. The song's agreement takes 85%, the publisher 15%.",
      cmips: { 6: P.pay, 8: P.split },
      stakes: [[named("publisher A's publication"), [[id("the song's agreement"), 850_000], [id('publisher A'), 150_000]]]],
      plan: { shares: [{ stake: 0, part: 1 }], cmip: P.split, max: 10_000 },
      fees: [[P.module, 2]],
      payeeGrants: [named('grant: the song to the publication service'), named('grant: publisher A to the publication service')],
    },
    flags: ['no-exit', 'no-fork-judge', 'split-service-window'],
  }),
  deal({
    name: 'The label',
    source: 'Freeze suite v21, scenario 3, steps 1, 7r, 7t and 7v (a collective of three: a release manager, a treasurer holding the Money lane and the split plan, a third-party absence authority)',
    terms: {
      parties: [P.ana, P.ben, P.cy],
      text: 'The label publishes its members’ records.',
      cmips: { 6: P.pay, 11: P.anchor },
      clone: { threshold: 2 },
      grammar: { signing: { threshold: 2, members: [P.ana, P.ben, P.cy] }, chainKey: { threshold: 3, members: [P.ana, P.ben, P.cy] }, recovery: { authority: P.authority } },
      abandonment: { named: P.authority, outcomes: [0] },
      arbitrators: [P.arb],
      extensions: [P.ext],
      areas: [
        { id: 1, name: 'Releases', holders: [P.ana], threshold: 1, layers: [4], fields: [17] },
        { id: 2, name: 'Money', holders: [P.ben], threshold: 1, layers: [2], fields: [8] },
      ],
      stakes: [[null, [[P.ana, 400_000], [P.ben, 300_000], [P.cy, 300_000]]]],
      plan: { shares: [{ stake: 0, part: 1 }], cmip: P.split },
      splitGrant: named('grant: the label to its split service'),
    },
    flags: ['uncapped-fee', 'dilutable-stake', 'absence-on-word', 'split-service-window'],
  }),
  deal({
    name: 'A work two owners may release without the third',
    source: 'Freeze suite v21, scenario 3, step 9c (owners at 50/40/10, the third holding a stake without being a party; here a release rule naming the two)',
    terms: {
      parties: [P.ana, P.ben],
      text: 'Ana and Ben may release the work to the public domain together.',
      stakes: [[named('the released work'), [[P.ana, 500_000], [P.ben, 400_000], [P.cy, 100_000]]]],
      releaseRule: { named: [P.ana, P.ben] },
    },
    // No uncapped fee: Cy, who is no party, signs a version adding a fee
    // (Agreements draft 12, rule 48, F270), which the core now refuses
    // without Cy.
    flags: ['no-exit', 'no-fork-judge', 'dilutable-stake', 'payer-side-split'],
  }),
  deal({
    name: 'Two musicians, half each',
    source: 'Freeze suite v21, scenario 3, step 9o (two musicians, 50/50, cloned later to 60/40)',
    terms: {
      parties: [P.ana, P.ben],
      text: 'Two musicians share a song, half each.',
      stakes: [[named('the duo song'), [[P.ana, 500_000], [P.ben, 500_000]]]],
    },
    flags: ['no-exit', 'no-fork-judge', 'payer-side-split'],
  }),
  deal({
    name: "Ana and Ben's deal, with a backup service",
    source: 'Freeze suite v21, scenario 3, steps 9t and 9u, and 7.8b (one grant per payee to service S, a backup T)',
    terms: {
      parties: [P.ana, P.ben],
      text: 'Ana 60%, Ben 40%. Service S splits; T if S fails.',
      cmips: { 8: P.split },
      stakes: [[named('the work'), [[P.ana, 600_000], [P.ben, 400_000]]]],
      plan: { shares: [{ stake: 0, part: 1 }], cmip: P.split, max: 5_000 },
      payeeGrants: [named('grant: Ana to S'), named('grant: Ben to S')],
      backups: [[named('grant: Ana to T'), named('grant: Ben to T')]],
    },
    flags: ['no-exit', 'no-fork-judge', 'split-service-window'],
  }),
];

// ---------------------------------------------------------------- the case studies' agreements

const band = named('the band');
const label = named('the label');
const team = named('the team');
const streamer = named('the streamer');
const worker = named('the handyman');
const client = named('the client');
const platform = named('the platform');
const jury = named('a jury of peers');
const club = named('the club');
const dario = named('Dario');
const priya = named('Priya');
const [m2, m3, m4] = [named('a second maintainer'), named('a third maintainer'), named('a fourth maintainer')];
const [past1, past2] = [named('a past contributor'), named('another past contributor')];
const foundation = named('the foundation');
const university = named('the university');
const noor = named('Noor');
const studio = named('the studio');
const store = named('the PC store');
const [lea, max, tom] = [named('a first writer'), named('a second writer'), named('the drummer')];

const studies: TestDeal[] = [
  deal({
    name: "A song's agreement in the band",
    source: 'Case study 08, draft 4, section 2 (40% for each writer, 20% for the drummer; a split service by grant, backups in the split cMIP; a referral share, a "tools used" receiver, module fees, a cut capped by the plan)',
    terms: {
      parties: [lea, max, tom],
      text: 'Our song: 40% to each writer, 20% to the drummer.',
      cmips: { 8: P.split },
      stakes: [[named('the band’s song'), [[lea, 400_000], [max, 400_000], [tom, 200_000]]]],
      plan: { shares: [{ stake: 0, part: 1 }, { role: 'referral', part: 50_000 }, { receiver: named('the preset maker'), part: 50_000 }], cmip: P.split, top: [1, 2], max: 10_000 },
      fees: [[P.module, 1]],
      payeeGrants: [named('grant: writer 1'), named('grant: writer 2'), named('grant: drummer')],
      backups: [[named('backup: writer 1'), named('backup: writer 2'), named('backup: drummer')]],
    },
    flags: ['no-exit', 'no-fork-judge', 'split-service-window'],
  }),
  deal({
    name: 'The label deal',
    source: 'Case study 08, draft 4, section 3 (split, conditions and time reference cMIPs; a keeper; the label recouping first, then 80%; a maximum fee per payout)',
    terms: {
      parties: [label, band],
      text: 'The label advances the recording and is repaid first. Then it takes 80% of the release.',
      cmips: { 8: P.split, 9: P.cond },
      time: P.clock,
      keepers: { operators: [P.keeperA], rule: { all: true } },
      stakes: [[named('the release'), [[label, 800_000], [band, 200_000]]]],
      plan: { shares: [{ stake: 0, part: 90 }, { receiver: label, part: 10 }], cmip: P.split, top: [1], max: 10_000 },
      payeeGrants: [named('grant: the label'), named('grant: the band')],
    },
    flags: ['no-exit', 'no-fork-judge', 'split-service-window'],
  }),
  deal({
    name: 'The coproduction',
    source: 'Case study 09, draft 4, section 5 (streamer 60%, team 40%; the streamer recoups first; milestones on a time reference; a keeper)',
    terms: {
      parties: [team, streamer],
      text: 'The streamer finances the series and is repaid first; then 60% to the streamer, 40% to the team. Each episode is delivered by its milestone.',
      cmips: { 8: P.split, 9: P.cond },
      time: P.clock,
      keepers: { operators: [P.keeperB], rule: { all: true } },
      stakes: [[named('the series'), [[streamer, 600_000], [team, 400_000]]]],
      plan: { shares: [{ stake: 0, part: 80 }, { receiver: streamer, part: 20 }], cmip: P.split, top: [1] },
      payeeGrants: [named('grant: the team'), named('grant: the streamer')],
    },
    flags: ['no-exit', 'no-fork-judge', 'uncapped-fee', 'split-service-window'],
  }),
  deal({
    name: 'A renovation job, its judges a chain',
    source: 'Case study 12, draft 5, sections 2 and 4 (the worker, the client and the platform that matched them; an arbitrator, then a jury, then the platform, each stage with a deadline)',
    terms: {
      parties: [worker, client, platform],
      text: 'Renovate the bathroom in three milestones. The platform takes its matching fee.',
      cmips: { 8: P.split, 9: P.cond },
      time: P.clock,
      arbitrators: [P.arb],
      chain: [[{ identity: P.arb }, [[jury, 14], [platform, 14]]]],
      plan: { shares: [{ receiver: worker, part: 900_000 }, { receiver: platform, part: 100_000 }], cmip: P.split, top: [0, 1], max: 10_000 },
      payeeGrants: [named('grant: the handyman'), named('grant: the client'), named('grant: the platform')],
    },
    flags: ['no-exit', 'no-fork-judge', 'judge-is-party'],
  }),
  deal({
    name: "The club's live rights",
    source: 'Case study 17, draft 5, section 2 ("free with a share": 20% of whatever Dario earns; tips split with a relay role share)',
    terms: {
      parties: [club, dario],
      text: 'Dario may stream the club’s matches. The club takes 20% of whatever he earns.',
      cmips: { 8: P.split },
      stakes: [[named("Dario's stream"), [[dario, 800_000], [club, 200_000]]]],
      plan: { shares: [{ stake: 0, part: 1 }, { role: 'relay', part: 50_000 }], cmip: P.split, top: [1], max: 10_000 },
      payeeGrants: [named('grant: the club'), named('grant: Dario')],
    },
    flags: ['no-exit', 'no-fork-judge', 'split-service-window'],
  }),
  deal({
    name: "The maintainers' collective",
    source: 'Case study 19, draft 3, section 4 (four maintainers; any two release; all four rotate, a fifth share in escrow; income split with shares for past contributors)',
    terms: {
      parties: [priya, m2, m3, m4],
      text: 'The library’s maintainers. Any two sign a release.',
      grammar: {
        signing: { threshold: 2, members: [priya, m2, m3, m4] },
        chainKey: { threshold: 4, members: [priya, m2, m3, m4] },
        recovery: { custodian: named('an escrow custodian'), grant: named('grant: escrow') },
      },
      abandonment: { named: P.authority, outcomes: [0] },
      areas: [{ id: 1, name: 'Releases', holders: [priya, m2, m3, m4], threshold: 2, layers: [4] }],
      stakes: [[null, [[priya, 300_000], [m2, 200_000], [m3, 200_000], [m4, 200_000], [past1, 50_000], [past2, 50_000]]]],
    },
    // The past contributors are no members: a version paying them less
    // needs their signature (F270, read for every holder who is no member:
    // reading, to confirm, docs/f270-build.md Q2), so neither the plan nor
    // the fees are flagged for them.
    flags: ['absence-on-word', 'payer-side-split'],
  }),
  deal({
    name: 'The award',
    source: "Case study 21, draft 2, section 5 (the foundation, the university and Noor; two milestone payments on a time reference; a keeper; the university's 15% overhead a line in it)",
    terms: {
      parties: [foundation, university, noor],
      text: 'The foundation awards $50,000 for a one-year pilot, in two payments, one per milestone. The university keeps 15% as overhead.',
      cmips: { 8: P.split, 9: P.cond },
      time: P.clock,
      keepers: { operators: [P.keeperC], rule: { all: true } },
      plan: { shares: [{ receiver: noor, part: 850_000 }, { receiver: university, part: 150_000 }], cmip: P.split, top: [0, 1] },
      payeeGrants: [named('grant: the university'), named('grant: Noor'), named('grant: the foundation')],
    },
    flags: ['no-exit', 'no-fork-judge', 'uncapped-fee'],
  }),
  deal({
    name: 'A game on the PC store',
    source: 'Case study 13, draft 3, section 3 (the PC store at 30%)',
    terms: {
      parties: [studio, store],
      text: 'The store sells the game and keeps 30% of each sale.',
      stakes: [[named('the game'), [[studio, 700_000], [store, 300_000]]]],
    },
    flags: ['no-exit', 'no-fork-judge', 'payer-side-split'],
  }),
];

// ---------------------------------------------------------------- a deal carrying none

/** A deal carrying none of the risks: a judge of forks who is no party, a chain behind it, an abandonment clause whose word an absence-proof cMIP checks, no stakes and no money divided. */
export const clean = deal({
  name: 'A service contract with nothing to flag',
  source: 'The tool’s own test: none of the risks',
  terms: {
    parties: [P.ana, P.ben],
    text: 'Ana designs Ben’s shop sign by the first of March.',
    cmips: { 9: P.cond },
    time: P.clock,
    arbitrators: [P.arb, P.arb2],
    forkJudge: P.arb,
    chain: [[{ identity: P.arb }, [[P.arb2, 30]]]],
    abandonment: { named: P.arb, outcomes: [0], proof: P.proof },
  },
  flags: [],
});

export const FREEZE = freeze;
export const STUDIES = studies;
