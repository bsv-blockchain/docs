import { useState } from 'react';

// Step by step run of a P2PKH spend for "How Script works": the two scripts on the left, the stack on the right, one button to run the next chunk.
// A switch picks the key that made the unlocking script. The owner key passes, another key stops at OP_EQUALVERIFY.
// Content only: edit the texts below, the layout does not need to change. The steps follow Spend.step() of @bsv/sdk 4.0.1, 2026-10-29.

const copy = {
  keyLabel: 'The unlocking script was made with',
  owner: 'The owner key',
  other: 'Another key',
  unlocking: 'Unlocking script',
  locking: 'Locking script',
  stack: 'Stack',
  top: 'top',
  empty: 'empty',
  back: 'Back',
  step: 'Step',
  reset: 'Reset',
};

const chunks = [
  { id: 'sig', script: 'unlocking', text: 'signature', data: true },
  { id: 'pk', script: 'unlocking', text: 'public key', data: true },
  { id: 'dup', script: 'locking', text: 'OP_DUP' },
  { id: 'h160', script: 'locking', text: 'OP_HASH160' },
  { id: 'addr', script: 'locking', text: 'hash from the address', data: true },
  { id: 'eqv', script: 'locking', text: 'OP_EQUALVERIFY' },
  { id: 'chk', script: 'locking', text: 'OP_CHECKSIG' },
];

const item = (k, label) => ({ k, label });

function buildSteps(other) {
  const pk = item(other ? 'other' : 'pk', other ? 'public key of another key' : 'public key');
  const hashed = item(other ? 'other' : 'hash', other ? 'hash of that key' : 'hash of the key');
  const sig = item('sig', 'signature');
  const addr = item('hash', 'hash from the address');
  const steps = [
    { stack: [], note: 'Both scripts are ready and the stack is empty. The unlocking script runs first.' },
    { stack: [sig], note: 'The unlocking script pushes the signature.' },
    { stack: [sig, pk], note: 'It pushes the public key.' },
    { stack: [sig, pk, pk], note: 'The locking script starts. OP_DUP copies the top item, the public key.' },
    { stack: [sig, pk, hashed], note: 'OP_HASH160 replaces the copy with its hash.' },
    { stack: [sig, pk, hashed, addr], note: 'The locking script pushes the hash that is in the address.' },
  ];
  if (other) {
    steps.push({ stack: [sig, pk, hashed, addr], fail: true, note: 'OP_EQUALVERIFY compares the two hashes. They differ, so the script stops with an error and OP_CHECKSIG never runs.' });
  } else {
    steps.push({ stack: [sig, pk], note: 'OP_EQUALVERIFY finds the two hashes equal and removes them.' });
    steps.push({ stack: [item('ok', '01')], ok: true, note: 'OP_CHECKSIG checks the signature against the public key and the transaction. It leaves 01 on top, so the spend is valid.' });
  }
  return steps;
}

