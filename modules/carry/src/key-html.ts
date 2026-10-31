// The signing key's string as an app's page shows it (module-signing-key-
// string-draft-1.md, 3.2 and 3.4): no import, so the pages' bundles take it
// (the string itself is made by `string.ts`, in the app's program).

/** What an app says beside the string, wherever it shows it. */
export const KEY_STRING_SAY = 'The same signing key, written as one string: either form, the 24 words or this string, brings the identity into another app. Whoever holds it can sign as this identity and read its private messages, until the key is changed with the chain key. The chain key is not in it.';

/**
 * The string shown on request beside the words: folded until asked for.
 * Only a string `toKeyString` made is shown (grouped or not), so nothing in
 * it needs escaping; anything else shows nothing.
 */
export function keyStringHtml(key: string | null | undefined): string {
  if (!key || !/^morsk1[0-9a-z ]+$/.test(key)) return '';
  return `<details class="key-string" data-key-string><summary>Show the same key as a string</summary><p class="small">${KEY_STRING_SAY}</p><p><code class="key-string-value">${key}</code></p></details>`;
}
