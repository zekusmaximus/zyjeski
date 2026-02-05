Eternal Return: Hugo content/layout changes

- Added Goldmark unsafe rendering to `hugo.toml` to allow inline HTML/CSS.
- Created new story section under `content/stories/eternal-return/` with:
  - `_index.md` (landing page with full-viewport background image and CTA to Chapter 1 via relref)
  - `01-chapter-1.md` (converted from raw HTML, preserved inline HTML/CSS, fixed Next link to relref)
  - `02-chapter-2.md` (Markdown placeholder to enable navigation; full content remains in original folder)
  - `10-epilogue.md` (converted from raw HTML, preserved inline HTML/CSS/JS, updated PRESS ENTER to relref)
- Added minimal chapter layout with auto Prev/Next: `layouts/story/chapter.html`.
- Verified background image exists at `static/images/uploads/landing_background.png`.

Notes

- Existing content under `content/stories/Eternal_Return/` remains untouched to avoid regressions.
- New story URLs:
  - `/stories/eternal-return/`
  - `/stories/eternal-return/chapter-1/`
  - `/stories/eternal-return/epilogue/`

Next potential steps

- Migrate remaining chapters (3–9) to Markdown under the new folder and convert any hard-coded links to relref.
- Remove any stray `<head>` tags if present in those conversions.
