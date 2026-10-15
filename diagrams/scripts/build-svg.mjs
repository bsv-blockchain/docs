#!/usr/bin/env node
/**
 * build-svg (kit file). Builds a static diagram as a light and a dark SVG from ONE spec, with colors from tokens.json.
 * Both files have the same geometry; only the colors change. No title is drawn: the explanation belongs in the page.
 *
 * Usage:
 *   node diagrams/scripts/build-svg.mjs diagrams/sources/<slug>.diagram.json [more specs...] \
 *     [--out images/diagrams] [--png <dir>] [--img]
 *
 *   --out   export folder (default: tokens.json > output.exportDir)
 *   --png   also render both SVGs to PNG in <dir> for review
 *   --img   print a plain <img> light/dark snippet instead of the WriteDocs <Image> one
 *
 * Validation (exit code 2 when anything fails; the files are still written so you can look at them):
 *   - minimum font size: every text must render at 12px or more in the narrowest desktop column (696px wide).
 *     For a 720px canvas that is 12.4px in the SVG. Smaller sizes are errors, not warnings.
 *   - text must fit inside its box (diamonds included), inside its group, and inside the canvas
 *   - no text on top of a box, an arrow, a lifeline or another text (this catches "Yes"/"No" labels under blocks)
 *   - no boxes overlapping, no arrows crossing boxes
 *   Text boxes are MEASURED in a real browser when playwright-core is available (set PLAYWRIGHT_CORE to the module folder,
 *   and CHROME_PATH to the browser binary if playwright cannot find one). Without it they are estimated, and the script says so.
 *
 * Spec (JSON):
 *   { "slug": "x", "alt": "what it shows, with the takeaway", "width": 720, "height": 280, "panel": false,
 *     "elements": [ ... ] }
 *   width: the portal's content column width from project.md; 720 fits the narrowest desktop column and scales down.
 *
 * Elements:
 *   group: { "type":"group", "x","y","w","h", "label"? (small caps, top left), "title"?, "note"? (centered), "dashed"?, "fill"? }
 *   node:  { "type":"node", "id","x","y","w","h", "label" ("\n" for lines), "sub"?, "role"?, "shape"? ("rect"|"pill"|"diamond"),
 *            "mono"?, "dashed"?, "size"?, "weight"? }
 *   role:  plain (default) | muted | accent | neutral | info | pending | success | failure | dispute | refund  (status keys from tokens.json)
 *   edge:  { "type":"edge", "from": id | [x,y], "to": id | [x,y], "fromSide"?, "toSide"? ("r"|"l"|"t"|"b"), "via"?: [[x,y],...],
 *            "points"?: [[x,y],...] (explicit, wins), "fromDx"?,"fromDy"?,"toDx"?,"toDy"? (offset along the side),
 *            "label"?, "labelAt"?: [x,y], "labelAnchor"?, "role"?, "dashed"?, "arrow"?: false }
 *   line:  { "type":"line", "x1","y1","x2","y2", "dashed"? }
 *   text:  { "type":"text", "x","y","text", "size"?, "role"? ("ink"|"muted"|"soft"|"accent"), "anchor"?, "mono"?, "weight"? }
 *
 * Default text sizes (all above the minimum for a 720px canvas): label 14 (13 mono), subtitle 13, arrow label 13, group label 12.5.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const SANS = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const MIN_RENDERED = 12; // px, on screen
const NARROWEST_COLUMN = 696; // px, narrowest desktop content column of the portal (project.md)
const LINE = 17; // line pitch of node text

const args = process.argv.slice(2);
const valueOpts = ["--out", "--png"];
const opt = (name, def) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : def; };
const specFiles = args.filter((a, i) => !a.startsWith("--") && !valueOpts.includes(args[i - 1]));
if (!specFiles.length) { console.error("Usage: build-svg.mjs <spec.diagram.json> [...] [--out dir] [--png dir] [--img]"); process.exit(1); }

const tokens = JSON.parse(fs.readFileSync("diagrams/brand/tokens.json", "utf8"));
const outDir = opt("out", tokens.output?.exportDir || "images/diagrams");
const pngDir = opt("png", null);
fs.mkdirSync(outDir, { recursive: true });

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const num = (n) => Math.round(n * 100) / 100;

let pw = null;
try { pw = process.env.PLAYWRIGHT_CORE ? createRequire(import.meta.url)(process.env.PLAYWRIGHT_CORE) : await import("playwright-core"); } catch { pw = null; }
const chromium = pw ? (pw.chromium ?? pw.default?.chromium) : null;

function colors(t, mode) {
  const m = t[mode];
  const status = (k) => t.status[k]?.[mode];
  const role = (r = "plain") => {
    if (r === "plain") return { fill: m.paper, stroke: m.ruleStrong, text: m.ink, sub: m.muted };
    if (r === "muted") return { fill: m.paper2, stroke: m.rule, text: m.muted, sub: m.soft };
    if (r === "accent") return { fill: m.accentTint, stroke: m.accent, text: m.ink, sub: m.muted };
    const s = status(r);
    if (!s) throw new Error(`Unknown role "${r}". Use plain, muted, accent or a status key from tokens.json.`);
    return { fill: s.fill, stroke: s.border, text: s.text, sub: s.text };
  };
  const line = (r) => (!r || r === "plain" ? m.muted : r === "accent" ? m.accent : status(r)?.border ?? m.muted);
  const ink = { ink: m.ink, muted: m.muted, soft: m.soft, accent: m.accent };
  return { m, role, line, ink };
}

const anchorOf = (n, side, dx = 0, dy = 0) => {
  const cx = n.x + n.w / 2, cy = n.y + n.h / 2;
  return { r: [n.x + n.w, cy + dy], l: [n.x, cy + dy], t: [cx + dx, n.y], b: [cx + dx, n.y + n.h] }[side];
};
const opposite = { r: "l", l: "r", t: "b", b: "t" };

function edgePoints(e, nodes) {
  if (e.points) return e.points;
  const A = typeof e.from === "string" ? nodes[e.from] : null;
  const B = typeof e.to === "string" ? nodes[e.to] : null;
  if ((typeof e.from === "string" && !A) || (typeof e.to === "string" && !B)) throw new Error(`Edge ${e.from} -> ${e.to}: unknown node id`);
  let sa = e.fromSide, sb = e.toSide;
  if (A && B && !sa && !sb) {
    const h = B.x > A.x + A.w ? "r" : A.x > B.x + B.w ? "l" : null;
    if (h) { sa = h; sb = opposite[h]; } else { sa = B.y > A.y ? "b" : "t"; sb = opposite[sa]; }
  }
  if (A && !sa) sa = sb ? opposite[sb] : "r";
  if (B && !sb) sb = sa ? opposite[sa] : "l";
  const pa = A ? anchorOf(A, sa, e.fromDx, e.fromDy) : e.from;
  const pb = B ? anchorOf(B, sb, e.toDx, e.toDy) : e.to;
  if (e.via) return [pa, ...e.via, pb];
  const horizontal = (A ? sa : sb) === "r" || (A ? sa : sb) === "l";
  if (horizontal) {
    if (pa[1] === pb[1]) return [pa, pb];
    const mx = e.mid ?? (pa[0] + pb[0]) / 2;
    return [pa, [mx, pa[1]], [mx, pb[1]], pb];
  }
  if (pa[0] === pb[0]) return [pa, pb];
  const my = e.mid ?? (pa[1] + pb[1]) / 2;
  return [pa, [pa[0], my], [pb[0], my], pb];
}

/** Builds the SVG text plus the geometry the checks need. `measure` tags every text with data-i for the browser pass. */
function build(spec, t, mode, measure) {
  const { m, role, line, ink } = colors(t, mode);
  const W = spec.width ?? 720, H = spec.height;
  const minSize = spec.minFont ?? Math.ceil((MIN_RENDERED * W) / NARROWEST_COLUMN * 10) / 10;
  const els = spec.elements;
  const nodes = {};
  els.filter((e) => e.type === "node").forEach((n) => { nodes[n.id] = n; });
  const errors = [];
  const out = [];
  const markers = new Set();
  const marker = (c) => { markers.add(c); return `url(#arr-${c.slice(1)})`; };
  const texts = []; // { kind, owner, x, y, anchor, size, weight, mono, text, svgIndex }
  const segs = []; // edges and lifelines
  const groups = [];
  const rects = [];

  // Every text goes through here so the size rule and the geometry list cannot be bypassed.
  const text = (o, content, attrs) => {
    if (o.size < minSize) errors.push(`font size ${o.size}px is below the minimum ${minSize}px for a ${W}px canvas (${o.kind}: "${content}")`);
    const i = texts.length;
    texts.push({ ...o, text: content });
    out.push(`<text${measure ? ` data-i="${i}"` : ""} x="${num(o.x)}" y="${num(o.y)}" text-anchor="${o.anchor}" font-family="${o.mono ? MONO : SANS}" font-size="${o.size}" font-weight="${o.weight}"${attrs ?? ""}>${esc(content)}</text>`);
  };

  if (spec.panel) out.push(`<rect width="${W}" height="${H}" rx="8" fill="${m.paper2}"/>`);

  for (const g of els.filter((e) => e.type === "group")) {
    groups.push(g);
    out.push(`<rect x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" rx="10" fill="${g.fill ? m.paper2 : "none"}" stroke="${g.fill ? m.rule : m.ruleStrong}" stroke-width="1.25"${g.dashed ? ' stroke-dasharray="6 4"' : ""}/>`);
    if (g.label) text({ kind: "group-text", owner: g, x: g.x + 12, y: g.y + 20, anchor: "start", size: 12.5, weight: 600 }, g.label.toUpperCase(), ` letter-spacing="0.8" fill="${m.soft}"`);
    if (g.title) text({ kind: "group-text", owner: g, x: g.x + g.w / 2, y: g.y + 26, anchor: "middle", size: 14, weight: 600 }, g.title, ` fill="${m.ink}"`);
    if (g.note) text({ kind: "group-text", owner: g, x: g.x + g.w / 2, y: g.y + 46, anchor: "middle", size: 13, weight: 400 }, g.note, ` fill="${m.soft}"`);
  }

  for (const l of els.filter((e) => e.type === "line")) {
    out.push(`<line x1="${l.x1}" y1="${l.y1}" x2="${l.x2}" y2="${l.y2}" stroke="${m.ruleStrong}" stroke-width="1.25"${l.dashed ? ' stroke-dasharray="4 4"' : ""}/>`);
    segs.push({ a: [l.x1, l.y1], b: [l.x2, l.y2], kind: "lifeline", from: null, to: null });
  }

  els.filter((x) => x.type === "edge").forEach((e, ei) => {
    const pts = edgePoints(e, nodes);
    const c = line(e.role);
    const d = pts.map((p, i) => `${i ? "L" : "M"}${num(p[0])} ${num(p[1])}`).join(" ");
    out.push(`<path d="${d}" fill="none" stroke="${c}" stroke-width="1.5" stroke-linejoin="round"${e.dashed ? ' stroke-dasharray="5 4"' : ""}${e.arrow === false ? "" : ` marker-end="${marker(c)}"`}/>`);
    for (let i = 0; i < pts.length - 1; i++) segs.push({ a: pts[i], b: pts[i + 1], kind: "edge", edge: ei, from: e.from, to: e.to });
    if (e.label) {
      let at = e.labelAt, anchor = e.labelAnchor;
      if (!at) {
        let best = 0, bi = 0;
        for (let i = 0; i < pts.length - 1; i++) { const len = Math.abs(pts[i + 1][0] - pts[i][0]) + Math.abs(pts[i + 1][1] - pts[i][1]); if (len > best) { best = len; bi = i; } }
        const [a, b] = [pts[bi], pts[bi + 1]];
        if (a[1] === b[1]) { at = [(a[0] + b[0]) / 2, a[1] - 7]; anchor ??= "middle"; }
        else { at = [a[0] + 8, (a[1] + b[1]) / 2 + 5]; anchor ??= "start"; }
      }
      text({ kind: "edge-label", edge: ei, x: at[0], y: at[1], anchor: anchor ?? "middle", size: 13, weight: 400 }, e.label, ` fill="${m.soft}"`);
    }
  });

  for (const n of els.filter((e) => e.type === "node")) {
    const c = role(n.role);
    const dash = n.dashed ? ' stroke-dasharray="5 4"' : "";
    const sw = n.role === "accent" ? 1.75 : 1.25;
    if (n.shape === "diamond") {
      out.push(`<polygon points="${n.x + n.w / 2},${n.y} ${n.x + n.w},${n.y + n.h / 2} ${n.x + n.w / 2},${n.y + n.h} ${n.x},${n.y + n.h / 2}" fill="${c.fill}" stroke="${c.stroke}" stroke-width="${sw}"${dash}/>`);
    } else {
      out.push(`<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="${n.shape === "pill" ? n.h / 2 : 6}" fill="${c.fill}" stroke="${c.stroke}" stroke-width="${sw}"${dash}/>`);
    }
    const labels = String(n.label).split("\n");
    const subs = n.sub ? String(n.sub).split("\n") : [];
    const total = labels.length + subs.length;
    const cx = n.x + n.w / 2, cy = n.y + n.h / 2;
    const size = n.size ?? (n.mono ? 13 : 14);
    const weight = n.weight ?? (n.mono ? 500 : 600);
    const y0 = cy - ((total - 1) * LINE) / 2 + 5;
    labels.forEach((s, i) => text({ kind: "node-text", owner: n, x: cx, y: y0 + i * LINE, anchor: "middle", size, weight, mono: n.mono }, s, ` fill="${c.text}"`));
    subs.forEach((s, i) => text({ kind: "node-text", owner: n, x: cx, y: y0 + (labels.length + i) * LINE, anchor: "middle", size: 13, weight: 400 }, s, ` fill="${c.sub}"`));
    rects.push(n);
  }

  for (const tx of els.filter((e) => e.type === "text")) {
    text({ kind: "text", owner: tx, x: tx.x, y: tx.y, anchor: tx.anchor ?? "start", size: tx.size ?? 13, weight: tx.weight ?? 400, mono: tx.mono }, tx.text, ` fill="${ink[tx.role ?? "ink"] ?? m.ink}"`);
  }

  const defs = [...markers].map((c) => `<marker id="arr-${c.slice(1)}" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="${c}"/></marker>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" role="img" aria-labelledby="t">\n<title id="t">${esc(spec.alt)}</title>\n<defs>${defs}</defs>\n${out.join("\n")}\n</svg>\n`;
  return { svg, errors, texts, segs, rects, groups, W, H };
}

// ---------- geometry checks ----------
const estimate = (o) => {
  const w = o.text.length * o.size * (o.mono ? 0.62 : o.weight >= 600 ? 0.6 : 0.55);
  const x = o.anchor === "middle" ? o.x - w / 2 : o.anchor === "end" ? o.x - w : o.x;
  return { x, y: o.y - o.size * 0.8, w, h: o.size * 1.0 };
};
const hit = (a, r, pad = 0) => a.x < r.x + r.w + pad && a.x + a.w > r.x - pad && a.y < r.y + r.h + pad && a.y + a.h > r.y - pad;
const segBox = (s) => ({ x: Math.min(s.a[0], s.b[0]), y: Math.min(s.a[1], s.b[1]), w: Math.abs(s.b[0] - s.a[0]), h: Math.abs(s.b[1] - s.a[1]) });
const inside = (b, r, px, py) => b.x >= r.x + px && b.x + b.w <= r.x + r.w - px && b.y >= r.y + py && b.y + b.h <= r.y + r.h - py;
const inDiamond = (b, n) => [[b.x, b.y], [b.x + b.w, b.y], [b.x, b.y + b.h], [b.x + b.w, b.y + b.h]]
  .every(([x, y]) => Math.abs(x - (n.x + n.w / 2)) / (n.w / 2) + Math.abs(y - (n.y + n.h / 2)) / (n.h / 2) <= 1);

function check(info, boxes) {
  const errs = [...info.errors];
  const { texts, segs, rects, groups, W, H } = info;
  const tb = texts.map((o, i) => boxes?.[i] ?? estimate(o));
  const label = (o) => `${o.kind === "node-text" ? `"${o.owner.id}"` : o.kind}: "${o.text}"`;
  texts.forEach((o, i) => {
    const b = tb[i];
    if (b.x < 0 || b.y < 0 || b.x + b.w > W || b.y + b.h > H) errs.push(`text outside the canvas (${label(o)})`);
    if (o.kind === "node-text") {
      const n = o.owner;
      const ok = n.shape === "diamond" ? inDiamond(b, n) : inside(b, n, 5, 2);
      if (!ok) errs.push(`text does not fit inside its box (${label(o)}, text ${Math.round(b.w)}px wide, box ${n.w}px)`);
    }
    if (o.kind === "group-text" && !inside(b, o.owner, 2, 1)) errs.push(`text does not fit inside its group (${label(o)})`);
    // Text must not sit on a box other than its own, on an arrow or lifeline, or on another text.
    for (const n of rects) {
      if (o.kind === "node-text" && o.owner === n) continue;
      if (hit(b, n, -1)) errs.push(`text on top of box "${n.id}" (${label(o)})`);
    }
    for (const s of segs) {
      if (s.kind === "lifeline" && o.kind === "node-text") continue; // the box is drawn over the lifeline and hides it
      if (s.kind === "edge" && o.kind === "edge-label" && s.edge === o.edge && !hit(b, segBox(s), -1.5)) continue;
      if (hit(b, segBox(s), -1)) errs.push(`text on top of ${s.kind === "lifeline" ? "a lifeline" : "an arrow"} (${label(o)})`);
    }
    for (let j = i + 1; j < texts.length; j++) if (hit(b, tb[j], -1)) errs.push(`text overlaps other text (${label(o)} and ${label(texts[j])})`);
  });
  for (let i = 0; i < rects.length; i++) {
    const a = rects[i];
    if (a.x < 0 || a.y < 0 || a.x + a.w > W || a.y + a.h > H) errs.push(`box "${a.id}" is outside the canvas`);
    for (let j = i + 1; j < rects.length; j++) if (hit(a, rects[j], 0)) errs.push(`box "${a.id}" overlaps "${rects[j].id}"`);
  }
  for (const s of segs.filter((x) => x.kind === "edge")) for (const n of rects) {
    if (n.id === s.from || n.id === s.to) continue;
    if (hit(segBox(s), n, 0)) errs.push(`an arrow ${JSON.stringify(s.from)} -> ${JSON.stringify(s.to)} crosses box "${n.id}"`);
  }
  return [...new Set(errs)];
}

async function measureAndRender(page, spec, svg, mode, pngPath) {
  await page.setContent(`<body style="margin:0;padding:20px;background:${tokens[mode].paper}"><div id="d" style="width:${spec.width ?? 720}px">${svg}</div></body>`);
  const boxes = await page.evaluate(() => [...document.querySelectorAll("svg text[data-i]")].sort((a, b) => a.dataset.i - b.dataset.i).map((t) => { const b = t.getBBox(); return { x: b.x, y: b.y, w: b.width, h: b.height }; }));
  if (pngPath) await page.locator("#d").screenshot({ path: pngPath });
  return boxes;
}

let bad = false;
let browser = null, page = null;
if (chromium) {
  try { browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined }); page = await browser.newPage(); } catch { browser = null; }
}
if (!browser) console.log("note: no browser available, text sizes are ESTIMATED. Set PLAYWRIGHT_CORE (and CHROME_PATH) for measured checks.");
if (pngDir) fs.mkdirSync(pngDir, { recursive: true });
if (pngDir && !browser) { console.error("--png needs playwright-core and a browser"); process.exit(1); }

