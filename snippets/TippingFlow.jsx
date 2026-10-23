// How a tip moves in the tipping sample, as four numbered steps: Tip, Relay, Track, Collect.
// Each step is one card: the call on top, then the two parts that act in it side by side. A wallet card has the primary border.
// Readable on its own: a reader sees who does what, a developer sees the calls.
// Edit the text below; the layout does not need to change.
// Source: samples/tipping-shape-a (README.md, TRUST.md, GUARDRAILS.md) in bsv-blockchain/bsv-ai-toolkit at 2291251. The wallet steps were not run.

const steps = [
  {
    label: 'Tip',
    tag: 'createAction',
    a: { who: 'Tipper page', text: 'Picks a BRC-29 derivation for the creator and saves it in the browser.' },
    b: { who: "Tipper's wallet", wallet: true, text: "Derives the creator's key, then signs and broadcasts the payment to it, with the tipper's approval when it asks." },
  },
  {
    label: 'Relay',
    tag: 'POST /api/tips',
    a: { who: 'Tipper page', text: 'Posts the transaction and the derivation to the relay.' },
    b: { who: 'Relay', text: 'Checks the transaction against its BEEF and submits it to its own Arcade, as EF. It holds no key.' },
  },
  {
    label: 'Track',
    tag: 'GET /tx/TXID',
    a: { who: 'Relay', text: 'Reads the status and tells the creator page over server-sent events.' },
    b: { who: 'Arcade', text: 'Reports SEEN_ON_NETWORK or later, with no competing transaction.' },
  },
  {
    label: 'Collect',
    tag: 'internalizeAction',
    a: { who: 'Creator page', text: 'Collects the tip once Arcade has seen it, retrying after 10, 30 and 60 seconds.' },
    b: { who: "Creator's wallet", wallet: true, text: 'Derives the key from the derivation, and adds the tip only if it is its own.' },
  },
];

const css = `
.tfl { container-type: inline-size; margin: 28px 0; padding: 0; list-style: none; display: flex; flex-direction: column; color: var(--wd-text); }
.tfl-step { position: relative; display: grid; grid-template-columns: 36px minmax(0, 1fr); column-gap: 16px; padding-bottom: 20px; margin: 0; }
.tfl-step:last-child { padding-bottom: 0; }
.tfl-step:not(:last-child)::before { content: ''; position: absolute; left: 17px; top: 36px; bottom: 0; width: 2px; background: var(--wd-border); }
.tfl-num { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid var(--wd-primary); background: var(--wd-background); color: var(--wd-primary); font-size: 14px; font-weight: 600; }
.tfl-card { border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-surface); overflow: hidden; }
.tfl-top { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; padding: 12px 18px; border-bottom: 1px solid var(--wd-border); }
.tfl-label { font-size: 15px; font-weight: 600; margin: 0; color: var(--wd-text); }
.tfl-tag { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; padding: 2px 10px; border-radius: 999px; border: 1px solid var(--wd-primary); color: var(--wd-primary); }
.tfl-body { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; padding: 12px; }
.tfl-side { display: flex; flex-direction: column; gap: 4px; padding: 13px 16px; border: 1px solid var(--wd-border); border-radius: 10px; background: var(--wd-background); }
.tfl-wallet { border: 2px solid var(--wd-primary); padding: 12px 15px; }
.tfl-who { font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--wd-text-muted); }
.tfl-text { font-size: 13.5px; line-height: 1.55; margin: 0; color: var(--wd-text); }
@container (max-width: 560px) {
  .tfl-step { grid-template-columns: 30px minmax(0, 1fr); column-gap: 12px; }
  .tfl-num { width: 30px; height: 30px; font-size: 13px; }
  .tfl-step:not(:last-child)::before { left: 14px; top: 30px; }
  .tfl-body { grid-template-columns: 1fr; }
}
`;

export default function TippingFlow() {
  return (
    <ol className="tfl" aria-label="A tip goes from the tipper's wallet to the relay and Arcade, and the creator's wallet collects it once Arcade has seen it with no competing transaction">
      <style>{css}</style>
      {steps.map((s, i) => (
        <li className="tfl-step" key={s.label}>
          <span className="tfl-num" aria-hidden="true">{i + 1}</span>
          <div className="tfl-card">
            <div className="tfl-top">
              <p className="tfl-label">{s.label}</p>
              <span className="tfl-tag">{s.tag}</span>
            </div>
            <div className="tfl-body">
              {[s.a, s.b].map((side) => (
                <div className={side.wallet ? 'tfl-side tfl-wallet' : 'tfl-side'} key={side.who}>
                  <span className="tfl-who">{side.who}</span>
                  <p className="tfl-text">{side.text}</p>
                </div>
              ))}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
