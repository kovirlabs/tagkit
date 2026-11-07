# TagKit theme for Hugo

Use this when you want a Hugo blog or site in plain, fast, accessible HTML: light and dark mode, readable text, highlighted code, and no theme CSS or JavaScript to maintain.

## Install

As a Hugo module (needs Go installed):

```sh
hugo mod init github.com/you/your-site
```

```toml
# hugo.toml
[module]
  [[module.imports]]
    path = "github.com/kovirlabs/tagkit/themes/hugo"
```

Or copy the theme into your site, with no Go needed:

```sh
npx degit kovirlabs/tagkit/themes/hugo themes/tagkit
```

```toml
# hugo.toml
theme = "tagkit"
```

The page is styled by [TagBrush.css](https://github.com/kovirlabs/tagbrush) and enhanced by [TagAction](https://github.com/kovirlabs/tagaction), both loaded from a CDN.

## What you get

- A top bar from your `main` menu (or your sections), with the current page marked.
- A home page with your content and the latest posts as cards; section pages list their posts with pagination.
- Posts with the author and date, previous/next links (older on the left), and a table of contents beside the post with `toc: true` (built by Hugo, so it works without JavaScript).
- Code highlighted with CSS classes that TagBrush.css colors in light and dark mode, instead of Hugo's fixed inline colors.
- Copy buttons on code, sortable tables, and "#" links on headings from TagAction. Everything works with JavaScript off.

## Settings

```toml
title = "Field Notes"
copyright = "© 2026 Dana Whitfield"   # footer; default "© <year> <title>"

[params]
  description = "Short essays on running a tiny software business."   # meta description and footer
  mainSections = ["posts"]             # what the home page lists

  [params.tagkit]
    primaryColor = "#7c3aed"           # links, buttons, and accents
    dateFormat = "January 2, 2006"
    toc = false                        # true: a table of contents on every page (or set toc in front matter)
    homeTitle = "Latest"
    homeCount = 6
    tagaction = true                   # false leaves out the TagAction script
    credit = true                      # false leaves out "Built with Hugo and TagKit"

[[menus.main]]
  name = "Posts"
  url = "/posts/"
```

Front matter: `title`, `date`, `author`, `toc`, `description`, and `subtitle` on list pages. To add to `<head>`, create `layouts/partials/head-custom.html` in your site.

## Tested

CI builds [`exampleSite/`](exampleSite/) with the latest Hugo and checks every page with TagCheck: no errors or warnings, WCAG AA contrast in light and dark mode, no sideways scrolling on phones. Requires Hugo 0.128 or later.
