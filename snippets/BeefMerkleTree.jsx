import { useEffect, useState } from 'react';
import BeefFrame from '/snippets/BeefFrame.jsx';

// The proof of inclusion. A block of eight transactions as a Merkle tree. The reader selects a transaction, and the tree shows the hashes
// its BUMP keeps (amber) and the hashes the receiver computes from them (teal) until it reaches the root that the block header holds.
// A switch sets whether the header root matches. When it does not, the BEEF is rejected there and nothing else is read (BRC-62).
// Content only: edit the texts in `copy`, the geometry follows `LEAVES`.

const copy = {
  label: 'A block of eight transactions drawn as a Merkle tree. Selecting a transaction shows the hashes its BUMP keeps, the hashes the receiver computes from them, and the comparison of the computed root with the root in the block header.',
  hint: 'Select a transaction, then press Play',
  header: 'Block header',
  headerRoot: 'Merkle root',
  root: 'root',
  selected: 'Selected transaction',
  kept: 'Hash kept in the BUMP',
  computed: 'Hash the receiver computes',
  switchLabel: 'The root in the block header',
  matches: 'Matches',
  differs: 'Differs',
  play: 'Play',
  replay: 'Replay',
  reset: 'Reset',
};

const LEAVES = 8;
const LEVELS = 3; // 8 leaves, 4, 2, 1
const X0 = 52;
const GAP = 88;
const W = 64;
const H = 34;
const Y = [338, 258, 178, 98];
const HEAD = { x: 360, y: 14, w: 232, h: 44 };
const VIEW = { w: 712, h: 372 };

const cx = (level, n) => {
  const span = 2 ** level;
  return X0 + (n * span + (span - 1) / 2) * GAP;
};
const label = (level, n) => (level === 0 ? `tx ${n}` : level === LEVELS ? copy.root : `H ${n * 2 ** level}-${n * 2 ** level + 2 ** level - 1}`);

const status = (phase, i, differs) => {
  if (phase === 0) return `tx ${i} is selected. To prove it, the BUMP keeps only the three hashes marked in amber, out of the eight transactions in this block.`;
  if (phase === 1) return `Start from the transaction ID of tx ${i}.`;
  if (phase === 2) return 'Hash it with its sibling, the first hash in the BUMP.';
  if (phase === 3) return 'Hash the result with the next sibling from the BUMP.';
  if (phase === 4) return 'Hash once more. The result is the computed Merkle root.';
  if (differs) return 'Compare it with the Merkle root in the block header, at the height the BUMP records. They do not match, so the BEEF is rejected here and nothing else in it is read.';
  return `Compare it with the Merkle root in the block header, at the height the BUMP records. They match, so tx ${i} is in the block.`;
};

