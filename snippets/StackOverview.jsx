// The BSV stack as four bands, top to bottom: your app, the wallet boundary, the wallet,
// and the services behind it, with the SDK as the foundation under all of them.
// Each service is named by what it does first, then by its product name.
// Readable on its own: a reader sees who asks and who decides, a developer sees the BRC-100 line and the packages.
// Edit the text below; the layout does not need to change.
// Source: Darren's architecture video (2026-10-16) and the ts-stack Stack Layers page.

const services = [
  { fn: 'Broadcast service', name: 'Arcade', text: 'Sends each transaction to block producing nodes and reports back with a proof.' },
  { fn: 'Block header service', name: 'Chaintracks', text: 'Gives the wallet the block headers it checks proofs against.' },
  { fn: 'Message box', name: '@bsv/message-box-client', text: 'Holds a message or payment until the recipient connects.' },
  { fn: 'Overlays', name: '@bsv/overlay', text: 'A topic manager admits outputs, a lookup service answers with proofs.' },
  { fn: 'File storage', name: 'UHRP', text: 'Addresses each public file by its hash, so any host can serve it.' },
];

const css = `
.sov { container-type: inline-size; margin: 24px 0; display: flex; flex-direction: column; gap: 10px; color: var(--wd-text); }
.sov-band { padding: 16px; border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-surface); }
.sov-label { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 6px; }
.sov-who { font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--wd-text-muted); }
.sov-tag { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px; font-weight: 700; padding: 2px 8px; border-radius: 6px; background: var(--wd-primary); color: var(--wd-background); }
.sov-text { font-size: 13.5px; line-height: 1.5; margin: 0; }
.sov-wallet { border-color: var(--wd-primary); border-width: 2px; }
.sov-line { display: flex; align-items: center; gap: 10px; padding: 0 4px; }
.sov-rule { flex: 1; height: 0; border-top: 2px dashed var(--wd-primary); }
.sov-pill { font-size: 11.5px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; padding: 6px 12px; border-radius: 999px; background: var(--wd-primary); color: var(--wd-background); text-align: center; }
.sov-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; margin-top: 10px; }
.sov-card { display: flex; flex-direction: column; gap: 6px; padding: 12px; border: 1px solid var(--wd-border); border-radius: 12px; background: var(--wd-background); }
.sov-fn { font-size: 13px; font-weight: 700; }
.sov-name { align-self: flex-start; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 6px; border: 1px solid var(--wd-primary); color: var(--wd-primary); overflow-wrap: anywhere; }
.sov-card .sov-text { font-size: 12.5px; }
.sov-sdk { border-style: dashed; text-align: center; }
@container (max-width: 760px) { .sov-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container (max-width: 460px) { .sov-grid { grid-template-columns: 1fr; } }
`;

export default function StackOverview() {
  return (
    <div className="sov" role="group" aria-label="The BSV stack: your app asks through the BRC-100 interface, the wallet decides, and the broadcast service, block header service, message box, overlays and file storage sit behind the wallet, all built on the SDK">
      <style>{css}</style>

      <div className="sov-band">
        <div className="sov-label">
          <span className="sov-who">Your app</span>
        </div>
        <p className="sov-text">Asks for what it wants done. It never holds a key.</p>
      </div>

      <div className="sov-line" aria-hidden="true">
        <span className="sov-rule" />
        <span className="sov-pill">BRC-100: the app asks, the wallet decides</span>
        <span className="sov-rule" />
      </div>

      <div className="sov-band sov-wallet">
        <div className="sov-label">
          <span className="sov-who">Wallet</span>
          <span className="sov-tag">BSV Desktop</span>
          <span className="sov-tag">BSV Browser</span>
        </div>
        <p className="sov-text">Holds the keys, signs, and stores transactions, outputs and their metadata with wallet toolbox. Any BRC-100 wallet can take its place.</p>
      </div>

      <div className="sov-band">
        <div className="sov-label">
          <span className="sov-who">Services behind the wallet</span>
        </div>
        <div className="sov-grid">
          {services.map((s) => (
            <div className="sov-card" key={s.fn}>
              <span className="sov-fn">{s.fn}</span>
              <span className="sov-name">{s.name}</span>
              <p className="sov-text">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="sov-band sov-sdk">
        <div className="sov-label" style={{ justifyContent: 'center' }}>
          <span className="sov-who">Foundation</span>
          <span className="sov-tag">@bsv/sdk</span>
        </div>
        <p className="sov-text">Keys, scripts, transactions and proofs, in TypeScript, Go, Python and Rust.</p>
      </div>
    </div>
  );
}
