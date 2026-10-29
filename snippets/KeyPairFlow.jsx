import { Fragment, useState } from 'react';

// From a private key to an address: four stages in a row, pick one to see what it is, its size and how it is made.
// A switch picks the network, which only changes the last stage. Content only: edit the texts below, the layout does not need to change.
// Sizes and prefixes were checked with @bsv/sdk 4.0.1: public key 33 bytes compressed, the address holds hash160 of the public key, testnet addresses start with m, Mainnet with 1.

const copy = {
  netLabel: 'Network',
  mainnet: 'Mainnet',
  testnet: 'Testnet',
  oneWay: 'one way',
  size: 'Size',
  made: 'Made by',
  can: 'You can',
  bytes: 'bytes',
};

const stages = [
  {
    key: 'private',
    name: 'Private key',
    size: 32,
    made: 'A random 256 bit number, PrivateKey.fromRandom()',
    can: 'Sign. Never share it.',
    kind: 'secret',
  },
  {
    key: 'public',
    name: 'Public key',
    size: 33,
    made: 'The private key multiplied on the secp256k1 curve, toPublicKey(), stored compressed',
    can: 'Share it. Anyone can check your signatures with it.',
    kind: 'public',
  },
  {
    key: 'hash',
    name: 'hash160',
    size: 20,
    made: 'SHA-256 of the public key, then RIPEMD-160 of that',
    can: 'Lock an output to it. This is what a P2PKH locking script holds.',
    kind: 'hash',
  },
  {
    key: 'address',
    name: 'Address',
    size: 25,
    made: 'A version byte, the hash160 and a 4 byte checksum, written in base58, toAddress()',
    can: 'Hand it to a payer. The version byte tells the network.',
    kind: 'address',
  },
];

const css = `
.kp { container-type: inline-size; margin: 28px 0; padding: 18px; border: 1px solid var(--wd-border); border-radius: 18px; background: linear-gradient(180deg, color-mix(in srgb, var(--wd-primary) 5%, var(--wd-surface)) 0%, var(--wd-surface) 70%); color: var(--wd-text); }
.kp * { box-sizing: border-box; }
.kp-top { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; margin-bottom: 16px; }
.kp-label { font-size: 12.5px; font-weight: 600; color: var(--wd-text-muted); }
.kp-seg { position: relative; display: grid; grid-template-columns: 1fr 1fr; padding: 3px; border: 1px solid var(--wd-border); border-radius: 999px; background: var(--wd-surface); }
.kp-thumb { position: absolute; top: 3px; bottom: 3px; left: 3px; width: calc(50% - 3px); border-radius: 999px; background: var(--wd-primary); transition: transform 0.28s cubic-bezier(0.3, 0.7, 0.2, 1); }
.kp-seg[data-v="testnet"] .kp-thumb { transform: translateX(100%); }
.kp-opt { position: relative; z-index: 1; padding: 7px 14px; border: 0; border-radius: 999px; background: transparent; color: var(--wd-text-muted); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; transition: color 0.2s ease; }
.kp-opt[aria-pressed="true"] { color: var(--wd-background); }
.kp-opt:focus-visible, .kp-node:focus-visible { outline: 2px solid var(--wd-primary); outline-offset: 2px; }
.kp-row { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; align-items: stretch; gap: 6px; }
.kp-node { display: flex; flex-direction: column; justify-content: center; gap: 4px; min-height: 76px; padding: 10px 12px; border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-background); color: var(--wd-text); font: inherit; text-align: left; cursor: pointer; transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.25s ease, opacity 0.2s ease; }
.kp-node[data-on="false"] { opacity: 0.6; }
.kp-node[data-on="true"] { opacity: 1; border-color: var(--wd-primary); background: color-mix(in srgb, var(--wd-primary) 10%, var(--wd-surface)); box-shadow: 0 10px 24px -14px color-mix(in srgb, var(--wd-primary) 75%, transparent); }
.kp-node[data-k="secret"][data-on="true"] { border-color: #c2410c; background: color-mix(in srgb, #c2410c 10%, var(--wd-surface)); box-shadow: 0 10px 24px -14px color-mix(in srgb, #c2410c 70%, transparent); }
.kp-name { font-size: 13.5px; font-weight: 700; }
.kp-bytes { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; color: var(--wd-text-muted); }
.kp-arrow { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; min-width: 38px; color: var(--wd-text-muted); }
.kp-arrow svg { width: 26px; height: 12px; }
.kp-arrow span { font-size: 9.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.kp-detail { margin-top: 14px; padding: 14px; border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-background); animation: kp-in 0.3s cubic-bezier(0.3, 0.7, 0.2, 1) both; }
.kp-detail dl { display: grid; grid-template-columns: max-content 1fr; gap: 8px 14px; margin: 0; }
.kp-detail dt { font-size: 11.5px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--wd-text-muted); padding-top: 2px; }
.kp-detail dd { margin: 0; font-size: 13.5px; line-height: 1.5; }
.kp-size { display: flex; align-items: center; gap: 10px; }
.kp-bar { position: relative; flex: 1; height: 10px; border: 1px solid var(--wd-border); border-radius: 999px; background: var(--wd-surface); overflow: hidden; }
.kp-fill { position: absolute; inset: 0 auto 0 0; border-radius: 999px; background: var(--wd-primary); transition: width 0.45s cubic-bezier(0.3, 0.7, 0.2, 1); }
.kp-example { margin-top: 10px; padding: 8px 10px; border: 1px dashed var(--wd-border); border-radius: 10px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; word-break: break-all; color: var(--wd-text-muted); }
.kp-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
@keyframes kp-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@container (max-width: 640px) {
  .kp-row { grid-template-columns: 1fr; }
  .kp-arrow { flex-direction: row; min-height: 22px; }
  .kp-arrow svg { transform: rotate(90deg); }
  .kp-detail dl { grid-template-columns: 1fr; gap: 2px; }
  .kp-detail dd { margin-bottom: 8px; }
}
@media (prefers-reduced-motion: reduce) {
  .kp-thumb, .kp-node, .kp-fill { transition: none; }
  .kp-detail { animation: none; }
}
`;

