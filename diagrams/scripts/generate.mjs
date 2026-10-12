#!/usr/bin/env node
/**
 * Diagram kit generator (kit file, do not edit per project).
 *
 * Reads  diagrams/brand/tokens.json
 * Writes diagrams/brand/generated/
 *   mermaid.config.json          theme config for platforms that accept a global Mermaid config
 *   mermaid-frontmatter.{light,dark}.yaml   per-diagram config block (Mermaid >= 10.5)
 *   mermaid-init.{light,dark}.txt           legacy %%{init}%% one-liner (fallback)
 *   mermaid-classdefs.{light,dark}.mmd      classDef lines for semantic status colors
 *   diagram-theme.css            CSS variables consumed by the React components
 *   diagram-design-profile.md    profile for the diagram-design skill
 *   contrast-report.md           WCAG contrast checks
 *   preview.html                 one-page brand preview to send to the client for approval
 *
 * Usage: node diagrams/scripts/generate.mjs [path/to/tokens.json] [--strict]
 * No dependencies. Node 18+.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const strict = args.includes("--strict");
const tokensPath = path.resolve(args.find((a) => !a.startsWith("--")) ?? path.join(here, "../brand/tokens.json"));
const outDir = path.join(path.dirname(tokensPath), "generated");

if (!fs.existsSync(tokensPath)) {
  console.error(`tokens.json not found at ${tokensPath}\nCopy diagrams/brand/tokens.template.json to tokens.json and fill it first.`);
  process.exit(1);
}
const t = JSON.parse(fs.readFileSync(tokensPath, "utf8"));

/* ---------- validation ---------- */
const HEX = /^#[0-9a-fA-F]{6}$/;
const errors = [];
const MODES = ["light", "dark"];
const BASE_KEYS = ["paper", "paper2", "ink", "muted", "soft", "rule", "ruleStrong", "accent", "accentTint", "link"];
for (const mode of MODES) {
  for (const k of BASE_KEYS) {
    const v = t[mode]?.[k];
    if (!HEX.test(v ?? "")) errors.push(`${mode}.${k} must be #rrggbb (got ${JSON.stringify(v)})`);
  }
}
const statusKeys = Object.keys(t.status ?? {}).filter((k) => !k.startsWith("_"));
for (const s of statusKeys) {
  for (const mode of MODES) {
    for (const part of ["fill", "border", "text"]) {
      const v = t.status[s]?.[mode]?.[part];
      if (!HEX.test(v ?? "")) errors.push(`status.${s}.${mode}.${part} must be #rrggbb (got ${JSON.stringify(v)})`);
    }
  }
}
if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(t.client?.slug ?? "")) errors.push(`client.slug must be lowercase letters, digits, hyphens (got ${JSON.stringify(t.client?.slug)})`);
if (errors.length) {
  console.error("tokens.json has problems:\n- " + errors.join("\n- "));
  process.exit(1);
}

/* ---------- contrast ---------- */
const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};
const checks = [];
const check = (label, fg, bg, min) => checks.push({ label, fg, bg, min, value: ratio(fg, bg) });
for (const mode of MODES) {
  const m = t[mode];
  check(`${mode}: ink on paper (text)`, m.ink, m.paper, 4.5);
  check(`${mode}: ink on paper2 (text in containers)`, m.ink, m.paper2, 4.5);
  check(`${mode}: muted on paper (secondary text)`, m.muted, m.paper, 4.5);
  check(`${mode}: soft on paper (sublabels)`, m.soft, m.paper, 4.5);
  check(`${mode}: accent on paper (focal text/arrows)`, m.accent, m.paper, 4.5);
  check(`${mode}: link on paper`, m.link, m.paper, 4.5);
  check(`${mode}: muted arrows on paper (lines)`, m.muted, m.paper, 3);
  for (const s of statusKeys) {
    const st = t.status[s][mode];
    check(`${mode}: status.${s} text on its fill`, st.text, st.fill, 4.5);
    check(`${mode}: status.${s} border on paper`, st.border, m.paper, 3);
  }
}
const failed = checks.filter((c) => c.value < c.min);

