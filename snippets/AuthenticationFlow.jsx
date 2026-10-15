// The exchange as three cards, in the style of the other guide diagrams.
// Edit the text below; the layout does not need to change.
// Wrap a term in ** ** to show it in bold.
// Source: the guide "Authenticate users with their wallet" and @bsv/auth-express-middleware.

const bold = (t) => t.split(/\*\*(.+?)\*\*/).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));

const css = `
.auf { container-type: inline-size; margin: 24px 0; }
.auf-row { display: flex; align-items: stretch; gap: 8px; }
.auf-card { flex: 1 1 0; min-width: 0; padding: 12px; border: 1px solid var(--wd-border); border-radius: 10px; background: var(--wd-surface); color: var(--wd-text); }
.auf-card[data-end] { border: 2px solid var(--wd-primary); }
.auf-who { font-size: 15px; font-weight: 600; line-height: 1.2; margin-bottom: 4px; }
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
        <div className="auf-card">
          <div className="auf-who">BSV Desktop</div>
          <p className="auf-text">{bold('Signs the request with the user **identity key**.')}</p>
        </div>
        <div className="auf-link">
          <span className="auf-link-label">signs</span>
          <span className="auf-arrow" aria-hidden="true">→</span>
        </div>
        <div className="auf-card">
          <div className="auf-who">Client</div>
          <p className="auf-text">{bold('Sends the signed request through **AuthFetch**.')}</p>
        </div>
        <div className="auf-link">
          <span className="auf-link-label">prove who they are</span>
          <span className="auf-arrow" aria-hidden="true">⇄</span>
        </div>
        <div className="auf-card" data-end>
          <div className="auf-who">Server</div>
          <p className="auf-text">{bold('Checks the caller with the **middleware** and reads the **identity key**.')}</p>
        </div>
      </div>
    </div>
  );
}
