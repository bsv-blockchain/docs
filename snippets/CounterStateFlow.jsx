// The counter's outputs in "Deploy a smart contract": three transactions, left to right, each spending the contract output of the one before.
// Content only: edit the texts here. Checked against Rúnar 1.0.0-rc.1 on testnet, 2026-10-30.
import { Fragment } from 'react';

const mono = 'font-mono text-[0.85em]';

const steps = [
  {
    who: 'deploy.ts',
    what: 'Creates the contract output from your wallet’s coins',
    count: '0',
  },
  {
    who: 'increment.ts',
    what: 'Spends that output and creates a new one with the same code',
    count: '1',
  },
  {
    who: 'increment.ts again',
    what: 'Spends the output the last run created, not the first one',
    count: '2',
  },
];

function Arrow() {
  return (
    <li aria-hidden="true" className="m-0 flex flex-col items-center justify-center px-1 text-[#1B1EA9] dark:text-[#8C9BFF]">
      <span className="text-xs font-semibold">spent by</span>
      <span className="text-xl leading-none sm:hidden">↓</span>
      <span className="hidden text-xl leading-none sm:inline">→</span>
    </li>
  );
}

export default function CounterStateFlow() {
  return (
    <figure className="not-prose my-8">
      <ol
        className="m-0 flex list-none flex-col gap-3 p-0 sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-stretch"
        aria-label="Each call spends the counter's output and creates the next one"
      >
        {steps.map((step, i) => (
          <Fragment key={i}>
            <li className="m-0 flex flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 bg-[#1B1EA9] px-4 py-3 text-white dark:bg-[#8C9BFF] dark:text-gray-900">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#1B1EA9] dark:bg-gray-900 dark:text-[#8C9BFF]">{i + 1}</span>
                <span className={`${mono} font-semibold`}>{step.who}</span>
              </div>
              <p className="m-0 flex-1 px-4 pt-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{step.what}</p>
              <p className="m-0 px-4 pb-4 pt-2 text-sm text-gray-900 dark:text-gray-100">
                Output: <span className={mono}>count = {step.count}</span>, <span className={mono}>1,000</span> satoshis
              </p>
            </li>
            {i < steps.length - 1 && <Arrow />}
          </Fragment>
        ))}
      </ol>
    </figure>
  );
}
