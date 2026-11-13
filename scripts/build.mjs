// Builds everything generated from snippets/ and templates/:
//   preview/<snippet>.html   each snippet in a complete page (what the tests check)
//   snippets.json            the catalog, for tools and agents
//   index.html               the gallery: every snippet and template with its code
//   llms.txt                 the catalog section between the markers
//   ai/…                     agent instruction files generated from llms.txt
// Run with `npm run build`. Edit snippets/ and templates/, never the outputs.

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (file) => readFileSync(new URL(file, root), 'utf8');
const write = (file, contents) => {
  const slash = file.lastIndexOf('/');
  if (slash > 0) mkdirSync(new URL(file.slice(0, slash + 1), root), { recursive: true });
  writeFileSync(new URL(file, root), contents.endsWith('\n') ? contents : contents + '\n');
};
const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const RAW = 'https://raw.githubusercontent.com/kovirlabs/tagkit/main';
const HEAD = (title, description) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(title)}</title>
<meta name="description" content="${escape(description).replace(/"/g, '&quot;')}">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tagbrush@2/tagbrush.min.css">
<script src="https://cdn.jsdelivr.net/npm/tagaction@0/tagaction.min.js" defer></script>
</head>`;

// Each snippet starts with <!-- Name (body): Description. --> ; "(body)" means
// it is page-level (goes directly in <body>), otherwise it goes inside <main>.
const HEADER = /^<!-- ([^:(]+?)(?: \((body)\))?: ([\s\S]+?) -->\n/;
const snippets = readdirSync(new URL('snippets/', root)).filter((f) => f.endsWith('.html')).sort().map((file) => {
  const source = read(`snippets/${file}`);
  const match = HEADER.exec(source);
  if (!match) throw new Error(`snippets/${file} must start with <!-- Name: Description. --> or <!-- Name (body): Description. -->`);
  const [header, name, body, description] = match;
  return { id: file.replace(/\.html$/, ''), name, description, where: body ? 'body' : 'main', file: `snippets/${file}`, url: `${RAW}/snippets/${file}`, html: source.slice(header.length).trim() };
});

const templates = readdirSync(new URL('templates/', root)).filter((f) => f.endsWith('.html')).sort().map((file) => {
  const match = HEADER.exec(read(`templates/${file}`));
  if (!match) throw new Error(`templates/${file} must start with <!-- Name: Description. -->`);
  return { id: file.replace(/\.html$/, ''), name: match[1], description: match[3], file: `templates/${file}`, url: `${RAW}/templates/${file}` };
});

// Preview pages.
for (const snippet of snippets) {
  const inner = snippet.where === 'body'
    ? snippet.html
    : `<main>\n<h1>${escape(snippet.name)}</h1>\n${snippet.html}\n</main>`;
  write(`preview/${snippet.id}.html`, `${HEAD(`${snippet.name} · TagKit preview`, snippet.description)}\n<body>\n${inner}\n</body>\n</html>`);
}

// Catalog.
write('snippets.json', JSON.stringify({
  snippets: snippets.map(({ html, ...rest }) => rest),
  templates,
}, null, 2));

// Gallery.
// The gallery (the GitHub Pages site) wears the Tag family brand; previews
// keep TagBrush.css's defaults so they show what a snippet looks like.
const BRAND = `<link rel="icon" href="https://kovirlabs.github.io/tagstack/mark.svg" type="image/svg+xml">
<link rel="stylesheet" href="https://kovirlabs.github.io/tagstack/brand.css">
`;
const gallery = `${HEAD('TagKit: templates and snippets in plain HTML', 'Copy-paste page templates and snippets for TagBrush.css and TagAction.').replace('<script ', `${BRAND}<script `)}
<body>
<header>
  <nav aria-label="Tag family" data-brand="bar">
    <a href="https://kovirlabs.github.io/tagstack/"><img src="https://kovirlabs.github.io/tagstack/mark.svg" alt="" width="24" height="24">Tag family</a>
    <ul>
      <li><a href="https://kovirlabs.github.io/tagbrush/">TagBrush.css</a></li>
      <li><a href="https://kovirlabs.github.io/tagaction/">TagAction</a></li>
      <li><a href="https://kovirlabs.github.io/tagcheck/">TagCheck</a></li>
      <li><a href="https://kovirlabs.github.io/tagkit/" aria-current="page">TagKit</a></li>
      <li><a href="https://github.com/kovirlabs/tagkit">GitHub</a></li>
    </ul>
  </nav>
  <nav aria-label="TagKit"><strong>TagKit</strong><ul><li><a href="#templates">Templates</a></li><li><a href="#snippets">Snippets</a></li><li><a href="llms.txt">llms.txt</a></li></ul></nav>
  <hgroup>
    <h1>Templates and snippets in plain HTML</h1>
    <p>Copy the HTML. TagBrush.css styles it, TagAction makes it behave, and every piece passes TagCheck.</p>
  </hgroup>
