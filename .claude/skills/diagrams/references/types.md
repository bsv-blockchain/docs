# Workflow per diagram type

## Mermaid

Best for: request sequences, small decision flows, small lifecycles, anything that must change together with the API.

1. Start from a template in `diagrams/templates/mermaid/`:
   - `sequence-api-request.mmd`: client ↔ API ↔ provider, with async webhook
   - `flowchart-integration-decision.mmd`: "which path should I use"
   - `state-lifecycle.mmd`: small lifecycle without substatuses
2. Replace content with names from the source of truth. Endpoints as `METHOD /path`, events and status values exactly as in the API.
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

## Custom step-through swimlane

Best for: a flow with two actors (for example app and wallet) or a branch, where readers should go step by step. Use it when the platform already has a diagram like this and the kit's StateMachine does not fit (see the decisions file, D3).

1. Copy the project's existing swimlane snippet (here `snippets/AppWalletFlowSteps.jsx` or `snippets/diagrams/CreateActionFlow.jsx`) and change only the `steps`, `cards` and the SVG boxes and arrows.
2. Draw on fixed coordinates in a viewBox, so nothing overlaps: one box per fixed slot, arrows as explicit `M ... H ... V ...` paths, labels only where there is empty space. Put conditions in box subtitles instead of on arrows when the gap is under about 120px.
3. Colors from the platform's theme variables (here `--wd-*`), never hex. Highlight the active box with the primary color, 2.5px stroke.
4. Order the steps so a branch reads as "Path 1" then "Path 2", and say which path each step is on.
5. Provide the stacked layout for narrow containers, the Back/Next buttons, and a live-region announcement for each step.
6. Add the agent text block above the component (next section).

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

## Figma

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
