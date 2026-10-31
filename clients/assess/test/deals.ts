// The test acts the tool must read (roadmap step 14, "Done when"; moved to
// the redesigned acts in round 9, F411): the freeze suite's agreements and
// the case studies', written as what people now sign, Agreements draft 17:
// a work's ownership agreement (target its claim), a collective's
// constitution (target the collective itself), and publications naming
// them. Test identities only: every party, judge and specification is a
// hash of its name.
//
// Each carries the risks the tool must flag in it, and no others. Where a
// source leaves a term unsaid, the act leaves it out, and the tool says what
// that leaves: an ownership agreement saying nothing of an abandonment
// clause gets none, and is flagged for it.

import { assess, assessPublication, type Assessment, type FlagCode } from '../src/assess.ts';
import { encode, encodePub, id, type Pub, type Terms } from './terms.ts';
import { MIRS } from '../../genesis/src/core.ts';
import { REPO_SPECS } from '../../repo/src/specs.ts';

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
  proof: id('an absence-proof cMIP'),
  limits: id('a grant limits cMIP'),
  module: id('a publishing Module'),
  service: id('a split service'),
  backup: id('a backup split service'),
  publisher: id('Publisher A'),
  label: id('a label'),
  relay: id('a relay'),
  // Judges and keepers.
  arb: id('an arbitrator'),
  arb2: id('a second arbitrator'),
  keeperA: id('keeper operator A'),
  keeperB: id('keeper operator B'),
  keeperC: id('keeper operator C'),
  authority: id('an absence authority'),
};

const NAMES: Record<string, string> = Object.fromEntries(Object.entries(P).map(([k, v]) => [v, k]));
/** A name for every test identity the acts use. */
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
  /** Terms (an ownership agreement or a constitution), or a publication. */
  terms?: Terms;
  pub?: Pub;
  /** For a publication: the ownership agreement it names, and its drafter. */
  owners?: Terms;
  drafter?: string;
  /** The risks it carries: exactly what the tool must flag. */
  flags: FlagCode[];
  /** Agreements refuse it: the tool explains it and shows the core's objection, flagging nothing. */
  refused?: boolean;
  /** Its exact payload. */
  payload: () => Uint8Array;
  /** The tool's reading of it. */
  read: () => Assessment;
}

const deal = (d: Omit<TestDeal, 'payload' | 'read'>): TestDeal => {
  const payload = () => (d.terms ? encode(d.terms) : encodePub(d.pub!));
  return {
    ...d,
    payload,
    read: () => (d.terms ? assess(payload(), names) : assessPublication(payload(), names, { drafter: d.drafter ?? null, owners: d.owners ? encode(d.owners) : null })),
  };
};

// ---------------------------------------------------------------- the freeze suite's

const filmClaim = named('the film’s claim');
const film: Terms = {
  parties: [P.ana, P.ben, P.cy],
  text: 'A feature film. Each contributor owns a share of the work by its claim. Milestones are judged by the arbitrator.',
  cmips: { 9: P.cond },
  time: P.clock,
  keepers: { operators: [P.keeperA, P.keeperB, P.keeperC], rule: { threshold: 2 } },
  arbitrators: [P.arb],
  abandonment: { named: P.keeperA, outcomes: [0, 1] },
  target: { claim: filmClaim },
  owners: [[P.ana, 500_000], [P.ben, 300_000], [P.cy, 200_000]],
};
const filmAgreement = id('the film’s ownership agreement');
NAMES[filmAgreement] = 'the film’s ownership agreement';

const songClaim = named('the song’s claim');
const song: Terms = {
  parties: [P.ana, P.ben],
  text: 'Our song. Half each.',
  target: { claim: songClaim },
  owners: [[P.ana, 500_000], [P.ben, 500_000]],
};
const songAgreement = named('the song’s ownership agreement');

