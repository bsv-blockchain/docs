// The overlay loop: your app sends a transaction to a topic, the host admits and indexes it,
// and later your app reads it back through the lookup service. Two squares (app and host)
// joined by two arrows (Send, Look up), with the topic and the lookup service shown inside the host.
// Edit the text below; the layout does not need to change.
// Wrap a term in ** ** to show it in bold.
// Source: the guide "Track with overlays" and @bsv/sdk (TopicBroadcaster and LookupResolver).

const app = {
  who: 'Your app',
  text: 'Builds the transaction with **your wallet** and broadcasts it to the topic.',
};

const host = {
  who: 'Overlay host',
  chips: [
    { name: 'tm_', role: 'Topic', text: 'Admits and indexes the outputs your app sends.' },
    { name: 'ls_', role: 'Lookup service', text: 'Answers the queries your app makes.' },
  ],
  note: 'One host runs the topic and its lookup service together.',
};

const arrows = [
  { label: 'Send', glyph: '→', cls: 'ofl-send' },
  { label: 'Look up', glyph: '←', cls: 'ofl-look' },
];

const bold = (t) => t.split(/\*\*(.+?)\*\*/).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));

const css = `
.ofl { container-type: inline-size; margin: 24px 0; }
.ofl-grid { display: grid; grid-template-columns: 1fr minmax(88px, 128px) 1.5fr; grid-template-rows: 1fr 1fr; gap: 10px; align-items: stretch; }
.ofl-card { display: flex; flex-direction: column; gap: 8px; padding: 16px; border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-surface); color: var(--wd-text); }
.ofl-app { grid-column: 1; grid-row: 1 / 3; }
.ofl-host { grid-column: 3; grid-row: 1 / 3; border-color: var(--wd-primary); border-width: 2px; }
.ofl-who { font-size: 12px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--wd-text); }
.ofl-text { font-size: 13px; line-height: 1.45; margin: 0; color: var(--wd-text-muted); }
.ofl-text strong { color: var(--wd-text); font-weight: 600; }
.ofl-chips { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.ofl-chip { display: flex; flex-direction: column; gap: 4px; padding: 10px; border: 1px solid var(--wd-border); border-radius: 10px; background: var(--wd-background); }
.ofl-tag { align-self: flex-start; font-size: 12px; font-weight: 700; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; padding: 2px 7px; border-radius: 6px; background: var(--wd-primary); color: var(--wd-background); }
.ofl-role { font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--wd-text-muted); }
.ofl-note { font-size: 12.5px; line-height: 1.45; margin: 0; color: var(--wd-text-muted); }
.ofl-arrow { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; text-align: center; }
.ofl-send { grid-column: 2; grid-row: 1; }
.ofl-look { grid-column: 2; grid-row: 2; }
.ofl-glyph { font-size: 22px; line-height: 1; color: var(--wd-primary); }
.ofl-label { font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--wd-text-muted); }
@container (max-width: 640px) {
  .ofl-grid { grid-template-columns: 1fr; grid-template-rows: auto; }
  .ofl-app, .ofl-host, .ofl-arrow { grid-column: 1; grid-row: auto; }
  .ofl-glyph { transform: rotate(90deg); }
  .ofl-chips { grid-template-columns: 1fr; }
}
`;

export default function OverlayFlow() {
  return (
    <div className="ofl" role="group" aria-label="Your app sends a transaction to an overlay topic and reads it back through the lookup service">
      <style>{css}</style>
      <div className="ofl-grid">
        <div className="ofl-card ofl-app">
          <span className="ofl-who">{app.who}</span>
          <p className="ofl-text">{bold(app.text)}</p>
        </div>
        {arrows.map((a) => (
          <div className={`ofl-arrow ${a.cls}`} key={a.label}>
            <span className="ofl-glyph" aria-hidden="true">{a.glyph}</span>
            <span className="ofl-label">{a.label}</span>
          </div>
        ))}
        <div className="ofl-card ofl-host">
          <span className="ofl-who">{host.who}</span>
          <div className="ofl-chips">
            {host.chips.map((c) => (
              <div className="ofl-chip" key={c.name}>
                <span className="ofl-tag">{c.name}</span>
                <span className="ofl-role">{c.role}</span>
                <p className="ofl-note">{bold(c.text)}</p>
              </div>
            ))}
          </div>
          <p className="ofl-note">{host.note}</p>
        </div>
      </div>
    </div>
  );
}