function Arrow() {
  return (
    <div className="kp-arrow" aria-hidden="true">
      <svg viewBox="0 0 26 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1 6h22M18 1.5 23 6l-5 4.5" /></svg>
      <span>{copy.oneWay}</span>
    </div>
  );
}

export default function KeyPairFlow() {
  const [pick, setPick] = useState('public');
  const [testnet, setTestnet] = useState(true);
  const index = stages.findIndex((s) => s.key === pick);
  const s = stages[index];
  const example = s.key === 'address'
    ? (testnet ? 'Testnet addresses start with m, as in the example run.' : 'Mainnet addresses start with 1.')
    : null;

  return (
    <div className="kp" role="group" aria-label="From a private key to a public key, a hash160 and an address">
      <style>{css}</style>
      <div className="kp-top">
        <span className="kp-label">{copy.netLabel}</span>
        <div className="kp-seg" data-v={testnet ? 'testnet' : 'mainnet'} role="group" aria-label={copy.netLabel}>
          <span className="kp-thumb" aria-hidden="true" />
          <button type="button" className="kp-opt" aria-pressed={!testnet} onClick={() => setTestnet(false)}>{copy.mainnet}</button>
          <button type="button" className="kp-opt" aria-pressed={testnet} onClick={() => setTestnet(true)}>{copy.testnet}</button>
        </div>
      </div>

      <div className="kp-row">
        {stages.map((x, i) => (
          <Fragment key={x.key}>
            {i > 0 ? <Arrow /> : null}
            <button type="button" className="kp-node" data-k={x.kind} data-on={pick === x.key} aria-pressed={pick === x.key} onClick={() => setPick(x.key)}>
              <span className="kp-name">{x.name}</span>
              <span className="kp-bytes">{`${x.size} ${copy.bytes}`}</span>
            </button>
          </Fragment>
        ))}
      </div>

      <div className="kp-detail" key={`${s.key}-${testnet}`}>
        <dl>
          <dt>{copy.made}</dt>
          <dd>{s.made}</dd>
          <dt>{copy.can}</dt>
          <dd>{s.can}</dd>
          <dt>{copy.size}</dt>
          <dd>
            <div className="kp-size">
              <span className="kp-bytes">{`${s.size} ${copy.bytes}`}</span>
              <div className="kp-bar" aria-hidden="true"><span className="kp-fill" style={{ width: `${(s.size / 40) * 100}%` }} /></div>
            </div>
          </dd>
        </dl>
        {example ? <p className="kp-example">{example}</p> : null}
      </div>

      <p className="kp-sr" aria-live="polite">{`${s.name}, ${s.size} bytes. ${s.made}. ${s.can}`}</p>
    </div>
  );
}
