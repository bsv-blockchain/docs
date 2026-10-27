// "How the toolbox tracks UTXOs": the values of transactions.status, as a path with the side states below it.
// Content only: edit the texts here. Source: ts-stack architecture/wallet-utxo-lifecycle.md, wallet-toolbox 2.14.
import { Fragment } from 'react';

const path = [
  { status: 'unsigned', what: 'createAction committed the plan. The inputs are already claimed' },
  { status: 'unprocessed', what: 'Signed, and not broadcast yet' },
  { status: 'sending', what: 'Queued for broadcast, or retrying after a service error' },
  { status: 'unproven', what: 'The network accepted it, and the wallet has no Merkle proof yet' },
  { status: 'completed', what: 'The wallet found and validated its Merkle proof. Final', final: true },
];

const side = [
  { status: 'nosend', what: 'Signed, and kept back by the noSend option' },
  { status: 'failed', what: 'Aborted, rejected or abandoned. Final, unless an operator sets it to unfail', final: true },
  { status: 'unfail', what: 'Set by an operator to retry: unproven if a proof is found, failed if not' },
];

function Chip({ item }) {
  return (
    <div className={`flex flex-col gap-1 rounded-xl border p-3 ${item.final ? 'border-2 border-[#1B1EA9] dark:border-[#8C9BFF]' : 'border-gray-200 dark:border-gray-700'}`}>
      <span className="font-mono text-sm font-semibold text-[#1B1EA9] dark:text-[#8C9BFF]">{item.status}</span>
      <p className="m-0 text-xs leading-relaxed text-gray-700 dark:text-gray-300">{item.what}</p>
    </div>
  );
}

export default function UtxoStatusFlow() {
  return (
    <figure className="not-prose my-8 flex flex-col gap-5">
      <ol className="m-0 grid list-none grid-cols-1 gap-2 p-0 lg:grid-cols-[repeat(5,minmax(0,1fr))]" aria-label="The usual path of a transaction status">
        {path.map((item) => (
          <li key={item.status} className="m-0"><Chip item={item} /></li>
        ))}
      </ol>
      <div>
        <p className="m-0 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Off the usual path</p>
        <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-3" aria-label="Statuses off the usual path">
          {side.map((item) => (
            <li key={item.status} className="m-0"><Chip item={item} /></li>
          ))}
        </ul>
      </div>
    </figure>
  );
}
