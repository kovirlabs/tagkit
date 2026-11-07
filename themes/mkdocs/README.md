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
```

The page is styled by [TagBrush.css](https://github.com/kovirlabs/tagbrush) and enhanced by [TagAction](https://github.com/kovirlabs/tagaction), both loaded from a CDN.

## What you get

- Your `nav` as a sidebar (sections become headings), with the current page marked; it stacks above the page on phones.
- A table of contents beside each page, built from its `##` and `###` headings, that follows your reading.
- Previous and next links, an "Edit this page" link when `repo_url` is set, your `copyright` in the footer.
- Tables, footnotes, and code styled by TagBrush.css; Copy buttons on code, sortable tables, and "#" links on headings from TagAction. Everything works with JavaScript off.
- `description` in a page's front matter (or `site_description`) becomes its meta description.

## Not included (yet)

- Search: MkDocs' search plugin needs theme JavaScript. Add `plugins: []` to skip building its index.
- Admonitions (`!!! note`) show as plain text until TagBrush.css styles them.

## Tested

CI builds [`example/`](example/) with MkDocs 1.6 in strict mode and checks every page with TagCheck: no errors or warnings, WCAG AA contrast in light and dark mode, no sideways scrolling on phones. Run it yourself with `sh build-example.sh` (needs Python), then the TagKit tests.
