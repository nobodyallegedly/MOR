# A long-form test document

This is a test document for the long-form text format, not a real post. Every line of it is canonical text, and the plain text below the rendering is exactly the bytes that were signed.

## What the format does

A paragraph is one or more lines; a line break stays a line break.
This line follows the one above without a blank line between them.

Words can be *in italic*, **in bold**, or ***both***. A sign that closes nothing stays as typed: 2 * 3 = 6.

Code is shown exactly as written: `**not bold**`. A backslash shows a sign as itself: \*not italic\*.

A link always shows its address: <https://dubsar.org>.

> A quote is marked with a sign at the start of each line.
>
> > And quotes can hold quotes.

## Lists

- A list item begins with a dash.
- Its marker is shown as written.
  An indented line continues the item.

  - and an indented list is a list inside it.

1. Numbers are shown as written,
1. never renumbered, so this says 1 twice.

---

```text
A code block keeps every sign: # * > - ` \
```

## What it never does

It never hides a letter or a digit, never adds a character, and never moves one: what a reader sees is the text, in the order of its bytes, minus a few signs. HTML such as <b>this</b> and codes such as &amp; are shown as typed.
