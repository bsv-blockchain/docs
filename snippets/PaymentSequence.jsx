// Flow of one payment in "Pay from a web app": four boxes, left to right, linked by arrows.
// Content only: edit the steps here. Keep each text short and about the same length. Tested on BSV Desktop 3.1.1, 2026-10-15.
const steps = [
  { who: 'Your app', what: <>Asks for 1,000 satoshis with <code>createAction</code></> },
  { who: 'BSV Desktop', what: <>Signs after you click <strong>Authorize</strong>. The private key stays here</> },
  { who: 'Testnet', what: 'Receives the signed transaction and records it' },
  { who: 'Your app', what: 'Gets the transaction ID back from the wallet' },
];

function Arrow() {
  return (
    <div aria-hidden="true" className="flex shrink-0 items-center justify-center px-1 text-[#1B1EA9] dark:text-[#8C9BFF]">
      <span className="text-xl leading-none sm:hidden">↓</span>
      <span className="hidden text-xl leading-none sm:inline">→</span>
    </div>
  );
}

export default function PaymentSequence() {
  return (
    <figure className="not-prose my-8">
      <ol className="m-0 flex list-none flex-col gap-3 p-0 sm:flex-row sm:items-stretch" aria-label="How one payment moves between your app, BSV Desktop and testnet">
        {steps.map((step, i) => (
          <li key={i} className="m-0 flex flex-col gap-3 sm:flex-1 sm:flex-row">
            <div className="flex-1 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 bg-[#1B1EA9] px-4 py-3 text-white dark:bg-[#8C9BFF] dark:text-gray-900">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#1B1EA9] dark:bg-gray-900 dark:text-[#8C9BFF]">{i + 1}</span>
                <span className="text-sm font-semibold">{step.who}</span>
              </div>
              <p className="m-0 px-4 py-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{step.what}</p>
            </div>
            {i < steps.length - 1 && <Arrow />}
          </li>
        ))}
      </ol>
    </figure>
  );
}
