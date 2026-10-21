// How a digital product passport is written, claimed about and checked, as three rows.
// Each row is one party on the left, an arrow, and what it works with on the right.
// Readable on its own: a reader sees who does what, a developer sees the rails and the evidence.
// Edit the text below; the layout does not need to change.
// Source: the DPP docs "The passport model" (dpp.bsvb.net/docs/readme/architecture).

const rows = [
  {
    label: 'Passport rail',
    who: 'Writer',
    text: 'Signs each state with a wallet. A new state spends the one before it.',
    tag: 'Index',
    host: 'Admits the state and finds it again by the passport identifier.',
  },
  {
    label: 'Claim rail',
    who: 'Issuer',
    text: 'Signs a claim about the product, such as a repair, away from the chain.',
    tag: 'Registry and anchor',
    host: "Keeps the claim, and an anchor transaction commits to the claim's exact bytes.",
  },
  {
    label: 'Check',
    who: 'Reader',
    text: 'Gets the states and the claims, then checks signatures, links and proofs itself.',
    tag: 'Block headers',
    host: 'A source the reader chooses. Nothing is believed because a service said so.',
  },
];

const css = `
.dpf { container-type: inline-size; margin: 24px 0; display: flex; flex-direction: column; gap: 12px; }
.dpf-row { display: grid; grid-template-columns: 96px minmax(0, 1fr) 44px minmax(0, 1.15fr); align-items: stretch; gap: 10px; }
.dpf-phase { display: flex; align-items: center; justify-content: center; text-align: center; padding: 8px 6px; border-radius: 12px; background: var(--wd-primary); color: var(--wd-background); font-size: 12px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
.dpf-card { display: flex; flex-direction: column; gap: 6px; justify-content: center; min-height: 84px; padding: 16px; border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-surface); color: var(--wd-text); }
.dpf-host { border-color: var(--wd-primary); border-width: 2px; }
.dpf-head { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.dpf-who { font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--wd-text-muted); }
.dpf-tag { font-size: 11.5px; font-weight: 700; padding: 2px 8px; border-radius: 6px; background: var(--wd-primary); color: var(--wd-background); }
.dpf-text { font-size: 13.5px; line-height: 1.5; margin: 0; color: var(--wd-text); }
.dpf-arrow { display: flex; align-items: center; justify-content: center; font-size: 20px; color: var(--wd-primary); }
@container (max-width: 620px) {
  .dpf-row { grid-template-columns: 1fr; gap: 8px; }
  .dpf-phase { justify-content: flex-start; }
  .dpf-arrow { transform: rotate(90deg); }
}
`;

export default function DppFlow() {
  return (
    <div className="dpf" role="group" aria-label="A writer adds states to the passport rail, an issuer adds claims to the claim rail, and a reader checks both against block headers">
      <style>{css}</style>
      {rows.map((r) => (
        <div className="dpf-row" key={r.label}>
          <div className="dpf-phase">{r.label}</div>
          <div className="dpf-card">
            <span className="dpf-who">{r.who}</span>
            <p className="dpf-text">{r.text}</p>
          </div>
          <div className="dpf-arrow" aria-hidden="true">→</div>
          <div className="dpf-card dpf-host">
            <div className="dpf-head">
              <span className="dpf-tag">{r.tag}</span>
            </div>
            <p className="dpf-text">{r.host}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