for (const file of specFiles) {
  const spec = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!spec.slug || !spec.alt || !spec.height || !Array.isArray(spec.elements)) { console.error(`${file}: spec needs slug, alt, height and elements`); bad = true; continue; }
  let problems = [];
  for (const mode of ["light", "dark"]) {
    const clean = build(spec, tokens, mode, false);
    fs.writeFileSync(path.join(outDir, `${spec.slug}.${mode}.svg`), clean.svg);
    if (mode === "light") {
      const tagged = build(spec, tokens, mode, true);
      let boxes = null;
      if (browser) boxes = await measureAndRender(page, spec, tagged.svg, mode, null);
      problems = check(tagged, boxes);
    }
    if (pngDir) await measureAndRender(page, spec, build(spec, tokens, mode, true).svg, mode, path.join(pngDir, `${spec.slug}.${mode}.png`));
  }
  console.log(`${spec.slug}: wrote ${outDir}/${spec.slug}.light.svg and .dark.svg (${spec.width ?? 720}x${spec.height}), ${browser ? "text measured" : "text estimated"}`);
  if (problems.length) { bad = true; problems.forEach((w) => console.log(`  ERROR: ${w}`)); } else console.log("  checks passed");
  const url = "/" + outDir.replace(/^\.?\//, "");
  console.log(args.includes("--img")
    ? `  <img src="${url}/${spec.slug}.light.svg" alt="${spec.alt}" className="block dark:hidden" />\n  <img src="${url}/${spec.slug}.dark.svg" alt="${spec.alt}" className="hidden dark:block" />`
    : `  <Image src="${url}/${spec.slug}.light.svg" srcDark="${url}/${spec.slug}.dark.svg" size="${spec.width ?? 720}px" alt="${spec.alt}" />`);
}
if (browser) await browser.close();
if (pngDir) console.log(`PNG previews in ${pngDir}`);
process.exit(bad ? 2 : 0);
