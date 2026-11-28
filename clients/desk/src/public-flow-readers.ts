// DubLaw's file, for the shared reader (ledger S10): who may follow a work's money, from its data socket (key 16).
// Public flow draft 8 (DubWeb; spec 5516c238…cd4a3), parameter `readers`, written as DubWeb's seam act 184b485b rules
// (DubPay yes 94a7654f, DubLaw yes 08c46680): {0: "anyone"} reads as anyone; null or an empty map as parties;
// {0: "parties"} as parties; anything else as parties, unchecked. Takes the decoded parameter, never guesses from text.
export const PUBLIC_FLOW_8 = '5516c238d6a0a14ff4566990db06cfbae60106a2282d3b1d7aa0e9761e0cd4a3';
export type Readers = { readers: 'anyone' | 'parties'; unchecked?: string };

export function publicFlowReaders(cmip: string, params: unknown): Readers | null {
  if (cmip !== PUBLIC_FLOW_8) return null; // not public flow draft 8: another reader's question
  if (params === null || params === undefined) return { readers: 'parties' };
  if (!(params instanceof Map)) return { readers: 'parties', unchecked: 'public flow parameter not read' };
  if (params.size === 0) return { readers: 'parties' };
  if (params.size === 1 && params.get(0) === 'anyone') return { readers: 'anyone' };
  if (params.size === 1 && params.get(0) === 'parties') return { readers: 'parties' };
  return { readers: 'parties', unchecked: 'public flow parameter not read' };
}

export function readersLine(r: Readers | null): string {
  if (!r) return 'Who may follow the money: not public flow draft 8; read its own text.';
  if (r.unchecked) return `Who may follow the money: the parties only (unchecked: ${r.unchecked}).`;
  return r.readers === 'anyone' ? 'Who may follow the money: anyone, by each payment\'s commitment; nobody can see who paid.' : 'Who may follow the money: the parties of these Terms only.';
}
