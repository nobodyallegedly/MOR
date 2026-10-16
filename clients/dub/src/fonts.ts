// Inter (rsms/inter, release 4.1, its web/ folder), bundled with Dub so the
// look is the same everywhere (F332: "Inter bundled", decided by Nobody,
// allegedly). Light (300) and regular (400), woff2, under the SIL Open Font
// License 1.1, whose text is served beside them (`inter_license.txt`). They
// are files of their own, not part of Dub's code or its licence. Served from
// the page's own origin: on the Mac by the program, on the web beside the page.

/** The font files and the licence, by the name the page asks for them, with their type. */
export const FONT_FILES = {
  'inter_light.woff2': 'font/woff2',
  'inter_regular.woff2': 'font/woff2',
  'inter_license.txt': 'text/plain; charset=utf-8',
} as const;

/** Where they are kept in this folder. */
export const FONTS_DIR = 'static/fonts';
