#!/usr/bin/env node
/**
 * json-to-snippet (kit file). Wraps a data JSON file as a named JS export, for platforms whose MDX
 * cannot import JSON (for example Mintlify snippets).
 *
 * Usage: node diagrams/scripts/json-to-snippet.mjs diagrams/data/payment-lifecycle.json snippets/diagrams/payment-lifecycle.jsx
 * Result: export const paymentLifecycle = { ... };
 */
import fs from "node:fs";
import path from "node:path";

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("Usage: json-to-snippet.mjs <input.json> <output.jsx>");
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(input, "utf8"));
const name = path.basename(input, ".json").replace(/[-_](\w)/g, (_, c) => c.toUpperCase());
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(
  output,
  `// Generated from ${input} by diagrams/scripts/json-to-snippet.mjs. Edit the JSON, then regenerate.\nexport const ${name} = ${JSON.stringify(data, null, 2)};\n`
);
console.log(`Wrote ${output} (export const ${name})`);
