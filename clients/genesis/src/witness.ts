// What a client says before an owner signs a witness act (Identity draft
// 11, rule 18c, client conformance): a witness act is never signed as a side
// effect, and the owner is told what it does first. Kept apart, with no
// imports, so a page in the browser can show the same words.

export const WITNESS_EXPLANATION =
  'A witness act says "I received this act and rely on it". It keeps the act visible as disputed even if its author later disowns it. It is public: anyone can see that you rely on this act, though not what it says.';
