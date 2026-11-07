import { test, expect } from '@playwright/test';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { checkFiles } from '@kovirlabs/tagcheck';

// Pandoc on PATH, or a command in PANDOC (for example a Docker wrapper).
const PANDOC = (process.env.PANDOC ?? 'pandoc').split(' ');
const hasPandoc = spawnSync(PANDOC[0], [...PANDOC.slice(1), '--version']).status === 0;
const OUT = 'test-results/pandoc';

test.describe('Pandoc template', () => {
  test.skip(!hasPandoc, 'Pandoc is not installed (set PANDOC to a command that runs it)');

  test.beforeAll(() => {
    mkdirSync(OUT, { recursive: true });
    const run = (...args) => execFileSync(PANDOC[0], [...PANDOC.slice(1), ...args], { stdio: 'pipe' });
    run('themes/pandoc/example.md', '--standalone', '--toc', '--template', 'themes/pandoc/template.html', '-o', `${OUT}/example.html`);
    run('themes/pandoc/example.md', '--standalone', '--template', 'themes/pandoc/template.html',
      '--metadata', 'no-tagaction=true', '--metadata', 'primary-color=#7c3aed', '-o', `${OUT}/plain.html`);
  });

  test('the converted page passes TagCheck, including contrast and phone overflow', async () => {
    test.setTimeout(120000);
    const report = await checkFiles([`${OUT}/example.html`, `${OUT}/plain.html`], { browser: true });
    expect(report.files.flatMap((f) => f.problems.map((p) => `${f.file}:${p.line} ${p.rule}: ${p.message}`))).toEqual([]);
  });

  test('the title block, contents beside the text, and TagAction behaviors', async ({ page }) => {
    await page.route(/tagbrush@1/, (r) => r.fulfill({ path: 'node_modules/tagbrush/tagbrush.css', contentType: 'text/css' }));
    await page.route(/tagaction@0/, (r) => r.fulfill({ path: 'node_modules/tagaction/tagaction.js', contentType: 'text/javascript' }));
    await page.goto(pathToFileURL(resolve(`${OUT}/example.html`)).href);
    await expect(page.locator('article > header h1')).toHaveText('Field notes on plain HTML');
    await expect(page.locator('main > aside nav[aria-label="Contents"] a').first()).toHaveAttribute('aria-current', 'true');
    await expect(page.getByRole('button', { name: 'Copy' })).toHaveCount(1);
    await expect(page.locator('th[aria-sort], th button[data-tag="sort"]')).toHaveCount(3);
    await expect(page.locator('style')).toHaveCount(0); // Pandoc's highlighting CSS is left out
  });

  test('metadata sets the brand color and can leave out TagAction', async () => {
    const { readFileSync } = await import('node:fs');
    const html = readFileSync(`${OUT}/plain.html`, 'utf8');
    expect(html).toContain('--color-primary: #7c3aed');
    expect(html).not.toContain('tagaction');
  });
});

test.describe('MkDocs theme', () => {
  // Built by themes/mkdocs/build-example.sh (CI runs it before the tests).
  const SITE = 'themes/mkdocs/example/site';
  test.skip(!existsSync(`${SITE}/index.html`), 'Run themes/mkdocs/build-example.sh first (needs Python)');

  test('every page passes TagCheck, including contrast and phone overflow', async () => {
    test.setTimeout(120000);
    const report = await checkFiles([SITE], { browser: true });
    expect(report.files.length).toBe(4);
    expect(report.files.flatMap((f) => f.problems.map((p) => `${f.file}:${p.line} ${p.rule}: ${p.message}`))).toEqual([]);
  });

  test('site nav marks the current page; the page has its own contents and prev/next links', async ({ page }) => {
    await page.route(/tagbrush@1/, (r) => r.fulfill({ path: 'node_modules/tagbrush/tagbrush.css', contentType: 'text/css' }));
    await page.route(/tagaction@0/, (r) => r.fulfill({ path: 'node_modules/tagaction/tagaction.js', contentType: 'text/javascript' }));
    await page.goto(pathToFileURL(resolve(`${SITE}/guide/install/index.html`)).href);
    await expect(page.locator('body > aside nav a[aria-current="page"]')).toHaveText('Install');
    await expect(page.locator('main > aside nav[aria-label="On this page"] a')).toHaveText(['Requirements', 'With pip', 'Check the install']);
    await expect(page.locator('a[rel="prev"]')).toHaveText('← Home');
    await expect(page.locator('a[rel="next"]')).toHaveText('Configure →');
    await expect(page.getByRole('button', { name: 'Copy' })).toHaveCount(2);
    await expect(page.locator('head meta[name="description"]')).toHaveAttribute('content', 'Deploy a folder of static files with one command.');
  });
});
