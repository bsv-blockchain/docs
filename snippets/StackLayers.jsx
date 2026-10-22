// The packages of the TypeScript stack as three layers, with the BRC-100 line between app and wallet
// and the capabilities that connect from the side.
// Readable on its own: a reader sees which layer a package belongs to, a developer sees the package names.
// Edit the text below; the layout does not need to change.
// Source: ts-stack Stack Layers page, package names checked against the published packages (study how-the-stack-fits).

const layers = [
  { key: 'app', who: 'Application', tag: '@bsv/simple', text: 'The entry point for most app developers. It wraps the BRC-100 calls, in a browser entry point and a server entry point.' },
  { key: 'wallet', who: 'Wallet toolkit', tag: '@bsv/wallet-toolbox', text: 'For developers who build a wallet. Storage, a background monitor, signing and the services a wallet needs.' },
  { key: 'sdk', who: 'Foundation', tag: '@bsv/sdk', text: 'Cryptography, Script, transactions, BEEF and Merkle proofs. No runtime dependencies.' },
];

const side = [
  { name: 'Data overlays', pkgs: '@bsv/overlay, @bsv/overlay-express' },
  { name: 'Messaging', pkgs: '@bsv/message-box-client, @bsv/authsocket' },
  { name: 'Identity', pkgs: '@bsv/auth-express-middleware' },
  { name: 'Monetization', pkgs: '@bsv/402-pay, @bsv/payment-express-middleware' },
  { name: 'Tokens', pkgs: '@bsv/btms' },
];

const css = `
.skl { container-type: inline-size; margin: 24px 0; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 0.8fr); gap: 16px; color: var(--wd-text); }
.skl-col { display: flex; flex-direction: column; gap: 8px; }
.skl-head { font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--wd-text-muted); }
.skl-card { display: flex; flex-direction: column; gap: 6px; padding: 14px 16px; border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-surface); }
.skl-wallet { border-color: var(--wd-primary); border-width: 2px; }
.skl-top { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.skl-who { font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--wd-text-muted); }
.skl-tag { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px; font-weight: 700; padding: 2px 8px; border-radius: 6px; background: var(--wd-primary); color: var(--wd-background); overflow-wrap: anywhere; }
.skl-text { font-size: 13.5px; line-height: 1.5; margin: 0; }
.skl-line { display: flex; align-items: center; gap: 10px; }
.skl-rule { flex: 1; height: 0; border-top: 2px dashed var(--wd-primary); }
.skl-pill { font-size: 11.5px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; padding: 5px 12px; border-radius: 999px; background: var(--wd-primary); color: var(--wd-background); text-align: center; }
.skl-side { padding: 12px 14px; border: 1px dashed var(--wd-border); border-radius: 12px; background: var(--wd-background); }
.skl-name { font-size: 13px; font-weight: 700; }
.skl-pkgs { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px; color: var(--wd-text-muted); margin: 4px 0 0; overflow-wrap: anywhere; }
@container (max-width: 640px) { .skl { grid-template-columns: 1fr; } }
`;

export default function StackLayers() {
  return (
    <div className="skl" role="group" aria-label="The packages of the TypeScript stack in three layers, with @bsv/simple for the application, @bsv/wallet-toolbox for the wallet and @bsv/sdk as the foundation, and the capability packages beside them">
      <style>{css}</style>
      <div className="skl-col">
        <span className="skl-head">The three layers</span>
        {layers.map((l, i) => (
          <div key={l.key}>
            <div className={'skl-card' + (l.key === 'wallet' ? ' skl-wallet' : '')}>
              <div className="skl-top">
                <span className="skl-who">{l.who}</span>
                <span className="skl-tag">{l.tag}</span>
              </div>
              <p className="skl-text">{l.text}</p>
            </div>
            {i === 0 && (
              <div className="skl-line" style={{ marginTop: 8 }} aria-hidden="true">
                <span className="skl-rule" />
                <span className="skl-pill">BRC-100</span>
                <span className="skl-rule" />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="skl-col">
        <span className="skl-head">Beside the layers</span>
        {side.map((s) => (
          <div className="skl-side" key={s.name}>
            <span className="skl-name">{s.name}</span>
            <p className="skl-pkgs">{s.pkgs}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
