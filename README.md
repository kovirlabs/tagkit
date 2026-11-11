# TagKit

Use TagKit when you want to start a page from a ready-made template or paste in a finished section (hero, pricing, FAQ, stat tiles, a sortable table, a confirm dialog) written in plain semantic HTML, with no classes to learn and no build step.

**[Browse the gallery](https://kovirlabs.github.io/tagkit/)** · [llms.txt](llms.txt) for AI agents · [snippets.json](snippets.json) as data

TagKit is part of the Tag family. Its HTML is styled by [TagBrush.css](https://github.com/kovirlabs/tagbrush), made interactive by [TagAction](https://github.com/kovirlabs/tagaction), and checked by [TagCheck](https://github.com/kovirlabs/tagcheck).

## What's in it

**Page templates** (`templates/`): landing page, dashboard, docs page, blog post, sign-up page, admin table. Each is a complete page; open it and copy the source.

**Snippets** (`snippets/`): hero, feature grid, pricing table, testimonials, FAQ, card grid, stat tiles, page header, data table, search bar, confirm dialog (with a red destructive button), user menu, contact form, repeatable rows (add and remove), photo gallery, callouts, sidebar layout, docs layout, footer columns. Each file starts with a comment that says what it is and where it goes. Most go inside `<main>`; ones marked `(body)` are page-level.

**Starter sites** (`starters/`): a whole multi-page site to copy and make your own. The [nonprofit starter](starters/nonprofit/) has 13 pages (home, about, programs, events, news, get involved, donate, contact, financials, privacy, 404), with donation and volunteer forms that work on any static host, built with `tagkit build`, checked with TagCheck, and published to GitHub Pages by an included workflow: `npx degit kovirlabs/tagkit/starters/nonprofit my-site`.

**Themes**: a [Pandoc template](themes/pandoc/) that turns Markdown, Word, or AI-written documents into a styled page with one command, a [Jekyll theme for GitHub Pages](https://github.com/kovirlabs/tagkit-jekyll) used with one config line (`remote_theme: kovirlabs/tagkit-jekyll`), an [MkDocs theme](themes/mkdocs/) for documentation sites, a [Hugo theme](themes/hugo/) for blogs and sites, and a [WordPress block theme](https://github.com/kovirlabs/tagkit-wordpress).

## Build-time includes

Write each page as plain HTML and keep the shared pieces in one place:

```html
<body>
<!--#include file="_includes/header.html" -->
<main>…</main>
<!--#include virtual="/_includes/footer.html" -->
</body>
```

```sh
npx @kovirlabs/tagkit build site/ public/            # add --check to run TagCheck on the result, --watch to rebuild on changes
```

The include comments are the server-side include syntax web servers already understand (`file` is relative to the page, `virtual` to the site folder), so there's nothing new to learn and the source pages stay valid HTML. The output is plain HTML with no script needed:

- Pages (`.html`) get their includes filled in, nested includes too. Other files are copied. Files and folders whose names start with `_` are left out.
- Links to the page being built get `aria-current="page"`, so TagBrush.css shows the current page in the nav without JavaScript.
- Root links in included pieces (`/about.html`) become relative (`../about.html`), so the site works from any folder, from `file://`, and from a GitHub Pages project URL.
- A missing include or an include loop is reported with the file and line, and the exit code is 1.

From code: `import { build } from '@kovirlabs/tagkit'; build('site', 'public')`.

## Every piece is tested

- TagCheck reports no errors and no warnings.
- Text meets WCAG AA contrast (4.5:1) in light and dark mode, and nothing scrolls sideways at a 360px phone width (`tagcheck --browser`).
- TagAction runs on every page without errors, and the interactive parts work (sorting, filtering, dialogs, menus, validation, tables of contents).
- With JavaScript off, every page is usable: only controls that need TagAction are hidden, and dropdown lists show.

Tested with TagBrush.css 1.2.0 and TagAction 0.1.0.

## Coming next

More templates and snippets as the family grows, as planned in the [Tag family spec](https://github.com/kovirlabs/tagstack/blob/main/Spec.md).

## Development

```sh
npm install
npm run build   # preview/, snippets.json, index.html, llms.txt catalog, ai/
npm test        # set PANDOC to a command that runs Pandoc (for example through Docker) if it isn't installed
```

Edit `snippets/` and `templates/`; everything else is generated. To add a snippet, create `snippets/<name>.html` starting with `<!-- Name: What it is. -->` (or `<!-- Name (body): … -->` for page-level pieces), run the build, and run the tests.

## License

Apache-2.0
