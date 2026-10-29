import { useState } from 'react';

// BRC-43 invoice number builder: pick a security level, type a protocol name and a key ID, pick a counterparty.
// The checks that run live are the ones KeyDeriver of @bsv/sdk 4.0.1 enforces, all run against the SDK. The BRC-43 text says 280 characters, the SDK accepts up to 400.
// Content only: edit the texts below, the layout does not need to change.

const copy = {
  level: 'Security level',
  protocol: 'Protocol name',
  keyId: 'Key ID',
  counterparty: 'Counterparty',
  result: 'Invoice number',
  checks: 'Checks of KeyDeriver',
  asks: 'The wallet asks the user',
};

const levels = [
  { v: 0, ask: 'Nothing. Level 0 needs no approval.' },
  { v: 1, ask: 'Once for the app and the protocol, for any counterparty.' },
  { v: 2, ask: 'Once for the app, the protocol and each counterparty.' },
];

const parties = [
  { key: 'self', name: 'self', text: 'The wallet derives from its own key. Only the user needs the result.' },
  { key: 'anyone', name: 'anyone', text: 'The derivation uses the publicly known private key 1, so anyone can derive the same public key.' },
  { key: 'other', name: 'Another party', text: 'The wallet needs their identity public key. They derive the matching key with yours.' },
];

function checksFor(name, keyId) {
  const norm = name.toLowerCase();
  return [
    { id: 'len', text: 'At least 5 characters', ok: name.length >= 5 },
    { id: 'dbl', text: 'No double spaces', ok: !name.includes('  ') },
    { id: 'suffix', text: 'Does not end in "protocol"', ok: !norm.trim().endsWith(' protocol') && norm.trim() !== 'protocol' },
    { id: 'chars', text: 'Letters, numbers and spaces only', ok: /^[A-Za-z0-9 ]*$/.test(name) },
    { id: 'max', text: 'At most 400 characters', ok: name.length <= 400 },
    { id: 'key', text: 'Key ID has at least 1 character', ok: keyId.length >= 1 },
  ];
}

const css = `
.ib { container-type: inline-size; margin: 28px 0; padding: 18px; border: 1px solid var(--wd-border); border-radius: 18px; background: linear-gradient(180deg, color-mix(in srgb, var(--wd-primary) 5%, var(--wd-surface)) 0%, var(--wd-surface) 70%); color: var(--wd-text); }
.ib * { box-sizing: border-box; }
.ib-result { margin: 0 0 16px; padding: 14px 16px; border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-background); }
.ib-eyebrow { margin: 0 0 8px; font-size: 11.5px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--wd-text-muted); }
.ib-inv { margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 17px; line-height: 1.4; word-break: break-word; }
.ib-p { padding: 1px 6px; border-radius: 6px; transition: background-color 0.25s ease; }
.ib-p[data-p="level"] { background: color-mix(in srgb, #7c3aed 14%, var(--wd-surface)); }
.ib-p[data-p="name"] { background: color-mix(in srgb, var(--wd-primary) 14%, var(--wd-surface)); }
.ib-p[data-p="key"] { background: color-mix(in srgb, #0f766e 14%, var(--wd-surface)); }
.ib-inv[data-ok="false"] { opacity: 0.55; }
.ib-sep { color: var(--wd-text-muted); }
.ib-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 14px; }
.ib-card { display: flex; flex-direction: column; gap: 12px; padding: 14px; border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-background); }
.ib-field { display: flex; flex-direction: column; gap: 6px; }
.ib-label { font-size: 12.5px; font-weight: 600; color: var(--wd-text-muted); }
.ib-input { width: 100%; padding: 8px 10px; border: 1px solid var(--wd-border); border-radius: 10px; background: var(--wd-surface); color: var(--wd-text); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px; }
.ib-input:focus-visible { outline: 2px solid var(--wd-primary); outline-offset: 1px; }
.ib-seg { position: relative; display: grid; padding: 3px; border: 1px solid var(--wd-border); border-radius: 999px; background: var(--wd-surface); }
.ib-thumb { position: absolute; top: 3px; bottom: 3px; left: 3px; border-radius: 999px; background: var(--wd-primary); transition: transform 0.28s cubic-bezier(0.3, 0.7, 0.2, 1); }
.ib-opt { position: relative; z-index: 1; padding: 7px 8px; border: 0; border-radius: 999px; background: transparent; color: var(--wd-text-muted); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; transition: color 0.2s ease; }
.ib-opt[aria-pressed="true"] { color: var(--wd-background); }
.ib-opt:focus-visible { outline: 2px solid var(--wd-primary); outline-offset: 2px; }
.ib-text { margin: 0; font-size: 13px; line-height: 1.5; }
.ib-checks { display: flex; flex-direction: column; gap: 6px; margin: 0; padding: 0; list-style: none; }
.ib-checks li { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 12.5px; line-height: 1.35; }
.ib-mark { flex: none; display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 999px; font-size: 11px; font-weight: 800; border: 1px solid; }
.ib-mark[data-ok="true"] { color: #15803d; border-color: #15803d; background: color-mix(in srgb, #15803d 12%, var(--wd-background)); }
.ib-mark[data-ok="false"] { color: #c2410c; border-color: #c2410c; background: color-mix(in srgb, #c2410c 12%, var(--wd-background)); }
.ib-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@container (max-width: 640px) { .ib-grid { grid-template-columns: 1fr; } }
@media (prefers-reduced-motion: reduce) { .ib-thumb, .ib-opt, .ib-p { transition: none; } }
`;

