// The three parts, with the user's machine drawn as a box around the wallet and the browser app.
// The server sits outside the box: it never reaches the wallet.
// Edit the text below; the layout does not need to change.
// Wrap a term in ** ** to show it in bold.
// Source: the guide "Integrate BSV with web frameworks".

const wallet = { who: 'BSV Desktop', text: 'Holds the **keys** and signs.' };
const browser = { who: 'Browser app', text: 'Calls the wallet with **WalletClient**.' };
const server = { who: 'Express API', text: 'Reads the **identity key** of the caller.' };

const bold = (t) => t.split(/\*\*(.+?)\*\*/).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));

const css = `
.afw { container-type: inline-size; margin: 24px 0; }
.afw-row { display: flex; align-items: stretch; gap: 8px; }
.afw-zone { flex: 2 1 0; min-width: 0; display: flex; flex-direction: column; gap: 8px; padding: 10px; border: 2px solid var(--wd-primary); border-radius: 18px; }
.afw-zone-label { font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--wd-primary); }
.afw-zone-row { flex: 1; display: flex; align-items: stretch; gap: 8px; }
.afw-card { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; gap: 8px; padding: 14px; border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-surface); color: var(--wd-text); }
.afw-out { margin-top: 28px; }
.afw-who { font-size: 16px; font-weight: 600; line-height: 1.2; }
.afw-text { font-size: 13px; line-height: 1.45; margin: 0; color: var(--wd-text-muted); }
.afw-text strong { color: var(--wd-text); font-weight: 600; }
.afw-link { flex: none; align-self: center; display: flex; flex-direction: column; align-items: center; gap: 2px; }
.afw-link-label { font-size: 10.5px; color: var(--wd-text-muted); white-space: nowrap; }
.afw-arrow { font-size: 18px; line-height: 1; color: var(--wd-text-muted); }
@container (max-width: 560px) {
  .afw-row, .afw-zone-row { flex-direction: column; }
  .afw-out { margin-top: 0; }
  .afw-link { flex-direction: row; gap: 6px; }
  .afw-arrow { transform: rotate(90deg); }
}
`;

const Card = ({ c, extra }) => (
  <div className={extra ? 'afw-card ' + extra : 'afw-card'}>
    <div className="afw-who">{c.who}</div>
    <p className="afw-text">{bold(c.text)}</p>
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
    <div className="afw" role="group" aria-label="BSV Desktop and the browser app on the user's machine, and the Express API outside it">
      <style>{css}</style>
      <div className="afw-row">
        <div className="afw-zone">
          <span className="afw-zone-label">The user's machine</span>
          <div className="afw-zone-row">
            <Card c={wallet} />
            <Link label="on localhost" arrow="⇄" />
            <Card c={browser} />
          </div>
        </div>
        <Link label="signed request" arrow="→" />
        <Card c={server} extra="afw-out" />
      </div>
    </div>
  );
}
