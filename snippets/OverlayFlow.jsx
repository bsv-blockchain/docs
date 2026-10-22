// The overlay flow as two phases, Send and Look up. Each phase is one row:
// your app on the left, the overlay host on the right, and a labelled arrow between them.
// The label on the arrow is the name the host uses in that phase (tm_ topic, ls_ lookup service).
// Readable on its own: a reader sees two steps, a developer sees the topic and the lookup service.
// Edit the text below; the layout does not need to change.
// Source: the guide "Track with overlays" and @bsv/sdk (TopicBroadcaster and LookupResolver).

const phases = [
  {
    label: 'Send',
    tag: 'tm_ topic',
    app: 'Builds a transaction with your wallet and sends it to the topic.',
    host: 'Admits the output to the topic and keeps it, so it can be found later.',
  },
  {
    label: 'Look up',
    tag: 'ls_ lookup service',
    app: 'Asks the lookup service for the outputs it stored.',
    host: 'Returns the output, and your app reads the data back.',
  },
];

const css = `
.ofl { container-type: inline-size; margin: 28px 0; display: flex; flex-direction: column; gap: 28px; color: var(--wd-text); }
.ofl-phase { display: flex; flex-direction: column; gap: 12px; }
.ofl-label { display: flex; align-items: center; gap: 12px; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--wd-text-muted); }
.ofl-label::after { content: ''; flex: 1; height: 1px; background: var(--wd-border); }
.ofl-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(112px, 148px) minmax(0, 1fr); align-items: center; }
.ofl-card { display: flex; flex-direction: column; gap: 6px; padding: 18px 20px; border: 1px solid var(--wd-border); border-radius: 16px; background: var(--wd-surface); }
.ofl-host { position: relative; padding-left: 24px; }
.ofl-host::before { content: ''; position: absolute; left: 0; top: 16px; bottom: 16px; width: 3px; border-radius: 0 3px 3px 0; background: var(--wd-primary); }
.ofl-who { font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--wd-text-muted); }
.ofl-text { font-size: 14px; line-height: 1.55; margin: 0; color: var(--wd-text); }
.ofl-link { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 0 10px; }
.ofl-tag { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px; text-align: center; padding: 3px 10px; border-radius: 999px; border: 1px solid var(--wd-primary); color: var(--wd-primary); }
.ofl-line { position: relative; align-self: stretch; height: 1px; background: var(--wd-primary); }
.ofl-line::after { content: ''; position: absolute; right: 0; top: -4px; border: solid var(--wd-primary); border-width: 1px 1px 0 0; width: 8px; height: 8px; transform: rotate(45deg); transform-origin: center; }
@container (max-width: 620px) {
  .ofl-row { grid-template-columns: 1fr; row-gap: 8px; }
  .ofl-link { flex-direction: row; justify-content: center; padding: 2px 0; }
  .ofl-line { align-self: center; width: 1px; height: 22px; }
  .ofl-line::after { right: auto; left: -4px; top: auto; bottom: 0; transform: rotate(135deg); }
}
`;

export default function OverlayFlow() {
  return (
    <div className="ofl" role="group" aria-label="Your app sends a transaction to an overlay topic and reads it back through the lookup service">
      <style>{css}</style>
      {phases.map((p) => (
        <div className="ofl-phase" key={p.label}>
          <div className="ofl-label">{p.label}</div>
          <div className="ofl-row">
            <div className="ofl-card">
              <span className="ofl-who">Your app</span>
              <p className="ofl-text">{p.app}</p>
            </div>
            <div className="ofl-link">
              <span className="ofl-tag">{p.tag}</span>
              <span className="ofl-line" aria-hidden="true" />
            </div>
            <div className="ofl-card ofl-host">
              <span className="ofl-who">Overlay host</span>
              <p className="ofl-text">{p.host}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
