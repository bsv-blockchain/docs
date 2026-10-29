import { useState } from 'react';

// A request from an app to an Express server, step by step: the app on the left, the server on the right, the result in the middle.
// A switch picks how the app sends it. AuthFetch authenticates, a plain fetch gets a 401.
// Content only: edit the texts below, the layout does not need to change.
// Run on localhost with @bsv/sdk 4.0.1, @bsv/auth-express-middleware 2.3.0 and express 5.3.0: AuthFetch GET and POST returned 200, req.auth.identityKey held the identity key of the client,
// the response carried the server identity key in x-bsv-auth-identity-key, and a plain fetch got 401 with code UNAUTHORIZED and the message Mutual-authentication failed!

const copy = {
  label: 'The app sends the request with',
  auth: 'AuthFetch',
  plain: 'A plain fetch',
  app: 'App',
  server: 'Express server',
  back: 'Back',
  step: 'Step',
  reset: 'Reset',
};

const runs = {
  auth: [
    { note: 'The app has a wallet and calls AuthFetch with the URL of the server. The server runs the auth middleware.', app: [{ t: 'wallet', k: 'key' }, { t: 'AuthFetch.fetch(url)' }], server: [{ t: 'createAuthMiddleware' }], mid: [] },
    { note: 'The two sides prove their identity keys to each other in a handshake (BRC-103), before any data moves.', app: [{ t: 'identity key', k: 'key' }], server: [{ t: 'identity key', k: 'key' }], mid: [{ t: 'handshake', k: 'ok' }] },
    { note: 'The request goes out signed with the identity key of the app (BRC-104). The middleware verifies the signature, puts that key in req.auth.identityKey and runs the route.', app: [{ t: 'signed request', k: 'sig' }], server: [{ t: 'req.auth.identityKey', k: 'key' }, { t: 'route handler' }], mid: [{ t: 'verified', k: 'ok' }] },
    { note: 'The response is signed too and carries the identity key of the server in the x-bsv-auth-identity-key header. The app gets status 200.', app: [{ t: '200 response', k: 'ok' }], server: [{ t: 'signed response', k: 'sig' }], mid: [{ t: 'authenticated', k: 'ok' }], end: 'ok' },
  ],
  plain: [
    { note: 'The app calls fetch with the URL of the server. The server runs the auth middleware.', app: [{ t: 'fetch(url)' }], server: [{ t: 'createAuthMiddleware' }], mid: [] },
    { note: 'The request has no identity key and no signature. The middleware requires authentication by default, so it turns the request away.', app: [{ t: 'plain request' }], server: [{ t: 'no identity key', k: 'bad' }], mid: [{ t: 'not verified', k: 'bad' }] },
    { note: 'The server answers 401 with the code UNAUTHORIZED and the message Mutual-authentication failed!', app: [{ t: '401 UNAUTHORIZED', k: 'bad' }], server: [{ t: 'no identity key', k: 'bad' }], mid: [{ t: 'rejected', k: 'bad' }], end: 'fail' },
  ],
};

