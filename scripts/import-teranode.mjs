#!/usr/bin/env node
// Imports the operator pages of the Teranode documentation into nodes/teranode/.
//
// The source is the docs/ folder and the mkdocs.yml nav of
// https://github.com/bsv-blockchain/teranode. The script converts each page
// from MkDocs Markdown to MDX, copies the images it uses into
// images/teranode/, and rewrites the Teranode groups of the Node Software tab
// in writedocs.json. Rerun it when the Teranode docs change.
//
//   node scripts/import-teranode.mjs                   clone the main branch
//   node scripts/import-teranode.mjs --ref <branch|sha>
//   node scripts/import-teranode.mjs --src <checkout>  use a local checkout
//
// nodes/teranode/index.mdx is written by hand and is never touched.
// Every other file under nodes/teranode/ and images/teranode/ is replaced.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const REPO = 'bsv-blockchain/teranode';
const SITE = 'https://bsv-blockchain.github.io/teranode/';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = 'nodes/teranode';
const IMG_DIR = 'images/teranode';
const TAB = 'Node Software';
const GROUP_PREFIX = 'Teranode ';

// Which parts of the Teranode nav to import, as paths of nav labels.
// The scope is node operators: the pages for people who work on the Teranode
// code itself (contributing, protobuf, tests, Go API references) stay on the
// Teranode site, and links to them point there.
const SECTIONS = [
  { group: 'Teranode how-to guides', from: ['How-To Guides', 'Miners'] },
  {
    group: 'Teranode key topics',
    from: ['Key Topics'],
    exclude: ['Understanding the Testing Framework', 'Functional Requirement Tests'],
  },
  {
    group: 'Teranode reference',
    from: ['Reference'],
    exclude: [
      'Project Structure',
      'Error Handling',
      'Coding Conventions',
      'Proto Versioning Policy',
      'Protobuf API',
      'Core Services',
      'Overlay Services',
      'Stores',
      'Git Commit Signing Setup Guide',
      'Testing Technical Reference',
    ],
    rename: { 'API & Protobuf': 'Network and messages' },
  },
];

const CALLOUT_TYPES = {
  note: 'note', info: 'info', abstract: 'info', summary: 'info', tip: 'tip', hint: 'tip',
  success: 'check', check: 'check', done: 'check', warning: 'warning', caution: 'warning',
  attention: 'warning', danger: 'danger', error: 'danger', failure: 'danger', bug: 'danger',
  example: 'note', question: 'note', quote: 'note',
};
const HTML_TAGS = new Set([
  'a', 'b', 'br', 'code', 'details', 'em', 'i', 'img', 'kbd', 'li', 'ol', 'p', 'span',
  'strong', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'th', 'thead', 'tr', 'u', 'ul',
]);
const IMAGE_EXT = /\.(png|svg|jpe?g|gif|webp)$/i;

// ---------- source ----------

function parseArgs(argv) {
  const args = { ref: 'main', src: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--ref') args.ref = argv[++i];
    else if (argv[i] === '--src') args.src = path.resolve(argv[++i]);
    else throw new Error(`Unknown argument: ${argv[i]}`);
  }
  return args;
}

function git(cwd, ...a) {
  return execFileSync('git', a, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function getSource({ ref, src }) {
  if (src) return { dir: src, sha: git(src, 'rev-parse', 'HEAD') };
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'teranode-docs-'));
  console.log(`Cloning ${REPO}@${ref} into ${dir}`);
  git(dir, 'init', '-q');
  git(dir, 'remote', 'add', 'origin', `https://github.com/${REPO}.git`);
  git(dir, 'sparse-checkout', 'set', '--no-cone', '/docs/', '/mkdocs.yml');
  git(dir, 'fetch', '-q', '--depth', '1', '--filter=blob:none', 'origin', ref);
  git(dir, 'checkout', '-q', 'FETCH_HEAD');
  return { dir, sha: git(dir, 'rev-parse', 'HEAD') };
}

