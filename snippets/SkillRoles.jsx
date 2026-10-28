// What the bsv-dev skill decides and what stays yours, in "Install the BSV agent skill": two boxes of the same size, side by side.
// Content only: edit the texts here. Keep each item short. Tested with Claude Code 2.1.303 and bsv-dev 0.1.0 (bsv-blockchain/bsv-ai-toolkit 2291251), 2026-10-22.

const roles = [
  {
    who: 'The skill',
    where: 'Decides by default',
    items: [
      'A BRC-100 wallet for users, with the identity key as their id',
      'Who holds the keys, per money path',
      <>BSV Broadcaster for every broadcast and status read, final at <code>SEEN_ON_NETWORK</code> or later with no competing transaction</>,
      <><code>WalletClient('auto', originator)</code> from <code>@bsv/sdk</code> 3.x</>,
      'Testnet, with fees at 100 sat/kB on both networks, never below the BSV Broadcaster /policy',
      'One transaction per payment, a payment channel only for many updates between two parties',
      'Rúnar for contracts, 1Color for tokens',
    ],
  },
  {
    who: 'You',
    where: 'Keep these steps',
    items: [
      'Run the install commands, since the skill never edits your agent configuration',
      "Get testnet coins and approve the wallet's prompts in BSV Desktop",
      'Say yes before any broadcast, after the agent shows the outputs, total, fee and network',
      <>Set <code>BSV_NETWORK=mainnet</code> yourself</>,
    ],
  },
];

export default function SkillRoles() {
  return (
    <figure className="not-prose my-8">
      <ul
        className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2"
        aria-label="What the skill decides and what you decide"
      >
        {roles.map((role) => (
          <li key={role.who} className="m-0 flex flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="bg-[#1B1EA9] px-4 py-3 text-white dark:bg-[#8C9BFF] dark:text-gray-900">
              <span className="text-sm font-semibold">{role.who}</span>
            </div>
            <div className="flex-1 px-4 py-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              <p className="m-0 mb-2 font-semibold text-gray-900 dark:text-gray-100">{role.where}</p>
              <ul className="m-0 list-disc space-y-1 pl-5">
                {role.items.map((item, i) => (
                  <li key={i} className="m-0">{item}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </figure>
  );
}
