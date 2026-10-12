# Setup mode: adapt the kit to this project

Run these steps in order. Ask the user only for what you cannot find in the repo. At the end, `project.md` must describe this project completely, because every later diagram request depends on it.

## 1. Inspect the project

Detect and note:

| What | How to detect |
|---|---|
| Platform | `docs.json` or `mint.json` → Mintlify. `source.config.ts` or `fumadocs-*` in package.json → Fumadocs. `docusaurus.config.*` → Docusaurus. `astro.config.*` with `@astrojs/starlight` → Starlight. `theme.config.*` with `nextra` → Nextra. |
| WriteDocs | `writedocs.json` → WriteDocs. See `platforms.md > WriteDocs`. |
| Mermaid support | Mintlify: native ```mermaid blocks. Docusaurus: `@docusaurus/theme-mermaid` in package.json. Fumadocs/Nextra/Starlight: check for a Mermaid component or remark plugin. |
| Custom React components | Mintlify: `snippets/` folder. Fumadocs: `mdx-components.tsx`. Docusaurus: `src/theme/MDXComponents` or direct imports. |
| Dark mode selector | Inspect the theme: `.dark` class (Fumadocs, Nextra, Mintlify), `[data-theme='dark']` (Docusaurus, Starlight). |
| Static assets folder | Fumadocs/Nextra: `public/`. Docusaurus: `static/`. Mintlify: any folder in the repo root, typically `images/`. Starlight: `public/` or `src/assets/`. |
| Languages | i18n config of the platform. |
| Existing diagrams | Search for ```mermaid blocks, `.svg`/`.png` in image folders, draw.io or Excalidraw files. List them; they may need restyling later. |

## 2. Build `tokens.json` from the client style guide

Ask for the style guide (PDF, Figma link, brand site URL, or the current portal URL). Copy `diagrams/brand/tokens.template.json` to `diagrams/brand/tokens.json` and fill it.

Mapping rules:

| Token | Take from |
|---|---|
| `paper`, `ink` | Docs portal background and body text color. Use the portal's colors, not the marketing site's, if they differ: diagrams live in the docs. |
| `paper2` | Card, callout, or code block background |
| `muted`, `soft` | Secondary text color. `soft` may be slightly lighter but must still pass 4.5:1 |
| `rule`, `ruleStrong` | Border and divider colors |
| `accent`, `link` | Primary brand color used for links and CTAs. Darken it if it fails 4.5:1 on `paper` |
| `font.*` | Portal fonts. Keep `source: inherit` for components and Mermaid inside the portal |
| `shape.radius` | Radius of cards and buttons in the portal |
| `shape.shadow` | Use `none` unless the style guide uses shadows on cards |
| Dark mode | Portal dark theme. If the client has no dark theme, still define dark values (invert paper and ink, brighten accents) because the platform has a dark toggle |
| `status.*` | Client semantic colors (success, warning, error, info) if the style guide has them. Map warning → `pending`, error → `failure`. Derive `dispute` and `refund` from the palette if missing. Keep the keys; add more only when the domain needs them |

Then run:

```bash
node diagrams/scripts/generate.mjs
```

Fix every contrast failure, or record the exception in `project.md` with the client's approval. Open `diagrams/brand/generated/preview.html` (needs internet for the Mermaid preview) and review it.

## 3. Enable diagram types

Ask which types the project needs, with a recommendation based on the platform and content:

| Type | Enable when | Requires |
|---|---|---|
| Mermaid | Always (default) | Platform Mermaid support or the kit `Mermaid.jsx` component |
| React components | API product with lifecycles, webhooks, or multi-step guides, and the platform supports custom React | See `platforms.md` |
| diagram-design | Overview pages, landing pages, polished static figures | diagram-design skill installed for the team (`npx skills add cathrynlavery/diagram-design`) |
| Figma | Illustrations, hero images, annotated screenshots | Figma MCP connected, and a client Figma file or library |

## 4. Wire the platform

Follow the section for this platform in `references/platforms.md`:

- Mermaid theme (global config, component, or per-diagram frontmatter)
- Component files and CSS (`diagram-theme.css` + `diagram-components.css`), only if React is enabled
- Dark mode selectors in `tokens.json > output.darkSelectors`, then regenerate
- Export folder in `tokens.json > output.exportDir`

## 5. Connect diagram-design (if enabled)

1. Copy `diagrams/brand/generated/diagram-design-profile.md` to `~/.diagram-design/profiles/<client-slug>.md`. Each writer who generates diagrams for this client does this once on their machine; the file in the repo is the source.
2. Create `.diagram-design` at the repo root containing exactly one line: `profile: <client-slug>`.
3. Tell the user: diagram-design uses one focal accent per diagram by design. For lifecycle diagrams, ask it to use the "Documentation status roles" table in the profile.

## 6. Connect Figma (if enabled)

Record the client Figma file or library link in `project.md`. If the client has no Figma library, create a file "Docs diagrams — <Client>" with color variables created from `tokens.json` (light and dark modes). The `/sync-figma-token` or `/cc-figma-tokens` Figma skills can create or check variables from the JSON.

## 7. Write `project.md`

Copy `templates/project.template.md` to `.claude/skills/diagrams/project.md` and fill every field. Set `Status: configured`.

## 8. Produce approval samples

Create one sample for each enabled type, using real content from this project when available (or `diagrams/data/example-payment-states.json`):

- Mermaid sequence diagram from `templates/mermaid/sequence-api-request.mmd`
- StateMachine page with the example data
- One diagram-design figure
- One Figma frame

Put them on a draft page (`diagram-samples.mdx`, excluded from navigation) and send it with `preview.html` to the client. Record approval (name, date) in `tokens.json > client` and `project.md`.

## 9. Commit

Commit kit files, generated files, `project.md`, `.diagram-design`, and the samples in one commit: `chore(diagrams): add diagram kit <version> for <client>`.

## Re-running setup

When the style guide changes: update `tokens.json`, regenerate, re-export static diagrams (diagram-design and Figma exports do not update automatically; list them from `diagrams/sources/` and the export folder), and update `project.md`. Mermaid and React diagrams update automatically.

When updating the kit version: replace only the files in `diagrams/kit-manifest.json`, run `generate.mjs`, check the samples page, and update `diagrams/KIT_VERSION`.
