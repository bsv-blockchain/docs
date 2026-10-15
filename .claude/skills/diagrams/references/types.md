# Workflow per diagram type

## Mermaid

Best for: request sequences, small decision flows, small lifecycles, anything that must change together with the API.

1. Start from a template in `diagrams/templates/mermaid/`:
   - `sequence-api-request.mmd`: client ↔ API ↔ provider, with async webhook
   - `flowchart-integration-decision.mmd`: "which path should I use"
   - `state-lifecycle.mmd`: small lifecycle without substatuses
2. No `title:` in the frontmatter and no title node: the page text introduces the diagram. Replace content with names from the source of truth. Endpoints as `METHOD /path`, events and status values exactly as in the API.
3. Status colors: copy the `classDef` lines from `diagrams/brand/generated/mermaid-classdefs.light.mmd` to the end of flowcharts and state diagrams, then `class NodeId <status-key>`. Sequence diagrams do not need classDefs.
4. Theme: if `project.md` says the platform has no global Mermaid theme, prepend `mermaid-frontmatter.light.yaml`.
5. Lifecycles with substatuses: do not write by hand. Create `diagrams/data/<slug>.json` and run
   `node diagrams/scripts/state-to-mermaid.mjs diagrams/data/<slug>.json --out diagrams/sources/<slug>.mmd`
   (`--collapse` for an overview without substatuses, `--with-config` to embed the theme).
6. Keep the source in the page (fence) or in `diagrams/sources/<slug>.mmd` when it is reused.

Sequence diagram rules:

- Name participants from the reader's point of view: "Your server", "Your app", "Customer", then the client's API and third parties.
- Use `autonumber` when the text refers to steps.
- Solid arrows for synchronous calls, `--)` for async (webhooks, events), dashed returns for responses.
- Show the happy path. Put errors and retries in a second diagram or in the text.
- Use `Note over` for timing that matters ("Capture happens asynchronously", "Token expires in 15 minutes").

## React: StateMachine

Best for: status lifecycles readers return to (payments, payouts, disputes, KYC, orders, jobs).

1. Create `diagrams/data/<slug>.json` following `diagrams/data/example-payment-states.json`:
   - `groups`: top-level statuses, each with `column` (left to right in the flow) and `order` (top to bottom in the column), `status` (a key from `tokens.json > status`), `apiValue`, `description`, optional `terminal: true`, and optional `states` (substatuses).
   - `transitions`: `from` and `to` group ids, optional short `label` ("Won", "Timeout").
   - `global`: states that can happen anywhere (errors).
   - `apiFields`: names of the API fields, so the detail panel shows `status: "pending"` correctly.
2. Layout: put the happy path along the middle row, negative outcomes above or below it, post-success states (refunds, disputes) in the last columns. Keep `columns` at 5 or fewer for normal content width; the component scrolls horizontally if needed and switches to a stacked list on narrow screens.
3. Descriptions: one or two sentences, written for the developer integrating: what the status means and what they should do.
4. Place it in the page after an intro sentence, followed by a status reference table (generated from the same JSON when possible) so the content is also searchable and printable.
5. Review it in light mode, dark mode, and at mobile width. Click every status and check transitions.

## React: StepFlow

Best for: getting-started and go-live guides, onboarding sequences, multi-step setup.

- 3 to 7 steps. Each step: title (imperative), optional `api` (endpoint), short description, optional `href` to the detailed page.
- The numbered steps must match the headings that follow on the page, in the same order and with the same names.
- Use `direction="horizontal"` only for 3 or 4 short steps at the top of a page.

## Static SVG pair (build-svg)

Best for: any static figure: process flow, sequence, layered architecture, lifecycle, decision flow, swimlane. One spec produces the light and the dark SVG with identical geometry and colors from `tokens.json`. Examples of each type, with their specs: `diagrams/sources/sample-*.diagram.json`, shown on `docs/diagram-samples.mdx`.