/* ---------- helpers ---------- */
fs.mkdirSync(outDir, { recursive: true });
const write = (name, content) => fs.writeFileSync(path.join(outDir, name), content);
const px = (n) => `${n}px`;
const today = new Date().toISOString().slice(0, 10);
const prefix = "--dg"; // fixed: kit components depend on it
const kebab = (s) => s.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase()).replace(/([a-z])([0-9])/g, "$1-$2");

/* ---------- Mermaid ---------- */
function mermaidTheme(mode) {
  const m = t[mode];
  return {
    theme: "base",
    themeVariables: {
      darkMode: mode === "dark",
      fontFamily: t.font.sans,
      fontSize: px(t.font.sizeLabel + 1),
      background: m.paper,
      textColor: m.ink,
      titleColor: m.ink,
      lineColor: m.muted,
      primaryColor: m.paper2,
      primaryTextColor: m.ink,
      primaryBorderColor: m.ruleStrong,
      secondaryColor: m.accentTint,
      secondaryTextColor: m.ink,
      secondaryBorderColor: m.accent,
      tertiaryColor: m.paper,
      tertiaryTextColor: m.ink,
      tertiaryBorderColor: m.rule,
      mainBkg: m.paper2,
      nodeBorder: m.ruleStrong,
      clusterBkg: m.paper,
      clusterBorder: m.ruleStrong,
      edgeLabelBackground: m.paper,
      noteBkgColor: m.accentTint,
      noteTextColor: m.ink,
      noteBorderColor: m.accent,
      actorBkg: m.paper2,
      actorBorder: m.ruleStrong,
      actorTextColor: m.ink,
      actorLineColor: m.ruleStrong,
      signalColor: m.muted,
      signalTextColor: m.ink,
      labelBoxBkgColor: m.paper2,
      labelBoxBorderColor: m.ruleStrong,
      labelTextColor: m.ink,
      loopTextColor: m.muted,
      activationBkgColor: m.accentTint,
      activationBorderColor: m.accent,
      sequenceNumberColor: m.paper,
    },
    themeCSS: [
      `.node rect, .node polygon, .cluster rect, rect.actor, .statediagram-state rect, .stateGroup rect { rx: ${t.shape.radius}px; ry: ${t.shape.radius}px; }`,
      `.node rect, .node polygon, .node circle, rect.actor, .statediagram-state rect.basic { stroke-width: ${t.shape.strokeWidth}px; }`,
      `.flowchart-link, .messageLine0, .messageLine1, .transition { stroke-width: ${t.shape.arrowStroke}px; }`,
      `.edgeLabel, .messageText, .noteText { font-size: ${t.font.sizeSublabel + 1}px; }`,
      `code, .sublabel { font-family: ${t.font.mono}; }`,
    ].join(" "),
    flowchart: { curve: "basis", htmlLabels: true, padding: 12, nodeSpacing: 40, rankSpacing: 48 },
    sequence: { mirrorActors: false, actorMargin: 56, messageMargin: 32, noteMargin: 12, boxMargin: 8 },
    state: { padding: 8 },
  };
}
const mmLight = mermaidTheme("light");
const mmDark = mermaidTheme("dark");
write("mermaid.config.json", JSON.stringify({ light: mmLight, dark: mmDark }, null, 2) + "\n");

const toYaml = (obj, indent = 0) =>
  Object.entries(obj)
    .map(([k, v]) => {
      const pad = " ".repeat(indent);
      if (v && typeof v === "object") return `${pad}${k}:\n${toYaml(v, indent + 2)}`;
      return `${pad}${k}: ${typeof v === "string" ? JSON.stringify(v) : v}`;
    })
    .join("\n");
for (const [mode, cfg] of [["light", mmLight], ["dark", mmDark]]) {
  write(`mermaid-frontmatter.${mode}.yaml`, `---\nconfig:\n${toYaml(cfg, 2)}\n---\n`);
  write(`mermaid-init.${mode}.txt`, `%%{init: ${JSON.stringify({ theme: "base", themeVariables: cfg.themeVariables, themeCSS: cfg.themeCSS })} }%%\n`);
  const lines = statusKeys.map((s) => {
    const st = t.status[s][mode];
    return `    classDef ${s} fill:${st.fill},stroke:${st.border},color:${st.text},stroke-width:${t.shape.strokeWidth}px`;
  });
  lines.push(`    classDef focus fill:${t[mode].accentTint},stroke:${t[mode].accent},color:${t[mode].ink},stroke-width:${t.shape.strokeWidth + 0.5}px`);
  write(`mermaid-classdefs.${mode}.mmd`, `%% Paste at the end of a flowchart or stateDiagram-v2. Use: class NodeId success\n${lines.join("\n")}\n`);
}

