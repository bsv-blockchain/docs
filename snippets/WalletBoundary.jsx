import { useEffect, useState } from 'react';
import WalletFrame from '/snippets/WalletFrame.jsx';

// The BRC-100 line. The reader picks a call and presses Play: the request crosses the line, the wallet works through its steps
// (the key lights up in the steps that use it), and the result comes back. The private key never crosses the line.
// Content only: edit the texts in `copy` and `calls`, the geometry does not need to change. `short` is the label inside the SVG
// (about 22 characters), `text` is the full sentence for the status line.

const copy = {
  label: 'A request from an app crossing the BRC-100 line to a wallet. The wallet checks permissions, works with its private key and returns a result. The private key stays in the wallet.',
  hint: 'Pick a call, then press Play',
  app: 'Your app',
  wallet: 'The wallet',
  line: 'BRC-100',
  noKey: 'Holds no private key',
  hasKey: 'Holds the private key',
  play: 'Play',
  replay: 'Replay',
  reset: 'Reset',
  crossing: 'The request crosses BRC-100 with the call and its arguments. No key goes with it.',
  done: 'The private key stayed in the wallet the whole time.',
};

const calls = [
  {
    name: 'createAction',
    idle: 'The app asks for a transaction: a description and the outputs it wants.',
    steps: [
      { short: 'Checks permissions', text: 'The wallet asks the user to approve, when its permissions require it.' },
      { short: 'Selects the coins', text: 'The wallet selects the coins and sets the fee.' },
      { short: 'Signs with the key', text: 'The wallet signs with the private key.', key: true },
      { short: 'Broadcasts', text: 'The wallet broadcasts the transaction and tracks the result.' },
    ],
    back: 'The txid and the transaction. When your app must sign an input, the wallet stops before signing and returns a signable transaction instead.',
  },
  {
    name: 'getPublicKey',
    idle: 'The app asks for the public key of a protocol, a key ID and a counterparty.',
    steps: [
      { short: 'Checks permissions', text: 'The wallet checks the permission for that protocol.' },
      { short: 'Derives the key', text: 'The wallet derives the key from the private key (BRC-42).', key: true },
    ],
    back: 'The public key.',
  },
  {
    name: 'encrypt',
    idle: 'The app sends the plaintext, the protocol, the key ID and the counterparty.',
    steps: [
      { short: 'Checks permissions', text: 'The wallet checks the permission for that protocol.' },
      { short: 'Derives shared key', text: 'The wallet derives a shared key for the counterparty.', key: true },
      { short: 'Encrypts the data', text: 'The wallet encrypts the data.', key: true },
    ],
    back: 'The ciphertext.',
  },
  {
    name: 'listOutputs',
    idle: 'The app asks for the outputs in a basket.',
    steps: [
      { short: 'Checks permissions', text: 'The wallet checks the permission for that basket.' },
      { short: 'Reads its outputs', text: 'The wallet reads the outputs it tracks.' },
    ],
    back: 'The list of outputs.',
  },
];

