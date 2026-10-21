// The two MCP servers in "Connect your AI tool with MCP": two boxes of the same size, side by side.
// Content only: edit the texts here. Keep each text short and about the same length. Tested with Claude Code 2.1.286, 2026-10-19.

const servers = [
  {
    name: 'BSV docs server',
    gives: 'Search and full pages of these docs, as Markdown',
    use: 'Answers and code that follow these guides, starting on testnet',
  },
  {
    name: 'Simple MCP',
    gives: <>API notes and code generators for <code>@bsv/simple</code></>,
    use: <>Looking up the <code>@bsv/simple</code> API. Check its code before you run it</>,
  },
];

export default function McpServers() {
  return (
    <figure className="not-prose my-8">
      <ul
        className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2"
        aria-label="What each MCP server gives the agent"
      >
        {servers.map((server) => (
          <li key={server.name} className="m-0 flex flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="bg-[#1B1EA9] px-4 py-3 text-white dark:bg-[#8C9BFF] dark:text-gray-900">
              <span className="text-sm font-semibold">{server.name}</span>
            </div>
            <dl className="m-0 flex-1 px-4 py-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              <dt className="font-semibold text-gray-900 dark:text-gray-100">Gives the agent</dt>
              <dd className="m-0 mb-3">{server.gives}</dd>
              <dt className="font-semibold text-gray-900 dark:text-gray-100">Use it for</dt>
              <dd className="m-0">{server.use}</dd>
            </dl>
          </li>
        ))}
      </ul>
    </figure>
  );
}
