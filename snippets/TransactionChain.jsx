// How outputs become inputs in "How transactions and fees work": three boxes of the same size, left to right, linked by arrows.
// Content only: edit the texts here. Keep each text short and about the same length. Checked against @bsv/sdk 4.0.1, 2026-10-28.
import { Fragment } from 'react';

const mono = 'font-mono text-[0.85em]';

const steps = [
  {
    who: 'Earlier transaction',
    what: <>Creates output <span className={mono}>0</span> with an amount and a locking script. Nobody has spent it, so it is a UTXO</>,
  },
  {
    who: 'Your transaction',
    what: <>An input names that output by transaction ID and index <span className={mono}>0</span>, and its unlocking script meets the condition. New outputs follow</>,
  },
  {
    who: 'Later transaction',
    what: 'Spends one of your new outputs the same way. Each output can be spent once, and in full',
  },
];

function Arrow() {
  return (
    <li aria-hidden="true" className="m-0 flex items-center justify-center px-1 text-[#1B1EA9] dark:text-[#8C9BFF]">
      <span className="text-xl leading-none sm:hidden">↓</span>
      <span className="hidden text-xl leading-none sm:inline">→</span>
    </li>
  );
}

export default function TransactionChain() {
  return (
    <figure className="not-prose my-8">
      <ol
        className="m-0 flex list-none flex-col gap-3 p-0 sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-stretch"
        aria-label="How an output of one transaction becomes an input of the next"
      >
        {steps.map((step, i) => (
          <Fragment key={i}>
            <li className="m-0 flex flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 bg-[#1B1EA9] px-4 py-3 text-white dark:bg-[#8C9BFF] dark:text-gray-900">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#1B1EA9] dark:bg-gray-900 dark:text-[#8C9BFF]">{i + 1}</span>
                <span className="text-sm font-semibold">{step.who}</span>
              </div>
              <p className="m-0 flex-1 px-4 py-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{step.what}</p>
            </li>
            {i < steps.length - 1 && <Arrow />}
          </Fragment>
        ))}
      </ol>
    </figure>
  );
}