const css = `
.ia { container-type: inline-size; margin: 28px 0; padding: 18px; border: 1px solid var(--wd-border); border-radius: 18px; background: linear-gradient(180deg, color-mix(in srgb, var(--wd-primary) 5%, var(--wd-surface)) 0%, var(--wd-surface) 70%); color: var(--wd-text); }
.ia * { box-sizing: border-box; }
.ia-top { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; margin-bottom: 16px; }
.ia-label { font-size: 12.5px; font-weight: 600; color: var(--wd-text-muted); }
.ia-seg { position: relative; display: grid; grid-template-columns: 1fr 1fr; padding: 3px; border: 1px solid var(--wd-border); border-radius: 999px; background: var(--wd-surface); }
.ia-thumb { position: absolute; top: 3px; bottom: 3px; left: 3px; width: calc(50% - 3px); border-radius: 999px; background: var(--wd-primary); transition: transform 0.28s cubic-bezier(0.3, 0.7, 0.2, 1), background-color 0.28s ease; }
.ia-seg[data-v="plain"] .ia-thumb { transform: translateX(100%); background: #c2410c; }
.ia-opt { position: relative; z-index: 1; padding: 7px 14px; border: 0; border-radius: 999px; background: transparent; color: var(--wd-text-muted); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; transition: color 0.2s ease; }
.ia-opt[aria-pressed="true"] { color: var(--wd-background); }
.ia-opt:focus-visible, .ia-btn:focus-visible { outline: 2px solid var(--wd-primary); outline-offset: 2px; }
.ia-body { display: grid; grid-template-columns: minmax(0, 1fr) minmax(96px, 0.5fr) minmax(0, 1fr); gap: 12px; align-items: stretch; }
.ia-col { display: flex; flex-direction: column; gap: 8px; min-height: 150px; padding: 14px; border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-background); }
.ia-eyebrow { margin: 0 0 4px; font-size: 11.5px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--wd-text-muted); }
.ia-mid { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; }
.ia-mid::before, .ia-mid::after { content: ''; flex: 1; width: 1px; background: var(--wd-border); }
.ia-chip { padding: 8px 10px; border: 1px solid var(--wd-border); border-radius: 10px; background: var(--wd-surface); font-size: 12.5px; line-height: 1.25; animation: ia-in 0.32s cubic-bezier(0.3, 0.7, 0.2, 1) both; }
.ia-chip[data-k="key"] { border-color: color-mix(in srgb, #7c3aed 60%, var(--wd-border)); background: color-mix(in srgb, #7c3aed 8%, var(--wd-background)); }
.ia-chip[data-k="sig"] { border-color: color-mix(in srgb, var(--wd-primary) 55%, var(--wd-border)); background: color-mix(in srgb, var(--wd-primary) 10%, var(--wd-background)); }
.ia-chip[data-k="ok"] { border-color: #15803d; background: color-mix(in srgb, #15803d 14%, var(--wd-background)); font-weight: 700; }
.ia-chip[data-k="bad"] { border-color: #c2410c; background: color-mix(in srgb, #c2410c 12%, var(--wd-background)); font-weight: 600; }
.ia-midchip { padding: 5px 10px; border: 1px solid var(--wd-border); border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; text-align: center; color: var(--wd-text-muted); animation: ia-in 0.32s cubic-bezier(0.3, 0.7, 0.2, 1) both; }
.ia-midchip[data-k="ok"] { color: #15803d; border-color: #15803d; }
.ia-midchip[data-k="bad"] { color: #c2410c; border-color: #c2410c; }
.ia-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--wd-border); }
.ia-btns { display: flex; gap: 8px; }
.ia-btn { padding: 8px 16px; border: 1px solid var(--wd-border); border-radius: 999px; background: var(--wd-background); color: var(--wd-text); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 0.2s ease; }
.ia-btn[data-primary="true"] { border-color: var(--wd-primary); background: var(--wd-primary); color: var(--wd-background); }
.ia-btn:disabled { opacity: 0.4; cursor: default; }
.ia-count { font-size: 12.5px; font-weight: 600; color: var(--wd-text-muted); }
.ia-note { flex: 1 1 260px; margin: 0; font-size: 13.5px; line-height: 1.5; }
.ia-status { display: inline-block; margin-right: 8px; padding: 2px 9px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
.ia-status[data-t="ok"] { color: #15803d; border: 1px solid #15803d; }
.ia-status[data-t="fail"] { color: #c2410c; border: 1px solid #c2410c; }
.ia-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@keyframes ia-in { from { opacity: 0; transform: translateY(-10px) scale(0.97); } to { opacity: 1; transform: none; } }
@container (max-width: 640px) {
  .ia-body { grid-template-columns: 1fr; }
  .ia-mid { flex-direction: row; }
  .ia-mid::before, .ia-mid::after { width: auto; height: 1px; }
  .ia-col { min-height: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .ia-thumb, .ia-opt, .ia-btn { transition: none; }
  .ia-chip, .ia-midchip { animation: none; }
}
`;

export default function IdentityRequest() {
  const [mode, setMode] = useState('auth');
  const [step, setStep] = useState(0);
  const run = runs[mode];
  const last = run.length - 1;
  const at = Math.min(step, last);
  const cur = run[at];
  const status = cur.end === 'ok' ? 'Authenticated' : cur.end === 'fail' ? 'Rejected' : null;

  return (
    <div className="ia" role="group" aria-label="A request from an app to an Express server, with AuthFetch and with a plain fetch">
      <style>{css}</style>
      <div className="ia-top">
        <span className="ia-label">{copy.label}</span>
        <div className="ia-seg" data-v={mode} role="group" aria-label={copy.label}>
          <span className="ia-thumb" aria-hidden="true" />
          <button type="button" className="ia-opt" aria-pressed={mode === 'auth'} onClick={() => { setMode('auth'); setStep(0); }}>{copy.auth}</button>
          <button type="button" className="ia-opt" aria-pressed={mode === 'plain'} onClick={() => { setMode('plain'); setStep(0); }}>{copy.plain}</button>
        </div>
      </div>

      <div className="ia-body">
        <div className="ia-col">
          <p className="ia-eyebrow">{copy.app}</p>
          {cur.app.map((c, i) => <div key={`${mode}-a-${at}-${i}`} className="ia-chip" data-k={c.k}>{c.t}</div>)}
        </div>
        <div className="ia-mid">
          {cur.mid.map((c, i) => <span key={`${mode}-m-${at}-${i}`} className="ia-midchip" data-k={c.k}>{c.t}</span>)}
        </div>
        <div className="ia-col">
          <p className="ia-eyebrow">{copy.server}</p>
          {cur.server.map((c, i) => <div key={`${mode}-s-${at}-${i}`} className="ia-chip" data-k={c.k}>{c.t}</div>)}
        </div>
      </div>

      <div className="ia-bar">
        <div className="ia-btns">
          <button type="button" className="ia-btn" disabled={at === 0} onClick={() => setStep(at - 1)}>{copy.back}</button>
          <button type="button" className="ia-btn" data-primary="true" disabled={at === last} onClick={() => setStep(at + 1)}>{copy.step}</button>
          <button type="button" className="ia-btn" disabled={at === 0} onClick={() => setStep(0)}>{copy.reset}</button>
        </div>
        <span className="ia-count">{`${at + 1} of ${run.length}`}</span>
        <p className="ia-note">
          {status ? <span className="ia-status" data-t={cur.end}>{status}</span> : null}
          {cur.note}
        </p>
      </div>

      <p className="ia-sr" aria-live="polite">{`Step ${at + 1} of ${run.length}. ${cur.note}`}</p>
    </div>
  );
}
