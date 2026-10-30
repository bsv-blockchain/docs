import { useEffect, useState } from 'react';
import WalletFrame from '/snippets/WalletFrame.jsx';

// How WalletClient('auto') finds a wallet. The reader switches substrates on and off (an "on" substrate answers) and presses Play:
// the probe goes to the five fast substrates at once, the answers come back, and the first one in the order that answers is kept.
// XDM is asked last, only when none of the five answered. Order and waits follow WalletClient.connectToSubstrate in @bsv/sdk 4.0.1 and 3.2.1.
// Content only: edit the texts in `copy` and `substrates`, the geometry follows the row count.

const copy = {
  label: 'WalletClient asks five substrates at once for the wallet version, keeps the first one in the list that answers, and asks XDM last when none answered.',
  hint: 'Switch substrates on or off, then press Play',
  client: 'Your app',
  clientCall: "WalletClient('auto')",
  clientNote: 'asks getVersion',
  lastResort: 'Last resort, only if none answered',
  chosen: 'Kept',
  alsoAnswers: 'Also answers',
  noAnswer: 'No answer',
  play: 'Play',
  replay: 'Replay',
  reset: 'Reset',
  idle: 'Switch a substrate on to say that a wallet answers there. WalletClient asks the first five at once and gives each up to 1 s.',
  probing: 'WalletClient sends getVersion to the five substrates at once.',
  fail: 'No substrate answered. The call fails with No wallet available over any communication substrate.',
};

const substrates = [
  { id: 'cwi', name: 'window.CWI', where: 'Injected in the page' },
  { id: 'wire', name: 'Wallet wire', where: 'http://localhost:3301' },
  { id: 'secure', name: 'JSON API, secure', where: 'https://localhost:2121' },
  { id: 'json', name: 'JSON API', where: 'http://localhost:3321' },
  { id: 'rn', name: 'React Native WebView', where: 'postMessage bridge' },
];
const xdm = { id: 'xdm', name: 'XDM', where: 'Cross-document postMessage' };

const presets = [
  { label: 'Only the JSON API', on: ['json'] },
  { label: 'Only the bridge', on: ['rn'] },
  { label: 'Two answer', on: ['wire', 'json'] },
  { label: 'Only XDM', on: ['xdm'] },
  { label: 'None', on: [] },
];