/* ---------- CSS variables ---------- */
function cssBlock(mode) {
  const m = t[mode];
  const lines = BASE_KEYS.map((k) => `  ${prefix}-${kebab(k)}: ${m[k]};`);
  for (const s of statusKeys) {
    const st = t.status[s][mode];
    lines.push(`  ${prefix}-status-${s}-fill: ${st.fill};`, `  ${prefix}-status-${s}-border: ${st.border};`, `  ${prefix}-status-${s}-text: ${st.text};`);
  }
  return lines.join("\n");
}
const darkSelectors = (t.output?.darkSelectors ?? [".dark"]).join(",\n");
const css = `/* Generated by diagrams/scripts/generate.mjs on ${today} for ${t.client.name}. Do not edit; change tokens.json and regenerate. */
:root {
  ${prefix}-font-sans: ${t.font.sans};
  ${prefix}-font-mono: ${t.font.mono};
  ${prefix}-font-heading: ${t.font.heading};
  ${prefix}-size-label: ${px(t.font.sizeLabel)};
  ${prefix}-size-sublabel: ${px(t.font.sizeSublabel)};
  ${prefix}-radius: ${px(t.shape.radius)};
  ${prefix}-radius-sm: ${px(t.shape.radiusSmall)};
  ${prefix}-stroke: ${px(t.shape.strokeWidth)};
  ${prefix}-arrow-stroke: ${px(t.shape.arrowStroke)};
  ${prefix}-shadow: ${t.shape.shadow || "none"};
  ${prefix}-gap: ${t.shape.density === "compact" ? "8px" : "12px"};
${cssBlock("light")}
}

${darkSelectors} {
${cssBlock("dark")}
}

/* Status hooks for kit components: any element with data-status="<key>" inside a kit component. */
${statusKeys.map((s) => `:where(.dgsm, .dgsf) [data-status="${s}"] { ${prefix}-st-fill: var(${prefix}-status-${s}-fill); ${prefix}-st-border: var(${prefix}-status-${s}-border); ${prefix}-st-text: var(${prefix}-status-${s}-text); }`).join("\n")}
`;
write("diagram-theme.css", css);

/* ---------- diagram-design profile ---------- */
const fontSource = t.font.source === "web" && t.font.googleFontsUrl ? "web" : "system";
const L = t.light, D = t.dark;
const roleRows = [
  ["paper", "Page background, default node fill", L.paper, D.paper],
  ["paper-2", "Diagram container bg, secondary fill", L.paper2, D.paper2],
  ["ink", "Primary text, primary stroke", L.ink, D.ink],
  ["ink-strong", "High-contrast text on accent fills", L.ink, D.ink],
  ["muted", "Secondary text, default arrow stroke", L.muted, D.muted],
  ["soft", "Sublabels, boundary labels", L.soft, D.soft],
  ["rule", "Hairline borders", L.rule, D.rule],
  ["rule-solid", "Stronger borders, baselines", L.ruleStrong, D.ruleStrong],
  ["accent", "Focal / 1-2 max per diagram", L.accent, D.accent],
  ["accent-tint", "Fill for accent-bordered boxes", L.accentTint, D.accentTint],
  ["link", "HTTP/API calls, external arrows", L.link, D.link],
];
const profile = `<!-- diagram-design-profile
name: ${t.client.name.replace(/--/g, "-")}
slug: ${t.client.slug}
source-url: ${(t.client.styleGuideSource || "none").replace(/--/g, "-")}
created: ${today}
updated: ${today}
notes: Generated by the WriteChoice diagram kit from diagrams/brand/tokens.json
-->
# Style Guide

Generated from \`diagrams/brand/tokens.json\`. Edit the tokens file and regenerate instead of editing this file.

## Tokens

### Semantic roles

| Role | Purpose | Default (light) | Default (dark) |
|---|---|---|---|
${roleRows.map(([r, p, l, d]) => `| \`${r}\` | ${p} | \`${l}\` | \`${d}\` |`).join("\n")}

