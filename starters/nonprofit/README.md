# Nonprofit starter site

Use this when you need a website for a small nonprofit that you can host anywhere as plain files: no CMS, no framework, no page scripts to maintain.

It is a complete example site for a fictional food bank, Riverbend Food Share, with 13 pages written in plain semantic HTML. [TagBrush.css](https://github.com/kovirlabs/tagbrush) styles it (dark mode included), [TagAction](https://github.com/kovirlabs/tagaction) adds the interactive parts, [TagKit](https://github.com/kovirlabs/tagkit) fills in the shared header and footer at build time, and [TagCheck](https://github.com/kovirlabs/tagcheck) checks every page before it goes live.

## Start

```sh
npx degit kovirlabs/tagkit/starters/nonprofit my-nonprofit
cd my-nonprofit
npm install
npm run build        # writes public/ and checks it; open public/index.html
npm run watch        # rebuild as you edit
```

Open `public/index.html` straight from disk; links work without a server.

## What's inside

| Page | Shows off |
|---|---|
| `index.html` | Hero with photo, impact numbers as stat tiles, program cards with icons, testimonials, news cards with "3 days ago" dates, newsletter sign-up |
| `about.html` | Mission cards, history with a photo that enlarges, staff cards, a sortable board table, annual report downloads |
| `programs.html` | Page title with actions, callouts in three colors, a schedule table with status badges |
| `events.html` | Sortable, filterable event table with times shown in each visitor's own time zone, an "access info" popover |
| `get-involved.html` | Volunteer form with validation, a switch, "Add another person" rows, a character counter, a "What to expect" dialog, and an FAQ that remembers what's open |
| `donate.html` | Gift amounts with a live total, a monthly switch, a meter, other ways to give, a mailing-address dialog |
| `contact.html` | Address, phone, and email cards; a contact form |
| `news/` | A news index and two posts with breadcrumbs, a data table, and previous/next links |
| `transparency.html` | Table of contents that follows the scroll, sortable income and spending tables, tax filings and audits |
| `privacy.html`, `404.html` | A plain-language privacy page and a "page not found" page |

Shared pieces live in `site/_includes/`: `head.html` (stylesheet, script, brand color), `nav.html` (the top bar), and `footer.html`. Change them once and every page follows. Folders starting with `_` aren't published.

## Make it yours

1. **Name, address, and EIN:** search the `site/` folder for `Riverbend`, `214 Mill Street`, `00-0000000`, `555`, and `example.org`.
2. **Color and logo:** change `--color-primary` in `site/_includes/head.html` (a light and a dark value), and replace `site/images/logo.svg`.
3. **Donations:** the form in `site/donate.html` sends the visitor to `https://donate.stripe.com/your-payment-link`. Replace it with your Stripe Payment Link, Givebutter, Donorbox, PayPal, or bank giving page. If your provider can't take the amount in the link, use a plain link instead (the comment above the form shows how).
4. **Forms:** the contact, volunteer, and newsletter forms post to `https://formspree.io/f/your-…-form-id`. Create forms at [Formspree](https://formspree.io), Basin, Getform, or your newsletter provider and paste their addresses into the `action`. On Netlify, you can use Netlify Forms instead (`<form name="contact" data-netlify="true">`).
5. **Photos:** the photos come from picsum.photos as placeholders. Put your own in `site/images/` and change the `src` (and the link around the photo, if it has one) and `alt` text.
6. **Reports:** replace the placeholder PDFs in `site/reports/`.
7. **Pages:** delete pages you don't need, and remove their links from `nav.html` and `footer.html`. To add a page, copy one that's close and keep the include lines.

Write links in `_includes/` from the site root (`/donate.html`); TagKit makes them relative for each page and marks the current page in the nav. In pages themselves, use relative links (`donate.html`, or `../donate.html` from `news/`).

Run `npm run build` after editing. It stops with an error if a page has a problem (a missing label or alt text, a broken reference, a duplicate id), and tells you the file and line. `npm run check` also checks contrast in light and dark mode and phone layouts; it needs Playwright (`npx playwright install chromium`).

## Publish

- **GitHub Pages:** push to a repository, then in Settings > Pages set Source to "GitHub Actions". `.github/workflows/deploy.yml` builds, checks, and publishes on every push to `main`.
- **Netlify or Cloudflare Pages:** build command `npm run build`, publish directory `public`.
- **Any web host:** run `npm run build` and upload the contents of `public/` by FTP or your host's file manager.

[HOSTING.md](../HOSTING.md) compares the free hosts and form services, covers custom domains, and lists the free editing tools you can add later.

The 404 page's links are relative, so they work for missing pages at the top level of the site (`/missing.html`) but not deeper ones (`/news/missing.html`).

## Versions

The pages load TagBrush.css 2.x and TagAction 0.x from jsDelivr, so they get fixes automatically. To lock exact versions, change `tagbrush@2` and `tagaction@0` in `site/_includes/head.html` to full versions such as `tagbrush@1.2.0`, and add `integrity` attributes if you want the browser to verify the files.

## License

Apache-2.0, like TagKit. The text and organization are fictional; replace them with your own.
