# Hosting and editing a starter site for free

Use this when you've copied a starter site (nonprofit or church) and need to choose where to publish it, how its forms get delivered, and how the people who update it will edit it.

The limits and prices below were checked against each provider's own pages on November 14, 2026. Free plans change often, so follow the link before you rely on a number.

## The short version

1. Put the site in a public GitHub repository and publish it with **GitHub Pages**. The starter's workflow does the build. It costs nothing and has no monthly deploy limit to trip over.
2. Deliver the forms with **Web3Forms** or **Formspree**.
3. Update the site on **github.com in a browser**: open the file, click the pencil, change the text, commit.

That setup needs one free GitHub account and nothing installed on anyone's computer.

## Where to host

Every host here gives you a custom domain (`yourchurch.org`) with free HTTPS on its free plan. They all build the site the same way: build command `npm run build`, output folder `public`.

| Host | Free plan | Watch for |
|---|---|---|
| [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) | Sites up to 1 GB, about 100 GB of traffic a month | The repository must be public on a free account. Not for taking card numbers on the page; link out to a giving provider, as the starters do. |
| [Cloudflare Pages](https://developers.cloudflare.com/pages/platform/limits/) | 500 builds a month, up to 20,000 files | Works with private repositories. A second account to manage. |
| [Netlify](https://www.netlify.com/pricing/) | 300 credits a month; forms are free and unlimited | Each publish costs 15 credits, so the free plan allows at most 20 publishes a month before traffic is counted. When credits run out, every site on the account is paused until the next month. |
| [GitLab Pages](https://docs.gitlab.com/user/project/pages/) | Sites up to 1 GB, 400 build minutes a month | For repositories on GitLab; needs a `.gitlab-ci.yml` in place of the starter's GitHub workflow. Private projects are allowed. |
| [Render](https://render.com/docs/static-sites) | 5 GB of traffic and 500 build minutes a month | Going over is billed, not paused. |
| [Vercel](https://vercel.com/docs/plans/hobby) | 100 GB of traffic a month | The free plan's terms limit it to personal or non-commercial use, and don't say whether a church or nonprofit qualifies. Ask Vercel before using it for an organization. |

**Which one:** GitHub Pages, unless you need the repository private (then Cloudflare Pages) or want Netlify's built-in forms. Be careful with Netlify's free plan for a site that is edited weekly: each saved change is a publish, and a volunteer who saves ten small fixes in a sitting uses half the month's allowance.

### GitHub Pages, step by step

1. Create a free account at github.com for the organization (not a personal one that leaves when a volunteer does), and add a second owner.
2. Create a new public repository and upload the starter's files, or push them with git.
3. In the repository, open Settings > Pages and set Source to "GitHub Actions".
4. Wait for the first run under the Actions tab to finish. Your site is at `https://your-account.github.io/your-repository/`.
5. For your own domain, follow GitHub's guide to [custom domains and HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https). A `.org` domain costs about $10 to $15 a year from a registrar; this is the only part of the setup that isn't free.

### A caution about public repositories

Everything in a public repository can be read by anyone, including old versions of files. Don't commit member directories, children's names, prayer requests, or giving records. The starters are built so that none of this is stored in the site: forms go to a form service, and giving goes to a payment provider.

## Forms

A static site can't receive a form by itself. A form service gives you an address to put in the form's `action`; it emails you each submission. The starters' forms work with any of these without changes to the fields.

| Service | Free plan |
|---|---|
| [Web3Forms](https://web3forms.com/pricing) | 250 submissions a month, unlimited forms, one recipient |
| [Formspree](https://formspree.io/plans) | 50 submissions a month, unlimited forms, two recipients |
| [Forminit](https://forminit.com/pricing/) (was Getform) | 100 submissions a month, one form |
| [Basin](https://usebasin.com/pricing) | 50 submissions a month, one form |
| [FormSubmit](https://formsubmit.co/) | No sign-up; you confirm your address by email on the first submission |
| [Netlify Forms](https://docs.netlify.com/manage/forms/usage-and-billing/) | Free and unlimited, for sites hosted on Netlify |

The starters have three or four forms each, so choose a service whose free plan allows several forms, or point them all at one. Send a church's prayer requests to an inbox that only the pastors read.

## Editing the site

The pages are plain HTML, so the editor is whatever opens an HTML file.

**On github.com (recommended).** Open the repository, click a file such as `site/events.html`, click the pencil, change the text between the tags, and choose "Commit changes". The site rebuilds and publishes in a minute or two. If the change breaks a page, the build stops, the published site stays as it was, and the Actions tab shows what's wrong. Pressing `.` on any repository page opens [github.dev](https://docs.github.com/en/codespaces/the-githubdev-web-based-editor), a fuller editor in the browser for changing several files at once. Each editor needs a free GitHub account with write access to the repository.

**Pages CMS, for editors without GitHub accounts.** [Pages CMS](https://pagescms.org/) is free and open source. The repository's owner signs in with GitHub and can [invite collaborators by email](https://pagescms.org/docs/configuration/collaborators/); they need no GitHub account. It shows an HTML file in a code editor, not as a visual page, and it handles image and PDF uploads well, which suits a weekly bulletin. Its last release was in June 2026.

**On your own computer.** Any text editor, then `npm run build` and push. This is the only route that lets you preview before publishing.

### If you want form-based editing later

The other free, Git-based editors show fields to fill in (title, date, body) and save them as Markdown or data files. They don't edit hand-written HTML pages, so using one means rebuilding the site on a generator such as Jekyll, Hugo, Eleventy, or Astro first. The [TagKit Jekyll theme](https://github.com/kovirlabs/tagkit-jekyll) keeps the same look.

| Editor | Cost | Editors sign in with | Notes |
|---|---|---|---|
| [Pages CMS](https://pagescms.org/) | Free, open source, hosted for you | GitHub, or an email invitation | The simplest to set up; one config file in the repository |
| [Decap CMS](https://decapcms.org/docs/github-backend/) | Free, open source | A GitHub account with write access | The long-standing choice (once Netlify CMS); actively released |
| [Sveltia CMS](https://sveltiacms.app/en/docs/intro) | Free, open source | An account on the Git host | A newer take on Decap; very active, still in beta |
| [TinaCMS](https://tina.io/pricing) | Open source; free hosted plan for 2 users | A Tina account | Edits on the page itself, but needs a JavaScript framework site |
| [Keystatic](https://keystatic.com/docs/github-mode) | Free, open source | A GitHub account with write access | Runs inside a framework site |
| [Publii](https://github.com/GetPublii/Publii) | Free, open source desktop app | Nothing; it runs on one computer | Builds its own site from its own themes; it doesn't open an existing HTML site |
| [CloudCannon](https://cloudcannon.com/pricing/) | From $55 a month | A CloudCannon account | Visual editing; no free plan |

A visual editor for plain semantic HTML, where you click the words on the page and save, is what [TagEdit](https://github.com/kovirlabs/tagedit) is being designed to be. It doesn't exist yet.

## Programs for nonprofits

- [GitHub for Nonprofits](https://github.com/solutions/industry/nonprofits) gives verified nonprofits the Team plan free, which allows GitHub Pages from a private repository. It asks for 501(c)(3) status or the equivalent; read its [eligibility rules](https://docs.github.com/en/nonprofit/quickstart) before applying, since they exclude some kinds of organization in some countries.
- [Google for Nonprofits](https://support.google.com/nonprofits/answer/3215869) offers free Google Workspace email addresses at your domain. In the US it requires 501(c)(3) registration with the IRS or coverage under a group exemption, which is how many churches qualify through their denomination.