### Documentation status roles (diagram kit extension)

Use these instead of \`accent\` when a diagram encodes lifecycle status (payment states, job states, webhook outcomes). Color is never the only carrier of meaning: the state name is always written in the node.

| Role | Meaning | Light fill / border / text | Dark fill / border / text |
|---|---|---|---|
${statusKeys.map((s) => { const a = t.status[s].light, b = t.status[s].dark; return `| \`status-${s}\` | ${t.status[s].label ?? s} | \`${a.fill}\` / \`${a.border}\` / \`${a.text}\` | \`${b.fill}\` / \`${b.border}\` / \`${b.text}\` |`; }).join("\n")}

## Typography

| Role | Family | Size | Weight | Usage |
|---|---|---|---|---|
| \`title\` | ${t.font.heading} | 1.5rem | 600 | Page H1 |
| \`node-name\` | ${t.font.sans} | ${t.font.sizeLabel}px | 600 | Human-readable labels |
| \`sublabel\` | ${t.font.mono} | ${t.font.sizeSublabel}px | 400 | API values, fields, endpoints |
| \`eyebrow\` | ${t.font.sans} | ${t.font.sizeSublabel}px | 500 | Group tags, axis labels |
| \`arrow-label\` | ${t.font.mono} | ${t.font.sizeSublabel}px | 400 | Arrow annotations |
| \`callout\` | ${t.font.heading} | 14px | 400 | Editorial asides only |

### Font source

Font source: \`${fontSource}\`
${fontSource === "web" ? `\n\`\`\`html\n<link href="${t.font.googleFontsUrl}" rel="stylesheet">\n\`\`\`\n` : ""}
### Shape

Corner radius ${t.shape.radius}px, stroke ${t.shape.strokeWidth}px, shadow: ${t.shape.shadow || "none"}.
`;
write("diagram-design-profile.md", profile);

/* ---------- contrast report ---------- */
const report = `# Contrast report: ${t.client.name}

Generated ${today}. Thresholds follow WCAG 2.x: 4.5:1 for text, 3:1 for essential lines and borders.

| Check | Foreground | Background | Ratio | Min | Result |
|---|---|---|---|---|---|
${checks.map((c) => `| ${c.label} | \`${c.fg}\` | \`${c.bg}\` | ${c.value.toFixed(2)} | ${c.min} | ${c.value >= c.min ? "pass" : "**FAIL**"} |`).join("\n")}
`;
write("contrast-report.md", report);

/* ---------- preview page ---------- */
const swatches = (mode) =>
  BASE_KEYS.map((k) => `<div class="sw"><span style="background:${t[mode][k]}"></span><b>${k}</b><code>${t[mode][k]}</code></div>`).join("");
const chips = statusKeys.map((s) => `<span class="chip" style="background:var(${prefix}-status-${s}-fill);border-color:var(${prefix}-status-${s}-border);color:var(${prefix}-status-${s}-text)">${t.status[s].label ?? s}</span>`).join("");
const sampleState = (mode) => `stateDiagram-v2
    direction LR
    [*] --> Created
    Created --> Pending
    Pending --> Succeeded
    Pending --> Declined
    Succeeded --> Refunded
    Succeeded --> InDispute
    InDispute --> Succeeded
