import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { checkFiles } from '@kovirlabs/tagcheck';

const TEMPLATES = readdirSync('templates').filter((f) => f.endsWith('.html')).map((f) => `templates/${f}`);
const PREVIEWS = readdirSync('preview').filter((f) => f.endsWith('.html')).map((f) => `preview/${f}`);
const PAGES = [...TEMPLATES, ...PREVIEWS, 'index.html'];
const catalog = JSON.parse(readFileSync('snippets.json', 'utf8'));

// Serve the pinned TagBrush.css and TagAction, and a stand-in for photos.
async function open(page, file, { javaScript = true } = {}) {
  await page.route(/tagbrush@[^/]+\/tagbrush(\.min)?\.css/, (r) => r.fulfill({ path: 'node_modules/tagbrush/tagbrush.css', contentType: 'text/css' }));
  await page.route(/tagaction@[^/]+\/tagaction(\.min)?\.js/, (r) => (javaScript ? r.fulfill({ path: 'node_modules/tagaction/tagaction.js', contentType: 'text/javascript' }) : r.abort()));
  await page.route(/picsum\.photos/, (r) => r.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><rect width="1600" height="900" fill="#94a3b8"/></svg>' }));
  await page.goto(pathToFileURL(resolve(file)).href);
}

test.describe('TagCheck', () => {
  test('every template, snippet preview, and the gallery has no errors or warnings', async () => {
    const report = await checkFiles(PAGES);
    expect(report.files.flatMap((f) => f.problems.map((p) => `${f.file}:${p.line} ${p.rule}: ${p.message}`))).toEqual([]);
  });

  test('every page meets WCAG AA contrast in light and dark mode and fits a phone (--browser)', async () => {
    test.setTimeout(300000);
    const report = await checkFiles(PAGES, { browser: true });
    expect(report.files.flatMap((f) => f.problems.map((p) => `${f.file}: ${p.rule}: ${p.message}`))).toEqual([]);
  });
});

test.describe('with TagAction', () => {
  for (const file of PAGES) {
    test(`${file} runs without errors`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
      await open(page, file);
      await expect.poll(() => page.evaluate(() => typeof window.TagAction)).toBe('object');
      expect(errors).toEqual([]);
    });
  }

  // TagAction opens a link around an image in its viewer only when the link
  // points to an image file (.jpg, .png, …). Found by the family agent evaluation.
  test('every photo linked to a larger version opens in TagAction\'s viewer', async ({ page }) => {
    let checked = 0;
    for (const file of PAGES) {
      await open(page, file);
      await expect.poll(() => page.evaluate(() => typeof window.TagAction)).toBe('object');
      // A link whose only content is a photo (not a logo beside text, like the family bar's).
      const links = page.locator('a[href]:has(> img:only-child)').filter({ hasNotText: /\S/ });
      for (let i = 0; i < await links.count(); i++) {
        const href = await links.nth(i).getAttribute('href');
        await links.nth(i).click();
        await expect(page.locator('[data-tag="viewer"]'), `${file}: ${href}`).toBeVisible();
        await page.keyboard.press('Escape');
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(0);
  });

  test('the admin table sorts, filters, and opens the invite dialog', async ({ page }) => {
    await open(page, 'templates/admin-table.html');
    await page.getByRole('button', { name: 'Name', exact: true }).click();
    await expect(page.locator('#users tbody td:first-child').first()).toHaveText('Elena Kowalczyk');
    await page.getByLabel('Filter users').fill('editor');
    await expect(page.locator('#users tbody tr:visible')).toHaveCount(2);
    await page.getByRole('button', { name: 'Invite user' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('the dashboard account menu drops down and closes with Escape', async ({ page }) => {
    await open(page, 'templates/dashboard.html');
    const button = page.getByRole('button', { name: 'Maya Lin' });
    await expect(page.locator('#account-menu')).toBeHidden();
    await button.click();
    await expect(page.getByRole('link', { name: 'Sign out' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#account-menu')).toBeHidden();
  });

  test('the docs page builds its table of contents and code copy buttons', async ({ page }) => {
    await open(page, 'templates/docs.html');
    await expect(page.locator('nav[data-tag-toc] a')).toHaveText(['Requirements', 'Install', 'Check the install', 'Your first deploy']);
    await expect(page.getByRole('button', { name: 'Copy' })).toHaveCount(2);
  });

  test('repeatable rows: Add copies a row, Remove takes any row out, and focus follows', async ({ page }) => {
    await open(page, 'preview/repeatable-rows.html');
    const rows = page.locator('ol > li');
    await page.getByRole('button', { name: 'Add expense' }).click();
    await page.getByRole('button', { name: 'Add expense' }).click();
    await expect(rows).toHaveCount(3);
    await expect(page.getByRole('button', { name: 'Remove' })).toHaveCount(3);
    await page.getByRole('button', { name: 'Remove' }).nth(1).click();
    await expect(rows).toHaveCount(2);
    await expect(page.getByLabel('What it was for').first()).toBeFocused();
  });

  test('the confirm dialog\'s destructive button is red', async ({ page }) => {
    await open(page, 'preview/confirm-dialog.html');
    await page.getByRole('button', { name: 'Delete project' }).click();
    const [confirm, cancel] = [page.getByRole('dialog').getByRole('button', { name: 'Delete project' }), page.getByRole('dialog').getByRole('button', { name: 'Cancel' })];
    const bg = (locator) => locator.evaluate((el) => getComputedStyle(el).backgroundColor);
    const red = await page.evaluate(() => { const i = document.createElement('i'); i.style.color = 'oklch(from var(--color-error) min(l, 0.5) c h)'; document.body.append(i); return getComputedStyle(i).color; });
    expect(await bg(confirm)).toBe(red);
    expect(await bg(cancel)).not.toBe(red);
  });

  test('the sign-up form shows messages under fields and has a password toggle', async ({ page }) => {
    await open(page, 'templates/signup.html');
    await page.getByRole('button', { name: 'Join' }).click();
    await expect(page.getByLabel('Name')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByRole('button', { name: 'Show password' })).toBeVisible();
    await expect(page.locator('[data-tag="count"]')).toHaveText('0 / 200');
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  for (const file of TEMPLATES) {
    test(`${file}: nothing but TagAction-only controls is hidden, and dropdown lists show`, async ({ page }) => {
      await open(page, file, { javaScript: false });
      const hidden = await page.locator('body [hidden]').evaluateAll((els) => els.map((e) => e.outerHTML.slice(0, 100)));
      for (const html of hidden) expect(html).toMatch(/command="--(clone|remove)"|aria-controls=/);
      for (const id of await page.locator('button[aria-expanded][aria-controls]').evaluateAll((els) => els.map((e) => e.getAttribute('aria-controls')))) {
        await expect(page.locator(`#${id}`)).toBeVisible();
      }
    });
  }
});

test.describe('catalog', () => {
  test('snippets.json and llms.txt list every snippet and template', () => {
    const guide = readFileSync('llms.txt', 'utf8');
    expect(catalog.snippets.map((s) => s.file).sort()).toEqual(readdirSync('snippets').map((f) => `snippets/${f}`).sort());
    expect(catalog.templates.map((t) => t.file).sort()).toEqual(TEMPLATES.sort());
    for (const item of [...catalog.snippets, ...catalog.templates]) expect(guide).toContain(item.url);
  });

  test('templates link the family CDN files and nothing else from a CDN', () => {
    for (const file of TEMPLATES) {
      const html = readFileSync(file, 'utf8');
      expect(html, file).toContain('https://cdn.jsdelivr.net/npm/tagbrush@1/tagbrush.min.css');
      expect(html, file).toContain('https://cdn.jsdelivr.net/npm/tagaction@0/tagaction.min.js');
      const others = [...html.matchAll(/(?:src|href)="(https:\/\/cdn[^"]+)"/g)].map((m) => m[1]).filter((url) => !/tag(brush|action)@/.test(url));
      expect(others, file).toEqual([]);
    }
  });

  test('the CDN lines match the libraries\' own guides', () => {
    expect(readFileSync('node_modules/tagbrush/llms.txt', 'utf8')).toContain('tagbrush@1/tagbrush.min.css');
    expect(readFileSync('node_modules/tagaction/llms.txt', 'utf8')).toContain('tagaction@0/tagaction.min.js');
  });

  test('generated agent files match llms.txt', () => {
    const guide = readFileSync('llms.txt', 'utf8').trim();
    for (const file of ['ai/claude/tagkit/SKILL.md', 'ai/cursor/tagkit.mdc']) expect(readFileSync(file, 'utf8')).toContain(guide);
  });
});
