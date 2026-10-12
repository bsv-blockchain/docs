# Documentation diagram patterns

Developer portals that set the bar (Stripe, Adyen, Twilio, Plaid) use a small set of recurring diagram patterns. Pick the pattern first: it decides what the diagram must show and what to leave out.

## Patterns

### 1. Lifecycle (state machine)
- **Use for:** payment, payout, refund, dispute, order, KYC, job statuses.
- **Must show:** every status the API can return, the allowed transitions, which statuses are final, and the exact API values.
- **Pair with:** a per-status table (meaning, what the developer should do, related webhook event).
- **Avoid:** transitions the API does not allow; internal states the API never returns.
- **Type:** StateMachine (React), or Mermaid state diagram generated from the same data.
- **Reference:** Stripe's PaymentIntent lifecycle page combines a status diagram with an explanation of each status and the action the integration should take.

### 2. Request sequence
- **Use for:** create/confirm flows, authentication and token refresh, 3D Secure redirects, webhook confirmation.
- **Must show:** who calls whom, in order, with endpoints and the event that confirms the final result.
- **Pair with:** numbered steps in the text that match the diagram numbers.
- **Avoid:** mixing the happy path with every error branch; internal provider hops the developer cannot observe.
- **Type:** Mermaid sequence diagram.

### 3. Integration architecture
- **Use for:** "How the integration works" and overview pages.
- **Must show:** the developer's systems vs. the client's platform vs. third parties, and which data crosses each boundary (card data, tokens, webhooks).
- **Avoid:** the client's internal microservices; logos used as decoration.
- **Type:** diagram-design architecture or data-flow.

### 4. Decision flow
- **Use for:** choosing an integration path, product, or error-handling strategy.
- **Must show:** yes/no questions the reader can answer, and outcomes that link to the right guide.
- **Avoid:** more than three levels of questions; outcomes without links.
- **Type:** Mermaid flowchart with `click` links.

### 5. Step flow
- **Use for:** getting started, go-live checklists, onboarding.
- **Must show:** 3–7 ordered steps that match the page headings, with links to details.
- **Type:** StepFlow (React) or a numbered list. A diagram is optional here: if the page already has clear numbered headings, a StepFlow at the top acts as a map.

### 6. Multi-actor process (swimlane)
- **Use for:** disputes, settlement, onboarding reviews: processes where several parties act over days.
- **Must show:** each actor's lane, handoffs, and deadlines.
- **Type:** diagram-design swimlane.

### 7. Concept illustration
- **Use for:** explaining an abstract idea (tokenization, split payments, ledger balances) on overview pages.
- **Type:** Figma, in the client's illustration style if they have one; otherwise a clean diagram-design figure.

### 8. Annotated UI
- **Use for:** dashboard steps (create API keys, configure webhooks).
- **Must show:** the relevant part of the screen only, with numbered markers matching the steps.
- **Type:** Figma frame over a screenshot. Re-check screenshots when the client's UI changes; list them in `diagrams/sources/figma-links.md`.

## Writing rules around a diagram

1. **Introduce it.** One sentence before the diagram says what it shows and why it matters: "The following diagram shows how a payment moves between statuses."
2. **Never make the diagram the only source.** Everything a reader needs must also be in the text or a table. Diagrams are not indexed by search and are hard for screen readers.
3. **Same names everywhere.** Labels in the diagram match the API reference, the headings, and the code samples exactly, including case.
4. **Numbers match prose.** If the text says "in step 3", the diagram shows a 3 in the same place.
5. **Color is never the only signal.** Every colored element also has a text label (WCAG 1.4.1). Status colors mean the same thing across the whole portal.
6. **Caption when it helps.** Use a caption for figures referenced from elsewhere or that need a source note.
7. **Alt text.** Short alt text says what the diagram is and its main takeaway. For complex diagrams, the surrounding text or table is the long description.
8. **One idea per diagram.** Split when you need more than about 12 nodes, or when a reader would need to zoom.
9. **Happy path first.** Show the main flow; cover errors in a separate diagram or table.
10. **Placement.** Put the diagram where the reader needs the mental model: at the top of concept pages, before the steps in guides, next to the status table in references.

## External references

- Stripe, PaymentIntent lifecycle: https://docs.stripe.com/payments/paymentintents/lifecycle (lifecycle pattern)
- Google developer documentation style guide, images and figures: https://developers.google.com/style/images
- W3C WAI, complex images (long descriptions for diagrams): https://www.w3.org/WAI/tutorials/images/complex/
- WCAG 1.4.1 Use of color: https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html
- WCAG 1.4.11 Non-text contrast (lines and borders, 3:1): https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html
- Mermaid theming (base theme and theme variables): https://mermaid.js.org/config/theming.html
- diagram-design (editorial diagrams, client profiles): https://github.com/cathrynlavery/diagram-design
- Figma, Claude skills for design (Figma MCP, design system skills): https://www.figma.com/resource-library/claude-skills-for-design/

When the client's own competitors or partners have strong docs (for payments: Stripe, Adyen, Checkout.com), review how they diagram the same concept before designing ours. Borrow the pattern, never the visuals.
