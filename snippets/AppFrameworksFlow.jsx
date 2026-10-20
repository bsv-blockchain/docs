// The three parts as cards, in the style of the Authenticate diagram, with the two labeled connectors.
// The browser sits in the middle on purpose: the server never reaches the wallet.
// Edit the `cards` text below; the layout does not need to change.
// Wrap a term in ** ** to show it in bold.
// Source: the guide "Integrate BSV with web frameworks".

const cards = [
  { who: 'BSV Desktop', text: 'Holds the keys and shows a **Spending Request** before it spends.' },
  { who: 'Browser app', text: 'Calls the wallet with **WalletClient** and sends the signed request.' },
  { who: 'Express API', text: 'Reads the **identity key** of the wallet that signed.' },
];

const links = ['on localhost', 'signed request'];

const bold = (t) => t.split(/\*\*(.+?)\*\*/).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));

const css = `
.afw { container-type: inline-size; margin: 24px 0; }
.afw-row { display: flex; align-items: stretch; gap: 8px; }
.afw-card { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; gap: 8px; padding: 14px; border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-surface); color: var(--wd-text); }
.afw-who { font-size: 16px; font-weight: 600; line-height: 1.2; }
.afw-text { font-size: 13px; line-height: 1.45; margin: 0; color: var(--wd-text-muted); }
.afw-text strong { color: var(--wd-text); font-weight: 600; }
.afw-link { flex: none; align-self: center; display: flex; flex-direction: column; align-items: center; gap: 2px; }
.afw-link-label { font-size: 10.5px; color: var(--wd-text-muted); white-space: nowrap; }
.afw-arrow { font-size: 18px; line-height: 1; color: var(--wd-primary); }
@container (max-width: 560px) {
  .afw-row { flex-direction: column; }
  .afw-link { flex-direction: row; gap: 6px; }
  .afw-arrow { transform: rotate(90deg); }
}
`;

export default function AppFrameworksFlow() {
  return (
    <div className="afw" role="group" aria-label="BSV Desktop, the browser app and the Express API, with the browser in the middle">
      <style>{css}</style>
      <div className="afw-row">
        {cards.map((c, i) => (
          <div key={c.who} style={{ display: 'contents' }}>
            {i > 0 ? (
              <div className="afw-link">
                <span className="afw-link-label">{links[i - 1]}</span>
                <span className="afw-arrow" aria-hidden="true">{i === 1 ? '⇄' : '→'}</span>
              </div>
            ) : null}
            <div className="afw-card">
              <div className="afw-who">{c.who}</div>
              <p className="afw-text">{bold(c.text)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
