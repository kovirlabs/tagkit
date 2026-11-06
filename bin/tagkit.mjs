#!/usr/bin/env node
// TagKit command line: `npx @kovirlabs/tagkit build <site folder> <output folder>`

import { watch } from 'node:fs';
import { relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from '../src/include.mjs';

const USAGE = `Usage: npx @kovirlabs/tagkit build <site folder> <output folder> [options]

Builds a static site from plain HTML pages, stitching in shared pieces with
server-side include comments:

  <!--#include file="_includes/header.html" -->       relative to the page
  <!--#include virtual="/_includes/footer.html" -->   relative to the site folder

Pages (.html) are written with their includes filled in; other files are
copied; files and folders whose names start with "_" are left out. Links to
the page being built get aria-current="page", and root links ("/about.html")
in included pieces become relative.

Options:
  --check    run TagCheck on the output (needs tagcheck installed)
  --watch    rebuild when a file in the site folder changes

Exit code: 0 built, 1 errors (a missing include or TagCheck errors), 2 bad usage.`;

async function runCheck(out, log) {
  let tagcheck;
  try {
    tagcheck = await import('@kovirlabs/tagcheck');
  } catch {
    log('--check needs TagCheck: npm install -D @kovirlabs/tagcheck');
    return 1;
  }
  const report = await tagcheck.checkFiles([out]);
  for (const { file, problems } of report.files) {
    for (const p of problems) log(`${file}:${p.line}:${p.column}  ${p.level === 'error' ? 'error  ' : 'warning'}  ${p.rule.padEnd(18)} ${p.message}`);
  }
  log(`TagCheck: ${report.errors} error${report.errors === 1 ? '' : 's'}, ${report.warnings} warning${report.warnings === 1 ? '' : 's'}`);
  return report.errors ? 1 : 0;
}

export async function main(args, log = console.log) {
  const flags = new Set(args.filter((a) => a.startsWith('--')));
  const [command, site, out] = args.filter((a) => !a.startsWith('--'));
  if (flags.has('--help') || command !== 'build' || !site || !out) {
    log(USAGE);
    return flags.has('--help') ? 0 : 2;
  }
  const once = async () => {
    let result;
    try {
      result = build(site, out);
    } catch (error) {
      log(`tagkit: ${error.message}`);
      return 2;
    }
    for (const error of result.errors) log(`error  ${error.message}`);
    log(`${result.pages.length} page${result.pages.length === 1 ? '' : 's'} and ${result.files.length} other file${result.files.length === 1 ? '' : 's'} written to ${relative(process.cwd(), resolve(out)) || '.'}${result.errors.length ? `, ${result.errors.length} with errors` : ''}`);
    let status = result.errors.length ? 1 : 0;
    if (flags.has('--check') && !result.errors.length) status = Math.max(status, await runCheck(out, log));
    return status;
  };
  const status = await once();
  if (!flags.has('--watch')) return status;
  log(`Watching ${site} for changes (Ctrl+C to stop)`);
  let timer;
  watch(site, { recursive: true }, (event, name) => {
    if (name && resolve(site, name).startsWith(resolve(out))) return;
    clearTimeout(timer);
    timer = setTimeout(once, 100);
  });
  return new Promise(() => {});
}

const invoked = process.argv[1] ?? '';
if (invoked && (import.meta.url === pathToFileURL(invoked).href || /[\\/]tagkit(\.cmd)?$/.test(invoked))) {
  process.exitCode = await main(process.argv.slice(2));
}
