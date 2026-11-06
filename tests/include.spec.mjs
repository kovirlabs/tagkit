import { test, expect } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { checkFiles } from '@kovirlabs/tagcheck';
import { adjustLinks } from '../src/include.mjs';

const OUT = 'test-results/include-site';
const run = (...args) => spawnSync(process.execPath, ['bin/tagkit.mjs', ...args], { encoding: 'utf8' });
const page = (path) => readFileSync(`${OUT}/${path}`, 'utf8');

test.describe('tagkit build', () => {
  test.describe.configure({ mode: 'serial' }); // one build, shared by these tests
  test.beforeAll(() => {
    const result = run('build', 'tests/fixtures/site', OUT);
    expect(result.status, result.stdout).toBe(0);
    expect(result.stdout).toContain('4 pages and 1 other file written');
  });

  test('includes are filled in, nested ones too, and no include comments remain', () => {
    for (const path of ['index.html', 'about.html', 'docs/index.html', 'docs/install.html']) {
      const html = page(path);
      expect(html, path).not.toContain('<!--#include');
      expect(html, path).toContain('<strong><a href=');
      expect(html, path).toContain('© 2026 Acme');
      expect(html, path).toContain('tagbrush.min.css');
    }
  });

  test('partials are left out and other files are copied', () => {
    expect(existsSync(`${OUT}/_includes`)).toBe(false);
    expect(existsSync(`${OUT}/images/logo.svg`)).toBe(true);
  });

  test('root links in included pieces become relative to each page', () => {
    expect(page('index.html')).toContain('<li><a href="about.html"');
    expect(page('index.html')).toContain('<img src="images/logo.svg"');
    expect(page('docs/install.html')).toContain('<li><a href="../about.html">About</a></li>');
    expect(page('docs/install.html')).toContain('<li><a href="../">Home</a></li>');
    expect(page('docs/install.html')).toContain('<img src="../images/logo.svg"');
  });

  test('links to the page being built get aria-current="page"; others do not', () => {
    const current = (path) => [...page(path).matchAll(/<a [^>]*aria-current="page"[^>]*>([^<]*)</g)].map((m) => m[1]);
    expect(current('index.html')).toEqual(['Acme', 'Home']);
    expect(current('about.html')).toEqual(['About', 'About us']);
    expect(current('docs/index.html')).toEqual(['Docs']);
    expect(current('docs/install.html')).toEqual(['Install']);
  });

  test('the page\'s own content is left exactly as written', () => {
    expect(page('docs/install.html')).toContain('<p><a href="install.html">Install Acme</a></p>');
  });

  test('the built site passes TagCheck and works from file://', async ({ page: browserPage }) => {
    const report = await checkFiles([OUT]);
    expect(report.files.flatMap((f) => f.problems.map((p) => `${f.file}:${p.line} ${p.rule}`))).toEqual([]);
    await browserPage.route(/tagbrush@1|tagaction@0/, (r) => r.fulfill({ body: '' }));
    await browserPage.goto(pathToFileURL(resolve(`${OUT}/docs/install.html`)).href);
    await browserPage.getByRole('link', { name: 'About', exact: true }).click();
    await expect(browserPage.getByRole('heading', { level: 1 })).toHaveText('About Acme');
    await expect(browserPage.getByRole('img', { name: 'Acme logo' })).toHaveJSProperty('naturalWidth', 150);
  });

  test('--check runs TagCheck on the output', () => {
    const result = run('build', 'tests/fixtures/site', 'test-results/include-check', '--check');
    expect(result.stdout).toContain('TagCheck: 0 errors, 0 warnings');
    expect(result.status).toBe(0);
  });
});

test.describe('errors', () => {
  test('a missing include and an include loop are reported with file and line, exit code 1', () => {
    const result = run('build', 'tests/fixtures/broken', 'test-results/include-broken');
    expect(result.status).toBe(1);
    expect(result.stdout).toMatch(/tests\/fixtures\/broken\/missing\.html:5 {2}file="_includes\/missing\.html" not found/);
    expect(result.stdout).toMatch(/includes itself \(loop: loop\.html → _includes\/a\.html → _includes\/b\.html → _includes\/a\.html\)/);
  });

  test('bad usage exits with 2', () => {
    expect(run().status).toBe(2);
    expect(run('build', 'tests/fixtures/site').status).toBe(2);
    expect(run('build', 'tests/fixtures/site', 'tests/fixtures/site').status).toBe(2);
  });
});

test.describe('adjustLinks', () => {
  test('leaves external, protocol-relative, mailto, and hash links alone', () => {
    const html = '<a href="https://example.com/">x</a><a href="//cdn.example.com/a.js">y</a><a href="mailto:a@b.c">z</a><a href="#top">t</a>';
    expect(adjustLinks(html, 'docs/page.html')).toBe(html);
  });

  test('keeps query strings and fragments, and an existing aria-current', () => {
    expect(adjustLinks('<a href="/search.html?q=a#r">S</a>', 'docs/page.html')).toBe('<a href="../search.html?q=a#r">S</a>');
    expect(adjustLinks('<a href="/docs/page.html" aria-current="true">P</a>', 'docs/page.html')).toBe('<a href="page.html" aria-current="true">P</a>');
  });
});
