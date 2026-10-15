// A simple picture of the 402 exchange: four cards, in order. Edit the text below, the layout does not need to change.
// Source: the guide "Gate an API behind payments" and @bsv/402-pay (BRC-121).

const steps = [
  { who: 'Client', title: 'Ask', text: 'The client asks the server for the paid page.' },
  { who: 'Server', title: 'Price', text: 'The server answers 402: it costs 1000 satoshis.' },
  { who: 'BSV Desktop', title: 'Pay', text: 'The wallet pays. You click Authorize.' },
  { who: 'Client and server', title: 'Get', text: 'The client asks again with the payment. The server lets it in.' },
];

const css = `
.pgf { container-type: inline-size; margin: 24px 0; }
.pgf-row { display: flex; align-items: stretch; gap: 8px; }
.pgf-card { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; gap: 6px; padding: 14px; border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-surface); color: var(--wd-text); }
.pgf-num { width: 32px; height: 32px; border-radius: 50%; background: var(--wd-primary); color: var(--wd-background); display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; }
.pgf-who { font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--wd-text-muted); }
.pgf-title { font-size: 18px; font-weight: 600; line-height: 1.2; }
.pgf-text { font-size: 13px; line-height: 1.45; margin: 0; color: var(--wd-text); }
.pgf-arrow { flex: none; align-self: center; font-size: 20px; color: var(--wd-text-muted); }
@container (max-width: 640px) {
  .pgf-row { flex-direction: column; }
  .pgf-arrow { transform: rotate(90deg); }
}
`;

export default function PaymentGatingFlow() {
  return (
    <div className="pgf" role="group" aria-label="How a client pays for a priced route, in four steps">
      <style>{css}</style>
      <ol className="pgf-row" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {steps.map((s, i) => (
          <>
            <li className="pgf-card" key={s.title}>
              <div className="pgf-num" aria-hidden="true">{i + 1}</div>
              <div className="pgf-who">{s.who}</div>
              <div className="pgf-title">{s.title}</div>
              <p className="pgf-text">{s.text}</p>
            </li>
            {i < steps.length - 1 ? <li className="pgf-arrow" key={`a${i}`} aria-hidden="true">→</li> : null}
          </>
        ))}
      </ol>
    </div>
  );
}
