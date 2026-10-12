import { useState } from 'react';

// Content only: edit the text here, the layout below does not need to change.
// Source: ts-stack get-started/choose-your-stack.md and the package pages (simple, wallet-helper, wallet-toolbox, bsv-sdk).
// Wrap a package or method name in backticks to show it as code.
// Each option is one row of the diagram: an answer, the package it leads to, and a short panel with a link to the section of the page.
// The options are in the same order as the tabs of that section.
const options = [
  {
    group: "In the user's wallet",
    answer: 'The wallet builds and signs',
    detail: 'Your app asks the wallet for the result',
    pkg: '@bsv/sdk',
    pkgNote: 'with WalletClient',
    title: '`@bsv/sdk` with `WalletClient`',
    text: "The user's wallet keeps the keys and asks the person to approve each spend.",
    link: { label: 'See it in code', href: '#see-each-package-in-code' },
  },
  {
    group: "In the user's wallet",
    answer: 'You build each output',
    detail: 'The wallet still holds the keys and signs',
    pkg: '@bsv/wallet-helper',
    pkgNote: 'beta',
    title: '`@bsv/wallet-helper`',
    text: 'You describe outputs, scripts and change, and the wallet still holds the keys and signs.',
    link: { label: 'See it in code', href: '#see-each-package-in-code' },
  },
  {
    answer: 'In your own service',
    detail: 'A backend, bot or agent with its own key',
    pkg: '@bsv/simple/server',
    pkgNote: '',
    title: '`@bsv/simple/server`',
    text: 'A service, bot or test harness owns its key, and no person approves each payment.',
    link: { label: 'See it in code', href: '#see-each-package-in-code' },
  },
  {
    answer: 'In a wallet you are writing',
    detail: 'A wallet product or infrastructure',
    pkg: '@bsv/wallet-toolbox',
    pkgNote: '',
    title: '`@bsv/wallet-toolbox`',
    text: 'You implement a wallet, its storage and its permission screens.',
    link: { label: 'See it in code', href: '#see-each-package-in-code' },
  },
  {
    answer: 'In your own code',
    detail: 'Keys, scripts and transactions directly',
    pkg: '@bsv/sdk',
    pkgNote: 'the primitives',
    title: '`@bsv/sdk`',
    text: 'You work with the primitives themselves, with nothing built on top.',
    link: { label: 'See it in code', href: '#see-each-package-in-code' },
  },
];

const ROW_H = 52;
const TOP = 16;
const GROUP_H = 148; // label, two rows and their padding
// Top of each row: the first two sit inside the group box.
const ROW_TOPS = [TOP + 26, TOP + 88, TOP + GROUP_H + 16, TOP + GROUP_H + 80, TOP + GROUP_H + 144];
const centerY = (i) => ROW_TOPS[i] + ROW_H / 2;
const QUESTION_Y = (centerY(0) + centerY(4)) / 2;
const VIEW_H = ROW_TOPS[4] + ROW_H + 16;

const css = `
.ysc { position: relative; container-type: inline-size; width: 100%; margin: 24px 0; border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-surface); padding: 16px; color: var(--wd-text); font-size: 13px; }
.ysc-svg { display: block; width: 100%; height: auto; }
.ysc-row { cursor: pointer; outline: none; }
.ysc-row:focus-visible .ysc-focus { stroke: var(--wd-primary); stroke-width: 3; }
.ysc-cards { display: none; flex-direction: column; gap: 8px; }
.ysc-q { font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--wd-text-muted); }
.ysc-card-wrap { display: flex; flex-direction: column; gap: 8px; }
.ysc-card { display: block; width: 100%; text-align: left; font: inherit; padding: 10px 12px; border: 1px solid var(--wd-border); border-radius: 10px; background: var(--wd-background); color: var(--wd-text-muted); cursor: pointer; }
.ysc-card[aria-pressed="true"] { border: 2px solid var(--wd-primary); padding: 9px 11px; color: var(--wd-text); }
.ysc-card-answer { font-size: 14px; font-weight: 600; color: var(--wd-text); }
.ysc-card-pkg { margin-top: 4px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; }
.ysc-panel { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--wd-border); }
.ysc-sr { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.ysc-eyebrow { font-size: 12px; color: var(--wd-text-muted); }
.ysc-title { margin-top: 4px; font-size: 20px; font-weight: 600; line-height: 1.3; }
.ysc-text { margin: 8px 0 0; }
.ysc-link { display: inline-block; margin-top: 10px; color: var(--wd-primary); font-weight: 500; text-decoration: none; }
.ysc-link:hover { text-decoration: underline; }
.ysc-code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.92em; padding: 1px 4px; border: 1px solid var(--wd-border); border-radius: 4px; background: var(--wd-background); }
@media (max-width: 640px) {
  .ysc { padding: 12px; }
}
@container (max-width: 780px) {
  .ysc-svg { display: none; }
  .ysc-cards { display: flex; }
}
`;

// Turns `code` spans into <code> elements.
function Rich({ text }) {
  return text.split(/(`[^`]+`)/).map((part, i) =>
    part.startsWith('`') ? <code className="ysc-code" key={i}>{part.slice(1, -1)}</code> : part
  );
}

