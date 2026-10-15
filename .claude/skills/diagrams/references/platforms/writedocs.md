# WriteDocs: diagram notes

Verified on: 2026-10-12, kit 1.0.0, @writedocs/generator 0.10.13. Sources: https://preview.writedocs.io/docs/content/diagrams.md, /snippets.md, /configuration/custom-code.md, and testing in the BSV Docs portal.

## Basics
- Config file and detection: `writedocs.json`.
- Dev command and local URL: `npm run dev` (`writedocs dev`), http://localhost:4321.
- Dark mode selector: `[data-theme="dark"]` on `<html>`.
- Static assets: any folder in the project. Snippets live in `snippets/`.

## CSS
Every `.css` file in the project loads automatically, alphabetically by path (dot-folders, `node_modules`, `dist` excluded). The kit's `diagram-theme.css` and `diagram-components.css` therefore apply without wiring. Do not copy them into another file, and do not leave stray `.css` under `diagrams/`.

## Mermaid
Native ```mermaid fences. WriteDocs themes them itself and redraws on light/dark switch. No theme option is documented. The kit classDefs use light-only hex fills and break in dark mode, so skip them and the frontmatter theme.

## React components
- `.jsx` in `snippets/`, imported with `import X from '/snippets/...'`, default export.
- Keep the explicit `import { useState, ... } from 'react'` line. Without it a module-level `useEffect` fails with `useEffect is not defined`. Remove `"use client"`.
- Hooks inside components work. A component passed as a prop is not interactive.
- MDX children passed to a snippet arrive as pre-rendered HTML in an Astro island, not as React elements, so the component cannot read them (they still appear in the markdown export).
- The portal's existing interactive diagrams use `--wd-*` CSS variables for color. Follow them.

## Built-in components that overlap with kit types
`<Steps>` makes the kit's StepFlow redundant. Do not use StepFlow.

## Markdown export
`<page>.md` on the dev server (for example `/docs/concepts/wallet-model.md`).
- Component tags stay as bare tags, with nothing inside.
- `<Visibility for="agents">` content appears as plain prose; the tag itself is stripped.
- Mermaid fences appear as text.
- The dev server can serve a stale `.md` after edits. Restart it before judging.

## Agent text block
`<Visibility for="agents">...</Visibility>`, directly above the component.

## Verify step
```bash
PLAYWRIGHT_CORE=<path to playwright-core> node diagrams/scripts/check-page.mjs \
  --url http://localhost:4321/docs/<page>/ --selector ".<component-class>" \
  --md http://localhost:4321/docs/<page>.md --expect "<first words of the agent text>" \
  --out <scratch dir> [--desktop-width 1900]
```
Expect the text, not the `<Visibility` tag, in the export. The content column is narrower than the window because of the sidebars: at 1280px wide it can be under 780px, which makes the swimlane show its stacked layout. Use `--desktop-width 1900` to see the SVG layout, and check both.

## Gotchas found
- 2026-10-13: `<p>` elements inside a snippet are restyled by the portal (inline, left-aligned, ignoring the snippet's CSS). Use `div` with explicit `display` and `text-align`.
- 2026-10-13: a snippet inside `<Frame caption="...">` renders fine; the caption stays page text.
- 2026-10-12: `useEffect is not defined` after removing the `react` import from `StateMachine.jsx`.
- 2026-10-12: kit StateMachine overlapped edge labels and routed an edge through a box in a 4-column layout; replaced by a custom swimlane.
- 2026-10-12: StepFlow duplicated the built-in `<Steps>`.
- 2026-10-12: stale `.md` export until the dev server was restarted.