1. Pick the pattern type, then copy the closest sample spec. Names and values come from the source of truth.
2. Spec: `slug`, `alt` (what it shows plus the takeaway; becomes the image alt text and the SVG `<title>`), `width` (the content column width in `project.md`, default 720), `height`, `elements`. Element kinds: `group` (lanes, layers, containers), `node` (role plain, muted, accent or a status key; shapes rect, pill, diamond), `edge` (auto-routed or explicit `via`/`points`, label, dashed), `line` (lifelines), `text`. Full schema in the header of `build-svg.mjs`.
3. Colors only through roles. Use status roles only for states (success, pending, failure, info, neutral, dispute, refund). Use `accent` for at most one or two focal elements.
4. No title or intro text in the image (SKILL.md). Group titles, node subtitles, arrow labels and step numbers are part of the diagram.
5. Text sizes default to 14 (labels, 13 for monospace), 13 (subtitles, arrow labels, chips) and 12.5 (group labels), and the script rejects any size below 12.4 on a 720px canvas (12px on screen in the narrowest desktop column). Size the boxes for this text: choose widths and heights so the text fits, and drop words before you shrink the font. At 720px wide the image shrinks on a phone, so keep the image content simple; readers can tap to zoom on WriteDocs.
6. Run `node diagrams/scripts/build-svg.mjs <spec> --png <scratch dir>` with `PLAYWRIGHT_CORE` set. It measures every text in a real browser and fails (exit code 2) on: a font size below the minimum, text that does not fit its box or group, text outside the canvas, text on top of a box, an arrow, a lifeline or other text (this is what catches "Yes" and "No" labels under blocks), boxes overlapping, arrows crossing boxes. Without a browser it falls back to estimates and says so, which is weaker. A pass is not proof of a good diagram: always read the PNGs for both modes. Place edge labels in clear space, near the start of an arrow, and not in the corridor between two boxes where another arrow runs.
7. Place the page snippet the script prints (WriteDocs: `<Image src srcDark size="720px" alt />`). Run `check-diagram.mjs` on the SVGs.
8. A static image needs no agent text block when the alt text carries the content. When the diagram has more than about 6 nodes, also add the agent text block above it, because alt text is too short to carry a sequence or a branch.

Fonts are the system font stack: an SVG loaded as an image cannot use the portal's web fonts.

## Custom step-through swimlane

Best for: a flow with two actors (for example app and wallet) or a branch, where readers should go step by step. Use it when the platform already has a diagram like this and the kit's StateMachine does not fit (see the decisions file, D3).

1. Copy the project's existing swimlane snippet (here `snippets/AppWalletFlowSteps.jsx` or `snippets/diagrams/CreateActionFlow.jsx`) and change only the `steps`, `cards` and the SVG boxes and arrows.
2. Draw on fixed coordinates in a viewBox, so nothing overlaps: one box per fixed slot, arrows as explicit `M ... H ... V ...` paths, labels only where there is empty space. Put conditions in box subtitles instead of on arrows when the gap is under about 120px.
3. Text sizes: SVG text of at least 14 user units when the SVG is shown at 0.89 or more of its size, and HTML text of 13px or more; the audit in `check-page.mjs` reports the rendered size. Colors from the platform's theme variables (here `--wd-*`), never hex. Highlight the active box with the primary color, 2.5px stroke.
4. Order the steps so a branch reads as "Path 1" then "Path 2", and say which path each step is on.
5. Provide the stacked layout for narrow containers, the Back/Next buttons, and a live-region announcement for each step.
6. Add the agent text block above the component (next section).

## Static inline component (architecture, layers)

Best for: layered architecture and box-in-box overviews that should reflow on narrow screens or hold links (otherwise prefer the static SVG pair), on platforms where the project can ship React snippets. First built: `snippets/diagrams/StackLayers.jsx` on `docs/concepts/architecture.mdx`, replacing a hotlinked SVG image.

1. Source of truth for names: the page's own text or the API/SDK docs. Do not copy names from an old image; check each against the source and flag any you cannot confirm.
2. Build it as HTML and CSS (flex, wrapping chips), not as a fixed-coordinate SVG. It then adapts to any width with no separate mobile layout, and nothing overlaps. Use SVG only when arrows must cross between boxes in two dimensions (then use the swimlane pattern).
3. Colors only from the platform theme variables (`--wd-*` here). Layers are neutral surfaces; use the accent for at most one or two elements (the interface or boundary). Do not use a different hue per layer: status colors are reserved for states.
4. Content as arrays at the top of the file. Support an optional `href` on layers and chips, so the "Clickable parts" rule can be applied without changing the layout.
5. No title or subtitle for the figure (SKILL.md). A layer's own name and one short note are part of the diagram and fine.
6. Use `div`s with explicit `display` and `text-align`, not `p`: the portal's paragraph styles override them (found on WriteDocs).
7. Wrap in the platform's figure component with a caption (the caption is page text), put the agent text block above, and run the verify step including a narrow-width screenshot.

## Clickable parts

For an interactive diagram whose parts match existing pages or sections of the portal (a box named after a concept that has its own page, a step that is explained in a section), offer to make the parts clickable. The skill asks once, in the request step, and suggests the matches it found. Do not add links without the answer.