const css = `
.sp { container-type: inline-size; margin: 28px 0; padding: 18px; border: 1px solid var(--wd-border); border-radius: 18px; background: linear-gradient(180deg, color-mix(in srgb, var(--wd-primary) 5%, var(--wd-surface)) 0%, var(--wd-surface) 70%); color: var(--wd-text); }
.sp * { box-sizing: border-box; }
.sp-top { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; margin-bottom: 16px; }
.sp-keylabel { font-size: 12.5px; font-weight: 600; color: var(--wd-text-muted); }
.sp-seg { position: relative; display: grid; grid-template-columns: 1fr 1fr; padding: 3px; border: 1px solid var(--wd-border); border-radius: 999px; background: var(--wd-surface); }
.sp-thumb { position: absolute; top: 3px; bottom: 3px; left: 3px; width: calc(50% - 3px); border-radius: 999px; background: var(--wd-primary); transition: transform 0.28s cubic-bezier(0.3, 0.7, 0.2, 1), background-color 0.28s ease; }
.sp-seg[data-v="other"] .sp-thumb { transform: translateX(100%); background: #c2410c; }
.sp-opt { position: relative; z-index: 1; padding: 7px 14px; border: 0; border-radius: 999px; background: transparent; color: var(--wd-text-muted); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; transition: color 0.2s ease; }
.sp-opt[aria-pressed="true"] { color: var(--wd-background); }
.sp-opt:focus-visible, .sp-btn:focus-visible { outline: 2px solid var(--wd-primary); outline-offset: 2px; }
.sp-body { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 16px; align-items: stretch; }
.sp-scripts { display: flex; flex-direction: column; gap: 12px; }
.sp-card { padding: 14px; border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-background); }
.sp-eyebrow { margin: 0 0 10px; font-size: 11.5px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--wd-text-muted); }
.sp-chunks { display: flex; flex-wrap: wrap; gap: 8px; }
.sp-chunk { position: relative; padding: 7px 11px; border: 1px solid var(--wd-border); border-radius: 10px; background: var(--wd-surface); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12.5px; line-height: 1.2; transition: opacity 0.25s ease, border-color 0.25s ease, background-color 0.25s ease, box-shadow 0.25s ease; }
.sp-chunk[data-data="true"] { font-family: inherit; font-size: 12.5px; font-style: normal; }
.sp-chunk[data-s="done"] { opacity: 0.45; }
.sp-chunk[data-s="now"] { opacity: 1; border-color: var(--wd-primary); background: color-mix(in srgb, var(--wd-primary) 12%, var(--wd-surface)); box-shadow: 0 10px 24px -14px color-mix(in srgb, var(--wd-primary) 75%, transparent); }
.sp-chunk[data-s="next"] { border-style: dashed; border-color: var(--wd-primary); }
.sp-chunk[data-s="fail"] { opacity: 1; border-color: #c2410c; background: color-mix(in srgb, #c2410c 14%, var(--wd-surface)); }
.sp-chunk[data-s="ok"] { border-color: #15803d; background: color-mix(in srgb, #15803d 14%, var(--wd-surface)); }
.sp-stack { display: flex; flex-direction: column; }
.sp-well { position: relative; display: flex; flex: 1; flex-direction: column; justify-content: flex-end; gap: 6px; min-height: 210px; padding: 10px; border: 1px solid var(--wd-border); border-top: 0; border-radius: 0 0 14px 14px; background: var(--wd-surface); }
.sp-well::before { content: ''; position: absolute; inset: 0 0 auto 0; height: 100%; pointer-events: none; border-radius: 0 0 14px 14px; box-shadow: inset 0 -18px 24px -22px color-mix(in srgb, var(--wd-text) 35%, transparent); }
.sp-items { display: flex; flex-direction: column-reverse; gap: 6px; }
.sp-item { position: relative; padding: 8px 10px; border: 1px solid var(--wd-border); border-radius: 10px; background: var(--wd-background); font-size: 12.5px; line-height: 1.25; animation: sp-in 0.32s cubic-bezier(0.3, 0.7, 0.2, 1) both; }
.sp-item[data-k="sig"] { border-color: color-mix(in srgb, var(--wd-primary) 55%, var(--wd-border)); }
.sp-item[data-k="pk"] { border-color: color-mix(in srgb, #7c3aed 60%, var(--wd-border)); background: color-mix(in srgb, #7c3aed 8%, var(--wd-background)); }
.sp-item[data-k="hash"] { border-color: color-mix(in srgb, #0f766e 65%, var(--wd-border)); background: color-mix(in srgb, #0f766e 9%, var(--wd-background)); }
.sp-item[data-k="other"] { border-color: #c2410c; background: color-mix(in srgb, #c2410c 10%, var(--wd-background)); }
.sp-item[data-k="ok"] { border-color: #15803d; background: color-mix(in srgb, #15803d 12%, var(--wd-background)); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-weight: 700; }
.sp-topmark { position: absolute; right: 8px; top: 8px; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--wd-text-muted); }
.sp-stackhead { margin: 0; padding: 14px 14px 10px; border: 1px solid var(--wd-border); border-bottom: 0; border-radius: 14px 14px 0 0; background: var(--wd-background); }
.sp-stackhead .sp-eyebrow { margin: 0; }
.sp-empty { align-self: center; margin: auto; font-size: 12.5px; color: var(--wd-text-muted); }
.sp-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--wd-border); }
.sp-btns { display: flex; gap: 8px; }
.sp-btn { padding: 8px 16px; border: 1px solid var(--wd-border); border-radius: 999px; background: var(--wd-background); color: var(--wd-text); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; transition: background-color 0.2s ease, opacity 0.2s ease; }
.sp-btn[data-primary="true"] { border-color: var(--wd-primary); background: var(--wd-primary); color: var(--wd-background); }
.sp-btn:disabled { opacity: 0.4; cursor: default; }
.sp-count { font-size: 12.5px; font-weight: 600; color: var(--wd-text-muted); }
.sp-note { flex: 1 1 260px; margin: 0; font-size: 13.5px; line-height: 1.5; }
.sp-status { display: inline-block; margin-right: 8px; padding: 2px 9px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
.sp-status[data-t="ok"] { color: #15803d; border: 1px solid #15803d; }
.sp-status[data-t="fail"] { color: #c2410c; border: 1px solid #c2410c; }
.sp-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@keyframes sp-in { from { opacity: 0; transform: translateY(-14px) scale(0.96); } to { opacity: 1; transform: none; } }
@container (max-width: 640px) {
  .sp-body { grid-template-columns: 1fr; }
  .sp-well { min-height: 170px; }
}
@media (prefers-reduced-motion: reduce) {
  .sp-thumb, .sp-opt, .sp-chunk, .sp-btn { transition: none; }
  .sp-item { animation: none; }
}
`;

