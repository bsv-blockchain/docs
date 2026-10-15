// Sequence diagram for "Pay from a web app": how one payment moves between the app, the wallet and the network.
// Content only: edit actors and messages here. Tested on BSV Desktop 3.1.1, 2026-10-15.
const actors = [
  { name: 'Your app', note: <><code>pay.mjs</code> in this tutorial</> },
  { name: 'BSV Desktop', note: 'Holds the private key' },
  { name: 'Testnet', note: 'Records the payment' },
];

// from and to are indexes in actors. The same index draws a note on that actor.
const messages = [
  { from: 0, to: 1, text: <>Asks for a payment of 1,000 satoshis with <code>createAction</code></> },
  { from: 1, to: 1, text: <>Shows a <strong>Spending Request</strong>. You click <strong>Authorize</strong>, and the wallet signs</> },
  { from: 1, to: 2, text: 'Sends the signed transaction' },
  { from: 1, to: 0, text: 'Returns the transaction ID' },
];

const n = actors.length;

function Message({ from, to, text, step }) {
  const left = Math.min(from, to);
  const span = Math.max(from, to) - left + 1;
  const edge = `${50 / span}%`;
  const toRight = to > from;
  const number = <span className="mr-1 font-semibold text-[#1B1EA9] dark:text-[#8C9BFF]">{step}</span>;
  return (
    <div className="relative py-2" style={{ gridColumn: `${left + 1} / span ${span}` }}>
      {from === to ? (
        <div className="relative z-10 mx-auto w-[92%] rounded-lg border border-dashed border-[#1B1EA9] bg-white px-2 py-1 text-center text-xs dark:border-[#8C9BFF] dark:bg-gray-900">
          {number}{text}
        </div>
      ) : (
        <div style={{ marginLeft: edge, marginRight: edge }}>
          <p className="relative z-10 m-0 mb-1 text-center text-xs">
            <span className="bg-white px-1 dark:bg-gray-900">{number}{text}</span>
          </p>
          <div className="relative h-0 border-t-2 border-[#1B1EA9] dark:border-[#8C9BFF]">
            <span
              className={`absolute -top-[7px] h-0 w-0 border-y-[6px] border-y-transparent ${toRight ? '-right-1 border-l-[8px] border-l-[#1B1EA9] dark:border-l-[#8C9BFF]' : '-left-1 border-r-[8px] border-r-[#1B1EA9] dark:border-r-[#8C9BFF]'}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentSequence() {
  return (
    <figure className="not-prose my-6 overflow-x-auto rounded-xl border border-gray-200 p-4 dark:border-gray-700" aria-label="Sequence of one payment: your app asks BSV Desktop, you approve, the wallet signs and sends it to testnet, and returns the transaction ID">
      <div className="relative grid min-w-[480px] gap-x-3" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {actors.map((a, i) => (
          <div key={a.name} className="pointer-events-none absolute bottom-0 top-14 border-l border-dashed border-gray-300 dark:border-gray-600" style={{ left: `${((i + 0.5) / n) * 100}%` }} />
        ))}
        {actors.map((a) => (
          <div key={a.name} className="relative z-10 mb-2 rounded-lg bg-[#1B1EA9] px-2 py-2 text-center text-white dark:bg-[#8C9BFF] dark:text-gray-900">
            <p className="m-0 text-sm font-semibold">{a.name}</p>
            <p className="m-0 text-xs opacity-90">{a.note}</p>
          </div>
        ))}
        {messages.map((m, i) => (
          <Message key={i} {...m} step={i + 1} />
        ))}
      </div>
      <figcaption className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">The private key never leaves BSV Desktop. Your app only receives the transaction ID.</figcaption>
    </figure>
  );
}