function Segmented({ label, items, value, onChange, cols }) {
  const index = items.findIndex((x) => x.key === value);
  return (
    <div className="ib-seg" role="group" aria-label={label} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      <span className="ib-thumb" aria-hidden="true" style={{ width: `calc(100% / ${cols} - 2px)`, transform: `translateX(${index * 100}%)` }} />
      {items.map((x) => (
        <button key={x.key} type="button" className="ib-opt" aria-pressed={value === x.key} onClick={() => onChange(x.key)}>{x.name}</button>
      ))}
    </div>
  );
}

export default function InvoiceBuilder() {
  const [level, setLevel] = useState(2);
  const [name, setName] = useState('order receipts');
  const [keyId, setKeyId] = useState('1042');
  const [party, setParty] = useState('other');
  const checks = checksFor(name, keyId);
  const valid = checks.every((c) => c.ok);
  const p = parties.find((x) => x.key === party);
  const lv = levels.find((x) => x.v === level);
  const summary = `${level}-${name}-${keyId}`;

  return (
    <div className="ib" role="group" aria-label="Build a BRC-43 invoice number from a security level, a protocol name and a key ID">
      <style>{css}</style>

      <div className="ib-result">
        <p className="ib-eyebrow">{copy.result}</p>
        <p className="ib-inv" data-ok={valid}>
          <span className="ib-p" data-p="level">{level}</span>
          <span className="ib-sep">-</span>
          <span className="ib-p" data-p="name">{name || ' '}</span>
          <span className="ib-sep">-</span>
          <span className="ib-p" data-p="key">{keyId || ' '}</span>
        </p>
      </div>

      <div className="ib-grid">
        <div className="ib-card">
          <div className="ib-field">
            <span className="ib-label">{copy.level}</span>
            <Segmented label={copy.level} cols={3} value={level} onChange={setLevel} items={levels.map((x) => ({ key: x.v, name: String(x.v) }))} />
          </div>
          <label className="ib-field">
            <span className="ib-label">{copy.protocol}</span>
            <input className="ib-input" type="text" value={name} onChange={(e) => setName(e.target.value)} spellCheck={false} autoComplete="off" />
          </label>
          <label className="ib-field">
            <span className="ib-label">{copy.keyId}</span>
            <input className="ib-input" type="text" value={keyId} onChange={(e) => setKeyId(e.target.value)} spellCheck={false} autoComplete="off" />
          </label>
          <p className="ib-label">{copy.checks}</p>
          <ul className="ib-checks" aria-label={copy.checks}>
            {checks.map((c) => (
              <li key={c.id}>
                <span className="ib-mark" data-ok={c.ok} aria-hidden="true">{c.ok ? '✓' : '✕'}</span>
                <span>{c.text}<span className="ib-sr">{c.ok ? ', passes' : ', fails'}</span></span>
              </li>
            ))}
          </ul>
        </div>

        <div className="ib-card">
          <div className="ib-field">
            <span className="ib-label">{copy.counterparty}</span>
            <Segmented label={copy.counterparty} cols={3} value={party} onChange={setParty} items={parties} />
          </div>
          <p className="ib-text">{p.text}</p>
          <div className="ib-field">
            <span className="ib-label">{copy.asks}</span>
            <p className="ib-text">{lv.ask}</p>
          </div>
        </div>
      </div>

      <p className="ib-sr" aria-live="polite">{`Invoice number ${summary}. ${valid ? 'All checks pass.' : 'Some checks fail.'} Counterparty ${p.name}. ${lv.ask}`}</p>
    </div>
  );
}
