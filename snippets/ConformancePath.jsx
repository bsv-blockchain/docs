// "Test BRC-100 conformance": the three parts of a conformance run, left to right, in the style of PaymentSequence.
// Content only: edit the texts here. Source: ts-stack conformance/ (commit 389d5d8, 2026-10-27).
import { Fragment } from 'react';

const parts = [
  { who: 'The vectors', what: <>One JSON file per BRC-100 method under <span className="font-mono text-[0.85em]">wallet/brc100/</span>, from a pinned ts-stack commit</> },
  { who: 'Your runner', what: 'Builds the wallet from each vector’s root key, calls the method and compares the result with the expected one' },
  { who: 'Your claim', what: <>Every <span className="font-mono text-[0.85em]">required</span> vector passes, and every <span className="font-mono text-[0.85em]">intended</span> one is listed with its reason</> },
];

function Arrow() {
  return (
    <li aria-hidden="true" className="m-0 flex items-center justify-center px-1 text-[#1B1EA9] dark:text-[#8C9BFF]">
      <span className="text-xl leading-none sm:hidden">↓</span>
      <span className="hidden text-xl leading-none sm:inline">→</span>
    </li>
  );
}

export default function ConformancePath() {
  return (
    <figure className="not-prose my-8">
      <ol
        className="m-0 flex list-none flex-col gap-3 p-0 sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-stretch"
        aria-label="The three parts of a conformance run: the vectors, your runner and your claim"
      >
        {parts.map((part, i) => (
          <Fragment key={part.who}>
            <li className="m-0 flex flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 bg-[#1B1EA9] px-4 py-3 text-white dark:bg-[#8C9BFF] dark:text-gray-900">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#1B1EA9] dark:bg-gray-900 dark:text-[#8C9BFF]">{i + 1}</span>
                <span className="text-sm font-semibold">{part.who}</span>
              </div>
              <p className="m-0 flex-1 px-4 py-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{part.what}</p>
            </li>
            {i < parts.length - 1 && <Arrow />}
          </Fragment>
        ))}
      </ol>
    </figure>
  );
}
