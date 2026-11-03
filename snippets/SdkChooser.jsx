import { useState } from 'react';

// Content only: edit the text here, the layout below does not need to change.
// Source: the Use the TypeScript, Go and Python SDK pages, the rs-sdk repository and the code samples run on 2026-11-03.
// Wrap a code term in backticks to show it as code.
// Writedocs adds the base path to the links of the page but not to an address computed here, so it is written once.
const BASE_PATH = '/docs';

// Every sample creates a random key and prints its testnet address. It makes no network call.
const options = [
  {
    name: 'TypeScript',
    detail: '@bsv/sdk',
    title: 'TypeScript SDK',
    text: "`@bsv/sdk` is the base library of the TypeScript stack. Ask the user's wallet to sign through `WalletClient`, or build keys, scripts and transactions yourself, in Node, the browser or React.",
    install: 'npm install @bsv/sdk',
    version: 'Tested with `@bsv/sdk` 4.0.1.',
    output: 'A testnet address that starts with m or n.',
    code: `import { PrivateKey } from '@bsv/sdk'

const key = PrivateKey.fromRandom()
console.log(key.toPublicKey().toAddress('testnet'))`,
    cta: 'Open the TypeScript SDK page',
    href: '/sdk/typescript/',
  },
  {
    name: 'Go',
    detail: 'go-sdk',
    title: 'Go SDK',
    text: '`go-sdk` builds keys, scripts, transactions and proofs, with a BRC-100 wallet interface and overlay services. Its docs and examples live in the Go repositories.',
    install: 'go mod init MODULE_NAME\ngo get github.com/bsv-blockchain/go-sdk',
    version: 'Tested with `go-sdk` v1.7.3. Replace `MODULE_NAME` with your module path, for example `example.com/hello`.',
    output: 'A testnet address that starts with m or n.',
    code: `package main

import (
\t"fmt"
\t"log"

\tec "github.com/bsv-blockchain/go-sdk/primitives/ec"
\t"github.com/bsv-blockchain/go-sdk/script"
)

func main() {
\tpriv, err := ec.NewPrivateKey()
\tif err != nil {
\t\tlog.Fatal(err)
\t}
\taddress, err := script.NewAddressFromPublicKey(priv.PubKey(), false)
\tif err != nil {
\t\tlog.Fatal(err)
\t}
\tfmt.Println(address.AddressString)
}`,
    cta: 'Open the Go SDK page',
    href: '/sdk/go/',
  },
  {
    name: 'Python',
    detail: 'bsv-sdk',
    title: 'Python SDK',
    text: '`bsv-sdk` builds keys, scripts, transactions and proofs, with broadcasting and wallets. Its docs and examples live in the Python repositories.',
    install: 'pip install bsv-sdk',
    version: 'Tested with `bsv-sdk` 2.4.0.',
    output: 'A testnet address that starts with m or n.',
    code: `from bsv import Network, PrivateKey

key = PrivateKey()
print(key.address(network=Network.TESTNET))`,
    cta: 'Open the Python SDK page',
    href: '/sdk/python/',
  },
  {
    name: 'Rust',
    detail: 'In development',
    title: 'Rust SDK',
    text: 'The Rust SDK is in development and has no release yet. Follow its progress in the `rs-sdk` repository.',
    cta: 'Open the rs-sdk repository',
    href: 'https://github.com/bsv-blockchain/rs-sdk',
    external: true,
  },
];

