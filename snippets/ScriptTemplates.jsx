import { useState } from 'react';

// Script templates: pick a template and see what lock and unlock take and return.
// Content only: edit the texts below, the layout does not need to change.
// The fields of PushDrop show the example bytes of the page (hello, world). Source: P2PKH, PushDrop and RPuzzle of @bsv/sdk 4.0.1. Locking scripts as printed by toASM(), sizes from estimateLength().

const templates = [
  {
    key: 'p2pkh',
    name: 'P2PKH',
    pitch: 'One public key hash',
    call: 'new P2PKH()',
    lockArgs: ['address'],
    lockParams: [['address', 'a P2PKH address, such as the one from toAddress()']],
    lock: [
      { t: 'OP_DUP' }, { t: 'OP_HASH160' }, { t: '20 byte hash', d: true }, { t: 'OP_EQUALVERIFY' }, { t: 'OP_CHECKSIG' },
    ],
    unlockArgs: ['privateKey'],
    unlock: [{ t: 'signature', d: true }, { t: 'public key', d: true }],
    size: 108,
  },
  {
    key: 'pushdrop',
    name: 'PushDrop',
    pitch: 'Data fields and a key',
    call: 'new PushDrop(wallet)',
    lockArgs: ['fields', 'protocolID', 'keyID', 'counterparty'],
    lockParams: [
      ['fields', 'one array of bytes per data field'],
      ['protocolID', '[securityLevel, name]: a level of 0, 1 or 2, and a name of 5 to 400 bytes'],
      ['keyID', 'a string that picks the key under that protocol'],
      ['counterparty', "'self', 'anyone' or a public key in hex"],
    ],
    unlockNote: 'The same protocolID, keyID and counterparty as lock.',
    lock: [
      { t: 'public key', d: true }, { t: 'OP_CHECKSIG' }, { t: 'field: hello', d: true }, { t: 'field: world', d: true }, { t: 'signature', d: true }, { t: 'OP_2DROP' }, { t: 'OP_DROP' },
    ],
    unlockArgs: ['protocolID', 'keyID', 'counterparty'],
    unlock: [{ t: 'signature', d: true }],
    size: 73,
  },
  {
    key: 'rpuzzle',
    name: 'RPuzzle',
    pitch: 'A secret K value',
    call: "new RPuzzle('HASH160')",
    lockArgs: ['value'],
    lockParams: [['value', 'the R value, or its hash, as an array of bytes']],
    lock: [
      { t: 'OP_OVER' }, { t: 'OP_3' }, { t: 'OP_SPLIT' }, { t: 'OP_NIP' }, { t: 'OP_1' }, { t: 'OP_SPLIT' }, { t: 'OP_SWAP' }, { t: 'OP_SPLIT' }, { t: 'OP_DROP' }, { t: 'OP_HASH160' }, { t: '20 byte hash', d: true }, { t: 'OP_EQUALVERIFY' }, { t: 'OP_CHECKSIG' },
    ],
    unlockArgs: ['k', 'privateKey'],
    unlock: [{ t: 'signature', d: true }, { t: 'public key', d: true }],
    size: 108,
  },
];

const MAX = 120;

const copy = {
  lock: 'lock',
  lockReturns: 'returns a locking script',
  unlock: 'unlock',
  unlockReturns: 'returns an object',
  sign: 'sign',
  signText: 'builds the unlocking script for one input, once the transaction exists',
  estimate: 'estimateLength',
  estimateText: 'returns the expected size in bytes, before any signature exists',
  locking: 'Locking script',
  unlocking: 'Unlocking script from sign',
  size: 'Estimated size',
  bytes: 'bytes',
};