const css = `
.sp-svg { min-width: 560px; }
.sp-client { fill: color-mix(in srgb, var(--wlx-app) 5%, var(--wlx-paper)); stroke: color-mix(in srgb, var(--wlx-app) 55%, var(--wlx-line)); stroke-width: 1.5; transition: stroke 0.35s, fill 0.35s; }
.sp-client[data-bad="true"] { stroke: var(--wlx-bad); fill: color-mix(in srgb, var(--wlx-bad) 7%, var(--wlx-paper)); }
.sp-eyebrow { fill: var(--wlx-mute); font-size: 10.5px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }
.sp-mono { fill: var(--wlx-app); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px; font-weight: 700; }
.sp-note { fill: var(--wlx-mute); font-size: 11.5px; }
.sp-base { fill: none; stroke: var(--wlx-line); stroke-width: 1.5; }
.sp-base[data-x="true"] { stroke-dasharray: 4 5; }
.sp-draw { fill: none; stroke: var(--wlx-app); stroke-width: 2; stroke-linecap: round; stroke-dasharray: 1; stroke-dashoffset: 1; opacity: 0; transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s, stroke 0.35s, stroke-width 0.35s; }
.sp-draw[data-on="true"] { stroke-dashoffset: 0; opacity: 1; }
.sp-draw[data-r="yes"] { stroke: var(--wlx-wallet); }
.sp-draw[data-r="kept"] { stroke: var(--wlx-app); stroke-width: 3.5; }
.sp-draw[data-r="no"] { opacity: 0.25; }
.sp-row { cursor: pointer; outline: none; }
.sp-box { fill: var(--wlx-paper); stroke: var(--wlx-line); stroke-width: 1.5; transition: fill 0.35s, stroke 0.35s, stroke-width 0.35s; }
.sp-row:hover .sp-box { stroke: var(--wlx-app); }
.sp-row:focus-visible .sp-box { stroke: var(--wlx-app); stroke-width: 3; }
.sp-row[data-on="true"] .sp-box { stroke: color-mix(in srgb, var(--wlx-wallet) 60%, var(--wlx-line)); }
.sp-row[data-r="yes"] .sp-box { fill: color-mix(in srgb, var(--wlx-wallet) 10%, var(--wlx-paper)); stroke: var(--wlx-wallet); }
.sp-row[data-r="kept"] .sp-box { fill: color-mix(in srgb, var(--wlx-app) 12%, var(--wlx-paper)); stroke: var(--wlx-app); stroke-width: 3; }
.sp-row[data-r="no"] .sp-box { stroke-dasharray: 4 4; }
.sp-row[data-r="no"] .sp-name, .sp-row[data-r="no"] .sp-where { opacity: 0.5; }
.sp-name { fill: var(--wlx-ink); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; font-weight: 700; }
.sp-where { fill: var(--wlx-mute); font-size: 10.5px; }
.sp-tag { fill: var(--wlx-mute); font-size: 11px; font-weight: 700; text-anchor: end; }
.sp-row[data-r="kept"] .sp-tag { fill: var(--wlx-app); }
.sp-row[data-r="yes"] .sp-tag { fill: var(--wlx-wallet); }
.sp-track { fill: var(--wlx-line); transition: fill 0.25s; }
.sp-row[data-on="true"] .sp-track { fill: var(--wlx-wallet); }
.sp-knob { fill: var(--wlx-paper); transition: transform 0.25s; }
.sp-row[data-on="true"] .sp-knob { transform: translateX(16px); }
.sp-sep { fill: var(--wlx-mute); font-size: 10.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; text-anchor: middle; }
@media (prefers-reduced-motion: reduce) { .sp-draw, .sp-box, .sp-track, .sp-knob, .sp-client { transition: none; } }
`;

const ROW_X = 400;
const ROW_W = 300;
const ROW_H = 44;
const rowY = (i) => 14 + i * 54;
const XDM_Y = 330;
const CLIENT = { x: 14, y: 86, w: 196, h: 130 };

