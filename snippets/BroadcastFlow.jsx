// How a transaction goes through Arcade, as three rows: Submit, Follow, Prove.
// Each row is your app on the left, an arrow, and what Arcade does on the right.
// Readable on its own: a reader sees the three steps, a developer sees the endpoints.
// Edit the text below; the layout does not need to change.
// Source: the BSV Skills Center page "Arcade" (docs.bsvblockchain.org/broadcasting/arcade) and a test against the public endpoints.

const rows = [
  {
    label: 'Submit',
    app: 'Sends the signed transaction as hex or bytes.',
    tag: 'POST /tx',
    host: 'Checks the fee and the scripts, then answers 202 and delivers it to Teranode.',
  },
  {
    label: 'Follow',
    app: 'Asks for the status, or listens for events or a webhook.',
    tag: 'GET /tx/TXID',
    host: 'Reports each step, from RECEIVED to MINED.',
  },
  {
    label: 'Prove',
    app: 'Keeps the merkle path from the MINED answer.',
    tag: 'merklePath',
    host: 'Returns the proof once the transaction is in a block, so you can verify it with block headers.',
  },
];

const css = `
.bfl { container-type: inline-size; margin: 24px 0; display: flex; flex-direction: column; gap: 12px; }
.bfl-row { display: grid; grid-template-columns: 78px minmax(0, 1fr) 44px minmax(0, 1.15fr); align-items: stretch; gap: 10px; }
.bfl-phase { display: flex; align-items: center; justify-content: center; text-align: center; padding: 8px 6px; border-radius: 12px; background: var(--wd-primary); color: var(--wd-background); font-size: 12px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
.bfl-card { display: flex; flex-direction: column; gap: 6px; justify-content: center; min-height: 84px; padding: 16px; border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-surface); color: var(--wd-text); }
.bfl-host { border-color: var(--wd-primary); border-width: 2px; }
.bfl-head { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.bfl-who { font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--wd-text-muted); }
.bfl-tag { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px; font-weight: 700; padding: 2px 8px; border-radius: 6px; background: var(--wd-primary); color: var(--wd-background); }
.bfl-text { font-size: 13.5px; line-height: 1.5; margin: 0; color: var(--wd-text); }
.bfl-arrow { display: flex; align-items: center; justify-content: center; font-size: 20px; color: var(--wd-primary); }
@container (max-width: 620px) {
  .bfl-row { grid-template-columns: 1fr; gap: 8px; }
  .bfl-phase { justify-content: flex-start; }
  .bfl-arrow { transform: rotate(90deg); }
}
`;

export default function BroadcastFlow() {
  return (
    <div className="bfl" role="group" aria-label="Your app submits a signed transaction to Arcade, follows its status and keeps the merkle path">
      <style>{css}</style>
      {rows.map((r) => (
        <div className="bfl-row" key={r.label}>
          <div className="bfl-phase">{r.label}</div>
          <div className="bfl-card">
            <span className="bfl-who">Your app</span>
            <p className="bfl-text">{r.app}</p>
          </div>
          <div className="bfl-arrow" aria-hidden="true">→</div>
          <div className="bfl-card bfl-host">
            <div className="bfl-head">
              <span className="bfl-who">Arcade</span>
              <span className="bfl-tag">{r.tag}</span>
            </div>
            <p className="bfl-text">{r.host}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