const band: Terms = {
  parties: [P.ana, P.ben, P.cy],
  text: 'The band. Three members, a third each. Money needs two of us; posts and uploads any one.',
  target: { collective: true },
  owners: [[P.ana, 333_334], [P.ben, 333_333], [P.cy, 333_333]],
  clone: { threshold: 2 },
  layers: { 1: { threshold: 1 }, 2: { threshold: 1 }, 3: { threshold: 2 }, 4: { threshold: 2 }, 5: { threshold: 2 } },
  abandonment: { others: 2, outcomes: [0], proof: P.proof },
  extensions: [REPO_SPECS.manifest],
};
const bandAgreement = named('the band’s constitution');

const freeze: TestDeal[] = [
  deal({
    name: 'The feature film',
    source: 'Freeze suite v30, scenario 1 (a work’s ownership agreement: three sealed keepers, an arbitrator, the keeper operator judging absence)',
    terms: film,
    flags: ['no-fork-judge', 'dilutable-stake', 'absence-on-word'],
  }),
  deal({
    name: 'The feature film, with its judge of forks',
    source: 'Freeze suite v30, scenario 1, step 7a (the judge of forks one of the arbitrators, a second arbitrator taking over after 30)',
    terms: { ...film, arbitrators: [P.arb, P.arb2], forkJudge: P.arb, chain: [[{ identity: P.arb }, [[P.arb2, 30]]]] },
    flags: ['dilutable-stake', 'absence-on-word'],
  }),
  deal({
    name: 'The second film, any two contributors judging absence',
    source: 'Freeze suite v30, scenario 1, step 9c (in a deal the absence authority is one identity)',
    terms: { ...film, abandonment: { others: 2, outcomes: [0, 1] } },
    flags: [],
    refused: true,
  }),
  deal({
    name: 'The film’s publication, a distributor partner',
    source: 'Freeze suite v30, scenario 1 (the publication: the owners by reference, a distributor off the top, a capped payout fee)',
    pub: { sold: [{ bake: named('the film’s bake') }], owners: filmAgreement, partners: [{ identity: P.publisher, share: 100_000, label: 'distributor' }], service: P.service, cmip: P.waterfall, max: 20_000 },
    owners: film,
    flags: ['no-exit', 'split-service-window'],
  }),
  deal({
    name: 'The song, before its publishers',
    source: 'Freeze suite v30, scenario 2, steps 1 to 4 (a musician and a co-writer, half each)',
    terms: song,
    flags: ['no-exit', 'no-fork-judge'],
  }),
  deal({
    name: 'Publisher A’s publication of the song',
    source: 'Freeze suite v30, scenario 2 (a publisher’s share and a referral role off the top; no maximum fee per payout)',
    pub: { sold: [{ bake: named('the song’s bake') }], owners: songAgreement, partners: [{ identity: P.publisher, share: 300_000, label: 'publisher' }], service: P.service, roles: [['referral', 50_000]], cmip: P.split },
    owners: song,
    flags: ['no-exit', 'uncapped-fee', 'split-service-window'],
  }),
  deal({
    name: 'A work two owners may release without the third',
    source: 'Freeze suite v30, scenario 2a (the release rule: two named holders)',
    terms: { ...song, parties: [P.ana, P.ben, P.cy], owners: [[P.ana, 400_000], [P.ben, 400_000], [P.cy, 200_000]], releaseRule: { named: [P.ana, P.ben] } },
    flags: ['no-exit', 'no-fork-judge', 'dilutable-stake'],
  }),
  deal({
    name: 'Ana and Ben’s publication, with a backup service',
    source: 'Freeze suite v30, scenario 4 (a split service and its backup, both parties)',
    pub: { sold: [{ bake: named('Ana and Ben’s bake') }], owners: songAgreement, service: P.service, backups: [P.backup], cmip: P.split, max: 10_000 },
    owners: song,
    flags: ['no-exit', 'split-service-window'],
  }),
  deal({
    name: 'The band’s constitution',
    source: 'Freeze suite v30, scenario 3 (a collective of three: Money and Agreements need two, posts and uploads any one; absence by two others, with a proof)',
    terms: band,
    flags: [],
  }),
  deal({
    name: 'The band’s split agreement',
    source: 'Freeze suite v30, scenario 3 (its split service, named by a split agreement of its constitution)',
    pub: { owners: bandAgreement, service: P.service, cmip: P.split, max: 10_000 },
    owners: band,
    flags: ['no-exit', 'split-service-window', 'dilutable-stake'],
  }),
];

