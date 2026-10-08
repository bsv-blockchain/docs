import { useState } from 'react';

// Content only: edit the text here, the layout below does not need to change.
// Source: ts-stack get-started/concepts.md, "BRC-100 Wallet Boundary" and "BEEF and AtomicBEEF".
// Wrap a method name in backticks to show it as code. Write [[term|explanation]] for a tooltip.
const steps = [
  {
    lane: 'Your app',
    box: 'ask',
    title: 'Call a wallet method',
    text: 'The app calls a BRC-100 method on the wallet, such as `createAction`, `signAction` or `listOutputs`.',
  },
  {
    lane: "The user's wallet",
    box: 'wallet',
    item: 0,
    title: 'Select outputs',
    text: 'The wallet selects the outputs to use for the action.',
  },
  {
    lane: "The user's wallet",
    box: 'wallet',
    item: 1,
    title: 'Sign locally',
    text: 'The wallet signs with keys the app never sees.',
  },
  {
    lane: "The user's wallet",
    box: 'wallet',
    item: 2,
    title: 'Return the result',
    text: 'The wallet returns the result. For `createAction`, the transaction can come back as [[AtomicBEEF|BEEF for a single transaction (BRC-95)]].',
  },
  {
    lane: 'Your app',
    box: 'use',
    title: 'Use the result',
    text: 'The app receives the result.',
  },
];

const walletItems = ['Select outputs', 'Sign locally', 'Return the result'];

const css = `
.awf { position: relative; max-width: 760px; margin: 24px auto; border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-surface); padding: 16px; color: var(--wd-text); font-size: 13px; }
.awf-svg { display: block; width: 100%; height: auto; }
.awf-stack { display: none; flex-direction: column; gap: 8px; }
.awf-card { padding: 10px 12px; border: 1px solid var(--wd-border); border-radius: 10px; background: var(--wd-background); color: var(--wd-text-muted); }
.awf-card[data-active="true"] { border: 2px solid var(--wd-primary); padding: 9px 11px; color: var(--wd-text); }
.awf-card-lane { font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
.awf-card-title { margin-top: 2px; font-size: 14px; font-weight: 600; }
.awf-list { list-style: none; margin: 8px 0 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.awf-list li { display: flex; align-items: center; gap: 8px; margin: 0; }
.awf-mark { flex: none; width: 12px; height: 12px; border-radius: 50%; border: 1.5px solid var(--wd-text-muted); box-sizing: border-box; }
.awf-mark[data-state="done"] { background: var(--wd-primary); border-color: var(--wd-primary); }
.awf-mark[data-state="current"] { background: var(--wd-text); border-color: var(--wd-text); }
.awf-arrow { text-align: center; font-size: 12px; color: var(--wd-text-muted); }
.awf-panel { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--wd-border); }
.awf-slides { display: grid; }
.awf-slide { grid-area: 1 / 1; visibility: hidden; }
.awf-slide[data-active="true"] { visibility: visible; }
.awf-sr { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.awf-step { font-size: 12px; color: var(--wd-text-muted); }
.awf-title { margin-top: 4px; font-size: 20px; font-weight: 600; line-height: 1.3; }
.awf-text { margin: 8px 0 0; }
.awf-note { margin: 10px 0 0; padding-left: 12px; border-left: 3px solid var(--wd-border); color: var(--wd-text-muted); }
.awf-hint { position: relative; border-bottom: 1px dotted currentColor; cursor: help; }
.awf-tip { position: absolute; left: 50%; bottom: calc(100% + 6px); transform: translateX(-50%); width: max-content; max-width: 240px; padding: 6px 10px; border-radius: 8px; background: var(--wd-text); color: var(--wd-background); font-size: 12px; font-weight: 500; line-height: 1.4; visibility: hidden; opacity: 0; pointer-events: none; z-index: 5; }
.awf-hint:hover .awf-tip { visibility: visible; opacity: 1; }
.awf-code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.92em; padding: 1px 4px; border: 1px solid var(--wd-border); border-radius: 4px; background: var(--wd-background); }
.awf-actions { display: flex; justify-content: space-between; margin-top: 14px; }
.awf-btn { font: inherit; padding: 6px 14px; border: 1px solid var(--wd-border); border-radius: 8px; background: var(--wd-background); color: var(--wd-text); cursor: pointer; }
.awf-btn:disabled { color: var(--wd-text-muted); cursor: default; opacity: 0.6; }
@media (max-width: 640px) {
  .awf { padding: 12px; }
  .awf-svg { display: none; }
  .awf-stack { display: flex; }
}
`;

