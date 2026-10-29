import { useState } from 'react';

// Content only: edit the text here, the layout below does not need to change.
// Source: the description of each guide in guides/. Each option is one thing the reader wants to do and the guide it leads to.
// Wrap a code term in backticks to show it as code.
// Writedocs adds the base path to the links of the page but not to an address computed here, so it is written once.
const BASE_PATH = '/docs';

const options = [
  {
    goal: 'Charge for an API',
    detail: 'Pay per request with HTTP 402',
    title: 'Gate an API behind payments',
    text: 'Charge for API routes with HTTP 402 Payment Required, using an Express middleware that prices a route and a fetch wrapper that pays from the user's wallet.',
    href: '/guides/payments/',
  },
  {
    goal: 'Know who sends each request',
    detail: 'Identify users by their wallet',
    title: 'Authenticate users with their wallet',
    text: 'Use the identity key of a BSV wallet to know which user sends each request to your Express API, with mutual authentication handled by middleware.',
    href: '/guides/identity-auth/',
  },
  {
    goal: 'Put data or files on the blockchain',
    detail: "Written through the user's wallet",
    title: 'Store data and files',
    text: "Put data in a transaction output through the user's wallet and read it back with the TypeScript SDK.",
    href: '/guides/data-storage/',
  },
  {
    goal: 'Send messages between users',
    detail: 'Encrypted, with payments',
    title: 'Send messages between users',
    text: 'Send encrypted messages and payments between users with MessageBox, which holds each message until its recipient reads it.',
    href: '/guides/messaging/',
  },
  {
    goal: "Find your app's transactions",
    detail: 'Without scanning the chain',
    title: 'Track transactions with overlays',
    text: "Track your app's transactions in an overlay, a service that indexes them under a topic, and look them up without scanning the chain.",
    href: '/guides/overlays/',
  },
  {
    goal: 'Check a digital product passport',
    detail: 'Offline, with a test passport',
    title: 'Digital product passports on BSV',
    text: 'Learn how a digital product passport maps onto BSV, check a test passport offline and read its verification report.',
    href: '/guides/digital-product-passports/',
  },
];

const css = `
.gc { container-type: inline-size; width: 100%; margin: 28px 0; color: var(--wd-text); font-size: 14px; }
.gc-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr); gap: 24px; align-items: stretch; }
.gc-q { margin: 0 0 12px 2px; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--wd-text-muted); }
.gc-list { border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-surface); overflow: hidden; }
.gc-opt { position: relative; display: grid; grid-template-columns: 32px minmax(0, 1fr) 16px; align-items: center; column-gap: 12px; width: 100%; text-align: left; font: inherit; padding: 14px 18px; border: 0; border-top: 1px solid var(--wd-border); background: transparent; color: var(--wd-text-muted); cursor: pointer; transition: background 0.15s ease; }
.gc-opt:first-child { border-top: 0; }
.gc-opt:hover { background: color-mix(in srgb, var(--wd-primary) 6%, transparent); }
.gc-opt:focus-visible { outline: 2px solid var(--wd-primary); outline-offset: -2px; }
.gc-opt[aria-pressed="true"] { background: color-mix(in srgb, var(--wd-primary) 11%, transparent); color: var(--wd-text); }
.gc-opt[aria-pressed="true"]::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--wd-primary); }
.gc-num { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; opacity: 0.7; }
.gc-goal { display: block; font-size: 14.5px; font-weight: 600; line-height: 1.35; color: var(--wd-text); }
.gc-detail { display: block; margin-top: 2px; font-size: 12.5px; line-height: 1.4; }
.gc-chev { font-size: 15px; opacity: 0; transform: translateX(-4px); transition: opacity 0.15s ease, transform 0.15s ease; color: var(--wd-primary); }
.gc-opt[aria-pressed="true"] .gc-chev { opacity: 1; transform: none; }
.gc-panel { display: flex; flex-direction: column; border: 1px solid var(--wd-border); border-radius: 14px; background: linear-gradient(160deg, color-mix(in srgb, var(--wd-primary) 9%, var(--wd-surface)), var(--wd-surface) 70%); overflow: hidden; }
.gc-body { padding: 28px 28px 20px; }
.gc-sr { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.gc-eyebrow { display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--wd-text-muted); }
.gc-count { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; letter-spacing: 0; }
.gc-title { margin: 14px 0 0; font-size: 22px; font-weight: 600; line-height: 1.25; letter-spacing: -0.01em; }
.gc-text { margin: 12px 0 0; font-size: 14.5px; line-height: 1.65; color: var(--wd-text-muted); }
.gc-cta { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding: 16px 28px; border-top: 1px solid var(--wd-border); color: var(--wd-primary); font-weight: 600; font-size: 14px; text-decoration: none; transition: background 0.15s ease; }
.gc-cta:hover { background: color-mix(in srgb, var(--wd-primary) 10%, transparent); text-decoration: none; }
.gc-cta:focus-visible { outline: 2px solid var(--wd-primary); outline-offset: -2px; }
@container (max-width: 640px) {
  .gc-grid { grid-template-columns: minmax(0, 1fr); gap: 16px; }
  .gc-body { padding: 20px 20px 16px; }
  .gc-cta { padding: 14px 20px; }
}
`;

export default function GuideChooser() {
  const [index, setIndex] = useState(0);
  const current = options[index];

  return (
    <div className="gc" role="group" aria-label="Choose a use case guide by what you want to do">
      <style>{css}</style>
      <p className="gc-q">What do you want to do?</p>
      <div className="gc-grid">
        <div>
          <div className="gc-list">
            {options.map((o, i) => (
              <button key={i} type="button" className="gc-opt" aria-pressed={i === index} onClick={() => setIndex(i)}>
                <span className="gc-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <span className="gc-goal">{o.goal}</span>
                  <span className="gc-detail">{o.detail}</span>
                </span>
                <span className="gc-chev" aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </div>
        <div className="gc-panel">
          <div className="gc-sr" aria-live="polite" aria-atomic="true">{`${current.goal}. Start with ${current.title}. ${current.text}`}</div>
          <div className="gc-body">
            <div className="gc-eyebrow"><span>Start with</span><span className="gc-count" aria-hidden="true">{index + 1} / {options.length}</span></div>
            <div className="gc-title">{current.title}</div>
            <p className="gc-text">{current.text}</p>
          </div>
          <a className="gc-cta" href={BASE_PATH + current.href}><span>Open the guide</span><span aria-hidden="true">→</span></a>
        </div>
      </div>
    </div>
  );
}