// mkdocs.yml can hold Python-specific YAML tags, so parse the nav block alone.
function readNav(srcDir) {
  const text = fs.readFileSync(path.join(srcDir, 'mkdocs.yml'), 'utf8');
  const m = text.match(/^nav:\n((?:[ \t].*\n|\n)*)/m);
  if (!m) throw new Error('No nav: block in mkdocs.yml');
  return yaml.load(`nav:\n${m[1]}`).nav;
}

// ---------- nav selection ----------

const label = (item) => Object.keys(item)[0];

function findSubtree(nav, labels) {
  let items = nav;
  for (const l of labels) {
    const hit = items.find((it) => typeof it === 'object' && label(it) === l);
    if (!hit) throw new Error(`Nav path not found: ${labels.join(' > ')}`);
    items = hit[l];
  }
  return items;
}

// Returns writedocs nav entries, and fills `pages` (source path -> page info).
function selectNav(items, section, pages, docsDir) {
  const out = [];
  for (const item of items) {
    if (typeof item === 'string') continue; // bare paths without a label are not used in this nav
    const name = label(item);
    if (section.exclude?.includes(name)) continue;
    const value = item[name];
    if (typeof value === 'string') {
      if (/^https?:/.test(value)) continue;
      // MkDocs only warns about a nav entry whose file is missing, so skip it here too.
      if (!fs.existsSync(path.join(docsDir, value))) {
        console.warn(`Skipped nav entry "${name}": docs/${value} does not exist`);
        continue;
      }
      const slug = `${OUT_DIR}/${kebabPath(value.replace(/\.md$/, ''))}`;
      pages.set(value, { src: value, slug, navLabel: name });
      out.push(slug);
    } else {
      const children = selectNav(value, section, pages, docsDir);
      if (children.length) out.push({ group: section.rename?.[name] ?? name, pages: children });
    }
  }
  return out;
}

