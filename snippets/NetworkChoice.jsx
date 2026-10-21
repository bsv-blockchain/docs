import { useState } from 'react';

// Content only: edit the text here, the layout below does not need to change.
// Source: the guide "Move your app to mainnet". BSV Desktop: the "Network & services" window (Mainnet and Testnet, one wallet identity with separate balances).
// Server wallet: the `network` option of ServerWallet.create from @bsv/simple ('main' or 'testnet', default 'main').
// Two lanes, each with a switch you can press (the arrows are static): the app that uses WalletClient follows the wallet, the server wallet follows its own code.

const networks = {
  test: { name: 'Testnet', text: 'Try payments with test coins', answer: 'testnet', option: 'testnet' },
  main: { name: 'Mainnet', text: 'Real BSV payments', answer: 'mainnet', option: 'main' },
};

const copy = {
  hint: 'Press a network to see what follows it.',
  desktop: { eyebrow: 'App with WalletClient', rule: 'The wallet decides', app: 'Your app', appSub: 'WalletClient', wallet: 'BSV Desktop', walletSub: 'One wallet, separate balances', control: 'Network & services', call: 'getNetwork returns' },
  server: { eyebrow: 'Server wallet', rule: 'Your code decides', app: 'Your server', appSub: 'ServerWallet', wallet: 'ServerWallet.create', walletSub: 'The network option in your code', control: 'network', badge: 'default' },
};

const css = `
.nc { container-type: inline-size; margin: 28px 0; display: flex; flex-direction: column; gap: 14px; color: var(--wd-text); }
.nc * { box-sizing: border-box; }
.nc-hint { margin: 0; font-size: 12.5px; letter-spacing: 0.02em; color: var(--wd-text-muted); }
.nc-lane { position: relative; padding: 18px 18px 16px; border: 1px solid var(--wd-border); border-radius: 18px; background: linear-gradient(180deg, color-mix(in srgb, var(--wd-primary) 5%, var(--wd-surface)) 0%, var(--wd-surface) 70%); }
.nc-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
.nc-eyebrow { font-size: 11.5px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--wd-text-muted); }
.nc-rule { font-size: 12.5px; font-weight: 600; color: var(--wd-primary); }
.nc-track { display: grid; grid-template-columns: minmax(0, 0.9fr) 44px minmax(0, 1.3fr) 44px minmax(0, 1.1fr); align-items: center; }
.nc-card { padding: 14px; border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-background); }
.nc-name { font-size: 15px; font-weight: 600; line-height: 1.2; }
.nc-sub { margin: 3px 0 0; font-size: 12.5px; line-height: 1.4; color: var(--wd-text-muted); }
.nc-code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12.5px; }
.nc-wire { position: relative; display: block; height: 14px; }
.nc-wire::before { content: ''; position: absolute; left: 4px; right: 8px; top: 6px; height: 2px; border-radius: 2px; background: repeating-linear-gradient(90deg, var(--wd-primary) 0 6px, transparent 6px 12px); background-size: 12px 2px; opacity: 0.75; }
.nc-wire::after { content: ''; position: absolute; right: 2px; top: 3px; border: 4px solid transparent; border-left: 7px solid var(--wd-primary); border-right: 0; opacity: 0.9; }
.nc-seg { position: relative; display: grid; grid-template-columns: 1fr 1fr; margin-top: 12px; padding: 3px; border: 1px solid var(--wd-border); border-radius: 999px; background: var(--wd-surface); }
.nc-thumb { position: absolute; top: 3px; bottom: 3px; left: 3px; width: calc(50% - 3px); border-radius: 999px; background: color-mix(in srgb, var(--wd-text) 13%, var(--wd-surface)); transition: transform 0.28s cubic-bezier(0.3, 0.7, 0.2, 1), background-color 0.28s ease; }
.nc-seg[data-v="main"] .nc-thumb { transform: translateX(100%); background: var(--wd-primary); }
.nc-opt { position: relative; z-index: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 7px 10px; border: 0; border-radius: 999px; background: transparent; color: var(--wd-text-muted); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; transition: color 0.2s ease; }
.nc-opt:focus-visible { outline: 2px solid var(--wd-primary); outline-offset: 2px; }
.nc-opt[aria-pressed="true"] { color: var(--wd-text); }
.nc-seg[data-v="main"] .nc-opt[aria-pressed="true"] { color: var(--wd-background); }
.nc-badge { padding: 1px 6px; border-radius: 999px; border: 1px solid currentColor; font-size: 10px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; opacity: 0.8; }
.nc-ledgers { display: flex; flex-direction: column; gap: 8px; }
.nc-ledger { display: grid; grid-template-columns: 14px 1fr; column-gap: 10px; align-items: start; padding: 11px 12px; border: 1px dashed var(--wd-border); border-radius: 12px; background: transparent; opacity: 0.5; transition: opacity 0.28s ease, border-color 0.28s ease, background-color 0.28s ease, box-shadow 0.28s ease; }
.nc-ledger[data-on="true"] { opacity: 1; border: 1px solid var(--wd-primary); background: color-mix(in srgb, var(--wd-primary) 9%, var(--wd-surface)); box-shadow: 0 12px 28px -16px color-mix(in srgb, var(--wd-primary) 70%, transparent); }
.nc-dot { width: 12px; height: 12px; margin-top: 3px; border-radius: 50%; border: 2px dashed var(--wd-text-muted); }
.nc-ledger[data-net="main"] .nc-dot { border: 0; background: var(--wd-text-muted); }
.nc-ledger[data-on="true"] .nc-dot { border-color: var(--wd-primary); }
.nc-ledger[data-on="true"][data-net="main"] .nc-dot { background: var(--wd-primary); box-shadow: 0 0 0 4px color-mix(in srgb, var(--wd-primary) 22%, transparent); }
.nc-result { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--wd-border); font-size: 12.5px; color: var(--wd-text-muted); }
.nc-result code { padding: 2px 8px; border-radius: 8px; background: color-mix(in srgb, var(--wd-primary) 10%, var(--wd-surface)); color: var(--wd-text); }
.nc-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@container (max-width: 700px) {
  .nc-track { grid-template-columns: 1fr; }
  .nc-wire { height: 30px; width: 14px; justify-self: center; }
  .nc-wire::before { left: 6px; right: auto; top: 3px; bottom: 9px; width: 2px; height: auto; background: repeating-linear-gradient(180deg, var(--wd-primary) 0 6px, transparent 6px 12px); background-size: 2px 12px; }
  .nc-wire::after { right: auto; left: 3px; top: auto; bottom: 2px; border: 4px solid transparent; border-top: 7px solid var(--wd-primary); border-bottom: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .nc-thumb, .nc-opt, .nc-ledger { transition: none; }
}
`;

