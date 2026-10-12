# Definition of done

Run through this before delivering any diagram. Report anything that fails and why.

## Content
- [ ] Every name and value (endpoints, statuses, events, fields) matches the source of truth exactly
- [ ] The diagram shows one idea; no more than about 12 nodes unless it is a StateMachine
- [ ] Happy path is clear; errors are covered here or in a linked diagram or table
- [ ] Everything in the diagram is also available as text on the page (prose, table, or steps)
- [ ] Numbered steps match the numbers referenced in the text
- [ ] React component diagrams have the agent text block directly above them, covering every step, branch and transition, and matching the component's text
- [ ] Fetched the page's markdown export (for example `<page>.md` on the dev server; restart it if stale) and confirmed the text twin is there

## Style
- [ ] Colors come only from tokens (generated classDefs, CSS variables, client Figma variables, or the diagram-design profile)
- [ ] Status colors use the semantic keys and mean the same as everywhere else in the portal
- [ ] At most one or two elements use the accent color
- [ ] Fonts, radius, and stroke match the client setup
- [ ] Looks correct in light and dark mode
- [ ] Readable at the portal's content width and on a phone (or scrolls horizontally on purpose)

## Accessibility
- [ ] Alt text (static images) or a figure caption with title (components) describes what it shows and the takeaway
- [ ] Color is never the only way to understand a state or path
- [ ] Text contrast at least 4.5:1, essential lines and borders at least 3:1 (`generate.mjs` checks tokens)
- [ ] Interactive components work with the keyboard and show focus

## Files
- [ ] Source committed next to exports: `.mmd`, `.html`, `.json`, or Figma link in `diagrams/sources/figma-links.md`
- [ ] Same slug across source, data, and exports
- [ ] Static exports in the export folder from `project.md`, light and dark
- [ ] No raster text except product screenshots
- [ ] Localized projects: text kept as text, and a translated version exists or is tracked for each language

## Review questions
1. Would a developer new to this API understand the flow from this diagram and its intro sentence alone?
2. Is there anything in the diagram that the API does not actually do?
3. If the API changes next month, how many files must be edited? (More than one: consider moving it to data or Mermaid.)