function kebab(s) {
  return s
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([0-9])([A-Z][a-z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/[_\s.]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}
const kebabPath = (p) => p.split('/').map(kebab).join('/');

// ---------- links and images ----------

function siteUrl(rel) {
  // MkDocs serves foo/bar.md at foo/bar/ and foo/index.md at foo/.
  let p = rel.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '/');
  return SITE + p;
}

function makeLinkRewriter(ctx) {
  const { srcRel, pages, images, selfSlug, titleAnchor } = ctx;
  return (target) => {
    // The H1 becomes the page title and loses its anchor, so a link to it goes to the page.
    if (titleAnchor && target === `#${titleAnchor}`) return `/${selfSlug}/`;
    if (/^(https?:|mailto:|#|\/\/)/.test(target)) return target;
    const [rawPath, anchor] = target.split('#');
    if (!rawPath) return target;
    let decoded;
    try { decoded = decodeURIComponent(rawPath); } catch { decoded = rawPath; }
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(srcRel), decoded));
    const hash = anchor ? `#${anchor}` : '';
    if (resolved.startsWith('../')) {
      // Outside docs/: a file in the Teranode repository.
      return `https://github.com/${REPO}/blob/main/${resolved.replace(/^\.\.\//, '')}${hash}`;
    }
    if (/\.md$/i.test(resolved)) {
      const page = pages.get(resolved);
      return page ? `/${page.slug}/${hash}` : siteUrl(resolved) + hash;
    }
    if (IMAGE_EXT.test(resolved)) {
      images.add(resolved);
      return `/${IMG_DIR}/${resolved}`;
    }
    if (resolved.endsWith('/') || !path.posix.extname(resolved)) return SITE + resolved.replace(/\/?$/, '/') + hash;
    return SITE + resolved + hash; // other files the Teranode site serves, such as PDFs
  };
}

// ---------- MkDocs Markdown -> MDX ----------

// Escapes a line of Markdown text (not code) for MDX and rewrites its links.
function escapeText(line, ctx) {
  const parts = line.split(/(`+[^`]*?`+)/); // keep inline code untouched
  return parts.map((part, i) => (i % 2 ? part : escapeSegment(part, ctx))).join('');
}

function escapeSegment(s, ctx) {
  // Autolinks <https://...> are not valid MDX.
  s = s.replace(/<((?:https?|mailto):[^>\s]+)>/g, '[$1]($1)');
  // Markdown links and images.
  s = s.replace(/\]\(\s*<?([^)\s>]+)>?(\s+"[^"]*")?\s*\)/g, (_, t, title = '') => `](${ctx.rewrite(t)}${title})`);
  // Reference-style link definitions.
  s = s.replace(/^(\s*\[[^\]]+\]:\s*)(\S+)/, (_, a, t) => a + ctx.rewrite(t));
  // Braces are JSX expressions in MDX. A brace the source already escaped keeps one backslash.
  s = s.replace(/\\?([{}])/g, '\\$1');
  // A Markdown-escaped \< is a literal angle bracket: write it as the entity
  // without the backslash, which MDX would otherwise print in front of &lt;.
  s = s.replace(/\\</g, '&lt;');
  s = s.replace(/<(\/?)([A-Za-z][\w-]*)([^<>]*?)(\/?)>|</g, (m, close, tag, attrs, self) => {
    if (!tag || !HTML_TAGS.has(tag.toLowerCase())) return m.replace(/^</, '&lt;');
    tag = tag.toLowerCase();
    if (tag === 'br') return '<br />'; // also the invalid </br>
    if (close) return `</${tag}>`;
    attrs = attrs
      .replace(/\s+markdown(="[^"]*")?/g, '')
      .replace(/\bclass=/g, 'className=')
      .replace(/\s+style="[^"]*"/g, '')
      .replace(/\b(src|href)="([^"]+)"/g, (_, k, v) => `${k}="${ctx.rewrite(v)}"`)
      .replace(/\\([{}])/g, '$1');
    const selfClose = self || tag === 'br' || tag === 'img';
    return `<${tag}${attrs.trimEnd()}${selfClose ? ' /' : ''}>`;
  });
  return s;
}

function convertBody(lines, ctx) {
  const out = [];
  let i = 0;
  let inComment = false;
  while (i < lines.length) {
    const line = lines[i];

    // HTML comments, possibly over several lines, are dropped.
    if (inComment) {
      if (line.includes('-->')) inComment = false;
      i++;
      continue;
    }
    if (/^\s*<!--/.test(line)) {
      if (!line.includes('-->')) inComment = true;
      i++;
      continue;
    }

    // Fenced code: copied as it is.
    const fence = line.match(/^(\s*)(`{3,}|~{3,})/);
    if (fence) {
      const [, indent, marker] = fence;
      out.push(line);
      i++;
      while (i < lines.length && !new RegExp(`^\\s*${marker[0]}{${marker.length},}\\s*$`).test(lines[i])) {
        out.push(lines[i]);
        i++;
      }
      if (i < lines.length) out.push(indent + lines[i].trimStart());
      i++;
      continue;
    }

    // <pre> blocks become fenced text.
    // The block may close on its opening line, and may wrap its text in <code>.
    if (/^\s*<pre>/.test(line)) {
      const raw = [];
      while (i < lines.length) {
        raw.push(lines[i]);
        if (/<\/pre>/.test(lines[i++])) break;
      }
      const block = raw
        .join('\n')
        .replace(/^\s*<pre>(<code[^>]*>)?(?:[ \t]*\n)?/, '')
        .replace(/(<\/code>)?\s*<\/pre>[\s\S]*$/, '')
        .split('\n');
      while (block.length && !block[0].trim()) block.shift();
      while (block.length && !block[block.length - 1].trim()) block.pop();
      out.push('```text', ...block.map(unescapeHtml), '```');
      continue;
    }

    // Admonitions: !!! type "Title", then a body indented by four spaces.
    const adm = line.match(/^(\s*)(?:!!!|\?\?\?\+?)\s+([\w-]+)(?:\s+"([^"]*)")?\s*$/);
    if (adm) {
      const [, indent, kind, title] = adm;
      const bodyIndent = indent.length + 4;
      const body = [];
      i++;
      while (i < lines.length && (!lines[i].trim() || lines[i].search(/\S/) >= bodyIndent)) {
        body.push(lines[i].slice(Math.min(bodyIndent, lines[i].length)));
        i++;
      }
      while (body.length && !body[body.length - 1].trim()) body.pop();
      while (body.length && !body[0].trim()) body.shift();
      const type = CALLOUT_TYPES[kind.toLowerCase()] ?? 'note';
      const titleAttr = title ? ` title=${JSON.stringify(title)}` : '';
      out.push(`${indent}<Callout type="${type}"${titleAttr}>`, '');
      for (const b of convertBody(body, ctx)) out.push(b ? indent + b : b);
      out.push('', `${indent}</Callout>`);
      continue;
    }

    out.push(escapeText(line, ctx));
    i++;
  }
  return out;
}