${fs.readFileSync(path.join(outDir, `mermaid-classdefs.${mode}.mmd`), "utf8").split("\n").slice(1).join("\n")}
    class Created neutral
    class Pending pending
    class Succeeded success
    class Declined failure
    class Refunded refund
    class InDispute dispute`;
const sampleSeq = `sequenceDiagram
    autonumber
    participant M as Your server
    participant A as API
    participant P as Provider
    M->>A: POST /payments
    A->>P: Authorize
    P-->>A: Authorized
    A-->>M: 201 Created (status: pending)
    A--)M: Webhook payment.succeeded`;
const preview = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${t.client.name} diagram style preview</title>
${t.font.googleFontsUrl ? `<link rel="stylesheet" href="${t.font.googleFontsUrl}">` : ""}
<style>
${css}
body{margin:0;font-family:var(${prefix}-font-sans);background:var(${prefix}-paper);color:var(${prefix}-ink);}
main{max-width:960px;margin:0 auto;padding:32px 20px 64px}
h1{font-family:var(${prefix}-font-heading);font-size:1.6rem;margin:0 0 4px}
h2{font-size:1.05rem;margin:40px 0 12px}
p{color:var(${prefix}-muted);margin:0 0 16px;max-width:70ch}
.row{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
.sw{display:grid;grid-template-columns:28px 1fr;grid-template-rows:auto auto;column-gap:8px;align-items:center;font-size:12px}
.sw span{grid-row:span 2;width:28px;height:28px;border-radius:6px;border:1px solid var(${prefix}-rule)}
.sw code{font-family:var(${prefix}-font-mono);color:var(${prefix}-soft)}
.chips{display:flex;flex-wrap:wrap;gap:8px}
.chip{border:var(${prefix}-stroke) solid;border-radius:var(${prefix}-radius-sm);padding:6px 10px;font-size:var(${prefix}-size-label);font-weight:600}
.card{background:var(${prefix}-paper);border:1px solid var(${prefix}-rule);border-radius:var(${prefix}-radius);padding:16px;overflow-x:auto}
button{font:inherit;border:1px solid var(${prefix}-rule-strong);background:var(${prefix}-paper-2);color:var(${prefix}-ink);border-radius:6px;padding:6px 12px;cursor:pointer}
.bad{color:var(${prefix}-status-failure-text)}
</style></head>
<body><main>
<h1>${t.client.name}: diagram style preview</h1>
<p>Generated ${today} from <code>diagrams/brand/tokens.json</code>. Source: ${t.client.styleGuideSource}. Share this page with the client to approve colors, type, and status semantics before production diagrams start.</p>
<button id="mode" type="button">Switch to dark</button>
<h2>Base palette</h2>
<div class="row" id="sw-light">${swatches("light")}</div>
<div class="row" id="sw-dark" hidden>${swatches("dark")}</div>
<h2>Status semantics</h2>
<p>Used in every lifecycle diagram, status badge, and status table so the same color always means the same thing.</p>
<div class="chips">${chips}</div>
<h2>Mermaid: state diagram</h2>
<div class="card"><pre class="mermaid" data-light="${encodeURIComponent(sampleState("light"))}" data-dark="${encodeURIComponent(sampleState("dark"))}"></pre></div>
<h2>Mermaid: sequence diagram</h2>
<div class="card"><pre class="mermaid" data-light="${encodeURIComponent(sampleSeq)}" data-dark="${encodeURIComponent(sampleSeq)}"></pre></div>
<h2>Contrast</h2>
<p>${failed.length ? `<span class="bad">${failed.length} check(s) below WCAG thresholds.</span> See generated/contrast-report.md.` : "All contrast checks pass."}</p>
</main>
<script type="module">
import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.esm.min.mjs";
const cfg = ${JSON.stringify({ light: mmLight, dark: mmDark })};
let mode = "light";
async function render() {
  document.documentElement.classList.toggle("dark", mode === "dark");
  document.getElementById("sw-light").hidden = mode !== "light";
  document.getElementById("sw-dark").hidden = mode !== "dark";
  mermaid.initialize({ startOnLoad: false, securityLevel: "strict", ...cfg[mode] });
  for (const el of document.querySelectorAll("pre.mermaid")) {
    el.removeAttribute("data-processed");
    el.textContent = decodeURIComponent(el.dataset[mode]);
  }
  await mermaid.run({ querySelector: "pre.mermaid" });
}
document.getElementById("mode").addEventListener("click", (e) => {
  mode = mode === "light" ? "dark" : "light";
  e.target.textContent = mode === "light" ? "Switch to dark" : "Switch to light";
  render();
});
render();
</script>
</body></html>
`;
write("preview.html", preview);

/* ---------- summary ---------- */
console.log(`Generated ${fs.readdirSync(outDir).length} files in ${path.relative(process.cwd(), outDir) || outDir}`);
if (failed.length) {
  console.warn(`\n${failed.length} contrast check(s) below threshold:`);
  for (const c of failed) console.warn(`  - ${c.label}: ${c.value.toFixed(2)} (min ${c.min})`);
  console.warn("Adjust tokens or confirm the exception with the client. See generated/contrast-report.md.");
  if (strict) process.exit(2);
} else {
  console.log("All contrast checks pass.");
}
