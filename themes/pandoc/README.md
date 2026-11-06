# TagKit Pandoc template

Use this when you want any Markdown, Word, or AI-written document as a clean, readable web page: one command, no CSS, light and dark mode included.

```sh
pandoc notes.md --standalone --toc \
  --template https://raw.githubusercontent.com/kovirlabs/tagkit/main/themes/pandoc/template.html \
  -o notes.html
```

Pandoc reads the template straight from the URL; download [`template.html`](template.html) to work offline. It works the same for Word and other formats: `pandoc report.docx --standalone --extract-media=media --template template.html -o report.html`.

## What you get

- [TagBrush.css](https://github.com/kovirlabs/tagbrush) styles the page: title block (title, subtitle, authors, date), the abstract as a callout, tables, footnotes, task lists, definition lists, and code. Code is colored by TagBrush.css and follows dark mode, so Pandoc's own highlighting styles are left out.
- With `--toc`, the table of contents sits beside the text and stays in view.
- [TagAction](https://github.com/kovirlabs/tagaction) adds a Copy button to code, sortable tables, "#" links on headings, and highlights the section you're reading in the table of contents. Everything still works without JavaScript.

## Options

Set these in the document's YAML front matter or with `--metadata`:

| Metadata | |
| --- | --- |
| `title`, `subtitle`, `author`, `date`, `abstract` | The title block |
| `lang` | The page language (default `en`) |
| `description` | The page's `<meta name="description">` |
| `primary-color` | Brand color for links and buttons, for example `"#7c3aed"` |
| `toc-title` | Label of the table of contents (default "Contents") |
| `no-tagaction: true` | Leave out the TagAction script (a page with no JavaScript) |

Math: add `--mathjax` (or `--katex`) to render equations.

If your document's sections start at `#` and it also has a `title`, add `--shift-heading-level-by=1` so the title is the only `<h1>`.

## Tested

The tests convert [`example.md`](example.md) with real Pandoc and check the page with TagCheck: no errors or warnings, WCAG AA contrast in light and dark mode, no sideways scrolling on phones.
