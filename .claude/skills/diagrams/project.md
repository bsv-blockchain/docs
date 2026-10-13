# Diagram setup: BSV Docs

Status: configured (minimal, not client-approved)
Kit version: 1.0.0
Configured by / on: Claude Code, 2026-10-12
Client approval (name, date): pending

## Platform
- Platform: other (WriteDocs, `writedocs.json`; MDX with `/snippets/*.jsx` imports, same pattern as Mintlify)
- Verified 2026-10-12 in https://preview.writedocs.io/docs/content/diagrams.md, /snippets.md, /configuration/custom-code.md: native ```mermaid fences (follow site theme, redrawn on light/dark switch, no custom theming documented); React snippets in `snippets/` (hooks work without import, default-export components); every `.css` in the project auto-loads, alphabetically by path (dot-folders and node_modules excluded).
- Dark mode selector: `[data-theme="dark"]` on `<html>`
- Export folder: `images/diagrams` (URL `/images/diagrams`)

## Diagram types
| Type | Enabled | Notes |
|---|---|---|
| Mermaid | yes | Plain ```mermaid fences. WriteDocs themes them itself, so do NOT add the kit theme config; the kit's status classDefs may still work, check in preview |
| React StepFlow | no | Duplicates built-in `<Steps>` |
| React StateMachine | no | Copy to `snippets/diagrams/` when needed |
| diagram-design | no | Not set up |
| Figma | no | Not set up |

Hand-built SVG snippets using `--wd-*` variables (like `AppWalletFlowSteps.jsx`) are the existing style for custom figures.

## Brand
- Style guide source: `writedocs.json` colors (primary #1B1EA9, dark #8C9BFF). Neutrals and status colors are kit defaults, to be confirmed.
- Tokens: `diagrams/brand/tokens.json`
- CSS: `diagrams/brand/generated/diagram-theme.css` and `diagrams/components/diagram-components.css` load automatically (any .css loads). Do not copy them elsewhere. Do not add other stray .css files under `diagrams/`.
- Contrast exceptions: none

## Content
- Source of truth: ts-stack docs and the concept pages in `docs/concepts/`
- Languages: en

## Project-specific changes to kit files
- `StepFlow.jsx` copied unchanged to `snippets/diagrams/`.

## Existing diagrams to migrate
- `snippets/AppWalletFlowSteps.jsx` (How BSV works), `snippets/StackChooser.jsx`: custom, use `--wd-*` variables, left as is.

## Notes from testing
- StepFlow duplicates WriteDocs' built-in `<Steps>`. Do not use it; `snippets/diagrams/` was removed.
- Mermaid: skip the kit classDefs (light-only hex fills break in dark mode, WriteDocs themes and redraws Mermaid itself). First use: `diagrams/sources/createaction-outcomes.mmd` on `docs/concepts/wallet-model.mdx`.
- Custom step-through swimlane (project pattern, not a kit type): copy `snippets/AppWalletFlowSteps.jsx` (How BSV works) or `snippets/diagrams/CreateActionFlow.jsx`. Fixed-coordinate SVG, `--wd-*` colors, Back/Next, mobile stack. Use it for branching flows: the kit's auto-routed StateMachine overlapped edge labels and routed edges through boxes in a small 4-column layout, and did not match the portal's existing interactive diagram. StateMachine is not installed.
- Agent text rule applies to every React component diagram here: `<Visibility for="agents">` block directly above the component. Verified that the `.md` export drops component output and keeps Mermaid text.
- Test history and decisions: `.claude/skills/diagrams/decisions.md`.
- Verify command and platform notes: `references/platforms/writedocs.md`. Playwright here: `PLAYWRIGHT_CORE=/home/heitor/repositorios/triple-a-docs/node_modules/playwright-core` (machine-specific).
