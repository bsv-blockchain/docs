// How a wallet uses its two backend services, as three numbered steps: Sign in, Unlock, Store.
// Each step is one card: the client class or call on top, then the wallet and the service side by side.
// Readable on its own: a reader sees the three steps, a developer sees the classes and endpoints.
// Edit the text below; the layout does not need to change.
// Source: infra/wab and infra/wallet-infra in github.com/bsv-blockchain/ts-stack (READMEs, how-it-works.md, src), tested locally on testnet.

const steps = [
  {
    label: 'Sign in',
    tag: 'WABClient',
    wallet: 'Sends the phone number, then the code the user received, with a presentation key it generated.',
    service: 'WAB: verifies the code. A new user keeps the key the wallet sent. A returning user gets back the key stored on the first sign-in.',
  },
  {
    label: 'Unlock',
    tag: 'WalletAuthenticationManager',
    wallet: 'Combines the presentation key with the password to decrypt the root key from the user’s UMP token.',
    service: 'No backend call. The WAB never receives the password or the root key.',
  },
  {
    label: 'Store',
    tag: 'StorageClient',
    wallet: 'Signs every storage call with its identity key and posts it as JSON-RPC.',
    service: 'Wallet Infra: checks the signature and reads or writes only the records of that identity key in MySQL.',
  },
];

const css = `
.wbf { container-type: inline-size; margin: 28px 0; padding: 0; list-style: none; display: flex; flex-direction: column; color: var(--wd-text); }
.wbf-step { position: relative; display: grid; grid-template-columns: 36px minmax(0, 1fr); column-gap: 16px; padding-bottom: 20px; margin: 0; }
.wbf-step:last-child { padding-bottom: 0; }
.wbf-step:not(:last-child)::before { content: ''; position: absolute; left: 17px; top: 36px; bottom: 0; width: 2px; background: var(--wd-border); }
.wbf-num { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid var(--wd-primary); background: var(--wd-background); color: var(--wd-primary); font-size: 14px; font-weight: 600; }
.wbf-card { border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-surface); overflow: hidden; }
.wbf-top { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; padding: 12px 18px; border-bottom: 1px solid var(--wd-border); }
.wbf-label { font-size: 15px; font-weight: 600; margin: 0; color: var(--wd-text); }
.wbf-tag { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; padding: 2px 10px; border-radius: 999px; border: 1px solid var(--wd-primary); color: var(--wd-primary); }
.wbf-body { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; padding: 12px; }
.wbf-side { display: flex; flex-direction: column; gap: 4px; padding: 13px 16px; border: 1px solid var(--wd-border); border-radius: 10px; background: var(--wd-background); }
.wbf-side + .wbf-side { border: 2px solid var(--wd-primary); padding: 12px 15px; }
.wbf-who { font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--wd-text-muted); }
.wbf-text { font-size: 13.5px; line-height: 1.55; margin: 0; color: var(--wd-text); }
@container (max-width: 560px) {
  .wbf-step { grid-template-columns: 30px minmax(0, 1fr); column-gap: 12px; }
  .wbf-num { width: 30px; height: 30px; font-size: 13px; }
  .wbf-step:not(:last-child)::before { left: 14px; top: 30px; }
  .wbf-body { grid-template-columns: 1fr; }
}
`;

export default function WalletBackendFlow() {
  return (
    <ol className="wbf" aria-label="A wallet signs in through the WAB, unlocks its root key locally and stores its records on Wallet Infra">
      <style>{css}</style>
      {steps.map((s, i) => (
        <li className="wbf-step" key={s.label}>
          <span className="wbf-num" aria-hidden="true">{i + 1}</span>
          <div className="wbf-card">
            <div className="wbf-top">
              <p className="wbf-label">{s.label}</p>
              <span className="wbf-tag">{s.tag}</span>
            </div>
            <div className="wbf-body">
              <div className="wbf-side">
                <span className="wbf-who">Your wallet</span>
                <p className="wbf-text">{s.wallet}</p>
              </div>
              <div className="wbf-side">
                <span className="wbf-who">Backend</span>
                <p className="wbf-text">{s.service}</p>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
