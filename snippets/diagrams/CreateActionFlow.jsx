import { useState } from 'react';

// Content only: edit the text here, the layout below does not need to change.
// The page puts the same steps in a <Visibility for="agents"> block above this component, because the markdown
// export leaves the component itself empty. When you change the text here, change it in that block too.
// Source: docs/concepts/wallet-model.mdx, "What createAction Can Return".
// Wrap a method name in backticks to show it as code. Write [[term|explanation]] for a tooltip.
// `box` is the box highlighted for the step. Path 1 and path 2 are the two ways createAction can end.
const steps = [
  {
    lane: 'Your app',
    box: 'ask',
    title: 'Call createAction',
    text: 'The app asks the wallet to create a transaction with `createAction`.',
  },
  {
    lane: "The user's wallet",
    box: 'decide',
    title: 'Check the request',
    text: 'The wallet checks whether it has everything it needs to fund, sign and process the transaction on its own. The call then ends in one of two ways.',
  },
  {
    lane: "The user's wallet",
    box: 'imm',
    title: 'Path 1: immediate action',
    text: 'The wallet funds, signs and processes the transaction on its own, then returns a `txid` and/or the transaction itself.',
  },
  {
    lane: "The user's wallet",
    box: 'signable',
    title: 'Path 2: signable action',
    text: 'The app still has to sign specific inputs. The wallet returns `signableTransaction: { tx, reference }` to the app.',
  },
  {
    lane: 'Your app',
    box: 'sign',
    title: 'Path 2: sign the inputs',
    text: 'The app signs its inputs, then calls `signAction` to finish the transaction.',
  },
  {
    lane: "The user's wallet",
    box: 'ret',
    title: 'Return the result',
    text: 'On path 1 the wallet returns the result straight away. On path 2 it returns it after `signAction`.',
  },
  {
    lane: 'Your app',
    box: 'use',
    title: 'Use the result',
    text: 'The app receives the result.',
  },
];

// Boxes in reading order, for the stacked layout on narrow screens.
const cards = [
  { box: 'ask', lane: 'Your app', title: 'Call createAction' },
  { box: 'decide', lane: "The user's wallet", title: 'Check the request' },
  { box: 'imm', lane: "The user's wallet", title: 'Path 1: immediate action' },
  { box: 'signable', lane: "The user's wallet", title: 'Path 2: signable action' },
  { box: 'sign', lane: 'Your app', title: 'Path 2: sign the inputs' },
  { box: 'ret', lane: "The user's wallet", title: 'Return the result' },
  { box: 'use', lane: 'Your app', title: 'Use the result' },
];

const css = `
.caf { position: relative; container-type: inline-size; width: 100%; margin: 24px 0; border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-surface); padding: 16px; color: var(--wd-text); font-size: 13px; }
.caf-svg { display: block; width: 100%; height: auto; }
.caf-stack { display: none; flex-direction: column; gap: 8px; }
.caf-card { padding: 10px 12px; border: 1px solid var(--wd-border); border-radius: 10px; background: var(--wd-background); color: var(--wd-text-muted); }
.caf-card[data-active="true"] { border: 2px solid var(--wd-primary); padding: 9px 11px; color: var(--wd-text); }
.caf-card-lane { font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
.caf-card-title { margin-top: 2px; font-size: 14px; font-weight: 600; }
.caf-list { list-style: none; margin: 8px 0 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.caf-list li { display: flex; align-items: center; gap: 8px; margin: 0; }
.caf-mark { flex: none; width: 12px; height: 12px; border-radius: 50%; border: 1.5px solid var(--wd-text-muted); box-sizing: border-box; }
.caf-mark[data-state="done"] { background: var(--wd-primary); border-color: var(--wd-primary); }
.caf-mark[data-state="current"] { background: var(--wd-text); border-color: var(--wd-text); }
.caf-arrow { text-align: center; font-size: 12px; color: var(--wd-text-muted); }
.caf-panel { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--wd-border); }
.caf-slides { display: grid; }
.caf-slide { grid-area: 1 / 1; visibility: hidden; }
.caf-slide[data-active="true"] { visibility: visible; }
.caf-sr { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.caf-step { font-size: 12px; color: var(--wd-text-muted); }
.caf-title { margin-top: 4px; font-size: 20px; font-weight: 600; line-height: 1.3; }
.caf-text { margin: 8px 0 0; }
.caf-note { margin: 10px 0 0; padding-left: 12px; border-left: 3px solid var(--wd-border); color: var(--wd-text-muted); }
.caf-hint { position: relative; border-bottom: 1px dotted currentColor; cursor: help; }
.caf-tip { position: absolute; left: 50%; bottom: calc(100% + 6px); transform: translateX(-50%); width: max-content; max-width: 240px; padding: 6px 10px; border-radius: 8px; background: var(--wd-text); color: var(--wd-background); font-size: 12px; font-weight: 500; line-height: 1.4; visibility: hidden; opacity: 0; pointer-events: none; z-index: 5; }
.caf-hint:hover .caf-tip { visibility: visible; opacity: 1; }
.caf-code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.92em; padding: 1px 4px; border: 1px solid var(--wd-border); border-radius: 4px; background: var(--wd-background); }
.caf-actions { display: flex; justify-content: space-between; margin-top: 14px; }
.caf-btn { font: inherit; padding: 6px 14px; border: 1px solid var(--wd-border); border-radius: 8px; background: var(--wd-background); color: var(--wd-text); cursor: pointer; }
.caf-btn:disabled { color: var(--wd-text-muted); cursor: default; opacity: 0.6; }
@media (max-width: 640px) {
  .caf { padding: 12px; }
}
@container (max-width: 780px) {
  .caf-svg { display: none; }
  .caf-stack { display: flex; }
}
`;

