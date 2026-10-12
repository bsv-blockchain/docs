#!/usr/bin/env node
/**
 * state-to-mermaid (kit file). Same data file as <StateMachine>, rendered as a static Mermaid diagram.
 *
 * Usage:
 *   node diagrams/scripts/state-to-mermaid.mjs diagrams/data/payment-states.json [--mode light|dark] [--with-config] [--collapse] [--out path.mmd]
 *
 *   --with-config  prepend the Mermaid frontmatter config from brand/generated (for platforms without a global Mermaid theme)
 *   --collapse     draw each status as one node (no substatuses) for overview pages
 *   --out          write to a file instead of stdout
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const input = args.find((a) => a.endsWith(".json"));
if (!input) {
  console.error("Pass a state machine JSON file, e.g. diagrams/data/payment-states.json");
  process.exit(1);
}
const mode = opt("--mode", "light");
const outFile = opt("--out", null);
const collapse = flag("--collapse");
const generated = path.join(here, "../brand/generated");

const data = JSON.parse(fs.readFileSync(input, "utf8"));
const id = (s) => s.replace(/[^A-Za-z0-9_]/g, "_");
const q = (s) => s.replace(/"/g, "'");

const groups = [...data.groups].sort((a, b) => a.column - b.column || a.order - b.order);
const lines = ["stateDiagram-v2", "    direction LR"];
const classes = [];

if (groups[0]) lines.push(`    [*] --> ${id(groups[0].id)}`);

for (const g of groups) {
  const gid = id(g.id);
  if (!collapse && g.states?.length) {
    lines.push(`    state "${q(g.label)}" as ${gid} {`, "        direction TB");
    for (const s of g.states) {
      const sid = `${gid}__${id(s.id)}`;
      lines.push(`        state "${q(s.label)}" as ${sid}`);
      classes.push(`    class ${sid} ${g.status}`);
    }
    lines.push("    }");
  } else {
    lines.push(`    state "${q(g.label)}" as ${gid}`);
    classes.push(`    class ${gid} ${g.status}`);
  }
}

for (const t of data.transitions) {
  lines.push(`    ${id(t.from)} --> ${id(t.to)}${t.label ? ` : ${q(t.label)}` : ""}`);
}
for (const g of groups.filter((g) => g.terminal)) lines.push(`    ${id(g.id)} --> [*]`);

for (const g of data.global ?? []) {
  const gid = id(g.id);
  lines.push(`    state "${q(g.label)} (any step)" as ${gid}`);
  lines.push(`    note right of ${gid} : ${q(g.description)}`);
  classes.push(`    class ${gid} ${g.status}`);
}

const classDefFile = path.join(generated, `mermaid-classdefs.${mode}.mmd`);
if (fs.existsSync(classDefFile)) {
  lines.push(...fs.readFileSync(classDefFile, "utf8").split("\n").filter((l) => l.trim().startsWith("classDef")));
} else {
  console.error(`(warning) ${classDefFile} not found. Run generate.mjs first to get status colors.`);
}
lines.push(...classes);

let out = lines.join("\n") + "\n";
if (flag("--with-config")) {
  const fm = path.join(generated, `mermaid-frontmatter.${mode}.yaml`);
  if (fs.existsSync(fm)) out = fs.readFileSync(fm, "utf8") + out;
}
if (outFile) {
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, out);
  console.log(`Wrote ${outFile}`);
} else {
  process.stdout.write(out);
}