function chunkState(index, step, run) {
  const last = run.length - 1;
  const failed = Boolean(run[last].fail);
  if (step > 0 && index === step - 1) {
    if (failed && step === last) return 'fail';
    if (run[last].ok && step === last) return 'ok';
    return 'now';
  }
  if (index < step - 1) return 'done';
  if (index === step && !(failed && step === last)) return 'next';
  return 'idle';
}

export default function ScriptStepper() {
  const [other, setOther] = useState(false);
  const [step, setStep] = useState(0);
  const run = buildSteps(other);
  const last = run.length - 1;
  const at = Math.min(step, last);
  const current = run[at];
  const finished = at === last;

  const pickKey = (value) => {
    setOther(value);
    setStep((s) => Math.min(s, 5));
  };

  const status = current.ok ? 'Valid' : current.fail ? 'Rejected' : null;

  return (
    <div className="sp" role="group" aria-label="Step by step run of a P2PKH spend: the unlocking script, the locking script and the stack">
      <style>{css}</style>
      <div className="sp-top">
        <span className="sp-keylabel">{copy.keyLabel}</span>
        <div className="sp-seg" data-v={other ? 'other' : 'owner'} role="group" aria-label={copy.keyLabel}>
          <span className="sp-thumb" aria-hidden="true" />
          <button type="button" className="sp-opt" aria-pressed={!other} onClick={() => pickKey(false)}>{copy.owner}</button>
          <button type="button" className="sp-opt" aria-pressed={other} onClick={() => pickKey(true)}>{copy.other}</button>
        </div>
      </div>

      <div className="sp-body">
        <div className="sp-scripts">
          {['unlocking', 'locking'].map((script) => (
            <div className="sp-card" key={script}>
              <p className="sp-eyebrow">{copy[script]}</p>
              <div className="sp-chunks">
                {chunks.map((c, i) => (c.script === script ? (
                  <span key={c.id} className="sp-chunk" data-data={c.data ? 'true' : undefined} data-s={chunkState(i, at, run)}>{c.text}</span>
                ) : null))}
              </div>
            </div>
          ))}
        </div>

        <div className="sp-stack">
          <div className="sp-stackhead"><p className="sp-eyebrow">{copy.stack}</p></div>
          <div className="sp-well">
            {current.stack.length > 0 && <span className="sp-topmark">{copy.top}</span>}
            {current.stack.length === 0 ? <span className="sp-empty">{copy.empty}</span> : (
              <div className="sp-items">
                {current.stack.map((it, i) => (
                  <div key={`${other}-${i}-${it.label}`} className="sp-item" data-k={it.k}>{it.label}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="sp-bar">
        <div className="sp-btns">
          <button type="button" className="sp-btn" disabled={at === 0} onClick={() => setStep(at - 1)}>{copy.back}</button>
          <button type="button" className="sp-btn" data-primary="true" disabled={finished} onClick={() => setStep(at + 1)}>{copy.step}</button>
          <button type="button" className="sp-btn" disabled={at === 0} onClick={() => setStep(0)}>{copy.reset}</button>
        </div>
        <span className="sp-count">{`${at} of ${last}`}</span>
        <p className="sp-note">
          {status ? <span className="sp-status" data-t={current.ok ? 'ok' : 'fail'}>{status}</span> : null}
          {current.note}
        </p>
      </div>

      <p className="sp-sr" aria-live="polite">{`Step ${at} of ${last}. ${current.note}`}</p>
    </div>
  );
}