function Switch({ label, value, onChange, options }) {
  return (
    <div className="nc-seg" data-v={value} role="group" aria-label={label}>
      <span className="nc-thumb" aria-hidden="true" />
      {options.map((o) => (
        <button key={o.key} type="button" className="nc-opt" aria-pressed={value === o.key} onClick={() => onChange(o.key)}>
          <span className={o.code ? 'nc-code' : undefined}>{o.label}</span>
          {o.badge ? <span className="nc-badge">{o.badge}</span> : null}
        </button>
      ))}
    </div>
  );
}

function Ledger({ net, on }) {
  const n = networks[net];
  return (
    <div className="nc-ledger" data-net={net} data-on={on}>
      <span className="nc-dot" aria-hidden="true" />
      <div>
        <div className="nc-name">{n.name}</div>
        <p className="nc-sub">{n.text}</p>
      </div>
    </div>
  );
}

function Node({ name, sub }) {
  return (
    <div className="nc-card">
      <div className="nc-name">{name}</div>
      <p className="nc-sub nc-code">{sub}</p>
    </div>
  );
}

export default function NetworkChoice() {
  const [desk, setDesk] = useState('test');
  const [srv, setSrv] = useState('test');
  const d = copy.desktop;
  const s = copy.server;

  return (
    <div className="nc" role="group" aria-label="Where the network is set: BSV Desktop decides for an app that uses WalletClient, and your code decides for a server wallet">
      <style>{css}</style>
      <p className="nc-hint">{copy.hint}</p>

      <div className="nc-lane">
        <div className="nc-head"><span className="nc-eyebrow">{d.eyebrow}</span><span className="nc-rule">{d.rule}</span></div>
        <div className="nc-track">
          <Node name={d.app} sub={d.appSub} />
          <span className="nc-wire" aria-hidden="true" />
          <div className="nc-card">
            <div className="nc-name">{d.wallet}</div>
            <p className="nc-sub">{d.walletSub}</p>
            <Switch label={d.control} value={desk} onChange={setDesk} options={[{ key: 'test', label: networks.test.name }, { key: 'main', label: networks.main.name }]} />
          </div>
          <span className="nc-wire" aria-hidden="true" />
          <div className="nc-ledgers">
            <Ledger net="test" on={desk === 'test'} />
            <Ledger net="main" on={desk === 'main'} />
          </div>
        </div>
        <div className="nc-result"><span>{d.call}</span><code>{`{ network: '${networks[desk].answer}' }`}</code></div>
      </div>

      <div className="nc-lane">
        <div className="nc-head"><span className="nc-eyebrow">{s.eyebrow}</span><span className="nc-rule">{s.rule}</span></div>
        <div className="nc-track">
          <Node name={s.app} sub={s.appSub} />
          <span className="nc-wire" aria-hidden="true" />
          <div className="nc-card">
            <div className="nc-name nc-code">{s.wallet}</div>
            <p className="nc-sub">{s.walletSub}</p>
            <Switch label={s.control} value={srv} onChange={setSrv} options={[{ key: 'test', label: networks.test.option, code: true }, { key: 'main', label: networks.main.option, code: true, badge: s.badge }]} />
          </div>
          <span className="nc-wire" aria-hidden="true" />
          <div className="nc-ledgers">
            <Ledger net={srv} on={true} />
          </div>
        </div>
      </div>

      <p className="nc-sr" aria-live="polite">{`BSV Desktop is on ${networks[desk].name}. The server wallet is set to ${networks[srv].option}, which is ${networks[srv].name}.`}</p>
    </div>
  );
}
