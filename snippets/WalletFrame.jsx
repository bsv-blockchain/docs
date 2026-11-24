// The frame the wallet interface visuals sit in: an optional quiet top line (what to do with it), a drafting grid for the
// diagram, and a footer for the status line and the controls. It also defines the colors the visuals share, so the set reads as one family.
// Content only: the visuals pass their texts in, nothing here is page copy.

const css = `
.wlx { --wlx-app: var(--wd-primary, #2563eb); --wlx-wallet: #0e7490; --wlx-key: #c2410c; --wlx-ok: #15803d; --wlx-bad: #b91c1c; --wlx-ink: var(--wd-text, #18181b); --wlx-mute: var(--wd-text-muted, #52525b); --wlx-line: var(--wd-border, #d4d4d8); --wlx-paper: var(--wd-background, #fff); --wlx-well: var(--wd-surface, #fafafa); container-type: inline-size; margin: 32px 0; border: 1px solid var(--wlx-line); border-radius: 14px; overflow: hidden; color: var(--wlx-ink); background: var(--wlx-paper); box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 18px 40px -30px rgba(0, 0, 0, 0.4); }
.wlx * { box-sizing: border-box; }
[data-theme="dark"] .wlx { --wlx-wallet: #22d3ee; --wlx-key: #fb923c; --wlx-ok: #4ade80; --wlx-bad: #f87171; }
.wlx-bar { display: flex; align-items: center; gap: 12px; padding: 10px 20px; border-bottom: 1px solid var(--wlx-line); background: var(--wlx-paper); }
.wlx-tag { padding: 3px 9px; border-radius: 6px; background: color-mix(in srgb, var(--wlx-app) 12%, var(--wlx-paper)); color: var(--wlx-app); font-size: 10.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
.wlx-hint { font-size: 12.5px; color: var(--wlx-mute); }
.wlx-stage { position: relative; padding: 26px 24px; background-color: var(--wlx-paper); background-image: radial-gradient(color-mix(in srgb, var(--wlx-mute) 22%, transparent) 1px, transparent 1.2px); background-size: 22px 22px; background-position: 11px 11px; }
.wlx-foot { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 20px; padding: 16px 20px; border-top: 1px solid var(--wlx-line); background: var(--wlx-paper); }
.wlx-status { flex: 1 1 280px; margin: 0; padding-left: 12px; border-left: 3px solid var(--wlx-app); font-size: 14px; line-height: 1.55; color: var(--wlx-ink); }
.wlx-controls { display: flex; flex-wrap: wrap; gap: 8px; }
.wlx-btn { padding: 8px 16px; border: 1px solid var(--wlx-line); border-radius: 8px; background: var(--wlx-paper); color: var(--wlx-ink); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; transition: border-color 0.2s, background 0.2s, opacity 0.2s, transform 0.2s; }
.wlx-btn:hover:not(:disabled) { border-color: var(--wlx-app); transform: translateY(-1px); }
.wlx-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.wlx-btn[data-primary="true"] { border-color: var(--wlx-app); background: var(--wlx-app); color: var(--wlx-paper); }
.wlx-btn:focus-visible { outline: 2px solid var(--wlx-app); outline-offset: 2px; }
.wlx-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 18px; }
.wlx-chip { padding: 7px 12px; border: 1px solid var(--wlx-line); border-radius: 8px; background: var(--wlx-paper); color: var(--wlx-mute); font: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; transition: border-color 0.2s, background 0.2s, color 0.2s, box-shadow 0.2s; }
.wlx-chip[data-mono="true"] { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; }
.wlx-chip:hover { border-color: var(--wlx-app); color: var(--wlx-ink); }
.wlx-chip[aria-pressed="true"] { border-color: var(--wlx-app); background: color-mix(in srgb, var(--wlx-app) 10%, var(--wlx-paper)); color: var(--wlx-app); box-shadow: inset 0 -2px 0 var(--wlx-app); }
.wlx-chip:focus-visible { outline: 2px solid var(--wlx-app); outline-offset: 2px; }
.wlx-wrap { overflow-x: auto; }
.wlx-svg { display: block; width: 100%; height: auto; }
.wlx-sr { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@container (max-width: 520px) { .wlx-stage { padding: 18px 14px; } .wlx-bar, .wlx-foot { padding-left: 14px; padding-right: 14px; } }
@media (prefers-reduced-motion: reduce) { .wlx-btn, .wlx-chip { transition: none; } .wlx-btn:hover:not(:disabled) { transform: none; } }
`;

export default function WalletFrame({ hint, label, status, controls, live, children }) {
  return (
    <div className="wlx" role="group" aria-label={label}>
      <style>{css}</style>
      {hint && (
        <div className="wlx-bar">
          <span className="wlx-tag">Try it</span>
          <span className="wlx-hint">{hint}</span>
        </div>
      )}
      <div className="wlx-stage">{children}</div>
      {(status || controls) && (
        <div className="wlx-foot">
          {status && <p className="wlx-status">{status}</p>}
          {controls && <div className="wlx-controls">{controls}</div>}
        </div>
      )}
      {live && <p className="wlx-sr" aria-live="polite">{live}</p>}
    </div>
  );
}
