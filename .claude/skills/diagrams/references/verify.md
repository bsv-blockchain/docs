# Verify: look at the diagram before delivering

Never deliver a diagram you have not seen rendered. Most problems found in testing (overlapping labels, a crash from a missing import, a stale markdown export, content missing for AI readers) are only visible in the running portal.

## Before building
1. Read the platform file in `references/platforms/` (or create it from `_template.md` after this run).
2. List the platform's built-in components and the diagrams the portal already has. If a built-in does the same job, use it. If the portal has an interactive diagram, match its experience (see `types.md > Custom step-through swimlane`).

## After building
1. Start the dev server (command in the platform file). If the page does not show the change, restart it.
2. Run `node diagrams/scripts/check-page.mjs` with the command from the platform file. It reports console errors and a missing selector, writes screenshots (light, dark, desktop, phone), and checks that the markdown export contains the agent text.
3. Open the screenshots (the Read tool shows images) and check: overlapping text or arrows through boxes, contrast in dark mode, readable text at phone width, the active-step highlight, and that nothing is cut off. If the component has a layout switch for narrow containers, check both layouts (`--desktop-width`).
4. Fetch the page's markdown export and read what an AI reader gets. Component tags are empty there; the agent text block must carry the content.
5. Fix and repeat until the report is clean and the screenshots are acceptable.

## Static diagrams from diagram-design
Run `node diagrams/scripts/check-diagram.mjs <exports>` and confirm the local profile is current (`--profile <slug>`). Then look at the exported image: no title, no subtitle, no empty band on top.

## If the browser tooling is missing
`check-page.mjs` needs `playwright-core` and a Chromium (set `PLAYWRIGHT_CORE` and `CHROME_PATH`). If neither exists, say so, run the other checks (build log, console via the dev server output, markdown export with curl), and ask the user to look at the page in light, dark and phone width. Do not report the diagram as verified.

## After verifying
Add anything new about the platform to its file in `references/platforms/` (gotchas with a date), and decisions that change the skill to `decisions.md`.
