# <Platform>: diagram notes

Verified on: <date>, <kit version>, <platform version if known>. Sources: <doc URLs>, plus what was tested in a real project.
Only write what was checked. Mark anything unverified as "not verified".

## Basics
- Config file and detection:
- Dev command and local URL:
- Dark mode selector:
- Static assets folder / URL prefix:

## CSS
How custom CSS is loaded (auto, registered, imported) and what to avoid.

## Mermaid
Native fences? Theming possible? Does it redraw on light/dark switch? Do the kit classDefs work in both modes?

## React components
Where they live, import syntax, default or named exports, hooks, `"use client"`, what imports are allowed, how children and props arrive.

## Built-in components that overlap with kit types
List built-ins (steps, tabs, cards) that make a kit type redundant.

## Markdown export (what AI tools read)
URL pattern. What happens to component tags, to the agent-only block, to Mermaid fences, to images. Is it cached or stale after edits?

## Agent text block
The platform's exact syntax for text only agents see, and where to place it.

## Verify step
Exact `check-page.mjs` command for this platform (url, selector, theme attribute, md url, expected text), and quirks (content column width, sticky header, stale export).

## Gotchas found
Dated list of problems hit and the fix.
