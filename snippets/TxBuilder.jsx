import { useState } from 'react';

// Content only: edit the text here, the layout below does not need to change.
// The coins, the amounts and the address hashes are stand-ins. Nothing here is signed or sent.
// The bytes follow the field tables on the page: version, input count, inputs, output count, outputs, locktime.

const coins = [
  { id: 'A', sats: 600, txid: 'a3f1c2d4e5b60718293a4b5c6d7e8f90112233445566778899aabbccddeeff00' },
  { id: 'B', sats: 400, txid: 'b7e2d1c0f9a8978675645342312011ffeeddccbbaa99887766554433221100ab' },
  { id: 'C', sats: 1000, txid: 'c9d8e7f6a5b4c3d2e1f00112233445566778899aabbccddeeff0011223344556' },
];

const GOAL = { pay: 700, maxFee: 20 };
const ALEX = '1122334455667788990011223344556677889900'; // stand-in address hash of the payee
const YOU = 'aabbccddeeff00112233445566778899aabbccdd'; // stand-in address hash for the change

const copy = {
  goal: `Pay Jane ${GOAL.pay} satoshis with a fee of ${GOAL.maxFee} or less.`,
  spend: 'Coins to spend',
  send: 'Outputs',
  alex: 'Jane',
  change: 'Change to you',
  rest: 'Use the rest',
  bytes: 'Unsigned transaction',
  legend: [
    { kind: 'plain', label: 'Version, locktime' },
    { kind: 'count', label: 'Counts, lengths' },
    { kind: 'in', label: 'Input fields' },
    { kind: 'out', label: 'Output fields' },
  ],
  hover: 'Hover a field to see what it is',
};

const sats = (n) => n.toLocaleString('en-US');
const le = (n, size) => Array.from({ length: size }, (_, i) => Number((BigInt(n) >> BigInt(8 * i)) & 255n).toString(16).padStart(2, '0')).join('');
const varint = (n) => le(n, 1);
const lock = (hash) => `76a914${hash}88ac`;

function layout(selected, change) {
  const parts = [{ kind: 'plain', label: 'Version, 4 bytes', hex: '01000000' }];
  parts.push({ kind: 'count', label: 'Input count, 1 byte', hex: varint(selected.length) });
  selected.forEach((c, i) => {
    parts.push({ kind: 'in', label: `Input ${i + 1}: previous transaction ID, 32 bytes`, hex: c.txid });
    parts.push({ kind: 'in', label: `Input ${i + 1}: output index, 4 bytes`, hex: '00000000' });
    parts.push({ kind: 'count', label: `Input ${i + 1}: unlocking script length, 1 byte (empty until signed)`, hex: '00' });
    parts.push({ kind: 'in', label: `Input ${i + 1}: sequence, 4 bytes`, hex: 'ffffffff' });
  });
  const outputs = [{ who: 'Jane', value: GOAL.pay, hash: ALEX }];
  if (change > 0) outputs.push({ who: 'change', value: change, hash: YOU });
  parts.push({ kind: 'count', label: 'Output count, 1 byte', hex: varint(outputs.length) });
  outputs.forEach((o, i) => {
    parts.push({ kind: 'out', label: `Output ${i + 1} (${o.who}): satoshis, 8 bytes`, hex: le(o.value, 8) });
    parts.push({ kind: 'count', label: `Output ${i + 1} (${o.who}): locking script length, 1 byte`, hex: '19' });
    parts.push({ kind: 'out', label: `Output ${i + 1} (${o.who}): locking script, 25 bytes`, hex: lock(o.hash) });
  });
  parts.push({ kind: 'plain', label: 'Locktime, 4 bytes', hex: '00000000' });
  return parts;
}

const shown = (hex) => (hex.length > 18 ? `${hex.slice(0, 6)}...${hex.slice(-4)}` : hex);

