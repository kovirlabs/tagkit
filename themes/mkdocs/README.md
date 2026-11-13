# TagKit theme for MkDocs

Use this when you want MkDocs documentation that is plain, fast, accessible HTML: light and dark mode, a sidebar of your pages, a table of contents for each page, and no theme JavaScript or CSS to maintain.

```sh
pip install "mkdocs-tagkit @ git+https://github.com/kovirlabs/tagkit#subdirectory=themes/mkdocs"
```

```yaml
# mkdocs.yml
theme:
  name: tagkit
  primary_color: "#0f766e"   # optional brand color
  tagaction: true            # false leaves out the TagAction script
  search: titles             # titles (default), pagefind, or false
markdown_extensions:
  - admonition               # !!! note callouts
```

The page is styled by [TagBrush.css](https://github.com/kovirlabs/tagbrush) and enhanced by [TagAction](https://github.com/kovirlabs/tagaction), both loaded from a CDN.

## What you get

- Your `nav` as a sidebar (sections become headings), with the current page marked; it stacks above the page on phones.
- A table of contents beside each page, built from its `##` and `###` headings, that follows your reading.
- Previous and next links, an "Edit this page" link when `repo_url` is set, your `copyright` in the footer.
- Tables, footnotes, and code styled by TagBrush.css; Copy buttons on code, sortable tables, and "#" links on headings from TagAction. Everything works with JavaScript off.
- `description` in a page's front matter (or `site_description`) becomes its meta description.

- Search above the sidebar (see below).
- Callouts: `!!! note`, `!!! warning`, `!!! tip` and the other admonition kinds are colored callouts (TagBrush.css 1.2 and later). Turn on the `admonition` Markdown extension, or MkDocs leaves them as plain text.

## Search

- `search: titles` (the default) puts a search box above the sidebar that finds pages and their sections by title as you type. The theme writes a list of every page and `##` section into each page, and TagAction filters it, so there's no index to build and no script of its own. It needs TagAction 0.2 or later, and like everything TagAction adds, it's hidden when JavaScript is off. MkDocs' own search plugin isn't used; add `plugins: []` to skip building its index.
- `search: pagefind` searches the full text with [Pagefind](https://pagefind.app/), which builds a static index after MkDocs: run `npx pagefind --site site` after `mkdocs build`. The theme loads Pagefind's search box from `pagefind/` and marks each page's article as the text to index.
- `search: false` leaves search out.

## Tested

CI builds [`example/`](example/) with MkDocs 1.6 in strict mode and checks every page with TagCheck: no errors or warnings, WCAG AA contrast in light and dark mode, no sideways scrolling on phones. Run it yourself with `sh build-example.sh` (needs Python), then the TagKit tests.
