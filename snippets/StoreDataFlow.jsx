// Wrap a term in ** ** to show it in bold.
// A simple picture of writing and reading data: two rows, Write and Read, three nodes each. Edit the text below, the layout does not need to change.
// Source: the guide "Store data and files" (WalletClient createAction and listOutputs).

const rows = [
  {
    label: 'Write',
    nodes: [
      { who: 'Your script', text: 'Calls **createAction** with the data' },
      { who: 'BSV Desktop', text: 'You click **Authorize** in the wallet, which signs and broadcasts' },
      { who: 'The network', text: 'Records your data in an output and sends back the txid', end: true },
    ],
  },
  {
    label: 'Read',
    nodes: [
      { who: 'Your script', text: 'Calls **listOutputs** with the basket and tags' },
      { who: 'BSV Desktop', text: 'Sends back the outputs you asked for' },
      { who: 'Your script', text: 'Reads your data back from the output', end: true },
    ],
  },
];

const bold = (t) => t.split(/\*\*(.+?)\*\*/).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));

const css = `
.sdf { container-type: inline-size; margin: 24px 0; display: flex; flex-direction: column; gap: 14px; }
.sdf-row { display: grid; grid-template-columns: 64px 1fr; align-items: stretch; gap: 12px; }
.sdf-label { display: flex; align-items: center; justify-content: center; border-radius: 10px; background: var(--wd-primary); color: var(--wd-background); font-size: 13px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
.sdf-nodes { display: flex; align-items: stretch; gap: 8px; list-style: none; margin: 0; padding: 0; }
.sdf-node { flex: 1 1 0; min-width: 0; padding: 12px; border: 1px solid var(--wd-border); border-radius: 10px; background: var(--wd-surface); color: var(--wd-text); }
.sdf-node.sdf-end { border: 2px solid var(--wd-primary); }
.sdf-who { font-size: 15px; font-weight: 600; line-height: 1.2; margin-bottom: 4px; }
.sdf-text { font-size: 13px; line-height: 1.45; margin: 0; color: var(--wd-text-muted); }
.sdf-arrow { flex: none; align-self: center; font-size: 18px; color: var(--wd-text-muted); }
@container (max-width: 640px) {
  .sdf-row { grid-template-columns: 1fr; gap: 8px; }
  .sdf-label { padding: 6px 0; }
  .sdf-nodes { flex-direction: column; }
  .sdf-arrow { transform: rotate(90deg); }
}
`;

export default function StoreDataFlow() {
  return (
    <div className="sdf" role="group" aria-label="How an app writes data with the wallet and reads it back">
      <style>{css}</style>
      {rows.map((r) => (
        <div className="sdf-row" key={r.label}>
          <div className="sdf-label">{r.label}</div>
          <ol className="sdf-nodes">
            {r.nodes.map((n, i) => (
              <>
                <li className={n.end ? 'sdf-node sdf-end' : 'sdf-node'} key={n.text}>
                  <div className="sdf-who">{n.who}</div>
                  <p className="sdf-text">{bold(n.text)}</p>
                </li>
                {i < r.nodes.length - 1 ? <li className="sdf-arrow" key={`a${i}`} aria-hidden="true">→</li> : null}
              </>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
