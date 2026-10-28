// The suite's fonts (H123, decided 26 October 2026), the kit's own files
// (`../../kit/fonts/`, listed as `FONTS` in `../../kit/src/style.ts`):
// Atkinson Hyperlegible Next and its Mono, and Gentium Book Plus italic for
// the app names, each under the SIL Open Font License 1.1, whose text is
// served beside it. They are files of their own, not part of the apps' code
// or their licence. Served from the page's own origin: on a computer by the
// program, on the web beside the page. Until 26 October 2026 Dub bundled
// Inter here (F332).

/** The font files and their licences, by the name the page asks for them, with their type. */
export const FONT_FILES = {
  'atkinson_next.woff2': 'font/woff2',
  'atkinson_next_license.txt': 'text/plain; charset=utf-8',
  'atkinson_mono.woff2': 'font/woff2',
  'atkinson_mono_license.txt': 'text/plain; charset=utf-8',
  'gentium_book_plus_italic.woff2': 'font/woff2',
  'gentium_book_plus_license.txt': 'text/plain; charset=utf-8',
} as const;

/** Where they are kept, from this app's folder (`clients/dub`): the kit's. */
export const FONTS_DIR = '../kit/fonts';