const curve = (x1, y1, x2, y2) => {
  const m = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${m} ${y1}, ${m} ${y2}, ${x2} ${y2}`;
};

export default function SubstrateProbe() {
  const [on, setOn] = useState(['json']);
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(false);

  const fastOn = substrates.filter((s) => on.includes(s.id));
  const winner = fastOn[0] ?? null; // first of the five, in order
  const xdmOn = on.includes('xdm');
  const last = winner ? 3 : 4; // 0 idle, 1 probe, 2 answers, 3 verdict, 4 XDM verdict when none of the five answered

  useEffect(() => {
    if (!playing) return undefined;
    if (phase >= last) {
      setPlaying(false);
      return undefined;
    }
    const t = setTimeout(() => setPhase((p) => p + 1), 950);
    return () => clearTimeout(t);
  }, [playing, phase, last]);

  const change = (next) => {
    setOn(next);
    setPhase(0);
    setPlaying(false);
  };
  const toggle = (id) => change(on.includes(id) ? on.filter((x) => x !== id) : [...on, id]);
  const play = () => {
    setPhase(1);
    setPlaying(true);
  };

  // result of a fast row: none until the answers come back (phase 2), then kept, yes or no.
  const result = (s) => {
    if (phase < 2) return undefined;
    if (!on.includes(s.id)) return 'no';
    return winner?.id === s.id && phase >= 3 ? 'kept' : 'yes';
  };
  const xdmResult = () => {
    if (!winner && phase >= 4) return xdmOn ? 'kept' : 'no';
    if (winner && phase >= 3) return undefined;
    return undefined;
  };

  let status = copy.idle;
  if (phase === 1) status = copy.probing;
  else if (phase === 2) status = `${fastOn.length} of the 5 answered.`;
  else if (phase === 3 && winner) status = `WalletClient keeps ${winner.name}, the first one in the list that answers. It does not ask XDM.`;
  else if (phase === 3) status = 'None of the five answered, so WalletClient asks XDM last, with a 200 ms wait.';
  else if (phase === 4) status = xdmOn ? 'XDM answered, so WalletClient uses it.' : copy.fail;

  const failed = !winner && phase >= 4 && !xdmOn;

  const controls = (
    <>
      <button type="button" className="wlx-btn" data-primary="true" onClick={play} disabled={playing}>{phase >= last ? copy.replay : copy.play}</button>
      <button type="button" className="wlx-btn" onClick={() => change(on)} disabled={phase === 0 && !playing}>{copy.reset}</button>
    </>
  );

  const startX = CLIENT.x + CLIENT.w;
  const startY = CLIENT.y + CLIENT.h / 2;

  const row = (s, y, r) => {
    const answers = on.includes(s.id);
    const tag = r === 'kept' ? copy.chosen : r === 'yes' ? copy.alsoAnswers : r === 'no' ? copy.noAnswer : '';
    const onKey = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggle(s.id);
      }
    };
    return (
      <g key={s.id} className="sp-row" role="switch" aria-checked={answers} aria-label={`${s.name}, ${s.where}`} tabIndex={0} data-on={answers ? 'true' : 'false'} data-r={r} onClick={() => toggle(s.id)} onKeyDown={onKey}>
        <rect className="sp-box" x={ROW_X} y={y} width={ROW_W} height={ROW_H} rx="9" />
        <text className="sp-name" x={ROW_X + 14} y={y + 19}>{s.name}</text>
        <text className="sp-where" x={ROW_X + 14} y={y + 34}>{s.where}</text>
        <text className="sp-tag" x={ROW_X + ROW_W - 62} y={y + 26}>{tag}</text>
        <rect className="sp-track" x={ROW_X + ROW_W - 50} y={y + 13} width="36" height="18" rx="9" />
        <circle className="sp-knob" cx={ROW_X + ROW_W - 41} cy={y + 22} r="6.5" />
      </g>
    );
  };

  return (
    <WalletFrame hint={copy.hint} label={copy.label} status={status} controls={controls} live={status}>
      <style>{css}</style>
      <div className="wlx-chips" role="group" aria-label="Example setups">
        {presets.map((p) => {
          const active = p.on.length === on.length && p.on.every((id) => on.includes(id));
          return (
            <button key={p.label} type="button" className="wlx-chip" aria-pressed={active} onClick={() => change(p.on)}>{p.label}</button>
          );
        })}
      </div>
      <div className="wlx-wrap">
        <svg className="wlx-svg sp-svg" viewBox="0 0 720 384" role="presentation">
          <rect className="sp-client" data-bad={failed ? 'true' : 'false'} x={CLIENT.x} y={CLIENT.y} width={CLIENT.w} height={CLIENT.h} rx="12" />
          <text className="sp-eyebrow" x={CLIENT.x + 18} y={CLIENT.y + 30}>{copy.client}</text>
          <text className="sp-mono" x={CLIENT.x + 18} y={CLIENT.y + 62}>{copy.clientCall}</text>
          <text className="sp-note" x={CLIENT.x + 18} y={CLIENT.y + 84}>{copy.clientNote}</text>

          {substrates.map((s, i) => {
            const d = curve(startX, startY, ROW_X, rowY(i) + ROW_H / 2);
            const r = result(s);
            return (
              <g key={s.id}>
                <path className="sp-base" d={d} />
                <path className="sp-draw" d={d} pathLength="1" data-on={phase >= 1 ? 'true' : 'false'} data-r={r} />
              </g>
            );
          })}
          {(() => {
            const d = curve(startX, startY + 24, ROW_X, XDM_Y + ROW_H / 2);
            return (
              <g>
                <path className="sp-base" data-x="true" d={d} />
                <path className="sp-draw" d={d} pathLength="1" data-on={!winner && phase >= 3 ? 'true' : 'false'} data-r={xdmResult()} />
              </g>
            );
          })()}

          {substrates.map((s, i) => row(s, rowY(i), result(s)))}
          <text className="sp-sep" x={ROW_X + ROW_W / 2} y={XDM_Y - 14}>{copy.lastResort}</text>
          {row(xdm, XDM_Y, xdmResult())}
        </svg>
      </div>
    </WalletFrame>
  );
}
