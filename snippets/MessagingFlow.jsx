// The message path as three cards with arrows, to show that the host holds the message until the recipient reads it.
// Edit the `items` text below; the layout does not need to change.
// Wrap a term in ** ** to show it in bold.
// Source: the guide "Send messages between users" and @bsv/message-box-client.

const items = [
  { who: 'Your app', text: 'Encrypts the body with **your wallet** and sends the message.' },
  { who: 'MessageBox host', text: 'Holds the message for the **recipient identity key** until the recipient is online.', hold: true },
  { who: "Recipient's app", text: 'Reads the message with **their wallet** and acknowledges it.' },
];

const bold = (t) => t.split(/\*\*(.+?)\*\*/).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));

const css = `
.mrf { container-type: inline-size; margin: 24px 0; }
.mrf-row { display: flex; align-items: stretch; gap: 8px; }
.mrf-card { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; gap: 6px; padding: 14px; border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-surface); color: var(--wd-text); }
.mrf-hold { border-color: var(--wd-primary); border-width: 2px; }
.mrf-head { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.mrf-who { font-size: 12px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--wd-text); }
.mrf-tag { font-size: 10.5px; font-weight: 600; padding: 2px 8px; border-radius: 999px; background: var(--wd-primary); color: var(--wd-background); }
.mrf-text { font-size: 13px; line-height: 1.45; margin: 0; color: var(--wd-text-muted); }
.mrf-text strong { color: var(--wd-text); font-weight: 600; }
.mrf-arrow { flex: none; align-self: center; font-size: 20px; color: var(--wd-primary); }
@container (max-width: 560px) {
  .mrf-row { flex-direction: column; }
  .mrf-arrow { transform: rotate(90deg); }
}
`;

export default function MessagingFlow() {
  return (
    <div className="mrf" role="group" aria-label="The app sends a message, the host holds it, and the recipient reads it">
      <style>{css}</style>
      <div className="mrf-row">
        {items.map((it, i) => (
          <div key={it.who} style={{ display: 'contents' }}>
            {i > 0 ? <span className="mrf-arrow" aria-hidden="true">→</span> : null}
            <div className={it.hold ? 'mrf-card mrf-hold' : 'mrf-card'}>
              <div className="mrf-head">
                <span className="mrf-who">{it.who}</span>
                {it.hold ? <span className="mrf-tag">waits here</span> : null}
              </div>
              <p className="mrf-text">{bold(it.text)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
