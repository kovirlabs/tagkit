# TagKit

Use TagKit when you want to start a page from a ready-made template or paste in a finished section (hero, pricing, FAQ, stat tiles, a sortable table, a confirm dialog) written in plain semantic HTML, with no classes to learn and no build step.

**[Browse the gallery](https://kovirlabs.github.io/tagkit/)** · [llms.txt](llms.txt) for AI agents · [snippets.json](snippets.json) as data

TagKit is part of the Tag family. Its HTML is styled by [TagBrush.css](https://github.com/kovirlabs/tagbrush), made interactive by [TagAction](https://github.com/kovirlabs/tagaction), and checked by [TagCheck](https://github.com/kovirlabs/tagcheck).

## What's in it

**Page templates** (`templates/`): landing page, dashboard, docs page, blog post, sign-up page, admin table. Each is a complete page; open it and copy the source.

**Snippets** (`snippets/`): hero, feature grid, pricing table, testimonials, FAQ, card grid, stat tiles, page header, data table, search bar, confirm dialog, user menu, contact form, callouts, sidebar layout, docs layout, footer columns. Each file starts with a comment that says what it is and where it goes. Most go inside `<main>`; ones marked `(body)` are page-level.

**Themes**: a [Pandoc template](themes/pandoc/) that turns Markdown, Word, or AI-written documents into a styled page with one command, and a [Jekyll theme for GitHub Pages](https://github.com/kovirlabs/tagkit-jekyll) used with one config line (`remote_theme: kovirlabs/tagkit-jekyll`).

## Every piece is tested

- TagCheck reports no errors and no warnings.
- Text meets WCAG AA contrast (4.5:1) in light and dark mode, and nothing scrolls sideways at a 360px phone width (`tagcheck --browser`).
- TagAction runs on every page without errors, and the interactive parts work (sorting, filtering, dialogs, menus, validation, tables of contents).
- With JavaScript off, every page is usable: only controls that need TagAction are hidden, and dropdown lists show.

Tested with TagBrush.css 1.1.0 and TagAction 0.1.0.

## Coming next

Build-time includes (a small CLI that stitches a shared header, footer, and nav into static pages) and more platform themes (MkDocs, Hugo, Eleventy, WordPress), as planned in the [Tag family spec](https://github.com/kovirlabs/tagstack/blob/main/Spec.md).

## Development

```sh
npm install
npm run build   # preview/, snippets.json, index.html, llms.txt catalog, ai/
npm test
```

Edit `snippets/` and `templates/`; everything else is generated. To add a snippet, create `snippets/<name>.html` starting with `<!-- Name: What it is. -->` (or `<!-- Name (body): … -->` for page-level pieces), run the build, and run the tests.

## License

Apache-2.0