const css = `
.bm-top { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; margin-bottom: 14px; }
.bm-sw { font-size: 12.5px; font-weight: 600; color: var(--bfx-mute); }
.bm-seg { position: relative; display: grid; grid-template-columns: 1fr 1fr; padding: 3px; border: 1px solid var(--bfx-line); border-radius: 999px; background: var(--bfx-paper); }
.bm-thumb { position: absolute; top: 3px; bottom: 3px; left: 3px; width: calc(50% - 3px); border-radius: 999px; background: var(--bfx-main); transition: transform 0.28s cubic-bezier(0.3, 0.8, 0.3, 1), background 0.28s; }
.bm-seg[data-v="differs"] .bm-thumb { transform: translateX(100%); background: var(--bfx-bad); }
.bm-opt { position: relative; z-index: 1; padding: 6px 14px; border: 0; border-radius: 999px; background: transparent; color: var(--bfx-mute); font: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; transition: color 0.2s; }
.bm-opt[aria-pressed="true"] { color: var(--bfx-paper); }
.bm-opt:focus-visible { outline: 2px solid var(--bfx-main); outline-offset: 2px; }
.bm-wrap { overflow-x: auto; }
.bm-svg { display: block; width: 100%; min-width: 560px; height: auto; }
.bm-edge { fill: none; stroke: var(--bfx-line); stroke-width: 1.5; transition: stroke 0.35s, stroke-width 0.35s; }
.bm-edge[data-r="kept"] { stroke: var(--bfx-bump); stroke-width: 2; }
.bm-edge[data-r="calc"] { stroke: var(--bfx-mined); stroke-width: 2.5; }
.bm-edge[data-r="head"] { stroke-dasharray: 4 4; }
.bm-edge[data-r="head"][data-s="ok"] { stroke: var(--bfx-ok); stroke-dasharray: none; stroke-width: 2.5; }
.bm-edge[data-r="head"][data-s="bad"] { stroke: var(--bfx-bad); stroke-dasharray: none; stroke-width: 2.5; }
.bm-g { transition: opacity 0.35s; }
.bm-g[data-dim="true"] { opacity: 0.4; }
.bm-node { fill: var(--bfx-paper); stroke: var(--bfx-line); stroke-width: 1.5; transition: fill 0.35s, stroke 0.35s; }
.bm-g[data-r="sel"] .bm-node { fill: color-mix(in srgb, var(--bfx-main) 14%, var(--bfx-paper)); stroke: var(--bfx-main); stroke-width: 2.5; }
.bm-g[data-r="kept"] .bm-node { fill: color-mix(in srgb, var(--bfx-bump) 14%, var(--bfx-paper)); stroke: var(--bfx-bump); stroke-width: 2; }
.bm-g[data-r="calc"] .bm-node { fill: color-mix(in srgb, var(--bfx-mined) 16%, var(--bfx-paper)); stroke: var(--bfx-mined); stroke-width: 2.5; }
.bm-g[data-r="bad"] .bm-node { fill: color-mix(in srgb, var(--bfx-bad) 16%, var(--bfx-paper)); stroke: var(--bfx-bad); stroke-width: 2.5; }
.bm-g[data-r="ok"] .bm-node { fill: color-mix(in srgb, var(--bfx-ok) 18%, var(--bfx-paper)); stroke: var(--bfx-ok); stroke-width: 2.5; }
.bm-text { fill: var(--bfx-ink); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; font-weight: 600; text-anchor: middle; dominant-baseline: central; pointer-events: none; }
.bm-g[data-r="sel"] .bm-text { fill: var(--bfx-main); }
.bm-g[data-r="kept"] .bm-text { fill: var(--bfx-bump); }
.bm-g[data-r="calc"] .bm-text { fill: var(--bfx-mined); }
.bm-g[data-r="ok"] .bm-text { fill: var(--bfx-ok); }
.bm-g[data-r="bad"] .bm-text { fill: var(--bfx-bad); }
.bm-leaf { cursor: pointer; }
.bm-leaf:hover .bm-node { stroke: var(--bfx-main); }
.bm-leaf:focus-visible { outline: none; }
.bm-leaf:focus-visible .bm-node { stroke: var(--bfx-main); stroke-width: 3; }
.bm-head rect { fill: var(--bfx-paper); stroke: var(--bfx-line); stroke-width: 1.5; stroke-dasharray: 5 4; transition: stroke 0.35s, fill 0.35s; }
.bm-head[data-s="ok"] rect { stroke: var(--bfx-ok); stroke-dasharray: none; stroke-width: 2.5; fill: color-mix(in srgb, var(--bfx-ok) 12%, var(--bfx-paper)); }
.bm-head[data-s="bad"] rect { stroke: var(--bfx-bad); stroke-dasharray: none; stroke-width: 2.5; fill: color-mix(in srgb, var(--bfx-bad) 11%, var(--bfx-paper)); }
.bm-head .bm-t1 { fill: var(--bfx-mute); font-size: 10.5px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; text-anchor: middle; dominant-baseline: central; }
.bm-head .bm-t2 { fill: var(--bfx-ink); font-size: 12px; font-weight: 600; text-anchor: middle; dominant-baseline: central; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
.bm-legend { display: flex; flex-wrap: wrap; gap: 8px 22px; margin-top: 14px; font-size: 12.5px; color: var(--bfx-mute); }
.bm-key { display: inline-flex; align-items: center; gap: 8px; }
.bm-key i { width: 14px; height: 14px; border-radius: 5px; border: 2px solid var(--k); background: color-mix(in srgb, var(--k) 16%, var(--bfx-paper)); }
@media (prefers-reduced-motion: reduce) { .bm-edge, .bm-g, .bm-node, .bm-head rect, .bm-thumb, .bm-opt { transition: none; } }
`;