const css = `
.tb { container-type: inline-size; margin: 20px 0; display: flex; flex-direction: column; gap: 12px; color: var(--wd-text); font-size: 13px; }
.tb * { box-sizing: border-box; }
.tb-panel { display: flex; flex-direction: column; gap: 12px; padding: 14px; border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-surface); }
.tb-goal { margin: 0; font-weight: 600; }
.tb-cols { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 14px; }
.tb-label { display: block; margin-bottom: 6px; color: var(--wd-text-muted); font-size: 12px; }
.tb-coins { display: flex; flex-wrap: wrap; gap: 8px; }
.tb-coin { display: inline-flex; align-items: baseline; gap: 6px; padding: 6px 12px; border: 1px solid var(--wd-border); border-radius: 999px; background: var(--wd-background); color: var(--wd-text); font: inherit; cursor: pointer; transition: border-color 0.2s ease, background-color 0.2s ease; }
.tb-coin:hover { border-color: color-mix(in srgb, var(--wd-primary) 60%, var(--wd-border)); }
.tb-coin[aria-pressed="true"] { border-color: var(--wd-primary); background: color-mix(in srgb, var(--wd-primary) 12%, var(--wd-background)); }
.tb-coin-id { color: var(--wd-text-muted); font-size: 11.5px; font-weight: 600; }
.tb-coin-sats { font-weight: 600; }
.tb-coin:focus-visible, .tb-btn:focus-visible, .tb-in:focus-visible, .tb-byte:focus-visible { outline: 2px solid var(--wd-primary); outline-offset: 2px; }
.tb-line { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 30px; }
.tb-line + .tb-line { margin-top: 4px; }
.tb-in { width: 86px; padding: 3px 8px; border: 1px solid var(--wd-border); border-radius: 8px; background: var(--wd-background); color: var(--wd-text); font: inherit; text-align: right; }
.tb-btn { padding: 2px 10px; border: 1px solid var(--wd-border); border-radius: 999px; background: var(--wd-background); color: var(--wd-text-muted); font: inherit; font-size: 12px; cursor: pointer; transition: border-color 0.2s ease; }
.tb-btn:hover:not(:disabled) { border-color: var(--wd-primary); color: var(--wd-text); }
.tb-btn:disabled { opacity: 0.5; cursor: default; }
.tb-meter { display: flex; flex-direction: column; gap: 6px; }
.tb-bar { display: flex; height: 10px; overflow: hidden; border-radius: 999px; background: color-mix(in srgb, var(--wd-text-muted) 14%, transparent); }
.tb-seg { height: 100%; transition: flex-grow 0.3s ease; }
.tb-seg-alex { background: var(--wd-primary); }
.tb-seg-change { background: color-mix(in srgb, var(--wd-primary) 40%, transparent); }
.tb-seg-fee { background: #d99a2b; }
.tb-keys { display: flex; flex-wrap: wrap; gap: 4px 14px; color: var(--wd-text-muted); font-size: 12px; }
.tb-key { display: inline-flex; align-items: center; gap: 5px; }
.tb-dot { width: 8px; height: 8px; border-radius: 50%; }
.tb-status { margin: 0; padding: 6px 10px; border-radius: 8px; border-left: 3px solid var(--tb-edge); background: color-mix(in srgb, var(--tb-edge) 9%, transparent); }
.tb-status[data-state="ok"] { --tb-edge: #3aa17a; }
.tb-status[data-state="todo"] { --tb-edge: var(--wd-text-muted); }
.tb-status[data-state="bad"] { --tb-edge: #d6455d; }
.tb-bytes { display: flex; flex-wrap: wrap; gap: 3px; }
.tb-byte { padding: 1px 6px; border: 1px solid transparent; border-radius: 6px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11px; cursor: default; }
.tb-byte[data-kind="plain"] { background: color-mix(in srgb, var(--wd-text-muted) 16%, transparent); }
.tb-byte[data-kind="count"] { background: color-mix(in srgb, #d99a2b 22%, transparent); }
.tb-byte[data-kind="in"] { background: color-mix(in srgb, var(--wd-primary) 18%, transparent); }
.tb-byte[data-kind="out"] { background: color-mix(in srgb, #3aa17a 22%, transparent); }
.tb-byte[data-on="true"] { border-color: var(--wd-text); }
.tb-foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 4px 14px; margin-top: 6px; color: var(--wd-text-muted); font-size: 12px; }
.tb-sw { display: inline-block; width: 10px; height: 10px; border-radius: 3px; }
@container (max-width: 560px) {
  .tb-cols { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .tb-coin, .tb-seg, .tb-btn { transition: none; }
}
`;

