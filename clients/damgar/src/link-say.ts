// The receive-only link's words (F351), apart from `link.ts` so the web clients carry them without Node's https.

/** Said in Settings, before a link is made (F351: "explained in plain words in Settings with its cost"). */
export const LINK_SAY = [
  'Damgar can answer a Lightning payment to you by itself, if you let it make invoices on your node. It needs a permission from your node that makes invoices and does nothing else: it cannot pay, cannot read your balance, cannot move money.',
  'On lnd: bake it with “lncli bakemacaroon invoices:write invoices:read”, and give its file here with the node’s address and certificate. Damgar asks the node for its balance with it first, and refuses a permission that can read it.',
  'Its cost: whoever steals it can make invoices in your node’s name, never take anything. Remove it here at any time; without it, you make each invoice in your wallet, as before.',
  'An invoice is made by itself only below the cap of your receipts lane, and only while “Follow every step by hand” is off.',
];