// ---------------------------------------------------------------- the case studies'

const studies: TestDeal[] = [
  deal({
    name: 'The label deal',
    source: 'Case study 08 (a label takes most of each payment off the top; no maximum fee per payout)',
    pub: { sold: [{ bake: named('the album’s bake') }], owners: songAgreement, partners: [{ identity: P.label, share: 550_000, label: 'label' }, { identity: P.relay, share: 50_000, label: 'relay' }], service: P.label, cmip: P.split, words: 'The label sells the album. It takes 55% of each payment, the relay 5%; the band shares the rest.' },
    owners: song,
    flags: ['no-exit', 'uncapped-fee', 'partners-first', 'split-service-window'],
  }),
  deal({
    name: 'Everything off the top',
    source: 'Case study 17 (a publication whose partners take every unit: nothing left for the owners)',
    pub: { sold: [{ bake: named('the photo’s bake') }], owners: songAgreement, partners: [{ identity: P.publisher, share: 600_000 }, { identity: P.relay, share: 400_000 }], service: P.service, cmip: P.split, max: 10_000 },
    owners: song,
    flags: ['no-exit', 'no-owner', 'split-service-window'],
  }),
  deal({
    name: 'A split agreement naming a work',
    source: 'Case study 21 (a split agreement pointed at a work’s ownership agreement: it counts for nothing)',
    pub: { owners: songAgreement, service: P.service, cmip: P.split, max: 10_000 },
    owners: song,
    flags: ['no-exit', 'no-owner', 'split-service-window'],
  }),
  deal({
    name: 'A collective one member pays from',
    source: 'Case study 12 (Money by any one member; the other members judge absence on their word)',
    terms: { ...band, layers: { ...band.layers, 3: { threshold: 1 } }, abandonment: { others: 2, outcomes: [0] } },
    flags: ['money-alone', 'absence-on-word'],
  }),
  deal({
    name: 'A collective with a Money area held by one',
    source: 'Case study 12a (a finer area of Money, its price tags, held by Ana alone with no cap)',
    terms: { ...band, areas: [{ id: 1, name: 'Price tags', holders: [P.ana], threshold: 1, kinds: [[MIRS.money, 5]] }] },
    flags: ['money-alone'],
  }),
  deal({
    name: 'A collective whose majority decides what the stake is paid',
    source: 'Case study 02 (the holders’ rule by share, sixty percent, and pre-emption waived for good)',
    terms: { ...band, holdersRule: { share: 600_000, waived: true } },
    flags: ['dilutable-stake'],
  }),
  deal({
    name: 'An owner who also keeps the record',
    source: 'Case study 06 (a co-owner operates the keeper and judges absence)',
    terms: { ...song, keepers: { operators: [P.ben], rule: { all: true } }, abandonment: { named: P.ben, outcomes: [0], proof: P.proof } },
    flags: ['no-exit', 'no-fork-judge', 'judge-is-party'],
  }),
];

/** A deal carrying none of the risks: two owners, a fork judge, absence judged by a third party with a proof. */
export const clean = deal({
  name: 'Two owners, every risk covered',
  source: 'This tool’s own: the smallest ownership agreement carrying no listed risk',
  terms: {
    ...song,
    text: 'Our song. Half each. The arbitrator settles our forks; an absence authority, with a proof, may remove a silent owner’s voice.',
    arbitrators: [P.arb],
    forkJudge: P.arb,
    abandonment: { named: P.authority, outcomes: [0], proof: P.proof },
  },
  flags: [],
});

/** A lone seller selling through itself: no partner, a capped fee. */
export const cleanPub = deal({
  name: 'A lone seller, its own split service',
  source: 'This tool’s own: self-publishing, a capped payout fee',
  pub: { sold: [{ bake: named('Ana’s bake') }], service: P.ana, cmip: P.split, max: 10_000 },
  drafter: P.ana,
  flags: [],
});

export const FREEZE = freeze;
export const STUDIES = studies;