const plain = (s) => s.replace(/`/g, '');

export default function StackChooser() {
  const [index, setIndex] = useState(0);
  const current = options[index];

  // The tabs of the page follow the order of the options, so the link opens the tab of the chosen option.
  // If the markup of the tabs changes, nothing happens here and the link still goes to the section.
  const openTab = () => {
    try {
      const buttons = document.querySelectorAll('.wd-tabs-nav button');
      if (buttons[index]) buttons[index].click();
    } catch (e) {
      // the plain link is enough
    }
  };

  const onKey = (i) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIndex(i);
    }
  };

  const ink = (selected) => (selected ? 'var(--wd-text)' : 'var(--wd-text-muted)');
  const frame = (selected) => ({
    fill: 'var(--wd-background)',
    stroke: selected ? 'var(--wd-primary)' : 'var(--wd-border)',
    strokeWidth: selected ? 2.5 : 1.5,
  });
  const muted = { fontFamily: 'inherit', fill: 'var(--wd-text-muted)' };
  const font = { fontFamily: 'inherit' };
  const mono = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' };
  const line = (selected) => ({
    stroke: selected ? 'var(--wd-primary)' : 'var(--wd-border)',
    strokeWidth: selected ? 2.5 : 1.5,
    fill: 'none',
  });

  const announcement = `${current.group ? `${current.group}, ` : ''}${current.answer}, ${current.detail}. Start with ${plain(current.title)}. ${plain(current.text)}`;

  // The rows keep a fixed order in the DOM, so the keyboard order never changes.
  // The connectors of the selected row are drawn again in a layer on top, since an SVG has no z-index.
  const toQuestion = (i) => `M 200 ${QUESTION_Y} H 224 V ${centerY(i)} H 248`;
  const toPackage = (i) => `M 616 ${centerY(i)} H 656`;

  return (
    <div className="ysc" role="group" aria-label="Choose a starting package by where the signing key lives">
      <style>{css}</style>

      <svg className="ysc-svg" viewBox={`0 0 880 ${VIEW_H}`} role="group" aria-label="Where does the signing key live? Pick an answer to see the package to start with.">
        <defs>
          <marker id="ysc-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" style={{ fill: 'var(--wd-text-muted)' }} />
          </marker>
          <marker id="ysc-arrow-on" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" style={{ fill: 'var(--wd-primary)' }} />
          </marker>
        </defs>

        <rect x="0" y={QUESTION_Y - 40} width="200" height="80" rx="10" style={{ fill: 'var(--wd-background)', stroke: 'var(--wd-primary)', strokeWidth: 2.5 }} aria-hidden="true" />
        <text x="16" y={QUESTION_Y - 4} fontSize="14" fontWeight="600" style={{ ...font, fill: 'var(--wd-text)' }}>Where does the</text>
        <text x="16" y={QUESTION_Y + 16} fontSize="14" fontWeight="600" style={{ ...font, fill: 'var(--wd-text)' }}>signing key live?</text>

        <rect x="240" y={TOP} width="384" height={GROUP_H} rx="12" style={{ fill: 'none', stroke: 'var(--wd-border)', strokeWidth: 1.5 }} aria-hidden="true" />
        <text x="256" y={TOP + 17} fontSize="10.5" fontWeight="600" letterSpacing="1" style={muted} aria-hidden="true">{options[0].group.toUpperCase()}</text>

        {options.map((o, i) => {
          const selected = i === index;
          const y = ROW_TOPS[i];
          return (
            <g
              key={i}
              className="ysc-row"
              role="button"
              tabIndex={0}
              aria-pressed={selected}
              aria-label={`${o.group ? `${o.group}, ` : ''}${o.answer}, ${o.detail}. Leads to ${o.pkg} ${o.pkgNote}`.trim()}
              onClick={() => setIndex(i)}
              onKeyDown={onKey(i)}
            >
              {selected ? null : <path d={toQuestion(i)} style={line(false)} />}
              <rect className="ysc-focus" x="248" y={y} width="368" height={ROW_H} rx="10" style={frame(selected)} />
              <text x="264" y={y + 22} fontSize="13" fontWeight="600" style={{ ...font, fill: ink(selected) }}>{o.answer}</text>
              <text x="264" y={y + 40} fontSize="11.5" style={muted}>{o.detail}</text>

              {selected ? null : <path d={toPackage(i)} style={line(false)} markerEnd="url(#ysc-arrow)" />}
              <rect x="660" y={y} width="220" height={ROW_H} rx="10" style={frame(selected)} />
              <text x="676" y={y + 22} fontSize="13" fontWeight="600" style={{ ...mono, fill: ink(selected) }}>{o.pkg}</text>
              <text x="676" y={y + 40} fontSize="11.5" style={muted}>{o.pkgNote}</text>
            </g>
          );
        })}
        <g aria-hidden="true" style={{ pointerEvents: 'none' }}>
          <path d={toQuestion(index)} style={line(true)} />
          <path d={toPackage(index)} style={line(true)} markerEnd="url(#ysc-arrow-on)" />
        </g>
      </svg>

      <div className="ysc-cards">
        <div className="ysc-q">Where does the signing key live?</div>
        {options.map((o, i) => (
          <div key={i} className="ysc-card-wrap">
            {o.group && (i === 0 || options[i - 1].group !== o.group) ? <div className="ysc-q">{o.group}</div> : null}
            <button type="button" className="ysc-card" aria-pressed={i === index} onClick={() => setIndex(i)}>
              <div className="ysc-card-answer">{o.answer}</div>
              <div>{o.detail}</div>
              <div className="ysc-card-pkg">{o.pkg}{o.pkgNote ? ` (${o.pkgNote})` : ''}</div>
            </button>
          </div>
        ))}
      </div>

      <div className="ysc-panel">
        <div className="ysc-sr" aria-live="polite" aria-atomic="true">{announcement}</div>
        <div className="ysc-eyebrow">Start with</div>
        <div className="ysc-title"><Rich text={current.title} /></div>
        <p className="ysc-text"><Rich text={current.text} /></p>
        <a className="ysc-link" href={current.link.href} onClick={openTab}>{current.link.label} →</a>
      </div>
    </div>
  );
}
