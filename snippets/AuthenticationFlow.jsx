// The exchange as three cards, in the style of the Gate diagram, with the two labeled connectors.
// Edit the `cards` text below; the layout does not need to change.
// Wrap a term in ** ** to show it in bold.
// Source: the guide "Authenticate users with their wallet" and @bsv/auth-express-middleware.

const cards = [
  { n: 1, who: 'BSV Desktop', text: 'Signs the request with the user **identity key**.' },
  { n: 2, who: 'Client', text: 'Sends the signed request through **AuthFetch**.' },
  { n: 3, who: 'Server', text: 'Checks the caller with the **middleware** and reads the **identity key**.' },
];

const bold = (t) => t.split(/\*\*(.+?)\*\*/).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));

const css = `
.auf { container-type: inline-size; margin: 24px 0; }
.auf-row { display: flex; align-items: stretch; gap: 8px; }
.auf-card { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; gap: 8px; padding: 14px; border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-surface); color: var(--wd-text); }
.auf-num { width: 32px; height: 32px; border-radius: 50%; background: var(--wd-primary); color: var(--wd-background); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; }
.auf-who { margin-top: 2px; font-size: 16px; font-weight: 600; line-height: 1.2; }
.auf-text { font-size: 13px; line-height: 1.45; margin: 0; color: var(--wd-text-muted); }
.auf-text strong { color: var(--wd-text); font-weight: 600; }
.auf-link { flex: none; align-self: center; display: flex; flex-direction: column; align-items: center; gap: 2px; }
.auf-link-label { font-size: 10.5px; color: var(--wd-text-muted); white-space: nowrap; }
.auf-arrow { font-size: 18px; line-height: 1; color: var(--wd-primary); }
@container (max-width: 560px) {
  .auf-row { flex-direction: column; }
  .auf-link { flex-direction: row; gap: 6px; }
  .auf-arrow { transform: rotate(90deg); }
}
`;

export default function AuthenticationFlow() {
  return (
    <div className="auf" role="group" aria-label="The wallet, the client and the server in the exchange">
      <style>{css}</style>
      <div className="auf-row">
        {cards.map((c, i) => (
          <div key={c.who} style={{ display: 'contents' }}>
            {i > 0 ? (
              <div className="auf-link">
                <span className="auf-link-label">{i === 1 ? 'signs' : 'prove who they are'}</span>
                <span className="auf-arrow" aria-hidden="true">{i === 1 ? '→' : '⇄'}</span>
              </div>
            ) : null}
            <div className="auf-card">
              <span className="auf-num" aria-hidden="true">{c.n}</span>
              <div className="auf-who">{c.who}</div>
              <p className="auf-text">{bold(c.text)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
