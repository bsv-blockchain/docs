/**
 * StepFlow — ordered process for guides (integration steps, go-live checklist, onboarding).
 * Kit file (diagram kit 1.0.0). Static, no hooks: safe for server rendering on every platform.
 *
 * Usage (MDX):
 *   <StepFlow
 *     title="Go live with card payments"
 *     steps={[
 *       { title: "Create sandbox credentials", description: "Generate API keys in the dashboard.", href: "/get-started/credentials" },
 *       { title: "Create a payment", description: "Call the payments endpoint.", api: "POST /v1/payments" },
 *       { title: "Handle webhooks", description: "Confirm the final status.", status: "success" }
 *     ]}
 *   />
 *
 * Props
 *   title        optional caption
 *   steps        array of { title, description?, href?, api?, status? }
 *   direction    "vertical" (default) | "horizontal" (falls back to vertical on narrow screens)
 */
export const StepFlow = ({ title, steps = [], direction = "vertical" }) => (
  <figure className="dgsf" data-direction={direction}>
    {title ? <figcaption className="dgsf-title">{title}</figcaption> : null}
    <ol className="dgsf-list">
      {steps.map((s, i) => (
        <li key={i} className="dgsf-step" data-status={s.status || undefined}>
          <span className="dgsf-num" aria-hidden="true">{i + 1}</span>
          <div className="dgsf-body">
            <p className="dgsf-step-title">
              {s.href ? <a href={s.href}>{s.title}</a> : s.title}
            </p>
            {s.api ? <code className="dgsf-api">{s.api}</code> : null}
            {s.description ? <p className="dgsf-desc">{s.description}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  </figure>
);

export default StepFlow;