const css = `
.wb-svg { min-width: 560px; }
.wb-card { fill: var(--wlx-paper); stroke: var(--wlx-line); stroke-width: 1.5; }
.wb-card[data-who="app"] { stroke: color-mix(in srgb, var(--wlx-app) 55%, var(--wlx-line)); fill: color-mix(in srgb, var(--wlx-app) 5%, var(--wlx-paper)); }
.wb-card[data-who="wallet"] { stroke: color-mix(in srgb, var(--wlx-wallet) 55%, var(--wlx-line)); fill: color-mix(in srgb, var(--wlx-wallet) 5%, var(--wlx-paper)); }
.wb-eyebrow { fill: var(--wlx-mute); font-size: 10.5px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }
.wb-mono { fill: var(--wlx-app); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 15px; font-weight: 700; }
.wb-note { fill: var(--wlx-mute); font-size: 11.5px; }
.wb-lane { fill: none; stroke: var(--wlx-line); stroke-width: 1.5; stroke-dasharray: 4 5; }
.wb-line { stroke: color-mix(in srgb, var(--wlx-app) 60%, var(--wlx-line)); stroke-width: 1.5; stroke-dasharray: 2 6; stroke-linecap: round; }
.wb-pill rect { fill: var(--wlx-paper); stroke: var(--wlx-app); stroke-width: 1.5; }
.wb-pill text { fill: var(--wlx-app); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; font-weight: 700; text-anchor: middle; dominant-baseline: central; }
.wb-packet { transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s; }
.wb-dot { fill: var(--wlx-app); }
.wb-halo { fill: color-mix(in srgb, var(--wlx-app) 22%, transparent); }
.wb-packet[data-back="true"] .wb-dot { fill: var(--wlx-wallet); }
.wb-packet[data-back="true"] .wb-halo { fill: color-mix(in srgb, var(--wlx-wallet) 22%, transparent); }
.wb-step rect { fill: var(--wlx-paper); stroke: var(--wlx-line); stroke-width: 1.5; transition: fill 0.35s, stroke 0.35s; }
.wb-step text { fill: var(--wlx-mute); font-size: 12px; font-weight: 600; dominant-baseline: central; transition: fill 0.35s; }
.wb-step .wb-n { font-size: 11px; font-weight: 700; text-anchor: middle; }
.wb-step circle { fill: var(--wlx-paper); stroke: var(--wlx-line); stroke-width: 1.5; transition: fill 0.35s, stroke 0.35s; }
.wb-step[data-s="done"] rect { stroke: color-mix(in srgb, var(--wlx-wallet) 55%, var(--wlx-line)); }
.wb-step[data-s="done"] text { fill: var(--wlx-ink); }
.wb-step[data-s="now"] rect { fill: color-mix(in srgb, var(--wlx-wallet) 14%, var(--wlx-paper)); stroke: var(--wlx-wallet); stroke-width: 2.5; }
.wb-step[data-s="now"] text { fill: var(--wlx-wallet); }
.wb-step[data-s="now"] circle { stroke: var(--wlx-wallet); fill: var(--wlx-wallet); }
.wb-step[data-s="now"] .wb-n { fill: var(--wlx-paper); }
.wb-step[data-key="true"][data-s="now"] rect { fill: color-mix(in srgb, var(--wlx-key) 14%, var(--wlx-paper)); stroke: var(--wlx-key); }
.wb-step[data-key="true"][data-s="now"] text { fill: var(--wlx-key); }
.wb-step[data-key="true"][data-s="now"] circle { stroke: var(--wlx-key); fill: var(--wlx-key); }
.wb-step[data-key="true"][data-s="now"] .wb-n { fill: var(--wlx-paper); }
.wb-key { fill: none; stroke: var(--wlx-mute); stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; transition: stroke 0.35s; }
.wb-keyring { fill: none; stroke: var(--wlx-key); stroke-width: 2; opacity: 0; transition: opacity 0.35s; }
.wb-keywrap[data-on="true"] .wb-key { stroke: var(--wlx-key); }
.wb-keywrap[data-on="true"] .wb-keyring { opacity: 1; }
.wb-cross { stroke: var(--wlx-bad); stroke-width: 2; stroke-linecap: round; }
@media (prefers-reduced-motion: reduce) { .wb-packet, .wb-step rect, .wb-step text, .wb-step circle, .wb-key, .wb-keyring { transition: none; } }
`;

