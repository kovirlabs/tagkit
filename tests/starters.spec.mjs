import { test, expect } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { checkFiles } from '@kovirlabs/tagcheck';

// Starter sites: a site/ folder built with `tagkit build`. Each is tested as built.

const walk = (folder) => readdirSync(folder, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? walk(join(folder, e.name)) : [join(folder, e.name)]));

async function openIn(page, OUT, path, { javaScript = true } = {}) {
  await page.route(/tagbrush@[^/]+\/tagbrush(\.min)?\.css/, (r) => r.fulfill({ path: 'node_modules/tagbrush/tagbrush.css', contentType: 'text/css' }));
  await page.route(/tagaction@[^/]+\/tagaction(\.min)?\.js/, (r) => (javaScript ? r.fulfill({ path: 'node_modules/tagaction/tagaction.js', contentType: 'text/javascript' }) : r.abort()));
  await page.route(/picsum\.photos/, (r) => r.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><rect width="1600" height="900" fill="#94a3b8"/></svg>' }));
  await page.goto(pathToFileURL(resolve(OUT, path)).href);
  if (javaScript) await expect.poll(() => page.evaluate(() => typeof window.TagAction)).toBe('object');
}

// The checks every starter gets. Returns the folder the starter was built into.
function shared(name, expectedPages) {
  const STARTER = `starters/${name}`;
  const OUT = `test-results/starter-${name}`;
  const pages = [];
  test.beforeAll(() => {
    const result = spawnSync(process.execPath, ['bin/tagkit.mjs', 'build', `${STARTER}/site`, OUT, '--check'], { encoding: 'utf8' });
    expect(result.status, result.stdout).toBe(0);
    expect(result.stdout).toContain('TagCheck: 0 errors, 0 warnings');
    pages.push(...walk(OUT).filter((f) => f.endsWith('.html')).map((f) => f.slice(OUT.length + 1)));
  });

  test('builds every page with no include comments left', () => {
    expect([...pages].sort()).toEqual(expectedPages);
    for (const path of pages) expect(readFileSync(join(OUT, path), 'utf8'), path).not.toContain('<!--#include');
  });

  test('every page meets WCAG AA contrast in light and dark mode and fits a phone (--browser)', async () => {
    test.setTimeout(300000);
    const report = await checkFiles([OUT], { browser: true });
    expect(report.files.flatMap((f) => f.problems.map((p) => `${f.file}: ${p.rule}: ${p.message}`))).toEqual([]);
  });

  test('no broken links or missing anchors between pages', () => {
    const broken = [];
    for (const path of pages) {
      const file = join(OUT, path);
      for (const [, url] of readFileSync(file, 'utf8').matchAll(/(?:href|src)="([^"]+)"/g)) {
        if (/^([a-z]+:|#)/i.test(url)) continue;
        const [target, hash] = url.split('#');
        const targetFile = target ? resolve(dirname(file), target) : resolve(file);
        if (!existsSync(targetFile)) broken.push(`${path} -> ${url}`);
        else if (hash && !readFileSync(targetFile, 'utf8').includes(`id="${hash}"`)) broken.push(`${path} -> ${url}`);
      }
    }
    expect(broken).toEqual([]);
  });

  test('loads the family CDN files and nothing else from a CDN', () => {
    const head = readFileSync(`${STARTER}/site/_includes/head.html`, 'utf8');
    expect(head).toContain('https://cdn.jsdelivr.net/npm/tagbrush@2/tagbrush.min.css');
    expect(head).toContain('https://cdn.jsdelivr.net/npm/tagaction@0/tagaction.min.js');
    for (const path of pages) {
      const others = [...readFileSync(join(OUT, path), 'utf8').matchAll(/(?:src|href)="(https:\/\/cdn[^"]+)"/g)].map((m) => m[1]).filter((u) => !/tag(brush|action)@/.test(u));
      expect(others, path).toEqual([]);
    }
  });

  test('every page runs TagAction without errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    for (const path of pages) await openIn(page, OUT, path);
    expect(errors).toEqual([]);
  });

  test('without JavaScript, only TagAction-only controls are hidden', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    for (const path of pages) {
      await openIn(page, OUT, path, { javaScript: false });
      const hidden = await page.locator('body [hidden]').evaluateAll((els) => els.map((e) => e.outerHTML.slice(0, 100)));
      for (const html of hidden) expect(html, path).toMatch(/command="--clone"|aria-controls=|data-tag-toc/);
    }
    await context.close();
  });
  return OUT;
}

