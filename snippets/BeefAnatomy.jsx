import { Fragment, useState } from 'react';
import BeefFrame from '/snippets/BeefFrame.jsx';

// Anatomy of a BEEF that carries one payment: the chain the receiver checks on top, the bytes of the BEEF below.
// Selecting a part in either row lights it up in both rows, and the footer says what it is. One color per part ties the rows together.
// Content only: edit the texts in `copy`, `info`, `chain` and `bytes`, the layout does not need to change.
// The bytes follow BRC-62 (version 0100BEEF, a list of BUMPs, then each transaction with its BUMP flag).

const copy = {
  label: 'Anatomy of a BEEF with one payment. The receiver checks the block header, the BUMP, the parent transaction and the payment transaction in that order, and the bytes of the BEEF carry the last three. Selecting a part explains it.',
  hint: 'Select a part of the BEEF, in either row',
  idle: 'The chain on top is what the receiver checks, and the bytes below are what the BEEF carries. The same color marks the same part in both rows.',
  clear: 'Clear',
  chainEyebrow: 'What the receiver checks',
  bytesEyebrow: 'What the BEEF carries, in byte order',
  held: 'Held by the receiver',
  inBeef: 'In the BEEF',
};

// What each part is. The group ids tie a chain box to its bytes.
const info = {
  header: { title: 'Block header', text: 'Not part of the BEEF. The receiver already has it and compares its Merkle root with the root it computes from the BUMP.' },
  version: { title: 'Version', text: 'The first 4 bytes. 0100beef marks the first version of the format.' },
  nbumps: { title: 'BUMP count', text: 'How many BUMPs follow, as a VarInt of 1 to 9 bytes. This BEEF has one.' },
  bump: { title: 'BUMP', text: 'The Merkle path of the parent transaction. It records the block height and only the hashes needed to reach the Merkle root.' },
  ntx: { title: 'Transaction count', text: 'How many transactions follow, as a VarInt of 1 to 9 bytes. This BEEF has two.' },
  parent: { title: 'Parent transaction', text: 'The raw transaction, already mined. The flag 01 00 after it says a BUMP proves it and that it is BUMP number 0.' },
  payment: { title: 'Payment transaction', text: 'The raw transaction being sent, last in the BEEF. The flag 00 after it says no BUMP proves it, so the receiver checks it against its parent.' },
};

// tone picks the accent: bump, parent and payment match in both rows.
const chain = [
  { g: 'header', tag: copy.held, title: 'Block header', text: 'The Merkle root of the block at the BUMP height', ghost: true },
  { g: 'bump', tag: copy.inBeef, title: 'BUMP', text: 'The block height, then the hashes from the parent up to the Merkle root', tone: 'bump' },
  { g: 'parent', tag: copy.inBeef, title: 'Parent transaction', text: 'Already mined, so the BUMP proves it is in the block', tone: 'parent' },
  { g: 'payment', tag: 'In the BEEF, last', title: 'Payment transaction', text: 'The transaction being sent, checked against its parent', tone: 'payment' },
];

const links = ['root must match', 'proves', 'is spent by'];

const bytes = [
  { g: 'version', code: '0100beef', note: 'version' },
  { g: 'nbumps', code: '01', note: 'BUMP count' },
  { g: 'bump', code: 'BUMP', note: 'Merkle path', tone: 'bump', wide: true },
  { g: 'ntx', code: '02', note: 'tx count' },
  { g: 'parent', code: 'parent tx', note: 'raw transaction', tone: 'parent', wide: true },
  { g: 'parent', code: '01 00', note: 'has BUMP 0', tone: 'parent' },
  { g: 'payment', code: 'payment tx', note: 'raw transaction', tone: 'payment', wide: true },
  { g: 'payment', code: '00', note: 'no BUMP', tone: 'payment' },
];