const css = `
.st { container-type: inline-size; margin: 28px 0; padding: 18px; border: 1px solid var(--wd-border); border-radius: 18px; background: linear-gradient(180deg, color-mix(in srgb, var(--wd-primary) 5%, var(--wd-surface)) 0%, var(--wd-surface) 70%); color: var(--wd-text); }
.st * { box-sizing: border-box; }
.st-tabs { position: relative; display: grid; grid-template-columns: repeat(3, 1fr); padding: 3px; border: 1px solid var(--wd-border); border-radius: 999px; background: var(--wd-surface); }
.st-thumb { position: absolute; top: 3px; bottom: 3px; left: 3px; width: calc(100% / 3 - 2px); border-radius: 999px; background: var(--wd-primary); transition: transform 0.28s cubic-bezier(0.3, 0.7, 0.2, 1); }
.st-tab { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 1px; padding: 7px 8px; border: 0; border-radius: 999px; background: transparent; color: var(--wd-text-muted); font: inherit; cursor: pointer; transition: color 0.2s ease; }
.st-tab[aria-pressed="true"] { color: var(--wd-background); }
.st-tab:focus-visible { outline: 2px solid var(--wd-primary); outline-offset: 2px; }
.st-tabname { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px; font-weight: 700; }
.st-tabpitch { font-size: 11.5px; opacity: 0.85; }
.st-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 14px; margin-top: 16px; }
.st-card { display: flex; flex-direction: column; gap: 12px; padding: 14px; border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-background); }
.st-sig { margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px; line-height: 1.5; word-break: break-word; }
.st-fn { font-weight: 700; color: var(--wd-primary); }
.st-arg { padding: 1px 6px; border-radius: 6px; background: color-mix(in srgb, var(--wd-primary) 10%, var(--wd-surface)); }
.st-params { display: flex; flex-direction: column; gap: 6px; margin: 0; padding: 0; list-style: none; }
.st-params li { margin: 0; font-size: 12.5px; line-height: 1.45; }
.st-params b { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12.5px; }
.st-ret { margin: 0; font-size: 12.5px; color: var(--wd-text-muted); }
.st-sub { margin: 0; font-size: 12.5px; line-height: 1.45; }
.st-sub b { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12.5px; }
.st-eyebrow { margin: 0; font-size: 11.5px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--wd-text-muted); }
.st-chunks { display: flex; flex-wrap: wrap; gap: 6px; min-height: 36px; }
.st-chunk { padding: 5px 9px; border: 1px solid var(--wd-border); border-radius: 9px; background: var(--wd-surface); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; line-height: 1.2; animation: st-in 0.3s cubic-bezier(0.3, 0.7, 0.2, 1) both; }
.st-chunk[data-d="true"] { font-family: inherit; border-style: dashed; border-color: color-mix(in srgb, var(--wd-primary) 55%, var(--wd-border)); background: color-mix(in srgb, var(--wd-primary) 8%, var(--wd-surface)); }
.st-bar { position: relative; height: 12px; border-radius: 999px; background: var(--wd-surface); border: 1px solid var(--wd-border); overflow: hidden; }
.st-fill { position: absolute; inset: 0 auto 0 0; border-radius: 999px; background: var(--wd-primary); transition: width 0.45s cubic-bezier(0.3, 0.7, 0.2, 1); }
.st-size { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; font-size: 12.5px; color: var(--wd-text-muted); }
.st-size strong { font-size: 20px; color: var(--wd-text); font-variant-numeric: tabular-nums; }
.st-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@keyframes st-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@container (max-width: 620px) {
  .st-grid { grid-template-columns: 1fr; }
  .st-tabpitch { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .st-thumb, .st-tab, .st-fill { transition: none; }
  .st-chunk { animation: none; }
}
`;

function Signature({ fn, args }) {
  return (
    <p className="st-sig">
      <span className="st-fn">{fn}</span>
      {'('}
      {args.map((a, i) => (
        <span key={a}>{i > 0 ? ', ' : ''}<span className="st-arg">{a}</span></span>
      ))}
      {')'}
    </p>
  );
}

export default function ScriptTemplates() {
  const [pick, setPick] = useState('p2pkh');
  const index = templates.findIndex((x) => x.key === pick);
  const t = templates[index];

  return (
    <div className="st" role="group" aria-label="Script templates: what lock and unlock take and return for P2PKH, PushDrop and RPuzzle">
      <style>{css}</style>

      <div className="st-tabs" style={{ '--i': index }}>
        <span className="st-thumb" aria-hidden="true" style={{ transform: `translateX(${index * 100}%)` }} />
        {templates.map((x) => (
          <button key={x.key} type="button" className="st-tab" aria-pressed={pick === x.key} onClick={() => setPick(x.key)}>
            <span className="st-tabname">{x.name}</span>
            <span className="st-tabpitch">{x.pitch}</span>
          </button>
        ))}
      </div>

      <div className="st-grid" key={t.key}>
        <div className="st-card">
          <Signature fn={`${t.call}.${copy.lock}`} args={t.lockArgs} />
          <ul className="st-params">
            {t.lockParams.map(([n, d]) => (
              <li key={n}><b>{n}</b> {d}</li>
            ))}
          </ul>
          <p className="st-ret">{copy.lockReturns}</p>
          <p className="st-eyebrow">{copy.locking}</p>
          <div className="st-chunks">
            {t.lock.map((c, i) => (
              <span key={`${c.t}-${i}`} className="st-chunk" data-d={c.d ? 'true' : undefined} style={{ animationDelay: `${i * 35}ms` }}>{c.t}</span>
            ))}
          </div>
        </div>

        <div className="st-card">
          <Signature fn={`${t.call}.${copy.unlock}`} args={t.unlockArgs} />
          {t.unlockNote ? <p className="st-sub">{t.unlockNote}</p> : null}
          <p className="st-ret">{copy.unlockReturns}</p>
          <p className="st-sub"><b>{copy.sign}</b> {copy.signText}</p>
          <p className="st-eyebrow">{copy.unlocking}</p>
          <div className="st-chunks">
            {t.unlock.map((c, i) => (
              <span key={`${c.t}-${i}`} className="st-chunk" data-d="true" style={{ animationDelay: `${i * 35}ms` }}>{c.t}</span>
            ))}
          </div>
          <p className="st-sub"><b>{copy.estimate}</b> {copy.estimateText}</p>
          <div className="st-size">
            <span>{copy.size}</span>
            <strong>{t.size} <span style={{ fontSize: 12.5, fontWeight: 400 }}>{copy.bytes}</span></strong>
          </div>
          <div className="st-bar" aria-hidden="true"><span className="st-fill" style={{ width: `${(t.size / MAX) * 100}%` }} /></div>
        </div>
      </div>

      <p className="st-sr" aria-live="polite">{`${t.name}: lock takes ${t.lockArgs.join(', ')}. unlock takes ${t.unlockArgs.join(', ')} and returns sign and estimateLength, which estimates ${t.size} bytes.`}</p>
    </div>
  );
}
