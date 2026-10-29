import { useState } from 'react';

// BRC-42 step by step: Jane on the left, John on the right, what both get in the middle.
// A switch changes what goes wrong: John uses another invoice number, or a third party tries to derive the key.
// Content only: edit the texts below, the layout does not need to change. The steps follow PrivateKey.deriveChild and PublicKey.deriveChild of @bsv/sdk 4.0.1:
// the shared secret is the same on both sides (ECDH), the HMAC is HMAC-SHA256 keyed by the shared secret over the invoice number, and the child private key is the master key plus the HMAC.

const copy = {
  caseLabel: 'John derives the key with',
  same: 'The same invoice number',
  invoice: 'Another invoice number',
  eve: 'Another private key',
  jane: 'Jane',
  john: 'John',
  shared: 'Both sides',
  back: 'Back',
  step: 'Step',
  reset: 'Reset',
};

const INVOICE = 'order 1042';

function buildSteps(mode) {
  const johnInvoice = mode === 'invoice' ? 'order 1043' : INVOICE;
  const eve = mode === 'eve';
  const bad = mode !== 'same';
  return [
    {
      note: 'Jane and John each hold a master private key and know the other one\'s public key. They agree on the invoice number order 1042.',
      jane: [{ t: 'Jane master private key' }, { t: 'John public key' }],
      john: [{ t: eve ? 'Another private key' : 'John master private key' }, { t: 'Jane public key' }],
      mid: [],
    },
    {
      note: eve
        ? 'Jane multiplies her private key by John\'s public key. A party with another private key gets a different shared secret.'
        : 'Jane multiplies her private key by John\'s public key, and John multiplies his by Jane\'s. Both get the same shared secret.',
      jane: [{ t: 'shared secret', k: 'secret' }],
      john: [{ t: eve ? 'another shared secret' : 'shared secret', k: eve ? 'bad' : 'secret' }],
      mid: [{ t: eve ? 'different' : 'equal', k: eve ? 'bad' : 'ok' }],
    },
    {
      note: `Each side runs an HMAC over the invoice number, keyed by its shared secret. ${bad ? (eve ? 'The two results differ because the shared secrets differ.' : 'John used order 1043, so the two results differ.') : 'The two results are equal.'}`,
      jane: [{ t: `HMAC of ${INVOICE}`, k: 'hmac' }],
      john: [{ t: `HMAC of ${johnInvoice}`, k: bad ? 'bad' : 'hmac' }],
      mid: [{ t: bad ? 'different' : 'equal', k: bad ? 'bad' : 'ok' }],
    },
    {
      note: 'Jane adds her HMAC to her master private key and gets the child private key. John adds his HMAC to Jane\'s master public key and gets the matching child public key.',
      jane: [{ t: 'child private key', k: 'key' }],
      john: [{ t: 'Jane child public key', k: bad ? 'bad' : 'key' }],
      mid: [{ t: bad ? 'do not match' : 'match', k: bad ? 'bad' : 'ok' }],
    },
    {
      note: bad
        ? 'Jane signs with the child private key. John checks the signature with the key he derived, and it does not verify.'
        : 'Jane signs with the child private key. John checks the signature with the child public key he derived, and it verifies.',
      jane: [{ t: 'signature', k: 'sig' }],
      john: [{ t: bad ? 'does not verify' : 'verifies', k: bad ? 'bad' : 'ok' }],
      mid: [],
      end: bad ? 'fail' : 'ok',
    },
  ];
}

