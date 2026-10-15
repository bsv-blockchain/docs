# Diagram setup: <Client> docs

Status: not configured
Kit version: 1.0.0
Configured by / on:
Client approval (name, date):

## Platform
- Platform: <fumadocs | docusaurus | mintlify | nextra | starlight | other>
- Verified in platform docs on <date>: <what was checked: Mermaid theming, custom components, custom CSS>
- Dark mode selector(s): <.dark | [data-theme='dark']>
- Export folder: <public/images/diagrams>  (URL prefix: </images/diagrams>)
- Light/dark image pattern that works here:
  <paste the working MDX snippet>

## Diagram types
| Type | Enabled | Notes |
|---|---|---|
| Mermaid | yes | <global theme | frontmatter per diagram | kit Mermaid component> |
| React StateMachine / StepFlow | <yes/no> | <where components live, how data is passed> |
| diagram-design | <yes/no> | profile slug: <client-slug> |
| Figma | <yes/no> | file/library: <link> |

## Brand
- Style guide source: <link or file>
- Tokens: diagrams/brand/tokens.json (regenerate with `node diagrams/scripts/generate.mjs`)
- Contrast exceptions approved by client: <none | list>
- Status keys in use: neutral, info, pending, success, failure, dispute, refund <+ any added>
- Client-specific rules: <e.g. "never use the brand red for errors", "logos only in architecture diagrams">

## Content
- Source of truth for names and values: <OpenAPI spec path | API reference URL | SDK>
- Languages: <en | en + es | ...>
- Audience notes: <e.g. merchants' backend developers, mostly server-side>

## Project-specific changes to kit files
<none | file + reason (also report to kit maintainer)>

## Existing diagrams to migrate
<list found during setup, with status>
