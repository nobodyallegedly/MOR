// Units, as pluggable as rails (the project lead, 17 October 2026). Every
// amount names its unit by its specification's hash (Money: `amount = [
// unit, value ]`), and a unit belongs to a units Module, which a person
// accepts or not. Damgar shows an amount only with its unit's name, from a
// units Module it knows and the person accepts; an amount in any other unit
// is shown as a number of an unknown unit, never as satoshis. Amounts in
// different units are never added or compared: an account shows one total
// per unit, side by side, and only a conversion act (the conversion cMIP)
// could ever read two together. Nothing here assumes a satoshi.

import { moneySpecs } from '../../genesis/src/core.ts';

export interface Unit {
  hash: string;
  /** Its name, as its units Module's text gives it. */
  name: string;
  /** How a person reads a whole number of it: singular and plural. */
  one: string;
  many: string;
  /** For a test network's unit: never the real thing (Money, "One name per unit"). */
  test: boolean;
  /** The network a rail address must name to carry it (the Bitcoin rail Modules' numbering), or none. */
  network?: number;
}

export interface UnitsModule {
  key: string;
  name: string;
  text: string;
  draft: number;
  does: string;
  units: Unit[];
}

const u = (moneySpecs() as { units: { bitcoin: string; testnet: string; signet: string; regtest: string } }).units;

/** The Bitcoin units Module, draft 1 (`modules/units-bitcoin-draft-1.md`): four units, one per network. */
export const BITCOIN_UNITS: UnitsModule = {
  key: 'bitcoin-units',
  name: 'Bitcoin units',
  text: 'modules/units-bitcoin-draft-1.md',
  draft: 1,
  does: 'The satoshi on Bitcoin, and the satoshi of each of Bitcoin’s test networks, which is not a satoshi: four units, each its own specification, so that a test payment can never pay a real debt.',
  units: [
    { hash: u.bitcoin, name: 'satoshi (Bitcoin)', one: 'satoshi', many: 'satoshis', test: false, network: 0 },
    { hash: u.testnet, name: 'satoshi (testnet)', one: 'testnet satoshi', many: 'testnet satoshis', test: true, network: 1 },
    { hash: u.signet, name: 'satoshi (signet)', one: 'signet satoshi', many: 'signet satoshis', test: true, network: 2 },
    { hash: u.regtest, name: 'satoshi (regtest)', one: 'regtest satoshi', many: 'regtest satoshis', test: true, network: 3 },
  ],
};

/** Every units Module Damgar knows: round 1 has one. A second is one more entry here, and in `specs.ts`. */
export const UNITS_MODULES: UnitsModule[] = [BITCOIN_UNITS];

export const unitOf = (hash: string): { unit: Unit; module: UnitsModule } | null => {
  for (const m of UNITS_MODULES) {
    const x = m.units.find((y) => y.hash === hash);
    if (x) return { unit: x, module: m };
  }
  return null;
};

export interface Amount {
  unit: string;
  value: number;
}

const grouped = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/**
 * An amount in words, with its unit: "1 500 regtest satoshis". A unit not
 * known or not accepted is never given a name: "1 500 of unit a652d37a… (a
 * units Module not accepted here)".
 */
export function say(a: Amount, accepted: Set<string>): string {
  const k = unitOf(a.unit);
  if (!k || !accepted.has(a.unit)) return `${grouped(a.value)} of unit ${a.unit.slice(0, 8)}… (${k ? `${k.module.name}, not accepted here` : 'a units Module Damgar does not know'})`;
  return `${grouped(a.value)} ${a.value === 1 ? k.unit.one : k.unit.many}`;
}

/** Totals per unit, never across units: one line per unit, side by side. */
export function totals(xs: Amount[]): Amount[] {
  const by = new Map<string, number>();
  for (const x of xs) by.set(x.unit, (by.get(x.unit) ?? 0) + x.value);
  return [...by.entries()].map(([unit, value]) => ({ unit, value }));
}

/** An amount as typed: a whole number of the unit's smallest part. */
export function readValue(typed: string): number {
  const t = typed.replace(/[\s_]/g, '');
  if (!/^\d{1,15}$/.test(t) || Number(t) === 0) throw new Error('An amount is a whole number above zero, in the unit’s smallest part.');
  return Number(t);
}