// Turns `code` spans into <code> elements and [[term|tip]] into a tooltip.
function Rich({ text }) {
  return text.split(/(`[^`]+`|\[\[[^\]]+\]\])/).map((part, i) => {
    if (part.startsWith('`')) return <code className="caf-code" key={i}>{part.slice(1, -1)}</code>;
    if (part.startsWith('[[')) {
      const [term, tip] = part.slice(2, -2).split('|');
      return (
        <span className="caf-hint" key={i}>
          {term}
          <span className="caf-tip" role="tooltip">{tip}</span>
        </span>
      );
    }
    return part;
  });
}

function Mark({ state }) {
  return <span className="caf-mark" data-state={state} aria-hidden="true" />;
}


export default function CreateActionFlow() {
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const last = steps.length - 1;
  const active = step.box;

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
  const announcement = `Step ${index + 1} of ${steps.length}, ${step.lane}. ${step.title}. ${plain(step.text)}`;

  // One box: x, y, width, title and subtitle. Height is fixed at 58 so the arrows below line up.
  const box = (id, x, y, w, title, sub) => (
    <g key={id}>
      <rect x={x} y={y} width={w} height="58" rx="10" style={frame(id)} />
      <text x={x + 16} y={y + 24} fontSize="14" fontWeight="600" style={{ ...font, fill: ink(id) }}>{title}</text>
      <text x={x + 16} y={y + 42} fontSize="12" style={muted}>{sub}</text>
    </g>
  );

  return (
    <div className="caf" role="group" aria-label="How a createAction call ends, step by step">
      <style>{css}</style>

      <svg
        className="caf-svg"
        viewBox="0 0 880 340"
        role="img"
        aria-label="Diagram: the app calls createAction. The wallet checks the request. If it can finish alone, it returns the result. If not, it returns a signable transaction, the app signs its inputs and calls signAction, and the wallet then returns the result."
      >
        <defs>
          <marker id="caf-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" style={{ fill: 'var(--wd-text-muted)' }} />
          </marker>
        </defs>

        <rect x="0.5" y="0.5" width="879" height="110" rx="12" style={lane} />
        <rect x="0.5" y="118.5" width="879" height="221" rx="12" style={lane} />
        <text x="16" y="22" fontSize="11" fontWeight="600" letterSpacing="1" style={muted}>YOUR APP</text>
        <text x="16" y="140" fontSize="11" fontWeight="600" letterSpacing="1" style={muted}>THE USER'S WALLET</text>

        {box('ask', 16, 36, 200, 'Call createAction', 'A BRC-100 method')}
        {box('sign', 330, 36, 220, 'Sign the inputs', 'Then call signAction')}
        {box('use', 650, 36, 214, 'Use the result', 'Comes back from the wallet')}

        {box('decide', 16, 190, 200, 'Check the request', 'Can it finish alone?')}
        {box('signable', 330, 160, 220, 'Signable action', 'The app must sign')}
        {box('imm', 330, 252, 220, 'Immediate action', 'The wallet finishes alone')}
        {box('ret', 650, 160, 214, 'Return the result', 'txid and/or transaction')}

        <path d="M 190 94 V 190" style={line} markerEnd="url(#caf-arrow)" />
        <text x="200" y="150" fontSize="12" style={muted}>Request</text>

        <path d="M 216 219 H 273 V 189 H 330" style={line} markerEnd="url(#caf-arrow)" />
        <path d="M 216 219 H 273 V 281 H 330" style={line} markerEnd="url(#caf-arrow)" />

        <path d="M 440 160 V 94" style={line} markerEnd="url(#caf-arrow)" />
        <text x="450" y="140" fontSize="12" style={muted}>signableTransaction</text>

        <path d="M 550 65 H 600 V 176 H 650" style={line} markerEnd="url(#caf-arrow)" />
        <text x="608" y="140" fontSize="12" style={muted}>signAction</text>

        <path d="M 550 281 H 600 V 202 H 650" style={line} markerEnd="url(#caf-arrow)" />

        <path d="M 757 160 V 94" style={line} markerEnd="url(#caf-arrow)" />
        <text x="767" y="140" fontSize="12" style={muted}>Result</text>
      </svg>

      <div className="caf-stack" aria-hidden="true">
        {cards.map((c, i) => (
          <div key={c.box}>
            {i > 0 ? <div className="caf-arrow">↓</div> : null}
            <div className="caf-card" data-active={active === c.box}>
              <div className="caf-card-lane">{c.lane}</div>
              <div className="caf-card-title">{c.title}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="caf-panel">
        <div className="caf-sr" aria-live="polite" aria-atomic="true">{announcement}</div>
        <div className="caf-slides" aria-hidden="true">
          {steps.map((item, i) => (
            <div className="caf-slide" key={item.title} data-active={i === index}>
              <div className="caf-step">Step {i + 1} of {steps.length} · {item.lane}</div>
              <div className="caf-title">{item.title}</div>
              <p className="caf-text"><Rich text={item.text} /></p>
            </div>
          ))}
        </div>
        <div className="caf-actions">
          <button type="button" className="caf-btn" onClick={() => setIndex((i) => i - 1)} disabled={index === 0}>
            ← Back
          </button>
          <button type="button" className="caf-btn" onClick={() => setIndex((i) => i + 1)} disabled={index === last}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