const KeyIcon = ({ x, y, crossed, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <circle className="wb-key" cx="7" cy="7" r="6" />
    <path className="wb-key" d="M12 11 L25 24 M20 19 L24 15 M23 22 L27 18" />
    {crossed && <path className="wb-cross" d="M-2 28 L30 -4" />}
  </g>
);

const PACKET_FROM = 212;
const PACKET_TO = 494;

export default function WalletBoundary() {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(false);
  const call = calls[idx];
  const n = call.steps.length;
  const last = n + 2; // 0 idle, 1 request crosses, 2..n+1 wallet steps, n+2 result returns

  useEffect(() => {
    if (!playing) return undefined;
    if (phase >= last) {
      setPlaying(false);
      return undefined;
    }
    const t = setTimeout(() => setPhase((p) => p + 1), 900);
    return () => clearTimeout(t);
  }, [playing, phase, last]);

  const pick = (i) => {
    setIdx(i);
    setPhase(0);
    setPlaying(false);
  };
  const play = () => {
    setPhase(1);
    setPlaying(true);
  };
  const reset = () => {
    setPhase(0);
    setPlaying(false);
  };

  const stepIndex = phase - 2;
  const current = stepIndex >= 0 && stepIndex < n ? call.steps[stepIndex] : null;
  const keyOn = !!current?.key;

  let status = call.idle;
  if (phase === 1) status = copy.crossing;
  else if (current) status = current.text;
  else if (phase === last) status = `${call.back} ${copy.done}`;

  const controls = (
    <>
      <button type="button" className="wlx-btn" data-primary="true" onClick={play} disabled={playing}>{phase >= last ? copy.replay : copy.play}</button>
      <button type="button" className="wlx-btn" onClick={reset} disabled={phase === 0 && !playing}>{copy.reset}</button>
    </>
  );

  const rowY = (i) => 88 + i * 50;
  const reqX = phase === 1 ? PACKET_TO : PACKET_FROM;

  return (
    <WalletFrame hint={copy.hint} label={copy.label} status={status} controls={controls} live={`${phase} of ${last}. ${status}`}>
      <style>{css}</style>
      <div className="wlx-chips" role="group" aria-label="Choose a BRC-100 call">
        {calls.map((c, i) => (
          <button key={c.name} type="button" className="wlx-chip" data-mono="true" aria-pressed={i === idx} onClick={() => pick(i)}>{c.name}</button>
        ))}
      </div>
      <div className="wlx-wrap">
        <svg className="wlx-svg wb-svg" viewBox="0 0 720 340" role="presentation">
          <rect className="wb-card" data-who="app" x="20" y="20" width="180" height="300" rx="12" />
          <text className="wb-eyebrow" x="40" y="52">{copy.app}</text>
          <text className="wb-mono" x="40" y="96">{call.name}</text>
          <text className="wb-note" x="40" y="120">asks, and waits</text>
          <KeyIcon x={40} y={262} crossed />
          <text className="wb-note" x="82" y="278">{copy.noKey}</text>

          <path className="wb-lane" d="M 204 130 H 502" />
          <path className="wb-lane" d="M 502 210 H 204" />
          <line className="wb-line" x1="360" y1="14" x2="360" y2="326" />
          <g className="wb-pill">
            <rect x="312" y="156" width="96" height="28" rx="14" />
            <text x="360" y="170.5">{copy.line}</text>
          </g>

          <g className="wb-packet" data-back="false" style={{ transform: `translate(${reqX}px, 130px)`, opacity: phase === 1 ? 1 : 0 }}>
            <circle className="wb-halo" r="15" />
            <circle className="wb-dot" r="7" />
          </g>
          <g className="wb-packet" data-back="true" style={{ transform: `translate(${phase >= last ? PACKET_FROM : PACKET_TO}px, 210px)`, opacity: phase >= last ? 1 : 0 }}>
            <circle className="wb-halo" r="15" />
            <circle className="wb-dot" r="7" />
          </g>

          <rect className="wb-card" data-who="wallet" x="504" y="20" width="200" height="300" rx="12" />
          <text className="wb-eyebrow" x="524" y="52">{copy.wallet}</text>
          <g className="wb-keywrap" data-on={keyOn ? 'true' : 'false'}>
            <circle className="wb-keyring" cx="671" cy="52" r="17" />
            <KeyIcon x={659} y={41.4} scale={0.85} />
          </g>
          {call.steps.map((s, i) => {
            const state = stepIndex === i ? 'now' : stepIndex > i || phase >= last ? 'done' : 'idle';
            return (
              <g className="wb-step" key={s.short} data-s={state} data-key={s.key ? 'true' : undefined}>
                <rect x="520" y={rowY(i)} width="168" height="38" rx="9" />
                <circle cx="540" cy={rowY(i) + 19} r="9" />
                <text className="wb-n" x="540" y={rowY(i) + 19.5}>{i + 1}</text>
                <text x="558" y={rowY(i) + 19.5}>{s.short}</text>
              </g>
            );
          })}
          <text className="wb-note" x="524" y="304">{copy.hasKey}</text>
        </svg>
      </div>
    </WalletFrame>
  );
}
