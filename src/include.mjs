// Build-time includes: stitch shared pieces (header, nav, footer) into
// static pages. Uses the server-side include syntax web servers already know:
//
//   <!--#include file="_includes/header.html" -->      relative to the page
//   <!--#include virtual="/_includes/footer.html" -->  relative to the site folder
//
// Output is plain HTML. Links to the page being built get aria-current="page",
// and root links ("/about.html") inside included pieces become relative, so
// the site works from any folder, from file://, and from a project URL.
// No dependencies.

import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, posix, relative, resolve, sep } from 'node:path';

const INCLUDE = /<!--#include\s+(file|virtual)\s*=\s*"([^"]+)"\s*-->/g;
const URL_ATTRIBUTE = /(\s(?:href|src|action|poster)\s*=\s*")(\/(?!\/)[^"]*)"/g;
const LINK = /<a\b[^>]*>/g;

/** A partial is any file or folder whose name starts with "_" (it isn't output). */
export const isPartial = (path) => path.split(/[\\/]/).some((part) => part.startsWith('_'));

export class IncludeError extends Error {
  constructor(file, line, message) {
    super(`${file}:${line}  ${message}`);
    Object.assign(this, { file, line });
  }
}

const toUrl = (path) => path.split(sep).join('/');
const lineAt = (text, index) => text.slice(0, index).split('\n').length;

// The page path a link points at, for comparing with the page being built.
function normalizePage(path) {
  return path.replace(/[?#].*$/, '').replace(/(^|\/)index\.html?$/, '$1').replace(/\/$/, '') || '.';
}

/**
 * Make root links relative to `pageUrl` (a path inside the site, like
 * "docs/install.html") and mark links to that page with aria-current.
 */
export function adjustLinks(html, pageUrl) {
  const pageDir = posix.dirname(pageUrl);
  let adjusted = html.replace(URL_ATTRIBUTE, (match, start, url) => {
    const target = url.slice(1);
    const cut = target.search(/[?#]/);
    const [path, rest] = cut === -1 ? [target, ''] : [target.slice(0, cut), target.slice(cut)];
    let rel = posix.relative(pageDir, path || '.') || '.';
    if ((path === '' || path.endsWith('/')) && rel !== '.') rel += '/';
    if (rel === '.') rel = './';
    return `${start}${rel}${rest}"`;
  });
  const here = normalizePage(pageUrl);
  adjusted = adjusted.replace(LINK, (tag) => {
    const href = /\shref\s*=\s*"([^"]*)"/.exec(tag)?.[1];
    if (href === undefined || /\saria-current\s*=/.test(tag) || /^[a-z][a-z0-9+.-]*:|^\/\/|^#/i.test(href)) return tag;
    const target = normalizePage(posix.normalize(posix.join(pageDir, href.replace(/[?#].*$/, '') || posix.basename(pageUrl))));
    return target === here ? tag.replace(/\s*\/?>$/, ' aria-current="page">') : tag;
  });
  return adjusted;
}

/**
 * Resolve the includes in one page. `site` is the site folder, `file` the
 * page's path. Returns the finished HTML; throws IncludeError on a missing
 * file or an include loop.
 */
export function render(site, file, { stack = [], pageUrl = toUrl(relative(site, file)) } = {}) {
  const html = readFileSync(file, 'utf8');
  return html.replace(INCLUDE, (match, kind, path, offset) => {
    const where = toUrl(relative(process.cwd(), file));
    const target = kind === 'virtual' ? join(site, path.replace(/^\/+/, '')) : join(dirname(file), path);
    const relativeTarget = toUrl(relative(process.cwd(), target));
    if (!resolve(target).startsWith(resolve(site) + sep)) {
      throw new IncludeError(where, lineAt(html, offset), `${kind}="${path}" is outside the site folder`);
    }
    if ([file, ...stack].includes(resolve(target))) {
      throw new IncludeError(where, lineAt(html, offset), `${kind}="${path}" includes itself (loop: ${[...stack, file, target].map((f) => toUrl(relative(site, f))).join(' → ')})`);
    }
    let exists = false;
    try { exists = statSync(target).isFile(); } catch { /* missing */ }
    if (!exists) throw new IncludeError(where, lineAt(html, offset), `${kind}="${path}" not found (looked for ${relativeTarget})`);
    const piece = render(site, resolve(target), { stack: [...stack, resolve(file)], pageUrl });
    return adjustLinks(piece.replace(/\n$/, ''), pageUrl);
  });
}

function walk(folder) {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') return [];
    const path = join(folder, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

/**
 * Build `site` into `out`: pages (.html) with includes resolved, other files
 * copied, partials (names starting with "_") left out. Returns
 * { pages: [...], files: [...], errors: [IncludeError, ...] }.
 */
export function build(site, out) {
  site = resolve(site);
  out = resolve(out);
  if (out === site) throw new Error('The output folder must be different from the site folder');
  rmSync(out, { recursive: true, force: true });
  const result = { pages: [], files: [], errors: [] };
  for (const file of walk(site)) {
    const path = relative(site, file);
    if (isPartial(path) || resolve(file).startsWith(out + sep)) continue;
    const destination = join(out, path);
    mkdirSync(dirname(destination), { recursive: true });
    if (/\.html?$/i.test(file)) {
      try {
        writeFileSync(destination, render(site, resolve(file)));
        result.pages.push(toUrl(path));
      } catch (error) {
        if (!(error instanceof IncludeError)) throw error;
        result.errors.push(error);
      }
    } else {
      copyFileSync(file, destination);
      result.files.push(toUrl(path));
    }
  }
  return result;
}
