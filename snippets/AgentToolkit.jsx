// The three pieces in "Coding with agents": three boxes of the same size, side by side.
// Content only: edit the texts here. Keep each text short and about the same length. Tested with Claude Code 2.1.303 and @bsv/mcp 2.0.0 (bsv-blockchain/bsv-ai-toolkit main at 1ff7a6c), 2026-10-28.

const pieces = [
  {
    name: 'BSV docs server',
    gives: 'Search and full pages of these docs, as Markdown',
    use: 'Answers and code that follow these guides',
  },
  {
    name: 'bsv-dev skill',
    gives: 'The decisions: who holds the keys, payments and channels, BSV Broadcaster and finality, testnet to Mainnet, the guardrail review',
    use: 'Building the way these docs do',
  },
  {
    name: '@bsv/mcp',
    gives: 'Tools for BSV Broadcaster, a guardrail check, BRCs and versions, with dated facts',
    use: 'Actions and live values, on testnet by default',
  },
];

export default function AgentToolkit() {
  return (
    <figure className="not-prose my-8">
      <ul
        className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-3"
        aria-label="What each piece of the BSV AI toolkit gives the agent"
      >
        {pieces.map((piece) => (
          <li key={piece.name} className="m-0 flex flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="bg-[#1B1EA9] px-4 py-3 text-white dark:bg-[#8C9BFF] dark:text-gray-900">
              <span className="text-sm font-semibold">{piece.name}</span>
            </div>
            <dl className="m-0 flex-1 px-4 py-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              <dt className="font-semibold text-gray-900 dark:text-gray-100">Gives the agent</dt>
              <dd className="m-0 mb-3">{piece.gives}</dd>
              <dt className="font-semibold text-gray-900 dark:text-gray-100">Use it for</dt>
              <dd className="m-0">{piece.use}</dd>
            </dl>
          </li>
        ))}
      </ul>
    </figure>
  );
}
