// The packages of the TypeScript stack as three layers, from the top down: application, wallet, foundation.
// Readable on its own: each box is one layer with its package. The line between the top two is the BRC-100 interface.
// Edit the text below; the layout does not need to change.
// Source: ts-stack Stack Layers page, package names and peer dependencies checked against the published packages (study how-the-stack-fits).

const layers = [
  { layer: 'Application layer', tag: '@bsv/simple', text: 'Your app calls this package, and it makes the wallet calls for you.', link: { label: 'BRC-100', note: 'the wallet interface' } },
  { layer: 'Wallet layer', tag: '@bsv/wallet-toolbox', text: 'Needed only if you build a wallet: storage, signing and the services a wallet uses.', link: { label: 'builds on', note: '' } },
  { layer: 'Foundation', tag: '@bsv/sdk', text: 'Keys, Script, transactions and proofs. Both layers above use it.' },
];

const css = `
.skl { container-type: inline-size; margin: 24px 0; display: flex; flex-direction: column; gap: 6px; color: var(--wd-text); }
.skl-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr); align-items: center; gap: 14px; padding: 16px 18px; border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-surface); }
.skl-mid { border-color: var(--wd-primary); border-width: 2px; }
.skl-left { display: flex; flex-direction: column; gap: 6px; align-items: flex-start; }
.skl-layer { font-size: 15px; font-weight: 700; }
.skl-tag { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 6px; background: var(--wd-primary); color: var(--wd-background); overflow-wrap: anywhere; }
.skl-text { font-size: 13.5px; line-height: 1.5; margin: 0; }
.skl-line { display: flex; align-items: center; gap: 10px; padding: 2px 0; }
.skl-rule { flex: 1; height: 0; border-top: 2px dashed var(--wd-primary); }
.skl-pill { font-size: 11.5px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; padding: 4px 12px; border-radius: 999px; background: var(--wd-primary); color: var(--wd-background); white-space: nowrap; }
.skl-note { font-size: 12px; color: var(--wd-text-muted); white-space: nowrap; }
.skl-soft .skl-pill { background: transparent; color: var(--wd-text-muted); border: 1px solid var(--wd-border); }
.skl-soft .skl-rule { border-top: 1px solid var(--wd-border); }
@container (max-width: 520px) { .skl-row { grid-template-columns: 1fr; gap: 8px; } .skl-note { white-space: normal; } }
`;

export default function StackLayers() {
  return (
    <div className="skl" role="group" aria-label="Three layers from the top down: the application layer with @bsv/simple, the wallet layer with @bsv/wallet-toolbox, and the foundation with @bsv/sdk. The BRC-100 wallet interface sits between the application and wallet layers.">
      <style>{css}</style>
      {layers.map((l, i) => (
        <div key={l.tag} style={{ display: 'contents' }}>
          <div className={'skl-row' + (i === 1 ? ' skl-mid' : '')}>
            <div className="skl-left">
              <span className="skl-layer">{l.layer}</span>
              <span className="skl-tag">{l.tag}</span>
            </div>
            <p className="skl-text">{l.text}</p>
          </div>
          {l.link && (
            <div className={'skl-line' + (i === 1 ? ' skl-soft' : '')} aria-hidden="true">
              <span className="skl-rule" />
              <span className="skl-pill">{l.link.label}</span>
              {l.link.note && <span className="skl-note">{l.link.note}</span>}
              <span className="skl-rule" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
