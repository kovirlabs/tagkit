# Church starter site

Use this when you need a website for a church that you can host for free as plain files: no CMS, no framework, no page scripts to maintain.

It is a complete example site for a fictional congregation, Cedar Hill Community Church, with 14 pages written in plain semantic HTML. [TagBrush.css](https://github.com/kovirlabs/tagbrush) styles it (dark mode included), [TagAction](https://github.com/kovirlabs/tagaction) adds the interactive parts, [TagKit](https://github.com/kovirlabs/tagkit) fills in the shared header and footer at build time, and [TagCheck](https://github.com/kovirlabs/tagcheck) checks every page before it goes live.

## Start

```sh
npx degit kovirlabs/tagkit/starters/church my-church
cd my-church
npm install
npm run build        # writes public/ and checks it; open public/index.html
npm run watch        # rebuild as you edit
```

Open `public/index.html` straight from disk; links work without a server.

## What's inside

| Page | For |
|---|---|
| `index.html` | Welcome, service times as tiles, a "This week" block (Sunday's sermon, bulletin, announcements), ministry cards, quotes, recent sermons, weekly email sign-up |
| `visit.html` | Plan a visit: a service times table, directions, parking, access, a "What a service is like" dialog, and the questions newcomers ask |
| `about.html` | Values, history with a photo that enlarges, pastors and staff, a sortable table of elders |
| `beliefs.html` | A statement of faith with a table of contents that follows the scroll |
| `ministries.html` | Kids, youth, small groups, music, and the food pantry, with a schedule table |
| `sermons/` | A sermon list and two sermon pages: passage, watch and listen links, summary, small-group questions, previous/next links |
| `events.html` | A sortable, filterable events table with times shown in each visitor's own time zone, and an "access info" popover |
| `connect.html` | A connect card with validation, "Add another person" rows, and a character counter; a prayer request form that asks who may see it |
| `give.html` | Gift amounts with a live total, a fund picker, a monthly switch, a budget meter and table, other ways to give |
| `contact.html` | Address, phone, and email cards; a contact form |
| `privacy.html`, `404.html` | A plain-language privacy page and a "page not found" page |

Shared pieces live in `site/_includes/`: `head.html` (stylesheet, script, brand color), `nav.html` (the top bar), and `footer.html`. Change them once and every page follows. Folders starting with `_` aren't published.

## Make it yours

1. **Name and address:** search the `site/` folder for `Cedar Hill`, `40 Orchard Road`, `555`, and `example.org`.
2. **Service times:** they appear on `index.html`, `visit.html`, and in `_includes/footer.html`. A comment marks each one.
3. **Color and logo:** change `--color-primary` in `site/_includes/head.html` (a light and a dark value), and replace `site/images/logo.svg`.
4. **Beliefs:** `beliefs.html` is starter text. Replace it with your church's or denomination's statement of faith.
5. **Giving:** the form in `site/give.html` sends the visitor to `https://donate.stripe.com/your-payment-link`. Replace it with your giving page (Tithe.ly, Planning Center Giving, Pushpay, Givebutter, a Stripe Payment Link, PayPal). If your provider can't take the amount in the link, use a plain link instead (the comment above the form shows how).
6. **Forms:** the connect card and the prayer, contact, and weekly email forms post to `https://formspree.io/f/your-…-form-id`. Create forms at a form service and paste their addresses into each `action`; search for `your-` to find them all. Send prayer requests to an inbox only the pastors read.
7. **Sermons:** the watch and listen links point to `your-video-id` and `your-podcast`. Link to wherever you post recordings (a video channel, a podcast host), or upload an MP3 beside the sermon page and add an `<audio controls>` element.
8. **Photos:** the photos come from picsum.photos as placeholders. Put your own in `site/images/` and change the `src` (and the link around the photo, if it has one) and `alt` text. Get permission before posting photos of people, and a parent's permission for children.
9. **Pages:** delete pages you don't need, and remove their links from `nav.html` and `footer.html`. To add a page, copy one that's close and keep the include lines.

Write links in `_includes/` from the site root (`/give.html`); TagKit makes them relative for each page and marks the current page in the nav. In pages themselves, use relative links (`give.html`, or `../give.html` from `sermons/`).

Run `npm run build` after editing. It stops with an error if a page has a problem (a missing label or alt text, a broken reference, a duplicate id), and tells you the file and line. `npm run check` also checks contrast in light and dark mode and phone layouts; it needs Playwright (`npx playwright install chromium`).

## Each week

The parts that change often are marked with comments that start `EDIT EACH WEEK` or `EDIT AS EVENTS CHANGE`:

1. **`index.html`, "This week":** the date, Sunday's sermon, the bulletin link, and the announcements. Upload the bulletin PDF to `site/bulletins/`.
2. **`sermons/`:** copy last week's sermon page, rename it, and change its text and links. Add it to the top of `sermons/index.html` and to "Recent sermons" on `index.html`, and fix the previous/next links at the bottom of the pages beside it.
3. **`events.html`:** one table row per event. Delete rows that have passed.

You don't need this folder on your computer to do that. On github.com, open the file, click the pencil, change the text, and choose "Commit changes"; the site rebuilds and publishes itself in a minute or two. If the build finds a mistake, the old site stays up and the repository's Actions tab shows what's wrong. [HOSTING.md](../HOSTING.md) has the steps with links.

## Publish

- **GitHub Pages:** push to a repository, then in Settings > Pages set Source to "GitHub Actions". `.github/workflows/deploy.yml` builds, checks, and publishes on every push to `main`.
- **Cloudflare Pages or Netlify:** build command `npm run build`, publish directory `public`. Netlify's free plan allows about 20 publishes a month, which a weekly-edited site can use up.
- **Any web host:** run `npm run build` and upload the contents of `public/` by FTP or your host's file manager.

[HOSTING.md](../HOSTING.md) compares the free hosts and form services, covers custom domains, and lists the free editing tools you can add later.

The 404 page's links are relative, so they work for missing pages at the top level of the site (`/missing.html`) but not deeper ones (`/sermons/missing.html`).

## Versions

The pages load TagBrush.css 2.x and TagAction 0.x from jsDelivr, so they get fixes automatically. To lock exact versions, change `tagbrush@2` and `tagaction@0` in `site/_includes/head.html` to full versions such as `tagbrush@2.0.1`, and add `integrity` attributes if you want the browser to verify the files.

## License

Apache-2.0, like TagKit. The text, people, and church are fictional; replace them with your own. The Bible quotations are short excerpts for illustration; quote the translation your church uses and follow its publisher's permission terms.
