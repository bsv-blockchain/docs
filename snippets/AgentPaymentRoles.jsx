// Who does what in "Send a payment with an AI agent": two boxes of the same size, side by side.
// Content only: edit the texts here. Keep each item short. Tested with Claude Code 2.1.286 and BSV Desktop 3.1.1, 2026-10-20.

const roles = [
  {
    who: 'Agent',
    where: 'Works in the code',
    tasks: [
      'Reads these docs',
      <>Installs <code>@bsv/sdk</code></>,
      <>Writes a script that connects to BSV Desktop through <code>WalletClient</code></>,
      'Checks that the wallet is on testnet',
      'Runs the payment',
    ],
  },
  {
    who: 'You',
    where: 'Work in the wallet',
    tasks: [
      'Get testnet coins if the wallet is empty',
      'Give the agent your testnet address',
      <>Approve the payment in BSV Desktop with <strong>Authorize</strong></>,
    ],
  },
];

export default function AgentPaymentRoles() {
  return (
    <figure className="not-prose my-8">
      <ul
        className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2"
        aria-label="What the agent does and what you do for the payment"
      >
        {roles.map((role) => (
          <li key={role.who} className="m-0 flex flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="bg-[#1B1EA9] px-4 py-3 text-white dark:bg-[#8C9BFF] dark:text-gray-900">
              <span className="text-sm font-semibold">{role.who}</span>
            </div>
            <div className="flex-1 px-4 py-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              <p className="m-0 mb-2 font-semibold text-gray-900 dark:text-gray-100">{role.where}</p>
              <ul className="m-0 list-disc space-y-1 pl-5">
                {role.tasks.map((task, i) => (
                  <li key={i} className="m-0">{task}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </figure>
  );
}