const css = `
.bx-eyebrow { margin: 0 0 12px; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--bfx-mute); }
.bx-chain { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr); gap: 0; align-items: stretch; }
.bx-cell { display: flex; }
.bx-node { position: relative; flex: 1; display: flex; flex-direction: column; gap: 6px; padding: 15px 14px 15px; border: 1px solid var(--bfx-line); border-radius: 14px; background: var(--bfx-paper); color: inherit; font: inherit; text-align: left; cursor: pointer; box-shadow: 0 14px 28px -24px rgba(0, 0, 0, 0.4); transition: opacity 0.25s, border-color 0.25s, background 0.25s, box-shadow 0.25s, transform 0.25s; }
.bx-node::before { content: ""; position: absolute; left: 14px; right: 14px; top: 0; height: 3px; border-radius: 0 0 3px 3px; background: var(--bx-tone, var(--bfx-line)); }
.bx-node[data-ghost="true"] { border-style: dashed; background: transparent; box-shadow: none; }
.bx-tag { font-size: 10.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--bx-tone, var(--bfx-mute)); }
.bx-title { margin: 0; font-size: 14.5px; font-weight: 650; line-height: 1.25; }
.bx-text { margin: 0; font-size: 12.5px; line-height: 1.5; color: var(--bfx-mute); }
.bx-link { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; min-width: 64px; padding: 0 4px; color: var(--bfx-mute); }
.bx-link span { max-width: 78px; font-size: 10.5px; font-weight: 600; line-height: 1.25; text-align: center; }
.bx-link svg { width: 30px; height: 12px; flex: none; }
.bx-sep { margin-top: 24px; padding-top: 22px; border-top: 1px solid var(--bfx-line); }
.bx-bytes { display: flex; flex-wrap: wrap; gap: 6px; }
.bx-chunk { display: flex; flex-direction: column; gap: 3px; padding: 8px 10px 7px; border: 1px solid var(--bfx-line); border-radius: 12px; background: var(--bfx-paper); color: inherit; font: inherit; text-align: left; cursor: pointer; transition: opacity 0.25s, border-color 0.25s, background 0.25s, box-shadow 0.25s, transform 0.25s; }
.bx-chunk[data-wide="true"] { flex: 1 1 96px; }
.bx-chunk[data-tone] { border-color: color-mix(in srgb, var(--bx-tone) 55%, var(--bfx-line)); background: color-mix(in srgb, var(--bx-tone) 9%, var(--bfx-paper)); }
.bx-code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px; font-weight: 600; letter-spacing: 0.01em; }
.bx-chunk[data-tone] .bx-code { color: var(--bx-tone); }
.bx-note { font-size: 11px; color: var(--bfx-mute); }
.bx-node:hover, .bx-chunk:hover { border-color: var(--bx-tone, var(--bfx-main)); }
.bx-node:focus-visible, .bx-chunk:focus-visible { outline: 2px solid var(--bfx-main); outline-offset: 2px; }
.bx-node[data-sel="true"], .bx-chunk[data-sel="true"] { border-color: var(--bx-tone, var(--bfx-main)); box-shadow: 0 0 0 3px color-mix(in srgb, var(--bx-tone, var(--bfx-main)) 22%, transparent), 0 16px 30px -22px var(--bx-tone, var(--bfx-main)); transform: translateY(-2px); }
.bx-chunk:not([data-tone])[data-sel="true"] { background: color-mix(in srgb, var(--bfx-main) 9%, var(--bfx-paper)); }
.bx-node[data-dim="true"], .bx-chunk[data-dim="true"] { opacity: 0.42; }
.bx [data-tone="bump"] { --bx-tone: var(--bfx-bump); }
.bx [data-tone="parent"] { --bx-tone: var(--bfx-mined); }
.bx [data-tone="payment"] { --bx-tone: var(--bfx-main); }
@container (max-width: 760px) {
  .bx-chain { grid-template-columns: minmax(0, 1fr); }
  .bx-link { flex-direction: row; justify-content: flex-start; gap: 10px; min-height: 40px; padding: 6px 0 6px 22px; }
  .bx-link span { max-width: none; text-align: left; }
  .bx-link svg { transform: rotate(90deg); }
}
@media (prefers-reduced-motion: reduce) { .bx-node, .bx-chunk { transition: none; } .bx-node[data-sel="true"], .bx-chunk[data-sel="true"] { transform: none; } }
`;

const Arrow = () => (
  <svg viewBox="0 0 30 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 6h27" />
    <path d="M23 1.5 28.5 6 23 10.5" />
  </svg>
);

export default function BeefAnatomy() {
  const [sel, setSel] = useState(null);
  const pick = (g) => setSel((cur) => (cur === g ? null : g));
  const state = (g) => ({ 'data-sel': sel === g ? 'true' : undefined, 'data-dim': sel && sel !== g ? 'true' : undefined, 'aria-pressed': sel === g });

  const status = sel ? `${info[sel].title}. ${info[sel].text}` : copy.idle;
  const live = sel ? `${info[sel].title}. ${info[sel].text}` : '';
  const controls = <button type="button" className="bfx-btn" onClick={() => setSel(null)} disabled={!sel}>{copy.clear}</button>;

  return (
    <BeefFrame hint={copy.hint} label={copy.label} status={status} controls={controls} live={live}>
      <style>{css}</style>
      <div className="bx">
        <p className="bx-eyebrow">{copy.chainEyebrow}</p>
        <div className="bx-chain">
          {chain.map((n, i) => (
            <Fragment key={n.g}>
              <div className="bx-cell">
                <button type="button" className="bx-node" data-ghost={n.ghost ? 'true' : undefined} data-tone={n.tone} onClick={() => pick(n.g)} {...state(n.g)}>
                  <span className="bx-tag">{n.tag}</span>
                  <span className="bx-title">{n.title}</span>
                  <span className="bx-text">{n.text}</span>
                </button>
              </div>
              {i < links.length && (
                <div className="bx-link" aria-hidden="true">
                  <Arrow />
                  <span>{links[i]}</span>
                </div>
              )}
            </Fragment>
          ))}
        </div>

        <div className="bx-sep">
          <p className="bx-eyebrow">{copy.bytesEyebrow}</p>
          <div className="bx-bytes">
            {bytes.map((b, i) => (
              <button type="button" className="bx-chunk" key={i} data-tone={b.tone} data-wide={b.wide ? 'true' : undefined} onClick={() => pick(b.g)} {...state(b.g)}>
                <span className="bx-code">{b.code}</span>
                <span className="bx-note">{b.note}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </BeefFrame>
  );
}
