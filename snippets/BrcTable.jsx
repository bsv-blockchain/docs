// Table of BRCs whose rows open to show the abstract of the BRC and a link to its specification.
// Same blue frame and colors as BlueTable. The abstract is the text of each row, so search and the Markdown copy keep it.
// All rows share the details name "brc-rows", so opening one closes the one that was open (the browser does it, no script). A browser without support lets several rows stay open.
// Use: <BrcTable><BrcRow number="BRC-102" title="..." href="https://bsv.brc.dev/apps/0102">abstract</BrcRow></BrcTable>

export function BrcTable({ children }) {
  return (
    <div className="my-8 overflow-hidden rounded-xl border border-gray-200 text-sm dark:border-gray-700">
      <div className="flex gap-4 bg-[#1B1EA9] px-4 py-3 font-semibold text-white dark:bg-[#8C9BFF] dark:text-gray-900">
        <span className="w-24 shrink-0">BRC</span>
        <span>Title</span>
      </div>
      {children}
    </div>
  );
}

export function BrcRow({ number, title, href, children }) {
  return (
    <details name="brc-rows" className="group border-t border-gray-200 even:bg-[#1B1EA9]/5 dark:border-gray-700 dark:even:bg-[#8C9BFF]/10">
      <summary className="flex cursor-pointer list-none items-start gap-4 px-4 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="w-24 shrink-0 whitespace-nowrap font-semibold text-[#1B1EA9] dark:text-[#8C9BFF]">{number}</span>
        <span className="flex-1">{title}</span>
        <svg
          className="mt-1 h-4 w-4 shrink-0 text-gray-500 transition-transform group-open:rotate-180 dark:text-gray-400"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="px-4 pb-4 sm:pl-[7rem]">
        {children ? <div className="mb-3 leading-relaxed">{children}</div> : null}
        <a
          href={href}
          className="font-semibold text-[#1B1EA9] underline dark:text-[#8C9BFF]"
        >
          Read the specification
        </a>
      </div>
    </details>
  );
}
