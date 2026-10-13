# Diagram skill: test decisions (BSV Docs, WriteDocs)

Date: 2026-10-12. Kit version: 1.0.0. Purpose: results of testing the diagrams skill on a real portal, to merge into the central skill repo.
Platform: WriteDocs (`writedocs.json`), MDX pages, `snippets/` for React.

## Summary

The skill worked end to end after a minimal setup, but the kit assumed platforms that have no built-in components and no per-platform export check. Nine decisions came out of the test. The three that change the skill most are D3 (custom swimlane instead of StateMachine), D6 (agent text above every component diagram) and D8 (verify the rendered page before delivering).

## Decisions

**D1. Setup ran on first use, minimal and unapproved.**
The kit was copied in without `project.md` or `tokens.json`, so Step 0 sent us to Setup mode. We built `tokens.json` from `writedocs.json` colors (primary #1B1EA9, dark #8C9BFF) and kit defaults for the rest, generated the configs, and wrote `project.md` with "approval pending".
Why: the goal was to test the skill, not to get client approval of the style.
For the kit: Setup should list WriteDocs in the platform detection table (done, `setup.md`), and say that a minimal setup is allowed for tests, with approval left pending.

**D2. StepFlow rejected on WriteDocs.**
First diagram was a StepFlow (SPV verification steps). The user pointed out WriteDocs already ships `<Steps>`, and the result looked the same. Reverted and removed.
Why: a kit type that duplicates a built-in component adds nothing.
For the kit: before choosing a type, check the platform's built-in components. `platforms.md > WriteDocs` now says not to use StepFlow there.

**D3. Custom step-through swimlane instead of StateMachine, for small branching flows.**
We built the `createAction` outcomes (one branch, 7 boxes) as a StateMachine. In a 4-column layout, edge labels overlapped boxes and one edge ran through a box. The portal also already had an interactive diagram (How BSV works: fixed-coordinate SVG swimlane, Back/Next, active box highlighted, mobile stack) and the StateMachine did not give the same experience.
Decision: for branching or two-actor flows, copy the project's existing swimlane snippet and edit boxes and arrows. New file: `snippets/diagrams/CreateActionFlow.jsx`. StateMachine removed from the project.
For the kit: new section `types.md > Custom step-through swimlane`. Open question for the maintainer: improve StateMachine edge routing and label placement for small graphs, or document it as only for larger lifecycles.

**D4. Mermaid without kit classDefs on WriteDocs.**
WriteDocs themes Mermaid itself and redraws it on light/dark switch. The kit's classDefs use light-only hex fills, which break in dark mode. First Mermaid diagram uses no classDefs and no frontmatter theme: `diagrams/sources/createaction-outcomes.mmd`.
For the kit: generate classDefs that work in both modes, or document "skip them when the platform themes Mermaid".

**D5. WriteDocs platform notes.**
Verified in the WriteDocs docs and by testing. Now in `platforms.md > WriteDocs`. Key points:
- Every `.css` in the project loads automatically, so the kit's generated and component CSS apply without wiring. Copying them into `theme.css` was removed.
- Snippets need the explicit `import { useState, ... } from 'react'` line. Without it, module-level `useEffect` fails (`useEffect is not defined`, found by the user). Remove only `"use client"`.
- Dark selector is `[data-theme="dark"]`.
- The dev server can serve a stale `.md` export. Restart before judging.

**D6. Agent text above every React component diagram (rule).**
The markdown export of a page keeps component tags as bare tags (`<CreateActionFlow />`) with nothing inside. Mermaid fences survive as text. So an AI reading the page gets nothing from a component diagram.
Rule: immediately above the component, add an agent-only block with the full content of the diagram (every step, branch, transition, exact names). On WriteDocs: `<Visibility for="agents">`. Not needed for Mermaid or static images with alt text. Added to `SKILL.md` (Conventions and deliverables), `types.md > Agent text for component diagrams`, and `checklist.md` (includes fetching the page's `.md` to confirm).
Placement: above the component, as the user decided. The existing How BSV works page puts it below; it was left as is.
Risk: the text lives twice (agent block and component), so they can drift. Accepted; the checklist asks to update both.

**D7. Tried and rejected: pass the steps as `<Step>` children of the component.**
Idea: one source of text, in the page, used by both the export and the diagram. Result: the `.md` export keeps the children as text, but WriteDocs hands snippets pre-rendered HTML in an Astro island, not React elements, so the component cannot read them (a marker title change appeared in the HTML island and the export, but not in the diagram). Reading the HTML string would depend on WriteDocs internals; skipped. Documented under "Does not work" in `types.md`.

**D8. A verify step: render the page before delivering.**
The first diagrams were delivered unseen. The user found every real problem (duplicate of a built-in, overlapping labels, a crash, a stale export). Added `references/verify.md` and `diagrams/scripts/check-page.mjs` (Playwright: console errors, screenshots in light, dark, desktop and phone, markdown export text check). Tested on the real page. Also: check platform built-ins and the portal's existing diagrams before choosing a type.
Finding from the first run: the page's content column is under 780px at a 1280px window, so a component with a narrow-container layout shows its stacked layout; the script has `--desktop-width` to see both.
Needs `playwright-core` and Chromium; verify.md says what to do without them (do not claim verified).

**D9. Per-platform references.**
Platform facts moved out of `platforms.md` into `references/platforms/<platform>.md`, from a fixed template (`_template.md`): CSS, Mermaid, React, built-ins that overlap, markdown export, agent text syntax, verify command, dated gotchas. `platforms.md` keeps the wiring snippets for platforms not yet verified and an index. A platform gets its own file the first time it is verified in a project.

**D10. Interactive diagrams related to existing sections: ask about clickable parts.**
User decision. When the parts of an interactive diagram match pages or sections of the portal, the skill asks once whether they should be clickable, and suggests the matches from the navigation. Default is to ask, not to add links. Links must target existing pages or anchors (broken-link check), keep the Back/Next interaction working, show the affordance, and be named in the agent text. Rules in `types.md > Clickable parts`. Not yet implemented in `CreateActionFlow.jsx` (the swimlane has no `href` support yet); do it when a diagram needs it.

**D11. No title or intro text inside static diagrams.**
User decision, from a reviewed example that had a title and a one-line description above the diagram. Rule: non-interactive diagrams (Mermaid, diagram-design, Figma, exports) start with the diagram; the explanation goes in the page text and the caption outside the image. Labels and legends that belong to the diagram are fine. Interactive components may keep a step title and description. Added to `SKILL.md`, `types.md` (Mermaid, diagram-design, Figma), `checklist.md` and `portal-patterns.md`.
Four layers, because diagram-design is third-party and its output varies:
1. `generate.mjs` now writes a "Documentation diagram rules" section into the diagram-design profile and marks the `title` role as unused. Before this, the profile defined `title` as "Page H1", which invited a title.
2. `types.md` has an exact line to include in every diagram-design request.
3. New `diagrams/scripts/check-diagram.mjs` flags title suspects in exported SVG/HTML (large text near the top, or text above the first box). Heuristic: confirm by looking. Tested only on two synthetic SVGs (one with a title, one clean), not on real diagram-design output.
4. `check-diagram.mjs --profile <slug>` compares the writer's `~/.diagram-design/profiles/<slug>.md` with the repo profile, because each writer copies the profile once and can keep a stale one.
Not tested: diagram-design itself (not installed here). The rule is untested end to end until a real run.

## Changes to kit files (merge into the central repo)

| File | Change |
|---|---|
| `.claude/skills/diagrams/SKILL.md` | Table row for the custom swimlane; build bullet; agent text rule in Conventions; agent block in deliverables |
| `references/types.md` | New sections: Custom step-through swimlane, Agent text for component diagrams |
| `references/checklist.md` | Two items: agent text block present and matching; markdown export checked |
| `references/platforms.md` | New section: WriteDocs |
| `references/setup.md` | WriteDocs row in the platform detection table |
| `references/verify.md` | New: verify procedure |
| `references/platforms/_template.md`, `platforms/writedocs.md` | New: per-platform reference template and the WriteDocs file (moved out of `platforms.md`) |
| `diagrams/scripts/check-page.mjs` | New: render and export check |
| `diagrams/scripts/check-diagram.mjs`, `generate.mjs` | New check script for static diagrams and profile sync; the profile now carries the no-title rules (D11) |
| `diagrams/kit-manifest.json` | The four new files listed as kit files |

`KIT_VERSION` and `kit-manifest.json` were not changed. Suggest a version bump when merged.

## Project files created

`diagrams/brand/tokens.json` and `generated/`, `.claude/skills/diagrams/project.md`, `diagrams/sources/createaction-outcomes.mmd`, `snippets/diagrams/CreateActionFlow.jsx`. Page changed: `docs/concepts/wallet-model.mdx` (section "What createAction Can Return": Mermaid diagram, agent text block, swimlane component).

## Open items

- Decided: the Mermaid diagram was dropped from `wallet-model.mdx`; the swimlane with its agent text block stays. The Mermaid source remains in `diagrams/sources/createaction-outcomes.mmd`.
- Tokens beyond the primary color are kit defaults, not client-approved.
- diagram-design and Figma were not tested (diagram-design not installed, Figma not signed in).
- Nothing is committed.