const css = `
.sc { container-type: inline-size; width: 100%; margin: 28px 0; color: var(--wd-text); font-size: 14px; }
.sc-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; }
.sc-q { margin: 0 0 12px 2px; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--wd-text-muted); }
.sc-col { display: block; }
.sc-list { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border: 1px solid var(--wd-border); border-radius: 14px; background: var(--wd-surface); overflow: hidden; }
.sc-opt { position: relative; display: block; width: 100%; text-align: left; font: inherit; padding: 14px 18px; border: 0; border-left: 1px solid var(--wd-border); background: transparent; color: var(--wd-text-muted); cursor: pointer; transition: background 0.15s ease; }
.sc-opt:first-child { border-left: 0; }
.sc-opt:hover { background: color-mix(in srgb, var(--wd-primary) 6%, transparent); }
.sc-opt:focus-visible { outline: 2px solid var(--wd-primary); outline-offset: -2px; }
.sc-opt[aria-pressed="true"] { background: color-mix(in srgb, var(--wd-primary) 11%, transparent); color: var(--wd-text); }
.sc-opt[aria-pressed="true"]::before { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 3px; background: var(--wd-primary); }
.sc-name { display: block; font-size: 15px; font-weight: 600; line-height: 1.35; color: var(--wd-text); }
.sc-detail { display: block; margin-top: 2px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; line-height: 1.4; }
.sc-chev { display: none; }

.sc-panel { display: flex; flex-direction: column; border: 1px solid var(--wd-border); border-radius: 14px; background: linear-gradient(160deg, color-mix(in srgb, var(--wd-primary) 9%, var(--wd-surface)), var(--wd-surface) 70%); overflow: hidden; }
.sc-body { padding: 24px 28px 20px; }
.sc-code-grid { display: block; }
.sc-sr { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.sc-eyebrow { display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--wd-text-muted); }
.sc-count { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; letter-spacing: 0; }
.sc-title { margin: 14px 0 0; font-size: 22px; font-weight: 600; line-height: 1.25; letter-spacing: -0.01em; }
.sc-text { margin: 12px 0 0; font-size: 14.5px; line-height: 1.65; color: var(--wd-text-muted); }
.sc-text code, .sc-code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
.sc-text code { font-size: 13px; padding: 1px 5px; border-radius: 5px; background: color-mix(in srgb, var(--wd-text) 8%, transparent); color: var(--wd-text); }
.sc-label { margin: 18px 0 6px; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--wd-text-muted); }
.sc-code { margin: 0; padding: 12px 14px; border: 1px solid var(--wd-border); border-radius: 10px; background: var(--wd-surface); color: var(--wd-text); font-size: 12.5px; line-height: 1.6; tab-size: 4; overflow-x: auto; white-space: pre; }
.sc-cta { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding: 16px 28px; border-top: 1px solid var(--wd-border); color: var(--wd-primary); font-weight: 600; font-size: 14px; text-decoration: none; transition: background 0.15s ease; }
.sc-cta:hover { background: color-mix(in srgb, var(--wd-primary) 10%, transparent); text-decoration: none; }
.sc-cta:focus-visible { outline: 2px solid var(--wd-primary); outline-offset: -2px; }
@container (max-width: 700px) {
  .sc-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .sc-opt:nth-child(3) { border-left: 0; }
  .sc-opt:nth-child(n+3) { border-top: 1px solid var(--wd-border); }
  .sc-code-grid { grid-template-columns: minmax(0, 1fr); }
  .sc-body { padding: 20px 20px 16px; }
  .sc-cta { padding: 14px 20px; }
}
`;

// Shows the text between backticks as code.
function renderText(text) {
  return text.split('`').map((part, i) => (i % 2 === 1 ? <code key={i}>{part}</code> : part));
}

export default function SdkChooser() {
  const [index, setIndex] = useState(0);
  const current = options[index];
  const href = current.external ? current.href : BASE_PATH + current.href;

  return (
    <div className="sc" role="group" aria-label="Choose a BSV SDK by language">
      <style>{css}</style>
      <p className="sc-q">Which language do you use?</p>
      <div className="sc-grid">
        <div className="sc-col">
          <div className="sc-list">
            {options.map((o, i) => (
              <button key={i} type="button" className="sc-opt" aria-pressed={i === index} onClick={() => setIndex(i)}>
                <span>
                  <span className="sc-name">{o.name}</span>
                  <span className="sc-detail">{o.detail}</span>
                </span>
                <span className="sc-chev" aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </div>
        <div className="sc-panel">
          <div className="sc-sr" aria-live="polite" aria-atomic="true">{`${current.name}. ${current.title}. ${current.text.split('`').join('')}`}</div>
          <div className="sc-body">
            <div className="sc-eyebrow"><span>Start with</span><span className="sc-count" aria-hidden="true">{index + 1} / {options.length}</span></div>
            <div className="sc-title">{current.title}</div>
            <p className="sc-text">{renderText(current.text)}</p>
            {current.code ? (
              <div className="sc-code-grid">
                <div>
                  <p className="sc-label">Install</p>
                  <pre className="sc-code"><code>{current.install}</code></pre>
                </div>
                <div>
                  <p className="sc-label">Create a key and print its testnet address</p>
                  <pre className="sc-code"><code>{current.code}</code></pre>
                </div>
                <div>
                  <p className="sc-label">Output</p>
                  {current.output ? <p className="sc-text">{renderText(current.output)}</p> : null}
                  {current.version ? <p className="sc-text">{renderText(current.version)}</p> : null}
                </div>
              </div>
            ) : null}
          </div>
          <a className="sc-cta" href={href}><span>{current.cta}</span><span aria-hidden="true">→</span></a>
        </div>
      </div>
    </div>
  );
}
