// "How overlays work": the two parts inside one overlay host, with the outputs passing from one to the other.
// Content only: edit the texts here. Name prefixes follow BRC-87.
import { Fragment } from 'react';

const parts = [
  {
    name: 'Topic manager',
    prefix: 'tm_',
    what: 'Applies the rules of your protocol and admits only the outputs that pass, for example a token with a valid format.',
  },
  {
    name: 'Lookup service',
    prefix: 'ls_',
    what: 'Indexes the admitted outputs and answers queries about them, for example all the tokens of one asset.',
  },
];

export default function OverlayParts() {
  return (
    <figure className="not-prose my-8 rounded-2xl border border-dashed border-[#1B1EA9]/50 p-4 dark:border-[#8C9BFF]/50">
      <p className="m-0 mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Overlay host</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-stretch" role="list" aria-label="The two parts of an overlay service">
        {parts.map((part, i) => (
          <Fragment key={part.prefix}>
            {i === 1 && (
              <div aria-hidden="true" className="flex flex-col items-center justify-center gap-1 px-1 text-[#1B1EA9] dark:text-[#8C9BFF]">
                <span className="text-xs">admitted outputs</span>
                <span className="text-xl leading-none sm:hidden">↓</span>
                <span className="hidden text-xl leading-none sm:inline">→</span>
              </div>
            )}
            <div role="listitem" className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{part.name}</span>
                <code className="rounded-full border border-[#1B1EA9] px-2 py-0.5 text-xs text-[#1B1EA9] dark:border-[#8C9BFF] dark:text-[#8C9BFF]">{part.prefix}</code>
              </div>
              <p className="m-0 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{part.what}</p>
            </div>
          </Fragment>
        ))}
      </div>
    </figure>
  );
}
