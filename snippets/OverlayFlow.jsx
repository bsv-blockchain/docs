// The overlay flow as two numbered steps, Send and Look up. Each step is one card:
// the name of the part it uses on top, then your app and the overlay host side by side.
// The tag carries the name the host uses in that step (tm_ topic, ls_ lookup service).
// Readable on its own: a reader sees two steps, a developer sees the topic and the lookup service.
// Edit the text below; the layout does not need to change.
// Source: the guide "Track with overlays" and @bsv/sdk (TopicBroadcaster and LookupResolver).

const steps = [
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
.ofl { container-type: inline-size; margin: 28px 0; padding: 0; list-style: none; display: flex; flex-direction: column; color: var(--wd-text); }
.ofl-step { position: relative; display: grid; grid-template-columns: 36px minmax(0, 1fr); column-gap: 16px; padding-bottom: 20px; margin: 0; }
.ofl-step:last-child { padding-bottom: 0; }
.ofl-step:not(:last-child)::before { content: ''; position: absolute; left: 17px; top: 36px; bottom: 0; width: 2px; background: var(--wd-border); }
.ofl-num { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid var(--wd-primary); background: var(--wd-background); color: var(--wd-primary); font-size: 14px; font-weight: 600; }
.ofl-card { border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-surface); overflow: hidden; }
.ofl-top { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; padding: 12px 18px; border-bottom: 1px solid var(--wd-border); }
.ofl-label { font-size: 15px; font-weight: 600; margin: 0; color: var(--wd-text); }
.ofl-tag { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; padding: 2px 10px; border-radius: 999px; border: 1px solid var(--wd-primary); color: var(--wd-primary); }
.ofl-body { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
.ofl-side { display: flex; flex-direction: column; gap: 4px; padding: 14px 18px; }
.ofl-side + .ofl-side { border-left: 1px solid var(--wd-border); }
.ofl-who { font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--wd-text-muted); }
.ofl-text { font-size: 13.5px; line-height: 1.55; margin: 0; color: var(--wd-text); }
@container (max-width: 560px) {
  .ofl-step { grid-template-columns: 30px minmax(0, 1fr); column-gap: 12px; }
  .ofl-num { width: 30px; height: 30px; font-size: 13px; }
  .ofl-step:not(:last-child)::before { left: 14px; top: 30px; }
  .ofl-body { grid-template-columns: 1fr; }
  .ofl-side + .ofl-side { border-left: 0; border-top: 1px solid var(--wd-border); }
}
`;

export default function OverlayFlow() {
  return (
    <ol className="ofl" aria-label="Your app sends a transaction to an overlay topic and reads it back through the lookup service">
      <style>{css}</style>
      {steps.map((s, i) => (
        <li className="ofl-step" key={s.label}>
          <span className="ofl-num" aria-hidden="true">{i + 1}</span>
          <div className="ofl-card">
            <div className="ofl-top">
              <p className="ofl-label">{s.label}</p>
              <span className="ofl-tag">{s.tag}</span>
            </div>
            <div className="ofl-body">
              <div className="ofl-side">
                <span className="ofl-who">Your app</span>
                <p className="ofl-text">{s.app}</p>
              </div>
              <div className="ofl-side">
                <span className="ofl-who">Overlay host</span>
                <p className="ofl-text">{s.host}</p>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