function unescapeHtml(s) {
  return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
}

// Repeats a replacement until the string stops changing, so removing one
// match cannot leave behind a new one.
function replaceAll(s, re, to) {
  let prev;
  do {
    prev = s;
    s = s.replace(re, to);
  } while (s !== prev);
  return s;
}

function stripMarkup(s) {
  s = replaceAll(s, /&(lt|gt);/g, '');
  s = replaceAll(s, /<[^<>]*>/g, '');
  return s.replace(/[<>]/g, '');
}

function plainText(md) {
  return stripMarkup(md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*_]/g, '')
    .replace(/\\([{}])/g, '$1'))
    .replace(/\s+/g, ' ')
    .trim();
}

// The description is the first plain paragraph that reads as a sentence: not a
// heading, list, table, metadata line or a lead-in that ends with a colon.
function describe(bodyLines, title) {
  const paragraphs = [];
  let para = [];
  let inFence = false;
  const flush = () => { if (para.length) paragraphs.push(plainText(para.join(' '))); para = []; };
  for (const l of bodyLines) {
    if (/^\s*(`{3,}|~{3,})/.test(l)) { flush(); inFence = !inFence; continue; }
    if (inFence) continue;
    if (!l.trim() || /^\s*([-*_]\s*){3,}$/.test(l)) { flush(); continue; }
    if (/^\s*(#|<|\||[-*+] |\d+\. |!\[|>|\{\/\*)/.test(l)) { flush(); continue; }
    if (!para.length && /^\s*\**(last (modified|updated)|related topics?|date|version|status)\b/i.test(l)) continue;
    para.push(l.trim());
  }
  flush();
  let text = paragraphs.find((p) => p.length >= 40 && !p.endsWith(':'));
  if (!text) return `${title}, from the Teranode documentation.`;
  if (text.length > 200) {
    // A sentence ends at . ! or ? followed by a space and a capital, not at a dot in a URL or a name.
    const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z])/);
    let acc = '';
    for (const s of sentences) {
      if ((`${acc} ${s}`).length > 200 && acc) break;
      acc = acc ? `${acc} ${s}` : s;
    }
    text = acc.trim();
    if (text.length > 220) text = `${text.slice(0, 217).replace(/\s+\S*$/, '')}...`;
  }
  return text;
}

function convertPage(page, ctx) {
  const srcPath = path.join(ctx.docsDir, page.src);
  let text = fs.readFileSync(srcPath, 'utf8').replace(/\r\n/g, '\n');
  text = text.replace(/^---\n[\s\S]*?\n---\n/, ''); // MkDocs front matter is not used here

  let lines = text.split('\n');
  // The first H1 is the page title; any later H1 becomes an H2.
  let title = null;
  let inFence = false;
  lines = lines.filter((l) => {
    if (/^\s*(`{3,}|~{3,})/.test(l)) inFence = !inFence;
    if (!inFence && title === null && /^#\s+/.test(l)) {
      title = plainText(l.replace(/^#\s+/, '').replace(/\s+#+\s*$/, ''));
      return false;
    }
    return true;
  });
  inFence = false;
  lines = lines.map((l) => {
    if (/^\s*(`{3,}|~{3,})/.test(l)) inFence = !inFence;
    return !inFence && /^#\s+/.test(l) ? `#${l}` : l;
  });
  title ??= page.navLabel;

  const titleAnchor = title.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
  const rewrite = makeLinkRewriter({
    srcRel: page.src, pages: ctx.pages, images: ctx.images, selfSlug: page.slug, titleAnchor,
  });
  const body = convertBody(lines, { rewrite });
  while (body.length && !body[0].trim()) body.shift();
  while (body.length && !body[body.length - 1].trim()) body.pop();

  const fm = ['---', `title: ${JSON.stringify(title)}`];
  if (page.navLabel && page.navLabel !== title) fm.push(`sidebarTitle: ${JSON.stringify(page.navLabel)}`);
  fm.push(`description: ${JSON.stringify(describe(body, title))}`, '---', '');
  const source = `https://github.com/${REPO}/blob/${ctx.sha}/docs/${page.src}`;
  const note = `{/* Imported from ${source} by scripts/import-teranode.mjs. Do not edit this file: change the source in the Teranode repository, then rerun the script. */}`;
  // Collapse runs of blank lines left by removed comments.
  const mdx = [...fm, note, '', ...body, ''].join('\n').replace(/\n{3,}/g, '\n\n');
  return mdx;
}

// ---------- output ----------

function clearOutput() {
  const outAbs = path.join(ROOT, OUT_DIR);
  if (fs.existsSync(outAbs)) {
    for (const entry of fs.readdirSync(outAbs)) {
      if (entry === 'index.mdx') continue;
      fs.rmSync(path.join(outAbs, entry), { recursive: true, force: true });
    }
  }
  fs.rmSync(path.join(ROOT, IMG_DIR), { recursive: true, force: true });
}

function updateNav(groups) {
  const file = path.join(ROOT, 'writedocs.json');
  const config = JSON.parse(fs.readFileSync(file, 'utf8'));
  const tab = config.navigation.tabs.find((t) => t.tab === TAB);
  if (!tab) throw new Error(`No "${TAB}" tab in writedocs.json`);
  tab.pages = tab.pages.filter((p) => !(typeof p === 'object' && p.group?.startsWith(GROUP_PREFIX)));
  tab.pages.push(...groups);
  fs.writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const { dir, sha } = getSource(args);
  const docsDir = path.join(dir, 'docs');
  const nav = readNav(dir);

  const pages = new Map();
  const groups = SECTIONS.map((s) => ({ group: s.group, pages: selectNav(findSubtree(nav, s.from), s, pages, docsDir) }));

  // Convert everything in memory first. The old pages and images are only
  // replaced once every page has converted, so a failed run leaves them as they were.
  const images = new Set();
  const ctx = { docsDir, pages, images, sha };
  const converted = [...pages.values()].map((page) => ({ page, mdx: convertPage(page, ctx) }));
  const found = [...images].filter((img) => {
    if (fs.existsSync(path.join(docsDir, img))) return true;
    console.warn(`Missing image: docs/${img}`);
    return false;
  });

  clearOutput();
  for (const { page, mdx } of converted) {
    const outFile = path.join(ROOT, `${page.slug}.mdx`);
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, mdx);
  }
  for (const img of found) {
    const to = path.join(ROOT, IMG_DIR, img);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(path.join(docsDir, img), to);
  }
  updateNav(groups);
  console.log(`Imported ${pages.size} pages and ${found.length} images from ${REPO}@${sha.slice(0, 7)}.`);
}

main();
