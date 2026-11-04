// "At a glance" panel for a protocol reference page: a row of facts, each one a button that opens its detail below.
// Props: `title` (the protocol name), `badge` (short label next to it), `items` (label, value, detail and optional links [{ label, href }]).
// The facts stay readable without a click: the first one opens by default, and the pages keep the same rows in a Markdown table for agents.
// Wrap a term in ** ** in `detail` to show it in bold.

const bold = (t) => t.split(/\*\*(.+?)\*\*/).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));

const css = `
.pg { container-type: inline-size; margin: 24px 0; border: 1px solid var(--wd-border); border-radius: 16px; background: var(--wd-surface); color: var(--wd-text); overflow: hidden; }
.pg-head { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; padding: 14px 18px; background: var(--wd-primary); color: var(--wd-background); }
.pg-title { font-size: 15px; font-weight: 700; letter-spacing: 0.01em; }
.pg-badge { font-size: 10.5px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; padding: 2px 9px; border-radius: 999px; border: 1px solid currentColor; opacity: 0.9; }
.pg-tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; padding: 14px 14px 10px; margin: 0; list-style: none; }
.pg-tile { all: unset; box-sizing: border-box; display: flex; flex-direction: column; gap: 4px; width: 100%; height: 100%; padding: 11px 13px; border: 1px solid var(--wd-border); border-radius: 12px; cursor: pointer; transition: border-color 0.15s, background 0.15s, transform 0.15s; }
.pg-tile:hover { border-color: var(--wd-primary); transform: translateY(-1px); }
.pg-tile:focus-visible { outline: 2px solid var(--wd-primary); outline-offset: 2px; }
.pg-tile[aria-pressed="true"] { border-color: var(--wd-primary); background: color-mix(in srgb, var(--wd-primary) 10%, transparent); box-shadow: inset 0 -3px 0 var(--wd-primary); }
.pg-label { font-size: 10.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--wd-text-muted); }
.pg-value { font-size: 13.5px; font-weight: 600; line-height: 1.3; color: var(--wd-text); word-break: break-word; }
.pg-panel { margin: 0 14px 14px; padding: 12px 14px; border-left: 3px solid var(--wd-primary); border-radius: 0 10px 10px 0; background: color-mix(in srgb, var(--wd-primary) 6%, transparent); }
.pg-detail { margin: 0; font-size: 13.5px; line-height: 1.55; color: var(--wd-text-muted); }
.pg-detail strong { color: var(--wd-text); font-weight: 600; }
.pg-links { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0 0; padding: 0; list-style: none; }
.pg-link { display: inline-block; padding: 4px 11px; border: 1px solid var(--wd-primary); border-radius: 999px; font-size: 12.5px; font-weight: 600; color: var(--wd-primary); text-decoration: none; }
.pg-link:hover { background: var(--wd-primary); color: var(--wd-background); }
@media (prefers-reduced-motion: reduce) { .pg-tile { transition: none; } .pg-tile:hover { transform: none; } }
`;

export default function ProtocolGlance({ title, badge, items }) {
  const [active, setActive] = useState(0);
  const current = items[active];
  return (
    <div className="pg" role="group" aria-label={`${title} at a glance`}>
      <style>{css}</style>
      <div className="pg-head">
        <span className="pg-title">{title}</span>
        {badge ? <span className="pg-badge">{badge}</span> : null}
      </div>
      <ul className="pg-tiles">
        {items.map((it, i) => (
          <li key={it.label} style={{ margin: 0 }}>
            <button
              type="button"
              className="pg-tile"
              aria-pressed={i === active}
              aria-controls="pg-panel"
              onClick={() => setActive(i)}
            >
              <span className="pg-label">{it.label}</span>
              <span className="pg-value">{it.value}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="pg-panel" id="pg-panel" aria-live="polite">
        <p className="pg-detail">{bold(current.detail)}</p>
        {current.links && current.links.length ? (
          <ul className="pg-links">
            {current.links.map((l) => (
              <li key={l.href} style={{ margin: 0 }}>
                <a className="pg-link" href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