const css = `
.dk { container-type: inline-size; margin: 28px 0; padding: 18px; border: 1px solid var(--wd-border); border-radius: 18px; background: linear-gradient(180deg, color-mix(in srgb, var(--wd-primary) 5%, var(--wd-surface)) 0%, var(--wd-surface) 70%); color: var(--wd-text); }
.dk * { box-sizing: border-box; }
.dk-top { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; margin-bottom: 16px; }
.dk-label { font-size: 12.5px; font-weight: 600; color: var(--wd-text-muted); }
.dk-seg { position: relative; display: grid; grid-template-columns: repeat(3, 1fr); padding: 3px; border: 1px solid var(--wd-border); border-radius: 999px; background: var(--wd-surface); }
.dk-thumb { position: absolute; top: 3px; bottom: 3px; left: 3px; width: calc(100% / 3 - 2px); border-radius: 999px; background: var(--wd-primary); transition: transform 0.28s cubic-bezier(0.3, 0.7, 0.2, 1), background-color 0.28s ease; }
.dk-opt { position: relative; z-index: 1; padding: 7px 14px; border: 0; border-radius: 999px; background: transparent; color: var(--wd-text-muted); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; transition: color 0.2s ease; }
.dk-opt[aria-pressed="true"] { color: var(--wd-background); }
.dk-opt:focus-visible, .dk-btn:focus-visible { outline: 2px solid var(--wd-primary); outline-offset: 2px; }
.dk-body { display: grid; grid-template-columns: minmax(0, 1fr) minmax(88px, 0.5fr) minmax(0, 1fr); gap: 12px; align-items: stretch; }
.dk-col { display: flex; flex-direction: column; gap: 8px; min-height: 190px; padding: 14px; border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-background); }
.dk-eyebrow { margin: 0 0 4px; font-size: 11.5px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--wd-text-muted); }
.dk-mid { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; }
.dk-mid::before { content: ''; flex: 1; width: 1px; background: var(--wd-border); }
.dk-mid::after { content: ''; flex: 1; width: 1px; background: var(--wd-border); }
.dk-chip { padding: 8px 10px; border: 1px solid var(--wd-border); border-radius: 10px; background: var(--wd-surface); font-size: 12.5px; line-height: 1.25; animation: dk-in 0.32s cubic-bezier(0.3, 0.7, 0.2, 1) both; }
.dk-chip[data-k="secret"] { border-color: color-mix(in srgb, #7c3aed 60%, var(--wd-border)); background: color-mix(in srgb, #7c3aed 8%, var(--wd-background)); }
.dk-chip[data-k="hmac"] { border-color: color-mix(in srgb, #0f766e 65%, var(--wd-border)); background: color-mix(in srgb, #0f766e 9%, var(--wd-background)); }
.dk-chip[data-k="key"], .dk-chip[data-k="sig"] { border-color: color-mix(in srgb, var(--wd-primary) 55%, var(--wd-border)); background: color-mix(in srgb, var(--wd-primary) 10%, var(--wd-background)); }
.dk-chip[data-k="ok"] { border-color: #15803d; background: color-mix(in srgb, #15803d 14%, var(--wd-background)); font-weight: 700; }
.dk-chip[data-k="bad"] { border-color: #c2410c; background: color-mix(in srgb, #c2410c 12%, var(--wd-background)); font-weight: 600; }
.dk-midchip { padding: 5px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; text-align: center; border: 1px solid; animation: dk-in 0.32s cubic-bezier(0.3, 0.7, 0.2, 1) both; }
.dk-midchip[data-k="ok"] { color: #15803d; border-color: #15803d; }
.dk-midchip[data-k="bad"] { color: #c2410c; border-color: #c2410c; }
.dk-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--wd-border); }
.dk-btns { display: flex; gap: 8px; }
.dk-btn { padding: 8px 16px; border: 1px solid var(--wd-border); border-radius: 999px; background: var(--wd-background); color: var(--wd-text); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 0.2s ease; }
.dk-btn[data-primary="true"] { border-color: var(--wd-primary); background: var(--wd-primary); color: var(--wd-background); }
.dk-btn:disabled { opacity: 0.4; cursor: default; }
.dk-count { font-size: 12.5px; font-weight: 600; color: var(--wd-text-muted); }
.dk-note { flex: 1 1 260px; margin: 0; font-size: 13.5px; line-height: 1.5; }
.dk-status { display: inline-block; margin-right: 8px; padding: 2px 9px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
.dk-status[data-t="ok"] { color: #15803d; border: 1px solid #15803d; }
.dk-status[data-t="fail"] { color: #c2410c; border: 1px solid #c2410c; }
.dk-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@keyframes dk-in { from { opacity: 0; transform: translateY(-10px) scale(0.97); } to { opacity: 1; transform: none; } }
@container (max-width: 640px) {
  .dk-body { grid-template-columns: 1fr; }
  .dk-mid { flex-direction: row; }
  .dk-mid::before, .dk-mid::after { width: auto; height: 1px; }
  .dk-col { min-height: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .dk-thumb, .dk-opt, .dk-btn { transition: none; }
  .dk-chip, .dk-midchip { animation: none; }
}
`;

const cases = ['same', 'invoice', 'eve'];

export default function DeriveSteps() {
  const [mode, setMode] = useState('same');
  const [step, setStep] = useState(0);
  const run = buildSteps(mode);
  const last = run.length - 1;
  const at = Math.min(step, last);
  const cur = run[at];
  const index = cases.indexOf(mode);
  const status = cur.end === 'ok' ? 'Verifies' : cur.end === 'fail' ? 'Rejected' : null;

  return (
    <div className="dk" role="group" aria-label="Step by step BRC-42 key derivation between Jane and John">
      <style>{css}</style>
      <div className="dk-top">
        <span className="dk-label">{copy.caseLabel}</span>
        <div className="dk-seg" role="group" aria-label={copy.caseLabel}>
          <span className="dk-thumb" aria-hidden="true" style={{ transform: `translateX(${index * 100}%)`, background: index === 0 ? undefined : '#c2410c' }} />
          {cases.map((c) => (
            <button key={c} type="button" className="dk-opt" aria-pressed={mode === c} onClick={() => setMode(c)}>{copy[c]}</button>
          ))}
        </div>
      </div>

      <div className="dk-body">
        <div className="dk-col">
          <p className="dk-eyebrow">{copy.jane}</p>
          {cur.jane.map((c, i) => <div key={`${mode}-a-${at}-${i}`} className="dk-chip" data-k={c.k}>{c.t}</div>)}
        </div>
        <div className="dk-mid">
          {cur.mid.map((c, i) => <span key={`${mode}-m-${at}-${i}`} className="dk-midchip" data-k={c.k}>{c.t}</span>)}
        </div>
        <div className="dk-col">
          <p className="dk-eyebrow">{copy.john}</p>
          {cur.john.map((c, i) => <div key={`${mode}-b-${at}-${i}`} className="dk-chip" data-k={c.k}>{c.t}</div>)}
        </div>
      </div>

      <div className="dk-bar">
        <div className="dk-btns">
          <button type="button" className="dk-btn" disabled={at === 0} onClick={() => setStep(at - 1)}>{copy.back}</button>
          <button type="button" className="dk-btn" data-primary="true" disabled={at === last} onClick={() => setStep(at + 1)}>{copy.step}</button>
          <button type="button" className="dk-btn" disabled={at === 0} onClick={() => setStep(0)}>{copy.reset}</button>
        </div>
        <span className="dk-count">{`${at} of ${last}`}</span>
        <p className="dk-note">
          {status ? <span className="dk-status" data-t={cur.end}>{status}</span> : null}
          {cur.note}
        </p>
      </div>

      <p className="dk-sr" aria-live="polite">{`Step ${at} of ${last}. ${cur.note}`}</p>
    </div>
  );
}
