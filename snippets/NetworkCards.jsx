// The three networks an app developer meets, in "How BSV networks differ": three boxes of the same size, side by side.
// Content only: edit the texts here. Keep each item short. Sources: the BSV Desktop page (BSV Desktop 3.3.1) and the wallet-toolbox docs.

const networks = [
  {
    name: 'Mainnet',
    what: 'The live BSV network',
    points: [
      'Coins are real BSV with a market value',
      'A payment cannot be undone',
      'Use it when your app is ready for real users',
    ],
  },
  {
    name: 'Testnet',
    what: 'A public test network',
    points: [
      'Test coins are free and have no value',
      'The examples in these docs use it',
      'Use it to build and test your app',
    ],
  },
  {
    name: 'Teratestnet',
    what: 'The test network for Teranode',
    points: [
      'Test coins of its own, separate from testnet',
      'Runs on Teranode, the new BSV node software',
      'Use it only to test against Teranode on purpose',
    ],
  },
];

export default function NetworkCards() {
  return (
    <figure className="not-prose my-8">
      <ul
        className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-3"
        aria-label="What Mainnet, testnet and teratestnet are for"
      >
        {networks.map((network) => (
          <li key={network.name} className="m-0 flex flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="bg-[#1B1EA9] px-4 py-3 text-white dark:bg-[#8C9BFF] dark:text-gray-900">
              <span className="text-sm font-semibold">{network.name}</span>
            </div>
            <div className="flex-1 px-4 py-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              <p className="m-0 mb-2 font-semibold text-gray-900 dark:text-gray-100">{network.what}</p>
              <ul className="m-0 list-disc space-y-1 pl-5">
                {network.points.map((point, i) => (
                  <li key={i} className="m-0">{point}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </figure>
  );
}
