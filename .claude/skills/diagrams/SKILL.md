---
name: diagrams
description: Create and maintain diagrams and documentation images for this documentation portal in the client's visual style. Use this skill whenever the user asks for a diagram, flow, sequence, lifecycle, state machine, architecture overview, integration flow, step-by-step visual, figure, illustration, or image for the docs, wants to redraw or restyle an existing diagram, mentions Mermaid, diagram-design, Figma, or the StateMachine / StepFlow components, or asks to set up, adapt, or update the diagram kit in this project. Also use it when reviewing a docs page that contains diagrams.
---

# Diagram kit

This project uses the WriteChoice diagram kit. Every diagram in the portal must follow the client's style (from `diagrams/brand/tokens.json`) and this project's setup (from `project.md` in this folder).

## Step 0: Always read the project setup

Read `.claude/skills/diagrams/project.md` before doing anything else.

- If it does not exist, or says `Status: not configured`, the kit has not been adapted to this project yet. Run **Setup mode** (`references/setup.md`) before creating any diagram. Tell the user why.
- If it exists, follow it. Its rules (platform, enabled types, export paths, language, client exceptions) override the defaults in this file.

## Setup mode

Use when the kit was just copied into a project, when the client's style guide changed, or when the user asks to adapt or update the kit. Follow `references/setup.md` step by step. The result is a filled `project.md`, a `tokens.json`, generated configs, platform wiring, and a preview page for client approval.

## Create mode

### 1. Understand the request

Collect, from the request or by asking (one question at a time, only what is missing):

- What the reader needs to understand or do after seeing the diagram
- The page it goes on and the surrounding text
- If the diagram is interactive and its parts match existing pages or sections of the portal: whether the parts should be clickable and open that section. Ask once, and suggest the matches you found in the navigation (see `types.md > Clickable parts`). Default to asking, not to adding links on your own
- The source of truth for names and values: API reference, OpenAPI spec, SDK, or SME notes. Never invent endpoint names, status values, field names, or event names. If the source is missing, ask.

For bigger requests, use `templates/diagram-request.md`.

### 2. Choose the pattern, then the type

First read the platform reference in `references/platforms/` and check the platform's built-in components and the diagrams the portal already has (see `references/verify.md`). A built-in that does the same job beats a kit type, and an existing interactive diagram sets the experience to match.

First pick the documentation pattern in `references/portal-patterns.md` (lifecycle, request sequence, integration architecture, decision flow, step flow, concept illustration, annotated UI). The pattern decides what the diagram must show.

Then pick the diagram type. Only use types listed as enabled in `project.md`.

| Ask | Type |
|---|---|
| Does it change when the API changes, and is it simple (under ~12 nodes)? | Mermaid |
| Is it a status lifecycle or process readers look up repeatedly and should explore? | React `StateMachine` (data-driven) |
| Is it an ordered set of steps in a guide, with links to pages? | React `StepFlow`, or Mermaid flowchart if React is disabled |
| Is it a flow with branches or two actors that readers should step through, and the platform supports custom React? | Custom step-through swimlane (see `types.md`) |
| Is it a polished static figure (architecture, overview, swimlane, landing-page diagram)? | diagram-design |
| Is it an illustration, concept image, hero image, or annotated product screenshot? | Figma |

When two types fit, prefer the one that keeps a text source in the repo (Mermaid, data JSON) over a drawn file. When React is disabled and the request is a lifecycle, write the data JSON anyway and render it with `state-to-mermaid.mjs`, so it can move to React later.

State the choice to the user in one or two sentences (pattern, type, and why) before building.

### 3. Build

Follow the type's section in `references/types.md`. The short version:

- **Mermaid**: start from `diagrams/templates/mermaid/`. Apply status colors with the classDefs in `diagrams/brand/generated/`. Add the theme config only if `project.md` says the platform has no global Mermaid theme.
- **StateMachine**: write or update `diagrams/data/<slug>.json` (schema: `diagrams/data/example-payment-states.json`), then place the component in the MDX page.
- **StepFlow**: props inline in the MDX page.
- **diagram-design**: confirm `.diagram-design` at the repo root points to this client's profile, then prompt the diagram-design skill. Save the HTML in `diagrams/sources/` and export SVG light and dark to the export folder.
- **Custom swimlane**: follow `types.md > Custom step-through swimlane`. The agent text rule below applies.
- **Figma**: use the Figma MCP with the client's library (link in `project.md`). Use the client's variables only. Export SVG when possible.

### 4. Check and deliver

Verify the result as described in `references/verify.md` (render it, screenshots in light, dark and phone width, console errors, markdown export). Then run the checklist in `references/checklist.md`. Then give the user:

- The files created or changed
- The MDX snippet to paste (component, image with alt text, or Mermaid block)
- The sentence that introduces the diagram in the page, and a suggested caption. Both go in the page text, never inside the image
- The agent text block, when the diagram is a React component
- What you verified and how (screenshots checked, markdown export checked), or what you could not verify
- Anything you assumed and need them to confirm (names, values, transitions)

## Conventions

- File names: kebab-case slug describing the content, the same across source, data, and exports: `payment-lifecycle.json`, `payment-lifecycle.light.svg`, `payment-lifecycle.dark.svg`.
- Sources: `diagrams/sources/` (Mermaid `.mmd`, diagram-design `.html`, `figma-links.md`). Data: `diagrams/data/`. Exports: the folder in `project.md`.
- Colors only through tokens. Never hardcode a hex value in a diagram, component, or Mermaid block, except the generated classDefs.
- Status colors always mean the same thing across the portal: the keys in `tokens.json > status`.
- **No title or intro text inside static diagrams.** A non-interactive diagram (Mermaid, diagram-design, Figma, any exported image) starts with the diagram itself: no title, no subtitle, no explanatory sentence at the top. The explanation goes in the page text before it and in the caption (outside the image). Labels, box subtitles, legends and arrow labels that are part of the diagram are fine. Interactive components can have a step title and description because those are part of the interaction.
- **Agent text rule.** Every React component diagram (StateMachine, StepFlow, custom swimlane) is followed by nothing on its own for AI readers: the markdown export of a page keeps the component tag and drops what it renders. So always add an agent-only text block immediately ABOVE the component, in the page, with the full content of the diagram (every step, state, branch and transition, with exact names). On WriteDocs: `<Visibility for="agents">`. Mermaid fences and static images with alt text do not need it, because Mermaid source survives as text. Details in `types.md > Agent text for component diagrams`.
- Text stays text (Mermaid, SVG, React). Never ship diagrams as raster images with baked-in text unless it is a product screenshot.
- One idea per diagram. If a diagram needs more than about 12 nodes or two levels of nesting, split it or use StateMachine.
- Do not edit kit files (listed in `diagrams/kit-manifest.json`) for a single project. If a kit file needs a change, note it for the kit maintainer.

## Reference files

- `references/setup.md`: adapting the kit to a project
- `references/platforms.md`: wiring for Fumadocs, Docusaurus, Mintlify, and others, and the index of per-platform files in `references/platforms/`
- `references/verify.md`: how to check a diagram in the running portal before delivering
- `references/types.md`: detailed workflow per diagram type
- `references/portal-patterns.md`: documentation diagram patterns and writing rules, with external references
- `references/checklist.md`: definition of done and review checklist
- `templates/project.template.md`, `templates/diagram-request.md`
