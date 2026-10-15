#!/usr/bin/env node
/**
 * check-diagram (kit file). Two checks for static diagrams made with diagram-design:
 *
 *   node diagrams/scripts/check-diagram.mjs <file.svg|file.html> [...]
 *     Flags text that looks like a title or intro: large text near the top, or text above the first box.
 *     Heuristic: a flag is a suspect to confirm by looking at the image, not proof. Exit code 2 when flagged.
 *
 *   node diagrams/scripts/check-diagram.mjs --profile <client-slug>
 *     Compares ~/.diagram-design/profiles/<slug>.md with diagrams/brand/generated/diagram-design-profile.md.
 *     Exit code 2 when they differ or the local copy is missing.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const args = process.argv.slice(2);
let bad = false;

const pi = args.indexOf("--profile");
if (pi >= 0) {
  const slug = args[pi + 1];
  const local = path.join(os.homedir(), ".diagram-design", "profiles", `${slug}.md`);
  const repo = path.join("diagrams", "brand", "generated", "diagram-design-profile.md");
  // The header carries dates that change on each generate; compare the body only.
  const body = (p) => fs.readFileSync(p, "utf8").replace(/^<!--[\s\S]*?-->\s*/, "").trim();
  if (!fs.existsSync(local)) { console.log(`Profile missing: copy ${repo} to ${local}`); bad = true; }
  else if (body(local) !== body(repo)) { console.log(`Profile out of date: copy ${repo} over ${local}`); bad = true; }
  else console.log(`Profile ${slug} is current.`);
}

const num = (s) => (s == null ? NaN : parseFloat(s));
const attr = (tag, name) => { const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`)); return m ? m[1] : null; };
const fontSize = (tag) => {
  const a = attr(tag, "font-size"); if (a) return num(a);
  const st = attr(tag, "style"); const m = st && st.match(/font-size:\s*([\d.]+)/); return m ? num(m[1]) : NaN;
};

for (const file of args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--profile")) {
  const src = fs.readFileSync(file, "utf8");
  const svg = (src.match(/<svg[\s\S]*?<\/svg>/) || [])[0];
  if (!svg) { console.log(`${file}: no <svg> found`); bad = true; continue; }
  const vb = (attr(svg.match(/<svg[^>]*>/)[0], "viewBox") || "").split(/[\s,]+/).map(Number);
  const H = vb.length === 4 ? vb[3] : num(attr(svg.match(/<svg[^>]*>/)[0], "height"));
  const rects = [...svg.matchAll(/<rect\b[^>]*>/g)].map((m) => m[0])
    .map((t) => ({ y: num(attr(t, "y")) || 0, w: num(attr(t, "width")), h: num(attr(t, "height")) }))
    .filter((r) => r.w > 40 && r.h > 20 && !(r.w >= vb[2] * 0.95 && r.h >= H * 0.95)); // ignore the page background
  const firstBoxY = rects.length ? Math.min(...rects.map((r) => r.y)) : Infinity;
  const texts = [...svg.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)].map((m) => ({
    tag: m[1], y: num(attr(m[1], "y")), size: fontSize(m[1]), text: m[2].replace(/<[^>]+>/g, "").trim(),
  })).filter((t) => t.text);
  const flags = texts.filter((t) =>
    (t.size >= 16 && t.y < H * 0.15) || (t.y < firstBoxY && t.text.length > 3));
  if (flags.length) {
    bad = true;
    console.log(`${file}: possible title or intro text:`);
    for (const f of flags) console.log(`  - "${f.text.slice(0, 80)}" (y=${f.y}, size=${f.size})`);
  } else console.log(`${file}: no title suspects.`);
}
process.exit(bad ? 2 : 0);
