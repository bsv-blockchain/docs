// "How the toolbox tracks UTXOs": cards side by side, in the same style as UtxoRecords.
// Content only: edit the texts here. Source: ts-stack architecture/wallet-utxo-lifecycle.md, wallet-toolbox 2.14.

const sets = {
  broadcast: {
    label: 'The three broadcast options',
    cards: [
      { name: 'acceptDelayedBroadcast: false', who: 'Broadcast right away', what: 'The wallet broadcasts before createAction returns. A successful broadcast moves the proof request to unmined and the transaction to unproven.' },
      { name: 'acceptDelayedBroadcast: true', who: 'Broadcast later by the Monitor, the default', what: 'The proof request starts as unsent and the transaction as unprocessed. The Monitor broadcasts it later.' },
      { name: 'noSend', who: 'Not broadcast', what: 'Without sendWith, both start as nosend and the transaction is not broadcast. It waits for a later sendWith batch.' },
    ],
  },
  internalize: {
    label: 'The two internalizeAction protocols',
    cards: [
      { name: 'wallet payment', who: 'Counts in the balance', what: 'The wallet checks the BRC-29 derivation of the output, then stores it as managed change in the default basket, where it can fund the next transaction.' },
      { name: 'basket insertion', who: 'Stays out of the balance', what: 'The wallet stores the output as a custom output in a named basket, with the app’s own instructions and tags. An insertion into default is rejected.' },
    ],
  },
};

export default function UtxoCards({ set }) {
  const { label, cards } = sets[set];
  const cols = cards.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2';
  return (
    <figure className="not-prose my-8">
      <ul className={`m-0 grid list-none grid-cols-1 gap-4 p-0 ${cols}`} aria-label={label}>
        {cards.map((card) => (
          <li key={card.name} className="m-0 flex flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="bg-[#1B1EA9] px-4 py-3 text-white dark:bg-[#8C9BFF] dark:text-gray-900">
              <span className="font-mono text-sm font-semibold">{card.name}</span>
            </div>
            <div className="flex-1 px-4 py-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              <p className="m-0 mb-2 font-semibold text-gray-900 dark:text-gray-100">{card.who}</p>
              <p className="m-0">{card.what}</p>
            </div>
          </li>
        ))}
      </ul>
    </figure>
  );
}
