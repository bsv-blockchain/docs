// "How overlays work": two ways to find your app's transactions, side by side.
// Content only: edit the texts here. Keep each line short. Source: the page text and the ts-stack overlay docs.

const ways = [
  {
    title: 'Index the chain yourself',
    accent: false,
    points: [
      'Processes every transaction on the network',
      'You run the indexer, or trust someone else’s',
      'Trusts that the index left nothing out',
      'Costs grow with the whole network',
    ],
  },
  {
    title: 'Use an overlay',
    accent: true,
    points: [
      'Processes only the transactions your app sends',
      'The overlay checks each one, usually with SPV',
      'Applies your own rules',
      'Costs grow with your app',
    ],
  },
];

export default function OverlayCompare() {
  return (
    <figure className="not-prose my-8">
      <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2" aria-label="Indexing the chain compared with using an overlay">
        {ways.map((way) => (
          <li
            key={way.title}
            className={`m-0 flex flex-col overflow-hidden rounded-xl border ${way.accent ? 'border-2 border-[#1B1EA9] dark:border-[#8C9BFF]' : 'border-gray-200 dark:border-gray-700'}`}
          >
            <div className={way.accent ? 'bg-[#1B1EA9] px-4 py-3 text-white dark:bg-[#8C9BFF] dark:text-gray-900' : 'bg-gray-100 px-4 py-3 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}>
              <span className="text-sm font-semibold">{way.title}</span>
            </div>
            <ul className="m-0 flex-1 list-none space-y-2 px-4 py-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {way.points.map((point, i) => (
                <li key={i} className="m-0 flex gap-2">
                  <span aria-hidden="true" className={way.accent ? 'text-[#1B1EA9] dark:text-[#8C9BFF]' : 'text-gray-400'}>{way.accent ? '✓' : '•'}</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </figure>
  );
}