export default function BeefMerkleTree() {
  const [leaf, setLeaf] = useState(5);
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [differs, setDiffers] = useState(false);

  useEffect(() => {
    if (!playing) return undefined;
    if (phase >= 5) {
      setPlaying(false);
      return undefined;
    }
    const t = setTimeout(() => setPhase((p) => p + 1), 720);
    return () => clearTimeout(t);
  }, [playing, phase]);

  const pick = (i) => {
    setLeaf(i);
    setPhase(0);
    setPlaying(false);
  };
  const setHeader = (v) => {
    setDiffers(v);
    setPhase(0);
    setPlaying(false);
  };
  const play = () => {
    setPhase(1);
    setPlaying(true);
  };

  // role of the node at (level, n): sel, kept, calc, ok or none.
  const role = (level, n) => {
    const onPath = n === leaf >> level;
    const sibling = level < LEVELS && n === ((leaf >> level) ^ 1);
    if (level === 0 && onPath) return 'sel';
    if (sibling) return 'kept';
    if (onPath && level > 0) {
      if (level === LEVELS) return phase >= 5 ? (differs ? 'bad' : 'ok') : phase >= 4 ? 'calc' : 'none';
      return phase >= level + 1 ? 'calc' : 'none';
    }
    return 'none';
  };
  const involved = (level, n) => role(level, n) !== 'none';

  const nodes = [];
  for (let level = 0; level <= LEVELS; level += 1) {
    for (let n = 0; n < LEAVES >> level; n += 1) nodes.push({ level, n });
  }

  const edges = [];
  for (let level = 0; level < LEVELS; level += 1) {
    for (let n = 0; n < LEAVES >> level; n += 1) {
      const parent = n >> 1;
      const onPath = n === leaf >> level;
      const sibling = n === ((leaf >> level) ^ 1);
      let r;
      if (onPath) r = phase >= level + 2 ? 'calc' : undefined;
      else if (sibling) r = 'kept';
      const x1 = cx(level, n);
      const y1 = Y[level] - H / 2;
      const x2 = cx(level + 1, parent);
      const y2 = Y[level + 1] + H / 2;
      const m = (y1 + y2) / 2;
      edges.push({ key: `${level}-${n}`, d: `M ${x1} ${y1} C ${x1} ${m}, ${x2} ${m}, ${x2} ${y2}`, r });
    }
  }

  const done = phase >= 5;
  const headState = done ? (differs ? 'bad' : 'ok') : 'idle';
  const rootX = cx(LEVELS, 0);

  const controls = (
    <>
      <button type="button" className="bfx-btn" data-primary="true" onClick={play} disabled={playing}>{done ? copy.replay : copy.play}</button>
      <button type="button" className="bfx-btn" onClick={() => pick(leaf)} disabled={phase === 0 && !playing}>{copy.reset}</button>
    </>
  );

  return (
    <BeefFrame hint={copy.hint} label={copy.label} status={status(phase, leaf, differs)} controls={controls} live={`${phase} of 5. ${done ? (differs ? 'The computed root does not match the header root, the BEEF is rejected.' : 'The computed root matches the header root.') : ''}`}>
      <style>{css}</style>
      <div className="bm-top">
        <span className="bm-sw">{copy.switchLabel}</span>
        <div className="bm-seg" data-v={differs ? 'differs' : 'matches'} role="group" aria-label={copy.switchLabel}>
          <span className="bm-thumb" aria-hidden="true" />
          <button type="button" className="bm-opt" aria-pressed={!differs} onClick={() => setHeader(false)}>{copy.matches}</button>
          <button type="button" className="bm-opt" aria-pressed={differs} onClick={() => setHeader(true)}>{copy.differs}</button>
        </div>
      </div>
      <div className="bm-wrap">
        <svg className="bm-svg" viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} role="presentation">
          <path className="bm-edge" data-r="head" data-s={headState} d={`M ${rootX} ${Y[LEVELS] - H / 2} L ${rootX} ${HEAD.y + HEAD.h}`} />
          <g className="bm-head" data-s={headState} transform={`translate(${rootX - HEAD.w / 2} ${HEAD.y})`}>
            <rect width={HEAD.w} height={HEAD.h} rx="12" />
            <text className="bm-t1" x={HEAD.w / 2} y="15">{copy.header}</text>
            <text className="bm-t2" x={HEAD.w / 2} y="31">{copy.headerRoot}</text>
          </g>

          {edges.map((e) => (
            <path key={e.key} className="bm-edge" data-r={e.r} d={e.d} />
          ))}

          {nodes.map(({ level, n }) => {
            const r = role(level, n);
            const x = cx(level, n) - W / 2;
            const y = Y[level] - H / 2;
            const isLeaf = level === 0;
            const common = { className: isLeaf ? 'bm-g bm-leaf' : 'bm-g', 'data-r': r === 'none' ? undefined : r, 'data-dim': String(!involved(level, n)), transform: `translate(${x} ${y})` };
            const body = (
              <>
                <rect className="bm-node" width={W} height={H} rx="10" />
                <text className="bm-text" x={W / 2} y={H / 2 + 1}>{label(level, n)}</text>
              </>
            );
            return isLeaf ? (
              <g key={`${level}-${n}`} {...common} role="button" tabIndex={0} aria-label={`${label(level, n)}${n === leaf ? ', selected' : ''}`} aria-pressed={n === leaf} onClick={() => pick(n)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(n); } }}>{body}</g>
            ) : (
              <g key={`${level}-${n}`} {...common}>{body}</g>
            );
          })}
        </svg>
      </div>
      <div className="bm-legend" aria-hidden="true">
        <span className="bm-key" style={{ '--k': 'var(--bfx-main)' }}><i />{copy.selected}</span>
        <span className="bm-key" style={{ '--k': 'var(--bfx-bump)' }}><i />{copy.kept}</span>
        <span className="bm-key" style={{ '--k': 'var(--bfx-mined)' }}><i />{copy.computed}</span>
      </div>
    </BeefFrame>
  );
}
