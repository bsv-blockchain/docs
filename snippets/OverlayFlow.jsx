// The overlay flow as two clear phases, Send and Look up. Each phase is one row:
// your app on the left, the overlay host on the right, an arrow between them.
// The host box carries the name it uses in that phase (tm_ topic, ls_ lookup service).
// Readable on its own: a reader sees two steps, a developer sees the topic and the lookup service.
// Edit the text below; the layout does not need to change.
// Source: the guide "Track with overlays" and @bsv/sdk (TopicBroadcaster and LookupResolver).

const phases = [
  {
    label: 'Send',
    app: 'Builds a transaction with your wallet and sends it to the topic.',
    tag: 'tm_ topic',
    host: 'Admits the output to the topic and keeps it, so it can be found later.',
  },
  {
    label: 'Look up',
    app: 'Asks the lookup service for the outputs it stored.',
    tag: 'ls_ lookup service',
    host: 'Returns the output, and your app reads the data back.',
  },
];

const css = `
.ofl { container-type: inline-size; margin: 24px 0; display: flex; flex-direction: column; gap: 12px; }
.ofl-row { display: grid; grid-template-columns: 78px minmax(0, 1fr) 44px minmax(0, 1.15fr); align-items: stretch; gap: 10px; }
.ofl-phase { display: flex; align-items: center; justify-content: center; text-align: center; padding: 8px 6px; border-radius: 12px; background: var(--wd-primary); color: var(--wd-background); font-size: 12px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
.ofl-card { display: flex; flex-direction: column; gap: 6px; justify-content: center; min-height: 84px; padding: 16px; border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-surface); color: var(--wd-text); }
.ofl-host { border-color: var(--wd-primary); border-width: 2px; }
.ofl-head { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.ofl-who { font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--wd-text-muted); }
.ofl-tag { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px; font-weight: 700; padding: 2px 8px; border-radius: 6px; background: var(--wd-primary); color: var(--wd-background); }
.ofl-text { font-size: 13.5px; line-height: 1.5; margin: 0; color: var(--wd-text); }
.ofl-arrow { display: flex; align-items: center; justify-content: center; font-size: 20px; color: var(--wd-primary); }
@container (max-width: 620px) {
  .ofl-row { grid-template-columns: 1fr; gap: 8px; }
  .ofl-phase { justify-content: flex-start; }
  .ofl-arrow { transform: rotate(90deg); }
}
`;

export default function OverlayFlow() {
  return (
    <div className="ofl" role="group" aria-label="Your app sends a transaction to an overlay topic and reads it back through the lookup service">
      <style>{css}</style>
      {phases.map((p) => (
        <div className="ofl-row" key={p.label}>
          <div className="ofl-phase">{p.label}</div>
          <div className="ofl-card ofl-app">
            <span className="ofl-who">Your app</span>
            <p className="ofl-text">{p.app}</p>
          </div>
          <div className="ofl-arrow" aria-hidden="true">→</div>
          <div className="ofl-card ofl-host">
            <div className="ofl-head">
              <span className="ofl-who">Overlay host</span>
              <span className="ofl-tag">{p.tag}</span>
            </div>
            <p className="ofl-text">{p.host}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
