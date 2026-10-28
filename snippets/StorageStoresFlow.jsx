// Wrap a code name in ` ` to show it in monospace.
// A simple picture of how WalletStorageManager uses its stores: two rows, Use and Back up, three nodes each. Edit the text below, the layout does not need to change.
// Source: the guide "Plug in your own storage" (@bsv/wallet-toolbox WalletStorageManager, updateBackups and setActive).

import { Fragment } from 'react';

const rows = [
  {
    label: 'Use',
    nodes: [
      { who: 'Wallet', text: 'Runs a BRC-100 method such as `createAction` or `listOutputs`' },
      { who: 'WalletStorageManager', text: 'Sends every read and write to the active store' },
      { who: 'Active store', text: 'Holds the records the wallet works on', end: true },
    ],
  },
  {
    label: 'Back up',
    nodes: [
      { who: 'Active store', text: 'Holds the current state of the wallet' },
      { who: 'WalletStorageManager', text: 'Copies the changes with `updateBackups` or `setActive`' },
      { who: 'Backup stores', text: 'Hold a copy, on the same machine or on your own server', end: true },
    ],
  },
];

const mono = (t) => t.split(/`(.+?)`/).map((part, i) => (i % 2 ? <span key={i} className="font-mono">{part}</span> : part));

const css = `
.ssf { container-type: inline-size; margin: 24px 0; display: flex; flex-direction: column; gap: 14px; }
.ssf-row { display: grid; grid-template-columns: 72px 1fr; align-items: stretch; gap: 12px; }
.ssf-label { display: flex; align-items: center; justify-content: center; text-align: center; border-radius: 10px; background: var(--wd-primary); color: var(--wd-background); font-size: 13px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
.ssf-nodes { display: flex; align-items: stretch; gap: 8px; list-style: none; margin: 0; padding: 0; }
.ssf-node { flex: 1 1 0; min-width: 0; padding: 12px; border: 1px solid var(--wd-border); border-radius: 10px; background: var(--wd-surface); color: var(--wd-text); }
.ssf-node.ssf-end { border: 2px solid var(--wd-primary); }
.ssf-who { font-size: 15px; font-weight: 600; line-height: 1.2; margin-bottom: 4px; overflow-wrap: anywhere; }
.ssf-text { font-size: 13px; line-height: 1.45; margin: 0; color: var(--wd-text-muted); }
.ssf-arrow { flex: none; align-self: center; font-size: 18px; color: var(--wd-text-muted); }
@container (max-width: 640px) {
  .ssf-row { grid-template-columns: 1fr; gap: 8px; }
  .ssf-label { padding: 6px 0; }
  .ssf-nodes { flex-direction: column; }
  .ssf-arrow { transform: rotate(90deg); }
}
`;

export default function StorageStoresFlow() {
  return (
    <div className="ssf" role="group" aria-label="How WalletStorageManager uses the active store and copies it to backup stores">
      <style>{css}</style>
      {rows.map((r) => (
        <div className="ssf-row" key={r.label}>
          <div className="ssf-label">{r.label}</div>
          <ol className="ssf-nodes">
            {r.nodes.map((n, i) => (
              <Fragment key={n.who + n.text}>
                <li className={n.end ? 'ssf-node ssf-end' : 'ssf-node'}>
                  <div className="ssf-who">{n.who}</div>
                  <p className="ssf-text">{mono(n.text)}</p>
                </li>
                {i < r.nodes.length - 1 ? <li className="ssf-arrow" aria-hidden="true">→</li> : null}
              </Fragment>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