test.describe('nonprofit starter', () => {
  test.describe.configure({ mode: 'serial' }); // one build, shared by these tests
  const OUT = shared('nonprofit', ['404.html', 'about.html', 'contact.html', 'donate.html', 'events.html', 'get-involved.html', 'index.html',
    'news/index.html', 'news/walk-in-cooler.html', 'news/winter-coat-drive.html', 'privacy.html', 'programs.html', 'transparency.html']);
  const open = (page, path) => openIn(page, OUT, path);

  test('the nav marks the current page', async ({ page }) => {
    await open(page, 'news/index.html');
    await expect(page.locator('body > header nav a[aria-current="page"]')).toHaveText('News');
    await page.locator('body > header nav').getByRole('link', { name: 'Donate' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Feed a neighbor this week');
  });

  test('events sort, filter, and show the access popover', async ({ page }) => {
    await open(page, 'events.html');
    await page.getByRole('button', { name: 'Event', exact: true }).click();
    await expect(page.locator('#events-table tbody td:first-child').first()).toHaveText('Holiday food drive at Riverbend High');
    await page.getByLabel('Filter events').fill('drive');
    await expect(page.locator('#events-table tbody tr:visible')).toHaveCount(2);
    await page.getByRole('button', { name: 'About access at our events' }).click();
    await expect(page.locator('#access-info')).toBeVisible();
  });

  test('the donate form totals the gift and opens the mailing address dialog', async ({ page }) => {
    await open(page, 'donate.html');
    const total = page.locator('output');
    await expect(total).toHaveText('50');
    await page.getByLabel(/\$100 fills/).check();
    await page.getByLabel(/Add \$3/).check();
    await expect(total).toHaveText('103');
    await page.getByRole('button', { name: 'Our mailing address' }).click();
    await expect(page.getByRole('dialog')).toContainText('214 Mill Street');
    await page.getByRole('dialog').getByRole('button', { name: 'Done' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('the volunteer form validates, adds people, counts characters, and explains the first shift', async ({ page }) => {
    await open(page, 'get-involved.html');
    await page.getByRole('button', { name: 'Send my sign-up' }).click();
    await expect(page.getByLabel('Name', { exact: true })).toHaveAttribute('aria-invalid', 'true');
    await page.getByRole('button', { name: 'Add another person' }).click();
    await expect(page.getByLabel('Name of someone coming with you')).toHaveCount(2);
    await expect(page.locator('[data-tag="count"]')).toHaveText('0 / 500');
    await page.getByRole('button', { name: 'What to expect' }).click();
    await expect(page.getByRole('dialog')).toContainText('closed-toe shoes');
  });

  test('the financials page builds its table of contents', async ({ page }) => {
    await open(page, 'transparency.html');
    await expect(page.locator('nav[data-tag-toc] a')).toHaveText(['At a glance', 'Where the money comes from', 'Where it goes', 'Tax filings and audits', 'Governance']);
  });
});

test.describe('church starter', () => {
  test.describe.configure({ mode: 'serial' });
  const OUT = shared('church', ['404.html', 'about.html', 'beliefs.html', 'connect.html', 'contact.html', 'events.html', 'give.html', 'index.html',
    'ministries.html', 'privacy.html', 'sermons/index.html', 'sermons/the-great-banquet.html', 'sermons/the-lost-sheep.html', 'visit.html']);
  const open = (page, path) => openIn(page, OUT, path);

  test('the nav marks the current page', async ({ page }) => {
    await open(page, 'sermons/index.html');
    await expect(page.locator('body > header nav a[aria-current="page"]')).toHaveText('Sermons');
    await page.locator('body > header nav').getByRole('link', { name: 'Give' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Give');
  });

  test('events sort, filter, and show the access popover', async ({ page }) => {
    await open(page, 'events.html');
    await page.getByRole('button', { name: 'Event', exact: true }).click();
    await expect(page.locator('#events-table tbody td:first-child').first()).toHaveText('Advent wreath-making for families');
    await page.getByLabel('Filter events').fill('christmas');
    await expect(page.locator('#events-table tbody tr:visible')).toHaveCount(3);
    await page.getByRole('button', { name: 'About access at our events' }).click();
    await expect(page.locator('#access-info')).toBeVisible();
  });

  test('the give form totals the gift and opens the mailing address dialog', async ({ page }) => {
    await open(page, 'give.html');
    const total = page.locator('output');
    await expect(total).toHaveText('50');
    await page.getByLabel('$100', { exact: true }).check();
    await page.getByLabel(/Add \$3/).check();
    await expect(total).toHaveText('103');
    await page.getByRole('button', { name: 'Our mailing address' }).click();
    await expect(page.getByRole('dialog')).toContainText('40 Orchard Road');
    await page.getByRole('dialog').getByRole('button', { name: 'Done' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('the connect card validates, adds people, and counts characters; the prayer form needs a request', async ({ page }) => {
    await open(page, 'connect.html');
    await page.getByRole('button', { name: 'Send my card' }).click();
    await expect(page.getByLabel('Name', { exact: true })).toHaveAttribute('aria-invalid', 'true');
    await page.getByRole('button', { name: 'Add another person' }).click();
    await expect(page.getByLabel('Name and age of someone coming with you')).toHaveCount(2);
    await expect(page.locator('[data-tag="count"]').first()).toHaveText('0 / 500');
    await page.getByRole('button', { name: 'What happens next' }).click();
    await expect(page.getByRole('dialog')).toContainText('Monday morning');
    await page.getByRole('dialog').getByRole('button', { name: 'Got it' }).click();
    await page.getByRole('button', { name: 'Send my request' }).click();
    await expect(page.getByLabel('How can we pray for you?')).toHaveAttribute('aria-invalid', 'true');
  });

  test('the visit page explains a service in a dialog and keeps one question open at a time', async ({ page }) => {
    await open(page, 'visit.html');
    await page.getByRole('button', { name: 'What a service is like' }).click();
    await expect(page.getByRole('dialog')).toContainText('70 minutes');
    await page.getByRole('dialog').getByRole('button', { name: 'Got it' }).click();
    await page.getByText('What about my kids?').click();
    await expect(page.locator('details[open]')).toHaveCount(1);
  });

  test('the beliefs page builds its table of contents', async ({ page }) => {
    await open(page, 'beliefs.html');
    await expect(page.locator('nav[data-tag-toc] a')).toHaveText(['God', 'Jesus', 'The Bible', 'Grace', 'The church', 'How we live']);
  });
});
