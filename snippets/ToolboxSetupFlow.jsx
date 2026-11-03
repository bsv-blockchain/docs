// "Build a wallet with wallet-toolbox": how the Setup helpers turn the keys in .env into a working wallet, as equal boxes with arrows.
// Content only: edit the texts here. Source: @bsv/wallet-toolbox 2.15.1, out/src/Setup.js.
import { Fragment } from 'react';

const path = [
  { name: '.env', what: 'Testnet and Mainnet keys and placeholder API keys, written once by Setup.makeEnv()' },
  { name: "Setup.getEnv('test')", what: 'Reads the testnet keys and sets the chain to testnet' },
  { name: 'Setup.createWalletSQLite', what: 'Builds the key deriver, the storage, the services and the Monitor, then the wallet' },
  { name: 'setup', what: 'The object your code uses: the wallet and every part behind it' },
];

function Box({ item }) {
  return (
    <div className="flex h-full flex-col gap-1 rounded-xl border border-gray-200 p-3 dark:border-gray-700">
      <span className="font-mono text-sm font-semibold text-[#1B1EA9] dark:text-[#8C9BFF]">{item.name}</span>
      <p className="m-0 text-xs leading-relaxed text-gray-700 dark:text-gray-300">{item.what}</p>
    </div>
  );
}

export default function ToolboxSetupFlow() {
  return (
    <figure className="not-prose my-8">
      <ol className="m-0 grid list-none grid-cols-1 gap-2 p-0 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-stretch" aria-label="From the keys in .env to a working wallet">
        {path.map((item, i) => (
          <Fragment key={item.name}>
            <li className="m-0 h-full"><Box item={item} /></li>
            {i < path.length - 1 && (
              <li aria-hidden="true" className="m-0 flex items-center justify-center text-[#1B1EA9] dark:text-[#8C9BFF]">
                <span className="text-xl leading-none lg:hidden">↓</span>
                <span className="hidden text-xl leading-none lg:inline">→</span>
              </li>
            )}
          </Fragment>
        ))}
      </ol>
    </figure>
  );
}