export default function TxBuilder() {
  const [picked, setPicked] = useState([]);
  const [change, setChange] = useState(0);
  const [info, setInfo] = useState(null);

  const selected = coins.filter((c) => picked.includes(c.id));
  const inTotal = selected.reduce((n, c) => n + c.sats, 0);
  const outTotal = GOAL.pay + change;
  const fee = inTotal - outTotal;
  const parts = layout(selected, change);
  const byteCount = parts.reduce((n, p) => n + p.hex.length / 2, 0);

  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const setChangeValue = (v) => setChange(Math.max(0, Math.min(99999, Math.floor(Number(v) || 0))));
  const rest = Math.max(0, inTotal - GOAL.pay);

  let status;
  if (!selected.length) status = { text: 'Select at least one coin to spend.', state: 'todo' };
  else if (inTotal < GOAL.pay) status = { text: `The coins hold ${sats(inTotal)} satoshis, not enough to pay ${sats(GOAL.pay)}.`, state: 'bad' };
  else if (fee < 0) status = { text: `The outputs are ${sats(-fee)} satoshis larger than the inputs, so the transaction is invalid.`, state: 'bad' };
  else if (fee > GOAL.maxFee) status = { text: `The fee is ${sats(fee)} satoshis. Send the difference back to yourself as change.`, state: 'todo' };
  else if (fee === 0) status = { text: 'The fee is 0. Leave a few satoshis for the miner.', state: 'todo' };
  else status = { text: `Done. ${sats(GOAL.pay)} to Jane, ${sats(change)} back to you, fee ${sats(fee)} satoshis.`, state: 'ok' };

  const total = Math.max(inTotal, outTotal, 1);
  const grow = (n) => ({ flexGrow: Math.max(0, n), flexShrink: 0, flexBasis: 0 });

  return (
    <div className="tb" role="group" aria-label={`Build a transaction: ${copy.goal}`}>
      <style>{css}</style>
      <div className="tb-panel">
        <p className="tb-goal">{copy.goal}</p>

        <div className="tb-cols">
          <div>
            <span className="tb-label">{copy.spend}</span>
            <div className="tb-coins">
              {coins.map((c) => (
                <button key={c.id} type="button" className="tb-coin" aria-pressed={picked.includes(c.id)} onClick={() => toggle(c.id)}>
                  <span className="tb-coin-id">{c.id}</span>
                  <span className="tb-coin-sats">{sats(c.sats)}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="tb-label">{copy.send}</span>
            <div className="tb-line"><span>{copy.alex}</span><span>{sats(GOAL.pay)}</span></div>
            <div className="tb-line">
              <label htmlFor="tb-change">{copy.change}</label>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <button type="button" className="tb-btn" disabled={!selected.length} onClick={() => setChange(rest)}>{copy.rest}</button>
                <input id="tb-change" className="tb-in" type="number" min="0" value={change} onChange={(e) => setChangeValue(e.target.value)} />
              </span>
            </div>
          </div>
        </div>

        <div className="tb-meter">
          <div className="tb-bar" role="img" aria-label={`Inputs ${sats(inTotal)} satoshis: ${sats(GOAL.pay)} to Jane, ${sats(change)} change, ${sats(Math.max(fee, 0))} fee`}>
            <span className="tb-seg tb-seg-alex" style={grow(GOAL.pay / total)} />
            <span className="tb-seg tb-seg-change" style={grow(change / total)} />
            <span className="tb-seg tb-seg-fee" style={grow(Math.max(fee, 0) / total)} />
          </div>
          <div className="tb-keys">
            <span className="tb-key"><span className="tb-dot" style={{ background: 'var(--wd-primary)' }} />Jane {sats(GOAL.pay)}</span>
            <span className="tb-key"><span className="tb-dot" style={{ background: 'color-mix(in srgb, var(--wd-primary) 40%, transparent)' }} />Change {sats(change)}</span>
            <span className="tb-key"><span className="tb-dot" style={{ background: '#d99a2b' }} />Fee {sats(Math.max(fee, 0))}</span>
            <span className="tb-key">Inputs {sats(inTotal)}</span>
          </div>
        </div>

        <p className="tb-status" data-state={status.state} aria-live="polite">{status.text}</p>

        <div>
          <span className="tb-label">{copy.bytes}, {byteCount} bytes</span>
          <div className="tb-bytes">
            {parts.map((p, i) => (
              <span
                key={i}
                className="tb-byte"
                data-kind={p.kind}
                data-on={info === i}
                tabIndex={0}
                title={p.label}
                aria-label={`${p.label}: ${p.hex}`}
                onMouseEnter={() => setInfo(i)}
                onMouseLeave={() => setInfo(null)}
                onFocus={() => setInfo(i)}
                onBlur={() => setInfo(null)}
              >
                {shown(p.hex)}
              </span>
            ))}
          </div>
          <div className="tb-foot">
            <span>{info !== null && parts[info] ? parts[info].label : copy.hover}</span>
            <span className="tb-keys">
              {copy.legend.map((l) => (
                <span key={l.kind} className="tb-key"><span className="tb-sw tb-byte" data-kind={l.kind} />{l.label}</span>
              ))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
