# Changelog

## Unreleased

- Tested with TagBrush.css 1.2.0.

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