</header>
<main>
  <aside><nav data-tag-toc hidden aria-label="On this page"></nav></aside>
  <article>
    <h2 id="templates">Page templates</h2>
    <p>Complete pages. Open one, then copy its source.</p>
    <ul>
${templates.map((t) => `      <li><a href="${t.file}">${escape(t.name)}</a>: ${escape(t.description)}</li>`).join('\n')}
    </ul>
    <h2 id="snippets">Snippets</h2>
    <p>Pieces to paste into a page that already links TagBrush.css (and TagAction, for the behaviors).</p>
${snippets.map((s) => `    <h3 id="${s.id}">${escape(s.name)}</h3>
    <p>${escape(s.description)} <a href="preview/${s.id}.html">Preview the ${escape(s.name.toLowerCase())}</a>.</p>
    <pre><code>${escape(s.html)}</code></pre>`).join('\n')}
  </article>
</main>
<footer data-brand="footer">
  <p>TagKit is open source under Apache-2.0. <a href="https://github.com/kovirlabs/tagkit">Source on GitHub</a>, <a href="https://www.npmjs.com/package/@kovirlabs/tagkit">package on npm</a>. Themes: <a href="https://kovirlabs.github.io/tagkit-jekyll/">Jekyll</a>, <a href="https://kovirlabs.github.io/tagkit-wordpress/">WordPress</a>.</p>
  <p>Part of the <a href="https://kovirlabs.github.io/tagstack/">Tag family</a> from Kovir Labs.</p>
</footer>
</body>
</html>`;
write('index.html', gallery);

// The catalog section of llms.txt.
const START = '<!-- catalog:start (generated by scripts/build.mjs) -->';
const END = '<!-- catalog:end -->';
let guide = read('llms.txt');
if (!guide.includes(START) || !guide.includes(END)) throw new Error('llms.txt needs the catalog:start and catalog:end markers');
const catalog = [
  START,
  '',
  '## Page templates',
  '',
  ...templates.map((t) => `- [${t.name}](${t.url}): ${t.description}`),
  '',
  '## Snippets',
  '',
  ...snippets.map((s) => `- [${s.name}](${s.url})${s.where === 'body' ? ' (page-level: goes directly in `<body>`)' : ''}: ${s.description}`),
  '',
  END,
].join('\n');
guide = guide.slice(0, guide.indexOf(START)) + catalog + guide.slice(guide.indexOf(END) + END.length);
write('llms.txt', guide);

// Agent instruction files.
const text = guide.trim();
const generated = '<!-- Generated from llms.txt by scripts/build.mjs. Do not edit directly. -->';
write('ai/claude/tagkit/SKILL.md', ['---', 'name: tagkit',
  'description: Start pages from TagKit templates and snippets (landing, dashboard, docs, blog post, sign-up, admin table; hero, pricing, FAQ, stat tiles, data tables, dialogs, forms) in plain semantic HTML for TagBrush.css and TagAction. Use when building a page or section that one of them covers.',
  '---', '', generated, '', text].join('\n'));
write('ai/cursor/tagkit.mdc', ['---', 'description: Start HTML pages and sections from TagKit templates and snippets (plain semantic HTML for TagBrush.css and TagAction)',
  'globs: ["**/*.html", "**/*.htm"]', 'alwaysApply: false', '---', '', generated, '', text].join('\n'));
write('ai/AGENTS.md', [generated, '', text.replace(/^(#+) /gm, '#$1 ')].join('\n'));

console.log(`${templates.length} templates, ${snippets.length} snippets: preview/, snippets.json, index.html, llms.txt, ai/ written`);
