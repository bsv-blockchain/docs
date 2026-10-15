#!/usr/bin/env node
/**
 * check-page (kit file). Renders a docs page in a browser and reports what a reviewer must look at:
 * console errors, screenshots in light, dark and phone width, and whether the page's markdown export contains given text.
 *
 * Usage:
 *   node diagrams/scripts/check-page.mjs --url http://localhost:4321/docs/concepts/wallet-model/ \
 *     [--selector ".caf"] [--out /tmp/diagram-check] [--theme-attr data-theme] \
 *     [--min-font 12] [--desktop-width 1280] [--md http://localhost:4321/docs/concepts/wallet-model.md] [--expect "signAction" --expect "Path 2"]
 *
 * Needs playwright-core and a Chromium. Set PLAYWRIGHT_CORE to the module folder if it is not installed in the project,
 * and CHROME_PATH to the browser binary if playwright cannot find one.
 * The portal's content column is narrower than the window (sidebars), so a diagram with a stacked layout for narrow containers may stack even at 1280. Use --desktop-width 1800 to see the wide layout.
 * Screenshots: <out>/<name>.<light|dark>.<desktop|mobile>.png. Open them (Read tool or image viewer) and check overlaps and contrast.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : def; };
const all = (name) => args.flatMap((a, i) => (a === `--${name}` ? [args[i + 1]] : []));
const url = opt("url");
if (!url) { console.error("Missing --url"); process.exit(1); }
const out = opt("out", "diagram-check");
const selector = opt("selector", null);
const themeAttr = opt("theme-attr", "data-theme");
const mdUrl = opt("md", null);
const desktopWidth = Number(opt("desktop-width", 1280));
const minFont = Number(opt("min-font", 12));
const expects = all("expect");

let pw;
try {
  pw = process.env.PLAYWRIGHT_CORE
    ? createRequire(import.meta.url)(process.env.PLAYWRIGHT_CORE)
    : await import("playwright-core");
} catch {
  console.error("playwright-core not found. Install it or set PLAYWRIGHT_CORE=/path/to/playwright-core");
  process.exit(1);
}
const chromium = pw.chromium ?? pw.default?.chromium;
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
const problems = [];
const shots = [];
for (const [vpName, vp] of [["desktop", { width: desktopWidth, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
  for (const theme of ["light", "dark"]) {
    const page = await browser.newPage({ viewport: vp, colorScheme: theme });
    page.on("pageerror", (e) => problems.push(`[${theme}/${vpName}] page error: ${e.message}`));
    page.on("console", (m) => { if (m.type() === "error") problems.push(`[${theme}/${vpName}] console error: ${m.text()}`); });
    await page.goto(url, { waitUntil: "networkidle" });
    await page.evaluate(([a, t]) => document.documentElement.setAttribute(a, t), [themeAttr, theme]);
    await page.waitForTimeout(700);
    const target = selector ? page.locator(selector).first() : page;
    if (selector && !(await page.locator(selector).count())) problems.push(`[${theme}/${vpName}] selector not found: ${selector}`);
    else {
      if (selector) await target.evaluate((el) => el.scrollIntoView({ block: "center" }));
      const file = path.join(out, `page.${theme}.${vpName}.png`);
      await target.screenshot(selector ? { path: file } : { path: file, fullPage: true });
      shots.push(file);
    }
    await page.close();
  }
}

// Rendered font size audit: the size the reader actually sees, after the SVG or image is scaled to the column.
// Phone width is skipped on purpose (everything shrinks there; readers zoom). Desktop widths are checked.
for (const w of [768, 1280, 1440]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto(url, { waitUntil: "networkidle" });
  const found = await page.evaluate(async ({ sel, min }) => {
    const bad = new Map();
    const note = (text, px) => { if (px < min - 0.1) bad.set(`${text}|${Math.round(px * 10) / 10}`, { text, px: Math.round(px * 10) / 10 }); };
    const root = sel ? document.querySelector(sel) : document.querySelector("main") || document.body;
    if (root) {
      root.querySelectorAll("svg text").forEach((t) => {
        if (!t.getClientRects().length || !t.textContent.trim()) return;
        const ctm = t.getScreenCTM();
        if (ctm) note(t.textContent.trim().slice(0, 40), parseFloat(getComputedStyle(t).fontSize) * ctm.a);
      });
      if (sel) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          const el = n.parentElement;
          if (!n.textContent.trim() || !el || el.closest("svg") || !el.getClientRects().length) continue;
          note(n.textContent.trim().slice(0, 40), parseFloat(getComputedStyle(el).fontSize));
        }
      }
    }
    for (const img of document.querySelectorAll('img[src$=".svg"]')) {
      if (!img.getClientRects().length || !img.width) continue;
      const svg = await (await fetch(img.src)).text();
      const vbw = Number((svg.match(/viewBox="[\d.]+ [\d.]+ ([\d.]+)/) || [])[1]) || img.naturalWidth;
      const scale = img.getBoundingClientRect().width / vbw;
      for (const m of svg.matchAll(/<text[^>]*font-size="([\d.]+)"[^>]*>([^<]*)</g)) note(m[2].slice(0, 40), Number(m[1]) * scale);
    }
    return [...bad.values()];
  }, { sel: selector, min: minFont });
  for (const f of found) problems.push(`[${w}px window] text renders at ${f.px}px, below the ${minFont}px minimum: "${f.text}"`);
  await page.close();
}
await browser.close();

if (mdUrl) {
  const res = await fetch(mdUrl);
  const md = await res.text();
  if (!res.ok) problems.push(`markdown export returned ${res.status}`);
  for (const e of expects) if (!md.includes(e)) problems.push(`markdown export is missing: "${e}" (restart the dev server if it is stale)`);
}

console.log("Screenshots:\n" + shots.map((s) => "  " + s).join("\n"));
console.log(problems.length ? "Problems:\n" + problems.map((p) => "  - " + p).join("\n") : "No console errors, selector found, markdown export has all expected text.");
process.exit(problems.length ? 2 : 0);
