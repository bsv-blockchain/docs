// The frame every BEEF visual sits in: an optional quiet top line (what to do with it), a drafting grid for the
// diagram, and a footer for the status line and the controls. It also defines the colors the visuals share, so the set reads as one family.
// Content only: the visuals pass their texts in, nothing here is page copy.

const css = `
.bfx { --bfx-bump: #b45309; --bfx-mined: #0f766e; --bfx-main: var(--wd-primary, #2563eb); --bfx-ok: #047857; --bfx-bad: #b91c1c; --bfx-ink: var(--wd-text, #18181b); --bfx-mute: var(--wd-text-muted, #52525b); --bfx-line: var(--wd-border, #d4d4d8); --bfx-paper: var(--wd-background, #fff); --bfx-well: var(--wd-surface, #fafafa); container-type: inline-size; margin: 32px 0; border: 1px solid var(--bfx-line); border-radius: 22px; overflow: hidden; color: var(--bfx-ink); background: var(--bfx-paper); box-shadow: 0 1px 0 rgba(0, 0, 0, 0.03), 0 30px 60px -44px rgba(0, 0, 0, 0.45); }
.bfx * { box-sizing: border-box; }
.bfx-bar { display: flex; align-items: center; gap: 10px; padding: 11px 20px; border-bottom: 1px solid var(--bfx-line); background: color-mix(in srgb, var(--bfx-main) 4%, var(--bfx-well)); }
.bfx-hint { display: inline-flex; align-items: center; gap: 10px; font-size: 12.5px; color: var(--bfx-mute); }
.bfx-hint::before { content: ""; flex: none; width: 7px; height: 7px; border-radius: 50%; background: var(--bfx-main); box-shadow: 0 0 0 4px color-mix(in srgb, var(--bfx-main) 18%, transparent); }
.bfx-stage { position: relative; padding: 26px 24px; background-color: var(--bfx-paper); background-image: radial-gradient(color-mix(in srgb, var(--bfx-mute) 22%, transparent) 1px, transparent 1.2px); background-size: 22px 22px; background-position: 11px 11px; }
.bfx-foot { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 20px; padding: 16px 20px; border-top: 1px solid var(--bfx-line); background: var(--bfx-well); }
.bfx-status { flex: 1 1 280px; margin: 0; font-size: 14px; line-height: 1.55; color: var(--bfx-ink); }
.bfx-status strong { font-weight: 650; }
.bfx-controls { display: flex; flex-wrap: wrap; gap: 8px; }
.bfx-btn { padding: 8px 18px; border: 1px solid var(--bfx-line); border-radius: 999px; background: var(--bfx-paper); color: var(--bfx-ink); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; transition: border-color 0.2s, background 0.2s, opacity 0.2s, transform 0.2s; }
.bfx-btn:hover:not(:disabled) { border-color: var(--bfx-main); transform: translateY(-1px); }
.bfx-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.bfx-btn[data-primary="true"] { border-color: var(--bfx-main); background: var(--bfx-main); color: var(--bfx-paper); }
.bfx-btn:focus-visible { outline: 2px solid var(--bfx-main); outline-offset: 2px; }
.bfx-sr { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@container (max-width: 520px) { .bfx-stage { padding: 18px 14px; } .bfx-bar, .bfx-foot { padding-left: 14px; padding-right: 14px; } }
@media (prefers-reduced-motion: reduce) { .bfx-btn { transition: none; } .bfx-btn:hover:not(:disabled) { transform: none; } }
`;

export default function BeefFrame({ hint, label, status, controls, live, children }) {
  return (
    <div className="bfx" role="group" aria-label={label}>
      <style>{css}</style>
      {hint && (
        <div className="bfx-bar">
          <span className="bfx-hint">{hint}</span>
        </div>
      )}
      <div className="bfx-stage">{children}</div>
      {(status || controls) && (
        <div className="bfx-foot">
          {status && <p className="bfx-status">{status}</p>}
          {controls && <div className="bfx-controls">{controls}</div>}
        </div>
      )}
      <p className="bfx-sr" aria-live="polite" aria-atomic="true">{live}</p>
    </div>
  );
}