// Turns `code` spans into <code> elements and [[term|tip]] into a tooltip.
function Rich({ text }) {
  return text.split(/(`[^`]+`|\[\[[^\]]+\]\])/).map((part, i) => {
    if (part.startsWith('`')) return <code className="awf-code" key={i}>{part.slice(1, -1)}</code>;
    if (part.startsWith('[[')) {
      const [term, tip] = part.slice(2, -2).split('|');
      return (
        <span className="awf-hint" key={i}>
          {term}
          <span className="awf-tip" role="tooltip">{tip}</span>
        </span>
      );
    }
    return part;
  });
}

function Mark({ state }) {
  return <span className="awf-mark" data-state={state} aria-hidden="true" />;
}

export default function AppWalletFlowSteps() {
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const last = steps.length - 1;
  const active = step.box;

  // State of each item in the wallet box: done, current or upcoming.
  const itemState = (i) => {
    if (active === 'use') return 'done';
    if (active !== 'wallet') return 'upcoming';
    if (i < step.item) return 'done';
    return i === step.item ? 'current' : 'upcoming';
  };

  const ink = (box) => (active === box ? 'var(--wd-text)' : 'var(--wd-text-muted)');
  const frame = (box) => ({
    fill: 'var(--wd-background)',
    stroke: active === box ? 'var(--wd-primary)' : 'var(--wd-border)',
    strokeWidth: active === box ? 2.5 : 1.5,
  });
  const lane = { fill: 'var(--wd-surface)', stroke: 'var(--wd-border)', strokeWidth: 1 };
  const line = { stroke: 'var(--wd-text-muted)', strokeWidth: 2, fill: 'none' };
  const muted = { fontFamily: 'inherit', fill: 'var(--wd-text-muted)' };
  const font = { fontFamily: 'inherit' };

  const plain = (s) => s.replace(/`/g, '').replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '$1 ($2)');
  const announcement = `Step ${index + 1} of ${steps.length}, ${step.lane}. ${step.title}. ${plain(step.text)} ${step.note || ''}`;

  return (
    <div className="awf" role="group" aria-label="How an app and a wallet exchange a request and a result, step by step">
      <style>{css}</style>

      <svg
        className="awf-svg"
        viewBox="0 0 760 236"
        role="img"
        aria-label="Diagram: the app calls a wallet method. The wallet selects outputs, signs locally and returns the result to the app. The private keys stay in the wallet."
      >
        <defs>
          <marker id="awfs-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" style={{ fill: 'var(--wd-text-muted)' }} />
          </marker>
        </defs>

        <rect x="0.5" y="0.5" width="759" height="100" rx="12" style={lane} />
        <rect x="0.5" y="108.5" width="759" height="127" rx="12" style={lane} />
        <text x="16" y="22" fontSize="11" fontWeight="600" letterSpacing="1" style={muted}>YOUR APP</text>
        <text x="16" y="130" fontSize="11" fontWeight="600" letterSpacing="1" style={muted}>THE USER'S WALLET</text>

        <rect x="16" y="34" width="246" height="56" rx="10" style={frame('ask')} />
        <text x="32" y="58" fontSize="14" fontWeight="600" style={{ ...font, fill: ink('ask') }}>Call a wallet method</text>
        <text x="32" y="76" fontSize="12" style={muted}>A BRC-100 method</text>

        <rect x="520" y="34" width="224" height="56" rx="10" style={frame('use')} />
        <text x="536" y="58" fontSize="14" fontWeight="600" style={{ ...font, fill: ink('use') }}>Use the result</text>
        <text x="536" y="76" fontSize="12" style={muted}>Comes back from the wallet</text>

        <rect x="250" y="120" width="270" height="100" rx="10" style={frame('wallet')} />
        <text x="268" y="142" fontSize="14" fontWeight="600" style={{ ...font, fill: ink('wallet') }}>Wallet</text>
        {walletItems.map((label, i) => {
          const state = itemState(i);
          const cy = 164 + i * 20;
          return (
            <g key={label}>
              {state === 'upcoming' ? (
                <circle cx="276" cy={cy} r="5" style={{ fill: 'none', stroke: 'var(--wd-text-muted)', strokeWidth: 1.5 }} />
              ) : (
                <circle cx="276" cy={cy} r="5" style={{ fill: state === 'done' ? 'var(--wd-primary)' : 'var(--wd-text)', stroke: 'none' }} />
              )}
              <text x="290" y={cy + 4} fontSize="12" fontWeight={state === 'current' ? 600 : 400} style={{ ...font, fill: state === 'upcoming' ? 'var(--wd-text-muted)' : 'var(--wd-text)' }}>{label}</text>
            </g>
          );
        })}

        <text x="16" y="172" fontSize="12" fontStyle="italic" style={muted}>Private keys stay in</text>
        <text x="16" y="188" fontSize="12" fontStyle="italic" style={muted}>the wallet</text>

        <path d="M 262 62 H 385 V 117" style={line} markerEnd="url(#awfs-arrow)" />
        <text x="395" y="86" fontSize="12" style={muted}>Request</text>

        <path d="M 520 170 H 632 V 93" style={line} markerEnd="url(#awfs-arrow)" />
        <text x="642" y="140" fontSize="12" style={muted}>Result</text>
      </svg>

      <div className="awf-stack" aria-hidden="true">
        <div className="awf-card" data-active={active === 'ask'}>
          <div className="awf-card-lane">Your app</div>
          <div className="awf-card-title">Call a wallet method</div>
        </div>
        <div className="awf-arrow">Request ↓</div>
        <div className="awf-card" data-active={active === 'wallet'}>
          <div className="awf-card-lane">The user's wallet</div>
          <ul className="awf-list">
            {walletItems.map((label, i) => (
              <li key={label}>
                <Mark state={itemState(i)} />
                <span style={{ fontWeight: itemState(i) === 'current' ? 600 : 400 }}>{label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="awf-arrow">Result ↓</div>
        <div className="awf-card" data-active={active === 'use'}>
          <div className="awf-card-lane">Your app</div>
          <div className="awf-card-title">Use the result</div>
        </div>
      </div>

      <div className="awf-panel">
        <div className="awf-sr" aria-live="polite" aria-atomic="true">{announcement}</div>
        <div className="awf-slides" aria-hidden="true">
          {steps.map((item, i) => (
            <div className="awf-slide" key={item.title} data-active={i === index}>
              <div className="awf-step">Step {i + 1} of {steps.length} · {item.lane}</div>
              <div className="awf-title">{item.title}</div>
              <p className="awf-text"><Rich text={item.text} /></p>
              {item.note ? <p className="awf-note">{item.note}</p> : null}
            </div>
          ))}
        </div>
        <div className="awf-actions">
          <button type="button" className="awf-btn" onClick={() => setIndex((i) => i - 1)} disabled={index === 0}>
            ← Back
          </button>
          <button type="button" className="awf-btn" onClick={() => setIndex((i) => i + 1)} disabled={index === last}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
