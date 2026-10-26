// Blue frame for the table of the BSV glossary. The terms stay in the Markdown table of the page,
// so search and the Markdown copy for agents keep them; this only styles it, in the colors of the other boxes.

export default function GlossaryTable({ children }) {
  return (
    <div
      className={[
        'my-8 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700',
        '[&_table]:my-0 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm',
        '[&_thead_th]:bg-[#1B1EA9] [&_thead_th]:px-4 [&_thead_th]:py-3 [&_thead_th]:text-left [&_thead_th]:font-semibold [&_thead_th]:text-white',
        'dark:[&_thead_th]:bg-[#8C9BFF] dark:[&_thead_th]:text-gray-900',
        '[&_td]:border-t [&_td]:border-gray-200 [&_td]:px-4 [&_td]:py-3 [&_td]:align-top dark:[&_td]:border-gray-700',
        '[&_tbody_tr:nth-child(even)]:bg-[#1B1EA9]/5 dark:[&_tbody_tr:nth-child(even)]:bg-[#8C9BFF]/10',
        '[&_td:first-child]:whitespace-nowrap [&_td:first-child]:font-semibold [&_td:first-child]:text-[#1B1EA9] dark:[&_td:first-child]:text-[#8C9BFF]',
      ].join(' ')}
    >
      {children}
    </div>
  );
}
