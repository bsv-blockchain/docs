// The method groups of SV Node 1.2.3, in "SV Node RPC methods": a grid of links, each jumping to the table of that group.
// Content only: edit the texts here. Counts come from `bitcoin-cli help` of 1.2.3 (151 methods in all: `help` shows 148 on an unencrypted wallet, 150 on an encrypted one) and must match the tables of the page.

const groups = [
  { name: 'Blockchain', count: 31, text: 'Blocks, headers, the mempool and proofs', href: '#blockchain' },
  { name: 'Network', count: 17, text: 'Peers, bans and traffic', href: '#network' },
  { name: 'Mining', count: 8, text: 'Block templates, candidates and solutions', href: '#mining' },
  { name: 'Raw transactions', count: 8, text: 'Create, decode, fund, sign and send', href: '#raw-transactions' },
  { name: 'Control', count: 8, text: 'Status, settings, uptime and stop', href: '#control' },
  { name: 'Utilities', count: 6, text: 'Multisig, message signing and script checks', href: '#utilities' },
  { name: 'Wallet', count: 46, text: 'Addresses, balances, payments and keys', href: '#wallet' },
  { name: 'Generating blocks', count: 2, text: 'Mine blocks on demand', href: '#generating-blocks' },
  { name: 'Miner ID', count: 14, text: 'Miner IDs and miner info transactions', href: '#miner-id' },
  { name: 'Frozen transactions', count: 8, text: 'Confiscation and blacklist lists', href: '#frozen-transactions' },
  { name: 'Safe mode', count: 3, text: 'Safe mode status and overrides', href: '#safe-mode' },
];

export default function SvNodeRpcGroups() {
  return (
    <nav className="not-prose my-8" aria-label="SV Node RPC method groups">
      <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <li key={group.name} className="m-0">
            <a
              href={group.href}
              className="flex h-full flex-col rounded-xl border border-gray-200 px-4 py-3 no-underline transition hover:border-[#1B1EA9] hover:bg-[#1B1EA9]/5 dark:border-gray-700 dark:hover:border-[#8C9BFF] dark:hover:bg-[#8C9BFF]/10"
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-semibold text-[#1B1EA9] dark:text-[#8C9BFF]">{group.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{group.count} methods</span>
              </span>
              <span className="mt-1 text-sm leading-snug text-gray-700 dark:text-gray-300">{group.text}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
