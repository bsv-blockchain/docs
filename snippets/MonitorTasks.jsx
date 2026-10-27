// "How the toolbox tracks UTXOs": the Monitor tasks, one small card each.
// Content only: edit the texts here. Source: ts-stack architecture/wallet-utxo-lifecycle.md, wallet-toolbox 2.14 monitor docs.

const tasks = [
  { name: 'TaskSendWaiting', what: 'Broadcasts unsent requests and retries stale sending ones' },
  { name: 'TaskCheckForProofs', what: 'Fetches Merkle proofs for unmined requests and marks the request and the transaction completed' },
  { name: 'TaskReviewStatus', what: 'Reconciles each transaction with its proof request' },
  { name: 'TaskReviewDoubleSpends', what: 'Checks whether a reported double spend is real, and sends a false positive to unfail' },
  { name: 'TaskFailAbandoned', what: 'Moves old transactions that never reached a final status to failed' },
  { name: 'TaskReviewUtxos', what: 'Repairs change outputs whose state drifted' },
];

export default function MonitorTasks() {
  return (
    <figure className="not-prose my-8">
      <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2" aria-label="The Monitor tasks">
        {tasks.map((task) => (
          <li key={task.name} className="m-0 rounded-xl border-l-4 border-[#1B1EA9] bg-[#1B1EA9]/5 px-4 py-3 dark:border-[#8C9BFF] dark:bg-[#8C9BFF]/10">
            <span className="font-mono text-sm font-semibold text-[#1B1EA9] dark:text-[#8C9BFF]">{task.name}</span>
            <p className="m-0 mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{task.what}</p>
          </li>
        ))}
      </ul>
    </figure>
  );
}
