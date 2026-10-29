// The whole picture in three boxes: your app asks, the wallet decides, the services do the rest.
// Readable on its own: no package names here, those are in the layers diagram further down.
// Edit the text below; the layout does not need to change.
// Source: Darren's architecture video (2026-10-16) and the ts-stack Stack Layers page.

const services = ['Broadcast', 'Block headers', 'Message box', 'Overlays', 'File storage'];

const css = `
.sov { container-type: inline-size; margin: 24px 0; display: grid; grid-template-columns: minmax(0, 1fr) 76px minmax(0, 1fr) 76px minmax(0, 1fr); align-items: stretch; gap: 8px; color: var(--wd-text); }
.sov-box { display: flex; flex-direction: column; gap: 8px; padding: 18px; border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-surface); }
.sov-wallet { border-color: var(--wd-primary); border-width: 2px; }
.sov-who { font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--wd-text-muted); }
.sov-title { font-size: 16px; font-weight: 700; margin: 0; }
.sov-text { font-size: 13.5px; line-height: 1.5; margin: 0; }
.sov-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 2px; }
.sov-chip { font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 999px; border: 1px solid var(--wd-primary); color: var(--wd-primary); }
.sov-link { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; text-align: center; color: var(--wd-primary); }
.sov-verb { font-size: 11.5px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
.sov-arrow { font-size: 22px; line-height: 1; }
@container (max-width: 700px) {
  .sov { grid-template-columns: 1fr; gap: 6px; }
  .sov-link { flex-direction: row; gap: 8px; padding: 2px 0; }
  .sov-arrow { transform: rotate(90deg); }
}
`;

export default function StackOverview() {
  return (
    <div className="sov" role="group" aria-label="Your app asks the wallet through BRC-100, and the wallet uses the services: broadcast, block headers, message box, overlays and file storage">
      <style>{css}</style>

      <div className="sov-box">
        <span className="sov-who">1</span>
        <p className="sov-title">Your app</p>
        <p className="sov-text">Asks for what it wants done, such as a payment. It never holds a key.</p>
      </div>

      <div className="sov-link" aria-hidden="true">
        <span className="sov-verb">asks</span>
        <span className="sov-arrow">→</span>
        <span className="sov-verb">BRC-100</span>
      </div>

      <div className="sov-box sov-wallet">
        <span className="sov-who">2</span>
        <p className="sov-title">The wallet</p>
        <p className="sov-text">Holds the keys and decides whether and how to do it. BSV Desktop and BSV Browser are wallets.</p>
      </div>

      <div className="sov-link" aria-hidden="true">
        <span className="sov-verb">uses</span>
        <span className="sov-arrow">→</span>
      </div>

      <div className="sov-box">
        <span className="sov-who">3</span>
        <p className="sov-title">Services</p>
        <p className="sov-text">Each does one job, as the table below explains.</p>
        <div className="sov-chips">
          {services.map((s) => (
            <span className="sov-chip" key={s}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
