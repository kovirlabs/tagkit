# Changelog

## Unreleased

- New snippet: photo gallery, linked photos in a grid of figures that TagAction's viewer steps through (Previous, Next, arrow keys); asked for in the family evaluation, round 1.
- The dashboard's sidebar folds behind a "Sections" button on phones (TagBrush.css's sidebar menu pattern): at 360px its whole link list used to sit between the top bar and the page.
- Prices in the landing template and the pricing snippet are written `<strong>$12</strong> <small>per month</small>`, which TagBrush.css 2.0 shows as a large figure and a small muted period (1.x shows it as before).
- New snippet: repeatable rows, a form where people add rows with TagAction's `--clone` and remove any of them with `--remove` (TagAction's next release). The Add and Remove buttons are written `hidden`, so without JavaScript the first row still works.
- The confirm dialog's destructive button is red: `data-tone="error"` on the Delete button, and an outlined red opener (TagBrush.css's next release).
- MkDocs theme: search. `search: titles` (the default) finds pages and sections by title from a box above the sidebar, filtered by TagAction 0.3's search-results list; `search: pagefind` uses Pagefind for full text; `search: false` leaves it out. The README no longer lists callouts as missing: TagBrush.css 1.2 styles `!!! note` once the `admonition` extension is on.
- A row-actions snippet (`snippets/row-confirm.html`): a button on each table row opens that row's own confirm dialog, which posts the row's action. One dialog per row works with no page script, and the Actions column stays unsortable. The orders agent in the family evaluation worked this out on its own; now it's a pattern to copy.
- A nonprofit starter site (`starters/nonprofit/`): 13 pages for a small nonprofit, built with `tagkit build` from shared includes, with donation and volunteer forms for static hosts, sortable and filterable event and budget tables, a live gift total, dialogs, a popover, a remembered FAQ, and a GitHub Pages workflow that runs TagCheck before publishing. Copy it with `npx degit kovirlabs/tagkit/starters/nonprofit`. Tests build it and check every page with TagCheck (including contrast and phone overflow), TagAction, links, and JavaScript off.
- Tested with TagBrush.css 1.2.0.
- The blog post template's lead photo opens in TagAction's viewer: its link now ends in `.jpg`, since TagAction only treats links to image files as photos. A test checks every linked photo. Found by the family agent evaluation.
- The gallery (the GitHub Pages site) wears the Tag family brand: the family bar, the shared theme from kovirlabs.github.io/tagstack/brand.css, and a footer linking the family and the Jekyll and WordPress themes. The linked-photo test skips links that have text beside an image, like the family bar's.

## 0.1.0 (2026-11-06)

Published as `@kovirlabs/tagkit` (the unscoped `tagkit` name on npm belongs to someone else); the command is still `tagkit`.

First version. Tested with TagBrush.css 1.1.0 and TagAction 0.1.0.

- Six page templates: landing, dashboard, docs, blog post, sign-up, admin table.
- Seventeen snippets: hero, feature grid, pricing, testimonials, FAQ, card grid, stat tiles, page header, data table, search bar, confirm dialog, user menu, contact form, callouts, sidebar layout, docs layout, footer columns.
- `npx @kovirlabs/tagkit build`: build-time includes with server-side include comments (`<!--#include file="…" -->`), marking the current page with `aria-current` and making root links in shared pieces relative. `--check` runs TagCheck; `--watch` rebuilds on changes.
- A Pandoc template (`themes/pandoc/`) for Markdown, Word, and other documents, tested with real Pandoc and TagCheck.
- An MkDocs theme (`themes/mkdocs/`, the `mkdocs-tagkit` Python package): site nav sidebar, a table of contents beside each page, previous/next and edit links. CI builds an example with MkDocs in strict mode and checks it with TagCheck.
- A Hugo theme (`themes/hugo/`, a Hugo module or a copy): a blog with post cards, a table of contents beside posts, older/newer links, code highlighted with classes, and a redirect template with a viewport. CI builds an example with the latest Hugo and checks it with TagCheck.
- A WordPress block theme, in its own repository for the theme directory: kovirlabs/tagkit-wordpress.
- A Jekyll theme for GitHub Pages, in its own repository so `remote_theme` can use it: kovirlabs/tagkit-jekyll.
- A gallery page, preview pages, `snippets.json`, and `llms.txt` with the catalog, plus a Claude Code skill, a Cursor rule, and an AGENTS.md section generated from it.
- Every piece passes TagCheck, including contrast in light and dark mode and phone overflow, works with TagAction, and stays usable without JavaScript.
