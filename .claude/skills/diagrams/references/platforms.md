# Platform wiring

Platforms change often. Before wiring, check the platform's current docs for Mermaid support, custom React components, and custom CSS, and record what you verified in `project.md`. The snippets below are starting points, not guaranteed APIs.

All paths below assume the kit sits at the repo root (`diagrams/`, `.claude/skills/diagrams/`). Adjust import aliases to the project's setup.

---

## Fumadocs (Next.js)

**Dark selector:** `.dark` · **Static folder:** `public/` · **Export dir:** `public/images/diagrams` (URL `/images/diagrams/...`)

**CSS**: in the global stylesheet (often `app/global.css`):

```css
@import "../diagrams/brand/generated/diagram-theme.css";
@import "../diagrams/components/diagram-components.css";
```

**Components**: install Mermaid (`npm i mermaid`), then register the kit components in the project's MDX components function (`mdx-components.tsx`; the function name varies by version):

```tsx
import defaultMdxComponents from "fumadocs-ui/mdx";
import { Mermaid } from "@/diagrams/components/Mermaid";
import { StateMachine } from "@/diagrams/components/StateMachine";
import { StepFlow } from "@/diagrams/components/StepFlow";

export function getMDXComponents(components) {
  return { ...defaultMdxComponents, Mermaid, StateMachine, StepFlow, ...components };
}
```

The kit components start with `"use client"`, so they work in the App Router.

**Mermaid**: use `<Mermaid chart={...} config={mermaidConfig} />`. If the team prefers ```mermaid fences, add a remark plugin that converts them into the `Mermaid` component (Fumadocs documents a Mermaid setup; follow the current guide) and pass the generated config to it.

**Data**: MDX can import JSON directly:

```mdx
import paymentLifecycle from "@/diagrams/data/payment-lifecycle.json";
import mermaidConfig from "@/diagrams/brand/generated/mermaid.config.json";

<StateMachine data={paymentLifecycle} />
```

---

## Docusaurus

**Dark selector:** `[data-theme='dark']` · **Static folder:** `static/` · **Export dir:** `static/img/diagrams` (URL `/img/diagrams/...`)

**CSS**: in `src/css/custom.css`:

```css
@import "../../diagrams/brand/generated/diagram-theme.css";
@import "../../diagrams/components/diagram-components.css";
```

**Mermaid fences**: install `@docusaurus/theme-mermaid` and theme it from the generated config:

```js
// docusaurus.config.js
const mm = require("./diagrams/brand/generated/mermaid.config.json");

module.exports = {
  markdown: { mermaid: true },
  themes: ["@docusaurus/theme-mermaid"],
  themeConfig: {
    mermaid: {
      theme: { light: "base", dark: "base" },
      options: { themeVariables: mm.light.themeVariables, themeCSS: mm.light.themeCSS },
    },
  },
};
```

Limitation: `options` applies to both modes, so dark mode reuses the light variables. If dark mode matters for a diagram, use the kit `<Mermaid>` component instead of a fence, which switches configs with the theme.

**Components**: import per page, or register globally by swizzling MDXComponents (`npm run swizzle @docusaurus/theme-classic MDXComponents -- --eject`) and adding `Mermaid`, `StateMachine`, `StepFlow`. JSON imports work in MDX.

---

## Mintlify

**Dark selector:** `.dark` · **Export dir:** `images/diagrams` (URL `/images/diagrams/...`)

**Mermaid**: Mintlify renders ```mermaid fences natively. Check the current docs for a global Mermaid theme option. If there is none, paste the generated frontmatter config at the top of each diagram:

````md
```mermaid
---
config:
  theme: "base"
  themeVariables: ...   (copy from diagrams/brand/generated/mermaid-frontmatter.light.yaml)
---
sequenceDiagram
  ...
```
````

Frontmatter fixes the theme to light. Check how it looks in dark mode. If it is not acceptable for a page, export the diagram as light and dark SVG (diagram-design or Mermaid CLI) and use Mintlify's light/dark image pattern instead.

**React components**: Mintlify supports custom React components through the `snippets/` folder. Verify the current constraints at setup (supported React features, whether hooks need an explicit import, no npm imports). Then:

1. Copy `StateMachine.jsx` and `StepFlow.jsx` to `snippets/diagrams/`. Keep the `export const` form. If the platform rejects `"use client"` or the `react` import line, remove them in the project copy and note it in `project.md`.
2. Convert data to a snippet, because MDX there cannot import JSON:
   `node diagrams/scripts/json-to-snippet.mjs diagrams/data/payment-lifecycle.json snippets/diagrams/payment-lifecycle.jsx`
3. Use in a page:

```mdx
import { StateMachine } from "/snippets/diagrams/StateMachine.jsx";
import { paymentLifecycle } from "/snippets/diagrams/payment-lifecycle.jsx";

<StateMachine data={paymentLifecycle} />
```

**CSS**: append `diagram-theme.css` and `diagram-components.css` to the custom CSS file Mintlify loads from the repo (for example `style.css` at the root). Since Mintlify does not resolve `@import` of repo paths reliably, add a script step or copy the contents and note that the copy must be refreshed after `generate.mjs`.

`Mermaid.jsx` is not needed on Mintlify.

---

## Nextra

Same approach as Fumadocs (Next.js, `.dark` class, `public/`). Nextra supports ```mermaid fences through its own integration; if its theme cannot be configured with `themeVariables`, use the kit `<Mermaid>` component for client-styled diagrams.

## Starlight (Astro)

**Dark selector:** `[data-theme='dark']`. React components need the `@astrojs/react` integration and a `client:load` directive when used in MDX. Mermaid needs a plugin (rehype or Astro integration); pass `mm.light` from the generated config, or use static SVG exports. Add the CSS files through Starlight's `customCss` option.

## WriteDocs

Verified 2026-10-12 against https://preview.writedocs.io/docs/content/diagrams.md, /snippets.md, /configuration/custom-code.md, and by testing on a real project.

- **Dark selector:** `[data-theme="dark"]` on `<html>`. Config file: `writedocs.json`.
- **CSS:** every `.css` file in the project loads automatically, alphabetically by path (dot-folders, `node_modules`, `dist` excluded). Do not copy the generated CSS into another file, and do not leave stray `.css` under `diagrams/`.
- **Mermaid:** native ```mermaid fences. WriteDocs themes them and redraws on light/dark switch; no theme option is documented. Skip the kit classDefs and the frontmatter theme (light-only fills break in dark mode).
- **React snippets:** `.jsx` in `snippets/`, imported with `import X from '/snippets/...'`, default export. Keep the explicit `import { useState, ... } from 'react'` line (without it a module-level `useEffect` fails with `useEffect is not defined`); remove `"use client"`. Hooks inside components work. Props that are components are not interactive.
- **Children:** MDX children passed to a snippet arrive as pre-rendered HTML in an Astro island, not as React elements. A component cannot read them. They do appear in the markdown export.
- **Markdown export:** `<page>.md` on the dev server. Component tags stay as bare tags. `<Visibility for="agents">` content appears as plain prose. Mermaid fences appear as text. The dev server can serve a stale `.md`; restart it before judging.
- **Built-in components** such as `<Steps>` overlap with the kit's StepFlow. Do not use StepFlow on WriteDocs.
- **Interactive diagrams already in the portal** use `--wd-*` CSS variables. New custom diagrams follow them (see Custom step-through swimlane in `types.md`).

## Any other platform

The minimum that works everywhere: Mermaid with per-diagram frontmatter config, and static SVG exports (light and dark) from diagram-design or Figma. Record the limits in `project.md`.
