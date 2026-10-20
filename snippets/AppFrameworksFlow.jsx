// The three parts in two zones: the user's machine (blue) holds the wallet and the browser app, your server (grey, dashed) holds the API.
// The server sits outside the user's machine: it never reaches the wallet.
// Edit the text below; the layout does not need to change.
// Wrap a term in ** ** to show it in bold.
// Source: the guide "Integrate BSV with web frameworks".

const wallet = { who: 'BSV Desktop', text: 'Holds the **keys** and signs. Shows a **Spending Request** before it spends.', chip: 'localhost' };
const browser = { who: 'Browser app', text: 'Asks the wallet for the **identity key** and for payments.', chip: 'WalletClient' };
const server = { who: 'Express API', text: 'Reads the **identity key** of the wallet that signed the request.', chip: 'auth middleware' };

const bold = (t) => t.split(/\*\*(.+?)\*\*/).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));

const css = `
.afw { container-type: inline-size; margin: 24px 0; }
.afw-row { display: flex; align-items: stretch; gap: 8px; }
.afw-zone { display: flex; flex-direction: column; gap: 8px; padding: 10px; border-radius: 18px; min-width: 0; }
.afw-user { flex: 2 1 0; border: 2px solid var(--wd-primary); }
.afw-srv { flex: 1 1 0; border: 2px dashed var(--wd-border); }
.afw-zone-label { font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
.afw-user .afw-zone-label { color: var(--wd-primary); }
.afw-srv .afw-zone-label { color: var(--wd-text-muted); }
.afw-zone-row { flex: 1; display: flex; align-items: stretch; gap: 8px; }
.afw-card { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; gap: 8px; padding: 14px; border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-surface); color: var(--wd-text); }
.afw-who { font-size: 16px; font-weight: 600; line-height: 1.2; }
.afw-text { font-size: 13px; line-height: 1.45; margin: 0; color: var(--wd-text-muted); }
.afw-text strong { color: var(--wd-text); font-weight: 600; }
.afw-chip { margin-top: auto; align-self: flex-start; font-family: var(--wd-font-mono, ui-monospace, monospace); font-size: 11px; padding: 2px 8px; border-radius: 6px; border: 1px solid var(--wd-border); color: var(--wd-text-muted); }
.afw-link { flex: none; align-self: center; display: flex; flex-direction: column; align-items: center; gap: 2px; }
.afw-link-label { font-size: 10.5px; color: var(--wd-text-muted); white-space: nowrap; }
.afw-arrow { font-size: 18px; line-height: 1; color: var(--wd-text-muted); }
@container (max-width: 640px) {
  .afw-row, .afw-zone-row { flex-direction: column; }
  .afw-link { flex-direction: row; gap: 6px; }
  .afw-arrow { transform: rotate(90deg); }
}
`;

const Card = ({ c }) => (
  <div className="afw-card">
    <div className="afw-who">{c.who}</div>
    <p className="afw-text">{bold(c.text)}</p>
    <span className="afw-chip">{c.chip}</span>
  </div>
);

const Link = ({ label, arrow }) => (
  <div className="afw-link">
    <span className="afw-link-label">{label}</span>
    <span className="afw-arrow" aria-hidden="true">{arrow}</span>
  </div>
);

export default function AppFrameworksFlow() {
  return (
    <div className="afw" role="group" aria-label="BSV Desktop and the browser app on the user's machine, and the Express API on your server">
      <style>{css}</style>
      <div className="afw-row">
        <div className="afw-zone afw-user">
          <span className="afw-zone-label">The user's machine</span>
          <div className="afw-zone-row">
            <Card c={wallet} />
            <Link label="calls" arrow="⇄" />
            <Card c={browser} />
          </div>
        </div>
        <Link label="signed request" arrow="→" />
        <div className="afw-zone afw-srv">
          <span className="afw-zone-label">Your server, no wallet access</span>
          <div className="afw-zone-row">
            <Card c={server} />
          </div>
        </div>
      </div>
    </div>
  );
}
