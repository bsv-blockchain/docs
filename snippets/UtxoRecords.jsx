// "How the toolbox tracks UTXOs": the two status records of every transaction, side by side.
// Content only: edit the texts here. Source: ts-stack architecture/wallet-utxo-lifecycle.md, wallet-toolbox 2.14.

const records = [
  {
    name: 'transactions.status',
    who: 'What the app sees',
    what: 'The status that listActions reports to the app, from unsigned to completed or failed.',
  },
  {
    name: 'proven_tx_reqs.status',
    who: 'What the Monitor works on',
    what: 'The status of the proof request, which tracks the broadcast and the Merkle proof in the background.',
  },
];

export default function UtxoRecords() {
  return (
    <figure className="not-prose my-8">
      <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2" aria-label="The two status records of a transaction">
        {records.map((record) => (
          <li key={record.name} className="m-0 flex flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="bg-[#1B1EA9] px-4 py-3 text-white dark:bg-[#8C9BFF] dark:text-gray-900">
              <code className="text-sm font-semibold">{record.name}</code>
            </div>
            <div className="flex-1 px-4 py-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              <p className="m-0 mb-2 font-semibold text-gray-900 dark:text-gray-100">{record.who}</p>
              <p className="m-0">{record.what}</p>
            </div>
          </li>
        ))}
      </ul>
    </figure>
  );
}
