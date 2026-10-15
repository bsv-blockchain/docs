# Diagrams

Diagrams for this portal are made with the WriteChoice diagram kit, adapted to this client.

**To create a diagram**, ask Claude Code in this repo, for example:
"Create a sequence diagram for the refund flow on /guides/refunds" or
"Add the payout lifecycle as an interactive diagram".
The `diagrams` skill reads `.claude/skills/diagrams/project.md` and applies this client's style.

**Where things live**

| Folder | Contents |
|---|---|
| `brand/tokens.json` | Client style (colors, fonts, status colors). Edit this, never the generated files |
| `brand/generated/` | Mermaid theme, CSS variables, diagram-design profile, preview page. Regenerate with `node diagrams/scripts/generate.mjs` |
| `data/` | Data for lifecycle diagrams (one JSON per lifecycle) |
| `sources/` | Mermaid sources, diagram-design HTML, Figma links |
| `templates/mermaid/` | Starting points for Mermaid diagrams |
| `components/` | React components (StateMachine, StepFlow, Mermaid) |

**Scripts**

```bash
node diagrams/scripts/generate.mjs                       # tokens.json -> configs, preview, contrast report
node diagrams/scripts/state-to-mermaid.mjs diagrams/data/<slug>.json --out diagrams/sources/<slug>.mmd
node diagrams/scripts/json-to-snippet.mjs diagrams/data/<slug>.json snippets/diagrams/<slug>.jsx   # Mintlify
```

Kit version: see `KIT_VERSION`. Files listed in `kit-manifest.json > kitFiles` are shared across projects; change them in the kit, not here.