- Find matches in the navigation config and the page headings. Only link to pages and anchors that exist; run the platform's broken-link check after (here `npm run broken-links`).
- Link the box to the most specific section, not to the home of the docs. One target per box.
- The link must not break the interaction: Back/Next and the active-step highlight keep working. Clicking a box follows its link, so show it clearly: an underline or a small arrow on the label, a pointer cursor, and a visible keyboard focus.
- Swimlane: an optional `href` on each box, rendered as an SVG `<a>` around the box (`href` as a plain path, so it works as a normal link and in the stacked layout too).
- StepFlow and StateMachine: use the `href` field in the data, where the component supports it.
- Mermaid is not interactive for this purpose, but `click NodeId "/path"` makes a node a link.
- Mention the links in the agent text block (name the target page) so AI readers get them too.

## Agent text for component diagrams

React components render in the browser. The markdown export of a page (what AI tools and agents read) contains only the component tag, with nothing inside it. So every component diagram needs a text twin.

Rule: immediately above the component, add a block that only agents see, with the whole content of the diagram in prose.

- WriteDocs: `<Visibility for="agents">...</Visibility>` (the export keeps the prose and strips the tag).
- Other platforms: use that platform's equivalent. If none exists, put the same text in a visible paragraph or table before the diagram.
- Content: the number of steps or states, then every step, branch and transition in order, with exact names (methods, fields, statuses). Do not write "see the diagram".
- Keep it in the same page file, and update it together with the component: when the steps change, change both.
- Not needed for Mermaid fences (the source stays in the export as text) or static images with alt text. Check the export once per platform and record the result in `project.md`.

Does not work on WriteDocs: reading the text from `<Step>` children passed to the component. Snippets receive pre-rendered HTML, not React elements, so the diagram cannot use them, even though the export keeps them as text.

## diagram-design

Best for: architecture and integration overviews, swimlanes for multi-actor processes, landing-page figures, polished static diagrams.

1. Check `.diagram-design` at the repo root contains `profile: <client-slug>` and that the profile exists in `~/.diagram-design/profiles/`. If not, run setup step 5.
2. Prompt the diagram-design skill with: the type (architecture, swimlane, sequence, state, flowchart…), the exact content (nodes, labels, connections), the size `doc-inline` (or `doc-wide` for full-width pages), detail level, and audience `engineer`.
   For lifecycle figures add: "Use the Documentation status roles table from the profile for status fills; do not use accent for status."
3. Save the HTML source as `diagrams/sources/<slug>.html`.
4. Export light and dark SVG to the export folder (`<slug>.light.svg`, `<slug>.dark.svg`). Use system fonts or embedded fonts: an SVG loaded with `<img>` cannot use the portal's fonts or CSS variables.
5. To restyle an existing Mermaid, draw.io, or Excalidraw diagram, use diagram-design's import commands, then check the fidelity ledger it returns against the source of truth.

Note: diagram-design output can vary between runs and is not diff-friendly. Prefer Mermaid or StateMachine for diagrams that change often.

Required line in every diagram-design request (exact wording): "No title, no subtitle, no header or intro text, no empty band above the diagram. Start directly with the first element of the diagram." Static diagrams carry no title or intro text (see SKILL.md).

After exporting, run `node diagrams/scripts/check-diagram.mjs <file.svg|file.html> ...`. It flags text that looks like a title (large text near the top, or text above the first box). A flag is a suspect for a human to confirm in the screenshot, not proof. If confirmed, ask diagram-design again with the required line; do not hand-edit the SVG.

Before the first request on a machine, and whenever `tokens.json` changes, check that the local profile is current: `node diagrams/scripts/check-diagram.mjs --profile <client-slug>`. It compares `~/.diagram-design/profiles/<slug>.md` with `diagrams/brand/generated/diagram-design-profile.md`. If they differ, copy the repo file over the local one.

## Figma

Frames have no title or intro text, only the diagram or illustration (see SKILL.md).

Best for: concept illustrations, hero images, annotated screenshots of the client's dashboard, anything visual that is not boxes and arrows.

1. Use the client Figma file or library from `project.md` through the Figma MCP (the `/figma-use` skill gives Claude access to the canvas; `/figma-generate-design` builds from the client's components).
2. Use only the client's variables and components. One frame per image, named with the slug.
3. Annotated screenshots: crop to the relevant area, numbered markers in the accent color that match numbered steps in the text, no more than 4 to 5 markers per image. Blur or replace any real customer data.
4. Export SVG for illustrations, PNG at 2x for screenshots. Export light and dark versions if the image has a background.
5. Record the frame link in `diagrams/sources/figma-links.md` (slug, frame URL, last export date).

## Static exports in the page

Use the platform's light/dark image pattern and always set alt text:

```mdx
<img src="/images/diagrams/payment-lifecycle.light.svg" alt="..." className="block dark:hidden" />
<img src="/images/diagrams/payment-lifecycle.dark.svg" alt="..." className="hidden dark:block" />
```

Class names depend on the platform; record the working pattern in `project.md`.
