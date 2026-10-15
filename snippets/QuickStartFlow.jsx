// Flow of the Quick Start (Pay from a web app), shown under "How it works".
// Content only: edit the steps here. Tested on BSV Desktop 3.1.1, 2026-10-15.
const steps = [
  { who: 'Faucet', what: 'Sends free testnet coins to your wallet address' },
  { who: 'Your script', what: <><code>connect.mjs</code> and <code>pay.mjs</code> ask the wallet with <code>WalletClient</code></> },
  { who: 'BSV Desktop', what: <>Shows the request and signs after you click <strong>Authorize</strong></> },
  { who: 'Testnet', what: 'Records the payment and returns its transaction ID' },
  { who: 'Explorer', what: 'Shows the payment, its fee and its status' },
];

export default function QuickStartFlow() {
  return (
    <ol className="not-prose my-6 grid list-none gap-3 p-0 sm:grid-cols-5" aria-label="How the Quick Start flow works">
      {steps.map((step, i) => (
        <li key={step.who} className="relative m-0 rounded-xl border border-gray-200 p-3 dark:border-gray-700">
          <span className="mb-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1B1EA9] text-xs font-semibold text-white dark:bg-[#8C9BFF] dark:text-gray-900">
            {i + 1}
          </span>
          <p className="m-0 text-sm font-semibold">{step.who}</p>
          <p className="m-0 mt-1 text-sm text-gray-600 dark:text-gray-300">{step.what}</p>
        </li>
      ))}
    </ol>
  );
}
