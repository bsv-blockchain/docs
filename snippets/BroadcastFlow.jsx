// How a transaction goes through Arcade, as three numbered steps: Submit, Follow, Prove.
// Each step is one card: the call or field on top, then your app and what Arcade does side by side.
// Readable on its own: a reader sees the three steps, a developer sees the endpoints.
// Edit the text below; the layout does not need to change.
// Source: the BSV Skills Center page "Arcade" (docs.bsvblockchain.org/broadcasting/arcade) and a test against the public endpoints.

const steps = [
  {
    label: 'Submit',
    tag: 'POST /tx',
    app: 'Sends the signed transaction as hex or bytes.',
    host: 'Checks the fee and the scripts, then answers 202 and delivers it to Teranode.',
  },
  {
    label: 'Follow',
    tag: 'GET /tx/TXID',
    app: 'Asks for the status, or listens for events or a webhook.',
    host: 'Reports each step, from RECEIVED to MINED.',
  },
  {
    label: 'Prove',
    tag: 'merklePath',
    app: 'Keeps the merkle path from the MINED answer.',
    host: 'Returns the proof once the transaction is in a block, so you can verify it with block headers.',
  },
];

const css = `
.bfl { container-type: inline-size; margin: 28px 0; padding: 0; list-style: none; display: flex; flex-direction: column; color: var(--wd-text); }
.bfl-step { position: relative; display: grid; grid-template-columns: 36px minmax(0, 1fr); column-gap: 16px; padding-bottom: 20px; margin: 0; }
.bfl-step:last-child { padding-bottom: 0; }
.bfl-step:not(:last-child)::before { content: ''; position: absolute; left: 17px; top: 36px; bottom: 0; width: 2px; background: var(--wd-border); }
.bfl-num { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid var(--wd-primary); background: var(--wd-background); color: var(--wd-primary); font-size: 14px; font-weight: 600; }
.bfl-card { border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-surface); overflow: hidden; }
.bfl-top { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; padding: 12px 18px; border-bottom: 1px solid var(--wd-border); }
.bfl-label { font-size: 15px; font-weight: 600; margin: 0; color: var(--wd-text); }
.bfl-tag { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; padding: 2px 10px; border-radius: 999px; border: 1px solid var(--wd-primary); color: var(--wd-primary); }
.bfl-body { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; padding: 12px; }
.bfl-side { display: flex; flex-direction: column; gap: 4px; padding: 13px 16px; border: 1px solid var(--wd-border); border-radius: 10px; background: var(--wd-background); }
.bfl-side + .bfl-side { border: 2px solid var(--wd-primary); padding: 12px 15px; }
.bfl-who { font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--wd-text-muted); }
.bfl-text { font-size: 13.5px; line-height: 1.55; margin: 0; color: var(--wd-text); }
@container (max-width: 560px) {
  .bfl-step { grid-template-columns: 30px minmax(0, 1fr); column-gap: 12px; }
  .bfl-num { width: 30px; height: 30px; font-size: 13px; }
  .bfl-step:not(:last-child)::before { left: 14px; top: 30px; }
  .bfl-body { grid-template-columns: 1fr; }
}
`;

export default function BroadcastFlow() {
  return (
    <ol className="bfl" aria-label="Your app submits a signed transaction to Arcade, follows its status and keeps the merkle path">
      <style>{css}</style>
      {steps.map((s, i) => (
        <li className="bfl-step" key={s.label}>
          <span className="bfl-num" aria-hidden="true">{i + 1}</span>
          <div className="bfl-card">
            <div className="bfl-top">
              <p className="bfl-label">{s.label}</p>
              <span className="bfl-tag">{s.tag}</span>
            </div>
            <div className="bfl-body">
              <div className="bfl-side">
                <span className="bfl-who">Your app</span>
                <p className="bfl-text">{s.app}</p>
              </div>
              <div className="bfl-side">
                <span className="bfl-who">Arcade</span>
                <p className="bfl-text">{s.host}</p>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
